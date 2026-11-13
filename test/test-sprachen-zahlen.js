// Jede Zahl (Beträge, Prozente, Tage, Altersgrenzen) und jeder Paragraf muss in allen Sprachen genau wie im Deutschen stehen.
// Findet z. B. eine Übersetzung, die nach einer Wertänderung noch den alten Betrag nennt.
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'src', 'lang');
const AR = '٠١٢٣٤٥٦٧٨٩';
const zahlen = (s) => {
  s = String(s).replace(/[٠-٩]/g, (c) => AR.indexOf(c)).replace(/\{[^}]*\}/g, ' ');
  const m = s.match(/\d+(?:[.,  ٫٬ ]\d{3})*(?:[.,٫]\d{1,2})?/g) || [];
  return m.map((x) => x.replace(/\D/g, '').replace(/^0+(?=\d)/, '')).sort();
};
const de = JSON.parse(fs.readFileSync(path.join(DIR, 'de.json'), 'utf8'));
const AUSNAHMEN = require('./sprachen-zahlen-ausnahmen.json');
let fehler = 0, geprueft = 0;
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'de.json')) {
  const lang = f.replace('.json', ''), L = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  for (const k of Object.keys(de)) {
    if (typeof de[k] !== 'string' || typeof L[k] !== 'string') continue;
    geprueft++;
    const a = zahlen(de[k]).join(' '), b = zahlen(L[k]).join(' ');
    // Ausnahme nur, solange die deutschen Zahlen gleich bleiben (Zahl in der Übersetzung als Wort ausgeschrieben)
    if (AUSNAHMEN[lang] && k in AUSNAHMEN[lang]) {
      if (AUSNAHMEN[lang][k] === a) continue;
      fehler++; console.log(`FAIL ${lang} ${k}: deutsche Zahlen geändert [${a}], Ausnahme war für [${AUSNAHMEN[lang][k]}] – Übersetzung prüfen`); continue;
    }
    if (a !== b) { fehler++; console.log(`FAIL ${lang} ${k}\n  de: [${a}] ${de[k].slice(0, 160)}\n  ${lang}: [${b}] ${L[k].slice(0, 160)}`); }
  }
}
if (fehler) { console.log(`\n${fehler} Texte mit abweichenden Zahlen`); process.exit(1); }
console.log(`Sprachen-Zahlen-Test bestanden: ${geprueft} Texte, Zahlen und Paragrafen in allen Sprachen wie im Deutschen`);
