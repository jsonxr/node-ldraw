var assert = require('assert');
var fs = require('fs');
var path = require('path');
var parseModel = require('../src/parse-model');

describe("parse-model", function () {
  it("should parse model", function (done) {
    var filename = path.resolve(path.join(__dirname, 'assets', 'parts', '3001.dat'));
    var contents = fs.readFileSync(filename, { "encoding": "utf8"});
    var model = parseModel(contents);
    assert.strictEqual(model.name,'3001.dat')

    // 1 16 0 0 0 1 0 0 0 1 0 0 0 1 s\3001s01.dat
    var subfile = model.commands[0];
    assert.strictEqual(subfile.type,1);
    assert.strictEqual(subfile.color, 16);
    assert.strictEqual(subfile.x, 0);
    assert.strictEqual(subfile.y, 0);
    assert.strictEqual(subfile.z, 0);
    assert.strictEqual(subfile.a, 1);
    assert.strictEqual(subfile.b, 0);
    assert.strictEqual(subfile.c, 0);
    assert.strictEqual(subfile.d, 0);
    assert.strictEqual(subfile.e, 1);
    assert.strictEqual(subfile.f, 0);
    assert.strictEqual(subfile.g, 0);
    assert.strictEqual(subfile.h, 0);
    assert.strictEqual(subfile.i, 1);
    assert.strictEqual(subfile.file, 's\\3001s01.dat');

    // 4 16 -40 0 -20 -40 24 -20 40 24 -20 40 0 -20
    var quad = model.commands[1];
    assert.strictEqual(quad.type, 4);
    assert.strictEqual(quad.color, 16);
    assert.strictEqual(quad.x1, -40);
    assert.strictEqual(quad.y1, 0);
    assert.strictEqual(quad.z1, -20);
    assert.strictEqual(quad.x2, -40);
    assert.strictEqual(quad.y2, 24);
    assert.strictEqual(quad.z2, -20);
    assert.strictEqual(quad.x3, 40);
    assert.strictEqual(quad.y3, 24);
    assert.strictEqual(quad.z3, -20);
    assert.strictEqual(quad.x4, 40);
    assert.strictEqual(quad.y4, 0);
    assert.strictEqual(quad.z4, -20);
    //assert(quad.x == 0)

    assert(model.commands[2].type === 4);
    done();
  });

});
