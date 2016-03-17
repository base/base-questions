/*!
 * base-questions <https://github.com/jonschlinkert/base-questions>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

module.exports = function(config) {
  return function plugin(app) {
    if (!isValidInstance(app)) return;

    var opts = utils.merge({project: this.project}, this.options, config);
    opts.store = this.store;
    opts.globals = this.globals;
    opts.data = this.cache.data;
    var self = this;

    /**
     * Decorate the `questions` instance onto `app` and lazily
     * invoke the `question-store` lib when a questions related
     * method is called.
     */

    utils.sync(this, 'questions', function fn() {
      // return cached instance
      if (fn._questions) return fn._questions;

      var Questions = utils.Questions;
      var questions = new Questions(opts);
      fn._questions = questions;

      questions.on('ask', app.emit.bind(app, 'ask'));
      questions.on('answer', app.emit.bind(app, 'answer'));
      questions.on('error', function(err) {
        err.reason = 'base-questions error';
        self.emit('error', err);
        self.emit('*', 'error', err);
      });

      utils.sync(questions, 'data', function() {
        return self.cache.data;
      });

      utils.sync(questions, 'store', function() {
        return self.store;
      });

      utils.sync(questions, 'globals', function() {
        return self.globals;
      });

      return questions;
    });

    /**
     * Create a "choices" question from an array.
     *
     * ```js
     * app.choices('Favorite color?', ['blue', 'orange', 'green']);
     *
     * // or
     * app.choices('foo', {
     *   message: 'Favorite color?',
     *   choices: ['blue', 'orange', 'green']
     * });
     * ```
     * @name .choices
     * @param {String|Array} `queue` Name or array of question names.
     * @param {Object|Function} `options` Question options or callback function
     * @param {Function} `callback` callback function
     * @api public
     */

    this.define('choices', function() {
      this.questions.choices.apply(this.questions, arguments);
      return this;
    });

    /**
     * Add a question to be asked at a later point.
     *
     * ```js
     * app.question('beverage', 'What is your favorite beverage?');
     *
     * // or
     * app.question('beverage', {
     *   type: 'input',
     *   message: 'What is your favorite beverage?'
     * });
     *
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
        this.questions.set(queue, opts, queue);
      }
      this.questions.ask(queue, opts, cb);
    });

    return plugin;
  };
};

function isValidInstance(app) {
  var fn = app.options.validatePlugin;
  if (typeof fn === 'function' && !fn(app)) {
    return false;
  }
  if (app.isRegistered('base-questions')) {
    return false;
  }
  if (app.isCollection || app.isView) {
    return false;
  }
  return true;
}
