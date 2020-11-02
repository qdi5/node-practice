const fs = require('fs')
const path = require('path')
// 回调函数的data是一个Buffer对象
fs.readFile('C:/Users/wuzhe/Desktop/CusLessee.java', (err, data) => {
	
	if(err) {
		throw err
	}
	console.log(data.toString())
})
// resolve()返回一个绝对路径
// 这里不使用resolve连接路径，生成的文件就不再当前目录下了（???）
fs.writeFile(path.resolve(__dirname, 'testWrite.txt'), '这是新写入的内容', err => {
	if (err) {
		throw err
	}
	console.log('File saved')
})

// 创建读写流 process.argv(2) 允许传递参数
fs.createReadStream(process.argv[2
]).pipe(process.stdout)