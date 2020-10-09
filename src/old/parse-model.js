var parseLine = require('./parse-line');

/*

var model = {
  steps: [
    [0,1],
  ],
  commands: [
    { type:1, color:16, x:0, y:0, z:0, a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0, file:'myfile.dat' },
    {}
  ]
}


 1 <color> x y z a b c d e f g h i <file>

 color:
 16 is the "main color" or "current color"
 24 is the "edge color" or "complement color"


 / a d g 0 \   / a b c x \
 | b e h 0 |   | d e f y |
 | c f i 0 |   | g h i z |
 \ x y z 1 /   \ 0 0 0 1 /

 */
module.exports = parser;

function addCommand(model, cmd) {
  model.commands.push(cmd);
}

function parse0(line, params, model) {
  if (params[1] === 'STEP') {
    model.steps = model.steps || [0];
    model.steps.push(model.commands.length);
  } else if (line === '0 BFC CERTIFY CCW') {
    // 0 BFC CERTIFY CCW (winding order for Back Face Culling)
    model.CCW = true;
  } else if (line === '0 BFC CERTIFY CW') {
    model.CW = true;
  } else if (line.indexOf('0 !HISTORY ') >= 0) {
    model.history = model.history || [];
    model.history.push(line.substr('0 !HISTORY '.length));
  } else if (line.indexOf('0 Name: ') >= 0) {
    model.name = line.substr('0 Name: '.length);
  } else if (line.indexOf('0 Author: ') >= 0) {
    model.author = line.substr('0 Author: '.length);
  } else if (line.indexOf('0 !LDRAW_ORG') >= 0) {
    model.type = params[2];
  } else {
    model.comments = model.comments || [];
    var comment = line.substr(2).trim();
    if (comment) {
      model.comments.push(line.substr(2));
    }
  }
}

function parse1(line, params, model) {
  // subfile
  var cmd = {
    type: parseInt(params[0]),
    color: parseInt(params[1], 10),
    x: parseFloat(params[2]),
    y: parseFloat(params[3]),
    z: parseFloat(params[4]),
    a: parseFloat(params[5]),
    b: parseFloat(params[6]),
    c: parseFloat(params[7]),
    d: parseFloat(params[8]),
    e: parseFloat(params[9]),
    f: parseFloat(params[10]),
    g: parseFloat(params[11]),
    h: parseFloat(params[12]),
    i: parseFloat(params[13]),
    file: params[14]
  };
  addCommand(model, cmd);
}

function parse2(line, params, model) {
  // line
  // 2 <colour> x1 y1 z1 x2 y2 z2
  var cmd = {
    type: parseInt(params[0]),
    color: parseInt(params[1], 10),
    x1: parseFloat(params[2]),
    y1: parseFloat(params[3]),
    z1: parseFloat(params[4]),
    x2: parseFloat(params[5]),
    y2: parseFloat(params[6]),
    z2: parseFloat(params[7])
  };
  addCommand(model, cmd);
}

function parse3(line, params, model) {
  // triangle
  // 3 <colour> x1 y1 z1 x2 y2 z2 x3 y3 z3
  var cmd = {
    type: parseInt(params[0]),
    color: parseInt(params[1], 10),
    x1: parseFloat(params[2]),
    y1: parseFloat(params[3]),
    z1: parseFloat(params[4]),
    x2: parseFloat(params[5]),
    y2: parseFloat(params[6]),
    z2: parseFloat(params[7]),
    x3: parseFloat(params[8]),
    y3: parseFloat(params[9]),
    z3: parseFloat(params[10])
  };
  addCommand(model, cmd);
}

function parse4(line, params, model) {
  // quad
  // 4 <colour> x1 y1 z1 x2 y2 z2 x3 y3 z3 x4 y4 z4
  var cmd = {
    type: parseInt(params[0]),
    color: parseInt(params[1], 10),
    x1: parseFloat(params[2]),
    y1: parseFloat(params[3]),
    z1: parseFloat(params[4]),
    x2: parseFloat(params[5]),
    y2: parseFloat(params[6]),
    z2: parseFloat(params[7]),
    x3: parseFloat(params[8]),
    y3: parseFloat(params[9]),
    z3: parseFloat(params[10]),
    x4: parseFloat(params[11]),
    y4: parseFloat(params[12]),
    z4: parseFloat(params[13])
  };
  addCommand(model, cmd);
}

function parse5(line, params, model) {
  // 5 <colour> x1 y1 z1 x2 y2 z2 x3 y3 z3 x4 y4 z4
  var cmd = {
    type: parseInt(params[0]),
    color: parseInt(params[1], 10),
    x1: parseFloat(params[2]),
    y1: parseFloat(params[3]),
    z1: parseFloat(params[4]),
    x2: parseFloat(params[5]),
    y2: parseFloat(params[6]),
    z2: parseFloat(params[7]),
    x3: parseFloat(params[8]),
    y3: parseFloat(params[9]),
    z3: parseFloat(params[10]),
    x4: parseFloat(params[11]),
    y4: parseFloat(params[12]),
    z4: parseFloat(params[13])
  };
  addCommand(model, cmd);
}

var parser = {
  '0': parse0,
  '1': parse1,
  '2': parse2,
  '3': parse3,
  '4': parse4,
  '5': parse5
};

currentStep = 0;

function parseModel(contents) {
  var model = {
    commands: []
  };
  var lines = contents.split('\n');
  lines.forEach(function (line) {
    line = line.trim();
    if (line === '') {
      return;
    }
    var params = parseLine(line);
    var fn = parser[params[0]];
    if (fn) {
      fn(line, params, model);
    } else {
      console.log('error parsing line: ' + line);
    }
  });
  return model;
};

module.exports = parseModel;
