var Promise = require('rsvp').Promise;

function XBMCSocket(url) {
  var xbmcSocket = this;

  xbmcSocket._pending = {};
  xbmcSocket._socket = new WebSocket('ws://127.0.0.1:9090/jsonrpc');
  xbmcSocket._ready = new Promise(function(resolve, reject) {
    xbmcSocket._socket.onopen = resolve;
    xbmcSocket._socket.onerror = reject;
  });

  xbmcSocket._socket.onmessage = this._socketListener.bind(this);
}

var XBMCSocketProto = XBMCSocket.prototype;

// web socket
XBMCSocketProto._socket = null;
// api requests awaiting response {callId: [resolve, reject]}
XBMCSocketProto._pending = null;
// ready promise
XBMCSocketProto._ready = null;

// make api call and return promise
XBMCSocketProto._apiCall = function(method, params) {
  var xbmcSocket = this;
  var callId = 0;

  // generate a unique callId
  while (callId in xbmcSocket._pending) callId++;

  return new Promise(function(resolve, reject) {
    var call = {
      jsonrpc: "2.0",
      method: method,
      id: callId
    };

    if (params) call.params = params;
    xbmcSocket._pending[callId] = [resolve, reject];
    xbmcSocket._socket.send(JSON.stringify(call));
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
    console.log(data);
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
    resolver[1](Error(data.error));
  }
};

// return ready promse
XBMCSocketProto.ready = function() {
  return this._ready;
};

XBMCSocketProto.playerOpenUrl = function(url) {
  return this._apiCall("Player.Open", {
    item: {file: url}
  });
};

// add simple methods
[
  'Input.Up',
  'Input.Down',
  'Input.Left',
  'Input.Right'
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

// remote control right
XBMCSocketProto.inputRight = function() {
  return this._apiCall("Input.Right");
};

module.exports = XBMCSocket;