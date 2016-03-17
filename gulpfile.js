"use strict";

// util
const path = require('path');

const gulp = require('gulp');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const del = require('del');
const gulpSequence = require('gulp-sequence');
const frontMatter = require('gulp-front-matter');
const data = require('gulp-data');
var concat = require("gulp-concat");


// precompilers
const jade = require('gulp-jade');
const sass = require('gulp-sass');
const coffee = require('gulp-coffee');


// optimization
const autoprefixer = require('gulp-autoprefixer');
const rev = require('gulp-rev');
const revReplace = require("gulp-rev-replace");
const imageop = require('gulp-image-optimization');
const gzip = require('gulp-gzip');
// var sitemap = require('gulp-sitemap');

// release tooling
// var replace = require('gulp-replace');
const ghPages = require('gulp-gh-pages');
const sitemap = require('gulp-sitemap');


var config = {
  src: 'src',
  dist: 'dist',
  tmp: 'tmp'
};

var paths = {
  src: {
    templates: path.resolve(__dirname, config.src, 'templates'),
    images: path.resolve(__dirname, config.src, 'images'),
    styles: path.resolve(__dirname, config.src, 'styles'),
    scripts: path.resolve(__dirname, config.src, 'scripts'),
    fonts: path.resolve(__dirname, config.src, 'fonts')
  },
  dist: {
    build: path.resolve(__dirname, config.dist),
    images: path.resolve(__dirname, config.dist, 'images'),
    styles: path.resolve(__dirname, config.dist, 'css'),
    scripts: path.resolve(__dirname, config.dist, 'scripts'),
    fonts: path.resolve(__dirname, config.dist, 'fonts')
  },
  tmp: {
    scripts: path.resolve(__dirname, config.tmp, 'scripts')
  }
};

gulp.task('clean', () => {
  return del([config.dist]);
});

gulp.task('styles', () => {
  return gulp.src(`${paths.src.styles}/**/*.sass`)
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest(paths.dist.styles));
});

gulp.task('coffee', () => {
  return gulp.src(`${paths.src.scripts}/**/*.coffee`)
  .pipe(plumber())
  .pipe(coffee({bare: true}).on('error', gutil.log))
  .pipe(gulp.dest(paths.tmp.scripts));
});

gulp.task('vendor-scripts', () => {
  return gulp.src(['vendor/modernizr-custom.min.js'])
  .pipe(gulp.dest(paths.dist.scripts));
});

gulp.task('scripts', ['coffee'], () => {
  return gulp.src([
    'src/scripts/base64encode.js',
    'bower_components/bowser/bowser.js',
    'bower_components/jquery.stellar/jquery.stellar.js',
    'bower_components/jquery.center.js/dist/jquery.center.js',
    'bower_components/jquery-smooth-scroll/jquery.smooth-scroll.js',
    'bower_components/within-viewport/withinViewport.js',
    'bower_components/within-viewport/jquery.withinViewport.js',
    `${paths.tmp.scripts}/main.js`
  ])
  .pipe(concat('main.js'))
  .pipe(gulp.dest(paths.dist.scripts));
});

gulp.task('images', () => {
  return gulp.src(`${paths.src.images}/**/*`)
  .pipe(gulp.dest(paths.dist.images))
});

gulp.task('optimized-images', function() {
  return gulp.src(`${paths.src.images}/**/*`)
		.pipe(imageop({
	    optimizationLevel: 5,
	    progressive: true,
    	interlaced: true
    }))
    .pipe(gulp.dest(paths.dist.images))
});

gulp.task('fonts', () => {
  return gulp.src(`${paths.src.fonts}/**/*`)
  .pipe(gulp.dest(paths.dist.fonts))
});


gulp.task('asset-revisioning', ['styles', 'scripts'], function () {
  return gulp.src([`${paths.dist.scripts}/*.js`, `${paths.dist.styles}/*.css`], {base: paths.dist.build})
    .pipe(rev())
    .pipe(gulp.dest(paths.dist.build))  // write rev'd assets to build dir
    .pipe(rev.manifest())
    .pipe(gulp.dest(paths.dist.build)); // write manifest to build dir
});




gulp.task('build', function(cb) {
	return gulpSequence('clean', ['styles', 'images', 'scripts', 'fonts', 'vendor-scripts'], 'asset-revisioning', 'templates')(cb);
})

gulp.task('build-release', function(cb) {
	return gulpSequence(['styles', 'optimized-images', 'scripts', 'fonts', 'vendor-scripts'], 'asset-revisioning', 'templates', 'copy-cname', 'sitemap')(cb);
})

gulp.task('templates', () => {
    let manifest = gulp.src(`${paths.dist.build}/rev-manifest.json`);

    return gulp.src(`${paths.src.templates}/[^_]*.jade`)
    .pipe(plumber())
    .pipe(jade({pretty: true, locals: { host: config.host, copyrightYear: new Date().getFullYear() }}))
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest(paths.dist.build));
});

gulp.task('sitemap', function () {
  return gulp.src(`${paths.dist.build}/*.html`)
    .pipe(sitemap({
        siteUrl: 'http://www.fuchsbau-issum.de/'
    }))
    .pipe(gulp.dest(paths.dist.build));
});

gulp.task('copy-cname', function(cb) {
	return gulp.src('CNAME')
	.pipe(gulp.dest(paths.dist.build));
});


gulp.task('deploy', ['build-release'], function() {
  return gulp.src(paths.dist.build + '/**/*')
    .pipe(ghPages({ remoteUrl: "git@github.com:fuchsbau/fuchsbau.github.io.git", branch: "master" }));
});

gulp.task('default', ['build'])

gulp.task('watch', ['build'], function() {
  gulp.watch([`${paths.src.templates}/**/*`, `${paths.src.styles}/**/*`, `${paths.src.scripts}/**/*`], ['build']);
})
