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
  _missing: string[] = []

  public cache = new Cache<MultiPartDoc | SinglePartDoc>();


  public get list(): Record<string, MultiPartDoc | SinglePartDoc> {
    return this.cache.list;
  }

  public get missing(): string[] {
    return this._missing;
  }

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
        const filenames = doc.getSubFilenames();
        for (const f of filenames) {
          let subfile: LDrawFileTypes
          if (this.cache.has(f)) {
            subfile = await this.cache.get(f);
          } else {
            // TODO: Can't Support Absolute URLs in subfile line since
            subfile = await this.findModel(f, baseUrls);
          }
          subfile?.references.push(doc.name);
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
          return model;
        }
      }
      return null;
    })

    if (!file) {
      this._missing.push(filename);
    }

    return file;
  }
}

export default LDraw;
