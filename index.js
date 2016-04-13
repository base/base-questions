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
    opts.data = this.cache.data || {};
    opts.cwd = this.cwd || process.cwd();
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

      var globals = questions.globals;
      var store = questions.store;
      var data = questions.data;

      questions.on('ask', app.emit.bind(app, 'ask'));
      questions.on('answer', app.emit.bind(app, 'answer'));
      questions.on('error', function(err) {
        err.reason = 'base-questions error';
        self.emit('error', err);
        self.emit('*', 'error', err);
      });

      utils.sync(questions, 'data', function() {
        var obj = utils.merge({}, data, self.cache.data);
        utils.merge(data, obj);
        return data;
      });

      utils.sync(questions, 'store', function() {
        return self.store || store;
      });

      utils.sync(questions, 'globals', function() {
        return self.globals || globals;
      });

      return questions;
    });

    /**
     * Create a `confirm` question.
     *
     * ```js
     * app.confirm('file', 'Want to generate a file?');
     *
     * // equivalent to
     * app.question({
     *   name: 'file',
     *   message: 'Want to generate a file?',
     *   type: 'confirm'
     * });
     * ```
     * @name .confirm
     * @param {String} `name` Question name
     * @param {String} `msg` Question message
     * @param {String|Array} `queue` Name or array of question names.
     * @param {Object|Function} `options` Question options or callback function
     * @param {Function} `callback` callback function
     * @api public
     */

    this.define('confirm', function() {
      this.questions.confirm.apply(this.questions, arguments);
      return this.questions;
    });

    /**
     * Create a "choices" question from an array.
     *
     * ```js
     * app.choices('color', 'Favorite color?', ['blue', 'orange', 'green']);
     *
     * // or
     * app.choices('color', {
     *   message: 'Favorite color?',
     *   choices: ['blue', 'orange', 'green']
     * });
     *
     * // or
     * app.choices({
     *   name: 'color',
     *   message: 'Favorite color?',
     *   choices: ['blue', 'orange', 'green']
     * });
     * ```
     * @name .choices
     * @param {String} `name` Question name
     * @param {String} `msg` Question message
     * @param {Array} `choices` Choice items
     * @param {String|Array} `queue` Name or array of question names.
     * @param {Object|Function} `options` Question options or callback function
     * @param {Function} `callback` callback function
     * @api public
     */

    this.define('choices', function() {
      this.questions.choices.apply(this.questions, arguments);
      return this.questions;
    });

    /**
     * Add a question to be asked by the `.ask` method.
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
     * @param {String} `name` Question name
     * @param {String} `msg` Question message
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
        this.questions.set.call(this.questions, queue, opts, queue);
      }
      this.questions.ask.call(this.questions, queue, opts, cb);
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
