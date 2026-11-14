// Abgleich SoLo-Wohngeld (obere Schätzung = voller Pauschalabzug) mit dem amtlichen Wohngeldrechner des BMWSB
const R = require('../../src/rules.js');
const A = require('./wg-amtlich.js');
const N = Number(process.argv[2]) || 60;
let seed = 4711; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const HEIZ = [110.4, 142.6, 170.2, 197.8, 225.4];
const faelle = [];
for (let i = 0; i < N; i++) {
  const adults = pick([1, 1, 2]), kids = pick([0, 0, 1, 2, 3]), art = pick(['lohn', 'lohn', 'rente']);
  const persons = adults + kids, stufe = 1 + Math.floor(rnd() * 7);
  const b1 = Math.round((art === 'rente' ? 600 + rnd() * 1200 : 900 + rnd() * 2600) / 10) * 10;
  const b2 = adults === 2 ? pick([0, 0, Math.round((400 + rnd() * 1500) / 10) * 10]) : 0;
  const warm = Math.round((350 + rnd() * 900 + persons * 60) / 10) * 10;
  faelle.push({ adults, kids, art, persons, stufe, b1, b2, warm });
}
(async () => {
  const { b, p } = await A.open();
  const out = [], ohne = []; let gleich = 0, n = 0;
  for (const f of faelle) {
    const inp = { adults: f.adults, kids: f.kids, kidsU6: 0, art1: f.art, art2: f.art, brutto: f.b1 + f.b2, brutto2: f.b2, netto: process.env.NETTO_HOCH ? 9000 : Math.round((f.b1 + f.b2) * 0.75), miete: f.warm, mietstufe: String(f.stufe), vermoegen: 0, gebJahr: f.art === 'rente' ? 1955 : 1985, bezug: {} };
    const w = R.evaluate(inp).results.find((r) => r.id === 'wohngeld');
    const sp = w.tx.find((t) => /^schaetz\./.test(t[0]));
    const solo = !sp ? 0 : sp[1].b ? sp[1].b.eur : sp[1].a.eur;
    const heiz = HEIZ[Math.min(f.persons, 5) - 1] + Math.max(0, f.persons - 5) * 27.6;
    const kalt = Math.max(0, f.warm - heiz);
    const abz = f.art === 'lohn' ? { steuer: true, kv: true, rv: true } : { steuer: true, kv: true };
    const wk = f.art === 'lohn' ? 102.5 : 8.5;
    const mitglieder = [Object.assign({ ek: f.b1, wk: Math.min(wk, f.b1) }, abz)];
    if (f.adults === 2) mitglieder.push(f.b2 > 0 ? Object.assign({ ek: f.b2, wk: Math.min(wk, f.b2) }, abz) : { ek: 0 });
    for (let k = 0; k < f.kids; k++) mitglieder.push({ ek: 0 });
    let amt = '';
    try { amt = (await A.rechne(p, { miete: kalt, stufe: f.stufe, mitglieder, allein: f.adults === 1 && f.kids > 0 })).r; } catch (e) { amt = 'FEHLER ' + e.message.slice(0, 60); }
    const amtZ = Number(String(amt).replace(',', '.')), amt10 = isFinite(amtZ) ? Math.round(amtZ / 10) * 10 : NaN;
    const ohneBetrag = w.level !== 'nein' && !sp;
    const ok = isFinite(amtZ) && (ohneBetrag ? true : w.level === 'nein' ? amtZ < 10 : Math.abs(solo - amt10) <= 10);
    if (ohneBetrag) { ohne.push({ f, hl: w.hl, amtlich: amt }); console.log('ohne Betrag (' + w.hl + ') amtlich ' + amt); continue; }
    n++; if (ok) gleich++;
    out.push({ f, soloStufe: w.level, solo, amtlich: amt, ok });
    console.log((ok ? 'gleich  ' : 'ANDERS  ') + JSON.stringify({ f, solo: w.level + ' ' + solo, amtlich: amt }));
  }
  await b.close();
  require('fs').writeFileSync(__dirname + '/wg-abgleich-ergebnis.json', JSON.stringify(out, null, 1));
  console.log('\nErgebnis: ' + gleich + ' von ' + n + ' Fällen gleich (auf 10 € gerundet); ohne Betrag in SoLo: ' + ohne.length);
})();
