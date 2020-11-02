const express = require('express')
const router = express.Router()
const _ = require('lodash')
const fs = require('fs')
const path = require('path')

/*
[ { fieldKey: '用户id', fieldValue: 'id' },
  { fieldKey: '用户昵称', fieldValue: 'nick' },
  { fieldKey: '类型', fieldValue: 'type' },
  { fieldKey: '价格', fieldValue: 'price' },
  { fieldKey: '金额', fieldValue: 'money' },
  { fieldKey: '基本数量', fieldValue: 'quantity' },
  { fieldKey: '赠送数量', fieldValue: 'giftQuantity' },
  { fieldKey: '标记', fieldValue: 'remark' },
  { fieldKey: '状态', fieldValue: 'status' },
  { fieldKey: '创建时间', fieldValue: 'createTime' },
  { fieldKey: '操作人', fieldValue: 'operName' },
  { fieldKey: '售卖', fieldValue: 'sellerMobile' },
  { fieldKey: '支付', fieldValue: 'urgePay' },
  { fieldKey: '显示时间', fieldValue: 'showDate' } ]
  
每行多少列：eachRowColNum =  Math.ceil(data.length / 4)

数据结构
var data = [
	{
		row: [{
				// 
				id: 0,
				fieldKey: '用户昵称',
				fieldValue: '吴哲'
			},
			{
				// 
				id: 0,
				fieldKey: '用户昵称',
				fieldValue: '吴哲'
			},
			{
				// 
				id: 0,
				fieldKey: '用户昵称',
				fieldValue: '吴哲'
			},
			{
				// 
				id: 0,
				fieldKey: '用户昵称',
				fieldValue: '吴哲'
			}
		}]
	},
]

*/
// 每行4列模板
let template = `
<div class="container">
	<form action="">
	<%
		let dataLength = forms.length
		let totalRowNumber = Math.ceil(dataLength / 4)
		let lastIndex = 0
		let tabIndex = 0
		for (var i = 0; i < totalRowNumber; i++) {
	%>
		<div class="row cl">
			<%
			  let end = (i + 1) * 4
			  if (end >= dataLength) {
				 end = dataLength
			  }
			  for(var j = lastIndex; j < end; j++) {
				  var keyLength = forms[j].fieldKey.length
				  var colWidth = keyLength > 3 ? keyLength : 3
			%>
					<div class="col-md-3">
						<label for="<%=forms[j].fieldValue%>"
						 class="col-md-<%=colWidth%>"><%=forms[j].fieldKey%></label>
						<input
						 <%if (i === 0 && j === 0) {%>
							autofocus
						 <%}%>
						 class="col-md-<%=12 - colWidth%>" value="" tabIndex="<%=++tabIndex%>" name="<%=forms[j].fieldValue%>" id="<%=forms[j].fieldValue%>" />
					</div>
				<%
					if (j === end - 1) {
						lastIndex = end
					}
				}
			%>
		</div>
	<%}%>
	<div class="row cl">
		<div class="col-md-12">
			<button type="reset">重置</button>
			<button type="submit">提交</button>
		</div>
	</div>
	</form>
</div>
`



router.get('/generateForm', function(req, res){
	// 渲染视图的路径，最前面不需要加 "/"
	res.render('work/generateForm')
})

router.post('/generateForm', function(req, res){
	debugger;
	let body = req.body
	console.log('body:\n', body)
	let compiled = _.template(template)
	let formStr = compiled({forms: body})
	// console.log('body:\n', body)
	console.log('formStr: \n', formStr)
	let directory = path.resolve(__dirname, '../public/htmltemplates/h_ui_admin.html')
	// console.log('directory:', directory)
	// 匹配<body>后面的位置以及</body>之前的位置（也就是body标签之间的内容）
	let bodyReg = /(?<=<body>)[\d\D]*(?=<\/body>)/gi
	try {
		fs.readFile(directory, (error, file) => {
			if (error) {
				throw error
			}
			let htmlTemplate = file.toString()
			// console.log('htmlTemplate:' + typeof htmlTemplate)
			// console.log('matched:\n',htmlTemplate.match(bodyReg))
			htmlTemplate = htmlTemplate.replace(bodyReg, formStr)
			// console.log('htmlTemplate:', htmlTemplate)
			let dateObj = new Date()
			let year = dateObj.getFullYear()
			let month = dateObj.getMonth() + 1
			let day = dateObj.getDate()
			let hour = dateObj.getHours()
			let minute = dateObj.getMinutes()
			let seconds = dateObj.getSeconds()
			let milliseconds = dateObj.getMilliseconds()
			let previewUrl =  '/htmltemplates/dist/' + [year, month, day, hour, minute, seconds, milliseconds].join('-') + '.html'
			fs.writeFile(path.resolve(__dirname, '../public' + previewUrl), htmlTemplate, (error, file) => {
				if (error) {
					throw error
				} 
				console.log('写入成功')
				
			})
			
			res.json({
				message: '读取文件成功',
				data: formStr,
				previewUrl
			})
			
		})
	} catch(e) {
		try {
			throw e
		} catch(e) {
			
		}
		
		res.json({
			message: '读取文件失败',
		})
	}
	
	
	/* // 渲染视图的路径，最前面不需要加 "/"
	res.json({
		message: '请求成功'
	}) */
})


module.exports = router;