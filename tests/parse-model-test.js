var assert = require('assert');
var fs = require('fs');
var path = require('path');
var parseModel = require('../src/parse-model');

describe("parse-model", function () {
  it("should parse model", function (done) {
    var filename = path.resolve(path.join(__dirname, 'assets', 'parts', '3001.dat'));
    var contents = fs.readFileSync(filename, { "encoding": "utf8"});
    var model = parseModel(contents);
    assert.equal(model.name,'3001.dat')

    // 1 16 0 0 0 1 0 0 0 1 0 0 0 1 s\3001s01.dat
    var subfile = model.commands[0];
    assert.equal(subfile.type,1);
    assert.equal(subfile.color, 16);
    assert.equal(subfile.x, 0);
    assert.equal(subfile.y, 0);
    assert.equal(subfile.z, 0);
    assert.equal(subfile.a, 1);
    assert.equal(subfile.b, 0);
    assert.equal(subfile.c, 0);
    assert.equal(subfile.d, 0);
    assert.equal(subfile.e, 1);
    assert.equal(subfile.f, 0);
    assert.equal(subfile.g, 0);
    assert.equal(subfile.h, 0);
    assert.equal(subfile.i, 1);
    assert.equal(subfile.file, 's\\3001s01.dat');

    // 4 16 -40 0 -20 -40 24 -20 40 24 -20 40 0 -20
    var quad = model.commands[1];
    assert.equal(quad.type, 4);
    assert.equal(quad.color, 16);
    assert.equal(quad.x1, -40);
    assert.equal(quad.y1, 0);
    assert.equal(quad.z1, -20);
    assert.equal(quad.x2, -40);
    assert.equal(quad.y2, 24);
    assert.equal(quad.z2, -20);
    assert.equal(quad.x3, 40);
    assert.equal(quad.y3, 24);
    assert.equal(quad.z3, -20);
    assert.equal(quad.x4, 40);
    assert.equal(quad.y4, 0);
    assert.equal(quad.z4, -20);
    //assert(quad.x == 0)

    assert(model.commands[2].type === 4);
    done();
  });

});


