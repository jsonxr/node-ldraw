var http = require('http');

function httpGet(url, callback) {
  http.get(url, function(res) {
    var body = '';
    res.on("data", function(chunk) {
      body += chunk;
    });
    res.on('end', function () {
      if (res.statusCode === 200) {
        callback(null, body);
      } else {
        callback('404 ' + url);
      }
    })
  }).on('error', function(e) {
    callback(e);
  });
}

module.exports = httpGet;
