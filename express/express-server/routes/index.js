var express = require('express');
var router = express.Router();
var upload = require('../modules/upload.js');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/upload/single', function(req, res, next) {
  res.render('upload');
});

// 单文件上传 （这里的avatar指的是file的name属性的值）
 router.post('/upload/single', upload.single('avatar'),function(req, res){
		console.log('file:', req.file)
		let fileData = req.file,

				//图片上传后的文件名
				fileName = fileData.filename,
				destination = fileData.destination,

				//图片路径
				imgSrc = destination.substr(destination.indexOf('public') + 6);
				console.log('fileData', fileData)
		res.json({
				status: 1,
				des: "上传成功！",
				pic: imgSrc + fileName
		});
});

router.get('/upload/multiple', function(req, res) {
	res.render('upload-multiple')
})

//多文件上传
router.post('/upload/multiple', upload.array('files', 10000),function(req,res,next){
		let filesData = req.files,
		    length = filesData.length,
		    imgSrcs = [];
		
		if(filesData.length > 0) {
		  for(var i = 0; i < length; i++ ){
		      //图片上传后的文件名
		      var fileName = filesData[i].filename,
		          destination = filesData[i].destination,
		
		          //图片路径
		          imgSrc = destination.substr(destination.indexOf('public') + 6);
		
		      imgSrcs.push(imgSrc + fileName);
		  }
		
		}
		
		res.json({
		   errno: 0,
		   data: imgSrcs   //图片路径数组
		});
});

//多文件上传
router.post('/upload/multiple/any', upload.any(),function(req,res,next){
		let filesData = req.files,
		    length = filesData.length,
		    imgSrcs = [];
		
		if(filesData.length > 0) {
		  for(var i = 0; i < length; i++ ){
		      //图片上传后的文件名
		      var fileName = filesData[i].filename,
		          destination = filesData[i].destination,
		
		          //图片路径
		          imgSrc = destination.substr(destination.indexOf('public') + 6);
		
		      imgSrcs.push(imgSrc + fileName);
		  }
		
		}
		
		res.json({
		   errno: 0,
		   data: imgSrcs   //图片路径数组
		});
});

// JSONP
router.get('/jsonp', function(req, res, next) {
    res.jsonp({user: 'jsonp'})
})

router.post('/proxy', function (req, res) {
	let body = req.body
	res.redirect(`${body.proxy}?callback=${body.callback}&arg=success`)
})
module.exports = router;
