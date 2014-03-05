var Page = require('./page');
var ServerStorage = require('../server-storage');
var HomeView = require('../views/home');
var ServerEditView = require('../views/server-edit');

function HomePage() {
  var thisHomePage = this;
  Page.call(this);
  this._homeView = new HomeView();
  this._serverStorage = new ServerStorage();

  var servers = this._serverStorage.get();

  if (Object.keys(servers).length === 0) {
    this._editServer();
  }

  this._homeView.on('addServerClicked', function() {
    thisHomePage._editServer();
  });
}

var HomePageProto = HomePage.prototype = Object.create(Page);

HomePageProto._editServer = function(server) {
  var serverEditView = new ServerEditView();
  var modal = this._pageView.createModal(serverEditView);

  if (server) {
    // we're editing an existing server - populate form
  }

  serverEditView.on('formSubmit', function(data) {
    console.log(data);
  });
};

module.exports = HomePage;