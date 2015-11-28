/*!
 * base-questions <https://github.com/jonschlinkert/base-questions>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

module.exports = function(base, options) {
  if (!base.store || typeof base.store.set !== 'function') {
    var msg = 'base-questions requires the base-store plugin to be registered first';
    throw new TypeError(msg);
  }

  return function(app) {
    var opts = utils.extend({}, app.options, base.options, options);

    var questions = utils.questions(opts);
    questions.setData(app.cache.data);

    if (opts.init || opts.force) {
      questions.options.forceAll = true;
    }

    /**
     * Listen for `questions` events
     */

    questions.on('ask', function(key, question, answers) {
      if (!question.isAnswered(opts.locale) && base.store.has(key)) {
        question.setDefault(base.store.get(key));
      }
    });

    questions.on('answer', function(key, val, question) {
      if (question.options.isDefault && !base.store.has(key)) {
        base.store.set(key, val);
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

    app.define('questions', questions);
  };
};
