var Promise = require('rsvp').Promise;

var Page = require('./page');
var ServerStorage = require('../server-storage');
var XBMCSocket = require('../xbmc-socket');
var DefaultPageView = require('../views/default-page');
var RemoteView = require('../views/remote');
var MainMenuView = require('../views/main-menu');
var TextInputView = require('../views/text-input');
var AlertView = require('../views/alert');
var NowPlayingView = require('../views/now-playing');

function TVPage() {
  var thisTVPage = this;
  var serverId = window.location.hash.slice(1).split('/')[0];
  var xbmc;

  Page.call(this);

  this._server = new ServerStorage().get()[serverId];

  if (!serverId) { window.location.href = "/xbmc-remote/"; }

  this._pageView = new DefaultPageView();
  this._remoteView = new RemoteView();
  this._mainMenuView = new MainMenuView();
  this._nowPlayingView = new NowPlayingView();

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
    thisTVPage._xbmc = new XBMCSocket(server.host, server.port, server.httpPort, server.username, server.password);
    return thisTVPage._xbmc.ready();
  }).then(function() {
    thisTVPage._xbmcConnectionStartup();
  }).catch(function(err) {
    thisTVPage._connectionFailure(err.message);
  });
};

TVPageProto._xbmcConnectionStartup = function() {
  var thisTVPage = this;

  this._xbmc.on('connectionFailure', function() {
    thisTVPage._connectionFailure("Connection to XBMC lost");
  });

  this._xbmc.on('inputRequested', this._inputRequested.bind(this));
  
  this._xbmc.on('play', this._onPlay.bind(this));
  this._xbmc.on('stop', this._onStop.bind(this));
  this._xbmc.playerGetItem().then(this._onPlay.bind(this));
};

TVPageProto._connectionFailure = function(errorMessage) {
  var thisTVPage = this;

  var alertView = new AlertView(errorMessage || "Cannot connect to XBMC", [{
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
    heading: "Error",
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
  var textInputView = new TextInputView({
    type: 'url'
  });
  var modal = this._pageView.createModal(textInputView, {
    heading: "URL to play:"
  });

  textInputView.on('formSubmit', function(url) {
    thisHomePage._playUrl(url).then(function() {
      modal.close();
    });
  });
};

TVPageProto._inputRequested = function(data) {
  var thisHomePage = this;
  var textInputView = new TextInputView({
    value: data.value
  });
  var modal = this._pageView.createModal(textInputView, {
    heading: data.title
  });
  var input = document.querySelector('#text-input');
  input.setSelectionRange(0, input.value.length);

  function onInputFinished() {
    modal.close();
  }

  this._xbmc.on('inputFinished', onInputFinished);

  modal.on('close', function() {
    thisHomePage._xbmc.removeListener('inputFinished', onInputFinished);
  });

  textInputView.on('formSubmit', function(value) {
    thisHomePage._xbmc.inputSendText(value);
  });
};

TVPageProto._onPlay = function(data) {
  var thisHomePage = this;
  if (data.item.type == 'movie') {
    this._xbmc.videoLibraryGetMovieDetails(data.item.id, [
      'title',
      'thumbnail'
    ]).then(function(data) {
      var opts = {
        title: data.moviedetails.title
      };

      if (data.moviedetails.thumbnail) {
        opts.thumbnail = thisHomePage._xbmc.toImageUrl(data.moviedetails.thumbnail);
      }

      thisHomePage._nowPlayingView.show(opts);
    }).catch(function(err) {
      console.log(err);
    });
  }
};

TVPageProto._onStop = function(data) {
  this._nowPlayingView.hide();
};

module.exports = TVPage;