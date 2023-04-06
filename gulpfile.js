'use strict'

var gulp = require('gulp')
var browserSync = require('browser-sync').create()
var changed = require('gulp-changed')
var log = require('fancy-log')
var clean = require('gulp-clean')
var fileinclude = require('gulp-file-include')
var replace = require('gulp-replace')
var nodemon = require('gulp-nodemon');

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
    classesPath: {
        src: "src/requiredClasses.json",
        dest: "dist/"
    },
    swPath: {
        src: "src/sw.js",
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
    var PARSE_APP_ID, i = process.argv.indexOf("--PARSE_APP_ID");
    if (i > -1) {
        PARSE_APP_ID = process.argv[i + 1];
        //console.log("OKTA_BASE_URL is "+OKTA_BASE_URL)
    } else { PARSE_APP_ID = '' }

    var PARSE_URL, i = process.argv.indexOf("--PARSE_URL");
    if (i > -1) {
        PARSE_URL = process.argv[i + 1];
    } else { PARSE_URL = '' }
    
    
    return gulp.src(paths.scriptsPath.src, { allowEmpty: true })
        .pipe(replace('PARSE_APP_ID', PARSE_APP_ID))
        .pipe(replace('PARSE_URL', PARSE_URL))
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

function classesFunction() {
    return gulp.src(paths.classesPath.src, { allowEmpty: true })
        .pipe(changed(paths.classesPath.dest))
        .pipe(gulp.dest(paths.classesPath.dest))
        .pipe(browserSync.stream());
};

function swFunction() {
    return gulp.src(paths.swPath.src, { allowEmpty: true })
        .pipe(changed(paths.swPath.dest))
        .pipe(gulp.dest(paths.swPath.dest))
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



function nodemonServerInit(done) {
    //livereload.listen();
    nodemon({
            script: 'index.js',
            watch: ['index.js', paths.routesPath],
        })
        .on('start', function() {
            console.log("starting nodemon")
        })
        .on('stop', function() {
            console.log("stoping nodemon")
        })
        .on('change', function() {
            console.log("changing nodemon")
        });
};


function browserInit(done) {
        browserSync.init({
            proxy: 'localhost:7777', //c'est le port qui est sur server.js
            open: true,
            notify: false,
            port: 8083, //c'est le port de browsersync, qui doit être différent du server.jsis
            reloadDelay: 1000
        })
}


function watch() {
    log("watching !!");
    gulp.watch(paths.cssPath.src, cssFunction);
    gulp.watch(paths.iconsPath.src, iconsFunction);
    gulp.watch(paths.imagesPath.src, imagesFunction);
    gulp.watch(paths.scriptsPath.src, scriptsFunction);
    gulp.watch(paths.viewsPath.src, viewsFunction);
    //gulp.watch(paths.classesPath.src, classesFunction);
    //gulp.watch(paths.swPath.src, swFunction);
    gulp.watch(paths.partialsPath.src, viewsFunction);
    gulp.watch(paths.captainPath.src, captainFunction);
}

/******** GULP *********/
var prod = gulp.parallel(cssFunction, iconsFunction, imagesFunction, scriptsFunction, viewsFunction, /*classesFunction, swFunction,*/ captainFunction);
var build = gulp.parallel(prod, watch, nodemonServerInit, browserInit); //run prod is necessary in case clean has beed done before

gulp.task('default', build);
gulp.task('clean', cleanDist);
gulp.task('prod', prod); //prod ready folder