const { JSDOM } = require('jsdom');
const fs = require('fs');
const I18N = require('../dist/i18n.js');
const KARTEN = require('./karten.js');
const FmtN = require('../src/fmt.js');
const html = fs.readFileSync(__dirname + '/../dist/sozialleistungslotse.html', 'utf8');
const errors = [];
const store = {};
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse(w) {
    w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
    w.HTMLElement.prototype.scrollIntoView = function () {};
    w.scrollTo = function () {};
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } }, configurable: true });
  }
});
const w = dom.window;
const d = w.document;
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x || ''); } else console.log('ok  ', n); };

const cards = () => [...d.querySelectorAll('#cards .card:not(.startcard)')];
const pills = () => cards().map((c) => c.querySelector('.pill').className.replace('pill ', ''));
const names = () => cards().map((c) => c.querySelector('h3').textContent);
const card = (n) => cards().find((c) => c.querySelector('h3').textContent === n);
const level = (n) => card(n).querySelector('.pill').className.replace('pill ', '');
const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
// Beispiel laden (nur noch Testhilfe: unsichtbare Knöpfe in #presets, David 20.11.2026)
const beispiel = (id) => { d.getElementById(id).click(); };
const setLang = (c) => { const s = d.getElementById('lang'); s.value = c; fire(s, 'change'); };
const setSel = (id, v) => { const s = d.getElementById(id); s.value = v; fire(s, 'change'); };
const setChk = (id, v) => { const c = d.getElementById(id); c.checked = v; fire(c, 'change'); };
const setNum = (id, v) => { const c = d.getElementById(id); c.value = String(v); fire(c, 'input'); fire(c, 'change'); }; // Tippen, dann Feld verlassen

check('Keine Skriptfehler beim Laden', errors.length === 0, errors.join('; '));
check('Startsprache folgt dem Browser (Deutsch)', d.getElementById('lang').value === 'de' && d.getElementById('app').getAttribute('lang') === 'de');
check('Sprachwahl bietet 13 Sprachen', d.getElementById('lang').options.length === 13);
check('Sprachwahl nur in Einstellungen und Kopfzeile, nicht in „Deine Angaben“', d.getElementById('lang').closest('#v-einst') !== null && d.querySelectorAll('#v-leistungen select[id^="lang"], #v-leistungen .langpick').length === 0 && /\.app:not\(\[data-ansicht="start"\]\) \.top \.sprach-knopf \{ display: none; \}/.test([...d.querySelectorAll('style')].map((s) => s.textContent).join('')));
check('Start ohne Beispielwerte: leeres Formular', d.getElementById('ek1Brutto').value === '' && d.getElementById('miete').value === '');
check('[hilfen-aufraeumen] Start ohne Karten und ohne Kasten „So geht\'s“', d.getElementById('cards').innerHTML === '' && cards().length === 0, d.getElementById('cards').innerHTML.slice(0, 200));
check('Start: Beispiel-Hinweis versteckt', d.getElementById('sampleNotice').hidden === true);
beispiel('p1');
check(KARTEN.length + ' Ergebnis-Karten', cards().length === KARTEN.length, cards().length);
check('Beispiel 1: Wohngeld, Kinderzuschlag, Kindergeld wahrscheinlich', ['Wohngeld', 'Kinderzuschlag', 'Kindergeld'].every((n) => level(n) === 'ja'), names() + ' | ' + pills());
check('Zusammenfassung zeigt Anzahl', /\d+ wahrscheinlich/.test(d.getElementById('count').textContent), d.getElementById('count').textContent);
check('Unwahrscheinliche Leistungen sind eingeklappt gruppiert', d.querySelector('.neinbox') !== null && d.querySelector('.neinbox').open === false);
check('Hinweis auf Beispielwerte sichtbar', d.getElementById('sampleNotice').hidden === false);
check('Übersetzungs-Hinweis bei Deutsch versteckt', d.getElementById('transNotice').hidden === true);
check('Treffer: aufgeklappte Karte mit Knopf „Antrag vorbereiten“ (öffnet die Antragsmappe mit dieser Leistung)', ((card('Wohngeld').querySelector('[data-antrag="wohngeld"]') || {}).textContent || '') === I18N.de['akt.antrag']);
check('Zusammenspiel-Hinweis Wohngeld und Kinderzuschlag steht in beiden Karten', /kombinieren/.test(d.getElementById('c-wohngeld').textContent) && /kombinieren/.test(d.getElementById('c-kiz').textContent));
check('Neue Karten vorhanden', ['Grundsicherungsgeld', 'Unterhaltsvorschuss', 'BAföG', 'Pflegegeld und Entlastungsbetrag', 'Kindergeld'].every((n) => names().includes(n)));
check('Unterhaltsvorschuss im Beispiel 1 wahrscheinlich', level('Unterhaltsvorschuss') === 'ja');

// Beispiel 2
beispiel('p2');
// Seit 21.11.2026: zwei Wege (Grundsicherung im Alter oder Wohngeld). Bei Rente echte Wahl: beide Karten bleiben „wahrscheinlich“ mit Betrag
// (§ 2 Abs. 1 SGB XII nimmt den Anspruch nicht: BSG 23.03.2021, B 8 SO 2/20 R)
check('Beispiel 2: Grundsicherung im Alter und Wohngeld beide „wahrscheinlich“ (zwei Wege, echte Wahl), Satz „welcher Weg dir mehr bringt“', level('Grundsicherung im Alter und bei voller Erwerbsminderung') === 'ja' && level('Wohngeld') === 'ja' && !!d.getElementById('wege') && /welcher Weg dir mehr bringt/.test(d.querySelector('#wege .wege-lage').textContent) && !/geht (es |Wohngeld )?vor/.test(d.getElementById('wege').textContent), pills() + '');
check('Beispiel 2 füllt Formular und Auswahlfelder', d.getElementById('ek1Art').value === 'rente' && d.getElementById('ek1Brutto').value === '880' && d.getElementById('gebJahr').value === '1955' && d.getElementById('mietstufe').value === '3');
check('[wege] Beispiel 2: Rahmen „Entweder oder“ mit den Karten Grundsicherung im Alter und Wohngeld, „oder“ dazwischen', !!d.querySelector('#wege #c-gsa') && !!d.querySelector('#wege #c-wohngeld') && !!d.querySelector('#wege .weg-oder'));
check('[wege] Beispiel 2: Satz zur Lage sichtbar (nicht zugeklappt), Namen beschreibend statt „Weg 1/2“', d.querySelector('#wege .wege-lage').textContent.length > 20 && !d.querySelector('#wege .wege-lage').closest('details') && !/Weg [12]/.test(d.getElementById('wege').textContent));
check('Ohne Kinder sind Kinder-Fragen ausgeblendet', [...d.querySelectorAll('.cond-kids')].every((e) => e.hidden === true));

// Eingabe ändern
beispiel('p1');
check('Mit Kindern sind Kinder-Fragen sichtbar', [...d.querySelectorAll('.cond-kids')].every((e) => e.hidden === false));
setNum('ek1Brutto', 9000); setNum('ek1Netto', 6500);
check('Hinweis verschwindet nach eigener Eingabe', d.getElementById('sampleNotice').hidden === true);
check('Hohes Einkommen: Wohngeld und Kinderzuschlag unwahrscheinlich', level('Wohngeld') === 'nein' && level('Kinderzuschlag') === 'nein');
check('Keine sichtbaren Beispiele im Leistungs-Check (nur Testhilfe)', d.getElementById('presets').hidden && !d.getElementById('presetLabel') && !d.getElementById('beispielDlg'));
d.getElementById('p1').click();
// Eingeklappte Karte: zweite Zeile mit Betrag und Art der Stelle statt „Anspruch ist wahrscheinlich“
const z2 = (id) => d.querySelector('#c-' + id + ' .head2').textContent;
check('Kartenzeile Wohngeld: ungefährer Betrag und Wohngeldstelle', /ca\. .*€.* im Monat/.test(z2('wohngeld')) && /Wohngeldstelle/.test(z2('wohngeld')) && !/wahrscheinlich/.test(z2('wohngeld')), z2('wohngeld'));
// Löschen nur an einer Stelle (Einstellungen → Sicherheit und Daten): Zeile sagt, was weg ist; Rückfrage; danach leer
d.getElementById('p-name').value = 'Test'; fire(d.getElementById('p-name'), 'input');
check('Leistungs-Check: „Angaben löschen“ oben in der Leiste von „Deine Angaben“ (vor dem Formular); Löschen-Zeile nennt Formular und Briefdaten', !d.getElementById('clearBtn') && !!d.getElementById('clearLink') && d.getElementById('sfLeiste').contains(d.getElementById('clearLink')) && d.getElementById('clearLink').compareDocumentPosition(d.getElementById('form')) & 4 && /Andere Vorgänge bleiben/.test(d.getElementById('clear2').textContent));
d.getElementById('clearLink').click();
check('„Angaben löschen“ oben: dieselbe Rückfrage direkt darunter (Behalten/Löschen)', !!d.querySelector('#schritte #loeschFrage') && /Formular/.test(d.getElementById('loeschFrage').textContent) && d.getElementById('loeschNein').textContent === 'Behalten');
d.getElementById('loeschNein').click();
check('„Behalten“: Rückfrage weg, Angaben bleiben', !d.getElementById('loeschFrage') && d.getElementById('p-name').value === 'Test');
d.getElementById('clear2').click();
check('Rückfrage nennt genau: Formular und Briefdaten', /Formular/.test(d.getElementById('loeschFrage').textContent) && /Anschrift/.test(d.getElementById('loeschFrage').textContent));
d.getElementById('loeschJa').click();
check('Löschen nach „Löschen“ in der Rückfrage: Formular leer, Meldung', d.getElementById('ek1Art').value === '' && d.getElementById('p-name').value === '' && /gelöscht/.test(d.getElementById('loeschMsg').textContent));
d.getElementById('p-name').value = ''; fire(d.getElementById('p-name'), 'input');

// Stepper
beispiel('p1');
d.querySelector('[data-step="kids"][data-d="1"]').click();
check('Stepper erhöht Kinderzahl', d.getElementById('kids').textContent === '3');
for (let i = 0; i < 5; i++) d.querySelector('[data-step="kids"][data-d="-1"]').click();
check('Stepper geht nicht unter 0', d.getElementById('kids').textContent === '0');
check('Ohne Kinder: Kinderzuschlag und Unterhaltsvorschuss unwahrscheinlich', level('Kinderzuschlag') === 'nein' && level('Unterhaltsvorschuss') === 'nein');

// Neue Eingaben
beispiel('p1');
setChk('b-kindergeld', true);
check('Kindergeld schon bezogen: Karte "Schon vorhanden"', level('Kindergeld') === 'na');
setChk('b-kindergeld', false);
setSel('ausbildung', 'kind');
setNum('ek1Netto', 1500);
check('BAföG: Kind in Ausbildung, niedriges Einkommen wahrscheinlich', level('BAföG') === 'ja', level('BAföG'));
setSel('pflegegrad', '3');
check('Pflegegrad 3: Pflegegeld wahrscheinlich mit Betrag', level('Pflegegeld und Entlastungsbetrag') === 'ja' && /599/.test(card('Pflegegeld und Entlastungsbetrag').textContent));
setChk('unterhaltFehlt', false);
check('Unterhalt nicht fehlend: Unterhaltsvorschuss unwahrscheinlich', level('Unterhaltsvorschuss') === 'nein');
{ const g = d.getElementById('gebJahr'); g.value = '2000'; fire(g, 'input'); fire(g, 'change'); } setNum('vermoegen', 16000);
check('Grundsicherungsgeld: Vermögen über Schonbetrag (5.000 € + 2 Kinder × 5.000 €)', level('Grundsicherungsgeld') === 'nein');
setNum('vermoegen', 9000);
check('Grundsicherungsgeld: 9.000 € liegen unter 15.000 € Schonbetrag der Familie', level('Grundsicherungsgeld') !== 'nein');
setNum('vermoegen', 16000);

// Bezug Grundsicherungsgeld
beispiel('p1');
setChk('b-grundsicherungsgeld', true);
check('Grundsicherungsgeld: Hinweis in der Wohngeld-Karte', /Du bekommst Grundsicherungsgeld/.test(d.getElementById('c-wohngeld').textContent));
beispiel('p1');
d.getElementById('adults2').checked = true; fire(d.getElementById('adults2'), 'change');
check('Zwei Erwachsene werden übernommen', cards().length === KARTEN.length);

// ---------- Einkommen je Person: nur passende Felder, verständliche Beschriftung ----------
beispiel('p1');
const vis = (id) => !d.getElementById(id).hidden;
check('Lohn: Brutto- und Netto-Feld sichtbar', vis('ek1BruttoF') && vis('ek1NettoF') && d.getElementById('ek1NettoLab').textContent === I18N.de['ek.netto']);
{ // UX-Audit C Nr. 15: „Netto ausrechnen“ direkt unter dem Brutto, Ergebnis als Schätzung in vollen Euro, Übernahme nur per Knopf
  const nf = d.getElementById('ek1NhF'), nv = d.getElementById('ek1Netto').value, bv = d.getElementById('ek1Brutto').value;
  check('[ux-c] Netto-Helfer steht direkt unter dem Brutto-Feld', nf.previousElementSibling === d.getElementById('ek1BruttoF') && nf.nextElementSibling === d.getElementById('ek1NettoF'));
  setNum('ek1Brutto', 3000); d.getElementById('ek1NhBtn').click();
  d.querySelector('#ek1Nh .wahl-liste button').click(); [...d.querySelectorAll('#ek1Nh .wahl-raster button')][1].click();
  const z = d.querySelector('#ek1Nh .pf-zahl');
  check('[ux-c] Netto-Helfer: „ungefähr … (geschätzt)“, volle Euro, Netto-Feld erst nach „Übernehmen“', !!z && /^ungefähr [\d.]+ € im Monat \(geschätzt\)$/.test(z.textContent.replace(/\s/g, ' ')) && d.getElementById('ek1Netto').value === nv, z && z.textContent);
  [...d.querySelectorAll('#ek1Nh .btns button')].find((b) => b.textContent === I18N.de['nh.uebernehmen']).click();
  check('[ux-c] Netto-Helfer: Übernahme als ganze Euro', /^\d+$/.test(d.getElementById('ek1Netto').value), d.getElementById('ek1Netto').value);
  setNum('ek1Brutto', bv); setNum('ek1Netto', nv);
}
setSel('ek1Art', 'alg');
check('Arbeitslosengeld I: kein Brutto-Feld, Betrag laut Bescheid mit Hinweis auf Tagesbetrag', !vis('ek1BruttoF') && vis('ek1NettoF') && d.getElementById('ek1NettoLab').textContent === I18N.de['ek.betrag'] && /Agentur für Arbeit/.test(d.getElementById('ek1NettoHint').textContent));
setSel('ek1Art', 'kg');
check('Krankengeld: Hinweis auf das Schreiben der Krankenkasse', /Krankenkasse/.test(d.getElementById('ek1NettoHint').textContent));
setSel('ek1Art', 'rente');
check('Rente: Brutto-Hinweis auf den Rentenbescheid', vis('ek1BruttoF') && /Rentenbescheid/.test(d.getElementById('ek1BruttoHint').textContent));
setSel('ek1Art', 'ohne');
check('Kein Einkommen: keine Betragsfelder', !vis('ek1BruttoF') && !vis('ek1NettoF'));
setSel('ek1Art', '');
check('Noch nichts gewählt: keine Betragsfelder', !vis('ek1BruttoF') && !vis('ek1NettoF'));
check('Partner-Block nur bei zwei Erwachsenen', d.getElementById('ekbox2').hidden === true);
beispiel('p3');
check('Beispiel Paar: Partner-Block sichtbar, Partner ohne Einkommen', d.getElementById('ekbox2').hidden === false && d.getElementById('ek2Art').value === 'ohne');
beispiel('p1');

// Große Schrift
d.getElementById('bigBtn').click();
check('Große Schrift schaltet Klasse', d.getElementById('app').classList.contains('big') && d.getElementById('bigBtn').getAttribute('aria-checked') === 'true' && d.getElementById('bigBtn').getAttribute('role') === 'switch');

// Leere Eingaben
['miete', 'ek1Brutto', 'ek1Netto', 'vermoegen'].forEach((k) => setNum(k, ''));
check('Leere Felder erzeugen keinen Fehler', errors.length === 0 && cards().length === KARTEN.length, errors.join('; '));

// ---------- Sprachen ----------
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
LANGS.forEach((l) => {
  beispiel('p1');
  setLang(l);
  const dict = I18N[l];
  const app = d.getElementById('app');
  check(l + ': Sprache und Schreibrichtung gesetzt', app.getAttribute('lang') === l && app.getAttribute('dir') === dict['meta.dir']);
  check(l + ': Überschrift "Deine Angaben" übersetzt', d.getElementById('h-form').textContent === dict['h.form']);
  const raw = [...d.querySelectorAll('[data-t]')].filter((el) => el.textContent !== dict[el.getAttribute('data-t')]);
  check(l + ': alle ' + d.querySelectorAll('[data-t]').length + ' beschrifteten Elemente stimmen mit dem Wörterbuch überein', raw.length === 0, raw.map((e) => e.getAttribute('data-t')).join(','));
  const visible = d.getElementById('app').textContent;
  check(l + ': keine unaufgelösten Platzhalter oder Schlüssel in der Oberfläche', !/\{\w+\}/.test(visible) && ![...d.querySelectorAll('#app *')].some((e) => e.children.length === 0 && /^(h|t|s|z|n|lvl|f|c|bz|cb|lg)\.[\w.]+$/.test(e.textContent.trim())));
  check(l + ': Karten-Überschriften bleiben deutsch', card('Wohngeld') !== undefined && card('Kinderzuschlag') !== undefined);
  check(l + ': Ergebnis-Pille übersetzt', card('Wohngeld').querySelector('.pill').textContent.includes(dict['lvl.ja']));
  check(l + ': Auswahlfelder übersetzt', d.getElementById('pflegegrad').options[0].textContent === dict['pflege.0'] && d.getElementById('mietstufe').options[1].textContent === dict['stufe.n'].replace('{n}', 'I'));
  check(l + ': Übersetzungs-Hinweis ' + (l === 'de' ? 'versteckt' : 'sichtbar'), d.getElementById('transNotice').hidden === (l === 'de'));
  check(l + ': Beschreibung unter der Karte ' + (l === 'de' ? 'fehlt bei Deutsch' : 'vorhanden'), (card('Wohngeld').querySelector('.desc') === null) === (l === 'de'));
  ['p2', 'p3'].forEach((p) => { beispiel(p); });
  check(l + ': Beispiele laden ohne Fehler', errors.length === 0, errors.join('; '));
  });
check('Sprachwahl wird gemerkt', store['lotse-lang'] === 'so');
setLang('de');

// ---------- Antragsmappe (Aufgabenliste, UX-Prüfung 21.11.2026) ----------
beispiel('p1');
const pickBoxes = () => [...d.querySelectorAll('[data-pick]')];
const okCount = cards().filter((c) => /pill (ja|vielleicht)/.test(c.querySelector('.pill').className)).length;
const wegRadios = () => [...d.querySelectorAll('#pick input[type=radio][data-weg]')];
check('Auswahl für die Mappe nennt die passenden Leistungen (Haken, Weg-Leistungen als Optionsfeld)', pickBoxes().length >= 3 && pickBoxes().length <= okCount, pickBoxes().length + ' vs ' + okCount);
{
  // Entweder oder (§ 7 Abs. 1 WoGG, § 6a BKGG, § 12a SGB II): Optionsfelder statt leerer Haken; „Ich weiß es noch nicht“ als dritte Wahl
  const ids = pickBoxes().map((cb) => cb.getAttribute('data-pick')), an = (id) => { const c = d.querySelector('[data-pick="' + id + '"]'); return !!c && c.checked; };
  const radios = wegRadios(), werte = radios.map((r) => r.value).join();
  check('[weg] Beispiel 1: Wahl des Wegs mit drei Optionsfeldern (a, b, Ich weiß es noch nicht), genau eins gewählt', radios.length === 3 && werte === 'a,b,offen' && radios.filter((r) => r.checked).length === 1, werte);
  check('[weg] Beschreibende Namen statt „Weg A/B“', !/Weg [AB12]\b/.test(d.getElementById('pick').textContent) && d.getElementById('pick').textContent.indexOf(I18N.de['f.weg.offen']) >= 0);
  check('[weg] Satz „Beträge nicht zusammenzählen“ steht bei der Wahl', d.querySelector('.weg-wahl').textContent.indexOf(I18N.de['weg.nichtZaehlen']) >= 0);
  check('[weg] Weg-Leistungen haben keine eigenen Haken', !ids.includes('ggeld') && !ids.includes('wohngeld') && !ids.includes('kiz'), ids.join());
  check('[vorauswahl] Geld-Leistungen mit Betrag vorab angehakt (Kindergeld, Unterhaltsvorschuss), WBS/Rundfunk nicht', an('kindergeld') && an('uvg') && !an('wbs') && !an('rundfunk'), ids.map((i) => i + ':' + an(i)).join());
  check('[vorauswahl] WBS und Rundfunk zugeklappt unter „Weitere Hilfen“', !!d.querySelector('#pick .pick-spaeter [data-pick="wbs"]'));
  check('[vorauswahl] Kein Satz „siehe Tipp oben“ mehr', !/Tipp oben/.test(d.getElementById('pick').textContent) && !('f.pickWege' in I18N.de));
  // Weg „Ich weiß es noch nicht“: nichts aus der Gruppe, Notfall-Satz
  const offen = radios.find((r) => r.value === 'offen'); offen.checked = true; fire(offen, 'change');
  check('[weg] „Ich weiß es noch nicht“: Satz zur Lage und Notfall-Satz', d.getElementById('pick').textContent.indexOf(I18N.de['weg.dringend']) >= 0);
  const a = wegRadios().find((r) => r.value === 'a'); a.checked = true; fire(a, 'change');
}
check('Mappe ist anfangs geschlossen', d.getElementById('mappe').hidden === true);
// nichts gewählt
wegRadios().filter((r) => r.value === 'offen').forEach((r) => { r.checked = true; fire(r, 'change'); });
pickBoxes().forEach((cb) => { cb.checked = false; fire(cb, 'change'); });
d.getElementById('mappeMake').click();
check('[hilfen-aufraeumen] Grüner Knopf „Antrag vorbereiten“ direkt unter den passenden Karten, kein Kasten „Ausfüllhilfe“ im Ergebnis', (() => { const k = d.getElementById('mappeKnopf'), letzte = cards().filter((c) => /pill (ja|vielleicht)/.test(c.querySelector('.pill').className)).pop(); return k && !k.hidden && (k.previousElementSibling === letzte || k.previousElementSibling.contains(letzte)) && d.getElementById('mappeMake').textContent === I18N.de['akt.antrag'] && !d.getElementById('ergebnis').contains(d.getElementById('p-name')); })());
check('Ohne Auswahl: Mappe öffnet mit Auswahl und Hinweis, keine leeren Briefe, Schritte 2–4 ausgeblendet', d.getElementById('mappe').hidden === false && d.getElementById('pickMsg').textContent === I18N.de['f.pick0'] && !d.querySelector('#mappeBody .page') && d.getElementById('auf-antraege').hidden && d.getElementById('auf-unterlagen').hidden);
check('[aufgaben] Erster Punkt der Aufgabenliste: „Deine Angaben für die Briefe“ mit Status „fehlt noch“, aufgeklappt', d.querySelector('#mappeAufgaben > li').id === 'auf-angaben' && d.getElementById('statAngaben').textContent === I18N.de['f.st.fehlt'] && d.getElementById('aufAngaben').open);
check('[absender] Kompakt: Name, Straße, PLZ und Ort sichtbar; Geburtsdatum und Telefon unter „mehr“', !d.getElementById('p-name').closest('details.mehr') && !!d.getElementById('p-geb').closest('details.mehr') && !!d.getElementById('p-tel').closest('details.mehr'));
// Wohngeld (Weg a) und Unterhaltsvorschuss wählen
{ const a = wegRadios().find((r) => r.value === 'a'); a.checked = true; fire(a, 'change'); }
pickBoxes().filter((cb) => ['uvg'].includes(cb.getAttribute('data-pick'))).forEach((cb) => { cb.checked = true; fire(cb, 'change'); });
pickBoxes().filter((cb) => ['kindergeld', 'but'].includes(cb.getAttribute('data-pick'))).forEach((cb) => { cb.checked = false; fire(cb, 'change'); });
const set = (id, v) => { d.getElementById(id).value = v; fire(d.getElementById(id), 'input'); };
set('p-name', 'Maria Beispiel'); set('p-geb', '01.02.1985'); set('p-strasse', 'Hauptstraße 1'); set('p-ort', '91056 Erlangen'); set('p-tel', '0123 456');
d.getElementById('mappeMake').click();
check('Mappe öffnet sich und ersetzt die Seite', d.getElementById('mappe').hidden === false && d.getElementById('app').classList.contains('pm'));
check('[aufgaben] Status: Angaben eingetragen, Anträge offen; erster offener Schritt (Anträge) aufgeklappt, Rest zu', /eingetragen/.test(d.getElementById('statAngaben').textContent) && d.getElementById('statAntraege').textContent === I18N.de['f.st.offen'] && d.getElementById('aufAntraegeD').open && !d.getElementById('aufAngaben').open && !d.getElementById('aufUnterlagenD').open);
check('[aufgaben] Kein Inhaltsverzeichnis mit Sprungknöpfen', !d.querySelector('#mappe [data-sprung]') && !d.getElementById('mappePrint2'));
const zeilen = [...d.querySelectorAll('#aufAntraege .ant-zeile')];
check('[antraege] Formulare vor den Briefen: Wohngeld (Formular), Kinderzuschlag (Formular), dann Unterhaltsvorschuss (Anschreiben)', zeilen.length >= 2 && zeilen[0].classList.contains('ant-form') && zeilen[zeilen.length - 1].getAttribute('data-ant') === 'b-uvg', zeilen.map((z) => z.getAttribute('data-ant')).join());
check('[antraege] Je Leistung genau eine Aktion (Formular-Link oder „Anschreiben ansehen“)', zeilen.every((z) => [...z.querySelectorAll('a.btn, summary.btn')].filter((x) => !x.closest('.page')).length === 1), zeilen.map((z) => z.getAttribute('data-ant') + ':' + [...z.querySelectorAll('a.btn, summary.btn')].map((x) => x.textContent).join('+')).join(' | '));
const wgZeile = d.querySelector('[data-ant="f-wg"]');
check('[antraege] Wohngeld: Link auf die amtliche Seite, Satz unter dem Knopf, Ausfüllhilfe zum Aufklappen', !!wgZeile && !!wgZeile.querySelector('a[href*="stmb.bayern.de"]') && wgZeile.textContent.indexOf(I18N.de['fw.wg.by']) >= 0 && !!wgZeile.querySelector('details.mehr'));
const uvgZeile = d.querySelector('[data-ant="b-uvg"]');
check('[antraege] Anschreiben-Zeile nennt den Empfänger, Brief zugeklappt', !!uvgZeile && /^An: Stadt Erlangen/.test(uvgZeile.querySelector('.ant-an').textContent) && !uvgZeile.querySelector('details.ant-zeigen').open);
const pages = [...d.querySelectorAll('#mappeBody .page')];
check('Druck: ein Brief (Unterhaltsvorschuss), Angabenblatt, Unterlagen- und Formularliste; alles nur im Druck', pages.length === 3 && pages.every((p) => p.classList.contains('nur-druck')), pages.length);
const txt = pages.map((p) => p.textContent).join('\n');
check('Brief: Absender, Empfänger (aus der PLZ der Anschrift) und Betreff', /Maria Beispiel/.test(txt) && /Hauptstraße 1/.test(txt) && /Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(txt) && /Betreff: Antrag auf Unterhaltsvorschuss/.test(txt));
check('Kein formloser Brief für Wohngeld, weil es den Formular-Link gibt', !/Betreff: Antrag auf Wohngeld/.test(txt));
check('Brief: bittet um Eingangsbestätigung und Formulare (förmlich)', /bestätigen Sie mir den Eingang/.test(txt) && /Antragsformulare/.test(txt) && /Sehr geehrte Damen und Herren/.test(txt));
check('Brief auf Deutsch und links nach rechts gesetzt', pages[0].getAttribute('lang') === 'de' && pages[0].getAttribute('dir') === 'ltr');
check('Angabenblatt enthält Haushalt, Miete, Einkommen', /Angabenblatt/.test(txt) && /Warmmiete im Monat: 950 €/.test(txt) && /Einkommen: Lohn oder Gehalt, brutto 2\.200 €, netto 1\.750 € im Monat/.test(txt) && /Kinder unter 18 Jahren: 2/.test(txt) && /Geburtsdatum: 01\.02\.1985/.test(txt));
check('Druck: Formularliste mit Adresse der amtlichen Seite', /Antrag auf Wohngeld \(Mietzuschuss\): https:\/\/www\.stmb\.bayern\.de/.test(txt));
check('Druck: „Keine Rechtsberatung“', txt.indexOf(I18N.de['rb.satz']) >= 0);
check('Leere Felder werden zu Strichen statt "undefined"', !/undefined|null/.test(txt));
check('Kopiertext enthält Briefe und Angabenblatt', /Betreff: Antrag auf Unterhaltsvorschuss/.test(d.getElementById('mappeText').value) && /Angabenblatt/.test(d.getElementById('mappeText').value));
// Unterlagen: eine Liste ohne Doppelungen
{
  const li = [...d.querySelectorAll('#aufUnterlagen .haken-liste li')].map((x) => x.textContent.trim());
  check('[unterlagen] Keine Doppelungen', new Set(li).size === li.length, li.join(' | '));
  check('[unterlagen] „Für alle/mehrere Anträge“ zuerst, dann „Zusätzlich für …“', /^(Für alle Anträge|Für mehrere Anträge)$/.test(d.querySelector('#aufUnterlagen h4').textContent) && [...d.querySelectorAll('#aufUnterlagen h4')].slice(1).every((h) => /^Zusätzlich für /.test(h.textContent)), [...d.querySelectorAll('#aufUnterlagen h4')].map((h) => h.textContent).join(' | '));
  const cb = d.querySelector('#aufUnterlagen input[data-haken^="u|"]'); cb.checked = true; fire(cb, 'change');
  check('[unterlagen] Haken zählt im Status („1 von n“) und wird gespeichert', /^1 von \d+$/.test(d.getElementById('statUnterlagen').textContent) && JSON.parse(store['lotse.haken'] || '{}')[cb.getAttribute('data-haken')] === true, d.getElementById('statUnterlagen').textContent);
  cb.checked = false; fire(cb, 'change');
}
check('[drucken] Ein Knopf „Drucken oder teilen“ im Schritt „Abschicken“, nicht oben', d.getElementById('mappePrint').textContent === I18N.de['akt.drucken'] && !!d.getElementById('mappePrint').closest('#auf-abschicken') && d.querySelectorAll('#mappe button.btn:not(.ghost)').length === 1);
// Weg wechseln: andere Anträge, andere Unterlagen
{
  const b = wegRadios().find((r) => r.value === 'b'); b.checked = true; fire(b, 'change');
  check('[weg] Grundsicherungsgeld gewählt: Formular des Jobcenters statt Wohngeld', !!d.querySelector('[data-ant="f-ggeld"]') && !d.querySelector('[data-ant="f-wg"]'));
  const a = wegRadios().find((r) => r.value === 'a'); a.checked = true; fire(a, 'change');
}
// ---------- Empfänger bearbeitbar und Suchlink ----------
{
  const feld = d.querySelector('#mappe textarea[data-empf="uvg"]');
  check('[empf] Vor einer Änderung kein Knopf „Wiederherstellen“ sichtbar', d.querySelector('#mappe [data-empf-resetbox="uvg"]').hidden === true);
  const brief = () => d.getElementById('brief-uvg').textContent;
  const kopie = () => d.getElementById('mappeText').value;
  check('[empf] Empfängerfeld je Brief, vorbefüllt mit dem Vorschlag der App (Stadt Erlangen, Jugendamt, Anschrift)', !!feld && /^Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle\n.+\n910\d\d Erlangen$/.test(feld.value), feld && feld.value);
  check('[empf] Feld steht im Anschreiben an der Stelle der Anschrift, wird nicht gedruckt (gedruckt wird der fertige Brief)', !!feld && feld.closest('.page') === d.getElementById('m-brief-uvg') && !!feld.closest('.no-print') && !!d.getElementById('brief-uvg').closest('.nur-druck'));
  check('[empf] Anschrift bekannt: steht schon da, Feld erst nach „ändern“', !d.querySelector('[data-empf-zeigen="uvg"]').hidden && d.querySelector('[data-empf-feld="uvg"]').hidden && /Stadt Erlangen/.test(d.querySelector('[data-empf-zeigen="uvg"]').textContent));
  d.querySelector('[data-empf-aendern="uvg"]').click();
  check('[empf] „ändern“ öffnet das Feld an derselben Stelle', !d.querySelector('[data-empf-feld="uvg"]').hidden && d.querySelector('[data-empf-zeigen="uvg"]').hidden);
  check('[empf] Nur ein Feld, weil nur ein Brief (Wohngeld hat Formular-Link)', d.querySelectorAll('#mappe textarea[data-empf]').length === 1);
  feld.value = 'Landratsamt Musterkreis\nJugendamt\nMusterweg 5\n12345 Musterstadt'; fire(feld, 'input');
  check('[empf] Änderung erscheint sofort im Brief und in der Zeile „An:“', /\n\nLandratsamt Musterkreis\nJugendamt\nMusterweg 5\n12345 Musterstadt\n\nDatum:/.test(brief()) && !/Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(brief()) && /Landratsamt Musterkreis/.test(d.querySelector('[data-ant="b-uvg"] .ant-an').textContent), brief().slice(0, 300));
  check('[empf] Änderung erscheint im Kopiertext (auch Grundlage für PDF)', /Landratsamt Musterkreis\nJugendamt\nMusterweg 5\n12345 Musterstadt/.test(kopie()) && /Angabenblatt/.test(kopie()));
  check('[empf] Fokus und Feld bleiben beim Tippen erhalten (Mappe wird nicht neu aufgebaut)', d.querySelector('#mappe textarea[data-empf="uvg"]') === feld);
  check('[empf] Absender, Betreff und Text bleiben unverändert', /Maria Beispiel/.test(brief()) && /Betreff: Antrag auf Unterhaltsvorschuss/.test(brief()) && /bestätigen Sie mir den Eingang/.test(brief()));
  feld.value = '  \n \n'; fire(feld, 'input');
  check('[empf] Leeres Feld: Linie zum Ausfüllen statt leerem Empfänger', /\n\n____________________\n\nDatum:/.test(brief()), brief().slice(0, 200));
  feld.value = '<img src=x onerror="window.__xss=1">\nTest'; fire(feld, 'input');
  check('[empf] Eingabe wird nie als HTML ausgeführt', !w.__xss && !d.querySelector('#brief-uvg img') && !d.querySelector('.ant-an img') && /<img src=x/.test(brief()));
  const reset = d.querySelector('#mappe [data-empf-reset="uvg"]');
  check('[empf] Knopf „Vorschlag wiederherstellen“ erscheint nach einer Änderung', !!reset && reset.textContent === I18N.de['f.empfZurueck'] && !reset.closest('[data-empf-resetbox]').hidden);
  if (reset) reset.click();
  const feld2 = d.querySelector('#mappe textarea[data-empf="uvg"]');
  check('[empf] Wiederherstellen: Vorschlag wieder im Feld, im Brief und im Kopiertext, Knopf weg', !!feld2 && /^Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(feld2.value) && /Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(brief()) && /Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(kopie()) && d.querySelector('#mappe [data-empf-resetbox="uvg"]').hidden === true);
  const link = d.querySelector('#mappe .empf-edit a');
  const q = link ? decodeURIComponent(link.getAttribute('href').split('?q=')[1] || '') : '';
  // Datenschutz (Sicherheitsprüfung 21.11.2026, S13): kein Ort und keine PLZ in der Adresse, nur der feste Suchbegriff; Hinweis, den Ort selbst dazuzuschreiben
  check('[empf] Suchlink: DuckDuckGo, nur kurzer Suchbegriff ohne Ort und PLZ, öffnet extern', !!link && /^https:\/\/duckduckgo\.com\/\?q=/.test(link.getAttribute('href')) && q === 'Unterhaltsvorschussstelle Jugendamt' && !/Erlangen|\d{5}/.test(link.getAttribute('href')) && link.getAttribute('target') === '_blank' && /noopener/.test(link.getAttribute('rel')) && link.textContent === I18N.de['f.empfSuche'], q);
  const ortHinweis = d.querySelector('#mappe .empf-edit .empf-such-ort');
  check('[empf] Suchlink: Hinweis „Ort selbst dazuschreiben“ beim Link, in allen 13 Sprachen und Einfacher Sprache', !!ortHinweis && ortHinweis.textContent === I18N.de['f.empfKurz'] && ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'].every((l) => typeof I18N[l]['f.empfKurz'] === 'string' && I18N[l]['f.empfKurz'].length > 20) && typeof require('../src/lang/einfach/ux-fix.json')['f.empfKurz'] === 'string');
  // UX-Nachprüfung 22.11.2026, Nr. 4: ein kurzer Satz statt zwei Absätzen, Knopf kurz („Anschrift im Internet suchen“)
  check('[empf] Unter dem Suchlink nur ein kurzer Satz, Knopf „Anschrift im Internet suchen“', d.querySelectorAll('#mappe .empf-edit .empf-such ~ p').length === 1 && I18N.de['f.empfSuche'] === 'Anschrift im Internet suchen' && I18N.de['f.empfKurz'].length < 90);
  check('[empf] Keine Suchadresse in der ganzen Mappe enthält Ort oder PLZ', [...d.querySelectorAll('#mappe a[href*="duckduckgo"]')].every((a) => !/Erlangen|91052|\d{5}/.test(decodeURIComponent(a.getAttribute('href')))));
  check('[empf] Titel und Platzhalter in der gewählten Sprache; bei bekannter Anschrift kein Hinweis „Fehlt die Anschrift“', d.querySelector('#mappe .empf-edit label').textContent === I18N.de['f.empfTitel'] && d.querySelector('#mappe textarea[data-empf]').getAttribute('placeholder') === I18N.de['f.empfPlatz'] && !d.querySelector('#mappe .empf-edit p.small'));
  check('[empf] Neue Texte in allen 13 Sprachen vorhanden', ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'].every((l) => ['f.empfTitel', 'f.empfHinweis', 'f.empfSuche', 'f.empfZurueck'].every((k) => I18N[l] && typeof I18N[l][k] === 'string' && I18N[l][k].length > 5)));
  check('[empf] Keine Skriptfehler', errors.length === 0, errors.join('; '));
}
// ---------- UX-Nachprüfung 22.11.2026 (docs/entwuerfe/ux-nachpruefung.md) ----------
{
  // Nr. 5: Einkommen von Wohngeld und Kinderzuschlag in einem Punkt, Zeiträume je Leistung; gemeinsame Liste nur für Punkte, die mindestens zwei Anträge nennen
  const a = wegRadios().find((r) => r.value === 'a'); a.checked = true; fire(a, 'change');
  // Gemeinsame Liste: Überschrift, Satz zur Kopie, dann die Liste. Je Punkt die Leistungen, die ihn nennen (Einträge „<Leistung>|<Schlüssel>“ in data-haken-alt)
  const gemeinsam = () => { const h = d.querySelector('#aufUnterlagen h4'); const ul = h && h.nextElementSibling && h.nextElementSibling.matches('p.small') ? h.nextElementSibling.nextElementSibling : null; return ul ? [...ul.querySelectorAll('li')].map((x) => ({ text: x.textContent.trim(), von: [...new Set(JSON.parse(x.querySelector('input').getAttribute('data-haken-alt')).map((k) => k.split('|')[0]).filter((k) => k !== 'u'))] })) : []; };
  const li = [...d.querySelectorAll('#aufUnterlagen .haken-liste li')].map((x) => x.textContent.trim());
  const ek = li.filter((x) => /Einkommen/i.test(x));
  const mitKiz = !!d.querySelector('[data-pick="kiz"]') || wegRadios().length > 0 && /Kinderzuschlag/.test(d.querySelector('.weg-wahl').textContent);
  check('[ux-einkommen] Ein Punkt zum Einkommen mit Zeitraum je Leistung (Wohngeld 12 Monate' + (mitKiz ? ', Kinderzuschlag 6 Monate' : '') + ')', ek.length === 1 && ek[0].includes(I18N.de['u.eink.wg']) && (!mitKiz || ek[0].includes(I18N.de['u.eink.kiz'])) && !li.includes(I18N.de['s.wohngeld.u2']) && !li.includes(I18N.de['s.kiz.u2']), li.join(' | '));
  // Prüfung PR #179: „Für mehrere Anträge“ nur, wenn mindestens zwei gewählte Anträge den Punkt nennen (Ausweis nicht pauschal dorthin)
  check('[ux-einkommen] Gemeinsame Liste: jeder Punkt wird von mindestens zwei Anträgen genannt (auch der Ausweis)', gemeinsam().length > 0 && gemeinsam().every((x) => x.von.length > 1), gemeinsam().map((x) => x.text + ' [' + x.von.join(',') + ']').join(' | '));
  check('[ux-einkommen] Gemeinsamer Text in allen 13 Sprachen mit denselben Zeiträumen', LANGS.every((l) => /12/.test(I18N[l]['u.eink.wg']) && /\b6\b|6-/.test(I18N[l]['u.eink.kiz']) && /\{basis\}/.test(I18N[l]['u.eink.mit']) && /\{teile\}/.test(I18N[l]['u.eink.mit'])));
  // Nr. 2: „Ich weiß es noch nicht“ → Zeile „Weg noch nicht gewählt“, Knopf „Weg wählen“, Tipp; Zähler im Titel
  const o = wegRadios().find((r) => r.value === 'offen'); o.checked = true; fire(o, 'change');
  const zeile = d.querySelector('#aufAntraege .ant-weg-offen');
  check('[ux-weg-offen] Weg offen: Zeile „Weg noch nicht gewählt“ zuerst in „Anträge stellen“, mit Knopf und Tipp', !!zeile && zeile === d.querySelector('#aufAntraege .ant-zeile') && zeile.textContent.includes(I18N.de['f.weg.nochNicht']) && zeile.querySelector('[data-weg-waehlen]').textContent === I18N.de['f.weg.waehlen'] && zeile.textContent.includes(I18N.de[mitKiz ? 'f.weg.tippGgKiz' : 'f.weg.tippGg']));
  check('[ux-weg-offen] Mit Kinderzuschlag im Weg nennt der Tipp nur Familienkasse und Wohngeldstelle, nie „dort“ (schlösse das Jobcenter ein)', /Familienkasse/.test(I18N.de['f.weg.tippGgKiz']) && /Wohngeldstelle/.test(I18N.de['f.weg.tippGgKiz']) && !/dort/.test(I18N.de['f.weg.tippGgKiz']) && LANGS.every((l) => /Familienkasse/.test(I18N[l]['f.weg.tippGgKiz']) && /Wohngeldstelle/.test(I18N[l]['f.weg.tippGgKiz'])));
  check('[ux-weg-offen] Titel zählt den offenen Weg mit', /\+ 1 offen\)$/.test(d.getElementById('titelAntraege').textContent), d.getElementById('titelAntraege').textContent);
  check('[ux-weg-offen] Tipp empfiehlt keinen Antrag beim Jobcenter oder Sozialamt', !/Stell (den|einen|zuerst)|beantrag|Jobcenter|Sozialamt/i.test(I18N.de['f.weg.tippGg'] + I18N.de['f.weg.tippGgKiz'] + I18N.de['f.weg.tippGsa']));
  zeile.querySelector('[data-weg-waehlen]').click();
  check('[ux-weg-offen] „Weg wählen“ setzt den Fokus auf die Weg-Wahl', d.activeElement && d.activeElement.getAttribute('data-weg') === zeile.getAttribute('data-ant-weg'));
  const a2 = wegRadios().find((r) => r.value === 'a'); a2.checked = true; fire(a2, 'change');
  check('[ux-weg-offen] Weg gewählt: Zeile weg, Titel ohne „offen“', !d.querySelector('#aufAntraege .ant-weg-offen') && !/offen/.test(d.getElementById('titelAntraege').textContent));
  check('[ux-weg-offen] Neue Texte in allen 13 Sprachen (Du bzw. höflich in fa/fa-AF/ps)', LANGS.every((l) => ['f.weg.nochNicht', 'f.weg.waehlen', 'f.weg.tippGg', 'f.weg.tippGgKiz', 'f.weg.tippGsa', 'f.weg.zeile', 'f.auf.antraegeOffen', 'akt.ergDrucken', 'f.empfKurz'].every((k) => typeof I18N[l][k] === 'string' && I18N[l][k].length > 2)) && /\{n\}/.test(I18N.ar['f.auf.antraegeOffen']) && /\{m\}/.test(I18N.ps['f.auf.antraegeOffen']));
  // Nr. 1: Knopf „Antrag vorbereiten“ in einer Ergebniskarte öffnet die Mappe mit dieser Leistung
  d.getElementById('mappeClose').click();
  check('[ux-karte] Mappe geschlossen', d.getElementById('mappe').hidden === true);
  const kb = d.querySelector('[data-pick="kindergeld"]'); if (kb) { kb.checked = false; fire(kb, 'change'); }
  const knopf = d.querySelector('#cards [data-antrag="kindergeld"]');
  if (knopf) { const det = knopf.closest('details'); if (det) det.open = true; knopf.click(); }
  check('[ux-karte] Karte Kindergeld: „Antrag vorbereiten“ öffnet die Mappe, Kindergeld angehakt, „Anträge stellen“ offen', !!knopf && d.getElementById('mappe').hidden === false && d.querySelector('[data-pick="kindergeld"]').checked && d.getElementById('aufAntraegeD').open && !!d.querySelector('#aufAntraege [data-ant$="-kg1"], #aufAntraege [data-ant$="-kindergeld"]'));
  d.getElementById('mappeClose').click();
  const kz = d.querySelector('#cards [data-antrag="ggeld"]');
  if (kz) { kz.click(); check('[ux-karte] Karte Grundsicherungsgeld: Mappe mit Weg „Grundsicherungsgeld“ gewählt', d.getElementById('mappe').hidden === false && !!wegRadios().find((r) => r.value === 'b' && r.checked)); d.getElementById('mappeClose').click(); }
  const a3 = wegRadios().find((r) => r.value === 'a'); if (a3) { a3.checked = true; fire(a3, 'change'); }
  if (kb) { const k2 = d.querySelector('[data-pick="kindergeld"]'); k2.checked = false; fire(k2, 'change'); }
  check('[ux-karte] Keine Skriptfehler', errors.length === 0, errors.join('; '));
  d.getElementById('mappeMake').click();
}
// ---------- Absender: einmal eintragen, überall nutzen ----------
{
  // Brief prüfen: Felder der Widerspruchs-/Antwortschreiben bekommen die Angaben; Änderung dort gilt für alle
  const bsName = d.getElementById('bs-name');
  if (bsName) {
    d.getElementById('mappeClose').click();
    const k = d.getElementById('brief-jc'); if (k) k.click();
    check('[absender] Widerspruch Jobcenter: Name und Anschrift eingesetzt', bsName.value === 'Maria Beispiel' && d.getElementById('bs-anschrift').value === 'Hauptstraße 1' && d.getElementById('bs-ort').value === '91056 Erlangen', bsName.value);
    bsName.value = 'Maria Neu'; fire(bsName, 'input');
    check('[absender] Änderung im Widerspruch gilt für alle (Mappe, andere Briefe)', d.getElementById('p-name').value === 'Maria Neu' && (!d.getElementById('kz-name') || d.getElementById('kz-name').value === 'Maria Neu'));
    bsName.value = 'Maria Beispiel'; fire(bsName, 'input');
    d.getElementById('mappeMake').click();
  }
}
check('Web-Version: Anbieter im Impressum David Cabrerizo', d.getElementById('anbieterName').textContent === 'David Cabrerizo');
check('Druck: feste Briefränder (DIN 5008) per @page, unabhängig vom Browser', /@page\s*\{[^}]*size:\s*A4[^}]*margin:\s*20mm 20mm 20mm 25mm/.test(d.documentElement.innerHTML));
// Rückmeldung „Ergebnis passt nicht“: E-Mail-Entwurf mit Version und Einstufungen, ohne Angaben aus dem Fragebogen
{
  const fb = d.getElementById('feedback'), href = decodeURIComponent(d.getElementById('feedbackMail').getAttribute('href') || '');
  check('Rückmeldung: Knopf sichtbar, E-Mail an Kontaktadresse mit Betreff, Version und Einstufungen', !fb.hidden && /^mailto:d\.cabrerizo@gmx\.de\?subject=SoLo: Ergebnis passt nicht/.test(href) && href.indexOf('SoLo ' + require('../package.json').version) >= 0 && /Wohngeld: (Wahrscheinlich|Möglich)/.test(href), href.slice(0, 300));
  check('Rückmeldung: keine persönlichen Angaben (Name, Anschrift, Geburtsdatum, Einkommen, Miete) in der E-Mail', !/Maria|Beispiel|Hauptstraße|Erlangen|1985|2\.?200|1\.?750|950/.test(href), href);
}
d.getElementById('mappeCopy').click();
setTimeout(async () => {
  check('Kopieren meldet Ergebnis oder zeigt Ersatzfeld', d.getElementById('copyMsg').textContent.length > 0 || d.getElementById('mappeText').hidden === false);
  // Sprache in der Mappe
  setLang('en');
  const docs = d.getElementById('aufUnterlagen');
  check('Mappe wird bei Sprachwechsel neu aufgebaut: Unterlagenliste englisch', /^(For all applications|For several applications)/.test(docs.textContent) && /Birth certificate|Rental|tenancy/i.test(docs.textContent), docs.textContent.slice(0, 120));
  check('Formular-Satz in der App-Sprache (nicht mehr deutsch)', d.querySelector('[data-ant="f-wg"]').textContent.indexOf(I18N.en['fw.wg.by']) >= 0);
  check('Brief bleibt bei Sprachwechsel Deutsch', /Betreff: Antrag auf Unterhaltsvorschuss/.test(d.querySelector('#mappeBody .page').textContent));
  setLang('ar');
  check('Arabisch: Mappe rechts nach links, Brief bleibt links nach rechts', d.getElementById('app').getAttribute('dir') === 'rtl' && d.querySelector('#mappeBody .page').getAttribute('dir') === 'ltr' && d.getElementById('m-brief-uvg').getAttribute('dir') === 'ltr');
  setLang('de');
  d.getElementById('mappeClose').click();
  check('Mappe lässt sich schließen', d.getElementById('mappe').hidden === true && !d.getElementById('app').classList.contains('pm'));

  // Struktur
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  check('Titel ist ein Name', title === 'SoLo – Sozialleistungslotse');
  check('Dunkelmodus doppelt definiert', (html.match(/color-scheme: dark/g) || []).length >= 2);
  check('Kein horizontales Scrollen erzwungen', !/min-width:\s*\d{4,}px/.test(html));
  check('Große Schrift: Kartentitel brechen lange Wörter um (kein seitliches Scrollen)', /\.card header > div \{ min-width: 0;/.test(html) && /\.card header h3 \{ overflow-wrap: anywhere; hyphens: manual;/.test(html) && /\.auf-titel \{[^}]*overflow-wrap: anywhere/.test(html) && /\.ant-zeile h4 \{[^}]*overflow-wrap: anywhere/.test(html));
  check('Logische statt physische Abstände im Formular (RTL-fähig)', !/\.money input\s*\{[^}]*padding-right/.test(html) && /inset-inline-end/.test(html));
  check('Jedes Formularfeld hat eine Beschriftung', ['miete', 'mietstufe', 'ek1Art', 'ek1Brutto', 'ek1Netto', 'ek2Art', 'ek2Brutto', 'ek2Netto', 'unterhalt', 'vermoegen', 'gebJahr', 'kindEink', 'ausbildung', 'pflegegrad', 'p-name', 'p-geb', 'p-strasse', 'p-ort', 'p-tel'].every((id) => d.querySelector('label[for="' + id + '"]')));
  // Grenze 6 MB (Entscheidung David 20.11.2026; davor 5 MB; bis 1.4: 2,5 MB; 19.11.2026: 3 MB für 13 Sprachen; 20.11.2026: 4 MB für Vorgänge speichern, Beratungsmodus, Pflege-Unterstützung, Schulden-Tipps, Haushaltsplan; 20.11.2026 nachmittags: 5 MB für Fristen, Schuldenliste, Energie, Mietgrenze, Kostensenkung, Paar-Einkommen – Entscheidung des Nutzers): eine einzige Datei, die offline läuft; der größte Teil sind PLZ-Daten (ganz Deutschland mit Mietenstufen), Behörden (Bayern), 13 Sprachen,
  // seit 1.4 auch „Brief prüfen“ und die Pflegegrad-Einschätzung (zusammen gut 200 KB)
  check('Web-Datei ist ein vollständiges Dokument mit UTF-8 und Viewport (Safari, Handy)', /^<!doctype html>/i.test(html) && /<meta charset="utf-8">/i.test(html.slice(0, 300)) && /name="viewport"/.test(html.slice(0, 400)));
  // 21.11.2026: in Bytes gemessen (Buffer.byteLength, UTF-8) statt in Zeichen.
  // Grenze ganze Datei 8 MB (Entscheidung David 21.11.2026; davor vorläufig 7 MB), weil Pflege-Übersicht, Erklärseite und Einschätzung jetzt
  // in den Sprachen eingebettet sind (src/lang/pflege); Startgrenze 3 MB bleibt.
  // 21.11.2026 (Sprachen nur bei Bedarf, Entscheidung David „A“): Die Web-Datei enthält weiter alle 13 Sprachen (offline, eine Datei),
  // aber die 12 Fremdsprachen als JSON-Datenblöcke, die erst beim Wechsel geparst werden. Ehrliche Grenzen: ganze Datei < 8 MB,
  // beim Start geparster Teil (ohne Datenblöcke) < 3 MB (gemessen 2,8 MB; davon PLZ-Daten, Behörden, Deutsch, Programm).
  check('Dateigröße unter 8 MB (Bytes, alle Sprachen offline in der Datei)', Buffer.byteLength(html, 'utf8') < 8 * 1024 * 1024, (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0) + ' KB');
  const sprachBloecke = html.match(/<script type="application\/json" id="solo-sprache-[^"]+">[^<]*<\/script>\n/g) || [];
  const startTeil = sprachBloecke.reduce((a, b) => a.replace(b, ''), html);
  check('[sprachladen] Beim Start geparster Teil unter 3 MB (Fremdsprachen erst beim Wechsel)', Buffer.byteLength(startTeil, 'utf8') < 3 * 1024 * 1024, (Buffer.byteLength(startTeil, 'utf8') / 1024).toFixed(0) + ' KB');
  check('[sprachladen] 12 Fremdsprachen als Datenblöcke, Deutsch nicht', sprachBloecke.length === 12 && !/id="solo-sprache-de"/.test(html));
  check('[sprachladen] Datenblöcke ohne „<“ im Inhalt (kein vorzeitiges </script>)', sprachBloecke.every((b) => b.replace(/^<script[^>]*>/, '').replace(/<\/script>\n$/, '').indexOf('<') < 0));
  check('[sprachladen] Startskript: nur Deutsch vollständig, andere Sprachen nur Name und Schreibrichtung', Object.keys(I18N).filter((l) => l !== 'de').every((l) => w.eval('I18N')[l] === undefined || Object.keys(w.eval('I18N')[l]).every((k) => k.startsWith('meta.')) || w.eval('SprachLaden').da(l)) && Object.keys(w.eval('I18N').de).length === Object.keys(I18N.de).length);
  // Sprachwechsel ohne Netz: JSDOM lädt hier nichts nach (keine Ressourcen) – die Texte kommen nur aus der Datei selbst
  ['ar', 'uk', 'so'].forEach((l) => {
    setLang(l);
    const I = w.eval('I18N')[l];
    check('[sprachladen] Offline-Wechsel nach ' + l + ': sofort übersetzt, alle Texte da', d.getElementById('app').getAttribute('lang') === l && JSON.stringify(I) === JSON.stringify(I18N[l]) && d.querySelector('[data-t="nav.ordner"]') && d.querySelector('[data-t="nav.ordner"]').textContent === I18N[l]['nav.ordner'] && !d.getElementById('sprachFehler'));
  });
  // Unabhängige Sicherheitsprüfung 21.11.2026: nur Kürzel aus der festen Liste; nichts von „außen“ (Pfad, Objekt-Eigenschaften) gilt als Sprache
  check('[sprachladen] Nur erlaubte Sprachkürzel: kein Pfad, keine Objekt-Eigenschaft', ['constructor', 'toString', '__proto__', 'hasOwnProperty', '../de', 'de/../ar', 'ar.js', 'AR', '', null, 5].every((x) => w.eval('SprachLaden').da(x) === false) &&
    w.eval('SprachLaden').dazu('constructor', { 'meta.name': 'x' }) === false && w.eval('SprachLaden').dazu('../x', { 'meta.name': 'x' }) === false && typeof w.eval('I18N').constructor === 'function');
  check('[sprachladen] Arabisch: rechts nach links nach dem Nachladen', (setLang('ar'), d.getElementById('app').getAttribute('dir') === 'rtl'));
  // Fehlerfall: Datenblock fehlt (z. B. beschädigte Datei) → Deutsch und kurzer Hinweis. Eigene kleine Seite: gespeicherte Sprache
  // Französisch, Block für Französisch aus der Datei entfernt; Start und späterer Wechsel zeigen Deutsch mit Hinweis
  {
    const ohneFr = html.replace(/<script type="application\/json" id="solo-sprache-fr">[^<]*<\/script>\n/, '');
    const st = { 'lotse-lang': 'fr' }, fehlerF = [];
    const domF = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + ohneFr + '</body></html>', {
      runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(x) {
        x.addEventListener('error', (e) => fehlerF.push(String(e.error || e.message)));
        x.HTMLElement.prototype.scrollIntoView = function () {}; x.scrollTo = function () {};
        Object.defineProperty(x, 'localStorage', { value: { getItem: (k) => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); } }, configurable: true });
      }
    });
    await new Promise((r) => setTimeout(r, 50));
    const dF = domF.window.document, hF = () => dF.getElementById('sprachFehler');
    check('[sprachladen] Sprache lädt nicht (beim Start): Deutsch und Hinweis', ohneFr.length < html.length && dF.getElementById('app').getAttribute('lang') === 'de' && dF.getElementById('lang').value === 'de' && !!hF() && /Deutsch/.test(hF().textContent) && dF.querySelector('[data-t="nav.ordner"]').textContent === I18N.de['nav.ordner'] && fehlerF.length === 0, (hF() && hF().textContent) + ' ' + fehlerF.join('|'));
    const sF = dF.getElementById('lang'); sF.value = 'uk'; sF.dispatchEvent(new domF.window.Event('change', { bubbles: true }));
    check('[sprachladen] Andere Sprache geht danach, Hinweis weg', dF.getElementById('app').getAttribute('lang') === 'uk' && !hF());
    sF.value = 'fr'; sF.dispatchEvent(new domF.window.Event('change', { bubbles: true }));
    // Rückmeldung kommt über setTimeout; vorher geplante Zeichen-Timer (Bündel) können länger als 30 ms brauchen: bis 2 s warten
    for (let i = 0; i < 40 && !hF(); i++) await new Promise((r) => setTimeout(r, 50));
    check('[sprachladen] Sprache lädt nicht (beim Wechsel): Deutsch und Hinweis', dF.getElementById('app').getAttribute('lang') === 'de' && !!hF());
    domF.window.close();
  }
  setLang('de');
  // ----- Antrag scannen -----
  setLang('de');
  beispiel('p1');
  setNum('miete', 950);
  d.getElementById('p-name').value = 'Maria Muster'; fire(d.getElementById('p-name'), 'input');
  d.getElementById('p-geb').value = '01.02.1985'; fire(d.getElementById('p-geb'), 'input');
  check('Scan: Claude-Option ohne Claude-Laufzeit versteckt', d.getElementById('sc-claudeBox').hidden === true);
  d.getElementById('sc-local').click();
  check('Scan: ohne Eingabe kommt Hinweis', /Foto/.test(d.getElementById('sc-msg').textContent), d.getElementById('sc-msg').textContent);
  d.getElementById('sc-text').value = 'Antrag auf Wohngeld\nName, Vorname\nGeburtsdatum\nMonatliche Warmmiete in Euro\nBruttoeinkommen aller Haushaltsmitglieder\nIBAN\nOrt, Datum, Unterschrift\nIrgendein Unsinn';
  d.getElementById('sc-local').click();
  const rows = () => [...d.querySelectorAll('#sc-out .sc-row')];
  check('Scan: Felder aus Text erkannt', rows().length === 6, rows().length + ' ' + d.getElementById('sc-out').textContent.slice(0, 200));
  const rowOf = (id) => rows().find((r) => r.textContent.includes(id));
  check('Scan: Name bekommt eingegebenen Wert', rowOf('Name, Vorname').querySelector('bdi').textContent === 'Maria Muster');
  check('Scan: Miete bekommt Wert aus dem Check', /950 €/.test(rowOf('Warmmiete').querySelector('bdi').textContent));
  check('Scan: IBAN wird nie vorausgefüllt, steht in der Liste zum Selbst-Eintragen (zum Abhaken)', !rowOf('IBAN').querySelector('bdi') && !!rowOf('IBAN').querySelector('input[type=checkbox]') && /selbst/.test(d.getElementById('sc-out').textContent));
  check('Scan: Antragswort "Antrag auf Wohngeld" ist kein Feld', !rowOf('Antrag auf Wohngeld'));
  setLang('tr');
  check('Scan: Erklärung folgt der Sprache (Türkisch, Du-Form), Wert bleibt deutsch', /adın/.test(rowOf('Name, Vorname').textContent) && rowOf('Name, Vorname').querySelector('bdi').textContent === 'Maria Muster');
  setLang('ar');
  check('Scan: Arabisch rendert, Formularzeile bleibt ltr/de', rowOf('Name, Vorname').querySelector('.sc-lab').getAttribute('dir') === 'ltr');
  setLang('de');
  check('Scan: Claude-Knopf ohne Laufzeit nicht vorhanden/sichtbar', d.getElementById('sc-claudeBox').hidden === true);
  // Claude-Pfad mit Attrappe in eigener Seite
  const calls = [];
  const dom2 = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w2) {
      w2.HTMLElement.prototype.scrollIntoView = function () {}; w2.scrollTo = function () {};
      Object.defineProperty(w2, 'localStorage', { value: { getItem: () => null, setItem: () => {} }, configurable: true });
      w2.claude = { use: async (n) => n === 'sample' ? Object.assign(async () => ({ text: '' }), {
        limits: async () => ({ images: { maxCount: 1, mediaTypes: ['image/png'] } }),
        json: async (pr, o) => { calls.push({ pr, o }); return [{ label: 'Name', id: 'name' }, { label: 'Kontoinhaber', id: 'iban' }, { label: 'Zeugnisnote', id: 'other', hint: 'Note im letzten Zeugnis.' }, { label: 'ohne', id: 'other' }, 5]; }
      }) : null };
    }
  });
  setTimeout(() => {
    const d2 = dom2.window.document;
    check('Scan/Claude: Box sichtbar, wenn Bilder erlaubt', d2.getElementById('sc-claudeBox').hidden === false);
    check('Scan/Claude: Knopf gesperrt ohne Einwilligung', d2.getElementById('sc-claude').disabled === true);
    const cb = d2.getElementById('sc-consent'); cb.checked = true; cb.dispatchEvent(new dom2.window.Event('change', { bubbles: true }));
    check('Scan/Claude: Knopf frei nach Einwilligung', d2.getElementById('sc-claude').disabled === false);
    const fl = d2.getElementById('sc-file');
    Object.defineProperty(fl, 'files', { value: [new dom2.window.File(['x'], 'a.png', { type: 'image/png' })], configurable: true });
    d2.getElementById('sc-claude').click();
    setTimeout(() => {
      check('Scan/Claude: ein Aufruf mit Bild', calls.length === 1 && calls[0].o.images.length === 1);
      const r2 = [...d2.querySelectorAll('#sc-out .sc-row')];
      check('Scan/Claude: ungültige Einträge gefiltert, 3 Zeilen', r2.length === 3, r2.length);
      check('Scan/Claude: Zusatzfeld zeigt Claude-Erklärung', /Zeugnis/.test(r2[2].textContent) && /Claude/.test(r2[2].textContent));
      check('Scan/Claude: Eingabe nicht als HTML interpretiert', !d2.querySelector('#sc-out script'));
      finish();
    }, 100);
  }, 100);
  function finish() {
  // Gespeicherte Angaben im alten Format (brutto/brutto2/netto/nichtArbeit) werden in die neue Eingabe übernommen
  const alt = { s: { adults: 2, kids: 1, brutto: 3000, brutto2: 1000, netto: 2300, nichtArbeit: false, nichtArbeit2: true, miete: 900, mietstufe: '3', vermoegen: 0, bezug: {} }, p: {}, e: true };
  const dom3 = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w3) {
      w3.HTMLElement.prototype.scrollIntoView = function () {}; w3.scrollTo = function () {};
      Object.defineProperty(w3, 'localStorage', { value: { getItem: (k) => (k === 'lotse.state' ? JSON.stringify(alt) : null), setItem: () => {}, removeItem: () => {} }, configurable: true });
    }
  });
  const d3 = dom3.window.document;
  check('Alte Angaben übernommen: erste Person Lohn 2.000 € brutto, Haushalts-Netto 2.300 € nach Brutto-Anteil verteilt (1.533 + 767 €)', d3.getElementById('ek1Art').value === 'lohn' && d3.getElementById('ek1Brutto').value === '2000' && d3.getElementById('ek1Netto').value === '1533' && d3.getElementById('ek2Netto').value === '767', d3.getElementById('ek1Art').value + ' ' + d3.getElementById('ek1Brutto').value);
  check('Alte Angaben übernommen: Partner Rente o. Ä. 1.000 € brutto', d3.getElementById('ek2Art').value === 'rente' && d3.getElementById('ek2Brutto').value === '1000');

  // Gespeicherte PLZ ohne Mietenstufe (z. B. aus der einfachen Version): Mietenstufe wird beim Laden ergänzt; eine selbst gewählte bleibt
  const mitPlz = (ms) => {
    const st = { s: { adults: 1, kids: 0, ek1Art: 'lohn', ek1Brutto: '1500', ek1Netto: '1150', miete: '600', plz: '50667', mietstufe: ms, vermoegen: '0', bezug: {} }, p: {}, e: true };
    const dm = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', { runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(w4) { w4.HTMLElement.prototype.scrollIntoView = function () {}; w4.scrollTo = function () {};
        Object.defineProperty(w4, 'localStorage', { value: { getItem: (k) => (k === 'lotse.state' ? JSON.stringify(st) : null), setItem: () => {}, removeItem: () => {} }, configurable: true }); } });
    return dm.window.document.getElementById('mietstufe').value;
  };
  check('Gespeicherte PLZ 50667 ohne Mietenstufe: Mietenstufe VI (Köln) wird ergänzt', mitPlz('') === '6', mitPlz(''));
  check('Selbst gewählte Mietenstufe bleibt beim Laden erhalten', mitPlz('3') === '3', mitPlz('3'));
  // Unterhalt, den man selbst zahlt: Zusatzfragen erst mit Betrag, beim Löschen zurückgesetzt
  setLang('de'); setNum('uzBetrag', '');
  const uzBox = () => d.querySelector('.cond-uz');
  check('Unterhalt (gezahlt): Feld beschriftet, Zusatzfragen ohne Betrag verborgen', !!d.querySelector('label[for="uzBetrag"]') && !!d.querySelector('label[for="uzAn"]') && uzBox().hidden);
  setNum('uzBetrag', '300'); setSel('uzAn', 'k2'); setChk('uzTitel', true);
  check('Unterhalt (gezahlt): mit Betrag erscheinen „An wen“ (6 Auswahlen) und „Betrag festgelegt“', !uzBox().hidden && d.getElementById('uzAn').options.length === 6 && d.getElementById('uzTitel').checked);
  setNum('uzBetrag', '');
  check('Unterhalt (gezahlt): Betrag gelöscht -> Zusatzfragen verborgen und zurückgesetzt', uzBox().hidden && d.getElementById('uzAn').value === '' && !d.getElementById('uzTitel').checked);
  // Neue Fragen: EU-Staatsangehörigkeit, Auto, Wohneigentum, weitere Erwachsene, Selbstständigkeit
  const vis = (sel) => !d.querySelector(sel).hidden;
  check('Neue Fragen beschriftet (Wohnart, weitere Erwachsene, Auto, EU-Arbeit, EU-Jahre)', ['wohnart', 'hhAndere', 'autoWert', 'euArbeit', 'euJahre'].every((id) => !!d.querySelector('label[for="' + id + '"]')));
  setSel('aufenthalt', 'eu');
  check('EU: Fragen zu Arbeit und Aufenthaltsdauer erscheinen', vis('.cond-eu') && d.getElementById('euJahre').options.length === 3);
  setSel('euArbeit', 'nein'); setSel('aufenthalt', '');
  check('EU abgewählt: Zusatzfragen verborgen und zurückgesetzt', !vis('.cond-eu') && d.getElementById('euArbeit').value === '');
  setNum('autoWert', '12000');
  check('Auto mit Wert: Haken „wird gebraucht“ erscheint', vis('.cond-auto'));
  setNum('autoWert', '');
  check('Auto ohne Wert: Haken verborgen', !vis('.cond-auto'));
  setSel('wohnart', 'eigentum');
  check('Eigentum: Feld heißt „Kosten fürs Wohnen“', d.getElementById('mieteLab').textContent === I18N.de['miete.label.eigen']);
  setSel('wohnart', '');
  check('Miete: Feld heißt wieder „Miete“', d.getElementById('mieteLab').textContent === I18N.de['miete.label']);
  check('Einkommensart „Selbstständig“ wählbar', [...d.getElementById('ek1Art').options].some((o) => o.value === 'selbst'));
  // Startsprache aus den Geräteeinstellungen: Dari (fa-AF) und Farsi (fa) getrennt erkennen
  const startLang = (langs) => { const st = {}; const dw = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', { runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(x) { x.HTMLElement.prototype.scrollIntoView = function () {}; x.scrollTo = function () {}; Object.defineProperty(x.navigator, 'languages', { value: langs, configurable: true }); Object.defineProperty(x, 'localStorage', { value: { getItem: (k) => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); } }, configurable: true }); } }); const v = dw.window.document.getElementById('lang').value; dw.window.close(); return v; };
  check('Gerät auf Dari (fa-AF) startet in Dari, Farsi (fa-IR, fa) in Farsi, Französisch (fr-CA) in Französisch, Unbekanntes in Deutsch', startLang(['fa-AF']) === 'fa-AF' && startLang(['fa-af', 'de']) === 'fa-AF' && startLang(['fa-IR']) === 'fa' && startLang(['fa']) === 'fa' && startLang(['fr-CA']) === 'fr' && startLang(['ps-AF']) === 'ps' && startLang(['so-SO']) === 'so' && startLang(['xx']) === 'de');
  // Zurück-Wege über die gemerkte Herkunft (Start → Pflege/Pfändung/Sparen → zurück)
  const sicht = () => ['start', 'leistungen', 'briefe', 'pflege', 'pfaendung', 'sparen'].find((x) => !d.getElementById('v-' + x).hidden);
  const navAkt = () => (d.querySelector('#appnav button[aria-current="page"]') || {}).getAttribute?.('data-ansicht');
  d.querySelector('#appnav button[data-ansicht="start"]').click();
  // Kopfzeile (Logo, App-Name, Satz „Prüfe in etwa 5 Minuten …“) nur auf der Startseite; sonst sichtbar versteckt, h1 bleibt für Screenreader
  const kopfVersteckt = () => { const st = w.getComputedStyle(d.querySelector('header.top')); return st.position === 'absolute' && st.width === '1px' && st.overflow === 'hidden'; };
  check('Kopfzeile mit Logo, Name und Satz „Prüfe in etwa 5 Minuten“ auf der Startseite sichtbar', !kopfVersteckt() && w.getComputedStyle(d.querySelector('.top .lead')).display !== 'none' && !!d.querySelector('.top .kopf-titel h1'));
  for (const a of ['leistungen', 'ordner', 'einst']) {
    if (a === 'leistungen') d.getElementById('goLeistungen').click(); else d.querySelector('#appnav button[data-ansicht="' + a + '"]').click();
    check('Kopfzeile auf „' + a + '“ ausgeblendet, h1 im Dokument, eigene Überschrift sichtbar', kopfVersteckt() && d.querySelectorAll('header.top h1').length === 1 && !!d.querySelector('#v-' + a + ' h2:not([hidden])'));
  }
  d.querySelector('#appnav button[data-ansicht="start"]').click();
  d.getElementById('goGeld').click();
  check('Start → Geld und Schulden: Leiste markiert Start, oben „← Zurück“ als Textknopf', sicht() === 'sparen' && navAkt() === 'start' && /← /.test(d.querySelector('#v-sparen [data-nav-zurueck]').textContent) && d.querySelector('#v-sparen [data-nav-zurueck]').classList.contains('pa-zur'));
  d.querySelector('#v-sparen [data-nav-zurueck]').click();
  check('Geld und Schulden „← Zurück“ führt zur Startseite', sicht() === 'start');
  check('Startseite: eine Kachel „Geld und Schulden“, keine eigenen Kacheln für Sparen und Pfändung', !!d.getElementById('goGeld') && !d.getElementById('goSparen') && !d.getElementById('goPfaendung') && d.getElementById('goGeld').classList.contains('sk'));
  { // Reihenfolge der Startkacheln im DOM (= Tastatur- und Vorlese-Reihenfolge), Wunsch David 21.11.2026: Pflege direkt unter „Welche Hilfen stehen mir zu?“
    const ids = [...d.querySelectorAll('.start-raster > .sk')].map((e) => e.id).join(',');
    check('Startseite: Kachel-Reihenfolge Leistungen, Pflege, Briefe, Geld, Ausziehen (DOM)', ids === 'goLeistungen,goPflege,goBriefe,goGeld,goAusziehen', ids);
    check('Startseite: Pflege-Kachel behält ihre Farbe (sk-pflege)', d.getElementById('goPflege').classList.contains('sk-pflege'));
  }
  d.getElementById('goPflege').click();
  if (sicht() === 'pflege') {
    check('Start → Pflege: Leiste markiert Start', navAkt() === 'start');
    d.querySelector('#pflegeAssist .pa-zur').click();
    check('Start → Pflege → „Zurück“ führt zur Startseite', sicht() === 'start');
  }
  // Geld und Schulden: 6 Kacheln (Form der Startseite) nach dem Ablauf der Schuldnerberatung (Konzept, Entscheidung David 20.11.2026):
  // Es ist dringend (Krisen-Check + 5 Fälle), Was bleibt mir?, Schulden-Liste, Post vom Inkasso, Mein Geld planen (mit Sparen), Schuldnerberatung
  {
    setLang('de');
    d.querySelector('#appnav button[data-ansicht="start"]').click();
    d.getElementById('goGeld').click();
    const box = d.getElementById('spInhalt');
    const kacheln = () => [...box.querySelectorAll('.uk-raster > button.uk-karte')];
    const zur = () => d.querySelector('#v-sparen [data-nav-zurueck]').click();
    const titel = kacheln().map((b) => b.querySelector('b').textContent);
    check('[geld] 6 Kacheln in fester Reihenfolge', titel.join('|') === ['gs.dringend', 'gs.bleibt', 'sl.h', 'gs.inkasso', 'gs.planen', 'sb.h'].map((k) => I18N.de[k]).join('|'), titel.join('|'));
    check('[geld] Kacheln in der Form der Startseite (Symbol, Titel, Text)', kacheln().every((b) => b.querySelector('.sk-sym svg') && b.querySelector('.sk-txt b') && b.querySelector('.sk-txt span')));
    check('[geld] weiße Unterkacheln (uk-karte im uk-raster, Design #68)', kacheln().length === 6 && kacheln().every((b) => b.classList.contains('uk-karte') && !b.classList.contains('sk')));
    check('[geld] keine Zeile für Fachkräfte im Privatmodus', !box.querySelector('.ber-nur'));
    check('[ux-c] Startebene „Geld und Schulden“: großer Bereichstitel, kein Aufgaben-Titel', !d.getElementById('v-sparen').classList.contains('gs-unter') && !box.querySelector('.gs-titel'));
    // 1 Es ist dringend: Krisen-Check zuerst, dann Fälle
    kacheln()[0].click();
    const faelle = kacheln().map((b) => b.className.match(/gs-d-([a-z]+)/)[1]);
    check('[geld] Es ist dringend: Krisen-Check als erste Karte, dann Konto, Strom/Gas, Mahnbescheid, Wohnung, Geldstrafe', faelle.join() === 'check,konto,strom,mahn,miete,geld', faelle.join());
    kacheln()[3].click();
    check('[geld] Mahnbescheid: Frist offen (kurz fett, Einzelheiten ohne Paragrafen), erster Schritt oben, Einzelheiten zugeklappt', box.querySelector('.gs-frist .gs-frist-kurz b').textContent === I18N.de['gs.d.mahn.frist.kurz'] && box.querySelector('.gs-frist .gs-frist-lang').textContent === FmtN.ohnePara(I18N.de['gs.d.mahn.frist']) && !box.querySelector('.gs-frist details') && box.querySelector('.gs-schritt p').textContent === I18N.de['gs.d.mahn.schritt'] && !box.querySelector('details[data-fall="mahn"]').open);
    const fall = (f) => box.querySelector('[data-fall="' + f + '"] p').textContent;
    check('[schulden-korr] Vollstreckungsbescheid: darf sofort gepfändet werden, Einspruch 2 Wochen (Notfrist), stoppt nicht von selbst; Widerspruch bis zum Vollstreckungsbescheid', /solange das Gericht noch keinen Vollstreckungsbescheid erlassen hat \(§ 694 ZPO\)/.test(fall('mahn')) && /darf sofort gepfändet werden \(§ 700 ZPO\)\. Dagegen hilft nur noch ein Einspruch\. Er muss innerhalb von 2 Wochen/.test(fall('mahn')) && /Notfrist, §§ 700, 339 ZPO/.test(fall('mahn')) && /nicht von selbst.*§ 719 ZPO/.test(fall('mahn')));
    check('[ux-c] Seitentitel = Aufgabe: „Mahnbescheid“ als Überschrift, „Geld und Schulden“ als kleine Zeile', d.getElementById('v-sparen').classList.contains('gs-unter') && box.querySelector('.gs-titel').getAttribute('role') === 'heading' && box.querySelector('.gs-titel').textContent === I18N.de['gs.d.mahn']);
    check('[geld] Mahnbescheid nennt die 2-Wochen-Frist mit Quelle (Paragraf in „Quellen“, UX-Audit C Nr. 18)', /2 Wochen/.test(box.querySelector('.gs-frist-lang').textContent) && !/§/.test(box.querySelector('.gs-frist').textContent) && /Gesetze auf dieser Seite: § 692 ZPO; §§ 700, 339 ZPO/.test(box.querySelector('.quellen').textContent));
    check('[geld] Mahnbescheid: Knopf „In die Schulden-Liste eintragen“ als Hauptknopf (UX-Audit C)', !!box.querySelector('.gs-in-liste') && !box.querySelector('.gs-in-liste').classList.contains('ghost'));
    // Aufräumen 21.11.2026: alle Fälle gleich aufgebaut – Frist, „Das tust du jetzt“, Knöpfe (Beratungsstelle zuletzt), Quellen
    const aufbau = () => [...box.children].map((e) => (e.className.match(/pf-frage|gs-frist|gs-schritt|gs-tipps|gs-freibetrag|gs-knoepfe|quellen/) || ['?'])[0]).join();
    check('[aufraeumen] Mahnbescheid: Reihenfolge Titel, Frist, Schritte, Knöpfe, Quellen; Beratungsstelle als letzter Knopf', aufbau() === 'pf-frage,gs-frist,gs-schritt,gs-knoepfe,quellen' && box.querySelector('.gs-knoepfe').lastChild.classList.contains('gs-zur-hilfe') && box.querySelectorAll('.gs-schritt li').length === 2 && box.querySelector('.gs-schritt h3').textContent === I18N.de['pf.jetzt.h'], aufbau());
    zur(); kacheln()[1].click();
    check('[aufraeumen] Konto: Schritte Umwandeln und Bescheinigung (§ 903 ZPO), Grundfreibetrag aus Rules, kein doppelter P-Konto-Tipp', aufbau() === 'pf-frage,gs-frist,gs-schritt,gs-freibetrag,gs-knoepfe,quellen' && [...box.querySelectorAll('.gs-schritt details')].map((x) => x.getAttribute('data-tipp')).join() === 'gs.d.konto.schritt,pf.tipp.bescheinigung' && /§ 903 ZPO/.test(box.querySelector('.gs-schritt li:nth-child(2) p').textContent) && box.querySelector('.gs-freibetrag td:last-child').textContent.replace(/\s/g, '') === '1.590€' && !box.querySelector('[data-tipp="sp.schulden.konto"]'), aufbau());
    check('[aufr-geld] Konto: „Jeder darf nur ein P-Konto haben“ aufklappbar beim Schritt Umwandeln (§ 850k Abs. 3 ZPO)', /nur ein P-Konto haben \(§ 850k Abs\. 3 ZPO\)/.test(box.querySelector('.gs-schritt [data-tipp="gs.d.konto.schritt"] p').textContent) && !/nur ein P-Konto/.test(box.querySelector('.gs-schritt [data-tipp="gs.d.konto.schritt"] summary').textContent));
    [2, 4, 5].forEach((i) => { zur(); kacheln()[i].click(); check('[aufraeumen] Fall ' + i + ': gleicher Aufbau', aufbau() === (i === 2 ? 'pf-frage,gs-frist,gs-schritt,gs-tipps,gs-knoepfe,quellen' : 'pf-frage,gs-frist,gs-schritt,gs-knoepfe,quellen'), aufbau()); });
    zur();
    check('[geld] „← Zurück“ aus einem Fall führt zur Auswahl „Es ist dringend“', kacheln().length === 6 && !!box.querySelector('.gs-d-check'));
    kacheln()[2].click();
    { const sx = [...box.querySelectorAll('details.tipp > p, .gs-frist-lang')].map((e) => e.textContent).join(' '); // Frist offen (UX-Audit C Nr. 6)
      check('[schulden-korr] Strom/Gas: 2 Abschläge und 100 €, 4 Wochen Androhung, 8 Werktage, zinsfreie Raten (§§ 41f, 41g EnWG)', /2 Monatsabschlägen und mindestens 100 € .*§ 41f EnWG/.test(fall('strom')) && /4 Wochen vorher angedroht und 8 Werktage/.test(sx) && /zinsfrei anbieten \(§ 41g EnWG\)/.test(sx) && /Strom und Gas/.test(fall('strom')) && !/StromGVV/.test(sx));
      check('[aufraeumen] Strom/Gas: 3 Schritte (Raten, Härte, Darlehen), Tipp „Sperre erst ab …“ darunter, ohne Wiederholung von sp.schulden.strom', [...box.querySelectorAll('.gs-schritt details')].map((x) => x.getAttribute('data-tipp')).join() === 'gs.d.strom.schritt,gs.d.strom.haerte,gs.d.strom.darlehen' && box.querySelector('.gs-tipps [data-tipp="gs.d.strom.grenze"]') && !box.querySelector('[data-tipp="sp.schulden.strom"]') && /Darlehen/.test(sx)); }
    check('[geld] Strom/Gas: Knopf „Abschlag prüfen“', !!box.querySelector('.gs-abschlag'));
    box.querySelector('.gs-brief').click();
    { const tx = d.getElementById('ms-text').value; check('[ux-c] Strom/Gas: Muster mit beiden Fällen (Grundversorgung § 41g EnWG / anderer Tarif ohne Anspruch)', /Abwendungsvereinbarung mit zinsfreien Raten \(§ 41g EnWG\)/.test(tx) && /Anderer Tarif: Ich bitte um eine Ratenzahlung\./.test(tx) && box.querySelector('.gs-brief-lead').textContent === I18N.de['gs.d.strom.brief.lead']); }
    zur();
    zur(); kacheln()[4].click();
    check('[schulden-korr] Mietschulden: ordentliche Kündigung kann trotz Schonfrist bestehen bleiben', /ordentlich \(mit Frist\) gekündigt.*trotz Zahlung bestehen bleiben/.test(fall('miete')) && /§ 569 BGB/.test(box.querySelector('.quellen').textContent));
    check('[ux-c] Mietschulden: Frist-Kurztext verleitet nicht zum Abwarten, alle offenen Mieten (Rechtsprüfung 21.11.2026)', box.querySelector('.gs-frist-kurz').textContent === 'Sofort handeln. Warte nicht auf die Klage.' && /Alle offenen Mieten.*2 Monate/.test(box.querySelector('.gs-frist-lang').textContent));
    box.querySelector('.gs-brief').click();
    check('[ux-c] Mietschulden: Hauptknopf öffnet Muster „Antrag auf Übernahme der Mietschulden“ (Wortlaut Rechtsprüfung, Empfänger nur als Art der Stelle)', box.querySelector('.pf-frage').textContent === I18N.de['gs.d.miete.brief'] && /ich beantrage die Übernahme meiner Mietschulden, um die Wohnung zu sichern \(Jobcenter: § 22 Abs\. 8 SGB II · Sozialamt: § 36 SGB XII\)\. Mir droht der Verlust der Wohnung\./.test(d.getElementById('ms-text').value) && /\[Name der Firma oder Stelle\]/.test(d.getElementById('ms-text').value) && !d.getElementById('ms-von') && /Darlehen/.test(box.querySelector('.gs-brief-lead').textContent));
    zur(); check('[ux-c] Zurück aus dem Muster: wieder die Seite Mietschulden', box.querySelector('.pf-frage').textContent === I18N.de['gs.d.miete'] && !!box.querySelector('.gs-frist'));
    zur(); kacheln()[5].click();
    check('[geld] Geldstrafe: Frist mit § 43 StGB (1 Tag für 2 Tagessätze), Schritt mit § 459a StPO und Art. 293 EGStGB', /1 Tag Haft für 2 Tagessätze/.test(box.querySelector('.gs-frist-lang').textContent) && /§ 43 StGB/.test(box.querySelector('.quellen').textContent) && /§ 459a StPO/.test(box.querySelector('.gs-schritt p').textContent) && /Art\. 293 EGStGB/.test(box.querySelector('.gs-schritt p').textContent));
    zur();
    // Krisen-Check: eine Frage je Bildschirm, Ergebnis höchstens 3 „zuerst“, immer „Beratungsstelle finden“ am Ende
    kacheln()[0].click();
    check('[krisencheck] Frage 1 von 7 mit Ja/Nein und „Weiß nicht – weiter“', /1 von 7/.test(box.querySelector('.kc-nr').textContent) && d.getElementById('kc-q').textContent === I18N.de['kc.q1'] && !!d.getElementById('kc-ja') && !!d.getElementById('kc-nein') && !!d.getElementById('kc-weiter'));
    ['kc-ja', 'kc-nein', 'kc-ja', 'kc-ja', 'kc-ja', 'kc-weiter', 'kc-nein'].forEach((id) => d.getElementById(id).click());
    const zuerst = [...box.querySelectorAll('ol.kc-liste:not(.kc-weiter) .uk-karte')].map((b) => b.className.match(/kc-z-([a-z]+)/)[1]);
    const danach = [...box.querySelectorAll('ol.kc-weiter li:not(.kc-ende) .uk-karte')].map((b) => b.className.match(/kc-z-([a-z]+)/)[1]);
    check('[krisencheck] Ergebnis: Mahnbescheid, Miete, Strom zuerst; Konto danach; am Ende Beratungsstelle finden', zuerst.join() === 'mahn,miete,strom' && danach.join() === 'konto' && !!box.querySelector('.kc-ende .kc-z-finden'), zuerst.join() + '|' + danach.join());
    check('[ux-c] Krisen-Check-Ergebnis: eine Überschrift, Beratung als 5. Schritt', !box.textContent.includes(I18N.de['kc.h']) && box.querySelectorAll('.pf-frage').length === 1 && box.querySelector('ol.kc-weiter').lastChild.querySelector('.kc-z-finden') && box.querySelector('ol.kc-weiter').start === 4);
    check('[ux-c] Krisen-Check-Ergebnis: je Karte Frist oder Grund', box.querySelector('.kc-z-mahn').textContent.includes(I18N.de['gs.d.mahn.frist.kurz']) && box.querySelector('.kc-z-miete').textContent.includes(I18N.de['gs.d.miete.frist.kurz']) && box.querySelector('.kc-z-konto').textContent.includes(I18N.de['gs.d.konto.frist.kurz']));
    box.querySelector('.kc-z-miete').click();
    check('[krisencheck] Ergebniskarte springt in den Fall', box.querySelector('.pf-frage').textContent === I18N.de['gs.d.miete']);
    zur(); zur();
    check('[geld] zweimal „← Zurück“: wieder bei den 6 Kacheln', kacheln().length === 6 && !!box.querySelector('.gs-inkasso'));
    // 4 Post vom Inkasso
    kacheln()[3].click();
    check('[inkasso] Unterkarten: Stimmt der Brief?, Schreiben, Raten anbieten, Gelber Umschlag', kacheln().map((b) => b.className.match(/gs-i-([a-z]+)/)[1]).join() === 'pruef,schreiben,rate,gelb');
    kacheln()[0].click();
    const ipH = [...box.querySelectorAll('.ip-liste input[type=checkbox]')];
    check('[inkasso] Prüfliste: 6 Haken nach § 13a RDG, ohne Fundstelle im Privatmodus, 3 Warnungen', ipH.length === 6 && !box.querySelector('.ber-nur') && box.querySelectorAll('.ip-warn').length === 3);
    check('[inkasso] Prüfliste: Hinweis „Erste Einschätzung, keine Rechtsberatung“ immer sichtbar (Prüfung 20.11.2026)', !!box.querySelector('.ip-hinweis') && /keine Rechtsberatung/.test(box.querySelector('.ip-hinweis').textContent));
    check('[inkasso] Prüfliste: Tipps zusammen, Hinweis „keine Rechtsberatung“ erst nach dem letzten Tipp (Aufräumen 21.11.2026)', box.querySelector('.ip-hinweis').previousElementSibling.getAttribute('data-fall') === 'inkasso' && box.querySelector('.ip-hinweis').nextElementSibling.classList.contains('quellen'));
    check('[ux-c] Prüfliste ohne Haken: keine zweite Liste derselben 6 Punkte', box.querySelectorAll('#ip-erg li').length === 0 && d.getElementById('ip-erg').textContent === '' && box.textContent.split(I18N.de['ip.1']).length === 2);
    ipH[0].checked = true; ipH[0].dispatchEvent(new w.Event('change', { bubbles: true }));
    check('[ux-c] Prüfliste mit 1 Haken: „Nicht angehakt: 5 von 6“, Knopf zur Forderungsaufstellung, keine Liste', /^Nicht angehakt: 5 von 6 Punkten\./.test(d.getElementById('ip-erg').textContent) && !!d.getElementById('ip-zum-schreiben') && box.querySelectorAll('#ip-erg li').length === 0);
    ipH.forEach((c) => { c.checked = true; c.dispatchEvent(new w.Event('change', { bubbles: true })); });
    check('[inkasso] alle Haken: kein Urteil über die Forderung', d.getElementById('ip-erg').textContent === I18N.de['ip.erg.alle'] && !d.getElementById('ip-zum-schreiben'));
    zur(); box.querySelector('.gs-i-gelb').click();
    check('[aufr-geld] Gelber Umschlag: öffnet direkt die Seite Mahnbescheid (keine zweite Fassung)', box.querySelector('.pf-frage').textContent === I18N.de['gs.d.mahn'] && !!box.querySelector('.gs-frist') && box.querySelectorAll('.gs-i-gelb').length === 0);
    zur();
    check('[aufr-geld] Gelber Umschlag: „Zurück“ führt zu „Post vom Inkasso“', !!box.querySelector('.gs-i-pruef') && !!box.querySelector('.gs-i-gelb'));
    kacheln()[1].click();
    check('[aufr-geld] Schreiben an Gläubiger: 3 Muster, keine P-Konto-Bescheinigung (steht unter „Was bleibt mir?“)', kacheln().map((b) => b.className.match(/ms-([a-z]+)/)[1]).join() === 'geduld,aufst,wider' && !box.querySelector('.ms-pkonto'));
    kacheln()[1].click();
    const ta = d.getElementById('ms-text');
    check('[schreiben] Forderungsaufstellung: deutscher Text mit Lücken, Hinweis „keine Rechtsberatung“', ta && ta.lang === 'de' && /§ 13a Abs\. 1 und 2/.test(ta.value) && /\[Anschrift aus dem Brief\]/.test(ta.value) && /keine Rechtsberatung/.test(box.querySelector('.ms-hinweis').textContent));
    check('[aufr-geld] „Die Anschrift fehlt noch“ nicht schon vor der Eingabe', !(() => { const o = d.getElementById('ms-ohne-adr'); return !o.hidden && !o.closest('.ms-ohne-box').hidden; })());
    w.print = () => {}; d.getElementById('ms-aus').click();
    check('[aufr-geld] „Die Anschrift fehlt noch“ erst beim Drucken/Teilen, wenn die Anschrift leer ist', (() => { const o = d.getElementById('ms-ohne-adr'); return !o.hidden && !o.closest('.ms-ohne-box').hidden; })() && d.getElementById('ms-ohne-adr').textContent === I18N.de['ms.ohneAdr']);
    { const aIn = d.getElementById('ms-adr'); aIn.value = 'Musterstraße 1'; aIn.dispatchEvent(new w.Event('input', { bubbles: true })); }
    check('[aufr-geld] Anschrift eingetragen: Hinweis verschwindet', !(() => { const o = d.getElementById('ms-ohne-adr'); return !o.hidden && !o.closest('.ms-ohne-box').hidden; })());
    d.documentElement.classList.remove('druckt-brief');
    const gIn = d.getElementById('ms-g'); gIn.value = 'Muster <b>Inkasso</b> GmbH'; gIn.dispatchEvent(new w.Event('input', { bubbles: true }));
    check('[schreiben] Eingabe nur als Text eingesetzt', /Muster <b>Inkasso<\/b> GmbH/.test(ta.value) && !box.querySelector('b b'));
    zur();
    check('[schreiben] „← Zurück“ führt zur Wahl des Musters', !!box.querySelector('.ms-geduld'));
    zur(); zur();
    // 5 Mein Geld planen: Haushaltsplan, darunter Sparen im Alltag („Abschlag prüfen“ steht seit 1.9 auf den Seiten „Strom“ und „Heizen“)
    kacheln()[4].click();
    check('[geld] Mein Geld planen: Haushaltsplan, dann Überschrift „Geld sparen im Alltag“ (kein Abschlag hier)', !!box.querySelector('.gs-p-hh') && !box.querySelector('.gs-p-abschlag') && box.querySelector('.gs-sparen-h').textContent === I18N.de['sp.h']);
    const th = [...box.querySelectorAll('[class*="gs-t-"]')].map((b) => b.className.match(/gs-t-([a-z]+)/)[1]);
    check('[geld] Sparen im Alltag: Strom, Heizen, Essen, Verträge (Kacheln)', th.join() === 'strom,heizen,essen,vertraege', th.join());
    box.querySelector('.gs-t-vertraege').click();
    check('[geld] Verträge ohne Schulden-Text (Sperre steht nur unter „Es ist dringend“)', !/41g/.test(box.textContent) && box.querySelectorAll('.sp-tipps li').length === 4);
    { const tp = [...box.querySelectorAll('details.tipp')]; check('[geld-tipp] Jeder Tipp: Symbol + kurzer Satz (höchstens 12 Wörter), ausführlicher Text zugeklappt', tp.length === 4 && tp.every((x) => x.querySelector('summary .tipp-sym svg') && x.querySelector('.tipp-kurz').textContent.split(/\s+/).length <= 12 && !x.open && x.querySelector('p').textContent.length > x.querySelector('.tipp-kurz').textContent.length), tp.map((x) => x.querySelector('.tipp-kurz').textContent)); }
    zur(); box.querySelector('.gs-t-essen').click();
    { const vz = d.getElementById('sp-vz'); check('[geld] Essen: keine eigenen Rezepte, Linkkarte zur Verbraucherzentrale (öffnet extern)', !!vz && vz.href === 'https://www.verbraucherzentrale.de/lebensmittel/so-geht-gesunde-ernaehrung-mit-wenig-geld-96404' && vz.target === '_blank' && /Verbraucherzentrale/.test(vz.textContent) && !box.querySelector('.rezept') && !/Rezept/.test(box.textContent)); }
    zur(); zur();
    // 6 Schuldnerberatung
    kacheln()[5].click();
    check('[aufr-geld] Unterkarten: finden, Bis zum Termin, Mappe, Ablauf (keine eigene Kachel „unseriöse Anbieter“)', kacheln().map((b) => b.className.match(/gs-h-([a-z]+)/)[1]).join() === 'finden,termin,mappe,ablauf');
    kacheln()[0].click();
    check('[beratung-kachel] Beratungsstelle finden: ein Text (sl.hilfe.*) und Warnung vor unseriösen Anbietern', box.querySelector('.gs-beratung p').textContent === I18N.de['sl.hilfe.4'] && ['sl.hilfe.1', 'sl.hilfe.2', 'sl.hilfe.3', 'sl.hilfe.4', 'sl.hilfe.5'].every((k) => box.textContent.includes(I18N.de[k])) && !!box.querySelector('details[data-fall="unserioes"]'));
    { const su = d.getElementById('sb-suche'), offen = [...box.querySelectorAll('.gs-beratung > p')].map((x) => x.textContent);
      check('[ux-c] Beratungsstelle finden: Link zur Stellensuche (extern), nur 2 kurze Absätze offen, Suche und Jobcenter/Sozialamt zugeklappt', !!su && su.href === 'https://www.meine-schulden.de/hilfe-finden/stellensuche' && su.target === '_blank' && su.textContent.includes(I18N.de['sb.finden.link']) && su.closest('.gs-beratung') && offen.join('|') === I18N.de['sl.hilfe.4'] + '|' + I18N.de['sl.hilfe.5'] && box.querySelectorAll('details.gs-finden-mehr').length === 2 && [...box.querySelectorAll('details.gs-finden-mehr')].every((x) => !x.open) && box.querySelector('details.gs-finden-mehr').textContent.includes(I18N.de['sl.hilfe.1'])); }
    check('[schulden] Quellenzeile nennt Verbraucherzentralen, BAG-SB, Caritas/Diakonie und AG SBV', /Verbraucherzentralen.*BAG-SB.*Caritas.*Diakonie.*AG SBV/.test(box.textContent));
    zur(); kacheln()[1].click();
    check('[beratung-kachel] Bis zum Termin: 6 Haken, Sprünge zu Geduld-Brief, P-Konto, Liste, Haushaltsplan', box.querySelectorAll('.sb-haken input').length === 6 && box.querySelectorAll('.sb-zeile button').length === 4);
    check('[ux-c] Bis zum Termin: Knopftexte nennen das Ziel (kein „Öffnen“)', [...box.querySelectorAll('.sb-zeile button')].map((b) => b.textContent).join('|') === [I18N.de['ms.geduld'], I18N.de['sp.schulden.pf'], I18N.de['sl.h'], I18N.de['hb.kachel']].join('|'));
    d.getElementById('sb-w-3').click();
    check('[beratung-kachel] Haken wird je Vorgang gespeichert (lotse.beratung-haken)', /"3":true/.test(store['lotse.beratung-haken'] || ''), store['lotse.beratung-haken']);
    zur(); kacheln()[2].click();
    check('[beratung-kachel] Beratungsmappe: 8 Unterlagen zum Abhaken, Ordner-Anleitung, Knopf „Mappe drucken“', box.querySelectorAll('.sb-haken input').length === 8 && !!box.querySelector('[data-tipp="sb.ordner"]') && !!d.getElementById('sb-druck'));
    zur(); zur();
    check('[geld] Zurück aus Schuldnerberatung → Kacheln', kacheln().length === 6);
    // Alle Ebenen in allen Sprachen ohne Rohschlüssel
    const roh = [];
    const ebenen = [[], [0], [0, 0], [0, 5], [3], [3, 0], [3, 1], [3, 1, 2], [3, 3], [4], [5], [5, 1], [5, 2], [5, 3]];
    Object.keys(I18N).forEach((l) => {
      setLang(l);
      ebenen.forEach((weg) => {
        let n = 0; while ((!box.querySelector('.gs-inkasso')) && n++ < 6) zur();
        weg.forEach((i) => kacheln()[i].click());
        if (/\b(gs|sp|pf|home|kc|ip|ms|sb|pl)\.[a-z]|undefined/.test(box.textContent)) roh.push(l + ':' + weg.join('-'));
      });
    });
    check('[geld] In allen 13 Sprachen ohne Rohschlüssel', roh.length === 0, roh.join());
    setLang('de');
    { let n = 0; while (!box.querySelector('.gs-inkasso') && n++ < 6) zur(); }
    // Konto gepfändet → Pfändungsrechner (Konto) → nach dem Ergebnis „Schuldnerberatung“ → Zurück eine Ebene hoch
    kacheln()[0].click(); kacheln()[1].click();
    check('[geld] Konto gepfändet: Knopf „Bescheinigung für das P-Konto“', !!box.querySelector('.gs-besch'));
    box.querySelector('.sp-rechner').click();
    check('[geld] Konto gepfändet führt zum Pfändungsrechner (Konto)', d.getElementById('app').getAttribute('data-ansicht') === 'pfaendung');
    const pfB = () => [...d.querySelectorAll('#pfInhalt button')];
    check('[geld] Pfändungsrechner: vor dem Rechnen kein Knopf „Schuldnerberatung“', !d.querySelector('#pfInhalt .pf-zur-hilfe'));
    pfB().find((b) => b.textContent === '0').click();
    pfB().find((b) => b.textContent === '0').click();
    const jetztK = [...d.querySelectorAll('#pfInhalt .pf-jetzt li p')].map((x) => x.textContent);
    check('[schulden-korr] Konto: Umwandeln innerhalb eines Monats schützt auch gesperrtes Guthaben (§ 899 Abs. 1 ZPO)', jetztK[0] === I18N.de['pf.tipp.umwandeln'] && /innerhalb eines Monats.*schon gesperrte Guthaben geschützt \(§ 899 Abs\. 1 ZPO\)/.test(jetztK[0]), jetztK[0]);
    const erg = d.querySelector('#pfInhalt .pf-zahl'), tk = d.querySelector('#pfInhalt .pf-zur-hilfe');
    check('[geld] Nach dem Rechnen: Knopf „Schuldnerberatung“ unter dem Ergebnis', !!erg && !!tk && tk.textContent === I18N.de['sb.finden'] && !d.querySelector('#pfInhalt .pf-tab') && (erg.compareDocumentPosition(tk) & w.Node.DOCUMENT_POSITION_FOLLOWING));
    tk.click();
    check('[geld] Knopf öffnet „Beratungsstelle finden“ (ein Name je Ziel, UX-Audit C)', d.getElementById('app').getAttribute('data-ansicht') === 'sparen' && !!d.getElementById('sb-suche'));
    zur(); check('[ux-c] Zurück aus „Beratungsstelle finden“: Kacheln der Schuldnerberatung', !!box.querySelector('.gs-h-termin'));
    zur();
    check('[geld] Zurück aus „Schuldnerberatung“: 6 Kacheln (kein Kreis zum Rechner)', sicht() === 'sparen' && kacheln().length === 6);
    zur();
    check('[geld] Zurück von den 6 Kacheln: Startseite', sicht() === 'start');
    // Pfändung: dritte Karte „Bescheinigung für das P-Konto“ (Musterschreiben § 903 ZPO)
    d.getElementById('goGeld').click(); kacheln()[1].click();
    { let n = 0; while (!d.querySelector('#pfInhalt .pf-w-lohn') && n++ < 5) d.querySelector('#v-pfaendung [data-nav-zurueck]').click(); } // Rechner merkt sich den letzten Schritt
    const pfW = d.querySelector('#pfInhalt .pf-w-besch');
    check('[pfaendung] Dritte Karte „Bescheinigung für das P-Konto“', !!pfW && pfW.querySelector('b').textContent === I18N.de['ms.pkonto']);
    pfW.click();
    check('[pfaendung] Bescheinigung: Schreiben nach § 903 ZPO, Laienansicht ohne Paragraf im Hinweis', /§ 903 ZPO/.test(d.getElementById('ms-text').value) && !/§/.test(d.querySelector('#pfInhalt p.hint').textContent));
    d.querySelector('#v-pfaendung [data-nav-zurueck]').click();
    check('[pfaendung] Zurück: wieder die Wahl', !!d.querySelector('#pfInhalt .pf-w-lohn'));
    d.querySelector('#appnav button[data-ansicht="start"]').click();
  }
  // Leistungs-Check: Weg wählen (src/schritte.js, ausführlich in test/test-schritte.js)
  {
    const sfBox = d.getElementById('schritte');
    check('[schritte] Abschnitt „Schritt für Schritt“ vorhanden, Modul geladen', !!sfBox && !!w.Schritte && w.Schritte.FRAGEN.length > 40);
    check('[schritte] Jede Formular-Angabe hat eine Frage oder gehört zu einer Mehrfachfrage', ['adults', 'kids', 'kidsU6', 'kids14', 'young', 'gebJahr', 'baby', 'egVor', 'egKinder', 'egNach', 'aufenthalt', 'euArbeit', 'euJahre', 'pflegegrad', 'bhPerson', 'gdb', 'blind', 'bhWeitere', 'emStd', 'em5', 'ernaehrung', 'schwanger', 'arbeitSit', 'algZeit', 'algMonate', 'krankWochen', 'lohnVorher', 'ausbildung', 'wohnart', 'miete', 'heizkosten', 'warmwasser', 'hhAndere', 'plz', 'bundesland', 'mietstufe', 'ek1Art', 'ek1Brutto', 'ek1Netto', 'ek1bArt', 'ek1bBetrag', 'ek2Art', 'ek2Brutto', 'ek2Netto', 'ek2bArt', 'ek2bBetrag', 'zusatzRente', 'grundrente33', 'wfbmEssen', 'unterhalt', 'waisen', 'kindEink', 'uzBetrag', 'uzAn', 'uzTitel', 'vermoegen', 'autoWert', 'autoBraucht', 'uvgWechsel', 'uvgPartner']
      .every((k) => w.Schritte.FRAGEN.some((f) => f.id === k)) && ['kinder12', 'kindKrank', 'unterhaltFehlt', 'mzG', 'mzGl', 'bhSelbst', 'wfbm', 'teilhabe', 'babBetrieb', 'babWohnt'].every((k) => w.Schritte.FRAGEN.some((f) => (f.felder || []).some((x) => x[0] === k))));
  }
  check('Keine Skriptfehler im gesamten Test', errors.length === 0, errors.join('; '));
  console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlle DOM-Tests bestanden');
  process.exit(fails ? 1 : 0);
  }
}, 50);
