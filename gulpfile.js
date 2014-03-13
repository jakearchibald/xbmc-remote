var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var buffer = require('gulp-buffer');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var hbsfy = require('hbsfy');
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

function jsTask(bundler, dev) {
  var stream = bundler.bundle({
    debug: dev
  }).pipe(source('all.js'));

  if (!dev) {
    stream = stream.pipe(buffer()).pipe(uglify());
  }

  return stream.pipe(gulp.dest('www/static/js/'));
}

function makeBundler(func) {
  return func('./www/static/js/index.js').transform(hbsfy);
}

gulp.task('js-build', function() {
  return jsTask(makeBundler(browserify), false);
});

gulp.task('watch', ['sass'], function() {
  // sass
  gulp.watch('www/static/css/**/*.scss', ['sass']);

  // js
  var bundler = makeBundler(watchify);
  bundler.on('update', rebundle);

  function rebundle() {
    return jsTask(bundler, true);
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

gulp.task('build', ['clean', 'sass-build', 'js-build'], function() {
  var server = app.listen(3000);
  var writeStream = gulp.dest('build/');

  writeStream.on('end', server.close.bind(server));

  return urlSrc('http://localhost:3000/xbmc-remote/', [
    '',
    'tv/',
    'static/css/all.css',
    'static/js/all.js'
  ]).pipe(writeStream);
});

gulp.task('default', ['watch', 'server']);