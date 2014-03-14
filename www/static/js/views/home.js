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
    this.blur();
    event.preventDefault();
  }));

  this._menuList.addEventListener('keydown', function(event) {
    var currentItem = event.target;
    var items;

    switch (event.keyCode) {
      case 38: // up
        items = toArray(thisHome._menuList.querySelectorAll('.main-action'));
        (items[(items.indexOf(currentItem) - 1)] || items[items.length - 1]).focus();
        event.preventDefault();
        break;
      case 40: // down
        items = toArray(thisHome._menuList.querySelectorAll('.main-action'));
        items[(items.indexOf(currentItem) + 1) % items.length].focus();
        event.preventDefault();
        break;
      case 13:
        currentItem.click();
        break;
    }
  });
}

var HomeProto = Home.prototype = Object.create(EventEmitter.prototype);

HomeProto.hideSpinner = function() {
  this._spinnerView.el.parentNode.removeChild(this._spinnerView.el);
};

HomeProto.updateServers = function(servers) {
  this._menuList.innerHTML = menuListTemplate({servers: servers});
};

module.exports = Home;