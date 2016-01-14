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
   var store = (app.base && app.base.store) || app.store || {};

   if (app.hasQuestions) return;
   app.define('hasQuestions', true);

   function updateOpts() {
     options = utils.merge({}, app.options.questions, options);
   }

   updateOpts();
   utils.forceExit();
   var Questions = utils.questions;
   var questions = new Questions(options);
   var opts = questions.options;

   // force all questions to be asked when requested by the user
   if (opts.init === true || opts.force === true) {
     opts.forceAll = true;
   }


   /**
    * Pre-populate answers with data from `app.store.data` and
    * `app.cache.data` (`app.store.data` is persisted to the file
    * system, and `app.cache.data` is in-memory)
    */

   // listen for `ask` event and attempt to set the default
   // value using stored data, before the question is asked
   questions.on('ask', function(key, question, answers) {
     updateOpts();

     var ctx = utils.merge({}, app.store.data, app.cache.data);
     if (app.env && app.env.user) {
       ctx = utils.merge({}, ctx, app.env.user.pkg);
     }

     questions.setData(ctx);

     var init = options.init || options.force;
     if (init && typeof init !== 'boolean' && isMatch(key, init)) {
       question.options.force = true;
       return;
     }

     if (init === true) {
       question.options.force = true;
       return;
     }

     var answer = utils.get(app.cache, ['expanded', key]);
     if (answer) {
       question.answer.set(answer);
       return;
     }

     answer = utils.get(ctx, key);
     if (answer) {
       question.answer.set(answer);
       return;
     }

     if (!question.isAnswered(options.locale)) {
       questions.options.force = true;
     }
   });

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
    * Load questions to ask. Answers are passed to templates as context.
    */

   opts.questions = utils.commonQuestions(opts.questions);
   for (var key in opts.questions) {
     app.questions.visit(key, opts.questions[key]);
   }
   delete opts.questions;

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

   app.define('ask', function(queue, opts, cb) {
     if (typeof queue === 'string' && !questions.has(queue)) {
       questions.set(queue, {force: true}, queue);
     }
     questions.ask(queue, opts, cb);
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
