# node-ldraw
A Library for loading and parsing a LDraw files.

# Install

## Download LDraw parts library

[Download LDraw parts library](https://www.ldraw.org/parts/latest-parts.html)

```bash
yarn install:ldraw
```


LDraw
http://www.ldraw.org

File Format 1.0.2:
http://www.ldraw.org/article/218.html

    npm install ldraw


## ldraw.loadModel(filename, callback)

Loads a model from the base path. If it doesn't find it in the file system,
it will attempt to load it from the internets.  It looks in the following
places in the following order:

1. (base path)/parts
2. (base path)/p
3. (base path)/models
4. www.ldraw.org/library/official/parts/
5. www.ldraw.org/library/official/p/

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
// 1 - subfile
var subfile = {
  type: 1, color: 2,
  x: 0, y: 0, z: 0,
  a: 0, b: 0, c: 0,
  d: 0, e: 0, f: 0,
  g: 0, h: 0, i: 0,
  file: '3001.dat'
}

// 2 - line
var line = {
  type: 2,
  color: 2,
  x1: 0, y1: 0, z1: 0, // first point
  x2: 1, y2: 1, z2: 1  // second point
};

// 3 - triangle
var line = {
  type: 3,
  color: 2,
  x1: 0, y1: 0, z1: 0, // first point
  x2: 1, y2: 1, z2: 1, // second point
  x3: 2, y3: 2, z3: 2  // third point
};

// 4 - quad
var line = {
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
