var Page = require('./page');
var ServerStorage = require('../server-storage');
var HomeView = require('../views/home');
var ServerEditView = require('../views/server-edit');
var XBMCSocket = require('../xbmc-socket');

function HomePage() {
  var thisHomePage = this;
  Page.call(this);
  this._homeView = new HomeView();
  this._serverStorage = new ServerStorage();

  var servers = this._serverStorage.get();

  this._homeView.updateServers(servers);

  this._homeView.hideSpinner();

  this._homeView.on('serverAddClick', function() {
    thisHomePage._editServer();
  });

  this._homeView.on('serverEditClick', function(id) {
    thisHomePage._editServer(id);
  });

  this._homeView.on('serverDeleteClick', function(id) {
    thisHomePage._serverStorage.delete(id);
    thisHomePage._homeView.updateServers(thisHomePage._serverStorage.get());
  });
}

var HomePageProto = HomePage.prototype = Object.create(Page);

HomePageProto._editServer = function(id) {
  var thisHomePage = this;
  var serverEditView = new ServerEditView();
  var modal = this._pageView.createModal(serverEditView);
  var server = this._serverStorage.get()[id];

  if (id) {
    serverEditView.populateForm({
      oldNickname: id,
      nickname: id,
      host: server.host,
      port: server.port
    });
  }

  serverEditView.on('formSubmit', function(data) {
    var xbmc;
    
    Promise.resolve().then(function() {
      if (thisHomePage._serverStorage.get()[data.nickname] && data.nickname != data.oldNickname) {
        throw Error("Server with that name already exists");
      }
      serverEditView.setStatus('Connecting…');
      xbmc = new XBMCSocket(data.host, data.port);
      window.xbmc = xbmc;
      return xbmc.ready();
    }).then(function() {
      if (data.oldNickname) {
        thisHomePage._serverStorage.delete(data.oldNickname);
      }

      thisHomePage._serverStorage.set(data.nickname, data.host, data.port);
      serverEditView.setStatus('Saved!');
      thisHomePage._homeView.updateServers(thisHomePage._serverStorage.get());
      modal.close();
    }).catch(function(err) {
      serverEditView.setStatus(err.message);
    });
  });
};

module.exports = HomePage;