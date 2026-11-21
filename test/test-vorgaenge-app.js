// Vorgänge in der Oberfläche: nur in „Mein Ordner“ (Liste wie eine Profilauswahl, „+ Neuen Vorgang anlegen“, Bearbeiten),
// Beispiel überschreibt keinen gespeicherten Vorgang, Wechseln mit einem Tipp, Kopie, PIN-Sperre mit Sperrbildschirm, falsche PIN, Speicherfehler, Wort „Profil“ nie sichtbar.
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
// Wechseln mit einem Tipp auf die Zeile in „Mein Ordner“; Anlegen über „+“; Bearbeiten-Knöpfe in der Zeile eines Vorgangs
const wechsel = (s, name) => s.d.querySelector('#setHaushalte button.vg-zeile[data-vg-name="' + name + '"]').click();
const anlegen = (s, name) => { s.d.getElementById('vgPlus').click(); s.d.getElementById('vgNameNeu').value = name; submit(s, s.d.getElementById('vgNeuForm')); };
const bearbeiten = (s) => { const b = s.d.getElementById('vgBearb'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); };
const zeileVon = (s, name) => s.d.querySelector('#setHaushalte [data-vg-name="' + name + '"]').closest('li');
const offenName = (s) => { const z = s.d.querySelector('#setHaushalte .vg-offen [data-vg-name]'); return z ? z.getAttribute('data-vg-name') : ''; };

(async () => {
  const alt = { s: { adults: 1, kids: 0, ek1Art: 'lohn', ek1Brutto: 2100, ek1Netto: 1600, miete: 640, mietstufe: '3', vermoegen: 500, bezug: {} }, p: { name: 'Erika Muster' }, e: true };
  const mem = { 'lotse.state': JSON.stringify(alt), 'lotse.ack': '1', 'lotse-lang': 'de' };
  const s = seite(mem);
  const d = s.d;
  ck('[vorgaenge] lädt ohne Skriptfehler', s.errors.length === 0, s.errors.join(' | '));
  ck('[vorgaenge] alter Speicherstand übernommen', d.getElementById('miete').value === '640' && d.getElementById('p-name').value === 'Erika Muster');
  ck('[vorgaenge] Vorgänge nur in „Mein Ordner“: kein Kürzel-Schild im Kopf, kein Kasten beim Ergebnis, keine Liste in den Einstellungen', !d.getElementById('vgChip') && !d.getElementById('vgMenu') && !d.getElementById('vgRes') && !d.querySelector('#v-einst .vg-liste') && !!d.getElementById('setHaushalte').closest('#ordnerHaupt') && !d.getElementById('setHaushalte').closest('.unterseite') && !d.getElementById('vgSperre'));
  ck('[vorgaenge] ein Vorgang: keine Liste, kein „Bearbeiten“, nur „+ Weiteren Vorgang anlegen“', !d.querySelector('#setHaushalte .vg-zeile[data-vg-name]') && !d.getElementById('vgBearb') && /Weiteren Vorgang anlegen/.test(d.getElementById('vgPlus').textContent) && d.getElementById('vgH').classList.contains('vh'));
  ck('[vorgaenge] PIN-Sperre und automatisch löschen in den Einstellungen unter „Sicherheit und Daten“, Link aus „Mein Ordner“', !!d.querySelector('#es-sicher #setSicher #vgTage') && /PIN-Sperre/.test(d.getElementById('setSicher').textContent) && !!d.querySelector('#es-sicher #loeschListe #vgAlle') && !/niemand die Angaben wiederherstellen/.test(d.getElementById('setSicher').textContent) && !d.querySelector('#setHaushalte #vgTage') && !!d.getElementById('vgZuSicher'));

  // Weiteren Vorgang anlegen: neuer leerer Vorgang, die bisherigen Angaben bleiben im ersten
  anlegen(s, '  Leer  ');
  await warte(50);
  ck('[vorgaenge] angelegt: neuer leerer Vorgang geöffnet, Name im Speicher', d.getElementById('miete').value === '' && /"Leer"/.test(mem['lotse.vorgaenge'] || '') && offenName(s) === 'Leer');
  ck('[vorgaenge] zwei Vorgänge: Liste mit Initialen-Kreis, geöffneter markiert, „Bearbeiten“, „+ Neuen Vorgang anlegen“', d.querySelectorAll('#setHaushalte .vg-zeile[data-vg-name]').length === 2 && d.querySelector('#setHaushalte .vg-offen [aria-current="true"]') && d.querySelector('#setHaushalte .vg-offen .vg-kreis').textContent === 'L' && !!d.getElementById('vgBearb') && /Neuen Vorgang anlegen/.test(d.getElementById('vgPlus').textContent) && !d.getElementById('vgH').classList.contains('vh'));
  ck('[vorgaenge] Umbenennen, Kopie und Löschen erst nach „Bearbeiten“', !knopf(s, zeileVon(s, 'Ohne Namen'), 'Umbenennen'));
  bearbeiten(s);
  ck('[vorgaenge] „Bearbeiten“ zeigt Umbenennen, Kopie, Löschen', ['Umbenennen', 'Kopie zum Ausprobieren', 'Löschen'].every((x) => !!knopf(s, zeileVon(s, 'Ohne Namen'), x)) && d.getElementById('vgBearb').textContent === 'Fertig');
  knopf(s, zeileVon(s, 'Ohne Namen'), 'Umbenennen').click();
  zeileVon(s, 'Ohne Namen').querySelector('.vg-umb input').value = 'Familie M.';
  submit(s, zeileVon(s, 'Ohne Namen').querySelector('.vg-umb'));
  knopf(s, zeileVon(s, 'Leer'), 'Löschen').click();
  ck('[vorgaenge] Löschen in „Bearbeiten“: dieselbe Rückfrage', /Nur „Leer“ löschen\?/.test(d.getElementById('loeschFrage').textContent));
  d.getElementById('loeschJa').click();
  await warte(50);
  ck('[vorgaenge] umbenannt und geöffneten gelöscht: „Familie M.“ mit den Angaben geöffnet, wieder ohne Liste', d.getElementById('miete').value === '640' && d.getElementById('p-name').value === 'Erika Muster' && !d.querySelector('#setHaushalte .vg-zeile[data-vg-name]') && /Familie M\./.test(mem['lotse.vorgaenge'] || '') && JSON.parse(mem['lotse.state']).s.miete === 640);

  // Beispiel darf den gespeicherten Vorgang nicht überschreiben
  d.getElementById('p1').click();
  await warte(400);
  const st = JSON.parse(mem['lotse.vorgaenge']).klar;
  const fam = st.liste.find((v) => v.name === 'Familie M.');
  ck('[vorgaenge] Beispiel öffnet einen neuen Vorgang', st.liste.length === 2 && st.aktiv !== fam.id);
  ck('[vorgaenge] gespeicherter Vorgang bleibt unverändert', JSON.parse(fam.daten['lotse.state']).s.miete === 640, fam.daten);
  ck('[vorgaenge] Beispiel ohne Antragsdaten des gespeicherten Vorgangs', d.getElementById('p-name').value === '');
  ck('[vorgaenge] zwei Vorgänge: der neue (ohne Namen) ist in der Liste markiert', offenName(s) === 'Ohne Namen');

  // Wechseln mit einem Tipp
  wechsel(s, 'Familie M.');
  ck('[vorgaenge] Wechsel lädt Angaben und Antragsdaten', d.getElementById('miete').value === '640' && d.getElementById('p-name').value === 'Erika Muster' && offenName(s) === 'Familie M.');

  // Haushaltsplan (src/haushalt.js) je Vorgang
  const H = s.w.Haushalt, essen = () => (H.daten().plan.aus || {}).essen;
  H.laden({ plan: { aus: { essen: 30000 } } });
  if (s.w.Ausziehen) s.w.Ausziehen.laden({ ab: { vertrag: true } });
  ck('[vorgaenge] Haushaltsplan im geöffneten Vorgang gespeichert', /30000/.test(mem['lotse.haushalt'] || ''));
  wechsel(s, 'Ohne Namen');
  ck('[vorgaenge] anderer Vorgang: eigener (leerer) Haushaltsplan', essen() === undefined);
  ck('[vorgaenge] anderer Vorgang: eigene (leere) Haken bei „Ich ziehe aus“', !s.w.Ausziehen || !s.w.Ausziehen.daten().ab.vertrag);
  wechsel(s, 'Familie M.');
  ck('[vorgaenge] zurück: Haushaltsplan des Vorgangs wieder da', essen() === 30000);
  ck('[vorgaenge] zurück: Haken bei „Ich ziehe aus“ wieder da', !s.w.Ausziehen || s.w.Ausziehen.daten().ab.vertrag === true);
  // Löschen: zwei klare Zeilen in Einstellungen → Sicherheit und Daten, jede sagt, was weg ist
  const c2 = d.getElementById('clear2'), va = d.getElementById('vgAlle');
  ck('[vorgaenge] Löschen: „Nur „Familie M.“ löschen“ nennt, was weg ist', /Nur „Familie M\.“ löschen/.test(c2.textContent) && /Fristen/.test(c2.textContent) && /Andere Vorgänge bleiben/.test(c2.textContent), c2.textContent);
  ck('[vorgaenge] Löschen: „Alles auf diesem Gerät löschen“ nennt Vorgänge und PIN, Sprache bleibt', /Alles auf diesem Gerät löschen/.test(va.textContent) && /PIN/.test(va.textContent) && /Sprache/.test(va.textContent));
  ck('[vorgaenge] im Leistungs-Check nur der Textknopf „Angaben löschen“ oben (mit Rückfrage)', !d.getElementById('clearBtn') && !!d.getElementById('clearLink'));
  [...d.querySelectorAll('[data-pick]')].slice(0, 1).forEach((cb) => { cb.checked = true; cb.dispatchEvent(new s.w.Event('change', { bubbles: true })); });
  d.getElementById('mappeMake').click(); // Haken gibt es nur in der Antragsmappe
  const hk = d.querySelector('#m-unterlagen input[data-haken]'); hk.checked = true; hk.dispatchEvent(new s.w.Event('change', { bubbles: true }));
  ck('[vorgaenge] Haken der Checkliste gehören zum Vorgang', !!mem['lotse.haken'] && !!mem['lotse.pfaendung']);
  d.getElementById('mappeClose').click();
  d.querySelector('#appnav [data-ansicht="einst"]').click(); d.querySelector('#einstListe .zeile[data-seite="sicher"]').click();
  d.getElementById('clear2').click();
  const fr = d.getElementById('loeschFrage');
  ck('[vorgaenge] Rückfrage nennt, was weg ist, Knöpfe „Behalten“ und „Löschen“ (rot), keiner vorgewählt, Hinweis auf Rückgängig', fr && /Nur „Familie M\.“ löschen\?/.test(fr.textContent) && /Haushaltsplan und Haushaltsbuch/.test(fr.textContent) && /10 Sekunden/.test(fr.textContent) && d.activeElement === d.getElementById('loeschFrageT') && d.getElementById('loeschNein').textContent === 'Behalten' && d.getElementById('loeschJa').classList.contains('loesch-ja') && d.getElementById('loeschJa').textContent === 'Löschen', [fr && fr.textContent, d.activeElement && d.activeElement.id]);
  d.getElementById('loeschNein').click();
  ck('[vorgaenge] „Behalten“ löscht nichts', !d.getElementById('loeschFrage') && !!mem['lotse.haken'] && d.getElementById('miete').value === '640');
  d.getElementById('miete').value = '640'; d.getElementById('miete').dispatchEvent(new s.w.Event('change'));
  d.getElementById('p-name').value = 'Erika Muster'; d.getElementById('p-name').dispatchEvent(new s.w.Event('input'));
  H.laden({ plan: { aus: { essen: 30000 } } });
  await warte(400);

  // Kopie zum Ausprobieren
  bearbeiten(s);
  knopf(s, zeileVon(s, 'Familie M.'), 'Kopie zum Ausprobieren').click();
  d.getElementById('miete').value = '900'; d.getElementById('miete').dispatchEvent(new s.w.Event('change'));
  await warte(400);
  wechsel(s, 'Familie M.');
  ck('[vorgaenge] Kopie: Original unverändert', d.getElementById('miete').value === '640');
  ck('[vorgaenge] Kopie übernimmt den Haushaltsplan', JSON.parse(mem['lotse.vorgaenge']).klar.liste.filter((v) => v.daten && /30000/.test(v.daten['lotse.haushalt'] || '')).length === 1 && essen() === 30000);
  ck('[vorgaenge] drei Vorgänge in der Liste', d.querySelectorAll('#setHaushalte .vg-zeile[data-vg-name]').length === 3);
  ck('[vorgaenge] Wort „Profil“ nie in der Oberfläche', !/Profil/i.test(d.getElementById('setHaushalte').textContent));

  // Automatisch löschen: Datum sichtbar
  const sel = d.getElementById('vgTage'); sel.value = '30'; sel.dispatchEvent(new s.w.Event('change'));
  ck('[vorgaenge] automatisches Löschen: Datum „wird am … gelöscht“ sichtbar', d.querySelectorAll('#setHaushalte .vg-ablauf').length === 3 && /Wird am \d\d\.\d\d\.\d{4} gelöscht/.test(d.getElementById('setHaushalte').textContent));

  // PIN einschalten und abbrechen: Feld zu, Schalter bleibt bzw. springt zurück auf „aus“, nichts gespeichert (Fehler 1.8.0: Schalter „festgeklemmt“)
  {
    const sw = () => d.getElementById('vgPinSchalter');
    sw().click();
    ck('[vorgaenge] PIN ein: Feld zum Festlegen mit „Abbrechen“', !!d.getElementById('vgPin1') && !!d.getElementById('vgPinAbbr'));
    d.getElementById('vgPin1').value = '9999';
    d.getElementById('vgPinAbbr').click();
    ck('[vorgaenge] PIN ein abbrechen: Feld weg, Schalter aus, keine PIN', !d.getElementById('vgPinForm') && sw().getAttribute('aria-checked') === 'false' && !/"pin"/.test(mem['lotse.vorgaenge'] || '') && d.activeElement === sw());
    sw().click(); sw().click();
    ck('[vorgaenge] PIN ein: erneutes Tippen auf den Schalter schließt das Feld (Schalter aus)', !d.getElementById('vgPinForm') && sw().getAttribute('aria-checked') === 'false');
  }
  // PIN setzen
  d.getElementById('vgPinSchalter').click();
  { // Kurze Erklärung direkt unter dem Feld „Neue PIN“: dezente Hinweiszeile, mit dem Feld verknüpft, höchstens 3 kurze Sätze
    const hw = d.getElementById('vgPinHinweis'), p1 = d.getElementById('vgPin1');
    ck('[vorgaenge] PIN festlegen: Erklärung direkt unter dem Feld (Hinweiszeile, kein Kasten)', hw && p1.nextElementSibling === hw && hw.className === 'hint' && p1.getAttribute('aria-describedby') === 'vgPinHinweis');
    ck('[vorgaenge] PIN-Erklärung: ganze App gesperrt, Verschlüsselung, PIN merken, vergessen = niemand kann öffnen', hw && /sperrt die ganze App/.test(hw.textContent) && /verschlüsselt/.test(hw.textContent) && /Merke dir die PIN/.test(hw.textContent) && /niemand die Angaben öffnen/.test(hw.textContent));
    ck('[vorgaenge] PIN-Erklärung nicht dauerhaft in Sicherheit sichtbar', !/Merke dir die PIN gut, sie/.test(d.getElementById('setSicher').textContent.replace(d.getElementById('vgPinForm').textContent, '')));
    const I = require('../dist/i18n.js'), texte = Object.keys(I).map((l) => [l, I[l]['vg.pin.erkl']]);
    texte.push(['einfach', JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'einfach', 'e.json'), 'utf8'))['vg.pin.erkl']]);
    texte.forEach(([l, tx]) => {
      const sae = String(tx || '').split(/(?<=[.!?])\s+/);
      ck('[vorgaenge] PIN-Erklärung kurz (max. 3 Sätze, je ≤ 12 Wörter): ' + l, !!tx && sae.length <= 3 && sae.every((x) => x.split(/\s+/).length <= 12), tx);
    });
  }
  d.getElementById('vgPin1').value = '12'; d.getElementById('vgPin2').value = '12';
  submit(s, d.getElementById('vgPinForm'));
  ck('[vorgaenge] zu kurze PIN abgelehnt', /4 bis 12 Ziffern/.test(d.getElementById('vgPinForm').textContent));
  d.getElementById('vgPin1').value = '2580'; d.getElementById('vgPin2').value = '2581';
  submit(s, d.getElementById('vgPinForm'));
  ck('[vorgaenge] verschiedene PINs abgelehnt', /verschieden/.test(d.getElementById('vgPinForm').textContent));
  d.getElementById('vgPin2').value = '2580';
  submit(s, d.getElementById('vgPinForm'));
  for (let i = 0; i < 100 && mem['lotse.state']; i++) await warte(50);
  // Geheimtext (Base64) und Zeitstempel (zuletzt, bis) nicht durchsuchen: Zufallsfolgen wie „640“ wären sonst falscher Alarm
  const neutral = (vg) => Object.assign({}, vg, { pin: { geheim: !!(vg.pin || {}).ct }, zuletzt: vg.zuletzt ? 1 : 0, bis: vg.bis ? 1 : 0 });
  ck('[vorgaenge] Testhilfe: Zeitstempel mit „640“ neutralisiert', !/640/.test(JSON.stringify(neutral({ zuletzt: 1764064000000, bis: 1766406400000, pin: { ct: 'x640' } }))));
  const roh = JSON.stringify(Object.assign({}, mem, { 'lotse.vorgaenge': JSON.stringify(neutral(JSON.parse(mem['lotse.vorgaenge'] || '{}'))) }));
  ck('[vorgaenge] mit PIN: nichts Lesbares im Speicher, PIN nicht gespeichert', !/Erika|Muster|Familie|640|miete/.test(roh) && !roh.includes('2580') && !mem['lotse.state'] && !mem['lotse.haushalt'] && !mem['lotse.haken'] && !mem['lotse.ausziehen'], roh.slice(0, 300));
  { const V = require('../src/vorgaenge.js'); ck('[vorgaenge] Korrektur 6: Haken, Haushalt und Ausziehen gehören zum Vorgang (DATEN), Beratungsmodus nicht', ['lotse.haken', 'lotse.haushalt', 'lotse.ausziehen'].every((k) => V.DATEN.includes(k)) && !V.DATEN.includes('lotse.beratung')); }
  ck('[vorgaenge] PIN-Sperre als „an“ angezeigt', /PIN-Sperre ist an/.test(d.getElementById('setSicher').textContent));
  ck('[vorgaenge] PIN: 6 Ziffern empfohlen, Selbstsperre ehrlich im Text', /empfohlen: 6/.test(require('../dist/i18n.js').de['vg.pin.label']) && /2 Minuten im Hintergrund/.test(d.getElementById('setSicher').textContent));
  // PIN ändern und ausschalten fragen die bisherige PIN ab
  knopf(s, d.getElementById('setSicher'), 'PIN ändern').click();
  ck('[vorgaenge] PIN ändern: Feld „Bisherige PIN“', !!d.getElementById('vgPin0'));
  d.getElementById('vgPin0').value = '1111'; d.getElementById('vgPin1').value = '123456'; d.getElementById('vgPin2').value = '123456';
  submit(s, d.getElementById('vgPinForm'));
  for (let i = 0; i < 200 && !/bisherige PIN stimmt nicht/.test(d.getElementById('vgPinForm').textContent); i++) await warte(50);
  ck('[vorgaenge] PIN ändern: falsche bisherige PIN abgelehnt', /bisherige PIN stimmt nicht/.test(d.getElementById('vgPinForm').textContent));
  d.getElementById('vgPinSchalter').click();
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
  ck('[vorgaenge] nach dem Entsperren: „Familie M.“ in „Mein Ordner“ geöffnet', offenName(s2) === 'Familie M.');
  // Ausschalten nach dem Neustart (wie in der installierten App): falsche PIN -> bleibt an; Abbrechen -> bleibt an; richtige PIN -> aus
  const memMitPin = Object.assign({}, mem); // danach wiederherstellen: „PIN vergessen“ weiter unten braucht den Stand mit PIN
  {
    const sw = () => s2.d.getElementById('vgPinSchalter');
    ck('[vorgaenge] nach Neustart: Schalter „an“', sw().getAttribute('aria-checked') === 'true');
    sw().click();
    ck('[vorgaenge] PIN aus: Feld „Bisherige PIN“ mit „Abbrechen“', !!s2.d.getElementById('vgPin0') && !!s2.d.getElementById('vgPinAbbr'));
    s2.d.getElementById('vgPinAbbr').click();
    ck('[vorgaenge] PIN aus abbrechen: Feld weg, Schalter bleibt an', !s2.d.getElementById('vgPinForm') && sw().getAttribute('aria-checked') === 'true');
    sw().click(); sw().click();
    ck('[vorgaenge] PIN aus: erneutes Tippen schließt das Feld, Schalter bleibt an', !s2.d.getElementById('vgPinForm') && sw().getAttribute('aria-checked') === 'true');
    sw().click();
    s2.d.getElementById('vgPin0').value = '1111'; submit(s2, s2.d.getElementById('vgPinForm'));
    for (let i = 0; i < 200 && !/bisherige PIN stimmt nicht/.test(s2.d.getElementById('vgPinForm').textContent); i++) await warte(50);
    ck('[vorgaenge] PIN aus mit falscher PIN: Meldung, bleibt an, weiter verschlüsselt', /bisherige PIN stimmt nicht/.test(s2.d.getElementById('vgPinForm').textContent) && sw().getAttribute('aria-checked') === 'true' && /"ct"/.test(mem['lotse.vorgaenge']) && !mem['lotse.state']);
    s2.d.getElementById('vgPin0').value = '2580'; submit(s2, s2.d.getElementById('vgPinForm'));
    for (let i = 0; i < 200 && s2.d.getElementById('vgPinForm'); i++) await warte(50);
    await warte(50);
    ck('[vorgaenge] PIN aus mit richtiger PIN: Schalter aus, Angaben wieder unverschlüsselt, keine PIN gespeichert', sw().getAttribute('aria-checked') === 'false' && /PIN-Sperre ist aus/.test(s2.d.body.textContent) && !/"pin"/.test(mem['lotse.vorgaenge']) && /640/.test(mem['lotse.state'] || ''), [sw().getAttribute('aria-checked'), s2.d.getElementById('setSicher').textContent.slice(0, 300), (mem['lotse.state'] || '').slice(0, 80)]);
    const s5 = seite(mem); await warte(100);
    ck('[vorgaenge] nach PIN aus und Neustart: kein Sperrbildschirm, Schalter aus', (!s5.d.getElementById('vgSperre') || s5.d.getElementById('vgSperre').hidden) && s5.d.getElementById('vgPinSchalter').getAttribute('aria-checked') === 'false' && s5.d.getElementById('miete').value === '640');
  }
  await warte(100); Object.keys(mem).forEach((k) => delete mem[k]); Object.assign(mem, memMitPin);

  // Automatisch löschen umstellen, geöffneter Vorgang ist abgelaufen: Rückfrage mit Anzahl, keine fremden Daten überschreiben
  {
    const m6 = { 'lotse.ack': '1', 'lotse-lang': 'de', 'lotse.state': JSON.stringify({ s: { adults: 1, kids: 0, ek1Art: 'lohn', ek1Netto: 1500, miete: 111, bezug: {} }, p: {}, e: true }) };
    const a = seite(m6); await warte(50);
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
    anlegen(c, 'Familie Mustermann-Lang'); await warte(50);
    ck('[vorgaenge] leerer erster Vorgang ohne Namen: „Anlegen“ gibt ihm nur den Namen (kein zweiter leerer)', JSON.parse(m7['lotse.vorgaenge']).klar.liste.length === 1);
    anlegen(c, 'B'); await warte(50); bearbeiten(c);
    knopf(c, zeileVon(c, 'Familie Mustermann-Lang'), 'Kopie zum Ausprobieren').click(); await warte(50);
    const namen = JSON.parse(m7['lotse.vorgaenge']).klar.liste.map((v) => v.name);
    ck('[vorgaenge] Kopiename: erst kürzen, dann „(Kopie)“', namen.some((x) => /\(Kopie\)$/.test(x) && x.length <= 24), namen);
  }

  // Löschen bestätigen: nur der geöffnete Vorgang, danach alles
  {
    const m9 = { 'lotse.ack': '1', 'lotse-lang': 'de' }; const e = seite(m9);
    anlegen(e, 'A'); await warte(30);
    e.d.getElementById('miete').value = '333'; e.d.getElementById('miete').dispatchEvent(new e.w.Event('change')); await warte(400);
    anlegen(e, 'B'); await warte(30);
    e.d.getElementById('clear2').click(); e.d.getElementById('loeschJa').click(); await warte(50);
    const l9 = JSON.parse(m9['lotse.vorgaenge']).klar.liste.map((v) => v.name);
    ck('[vorgaenge] „Nur „B“ löschen“: nur B weg, A wieder offen, Meldung', l9.join() === 'A' && e.d.getElementById('miete').value === '333' && e.d.getElementById('loeschMsg').textContent === '„B“ ist gelöscht.', [l9, e.d.getElementById('loeschMsg').textContent]);
    ck('[vorgaenge] nach dem Löschen: Leiste „Rückgängig“', !e.d.getElementById('undoBar').hidden && /„B“ ist gelöscht/.test(e.d.getElementById('undoText').textContent));
    e.d.getElementById('undoBtn').click(); await warte(50);
    ck('[vorgaenge] Rückgängig: B wieder da und geöffnet', JSON.parse(m9['lotse.vorgaenge']).klar.liste.map((v) => v.name).join() === 'A,B' && offenName(e) === 'B' && e.d.getElementById('undoBar').hidden);
    e.d.getElementById('clear2').click(); e.d.getElementById('loeschJa').click(); await warte(50);
    e.d.getElementById('vgAlle').click();
    ck('[vorgaenge] „Alles löschen“: Rückfrage sagt „nicht rückgängig“', /nicht rückgängig/.test(e.d.getElementById('loeschFrage').textContent));
    e.d.getElementById('loeschJa').click(); await warte(50);
    ck('[vorgaenge] „Alles löschen“: alle Vorgänge weg, App leer, Meldung, Sprache bleibt', e.d.getElementById('miete').value === '' && !/"A"/.test(m9['lotse.vorgaenge'] || '') && /Alles ist gelöscht/.test(e.d.getElementById('loeschMsg').textContent) && m9['lotse-lang'] === 'de');
  }

  // PIN vergessen: alles löschen
  const s3 = seite(mem);
  knopf(s3, s3.d.getElementById('vgSperre'), 'Alles löschen und neu beginnen').click();
  ck('[vorgaenge] PIN vergessen: alles gelöscht, App leer und bedienbar', s3.d.getElementById('vgSperre').hidden && !mem['lotse.vorgaenge'] && s3.d.getElementById('miete').value === '');

  // Speicher voll oder gesperrt
  const s4 = seite({ 'lotse.ack': '1', 'lotse-lang': 'de' }, { voll: true });
  anlegen(s4, 'X');
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
