var EventEmitter = require('events').EventEmitter;
var SpinnerView = require('./spinner');
var toArray = require('../utils').toArray;
var delegateListener = require('../utils').delegateListener;

function Remote() {
  var hoverEnabled = true;
  var thisRemote = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.remote-root');

  var clickListener = delegateListener('[role=button]', function(event) {
    event.preventDefault();
    var animEndEventName;

    if (hoverEnabled) {
      hoverEnabled = false;
      thisRemote.el.classList.remove('allow-hover');
    }

    if ('animation' in this.style) {
      animEndEventName = 'animationend';
    }
    else {
      animEndEventName = 'webkitAnimationEnd';
    }

    thisRemote.emit('buttonClick', this.dataset.method);
    this.classList.remove('flash');
    this.offsetWidth; // force layout to cancel any current flash anim
    this.classList.add('flash');
    this.addEventListener(animEndEventName, function anim(event) {
      if (event.target == this) {
        this.classList.remove('flash');
        this.removeEventListener(event.type, anim);
      }
    });
  });

  this.el.addEventListener('click', clickListener);
  this.el.addEventListener('touchstart', clickListener);
  this.el.addEventListener('mouseenter', function() {
    if (!hoverEnabled) {
      hoverEnabled = false;
      thisRemote.el.classList.add('allow-hover');
    }
  });
}

var RemoteProto = Remote.prototype = Object.create(EventEmitter.prototype);

module.exports = Remote;