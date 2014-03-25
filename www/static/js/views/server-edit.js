var EventEmitter = require('events').EventEmitter;
var strToEl = require('../utils').strToEl;

var editServerTemplate = require('./templates/edit-server.hbs');
var MenuListView = require('./menu-list');

var serverEditFields = [
  'oldNickname',
  'nickname',
  'host',
  'port'
];

function ServerEdit(initialVals) {
  var thisServerEdit = this;
  EventEmitter.call(this);
  this.el = strToEl(editServerTemplate({
    isEdit: !!initialVals
  }));

  this._formEl = this.el.querySelector('.server-form');
  this._statusEl = this.el.querySelector('.status');
  this._menuListView = new MenuListView(this.el.querySelector('.menu-list'));

  if (initialVals) {
    this._populateForm(initialVals);
  }

  this._formEl.addEventListener('submit', this._onFormSubmit.bind(this));
}

var ServerEditProto = ServerEdit.prototype = Object.create(EventEmitter.prototype);

ServerEditProto.setStatus = function(txt) {
  this._statusEl.textContent = txt;
};

ServerEditProto._populateForm = function(formVals) {
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