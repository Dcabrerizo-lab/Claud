// Schulden-Liste in der echten Oberfläche (dist, JSDOM): Einstieg über Geld sparen → Schulden, Eintragen, Gruppen nach Dringlichkeit,
// Frist, Speichern je Vorgang, „Alle Angaben löschen“ mit Rückgängig, nur Text (kein HTML), Blatt für die Beratung, Haushaltsplan, Mein Ordner, Sprachen.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const mem = {}; const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
  beforeParse(w) {
    w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {}; w.print = function () { w.__gedruckt = true; };
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
const setze = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
const klick = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const tx = (e) => e.textContent.replace(/[  ]/g, ' ');
const I = w.eval('I18N');
const zurListe = () => {
  klick($('goSparen'));
  const k = [...d.querySelectorAll('#spInhalt button.weg')].find((b) => b.textContent.includes(I.de['sp.schulden']));
  klick(k); klick($('sp-schuldenliste'));
};
const eintragen = (o) => {
  klick($('sl-neu'));
  Object.keys(o).forEach((k) => setze('sl-f-' + k, o[k]));
  klick($('sl-speichern'));
};
setTimeout(() => {
  try {
    w.__solo.lang('de');
    check('[schuldenliste] keine neue Startkachel (6 bleiben)', d.querySelectorAll('#v-start .sk').length === 6, d.querySelectorAll('#v-start .sk').length);
    zurListe();
    check('[schuldenliste] Knopf unter „Erste Schritte“ öffnet die Liste', !$('v-schulden').hidden && $('v-sparen').hidden);
    check('[schuldenliste] leere Liste mit Einleitung', /Schreib alle Schulden auf/.test($('slInhalt').textContent) && !$('slSumme'));
    // Eintrag anlegen
    eintragen({ g: 'Stadtwerke', art: 'energie', stand: '512,30', st: 'mahnung' });
    check('[schuldenliste] Eintrag unter „Zuerst“', $('sl-g-1') && $('sl-g-1').nextElementSibling.textContent.includes('Stadtwerke'));
    check('[schuldenliste] Summe „etwa 512 €“, 1 offen', /Schulden zusammen: etwa 512 €/.test(tx($('slSumme'))) && /1 offene/.test($('slSumme').textContent), tx($('slSumme')));
    check('[schuldenliste] Pille „Mahnung bekommen“ als Warnung', !!d.querySelector('#slInhalt .pill.vielleicht') && d.querySelector('#slInhalt .pill.vielleicht').textContent === 'Mahnung bekommen');
    check('[schuldenliste] Begründung zum Aufklappen (Energie)', [...d.querySelectorAll('#slInhalt .sl-eintrag details')].some((x) => /100 €/.test(tx(x)) && !x.open));
    // Fehlender Gläubiger
    klick($('sl-neu')); klick($('sl-speichern'));
    check('[schuldenliste] Pflichtfeld Gläubiger', !$('slEingabeMsg').hidden && d.activeElement === $('sl-f-g'));
    setze('sl-f-g', 'X'); setze('sl-f-rate', 'abc'); klick($('sl-speichern'));
    check('[schuldenliste] ungültiger Betrag wird gemeldet', /als Zahl/.test($('slEingabeMsg').textContent) && d.activeElement === $('sl-f-rate'));
    klick($('sl-abbrechen'));
    // Mahnbescheid mit Zustelldatum
    klick($('sl-neu')); setze('sl-f-g', 'Inkasso Nord'); setze('sl-f-art', 'inkasso'); setze('sl-f-st', 'mahnbescheid');
    check('[schuldenliste] Feld „Zugestellt“ erscheint beim Mahnbescheid', !!$('sl-f-zu'));
    setze('sl-f-zu', '2026-12-11'); setze('sl-f-stand', '300'); klick($('sl-speichern'));
    const erste = d.querySelector('#slInhalt h3.sl-stufe');
    check('[schuldenliste] Gruppe „Frist läuft“ ganz oben', erste && erste.id === 'sl-g-frist');
    const fristP = d.querySelector('#slInhalt .sl-frist');
    const heute = new Date().toISOString().slice(0, 10);
    check('[schuldenliste] Frist mit Zustellung und Ende (28.12.2026) oder „vorbei“', fristP && /11\.12\.2026/.test(fristP.textContent) && (heute <= '2026-12-28' ? /28\.12\.2026/.test(fristP.textContent) : /vorbei/.test(fristP.textContent)), fristP && fristP.textContent);
    // Speichern im Vorgang
    check('[schuldenliste] gespeichert unter lotse.schulden', /Stadtwerke/.test(mem['lotse.schulden'] || '') && /Inkasso Nord/.test(mem['lotse.schulden']));
    // XSS: nur Text
    eintragen({ g: '<img src=x onerror=alert(1)>', art: 'bank', stand: '50', rate: '80', n: 'Notiz geheim', az: 'KD-4711' });
    check('[schuldenliste] Gläubiger mit HTML bleibt Text', !d.querySelector('#slInhalt img') && $('slInhalt').textContent.includes('<img src=x onerror=alert(1)>'));
    // Haushaltsplan: Rest 200 €, Raten 50 €; Liste Raten 80 €
    w.Haushalt.laden({ v: 1, plan: { kg: null, leist: 25000, sonst: null, aus: { raten: 5000 } }, buch: [] });
    // Rest = 250 € Einnahmen − 50 € Raten = 200 €
    w.__solo.lang('de');
    const hh = tx($('slHh'));
    check('[schuldenliste] Haushaltsplan: frei vor Raten etwa 250 €, danach etwa 170 €, Abweichung', /etwa 250 €/.test(hh) && /etwa 170 €/.test(hh) && /50 € für Raten, in dieser Liste 80 €/.test(hh), hh);
    // Bearbeiten und Löschen mit Rückfrage
    const bank = [...d.querySelectorAll('#slInhalt .sl-eintrag')].find((li) => li.textContent.includes('<img'));
    klick(bank.querySelector('button'));
    check('[schuldenliste] Ändern füllt das Formular', $('sl-f-g').value === '<img src=x onerror=alert(1)>' && $('sl-f-rate').value === '80');
    // Blatt für die Beratung
    klick($('sl-abbrechen'));
    klick($('sl-druck'));
    const seite = $('slSeite');
    check('[schuldenliste] Blatt offen, Fokus auf der Überschrift, Ansicht ausgeblendet', !$('slBlatt').hidden && d.activeElement === $('h-slb') && $('app').classList.contains('pm'));
    check('[schuldenliste] Blatt: kein HTML aus Eingaben, Notiz standardmäßig nicht gedruckt', !seite.querySelector('img') && !seite.textContent.includes('Notiz geheim') && seite.textContent.includes('Stadtwerke'));
    setze('slKuerzel', 'AB'); klick($('slMitNotiz'));
    check('[schuldenliste] Kürzel erscheint, Notiz mit Haken', /Kürzel: AB/.test(seite.textContent) && seite.textContent.includes('Notiz geheim'));
    check('[schuldenliste] Aktenzeichen standardmäßig gedruckt, Haken nimmt es heraus', seite.textContent.includes('KD-4711') && (klick($('slMitAz')), !seite.textContent.includes('KD-4711')) && (klick($('slMitAz')), seite.textContent.includes('KD-4711')));
    check('[schuldenliste] Blatt auf Deutsch mit Unterlagenliste', seite.lang === 'de' && /Bitte mitbringen/.test(seite.textContent) && /Gläubigerliste/.test(seite.textContent));
    w.__solo.lang('ar');
    check('[schuldenliste] Blatt bleibt Deutsch, auch bei Arabisch', /Gläubigerliste/.test($('slSeite').textContent) && /Bitte mitbringen/.test($('slSeite').textContent));
    w.__solo.lang('de');
    klick($('slDruck'));
    check('[schuldenliste] Web: Drucken öffnet den Druckdialog', w.__gedruckt === true);
    klick($('slBlattZu'));
    check('[schuldenliste] Blatt schließen', $('slBlatt').hidden && !$('app').classList.contains('pm'));
    // CSV: erst Hinweis, Abbrechen erstellt nichts
    klick($('sl-csv'));
    check('[schuldenliste] CSV: vorher Hinweis zum Datenschutz mit Ja/Abbrechen', !!$('sl-csv-ja') && /Lösche sie danach/.test($('slFrage').textContent));
    klick([...$('slFrage').querySelectorAll('button')].find((b) => b.id !== 'sl-csv-ja'));
    check('[schuldenliste] CSV: Abbrechen schließt den Hinweis', !$('sl-csv-ja') && d.activeElement === $('sl-csv'));
    // Löschen
    const bank2 = [...d.querySelectorAll('#slInhalt .sl-eintrag')].find((li) => li.textContent.includes('<img'));
    klick(bank2.querySelector('button')); klick($('sl-loeschen'));
    check('[schuldenliste] Löschen fragt nach', !!$('sl-loeschen-ja') && /wirklich/.test($('slEingabe').textContent));
    klick($('sl-loeschen-ja'));
    check('[schuldenliste] gelöscht, Fokus auf „Schuld eintragen“', !$('slInhalt').textContent.includes('<img') && d.activeElement === $('sl-neu'));
    // Erledigt zählt nicht
    const sw = [...d.querySelectorAll('#slInhalt .sl-eintrag')].find((li) => li.textContent.includes('Stadtwerke'));
    klick(sw.querySelector('button')); setze('sl-f-st', 'erledigt'); klick($('sl-speichern'));
    check('[schuldenliste] erledigte Einträge zählen nicht und stehen eingeklappt unten', /etwa 300 €/.test(tx($('slSumme'))) && d.querySelector('#slInhalt details.sl-erledigt') && !d.querySelector('#slInhalt details.sl-erledigt').open, tx($('slSumme')));
    // Mein Ordner: Zahl, keine Summe
    klick(d.querySelector('#appnav button[data-ansicht="ordner"]'));
    const oz = $('or-schulden');
    check('[schuldenliste] Mein Ordner: Zeile „Schulden-Liste · 1 offen“, ohne Summe', oz && /Schulden-Liste/.test(oz.textContent) && /1 offen/.test(oz.textContent) && !/€/.test(oz.textContent), oz && oz.textContent);
    klick(oz);
    check('[schuldenliste] aus Mein Ordner zurück zur Liste', !$('v-schulden').hidden);
    // Sprachen: keine fehlenden Schlüssel
    ['ar', 'en', 'uk', 'fa-AF'].forEach((l) => {
      w.__solo.lang(l);
      check('[schuldenliste] ' + l + ': Ansicht ohne fehlende Schlüssel', !/\bsl\.[a-z]/.test($('v-schulden').textContent) && !$('v-schulden').textContent.includes(I.de['sl.neu']), l);
    });
    w.__solo.lang('de');
    // Vorgang: „Alle Angaben löschen“ und Rückgängig
    klick(d.querySelector('#appnav button[data-ansicht="start"]'));
    zurListe();
    const vorher = mem['lotse.schulden'];
    klick($('clearBtn'));
    check('[schuldenliste] „Alle Angaben löschen“ nennt und leert die Schulden-Liste', /Schulden-Liste/.test(w.eval('I18N').de['sl.ordner']) && !mem['lotse.schulden'], mem['lotse.schulden']);
    const undo = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === I.de['clear.undo'] || /Rückgängig/.test(b.textContent));
    if (undo) { klick(undo); check('[schuldenliste] Rückgängig: Liste wieder da', mem['lotse.schulden'] === vorher && /Inkasso Nord/.test($('slInhalt').textContent)); }
    check('[schuldenliste] keine Skriptfehler', errors.length === 0, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme', e && e.stack); }
  if (fehler) { console.log('\n' + fehler + ' von ' + n + ' FEHLGESCHLAGEN'); process.exit(1); }
  console.log('Schulden-Liste-DOM-Test bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}, 300);
