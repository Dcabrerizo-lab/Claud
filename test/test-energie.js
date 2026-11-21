// Abschlag prüfen und Tarife vergleichen (src/haushalt.js, seit 1.9 auf den Seiten „Strom“ und „Heizen“): Hochrechnung, Kosten, Abschlag-Vergleich,
// Tarifvergleich (Cent-genau), Datenmodell, Texte und Quellen; dazu die Korrektur von sp.vertraege.4.
'use strict';
const H = require('../src/haushalt.js');
const fs = require('fs'), path = require('path');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const HEUTE = '2026-11-20';
const HN = '2026-04-20'; // 19 Tage nach der Ablesung vom 01.04.2026 (Ablesung aktuell)
const jv = (e, h) => H.jahresVerbrauch(e, h || HEUTE);

// Hochrechnung aus Zählerständen
let v = jv({ z1: 10000, d1: '2026-01-01', z2: 10500, d2: '2026-04-01' });
check('[en-check] 90 Tage, 500 kWh → 2028 kWh im Jahr', v.kwh === 2028 && v.tage === 90 && !v.ungenau && v.quelle === 'zaehler' && !v.fehler, v);
check('30 Tage → ungenau', jv({ z1: 10000, d1: '2026-01-01', z2: 10200, d2: '2026-01-31' }).ungenau === true);
check('10 Tage → Fehler kurz', jv({ z1: 10000, d1: '2026-01-01', z2: 10050, d2: '2026-01-11' }).fehler === 'kurz');
check('Zählerstand rückwärts → Fehler rueck', jv({ z1: 10000, d1: '2026-01-01', z2: 9000, d2: '2026-04-01' }).fehler === 'rueck');
check('Rückwärts und Rechnung gesetzt: kein stiller Rückfall', (() => { const r = jv({ z1: 10000, d1: '2026-01-01', z2: 9000, d2: '2026-04-01', jahr: 2500 }); return r.fehler === 'rueck' && r.kwh === null; })());
check('Nur Rechnung → 2500 kWh', (() => { const r = jv({ jahr: 2500 }); return r.kwh === 2500 && r.quelle === 'rechnung' && !r.fehler; })());
check('Leer → fehlt', jv({}).fehler === 'fehlt' && jv({ jahr: 0 }).fehler === 'fehlt');
check('Sommerzeit: 01.03. → 01.04. = 31 Tage', H.tageZwischen('2026-03-01', '2026-04-01') === 31 && H.tageZwischen('2026-10-01', '2026-11-01') === 31);
check('Datum: neu vor alt → Fehler datum', jv({ z1: 1, d1: '2026-04-01', z2: 500, d2: '2026-01-01' }).fehler === 'datum');
check('Datum in der Zukunft → Fehler datum', jv({ z1: 1, d1: '2026-01-01', z2: 500, d2: '2026-12-24' }).fehler === 'datum');
check('Gleiche Zählerstände → Fehler null', jv({ z1: 500, d1: '2026-01-01', z2: 500, d2: '2026-01-31' }).fehler === 'null');
check('Schaltjahr: 365 Tage, 3650 kWh', (() => { const r = jv({ z1: 0, d1: '2028-01-01', z2: 3650, d2: '2028-12-31' }, '2029-01-10'); return r.tage === 365 && r.kwh === 3650; })());
check('Über 730 Tage → Hinweis lang (kein Fehler)', (() => { const r = jv({ z1: 0, d1: '2024-01-01', z2: 8000, d2: '2026-03-11' }); return r.lang && !r.fehler && r.tage === 800; })());

// Kosten
let k = H.jahresKosten(2028, 36.5, 1200, 'strom');
check('Eigener Preis: 2028 × 36,5 ct + 12 × 12 € = 884,22 €', k.cent === 88422 && !k.geschaetzt && !k.gpFehlt, k);
k = H.jahresKosten(2000, null, null, 'strom');
check('Ohne Preis: Durchschnitt 37,97 ct (geschätzt)', k.cent === 75940 && k.geschaetzt && H.PREIS.strom === 37.97 && H.PREIS.gas === 11.58, k);
k = H.jahresKosten(2000, 36.5, null, 'strom');
check('Arbeitspreis ohne Grundpreis → gpFehlt', k.cent === 73000 && k.gpFehlt && !k.geschaetzt, k);
k = H.jahresKosten(2000, null, 1200, 'strom');
check('Grundpreis ohne Arbeitspreis → Durchschnitt, Grundpreis nicht doppelt', k.cent === 75940 && k.geschaetzt, k);
check('Gas-Durchschnitt', H.jahresKosten(10000, null, null, 'gas').cent === 115800);
check('Kein Verbrauch → null', H.jahresKosten(null, 36.5, 1200, 'strom') === null);

// Abschlag-Vergleich
let c = H.abschlagVergleich(88422, 6500);
check('65 € Abschlag → Nachzahlung 104,22 €, Vorschlag 74 €', c.art === 'nach' && c.diff === 10422 && c.vorschlag === 7400 && c.gezahlt === 78000, c);
check('72 € → passt (Differenz 20,22 € ≤ 5 %)', H.abschlagVergleich(88422, 7200).art === 'passt');
c = H.abschlagVergleich(60000, 6500);
check('Guthaben, Betrag positiv', c.art === 'gut' && c.diff === -18000 && c.betrag === 18000, c);
c = H.abschlagVergleich(88422, 6500, 11);
check('11 Abschläge', c.gezahlt === 71500 && c.diff === 16922 && c.art === 'nach' && c.vorschlag === 8100, c);
check('Abschlag leer oder 0 → null (keine volle Nachzahlung melden)', H.abschlagVergleich(88422, null, 12) === null && H.abschlagVergleich(88422, 0, 12) === null);
check('Toleranz ist Faustregel (30 € / 5 %)', H.TOL.cent === 3000 && H.TOL.anteil === 0.05);

// Gas in m³
check('gasKwh', H.gasKwh(1200, 10.3) === 12360 && H.gasKwh(1200, null) === null);
let sp = H.energieSparte({ weg: 'rechnung', jahr: 1200, m3: true, faktor: 10.3, a: 10000, n: 12, ap: 10, gp: 1500 }, 'gas', HEUTE);
check('Gas m³ mit Faktor', sp.kwh === 12360 && sp.kosten.cent === 141600 && sp.belastbar, sp);
sp = H.energieSparte({ weg: 'rechnung', jahr: 1200, m3: true, faktor: null, a: 10000 }, 'gas', HEUTE);
check('Gas m³ ohne Faktor → fehlt, kein Ergebnis', sp.fehltFaktor && sp.kwh === null && sp.vergleich === null);

// Belastbar nur mit eigenem Preis, Grundpreis, genauer und aktueller Ablesung (kein Plan-Hinweis, kein Brief mehr seit 1.9)
const enEigen = { heiz: 'miete', strom: { a: 6500, n: 12, weg: 'zaehler', z1: 10000, d1: '2026-01-01', z2: 10500, d2: '2026-04-01', ap: 36.5, gp: 1200 } };
const bel = (x, h, heiz) => { const r = H.energieSparte(x, 'strom', h || HN, heiz || 'miete'); return r.belastbar && r.vergleich.art === 'nach' ? r.vergleich.diff : 0; };
check('Belastbare Nachzahlung → 104,22 €', bel(enEigen.strom) === 10422);
check('Durchschnittspreis → nicht belastbar', bel(Object.assign({}, enEigen.strom, { ap: null, gp: null, a: 3000 })) === 0);
check('Ungenau → nicht belastbar', bel(Object.assign({}, enEigen.strom, { d2: '2026-01-31', z2: 10200, a: 1000 })) === 0);
check('Grundpreis fehlt → nicht belastbar', bel(Object.assign({}, enEigen.strom, { gp: null, a: 1000 })) === 0);
check('Kein Plan-Hinweis „energie“ mehr, keine Zusätze (Brief, Destatis)', !H.hinweisListe({ energieNach: 10422 }).some((h) => h.id === 'energie') && !H.energieNachzahlung && !H.abschlagBrief && !H.destatisVergleich);

// Tarife vergleichen: Jahreskosten Cent-genau (kWh × ct + 12 × Grundpreis), Bonus nur im 1. Jahr
check('[tv] Jahreskosten 2500 kWh × 32,8 ct + 12 × 12,50 € = 970,00 €', H.tarifKosten(2500, 32.8, 1250) === 97000);
check('[tv] Gleitkomma: 3333 kWh × 29,9912 ct + 12 × 9,99 € = 1.119,49 €', H.tarifKosten(3333, 29.9912, 999) === Math.round(3333 * 29.9912 + 11988) && H.tarifKosten(3333, 29.9912, 999) === 111949);
check('[tv] Grundpreis 0 erlaubt, fehlender Preis oder Verbrauch → null', H.tarifKosten(1000, 30, 0) === 30000 && H.tarifKosten(1000, null, 0) === null && H.tarifKosten(0, 30, 0) === null && H.tarifKosten(1000, 30, null) === null);
let tvr = H.tarifVergleich({ kwh: 2500, eigen: { ap: 40, gp: 1500 }, angebot: { ap: 32, gp: 1200, bonus: 10000 } });
check('[tv] Mit Bonus: 1. Jahr 1.180 € vs. 944 € − 100 €, 2. Jahr Unterschied 336 €', tvr.eigen === 118000 && tvr.angebot === 94400 && tvr.angebot1 === 84400 && tvr.diff1 === 33600 && tvr.diff2 === 23600 && tvr.bonus === 10000, tvr);
tvr = H.tarifVergleich({ kwh: 2500, eigen: { ap: 30, gp: 1000 }, angebot: { ap: 30, gp: 1200, bonus: 5000 } });
check('[tv] Bonus macht nur das 1. Jahr günstiger, ab dem 2. Jahr teurer', tvr.diff1 === 2600 && tvr.diff2 === -2400, tvr);
tvr = H.tarifVergleich({ kwh: 1000, eigen: { ap: 30, gp: 0 }, angebot: { ap: 30, gp: 0, bonus: 99999 } });
check('[tv] Bonus größer als die Kosten → 1. Jahr 0 €, nie negativ', tvr.angebot1 === 0 && tvr.diff1 === 30000, tvr);
check('[tv] Ohne Bonus: diff1 = diff2', (() => { const r = H.tarifVergleich({ kwh: 4000, eigen: { ap: 35.5, gp: 1390 }, angebot: { ap: 31.25, gp: 1590 } }); return r.bonus === 0 && r.diff1 === r.diff2 && r.diff1 === 142000 + 16680 - 125000 - 19080; })());
check('[tv] Unvollständig → null', H.tarifVergleich({ kwh: 2500, eigen: { ap: 30, gp: 1000 }, angebot: { ap: 30 } }) === null && H.tarifVergleich({}) === null && H.tarifVergleich() === null);

// Datenmodell
let nd = H.normiere({ energie: { heiz: 'gas', personen: 3, strom: { a: 'x', ap: 999, d1: '2026-13-01', z1: 100, d2: '2026-02-30', n: 11, weg: 'rechnung' }, gas: { m3: true, faktor: 3, ap: 11.5, gp: 1500 } } }).energie;
check('normiere: Unsinn verworfen, Gültiges bleibt', nd.heiz === 'gas' && !('personen' in nd) && nd.strom.a === null && nd.strom.ap === null && nd.strom.d1 === '' && nd.strom.d2 === '' && nd.strom.z1 === 100 && nd.strom.n === 11 && nd.strom.weg === 'rechnung' && nd.gas.m3 === true && nd.gas.faktor === null && nd.gas.ap === 11.5 && nd.gas.gp === 1500, nd);
nd = H.normiere({ energie: { heiz: 'atom', strom: { n: 7, weg: 'raten', ap: 36.55555 } } }).energie;
check('normiere: Vorgaben', nd.heiz === '' && nd.strom.n === 12 && nd.strom.weg === 'zaehler' && nd.gas.weg === 'rechnung' && nd.strom.ap === null);
check('normiere: alter Stand ohne energie → leer', H.normiere({ plan: { aus: {} } }).energie.strom.a === null);

// Texte und Quellen
const L = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', f), 'utf8'));
const de = L('haushalt/de.json'), E = L('einfach/haushalt.json');
check('Ergebnis „möglich“ statt Zusage', /^Möglich/.test(de['hb.en.nach']) && /^Möglich/.test(de['hb.en.gut']) && /ungefähr/.test(de['hb.en.passt']));
check('Einfache Sprache für die wichtigsten Texte', ['hb.en.nach', 'hb.en.gut', 'hb.en.passt'].every((x) => E[x]));
// Ohne Beratungsmodus werden Paragrafen in Klammern ausgeblendet: Sätze bleiben vollständig (kein Doppelpunkt oder Komma vor dem Satzende)
const F = require('../src/fmt.js');
check('Texte ohne Paragrafen vollständig', Object.keys(de).filter((x) => x.startsWith('hb.en.')).every((x) => !/[:,;] *[.)]/.test(F.ohnePara(de[x]))));

// sp.vertraege.4 (Sperre, Energieschulden) entfernt (Entscheidung 20.11.2026: Sparen im Alltag ohne Schulden); die Sperre steht nur unter
// Geld und Schulden → Es ist dringend (sp.schulden.strom, gs.d.strom.*): § 41g EnWG statt § 19 StromGVV/GasGVV, Darlehen vom Jobcenter
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
check('[en-korr] sp.vertraege.4 in allen Sprachen entfernt, Sperre nur in sp.schulden.strom und gs.d.strom.schritt (§ 41g EnWG)', LANGS.every((l) => { const j = L(l + '.json'); return !('sp.vertraege.4' in j) && /§ 41g EnWG/.test(j['sp.schulden.strom']) && /§ 41g EnWG/.test(j['gs.d.strom.schritt']) && !/§ 19/.test(j['sp.schulden.strom']); }));
check('sp.schulden.strom ohne Paragrafen lesbar', (() => { const s = F.ohnePara(L('de.json')['sp.schulden.strom']); return !/§/.test(s) && !/[:,;] *[.)]/.test(s) && /Darlehen/.test(s); })());

// ---------- Korrekturen aus der Code-Prüfung ----------
// Befund 2: Arbeitspreis mit Gleitkomma-Rest (32,8 · 100 = 3279,9999…) geht beim Speichern/Laden nicht verloren
const laden = (en) => H.normiere(JSON.parse(JSON.stringify({ energie: en }))).energie;
let gl = laden({ strom: { ap: 32.8 }, gas: { ap: 0.29, m3: true, faktor: 10.934 } });
check('[en-check] Befund 2: Speichern/Laden: 32,8 und 0,29 ct bleiben', gl.strom.ap === 32.8 && gl.gas.ap === 0.29, gl);
gl = laden({ strom: { ap: 32.875 }, gas: { ap: 11.5825, m3: true, faktor: 10.934 } });
check('[en-check] Befund 2: Speichern/Laden: 32,875 ct, 11,5825 ct und Faktor 10,934 bleiben', gl.strom.ap === 32.875 && gl.gas.ap === 11.5825 && gl.gas.faktor === 10.934, gl);
check('[en-check] Befund 2: Mehr als 4 Nachkommastellen → verworfen', laden({ strom: { ap: 32.87555 } }).strom.ap === null);

// Befund 6: Gas und Heizen mit Strom – Zählerweg unter 330 Tagen ist ungenau (kein Hinweis, kein Brief)
const z90 = { a: 5000, n: 12, weg: 'zaehler', z1: 1000, d1: '2026-01-01', z2: 4000, d2: '2026-04-01', ap: 10, gp: 1500 };
let s6 = H.energieSparte(z90, 'gas', HN, 'gas');
check('[en-check] Befund 6: Gas 90 Tage → ungenau (Jahreszeit), nicht belastbar', s6.verbrauch.ungenau && s6.verbrauch.saison && !s6.belastbar && s6.vergleich && s6.vergleich.art === 'nach', s6);
const st90 = Object.assign({}, z90, { ap: 36.5, gp: 1200, z2: 2500 });
check('[en-check] Befund 6: Heizen mit Strom 90 Tage → ungenau, kein Hinweis', H.energieSparte(st90, 'strom', HN, 'strom').verbrauch.saison && bel(st90, HN, 'strom') === 0);
check('[en-check] Befund 6: Haushaltsstrom (Heizung über Miete) 90 Tage → weiter belastbar', !H.energieSparte(st90, 'strom', HN, 'miete').verbrauch.ungenau && bel(st90, HN, 'miete') > 0);
const g340 = Object.assign({}, z90, { d1: '2025-04-26', z2: 13000 });
s6 = H.energieSparte(g340, 'gas', HN, 'gas');
check('[en-check] Befund 6: Gas 340 Tage → belastbar', s6.verbrauch.tage === 340 && !s6.verbrauch.ungenau && s6.belastbar && H.SAISON_TAGE === 330, s6);
check('[en-check] Befund 6: Gas über die Rechnung (Jahresverbrauch) bleibt belastbar', H.energieSparte({ weg: 'rechnung', jahr: 12000, a: 5000, ap: 10, gp: 1500 }, 'gas', HN, 'gas').belastbar);

// Befund 7: Preis und Faktor mit bis zu 4 Nachkommastellen
check('[en-check] Befund 7: dezimalAus: 10,934 / 32,875 / 32.875 / 0,29', H.dezimalAus('10,934') === 10.934 && H.dezimalAus('32,875') === 32.875 && H.dezimalAus(' 32.875 ') === 32.875 && H.dezimalAus('0,29') === 0.29 && H.dezimalAus('11,5825') === 11.5825);
check('[en-check] Befund 7: dezimalAus: leer → null, Unsinn → NaN', H.dezimalAus('') === null && H.dezimalAus(null) === null && ['1,23456', '-3', '1.234,5', 'abc', '3,', ',5'].every((x) => Number.isNaN(H.dezimalAus(x))));

// Befund 12: Brief und Plan-Hinweis nur bei aktueller Ablesung (höchstens 31 Tage alt)
check('[en-check] Befund 12: Ablesung älter als 31 Tage → kein Plan-Hinweis', bel(enEigen.strom, HEUTE) === 0 && H.energieSparte(enEigen.strom, 'strom', HEUTE, 'miete').aktuell === false);
check('[en-check] Befund 12: Ablesung genau 31 Tage alt → aktuell', H.energieSparte(enEigen.strom, 'strom', '2026-05-02', 'miete').aktuell && bel(enEigen.strom, '2026-05-02') === 10422 && bel(enEigen.strom, '2026-05-03') === 0 && H.AKTUELL_TAGE === 31);

// Tarifvergleich: Texte in 13 Sprachen und Einfacher Sprache; Hinweise kurz (höchstens 12 Wörter); neutrale Quelle (Verbraucherzentrale), keine Portale
const TV = ['hb.tv.kachel', 'hb.tv.lead', 'tv.bonus', 'tv.vorkasse', 'tv.laufzeit', 'tv.kuendigung', 'tv.fernwaerme', 'tv.vz.link', 'tv.quellen'];
const E2 = L('einfach/haushalt2.json');
check('[tv] Texte in 13 Sprachen und Einfacher Sprache', LANGS.every((l) => TV.every((x) => (L('haushalt/' + l + '.json')[x] || '').length > 5)) && TV.every((x) => (E2[x] || '').length > 0));
check('[tv] Kurztexte der Hinweise höchstens 12 Wörter (alle Sprachen)', LANGS.every((l) => ['bonus', 'vorkasse', 'laufzeit', 'kuendigung', 'fernwaerme'].every((x) => L('haushalt/' + l + '.json')['tv.' + x + '.kurz'].trim().split(/\s+/).length <= 12)));
check('[tv] Link nur zur Verbraucherzentrale, keine Vergleichsportale', (() => { const a = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8'); return /TV_VZ_URL = 'https:\/\/www\.verbraucherzentrale\.de\//.test(a) && !/check24|verivox|tarifcheck|finanztip/i.test(a); })());
// Neue Texte in allen Sprachen und in Einfacher Sprache; Befund 15 (Türkisch)
const NEU = ['hb.en.f.zahl', 'hb.en.saison', 'hb.en.alt'];
check('[en-check] Befund 6/7/12: Neue Texte in 13 Sprachen und Einfacher Sprache', LANGS.every((l) => NEU.every((x) => (L('haushalt/' + l + '.json')[x] || '').length > 10)) && NEU.every((x) => (E[x] || '').length > 10));
check('[en-check] Befund 12: Text: Zähler neu ablesen', /Bitte lies den Zähler neu ab/.test(de['hb.en.alt']) && /Bitte lies den Zähler neu ab/.test(E['hb.en.alt']));

if (fehler) { console.log('\n' + fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
console.log('Energie-Test bestanden: ' + n + ' Prüfungen (Hochrechnung, Kosten, Abschlag, Tarifvergleich, Datenmodell, Texte, Sperre)');
