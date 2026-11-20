// Haushaltsplan in der echten Oberfläche (dist, JSDOM): eine Datenquelle mit dem Leistungs-Check (beide Richtungen),
// Rückfrage vor dem Ersetzen, Übernahme mit Markierung, Haushaltsbuch mit Rückgängig, höchstens 2 Hinweise, „Nicht mehr zeigen“, Speicherfehler.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const mem = {}; let voll = false; const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
  beforeParse(w) {
    w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { if (voll && k === 'lotse.haushalt') throw new Error('QuotaExceeded'); mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
const setze = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
const klick = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const tx = (e) => e.textContent.replace(/[\u00a0\u202f]/g, ' ');
const knopf = (text, wurzel) => [...(wurzel || d).querySelectorAll('button')].find((b) => b.textContent.trim() === text);
setTimeout(() => {
  try {
    w.__solo.lang('de');
    // Check -> Plan: vorausfüllen
    w.__solo.set({ adults: 1, kids: 2, ek1Art: 'rente', ek1Brutto: 1400, ek1Netto: 1210, miete: 700, heizkosten: 90, plz: '90542', bezug: {} });
    klick($('goHaushalt'));
    check('Ansicht Haushaltsplan offen', !$('v-haushalt').hidden);
    check('Check -> Plan: Netto übernommen', $('hb-ek1').value === '1210', $('hb-ek1').value);
    check('Check -> Plan: Art übernommen', $('hb-ek1Art').value === 'rente');
    check('Check -> Plan: Kindergeld aus Kinderzahl mit Hinweis', $('hb-kg').value === '518' && /2 Kinder/.test($('hb-kg-h').textContent), $('hb-kg').value);
    check('Hinweis „aus deinen Angaben übernommen, änderbar“', /übernommen, änderbar/.test($('hb-ek1-h').textContent));
    check('Ergebnissatz', /bleiben dir etwa 1\.028 €/.test(tx($('hbErgebnis'))), $('hbErgebnis').textContent);
    // Plan -> Check: vorhandener Wert nur nach Rückfrage
    setze('hb-ek1', '1300');
    check('Rückfrage vor dem Ersetzen', !!d.querySelector('.hb-frage') && w.__solo.state().ek1Netto === 1210);
    klick(knopf('Nein, behalten')); check('Nein: Check unverändert, Feld zurück', w.__solo.state().ek1Netto === 1210 && $('hb-ek1').value === '1210');
    setze('hb-ek1', '1300'); klick(knopf('Ja, ändern'));
    check('Ja: Check geändert (eine Datenquelle)', w.__solo.state().ek1Netto === 1300 && $('ek1Netto').value === '1300', w.__solo.state().ek1Netto);
    // Lohn gegen Rente: nur nach Rückfrage, Brutto wird geleert
    setze('hb-ek1Art', 'lohn');
    check('Art-Wechsel fragt', !!d.querySelector('.hb-frage') && w.__solo.state().ek1Art === 'rente');
    klick(knopf('Ja, ändern'));
    check('Art geändert, Brutto der alten Art geleert', w.__solo.state().ek1Art === 'lohn' && w.__solo.state().ek1Brutto === '');
    // Check -> Plan: Änderung im Check steht im Plan
    setze('miete', '750'); klick($('goHaushalt'));
    klick($('hb-kat-miete'));
    check('Änderung im Check steht im Plan', $('hb-aus-miete').value === '750', $('hb-aus-miete').value);
    // Plan -> Check: leeres Feld direkt (Unterhalt)
    setze('hb-uh', '200');
    check('Leeres Feld im Check direkt gefüllt', w.__solo.state().unterhalt === 200);
    // Übernahme-Liste und Markierung
    klick(knopf('Mit diesen Angaben Leistungen prüfen'));
    const ue = $('hbUe');
    check('Übernahme: übernommen / fehlt', /Lohn oder Gehalt: 1\.300 € netto/.test(tx(ue)) && /Brutto-Betrag/.test(ue.textContent), ue.textContent);
    check('Kindergeld-Bezug nur mit Haken', !!$('hb-frage-kgBezug'));
    $('hb-frage-kgBezug').checked = true; $('hb-frage-kgBezug').dispatchEvent(new w.Event('change'));
    klick(knopf('Weiter zum Leistungs-Check'));
    check('Sprung in den Check', !$('v-leistungen').hidden);
    check('Fehlendes Brutto markiert', $('ek1Brutto').closest('.field').classList.contains('hb-fehlt'));
    check('Kindergeld-Bezug nach Bestätigung gesetzt', w.__solo.state().bezug.kindergeld === true);
    setze('ek1Brutto', '1800'); check('Markierung verschwindet nach Eingabe', !$('ek1Brutto').closest('.field').classList.contains('hb-fehlt'));
    // Haushaltsbuch: eintragen, löschen, rückgängig
    klick($('goHaushalt')); klick($('hb-tab-buch'));
    klick($('hb-neu')); ['1', '2', ',', '5'].forEach((z) => klick([...d.querySelectorAll('.hb-taste')].find((b) => b.textContent === z)));
    klick($('hb-speichern')); check('Ohne Kategorie nicht gespeichert', !!$('hb-betrag') && !$('hbEingabeMsg').hidden);
    klick($('hb-wahl-essen')); klick($('hb-speichern'));
    check('Eintrag gespeichert (12,50 €)', d.querySelectorAll('.hb-eintrag').length === 1 && /12,50 €/.test(tx(d.querySelector('.hb-eintrag'))));
    check('Gespeichert auf dem Gerät', JSON.parse(mem['lotse.haushalt']).buch[0].c === 1250);
    klick(knopf('Löschen', d.querySelector('.hb-eintrag')));
    check('Gelöscht', d.querySelectorAll('.hb-eintrag').length === 0);
    klick($('hb-rueck')); check('Rückgängig', d.querySelectorAll('.hb-eintrag').length === 1);
    // Hinweise: höchstens 2 sichtbar, Rest aufklappbar, „Nicht mehr zeigen“ bleibt weg
    klick($('hb-neu')); setze('hb-betrag', '300'); klick($('hb-wahl-miete')); setze('hb-notiz', 'Nachzahlung Nebenkosten'); klick($('hb-speichern'));
    klick($('hb-neu')); setze('hb-betrag', '40'); klick($('hb-wahl-kinder')); setze('hb-notiz', 'Klassenfahrt'); klick($('hb-speichern'));
    klick($('hb-neu')); setze('hb-betrag', '80'); klick($('hb-wahl-raten')); klick($('hb-speichern'));
    klick($('hb-tab-ausw'));
    const sichtbar = () => d.querySelectorAll('#hbHinweise > .hb-hinweis').length, weitere = () => d.querySelector('#hbHinweise .hb-mehr');
    check('Höchstens 2 Hinweise sichtbar', sichtbar() === 2, sichtbar());
    check('Weitere Hinweise aufklappbar', !!weitere() && /Weitere Hinweise \(\d\)/.test(weitere().querySelector('summary').textContent));
    const erster = d.querySelector('#hbHinweise > .hb-hinweis').id;
    klick(knopf('Nicht mehr zeigen', d.querySelector('#hbHinweise > .hb-hinweis')));
    check('Nicht mehr zeigen: weg', !d.querySelector('#hbHinweise > #' + erster));
    klick($('hb-tab-plan')); klick($('hb-tab-ausw'));
    check('Nicht mehr zeigen: bleibt weg', !d.querySelector('#hbHinweise #' + erster) && Object.keys(JSON.parse(mem['lotse.haushalt']).weg).length === 1);
    // Weiterbewilligung: Hinweis beim Öffnen auf der Startseite
    klick($('hb-tab-plan'));
    const bald = new Date(); bald.setDate(bald.getDate() + 20);
    setze('hb-wb-kiz', bald.toISOString().slice(0, 10));
    check('Erinnerung an die Weiterbewilligung auf der Startseite', !!$('hbStart') && /Kinderzuschlag/.test($('hbStart').textContent));
    // Speicherfehler abgefangen
    voll = true; setze('hb-sonstEin', '10');
    check('Speicherfehler wird angezeigt', /nicht geklappt/.test($('hbSpeicherMsg').textContent));
    voll = false;
    // Sprachen: kein Rohschlüssel
    ['en', 'ar', 'fa', 'so'].forEach((l) => { w.__solo.lang(l); klick($('goHaushalt')); check(l + ': keine Rohschlüssel', !/hb\.[a-z]/.test($('v-haushalt').textContent)); });
    check('Keine Skriptfehler', errors.length === 0, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme', e && e.stack); }
  if (fehler) { console.log(fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
  console.log('Haushalt-Oberfläche bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}, 300);
