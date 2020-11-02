var express = require('express');
var router = express.Router();
var axios = require('axios')
var fs = require('fs')
var path = require('path')
var dayjs = require('dayjs')
var xlstojson = require("xls-to-json-lc");
const chalk = require('chalk');
const log = console.log;
// 控制循环和异步流程的库
const async = require("async")
const downloadImgsTask = require('../modules/downloadImgsTask')
const downloadPdfsTask = require('../modules/downloadPdfsTask')
const baseUrl = global.baseUrl
log(chalk.yellow(`router baseUrl:${baseUrl}`))
/* GET home page. */
var dataSrc = path.resolve(__dirname, '../public/data/data.xls')

// 读取excel批量下载存房合同（测试接口）
router.get('/download', function(req, res, next) {
  xlstojson({
    input: dataSrc,
    output: null,
    lowerCaseHeaders:true
  }, function(err, result) {
    if (err) {
      throw err
    }
    let urls = []
    if (result && result.length) {
      result.map(element => {
        const url = Object.values(element)[1]
        if (/^https?/.test(url) === true) {
          urls.push(url)
        }
      });
    }
    const errorUrls = []
    const successUrls = []
    const totalRequests = urls.length
    console.log('总共请求次数：', totalRequests)
    let requestNum = 0
    async.eachLimit(urls, 30, function(url, cb) {
      console.log('cb:\n', cb)
      const result =  axios({
        method: 'get',
        url,
        responseType: 'stream'
      }).
      then(result => {
        if (result && result.data) {
          result.data.pipe(fs.createWriteStream(path.join(__dirname, '../public/pdf/'+ Date.now() + '.pdf')))
          requestNum++
          log(chalk.blue(`成功索引:${requestNum}`))
          successUrls.push(url)
        }
        setTimeout(cb, 1000)
      }).catch(error => {
        requestNum++
        log(chalk.red(`失败索引:${requestNum}`))
        errorUrls.push(url)
      })
    }, (err, data) => {
        if (err) {
          log('err:\n', err)
        }
        log(chalk.blue(`总个数：${totalRequests}`))
        log(chalk.green(`成功个数：${successUrls.length}`))
        log(chalk.red(`失败个数：${errorUrls.length}`))
        log('errorCb data:\n', data)
        res.render('index', {title: '批量下载pdf', total: totalRequests, success: successUrls.length, fail: errorUrls.length });
    })
  })
  
});

// 下载所有合同
router.get('/bat/download/contracts', function(req, res, next) {
  downloadPdfsTask()
  res.json({success: true})
})

// 下载附件图片
router.get('/bat/download/imgs', function(req, res, next) {
  downloadImgsTask();
  res.json({success: true})
})

module.exports = router;
