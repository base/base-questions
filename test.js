'use strict';

process.env.NODE_ENV = 'test';

require('mocha');
var fs = require('fs');
var assert = require('assert');
var App = require('base');
var store = require('base-store');
var option = require('base-options');
var config = require('base-config');
var data = require('base-data');
var questions = require('./');
var app, base;

describe('base-questions', function() {
  beforeEach(function() {
    base = new App();
    base.use(store('base-questions-tests/base'));

    app = new App();
    app.use(store('base-questions-tests/app'));
    app.use(questions(base));
  });

  it('should export a function', function() {
    assert.equal(typeof questions, 'function');
  });

  it('should expose a `questions` object on "app"', function() {
    assert.equal(typeof app.questions, 'object');
  });

  it('should expose a `set` method on "app.questions"', function() {
    assert.equal(typeof app.questions.set, 'function');
  });
  it('should expose a `get` method on "app.questions"', function() {
    assert.equal(typeof app.questions.get, 'function');
  });
  it('should expose an `ask` method on "app.questions"', function() {
    assert.equal(typeof app.questions.ask, 'function');
  });

  it('should expose an `ask` method on "app"', function() {
    assert.equal(typeof app.ask, 'function');
  });
  it('should expose a `question` method on "app"', function() {
    assert.equal(typeof app.question, 'function');
  });

  it.skip('should ask common questions', function(cb) {
    this.timeout(20000);

    app.ask({force: true}, function(err, answers) {
      console.log(answers)
      cb();
    });
  });

  it.skip('should force all questions to be asked', function(cb) {
    app.questions.option('init', 'author');
    app.ask({force: true}, function(err, answers) {
      console.log(answers)
      cb();
    });
  });
});

describe('app.ask', function() {
  beforeEach(function() {
    app = new App();
    app.use(data());
    app.use(config());
    app.use(option());
    app.use(store('base-questions-tests/ask'))
    app.use(questions());
  });

  it('should store a question:', function() {
    app.question('a', 'b');
    assert(app.questions);
    assert(app.questions.cache);
    assert(app.questions.cache.a);
    assert(app.questions.cache.a.name === 'a');
    assert(app.questions.cache.a.options.message === 'b');
  });

  it.skip('should re-init a specific question:', function(cb) {
    this.timeout(20000);
    app.question('a', 'b');
    app.data({a: 'b'});

    app.option('questions.init', 'a');

    app.ask(function(err, answers) {
      console.log(answers);
      cb();
    });
  });

  it('should ask a question and use a `cache.data` value to answer:', function(cb) {
    app.question('a', 'b');
    app.data('a', 'b');

    app.ask('a', function(err, answers) {
      assert(!err);
      assert(answers.a === 'b');

      app.data('a', 'zzz');
      app.ask('a', function(err, answers) {
        assert(!err);
        assert(answers.a === 'zzz');
        cb();
      })
    });
  });

  it('should ask a question and use a `store.data` value to answer:', function(cb) {
    app.question('a', 'b');
    app.store.set('a', 'c');

    app.ask('a', function(err, answers) {
      assert(!err);
      assert(answers);
      assert(answers.a === 'c');
      cb();
    })
  });

  it('should ask a question and use a config value to answer:', function(cb) {
    app.question('a', 'b');
    app.config.process({data: {a: 'foo'}});
    app.store.set('a', 'c');

    app.ask('a', function(err, answer) {
      assert(!err);
      assert(answer);
      assert(answer.a === 'foo');
      cb();
    })
  });

  it('should prefer `cache.data` to `store.data`', function(cb) {
    app.question('a', 'b');
    app.data('a', 'b');
    app.store.set('a', 'c');

    app.ask('a', function(err, answer) {
      assert(!err);
      assert(answer);
      assert(answer.a === 'b');
      cb();
    })
  });

  it('should prefer data loaded by config to `cache.data`', function(cb) {
    app.question('a', 'b');
    app.data('a', 'b');
    app.config.process({data: {a: 'foo'}});

    app.ask('a', function(err, answer) {
      assert(!err);
      assert(answer);
      assert(answer.a === 'foo');
      cb();
    })
  });
});
