var Modal = require('./modal');
var EventEmitter = require('events').EventEmitter;

function Page() {
  this._subPage = null;
}

var PageProto = Page.prototype = Object.create(EventEmitter.prototype);

PageProto.createModal = function(view, opts) {
  var thisPage = this;
  var modal = new Modal(opts);
  modal.body.appendChild(view.el);
  // TODO: manage focus while modal active
  this.el.appendChild(modal.el);
  
  // force sync layout so we pick up the transition
  modal.el.offsetWidth;
  modal.open();

  modal.once('closed', function() {
    thisPage.el.removeChild(modal.el);
  });

  return modal;
};

PageProto.createSubPage = function(view, opts) {
  var thisPage = this;
  var SubPage = require('./sub-page');

  if (this._subPage) {
    // TODO: hide before showing new one
    return;
  }

  var subPage = new SubPage(opts);
  this._subPage = subPage;

  subPage.on('backClick', function() {
    thisPage.closeSubPage();
  });

  subPage.body.appendChild(view.el);
  document.body.appendChild(subPage.el);
  this.el.classList.remove('no-sub-page');
  this.el.classList.add('has-sub-page');
  subPage.el.classList.add('active');
  return subPage;
};

PageProto.closeSubPage = function() {
  var subPage = this._subPage;
  this._subPage = null;
  subPage.removeAllListeners();
  subPage.el.classList.remove('active');
  subPage.el.classList.add('inactive');
  this.el.classList.remove('has-sub-page');
  this.el.classList.add('no-sub-page');
};

module.exports = Page;