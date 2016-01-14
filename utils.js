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

require('question-store', 'questions');
require('mixin-deep', 'merge');
require('common-questions');
require('micromatch', 'mm');
require('set-value', 'set');
require('get-value', 'get');
require('to-choices');
require('for-own');
require = fn;

/**
 * Force exit if "ctrl+c" is pressed
 */

utils.forceExit = function() {
  var stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
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
