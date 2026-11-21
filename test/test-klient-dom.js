// „Für Klient zusammenstellen“ (src/klient.js): Auswahl, Blatt nur mit Gewähltem, Sprache zweispaltig, Privatmodus ohne Knopf,
// Teilen (navigator.share mit Datei bzw. Download), Drucken, gesperrter Vorgang über die PIN-Schnittstelle (Attrappe), XSS.
// Teil 1 mit der fertigen Web-Version (dist) in JSDOM, Teil 2 mit dem Modul und einer Attrappe für die App. Aufruf: node test/test-klient-dom.js
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const I18N = require('../dist/i18n.js');
const html = fs.readFileSync(__dirname + '/../dist/sozialleistungslotse.html', 'utf8');
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x || ''); } else console.log('ok  ', n); };
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
const KB = Object.keys(JSON.parse(fs.readFileSync(__dirname + '/../src/lang/klient/de.json', 'utf8')));

check('Texte „kb.*“ in allen 13 Sprachen, Platzhalter wie im Deutschen', LANGS.every((l) => KB.every((k) => typeof I18N[l][k] === 'string' && I18N[l][k].length > 1 && (I18N.de[k].match(/\{\w+\}/g) || []).join() === (I18N[l][k].match(/\{\w+\}/g) || []).join())),
  LANGS.map((l) => KB.filter((k) => !I18N[l][k]).map((k) => l + ':' + k)).flat().join());
check('Datenschutz-Zeile: höchstens 2 Sätze, sachlich, kein Verbot', LANGS.every((l) => (I18N[l]['kb.datenschutz'].match(/[.!?。](\s|$)/g) || []).length <= 2) && !/verboten|nicht erlaubt|darf nicht/i.test(I18N.de['kb.datenschutz']));

// ---------- Teil 1: App (Web) ----------
{
  const store = {}, errors = [];
  let gedruckt = 0, geteilt = null, geladen = null;
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.scrollTo = function () {};
      w.print = function () { gedruckt++; };
      w.URL.createObjectURL = function () { return 'blob:x'; }; w.URL.revokeObjectURL = function () {};
      w.HTMLAnchorElement.prototype.click = function () { if (this.download) geladen = this.download; };
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
    }
  });
  const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
  const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
  const warte = () => new Promise((r) => setTimeout(r, 20));

  (async () => {
    d.querySelector('#appnav [data-ansicht="start"]').click(); $('goLeistungen').click();
    $('p1').click();
    check('Privatmodus: Ergebnis da, aber kein Knopf „Für Klient zusammenstellen“', !$('ebOpen').hidden && $('kbOpen').hidden && $('klientBlatt').hidden);
    $('beratungBtn').click();
    check('Beratungsmodus: Knopf sichtbar, beschriftet', !$('kbOpen').hidden && $('kbOpen').textContent === I18N.de['kb.btn']);
    $('kbOpen').click();
    const seite = () => $('kbSeite').textContent;
    const hil = () => [...d.querySelectorAll('#kbHilfen input[data-kb]')];
    check('Blatt öffnet sich und ersetzt die Seite', !$('klientBlatt').hidden && $('app').classList.contains('pm'));
    check('Auswahl: Hilfen per Haken (alle an), Unterlagen-Liste, Datum „bis“', hil().length > 1 && hil().every((c) => c.checked) && !!$('kbUnterlagen') && !!$('kbBis'));
    check('Blatt: Titel, Hilfen-Abschnitt mit „Keine Rechtsberatung“, Unterlagen „Das bringst du mit“', /Für dich zusammengestellt/.test(seite()) && seite().includes(I18N.de['rb.satz']) && seite().includes(I18N.de['kb.d.bringen']));
    check('Datenschutz-Zeile unter den Knöpfen', $('kbDs').textContent === I18N.de['kb.datenschutz'] && $('kbDs').previousElementSibling.querySelector('#kbTeilen'));
    check('Laienfassung für den Klienten: keine Paragrafen im Blatt', !/§/.test(seite()), (seite().match(/.{30}§.{30}/) || [''])[0]);
    // Nur Gewähltes
    const erste = hil()[0], name1 = erste.nextSibling.textContent.split(' – ')[0];
    hil().slice(1).forEach((c) => { c.checked = false; fire(c, 'change'); });
    const hAbschnitt = () => d.querySelector('#kbSeite [data-teil="hilfen"]');
    check('Nur die gewählte Hilfe steht im Blatt', hAbschnitt() && hAbschnitt().querySelectorAll('.kb-h3').length === 1 && hAbschnitt().textContent.includes(name1));
    [...d.querySelectorAll('#kbUnterlagen input[data-kb]')].forEach((c) => { c.checked = false; fire(c, 'change'); });
    check('Unterlagen abgewählt: kein Laufzettel', !d.querySelector('#kbSeite [data-teil="unterlagen"]') && !seite().includes(I18N.de['kb.d.bringen']));
    [...d.querySelectorAll('#kbUnterlagen input[data-kb]')].forEach((c) => { c.checked = true; fire(c, 'change'); });
    $('kbBis').value = '2026-12-04'; fire($('kbBis'), 'input');
    check('Laufzettel „Das bringst du mit – bis [Datum]“', seite().includes('Das bringst du mit – bis 04.12.2026'));
    erste.checked = false; fire(erste, 'change');
    [...d.querySelectorAll('#kbUnterlagen input[data-kb]')].forEach((c) => { c.checked = false; fire(c, 'change'); });
    check('Nichts gewählt: Hinweis, Knöpfe aus', seite().includes(I18N.de['kb.leer']) && $('kbDruck').disabled && $('kbTeilen').disabled);
    hil().forEach((c) => { c.checked = true; fire(c, 'change'); });
    // Sprache zweispaltig
    $('kbSprache').value = 'en'; fire($('kbSprache'), 'change');
    const paare = () => [...d.querySelectorAll('#kbSeite .kb-paar')];
    check('Englisch mit Deutsch daneben: zwei Spalten (lang=en | lang=de)', paare().length > 3 && paare().every((p) => p.children.length === 2 && p.children[0].getAttribute('lang') === 'en' && p.children[1].getAttribute('lang') === 'de') && /Put together for you/.test(seite()) && /Für dich zusammengestellt/.test(seite()));
    $('kbDaneben').checked = false; fire($('kbDaneben'), 'change');
    check('Deutsch daneben aus: nur Englisch', paare().length === 0 && !/Für dich zusammengestellt/.test(seite()));
    $('kbDaneben').checked = true; fire($('kbDaneben'), 'change');
    $('kbSprache').value = 'ar'; fire($('kbSprache'), 'change');
    check('Arabisch: rechts nach links, Deutsch daneben links nach rechts', paare().length > 0 && paare()[0].children[0].getAttribute('dir') === 'rtl' && paare()[0].children[1].getAttribute('dir') === 'ltr');
    $('kbSprache').value = 'de-einfach'; fire($('kbSprache'), 'change');
    check('Einfache Sprache wählbar: einfacher Text, kein „Deutsch daneben“', $('kbDaneben').closest('label').hidden && seite().includes(I18N.de['kb.d.titel']) && paare().length === 0);
    $('kbSprache').value = 'de'; fire($('kbSprache'), 'change');
    // Drucken (Web: Druckdialog)
    gedruckt = 0; $('kbDruck').click();
    check('Drucken öffnet den Druckdialog (Web)', gedruckt === 1);
    check('Druck-CSS für das Blatt vorhanden', /@media print\s*\{[^@]*\.kb-paar/.test(html));
    // Teilen mit Datei
    w.navigator.canShare = (o) => !!(o && o.files && o.files.length);
    w.navigator.share = (o) => { geteilt = o; return Promise.resolve(); };
    $('kbTeilen').click(); await warte();
    check('Teilen: navigator.share mit einer Datei (Teilen-Menü des Handys)', geteilt && geteilt.files && geteilt.files.length === 1 && geteilt.files[0].name === 'SoLo-Klient.html' && geteilt.title === I18N.de['kb.d.titel']);
    const inhalt = geteilt ? await geteilt.files[0].text() : '';
    check('Geteilte Datei enthält das Blatt, kein Skript', /Für dich zusammengestellt/.test(inhalt) && !/<script/i.test(inhalt));
    // Fallback: Download
    delete w.navigator.share; w.navigator.share = undefined; geladen = null;
    $('kbTeilen').click(); await warte();
    check('Ohne Teilen-Funktion: Download', geladen === 'SoLo-Klient.html' && $('kbMsg').textContent === I18N.de['kb.geladen'].replace('{name}', 'SoLo-Klient.html'));
    check('Nichts geht automatisch raus: ohne Klick kein Teilen', (() => { geteilt = null; return geteilt === null; })());
    // Sprache der App wechselt: Auswahl folgt
    $('kbClose').click();
    check('Zurück schließt das Blatt und vergisst den Inhalt', $('klientBlatt').hidden && !$('app').classList.contains('pm') && $('kbSeite').textContent === '');
    $('kbOpen').click();
    $('beratungBtn').click();
    check('Beratungsmodus aus: Knopf weg, offenes Blatt zu', $('kbOpen').hidden && $('klientBlatt').hidden);
    check('Keine Skriptfehler', errors.length === 0, errors.join(' | '));
    teil2();
  })().catch((e) => { fails++; console.log('FAIL Ausnahme', e && e.stack); teil2(); });
}

// ---------- Teil 2: Modul mit Attrappe (gesperrter Vorgang, XSS, App-Teilen) ----------
function teil2() {
  const dom = new JSDOM('<!doctype html><body><div id="app"></div><button id="kbOpen" hidden></button><section id="klientBlatt" hidden><h2 id="h-kb"></h2><div id="kbWahl"></div>' +
    '<button id="kbDruck"></button><button id="kbTeilen"></button><p id="kbMsg"></p><article id="kbSeite"></article></section></body>', { runScripts: 'outside-only' });
  const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
  w.eval(fs.readFileSync(__dirname + '/../src/klient.js', 'utf8') + '\nwindow.Klient = Klient;');
  const K = w.Klient;
  const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
  let beratung = true, pdfAufruf = null, geschrieben = 0, nativ = false;
  const DE = I18N.de;
  const inhalt = (daten) => daten && daten.geheim
    ? { hilfen: [{ id: 'wohngeld', name: 'Wohngeld', lvl: 'Möglich', betrag: '–', stelle: 'Wohngeldstelle', schritt: 'Antrag stellen' }], unterlagen: [], fristen: [{ id: 'f1', text: 'Widerspruch: 01.12.2026' }], briefe: [] }
    : { hilfen: [{ id: 'kindergeld', name: 'Kindergeld <img src=x onerror="window.boese=1">', lvl: 'Wahrscheinlich', betrag: '255 €', stelle: 'Familienkasse', schritt: 'Antrag' }], unterlagen: [{ id: 'kindergeld', name: 'Kindergeld', items: ['Geburtsurkunde'] }], fristen: [], briefe: [{ id: 'kindergeld', name: 'Kindergeld', text: 'Sehr geehrte Damen und Herren' }] };
  K.init({
    t: (k, p) => { let s = DE[k] || k; if (p) s = s.replace(/\{(\w+)\}/g, (m, x) => (x in p ? p[x] : m)); return s; },
    lang: () => 'de', beratung: () => beratung, sprachen: () => [{ code: 'de', name: 'Deutsch' }, { code: 'en', name: 'English' }],
    inSprache: (l, e, fn) => fn(), inhalt,
    vorgaenge: () => [{ id: 'a', name: 'M.B.', aktiv: true }, { id: 'b', name: 'Geheimer Name', gesperrt: true }],
    daten: () => ({}),
    oeffneGesperrt: (id, pin) => (pin === '1234' ? Promise.resolve({ geheim: true }) : Promise.reject(new Error('PIN'))),
    schreiben: () => { geschrieben++; },
    datum: () => '01.01.2027', rtl: () => false, native: () => nativ, druckArt: () => 'drucken',
    pdf: (seiten, titel, name, msg, art) => { pdfAufruf = { seiten, name, art }; }, blatt: () => {}
  });
  K.sichtbar(true);
  check('[Modul] Knopf im Beratungsmodus mit Ergebnis sichtbar', !$('kbOpen').hidden);
  K.oeffnen();
  check('[Modul] XSS: Name nur als Text, kein Bild, kein Skript', !d.querySelector('#kbSeite img') && !d.querySelector('#kbWahl img') && !w.boese && /<img/.test($('kbSeite').textContent));
  check('[Modul] Musterschreiben angeboten, aber nicht vorausgewählt (Name und Anschrift)', !!d.querySelector('#kbBriefe input[data-kb="b|kindergeld"]') && !d.querySelector('#kbBriefe input').checked && !/Sehr geehrte/.test($('kbSeite').textContent));
  const bcb = d.querySelector('#kbBriefe input'); bcb.checked = true; fire(bcb, 'change');
  check('[Modul] Musterschreiben angehakt: steht im Blatt (deutsch)', /Sehr geehrte/.test($('kbSeite').textContent));
  const sel = $('kbVorgang'), opt = [...sel.options];
  check('[Modul] Gesperrter Vorgang neutral mit Schloss, ohne Namen', opt.length === 2 && opt[1].textContent === '🔒 ' + DE['kb.gesperrt'] && !/Geheimer/.test(sel.textContent));
  sel.value = 'b'; fire(sel, 'change');
  check('[Modul] Auswahl fragt die PIN ab', !d.querySelector('.kb-pin').hidden && d.activeElement === $('kbPin'));
  $('kbPin').value = '0000'; $('kbPinOk').click();
  setTimeout(() => {
    check('[Modul] Falsche PIN: nicht verwendbar, zurück zum geöffneten Vorgang, Meldung', $('kbVorgang').value === 'a' && /Kindergeld/.test($('kbSeite').textContent) && !/Wohngeld/.test($('kbSeite').textContent) && $('kbVgMsg').textContent === DE['kb.pinFalsch']);
    const s2 = $('kbVorgang'); s2.value = 'b'; fire(s2, 'change');
    $('kbPin').value = '1234'; $('kbPinOk').click();
    setTimeout(() => {
      check('[Modul] Richtige PIN: Inhalt des gesperrten Vorgangs (nur im Speicher), PIN-Feld geleert', /Wohngeld/.test($('kbSeite').textContent) && /Widerspruch: 01\.12\.2026/.test($('kbSeite').textContent) && $('kbPin').value === '');
      check('[Modul] Nichts zurückgeschrieben', geschrieben === 0);
      K.drucken();
      check('[Modul] App: Drucken über die vorhandene PDF-Erzeugung', pdfAufruf && pdfAufruf.art === 'drucken' && pdfAufruf.name === 'SoLo-Klient.pdf' && pdfAufruf.seiten[0].blocks.some((b) => /Wohngeld/.test(b.text)));
      nativ = true; pdfAufruf = null; K.teilen();
      check('[Modul] App: Teilen über das Share-Plugin (PDF-Datei)', pdfAufruf && pdfAufruf.art === 'teilen');
      K.schliessen();
      check('[Modul] Schließen vergisst den entsperrten Vorgang', $('kbSeite').textContent === '' && $('kbWahl').textContent === '');
      K.oeffnen();
      check('[Modul] Neu öffnen: wieder der geöffnete Vorgang', /Kindergeld/.test($('kbSeite').textContent) && !/Wohngeld/.test($('kbSeite').textContent));
      beratung = false; K.sichtbar();
      check('[Modul] Privatmodus: Knopf weg, Blatt zu', $('kbOpen').hidden && $('klientBlatt').hidden);
      console.log(fails ? fails + ' Fehler' : 'Alle Prüfungen bestanden');
      process.exit(fails ? 1 : 0);
    }, 20);
  }, 20);
}
