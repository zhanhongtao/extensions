function dox() {
  // 取图片资源
  var wrap = document.querySelector('#comicContain');
  var images = wrap.querySelectorAll('img');
  var list = [].slice.call(images, 0).filter(function(node) {
    // 过滤两个广告
    if (node.id && node.id.indexOf('ad') > -1) {
      return false;
    }
    return true;
  }).map(function(node) {
    return node.src;
  });
  // 取目录名称
  var dir = document.querySelector('.title-comicHeading').textContent;
  sogouExplorer.extension.sendRequest({
    cmd: 'download',
    dir: dir,
    src: list
  });
}

// 下一画
function donext() {
  var nextPage = document.querySelector('#nextChapter');
  sogouExplorer.extension.sendRequest({
    cmd: 'nextpage',
    data: nextPage.href
  },
  // @NOTE: test response
  function() {
    var next = document.querySelector('#mainControlNext');
    next.click();
  });
}

sogouExplorer.extension.onRequest.addListener(function(request) {
  switch(request.cmd) {
    case 'next':
      donext();
      break;
    case 'confirm':
      var isauto = confirm('是否自动下载后续章节(已出)?');
      if (isauto) {
        sogouExplorer.extension.sendRequest({
          cmd: 'setauto',
          data: true
        });
      }
      break;
    case 'do':
      auto();
      break;
    case 'select':
      var use = confirm('是否更改保存的目录?(默认 C:/download)');
      if (use) {
        sogouExplorer.extension.sendRequest({
          cmd: 'select'
        });
      } else {
        auto();
      }
      break;
    default:
      break;
  }
});

var timer;
var box = document.body;
function _scroll() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  box.scrollTop += 20;
  var view = window.innerHeight;
  var docHeight = document.documentElement.scrollHeight;
  if (box.scrollTop + view < docHeight) {
    timer = setTimeout(function() {
      _scroll();
    }, 10);
  } else {
    dox();
  }
}

function auto() {
  if (window == top) {
    if (document.readyState == 'complete') {
      _scroll();
    } else {
      document.onreadystatechange = function(e) {
        if (this.readyState == 'complete') {
          _scroll();
          this.onreadystatechange = null;
        }
      };
    }
  }
}

sogouExplorer.extension.sendRequest({
  cmd: 'isauto'
});

