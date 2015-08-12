var queue = function queue( list, fn, callback, index, ret ) {
  index = index || 0;
  ret = ret || [];
  var next = function ( value, stop, returnCurrentValue ) {
    ret[ ret.length ] = value;
    if ( stop ) {
      return callback.apply( null, returnCurrentValue ? [value] : ret );
    }
    queue( list, fn, callback, ++index, ret );
  };
  if ( index < list.length ) {
    var argus = [ list[ index ], index, ret ];
    if ( fn.length ) {
      argus = argus.slice( 0, fn.length - 1 );
    }
    argus.push( next );
    fn.apply( null, argus );
  } else if ( callback ) {
    callback.apply( null, [index] );
  }
};

var done = [];
var fail = [];
var fs = require('fs');
var path = require('path');
var base = './do';
base = 'd:\\download\\';
function check(base) {
  fs.readdir(base, function(error, files) {
    if (error) {
      return console.log('Read base path error!');
    }
    queue(files, function(file, index, next) {
      var folder = path.resolve(base, file);
      fs.stat(folder, function(error, stat) {
        if (error) {
          console.log('Read Directory error!:', folder);
          return next();
        }
        var is = stat.isDirectory();
        if (!is) {
          console.log('only read Directory.', folder);
          return next();
        } else {
          fs.readdir(folder, function(error, files) {
            if (error) {
              console.log('error:', folder);
              return next();
            }
            if (files.length < 12) {
              fail.push(folder + '  < 12' + files.length);
              return next();
            } else {
              // fixed sort!
              files.sort(function(a, b) {
                var x = parseInt(a), y = parseInt(b);
                if (isNaN(x)) { x = -1; }
                if (isNaN(y)) { y = -1; }
                return x > y ? 1 : -1;
              });
              var l = files.length;
              queue(files, function(file, index, next) {
                var f = path.resolve(folder, file);
                fs.stat(f, function(error, stat) {
                  if (error) {
                    console.log('file state error.', f);
                    return next();
                  }
                  if (stat.size > 60 * 1024) {
                    done.push(f + ' ' + stat.size);
                  } else if (index + 2 < l && index > 2) {
                    fail.push(f + ' file size error ' + stat.size);
                  }
                  next();
                });
              }, function() {
                next();
              });
            }
          });
        }        
      });
    }, function() {
      var _fail = path.resolve('./error.txt');
      var _done = path.resolve('./done.txt');
      fs.writeFileSync(_fail, fail.join('\n'), {encoding: 'utf8'});
      fs.writeFileSync(_done, done.join('\n'), {encoding: 'utf8'});
    });
  });
}
check(base);

