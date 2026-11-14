// Wertet den großen Abgleich aus: liest alle Teil-Dateien (gross-*.json) eines Ordners, rechnet jeden Fall mit SoLo
// und vergleicht mit dem amtlichen Ergebnis. Gleiche Regeln wie test/test-amtlich.js:
//   Wohngeld: SoLo-Betrag (obere Schätzung) auf 10 € genau wie amtlich; SoLo „eher nicht“ nur, wenn amtlich unter 10 €.
//   KiZ: amtlich ja -> SoLo nie „eher nicht“; amtlich nein -> SoLo nie „wahrscheinlich“.
// Aufruf: node tools/amtliche-rechner/gross-auswerten.js <Ordner> [--fixtures]   (--fixtures schreibt test/amtlich-gross-*.json)
const fs = require('fs'), path = require('path');
const R = require('../../src/rules.js');
const dir = process.argv[2]; const FIX = process.argv.includes('--fixtures');
const lies = (art) => fs.readdirSync(dir, { recursive: true }).filter((n) => new RegExp('gross-' + art + '-\\d+\\.json$').test(n))
  .flatMap((n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'))).sort((a, b) => a.i - b.i);
function wg(f) {
  const inp = { adults: f.adults, kids: f.kids, kidsU6: 0, art1: f.art, art2: f.art, brutto: f.b1 + f.b2, brutto2: f.b2, netto: 9000, miete: f.warm, mietstufe: String(f.stufe), vermoegen: 0, gebJahr: f.art === 'rente' ? 1955 : 1985, bezug: {}, heute: 2026.9 };
  const w = R.evaluate(inp).results.find((r) => r.id === 'wohngeld');
  const sp = w.tx.find((t) => /^schaetz\./.test(t[0]));
  return { level: w.level, betrag: !sp ? null : sp[1].b ? sp[1].b.eur : sp[1].a.eur };
}
function kiz(f) {
  const inp = { adults: f.partner ? 2 : 1, kids: f.alter.length, kidsU6: f.alter.filter((a) => a < 6).length, kids14: f.alter.filter((a) => a >= 14).length, art1: 'lohn', art2: 'ohne', brutto: f.brutto, netto: f.netto, miete: f.miete, mietstufe: '3', vermoegen: 0, gebJahr: 1988, bezug: { kindergeld: true }, heute: 2026.9 };
  return R.evaluate(inp).results.find((r) => r.id === 'kiz').level;
}
let fehler = 0;
const W = lies('wohngeld');
if (W.length) {
  let gleich = 0, ohne = 0, offen = 0; const anders = [];
  for (const x of W) {
    if (x.amtlich === null) { offen++; continue; }
    const s = wg(x.f);
    if (s.level !== 'nein' && s.betrag === null) { ohne++; continue; }
    const amt10 = Math.round(x.amtlich / 10) * 10;
    const ok = s.level === 'nein' ? x.amtlich < 10 : Math.abs(s.betrag - amt10) <= 10;
    if (ok) gleich++; else anders.push({ i: x.i, f: x.f, solo: s, amtlich: x.amtlich });
  }
  console.log('Wohngeld: ' + W.length + ' Fälle, gleich ' + gleich + ', ANDERS ' + anders.length + ', SoLo ohne Betrag ' + ohne + ', amtlich ohne Ergebnis ' + offen);
  anders.slice(0, 40).forEach((a) => console.log('  ANDERS ' + JSON.stringify(a)));
  fehler += anders.length;
  if (FIX) fs.writeFileSync(path.join(__dirname, '../../test/amtlich-gross-wohngeld.json'), JSON.stringify(W.filter((x) => x.amtlich !== null).map((x) => ({ f: x.f, amtlich: x.amtlich }))));
}
const K = lies('kiz');
if (K.length) {
  let ja = 0, nein = 0, offen = 0; const wider = [];
  for (const x of K) {
    if (x.amtlich === null) { offen++; continue; }
    const s = kiz(x.f); x.amtlich === 'ja' ? ja++ : nein++;
    if ((x.amtlich === 'ja' && s === 'nein') || (x.amtlich === 'nein' && s === 'ja')) wider.push({ i: x.i, f: x.f, solo: s, amtlich: x.amtlich });
  }
  console.log('KiZ: ' + K.length + ' Familien (Lotse ja ' + ja + ', nein ' + nein + ', ohne Ergebnis ' + offen + '), WIDERSPRÜCHE ' + wider.length);
  wider.slice(0, 40).forEach((a) => console.log('  WIDERSPRUCH ' + JSON.stringify(a)));
  fehler += wider.length;
  if (FIX) fs.writeFileSync(path.join(__dirname, '../../test/amtlich-gross-kiz.json'), JSON.stringify(K.filter((x) => x.amtlich !== null).map((x) => ({ f: x.f, amtlich: x.amtlich }))));
}
const E = lies('elterngeld');
if (E.length) {
  let gleich = 0, offen = 0; const anders = [];
  for (const x of E) {
    if (x.amtlich === null) { offen++; continue; }
    const e = R.evaluate({ baby: 'bald', egVor: x.f.vorher, art1: 'lohn', brutto: 2000, netto: 1500, heute: 2026.9, kids: x.f.geschwister ? 2 : 0, kidsU6: x.f.geschwister ? 2 : 0 }).results.find((r) => r.id === 'elterngeld');
    const solo = e.tx[0][1].basis.eur;
    if (Math.abs(solo - x.amtlich) <= 0.5) gleich++; else anders.push({ i: x.i, f: x.f, solo, amtlich: x.amtlich });
  }
  console.log('Elterngeld: ' + E.length + ' Fälle, gleich ' + gleich + ', ANDERS ' + anders.length + ', amtlich ohne Ergebnis ' + offen);
  anders.slice(0, 40).forEach((a) => console.log('  ANDERS ' + JSON.stringify(a)));
  fehler += anders.length;
  if (FIX) fs.writeFileSync(path.join(__dirname, '../../test/amtlich-gross-elterngeld.json'), JSON.stringify(E.filter((x) => x.amtlich !== null).map((x) => ({ f: x.f, amtlich: x.amtlich }))));
}
process.exit(fehler ? 1 : 0);
