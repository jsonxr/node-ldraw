import fs from 'fs/promises';
import path from 'path';

interface File {
  name: string;
  dir: boolean;
}

const list = async (rootPath: string, subdir: string = '', filenames?: string[]) => {
  let allfiles = filenames ?? [];

  const entries: File[] = (await fs.readdir(path.join(rootPath, subdir), { withFileTypes: true }))
    .map(file => ({ name: file.name, dir: file.isDirectory() }));
  const files = entries.filter(file => !file.dir);
  const dirs = entries.filter(file => file.dir);

  // Gather the files
  files.forEach(file => allfiles.push(path.join(subdir, file.name)));

  // Recurse into the subdirs
  for (const dir of dirs) {
    await list(rootPath, path.join(subdir, dir.name), allfiles);
  }

  return allfiles;
}

async function main() {
  const filenames: string[] = await list('ldraw/p');
  const set = new Set(filenames);
  console.log(`export default new Set<string>(${JSON.stringify([...set], null, 2)});`);
}

main();
