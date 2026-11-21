// Gemeinsame Zählfunktion für „Zahlen in der Übersetzung wie im Deutschen“ (vorher 5 leicht verschiedene Kopien).
// Erkennt westliche, arabische (٠-٩) und persische (۰-۹) Ziffern, Tausendertrenner (Punkt, Komma, Leerzeichen, schmale und
// geschützte Leerzeichen, arabische Trenner) und bis zu 2 Nachkommastellen. Platzhalter {name} zählen nicht.
// Ergebnis: sortierte Zahlen ohne Tausendertrenner und führende Nullen (Nachkommastellen als „,xx“), mit Leerzeichen verbunden.
'use strict';
const AR = '٠١٢٣٤٥٦٧٨٩', FA = '۰۱۲۳۴۵۶۷۸۹';
const zahlen = (s) => {
  s = String(s).replace(/[٠-٩]/g, (c) => AR.indexOf(c)).replace(/[۰-۹]/g, (c) => FA.indexOf(c)).replace(/\{[^}]*\}/g, ' ');
  const m = s.match(/\d+(?:[.,\u00a0\u202f\u066b\u066c ]\d{3})*(?:[.,\u066b]\d{1,2})?/g) || [];
  // Nachkommastellen bleiben als „,xx“ erhalten: 2,5 und 25 sind verschieden; 2,5 und 2.5 gleich; 1.234 und 1 234 gleich
  return m.map((x) => {
    const d = /[.,\u066b](\d{1,2})$/.exec(x);
    const ganz = (d ? x.slice(0, -d[0].length) : x).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    return d ? ganz + ',' + d[1] : ganz;
  }).sort().join(' ');
};
const platzhalter = (s) => (String(s).match(/\{[^}]*\}/g) || []).sort().join(' ');
module.exports = { zahlen, platzhalter };
