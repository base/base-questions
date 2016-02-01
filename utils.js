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

require('common-questions');
require('for-own');
require('get-value', 'get');
require('is-valid-glob');
require('micromatch', 'mm');
require('mixin-deep', 'merge');
require('question-store', 'questions');
require('set-value', 'set');
require('to-choices');
require = fn;

/**
 * Force exit if "ctrl+c" is pressed
 */

utils.forceExit = function() {
  var stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  stdin.setMaxListeners(0);
  stdin.on('data', function(key) {
    if (key === '\u0003') {
      process.stdout.write('\u001b[1A');
      process.exit();
    }
  });
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
