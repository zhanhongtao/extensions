
function collecttags (cb) {
  var tags = window.prompt('给当前网址添加标签, 多标签请使用逗号分隔..')
  cb(tags || '')
}

function collectcode (cb) {
  var code = window.prompt('请输入您的验证码或联系开发者. (ps: 不输入也可以使用...)')
  cb(code || '')
}

chrome.runtime.onMessage.addListener(function (request, sender, response) {
  switch (request.cmd) {
    case 'collect-tags':
      collecttags(response)
      break
    case 'collect-code':
      collectcode(response)
      break
    default:
      break
  }
})
