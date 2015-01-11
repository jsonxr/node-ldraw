var async = require('async');
// app
var parseModel = require('./parse-model');
var httpGet = require('./http-get');



function resolveHttp(file, cb) {
  httpGet('http://www.ldraw.org/library/official/parts/' + file.toLowerCase(), function (err, content) {
    if (err) {
      httpGet('http://www.ldraw.org/library/official/p/' + file.toLowerCase(), function (err, content) {
        cb(err, content);
      });
    } else {
      cb(err, content);
    }
  });
}


function loadModel(content, resolve, callback) {
  var models = {};


  function _loadModel(content, callback) {
    var model = parseModel(content);
    var urls = [];

    model.commands.forEach(function (cmd) {
      if (cmd.type === 'subfile') {
        if (! children[cmd.file]) {
          children[cmd.file] = cmd.file;
          urls.push(cmd.file);
        }
      }
    });


    // For each child in this file, we need to get the content and load that model
    async.each(urls,
      function (url, callback) {

        resolveHttp(url, function (err, content) {
          if (! err) {
            _loadModel(content, resolve, function (err, child) {
              children[url] = child;
              callback(err);
            });
          } else {
            callback(err);
          }
        });
      },
      function(err){
        callback(err, model);
      }
    );



    //httpGet(url, function (err, content) {
    //});
  }

  _loadModel(content, resolve, function (err, model) {
    model.children = children;
    callback(err, model);
  })
}


module.exports = loadModel;
