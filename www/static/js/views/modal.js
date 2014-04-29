var EventEmitter = require('events').EventEmitter;
var strToEl = require('../utils').strToEl;
var defaults = require('../utils').defaults;

var modalTemplate = require('./templates/modal.hbs');

function Modal(opts) {
  opts = defaults(opts, {
    closable: true
  });

  var thisModal = this;
  EventEmitter.call(this);
  this.el = strToEl(modalTemplate(opts));
  this.body = this.el.querySelector('.modal-body');
  this.isOpen = false;

  if (opts.closable) {
    this.el.addEventListener('click', function(event) {
      if (event.target == this) {
        thisModal.close();
        event.preventDefault();
      }
    });

    this.el.querySelector('.close-btn').addEventListener('click', function(event) {
      thisModal.close();
      event.preventDefault();
    });
  }
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
  this.el.classList.add('close');
  this.isOpen = false;
  thisModal.emit('close');
};

module.exports = Modal;