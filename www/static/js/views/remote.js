var EventEmitter = require('events').EventEmitter;
var SpinnerView = require('./spinner');
var toArray = require('../utils').toArray;
var delegateListener = require('../utils').delegateListener;

function Remote() {
  var thisRemote = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.remote-root');

  this.el.addEventListener('click', delegateListener('[role=button]', function(event) {
    var animEndEventName;

    if ('animation' in this.style) {
      animEndEventName = 'animationend';
    }
    else {
      animEndEventName = 'webkitAnimationEnd';
    }

    thisRemote.emit('buttonClick', this.dataset.method);
    this.classList.add('flash');
    this.addEventListener(animEndEventName, function anim(event) {
      if (event.target == this) {
        this.classList.remove('flash');
        this.removeEventListener(event.type, anim);
      }
    });
  }));
}

var RemoteProto = Remote.prototype = Object.create(EventEmitter.prototype);

module.exports = Remote;