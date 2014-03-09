var EventEmitter = require('events').EventEmitter;

var serverEditFields = [
  'oldNickname',
  'nickname',
  'host',
  'port'
];

function ServerEdit() {
  var thisServerEdit = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.server-edit-root.template').cloneNode(true);
  this.el.classList.remove('template');

  this._formEl = this.el.querySelector('.server-form');
  this._statusEl = this.el.querySelector('.status');

  this._formEl.addEventListener('submit', this._onFormSubmit.bind(this));
}

var ServerEditProto = ServerEdit.prototype = Object.create(EventEmitter.prototype);

ServerEditProto.setStatus = function(txt) {
  this._statusEl.textContent = txt;
};

ServerEditProto.populateForm = function(formVals) {
  var thisServerEdit = this;

  serverEditFields.forEach(function(field) {
    thisServerEdit._formEl[field].value = formVals[field];
  });
};

ServerEditProto._onFormSubmit = function(event) {
  var data = {};

  serverEditFields.forEach(function(field) {
    data[field] = event.currentTarget[field].value;
  });

  this.emit('formSubmit', data);
  event.preventDefault();
};

module.exports = ServerEdit;