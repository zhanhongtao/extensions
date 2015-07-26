
var buildpath = '../';

var gulp = require('gulp');
require(buildpath).task(gulp, {
  input: './',
  files: [
    './**/*',
    '!./gulpfile.js',
    '!./**/*.sext',
    '!./**/*.bat',
    '!./node_modules',
    '!./node_modules/**'
  ]
});

gulp.task('default', ['build-pc']);

