var EventEmitter = require('events').EventEmitter;
var delegateListener = require('../utils').delegateListener;

function NowPlaying() {
  EventEmitter.call(this);
  this.el = document.querySelector('.now-playing-root');
  this.poster = this.el.querySelector('.poster');
  // YOU ARE HERE: add event for stop button
}

var NowPlayingProto = NowPlaying.prototype = Object.create(EventEmitter.prototype);

NowPlayingProto.show = function(opts) {
  this.poster.innerHTML = '';

  if (opts.thumbnail) {
    var img = new Image();
    this.poster.appendChild(img);
    img.src = opts.thumbnail;
  }
  
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