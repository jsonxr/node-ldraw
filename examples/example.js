import LDraw from '../dist/ldraw.js';

// const Ldraw = (options) => { }
// ldraw = new LDraw({
//   server: 'https://www.ldraw.org/library/official/parts',
//   parts: ['/parts', '/p'],
// })
const ldraw = new LDraw({
  hostname: 'http://localhost:8080',
  folders: ['/static/ldraw/parts', '/static/ldraw/p'],
})


async function main() {
  // const part = await ldraw.findModel('rect.dat');
  // console.log('part: ', part);
  //const model = ldraw.searchModel('3001.dat');
// const model = await ldraw.loadModel('/parts/3001.dat');
// console.log(model);
//'/media/LDraw%20models/10270-1%20-%20Bookshop/10270%20-%20Bookshop.mpd'
const model1 = await ldraw.loadModel(
  '/media/LDraw%20models/10270-1%20-%20Bookshop/10270%20-%20Bookshop.mpd'
  )
console.log(model1);

// const model2 = await ldraw.findModel('3005.dat')
// console.log(model2);

  // const model = await ldraw.loadModel('10270%20-%20Bookshop.mpd');
  // console.log(model);
  // const model2 = await ldraw.loadModel('/examples/10270%20-%20Bookshop.mpd');
  // console.log(model2);
  // const model3 = await ldraw.loadModel('http://localhost:8080/docs/examples/10270%20-%20Bookshop.mpd');
  // console.log('\n\n\n-----------jason-----------------------')

  // const model3 = await ldraw.loadModel('http://localhost:8080/docs/examples/10270%20-%20Bookshop.mpd');
  // console.log('\n\n\n-----------jason-----------------------')
  // console.log(model3);


  // const model2 = await ldraw.loadModel('/docs/examples/10270%20-%20Bookshop.mpd');
  // console.log('\n\n\n-----------jason-----------------------')
  // console.log(model2);

  window.ldraw = ldraw;

  const models = Object.values(ldraw.cache.list)
  const display = (type) => {
    const filtered = models.filter(m => m.type === type).map(m => ({
      ...m, link: `https://www.ldraw.org/parts/official-part-lookup.html?partid=${m.name}`
    }));
    console.log(type, filtered);
  };
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

  const part = ldraw.cache.list["3001.dat"]


  const div = document.getElementById('root')

    const filtered = models.filter(m => m.type === 'Part').map(m => ({
      ...m, link: `https://www.ldraw.org/parts/official-part-lookup.html?partid=${m.name}`
    })).forEach(m => {
      const d = document.createElement('div');
      d.style.display = 'inline';
      d.innerHTML = `<a href="${m.link}"><img src="https://www.ldraw.org/library/official/images/parts/${m.name.replace(".dat", ".png")}"><br>${m.name}</a>`
      div.appendChild(d);
    })

}

main();
