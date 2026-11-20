#!/usr/bin/env node
// Kontrast der Farbpalette messen (WCAG 2.2: Text mind. 4,5:1, große Schrift und Symbole mind. 3:1).
// Liest die Palette aus src/template.html (:root hell und :root[data-theme="dark"]) und prüft alle Schrift-/Flächen-Paare.
// Aufruf: node tools/kontrast-pruefen.js [--tabelle]   (läuft in npm test; Exit-Code 1 bei Verstoß)
'use strict';
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'template.html'), 'utf8');

function vars(block) {
  const o = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) o[m[1]] = m[2].trim();
  return o;
}
function block(re) { const m = css.match(re); if (!m) throw new Error('Palette nicht gefunden: ' + re); return m[1]; }
const hell = vars(block(/:root \{([\s\S]*?)\n {2}\}/));
const dunkel = Object.assign({}, hell, vars(block(/:root\[data-theme="dark"\] \{([\s\S]*?)\n {2}\}/)));

function hex(v, pal, tiefe = 0) {
  if (tiefe > 10) throw new Error('Zirkelbezug ' + v);
  const r = v.match(/^var\(--([a-z0-9-]+)\)$/);
  if (r) return hex(pal[r[1]], pal, tiefe + 1);
  const h = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!h) throw new Error('Keine Farbe: ' + v);
  let s = h[1]; if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
function mix(a, b, anteilA) { return a.map((x, i) => Math.round(x * anteilA + b[i] * (1 - anteilA))); }
function lum(rgb) {
  const [r, g, b] = rgb.map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function kontrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

// [Bereich, Schrift, Fläche, Mindestwert]; Fläche darf {mix:[farbe, anteil, farbe]} sein (wie color-mix im CSS)
const BEREICHE = ['leistungen', 'briefe', 'pfaendung', 'sparen', 'pflege', 'ausziehen'];
const ABSENDER = ['jobcenter', 'sozialamt', 'wohngeld', 'familienkasse', 'pflegekasse', 'vermieter', 'anderer', 'formular'];
const paare = [
  ['Text auf Hintergrund', 'ink', 'bg', 4.5], ['Text auf Karte', 'ink', 'surface', 4.5],
  ['Nebentext auf Hintergrund', 'muted', 'bg', 4.5], ['Nebentext auf Karte', 'muted', 'surface', 4.5],
  ['Bedienfarbe (Petrol) auf Karte', 'accent', 'surface', 4.5], ['Bedienfarbe auf Hintergrund', 'accent', 'bg', 4.5],
  ['Knopfschrift auf Bedienfarbe', 'accent-ink', 'accent', 4.5], ['Bedienfarbe auf hellem Petrol', 'accent', 'accent-soft', 4.5],
  ['Ergebnis „Wahrscheinlich“', 'ok', 'ok-bg', 4.5], ['Ergebnis „Möglich“', 'warn', 'warn-bg', 4.5],
  ['Ergebnis „Nicht“', 'bad', 'bad-bg', 4.5], ['Ergebnis „Keine Angabe“', 'na', 'na-bg', 4.5],
  ['Hinweis (Koralle)', 'hint', 'hint-bg', 4.5], ['Warnung (Hinweisbox)', 'warn', 'warn-bg', 4.5],
  ['Plakette „fehlt“', 'bad-on', 'bad', 4.5], ['Erkanntes Feld (Brief)', 'mark-ink', 'mark-bg', 4.5],
  ['Feldrand auf Karte', 'field', 'surface', 3], ['Fokusrahmen auf Hintergrund', 'focus', 'bg', 3],
  ['Antragsmappe (Papier)', 'papier-ink', 'papier', 4.5], ['Link in der Antragsmappe', 'papier-link', 'papier', 4.5],
  ['Start: „Los geht\'s“', 'c-leistungen', 'on-c', 4.5],
  ...BEREICHE.map((b) => ['Bereich ' + b + ': weiße Schrift auf Kachel', 'on-c', 'c-' + b, 4.5]),
  ...BEREICHE.map((b) => ['Bereich ' + b + ': Farbe als Schrift auf Karte', 'c-' + b + '-t', 'surface', 4.5]),
  ...BEREICHE.map((b) => ['Bereich ' + b + ': Farbe als Schrift auf Hintergrund', 'c-' + b + '-t', 'bg', 4.5]),
  ...ABSENDER.map((a) => ['Absender ' + a + ': weiße Schrift auf Kachel', 'on-c', 'c-' + a, 4.5]),
  ['Pflege: Einheit (Monat)', 'c-pflege-t', { mix: ['c-pflege', 0.14, 'surface'] }, 4.5],
];

let fehler = 0;
const zeilen = [];
for (const [name, fg, bg, min] of paare) {
  const werte = [hell, dunkel].map((pal) => {
    const f = hex('var(--' + fg + ')', pal);
    const h = typeof bg === 'string' ? hex('var(--' + bg + ')', pal) : mix(hex('var(--' + bg.mix[0] + ')', pal), hex('var(--' + bg.mix[2] + ')', pal), bg.mix[1]);
    return kontrast(f, h);
  });
  const ok = werte.every((w) => w >= min);
  if (!ok) fehler++;
  zeilen.push('| ' + name + ' | ' + werte.map((w) => w.toFixed(2)).join(' | ') + ' | ' + min + ' | ' + (ok ? 'ok' : 'ZU WENIG') + ' |');
}
// Absender-Farben müssen sich unterscheiden (dieselbe Farbe nur bei gleicher Sache)
const gleich = { jobcenter: 'leistungen', pflegekasse: 'pflege', vermieter: 'ausziehen', anderer: 'briefe' };
if (process.argv.includes('--tabelle')) console.log('| Paar | hell | dunkel | mind. | Ergebnis |\n|---|---|---|---|---|\n' + zeilen.join('\n'));
else zeilen.filter((z) => z.includes('ZU WENIG')).forEach((z) => console.log('FEHLER: ' + z));
for (const [a, b] of Object.entries(gleich)) {
  if (hex('var(--c-' + a + ')', hell).join() !== hex('var(--c-' + b + ')', hell).join()) { fehler++; console.log('FEHLER: Absender ' + a + ' soll die Farbe von ' + b + ' haben'); }
}
// Innerhalb einer Kachel- bzw. Knopfgruppe keine Farbe doppelt (Regel in docs/FARBEN.md).
// Startseite und Brief-Absender über die Variablen, die übrigen Gruppen über die Regeln mit „/* gruppe <name> */“ im CSS.
// Die Anzahl der Einträge wird mit dem Code verglichen, damit eine neue Kachel nicht ohne eigene Farbe bleibt.
{
  const lies = (datei) => fs.readFileSync(path.join(__dirname, '..', 'src', datei), 'utf8');
  const gruppen = { start: BEREICHE.map((b) => 'c-' + b), absender: ABSENDER.map((a) => 'c-' + a) };
  for (const m of css.matchAll(/\{\s*(?:background|--c):\s*var\(--([a-z0-9-]+)\);\s*\}\s*\/\*\s*gruppe ([a-z-]+)\s*\*\//g)) (gruppen[m[2]] = gruppen[m[2]] || []).push(m[1]);
  const app = lies('app.js'), az = lies('ausziehen.js');
  const erwartet = {
    start: (css.match(/class="sk sk-[a-z]+/g) || []).length,
    absender: (app.match(/var BRIEFE = \[([\s\S]*?)\n {2}\];/) || ['', ''])[1].split('\n').filter((z) => /^\s*\['/.test(z)).length,
    sparen: (app.match(/var SP_THEMEN = \[([\s\S]*?)\n {2}\];/) || ['', ''])[1].split('\n').filter((z) => /^\s*\['/.test(z)).length,
    pflegestart: 2, pfaendung: 2,
    pflegeergebnis: 3, // Ergebnisseite der Pflege-Einschätzung: Antrag Schiefer, Unterstützung Blau, Gutachten Ziegel
    ordner: (app.match(/zeile\('[a-z]+'/g) || []).length, // Mein Ordner: jede Zeile eine eigene Farbe (ID-Selektoren, weil Zeilen nur mit Inhalt erscheinen)
    energie: 2, // Energiekosten-Check im Haushaltsplan: Strom Meerblau, Gas Ziegel (wie „Geld sparen“)
    ausziehen: ((az.match(/var HAUPT = \[([^\]]*)\]/) || ['', ''])[1].match(/'[a-z]+'/g) || []).length
  };
  const vorher = fehler;
  for (const [g, liste] of Object.entries(gruppen)) {
    const farben = liste.map((v) => hex('var(--' + v + ')', hell).join());
    const doppelt = farben.filter((f, i) => farben.indexOf(f) !== i);
    if (doppelt.length) { fehler++; console.log('FEHLER: Gruppe „' + g + '“: Farbe doppelt (' + liste.join(', ') + ')'); }
    if (erwartet[g] !== undefined && erwartet[g] !== liste.length) { fehler++; console.log('FEHLER: Gruppe „' + g + '“: ' + liste.length + ' Farben, aber ' + erwartet[g] + ' Einträge'); }
  }
  for (const g of Object.keys(erwartet)) if (!gruppen[g]) { fehler++; console.log('FEHLER: Gruppe „' + g + '“ ohne Farben'); }
  if (fehler === vorher && !process.argv.includes('--tabelle')) console.log('[farben] ' + Object.keys(gruppen).length + ' Gruppen ohne doppelte Farbe');
}
// Keine verstreuten Farbwerte: außerhalb der Palette (bis „* { box-sizing“) nur Variablen; Ausnahme Druckstile (@media print: Schwarz auf Weiß)
let stil = css.slice(css.indexOf('<style>'), css.indexOf('</style>'));
stil = stil.slice(stil.indexOf('* { box-sizing'));
for (let i = stil.indexOf('@media print'); i >= 0; i = stil.indexOf('@media print')) {
  let tiefe = 0, j = stil.indexOf('{', i);
  do { if (stil[j] === '{') tiefe++; else if (stil[j] === '}') tiefe--; j++; } while (tiefe && j < stil.length);
  stil = stil.slice(0, i) + stil.slice(j);
}
const verstreut = stil.match(/#[0-9a-f]{3,8}\b|rgba?\(/gi);
if (verstreut) { fehler++; console.log('FEHLER: Farbwerte außerhalb der Palette: ' + verstreut.join(', ')); }
console.log(fehler ? fehler + ' FEHLER (Kontrast)' : '[kontrast] alle ' + paare.length + ' Paare in hell und dunkel ausreichend');
process.exit(fehler ? 1 : 0);
