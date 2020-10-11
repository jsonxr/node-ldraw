import parse, { LDrawFile, SubFile } from './parse.js';
import pfiles from './generated/p.js';
import { AsyncCache } from './AsyncCache.js';

const cache = new AsyncCache<LDrawFile>();

// http://www.ldraw.org/library/official/'


/**
 * Load file via fetch to same server in /ldraw folder
 * @param filename
 */
const fnLoadFile = async (url: URL) => {
  try {
    const response = await fetch(`${url.href}`);
    if (!response.ok) return null;
    return await response.text();
  } catch (err) { } // Ignore any errors
  return null;
}


//----------------------------------------------------------------------------
// Manage Download of parts
//----------------------------------------------------------------------------

interface LDrawProps {
  origin: string;
  parts: string[];
}
class LDraw {
  origin?: string = new URL(window.location.href).origin;
  parts: string[] = [];
  constructor(options: LDrawProps) {
    Object.assign(this, options);
  }

  getUrl(filename: string): URL {
    let url: URL;
    try {
      url = new URL(filename);
    } catch {
      url = new URL(window.location.href);
      url.pathname = (filename.charAt(0) === '/')
        ? filename
        : url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1) + filename;
    }

    return url;
  }

  async loadModel(filename: string) {
    const url = this.getUrl(filename);
    const file = await cache.get(filename, async (): Promise<LDrawFile | null> => {
      const data = await fnLoadFile(url);
      const model = LDrawFile.parse(data);
      if (model && !model.name) {
        model.name = filename;
      }
      return model;
    })
    return file;
  }

  async findModel(filename: string) {
    const file = await Download.findModel(this.server, this.parts, filename);
  }
}

/**
 *
 * loadModel
 * searchForFile
 * downloadAndParse
 *
 *
 *
 */
export class Download {
  private static downloads: Record<string, Download> = {}

  private server: string | undefined;
  private parts: string[];
  private name: string;

  private file: LDrawFile | null = null;
  private listeners: Function[] = [];

  private constructor(server: string | undefined, parts: string[], name: string) {
    this.server = server;
    this.parts = parts;
    this.name = name;
    this.downloadAndParse();
  }

  static async loadModel(url: URL): Promise<LDrawFile | undefined> {
    const data = await fnLoadFile(url);
    if (data) {
      const part: LDrawFile = LDrawFile.parse(data);
      return part;
    }
  }

  static async findModel(server: string | undefined, parts: string[], name: string): Promise<LDrawFile> {
    let d: Download | undefined = Download.downloads[name];

    // If there isn't a download yet, create one
    if (!d) {
      d = new Download(server, parts, name);
      Download.downloads[name] = d;
    }

    return d.onComplete();
  }

  /**
   * Download a part from the server
   * @param server
   * @param filename
   */
  private async searchForFile(partName: string): Promise<LDrawFile | null> {
    const filename = partName.toLowerCase().replace('\\', '/');

    // If we know it exists in the 'p' folder, add it The part is in either /parts or /p folders
    const subfolders = pfiles.has(filename)
        ? ['p'] // We know it's in p, so only check it
        : ['parts', 'p', 'models'] // We don't know where it is so check both

    for (const subfolder of subfolders) {
      const data = await fnLoadFile(new URL(`${subfolder}/${filename}`));
      if (data) {
        const part: LDrawFile = parse(data);
        return part;
      }
    }
    return null;
  }

  private async downloadAndParse() {
    let error: any
    try {
      const file = await this.searchForFile(this.name);
      if (!file) {
        throw new Error('Part not found ' + this.name);
      }

      // Get download promises for subparts
      const subparts: Promise<LDrawFile | undefined>[] = file.lines
        .filter(line => line.lineType === 1)
        .map(line => {
          const subfile = line as SubFile;
          return Download.loadModel(new URL(subfile.file))
        });
      if (subparts) {
        await Promise.all(subparts);
      }

      this.file = file;
    } catch (err) {
      error = err;
    }

    // Notify interested listeners
    this.listeners.forEach(cb => cb(error));
  }

  private async onComplete() {
    if (this.file) {
      return this.file;
      this.listeners = []; // Free up the listeners
    }

    // This allows many files to await this download
    return new Promise<LDrawFile>((resolve, reject) => {
      this.listeners.push((err: any) => {
        if (err) {
          return reject(err);
        }
        resolve(this.file!);
      })
    })
  }

}

export default LDraw;