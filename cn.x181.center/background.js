var csstext = 'body {text-align: center; background-color: rgba(0, 0, 0, 0.8); display: flex; align-items: center;justify-content: center;}';

var cache = {};

sogouExplorer.tabs.onUpdated.addListener(function(tabid, update, tab) {
  if (update.status === 'complete') {
    if (cache[tabid]) {
      insert(tabid);
    }
  }
});

sogouExplorer.tabs.onRemoved.addListener(function(tabid) {
  delete cache[tabid];
});

function insert(tid) {
  sogouExplorer.tabs.insertCSS(tid, {
    code: csstext
  }, function() {
    delete cache[tid];
  });
}

function updateCache(tid, status) {
  cache[tid] = status;
}

function handle(url) {
  sogouExplorer.tabs.query({
    url: url
  }, function(tabs) {
    tabs.forEach(function(tab) {
      updateCache(tab.id, 1);
    });
  });
}

/*
  多个扩展情况下,
  * 其中一个扩展 block 请求, 其他扩展会接到 onErrorOccurred 通知
  * 同一时间, 只能有一个请求修改. 即: 存在竞争关系, 后处理的直接忽略.

  onBeforeRequest -> before TCP
  onBeforeSendHeaders -> can modify
  onBeforeSendHeaders -> only notify
  onHeadersReceived
  onAuthRequired
  onBeforeRedirect
  onResponseStarted
  onCompleted
  onErrorOccurred

  权限：
  webRequest
  webRequestBlocking

  ['blocking', 'requestHeaders']

  RequestFilter:
  urls: []  URL 列表/pattern
  types: "main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", or "other"
  tabId: 可选
  windowId: 可选

  blockingResponse:
  {
    cancel: 可用在 onBeforeRequest
    redirectUrl:
    requestHeaders:
    responseHeaders:
    authCredentials
  }
*/

sogouExplorer.webRequest.onBeforeRequest.addListener(function(detail) {
  console.log('onBeforeRequest:', detail);
  return {
    cancel: false
  }
}, {
  urls: ['<all_urls>']
}, [
  'blocking',
  'requestBody'
]);

sogouExplorer.webRequest.onBeforeSendHeaders.addListener(function(detail) {
  console.log('onBeforeSendHeaders:', detail);
  return {
    cancel: false
  }
}, {
  urls: ['<all_urls>']
}, [
  'requestHeaders',
  'blocking'
]);

sogouExplorer.webRequest.onSendHeaders.addListener(function(detail) {
  console.log('onSendHeaders:', detail);
}, {
  urls: ['<all_urls>']
}, ['requestHeaders']);

sogouExplorer.webRequest.onHeadersReceived.addListener(function(detail) {
  console.log(detail);
  return {
    cancel: false
  }
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
}, [
  'blocking',
  'responseHeaders'
]);

sogouExplorer.webRequest.onAuthRequired.addListener(function(detail) {
  console.log('onAuthRequired:', detail);
  return {cancel: false};
}, {
  urls: ['<all_urls']
}, [
  'responseHeaders',
  'blocking',
  'asyncBlocking'
]);

sogouExplorer.webRequest.onBeforeRedirect.addListener(function(detail) {
  console.log('onBeforeRedirect:', detail);
}, {
  urls: ['<all_urls']
}, ['responseHeaders']);

sogouExplorer.webRequest.onResponseStarted.addListener(function(detail) {
  console.log('onResponseStarted:', detail);
  var headers = detail.responseHeaders;
  headers.some(function(header) {
    if (header.name.toLowerCase() === 'content-type') {
      if (header.value) {
        if (/^image\/.*/i.test(header.value)) {
          if (detail.tabId != -1) {
            updateCache(detail.tabId, 1);
          } else {
            handle(detail.url);
          }
        } else {
          delete cache[detail.tabId];
        }
      }
    }
  })
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
}, ['responseHeaders']);

sogouExplorer.webRequest.onCompleted.addListener(function(detail) {
  console.log('onCompleted:', detail);
}, {
  urls: ['<all_urls>']
}, ['responseHeaders']);
