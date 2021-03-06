var Promise = require('rsvp').Promise;
var EventEmitter = require('events').EventEmitter;

var defaults = require('../utils.js').defaults;

function XBMCSocket(host, port, httpPort, httpUsername, httpPassword) {
  var xbmcSocket = this;
  var timeout = 3000;

  EventEmitter.call(this);

  this._host = host;
  this._port = port;
  this._httpBase = 'http://';

  if (httpUsername) {
    this._httpBase += httpUsername;
    if (httpPassword) {
      this._httpBase += ':' + httpPassword;
    }
    this._httpBase += '@';
  }

  this._httpBase += host + ':' + httpPort + '/';

  this._pending = {};
  this._manageConnection();
}

var XBMCSocketProto = XBMCSocket.prototype = Object.create(EventEmitter.prototype);

// web socket
XBMCSocketProto._socket = null;
// api requests awaiting response {callId: [resolve, reject]}
XBMCSocketProto._pending = null;
// ready promise
XBMCSocketProto._ready = null;

XBMCSocketProto._manageConnection = function() {
  var thisXBMCSocket = this;

  this._queue = this._connectSocket({
    retryAttempts: 5
  }).then(function() {
    thisXBMCSocket._socket.onmessage = thisXBMCSocket._socketListener.bind(thisXBMCSocket);
    thisXBMCSocket._socket.addEventListener('close', thisXBMCSocket._manageConnection.bind(thisXBMCSocket));
  }).catch(function(err) {
    thisXBMCSocket.emit('connectionFailure', err);
    throw err;
  });
};

XBMCSocketProto._connectSocket = function(opts) {
  var thisXBMCSocket = this;
  var waitReconnect = 500;

  opts = defaults(opts, {
    retryAttempts: 0
  });

  return new Promise(function(resolve, reject) {
    thisXBMCSocket._socket = new WebSocket('ws://' + thisXBMCSocket._host + ':' + thisXBMCSocket._port + '/jsonrpc');

    function removeListeners() {
      thisXBMCSocket._socket.removeEventListener('close', onClose);
      thisXBMCSocket._socket.removeEventListener('open', onOpen);
    }

    function onOpen() {
      removeListeners();
      // release the queue
      resolve(thisXBMCSocket._socket);
    }

    function onClose() {
      removeListeners();
      
      // retry a decreasing number of times
      if (opts.retryAttempts) {
        setTimeout(function() {
          opts.retryAttempts--;
          resolve(
            thisXBMCSocket._connectSocket(opts)
          );
        }, waitReconnect);
      }
      else {
        reject(Error("Cannot connect to XBMC"));
      }
    }
    
    thisXBMCSocket._socket.addEventListener('close', onClose);
    thisXBMCSocket._socket.addEventListener('open', onOpen);
  });
};

// called onmessage
XBMCSocketProto._socketListener = function(event) {
  var data;

  try { data = JSON.parse(event.data); }
  catch (e) {
    console.error("XBMCSocket: couldn't parse message", e, event.data);
    return;
  }

  if (!('id' in data)) {
    this._handleEvent(data);
    return;
  }

  var resolver = this._pending[data.id];

  // garbage collect
  delete this._pending[data.id];

  if (!resolver) {
    console.error("XBMCSocket: couldn't find pending message", data);
    return;
  }

  // resolve the pending request
  if (data.result) {
    resolver[0](data.result);
  }
  else {
    resolver[1](data.error);
  }
};


var handledEvents = [
  'Input.OnInputRequested',
  'Input.OnInputFinished',
  'Player.OnPlay',
  'Player.OnStop'
];

XBMCSocketProto._handleEvent = function(data) {
  var eventName;

  if (handledEvents.indexOf(data.method) != -1) {
    eventName = data.method.replace(/^[^\.]+\.On([A-Z])/, function(fullMatch, subMatch) {
      return subMatch.toLowerCase();
    });
    this.emit(eventName, data.params.data);
  }

  console.log(data);
};

XBMCSocketProto.ready = function() {
  var thisXBMCSocket = this;

  return this._queue.then(function() {
    return thisXBMCSocket.jsonrpcVersion();
  }).then(function(response) {
    if (response.version.major < 6) {
      throw Error("Only XBMC 12 (Frodo) & onwards supported");
    }
  }).then(function() {
    // Need to test the HTTP port stuff, unfortunately lack of CORS means I need
    // to do a load of hacks. First I make an iframe to do the http auth stuff
    // then check the browser retains those details for downloading an image.
    // I'm relying on the user having webinterface.default, I'm betting this 
    // assumption will come back to bite me.
    // 
    // If XBMC starts serving CORS headers for its HTTP API, I can get rid of this.
    return thisXBMCSocket.addonsGetAddonDetails('webinterface.default', ['thumbnail']);
  }).then(function(data) {
    if (/iP(hone|ad)/.test(navigator.userAgent)) {
      // iOS doesn't need the iframe, in fact it sees it as a phishing attack
      return data;
    }
    
    var imgUrl = thisXBMCSocket.toImageUrl(data.addon.thumbnail);

    return new Promise(function(resolve, reject) {
      var iframe = document.createElement('iframe');
      iframe.onload = function() {
        document.body.removeChild(iframe);
        resolve(data);
      };
      iframe.onerror = function() {
        reject(Error("Couldn't connect to HTTP server, check HTTP port, username & password"));
      };

      iframe.src = imgUrl;
      document.body.appendChild(iframe);
    });
  }).then(function(data) {
    var imgUrl = thisXBMCSocket.toImageUrl(data.addon.thumbnail);

    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.onload = resolve;
      img.onerror = function() {
        reject(Error("Couldn't connect to HTTP server, check HTTP port, username & password"));
      };
      img.src = imgUrl;
    });
  });
};

// make api call and return promise
XBMCSocketProto._apiCall = function(method, params) {
  var thisXBMCSocket = this;
  var callId = 0;

  // generate a unique callId
  while (callId in this._pending) callId++;

  return this._queue.then(function() {
    return new Promise(function(resolve, reject) {
      var call = {
        jsonrpc: "2.0",
        method: method,
        id: callId
      };

      if (params) { call.params = params; }
      thisXBMCSocket._pending[callId] = [resolve, reject];
      thisXBMCSocket._socket.send(JSON.stringify(call));
    });
  });
};

XBMCSocketProto.playerOpenUrl = function(url) {
  return this._apiCall("Player.Open", {
    item: {file: url}
  });
};

XBMCSocketProto.playerGetItem = function(playerId) {
  var thisXBMCSocket = this;
  
  return Promise.resolve(playerId).then(function(playerId) {
    if (typeof playerId != 'number') {
      throw Error('No player ID');
    }
    return playerId;
  }).catch(function() {
    return thisXBMCSocket.playerGetActivePlayers().then(function(data) {
      if (data.length === 0) {
        throw Error('No active player');
      }
      return data[0].playerid;
    });
  }).then(function(playerId) {
    return thisXBMCSocket._apiCall("Player.GetItem", {
      playerid: playerId
    });
  });
};

XBMCSocketProto.inputSendText = function(text) {
  return this._apiCall("Input.SendText", {
    text: text,
    done: true
  });
};

XBMCSocketProto.videoLibraryGetMovieDetails = function(id, properties) {
  return this._apiCall("VideoLibrary.GetMovieDetails", {
    movieid: id,
    properties: properties
  });
};

XBMCSocketProto.addonsGetAddonDetails = function(id, properties) {
  return this._apiCall("Addons.GetAddonDetails", {
    addonid: id,
    properties: properties
  });
};

XBMCSocketProto.toImageUrl = function(id) {
  return this._httpBase + 'image/' + encodeURIComponent(id);
};

// add simple methods
[
  'Input.Up',
  'Input.Down',
  'Input.Left',
  'Input.Right',
  "Input.Back",
  "Input.ContextMenu",
  "Input.Select",
  "Input.Info",
  "Input.ShowOSD",
  "Input.Home",
  'JSONRPC.Version',
  'Player.GetActivePlayers'
].forEach(function(method) {
  // change "Input.Left" to "inputLeft"
  var jsMethodName = method.replace(/(?:^|\.)[A-Z]+/g, function(str, pos) {
    if (pos === 0) {
      return str.toLowerCase();
    }
    else {
      return str.slice(1);
    }
  });

  XBMCSocketProto[jsMethodName] = function() {
    return this._apiCall(method);
  };
});

module.exports = XBMCSocket;