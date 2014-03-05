var EventEmitter = require('events').EventEmitter;

function Home() {
  var thisHome = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.home-root');

  this.el.querySelector('.add-server').addEventListener('click', function(event) {
    thisHome.emit('addServerClicked');
    event.preventDefault();
  });
}

var HomeProto = Home.prototype = Object.create(EventEmitter.prototype);

module.exports = Home;