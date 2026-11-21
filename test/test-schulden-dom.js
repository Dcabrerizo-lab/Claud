// Schulden-Liste in der echten Oberfläche (dist, JSDOM): Einstieg über Geld und Schulden → Meine Schulden-Liste, Eintragen, Gruppen nach Dringlichkeit,
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
  klick($('goGeld'));
  klick(d.querySelector('#spInhalt .gs-liste'));
};
const eintragen = (o) => {
  klick($('sl-neu'));
  Object.keys(o).forEach((k) => setze('sl-f-' + k, o[k]));
  klick($('sl-speichern'));
};
setTimeout(() => {
  try {
    w.__solo.lang('de');
    check('[schuldenliste] keine eigene Startkachel (5: Geld und Schulden ist eine Kachel)', d.querySelectorAll('#v-start .sk').length === 5, d.querySelectorAll('#v-start .sk').length);
    zurListe();
    check('[schuldenliste] Kachel „Meine Schulden-Liste“ in „Geld und Schulden“ öffnet die Liste', !$('v-schulden').hidden && $('v-sparen').hidden);
    check('[schuldenliste] leere Liste mit Einleitung', /Schreib alle Schulden auf/.test($('slInhalt').textContent) && !$('slSumme'));
    // Eintrag anlegen
    eintragen({ g: 'Stadtwerke', art: 'energie', stand: '512,30', st: 'mahnung' });
    check('[schuldenliste] Eintrag unter „Zuerst“', $('sl-g-1') && $('sl-g-1').nextElementSibling.textContent.includes('Stadtwerke'));
    check('[schuldenliste] Summe „etwa 512 €“, 1 offen', /Schulden zusammen: etwa 512 €/.test(tx($('slSumme'))) && /1 offene/.test($('slSumme').textContent), tx($('slSumme')));
    check('[schuldenliste] Pille „Mahnung bekommen“ als Warnung', !!d.querySelector('#slInhalt .pill.vielleicht') && d.querySelector('#slInhalt .pill.vielleicht').textContent === 'Mahnung bekommen');
    check('[schuldenliste] Begründung zum Aufklappen (Energie)', [...d.querySelectorAll('#slInhalt .sl-eintrag details')].some((x) => /100 €/.test(tx(x)) && !x.open));
    // Aufbau wie in „Geld und Schulden“: große Kacheln oben, grüner Knopf direkt darunter, dann Summe und Liste
    const kr = d.querySelector('#slInhalt > .uk-raster.sl-kacheln');
    check('[schuldenliste] Kacheln oben: Beratung, Blatt, Haushaltsplan, Was bleibt mir?', kr && ['sl-zur-beratung', 'sl-druck', 'sl-hh', 'sl-pf'].every((id) => $(id) && $(id).parentNode === kr && $(id).classList.contains('uk-karte') && !!$(id).querySelector('.sk-txt b')), kr && kr.textContent);
    check('[schuldenliste] grüner Knopf direkt unter den Kacheln, Summe danach', kr && kr.nextElementSibling && kr.nextElementSibling.contains($('sl-neu')) && kr.nextElementSibling.nextElementSibling === $('slSumme'));
    check('[schuldenliste] CSV als Knopf unter der Liste', !!$('sl-csv') && !$('sl-csv').closest('.uk-raster'));
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
    check('[ux-c] Blatt: jedes Feld mit Beschriftung für die Karten-Ansicht (390 px), Zahlen ohne Umbruch', [...seite.querySelectorAll('tbody td')].every((c) => c.classList.contains('eb-nr') || c.getAttribute('data-l')) && !!seite.querySelector('tbody td.eb-zahl[data-l="' + I.de['sl.col.jetzt'] + '"]'));
    setze('slKuerzel', 'AB'); klick($('slMitNotiz'));
    check('[schuldenliste] Kürzel erscheint, Notiz mit Haken', /Kürzel: AB/.test(seite.textContent) && seite.textContent.includes('Notiz geheim'));
    check('[schuldenliste] Aktenzeichen standardmäßig gedruckt, Haken nimmt es heraus', seite.textContent.includes('KD-4711') && (klick($('slMitAz')), !seite.textContent.includes('KD-4711')) && (klick($('slMitAz')), seite.textContent.includes('KD-4711')));
    check('[schuldenliste] Blatt auf Deutsch mit Unterlagenliste', seite.lang === 'de' && /Bitte mitbringen/.test(seite.textContent) && /Gläubigerliste/.test(seite.textContent));
    w.__solo.lang('ar');
    check('[schuldenliste] Blatt bleibt Deutsch, auch bei Arabisch', /Gläubigerliste/.test($('slSeite').textContent) && /Bitte mitbringen/.test($('slSeite').textContent));
    w.__solo.lang('de');
    check('[schuldenliste] Haken „Haushaltsplan mitdrucken“ (Standard an)', $('slMitHh') && $('slMitHh').checked && /Haushaltsplan:/.test($('slSeite').textContent));
    klick($('slMitHh'));
    check('[schuldenliste] ohne Haken kein Haushaltsplan auf dem Blatt und im PDF', !/Haushaltsplan:/.test($('slSeite').textContent) && !JSON.stringify(w.Schulden.pdfSeiten()).includes('Haushaltsplan:'));
    klick($('slMitHh'));
    check('[schuldenliste] Haken wieder an: Haushaltsplan im PDF', JSON.stringify(w.Schulden.pdfSeiten()).includes('Haushaltsplan:'));
    klick($('slDruck'));
    check('[schuldenliste] Web: Drucken öffnet den Druckdialog', w.__gedruckt === true);
    klick($('slBlattZu'));
    check('[schuldenliste] Blatt schließen', $('slBlatt').hidden && !$('app').classList.contains('pm'));
    // CSV: erst Hinweis, Abbrechen erstellt nichts
    klick($('sl-csv'));
    check('[schuldenliste] CSV: vorher Hinweis zum Datenschutz mit Ja/Abbrechen', !!$('sl-csv-ja') && /Lösche sie danach/.test($('slFrage').textContent));
    klick([...$('slFrage').querySelectorAll('button')].find((b) => b.id !== 'sl-csv-ja'));
    check('[schuldenliste] CSV: Abbrechen schließt den Hinweis', !$('sl-csv-ja') && d.activeElement === $('sl-csv'));
    let csvText = null;
    w.Blob = function (teile) { csvText = teile.join(''); }; w.URL.createObjectURL = () => 'blob:test'; w.URL.revokeObjectURL = () => {};
    w.HTMLAnchorElement.prototype.click = function () {};
    klick($('sl-csv'));
    check('[schuldenliste] CSV: Haken „Notizen mit exportieren“ standardmäßig aus', $('sl-csv-notiz') && !$('sl-csv-notiz').checked && $('sl-csv-notiz').closest('#slFrage'));
    klick($('sl-csv-ja'));
    check('[schuldenliste] CSV ohne Haken: keine Notizen, keine Notiz-Spalte', csvText && csvText.includes('Stadtwerke') && !csvText.includes('Notiz geheim') && !csvText.split('\r\n')[0].includes(I.de['sl.col.notiz']), csvText);
    klick($('sl-csv')); klick($('sl-csv-notiz')); klick($('sl-csv-ja'));
    check('[schuldenliste] CSV mit Haken: Notizen enthalten', csvText.includes('Notiz geheim') && csvText.split('\r\n')[0].includes(I.de['sl.col.notiz']));
    klick($('sl-csv'));
    check('[schuldenliste] CSV: Haken beim nächsten Mal wieder aus', !$('sl-csv-notiz').checked);
    klick([...$('slFrage').querySelectorAll('button')].find((b) => b.id !== 'sl-csv-ja'));
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
    check('[schuldenliste] mit FristenOrdner (src/fristen.js): Fristende 28.12.2026, keine eigene Frist in Mein Ordner', !!w.FristenOrdner && w.Schulden.fristEnde('2026-12-11', 14) === '2026-12-28' && !/Frist/.test(oz.textContent), oz.textContent);
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
    klick($('clear2')); klick($('loeschJa'));
    check('[schuldenliste] „Nur diesen Vorgang löschen“ nennt und leert die Schulden-Liste', /Schulden-Liste/.test($('clear2').textContent) && !mem['lotse.schulden'] && !!vorher, mem['lotse.schulden']);
    check('[schuldenliste] keine Skriptfehler', errors.length === 0, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme', e && e.stack); }
  zweiteSeite();
}, 300);

// Zwei Vorgänge (ohne PIN); im echten FristenOrdner (src/fristen.js) wird endeWochen durch einen Platzhalter ersetzt, endeTage entfernt
function zweiteSeite() {
  const jetzt = Date.now(), mem2 = { 'lotse.ack': '1', 'lotse-lang': 'de',
    'lotse.vorgaenge': JSON.stringify({ v: 1, tage: 0, klar: { aktiv: 'va', liste: [{ id: 'va', name: 'Anna', geaendert: jetzt, daten: {} }, { id: 'vb', name: 'Bert', geaendert: jetzt, daten: {} }] } }) };
  const err2 = [];
  const dom2 = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
    beforeParse(x) {
      x.__SOLO_TEST__ = true; x.HTMLElement.prototype.scrollIntoView = function () {}; x.scrollTo = function () {}; x.print = function () {};
      Object.defineProperty(x, 'localStorage', { value: { getItem: (k) => (k in mem2 ? mem2[k] : null), setItem: (k, v) => { mem2[k] = String(v); }, removeItem: (k) => { delete mem2[k]; } }, configurable: true });
      Object.defineProperty(x.navigator, 'languages', { value: ['de-DE'], configurable: true });
      x.addEventListener('error', (e) => err2.push(e.message));
    }
  });
  const w2 = dom2.window, d2 = w2.document, $2 = (id) => d2.getElementById(id);
  w2.FristenOrdner.endeTage = undefined; w2.FristenOrdner.endeWochen = (b, n) => (n === 2 && b === '2026-12-11' ? '2031-01-02' : 'kaputt');
  const setze2 = (id, v) => { const e = $2(id); e.value = v; e.dispatchEvent(new w2.Event('input', { bubbles: true })); e.dispatchEvent(new w2.Event('change', { bubbles: true })); };
  const klick2 = (el) => el.dispatchEvent(new w2.MouseEvent('click', { bubbles: true }));
  setTimeout(() => {
    try {
      const S = w2.Schulden;
      check('[schuldenliste/vorgang] FristenOrdner.endeWochen rechnet das Fristende', S.fristEnde('2026-12-11', 14) === '2031-01-02', S.fristEnde('2026-12-11', 14));
      check('[schuldenliste/vorgang] ungültiges Ergebnis: Rückfall auf die eigene Rechnung', S.fristEnde('2026-12-01', 14) === '2026-12-15', S.fristEnde('2026-12-01', 14));
      w2.location.hash = '#schulden'; w2.dispatchEvent(new w2.HashChangeEvent('hashchange'));
      klick2($2('sl-neu')); setze2('sl-f-g', 'Vermieter Anna'); setze2('sl-f-st', 'mahnbescheid'); setze2('sl-f-zu', '2026-12-11'); setze2('sl-f-n', 'Anna-Notiz'); klick2($2('sl-speichern'));
      check('[schuldenliste/vorgang] Eintrag ohne Betrag in Vorgang Anna', /Vermieter Anna/.test($2('slInhalt').textContent));
      const ohne = I.de['sl.sum.ohneBetrag'].replace('{n}', '1');
      check('[schuldenliste/vorgang] PDF nennt „Einträge ohne Betrag“', JSON.stringify(S.pdfSeiten()).includes(ohne), JSON.stringify(S.pdfSeiten()));
      klick2(d2.querySelector('#appnav button[data-ansicht="ordner"]'));
      const oz2 = $2('or-schulden');
      check('[schuldenliste/vorgang] mit FristenOrdner: keine eigene Frist in der Ordner-Zeile', oz2 && /1 offen/.test(oz2.textContent) && !/Frist/.test(oz2.textContent), oz2 && oz2.textContent);
      klick2(oz2);
      klick2($2('sl-druck')); setze2('slKuerzel', 'AN'); klick2($2('slMitNotiz'));
      check('[schuldenliste/vorgang] Blatt mit Kürzel und Notiz', /Kürzel: AN/.test($2('slSeite').textContent) && /Anna-Notiz/.test($2('slSeite').textContent));
      // Vorgang wechseln in „Mein Ordner“ (ein Tipp auf die Zeile)
      klick2(d2.querySelector('#setHaushalte button.vg-zeile[data-vg-name="Bert"]'));
      setTimeout(() => {
        try {
          check('[schuldenliste/vorgang] Wechsel: Blatt geschlossen und geleert', $2('slBlatt').hidden && $2('slSeite').textContent === '' && $2('slBlattBar').textContent === '');
          check('[schuldenliste/vorgang] Wechsel: Daten des anderen Vorgangs nicht sichtbar', !/Vermieter Anna|Anna-Notiz/.test(d2.body.textContent) && S.daten().liste.length === 0, S.daten());
          klick2($2('appnav').querySelector('button[data-ansicht="ordner"]'));
          check('[schuldenliste/vorgang] Wechsel: keine Schulden-Zeile in Mein Ordner', !$2('or-schulden'));
          w2.location.hash = '#schulden'; w2.dispatchEvent(new w2.HashChangeEvent('hashchange'));
          klick2($2('sl-neu')); setze2('sl-f-g', 'Bank Bert'); setze2('sl-f-stand', '10'); klick2($2('sl-speichern'));
          klick2($2('sl-druck'));
          check('[schuldenliste/vorgang] Wechsel: Kürzel und Notiz-Haken zurückgesetzt', $2('slKuerzel').value === '' && !$2('slMitNotiz').checked && $2('slMitAz').checked && !/Kürzel:/.test($2('slSeite').textContent));
          check('[schuldenliste/vorgang] Blatt ohne Einträge des anderen Vorgangs', /Bank Bert/.test($2('slSeite').textContent) && !/Vermieter Anna/.test($2('slSeite').textContent));
          klick2($2('slBlattZu'));
          klick2(d2.querySelector('#setHaushalte button.vg-zeile[data-vg-name="Anna"]'));
          setTimeout(() => {
            try {
              check('[schuldenliste/vorgang] zurück zu Anna: eigene Liste wieder da, Bert nicht', S.daten().liste.length === 1 && S.daten().liste[0].g === 'Vermieter Anna', S.daten());
              check('[schuldenliste/vorgang] keine Skriptfehler', err2.length === 0, err2);
            } catch (e) { fehler++; console.log('FAIL Ausnahme', e && e.stack); }
            ende();
          }, 200);
        } catch (e) { fehler++; console.log('FAIL Ausnahme', e && e.stack); ende(); }
      }, 200);
    } catch (e) { fehler++; console.log('FAIL Ausnahme', e && e.stack); ende(); }
  }, 300);
}
function ende() {
  if (fehler) { console.log('\n' + fehler + ' von ' + n + ' FEHLGESCHLAGEN'); process.exit(1); }
  console.log('Schulden-Liste-DOM-Test bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}
