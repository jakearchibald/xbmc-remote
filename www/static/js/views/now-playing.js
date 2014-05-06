var EventEmitter = require('events').EventEmitter;
var delegateListener = require('../utils').delegateListener;

function NowPlaying() {
  EventEmitter.call(this);
  this.el = document.querySelector('.now-playing-root');
  this.poster = this.el.querySelector('.poster');
  // YOU ARE HERE: add param for stop button
}

var NowPlayingProto = NowPlaying.prototype = Object.create(EventEmitter.prototype);

NowPlayingProto.show = function() {
  // TODO: add params for stuff to display
  this.el.classList.remove('out');
  this.el.classList.remove('active');
  this.el.offsetWidth;
  this.el.classList.add('active');
};

NowPlayingProto.hide = function() {
  this.el.classList.add('out');
};

module.exports = NowPlaying;