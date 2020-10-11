import LDraw from '../dist/ldraw.js';

// const Ldraw = (options) => { }
// ldraw = new LDraw({
//   server: 'https://www.ldraw.org/library/official/parts',
//   parts: ['/parts', '/p'],
// })
const ldraw = new LDraw({
  hostname: 'http://localhost:8080',
  parts: ['/ldraw/parts', '/ldraw/p'],
})


async function main() {
  //const model = ldraw.searchModel('3001.dat');

  const model = await ldraw.loadModel('10270%20-%20Bookshop.mpd');
  console.log(model);
  const model2 = await ldraw.loadModel('/examples/10270%20-%20Bookshop.mpd');
  console.log(model2);
  const model3 = await ldraw.loadModel('http://localhost:8080/docs/examples/10270%20-%20Bookshop.mpd');
  console.log(model3);
}

main();
