# node-ldraw
A Library for loading and parsing a LDraw files.

LDraw
http://www.ldraw.org

File Format 1.0.2:
http://www.ldraw.org/article/218.html

    npm install ldraw


# Geometry

There are three reasons to reverse vertices in an LDRAW file

1) Determinant of matrix is Negative: http://mathinsight.org/determinant_geometric_properties
2) INVERTNEXT on previous line
3) Clockwise winding (opengl is counter clockwise)

reverse vertices = negDet XOR inverted XOR clockwise;

## ldraw.loadModel(filename, callback)

    http://www.ldraw.org/reference/faq/#26
    The P folder.
    The PARTS folder.
    The MODELS folder.
    The current folder.

Loads a model from the base path. If it doesn't find it in the file system,
it will attempt to load it from the internets.  It looks in the following
places in the following order:

1. (base path)/parts
2. (base path)/p
3. (base path)/models
4. www.ldraw.org/library/official/parts/
5. www.ldraw.org/library/official/p/


!!!!OOPS!!!! Need to swap p, parts load order.

```javascript
var ldraw = require('ldraw')('/path/to/ldraw/files');
ldraw.loadModel('car.dat', function (err, model) {
  model.commands.forEach(function (cmd) {
    console.log(cmd);
  });
});
```

Commands can be one of the following:

```javascript

/* 0 - ?
0 Brick  2 x  4
0 Name: 3001.dat
0 Author: James Jessiman
0 !LDRAW_ORG Part UPDATE 2004-03
0 !LICENSE Redistributable under CCAL version 2.0 : see CAreadme.txt

0 BFC CERTIFY CCW

0 !HISTORY 2002-05-07 [unknown] BFC Certification
0 !HISTORY 2002-06-11 [PTadmin] Official Update 2002-03
0 !HISTORY 2004-02-08 [Steffen] used s\3001s01.dat
0 !HISTORY 2004-09-15 [PTadmin] Official Update 2004-03
0 !HISTORY 2007-05-07 [PTadmin] Header formatted for Contributor Agreement
0 !HISTORY 2008-07-01 [PTadmin] Official Update 2008-01
*/
var comment = {
  type: 0
};

/* 1 - subfile

  c x y z a b c d e f g h i
1 0 0 0 0 1 0 0 0 1 0 0 0 1 3001.dat
*/
var subfile = {
  type: 1, color: 2,
  x: 0, y: 0, z: 0,
  a: 1, b: 0, c: 0, // Describe what a-i are (matrix transform?)
  d: 0, e: 1, f: 0,
  g: 0, h: 0, i: 1,
  file: '3001.dat'
};

// 2 - line
var line = {
  type: 2,
  color: 2,
  x1: 0, y1: 0, z1: 0, // first point
  x2: 1, y2: 1, z2: 1  // second point
};

// 3 - triangle
var triangle = {
  type: 3,
  color: 2,
  x1: 0, y1: 0, z1: 0, // first point
  x2: 1, y2: 1, z2: 1, // second point
  x3: 2, y3: 2, z3: 2  // third point
};

// 4 - quad
var quad = {
  type: 4,
  color: 2,
  x1: 0, y1: 0, z1: 0, // first point
  x2: 1, y2: 1, z2: 1, // second point
  x3: 2, y3: 2, z3: 2, // third point
  x4: 3, y4: 3, z4: 3  // fourth point
};

// 5 - optional line
var line = {
  type: 5,
  color: 24,
  x1: 0, y1: 0, z1: 0, // first point
  x2: 1, y2: 1, z2: 1, // second point
  x3: 2, y3: 2, z3: 2, // first control point
  x4: 3, y4: 3, z4: 3  // second control point
};
```

## ldraw.loadColors(callback)

Loads the colors from the LDConfig.ldr file in the base directory.

```javascript
var ldraw = require('ldraw')('/path/to/ldraw/files');
ldraw.loadColors(function (err, colors) {
    console.log(colors[0].NAME);
});

var black = {
  "NAME": "Black",
  "CODE": 0,
  "VALUE": "#05131D",
  "EDGE": "#595959",
  "MATERIAL": "SOLID",
  "LEGOID": "26 - Black"
}
assert.equals(black.NAME, ldraw.colors[0].NAME);
assert.equals(black.CODE, ldraw.colors[0].CODE);
assert.equals(black.VALUE, ldraw.colors[0].VALUE);
```

## ldraw.parseModel(str)

Given a string, it parses the text and returns a list of commands.  loadModel
 calls this function.

```javascript
var ldraw = require('ldraw')('/path/to/ldraw/files');
var filename = 'messy.ldr';
var content = fs.readFileSync(filename, { "encoding": "utf8"});
var model = parseModel(content);
```

## ldraw.parseColors(str)

Given a string, it returns an object of all the colors indexed by their code.
  loadColors calls this function

```javascript
var ldraw = require('ldraw')('/path/to/ldraw/files');
var content = fs.readFileSync('...LDConfig.ldr', { "encoding": "utf8"});
var colors = ldraw.parseColors(content);
assert.equals(colors[0].CODE === 0);
assert.equals(colors[0].NAME === 'Black');
```

## ldraw.cleanFile(str)

This function takes ugly values and if the difference between the number and
an integer is less than a small epsilon, it turns them into the integer. This
 is useful for reducing the size of ldraw files.

```javascript
var ldraw = require('ldraw')('/path/to/ldraw/files');
var cmd = '1 0 9.99999904632568359375 -7.99999904632568359375 10 0 0 -1 0 0.999999940395355224609375 0 1 0 0 3623.dat';
var cleaned = ldraw.cleanFile(cmd);
assert.equal(cleaned, '1 0 10 -8 10 0 0 -1 0 1 0 1 0 0 3623.dat');
```
