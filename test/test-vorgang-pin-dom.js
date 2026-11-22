// Einzelne Vorgänge mit PIN sperren, in der Oberfläche („Mein Ordner“): Sperren, Liste neutral mit Schloss, Öffnen mit PIN
// (falsche PIN), nach dem Wechsel wieder gesperrt, Sperre aufheben, Löschen ohne PIN, Kurzname nur als Text (kein HTML).
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { webcrypto } = require('crypto');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const bis = async (fn, ms) => { const ende = Date.now() + (ms || 15000); while (Date.now() < ende) { if (fn()) return true; await warte(40); } return false; };

const alt = { s: { adults: 1, kids: 0, miete: 640, mietstufe: '3', bezug: {} }, p: { name: 'Erika Geheim' }, e: true };
const mem = { 'lotse.state': JSON.stringify(alt), 'lotse.ack': '1', 'lotse-lang': 'de' };
const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    w.confirm = () => true; w.__xss = 0;
    Object.defineProperty(w, 'crypto', { value: webcrypto, configurable: true });
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window, d = w.document;
const submit = (form) => form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
const knopf = (root, text) => [...root.querySelectorAll('button')].find((b) => b.textContent === text);
const zeileVon = (name) => { const z = d.querySelector('#setHaushalte [data-vg-name="' + name + '"]'); return z && z.closest('li'); };
const bearbeiten = () => { const b = d.getElementById('vgBearb'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); };
const speicherText = () => Object.values(mem).join('\n');
// Kurze Werte wie „640“ nur als eigenes Wort suchen: Base64-Geheimtext und Zeitstempel enthalten die drei Zeichen zufällig,
// Klartext im JSON stünde zwischen Trennzeichen ("miete":640,) – so bleibt die Prüfung scharf, ohne falschen Alarm (wie test-fristen-dom.js)
const klarImSpeicher = (wert) => new RegExp('(?<![A-Za-z0-9+/=])' + wert + '(?![A-Za-z0-9+/=])').test(speicherText());

(async () => {
  ck('[vorgang-pin-dom] lädt ohne Skriptfehler', errors.length === 0, errors.join(' | '));
  // Ein Vorgang ohne Namen: kein Sperren-Knopf; mit Namen: „Mit PIN sperren“ im Kopf
  ck('[vorgang-pin-dom] ein Vorgang ohne Namen: kein Sperren', !d.getElementById('vgGSperrenEins'));
  d.getElementById('vgPlus').click(); d.getElementById('vgNameNeu').value = 'Zweiter'; submit(d.getElementById('vgNeuForm'));
  await warte(50);
  d.querySelector('#setHaushalte button.vg-zeile[data-vg-name="Ohne Namen"]').click();
  bearbeiten();
  knopf(zeileVon('Ohne Namen'), 'Umbenennen').click();
  zeileVon('Ohne Namen').querySelector('.vg-umb input').value = 'Familie Geheim';
  submit(zeileVon('Ohne Namen').querySelector('.vg-umb'));
  await warte(50);
  ck('[vorgang-pin-dom] vorher: Angaben geöffnet und im Klartext', d.getElementById('miete').value === '640' && speicherText().includes('Erika Geheim'));

  // Sperren
  bearbeiten();
  knopf(zeileVon('Familie Geheim'), 'Mit PIN sperren').click();
  const f = d.getElementById('vgGForm');
  ck('[vorgang-pin-dom] Formular: PIN, PIN noch einmal, freiwilliger Kurzname, 4 kurze Sätze', !!f && f.querySelectorAll('input[type=password][inputmode=numeric]').length === 2 && !!d.getElementById('vgGKurz') && f.querySelectorAll('.vg-gerkl li').length === 4 && [...f.querySelectorAll('.vg-gerkl li')].every((li) => li.textContent.split(/\s+/).length <= 12));
  ck('[vorgang-pin-dom] Erklärung ohne falsche Zusage: Sichtschutz, kein Schutz gegen Fachleute', /Sichtschutz, kein Schutz gegen Fachleute/.test(f.textContent));
  ck('[vorgang-pin-dom] Erklärung nennt Verlust bei vergessener PIN', /PIN vergessen\? Dann ist der Vorgang verloren\./.test(f.textContent));
  ck('[vorgang-pin-dom] PIN-Feld beim Sperren: Hinweis „6 bis 8 Ziffern“', f.querySelector('label[for=vgGPin]').textContent === 'PIN für diesen Vorgang (6 bis 8 Ziffern)');
  d.getElementById('vgGPin').value = '12'; submit(f);
  ck('[vorgang-pin-dom] zu kurze PIN: Hinweis', /6 bis 8 Ziffern/.test(f.querySelector('.msg').textContent));
  d.getElementById('vgGPin').value = '4821'; d.getElementById('vgGPin2').value = '4821'; submit(f);
  ck('[vorgang-pin-dom] neue PIN mit 4 Ziffern: abgelehnt', /6 bis 8 Ziffern/.test(f.querySelector('.msg').textContent));
  d.getElementById('vgGPin').value = '123456'; d.getElementById('vgGPin2').value = '123456'; submit(f);
  ck('[vorgang-pin-dom] leicht zu ratende PIN: abgelehnt mit Meldung', /leicht zu erraten/.test(f.querySelector('.msg').textContent) && !d.querySelector('#setHaushalte .vg-gesperrt'));
  d.getElementById('vgGPin').value = '482910'; d.getElementById('vgGPin2').value = '482911'; submit(f);
  ck('[vorgang-pin-dom] verschiedene PINs: Hinweis', /verschieden/.test(f.querySelector('.msg').textContent));
  d.getElementById('vgGPin2').value = '482910'; d.getElementById('vgGKurz').value = '<img src=x onerror="window.__xss=1">';
  submit(f);
  await bis(() => !!d.querySelector('#setHaushalte .vg-gesperrt'));
  await warte(100);
  const g = d.querySelector('#setHaushalte .vg-gesperrt');
  ck('[vorgang-pin-dom] gesperrt: Liste zeigt neutralen Titel und Schloss', !!g && g.querySelector('b').textContent === 'Gesperrter Vorgang' && !!g.querySelector('.vg-schloss svg') && !d.getElementById('setHaushalte').textContent.includes('Familie Geheim'));
  ck('[vorgang-pin-dom] Kurzname nur als Text, kein HTML', g.textContent.includes('<img') && !g.querySelector('img') && w.__xss === 0);
  ck('[vorgang-pin-dom] gesperrt: ein anderer Vorgang ist geöffnet, Angaben weg vom Bildschirm', d.getElementById('miete').value === '' && d.getElementById('p-name').value === '');
  ck('[vorgang-pin-dom] gesperrt: Name und Angaben nicht im Gerätespeicher, PIN auch nicht', !speicherText().includes('Erika Geheim') && !speicherText().includes('Familie Geheim') && !speicherText().includes('482910') && !klarImSpeicher('640'));

  // Öffnen: falsche PIN, dann richtige
  g.querySelector('button.vg-zeile').click();
  const fo = d.getElementById('vgGForm');
  ck('[vorgang-pin-dom] PIN-Feld beim Öffnen ohne Längenangabe (ältere PINs mit 4 Ziffern öffnen weiter)', fo && fo.querySelector('label[for=vgGPin]').textContent === 'PIN für diesen Vorgang');
  ck('[vorgang-pin-dom] Tipp auf gesperrten Vorgang: nur PIN-Feld', !!fo && fo.querySelectorAll('input').length === 1 && !d.getElementById('vgGPin2'));
  d.getElementById('vgGPin').value = '000000'; submit(fo);
  await bis(() => /stimmt nicht/.test(fo.querySelector('.msg').textContent));
  ck('[vorgang-pin-dom] falsche PIN: Meldung, bleibt zu', /stimmt nicht/.test(fo.querySelector('.msg').textContent) && d.getElementById('miete').value === '');
  d.getElementById('vgGPin').value = '482910'; submit(fo);
  await bis(() => d.getElementById('miete').value === '640');
  ck('[vorgang-pin-dom] richtige PIN: Angaben geöffnet', d.getElementById('miete').value === '640' && d.getElementById('p-name').value === 'Erika Geheim');
  ck('[vorgang-pin-dom] geöffnet: Name sichtbar, Hinweis „wird wieder gesperrt“', /Familie Geheim/.test(d.querySelector('#setHaushalte .vg-offen').textContent) && /wieder gesperrt/.test(d.querySelector('#setHaushalte .vg-offen').textContent));
  d.getElementById('miete').value = '655'; d.getElementById('miete').dispatchEvent(new w.Event('input', { bubbles: true }));
  await warte(500);
  ck('[vorgang-pin-dom] geöffnet und geändert: trotzdem nichts im Klartext gespeichert', !speicherText().includes('Erika Geheim') && mem['lotse.state'] === undefined);

  // Wechseln: wieder gesperrt
  d.querySelector('#setHaushalte button.vg-zeile[data-vg-name="Zweiter"]').click();
  await warte(300);
  ck('[vorgang-pin-dom] nach dem Wechsel wieder gesperrt', !!d.querySelector('#setHaushalte .vg-gesperrt:not(.vg-offen)') && !d.getElementById('setHaushalte').textContent.includes('Familie Geheim') && d.getElementById('miete').value === '');

  // Sperre aufheben
  bearbeiten();
  const zg = d.querySelector('#setHaushalte .vg-gesperrt');
  ck('[vorgang-pin-dom] gesperrt in „Bearbeiten“: nur Sperre aufheben und Löschen', !!knopf(zg, 'Sperre aufheben') && !!knopf(zg, 'Löschen') && !knopf(zg, 'Umbenennen') && !knopf(zg, 'Kopie zum Ausprobieren'));
  knopf(zg, 'Sperre aufheben').click();
  d.getElementById('vgGPin').value = '482910'; submit(d.getElementById('vgGForm'));
  await bis(() => !d.querySelector('#setHaushalte .vg-gesperrt'));
  ck('[vorgang-pin-dom] Sperre aufgehoben: normaler Vorgang mit Namen', !d.querySelector('#setHaushalte .vg-gesperrt') && !!zeileVon('Familie Geheim') && /aufgehoben/.test(d.getElementById('vgMsg').textContent));
  d.querySelector('#setHaushalte button.vg-zeile[data-vg-name="Familie Geheim"]').click();
  await warte(100);
  ck('[vorgang-pin-dom] aufgehoben: Änderung aus der gesperrten Zeit ist da', d.getElementById('miete').value === '655');

  // Erneut sperren und ohne PIN löschen
  bearbeiten();
  knopf(zeileVon('Familie Geheim'), 'Mit PIN sperren').click();
  d.getElementById('vgGPin').value = '482917'; d.getElementById('vgGPin2').value = '482917'; submit(d.getElementById('vgGForm'));
  await bis(() => !!d.querySelector('#setHaushalte .vg-gesperrt'));
  bearbeiten();
  knopf(d.querySelector('#setHaushalte .vg-gesperrt'), 'Löschen').click();
  ck('[vorgang-pin-dom] Löschen: Rückfrage mit neutralem Titel', /Gesperrter Vorgang/.test(d.getElementById('loeschFrage').textContent) && !/Familie Geheim/.test(d.getElementById('loeschFrage').textContent));
  d.getElementById('loeschJa').click();
  await warte(100);
  ck('[vorgang-pin-dom] ohne PIN gelöscht', !d.querySelector('#setHaushalte .vg-gesperrt') && !speicherText().includes('"sperre"'));
  ck('[vorgang-pin-dom] keine Skriptfehler', errors.length === 0, errors.join(' | '));

  if (fails) { console.log(fails + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
  console.log('Vorgang-PIN-Oberflächentest bestanden: ' + n + ' Prüfungen');
  process.exit(0);
})();
