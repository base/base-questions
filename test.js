'use strict';

require('mocha');
var assert = require('assert');
var questions = require('./');
var Base = require('base-methods');
var store = require('base-store');
var app, base;

describe('base-questions', function() {
  beforeEach(function() {
    base = new Base();
    base.use(store('base-questions-tests/base'));

    app = new Base();
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
});

describe('errors', function(cb) {
  beforeEach(function() {
    app = new Base();
  });

  it('should throw an error when the store plugin is not registered', function(cb) {
    try {
      app.use(questions());
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'base-questions requires the "base-store" plugin to be registered first');
      cb();
    }
  });
});
