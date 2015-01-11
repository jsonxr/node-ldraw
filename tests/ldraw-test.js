var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Ldraw = require('../src/ldraw');

describe("ldraw", function () {
  it("should load all models", function (done) {
    var ldrawPath = path.resolve(__dirname, 'assets');
    var ldraw = Ldraw(ldrawPath);

    ldraw.loadAll(function (err, callback) {
      assert(ldraw.models);
      assert(Object.keys(ldraw.models).length);
      assert.notEqual(Object.keys(ldraw.models).length, 0);
      done();
    });
  });

  it("should load single file from filesystem", function (done) {
    var ldrawPath = path.resolve(__dirname, 'assets');
    var ldraw = Ldraw(ldrawPath);
    ldraw.loadModel('part.dat', function (err, model) {
      assert(! err);
      assert(model);
      assert(ldraw.models['part.dat']);
      assert(!ldraw.models['1.dat']);
      assert(!ldraw.models['s/2.dat']);
      assert(!ldraw.models['3.dat']);
      done();
    });
  });

  it("should recursively load from filesystem", function (done) {
    var ldrawPath = path.resolve(__dirname, 'assets');
    var ldraw = Ldraw(ldrawPath);
    ldraw.loadModel('model.ldr', { recursive:true }, function (err, model) {
      assert(ldraw.models['part.dat']);
      assert(ldraw.models['1.dat']);
      assert(ldraw.models['s/2.dat']);
      assert(ldraw.models['3.dat']);
      done();
    });
  });

  it("should return error if it doesn't exist on filesystem", function (done) {
    var ldrawPath = path.resolve(__dirname, 'assets');
    var ldraw = Ldraw(ldrawPath);
    ldraw.loadModel('bogus.dat', { http:null }, function (err, model) {
      assert(! err);
      assert(! model);
      done();
    });
  });

  it("should get file from web if it doesn't exist on filesystem", function (done) {
    this.timeout(10000)
    var ldrawPath = path.resolve(__dirname, 'assets');
    var ldraw = Ldraw(ldrawPath);
    ldraw.loadModel('http-model.ldr', { recursive:true }, function (err) {
      assert(! err);
      assert(ldraw.models['box5.dat']);
      done();
    });
  });

  it("should load colors", function (done) {
    this.timeout(10000);
    var ldrawPath = path.resolve(__dirname, 'assets');
    var ldraw = Ldraw(ldrawPath);
    ldraw.loadColors(function (err, colors) {
      assert(colors);
      assert(ldraw.colors);
      var black = colors[0];
      assert(black);
      assert.equal(black.NAME, 'Black');
      assert.equal(black.CODE, 0);
      assert.equal(black.VALUE, '#05131D');
      assert.equal(black.MATERIAL, 'SOLID');
      assert.equal(black.LEGOID, '26 - Black');
      done();
    });
  });

  it("should round models to whole numbers when they are within an EPSILON OF 0.000001", function (done) {
    var ldrawPath = path.resolve(__dirname, 'assets');
    var ldraw = Ldraw(ldrawPath);

    assert(ldraw.cleanFile);
    assert.equal(typeof ldraw.cleanFile, 'function');

    var cmd = '1 0 9.99999904632568359375 -7.99999904632568359375 10 0 0 -1 0 0.999999940395355224609375 0 1 0 0 3623.dat';
    var cleaned = ldraw.cleanFile(cmd);
    assert.equal(cleaned, '1 0 10 -8 10 0 0 -1 0 1 0 1 0 0 3623.dat');

    done();
  });

  it("should expose parseModel on ldraw object", function (done) {
    var ldrawPath = path.resolve(__dirname, 'assets');
    var ldraw = Ldraw(ldrawPath);
    assert(ldraw.parseModel);
    assert.equal(typeof ldraw.parseModel, 'function');
    done();
  });

  it("should expose parseColors on ldraw object", function (done) {
    var ldrawPath = path.resolve(__dirname, 'assets');
    var ldraw = Ldraw(ldrawPath);
    assert(ldraw.parseColors);
    assert.equal(typeof ldraw.parseColors, 'function');
    done();
  });


});


