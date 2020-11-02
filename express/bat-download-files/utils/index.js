// 将字符串转换为合法的文件名
const filenamify = require('filenamify');
module.exports = {
    // 去掉文件名的斜杠
  trimSlash(str) {
    return String(str).replace(/[\/]/g,'')
  },
  
  // 获取文件名后缀
  getFilenameExt(str) {
    return String(str).match(/\.\w+$/)[0]
  },
  
  formatStr(str) {
    return trimSlash(String(str).replace(/\s/g, ''))
  },
  
  // 得到安全的文件名
  getSafeFilename(str, replacement = '') {
    return filenamify(str, {replacement})
  },
  isUrl(url) {
    return /^https?/.test(url) === true
  }
}