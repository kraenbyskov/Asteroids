const gulp = require('gulp');
// Requires the gulp-sass plugin
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const pug = require('gulp-pug');

// Change path for the project here
const path = 'app';


// Jade/pug Compiler
gulp.task('pug',function() {
 return gulp.src(path+'/*.jade')
 // Error handler
 .pipe(plumber(plumberErrorHandler))
 .pipe(pug({
    doctype: 'html',
    pretty: true
 }))
 .pipe(gulp.dest(path))
 .pipe(browserSync.reload({
  stream: true
}))
});

// sass compiler
gulp.task('sass', function() {
  return gulp.src(path+'/sass/**/*.scss')
   // Error handler
    .pipe(plumber(plumberErrorHandler))
    .pipe(sass())
    .pipe(gulp.dest(path))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Error Message
let plumberErrorHandler = {
  errorHandler: notify.onError({
    title: 'Gulp',
    message: 'Error: <%= error.message %>'
  })
};

// refresh browser if anything changes
gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: path
    },
    // to run on localhost wordpress
    // proxy: "localhost/",
    // notify: false
  })
})

  // Watching if any changes happens
  gulp.task('watch', function (){
    gulp.watch(path+'/sass/**/*.scss',gulp.series('sass'));
    gulp.watch(path+'/**/*.jade', gulp.series('pug'));
    gulp.watch(path+'/**/*.pug', gulp.series('pug'));
    gulp.watch(path+'/js/*.js') .on('change', browserSync.reload); 
    gulp.watch(path+'/*.html') .on('change', browserSync.reload); 
    gulp.watch(path+'/*.css') .on('change', browserSync.reload); 
  });

// Default gulp task
gulp.task('default',
  gulp.series('sass','pug', gulp.parallel('watch', 'browserSync'), function() { 
  })
);


