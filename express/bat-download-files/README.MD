# NOTES
1. 使用axios请求文件流    

```javascript
axios({
    method: 'get',
    url: 'http://www.xxx.com/xxx.pdf',
    // 返回类型一定要设置为流
    responseType: 'stream'
}).then(response => {
    // 成功回调
}).catch(error => {
    // 失败回调
}).then(() => {
    // 不管成功还是失败都会执行的回调
})

```    

2. 使用async库控制数组的循环    
    2.1. async.eachOfSeries控制循环内部有多个异步操作的情况;    
    基本语法：    

    ```javascript
        // iteratee函数里面是异步操作；eachOfSeries每次只执行一个iteratee函数，当iteratee函数里，执行了回调函数之后，再去查找coll里面下一个数组或对象，再执行iteratee函数，如此循环，直到coll里面的所有对象都被迭代完成了。
        eachOfSeries(coll, iteratee, callback)
    ```
    `eachOfSeries的iteratee函数，是按照coll被迭代的顺序执行的`

    ```javascript
        async.eachOfSeries([data01,data02], function(arr, key, outCb) {
            // 执行下载2000个pdf
            execDownloadPdf(arr, key).then(result => {
                // 调用回调，表示当前的下载操作完成了；再去查找coll里下一条数据，再来执行下载操作。
                outCb()
            })

        })
    ```

    2.2. async.eachOf控制循环，异步操作并发执行；    

    ```javascript
    // 功能和eachOfSeries类似；不过这个方法是并行执行iteratee；如果data01和data02没有数据关联的话，使用这个方法执行异步任务会更快；（可以理解为eachOfSeries是单线程执行iteratee，eachOf是多线程iteratee），由于是并行执行的任务，所以回调不会按照coll迭代的顺序执行；
    async.eachOf([data01,data02], function(arr, key, outCb) {
        // 执行下载2000个pdf
        execDownloadPdf(arr, key).then(result => {
            // 调用回调，表示当前的下载操作完成了；
            outCb()
        })

    })
    ```

    2.3. async.eachLimit(coll, limit, iteratee, callback) 限流执行迭代  
    并发执行iteratee函数，调用iteratee函数时，它有两个参数，第一个是从list中获取的item，第二个是一个回调函数，当它执行完成时候被调用。如果iteratee传递了一个error给它的回调函数，那么eachLimit方法的callback就会使用error作为它的参数被立即调用。
    
    实际使用案例，假设我们现在需要从某网站，下载5000张小姐姐的图片，如果我们一次请求5000个图片，可能会立马被封ip导致请求失败，为了防止这种情况，我们可以使用async.eachLimit,每次只请求20张小姐姐的图片，直到5000张图片全部下载完毕；

    ```javascript
        async.eachLimit(['http://www.xxx.com/1.jpg','http://www.xxx.com/2.jpg','http://www.xxx.com/3.jpg',...'http://www.xxx.com/5000.jpg'], 20, function(url, cb) {
            downloadPdf(url).then(result => {
                // 表明单次图片下载完毕了
                cb()
            })
        }, function(error){
            if(error) {
                console.log(error)
            } else {
                console.log('所有小姐姐图片都下载完成了')
            }
        })
    ```
3. node中的fs模块与stream（流）

```javascript
    axios({
    method: 'get',
    url: 'http://www.xxx.com/xxx.pdf',
    // 返回类型一定要设置为流
    responseType: 'stream'
    }).then(response => {
        // 成功回调
        // 创建一个写流
        const writer = fs.createWriteStream(path.join(__dirname, `../public/pdf/${dirName}/${filename}.pdf`))
        // 监听流的成功事件
        writer.on("finish", function(){
            console.log('写入文件成功')
        });
        // 监听流的失败事件
        writer.on("error", function(){
            console.log('写入文件失败')
        });
        // 从一个读流里面读取数据，发送给写流；支持链式调用。
        // readable.pipe()方法给readable附带了一个Writeable流，将它自动转换为可读流，同时将它的所有数据附加到Writeable；数据流会自动被管理，以便目标Writeable流不会由于极快的读流而不堪重负。
        result.data.pipe(writer) 
    })                   
```
4. node-schedule设置定时任务
示例：2020年4月27号00点执行下载任务：
```javascript
const taskRunDate = new Date(2020, 3, 27, 00, 00, 0)
schedule.scheduleJob(taskRunDate2, function(y) {
  log(chalk.yellow('-------------开始执行下载图片啦---------------'))
  // 执行下载任务的方法
  downloadImgsTask()
})

```

5. 使用chalk模块打印彩色日志
```javascript
    // 打印红色字体，黄色背景的加粗日志
    chalk.red.bgYellow.bold('hello 小姐姐')
``` 


