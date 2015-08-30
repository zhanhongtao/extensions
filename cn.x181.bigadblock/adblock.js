
// 白名单策略.
// 支持正则表达式/字符串/函数
var whiteURLList = [
  /jsfiddle\.net/
];

// @todo:
// 在 background 页面配合 webRequest 实现真正广告过滤
// 规则函数列表
var regulars = [
  // 纯透明元素
  // @NOTE: 存在元素从 0/block 动画到 1/block; -- 添加白名单策略.
  function(element) {
    var opacity = css( element, 'opacity' );
    var display = css( element, 'display' );
    return opacity === '0' && display != 'none';
  },
  // 下角 z-index 很高的元素
  function(element) {
    var position = css( element, 'position' );
    var bottom = css( element, 'bottom' );
    var right = css( element, 'right' );
    var left = css( element, 'left' );
    var zIndex = ~~css( element, 'z-index' );
    var width = ~~css( element, 'width' );
    var height = ~~css( element, 'height' );
    var html = document.documentElement;
    var bigsize = width >= html.clientWidth || height >= html.clientHeight;
    var adlite = ( position == 'fixed' || position == 'absolute' ) &&
        ( fix(bottom) < 10 && (fix(left) < 10 || fix(right) < 10) ) &&
        zIndex >= 100;
    return bigsize || adlite;
  }
];

function fix(a, def) {
  return (a==''||a=='auto') ? (def||100) : ~~def;
}

function type(s) {
  return Object.prototype.toString.call(s).slice(8, -1).toLowerCase();
}

function css( element, property, pseudoclass ) {
  var style = window.getComputedStyle( element, pseudoclass || null );
  return style[ property ];
}

// 大广告处理方式
function hide( element ) {
  if ( element ) {
    try {
      element.style.display = 'none';
    } catch(e) {
      console.log( e );
    }
  }
}

function filter( elements, regulars, handler ) {
  var i = 0, l = elements.length;
  for ( ; i < l; ++i ) {
    if (
      regulars.some(function(regular) {
        return regular(elements[i]);
      })
    ) {
      handler( elements[i] );
    }
  }
}

// 只过滤 3 层级.
function man( elements, layer, cache ) {
  layer = layer || 1;
  if ( layer > cache.layer ) {
    return;
  }
  // 深度优先.
  for ( var i = 0, l = elements.length; i < l; ++i ) {
    var element = elements[i];
    var children = element.children;
    if ( children.length ) {
      filter( children, regulars, function( element ) {
        hide( element );
        ++cache.ad;
      });
    }
    man( children, layer + 1, cache );
  }
  if ( layer <= 1 ) {
    ++cache.count;
    if ( cache.count < cache.max ) {
      setTimeout(function(){
        man( elements, layer, cache );
      }, cache.delay);
    }
  }
}

function walkDOMTreeByDeep( root, conf ) {

}

function walkDOMTreeByBreadth( root, conf ) {
  var stack;
  var push = Array.prototype.push;
  var noop = function(){};
  var type = function(s){ 
    return Object.prototype.toString.call( s ).slice( 8, -1 ).toLowerCase();
  };
  var tag = {};
  conf = type(conf) == 'object' ? conf : {handle: noop,layer: 0};
  if ( type(root) == 'array' ) stack = root;
  else stack = [ root ];
  while ( stack.length > 0 ) {
    var current = stack.shift();
    if ( current === tag ) {
      ++conf.layer;
    }
    else {
      if (type(conf.handle) == 'function') {
        conf.handle( current );
      }
      var children = current.children;
      if ( children.length ) {
        stack.push( tag );
        push.apply( stack, children );
      }    
    }
  }
  if ( type(conf.complete) == 'function' ) {
    conf.complete();
  }
}

function init() {
  man(
    document.getElementsByTagName('body'),
    1,
    {
      count: 0,
      ad: 0,
      // 最大尝试次数
      max: 10,
      // 每次尝试前延时
      delay: 200,
      // 只查找3层
      layer: 3
    }
  );
}

var domain = document.domain;
var disabled = whiteURLList.some(function( regular ) {
  switch( type(regular) ) {
    case 'string':
      return regular.indexOf(domain) > -1;
      break;
    case 'regexp':
      return regular.test( domain );
      break;
    case 'function':
      return regular( domain, location.href );
    default:
      break;
  }
});

if ( !disabled ) {
  if ( document.readyState == 'complete' ) {
    init();
  } else init();
}