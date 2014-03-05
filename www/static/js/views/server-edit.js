function ServerEdit() {
  this.el = document.querySelector('.server-edit-root.template').cloneNode(true);
  this.el.classList.remove('template');
}

var ServerEditProto = ServerEdit.prototype;

module.exports = ServerEdit;