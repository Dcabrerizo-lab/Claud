// Wertet den großen Abgleich aus: liest alle Teil-Dateien (gross-*.json) eines Ordners, rechnet jeden Fall mit SoLo
// und vergleicht mit dem amtlichen Ergebnis. Gleiche Regeln wie test/test-amtlich.js:
//   Wohngeld: SoLo-Betrag (obere Schätzung) auf 10 € genau wie amtlich; SoLo „eher nicht“ nur, wenn amtlich unter 10 €.
//   KiZ: amtlich ja -> SoLo nie „eher nicht“; amtlich nein -> SoLo nie „wahrscheinlich“.
//   Elterngeld: SoLo rechnet nach § 2c Abs. 1 BEEG mit 102,50 € Abzug (1.230 € / 12), der Schnellrechner mit 83,33 € (Entscheidung David,
//   21.11.2026). Geprüft wird: amtlich = Formel mit 83,33 € auf den Cent, SoLo = Formel mit 102,50 € auf den Euro, Differenz bei festem Satz
//   = −Satz × 19,17 €, bei Mindest-/Höchstbetrag 0 € (test/referenz.js, egAbgleich). Keine aufgeweitete Toleranz.
// Aufruf: node tools/amtliche-rechner/gross-auswerten.js <Ordner> [--fixtures]   (--fixtures schreibt test/amtlich-gross-*.json)
const fs = require('fs'), path = require('path');
const dir = process.argv[2]; const FIX = process.argv.includes('--fixtures');
const lies = (art) => fs.readdirSync(dir, { recursive: true }).filter((n) => new RegExp('gross-' + art + '(-\\d+)?\\.json$').test(n))
  .flatMap((n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'))).sort((a, b) => a.i - b.i);
const { wg, kiz, eg } = require('./gross-solo.js');
const Ref = require('../../test/referenz.js');
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
    // Der KiZ-Lotse berücksichtigt Einkommen der Kinder nicht (geprüft 14.11.2026: selbst 2.000 € Unterhalt oder Lohn eines
    // 7-Jährigen ändern sein Ergebnis nicht). SoLo rechnet es nach § 6a Abs. 3 BKGG zu 45 % an; verglichen wird daher ohne Unterhalt.
    const s = kiz(Object.assign({}, x.f, { uh: 0 })); x.amtlich === 'ja' ? ja++ : nein++;
    if ((x.amtlich === 'ja' && s === 'nein') || (x.amtlich === 'nein' && s === 'ja')) wider.push({ i: x.i, f: x.f, solo: s, amtlich: x.amtlich });
  }
  console.log('KiZ: ' + K.length + ' Familien (Lotse ja ' + ja + ', nein ' + nein + ', ohne Ergebnis ' + offen + '), WIDERSPRÜCHE ' + wider.length);
  wider.slice(0, 40).forEach((a) => console.log('  WIDERSPRUCH ' + JSON.stringify(a)));
  fehler += wider.length;
}
const E = lies('elterngeld');
if (E.length) {
  let gleich = 0, offen = 0; const anders = [], gr = { satz: 0, grenze: 0, gleitend: 0, teilzeit: 0 };
  for (const x of E) {
    if (x.amtlich === null) { offen++; continue; }
    const solo = eg(x.f), a = Ref.egAbgleich(x.f, solo, x.amtlich);
    gr[a.gruppe]++;
    if (!a.fehler && a.diff <= 0) gleich++; else anders.push({ i: x.i, f: x.f, solo, amtlich: x.amtlich, erwartet: Math.round(a.gesetz * 100) / 100, fehler: a.fehler || 'SoLo über dem Schnellrechner' });
  }
  console.log('Elterngeld: ' + E.length + ' Fälle, Unterschied zum Schnellrechner genau aus dem Pauschbetrag erklärt (102,50 statt 83,33 €) ' + gleich + ' (fester Satz ' + gr.satz + ', Mindest-/Höchstbetrag ' + gr.grenze + ', gleitender Satz ' + gr.gleitend + '), ANDERS ' + anders.length + ', amtlich ohne Ergebnis ' + offen);
  anders.slice(0, 40).forEach((a) => console.log('  ANDERS ' + JSON.stringify(a)));
  fehler += anders.length;
}
// Feste Testfälle: je Fallart eine Datei (ein späterer Lauf einer anderen Art überschreibt nichts)
if (FIX) for (const art of ['wohngeld', 'wg2', 'wggrenz', 'kiz', 'kiz2', 'kizgrenz', 'elterngeld']) {
  const d = lies(art).filter((x) => x.amtlich !== null);
  if (d.length) fs.writeFileSync(path.join(__dirname, '../../test/amtlich-gross-' + art + '.json'), JSON.stringify(d.map((x) => ({ f: x.f, amtlich: x.amtlich }))));
}
process.exit(fehler ? 1 : 0);
