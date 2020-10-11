const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const fn1 = async () => {
  console.log('start sleeping for 1s');
  await sleep(1000);
  console.log('finished sleeping')
}

const main = async () => {
  await fn1();
}

main();
