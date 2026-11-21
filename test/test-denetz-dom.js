// Sicherheitsnetz für Übersetzungen (src/denetz.js, Liste src/lang/denetz/wichtig.json): Bei einer Fremdsprache steht unter
// wichtigen Sätzen (Frist, Warnung, Rechtshinweis, Schritte in „Es ist dringend“) klein der deutsche Originalsatz.
// Deutsch und Einfache Sprache: keine Zeile. Schalter in Einstellungen → Anzeige, Standard an. Aufruf: node test/test-denetz-dom.js
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const I18N = require('../dist/i18n.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const errors = [];
const store = {};
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
    w.HTMLElement.prototype.scrollIntoView = function () {};
    w.scrollTo = function () {};
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x || ''); } else console.log('ok  ', n); };
const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
const setLang = (c) => { const s = $('lang'); s.value = c; fire(s, 'change'); };
const tick = () => new Promise((r) => setTimeout(r, 0));
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
const DN = ['dn.vorsilbe', 'dn.set.label', 'dn.set.t', 'dn.set.nurFremd'];

const box = () => $('spInhalt');
const kacheln = () => [...box().querySelectorAll('.uk-raster > button.uk-karte')];
function mahnbescheid() {
  d.querySelector('#appnav button[data-ansicht="start"]').click();
  $('goGeld').click();
  kacheln()[0].click(); // Es ist dringend
  kacheln()[3].click(); // Mahnbescheid
}
const zeilen = (root) => [...(root || d).querySelectorAll('.de-netz')];

(async () => {
  await tick();
  // Texte und zentrale Liste
  check('Texte (Vorsilbe, Schalter) in allen 13 Sprachen', LANGS.every((l) => DN.every((k) => typeof I18N[l][k] === 'string' && I18N[l][k].length > 1)), LANGS.map((l) => DN.filter((k) => !I18N[l][k]).map((k) => l + ':' + k)).flat().join());
  check('Vorsilbe ist übersetzt (ar „بالألمانية:“, uk „Німецькою:“)', I18N.ar['dn.vorsilbe'] === 'بالألمانية:' && I18N.uk['dn.vorsilbe'] === 'Німецькою:' && I18N.de['dn.vorsilbe'] === 'Deutsch:');
  const ein = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'einfach', 'denetz.json'), 'utf8'));
  check('Einfache Sprache: Schaltertexte vorhanden', DN.every((k) => typeof ein[k] === 'string' && ein[k]));
  const N = w.DeNetz;
  check('Zentrale Liste: Rechtshinweis, Frist und Schritt „Es ist dringend“ wichtig; Knopf/Beschriftung nicht', N && N.istWichtig('rb.satz') && N.istWichtig('gs.d.mahn.frist') && N.istWichtig('gs.d.mahn.schritt.kurz') && N.istWichtig('t.wohngeld.ausschluss') && !N.istWichtig('set.es.label') && !N.istWichtig('el.ks.frist.btn') && !N.istWichtig('gs.frist'));

  // Deutsch: keine Zeile
  $('p1').click(); await tick();
  mahnbescheid(); await tick();
  check('Deutsch: keine deutsche Zeile', zeilen().length === 0, zeilen().length);

  // Arabisch (RTL): Zeile unter Frist und Schritt
  setLang('ar'); await tick();
  mahnbescheid(); await tick();
  const fr = box().querySelector('.gs-frist');
  const zf = zeilen(fr);
  check('Fremdsprache: deutsche Zeile in der Frist (kurzer Satz)', zf.some((z) => z.getAttribute('data-de') === I18N.de['gs.d.mahn.frist.kurz']), zf.map((z) => z.textContent).join(' | '));
  check('Fremdsprache: deutsche Zeile auch beim ausführlichen Frist-Text', zf.some((z) => z.getAttribute('data-de') === I18N.de['gs.d.mahn.frist']));
  check('Frist: kein Satz doppelt', new Set(zf.map((z) => z.getAttribute('data-de'))).size === zf.length);
  check('Es ist dringend: Schritt mit deutscher Zeile', zeilen(box().querySelector('.gs-schritt')).some((z) => z.getAttribute('data-de') === I18N.de['gs.d.mahn.schritt.kurz']));
  const z0 = zf[0];
  check('RTL: Zeile lang="de" dir="ltr", Vorsilbe arabisch mit lang="ar" dir="rtl"', z0 && z0.getAttribute('lang') === 'de' && z0.getAttribute('dir') === 'ltr' && z0.querySelector('.de-netz-v').textContent === 'بالألمانية:' && z0.querySelector('.de-netz-v').getAttribute('lang') === 'ar' && z0.querySelector('.de-netz-v').getAttribute('dir') === 'rtl');
  check('Zeile ist ein kleines <small>, kein Kasten, nur Text', z0 && z0.tagName === 'SMALL' && z0.children.length === 2 && !z0.querySelector('button, a, svg'));
  check('Überschrift „Frist“ ohne deutsche Zeile', !fr.querySelector('h3 + .de-netz'));
  check('Rechtshinweis „keine Rechtsberatung“ mit deutscher Zeile', $('resRb').nextElementSibling && $('resRb').nextElementSibling.classList.contains('de-netz') && $('resRb').nextElementSibling.getAttribute('data-de') === I18N.de['rb.satz']);
  check('Keine Zeile in Bedienelementen (Knöpfe, Beschriftungen)', !d.querySelector('button .de-netz, label .de-netz, select .de-netz'));
  check('Keine Zeile im Blatt „Für Klient zusammenstellen“ (dort steht Deutsch schon daneben)', !d.querySelector('#klientBlatt .de-netz, #mappe .de-netz, #ergBlatt .de-netz'));

  // Englisch: Sprache wechseln ersetzt Vorsilbe
  setLang('en'); await tick();
  mahnbescheid(); await tick();
  check('Sprachwechsel: Vorsilbe in der neuen Sprache („German:“)', zeilen(box()).length > 0 && zeilen(box()).every((z) => z.querySelector('.de-netz-v').textContent === 'German:'));

  // Schalter aus → keine Zeile; an → wieder da
  const btn = $('deNetzBtn');
  check('Schalter vorhanden, Standard an', btn && btn.getAttribute('aria-checked') === 'true' && btn.getAttribute('role') === 'switch');
  btn.click(); await tick();
  check('Schalter aus: keine deutsche Zeile, gespeichert', zeilen().length === 0 && store['lotse.deNetz'] === '0' && btn.getAttribute('aria-checked') === 'false');
  mahnbescheid(); await tick();
  check('Schalter aus: auch nach neuem Zeichnen keine Zeile', zeilen().length === 0);
  btn.click(); await tick();
  check('Schalter wieder an: Zeilen wieder da', zeilen(box()).length > 0 && store['lotse.deNetz'] === '1');

  // Zurück auf Deutsch → keine Zeile
  setLang('de'); await tick();
  mahnbescheid(); await tick();
  check('Zurück auf Deutsch: keine Zeile', zeilen().length === 0, zeilen().length);
  check('Deutsch: Schalter erklärt „nur bei anderen Sprachen“', $('deNetzT').textContent === I18N.de['dn.set.nurFremd']);
  check('Keine Fehler im Fenster', errors.length === 0, errors.join(' | '));
  console.log(fails ? fails + ' Fehler' : 'Sicherheitsnetz-Test bestanden');
  process.exit(fails ? 1 : 0);
})();
