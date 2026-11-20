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
// Haushaltsplan öffnen wie in der App: Start → Geld und Schulden → Kachel „Mein Geld planen“
const zumPlan = () => { klick($('goGeld')); klick(d.querySelector('#spInhalt .gs-planen')); };
const knopf = (text, wurzel) => [...(wurzel || d).querySelectorAll('button')].find((b) => b.textContent.trim() === text);
setTimeout(() => {
  try {
    w.__solo.lang('de');
    // Check -> Plan: vorausfüllen
    w.__solo.set({ adults: 1, kids: 2, ek1Art: 'rente', ek1Brutto: 1400, ek1Netto: 1210, miete: 700, heizkosten: 90, plz: '90542', bezug: {} });
    zumPlan();
    check('Ansicht Haushaltsplan offen (Kachel in „Geld und Schulden“, kein eigener Zusatzknopf)', !$('v-haushalt').hidden && !$('goHaushalt'));
    check('Check -> Plan: Netto übernommen', $('hb-ek1').value === '1210', $('hb-ek1').value);
    check('Check -> Plan: Art übernommen', $('hb-ek1Art').value === 'rente');
    check('Einkommensart „Unterhalt für sich selbst“ auch im Plan wählbar', !!$('hb-ek1Art').querySelector('option[value="unt"]'));
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
    setze('miete', '750'); zumPlan();
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
    zumPlan(); klick($('hb-tab-buch'));
    klick($('hb-neu')); ['1', '2', ',', '5'].forEach((z) => klick([...d.querySelectorAll('.hb-taste')].find((b) => b.textContent === z)));
    klick($('hb-speichern')); check('Ohne Kategorie nicht gespeichert', !!$('hb-betrag') && !$('hbEingabeMsg').hidden);
    klick($('hb-wahl-essen')); klick($('hb-speichern'));
    check('Eintrag gespeichert (12,50 €)', d.querySelectorAll('.hb-eintrag').length === 1 && /12,50 €/.test(tx(d.querySelector('.hb-eintrag'))));
    check('Gespeichert auf dem Gerät', JSON.parse(mem['lotse.haushalt']).buch[0].c === 1250);
    klick(knopf('Löschen', d.querySelector('.hb-eintrag')));
    check('Gelöscht', d.querySelectorAll('.hb-eintrag').length === 0);
    klick($('hb-rueck')); check('Rückgängig', d.querySelectorAll('.hb-eintrag').length === 1);
    klick($('hb-buchLoeschen')); check('Ganzes Haushaltsbuch löschen', d.querySelectorAll('.hb-eintrag').length === 0 && JSON.parse(mem['lotse.haushalt']).buch.length === 0);
    klick($('hb-rueck')); check('Ganzes Haushaltsbuch: Rückgängig', d.querySelectorAll('.hb-eintrag').length === 1);
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
    // Nur ein Hinweis: Fristen (src/fristen.js) übernimmt den Folgeantrag (Hinweis #friStart beim Öffnen, höchstens einmal am Tag; test-fristen-dom.js)
    check('Kein eigener Haushalts-Hinweis mehr (#hbStart)', !$('hbStart'));
    const fs0 = w.FristenOrdner.stand();
    check('Folgeantrag steht in den Fristen von „Mein Ordner“', fs0 && /Kinderzuschlag/.test(fs0.text), fs0);
    // Speicherfehler abgefangen
    voll = true; setze('hb-sonstEin', '10');
    check('Speicherfehler wird angezeigt (Meldung der Vorgänge-Speicherung)', !$('vgFehler').hidden && /Speicher voll oder gesperrt/.test($('vgFehler').textContent), $('vgFehler').textContent);
    voll = false;
    // Geld und Schulden → „Was bleibt mir?“ → Pfändungsrechner → Zurück führt wieder zu „Geld und Schulden“ (Herkunft)
    klick($('goGeld')); klick(d.querySelector('#spInhalt .gs-bleibt'));
    check('Kachel „Was bleibt mir?“ öffnet den Pfändungsrechner', !$('v-pfaendung').hidden);
    { // Pfändung Lohn: „Das tust du jetzt“ beginnt mit den Unterhaltspflichten (§ 850c ZPO)
      const pb = () => [...d.querySelectorAll('#v-pfaendung button')];
      klick(pb().find((b) => /Lohn/.test(b.textContent))); klick(pb().find((b) => b.textContent.trim() === '0'));
      setze('pfNetto', '2400'); klick(pb().find((b) => /Weiter/.test(b.textContent)));
      const li = d.querySelector('#v-pfaendung .pf-jetzt li');
      check('[schulden-korr] Lohn: erster Schritt prüft, ob alle Unterhaltspflichten berücksichtigt sind', li && /alle Menschen berücksichtigt, denen du Unterhalt zahlst/.test(li.textContent), li && li.textContent);
    }
    klick(d.querySelector('#v-pfaendung [data-zurueck]')); klick(d.querySelector('#v-pfaendung [data-zurueck]')); klick(d.querySelector('#v-pfaendung [data-zurueck]')); klick(d.querySelector('#v-pfaendung [data-zurueck]'));
    check('Zurück vom Pfändungsrechner (eine Ebene je Klick): wieder bei „Geld und Schulden“', !$('v-sparen').hidden);
    { // Einkommen geändert: Vorlage „Änderung melden“ nur bei Grundsicherungsgeld oder Sozialhilfe; Text nennt die Regeln je Leistung
      const melden = (bezug) => { w.__solo.set({ adults: 1, kids: 0, ek1Art: 'lohn', ek1Brutto: 2000, ek1Netto: 1500, miete: 500, plz: '90542', bezug }); w.Haushalt.laden({ ekBasis: 100000, ekV: 2 }); zumPlan(); return !!knopf('Änderung dem Amt melden', $('hbHinweise')); };
      check('[hb-korr] Vorlage „Änderung melden“ bei Grundsicherungsgeld', melden({ grundsicherungsgeld: true }));
      check('[hb-korr] keine Vorlage bei Wohngeld (eigene Regel)', !melden({ wohngeld: true }));
      check('[hb-korr] Meldepflicht-Text: § 60 SGB I, Wohngeld 15 %, Kinderzuschlag erst beim nächsten Antrag', /§ 60 Abs\. 1 SGB I.*mehr als 15 % .*§ 27 Abs\. 3 WoGG.*Kinderzuschlag.*nächsten Antrag/.test(w.I18N ? w.I18N.de['hb.hw.ek.d'] : require('../dist/i18n.js').de['hb.hw.ek.d']));
      check('[hb-korr] Nachzahlung: Antrag noch im Monat der Fälligkeit', /Antrag noch im Monat, in dem sie fällig ist/.test(require('../dist/i18n.js').de['hb.hw.nk.d']));
      // Älterer Stand ohne ekV: Basis ohne zweites Einkommen gespeichert -> einmal angleichen, kein grundloser Hinweis
      w.__solo.set({ adults: 1, kids: 0, ek1Art: 'lohn', ek1Brutto: 1300, ek1Netto: 1000, ek1bArt: 'unt', ek1bBetrag: 400, miete: 500, plz: '90542', bezug: { grundsicherungsgeld: true } });
      w.Haushalt.laden({ ekBasis: 100000 }); zumPlan();
      check('[paar-ek] Haushaltsplan: zweites Einkommen als eigene Zeile', $('hb-ek1b') && $('hb-ek1b').value === '400', $('hb-ek1b') && $('hb-ek1b').value);
      check('[paar-ek] Alter Stand ohne ekV: Basis einmal angeglichen (1.400 €), kein Hinweis „Einkommen geändert“', w.Haushalt.daten().ekBasis === 140000 && w.Haushalt.daten().ekV === 2 && !$('hb-hw-ek'), w.Haushalt.daten());
      w.Haushalt.laden({});
    }
    // Sprachen: kein Rohschlüssel
    ['en', 'ar', 'fa', 'so'].forEach((l) => { w.__solo.lang(l); zumPlan(); check(l + ': keine Rohschlüssel', !/hb\.[a-z]/.test($('v-haushalt').textContent)); });
    check('Keine Skriptfehler', errors.length === 0, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme', e && e.stack); }
  if (fehler) { console.log(fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
  console.log('Haushalt-Oberfläche bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}, 300);
