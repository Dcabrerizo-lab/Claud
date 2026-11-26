// App-Symbol für „SoLo Pflege & Rente“ (Variante pflege, docs/VARIANTE-PFLEGE.md): gleiche Sprechblase mit Haken wie SoLo
// (tools/mkicon.js), aber auf Pflege-Blau (--c-pflege) und mit einem Herz-Abzeichen, damit beide Apps auf dem Handy klar
// unterscheidbar sind. Schreibt die fertigen Größen direkt (kein capacitor-assets nötig):
//  - Android: app/android/app/src/pflege/res-symbol/mipmap-*/ic_launcher{,_round,_foreground,_background}.png
//  - iOS:     app/ios/App/App/Assets.xcassets/AppIconPflege.appiconset (1024 px)
// Aufruf: node tools/mkicon-pflege.js [Vorschau.png]
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const RES = path.join(ROOT, 'app', 'android', 'app', 'src', 'pflege', 'res-symbol');
const IOS = path.join(ROOT, 'app', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIconPflege.appiconset');
const BLAU = '#3d67a3'; // --c-pflege (Kachel „Pflege“)
const CREME = '#fffaf3';
const KORALLE = '#ff7a59';

// Sprechblase mit Haken (wie tools/mkicon.js), dazu ein Herz unten rechts auf cremefarbenem Kreis
const BLASE = `<path d="M30 26h40a12 12 0 0 1 12 12v20a12 12 0 0 1-12 12H50L36 82V70h-6a12 12 0 0 1-12-12V38a12 12 0 0 1 12-12z" fill="${CREME}"/>` +
  `<path d="M37 48l9 9 18-18" fill="none" stroke="${KORALLE}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
const HERZ = `<circle cx="74" cy="74" r="15" fill="${CREME}" stroke="${BLAU}" stroke-width="3"/>` +
  `<path d="M74 84l-8.2-8.1a5.3 5.3 0 0 1 7.5-7.5l.7.7.7-.7a5.3 5.3 0 0 1 7.5 7.5z" fill="${KORALLE}"/>`;
const MOTIV = BLASE + HERZ;
const svg = (inner, px) => `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 100 100">${inner}</svg>`;
const flaeche = `<rect width="100" height="100" fill="${BLAU}"/>`;

const DICHTEN = { ldpi: 36, mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
// Android-Altformen: abgerundetes Quadrat bzw. Kreis (wie die mitgelieferten SoLo-Symbole); adaptiv: Vorder- und Hintergrund (Motiv kleiner, damit die Kreismaske das Herz nicht anschneidet)
const formen = {
  'ic_launcher.png': [`<rect width="100" height="100" rx="18" fill="${BLAU}"/><g transform="translate(50 50) scale(.86) translate(-50 -52)">${MOTIV}</g>`, true],
  'ic_launcher_round.png': [`<circle cx="50" cy="50" r="50" fill="${BLAU}"/><g transform="translate(50 50) scale(.8) translate(-50 -52)">${MOTIV}</g>`, true],
  'ic_launcher_foreground.png': [`<g transform="translate(50 50) scale(.74) translate(-50 -52)">${MOTIV}</g>`, true],
  'ic_launcher_background.png': [flaeche, false]
};

(async () => {
  const b = await chromium.launch(process.env.CHROME_PFAD ? { executablePath: process.env.CHROME_PFAD } : {});
  const p = await b.newPage();
  const render = async (inner, px, transparent, ziel) => {
    await p.setViewportSize({ width: px, height: px });
    await p.setContent('<body style="margin:0;background:transparent">' + svg(inner, px) + '</body>');
    fs.mkdirSync(path.dirname(ziel), { recursive: true });
    await p.screenshot({ path: ziel, omitBackground: transparent });
  };
  for (const [d, px] of Object.entries(DICHTEN)) {
    for (const [name, [inner, tr]] of Object.entries(formen)) await render(inner, px, tr, path.join(RES, 'mipmap-' + d, name));
  }
  // iOS: vollflächig, iOS rundet selbst ab; ohne Transparenz (App Store verlangt das)
  await render(flaeche + MOTIV, 1024, false, path.join(IOS, 'AppIcon-Pflege-1024.png'));
  fs.writeFileSync(path.join(IOS, 'Contents.json'), JSON.stringify({
    images: [{ idiom: 'universal', size: '1024x1024', filename: 'AppIcon-Pflege-1024.png', platform: 'ios' }],
    info: { author: 'xcode', version: 1 }
  }, null, 2) + '\n');
  // Vorschau: SoLo neben SoLo Pflege
  const vorschau = process.argv[2];
  if (vorschau) {
    const solo = `<rect width="100" height="100" rx="22" fill="#0f6b5c"/>` + BLASE;
    await p.setViewportSize({ width: 560, height: 300 });
    await p.setContent(`<body style="margin:0;background:#e9e4dc;font:600 22px system-ui;display:flex;gap:60px;justify-content:center;align-items:center;height:300px">
      <figure style="margin:0;text-align:center">${svg(solo, 180)}<figcaption>SoLo</figcaption></figure>
      <figure style="margin:0;text-align:center">${svg(`<rect width="100" height="100" rx="22" fill="${BLAU}"/>` + MOTIV, 180)}<figcaption>SoLo Pflege</figcaption></figure></body>`);
    await p.screenshot({ path: vorschau });
  }
  await b.close();
  console.log('Symbole geschrieben: ' + path.relative(ROOT, RES) + ', ' + path.relative(ROOT, IOS));
})();
