/*!
 * base-questions <https://github.com/jonschlinkert/base-questions>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

module.exports = function(options) {
  return function(app) {
    var base = app.base || {};
    var store = base.store || app.store;

    if (!store || typeof store.set !== 'function') {
      var msg = 'base-questions requires the "base-store" plugin to be registered first';
      throw new TypeError(msg);
    }

    var opts = utils.extend({}, app.options, base.options, options);
    var Questions = utils.questions;
    var questions = new Questions(opts);

    // pre-load data from `cache.data` onto answer store
    questions.setData(app.cache.data);

    // re-initialize when specified by the user
    if (opts.init || opts.force) {
      questions.options.forceAll = true;
    }

    // listen for `ask` event and attempt to set the default
    // value using stored data, before the question is asked
    questions.on('ask', function(key, question, answers) {
      if (!question.isAnswered(opts.locale) && store.has(key)) {
        question.setDefault(store.get(key));
      }
    });

    // listen for answers and store them on `app.store` if
    // a value is not already defined. question-store already
    // stores the answer, but `app.store` is used for more
    // than questions, so we only set if it doesn't already exist.
    questions.on('answer', function(key, val, question) {
      if (question.options.isDefault && !store.has(key)) {
        store.set(key, val);
      }
    });

    /**
     * Load questions to ask. Answers are
     * passed to templates as context.
     */

    opts.questions = utils.commonQuestions(opts.questions);

    for (var key in opts.questions) {
      questions.visit(key, opts.questions[key]);
    }

    // decorate the `questions` instance onto `app`
    app.define('questions', questions);

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

    app.define('choices', function() {
      var args = [].slice.call(arguments);
      var cb = args.pop();
      var question = utils.toChoices.apply(null, args);
      // don't save answers for choice questions unless
      // explicitly defined by the user
      if (!question.hasOwnProperty('save')) {
        question.save = false;
      }
      app.questions.set(question.name, question);
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
     * @return {Object} Returns the `app.questions` object, for chaining
     * @api public
     */

    app.define('question', questions.set.bind(questions));

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

    app.define('ask', questions.ask.bind(questions));
  };
};
