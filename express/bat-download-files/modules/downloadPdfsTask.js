const log = console.log
const chalk = require('chalk')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const async = require('async')
const { getSafeFilename, isUrl } = require('../utils')
const baseUrl = global.baseUrl

module.exports = function() {
    const urls = ['/api/tblContractBatchDownload/findAllTblContractCol', '/api/tblContractBatchDownload/findAllTblContractPre']
    const pms = urls.map(url => {
      return axios({
        method: 'get',
        url: baseUrl + url
      })
    })
    axios.all(pms).then(axios.spread(function (acct, perms) {
      const isSuccessOne = acct.data.success
      const isSuccessTwo = perms.data.success
      // 存房数据
      let cunFangData = []
      // 出房数据
      let chuFangData = []
      if (isSuccessOne) {
        cunFangData = acct.data.map.data
      }
      if (isSuccessTwo) {
        chuFangData = perms.data.map.data
      }
      let dataArr = [cunFangData, chuFangData]
      async.eachOf(dataArr, function(arr, key, outCb) {
        execDownloadPdf(arr, key).then(result => {
          // console.log(`execDownloadPdf执行完毕啦：`, result)
          // setTimeout(outCb, 5000)
          outCb()
        }).catch(error => {
          outCb(error)
          log(chalk.red(`execDownloadPdf报错啦：\r\n${error}`))
        })
      })
    })).catch(error => {
      log(chalk.red('请求所有合同的接口报错了:\n' + JSON.stringify(error)))
    })
}

// 执行下载pdf
/**
 * 
 * @param {当前数据} currentData 
 * @param {标识当前数据的类型，0代表存房；1代表出房} type 
 */
function execDownloadPdf(currentData, type) {
  // 合同号 deedsn：
  // 物业名 houseName： 
  return new Promise(function(resolved, reject) {
    if (currentData.length) {
      const newData = normalizeData (currentData)
      let urls = newData.urls
      // 目录名
      const dirName = type === 0 ? '存房' : '出房'
      let typeName = dirName
      // log(chalk.yellow(`当前${typeName}合同总数：${urls.length}`))
      const pdfNamesMap = newData.pdfNamesMap
      const errorUrls = []
      const successUrls = []
      const totalRequests = urls.length
      // 每次请求50个url地址
      async.eachLimit(urls, 20, function(url, cb) {
          axios({
            method: 'get',
            url,
            responseType: 'stream'
          }).
          then(result => {
            const obj = pdfNamesMap.get(url)
            const date = dayjs().format('yyyy-mm-dd HH-mm-ss-SSS')
            if (result && result.data) {
              successUrls.push(url)
              const filename = getSafeFilename(`${obj.houseName}——${obj.deedsn}`)
              const writer = fs.createWriteStream(path.join(__dirname, `../public/pdf/${dirName}/${filename}.pdf`))
              writer.on("finish", function(){
                log(chalk.green('下载成功'))
              });
              writer.on("error", function(){
                log(chalk.red('下载失败'))
                errorUrls.push(url)
              });
              result.data.pipe(writer)
            } else {
              errorUrls.push(url)
            }
          }).
          catch(error => {
            errorUrls.push(url)
          }).
          then(function(){
            // 每隔1秒钟，再去执行下一个50个url的请求
            setTimeout(() => {
              cb(null)
            }, 1000)
          })
        }, 
        function (err) {
          if (err) {
            log('eachLimit error:\n', err)
          } else {
            log(chalk.green.bgWhite.bold('恭喜你！所有合同都下载完成了！'))
            log(chalk.blue(`${dirName}合同总个数：${totalRequests}`))
            log(chalk.green(`${dirName}合同下载成功个数：${successUrls.length}`))
            log(chalk.red(`${dirName}合同下载失败个数：${errorUrls.length}`))
            resolved(true)
          }
        })
    }
  })
}

// 组装好数据
function normalizeData (data) {
  const urls = []
  const pdfNamesMap = new Map()
  const urlsArr = data.forEach(item => {
    const { download_url, deedsn, houseName } = item
    if (download_url && isUrl(download_url)) {
      urls.push(download_url)
      pdfNamesMap.set(download_url, { deedsn, houseName })
    }
  })
  return {
    urls,
    pdfNamesMap
  }
}
