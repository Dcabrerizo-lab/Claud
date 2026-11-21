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
    { id: 'aaaa02', g: 'Stadtwerke', art: 'energie', stand: 5000, st: 'mahnung' },
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
    check('[rate-dom] ohne Plan: Vermerk sichtbar', /Trag im Haushaltsplan deine Einnahmen, die Miete und das Essen ein\. Dann schlagen wir dir eine Rate vor\./.test(tx($('ra-ohne'))) && !$('ra-betrag') && !$('ra-uebernehmen'));
    check('[rate-dom] ohne Plan: Schreiben mit Ratenfeld und Lücke', !!$('ms-rate') && /monatlich \[Betrag\] €/.test($('ms-text').value));
    check('[rate-dom] Hinweis Anerkenntnis mit Knopf zur Prüfliste', /Anerkennung der Forderung/.test(tx($('ra-warn'))) && !!$('ra-zur-pruef'));
    klick($('ra-zum-plan'));
    check('[rate-dom] Knopf öffnet den Haushaltsplan', /haushalt/.test(w.location.hash), w.location.hash);
    // 1b. Plan mit Einnahmen und nur einer Nebenausgabe (Prüfung Richtigkeit 21.11.2026): noch kein Vorschlag, Miete und Essen fehlen
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 120000, aus: { handy: 2000 } } });
    zurRate();
    check('[rate-dom] nur Handy im Plan: kein Vorschlag', !!$('ra-ohne') && !$('ra-betrag'));
    // 2. Plan mit Miete (aus dem Check) und Essen: Einnahmen 3000 €, Ausgaben 2500 € → frei 500, Puffer 300, Rate 200 € (pfändbar 988,82 €)
    w.__solo.set({ miete: 500 });
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 300000, aus: { essen: 150000, energie: 50000 } } });
    zurRate();
    check('[rate-dom] Kasten mit Rate 300 €', /Diese Rate schlagen wir dir vor: 200 € im Monat/.test(tx($('ra-betrag'))) && $('ra-betrag').classList.contains('hb-ergebnis') && !$('ra-ohne'), tx($('ra-betrag')));
    check('[rate-dom] „So rechnen wir“ zum Aufklappen mit Rechenweg', !!d.querySelector('details.ra-so') && /3\.000 € minus Ausgaben 2\.500 € = 500 €/.test(tx(d.querySelector('details.ra-so'))) && /Bei dir: 300 €/.test(tx(d.querySelector('details.ra-so'))) && /etwa 988,82 €/.test(tx(d.querySelector('details.ra-so'))));
    check('[rate-dom] Tipp „Biete nur an …“', /Biete nur an, was du jeden Monat sicher zahlen kannst\./.test(tx(d.querySelector('.ra-tipp'))));
    // Vorrang: Stadtwerke (Strom) zuerst voll 50 €, Rest 150 € anteilig 600/100 → 128/21 €
    check('[rate-dom] Aufteilung: Strom zuerst (50 €), dann Inkasso 128 € und Versand 21 €, ohne Auswahl nichts hervorgehoben', /^Gläubiger.*Stadtwerke50 €Inkasso Nord128 €Versand Süd21 €Gesamtrate200 €$/.test(tx($('ra-auft'))) && !d.querySelector('.ra-dies'), tx($('ra-auft')));
    check('[rate-dom] Hinweis: vorrangige Schulden direkt absprechen', /Miete, Strom und Geldstrafen kommen zuerst/.test(tx($('ra-vor'))));
    klick($('ra-uebernehmen'));
    check('[rate-dom] „Übernehmen“ setzt 200 ins Ratenfeld und ins Schreiben', $('ms-rate').value === '200' && /monatlich 200 € zu zahlen/.test($('ms-text').value) && d.activeElement === $('ms-rate'));
    check('[rate-dom] Schreiben mit Vorbehalt „ohne Anerkennung einer Rechtspflicht“', /ohne Anerkennung einer Rechtspflicht/.test($('ms-text').value));
    // Gläubiger des Schreibens aus der Liste wählen → in der Aufteilung hervorgehoben, Rate bleibt
    const s = $('ms-von'); s.value = 'aaaa02'; s.dispatchEvent(new w.Event('change', { bubbles: true }));
    const dies = d.querySelector('#ra-auft tr.ra-dies');
    check('[rate-dom] Gläubiger des Schreibens hervorgehoben (Text und Klasse)', !!dies && /Stadtwerke \(dieses Schreiben\)50 €/.test(tx(dies)) && d.querySelectorAll('#ra-auft tr.ra-dies').length === 1, tx(dies));
    check('[rate-dom] Rate bleibt nach dem Wechsel im Schreiben', $('ms-rate').value === '200' && /An|Stadtwerke/.test($('ms-text').value) && /monatlich 200 €/.test($('ms-text').value));
    klick($('ra-uebernehmen'));
    check('[rate-dom] „Übernehmen“ mit gewähltem Gläubiger: dessen Teil (50 €)', $('ms-rate').value === '50' && /monatlich 50 € zu zahlen/.test($('ms-text').value));
    // 3. Kein Spielraum: Hinweis und Knopf zur Schuldnerberatung
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 300000, aus: { essen: 250000 } } });
    zurRate();
    check('[rate-dom] kein Spielraum: Hinweis, kein Kasten', /Gerade bleibt kein Spielraum für eine Rate\. Hol dir Hilfe bei der Schuldnerberatung\./.test(tx($('ra-keine'))) && !$('ra-betrag') && !$('ra-auft'));
    // 3b. Einkommen unter der Pfändungsfreigrenze (1.000 €): kein Vorschlag, Hinweis Pfändungstabelle
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 100000, aus: { essen: 20000 } } });
    zurRate();
    check('[rate-dom] nichts pfändbar: Hinweis Pfändungstabelle und Beratung, kein Kasten', /Nach der Pfändungstabelle könnten Gläubiger/.test(tx($('ra-keine'))) && !$('ra-betrag') && !!$('ra-zur-beratung'));
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 300000, aus: { essen: 250000 } } }); zurRate();
    klick($('ra-zur-beratung'));
    check('[rate-dom] Knopf öffnet die Kacheln der Schuldnerberatung', !!d.querySelector('#spInhalt .gs-h-finden') || !!d.querySelector('#spInhalt [class*="gs-h-"]'));
    // 4. Sprachen: Englisch und Einfache Sprache zeigen eigene Texte
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 300000, aus: { essen: 150000, energie: 50000 } } });
    w.__solo.lang('en'); zurRate();
    check('[rate-dom] Englisch', /We suggest this instalment: €200 a month/.test(tx($('ra-betrag'))) && /Stadtwerke \(this letter\)/.test(tx($('ra-auft'))), tx($('ra-betrag')));
    w.__solo.lang('de'); if ($('einfacheSpracheBtn')) { klick($('einfacheSpracheBtn')); zurRate(); check('[rate-dom] Einfache Sprache', /Diese Rate schlagen wir dir vor: 200 € im Monat/.test(tx($('ra-betrag'))), tx($('ra-betrag'))); }
    check('[rate-dom] keine Fehler im Fenster', errors.length === 0, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme: ' + e.stack); }
  if (fehler) { console.log(fehler + ' von ' + n + ' FEHLGESCHLAGEN'); process.exit(1); }
  console.log('Raten-Empfehlung DOM-Test bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}, 400);
