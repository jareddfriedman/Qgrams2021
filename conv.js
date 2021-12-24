var fs = require('fs');

var path = require('path');

var rawWordObject = fs.readFileSync('bigList.json');

var wordObject = JSON.parse(rawWordObject);

console.log(wordObject);
