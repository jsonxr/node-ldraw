function parseLine(line) {
  if (line) {
    var re = /\s+/;
    return line.trim().split(re);
  } else {
    return null;
  }
}

module.exports = parseLine;
