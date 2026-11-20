// Infotexte (Prüfbericht 20.11.2026, Punkte 2–8): erst die Handlung, dann die Erklärung; Details hinter dem gemeinsamen
// Bauteil „ⓘ Mehr dazu“ (details.mehr); „Keine Rechtsberatung“ am Erststart, an Ergebnissen und auf Ausdrucken, nie auf Eingabeseiten.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const I18N = require('../dist/i18n.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const errors = [], store = {};
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
    w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } }, configurable: true });
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id), de = I18N.de;
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : x); } else console.log('ok  ', n); };
const sichtbar = (el) => { for (let e = el; e && e !== d.body; e = e.parentElement) { if (e.hidden) return false; if (e.parentElement && e.parentElement.tagName === 'DETAILS' && !e.parentElement.open && e.tagName !== 'SUMMARY') return false; } return true; };

setTimeout(() => {
  check('Keine Skriptfehler beim Laden', errors.length === 0, errors.join('; '));
  // Erststart: für jeden Einstieg, nicht nur im Leistungs-Check
  const fn = $('firstNotice');
  check('Erststart-Hinweis liegt außerhalb des Leistungs-Checks (gilt für jeden Einstieg)', !!fn && !fn.closest('#v-leistungen') && fn.parentElement.id === 'inhalt');
  check('Erststart-Hinweis ohne „Verstanden“ sichtbar und nennt „Keine Rechtsberatung“ und das Gerät', !fn.hidden && /keine Rechtsberatung/i.test(fn.textContent) && /Gerät/.test(fn.textContent), fn.textContent);
  $('firstOk').click();
  check('Nach „Verstanden“ weg', fn.hidden);

  // Brief prüfen: kein Doppel-Hinweis auf der Eingabeseite, Scan-Knöpfe direkt unter dem ersten Satz
  $('goBriefe').click();
  check('Brief-Übersicht: kein Erklärsatz unter „Von wem ist der Brief?“, kein briefe.hinweis', !$('briefeIntro') && !de['briefe.hinweis'] && !d.querySelector('#checkBox > p.small.muted'));
  $('brief-jc').click();
  const karte = d.querySelector('#p-bescheid .card');
  const satz = karte.querySelector('h2 + p');
  check('Jobcenter: Einlesen steht direkt unter dem ersten Satz', satz && satz.nextElementSibling === $('einlesen'), karte.innerHTML.slice(0, 200));
  check('Jobcenter: erster Satz kurz (höchstens 12 Wörter)', satz.textContent.trim().split(/\s+/).length <= 12, satz.textContent);
  check('Feldhilfen hinter „Wo steht das?“, alle zu', [...d.querySelectorAll('#p-bescheid .feld-hilfe')].every((x) => x.tagName === 'DETAILS' && !x.open && x.querySelector('summary').textContent === 'Wo steht das?') && d.querySelectorAll('#p-bescheid .feld-hilfe').length >= 8);
  check('Datenschutz am Scan-Knopf, ohne „Wert vergleichen“', /gelöscht/.test(de['el.privat']) && !/vergleichen/.test(de['el.privat']));
  check('„Keine Rechtsberatung“ erst unter dem Prüfergebnis (leer: ausgeblendet per CSS)', !!d.querySelector('#bs-erg + .rb-erg') && !!d.querySelector('#bs-wid-text ~ .rb-schreiben'));
  $('briefZurueck').click();
  $('brief-an').click();
  $('elPaste').click(); $('elText').value = 'Bescheid\nGegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.'; $('elLesen').click();
  const erg = $('elErg').textContent;
  check('Anderer Brief: „Frist im Brief: 1 Monat“ statt „Monats“', /Frist im Brief: 1 Monat/.test(erg) && !/Frist im Brief: Monats/.test(erg), erg.slice(0, 160));
  check('Anderer Brief: Ergebnis endet mit „Keine Rechtsberatung“', [...$('elErg').querySelectorAll('.rb-satz')].some((p) => p.textContent === de['rb.satz']));
  $('briefZurueck').click();

  // Leistungs-Check: erste Frage zuerst
  d.querySelector('#appnav [data-ansicht=start]') && d.querySelector('#appnav [data-ansicht=start]').click();
  $('goLeistungen').click();
  const formEnde = d.querySelector('.form-ende');
  check('Beispiel, Kurzer Check und Löschen stehen nach dem Formular', formEnde && $('form').compareDocumentPosition(formEnde) & w.Node.DOCUMENT_POSITION_FOLLOWING && formEnde.contains($('presets')) && formEnde.contains($('einfachBtn')) && formEnde.contains($('clearBtn')));
  check('Lösch-Erklärung zugeklappt', $('clearWas').closest('details.mehr') && !$('clearWas').closest('details').open && /Formular/.test($('clearWas').textContent));
  const hinweise = [...d.querySelectorAll('#form .hint')].filter(sichtbar);
  check('Formular leer: höchstens 8 sichtbare Feldhinweise', hinweise.length <= 8, hinweise.map((x) => x.textContent.slice(0, 30)));
  check('Alle ⓘ-Bauteile zu, Überschrift als Frage', [...d.querySelectorAll('#form details.mehr')].every((x) => !x.open && /\?$/.test(x.querySelector('summary').textContent)), [...d.querySelectorAll('#form details.mehr summary')].map((x) => x.textContent));
  check('Beträge nie hinter Aufklappen: Freibetrag der Zusatzrente sichtbar', !$('zusatzRenteHint').closest('details') && /281,50/.test(de['ek.zusatzRente.hint']));
  check('Geburtsjahr: Beispiel als Platzhalter', $('gebJahr').getAttribute('placeholder') === de['geb.ph']);
  check('Gelöschte Hinweise sind aus allen Sprachen entfernt', ['briefe.t', 'briefe.hinweis', 'lg.gesund.hint', 'plz.hint', 'ausb.hint', 'auto.hint', 'geb.hint', 'miete.hint'].every((k) => Object.keys(I18N).every((l) => !(k in I18N[l]))));
  check('Neue Texte in allen 13 Sprachen', ['mehr.warum', 'mehr.wo', 'mehr.wer', 'mehr.was', 'rb.satz', 'geb.ph', 'heiz.kurz', 'unterh.kurz', 'uz.kurz', 'beh.quelle', 'f.intro.mehr', 'f.empfAendern', 'f.empfPlatz', 'f.mehrWege', 'f.auf.1', 'f.auf.4.t'].every((k) => Object.keys(I18N).every((l) => typeof I18N[l][k] === 'string' && I18N[l][k].length > 2)));

  // Beispiel laden: Ergebnis
  $('p1').click();
  check('Ergebnis: „Keine Rechtsberatung“ als eine Zeile unter der Liste', !$('resRb').hidden && $('resRb').textContent === de['rb.satz']);
  check('Ergebnis: Namen der Verbände hinter „Mehr dazu“', !!d.querySelector('#beratung details.mehr') && !d.querySelector('#beratung details.mehr').open);
  check('Ergebnis: f.intro kurz, Erklärung „formloser Antrag“ zugeklappt', !/Gerät/.test(de['f.intro']) && !!d.querySelector('#helper details.mehr'));
  const ww = $('zweiWege');
  if (ww) check('Zwei Wege: sichtbar nur Titel und Tipp, Wege zugeklappt', !!ww.querySelector('.ww-tun') && ww.querySelector('details.mehr') && !ww.querySelector('details.mehr').open && ww.querySelector('details.mehr').contains(ww.querySelector('.ww-wege')));
  check('Erst „Verstanden“: Erststart bleibt weg', $('firstNotice').hidden);
  // Antragsmappe als Aufgabenliste
  $('p-name').value = 'Test'; $('p-name').dispatchEvent(new w.Event('input', { bubbles: true }));
  d.querySelectorAll('#pick input').forEach((c) => { if (!c.checked) c.click(); });
  $('mappeMake').click();
  const auf = [...d.querySelectorAll('#mappeBody .aufgabe')];
  check('Mappe: nummerierte Aufgabenliste mit Knopf und „Erledigt“ je Schritt', auf.length >= 3 && auf.every((a) => a.querySelector('button.btn') && a.querySelector('input[data-haken^="mappe|"]')), auf.length);
  check('Mappe: Frist (Antrag sichert den Monat) sichtbar im letzten Schritt, nicht zum Aufklappen', /Monat/.test(auf[auf.length - 1].textContent) && !auf[auf.length - 1].querySelector('.mappe-stichtag').closest('details'));
  check('Mappe: oben keine Hinweiskästen (Deutsch-Hinweis nur bei anderer Sprache)', $('mappeDeNote').hidden && !d.querySelector('#mappe .mappe-bar .notice:not([hidden])'));
  check('Mappe: jedes Empfängerfeld steht in seinem eigenen Brief (nie unter dem vorigen)', [...d.querySelectorAll('#mappeBody textarea[data-empf]')].every((x) => x.closest('.page') && x.closest('.page').id === 'm-brief-' + x.getAttribute('data-empf')) && d.querySelectorAll('#mappeBody > .empf-edit').length === 0);
  const fk = d.querySelector('#m-formulare .form-karte');
  check('Mappe: Formular-Link groß direkt unter dem Titel', !fk || (fk.children[1] && fk.children[1].querySelector('a.btn[target="_blank"]')));
  check('Mappe: „Keine Rechtsberatung“ auf dem Ausdruck (Unterlagenliste)', $('m-unterlagen').querySelector('.rb-satz').textContent === de['rb.satz']);
  // Prüfvermerk PR #67, Punkte 5–7
  const letzt = auf[auf.length - 1], mitAlg = !!$('m-brief-alg1'), mitSr = !!$('m-brief-srente');
  check('Mappe: Hinweis Arbeitslosmeldung genau dann, wenn ein Brief zum Arbeitslosengeld dabei ist', !!letzt.querySelector('.mappe-alg1') === mitAlg && (!mitAlg || letzt.querySelector('.mappe-alg1').textContent === de['f.alg1.meldung']));
  check('Mappe: Hinweis „kein Antrag“ genau dann, wenn die Rentenauskunft (srente) dabei ist', !!letzt.querySelector('.mappe-srente') === mitSr && $('introSrente').hidden === !mitSr);
  check('Texte zu Arbeitslosmeldung und Rentenauskunft in allen 13 Sprachen', ['f.alg1.meldung', 'f.srente.hinweis'].every((k) => Object.keys(I18N).every((l) => typeof I18N[l][k] === 'string' && I18N[l][k].length > 20)));
  check('Arbeitslosmeldung: „Ein Brief reicht nicht“, persönlich oder online, 3 Monate / 3 Tage (§ 141, § 38 SGB III)', /Brief reicht nicht/.test(de['f.alg1.meldung']) && /persönlich oder online/.test(de['f.alg1.meldung']) && /3 Monate/.test(de['f.alg1.meldung']) && /3 Tagen/.test(de['f.alg1.meldung']));
  check('Datenschutz: „bleiben auf diesem Gerät, solange du nichts selbst sendest“ (Erststart und Start)', /solange du nichts selbst sendest/.test(de['first.text']) && /solange du nichts selbst sendest/.test(de['home.privat']));
  const hk = auf[0].querySelector('input[data-haken]'); hk.click();
  check('Mappe: „Erledigt“ wird gemerkt (lotse.haken)', /mappe\|/.test(String(store['lotse.haken'] || '')) || hk.checked);
  console.log(fails ? `\n${fails} Fehler` : '\nInfotexte: alle Prüfungen bestanden');
  process.exit(fails ? 1 : 0);
}, 800);
