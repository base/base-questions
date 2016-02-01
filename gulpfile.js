'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var eslint = require('gulp-eslint');

gulp.task('coverage', function() {
  return gulp.src(['index.js', 'utils.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('mocha', ['coverage'], function() {
  return gulp.src('test.js')
    .pipe(mocha({reporter: 'spec'}))
    .on('error', console.error)
    .pipe(istanbul.writeReports())
});

gulp.task('eslint', function() {
  return gulp.src(['index.js', 'gulpfile.js', 'utils.js', 'test.js'])
    .pipe(eslint())
});

gulp.task('default', ['mocha', 'eslint']);
