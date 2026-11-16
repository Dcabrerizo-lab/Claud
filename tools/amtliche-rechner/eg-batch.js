const A = require('./eg-amtlich.js');
(async () => { const { b, p } = await A.open();
  for (const f of JSON.parse(process.argv[2])) { const t = await A.rechne(p, f); const m = t.split('||').pop().trim(); console.log(JSON.stringify(f), '=>', m); }
  await b.close(); })();
