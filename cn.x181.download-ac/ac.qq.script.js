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
  }, function() {  
    // @NOTE: test response
    var next = document.querySelector('#mainControlNext');
    next.click();
  });
}

