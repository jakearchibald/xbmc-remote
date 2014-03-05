var PageView = require('../views/page.js');

function Page() {
  this._pageView = new PageView();
}

var PageProto = Page.prototype;

module.exports = Page;
