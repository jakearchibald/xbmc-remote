var EventEmitter = require('events').EventEmitter;

function Spinner(rootEl) {
  var thisSpinner = this;
  EventEmitter.call(this);
  
  if (rootEl instanceof String) {
    rootEl = document.querySelector(rootEl);
  }
  
  if (rootEl) {
    this.el = rootEl;
  }
  else {
    this.el = document.querySelector('.spinner-root.template').cloneNode(true);
    this.el.classList.remove('template');
  }
}

var SpinnerProto = Spinner.prototype = Object.create(EventEmitter.prototype);

module.exports = Spinner;