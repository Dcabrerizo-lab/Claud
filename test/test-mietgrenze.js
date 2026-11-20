// Höchstbetrag der Miete beim Wohngeld (Anzeige unter dem Mietfeld und in der Einfachen Version): Rules.wgHoechst.
// Erwartete Werte stehen hier unabhängig vom Code, abgelesen aus Anlage 1 zu § 12 Abs. 1 WoGG (BGBl. 2024 I Nr. 314) plus
// Klimakomponente (§ 12 Abs. 7 WoGG) und Heizkostenkomponente (§ 12 Abs. 6 WoGG), Abruf gesetze-im-internet.de 20.11.2026.
// Dazu der Gleichlauf mit der Wohngeld-Rechnung (wgCap, wgMiete): Anzeige und Karte können nicht auseinanderlaufen.
'use strict';
const R = require('../src/rules.js');
let n = 0, fails = 0;
const check = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : JSON.stringify(x)); } };
const cent = (v) => Math.round(v * 100);
const gleich = (a, b) => cent(a) === cent(b);

// Höchstbetrag + Klimakomponente (Summe), 1..5 Personen und je weitere Person, Mietenstufe I..VII
const TAB = {
  1: [380.2, 427.2, 475.2, 530.2, 581.2, 634.2, 696.2],
  2: [461.8, 517.8, 575.8, 643.8, 704.8, 769.8, 844.8],
  3: [550.6, 616.6, 686.6, 766.6, 838.6, 916.6, 1004.6],
  4: [642.4, 720.4, 800.4, 892.4, 980.4, 1069.4, 1173.4],
  5: [733.2, 821.2, 914.2, 1021.2, 1119.2, 1222.2, 1341.2],
  weiter: [86.8, 98.8, 110.8, 123.8, 133.8, 153.8, 167.8]
};
const KLIMA = [19.2, 24.8, 29.6, 34.4, 39.2], KLIMA_W = 4.8;
const HEIZ = [110.4, 142.6, 170.2, 197.8, 225.4], HEIZ_W = 27.6;
const soll = (s, p) => (p <= 5 ? TAB[p][s - 1] : TAB[5][s - 1] + (p - 5) * TAB.weiter[s - 1]);

check('Funktion exportiert', typeof R.wgHoechst === 'function');

// 1) Beispiel aus dem Entwurf
{
  const w = R.wgHoechst({ stufen: [3], n: 3 });
  check('III / 3 Personen: 686,60 €', gleich(w.von, 686.6) && gleich(w.bis, 686.6), w);
  check('III / 3 Personen: Heizbetrag 170,20 €, Klima 29,60 €', gleich(w.heizKomp, 170.2) && gleich(w.klima, 29.6), w);
  check('ohne Miete: kein Vergleich', w.vergleich === null && w.kalt === null, w);
}
// 2) Ecken der Tabelle und mehr als 5 Personen
check('I / 1 = 380,20', gleich(R.wgHoechst({ stufen: [1], n: 1 }).von, 380.2));
check('VII / 5 = 1.341,20', gleich(R.wgHoechst({ stufen: [7], n: 5 }).von, 1341.2));
check('IV / 6 = 1.145,00', gleich(R.wgHoechst({ stufen: [4], n: 6 }).von, 1145));
check('VII / 12 = 2.515,80', gleich(R.wgHoechst({ stufen: [7], n: 12 }).von, 2515.8));
check('13 Personen wie 12', gleich(R.wgHoechst({ stufen: [7], n: 13 }).von, 2515.8));
check('0 Personen wie 1', gleich(R.wgHoechst({ stufen: [1], n: 0 }).von, 380.2));
// 3) Ganze Tabelle unabhängig, Klima und Heizung, Gleichlauf mit wgCap und wgMiete
for (let s = 1; s <= 7; s++) {
  for (let p = 1; p <= 12; p++) {
    const w = R.wgHoechst({ stufen: [s], n: p });
    check(`Tabelle ${s}/${p}`, gleich(w.von, soll(s, p)), [w.von, soll(s, p)]);
    check(`wgCap ${s}/${p}`, w.von === R.wgCap(s, p));
    check(`Klima ${p}`, gleich(w.klima, p <= 5 ? KLIMA[p - 1] : KLIMA[4] + (p - 5) * KLIMA_W));
    check(`Heiz ${p}`, gleich(w.heizKomp, p <= 5 ? HEIZ[p - 1] : HEIZ[4] + (p - 5) * HEIZ_W) && w.heizKomp === R.wgHeiz(p));
    for (const [warm, heiz] of [[300, 0], [700, 0], [950, 0], [950, 120], [1400, 300], [2600, 0], [800, 900]]) {
      const v = R.wgHoechst({ stufen: [s], n: p, warm, heiz });
      check(`Anzeige = Rechnung ${s}/${p} ${warm}/${heiz}`, gleich(Math.min(v.kalt, v.von) + v.heizKomp, R.wgMiete(s, p, warm, 1, heiz)), [v, R.wgMiete(s, p, warm, 1, heiz)]);
    }
  }
}
// 4) bis 7) Vergleich
{
  const a = R.wgHoechst({ stufen: [3], n: 3, warm: 950 });
  check('950 € warm, ohne Heizkosten, III/3: kalt 779,80, geschätzt, darüber', gleich(a.kalt, 779.8) && a.geschaetzt && a.vergleich === 'drueber', a);
  const b = R.wgHoechst({ stufen: [3], n: 3, warm: 800, heiz: 150 });
  check('800 € warm, 150 € Heizung: kalt 650, nicht geschätzt, darunter', gleich(b.kalt, 650) && !b.geschaetzt && b.vergleich === 'drunter', b);
  const c = R.wgHoechst({ stufen: [3], n: 3, warm: 850 });
  check('850 € warm ohne Heizkosten: kalt 679,80, nahe an der Grenze', gleich(c.kalt, 679.8) && c.vergleich === 'nah', c);
  const c2 = R.wgHoechst({ stufen: [3], n: 3, warm: 850, heiz: 170.2 });
  check('mit Heizkosten-Angabe nie „nah“', c2.vergleich === 'drunter' && !c2.geschaetzt, c2);
  const d = R.wgHoechst({ stufen: [4, 3], n: 1, warm: 650, heiz: 150 });
  check('Stufen III/IV, 1 Person, kalt 500: möglich, Spanne 475,20 bis 530,20', d.sv === 3 && d.sb === 4 && gleich(d.von, 475.2) && gleich(d.bis, 530.2) && d.vergleich === 'moeglich', d);
  const d2 = R.wgHoechst({ stufen: [3, 4], n: 1, warm: 900, heiz: 100 });
  check('Spanne, Miete über dem höchsten Wert: darüber', d2.vergleich === 'drueber', d2);
  const d3 = R.wgHoechst({ stufen: [3, 4], n: 1, warm: 500, heiz: 100 });
  check('Spanne, Miete unter dem niedrigsten Wert: darunter', d3.vergleich === 'drunter', d3);
}
// 8) keine oder ungültige Stufen: ganze Spanne I bis VII
{
  const e = R.wgHoechst({ n: 1 });
  check('keine Stufen: 380,20 bis 696,20', e.sv === 1 && e.sb === 7 && gleich(e.von, 380.2) && gleich(e.bis, 696.2), e);
  const f = R.wgHoechst({ stufen: ['x', 0, 9, null], n: 1 });
  check('ungültige Stufen: ganze Spanne, kein Absturz', f.sv === 1 && f.sb === 7, f);
  const g = R.wgHoechst({ stufen: ['3', 10], n: 2 });
  check('Stufe als Text „3“ wird angenommen, 10 verworfen', g.sv === 3 && g.sb === 3 && gleich(g.von, 575.8), g);
  check('ohne Argument kein Absturz', R.wgHoechst().sv === 1);
}
// 9) Heizkosten ab Höhe der Warmmiete werden ignoriert (wie derive)
{
  const h = R.wgHoechst({ stufen: [2], n: 1, warm: 500, heiz: 500 });
  check('heiz ≥ warm: ignoriert, Schätzung mit Heizbetrag', h.geschaetzt && gleich(h.kalt, 500 - 110.4), h);
}
// 10) Eigentum und 11) leere Miete: kein Vergleich
check('Eigentum: kein Vergleich', R.wgHoechst({ stufen: [3], n: 2, warm: 1200, eigentum: true }).vergleich === null);
check('Miete leer: kein Vergleich', R.wgHoechst({ stufen: [3], n: 2, warm: '' }).vergleich === null);
check('Miete negativ: kein Vergleich', R.wgHoechst({ stufen: [3], n: 2, warm: -5 }).vergleich === null);
// sehr kleine Warmmiete: kalt nie negativ
check('kalt nie negativ', R.wgHoechst({ stufen: [3], n: 4, warm: 100 }).kalt === 0);

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '[mietgrenze] Höchstbetrag der Miete: ' + n + ' Prüfungen bestanden (Anlage 1 WoGG, Klima- und Heizbetrag, Anzeige = Rechnung)');
process.exit(fails ? 1 : 0);
