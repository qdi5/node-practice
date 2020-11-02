const log = console.log
const chalk = require('chalk')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const async = require('async')
const { getSafeFilename, getFilenameExt } = require('../utils')
const baseUrl = global.baseUrl

module.exports = function () {
    const requestUrls = [
        "/api/tblContractBatchDownload/findAllHbContractIn",
        "/api/tblContractBatchDownload/findAllHbContractOut",
    ];
    const pms = requestUrls.map((url) => {
        return axios({
            method: "get",
            url: baseUrl + url,
        });
    });
    axios
        .all(pms)
        .then(
            axios.spread(function (resultOne, resultTwo) {
                const isSuccessOne = resultOne.data.success;
                const isSuccessTwo = resultTwo.data.success;
                let allData = [];
                let cunFangData = []
                let chuFangData = []
                if (isSuccessOne) {
                    cunFangData = resultOne.data.map.data;
                }
                if (isSuccessTwo) {
                    chuFangData = resultTwo.data.map.data;
                }
                let dataArr = [cunFangData,chuFangData]
                // eachOfSeries
                async.eachOf(dataArr, function(arr, key, outCb) {
                    execDownloadImg(arr, key).then(result => {
                        console.log('execDownloadImg执行完毕啦：', result)
                        outCb()
                    }).catch(error => {
                        outCb(null)
                        log(chalk.red(`execDownloadImg报错啦：\r\n${error}`))
                    })      
                })
            })
        )
        .catch((error) => {
            console.log("error:\n", error);
        });
}

function execDownloadImg(arr, type) {
    const dirName = type === 0 ? '存房' : '出房'
    const successUrls = []
    const errorUrls = []
    const totalRequests = arr && arr.length
    return new Promise(function(resolve, reject){
        log(chalk.yellow(`当前${dirName}合同数据总数：${arr.length}`));
        if (totalRequests) {
            // 控制循环
            async.eachSeries(
                arr,
                function (item, outCb) {
                    const {
                        contractNo,
                        houseName,
                        url: imgUrls
                    } = item;
                    // 创建的目录名
                    let dir = `${contractNo}——${houseName}`;
                    dir = `${getSafeFilename(dir)}——${Date.now()}`;
                    let preDir = `../public/downloadImages/${dirName}/${dir}`
                    let newDirPath = path.join(
                        __dirname,
                        preDir
                    );
                    // 当这个目录不存在时，才创建目录
                    if (!fs.existsSync(newDirPath)) {
                        fs.mkdir(newDirPath, (err) => {
                            if (err) throw err;
                            console.log("创建目录成功！");
                            // 控制异步请求的限流限速
                            async.eachLimit(
                                imgUrls,
                                5,
                                function (url, innerCb) {
                                    log(chalk.yellow("执行下载图片啦"));
                                    const ext = getFilenameExt(url);
                                    axios({
                                            url: baseUrl + url,
                                            method: "GET",
                                            responseType: "stream",
                                        })
                                        .then((response) => {
                                            log(chalk.green("获取图片成功"));
                                            const stream = response && response.data;
                                            if (stream) {
                                                // 每张图片的文件名不一样，所以需要每次创建一个写流
                                                const writer = fs.createWriteStream(
                                                    path.join(
                                                        __dirname,
                                                        `${preDir}/${Date.now()}${ext}`
                                                    )
                                                );
                                                writer.on("finish", function () {
                                                    successUrls.push(url)
                                                    log(chalk.blue("单个图片下载完成"));
                                                });
                                                writer.on("error", function () {
                                                    errorUrls.push(url)
                                                    log(chalk.red("单个图片下载失败"));
                                                });
                                                stream.pipe(writer);
                                            } else {
                                                errorUrls.push(url)        
                                            }
                                        })
                                        .catch((error) => {
                                            log(chalk.red("请求图片出错"));
                                            errorUrls.push(url)
                                        }).
                                        then(function(){
                                            innerCb(null);
                                        })
                                },
                                function (err) {
                                    if (err) {
                                        log(chalk.red(`单个图片下载出错：${JSON.stringify(err)}`));
                                    } else {
                                        log(chalk.green("单次下载多张图片全部完成"));
                                        outCb();
                                    }
                                }
                            );
                        });
                    } else {
                        outCb();
                        log(
                            chalk.red(
                                "---------------------------目录已存在啊-----------------"
                            )
                        );
                    }
                },
                function () {
                    log(
                        chalk.green.bgWhite.bold(`--------------------恭喜哦！本次${dirName}所有图片下载完成----------------`)
                    );
                    log(chalk.green(`${dirName}图片下载成功个数：${successUrls.length}`))
                    log(chalk.red(`${dirName}图片下载失败个数：${errorUrls.length}`))
                    resolve(true)
                }
            );
        } 
    })
  

}