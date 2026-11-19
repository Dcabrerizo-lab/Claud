// App-Symbol und Startbild aus dem Logo „Sprechblase mit Haken“ (tools/logo/sprechblase.svg) erzeugen.
// Schritt 1 (dieses Skript): Quellbilder in app/assets rendern (Playwright).
// Schritt 2: cd app && npx capacitor-assets generate --android --ios \
//   --iconBackgroundColor '#0f6b5c' --iconBackgroundColorDark '#0f6b5c' \
//   --splashBackgroundColor '#fffaf3' --splashBackgroundColorDark '#1b1815' --logoSplashScale 0.3
const path = require('path');
const { chromium } = require('playwright');
const OUT = path.join(__dirname, '..', 'app', 'assets');
const BUBBLE = '<path d="M30 26h40a12 12 0 0 1 12 12v20a12 12 0 0 1-12 12H50L36 82V70h-6a12 12 0 0 1-12-12V38a12 12 0 0 1 12-12z" fill="#fffaf3"/>' +
  '<path d="M37 48l9 9 18-18" fill="none" stroke="#ff7a59" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>';
const svg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">${inner}</svg>`;
const PETROL = '#0f6b5c';
const bilder = [
  // Vollflächig: die Stores und iOS runden selbst ab
  ['icon-only.png', svg(`<rect width="100" height="100" fill="${PETROL}"/>${BUBBLE}`), false],
  ['icon.png', svg(`<rect width="100" height="100" fill="${PETROL}"/>${BUBBLE}`), false],
  // Android adaptiv: ic_launcher.xml setzt 16,7 % Rand, das Bild füllt also genau die sichtbare Fläche; Blase etwas kleiner, damit die Kreismaske nichts abschneidet
  ['icon-foreground.png', svg(`<g transform="translate(50 50) scale(.92) translate(-50 -54)">${BUBBLE}</g>`), true],
  ['icon-background.png', svg(`<rect width="100" height="100" fill="${PETROL}"/>`), false],
  // Startbild: gerundetes Logo auf Creme (hell) bzw. warmem Dunkel
  ['logo.png', svg(`<rect width="100" height="100" rx="30" fill="${PETROL}"/>${BUBBLE}`), true],
  ['logo-dark.png', svg(`<rect width="100" height="100" rx="30" fill="${PETROL}"/>${BUBBLE}`), true]
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  for (const [name, content, transparent] of bilder) {
    await p.setContent('<body style="margin:0;background:transparent">' + content + '</body>');
    await p.screenshot({ path: path.join(OUT, name), omitBackground: transparent });
    console.log('geschrieben: app/assets/' + name);
  }
  await b.close();
})();
