var Modal = require('./modal');

function Page() {
  this.el = document.querySelector('.page');
}

var PageProto = Page.prototype;

PageProto.createModal = function(view) {
  var thisPage = this;
  var modal = new Modal();
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

module.exports = Page;