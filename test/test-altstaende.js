// Alte Speicherstände: Angaben, die eine frühere Version gespeichert hat, müssen nach einem Update richtig geladen werden
// und dasselbe Ergebnis liefern wie dieselben Angaben im heutigen Format. Je Ausbaustufe ein Beispiel (Felder wie damals in
// blankState()). Dazu die einfache Version mit einem älteren Speicherstand.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };

function seite(speicher) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      const mem = Object.assign({}, speicher);
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors };
}
const ergebnis = (w) => JSON.stringify(w.__solo.eval().results.map((r) => [r.id, r.level, r.tx]));
const leer = seite({});
const heute = (s) => { leer.w.__solo.set(s); return ergebnis(leer.w); };

const FAELLE = [
  { name: 'Version vom 5.11.2026 (Summenfelder, Haken „Behinderung“ und „Rentenalter“)', alt: { adults: 2, kids: 1, kidsU6: 1, kids14: 0, young: 0, brutto: 3000, brutto2: 1000, netto: 2300, nichtArbeit: false, nichtArbeit2: true, miete: 900, mietstufe: '4', plz: '', plzPick: '', bundesland: '', vermoegen: 5000, alterGruppe: '30-39', alter: false, ausbildung: '', pflegegrad: '', behinderung: true, erwerbsgemindert: false, bhPerson: '', gdb: '', blind: '', emStd: '', bezug: {} },
    neu: { adults: 2, kids: 1, kidsU6: 1, kids14: 0, young: 0, ek1Art: 'lohn', ek1Brutto: 2000, ek1Netto: 2300, ek2Art: 'rente', ek2Brutto: 1000, ek2Netto: '', miete: 900, mietstufe: '4', vermoegen: 5000, gdb: '100', bhPerson: 'erwNach25', bezug: {} },
    feld: ['ek1Brutto', '2000'] },
  { name: 'Version vom 7.11.2026 (Einkommen je Person, noch Altersgruppe statt Geburtsjahr)', alt: { adults: 1, kids: 2, kidsU6: 0, kids14: 1, young: 0, ek1Art: 'lohn', ek1Brutto: 1900, ek1Netto: 1450, ek2Art: '', ek2Brutto: '', ek2Netto: '', brutto: '', brutto2: '', netto: '', unterhalt: 150, miete: 780, mietstufe: '3', plz: '', plzPick: '', bundesland: '', vermoegen: 1200, alterGruppe: '40-49', ausbildung: 'kind', pflegegrad: '', bhPerson: '', gdb: '', blind: '', emStd: '', erwerbsgemindert: true, unterhaltFehlt: true, bezug: { kindergeld: true } },
    neu: { adults: 1, kids: 2, kidsU6: 0, kids14: 1, young: 0, ek1Art: 'lohn', ek1Brutto: 1900, ek1Netto: 1450, unterhalt: 150, miete: 780, mietstufe: '3', vermoegen: 1200, ausbildung: 'kind', emStd: 'unter3', unterhaltFehlt: true, bezug: { kindergeld: true } },
    feld: ['emStd', 'unter3'] },
  { name: 'Version vom 12.11.2026 (vor „Unterhalt, den du zahlst“)', alt: { adults: 1, kids: 0, kidsU6: 0, kids14: 0, young: 0, ek1Art: 'kg', ek1Brutto: '', ek1Netto: 1300, ek2Art: '', ek2Brutto: '', ek2Netto: '', unterhalt: '', kindEink: '', ek1bArt: '', ek1bBetrag: '', baby: '', egVor: '', aufenthalt: '', miete: 650, mietstufe: '2', plz: '', plzPick: '', bundesland: 'BY', vermoegen: 3000, gebJahr: 1971, arbeitSit: 'krank', algMonate: '', krankWochen: 'laeuft', lohnVorher: 2600, ausbildung: '', pflegegrad: '', bhPerson: '', gdb: '', blind: '', emStd: 'unklar', bezug: {} },
    neu: null, feld: ['ek1Netto', '1300'] },
  { name: 'heutiges Format', alt: { adults: 1, kids: 0, kidsU6: 0, kids14: 0, young: 0, ek1Art: 'rente', ek1Brutto: 1100, ek1Netto: 980, miete: 520, mietstufe: '3', vermoegen: 4000, gebJahr: 1955, uzBetrag: 200, uzAn: 'ex', uzTitel: true, pflegegrad: '2', bezug: {} },
    neu: null, feld: ['uzBetrag', '200'] }
];

FAELLE.forEach((f) => {
  const s = seite({ 'lotse.state': JSON.stringify({ s: f.alt, p: { name: 'Test' }, e: true }), 'lotse.ack': '1' });
  ck('[altstaende] ' + f.name + ': lädt ohne Skriptfehler', s.errors.length === 0, s.errors.join(' | '));
  ck('[altstaende] ' + f.name + ': Karten werden angezeigt', s.d.querySelectorAll('#cards article.card').length > 10);
  ck('[altstaende] ' + f.name + ': Feld „' + f.feld[0] + '“ übernommen', s.d.getElementById(f.feld[0]).value === f.feld[1], s.d.getElementById(f.feld[0]).value);
  ck('[altstaende] ' + f.name + ': dasselbe Ergebnis wie im heutigen Format', ergebnis(s.w) === heute(f.neu || f.alt), ergebnis(s.w).slice(0, 200) + ' <> ' + heute(f.neu || f.alt).slice(0, 200));
  ck('[altstaende] ' + f.name + ': Name in der Antragsmappe übernommen', s.d.getElementById('p-name').value === 'Test');
});

// Einfache Version: älterer Speicherstand (ohne die später ergänzten Fragen zu Werkstattjahren und PLZ) öffnet direkt die einfache Version
const esAlt = { schritt: 99, geb: '1985', wohnen: 'allein', mieteJa: '', miete: '450', arbeit: 'werkstatt', lohn: '280', essen: 'ja', em: '', renteJa: 'nein', rente: '', ausweis: 'ja', gdb: '100', mz: { G: true }, kind: 'ja', pflege: 'nein', schon: {}, erspart: 'wenig' };
const e = seite({ 'lotse.einfach': JSON.stringify({ es: esAlt, an: true }), 'lotse.ack': '1' });
ck('[altstaende] Einfache Version, älterer Speicherstand: lädt ohne Skriptfehler', e.errors.length === 0, e.errors.join(' | '));
const esText = [...e.d.querySelectorAll('.es-karte, .es-h, .es-lvl')].map((x) => x.textContent).join('\n');
ck('[altstaende] Einfache Version, älterer Speicherstand: zeigt Ergebnis ohne kaputte Anzeige', e.d.querySelectorAll('.es-karte').length > 0 && !/\bNaN\b|\bundefined\b|\{[a-z]\w*\}/.test(esText), e.d.querySelectorAll('.es-karte').length);

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '\nAltstand-Test bestanden: ' + n + ' Prüfungen (Speicherstände aus 4 Ausbaustufen und der einfachen Version)');
process.exit(fails ? 1 : 0);
