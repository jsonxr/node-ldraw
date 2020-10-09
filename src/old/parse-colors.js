var parseLine = require('./parse-line');

/*

Parses the LDConfig.ldr file for the colors:

Returns an array indexed by the color code.

var colors = parseColors(LDConfig);
var color = colors[114] = {
 NAME: 'Glitter_Trans_Dark_Pink',
 CODE: 114,
 VALUE: '#DF6695',
 EDGE: '#9A2A66',
 ALPHA: 128,
 MATERIAL: 'GLITTER',
 GLITTER_VALUE: '#923978',
 FRACTION: '0.17',
 VFRACTION: '0.2',
 SIZE: 1,
 LEGOID: '114 - Tr. Medium Reddish-Violet w. Glitter 2%'
}

 */

var state = null;

function parseColors(LDConfig) {
  var colors = {};
  var lines = LDConfig.split('\n');

  function getColor(params) {
    var color = {};
    color.NAME = params[2];
    for (var i = 3; i < params.length; i = i + 2) {
      //console.log(i + ': ' + params[i] + '=' + params[i+1]);
      if (params[i] && params[i+1]) {
        if (params[i - 2] === 'MATERIAL' && params[i] === 'VALUE') {
          color[params[i - 1] + '_VALUE'] = params[i+1];
        } else {
          color[params[i]] = params[i + 1];
          if (params[i + 1] == parseInt(params[i+1], 10)) {
            color[params[i]] = parseInt(params[i+1], 10);
          }
        }
      } else {
        // Material must be the last parameter on a line according to spec
        color.MATERIAL = params[i];
      }
    }
    return color;
  }

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    // Skip blank lines
    if (line === '') {
      state = null;
      continue;
    }

    // Does it have a LEGOID? If so, parse it and add it to color object
    // 0                              // LEGOID  26 - Black
    legoIdIdx = line.indexOf('LEGOID');
    if (legoIdIdx > 0) {
      // 0                              // LEGOID  26 - Black
      legoId = line.substr(legoIdIdx + 6).trim();
      i = i + 1;
      line = lines[i].trim();
    } else {
      legoId = null;
    }

    // Parse the color line
    // 0 !COLOUR Black      CODE   0   VALUE #05131D   EDGE #595959
    var params = parseLine(line);
    if (params && params[0] == 0 && params[1] == '!COLOUR') {
      var color = getColor(params);
      if (!color.MATERIAL) {
        if (color.ALPHA) {
          color.MATERIAL ='TRANSPARENT';
        } else {
          color.MATERIAL = 'SOLID';
        }
      }
      if (legoId) {
        color.LEGOID = legoId;
      }
      legoIdIdx = null;
      colors[color.CODE] = color;
    }

  }

  return colors;
}

module.exports = parseColors;
