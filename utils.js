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

require('define-property', 'define');
require('mixin-deep', 'merge');
require('question-store', 'Questions');
require = fn;

utils.sync = function(obj, prop, val) {
  utils.define(obj, prop, {
    configurable: true,
    enumerable: true,
    set: function(v) {
      utils.define(obj, prop, v);
    },
    get: function() {
      if (typeof val === 'function') {
        return val.call(obj);
      }
      return val;
    }
  });
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
