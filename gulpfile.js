const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const change = require('gulp-changed');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const htmlMin = require('gulp-htmlmin');
const htmlReplace = require('gulp-html-replace');
const imagemin = require('gulp-imagemin');
const nunjucksRender = require('gulp-nunjucks-render');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const sequence = require('run-sequence');
const uglify = require('gulp-uglify');
const webpack = require('webpack-stream');

var config = {
  dist: 'build/',
  src: './build',
  cssin: 'src/css/**/*.css',
  jsin: 'src/js/**/*.js',
  imgin: 'src/img/**/*.{jpg,jpeg,png,gif}',
  htmlin: 'src/templates/*.html',
  nunjucksin: 'src/templates',
  // htmlin: 'src/templates/*.html',
  scssin: 'src/sass/**/*.scss',
  cssout: 'build/css/',
  jsout: 'build/js/',
  imgout: 'build/img/',
  htmlout: 'build/',
  scssout: 'src/css/',
  cssoutname: 'style.css',
  jsoutname: 'script.js',
  cssreplaceout: 'css/style.css',
  jsreplaceout: 'js/script.js'
};

gulp.task('serve', ['html', 'sass', 'css', 'js'], function () {
  browserSync.init({
    server: config.src
  });
  gulp.watch(config.htmlin, ['html']).on('change', browserSync.reload);
  gulp.watch(config.scssin, ['sass']);
  gulp.watch(config.cssin, ['css']).on('change', browserSync.reload);
  gulp.watch(config.jsin, ['js']).on('change', browserSync.reload);
});

gulp.task('sass', function () {
  return gulp.src(config.scssin)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 3 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.scssout))
    .pipe(browserSync.stream());
})

gulp.task('css', function () {
  return gulp.src(config.cssin)
    .pipe(concat(config.cssoutname))
    .pipe(cleanCSS())
    .pipe(gulp.dest(config.cssout));
});

// gulp.task('js', function () {
//   return gulp.src(config.jsin)
//     .pipe(babel({
//       presets: ['env']
//     }))
//     .pipe(concat(config.jsoutname))
//     // .pipe(uglify())
//     .pipe(gulp.dest(config.jsout));
// });

gulp.task('js', function() {
    gulp.src(config.jsin)
    .pipe(webpack({
      output: {
        filename: config.jsoutname
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['env']
              }
            }
          }
        ]
      },
      devtool: '#inline-source-map'
    }))
    .pipe(gulp.dest(config.jsout))
    .pipe(sourcemaps.init({ loadMaps: true }))
    // .pipe($.uglify())
    // .pipe($.rename('main.min.js'))
    // Output files
    // .pipe($.size({title: 'scripts'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.jsout))
    // .pipe(gulp.dest('.tmp/scripts'))
});

gulp.task('img', function () {
  return gulp.src(config.imgin)
    .pipe(change(config.imgout))
    .pipe(imagemin())
    .pipe(gulp.dest(config.imgout));
})

gulp.task('html', function () {
  return gulp.src(config.htmlin)
    .pipe(nunjucksRender({
      path: [config.nunjucksin]
    }))
    .pipe(htmlReplace({
      'css': config.cssreplaceout,
      'js': config.jsreplaceout
    }))
    .pipe(htmlMin({
      sortAttributes: true,
      sortClassName: true,
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(config.dist))
})

// gulp.task('html', function () {
//   return gulp.src(config.htmlin)
//     .pipe(nunjucksRender({
//       path: ['src/templates']
//     }))
//     .pipe(htmlReplace({
//       'css': config.cssreplaceout,
//       'js': config.jsreplaceout
//     }))
//     .pipe(htmlMin({
//       sortAttributes: true,
//       sortClassName: true,
//       collapseWhitespace: true
//     }))
//     .pipe(gulp.dest(config.dist))
// })

gulp.task('clean', function () {
  return del([config.dist]);
});

gulp.task('build', function () {
  sequence('clean', ['html', 'js', 'css', 'img']);
});

gulp.task('default', ['serve']);