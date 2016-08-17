'use strict';

process.env.NODE_ENV = 'test';

require('mocha');
var assert = require('assert');
var App = require('base');
var store = require('base-store');
var option = require('base-option');
var config = require('base-config-process');
var intercept = require('intercept-stdout');
var bddStdin = require('bdd-stdin');
var data = require('base-data');
var questions = require('./');
var app, base, site;

function interception(re) {
  return intercept(function(str) {
    if (re.test(str)) {
      return '';
    } else {
      return str.trim();
    }
  });
}

describe('base-questions', function() {
  describe('plugin', function() {
    beforeEach(function() {
      base = new App({isApp: true});
      base.use(store('base-questions-tests/base'));

      app = new App({isApp: true});
      app.use(store('base-questions-tests/app'));
      app.use(questions());
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
  });

  describe('app.ask', function() {
    beforeEach(function() {
      app = new App({isApp: true});
      app.use(data());
      app.use(option());
      app.use(config());
      app.use(questions());
      app.use(store('base-questions-tests/app.ask'));
    });

    afterEach(function() {
      app.store.del({force: true});
      app.questions.clear();
      app.cache.data = {};
    });

    it('should force all questions to be asked', function(cb) {
      var unhook = interception(/Name|Description/);
      var answers = {
        name: 'Brian Woodward',
        desc: 'Foo'
      };

      app.on('ask', function(val, key) {
        bddStdin(answers[key], '\n');
      });

      app.question('name', {message: 'Name?'});
      app.question('desc', {message: 'Description?'});

      app.ask({force: true}, function(err, answers) {
        if (err) {
          cb(err);
          return;
        }
        assert.deepEqual(answers, {name: 'Brian Woodward', desc: 'Foo'});
        unhook();
        cb();
      });
    });

    it('should store a question:', function() {
      app.question('a', 'b');
      assert(app.questions);
      assert(app.questions.cache);
      assert(app.questions.cache.a);
      assert.equal(app.questions.cache.a.name, 'a');
      assert.equal(app.questions.cache.a.message, 'b');
    });

    it('should force a specific question:', function(cb) {
      var unhook = interception(/foo/);
      app.on('ask', function() {
        bddStdin('foo', '\n');
      });

      app.disable('force');
      app.question('a', 'b');
      app.question('c', 'd');
      app.question('e', 'f');
      app.data({a: 'b', c: 'd', e: 'f'});

      var question = app.questions.get('e');
      question.options.force = true;

      app.ask(function(err, answers) {
        if (err) return cb(err);
        assert.deepEqual(answers, {a: 'b', c: 'd', e: 'foo'});
        unhook();
        cb();
      });
    });

    it('should ask a question defined on `ask`', function(cb) {
      app.data('name', 'Brian Woodward');

      app.ask('name', function(err, answers) {
        if (err) return cb(err);
        assert.equal(answers.name, 'Brian Woodward');
        cb();
      });
    });

    it('should ask a question and use a `cache.data` value to answer:', function(cb) {
      app.question('a', 'this is a question');
      app.data('a', 'b');

      app.ask('a', function(err, answers) {
        if (err) return cb(err);
        assert.equal(answers.a, 'b');

        app.data('a', 'zzz');
        app.ask('a', function(err, answers) {
          if (err) return cb(err);
          assert.equal(answers.a, 'zzz');
          cb();
        });
      });
    });

    it('should ask a question and use a `store.data` value to answer:', function(cb) {
      app.question('a', 'this is another question');
      app.store.set('a', 'c');

      app.ask('a', function(err, answers) {
        if (err) return cb(err);
        assert(answers);
        assert.equal(answers.a, 'c');
        cb();
      });
    });

    it('should ask a question and use a config value to answer:', function(cb) {
      app.question('a', 'b');
      app.config.process({data: {a: 'foo'}}, function(err) {
        if (err) return cb(err);

        app.store.set('a', 'c');

        app.ask('a', function(err, answer) {
          if (err) return cb(err);
          assert(answer);
          assert.equal(answer.a, 'foo');
          cb();
        });
      });
    });

    it('should prefer `cache.data` to `store.data`', function(cb) {
      app.question('a', 'b');
      app.data('a', 'b');
      app.store.set('a', 'c');

      app.ask('a', function(err, answer) {
        assert(!err);
        assert(answer);
        assert.equal(answer.a, 'b');
        cb();
      });
    });

    it('should update data with data loaded by config', function(cb) {
      app.question('a', 'this is a question');
      app.data('a', 'b');

      app.config.process({data: {a: 'foo'}}, function(err) {
        if (err) return cb(err);

        app.ask('a', function(err, answer) {
          if (err) return cb(err);

          assert(answer);
          assert.equal(answer.a, 'foo');
          cb();
        });
      });
    });
  });

  describe('session data', function() {
    before(function() {
      site = new App();
      site.isApp = true;
      site.use(store('base-questions-tests/site'));
      site.use(data());
      site.use(config());
      site.use(option());
      site.use(questions());

      app = new App();
      app.isApp = true;
      app.use(store('base-questions-tests/app'));
      app.use(data());
      app.use(config());
      app.use(option());
      app.use(questions());
    });

    after(function() {
      site.store.del({force: true});
      site.questions.clear();
      app.cache.data = {};

      app.store.del({force: true});
      app.questions.clear();
      app.cache.data = {};
    });

    it('[app] should ask a question and use a `cache.data` value to answer:', function(cb) {
      app.question('package.name', 'this is a question');
      app.data('package.name', 'base-questions');

      app.ask('package.name', function(err, answers) {
        if (err) return cb(err);
        assert.equal(answers.package.name, 'base-questions');

        app.data('package.name', 'question-store');
        app.ask('package.name', function(err, answers) {
          if (err) return cb(err);
          assert.equal(answers.package.name, 'question-store');
          cb();
        });
      });
    });

    it('[site] should ask a question and use a `cache.data` value to answer:', function(cb) {
      site.question('package.name', 'this is a question');
      site.data('package.name', 'base-questions');

      site.ask('package.name', function(err, answers) {
        if (err) return cb(err);
        assert.equal(answers.package.name, 'base-questions');

        site.data('package.name', 'question-store');
        site.ask('package.name', function(err, answers) {
          if (err) return cb(err);
          assert.equal(answers.package.name, 'question-store');
          cb();
        });
      });
    });

    it('[app] should ask a question and use a `store.data` value to answer:', function(cb) {
      app.question('author.name', 'author name?');
      app.store.set('author.name', 'Brian Woodward');
      app.disable('common-config');

      app.ask('author.name', function(err, answers) {
        if (err) return cb(err);
        assert(answers);
        assert.equal(answers.author.name, 'Brian Woodward');
        cb();
      });
    });

    it('[site] should ask a question and use a `store.data` value to answer:', function(cb) {
      site.question('author.name', 'author name?');
      site.store.set('author.name', 'Jon Schlinkert');

      site.ask('author.name', function(err, answers) {
        if (err) return cb(err);
        assert(answers);
        assert.equal(answers.author.name, 'Jon Schlinkert');
        cb();
      });
    });

    it('[app] should ask a question and use a config value to answer:', function(cb) {
      app.question('foo', 'Username?');

      app.config.process({data: {foo: 'jonschlinkert'}}, function(err) {
        if (err) return cb(err);
        app.store.set('foo', 'doowb');
        app.ask('foo', function(err, answer) {
          assert(!err);
          assert(answer);
          assert.equal(answer.foo, 'jonschlinkert');
          cb();
        });
      });
    });

    it('[site] should ask a question and use a config value to answer:', function(cb) {
      site.question('foo', 'Username?');

      site.config.process({data: {foo: 'doowb'}}, function(err) {
        if (err) return cb(err);
        site.ask('foo', function(err, answer) {
          if (err) return cb(err);
          assert(answer);
          assert.equal(answer.foo, 'doowb');
          cb();
        });
      });
    });
  });
});
