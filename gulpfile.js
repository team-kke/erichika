"use strict";

var gulp = require('gulp')
  , browserify = require('browserify')
  , connect = require('gulp-connect')
  , csso = require('gulp-csso')
  , eslint = require('gulp-eslint')
  , filter = require('gulp-filter')
  , nodemon = require('gulp-nodemon')
  , rimraf = require('gulp-rimraf')
  , rename = require('gulp-rename')
  , stylus = require('gulp-stylus')
  , transform = require('vinyl-transform')
  , through = require('through')
  , uglify = require('gulp-uglify');

// Backend Tasks

gulp.task('back:run', ['back:lint'], function () {
  nodemon({script: 'backend/index.js', ext: 'js', watch: 'backend'})
    .on('change', ['back:lint']);
});

gulp.task('back:lint', function () {
  return gulp.src(['backend/**/*.js', 'gulpfile.js'])
    .pipe(eslint({configFile: '.eslintrc.backend'}))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// Frontend Tasks

var isDist = process.argv.indexOf('serve') === -1;

gulp.task('front:js', ['front:lint', 'front:clean:js'], function () {
   var browserified = transform(function (filename) {
     var b = browserify(filename);
     b.transform('reactify');
     b.transform('debowerify');
     return b.bundle();
   });

  return gulp.src('frontend/scripts/index.js')
    .pipe(browserified)
    .pipe(isDist ? uglify() : through())
    .pipe(rename('build.js'))
    .pipe(gulp.dest('out/js'))
    .pipe(connect.reload());
});

gulp.task('front:css', ['front:clean:css'], function () {
  return gulp.src('frontend/styles/index.styl')
    .pipe(stylus({
      'include css': true,
      'paths': ['./node_modules', './bower_components']
    }))
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('out/css'))
    .pipe(connect.reload());
});

gulp.task('front:clean', function () {
  return gulp.src('out')
    .pipe(rimraf());
});

gulp.task('front:clean:js', function () {
  return gulp.src('out/js/*')
    .pipe(rimraf());
});

gulp.task('front:clean:css', function () {
  return gulp.src('out/css/*')
    .pipe(rimraf());
});

gulp.task('front:connect', ['front:build'], function () {
  connect.server({
    root: 'out',
    livereload: true
  });
});

gulp.task('front:watch', function () {
  gulp.watch(['frontend/scripts/**/*'], ['front:js']);
  gulp.watch(['frontend/styles/**/*.styl'], ['front:css']);
});

gulp.task('front:lint', function () {
  return gulp.src('frontend/scripts/**/*')
    .pipe(filter(['*', '!frontend/scripts/libs/*']))
    .pipe(eslint({configFile: '.eslintrc.frontend'}))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('front:serve', ['front:connect', 'front:watch']);
gulp.task('front:build', ['front:clean', 'front:js', 'front:css']);

// Common Tasks

gulp.task('lint', ['back:lint', 'front:lint']);
gulp.task('run', ['back:run', 'front:serve']);
gulp.task('default', ['lint', 'front:build']);
