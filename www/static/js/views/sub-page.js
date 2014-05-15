var Page = require('./page');
var strToEl = require('../utils').strToEl;
var defaults = require('../utils').defaults;

var subPageTemplate = require('./templates/sub-page.hbs');

function SubPage(opts) {
  opts = defaults(opts, {
  });

  var thisSubPage = this;
  Page.call(this);
  this.el = strToEl(subPageTemplate(opts));
  this.body = this.el.querySelector('.sub-page-body');

  this.el.querySelector('.back-btn').addEventListener('click', function(event) {
    // TODO: make the back button work
    event.preventDefault();
  });
}

var SubPageProto = SubPage.prototype = Object.create(Page.prototype);

module.exports = SubPage;