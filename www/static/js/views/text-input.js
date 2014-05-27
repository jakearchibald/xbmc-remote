var EventEmitter = require('events').EventEmitter;
var defaults = require('../utils').defaults;
var strToEl = require('../utils').strToEl;

var textInputTemplate = require('./templates/text-input.hbs');

function TextInput(opts) {
  var thisTextInput = this;
  
  opts = defaults(opts, {
    value: '',
    type: 'text',
    placeholder: '',
    required: true,
    autofocus: true,
    label: ''
  });

  EventEmitter.call(this);
  this.el = strToEl(textInputTemplate(opts));

  this._formEl = this.el.querySelector('form');
  this._formEl.addEventListener('submit', this._onFormSubmit.bind(this));
}

var TextInputProto = TextInput.prototype = Object.create(EventEmitter.prototype);

TextInputProto._onFormSubmit = function(event) {
  this.emit('formSubmit', this._formEl.text.value);
  event.preventDefault();
};

module.exports = TextInput;