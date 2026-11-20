// Aufforderung zur Senkung der Wohnkosten in der echten Oberfläche (dist, JSDOM): Kachel Jobcenter / Sozialamt / Anderer Brief,
// Text einfügen → Erklärkasten statt Nachrechnung, Bescheid-Formular bleibt zu, Antwort-Entwurf mit Teilen/Drucken,
// Knopf „Frist merken“ nur mit FristenOrdner, Einfache Sprache, alle Sprachen ohne Rohschlüssel, kein eingeschleustes HTML.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
function starte(mem, fristen) {
  const errors = [], gemerkt = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
      if (fristen) w.FristenOrdner = { hinzu: (x) => { gemerkt.push(x); return x.datum === '2027-01-15' ? false : gemerkt.length > 1 ? 'da' : 'neu'; } };
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors, gemerkt };
}
const klick = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const KS_JC = 'Jobcenter Musterstadt\nMusterstadt, den 03.11.2026\nBG-Nummer: 123A1234567\nAufforderung zur Senkung der Kosten der Unterkunft (§ 22 Abs. 1 SGB II)\n' +
  'Ihre tatsächlichen Aufwendungen für die Unterkunft (Bruttokaltmiete) betragen 690,00 EUR monatlich.\n' +
  'Für einen Haushalt mit 2 Personen ist in Musterstadt eine Bruttokaltmiete von 540,00 EUR angemessen (Angemessenheitsgrenze).\n' +
  'Ihre Kosten sind damit unangemessen.\nWir bitten Sie, Ihre Unterkunftskosten bis zum 31.05.2027 zu senken <img src=x onerror=alert(1)>.\n' +
  'Ab dem 01.06.2027 werden nur noch die angemessenen Kosten in Höhe von 540,00 EUR berücksichtigt.\nBitte weisen Sie Ihre Bemühungen (Wohnungssuche) monatlich nach.';
const KS_SA = 'Landratsamt Musterkreis – Sozialamt\nGrundsicherung im Alter und bei Erwerbsminderung nach dem SGB XII\nHinweis zur Angemessenheit Ihrer Unterkunftskosten (§ 35 Abs. 3 SGB XII)\n' +
  'Ihre Bruttokaltmiete von 610,00 € übersteigt die angemessene Miete von 495,00 € für einen Einpersonenhaushalt.\nDie Aufwendungen werden längstens für sechs Monate in tatsächlicher Höhe übernommen.\nWir fordern Sie auf, Ihre Kosten zu senken.';

function lies(w, d, kachel, text) {
  const $ = (id) => d.getElementById(id);
  klick(w, $('goBriefe'));
  if (!$('briefZurueck').closest('[hidden]') && $('checkBox') && !$('checkBox').hidden) klick(w, $('briefZurueck'));
  klick(w, $('brief-' + kachel));
  if ($('elPasteBox').hidden) klick(w, $('elPaste'));
  $('elText').value = text; klick(w, $('elLesen'));
  return d.querySelector('#elErg .el-ks');
}

const A = starte({ 'lotse.ack': '1' }, false);
setTimeout(() => {
  const { w, d } = A, $ = (id) => d.getElementById(id);
  try {
    w.__solo.lang('de');
    let box = lies(w, d, 'jc', KS_JC);
    check('[ks] Kasten in Kachel Jobcenter', !!box);
    check('[ks] Kopf bleibt „Brief von: Jobcenter“', /^Brief von: /.test($('h-briefe').textContent), $('h-briefe').textContent);
    check('[ks] Kernaussage', box && /noch keine Kürzung/.test(box.textContent));
    check('[ks] Zahlen', box && /690/.test(box.textContent) && /540/.test(box.textContent) && /150/.test(box.textContent));
    check('[ks] Frist mit Beleg', box && /31\.05\.2027/.test(box.textContent) && /So steht es im Brief/.test(box.textContent));
    check('[ks] kein Widerspruch gegen den Hinweis', box && /keinen Widerspruch/.test(box.querySelector('.el-ks-ws').textContent));
    check('[ks] Laienansicht ohne Paragrafen', box && !/§/.test(box.querySelector('p:nth-of-type(1)').textContent));
    check('[ks] Details zum Aufklappen', box && box.querySelectorAll('details').length === 5, box && box.querySelectorAll('details').length);
    check('[ks] kein Deckel bei 690/540', box && !box.querySelector('.el-ks-deckel'));
    check('[ks] Bescheid-Formular bleibt zu', $('p-bescheid').classList.contains('pp-zu'));
    check('[ks] kein eingeschleustes Bild', !d.querySelector('#elErg img'));
    check('[ks] ohne FristenOrdner kein Frist-Knopf', !$('ks-frist'));
    check('[ks] Rückmeldung', /Aufforderung, die Wohnkosten zu senken/.test($('elMsg').textContent), $('elMsg').textContent);
    // Antwort-Entwurf
    klick(w, $('ks-antwort'));
    check('[ks] Formular offen', !box.querySelector('.el-ks-antwort').hidden && !$('ks-text').hidden);
    $('ks-g-kinder').checked = true; $('ks-g-kinder').dispatchEvent(new w.Event('change', { bubbles: true }));
    check('[ks] Entwurf mit Kindern und Stelle', /Kita bzw\. Schule/.test($('ks-text').value) && /An: Jobcenter Musterstadt/.test($('ks-text').value) && /BG-Nummer: 123A1234567/.test($('ks-text').value), $('ks-text').value);
    check('[ks] Teilen/Drucken angelegt', !!box.querySelector('.schreiben-aus'));
    // Befund 8: eigene Änderungen im Textfeld werden nicht stillschweigend überschrieben
    check('[ks] ohne eigene Änderung kein Hinweis „neu erstellen“', box.querySelector('.el-ks-neu').hidden);
    $('ks-text').value += 'MEINE ERGÄNZUNG'; $('ks-text').dispatchEvent(new w.Event('input', { bubbles: true }));
    $('ks-g-krank').checked = true; $('ks-g-krank').dispatchEvent(new w.Event('change', { bubbles: true }));
    check('[ks] eigene Änderung bleibt beim Ankreuzen erhalten', /MEINE ERGÄNZUNG/.test($('ks-text').value) && !/Attest/.test($('ks-text').value), $('ks-text').value);
    check('[ks] Knopf „Text neu erstellen“ sichtbar', !box.querySelector('.el-ks-neu').hidden && /eigene Änderungen gehen verloren/.test($('ks-neu').textContent));
    klick(w, $('ks-antwort')); klick(w, $('ks-antwort'));
    check('[ks] Zu- und Aufklappen überschreibt nicht', /MEINE ERGÄNZUNG/.test($('ks-text').value));
    klick(w, $('ks-neu'));
    check('[ks] neu erstellt: mit Attest, ohne eigene Änderung, Hinweis weg', !/MEINE ERGÄNZUNG/.test($('ks-text').value) && /Attest/.test($('ks-text').value) && box.querySelector('.el-ks-neu').hidden);
    $('ks-g-krank').checked = false; $('ks-g-krank').dispatchEvent(new w.Event('change', { bubbles: true }));
    check('[ks] danach wieder automatisch', !/Attest/.test($('ks-text').value));
    // Sozialamt
    box = lies(w, d, 'sa', KS_SA);
    check('[ks] Sozialamt: Detail Sozialamt', box && box.querySelectorAll('details').length === 6 && box.getAttribute('data-traeger') === 'sa');
    klick(w, $('ks-antwort')); $('ks-g-wirt').checked = true; $('ks-g-wirt').dispatchEvent(new w.Event('change', { bubbles: true }));
    check('[ks] Sozialamt-Entwurf: § 35, kein SGB II', /§ 35 Abs\. 3 Satz 3 SGB XII/.test($('ks-text').value) && !/SGB II\b/.test($('ks-text').value), $('ks-text').value);
    // Anderer Brief
    box = lies(w, d, 'an', KS_JC);
    check('[ks] Anderer Brief: KS-Kasten statt allgemeiner Prüfung', !!box);
    // Deckel
    box = lies(w, d, 'jc', KS_JC.replace('690,00', '900,00'));
    check('[ks] Deckel bei 900/540', box && !!box.querySelector('.el-ks-deckel'));
    // Rechtsbehelf
    box = lies(w, d, 'jc', KS_JC + '\nRechtsbehelfsbelehrung: Gegen diesen Bescheid kann Widerspruch erhoben werden.');
    check('[ks] Rechtsbehelf: Widerspruch doch', box && /Widerspruch einlegen kannst/.test(box.querySelector('.el-ks-ws').textContent));
    // Alle Sprachen: keine Rohschlüssel
    LANGS.forEach((l) => {
      w.__solo.lang(l);
      const b = lies(w, d, 'jc', KS_JC); klick(w, $('ks-antwort'));
      check('[ks] ' + l + ': keine Rohschlüssel', b && !/el\.ks\./.test(b.textContent), b && (b.textContent.match(/el\.ks\.[\w.]+/) || [])[0]);
    });
    w.__solo.lang('de');
  } catch (e) { check('Ausnahme: ' + e.message, false, e.stack); }
  check('[ks] keine Skriptfehler', A.errors.length === 0, A.errors);

  // Einfache Sprache und Fristen-Modul
  const B = starte({ 'lotse.ack': '1', 'lotse.einfachSprache': '1' }, true);
  setTimeout(() => {
    const { w: w2, d: d2, gemerkt } = B, $2 = (id) => d2.getElementById(id);
    try {
      w2.__solo.lang('de');
      const box = lies(w2, d2, 'jc', KS_JC);
      check('[ks] Einfache Sprache: Titel', box && /Das Amt sagt: Deine Wohnung kostet zu viel/.test(box.textContent), box && box.querySelector('b').textContent);
      check('[ks] Einfache Sprache: U25-Satz', box && /jünger als 25/.test(box.textContent));
      check('[ks] mit FristenOrdner: Knopf und Datum vorbelegt', !!$2('ks-frist') && $2('ks-frist-datum').value === '2027-05-31');
      klick(w2, $2('ks-antwort'));
      klick(w2, $2('ks-frist'));
      setTimeout(() => {
        check('[ks] Teilen/Drucken sichtbar, sobald das Schreiben da ist', !d2.querySelector('.el-ks .schreiben-aus').hidden);
        check('[ks] Frist übergeben', gemerkt.length === 1 && gemerkt[0].datum === '2027-05-31' && gemerkt[0].art === 'kostensenkung' && gemerkt[0].stelle === 'jc', gemerkt);
        check('[ks] Frist gespeichert gemeldet', /Gespeichert/.test(d2.querySelector('.el-ks-frist [role=status]').textContent));
        $2('ks-frist-datum').value = ''; klick(w2, $2('ks-frist'));
        check('[ks] leeres Datum: Fehlermeldung, nichts übergeben', gemerkt.length === 1 && /nicht geklappt/.test(d2.querySelector('.el-ks-frist [role=status]').textContent));
        const st = () => d2.querySelector('.el-ks-frist [role=status]').textContent;
        $2('ks-frist-datum').value = '2027-05-31'; klick(w2, $2('ks-frist'));
        setTimeout(() => {
          check('[ks] Rückgabe „da“: schon gemerkt', gemerkt.length === 2 && /schon gespeichert/.test(st()), st());
          $2('ks-frist-datum').value = '2027-01-15'; klick(w2, $2('ks-frist'));
          setTimeout(() => {
            check('[ks] Rückgabe false: Fehlermeldung', /nicht geklappt/.test(st()), st());
            check('[ks] keine Skriptfehler (2)', B.errors.length === 0, B.errors);
            console.log(fehler ? '\n' + fehler + ' von ' + n + ' FEHLGESCHLAGEN' : 'Kostensenkung-Oberfläche: alle ' + n + ' Prüfungen bestanden');
            process.exit(fehler ? 1 : 0);
          }, 50);
        }, 50);
      }, 50);
    } catch (e) { check('Ausnahme (2): ' + e.message, false, e.stack); console.log(fehler + ' FEHLGESCHLAGEN'); process.exit(1); }
  }, 300);
}, 300);
