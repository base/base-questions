'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('base-store', 'store');
require('define-property', 'define');
require('is-registered');
require('is-valid-instance');
require('isobject', 'isObject');
require('mixin-deep', 'merge');
require('question-store', 'Questions');
require = fn;

utils.isValid = function(app) {
  if (!utils.isValidInstance(app)) {
    return false;
  }
  if (utils.isRegistered(app, 'base-questions')) {
    return false;
  }
  return true;
};

utils.sync = function(obj, prop, val) {
  var cached;
  utils.define(obj, prop, {
    configurable: true,
    enumerable: true,
    set: function(v) {
      cached = v;
    },
    get: function() {
      if (typeof cached !== 'undefined') {
        return cached;
      }
      if (typeof val === 'function') {
        val = val.call(obj);
      }
      cached = val;
      return val;
    }
  });
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
