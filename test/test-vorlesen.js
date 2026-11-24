// Vorlesen (src/vorlesen.js): Knopf, Textauswahl (nur Sichtbares), Sprachzuordnung, Tempo, Stopp, Fehlen einer Stimme.
// Mit JSDOM und nachgebauter Web Speech API (speechSynthesis), ohne Browser.
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FEHLER ' + name + (info !== undefined ? ' – ' + info : '')); } };
const ROOT = path.join(__dirname, '..');
const CODE = fs.readFileSync(path.join(ROOT, 'src', 'vorlesen.js'), 'utf8');
const sprache = (l) => JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'lang', 'vorlesen', l + '.json'), 'utf8'));
const LANGS = require(path.join(ROOT, 'scripts', 'build.js')).LANGS;

function umgebung(stimmen, html, lang) {
  const dom = new JSDOM('<!doctype html><html lang="' + (lang || 'de') + '"><head></head><body>' + html + '</body></html>', { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const gesprochen = [];
  let offen = null; // laufende Äußerung (endet erst, wenn der Test es sagt)
  w.SpeechSynthesisUtterance = function (text) { this.text = text; };
  w.speechSynthesis = {
    getVoices: () => stimmen.map((l) => ({ lang: l, name: 'Stimme ' + l })),
    speak: (u) => { gesprochen.push({ text: u.text, lang: u.lang, rate: u.rate }); offen = u; },
    cancel: () => { const u = offen; offen = null; if (u && u.onerror) u.onerror({ error: 'canceled' }); },
    addEventListener: () => {}
  };
  w.I18N = {}; LANGS.forEach((l) => { w.I18N[l] = sprache(l); });
  w.eval(CODE);
  const fertig = async () => { const u = offen; offen = null; if (u && u.onend) u.onend(); await new Promise((r) => setTimeout(r, 0)); };
  return { w, d: w.document, V: w.VORLESEN, gesprochen, fertig, offen: () => offen };
}

const SEITE =
  '<nav><a href="#">Start</a></nav>' +
  '<main id="seite">' +
  '<h2>Pflegegeld</h2>' +
  '<p>Pflegegeld bekommst du ab <strong>Pflegegrad 2</strong>.</p>' +
  '<p hidden>Versteckter Absatz</p>' +
  '<div style="display:none"><p>Unsichtbar per Stil</p></div>' +
  '<div aria-hidden="true">Nur Deko</div>' +
  '<details><summary>Mehr dazu</summary><p>Zugeklappter Inhalt</p></details>' +
  '<details open><summary>Offen</summary><p>Aufgeklappter Inhalt</p></details>' +
  '<ul><li>Erster Punkt</li><li>Zweiter <a href="tel:1">Punkt</a></li></ul>' +
  '<label>Feld <input value="Geheim"></label>' +
  '<div data-vorlesen="nein">Nicht lesen</div>' +
  '<p lang="de">Deutscher Satz.</p>' +
  '</main>';

(async () => {
  // 1. Knopf erscheint, oben im Container, einmal
  {
    const e = umgebung(['de-DE', 'ar-SA'], SEITE);
    const seite = e.d.getElementById('seite');
    const leiste = e.V.knopf(seite);
    check('Leiste erzeugt', !!leiste && leiste.classList.contains('vl-leiste'));
    check('Leiste steht oben im Container', seite.firstElementChild === leiste);
    check('Leiste sichtbar', !leiste.hidden);
    const k = leiste.querySelector('.vl-knopf');
    check('Knopf beschriftet „Vorlesen“', /Vorlesen/.test(k.textContent), k.textContent);
    check('Knopf groß (Stil vorhanden)', /min-height:56px/.test(e.d.getElementById('vl-stil').textContent));
    e.V.knopf(seite);
    check('zweiter Aufruf: keine zweite Leiste', seite.querySelectorAll('.vl-leiste').length === 1);

    // 2. Textauswahl: nur Sichtbares, Leiste selbst nicht
    const texte = e.V._bloecke(seite).map((b) => b.text);
    const alles = texte.join(' | ');
    check('liest Überschrift', texte.includes('Pflegegeld'), alles);
    check('Absatz mit Hervorhebung als ein Block', texte.includes('Pflegegeld bekommst du ab Pflegegrad 2.'), alles);
    ['Versteckter Absatz', 'Unsichtbar per Stil', 'Nur Deko', 'Zugeklappter Inhalt', 'Nicht lesen', 'Geheim', 'Start', 'Tempo'].forEach((x) =>
      check('liest nicht: ' + x, alles.indexOf(x) < 0, alles));
    check('liest Überschrift zugeklappter Details', texte.includes('Mehr dazu'), alles);
    check('liest aufgeklappten Inhalt', texte.includes('Aufgeklappter Inhalt'), alles);
    check('liest Listenpunkte einzeln', texte.includes('Erster Punkt') && texte.includes('Zweiter Punkt'), alles);
    check('Leiste wird nicht vorgelesen', alles.indexOf('Vorlesen') < 0, alles);

    // 3. Vorlesen der Reihe nach, Markierung, Stopp
    k.click();
    await new Promise((r) => setTimeout(r, 0));
    check('spricht ersten Block', e.gesprochen.length === 1 && e.gesprochen[0].text === 'Pflegegeld', JSON.stringify(e.gesprochen));
    check('Sprache de-DE', e.gesprochen[0].lang === 'de-DE', e.gesprochen[0].lang);
    check('Tempo normal = 1', e.gesprochen[0].rate === 1);
    check('erster Block markiert', e.d.querySelector('.vl-aktiv') && e.d.querySelector('.vl-aktiv').textContent === 'Pflegegeld');
    check('Knopf zeigt „Stopp“', /Stopp/.test(k.textContent) && k.getAttribute('aria-pressed') === 'true', k.textContent);
    await e.fertig();
    check('dann zweiter Block', e.gesprochen.length === 2 && /Pflegegrad 2/.test(e.gesprochen[1].text), JSON.stringify(e.gesprochen));
    k.click(); // Stopp
    await new Promise((r) => setTimeout(r, 0));
    check('Stopp: läuft nicht mehr', !e.V._laeuft());
    check('Stopp: keine Markierung', !e.d.querySelector('.vl-aktiv'));
    check('Stopp: Knopf wieder „Vorlesen“', /Vorlesen/.test(k.textContent) && k.getAttribute('aria-pressed') === 'false');
    const vorher = e.gesprochen.length;
    await e.fertig();
    check('nach Stopp wird nichts mehr gesprochen', e.gesprochen.length === vorher);

    // 4. Tempo langsam
    leiste.querySelector('.vl-tempo').click();
    check('Tempo-Knopf zeigt langsam', /langsam/.test(leiste.querySelector('.vl-tempo').textContent));
    e.V.lesen('Ein Satz.');
    await new Promise((r) => setTimeout(r, 0));
    check('Tempo langsam = 0.75', e.gesprochen[e.gesprochen.length - 1].rate === 0.75);
    e.V.stop();
  }

  // 5. Sprachzuordnung: arabische App, deutscher Block auf Deutsch; Beschriftung arabisch
  {
    const e = umgebung(['de-DE', 'ar-EG'], SEITE, 'ar');
    const seite = e.d.getElementById('seite');
    const leiste = e.V.knopf(seite);
    check('Beschriftung auf Arabisch', leiste.querySelector('.vl-knopf').textContent.indexOf(sprache('ar')['vl.lesen']) >= 0);
    e.V.lesen(seite);
    await new Promise((r) => setTimeout(r, 0));
    check('arabische Seite: Stimme ar-*', /^ar/.test(e.gesprochen[0].lang), e.gesprochen[0].lang);
    for (let i = 0; i < 20 && e.offen(); i++) await e.fertig();
    const de = e.gesprochen.find((g) => g.text === 'Deutscher Satz.');
    check('Block mit lang="de" auf Deutsch', de && de.lang === 'de-DE', JSON.stringify(de));
  }

  // 6. Zuordnung aller 13 Sprachen, Dari mit Persisch als Ersatz
  {
    const e = umgebung([], '<p>x</p>');
    LANGS.forEach((l) => check('BCP-47 für ' + l, Array.isArray(e.V._bcp[l]) && e.V._bcp[l].length > 0));
    const d = umgebung(['fa-IR'], '<main id="m"><p>متن</p></main>', 'fa-AF');
    check('Dari: Persisch-Stimme als Ersatz verfügbar', d.V.verfuegbar('fa-AF') === true);
    d.V.lesen(d.d.getElementById('m'));
    await new Promise((r) => setTimeout(r, 0));
    check('Dari: spricht mit fa-IR', d.gesprochen[0] && d.gesprochen[0].lang === 'fa-IR', JSON.stringify(d.gesprochen));
  }

  // 7. Keine Stimme für die Sprache: Knopf aus, Hinweis an, kein Absturz
  {
    const e = umgebung(['de-DE'], '<main id="m"><p>Qoraal</p></main>', 'so');
    const leiste = e.V.knopf(e.d.getElementById('m'));
    check('Somali ohne Stimme: verfügbar = false', e.V.verfuegbar('so') === false);
    check('Knopf ausgeblendet', leiste.querySelector('.vl-knopf').hidden);
    const h = leiste.querySelector('.vl-hinweis');
    check('Hinweis sichtbar auf Somali', !h.hidden && h.textContent === sprache('so')['vl.keineStimme'], h.textContent);
  }

  // 8. Gar keine Sprachausgabe: Leiste aus
  {
    const dom = new JSDOM('<!doctype html><html lang="de"><body><main id="m"><p>a</p></main></body></html>', { runScripts: 'outside-only' });
    dom.window.eval(CODE);
    const l = dom.window.VORLESEN.knopf(dom.window.document.getElementById('m'));
    check('ohne Sprachausgabe: Leiste versteckt', l.hidden);
    let ok = true; try { await dom.window.VORLESEN.lesen('x'); dom.window.VORLESEN.stop(); } catch (err) { ok = false; }
    check('ohne Sprachausgabe: kein Absturz', ok);
  }

  // 9. Sprachwechsel hält an
  {
    const e = umgebung(['de-DE', 'en-GB'], SEITE);
    const seite = e.d.getElementById('seite');
    const leiste = e.V.knopf(seite);
    e.V.lesen(seite);
    await new Promise((r) => setTimeout(r, 0));
    e.d.documentElement.setAttribute('lang', 'en');
    await new Promise((r) => setTimeout(r, 0));
    check('Sprachwechsel: Vorlesen angehalten', !e.V._laeuft());
    check('Sprachwechsel: Beschriftung Englisch', /Read aloud/.test(leiste.querySelector('.vl-knopf').textContent), leiste.querySelector('.vl-knopf').textContent);
  }

  // 10. App (Capacitor): Plugin TextToSpeech wird statt Web Speech genutzt
  {
    const dom = new JSDOM('<!doctype html><html lang="tr"><body><main id="m"><p>Merhaba</p></main></body></html>', { runScripts: 'outside-only' });
    const w = dom.window, aufrufe = [];
    w.Capacitor = { isNativePlatform: () => true, Plugins: { TextToSpeech: {
      isLanguageSupported: ({ lang }) => Promise.resolve({ supported: lang === 'tr-TR' }),
      speak: (o) => { aufrufe.push(o); return Promise.resolve(); },
      stop: () => Promise.resolve()
    } } };
    w.eval(CODE);
    const l = w.VORLESEN.knopf(w.document.getElementById('m'));
    await new Promise((r) => setTimeout(r, 0));
    check('App: Stimme tr-TR erkannt', w.VORLESEN.verfuegbar('tr') === true);
    check('App: Knopf sichtbar', !l.hidden && !l.querySelector('.vl-knopf').hidden);
    await w.VORLESEN.lesen(w.document.getElementById('m'));
    check('App: Plugin spricht mit tr-TR', aufrufe.length === 1 && aufrufe[0].lang === 'tr-TR' && aufrufe[0].text === 'Merhaba', JSON.stringify(aufrufe));
  }

  // 11. Texte: alle Sprachen mit allen Schlüsseln, nicht leer
  {
    const keys = Object.keys(sprache('de'));
    LANGS.forEach((l) => { const o = sprache(l); keys.forEach((k) => check('Text ' + l + ' ' + k, typeof o[k] === 'string' && o[k].trim().length > 0)); });
  }

  console.log('Vorlesen-Test: ' + (n - fehler) + '/' + n + ' Prüfungen bestanden');
  process.exit(fehler ? 1 : 0);
})();
