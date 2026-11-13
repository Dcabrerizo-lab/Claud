// Wächter für die Prüfliste vom Gesetz her (docs/PRUEFLISTE.md). Er stellt sicher, dass
//  1. jede Karte der App (test/karten.js, gegengeprüft mit der Regel-Engine) einen Abschnitt in der Prüfliste hat,
//  2. jede Zeile mit ✓ oder ◐ mindestens eine Testmarke hat und es zu jeder Marke einen Test mit „[marke]“ im Namen gibt,
//  3. keine Zeile mit ✗ (fehlt) und keine Zeile ohne Status existiert, ○ (bewusst nicht eingebaut) nur mit Begründung,
//  4. keine Testmarke in den Tests steht, die in der Prüfliste fehlt (sonst veraltet die Liste unbemerkt).
'use strict';
const fs = require('fs');
const path = require('path');
const KARTEN = require('./karten.js');
const R = require('./rules-de.js');

let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };

const md = fs.readFileSync(path.join(__dirname, '..', 'docs', 'PRUEFLISTE.md'), 'utf8');
const testDir = __dirname;
const testCode = fs.readdirSync(testDir).filter((f) => /\.js$/.test(f) && f !== 'test-pruefliste.js').map((f) => fs.readFileSync(path.join(testDir, f), 'utf8')).join('\n');

// 1. Karten: Liste = Engine = Prüfliste
const engine = R.evaluate({ adults: 1, kids: 0, young: 0, bezug: {} }).results.map((r) => r.id);
ck('Kartenliste test/karten.js stimmt mit der Regel-Engine überein', engine.slice().sort().join() === KARTEN.slice().sort().join(), { nurEngine: engine.filter((x) => !KARTEN.includes(x)), nurListe: KARTEN.filter((x) => !engine.includes(x)) });
const inListe = [];
md.replace(/<!--\s*karten:\s*([^>]*?)\s*-->/g, (m, ids) => { ids.split(',').map((s) => s.trim()).filter(Boolean).forEach((id) => inListe.push(id)); return m; });
const fehlend = KARTEN.filter((id) => !inListe.includes(id));
ck('Jede Karte hat einen Abschnitt in der Prüfliste', fehlend.length === 0, fehlend.join(', '));
const unbekannt = inListe.filter((id) => !KARTEN.includes(id));
ck('Prüfliste nennt keine unbekannten Karten', unbekannt.length === 0, unbekannt.join(', '));
const doppelt = inListe.filter((id, i) => inListe.indexOf(id) !== i);
ck('Keine Karte in zwei Abschnitten', doppelt.length === 0, doppelt.join(', '));

// 2./3. Zeilen der Tabellen
const zeilen = md.split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l) && !/^\|\s*Regel\s*\|/.test(l));
ck('Prüfliste hat Tabellenzeilen', zeilen.length > 50, zeilen.length);
const marken = new Set();
zeilen.forEach((l) => {
  const sp = l.split('|').slice(1, -1).map((s) => s.trim());
  const regel = sp[0], status = sp[1] || '', test = sp[2] || '';
  ck('Zeile hat drei Spalten: ' + regel, sp.length === 3, sp.length);
  ck('Kein ✗ (fehlt): ' + regel, !/✗/.test(status), status);
  ck('Zeile hat einen Status: ' + regel, /[✓◐○]/.test(status), status);
  const tags = (test.match(/`([a-z0-9-]+)`/gi) || []).map((t) => t.replace(/`/g, ''));
  if (/[✓◐]/.test(status)) ck('Zeile mit ✓/◐ hat eine Testmarke: ' + regel, tags.length > 0, test);
  if (/○/.test(status) && !/[✓◐]/.test(status)) ck('○ nur mit Begründung: ' + regel, /○\s*\(.{10,}\)/.test(status), status);
  tags.forEach((t) => marken.add(t));
});
marken.forEach((t) => ck('Zur Marke [' + t + '] gibt es einen Test', testCode.includes('[' + t + ']')));

// 4. Marken in den Tests, die die Prüfliste nicht kennt
const inTests = new Set([...testCode.matchAll(/\b(?:ck|check|ok|console\.log)\(\s*'((?:\[[a-zA-Z0-9-]+\]\s*)+)/g)].flatMap((m) => m[1].match(/[a-zA-Z0-9-]+/g)));
const verwaist = [...inTests].filter((t) => !marken.has(t));
ck('Keine Testmarke ohne Zeile in der Prüfliste', verwaist.length === 0, verwaist.join(', '));

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : 'Prüflisten-Test bestanden: ' + KARTEN.length + ' Karten, ' + zeilen.length + ' Regeln, ' + marken.size + ' Testmarken, alle mit Test');
process.exit(fails ? 1 : 0);
