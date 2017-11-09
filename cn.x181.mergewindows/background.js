function queue( list, fn, callback, index, ret ) {
  "use strict";
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
  }
  else if ( callback ) {
    callback.apply( null, ret );
  }
}

function mergeWindows() {
  sogouExplorer.windows.getAll(function (windows) {
    var c = windows[0]
    var focused = windows.filter(function (w) {
      return w.focused
    })
    if (focused.length) {
      c = focused[0]
    }
    var winid = c.id
    var index = c.tabs.length
    var tabs = []
    windows.forEach(function(w) {
      if (w.id !== winid) {
        [].push.apply(tabs, w.tabs)
      }
    })
    queue(tabs, function (tab, delta, next) {
      sogouExplorer.tabs.move(tab.id, {
        windowId: winid,
        index: index + delta
      }, function () {
        next()
      })
    }, function () {
      console.log('Done')
    })
  })
}

sogouExplorer.browserAction.onClicked.addListener(mergeWindows)
