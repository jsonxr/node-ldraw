var assert = require('assert');
var subfileLineToArray = require('../src/subfile-array');
var glmatrix = require('gl-matrix');

describe("subfileToArray", function () {
  it("should create the matrix from the Ldraw line description", function (done) {
    var line = '1 4 120 -24 -100 1 0 0 0 1 0 0 0 1 3001.dat'
    var arr = subfileLineToArray(line);
    //    / a, b, c, x \    0,  4,  8, 12
    //    | d, e, f, y |    1,  5,  9, 13
    //    | g, h, i, z |    2,  6, 10, 14
    //    \ 0, 0, 0, 1 /    3,  7, 11, 15    
    // var q = glmatrix.
    // var m = glmatrix.fromRotationTranslation(out, q, glmatrix.vec3.create(120, -24, -100));
    done();
  });
});
