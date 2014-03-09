var EventEmitter = require('events').EventEmitter;
var defaults = require('../utils').defaults;

function TextInput(label, opts) {
  var thisTextInput = this;
  
  opts = defaults(opts, {
    value: '',
    type: 'text',
    placeholder: '',
    required: true,
    autofocus: true
  });

  EventEmitter.call(this);
  this.el = document.querySelector('.text-input-root.template').cloneNode(true);
  this.el.classList.remove('template');

  this._formEl = this.el.querySelector('form');

  this.el.querySelector('.label-text').textContent = label;
  this.input = this._formEl.text;
  this._formEl.text.type = opts.type;
  this._formEl.text.value = opts.value;
  this._formEl.text.placeholder = opts.placeholder;
  this._formEl.text.required = opts.required;
  this._formEl.text.autofocus = opts.autofocus;

  this._formEl.addEventListener('submit', this._onFormSubmit.bind(this));
}

var TextInputProto = TextInput.prototype = Object.create(EventEmitter.prototype);

TextInputProto._onFormSubmit = function(event) {
  this.emit('formSubmit', this._formEl.text.value);
  event.preventDefault();
};

module.exports = TextInput;