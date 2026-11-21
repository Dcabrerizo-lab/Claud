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

  // ---------- S4, unabhängige Prüfung 21.11.2026: weitere Reste (Name in den Schreiben, Empfänger der Mappe, Ergebnisblatt, Pflege-Einschätzung) ----------
  {
    const mem3 = { 'lotse.ack': '1', 'lotse-lang': 'de', 'lotse.beratung': '1' };
    const u = seite(mem3), e = (id) => u.d.getElementById(id), tippe = (el, v) => { el.value = v; el.dispatchEvent(new u.w.Event('input', { bubbles: true })); };
    await warte(50);
    e('p1').click(); await warte(20); // Beispiel (Testhilfe) im ersten, namenlosen Vorgang
    tippe(e('p-name'), 'Anton Vorher'); tippe(e('p-strasse'), 'Altgasse 7'); tippe(e('p-ort'), '91056 Erlangen');
    // Antragsmappe: Empfänger eines Briefs selbst ändern
    e('mappeMake').click();
    const empf = u.d.querySelector('#mappeBody textarea[data-empf]');
    ck('[wechsel2] Vorbereitung: Mappe mit Brief und Empfängerfeld', !!empf && /Anton Vorher/.test(e('mappeText').value), e('mappeBody').textContent.slice(0, 80));
    const empfId = empf ? empf.getAttribute('data-empf') : '';
    if (empf) tippe(empf, 'Amt von Anton\nGeheimweg 9\n91056 Erlangen');
    // Ergebnisblatt mit Kürzel
    klick(u, e('mappeClose') || u.d.querySelector('#mappe .nav-zurueck, #mappe button'));
    if (e('ebOpen') && !e('ebOpen').hidden) { e('ebOpen').click(); tippe(e('ebKuerzel'), 'AV-77'); }
    ck('[wechsel2] Vorbereitung: Ergebnisblatt mit Kürzel', /AV-77/.test(e('ebSeite').textContent), e('ebSeite').textContent.slice(0, 60));
    // Pflegegrad-Einschätzung begonnen
    u.w.SoLoPflegeStart(); await warte(10);
    if (e('pa-jahre')) tippe(e('pa-jahre'), '77');
    ck('[wechsel2] Vorbereitung: Pflegegrad-Einschätzung gezeichnet', e('pflegeAssist').children.length > 0 && !!e('pa-jahre'));
    // Brief prüfen → Jobcenter geöffnet: Name und Anschrift stehen im Schreiben
    klick(u, e('goBriefe')); klick(u, e('brief-jc'));
    ck('[wechsel2] Vorbereitung: Name von A im Schreiben der Prüfung', e('bs-name').value === 'Anton Vorher' && e('bs-anschrift').value === 'Altgasse 7');
    // Vermögens-Helfer offen
    if (e('vaBtn')) e('vaBtn').click();
    anlegen(u, 'Klient B'); await warte(30);
    const mitA = [...u.d.querySelectorAll('input, textarea')].filter((i) => /Anton Vorher|Altgasse 7|Geheimweg 9|AV-77/.test(i.value)).map((i) => i.id || i.name);
    ck('[wechsel2] B: Name, Anschrift, Empfänger und Kürzel von A in keinem Feld (auch nicht in den Schreiben der Prüfungen)', mitA.length === 0, mitA);
    const sichtText = e('app').textContent;
    ck('[wechsel2] B: nichts von A im Text der Seite', !/Anton Vorher|Altgasse 7|Geheimweg 9|AV-77/.test(sichtText), (sichtText.match(/.{30}(Anton Vorher|Altgasse 7|Geheimweg 9|AV-77).{20}/) || [''])[0]);
    ck('[wechsel2] B: Ergebnisblatt zu und leer, Kürzel leer', e('ergBlatt').hidden && e('ebKuerzel').value === '' && e('ebSeite').textContent === '');
    ck('[wechsel2] B: Mappe leer (Briefe und Kopiertext)', e('mappe').hidden && e('mappeBody').textContent === '' && e('mappeText').value === '');
    ck('[wechsel2] B: Pflegegrad-Einschätzung von A nicht mehr gezeichnet', e('pflegeAssist').children.length === 0);
    u.w.location.hash = '#pflege'; await warte(20);
    ck('[wechsel2] B: „Zurück“ zur Einschätzung zeigt keine Antworten von A', e('v-pflege').hidden || !e('pa-jahre') || e('pa-jahre').value !== '77');
    ck('[wechsel2] B: Vermögens-Helfer zu und leer', !e('va') || (e('va').hidden && e('va').textContent === '' && e('vaBtn').getAttribute('aria-expanded') === 'false'));
    // In B dieselbe Mappe: Empfänger wieder der Vorschlag, nicht die Änderung aus A
    u.w.location.hash = '#leistungen'; await warte(10);
    e('p1').click(); await warte(20); // legt wegen des Namens „Klient B“ einen weiteren, leeren Vorgang an (noch ein Wechsel)
    e('mappeMake').click();
    const empf2 = empfId ? u.d.querySelector('#mappeBody textarea[data-empf="' + empfId + '"]') : null;
    ck('[wechsel2] Neuer Vorgang, gleiche Hilfe: Empfänger ist wieder der Vorschlag', !!empf2 && !/Geheimweg|Anton/.test(empf2.value) && !/Geheimweg|Anton Vorher/.test(e('mappeText').value), empf2 && empf2.value);
    ck('[wechsel2] keine Fehler', u.errors.length === 0, u.errors);
  }

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
  // Neustart mit PIN (gesperrt): Schutz schon auf dem Sperrbildschirm an; Einstellung „erlauben“ gilt nach dem Neustart weiter
  const schutzN = [], n1 = seite(mem2, schutzN); await warte(120);
  ck('[schutz] Neustart mit PIN: Sperrbildschirm, Schutz an', !!n1.d.getElementById('vgSperre') && !n1.d.getElementById('vgSperre').hidden && schutzN[schutzN.length - 1] === true, schutzN);
  mem2['lotse.fotosErlaubt'] = '1';
  const schutzE = [], n2 = seite(mem2, schutzE); await warte(120);
  ck('[schutz] Neustart mit PIN und „erlauben“: Schutz bleibt aus', !!n2.d.getElementById('vgSperre') && schutzE.length > 0 && schutzE[schutzE.length - 1] === false, schutzE); // kurz „an“ ist erlaubt (sichere Vorgabe, bis die Einstellung gelesen ist)
  mem2['lotse.fotosErlaubt'] = '0';
  // PIN ausschalten: Schutz geht aus, Schalter verschwindet
  if ($$('vgPinSchalter')) klick(t, $$('vgPinSchalter'));
  if ($$('vgPinAlt')) { $$('vgPinAlt').value = '482915'; }
  const pf = $$('vgPinForm'); if (pf) { const p1 = pf.querySelector('input'); if (p1) p1.value = '482915'; pf.dispatchEvent(new t.w.Event('submit', { bubbles: true, cancelable: true })); }
  for (let i = 0; i < 100 && schutz[schutz.length - 1] !== false; i++) await warte(50);
  ck('[schutz] PIN aus: Schutz aus, kein Schalter mehr', schutz[schutz.length - 1] === false && !$$('vgFotos'), schutz.slice(-3));
  ck('[schutz] ohne Plugin (Web) kein Schalter', !seite({ 'lotse.ack': '1' }).d.getElementById('vgFotos'));
  ck('[schutz] keine Fehler', t.errors.length === 0, t.errors);

  console.log(`test-vorgang-wechsel-dom: ${n - fails}/${n} ok`);
  process.exit(fails ? 1 : 0);
})();
