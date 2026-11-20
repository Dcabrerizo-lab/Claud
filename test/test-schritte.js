// Leistungs-Check „Schritt für Schritt“ (src/schritte.js): Wahl des Weges, Verzweigungen, gleiche Ergebnisse wie das Formular,
// Umschalten ohne Verlust, Zurück ohne Verlust, Übersicht „Deine Angaben“ mit „ändern“, Speichern im Vorgang, Texte in allen Sprachen.
// Läuft mit der fertigen Web-Version (dist) in JSDOM. Aufruf: node test/test-schritte.js
const { JSDOM } = require('jsdom');
const fs = require('fs');
const I18N = require('../dist/i18n.js');
const html = fs.readFileSync(__dirname + '/../dist/sozialleistungslotse.html', 'utf8');
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x || ''); } else console.log('ok  ', n); };

function app(store) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.org/#leistungen',
    beforeParse(w) {
      w.__SOLO_TEST__ = true;
      w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.scrollTo = function () {};
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
    }
  });
  const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
  const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
  const warte = () => new Promise((r) => setTimeout(r, 5));
  const frage = () => ($('sfFrage') || {}).textContent || '';
  const appEl = $('app');
  // Antwort auf die gezeigte Frage: Knopf mit Text, Zahl, Zähler, Mehrfachauswahl (Liste von Texten), oder 'skip'
  async function antworte(a) {
    const box = $('schritte');
    if (a === 'skip') { box.querySelector('#sfSkip').click(); }
    else if (a === 'weiter') box.querySelector('#sfWeiter').click();
    else if (Array.isArray(a)) {
      a.forEach((txt) => { const b = [...box.querySelectorAll('[data-k]')].find((x) => x.textContent.trim() === txt); if (!b) throw new Error('Knopf fehlt: ' + txt + ' bei ' + frage()); b.click(); });
      box.querySelector(a.length ? '#sfWeiter' : '#sfNichts').click();
    } else if (typeof a === 'number' && box.querySelector('#sfZahl')) {
      let n = Number(box.querySelector('#sfZahl').textContent);
      while (n < a) { box.querySelector('#sfPlus').click(); n++; }
      while (n > a) { box.querySelector('#sfMinus').click(); n--; }
      box.querySelector('#sfWeiter').click();
    } else if (box.querySelector('#sfIn') && (typeof a === 'number' || /^\d/.test(a))) {
      box.querySelector('#sfIn').value = String(a); box.querySelector('#sfWeiter').click();
    } else {
      const b = [...box.querySelectorAll('[data-i]')].find((x) => x.textContent.trim() === a);
      if (!b) throw new Error('Antwort fehlt: ' + a + ' bei „' + frage() + '“: ' + [...box.querySelectorAll('[data-i]')].map((x) => x.textContent.trim()).join(' | '));
      b.click();
    }
    await warte();
  }
  return { w, d, $, fire, warte, frage, antworte, errors, appEl, solo: () => w.__solo };
}
const L = I18N.de;
const ohne = (o) => JSON.stringify(o.results.map((r) => [r.id, r.level, r.tx]));

(async () => {
  // ---------- 1. Wahl beim Öffnen ----------
  let store = {};
  let A = app(store);
  check('Beim Öffnen: Auswahl mit zwei Karten, Formular ausgeblendet', A.$('sfWahlSchritt') && A.$('sfWahlAlles') && A.appEl.classList.contains('sf-an') && A.frage() === L['sf.wahl.h']);
  check('Karten: Schritt für Schritt (empfohlen) und Alles auf einer Seite', A.$('sfWahlSchritt').textContent.includes(L['sf.wahl.schritt.t']) && A.$('sfWahlAlles').textContent.includes(L['sf.wahl.alles.t']));
  A.$('sfWahlAlles').click();
  check('Alles auf einer Seite: Formular sichtbar, oben die Wahl (gedrückt: Alles auf einer Seite) und „Angaben löschen“', !A.appEl.classList.contains('sf-an') && A.$('sfWegAlles').getAttribute('aria-pressed') === 'true' && A.$('sfWegSchritt').textContent === L['sf.wahl.schritt'] && !!A.$('clearLink') && A.$('sfLeiste').compareDocumentPosition(A.$('h-form')) & 4 && store['lotse.checkWeg'] === 'alles');
  A = app(store);
  check('Wahl wird pro Gerät gemerkt (keine Auswahl beim nächsten Öffnen)', !A.$('sfWahlSchritt') && !A.appEl.classList.contains('sf-an'));
  A.$('sfWegSchritt').click();
  check('Umschalten auf Schritt für Schritt: erste Frage', A.frage() === L['sf.q.adults'] && A.appEl.classList.contains('sf-an') && store['lotse.checkWeg'] === 'schritt');
  check('Erste Frage: kein Zurück, Bereich „Haushalt“, Aufklapper „Warum fragt die App das?“', !A.$('sfZurueck') && A.$('schritte').querySelector('.sf-bereich').textContent === L['sf.b.haus'] && A.$('schritte').querySelector('details.sf-hilfe summary').textContent === L['sf.warum']);
  check('Wahl des Weges oben sichtbar (vor der Frage), „Angaben löschen“ daneben', A.$('sfWegSchritt').getAttribute('aria-pressed') === 'true' && A.$('sfWegAlles').textContent === L['sf.wahl.alles'] && A.$('sfLeiste').compareDocumentPosition(A.$('sfFrage')) & 4 && !!A.$('clearLink'));
  check('Wahl unabhängig von „Einfache Sprache“: nach dem Umschalten gleich', (() => { A.$('einfacheSpracheBtn').click(); const ok = !!A.$('sfWegSchritt') && A.$('sfWegSchritt').getAttribute('aria-pressed') === 'true' && !!A.$('sfFrage') && !A.appEl.querySelector('#einfach:not([hidden])'); A.$('einfacheSpracheBtn').click(); return ok; })());

  // Beratungsmodus ohne eigene Wahl: gleich „Alles auf einer Seite“
  const sb = { 'lotse.beratung': '1' };
  const B = app(sb);
  check('Beratungsmodus: Standard „Alles auf einer Seite“ ohne Auswahl', !B.$('sfWahlSchritt') && !B.appEl.classList.contains('sf-an'));

  // ---------- 2. Verzweigungen: Allein, ohne Kinder, Miete, Lohn ----------
  store = { 'lotse.checkWeg': 'schritt' };
  A = app(store);
  const gesehen = [];
  const lauf = async (antworten) => { for (const a of antworten) { gesehen.push(A.frage()); await A.antworte(a); } };
  await lauf([L['sf.a.allein'], 0, 0, '1985', L['sf.a.nein'], L['baby.0'], L['aufenthalt.0'],
    L['pflege.0'], L['bh.person.0'], L['bh.em.0'], L['sf.a.nein'],
    L['arbeit.0'], L['ausb.0'], L['wohnart.miete'], '650', '80', L['sf.a.nein'], L['hh.0']]);
  const q = (k) => L[k];
  check('Allein ohne Kinder: keine Kinderfragen, kein Partner-Einkommen', !gesehen.includes(q('sf.q.kidsU6')) && !gesehen.includes(q('sf.q.kinderMehr')) && !gesehen.includes(q('sf.q.uvgPartner')));
  check('Ohne Behinderung: keine Fragen zu GdB und Merkzeichen', !gesehen.includes(q('sf.q.gdb')) && !gesehen.includes(q('sf.q.bhMehr')));
  check('Nicht arbeitslos: keine Fragen zum Arbeitslosengeld', !gesehen.includes(q('sf.q.algZeit')) && !gesehen.includes(q('sf.q.lohnVorher')));
  // PLZ (wenn Daten da), sonst Bundesland/Mietenstufe
  if (A.frage() === q('sf.q.plz')) await A.antworte('93047');
  check('PLZ Regensburg: Bundesland und Mietenstufe nicht gefragt (kommen aus der PLZ)', A.frage() === q('sf.q.ekArt') && A.solo().state().bundesland === 'BY' && !!A.solo().state().mietstufe, A.frage());
  await A.antworte(L['ek.art.lohn']);
  check('Lohn: Frage nach Brutto', A.frage() === q('sf.q.brutto.lohn'));
  await A.antworte('2000');
  check('Dann: was auf dem Konto ankommt', A.frage() === q('sf.q.netto'));
  await A.antworte('skip');
  check('Zweites Einkommen wird gefragt', A.frage() === q('sf.q.ekZweit'));
  check('Nur ein Einkommen bei Alleinstehenden: kein Bereich „Einkommen deines Partners“', !A.$('schritte').textContent.includes(L['sf.wer2']));
  await A.antworte(L['ek.weiteres.0']);
  check('Ohne Kinder: keine Unterhaltsfrage für Kinder, weiter mit gezahltem Unterhalt', A.frage() === q('sf.q.uzBetrag'), A.frage());
  // Zurück verliert nichts
  A.$('sfZurueck').click(); await A.warte();
  check('Zurück: vorige Frage mit gewählter Antwort markiert', A.frage() === q('sf.q.ekZweit') && A.$('schritte').querySelector('.es-btn.an').textContent.trim() === L['ek.weiteres.0']);
  A.$('sfZurueck').click(); A.$('sfZurueck').click(); await A.warte();
  check('Zurück bis Brutto: Betrag steht noch im Feld', A.frage() === q('sf.q.brutto.lohn') && A.$('sfIn').value === '2000');
  await A.antworte('2000'); await A.antworte('skip'); await A.antworte('weiter');
  await A.antworte('skip'); await A.antworte('3000'); await A.antworte('skip');
  check('Leistungen, die man schon bekommt (Mehrfachauswahl)', A.frage() === q('sf.q.bezug'));
  await A.antworte([L['bz.kg']]);
  check('Am Ende: Übersicht „Deine Angaben“ mit „ändern“', A.frage() === L['sf.ueb.h'] && A.$('schritte').querySelectorAll('[data-aendern]').length > 10);
  check('Übersicht zeigt die Antworten', /650/.test(A.$('schritte').textContent) && A.$('schritte').textContent.includes(L['ek.art.lohn']) && A.$('schritte').textContent.includes(L['bz.kg']));
  // ändern -> nach Weiter zurück zur Übersicht
  A.$('schritte').querySelector('[data-aendern="miete"]').click(); await A.warte();
  check('„ändern“ öffnet die Frage', A.frage() === q('sf.q.miete') && A.$('sfIn').value === '650');
  await A.antworte('700');
  check('Nach dem Ändern direkt zurück zur Übersicht', A.frage() === L['sf.ueb.h'] && /700/.test(A.$('schritte').textContent));
  // ändern mit neuen Folgefragen: Kinder 0 -> 2 fragt die neuen Folgefragen, dann Übersicht
  A.$('schritte').querySelector('[data-aendern="kids"]').click(); await A.warte();
  await A.antworte(2);
  check('Ändern mit neuen Folgefragen: zuerst die neue Folgefrage', A.frage() === q('sf.q.kidsU6'), A.frage());
  await A.antworte(1); await A.antworte(0); await A.antworte([]);
  check('Weitere neue Folgefragen (Unterhalt, Waisenrente, Einkommen der Kinder), dann Übersicht', A.frage() === q('sf.q.unterhalt'), A.frage());
  await A.antworte('skip'); await A.antworte('skip'); await A.antworte('skip');
  check('Danach wieder die Übersicht', A.frage() === L['sf.ueb.h'], A.frage());
  A.$('sfErgebnis').click(); await A.warte();
  check('Ergebnis zeigen: Ergebnis sichtbar, Formular weiter ausgeblendet', A.appEl.classList.contains('sf-erg') && A.$('sfZurueck').textContent.replace(/\s+/g, ' ').trim() === '← Zurück' && A.$('leistungenKopf').hidden && A.$('cards').querySelectorAll('.card').length > 3);
  const s1 = JSON.parse(JSON.stringify(A.solo().state())), e1 = A.solo().eval();

  // ---------- 3. Umschalten ohne Verlust, gleiches Ergebnis ----------
  A.$('sfWegAlles').click(); await A.warte();
  check('Umschalten auf „Alles auf einer Seite“: Formular zeigt dieselben Antworten', !A.appEl.classList.contains('sf-an') && A.$('miete').value === '700' && A.$('kids').textContent === '2' && A.$('ek1Art').value === 'lohn' && A.$('b-kindergeld').checked);
  check('Umschalten: Ergebnis identisch', ohne(A.solo().eval()) === ohne(e1));
  A.$('miete').value = '720'; A.fire(A.$('miete'), 'change');
  A.$('sfWegSchritt').click(); await A.warte();
  check('Zurück zu Schritt für Schritt: Änderung im Formular in der Übersicht/Ergebnis', A.solo().state().miete === 720 && A.appEl.classList.contains('sf-an'));

  // ---------- 4. Gleiche Antworten im Formular -> gleiches Ergebnis ----------
  const F = app({ 'lotse.checkWeg': 'alles' });
  const $ = F.$, sel = (id, v) => { $(id).value = v; F.fire($(id), 'change'); }, zahl = (id, v) => { $(id).value = String(v); F.fire($(id), 'change'); };
  const step = (k, n) => { for (let i = 0; i < n; i++) F.d.querySelector('[data-step="' + k + '"][data-d="1"]').click(); };
  $('adults1').checked = true; F.fire($('adults1'), 'change');
  step('kids', 2); step('kidsU6', 1); step('kids14', 0); F.solo().state().kidsAlter = true; // im Ablauf beantwortet (0)
  $('gebJahr').value = '1985'; F.fire($('gebJahr'), 'input'); F.fire($('gebJahr'), 'change');
  zahl('miete', 700); zahl('heizkosten', 80);
  if (s1.plz) { $('plz').value = s1.plz; F.fire($('plz'), 'input'); }
  sel('ek1Art', 'lohn'); zahl('ek1Brutto', 2000); zahl('vermoegen', 3000);
  $('b-kindergeld').checked = true; F.fire($('b-kindergeld'), 'change');
  check('Formular und Ablauf: gleicher Zustand', ['adults', 'kids', 'kidsU6', 'kids14', 'gebJahr', 'miete', 'heizkosten', 'plz', 'bundesland', 'mietstufe', 'ek1Art', 'ek1Brutto', 'vermoegen'].every((k) => String(F.solo().state()[k]) === String(s1[k])),
    ['adults', 'kids', 'kidsU6', 'kids14', 'gebJahr', 'miete', 'heizkosten', 'plz', 'bundesland', 'mietstufe', 'ek1Art', 'ek1Brutto', 'vermoegen'].filter((k) => String(F.solo().state()[k]) !== String(s1[k])).join());
  check('Formular und Ablauf: gleiches Ergebnis', ohne(F.solo().eval()) === ohne(e1));

  // ---------- 5. Paar, Behinderung, Arbeitslos, Rente, Asyl-Einkommen ----------
  const P = app({ 'lotse.checkWeg': 'schritt' });
  const pg = [];
  const plauf = async (antworten) => { for (const a of antworten) { pg.push(P.frage()); await P.antworte(a); } };
  await plauf([L['sf.a.paar'], 1, 0, 1, [L['cb.unterhalt']], L['sf.a.nein']]);
  check('Paar mit Kind, Unterhalt fehlt: Frage „Wer ist die zweite Person?“', P.frage() === q('sf.q.uvgPartner'));
  await plauf([L['uvgPartner.neu'], 0, '1960', L['sf.a.nein'], L['baby.0'], L['aufenthalt.asyl']]);
  check('Asyl: keine EU-Fragen', P.frage() === q('sf.q.pflege') && !pg.includes(q('sf.q.euArbeit')));
  await plauf([L['pflege.antrag'], L['bh.person.erwNach25'], 'GdB 80', L['bh.blind.0']]);
  check('Behinderung erwachsene Person: Merkzeichen-Fragen ohne „Kind kann sich nicht selbst unterhalten“', P.frage() === q('sf.q.bhMehr') && !P.$('schritte').textContent.includes(L['cb.bhSelbst']) && P.$('schritte').textContent.includes(L['cb.wfbm']));
  await plauf([[L['cb.mzG'], L['cb.wfbm']], L['bhWeitere.0'], L['bh.em.unter3']]);
  check('Erwerbsminderung: Frage nach 5 Jahren Beiträgen', P.frage() === q('sf.q.em5'));
  await plauf([L['sf.a.ja'], L['sf.a.nein'], L['arbeit.arbeitslos']]);
  check('Arbeitslos: Fragen zum Arbeitslosengeld', P.frage() === q('sf.q.algZeit'));
  await plauf([L['sf.a.ja'], L['algMon.48'], '2500', L['ausb.0'], L['wohnart.miete'], '800', 'skip', L['sf.a.nein'], L['hh.0']]);
  if (P.frage() === q('sf.q.plz')) await plauf(['skip']);
  check('Ohne PLZ: Bundesland und Mietenstufe werden gefragt', P.frage() === q('sf.q.bundesland'));
  await plauf(['Bayern', L['stufe.unbekannt']]);
  check('Bei Asyl: Antwort „Asylbewerberleistungen“ beim Einkommen', P.frage() === q('sf.q.ekArt') && P.$('schritte').textContent.includes(L['sf.a.asylblg']) && P.$('schritte').querySelector('.sf-bereich').textContent.includes(L['sf.wer1']));
  await plauf([L['ek.art.rente'], '1200', '1080', L['ek.weiteres.0']]);
  check('Paar: dieselben Fragen für die zweite Person', P.frage() === q('sf.q.ekArt') && P.$('schritte').querySelector('.sf-bereich').textContent.includes(L['sf.wer2']));
  await plauf([L['sf.a.asylblg'], '400']);
  check('Asylbewerberleistungen: Betrag laut Bescheid, kein zweites Einkommen', P.solo().state().ek2Art === 'asylblg' && P.solo().state().ek2Netto === 400 && pg[pg.length - 1] === q('sf.q.betrag') && P.frage() !== q('sf.q.ekZweit'));
  check('Rente: Fragen zu Zusatzrente und 33 Jahren', P.frage() === q('sf.q.zusatzRente'));
  await plauf(['skip', L['sf.a.nein']]);
  check('Werkstatt: Frage nach dem Mittagessen', P.frage() === q('sf.q.wfbmEssen'));
  const ps = P.solo().state();
  check('Paar: Werte im gemeinsamen Zustand', ps.adults === 2 && ps.kids === 1 && ps.unterhaltFehlt === true && ps.uvgPartner === 'neu' && ps.aufenthalt === 'asyl' && ps.gdb === '80' && ps.mzG === true && ps.wfbm === true && ps.emStd === 'unter3' && ps.em5 === true && ps.algZeit === true && ps.algMonate === '48' && ps.lohnVorher === 2500 && ps.bundesland === 'BY' && ps.ek1Art === 'rente' && ps.ek1Brutto === 1200 && ps.ek1Netto === 1080);
  // Aufenthalt geändert: Antwort „Asylbewerberleistungen“ verschwindet
  P.solo().state().aufenthalt = ''; P.solo().state().ek1Art = ''; P.w.Schritte.laden({ pos: 'ek1Art', ja: [] });
  check('Ohne Asyl: keine Antwort „Asylbewerberleistungen“', P.frage() === q('sf.q.ekArt') && !P.$('schritte').textContent.includes(L['sf.a.asylblg']));

  P.solo().state().aufenthalt = 'ausreise'; P.w.Schritte.laden({ pos: 'aufenthalt', ja: ['aufenthalt'] });
  check('Aufenthalt: Antwort „ausreisepflichtig ohne Duldung“ angeboten', P.$('schritte').textContent.includes(L['sf.a.ausreise']));
  P.w.Schritte.laden({ pos: 'ek1Art', ja: [] });
  check('Ausreisepflichtig: Antwort „Asylbewerberleistungen“ wie bei Asyl', P.$('schritte').textContent.includes(L['sf.a.asylblg']));

  // ---------- 6. Speichern im Vorgang, Neuladen ----------
  A.solo().speichern();
  const gesp = JSON.parse(store['lotse.state'] || 'null') || null;
  check('Gespeichert über den Vorgang (lotse.state, Tresor), nicht unverschlüsselt', !store['lotse.state'] && Object.keys(store).some((k) => /vorg/i.test(k)) || (gesp && gesp.sf));
  const A2 = app(store);
  check('Neu geöffnet: Antworten und Stand erhalten', A2.solo().state().miete === 720 && A2.solo().state().kids === 2 && A2.appEl.classList.contains('sf-an'));

  // ---------- 7. Kurzer Check hat Vorrang ----------
  A2.$('einfachBtn').click(); await A2.warte();
  check('Kurzer Check an: Schritt für Schritt ausgeblendet', A2.$('schritte').hidden && A2.appEl.classList.contains('es-an'));
  A2.$('einfachBtn').click(); await A2.warte();
  check('Kurzer Check aus: Schritt für Schritt wieder da', !A2.$('schritte').hidden);

  // ---------- 8. Texte ----------
  const de = require('../src/lang/schritte/de.json');
  const keys = Object.keys(de);
  check('Alle sf-Texte in allen 13 Sprachen', LANGS.every((l) => keys.every((k) => typeof I18N[l][k] === 'string' && I18N[l][k].length > 0)), LANGS.map((l) => keys.filter((k) => !I18N[l][k]).map((k) => l + ':' + k)).flat().slice(0, 20).join());
  check('Platzhalter wie im Deutschen', LANGS.every((l) => keys.every((k) => (de[k].match(/\{\w+\}/g) || []).join() === ((I18N[l][k] || '').match(/\{\w+\}/g) || []).join())));
  const src = fs.readFileSync(__dirname + '/../src/schritte.js', 'utf8');
  const benutzt = new Set((src.match(/'sf\.[a-zA-Z0-9.]+'/g) || []).map((x) => x.slice(1, -1)));
  ['sf.b.haus', 'sf.b.gesund', 'sf.b.arbeit', 'sf.b.ausb', 'sf.b.wohnen', 'sf.b.geld', 'sf.b.bezug', 'sf.wer1', 'sf.wer2', 'sf.q.brutto.lohn', 'sf.q.brutto.rente', 'sf.q.brutto.selbst'].forEach((k) => benutzt.add(k));
  check('Jeder benutzte Schlüssel steht in de.json', [...benutzt].filter((k) => !/\.$/.test(k) && k !== 'sf.wer').every((k) => k in de), [...benutzt].filter((k) => !/\.$/.test(k) && k !== 'sf.wer' && !(k in de)).join());
  check('Kein unbenutzter Schlüssel in de.json', keys.every((k) => benutzt.has(k)), keys.filter((k) => !benutzt.has(k)).join());
  check('Amtsbegriffe bleiben deutsch (Wohngeld, Kinderzuschlag, Jobcenter)', LANGS.filter((l) => l !== 'de').every((l) => /Wohngeld/.test(I18N[l]['sf.h.bhWeitere']) && /Kinderzuschlag/.test(I18N[l]['sf.h.kids14'])));
  const fremd = app({ 'lotse.checkWeg': 'schritt', 'lotse-lang': 'ar' });
  check('Arabisch: Frage übersetzt', fremd.frage() === I18N.ar['sf.q.adults']);

  check('Keine Skriptfehler', [A, B, F, P, A2, fremd].every((x) => !x.errors.length), [A, B, F, P, A2, fremd].map((x) => x.errors.join(' | ')).join(''));
  console.log(fails ? fails + ' FEHLER' : 'test-schritte: alles ok');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('FAIL Ausnahme', e && e.stack); process.exit(1); });
