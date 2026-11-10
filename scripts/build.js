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

// opts.native: Store-App (Android/iOS) statt Web
function render(opts = {}) {
  const parts = { rules: read('rules.js'), i18n: i18nSource(), fmt: read('fmt.js'), plz: read('plz.js'), behoerden: read('behoerden.js'), app: read('app.js') };
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
    .replace('/*APP*/\n', () => parts.app);
  const left = html.match(/\/\*(RULES|I18N|FMT|PLZ|PLZDATA|BEHOERDEN|BEHOERDENDATA|APP)\*\//);
  if (left) throw new Error('Platzhalter nicht ersetzt: ' + left[0]);
  return { html, i18n: parts.i18n };
}

function build() {
  const { html, i18n } = render();
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'i18n.js'), i18n);
  fs.writeFileSync(path.join(DIST, 'sozialleistungslotse.html'), html);
  console.log('Web-Build: dist/sozialleistungslotse.html', (html.length / 1024).toFixed(1), 'KB');
}

module.exports = { render, i18nSource, LANGS, ROOT };
if (require.main === module) build();
