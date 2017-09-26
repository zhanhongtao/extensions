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

sogouExplorer.webRequest.onResponseStarted.addListener(function(detail) {
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
