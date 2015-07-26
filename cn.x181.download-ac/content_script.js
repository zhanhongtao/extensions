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
  var next = document.querySelector('#mainControlNext');
  next.click();
}

sogouExplorer.extension.onRequest.addListener(function(request) {
  if (request.cmd === 'next') {
    donext();
  }
});

var timer;
var box = document.body;
var scrollTop = box.scrollTop;
function _scroll() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  box.scrollTop += 50;
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
    if (document.readyState == 'complate') {
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

// auto();
