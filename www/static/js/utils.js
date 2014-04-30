var Promise = require('rsvp').Promise;

function toArray(arr) {
  return Array.prototype.slice.call(arr);
}

function transitionToClass(el, className) {
  // TODO
}


var selectorMatches =
  Element.prototype.matches ||
  Element.prototype.webkitMatchesSelector ||
  Element.prototype.mozMatchesSelector ||
  Element.prototype.msMatchesSelector;

function getDelegateEl(el, selector, stopPoint) {
  if (window.SVGElementInstance && el instanceof SVGElementInstance) {
    el = el.correspondingUseElement;
  }
  
  do {
    if (selectorMatches.call(el, selector)) {
      return el;
    }
    if (el == stopPoint) {
      return null;
    }
    el = el.parentNode;
  } while (el instanceof Element);
  
  return null;
}

function delegateListener(selector, func) {
  return function(event) {
    var target = getDelegateEl(event.target, selector, event.currentTarget);
    if (target) {
      event.delegateTarget = target;
      func.call(target, event);
    }
  };
}

function leftButtonListener(func) {
  return function(event) {
    if ('button' in event && event.button !== 0) {
      return;
    }
    func.call(this, event);
  };
}

function defaults(opts, defaultOpts) {
  var r = Object.create(defaultOpts);

  if (!opts) { return r; }
  
  for (var key in opts) if (opts.hasOwnProperty(key)) {
    r[key] = opts[key];
  }

  return r;
}

var tmpEl = document.createElement('div');
function strToEl(str) {
  var r;
  tmpEl.innerHTML = str;
  r = tmpEl.children[0];
  tmpEl.innerHTML = '';
  return r;
}

exports.toArray = toArray;
exports.getDelegateEl = getDelegateEl;
exports.delegateListener = delegateListener;
exports.leftButtonListener = leftButtonListener;
exports.defaults = defaults;
exports.strToEl = strToEl;