'use strict';

var questions = require('..');
var assemble = require('assemble-core');
var store = require('base-store');
var argv = require('minimist')(process.argv.slice(2), {
  alias: {init: 'i', force: 'f'}
})

var app = assemble();
app.use(store());
app.use(questions(argv));
app.data({d: 'e'});

app.questions
  .set('a', 'What is A?')
  .set('b', 'What is B?')
  .set('c', 'What is C?')
  .set('d', 'What is D?');

app.ask(function (err, answers) {
  if (err) return console.log(err);
  console.log(answers);
});

