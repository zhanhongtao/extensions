var regularList = [
  function(url, item) {
    return item.regexp.test(url);
  },
  function(url) {
    var searchSitesList = [
      [ /^https?:\/\/(?:www\.)?baidu\.com/, /[\?&#]wd=([^&#]+)/ ],
      [ /^https?:\/\/(?:www\.)?baidu\.com/, /[\?&#]word=([^&#]+)/ ],
      [ /^https?:\/\/(?:www\.)?so\.com/, /[\?&#]q=([^&#]+)/ ],
      [ /^https?:\/\/(?:www\.)?haosou\.com/, /[\?&#]q=([^&#]+)/ ],
      [ /^https?:\/\/(?:www\.)?google\.com/, /[\?&#]q=([^&#]+)/ ],
      [ /^https?:\/\/(?:www\.)?bing\.com/, /[\?&#]q=([^&#]+)/ ],
      [ /^https?:\/\/((?:www|cn)\.)?bing\.com/, /[\?&#]q=([^&#]+)/ ],
      [ /^https?:\/\/(?:www\.)?sogou\.com/, /[\?&#]query=([^&#]+)/ ]
    ];
    var keyword;
    for ( var i = 0, l = searchSitesList.length; i < l; ++i ) {
      var regexpList = searchSitesList[i];
      if ( regexpList[0].test(url) ) {
        url.replace( regexpList[1], function( match, $1, $2 ) {
          keyword = $1;
        });
        if ( keyword ) {
          break;
        }
      }
    }
    return keyword;
  }
];

function create(id, url, keywords) {
  chrome.tabs.update(id, {
    url: url.replace('{keyword}', (keywords || '')),
    active: true,
    selected: true
  });
}

function gotonow(item, tab) {
  var url = tab.url;
  var keyword = '';
  if (url) {
    for (var i = 0, l = regularList.length; i < l; ++i) {
      keyword = regularList[i](url, item);
      if (keyword === true) {
        return;
      }
      if (keyword) {
        break;
      }
    }
  }
  return create(tab.id, item.url, keyword);
}

var list = [
  {
    type: 'sogou', 
    title: '搜狗', 
    url: 'https://www.sogou.com/sie?ie=utf8&query={keyword}', 
    regexp: /^https?:\/\/(www\.)?sogou\.com\//i,
    default: true
  },
  {
    type: 'google', 
    title: 'Google', 
    url: 'https://www.google.com/?gws_rd=cr,ssl#safe=strict&q={keyword}',
    regexp: /^https?:\/\/(www\.)?google\.com/i
  },
  {
    type: 'baidu', 
    title: '百度', 
    url: 'https://www.baidu.com/s?wd={keyword}',
    regexp: /^https?:\/\/(www\.)?baidu\.com\//i
  },
  {
    type: 'bing', 
    title: 'Bing', 
    url: 'http://cn.bing.com/search?q={keyword}',
    regexp: /^https?:\/\/(www\.|cn\.)?bing\.com\//i
  },
  {
    type: 'so', 
    title: '好搜', 
    url: 'http://www.haosou.com/s?ie=utf-8&q={keyword}',
    regexp: /^https?:\/\/(www\.)?(haosou|so)\.com\//i
  }
];

list.reverse().forEach(function(item) {
  sogouExplorer.contextMenus.create({
    type: 'normal',
    title: item.title,
    contexts: ['all'],
    onclick: function(info, tab) {
      gotonow(item, tab);
    }
  }, function() {});
});

sogouExplorer.browserAction.onClicked.addListener(function() {
  var defaultEngine = list[0];
  var item = list.filter(function(item) {
    return item.default === true;
  });
  if (item.length) {
    defaultEngine = item[0];
  }
  sogouExplorer.tabs.create({
    active: true,
    selected: true,
    url: defaultEngine.url.replace(/\{keyword\}/i, '')
  });
});

