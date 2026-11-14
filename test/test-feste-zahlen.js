// Feste Zahlen in Texten: Jeder Euro-Betrag, der in den deutschen Texten (src/lang/de.json), in den Rechenregeln der App
// (src/template.html) oder auf der Webseite (site/index.html) als fester Text steht, muss ein Wert der Rechnung sein
// (src/rules.js), sich daraus berechnen lassen oder als feste Gesetzeszahl mit Begründung unten stehen.
// So bleibt nach einer Wertänderung (z. B. zum 1.1.2027) kein alter Betrag in einem Text stehen. Die Übersetzungen prüft
// test-sprachen-zahlen.js (gleiche Zahlen wie im Deutschen).
const fs = require('fs');
const path = require('path');
const R = require('./rules-de.js').RULES;
const ROOT = path.join(__dirname, '..');
const r2 = (x) => Math.round(x * 100) / 100;

const werte = new Set();
const walk = (o) => { if (typeof o === 'number') werte.add(r2(o)); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
walk(R);
// Aus der Rechnung abgeleitete Beträge (werden mit den Werten neu berechnet, veralten also nicht)
const B = R.beh.blind;
const ABGELEITET = {
  'Grundrente: höchstens 50 % des Regelsatzes': r2(R.grundrente.max * R.regelbedarf.alleinstehend),
  'Wohngeld: Freibetrag Alleinerziehende im Jahr': r2(R.wohngeld.freibetragAlleinerzMonat * 12),
  'Blindengeld Bayern nach Abzug des Pflegegeldes (Beispiel Pflegegrad 2)': r2(B.blind - B.kuerzBlind),
  'Sehbehindertengeld Bayern nach Abzug des Pflegegeldes (Beispiel Pflegegrad 2)': r2(B.hoch - B.kuerzHoch)
};
Object.values(ABGELEITET).forEach((v) => werte.add(v));
// Feste Gesetzeszahlen, die nicht als Wert in der Rechnung stehen (jährlich mitprüfen)
const GESETZ = {
  520: '§ 11b Abs. 3 SGB II: Grenze der 20-%-Stufe beim Freibetrag für Arbeit (in der Formel sgb2Freibetrag)',
  1500: '§ 11b Abs. 3 SGB II: Obergrenze der 10-%-Stufe mit minderjährigem Kind (in der Formel sgb2Freibetrag)',
  4000: '§ 35a Abs. 2 EStG: Steuerermäßigung haushaltsnahe Pflege- und Betreuungsleistungen, höchstens 4.000 € im Jahr',
  100000: '§ 94 Abs. 1a SGB XII: Unterhaltsrückgriff auf Kinder erst ab 100.000 € Jahreseinkommen'
};
Object.keys(GESETZ).forEach((v) => werte.add(Number(v)));

const num = (s) => Number(s.replace(/\./g, '').replace(',', '.'));
const funde = {};
const scan = (txt, wo) => { for (const m of txt.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?\s?(?:€|Euro)/g)) { const v = num(m[1] + (m[2] ? ',' + m[2] : '')); (funde[v] = funde[v] || new Set()).add(wo); } };
const de = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'lang', 'de.json'), 'utf8'));
Object.entries(de).forEach(([k, v]) => scan(v, 'de.json ' + k));
scan(fs.readFileSync(path.join(ROOT, 'src', 'template.html'), 'utf8').replace(/<[^>]+>/g, ' '), 'template.html');
scan(fs.readFileSync(path.join(ROOT, 'site', 'index.html'), 'utf8').replace(/<[^>]+>/g, ' '), 'site/index.html');

const unbekannt = Object.keys(funde).map(Number).filter((v) => !werte.has(v)).sort((a, b) => a - b);
const zahl = Object.keys(funde).length;
if (unbekannt.length) {
  console.log('FEHLER: Euro-Beträge in Texten, die nicht zur Rechnung passen (veraltet oder Tippfehler?):');
  unbekannt.forEach((v) => console.log('- ' + v.toLocaleString('de-DE') + ' €  in  ' + [...funde[v]].slice(0, 5).join(', ')));
  console.log('Wenn der Betrag stimmt: als Wert in src/rules.js führen oder mit Begründung in test/test-feste-zahlen.js eintragen.');
  process.exit(1);
}
// Gegenprobe: Die Liste der Gesetzeszahlen enthält nichts, was in keinem Text mehr steht (sonst veraltet sie unbemerkt)
const ungenutzt = Object.keys(GESETZ).map(Number).filter((v) => !funde[v]);
if (ungenutzt.length) { console.log('FEHLER: Gesetzeszahlen ohne Text, bitte aus der Liste streichen: ' + ungenutzt.join(', ')); process.exit(1); }
console.log('[feste-zahlen] Feste Zahlen in Texten: alle ' + zahl + ' verschiedenen Euro-Beträge in Texten, Rechenregeln und Webseite passen zu den Werten der Rechnung (' + Object.keys(ABGELEITET).length + ' abgeleitet, ' + Object.keys(GESETZ).length + ' feste Gesetzeszahlen)');
