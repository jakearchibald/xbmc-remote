var Page = require('./page');

function DefaultPage() {
  Page.call(this);
  this.el = document.querySelector('.page');
}

var DefaultPageProto = DefaultPage.prototype = Object.create(Page.prototype);

module.exports = DefaultPage;