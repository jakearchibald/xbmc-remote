var EventEmitter = require('events').EventEmitter;
var SpinnerView = require('./spinner');
var toArray = require('../utils').toArray;
var delegateListener = require('../utils').delegateListener;
var leftButtonListener = require('../utils').leftButtonListener;

function Remote() {
  var hoverEnabled = true;
  var thisRemote = this;
  var intervalID;
  EventEmitter.call(this);
  this.el = document.querySelector('.remote-root');

  var buttonDown = delegateListener('[role=button]', leftButtonListener(function(event) {
    event.preventDefault();
    debugger;
    var el = this;

    if (hoverEnabled) {
      hoverEnabled = false;
      thisRemote.el.classList.remove('allow-hover');
    }

    function action() {
      thisRemote.emit('buttonClick', el.dataset.method);
    }

    action();

    clearInterval(intervalID);
    
    if (el.dataset.repeat) {
      intervalID = setInterval(action, 300);
    }

    el.classList.add('active');
    el.classList.remove('flash');
  }));

  var buttonUp = delegateListener('[role=button]', leftButtonListener(function(event) {
    event.preventDefault();
    var animEndEventName;
    var el = this;

    clearInterval(intervalID);

    if ('animation' in el.style) {
      animEndEventName = 'animationend';
    }
    else {
      animEndEventName = 'webkitAnimationEnd';
    }

    el.classList.remove('active');
    el.classList.add('flash');

    el.addEventListener(animEndEventName, function anim(event) {
      if (event.target == el) {
        el.classList.remove('flash');
        el.removeEventListener(event.type, anim);
      }
    });
  }));

  this.el.addEventListener('mousedown', buttonDown);
  this.el.addEventListener('touchstart', buttonDown);
  this.el.addEventListener('mouseup', buttonUp);
  this.el.addEventListener('touchend', buttonUp);

  this.el.addEventListener('mouseenter', function() {
    if (!hoverEnabled) {
      hoverEnabled = false;
      thisRemote.el.classList.add('allow-hover');
    }
  });
}

var RemoteProto = Remote.prototype = Object.create(EventEmitter.prototype);

module.exports = Remote;