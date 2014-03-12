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

function getDelegateEl(el, selector) {
  do {
    if (selectorMatches.call(el, selector)) {
      return el;
    }
    el = el.parentNode;
  } while (el instanceof Element);
  
  return null;
}

function delegateListener(selector, func) {
  return function(event) {
    var target = getDelegateEl(event.target, selector);
    if (target) {
      event.delegateTarget = target;
      func.call(target, event);
    }
  };
}

function defaults(opts, defaultOpts) {
  var r = Object.create(defaultOpts);

  if (!opts) { return r; }
  
  for (var key in opts) if (opts.hasOwnProperty[key]) {
    r[key] = opts[key];
  }

  return r;
}

exports.toArray = toArray;
exports.getDelegateEl = getDelegateEl;
exports.delegateListener = delegateListener;
exports.defaults = defaults;