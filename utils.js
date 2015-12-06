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

require('extend-shallow', 'extend');
require('question-store', 'questions');
require('common-questions');
require('get-value', 'get');
require('to-choices');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
