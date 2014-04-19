var toArray = require('../utils').toArray;
var getDelegateEl = require('../utils').getDelegateEl;

function MenuList(el) {
  var thisMenuList = this;

  this.el = el;

  this.el.addEventListener('keydown', this._onKeyDown.bind(this));
}

var MenuListProto = MenuList.prototype;

MenuListProto._onKeyDown = function(event) {
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
      // look for a fake button to click
      if (getDelegateEl(currentItem, "[role=button]", event.currentTarget)) {
        currentItem.click();
        event.preventDefault();
      }
      break;
  }
};

module.exports = MenuList;