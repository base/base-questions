'use strict';

var questions = require('..');
var assemble = require('assemble-core');
var store = require('base-store');

var app = assemble();
app.use(store());
app.use(questions());

app
  .questions.set('a', 'What is a?');
//   // .questions.set('b')
//   // .questions.set('c')

// app.ask(function (err, answers) {
//   if (err) return console.log(err);
//   console.log(answers);

// });

