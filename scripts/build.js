// Baut die Web-Version: dist/i18n.js und dist/sozialleistungslotse.html
// aus src/template.html, src/sprachladen.js, src/rules.js, src/fmt.js, src/plz.js, src/vorgaenge.js, src/app.js und src/lang/*.json.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];

// Varianten der App aus demselben Code (Entscheidung David 24.11.2026): VARIANTE=pflege baut „SoLo Pflege“ für Menschen in Rente
// oder dauerhaft erwerbsgemindert und pflegende Angehörige. Name, App-Kennung und Dateiname stehen NUR hier
// (name: voller Name für Store, Titel, Startseite; kurzname: unter dem Symbol auf dem Handy, Capacitor appName; Entscheidung David 24.11.2026).
//  - sprachOrdner: zusätzliche Sprachdateien src/lang/<Ordner>/<Sprache>.json (dürfen Schlüssel der Grundfassung überschreiben, z. B. „lead“);
//    Einfache Sprache dazu in src/lang/<Ordner>/einfach.json. Fehlt eine Sprache, gilt Deutsch (t() in src/app.js).
//    „sie“ (nur SoLo Pflege, Entscheidung David 24.11.2026): Sie-Fassungen der übernommenen SoLo-Texte, zuletzt geladen; Liste: tools/sie-schluessel.js
//  - skripte: zusätzliche Skripte vor src/app.js (fehlende Dateien werden übersprungen)
//  - teile: src/variante/<Name>.html mit den Marken TEIL start, TEIL ansicht, TEIL stil
//  - ohne: Module src/<x>.js, die nicht eingebaut werden (dazu ihre Texte src/lang/<x>/, außer haushalt: dessen Texte nutzt auch „Geld“)
const VARIANTEN = {
  solo: { name: 'SoLo', kurzname: 'SoLo', appId: 'com.Sozialleistungslotse', datei: 'sozialleistungslotse.html', i18n: 'i18n.js', sprachOrdner: [], skripte: [], teile: null, ohne: [] },
  pflege: {
    name: 'SoLo Pflege & Rente', kurzname: 'SoLo Pflege', titel: 'SoLo <span class="sub">Pflege &amp; Rente</span>', appId: 'com.Sozialleistungslotse.pflege', datei: 'solo-pflege.html', i18n: 'i18n-pflege.js',
    sprachOrdner: ['sen-ui', 'senioren', 'vorlesen', 'sen-ux', 'sie'], skripte: ['senioren.js', 'vorlesen.js'], teile: 'pflege.html',
    // Teile, die es in SoLo Pflege nicht gibt (Startgröße unter 3 MB): Module und ihre Texte; src/app.js prüft window.Ausziehen/window.Haushalt
    ohne: ['ausziehen', 'haushalt']
  }
};
function variante(v) {
  const name = v || process.env.VARIANTE || 'solo';
  if (!VARIANTEN[name]) throw new Error('Unbekannte VARIANTE: ' + name + ' (bekannt: ' + Object.keys(VARIANTEN).join(', ') + ')');
  return Object.assign({ id: name }, VARIANTEN[name]);
}

const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

// Kommentare aus den ausführbaren Skriptblöcken entfernen (Startgröße, Grenze 3 MB). Sicher: Die Kommentarstellen liefert der
// JavaScript-Parser espree (kommt mit ESLint), also nie Text in Zeichenketten oder Vorlagen. Lizenz-/Copyright-Kommentare bleiben.
// Datenblöcke (<script type="application/json">) bleiben unberührt. Lässt sich ein Block nicht parsen, bleibt er unverändert.
function ohneKommentare(html) {
  let espree;
  try { espree = require('espree'); } catch (e) { console.warn('Hinweis: espree fehlt, Kommentare bleiben (npm install)'); return html; }
  return html.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => {
    let ast;
    try { ast = espree.parse(code, { comment: true, range: true, ecmaVersion: 'latest', sourceType: 'script' }); } catch (e) {
      console.warn('Hinweis: Skriptblock nicht parsebar, Kommentare bleiben: ' + e.message); return m;
    }
    let aus = '', pos = 0;
    ast.comments.forEach((k) => {
      if (k.type === 'Block' && /^!|@license|@preserve|copyright|lizenz|license/i.test(k.value)) return;
      aus += code.slice(pos, k.range[0]) + (k.type === 'Block' ? (k.value.includes('\n') ? '\n' : ' ') : '');
      pos = k.range[1];
    });
    aus += code.slice(pos);
    // Leerraum außerhalb der Kommentare bleibt unverändert (Vorlagen-Zeichenketten könnten Leerzeilen enthalten; Zeilenumbrüche: ASI gleich)
    return '<script>' + aus + '</script>';
  });
}

// Einfache Sprache: src/lang/einfach/*.json (Dateien mit Unterstrich, z. B. _test.json, werden übersprungen) zu einem Objekt
// I18N_EINFACH zusammenführen. Nur Schlüssel, die es in de.json gibt; andere Schlüssel und Nicht-Texte werden mit Warnung verworfen.
// Wert "=": Der Standardtext ist schon einfach (kurze Beschriftung, Name, Betrag). Er wird nicht doppelt ausgeliefert;
// t() nimmt dann den Standardtext. So hat jeder Schlüssel einen Eintrag (Prüfung: test/test-einfach-vollstaendig.js).
function einfachSource(de, vari) {
  const dir = path.join(SRC, 'lang', 'einfach');
  const out = {};
  const zusatz = ((vari && vari.sprachOrdner) || []).map((o) => path.join(SRC, 'lang', o, 'einfach.json')).filter((f) => fs.existsSync(f));
  zusatz.forEach((f) => { const o = JSON.parse(fs.readFileSync(f, 'utf8')); Object.keys(o).forEach((k) => { if (Object.prototype.hasOwnProperty.call(de, k) && typeof o[k] === 'string' && o[k] !== '=') out[k] = o[k]; }); });
  if (fs.existsSync(dir)) {
    // Texte weggelassener Module und Texte anderer Varianten (z. B. einfach/senioren.json nur in SoLo Pflege) nicht ausliefern
    const aktiv = (vari && vari.sprachOrdner) || [];
    const fremd = [...new Set(Object.values(VARIANTEN).flatMap((v) => v.sprachOrdner))].filter((o) => !aktiv.includes(o));
    const ohne = (vari && vari.ohne || []).filter((m) => m !== 'haushalt').concat(fremd);
    fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_') && !ohne.some((m) => f.startsWith(m))).sort().forEach((f) => {
      const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      Object.keys(o).forEach((k) => {
        if (!Object.prototype.hasOwnProperty.call(de, k)) { console.warn('Warnung: Einfache Sprache (' + f + '): Schlüssel nicht in de.json: ' + k); return; }
        if (typeof o[k] !== 'string') { console.warn('Warnung: Einfache Sprache (' + f + '): Wert ist kein Text: ' + k); return; }
        if (o[k] === '=') return; // Standardtext gilt
        if (!(k in out)) out[k] = o[k]; // Variante (oben) hat Vorrang
      });
    });
  }
  return out;
}

function sprachObjekte(vari) {
  const all = {};
  LANGS.forEach((l) => { all[l] = JSON.parse(read(path.join('lang', l + '.json'))); });
  // Haushaltsplan (src/haushalt.js): eigene Sprachdateien src/lang/haushalt/<Sprache>.json, Schlüssel „hb.*“ (getrennt, damit andere Arbeiten nicht kollidieren)
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'haushalt', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // „Ich ziehe aus“ (src/ausziehen.js): eigene Sprachdateien src/lang/ausziehen/<Sprache>.json, Schlüssel „az.*“
  if (!(vari && vari.ohne.includes('ausziehen'))) LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'ausziehen', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Schulden-Liste (src/schulden.js): eigene Sprachdateien src/lang/schulden/<Sprache>.json, Schlüssel „sl.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'schulden', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Fristen in „Mein Ordner“ (src/fristen.js): eigene Sprachdateien src/lang/fristen/<Sprache>.json, Schlüssel „fri.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'fristen', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Nachträge aus der Prüfung mit frischen Augen (Brief prüfen, Ergebnis, Sprachwahl): src/lang/zusatz/<Sprache>.json (getrennt, damit parallele Arbeiten nicht kollidieren)
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'zusatz', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Texte neuer Karten (Hilfe zum Lebensunterhalt, Landeserziehungsgeld; 25.11.2026): src/lang/karten/<Sprache>.json
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'karten', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Leistungs-Check Schritt für Schritt (src/schritte.js): eigene Sprachdateien src/lang/schritte/<Sprache>.json, Schlüssel „sf.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'schritte', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // „Für Klient zusammenstellen“ (src/klient.js): eigene Sprachdateien src/lang/klient/<Sprache>.json, Schlüssel „kb.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'klient', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Pflege (Übersicht, Erklärseite, Pflegegrad-Einschätzung): src/lang/pflege/<Sprache>.json, Schlüssel „pfl.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'pflege', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Suche auf der Startseite (src/suche.js): Texte src/lang/suche/<Sprache>.json, Schlüssel „su.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'suche', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Sicherheitsnetz für Übersetzungen (src/denetz.js): Texte src/lang/denetz/<Sprache>.json, Schlüssel „dn.*“
  LANGS.forEach((l) => { const f = path.join(SRC, 'lang', 'denetz', l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); });
  // Variante (z. B. SoLo Pflege): eigene Texte, zuletzt (überschreiben die Grundfassung)
  ((vari && vari.sprachOrdner) || []).forEach((o) => LANGS.forEach((l) => { const f = path.join(SRC, 'lang', o, l + '.json'); if (fs.existsSync(f)) Object.assign(all[l], JSON.parse(fs.readFileSync(f, 'utf8'))); }));
  return all;
}
// Alle 13 Sprachen vollständig (dist/i18n.js für die Tests)
function i18nSource(vari) {
  const all = sprachObjekte(vari);
  return 'const I18N = ' + JSON.stringify(all) + ';\nconst I18N_EINFACH = ' + JSON.stringify(einfachSource(all.de, vari)) + ';\nif (typeof module !== "undefined") module.exports = I18N;\n';
}

// Sprachen nur bei Bedarf (src/sprachladen.js, Entscheidung David 21.11.2026): im Startskript nur Deutsch vollständig, von den
// anderen Sprachen nur meta.* (Name, Schreibrichtung). Die übrigen Texte je Sprache:
//  - Web: JSON-Datenblöcke in derselben HTML-Datei (werden nicht ausgeführt, erst beim Wechsel geparst; „<“ maskiert, damit kein </script> entsteht)
//  - App (opts.native): Dateien lang/<Sprache>.js (schreibt scripts/build-app.js ins App-Paket)
function i18nGeteilt(native, vari) {
  const all = sprachObjekte(vari), start = {}, sprachen = {};
  LANGS.forEach((l) => {
    if (l === 'de') { start.de = all.de; return; }
    start[l] = Object.fromEntries(Object.entries(all[l]).filter(([k]) => k.startsWith('meta.')));
    sprachen[l] = all[l];
  });
  const js = 'const I18N = ' + JSON.stringify(start) + ';\nconst I18N_EINFACH = ' + JSON.stringify(einfachSource(all.de, vari)) + ';\n' +
    'const SPRACH_QUELLE = ' + JSON.stringify(native ? 'datei' : 'eingebettet') + ';\n' + read('sprachladen.js') + 'if (typeof module !== "undefined") module.exports = I18N;\n';
  const maske = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
  const bloecke = native ? '' : Object.keys(sprachen).map((l) => '<script type="application/json" id="solo-sprache-' + l + '">' + maske(sprachen[l]) + '</script>\n').join('');
  const dateien = native ? Object.fromEntries(Object.keys(sprachen).map((l) => [l + '.js', 'SprachLaden.dazu(' + JSON.stringify(l) + ', ' + maske(sprachen[l]) + ');\n'])) : {};
  return { js, bloecke, dateien };
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

// Alltagswörter und alte Namen für die Suche: src/lang/suche/woerter/<Sprache>.json ({ Ziel-ID: [Wörter] }), in src/suche.js eingesetzt
function sucheJs() {
  const dir = path.join(SRC, 'lang', 'suche', 'woerter'), w = {};
  LANGS.forEach((l) => { const f = path.join(dir, l + '.json'); if (fs.existsSync(f)) w[l] = JSON.parse(fs.readFileSync(f, 'utf8')); });
  const js = read('suche.js');
  if (!js.includes('/*SUCHWOERTER*/null')) throw new Error('Marke /*SUCHWOERTER*/ fehlt in src/suche.js');
  return js.replace('/*SUCHWOERTER*/null', () => JSON.stringify(w));
}

// Sicherheitsnetz für Übersetzungen: zentrale Liste src/lang/denetz/wichtig.json in src/denetz.js einsetzen (Marke /*WICHTIG*/null)
function denetzJs() {
  const js = read('denetz.js');
  if (!js.includes('/*WICHTIG*/null')) throw new Error('Marke /*WICHTIG*/ fehlt in src/denetz.js');
  const w = JSON.parse(read(path.join('lang', 'denetz', 'wichtig.json')));
  Object.keys(w).forEach((k) => { if (k.startsWith('_')) delete w[k]; });
  return js.replace('/*WICHTIG*/null', () => JSON.stringify(w));
}

// Teile der Variante in die Vorlage einsetzen (Marken in src/template.html); in der Grundfassung fallen die Marken weg
function varianteVorlage(html, vari) {
  let teile = { start: '', ansicht: '', stil: '' };
  if (vari.teile) {
    const q = fs.readFileSync(path.join(SRC, 'variante', vari.teile), 'utf8');
    for (const k of Object.keys(teile)) {
      const m = q.match(new RegExp('<!--TEIL ' + k + '-->\\n([\\s\\S]*?)(?=<!--TEIL |$)'));
      if (!m) throw new Error('Variante ' + vari.id + ': TEIL ' + k + ' fehlt in src/variante/' + vari.teile);
      teile[k] = m[1];
    }
  }
  const marken = [['<!--VAR-START-->\n', teile.start], ['<!--VAR-ANSICHT-->\n', teile.ansicht], ['/*VAR-STIL*/\n', teile.stil]];
  for (const [m, x] of marken) { if (!html.includes(m)) throw new Error('Marke ' + m.trim() + ' fehlt in src/template.html'); html = html.replace(m, () => x); }
  const js = vari.skripte.map((f) => (fs.existsSync(path.join(SRC, f)) ? read(f) : '')).join('\n');
  if (!html.includes('<script>\n/*VARJS*/\n</script>\n')) throw new Error('Marke /*VARJS*/ fehlt in src/template.html');
  html = html.replace('<script>\n/*VARJS*/\n</script>\n', () => (js.trim() ? '<script>\n' + js + '\n</script>\n' : ''));
  if (vari.titel) {
    const alt = '<span class="titel">SoLo <span class="sub">Sozial&shy;leistungs&shy;lotse</span></span>';
    if (!html.includes(alt)) throw new Error('Variante: App-Titel in src/template.html nicht gefunden');
    html = html.replace(alt, () => '<span class="titel">' + vari.titel + '</span>');
    if (!html.includes('<title>SoLo – Sozialleistungslotse</title>')) throw new Error('Variante: <title> in src/template.html nicht gefunden');
    html = html.replace('<title>SoLo – Sozialleistungslotse</title>', () => '<title>' + vari.name.replace(/&/g, '&amp;') + '</title>');
  }
  return html;
}

// opts.native: Store-App (Android/iOS) statt Web; opts.variante: 'solo' (Standard) oder 'pflege' (sonst Umgebungsvariable VARIANTE)
function render(opts = {}) {
  const vari = variante(opts.variante);
  const pp = pruefpaket();
  const sprachTeile = i18nGeteilt(!!opts.native, vari);
  const parts = { rules: read('rules.js'), i18n: sprachTeile.js, fmt: read('fmt.js'), plz: read('plz.js'), behoerden: read('behoerden.js'), formulare: read('formulare.js'), vorgaenge: read('vorgaenge.js'), haushalt: read('haushalt.js'), ausziehen: read('ausziehen.js'), fristen: read('fristen.js'), schulden: read('schulden.js'), geld: read('geld.js'), schritte: read('schritte.js'), klient: read('klient.js'), suche: sucheJs(), denetz: denetzJs(), navigation: read('navigation.js'), app: read('app.js') };
  if (opts.native) {
    if (!parts.app.includes('/*NATIVE*/ false')) throw new Error('Marker /*NATIVE*/ fehlt in src/app.js');
    parts.app = parts.app.replace('/*NATIVE*/ false', 'true');
  }
  // Weitergabe an den Klienten (src/weitergabe.js) mit QR-Code-Erzeugung (src/vendor/qrcode.js: qrcode-generator 2.0.4, MIT, Kazuhiko Arase), offline gebündelt
  parts.weitergabe = read('weitergabe.js'); parts.qrcode = read(path.join('vendor', 'qrcode.js'));
  // Gemeinsame Verschlüsselung (src/krypto.js) für Weitergabe und Vorgänge: steht vor beiden, im selben Skript wie die Weitergabe
  parts.weitergabe = read('krypto.js') + parts.weitergabe;
  vari.ohne.forEach((m) => { if (!(m in parts)) throw new Error('Variante: unbekanntes Modul ' + m); parts[m] = ''; });
  // Block „Variante Pflege“ in src/app.js nur in dieser Variante (Startgröße der Grundfassung); ohne ihn bleibt varFilter als Durchreiche
  const vpA = parts.app.indexOf('  /*VAR-PFLEGE-ANFANG*/'), vpE = parts.app.indexOf('  /*VAR-PFLEGE-ENDE*/\n');
  const voA = parts.app.indexOf('  /*VAR-PFLEGE-ANFANG oben*/'), voE = parts.app.indexOf('  /*VAR-PFLEGE-ENDE oben*/\n');
  if (vpA < 0 || vpE < vpA || voA < 0 || voE < voA) throw new Error('Marken /*VAR-PFLEGE-ANFANG/ENDE*/ fehlen in src/app.js');
  if (vari.id !== 'pflege') {
    parts.app = parts.app.slice(0, vpA) + '  function varFilter(o) { return o; }\n' + parts.app.slice(vpE + '  /*VAR-PFLEGE-ENDE*/\n'.length);
    parts.app = parts.app.slice(0, voA) + parts.app.slice(voE + '  /*VAR-PFLEGE-ENDE oben*/\n'.length);
  }
  if (!parts.app.includes("/*VARIANTE*/ 'solo'")) throw new Error('Marker /*VARIANTE*/ fehlt in src/app.js');
  if (vari.id !== 'solo') parts.app = parts.app.replace("/*VARIANTE*/ 'solo'", () => JSON.stringify(vari.id));
  const vorlage = require(path.join(SRC, 'navigation.js')).vorlage(varianteVorlage(read('template.html'), vari)); // gemeinsamer Zurück-Knopf: Marken <!--ZURUECK ...-->
  if (/<!--ZURUECK/.test(vorlage)) throw new Error('Marke <!--ZURUECK--> mit falscher Schreibweise in src/template.html');
  if (!vorlage.includes('<script>\n/*I18N*/\n')) throw new Error('Marke <script> /*I18N*/ fehlt in src/template.html');
  const html = vorlage
    .replace('<script>\n/*I18N*/\n', () => sprachTeile.bloecke + '<script>\n/*I18N*/\n') // Datenblöcke vor den Skripten: beim Start schon im DOM
    .replace('/*RULES*/\n', () => parts.rules)
    .replace('/*I18N*/\n', () => parts.i18n)
    .replace('/*FMT*/\n', () => parts.fmt)
    .replace('/*PLZ*/\n', () => parts.plz)
    .replace('/*PLZDATA*/null', () => (opts.plz === false ? 'null' : plzData()))
    .replace('/*BEHOERDEN*/\n', () => parts.behoerden)
    .replace('/*BEHOERDENDATA*/null', () => (opts.plz === false ? 'null' : behoerdenData()))
    .replace('/*FORMULARE*/\n', () => parts.formulare)
    .replace('/*QRCODE*/\n', () => parts.qrcode)
    .replace('/*WEITERGABE*/\n', () => parts.weitergabe)
    .replace('/*VORGAENGE*/\n', () => parts.vorgaenge)
    .replace('/*HAUSHALT*/\n', () => parts.haushalt)
    .replace('/*AUSZIEHEN*/\n', () => parts.ausziehen)
    .replace('/*FRISTEN*/\n', () => parts.fristen)
    .replace('/*SCHULDEN*/\n', () => parts.schulden)
    .replace('/*GELD*/\n', () => parts.geld)
    .replace('/*NAVIGATION*/\n', () => parts.navigation)
    .replace('/*SCHRITTE*/\n', () => parts.schritte)
    .replace('/*KLIENT*/\n', () => parts.klient)
    .replace('/*SUCHE*/\n', () => parts.suche)
    .replace('/*DENETZ*/\n', () => parts.denetz)
    .replace('<!--PRUEFPAKET-->', () => pp.teile)
    .replace('/*PPSTIL*/\n', () => pp.css)
    .replace('/*PRUEFPAKET*/\n', () => briefEinfachJs() + pp.js)
    .replace('/*APP*/\n', () => parts.app.replace("'/*VERSION*/'", () => JSON.stringify(require(path.join(ROOT, 'package.json')).version)));
  const left = html.match(/\/\*(RULES|I18N|FMT|PLZ|PLZDATA|BEHOERDEN|BEHOERDENDATA|FORMULARE|VORGAENGE|HAUSHALT|AUSZIEHEN|FRISTEN|SCHULDEN|GELD|NAVIGATION|SCHRITTE|KLIENT|SUCHE|DENETZ|APP|PPSTIL|PRUEFPAKET)\*\/|<!--PRUEFPAKET-->/);
  if (left) throw new Error('Platzhalter nicht ersetzt: ' + left[0]);
  return { html: ohneKommentare(html), i18n: i18nSource(vari), sprachDateien: sprachTeile.dateien, variante: vari };
}

// Sicherheitsrichtlinie der Web-Version (Sicherheitsprüfung 21.11.2026, S9). Erlaubt genau das, was die Seite braucht:
//  - Skripte: die eigenen (in der Datei, daher 'unsafe-inline'; die Web-Version ist eine einzelne HTML-Datei), Texterkennung von cdnjs
//    (Tesseract) und jsDelivr (Worker, Kern, Sprachdaten), pdf.js von cdnjs. Nachgeladenes Tesseract und pdf.js tragen eine Prüfsumme (SRI, src/app.js).
//  - 'wasm-unsafe-eval': nur WebAssembly für den Kern der Texterkennung, kein eval für JavaScript (auch nicht für pdf.js: CVE-2024-4367).
//  - blob: bei den Skripten: Der mit Prüfsumme geladene pdf.js-Worker startet aus einer blob-Adresse und lädt daraus sein Programm; kann der
//    Browser keinen Worker starten, lädt pdf.js denselben Code im Fenster. Neben 'unsafe-inline' öffnet blob: nichts Zusätzliches.
//  - Worker: blob-Adressen (Tesseract startet seinen Worker so, pdf.js den geprüften Worker), sonst nichts von außen.
//  - Keine Plugins, keine fremde Basisadresse, kein Absenden von Formularen.
const WEB_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; " +
  "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' data: blob: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
  "worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'";

function build() {
  const { html, i18n, variante: vari } = render();
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, vari.i18n), i18n);
  // Eigenständige Datei (zum Öffnen im Browser, für die Webseite): mit Zeichensatz und Viewport. Ohne <meta charset> zeigt
  // Safari (WebKit) die Umlaute falsch; ohne Viewport ist die Seite auf dem Handy winzig. Die App setzt ihren Kopf selbst (build-app.js).
  const doc = '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta http-equiv="Content-Security-Policy" content="' + WEB_CSP + '">\n<meta name="theme-color" content="#fffaf3" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#1b1815" media="(prefers-color-scheme: dark)">\n<link rel="icon" href="data:,">\n</head>\n<body>\n' + html + '\n</body>\n</html>\n';
  fs.writeFileSync(path.join(DIST, vari.datei), doc);
  const startTeil = html.replace(/<script type="application\/json" id="solo-sprache-[^"]+">[^<]*<\/script>\n/g, '');
  console.log('Web-Build (' + vari.name + '): dist/' + vari.datei, (Buffer.byteLength(doc) / 1024).toFixed(1), 'KB, davon beim Start geparst', (Buffer.byteLength(startTeil) / 1024).toFixed(1), 'KB (übrige Sprachen erst beim Wechsel)');
}

module.exports = { render, i18nSource, i18nGeteilt, LANGS, ROOT, WEB_CSP, VARIANTEN, variante };
if (require.main === module) build();
