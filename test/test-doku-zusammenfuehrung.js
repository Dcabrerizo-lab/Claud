// Wächter für Dateien, die Git ohne Konfliktmeldung zusammenführt (.gitattributes: merge=union):
// docs/AENDERUNGEN.md, docs/PRUEFBERICHT.md, docs/PRUEFLISTE.md und die Testlisten test/listen/*.txt.
// merge=union behält bei gleichzeitigen Änderungen BEIDE Seiten. Das ist für angehängte Zeilen richtig, kann aber eine
// geänderte Zeile doppelt (alt und neu) stehen lassen. Dieser Test meldet solche Reste:
//  1. keine Konfliktmarken (<<<<<<< ======= >>>>>>>),
//  2. Prüfliste: kein Regeltext zweimal (auch nicht mit anderem Status oder anderer Testmarke),
//  3. Änderungen und Prüfbericht: kein Aufzählungspunkt zweimal,
//  4. Testlisten: keine Zeile zweimal (tools/tests.js führt sie ohnehin nur einmal aus; hier wird aufgeräumt).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const lies = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const doppelt = (a) => [...new Set(a.filter((x, i) => a.indexOf(x) !== i))];

const listen = fs.readdirSync(path.join(ROOT, 'test', 'listen')).filter((f) => f.endsWith('.txt') && !f.startsWith('.')).map((f) => 'test/listen/' + f);
const dateien = ['docs/AENDERUNGEN.md', 'docs/PRUEFBERICHT.md', 'docs/PRUEFLISTE.md', ...listen];
for (const f of dateien) {
  const marken = lies(f).split('\n').filter((l) => /^(<{7}|={7}|>{7})( |$)/.test(l));
  ck('Keine Konfliktmarken in ' + f, marken.length === 0, marken.slice(0, 3));
}

const pl = lies('docs/PRUEFLISTE.md').split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l) && !/^\|\s*Regel\s*\|/.test(l));
const regeln = pl.map((l) => l.split('|')[1].trim());
const d1 = doppelt(regeln);
ck('Prüfliste: kein Regeltext zweimal (Rest einer Zusammenführung? alte Zeile löschen)', d1.length === 0, d1.map((s) => s.slice(0, 90)));

for (const f of ['docs/AENDERUNGEN.md', 'docs/PRUEFBERICHT.md']) {
  const punkte = lies(f).split('\n').filter((l) => /^\s*[-*] \S/.test(l) && l.trim().length > 30).map((l) => l.trim());
  const d = doppelt(punkte);
  ck(f + ': kein Aufzählungspunkt zweimal (Rest einer Zusammenführung? eine Zeile löschen)', d.length === 0, d.map((s) => s.slice(0, 90)));
}

for (const f of listen) {
  const z = lies(f).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const d = doppelt(z);
  ck(f + ': keine Zeile zweimal', d.length === 0, d);
}

console.log(fails ? fails + ' von ' + n + ' Prüfungen FEHLGESCHLAGEN' : 'Zusammenführung der Doku- und Listendateien: ' + n + ' Prüfungen bestanden');
process.exit(fails ? 1 : 0);
