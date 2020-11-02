var x = require('./view.js')
console.log(x) // { [Function: View] test01: [Function] }
console.log(x.test) // undefined
console.log(x.test01) // [Function]
x.test01()  //  test01