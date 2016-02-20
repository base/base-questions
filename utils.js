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

require('is-valid-glob');
require('micromatch', 'mm');
require('mixin-deep', 'merge');
require('question-store', 'questions');
require('to-choices');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
