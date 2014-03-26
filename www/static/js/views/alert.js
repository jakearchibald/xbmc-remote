var EventEmitter = require('events').EventEmitter;
var defaults = require('../utils').defaults;
var strToEl = require('../utils').strToEl;
var toArray = require('../utils').toArray;

var alertTemplate = require('./templates/alert.hbs');

function Alert(title, text, buttons) {
  var thisAlert = this;

  EventEmitter.call(this);
  this.el = strToEl(alertTemplate({
    title: title,
    text: text,
    buttons: buttons
  }));

  toArray(this.el.querySelectorAll('.buttons button')).forEach(function(button, i) {
    if (buttons[i].onclick) {
      button.addEventListener('click', buttons[i].onclick);
    }
  });
}

var AlertProto = Alert.prototype = Object.create(EventEmitter.prototype);

module.exports = Alert;