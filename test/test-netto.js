// Netto aus Brutto (Lohnsteuer nach Programmablaufplan 2026, Sozialversicherung) und Pfändung (§ 850c ZPO, P-Konto).
// Sollwerte stammen nicht aus src/rules.js, sondern aus amtlichen bzw. veröffentlichten Quellen (Angabe je Prüfung).
'use strict';
const R = require('../src/rules.js');
let fails = 0;
function check(name, cond, extra) {
  if (!cond) { fails++; console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra)); } else console.log('ok  ', name);
}
const H = 2026.5;

// 1) Lohnsteuer: veröffentlichtes Beispiel (lohnsteuerrechner 1.0.7, README, cent-genau zur BMF-Schnittstelle):
//    2026, Monat, 5.000 € brutto, Steuerklasse I, Zusatzbeitrag 2,5 %, kinderlos -> 785,83 € Lohnsteuer, 0 € Soli
const bsp = R.nettoLohn(5000, { stkl: 1, kinderlos: true, kvz: 2.5, heute: H });
check('[netto-pap] PAP 2026: 5.000 € StKl I (KVZ 2,5, kinderlos) = 785,83 € Lohnsteuer', bsp.lst === 785.83, bsp);
check('PAP 2026: dabei kein Solidaritätszuschlag', bsp.soli === 0, bsp);

// 2) Tarif § 32a EStG 2026 (Steuerfortentwicklungsgesetz): Grundfreibetrag 12.348 €; Prüfwerte direkt aus den Formeln
const tarif = (x) => { // unabhängige Umsetzung nur für die Prüfung
  if (x <= 12348) return 0;
  if (x <= 17799) { const y = (x - 12348) / 1e4; return Math.floor((914.51 * y + 1400) * y); }
  if (x <= 69878) { const z = (x - 17799) / 1e4; return Math.floor((173.10 * z + 2397) * z + 1034.87); }
  if (x <= 277825) return Math.floor(0.42 * x - 11135.63);
  return Math.floor(0.45 * x - 19470.38);
};
// Monatslohn so wählen, dass das zu versteuernde Einkommen bekannt ist: StKl VI hat keine Freibeträge außer Vorsorgepauschale.
// Stattdessen: Steuerklasse I, Rechnung zu Fuß mit denselben Schritten wie § 39b EStG (Vorsorgepauschale, 1.230 € + 36 €).
function lstZuFuss(b, kvz, pv) {
  const j = Math.floor(b * 12 * 100) / 100;
  const vspr = Math.floor(Math.min(j, 101400) * 0.093 * 100) / 100;
  const vkp = Math.floor(Math.min(j, 69750) * (0.07 + kvz / 200 + pv) * 100) / 100;
  let vsp = Math.ceil(vkp + vspr);
  const hb = Math.min(1900, Math.floor((Math.floor(0.013 * Math.min(j, 101400) * 100) / 100 + vkp) * 100) / 100);
  vsp = Math.max(vsp, Math.ceil(vspr + hb));
  const zve = Math.max(0, j - 1230 - 36 - vsp);
  return Math.floor(tarif(Math.floor(zve)) * 100 / 12) / 100;
}
let tf = 0;
for (let b = 1400; b <= 9000; b += 77) {
  const my = R.nettoLohn(b, { stkl: 1, kinderlos: true, heute: H }).lst, soll = lstZuFuss(b, 2.9, 0.024);
  if (Math.abs(my - soll) > 0.011) { tf++; if (tf < 4) console.log('  Abweichung', b, my, soll); }
}
check('[netto-pap] Steuerklasse I: 100 Monatslöhne 1.400-9.000 € wie Rechnung zu Fuß nach § 32a/§ 39b EStG', tf === 0, tf);

// 3) Eigenschaften
const n = (b, o) => R.nettoLohn(b, Object.assign({ heute: H }, o)).netto;
let mono = true;
for (let b = 610; b < 9000; b += 13) if (n(b + 13, { stkl: 1 }) < n(b, { stkl: 1 })) mono = false;
check('Netto steigt mit dem Brutto (Steuerklasse I)', mono);
check('[netto-stkl] Steuerklassen: III > I = IV > V > VI beim Netto (3.000 €)', n(3000, { stkl: 3 }) > n(3000, { stkl: 1 }) && n(3000, { stkl: 1 }) === n(3000, { stkl: 4 }) && n(3000, { stkl: 4 }) > n(3000, { stkl: 5 }) && n(3000, { stkl: 5 }) > n(3000, { stkl: 6 }));
check('Steuerklasse II (Alleinerziehende) mehr Netto als I', n(2500, { stkl: 2 }) > n(2500, { stkl: 1 }));
check('[netto-sv] Minijob (603 €) ohne Abzüge, wie bisher in der App', n(603, { stkl: 1 }) === 603);
check('Übergangsbereich beginnt fast ohne Beiträge (650 €: unter 30 € Beiträge)', R.nettoLohn(650, { stkl: 1, heute: H }).sv < 30);
const sv2000 = R.nettoLohn(2000, { stkl: 1, kinderlos: true, heute: H }).sv;
check('[netto-sv] Übergangsbereich endet bei 2.000 € mit vollen Beiträgen (21,75 %: RV 9,3 + AV 1,3 + KV 7,3 + 1,45 + PV 2,4)', Math.abs(sv2000 - 2000 * 0.2175) < 0.02, sv2000);
// Krankenversicherung Arbeitnehmer: halber allgemeiner Beitragssatz 7,3 % (§ 241, § 249 SGB V), nicht der ermäßigte 7,0 %
// 3.000 € mit Kind (PV 1,8 %): 9,3 + 1,3 + 7,3 + 1,45 + 1,8 = 21,15 % = 634,50 €
check('[netto-kv] KV-Arbeitnehmeranteil 7,3 % + halber Zusatzbeitrag (3.000 €: Beiträge 634,50 €)', R.nettoLohn(3000, { stkl: 1, heute: H }).sv === 634.5, R.nettoLohn(3000, { stkl: 1, heute: H }).sv);
check('[netto-kv] KV-Beitrag 1 % Zusatzbeitrag mehr = 0,5 % vom Lohn (3.000 €: 15 €)', Math.abs(R.nettoLohn(3000, { stkl: 1, kvz: 3.9, heute: H }).sv - R.nettoLohn(3000, { stkl: 1, heute: H }).sv - 15) < 0.02);
check('[netto-sv] Kinderlos zahlt 0,6 % mehr Pflege (3.000 €: 18 €)', Math.abs(R.nettoLohn(3000, { stkl: 1, heute: H }).sv + 18 - R.nettoLohn(3000, { stkl: 1, kinderlos: true, heute: H }).sv) < 0.02);
check('Sachsen: 0,5 % mehr Pflege (3.000 €: 15 €)', Math.abs(R.nettoLohn(3000, { stkl: 1, sachsen: true, heute: H }).sv - R.nettoLohn(3000, { stkl: 1, heute: H }).sv - 15) < 0.02);
check('Kirchensteuer 9 % senkt das Netto', n(3500, { stkl: 1, kirche: 0.09 }) < n(3500, { stkl: 1 }));
let inv = true;
for (const b of [700, 1100, 1650, 2400, 3300, 5200]) { const back = R.bruttoAusNetto(n(b, { stkl: 1 }), { stkl: 1, heute: H }); if (Math.abs(back - b) > 1) inv = false; }
check('[netto-umkehr] Brutto aus Netto findet das Brutto wieder (auf 1 € genau)', inv);

// 3b) Rente netto: KV 7,3 % + halber Zusatzbeitrag 1,45 % (§ 247 SGB V), PV 3,6 % allein (§ 59 Abs. 1 SGB XI), ab dem 2. Kind −0,25 (§ 55 Abs. 3 SGB XI)
//     Rechnung zu Fuß: 1.200 × (1 − 0,1235) = 1.051,80; 2.000 × 0,8765 = 1.753,00; mit 2 Kindern 1.200 × (1 − 0,121) = 1.054,80
const nr = (b, o) => R.nettoRente(b, Object.assign({ heute: H }, o));
check('[netto-rente] Rente 1.200 € -> 1.051,80 € netto', nr(1200) === 1051.8, nr(1200));
check('[netto-rente] Rente 2.000 € -> 1.753,00 € netto', nr(2000) === 1753, nr(2000));
check('[netto-rente] Rente 1.200 € mit 2 Kindern -> 1.054,80 € (Pflege −0,25)', nr(1200, { kinder: 2 }) === 1054.8, nr(1200, { kinder: 2 }));
check('[netto-rente] Pflege-Abschlag höchstens für 4 Kinder (2. bis 5. Kind)', nr(1200, { kinder: 5 }) === nr(1200, { kinder: 9 }) && nr(1200, { kinder: 5 }) > nr(1200, { kinder: 4 }));
check('[netto-rente] Beiträge nur bis zur Beitragsgrenze KV 5.812,50 € (2026): 7.000 € -> 6.282,16 €', nr(7000) === 6282.16, nr(7000));
// SV-Rechengrößenverordnung 2027 bei Stand 20.11.2026 nicht verkündet: 2027 weiter KV-Grenze 5.812,50 €; nach Verkündung (Schalter) 6.375 €
check('[netto-rente] 2027 vor Verkündung der Rechengrößen: Beitragsgrenze weiter 5.812,50 € (7.000 € -> 6.282,16 €)', R.nettoRente(7000, { heute: 2027.1 }) === 6282.16, R.nettoRente(7000, { heute: 2027.1 }));
R.RULES.svrg2027.verkuendet = true;
check('[netto-rente] 2027 nach Verkündung: Beitragsgrenze KV 6.375 €: 7.000 € -> 6.212,69 €', R.nettoRente(7000, { heute: 2027.1 }) === 6212.69 && R.nettoRente(7000, { heute: 2026.9 }) === 6282.16, R.nettoRente(7000, { heute: 2027.1 }));
R.RULES.svrg2027.verkuendet = false;
let invR = true;
for (const b of [450, 1051, 1200, 1777, 2950, 6100]) for (const k of [1, 3]) if (Math.abs(R.bruttoAusNettoRente(nr(b, { kinder: k }), { kinder: k, heute: H }) - b) > 1) invR = false;
check('[netto-rente] Brutto aus Rente netto findet das Brutto wieder (mit Kindern, auf 1 € genau)', invR && R.bruttoAusNettoRente(1054.8, { kinder: 2, heute: H }) === 1200);
// Ohne Kinder: Umkehrung mit Kinderlosen-Zuschlag 0,6 (vorsichtig: höheres Brutto). 1.051,80 / (1 − 0,1295) = 1.208,27 -> 1.208 €
check('[netto-rente] Brutto aus Rente netto ohne Kinder mit Kinderlosen-Zuschlag: 1.051,80 € -> 1.208 €', R.bruttoAusNettoRente(1051.8, { heute: H }) === 1208 && R.nettoRente(1208, { kinderlos: true, heute: H }) < 1051.8 + 0.5, R.bruttoAusNettoRente(1051.8, { heute: H }));
const dR = (o) => R.derive(Object.assign({ adults: 1, kids: 0, young: 0, art1: 'rente', brutto: 1200, netto: '', miete: 500, heute: H, bezug: {} }, o)).netto;
check('[netto-rente] Ohne Netto rechnet die App mit der Rente netto (1.200 € -> 1.051,80 €; Paar 1.200 + 800 € -> 1.753,00 €)', dR() === 1051.8 && dR({ adults: 2, art2: 'rente', brutto: 2000, brutto2: 800 }) === 1753, [dR(), dR({ adults: 2, art2: 'rente', brutto: 2000, brutto2: 800 })]);
check('2027: Minijob-Grenze 633 € (Netto = Brutto)', R.nettoLohn(633, { stkl: 1, heute: 2027.1 }).netto === 633);

// 4) Annahmen aus dem Haushalt
const A = R.lohnAnnahmen;
check('[netto-annahme] Annahme: allein ohne Kind -> Steuerklasse I, kinderlos', A({ adults: 1, kids: 0 }).stkl === 1 && A({ adults: 1, kids: 0 }).kinderlos);
check('Annahme: allein mit Kind -> Steuerklasse II', A({ adults: 1, kids: 1 }).stkl === 2);
check('Annahme: Paar mit einem Einkommen -> III', A({ adults: 2, kids: 0 }, 1).stkl === 3);

// 5) Pfändung: amtliche Tabelle (BGBl. 2026 I Nr. 80, Anlage, monatlich), Zeilen wörtlich übernommen
const ZEILEN = [
  [1940, [246.82, 0, 0, 0, 0, 0]],
  [2900, [918.82, 357.59, 152.94, 14.86, 0, 0]],
  [3200, [1128.82, 507.59, 272.94, 104.86, 3.34, 0]],
  [3530, [1359.82, 672.59, 404.94, 203.86, 69.34, 1.39]],
  [4860, [2290.82, 1337.59, 936.94, 602.86, 335.34, 134.39]]
];
ZEILEN.forEach(([von, soll]) => {
  const ist = [0, 1, 2, 3, 4, 5].map((p) => R.pfaendung(von + 5.55, p).pfaendbar);
  check('[pfaendung-tabelle] Pfändungstabelle 2026: Zeile ab ' + von + ' €', ist.every((v, i) => Math.abs(v - soll[i]) < 0.001), { ist, soll });
});
check('Pfändung: bis 1.589,99 € nichts pfändbar (allein)', R.pfaendung(1589.99, 0).pfaendbar === 0 && R.pfaendung(1590, 0).pfaendbar > 0);
check('[pfaendung-hoechst] Pfändung: Mehrbetrag über 4.866,30 € voll pfändbar', Math.abs(R.pfaendung(5000, 0).pfaendbar - (2290.82 + 5000 - 4866.3)) < 0.001);
check('Pfändung: unpfändbare Grundbeträge 1.587,40 / 2.184,82 / 3.516,14 €', R.pfaendFreibetrag(0) === 1587.4 && R.pfaendFreibetrag(1) === 2184.82 && R.pfaendFreibetrag(5) === 3516.14 && R.pfaendFreibetrag(7) === 3516.14);
// P-Konto: 1.590 € automatisch (§ 899 ZPO, aufgerundet); Beispiel zwei Kinder: 1.590 + 597,42 + 332,83 = 2.520,25 € (gegen-hartz.de, Juli 2026)
check('[pkonto] P-Konto: Sockel 1.590 €', R.pkonto({ personen: 0 }).gesamt === 1590);
check('P-Konto: zwei Unterhaltsberechtigte 2.520,25 € (ohne Kindergeld)', R.pkonto({ personen: 2 }).gesamt === 2520.25);
check('[pkonto] P-Konto: Kindergeld kommt mit Bescheinigung dazu', R.pkonto({ personen: 2, kindergeldKinder: 2 }).gesamt === 2520.25 + 2 * R.RULES.kindergeld);

console.log(fails ? '\n' + fails + ' Fehler' : '\nAlle Prüfungen bestanden');
process.exit(fails ? 1 : 0);
