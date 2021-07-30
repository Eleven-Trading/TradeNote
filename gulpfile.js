'use strict'

var gulp = require('gulp')
var browserSync = require('browser-sync').create()
var changed = require('gulp-changed')
var log = require('fancy-log')
var clean = require('gulp-clean')
var fileinclude = require('gulp-file-include')
var replace = require('gulp-replace')

/******** PATHS **********/
var paths = {
    cssPath: {
        src: "src/css/**/*",
        dest: "dist/css/"
    },
    iconsPath: {
        src: "src/icons/**/*",
        dest: "dist/icons/"
    },
    imagesPath: {
        src: "src/images/**/*",
        dest: "dist/images/"
    },
    scriptsPath: {
        src: "src/scripts/**/*",
        dest: "dist/scripts/"
    },
    viewsPath: {
        src: "src/*.html",
        dest: "dist/"
    },
    partialsPath: {
        src: "src/partials/",
    },
    captainPath: {
        src: "src/captain-definition",
        dest: "dist/"
    }
};

/******** FUNCTIONS **********/
function cssFunction() {
    return gulp.src(paths.cssPath.src, { allowEmpty: true })
        .pipe(changed(paths.cssPath.dest))
        .pipe(gulp.dest(paths.cssPath.dest))
        .pipe(browserSync.stream());
};

function iconsFunction() {
    return gulp.src(paths.iconsPath.src, { allowEmpty: true })
        .pipe(changed(paths.iconsPath.dest))
        .pipe(gulp.dest(paths.iconsPath.dest))
        .pipe(browserSync.stream());
};

function imagesFunction() {
    return gulp.src(paths.imagesPath.src, { allowEmpty: true })
        .pipe(changed(paths.imagesPath.dest))
        .pipe(gulp.dest(paths.imagesPath.dest))
        .pipe(browserSync.stream());
};

function scriptsFunction() {
    var PARSE_INIT, i = process.argv.indexOf("--PARSE_INIT");
    if (i > -1) {
        PARSE_INIT = process.argv[i + 1];
        //console.log("OKTA_BASE_URL is "+OKTA_BASE_URL)
    } else { PARSE_INIT = '' }

    var PARSE_URL, i = process.argv.indexOf("--PARSE_URL");
    if (i > -1) {
        PARSE_URL = process.argv[i + 1];
    } else { PARSE_URL = '' }
    
    var API_BASE_URL, i = process.argv.indexOf("--API_BASE_URL");
    if (i > -1) {
        API_BASE_URL = process.argv[i + 1];
    } else { API_BASE_URL = '' }
    
    var API_END_POINT_TEMP_URL, i = process.argv.indexOf("--API_END_POINT_TEMP_URL");
    if (i > -1) {
        API_END_POINT_TEMP_URL = process.argv[i + 1];
    } else { API_END_POINT_TEMP_URL = '' }

    var API_END_POINT_FINVIZ, i = process.argv.indexOf("--API_END_POINT_FINVIZ");
    if (i > -1) {
        API_END_POINT_FINVIZ = process.argv[i + 1];
    } else { API_END_POINT_FINVIZ = '' }

    var API_END_POINT_TIMEZONE, i = process.argv.indexOf("--API_END_POINT_TIMEZONE");
    if (i > -1) {
        API_END_POINT_TIMEZONE = process.argv[i + 1];
    } else { API_END_POINT_TIMEZONE = '' }

    var PUBLIC_BASE_URL_B2, i = process.argv.indexOf("--PUBLIC_BASE_URL_B2");
    if (i > -1) {
        PUBLIC_BASE_URL_B2 = process.argv[i + 1];
    } else { PUBLIC_BASE_URL_B2 = '' }
    
    return gulp.src(paths.scriptsPath.src, { allowEmpty: true })
        .pipe(replace('PARSE_INIT', PARSE_INIT))
        .pipe(replace('PARSE_URL', PARSE_URL))
        .pipe(replace('API_BASE_URL', API_BASE_URL))
        .pipe(replace('API_END_POINT_TEMP_URL', API_END_POINT_TEMP_URL))
        .pipe(replace('API_END_POINT_FINVIZ', API_END_POINT_FINVIZ))
        .pipe(replace('API_END_POINT_TIMEZONE', API_END_POINT_TIMEZONE))
        .pipe(replace('PUBLIC_BASE_URL_B2', PUBLIC_BASE_URL_B2))
        .pipe(gulp.dest(paths.scriptsPath.dest))
        .pipe(browserSync.stream());
};

function viewsFunction() {
    return gulp.src(paths.viewsPath.src, { allowEmpty: true })
        //.pipe(changed(paths.viewsPath.dest))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: paths.partialsPath.src
        }))
        .pipe(gulp.dest(paths.viewsPath.dest))
        .pipe(browserSync.stream());
};

function captainFunction() {
    return gulp.src(paths.captainPath.src, { allowEmpty: true })
        .pipe(changed(paths.captainPath.dest))
        .pipe(gulp.dest(paths.captainPath.dest))
        .pipe(browserSync.stream());
};

function cleanDist() {
    return gulp.src('dist', { read: false }, { allowEmpty: true })
        .pipe(clean());
};


/******** WATCH **********/

// Gulp task to open the default web browser, serving static files
function browserInit() {
    browserSync.init({
        port: 3773,
        server: {
            baseDir: "dist",
            routes: {
                "/": "dist/",
                "/addNote": "dist/addNote.html",
                "/addScreenshot": "dist/addScreenshot.html",
                "/addTrades": "dist/addTrades.html",
                "/daily": "dist/daily.html",
                "/dashboard": "dist/dashboard.html",
                "/calendar": "dist/calendar.html",
                "/index": "dist/",
                "/notes": "dist/notes.html",
                "/register": "dist/register.html",
                "/screenshots": "dist/screenshots.html",
                "/videos": "dist/videos.html",
                "/playbook": "dist/playbook.html",
            }
        },
        open: true,
        notify: false,
        injectChanges: false
    });
};


function watch() {
    log("watching !!");
    gulp.watch(paths.cssPath.src, cssFunction);
    gulp.watch(paths.iconsPath.src, iconsFunction);
    gulp.watch(paths.imagesPath.src, imagesFunction);
    gulp.watch(paths.scriptsPath.src, scriptsFunction);
    gulp.watch(paths.viewsPath.src, viewsFunction);
    gulp.watch(paths.partialsPath.src, viewsFunction);
    gulp.watch(paths.captainPath.src, captainFunction);
}

/******** GULP *********/
var prod = gulp.parallel(cssFunction, iconsFunction, imagesFunction, scriptsFunction, viewsFunction, captainFunction);
var build = gulp.parallel(prod, watch, browserInit); //run prod is necessary in case clean has beed done before

gulp.task('default', build);
gulp.task('clean', cleanDist);
gulp.task('prod', prod); //prod ready folder