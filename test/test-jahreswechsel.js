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

function seite(iso, vorbelegt) {
  const errors = [];
  const store = Object.assign({}, vorbelegt || {});
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

// Ganze Ergebnisseiten nach dem Jahreswechsel in allen 8 Sprachen: keine Skriptfehler, keine kaputten Texte
// (undefined, NaN, offene Platzhalter, fehlende Übersetzungsschlüssel), und die 2027-Werte stehen wirklich auf den Karten.
const SPRACHEN = fs.readdirSync(__dirname + '/../src/lang').filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
const leer = { adults: 1, kids: 0, kidsU6: 0, kids14: 0, young: 0, ek1Art: '', ek1Brutto: '', ek1Netto: '', ek2Art: '', ek2Brutto: '', ek2Netto: '', unterhalt: '', kindEink: '', baby: '', aufenthalt: '', miete: '', mietstufe: '', plz: '', vermoegen: '', gebJahr: '', pflegegrad: '', gdb: '', bezug: {} };
const HH = {
  allein620: { kids: 1, kidsU6: 1, ek1Art: 'lohn', ek1Brutto: '620', ek1Netto: '620', miete: '600', plz: '90402', vermoegen: '0', baby: 'bald' },
  paar: { adults: 2, kids: 2, kidsU6: 1, ek1Art: 'lohn', ek1Brutto: '2400', ek1Netto: '1750', ek2Art: 'lohn', ek2Brutto: '500', ek2Netto: '500', miete: '850', plz: '10115', vermoegen: '2000' },
  rente: { ek1Art: 'rente', ek1Brutto: '900', ek1Netto: '820', miete: '480', plz: '01067', vermoegen: '3000', gebJahr: '1958', pflegegrad: '2', gdb: '80' },
  alg: { kids: 1, ek1Art: 'alg', ek1Netto: '1100', miete: '700', plz: '50667', vermoegen: '0', baby: 'da' },
};
const kaputt = /undefined|NaN|\[object|\{[a-zA-Z0-9]+\}|\b[a-z]{2,}\.[a-zA-Z0-9]+\.[a-zA-Z0-9.]+\b/;
for (const iso of ['2026-12-31T22:00:00', '2027-01-01T08:00:00']) {
  for (const lang of SPRACHEN) {
    for (const [name, hh] of Object.entries(HH)) {
      const st = { 'lotse-lang': lang, 'lotse.ack': '1', 'lotse.state': JSON.stringify({ s: Object.assign({}, leer, hh), p: {}, e: true }) };
      const pg = seite(iso, st);
      const txt = pg.d.getElementById('cards').textContent;
      const m = txt.match(kaputt);
      ck(`${iso.slice(0, 10)} ${lang} ${name}: Karten ohne Skriptfehler und ohne kaputte Texte`, pg.errors.length === 0 && pg.d.querySelectorAll('#cards .card:not(.startcard)').length === KARTEN.length && !m, (pg.errors.join('; ') || '') + (m ? ' Text: …' + txt.slice(Math.max(0, m.index - 60), m.index + 60) + '…' : ''));
      if (lang === 'de' && name === 'allein620') {
        const kkg = pg.d.getElementById('c-kkg'), k = kkg ? kkg.textContent : '';
        if (iso.startsWith('2026')) ck('31.12.2026: 620 € Lohn ist kein Minijob, Kinderkrankengeld möglich mit 30 Tagen (alleinerziehend)', /Möglich/.test(k) && /30 Arbeitstage/.test(k) && /höchstens 70/.test(k), k.slice(0, 200));
        else ck('1.1.2027: 620 € Lohn ist jetzt Minijob (Grenze 633 €), kein Kinderkrankengeld', /Unwahrscheinlich/.test(k) && /Minijob/.test(k) && !/Arbeitstage/.test(k), k.slice(0, 200));
      }
    }
  }
}

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : 'Jahreswechsel-Test bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
