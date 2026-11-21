// Einfache Sprache ist vollständig: Jeder deutsche Schlüssel (src/lang/de.json und die Unterordner-Wörterbücher
// haushalt, ausziehen, schulden, fristen, zusatz) hat einen Eintrag in src/lang/einfach/*.json. Wert "=" heißt: Der Standardtext
// ist schon einfach (kurze Beschriftung, Name); er gilt dann auch in Einfacher Sprache (scripts/build.js liefert ihn nicht doppelt aus).
// Außerdem: keine neuen Platzhalter {x} und keine neuen Zahlen in der einfachen Fassung. Weglassen ist erlaubt (Paragrafen,
// Nebensachen); Zahlen bis 12 dürfen neu als Ziffer stehen („einen Monat“ → „1 Monat“).
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'src', 'lang');
const UNTER = ['haushalt', 'ausziehen', 'schulden', 'fristen', 'schritte', 'zusatz', 'klient'];

// Ausnahmen (kurz und begründet): technische Angaben, kein sichtbarer Text
const AUSNAHMEN = {
  'meta.name': 'Name der Sprache im Sprachmenü',
  'meta.dir': 'Schreibrichtung (ltr), kein Text'
};

const de = JSON.parse(fs.readFileSync(path.join(DIR, 'de.json'), 'utf8'));
UNTER.forEach((u) => { const f = path.join(DIR, u, 'de.json'); if (fs.existsSync(f)) Object.assign(de, JSON.parse(fs.readFileSync(f, 'utf8'))); });

const ein = {};
const fehler = [];
fs.readdirSync(path.join(DIR, 'einfach')).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort().forEach((f) => {
  const o = JSON.parse(fs.readFileSync(path.join(DIR, 'einfach', f), 'utf8'));
  Object.keys(o).forEach((k) => {
    if (typeof o[k] !== 'string' || !o[k].trim()) fehler.push('einfach/' + f + ': leerer oder ungültiger Wert: ' + k);
    if (Object.prototype.hasOwnProperty.call(ein, k) && ein[k].wert !== o[k]) fehler.push('einfach/' + f + ': Schlüssel doppelt (auch in ' + ein[k].datei + '): ' + k);
    ein[k] = { wert: o[k], datei: f };
  });
});

const ph = (s) => s.match(/\{[\w:.]+\}/g) || [];
// Zahlen ohne Platzhalter; Tausenderpunkt und Komma gehören zur Zahl (1.140, 242,70); „116 117“ zählt als zwei Zahlen
const zahlen = (s) => s.replace(/\{[\w:.]+\}/g, '').match(/\d+(?:[.,]\d+)*/g) || [];
const klein = (z) => /^\d+$/.test(z) && Number(z) <= 12;

let n = 0, gleich = 0;
const ohne = [];
Object.keys(de).forEach((k) => {
  if (AUSNAHMEN[k] || de[k] === '') return; // leere Standardtexte (z. B. n.* auf Deutsch) zeigt die App nicht
  n++;
  const e = ein[k];
  if (!e) { ohne.push(k); return; }
  if (e.wert === '=') { gleich++; return; }
  const p0 = ph(de[k]), z0 = zahlen(de[k]);
  const pNeu = ph(e.wert).filter((x) => p0.indexOf(x) < 0), zNeu = zahlen(e.wert).filter((x) => z0.indexOf(x) < 0 && !klein(x));
  if (pNeu.length) fehler.push('Neuer Platzhalter in der einfachen Fassung: ' + k + ': ' + pNeu.join(' '));
  if (zNeu.length) fehler.push('Neue Zahl in der einfachen Fassung: ' + k + ': ' + zNeu.join(' '));
});
Object.keys(ein).forEach((k) => { if (!Object.prototype.hasOwnProperty.call(de, k)) fehler.push('einfach/' + ein[k].datei + ': Schlüssel gibt es auf Deutsch nicht (mehr): ' + k); });

if (ohne.length) fehler.push(ohne.length + ' Schlüssel ohne einfache Fassung (Text oder "=" in src/lang/einfach/*.json): ' + ohne.slice(0, 40).join(', ') + (ohne.length > 40 ? ' …' : ''));
if (fehler.length) {
  console.log('FEHLER Einfache Sprache:\n- ' + fehler.join('\n- '));
  process.exit(1);
}
console.log('[einfach-vollstaendig] ' + n + ' Schlüssel: alle mit einfacher Fassung (' + (n - gleich) + ' eigene Texte, ' + gleich + ' Standardtext schon einfach), keine neuen Platzhalter oder Zahlen');
