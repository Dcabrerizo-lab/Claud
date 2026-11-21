// Foto-Simulation für „Brief einlesen“ (nur Bericht, kein Pflichttest):
// Die Muster-Bescheide aus test/erweiterungen/muster/ werden als Bild gerendert wie ein Handyfoto (Schrägstellung, Unschärfe,
// Helligkeit, Knickschatten, JPEG-Artefakte), dann mit tesseract.js (Sprache deu) gelesen – als Stellvertreter für die Texterkennung
// des Handys (ML Kit / Vision, im Test nicht verfügbar) – und durch erweiterungen/brief-lesen.js bzw. pflege-import.js geschickt.
// Ausgabe: Anteil richtig erkannter Felder je Bescheid-Art und Stärke. Bilder und erkannte Texte in <Ausgabeordner>.
//
// Aufruf: node tools/scan-muster.js [Ausgabeordner]
//         node tools/scan-muster.js --pdf <Ordner mit den Original-PDFs>   (PDF-Weg der App: pdf.js 3.11 + pdfZeilen aus src/app.js)
//         PDFJS_DIR=<…/node_modules/pdfjs-dist> (Standard: app/node_modules/pdfjs-dist)
// tesseract.js und @tesseract.js-data/deu sind keine Abhängigkeit des Projekts. Einmalig außerhalb des Repos installieren:
//   mkdir -p ~/scan-tools && cd ~/scan-tools && npm init -y && npm install tesseract.js @tesseract.js-data/deu
// und TESSERACT_DIR=~/scan-tools/node_modules setzen (Standard: /home/claude/scan-tools/node_modules).
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const L = require('../erweiterungen/brief-lesen.js');
const I = require('../erweiterungen/pflege-import.js');
const P = require('../erweiterungen/pflege.js');

const MUSTER = path.join(__dirname, '..', 'test', 'erweiterungen', 'muster');
const AUS = path.resolve(process.argv[2] || path.join(require('os').tmpdir(), 'scan-muster'));
const TD = process.env.TESSERACT_DIR || '/home/claude/scan-tools/node_modules';
const LANG = path.join(TD, '@tesseract.js-data', 'deu', '4.0.0_best_int');
let Tesseract;

// PDF-Weg der App ohne Foto: Original-PDF mit pdf.js lesen, Zeilen wie in der App bilden (Funktion pdfZeilen aus src/app.js)
const PDF_DATEI = { 'jc-buergergeld-nuernberg.txt': 'buergergeld-bescheid-muster.pdf', 'wg-frankfurt.txt': 'Musterbescheid_Wohngeld.pdf', 'sa-frankfurt.txt': 'Musterbescheid_Grundsicherung.pdf', 'vm-verbraucherzentrale.txt': 'Beispiel-Nebenkostenabrechnung-gesamt.pdf', 'vm-docutain.txt': 'Muster_Nebenkostenabrechnung.pdf', 'fk-merkblatt-beispiel.txt': 'kiz2-merkblattkinderzuschlag_ba015395.pdf' };
async function pdfWeg(ordner) {
  const app = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');
  const m = app.match(/function pdfZeilen\(items\) \{[\s\S]*?\n {2}\}/);
  if (!m) throw new Error('pdfZeilen nicht in src/app.js gefunden');
  const pdfZeilen = new Function(m[0] + '\nreturn pdfZeilen;')();
  // pdf.js ab Version 4 nur noch als ES-Modul (legacy/build/pdf.mjs): per import() laden
  const pdfjs = await import(require('url').pathToFileURL(path.join(process.env.PDFJS_DIR || path.join(__dirname, '..', 'app', 'node_modules', 'pdfjs-dist'), 'legacy', 'build', 'pdf.mjs')).href);
  for (const fa of require(path.join(MUSTER, 'erwartet.json'))) {
    const datei = path.join(ordner, PDF_DATEI[fa.datei]);
    if (!fs.existsSync(datei)) { console.log('fehlt:', datei); continue; }
    const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(datei)), isEvalSupported: false }).promise;
    const texte = [];
    for (let i = 1; i <= Math.min(doc.numPages, 20); i++) texte.push(pdfZeilen((await (await doc.getPage(i)).getTextContent()).items));
    if (process.env.DUMP) fs.writeFileSync(path.join(process.env.DUMP, fa.datei), texte.join('\n'));
    const r = L.lies(texte.join('\n'), fa.fest || null);
    const falsch = Object.entries(fa.felder).filter(([id, soll]) => !(typeof soll === 'number' ? Math.abs(r.felder[id] - soll) < 0.005 : r.felder[id] === soll)).map(([id, soll]) => `${id}: ${r.felder[id] === undefined ? 'leer' : JSON.stringify(r.felder[id])} statt ${JSON.stringify(soll)}`);
    console.log(`PDF    ${fa.datei.padEnd(30)} Art ${r.art === fa.art ? 'ok' : 'FALSCH (' + r.art + ')'}  Datum ${fa.datum ? (r.datum === fa.datum ? 'ok' : 'falsch') : '-'}  Felder ${Object.keys(fa.felder).length - falsch.length}/${Object.keys(fa.felder).length}  ${falsch.join('; ')}`);
  }
}

const lade = (d) => fs.readFileSync(path.join(MUSTER, d), 'utf8').split('\n').filter((z) => !z.startsWith('# ')).join('\n');
// Stärken: wie ein ordentliches Handyfoto und wie ein schlechtes (schief, unscharf, dunkel, Knick)
const STAERKEN = {
  leicht: { grad: 2, blur: 0.5, hell: 0.97, kontrast: 0.95, knick: 0.10, jpeg: 70 },
  stark: { grad: 5, blur: 1.1, hell: 0.85, kontrast: 0.8, knick: 0.30, jpeg: 35 }
};

function seiteHtml(text, s) {
  const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<!doctype html><html><body style="margin:0;background:#6b6b6b;width:1900px">
  <div style="position:relative;margin:60px;background:#fbfaf6;padding:50px;transform:rotate(${s.grad}deg);transform-origin:50% 0;
    filter:blur(${s.blur}px) brightness(${s.hell}) contrast(${s.kontrast});box-shadow:0 0 30px rgba(0,0,0,.5)">
    <pre style="margin:0;font:19px/1.35 'DejaVu Sans Mono',monospace;color:#1a1a1a;white-space:pre">${esc(text)}</pre>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,transparent 47%,rgba(0,0,0,${s.knick}) 50%,transparent 53%)"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 20% 10%,rgba(255,255,255,.18),transparent 60%)"></div>
  </div></body></html>`;
}

async function main() {
  if (process.argv[2] === '--pdf') return pdfWeg(path.resolve(process.argv[3] || '.'));
  try { Tesseract = require(path.join(TD, 'tesseract.js')); } catch (e) { console.log('tesseract.js nicht gefunden (' + TD + '). Siehe Kopf der Datei.'); process.exit(2); }
  fs.mkdirSync(AUS, { recursive: true });
  const FAELLE = require(path.join(MUSTER, 'erwartet.json'));
  // Pflegegutachten: Formular mit dem Ergebnis als Wort in jeder Kriterienzeile (wie im Gutachten) und mit Punktwerten
  const WAHL = { '1.1': 1, '1.2': 2, '1.3': 0, '1.4': 3, '1.5': 3, '2.1': 0, '2.2': 1, '2.4': 2, '2.8': 3, '3.1': 2, '3.2': 1, '3.10': 3, '4.1': 1, '4.3': 2, '4.8': 1, '4.9': 2, '4.10': 3, '6.1': 2, '6.6': 1 };
  const form = lade('pk-bri-formular.txt');
  const pflegeFassung = (wort) => { let aktiv = null; return form.split('\n').map((z) => {
    const m = z.match(/^\s*(4\.[1-6]\.\d{1,2})\b/); if (m) aktiv = m[1].slice(2);
    if (!/\s0\s+\d\s+\d\s+\d\s*$/.test(z)) return z;
    const id = m ? m[1].slice(2) : aktiv, w = WAHL[id], k = P.KRITERIEN.find((x) => x.id === id);
    if (w == null || !k) return z.replace(/\s0\s+\d\s+\d\s+\d\s*$/, '');
    return z.replace(/\s0\s+\d\s+\d\s+\d\s*$/, '      ' + (wort ? P.SKALA[k.s].stufen[w] : P.SKALA[k.s].punkte[w] * (k.faktor || 1)));
  }).join('\n'); };

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1900, height: 1000 } });
  const worker = await Tesseract.createWorker('deu', 1, { langPath: LANG, gzip: true, cachePath: path.join(AUS, '.cache') });
  async function foto(text, name, s) {
    const seiten = text.split('\f').filter((x) => x.trim());
    const out = [];
    for (let i = 0; i < seiten.length; i++) {
      await page.setContent(seiteHtml(seiten[i], s));
      const datei = path.join(AUS, `${name}-${i + 1}.jpg`);
      await page.screenshot({ path: datei, type: 'jpeg', quality: s.jpeg, fullPage: true });
      const r = await worker.recognize(datei);
      out.push(r.data.text);
    }
    const t = out.join('\n');
    fs.writeFileSync(path.join(AUS, name + '.txt'), t);
    return t;
  }

  const zeilen = [];
  for (const [stufe, s] of Object.entries(STAERKEN)) {
    for (const fa of FAELLE) {
      const t = await foto(lade(fa.datei), `${fa.datei.replace('.txt', '')}-${stufe}`, s);
      const r = L.lies(t, fa.fest || null);
      const falsch = [];
      let richtig = 0;
      for (const [id, soll] of Object.entries(fa.felder)) {
        const ist = r.felder[id];
        if (typeof soll === 'number' ? Math.abs(ist - soll) < 0.005 : ist === soll) richtig++;
        else falsch.push(`${id}: ${ist === undefined ? 'leer' : JSON.stringify(ist)} statt ${JSON.stringify(soll)}`);
      }
      const datumOk = fa.datum ? r.datum === fa.datum : null;
      zeilen.push({ stufe, datei: fa.datei, art: r.art === fa.art, datum: datumOk, richtig, von: Object.keys(fa.felder).length, falsch });
      console.log(`${stufe.padEnd(6)} ${fa.datei.padEnd(30)} Art ${r.art === fa.art ? 'ok' : 'FALSCH (' + r.art + ')'}  Datum ${datumOk == null ? '-' : datumOk ? 'ok' : 'falsch'}  Felder ${richtig}/${Object.keys(fa.felder).length}  ${falsch.join('; ')}`);
    }
    for (const [fass, wort] of [['Wort', true], ['Punktwert', false]]) {
      const t = await foto(pflegeFassung(wort), `pk-${fass}-${stufe}`, s);
      const im = I.lies(t, P);
      const falsch = Object.entries(WAHL).filter(([id, i]) => im.stufen[id] !== i).map(([id, i]) => `${id}: ${im.stufen[id] === undefined ? 'leer' : im.stufen[id]} statt ${i}`);
      const erfunden = Object.keys(im.stufen).filter((id) => WAHL[id] == null);
      const richtig = Object.keys(WAHL).length - falsch.length;
      zeilen.push({ stufe, datei: `pk-bri-formular (${fass})`, art: true, datum: null, richtig, von: Object.keys(WAHL).length, falsch: falsch.concat(erfunden.map((x) => x + ': erfunden')) });
      console.log(`${stufe.padEnd(6)} Pflegegutachten (${fass})`.padEnd(38) + `Kriterien ${richtig}/${Object.keys(WAHL).length}  erfunden ${erfunden.length}  ${falsch.join('; ')}`);
    }
  }
  await worker.terminate();
  await browser.close();
  fs.writeFileSync(path.join(AUS, 'ergebnis.json'), JSON.stringify(zeilen, null, 1));
  console.log('Ergebnis: ' + path.join(AUS, 'ergebnis.json'));
}
main().catch((e) => { console.error(e); process.exit(1); });
