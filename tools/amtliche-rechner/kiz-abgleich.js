const R = require('../../src/rules.js');
const A = require('./kiz-amtlich.js');
const N = Number(process.argv[2]) || 40;
let seed = 2026; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
(async () => {
  const { b, p } = await A.open(); const out = [];
  let gleich = 0, anders = 0, unsicher = 0;
  for (let i = 0; i < N; i++) {
    const partner = rnd() < 0.55, nk = pick([1, 1, 2, 2, 3]);
    const alter = Array.from({ length: nk }, () => Math.floor(rnd() * 17));
    const brutto = Math.round((500 + rnd() * 3800) / 10) * 10, netto = Math.round(brutto * (brutto < 1300 ? 0.8 : 0.7));
    const miete = Math.round((450 + rnd() * 900) / 10) * 10;
    const f = { alter, partner, brutto, netto, pBrutto: 0, pNetto: 0, miete };
    const inp = { adults: partner ? 2 : 1, kids: nk, kidsU6: alter.filter((a) => a < 6).length, kids14: alter.filter((a) => a >= 14).length, art1: 'lohn', art2: 'ohne', brutto, netto, miete, mietstufe: '3', vermoegen: 0, gebJahr: 1988, bezug: { kindergeld: true } };
    const k = R.evaluate(inp).results.find((r) => r.id === 'kiz');
    let amt; try { amt = await A.rechne(p, f); } catch (e) { amt = 'FEHLER ' + e.message.slice(0, 80); }
    const pos = /Aussicht auf Erfolg|Anspruch auf Kinderzuschlag haben/.test(amt) && !/keinen Anspruch/.test(amt), neg = /keinen Anspruch/.test(amt);
    let urteil;
    if (!pos && !neg) urteil = 'UNKLAR';
    else if (k.level === 'vielleicht') { urteil = 'unsicher'; unsicher++; }
    else if ((k.level === 'ja') === pos) { urteil = 'gleich'; gleich++; } else { urteil = 'ANDERS'; anders++; }
    out.push({ f, solo: k.level + ' ' + k.hl, amtlich: amt.slice(0, 200), urteil });
    console.log(urteil.padEnd(9), JSON.stringify(f), '| SoLo', k.level, k.hl, '| Lotse', amt.slice(0, 120));
  }
  await b.close();
  require('fs').writeFileSync(__dirname + '/kiz-abgleich.json', JSON.stringify(out, null, 1));
  console.log('\nErgebnis: gleich ' + gleich + ', anders ' + anders + ', SoLo „möglich“ ' + unsicher + ' von ' + N);
})();
