function bin2hex (s) {
  // discuss at: http://phpjs.org/functions/bin2hex/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // bugfixed by: Linuxworld
  // improved by: ntoniazzi (http://phpjs.org/functions/bin2hex:361#comment_177616)
  // example 1: bin2hex('Kev');
  // returns 1: '4b6576'
  // example 2: bin2hex(String.fromCharCode(0x00));
  // returns 2: '00'
  var i, l, o = '', n
  s += ''
  for (i = 0, l = s.length; i < l; i++) {
    n = s.charCodeAt(i)
      .toString(16)
    o += n.length < 2 ? '0' + n : n
  }
  return o
}

function getUUID (domain) {
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  var txt = domain
  ctx.textBaseline = 'top'
  ctx.font = "14px 'Arial'"
  ctx.textBaseline = 'x181'
  ctx.fillStyle = '#f60'
  ctx.fillRect(125, 1, 62, 20)
  ctx.fillStyle = '#069'
  ctx.fillText(txt, 2, 15)
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
  ctx.fillText(txt, 4, 17)

  var b64 = canvas.toDataURL().replace('data:image/png;base64,', '')
  var bin = atob(b64)
  var crc = bin2hex(bin.slice(-16, -12))
  return crc
}

function pingback(info) {
  var img = new Image()
  var src = 'uid=' + getUUID() + '&t=' + Date.now()
  for (var key in info) {
    src += '&' + key + '=' + encodeURIComponent(info[key])
  }
  img.src = 'http://x181.cn/ping/qrcode.gif?' + src
}

// 插件配置信息
var icon = './page.png'
// var title = '生成当前标签页URL二维码';
var title = ''
var popup = './popup.html'
var size = {width: 205, height: 200}

function initPageAction (tabid) {
  sogouExplorer.pageAction.setIcon({
    tabId: tabid,
    path: icon
  })
  sogouExplorer.pageAction.setTitle({
    tabId: tabid,
    title: title
  })
  sogouExplorer.pageAction.setPopup({
    tabId: tabid,
    popup: popup,
    width: size.width,
    height: size.height
  })
}

function init () {
  sogouExplorer.tabs.onSelectionChanged.addListener(function (tid) {
    initPageAction(tid)
    sogouExplorer.pageAction.show(tid)
  })
  sogouExplorer.browserAction.setPopup({
    popup: popup,
    width: size.width,
    height: size.height
  })
  sogouExplorer.tabs.getSelected(function (tab) {
    initPageAction(tab.id)
    sogouExplorer.pageAction.show(tab.id)
  })
}

sogouExplorer.extension.onRequest.addListener(function (req) {
  if (req.cmd === 'ping') {
    pingback(req.payload)
  }
})

init()
pingback({
  type: 'init'
})
