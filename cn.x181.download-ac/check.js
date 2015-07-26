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
var base = 'd:\\download';
function check(base) {
  fs.readdir(base, function(error, files) {
    if (error) return console.log(base);
    queue(files, function(file, index, next) {
      var _file = path.resolve(base, file);
      fs.stat(_file, function(error, stat) {
        if (error) return console.log('!!stat:', _file);
        if (stat.isDirectory()) {
          fs.readdir(_file, function(error, files) {
            if (error) return console.log('error:', _file);
            if (files.length < 12) {
              fail.push(files.length + '    ' + _file);
            } else {
              done.push(files.length + '    ' + _file);
            }
            next();
          })
        }        
      });
    }, function() {
      var _fail = path.resolve('d:\\error.txt');
      var _done = path.resolve('d:\\done.txt');
      fs.writeFileSync(_fail, fail.join('\n'), {encoding: 'utf8'});
      fs.writeFileSync(_done, done.join('\n'), {encoding: 'utf8'});
    });
  });
}
check(base);

