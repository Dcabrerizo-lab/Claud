// Abgleich Runde 2 (21.11.2026): Fälle aus amtlichen Rechenbeispielen, Merkblättern, Urteilen und Gesetzestexten
// (Bericht /ausgabe/abgleich2, Abschnitt 6) und Regressionstests zu den Befunden 10 bis 15 sowie Hinweis H3.
// Alle Fälle ohne Internet prüfbar. Quellen je Fall im Namen; Abrufdatum 21.11.2026, wenn nichts anderes steht.
'use strict';
const R = require('../src/rules.js');
const BGSA = require('../erweiterungen/bescheid-gsa.js');
const I18N = require('../dist/i18n.js');
const U = R.RULES, HEUTE = 2026.9;
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FAIL', name, info !== undefined ? JSON.stringify(info) : ''); } };
const ev = (inp) => R.evaluate(Object.assign({ heute: HEUTE, vermoegen: 0, bezug: {} }, inp));
const karte = (inp, id) => ev(inp).results.find((r) => r.id === id);
const betrag = (k) => { const t = k.tx.find((x) => /^schaetz\./.test(x[0])); return t ? t[1] : null; };
const par = (k, key) => { const t = k.tx.find((x) => x[0] === key); return t ? (t[1] || {}) : null; };
const nah = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 0.011 : tol);

// ---------------------------------------------------------------- Grundsicherungsgeld (BA, FW § 12 SGB II, 01.07.2026, Rz. 12.36/12.37)
{
  const fam = (v) => karte({ adults: 2, kids: 1, kidsU6: 1, kidsAlter: true, einkommen: [], miete: 700, mietstufe: '3', gebJahr: 1989, vermoegen: v }, 'ggeld');
  ok('[mb2-ggeld] FW-12 Rz. 12.37: Familie, 45.000 € Vermögen -> zu hoch', fam(45000).hl === 'vermHoch');
  ok('[mb2-ggeld] Familie, 25.000 € (Freibeträge 10.000 + 10.000 + 5.000) -> frei', fam(25000).hl !== 'vermHoch');
  const allein = (jahr) => karte({ adults: 1, kids: 0, einkommen: [], miete: 450, mietstufe: '3', gebJahr: jahr, vermoegen: 9000 }, 'ggeld');
  ok('[mb2-ggeld] FW-12 Rz. 12.36: 9.000 € mit 29 zu hoch, mit 30 frei', allein(1997).hl === 'vermHoch' && allein(1996).hl !== 'vermHoch');
}

// ---------------------------------------------------------------- Wohngeld: VG Bayreuth 25.06.2025 (B 8 K 25.211), Miete 408,83 € davon Heizung 81,23 €
ok('[mb2-wohngeld] VG Bayreuth: zu berücksichtigende Miete 438,00 €', nah(R.wgMiete(2, 1, 408.83, 1, 81.23), 438));

// ---------------------------------------------------------------- Unterhaltsvorschuss (UVG-RL 12.12.2025)
{
  const inp = { adults: 1, kids: 1, kids14: 1, kidsAlter: true, kinder12: true, ausbildung: 'kindBetrieb', kindEink: 700, unterhaltFehlt: true, einkommen: [{ art: 'lohn', b: 1800, n: 1400, p: 1 }], miete: 600, mietstufe: '3', bezug: { kindergeld: true } };
  const h = R.derive(Object.assign({ heute: HEUTE }, inp));
  ok('[mb2-uvg] UVG-RL 2.5.4.4: Ausbildungsvergütung 700 € -> Anrechnung 248,75 €, Rest 145,25 €', nah(h.uvgKindAnr, 248.75) && nah(h.uvgEst, 145.25), [h.uvgKindAnr, h.uvgEst]);
  const w = (wechsel) => karte({ adults: 1, kids: 1, kidsAlter: true, unterhaltFehlt: true, uvgWechsel: wechsel, einkommen: [{ art: 'lohn', b: 1800, n: 1400, p: 1 }], miete: 700, mietstufe: '3', bezug: { kindergeld: true } }, 'uvg');
  ok('[mb2-uvg] UVG-RL 1.3.1: unter 40 % beim anderen Elternteil ja, ab 40 % nein', w(false).level === 'ja' && w(true).level === 'nein');
}

// ---------------------------------------------------------------- Grundsicherung im Alter (DRV „Die Grundsicherung: Hilfe für Rentner“, 5/2026)
{
  const k1 = karte({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 325, n: 325, p: 1 }], miete: 535, heizkosten: 35, mietstufe: '4', gebJahr: 1958, mzG: true, gdb: '50' }, 'gsa');
  const b1 = BGSA.pruefe({ personen: [{ mzG: true, renteNetto: 325 }], miete: { tatsaechlich: 500, heizung: 35 }, bescheid: {} }, R);
  ok('[mb2-gsa] DRV S. 16 Gerda M.: App 870 €, Bescheid-Check 868,71 €', betrag(k1).a.eur === 870 && nah(b1.erwartet.zahlbetrag, 868.71), [betrag(k1), b1.erwartet]);
  const k2 = karte({ adults: 2, kids: 0, einkommen: [{ art: 'rente', b: 480, n: 480, p: 1 }, { art: 'rente', b: 765, n: 765, p: 2 }], miete: 516, heizkosten: 66, mietstufe: '2', gebJahr: 1958, erwerbsgemindert: true }, 'gsa');
  const b2 = BGSA.pruefe({ personen: [{ renteNetto: 480 }, { renteNetto: 765 }], miete: { tatsaechlich: 450, heizung: 66 }, bescheid: {} }, R);
  ok('[mb2-gsa] DRV S. 17 Paar: App 280 €, Bescheid-Check 283,00 €', betrag(k2).a.eur === 280 && nah(b2.erwartet.zahlbetrag, 283), [betrag(k2), b2.erwartet]);
  const k3 = karte({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 870, n: 776, p: 1 }], miete: 595, heizkosten: 40, mietstufe: '4', gebJahr: 1955, grundrente33: true }, 'gsa');
  const b3 = BGSA.pruefe({ personen: [{ renteNetto: 776, renteBrutto: 870, grundrente33: true }], miete: { tatsaechlich: 555, heizung: 40 }, bescheid: {} }, R);
  ok('[mb2-gsa] DRV S. 18 Harald F.: App 660 €, Bescheid-Check 663,50 €', betrag(k3).a.eur === 660 && nah(b3.erwartet.zahlbetrag, 663.5), [betrag(k3), b3.erwartet]);
  // Befund 14: § 82a Abs. 1 SGB XII aus der Bruttorente. Bruttorente 600 €, netto 535 €: Freibetrag 100 + 30 % von 500 = 250 €;
  // Bedarf 563 + 595 = 1.158 €, Einkommen 535 − 250 = 285 € -> 873,00 €
  const k4 = karte({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 600, n: 535, p: 1 }], miete: 595, heizkosten: 40, mietstufe: '4', gebJahr: 1955, grundrente33: true }, 'gsa');
  const b4 = BGSA.pruefe({ personen: [{ renteNetto: 535, renteBrutto: 600, grundrente33: true }], miete: { tatsaechlich: 555, heizung: 40 }, bescheid: {} }, R);
  ok('[mb2-gsa] Befund 14: Grundrente brutto 600 € -> 873,00 € (App 870 €)', betrag(k4).a.eur === 870 && nah(b4.erwartet.zahlbetrag, 873), [betrag(k4), b4.erwartet]);
  // Grenze: Freibetrag nie höher als die Netto-Rente selbst
  const k5 = karte({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 120, n: 105, p: 1 }], miete: 500, heizkosten: 40, mietstufe: '4', gebJahr: 1955, grundrente33: true }, 'gsa');
  ok('[mb2-gsa] Befund 14: kleine Rente 120/105 € -> Rente zählt gar nicht (Bedarf 1.063 €)', betrag(k5).a.eur === 1060, betrag(k5));
}

// ---------------------------------------------------------------- Elterngeld (BMBFSFJ „Elterngeld und Elternzeit“, 10/2025)
{
  const eg = (v, extra) => karte(Object.assign({ adults: 1, baby: 'bald', egVor: v, art1: 'lohn', brutto: 2000, netto: 1500, kids: 0 }, extra || {}), 'elterngeld');
  const b = (k) => par(k, 'eg.ja').basis.eur;
  // Die Broschüre nennt das Elterngeld-Netto (700 / 2.500 / 2.000 €). Eingabe in SoLo plus 102,50 € (§ 2c Abs. 1 BEEG: 1.230 € / 12)
  ok('[mb2-eg] EG-Br 1.4.2: 802,50 € -> 574 €', nah(b(eg(802.5)), 574, 0.5));
  ok('[mb2-eg] EG-Br 2.2: 2.602,50 € -> 1.625 €', nah(b(eg(2602.5)), 1625, 0.5));
  ok('[mb2-eg] EG-Br 1.4.4: zwei Geschwister unter 6 -> 1.430 €', nah(b(eg(2102.5, { kids: 2, kidsU6: 2 })), 1430, 0.5));
}

// ---------------------------------------------------------------- Mutterschaftsgeld (Familienportal)
{
  const k = karte({ adults: 1, kids: 0, baby: 'bald', einkommen: [{ art: 'lohn', b: 2500, n: 1800, p: 1 }], miete: 600 }, 'mutter');
  const p = k.tx[0][1];
  ok('[mb2-mutter] 13 € am Tag, 210 € BAS, Fristen 6/8/12', k.level === 'ja' && p.tag.eur === 13 && p.bas.eur === 210 && p.vor === 6 && p.nach === 8 && p.nachLang === 12);
}

// ---------------------------------------------------------------- BAföG (bafög.de Beispiele; §§ 25, 29, 30 BAföG)
{
  const el = (netto, extra) => karte(Object.assign({ adults: 2, kids: 0, young: 1, ausbildung: 'kind', einkommen: [{ art: 'lohn', b: netto * 1.4, n: netto, p: 1 }], miete: 900 }, extra || {}), 'bafoeg');
  ok('[mb2-bafoeg] Alexa: 3.106,28 €, zwei Geschwister -> wahrscheinlich', el(3106.28, { kids: 2, kidsU6: 1 }).level === 'ja');
  ok('[mb2-bafoeg] Olga: 2.689,39 € -> möglich', el(2689.39).level === 'vielleicht');
  // Befund 10: § 25 Abs. 4 BAföG. 1.500 € über dem Freibetrag -> Anrechnung 750 €, 105 € bleiben -> nicht „eher nicht“
  ok('[mb2-bafoeg] Befund 10: 1.500 € über dem Freibetrag -> möglich', el(2540 + 1500).level === 'vielleicht', el(2540 + 1500).tx);
  // Grenze: 50 % von (Netto − 2.540) > 1.078,50 € (1.088 € minus Mindestbetrag 10 € mit Rundung, § 51 Abs. 3, 4) -> „eher nicht“ erst über 4.697 €
  ok('[mb2-bafoeg] Befund 10: Grenze 4.697 € (Paar, 1 Kind; 1.088 € − 9,50 €, § 51 Abs. 3, 4)', el(4697).level === 'vielleicht' && el(4698).level === 'nein', [el(4697).level, el(4698).level]);
  // Mit einem weiteren Kind: Freibetrag 3.310 €, frei 55 %: 1.078,50 / 0,45 = 2.396,67 € -> Grenze 5.706,67 €
  ok('[mb2-bafoeg] Befund 10: 5 % mehr frei je Kind mit Freibetrag (Grenze 5.706 €)', el(5706, { kids: 1 }).level === 'vielleicht' && el(5707, { kids: 1 }).level === 'nein', [el(5706, { kids: 1 }).level, el(5707, { kids: 1 }).level]);
  // Befund 11: § 30 BAföG. Stefan: 14.500 € + Pkw 2.500 € -> 2.000 € über dem Freibetrag, 166,67 € im Monat weniger
  const st = karte({ adults: 1, kids: 0, ausbildung: 'ich', einkommen: [], wohnform: 'eltern', gebJahr: 2007, vermoegen: 14500, autoWert: 2500 }, 'bafoeg');
  const vt = par(st, 'bafoeg.vermTeil');
  ok('[mb2-bafoeg] Befund 11: Stefan 17.000 € -> möglich, etwa 167 € im Monat weniger', st.level === 'vielleicht' && vt && vt.verm.eur === 15000 && vt.monat.eur === 167, st.tx);
  const v = (verm, geb) => karte({ adults: 1, kids: 0, ausbildung: 'ich', einkommen: [], wohnform: 'eltern', gebJahr: geb || 2007, vermoegen: verm }, 'bafoeg');
  ok('[mb2-bafoeg] Befund 11: unter dem Freibetrag kein Hinweis', !par(v(15000), 'bafoeg.vermTeil') && v(15000).level === 'vielleicht');
  ok('[mb2-bafoeg] Befund 11: über 15.000 + 12 × (1.088 − 9,50) € -> eher nicht (§ 51 Abs. 4)', v(27943).level === 'nein' && v(27943).hl === 'vermHoch' && v(27942).level === 'vielleicht');
  ok('[mb2-bafoeg] Befund 11: ab 30 Freibetrag 45.000 € (§ 29 Abs. 1 Nr. 1)', par(v(50000, 1990), 'bafoeg.vermTeil').verm.eur === 45000 && v(58057, 1990).level === 'nein');
  ok('[mb2-bafoeg] Text vermTeil in allen Sprachen', Object.keys(I18N).every((l) => typeof I18N[l]['t.bafoeg.vermTeil'] === 'string' && I18N[l]['t.bafoeg.vermTeil'].includes('12')));
}

// ---------------------------------------------------------------- Pflege
ok('[mb2-pflege] Kombinationsleistung PG 3, Pflegedienst 1.092,81 € -> 161,73 €', nah(R.pflegeKombi(3, 1092.81), 161.73));

// ---------------------------------------------------------------- Hilfe zur Pflege, Blindenhilfe (§ 85 Abs. 1 SGB XII; BSG 30.04.2020, B 8 SO 1/19 R)
// Prüfung 21.11.2026: Heizkosten gehören zu den Aufwendungen für die Unterkunft (BSG-Leitsatz). Der erste Stand von Befund 15 („ohne Heizung“,
// nach dem Infoblatt Nr. 37 der Pflegestützpunkte Berlin) ist zurückgenommen; geblieben ist der aufgerundete Familienzuschlag (395 €).
{
  const hz = (o) => karte(Object.assign({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 1700, n: 1500, p: 1 }], pflegegrad: '3', gebJahr: 1945 }, o), 'hzp');
  const g = (k) => k.tx[0][1].grenze.eur;
  ok('[mb2-hzp] allein, Unterkunft 500 € -> 2 × 563 + 500 = 1.626 €', g(hz({ miete: 500 })) === 1626, g(hz({ miete: 500 })));
  ok('[mb2-hzp] Befund 15: Ehepaar 2.021 € (Familienzuschlag 395 € aufgerundet, § 85 Abs. 1 Nr. 3)', g(hz({ adults: 2, miete: 500 })) === 2021, g(hz({ adults: 2, miete: 500 })));
  const k3 = hz({ miete: 600, heizkosten: 100, einkommen: [{ art: 'rente', b: 1900, n: 1680, p: 1 }] });
  ok('[mb2-hzp] BSG B 8 SO 1/19 R: Warmmiete 600 € davon Heizung 100 €, Netto 1.680 € -> Grenze 1.726 €, darunter', g(k3) === 1726 && k3.tx[0][0] === 'hzp.unter', k3.tx);
  ok('[mb2-hzp] Heizkosten-Angabe ändert die Grenze nicht', g(hz({ miete: 600 })) === 1726 && g(hz({ miete: 600, heizkosten: 250 })) === 1726);
  const k4 = hz({ miete: 600, heizkosten: 100, einkommen: [{ art: 'rente', b: 1960, n: 1727, p: 1 }] });
  ok('[mb2-hzp] 1 € über der Grenze -> Text „darüber“, weiter möglich', k4.tx[0][0] === 'hzp.ueber' && k4.level === 'vielleicht', k4.tx);
  const bl = karte({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 1900, n: 1680, p: 1 }], miete: 600, heizkosten: 100, blind: 'blind', gdb: '100', gebJahr: 1960, bundesland: 'BY' }, 'blh');
  ok('[mb2-blh] Blindenhilfe: gleiche Grenze mit Heizung (1.726 €)', bl.tx[0][0] === 'blh.unter' && bl.tx[0][1].grenze.eur === 1726, bl.tx[0]);
  const v = (verm) => hz({ adults: 2, miete: 500, vermoegen: verm });
  ok('[mb2-hzp] Schonvermögen Ehepaar 20.000 €', v(20000).level === 'vielleicht' && v(20500).hl === 'vermHoch');
}

// ---------------------------------------------------------------- Blindengeld Bayern (ZBFS 7/2026; Art. 4 Abs. 1 BayBlindG)
{
  const bg = (pg, blind) => karte({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 1100, n: 970, p: 1 }], miete: 500, blind: blind || 'blind', gdb: '100', gebJahr: 1960, bundesland: 'BY', pflegegrad: pg || '' }, 'blindengeld');
  ok('[mb2-blind] ohne Pflegegrad 809 €', bg('').tx[0][1].betrag.eur === 809);
  ok('[mb2-blind] PG 2: Rest 649,38 € / sehbehindert 83,08 €', par(bg('2'), 'blindengeld.pflege').rest.eur === 649.38 && par(bg('2', 'hoch'), 'blindengeld.pflege').rest.eur === 83.08);
  ['3', '4', '5'].forEach((pg) => {
    const p = par(bg(pg), 'blindengeld.pflege');
    ok('[mb2-blind] Befund 12: PG ' + pg + ' Kürzung 197,67 €, Rest 611,33 €', p.kuerz.eur === 197.67 && p.rest.eur === 611.33, p);
  });
  ok('[mb2-blind] Befund 12: sehbehindert PG 5 -> 242,70 − 197,67 = 45,03 €', par(bg('5', 'hoch'), 'blindengeld.pflege').rest.eur === 45.03);
}

// ---------------------------------------------------------------- Landespflegegeld (Art. 2 BayLPflGG) und Hinweis H3
{
  const l = (land, pg) => karte({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 1200, n: 1060, p: 1 }], miete: 500, pflegegrad: pg || '2', gebJahr: 1945, bundesland: land }, 'lpg');
  ok('[mb2-lpg] PG 2 in Bayern 500 €, Hessen nein', l('BY').level === 'ja' && l('BY').tx[0][1].betrag.eur === 500 && l('HE').level === 'nein');
  ok('[mb2-lpg] H3: Auszahlung bis 31. Januar (Art. 2 Abs. 4 Satz 2) in allen Sprachen', Object.keys(I18N).every((x) => /31/.test(I18N[x]['t.lpg.antrag'])));
  // Prüfung 21.11.2026: keine feste Zusage („spätestens“), weil der Antrag noch bis 3 Monate nach Jahresende möglich ist (Art. 3 Abs. 1 Satz 1)
  ok('[mb2-lpg] H3: „in der Regel“ statt „spätestens“', /in der Regel bis zum 31\. Januar/.test(I18N.de['t.lpg.antrag']) && !/spätestens/.test(I18N.de['t.lpg.antrag']) && /usually/.test(I18N.en['t.lpg.antrag']) && !/at the latest/.test(I18N.en['t.lpg.antrag']));
}

// ---------------------------------------------------------------- Arbeitslosengeld, Krankengeld (Merkblatt 1 BA; § 153 SGB III; § 47 SGB V)
{
  const al = (extra) => karte(Object.assign({ adults: 1, kids: 0, art1: 'ohne', brutto: 0, netto: 0, miete: 600, arbeitSit: 'arbeitslos', algZeit: true, gebJahr: 1985 }, extra), 'alg1');
  ok('[mb2-alg] 16 Monate -> 8 Monate; 48 ab 58 -> 24', par(al({ algMonate: 16 }), 'alg1.dauer').m === 8 && par(al({ algMonate: 48, gebJahr: 1966 }), 'alg1.dauer').m === 24);
  // Befund 13: amtliches Beispiel 2.400 € brutto, Steuerklasse III, Kind: 1.286,40 € im Monat muss in der Spanne liegen
  const sp = betrag(al({ algMonate: 12, lohnVorher: 2400, adults: 2, kids: 1, kidsAlter: true }));
  ok('[mb2-alg] Befund 13: Merkblatt 1 Abschnitt 4: 1.286,40 € in der Spanne', sp && sp.a.eur <= 1286.4 && sp.b.eur >= 1286.4, sp);
  // Fester Anker (Prüfung 21.11.2026): bei 2.400 € fällt in Steuerklasse III keine Lohnsteuer an -> oben genau 2.400 × 80 % × 67 % = 1.286,40 -> 1.290 €;
  // ohne Kind 2.400 × 80 % × 60 % = 1.152 -> 1.150 €; unten 2.400 × 60 % × 67 % = 964,80 -> 960 €. Hängt nicht an der Lohnsteuer-Umsetzung.
  ok('[mb2-alg] Befund 13: 2.400 € -> genau 960 bis 1.290 € (mit Kind), oben 1.150 € (ohne Kind)', sp.a.eur === 960 && sp.b.eur === 1290 && betrag(al({ algMonate: 12, lohnVorher: 2400 })).b.eur === 1150, sp);
  ok('[mb2-alg] Sozialversicherungspauschale 20 % (§ 153 Abs. 1 Satz 2 Nr. 1 SGB III)', U.alg.svPausch === 0.2);
  // Obere Grenze nie über 80 % (ohne Lohnsteuer) und bei hohem Lohn unter 80 % (Lohnsteuer Klasse III)
  const hoch = betrag(al({ algMonate: 12, lohnVorher: 8000, kids: 1 }));
  ok('[mb2-alg] Befund 13: 8.000 € brutto, Kind: oben unter 67 % × 80 % (Lohnsteuer III abgezogen)', hoch.b.eur < 0.67 * 0.8 * 8000 - 100 && hoch.b.eur > 0.67 * 0.72 * 8000, hoch);
  const kg = betrag(karte({ adults: 1, kids: 1, kidsAlter: true, art1: 'lohn', brutto: 3000, netto: 2100, miete: 700, arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 3000, gebJahr: 1966 }, 'krankengeld'));
  ok('[mb2-krank] § 47 Abs. 1 SGB V zu Fuß: brutto 3.000 €, netto 2.100 € -> 90 % netto 1.890 € minus Beiträge = rund 1.655 € in der Spanne', kg.a.eur <= 1655.7 && kg.b.eur >= 1655.7, kg);
  const kg2 = betrag(karte({ adults: 2, kids: 1, kidsAlter: true, art1: 'lohn', brutto: 2400, netto: 1900, miete: 700, arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: 2400, gebJahr: 1980 }, 'krankengeld'));
  // Steuerklasse III, 2.400 €: Netto rund 1.890 €; 90 % = 1.700 € > 70 % brutto 1.680 € -> 1.680 × 0,875 = 1.470 €
  ok('[mb2-krank] Befund 13: 2.400 € Steuerklasse III -> 1.470 € in der Spanne', kg2.a.eur <= 1470 && kg2.b.eur >= 1470, kg2);
  ok('[mb2-krank] Höchstbetrag 135,63 € am Tag', (U.krank.bbg / 30 * 0.7).toFixed(2) === '135.63');
}

// ---------------------------------------------------------------- Rente für schwerbehinderte Menschen (DRV-KBS 20.04.2026)
{
  const sr = (j) => par(karte({ adults: 1, kids: 0, einkommen: [{ art: 'lohn', b: 2500, n: 1800, p: 1 }], miete: 600, gdb: '50', gebJahr: j }, 'srente'), 'srente.alter2');
  const a = sr(1964), b = sr(1960), c = sr(1963);
  ok('[mb2-srente] 1964: 65+0 / 62+0; 1960: 64+4 / 61+4; 1963: 64+10 / 61+10', a.fj === 65 && a.fm === 0 && a.gj === 62 && b.fj === 64 && b.fm === 4 && b.gj === 61 && b.gm === 4 && c.fm === 10 && c.gm === 10);
}

// ---------------------------------------------------------------- Pauschbetrag (§ 33b EStG)
{
  const P = U.beh.pausch;
  ok('[mb2-pausch] 384 / 620 / 860 / 1.140 / 2.840 / 7.400 €', P[20] === 384 && P[30] === 620 && P[40] === 860 && P[50] === 1140 && P[100] === 2840 && P.H === 7400);
}

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen (Abgleich 2)` : `Abgleich 2 (Musterbescheide und amtliche Beispiele): alle ${n} Prüfungen bestanden`);
process.exit(f ? 1 : 0);
