// core
var fs = require('fs');
var path = require('path');
// npm
var async = require('async');
var glob = require('glob');
// app
var httpGet = require('./http-get');

var parseColors = require('./parse-colors');
var parseModel = require('./parse-model');
var cleanFile = require('./clean-file');
var subfileLineToArray = require('./subfile-array');

function Ldraw(dir) {
  var ldraw = {};
  ldraw.dir = path.resolve(dir);
  ldraw._models = {};

  // models property
  Object.defineProperty(ldraw, 'models', {
    get: function() { return ldraw._models; },
    enumerable: true,
    configurable: true
  });

  // models property
  var colors = [];
  Object.defineProperty(ldraw, 'colors', {
    get: function() { return colors; },
    enumerable: true,
    configurable: true
  });


  /**
   * clean up the filename reference since it can be in
   * "/p/", "/parts/", or "/models/"
   */
  function _getKeyFromFilename(filename) {
    var key = filename;

    // Strip out the root directory
    if (key.indexOf(ldraw.dir) >= 0) {
      key = key.substr(ldraw.dir.length);
    }
    // Strip off the directory where it came from
    if (key.indexOf('/parts/') >= 0) {
      key = key.substr('/parts/'.length);
    } else if (key.indexOf('/p/') >= 0) {
      key = key.substr('/p/'.length);
    } else if (key.indexOf('/models/') >= 0) {
      key = key.substr('/models/'.length);
    }

    // Normalize the filename to be unix like.
    //
    //   Example:  "s\\3001p03s.dat" becomes "s/3001p03s.dat"
    key = key.replace('\\', '/');

    return key;
  }

  /**
   * Clear the model cache
   */
  ldraw.clear = function clear() {
    ldraw._models = {};
    colors = [];
  };

  ldraw.loadModelFromFile = function loadModelFromFile(filename, callback) {
    filename = filename.toLowerCase();
    filename = filename.replace('\\', path.sep);

    function fileExists(subdir, callback) {
      var absoluteFilename = path.resolve(ldraw.dir, subdir, filename);
      fs.exists(absoluteFilename, callback)
    }
    // Return all paths where the file exists
    async.filter(['parts', 'p', 'models'], fileExists, function (results) {
      // If no paths match, then return empty
      if (! results || results.length === 0) {
        callback(null, null);
        return;
      }
      // We only care about the first result that matches
      var file = path.resolve(ldraw.dir, results[0], filename);

      fs.readFile(file, { "encoding": "utf8"}, function (err, contents) {
        var model = null;
        if (!err) {
          model = ldraw.parseModel(contents);
        }
        callback(err, model);
      });
    });
  };

  ldraw.loadModelFromHttp = function loadModelFromHttp(filename, prefix, callback) {
    filename = filename.toLowerCase();
    filename = filename.replace('\\', path.sep);


    var url = prefix + 'parts/' + filename;
    httpGet(url, function (err, content) {
      if (!err) {
        var model = ldraw.parseModel(content);
        callback(null, model);
        return;
      }

      // Couldn't find it under parts, look under p
      url = prefix + 'p/' + filename;
      httpGet(url, function (err, content) {
        if (!err) {
          var model = ldraw.parseModel(content);
          callback(null, model);
        } else {
          callback(err, null);
        }
      });
    });
  };

  /**
   * Load the model
   */
  ldraw.loadModel = function(filename, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    options.recursive = (options.recursive !== undefined) ? options.recursive:false;
    options.http = options.http !== undefined ?  options.http:'http://www.ldraw.org/library/official/';
    if (options.http && options.http.lastIndexOf('/') === options.http.length) {
      options.http = options.http + '/';
    }

    function _load(filename, callback) {
      var key = _getKeyFromFilename(filename);
      ldraw.loadModelFromFile(filename, function (err, model) {
        if (model) {
          callback(err, key, model);
        } else if (options.http) {
          ldraw.loadModelFromHttp(filename, options.http, function (err, model) {
            callback(err, key, model);
          });
        } else {
          callback(null, null, null);
        }
      });
    }

    _load(filename, function (err, key, model) {
      if (model) {
        model.key = key;
        ldraw._models[key] = model;
        ldraw.loadRecursiveModels(model, options, function (err) {
          callback(err, model);
        });
      } else {
        callback(err);
      }
    });
  };

  ldraw.loadRecursiveModels = function (model, options, callback) {
    if (options && options.recursive) {
      var files = [];
      model.commands.forEach(function (cmd) {
        if (cmd.type === 1) {
          if (!ldraw._models[cmd.file]) {
            ldraw._models[cmd.file] = {};
            files.push(cmd.file);
          }
        }
      });

      if (files.length > 0) {
        function load(file, callback) {
          ldraw.loadModel(file, options, callback);
        }

        async.each(files, load, function (err) {
          callback(err);
        });
      } else {
        callback(null);
      }
    } else {
      callback();
    }
  };

  ldraw.loadAll = function loadAll(callback) {
    // Load colors from the directory
    ldraw.loadColors(function (err) {
      if (err) {
        callback(err);
        return;
      }

      // Now load all models from the directory
      glob(dir + '/**/*.dat', function (err, files) {
        async.each(files, ldraw.loadModel, function (err) {
          callback(err);
        })
      });
    });
  };

  ldraw.loadColors = function loadColors(callback) {
    var filename = path.resolve(path.join(dir, 'LDConfig.ldr'));
    fs.readFile(filename, { "encoding": "utf8"}, function (err, content) {
      colors = parseColors(content);
      callback(err, colors);
    });
  };

  ldraw.parseModel = parseModel;
  ldraw.parseColors = parseColors;
  ldraw.cleanFile = cleanFile;


  return ldraw;
}

Ldraw.subfileLineToArray = subfileLineToArray;

module.exports = Ldraw;
