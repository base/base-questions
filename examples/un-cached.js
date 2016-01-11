'use strict';

var questions = require('..');
var assemble = require('assemble-core');
var store = require('base-store');
var argv = require('minimist')(process.argv.slice(2), {
  alias: {init: 'i', force: 'f'}
})

var app = assemble();
app.env = {
  user: {
    pkg: require('../package')
  }
};

app.use(store());
app.use(questions(argv));

app.ask('Would you like to answer this question?', function(err, answers) {
  if (err) return console.log(err);
  console.log(answers);
});
