// Baut die Web-Version: dist/i18n.js und dist/sozialleistungslotse.html
// aus src/template.html, src/rules.js, src/fmt.js, src/plz.js, src/app.js und src/lang/*.json.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro'];

const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

function i18nSource() {
  const all = {};
  LANGS.forEach((l) => { all[l] = JSON.parse(read(path.join('lang', l + '.json'))); });
  return 'const I18N = ' + JSON.stringify(all) + ';\nif (typeof module !== "undefined") module.exports = I18N;\n';
}

// Optional: PLZ-Daten (content/plz-data.json). Fehlen sie, bleibt das PLZ-Feld ausgeblendet.
function plzData() { return jsonData('plz-data.json'); }
// Optional: Behördenverzeichnis Bayern (content/behoerden-bayern.json). Fehlt es, nennt die App nur die Art der Stelle.
// Dazu Stellen außerhalb Bayerns (content/behoerden-deutschland.json: Name und Website, noch ohne Anschrift) als Feld „de“.
function behoerdenData() {
  const by = jsonData('behoerden-bayern.json');
  if (by === 'null') return by;
  const o = JSON.parse(by);
  const de = jsonData('behoerden-deutschland.json');
  if (de !== 'null') o.de = JSON.parse(de);
  return JSON.stringify(o);
}
function jsonData(name) {
  const f = path.join(ROOT, 'content', name);
  return fs.existsSync(f) ? JSON.stringify(JSON.parse(fs.readFileSync(f, 'utf8'))) : 'null';
}

// Prüfpaket (Brief prüfen): Abschnitte, Stile und Bausteine aus erweiterungen/ – eine Quelle für App und Vorschau.
// Die Abschnitte stehen in erweiterungen/vorschau.html; die Stile werden auf .pp beschränkt, damit sie die App nicht verändern.
const ERW = (f) => fs.readFileSync(path.join(ROOT, 'erweiterungen', f), 'utf8');
const PP_ABSCHNITTE = ['p-pflege', 'p-bescheid', 'p-gsa', 'p-wg', 'p-kiz', 'p-nk'];
function ppAbschnitt(html, id) {
  const a = html.indexOf('<section id="' + id + '"');
  if (a < 0) throw new Error('Prüfpaket: Abschnitt fehlt: ' + id);
  const e = html.indexOf('</section>', a);
  return html.slice(a, e + 10).replace(/ role="tabpanel" aria-labelledby="[^"]*"/, '').replace(/^(<section id="[^"]*")( hidden)?/, '$1 class="pp-teil" hidden');
}
// Einfacher Stil-Umschreiber: jede Regel bekommt .pp davor; Seitenregeln (:root, body, *, .wrap, Reiter) entfallen, die App hat eigene
function ppStile(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const raus = /^(:root|body|\*|\.wrap|h1|nav\b|nav\[|:focus-visible)/;
  const regel = (sel, body) => {
    const teile = sel.split(',').map((x) => x.trim()).filter((x) => x && !raus.test(x));
    return teile.length ? teile.map((x) => '.pp ' + x.replace(/^nav button, /, '')).join(', ') + ' {' + body + '}' : '';
  };
  let out = '', i = 0;
  while (i < css.length) {
    const auf = css.indexOf('{', i); if (auf < 0) break;
    const kopf = css.slice(i, auf).trim();
    if (kopf.startsWith('@media')) {
      let tiefe = 1, j = auf + 1; while (tiefe && j < css.length) { if (css[j] === '{') tiefe++; else if (css[j] === '}') tiefe--; j++; }
      const innen = css.slice(auf + 1, j - 1);
      if (!/prefers-color-scheme/.test(kopf)) { const r = ppStile(innen); if (r.trim()) out += kopf + ' {\n' + r + '}\n'; }
      i = j; continue;
    }
    const zu = css.indexOf('}', auf);
    const r = regel(kopf, css.slice(auf + 1, zu)); if (r) out += '  ' + r + '\n';
    i = zu + 1;
  }
  return out;
}
function pruefpaket() {
  const html = ERW('vorschau.html');
  const stil = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!stil) throw new Error('Prüfpaket: Stile fehlen in vorschau.html');
  const teile = PP_ABSCHNITTE.map((id) => ppAbschnitt(html, id)).join('\n');
  const js = ['pflege.js', 'pflege-import.js', 'bescheid-sgb2.js', 'bescheid-gsa.js', 'bescheid-wg.js', 'bescheid-kiz.js', 'fristen.js', 'widerspruch.js', 'nebenkosten.js', 'vorschau.js'].map(ERW).join('\n');
  return { teile, css: ppStile(stil[1]), js };
}

// opts.native: Store-App (Android/iOS) statt Web
function render(opts = {}) {
  const pp = pruefpaket();
  const parts = { rules: read('rules.js'), i18n: i18nSource(), fmt: read('fmt.js'), plz: read('plz.js'), behoerden: read('behoerden.js'), formulare: read('formulare.js'), app: read('app.js') };
  if (opts.native) {
    if (!parts.app.includes('/*NATIVE*/ false')) throw new Error('Marker /*NATIVE*/ fehlt in src/app.js');
    parts.app = parts.app.replace('/*NATIVE*/ false', 'true');
  }
  const html = read('template.html')
    .replace('/*RULES*/\n', () => parts.rules)
    .replace('/*I18N*/\n', () => parts.i18n)
    .replace('/*FMT*/\n', () => parts.fmt)
    .replace('/*PLZ*/\n', () => parts.plz)
    .replace('/*PLZDATA*/null', () => (opts.plz === false ? 'null' : plzData()))
    .replace('/*BEHOERDEN*/\n', () => parts.behoerden)
    .replace('/*BEHOERDENDATA*/null', () => (opts.plz === false ? 'null' : behoerdenData()))
    .replace('/*FORMULARE*/\n', () => parts.formulare)
    .replace('<!--PRUEFPAKET-->', () => pp.teile)
    .replace('/*PPSTIL*/\n', () => pp.css)
    .replace('/*PRUEFPAKET*/\n', () => pp.js)
    .replace('/*APP*/\n', () => parts.app.replace("'/*VERSION*/'", () => JSON.stringify(require(path.join(ROOT, 'package.json')).version)));
  const left = html.match(/\/\*(RULES|I18N|FMT|PLZ|PLZDATA|BEHOERDEN|BEHOERDENDATA|FORMULARE|APP|PPSTIL|PRUEFPAKET)\*\/|<!--PRUEFPAKET-->/);
  if (left) throw new Error('Platzhalter nicht ersetzt: ' + left[0]);
  return { html, i18n: parts.i18n };
}

function build() {
  const { html, i18n } = render();
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'i18n.js'), i18n);
  // Eigenständige Datei (zum Öffnen im Browser, für die Webseite): mit Zeichensatz und Viewport. Ohne <meta charset> zeigt
  // Safari (WebKit) die Umlaute falsch; ohne Viewport ist die Seite auf dem Handy winzig. Die App setzt ihren Kopf selbst (build-app.js).
  const doc = '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="icon" href="data:,">\n</head>\n<body>\n' + html + '\n</body>\n</html>\n';
  fs.writeFileSync(path.join(DIST, 'sozialleistungslotse.html'), doc);
  console.log('Web-Build: dist/sozialleistungslotse.html', (html.length / 1024).toFixed(1), 'KB');
}

module.exports = { render, i18nSource, LANGS, ROOT };
if (require.main === module) build();
