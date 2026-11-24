// „Brief prüfen“ in Einfacher Sprache (src/lang/einfach/brief/brief.json, erweiterungen/vorschau.js PruefpaketEinfach)
// 1. Jeder sichtbare feste deutsche Text (vorschau.html, vorschau.js, brief-lesen.js) hat eine einfache Fassung ("=" = schon einfach), keine Altlasten.
// 2. Einfache Fassung: gleiche Platzhalter, keine Zahl fällt weg (Fristen, Beträge, Paragrafen), keine neue Zahl (außer Ziffern bis 12).
// 3. In der App: Schalter an → alle bekannten Texte unter „Brief prüfen“ einfach, auch neu gezeichnete; Schreiben (textarea) unverändert; Schalter aus → Standard.
'use strict';
const fs = require('fs');
const path = require('path');
const { alle, norm } = require('./brief-einfach-texte.js');
const W = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'einfach', 'brief', 'brief.json'), 'utf8')).texte;
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info).slice(0, 400) : ''); } };

const a = alle(), texte = [...new Set(a.statisch.concat(a.skript, a.briefLesen))];
const ohne = texte.filter((t) => !(t in W));
ok('Jeder sichtbare Text hat eine einfache Fassung', ohne.length === 0, ohne.slice(0, 20));
const alt = Object.keys(W).filter((k) => !texte.includes(k));
ok('Keine Einträge für Texte, die es nicht mehr gibt', alt.length === 0, alt.slice(0, 20));
const ph = (s) => (s.match(/\{\d+\}/g) || []).sort().join();
const zahlen = (s) => s.replace(/\{\d+\}/g, '').match(/\d+(?:[.,]\d+)*/g) || [];
const klein = (z) => /^\d+$/.test(z) && +z <= 12;
for (const [k, v] of Object.entries(W)) {
  ok('Wert ist Text: ' + k, typeof v === 'string' && v.trim() !== '');
  if (v === '=') continue;
  ok('Platzhalter gleich: ' + k, ph(k) === ph(v), [k, v]);
  const z0 = zahlen(k), z1 = zahlen(v);
  ok('Keine Zahl weggefallen: ' + k, z0.every((z) => z1.includes(z)), [z0, z1]);
  ok('Keine neue Zahl: ' + k, z1.every((z) => z0.includes(z) || klein(z)), [z0, z1]);
}
ok('Mindestens 80 eigene einfache Texte', Object.values(W).filter((v) => v !== '=').length >= 80);

// 3. In der App (gebaute Datei)
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const errors = [], store = {};
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
    w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
const warte = () => new Promise((r) => setTimeout(r, 0));
const sichtbareTexte = () => {
  const out = [], tw = d.createTreeWalker($('v-briefe'), 4);
  for (let t = tw.nextNode(); t; t = tw.nextNode()) { const el = t.parentElement; if (!el.closest('textarea, script, style, [data-t]')) { const s = norm(t.nodeValue); if (s) out.push(s); } }
  return out;
};
setTimeout(async () => {
  ok('Keine Skriptfehler beim Laden', errors.length === 0, errors);
  if ($('firstOk')) $('firstOk').click();
  $('goBriefe').click(); $('brief-jc').click();
  $('elSelbst').click();
  $('bs-beispiel') && $('bs-beispiel').click();
  const std = $('p-bescheid').textContent;
  // Schalter „Einfache Sprache“ (Einstellungen)
  $('einfacheSpracheBtn').click(); await warte();
  const nichtEinfach = sichtbareTexte().filter((s) => W[s] && W[s] !== '=');
  ok('Schalter an: kein bekannter Text mehr in der Standardfassung', nichtEinfach.length === 0, nichtEinfach.slice(0, 10));
  ok('Schalter an: Wörter im Bescheid einfach erklärt', $('p-bescheid').textContent.includes(require('../src/lang/einfach/zusatz.json')['bp.w.bz']));
  ok('Schalter an: Feldhilfe hinter „Wo steht das?“ einfach', $('bs-b-kdu-hilfe') && $('bs-b-kdu-hilfe').textContent.includes('Das ist das Geld für Miete'), $('bs-b-kdu-hilfe') && $('bs-b-kdu-hilfe').textContent);
  // neu gezeichnetes Ergebnis
  $('bs-b-zahl').value = '1000'; $('bs-b-zahl').dispatchEvent(new w.Event('input', { bubbles: true })); await warte();
  const nach = sichtbareTexte().filter((s) => W[s] && W[s] !== '=');
  ok('Schalter an: auch neu gezeichnete Texte einfach', nach.length === 0, nach.slice(0, 10));
  // Schreiben an das Amt bleibt förmlich
  $('bs-wid-mach').click(); await warte();
  const brief = $('bs-wid-text').value;
  ok('Widerspruch bleibt förmlich (Standardtext, nicht ersetzt)', /Sehr geehrte Damen und Herren/.test(brief) && /Widerspruch/.test(brief), brief.slice(0, 120));
  ok('Frist bleibt sichtbar (einfach)', /Frist|Tipp/.test($('bs-frist').textContent), $('bs-frist').textContent);
  // Anderer Brief: Ergebnis aus vorschau.js
  $('briefZurueck').click(); $('brief-ab').click(); $('brief-an').click();
  $('elPaste').click(); $('elText').value = 'Mahnbescheid\nAmtsgericht Coburg\nWiderspruch\nZustellung am 01.11.2026'; $('elLesen').click(); await warte();
  ok('Anderer Brief einfach: Mahnbescheid-Hinweis', $('elErg').textContent.includes(require('../src/lang/einfach/scanpruef.json')['bp.mb.frist']), $('elErg').textContent.slice(0, 300)); // Text über tA (src/lang/zusatz, einfach/scanpruef.json)
  // Schalter aus: alles zurück
  $('einfacheSpracheBtn').click(); await warte();
  const zurueck = sichtbareTexte().filter((s) => Object.values(W).includes(s) && W[s] === undefined);
  ok('Schalter aus: Standardtexte zurück', zurueck.length === 0 && $('p-bescheid').textContent.includes('Er ist nicht das Datum des Bescheids.'), zurueck.slice(0, 5));
  ok('Schalter aus: Text wie vorher (Abschnitt Grundsicherungsgeld enthält die Standard-Erklärung)', std.includes('Weiterbewilligungsantrag. Er ist nicht das Datum des Bescheids.'));
  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `[brief-einfach] Brief prüfen in Einfacher Sprache: alle ${n} Prüfungen bestanden`);
  process.exit(f ? 1 : 0);
}, 400);
