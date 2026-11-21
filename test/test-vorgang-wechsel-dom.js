// Sicherheitsprüfung S4 (21.11.2026): Beim Wechsel des Vorgangs bleibt nichts vom vorigen sichtbar
// (Scan-Ergebnis, Vorschau, eingefügter Brieftext, Ergebnis von „Brief prüfen“, Felder der Prüfung, geöffnete Kachel).
// Dazu S2: Bildschirmfoto-Schutz folgt der App-PIN und der Einstellung „Bildschirmfotos erlauben“ (Plugin SoloSchutz nur gespielt).
// Läuft mit der fertigen Web-Version (dist) in JSDOM. Aufruf: node test/test-vorgang-wechsel-dom.js
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const { webcrypto } = require('crypto');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const BRIEF = fs.readFileSync(path.join(__dirname, 'erweiterungen', 'muster', 'jc-buergergeld-nuernberg.txt'), 'utf8');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

function seite(mem, schutz) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      w.confirm = () => true;
      Object.defineProperty(w, 'crypto', { value: webcrypto, configurable: true });
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
      if (schutz) w.Capacitor = { Plugins: { SoloSchutz: { setzen: (o) => { schutz.push(o.an); return Promise.resolve(); } } } };
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors };
}
const klick = (s, el) => el.dispatchEvent(new s.w.MouseEvent('click', { bubbles: true }));
const ordner = (s) => klick(s, s.d.querySelector('#appnav [data-ansicht="ordner"]'));
const anlegen = (s, name) => { ordner(s); s.d.getElementById('vgPlus').click(); s.d.getElementById('vgNameNeu').value = name; s.d.getElementById('vgNeuForm').dispatchEvent(new s.w.Event('submit', { bubbles: true, cancelable: true })); };
const wechsel = (s, name) => { ordner(s); s.d.querySelector('#setHaushalte button.vg-zeile[data-vg-name="' + name + '"]').click(); };

(async () => {
  // ---------- S4: Vorgang A mit Brief und Scan, Wechsel zu B ----------
  const mem = { 'lotse.ack': '1', 'lotse-lang': 'de' };
  const s = seite(mem), { d } = s, $ = (id) => d.getElementById(id);
  await warte(50);
  anlegen(s, 'Klient A'); await warte(20);
  // Brief prüfen → Jobcenter → Text einfügen und lesen
  klick(s, $('goBriefe')); klick(s, $('brief-jc'));
  if ($('elPasteBox').hidden) klick(s, $('elPaste'));
  $('elText').value = BRIEF; klick(s, $('elLesen'));
  const erkannt = d.querySelectorAll('#p-bescheid .pp-erkannt').length;
  const werteA = [...d.querySelectorAll('#p-bescheid input[type="number"], #p-bescheid input[type="date"]')].filter((i) => i.value !== '').length;
  ck('[wechsel] Vorbereitung: Brief in A gelesen (Werte erkannt, Meldung, Kachel offen)', erkannt > 0 && werteA > 0 && $('elMsg').textContent !== '' && !$('checkBox').hidden, [erkannt, werteA, $('elMsg').textContent]);
  // Antragsformular: Text einfügen → Scan-Ergebnis
  $('sc-text').value = 'Name: Erika Muster\nGeburtsdatum: 01.02.1980\nAnschrift: Musterweg 1\nTelefon: 0911 123456';
  klick(s, $('sc-local'));
  ck('[wechsel] Vorbereitung: Scan-Ergebnis in A sichtbar', $('sc-result') ? $('sc-result').textContent.trim() !== '' : d.querySelectorAll('.sc-row').length > 0);
  // Wechsel: neuer Vorgang B
  anlegen(s, 'Klient B'); await warte(20);
  const bs = [...d.querySelectorAll('section[id^="p-"] input[type="number"], section[id^="p-"] input[type="date"], section[id^="p-"] input[type="text"]')].filter((i) => i.value !== i.defaultValue && !/-(name|anschrift|ort)$/.test(i.id));
  ck('[wechsel] B: keine Werte aus dem Brief von A in den Prüfungen', bs.length === 0, bs.map((i) => i.id + '=' + i.value).slice(0, 8));
  ck('[wechsel] B: keine gelben Markierungen „erkannt“', d.querySelectorAll('.pp-erkannt').length === 0);
  ck('[wechsel] B: eingefügter Brieftext leer, Feld zu', $('elText').value === '' && $('elPasteBox').hidden && $('elPaste').getAttribute('aria-expanded') === 'false');
  ck('[wechsel] B: Meldung und Ergebnis von „Brief prüfen“ leer', $('elMsg').textContent === '' && $('elErg').textContent === '');
  ck('[wechsel] B: keine Kachel mehr offen (Absender-Auswahl)', $('checkBox').hidden && !$('briefKacheln').hidden);
  ck('[wechsel] B: Scan-Ergebnis, Vorschau und eingefügter Formulartext leer', d.querySelectorAll('.sc-row, .sc-bild').length === 0 && $('sc-text').value === '' && $('sc-msg').textContent === '');
  ck('[wechsel] B: Personenzeile der Jobcenter-Prüfung wieder leer (eine Zeile)', $('bs-personen').children.length === 1 && [...$('bs-personen').querySelectorAll('input')].every((i) => i.type === 'checkbox' ? !i.checked : i.value === ''));
  ck('[wechsel] B: keine Schreiben aus A', [...d.querySelectorAll('section[id^="p-"] textarea')].every((t) => t.value === ''));
  ck('[wechsel] B: Absender aus dem Brief von A in keinem Feld', ![...d.querySelectorAll('#checkBox input, #checkBox textarea')].some((i) => /Richard-Wagner-Platz/.test(i.value)));
  // zurück zu A: der Brief wurde nie gespeichert, also auch dort leer
  wechsel(s, 'Klient A'); await warte(20);
  ck('[wechsel] zurück zu A: Brieftext wurde nicht gespeichert', $('elText').value === '' && d.querySelectorAll('.pp-erkannt').length === 0);
  ck('[wechsel] Brieftext steht in keinem Speicher', !Object.values(mem).some((v) => typeof v === 'string' && v.indexOf('Erika Muster') >= 0 && v.indexOf('0911 123456') >= 0));
  ck('[wechsel] keine Fehler', s.errors.length === 0, s.errors);

  // ---------- S2: Bildschirmfoto-Schutz ----------
  const schutz = [], mem2 = { 'lotse.ack': '1', 'lotse-lang': 'de' };
  const t = seite(mem2, schutz), $$ = (id) => t.d.getElementById(id);
  await warte(50);
  ck('[schutz] ohne PIN aus', schutz.length > 0 && schutz[schutz.length - 1] === false, schutz);
  // PIN setzen
  klick(t, t.d.querySelector('#appnav [data-ansicht="einst"]'));
  const zeile = t.d.querySelector('#einstListe .zeile[data-seite="sicher"]'); klick(t, zeile);
  klick(t, $$('vgPinSchalter'));
  $$('vgPin1').value = '482915'; $$('vgPin2').value = '482915';
  $$('vgPinForm').dispatchEvent(new t.w.Event('submit', { bubbles: true, cancelable: true }));
  for (let i = 0; i < 100 && schutz[schutz.length - 1] !== true; i++) await warte(50);
  ck('[schutz] mit PIN an', schutz[schutz.length - 1] === true, schutz);
  const fs2 = $$('vgFotos');
  ck('[schutz] Schalter „Bildschirmfotos erlauben“ da, aus', !!fs2 && fs2.getAttribute('role') === 'switch' && fs2.getAttribute('aria-checked') === 'false' && /Bildschirmfotos erlauben/.test(fs2.textContent));
  if (fs2) klick(t, fs2);
  ck('[schutz] erlaubt: Schutz aus, Einstellung gespeichert (ohne Inhalt)', schutz[schutz.length - 1] === false && mem2['lotse.fotosErlaubt'] === '1' && $$('vgFotos').getAttribute('aria-checked') === 'true');
  if ($$('vgFotos')) klick(t, $$('vgFotos'));
  ck('[schutz] wieder verboten: Schutz an', schutz[schutz.length - 1] === true && mem2['lotse.fotosErlaubt'] === '0');
  ck('[schutz] ohne Plugin (Web) kein Schalter', !seite({ 'lotse.ack': '1' }).d.getElementById('vgFotos'));
  ck('[schutz] keine Fehler', t.errors.length === 0, t.errors);

  console.log(`test-vorgang-wechsel-dom: ${n - fails}/${n} ok`);
  process.exit(fails ? 1 : 0);
})();
