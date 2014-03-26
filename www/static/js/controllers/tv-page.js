var Promise = require('rsvp').Promise;

var Page = require('./page');
var ServerStorage = require('../server-storage');
var XBMCSocket = require('../xbmc-socket');
var RemoteView = require('../views/remote');
var MainMenuView = require('../views/main-menu');
var TextInputView = require('../views/text-input');
var AlertView = require('../views/alert');

function TVPage() {
  var thisTVPage = this;
  var serverId = window.location.hash.slice(1).split('/')[0];
  var server = new ServerStorage().get()[serverId];
  var xbmc;

  Page.call(this);

  if (!serverId) { window.location.href = "/xbmc-remote/"; }

  this._remoteView = new RemoteView();
  this._mainMenuView = new MainMenuView();

  this._remoteView.on('buttonClick', this._onRemoteButtonClick.bind(this));
  this._mainMenuView.on('playUrlClick', this._onPlayUrlClick.bind(this));

  this._setupXBMCConnection(server);
}

var TVPageProto = TVPage.prototype = Object.create(Page);

// decorator
// TODO Move this logic into XBMCSocket to handle reconnects
function readyQueue(func) {
  return function() {
    var thisTVPage = this;
    var args = arguments;

    function go() {
      return func.apply(thisTVPage, args);
    }

    if (this._xbmc) {
      return go();
    }
    else {
      return this._xbmcReady.then(go);
    }
  };
}

TVPageProto._setupXBMCConnection = function(server) {
  var thisTVPage = this;
  this._xbmc = null;

  this._xbmcReady = Promise.resolve().then(function() {
    if (!server) { throw Error("Server '" + serverId + "' not a stored server"); }
    xbmc = new XBMCSocket(server.host, server.port);
    return xbmc.ready();
  }).then(function() {
    thisTVPage._xbmc = xbmc;
  }).catch(function(err) {
    var alertView = new AlertView("Error", "Cannot connect to XBMC", [
      {
        text: "Retry",
        onclick: function() {
          modal.close();
          thisTVPage._setupXBMCConnection(server);
        }
      },
      {
        text: "Cancel",
        onclick: function() {
          window.location.href = '/xbmc-remote/';
        }
      }
    ]);
    var modal = thisTVPage._pageView.createModal(alertView, {
      closable: false
    });
  });
};

TVPageProto._onRemoteButtonClick = readyQueue(function(method) {
  this._xbmc[method]();
});

TVPageProto._playUrl = readyQueue(function(url) {
  return this._xbmc.playerOpenUrl(url);
});

TVPageProto._onPlayUrlClick = function(method) {
  var thisHomePage = this;
  var textInputView = new TextInputView("URL to play:", {
    type: 'url'
  });
  var modal = this._pageView.createModal(textInputView);

  textInputView.on('formSubmit', function(url) {
    thisHomePage._playUrl(url).then(function() {
      modal.close();
    });
  });
};

module.exports = TVPage;