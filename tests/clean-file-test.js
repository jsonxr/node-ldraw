//http://www.ldraw.org/library/official/parts/3001.dat
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var cleanFile = require('../src/old/clean-file');
var parseModel = require('../src/parse-model');

describe("clean-ldraw", function () {

  it("should round models to whole numbers when they are within an EPSILON OF 0.000001", function (done) {
    var filename = path.resolve(path.join(__dirname, 'assets', 'models', 'dirty.ldr'));
    var contents = fs.readFileSync(filename, { "encoding": "utf8"});
    var model = parseModel(cleanFile(contents));
    assert(model);
    // 1 0 9.99999904632568359375 -7.99999904632568359375 10 0 0 -1 0 0.999999940395355224609375 0 1 0 0 3623.dat
    var cmd = model.commands[0];
    assert.equal(cmd.x, 10);
    assert.equal(cmd.y, -8);
    assert.equal(cmd.e, 1);
    done();
  });

});
