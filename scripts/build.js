// Baut die Web-Version: dist/i18n.js und dist/sozialleistungslotse.html
// aus src/template.html, src/rules.js, src/fmt.js, src/plz.js, src/vorgaenge.js, src/app.js und src/lang/*.json.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];

const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

// Einfache Sprache: src/lang/einfach/*.json (Dateien mit Unterstrich, z. B. _test.json, werden übersprungen) zu einem Objekt
// I18N_EINFACH zusammenführen. Nur Schlüssel, die es in de.json gibt; andere Schlüssel und Nicht-Texte werden mit Warnung verworfen.
// Wert "=": Der Standardtext ist schon einfach (kurze Beschriftung, Name, Betrag). Er wird nicht doppelt ausgeliefert;
// t() nimmt dann den Standardtext. So hat jeder Schlüssel einen Eintrag (Prüfung: test/test-einfach-vollstaendig.js).
function einfachSource(de) {
  const dir = path.join(SRC, 'lang', 'einfach');
  const out = {};
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort().forEach((f) => {
      const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      Object.keys(o).forEach((k) => {
        if (!Object.prototype.hasOwnProperty.call(de, k)) { console.warn('Warnung: Einfache Sprache (' + f + '): Schlüssel nicht in de.json: ' + k); return; }
        if (typeof o[k] !== 'string') { console.warn('Warnung: Einfache Sprache (' + f + '): Wert ist kein Text: ' + k); return; }
        if (o[k] === '=') return; // Standardtext gilt
        out[k] = o[k];
      });
    });
  }
  return out;
}

function i18nSource() {
  const all = {};
  LANGS.forEach((l) => { all[l] = JSON.parse(read(path.join('lang', l + '.json'))); });
  // Haushaltsplan (src/haushalt.js): eigene Sprachdateien src/lang/haushalt/<Sprache>.json, Schlüssel „hb.*“ (getrennt, damit andere Arbeiten nicht kollidieren)
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'haushalt', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // „Ich ziehe aus“ (src/ausziehen.js): eigene Sprachdateien src/lang/ausziehen/<Sprache>.json, Schlüssel „az.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'ausziehen', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Schulden-Liste (src/schulden.js): eigene Sprachdateien src/lang/schulden/<Sprache>.json, Schlüssel „sl.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'schulden', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Fristen in „Mein Ordner“ (src/fristen.js): eigene Sprachdateien src/lang/fristen/<Sprache>.json, Schlüssel „fri.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'fristen', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Leistungs-Check Schritt für Schritt (src/schritte.js): eigene Sprachdateien src/lang/schritte/<Sprache>.json, Schlüssel „sf.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'schritte', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  return 'const I18N = ' + JSON.stringify(all) + ';\nconst I18N_EINFACH = ' + JSON.stringify(einfachSource(all.de)) + ';\nif (typeof module !== "undefined") module.exports = I18N;\n';
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
const PP_ABSCHNITTE = ['p-pflege', 'p-bescheid', 'p-gsa', 'p-wg', 'p-kiz', 'p-nk', 'p-andere'];
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
  // Einfache Sprache der Pflege-Einschätzung (src/lang/einfach/pflege/pflege.json, liest pflege-fragen.js als PFLEGE_EINFACH)
  const pe = path.join(SRC, 'lang', 'einfach', 'pflege', 'pflege.json');
  const pflegeEinfach = 'const PFLEGE_EINFACH = ' + (fs.existsSync(pe) ? JSON.stringify(JSON.parse(fs.readFileSync(pe, 'utf8'))) : 'null') + ';\n';
  const js = pflegeEinfach + ['pflege.js', 'pflege-fragen.js', 'pflege-assistent.js', 'brief-lesen.js', 'kostensenkung.js', 'pflege-import.js', 'bescheid-sgb2.js', 'bescheid-gsa.js', 'bescheid-wg.js', 'bescheid-kiz.js', 'fristen.js', 'widerspruch.js', 'nebenkosten.js', 'vorschau.js'].map(ERW).join('\n');
  return { teile, css: ppStile(stil[1]), js };
}

// Einfache Sprache für „Brief prüfen“: Wörterbuch src/lang/einfach/brief/brief.json (Schlüssel = deutscher Standardtext), liest vorschau.js als BRIEF_EINFACH
function briefEinfachJs() {
  const f = path.join(SRC, 'lang', 'einfach', 'brief', 'brief.json');
  if (!fs.existsSync(f)) return 'const BRIEF_EINFACH = null;\n';
  // nur eigene einfache Fassungen ausliefern; "=" (Standardtext gilt) braucht die App nicht
  const texte = Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(f, 'utf8')).texte).filter(([, v]) => v !== '='));
  return 'const BRIEF_EINFACH = ' + JSON.stringify({ texte }) + ';\n';
}

// opts.native: Store-App (Android/iOS) statt Web
function render(opts = {}) {
  const pp = pruefpaket();
  const parts = { rules: read('rules.js'), i18n: i18nSource(), fmt: read('fmt.js'), plz: read('plz.js'), behoerden: read('behoerden.js'), formulare: read('formulare.js'), vorgaenge: read('vorgaenge.js'), haushalt: read('haushalt.js'), ausziehen: read('ausziehen.js'), fristen: read('fristen.js'), schulden: read('schulden.js'), schritte: read('schritte.js'), navigation: read('navigation.js'), app: read('app.js') };
  if (opts.native) {
    if (!parts.app.includes('/*NATIVE*/ false')) throw new Error('Marker /*NATIVE*/ fehlt in src/app.js');
    parts.app = parts.app.replace('/*NATIVE*/ false', 'true');
  }
  const vorlage = require(path.join(SRC, 'navigation.js')).vorlage(read('template.html')); // gemeinsamer Zurück-Knopf: Marken <!--ZURUECK ...-->
  if (/<!--ZURUECK/.test(vorlage)) throw new Error('Marke <!--ZURUECK--> mit falscher Schreibweise in src/template.html');
  const html = vorlage
    .replace('/*RULES*/\n', () => parts.rules)
    .replace('/*I18N*/\n', () => parts.i18n)
    .replace('/*FMT*/\n', () => parts.fmt)
    .replace('/*PLZ*/\n', () => parts.plz)
    .replace('/*PLZDATA*/null', () => (opts.plz === false ? 'null' : plzData()))
    .replace('/*BEHOERDEN*/\n', () => parts.behoerden)
    .replace('/*BEHOERDENDATA*/null', () => (opts.plz === false ? 'null' : behoerdenData()))
    .replace('/*FORMULARE*/\n', () => parts.formulare)
    .replace('/*VORGAENGE*/\n', () => parts.vorgaenge)
    .replace('/*HAUSHALT*/\n', () => parts.haushalt)
    .replace('/*AUSZIEHEN*/\n', () => parts.ausziehen)
    .replace('/*FRISTEN*/\n', () => parts.fristen)
    .replace('/*SCHULDEN*/\n', () => parts.schulden)
    .replace('/*NAVIGATION*/\n', () => parts.navigation)
    .replace('/*SCHRITTE*/\n', () => parts.schritte)
    .replace('<!--PRUEFPAKET-->', () => pp.teile)
    .replace('/*PPSTIL*/\n', () => pp.css)
    .replace('/*PRUEFPAKET*/\n', () => briefEinfachJs() + pp.js)
    .replace('/*APP*/\n', () => parts.app.replace("'/*VERSION*/'", () => JSON.stringify(require(path.join(ROOT, 'package.json')).version)));
  const left = html.match(/\/\*(RULES|I18N|FMT|PLZ|PLZDATA|BEHOERDEN|BEHOERDENDATA|FORMULARE|VORGAENGE|HAUSHALT|AUSZIEHEN|FRISTEN|SCHULDEN|NAVIGATION|SCHRITTE|APP|PPSTIL|PRUEFPAKET)\*\/|<!--PRUEFPAKET-->/);
  if (left) throw new Error('Platzhalter nicht ersetzt: ' + left[0]);
  return { html, i18n: parts.i18n };
}

function build() {
  const { html, i18n } = render();
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'i18n.js'), i18n);
  // Eigenständige Datei (zum Öffnen im Browser, für die Webseite): mit Zeichensatz und Viewport. Ohne <meta charset> zeigt
  // Safari (WebKit) die Umlaute falsch; ohne Viewport ist die Seite auf dem Handy winzig. Die App setzt ihren Kopf selbst (build-app.js).
  const doc = '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#fffaf3" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#1b1815" media="(prefers-color-scheme: dark)">\n<link rel="icon" href="data:,">\n</head>\n<body>\n' + html + '\n</body>\n</html>\n';
  fs.writeFileSync(path.join(DIST, 'sozialleistungslotse.html'), doc);
  console.log('Web-Build: dist/sozialleistungslotse.html', (html.length / 1024).toFixed(1), 'KB');
}

module.exports = { render, i18nSource, LANGS, ROOT };
if (require.main === module) build();
