import parse, { LDrawFileTypes, MultiPartDoc, SinglePartDoc } from './parse.js';
import Cache from './Cache.js';

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

/**
 *
 * @param filename <string> - Filename to retrieve
 *    Examples:
 *      * http://localhost:8080/docs/examples/10270%20-%20Bookshop.mpd - (ignore origin)
 *      * /ldraw/models/10270%20-%20Bookshop.mpd  - (use baseUrl or window.location without the path info)
 *      * 10270%20-%20Bookshop.mpd  - (use origin or window.location with path info)
 * @param base <URL | string | undefined> - The prefix for this filename if filename is not
 *          http://localhost:8000
 *
 */
const getUrl = (filename: string, base: URL): URL => {
  let url: URL;
  try {
    url = new URL(filename); // This is complete http://localhost:8080/file.dat
  } catch {
    // Get the current directory for the base url
    const baseUrl: URL = base ?? new URL(window.location.href);
    url = new URL(filename, baseUrl);
  }

  return url;
}

interface LDrawProps {
  base?: string | URL;
  folders?: string[]
}
class LDraw implements LDrawProps {
  base = new URL(window.location.href);
  folders = ['/ldraw/parts', '/ldraw/p', '/ldraw/models']

  public cache = new Cache<MultiPartDoc | SinglePartDoc>();

  constructor(options: LDrawProps) {
    Object.assign(this, options);
    // folders MUST end with a "/" to find relative paths inside files
    this.folders = this.folders.map(f => f.endsWith('/') ? f : f + '/')
  }

  /**
   *
   * @param filename - the absolute path of the model to load.
   */
  async loadModel(filename: URL | string) {
    let url: URL = (typeof filename === 'string') ? getUrl(filename, this.base) : filename;
    const data = await fnLoadFile(url);
    const file = parse(data);

    if (file) {
      for (const doc of file.getDocuments()) {
        this.cache.set(doc.name, doc);
      }

      // Get array of baseURLs to try
      const baseUrls: URL[] = []
      for (const folder of this.folders) {
        baseUrls.push(new URL(folder, this.base));
      }
      baseUrls.push(url);

      // Download all files not in cache one at at time
      for (const doc of file.getDocuments()) {
        const filenames = doc.getSubFilenames()
          .filter(f => !this.cache.has(f))
        for (const subfile of filenames) {
          // TODO: Can't Support Absolute URLs in subfile line since
          await this.findModel(subfile, baseUrls);
        }
      }
    }

    return file;
  }

  async findModel(filename: string, base?: URL[]) {
    const baseUrls: { url: URL, folder?: string }[] = base ? base.map(b => ({url: b})) : []
    // Get array of baseURLs to try
    if (baseUrls.length === 0) {
      for (const folder of this.folders) {
        baseUrls.push({ folder, url: new URL(folder, this.base) });
      }
      baseUrls.push({ url: new URL(window.location.href) });
    }

    const file = await this.cache.get(filename, async (): Promise<LDrawFileTypes> => {
      for (const baseUrl of baseUrls) {
        const url = getUrl(filename, baseUrl.url);
        const model = await this.loadModel(url);
        if (model) {
          model.folder = baseUrl.folder;
          return model;
        }
      }
      return null;
    })
    return file;
  }
}

// /**
//  *
//  * loadModel
//  * searchForFile
//  * downloadAndParse
//  *
//  *
//  *
//  */
// export class Download {
//   private static downloads: Record<string, Download> = {}

//   private server: string | undefined;
//   private parts: string[];
//   private name: string;

//   private file: MultiPartDoc | SinglePartDoc | null = null;
//   private listeners: Function[] = [];

//   private constructor(server: string | undefined, parts: string[], name: string) {
//     this.server = server;
//     this.parts = parts;
//     this.name = name;
//     this.downloadAndParse();
//   }

//   static async loadModel(url: URL): Promise<LDrawFile> {
//     const data = await fnLoadFile(url);
//     return parse(data);
//   }

//   static async findModel(server: string | undefined, parts: string[], name: string): Promise<LDrawFile> {
//     let d: Download | undefined = Download.downloads[name];

//     // If there isn't a download yet, create one
//     if (!d) {
//       d = new Download(server, parts, name);
//       Download.downloads[name] = d;
//     }

//     return d.onComplete();
//   }

//   /**
//    * Download a part from the server
//    * @param server
//    * @param filename
//    */
//   private async searchForFile(partName: string): Promise<LDrawFile | null> {
//     const filename = partName.toLowerCase().replace('\\', '/');

//     // If we know it exists in the 'p' folder, add it The part is in either /parts or /p folders
//     const subfolders = pfiles.has(filename)
//         ? ['p'] // We know it's in p, so only check it
//         : ['parts', 'p', 'models'] // We don't know where it is so check both

//     for (const subfolder of subfolders) {
//       const data = await fnLoadFile(new URL(`${subfolder}/${filename}`));
//       const part: LDrawFile = parse(data);
//       if (part) {
//         return part;
//       }
//     }
//     return null;
//   }

//   private async downloadAndParse() {
//     let error: any
//     try {
//       const file = await this.searchForFile(this.name);
//       if (!file) {
//         throw new Error('Part not found ' + this.name);
//       }

//       // Get download promises for subparts
//       const subparts: Promise<LDrawFile>[] = file.lines
//         .filter(line => line.lineType === 1)
//         .map(line => {
//           const subfile = line as SubFile;
//           return Download.loadModel(new URL(subfile.file))
//         });
//       if (subparts) {
//         await Promise.all(subparts);
//       }

//       this.file = file;
//     } catch (err) {
//       error = err;
//     }

//     // Notify interested listeners
//     this.listeners.forEach(cb => cb(error));
//   }

//   private async onComplete() {
//     if (this.file) {
//       return this.file;
//       this.listeners = []; // Free up the listeners
//     }

//     // This allows many files to await this download
//     return new Promise<LDrawFile>((resolve, reject) => {
//       this.listeners.push((err: any) => {
//         if (err) {
//           return reject(err);
//         }
//         resolve(this.file!);
//       })
//     })
//   }

// }

export default LDraw;
