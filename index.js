/**
  @TODO:
  * 代码检查
*/

// node
var path = require('path');
var util = require('util');
var fs = require('fs');

// define
var _util = require('./utils.js');
Object.keys(_util).forEach(function(key) {
  util[key] = _util[key];
});

// third
var del = require('del');
var minifyhtml = require('gulp-minify-html');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var fontspider = require('gulp-font-spider');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var zip = require('gulp-zip');
var replace = require('gulp-replace');
var jsonediter = require('gulp-json-editor');
var xmlparser = require('xml-parser');

/*!
  task - Config + Task
*/
exports.task = function(gulp, config) {
  var input = config.input;
  var output = path.join(input, './release');

  // 清理旧文件
  // 清理 ./release 目录

  // @TODO.
  // 检测工作.
  // 插件必须存在 id 和 version 信息.
  gulp.task('check', function() {

  });

  // @NOTE:
  // 简单 Replace 操作.
  // 可能会出现异常.
  gulp.task('manifest-xml', function() {
    return gulp.src('./manifest.xml', {cwd: input})
      .pipe( replace(/<version>([^<]*?)<\/version\>/i, function(match, v) {
        config.version = v = util.updateBuildVersion(v);
        return '<version>' + v + '</version>';
      }))
      .pipe(gulp.dest(input))
      .pipe(gulp.dest(output));
  });

  gulp.task('manifest-json', function() {
    return gulp.src('./manifest.json', {cwd: input})
      .pipe(jsonediter(function(json) {
        json.version = util.updateBuildVersion(json.version);
        return json;
      }))
      .pipe(gulp.dest(input))
      .pipe(gulp.dest(output));
  });

  // 更新版本号
  // xml/json 两种格式
  gulp.task('version', ['manifest-xml', 'manifest-json']);

  // Copy 其它资源
  // @TODO: 支持 webp 格式资源
  gulp.task('copy', function() {
    var files = config.files.slice(0);
    [].push.apply(files, [
      '!./**/*.html',
      '!./**/*.css',
      '!./**/*.js',
      '!./images/**/*.png',
      '!./images/**/*.gif',
      '!./images/**/*.jpg',
      '!./images/**/*.jpeg'
    ]);
    return gulp.src(files, {cwd: input})
      .pipe(gulp.dest(output));
  });

  // font-spider
  // compress-html
  gulp.task('html', function() {
    var options= {};
    var defaultOptions = {
      quotes: true,
      conditionals: true,
      empty: true
    };
    util.mixin(options, defaultOptions);
    util.mixin(options, config.html || {});
    var files = config.files.reduce(function(ret, file) {
      return file[0] === '!' && ret.push(file), ret;
    }, ['./**/*.html']);
    return gulp.src(files, {cwd: input})
      .pipe(fontspider())
      .pipe(minifyhtml(options))
      .pipe(gulp.dest(output));
  });

  // compress-css
  gulp.task('css', function() {
    var options = {};
    var defaultOptions = {keepBreaks: true};
    util.mixin(options, defaultOptions);
    util.mixin(options, config.css || {});
    var files = config.files.reduce(function(ret, file) {
      return file[0] === '!' && ret.push(file), ret;
    }, ['./**/*.css']);
    return gulp.src(files, {cwd: input})
      .pipe(minifycss(options))
      // .pipe(rev())
      .pipe(gulp.dest(output));
  });

  // uglifyjs
  gulp.task('js', function() {
    var defaultOptions = {
      mangle: true,
      // http://lisperator.net/uglifyjs/compress
      compress: {
        global_defs: {
          DEBUG: false
        }
      },
      // http://lisperator.net/uglifyjs/codegen
      output: {},
      preserveComments: 'some'
    }, options = {};
    util.mixin(options, defaultOptions);
    util.mixin(options, config.javascript || {});
    var files = config.files.reduce(function(ret, file) {
      return file[0] === '!' && ret.push(file), ret;
    }, ['./**/*.js']);
    return gulp.src(files, {cwd: input})
      .pipe(uglify(options))
      // .pipe(rev())
      .pipe(gulp.dest(output));
  });

  // imagemin
  gulp.task('image', function() {
    var files = config.files.reduce(function(ret, file) {
      return file[0] === '!' && ret.push(file), ret;
    }, [
      './images/**/*.png',
      './images/**/*.jpeg',
      './images/**/*.jpg',
      './images/**/*.gif'
    ]);
    return gulp.src(files, {cwd: input})
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false
        }],
        use: [
          pngquant()
        ]
      }))
      // .pipe(rev())
      .pipe(gulp.dest(output));
  });

  // build.
  gulp.task('_build', ['version', 'html', 'css', 'js', 'image', 'copy']);

  // sext
  gulp.task('tosext', ['_build'], function() {
    var json = path.resolve(input, './manifest.json');
    var isExist = fs.existsSync(json);
    var manifest = {}, name;
    if (isExist) {
      manifest = require(json);
    } else {
      var xml = path.resolve(input, './manifest.xml');
      var xmlstring = fs.readFileSync(xml, {encoding: 'utf8'});
      var json = xmlparser(xmlstring);
      var root = json.root;
      var count = 2;
      root.children.some(function(item) {
        var name = item.name;
        switch(name) {
          case 'id':
            manifest.id = item.content;
            --count;
            break;
          case 'version':
            manifest.version = item.content;
            --count;
            break;
        }
        if (!count) {
          return true;
        }
      });
    }
    name = manifest.id + '-' + manifest.version;
    return gulp.src(config.files, {cwd: output})
      .pipe( zip(name + '.sext') )
      .pipe( gulp.dest(input) );
  });

  // ms2e
  gulp.task('toms2e', ['_build'], function() {
    var json = path.resolve(input, './manifest.json');
    var manifest = require(json);
    var name = manifest.id;
    var dest = path.resolve(input, name + '.ms2e');
    return gulp.src('./**/*', {cwd: output})
      .pipe(gulp.dest(dest));
  });

  gulp.task('build-pc', ['tosext'], function(cb) {
    del([output], cb);
  });

  gulp.task('build-mb', ['toms2e'], function(cb) {
    del([output], cb);
  });

  // 开发环境
  gulp.task('_dev', function() {
    return gulp.src('./**/*', {cwd: input})
      .pipe(zip('./build.sext'))
      .pipe(gulp.dest(input));
  });
};

