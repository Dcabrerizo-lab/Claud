// Wertet den großen Abgleich aus: liest alle Teil-Dateien (gross-*.json) eines Ordners, rechnet jeden Fall mit SoLo
// und vergleicht mit dem amtlichen Ergebnis. Gleiche Regeln wie test/test-amtlich.js:
//   Wohngeld: SoLo-Betrag (obere Schätzung) auf 10 € genau wie amtlich; SoLo „eher nicht“ nur, wenn amtlich unter 10 €.
//   KiZ: amtlich ja -> SoLo nie „eher nicht“; amtlich nein -> SoLo nie „wahrscheinlich“.
// Aufruf: node tools/amtliche-rechner/gross-auswerten.js <Ordner> [--fixtures]   (--fixtures schreibt test/amtlich-gross-*.json)
const fs = require('fs'), path = require('path');
const dir = process.argv[2]; const FIX = process.argv.includes('--fixtures');
const lies = (art) => fs.readdirSync(dir, { recursive: true }).filter((n) => new RegExp('gross-' + art + '(-\\d+)?\\.json$').test(n))
  .flatMap((n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'))).sort((a, b) => a.i - b.i);
const { wg, kiz, eg } = require('./gross-solo.js');
let fehler = 0;
const W = ['wohngeld', 'wg2', 'wggrenz'].flatMap(lies);
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
}
const K = ['kiz', 'kiz2', 'kizgrenz'].flatMap(lies);
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
}
const E = lies('elterngeld');
if (E.length) {
  let gleich = 0, offen = 0; const anders = [];
  for (const x of E) {
    if (x.amtlich === null) { offen++; continue; }
    const solo = eg(x.f);
    if (Math.abs(solo - x.amtlich) <= 0.5) gleich++; else anders.push({ i: x.i, f: x.f, solo, amtlich: x.amtlich });
  }
  console.log('Elterngeld: ' + E.length + ' Fälle, gleich ' + gleich + ', ANDERS ' + anders.length + ', amtlich ohne Ergebnis ' + offen);
  anders.slice(0, 40).forEach((a) => console.log('  ANDERS ' + JSON.stringify(a)));
  fehler += anders.length;
}
// Feste Testfälle: je Fallart eine Datei (ein späterer Lauf einer anderen Art überschreibt nichts)
if (FIX) for (const art of ['wohngeld', 'wg2', 'wggrenz', 'kiz', 'kiz2', 'kizgrenz', 'elterngeld']) {
  const d = lies(art).filter((x) => x.amtlich !== null);
  if (d.length) fs.writeFileSync(path.join(__dirname, '../../test/amtlich-gross-' + art + '.json'), JSON.stringify(d.map((x) => ({ f: x.f, amtlich: x.amtlich }))));
}
process.exit(fehler ? 1 : 0);
