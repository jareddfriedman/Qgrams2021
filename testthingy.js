var tester = "bag";

var init2 = /(\w+(\w))/
var init3 = "$1$2"
var init4 = tester.replace(init2, init3);
console.log(init4);
