var EventEmitter = require('events').EventEmitter;

function ServerEdit() {
  var thisServerEdit = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.server-edit-root.template').cloneNode(true);
  this.el.classList.remove('template');

  this.el.querySelector('.server-form').addEventListener('submit', function(event) {
    var data = {
      oldNickname: this.oldNickname.value,
      nickname: this.nickname.value,
      host: this.host.value,
      port: this.port.value
    };

    thisServerEdit.emit('formSubmit', data);
    event.preventDefault();
  });
}

var ServerEditProto = ServerEdit.prototype = Object.create(EventEmitter.prototype);

module.exports = ServerEdit;