'use strict';


/**
 * Requirements
 */
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');


/**
 * Configuration
 */
const config =
{
    root: __dirname + '/source/template',
    scss: __dirname + '/source/template/scss',
    css: __dirname + '/source/template/css',
    js: __dirname + '/source/template/js'
}


/**
 * Compile scss files
 */
gulp.task('scss', function ()
{
    const sassOptions =
    {
        errLogToConsole: true,
        outputStyle: 'expanded'
    }
    return gulp
        .src(config.scss + '/entoj-gui-confluence.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.css));
});

gulp.task('scss-watch', function()
{
    return gulp
        .watch(config.scss + '/**/*.scss', ['scss']);
});
