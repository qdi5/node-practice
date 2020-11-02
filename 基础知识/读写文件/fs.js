const fs = require('fs')
// 压缩模块
const zip = require('zlib')
// highWaterMark表示每次buffer取多长
// var rs = fs.createReadStream('./test.txt', {highWaterMark: 10})
var data = ''
rs.on('data', function (chunk) {
	data += chunk
})
rs.on('end', function () {
	console.log(data)
})

// 不设置highWaterMark,默认是16kb
let ws = fs.createWriteStream('./test1.txt', {highWaterMark: 2})
// drain事件，缓存区释放后触发
ws.on('drain', function () {
	console.log('传输完成')
})

// pipe  
let rs = fs.createReadStream('./test.txt')
let ws = fs.createWriteStream('./test2.txt')
// pipe支持链式对象
rs.pipe(zip.createGzip()).pipe(ws)
