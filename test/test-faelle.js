// 20 Beratungsfälle (von Hand durchdacht). Prüft Einstufung und zentrale Zahlen; Erwartungen stammen aus den
// Rechtsquellen (WoGG § 20, SGB II § 7/§ 8, § 33b EStG, SGB XI, BayBlindG, BayWoFG), nicht aus rules.js.
const R = require('./rules-de.js');
const KARTEN = require('./karten.js');
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
ck('[kg-betrag] F1 Kindergeld 259', L(f1, 'kindergeld') === 'ja' && P(f1, 'kindergeld', 'kg') === '259 €');
ck('[uvg-betrag] F1 UVG ja', L(f1, 'uvg') === 'ja' && P(f1, 'uvg', 'a') === '227 €' && P(f1, 'uvg', 'b') === '299 €' && P(f1, 'uvg', 'c') === '394 €');
ck('F1 Hinweis Kindergeld zuerst und Wohngeld/KiZ', res(f1).z.includes('z.kgZuerst') && res(f1).z.includes('z.wgKiz'));
ck('[gg-mb-ae] F1 Bedarf 563+780+850 + 36 % Mehrbedarf Alleinerziehende', P(f1, 'ggeld', 'bedarf') === E(563 + 780 + 850 + 0.36 * 563));
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
ck('[wbs-grenze] F4 WBS-Grenze 4 Personen (2 Kinder) = 27.500 + 2 x 5.000 + 2 x 1.300 = 40.100', P(f4, 'wbs', 'grenze') === '40.100 €' && L(f4, 'wbs') === 'vielleicht');
// 5 Bezug von Grundsicherungsgeld
const f5 = { adults: 2, kids: 3, nichtArbeit: true, miete: 1000, mietstufe: 3, bezug: { grundsicherungsgeld: true } };
ck('F5 Wohngeld/KiZ ausgeschlossen, BuT/Rundfunk ja', L(f5, 'wohngeld') === 'nein' && L(f5, 'kiz') === 'nein' && L(f5, 'but') === 'ja' && L(f5, 'rundfunk') === 'ja');
// 6 Azubi mit Betrieb, wohnt allein
const f6 = { ausbildung: 'ich', brutto: 900, miete: 450, mietstufe: 3, babBetrieb: true, babWohnt: true };
ck('[bab-voraus] F6 BAB möglich, nie "ja"', L(f6, 'bab') === 'vielleicht');
ck('[wg-azubi] F6 Wohngeld ausgeschlossen (§ 20 WoGG)', L(f6, 'wohngeld') === 'nein' && K(f6, 'wohngeld')[0] === 'wohngeld.ausbildung');
ck('F6 aufstockendes Grundsicherungsgeld bleibt möglich', L(f6, 'ggeld') === 'ja');
const f6b = { ...f6, babWohnt: false };
ck('F6b Azubi bei den Eltern: BAB unwahrscheinlich, Wohngeld nicht per § 20 ausgeschlossen', L(f6b, 'bab') === 'nein' && K(f6b, 'wohngeld')[0] !== 'wohngeld.ausbildung');
// 7 Studierende allein
const f7 = { ausbildung: 'ich', nichtArbeit: true, miete: 400, mietstufe: 3 };
ck('[gg-studium] F7 Student: kein Grundsicherungsgeld (§ 7 Abs. 5 SGB II)', L(f7, 'ggeld') === 'nein' && K(f7, 'ggeld')[0] === 'ggeld.ausbildung');
ck('F7 Student: kein Wohngeld', L(f7, 'wohngeld') === 'nein');
ck('F7 BAföG möglich', L(f7, 'bafoeg') === 'vielleicht');
ck('F7 Student mit Kind: Wohngeld nicht per § 20 ausgeschlossen', K({ ...f7, kids: 1 }, 'wohngeld')[0] !== 'wohngeld.ausbildung');
ck('F7 Student 51+: Ausschluss entfällt (nicht mehr förderfähig)', K({ ...f7, alterGruppe: '50+' }, 'ggeld')[0] !== 'ggeld.ausbildung');
// 8 Familie, Kind 20 mit GdB 100
const f8 = { adults: 2, young: 1, brutto: 3000, brutto2: 1000, miete: 900, mietstufe: 3, bhPerson: 'erwVor25', bhSelbst: true, gdb: '100', ausbildung: 'kind' };
ck('[kgbeh-ja] F8 KG-Beh ja, 259', L(f8, 'kgBeh') === 'ja' && P(f8, 'kgBeh', 'kg') === '259 €');
ck('[st-pausch] F8 Pauschbetrag 2.840', P(f8, 'pausch', 'betrag') === '2.840 €');
ck('[bafoeg-eltern] F8 BAföG ja (Elternnetto 2.400 <= 2.540)', L(f8, 'bafoeg') === 'ja');
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
  ck('Fall ' + (i + 1) + ': ' + KARTEN.length + ' Ergebnisse, gültige Stufen, keine Fehlwerte', r.results.length === KARTEN.length && r.results.every((x) => gueltig.includes(x.level)) && !/NaN|undefined|Infinity/.test(JSON.stringify(r)));
});
// ---------- Arbeitslosengeld I und Krankengeld (SGB III, SGB V) ----------
const T = (o, id, key) => { const x = res(o).m[id].tx.find((a) => a[0] === key); return x ? x[1] : null; };
// § 147 Abs. 2 SGB III: ab 58 Jahren und 48 Monaten Versicherung 24 Monate; mit Kind 67 % (§ 149)
const a1 = { adults: 2, kids: 2, arbeitSit: 'arbeitslos', algZeit: true, algMonate: 48, gebJahr: 1966, heute: 2026.8, lohnVorher: 4000 };
ck('[alg-dauer] ALG I: 60 Jahre, 48 Monate → 24 Monate, mit Kindern 67 %', L(a1, 'alg1') === 'ja' && T(a1, 'alg1', 'alg1.dauer').m === 24 && T(a1, 'alg1', 'alg1.ja').p === 67);
ck('ALG I: Schätzung 4.000 € x (60-72 %) x 67 % = 1.610 bis 1.930 €', T(a1, 'alg1', 'schaetz.spanne').a === E(1610) && T(a1, 'alg1', 'schaetz.spanne').b === E(1930), JSON.stringify(T(a1, 'alg1', 'schaetz.spanne')));
ck('ALG I: 57 Jahre mit 48 Monaten → 18 Monate (ab 55 und 36 Monaten)', T({ ...a1, gebJahr: 1969 }, 'alg1', 'alg1.dauer').m === 18);
ck('ALG I: 30 Jahre, 20 Monate → 10 Monate, ohne Kind 60 %', T({ ...a1, adults: 1, kids: 0, gebJahr: 1996, algMonate: 20 }, 'alg1', 'alg1.dauer').m === 10 && T({ ...a1, adults: 1, kids: 0, gebJahr: 1996, algMonate: 20 }, 'alg1', 'alg1.ja').p === 60);
ck('ALG I: über der Beitragsbemessungsgrenze gedeckelt (8.450 €)', T({ ...a1, lohnVorher: 12000 }, 'alg1', 'schaetz.spanne').b === E(Math.round(8450 * 0.72 * 0.67 / 10) * 10));
ck('ALG I: ohne 12 Monate Versicherung nur möglich', L({ ...a1, algZeit: false }, 'alg1') === 'vielleicht');
ck('ALG I: im Rentenalter nicht', L({ ...a1, gebJahr: 1955 }, 'alg1') === 'nein');
ck('ALG I: wer es schon bekommt → schon vorhanden', L({ ...a1, art1: 'alg', brutto: 1900, netto: 1900 }, 'alg1') === 'na');
ck('ALG I: Krankengeld läuft aus → Nahtlosigkeit möglich (§ 145 SGB III)', L({ arbeitSit: 'krank', krankWochen: 'ende' }, 'alg1') === 'vielleicht' && K({ arbeitSit: 'krank', krankWochen: 'ende' }, 'alg1')[0] === 'alg1.nahtlos');
// § 47 SGB V: 70 % brutto, höchstens 90 % netto; abzüglich Beiträge 12,5 %. 3.000 € brutto: netto 60-72 % → 1.620/1.944 x 0,9
const k1 = { arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 3000 };
ck('Krankengeld läuft: wahrscheinlich, Hinweis auf 78 Wochen', L(k1, 'krankengeld') === 'ja' && K(k1, 'krankengeld').includes('krank.78'));
ck('Krankengeld: Schätzung 3.000 € → 1.420 bis 1.700 €', T(k1, 'krankengeld', 'schaetz.spanne').a === E(Math.round(3000 * 0.6 * 0.9 * 0.875 / 10) * 10) && T(k1, 'krankengeld', 'schaetz.spanne').b === E(Math.round(Math.min(2100, 3000 * 0.72 * 0.9) * 0.875 / 10) * 10), JSON.stringify(T(k1, 'krankengeld', 'schaetz.spanne')));
// Kleines Brutto (1.500 €): Netto bis 80 % -> 90 % davon = 1.080 € liegt über 70 % brutto = 1.050 € -> die 70-%-Grenze greift
ck('Krankengeld bei 1.500 € brutto: 70-%-Grenze greift (oben 1.050 € x 0,875 = 920 €)', T({ ...k1, lohnVorher: 1500 }, 'krankengeld', 'schaetz.spanne').b === E(920), JSON.stringify(T({ ...k1, lohnVorher: 1500 }, 'krankengeld', 'schaetz.spanne')));
ck('Krankengeld: unter 6 Wochen zahlt der Arbeitgeber (möglich)', L({ ...k1, krankWochen: 'unter6' }, 'krankengeld') === 'vielleicht' && K({ ...k1, krankWochen: 'unter6' }, 'krankengeld')[0] === 'krank.lfz');
ck('Krankengeld nach 78 Wochen: endet, EM-Rente wird möglich', L({ ...k1, krankWochen: 'ende' }, 'krankengeld') === 'nein' && L({ ...k1, krankWochen: 'ende' }, 'emrente') === 'vielleicht');

// ---------- Fälle aus den Nutzertests ----------
// Jasmin: alleinerziehend, Kinder 3 und 8, Minijob 538 €, Miete 780: Bedarf 563 + 357 + 390 + 780 + 36 % Mehrbedarf = 2.292,68
const jas = { kids: 2, kidsU6: 1, unterhaltFehlt: true, art1: 'lohn', brutto: 538, netto: 538, miete: 780, mietstufe: 5, vermoegen: 400, bezug: { kindergeld: true } };
ck('Jasmin: Bedarf mit Mehrbedarf 2.293 €', P(jas, 'ggeld', 'bedarf') === E(563 + 357 + 390 + 780 + 0.36 * 563));
ck('Jasmin: Grundsicherungsgeld wahrscheinlich, Unterhaltsvorschuss wahrscheinlich, Kinderzuschlag nein (Mindesteinkommen)', L(jas, 'ggeld') === 'ja' && L(jas, 'uvg') === 'ja' && L(jas, 'kiz') === 'nein');
// Thomas: Paar, Tochter 19 in Ausbildung im Betrieb mit 850 €: kein BAföG, Einkommen der Tochter mindert die Grundsicherung
const tho = { adults: 2, young: 1, art1: 'kg', art2: 'lohn', brutto: 1450 + 1100, brutto2: 1100, netto: 1450 + 870, miete: 920, mietstufe: 3, vermoegen: 12000, gebJahr: 1968, heute: 2026.8, ausbildung: 'kindBetrieb' };
ck('Thomas: Kind im Betrieb → kein BAföG, BAB-Hinweis', L(tho, 'bafoeg') === 'nein' && K(tho, 'bafoeg')[0] === 'bafoeg.betrieb' && L(tho, 'bab') === 'vielleicht');
ck('Thomas: mit 850 € Ausbildungsvergütung keine „wahrscheinliche“ Grundsicherung mehr', L(tho, 'ggeld') === 'ja' && L({ ...tho, kindEink: 850 }, 'ggeld') !== 'ja');
ck('Thomas: Krankengeld schon vorhanden', L(tho, 'krankengeld') === 'na');
// Elena: ALG I 2.050 + Elterngeld 1.200, 2 Kinder unter 6, München VII, Miete 1.680: Elterngeld nicht wie Lohn
const ele = { adults: 2, kids: 2, kidsU6: 2, art1: 'alg', art2: 'eg', brutto: 3250, brutto2: 1200, netto: 3250, miete: 1680, mietstufe: 7, vermoegen: 28000, gebJahr: 1990, heute: 2026.8 };
ck('Elena: Wohngeld und Kinderzuschlag wahrscheinlich, mit Beträgen', L(ele, 'wohngeld') === 'ja' && L(ele, 'kiz') === 'ja' && !!T(ele, 'kiz', 'schaetz.eins') && (!!T(ele, 'wohngeld', 'schaetz.spanne') || !!T(ele, 'wohngeld', 'schaetz.eins')));
ck('Elena: Elterngeld bekommt keinen Freibetrag für Arbeit (anders als Lohn)', L(ele, 'ggeld') !== 'ja' || L({ ...ele, art2: 'lohn' }, 'ggeld') === 'ja');
// Günter: 66 Jahre (geb. 1960, Grenze 66 Jahre 4 Monate → je nach Monat), Rente 1.050, Miete 520, GdB 80 mit G, Pflegegrad 2
const gue = { art1: 'rente', brutto: 1180, netto: 1050, miete: 520, mietstufe: 4, vermoegen: 900, gebJahr: 1958, heute: 2026.8, bhPerson: 'erwNach25', gdb: '80', mzG: true, pflegegrad: '2' };
ck('Günter: Rentenalter aus dem Geburtsjahr → Sozialamt statt Jobcenter', L(gue, 'ggeld') === 'nein' && K(gue, 'ggeld')[0] === 'ggeld.sozialamtZustaendig');
ck('Günter: Mehrbedarf G (17 % von 563 €) im Bedarf', P(gue, 'gsa', 'bedarf') === E(563 + 520 + 0.17 * 563));
ck('Günter: Fahrtkostenpauschale 900 € ab GdB 80, Steuer-Hinweis', !!T(gue, 'pausch', 'pausch.fahrt') && K(gue, 'pausch').includes('pausch.steuer'));
ck('Günter: geboren 1960 → je nach Geburtsmonat (möglich, mit Hinweis)', K({ ...gue, gebJahr: 1960 }, 'gsa').includes('gsa.grenz'));

// ---------- Werkstatt für behinderte Menschen (SGB XII, von Hand gerechnet) ----------
// § 82 Abs. 3 Satz 2 SGB XII: Werkstattlohn ohne Arbeitsförderungsgeld (52 €); frei: 563/8 = 70,375 € plus 50 % des Rests.
// W1: 30 Jahre, bei den Eltern ohne Miete, Werkstatt 250 € -> 198 € anrechenbar vor Freibetrag; frei 70,375 + 63,8125 = 134,19
//     -> 63,81 € zählen. Bedarf Stufe 1: 563 €. Lücke 499,19 -> wahrscheinlich, „mindestens 500 €“ (Wohnkosten offen).
const w1 = { einkommen: [{ art: 'wfbm', b: 250 }], wohnform: 'eltern', miete: 0, wfbm: true, gebJahr: 1996, heute: 2026.8, vermoegen: 500, bhPerson: 'erwNach25' };
ck('W1 Werkstatt bei den Eltern: wahrscheinlich, Bedarf 563 €', L(w1, 'gsa') === 'ja' && P(w1, 'gsa', 'bedarf') === E(563));
ck('W1 Betrag: mindestens 500 € (Wohnkosten bei den Eltern offen)', T(w1, 'gsa', 'schaetz.mind') && T(w1, 'gsa', 'schaetz.mind').a === E(500), JSON.stringify(res(w1).m.gsa.tx));
ck('[gsa-eltern] W1 Hinweis: Einkommen der Eltern zählt nicht', K(w1, 'gsa').includes('gsa.eltern'));
ck('W1 kein Grundsicherungsgeld (Jobcenter), kein Wohngeld für sich allein', L(w1, 'ggeld') === 'nein' && L(w1, 'wohngeld') === 'nein');
// W2: mit Merkzeichen G: Bedarf 563 + 17 % = 658,71
ck('[gsa-mb-g] W2 Merkzeichen G: Bedarf 658,71 €', P({ ...w1, mzG: true }, 'gsa', 'bedarf') === E(658.71));
// W3: eigene Wohnung, Miete 450, Werkstatt 300 + Erwerbsminderungsrente 900: anrechenbar 248 - (70,375 + 88,8125) = 88,81;
//     Einkommen 988,81; Bedarf 1.013 -> Lücke 24,19 -> nur möglich
const w3 = { einkommen: [{ art: 'wfbm', b: 300 }, { art: 'rente', b: 900 }], miete: 450, wfbm: true, gebJahr: 1980, heute: 2026.8, vermoegen: 1000 };
ck('W3 Werkstatt plus Rente, eigene Wohnung: knapp (möglich)', L(w3, 'gsa') === 'vielleicht');
ck('[gsa-essen] W3 mit Mittagessen in der Werkstatt: weiter möglich, Hinweis Mehrbedarf', L({ ...w3, wfbmEssen: true }, 'gsa') === 'vielleicht' && K({ ...w3, wfbmEssen: true }, 'gsa').includes('gsa.essen'));
// W4: Wohnheim, Werkstatt 200: anrechenbar 148 - (70,375 + 38,8125) = 38,81; Bedarf Stufe 2: 506 -> Lücke 467 -> wahrscheinlich
const w4 = { einkommen: [{ art: 'wfbm', b: 200 }], wohnform: 'heim', wfbm: true, gebJahr: 1975, heute: 2026.8, vermoegen: 0 };
ck('[gsa-heim] W4 Wohnheim: Regelbedarfsstufe 2 (506 €), wahrscheinlich, mindestens 470 €', L(w4, 'gsa') === 'ja' && P(w4, 'gsa', 'bedarf') === E(506) && T(w4, 'gsa', 'schaetz.mind').a === E(470));
// W5: Vermögen über 10.000 € -> nein (Barbetragsverordnung), auch bei den Eltern
ck('[gsa-verm] W5 Vermögen 12.000 € -> keine Grundsicherung', L({ ...w1, vermoegen: 12000 }, 'gsa') === 'nein');
// W6: Arbeitsförderungsgeld bleibt frei: 52 € Werkstattlohn zählen gar nicht
ck('[gsa-wfbm] W6 nur 52 € Werkstattlohn (= Arbeitsförderungsgeld): zählt nicht, Lücke = Bedarf', T({ ...w1, einkommen: [{ art: 'wfbm', b: 52 }] }, 'gsa', 'schaetz.mind').a === E(560));
// W7: Merkzeichen RF -> Rundfunk-Ermäßigung möglich, auch ohne Grundsicherung
ck('W7 Merkzeichen RF: Rundfunk möglich', L({ ...w1, vermoegen: 12000, mz: { RF: true } }, 'rundfunk') === 'vielleicht');
// W8: Lohn auf dem allgemeinen Arbeitsmarkt im Rentenalter: 30 % frei, höchstens 281,50 €
const w8 = { einkommen: [{ art: 'lohn', b: 1200 }, { art: 'rente', b: 700 }], miete: 600, gebJahr: 1955, heute: 2026.8, vermoegen: 0 };
// anrechenbar 1.200 - 281,50 + 700 = 1.618,50; Bedarf 1.163 -> nein
ck('W8 Rentner mit Lohn 1.200 € und Rente 700 €: Freibetrag höchstens 281,50 € -> keine Grundsicherung', L(w8, 'gsa') === 'nein');
// 400 € Lohn: 30 % = 120 frei -> 280 + 700 = 980 < 1.163 -> Lücke 183 -> wahrscheinlich, etwa 180 €
ck('[gsa-ewt] W8b Minijob 400 € neben Rente: 120 € frei, etwa 180 € Grundsicherung', L({ ...w8, einkommen: [{ art: 'lohn', b: 400 }, { art: 'rente', b: 700 }] }, 'gsa') === 'ja' && T({ ...w8, einkommen: [{ art: 'lohn', b: 400 }, { art: 'rente', b: 700 }] }, 'gsa', 'schaetz.eins').a === E(180));

// ---------- Fälle aus dem zweiten Nutzertest (einfache Version) ----------
// Lena: bei den Eltern ohne Miete, Werkstatt 180 €: 128 € nach Arbeitsförderungsgeld; frei 70,375 + 28,81 -> 28,81 zählen; 563 - 28,81 = 534 -> „mindestens 530 €“
const lena = { einkommen: [{ art: 'wfbm', b: 180 }], wohnform: 'eltern', miete: 0, wfbm: true, gebJahr: 2002, heute: 2026.8, vermoegen: 1500, bhPerson: 'erwVor25', bhSelbst: true, gdb: 'H', pflegegrad: '2' };
ck('Lena: Grundsicherung mindestens 530 €, Kindergeld für die Eltern 259 €', T(lena, 'gsa', 'schaetz.mind').a === E(530) && L(lena, 'kgBeh') === 'ja');
// Markus: Wohnheim, Werkstatt 320 €, G: 506 + 86,02 - (268 - 70,375 - 98,81) = 493,21 -> „mindestens 490 €“; 15 Jahre Werkstatt -> Rente erst nach 20 Jahren
const markus = { einkommen: [{ art: 'wfbm', b: 320 }], wohnform: 'heim', wfbm: true, mzG: true, gebJahr: 1985, heute: 2026.8, vermoegen: 0, bhPerson: 'erwVor25' };
ck('Markus: Wohnheim, mindestens 490 €', T(markus, 'gsa', 'schaetz.mind').a === E(490));
ck('Markus: Erwerbsminderungsrente möglich (Werkstatt, 20 Jahre Wartezeit)', L(markus, 'emrente') === 'vielleicht' && K(markus, 'emrente')[0] === 'emrente.werkstatt');
ck('[rente-wfbm] Markus mit 20 Jahren Werkstatt: Erwerbsminderungsrente wahrscheinlich', L({ ...markus, wfbmJahre: 20 }, 'emrente') === 'ja');
ck('Schon Grundsicherung und Eingliederungshilfe: „schon vorhanden“', L({ ...markus, bezug: { sozialamt: true, eingl: true } }, 'gsa') === 'na' && L({ ...markus, bezug: { sozialamt: true, eingl: true } }, 'eingl') === 'na');
// Sabine: eigene Wohnung 480 €, Werkstatt 250 € + Rente 1.100 €, G: Bedarf 1.138,71; Einkommen 63,81 + 1.100 = 1.163,81 -> knapp (möglich)
const sabine = { einkommen: [{ art: 'wfbm', b: 250 }, { art: 'rente', b: 1100 }], miete: 480, wfbm: true, wfbmEssen: true, mzG: true, gebJahr: 1968, heute: 2026.8, vermoegen: 4000 };
ck('Sabine: Grundsicherung möglich, Hinweis auf Grundrente', L(sabine, 'gsa') === 'vielleicht' && K(sabine, 'gsa').includes('gsa.grundrente'));
// Mit 33 Jahren Grundrentenzeiten (§ 82a): von 1.100 € frei min(100 + 0,3 × 1.000, 281,50) = 281,50 -> Einkommen 882,31 -> Lücke 256 -> etwa 260 €
ck('Sabine mit 33 Jahren: Grundrentenfreibetrag 281,50 €, Grundsicherung wahrscheinlich (mindestens 260 €)', L({ ...sabine, grundrente33: true }, 'gsa') === 'ja' && T({ ...sabine, grundrente33: true }, 'gsa', 'schaetz.mind').a === E(260));
ck('Kindergeld bei Behinderung: Einkommen klar zu hoch -> eher nicht', L({ ...sabine, bhPerson: 'erwVor25', bhEinkHoch: true }, 'kgBeh') === 'nein');
// Ausführliche Version: Brutto und Netto der Rente in der Liste, Werkstattlohn als zweites Einkommen
const sabineAusf = { ...sabine, einkommen: [{ art: 'rente', b: 1236, n: 1100 }, { art: 'wfbm', b: 250 }] };
ck('Ausführliche Version mit zweitem Einkommen: gleiche Einstufung wie die einfache', L(sabineAusf, 'gsa') === L(sabine, 'gsa'));

// ---------- Freibeträge und Mehrbedarfe wegen Behinderung und Pflege (nach der Prüfliste docs/PRUEFLISTE.md) ----------
// Paar mit einem erwachsenen Kind (20) im Berufsbildungswerk: Mehrbedarf 35 % von 451 € = 157,85 € (§ 21 Abs. 4 SGB II)
const bbw = { adults: 2, young: 1, art1: 'lohn', brutto: 2400, netto: 1800, miete: 800, vermoegen: 0, gebJahr: 1975, heute: 2026.8, bhPerson: 'erwVor25', gdb: '60', teilhabe: true };
ck('[gg-mb-teilhabe] Mehrbedarf 35 %: Bedarf 1.012 + 451 + 800 + 157,85 = 2.420,85 €', P(bbw, 'ggeld', 'bedarf') === E(1012 + 451 + 800 + 0.35 * 451) && K(bbw, 'ggeld').includes('mehr.teilhabe'));
ck('Werkstatt zählt nicht als Ausbildungshilfe (kein 35 % in der Grundsicherung)', P({ einkommen: [{ art: 'wfbm', b: 200 }], wfbm: true, teilhabe: true, bhPerson: 'erwNach25', miete: 400, gebJahr: 1990, heute: 2026.8, vermoegen: 0 }, 'gsa', 'bedarf') === E(563 + 400));
// Kind unter 18 mit G: Alter unbekannt -> Hinweis auf möglichen Mehrbedarf (ab 15)
ck('[gg-mb-kind] Kind mit Merkzeichen G: Hinweis auf möglichen Mehrbedarf', K({ adults: 1, kids: 1, art1: 'lohn', brutto: 1200, netto: 950, miete: 600, vermoegen: 0, bhPerson: 'minder', gdb: '80', mzG: true }, 'ggeld').includes('ggeld.mehrBeh'));
// Grundsicherung im Alter: G und 35 % nicht zusammen für dieselbe Person (§ 30 Abs. 1 Satz 2 SGB XII), der höhere zählt
const gsaT = { art1: 'rente', brutto: 500, netto: 500, miete: 400, gebJahr: 1955, heute: 2026.8, vermoegen: 0, bhPerson: 'erwNach25', mzG: true, teilhabe: true };
ck('[gsa-mb-teilhabe] G und 35 % für dieselbe Person: nur der höhere (35 % von 563 € = 197,05 €)', P(gsaT, 'gsa', 'bedarf') === E(563 + 400 + 0.35 * 563));
// Wohngeld: Freibetrag 1.800 € je schwerbehinderter Person (§ 17 Nr. 1 WoGG); zwei Personen -> 300 € im Monat
const wg2 = { adults: 2, art1: 'rente', art2: 'rente', brutto: 2300, brutto2: 1000, netto: 2050, miete: 700, mietstufe: 3, vermoegen: 0, gebJahr: 1950, heute: 2026.8, bhPerson: 'erwNach25', gdb: '100' };
ck('[wg-schwerb] Wohngeld: zweite schwerbehinderte Person verbessert die Einstufung oder den Betrag', (() => { const a = res(wg2).m.wohngeld, b = res({ ...wg2, bhWeitere: 1 }).m.wohngeld; const rang = { ja: 2, vielleicht: 1, nein: 0 }; return rang[b.level] > rang[a.level] || JSON.stringify(b.tx) !== JSON.stringify(a.tx); })());
// Pflege-Pauschbetrag (§ 33b Abs. 6 EStG): 600 / 1.100 / 1.800 €
ck('[st-pflege] Pflege-Pauschbetrag: Pflegegrad 2 600 €, 3 1.100 €, 4 1.800 €', T({ pflegegrad: '2' }, 'pflege', 'pflege.pauschbetrag').betrag === E(600) && T({ pflegegrad: '3' }, 'pflege', 'pflege.pauschbetrag').betrag === E(1100) && T({ pflegegrad: '4' }, 'pflege', 'pflege.pauschbetrag').betrag === E(1800));
ck('Pflege-Pauschbetrag bei Merkzeichen H ohne Pflegegrad: 1.800 €', T({ bhPerson: 'erwNach25', gdb: 'H' }, 'pausch', 'pflege.pauschbetrag').betrag === E(1800));

// ---------- Weitere Mehrbedarfe und Regeln (Prüfliste vollständig) ----------
// Alleinstehende Schwangere, Miete 500: Bedarf 563 + 500 + 17 % (95,71) = 1.158,71 (§ 21 Abs. 2 SGB II)
ck('[gg-schwanger] Schwangerschaft: Mehrbedarf 17 %, Hinweis Erstausstattung', P({ art1: 'ohne', brutto: 0, netto: 0, miete: 500, vermoegen: 0, gebJahr: 1995, heute: 2026.8, schwanger: true }, 'ggeld', 'bedarf') === E(563 + 500 + 0.17 * 563) && K({ art1: 'ohne', brutto: 0, netto: 0, miete: 500, vermoegen: 0, gebJahr: 1995, heute: 2026.8, schwanger: true }, 'ggeld').includes('mehr.erstausstattung'));
// Warmwasser aus dem Boiler, Paar mit Kind 8: 2 x 506 x 2,3 % + 390 x 1,2 % = 23,28 + 4,68 = 27,96 (§ 21 Abs. 7 SGB II)
ck('[gg-warmwasser] Warmwasser: Paar mit Kind 8, Mehrbedarf 27,96 €', P({ adults: 2, kids: 1, art1: 'lohn', brutto: 1500, netto: 1150, miete: 700, vermoegen: 0, gebJahr: 1990, heute: 2026.8, warmwasser: true }, 'ggeld', 'bedarf') === E(1012 + 390 + 700 + 23.276 + 4.68));
ck('[gg-ernaehrung] Ernährung: nur Hinweis, keine feste Zahl', K({ art1: 'ohne', brutto: 0, netto: 0, miete: 500, vermoegen: 0, gebJahr: 1995, heute: 2026.8, ernaehrung: true }, 'ggeld').includes('mehr.ernaehrung'));
// Altersrente für schwerbehinderte Menschen (§ 236a SGB VI): Jahrgang 1960 abschlagsfrei 64 J. 4 M., frühestens 61 J. 4 M.; ab 1964: 65 / 62
ck('[rente-sb] Schwerbehindertenrente Jahrgang 1960: 64 J. 4 M. / 61 J. 4 M.', (() => { const x = T({ gebJahr: 1960, heute: 2026.4, gdb: '50', bhPerson: 'erwNach25' }, 'srente', 'srente.alter2'); return x && x.fj === 64 && x.fm === 4 && x.gj === 61 && x.gm === 4; })());
ck('Schwerbehindertenrente Jahrgang 1970: 65 / 62', (() => { const x = T({ gebJahr: 1970, heute: 2026.8, gdb: '80', bhPerson: 'erwNach25' }, 'srente', 'srente.alter2'); return x && x.fj === 65 && x.fm === 0 && x.gj === 62; })());
ck('Schwerbehindertenrente ohne GdB 50: nein; im Rentenalter: nein', L({ gebJahr: 1970, heute: 2026.8, gdb: '40', bhPerson: 'erwNach25' }, 'srente') === 'nein' && L({ gebJahr: 1950, heute: 2026.8, gdb: '80', bhPerson: 'erwNach25' }, 'srente') === 'nein');
// Pflege: Sachleistung und Tagespflege (§§ 36, 41 SGB XI), Rentenversicherung für Pflegepersonen (§ 44 SGB XI)
ck('[pfl-sach] [pfl-rente] Pflegegrad 3: Sachleistung 1.497 €, Tagespflege 1.357 €, Rentenversicherung für Pflegende', T({ pflegegrad: '3' }, 'pflege', 'pflege.sach').sach === E(1497) && T({ pflegegrad: '3' }, 'pflege', 'pflege.sach').tages === E(1357) && K({ pflegegrad: '3' }, 'pflege').includes('pflege.rente'));
// Ausweis: Kündigungsschutz; H/Bl/aG: Wertmarke kostenlos und Kfz-Steuer-Befreiung; aG/Bl: Parkausweis
ck('[sb-kuendigung] Ausweis GdB 50: Kündigungsschutz', K({ gdb: '50', bhPerson: 'erwNach25', gebJahr: 1980, heute: 2026.8 }, 'ausweis').includes('ausweis.kuendigung'));
ck('[st-fahrt] [sb-frei] [sb-park] Ausweis aG: frei fahren, Parkausweis, 4.500 € Fahrtkosten', K({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true, gebJahr: 1980, heute: 2026.8 }, 'ausweis').includes('ausweis.frei') && K({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true, gebJahr: 1980, heute: 2026.8 }, 'ausweis').includes('ausweis.park') && T({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true }, 'pausch', 'pausch.fahrt').betrag === E(4500));
// Wohngeld: Grundrentenfreibetrag (§ 17a WoGG) verbessert Einstufung oder Betrag
const wgr = { art1: 'rente', brutto: 1400, netto: 1250, miete: 650, mietstufe: 4, vermoegen: 0, gebJahr: 1955, heute: 2026.8 };
ck('[wg-grundrente] Wohngeld: Grundrentenfreibetrag (§ 17a WoGG) wirkt', JSON.stringify(res(wgr).m.wohngeld.tx) !== JSON.stringify(res({ ...wgr, grundrente33: true }).m.wohngeld.tx));

// ---------- Elterngeld (§ 2 BEEG), Hilfe zur Pflege (§ 85 SGB XII), Asylbewerberleistungen ----------
// Basiselterngeld: 67 %; unter 1.000 € +0,1 Punkte je 2 € (bis 100 %), über 1.200 € -0,1 Punkte je 2 € (bis 65 %); 300 bis 1.800 €
const egB = (vor) => T({ baby: 'bald', egVor: vor, miete: 500, gebJahr: 1995, heute: 2026.8 }, 'elterngeld', 'eg.ja');
[[0, 300], [500, 460], [900, 648], [1100, 737], [1500, 975], [3000, 1800]].forEach(([vor, soll]) => {
  ck('[eg-satz] Elterngeld bei ' + vor + ' € netto vorher: ' + soll + ' €', egB(vor) && egB(vor).basis === E(soll) && egB(vor).plus === E(soll / 2) && egB(vor).monate === 14, egB(vor));
});
ck('Elterngeld ohne Kind: nein; ohne Betrag: möglich mit Spanne', L({ miete: 500 }, 'elterngeld') === 'nein' && L({ baby: 'da', miete: 500 }, 'elterngeld') === 'vielleicht' && K({ baby: 'da', miete: 500 }, 'elterngeld')[0] === 'eg.ohneBetrag');
ck('Elterngeld schon bezogen: na', L({ baby: 'da', einkommen: [{ art: 'eg', b: 400 }], miete: 500 }, 'elterngeld') === 'na');
// Hilfe zur Pflege: Einkommensgrenze 2 x 563 + Miete + 70 % von 563 je weiterer Person
ck('[hzp-voraus] Hilfe zur Pflege: ohne Pflegegrad nein', L({ miete: 500 }, 'hzp') === 'nein');
ck('[hzp-grenze] Hilfe zur Pflege: Paar, Miete 600, Grenze 2 x 563 + 600 + 394,10 = 2.120 €', (() => { const x = T({ adults: 2, pflegegrad: '4', art1: 'rente', brutto: 1500, netto: 1500, miete: 600, vermoegen: 0, gebJahr: 1950, heute: 2026.8 }, 'hzp', 'hzp.unter'); return x && x.grenze === E(2 * 563 + 600 + 0.7 * 563); })());
ck('Hilfe zur Pflege: Einkommen über der Grenze -> Hinweis auf Eigenanteil', K({ pflegegrad: '3', art1: 'rente', brutto: 2500, netto: 2500, miete: 500, vermoegen: 0, gebJahr: 1950, heute: 2026.8 }, 'hzp')[0] === 'hzp.ueber');
ck('[hzp-verm] Hilfe zur Pflege: Vermögen über 10.000 € -> nein', L({ pflegegrad: '3', art1: 'rente', brutto: 900, netto: 900, miete: 500, vermoegen: 15000, gebJahr: 1950, heute: 2026.8 }, 'hzp') === 'nein');
// Asylbewerber: eigene Leistung, kein Grundsicherungsgeld, keine Grundsicherung im Alter, kein Wohngeld, kein Kinderzuschlag (§ 7 Abs. 1 SGB II, § 23 Abs. 2 SGB XII, § 20 WoGG)
const asyl = { adults: 2, kids: 2, art1: 'ohne', brutto: 0, netto: 0, miete: 700, vermoegen: 0, gebJahr: 1990, heute: 2026.8, aufenthalt: 'asyl' };
ck('[asyl-ja] Asyl: Asylbewerberleistungen ja', L(asyl, 'asylblg') === 'ja');
ck('[asyl-ausschluss] Asyl: Grundsicherungsgeld, Wohngeld, Kinderzuschlag nein', L(asyl, 'ggeld') === 'nein' && K(asyl, 'ggeld')[0] === 'ggeld.asyl' && L(asyl, 'wohngeld') === 'nein' && L(asyl, 'kiz') === 'nein');
ck('Asyl im Rentenalter: keine Grundsicherung im Alter', L({ ...asyl, adults: 1, kids: 0, gebJahr: 1950 }, 'gsa') === 'nein');
ck('[kg-asyl] [eg-asyl] Asyl: Kindergeld und Elterngeld nur möglich (abhängig vom Aufenthaltstitel)', L(asyl, 'kindergeld') === 'vielleicht' && L({ ...asyl, baby: 'da', egVor: 0 }, 'elterngeld') === 'vielleicht');
ck('Ohne Asyl: Asylbewerberleistungen nein', L({ ...asyl, aufenthalt: '' }, 'asylblg') === 'nein');

// ---------- Blindenhilfe (§ 72 SGB XII) ----------
const blind = { art1: 'rente', brutto: 900, netto: 900, miete: 450, vermoegen: 0, gebJahr: 1960, heute: 2026.8, bhPerson: 'erwNach25', gdb: '100', blind: 'blind' };
ck('Blindenhilfe: blind, wenig Einkommen -> möglich, unter der Grenze 2 x 563 + 450 = 1.576 €', L(blind, 'blh') === 'vielleicht' && T(blind, 'blh', 'blh.unter') && T(blind, 'blh', 'blh.unter').grenze === E(2 * 563 + 450) && K(blind, 'blh').includes('blh.bayern'));
ck('[blh-grenze] Blindenhilfe: über der Grenze höchstens 40 % angerechnet', T({ ...blind, brutto: 2500, netto: 2500 }, 'blh', 'blh.ueber').prozent === 40);
ck('[blh-voraus] Blindenhilfe: hochgradig sehbehindert -> nein; nicht blind -> nein', L({ ...blind, blind: 'hoch' }, 'blh') === 'nein' && K({ ...blind, blind: 'hoch' }, 'blh')[0] === 'blh.hoch' && L({ ...blind, blind: '' }, 'blh') === 'nein');
ck('[blh-verm] Blindenhilfe: Vermögen 15.000 € -> nein', L({ ...blind, vermoegen: 15000 }, 'blh') === 'nein');
ck('[blh-hinweise] Blindenhilfe: Kind halbiert, Pflegegrad angerechnet', K({ ...blind, bhPerson: 'minder', adults: 2, kids: 1 }, 'blh').includes('blh.kind') && K({ ...blind, pflegegrad: '3' }, 'blh').includes('blh.pflege'));
ck('[blh-land] Blindenhilfe außerhalb Bayerns: Landesblindengeld des Landes', K({ ...blind, bundesland: 'NW' }, 'blh').includes('blh.landAnders'));
ck('[blh-betrag] Blindenhilfe 951,92 € (Kinder 476,78 €); Unterschied zum Landesblindengeld: Bayern 142,92 €, Hessen 133,27 €, Schleswig-Holstein 601,92 €; ohne belegten Landesbetrag kein Unterschied',
  T(blind, 'blh', 'blh.betrag').betrag === '951,92 €' && T(blind, 'blh', 'blh.betrag').kind === '476,78 €' && T(blind, 'blh', 'blh.differenz').rest === '142,92 €' &&
  T({ ...blind, bundesland: 'HE' }, 'blh', 'blh.differenz').rest === '133,27 €' && T({ ...blind, bundesland: 'SH' }, 'blh', 'blh.differenz').rest === '601,92 €' && !T({ ...blind, bundesland: 'NW' }, 'blh', 'blh.differenz'));
ck('[blh-asyl] Blindenhilfe bei Asyl: nur möglich mit Hinweis', K({ ...blind, aufenthalt: 'asyl' }, 'blh')[0] === 'blh.asyl');

// ---------- Prüfliste (docs/PRUEFLISTE.md): je Regel ein Test, Marke in eckigen Klammern. Erwartungen von Hand aus dem Gesetz ----------
const A = (o, id) => { const x = res(o).m[id].tx.find((a) => /^schaetz\./.test(a[0])); return x ? x[1].a : null; };
const ohne = (o) => ({ art1: 'ohne', brutto: 0, netto: 0, vermoegen: 0, ...o });
// SGB II
ck('[gg-regel] Regelbedarfe: allein 563, Paar mit 3 Kindern 2 x 506 + 3 x 390 = 2.182, junger Erwachsener 451', R.evaluate({ ...base }).h.regel === 563 && R.evaluate({ ...base, adults: 2, kids: 3 }).h.regel === 2182 && R.evaluate({ ...base, young: 1 }).h.regel === 563 + 451);
ck('[gg-ewt] Freibetrag 1.000 € = 100 + 84 + 144 = 328; 1.200 € = 348; 1.500 € mit Kind = 378; 50 € = 50', Math.abs(R.sgb2Freibetrag(1000, false) - 328) < 0.01 && Math.abs(R.sgb2Freibetrag(1200, false) - 348) < 0.01 && Math.abs(R.sgb2Freibetrag(1500, true) - 378) < 0.01 && Math.abs(R.sgb2Freibetrag(1500, false) - 348) < 0.01 && R.sgb2Freibetrag(50, false) === 50);
// allein, Miete 500: Bedarf 1.063. Lohn 1.000: 1.063 - 672 = 391; Rente oder Arbeitslosengeld 1.000: nur 30 € Pauschale, 1.063 - 970 = 93
ck('[gg-ewt-art] Lohn 1.000 € etwa 390 €; Rente und Arbeitslosengeld 1.000 € nur etwa 90 € (kein Freibetrag für Arbeit)', A({ art1: 'lohn', brutto: 1000, netto: 1000, miete: 500 }, 'ggeld') === E(390) && A({ art1: 'rente', brutto: 1000, netto: 1000, miete: 500 }, 'ggeld') === E(90) && A({ art1: 'alg', brutto: 1000, netto: 1000, miete: 500 }, 'ggeld') === E(90));
const azubi = { young: 1, art1: 'lohn', brutto: 1800, netto: 1400, miete: 600, vermoegen: 0 };
ck('[gg-azubi] Ausbildungsvergütung des Kindes bis 603 € frei (550 € ändert nichts), 850 € mindert', A(azubi, 'ggeld') === A({ ...azubi, kindEink: 550 }, 'ggeld') && Number(String(A({ ...azubi, kindEink: 850 }, 'ggeld')).replace(/\D/g, '')) < Number(String(A(azubi, 'ggeld')).replace(/\D/g, '')));
// Elterngeld 300 € (Mindestbetrag, kein Einkommen vorher): zählt voll, 1.063 - 270 = 793; 500 € mit Einkommen vorher: 300 frei, 1.063 - 170 = 893
ck('[gg-eg300] Elterngeld 300 € zählt voll (etwa 790 €), 500 € nur mit 200 € (etwa 890 €)', A({ einkommen: [{ art: 'eg', b: 300 }], miete: 500 }, 'ggeld') === E(790) && A({ einkommen: [{ art: 'eg', b: 500 }], miete: 500 }, 'ggeld') === E(890));
// Alleinerziehend, 1 Kind, Miete 700: Unterhalt 2.000 € zählt nur bis zum Bedarf des Kindes (390 + 350 - 259 Kindergeld = 481)
ck('[gg-unterhalt] Hoher Unterhalt fürs Kind mindert nur bis zu dessen Bedarf: 1.460 - 481 = etwa 980 €', A(ohne({ kids: 1, miete: 700 }), 'ggeld') === E(1460) && A(ohne({ kids: 1, miete: 700, unterhalt: 2000 }), 'ggeld') === E(980));
ck('[gg-verm] Schonvermögen: bis 30 Jahre 5.000 €, ab 50 Jahre 20.000 €, Paar doppelt', L(ohne({ miete: 400, vermoegen: 6000, alterGruppe: '<30' }), 'ggeld') === 'nein' && L(ohne({ miete: 400, vermoegen: 15000, alterGruppe: '50+' }), 'ggeld') !== 'nein' && L(ohne({ adults: 2, miete: 500, vermoegen: 19000, alterGruppe: '30-39' }), 'ggeld') !== 'nein');
ck('[gg-gemischt] Paar mit Kind, eine Person im Rentenalter: Jobcenter möglich (gemischte Bedarfsgemeinschaft)', L({ adults: 2, kids: 1, alter: true, miete: 700 }, 'ggeld') === 'vielleicht' && K({ adults: 2, kids: 1, alter: true, miete: 700 }, 'ggeld')[0] === 'ggeld.gemischt');
ck('[gg-schulbuch] Schulbücher: Hinweis außerhalb Bayerns, nicht in Bayern (Lernmittelfreiheit)', K({ kids: 1, miete: 600, art1: 'lohn', brutto: 1500, netto: 1150, bundesland: 'NW' }, 'ggeld').includes('ggeld.schulbuch') && !K({ kids: 1, miete: 600, art1: 'lohn', brutto: 1500, netto: 1150, bundesland: 'BY' }, 'ggeld').includes('ggeld.schulbuch'));
ck('[gg-kdu] Miete: Hinweis auf die örtliche Angemessenheit', K({ art1: 'lohn', brutto: 1000, netto: 1000, miete: 500 }, 'ggeld').includes('kdu.angemessen'));
ck('[gg-alter] Rentenalter oder volle Erwerbsminderung: Sozialamt zuständig', res({ alter: true, miete: 400 }).m.ggeld.hl === 'andereStelle' && res({ erwerbsgemindert: true, miete: 400 }).m.ggeld.hl === 'andereStelle');
// SGB XII
ck('[gsa-voraus] Ohne Rentenalter und ohne volle Erwerbsminderung: keine Grundsicherung im Alter', L({ miete: 450 }, 'gsa') === 'nein' && K({ miete: 450 }, 'gsa')[0] === 'gsa.voraus');
// Rente 900, Miete 450: ohne Freibetrag 1.013 - 900 = 113; mit § 82a: 100 + 30 % von 800 = 340, höchstens 281,50 -> 394,50
ck('[gsa-grundrente] Grundrentenfreibetrag höchstens 281,50 €: etwa 110 € -> etwa 390 €', A({ alter: true, art1: 'rente', brutto: 900, netto: 900, miete: 450 }, 'gsa') === E(110) && A({ alter: true, art1: 'rente', brutto: 900, netto: 900, miete: 450, grundrente33: true }, 'gsa') === E(390));
ck('[gsa-mb-ae] Voll erwerbsgemindert, alleinerziehend: Mehrbedarf mindestens 12 % (563 + 390 + 600 + 67,56)', P({ erwerbsgemindert: true, kids: 1, miete: 600 }, 'gsa', 'bedarf') === E(563 + 390 + 600 + 0.12 * 563));
ck('[gsa-pflegegeld] Pflegegeld ist kein Einkommen: Pflegegrad ändert die Grundsicherung nicht', A({ alter: true, art1: 'rente', brutto: 700, netto: 700, miete: 450 }, 'gsa') === A({ alter: true, art1: 'rente', brutto: 700, netto: 700, miete: 450, pflegegrad: '3' }, 'gsa'));
ck('[gsa-schwanger] Schwangerschaft: 563 + 450 + 95,71', P({ erwerbsgemindert: true, miete: 450, schwanger: true }, 'gsa', 'bedarf') === E(563 + 450 + 0.17 * 563));
ck('[gsa-warmwasser] Warmwasser: 563 x 2,3 % = 12,95', P({ alter: true, miete: 450, warmwasser: true }, 'gsa', 'bedarf') === E(563 + 450 + 0.023 * 563));
ck('[gsa-ernaehrung] Krankenkost: Hinweis und nur „mindestens“', K({ alter: true, miete: 450, ernaehrung: true }, 'gsa').includes('mehr.ernaehrung') && !!T({ alter: true, miete: 450, ernaehrung: true }, 'gsa', 'schaetz.mind'));
// Wohngeld
const wgT = (o) => JSON.stringify(res({ miete: 650, mietstufe: 3, vermoegen: 0, ...o }).m.wohngeld.tx);
const lohn = [{ art: 'lohn', b: 1400, n: 1100 }];
ck('[wg-eg300] Elterngeld bis 300 € ist kein Einkommen: 250 € und 300 € ändern nichts, 500 € schon', wgT({ einkommen: lohn.concat([{ art: 'eg', b: 300 }]) }) === wgT({ einkommen: lohn }) && wgT({ einkommen: lohn.concat([{ art: 'eg', b: 250 }]) }) === wgT({ einkommen: lohn }) && wgT({ einkommen: lohn.concat([{ art: 'eg', b: 500 }]) }) !== wgT({ einkommen: lohn }));
ck('[wg-keinEink] Pflegegeld ist kein Einkommen: Pflegegrad ändert das Wohngeld nicht', wgT({ art1: 'lohn', brutto: 1700, netto: 1300 }) === wgT({ art1: 'lohn', brutto: 1700, netto: 1300, pflegegrad: '3' }));
const wgKE = { adults: 2, young: 1, art1: 'lohn', brutto: 2700, netto: 2000 };
ck('[wg-kindeink] Einkommen des Kindes: 100 € im Monat frei, 500 € mindern', wgT(wgKE) === wgT({ ...wgKE, kindEink: 100 }) && wgT(wgKE) !== wgT({ ...wgKE, kindEink: 500 }));
ck('[wg-verm] Vermögen: 60.000 € allein erlaubt, 60.001 € nicht; Paar 90.000 €', L({ art1: 'lohn', brutto: 1500, netto: 1150, miete: 650, mietstufe: 3, vermoegen: 60000 }, 'wohngeld') !== 'nein' && L({ art1: 'lohn', brutto: 1500, netto: 1150, miete: 650, mietstufe: 3, vermoegen: 60001 }, 'wohngeld') === 'nein' && L({ adults: 2, art1: 'lohn', brutto: 1500, netto: 1150, miete: 650, mietstufe: 3, vermoegen: 90001 }, 'wohngeld') === 'nein');
ck('[wg-ausschluss] Bei Grundsicherungsgeld oder Grundsicherung kein Wohngeld', K({ brutto: 1500, netto: 1150, miete: 650, bezug: { grundsicherungsgeld: true } }, 'wohngeld')[0] === 'wohngeld.ausschluss' && K({ brutto: 1500, netto: 1150, miete: 650, bezug: { sozialamt: true } }, 'wohngeld')[0] === 'wohngeld.ausschluss');
// Kinderzuschlag
const kizT = { adults: 2, kids: 2, art1: 'lohn', brutto: 3000, netto: 2300, miete: 900, mietstufe: 3, vermoegen: 0 };
const zahl = (x) => Number(String(x).replace(/\D/g, ''));
ck('[kiz-mehr] Mehrbedarfe der Eltern (Schwangerschaft, Warmwasser) erhöhen den Kinderzuschlag', zahl(A({ ...kizT, schwanger: true }, 'kiz')) > zahl(A(kizT, 'kiz')) && zahl(A({ ...kizT, warmwasser: true }, 'kiz')) > zahl(A(kizT, 'kiz')));
// Kindergeld, Bildung und Teilhabe, Unterhaltsvorschuss, BAföG
ck('[kg-mehr] Kindergeld: Hinweis auf Arbeitslosigkeit bis 21, Freiwilligendienst, Übergangszeit, 20-Stunden-Grenze', K({ kids: 1 }, 'kindergeld').includes('kindergeld.mehr') && K({}, 'kindergeld').includes('kindergeld.mehr'));
ck('[kgbeh-25] Kindergeld für Kinder mit Behinderung: nur wenn die Behinderung vor 25 eingetreten ist', L({ bhPerson: 'erwNach25' }, 'kgBeh') === 'nein' && K({ bhPerson: 'erwNach25' }, 'kgBeh')[0] === 'kgBeh.nach25');
ck('[but-bezug] Bildung und Teilhabe mit Wohngeld, Kinderzuschlag, Grundsicherung', ['wohngeld', 'kiz', 'grundsicherungsgeld', 'sozialamt'].every((b) => L({ kids: 1, bezug: { [b]: true } }, 'but') === 'ja'));
ck('[but-inhalt] Schulbedarf 195 € und Teilhabe 15 €; Kinder unter 6 nur Teilhabe', T({ kids: 1, bezug: { wohngeld: true } }, 'but', 'but.inhalt').schul === E(195) && T({ kids: 1, bezug: { wohngeld: true } }, 'but', 'but.inhalt').teil === E(15) && !!T({ kids: 1, kidsU6: 1, bezug: { wohngeld: true } }, 'but', 'but.inhaltKlein'));
ck('[but-azubi] Junger Erwachsener in betrieblicher Ausbildung: keine Bildung und Teilhabe', L({ young: 1, ausbildung: 'kindBetrieb', bezug: { wohngeld: true } }, 'but') === 'nein');
ck('[uvg-anrechnung] Unterhalt 100 € wird angerechnet (nur möglich), 400 € reicht (nein)', L({ kids: 1, brutto: 1500, unterhaltFehlt: true, unterhalt: 100 }, 'uvg') === 'vielleicht' && L({ kids: 1, brutto: 1500, unterhaltFehlt: true, unterhalt: 400 }, 'uvg') === 'nein');
ck('[uvg-ab12] Kind ab 12: mit 400 € brutto nur möglich, mit 700 € wahrscheinlich (Grenze 600 €)', L({ kids: 1, brutto: 400, unterhaltFehlt: true, kinder12: true }, 'uvg') === 'vielleicht' && L({ kids: 1, brutto: 700, unterhaltFehlt: true, kinder12: true }, 'uvg') === 'ja');
ck('[uvg-paar] Zwei Erwachsene im Haushalt: nur möglich (Heirat schließt aus)', L({ adults: 2, kids: 1, unterhaltFehlt: true }, 'uvg') === 'vielleicht' && K({ adults: 2, kids: 1, unterhaltFehlt: true }, 'uvg')[0] === 'uvg.zwei');
ck('[bafoeg-verm] BAföG-Vermögen: unter 30 Jahren bis 15.000 €', L({ ausbildung: 'ich', alterGruppe: '<30', vermoegen: 16000 }, 'bafoeg') === 'nein' && L({ ausbildung: 'ich', alterGruppe: '<30', vermoegen: 14000 }, 'bafoeg') === 'vielleicht');
ck('[bafoeg-alter] BAföG-Altersgrenze 45: ab 50 nein, 41 bis 50 nur möglich', L({ ausbildung: 'ich', alterGruppe: '50+' }, 'bafoeg') === 'nein' && L({ ausbildung: 'ich', alterGruppe: '40-49' }, 'bafoeg') === 'vielleicht');
ck('[bafoeg-betrieb] Betriebliche Ausbildung: kein BAföG', L({ young: 1, ausbildung: 'kindBetrieb' }, 'bafoeg') === 'nein');
// Pflege
ck('[pfl-geld] Pflegegeld Pflegegrad 2: 347 €, Entlastungsbetrag 131 €; Pflegegrad 1 nur Entlastungsbetrag', P({ pflegegrad: '2' }, 'pflege', 'geld') === E(347) && P({ pflegegrad: '2' }, 'pflege', 'ent') === E(131) && K({ pflegegrad: '1' }, 'pflege')[0] === 'pflege.pg1');
ck('[pfl-plus] Pflegehilfsmittel 42 €, Wohnumfeld 4.180 €, Entlastungsbudget 3.539 €', P({ pflegegrad: '2' }, 'pflegeplus', 'verbrauch') === E(42) && P({ pflegegrad: '2' }, 'pflegeplus', 'wohn') === E(4180) && T({ pflegegrad: '2' }, 'pflegeplus', 'pflegeplus.budget').betrag === E(3539));
ck('[pfl-zeit] Hinweis Pflegezeit und Familienpflegezeit', K({ pflegegrad: '2' }, 'pflege').includes('pflege.zeit') && K({ pflegegrad: '1' }, 'pflege').includes('pflege.zeit'));
ck('[hzp-heim] Hilfe zur Pflege: Hinweis Heim und Unterhalt erst ab 100.000 €', K({ pflegegrad: '3', miete: 500 }, 'hzp').includes('hzp.heim'));
ck('[st-35a] Hinweis Steuerermäßigung § 35a', K({ pflegegrad: '2' }, 'pflege').includes('pflege.steuer35a'));
// Schwerbehinderung, Renten, Blindengeld
ck('[sb-ausweis] Ausweis ab GdB 50 mit 5 Tagen Zusatzurlaub, Gleichstellung bei 30', T({ gdb: '50', bhPerson: 'erwNach25' }, 'ausweis', 'ausweis.schwer').tage === 5 && L({ gdb: '30', bhPerson: 'erwNach25' }, 'ausweis') === 'vielleicht' && K({ gdb: '30', bhPerson: 'erwNach25' }, 'ausweis')[0] === 'ausweis.gleich');
ck('[sb-eingl] Eingliederungshilfe: Kind und Erwachsene möglich', K({ gdb: '50', bhPerson: 'minder' }, 'eingl')[0] === 'eingl.kind' && K({ gdb: '50', bhPerson: 'erwNach25' }, 'eingl')[0] === 'eingl.erw');
ck('[sb-budget] Budget für Arbeit bei Werkstatt: bis 75 %', P({ wfbm: true }, 'arbeit', 'prozent') === 75);
ck('[rente-em] Erwerbsminderungsrente: unter 3 Stunden voll, 3 bis 6 teilweise; ohne 5 Jahre nur möglich', K({ emStd: 'unter3', em5: true }, 'emrente')[0] === 'emrente.voll' && K({ emStd: '3bis6', em5: true }, 'emrente')[0] === 'emrente.teil' && L({ emStd: 'unter3' }, 'emrente') === 'vielleicht');
ck('[bg-betrag] Blindengeld Bayern 809 €, Sehbehindertengeld 242,70 €', P({ blind: 'blind', bhPerson: 'erwNach25' }, 'blindengeld', 'betrag') === '809 €' && P({ blind: 'hoch', bhPerson: 'erwNach25' }, 'blindengeld', 'betrag') === '242,70 €');
// Pflegegrad 2: 46 % von 347 € = 159,62 €; 809 - 159,62 = 649,38 €
ck('[bg-pflege] Pflegegeld wird angerechnet: Pflegegrad 2 46 % = 159,62 €, Rest 649,38 €', T({ blind: 'blind', bhPerson: 'erwNach25', pflegegrad: '2' }, 'blindengeld', 'blindengeld.pflege').kuerz === '159,62 €' && T({ blind: 'blind', bhPerson: 'erwNach25', pflegegrad: '2' }, 'blindengeld', 'blindengeld.pflege').rest === '649,38 €');
ck('[bg-land] Landesblindengeld in anderen Ländern: blind wahrscheinlich mit Spanne 350 bis 950 €, Sehbehinderung nur möglich, Pflegegeld-Hinweis', L({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'NW' }, 'blindengeld') === 'ja' && T({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'NW' }, 'blindengeld', 'blindengeld.landJa').von === E(350) && T({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'TH' }, 'blindengeld', 'blindengeld.landJa').bis === E(950) && L({ blind: 'hoch', bhPerson: 'erwNach25', bundesland: 'HE' }, 'blindengeld') === 'vielleicht' && K({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'BE', pflegegrad: '3' }, 'blindengeld').includes('blindengeld.pflegeLand'));
// Belegte Landesbeträge (Stand 11/2026): BW 410, HE 86 % von 951,92 = 818,65, MV 430, NI 450, RP 410, SH 350; übrige Länder Spanne
{
  const LB = (bl) => { const t = T({ blind: 'blind', bhPerson: 'erwNach25', bundesland: bl }, 'blindengeld', 'blindengeld.landBetrag'); return t ? t.betrag : null; };
  ck('[bg-land-betrag] Landesblindengeld mit belegtem Betrag: BW 410 €, HE 818,65 €, MV 430 €, NI 450 €, RP 410 €, SH 350 €',
    LB('BW') === '410 €' && LB('HE') === '818,65 €' && LB('MV') === '430 €' && LB('NI') === '450 €' && LB('RP') === '410 €' && LB('SH') === '350 €', ['BW', 'HE', 'MV', 'NI', 'RP', 'SH'].map(LB).join(' '));
  ck('[bg-land-betrag] Länder ohne belegten Betrag weiter mit Spanne (NW, BE, SN, TH)', ['NW', 'BE', 'SN', 'TH'].every((bl) => LB(bl) === null && T({ blind: 'blind', bhPerson: 'erwNach25', bundesland: bl }, 'blindengeld', 'blindengeld.landJa')));
}
ck('[bg-land] In Bayern weiter der genaue Betrag (809 €), auch wenn das Land offen ist', P({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'BY' }, 'blindengeld', 'betrag') === '809 €' && P({ blind: 'blind', bhPerson: 'erwNach25' }, 'blindengeld', 'betrag') === '809 €');
ck('[zust-land] Zuständige Stellen außerhalb Bayerns: Landschaftsverband (NRW), LWV (Hessen), LAGeSo (Berlin), allgemein sonst; in Bayern keine Ersatzangabe', R.zustLand('blindengeld', 'NW').includes('Landschaftsverband') && R.zustLand('eingl', 'HE').includes('Landeswohlfahrtsverband') && R.zustLand('ausweis', 'BE').includes('LAGeSo') && R.zustLand('ausweis', 'TH') === R.ZUST_LAND.ausweis._ && R.zustLand('ausweis', 'BY') === null && R.zustLand('ausweis', '') === null && R.zustLand('kindergeld', 'NW') === null);
ck('[zust-land] Jede Ersatzangabe hat einen allgemeinen Eintrag, nur gültige Länderkürzel', Object.keys(R.ZUST_LAND).every((id) => typeof R.ZUST_LAND[id]._ === 'string' && Object.keys(R.ZUST_LAND[id]).every((k) => k === '_' || /^(BW|BE|BB|HB|HH|HE|MV|NI|NW|RP|SL|SN|ST|SH|TH)$/.test(k))));
// Arbeitslosengeld I
const algT = { arbeitSit: 'arbeitslos', algZeit: true, algMonate: 24, gebJahr: 1980, heute: 2026.8, lohnVorher: 3000 };
ck('[alg-anwart] Ohne 12 Monate Versicherung nur möglich; Minijob zählt nicht', L({ ...algT, algZeit: false }, 'alg1') === 'vielleicht' && K({ ...algT, lohnVorher: 500 }, 'alg1')[0] === 'alg1.minijob');
ck('[alg-satz] 60 %, mit Kind 67 %; über der Beitragsbemessungsgrenze gedeckelt (8.450 x 60 % x 60 % = 3.042)', T(algT, 'alg1', 'alg1.ja').p === 60 && T({ ...algT, kids: 1 }, 'alg1', 'alg1.ja').p === 67 && T({ ...algT, lohnVorher: 12000 }, 'alg1', 'schaetz.spanne').a === E(3040));
ck('[alg-sperr] Hinweis Sperrzeit 12 Wochen', T(algT, 'alg1', 'alg1.sperrzeit').wochen === 12);
ck('[alg-neben] Hinweis Nebeneinkommen 165 € frei', T(algT, 'alg1', 'alg1.neben').frei === E(165));
ck('[alg-nahtlos] Krankengeld läuft aus: Nahtlosigkeit', K({ arbeitSit: 'krank', krankWochen: 'ende' }, 'alg1')[0] === 'alg1.nahtlos');
ck('[alg-alter] Im Rentenalter kein Arbeitslosengeld', L({ ...algT, gebJahr: 1955 }, 'alg1') === 'nein');
// Krankenversicherung
// 3.000 € brutto: 70 % = 2.100, 90 % netto (60-72 %) = 1.620-1.944, kleinerer Wert, minus 12,5 % Beiträge -> 1.417,50 bis 1.700,95
const kvT = { arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 3000 };
ck('[kv-kg] Krankengeld bei 3.000 € brutto: etwa 1.420 bis 1.700 €', T(kvT, 'krankengeld', 'schaetz.spanne').a === E(1420) && T(kvT, 'krankengeld', 'schaetz.spanne').b === E(1700));
ck('[kv-78] Erste 6 Wochen Lohnfortzahlung, Krankengeld bis 78 Wochen', K({ ...kvT, krankWochen: 'unter6' }, 'krankengeld')[0] === 'krank.lfz' && K(kvT, 'krankengeld').includes('krank.78'));
ck('[kv-minijob] Minijob: kein Krankengeld', L({ ...kvT, lohnVorher: 500 }, 'krankengeld') === 'nein');
ck('[kv-zuzahl] Chronisch krank ab GdB 60 oder Pflegegrad 3: 1 %-Grenze; GdB 50 ohne', K({ gdb: '60', bhPerson: 'erwNach25' }, 'zuzahl').includes('zuzahl.chron') && K({ pflegegrad: '3' }, 'zuzahl').includes('zuzahl.chron') && !K({ gdb: '50', bhPerson: 'erwNach25' }, 'zuzahl').includes('zuzahl.chron'));
ck('[kv-fahrt] Fahrtkosten-Hinweis bei H oder Pflegegrad 3, nicht bei GdB 60 allein', K({ gdb: 'H', bhPerson: 'erwNach25' }, 'zuzahl').includes('zuzahl.fahrt') && K({ pflegegrad: '3' }, 'zuzahl').includes('zuzahl.fahrt') && !K({ gdb: '60', bhPerson: 'erwNach25' }, 'zuzahl').includes('zuzahl.fahrt'));
// Rundfunkbeitrag
ck('[rf-bezug] Rundfunkbeitrag: Befreiung bei Grundsicherungsgeld', L({ bezug: { grundsicherungsgeld: true } }, 'rundfunk') === 'ja');
ck('[rf-asyl] Rundfunkbeitrag: Befreiung bei Asylbewerberleistungen möglich', K({ aufenthalt: 'asyl' }, 'rundfunk')[0] === 'rundfunk.asyl' && L({ aufenthalt: 'asyl' }, 'rundfunk') === 'vielleicht');
ck('[rf-mehr] Rundfunkbeitrag: Hinweis auf weitere Befreiungen immer dabei', K({}, 'rundfunk').includes('rundfunk.mehr') && K({ bezug: { grundsicherungsgeld: true } }, 'rundfunk').includes('rundfunk.mehr'));
ck('[rf-rf] Merkzeichen RF: Ermäßigung möglich', K({ mz: { RF: true }, gdb: '80', bhPerson: 'erwNach25', brutto: 3000, netto: 2200, art1: 'lohn', miete: 500 }, 'rundfunk')[0] === 'rundfunk.rf');
// Wohnberechtigungsschein
ck('[wbs-schwerb] WBS: Freibetrag Schwerbehinderte verbessert die Einstufung (2.200 € brutto: Gebietsgrenze -> Grenzbereich)', L({ art1: 'lohn', brutto: 2200, netto: 1600 }, 'wbs') === 'vielleicht' && K({ art1: 'lohn', brutto: 2200, netto: 1600 }, 'wbs')[0] === 'wbs.gebiet' && K({ art1: 'lohn', brutto: 2200, netto: 1600, gdb: '100', bhPerson: 'erwNach25' }, 'wbs')[0] === 'wbs.rand');
// Bundeswerte § 9 Abs. 2 WoFG: 12.000 € (1 Person), 18.000 € (2), + 4.100 € je weitere Person, + 500 € je Kind
ck('[wbs-land] WBS in anderen Ländern: unter der Bundesgrenze wahrscheinlich (allein 900 € x 12 = 10.800 < 12.000), darüber nur möglich', L({ art1: 'lohn', brutto: 900, netto: 750, bundesland: 'ST' }, 'wbs') === 'ja' && T({ art1: 'lohn', brutto: 900, netto: 750, bundesland: 'ST' }, 'wbs', 'wbs.landJa').grenze === E(12000) && L({ art1: 'lohn', brutto: 1100, netto: 880, bundesland: 'ST' }, 'wbs') === 'vielleicht' && K({ art1: 'lohn', brutto: 1100, netto: 880, bundesland: 'ST' }, 'wbs')[0] === 'wbs.landEigen');
ck('[wbs-land-grenze] WBS mit Landesgrenze: NRW allein 23.540 € (1.900 € x 12 darunter -> wahrscheinlich, 2.500 € -> möglich, 4.500 € -> nein), Hessen 18.166 €, Berlin Paar mit Kind 31.640 €, Bremen allein 13.200 €',
  T({ art1: 'lohn', brutto: 1900, netto: 1400, bundesland: 'NW' }, 'wbs', 'wbs.landGrenze').grenze === '23.540 €' && L({ art1: 'lohn', brutto: 1900, netto: 1400, bundesland: 'NW' }, 'wbs') === 'ja' &&
  L({ art1: 'lohn', brutto: 2500, netto: 1800, bundesland: 'NW' }, 'wbs') === 'vielleicht' && L({ art1: 'lohn', brutto: 4500, netto: 2800, bundesland: 'NW' }, 'wbs') === 'nein' &&
  T({ art1: 'lohn', brutto: 1000, netto: 800, bundesland: 'HE' }, 'wbs', 'wbs.landGrenze').grenze === '18.166 €' && L({ art1: 'lohn', brutto: 6000, netto: 3500, bundesland: 'HE' }, 'wbs') === 'vielleicht' &&
  T({ adults: 2, kids: 1, art1: 'lohn', brutto: 2200, netto: 1700, bundesland: 'BE' }, 'wbs', 'wbs.landGrenze').grenze === '31.640 €' &&
  T({ art1: 'lohn', brutto: 1000, netto: 800, bundesland: 'HB' }, 'wbs', 'wbs.landGrenze').grenze === '13.200 €');
ck('[wbs-land-grenze] Kein falsches „nein“ knapp über der älteren Landesgrenze (NRW, 3.950 € brutto: 5 % Reserve)', L({ art1: 'lohn', brutto: 3950, netto: 2600, bundesland: 'NW' }, 'wbs') === 'vielleicht');
ck('[wbs-land] Bundesgrenze Paar mit 2 Kindern: 18.000 + 2 x 4.100 + 2 x 500 = 27.200 €', T({ adults: 2, kids: 2, art1: 'lohn', brutto: 2000, netto: 1500, bundesland: 'SN' }, 'wbs', 'wbs.landJa').grenze === E(27200));
// Elterngeld
ck('[eg-hinweise] Elterngeld: Hinweise Mutterschaftsgeld und Einkommensgrenze 175.000 €', K({ baby: 'da', egVor: 1500 }, 'elterngeld').includes('eg.mutterschaft') && T({ baby: 'da', egVor: 1500 }, 'elterngeld', 'eg.grenze').grenze === E(175000));

// Altersgrenzen nach vollendeten Lebensjahren (heute = Ende 2026; Geburtsjahr 1996 -> 30 Jahre, 1997 -> 29)
const gv = (jahr, verm) => L(ohne({ miete: 400, vermoegen: verm, gebJahr: jahr, heute: 2026.8 }), 'ggeld');
ck('[gg-verm] Schonvermögen ab dem 30. Geburtstag 10.000 € (29: 5.000 €), ab dem 40. 12.500 €, ab dem 50. 20.000 €', gv(1997, 8000) === 'nein' && gv(1996, 8000) !== 'nein' && gv(1987, 12000) === 'nein' && gv(1986, 12000) !== 'nein' && gv(1977, 18000) === 'nein' && gv(1976, 18000) !== 'nein');
ck('[bafoeg-verm] BAföG-Vermögen: ab dem 30. Geburtstag 45.000 € (29 Jahre: 15.000 €)', L({ ausbildung: 'ich', vermoegen: 30000, gebJahr: 1997, heute: 2026.8 }, 'bafoeg') === 'nein' && L({ ausbildung: 'ich', vermoegen: 30000, gebJahr: 1996, heute: 2026.8 }, 'bafoeg') === 'vielleicht');
ck('[gg-studium] Studium mit 44: kein Grundsicherungsgeld (BAföG-Alter); mit 46 Ausschluss offen', K(ohne({ ausbildung: 'ich', miete: 400, gebJahr: 1982, heute: 2026.8 }), 'ggeld')[0] === 'ggeld.ausbildung' && K(ohne({ ausbildung: 'ich', miete: 400, gebJahr: 1980, heute: 2026.8 }), 'ggeld')[0] !== 'ggeld.ausbildung');
ck('[bafoeg-alter] BAföG mit 44 normal geprüft, mit 46 nur möglich (Altersgrenze 45), mit 50 nein', K({ ausbildung: 'ich', gebJahr: 1982, heute: 2026.8 }, 'bafoeg')[0] === 'bafoeg.ich' && K({ ausbildung: 'ich', gebJahr: 1980, heute: 2026.8 }, 'bafoeg')[0] === 'bafoeg.alter' && L({ ausbildung: 'ich', gebJahr: 1976, heute: 2026.8 }, 'bafoeg') === 'nein');
ck('[gg-verm] Alte gespeicherte Altersgruppen werden übernommen', L(ohne({ miete: 400, vermoegen: 6000, alterGruppe: '<31' }), 'ggeld') === 'nein' && L(ohne({ miete: 400, vermoegen: 15000, alterGruppe: '51+' }), 'ggeld') !== 'nein');

ck('[kiz-verm] Kinderzuschlag: Vermögen 55.000 € bei 2 Personen erlaubt (40.000 + 15.000), 55.001 € nicht', L({ kids: 1, art1: 'lohn', brutto: 1800, netto: 1350, miete: 700, mietstufe: '3', vermoegen: 55000 }, 'kiz') === 'ja' && K({ kids: 1, art1: 'lohn', brutto: 1800, netto: 1350, miete: 700, mietstufe: '3', vermoegen: 55001 }, 'kiz')[0] === 'kiz.verm');
// ---------- Landesleistungen (Phase 2) ----------
ck('[lpg-ja] Bayerisches Landespflegegeld: Pflegegrad 2 in Bayern 500 € im Jahr, mit Hinweis auf den Antrag beim Landesamt', L({ pflegegrad: '2', bundesland: 'BY' }, 'lpg') === 'ja' && T({ pflegegrad: '2', bundesland: 'BY' }, 'lpg', 'lpg.ja').betrag === E(500) && K({ pflegegrad: '4' }, 'lpg').includes('lpg.antrag'));
ck('[lpg-voraus] Landespflegegeld: Pflegegrad 1 nein, laufender Antrag möglich, außerhalb Bayerns nein', L({ pflegegrad: '1', bundesland: 'BY' }, 'lpg') === 'nein' && L({ pflegegrad: 'antrag', bundesland: 'BY' }, 'lpg') === 'vielleicht' && L({ pflegegrad: '3', bundesland: 'NW' }, 'lpg') === 'nein' && K({ pflegegrad: '3', bundesland: 'NW' }, 'lpg')[0] === 'lpg.land');
ck('[kg-familiengeld] Bayern mit Kind: Hinweis Familiengeld 250 € / 300 €, Krippengeld bis 100 € (nur Geburten bis 2024); nicht in anderen Ländern', T({ kids: 1, bundesland: 'BY' }, 'kindergeld', 'kindergeld.familiengeld').betrag === E(250) && T({ kids: 1, bundesland: 'BY' }, 'kindergeld', 'kindergeld.familiengeld').ab3 === E(300) && !K({ kids: 1, bundesland: 'NW' }, 'kindergeld').includes('kindergeld.familiengeld') && !K({ young: 1, bundesland: 'BY' }, 'kindergeld').includes('kindergeld.familiengeld'));
ck('[sb-gl] Merkzeichen Gl: Hinweis Gehörlosengeld und Freifahrt-Hinweis, auch aus der einfachen Version (mz.Gl)', K({ gdb: '80', bhPerson: 'erwNach25', mzGl: true }, 'ausweis').includes('ausweis.gl') && K({ gdb: '80', bhPerson: 'erwNach25', mzGl: true }, 'ausweis').includes('ausweis.g') && K({ gdb: '80', bhPerson: 'erwNach25', mz: { Gl: true } }, 'ausweis').includes('ausweis.gl') && !K({ gdb: '80', bhPerson: 'erwNach25' }, 'ausweis').includes('ausweis.gl'));

// ---------- Jahreswechsel 2027: Minijob-Grenze 633 € (Mindestlohn 14,60 €), automatisch ab 1.1.2027 ----------
const kg620 = (heute) => L({ arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 620, heute }, 'krankengeld');
ck('[minijob-2027] 620 € Lohn: 2026 versicherungspflichtig (Krankengeld), ab 2027 Minijob (kein Krankengeld)', kg620(2026.95) === 'ja' && kg620(2027.05) === 'nein');
const az = (heute, kindEink) => A({ young: 1, art1: 'lohn', brutto: 1800, netto: 1400, miete: 600, vermoegen: 0, kindEink, heute }, 'ggeld');
ck('[minijob-2027] Ausbildungsvergütung 620 €: 2026 zählen 17 €, ab 2027 ganz frei', az(2026.95, 620) !== az(2026.95, 0) && az(2027.05, 620) === az(2027.05, 0));

// ---------- Mutterschaftsgeld, Kinderkrankengeld, Kita ----------
const mu = (o) => res({ baby: 'bald', miete: 500, vermoegen: 0, ...o }).m.mutter;
ck('[mu-lohn] Angestellt allein, Baby erwartet: Mutterschaftsgeld wahrscheinlich, 13 € je Tag, 210 € (BAS), Schutzfrist 6/8/12 Wochen', mu({ art1: 'lohn', brutto: 2500, netto: 1800 }).level === 'ja' && T({ baby: 'bald', art1: 'lohn', brutto: 2500, netto: 1800 }, 'mutter', 'mu.lohn').tag === E(13) && T({ baby: 'bald', art1: 'lohn', brutto: 2500, netto: 1800 }, 'mutter', 'mu.lohn').bas === E(210) && T({ baby: 'bald', art1: 'lohn', brutto: 2500, netto: 1800 }, 'mutter', 'mu.frist').nachLang === 12);
ck('[mu-lohn] Minijob: Hinweis auf 210 € vom Bundesamt für Soziale Sicherung', K({ baby: 'bald', art1: 'lohn', brutto: 500, netto: 500 }, 'mutter').includes('mu.minijob') && !K({ baby: 'bald', art1: 'lohn', brutto: 2500, netto: 1800 }, 'mutter').includes('mu.minijob'));
ck('[mu-alg] Arbeitslosengeld: Mutterschaftsgeld in Höhe des Arbeitslosengeldes', K({ baby: 'bald', art1: 'alg', brutto: 1100, netto: 1100 }, 'mutter')[0] === 'mu.alg');
ck('[mu-ohne] Ohne Arbeit nein (Hinweis Mehrbedarf), ohne Baby nein, zwei Erwachsene nur möglich, Kind schon da nur möglich', mu({ art1: 'ohne' }).level === 'nein' && K({ baby: 'bald', art1: 'ohne' }, 'mutter')[0] === 'mu.ohne' && L({ art1: 'lohn', brutto: 2500, netto: 1800 }, 'mutter') === 'nein' && mu({ adults: 2, art1: 'lohn', brutto: 2500, netto: 1800 }).level === 'vielleicht' && mu({ baby: 'da', art1: 'lohn', brutto: 2500, netto: 1800 }).level === 'vielleicht');
ck('[kkg-tage] Kinderkrankengeld 2026: 15 Tage (max. 35), alleinerziehend 30 (70); 2027: 10 (25) bzw. 20 (50); 90 %, höchstens 135,63 €', T({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9 }, 'kkg', 'kkg.ja').tage === 15 && T({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9 }, 'kkg', 'kkg.ja').max === 35 && T({ kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9 }, 'kkg', 'kkg.ae').tage === 30 && T({ kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9 }, 'kkg', 'kkg.ae').max === 70 && T({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2027.1 }, 'kkg', 'kkg.ja').tage === 10 && T({ kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2027.1 }, 'kkg', 'kkg.ae').max === 50 && T({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9 }, 'kkg', 'kkg.ja').hoechst === '135,63 €');
ck('[kkg-ohne] Kinderkrankengeld: ohne Kind nein, ohne Arbeit oder nur Minijob nein', L({ art1: 'lohn', brutto: 3000, netto: 2100 }, 'kkg') === 'nein' && L({ kids: 1, art1: 'rente', brutto: 1500, netto: 1500 }, 'kkg') === 'nein' && L({ kids: 1, art1: 'lohn', brutto: 500, netto: 500 }, 'kkg') === 'nein');
const butWg = (u6) => K({ kids: 1, kidsU6: u6, art1: 'lohn', brutto: 2600, netto: 1900, miete: 750, mietstufe: '4', vermoegen: 0 }, 'but');
ck('[but-kita] Wohngeld möglich (noch nicht bezogen): Kita-Hinweis nur mit Kind unter 6', butWg(1).includes('but.kita') && !butWg(0).includes('but.kita'));
ck('[but-kita] Kita beitragsfrei bei Wohngeld/Kinderzuschlag/Grundsicherung: Hinweis nur mit Kind unter 6', K({ kids: 1, kidsU6: 1, bezug: { wohngeld: true } }, 'but').includes('but.kita') && !K({ kids: 1, bezug: { wohngeld: true } }, 'but').includes('but.kita'));

// Unterhalt, den die Person selbst zahlt (§ 11b Abs. 1 Satz 1 Nr. 7 SGB II; § 18 WoGG; SGB XII ohne Abzug)
const S = (o, id) => { const t = res(o).m[id].tx.find((a) => a[0] === 'schaetz.eins'); return t ? Number(t[1].a.replace(/\D/g, '')) : null; };
const uzA = { art1: 'lohn', brutto: 1500, netto: 1150, miete: 600 }; // Freibetrag 100 + 84 + 144 + 20 = 348, Einkommen 802, Bedarf 1.163, Lücke 361
ck('[uz-sgb2] Festgelegter Unterhalt (300 €) wird beim Grundsicherungsgeld voll abgezogen: Lücke 361 € -> 661 €', S(uzA, 'ggeld') === 360 && S({ ...uzA, uzBetrag: 300, uzAn: 'k1', uzTitel: true }, 'ggeld') === 660 && K({ ...uzA, uzBetrag: 300, uzAn: 'k1', uzTitel: true }, 'ggeld').includes('uz.sgb2Titel'));
ck('[uz-sgb2] Ohne festgelegten Betrag kein Abzug, aber Hinweis auf Jugendamtsurkunde', S({ ...uzA, uzBetrag: 300, uzAn: 'k1' }, 'ggeld') === 360 && K({ ...uzA, uzBetrag: 300, uzAn: 'k1' }, 'ggeld').includes('uz.sgb2Ohne'));
const uzK = { adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2300, miete: 900, mietstufe: 3 };
ck('[uz-sgb2] Kinderzuschlag: festgelegter Unterhalt mindert das Einkommen der Eltern (230 € -> Höchstbetrag 297 €)', S(uzK, 'kiz') === 230 && S({ ...uzK, uzBetrag: 300, uzAn: 'k1', uzTitel: true }, 'kiz') === 300 && S({ ...uzK, uzBetrag: 300, uzAn: 'k1' }, 'kiz') === 230);
const D = (o) => R.derive({ ...base, ...o });
const dz = (o) => { const h = D(o); return [h.uzWGpess, h.uzWGopt, h.uzSGB].join('/'); };
ck('[uz-wg] Wohngeld-Höchstbeträge § 18 WoGG: 250 € je Kind, 500 € Ex-Partner; ohne Titel vorsichtig 0, günstig bis Höchstbetrag; mit Titel günstig ganzer Betrag',
  dz({ uzBetrag: 400, uzAn: 'k1', uzTitel: true }) === '250/400/400' && dz({ uzBetrag: 400, uzAn: 'k1' }) === '0/250/0' && dz({ uzBetrag: 600, uzAn: 'ex', uzTitel: true }) === '500/600/600' &&
  dz({ uzBetrag: 1000, uzAn: 'k3' }) === '0/750/0' && dz({ uzBetrag: 900, uzAn: 'exk', uzTitel: true }) === '750/900/900' && dz({ uzBetrag: 400, uzAn: 'k2', uzTitel: true }) === '400/400/400' && dz({ uzBetrag: 400 }) === '0/250/0', [dz({ uzBetrag: 400, uzAn: 'k1', uzTitel: true }), dz({ uzBetrag: 1000, uzAn: 'k3' })]);
const uzW = { art1: 'lohn', brutto: 1800, netto: 1350, miete: 750, mietstufe: 4 };
ck('[uz-wg] Wohngeld: 250 € Unterhalt ohne Titel hebt nur die günstige Schätzung (bleibt „möglich“), mit Titel „wahrscheinlich“', L(uzW, 'wohngeld') === 'vielleicht' && L({ ...uzW, uzBetrag: 250, uzAn: 'k1' }, 'wohngeld') === 'vielleicht' && L({ ...uzW, uzBetrag: 250, uzAn: 'k1', uzTitel: true }, 'wohngeld') === 'ja' && K({ ...uzW, uzBetrag: 250, uzAn: 'k1' }, 'wohngeld').includes('uz.wg'));
ck('[uz-wg] Nach hohem Unterhalt reicht das Geld nicht mehr zum Leben: Hinweis Mindesteinkommen statt Betrag', K({ ...uzW, uzBetrag: 1000, uzAn: 'k1', uzTitel: true }, 'wohngeld').includes('wohngeld.zuNiedrig'));
const uzG = { alter: true, nichtArbeit: true, brutto: 900, miete: 500, mietstufe: 3 };
ck('[uz-gsa] Grundsicherung im Alter: gezahlter Unterhalt ändert nichts am Betrag, Hinweis und Selbstbehalt', S(uzG, 'gsa') === S({ ...uzG, uzBetrag: 200, uzAn: 'ex', uzTitel: true }, 'gsa') && K({ ...uzG, uzBetrag: 200, uzAn: 'ex', uzTitel: true }, 'gsa').includes('uz.gsa') && K({ ...uzG, uzBetrag: 200, uzAn: 'ex', uzTitel: true }, 'gsa').includes('uz.selbstbehalt'));
ck('[uz-sgb2] Ohne gezahlten Unterhalt keine Unterhalts-Hinweise', !K(uzA, 'ggeld').some((k) => /^uz\./.test(k)) && !K(uzW, 'wohngeld').some((k) => /^uz\./.test(k)));

// Künftige vorrangige Leistung (Arbeitslosengeld, Krankengeld, Elterngeld) zählt bei Grundsicherungsgeld, Wohngeld, Kinderzuschlag als Einkommen
const Z = (o) => R.evaluate({ ...base, ...o });
const ZR = (o, id) => Z(o).results.find((x) => x.id === id);
const zAlg = { art1: 'ohne', miete: 600, mietstufe: 3, vermoegen: 1000, arbeitSit: 'arbeitslos', algZeit: true, lohnVorher: 3000, gebJahr: 1985 };
// Arbeitslosengeld: 3.000 € brutto, Netto 60-72 %, 60 % davon: 1.080 bis 1.300 €, Mitte 1.190 €; danach 1.190 - 30 € Pauschale = 1.160 € gegen Bedarf 1.163 €
ck('[zuk-einkommen] Arbeitslos ohne Einkommen: Grundsicherungsgeld jetzt wahrscheinlich, mit 1.190 € Arbeitslosengeld nur noch knapp -> „möglich“ mit Hinweis',
  L({ ...zAlg, arbeitSit: '' }, 'ggeld') === 'ja' && L(zAlg, 'ggeld') === 'vielleicht' && ZR(zAlg, 'ggeld').tx.some((t) => t[0] === 'zuk.alg' && t[1].a === E(1190)) && K(zAlg, 'ggeld').includes('bedarfJa') && K(zAlg, 'ggeld').includes('zuk.vielleicht'));
ck('[zuk-einkommen] Hinweis „Arbeitslosengeld zuerst beantragen“ auf der Ergebnisseite, vor dem Stichtag-Hinweis', Z(zAlg).zusammen.map((a) => a[0]).join() === 'z.ggVsWg,z.zuk.alg,z.stichtag');
ck('[zuk-einkommen] Wohngeld: ohne Einkommen nur „möglich“ (Mindesteinkommen), mit Arbeitslosengeld danach wahrscheinlich, Betrag dazu', K(zAlg, 'wohngeld').includes('zuk.ja') && K(zAlg, 'wohngeld').includes('zuk.betragEins'));
ck('[zuk-einkommen] Ohne Kinder kein Kinderzuschlag, auch kein Hinweis', L(zAlg, 'kiz') === 'nein' && !K(zAlg, 'kiz').some((k) => /^zuk\./.test(k)));
const zKg = { kids: 1, art1: 'lohn', brutto: 2500, netto: 1800, miete: 700, mietstufe: 4, vermoegen: 1000, arbeitSit: 'krank', krankWochen: 'unter6', lohnVorher: 2500 };
// Krankengeld: min(70 % brutto, 90 % netto) minus 12,5 % Beiträge: 1.180 bis 1.420 €, Mitte 1.300 €, statt des Lohns
ck('[zuk-einkommen] Krankgeschrieben (Lohnfortzahlung): Krankengeld 1.300 € ersetzt den Lohn, Grundsicherungsgeld danach wahrscheinlich -> „möglich“, Kinderzuschlag höher',
  L({ ...zKg, arbeitSit: '' }, 'ggeld') !== 'ja' && L(zKg, 'ggeld') === 'vielleicht' && ZR(zKg, 'ggeld').tx.some((t) => t[0] === 'zuk.kg' && t[1].a === E(1300)) && K(zKg, 'ggeld').includes('zuk.ohneLohn') && K(zKg, 'kiz').includes('zuk.betragEins'));
const zEg = { art1: 'lohn', brutto: 2200, netto: 1600, miete: 650, mietstufe: 3, vermoegen: 1000, baby: 'bald', egVor: 1600 };
// Elterngeld: 1.600 € Netto -> 67 % - 0,1 Punkte je 2 € über 1.200 € = 47 % -> Untergrenze 65 %: 1.040 €
ck('[zuk-einkommen] Baby kommt bald (alleinstehend): Elterngeld 1.040 € statt Lohn, Wohngeld danach wahrscheinlich',
  ZR(zEg, 'wohngeld').tx.some((t) => t[0] === 'zuk.eg' && t[1].a === E(1040)) && L({ ...zEg, baby: '' }, 'wohngeld') === 'nein' && L(zEg, 'wohngeld') === 'vielleicht' && K(zEg, 'wohngeld').includes('zuk.ja'));
ck('[zuk-einkommen] Elterngeld bei Paaren: offen, wer es bekommt -> keine zweite Rechnung', !Z({ ...zEg, adults: 2, art2: 'lohn', brutto: 4000, brutto2: 1800, netto: 2900 }).zusammen.some((a) => a[0] === 'z.zuk.eg'));
ck('[zuk-einkommen] Bekommt die Leistung schon (Einkommensart Arbeitslosengeld): keine zweite Rechnung', !Z({ ...zAlg, art1: 'alg', brutto: 1200, netto: 1200 }).zusammen.some((a) => /^z\.zuk/.test(a[0])));
ck('[zuk-einkommen] Grundsicherungsgeld fällt danach weg: Hinweis aufs Überbrücken bis zur ersten Zahlung',
  K({ ...zAlg, lohnVorher: 4500 }, 'ggeld').includes('zuk.nein') && K({ ...zAlg, lohnVorher: 4500 }, 'ggeld').includes('zuk.ueberbruecken') && L({ ...zAlg, lohnVorher: 4500 }, 'ggeld') === 'vielleicht');

// Änderungen 2027 (Stand November 2026): Beschlossenes als Hinweis/Rechnung, Geplantes nur als Hinweis, nicht eingerechnet
const pk = (o, id) => K(o, id);
const p2 = { kids: 2, brutto: 1800, miete: 850, mietstufe: 3, unterhaltFehlt: true };
ck('[plan-2027] Kindergeld: Hinweis antragsloses Kindergeld (beschlossen) und geplante 267 €; gerechnet wird weiter mit 259 €', pk(p2, 'kindergeld').includes('kg.antraglos') && res(p2).m.kindergeld.tx.some((t) => t[0] === 'plan.kg' && t[1].b === E(267)) && P(p2, 'kindergeld', 'kg') === E(259));
ck('[plan-2027] Kinderzuschlag, Unterhaltsvorschuss, Wohngeld: Hinweis auf geplante Änderungen nur bei „wahrscheinlich“ oder „möglich“', pk(p2, 'uvg').includes('plan.uvg') && pk({ ...p2, unterhaltFehlt: false }, 'uvg').every((k) => k !== 'plan.uvg') && (L(p2, 'kiz') === 'nein' || pk(p2, 'kiz').includes('plan.kiz')) && (L(p2, 'wohngeld') === 'nein' || pk(p2, 'wohngeld').includes('plan.wg')));
ck('[plan-2027] Wohngeld: Tipp „Antrag noch 2026“ nur vor dem Jahreswechsel', pk({ ...f1, heute: 2026.9 }, 'wohngeld').includes('plan.wgDez') && !pk({ ...f1, heute: 2027.05 }, 'wohngeld').includes('plan.wgDez') && pk({ ...f1, heute: 2027.05 }, 'wohngeld').includes('plan.wg'));
ck('[plan-2027] Pflegegeld: geplante Beträge 380/630/890/1.080 € nur ab Pflegegrad 2', res({ pflegegrad: 3 }).m.pflege.tx.some((t) => t[0] === 'plan.pflege' && t[1].a === E(380) && t[1].d === E(1080)) && !pk({ pflegegrad: 1 }, 'pflege').includes('plan.pflege'));
ck('[plan-2027] Regelsatz: Hinweis „2027 noch nicht beschlossen, erwartet 563 €“ bei Grundsicherungsgeld und Grundsicherung im Alter', pk(f1, 'ggeld').includes('plan.regel') && pk(f2, 'gsa').includes('plan.regel'));
ck('[plan-2027] Krankengeld: Hinweis auf die neue Beitragsbemessungsgrenze nur bei Lohn über 5.812,50 €', pk({ arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 7000 }, 'krankengeld').includes('plan.krank') && !pk({ arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 3000 }, 'krankengeld').includes('plan.krank'));

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '\nFall-Tests bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
