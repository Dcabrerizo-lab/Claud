// Vorgänge in der Oberfläche: Einstieg beim Ergebnis, Kürzel-Schild nur bei mehreren Vorgängen, Beispiel überschreibt keinen
// gespeicherten Vorgang, Wechseln, Kopie, PIN-Sperre mit Sperrbildschirm, falsche PIN, Speicherfehler, Wort „Profil“ nie sichtbar.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { webcrypto } = require('crypto');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

function seite(mem, opt) {
  opt = opt || {};
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      w.confirm = () => true;
      Object.defineProperty(w, 'crypto', { value: webcrypto, configurable: true });
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { if (opt.voll && k.startsWith('lotse.')) throw new Error('QuotaExceededError'); mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors, mem };
}
const submit = (s, form) => form.dispatchEvent(new s.w.Event('submit', { bubbles: true, cancelable: true }));
const knopf = (s, root, text) => [...root.querySelectorAll('button')].find((b) => b.textContent === text);

(async () => {
  const alt = { s: { adults: 1, kids: 0, ek1Art: 'lohn', ek1Brutto: 2100, ek1Netto: 1600, miete: 640, mietstufe: '3', vermoegen: 500, bezug: {} }, p: { name: 'Erika Muster' }, e: true };
  const mem = { 'lotse.state': JSON.stringify(alt), 'lotse.ack': '1', 'lotse-lang': 'de' };
  const s = seite(mem);
  const d = s.d;
  ck('[vorgaenge] lädt ohne Skriptfehler', s.errors.length === 0, s.errors.join(' | '));
  ck('[vorgaenge] alter Speicherstand übernommen', d.getElementById('miete').value === '640' && d.getElementById('p-name').value === 'Erika Muster');
  ck('[vorgaenge] ein Vorgang: kein Kürzel-Schild, kein Sperrbildschirm', d.getElementById('vgChip').hidden && !d.getElementById('vgSperre'));
  const res = d.getElementById('vgRes');
  ck('[vorgaenge] Einstieg „Vorgang speichern“ beim Ergebnis', res && !res.hidden && /Vorgang speichern/.test(res.textContent) && d.getElementById('vgNameRes'));
  ck('[vorgaenge] Verwaltung ganz oben in den Einstellungen', d.getElementById('pn-einst').firstElementChild.id === 'setHaushalte');

  // Speichern unter Namen
  d.getElementById('vgNameRes').value = '  Familie M.  ';
  submit(s, d.getElementById('vgNameRes').form);
  await warte(20);
  ck('[vorgaenge] gespeichert: Name im Speicher, Angaben weiter unter lotse.state', /Familie M\./.test(mem['lotse.vorgaenge'] || '') && JSON.parse(mem['lotse.state']).s.miete === 640);
  ck('[vorgaenge] nach dem Speichern: Bestätigung beim Ergebnis', /Gespeichert als „Familie M\.“/.test(d.getElementById('vgRes').textContent));
  ck('[vorgaenge] weiterhin kein Kürzel-Schild bei einem Vorgang', d.getElementById('vgChip').hidden);

  // Beispiel darf den gespeicherten Vorgang nicht überschreiben
  d.getElementById('p1').click();
  await warte(400);
  const st = JSON.parse(mem['lotse.vorgaenge']).klar;
  const fam = st.liste.find((v) => v.name === 'Familie M.');
  ck('[vorgaenge] Beispiel bei gespeichertem Vorgang: keine Rückfrage (überschreibt nichts)', d.getElementById('beispielDlg').hidden);
  ck('[vorgaenge] Beispiel öffnet einen neuen Vorgang', st.liste.length === 2 && st.aktiv !== fam.id);
  ck('[vorgaenge] gespeicherter Vorgang bleibt unverändert', JSON.parse(fam.daten['lotse.state']).s.miete === 640, fam.daten);
  ck('[vorgaenge] Beispiel ohne Antragsdaten des gespeicherten Vorgangs', d.getElementById('p-name').value === '');
  const chip = d.getElementById('vgChip');
  ck('[vorgaenge] zwei Vorgänge: Kürzel-Schild im Kopf', !chip.hidden && chip.textContent === 'Ohne Namen');

  // Wechseln über das Schild
  chip.click();
  ck('[vorgaenge] Schild öffnet die Auswahl', !d.getElementById('vgMenu').hidden);
  knopf(s, d.getElementById('vgMenu'), 'Familie M.').click();
  ck('[vorgaenge] Wechsel lädt Angaben und Antragsdaten', d.getElementById('miete').value === '640' && d.getElementById('p-name').value === 'Erika Muster' && chip.textContent === 'Familie M.');

  // Haushaltsplan (src/haushalt.js) je Vorgang
  const H = s.w.Haushalt, essen = () => (H.daten().plan.aus || {}).essen;
  H.laden({ plan: { aus: { essen: 30000 } } });
  ck('[vorgaenge] Haushaltsplan im geöffneten Vorgang gespeichert', /30000/.test(mem['lotse.haushalt'] || ''));
  knopf(s, d.getElementById('vgMenu'), 'Ohne Namen').click();
  ck('[vorgaenge] anderer Vorgang: eigener (leerer) Haushaltsplan', essen() === undefined);
  knopf(s, d.getElementById('vgMenu'), 'Familie M.').click();
  ck('[vorgaenge] zurück: Haushaltsplan des Vorgangs wieder da', essen() === 30000);
  ck('[vorgaenge] Löschen-Text nennt den Haushaltsplan', /Haushaltsplan und Haushaltsbuch/.test(d.getElementById('clearWas').textContent));

  // Alle Angaben löschen: Text nennt den Vorgang, Rückgängig stellt ihn wieder her, nach einem Wechsel nicht mehr
  ck('[vorgaenge] Löschen-Text nennt den geöffneten Vorgang', /nur der geöffnete Vorgang \(„Familie M\.“\)\. Alle Vorgänge löschst du in den Einstellungen/.test(d.getElementById('clearWas').textContent), d.getElementById('clearWas').textContent);
  const hk = d.querySelector('input[data-haken]'); hk.checked = true; hk.dispatchEvent(new s.w.Event('change', { bubbles: true }));
  ck('[vorgaenge] Haken der Checkliste gehören zum Vorgang', !!mem['lotse.haken'] && !!mem['lotse.pfaendung']);
  d.getElementById('clearBtn').click();
  ck('[vorgaenge] Löschen: ganzer Vorgang leer (Pfändung, Haken, Haushaltsplan)', !mem['lotse.pfaendung'] && !mem['lotse.haken'] && !d.querySelector('input[data-haken]:checked'), Object.keys(mem));
  ck('[vorgaenge] Löschen leert nur den geöffneten Vorgang (auch den Haushaltsplan)', d.getElementById('miete').value === '' && d.getElementById('p-name').value === '' && essen() === undefined && !d.getElementById('undoBar').hidden && chip.textContent === 'Familie M.');
  d.getElementById('undoBtn').click();
  await warte(20);
  ck('[vorgaenge] Rückgängig: Angaben des Vorgangs zurück und gespeichert', d.getElementById('miete').value === '640' && d.getElementById('p-name').value === 'Erika Muster' && JSON.parse(mem['lotse.state']).s.miete === 640);
  ck('[vorgaenge] Rückgängig: Pfändung und Haken zurück', !!mem['lotse.pfaendung'] && /true/.test(mem['lotse.haken'] || '') && !!d.querySelector('input[data-haken]:checked'));
  ck('[vorgaenge] Rückgängig: Haushaltsplan zurück und gespeichert', essen() === 30000 && /30000/.test(mem['lotse.haushalt'] || ''));
  d.getElementById('clearBtn').click();
  knopf(s, d.getElementById('vgMenu'), 'Ohne Namen').click();
  ck('[vorgaenge] Wechsel nach dem Löschen: Rückgängig-Leiste weg', d.getElementById('undoBar').hidden);
  knopf(s, d.getElementById('vgMenu'), 'Familie M.').click();
  ck('[vorgaenge] gelöschter Vorgang bleibt leer, anderer Vorgang unberührt', d.getElementById('miete').value === '');
  d.getElementById('miete').value = '640'; d.getElementById('miete').dispatchEvent(new s.w.Event('change'));
  d.getElementById('p-name').value = 'Erika Muster'; d.getElementById('p-name').dispatchEvent(new s.w.Event('input'));
  H.laden({ plan: { aus: { essen: 30000 } } });
  await warte(400);

  // Kopie zum Ausprobieren
  const g = d.getElementById('setHaushalte');
  knopf(s, g.querySelector('li.vg-offen'), 'Kopie zum Ausprobieren').click();
  d.getElementById('miete').value = '900'; d.getElementById('miete').dispatchEvent(new s.w.Event('change'));
  await warte(400);
  knopf(s, d.getElementById('vgMenu'), 'Familie M.').click();
  ck('[vorgaenge] Kopie: Original unverändert', d.getElementById('miete').value === '640');
  ck('[vorgaenge] Kopie übernimmt den Haushaltsplan', JSON.parse(mem['lotse.vorgaenge']).klar.liste.filter((v) => v.daten && /30000/.test(v.daten['lotse.haushalt'] || '')).length === 1 && essen() === 30000);
  ck('[vorgaenge] drei Vorgänge in der Liste', d.querySelectorAll('#setHaushalte li').length === 3);
  ck('[vorgaenge] Wort „Profil“ nie in der Oberfläche', !/Profil/i.test(d.getElementById('setHaushalte').textContent + chip.textContent + res.textContent));

  // Automatisch löschen: Datum sichtbar
  const sel = d.getElementById('vgTage'); sel.value = '30'; sel.dispatchEvent(new s.w.Event('change'));
  ck('[vorgaenge] automatisches Löschen: Datum „wird am … gelöscht“ sichtbar', d.querySelectorAll('#setHaushalte .vg-ablauf').length === 3 && /Wird am \d\d\.\d\d\.\d{4} gelöscht/.test(d.getElementById('setHaushalte').textContent));

  // PIN setzen
  knopf(s, g, 'PIN festlegen').click();
  d.getElementById('vgPin1').value = '12'; d.getElementById('vgPin2').value = '12';
  submit(s, d.getElementById('vgPinForm'));
  ck('[vorgaenge] zu kurze PIN abgelehnt', /4 bis 12 Ziffern/.test(d.getElementById('vgPinForm').textContent));
  d.getElementById('vgPin1').value = '2580'; d.getElementById('vgPin2').value = '2581';
  submit(s, d.getElementById('vgPinForm'));
  ck('[vorgaenge] verschiedene PINs abgelehnt', /verschieden/.test(d.getElementById('vgPinForm').textContent));
  d.getElementById('vgPin2').value = '2580';
  submit(s, d.getElementById('vgPinForm'));
  for (let i = 0; i < 100 && mem['lotse.state']; i++) await warte(50);
  // Geheimtext (Base64) selbst nicht durchsuchen: Zufallsfolgen wie „640“ wären sonst falscher Alarm
  const roh = JSON.stringify(Object.assign({}, mem, { 'lotse.vorgaenge': JSON.stringify(Object.assign({}, JSON.parse(mem['lotse.vorgaenge'] || '{}'), { pin: { geheim: !!(JSON.parse(mem['lotse.vorgaenge'] || '{}').pin || {}).ct } })) }));
  ck('[vorgaenge] mit PIN: nichts Lesbares im Speicher, PIN nicht gespeichert', !/Erika|Muster|Familie|640|miete/.test(roh) && !roh.includes('2580') && !mem['lotse.state'] && !mem['lotse.haushalt'], roh.slice(0, 300));
  ck('[vorgaenge] PIN-Sperre als „an“ angezeigt', /PIN-Sperre ist an/.test(d.getElementById('setHaushalte').textContent));
  ck('[vorgaenge] PIN: 6 Ziffern empfohlen, Selbstsperre ehrlich im Text', /empfohlen: 6/.test(require('../dist/i18n.js').de['vg.pin.label']) && /2 Minuten im Hintergrund/.test(d.getElementById('setHaushalte').textContent));
  // PIN ändern und ausschalten fragen die bisherige PIN ab
  knopf(s, g, 'PIN ändern').click();
  ck('[vorgaenge] PIN ändern: Feld „Bisherige PIN“', !!d.getElementById('vgPin0'));
  d.getElementById('vgPin0').value = '1111'; d.getElementById('vgPin1').value = '123456'; d.getElementById('vgPin2').value = '123456';
  submit(s, d.getElementById('vgPinForm'));
  for (let i = 0; i < 200 && !/bisherige PIN stimmt nicht/.test(d.getElementById('vgPinForm').textContent); i++) await warte(50);
  ck('[vorgaenge] PIN ändern: falsche bisherige PIN abgelehnt', /bisherige PIN stimmt nicht/.test(d.getElementById('vgPinForm').textContent));
  knopf(s, g, 'PIN-Sperre ausschalten').click();
  ck('[vorgaenge] PIN ausschalten: nur mit bisheriger PIN', !!d.getElementById('vgPin0') && !d.getElementById('vgPin1'));
  d.getElementById('vgPinForm').remove();
  // Automatisch sperren nach etwa 2 Minuten im Hintergrund
  let neuStart = 0, vs = 'visible'; const echtNow = s.w.Date.now; let versatz = 0;
  s.w.__soloNeuStart = () => { neuStart++; };
  Object.defineProperty(d, 'visibilityState', { get: () => vs, configurable: true });
  s.w.Date.now = () => echtNow.call(s.w.Date) + versatz;
  const sicht = (x) => { vs = x; d.dispatchEvent(new s.w.Event('visibilitychange')); };
  sicht('hidden'); versatz = 30000; sicht('visible'); await warte(100);
  ck('[vorgaenge] kurz im Hintergrund (30 s): bleibt offen', neuStart === 0);
  sicht('hidden'); versatz += 130000; sicht('visible'); for (let i = 0; i < 100 && !neuStart; i++) await warte(50);
  ck('[vorgaenge] über 2 Minuten im Hintergrund: speichert und sperrt (neu laden)', neuStart === 1);
  s.w.Date.now = echtNow; versatz = 0;

  // Neustart: Sperrbildschirm
  const s2 = seite(mem);
  const sp = s2.d.getElementById('vgSperre');
  ck('[vorgaenge] Sperrbildschirm: App dahinter inert', s2.d.getElementById('app').inert === true);
  ck('[vorgaenge] Neustart mit PIN: Sperrbildschirm, keine Angaben geladen', sp && !sp.hidden && s2.d.getElementById('miete').value === '' && s2.errors.length === 0, s2.errors.join(' | '));
  s2.d.getElementById('vgPinEin').value = '0000';
  submit(s2, s2.d.getElementById('vgPinEin').form);
  for (let i = 0; i < 100 && !/stimmt nicht/.test(s2.d.getElementById('vgSperreMsg').textContent); i++) await warte(50);
  ck('[vorgaenge] falsche PIN: Meldung, bleibt gesperrt', /stimmt nicht/.test(s2.d.getElementById('vgSperreMsg').textContent) && !sp.hidden);
  s2.d.getElementById('vgPinEin').value = '2580';
  submit(s2, s2.d.getElementById('vgPinEin').form);
  for (let i = 0; i < 100 && !sp.hidden; i++) await warte(50);
  ck('[vorgaenge] richtige PIN: entsperrt, Angaben des Vorgangs geladen', sp.hidden && s2.d.getElementById('miete').value === '640' && s2.d.getElementById('p-name').value === 'Erika Muster');
  ck('[vorgaenge] nach dem Entsperren: Haushaltsplan entschlüsselt geladen', s2.w.Haushalt.daten().plan.aus.essen === 30000);
  ck('[vorgaenge] nach dem Entsperren: App wieder bedienbar', s2.d.getElementById('app').inert === false);
  ck('[vorgaenge] nach dem Entsperren: Kürzel-Schild', !s2.d.getElementById('vgChip').hidden && s2.d.getElementById('vgChip').textContent === 'Familie M.');

  // Automatisch löschen umstellen, geöffneter Vorgang ist abgelaufen: Rückfrage mit Anzahl, keine fremden Daten überschreiben
  {
    const m6 = { 'lotse.ack': '1', 'lotse-lang': 'de', 'lotse.state': JSON.stringify({ s: { adults: 1, kids: 0, ek1Art: 'lohn', ek1Netto: 1500, miete: 111, bezug: {} }, p: {}, e: true }) };
    const a = seite(m6); a.d.getElementById('vgNameRes').value = 'Alt'; submit(a, a.d.getElementById('vgNameRes').form); await warte(50);
    a.w.dispatchEvent(new a.w.Event('pagehide')); await warte(50);
    const meta = JSON.parse(m6['lotse.vorgaenge']); const altId = meta.klar.aktiv, jetzt = Date.now();
    meta.klar.liste[0].geaendert = jetzt - 100 * 86400000;
    meta.klar.liste.push({ id: 'bbbbbbbbbbbb', name: 'Neu', erstellt: jetzt, geaendert: jetzt, daten: { 'lotse.state': JSON.stringify({ s: { adults: 1, kids: 0, miete: 222, bezug: {} }, p: {}, e: true }) } });
    m6['lotse.vorgaenge'] = JSON.stringify(meta);
    const b = seite(m6); let gefragt = '';
    b.w.confirm = (txt) => { gefragt = txt; return false; };
    const sel6 = b.d.getElementById('vgTage'); sel6.value = '30'; sel6.dispatchEvent(new b.w.Event('change'));
    ck('[vorgaenge] Frist umstellen: Rückfrage mit Anzahl', /Anzahl: 1/.test(gefragt), gefragt);
    ck('[vorgaenge] Frist umstellen: „Abbrechen“ lässt alles, Auswahl zurück', sel6.value === '0' && JSON.parse(m6['lotse.vorgaenge']).klar.liste.length === 2 && b.d.getElementById('miete').value === '111');
    b.w.confirm = () => true;
    sel6.value = '30'; sel6.dispatchEvent(new b.w.Event('change')); await warte(400);
    const nach = JSON.parse(m6['lotse.vorgaenge']).klar;
    ck('[vorgaenge] Frist umstellen: abgelaufener geöffneter Vorgang gelöscht, anderer geladen', nach.liste.length === 1 && nach.liste[0].name === 'Neu' && b.d.getElementById('miete').value === '222' && nach.aktiv !== altId);
    ck('[vorgaenge] Frist umstellen: Angaben des anderen Vorgangs nicht überschrieben', JSON.parse(m6['lotse.state']).s.miete === 222, m6['lotse.state']);
  }

  // Kopie mit langem Namen: „(Kopie)“ bleibt ganz
  {
    const m7 = { 'lotse.ack': '1', 'lotse-lang': 'de' }; const c = seite(m7);
    c.d.getElementById('vgNameRes').value = 'Familie Mustermann-Lang'; submit(c, c.d.getElementById('vgNameRes').form); await warte(50);
    knopf(c, c.d.getElementById('setHaushalte').querySelector('li.vg-offen'), 'Kopie zum Ausprobieren').click(); await warte(50);
    const namen = JSON.parse(m7['lotse.vorgaenge']).klar.liste.map((v) => v.name);
    ck('[vorgaenge] Kopiename: erst kürzen, dann „(Kopie)“', namen.some((x) => /\(Kopie\)$/.test(x) && x.length <= 24), namen);
  }

  // PIN vergessen: alles löschen
  const s3 = seite(mem);
  knopf(s3, s3.d.getElementById('vgSperre'), 'Alles löschen und neu beginnen').click();
  ck('[vorgaenge] PIN vergessen: alles gelöscht, App leer und bedienbar', s3.d.getElementById('vgSperre').hidden && !mem['lotse.vorgaenge'] && s3.d.getElementById('miete').value === '' && s3.d.getElementById('vgChip').hidden);

  // Speicher voll oder gesperrt
  const s4 = seite({ 'lotse.ack': '1', 'lotse-lang': 'de' }, { voll: true });
  s4.d.getElementById('vgNameRes').value = 'X';
  submit(s4, s4.d.getElementById('vgNameRes').form);
  await warte(20);
  const f = s4.d.getElementById('vgFehler');
  ck('[vorgaenge] Speicherfehler: sichtbare Meldung, kein Skriptfehler', f && !f.hidden && /Speicher voll oder gesperrt/.test(f.textContent) && s4.errors.length === 0, s4.errors.join(' | '));

  // Alle Sprachen: Texte vorhanden, kein „Profil“
  const I18N = require('../dist/i18n.js');
  const keys = Object.keys(I18N.de).filter((k) => k.startsWith('vg.'));
  Object.keys(I18N).forEach((l) => ck('[vorgaenge] alle Texte übersetzt: ' + l, keys.every((k) => typeof I18N[l][k] === 'string' && I18N[l][k]), keys.filter((k) => !I18N[l][k])));
  ck('[vorgaenge] deutsche Texte ohne „Profil“', keys.every((k) => !/Profil/i.test(I18N.de[k])));

  console.log(fails ? `\n${fails} von ${n} Prüfungen fehlgeschlagen` : `Vorgänge-Oberflächentest bestanden: ${n} Prüfungen`);
  process.exit(fails ? 1 : 0);
})();
