var defaults = require('../utils').defaults;
var strToEl = require('../utils').strToEl;
var toArray = require('../utils').toArray;

var alertTemplate = require('./templates/alert.hbs');

function Alert(text, buttons) {
  var thisAlert = this;

  this.el = strToEl(alertTemplate({
    text: text,
    buttons: buttons
  }));

  toArray(this.el.querySelectorAll('.button-row button')).forEach(function(button, i) {
    if (buttons[i].onclick) {
      button.addEventListener('click', buttons[i].onclick);
    }
  });
}

var AlertProto = Alert.prototype;

module.exports = Alert;