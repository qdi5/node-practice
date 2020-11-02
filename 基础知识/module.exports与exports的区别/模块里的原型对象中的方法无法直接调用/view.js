function View (name, options) {
  this.name = name
  this.options = options
}

View.prototype.test = function () {
  console.log('test')
}

View.test01 = function () {
  console.log('test01')
}

module.exports = View