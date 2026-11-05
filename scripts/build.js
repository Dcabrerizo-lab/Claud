// Baut die Web-Version: dist/i18n.js und dist/leistungs-lotse.html
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
function plzData() {
  const f = path.join(ROOT, 'content', 'plz-data.json');
  return fs.existsSync(f) ? JSON.stringify(JSON.parse(fs.readFileSync(f, 'utf8'))) : 'null';
}

// opts.native: Store-App (Android/iOS) statt Web
function render(opts = {}) {
  const parts = { rules: read('rules.js'), i18n: i18nSource(), fmt: read('fmt.js'), plz: read('plz.js'), app: read('app.js') };
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
    .replace('/*APP*/\n', () => parts.app);
  const left = html.match(/\/\*(RULES|I18N|FMT|PLZ|PLZDATA|APP)\*\//);
  if (left) throw new Error('Platzhalter nicht ersetzt: ' + left[0]);
  return { html, i18n: parts.i18n };
}

function build() {
  const { html, i18n } = render();
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'i18n.js'), i18n);
  fs.writeFileSync(path.join(DIST, 'leistungs-lotse.html'), html);
  console.log('Web-Build: dist/leistungs-lotse.html', (html.length / 1024).toFixed(1), 'KB');
}

module.exports = { render, i18nSource, LANGS, ROOT };
if (require.main === module) build();
