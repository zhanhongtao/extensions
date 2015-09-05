
var list = [
  function(node) {
    return node.nodeName === 'IMG';
  }
];

function getURLByNode(node, url) {
  var dt = node.dataset;
  if (!dt) {
    return node.src;
  }
  return dt.original || dt.actualsrc || false;
}

function fixed(url) {
  if (/^\/\//i.test(url)) {
    url = 'http:' + url;
  }
  return url;
}

function filter(images, url) {
  images = [].slice.call(images);
  return images.filter(function(node) {
    return list.every(function(f) {
      return f(node);
    });
  }).reduce(function(ret, node) {
    var src = getURLByNode(node);
    if (src) {
      src = fixed(src);
      ret.push(src);
    }
    return ret;
  }, []);
}

function dox() {
  var images = document.querySelectorAll('.zm-item-answer img');
  var urls = filter(images);
  var dir = document.title;
  sogouExplorer.extension.sendRequest({
    cmd: 'download',
    dir: dir,
    src: urls
  });
}

function donext() {}

function throttle( func, wait ) {
  var timer;
  var previous = 0;
  var args;
  var context;
  var later = function() {
    previous = new Date();
    func.apply( context, args );
  };
  return function() {
    var now = new Date();
    if ( previous === 0 ) previous = new Date();
    args = arguments;
    context = this;
    var remaining = wait - ( now - previous );
    if ( remaining <= 0 ) {
      func.apply( this, arguments );
      timer = null;
      previous = now;
    }
    else if ( !timer ) {
      timer = setTimeout( later, remaining );
    }
  };
};

function checkScrollbar() {
  var node = document.querySelector('.zu-button-more');
  if (node && isvisible(node)) {
    node.click();
    return false;
  }
  var view = window.innerHeight;
  var docHeight = document.documentElement.scrollHeight;
  if (document.body.scrollTop + view < docHeight) {
    return false;
  }
  return true;
}

