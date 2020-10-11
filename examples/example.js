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
  // const part = await ldraw.findModel('rect.dat');
  // console.log('part: ', part);
  //const model = ldraw.searchModel('3001.dat');

  // const model = await ldraw.loadModel('10270%20-%20Bookshop.mpd');
  // console.log(model);
  // const model2 = await ldraw.loadModel('/examples/10270%20-%20Bookshop.mpd');
  // console.log(model2);
  const model3 = await ldraw.loadModel('http://localhost:8080/docs/examples/10270%20-%20Bookshop.mpd');
  console.log('\n\n\n-----------jason-----------------------')
  console.log(model3);

  // const model2 = await ldraw.loadModel('/docs/examples/10270%20-%20Bookshop.mpd');
  // console.log('\n\n\n-----------jason-----------------------')
  // console.log(model2);

  const models = Object.values(ldraw.cache.list).map(m => ({ name: m.name, type: m.type }))
  const display = (type) => console.log(type, models.filter(m => m.type === type));
  const displayAll = types => {
    for (const type of types) {
      display(type)
    }
    console.log('Other: ', models.filter(m => !types.includes(m.type)));
  }

  displayAll([
    'Subpart', 'Part', 'Primitive', 'Model', '8_Primitive', '48_Primitive',
    'Unofficial_Part', "Unofficial_Primitive", "Unofficial_Subpart"
  ]);
}

main();
