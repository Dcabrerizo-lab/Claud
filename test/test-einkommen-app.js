// Einkommen je Person in der App (src/app.js): fehlendes Netto wird je Person und Einkommensart geschätzt.
// Sollwerte aus Rules.nettoRente / Rules.nettoLohn (selbst in test/test-netto.js gegen Rechnung zu Fuß geprüft).
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const R = require('../src/rules.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let fails = 0;
const ck = (name, c, x) => { if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : JSON.stringify(x)); } else console.log('ok  ', name); };
const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    const mem = { 'lotse.ack': '1' };
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window;
const d = new Date(), heute = d.getFullYear() + d.getMonth() / 12;
const st = (s) => { w.__solo.set(Object.assign({ adults: 1, kids: 0, young: 0, miete: 600, mietstufe: '3', vermoegen: 0, bezug: {} }, s)); return w.__solo.state(); };
const lohn = (b, o) => R.nettoLohn(b, Object.assign(R.lohnAnnahmen(o.h, o.wer), { heute })).netto;

// Paar: eine Person mit Netto, die andere nur mit Brutto
let s = st({ adults: 2, ek1Art: 'lohn', ek1Brutto: 2400, ek1Netto: 1700, ek2Art: 'rente', ek2Brutto: 1200, ek2Netto: '' });
ck('[netto-person] Paar: Lohn mit Netto 1.700 € + Rente nur brutto 1.200 € -> Netto 1.700 + 1.051,80 €', Math.abs(s.netto - (1700 + R.nettoRente(1200, { heute }))) < 0.01, s.netto);
s = st({ adults: 2, ek1Art: 'rente', ek1Brutto: 1500, ek1Netto: '', ek2Art: 'alg', ek2Netto: 900 });
ck('[netto-person] Paar: Rente nur brutto 1.500 € + Arbeitslosengeld 900 € -> Rente netto wird geschätzt', Math.abs(s.netto - (900 + R.nettoRente(1500, { heute }))) < 0.01, s.netto);
s = st({ adults: 2, ek1Art: 'lohn', ek1Brutto: '', ek1Netto: 1500, ek2Art: 'lohn', ek2Brutto: 1800, ek2Netto: '' });
const soll2 = lohn(1800, { h: { adults: 2, kids: 0, young: 0, zweiVerdiener: true }, wer: 2 });
ck('[netto-person] Paar: Lohn netto 1.500 € + Lohn nur brutto 1.800 € -> zweites Netto nach Lohnsteuer und Beiträgen', Math.abs(s.netto - (1500 + soll2)) < 0.01, [s.netto, 1500 + soll2]);
s = st({ adults: 2, ek1Art: 'lohn', ek1Brutto: 2400, ek1Netto: '', ek2Art: 'rente', ek2Brutto: 900, ek2Netto: '' });
ck('[netto-person] Paar: beide nur brutto -> wie bisher Schätzung in den Regeln (Netto leer)', s.netto === '', s.netto);
s = st({ adults: 2, ek1Art: 'lohn', ek1Brutto: 2400, ek1Netto: '', ek2Art: 'ohne' });
ck('[netto-person] Paar: Partner ohne Einkommen -> wie bisher Schätzung in den Regeln', s.netto === 0 || s.netto === '', s.netto);

// Allein mit zweitem Einkommen (Liste): Rente ohne Netto nach Kranken- und Pflegeversicherung, nicht pauschal 80 %
s = st({ ek1Art: 'rente', ek1Brutto: 1200, ek1Netto: '', ek1bArt: 'wfbm', ek1bBetrag: 200 });
ck('[netto-person] Allein, Rente 1.200 € brutto + Werkstattlohn: Rente zählt 1.051,80 € (nicht 960 €)', s.einkommen && Math.abs(s.einkommen[0].n - R.nettoRente(1200, { heute })) < 0.01, s.einkommen);
s = st({ ek1Art: 'lohn', ek1Brutto: 1600, ek1Netto: '', ek1bArt: 'rente', ek1bBetrag: 300 });
const soll3 = lohn(1600, { h: { adults: 1, kids: 0, young: 0 }, wer: 1 });
ck('[netto-person] Allein, Lohn 1.600 € brutto + zweites Einkommen: Lohn nach Lohnsteuer und Beiträgen', s.einkommen && Math.abs(s.einkommen[0].n - soll3) < 0.01, [s.einkommen && s.einkommen[0].n, soll3]);
s = st({ ek1Art: 'selbst', ek1Brutto: 1000, ek1Netto: '', ek1bArt: 'rente', ek1bBetrag: 300 });
ck('[netto-person] Allein, selbstständig 1.000 € + zweites Einkommen: grob 80 %', s.einkommen && s.einkommen[0].n === 800, s.einkommen);
// Formular-Texte: Brutto-Beschriftung je Art, Minijob-Hinweis nur bei Lohn, Summen-Hinweis nur zu zweit
const doc = w.document, $ = (id) => doc.getElementById(id);
const L = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', (doc.documentElement.lang || 'de') + '.json'), 'utf8'));
st({ ek1Art: 'lohn', ek1Brutto: 1600 });
ck('[formular] Lohn: „Lohn im Monat vor Abzügen (brutto)“ + Minijob-Hinweis, kein Summen-Hinweis', $('ek1BruttoLab').textContent === L['ek.brutto.lohn'] && $('ek1ArtHint').textContent === L['ek.art.hint.lohn'], [$('ek1BruttoLab').textContent, $('ek1ArtHint').textContent]);
st({ ek1Art: 'rente', ek1Brutto: 900 });
ck('[formular] Rente: „Rente im Monat vor Abzügen (brutto)“, kein Minijob-Hinweis', $('ek1BruttoLab').textContent === L['ek.brutto.rente'] && $('ek1ArtHint').hidden, [$('ek1BruttoLab').textContent, $('ek1ArtHint').textContent]);
st({ adults: 2, ek1Art: 'rente', ek1Brutto: 900, ek2Art: 'ohne' });
ck('[formular] Paar: Summen-Hinweis bei Person 1, nicht bei „Kein Einkommen“', $('ek1ArtHint').textContent === L['ek.art.hint.summe'] && $('ek2ArtHint').hidden);
st({ adults: 2, ek1Art: 'lohn', ek1Brutto: 2000, ek2Art: 'rente', ek2Brutto: 800 });
ck('[formular] Partner: Summen-Hinweis und „Nicht hier eintragen“ (Kindergeld, Unterhalt der Kinder)', $('ek2ArtHint').textContent === L['ek.art.hint.summe'] + ' ' + L['ek.nicht'], $('ek2ArtHint').textContent);
st({ ek1Art: 'rente', ek1Brutto: 900 });
ck('[formular] Allein: zweites Einkommen mit Beispielen und „Nicht hier eintragen“', !doc.querySelector('.cond-ek1b').hidden && doc.querySelector('.cond-ek1b').textContent.includes(L['ek.weiteres.hint']) && doc.querySelector('.cond-ek1b').textContent.includes(L['ek.nicht']));
ck('[formular] Schalter heißt „Kurzer Check für Menschen mit Behinderung (eine Person)“', $('einfachBtn').textContent.includes(L['einfach.btn']) && !/🙂/.test($('einfachBtn').textContent));
// Geburtsjahr: „54“ ist ungültig -> Meldung sichtbar, kein Ergebnis; „1954“ -> rechnet
st({ ek1Art: 'rente', ek1Brutto: 900 });
const g = $('gebJahr'), ein = (v) => { g.value = v; g.dispatchEvent(new w.Event('input', { bubbles: true })); g.dispatchEvent(new w.Event('change', { bubbles: true })); w.__solo.set(w.__solo.state()); g.value = v; g.dispatchEvent(new w.Event('change', { bubbles: true })); };
for (const v of ['54', '1854', '2030', '19a4']) {
  ein(v);
  ck('[geb] „' + v + '“: Meldung „4 Ziffern, zum Beispiel 1962“ sichtbar, keine Ergebniskarten', !$('gebWarn').hidden && $('gebWarn').textContent === L['warn.geb'] && !$('cards').querySelector('.card:not(.startcard)') && $('cards').textContent === L['warn.geb'], [$('gebWarn').hidden, $('cards').textContent.slice(0, 80)]);
}
ein('1954');
ck('[geb] „1954“: keine Meldung, Ergebnis wird gerechnet', $('gebWarn').hidden && !!$('cards').querySelector('.card:not(.startcard)'));
ck('Keine Skriptfehler', errors.length === 0, errors);
console.log(fails ? '\n' + fails + ' Fehler' : '\nEinkommen-je-Person-Test bestanden');
process.exit(fails ? 1 : 0);
