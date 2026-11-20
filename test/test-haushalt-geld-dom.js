// Haushaltsbuch in der echten Oberfläche (dist, JSDOM): Beleg-Häkchen je Buchung, höchstens ein Geld-Hinweis (wegklickbar,
// Details zum Aufklappen), Belegliste in der Auswertung mit Jahr-Umschalter und CSV.
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
    w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {}; w.URL.createObjectURL = function () { w.__blob = (w.__blob || 0) + 1; return 'blob:x'; }; w.URL.revokeObjectURL = function () {};
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { if (voll && k === 'lotse.haushalt') throw new Error('QuotaExceeded'); mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
const setze = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
const klick = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const tx = (e) => e.textContent.replace(/[\u00a0\u202f]/g, ' ');
// Haushaltsplan öffnen wie in der App: Start → Geld sparen → Thema „Haushaltsplan“
const zumPlan = () => { klick($('goSparen')); klick([...d.querySelectorAll('#spInhalt button.weg')].find((b) => /Haushaltsplan|Budget|bütçe|Qorshaha|بودجه|الميزانية/i.test(b.textContent)) || [...d.querySelectorAll('#spInhalt button.weg')].pop()); };
const knopf = (text, wurzel) => [...(wurzel || d).querySelectorAll('button')].find((b) => b.textContent.trim() === text);
const haken = (id) => { const e = $(id); e.checked = !e.checked; e.dispatchEvent(new w.Event('change', { bubbles: true })); };
const GELD = ['mb', 'verm', 'pflege', 'steuer'];
const geldHinweise = () => GELD.filter((a) => d.getElementById('hb-hw-' + a));
setTimeout(() => {
  try {
    w.__solo.lang('de');
    w.__solo.set({ adults: 1, kids: 0, ek1Art: 'lohn', ek1Brutto: 1600, ek1Netto: 1250, miete: 600, heizkosten: 80, plz: '90542', bezug: { grundsicherungsgeld: true } });
    zumPlan(); klick($('hb-tab-buch'));
    // Neue Ausgabe mit Pflege-Notiz: Tipp, kein automatisches Häkchen
    klick($('hb-neu')); setze('hb-betrag', '50'); klick($('hb-wahl-sonst')); setze('hb-notiz', 'Pflegedienst Mai');
    check('[hb-belege] Häkchen „Beleg aufheben“ da, Unterpunkte erst nach dem Häkchen', !!$('hb-beleg') && !$('hb-beleg').checked && d.querySelector('.hb-beleg-art').hidden);
    check('[hb-belege] passende Notiz: Tipp sichtbar, nicht angehakt', !$('hb-beleg-tipp').hidden && !$('hb-beleg-pf').checked);
    haken('hb-beleg');
    check('[hb-belege] Häkchen: „für die Pflegekasse“ vorgeschlagen, Unterpunkte sichtbar', $('hb-beleg-pf').checked && !$('hb-beleg-st').checked && !d.querySelector('.hb-beleg-art').hidden && $('hb-beleg-tipp').hidden);
    klick($('hb-speichern'));
    const gespeichert = JSON.parse(mem['lotse.haushalt']).buch;
    check('[hb-belege] gespeichert mit bp, ohne bs', gespeichert.length === 1 && gespeichert[0].bp === true && gespeichert[0].bs === undefined, gespeichert);
    check('[hb-belege] Liste zeigt „· Beleg“', / · Beleg/.test(d.querySelector('.hb-eintrag').textContent));
    klick(knopf('Bearbeiten', d.querySelector('.hb-eintrag')));
    check('[hb-belege] Bearbeiten übernimmt den Zustand', $('hb-beleg').checked && $('hb-beleg-pf').checked && !$('hb-beleg-st').checked);
    klick(knopf('Abbrechen'));
    // Steuer + bar: Warnung
    klick($('hb-neu')); setze('hb-betrag', '120'); klick($('hb-wahl-sonst')); setze('hb-notiz', 'Handwerker bar');
    haken('hb-beleg');
    check('[hb-belege] Steuer vorgeschlagen; „bar“ zeigt Warnung', $('hb-beleg-st').checked && !$('hb-beleg-bar').hidden && /Bar bezahlte/.test($('hb-beleg-bar').textContent));
    haken('hb-beleg-st');
    check('[hb-belege] alle Unterpunkte aus: Häkchen aus, Unterpunkte versteckt', !$('hb-beleg').checked && d.querySelector('.hb-beleg-art').hidden);
    klick($('hb-speichern'));
    check('[hb-belege] ohne Häkchen: keine Beleg-Felder', JSON.parse(mem['lotse.haushalt']).buch.filter((e) => e.n === 'Handwerker bar').every((e) => !e.bs && !e.bp));
    // Auswertung: höchstens ein Geld-Hinweis, Details, wegklicken
    klick($('hb-tab-ausw'));
    check('[hb-geld] genau ein Geld-Hinweis (Pflege vor Steuer)', geldHinweise().join() === 'pflege', geldHinweise());
    const hw = $('hb-hw-pflege');
    check('[hb-geld] Details zum Aufklappen, Text mit Summe', !!hw.querySelector('details.hb-hw-det') && /50 €/.test(tx(hw)) && /Entlastungsbetrag/.test(hw.querySelector('details').textContent));
    // Belegliste
    const bl = () => $('hbBelege');
    const jahr = String(new Date().getFullYear());
    check('[hb-belege] Belegliste in der Auswertung', !!bl() && tx(bl().querySelector('summary')) === 'Belege ' + jahr && /Für die Pflegekasse: 1 Belege, zusammen 50 €/.test(tx(bl())), bl() && tx(bl()));
    check('[hb-belege] Hinweis „Datei nicht geschützt“', /nicht geschützt/.test(bl().textContent));
    klick($('hb-bl-csv'));
    check('[hb-belege] CSV-Export (Datei Belege-<Jahr>.csv)', w.__blob === 1 && /Belege-\d{4}\.csv/.test($('hbBlMsg').textContent), $('hbBlMsg').textContent);
    klick($('hb-bl-vor'));
    check('[hb-belege] Jahr-Umschalter: Vorjahr ohne Belege', /Belege \d{4}/.test(tx(bl().querySelector('summary'))) && tx(bl().querySelector('summary')) !== 'Belege ' + jahr && /Noch keine Belege/.test(bl().textContent) && d.activeElement === $('hb-bl-vor'));
    klick($('hb-bl-nach'));
    // Knopf „Belegliste“ im Hinweis öffnet die Liste
    klick($('hb-tab-plan'));
    const bk = knopf('Belegliste', $('hb-hw-pflege') || d);
    check('[hb-geld] Hinweis auch im Plan, Knopf „Belegliste“', !!bk);
    if (bk) { klick(bk); check('[hb-geld] „Belegliste“ öffnet Auswertung mit offener Liste', $('hb-tab-ausw').getAttribute('aria-pressed') === 'true' && bl().open && d.activeElement === $('hb-bl-sum')); }
    klick($('hb-tab-ausw'));
    klick(knopf('Nicht mehr zeigen', $('hb-hw-pflege')));
    check('[hb-geld] weggeklickt: nächster Geld-Hinweis (Steuer) erscheint nur, wenn nicht als Beleg markiert', geldHinweise().join() === 'steuer' && JSON.parse(mem['lotse.haushalt']).weg[Object.keys(JSON.parse(mem['lotse.haushalt']).weg)[0]] === true, geldHinweise());
    check('[hb-geld] nie zwei Geld-Hinweise gleichzeitig', geldHinweise().length <= 1);
    // Sprachen: keine Rohschlüssel
    ['en', 'ar', 'fa', 'so', 'uk'].forEach((l) => { w.__solo.lang(l); zumPlan(); klick($('hb-tab-ausw')); check(l + ': keine Rohschlüssel (Belege, Hinweis)', !/hb\.[a-z]/.test($('v-haushalt').textContent)); });
    w.__solo.lang('de');
    check('Keine Skriptfehler', errors.length === 0, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme', e && e.stack); }
  if (fehler) { console.log(fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
  console.log('Haushalt-Geld-Oberfläche bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}, 300);
