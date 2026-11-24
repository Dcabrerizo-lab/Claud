// Baut die Store-App (Android und iOS) nach app/www: gleiche Regeln und Texte wie die Web-Version, aber
//  - ohne Internetzugriffe (Schriften lokal, keine Google Fonts, kein Tesseract/Claude-Scan, strenge CSP)
//  - Formular-Scan mit der Kamera und Texterkennung auf dem Gerät (Plugin TextRecognition)
//  - Antragsmappe als PDF (app/www/pdf.js, gebündelt aus app/pdf/pdf-entry.js)
// Voraussetzung: cd app && npm install
'use strict';
const fs = require('fs');
const path = require('path');
const { render, ROOT } = require('./build.js');

const APP = path.join(ROOT, 'app');
const WWW = path.join(APP, 'www');
const MODS = path.join(APP, 'node_modules');

function need(p, hint) {
  if (!fs.existsSync(p)) throw new Error('Fehlt: ' + path.relative(ROOT, p) + (hint ? ' (' + hint + ')' : ''));
  return p;
}
function replaceOnce(s, from, to, what) {
  const out = typeof from === 'string' ? s.replace(from, () => to) : s.replace(from, () => to);
  if (out === s) throw new Error('App-Build: Stelle nicht gefunden: ' + what);
  return out;
}

need(MODS, 'zuerst: cd app && npm install');

const gebaut = render({ native: true });
let html = gebaut.html;

// Scan: In der App gibt es nur die Kamera mit Texterkennung auf dem Gerät
const NATIVE_SCAN = [
  '<section class="scan pp-teil" id="scan" aria-labelledby="h-scan" hidden>',
  '          <h2 id="h-scan" data-t="sc.h"></h2>',
  '          <p data-t="sc.intro"></p>',
  '          <div class="sc-wahl">',
  '            <button type="button" class="btn ghost sc-foto" id="sc-take"><span aria-hidden="true">📷 </span><span data-t="sc.take"></span></button>',
  '            <input type="file" id="sc-pdf" class="vh" accept="application/pdf,.pdf">',
  '            <label for="sc-pdf" class="btn ghost sc-foto"><span aria-hidden="true">📄 </span><span data-t="el.pdf"></span></label>',
  '            <button type="button" class="btn ghost sc-foto" id="sc-pasteBtn" aria-expanded="false" aria-controls="sc-pasteBox"><span aria-hidden="true">📋 </span><span data-t="el.paste"></span></button>',
  '          </div>',
  '          <div class="field" id="sc-pasteBox" hidden>',
  '            <label for="sc-text" data-t="sc.paste"></label>',
  '            <textarea id="sc-text" lang="de" dir="ltr" autocomplete="off" spellcheck="false"></textarea>',
  '            <div class="btns"><button type="button" class="btn" id="sc-local" data-t="sc.local"></button></div>',
  '          </div>',
  '          <p class="small muted" data-t="el.privat"></p>',
  '          <p class="msg" id="sc-msg" role="status" aria-live="polite"></p>',
  '          <div id="sc-out"></div>',
  '        </section>'
].join('\n');
html = replaceOnce(html, /<!--SCAN-->[\s\S]*?<!--\/SCAN-->/, NATIVE_SCAN, 'Scan-Block');
// Schriften: keine Google Fonts (auch nicht im Template); die App bringt sie als Dateien mit (siehe unten)
html = html.replace(/<link rel="preconnect"[^>]*>\s*/, '').replace(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>\s*/, '');
html = html.replace(/<meta name="claude:viewport-fit-sides"[^>]*>\s*/, '');
// Keine extern eingebundenen Dateien (Links zum Anklicken sind erlaubt und öffnen im Systembrowser).
// Die Web-only-Adressen im Code (Tesseract) werden in der App nie aufgerufen und wären durch die CSP blockiert.
const ext = html.match(/<(script|link|img|iframe)\b[^>]*\b(src|href)="https?:[^"]*"/i);
if (ext) throw new Error('App-Build: externe Ressource eingebunden: ' + ext[0]);

fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(path.join(WWW, 'fonts', 'pdf'), { recursive: true });

// Oberflächen-Schriften (Fontsource, SIL OFL 1.1)
const FONTS = [
  ['atkinson-hyperlegible', 'Atkinson Hyperlegible', [[400, 'latin'], [400, 'latin-ext'], [700, 'latin'], [700, 'latin-ext']]],
  ['nunito', 'Nunito', [600, 700, 800, 900].flatMap((w) => [[w, 'latin'], [w, 'latin-ext']])]
];
const RANGE = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'
};
let faces = '';
FONTS.forEach(([pkg, family, list]) => list.forEach(([w, sub]) => {
  const f = `${pkg}-${sub}-${w}-normal.woff2`;
  fs.copyFileSync(need(path.join(MODS, '@fontsource', pkg, 'files', f)), path.join(WWW, 'fonts', f));
  faces += `@font-face{font-family:'${family}';font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/${f}) format('woff2');unicode-range:${RANGE[sub]}}\n`;
}));

// PDF-Schrift (Noto Sans, SIL OFL 1.1)
const NOTO = path.join(MODS, '@expo-google-fonts', 'noto-sans');
fs.copyFileSync(need(path.join(NOTO, '400Regular', 'NotoSans_400Regular.ttf')), path.join(WWW, 'fonts', 'pdf', 'NotoSans-Regular.ttf'));
fs.copyFileSync(need(path.join(NOTO, '700Bold', 'NotoSans_700Bold.ttf')), path.join(WWW, 'fonts', 'pdf', 'NotoSans-Bold.ttf'));

// Amtliche Formulare werden nicht mehr mitgeliefert (nur Links auf die amtlichen Seiten); alte Kopien entfernen
fs.rmSync(path.join(WWW, 'formulare'), { recursive: true, force: true });

// PDF lesen (Mozilla pdf.js 3.11.174, Apache-2.0): Text aus digitalen PDFs, Seitenbilder aus eingescannten PDFs für die Texterkennung.
// Liegt lokal in der App (offline); im Browser wird dieselbe Version bei Bedarf von cdnjs geladen (mit Prüfsumme, src/app.js).
// Bewusst 3.11.174 und nicht 4+/6: neuere Fassungen laufen nicht auf iOS 15 bis 17.3 (Begründung und Quellen in src/app.js, ladePdfjs).
// Die Lücke CVE-2024-4367 ist über isEvalSupported: false geschlossen (Abhilfe laut Mozilla) und zusätzlich durch die CSP ohne eval.
const PDFJS_VER = '3.11.174';
const pdfjsPkg = JSON.parse(fs.readFileSync(need(path.join(MODS, 'pdfjs-dist', 'package.json'), 'cd app && npm install'), 'utf8'));
if (pdfjsPkg.version !== PDFJS_VER) throw new Error('App-Build: pdfjs-dist ' + pdfjsPkg.version + ' statt ' + PDFJS_VER + ' (cd app && npm install)');
fs.rmSync(path.join(WWW, 'pdfjs'), { recursive: true, force: true }); // Reste anderer Fassungen (z. B. wasm/) nicht mit ausliefern
fs.mkdirSync(path.join(WWW, 'pdfjs'), { recursive: true });
for (const f of ['pdf.min.js', 'pdf.worker.min.js']) fs.copyFileSync(need(path.join(MODS, 'pdfjs-dist', 'build', f), 'cd app && npm install'), path.join(WWW, 'pdfjs', f));
fs.copyFileSync(need(path.join(MODS, 'pdfjs-dist', 'LICENSE')), path.join(WWW, 'pdfjs', 'LICENSE'));

// PDF-Modul bündeln (pdf-lib + fontkit, MIT)
require(need(path.join(MODS, 'esbuild'))).buildSync({
  entryPoints: [path.join(APP, 'pdf', 'pdf-entry.js')],
  bundle: true, minify: true, format: 'iife', target: ['es2019'], platform: 'browser',
  outfile: path.join(WWW, 'pdf.js'), legalComments: 'eof', logLevel: 'warning'
});

// Skripte als eigene Dateien (js/s1.js …) statt im HTML: dann braucht die CSP kein 'unsafe-inline' für Skripte, und eingeschleuster
// Code in der Seite (etwa durch einen Fehler beim Maskieren) würde nicht ausgeführt (Sicherheitsprüfung 21.11.2026, S8).
// Jeder Block bleibt eine eigene Datei in derselben Reihenfolge (gleiches Verhalten wie die Inline-Skripte: nacheinander, synchron).
// Inline-Ereignisattribute wären ebenfalls blockiert: onsubmit="return false" wird zu data-kein-senden (src/app.js verhindert das Absenden).
fs.mkdirSync(path.join(WWW, 'js'), { recursive: true });
let skriptNr = 0;
html = html.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => {
  const name = 'js/s' + (++skriptNr) + '.js';
  fs.writeFileSync(path.join(WWW, name), code);
  return '<script src="' + name + '"></script>';
});
if (!skriptNr) throw new Error('App-Build: keine Skripte gefunden');
html = html.replace(/ onsubmit="return false"/g, ' data-kein-senden');
const rest = html.match(/<script(?![^>]*\ssrc=)[^>]*>|\son[a-z]+\s*=\s*["']/i);
if (rest) throw new Error('App-Build: Inline-Skript oder Ereignisattribut übrig (CSP ohne unsafe-inline): ' + rest[0]);

// Sprachen nur bei Bedarf (src/sprachladen.js): jede Sprache außer Deutsch als eigene Datei lang/<Sprache>.js im App-Paket.
// Geladen wird lokal aus dem Paket (script-src 'self'), auch im Flugmodus; beim Start nur Deutsch und die gewählte Sprache.
fs.mkdirSync(path.join(WWW, 'lang'), { recursive: true });
const sprachDateien = Object.entries(gebaut.sprachDateien);
if (sprachDateien.length < 12) throw new Error('App-Build: Sprachdateien fehlen (' + sprachDateien.length + ')');
sprachDateien.forEach(([f, code]) => fs.writeFileSync(path.join(WWW, 'lang', f), code));

// Sicherheitsrichtlinie: nur eigene Dateien, keine Inline-Skripte; fetch nur für die PDF-Schriften (gleicher Ursprung).
// style-src behält 'unsafe-inline' (style-Attribute und <style> in der Vorlage; Stile führen keinen Code aus).
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; " +
  "img-src 'self' data: blob:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'";
const safeArea = 'body{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}\n';
html = replaceOnce(html, '<style>', '<style>\n' + faces + safeArea, 'erstes <style>');
const head = '<!doctype html>\n<html lang="de"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
  '<meta name="theme-color" content="#fffaf3" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#1b1815" media="(prefers-color-scheme: dark)">\n' +
  '<meta http-equiv="Content-Security-Policy" content="' + CSP + '">\n' +
  '<link rel="icon" href="data:,">\n'; // leeres Symbol: sonst fragt die WebView /favicon.ico an (404 im Log); <title>, Links und <style> folgen aus der Vorlage
fs.writeFileSync(path.join(WWW, 'index.html'), head + html + '\n</body></html>\n');

// Variante (VARIANTE=pflege, scripts/build.js): Kennung und Namen für das App-Paket. Android liest www/variante.json (nach cap sync in
// src/main/assets/public) und setzt danach Paket-ID, Namen und Symbol (app/android/app/build.gradle). iOS: beim Bauen
// -xcconfig pflege.xcconfig übergeben (Bundle-ID, Anzeigename, Symbol). Siehe docs/VARIANTE-PFLEGE.md.
if (gebaut.variante && gebaut.variante.id !== 'solo') {
  const v = gebaut.variante;
  fs.writeFileSync(path.join(WWW, 'variante.json'), JSON.stringify({ id: v.id, appId: v.appId, appName: v.kurzname, name: v.name }, null, 2) + '\n');
  console.log('App-Build: Variante ' + v.name + ' (' + v.appId + ', Kurzname „' + v.kurzname + '“). Android übernimmt das nach cap sync selbst; iOS: xcodebuild … -xcconfig pflege.xcconfig');
}

const kb = (f) => (fs.statSync(path.join(WWW, f)).size / 1024).toFixed(0);
const startKb = (fs.statSync(path.join(WWW, 'index.html')).size + fs.readdirSync(path.join(WWW, 'js')).reduce((a, f) => a + fs.statSync(path.join(WWW, 'js', f)).size, 0)) / 1024;
const langKb = sprachDateien.reduce((a, [, c]) => a + Buffer.byteLength(c), 0) / 1024;
console.log('App-Build: beim Start geladen (index.html + js/)', startKb.toFixed(0), 'KB; Sprachdateien lang/ zusammen', langKb.toFixed(0), 'KB (je Sprache nur bei Bedarf)');
console.log('App-Build: app/www/index.html', kb('index.html'), 'KB,', skriptNr, 'Skriptdateien, pdf.js', kb('pdf.js'), 'KB, pdf.js-Leser', kb('pdfjs/pdf.min.js'), '+', kb('pdfjs/pdf.worker.min.js'), 'KB, Schriften lokal');
