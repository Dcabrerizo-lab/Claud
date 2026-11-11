// Erzeugt content/behoerden-deutschland.json: Stellen außerhalb Bayerns (ohne Anschrift, mit offizieller Website aus Wikidata).
// Nur gesicherte Zuständigkeiten:
//  - kreisfreie Städte (außer Berlin und Hamburg, dort die Bezirksämter): Wohngeld, Grundsicherung, Unterhaltsvorschuss,
//    Bildung und Teilhabe, Asylbewerberleistungen
//  - Landkreise: nur Grundsicherung im Alter und bei Erwerbsminderung (örtlicher Träger der Sozialhilfe, § 3 SGB XII).
//    Wohngeld und Jugendamt liegen in manchen Ländern bei Gemeinden bzw. großen Städten, daher dort keine Angabe.
// Aufruf: node tools/build-behoerden-de.js (nach node tools/wikidata-kreise.js)
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'content', 'quellen', 'roh', 'wikidata-kreise.json');
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'plz-data.json'), 'utf8'));
const B = JSON.parse(fs.readFileSync(RAW, 'utf8')).results.bindings;
const stand = fs.statSync(RAW).mtime.toISOString().slice(0, 10).split('-').reverse().map(Number).join('.');

const KREISFREI = (n) => /(Kreisfreie Stadt|kreisfreie Stadt|Stadtkreis|, Stadt\b|^Stadt\s|^Landeshauptstadt\s|Freie und Hansestadt)/.test(n) || /^(Frankfurt am Main|Frankfurt \(Oder\)|Schwerin|Dessau-Roßlau)$/.test(n);
const amtlich = (n) => 'Stadt ' + n.replace(/^(Kreisfreie Stadt|Stadtkreis|Stadt|Landeshauptstadt)\s+/, '').replace(/,\s*(kreisfreie Stadt|Stadt)$/, '').trim();
const web = {};
B.forEach((b) => {
  const k = String(b.key.value).replace(/\D/g, '').slice(0, 5);
  if (b.web) (web[k] = web[k] || []).push(b.web.value);
});
// offizielle Seite wählen: .de vor anderen, dann die kürzeste (Hamburg: hamburg.de statt der Tourismusseite hamburg.com)
const waehle = (l) => (l || []).slice().sort((a, b) => (/\.de(\/|$)/.test(b) - /\.de(\/|$)/.test(a)) || a.length - b.length)[0] || '';

const kreise = {};
let nStadt = 0, nKreis = 0;
P.kreise.filter((k) => !k.ags.startsWith('09') && !/^(11|02)/.test(k.ags)).forEach((k) => {
  const w = waehle(web[k.ags]);
  if (!w) throw new Error('Keine Website für ' + k.ags + ' ' + k.n);
  if (KREISFREI(k.n)) { kreise[k.ags] = { name: amtlich(k.n), web: w, typ: 'stadt' }; nStadt++; }
  else { kreise[k.ags] = { name: k.n.replace(/^Kreis\s+/, 'Kreis '), web: w, typ: 'kreis' }; nKreis++; }
});
// Von Hand oder per Handy-Skript ergänzte Felder (Wikipedia-Titel, Anschrift, Quelle) beim Neuaufbau behalten
try {
  const alt = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'behoerden-deutschland.json'), 'utf8')).kreise || {};
  Object.keys(kreise).forEach((k) => { ['wiki', 'adr', 'anschrift', 'quelle', 'quelleArt'].forEach((f) => { if (alt[k] && alt[k][f] !== undefined) kreise[k][f] = alt[k][f]; }); });
} catch (e) { /* erste Erzeugung */ }
const out = { stand: 'Website laut Wikidata (CC0), abgerufen ' + stand + '; Anschriften außerhalb Bayerns noch nicht hinterlegt', kreise };
fs.writeFileSync(path.join(ROOT, 'content', 'behoerden-deutschland.json'), JSON.stringify(out, null, 1));
console.log(`behoerden-deutschland.json: ${nStadt} kreisfreie Städte, ${nKreis} Landkreise (ohne Bayern, Berlin, Hamburg)`);
