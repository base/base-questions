'use strict';

var Questions = require('..');
var questions = new Questions();

questions.option('init', 'name');
questions
  .set('author.name', 'Author name?')
  .set('author.username', 'Author username?')
  .set('author.url', 'Author url?')

  .set('project.name', 'What is the project name?')
  .set('project.desc', 'What is the project description?', {force: true});

questions
  .ask(function(err, answer) {
    console.log(answer)
  });
