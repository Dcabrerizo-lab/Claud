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
    // 2b. Rate 50 € reicht nur für den Strom (Stufe 1): Inkasso ist „später“ dran – „Übernehmen“ setzt keine Rate von 0 € ins Schreiben (Prüfung PR #105)
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 300000, aus: { essen: 150000, energie: 65000 } } });
    zurRate();
    { const s2 = $('ms-von'); s2.value = 'aaaa01'; s2.dispatchEvent(new w.Event('change', { bubbles: true })); const vor = $('ms-rate').value;
      klick($('ra-uebernehmen'));
      check('[rate-dom] „Übernehmen“ bei „später“: keine 0 € im Schreiben, Hinweis auf den Vorrang', $('ms-rate').value === vor && vor !== '0' && !/monatlich 0 €/.test($('ms-text').value) && /Inkasso Nord \(dieses Schreiben\)später/.test(tx($('ra-auft'))) && /Miete, Strom und Geldstrafen kommen zuerst/.test(tx(d.querySelector('.ra-karte [aria-live]'))), [$('ms-rate').value, tx($('ra-auft'))]);
      const s3 = $('ms-von'); s3.value = 'aaaa02'; s3.dispatchEvent(new w.Event('change', { bubbles: true })); }
    // 3. Kein Spielraum: Hinweis und Knopf zur Schuldnerberatung
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 300000, aus: { essen: 250000 } } });
    zurRate();
    check('[rate-dom] kein Spielraum: Hinweis, kein Kasten', /Gerade bleibt kein Spielraum für eine Rate\. Hol dir Hilfe bei der Schuldnerberatung\./.test(tx($('ra-keine'))) && !$('ra-betrag') && !$('ra-auft'));
    // 3b. Einkommen unter der Pfändungsfreigrenze (1.000 €): kein Vorschlag, Hinweis Pfändungstabelle
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 100000, aus: { essen: 20000 } } });
    zurRate();
    check('[rate-dom] nichts pfändbar: Hinweis Pfändungstabelle und Beratung, kein Kasten', /Nach der Pfändungstabelle könnten Gläubiger/.test(tx($('ra-keine'))) && !$('ra-betrag') && !!$('ra-zur-beratung'));
    { const tr = $('ra-trotz'), kids = [...d.querySelector('#spInhalt').children];
      check('[ux-c] nichts pfändbar: Abraten vorne, Hauptknopf „Beratungsstelle finden“, Formular erst nach bewusster Entscheidung (zugeklappt)', !!tr && !tr.open && tr.contains($('ms-rate')) && tr.contains($('ra-warn')) && tr.contains($('ra-zur-pruef')) && $('ra-zur-beratung').className === 'btn' && tx($('ra-zur-beratung')) === 'Beratungsstelle finden' && kids.indexOf($('ra-empf')) < kids.indexOf(tr));
      tr.open = true; tr.dispatchEvent(new w.Event('toggle')); const f = $('ms-g'); f.value = 'X'; f.dispatchEvent(new w.Event('input', { bubbles: true }));
      zurRate(); check('[ux-c] „Trotzdem“ bleibt nach erneutem Öffnen offen', $('ra-trotz').open); $('ra-trotz').open = false; $('ra-trotz').dispatchEvent(new w.Event('toggle')); }
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 300000, aus: { essen: 250000 } } }); zurRate();
    klick($('ra-zur-beratung'));
    check('[rate-dom] Knopf öffnet direkt „Beratungsstelle finden“', !!$('sb-suche'));
    // 4. Sprachen: Englisch und Einfache Sprache zeigen eigene Texte
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: 300000, aus: { essen: 150000, energie: 50000 } } });
    w.__solo.lang('en'); zurRate();
    check('[rate-dom] Englisch', /We suggest this instalment: €200 a month/.test(tx($('ra-betrag'))) && /Stadtwerke \(this letter\)/.test(tx($('ra-auft'))), tx($('ra-betrag')));
    w.__solo.lang('de'); if ($('einfacheSpracheBtn')) { klick($('einfacheSpracheBtn')); zurRate(); check('[rate-dom] Einfache Sprache', /Diese Rate schlagen wir dir vor: 200 € im Monat/.test(tx($('ra-betrag'))), tx($('ra-betrag'))); }
    // 5. Paar: Frage „Wer hat die Schulden?“ (Auftrag David 25.11.2026). Ich 1.500 €, Partner 2.500 € netto (Lohn), 1 Unterhaltsberechtigter:
    // ich → nichts pfändbar; Partner → 157,59 € pfändbar, Rate 155 €; beide → je eigene Tabelle (0 + 157,59), nicht 4.000 € zusammen (907,59 €)
    w.__solo.lang('de');
    if ($('einfacheSpracheBtn') && $('einfacheSpracheBtn').getAttribute('aria-checked') === 'true') klick($('einfacheSpracheBtn'));
    const allein = () => { zurRate(); return !$('ra-wer'); };
    check('[rate-wer] allein: keine Frage „Wer hat die Schulden?“', allein());
    w.__solo.set({ adults: 2, kids: 0, ek1Art: 'lohn', ek1Netto: 1500, ek1Brutto: 2000, ek2Art: 'lohn', ek2Netto: 2500, ek2Brutto: 3600, miete: 500 });
    w.Haushalt.laden({ plan: { kg: null, leist: null, sonst: null, aus: { essen: 150000, energie: 50000 } } });
    zurRate();
    const wer = $('ra-wer'), knoepfe = wer ? [...wer.querySelectorAll('button.wahl')] : [];
    check('[rate-wer] Paar: Frage mit drei Antworten, Gruppe mit Namen', !!wer && wer.getAttribute('role') === 'group' && tx($(wer.getAttribute('aria-labelledby'))) === 'Wer hat die Schulden?'
      && knoepfe.map(tx).join('|') === 'Ich|Mein Partner oder meine Partnerin|Wir beide' && knoepfe.every((b) => b.getAttribute('aria-pressed') === 'false'), knoepfe.map(tx));
    check('[rate-wer] ohne Antwort: wie bisher nur mein Einkommen (1.500 €) → nichts pfändbar', /Nach der Pfändungstabelle/.test(tx($('ra-keine'))));
    klick($('ra-wer-partner'));
    check('[rate-wer] Partner: Rate 155 €, gewählt markiert, Fokus bleibt', /Diese Rate schlagen wir dir vor: 155 € im Monat/.test(tx($('ra-betrag'))) && $('ra-wer-partner').getAttribute('aria-pressed') === 'true' && d.activeElement === $('ra-wer-partner'), tx($('ra-betrag')));
    check('[rate-wer] Partner: Rechenweg nennt das Einkommen des Partners', /etwa 157,59 €/.test(tx(d.querySelector('details.ra-so'))) && /dein eigenes Einkommen zählen nicht/.test(tx(d.querySelector('details.ra-so'))));
    check('[rate-wer] Partner: Hinweis, dass die Zahl der Unterhaltsberechtigten abweichen kann (Pfändungsrechner)', /nicht verheiratet/.test(tx($('ra-wer-pers'))) && /Pfändungsrechner/.test(tx($('ra-wer-pers'))));
    check('[rate-wer] Antwort im Haushaltsplan gespeichert', w.Haushalt.schuldner() === 'partner' && w.Haushalt.daten().schuldner === 'partner');
    klick($('ra-wer-beide'));
    check('[rate-wer] beide: je eigene Tabelle (0 € + 157,59 €), nicht zusammengezählt', /Diese Rate schlagen wir dir vor: 155 € im Monat/.test(tx($('ra-betrag'))) && /bei dir etwa 0(,00)? €, bei deinem Partner oder deiner Partnerin etwa 157,59 €, zusammen 157,59 €/.test(tx(d.querySelector('details.ra-so'))), tx(d.querySelector('details.ra-so')));
    klick($('ra-wer-ich'));
    check('[rate-wer] ich: wieder nichts pfändbar, kein Hinweis zu Unterhaltsberechtigten', !!$('ra-keine') && !$('ra-betrag') && $('ra-wer-ich').getAttribute('aria-pressed') === 'true' && !$('ra-wer-pers'));
    w.__solo.lang('en'); zurRate();
    check('[rate-wer] Englisch', tx($('ra-wer-q')) === 'Who has the debts?' && tx($('ra-wer-beide')) === 'Both of us');
    w.__solo.lang('de');
    w.__solo.set({ adults: 1 }); check('[rate-wer] wieder allein: Frage weg', allein());
    check('[rate-dom] keine Fehler im Fenster', errors.length === 0, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme: ' + e.stack); }
  if (fehler) { console.log(fehler + ' von ' + n + ' FEHLGESCHLAGEN'); process.exit(1); }
  console.log('Raten-Empfehlung DOM-Test bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}, 400);
