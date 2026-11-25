// Frage „Bekommst du Basiselterngeld oder ElterngeldPlus?“ im Formular „Alles auf einer Seite“ (Auftrag David 25.11.2026):
// nur sichtbar, wenn die Person Elterngeld als Einkommen hat (Hauptfeld oder zweites Einkommen), je Person ein Feld; Antwort im Zustand,
// ausgeblendete Antwort wird zurückgesetzt; Wirkung auf die Rechnung (Freibetrag § 10 BEEG); 13 Sprachen und Einfache Sprache.
// Aufruf: node test/test-elterngeld-art-dom.js (nach npm run build:web)
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const I18N = require('../dist/i18n.js');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const mem = { 'lotse.checkWeg': 'alles' };
const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#leistungen',
  beforeParse(w) {
    w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
const sel = (id, v) => { $(id).value = v; fire($(id), 'change'); };
const zahl = (id, v) => { $(id).value = String(v); fire($(id), 'input'); fire($(id), 'change'); };
const sichtbar = (id) => { let e = $(id); while (e && e !== d.body) { if (e.hidden) return false; e = e.parentElement; } return !!e; };
const tx = (e) => (e ? e.textContent.replace(/[\u00a0\u202f]/g, ' ').trim() : '');
const LANGS = ['de', 'en', 'ar', 'fa', 'fa-AF', 'fr', 'pl', 'ps', 'ro', 'ru', 'so', 'tr', 'uk'];
setTimeout(() => {
  try {
    w.__solo.lang('de');
    w.__solo.set({ adults: 1, kids: 1, kidsU6: 1, miete: 700, mietstufe: '3', baby: 'da', egVor: 1500, bundesland: 'BY', vermoegen: 0, gebJahr: 1990 });
    check('[eg-art] ohne Elterngeld: Feld ausgeblendet', !sichtbar('egArt1') && !sichtbar('egArt2'));
    sel('ek1Art', 'eg'); zahl('ek1Netto', 468);
    check('[eg-art] Elterngeld als Einkommen: Feld sichtbar, Beschriftung mit Frage', sichtbar('egArt1') && tx(d.querySelector('label[for="egArt1"]')) === 'Bekommst du Basiselterngeld oder ElterngeldPlus?');
    check('[eg-art] Auswahl: Weiß ich nicht (Standard), Basiselterngeld, ElterngeldPlus', [...$('egArt1').options].map((o) => o.value + ':' + o.textContent).join('|') === ':Weiß ich nicht|basis:Basiselterngeld|plus:ElterngeldPlus' && $('egArt1').value === '');
    check('[eg-art] Aufklapper „Warum fragt die App das?“ mit Freibeträgen', /300\D{1,3}€/.test(tx($('egArt1').parentElement.querySelector('details.mehr p'))) && /150\D{1,3}€/.test(tx($('egArt1').parentElement.querySelector('details.mehr p'))));
    const gg = () => (w.__solo.eval().results.find((r) => r.id === 'ggeld').tx.find((t) => t[0] === 'schaetz.eins') || [])[1];
    const vorher = gg();
    sel('egArt1', 'basis');
    check('[eg-art] Basiselterngeld im Zustand, Rechnung mit 300 € Freibetrag (1.450 € statt 1.300 €)', w.__solo.state().egArt1 === 'basis' && vorher && vorher.a.eur === 1300 && gg() && gg().a.eur === 1450, [vorher, gg()]);
    sel('egArt1', 'plus');
    check('[eg-art] ElterngeldPlus: 150 € Freibetrag', w.__solo.state().egArt1 === 'plus' && gg().a.eur === 1300);
    sel('ek1Art', 'lohn');
    check('[eg-art] anderes Einkommen: Feld weg, Antwort zurückgesetzt', !sichtbar('egArt1') && w.__solo.state().egArt1 === '');
    // Paar: Elterngeld nur als zweites Einkommen der zweiten Person
    w.__solo.set({ adults: 2, kids: 1, kidsU6: 1, miete: 700, mietstufe: '3', baby: 'da', egVor: 1500, ek1Art: 'lohn', ek1Netto: 1500, ek2Art: 'lohn', ek2Netto: 900, ek2bArt: 'eg', ek2bBetrag: 600, egArt2: 'plus' });
    check('[eg-art] Paar: Feld nur für die zweite Person, eigene Beschriftung, Wert übernommen', !sichtbar('egArt1') && sichtbar('egArt2') && tx(d.querySelector('label[for="egArt2"]')) === 'Bekommt dein Partner oder deine Partnerin Basiselterngeld oder ElterngeldPlus?' && $('egArt2').value === 'plus');
    w.__solo.set({ adults: 1, ek1Art: 'lohn', ek1Netto: 1500, egArt2: 'plus' });
    check('[eg-art] allein: Antwort der zweiten Person zählt nicht und wird gelöscht', !sichtbar('egArt2') && w.__solo.state().egArt2 === '');
    // Texte: 13 Sprachen, Einfache Sprache
    const K = ['egArt.label', 'egArt.label2', 'egArt.0', 'egArt.basis', 'egArt.plus', 'egArt.hint', 'sf.q.egArt', 'sf.q.egArt2', 'sf.h.egArt', 'ra.wer.q', 'ra.wer.ich', 'ra.wer.partner', 'ra.wer.beide', 'ra.wer.hint', 'ra.so.3partner', 'ra.so.3beide'];
    const fehlt = [];
    LANGS.forEach((l) => K.forEach((k) => { if (!I18N[l] || typeof I18N[l][k] !== 'string' || !I18N[l][k].trim()) fehlt.push(l + ':' + k); }));
    check('[eg-art] neue Texte in allen 13 Sprachen', !fehlt.length, fehlt.slice(0, 10));
    const ph = (s) => (s.match(/\{[^}]+\}/g) || []).sort().join();
    check('[eg-art] Platzhalter wie im Deutschen', LANGS.every((l) => K.every((k) => ph(I18N[l][k]) === ph(I18N.de[k]))), LANGS.flatMap((l) => K.filter((k) => ph(I18N[l][k]) !== ph(I18N.de[k])).map((k) => l + ':' + k)));
    check('[eg-art] Amtsbegriffe Basiselterngeld/ElterngeldPlus bleiben deutsch', LANGS.every((l) => /Basiselterngeld/.test(I18N[l]['egArt.label']) && /ElterngeldPlus/.test(I18N[l]['egArt.label'])));
    w.__solo.lang('en'); w.__solo.set({ adults: 1, ek1Art: 'eg', ek1Netto: 468 });
    check('[eg-art] Englisch', tx(d.querySelector('label[for="egArt1"]')) === 'Do you get Basiselterngeld or ElterngeldPlus?' && $('egArt1').options[0].textContent === "I don't know");
    w.__solo.lang('de');
    if ($('einfacheSpracheBtn')) {
      $('einfacheSpracheBtn').click();
      check('[eg-art] Einfache Sprache: eigener Erklärtext', /Das steht im Bescheid für das Elterngeld\./.test(tx($('egArt1').parentElement.querySelector('details.mehr p'))));
      $('einfacheSpracheBtn').click();
    }
    check('[eg-art] keine Fehler im Fenster', errors.length === 0, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme: ' + e.stack); }
  if (fehler) { console.log(fehler + ' von ' + n + ' FEHLGESCHLAGEN'); process.exit(1); }
  console.log('Elterngeld-Art DOM-Test bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}, 400);
