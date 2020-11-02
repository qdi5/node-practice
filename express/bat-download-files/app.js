global.baseUrl = process.env.NODE_ENV === 'development' ? 'http://192.168.1.120:8001' : 'http://119.23.74.74:8282'
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const log = console.log
const chalk = require("chalk")
const downloadImgsTask = require('./modules/downloadImgsTask')
const downloadPdfsTask = require('./modules/downloadPdfsTask')
// 定时任务
const schedule = require('node-schedule')
const dayjs = require('dayjs')
var app = express();

console.log(`global:${global.baseUrl}`)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/index'));
/* const now = new Date()
const hour = now.getHours()
const minutes = now.getMinutes() */

// 设置任务执行时间
const taskRunDate = new Date(2020, 3, 27, 00, 00, 0)
const taskRunDate2 = new Date(2020, 3, 27, 01, 00, 0)

log(chalk.yellow(dayjs(taskRunDate).format('YYYY-MM-DD HH:mm')) + chalk.white('开始下载合同'))
log(chalk.red(dayjs(taskRunDate2).format('YYYY-MM-DD HH:mm')) + chalk.white('开始下载附件'))

schedule.scheduleJob(taskRunDate2, function(y) {
  log(chalk.yellow('-------------开始执行下载图片啦---------------'))
  downloadImgsTask()
})

schedule.scheduleJob(taskRunDate, function(y) {
  log(chalk.yellow('-------------开始执行下载合同啦---------------'))
  downloadPdfsTask()
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
