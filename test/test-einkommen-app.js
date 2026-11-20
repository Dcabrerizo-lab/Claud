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
// Unterhalt für sich selbst (Art unt): Auswahl für Person, Partner und zweites Einkommen; Betrag = Zahlbetrag ohne Netto-Schätzung
const opt = (id) => Array.from(w.document.getElementById(id).options).map((o) => o.value);
ck('Unterhalt für dich: in allen drei Auswahllisten', ['ek1Art', 'ek2Art', 'ek1bArt'].every((id) => opt(id).includes('unt')), ['ek1Art', 'ek2Art', 'ek1bArt'].map(opt));
s = st({ ek1Art: 'unt', ek1Brutto: '', ek1Netto: 450 });
ck('Unterhalt für dich 450 €: Brutto = Netto = 450 €, Art unt', s.brutto === 450 && s.netto === 450 && s.art1 === 'unt', [s.brutto, s.netto, s.art1]);
ck('Unterhalt für dich: kein Brutto-Feld, eigene Beschriftung', w.document.getElementById('ek1BruttoF').hidden && /Unterhalt im Monat|Maintenance per month/.test(w.document.getElementById('ek1NettoLab').textContent), w.document.getElementById('ek1NettoLab').textContent);
s = st({ adults: 2, ek1Art: 'lohn', ek1Brutto: 2000, ek1Netto: 1450, ek2Art: 'unt', ek2Netto: 600 });
ck('Paar: Partner mit Unterhalt 600 € -> Netto 1.450 + 600 €, brutto2 600 €', s.netto === 2050 && s.brutto2 === 600 && s.art2 === 'unt', [s.netto, s.brutto2, s.art2]);
s = st({ ek1Art: 'lohn', ek1Brutto: 1200, ek1Netto: 950, ek1bArt: 'unt', ek1bBetrag: 300 });
ck('Allein: Lohn + Unterhalt als zweites Einkommen in der Liste', s.einkommen && s.einkommen[1].art === 'unt' && s.einkommen[1].b === 300, s.einkommen);
ck('Keine Skriptfehler', errors.length === 0, errors);
console.log(fails ? '\n' + fails + ' Fehler' : '\nEinkommen-je-Person-Test bestanden');
process.exit(fails ? 1 : 0);
