var code = window.localStorage.code
var timer

function showMessage (message, time) {
  chrome.browserAction.setBadgeText({
    text: message
  })
  if (timer) clearTimeout(timer)
  timer = setTimeout(function () {
    chrome.browserAction.setBadgeText({
      text: ''
    })
  }, time * 1000)
}

function ping (title, url, tags) {
  showMessage('ping', 30)
  var dfd = new $.Deferred()
  $.ajax({
    url: 'http://x181.cn/bookmarks/api.php?action=collect',
    dataType: 'json',
    method: 'POST',
    data: {
      code: code,
      title: title,
      url: url,
      tags: tags
    }
  }).done(function () {
    showMessage('ok', 1.5)
    dfd.resolve()
  }).fail(function () {
    showMessage('e', 1.5)
    dfd.reject()
  })
  return dfd.promise()
}

function collectit (tab, force) {
  if (code || force) {
    chrome.tabs.sendMessage(tab.id, {'cmd': 'collect-tags'}, function (tags) {
      ping(tab.title, tab.url, tags)
    })
  } else {
    chrome.tabs.sendMessage(tab.id, {'cmd': 'collect-code'}, function (user) {
      if (user != null) {
        user = String(user).trim()
        if (user) {
          code = window.localStorage.code = user
        }
      }
      collectit(tab, true)
    })
  }
}

chrome.browserAction.onClicked.addListener(function () {
  chrome.tabs.query({
    active: true
  }, function (tabs) {
    collectit(tabs[0])
  })
})

chrome.contextMenus.create({
  type: 'normal',
  title: '觉得还不错',
  contexts: ['all'],
  onclick: function (info, tab) {
    collectit(tab)
  }
}, function () { })
