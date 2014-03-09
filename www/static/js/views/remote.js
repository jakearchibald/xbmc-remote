var EventEmitter = require('events').EventEmitter;
var SpinnerView = require('./spinner');
var toArray = require('../utils').toArray;
var delegateListener = require('../utils').delegateListener;

function Remote() {
  var thisRemote = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.remote-root');

  this.el.addEventListener('click', delegateListener('button', function(event) {
    thisRemote.emit('buttonClick', this.dataset.method);
  }));
}

var RemoteProto = Remote.prototype = Object.create(EventEmitter.prototype);

module.exports = Remote;