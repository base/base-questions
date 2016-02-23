/*!
 * base-questions <https://github.com/jonschlinkert/base-questions>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var debug = require('debug')
var utils = require('./utils');

module.exports = function(options) {
  return function(app) {
    if (this.isRegistered('base-questions')) return;

    var opts = utils.merge({}, this.options, options);
    opts.store = this.store;
    opts.data = this.cache.data;
    opts.project = this.project;

    /**
     * Decorate the `questions` instance onto `app` and lazily
     * invoke the `question-store` lib when a questions related
     * method is called.
     */

    utils.sync(this, 'questions', function fn() {
      // return cached instance
      if (fn._questions) {
        return fn._questions;
      }

      var Questions = utils.Questions;
      var questions = new Questions(opts);

      utils.sync(questions, 'data', function() {
        return app.cache.data;
      });

      utils.sync(questions, 'store', function() {
        return app.store;
      });

      fn._questions = questions;
      return questions;
    });

    /**
     * Create a "choices" question from an array.
     *
     * ```js
     * app.choices('foo', ['a', 'b', 'c']);
     * // or
     * app.choices('foo', {
     *   message: 'Favorite letter?',
     *   choices: ['a', 'b', 'c']
     * });
     * // then
     * app.ask('foo', function(err, answer) {
     *   console.log(answer);
     * });
     * ```
     * @name .choices
     * @param {String|Array} `queue` Name or array of question names.
     * @param {Object|Function} `options` Question options or callback function
     * @param {Function} `callback` callback function
     * @api public
     */

    this.define('choices', function() {
      var args = [].slice.call(arguments);
      var cb = args.pop();
      var question = utils.toChoices.apply(null, args);

      // don't save answers for choice questions
      // unless explicitly defined by the user
      if (!question.hasOwnProperty('save')) {
        question.save = false;
      }

      this.questions.set(question.name, question);
      return this.ask(question.name, cb);
    });

    /**
     * Add a question to be asked at a later point.
     *
     * ```js
     * app.question('beverage', 'What is your favorite beverage?');
     * // or
     * app.question('beverage', {
     *   type: 'input',
     *   message: 'What is your favorite beverage?'
     * });
     * // or
     * app.question({
     *   name: 'beverage'
     *   type: 'input',
     *   message: 'What is your favorite beverage?'
     * });
     * ```
     * @name .question
     * @param {Object|String} `value` Question object, message (string), or options object.
     * @param {String} `locale` Optionally pass the locale to use, otherwise the default locale is used.
     * @return {Object} Returns the `this.questions` object, for chaining
     * @api public
     */

    this.define('question', function() {
      return this.questions.set.apply(this.questions, arguments);
    });

    /**
     * Ask one or more questions, with the given `options` and callback.
     *
     * ```js
     * // ask all questions
     * app.ask(function(err, answers) {
     *   console.log(answers);
     * });
     *
     * // ask the specified questions
     * app.ask(['name', 'description'], function(err, answers) {
     *   console.log(answers);
     * });
     * ```
     * @name .ask
     * @param {String|Array} `queue` Name or array of question names.
     * @param {Object|Function} `options` Question options or callback function
     * @param {Function} `callback` callback function
     * @api public
     */

    this.define('ask', function(queue, opts, cb) {
      if (typeof queue === 'string' && !this.questions.has(queue)) {
        this.questions.set(queue, {force: true}, queue);
      }
      this.questions.ask(queue, opts, cb);
    });
  };
};

/**
 * Utility for matching question names
 */

function isMatch(key, pattern) {
  if (key === pattern) return true;
  if (Array.isArray(pattern)) {
    return utils.mm.any(key, pattern);
  }
  return utils.mm.isMatch(key, pattern);
}

function isForced(key, options) {
  var opts = utils.merge({}, options);
  if (utils.isValidGlob(opts.force)) {
    return isMatch(key, opts.force);
  }
  if (utils.isValidGlob(opts.init)) {
    return isMatch(key, opts.init);
  }
  if (opts.init === true) {
    return true;
  }
  if (opts.force === true) {
    return true;
  }
}
