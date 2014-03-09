var EventEmitter = require('events').EventEmitter;
var SpinnerView = require('./spinner');
var toArray = require('../utils').toArray;
var delegateListener = require('../utils').delegateListener;

function MainMenu() {
  var thisMainMenu = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.main-menu-root');

  this.el.addEventListener('click', delegateListener('button', this._onButtonClick.bind(this)));
}

var MainMenuProto = MainMenu.prototype = Object.create(EventEmitter.prototype);

MainMenuProto._onButtonClick = function(event) {
  var action = event.delegateTarget.dataset.action;

  if (action) {
    this.emit(action + 'Click');
  }

  event.preventDefault();
};

module.exports = MainMenu;