// Sicherheit: Eingaben dürfen nie als HTML oder Skript ausgeführt werden (Cross-Site-Scripting).
// Schadcode steht in allen Freitext-Feldern (Name, Anschrift, Telefon), in den gespeicherten Angaben (auch manipuliert)
// und in der einfachen Version. Danach darf es kein eingeschleustes Element und keinen Skriptaufruf geben.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/../dist/leistungs-lotse.html', 'utf8');

let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const BOESE = '"><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>';
const p = { name: BOESE, geb: BOESE, strasse: BOESE, ort: '80331 ' + BOESE, tel: BOESE };
const s = { adults: 1, kids: 2, ek1Art: 'lohn', ek1Brutto: '1500', ek1Netto: '1150', miete: BOESE, plz: BOESE, bundesland: BOESE, mietstufe: BOESE, vermoegen: BOESE, gebJahr: BOESE, bhPerson: BOESE, gdb: BOESE, aufenthalt: BOESE, baby: BOESE, egVor: BOESE, bezug: { [BOESE]: true } };
const store = { 'lotse.state': JSON.stringify({ s, p, e: true }), 'lotse.ack': '1', 'lotse.einfach': JSON.stringify({ es: { schritt: 3, antworten: { name: BOESE }, plz: BOESE, mz: { [BOESE]: true } }, an: false }) };
const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
    w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
  }
});
const w = dom.window, d = w.document;
const pruefe = (wo) => {
  ck(wo + ': kein Skript ausgeführt', !w.__xss);
  ck(wo + ': kein eingeschleustes Bild', !d.querySelector('img[src="x"]'));
  ck(wo + ': kein eingeschleustes Skript', ![...d.querySelectorAll('script')].some((x) => /__xss/.test(x.textContent)));
  ck(wo + ': kein onerror-Attribut', !d.querySelector('[onerror]'));
};
setTimeout(() => {
  pruefe('Start mit manipulierten gespeicherten Angaben');
  ck('Start: keine Skriptfehler trotz manipulierter Angaben', errors.length === 0, errors.join('; '));
  // Mappe: alle Karten auswählen, Mappe öffnen (Briefe mit Name und Anschrift)
  d.querySelectorAll('[data-pick]').forEach((c) => { c.checked = true; c.dispatchEvent(new w.Event('change', { bubbles: true })); });
  ['p-name', 'p-strasse', 'p-ort', 'p-tel', 'p-geb'].forEach((id) => { const el = d.getElementById(id); if (el) { el.value = BOESE; el.dispatchEvent(new w.Event('input', { bubbles: true })); } });
  const mk = d.getElementById('mappeMake'); if (mk) mk.click();
  setTimeout(() => {
    ck('Mappe geöffnet', d.getElementById('mappe').hidden === false);
    ck('Mappe: Name steht als Text im Brief', d.getElementById('mappeBody').textContent.includes('<img src=x'));
    pruefe('Antragsmappe mit Schadcode in Name und Anschrift');
    // Einfache Version mit manipulierten Angaben: zweite Seite, die direkt in der einfachen Version startet
    const store2 = Object.assign({}, store, { 'lotse.einfach': JSON.stringify({ es: { schritt: 2, plz: BOESE, wohnform: BOESE, mz: { [BOESE]: true }, [BOESE]: BOESE }, an: true }) });
    const err2 = [];
    const dom2 = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
      runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(w2) {
        w2.addEventListener('error', (e) => err2.push(String(e.error || e.message)));
        w2.HTMLElement.prototype.scrollIntoView = function () {}; w2.scrollTo = function () {};
        Object.defineProperty(w2, 'localStorage', { value: { getItem: (k) => (k in store2 ? store2[k] : null), setItem: () => {}, removeItem: () => {} }, configurable: true });
      }
    });
    setTimeout(() => {
      const d2 = dom2.window.document;
      ck('Einfache Version ist offen', !!d2.getElementById('einfach') && !d2.getElementById('einfach').hidden && d2.getElementById('einfach').innerHTML.length > 100);
      ck('Einfache Version: kein Skript ausgeführt, kein eingeschleustes Element', !dom2.window.__xss && !d2.querySelector('img[src="x"]') && !d2.querySelector('[onerror]'));
      ck('Einfache Version: keine Skriptfehler', err2.length === 0, err2.join('; '));
      ck('Keine Skriptfehler im ganzen Test', errors.length === 0, errors.join('; '));
      console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : 'Sicherheitstest bestanden: ' + n + ' Prüfungen (Schadcode in allen Eingaben und gespeicherten Angaben wird nie ausgeführt)');
      process.exit(fails ? 1 : 0);
    }, 300);
  }, 300);
}, 300);
