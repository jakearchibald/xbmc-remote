var EventEmitter = require('events').EventEmitter;
var defaults = require('../utils').defaults;
var delegateListener = require('../utils').delegateListener;

function Alert(label) {
  var thisAlert = this;

  EventEmitter.call(this);
  this.el = document.querySelector('.alert-root.template').cloneNode(true);
  this.el.classList.remove('template');

  this.el.querySelector('.text').textContent = label;
  this._buttonsEl = this.el.querySelector('.buttons');
  this._buttonsEl.addEventListener('click', delegateListener('button', this._onButtonClick.bind(this)));
}

var AlertProto = Alert.prototype = Object.create(EventEmitter.prototype);

AlertProto._onButtonClick = function(event) {
  var button = event.delegateTarget;
  this.emit(button.name + 'Click');
  event.preventDefault();
};

AlertProto.addButton = function(id, text, opts) {
  opts = defaults(opts, {
    className: null
  });

  var button = document.createElement('button');
  button.textContent = text;
  button.name = id;

  if (opts.className) {
    button.textContent.className += ' ' + opts.className;
  }

  this._buttonsEl.appendChild(document.createTextNode(' '));
  this._buttonsEl.appendChild(button);
};

module.exports = Alert;