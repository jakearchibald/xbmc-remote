var EventEmitter = require('events').EventEmitter;
var toArray = require('../utils').toArray;

function MenuList(el) {
  var thisMenuList = this;

  EventEmitter.call(this);
  this.el = el;

  this.el.addEventListener('keydown', this._onKeyDown.bind(this));
}

var MenuListProto = MenuList.prototype = Object.create(EventEmitter.prototype);

MenuListProto._onKeyDown = function() {
  var currentItem = event.target;
  var items;

  switch (event.keyCode) {
    case 38: // up
      items = toArray(this.el.querySelectorAll('.main-action'));
      (items[(items.indexOf(currentItem) - 1)] || items[items.length - 1]).focus();
      event.preventDefault();
      break;
    case 40: // down
      items = toArray(this.el.querySelectorAll('.main-action'));
      items[(items.indexOf(currentItem) + 1) % items.length].focus();
      event.preventDefault();
      break;
    case 13:
      currentItem.click();
      event.preventDefault();
      break;
  }
};

module.exports = MenuList;