// Ratenempfehlung auf „Raten anbieten“ (src/geld.js) in der echten Oberfläche (dist, JSDOM): ohne Haushaltsplan nur der Vermerk mit Knopf
// zum Plan; mit Plan der Kasten „Diese Rate empfehlen wir dir“, „Übernehmen“ setzt den Betrag ins Ratenfeld und ins Schreiben;
// mehrere Schulden: Aufteilung mit hervorgehobenem Gläubiger des Schreibens; kein Spielraum: Hinweis und Knopf zur Schuldnerberatung.
// Aufruf: node test/test-rate-dom.js (nach npm run build:web)
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const mem = {
  'lotse.schulden': JSON.stringify({ v: 1, liste: [
    { id: 'aaaa01', g: 'Inkasso Nord', art: 'inkasso', stand: 60000, st: 'inkasso', adr: 'Nordweg 1\n20095 Hamburg', az: 'N-7' },
    { id: 'aaaa02', g: 'Stadtwerke', art: 'energie', stand: 30000, st: 'mahnung' },
    { id: 'aaaa03', g: 'Versand Süd', art: 'sonst', stand: 10000, st: 'offen' }] })
};
const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
  beforeParse(w) {
    w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
const klick = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const tx = (e) => (e ? e.textContent.replace(/[  ]/g, ' ') : '');
const zurRate = () => { w.location.hash = '#start'; klick($('goGeld')); klick(d.querySelector('#spInhalt .gs-inkasso')); klick(d.querySelector('#spInhalt .gs-i-rate')); };
setTimeout(() => {
  try {
    w.__solo.lang('de');
    // 1. Kein Haushaltsplan: Vermerk und Knopf zum Plan, kein Kasten
    zurRate();
    check('[rate-dom] ohne Plan: Vermerk sichtbar', /Wenn du den Haushaltsplan ausfüllst, schlagen wir dir eine Rate vor\./.test(tx($('ra-ohne'))) && !$('ra-betrag') && !$('ra-uebernehmen'));
    check('[rate-dom] ohne Plan: Schreiben mit Ratenfeld und Lücke', !!$('ms-rate') && /monatlich \[Betrag\] €/.test($('ms-text').value));
    check('[rate-dom] Hinweis Anerkenntnis mit Knopf zur Prüfliste', /Anerkennung der Forderung/.test(tx($('ra-warn'))) && !!$('ra-zur-pruef'));
    klick($('ra-zum-plan'));
    check('[rate-dom] Knopf öffnet den Haushaltsplan', /haushalt/.test(w.location.hash), w.location.hash);
    // 2. Plan ausgefüllt: Einnahmen 2000 €, Ausgaben 1500 € → frei 500, Puffer 200, Rate 300 €
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 200000, aus: { essen: 100000, energie: 50000 } } });
    zurRate();
    check('[rate-dom] Kasten mit Rate 300 €', /Diese Rate empfehlen wir dir: 300 € im Monat/.test(tx($('ra-betrag'))) && $('ra-betrag').classList.contains('hb-ergebnis') && !$('ra-ohne'), tx($('ra-betrag')));
    check('[rate-dom] „So rechnen wir“ zum Aufklappen mit Rechenweg', !!d.querySelector('details.ra-so') && /2\.000 € minus Ausgaben 1\.500 € = 500 €/.test(tx(d.querySelector('details.ra-so'))) && /Bei dir: 200 €/.test(tx(d.querySelector('details.ra-so'))));
    check('[rate-dom] Tipp „Biete nur an …“', /Biete nur an, was du jeden Monat sicher zahlen kannst\./.test(tx(d.querySelector('.ra-tipp'))));
    check('[rate-dom] Aufteilung 180/90/30 €, ohne Auswahl nichts hervorgehoben', /Inkasso Nord180 €/.test(tx($('ra-auft'))) && /Stadtwerke90 €/.test(tx($('ra-auft'))) && /Versand Süd30 €/.test(tx($('ra-auft'))) && /Gesamtrate300 €/.test(tx($('ra-auft'))) && !d.querySelector('.ra-dies'), tx($('ra-auft')));
    klick($('ra-uebernehmen'));
    check('[rate-dom] „Übernehmen“ setzt 300 ins Ratenfeld und ins Schreiben', $('ms-rate').value === '300' && /monatlich 300 € zu zahlen/.test($('ms-text').value) && d.activeElement === $('ms-rate'));
    // Gläubiger des Schreibens aus der Liste wählen → in der Aufteilung hervorgehoben, Rate bleibt
    const s = $('ms-von'); s.value = 'aaaa02'; s.dispatchEvent(new w.Event('change', { bubbles: true }));
    const dies = d.querySelector('#ra-auft tr.ra-dies');
    check('[rate-dom] Gläubiger des Schreibens hervorgehoben (Text und Klasse)', !!dies && /Stadtwerke \(dieses Schreiben\)90 €/.test(tx(dies)) && d.querySelectorAll('#ra-auft tr.ra-dies').length === 1, tx(dies));
    check('[rate-dom] Rate bleibt nach dem Wechsel im Schreiben', $('ms-rate').value === '300' && /An|Stadtwerke/.test($('ms-text').value) && /monatlich 300 €/.test($('ms-text').value));
    // 3. Kein Spielraum: Hinweis und Knopf zur Schuldnerberatung
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 100000, aus: { essen: 95000 } } });
    zurRate();
    check('[rate-dom] kein Spielraum: Hinweis, kein Kasten', /Gerade bleibt kein Spielraum für eine Rate\. Hol dir Hilfe bei der Schuldnerberatung\./.test(tx($('ra-keine'))) && !$('ra-betrag') && !$('ra-auft'));
    klick($('ra-zur-beratung'));
    check('[rate-dom] Knopf öffnet die Kacheln der Schuldnerberatung', !!d.querySelector('#spInhalt .gs-h-finden') || !!d.querySelector('#spInhalt [class*="gs-h-"]'));
    // 4. Sprachen: Englisch und Einfache Sprache zeigen eigene Texte
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 200000, aus: { essen: 150000 } } });
    w.__solo.lang('en'); zurRate();
    check('[rate-dom] Englisch', /We recommend this instalment: €300 a month/.test(tx($('ra-betrag'))) && /Stadtwerke \(this letter\)/.test(tx($('ra-auft'))), tx($('ra-betrag')));
    w.__solo.lang('de'); if ($('einfacheSpracheBtn')) { klick($('einfacheSpracheBtn')); zurRate(); check('[rate-dom] Einfache Sprache', /Diese Rate schlagen wir dir vor: 300 € im Monat/.test(tx($('ra-betrag'))), tx($('ra-betrag'))); }
    check('[rate-dom] keine Fehler im Fenster', errors.length === 0, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme: ' + e.stack); }
  if (fehler) { console.log(fehler + ' von ' + n + ' FEHLGESCHLAGEN'); process.exit(1); }
  console.log('Raten-Empfehlung DOM-Test bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}, 400);
