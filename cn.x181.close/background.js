
var id = 'help'
var link = document.createElement('a')
link.id = id
document.body.appendChild(link)

function getDomainByURL (url) {
  link.href = url
  return link.hostname
}

function closetabs (tab) {
  var domain = getDomainByURL(tab.url)
  sogouExplorer.windows.getCurrent(function (win) {
    sogouExplorer.tabs.getAllInWindow(win.id, function (tabs) {
      for (var i = 0; i < tabs.length; ++i) {
        var host = getDomainByURL(tabs[i].url)
        if (domain === host) {
          sogouExplorer.tabs.remove(tabs[i].id, function () {})
        }
      }
    })
  })
}

sogouExplorer.contextMenus.create({
  type: 'normal',
  title: '关闭所有同域名标签页',
  contexts: ['all'],
  onclick: function (info, tab) {
    closetabs(tab)
  }
}, function () {})
