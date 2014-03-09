var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var app = require('./server');
var urlSrc = require('./url-src');

function sassTask(dev) {
  return gulp.src('www/static/css/*.scss')
    .pipe(sass({
      sourcemap: dev,
      style: 'compressed'
    }))
    .pipe(gulp.dest('www/static/css/'));
}

gulp.task('sass', function() {
  return sassTask(true);
});

gulp.task('sass-build', function() {
  return sassTask(false);
});

function browserifyGulp(bundler, dev) {
  return bundler.bundle({
    debug: dev
  }).pipe(source('all.js'))
    .pipe(gulp.dest('www/static/js/'));
}

gulp.task('browserify-build', function() {
  return browserifyGulp(browserify('./www/static/js/index.js'), false);
});

gulp.task('watch', ['sass'], function() {
  // sass
  gulp.watch('www/static/css/**/*.scss', ['sass']);

  // js
  var bundler = watchify('./www/static/js/index.js');
  bundler.on('update', rebundle);

  function rebundle() {
    return browserifyGulp(bundler, true);
  }

  return rebundle();
});

gulp.task('server', function() {
  app.listen(3000);
});

gulp.task('clean', function() {
  gulp.src('build/*', {read: false})
    .pipe(clean());
});

gulp.task('build', ['clean', 'sass-build', 'browserify-build'], function() {
  var server = app.listen(3000);
  var writeStream = gulp.dest('build/');

  writeStream.on('end', server.close.bind(server));

  return urlSrc('http://localhost:3000/', [
    '',
    'tv/'
  ]).pipe(writeStream);
});

gulp.task('default', ['watch', 'server']);