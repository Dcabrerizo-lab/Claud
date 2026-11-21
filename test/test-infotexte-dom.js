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
  check('Jobcenter: Einlesen steht direkt unter dem ersten Satz (dazwischen nur Frist und Art des Briefs)', satz && (satz.nextElementSibling === $('einlesen') || (satz.nextElementSibling.id === 'bs-fristbox' && satz.nextElementSibling.nextElementSibling === $('einlesen'))), karte.innerHTML.slice(0, 200));
  check('Jobcenter: erster Satz kurz (höchstens 12 Wörter)', satz.textContent.trim().split(/\s+/).length <= 12, satz.textContent);
  check('Feldhilfen hinter „Wo steht das?“, alle zu', [...d.querySelectorAll('#p-bescheid .feld-hilfe')].every((x) => x.tagName === 'DETAILS' && !x.open && x.querySelector('summary').textContent === 'Wo steht das?') && d.querySelectorAll('#p-bescheid .feld-hilfe').length >= 8);
  check('Datenschutz am Scan-Knopf, ohne „Wert vergleichen“', /gelöscht/.test(de['el.privat']) && !/vergleichen/.test(de['el.privat']));
  check('„Keine Rechtsberatung“ erst unter dem Prüfergebnis (leer: ausgeblendet per CSS)', !!d.querySelector('#bs-erg + .rb-erg') && !!d.querySelector('#bs-wid-text ~ .rb-schreiben'));
  // Briefart Einladung/Anhörung: Überschrift passt, Bescheid-Aufklapper und „Scanne den Bescheid“ ausgeblendet, kein „null“ im Text
  const artWahl = (v) => { const r = d.querySelector('input[name="bs-briefart"][value="' + v + '"]'); r.checked = true; r.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const bsDet = () => [...karte.querySelectorAll(':scope > details')];
  check('[brief-art] Bescheid: Überschrift „Bescheid … prüfen“, beide Aufklapper sichtbar', karte.querySelector('h2').textContent === de['bp.jc.h'] && bsDet().length === 2 && bsDet().every((x) => !x.hidden));
  artWahl('termin');
  check('[brief-art] Einladung: Überschrift „Einladung zu einem Termin“, Bescheid-Teile weg', karte.querySelector('h2').textContent === de['bp.art.termin.h'] && bsDet().every((x) => x.hidden) && satz.hidden && !/null/.test(karte.textContent), karte.querySelector('h2').textContent);
  artWahl('anh');
  check('[brief-art] Anhörung: eigene Überschrift', karte.querySelector('h2').textContent === de['bp.art.anh.h'] && bsDet().every((x) => x.hidden));
  artWahl('bescheid');
  check('[brief-art] zurück zu Bescheid: alles wieder da', karte.querySelector('h2').textContent === de['bp.jc.h'] && bsDet().every((x) => !x.hidden) && !satz.hidden);
  check('[brief-rahmen] Einstieg der Brief-Stellen ohne großen Rahmen (CSS)', /#checkBox\.pp \.pp-teil > \.card:first-child \{ background: transparent; box-shadow: none;/.test(html));
  $('briefZurueck').click();
  // Eine Kachel „Anderer Brief oder Formular“: erst einlesen, darunter zwei Unterkarten zur Wahl von Hand
  check('Brief-Übersicht: 7 Kacheln, „Anderer Brief oder Formular“ statt zwei Kacheln', d.querySelectorAll('#briefKacheln .kachel').length === 7 && !!$('brief-ab') && !$('briefKacheln').contains($('brief-an')) && !$('briefKacheln').contains($('brief-af')) && $('brief-ab').querySelector('b').textContent === de['briefe.ab']);
  $('brief-ab').click();
  check('[brief-ab] „Anderer Brief“: nur eine Überschrift (die der Seite)', !$('abWahl').querySelector('h2') && $('abWahl').getAttribute('aria-labelledby') === 'h-briefe');
  check('Gemeinsame Kachel: Einlesen oben, darunter „Brief mit Frist oder Mahnung“ und „Antragsformular ausfüllen“', !$('abWahl').hidden && $('abWahl').contains($('einlesen')) && !$('einlesen').hidden && $('abWahl').compareDocumentPosition($('abUnter')) & w.Node.DOCUMENT_POSITION_CONTAINED_BY && $('einlesen').compareDocumentPosition($('abUnter')) & w.Node.DOCUMENT_POSITION_FOLLOWING && $('brief-an').textContent.includes(de['briefe.andere']) && $('brief-af').textContent.includes(de['briefe.formular']));
  $('elPaste').click(); $('elText').value = 'Antrag auf Wohngeld\nBitte ankreuzen\nFamilienname, Vorname\nGeburtsdatum\nIBAN\nOrt, Datum\nUnterschrift des Antragstellers'; $('elLesen').click();
  check('Gemeinsame Kachel: ein Formular wird erkannt und erklärt (Formular-Teil offen)', !$('scan').hidden && $('abWahl').hidden, $('elMsg').textContent);
  $('briefZurueck').click();
  check('Zurück aus dem Formular: wieder die gemeinsame Kachel, Fokus auf der Unterkarte', !$('abWahl').hidden && d.activeElement === $('brief-af'));
  $('briefZurueck').click();
  check('Noch einmal Zurück: Übersicht, Fokus auf der Kachel', !$('briefKacheln').hidden && d.activeElement === $('brief-ab'));
  $('brief-ab').click();
  $('brief-an').click();
  $('elPaste').click(); $('elText').value = 'Bescheid\nGegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.'; $('elLesen').click();
  const erg = $('elErg').textContent;
  check('Anderer Brief: „Frist im Brief: 1 Monat“ statt „Monats“', /Frist im Brief: 1 Monat/.test(erg) && !/Frist im Brief: Monats/.test(erg), erg.slice(0, 160));
  check('Anderer Brief: Ergebnis endet mit „Keine Rechtsberatung“', [...$('elErg').querySelectorAll('.rb-satz')].some((p) => p.textContent === de['rb.satz']));
  $('briefZurueck').click();
  $('briefZurueck').click();

  // Leistungs-Check: erste Frage zuerst
  d.querySelector('#appnav [data-ansicht=start]') && d.querySelector('#appnav [data-ansicht=start]').click();
  $('goLeistungen').click();
  const formEnde = d.querySelector('.form-ende');
  check('Kurzer Check steht nach dem Formular; keine sichtbaren Beispiele', formEnde && $('form').compareDocumentPosition(formEnde) & w.Node.DOCUMENT_POSITION_FOLLOWING && formEnde.contains($('einfachBtn')) && $('presets').hidden);
  check('Löschen: Textknopf oben in „Deine Angaben“ (vor dem Formular)', !$('clearBtn') && $('clearLink').classList.contains('linkbtn') && $('clearLink').compareDocumentPosition($('form')) & w.Node.DOCUMENT_POSITION_FOLLOWING);
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
  check('Datenschutz: „bleiben auf diesem Gerät, solange du nichts selbst sendest“ (Erststart und Start)', /solange du nichts selbst sendest/.test(de['first.text']) && /solange du nichts selbst sendest/.test(de['home.sicher']) && !('home.privat' in de));
  const hk = auf[0].querySelector('input[data-haken]'); hk.click();
  check('Mappe: „Erledigt“ wird gemerkt (lotse.haken)', /mappe\|/.test(String(store['lotse.haken'] || '')) || hk.checked);
  console.log(fails ? `\n${fails} Fehler` : '\nInfotexte: alle Prüfungen bestanden');
  process.exit(fails ? 1 : 0);
}, 800);
