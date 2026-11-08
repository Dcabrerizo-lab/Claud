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
  ck('Fall ' + (i + 1) + ': 28 Ergebnisse, gültige Stufen, keine Fehlwerte', r.results.length === 28 && r.results.every((x) => gueltig.includes(x.level)) && !/NaN|undefined|Infinity/.test(JSON.stringify(r)));
});
// ---------- Arbeitslosengeld I und Krankengeld (SGB III, SGB V) ----------
const T = (o, id, key) => { const x = res(o).m[id].tx.find((a) => a[0] === key); return x ? x[1] : null; };
// § 147 Abs. 2 SGB III: ab 58 Jahren und 48 Monaten Versicherung 24 Monate; mit Kind 67 % (§ 149)
const a1 = { adults: 2, kids: 2, arbeitSit: 'arbeitslos', algZeit: true, algMonate: 48, gebJahr: 1966, heute: 2026.8, lohnVorher: 4000 };
ck('ALG I: 60 Jahre, 48 Monate → 24 Monate, mit Kindern 67 %', L(a1, 'alg1') === 'ja' && T(a1, 'alg1', 'alg1.dauer').m === 24 && T(a1, 'alg1', 'alg1.ja').p === 67);
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
ck('W1 Hinweis: Einkommen der Eltern zählt nicht', K(w1, 'gsa').includes('gsa.eltern'));
ck('W1 kein Grundsicherungsgeld (Jobcenter), kein Wohngeld für sich allein', L(w1, 'ggeld') === 'nein' && L(w1, 'wohngeld') === 'nein');
// W2: mit Merkzeichen G: Bedarf 563 + 17 % = 658,71
ck('W2 Merkzeichen G: Bedarf 658,71 €', P({ ...w1, mzG: true }, 'gsa', 'bedarf') === E(658.71));
// W3: eigene Wohnung, Miete 450, Werkstatt 300 + Erwerbsminderungsrente 900: anrechenbar 248 - (70,375 + 88,8125) = 88,81;
//     Einkommen 988,81; Bedarf 1.013 -> Lücke 24,19 -> nur möglich
const w3 = { einkommen: [{ art: 'wfbm', b: 300 }, { art: 'rente', b: 900 }], miete: 450, wfbm: true, gebJahr: 1980, heute: 2026.8, vermoegen: 1000 };
ck('W3 Werkstatt plus Rente, eigene Wohnung: knapp (möglich)', L(w3, 'gsa') === 'vielleicht');
ck('W3 mit Mittagessen in der Werkstatt: weiter möglich, Hinweis Mehrbedarf', L({ ...w3, wfbmEssen: true }, 'gsa') === 'vielleicht' && K({ ...w3, wfbmEssen: true }, 'gsa').includes('gsa.essen'));
// W4: Wohnheim, Werkstatt 200: anrechenbar 148 - (70,375 + 38,8125) = 38,81; Bedarf Stufe 2: 506 -> Lücke 467 -> wahrscheinlich
const w4 = { einkommen: [{ art: 'wfbm', b: 200 }], wohnform: 'heim', wfbm: true, gebJahr: 1975, heute: 2026.8, vermoegen: 0 };
ck('W4 Wohnheim: Regelbedarfsstufe 2 (506 €), wahrscheinlich, mindestens 470 €', L(w4, 'gsa') === 'ja' && P(w4, 'gsa', 'bedarf') === E(506) && T(w4, 'gsa', 'schaetz.mind').a === E(470));
// W5: Vermögen über 10.000 € -> nein (Barbetragsverordnung), auch bei den Eltern
ck('W5 Vermögen 12.000 € -> keine Grundsicherung', L({ ...w1, vermoegen: 12000 }, 'gsa') === 'nein');
// W6: Arbeitsförderungsgeld bleibt frei: 52 € Werkstattlohn zählen gar nicht
ck('W6 nur 52 € Werkstattlohn (= Arbeitsförderungsgeld): zählt nicht, Lücke = Bedarf', T({ ...w1, einkommen: [{ art: 'wfbm', b: 52 }] }, 'gsa', 'schaetz.mind').a === E(560));
// W7: Merkzeichen RF -> Rundfunk-Ermäßigung möglich, auch ohne Grundsicherung
ck('W7 Merkzeichen RF: Rundfunk möglich', L({ ...w1, vermoegen: 12000, mz: { RF: true } }, 'rundfunk') === 'vielleicht');
// W8: Lohn auf dem allgemeinen Arbeitsmarkt im Rentenalter: 30 % frei, höchstens 281,50 €
const w8 = { einkommen: [{ art: 'lohn', b: 1200 }, { art: 'rente', b: 700 }], miete: 600, gebJahr: 1955, heute: 2026.8, vermoegen: 0 };
// anrechenbar 1.200 - 281,50 + 700 = 1.618,50; Bedarf 1.163 -> nein
ck('W8 Rentner mit Lohn 1.200 € und Rente 700 €: Freibetrag höchstens 281,50 € -> keine Grundsicherung', L(w8, 'gsa') === 'nein');
// 400 € Lohn: 30 % = 120 frei -> 280 + 700 = 980 < 1.163 -> Lücke 183 -> wahrscheinlich, etwa 180 €
ck('W8b Minijob 400 € neben Rente: 120 € frei, etwa 180 € Grundsicherung', L({ ...w8, einkommen: [{ art: 'lohn', b: 400 }, { art: 'rente', b: 700 }] }, 'gsa') === 'ja' && T({ ...w8, einkommen: [{ art: 'lohn', b: 400 }, { art: 'rente', b: 700 }] }, 'gsa', 'schaetz.eins').a === E(180));

// ---------- Fälle aus dem zweiten Nutzertest (einfache Version) ----------
// Lena: bei den Eltern ohne Miete, Werkstatt 180 €: 128 € nach Arbeitsförderungsgeld; frei 70,375 + 28,81 -> 28,81 zählen; 563 - 28,81 = 534 -> „mindestens 530 €“
const lena = { einkommen: [{ art: 'wfbm', b: 180 }], wohnform: 'eltern', miete: 0, wfbm: true, gebJahr: 2002, heute: 2026.8, vermoegen: 1500, bhPerson: 'erwVor25', bhSelbst: true, gdb: 'H', pflegegrad: '2' };
ck('Lena: Grundsicherung mindestens 530 €, Kindergeld für die Eltern 259 €', T(lena, 'gsa', 'schaetz.mind').a === E(530) && L(lena, 'kgBeh') === 'ja');
// Markus: Wohnheim, Werkstatt 320 €, G: 506 + 86,02 - (268 - 70,375 - 98,81) = 493,21 -> „mindestens 490 €“; 15 Jahre Werkstatt -> Rente erst nach 20 Jahren
const markus = { einkommen: [{ art: 'wfbm', b: 320 }], wohnform: 'heim', wfbm: true, mzG: true, gebJahr: 1985, heute: 2026.8, vermoegen: 0, bhPerson: 'erwVor25' };
ck('Markus: Wohnheim, mindestens 490 €', T(markus, 'gsa', 'schaetz.mind').a === E(490));
ck('Markus: Erwerbsminderungsrente möglich (Werkstatt, 20 Jahre Wartezeit)', L(markus, 'emrente') === 'vielleicht' && K(markus, 'emrente')[0] === 'emrente.werkstatt');
ck('Markus mit 20 Jahren Werkstatt: Erwerbsminderungsrente wahrscheinlich', L({ ...markus, wfbmJahre: 20 }, 'emrente') === 'ja');
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
ck('Mehrbedarf 35 %: Bedarf 1.012 + 451 + 800 + 157,85 = 2.420,85 €', P(bbw, 'ggeld', 'bedarf') === E(1012 + 451 + 800 + 0.35 * 451) && K(bbw, 'ggeld').includes('mehr.teilhabe'));
ck('Werkstatt zählt nicht als Ausbildungshilfe (kein 35 % in der Grundsicherung)', P({ einkommen: [{ art: 'wfbm', b: 200 }], wfbm: true, teilhabe: true, bhPerson: 'erwNach25', miete: 400, gebJahr: 1990, heute: 2026.8, vermoegen: 0 }, 'gsa', 'bedarf') === E(563 + 400));
// Kind unter 18 mit G: Alter unbekannt -> Hinweis auf möglichen Mehrbedarf (ab 15)
ck('Kind mit Merkzeichen G: Hinweis auf möglichen Mehrbedarf', K({ adults: 1, kids: 1, art1: 'lohn', brutto: 1200, netto: 950, miete: 600, vermoegen: 0, bhPerson: 'minder', gdb: '80', mzG: true }, 'ggeld').includes('ggeld.mehrBeh'));
// Grundsicherung im Alter: G und 35 % nicht zusammen für dieselbe Person (§ 30 Abs. 1 Satz 2 SGB XII), der höhere zählt
const gsaT = { art1: 'rente', brutto: 500, netto: 500, miete: 400, gebJahr: 1955, heute: 2026.8, vermoegen: 0, bhPerson: 'erwNach25', mzG: true, teilhabe: true };
ck('G und 35 % für dieselbe Person: nur der höhere (35 % von 563 € = 197,05 €)', P(gsaT, 'gsa', 'bedarf') === E(563 + 400 + 0.35 * 563));
// Wohngeld: Freibetrag 1.800 € je schwerbehinderter Person (§ 17 Nr. 1 WoGG); zwei Personen -> 300 € im Monat
const wg2 = { adults: 2, art1: 'rente', art2: 'rente', brutto: 2300, brutto2: 1000, netto: 2050, miete: 700, mietstufe: 3, vermoegen: 0, gebJahr: 1950, heute: 2026.8, bhPerson: 'erwNach25', gdb: '100' };
ck('Wohngeld: zweite schwerbehinderte Person verbessert die Einstufung oder den Betrag', (() => { const a = res(wg2).m.wohngeld, b = res({ ...wg2, bhWeitere: 1 }).m.wohngeld; const rang = { ja: 2, vielleicht: 1, nein: 0 }; return rang[b.level] > rang[a.level] || JSON.stringify(b.tx) !== JSON.stringify(a.tx); })());
// Pflege-Pauschbetrag (§ 33b Abs. 6 EStG): 600 / 1.100 / 1.800 €
ck('Pflege-Pauschbetrag: Pflegegrad 2 600 €, 3 1.100 €, 4 1.800 €', T({ pflegegrad: '2' }, 'pflege', 'pflege.pauschbetrag').betrag === E(600) && T({ pflegegrad: '3' }, 'pflege', 'pflege.pauschbetrag').betrag === E(1100) && T({ pflegegrad: '4' }, 'pflege', 'pflege.pauschbetrag').betrag === E(1800));
ck('Pflege-Pauschbetrag bei Merkzeichen H ohne Pflegegrad: 1.800 €', T({ bhPerson: 'erwNach25', gdb: 'H' }, 'pausch', 'pflege.pauschbetrag').betrag === E(1800));

// ---------- Weitere Mehrbedarfe und Regeln (Prüfliste vollständig) ----------
// Alleinstehende Schwangere, Miete 500: Bedarf 563 + 500 + 17 % (95,71) = 1.158,71 (§ 21 Abs. 2 SGB II)
ck('Schwangerschaft: Mehrbedarf 17 %, Hinweis Erstausstattung', P({ art1: 'ohne', brutto: 0, netto: 0, miete: 500, vermoegen: 0, gebJahr: 1995, heute: 2026.8, schwanger: true }, 'ggeld', 'bedarf') === E(563 + 500 + 0.17 * 563) && K({ art1: 'ohne', brutto: 0, netto: 0, miete: 500, vermoegen: 0, gebJahr: 1995, heute: 2026.8, schwanger: true }, 'ggeld').includes('mehr.erstausstattung'));
// Warmwasser aus dem Boiler, Paar mit Kind 8: 2 x 506 x 2,3 % + 390 x 1,2 % = 23,28 + 4,68 = 27,96 (§ 21 Abs. 7 SGB II)
ck('Warmwasser: Paar mit Kind 8, Mehrbedarf 27,96 €', P({ adults: 2, kids: 1, art1: 'lohn', brutto: 1500, netto: 1150, miete: 700, vermoegen: 0, gebJahr: 1990, heute: 2026.8, warmwasser: true }, 'ggeld', 'bedarf') === E(1012 + 390 + 700 + 23.276 + 4.68));
ck('Ernährung: nur Hinweis, keine feste Zahl', K({ art1: 'ohne', brutto: 0, netto: 0, miete: 500, vermoegen: 0, gebJahr: 1995, heute: 2026.8, ernaehrung: true }, 'ggeld').includes('mehr.ernaehrung'));
// Altersrente für schwerbehinderte Menschen (§ 236a SGB VI): Jahrgang 1960 abschlagsfrei 64 J. 4 M., frühestens 61 J. 4 M.; ab 1964: 65 / 62
ck('Schwerbehindertenrente Jahrgang 1960: 64 J. 4 M. / 61 J. 4 M.', (() => { const x = T({ gebJahr: 1960, heute: 2026.4, gdb: '50', bhPerson: 'erwNach25' }, 'srente', 'srente.alter2'); return x && x.fj === 64 && x.fm === 4 && x.gj === 61 && x.gm === 4; })());
ck('Schwerbehindertenrente Jahrgang 1970: 65 / 62', (() => { const x = T({ gebJahr: 1970, heute: 2026.8, gdb: '80', bhPerson: 'erwNach25' }, 'srente', 'srente.alter2'); return x && x.fj === 65 && x.fm === 0 && x.gj === 62; })());
ck('Schwerbehindertenrente ohne GdB 50: nein; im Rentenalter: nein', L({ gebJahr: 1970, heute: 2026.8, gdb: '40', bhPerson: 'erwNach25' }, 'srente') === 'nein' && L({ gebJahr: 1950, heute: 2026.8, gdb: '80', bhPerson: 'erwNach25' }, 'srente') === 'nein');
// Pflege: Sachleistung und Tagespflege (§§ 36, 41 SGB XI), Rentenversicherung für Pflegepersonen (§ 44 SGB XI)
ck('Pflegegrad 3: Sachleistung 1.497 €, Tagespflege 1.357 €, Rentenversicherung für Pflegende', T({ pflegegrad: '3' }, 'pflege', 'pflege.sach').sach === E(1497) && T({ pflegegrad: '3' }, 'pflege', 'pflege.sach').tages === E(1357) && K({ pflegegrad: '3' }, 'pflege').includes('pflege.rente'));
// Ausweis: Kündigungsschutz; H/Bl/aG: Wertmarke kostenlos und Kfz-Steuer-Befreiung; aG/Bl: Parkausweis
ck('Ausweis GdB 50: Kündigungsschutz', K({ gdb: '50', bhPerson: 'erwNach25', gebJahr: 1980, heute: 2026.8 }, 'ausweis').includes('ausweis.kuendigung'));
ck('Ausweis aG: frei fahren, Parkausweis, 4.500 € Fahrtkosten', K({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true, gebJahr: 1980, heute: 2026.8 }, 'ausweis').includes('ausweis.frei') && K({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true, gebJahr: 1980, heute: 2026.8 }, 'ausweis').includes('ausweis.park') && T({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true }, 'pausch', 'pausch.fahrt').betrag === E(4500));
// Wohngeld: Grundrentenfreibetrag (§ 17a WoGG) verbessert Einstufung oder Betrag
const wgr = { art1: 'rente', brutto: 1400, netto: 1250, miete: 650, mietstufe: 4, vermoegen: 0, gebJahr: 1955, heute: 2026.8 };
ck('Wohngeld: Grundrentenfreibetrag (§ 17a WoGG) wirkt', JSON.stringify(res(wgr).m.wohngeld.tx) !== JSON.stringify(res({ ...wgr, grundrente33: true }).m.wohngeld.tx));

// ---------- Elterngeld (§ 2 BEEG), Hilfe zur Pflege (§ 85 SGB XII), Asylbewerberleistungen ----------
// Basiselterngeld: 67 %; unter 1.000 € +0,1 Punkte je 2 € (bis 100 %), über 1.200 € -0,1 Punkte je 2 € (bis 65 %); 300 bis 1.800 €
const egB = (vor) => T({ baby: 'bald', egVor: vor, miete: 500, gebJahr: 1995, heute: 2026.8 }, 'elterngeld', 'eg.ja');
[[0, 300], [500, 460], [900, 648], [1100, 737], [1500, 975], [3000, 1800]].forEach(([vor, soll]) => {
  ck('Elterngeld bei ' + vor + ' € netto vorher: ' + soll + ' €', egB(vor) && egB(vor).basis === E(soll) && egB(vor).plus === E(soll / 2) && egB(vor).monate === 14, egB(vor));
});
ck('Elterngeld ohne Kind: nein; ohne Betrag: möglich mit Spanne', L({ miete: 500 }, 'elterngeld') === 'nein' && L({ baby: 'da', miete: 500 }, 'elterngeld') === 'vielleicht' && K({ baby: 'da', miete: 500 }, 'elterngeld')[0] === 'eg.ohneBetrag');
ck('Elterngeld schon bezogen: na', L({ baby: 'da', einkommen: [{ art: 'eg', b: 400 }], miete: 500 }, 'elterngeld') === 'na');
// Hilfe zur Pflege: Einkommensgrenze 2 x 563 + Miete + 70 % von 563 je weiterer Person
ck('Hilfe zur Pflege: ohne Pflegegrad nein', L({ miete: 500 }, 'hzp') === 'nein');
ck('Hilfe zur Pflege: Paar, Miete 600, Grenze 2 x 563 + 600 + 394,10 = 2.120 €', (() => { const x = T({ adults: 2, pflegegrad: '4', art1: 'rente', brutto: 1500, netto: 1500, miete: 600, vermoegen: 0, gebJahr: 1950, heute: 2026.8 }, 'hzp', 'hzp.unter'); return x && x.grenze === E(2 * 563 + 600 + 0.7 * 563); })());
ck('Hilfe zur Pflege: Einkommen über der Grenze -> Hinweis auf Eigenanteil', K({ pflegegrad: '3', art1: 'rente', brutto: 2500, netto: 2500, miete: 500, vermoegen: 0, gebJahr: 1950, heute: 2026.8 }, 'hzp')[0] === 'hzp.ueber');
ck('Hilfe zur Pflege: Vermögen über 10.000 € -> nein', L({ pflegegrad: '3', art1: 'rente', brutto: 900, netto: 900, miete: 500, vermoegen: 15000, gebJahr: 1950, heute: 2026.8 }, 'hzp') === 'nein');
// Asylbewerber: eigene Leistung, kein Grundsicherungsgeld, keine Grundsicherung im Alter, kein Wohngeld, kein Kinderzuschlag (§ 7 Abs. 1 SGB II, § 23 Abs. 2 SGB XII, § 20 WoGG)
const asyl = { adults: 2, kids: 2, art1: 'ohne', brutto: 0, netto: 0, miete: 700, vermoegen: 0, gebJahr: 1990, heute: 2026.8, aufenthalt: 'asyl' };
ck('Asyl: Asylbewerberleistungen ja', L(asyl, 'asylblg') === 'ja');
ck('Asyl: Grundsicherungsgeld, Wohngeld, Kinderzuschlag nein', L(asyl, 'ggeld') === 'nein' && K(asyl, 'ggeld')[0] === 'ggeld.asyl' && L(asyl, 'wohngeld') === 'nein' && L(asyl, 'kiz') === 'nein');
ck('Asyl im Rentenalter: keine Grundsicherung im Alter', L({ ...asyl, adults: 1, kids: 0, gebJahr: 1950 }, 'gsa') === 'nein');
ck('Asyl: Kindergeld und Elterngeld nur möglich (abhängig vom Aufenthaltstitel)', L(asyl, 'kindergeld') === 'vielleicht' && L({ ...asyl, baby: 'da', egVor: 0 }, 'elterngeld') === 'vielleicht');
ck('Ohne Asyl: Asylbewerberleistungen nein', L({ ...asyl, aufenthalt: '' }, 'asylblg') === 'nein');

// ---------- Blindenhilfe (§ 72 SGB XII) ----------
const blind = { art1: 'rente', brutto: 900, netto: 900, miete: 450, vermoegen: 0, gebJahr: 1960, heute: 2026.8, bhPerson: 'erwNach25', gdb: '100', blind: 'blind' };
ck('Blindenhilfe: blind, wenig Einkommen -> möglich, unter der Grenze 2 x 563 + 450 = 1.576 €', L(blind, 'blh') === 'vielleicht' && T(blind, 'blh', 'blh.unter') && T(blind, 'blh', 'blh.unter').grenze === E(2 * 563 + 450) && K(blind, 'blh').includes('blh.bayern'));
ck('Blindenhilfe: über der Grenze höchstens 40 % angerechnet', T({ ...blind, brutto: 2500, netto: 2500 }, 'blh', 'blh.ueber').prozent === 40);
ck('Blindenhilfe: hochgradig sehbehindert -> nein; nicht blind -> nein', L({ ...blind, blind: 'hoch' }, 'blh') === 'nein' && K({ ...blind, blind: 'hoch' }, 'blh')[0] === 'blh.hoch' && L({ ...blind, blind: '' }, 'blh') === 'nein');
ck('Blindenhilfe: Vermögen 15.000 € -> nein', L({ ...blind, vermoegen: 15000 }, 'blh') === 'nein');
ck('Blindenhilfe: Kind halbiert, Pflegegrad angerechnet', K({ ...blind, bhPerson: 'minder', adults: 2, kids: 1 }, 'blh').includes('blh.kind') && K({ ...blind, pflegegrad: '3' }, 'blh').includes('blh.pflege'));
ck('Blindenhilfe außerhalb Bayerns: Landesblindengeld des Landes', K({ ...blind, bundesland: 'NW' }, 'blh').includes('blh.landAnders'));
ck('Blindenhilfe bei Asyl: nur möglich mit Hinweis', K({ ...blind, aufenthalt: 'asyl' }, 'blh')[0] === 'blh.asyl');

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '\nFall-Tests bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
