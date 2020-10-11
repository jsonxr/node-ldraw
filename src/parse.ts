
export class LDrawFileLine {
  lineType?: number;

  static parse(line: string, lineNo: number): LDrawFileLine {
    const li = line.trim();
    const tokens = li.split(/\s+/)

    if (!tokens || tokens.length === 0 || tokens[0] === '') {
      return new Empty();
    }

    const lineType = tokens[0]
    switch (lineType) {
      case '0': return Comment.parseTokens(tokens, lineNo);
      case '1': return SubFile.parseTokens(tokens, lineNo);
      case '2': return Line.parseTokens(tokens, lineNo);
      case '3': return Triangle.parseTokens(tokens, lineNo);
      case '4': return Quadrilateral.parseTokens(tokens, lineNo);
      case '5': return OptionalLine.parseTokens(tokens, lineNo);
      default: return Comment.parseTokens(tokens, lineNo);
    }
  }
}

export class Empty extends LDrawFileLine {}

//------------------------------------------------------------------------------
// Line Type 0: Comments
//------------------------------------------------------------------------------

// Line Types: https://www.ldraw.org/article/218.html
export class Comment extends LDrawFileLine {
  readonly lineType?: number = 0;
  comment: string = '';

  constructor(options?: any) {
    super();
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], lineNo?: number): LDrawFileLine {
    if (tokens.length === 1) {
      return new Comment();
    }

    if (lineNo === 0 && tokens[1] !== 'FILE') {
      return CommentFileTitle.parseTokens(tokens, lineNo);
    }

    if (tokens[1] === '//') {
      return new Comment({ comment: tokens.slice(2).join(' ') });
    }

    if (tokens[1].substr(0, 1) === '!') {
      return MetaCommand.parseTokens(tokens, lineNo);
    }

    const metas = ['Author:', 'Name:', 'FILE'];
    if (metas.includes(tokens[1])) {
      return MetaCommand.parseTokens(tokens, lineNo);
    }

    return new Comment({ comment: tokens.slice(1).join(' ') });
  }
}

export class CommentFileTitle extends LDrawFileLine {
  readonly lineType?: number = 0;
  title: string = '';

  constructor(options?: any) {
    super();
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], lineNo?: number): LDrawFileLine {
    return new CommentFileTitle({ title: tokens.slice(1).join(' ') })
  }
}

export class MetaCommand extends LDrawFileLine {
  readonly lineType?: number = 0;
  command: string = '';
  additional: string = '';

  constructor(options?: any) {
    super();
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], lineNo?: number): LDrawFileLine {
    return new MetaCommand({ command: tokens[1], additional: tokens.slice(2).join(' ') })
  }
}

//------------------------------------------------------------------------------
// Line Type 1: Sub-file reference
//------------------------------------------------------------------------------

/**
 * Line type 1 is a sub-file reference. The generic format is:
 *
 * `1 <colour> x y z a b c d e f g h i <file>`
 *
 * Where:
 *   - `<colour>` is a number representing the colour of the part.
 *   - `x y z` is the x y z coordinate of the part
 *   - `a b c d e f g h i` is a top left 3x3 matrix of a standard 4x4 homogeneous
 *     transformation matrix. This represents the rotation and scaling of
 *     the part. The entire 4x4 3D transformation matrix would then take either
 *     of the following forms:
 *
 *     ```
 *     / a d g 0 \   / a b c x \
 *     | b e h 0 |   | d e f y |
 *     | c f i 0 |   | g h i z |
 *     \ x y z 1 /   \ 0 0 0 1 /
 *     ```
 *
 *     The above two forms are essentially equivalent, but note the location of
 *     the transformation portion (x, y, z) relative to the other terms.
 *   - `<file>` is the filename of the sub-file referenced and must be a valid
 *     LDraw filename. Any leading and/or trailing whitespace must be ignored.
 *     Normal token separation is otherwise disabled for the filename value.
 *
 * Sub-files can be located in the
 *   - LDRAW\PARTS
 *   - LDRAW\P
 *   - LDRAW\MODELS
 *   - the current file's directory
 *
 *   - a path relative to one of these directories, or a full path may be specified.
 */
export class SubFile extends LDrawFileLine {
  readonly lineType?: number = 1;
  file: string = '';
  colour: number = 0;
  x: number = 0;
  y: number = 0;
  z: number = 0;
  a: number = 0;
  b: number = 0;
  c: number = 0;
  d: number = 0;
  e: number = 0;
  f: number = 0;
  g: number = 0;
  h: number = 0;
  i: number = 0;

  constructor(options: SubFile) {
    super();
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], lineNo?: number): LDrawFileLine {
    const file = tokens.slice(14).join(' ').toLowerCase().replace('\\', '/');
    const subFile = new SubFile({
      file: file,
      colour: parseInt(tokens[1], 10),
      x: parseFloat(tokens[2]),
      y: parseFloat(tokens[3]),
      z: parseFloat(tokens[4]),
      a: parseFloat(tokens[5]),
      b: parseFloat(tokens[6]),
      c: parseFloat(tokens[7]),
      d: parseFloat(tokens[8]),
      e: parseFloat(tokens[9]),
      f: parseFloat(tokens[10]),
      g: parseFloat(tokens[11]),
      h: parseFloat(tokens[12]),
      i: parseFloat(tokens[13]),
    });
    return subFile;
  }
}

//------------------------------------------------------------------------------
// Line Type 2: Line
//------------------------------------------------------------------------------

/**
 * Line type 2 is a line drawn between two points. The generic format is:
 *
 * 2 <colour> x1 y1 z1 x2 y2 z2
 *
 * Where:
 *   - <colour> is a number representing the colour of the part, typically this
 *     is 24 - the edge colour. See the Colours section for allowable colour
 *     numbers.
 *   - x1 y1 z1 is the coordinate of the first point
 *   - x2 y2 z2 is the coordinate of the second point
 *
 * Line type 2 (and also 5) is typically used to edge parts. When used in this
 * manner colour 24 must be used for the line. It should be remembered that not
 * all renderers display line types 2 and 5
 */
export class Line extends LDrawFileLine {
  readonly lineType?: number = 2;
  colour: number = 0;
  x1: number = 0;
  y1: number = 0;
  z1: number = 0;
  x2: number = 0;
  y2: number = 0;
  z2: number = 0;

  constructor(options?: any) {
    super();
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], lineNo?: number): LDrawFileLine {
    const line = new Line({
      colour: tokens[1],
      x1: tokens[2],
      y1: tokens[3],
      z1: tokens[4],
      x2: tokens[5],
      y2: tokens[6],
      z2: tokens[7],
    });
    return line;
  }
}

//------------------------------------------------------------------------------
// Line Type 3: Triangle
//------------------------------------------------------------------------------

/**
 * Line type 3 is a filled triangle drawn between three points. The generic
 * format is:
 *
 * 3 <colour> x1 y1 z1 x2 y2 z2 x3 y3 z3
 *
 * Where:
 *   - <colour> is a number representing the colour of the part. See the
 *     Colours section for allowable colour numbers.
 *   - x1 y1 z1 is the coordinate of the first point
 *   - x2 y2 z2 is the coordinate of the second point
 *   - x3 y3 z3 is the coordinate of the third point
 *
 * See also the comments about polygons at the end of the Line Type 4 section.
 */
export class Triangle extends LDrawFileLine {
  readonly lineType?: number = 3;
  colour: number = 0;
  x1: number = 0;
  y1: number = 0;
  z1: number = 0;

  x2: number = 0;
  y2: number = 0;
  z2: number = 0;

  x3: number = 0;
  y3: number = 0;
  z3: number = 0;


  constructor(options?: any) {
    super();
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], lineNo?: number): LDrawFileLine {
    const triangle = new Triangle({
      colour: tokens[1],
      x1: tokens[2],
      y1: tokens[3],
      z1: tokens[4],

      x2: tokens[5],
      y2: tokens[6],
      z2: tokens[7],

      x3: tokens[8],
      y3: tokens[9],
      z3: tokens[10],
    });
    return triangle;
  }
}

//------------------------------------------------------------------------------
// Line Type 4: Quadrilateral
//------------------------------------------------------------------------------

/**
 *
 * Line type 4 is a filled quadrilateral (also known as a "quad") drawn between
 * four points. The generic format is:
 *
 * 4 <colour> x1 y1 z1 x2 y2 z2 x3 y3 z3 x4 y4 z4
 *
 * Where:
 *   - <colour> is a number representing the colour of the part. See the Colours
 *     section for allowable colour numbers.
 *   - x1 y1 z1 is the coordinate of the first point
 *   - x2 y2 z2 is the coordinate of the second point
 *   - x3 y3 z3 is the coordinate of the third point
 *   - x4 y4 z4 is the coordinate of the fourth point
 */
export class Quadrilateral extends LDrawFileLine {
  readonly lineType?: number = 4;
  colour: number = 0;
  x1: number = 0;
  y1: number = 0;
  z1: number = 0;

  x2: number = 0;
  y2: number = 0;
  z2: number = 0;

  x3: number = 0;
  y3: number = 0;
  z3: number = 0;

  x4: number = 0;
  y4: number = 0;
  z4: number = 0;

  constructor(options?: any) {
    super();
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], lineNo?: number): LDrawFileLine {
    const quad = new Quadrilateral({
      colour: tokens[1],
      x1: tokens[2],
      y1: tokens[3],
      z1: tokens[4],

      x2: tokens[5],
      y2: tokens[6],
      z2: tokens[7],

      x3: tokens[8],
      y3: tokens[9],
      z3: tokens[10],

      x4: tokens[11],
      y4: tokens[12],
      z4: tokens[13],
    });
    return quad;
  }
}

//------------------------------------------------------------------------------
// Line Type 5: Optional Line
//------------------------------------------------------------------------------

export class OptionalLine extends LDrawFileLine {
  readonly lineType?: number = 5;
  colour: number = 0;
  x1: number = 0;
  y1: number = 0;
  z1: number = 0;

  x2: number = 0;
  y2: number = 0;
  z2: number = 0;

  x3: number = 0;
  y3: number = 0;
  z3: number = 0;

  x4: number = 0;
  y4: number = 0;
  z4: number = 0;

  constructor(options?: any) {
    super();
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], lineNo?: number): LDrawFileLine {
    const optionalLine = new OptionalLine({
      colour: tokens[1],
      x1: tokens[2],
      y1: tokens[3],
      z1: tokens[4],

      x2: tokens[5],
      y2: tokens[6],
      z2: tokens[7],

      x3: tokens[8],
      y3: tokens[9],
      z3: tokens[10],

      x4: tokens[11],
      y4: tokens[12],
      z4: tokens[13],
    });
    return optionalLine;
  }
}

export class MultiPartModel {
  static parse(index: number, lines: string[]) {

  }
}

/**
 *
 */
export class LDrawFile {
  name: string = '';
  lines: LDrawFileLine[] = [];

  constructor(options: LDrawFile) {
    Object.assign(this, options)
  }

  static parse(data: string | null): LDrawFile | null {
    if (! data) {
      return null;
    }

    const strings = data.trim().split('\n');
    if (strings[0] = '0 FILE ') {
      //
    } else {
      const lines: LDrawFileLine[] = [];
      strings.forEach((line, index) => {
        lines.push(LDrawFileLine.parse(line, index));
      })
      return new LDrawFile({ name, lines });
    }

    return null;
  }
}

export default LDrawFile.parse;
