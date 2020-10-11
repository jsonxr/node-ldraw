import { distinct } from './utils.js';

export interface FileLine {
  readonly lineType?: number;
}

//------------------------------------------------------------------------------
// Line Type 0: Comments
//------------------------------------------------------------------------------

// Line Types: https://www.ldraw.org/article/218.html
export class Comment implements FileLine {
  readonly lineType: number = 0;
  tokens: string[];

  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  static parseTokens(tokens: string[]): Comment {
    return new Comment(tokens);
  }

  isCertify() {
    return ((this.tokens.length >= 2) && (this.tokens[1] === "BFC") && (this.tokens[2] === "CERTIFY"));
  }
  isCertifyCcw() {
    if ((this.isCertify()) && (this.tokens.length == 4)) {
      return this.tokens[3] === "CCW";
    }
    return true;
  }
  isAnimated() {
    return ((this.tokens.length >= 2) && (this.tokens[1] === "SIMPLEANIM") && (this.tokens[2] === "ANIMATED"));
  }
  animatedName() {
    return this.tokens[3];
  }
  isInvertNext() {
    return ((this.tokens.length >= 2) && (this.tokens[1] === "BFC") && (this.tokens[2] === "INVERTNEXT"));
  }
  isBfcCcw() {
    return ((this.tokens.length == 3) && (this.tokens[1] === "BFC") && (this.tokens[2] === "CCW"));
  }
  isBfcCw() {
    return ((this.tokens.length == 3) && (this.tokens[1] === "BFC") && (this.tokens[2] === "CW"));
  }
  isStep() {
    return ((this.tokens.length == 2) && (this.tokens[1] === "STEP"));
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
export class SubFile implements FileLine {
  readonly lineType?: number = 1;
  inverted: boolean = false;
  animated: boolean = false;
  animatedName: string | undefined;
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
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], inverted: boolean, animated: boolean, animatedName: string | undefined): SubFile {
    const file = tokens.slice(14).join(' ').toLowerCase().replace('\\', '/');
    const subFile = new SubFile({
      file: file,
      colour: parseInt(tokens[1], 10),
      inverted,
      animated,
      animatedName,
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
export class Line implements FileLine {
  readonly lineType?: number = 2;
  colour: number = 0;
  x1: number = 0;
  y1: number = 0;
  z1: number = 0;
  x2: number = 0;
  y2: number = 0;
  z2: number = 0;

  constructor(options?: any) {
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], lineNo?: number): Line {
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
export class Triangle implements FileLine {
  readonly lineType: number = 3;
  ccw: boolean = false;
  certified: boolean = false;
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
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], ccw: boolean, certified: boolean): Triangle {
    const triangle = new Triangle({
      ccw,
      certified,
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
export class Quadrilateral implements FileLine {
  readonly lineType: number = 4;
  ccw: boolean = false;
  certified: boolean = false;
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
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[], ccw: boolean, certified: boolean): Quadrilateral {
    const quad = new Quadrilateral({
      ccw,
      certified,
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

export class OptionalLine implements FileLine {
  readonly lineType: number = 5;
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
    Object.assign(this, options);
  }

  static parseTokens(tokens: string[]): OptionalLine {
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

class LDrawParser {
  index: number = 0;
  strings: string[];
  constructor(data: string | undefined | null) {
    this.strings = data ? data.trim().split('\n') : [];
  }
}


const parseHeaders = (info: LDrawParser, doc: SinglePartDoc): void => {
  const { strings } = info;

  const chompString = (command: string, column: number) => {
    const theTokens = info.strings[info.index].trim().split(/\s+/)
    if (theTokens[1] !== command) {
      throw new Error(`Error parsing: ${doc.name} Expected: ${command} Received: ${theTokens[1]}`);
    }
    info.index++;
    return theTokens.slice(column).join(' ');
  }

  const parseType = (doc: SinglePartDoc, info: LDrawParser) => {
    const theTokens = info.strings[info.index].trim().split(/\s+/)
    if (theTokens[1] !== '!LDRAW_ORG') {
      throw new Error(`Error parsing: ${doc.name} Expected: !LDRAW_ORG Received: ${theTokens[1]}`);
    }
    doc.type = theTokens[2];
    doc.update = theTokens.slice(3).join(' ');
    info.index++;
  }

  let tokens = strings[info.index].trim().split(/\s+/)
  if (tokens.length == 2) {
    doc.description = tokens.slice(1).join(' ');
  } else {
    doc.category = tokens[1];
    doc.description = tokens.slice(2).join(' ');
  }
  info.index++

  doc.name = chompString('Name:', 2).replace('\\', '/').toLowerCase();
  doc.author = chompString('Author:', 2);
  parseType(doc, info);
  doc.license = chompString('!LICENSE', 2);

  let isHeaders = true;
  while (isHeaders) {
    tokens = strings[info.index].trim().split(/\s+/)
    isHeaders = tokens[0] === '' || tokens[0] === '0' // comment or empty
    if (!isHeaders) {
      break;
    }

    switch (tokens[1]) {
      case '!HELP': doc.help.push(tokens.slice(2).join(' '))
        break;
      case '!CATEGORY': doc.category = doc.category = tokens.slice(2).join(' ')
        break;
      case '!KEYWORDS': doc.keywords = doc.keywords.concat(tokens.slice(2))
        break;
      case '!HISTORY': doc.history.push(tokens.slice(2).join(' '))
        break;
    }
    info.index++;
    isHeaders = info.index < strings.length;
  }
}

export class SinglePartDoc implements LDrawFile {
  name: string = ''
  description: string = ''
  author: string = ''
  type: string = ''
  license: string = ''
  help: string[] = []
  keywords: string[] = []
  category: string = ''
  history: string[] = []
  update: string = ''

  lines: FileLine[] = []

  getDocuments(): SinglePartDoc[] {
    return [this];
  }

  getSubFilenames(): string[] {
    return this.lines
      // .filter(l => l.lineType === 1)
      .filter(l => l instanceof SubFile)
      .map(l => (l as SubFile).file)
      .filter(distinct);
  }

  static parse(info: LDrawParser): SinglePartDoc {

    let inverted = false; // next should be inverted?
    let animated = false; // next should be animated?
    let animatedName = undefined; //valid only if animated
    let ccw = true; // dealing with ccw or cw ?
    let certified = false; // certified BFC ?

    const doc = new SinglePartDoc();
    parseHeaders(info, doc);
    for (const line of info.strings.slice(info.index)) {
      const tokens = line.trim().split(/\s+/)

      // Skip empty lines
      if (tokens[0] === '') {
        continue;
      }
      const lineType = tokens[0]

      switch (lineType) {
        case '0':
          const comment = Comment.parseTokens(tokens)
          doc.lines.push(comment);
          if (comment.isInvertNext()) {
              inverted = true;
          } else if (comment.isCertify()) {
              certified = true;
              ccw = comment.isCertifyCcw();
          } else if (comment.isBfcCcw()) {
              ccw = true;
          } else if (comment.isAnimated()) {
              animated = true;
              animatedName = comment.animatedName();
          } else if (comment.isBfcCw()) {
              ccw = false;
          }
          break;
        case '1':
          doc.lines.push(SubFile.parseTokens(tokens, inverted, animated, animatedName));
          inverted = false;
          animated = false;
          animatedName = undefined;
          break;
        case '2':
          doc.lines.push(Line.parseTokens(tokens));
          break;
        case '3':
          doc.lines.push(Triangle.parseTokens(tokens, ccw, certified));
          break;
        case '4':
          doc.lines.push(Quadrilateral.parseTokens(tokens, ccw, certified));
          break;
        case '5':
          doc.lines.push(OptionalLine.parseTokens(tokens));
          break;
        default:
          doc.lines.push(Comment.parseTokens(tokens));
      }
    }
    return doc;
  }
}

export class MultiPartDoc implements LDrawFile {
  docs: SinglePartDoc[] = [];

  getDocuments(): SinglePartDoc[] {
    return this.docs;
  }

  getSubFilenames(): string[] {
    return this.docs
      .map(d => d.getSubFilenames())
      .flat()
      .filter(distinct);
  }


  static parse({ strings }: LDrawParser) {
    let start = 0;
    let i = start;
    const multipart = new MultiPartDoc();
    while (i < strings.length - 1) {
      i++
      if (strings[i].startsWith('0 FILE ')) {
        multipart.docs.push(SinglePartDoc.parse({ index: 0, strings: strings.slice(start + 1, i) }));
        start = i;
      }
    }
    multipart.docs.push(SinglePartDoc.parse({ index: 0, strings: strings.slice(start + 1, i) }));
    return multipart;
  }
}

export interface LDrawFile {
  getDocuments(): SinglePartDoc[];
  getSubFilenames(): string[];
}
export type LDrawFileTypes = MultiPartDoc | SinglePartDoc | null;

const parse = (data: string | null): LDrawFileTypes => {
  const parser = new LDrawParser(data);
  if (parser.strings.length === 0) {
    return null;
  }

  if (parser.strings[0].startsWith('0 FILE ')) {
    return MultiPartDoc.parse(parser);
  }

  return SinglePartDoc.parse(parser);

}

export default parse;
