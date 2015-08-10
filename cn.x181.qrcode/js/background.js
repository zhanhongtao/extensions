;(function() {

// 插件配置信息
var icon = './page.png';
var title = '生成当前标签页URL二维码';
var popup = './popup.html';
var size = {width: 205, height: 200};

function initPageAction(tabid) {
  sogouExplorer.pageAction.setIcon({
    tabId: tabid,
    path: icon
  });
  sogouExplorer.pageAction.setTitle({
    tabId: tabid,
    title: title
  });
  sogouExplorer.pageAction.setPopup({
    tabId: tabid,
    popup: popup,
    width: size.width,
    height: size.height
  });
}

function init() {
  sogouExplorer.tabs.onSelectionChanged.addListener(function(tid) {
    initPageAction(tid);
    sogouExplorer.pageAction.show(tid);
  });
  sogouExplorer.browserAction.setPopup({
    popup: popup,
    width: size.width,
    height: size.height
  });
}

init();

})();
