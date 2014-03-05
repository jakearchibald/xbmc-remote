var EventEmitter = require('events').EventEmitter;

function Modal() {
  var thisModal = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.modal-root.template').cloneNode(true);
  this.el.classList.remove('template');
  this.body = this.el.querySelector('.modal-body');
  this.isOpen = false;

  this.el.querySelector('.close').addEventListener('click', function(event) {
    thisModal.close();
    event.preventDefault();
  });
}

var ModalProto = Modal.prototype = Object.create(EventEmitter.prototype);

ModalProto.open = function() {
  if (this.isOpen) return;
  this.el.classList.add('open');
  this.isOpen = true;
};

ModalProto.close = function() {
  if (!this.isOpen) return;
  var thisModal = this;

  function transitionEnd(event) {
    if (event.target == this) {
      this.removeEventListener('transitionend', transitionEnd);
      // catch cases where it reopened before closing
      if (!this.classList.contains('open')) {
        thisModal.emit('closed');
      }
    }
  }

  this.el.addEventListener('transitionend', transitionEnd);
  this.el.classList.remove('open');
  this.isOpen = false;
};

module.exports = Modal;