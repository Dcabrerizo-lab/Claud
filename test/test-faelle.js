// 20 Beratungsfälle (von Hand durchdacht). Prüft Einstufung und zentrale Zahlen; Erwartungen stammen aus den
// Rechtsquellen (WoGG § 20, SGB II § 7/§ 8, § 33b EStG, SGB XI, BayBlindG, BayWoFG), nicht aus rules.js.
const R = require('./rules-de.js');
const base = { adults: 1, kids: 0, young: 0, brutto: 0, brutto2: 0, netto: '', miete: 0, vermoegen: 0, bezug: {} };
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const res = (o) => { const r = R.evaluate({ ...base, ...o }); const m = {}; r.results.forEach((x) => { m[x.id] = x; }); return { m, z: r.zusammen.map((a) => a[0]) }; };
const L = (o, id) => res(o).m[id].level;
const K = (o, id) => res(o).m[id].tx.map((a) => a[0]);
const P = (o, id, k) => res(o).m[id].tx[0][1][k];
const E = (x) => Math.round(x).toLocaleString('de-DE') + ' €';

// 1 Alleinerziehend, Kinder 4 und 9
const f1 = { kids: 2, brutto: 1800, miete: 850, mietstufe: 3, unterhaltFehlt: true };
ck('F1 Kindergeld 259', L(f1, 'kindergeld') === 'ja' && P(f1, 'kindergeld', 'kg') === '259 €');
ck('F1 UVG ja', L(f1, 'uvg') === 'ja' && P(f1, 'uvg', 'a') === '227 €' && P(f1, 'uvg', 'b') === '299 €' && P(f1, 'uvg', 'c') === '394 €');
ck('F1 Hinweis Kindergeld zuerst und Wohngeld/KiZ', res(f1).z.includes('z.kgZuerst') && res(f1).z.includes('z.wgKiz'));
ck('F1 Bedarf 563+780+850 + 36 % Mehrbedarf Alleinerziehende', P(f1, 'ggeld', 'bedarf') === E(563 + 780 + 850 + 0.36 * 563));
// 2 Rentnerin, Rente 1100, Miete 550
const f2 = { alter: true, nichtArbeit: true, brutto: 1100, miete: 550, mietstufe: 3, vermoegen: 5000 };
ck('F2 GSA ja, Bedarf 563+550', L(f2, 'gsa') === 'ja' && P(f2, 'gsa', 'bedarf') === E(563 + 550));
ck('F2 kein Jobcenter, keine EM-Rente', L(f2, 'ggeld') === 'nein' && L(f2, 'emrente') === 'nein');
ck('F2 Hinweis GSA statt Wohngeld', res(f2).z.includes('z.gsaWg'));
// 3 Rentnerin, Pflegegrad 3, Vermögen 20.000
const f3 = { alter: true, nichtArbeit: true, brutto: 900, miete: 600, mietstufe: 3, vermoegen: 20000, pflegegrad: '3' };
ck('F3 GSA wegen Vermögen nein', L(f3, 'gsa') === 'nein' && K(f3, 'gsa')[0] === 'gsa.verm');
ck('F3 Pflegegeld 599 + 131', L(f3, 'pflege') === 'ja' && P(f3, 'pflege', 'geld') === '599 €' && P(f3, 'pflege', 'ent') === '131 €');
ck('F3 Wohngeld-Text ohne Verweis auf Grundsicherung', K(f3, 'wohngeld')[0] === 'wohngeld.zuNiedrigVerm');
ck('F3 Eingliederungshilfe nicht vorgeschlagen (nur Pflegegrad im Alter)', L(f3, 'eingl') === 'nein');
ck('F3 Verhinderungspflege ja', L(f3, 'pflegeplus') === 'ja');
// 4 Paar, 2 Kinder, 4.000 € brutto gesamt
const f4 = { adults: 2, kids: 2, brutto: 4000, brutto2: 1500, miete: 1100, mietstufe: 4 };
ck('F4 Bedarf 1012+780+1100', P(f4, 'ggeld', 'bedarf') === E(1012 + 780 + 1100));
// Elterneinkommen 3.200 - 2 x 378 Freibetrag = 2.444; Bemessung 1.012 + 1.100 x 2/2,8 = 1.797,71; 594 - 0,45 x 646 = 303 -> wahrscheinlich
ck('F4 KiZ mit Freibeträgen für Arbeit: wahrscheinlich', L(f4, 'kiz') === 'ja');
ck('F4b KiZ bei 5.200 € brutto zu hoch', L({ ...f4, brutto: 5200 }, 'kiz') === 'nein');
ck('F4 WBS-Grenze 4 Personen (2 Kinder) = 27.500 + 2 x 5.000 + 2 x 1.300 = 40.100', P(f4, 'wbs', 'grenze') === '40.100 €' && L(f4, 'wbs') === 'vielleicht');
// 5 Bezug von Grundsicherungsgeld
const f5 = { adults: 2, kids: 3, nichtArbeit: true, miete: 1000, mietstufe: 3, bezug: { grundsicherungsgeld: true } };
ck('F5 Wohngeld/KiZ ausgeschlossen, BuT/Rundfunk ja', L(f5, 'wohngeld') === 'nein' && L(f5, 'kiz') === 'nein' && L(f5, 'but') === 'ja' && L(f5, 'rundfunk') === 'ja');
// 6 Azubi mit Betrieb, wohnt allein
const f6 = { ausbildung: 'ich', brutto: 900, miete: 450, mietstufe: 3, babBetrieb: true, babWohnt: true };
ck('F6 BAB möglich, nie "ja"', L(f6, 'bab') === 'vielleicht');
ck('F6 Wohngeld ausgeschlossen (§ 20 WoGG)', L(f6, 'wohngeld') === 'nein' && K(f6, 'wohngeld')[0] === 'wohngeld.ausbildung');
ck('F6 aufstockendes Grundsicherungsgeld bleibt möglich', L(f6, 'ggeld') === 'ja');
const f6b = { ...f6, babWohnt: false };
ck('F6b Azubi bei den Eltern: BAB unwahrscheinlich, Wohngeld nicht per § 20 ausgeschlossen', L(f6b, 'bab') === 'nein' && K(f6b, 'wohngeld')[0] !== 'wohngeld.ausbildung');
// 7 Studierende allein
const f7 = { ausbildung: 'ich', nichtArbeit: true, miete: 400, mietstufe: 3 };
ck('F7 Student: kein Grundsicherungsgeld (§ 7 Abs. 5 SGB II)', L(f7, 'ggeld') === 'nein' && K(f7, 'ggeld')[0] === 'ggeld.ausbildung');
ck('F7 Student: kein Wohngeld', L(f7, 'wohngeld') === 'nein');
ck('F7 BAföG möglich', L(f7, 'bafoeg') === 'vielleicht');
ck('F7 Student mit Kind: Wohngeld nicht per § 20 ausgeschlossen', K({ ...f7, kids: 1 }, 'wohngeld')[0] !== 'wohngeld.ausbildung');
ck('F7 Student 51+: Ausschluss entfällt (nicht mehr förderfähig)', K({ ...f7, alterGruppe: '51+' }, 'ggeld')[0] !== 'ggeld.ausbildung');
// 8 Familie, Kind 20 mit GdB 100
const f8 = { adults: 2, young: 1, brutto: 3000, brutto2: 1000, miete: 900, mietstufe: 3, bhPerson: 'erwVor25', bhSelbst: true, gdb: '100', ausbildung: 'kind' };
ck('F8 KG-Beh ja, 259', L(f8, 'kgBeh') === 'ja' && P(f8, 'kgBeh', 'kg') === '259 €');
ck('F8 Pauschbetrag 2.840', P(f8, 'pausch', 'betrag') === '2.840 €');
ck('F8 BAföG ja (Elternnetto 2.400 <= 2.540)', L(f8, 'bafoeg') === 'ja');
// 9 GdB 50 allein, 2.500 brutto
const f9 = { brutto: 2500, miete: 700, mietstufe: 3, gdb: '50' };
ck('F9 Pauschbetrag 1.140, Ausweis ja', P(f9, 'pausch', 'betrag') === '1.140 €' && L(f9, 'ausweis') === 'ja');
ck('F9 WBS möglich (30.000 > 28.300, aber 30.000*0,7-4.000 = 17.000)', L(f9, 'wbs') === 'vielleicht');
ck('F9 Wohngeld/Grundsicherungsgeld nein', L(f9, 'wohngeld') === 'nein' && L(f9, 'ggeld') === 'nein');
// 10 blind, Pflegegrad 4, EM unter 3 h, Wartezeit erfüllt
const f10 = { blind: 'blind', pflegegrad: '4', emStd: 'unter3', em5: true, gdb: '100', brutto: 300, nichtArbeit: true, miete: 500, mietstufe: 3, erwerbsgemindert: true };
ck('F10 Blindengeld 809, Pflegegeld-Anrechnung (Blindengeld wird weitergezahlt)', P(f10, 'blindengeld', 'betrag') === '809 €' && res(f10).m.blindengeld.tx[1][0] === 'blindengeld.pflege');
ck('F10 Pflegegeld 800', P(f10, 'pflege', 'geld') === '800 €');
ck('F10 EM-Rente ja (voll)', L(f10, 'emrente') === 'ja' && K(f10, 'emrente')[0] === 'emrente.voll');
ck('F10 GSA ja, kein Jobcenter', L(f10, 'gsa') === 'ja' && L(f10, 'ggeld') === 'nein');
// 11 Kind 8, GdB 60, Pflegegrad 2
const f11 = { adults: 2, kids: 1, brutto: 3500, brutto2: 500, miete: 1000, mietstufe: 3, bhPerson: 'minder', gdb: '60', pflegegrad: '2' };
ck('F11 Pauschbetrag 1.440 + Kinderhinweis', P(f11, 'pausch', 'betrag') === '1.440 €' && K(f11, 'pausch').includes('pausch.kind'));
ck('F11 Pflegegeld 347', P(f11, 'pflege', 'geld') === '347 €');
ck('F11 Eingliederungshilfe (Kind)', K(f11, 'eingl')[0] === 'eingl.kind');
ck('F11 Zuzahlung 1-%-Hinweis (GdB 60)', K(f11, 'zuzahl').includes('zuzahl.chron'));
// 12 Grundsicherungsgeld-Bezug + Kind mit Behinderung
const f12 = { kids: 1, nichtArbeit: true, miete: 600, mietstufe: 3, bezug: { grundsicherungsgeld: true }, bhPerson: 'minder', gdb: '80' };
ck('F12 Pauschbetrag 2.120, Rundfunk ja, Wohngeld nein', P(f12, 'pausch', 'betrag') === '2.120 €' && L(f12, 'rundfunk') === 'ja' && L(f12, 'wohngeld') === 'nein');
// 13 hohes Einkommen
const f13 = { adults: 2, kids: 1, brutto: 9500, brutto2: 3500, miete: 1200, mietstufe: 4, vermoegen: 100000 };
ck('F13 nur Kindergeld', ['wohngeld', 'kiz', 'ggeld', 'but', 'wbs'].every((id) => L(f13, id) === 'nein') && L(f13, 'kindergeld') === 'ja');
// 14 Rentnerpaar
const f14 = { adults: 2, alter: true, nichtArbeit: true, brutto: 1400, brutto2: 800, miete: 700, mietstufe: 2, vermoegen: 3000 };
ck('F14 GSA ja, Bedarf 1012+700', L(f14, 'gsa') === 'ja' && P(f14, 'gsa', 'bedarf') === E(1012 + 700));
// 15 Sozialamt-Bezug
const f15 = { alter: true, nichtArbeit: true, brutto: 400, miete: 500, mietstufe: 3, pflegegrad: '2', bezug: { sozialamt: true } };
ck('F15 GSA bereits bezogen (na), Rundfunk ja, Wohngeld nein', L(f15, 'gsa') === 'na' && L(f15, 'rundfunk') === 'ja' && L(f15, 'wohngeld') === 'nein');
// 16 teilweise erwerbsgemindert (3 bis 6 h): Jobcenter bleibt zuständig
const f16 = { emStd: '3bis6', brutto: 1000, miete: 500, mietstufe: 3 };
ck('F16 Jobcenter zuständig, EM-Rente offen', L(f16, 'ggeld') === 'ja' && L(f16, 'gsa') === 'nein' && L(f16, 'emrente') === 'vielleicht');
// 17 unter 3 Stunden + Werkstatt: Sozialamt, nicht Jobcenter
const f17 = { wfbm: true, emStd: 'unter3', em5: true, gdb: '80', brutto: 200, nichtArbeit: true, miete: 350, mietstufe: 3 };
ck('F17 Sozialamt statt Jobcenter', L(f17, 'gsa') === 'ja' && L(f17, 'ggeld') === 'nein');
ck('F17 Budget für Arbeit möglich, Pauschbetrag 2.120', L(f17, 'arbeit') === 'vielleicht' && P(f17, 'pausch', 'betrag') === '2.120 €');
ck('F17b ohne Miete kein Wohngeld', L({ ...f17, miete: 0 }, 'wohngeld') === 'nein' && K({ ...f17, miete: 0 }, 'wohngeld')[0] === 'wohngeld.keineMiete');
// 18 Alleinerziehend, Kind 2 J.
const f18 = { kids: 1, brutto: 2400, miete: 800, mietstufe: 3, unterhaltFehlt: true };
ck('F18 UVG ja', L(f18, 'uvg') === 'ja');
// 19 Wohngeld/KiZ kombinierbar
const f19 = { adults: 2, young: 1, brutto: 3200, brutto2: 1200, miete: 900, mietstufe: 3, ausbildung: 'kind' };
ck('F19 Antwort ohne Fehlwerte', JSON.stringify(res(f19).m).indexOf('NaN') < 0 && JSON.stringify(res(f19).m).indexOf('undefined') < 0);
// 20 Wohngeld und KiZ werden schon bezogen
const f20 = { adults: 2, kids: 1, brutto: 2200, brutto2: 800, miete: 900, mietstufe: 3, bezug: { wohngeld: true, kiz: true } };
ck('F20 Wohngeld/KiZ "na", BuT ja', L(f20, 'wohngeld') === 'na' && L(f20, 'kiz') === 'na' && L(f20, 'but') === 'ja');
// Regel: Unter 3 Stunden ist nicht erwerbsfähig (§ 8 SGB II), 3 bis 6 Stunden schon
ck('EM unter 3 h ohne Haken: Sozialamt', L({ emStd: 'unter3', brutto: 200, miete: 400, mietstufe: 3 }, 'ggeld') === 'nein');
ck('EM 3 bis 6 h: Jobcenter', L({ emStd: '3bis6', brutto: 200, miete: 400, mietstufe: 3 }, 'ggeld') !== 'nein');
// Keine NaN/undefined in irgendeinem Fall, Stufen nur gültig
const gueltig = ['ja', 'vielleicht', 'nein', 'na'];
[f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16, f17, f18, f19, f20].forEach((o, i) => {
  const r = R.evaluate({ ...base, ...o });
  ck('Fall ' + (i + 1) + ': 21 Ergebnisse, gültige Stufen, keine Fehlwerte', r.results.length === 21 && r.results.every((x) => gueltig.includes(x.level)) && !/NaN|undefined|Infinity/.test(JSON.stringify(r)));
});
console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '\nFall-Tests bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
