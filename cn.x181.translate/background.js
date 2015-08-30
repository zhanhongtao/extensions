;(function() {
  // chrome tools.
  // https://chrome.google.com/webstore/detail/fjccknnhdnkbanjilpjddjhmkghmachn

  chrome = typeof chrome === 'undefined' ? sogouExplorer : chrome;

  function callback(clickData, tab) {
    var id = clickData.menuItemId;
    if (menuMap[id]) {
      var key = menuMap[id].key;
      var text = clickData[key];
      chrome.tabs.create({
        index: tab.index + 1,
        // http://zh.wikipedia.org/wiki/
        url: menuMap[id].url.replace(/\{keyword\}/ig, encodeURIComponent(text)),
        active: true
      });
    }
  }

  var contexts = {
    "translate": {
      context: 'selection',
      title: '使用百度翻译翻译',
      key: 'selectionText',
      url: 'http://fanyi.baidu.com/translate#auto/auto/{keyword}'
    }
  };

  var menuMap = {};

  function bindContextMenu() {
    var curContext;
    var context;
    var title;
    var id;
    var contextIDIndex = 1;
    for ( var key in contexts ) {
      if ( contexts.hasOwnProperty(key) ) {
        curContext = contexts[key];
        title = curContext.title;
        context = curContext.context;
        id = chrome.contextMenus.create({
          title: title,
          contexts: [ context ],
          // event page 不支持 onclick 参数.
          // 需要使用 chrome.contextMenus.onClick 绑定.
          onclick: callback
        });
        menuMap[id] = curContext;
      }
    }
  }

  if ( chrome.runtime && chrome.onInstalled ) {
    // 安装时, 生成右键菜单..
    chrome.runtime.onInstalled.addListener(function( details ) {
      bindContextMenu();
    });
  }
  else {
    bindContextMenu();
  }
})();

