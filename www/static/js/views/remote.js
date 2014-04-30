var EventEmitter = require('events').EventEmitter;
var SpinnerView = require('./spinner');
var toArray = require('../utils').toArray;
var delegateListener = require('../utils').delegateListener;
var leftButtonListener = require('../utils').leftButtonListener;

function Remote() {
  var hoverEnabled = true;
  var thisRemote = this;
  var intervalID;
  var currentButton;
  EventEmitter.call(this);
  this.el = document.querySelector('.remote-root');

  var buttonDown = delegateListener('[role=button]', leftButtonListener(function(event) {
    event.preventDefault();
    currentButton = this;

    if (hoverEnabled) {
      hoverEnabled = false;
      thisRemote.el.classList.remove('allow-hover');
    }

    function action() {
      thisRemote.emit('buttonClick', currentButton.dataset.method);
    }

    action();

    clearInterval(intervalID);
    
    if (currentButton.dataset.repeat) {
      intervalID = setTimeout(function() {
        intervalID = setInterval(action, 200);
      }, 400);
    }

    currentButton.classList.add('active');
    currentButton.classList.remove('flash');

    window.addEventListener('mouseup', buttonUp);
    window.addEventListener('touchend', buttonUp);
  }));

  var buttonUp = leftButtonListener(function(event) {
    event.preventDefault();
    var animEndEventName;

    clearInterval(intervalID);

    if ('animation' in currentButton.style) {
      animEndEventName = 'animationend';
    }
    else {
      animEndEventName = 'webkitAnimationEnd';
    }

    currentButton.classList.remove('active');
    currentButton.classList.add('flash');

    currentButton.addEventListener(animEndEventName, function anim(event) {
      if (event.target == currentButton) {
        currentButton.classList.remove('flash');
        currentButton.removeEventListener(event.type, anim);
      }
    });

    window.removeEventListener('mouseup', buttonUp);
    window.removeEventListener('touchend', buttonUp);
  });

  this.el.addEventListener('mousedown', buttonDown);
  this.el.addEventListener('touchstart', buttonDown);

  this.el.addEventListener('mouseenter', function() {
    if (!hoverEnabled) {
      hoverEnabled = false;
      thisRemote.el.classList.add('allow-hover');
    }
  });
}

var RemoteProto = Remote.prototype = Object.create(EventEmitter.prototype);

module.exports = Remote;