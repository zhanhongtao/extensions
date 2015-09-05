var searchEngine = localStorage['engine'] || 'sogou';
var regularList = [
  function(url) {
    return [
      searchEngine === 'sogou' && /^https?:\/\/(?:www\.)?sogou\.com/i.test(url),
      searchEngine === 'google' && /^https?:\/\/(?:www\.)?google\.com/i.test(url)
    ].some(function(v) {
      return v;
    });
  },
  function( url ) {
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

function gotosogou( id, keywords ) {
  chrome.tabs.update( id, {
    url: urls[searchEngine].replace( '{keyword}', (keywords || '') ),
    active: true,
    selected: true
  });
}

function checkSearchURL( tab ) {
  var url = tab.url;
  var id = tab.id;
  var keyword = '';
  if ( url ) {
    for ( var i = 0, l = regularList.length; i < l; ++i ) {
      var regular = regularList[i];
      keyword = regular(url);
      // @note: 已经在 sogou 页面
      if ( keyword === true ) {
        return;
      }
      if ( keyword ) {
        break;
      }
    }
  }
  return gotosogou( id, keyword );
}

function init() {
  chrome.tabs.getSelected(function( tab ) {
    checkSearchURL( tab );
  });
}

chrome.browserAction.onClicked.addListener( init );
try {
  sogouExplorer.sidebarAction.onClicked.addListener( init );
} catch(e) {
  console.log( e );
}

