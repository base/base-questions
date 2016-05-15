# base-questions [![NPM version](https://img.shields.io/npm/v/base-questions.svg?style=flat)](https://www.npmjs.com/package/base-questions) [![NPM downloads](https://img.shields.io/npm/dm/base-questions.svg?style=flat)](https://npmjs.org/package/base-questions) [![Build Status](https://img.shields.io/travis/node-base/base-questions.svg?style=flat)](https://travis-ci.org/node-base/base-questions)

Plugin for base-methods that adds methods for prompting the user and storing the answers on a project-by-project basis.

You might also be interested in [data-store](https://github.com/jonschlinkert/data-store).

## TOC

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Related projects](#related-projects)
- [Contributing](#contributing)
- [Building docs](#building-docs)
- [Running tests](#running-tests)
- [Author](#author)
- [License](#license)

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install base-questions --save
```

## Usage

Try running the [actual examples](./example.js) if it helps to see the following example in action.

```js
var questions = require('base-questions');
var assemble = require('assemble-core');
var store = require('base-store');
var argv = require('base-argv');

var app = assemble();
app.use(store());
app.use(argv());

var argv = app.argv(process.argv.slice(2));
app.use(questions(app, argv.options));

app.task('ask', function (cb) {
  app.ask(function (err, answers) {
    if (err) return cb(err);
    console.log(answers);
    cb();
  });
});

app.task('a', function (cb) {
  console.log('task > a!');
  cb();
});

app.task('b', function (cb) {
  console.log('task > b!');
  cb();
});

app.task('c', function (cb) {
  console.log('task > c!');
  cb();
});

app.task('choices', function (cb) {
  app.choices('run', ['a', 'b', 'c'], function (err, answers) {
    if (err) return cb(err);
    if (!answers.run.length) return cb();
    app.build(answers.run, cb);
  });
});

app.build('choices', function(err) {
  if (err) return console.log(err);
  console.log('done!');
});
```

## API

### [.confirm](index.js#L92)

Create a `confirm` question.

**Params**

* `name` **{String}**: Question name
* `msg` **{String}**: Question message
* `queue` **{String|Array}**: Name or array of question names.
* `options` **{Object|Function}**: Question options or callback function
* `callback` **{Function}**: callback function

**Example**

```js
app.confirm('file', 'Want to generate a file?');

// equivalent to
app.question({
  name: 'file',
  message: 'Want to generate a file?',
  type: 'confirm'
});
```

### [.choices](index.js#L126)

Create a "choices" question from an array.

**Params**

* `name` **{String}**: Question name
* `msg` **{String}**: Question message
* `choices` **{Array}**: Choice items
* `queue` **{String|Array}**: Name or array of question names.
* `options` **{Object|Function}**: Question options or callback function
* `callback` **{Function}**: callback function

**Example**

```js
app.choices('color', 'Favorite color?', ['blue', 'orange', 'green']);

// or
app.choices('color', {
  message: 'Favorite color?',
  choices: ['blue', 'orange', 'green']
});

// or
app.choices({
  name: 'color',
  message: 'Favorite color?',
  choices: ['blue', 'orange', 'green']
});
```

### [.question](index.js#L159)

Add a question to be asked by the `.ask` method.

**Params**

* `name` **{String}**: Question name
* `msg` **{String}**: Question message
* `value` **{Object|String}**: Question object, message (string), or options object.
* `locale` **{String}**: Optionally pass the locale to use, otherwise the default locale is used.
* `returns` **{Object}**: Returns the `this.questions` object, for chaining

**Example**

```js
app.question('beverage', 'What is your favorite beverage?');

// or
app.question('beverage', {
  type: 'input',
  message: 'What is your favorite beverage?'
});

// or
app.question({
  name: 'beverage'
  type: 'input',
  message: 'What is your favorite beverage?'
});
```

### [.ask](index.js#L184)

Ask one or more questions, with the given `options` and callback.

**Params**

* `queue` **{String|Array}**: Name or array of question names.
* `options` **{Object|Function}**: Question options or callback function
* `callback` **{Function}**: callback function

**Example**

```js
// ask all questions
app.ask(function(err, answers) {
  console.log(answers);
});

// ask the specified questions
app.ask(['name', 'description'], function(err, answers) {
  console.log(answers);
});
```

## Related projects

You might also be interested in these projects:

* [answer-store](https://www.npmjs.com/package/answer-store): Store answers to user prompts, based on locale and/or current working directory. | [homepage](https://github.com/jonschlinkert/answer-store)
* [common-questions](https://www.npmjs.com/package/common-questions): An object of questions commonly used by project generators or when initializing projects. Questions can… [more](https://www.npmjs.com/package/common-questions) | [homepage](https://github.com/generate/common-questions)
* [question-store](https://www.npmjs.com/package/question-store): Ask questions, persist the answers. Basic support for i18n and storing answers based on current… [more](https://www.npmjs.com/package/question-store) | [homepage](https://github.com/jonschlinkert/question-store)
* [to-choices](https://www.npmjs.com/package/to-choices): Easily create a normalized inquirer choices question. Supports all of the `choices` question types: checkbox,… [more](https://www.npmjs.com/package/to-choices) | [homepage](https://github.com/generate/to-choices)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/node-base/base-questions/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/node-base/base-questions/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on May 15, 2016._