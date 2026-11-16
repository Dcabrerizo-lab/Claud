// Amtliche Rechenbeispiele der Bundesagentur für Arbeit als feste Tests:
//  - Fachliche Weisungen §§ 11-11b SGB II (BA Zentrale, Stand 24.10.2024), Erwerbstätigenfreibetrag
//    https://www.arbeitsagentur.de/datei/fw-p11-11b-sgb-ii-stand-01072023_ba044381.pdf
//  - Durchführungsanweisungen Kinderzuschlag DA-KiZ (Familienkasse, Stand 20.02.2026)
//    https://www.arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf
const R = require('../src/rules.js');
let n = 0, fails = 0;
const gleich = (name, ist, soll) => { n++; if (Math.abs(ist - soll) > 0.005) { fails++; console.log('FAIL [ba-beispiel] ' + name + ': SoLo ' + ist + ', amtlich ' + soll); } };
const F = R.sgb2Freibetrag;
// FW Rz. 11.161: kinderlos, 1.450 € brutto, 1.150 € netto -> zu berücksichtigen 802 € (100 € Grundabsetzbetrag + 84 + 144 + 20 = 348 €)
gleich('FW 11.161 Freibetrag 1.450 € brutto ohne Kind', F(1450, false), 348);
gleich('FW 11.161 anrechenbar 1.150 € netto', 1150 - F(1450, false), 802);
// FW Rz. 11.161 und Beispiel Alg mit Nebeneinkommen: 250 € (brutto wie netto) -> 120 € (100 € + 20 % von 150 €)
gleich('FW 11.161 Abschlag 250 €', 250 - F(250, false), 120);
// FW Rz. 11.155: Insolvenzgeld 1.600 € brutto ohne Kind, Erwerbstätigenfreibetrag ohne Grundabsetzbetrag 248 €
gleich('FW 11.155 Freibetrag 1.600 € ohne Grundabsetzbetrag', F(1600, false) - 100, 248);
// FW Rz. 11.157: Stufen 20 % (100-520), 30 % (520-1.000), 10 % (1.000-1.200, mit minderjährigem Kind 1.000-1.500)
gleich('FW 11.157 Grenze 1.200 € ohne Kind', F(5000, false), 100 + 84 + 144 + 20);
gleich('FW 11.157 Grenze 1.500 € mit Kind', F(5000, true), 100 + 84 + 144 + 50);
gleich('FW 11.157 genau 520 €', F(520, false), 100 + 84);
gleich('FW 11.157 genau 1.000 €', F(1000, true), 100 + 84 + 144);
gleich('Grundabsetzbetrag unter 100 €', F(80, false), 80);
// DA-KiZ C.3.1.2: Wohnanteil der Eltern nach Tabelle
const TAB = { 1: [77, 63, 53, 46, 40, 36, 33, 30, 27, 25], 2: [83, 71, 62, 55, 50, 45, 41, 38, 35, 33] };
for (const a of [1, 2]) TAB[a].forEach((p, i) => gleich('DA-KiZ Wohnanteil ' + (a === 1 ? 'Alleinerziehende' : 'Elternpaar') + ' mit ' + (i + 1) + ' Kind(ern)', R.kizWohnanteil(a, i + 1), p / 100));
gleich('DA-KiZ Beispiel: Elternpaar, 2 Kinder, 800 € Warmmiete -> 568 €', 800 * R.kizWohnanteil(2, 2), 568);
gleich('DA-KiZ Beispiel Familie R.: (605 € - Kopfteil Großmutter 121 €) x 71 % = 343,64 €', (605 - 605 / 5) * R.kizWohnanteil(2, 2), 343.64);
gleich('DA-KiZ Beispiel: alleinerziehend, 1 Kind mit Kindergeld -> 77 %', R.kizWohnanteil(1, 1), 0.77);
// DA-KiZ B.3 Beispiele 1 und 2: Unterhalt des Kindes zu 45 % angerechnet (400 € -> 180 €, 600 € -> 270 €)
gleich('DA-KiZ B.3 Beispiel 1: 45 % von 400 €', R.RULES.kiz.anrechnung * 400, 180);
gleich('DA-KiZ B.3 Beispiel 2: 45 % von 600 €', R.RULES.kiz.anrechnung * 600, 270);
console.log(fails ? fails + ' von ' + n + ' amtlichen Rechenbeispielen FALSCH' : 'Amtliche Rechenbeispiele BA (FW §§ 11-11b SGB II, DA-KiZ): alle ' + n + ' gleich, bestanden');
process.exit(fails ? 1 : 0);
