// Energiekosten-Check im Haushaltsplan (src/haushalt.js, Entwurf docs/entwuerfe/energie.md): Hochrechnung, Kosten, Abschlag-Vergleich,
// Plan-Hinweis nur bei belastbarem Ergebnis, Brief, Datenmodell, Texte und Quellen; dazu die Korrektur von sp.vertraege.4.
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

// Plan-Hinweis nur bei belastbarem Ergebnis
const enEigen = { heiz: 'miete', strom: { a: 6500, n: 12, weg: 'zaehler', z1: 10000, d1: '2026-01-01', z2: 10500, d2: '2026-04-01', ap: 36.5, gp: 1200 } };
check('Belastbare Nachzahlung → 104,22 €', H.energieNachzahlung(enEigen, HN) === 10422);
const enSchaetz = { heiz: 'miete', strom: Object.assign({}, enEigen.strom, { ap: null, gp: null, a: 3000 }) };
check('Durchschnittspreis → kein Hinweis', H.energieNachzahlung(enSchaetz, HN) === 0 && !H.hinweisListe({ energieNach: H.energieNachzahlung(enSchaetz, HN) }).some((h) => h.id === 'energie'));
const enKurz = { heiz: 'miete', strom: Object.assign({}, enEigen.strom, { d2: '2026-01-31', z2: 10200, a: 1000 }) };
check('Ungenau → kein Hinweis', H.energieNachzahlung(enKurz, HN) === 0);
const enGp = { heiz: 'miete', strom: Object.assign({}, enEigen.strom, { gp: null, a: 1000 }) };
check('Grundpreis fehlt → kein Hinweis', H.energieNachzahlung(enGp, HN) === 0);
check('Gas zählt nur bei Heizung mit eigenem Gasvertrag', (() => {
  const gas = { a: 5000, n: 12, weg: 'rechnung', jahr: 12000, ap: 10, gp: 1500 };
  return H.energieNachzahlung({ heiz: 'miete', strom: {}, gas: gas }, HEUTE) === 0 && H.energieNachzahlung({ heiz: 'gas', strom: {}, gas: gas }, HEUTE) === 78000;
})());
const hl = H.hinweisListe({ energieNach: 10422, eintraege: [{ n: 'Nebenkosten Nachzahlung', c: 100, k: 'miete' }], knapp: true });
check('Hinweis energie: prio 75, zwischen knapp und nk', (() => { const ids = hl.map((h) => h.id); const e = hl.find((h) => h.id === 'energie'); return e && e.prio === 75 && e.b === 10422 && ids.indexOf('knapp') < ids.indexOf('energie') && ids.indexOf('energie') < ids.indexOf('nk'); })(), hl);
check('Hinweis energie: „Nicht mehr zeigen“ wirkt', !H.hinweisListe({ energieNach: 10422, weg: { energie: true } }).some((h) => h.id === 'energie'));

// Amtlicher Vergleichswert (Destatis 2021)
check('Destatis-Werte: 3 Klassen, steigend', H.VERBRAUCH_DESTATIS.kwh.join() === '2105,3470,5411' && H.VERBRAUCH_DESTATIS.jahr === 2021);
check('Destatis: 1 → 2105, 5 Personen → 5411, 0 → null', H.destatisVergleich(1).kwh === 2105 && H.destatisVergleich(5).kwh === 5411 && H.destatisVergleich(5).klasse === 3 && H.destatisVergleich(0) === null);

// Brief
const bn = H.abschlagBrief({ art: 'nach', datum: '20.11.2026', stand: '10500', einheit: 'kWh', kwh: '2.028', neu: '74 €' });
const bg = H.abschlagBrief({ art: 'gut', datum: '20.11.2026', stand: '1234', einheit: 'm³', kwh: '12.360', neu: '60 €' });
check('Brief Nachzahlung: erhöhen, kein Paragraf', /erhöhen/.test(bn) && !/§/.test(bn) && !/senken/.test(bn) && /10500 kWh/.test(bn) && /74 €/.test(bn));
check('Brief Guthaben: senken mit § 41b Abs. 3 EnWG / § 13 StromGVV', /senken/.test(bg) && /§ 41b Abs\. 3 Satz 2 EnWG/.test(bg) && /§ 13 Abs\. 1 Satz 4 StromGVV\/GasGVV/.test(bg) && !/erhöhen/.test(bg) && /1234 m³/.test(bg));
check('Brief nur mit Platzhaltern für persönliche Daten', /\[Name, Anschrift\]/.test(bn) && /Kundennummer: \[_____\]/.test(bn) && /Textform/.test(bn));

// Datenmodell
let nd = H.normiere({ energie: { heiz: 'gas', personen: 3, strom: { a: 'x', ap: 999, d1: '2026-13-01', z1: 100, d2: '2026-02-30', n: 11, weg: 'rechnung' }, gas: { m3: true, faktor: 3, ap: 11.5, gp: 1500 } } }).energie;
check('normiere: Unsinn verworfen, Gültiges bleibt', nd.heiz === 'gas' && nd.personen === 3 && nd.strom.a === null && nd.strom.ap === null && nd.strom.d1 === '' && nd.strom.d2 === '' && nd.strom.z1 === 100 && nd.strom.n === 11 && nd.strom.weg === 'rechnung' && nd.gas.m3 === true && nd.gas.faktor === null && nd.gas.ap === 11.5 && nd.gas.gp === 1500, nd);
nd = H.normiere({ energie: { heiz: 'atom', strom: { n: 7, weg: 'raten', ap: 36.55555 } } }).energie;
check('normiere: Vorgaben', nd.heiz === '' && nd.strom.n === 12 && nd.strom.weg === 'zaehler' && nd.gas.weg === 'rechnung' && nd.strom.ap === null);
check('normiere: alter Stand ohne energie → leer', H.normiere({ plan: { aus: {} } }).energie.strom.a === null);

// Texte und Quellen
const L = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', f), 'utf8'));
const de = L('haushalt/de.json'), E = L('einfach/haushalt.json');
check('Quelle Vergleich: Statistisches Bundesamt, 2021, nur Orientierung', /Statistisches Bundesamt/.test(de['hb.en.dv.quelle']) && /2021/.test(de['hb.en.dv.quelle']) && /Orientierung/.test(de['hb.en.dv.quelle']));
check('Stromspiegel nur als Link (keine Klassen ohne Erlaubnis)', /www\.stromspiegel\.de/.test(de['hb.en.dv.link']) && !Object.keys(de).some((x) => x.startsWith('hb.en.sp.')) && !/STROMSPIEGEL\s*=/.test(fs.readFileSync(path.join(__dirname, '..', 'src', 'haushalt.js'), 'utf8')));
check('Vergleich ohne Urteil hoch/niedrig', !/\b(hoch|niedrig|zu viel)\b/i.test(de['hb.en.dv.zeile']));
check('Ergebnis „möglich“ statt Zusage', /^Möglich/.test(de['hb.en.nach']) && /^Möglich/.test(de['hb.en.gut']) && /ungefähr/.test(de['hb.en.passt']));
check('Abwendungsvereinbarung: § 41g Abs. 1, nur nach Androhung, 300 €', /§ 41g Abs\. 1 EnWG/.test(de['hb.en.sperre.raten']) && /angedroht/.test(de['hb.en.sperre.raten']) && /300 €/.test(de['hb.en.sperre.raten']) && /Grund-Versorgung/.test(E['hb.en.sperre.raten']));
check('[en-korr] Stromschulden: § 24 Abs. 1 und § 22 Abs. 8 SGB II, extra beantragen', /§ 24 Abs\. 1 SGB II/.test(de['hb.en.nz.strom.sgb']) && /§ 22 Abs\. 8 SGB II/.test(de['hb.en.nz.strom.sgb']) && /extra beantragen/.test(de['hb.en.nz.strom.sgb']));
check('Heizkosten Sozialhilfe: § 35 Abs. 1 und 5 (nicht Abs. 4)', /§ 35 Abs\. 1 und 5 SGB XII/.test(de['hb.en.nz.heiz.sgb']) && !/Abs\. 4/.test(de['hb.en.nz.heiz.sgb']));
check('Kein „gefördert vom Ministerium“ beim Stromspiegel', !/Ministerium/.test(de['hb.en.dv.link'] + de['hb.en.dv.quelle']));
check('Einfache Sprache für die wichtigsten Texte', ['hb.en.knopf', 'hb.en.nach', 'hb.en.gut', 'hb.en.passt', 'hb.en.sperre.raten', 'hb.en.nz.strom.sgb'].every((x) => E[x]));
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
check('[en-check] Befund 6: Gas 90 Tage → kein Plan-Hinweis', H.energieNachzahlung({ heiz: 'gas', strom: {}, gas: z90 }, HN) === 0);
const st90 = Object.assign({}, z90, { ap: 36.5, gp: 1200, z2: 2500 });
check('[en-check] Befund 6: Heizen mit Strom 90 Tage → ungenau, kein Hinweis', H.energieSparte(st90, 'strom', HN, 'strom').verbrauch.saison && H.energieNachzahlung({ heiz: 'strom', strom: st90 }, HN) === 0);
check('[en-check] Befund 6: Haushaltsstrom (Heizung über Miete) 90 Tage → weiter belastbar', !H.energieSparte(st90, 'strom', HN, 'miete').verbrauch.ungenau && H.energieNachzahlung({ heiz: 'miete', strom: st90 }, HN) > 0);
const g340 = Object.assign({}, z90, { d1: '2025-04-26', z2: 13000 });
s6 = H.energieSparte(g340, 'gas', HN, 'gas');
check('[en-check] Befund 6: Gas 340 Tage → belastbar', s6.verbrauch.tage === 340 && !s6.verbrauch.ungenau && s6.belastbar && H.SAISON_TAGE === 330, s6);
check('[en-check] Befund 6: Gas über die Rechnung (Jahresverbrauch) bleibt belastbar', H.energieSparte({ weg: 'rechnung', jahr: 12000, a: 5000, ap: 10, gp: 1500 }, 'gas', HN, 'gas').belastbar);

// Befund 7: Preis und Faktor mit bis zu 4 Nachkommastellen
check('[en-check] Befund 7: dezimalAus: 10,934 / 32,875 / 32.875 / 0,29', H.dezimalAus('10,934') === 10.934 && H.dezimalAus('32,875') === 32.875 && H.dezimalAus(' 32.875 ') === 32.875 && H.dezimalAus('0,29') === 0.29 && H.dezimalAus('11,5825') === 11.5825);
check('[en-check] Befund 7: dezimalAus: leer → null, Unsinn → NaN', H.dezimalAus('') === null && H.dezimalAus(null) === null && ['1,23456', '-3', '1.234,5', 'abc', '3,', ',5'].every((x) => Number.isNaN(H.dezimalAus(x))));

// Befund 11: Senken-Brief vergleicht nur mit dem Abschlag
check('[en-check] Befund 11: Brief Guthaben: nur Vergleich mit dem Abschlag, keine Behauptung zum letzten Zeitraum', /voraussichtlich geringer als bei der Berechnung meines Abschlags angenommen\. Bitte prüfen Sie das/.test(bg) && !/Abrechnungszeitraum|erheblich/.test(bg));

// Befund 12: Brief und Plan-Hinweis nur bei aktueller Ablesung (höchstens 31 Tage alt)
check('[en-check] Befund 12: Ablesung älter als 31 Tage → kein Plan-Hinweis', H.energieNachzahlung(enEigen, HEUTE) === 0 && H.energieSparte(enEigen.strom, 'strom', HEUTE, 'miete').aktuell === false);
check('[en-check] Befund 12: Ablesung genau 31 Tage alt → aktuell', H.energieSparte(enEigen.strom, 'strom', '2026-05-02', 'miete').aktuell && H.energieNachzahlung(enEigen, '2026-05-02') === 10422 && H.energieNachzahlung(enEigen, '2026-05-03') === 0 && H.AKTUELL_TAGE === 31);

// Neue Texte in allen Sprachen und in Einfacher Sprache; Befund 15 (Türkisch)
const NEU = ['hb.en.f.zahl', 'hb.en.saison', 'hb.en.alt'];
check('[en-check] Befund 6/7/12: Neue Texte in 13 Sprachen und Einfacher Sprache', LANGS.every((l) => NEU.every((x) => (L('haushalt/' + l + '.json')[x] || '').length > 10)) && NEU.every((x) => (E[x] || '').length > 10));
check('[en-check] Befund 12: Text: Zähler neu ablesen', /Bitte lies den Zähler neu ab/.test(de['hb.en.alt']) && /Bitte lies den Zähler neu ab/.test(E['hb.en.alt']));

if (fehler) { console.log('\n' + fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
console.log('Energie-Test bestanden: ' + n + ' Prüfungen (Hochrechnung, Kosten, Abschlag, Hinweis, Brief, Datenmodell, Texte, Sperre)');
