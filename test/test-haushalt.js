// Haushaltsplan und Haushaltsbuch (src/haushalt.js): Rechnung, Kategorien, Monatswechsel, Rundung, Kassenzettel, Übernahme, Hinweise
'use strict';
const H = require('../src/haushalt.js');
const fs = require('fs'), path = require('path');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const heute = new Date(2026, 10, 20);

// Beträge und Rundung
check('zuCent deutsch', H.zuCent('1.234,56') === 123456 && H.zuCent('12,5') === 1250 && H.zuCent('950.50') === 95050 && H.zuCent(12.34) === 1234);
check('zuCent ungültig', H.zuCent('') === null && H.zuCent('-5') === null && H.zuCent('abc') === null && H.zuCent(null) === null);
check('Fließkomma: 0,1 + 0,2 genau', H.planRechnung([H.zuCent('0,10'), H.zuCent('0,20')], {}).ein === 30);
check('etwa: auf ganze Euro gerundet', H.euroGanz(31249) === 312 && H.euroGanz(31250) === 313 && H.euroGanz(-31260) === -313);

// Plan
const r = H.planRechnung([150000, 25900, null], { miete: 65000, energie: 9000, essen: 30000, raten: 5000 });
check('[hb-plan] Plan: Einnahmen, Ausgaben, Rest', r.ein === 175900 && r.aus === 109000 && r.rest === 66900 && r.restEuro === 669, r);
check('Plan: unbekannte Kategorien zählen nicht', H.planRechnung([1000], { quatsch: 999 }).aus === 0);
check('Plan: negative Werte zählen nicht', H.planRechnung([1000, -500], { miete: -100 }).ein === 1000);
check('Plan: Minus', H.planRechnung([100000], { miete: 120000 }).rest === -20000);
check('Plan: leer', H.planRechnung([], {}).leer === true);
check('Plan: knapp bei weniger als einem Zehntel', H.planRechnung([100000], { miete: 95000 }).knapp && !H.planRechnung([100000], { miete: 80000 }).knapp);
check('Kategorien: 9 feste', H.KAT.join() === 'miete,energie,handy,vers,mobil,essen,kinder,raten,sonst');

// Monate
check('Monatswechsel Jahresende', H.monatPlus('2026-12', 1) === '2027-01' && H.monatPlus('2027-01', -1) === '2026-12' && H.monatPlus('2026-05', -17) === '2024-12');
const buch = [
  { id: 'a', d: '2026-10-05', c: 1999, k: 'essen' },
  { id: 'b', d: '2026-11-03', c: 4550, k: 'essen', n: 'REWE' },
  { id: 'c', d: '2026-01-31', c: 1500, k: 'handy', w: true },
  { id: 'd', d: '2026-11-10', c: 2000, k: 'mobil', w: true, bis: '2026-12' },
  { id: 'e', d: '2026-11-11', c: 700, k: 'gibtsnicht' }
];
const nov = H.monatsEintraege(buch, '2026-11');
check('Liste pro Monat inkl. wiederkehrender', nov.map((e) => e.id).sort().join() === 'b,c,d,e', nov);
const feb = H.monatsEintraege(buch, '2026-02');
check('Wiederkehrend am 31.: im Februar am letzten Tag', feb.length === 1 && feb[0].d === '2026-02-28' && feb[0].kopie === true, feb);
check('Wiederkehrend vor Start nicht', H.monatsEintraege(buch, '2025-12').length === 0);
check('Wiederkehrend nach Ende nicht', !H.monatsEintraege(buch, '2027-01').some((e) => e.id === 'd') && H.monatsEintraege(buch, '2026-12').some((e) => e.id === 'd'));
const kat = H.nachKategorie(buch, '2026-11');
check('Unbekannte Kategorie zählt als Sonstiges', kat.sonst === 700 && kat.essen === 4550 && kat.handy === 1500);
const aw = H.auswertung(buch, '2026-11');
check('Auswertung sortiert, mit Vormonat', aw.zeilen[0].k === 'essen' && aw.zeilen[0].vor === 1999 && aw.zeilen[0].diff === 2551 && aw.summe === 8750 && aw.vorSumme === 1999 + 1500, aw);
check('Höchstens 3 Spartipps, größte Posten zuerst', H.tipps(aw).length === 3 && H.tipps(aw)[0] === 'essen');
check('Keine Tipps ohne Ausgaben', H.tipps(H.auswertung([], '2026-11')).length === 0);

// Regelbedarf (§ 5 RBEG): Summe der Abteilungen 434,96 €
check('[hb-regelbedarf] RBEG § 5: Anteile', (() => { const a = H.regelbedarfAnteile(563); const e = a.find((x) => x.k === 'essen'); return e.prozent === 35 && e.euro === 195; })());

// Kassenzettel
const Z = [
  ['REWE Markt GmbH\nHauptstr. 5\n90542 Eckental\nMilch 1,19\nBrot 2,49\nSUMME EUR 3,68\nGeg. Bar 5,00\nRückgeld 1,32\nMwSt 7% Netto 3,44\n12.11.2026 14:33', { summe: 368, datum: '2026-11-12', geschaeft: 'REWE', kat: 'essen', sicher: true }],
  ['LIDL\nBananen 1,29\nZu zahlen 12,47\nKartenzahlung 12,47\n03.11.26', { summe: 1247, datum: '2026-11-03', geschaeft: 'LIDL', kat: 'essen', sicher: true }],
  ['ARAL Tankstelle\nSuper E10 45,20 l\nGesamt\n78,90\nEC-Karte 78,90\n2026-11-18', { summe: 7890, datum: '2026-11-18', geschaeft: 'Aral', kat: 'mobil', sicher: true }],
  ['dm-drogerie markt\nZwischensumme 9,90\nSUMME 9,90\n01.11.2026', { summe: 990, geschaeft: 'dm', kat: 'sonst', sicher: true }],
  ['Bäckerei Müller\n2 Brezen 1,80\nGesamt EUR 1 ,80\n19.11.2026', { summe: 180, kat: 'essen', sicher: true }],
  ['unleserlich #### ~~\n%%%', { summe: null, datum: null, geschaeft: null, kat: null, sicher: false }],
  ['Kleiner Laden\nArtikel 4,99\nEC-Karte 4,99', { summe: 499, sicher: false }],
  ['TotalEnergies Station\nDiesel 40,00\nSUMME 61,20\n10.11.2026', { summe: 6120, geschaeft: 'TotalEnergies', kat: 'mobil' }],
  ['EDEKA\nSumme 1.234,50\n15.11.2026', { summe: 123450 }],
  ['ALDI SÜD\nSUMME 7,77\n01.01.2019', { summe: 777, datum: null }],
  ['PENNY\nSUMME 5,55\n21.12.2026', { datum: null }],
  ['NETTO Marken-Discount\nNetto 10,00\nMwSt 0,70\nSUMME 10,70', { summe: 1070, geschaeft: 'Netto', kat: 'essen' }]
];
Z.forEach(([txt, soll], i) => {
  const ist = H.kassenzettel(txt, heute);
  Object.keys(soll).forEach((k) => check('[hb-kassenzettel] Kassenzettel ' + (i + 1) + ': ' + k, ist[k] === soll[k], { soll: soll[k], ist: ist[k], alles: ist }));
});

// CSV: Semikolon, Komma als Dezimalzeichen, gefährliche Zellen entschärft
const c = H.csv([{ id: 'x', d: '2026-11-02', c: 1234, k: 'essen', n: '=SUMME(A1); "x"' }], ['Datum', 'Kategorie', 'Betrag', 'Notiz', 'jeden Monat'], (k) => k, '2026-11', '2026-11');
check('CSV', c === 'Datum;Kategorie;Betrag;Notiz;jeden Monat\r\n2026-11-02;essen;12,34;"\'=SUMME(A1); ""x""";\r\n', c);

// Übernahme Check -> Plan (vorausfüllen, eine Datenquelle)
const s1 = { adults: 1, ek1Art: 'lohn', ek1Brutto: 2500, ek1Netto: 1800, miete: 750, unterhalt: '', kids: 2, bezug: {} };
const g = H.ausCheck(s1, 259);
check('Check -> Plan: Netto, Miete, Kindergeld aus Kinderzahl', g.ek1 === 180000 && g.ek1Art === 'lohn' && g.miete === 75000 && g.kg === 51800 && g.uh === null && !g.zwei, g);
check('Check -> Plan: nur Brutto -> Netto bleibt leer, Hinweis', (() => { const x = H.ausCheck({ adults: 1, ek1Art: 'rente', ek1Brutto: 1400, ek1Netto: '' }, 259); return x.ek1 === null && x.ek1NurBrutto; })());
check('Check -> Plan: keine Angaben', H.ausCheck(null, 259).ek1 === null);
check('Unterhalt für sich selbst (unt): Zahlbetrag ist Einnahme, kein Brutto geschätzt oder verlangt', (() => { const st = { adults: 1, ek1Art: 'unt', ek1Netto: 650, plz: '90542' }; const x = H.ausCheck(st, 259), u = H.uebernahme(st, {}); return x.ek1 === 65000 && x.ek1Art === 'unt' && !x.ek1NurBrutto && u.da.some((d) => d.was === 'ek' && d.art === 'unt' && d.c === 65000) && !u.fehlt.some((f) => f.was === 'brutto'); })());
check('Check -> Plan: Partner nur bei zwei Erwachsenen', H.ausCheck({ adults: 1, ek2Art: 'lohn', ek2Netto: 900 }, 259).ek2 === null && H.ausCheck({ adults: 2, ek2Art: 'lohn', ek2Netto: 900 }, 259).ek2 === 90000);
check('Check -> Plan: „Kein Einkommen“ ergibt kein Einkommen', H.ausCheck({ adults: 1, ek1Art: 'ohne', ek1Netto: 500 }, 259).ek1 === null);
// Plan -> Check: leeres Feld direkt, vorhandener anderer Wert nur nach Rückfrage
check('Plan -> Check: leer schreiben, gleich nichts tun, anderer Wert fragen', H.aenderung(null, 5000) === 'schreiben' && H.aenderung(5000, 5000) === 'gleich' && H.aenderung(5000, 6000) === 'fragen' && H.aenderung(5000, null) === 'fragen');
// Liste vor dem Sprung in den Check
const u = H.uebernahme({ adults: 1, ek1Art: 'lohn', ek1Netto: 1800, ek1Brutto: '', miete: 750, heizkosten: '', kids: 0, plz: '', bezug: {} }, { kg: 25900, energie: 8000, leist: 0 });
const was = (l) => l.map((x) => x.was).join();
check('[hb-uebernahme] Übernahme: übernommen', was(u.da) === 'ek,miete', u.da);
check('Übernahme: fehlt (Brutto, Kinder, Heizung, Gas, PLZ)', was(u.fehlt) === 'brutto,kinder,heiz,gas,plz', u.fehlt);
check('Übernahme: Kindergeld-Bezug nur mit Bestätigung', was(u.fragen) === 'kgBezug');
check('Übernahme: Netto ohne Art -> Art fehlt', was(H.uebernahme({ adults: 1, ek1Netto: 900, plz: '90542' }, {}).fehlt) === 'art');
check('Übernahme: Rente ohne Brutto -> Brutto fehlt', H.uebernahme({ adults: 1, ek1Art: 'rente', ek1Netto: 1200, plz: '1' }, {}).fehlt[0].feld === 'ek1Brutto');
check('Übernahme: ALG ohne Brutto -> nichts fehlt', H.uebernahme({ adults: 1, ek1Art: 'alg', ek1Netto: 1200, plz: '90542' }, {}).fehlt.length === 0);

// Zweites Einkommen je Person (auch bei Paaren): eigene Zeile im Plan, Übernahme meldet beide
{
  const st = { adults: 2, ek1Art: 'lohn', ek1Netto: 1000, ek1bArt: 'unt', ek1bBetrag: 300, ek2Art: 'lohn', ek2Netto: 900, ek2bArt: 'lohn', ek2bBetrag: 150, plz: '90542' };
  const x = H.ausCheck(st, 259);
  check('[paar-ek] Check -> Plan: zweites Einkommen beider Personen in Cent', x.ek1b === 30000 && x.ek1bArt === 'unt' && x.ek2b === 15000 && x.ek2bArt === 'lohn', x);
  check('[paar-ek] Check -> Plan: allein kein zweites Einkommen von Person 2', H.ausCheck(Object.assign({}, st, { adults: 1 }), 259).ek2b === null);
  check('[paar-ek] Check -> Plan: Betrag ohne Art zählt nicht', H.ausCheck({ adults: 1, ek1Art: 'lohn', ek1Netto: 1000, ek1bArt: '', ek1bBetrag: 300 }, 259).ek1b === null);
  const u2 = H.uebernahme(st, {});
  check('[paar-ek] Übernahme: beide zweiten Einkommen als übernommen gemeldet', u2.da.filter((d) => d.was === 'ek' && d.zweit).map((d) => d.i + d.art + d.c).join() === '1unt30000,2lohn15000', u2.da);
  check('[paar-ek] Normieren: alter Stand ohne ekV -> 1 (einmalige Angleichung der Basis), neuer Stand 2', H.normiere({ ekBasis: 100000 }).ekV === 1 && H.normiere({ ekBasis: 100000, ekV: 2 }).ekV === 2 && H.normiere(null).ekV === 2);
}

// Speicherdaten prüfen (kaputte Daten nicht übernehmen)
const nd = H.normiere({ plan: { kg: 'x', leist: 500, aus: { miete: 1, essen: 100 } }, buch: [{ d: '2026-11-01', c: 100, k: 'essen' }, { d: 'kaputt', c: 5 }, { d: '2026-11-01', c: -1 }], weg: { a: true, b: 'ja' }, bewilligt: { sgb2: '2027-01-31', kiz: 'bald' }, ekBasis: 100000 });
check('Normieren', nd.plan.kg === null && nd.plan.leist === 500 && nd.plan.aus.miete === undefined && nd.plan.aus.essen === 100 && nd.buch.length === 1 && nd.weg.a && !nd.weg.b && nd.bewilligt.sgb2 === '2027-01-31' && !nd.bewilligt.kiz && nd.ekBasis === 100000, nd);
check('Normieren: Müll', H.normiere('quatsch').buch.length === 0 && H.normiere(null).v === 1);

// Hinweise: Auslöser, Höchstzahl (die Oberfläche zeigt 2, Rest aufklappbar), „Nicht mehr zeigen“
const ids = (l) => l.map((x) => x.id).join();
check('Hinweis: ohne Auslöser keiner', H.hinweisListe({ heute }).length === 0);
check('Hinweis: knapp', ids(H.hinweisListe({ knapp: true, heute })) === 'knapp');
check('Hinweis: Nebenkosten-Nachzahlung über Notiz', ids(H.hinweisListe({ eintraege: [{ c: 30000, k: 'miete', n: 'Nachzahlung Nebenkosten 2025' }], heute })) === 'nk');
check('Hinweis: kaputt nur mit Grundsicherungsgeld/Sozialhilfe', ids(H.hinweisListe({ eintraege: [{ c: 40000, k: 'sonst', n: 'Waschmaschine kaputt' }], heute })) === '' &&
  ids(H.hinweisListe({ eintraege: [{ c: 40000, k: 'sonst', n: 'Waschmaschine kaputt' }], bezug: { grundsicherungsgeld: true }, heute })) === 'kaputt');
check('Hinweis: große einmalige Ausgabe (ein Fünftel der Einnahmen) mit Leistung laut Check', ids(H.hinweisListe({ eintraege: [{ c: 30000, k: 'sonst' }], ein: 120000, ergebnis: { ggeld: 'vielleicht' }, heute })) === 'kaputt' &&
  ids(H.hinweisListe({ eintraege: [{ c: 30000, k: 'sonst', w: true }], ein: 120000, ergebnis: { ggeld: 'vielleicht' }, heute })) === '');
check('Hinweis: Bildungspaket über Kinder-Ausgaben, nicht wenn Check es ausschließt', ids(H.hinweisListe({ eintraege: [{ c: 2000, k: 'kinder', n: 'Schulsachen' }], heute })) === 'but' &&
  ids(H.hinweisListe({ eintraege: [{ c: 2000, k: 'kinder' }], ergebnis: { but: 'nein' }, kinder: 1, heute })) === '' && ids(H.hinweisListe({ eintraege: [{ c: 2000, k: 'sonst', n: 'Klassenfahrt' }], heute })) === 'but');
check('Hinweis: Sozialtarif/Rundfunk nur mit passender Leistung oder knapp', ids(H.hinweisListe({ aus: { handy: 3000 }, heute })) === '' &&
  H.hinweisListe({ aus: { handy: 3000 }, bezug: { sozialamt: true }, heute })[0].rundfunk === true && H.hinweisListe({ aus: { energie: 3000 }, ergebnis: { rundfunk: 'nein' }, knapp: true, heute }).find((x) => x.id === 'tarif').rundfunk === false &&
  ids(H.hinweisListe({ eintraege: [{ c: 1836, k: 'sonst', n: 'Rundfunkbeitrag' }], ergebnis: { rundfunk: 'vielleicht' }, heute })) === 'tarif');
check('Hinweis: Einkommen deutlich geändert', ids(H.hinweisListe({ ekBasis: 150000, ekJetzt: 120000, heute })) === 'ek' && ids(H.hinweisListe({ ekBasis: 150000, ekJetzt: 145000, heute })) === '');
check('Hinweis: Weiterbewilligung kurz vorher, nicht zu früh, nicht danach', ids(H.hinweisListe({ bewilligt: { sgb2: '2026-12-31' }, heute })) === 'wb-sgb2-2026-12-31' &&
  ids(H.hinweisListe({ bewilligt: { sgb2: '2027-03-31' }, heute })) === '' && ids(H.hinweisListe({ bewilligt: { sgb2: '2026-11-19' }, heute })) === '' && ids(H.hinweisListe({ bewilligt: { wohngeld: '2027-01-15' }, heute })) === 'wb-wohngeld-2027-01-15');
const alle = H.hinweisListe({ bewilligt: { kiz: '2026-12-01' }, ekBasis: 100000, ekJetzt: 50000, knapp: true, eintraege: [{ c: 50000, k: 'kinder', n: 'Nachzahlung Klassenfahrt, Kühlschrank kaputt' }], aus: { raten: 1000, handy: 1 }, ein: 100000, bezug: { grundsicherungsgeld: true }, heute });
check('[hb-hinweise] Hinweise nach Wirkung sortiert', ids(alle) === 'wb-kiz-2026-12-01,ek,knapp,nk,kaputt,but,schulden,tarif', ids(alle));
check('Nicht mehr zeigen', ids(H.hinweisListe({ knapp: true, aus: { raten: 1 }, weg: { knapp: true }, heute })) === 'schulden');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'src', 'haushalt.js'), 'utf8');
check('Oberfläche zeigt höchstens 2 Hinweise, Rest unter „Weitere Hinweise“', /liste\.slice\(0, 2\)/.test(tpl) && /liste\.slice\(2\)/.test(tpl) && /hb\.hw\.weitere/.test(tpl));
check('Vorlauf wie erweiterungen/fristen.js', (() => { const F = require('../erweiterungen/fristen.js'); return F.erinnerung({ leistung: 'sgb2', ende: '2027-01-31' }).erinnerungAm === F.plusTage('2027-01-31', -H.VORLAUF_TAGE.sgb2) && F.erinnerung({ leistung: 'wohngeld', ende: '2027-01-31' }).erinnerungAm === F.plusTage('2027-01-31', -H.VORLAUF_TAGE.wohngeld); })());
const brief = H.aenderungsBrief('1.500 €', '1.200 €', '20.11.2026');
check('Änderungsmitteilung nennt § 60 SGB I und beide Beträge', /§ 60 Abs\. 1 Satz 1 Nr\. 2 SGB I/.test(brief) && /1\.500 €/.test(brief) && /1\.200 €/.test(brief));

// Sprachen: alle Schlüssel in allen 13 Sprachen, Platzhalter und Zahlen wie im Deutschen; alle genutzten Schlüssel vorhanden
const DIR = path.join(__dirname, '..', 'src', 'lang', 'haushalt');
const de = JSON.parse(fs.readFileSync(path.join(DIR, 'de.json'), 'utf8'));
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
const ph = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join();
const AR = '٠١٢٣٤٥٦٧٨٩', FA = '۰۱۲۳۴۵۶۷۸۹';
const zahlen = (s) => (String(s).replace(/[٠-٩]/g, (x) => AR.indexOf(x)).replace(/[۰-۹]/g, (x) => FA.indexOf(x)).replace(/\{[^}]*\}/g, ' ').match(/\d+/g) || []).sort().join();
LANGS.forEach((l) => {
  const f = path.join(DIR, l + '.json');
  if (!fs.existsSync(f)) { check(l + ': Datei vorhanden', false); return; }
  const L = JSON.parse(fs.readFileSync(f, 'utf8'));
  const fehlt = Object.keys(de).filter((k) => !(k in L)), extra = Object.keys(L).filter((k) => !(k in de));
  check(l + ': alle Schlüssel', !fehlt.length && !extra.length, { fehlt, extra });
  const bad = Object.keys(de).filter((k) => k in L && (ph(de[k]) !== ph(L[k]) || zahlen(de[k]) !== zahlen(L[k]) || !String(L[k]).trim()));
  check(l + ': Platzhalter und Zahlen wie im Deutschen', !bad.length, bad);
});
const genutzt = new Set();
for (const m of tpl.matchAll(/'(hb\.[\w.]+)'/g)) if (!m[1].endsWith('.')) genutzt.add(m[1]);
['hb.f.', 'hb.hw.', 'hb.k.', 'hb.quelle.', 'hb.tipp.', 'hb.tab.', 'hb.wb.', 'hb.rb.'].forEach((p) => {
  const teile = { 'hb.f.': ['brutto', 'art', 'kinder', 'heiz', 'gas', 'plz', 'leist'], 'hb.hw.': ['wb', 'ek', 'knapp', 'nk', 'kaputt', 'but', 'schulden', 'tarif', 'tarif0'].flatMap((x) => [x, x + '.d']),
    'hb.k.': H.KAT, 'hb.quelle.': H.KAT, 'hb.tipp.': H.KAT, 'hb.tab.': ['plan', 'buch', 'ausw'], 'hb.wb.': ['sgb2', 'sgb12', 'wohngeld', 'kiz'], 'hb.rb.': ['essen', 'energie', 'handy', 'mobil'] }[p];
  teile.forEach((x) => genutzt.add(p + x));
});
const tplHtml = fs.readFileSync(path.join(__dirname, '..', 'src', 'template.html'), 'utf8');
for (const m of tplHtml.matchAll(/data-t(?:-aria)?="(hb\.[\w.]+)"/g)) genutzt.add(m[1]);
const fehlend = [...genutzt].filter((k) => !(k in de));
check('Alle genutzten hb-Schlüssel existieren', !fehlend.length, fehlend);
// Einfache Sprache: nur Schlüssel, die es gibt
const ef = path.join(__dirname, '..', 'src', 'lang', 'einfach', 'haushalt.json');
if (fs.existsSync(ef)) { const E = JSON.parse(fs.readFileSync(ef, 'utf8')); const x = Object.keys(E).filter((k) => !(k in de) || ph(E[k]) !== ph(de[k])); check('Einfache Sprache: Schlüssel und Platzhalter', !x.length, x); }

{ // [hb-tipps] jeder Spartipp hat in allen Sprachen eine Fundstelle; Handy nennt § 56 TKG
  const langs = fs.readdirSync(path.join(__dirname, '..', 'src', 'lang', 'haushalt')).map((f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'haushalt', f), 'utf8')));
  const kats = H.KAT;
  check('[hb-tipps] Spartipp und Quelle je Kategorie in allen Sprachen', langs.every((L) => kats.every((k) => L['hb.tipp.' + k] && L['hb.quelle.' + k])));
  check('[hb-tipps] Handy: Kündigung nach Mindestlaufzeit mit einem Monat Frist (§ 56 TKG)', /einem Monat/.test(de['hb.tipp.handy']) && /§ 56/.test(de['hb.quelle.handy']));
}

if (fehler) { console.log('\n' + fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
console.log('Haushalt-Test bestanden: ' + n + ' Prüfungen (Rechnung, Kategorien, Monatswechsel, Rundung, Kassenzettel, Übernahme, Hinweise, Sprachen)');
