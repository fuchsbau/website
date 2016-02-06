"use strict";

// util
const path = require('path');

const gulp = require('gulp');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const clean = require('gulp-clean');
const gulpSequence = require('gulp-sequence');
const frontMatter = require('gulp-front-matter');
const data = require('gulp-data');
// var concat = require("gulp-concat");


// precompilers
const jade = require('gulp-jade');
const sass = require('gulp-sass');

// scripts
//
// files

// optimization
const autoprefixer = require('gulp-autoprefixer');
const rev = require('gulp-rev');
const revReplace = require("gulp-rev-replace");
const imageop = require('gulp-image-optimization');
const gzip = require('gulp-gzip');
// var sitemap = require('gulp-sitemap');

// release tooling
// var replace = require('gulp-replace');
// var ghPages = require('gulp-gh-pages');


var config = {
  src: 'src',
  dist: 'dist'
};

var paths = {
  templates: path.resolve(__dirname, config.src, 'templates'),
  styles: path.resolve(__dirname, config.src, 'styles'),
  build: path.resolve(__dirname, config.dist),
  css: path.resolve(__dirname, config.dist, 'css')
};


// gulp.task('asset-revisioning', ['styles', 'scripts'], function () {
//   return gulp.src([assetPath + '/javascripts/*.js', assetPath + '/styles/*.css'], {base: assetFolder})
//     .pipe(rev())
//     .pipe(gulp.dest(assetPath))  // write rev'd assets to build dir
//     .pipe(rev.manifest())
//     .pipe(gulp.dest(assetPath)); // write manifest to build dir
// });
//
// gulp.task('stylus', function () {
//   return gulp.src('./lib/*.styl')
//     .pipe(plumber())
//     .pipe(sourcemaps.init())
//     .pipe(stylus())
//     .pipe(autoprefixer({
//       browsers: ['last 2 versions'],
//       cascade: false
//     }))
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest(assetPath + '/styles'));
// });

gulp.task('styles', () => {
  gulp.src(`${paths.styles}/**/*.sass`)
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest(paths.css));
});

gulp.task('scripts', () => {

});
// gulp.task('files', () => {});

gulp.task('templates', () => {
    // let manifest = gulp.src(assetPath + '/rev-manifest.json');

    gulp.src(`${paths.templates}/[^_]*.jade`)
    .pipe(plumber())
    .pipe(jade({pretty: true, locals: { host: config.host, copyrightYear: new Date().getFullYear() }}))
    // .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest(paths.build));
});


gulp.task('build-development', ['templates']);

gulp.task('default', ['build-development'])
