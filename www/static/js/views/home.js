var EventEmitter = require('events').EventEmitter;
var SpinnerView = require('./spinner');
var MenuListView = require('./menu-list');
var delegateListener = require('../utils').delegateListener;
var getDelegateEl = require('../utils').getDelegateEl;

var menuListTemplate = require('./templates/servers-menu-list.hbs');

function Home() {
  var thisHome = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.home-root');
  this._spinnerView = new SpinnerView(this.el.querySelector('.spinner-root'));
  this._menuListView = new MenuListView(this.el.querySelector('.menu-list'));
  
  this._menuListView.el.addEventListener(
    'click',
    delegateListener('button, [role=button]', this._onMenuButtonClick.bind(this))
  );
}

var HomeProto = Home.prototype = Object.create(EventEmitter.prototype);

HomeProto.hideSpinner = function() {
  this._spinnerView.el.parentNode.removeChild(this._spinnerView.el);
};

HomeProto.updateServers = function(servers) {
  this._menuListView.el.innerHTML = menuListTemplate({servers: servers});
};

HomeProto._onMenuButtonClick = function(event) {
  var button = event.delegateTarget;
  var id = getDelegateEl(button, 'li').dataset.id;
  var action = button.dataset.action;
  this.emit(action + 'Click', id);
  button.blur();
  event.preventDefault();
};

module.exports = Home;