// LDraw
// command color x y z a b c d e f g h i filename
//
// Example:
// 1 4 140 -24 -120 0 0 1 0 1 0 -1 0 0  3001.dat
// 1 = subfile
// 4 = red
// x = 140
// y = -24
// z = -120
// a..i is a 90deg rotation around the y axis.
const X=2,  Y=3,  Z=4, A=5,  B=6,  C=7, D=8,  E=9,  F=10, G=11, H=12, I=13;

// WebGL need the following matrix in column major order
//        WebGL          Array Index
//    / a, b, c, x \    0,  4,  8, 12
//    | d, e, f, y |    1,  5,  9, 13
//    | g, h, i, z |    2,  6, 10, 14
//    \ 0, 0, 0, 1 /    3,  7, 11, 15
//
function subfileLineToArray(line, r) {
  //     x   y   z    a b c d e f  g  h  i
  // 0 1 2   3   4    5 6 7 8 9 10 11 12 13 14
  // 1 4 140 -24 -120 0 0 1 0 1 0  -1  0 0  3001.dat
  const i = line.split(' ');

  r = r || [];
  r[0] = i[A]; r[4] = i[B];  r[8] = i[C]; r[12] = i[X];
  r[1] = i[D]; r[5] = i[E];  r[9] = i[F]; r[13] = i[Y];
  r[2] = i[G]; r[6] = i[H]; r[10] = i[I]; r[14] = i[Z];
  r[3] =    0; r[7] =    0; r[11] =    0; r[15] =    1;

  return r;
}

module.exports = subfileLineToArray;
