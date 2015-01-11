/**
 * Some LDraw programs export ugly LDraw numbers that are like 9.99999994 when
 * it should be 10. This will clean up the contents so it will have a more
 * compact representation.
 *
 * @param contents
 */
function clean(contents, EPSILON) {
  EPSILON = EPSILON || 0.000001;
  function roundLDU(value) {
    Math.round(value)
    if ((value - Math.round(value)) <= EPSILON || (Math.round(value) - value) <= EPSILON) {
      return Math.round(value);
    } else {
      return value;
    }
  }

  function cleanup1(params) {
    for (var i = 2; i <= 13; i++) {
      params[i] = roundLDU(params[i]);
    }
  }

  var lines = contents.split('\n');
  var out = [];
  lines.forEach(function (line) {
    var params = line.split(' ');
    if (params[0] == 1) {
      cleanup1(params)
      out.push(params.join(' '));
    } else {
      out.push(line);
    }
  });
  return out.join('\n');
}

module.exports = clean;
