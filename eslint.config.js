// Minimal-Lint mit nur zwei Regeln: nicht deklarierte Namen (Tippfehler) und unbenutzte Variablen.
// Bewusst keine Stilregeln, keine Umformatierung. Aufruf: npm run lint
'use strict';
const globals = require('globals');

const regeln = {
  'no-undef': 'error',
  'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
};

// Namen, die eine Datei der App/Erweiterungen bereitstellt und eine andere nutzt
// (im Browser werden die Dateien zu einer Seite zusammengefügt, in Node per require geladen)
const appNamen = Object.fromEntries([
  'Rules', 'Fmt', 'Plz', 'Behoerden', 'Formulare', 'I18N', 'I18N_EINFACH', 'PFLEGE_EINFACH',
  'BriefLesen', 'PflegeAssistent', 'Pflege', 'PflegeFragen', 'PflegeImport',
  'BescheidGSA', 'BescheidKiZ', 'BescheidSGB2', 'BescheidWG', 'Fristen', 'Nebenkosten',
  'Widerspruch', 'Lizenz', 'Haushalt', 'Ausziehen', 'Schulden', 'Navigation', 'FristenOrdner', 'LIZENZ_SCHLUESSEL', 'DEMO_LIZENZ', 'Vorgaenge',
].map((n) => [n, 'readonly']));

module.exports = [
  { linterOptions: { reportUnusedDisableDirectives: 'off' } },
  {
    // App und Erweiterungen: Browser/WebView und Node (Tests)
    files: ['src/*.js', 'erweiterungen/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, ...globals.commonjs, ...appNamen },
    },
    rules: regeln,
  },
  {
    // lizenz.js nutzt in Node Buffer (mit typeof-Prüfung, im Browser btoa/atob)
    files: ['erweiterungen/lizenz.js'],
    languageOptions: { globals: { Buffer: 'readonly' } },
  },
  {
    // Werkzeuge, Build-Skripte und Tests: Node
    files: ['scripts/*.js', 'tools/*.js', 'test/*.js', 'test/erweiterungen/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: regeln,
  },
  {
    // Browsertests (Playwright): Code in page.evaluate() läuft in der Seite
    files: ['test/a11y.js', 'test/app-test.js', 'test/e2e-*.js', 'test/erweiterungen/e2e-*.js',
      'tools/emulator-bedienung.js', 'tools/store-bilder.js'],
    languageOptions: { globals: { ...globals.browser, ...appNamen } },
  },
  {
    // Bekannte unbenutzte Reste in Dateien, die parallel bearbeitet werden: nur Warnung, nicht hier aufräumen.
    // app.js: resultText, istPdf, lastEs, STORE_SCHLUESSEL; formulare.js: selbe, anschrift, leer, k; plz.js: stufeLabel
    files: ['src/app.js', 'src/formulare.js', 'src/plz.js'],
    rules: { 'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }] },
  },
];
