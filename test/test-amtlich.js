// Abgleich mit amtlichen Rechnern: feste Ergebnisse, einmal online abgefragt (tools/amtliche-rechner/), hier ohne Internet geprüft.
// Wohngeld: 60 Haushalte aus dem Wohngeldrechner des Bundesbauministeriums. SoLos obere Schätzung (voller Pauschalabzug) muss
// auf 10 € gerundet dem amtlichen Ergebnis entsprechen. Findet Fehler, die eigene Tests nicht sehen (falsch verstandene Regeln).
const R = require('../src/rules.js');
const W = require('./amtlich-wohngeld.json');
let n = 0, fails = 0;
W.faelle.forEach((x) => {
  const f = x.f;
  const inp = { adults: f.adults, kids: f.kids, kidsU6: 0, art1: f.art, art2: f.art, brutto: f.b1 + f.b2, brutto2: f.b2, netto: 9000, miete: f.warm, mietstufe: String(f.stufe), vermoegen: 0, gebJahr: f.art === 'rente' ? 1955 : 1985, bezug: {}, heute: 2026.9 };
  const w = R.evaluate(inp).results.find((r) => r.id === 'wohngeld');
  const sp = w.tx.find((t) => /^schaetz\./.test(t[0]));
  const solo = !sp ? 0 : sp[1].b ? sp[1].b.eur : sp[1].a.eur;
  const amt10 = Math.round(x.amtlich / 10) * 10;
  const ok = w.level === 'nein' ? x.amtlich < 10 : Math.abs(solo - amt10) <= 10;
  n++; if (!ok) { fails++; console.log('FAIL [amtlich-wohngeld] ' + JSON.stringify(f) + ' SoLo ' + w.level + ' ' + solo + ' €, amtlich ' + x.amtlich + ' €'); }
});
console.log(fails ? fails + ' von ' + n + ' FEHLGESCHLAGEN' : '[amtlich-wohngeld] Abgleich mit dem amtlichen Wohngeldrechner bestanden: ' + n + ' Haushalte auf 10 € gleich');
process.exit(fails ? 1 : 0);
