// „Ich ziehe aus“ (src/ausziehen.js): Aufbau, Quellen, Speicherformat und alle Sprachen ohne Rohschlüssel (Marke az-*)
'use strict';
const fs = require('fs'), path = require('path');
const A = require('../src/ausziehen.js');
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const keys = A.schluessel();
const zahlen = (s) => String(s).replace(/[٠-٩]/g, (c) => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g, (c) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/\{[^}]*\}/g, ' ').replace(/(\d) (?=\d)/g, '$1').match(/\d+/g)?.sort().join(' ') || '';
const de = require('../src/lang/ausziehen/de.json');

// az-aufbau: Übersicht höchstens 8 Kacheln, jede Kachel ein Bereich; Checklisten mit Punkten
check('[az-aufbau] 6 bis 8 Kacheln', A.HAUPT.length >= 6 && A.HAUPT.length <= 8, A.HAUPT.length);
A.HAUPT.forEach((id) => check('[az-aufbau] Bereich ' + id, !!A.BEREICHE.find((b) => b.id === id)));
['vorher', 'tage'].forEach((id) => check('[az-aufbau] Checkliste ' + id, A.BEREICHE.find((b) => b.id === id).liste === true));
const ids = []; A.BEREICHE.forEach((b) => A.allePunkte(b).forEach((p) => ids.push(p.id)));
check('[az-aufbau] Punkt-IDs eindeutig', new Set(ids).size === ids.length);
const quelltext = fs.readFileSync(path.join(__dirname, '..', 'src', 'ausziehen.js'), 'utf8');
const farbe = (id) => { const m = quelltext.match(new RegExp('\\.az-k-' + id + '\\{--c:var\\((--c-[a-z]+)\\)')); return m ? m[1] : '--c-ausziehen'; };
const farben = A.HAUPT.map(farbe);
check('[az-aufbau] jede Kachel eine eigene Palettenfarbe', new Set(farben).size === A.HAUPT.length, farben);
check('[az-aufbau] keine Hex-Farben im Modul', !/#[0-9a-fA-F]{6}\b/.test(quelltext));
check('[az-aufbau] U25-Warnung als Punkt', A.BEREICHE[0].punkte.some((p) => p.id === 'u25' && p.warn));
check('[az-aufbau] Hilfen alle „möglich“', A.BEREICHE.find((b) => b.id === 'hilfen').punkte.every((p) => p.moeglich));

// az-quellen: jede Quelle existiert; Texte mit § oder Zahl haben eine Quelle; Zahlen im Text stehen so in der Quelle bzw. sind belegt
A.BEREICHE.forEach((b) => A.allePunkte(b).forEach((p) => {
  (p.q || []).forEach((q) => check('[az-quellen] ' + p.id + ' -> ' + q, Array.isArray(A.Q[q]) && A.Q[q][0] && A.Q[q][1]));
  const txt = de['az.p.' + p.id + '.t'] || '';
  const zahl = /§|Art\. \d|\b\d+ (Wochen|Monat|Monate|Stunden|Geschäftstagen|Jahre)\b|\bbis (18|21|23|25|27)\b|\d+ %/.test(txt);
  if (zahl && !['arzt'].includes(p.id)) check('[az-quellen] Rechtsaussage mit Quelle: ' + p.id, (p.q || []).length > 0);
  // Jede im Text genannte Vorschrift („§ 22 …“) steht in einer Quelle des Punktes
  (txt.match(/§ \d+[a-z]?/g) || []).forEach((par) => {
    const qs = (p.q || []).map((q) => A.Q[q][0]).join(' ');
    if (!['§ 36', '§ 37', '§ 27', '§ 7', '§ 312g', '§ 312j', '§ 24', '§ 92'].includes(par)) check('[az-quellen] ' + p.id + ' nennt ' + par + ' mit Quelle', qs.includes(par + ' ') || qs.includes(par + ',') || qs.endsWith(par), qs);
  });
}));
check('[az-quellen] Abrufdatum', /^\d\d\.\d\d\.\d{4}$/.test(A.ABGERUFEN));
check('[az-aufbau] keine Kachel „Für Careleaver“, keine Briefvorlage', !A.HAUPT.includes('care') && !A.BEREICHE.some((b) => b.id === 'care') && !A.briefText && !Object.values(de).some((x) => /Careleaver|Ombudsstelle/.test(x)));

// az-speichern: nur bekannte Haken und Notizen; Fortschritt
const d = A.normiere({ ab: { leisten: true, melden: true, unbekannt: true, konten: true }, notiz: { vorher: 'Termin', geld: 'x', care: 5 } });
check('[az-speichern] nur Checklisten-Haken', JSON.stringify(d.ab) === JSON.stringify({ leisten: true, melden: true }), d.ab);
check('[az-speichern] nur Notizen der Checklisten', JSON.stringify(d.notiz) === JSON.stringify({ vorher: 'Termin' }), d.notiz);
check('[az-speichern] Fortschritt', JSON.stringify(A.fortschritt(d, 'vorher')) === JSON.stringify({ n: 1, von: A.BEREICHE[0].punkte.length }));
check('[az-speichern] kaputte Daten -> leer', JSON.stringify(A.normiere('x')) === JSON.stringify({ v: 1, ab: {}, notiz: {} }));

// az-sprachen: alle 13 Sprachen haben alle Schlüssel, Platzhalter gleich, keine Rohschlüssel; Einfache Sprache nur bekannte Schlüssel
LANGS.forEach((l) => {
  const f = path.join(__dirname, '..', 'src', 'lang', 'ausziehen', l + '.json');
  check('[az-sprachen] Datei ' + l, fs.existsSync(f));
  if (!fs.existsSync(f)) return;
  const o = JSON.parse(fs.readFileSync(f, 'utf8'));
  keys.forEach((k) => {
    check('[az-sprachen] ' + l + ' ' + k, typeof o[k] === 'string' && o[k].trim() && !/^az\./.test(o[k]));
    const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
    if (o[k]) check('[az-sprachen] Platzhalter ' + l + ' ' + k, ph(o[k]) === ph(de[k]), [o[k], de[k]]);
    // Zahlen (Fristen, Altersgrenzen, Prozente, Telefonnummern) wie im Deutschen; arabische und persische Ziffern zählen mit
    if (o[k]) check('[az-sprachen] Zahlen ' + l + ' ' + k, zahlen(o[k]) === zahlen(de[k]), [zahlen(de[k]), zahlen(o[k])]);
    // Vorschriften bleiben gleich (deutsch in Klammern)
    if (o[k]) check('[az-sprachen] Vorschriften ' + l + ' ' + k, ((o[k].match(/§ \d+[a-z]?/g) || []).sort().join()) === ((de[k].match(/§ \d+[a-z]?/g) || []).sort().join()), [l, k]);
  });
  Object.keys(o).forEach((k) => check('[az-sprachen] kein fremder Schlüssel ' + l + ' ' + k, keys.includes(k) || ['az.h', 'az.kachel', 'az.kachel.t'].includes(k)));
});
const ein = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'einfach', 'ausziehen.json'), 'utf8'));
Object.keys(ein).forEach((k) => {
  check('[az-sprachen] Einfache Sprache Schlüssel ' + k, k in de);
  const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  if (k in de) check('[az-sprachen] Einfache Sprache Platzhalter ' + k, ph(ein[k]) === ph(de[k]));
  if (k in de) check('[az-sprachen] Einfache Sprache Zahlen ' + k, zahlen(ein[k]) === zahlen(de[k]), [zahlen(de[k]), zahlen(ein[k])]);
});
check('[az-sprachen] Einfache Sprache deckt die Hauptkacheln ab', A.HAUPT.every((id) => ein['az.' + id + '.h']));

console.log((fehler ? 'FEHLER: ' + fehler : 'OK') + ' – Ich ziehe aus: ' + n + ' Prüfungen');
process.exit(fehler ? 1 : 0);
