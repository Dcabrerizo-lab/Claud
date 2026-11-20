// Fristen in „Mein Ordner“ (src/fristen.js): Rechnung (Prüffälle aus docs/entwuerfe/fristen.md Abschnitt 4), Frist aus dem Brief
// (rechnet nur), Dublettenschutz, Auswahl für den Hinweis beim Öffnen, Laden mit Prüfung, Sprachdateien (Schlüssel, Zahlen, Platzhalter).
'use strict';
const fs = require('fs'), path = require('path');
global.BriefLesen = require('../erweiterungen/brief-lesen.js');
const F = require('../src/fristen.js');
const Alt = require('../erweiterungen/fristen.js');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : JSON.stringify(x)); } };

// ---------- Prüffälle ----------
{
  const w = (datum, zugang, erhalten) => F.widerspruch(datum, zugang, erhalten);
  let r = w('2026-11-10');
  ck('[fristen] Bescheid 10.11.2026: bekannt 14.11. (Sa, nicht verschoben), Ende Mo 14.12.2026', r.bekannt === '2026-11-14' && r.bis === '2026-12-14' && r.wort === 'gerechnet', r);
  r = w('2026-01-27');
  ck('[fristen] Bescheid 27.01.2026: 28.02. ist Sa → Mo 02.03.2026', r.bekannt === '2026-01-31' && r.bis === '2026-03-02', r);
  r = w('2027-03-24');
  ck('[fristen] Bescheid 24.03.2027: bekannt Ostersonntag 28.03., Ende Mi 28.04.2027', r.bekannt === '2027-03-28' && r.bis === '2027-04-28', r);
  r = F.rechne({ art: 'mit', basis: { datum: '2026-12-18', erhalten: '2026-12-22', frist: '2W' } });
  ck('[fristen] Mitwirkung 2 Wochen, erhalten Di 22.12.2026 → Di 05.01.2027, Gerechnet', r.bis === '2027-01-05' && r.wort === 'gerechnet', r);
  r = F.rechne({ art: 'mit', basis: { datum: '2026-12-18', frist: '2W' } });
  ck('[fristen] Mitwirkung ohne Erhalt: ab Briefdatum + 1 (nicht + 4) → Mo 04.01.2027, Ungefähr', r.bis === '2027-01-04' && r.wort === 'ungefaehr' && r.bekannt === '2026-12-19', r);
  r = F.rechne({ art: 'mb', basis: { zugang: '2026-12-11' } });
  ck('[fristen] Mahnbescheid zugestellt Fr 11.12.2026: Feiertage und Wochenende → Mo 28.12.2026', r.bis === '2026-12-28' && r.wort === 'gerechnet', r);
  r = F.rechne({ art: 'zahl', basis: { fest: '2026-12-12' } });
  ck('[fristen] Fester Tag an einem Samstag bleibt (12.12.2026), Fest', r.bis === '2026-12-12' && r.wort === 'fest', r);
  r = w(null, null, '2026-11-16');
  ck('[fristen] Widerspruch ohne Datum, erhalten 16.11.2026 → 16.12.2026, Ungefähr', r.bis === '2026-12-16' && r.wort === 'ungefaehr', r);
  const wb = F.folgeantrag('wohngeld', '2027-03-31');
  ck('[fristen] Folgeantrag Wohngeld bis 31.03.2027: Hinweis ab 30.01.2027 (−60 Tage)', wb.faellig === '2027-01-30' && F.faellig(wb) === '2027-01-30', wb);
  ck('[fristen] Folgeantrag Grundsicherungsgeld: 42 Tage Vorlauf', F.folgeantrag('sgb2', '2027-03-31').faellig === '2027-02-17');
  ck('[fristen] Ohne Datum: Datum fehlt', F.rechne({ art: 'mit', basis: { frist: '2W' } }).wort === 'offen' && F.rechne({ art: 'mb', basis: {} }).bis === null);
  ck('[fristen] Monat: 31.01. → 28.02., Schaltjahr 2028 → 29.02.', F.plusMonate('2027-01-31', 1) === '2027-02-28' && F.plusMonate('2028-01-31', 1) === '2028-02-29' && F.plusMonate('2026-12-15', 1) === '2027-01-15');
  ck('[fristen] 9 bundesweite Feiertage, Ostern 2027 am 28.03.', Object.keys(F.feiertage(2027)).length === 9 && F.ostern(2027) === '2027-03-28');
  // Gleiche Rechnung wie das Prüfpaket (erweiterungen/fristen.js)
  let gleich = true;
  for (let d = Date.UTC(2026, 0, 1); d < Date.UTC(2029, 0, 1); d += 86400000 * 3) {
    const s = new Date(d).toISOString().slice(0, 10);
    if (Alt.widerspruch({ datum: s }).fristende !== w(s).bis) { gleich = false; console.log('  abweichend', s); break; }
  }
  ck('[fristen] Widerspruchsfrist gleich wie erweiterungen/fristen.js (2026–2028)', gleich);
}

// ---------- Frist aus dem Brief: rechnet nur ----------
{
  const anh = 'Jobcenter Musterstadt\nDatum: 18.12.2026\nAnhörung nach § 24 SGB X\nSie erhalten Gelegenheit, sich innerhalb von zwei Wochen zu äußern.';
  let r = F.ausBrief(anh, 'anh', '2026-12-22');
  ck('[fristen] ausBrief „innerhalb von zwei Wochen“ mit Erhalt → gerechnet 05.01.2027', r && r.art === 'anh' && r.basis.frist === '2W' && r.bis === '2027-01-05' && r.wort === 'gerechnet', r);
  r = F.ausBrief(anh, 'anh', null);
  ck('[fristen] ausBrief nur mit Briefdatum → ungefähr (Briefdatum + 1, nicht + 4)', r && r.wort === 'ungefaehr' && r.bis === '2027-01-04', r);
  r = F.ausBrief('Bitte reichen Sie die Unterlagen innerhalb von zwei Wochen ein.', 'mit', null);
  ck('[fristen] ausBrief ohne Datum und Erhalt → Datum fehlt', r && r.wort === 'offen' && r.bis === null, r);
  r = F.ausBrief('Datum: 01.12.2026\nBitte reichen Sie die Unterlagen bis zum 15.12.2026 ein.', 'mit', null);
  ck('[fristen] ausBrief „bis zum 15.12.2026“ → fest', r && r.wort === 'fest' && r.bis === '2026-12-15', r);
  ck('[fristen] ausBrief ohne Frist → null', F.ausBrief('Sehr geehrte Damen und Herren', 'mit', null) === null);
  ck('[fristen] Dauer aus Text', F.dauerAusText('zwei Wochen') === '2W' && F.dauerAusText('14 Tagen') === '14T' && F.dauerAusText('einem Monat') === '1M' && F.dauerAusText('Monats') === '1M' && F.dauerAusText('vielen Tagen') === null);
}

// ---------- Dublettenschutz und Laden ----------
{
  const a = F.eintragSauber({ art: 'wid', stelle: 'jc', basis: { datum: '2026-11-10' }, quelle: 'bescheid' });
  const b = F.eintragSauber({ art: 'wid', stelle: 'jc', basis: { datum: '2026-11-10' }, quelle: 'brief' });
  ck('[fristen] Zweimal derselbe Bescheid: gleicher Schlüssel', F.schluessel(a) === F.schluessel(b) && a.bis === '2026-12-14');
  ck('[fristen] Andere Stelle: anderer Schlüssel', F.schluessel(a) !== F.schluessel(F.eintragSauber({ art: 'wid', stelle: 'wg', basis: { datum: '2026-11-10' } })));
  ck('[fristen] Eigener Schlüssel anderer Bereiche', F.schluessel(F.eintragSauber({ art: 'frist', basis: { fest: '2027-05-31' }, schluessel: 'ks-2027-05-31' })) === 'k|ks-2027-05-31');
  ck('[fristen] Unbekannte Art, Stelle, Wort werden verworfen', F.eintragSauber({ art: 'xx' }) === null && F.eintragSauber({ art: 'wid', stelle: '<b>' }).stelle === null && F.eintragSauber({ art: 'eigen', titel: '  ' }) === null);
  ck('[fristen] wb kann nicht gespeichert werden (wird aus dem Haushaltsplan abgeleitet)', F.eintragSauber({ art: 'wb' }) === null);
  const lang = F.eintragSauber({ art: 'eigen', titel: 'x'.repeat(100) + '\u0000‮', bis: '2026-12-01' });
  ck('[fristen] Titel höchstens 60 Zeichen, ohne Steuerzeichen', lang.titel.length === 60 && !/[\u0000-\u001f]/.test(lang.titel));
  ck('[fristen] Manipuliertes Ende wird neu gerechnet', F.eintragSauber({ art: 'wid', basis: { datum: '2026-11-10' }, bis: '2099-01-01', wort: 'fest' }).bis === '2026-12-14');
  const m = F.eintragSauber({ art: 'mb', basis: { zugang: '2026-12-11' }, wort: 'fest' });
  ck('[fristen] Wort wird nicht übernommen, sondern gerechnet', m.wort === 'gerechnet' && m.bis === '2026-12-28');
  const viele = { v: 1, e: [] };
  for (let i = 0; i < 60; i++) viele.e.push({ art: 'eigen', titel: 'T' + i, basis: { fest: '2026-12-01' }, neu: i });
  viele.e.push({ art: 'eigen', titel: 'alt', basis: { fest: '2026-01-01' }, erledigt: '2026-09-01', neu: 999 });
  viele.e.push({ art: 'eigen', titel: 'frisch', basis: { fest: '2026-01-01' }, erledigt: '2026-11-01', neu: 998 });
  const nm = F.normiere(JSON.stringify(viele), '2026-11-20');
  ck('[fristen] normiere: höchstens 50, erledigte nach 30 Tagen weg', nm.e.length === 50 && !nm.e.some((e) => e.titel === 'alt') && nm.e.some((e) => e.titel === 'frisch'), nm.e.length);
  ck('[fristen] normiere: Müll → leer', F.normiere('{kaputt', '2026-11-20').e.length === 0 && F.normiere(null).e.length === 0 && F.normiere('[1,2]').e.length === 0);
  ck('[fristen] normiere: Datum per Regex und echt', F.normiere({ e: [{ art: 'zahl', basis: { fest: '2026-02-30' } }, { art: 'zahl', basis: { fest: '<img>' } }] }).e.every((e) => e.bis === null));
  const wbz = F.normiere({ wb: { 'wb-kiz-2026-12-31': { erledigt: '2026-11-19' }, 'wb-xx-2026-12-31': { erledigt: '2026-11-19' }, 'wb-kiz-2026-01-01': { erledigt: '2026-01-01' } } }, '2026-11-20');
  ck('[fristen] normiere: Zustand der Folgeanträge geprüft', Object.keys(wbz.wb).join() === 'wb-kiz-2026-12-31', wbz.wb);
  const abgeleitet = F.wbAus(JSON.stringify({ bewilligt: { kiz: '2026-12-31', wohngeld: 'x' } }), wbz, '2026-11-20');
  ck('[fristen] Folgeantrag aus dem Haushaltsplan abgeleitet, mit Zustand', abgeleitet.length === 1 && abgeleitet[0].erledigt === '2026-11-19' && abgeleitet[0].id === 'wb-kiz-2026-12-31');
}

// ---------- Auswahl für den Hinweis beim Öffnen ----------
{
  const h = '2026-12-01';
  const e = (bis, x) => Object.assign({ art: 'zahl', bis, wort: 'fest' }, x || {});
  ck('[fristen] 8 Tage vorher: kein Hinweis', F.zeigen([e('2026-12-09')], h).length === 0);
  ck('[fristen] 7 Tage vorher: Hinweis', F.zeigen([e('2026-12-08')], h).length === 1);
  ck('[fristen] Erledigt: nie', F.zeigen([e('2026-12-02', { erledigt: '2026-11-30' })], h).length === 0);
  ck('[fristen] Später = morgen: heute nichts, morgen ja', F.zeigen([e('2026-12-03', { spaeter: '2026-12-02' })], h).length === 0 && F.zeigen([e('2026-12-03', { spaeter: '2026-12-02' })], '2026-12-02').length === 1);
  ck('[fristen] Seit 14 Tagen abgelaufen: ja, seit 15: nein', F.zeigen([e('2026-11-17')], h).length === 1 && F.zeigen([e('2026-11-16')], h).length === 0);
  ck('[fristen] Ohne Datum: nie', F.zeigen([{ art: 'mit', bis: null, wort: 'offen' }], h).length === 0);
  const wb = Object.assign(F.folgeantrag('wohngeld', '2027-03-31'), { erledigt: null });
  ck('[fristen] Folgeantrag Wohngeld: am 29.01.2027 nein, ab 30.01.2027 ja', F.zeigen([wb], '2027-01-29').length === 0 && F.zeigen([wb], '2027-01-30').length === 1);
  const s = F.zeigen([e('2026-12-05'), e('2026-12-02', { wort: 'gerechnet' }), e('2026-11-25'), e('2026-12-02'), e('2026-12-01')], h);
  ck('[fristen] Sortierung: abgelaufen vor heute vor morgen, bei gleichem Tag Fest zuerst', s.map((x) => x.bis + x.wort[0]).join() === '2026-11-25f,2026-12-01f,2026-12-02f,2026-12-02g,2026-12-05f', s.map((x) => x.bis + x.wort[0]));
  ck('[fristen] Später: kurze Frist morgen', F.spaeterTag(e('2026-12-05'), h) === '2026-12-02');
  ck('[fristen] Später: Folgeantrag in 7 Tagen, spätestens 7 Tage vor Ende, ab Ende morgen', F.spaeterTag(wb, '2027-02-01') === '2027-02-08' && F.spaeterTag(wb, '2027-03-22') === '2027-03-24' && F.spaeterTag(wb, '2027-03-31') === '2027-04-01');
}

// ---------- Sprachdateien ----------
{
  const DIR = path.join(__dirname, '..', 'src', 'lang', 'fristen');
  const LANGS = ['de', 'en', 'ar', 'fa', 'fa-AF', 'fr', 'pl', 'ps', 'ro', 'ru', 'so', 'tr', 'uk'];
  const de = JSON.parse(fs.readFileSync(path.join(DIR, 'de.json'), 'utf8'));
  const quelle = fs.readFileSync(path.join(__dirname, '..', 'src', 'fristen.js'), 'utf8');
  const benutzt = new Set((quelle.match(/'fri\.[a-zA-Z.]+'/g) || []).map((x) => x.slice(1, -1)).filter((k) => !k.endsWith('.')));
  F.ARTEN.forEach((a) => { benutzt.add('fri.art.' + a); if (a !== 'eigen') benutzt.add('fri.art.' + a + '.t'); });
  F.STELLEN.forEach((s) => benutzt.add('fri.stelle.' + s)); F.WORTE.forEach((w) => { benutzt.add('fri.wort.' + w); benutzt.add('fri.wort.' + w + '.t'); });
  ['fri.dauer.w', 'fri.dauer.w1', 'fri.dauer.t', 'fri.dauer.t1', 'fri.dauer.m', 'fri.dauer.m1', 'fri.karte', 'fri.h', 'fri.lead', 'fri.set.label', 'fri.set.t'].forEach((k) => benutzt.add(k));
  const fehlen = [...benutzt].filter((k) => !(k in de));
  ck('[fristen] Jeder benutzte Schlüssel steht in de.json', !fehlen.length, fehlen);
  const zahlen = (s) => (String(s).replace(/\{[^}]*\}/g, ' ').match(/\d+/g) || []).sort().join(' ');
  const platz = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(' ');
  for (const l of LANGS) {
    const f = path.join(DIR, l + '.json');
    if (!fs.existsSync(f)) { ck('[fristen] Sprachdatei vorhanden: ' + l, false); continue; }
    const L = JSON.parse(fs.readFileSync(f, 'utf8'));
    const ohne = Object.keys(de).filter((k) => typeof L[k] !== 'string' || !L[k].trim());
    const fremd = Object.keys(L).filter((k) => !(k in de));
    ck('[fristen] ' + l + ': alle Schlüssel übersetzt, keine fremden', !ohne.length && !fremd.length, { ohne, fremd });
    const z = Object.keys(de).filter((k) => typeof L[k] === 'string' && (zahlen(L[k]) !== zahlen(de[k]) || platz(L[k]) !== platz(de[k])));
    ck('[fristen] ' + l + ': Zahlen und Platzhalter wie im Deutschen', !z.length, z.map((k) => k + ': ' + L[k]));
    ck('[fristen] ' + l + ': kein HTML und kein Markdown', !Object.values(L).some((v) => /[<>]|\*\*/.test(v)));
  }
  const es = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'einfach', 'fristen.json'), 'utf8'));
  const esFremd = Object.keys(es).filter((k) => !(k in de)), esPlatz = Object.keys(es).filter((k) => platz(es[k]) !== platz(de[k]));
  ck('[fristen] Einfache Sprache: nur Schlüssel aus de.json, gleiche Platzhalter', !esFremd.length && !esPlatz.length, { esFremd, esPlatz });
}

console.log(fails ? `\n${fails} von ${n} Prüfungen fehlgeschlagen` : `Fristen-Test bestanden: ${n} Prüfungen`);
process.exit(fails ? 1 : 0);
