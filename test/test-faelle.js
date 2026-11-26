// 20 Beratungsfälle (von Hand durchdacht). Prüft Einstufung und zentrale Zahlen; Erwartungen stammen aus den
// Rechtsquellen (WoGG § 20, SGB II § 7/§ 8, § 33b EStG, SGB XI, BayBlindG, BayWoFG), nicht aus rules.js.
const R = require('./rules-de.js');
const KARTEN = require('./karten.js');
require('./test-unterhalt-selbst.js'); // Musterfälle „Unterhalt für sich selbst“ (eigene Datei, läuft mit den Fall-Tests)
// ohneWege: Handrechnungen je Leistung (ohne die Lage der zwei Wege; die prüft test/test.js)
const base = { ohneWege: true, adults: 1, kids: 0, young: 0, brutto: 0, brutto2: 0, netto: '', miete: 0, vermoegen: 0, bezug: {} };
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
// Seit 21.11.2026 zählt das Wohngeld bei der Plausibilitätsprüfung mit (Nr. 15.01 WoGVwV): mit 900 € Rente reicht es, deshalb hier 400 €
ck('F3 Wohngeld: 900 € Rente plus Wohngeld reicht für Miete und 80 % Regelbedarf -> kein „Einkommen eher zu niedrig“', res(f3).m.wohngeld.hl !== 'einkoNiedrig', K(f3, 'wohngeld'));
ck('F3 Wohngeld-Text ohne Verweis auf Grundsicherung (Rente 400 €)', K({ ...f3, brutto: 400 }, 'wohngeld')[0] === 'wohngeld.zuNiedrigVerm', K({ ...f3, brutto: 400 }, 'wohngeld'));
ck('F3 Eingliederungshilfe nicht vorgeschlagen (nur Pflegegrad im Alter)', L(f3, 'eingl') === 'nein');
ck('F3 Verhinderungspflege ja', L(f3, 'pflegeplus') === 'ja');
// 4 Paar, 2 Kinder, 4.000 € brutto gesamt
const f4 = { adults: 2, kids: 2, brutto: 4000, brutto2: 1500, miete: 1100, mietstufe: 4 };
ck('F4 Bedarf 1012+780+1100', P(f4, 'ggeld', 'bedarf') === E(1012 + 780 + 1100));
// Elterneinkommen 3.200 - 2 x 378 Freibetrag = 2.444; Bemessung 1.012 + 1.100 x 2/2,8 = 1.797,71; 594 - 0,45 x 646 = 303 -> wahrscheinlich
ck('F4 KiZ mit Freibeträgen für Arbeit: wahrscheinlich', L(f4, 'kiz') === 'ja');
ck('F4b KiZ bei 5.200 € brutto und 4.160 € netto zu hoch', L({ ...f4, brutto: 5200, netto: 4160 }, 'kiz') === 'nein');
// Ohne Netto schätzt die App es nach Lohnsteuer und Beiträgen (Steuerklasse IV/IV, 2 Kinder): rund 3.700 € statt früher pauschal 80 % (4.160 €)
ck('F4c Netto-Schätzung 5.200 € brutto (3.700 + 1.500): 3.650-3.750 €', (() => { const h = R.evaluate({ ...base, ...f4, brutto: 5200 }).h; return h.nettoGeschaetzt && h.netto > 3650 && h.netto < 3750; })());
ck('[wbs-grenze] F4 WBS-Grenze 4 Personen (2 Kinder) = 27.500 + 2 x 5.000 + 2 x 1.300 = 40.100', P(f4, 'wbs', 'grenze') === '40.100 €' && L(f4, 'wbs') === 'vielleicht');
// 5 Bezug von Grundsicherungsgeld
const f5 = { adults: 2, kids: 3, nichtArbeit: true, miete: 1000, mietstufe: 3, bezug: { grundsicherungsgeld: true } };
ck('F5 Wohngeld/KiZ ausgeschlossen, BuT/Rundfunk ja', L(f5, 'wohngeld') === 'nein' && L(f5, 'kiz') === 'nein' && L(f5, 'but') === 'ja' && L(f5, 'rundfunk') === 'ja');
// 6 Azubi mit Betrieb, wohnt allein
const f6 = { ausbildung: 'ich', brutto: 900, miete: 450, mietstufe: 3, babBetrieb: true, babWohnt: true };
ck('[bab-voraus] F6 BAB möglich, nie "ja"', L(f6, 'bab') === 'vielleicht');
ck('[wg-azubi] F6 Wohngeld ausgeschlossen (§ 20 WoGG)', L(f6, 'wohngeld') === 'nein' && K(f6, 'wohngeld')[0] === 'wohngeld.ausbildung');
// Vollprüfung 24.11.2026 (Befund B-02): BAB geht vor und zählt als Einkommen (§ 12a SGB II) -> höchstens „möglich“ mit Hinweis
ck('F6 aufstockendes Grundsicherungsgeld bleibt möglich (BAB zuerst)', L(f6, 'ggeld') === 'vielleicht' && K(f6, 'ggeld')[0] === 'ggeld.babZuerst');
const f6b = { ...f6, babWohnt: false };
ck('F6b Azubi bei den Eltern: BAB unwahrscheinlich, Wohngeld nicht per § 20 ausgeschlossen', L(f6b, 'bab') === 'nein' && K(f6b, 'wohngeld')[0] !== 'wohngeld.ausbildung');
// 7 Studierende allein
const f7 = { ausbildung: 'ich', nichtArbeit: true, miete: 400, mietstufe: 3 };
// Gegenprüfung PR #194 (Befund 3): Schule und Studium trennt die App nicht; Schüler mit Schüler-BAföG sind auch mit eigener Wohnung nicht
// ausgeschlossen (§ 7 Abs. 6 Nr. 2 SGB II) -> „möglich“ ohne Betrag, Hinweis zum Ausschluss vorn
ck('[gg-studium] F7 Student allein: Grundsicherungsgeld nur „möglich“ ohne Betrag (§ 7 Abs. 5, Abs. 6 Nr. 2 SGB II)', L(f7, 'ggeld') === 'vielleicht' && K(f7, 'ggeld')[0] === 'ggeld.ausbildung' && !K(f7, 'ggeld').some((k) => /^schaetz\./.test(k)));
ck('F7 Student: kein Wohngeld', L(f7, 'wohngeld') === 'nein');
ck('F7 BAföG möglich', L(f7, 'bafoeg') === 'vielleicht');
ck('F7 Student mit Kind: Wohngeld nicht per § 20 ausgeschlossen', K({ ...f7, kids: 1 }, 'wohngeld')[0] !== 'wohngeld.ausbildung');
// Vollprüfung 24.11.2026 (Befunde B-07, Fable 1): Ausschluss „dem Grunde nach“ auch ohne BAföG wegen des Alters (BSG B 14 AS 24/09 R)
ck('F7 Student 51+: Ausschluss gilt unabhängig vom Alter, Hinweis wie unter 45', L({ ...f7, alterGruppe: '50+' }, 'ggeld') === L(f7, 'ggeld') && K({ ...f7, alterGruppe: '50+' }, 'ggeld')[0] === 'ggeld.ausbildung');
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
const f10 = { bundesland: 'BY', blind: 'blind', pflegegrad: '4', emStd: 'unter3', em5: true, gdb: '100', brutto: 300, nichtArbeit: true, miete: 500, mietstufe: 3, erwerbsgemindert: true };
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
const f14 = { adults: 2, alter: true, nichtArbeit: true, nichtArbeit2: true, brutto: 1400, brutto2: 800, miete: 700, mietstufe: 2, vermoegen: 3000 };
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
ck('[alg-dauer] ALG I: 60 Jahre (Einzelperson), 48 Monate → 24 Monate, mit Kindern 67 %', L({ ...a1, adults: 1 }, 'alg1') === 'ja' && T({ ...a1, adults: 1 }, 'alg1', 'alg1.dauer').m === 24 && T({ ...a1, adults: 1 }, 'alg1', 'alg1.ja').p === 67);
// Paar: Das Alter gilt der ältesten Person, die arbeitslose Person kann jünger sein (§ 147 Abs. 2 SGB III) → keine konkrete Dauer
ck('[alg-dauer] ALG I: Paar, älteste Person 60 → keine Dauer zugesagt, nur Mindestdauer', L(a1, 'alg1') === 'ja' && !T(a1, 'alg1', 'alg1.dauer') && res(a1).m.alg1.tx.some((a) => a[0] === 'alg1.dauerMin'));
// Oben: Leistungsentgelt Steuerklasse III (§ 153 SGB III): 4.000 − 20 % − 207,66 € Lohnsteuer = 2.992,34 € × 67 % = 2.004,87 -> 2.000 €
ck('ALG I: Schätzung 4.000 € x 60 % x 67 % = 1.610 bis 2.000 € (Steuerklasse III)', T(a1, 'alg1', 'schaetz.spanne').a === E(1610) && T(a1, 'alg1', 'schaetz.spanne').b === E(2000), JSON.stringify(T(a1, 'alg1', 'schaetz.spanne')));
ck('ALG I: 57 Jahre mit 48 Monaten → 18 Monate (ab 55 und 36 Monaten)', T({ ...a1, adults: 1, gebJahr: 1969 }, 'alg1', 'alg1.dauer').m === 18);
ck('ALG I: 30 Jahre, 20 Monate → 10 Monate, ohne Kind 60 %', T({ ...a1, adults: 1, kids: 0, gebJahr: 1996, algMonate: 20 }, 'alg1', 'alg1.dauer').m === 10 && T({ ...a1, adults: 1, kids: 0, gebJahr: 1996, algMonate: 20 }, 'alg1', 'alg1.ja').p === 60);
ck('ALG I: über der Beitragsbemessungsgrenze gedeckelt (8.450 €)', T({ ...a1, lohnVorher: 12000 }, 'alg1', 'schaetz.spanne').b === E(Math.round(8450 * 0.72 * 0.67 / 10) * 10));
ck('ALG I: ohne 12 Monate Versicherung nur möglich', L({ ...a1, algZeit: false }, 'alg1') === 'vielleicht');
ck('ALG I: im Rentenalter nicht (Einzelperson)', L({ ...a1, adults: 1, gebJahr: 1955 }, 'alg1') === 'nein');
ck('ALG I: Paar, älteste Person im Rentenalter → nur möglich (jüngere kann arbeitslos sein)', L({ ...a1, gebJahr: 1955 }, 'alg1') === 'vielleicht');
ck('ALG I: wer es schon bekommt → schon vorhanden', L({ ...a1, art1: 'alg', brutto: 1900, netto: 1900 }, 'alg1') === 'na');
ck('ALG I: Krankengeld läuft aus → Nahtlosigkeit möglich (§ 145 SGB III)', L({ arbeitSit: 'krank', krankWochen: 'ende' }, 'alg1') === 'vielleicht' && K({ arbeitSit: 'krank', krankWochen: 'ende' }, 'alg1')[0] === 'alg1.nahtlos');
// § 47 SGB V: 70 % brutto, höchstens 90 % netto; abzüglich Beiträge 12,5 %. 3.000 € brutto: netto 60-72 % → 1.620/1.944 x 0,9
const k1 = { arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 3000 };
ck('Krankengeld läuft: wahrscheinlich, Hinweis auf 78 Wochen', L(k1, 'krankengeld') === 'ja' && K(k1, 'krankengeld').includes('krank.78'));
// Oben: Netto Steuerklasse III 2.327,17 € × 90 % = 2.094,45 € (unter 70 % brutto 2.100 €) × 0,875 = 1.832,64 -> 1.830 €
ck('Krankengeld: Schätzung 3.000 € → 1.420 bis 1.830 €', T(k1, 'krankengeld', 'schaetz.spanne').a === E(Math.round(3000 * 0.6 * 0.9 * 0.875 / 10) * 10) && T(k1, 'krankengeld', 'schaetz.spanne').b === E(Math.round(Math.min(2100, R.nettoLohn(3000, { stkl: 3, heute: 2026.8 }).netto * 0.9) * 0.875 / 10) * 10), JSON.stringify(T(k1, 'krankengeld', 'schaetz.spanne')));
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
// Elena hat kein Arbeitseinkommen (ALG I und Elterngeld): Über dem Elternbedarf (2 × 506 + 71 % von 1.680 = 2.205 €) wird es voll angerechnet
// (§ 6a Abs. 6 Satz 4 BKGG), rund 685 € > 594 € Höchstbetrag → kein Kinderzuschlag. Bis 11/2026 rechnete die App fälschlich mit 45 %.
ck('Elena: Wohngeld wahrscheinlich mit Betrag; Kinderzuschlag nein (anderes Einkommen voll angerechnet); Bildung und Teilhabe über das Wohngeld', L(ele, 'wohngeld') === 'ja' && (!!T(ele, 'wohngeld', 'schaetz.spanne') || !!T(ele, 'wohngeld', 'schaetz.eins')) && L(ele, 'kiz') === 'nein' && L(ele, 'but') === 'ja');
ck('[kiz-anderes] Elena mit Lohn statt Elterngeld: Kinderzuschlag wieder möglich', L({ ...ele, art2: 'lohn', netto: 3000 }, 'kiz') !== 'nein');
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
// aG: Wertmarke nur gegen Eigenbeteiligung (§ 228 Abs. 4 SGB IX nennt nur blind, hilflos, Leistungsbezug), Kfz-Steuer frei; bis 24.11.2026 „ausweis.frei“ (Vollprüfung B03)
ck('[st-fahrt] [sb-frei] [sb-park] Ausweis aG: Kfz-Steuer frei, Wertmarke mit Eigenbeteiligung, Parkausweis, 4.500 € Fahrtkosten', K({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true, gebJahr: 1980, heute: 2026.8 }, 'ausweis').includes('ausweis.ag') && !K({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true, gebJahr: 1980, heute: 2026.8 }, 'ausweis').includes('ausweis.frei') && K({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true, gebJahr: 1980, heute: 2026.8 }, 'ausweis').includes('ausweis.park') && T({ gdb: '80', bhPerson: 'erwNach25', mz: { aG: true }, mzG: true }, 'pausch', 'pausch.fahrt').betrag === E(4500));
// Wohngeld: Grundrentenfreibetrag (§ 17a WoGG) verbessert Einstufung oder Betrag
const wgr = { art1: 'rente', brutto: 1400, netto: 1250, miete: 650, mietstufe: 4, vermoegen: 0, gebJahr: 1955, heute: 2026.8 };
ck('[wg-grundrente] Wohngeld: Grundrentenfreibetrag (§ 17a WoGG) wirkt', JSON.stringify(res(wgr).m.wohngeld.tx) !== JSON.stringify(res({ ...wgr, grundrente33: true }).m.wohngeld.tx));

// Mehrbedarf Alleinerziehende 36 % gilt für Kinder unter 7, gefragt wird nach Kindern unter 6: ein Kind von 6 bis 13 kann noch 6 sein.
// Fall aus dem großen Abgleich mit dem KiZ-Lotsen (Kind 6 Jahre, 3.250 € brutto, 770 € warm: Lotse „Aussicht auf Erfolg“).
{ const f = { adults: 1, kids: 1, kidsU6: 0, kids14: 0, art1: 'lohn', brutto: 3250, netto: 2275, miete: 770, mietstufe: 3, vermoegen: 0, bezug: { kindergeld: true } };
  ck('[kiz-ae7] Kinderzuschlag: Kind evtl. erst 6 (36 % Mehrbedarf) -> „möglich“ statt „eher nicht“; mit Kind ab 14 bleibt „eher nicht“',
    L(f, 'kiz') === 'vielleicht' && K(f, 'kiz').includes('kiz.ae7') && L({ ...f, kids14: 1 }, 'kiz') === 'nein' && L({ ...f, kidsU6: 1 }, 'kiz') !== 'nein', [L(f, 'kiz'), L({ ...f, kids14: 1 }, 'kiz'), L({ ...f, kidsU6: 1 }, 'kiz')].join(' ')); }

// WBS-Stufen je Land: Liste mit Grenzen, erreichte Stufe nach Brutto, sonst nach Abzügen; höchste Stufe = Grenze für „eher nicht“
{ const W = (bl, b) => R.evaluate({ adults: 1, art1: 'lohn', brutto: b, netto: Math.round(b * 0.7), miete: 600, bundesland: bl, heute: 2026.9 }).results.find((x) => x.id === 'wbs');
  const st = (r) => r.tx.filter((t) => /^wbs\.stufe/.test(t[0])).map((t) => t[0].replace('wbs.', '') + ':' + t[1].name + (t[1].grenze ? '=' + String(t[1].grenze.eur !== undefined ? t[1].grenze.eur : t[1].grenze).replace(/\D/g, '') : '')).join(' ');
  ck('[wbs-stufen] Berlin: WBS 140/180/220 mit 16.800/21.600/26.400 €; 1.500 € brutto -> WBS 180, 2.000 € -> WBS 220, 2.500 € -> nach Abzügen WBS 180',
    st(W('BE', 1500)) === 'stufe:WBS 140=16800 stufe:WBS 180=21600 stufe:WBS 220=26400 stufeDu:WBS 180' && /stufeDu:WBS 220/.test(st(W('BE', 2000))) && /stufeVielleicht:WBS 180/.test(st(W('BE', 2500))), st(W('BE', 1500)));
  ck('[wbs-stufen] Hamburg 1./2./3. Förderweg 19.200/24.000/28.800 €, NRW Gruppe A/B, MV 2. Förderweg 27.000 €',
    /1\. Förderweg=19200 stufe:2\. Förderweg=24000 stufe:3\. Förderweg=28800/.test(st(W('HH', 1000))) && /Einkommensgruppe B=32960/.test(st(W('NW', 1000))) && /2\. Förderweg=27000/.test(st(W('MV', 1000))), st(W('HH', 1000)));
  ck('[wbs-stufen] Unter der Grundgrenze: niedrigste Stufe; Länder mit nur einer Grenze ohne Stufenliste; „eher nicht“ ohne Stufen',
    /stufeDu:WBS 140/.test(st(W('BE', 1000))) && st(W('HE', 1000)) === '' && st(W('BE', 9000)) === '' && W('BE', 9000).level === 'nein', [st(W('BE', 1000)), st(W('HE', 1000)), W('BE', 9000).level].join(' | '));
  ck('[wbs-stufen] Höchste Stufe jedes Landes = Faktor „hoch“ (Grenze für „eher nicht“)', Object.keys(R.RULES.wbsStufen).every((bl) => { const S = R.RULES.wbsStufen[bl], L = R.RULES.wbsLand[bl]; const f = S[S.length - 1][1]; return Math.abs((typeof f === 'number' ? f : f.ein / L.ein) - L.hoch) < 0.001 && S[0][1] === 1; })); }
// WBS: Arbeitnehmer-Pauschbetrag 1.230 € je Person mit Lohn vor den 30 % (Art. 6 Abs. 1 und 3 BayWoFG, § 21 WoFG, § 9a EStG; Abgleich Runde 2, H2)
{ const W = (o) => R.evaluate(Object.assign({ adults: 1, art1: 'lohn', miete: 600, heute: 2026.9 }, o)).results.find((x) => x.id === 'wbs');
  const k = (r) => r.tx.map((t) => t[0] + (t[1] && t[1].name ? ':' + t[1].name : '')).join(' ');
  ck('[wbs-werbung] Schleswig-Holstein, allein, 34.080 € Lohn: (34.080 − 1.230) × 0,7 = 22.995 € ≤ 23.000 € -> nach Abzügen 1. Förderweg (SH-WBS, Fußnote)',
    /stufeVielleicht:1\. Förderweg/.test(k(W({ brutto: 2840, netto: 2000, bundesland: 'SH' }))), k(W({ brutto: 2840, netto: 2000, bundesland: 'SH' })));
  ck('[wbs-werbung] Bayern, allein, 25.800 € Lohn: (25.800 − 1.230) × 0,7 = 17.199 € ≤ 17.500 € -> „möglich“ mit Grundgrenze (wbs.rand), selbstständig nicht',
    k(W({ brutto: 2150, netto: 1500 })) === 'wbs.rand wbs.abzug' && k(W({ brutto: 2150, netto: 1500, art1: 'selbst' })) === 'wbs.gebiet wbs.abzug', k(W({ brutto: 2150, netto: 1500 })));
  ck('[wbs-werbung] Bayern, allein, 41.400 € Lohn: (41.400 − 1.230) × 0,7 = 28.119 € ≤ 28.300 € -> nicht „eher nicht“; selbstständig 41.400 € und Lohn 42.600 € „eher nicht“',
    W({ brutto: 3450, netto: 2300 }).level === 'vielleicht' && W({ brutto: 3450, netto: 2300, art1: 'selbst' }).level === 'nein' && W({ brutto: 3550, netto: 2300 }).level === 'nein');
  ck('[wbs-werbung] „wahrscheinlich“ bleibt beim Brutto: 17.520 € Lohn allein in Bayern nur „möglich“', W({ brutto: 1460, netto: 1100 }).level === 'vielleicht'); }

// Heizkosten (freiwillig): Wohngeld rechnet mit der Bruttokaltmiete = Warmmiete minus Heizkosten (ohne Angabe: Heizkostenkomponente)
// 1 Person, Stufe III, 500 € warm, 1.200 € Lohn: mit 60 € Heizung Kaltmiete 440 € -> M = 440 + 110,40; Y = (1.200 - 102,50) x 0,7 -> 340 € (wie amtlicher Rechner)
{ const hk = (h) => T({ art1: 'lohn', brutto: 1200, netto: 900, miete: 500, mietstufe: 3, vermoegen: 0, heizkosten: h }, 'wohngeld', 'schaetz.spanne');
  ck('[wg-heiz] Wohngeld mit angegebenen Heizkosten genauer: 60 € Heizung -> bis 340 €, ohne Angabe bis 300 €, 200 € Heizung -> bis 230 €; Unsinn (Heizung über Miete) wird ignoriert',
    hk(60).b === E(340) && hk('').b === E(300) && hk(200).b === E(230) && hk(5000).b === E(300), [hk(60), hk(''), hk(200), hk(5000)].map((x) => x && x.b).join(' / ')); }

// ---------- Elterngeld (§ 2 BEEG), Hilfe zur Pflege (§ 85 SGB XII), Asylbewerberleistungen ----------
// Basiselterngeld: vom Netto erst 102,50 € ab (§ 2c Abs. 1 BEEG: ein Zwölftel von 1.230 €), dann 67 %; unter 1.000 € +0,1 Punkte je 2 € (bis 100 %), über 1.200 € -0,1 Punkte je 2 € (bis 65 %); 300 bis 1.800 €
// Erwartungen von Hand aus dem Gesetz (gesetze-im-internet.de/beeg/__2.html, __2c.html, abgerufen 21.11.2026), nicht aus rules.js. Der Schnellrechner
// des Bundes zieht nur 83,33 € ab und zeigt mehr (400 / 621 / 681 / 921 €); SoLo rechnet nach dem Gesetz (Entscheidung David, 21.11.2026):
//  500 €: 397,50 × 97,1 % = 385,97 -> 386 €; 900 €: 797,50 × 77,1 % = 614,87 -> 615 €; 1.100 €: 997,50 × 67,1 % = 669,32 -> 669 €;
//  1.500 €: seit 21.11.2026 Elterngeld-Netto nach § 2f BEEG (Befund E2): Brutto 2.039 € (Steuerklasse I, kinderlos), echte Beiträge 21,75 % = 443,48 €,
//  Pauschale 21 % = 428,19 € -> 1.515,29 €; 1.412,79 × 65 % = 918,31 -> 918 € (vorher mit dem Netto 908 €). 500 / 900 / 1.100 €: Brutto unter 2.000 €
//  (Minijob/Übergangsbereich), Netto unverändert. 0 €: Mindestbetrag 300 €; 3.000 €: Höchstbetrag 1.800 €
const egB = (vor) => T({ baby: 'bald', egVor: vor, miete: 500, gebJahr: 1995, heute: 2026.8 }, 'elterngeld', 'eg.ja');
[[0, 300], [500, 386], [900, 615], [1100, 669], [1500, 918], [3000, 1800]].forEach(([vor, soll]) => {
  ck('[eg-satz] Elterngeld bei ' + vor + ' € netto vorher: ' + soll + ' €', egB(vor) && egB(vor).basis === E(soll) && [E(Math.floor(soll / 2)), E(Math.ceil(soll / 2))].includes(egB(vor).plus) && egB(vor).monate === 14, egB(vor));
});
// Mehrlinge und Teilzeit (§ 2 Abs. 3, § 2a Abs. 1 und 4, § 4a Abs. 2 BEEG, gesetze-im-internet.de, abgerufen 21.11.2026). Erwartungen von Hand bzw. mit
// einem eigenen Python-Skript (Dezimalrechnung) aus dem Gesetzestext, nicht aus rules.js:
//  Elterngeld-Netto nach § 2f BEEG (Befund E2, Werte siehe oben und test/referenz.js egNettoRef): 1.500 -> 1.515,29 €; 2.000 (kinderlos) -> 2.021,78 €;
//  2.500 mit zwei Kindern (Steuerklasse II, Pflege 1,55 %) -> Brutto 3.579 €, Beiträge 748,01 €, Pauschale 751,59 € -> 2.496,42 €; Netto danach (800, 1.000) im
//  Übergangsbereich unverändert.
//  Zwillinge 1.500 €: 1412,79 × 65 % = 918,31 + 300 = 1.218,31 € (Plus 459,16 + 150 = 609,16); Drillinge + 600 = 1.518,31 € (Plus 759,16); Drillinge 3.000 €: 1.800 + 600 = 2.400 € (Plus 1.200)
//  Teilzeit 2.000/800: (1919,28 − 697,50) × 65 % = 794,16 €; Plus min(794,16, 1247,53 / 2 = 623,77) = 623,77 €
//  Teilzeit 1.200/500: q = 67 % (1097,50), (1097,50 − 397,50) × 67 % = 469 €; Plus min(469, 735,33 / 2 = 367,66) = 367,66 €
//  Teilzeit 2.000/2.000 und 2.000/2.500: Unterschied 0 bzw. kein Unterschied -> Mindestbetrag 300 € (Plus 150 €, § 4a Abs. 2 Satz 3 Nr. 1)
//  Deckel 2.770 €: vor 4.000 und 6.000, nach 1.000: (2770 − 897,50) × 65 % = 1.217,13 €; Plus min(1217,13, 1800 / 2) = 900 €; nach 2.900: 2.797,50 > 2.770 -> 300 €
//  Teilzeit 2.500/1.000 + Geschwisterbonus + Zwillinge: (2393,92 − 897,50) × 65 % = 972,67 + 97,27 + 300 = 1.369,94 €;
//   Plus: Kern min(972,67, 1556,05 / 2 = 778,02) = 778,02 + 77,80 + 150 = 1.005,83 €
//  Teilzeit 1.100/700 + Bonus + Zwillinge: q = 67,1 % (997,50), (997,50 − 597,50) × 67,1 % = 268,40 -> 300 + 75 + 300 = 675 €; Plus: max(150, 268,40) = 268,40 + 37,50 + 150 = 455,90 €
const egX = (o) => T(Object.assign({ baby: 'bald', miete: 500, gebJahr: 1995, heute: 2026.8 }, o), 'elterngeld', 'eg.ja');
[
  ['[eg-mehrlinge] Zwillinge, 1.500 € netto', { egVor: 1500, egKinder: '2' }, 1218.31, 609.16],
  ['[eg-mehrlinge] Drillinge, 1.500 € netto', { egVor: 1500, egKinder: '3' }, 1518.31, 759.16],
  ['[eg-mehrlinge] Zwillinge ohne Einkommen: 300 + 300', { egVor: 0, egKinder: '2' }, 600, 300],
  ['[eg-mehrlinge] Drillinge, 3.000 € netto: Höchstbetrag 1.800 + 600', { egVor: 3000, egKinder: '3' }, 2400, 1200],
  ['[eg-teilzeit] Teilzeit 2.000 / 800', { egVor: 2000, egNach: 800 }, 794.16, 623.77],
  ['[eg-teilzeit] Teilzeit 1.200 / 500 (Satz 67 % nach dem Einkommen vorher)', { egVor: 1200, egNach: 500 }, 469, 367.66],
  ['[eg-teilzeit] Teilzeit: Netto nach = vor -> Mindestbetrag', { egVor: 2000, egNach: 2000 }, 300, 150],
  ['[eg-teilzeit] Teilzeit: Netto nach > vor -> Mindestbetrag', { egVor: 2000, egNach: 2500 }, 300, 150],
  ['[eg-teilzeit] Deckel 2.770 €: 4.000 / 1.000', { egVor: 4000, egNach: 1000 }, 1217.13, 900],
  ['[eg-teilzeit] Deckel 2.770 €: 6.000 / 1.000 gleich wie 4.000 / 1.000', { egVor: 6000, egNach: 1000 }, 1217.13, 900],
  ['[eg-teilzeit] Deckel 2.770 €: 4.000 / 2.900 -> Mindestbetrag', { egVor: 4000, egNach: 2900 }, 300, 150],
  ['[eg-teilzeit] [eg-mehrlinge] Teilzeit + Geschwisterbonus + Zwillinge 2.500 / 1.000', { egVor: 2500, egNach: 1000, egKinder: '2', kids: 2, kidsU6: 2 }, 1369.94, 1005.83],
  ['[eg-teilzeit] [eg-mehrlinge] Teilzeit + Bonus + Zwillinge, Mindestbeträge 1.100 / 700', { egVor: 1100, egNach: 700, egKinder: '2', kids: 2, kidsU6: 2 }, 675, 455.9]
].forEach(([name, o, basis, plus]) => { const x = egX(o); ck(name + ': Basis ' + basis + ' €, ElterngeldPlus ' + plus + ' €', x && x.basis === E(basis) && x.plus === E(plus), x); });
ck('[eg-teilzeit] Hinweise: Teilzeit eingerechnet bzw. Mindestbetrag, ElterngeldPlus-Obergrenze, ohne Netto danach Hinweis zum Eintragen',
  K({ baby: 'da', egVor: 2000, egNach: 800, miete: 500 }, 'elterngeld').includes('eg.teilzeit') && T({ baby: 'da', egVor: 2000, egNach: 800, miete: 500 }, 'elterngeld', 'eg.teilzeitPlus').halb === E(623.77)
  && K({ baby: 'da', egVor: 2000, egNach: 2500, miete: 500 }, 'elterngeld').includes('eg.teilzeitMin') && K({ baby: 'da', egVor: 2000, miete: 500 }, 'elterngeld').includes('eg.teilzeitOffen')
  && !K({ baby: 'da', egVor: 2000, miete: 500 }, 'elterngeld').includes('eg.teilzeit'));
ck('[eg-mehrlinge] Hinweise Mehrlingszuschlag (auch ohne Betrag); Baby da: Zwillinge zählen nicht als Geschwister (§ 2a Abs. 1 Satz 2)',
  T({ baby: 'bald', egVor: 1500, egKinder: '2', miete: 500 }, 'elterngeld', 'eg.mehrlinge').zuschlag === E(300) && K({ baby: 'bald', egVor: 1500, egKinder: '3', miete: 500 }, 'elterngeld').includes('eg.mehrlingeDrei')
  && K({ baby: 'bald', egKinder: '2', miete: 500 }, 'elterngeld').includes('eg.mehrlingeOhne')
  && !K({ baby: 'da', egVor: 1500, egKinder: '2', kids: 2, kidsU6: 2, miete: 500 }, 'elterngeld').some((k) => /geschwister/.test(k))
  && K({ baby: 'da', egVor: 1500, egKinder: '2', kids: 3, kidsU6: 3, miete: 500 }, 'elterngeld').includes('eg.geschwisterVielleicht'));
ck('Elterngeld ohne Kind: nein; ohne Betrag: möglich mit Spanne', L({ miete: 500 }, 'elterngeld') === 'nein' && L({ baby: 'da', miete: 500 }, 'elterngeld') === 'vielleicht' && K({ baby: 'da', miete: 500 }, 'elterngeld')[0] === 'eg.ohneBetrag');
ck('Elterngeld schon bezogen: na', L({ baby: 'da', einkommen: [{ art: 'eg', b: 400 }], miete: 500 }, 'elterngeld') === 'na');
// Hilfe zur Pflege: Einkommensgrenze 2 x 563 + Miete + 70 % von 563 je weiterer Person
ck('[hzp-voraus] Hilfe zur Pflege: ohne Pflegegrad nein', L({ miete: 500 }, 'hzp') === 'nein');
// § 85 Abs. 1 SGB XII: Heizkosten gehören zur Unterkunft (BSG 30.04.2020, B 8 SO 1/19 R), Familienzuschlag 70 % aufgerundet (394,10 -> 395 €)
ck('[hzp-grenze] Hilfe zur Pflege: Paar, Warmmiete 600 (davon Heizung 80, zählt mit), Grenze 2 x 563 + 600 + 395 (aufgerundet) = 2.121 €', (() => { const x = T({ adults: 2, pflegegrad: '4', art1: 'rente', brutto: 1500, netto: 1500, miete: 600, heizkosten: 80, vermoegen: 0, gebJahr: 1950, heute: 2026.8 }, 'hzp', 'hzp.unter'); const y = T({ adults: 2, pflegegrad: '4', art1: 'rente', brutto: 1500, netto: 1500, miete: 600, vermoegen: 0, gebJahr: 1950, heute: 2026.8 }, 'hzp', 'hzp.unter'); return x && y && x.grenze === E(2121) && y.grenze === E(2121); })());
ck('Hilfe zur Pflege: Einkommen über der Grenze -> Hinweis auf Eigenanteil', K({ pflegegrad: '3', art1: 'rente', brutto: 2500, netto: 2500, miete: 500, vermoegen: 0, gebJahr: 1950, heute: 2026.8 }, 'hzp')[0] === 'hzp.ueber');
ck('[hzp-verm] Hilfe zur Pflege: Vermögen über 10.000 € -> nein', L({ pflegegrad: '3', art1: 'rente', brutto: 900, netto: 900, miete: 500, vermoegen: 15000, gebJahr: 1950, heute: 2026.8 }, 'hzp') === 'nein');
// Asylbewerber: eigene Leistung, kein Grundsicherungsgeld, keine Grundsicherung im Alter, kein Kinderzuschlag (§ 7 Abs. 1 SGB II, § 23 Abs. 2 SGB XII); Wohngeld höchstens möglich (§ 7 Abs. 1 Satz 1 Nr. 8 WoGG); weitere Fälle: test/test-aufenthalt.js
const asyl = { adults: 2, kids: 2, art1: 'ohne', brutto: 0, netto: 0, miete: 700, vermoegen: 0, gebJahr: 1990, heute: 2026.8, aufenthalt: 'asyl' };
ck('[asyl-ja] Asyl: Asylbewerberleistungen ja', L(asyl, 'asylblg') === 'ja');
ck('[asyl-ausschluss] Asyl: Grundsicherungsgeld, Kinderzuschlag, Wohnberechtigungsschein nein; Wohngeld nie „wahrscheinlich“ (nur ohne AsylbLG-Bezug, § 7 Abs. 1 Satz 1 Nr. 8 WoGG)', L(asyl, 'ggeld') === 'nein' && K(asyl, 'ggeld')[0] === 'ggeld.asyl' && L(asyl, 'wohngeld') !== 'ja' && L(asyl, 'kiz') === 'nein' && L(asyl, 'wbs') === 'nein');
ck('Asyl im Rentenalter: keine Grundsicherung im Alter', L({ ...asyl, adults: 1, kids: 0, gebJahr: 1950 }, 'gsa') === 'nein');
ck('[kg-asyl] [eg-asyl] Asyl: Kindergeld und Elterngeld nur möglich (abhängig vom Aufenthaltstitel)', L(asyl, 'kindergeld') === 'vielleicht' && L({ ...asyl, baby: 'da', egVor: 0 }, 'elterngeld') === 'vielleicht');
ck('Ohne Asyl: Asylbewerberleistungen nein', L({ ...asyl, aufenthalt: '' }, 'asylblg') === 'nein');

// ---------- Blindenhilfe (§ 72 SGB XII) ----------
const blind = { bundesland: 'BY', art1: 'rente', brutto: 900, netto: 900, miete: 450, vermoegen: 0, gebJahr: 1960, heute: 2026.8, bhPerson: 'erwNach25', gdb: '100', blind: 'blind' };
ck('Blindenhilfe: blind, wenig Einkommen -> möglich, unter der Grenze 2 x 563 + 450 (Warmmiete, BSG B 8 SO 1/19 R) = 1.576 €', L(blind, 'blh') === 'vielleicht' && T(blind, 'blh', 'blh.unter') && T(blind, 'blh', 'blh.unter').grenze === E(2 * 563 + 450) && K(blind, 'blh').includes('blh.bayern'));
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
// Elterngeld 300 € (Mindestbetrag, kein Einkommen vorher): zählt voll, 1.063 - 270 = 793; 500 € mit Einkommen vorher: Basiselterngeld 300 frei,
// ElterngeldPlus nur 150 € (§ 10 Abs. 5 Satz 3 BEEG). Die App weiß nicht, welches: vorsichtig 150 € frei, 1.063 - 320 = 743 (Vollprüfung familie B3)
ck('[gg-eg300] Elterngeld 300 € zählt voll (etwa 790 €), 500 € vorsichtig mit 150 € frei (etwa 740 €)', A({ einkommen: [{ art: 'eg', b: 300 }], miete: 500 }, 'ggeld') === E(790) && A({ einkommen: [{ art: 'eg', b: 500 }], miete: 500 }, 'ggeld') === E(740));
// Alleinerziehend, 1 Kind, Miete 700: Unterhalt 2.000 € zählt nur bis zum Bedarf des Kindes (390 + 350 = 740). Das Kindergeld braucht das Kind dann
// nicht mehr: es zählt beim Elternteil, abzüglich 30 € Versicherungspauschale (§ 11 Abs. 1 Satz 5 SGB II; Vollprüfung 24.11.2026, Befunde B-03 / Fable 4)
ck('[gg-unterhalt] Hoher Unterhalt fürs Kind mindert bis zu dessen Bedarf, Kindergeld-Rest beim Elternteil, dazu 25 € Sofortzuschlag (§ 72 SGB II), aber nicht, wenn das Kind seinen Bedarf selbst deckt: 1.460 + 25 = etwa 1.490 €; 1.460 - 740 + 30 = etwa 750 €', A(ohne({ kids: 1, miete: 700 }), 'ggeld') === E(1490) && A(ohne({ kids: 1, miete: 700, unterhalt: 2000 }), 'ggeld') === E(750));
ck('[gg-verm] Schonvermögen: bis 30 Jahre 5.000 €, ab 50 Jahre 20.000 €, Paar doppelt', L(ohne({ miete: 400, vermoegen: 6000, alterGruppe: '<30' }), 'ggeld') === 'nein' && L(ohne({ miete: 400, vermoegen: 15000, alterGruppe: '50+' }), 'ggeld') !== 'nein' && L(ohne({ adults: 2, miete: 500, vermoegen: 19000, alterGruppe: '30-39' }), 'ggeld') !== 'nein');
ck('[gg-gemischt] Paar mit Kind, eine Person im Rentenalter: Jobcenter möglich (gemischte Bedarfsgemeinschaft)', L({ adults: 2, kids: 1, alter: true, miete: 700 }, 'ggeld') === 'vielleicht' && K({ adults: 2, kids: 1, alter: true, miete: 700 }, 'ggeld')[0] === 'ggeld.gemischt');
ck('[gg-schulbuch] Schulbücher: Hinweis außerhalb Bayerns, nicht in Bayern (Lernmittelfreiheit)', K({ kids: 1, miete: 600, art1: 'lohn', brutto: 1500, netto: 1150, bundesland: 'NW' }, 'ggeld').includes('ggeld.schulbuch') && !K({ kids: 1, miete: 600, art1: 'lohn', brutto: 1500, netto: 1150, bundesland: 'BY' }, 'ggeld').includes('ggeld.schulbuch'));
ck('[gg-kdu] Miete: Hinweis auf die örtliche Angemessenheit', K({ art1: 'lohn', brutto: 1000, netto: 1000, miete: 500 }, 'ggeld').includes('kdu.angemessen'));
ck('[gg-alter] Rentenalter oder volle Erwerbsminderung: Sozialamt zuständig', res({ alter: true, miete: 400 }).m.ggeld.hl === 'andereStelle' && res({ erwerbsgemindert: true, miete: 400 }).m.ggeld.hl === 'andereStelle');
// SGB XII
ck('[gsa-voraus] Ohne Rentenalter und ohne volle Erwerbsminderung: keine Grundsicherung im Alter', L({ miete: 450 }, 'gsa') === 'nein' && K({ miete: 450 }, 'gsa')[0] === 'gsa.voraus');
// Rente 900, Miete 450: ohne Freibetrag 1.013 - 900 = 113; mit § 82a: 100 + 30 % von 800 = 340, höchstens 281,50 -> 394,50
ck('[gsa-grundrente] Grundrentenfreibetrag höchstens 281,50 €: etwa 110 € -> etwa 390 €', A({ alter: true, art1: 'rente', brutto: 900, netto: 900, miete: 450 }, 'gsa') === E(110) && A({ alter: true, art1: 'rente', brutto: 900, netto: 900, miete: 450, grundrente33: true }, 'gsa') === E(390));
// § 6a Abs. 6 BKGG: anderes Einkommen der Eltern über ihrem Bedarf mindert den Kinderzuschlag voll, Arbeitseinkommen zu 45 %.
// Paar, Kinder 5 und 9, Wohnkosten 900 €: Bedarf der Eltern 2 × 506 + 71 % von 900 = 1.651 €.
const kizF = { adults: 2, kids: 2, kidsU6: 1, art2: 'ohne', miete: 900, bezug: { kindergeld: true } };
ck('[kiz-anderes] Arbeitslosengeld I 1.900 €: 1.870 € (nach 30 € Pauschale) über 1.651 € → 219 € voll angerechnet, etwa 380 € statt 500 €', A({ ...kizF, art1: 'alg', brutto: 1900, netto: 1900 }, 'kiz') === E(380), A({ ...kizF, art1: 'alg', brutto: 1900, netto: 1900 }, 'kiz'));
ck('[kiz-anderes] Lohn 2.500 € brutto / 1.900 € netto bleibt unter dem Bedarf: voller Kinderzuschlag etwa 590 €', A({ ...kizF, art1: 'lohn', brutto: 2500, netto: 1900 }, 'kiz') === E(590));
// § 6 Abs. 1 Nr. 1 Bürgergeld-V: Versicherungspauschale nicht zusätzlich zum Grundfreibetrag auf Arbeitseinkommen derselben Person
ck('[vpausch-person] Rente 720 € + Minijob 300 €: keine 30 € Pauschale neben dem Lohn, Grundsicherungsgeld etwa 180 €', A({ einkommen: [{ art: 'lohn', b: 300, n: 300 }, { art: 'rente', b: 800, n: 720 }], miete: 500, gebJahr: 1975 }, 'ggeld') === E(180), A({ einkommen: [{ art: 'lohn', b: 300, n: 300 }, { art: 'rente', b: 800, n: 720 }], miete: 500, gebJahr: 1975 }, 'ggeld'));
ck('[vpausch-person] nur Rente 1.020 €: Pauschale 30 € bleibt, etwa 70 €', A({ art1: 'rente', brutto: 1100, netto: 1020, miete: 500, gebJahr: 1975 }, 'ggeld') === E(70));
// § 82 Abs. 4 SGB XII: Betriebs-, Riester- oder private Rente (in der Rente enthalten): 100 € + 30 % des Rests frei, höchstens 281,50 €;
// der Grundrentenfreibetrag (§ 82a) gilt nur für den gesetzlichen Teil. Bedarf 563 + 450 = 1.013 €, Rente 900 € netto.
const zr = { alter: true, art1: 'rente', brutto: 1000, netto: 900, miete: 450 };
ck('[gsa-zusatzrente] 150 € Betriebsrente: 115 € frei, etwa 230 € statt 110 €', A({ ...zr, zusatzRente: 150 }, 'gsa') === E(230));
ck('[gsa-zusatzrente] 80 € Riester-Rente: ganz frei, etwa 190 €', A({ ...zr, zusatzRente: 80 }, 'gsa') === E(190));
ck('[gsa-zusatzrente] 900 € Betriebsrente: höchstens 281,50 € frei, etwa 390 €', A({ ...zr, zusatzRente: 900 }, 'gsa') === E(390));
ck('[gsa-zusatzrente] mit Grundrente: 281,50 € auf 750 € gesetzliche Rente + 115 €, etwa 510 €', A({ ...zr, zusatzRente: 150, grundrente33: true }, 'gsa') === E(510));
ck('[gsa-zusatzrente] mehr als die Rente eingetragen: nur bis zur Rente', A({ ...zr, zusatzRente: 5000 }, 'gsa') === A({ ...zr, zusatzRente: 900 }, 'gsa'));
ck('[gsa-zusatzrente] ohne Rente wirkungslos', A({ alter: true, art1: 'lohn', brutto: 1000, netto: 900, miete: 450 }, 'gsa') === A({ alter: true, art1: 'lohn', brutto: 1000, netto: 900, miete: 450, zusatzRente: 150 }, 'gsa'));
ck('[gsa-grundrente-klein] Rente 60 € mit Grundrente zählt wie kein Einkommen (Freibetrag höchstens so hoch wie die Rente)', A({ alter: true, art1: 'rente', brutto: 60, netto: 60, grundrente33: true, miete: 450 }, 'gsa') === A({ alter: true, art1: 'ohne', miete: 450 }, 'gsa'), [A({ alter: true, art1: 'rente', brutto: 60, netto: 60, grundrente33: true, miete: 450 }, 'gsa'), A({ alter: true, art1: 'ohne', miete: 450 }, 'gsa')]);
ck('[gsa-mb-ae] Voll erwerbsgemindert, alleinerziehend: Mehrbedarf mindestens 12 % (563 + 390 + 600 + 67,56)', P({ erwerbsgemindert: true, kids: 1, miete: 600 }, 'gsa', 'bedarf') === E(563 + 390 + 600 + 0.12 * 563));
ck('[gsa-pflegegeld] Pflegegeld ist kein Einkommen: Pflegegrad ändert die Grundsicherung nicht', A({ alter: true, art1: 'rente', brutto: 700, netto: 700, miete: 450 }, 'gsa') === A({ alter: true, art1: 'rente', brutto: 700, netto: 700, miete: 450, pflegegrad: '3' }, 'gsa'));
ck('[gsa-schwanger] Schwangerschaft: 563 + 450 + 95,71', P({ erwerbsgemindert: true, miete: 450, schwanger: true }, 'gsa', 'bedarf') === E(563 + 450 + 0.17 * 563));
ck('[gsa-warmwasser] Warmwasser: 563 x 2,3 % = 12,95', P({ alter: true, miete: 450, warmwasser: true }, 'gsa', 'bedarf') === E(563 + 450 + 0.023 * 563));
ck('[gsa-ernaehrung] Krankenkost: Hinweis und nur „mindestens“', K({ alter: true, miete: 450, ernaehrung: true }, 'gsa').includes('mehr.ernaehrung') && !!T({ alter: true, miete: 450, ernaehrung: true }, 'gsa', 'schaetz.mind'));
// Wohngeld
const wgT = (o) => JSON.stringify(res({ miete: 650, mietstufe: 3, vermoegen: 0, ...o }).m.wohngeld.tx);
const lohn = [{ art: 'lohn', b: 1400, n: 1100 }];
// Elterngeld bis 300 € frei, bei ElterngeldPlus 150 € (§ 10 Abs. 1, 3 BEEG). Unter 300 € ist es sicher ElterngeldPlus; die App fragt nicht, welches (Vollprüfung familie B3)
ck('[wg-eg300] Elterngeld: 150 € ändern nichts (ElterngeldPlus frei), 250 € schon (Plus: nur 150 € frei), 1.200 € (sicher Basiselterngeld) schon', wgT({ einkommen: lohn.concat([{ art: 'eg', b: 150 }]) }) === wgT({ einkommen: lohn }) && wgT({ einkommen: lohn.concat([{ art: 'eg', b: 250 }]) }) !== wgT({ einkommen: lohn }) && wgT({ einkommen: lohn.concat([{ art: 'eg', b: 1200 }]) }) !== wgT({ einkommen: lohn }));
// Schon laufendes Elterngeld bei Mehrlingen (§ 10 Abs. 4 und 5 BEEG, gesetze-im-internet.de/beeg/__10.html; Richtlinien zum BEEG 07/2026 Nr. 10.4:
// „bei Drillingen ... 900 Euro monatlich frei“, Nr. 10.5.2: bei SGB II, SGB XII, Kinderzuschlag keine Vervielfachung; abgerufen 21.11.2026).
// Erwartung aus dem Gesetz: Wohngeld: Zwillinge 600 € und Drillinge 900 € Elterngeld sind kein Einkommen. Grundsicherungsgeld: 600 € bei Zwillingen sind
// Mindestbetrag plus Mehrlingszuschlag (kein Einkommen vor der Geburt) und zählen voll; von 900 € bleiben 300 € frei, es zählen ebenfalls 600 €.
{
  const zw = { baby: 'da', egKinder: '2', kids: 2, kidsU6: 2 }, dr = { baby: 'da', egKinder: '3', kids: 3, kidsU6: 3 };
  const mitEg = (b) => lohn.concat([{ art: 'eg', b }]);
  ck('[eg-mehrlinge-frei] Wohngeld: Elterngeld bei Zwillingen bis 600 €, bei Drillingen bis 900 € kein Einkommen; darüber und ohne Mehrlinge schon',
    // Unter dem Mindestbetrag des Basiselterngelds (Zwillinge 600 €, Drillinge 900 €) ist es sicher ElterngeldPlus: frei 150 € je Kind (§ 10 Abs. 3, 4 BEEG)
    wgT({ ...zw, einkommen: mitEg(300) }) === wgT({ ...zw, einkommen: lohn }) && wgT({ ...dr, einkommen: mitEg(450) }) === wgT({ ...dr, einkommen: lohn })
    // Über dem höchsten ElterngeldPlus sicher Basiselterngeld: Zwillinge 1.300 € (600 frei) wie ein Kind 1.000 € (300 frei)
    && wgT({ ...zw, einkommen: mitEg(1300) }) === wgT({ ...zw, egKinder: '', einkommen: mitEg(1000) }) && wgT({ ...zw, einkommen: mitEg(1300) }) !== wgT({ ...zw, einkommen: lohn })
    && wgT({ ...zw, baby: 'bald', einkommen: mitEg(600) }) === wgT({ ...zw, baby: 'bald', egKinder: '', einkommen: mitEg(600) }));
  const gg = (o, b) => JSON.stringify(A({ ...o, einkommen: [{ art: 'eg', b }], miete: 500 }, 'ggeld'));
  // Vorsichtig (ElterngeldPlus möglich) 150 € frei, nicht vervielfacht (§ 10 Abs. 5 BEEG; Vollprüfung familie B2, B3)
  ck('[eg-mehrlinge-frei] Grundsicherungsgeld: 600 € Elterngeld bei Zwillingen zählen voll (wie 750 € mit 150 € Freibetrag), Freibetrag nicht vervielfacht',
    gg(zw, 600) === gg(zw, 750) && gg(zw, 600) !== gg(zw, 601) && gg(zw, 1000) !== gg(zw, 900) && gg(dr, 900) === gg(dr, 1050), [gg(zw, 600), gg(zw, 750), gg(zw, 601)]);
  ck('[eg-teilzeit] Hinweis auf höchstens 32 Wochenstunden nur mit Arbeit nach der Geburt (§ 1 Abs. 6 Nr. 1 BEEG)',
    K({ baby: 'da', egVor: 2000, egNach: 2500, miete: 500 }, 'elterngeld').includes('eg.teilzeitStunden') && K({ baby: 'da', egVor: 2000, egNach: 800, miete: 500 }, 'elterngeld').includes('eg.teilzeitStunden')
    && !K({ baby: 'da', egVor: 2000, miete: 500 }, 'elterngeld').includes('eg.teilzeitStunden'));
}
ck('[wg-keinEink] Pflegegeld ist kein Einkommen: Pflegegrad ändert das Wohngeld nicht', wgT({ art1: 'lohn', brutto: 1700, netto: 1300 }) === wgT({ art1: 'lohn', brutto: 1700, netto: 1300, pflegegrad: '3' }));
const wgKE = { adults: 2, young: 1, art1: 'lohn', brutto: 2700, netto: 2000 };
ck('[wg-kindeink] Einkommen des Kindes: bis 202,50 € im Monat frei (Pauschbetrag 102,50 € + Freibetrag 100 €), 500 € mindern', wgT(wgKE) === wgT({ ...wgKE, kindEink: 100 }) && wgT(wgKE) === wgT({ ...wgKE, kindEink: 202 }) && wgT(wgKE) !== wgT({ ...wgKE, kindEink: 500 }));
ck('[wg-verm] Vermögen: 60.000 € allein erlaubt, 60.001 € nicht; Paar 90.000 €', L({ art1: 'lohn', brutto: 1500, netto: 1150, miete: 650, mietstufe: 3, vermoegen: 60000 }, 'wohngeld') !== 'nein' && L({ art1: 'lohn', brutto: 1500, netto: 1150, miete: 650, mietstufe: 3, vermoegen: 60001 }, 'wohngeld') === 'nein' && L({ adults: 2, art1: 'lohn', brutto: 1500, netto: 1150, miete: 650, mietstufe: 3, vermoegen: 90001 }, 'wohngeld') === 'nein');
ck('[wg-ausschluss] Bei Grundsicherungsgeld oder Grundsicherung kein Wohngeld', K({ brutto: 1500, netto: 1150, miete: 650, bezug: { grundsicherungsgeld: true } }, 'wohngeld')[0] === 'wohngeld.ausschluss' && K({ brutto: 1500, netto: 1150, miete: 650, bezug: { sozialamt: true } }, 'wohngeld')[0] === 'wohngeld.ausschluss');
// Kinderzuschlag
const kizT = { adults: 2, kids: 2, art1: 'lohn', brutto: 3000, netto: 2300, miete: 900, mietstufe: 3, vermoegen: 0 };
const zahl = (x) => Number(String(x).replace(/\D/g, ''));
ck('[kiz-mehr] Mehrbedarfe der Eltern (Schwangerschaft, Warmwasser) erhöhen den Kinderzuschlag', zahl(A({ ...kizT, schwanger: true }, 'kiz')) > zahl(A(kizT, 'kiz')) && zahl(A({ ...kizT, warmwasser: true }, 'kiz')) > zahl(A(kizT, 'kiz')));
// Kindergeld, Bildung und Teilhabe, Unterhaltsvorschuss, BAföG
ck('[kg-mehr] Kindergeld: Hinweis auf arbeitsuchend gemeldete Kinder bis 21, Freiwilligendienst, Übergangszeit, 20-Stunden-Grenze', K({ kids: 1 }, 'kindergeld').includes('kindergeld.mehr') && K({}, 'kindergeld').includes('kindergeld.mehr'));
ck('[kgbeh-25] Kindergeld für Kinder mit Behinderung: nur wenn die Behinderung vor 25 eingetreten ist', L({ bhPerson: 'erwNach25' }, 'kgBeh') === 'nein' && K({ bhPerson: 'erwNach25' }, 'kgBeh')[0] === 'kgBeh.nach25');
ck('[but-bezug] Bildung und Teilhabe mit Wohngeld, Kinderzuschlag, Grundsicherung', ['wohngeld', 'kiz', 'grundsicherungsgeld', 'sozialamt'].every((b) => L({ kids: 1, bezug: { [b]: true } }, 'but') === 'ja'));
ck('[but-inhalt] Schulbedarf 195 € und Teilhabe 15 €; Kinder unter 6 nur Teilhabe', T({ kids: 1, bezug: { wohngeld: true } }, 'but', 'but.inhalt').schul === E(195) && T({ kids: 1, bezug: { wohngeld: true } }, 'but', 'but.inhalt').teil === E(15) && !!T({ kids: 1, kidsU6: 1, bezug: { wohngeld: true } }, 'but', 'but.inhaltKlein'));
ck('[but-azubi] Junger Erwachsener in betrieblicher Ausbildung: keine Bildung und Teilhabe', L({ young: 1, ausbildung: 'kindBetrieb', bezug: { wohngeld: true } }, 'but') === 'nein');
ck('[uvg-anrechnung] Unterhalt 100 € wird angerechnet (nur möglich), 400 € reicht (nein)', L({ kids: 1, brutto: 1500, unterhaltFehlt: true, unterhalt: 100 }, 'uvg') === 'vielleicht' && L({ kids: 1, brutto: 1500, unterhaltFehlt: true, unterhalt: 400 }, 'uvg') === 'nein');
ck('[uvg-ab12] Kind ab 12: mit 400 € brutto nur möglich, mit 700 € wahrscheinlich (Grenze 600 €)', L({ kids: 1, brutto: 400, unterhaltFehlt: true, kinder12: true }, 'uvg') === 'vielleicht' && L({ kids: 1, brutto: 700, unterhaltFehlt: true, kinder12: true }, 'uvg') === 'ja');
ck('[uvg-paar] Zwei Erwachsene im Haushalt: nur möglich (Heirat schließt aus)', L({ adults: 2, kids: 1, unterhaltFehlt: true }, 'uvg') === 'vielleicht' && K({ adults: 2, kids: 1, unterhaltFehlt: true }, 'uvg')[0] === 'uvg.zwei');
// Unterhaltsvorschuss: alle Fälle des UVG (Stand November 2026, gesetze-im-internet.de/uhvorschg; familienportal.de)
const uv = (o) => ({ kids: 1, brutto: 1500, netto: 1200, miete: 700, unterhaltFehlt: true, ...o });
// Amtliche Herleitung (BMBFSFJ, Einlegeblatt Leistungen für Alleinerziehende 2026): Mindestunterhalt 486/558/653 € minus Kindergeld 259 €
ck('[uvg-amtlich] Beträge 2026 = Mindestunterhalt minus volles Kindergeld (486 − 259, 558 − 259, 653 − 259)', P(uv({}), 'uvg', 'a') === E(486 - 259) && P(uv({}), 'uvg', 'b') === E(558 - 259) && P(uv({}), 'uvg', 'c') === E(653 - 259));
ck('[uvg-partner] Neue Partnerschaft ohne Trauschein: Anspruch bleibt (wahrscheinlich), Einkommen des Partners zählt nicht für die Grenze ab 12',
  L(uv({ adults: 2, brutto: 2500, brutto2: 1000, uvgPartner: 'neu' }), 'uvg') === 'ja' && L(uv({ adults: 2, kinder12: true, kids14: 1, brutto: 2500, brutto2: 2000, uvgPartner: 'neu' }), 'uvg') !== 'nein');
ck('[uvg-stiefelternteil] Mit dem neuen Partner verheiratet oder verpartnert: kein Anspruch (§ 1 Abs. 1 Nr. 2 UVG)', L(uv({ adults: 2, brutto: 2500, brutto2: 1000, uvgPartner: 'ehe' }), 'uvg') === 'nein' && K(uv({ adults: 2, uvgPartner: 'ehe' }), 'uvg')[0] === 'uvg.ehe');
ck('[uvg-elternteil] Lebt mit dem anderen Elternteil zusammen: kein Anspruch (§ 1 Abs. 3 UVG)', L(uv({ adults: 2, uvgPartner: 'eltern' }), 'uvg') === 'nein' && K(uv({ adults: 2, uvgPartner: 'eltern' }), 'uvg')[0] === 'uvg.elternteil');
ck('[uvg-wechsel] Wechselmodell (40 % beim anderen Elternteil): ein Kind nein, mehrere Kinder nur möglich', L(uv({ uvgWechsel: true }), 'uvg') === 'nein' && K(uv({ uvgWechsel: true }), 'uvg')[0] === 'uvg.wechsel' && L(uv({ kids: 2, uvgWechsel: true }), 'uvg') === 'vielleicht' && K(uv({ kids: 2, uvgWechsel: true }), 'uvg')[0] === 'uvg.wechselMehr');
ck('[uvg-waise] Halbwaisenrente wird angerechnet: Kind 6 bis 11 mit 150 € möglich, mit 300 € (≥ 299 €) nein; Kind 14 mit 300 € (< 394 €) möglich',
  L(uv({ waisen: 150 }), 'uvg') === 'vielleicht' && K(uv({ waisen: 150 }), 'uvg')[0] === 'uvg.teilW' && L(uv({ waisen: 300 }), 'uvg') === 'nein' && K(uv({ waisen: 300 }), 'uvg')[0] === 'uvg.genugW'
  && L(uv({ waisen: 300, kids14: 1, kinder12: true }), 'uvg') === 'vielleicht');
ck('[uvg-waise] Unterhalt und Waisenrente zusammen angerechnet: 200 € + 100 € ≥ 299 € -> nein', L(uv({ unterhalt: 200, waisen: 100 }), 'uvg') === 'nein');
ck('[uvg-waise] Waisenrente zählt bei Wohngeld, Kinderzuschlag und Grundsicherungsgeld als Einkommen der Kinder und mindert den geschätzten Unterhaltsvorschuss', R.derive({ kids: 1, waisen: 200, unterhalt: 50 }).kindZahl === 250 && R.derive(uv({ waisen: 100 })).uvgEst === 299 - 100 && R.derive(uv({ waisen: 100 })).kindZahl === 299);
// Waisenrente eingetragen, Haken „Unterhalt fehlt/gestorben“ vergessen: Waisenrente deutet auf einen verstorbenen Elternteil (§ 1 Abs. 1 Nr. 3 b UVG)
ck('[uvg-witwe] Waisenrente ohne Haken: möglich mit Hinweis auf den Haken; ohne Waisenrente nein; reicht die Waisenrente, nein',
  L(uv({ unterhaltFehlt: false, waisen: 150 }), 'uvg') === 'vielleicht' && K(uv({ unterhaltFehlt: false, waisen: 150 }), 'uvg')[0] === 'uvg.waisenHaken'
  && L(uv({ unterhaltFehlt: false }), 'uvg') === 'nein' && K(uv({ unterhaltFehlt: false }), 'uvg')[0] === 'uvg.unterhalt'
  && L(uv({ unterhaltFehlt: false, waisen: 300 }), 'uvg') === 'nein' && K(uv({ unterhaltFehlt: false, waisen: 300 }), 'uvg')[0] === 'uvg.genugW');
ck('[uvg-ab12] Hinweis ab 12 auch, wenn Unterhalt oder Waisenrente angerechnet wird (unter 600 € brutto), sonst nicht',
  K(uv({ waisen: 100, kinder12: true, brutto: 400, netto: 380 }), 'uvg').includes('uvg.ab12') && !K(uv({ waisen: 100, kinder12: true, brutto: 700, netto: 600 }), 'uvg').includes('uvg.ab12'));
// § 2 Abs. 4 UVG, von Hand: Azubi-Vergütung 990 € -> (990 − 102,50 − 100) / 2 = 393,75 € < 394 € (möglich); 991 € -> 394,25 € (nein)
const uvAzubi = (e) => uv({ kids14: 1, kinder12: true, ausbildung: 'kindBetrieb', kindEink: e });
ck('[uvg-kindeink] Kind (14-17) in Ausbildung: eigenes Einkommen zur Hälfte nach Abzug von 102,50 € und 100 € angerechnet (990 € möglich, 991 € nein)',
  L(uvAzubi(990), 'uvg') === 'vielleicht' && K(uvAzubi(990), 'uvg')[0] === 'uvg.kindEink' && L(uvAzubi(991), 'uvg') === 'nein' && K(uvAzubi(991), 'uvg')[0] === 'uvg.kindEinkGenug' && L(uvAzubi(100), 'uvg') === 'ja');
ck('[uvg-kindeink] Kinder unter 14 (Schulpflicht): Minijob zählt nicht; Kind 14-17, Schule unbekannt: nur möglich mit Hinweis',
  L(uv({ kindEink: 300 }), 'uvg') === 'ja' && !K(uv({ kindEink: 300 }), 'uvg').includes('uvg.kindEink') && L(uv({ kids14: 1, kinder12: true, kindEink: 300 }), 'uvg') === 'vielleicht' && K(uv({ kids14: 1, kinder12: true, kindEink: 300 }), 'uvg').includes('uvg.kindEink'));
ck('[uvg-kindeink] Mehrere Kinder: Einkommen eines älteren Kindes mindert nur dessen Betrag (Hinweis, Einstufung bleibt)', L(uv({ kids: 2, kids14: 1, kinder12: true, kindEink: 800 }), 'uvg') === 'ja' && K(uv({ kids: 2, kids14: 1, kinder12: true, kindEink: 800 }), 'uvg').includes('uvg.kindEink'));
ck('[uvg-kindeink] Azubi-Einkommen mindert den geschätzten Unterhaltsvorschuss (Einkommen der Kinder für andere Leistungen)', R.derive(uvAzubi(600)).uvgEst === 394 - (600 - 102.5 - 100) / 2 && R.derive(uvAzubi(2000)).uvgEst === 0);
// Kind von 12 oder 13 (Haken „ab 12“, kein Kind von 14 bis 17): dritte Altersstufe 394 € statt 299 € (§ 2 Abs. 1 UVG, § 1612a Abs. 1 Satz 3 Nr. 3 BGB;
// Abgleich Runde 2, H1, UVG-RL 2.3: Kinder 13 und 8); ohne 600 € eigenes Einkommen nichts für dieses Kind (§ 1 Abs. 1a UVG)
{ const est = (o) => R.derive(uv(o)).uvgEst;
  ck('[uvg-zwoelf] Geschätzter Unterhaltsvorschuss: ein Kind 6-13 mit Haken ab 12 = 394 €; zwei Kinder 6-13 mit Haken = 299 + 394 €; mit Kind 14-17 bleibt das jüngere bei 299 €; unter 600 € brutto ohne das ältere Kind',
    est({ kinder12: true, brutto: 1500, netto: 1200 }) === 394 && est({ kids: 2, kinder12: true, brutto: 1500, netto: 1200 }) === 299 + 394 && est({ kids: 2, kids14: 1, kinder12: true, brutto: 1500, netto: 1200 }) === 299 + 394
    && est({ kids: 2, kidsU6: 1, kinder12: true, brutto: 1500, netto: 1200 }) === 227 + 394 && est({ kids: 2, kinder12: true, brutto: 400, netto: 380 }) === 299 && est({ kids: 2, brutto: 1500, netto: 1200 }) === 2 * 299,
    [est({ kinder12: true, brutto: 1500, netto: 1200 }), est({ kids: 2, kinder12: true, brutto: 1500, netto: 1200 }), est({ kids: 2, kinder12: true, brutto: 400, netto: 380 })].join(' ')); }
// Texte nach Prüfung Richtigkeit 21.11.2026 (Nr. 12, 15, 16): § 6b Abs. 2a BKGG, § 7c Abs. 1 SGB XI, RBeitrStV (gesetze-bayern.de)
{ const fs = require('fs'), pth = require('path'), LANG = pth.join(__dirname, '..', 'src', 'lang');
  const de = JSON.parse(fs.readFileSync(pth.join(LANG, 'de.json'), 'utf8'));
  ck('[but-verjaehrung] Verjährung nur mit Wohngeld oder Kinderzuschlag, zwölf Monate, ohne „etwa“', /Wohngeld oder Kinderzuschlag/.test(de['s.but.tip']) && /zwölf Monate/.test(de['s.but.tip']) && !/etwa/.test(de['s.but.tip']), de['s.but.tip']);
  ck('[pu-stuetzpunkt] Pflegestützpunkt nur „wo es ihn gibt“', /wo es ihn gibt/.test(de['pu.tipp.beratung']), de['pu.tipp.beratung']);
  const alle = [];
  (function lauf(d) { fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const f = pth.join(d, e.name); if (e.isDirectory()) lauf(f); else if (/\.json$/.test(e.name) && /RBStV/.test(fs.readFileSync(f, 'utf8'))) alle.push(pth.relative(LANG, f)); }); })(LANG);
  ck('[rf-abk] Rundfunkbeitragsstaatsvertrag überall als RBeitrStV (auch Rechtsgrundlage der Karte)', alle.length === 0 && /RBeitrStV/.test(R.RECHT.rundfunk), alle.join(', ')); }
ck('[uvg-rueckwirkung] Hinweis: rückwirkend höchstens ein Monat (§ 4 UVG), nur bei möglichem Anspruch', K(uv({}), 'uvg').includes('uvg.frist') && K(uv({ unterhalt: 100 }), 'uvg').includes('uvg.frist') && !K(uv({ unterhalt: 400 }), 'uvg').includes('uvg.frist'));
ck('[uvg-mitwirkung] Hinweis: Angaben zum anderen Elternteil und Mitwirkung bei der Vaterschaft (§ 1 Abs. 3 UVG)', K(uv({}), 'uvg').includes('uvg.mitwirken'));
ck('[uvg-aufenthalt] Asylverfahren oder Duldung: nur möglich mit Hinweis (deutsches Kind, eigener Titel des Kindes oder Beschäftigungsduldung, § 1 Abs. 2a UVG); geschätzter Betrag bleibt; ohne EU-Pass Hinweis auf Aufenthaltstitel, EU-Bürger ohne',
  L(uv({ aufenthalt: 'asyl' }), 'uvg') === 'vielleicht' && K(uv({ aufenthalt: 'asyl' }), 'uvg')[0] === 'uvg.asyl' && R.derive(uv({ aufenthalt: 'asyl' })).uvgEst === 299
  && L(uv({ aufenthalt: 'asyl', unterhalt: 400 }), 'uvg') === 'nein' && K(uv({}), 'uvg').includes('uvg.titel') && !K(uv({ aufenthalt: 'eu' }), 'uvg').includes('uvg.titel') && !K(uv({ aufenthalt: 'asyl' }), 'uvg').includes('uvg.titel'));
// Handbeispiele zu den korrigierten Fällen (von Hand nach dem Gesetz, nicht aus der App)
// Mutter mit Duldung, Kind 4 Jahre mit deutscher Staatsangehörigkeit (Vater deutsch, zahlt nicht): Anspruch des Kindes besteht -> nicht ausgeschlossen
ck('[uvg-hand] Geduldete Mutter, deutsches Kind (4 Jahre), Vater zahlt nicht: möglich, nie unwahrscheinlich', L(uv({ aufenthalt: 'asyl', kidsU6: 1, brutto: 0, netto: 0 }), 'uvg') === 'vielleicht');
// Zwei Kinder (3 und 9), verschiedene Väter: Vater des 9-Jährigen zahlt 600 €, Vater des 3-Jährigen nichts -> 227 € für das jüngere Kind
ck('[uvg-hand] Zwei Kinder, verschiedene Väter, einer zahlt 600 € (mehr als beide Sätze zusammen 526 €): trotzdem möglich (§ 2 Abs. 3 je Kind)', L(uv({ kids: 2, kidsU6: 1, unterhalt: 600 }), 'uvg') === 'vielleicht' && K(uv({ kids: 2, kidsU6: 1, unterhalt: 600 }), 'uvg')[0] === 'uvg.teil');
// Zwei Kinder (7 und 10), Halbwaisenrente nur für ein Kind (Vater gestorben) 650 €, Vater des anderen Kindes zahlt nicht
ck('[uvg-hand] Zwei Kinder, Halbwaisenrente 650 € für eines, anderes ohne Unterhalt: möglich', L(uv({ kids: 2, waisen: 650 }), 'uvg') === 'vielleicht' && K(uv({ kids: 2, waisen: 650 }), 'uvg')[0] === 'uvg.teilW');
// Zwei Kinder, die Mutter lebt mit dem Vater des jüngeren zusammen: für das ältere (anderer Vater) besteht der Anspruch weiter
ck('[uvg-elternteil] Mehrere Kinder, lebt mit dem Vater eines Kindes zusammen: möglich, Hinweis „nur gemeinsame Kinder“', L(uv({ kids: 2, adults: 2, uvgPartner: 'eltern' }), 'uvg') === 'vielleicht' && K(uv({ kids: 2, adults: 2, uvgPartner: 'eltern' }), 'uvg')[0] === 'uvg.elternteilMehr');
// Mutter studiert (kein Grundsicherungsgeld wegen § 7 Abs. 5 SGB II), Kind 13, Einkommen 400 €: Kind kann Sozialgeld beziehen -> nur möglich
{
  const st = uv({ kinder12: true, brutto: 400, netto: 400, ausbildung: 'ich', gebJahr: 2000, heute: 2026.8 });
  // Seit 24.11.2026 (Befund Fable 2): Grundsicherungsgeld-Karte „möglich“ (das Kind hat eigenen Anspruch), ohne Betrag
  ck('[uvg-ab12] Elternteil im Studium, Kind 13, 400 € Einkommen: Grundsicherungsgeld nur fürs Kind -> UVG nur möglich', L(st, 'ggeld') === 'vielleicht' && K(st, 'ggeld')[0] === 'ggeld.ausbildungFamilie' && L(st, 'uvg') === 'vielleicht');
}
ck('[uvg-hinweise] Hinweise: Änderungen melden (§§ 5, 6 UVG); verheiratet, aber dauernd getrennt (auch Klinik oder Haft, § 1 Abs. 2) bei Alleinlebenden', K(uv({}), 'uvg').includes('uvg.melden') && K(uv({}), 'uvg').includes('uvg.getrennt') && !K(uv({ adults: 2, uvgPartner: 'neu' }), 'uvg').includes('uvg.getrennt'));
ck('[uvg-volljaehrig] Nur volljährige Kinder: kein Unterhaltsvorschuss, Hinweis auf Unterhalt, Jugendamt bis 21, BAföG', L({ young: 1 }, 'uvg') === 'nein' && K({ young: 1 }, 'uvg')[0] === 'uvg.volljaehrig' && K({}, 'uvg')[0] === 'uvg.keinKind');
{
  // § 1 Abs. 1a Nr. 1: Kind ab 12 ohne Grundsicherungsgeld (hier: Vermögen über dem Schonvermögen) -> wahrscheinlich, auch unter 600 €
  const o = uv({ kinder12: true, kids14: 1, brutto: 400, netto: 400, vermoegen: 60000 });
  ck('[uvg-ab12] Kind ab 12, Elternteil unter 600 €, aber kein Grundsicherungsgeld: wahrscheinlich (§ 1 Abs. 1a Nr. 1)', L(o, 'ggeld') === 'nein' && L(o, 'uvg') === 'ja');
  ck('[uvg-ab12] Kind ab 12, Elternteil unter 600 €, Grundsicherungsgeld wird bezogen: nur möglich', L(uv({ kinder12: true, kids14: 1, brutto: 400, netto: 400, bezug: { grundsicherungsgeld: true } }), 'uvg') === 'vielleicht');
}
ck('[uvg-anrechnung] Höchstbetrag nach Alter: Kind unter 6 mit 230 € Unterhalt nein (≥ 227 €), Kind 6-11 mit 230 € möglich', L(uv({ kidsU6: 1, unterhalt: 230 }), 'uvg') === 'nein' && L(uv({ unterhalt: 230 }), 'uvg') === 'vielleicht');
ck('[uvg-einkommen] Unterhaltsvorschuss zählt bei neuer Partnerschaft ohne Trauschein als Einkommen der Kinder, bei Heirat nicht', R.derive(uv({ adults: 2, uvgPartner: 'neu' })).uvgEst === 299 && R.derive(uv({ adults: 2, uvgPartner: 'ehe' })).uvgEst === 0 && R.derive(uv({ adults: 2 })).uvgEst === 0);
ck('[bafoeg-verm] BAföG-Vermögen: unter 30 Jahren 15.000 € frei, darüber mindert nur der Rest (§ 30)', L({ ausbildung: 'ich', alterGruppe: '<30', vermoegen: 16000 }, 'bafoeg') === 'vielleicht' && K({ ausbildung: 'ich', alterGruppe: '<30', vermoegen: 16000 }, 'bafoeg')[0] === 'bafoeg.vermTeil' && L({ ausbildung: 'ich', alterGruppe: '<30', vermoegen: 30000 }, 'bafoeg') === 'nein' && L({ ausbildung: 'ich', alterGruppe: '<30', vermoegen: 14000 }, 'bafoeg') === 'vielleicht');
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
ck('[bg-betrag] Blindengeld Bayern 809 €, Sehbehindertengeld 242,70 €', P({ bundesland: 'BY', blind: 'blind', bhPerson: 'erwNach25' }, 'blindengeld', 'betrag') === '809 €' && P({ bundesland: 'BY', blind: 'hoch', bhPerson: 'erwNach25' }, 'blindengeld', 'betrag') === '242,70 €');
// Pflegegrad 2: 46 % von 347 € = 159,62 €; 809 - 159,62 = 649,38 €
ck('[bg-pflege] Pflegegeld wird angerechnet: Pflegegrad 2 46 % = 159,62 €, Rest 649,38 €', T({ bundesland: 'BY', blind: 'blind', bhPerson: 'erwNach25', pflegegrad: '2' }, 'blindengeld', 'blindengeld.pflege').kuerz === '159,62 €' && T({ bundesland: 'BY', blind: 'blind', bhPerson: 'erwNach25', pflegegrad: '2' }, 'blindengeld', 'blindengeld.pflege').rest === '649,38 €');
ck('[bg-land] Landesblindengeld in anderen Ländern: blind wahrscheinlich mit Spanne 350 bis 952 €, Sehbehinderung nur möglich, Pflegegeld-Hinweis', L({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'NW' }, 'blindengeld') === 'ja' && T({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'NW' }, 'blindengeld', 'blindengeld.landJa').von === E(350) && T({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'TH' }, 'blindengeld', 'blindengeld.landJa').bis === E(952) && L({ blind: 'hoch', bhPerson: 'erwNach25', bundesland: 'HE' }, 'blindengeld') === 'vielleicht' && K({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'BE', pflegegrad: '3' }, 'blindengeld').includes('blindengeld.pflegeLand'));
// Belegte Landesbeträge (Prüfung 26.11.2026): BW 410, BE 80 % von 951,92 = 761,54, HE 86 % von 951,92 = 818,65, MV 430, NI 450, RP 410, SN 380, SH 350; übrige Länder Spanne
{
  const LB = (bl) => { const t = T({ blind: 'blind', bhPerson: 'erwNach25', bundesland: bl }, 'blindengeld', 'blindengeld.landBetrag'); return t ? t.betrag : null; };
  ck('[bg-land-betrag] Landesblindengeld mit belegtem Betrag: BW 410 €, BE 761,54 €, HE 818,65 €, MV 430 €, NI 450 €, RP 410 €, SN 380 €, SH 350 €',
    LB('BW') === '410 €' && LB('BE') === '761,54 €' && LB('HE') === '818,65 €' && LB('MV') === '430 €' && LB('NI') === '450 €' && LB('RP') === '410 €' && LB('SN') === '380 €' && LB('SH') === '350 €', ['BW', 'BE', 'HE', 'MV', 'NI', 'RP', 'SN', 'SH'].map(LB).join(' '));
  ck('[bg-land-betrag] Länder ohne belegten Betrag weiter mit Spanne (NW, BB, HB, HH, SL, ST, TH)', ['NW', 'BB', 'HB', 'HH', 'SL', 'ST', 'TH'].every((bl) => LB(bl) === null && T({ blind: 'blind', bhPerson: 'erwNach25', bundesland: bl }, 'blindengeld', 'blindengeld.landJa')));
}
// Ohne Bundesland seit 24.11.2026 Spanne, der bayerische Betrag nur als Beispiel (Vollprüfung F8; Landesleistung nur mit Wohnsitz im Land)
ck('[bg-land] In Bayern der genaue Betrag (809 €); ohne Bundesland Spanne und 809 € nur als Beispiel', P({ blind: 'blind', bhPerson: 'erwNach25', bundesland: 'BY' }, 'blindengeld', 'betrag') === '809 €' && K({ blind: 'blind', bhPerson: 'erwNach25' }, 'blindengeld')[0] === 'blindengeld.landJa' && T({ blind: 'blind', bhPerson: 'erwNach25' }, 'blindengeld', 'blindengeld.ohneLand').betrag === '809 €');
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
// 3.000 € brutto: 70 % = 2.100, 90 % netto (60 % bis Steuerklasse III 2.327,17 €) = 1.620-2.094,45, kleinerer Wert, minus 12,5 % -> 1.417,50 bis 1.832,64
const kvT = { arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 3000 };
ck('[kv-kg] Krankengeld bei 3.000 € brutto: etwa 1.420 bis 1.830 €', T(kvT, 'krankengeld', 'schaetz.spanne').a === E(1420) && T(kvT, 'krankengeld', 'schaetz.spanne').b === E(1830));
ck('[kv-78] Erste 6 Wochen Lohnfortzahlung, Krankengeld bis 78 Wochen', K({ ...kvT, krankWochen: 'unter6' }, 'krankengeld')[0] === 'krank.lfz' && K(kvT, 'krankengeld').includes('krank.78'));
ck('[kv-minijob] Minijob: kein Krankengeld', L({ ...kvT, lohnVorher: 500 }, 'krankengeld') === 'nein');
ck('[kv-zuzahl] Chronisch krank ab GdB 60 oder Pflegegrad 3: 1 %-Grenze; GdB 50 ohne', K({ gdb: '60', bhPerson: 'erwNach25' }, 'zuzahl').includes('zuzahl.chron') && K({ pflegegrad: '3' }, 'zuzahl').includes('zuzahl.chron') && !K({ gdb: '50', bhPerson: 'erwNach25' }, 'zuzahl').includes('zuzahl.chron'));
ck('[kv-fahrt] Fahrtkosten-Hinweis bei H oder Pflegegrad 3, nicht bei GdB 60 allein', K({ gdb: 'H', bhPerson: 'erwNach25' }, 'zuzahl').includes('zuzahl.fahrt') && K({ pflegegrad: '3' }, 'zuzahl').includes('zuzahl.fahrt') && !K({ gdb: '60', bhPerson: 'erwNach25' }, 'zuzahl').includes('zuzahl.fahrt'));
// Rundfunkbeitrag
ck('[rf-bezug] Rundfunkbeitrag: Befreiung bei Grundsicherungsgeld', L({ bezug: { grundsicherungsgeld: true } }, 'rundfunk') === 'ja');
ck('[rf-asyl] Rundfunkbeitrag: Befreiung bei Asylbewerberleistungen möglich', K({ aufenthalt: 'asyl' }, 'rundfunk')[0] === 'rundfunk.asyl' && L({ aufenthalt: 'asyl' }, 'rundfunk') === 'vielleicht');
ck('[rf-mehr] Rundfunkbeitrag: Hinweis auf weitere Befreiungen immer dabei', K({}, 'rundfunk').includes('rundfunk.mehr') && K({ bezug: { grundsicherungsgeld: true } }, 'rundfunk').includes('rundfunk.mehr'));
ck('[rf-rf] Merkzeichen RF: Ermäßigung möglich', K({ mz: { RF: true }, gdb: '80', bhPerson: 'erwNach25', brutto: 3000, netto: 2200, art1: 'lohn', miete: 500 }, 'rundfunk')[0] === 'rundfunk.rf');
// § 4 Abs. 1 RBeitrStV: Befreiung auch bei Blindenhilfe, Hilfe zur Pflege und BAföG (nicht bei den Eltern)
ck('[rf-weitere] Blindenhilfe möglich (Grundsicherung nicht): Rundfunkbefreiung möglich', K({ bhPerson: 'erwNach25', blind: 'blind', alter: true, art1: 'rente', brutto: 1500, netto: 1400, miete: 400 }, 'rundfunk')[0] === 'rundfunk.weitere');
ck('[rf-weitere] BAföG in eigener Wohnung: Rundfunkbefreiung möglich', K({ ausbildung: 'ich', gebJahr: 2004, art1: 'lohn', brutto: 300, netto: 300, miete: 400 }, 'rundfunk')[0] === 'rundfunk.weitere');
// Bei den Eltern ist seit 24.11.2026 Grundsicherungsgeld „möglich“ (§ 7 Abs. 6 Nr. 2 SGB II); die Befreiung wegen BAföG gibt es dort weiter nicht
ck('[rf-weitere] BAföG bei den Eltern: keine Befreiung wegen BAföG', !K({ ausbildung: 'ich', gebJahr: 2004, art1: 'lohn', brutto: 300, netto: 300, miete: 0, wohnform: 'eltern' }, 'rundfunk').includes('rundfunk.weitere'));
// Wohnberechtigungsschein
ck('[wbs-schwerb] WBS: Freibetrag Schwerbehinderte verbessert die Einstufung (2.200 € brutto: Gebietsgrenze -> Grenzbereich)', L({ art1: 'lohn', brutto: 2200, netto: 1600 }, 'wbs') === 'vielleicht' && K({ art1: 'lohn', brutto: 2200, netto: 1600 }, 'wbs')[0] === 'wbs.gebiet' && K({ art1: 'lohn', brutto: 2200, netto: 1600, gdb: '100', bhPerson: 'erwNach25' }, 'wbs')[0] === 'wbs.rand');
// Bundeswerte § 9 Abs. 2 WoFG: 12.000 € (1 Person), 18.000 € (2), + 4.100 € je weitere Person, + 500 € je Kind
ck('[wbs-land] WBS ohne belegte Landesgrenze (Saarland): unter der Bundesgrenze wahrscheinlich (allein 900 € x 12 = 10.800 < 12.000), darüber nur möglich', L({ art1: 'lohn', brutto: 900, netto: 750, bundesland: 'SL' }, 'wbs') === 'ja' && T({ art1: 'lohn', brutto: 900, netto: 750, bundesland: 'SL' }, 'wbs', 'wbs.landJa').grenze === E(12000) && L({ art1: 'lohn', brutto: 1100, netto: 880, bundesland: 'SL' }, 'wbs') === 'vielleicht' && K({ art1: 'lohn', brutto: 1100, netto: 880, bundesland: 'SL' }, 'wbs')[0] === 'wbs.landEigen');
ck('[wbs-land] Bundesgrenze Paar mit 2 Kindern (Saarland): 18.000 + 2 x 4.100 + 2 x 500 = 27.200 €', T({ adults: 2, kids: 2, art1: 'lohn', brutto: 2000, netto: 1500, bundesland: 'SL' }, 'wbs', 'wbs.landJa').grenze === E(27200));
// Landesgrenzen aller Länder (amtliche Quellen 11/2026, docs/WBS-GRENZEN.md): allein, Paar, Paar mit 2 Kindern
const WBSL = {
  BW: [60350, 60350, 78350], BE: [16800, 25200, 38080], BB: [18500, 26000, 41600], HB: [13200, 19800, 29920], HH: [19200, 28800, 43520],
  HE: [20146, 30565, 46309], MV: [25800, 38700, 59300], NI: [21250, 28750, 43750], NW: [23540, 28350, 43130], RP: [20000, 28700, 44700],
  SH: [23000, 32000, 45500], SN: [20520, 30780, 46512], ST: [12000, 18000, 27200], TH: [14400, 21600, 33600]
};
Object.keys(WBSL).forEach((bl) => {
  const [g1, g2, g4] = WBSL[bl];
  const gr = (o) => { const r = T(Object.assign({ art1: 'lohn', brutto: 1, netto: 1, bundesland: bl }, o), 'wbs', 'wbs.landGrenze'); return r && r.grenze; };
  ck('[wbs-land-grenze] ' + bl + ': Landesgrenze allein ' + g1 + ' €, Paar ' + g2 + ' €, Paar mit 2 Kindern ' + g4 + ' €',
    gr({}) === E(g1) && gr({ adults: 2 }) === E(g2) && gr({ adults: 2, kids: 2 }) === E(g4), [gr({}), gr({ adults: 2 }), gr({ adults: 2, kids: 2 })].map((x) => x && x.eur).join(' / '));
  // Auf den Euro: genau an der Grenze wahrscheinlich, 1 € darüber nicht mehr „wahrscheinlich“
  const j = (jahr) => L({ art1: 'lohn', brutto: jahr / 12, netto: 1, bundesland: bl }, 'wbs');
  ck('[wbs-land-grenze] ' + bl + ': genau an der Grenze wahrscheinlich, 12 € im Jahr darüber nur möglich', j(g1) === 'ja' && j(g1 + 12) === 'vielleicht', j(g1) + ' ' + j(g1 + 12));
});
ck('[wbs-land-grenze] Schleswig-Holstein Alleinerziehende mit 1 Kind 32.800 € (Tabelle Dynamisierungserlass 2025)', T({ kids: 1, art1: 'lohn', brutto: 1, netto: 1, bundesland: 'SH' }, 'wbs', 'wbs.landGrenze').grenze === E(32800));
ck('[wbs-land-grenze] Kein falsches „nein“: Schwerbehinderung und gezahlter Unterhalt werden vor dem „nein“ abgezogen (NRW, 4.350 € brutto; vor den 30 % auch der Arbeitnehmer-Pauschbetrag)',
  L({ art1: 'lohn', brutto: 4350, netto: 2700, bundesland: 'NW' }, 'wbs') === 'nein' && L({ art1: 'lohn', brutto: 4350, netto: 2700, bundesland: 'NW', gdb: '100', bhPerson: 'ich' }, 'wbs') === 'vielleicht' &&
  L({ art1: 'lohn', brutto: 4350, netto: 2700, bundesland: 'NW', uzBetrag: 400, uzAn: 'k1', uzTitel: true }, 'wbs') === 'vielleicht');
ck('[wbs-land-grenze] Kein falsches „nein“ knapp über der Landesgrenze (NRW, 3.950 € brutto: 5 % Reserve)', L({ art1: 'lohn', brutto: 3950, netto: 2600, bundesland: 'NW' }, 'wbs') === 'vielleicht');

// Elterngeld
ck('[eg-hinweise] Elterngeld: Hinweise Mutterschaftsgeld und Einkommensgrenze 175.000 €', K({ baby: 'da', egVor: 1500 }, 'elterngeld').includes('eg.mutterschaft') && T({ baby: 'da', egVor: 1500 }, 'elterngeld', 'eg.grenze').grenze === E(175000));

// Altersgrenzen nach vollendeten Lebensjahren (heute = Ende 2026; Geburtsjahr 1996 -> 30 Jahre, 1997 -> 29)
const gv = (jahr, verm) => L(ohne({ miete: 400, vermoegen: verm, gebJahr: jahr, heute: 2026.8 }), 'ggeld');
ck('[gg-verm] Schonvermögen ab dem 30. Geburtstag 10.000 € (29: 5.000 €), ab dem 40. 12.500 €, ab dem 50. 20.000 €', gv(1997, 8000) === 'nein' && gv(1996, 8000) !== 'nein' && gv(1987, 12000) === 'nein' && gv(1986, 12000) !== 'nein' && gv(1977, 18000) === 'nein' && gv(1976, 18000) !== 'nein');
ck('[bafoeg-verm] BAföG-Vermögen: ab dem 30. Geburtstag 45.000 € (29 Jahre: 15.000 €)', L({ ausbildung: 'ich', vermoegen: 30000, gebJahr: 1997, heute: 2026.8 }, 'bafoeg') === 'nein' && L({ ausbildung: 'ich', vermoegen: 30000, gebJahr: 1996, heute: 2026.8 }, 'bafoeg') === 'vielleicht');
ck('[gg-studium] Studium mit 44 und mit 46: kein Grundsicherungsgeld (Ausschluss dem Grunde nach, unabhängig vom BAföG-Alter; Vollprüfung 24.11.2026)', K(ohne({ ausbildung: 'ich', miete: 400, gebJahr: 1982, heute: 2026.8 }), 'ggeld')[0] === 'ggeld.ausbildung' && K(ohne({ ausbildung: 'ich', miete: 400, gebJahr: 1980, heute: 2026.8 }), 'ggeld')[0] === 'ggeld.ausbildung');
ck('[bafoeg-alter] BAföG mit 44 normal geprüft, mit 46 nur möglich (Altersgrenze 45), mit 50 nein', K({ ausbildung: 'ich', gebJahr: 1982, heute: 2026.8 }, 'bafoeg')[0] === 'bafoeg.ab30' && K({ ausbildung: 'ich', gebJahr: 1980, heute: 2026.8 }, 'bafoeg')[0] === 'bafoeg.alter' && L({ ausbildung: 'ich', gebJahr: 1976, heute: 2026.8 }, 'bafoeg') === 'nein');
ck('[gg-verm] Alte gespeicherte Altersgruppen werden übernommen', L(ohne({ miete: 400, vermoegen: 6000, alterGruppe: '<31' }), 'ggeld') === 'nein' && L(ohne({ miete: 400, vermoegen: 15000, alterGruppe: '51+' }), 'ggeld') !== 'nein');

ck('[kiz-verm] Kinderzuschlag: Vermögen 55.000 € bei 2 Personen erlaubt (40.000 + 15.000), 55.001 € nur 1. Monat gekürzt (möglich), 55.298 € nicht', L({ kids: 1, art1: 'lohn', brutto: 2200, netto: 1580, miete: 700, mietstufe: '3', vermoegen: 55000 }, 'kiz') === 'ja' && K({ kids: 1, art1: 'lohn', brutto: 2200, netto: 1580, miete: 700, mietstufe: '3', vermoegen: 55001 }, 'kiz')[0] === 'kiz.vermKnapp' && L({ kids: 1, art1: 'lohn', brutto: 2200, netto: 1580, miete: 700, mietstufe: '3', vermoegen: 55001 }, 'kiz') === 'vielleicht' && K({ kids: 1, art1: 'lohn', brutto: 2200, netto: 1580, miete: 700, mietstufe: '3', vermoegen: 55298 }, 'kiz')[0] === 'kiz.verm');
// ---------- Landesleistungen (Phase 2) ----------
ck('[lpg-ja] Bayerisches Landespflegegeld: Pflegegrad 2 in Bayern 500 € im Jahr, mit Hinweis auf den Antrag beim Landesamt', L({ pflegegrad: '2', bundesland: 'BY' }, 'lpg') === 'ja' && T({ pflegegrad: '2', bundesland: 'BY' }, 'lpg', 'lpg.ja').betrag === E(500) && K({ pflegegrad: '4', bundesland: 'BY' }, 'lpg').includes('lpg.antrag'));
ck('[lpg-voraus] Landespflegegeld: Pflegegrad 1 nein, laufender Antrag möglich, außerhalb Bayerns nein', L({ pflegegrad: '1', bundesland: 'BY' }, 'lpg') === 'nein' && L({ pflegegrad: 'antrag', bundesland: 'BY' }, 'lpg') === 'vielleicht' && L({ pflegegrad: '3', bundesland: 'NW' }, 'lpg') === 'nein' && K({ pflegegrad: '3', bundesland: 'NW' }, 'lpg')[0] === 'lpg.land');
ck('[kg-familiengeld] Bayern mit Kind: Hinweis Familiengeld 250 € / 300 €, Krippengeld bis 100 € (nur Geburten bis 2024); nicht in anderen Ländern', T({ kids: 1, kidsU6: 1, bundesland: 'BY' }, 'kindergeld', 'kindergeld.familiengeld').betrag === E(250) && T({ kids: 1, kidsU6: 1, bundesland: 'BY' }, 'kindergeld', 'kindergeld.familiengeld').ab3 === E(300) && !K({ kids: 1, kidsU6: 1, bundesland: 'NW' }, 'kindergeld').includes('kindergeld.familiengeld') && !K({ young: 1, bundesland: 'BY' }, 'kindergeld').includes('kindergeld.familiengeld')
  // nur Kinder unter 6 (Familiengeld nur bis zum 3. Geburtstag, Geburten bis 2024) und nur bis Ende 2027 (Vollprüfung familie B12)
  && !K({ kids: 1, bundesland: 'BY' }, 'kindergeld').includes('kindergeld.familiengeld') && !K({ kids: 1, kidsU6: 1, bundesland: 'BY', heute: 2028.1 }, 'kindergeld').includes('kindergeld.familiengeld'));
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
ck('[kkg-tage] Kinderkrankengeld 2026: 15 Tage (max. 35), alleinerziehend 30 (70); 2027: 10 (25) bzw. 20 (50); 90 %, höchstens 135,63 €', T({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9, kindKrank: true }, 'kkg', 'kkg.ja').tage === 15 && T({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9, kindKrank: true }, 'kkg', 'kkg.ja').max === 35 && T({ kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9, kindKrank: true }, 'kkg', 'kkg.ae').tage === 30 && T({ kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9, kindKrank: true }, 'kkg', 'kkg.ae').max === 70 && T({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2027.1, kindKrank: true }, 'kkg', 'kkg.ja').tage === 10 && T({ kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2027.1, kindKrank: true }, 'kkg', 'kkg.ae').max === 50 && T({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, heute: 2026.9, kindKrank: true }, 'kkg', 'kkg.ja').hoechst === '135,63 €');
ck('[kkg-krank] Kinderkrankengeld nur, wenn gerade ein Kind krank ist', L({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100 }, 'kkg') === 'nein' && L({ adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2100, kindKrank: true }, 'kkg') === 'vielleicht');
ck('[kkg-ohne] Kinderkrankengeld: ohne Kind nein, ohne Arbeit oder nur Minijob nein', L({ art1: 'lohn', brutto: 3000, netto: 2100 }, 'kkg') === 'nein' && L({ kids: 1, art1: 'rente', brutto: 1500, netto: 1500 }, 'kkg') === 'nein' && L({ kids: 1, art1: 'lohn', brutto: 500, netto: 500 }, 'kkg') === 'nein');
const butWg = (u6) => K({ kids: 1, kidsU6: u6, art1: 'lohn', brutto: 2600, netto: 1900, miete: 750, mietstufe: '4', vermoegen: 0 }, 'but');
ck('[but-kita] Wohngeld möglich (noch nicht bezogen): Kita-Hinweis nur mit Kind unter 6', butWg(1).includes('but.kita') && !butWg(0).includes('but.kita'));
ck('[but-kita] Kita beitragsfrei bei Wohngeld/Kinderzuschlag/Grundsicherung: Hinweis nur mit Kind unter 6', K({ kids: 1, kidsU6: 1, bezug: { wohngeld: true } }, 'but').includes('but.kita') && !K({ kids: 1, bezug: { wohngeld: true } }, 'but').includes('but.kita'));
ck('[but-hort] Hort ohne Kostenbeitrag (§ 90 Abs. 4, § 22 Abs. 1 SGB VIII): Hinweis nur mit Kind ab 6, auch bei Wohngeld möglich', K({ kids: 1, bezug: { wohngeld: true } }, 'but').includes('but.hort') && !K({ kids: 1, kidsU6: 1, bezug: { wohngeld: true } }, 'but').includes('but.hort') && K({ kids: 2, kidsU6: 1, bezug: { kiz: true } }, 'but').includes('but.hort') && butWg(0).includes('but.hort') && !butWg(1).includes('but.hort'));

// Unterhalt, den die Person selbst zahlt (§ 11b Abs. 1 Satz 1 Nr. 7 SGB II; § 18 WoGG; SGB XII ohne Abzug)
const S = (o, id) => { const t = res(o).m[id].tx.find((a) => a[0] === 'schaetz.eins'); return t ? Number(t[1].a.replace(/\D/g, '')) : null; };
const uzA = { art1: 'lohn', brutto: 1500, netto: 1150, miete: 600 }; // Freibetrag 100 + 84 + 144 + 20 = 348, Einkommen 802, Bedarf 1.163, Lücke 361
ck('[uz-sgb2] Festgelegter Unterhalt (300 €) wird beim Grundsicherungsgeld voll abgezogen: Lücke 361 € -> 661 €', S(uzA, 'ggeld') === 360 && S({ ...uzA, uzBetrag: 300, uzAn: 'k1', uzTitel: true }, 'ggeld') === 660 && K({ ...uzA, uzBetrag: 300, uzAn: 'k1', uzTitel: true }, 'ggeld').includes('uz.sgb2Titel'));
ck('[uz-sgb2] Ohne festgelegten Betrag kein Abzug, aber Hinweis auf Jugendamtsurkunde', S({ ...uzA, uzBetrag: 300, uzAn: 'k1' }, 'ggeld') === 360 && K({ ...uzA, uzBetrag: 300, uzAn: 'k1' }, 'ggeld').includes('uz.sgb2Ohne'));
const uzK = { adults: 2, kids: 1, art1: 'lohn', brutto: 3000, netto: 2300, miete: 900, mietstufe: 3 };
ck('[uz-sgb2] Kinderzuschlag: festgelegter Unterhalt mindert das Einkommen der Eltern (220 € -> Höchstbetrag 297 €; Wohnanteil nach DA-KiZ-Tabelle 83 %)', S(uzK, 'kiz') === 220 && S({ ...uzK, uzBetrag: 300, uzAn: 'k1', uzTitel: true }, 'kiz') === 300 && S({ ...uzK, uzBetrag: 300, uzAn: 'k1' }, 'kiz') === 220);
const D = (o) => R.derive({ ...base, ...o });
const dz = (o) => { const h = D(o); return [h.uzWGpess, h.uzWGopt, h.uzSGB].join('/'); };
ck('[uz-wg] Wohngeld-Höchstbeträge § 18 WoGG: 250 € je Kind, 500 € Ex-Partner; ohne Titel vorsichtig 0, günstig bis Höchstbetrag; mit Titel günstig ganzer Betrag',
  dz({ uzBetrag: 400, uzAn: 'k1', uzTitel: true }) === '250/400/400' && dz({ uzBetrag: 400, uzAn: 'k1' }) === '0/250/0' && dz({ uzBetrag: 600, uzAn: 'ex', uzTitel: true }) === '500/600/600' &&
  dz({ uzBetrag: 1000, uzAn: 'k3' }) === '0/750/0' && dz({ uzBetrag: 900, uzAn: 'exk', uzTitel: true }) === '750/900/900' && dz({ uzBetrag: 400, uzAn: 'k2', uzTitel: true }) === '400/400/400' && dz({ uzBetrag: 400 }) === '0/250/0', [dz({ uzBetrag: 400, uzAn: 'k1', uzTitel: true }), dz({ uzBetrag: 1000, uzAn: 'k3' })]);
const uzW = { art1: 'lohn', brutto: 1900, netto: 1350, miete: 750, mietstufe: 4 }; // Grenzfall mit Werbungskosten-Pauschbetrag (amtlicher Wohngeldrechner)
ck('[uz-wg] Wohngeld: 250 € Unterhalt ohne Titel hebt nur die günstige Schätzung (bleibt „möglich“), mit Titel „wahrscheinlich“', L(uzW, 'wohngeld') === 'vielleicht' && L({ ...uzW, uzBetrag: 250, uzAn: 'k1' }, 'wohngeld') === 'vielleicht' && L({ ...uzW, uzBetrag: 250, uzAn: 'k1', uzTitel: true }, 'wohngeld') === 'ja' && K({ ...uzW, uzBetrag: 250, uzAn: 'k1' }, 'wohngeld').includes('uz.wg'));
ck('[uz-wg] Nach hohem Unterhalt reicht das Geld nicht mehr zum Leben: Hinweis Mindesteinkommen statt Betrag', K({ ...uzW, uzBetrag: 1000, uzAn: 'k1', uzTitel: true }, 'wohngeld').includes('wohngeld.zuNiedrig'));
const uzG = { alter: true, nichtArbeit: true, brutto: 900, miete: 500, mietstufe: 3 };
ck('[uz-gsa] Grundsicherung im Alter: gezahlter Unterhalt ändert nichts am Betrag, Hinweis und Selbstbehalt', S(uzG, 'gsa') === S({ ...uzG, uzBetrag: 200, uzAn: 'ex', uzTitel: true }, 'gsa') && K({ ...uzG, uzBetrag: 200, uzAn: 'ex', uzTitel: true }, 'gsa').includes('uz.gsa') && K({ ...uzG, uzBetrag: 200, uzAn: 'ex', uzTitel: true }, 'gsa').includes('uz.selbstbehalt'));
ck('[uz-sgb2] Ohne gezahlten Unterhalt keine Unterhalts-Hinweise', !K(uzA, 'ggeld').some((k) => /^uz\./.test(k)) && !K(uzW, 'wohngeld').some((k) => /^uz\./.test(k)));

// Künftige vorrangige Leistung (Arbeitslosengeld, Krankengeld, Elterngeld) zählt bei Grundsicherungsgeld, Wohngeld, Kinderzuschlag als Einkommen
const Z = (o) => R.evaluate({ ...base, ...o });
const ZR = (o, id) => Z(o).results.find((x) => x.id === id);
const zAlg = { art1: 'ohne', miete: 600, mietstufe: 3, vermoegen: 1000, arbeitSit: 'arbeitslos', algZeit: true, lohnVorher: 3000, gebJahr: 1985 };
// Arbeitslosengeld: 3.000 € brutto, Netto 60 % bis Leistungsentgelt Steuerklasse III (2.361,67 €), 60 % davon: 1.080 bis 1.420 €, Mitte 1.250 € gegen Bedarf 1.163 €
ck('[zuk-einkommen] Arbeitslos ohne Einkommen: Grundsicherungsgeld jetzt wahrscheinlich, mit 1.250 € Arbeitslosengeld nur noch knapp -> „möglich“ mit Hinweis',
  L({ ...zAlg, arbeitSit: '' }, 'ggeld') === 'ja' && L(zAlg, 'ggeld') === 'vielleicht' && ZR(zAlg, 'ggeld').tx.some((t) => t[0] === 'zuk.alg' && t[1].a === E(1250)) && K(zAlg, 'ggeld').includes('bedarfJa') && K(zAlg, 'ggeld').includes('zuk.vielleicht'));
ck('[zuk-einkommen] Hinweis „Arbeitslosengeld zuerst beantragen“ auf der Ergebnisseite, vor dem Stichtag-Hinweis', Z(zAlg).zusammen.map((a) => a[0]).join() === 'z.ggVsWg,z.zuk.alg,z.grenzen,z.verfahren,z.stichtag');
ck('[zuk-einkommen] Wohngeld: ohne Einkommen nur „möglich“ (Mindesteinkommen), mit Arbeitslosengeld danach wahrscheinlich, Betrag dazu', K(zAlg, 'wohngeld').includes('zuk.ja') && K(zAlg, 'wohngeld').includes('zuk.betragEins'));
ck('[zuk-einkommen] Ohne Kinder kein Kinderzuschlag, auch kein Hinweis', L(zAlg, 'kiz') === 'nein' && !K(zAlg, 'kiz').some((k) => /^zuk\./.test(k)));
const zKg = { kids: 1, art1: 'lohn', brutto: 2500, netto: 1800, miete: 700, mietstufe: 4, vermoegen: 1000, arbeitSit: 'krank', krankWochen: 'unter6', lohnVorher: 2500 };
// Krankengeld: min(70 % brutto, 90 % netto) minus 12,5 % Beiträge: 1.180 bis 1.530 € (oben 70 % brutto), Mitte 1.360 €, statt des Lohns
ck('[zuk-einkommen] Krankgeschrieben (Lohnfortzahlung): Krankengeld 1.360 € ersetzt den Lohn, Grundsicherungsgeld danach wahrscheinlich -> „möglich“, Kinderzuschlag höher',
  L({ ...zKg, arbeitSit: '' }, 'ggeld') !== 'ja' && L(zKg, 'ggeld') === 'vielleicht' && ZR(zKg, 'ggeld').tx.some((t) => t[0] === 'zuk.kg' && t[1].a === E(1360)) && K(zKg, 'ggeld').includes('zuk.ohneLohn') && (K(zKg, 'kiz').includes('zuk.betragEins') || K(zKg, 'kiz').includes('zuk.betragSpanne')));
const zEg = { art1: 'lohn', brutto: 2350, netto: 1600, miete: 650, mietstufe: 3, vermoegen: 1000, baby: 'bald', egVor: 1600 };
// Elterngeld: 1.600 € Netto -> Elterngeld-Netto 1.616,57 € (§ 2f BEEG: Brutto 2.210 €, Beiträge 480,67 €, Pauschale 464,10 €; Befund E2) - 102,50 €
// (§ 2c Abs. 1 BEEG: 1.230 € / 12) = 1.514,07 € -> Untergrenze 65 %: 984,15 €, auf 10 € gerundet 980 €
ck('[zuk-einkommen] Baby kommt bald (alleinstehend): Elterngeld rund 980 € statt Lohn, Wohngeld danach wahrscheinlich',
  ZR(zEg, 'wohngeld').tx.some((t) => t[0] === 'zuk.eg' && t[1].a === E(980)) && L({ ...zEg, baby: '' }, 'wohngeld') === 'nein' && L(zEg, 'wohngeld') === 'vielleicht' && K(zEg, 'wohngeld').includes('zuk.ja'));
ck('[zuk-einkommen] Elterngeld bei Paaren: offen, wer es bekommt -> keine zweite Rechnung', !Z({ ...zEg, adults: 2, art2: 'lohn', brutto: 4000, brutto2: 1800, netto: 2900 }).zusammen.some((a) => a[0] === 'z.zuk.eg'));
ck('[zuk-einkommen] Bekommt die Leistung schon (Einkommensart Arbeitslosengeld): keine zweite Rechnung', !Z({ ...zAlg, art1: 'alg', brutto: 1200, netto: 1200 }).zusammen.some((a) => /^z\.zuk/.test(a[0])));
ck('[zuk-einkommen] Grundsicherungsgeld fällt danach weg: Hinweis aufs Überbrücken bis zur ersten Zahlung',
  K({ ...zAlg, lohnVorher: 4500 }, 'ggeld').includes('zuk.nein') && K({ ...zAlg, lohnVorher: 4500 }, 'ggeld').includes('zuk.ueberbruecken') && L({ ...zAlg, lohnVorher: 4500 }, 'ggeld') === 'vielleicht');

// Nur geltendes Recht (Nutzerregel 20.11.2026): keine Inhalte aus Gesetzentwürfen, 2027-Werte erst ab 2027 und nur nach Verkündung
const pk = (o, id) => K(o, id);
const p2 = { kids: 2, brutto: 1800, miete: 850, mietstufe: 3, unterhaltFehlt: true };
const alleKeys = (o) => res(o).m && Object.values(res(o).m).flatMap((r) => r.tx.map((a) => a[0]));
const faelle27 = [p2, f1, f2, { pflegegrad: 3 }, { arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 7000 }, { gdb: '80', bhPerson: 'minder', kids: 1 }];
ck('[recht-geltend] Keine Entwurfs-Hinweise (plan.*) mehr, weder 2026 noch 2027', [2026.9, 2027.05].every((hj) => faelle27.every((o) => !alleKeys({ ...o, heute: hj }).some((k) => /^plan\./.test(k)))));
ck('[recht-geltend] Antragsloses Kindergeld (BGBl. 2026 I Nr. 307, in Kraft 1.1.2027) erst ab 2027', !pk({ ...p2, heute: 2026.9 }, 'kindergeld').includes('kg.antraglos') && pk({ ...p2, heute: 2027.05 }, 'kindergeld').includes('kg.antraglos') && P({ ...p2, heute: 2027.05 }, 'kindergeld', 'kg') === E(259));
ck('[recht-geltend] Wohngeld-Tipp „früh beantragen“ ohne Datumsbedingung, nur bei „wahrscheinlich“ oder „möglich“', [2026.9, 2027.05].every((hj) => L({ ...f1, heute: hj }, 'wohngeld') === 'nein' || pk({ ...f1, heute: hj }, 'wohngeld').includes('wg.frueh')) && pk({ ...f1, heute: 2027.05 }, 'wohngeld').includes('wg.frueh') && !pk({ kids: 0, brutto: 9000, miete: 400, mietstufe: 1 }, 'wohngeld').includes('wg.frueh'));
// SV-Rechengrößenverordnung 2027: Bundesrat 20.11.2026, bei Stand 20.11.2026 nicht verkündet -> auch 2027 die Werte 2026
const kgBetrag = (hj) => res({ arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 7000, heute: hj }).m.krankengeld.tx.find((t) => t[0] === 'schaetz.spanne')[1];
const algBetrag = (hj) => res({ ...a1, lohnVorher: 9000, heute: hj }).m.alg1.tx.find((t) => t[0] === 'schaetz.spanne')[1];
const fvGrenze = (hj) => E(R.famversGrenze(hj)); // Karte entfernt (20.11.2026), Grenze nutzt noch „Ich ziehe aus“
const kkgHoechst = (hj) => res({ kids: 1, brutto: 2500, kindKrank: true, heute: hj }).m.kkg.tx[0][1].hoechst;
ck('[recht-geltend] SV-Rechengrößen 2027 nicht verkündet: Krankengeld, Arbeitslosengeld, Familienversicherung und Kinderkrankengeld 2027 wie 2026',
  R.RULES.svrg2027.verkuendet === false && JSON.stringify(kgBetrag(2027.05)) === JSON.stringify(kgBetrag(2026.9)) && JSON.stringify(algBetrag(2027.05)) === JSON.stringify(algBetrag(2026.9)) &&
  JSON.stringify(fvGrenze(2027.05)) === JSON.stringify(E(565)) && JSON.stringify(kkgHoechst(2027.05)) === '"135,63 €"');
R.RULES.svrg2027.verkuendet = true;
ck('[recht-geltend] Nach Verkündung (Schalter): ab 2027 neue Grenzen (KV 6.375 €, RV 8.850 €, Bezugsgröße 4.130 €, Kinderkrankengeld höchstens 148,75 €), 2026 unverändert',
  JSON.stringify(kgBetrag(2027.05)) !== JSON.stringify(kgBetrag(2026.9)) && JSON.stringify(algBetrag(2027.05)) !== JSON.stringify(algBetrag(2026.9)) &&
  JSON.stringify(fvGrenze(2027.05)) === JSON.stringify(E(590)) && JSON.stringify(fvGrenze(2026.9)) === JSON.stringify(E(565)) && JSON.stringify(kkgHoechst(2027.05)) === '"148,75 €"');
R.RULES.svrg2027.verkuendet = false;
{ // „Ich ziehe aus“ holt die Grenze über Rules.famversGrenze (mit Schalter), nicht über das Kalenderjahr
  const aus = [2026.9, 2027.05, 2028.5].map((hj) => R.famversGrenze(hj));
  R.RULES.svrg2027.verkuendet = true;
  const an = [2026.9, 2027.05, 2028.5].map((hj) => R.famversGrenze(hj));
  R.RULES.svrg2027.verkuendet = false;
  const appSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'app.js'), 'utf8');
  const zeile = (appSrc.match(/famversGrenze: function[^\n]*/) || [''])[0];
  ck('[recht-geltend] Familienversicherungs-Grenze (auch „Ich ziehe aus“): ab 2027 mit Schalter aus 565 €, mit Schalter an 590 €, 2026 immer 565 €',
    JSON.stringify(aus) === '[565,565,565]' && JSON.stringify(an) === '[565,590,590]' && /Rules\.famversGrenze\(\)/.test(zeile) && !/getFullYear|bezug2027/.test(zeile), JSON.stringify({ aus, an, zeile }));
}
{
  const fsL = require('fs'), pthL = require('path'), dirL = pthL.join(__dirname, '..', 'src', 'lang');
  const PROGNOSE = {
    de: /voraussichtlich|geplant|Frühjahr|Entwurf/i, en: /expected|planned|spring|draft/i, fr: /prévu|printemps|projet de loi/i, pl: /przewidyw|planowan|wiosn|projekt/i,
    ro: /preconizat|planificat|primăvar|proiect/i, ru: /ожида|планиру|весн|проект/i, uk: /очіку|плану|весн|проєкт/i, tr: /bekleni|planlan|ilkbahar|taslak/i,
    ar: /متوقع|مخطط|الربيع|مشروع/, fa: /پیش‌بینی|برنامه‌ریزی|بهار|پیش‌نویس/, 'fa-AF': /پیش‌بینی|برنامه‌ریزی|بهار|پیش‌نویس/, ps: /اټکل|پلان|پسرلی|مسوده/, so: /la filayo|qorsheysan|gu'ga|qabyo/i
  };
  const dateien = fsL.readdirSync(dirL).filter((f) => f.endsWith('.json')).map((f) => pthL.join(dirL, f)).concat(['b.json', 'e.json', 'mietgrenze.json'].map((f) => pthL.join(dirL, 'einfach', f)));
  const probleme = [];
  for (const f of dateien) {
    const d = JSON.parse(fsL.readFileSync(f, 'utf8'));
    Object.keys(d).forEach((k) => { if (/^t\.plan\./.test(k) || k === 'wgmax.d.2027') probleme.push(pthL.basename(f) + ': ' + k); });
    if (d['alt.hinweis'] && /633|Minijob|Kinderkranken|Kindergeld|Wohngeld/.test(d['alt.hinweis'])) probleme.push(pthL.basename(f) + ': alt.hinweis nennt einzelne 2027-Werte');
    // Prognose-Wörter (voraussichtlich, geplant, Frühjahr …) in Texten zu geltendem Recht, je Sprache
    const prog = PROGNOSE[pthL.basename(f, '.json')] || (/einfach/.test(f) ? PROGNOSE.de : null);
    if (prog) ['t.kg.antraglos', 't.wg.frueh', 'alt.hinweis', 'foot.3'].forEach((k) => { if (d[k] && prog.test(d[k])) probleme.push(pthL.basename(f) + ': ' + k + ' mit Prognose'); });
    if (/einfach/.test(f)) {
      // Einfache Sprache (b.json): Minijob-Hinweise ebenfalls mit Platzhalter {mini}
      ['t.krank.minijob', 't.alg1.minijob'].forEach((k) => { if (k in d && (!/\{mini\}/.test(d[k]) || /603|633/.test(d[k]))) probleme.push(pthL.basename(f) + ': ' + k + ' ohne {mini}'); });
      if (/b\.json$/.test(f) && !d['t.krank.minijob']) probleme.push('einfach/b.json: fehlt t.krank.minijob');
      continue;
    }
    ['t.wg.frueh', 't.kg.antraglos', 'foot.3'].forEach((k) => { if (!d[k]) probleme.push(pthL.basename(f) + ': fehlt ' + k); });
    ['t.krank.minijob', 't.alg1.minijob'].forEach((k) => { if (!/\{mini\}/.test(d[k]) || /603/.test(d[k])) probleme.push(pthL.basename(f) + ': ' + k + ' ohne {mini}'); });
    if (/2027/.test(d['foot.3'])) probleme.push(pthL.basename(f) + ': foot.3 nennt 2027');
  }
  ck('[recht-geltend] Texte in allen 13 Sprachen und Einfacher Sprache: keine Entwurfs-Schlüssel, keine Prognose-Wörter, alt.hinweis neutral, foot.3 ohne 2027, Minijob-Grenze als Platzhalter (auch Einfache Sprache)', probleme.length === 0, probleme.join('; '));
}
ck('[recht-geltend] Minijob-Hinweis Krankengeld/Arbeitslosengeld mit der Minijob-Grenze des Jahres (603 € / 633 €)',
  JSON.stringify(res({ arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 500, heute: 2026.9 }).m.krankengeld.tx[0]) === JSON.stringify(['krank.minijob', { mini: E(603) }]) &&
  JSON.stringify(res({ arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 620, heute: 2027.05 }).m.krankengeld.tx[0]) === JSON.stringify(['krank.minijob', { mini: E(633) }]) &&
  res({ ...a1, lohnVorher: 620, heute: 2027.05 }).m.alg1.tx.some((t) => t[0] === 'alg1.minijob' && t[1].mini === E(633)));

ck('[verfahren] Hinweise „nicht eingerechnet“ (bei Leistungen mit Einkommensprüfung) und „Widerspruch, Überprüfungsantrag, Beratung“ (bei jedem Ergebnis)', res(f1).z.includes('z.grenzen') && res(f1).z.includes('z.verfahren') && !R.evaluate({ ...base, adults: 1, brutto: 9000, netto: 6000, miete: 400, vermoegen: 900000, gebJahr: 1990 }).zusammen.some((a) => a[0] === 'z.grenzen'));

// Bisher nicht Eingerechnetes (selbstständig, Eigentum, Auto, weitere Erwachsene, angemessene Miete, EU)
const bz = { art1: 'lohn', brutto: 900, netto: 750, miete: 600, mietstufe: 3, vermoegen: 1000, gebJahr: 1985 };
ck('[selbst] Selbstständige: Gewinn wie Lohn (gleiche Einstufung und gleicher Betrag beim Grundsicherungsgeld), Hinweis auf vorläufige Bewilligung',
  JSON.stringify(res({ ...bz, art1: 'selbst' }).m.ggeld.tx.filter((t) => t[0] !== 'selbst.hinweis')) === JSON.stringify(res(bz).m.ggeld.tx) && K({ ...bz, art1: 'selbst' }, 'ggeld').includes('selbst.hinweis'));
ck('[selbst] Selbstständige: Arbeitslosengeld nur mit freiwilliger Versicherung, Krankengeld nur mit Wahltarif („möglich“)',
  L({ ...bz, art1: 'selbst', arbeitSit: 'arbeitslos', algZeit: true, lohnVorher: 2500 }, 'alg1') === 'vielleicht' && K({ ...bz, art1: 'selbst', arbeitSit: 'arbeitslos', algZeit: true, lohnVorher: 2500 }, 'alg1').includes('alg1.selbst') &&
  L({ ...bz, art1: 'selbst', arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 2500 }, 'krankengeld') === 'vielleicht' && L({ ...bz, arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 2500 }, 'krankengeld') === 'ja');
ck('[eigentum] Eigentum: Grundsicherungsgeld nur „möglich“ (Tilgung meist nicht übernommen), Wohngeld als Lastenzuschuss „möglich“, keine Mietobergrenze',
  L(bz, 'ggeld') === 'ja' && L({ ...bz, wohnart: 'eigentum' }, 'ggeld') === 'vielleicht' && K({ ...bz, wohnart: 'eigentum' }, 'ggeld').includes('kdu.eigentum') &&
  K({ ...bz, wohnart: 'eigentum', brutto: 1900, netto: 1450, miete: 700 }, 'wohngeld').includes('wohngeld.lasten') && !K({ ...bz, wohnart: 'eigentum', miete: 3000 }, 'ggeld').includes('kdu.hoch'));
ck('[auto] Auto: im SGB II geschützt, über 15.000 € nur „möglich“; gebraucht (Behinderung/Arbeit) ohne Einschränkung',
  L({ ...bz, autoWert: 9000 }, 'ggeld') === 'ja' && L({ ...bz, autoWert: 20000 }, 'ggeld') === 'vielleicht' && K({ ...bz, autoWert: 20000 }, 'ggeld').includes('auto.hoch') && L({ ...bz, autoWert: 20000, autoBraucht: true }, 'ggeld') === 'ja');
ck('[auto] Grundsicherung im Alter: angemessenes Auto geschützt (§ 90 Abs. 2 Nr. 10 SGB XII); über 15.000 € nur „möglich“, gebraucht ohne Einschränkung',
  L(f2, 'gsa') === 'ja' && L({ ...f2, autoWert: 8000 }, 'gsa') === 'ja' && L({ ...f2, autoWert: 20000 }, 'gsa') === 'vielleicht' && K({ ...f2, autoWert: 20000 }, 'gsa').includes('auto.hochSgb12') && L({ ...f2, autoWert: 20000, autoBraucht: true }, 'gsa') === 'ja');
ck('[auto] BAföG: Auto zählt zum Vermögen (10.000 € + Auto 6.000 € über 15.000 € Freibetrag unter 30: Hinweis; + Auto 20.000 €: eher nicht)',
  L({ ausbildung: 'ich', gebJahr: 2004, vermoegen: 10000, brutto: 0, netto: 0, miete: 400 }, 'bafoeg') !== 'nein' && K({ ausbildung: 'ich', gebJahr: 2004, vermoegen: 10000, autoWert: 6000, brutto: 0, netto: 0, miete: 400 }, 'bafoeg')[0] === 'bafoeg.vermTeil' && L({ ausbildung: 'ich', gebJahr: 2004, vermoegen: 10000, autoWert: 20000, brutto: 0, netto: 0, miete: 400 }, 'bafoeg') === 'nein');
ck('[hh-andere] Verwandte in der Wohnung: Vermutung der Unterstützung (§ 9 Abs. 5 SGB II) und Wohngeld-Haushalt -> nur „möglich“; WG: Hinweis eigener Mietanteil',
  L({ ...bz, hhAndere: 'verwandte' }, 'ggeld') === 'vielleicht' && K({ ...bz, hhAndere: 'verwandte' }, 'ggeld').includes('ggeld.verwandte') && L({ ...bz, hhAndere: 'wg' }, 'ggeld') === 'ja' && K({ ...bz, hhAndere: 'wg' }, 'ggeld').includes('wg.anteil'));
// Angemessene Unterkunftskosten: 1 Person, Mietenstufe III: (456 € + 19,20 € Klima) × 1,1 + 110,40 € Heizung = 633,12 € -> etwa 630 €
// Miete unter dem Eineinhalbfachen der Grenze (seit 24.11.2026 deckelt die App darüber, § 22 Abs. 1 Satz 6 SGB II; eigener Test in test-rechtsmatrix-grusi.js)
const kd = { art1: 'alg', brutto: 1250, netto: 1250, miete: 800, mietstufe: 3, vermoegen: 1000, gebJahr: 1985 };
ck('[kdu-grenze] Miete über der Angemessenheitsgrenze: Hinweis mit Grenze (etwa 630 €); jetzt wahrscheinlich, mit der Grenze nicht -> „möglich“',
  res(kd).m.ggeld.tx.some((t) => t[0] === 'kdu.hoch' && t[1].grenze === E(630)) && L(kd, 'ggeld') === 'vielleicht' && !K({ ...kd, miete: 600 }, 'ggeld').includes('kdu.hoch') && !K({ ...kd, mietstufe: '' }, 'ggeld').includes('kdu.hoch'));
const eu = { art1: 'ohne', brutto: 0, netto: 0, miete: 500, mietstufe: 3, vermoegen: 500, gebJahr: 1990, aufenthalt: 'eu', euArbeit: 'nein', euJahre: 'unter5' };
ck('[eu] EU-Bürger ohne Arbeit, unter 5 Jahren: kein Grundsicherungsgeld (§ 7 SGB II); mit Arbeit, nach 5 Jahren oder mit Lohn kein Ausschluss',
  L(eu, 'ggeld') === 'nein' && K(eu, 'ggeld').includes('ggeld.eu') && L({ ...eu, euArbeit: 'ja' }, 'ggeld') !== 'nein' && L({ ...eu, euJahre: 'ab5' }, 'ggeld') !== 'nein' && L({ ...eu, art1: 'lohn', brutto: 400, netto: 400 }, 'ggeld') !== 'nein');
ck('[eu] EU-Bürger: Grundsicherung im Alter ausgeschlossen (§ 23 SGB XII) unter denselben Bedingungen; Kindergeld-Hinweis auf die ersten 3 Monate',
  L({ ...f2, aufenthalt: 'eu', euArbeit: 'nein', euJahre: 'unter5' }, 'gsa') === 'nein' && L({ ...f2, aufenthalt: 'eu', euArbeit: 'nein', euJahre: 'ab5' }, 'gsa') === 'ja' && K({ ...f1, aufenthalt: 'eu' }, 'kindergeld').includes('kg.eu'));


// Kinderzuschlag nur, wenn im Haushalt jemand dem Grunde nach zum SGB II gehört (§ 6a Abs. 1 Nr. 3 BKGG i. V. m. § 7, § 8 SGB II;
// DA-KiZ Stand 20.02.2026, D.2 Abs. 1 Satz 5 und B.1 Abs. 5; BSG 13.07.2022, B 7/14 KG 1/21 R): erwerbsfähiger Elternteil oder Kind ab 15.
// Handbeispiel: allein, Regelaltersgrenze erreicht, Rente 1.450 € brutto / 1.300 € Zahlbetrag, Miete 800 €, ein Kind, Unterhalt fehlt.
// Ohne die Regel ergäbe die Rechnung „wahrscheinlich“ (Rente 1.270 € nach Pauschale unter dem Elternbedarf 563 + 203 + 616 = 1.382 €).
{
  const rk = { kids: 1, alter: true, art1: 'rente', brutto: 1450, netto: 1300, miete: 800, mietstufe: 3, unterhaltFehlt: true, heute: 2026.9 };
  const witwe = { ...rk, alter: false, gebJahr: 1986 };
  ck('[kiz-rentner] Gegenprobe: gleiche Familie, Elternteil 40 (z. B. Witwenrente) -> Kinderzuschlag wahrscheinlich', L(witwe, 'kiz') === 'ja', K(witwe, 'kiz'));
  ck('[kiz-rentner] Rentner (Regelaltersgrenze) allein mit Kind 13 (Alter angegeben) -> nein, Verweis auf Wohngeld und Grundsicherung im Alter',
    L({ ...rk, kidsAlter: true }, 'kiz') === 'nein' && K({ ...rk, kidsAlter: true }, 'kiz')[0] === 'kiz.rentnerAllein');
  ck('[kiz-rentner] Rentner allein mit Kind unter 6 (Alter damit bekannt) -> nein', L({ ...rk, kidsU6: 1 }, 'kiz') === 'nein');
  // Rente 1.100 € (bei 1.450 € verbraucht die Rente über dem eigenen Bedarf mit KOPFTEIL der Miete den Kinderzuschlag, DA-KiZ D.2 Abs. 1 Satz 9-11)
  ck('[kiz-rentner] Rentner allein mit Kind 16 (14 bis 17) -> nur möglich, Hinweis „nur wenn ein Kind 15 oder älter“',
    L({ ...rk, brutto: 1100, netto: 1000, kids14: 1, kidsAlter: true }, 'kiz') === 'vielleicht' && K({ ...rk, brutto: 1100, netto: 1000, kids14: 1, kidsAlter: true }, 'kiz')[0] === 'kiz.nurAb15', K({ ...rk, brutto: 1100, netto: 1000, kids14: 1, kidsAlter: true }, 'kiz'));
  ck('[kiz-rentner] Rentner allein, Rente 1.450 €, Kind 16 mit Unterhaltsvorschuss: Rente über eigenem Bedarf (Kopfteil 400 €) und 45 % UVG verbrauchen den Kinderzuschlag',
    L({ ...rk, kids14: 1, kidsAlter: true }, 'kiz') === 'nein');
  ck('[kiz-rentner] Rentner allein, Kinderalter nicht angegeben -> nur möglich (keine falsche Absage)', L(rk, 'kiz') === 'vielleicht' && K(rk, 'kiz')[0] === 'kiz.nurAb15');
  ck('[kiz-rentner] Rentner allein mit Kind und jungem Erwachsenen (18-24, erwerbsfähig) -> normale Rechnung ohne Hinweis',
    L({ ...rk, young: 1, kidsAlter: true }, 'kiz') !== 'nein' && !K({ ...rk, young: 1, kidsAlter: true }, 'kiz').includes('kiz.nurAb15'));
  ck('[kiz-rentner] Voll erwerbsgemindert (unter 3 Stunden) allein mit Kind 13 -> nein, eigener Text',
    L({ ...witwe, emStd: 'unter3', kidsAlter: true }, 'kiz') === 'nein' && K({ ...witwe, emStd: 'unter3', kidsAlter: true }, 'kiz')[0] === 'kiz.emAllein');
  ck('[kiz-rentner] Teilweise erwerbsgemindert (3 bis 6 Stunden) ist erwerbsfähig -> normale Rechnung', L({ ...witwe, emStd: '3bis6', kidsAlter: true }, 'kiz') === 'ja');
  ck('[kiz-rentner] Werkstatt-Haken beim Kind mit Behinderung (unter 18) betrifft nicht den Elternteil -> kein Ausschluss',
    L({ ...witwe, bhPerson: 'minder', wfbm: true, kidsAlter: true }, 'kiz') !== 'nein');
  // Vorgezogene Altersrente (§ 7 Abs. 4 SGB II): die App kennt die Rentenart nicht -> höchstens „möglich“, nie „nein“
  ck('[kiz-rentner] Nur Rente, 63 Jahre (vorgezogene Altersrente möglich) -> nur möglich mit Hinweis',
    L({ ...witwe, gebJahr: 1963, kidsAlter: true }, 'kiz') === 'vielleicht' && K({ ...witwe, gebJahr: 1963, kidsAlter: true }, 'kiz')[0] === 'kiz.vorgezogen');
  ck('[kiz-rentner] Nur Rente, Alter unbekannt -> nur möglich mit Hinweis', K({ ...witwe, gebJahr: '' }, 'kiz')[0] === 'kiz.vorgezogen' && L({ ...witwe, gebJahr: '' }, 'kiz') === 'vielleicht');
  ck('[kiz-rentner] Lohn statt Rente, 63 Jahre -> normale Rechnung ohne Hinweis', !K({ ...witwe, gebJahr: 1963, art1: 'lohn', brutto: 2200, netto: 1650 }, 'kiz').includes('kiz.vorgezogen'));
  // Paar: Rentner + Erwerbstätiger mit Kind 10 -> wie bisher (Anspruch möglich, der Partner gehört zum SGB II)
  const paar = { adults: 2, kids: 1, art1: 'rente', art2: 'lohn', brutto: 3000, brutto2: 1800, netto: 2500, miete: 900, mietstufe: 3, heute: 2026.9 };
  ck('[kiz-rentner] Paar Rentner + Erwerbstätiger, Kind 10 -> unverändert wahrscheinlich, ohne Hinweis',
    L({ ...paar, alter: true }, 'kiz') === 'ja' && L({ ...paar, gebJahr: 1980 }, 'kiz') === 'ja' && K({ ...paar, alter: true }, 'kiz')[0] === 'kiz.ja');
  const paarR = { ...paar, art2: 'rente', brutto: 1900, brutto2: 700, netto: 1700, alter: true };
  ck('[kiz-rentner] Paar, beide Rente, Regelaltersgrenze -> höchstens möglich mit Hinweis', L(paarR, 'kiz') !== 'ja' && K(paarR, 'kiz')[0] === 'kiz.rentnerPaar');
  // Grundsicherungsgeld: Altersrente auch vor der Regelaltersgrenze schließt aus (§ 7 Abs. 4 SGB II) -> höchstens „möglich“
  const gr = { art1: 'rente', brutto: 700, netto: 620, miete: 450, mietstufe: 3, heute: 2026.9 };
  ck('[kiz-rentner] Grundsicherungsgeld: nur Rente mit 63 -> möglich mit Hinweis Sozialamt; mit 40 (Witwenrente) wahrscheinlich',
    L({ ...gr, gebJahr: 1963 }, 'ggeld') === 'vielleicht' && K({ ...gr, gebJahr: 1963 }, 'ggeld').includes('ggeld.vorgezogen') && L({ ...gr, gebJahr: 1986 }, 'ggeld') === 'ja');
}

// [kiz-kindeink] Einkommen der Kinder beim Kinderzuschlag (Prüfung 21.11.2026, docs/entwuerfe/pruefungen-21-11/kiz.md).
// Quelle: § 6a Abs. 3 BKGG; DA-KiZ Stand 20.02.2026 (https://www.arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf, Abruf 21.11.2026)
// C.2.2.1 Abs. 3 und 5: Unterhalt und Unterhaltsvorschuss ohne Abzüge (außer 30 € Versicherungspauschale, wenn versichert), davon 45 %.
// Erwartungen von Hand: Bedarf = 563 + Mehrbedarf + Wohnanteil (Tabelle C.3.1.2), Einkommen = Netto - Freibetrag (378 € mit Kind).
{
  const RS = require('../src/rules.js'), BK = require('../erweiterungen/bescheid-kiz.js');
  // DA-KiZ-Beispiele (Bescheid-Check rechnet je Kind genau)
  const mia = BK.rechne({ eltern: [{ brutto: 3000, netto: 2100 }], kinder: [{ alter: 17, unterhalt: 400 }], wohnkosten: 700 }, RS);
  ck('[kiz-kindeink] DA-KiZ C.2.2.2.3 Beispiel Mia: Unterhalt 400 € x 45 % = 180 €, Kinderzuschlag 297 - 180 = 117 €', mia.jeKind[0] === 117, mia.jeKind);
  // C.3.2.1.3 Abs. 4 Beispiel Frau T.: Kinder 8 und 11, Miete 400 €, Unterhalt (eigener) 450 € + Erwerb 600 € (Brutto 1.000 €, Netto 928 €, Freibetrag 328 €)
  const frauT = BK.rechne({ eltern: [{ brutto: 1000, netto: 928, sonstiges: 450 }], kinder: [{ alter: 8 }, { alter: 11 }], wohnkosten: 400 }, RS);
  ck('[kiz-kindeink] DA-KiZ Beispiel Frau T.: Bedarf 1.017,68 €, 32,32 € darüber, Minderung 14,54 €', frauT.bedarf === 1017.68 && frauT.ueber === 32.32 && frauT.minderung === 14.54 && frauT.kiz === 579.46, frauT);
  // C.3.2.1.3 Abs. 5 Beispiel Ehepaar X.: Rente 1.450 € (1.480 € - 30 € Pauschale), Erwerb 300 €, Bedarf 1.412 €, drei Kinder -> 718 €
  const ehepaarX = BK.rechne({ eltern: [{ sonstiges: 1480 }, { brutto: 500, netto: 480 }], kinder: [{ alter: 12 }, { alter: 14 }, { alter: 16 }], wohnkosten: 400 / 0.62 }, RS);
  ck('[kiz-kindeink] DA-KiZ Beispiel Ehepaar X.: 891 - 38 - 135 = 718 €', ehepaarX.bedarf === 1412 && ehepaarX.minderung === 173 && ehepaarX.kiz === 718, ehepaarX);
  // C.3.2.1.3 Abs. 6 Beispiel Patchwork: Kind 8 mit 100 € Einkommen -> 252 €, Kind 5 -> 297 €, Elterneinkommen 100 € über dem Bedarf 1.438 € -> 504 €
  const patch = BK.rechne({ eltern: [{ brutto: 2000, netto: 1916 }, {}], kinder: [{ alter: 8, unterhalt: 100 }, { alter: 5 }], wohnkosten: 600 }, RS);
  ck('[kiz-kindeink] DA-KiZ Beispiel Patchwork: 252 + 297 = 549, minus 45 = 504 €', patch.bedarf === 1438 && patch.jeKind.join() === '252,297' && patch.kiz === 504, patch);
  const patchH = { adults: 2, kids: 2, kidsU6: 1, kids14: 0, art1: 'lohn', art2: 'ohne', brutto: 2000, brutto2: 0, netto: 1916, unterhalt: 100, miete: 600, mietstufe: 3, vermoegen: 0, bezug: { kindergeld: true }, heute: 2026.9 };
  const patchS = res(patchH).m.kiz.tx.find((t) => t[0] === 'schaetz.eins');
  ck('[kiz-kindeink] Hauptrechner, Patchwork-Beispiel: wahrscheinlich, etwa 500 € (504 € gerundet)', L(patchH, 'kiz') === 'ja' && patchS && patchS[1].a === E(500), JSON.stringify(res(patchH).m.kiz.tx));
  // Die 9 Widerspruchsfälle aus dem Differenztest (alleinerziehend; Unterhalt je Kind; Warmmiete). KiZ-Lotse: „Aussicht auf Erfolg“, weil er
  // das Einkommen der Kinder nicht einrechnet. Erwartet (DA-KiZ): Bescheid-Rechnung, ohne Unterhalt, Einstufung im Hauptrechner.
  // Fall: [Alter, Brutto, Netto, Unterhalt je Kind, Warmmiete, Bedarf Eltern, KiZ mit Unterhalt, KiZ ohne Unterhalt, Einstufung, Hinweis]
  const W = [
    [60, [12, 14], 4460, 2988, 350, 1060, 1433.48, 0, 64.57, 'nein', 'kiz.kindEinkNein'],   // 2610 - 1433,48 = 1176,52 x 45 % = 529,43 > 2 x 139,50
    [145, [6, 4], 3860, 2658, 200, 910, 1338.98, 0, 170.54, 'vielleicht', 'kiz.knappKindEink'], // 414 - 423,46 < 0; mit 30 € Pauschale 441 - 423,46 > 0
    [153, [4, 10, 15], 4540, 3039, 200, 960, 1274.48, 0, 267.07, 'vielleicht', 'kiz.knappKindEink'], // 621 - 623,93 < 0; mit Pauschale 661,50 - 623,93 > 0
    [157, [5], 3570, 2488, 299, 1240, 1720.48, 0, 121.72, 'vielleicht', 'kiz.knappKindEink'], // 162,45 - 175,28 < 0; mit Pauschale 175,95 - 175,28 > 0
    [221, [15], 3740, 2584, 227, 1200, 1554.56, 0, 3.85, 'nein', 'kiz.kindEinkNein'],      // 12 % Mehrbedarf; 297 - 293,15 = 3,85 ohne Unterhalt
    [248, [16, 6], 3890, 2675, 394, 1070, 1439.78, 0, 208.25, 'nein', 'kiz.kindEinkNein'],
    [251, [14], 3320, 2346, 394, 1060, 1446.76, 0, 62.44, 'nein', 'kiz.kindEinkNein'],
    [258, [11, 0], 4570, 3047, 299, 1140, 1483.88, 0, 60.7, 'nein', 'kiz.kindEinkNein'],
    [271, [8, 13, 14, 14], 4660, 3112, 450, 1190, 1380.64, 0, 578.99, 'nein', 'kiz.kindEinkNein'], // 48 % Mehrbedarf, Wohnanteil 46 %
  ];
  for (const [nr, alter, brutto, netto, uh, miete, bedarf, mit, ohne, level, hinweis] of W) {
    const b = (u) => BK.rechne({ eltern: [{ brutto, netto }], kinder: alter.map((a) => ({ alter: a, unterhalt: u })), wohnkosten: miete }, RS);
    const bm = b(uh), bo = b(0);
    ck('[kiz-kindeink] Fall ' + nr + ': Bescheid-Rechnung Bedarf ' + bedarf + ', KiZ ' + mit + ' (ohne Unterhalt ' + ohne + ')', bm.bedarf === bedarf && bm.kiz === mit && bo.kiz === ohne, [bm.bedarf, bm.kiz, bo.kiz]);
    const h = { adults: 1, kids: alter.length, kidsU6: alter.filter((a) => a < 6).length, kids14: alter.filter((a) => a >= 14).length, art1: 'lohn', brutto, netto, unterhalt: uh * alter.length, unterhaltFehlt: false, miete, mietstufe: 3, vermoegen: 3000, gebJahr: 1988, bezug: { kindergeld: true }, heute: 2026.9 };
    ck('[kiz-kindeink] Fall ' + nr + ': Hauptrechner ' + level + ' mit Hinweis ' + hinweis, L(h, 'kiz') === level && K(h, 'kiz').includes(hinweis), L(h, 'kiz') + ' ' + K(h, 'kiz').join());
  }
  // Ohne Unterhalt kein Hinweis auf das Einkommen der Kinder; weit über der Grenze bleibt „eher nicht“ ohne Hinweis
  const ohneUh = { adults: 1, kids: 1, kidsU6: 0, kids14: 1, art1: 'lohn', brutto: 4700, netto: 3200, miete: 900, mietstufe: 3, vermoegen: 0, bezug: { kindergeld: true }, heute: 2026.9 };
  ck('[kiz-kindeink] Ohne Unterhalt: „eher nicht“, kein Hinweis zum Einkommen der Kinder', L(ohneUh, 'kiz') === 'nein' && !K(ohneUh, 'kiz').some((k) => /kindEink/.test(k)), K(ohneUh, 'kiz').join());
  // [kiz-kindlohn] Lohn der Kinder (Prüfvermerk 21.11.2026, docs/entwuerfe/pruefungen-21-11/kiz-pr127.md): Die Familienkasse zieht 603 € ab und
  // dazu bis zu 164 € Freibetrag (§ 11b Abs. 2b und Abs. 3 Satz 4 SGB II; DA-KiZ C.2.2.1 Abs. 3 Satz 9-11). SoLo zieht nur 603 € ab.
  // Von Hand: Kind 16, Bedarf 563 + 67,56 + 77 % von 900 = 1.323,56 €; Einkommen 2.300 - 378 = 1.922 €; Minderung 45 % von 598,44 = 269,30 €.
  // Lohn 700 €: SoLo 297 - 45 % von 97 = 253,35 € -> 0 €; mit Freibetrag (höchstens 164 €) 297 - 269,30 > 0 -> „möglich“, kein Unterhalt-Text.
  const lohnK = { adults: 1, kids: 1, kidsU6: 0, kids14: 1, art1: 'lohn', brutto: 3300, netto: 2300, kindEink: 700, miete: 900, mietstufe: 3, vermoegen: 0, bezug: { kindergeld: true }, heute: 2026.9 };
  ck('[kiz-kindlohn] Kind mit 700 € Lohn, knapp: „möglich“ (Freibetrag des Kindes nicht gerechnet), kein Hinweis auf Unterhalt', L(lohnK, 'kiz') === 'vielleicht' && K(lohnK, 'kiz').includes('kiz.rand') && !K(lohnK, 'kiz').some((k) => /kindEink/.test(k)), L(lohnK, 'kiz') + ' ' + K(lohnK, 'kiz').join());
  ck('[kiz-kindlohn] Kind mit 1.500 € Lohn: „eher nicht“ ohne Hinweis auf Unterhalt (297 - 45 % von 733 < 269,30)', L({ ...lohnK, kindEink: 1500 }, 'kiz') === 'nein' && !K({ ...lohnK, kindEink: 1500 }, 'kiz').some((k) => /kindEink/.test(k)), K({ ...lohnK, kindEink: 1500 }, 'kiz').join());
  const lohnB = BK.pruefe({ eltern: [{ brutto: 3300, netto: 2300 }], kinder: [{ alter: 16, eigenes: 700 }], wohnkosten: 900, bescheid: { kiz: 60 } }, RS);
  ck('[kiz-kindlohn] Bescheid-Check: Hinweis auf den Freibetrag (bis 73,80 € mehr), nicht auf die Versicherung', lohnB.hinweise.length === 1 && /164,00 €/.test(lohnB.hinweise[0]) && /73,80 €/.test(lohnB.hinweise[0]), lohnB.hinweise);
  const uhB = BK.pruefe({ eltern: [{ brutto: 3000, netto: 2100 }], kinder: [{ alter: 17, unterhalt: 400 }, { alter: 10 }], wohnkosten: 700, bescheid: { kiz: 600 } }, RS);
  ck('[kiz-kindeink] Bescheid-Check: Hinweis auf 30 € Versicherung nur für das Kind mit Unterhalt (13,50 €)', uhB.hinweise.some((t) => /13,50 €/.test(t)) && !uhB.hinweise.some((t) => /164/.test(t)), uhB.hinweise);
  // [kiz-spanne] Alter grob (Kind 6-13 kann 6 sein): Spanne; Bescheid-Check mit genauem Alter liegt darin (interner Fall 30: Kind 6, Unterhalt 227 €)
  const sp = { adults: 1, kids: 1, kidsU6: 0, kids14: 0, art1: 'lohn', brutto: 2500, netto: 1869, unterhalt: 227, unterhaltFehlt: false, miete: 1060, mietstufe: 3, vermoegen: 0, bezug: { kindergeld: true }, heute: 2026.9 };
  const spT = res(sp).m.kiz.tx.find((t) => t[0] === 'schaetz.spanne');
  const sp6 = BK.rechne({ eltern: [{ brutto: 2500, netto: 1869 }], kinder: [{ alter: 6, unterhalt: 227 }], wohnkosten: 1060 }, RS).kiz;
  ck('[kiz-spanne] Kind 6-13: Spanne, Bescheid-Rechnung für ein 6-jähriges Kind (36 %) liegt darin', !!spT && parseInt(spT[1].a.replace(/\D/g, ''), 10) <= sp6 && parseInt(spT[1].b.replace(/\D/g, ''), 10) >= sp6 - 5, JSON.stringify(spT) + ' ' + sp6);
  // [kiz-ae16] Zwei Kinder von 14 bis 17 können beide unter 16 sein (36 % Mehrbedarf): nie fälschlich „eher nicht“ (Kinder 14 und 15)
  const ae16 = BK.rechne({ eltern: [{ brutto: 4500, netto: 2998 }], kinder: [{ alter: 14 }, { alter: 15 }], wohnkosten: 900 }, RS);
  const ae16H = { adults: 1, kids: 2, kidsU6: 0, kids14: 2, art1: 'lohn', brutto: 4500, netto: 2998, miete: 900, mietstufe: 3, vermoegen: 0, bezug: { kindergeld: true }, heute: 2026.9 };
  ck('[kiz-ae16] Kinder 14 und 15: Bescheid-Rechnung mit 36 % 14,71 € (594 - 45 % von 2.620 - 1.332,68), Hauptrechner „möglich“ statt „eher nicht“', ae16.mehrAE === 202.68 && ae16.kiz === 14.71 && L(ae16H, 'kiz') === 'vielleicht' && K(ae16H, 'kiz').includes('kiz.ae7'), [ae16.kiz, L(ae16H, 'kiz')]);
}

// [rechenbefunde] Befunde aus docs/rechenplan (21.11.2026). Erwartungen von Hand aus den Gesetzen (Abruf 21.11.2026):
// G2/K1/U1 – Unterhaltsvorschuss ist Einkommen des Kindes (§ 11 Abs. 1 Satz 1, § 9 Abs. 2 SGB II; § 6a Abs. 3 Satz 1 und 3 BKGG: 45 %;
// § 14 Abs. 2 Nr. 21 WoGG). Sicher erwarteter UVG zählte schon vorher; neu: möglicher, nicht sicherer UVG verhindert „wahrscheinlich“.
{ const al = { kids: 1, kidsU6: 1, art1: 'lohn', brutto: 1800, netto: 1350, miete: 750, mietstufe: 3, bundesland: 'BY', gebJahr: 1990, heute: 2026.9 };
  const z = (o) => { const t = res(o).m.kiz.tx.find((x) => /^schaetz\./.test(x[0])); return t ? parseInt(t[1].a.replace(/\D/g, ''), 10) : null; };
  // 45 % von 227 € = 102,15 € weniger Kinderzuschlag (Schätzung auf 10 € gerundet: 300 -> 190 €)
  ck('[rechenbefunde-k1] Allein, Kind unter 6, UVG erwartet: Kinderzuschlag um 45 % von 227 € kleiner (300 -> 190 €)', z(al) === 300 && z({ ...al, unterhaltFehlt: true }) === 190, [z(al), z({ ...al, unterhaltFehlt: true })]);
  const g = (o) => { const t = res(o).m.ggeld.tx.find((x) => x[0] === 'schaetz.eins'); return t ? parseInt(t[1].a.replace(/\D/g, ''), 10) : null; };
  ck('[rechenbefunde-g2] Allein, Kind unter 6, UVG erwartet: Grundsicherungsgeld-Lücke um 227 € kleiner (640 -> 410 €, je + 25 € Sofortzuschlag § 72 SGB II)', g(al) === 670 && g({ ...al, unterhaltFehlt: true }) === 440, [g(al), g({ ...al, unterhaltFehlt: true })]);
  const pa = { adults: 2, kids: 1, kidsU6: 1, art1: 'lohn', art2: 'ohne', brutto2: 0, miete: 900, mietstufe: 3, bundesland: 'BY', gebJahr: 1990, bezug: { kindergeld: true }, heute: 2026.9, unterhaltFehlt: true };
  // Zweite Person ohne Angabe: mit Trauschein kein UVG (§ 1 Abs. 1 Nr. 2 UVG), ohne Trauschein 227 €. Vorsichtig: „möglich“ statt „wahrscheinlich“.
  ck('[rechenbefunde-k1] Paar, zweite Person unbekannt, 3.400 €: Kinderzuschlag „möglich“ (mit UVG unter 60 €), mit Trauschein „wahrscheinlich“',
    L({ ...pa, brutto: 3400, netto: 2550 }, 'kiz') === 'vielleicht' && K({ ...pa, brutto: 3400, netto: 2550 }, 'kiz').includes('kiz.rand') && L({ ...pa, brutto: 3400, netto: 2550, uvgPartner: 'ehe' }, 'kiz') === 'ja');
  ck('[rechenbefunde-g2] Paar, zweite Person unbekannt, 3.000 €: Grundsicherungsgeld „möglich“, mit Trauschein „wahrscheinlich“',
    L({ ...pa, brutto: 3000, netto: 2250 }, 'ggeld') === 'vielleicht' && L({ ...pa, brutto: 3000, netto: 2250, uvgPartner: 'ehe' }, 'ggeld') === 'ja');
  ck('[rechenbefunde-u1] Paar, zweite Person unbekannt, 2.800 €: Wohngeld „möglich“, mit Trauschein „wahrscheinlich“',
    L({ ...pa, brutto: 2800, netto: 2100 }, 'wohngeld') === 'vielleicht' && L({ ...pa, brutto: 2800, netto: 2100, uvgPartner: 'ehe' }, 'wohngeld') === 'ja'); }
// WBS2/WBS4 – Bayern: Art. 4 Abs. 1 Satz 1 BayWoBindG mit Art. 5 Abs. 2 Nr. 1 und Abs. 3 BayWoFG (gesetze-bayern.de, Abruf 21.11.2026)
{ const W = (o) => res({ adults: 1, art1: 'lohn', miete: 600, bundesland: 'BY', heute: 2026.9, ...o }).m.wbs.level;
  // 3.500 € x 12 = 42.000 €; (42.000 - 1.230) x 0,7 = 28.539 € > 28.300 € -> „eher nicht“; mit 200 € Unterhalt (Titel) 28.539 - 2.400 = 26.139 € -> „möglich“
  ck('[rechenbefunde-wbs2] Bayern, 42.000 € Lohn: ohne Unterhalt „eher nicht“, mit 200 € tituliertem Unterhalt „möglich“', W({ brutto: 3500, netto: 2400 }) === 'nein' && W({ brutto: 3500, netto: 2400, uzBetrag: 200, uzTitel: true, uzAn: 'k1' }) === 'vielleicht');
  // 4.000 € x 12 = 48.000 €; (48.000 - 1.230) x 0,7 = 32.739 €; Unterhalt 700 € an ein Kind ohne Titel: höchstens 4.000 € -> 28.739 € > 28.300 € „eher nicht“;
  // mit Titel 8.400 € -> 24.339 € „möglich“ (Art. 5 Abs. 3 Satz 2 BayWoFG)
  ck('[rechenbefunde-wbs2] Bayern, 48.000 € Lohn, 700 € Unterhalt an ein Kind: ohne Titel höchstens 4.000 € („eher nicht“), mit Titel ganz („möglich“)',
    W({ brutto: 4000, netto: 2700, uzBetrag: 700, uzAn: 'k1' }) === 'nein' && W({ brutto: 4000, netto: 2700, uzBetrag: 700, uzAn: 'k1', uzTitel: true }) === 'vielleicht');
  // GdB 50 ohne Pflegegrad: 4.000 € (28.539 - 4.000 = 24.539 €) -> „möglich“ (vorher nach § 24 WoFG ohne Pflegegrad 0 €)
  // Prüfung 21.11.2026: „3 oder mehr Kinder“ und „frühere Partner und Kinder“ nennen die Zahl der Kinder nicht -> kein Deckel (Art. 5 Abs. 3
  // Satz 2 BayWoFG gilt je Person); früherer Partner allein: 6.000 € (32.739 − 6.000 = 26.739 € „möglich“; 53.000 € Lohn: 30.239 € „eher nicht“)
  ck('[rechenbefunde-wbs2] Bayern, 48.000 € Lohn, 1.500 € Unterhalt ohne Titel an 3 oder mehr Kinder bzw. Partner und Kinder: „möglich“ (Zahl der Kinder unbekannt)',
    W({ brutto: 4000, netto: 2700, uzBetrag: 1500, uzAn: 'k3' }) === 'vielleicht' && W({ brutto: 4000, netto: 2700, uzBetrag: 1500, uzAn: 'exk' }) === 'vielleicht');
  ck('[rechenbefunde-wbs2] Bayern, 700 € Unterhalt ohne Titel an früheren Partner: höchstens 6.000 € (48.000 € „möglich“, 53.000 € „eher nicht“)',
    W({ brutto: 4000, netto: 2700, uzBetrag: 700, uzAn: 'ex' }) === 'vielleicht' && W({ brutto: 4417, netto: 2900, uzBetrag: 700, uzAn: 'ex' }) === 'nein');
  ck('[rechenbefunde-wbs4] Bayern, 42.000 € Lohn, GdB 50 ohne Pflegegrad: Freibetrag 4.000 € -> „möglich“', W({ brutto: 3500, netto: 2400, gdb: '50' }) === 'vielleicht'); }

// B1 – BAföG-Einstufung mit dem Einkommen nach § 21 BAföG (gesetze-im-internet.de/baf_g/__21.html, Abruf 21.11.2026) statt Netto.
// Paar, ein Kind in Ausbildung, Freibetrag 2.540 € (§ 25 Abs. 1 Nr. 1). Beiträge von Hand: KV 7,3 + 1,45, PV 1,8, RV 9,3, AV 1,3 = 21,15 %.
{ const B = (b, nt) => res({ adults: 2, kids: 1, art1: 'lohn', art2: 'ohne', brutto: b, brutto2: 0, netto: nt, ausbildung: 'kind', miete: 700, heute: 2026.9 }).m.bafoeg.level;
  // Prüfung 21.11.2026: Als Steuer zählt für „wahrscheinlich“ höchstens die Lohnsteuer laut Steuerbescheid (verheiratete Eltern: Splitting,
  // Steuerklasse III; § 21 Abs. 1 Satz 3 Nr. 3, § 25 Abs. 1 Nr. 1 BAföG). 3.400 € brutto, 2.583 € netto (Steuerklasse III): Beiträge 21,15 % =
  // 719,10 €, Steuer 97,90 €, Lohnsteuer III 97,83 €; (3.400 − 102,50) × (1 − 0,223) − 97,83 = 2.464,33 € ≤ 2.540 € -> „wahrscheinlich“
  // (mit dem Netto 2.583 € „möglich“).
  ck('[rechenbefunde-b1] BAföG Kind: 3.400 € brutto / 2.583 € netto (Steuerklasse III) -> Einkommen § 21 2.464,33 € ≤ 2.540 € „wahrscheinlich“', B(3400, 2583) === 'ja', B(3400, 2583));
  // 3.800 € brutto, 2.650 € netto (Steuerklasse IV oder I): Brutto − Netto − Beiträge = 346,30 € wäre als Steuer zu hoch (Splitting: 168,83 €);
  // (3.800 − 102,50) × (1 − 0,223) − 168,83 = 2.704,13 € > 2.540 € -> „möglich“, nicht „wahrscheinlich“
  ck('[rechenbefunde-b1] BAföG Kind: 3.800 € brutto / 2.650 € netto -> Steuer höchstens nach Splitting, 2.704,13 € > 2.540 € „möglich“', B(3800, 2650) === 'vielleicht', B(3800, 2650));
  // 7.000 € brutto, 4.800 € netto: Beiträge 742,00 + 613,22 = 1.355,22 €; Steuer 844,78 €; 6.897,50 − 1.433,33 (Höchstbetrag) − 844,78 = 4.619,39 €;
  // (4.619,39 − 2.540) × 50 % = 1.039,70 € ≤ 1.078,50 € -> „möglich“ (mit Netto 4.800 €: 1.130 € -> „eher nicht“)
  ck('[rechenbefunde-b1] BAföG Kind: 7.000 € brutto / 4.800 € netto -> Anrechnung 1.039,70 € unter dem höchsten Bedarf „möglich“', B(7000, 4800) === 'vielleicht', B(7000, 4800)); }

// Befund 10 – § 25 Abs. 4 BAföG: vom Elterneinkommen über dem Freibetrag wird nur die Hälfte angerechnet (ohne weitere Kinder mit Freibetrag:
// 50 %). Quellen: § 25 Abs. 1 Nr. 1 und Abs. 4, § 21, §§ 13, 13a, § 51 Abs. 3 und 4 BAföG (https://www.gesetze-im-internet.de/baf_g/__25.html,
// Abruf 22.11.2026; Werte ab WS 2026/27: Freibetrag 2.540 €, Grundbedarf 475 €, Wohnen 59 € / 380 €, KV/PV 102 + 35 €).
// Paar, ein Kind in Ausbildung, nur Rente (kein Lohn: Einkommen nach § 21 für „eher nicht“ = das Netto; untere Schätzung 80 %).
{ const BR = (b) => res({ adults: 2, kids: 1, art1: 'rente', art2: 'ohne', brutto: b, brutto2: 0, netto: b, ausbildung: 'kind', miete: 700, heute: 2026.9 }).m.bafoeg;
  // 3.800 €: (3.800 − 2.540) × 50 % = 630 € ≤ 1.088 − 10 + 0,5 = 1.078,50 € -> „möglich“ (voll angerechnet: 1.260 € -> fälschlich „eher nicht“)
  ck('[bafoeg-eltern] BAföG Kind: Rente 3.800 € -> Anrechnung 50 % = 630 € unter dem höchsten Bedarf „möglich“', BR(3800).level === 'vielleicht', BR(3800).level);
  // 3.200 €: Einkommen 2.560 € (80 %) bis 3.200 €; Anrechnung (2.560 − 2.540) × 50 % = 10 € bis (3.200 − 2.540) × 50 % = 330 €.
  // Spanne: 475 + 59 − 330 = 204 € (abgerundet 200 €) bis 475 + 380 + 137 − 10 = 982 € (aufgerundet 990 €); voll angerechnet: 534 − 660 < 0 -> „bis 980 €“
  const t = BR(3200).tx;
  ck('[bafoeg-eltern] BAföG Kind: Rente 3.200 € -> Spanne 200 bis 990 € (Anrechnung 50 % über dem Freibetrag)', BR(3200).level === 'vielleicht' && t[1][0] === 'schaetz.spanne' && t[1][1].a === '200 €' && t[1][1].b === '990 €' && t[2][1].a === '204 €' && t[2][1].c === '525 €', JSON.stringify(t)); }

// E2 – Elterngeld-Netto mit den Pauschalen nach § 2f BEEG (9 + 10 + 2 % = 21 %, gesetze-im-internet.de/beeg/__2f.html, Abruf 21.11.2026).
// Allein, erstes Kind, 2.000 € netto, Steuerklasse I, kinderlos: Brutto 2.904 €, echte Beiträge 21,75 % = 631,62 €, Pauschale 609,84 €
// -> Elterngeld-Netto 2.021,78 €; minus 102,50 € (§ 2c) = 1.919,28 €; 65 % = 1.247,53 € -> 1.248 € (mit dem Netto: 1.233 €).
// 1.200 € netto liegt im Übergangsbereich (Brutto unter 2.000 €): unverändert (1.097,50 € × 67 % = 735 €).
{ const EG = (v) => res({ adults: 1, baby: 'bald', egVor: v, heute: 2026.9 }).m.elterngeld.tx[0][1].basis;
  ck('[rechenbefunde-e2] Elterngeld 2.000 € netto (kinderlos, Steuerklasse I): Elterngeld-Netto 2.021,78 € -> 1.248 €', EG(2000) === '1.248 €', EG(2000));
  ck('[rechenbefunde-e2] Elterngeld 1.200 € netto (Übergangsbereich): unverändert 735 €', EG(1200) === '735 €', EG(1200)); }

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '\nFall-Tests bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
