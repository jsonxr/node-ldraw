var assert = require('assert');
var fs = require('fs');
var path = require('path');
var parseColors = require('../src/parse-colors');



/*

 0 // LDraw Solid Colours
 0                              // LEGOID  26 - Black
 0 !COLOUR Black                                                 CODE   0   VALUE #05131D   EDGE #595959


 0 // LDraw Transparent Colours
 0                              // LEGOID  40 - Transparent
 0 !COLOUR Trans_Clear                                           CODE  47   VALUE #FCFCFC   EDGE #C3C3C3   ALPHA 128


 0                              // LEGOID 294 - Phosphorescent Green
 0 !COLOUR Glow_In_Dark_Opaque                                   CODE  21   VALUE #E0FFB0   EDGE #A4C374   ALPHA 250   LUMINANCE 15


 0 // LDraw Glitter Colours
 0                              // LEGOID 114 - Tr. Medium Reddish-Violet w. Glitter 2%
 0 !COLOUR Glitter_Trans_Dark_Pink                               CODE 114   VALUE #DF6695   EDGE #9A2A66   ALPHA 128                   MATERIAL GLITTER VALUE #923978 FRACTION 0.17 VFRACTION 0.2 SIZE 1


 0 // LDraw Speckle Colours
 0 !COLOUR Speckle_Black_Silver                                  CODE 132   VALUE #000000   EDGE #898788                               MATERIAL SPECKLE VALUE #898788 FRACTION 0.4 MINSIZE 1 MAXSIZE 3

 */


describe("parse-colors", function () {
  it("should parse colors", function (done) {
    var filename = path.resolve(path.join(__dirname, 'assets', 'LDConfig.ldr'));
    var contents = fs.readFileSync(filename, { "encoding": "utf8"});
    var colors = parseColors(contents);
    assert(colors);
    var black = colors[0];
    assert.equal(black.CODE, 0);
    assert.equal(black.LEGOID, '26 - Black');
    assert.equal(black.VALUE, '#05131D');
    assert.equal(black.EDGE, '#595959');
    // Check Glitter
    var glitter = colors[114];
    assert(glitter);
    assert.equal(glitter.LEGOID, '114 - Tr. Medium Reddish-Violet w. Glitter 2%');
    assert.equal(glitter.CODE, 114);
    assert.equal(glitter.VALUE, '#DF6695');
    assert.equal(glitter.EDGE, '#9A2A66');
    assert.equal(glitter.GLITTER_VALUE, '#923978');
    assert.equal(glitter.FRACTION, '0.17');
    assert.equal(glitter.VFRACTION, '0.2');
    assert.strictEqual(glitter.SIZE, 1);
    assert.strictEqual(glitter.ALPHA, 128);
    var speckle = colors[132];
    assert.equal(speckle.SPECKLE_VALUE, '#898788');
    done();
  })
});
