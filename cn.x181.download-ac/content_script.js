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
var box = document.querySelector('#mainView') || document.body;
var docHeight = box.scrollHeight;
function _scroll() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  box.scrollTop += 20;
  var view = window.innerHeight;
  if (box.scrollTop + view < docHeight) {
    timer = setTimeout(function() {
      _scroll();
    }, 10);
  } else {
    var is = true;
    if (typeof checkScrollbar === 'function') {
      is = checkScrollbar();
    }
    if (is) {
      dox();
    } else{
      console.log('delay 1s');
      setTimeout(_scroll, 1000);
    }
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

function isvisible(node) {
  var viewport = node.getBoundingClientRect();
  if (viewport.top > 0 && viewport.top < window.innerHeight) {
    return true;
  };
  return false;
  // @todo
  // * opacity - 0
  // * display - none
  // * visibility - hidden
  // * clip
  // * scale(0)
  // * transform
  // * transform/backface
  // * z-index 小, 被覆盖
  // * 相对于上级元素, 不可见
  // * 不再可视区域内
  // * [hidden]
  // * height/width equal 0
  // * No visibile content
}
