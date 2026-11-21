// Sicherheit: Eingaben dürfen nie als HTML oder Skript ausgeführt werden (Cross-Site-Scripting).
// Schadcode steht in allen Freitext-Feldern (Name, Anschrift, Telefon), in den gespeicherten Angaben (auch manipuliert)
// und in der einfachen Version. Danach darf es kein eingeschleustes Element und keinen Skriptaufruf geben.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/../dist/sozialleistungslotse.html', 'utf8');

let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const BOESE = '"><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>';
const p = { name: BOESE, geb: BOESE, strasse: BOESE, ort: '80331 ' + BOESE, tel: BOESE };
const s = { adults: 1, kids: 2, ek1Art: 'lohn', ek1Brutto: '1500', ek1Netto: '1150', miete: BOESE, plz: BOESE, bundesland: BOESE, mietstufe: BOESE, vermoegen: BOESE, gebJahr: BOESE, bhPerson: BOESE, gdb: BOESE, aufenthalt: BOESE, baby: BOESE, egVor: BOESE, bezug: { [BOESE]: true } };
const store = { 'lotse.state': JSON.stringify({ s, p, e: true }), 'lotse.ack': '1', 'lotse.einfach': JSON.stringify({ es: { schritt: 3, antworten: { name: BOESE }, plz: BOESE, mz: { [BOESE]: true } }, an: false }) };
const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
    w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
  }
});
const w = dom.window, d = w.document;
const pruefe = (wo) => {
  ck(wo + ': kein Skript ausgeführt', !w.__xss);
  ck(wo + ': kein eingeschleustes Bild', !d.querySelector('img[src="x"]'));
  ck(wo + ': kein eingeschleustes Skript', ![...d.querySelectorAll('script')].some((x) => /__xss/.test(x.textContent)));
  ck(wo + ': kein onerror-Attribut', !d.querySelector('[onerror]'));
};
setTimeout(() => {
  pruefe('Start mit manipulierten gespeicherten Angaben');
  ck('Start: keine Skriptfehler trotz manipulierter Angaben', errors.length === 0, errors.join('; '));
  // Mappe: alle Karten auswählen, Mappe öffnen (Briefe mit Name und Anschrift)
  d.querySelectorAll('[data-pick]').forEach((c) => { c.checked = true; c.dispatchEvent(new w.Event('change', { bubbles: true })); });
  ['p-name', 'p-strasse', 'p-ort', 'p-tel', 'p-geb'].forEach((id) => { const el = d.getElementById(id); if (el) { el.value = BOESE; el.dispatchEvent(new w.Event('input', { bubbles: true })); } });
  const mk = d.getElementById('mappeMake'); if (mk) mk.click();
  setTimeout(() => {
    ck('Mappe geöffnet', d.getElementById('mappe').hidden === false);
    ck('Mappe: Name steht als Text im Brief', d.getElementById('mappeBody').textContent.includes('<img src=x'));
    pruefe('Antragsmappe mit Schadcode in Name und Anschrift');
    // Einfache Version mit manipulierten Angaben: zweite Seite, die direkt in der einfachen Version startet
    const store2 = Object.assign({}, store, { 'lotse.einfach': JSON.stringify({ es: { schritt: 2, plz: BOESE, wohnform: BOESE, mz: { [BOESE]: true }, [BOESE]: BOESE }, an: true }) });
    const err2 = [];
    const dom2 = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
      runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(w2) {
        w2.addEventListener('error', (e) => err2.push(String(e.error || e.message)));
        w2.HTMLElement.prototype.scrollIntoView = function () {}; w2.scrollTo = function () {};
        Object.defineProperty(w2, 'localStorage', { value: { getItem: (k) => (k in store2 ? store2[k] : null), setItem: () => {}, removeItem: () => {} }, configurable: true });
      }
    });
    setTimeout(() => {
      const d2 = dom2.window.document;
      ck('Einfache Version ist offen', !!d2.getElementById('einfach') && !d2.getElementById('einfach').hidden && d2.getElementById('einfach').innerHTML.length > 100);
      ck('Einfache Version: kein Skript ausgeführt, kein eingeschleustes Element', !dom2.window.__xss && !d2.querySelector('img[src="x"]') && !d2.querySelector('[onerror]'));
      ck('Einfache Version: keine Skriptfehler', err2.length === 0, err2.join('; '));
      ck('Keine Skriptfehler im ganzen Test', errors.length === 0, errors.join('; '));
      weitere().catch((e) => ck('Weitere Sicherheitsprüfungen ohne Absturz', false, e && e.stack)).then(() => {
        console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : 'Sicherheitstest bestanden: ' + n + ' Prüfungen (Schadcode in allen Eingaben und gespeicherten Angaben wird nie ausgeführt)');
        process.exit(fails ? 1 : 0);
      });
    }, 300);
  }, 300);
}, 300);

// ----- Sicherheitspunkte mittel/niedrig (Prüfungen 21.11.2026: sicherheit.md S7–S13, schluss-sicherheit.md P3, P4, P6, P8) -----
const path = require('path');
const crypto = require('crypto');
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
async function weitere() {
  const ROOT = path.join(__dirname, '..');
  const app = fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8');
  const buildApp = fs.readFileSync(path.join(ROOT, 'scripts', 'build-app.js'), 'utf8');
  const { WEB_CSP, render } = require('../scripts/build.js');

  // S9: Web-Version mit CSP; nachgeladene Skripte nur von den zwei genannten Quellen, mit Prüfsumme
  const kopf = html.slice(0, html.indexOf('</head>'));
  const csp = (kopf.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/) || [])[1] || '';
  const teil = (c, n) => ((c.split(';').map((x) => x.trim()).find((x) => x.startsWith(n + ' ')) || '').split(/\s+/).slice(1));
  ck('[csp-web] Web-Datei hat eine CSP im Kopf (gleich WEB_CSP)', csp === WEB_CSP && csp.length > 50, csp);
  ck('[csp-web] kein eval für JavaScript (nur wasm-unsafe-eval), keine Plugins, keine fremde Basisadresse, kein Absenden', !teil(csp, 'script-src').includes("'unsafe-eval'") && teil(csp, 'object-src').join() === "'none'" && teil(csp, 'base-uri').join() === "'none'" && teil(csp, 'form-action').join() === "'none'", csp);
  const fremd = teil(csp, 'script-src').filter((x) => /^https:/.test(x)).sort().join(' ');
  ck('[csp-web] Skripte nur von cdnjs und jsDelivr', fremd === 'https://cdn.jsdelivr.net https://cdnjs.cloudflare.com', fremd);
  const adressen = [...app.matchAll(/'(https:\/\/(?:cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)[^']*)'/g)].map((m) => m[1]);
  ck('[csp-web] jede nachgeladene Adresse aus src/app.js ist in script-src und connect-src erlaubt', adressen.length >= 3 && adressen.every((u) => { const h = new URL(u).origin; return teil(csp, 'script-src').includes(h) && teil(csp, 'connect-src').includes(h); }), adressen);
  const sri = (name) => (app.match(new RegExp(name + " = '(sha512-[A-Za-z0-9+/=]+)'")) || [])[1];
  const pdfSri = app.match(/PDFJS_SRI = \{ lib: '(sha512-[^']+)', worker: '(sha512-[^']+)' \}/);
  ck('[sri] Tesseract mit Prüfsumme (integrity, crossorigin) geladen', /sha512-[A-Za-z0-9+/]{86}==/.test(sri('TESS_SRI') || '') && /sc\.integrity = TESS_SRI; sc\.crossOrigin = 'anonymous';\s*sc\.src = 'https:\/\/cdnjs/.test(app));
  ck('[sri] pdf.js: Programm mit integrity, Worker per fetch mit integrity (blob-Adresse)', !!pdfSri && /s\.integrity = PDFJS_SRI\.lib; s\.crossOrigin = 'anonymous';/.test(app) && /fetch\(basis \+ 'pdf\.worker\.min\.js', \{ integrity: PDFJS_SRI\.worker/.test(app) && /workerSrc = URL\.createObjectURL/.test(app));

  // S10 / CVE-2024-4367 (Entscheidung 21.11.2026, Prüfung PR 138): pdf.js bleibt 3.11.174, weil 4+/6 auf iOS 15 bis 17.3 nicht läuft.
  // Die Lücke ist über die von Mozilla genannte Abhilfe geschlossen: isEvalSupported: false an JEDEM getDocument-Aufruf (GHSA-wgrm-67xf-hhpq).
  // Dazu: keine CSP erlaubt eval für JavaScript. Ein Umstieg auf 4.2.67 oder neuer bleibt erlaubt (dann ist die Lücke im Programm behoben).
  const ver = (app.match(/var PDFJS_VER = '([\d.]+)'/) || [])[1] || '';
  const appPkg = require('../app/package.json');
  const ab = (v, min) => { const a = v.split('.').map(Number), b = min.split('.').map(Number); for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] > b[i]; } return true; };
  ck('[pdfjs] Version 3.11.174 (oder ab 4.2.67), gleich in src/app.js, app/package.json und scripts/build-app.js', (ver === '3.11.174' || ab(ver, '4.2.67')) && appPkg.devDependencies['pdfjs-dist'] === ver && buildApp.includes("const PDFJS_VER = '" + ver + "'"), [ver, appPkg.devDependencies['pdfjs-dist']]);
  const aufrufe = [...app.matchAll(/getDocument\(([^;]*?)\)\.promise/g)].map((m) => m[1]);
  ck('[pdfjs] jeder getDocument-Aufruf mit isEvalSupported: false (Abhilfe für CVE-2024-4367)', aufrufe.length >= 2 && aufrufe.length === (app.match(/getDocument\(/g) || []).length && aufrufe.every((x) => /^\{[^}]*isEvalSupported: false[^}]*\}$/.test(x)), aufrufe);
  const muster = fs.readFileSync(path.join(ROOT, 'tools', 'scan-muster.js'), 'utf8');
  ck('[pdfjs] auch das Werkzeug scan-muster.js öffnet PDFs nur mit isEvalSupported: false', (muster.match(/getDocument\(/g) || []).length === (muster.match(/getDocument\(\{[^}]*isEvalSupported: false/g) || []).length);
  ck('[pdfjs] kein eval für JavaScript in der CSP von App und Web (zweite Sicherung)', !/unsafe-eval'/.test(csp.replace(/'wasm-unsafe-eval'/g, '')) && !/unsafe-eval/.test((buildApp.match(/const CSP = "([^"]+)" \+\s*"([^"]+)"/) || []).slice(1).join('') || 'unsafe-eval'));
  ck('[pdfjs] Web lädt dieselbe Version von cdnjs', app.includes("'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VER + '/'"));
  ck('[csp-web] blob: bei den Skripten (pdf.js-Worker aus der geprüften blob-Adresse, Rückfall ohne Worker)', teil(csp, 'script-src').includes('blob:') && teil(csp, 'worker-src').includes('blob:'));
  const pdfjsDir = path.join(ROOT, 'app', 'node_modules', 'pdfjs-dist');
  if (fs.existsSync(path.join(pdfjsDir, 'package.json')) && pdfSri) { // nur wo app/node_modules installiert ist (CI-Schritt mit App-Abhängigkeiten)
    const h = (f) => 'sha512-' + crypto.createHash('sha512').update(fs.readFileSync(path.join(pdfjsDir, 'build', f))).digest('base64');
    ck('[sri] Prüfsummen passen zu den Dateien aus app/node_modules', h('pdf.min.js') === pdfSri[1] && h('pdf.worker.min.js') === pdfSri[2]);
  }

  // S8: App-CSP ohne 'unsafe-inline' für Skripte; die Vorlage erfüllt die Voraussetzungen (nur einfache <script>-Blöcke, keine Ereignisattribute außer onsubmit="return false")
  const appCsp = (buildApp.match(/const CSP = "([^"]+)" \+\s*"([^"]+)"/) || []).slice(1).join('');
  ck('[csp-app] script-src nur \'self\' (kein unsafe-inline, kein eval)', teil(appCsp, 'script-src').join(' ') === "'self'" && teil(appCsp, 'worker-src').join(' ') === "'self'" && teil(appCsp, 'object-src').join() === "'none'", appCsp);
  const nativ = render({ native: true }).html;
  const tags = [...nativ.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1]);
  const attr = [...nativ.replace(/<script>[\s\S]*?<\/script>/g, '').matchAll(/\son[a-z]+\s*=\s*"[^"]*"/gi)].map((m) => m[0].trim());
  ck('[csp-app] Vorlage: nur einfache <script>-Blöcke (werden zu Dateien), keine anderen Ereignisattribute', tags.length > 5 && tags.every((x) => x === '') && attr.every((x) => x === 'onsubmit="return false"'), [tags.filter(Boolean), attr.filter((x) => x !== 'onsubmit="return false"')]);
  ck('[csp-app] build-app.js schreibt Skripte als Dateien und ersetzt onsubmit', /html\.replace\(\/<script>\(\[\\s\\S\]\*\?\)<\\\/script>\/g/.test(buildApp) && buildApp.includes("html.replace(/ onsubmit=\"return false\"/g, ' data-kein-senden')") && /throw new Error\('App-Build: Inline-Skript oder Ereignisattribut übrig/.test(buildApp));
  // data-kein-senden: Absenden wird verhindert (sonst würde die App neu laden)
  const f = d.createElement('form'); f.setAttribute('data-kein-senden', ''); d.body.appendChild(f);
  const ev = new w.Event('submit', { bubbles: true, cancelable: true }); f.dispatchEvent(ev);
  ck('[csp-app] Formular mit data-kein-senden wird nicht abgesendet', ev.defaultPrevented === true);
  f.remove();

  // S13: Suchlink ohne Ort/PLZ (Angaben in diesem Test: Ort mit Postleitzahl 80331)
  const such = [...d.querySelectorAll('a[href*="duckduckgo"]')].map((a) => decodeURIComponent(a.getAttribute('href')));
  ck('[suchlink] keine Postleitzahl und kein Ort aus den Angaben in der Suchadresse', such.length > 0 && such.every((u) => !/80331|img|__xss/.test(u)), such.slice(0, 3));

  const T = require('../dist/i18n.js');
  const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
  ck('[texte] neue Texte in allen 13 Sprachen, alte Angabe „4 bis …“ entfernt', LANGS.every((l) => ['vg.pin.einfach', 'vg.lesefehler', 'f.empfSucheOrt'].every((k) => typeof T[l][k] === 'string' && T[l][k].length > 20) && ['vg.pin.label', 'vg.pin.kurz', 'vgp.pinNeu', 'vgp.format'].every((k) => /6/.test(T[l][k]) && !/\b4\b/.test(T[l][k]))));
  const E = Object.assign({}, ...fs.readdirSync(path.join(ROOT, 'src', 'lang', 'einfach')).filter((x) => x.endsWith('.json')).map((x) => require(path.join(ROOT, 'src', 'lang', 'einfach', x))));
  ck('[texte] Einfache Sprache für die neuen Texte', ['vg.pin.einfach', 'vg.lesefehler', 'f.empfSucheOrt'].every((k) => typeof E[k] === 'string' && E[k].length > 10));

  // P3: Foto vom QR-Code (Android) und andere Kamerafotos im App-Bilderordner löschen, nur genau diese Dateien
  const Klient = require('../src/klient.js');
  const geloescht = [];
  const fsys = { readdir: (o) => Promise.resolve(o.directory === 'EXTERNAL' && o.path === 'Pictures' ? { files: [{ name: 'JPEG_20261121_101500_12345678901234.jpg', type: 'file' }, { name: 'JPEG_20261121_101501_9.jpg', type: 'file' }, { name: 'Urlaub.jpg', type: 'file' }, { name: 'JPEG_20261121_101500_1.jpg', type: 'directory' }, 'JPEG_2026_x.jpg', { name: 'JPEG_20261121_101500_1.png', type: 'file' }] } : { files: [] }), deleteFile: (o) => { geloescht.push(o.directory + ':' + o.path); return Promise.resolve(); } };
  const anzahl = await Klient.fotosAufraeumen(fsys);
  ck('[qr-foto] nur Kamerafotos (JPEG_Datum_Zeit_Zahl.jpg) im App-Bilderordner gelöscht', anzahl === 2 && geloescht.join() === 'EXTERNAL:Pictures/JPEG_20261121_101500_12345678901234.jpg,EXTERNAL:Pictures/JPEG_20261121_101501_9.jpg', geloescht);
  ck('[qr-foto] Lesefehler, Löschfehler, kein Plugin: kein Absturz', (await Klient.fotosAufraeumen({ readdir: () => Promise.reject(new Error('x')), deleteFile: () => Promise.resolve() })) === 0 && (await Klient.fotosAufraeumen(null)) === 0 && (await Klient.fotosAufraeumen({ readdir: () => Promise.resolve({ files: ['JPEG_20261121_101500_1.jpg'] }), deleteFile: () => Promise.reject(new Error('gesperrt')) })) === 0);
  ck('[qr-foto] App: nach dem Einlesen des QR-Fotos und beim Start (nur Android) aufgerufen', /fotoWeg: function \(\) \{ if \(androidApp\(\) && window\.Klient\) Klient\.fotosAufraeumen\(plug\('Filesystem'\)\); \}/.test(app) && /if \(androidApp\(\) && window\.Klient\) Klient\.fotosAufraeumen\(plug\('Filesystem'\)\);/.test(app));
  // Weitergabe: nach dem Lesen des Fotos (Erfolg oder Fehler) wird ui.fotoWeg aufgerufen
  {
    const dq = new JSDOM('<!doctype html><body><input type="file" id="kwFotoEin"><button id="kwScan"></button></body>', { runScripts: 'outside-only' });
    const g = dq.window; let weg = 0;
    const alt = { document: globalThis.document, window: globalThis.window };
    globalThis.document = g.document; globalThis.window = g;
    try {
      delete require.cache[require.resolve('../src/weitergabe.js')];
      const W = require('../src/weitergabe.js');
      W.importInit({ t: (k) => k, bereit: () => true, fotoWeg: () => { weg++; } });
      const ein = g.document.getElementById('kwFotoEin');
      Object.defineProperty(ein, 'files', { value: [{ size: 10, type: 'text/plain' }], configurable: true });
      ein.dispatchEvent(new g.Event('change'));
      await warte(20);
      ck('[qr-foto] Weitergabe ruft nach dem Lesen fotoWeg auf (auch wenn kein Code erkannt wurde)', weg === 1, weg);
    } finally { globalThis.document = alt.document; globalThis.window = alt.window; }
  }

  // P6: Lesefehler (iOS-Speicher lehnt ab) wird nicht als „leer“ behandelt: Hinweis, nichts geschrieben, später geladen
  {
    const mem = { 'lotse.state': JSON.stringify({ s: { miete: '777' }, p: { name: 'Echt' } }), 'lotse.vorgaenge': JSON.stringify({ v: 1, tage: 0, klar: { aktiv: 'a1', liste: [{ id: 'a1', name: 'Echt', erstellt: 1, geaendert: 1, daten: null }] } }), 'lotse.ack': '1' };
    const vorher = JSON.stringify(mem); let kaputt = true; const geschrieben = [];
    const err3 = [];
    const dom3 = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
      runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(w3) {
        w3.addEventListener('error', (e) => err3.push(String(e.error || e.message)));
        w3.HTMLElement.prototype.scrollIntoView = function () {}; w3.scrollTo = function () {};
        const Preferences = {
          get: (o) => (kaputt && (o.key === 'lotse.vorgaenge' || o.key.startsWith('lotse.state')) ? Promise.reject(new Error('nicht lesbar')) : Promise.resolve({ value: o.key in mem ? mem[o.key] : null })),
          set: (o) => { if (kaputt) return Promise.reject(new Error('nicht schreibbar')); geschrieben.push(o.key); mem[o.key] = o.value; return Promise.resolve(); },
          remove: (o) => { if (kaputt) return Promise.reject(new Error('nicht schreibbar')); geschrieben.push('-' + o.key); delete mem[o.key]; return Promise.resolve(); }
        };
        w3.Capacitor = { Plugins: { Preferences } };
        Object.defineProperty(w3, 'crypto', { value: require('crypto').webcrypto, configurable: true });
      }
    });
    await warte(400);
    const d3 = dom3.window.document, T3 = require('../dist/i18n.js').de;
    const hinweis = () => d3.getElementById('vgFehler');
    ck('[lesefehler] Hinweis „gerade nicht lesbar“ statt leerer App', !!hinweis() && !hinweis().hidden && Object.values(require('../dist/i18n.js')).some((l) => l['vg.lesefehler'] === hinweis().textContent) && T3['vg.lesefehler'].length > 20, hinweis() && hinweis().textContent);
    ck('[lesefehler] nichts überschrieben, keine Angaben gelöscht', JSON.stringify(mem) === vorher && !geschrieben.some((k) => /lotse\.(vorgaenge|state)/.test(k)), geschrieben);
    kaputt = false;
    d3.dispatchEvent(new dom3.window.Event('visibilitychange'));
    await warte(400);
    ck('[lesefehler] wieder lesbar: Angaben geladen, Hinweis weg', d3.getElementById('miete').value === '777' && d3.getElementById('p-name').value === 'Echt' && hinweis().hidden, [d3.getElementById('miete').value, hinweis() && hinweis().hidden]);
    // S7: neue PIN in der Oberfläche: zu leicht → Meldung, nichts gespeichert
    const sw = d3.getElementById('vgPinSchalter');
    if (sw) {
      sw.click();
      const p1 = d3.getElementById('vgPin1'), p2 = d3.getElementById('vgPin2');
      if (p1 && p2) {
        p1.value = '123456'; p2.value = '123456';
        d3.getElementById('vgPinForm').dispatchEvent(new dom3.window.Event('submit', { bubbles: true, cancelable: true }));
        await warte(50);
        ck('[pin-staerke] Oberfläche: 123456 abgelehnt mit verständlicher Meldung, keine PIN gespeichert', d3.getElementById('vgPinForm').textContent.includes('123456') && !/"pin"/.test(mem['lotse.vorgaenge'] || ''));
        p1.value = '4711'; p2.value = '4711';
        d3.getElementById('vgPinForm').dispatchEvent(new dom3.window.Event('submit', { bubbles: true, cancelable: true }));
        await warte(50);
        ck('[pin-staerke] Oberfläche: 4 Ziffern abgelehnt (mindestens 6)', /6 (bis|to|ile) 12/.test(d3.getElementById('vgPinForm').textContent) && !/"pin"/.test(mem['lotse.vorgaenge'] || ''));
        const ab2 = d3.getElementById('vgPinAbbr'); if (ab2) ab2.click();
      } else ck('[pin-staerke] Oberfläche: Feld für neue PIN', false);
    } else ck('[pin-staerke] Oberfläche: Schalter PIN-Sperre vorhanden', false);
    ck('[lesefehler] keine Skriptfehler', err3.length === 0, err3.join('; '));
    dom3.window.close();
  }
}
