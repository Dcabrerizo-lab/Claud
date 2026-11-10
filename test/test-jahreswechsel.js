// Jahreswechsel: Die Rechenregeln gelten für 2026. Am 31.12.2026 darf kein Hinweis kommen, ab dem 1.1.2027 muss
// deutlich darauf hingewiesen werden (bis die Regeln aktualisiert sind). Die App muss dabei weiter fehlerfrei rechnen,
// auch Altersgrenzen (Rentenalter) müssen sich mit dem Datum richtig verschieben.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const KARTEN = require('./karten.js');
const Rules = require('../src/rules.js');
const html = fs.readFileSync(__dirname + '/../dist/sozialleistungslotse.html', 'utf8');

let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };

function seite(iso) {
  const errors = [];
  const store = {};
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      const echt = w.Date, fest = new echt(iso).getTime();
      class Fest extends echt { constructor(...a) { super(...(a.length ? a : [fest])); } static now() { return fest; } }
      w.Date = Fest;
      w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
      w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } }, configurable: true });
    }
  });
  return { d: dom.window.document, errors };
}

const vor = seite('2026-12-31T22:00:00');
ck('31.12.2026: kein Hinweis auf veraltete Regeln', vor.d.getElementById('altNotice').hidden === true);
ck('31.12.2026: App startet ohne Skriptfehler', !!vor.d.querySelector('#cards .startcard') && vor.errors.length === 0, vor.errors.join('; '));

const nach = seite('2027-01-01T08:00:00');
const alt = nach.d.getElementById('altNotice');
ck('1.1.2027: deutlicher Hinweis auf veraltete Regeln, nennt die schon eingearbeitete Minijob-Grenze', alt.hidden === false && /2026/.test(alt.textContent) && /633/.test(alt.textContent), alt.textContent);
ck('1.1.2027: App startet weiter ohne Skriptfehler', !!nach.d.querySelector('#cards .startcard') && nach.errors.length === 0, nach.errors.join('; '));
// Eingabe nach dem Jahreswechsel: Karten erscheinen, keine Fehler
const kinder = nach.d.querySelector('[data-step="kids"][data-d="1"]');
if (kinder) kinder.click();
ck('1.1.2027: nach einer Eingabe alle Karten, keine Skriptfehler', nach.d.querySelectorAll('#cards .card:not(.startcard)').length === KARTEN.length && nach.errors.length === 0, nach.d.querySelectorAll('#cards .card').length + ' ' + nach.errors.join('; '));

const spaet = seite('2029-06-15T12:00:00');
ck('2029: Hinweis bleibt, App läuft', spaet.d.getElementById('altNotice').hidden === false && spaet.errors.length === 0, spaet.errors.join('; '));

// Rentenalter verschiebt sich mit dem Datum: Jahrgang 1960 (Regelaltersgrenze 66 J. 4 M.) erreicht es je nach Geburtsmonat
// zwischen Mai 2026 und April 2027: vorher nein, dazwischen möglich (mit Hinweis), danach wahrscheinlich
const gsa = (heute) => Rules.evaluate({ adults: 1, kids: 0, young: 0, art1: 'rente', brutto: 700, netto: 700, miete: 450, vermoegen: 0, gebJahr: 1960, heute, bezug: {} }).results.find((x) => x.id === 'gsa');
ck('Jahrgang 1960: Anfang 2026 noch nicht im Rentenalter', gsa(2026.2).level === 'nein');
ck('Jahrgang 1960: Mitte 2026 je nach Geburtsmonat (möglich, mit Hinweis)', gsa(2026.5).level === 'vielleicht' && gsa(2026.5).tx.some((t) => t[0] === 'gsa.grenz'));
ck('Jahrgang 1960: Mitte 2027 sicher im Rentenalter', gsa(2027.5).level === 'ja');

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : 'Jahreswechsel-Test bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
