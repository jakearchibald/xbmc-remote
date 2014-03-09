var EventEmitter = require('events').EventEmitter;
var SpinnerView = require('./spinner');
var toArray = require('../utils').toArray;

function Home() {
  var thisHome = this;
  EventEmitter.call(this);
  this.el = document.querySelector('.home-root');
  this._spinnerView = new SpinnerView(this.el.querySelector('.spinner-root'));
  this._menuList = this.el.querySelector('.menu-list');

  this.el.querySelector('.add-server').addEventListener('click', function(event) {
    thisHome.emit('serverAddClicked');
    event.preventDefault();
  });
}

var HomeProto = Home.prototype = Object.create(EventEmitter.prototype);

HomeProto.hideSpinner = function() {
  this._spinnerView.el.parentNode.removeChild(this._spinnerView.el);
};

HomeProto.updateServers = function(servers) {
  var li;
  var a;
  var button;

  this.clearServers();

  for (var nickname in servers) {
    // link
    li = document.createElement('li');
    li.className = 'item';
    a = document.createElement('a');
    a.href = "/tv/#" + nickname;
    a.textContent = nickname;
    li.appendChild(a);

    // edit button
    li.appendChild(document.createTextNode(' '));
    button = document.createElement('button');
    button.textContent = "Edit";
    button.dataset.id = nickname;
    button.addEventListener('click', this._onServerEditClicked.bind(this));
    li.appendChild(button);

    // delete button
    li.appendChild(document.createTextNode(' '));
    button = document.createElement('button');
    button.textContent = "Delete";
    button.dataset.id = nickname;
    button.addEventListener('click', this._onServerDeleteClicked.bind(this));
    li.appendChild(button);

    this._menuList.appendChild(li);
  }
};

HomeProto.clearServers = function() {
  var thisHome = this;

  toArray(this._menuList.querySelectorAll(':scope > li')).slice(1).forEach(function(li) {
    thisHome._menuList.removeChild(li);
  });
};

HomeProto._onServerEditClicked = function(event) {
  var id = event.currentTarget.dataset.id;
  this.emit('serverEditClicked', id);
};

HomeProto._onServerDeleteClicked = function(event) {
  var id = event.currentTarget.dataset.id;
  this.emit('serverDeleteClicked', id);
};

module.exports = Home;