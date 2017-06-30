//var urlExists = require('url-exists');
// var request = require('request');

// function urlExists(url, cb) {
//     request({ url: url, method: 'HEAD' }, function(err, res) {
//         if (err) return cb(null, false);
//         console.log(res.statusCode)
//         cb(null, /4\d\d/.test(res.statusCode) === false);
//     });
// }

// urlExists('http://api.mendeley.com	', function(err, exists) {
//     console.log(exists); // true
// });


var Url = require("url");

var aa = Url.parse('http://www.clustrix.com');

console.log(aa)
