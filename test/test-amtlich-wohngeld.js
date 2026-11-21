// Regressionstest Wohngeld: Einkommen von Kindern (Minijob) gegen gespeicherte Ergebnisse des amtlichen Wohngeldrechners (BMWSB),
// abgefragt am 21.11.2026 (Differenztest, tools/amtlich-vergleich-wohngeld.js). Vor der Korrektur rechnete SoLo hier 33–116 € zu wenig:
// [wg-kind-wk] Arbeitnehmer-Pauschbetrag 1.230 €/Jahr beim Lohn der Kinder (§ 14 Abs. 1 WoGG, § 9a Satz 1 Nr. 1 Buchst. a EStG),
// [wg-kind-frei] Freibetrag § 17 Nr. 4 WoGG je Kind (höchstens 1.200 €/Jahr). Verglichen wird auf den Euro (±1 €), nur Fälle, die SoLo
// genau abbilden kann: obere Schätzung mit allen Kindern verdienend, untere Schätzung mit einem verdienenden Kind.
const path = require('path');
const V = require(path.join(__dirname, '../tools/amtlich-vergleich-wohngeld-kern.js'));
const D = require('./amtlich-wohngeld-kinderlohn.json');
let fails = 0, zwei = 0;
for (const x of D.faelle) {
  const s = V.solo(x.f), amt = x.amtlich < 10 ? 0 : x.amtlich, so = s.betrag < 10 ? 0 : s.betrag;
  if (x.f.kindEink.length > 1) zwei++;
  if (Math.abs(so - amt) > 1) { fails++; console.log('FAIL [' + (x.f.kindEink.length > 1 ? 'wg-kind-frei' : 'wg-kind-wk') + '] Nr. ' + x.f.nr + ': SoLo ' + so + ' €, amtlich ' + x.amtlich + ' € | ' + V.kurz(x.f)); }
}
console.log(fails ? fails + ' von ' + D.faelle.length + ' FEHLGESCHLAGEN' : '[wg-kind-wk] [wg-kind-frei] Kinder-Einkommen beim Wohngeld: ' + D.faelle.length + ' amtliche Fälle auf den Euro gleich (davon ' + zwei + ' mit zwei verdienenden Kindern)');
process.exit(fails ? 1 : 0);
