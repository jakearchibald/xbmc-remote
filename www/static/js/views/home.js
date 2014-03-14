var EventEmitter = require('events').EventEmitter;
var SpinnerView = require('./spinner');
var toArray = require('../utils').toArray;
var delegateListener = require('../utils').delegateListener;
var getDelegateEl = require('../utils').getDelegateEl;

var menuListTemplate = require('./templates/menu-list.hbs');

function Home() {
  var thisHome = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.home-root');
  this._spinnerView = new SpinnerView(this.el.querySelector('.spinner-root'));
  this._menuList = this.el.querySelector('.menu-list');

  this._menuList.addEventListener('click', delegateListener('button, [role=button]', function(event) {
    var id = getDelegateEl(this, 'li').dataset.id;
    var action = this.dataset.action;
    thisHome.emit(action + 'Click', id);
    event.preventDefault();
  }));
}

var HomeProto = Home.prototype = Object.create(EventEmitter.prototype);

HomeProto.hideSpinner = function() {
  this._spinnerView.el.parentNode.removeChild(this._spinnerView.el);
};

HomeProto.updateServers = function(servers) {
  this._menuList.innerHTML = menuListTemplate({servers: servers});
};

module.exports = Home;