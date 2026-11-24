// Jede Zahl (Beträge, Prozente, Tage, Altersgrenzen) und jeder Paragraf muss in allen Sprachen genau wie im Deutschen stehen.
// Findet z. B. eine Übersetzung, die nach einer Wertänderung noch den alten Betrag nennt.
// Geprüft werden die 13 Hauptdateien (src/lang/*.json) UND automatisch jeder Unterordner von src/lang/ mit einer de.json
// (haushalt, schulden, fristen, ausziehen, schritte, klient, suche, denetz, zusatz … – ein neuer Ordner ist ohne Änderung dabei).
// In Unterordnern zusätzlich: jeder deutsche Schlüssel vorhanden, nicht leer, gleiche Platzhalter.
// Zählfunktion gemeinsam in test/hilf-zahlen.js (arabische und persische Ziffern, Tausendertrenner).
'use strict';
const fs = require('fs'), path = require('path');
const { zahlen, platzhalter } = require('./hilf-zahlen.js');
const DIR = path.join(__dirname, '..', 'src', 'lang');
const SPRACHEN = fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'de.json').map((f) => f.replace('.json', ''));
const AUSNAHMEN = require('./sprachen-zahlen-ausnahmen.json');
const lies = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
// Gewollt fehlende Übersetzungen: die App zeigt dort Deutsch (lang="de" dir="ltr") mit Hinweis „nur auf Deutsch“.
// Pflege in Somali und Paschtu: Entscheidung David 21.11.2026 – erst nach Prüfung durch Muttersprachler;
// die Entwürfe liegen in docs/entwuerfe/sprachen/pflege-wartet/ und kommen nicht in die App.
const FALLBACK_DE = { pflege: ['so', 'ps'], senioren: ['so', 'ps'] };
let fehler = 0, geprueft = 0;
const fail = (t) => { fehler++; console.log('FAIL ' + t); };

// ordner = '' für die Hauptdateien, sonst Name des Unterordners; Ausnahmen im Unterordner als „ordner/schlüssel“
const pruefe = (ordner, de, lang, L) => {
  for (const k of Object.keys(de)) {
    if (typeof de[k] !== 'string') continue;
    const name = (ordner ? ordner + '/' : '') + k;
    if (ordner) {
      if (typeof L[k] !== 'string') { fail(`${lang} ${name}: fehlt in src/lang/${ordner}/${lang}.json`); continue; }
      if (!L[k].trim() && de[k].trim()) { fail(`${lang} ${name}: leer`); continue; }
      if (platzhalter(de[k]) !== platzhalter(L[k])) fail(`${lang} ${name}: Platzhalter de [${platzhalter(de[k])}] ${lang} [${platzhalter(L[k])}]`);
    } else if (typeof L[k] !== 'string') continue; // Hauptdateien: Vollständigkeit prüft test/test.js
    geprueft++;
    const a = zahlen(de[k]), b = zahlen(L[k]);
    // Ausnahme nur, solange die deutschen Zahlen gleich bleiben (Zahl in der Übersetzung als Wort ausgeschrieben)
    if (AUSNAHMEN[lang] && name in AUSNAHMEN[lang]) {
      if (AUSNAHMEN[lang][name] === a) continue;
      fail(`${lang} ${name}: deutsche Zahlen geändert [${a}], Ausnahme war für [${AUSNAHMEN[lang][name]}] – Übersetzung prüfen`); continue;
    }
    if (a !== b) fail(`${lang} ${name}\n  de: [${a}] ${de[k].slice(0, 160)}\n  ${lang}: [${b}] ${L[k].slice(0, 160)}`);
  }
};

const de = lies(path.join(DIR, 'de.json'));
for (const lang of SPRACHEN) pruefe('', de, lang, lies(path.join(DIR, lang + '.json')));

const ordner = fs.readdirSync(DIR).filter((d) => fs.statSync(path.join(DIR, d)).isDirectory() && fs.existsSync(path.join(DIR, d, 'de.json')));
// Teil-Ebenen: überschreiben nur einzelne Schlüssel und nur in manchen Sprachen (sie = Sie-Anrede der Pflege-Variante, test/test-sie-ebene.js).
// Dort keine Vollständigkeit; jeder vorhandene Text muss Zahlen und Platzhalter des deutschen Textes haben (Teil-Ebene, sonst Hauptdatei).
const TEILEBENEN = ['sie'];
for (const o of ordner.filter((d) => TEILEBENEN.includes(d))) {
  const deO = Object.assign({}, de, ...ordner.filter((d) => !TEILEBENEN.includes(d)).map((d) => lies(path.join(DIR, d, 'de.json'))), lies(path.join(DIR, o, 'de.json')));
  for (const lang of SPRACHEN) {
    const f = path.join(DIR, o, lang + '.json');
    if (!fs.existsSync(f)) continue;
    const L = lies(f), deTeil = {};
    Object.keys(L).forEach((k) => { if (typeof deO[k] === 'string') deTeil[k] = deO[k]; else fail(`${lang} ${o}/${k}: Schlüssel fehlt im Deutschen`); });
    pruefe(o, deTeil, lang, L);
  }
}
for (const o of ordner.filter((d) => !TEILEBENEN.includes(d))) {
  const deO = lies(path.join(DIR, o, 'de.json'));
  for (const lang of SPRACHEN) {
    const f = path.join(DIR, o, lang + '.json');
    if (!fs.existsSync(f)) {
      if ((FALLBACK_DE[o] || []).includes(lang)) { console.log(`src/lang/${o}/${lang}.json fehlt gewollt: Fallback Deutsch`); continue; }
      fail(`src/lang/${o}/${lang}.json fehlt`); continue;
    }
    if ((FALLBACK_DE[o] || []).includes(lang)) fail(`src/lang/${o}/${lang}.json ist da, steht aber in FALLBACK_DE (Fallback Deutsch) – Liste anpassen`);
    pruefe(o, deO, lang, lies(f));
  }
}
// Jede Ausnahme muss noch gebraucht werden (sonst bleibt sie unbemerkt stehen und deckt später einen echten Fehler zu)
for (const [lang, m] of Object.entries(AUSNAHMEN)) {
  for (const name of Object.keys(m)) {
    const [o, k] = name.includes('/') ? [name.slice(0, name.indexOf('/')), name.slice(name.indexOf('/') + 1)] : ['', name];
    const dateiDe = o ? path.join(DIR, o, 'de.json') : path.join(DIR, 'de.json'), dateiL = o ? path.join(DIR, o, lang + '.json') : path.join(DIR, lang + '.json');
    if (!fs.existsSync(dateiDe) || !fs.existsSync(dateiL)) { fail(`Ausnahme ${lang} ${name}: Datei fehlt`); continue; }
    const dd = lies(dateiDe)[k], ll = lies(dateiL)[k];
    if (typeof dd !== 'string' || typeof ll !== 'string') fail(`Ausnahme ${lang} ${name}: Schlüssel gibt es nicht mehr – Ausnahme löschen`);
    else if (zahlen(dd) === zahlen(ll)) fail(`Ausnahme ${lang} ${name}: Zahlen stimmen wieder überein – Ausnahme löschen`);
  }
}
if (fehler) { console.log(`\n${fehler} Fehler bei Zahlen/Platzhaltern in Übersetzungen`); process.exit(1); }
console.log(`Sprachen-Zahlen-Test bestanden: ${geprueft} Texte (Hauptdateien und ${ordner.length} Unterordner: ${ordner.join(', ')}), Zahlen und Paragrafen in allen Sprachen wie im Deutschen`);
