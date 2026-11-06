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

let html = render({ native: true }).html;

// Scan: In der App gibt es nur die Kamera mit Texterkennung auf dem Gerät
const NATIVE_SCAN = [
  '<section class="scan" id="scan" aria-labelledby="h-scan">',
  '          <h2 id="h-scan" data-t="sc.h"></h2>',
  '          <p data-t="sc.nativeIntro"></p>',
  '          <div class="btns"><button type="button" class="btn" id="sc-take" data-t="sc.take"></button></div>',
  '          <p class="msg" id="sc-msg" role="status" aria-live="polite"></p>',
  '          <div id="sc-out"></div>',
  '        </section>'
].join('\n');
html = replaceOnce(html, /<!--SCAN-->[\s\S]*?<!--\/SCAN-->/, NATIVE_SCAN, 'Scan-Block');
html = replaceOnce(html, /<link rel="preconnect"[^>]*>\s*/, '', 'preconnect');
html = replaceOnce(html, /<link rel="stylesheet" href="https:\/\/fonts[^>]*>\s*/, '', 'Google Fonts');
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
  ['schibsted-grotesk', 'Schibsted Grotesk', [[600, 'latin'], [600, 'latin-ext'], [800, 'latin'], [800, 'latin-ext']]]
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

// PDF-Modul bündeln (pdf-lib + fontkit, MIT)
require(need(path.join(MODS, 'esbuild'))).buildSync({
  entryPoints: [path.join(APP, 'pdf', 'pdf-entry.js')],
  bundle: true, minify: true, format: 'iife', target: ['es2019'], platform: 'browser',
  outfile: path.join(WWW, 'pdf.js'), legalComments: 'eof', logLevel: 'warning'
});

// Sicherheitsrichtlinie: nur eigene Dateien; fetch nur für die PDF-Schriften (gleicher Ursprung)
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; " +
  "img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'";
const safeArea = 'body{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}\n';
html = replaceOnce(html, '<style>', '<style>\n' + faces + safeArea, 'erstes <style>');
const head = '<!doctype html>\n<html lang="de"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
  '<meta http-equiv="Content-Security-Policy" content="' + CSP + '">\n'; // <title>, Links und <style> folgen aus der Vorlage
fs.writeFileSync(path.join(WWW, 'index.html'), head + html + '\n</body></html>\n');

const kb = (f) => (fs.statSync(path.join(WWW, f)).size / 1024).toFixed(0);
console.log('App-Build: app/www/index.html', kb('index.html'), 'KB, pdf.js', kb('pdf.js'), 'KB, Schriften lokal');
