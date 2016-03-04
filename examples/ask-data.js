'use strict';

var questions = require('..');
var assemble = require('assemble-core');
var argv = require('base-argv');

var app = assemble()
  .use(argv());

var args = app.argv(process.argv.slice(2));
app.use(questions(args));

app.task('default', ['ask']);

app.task('ask', function(cb) {
  app.ask(function (err, answers) {
    if (err) return cb(err);
    console.log(answers);
    cb();
  });
});

app.task('clear', function(cb) {
  app.questions.clearQuestions();
  cb();
});

app.task('del', function(cb) {
  app.questions.clearQuestions();
  cb();
});

app.task('author', function(cb) {
  app.question('author.name', 'Author\'s name?');
  app.question('author.username', 'Author\'s username?');
  app.ask('author', cb);
});

app.task('project', function(cb) {
  app.question('project.name', 'Project name?');
  app.ask('project', cb);
});

app.build(args.tasks, function(err) {
  if (err) throw err;
  console.log('done');
});
