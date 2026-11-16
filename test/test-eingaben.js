// Ungewöhnliche Betragseingaben (Fmt.parse, so liest die App jedes Betragsfeld): richtig erkannt oder sauber abgewiesen (''),
// nie stillschweigend falsch. Dazu: jede Zahl, die die App anzeigt, lässt sich wieder einlesen (Format hin und zurück).
const Fmt = require('../src/fmt.js');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const FAELLE = [
  ['1200', 1200], ['1.200', 1200], ['1.234,56', 1234.56], ['1234,5', 1234.5], ['1,5', 1.5], ['950.50', 950.5], ['950.5', 950.5],
  ['2,050.50', 2050.5], ['780 €', 780], ['€780', 780], ['780 warm', 780], ['1 200', 1200], [' 1200 ', 1200], ['1.200.000', 1200000],
  ['0', 0], ['0,00', 0], ['', ''], ['   ', ''], ['abc', ''], ['-50', ''], ['- 50', ''], ['−50', ''], ['–50', ''], ['1,234', ''], ['12,345,678.9', 12345678.9],
  [null, ''], [undefined, ''], ['12.5.2026', ''], ['1.2.3', '']
];
FAELLE.forEach(([ein, soll]) => {
  const ist = Fmt.parse(ein);
  ck('[eingaben] Eingabe „' + ein + '“ -> ' + JSON.stringify(soll), ist === soll, JSON.stringify(ist));
});
// Nie NaN, nie negativ, nie Unendlich, egal was eingegeben wird
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const zeichen = '0123456789.,-−€ abc€€ ';
for (let i = 0; i < 20000; i++) {
  let s = ''; const len = 1 + Math.floor(rnd() * 12);
  for (let j = 0; j < len; j++) s += zeichen[Math.floor(rnd() * zeichen.length)];
  const v = Fmt.parse(s);
  if (!(v === '' || (typeof v === 'number' && isFinite(v) && v >= 0))) { ck('[eingaben] Zufallseingabe ergibt gültigen Betrag oder leer', false, JSON.stringify(s) + ' -> ' + v); break; }
}
ck('[eingaben] 20.000 Zufallseingaben: nie NaN, nie negativ, nie unendlich', true);
// Hin und zurück: angezeigter Betrag (deutsch) wird wieder als derselbe Betrag gelesen
[0, 5, 99.5, 242.7, 563, 1234, 12348, 100000, 135.63].forEach((v) => {
  const s = Fmt.euro(v, 'de');
  ck('[eingaben] Angezeigter Betrag „' + s + '“ wird wieder als ' + v + ' gelesen', Fmt.parse(s) === v, Fmt.parse(s));
});
console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '\nEingabe-Test bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
