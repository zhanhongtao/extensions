;(function() {

var downloader = document.getElementById("picdownloader");

function download(url, path, callback) {
  if (typeof callback !== 'function') callback = function() {};
  downloader.download(url, path, function() {
    callback(null, url);
  });
}

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

// @TODO: 支持设定下载目录
var path = 'D:\\download\\';
var match = 'http://ac.qq.com/';
var cache = {
  // tabid: {isauto: true}
};

function todo(dir, list, done) {
  queue(list, function(src, index, next) {
    save = path + dir + '\\' + index + '.jpg';
    download(src, save, function() {
      next();
    });
  }, function() {
    done();
  });
}

function reset(tid) {
  if (cache[tid]) {
    delete cache[tid];
  }
}

// 侧边栏按钮只针对当前标签页有效.
sogouExplorer.sidebarAction.onClicked.addListener(function() {
  sogouExplorer.tabs.getSelected(function(tab) {
    var url = tab.url;
    var tid = tab.id;
    if (url.indexOf(match) == 0) {
      var config = cache[tid] = cache[tid] || {isauto: false};
      if (config.isauto) {
        config.isauto = !config.isauto;
      } else {
        sogouExplorer.tabs.sendRequest(tid, {
          cmd: 'do'
        });
      }
    } else {
      sogouExplorer.tabs.create({
        'active': true,
        'selected': true,
        'coreType': 'Webkit',
        'url': match
      });
    }
  });
});

// 关闭标签/窗口时
sogouExplorer.tabs.onRemoved.addListener(function(tid) {
  reset(tid);
});

// 标签页被更新时
sogouExplorer.tabs.onUpdated.addListener(function(tid, info, tab) {
  var url = tab.url;
  // 切换到其它域
  if (url.indexOf(match) != 0) {
    reset(tid);
  }
});

// 事件侦听器
sogouExplorer.extension.onRequest.addListener(function(request, sender, response) {
  var cmd = request.cmd;
  var tab = sender.tab;
  var tid = tab.id;
  var config = cache[tid] = cache[tid] || {isauto: false};
  switch(cmd) {
    // 开始下载
    case 'download':
      todo(request.dir, request.src, function() {
        var _cmd = config.isauto ? 'next' : 'confirm';
        sogouExplorer.tabs.sendRequest(tid, {
          cmd: _cmd
        });
      });
      break;
    // 设置自动项
    case 'setauto':
      config.isauto = request.data;
      sogouExplorer.tabs.sendRequest(tid, {
        cmd: 'next'
      });
      break;
    // 判定是否自动加载
    case 'isauto':
      if (config.isauto && tab.url === config.next) {
        sogouExplorer.tabs.sendRequest(tid, {cmd: 'do'});
      } else {
        // 用户手动切换到其它页面
        reset(tid);
      }
      break;
    case 'nextpage':
      var url = request.data;
      if (url.indexOf('http') === 0) {
        config.next = request.data;
      } else {
        // 最后一话
        reset(tid);
      }
      response();
      break;
    default:
      break;
  }
});

})();

