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
  var xbmc;

  this._server = new ServerStorage().get()[serverId];

  Page.call(this);

  if (!serverId) { window.location.href = "/xbmc-remote/"; }

  this._remoteView = new RemoteView();
  this._mainMenuView = new MainMenuView();

  this._remoteView.on('buttonClick', this._onRemoteButtonClick.bind(this));
  this._mainMenuView.on('playUrlClick', this._onPlayUrlClick.bind(this));

  this._setupXBMCConnection();
}

var TVPageProto = TVPage.prototype = Object.create(Page);

TVPageProto._setupXBMCConnection = function() {
  var server = this._server;
  var thisTVPage = this;
  this._xbmc = null;

  Promise.resolve().then(function() {
    if (!server) { throw Error("Server '" + serverId + "' not a stored server"); }
    thisTVPage._xbmc = new XBMCSocket(server.host, server.port);
    return thisTVPage._xbmc.ready();
  }).then(function() {
    thisTVPage._xbmc.on('connectionfailure', function() {
      thisTVPage._connectionFailure("Connection to XBMC lost");
    });
    thisTVPage._xbmc.on('inputrequested', thisTVPage._inputRequested.bind(thisTVPage));
  }).catch(function(err) {
    thisTVPage._connectionFailure(err.message);
  });
};

TVPageProto._connectionFailure = function(errorMessage) {
  var thisTVPage = this;

  var alertView = new AlertView("Error", errorMessage || "Cannot connect to XBMC", [{
    text: "Retry",
    onclick: function() {
      modal.close();
      thisTVPage._setupXBMCConnection(thisTVPage._server);
    }}, {
    text: "Cancel",
    onclick: function() {
      window.location.href = '/xbmc-remote/';
    }
  }]);

  var modal = thisTVPage._pageView.createModal(alertView, {
    closable: false
  });
};

TVPageProto._onRemoteButtonClick = function(method) {
  this._xbmc[method]();
};

TVPageProto._playUrl = function(url) {
  return this._xbmc.playerOpenUrl(url);
};

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

TVPageProto._inputRequested = function(data) {
  var thisHomePage = this;
  var textInputView = new TextInputView(data.title, {
    value: data.value
  });
  var modal = this._pageView.createModal(textInputView);

  textInputView.on('formSubmit', function(value) {
    thisHomePage._xbmc.inputSendText(value).then(function() {
      modal.close();
    });
  });
};

module.exports = TVPage;