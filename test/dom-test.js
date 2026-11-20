const { JSDOM } = require('jsdom');
const fs = require('fs');
const I18N = require('../dist/i18n.js');
const KARTEN = require('./karten.js');
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
// Beispiel laden; sind schon eigene Angaben da, fragt die App nach – hier bestätigen
const beispiel = (id) => { d.getElementById(id).click(); if (!d.getElementById('beispielDlg').hidden) d.getElementById('beispielJa').click(); };
const setLang = (c) => { const s = d.getElementById('lang'); s.value = c; fire(s, 'change'); };
const setSel = (id, v) => { const s = d.getElementById(id); s.value = v; fire(s, 'change'); };
const setChk = (id, v) => { const c = d.getElementById(id); c.checked = v; fire(c, 'change'); };
const setNum = (id, v) => { const c = d.getElementById(id); c.value = String(v); fire(c, 'input'); fire(c, 'change'); }; // Tippen, dann Feld verlassen

check('Keine Skriptfehler beim Laden', errors.length === 0, errors.join('; '));
check('Startsprache folgt dem Browser (Deutsch)', d.getElementById('lang').value === 'de' && d.getElementById('app').getAttribute('lang') === 'de');
check('Sprachwahl bietet 13 Sprachen', d.getElementById('lang').options.length === 13);
check('Start ohne Beispielwerte: leeres Formular', d.getElementById('ek1Brutto').value === '' && d.getElementById('miete').value === '');
check('Start zeigt Anleitung statt Karten', d.querySelector('#cards .startcard') !== null && cards().length === 0, d.getElementById('cards').innerHTML.slice(0, 200));
check('Start: Beispiel-Hinweis versteckt', d.getElementById('sampleNotice').hidden === true);
beispiel('p1');
check(KARTEN.length + ' Ergebnis-Karten', cards().length === KARTEN.length, cards().length);
check('Beispiel 1: Wohngeld, Kinderzuschlag, Kindergeld wahrscheinlich', ['Wohngeld', 'Kinderzuschlag', 'Kindergeld'].every((n) => level(n) === 'ja'), names() + ' | ' + pills());
check('Zusammenfassung zeigt Anzahl', /\d+ wahrscheinlich/.test(d.getElementById('count').textContent), d.getElementById('count').textContent);
check('Unwahrscheinliche Leistungen sind eingeklappt gruppiert', d.querySelector('.neinbox') !== null && d.querySelector('.neinbox').open === false);
check('Hinweis auf Beispielwerte sichtbar', d.getElementById('sampleNotice').hidden === false);
check('Übersetzungs-Hinweis bei Deutsch versteckt', d.getElementById('transNotice').hidden === true);
check('Nächste Schritte vorhanden bei Treffer', card('Wohngeld').querySelector('details') !== null);
check('Zusammenspiel-Hinweis Wohngeld und Kinderzuschlag steht in beiden Karten', /kombinieren/.test(d.getElementById('c-wohngeld').textContent) && /kombinieren/.test(d.getElementById('c-kiz').textContent));
check('Neue Karten vorhanden', ['Grundsicherungsgeld', 'Unterhaltsvorschuss', 'BAföG', 'Pflegegeld und Entlastungsbetrag', 'Kindergeld'].every((n) => names().includes(n)));
check('Unterhaltsvorschuss im Beispiel 1 wahrscheinlich', level('Unterhaltsvorschuss') === 'ja');

// Beispiel 2
beispiel('p2');
check('Beispiel 2: Grundsicherung im Alter wahrscheinlich', level('Grundsicherung im Alter und bei voller Erwerbsminderung') === 'ja', pills() + '');
check('Beispiel 2 füllt Formular und Auswahlfelder', d.getElementById('ek1Art').value === 'rente' && d.getElementById('ek1Brutto').value === '880' && d.getElementById('gebJahr').value === '1955' && d.getElementById('mietstufe').value === '3');
check('Beispiel 2: Kasten „Entweder oder“ mit Links zu beiden Karten', !!d.getElementById('entwederOder') && !!d.querySelector('#entwederOder a[href="#c-gsa"]') && !!d.querySelector('#entwederOder a[href="#c-wohngeld"]') && !d.getElementById('zweiWege'));
check('Beispiel 2: Entweder-oder-Hinweis in den Karten Grundsicherung im Alter und Wohngeld', /nicht gleichzeitig/.test(d.getElementById('c-gsa').textContent) && /nicht gleichzeitig/.test(d.getElementById('c-wohngeld').textContent));
check('Ohne Kinder sind Kinder-Fragen ausgeblendet', [...d.querySelectorAll('.cond-kids')].every((e) => e.hidden === true));

// Eingabe ändern
beispiel('p1');
check('Mit Kindern sind Kinder-Fragen sichtbar', [...d.querySelectorAll('.cond-kids')].every((e) => e.hidden === false));
setNum('ek1Brutto', 9000); setNum('ek1Netto', 6500);
check('Hinweis verschwindet nach eigener Eingabe', d.getElementById('sampleNotice').hidden === true);
check('Hohes Einkommen: Wohngeld und Kinderzuschlag unwahrscheinlich', level('Wohngeld') === 'nein' && level('Kinderzuschlag') === 'nein');
// Beispiel laden bei eigenen Angaben: erst Rückfrage im eigenen Dialog, „Abbrechen“ und Esc lassen alles stehen
d.getElementById('p2').click();
const dlg = d.getElementById('beispielDlg');
check('Beispiel über eigene Angaben: Rückfrage-Dialog offen, Fokus auf „Abbrechen“', !dlg.hidden && dlg.querySelector('[role="alertdialog"][aria-modal="true"]') && d.activeElement === d.getElementById('beispielNein'));
check('Rückfrage: Hintergrund gesperrt (inert)', d.getElementById('cols').hasAttribute('inert'));
d.getElementById('beispielNein').click();
check('Rückfrage „Abbrechen“: eigene Angaben bleiben, Hintergrund wieder frei', dlg.hidden && d.getElementById('ek1Brutto').value === '9000' && !d.getElementById('cols').hasAttribute('inert'));
d.getElementById('p2').click(); dlg.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
check('Rückfrage Esc: schließt ohne Laden', dlg.hidden && d.getElementById('ek1Brutto').value === '9000');
d.getElementById('p2').click(); d.getElementById('beispielJa').click();
check('Rückfrage „Beispiel laden“: Beispiel geladen', dlg.hidden && d.getElementById('ek1Art').value === 'rente');
d.getElementById('p1').click();
check('Unverändertes Beispiel: kein Dialog beim Wechsel', dlg.hidden && d.getElementById('ek1Art').value !== 'rente');
// Eingeklappte Karte: zweite Zeile mit Betrag und Art der Stelle statt „Anspruch ist wahrscheinlich“
const z2 = (id) => d.querySelector('#c-' + id + ' .head2').textContent;
check('Kartenzeile Wohngeld: ungefährer Betrag und Wohngeldstelle', /ca\. .*€.* im Monat/.test(z2('wohngeld')) && /Wohngeldstelle/.test(z2('wohngeld')) && !/wahrscheinlich/.test(z2('wohngeld')), z2('wohngeld'));
// Alle Angaben löschen: sagt, was gelöscht wird; Rückgängig-Leiste stellt alles wieder her
d.getElementById('p-name').value = 'Test'; fire(d.getElementById('p-name'), 'input');
check('Löschen-Knopf getrennt von den Beispielen, Text nennt Formular und Briefdaten', !d.getElementById('presets').contains(d.getElementById('clearBtn')) && /Formular/.test(d.getElementById('clearWas').textContent) && /Anschrift/.test(d.getElementById('clearWas').textContent));
d.getElementById('clearBtn').click();
check('Löschen: Formular leer, Rückgängig-Leiste sichtbar', d.getElementById('ek1Art').value === '' && d.getElementById('p-name').value === '' && !d.getElementById('undoBar').hidden);
d.getElementById('undoBtn').click();
check('Rückgängig: Angaben und Name zurück, Leiste weg', d.getElementById('ek1Brutto').value !== '' && d.getElementById('p-name').value === 'Test' && d.getElementById('undoBar').hidden);
d.getElementById('clearBtn').click(); setNum('miete', 500);
check('Neue Eingabe nach dem Löschen: Rückgängig-Leiste verschwindet', d.getElementById('undoBar').hidden);
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
  check(l + ': Preset-Knopf übersetzt', d.getElementById('p1').textContent === dict['preset.p1']);
});
check('Sprachwahl wird gemerkt', store['lotse-lang'] === 'so');
setLang('de');

// ---------- Ausfüllhilfe ----------
beispiel('p1');
const pickBoxes = () => [...d.querySelectorAll('[data-pick]')];
const okCount = cards().filter((c) => /pill (ja|vielleicht)/.test(c.querySelector('.pill').className)).length;
check('Auswahl für die Ausfüllhilfe nennt alle passenden Leistungen', pickBoxes().length === okCount && okCount >= 4, pickBoxes().length + ' vs ' + okCount);
check('Haken sind nur bei wahrscheinlichen Leistungen vorgesetzt', pickBoxes().every((cb) => cb.checked === (level(cb.closest('label').textContent.trim()) === 'ja')) && pickBoxes().some((cb) => cb.checked));
check('Mappe ist anfangs geschlossen', d.getElementById('mappe').hidden === true);
// nichts gewählt
pickBoxes().forEach((cb) => { cb.checked = false; fire(cb, 'change'); });
d.getElementById('mappeMake').click();
check('Ohne Auswahl erscheint ein Hinweis, keine Mappe', d.getElementById('mappe').hidden === true && d.getElementById('pickMsg').textContent === I18N.de['f.pick0']);
// Wohngeld und Unterhaltsvorschuss wählen
pickBoxes().filter((cb) => ['wohngeld', 'uvg'].includes(cb.getAttribute('data-pick'))).forEach((cb) => { cb.checked = true; fire(cb, 'change'); });
const set = (id, v) => { d.getElementById(id).value = v; fire(d.getElementById(id), 'input'); };
set('p-name', 'Maria Beispiel'); set('p-geb', '01.02.1985'); set('p-strasse', 'Hauptstraße 1'); set('p-ort', '91056 Erlangen'); set('p-tel', '0123 456');
d.getElementById('mappeMake').click();
check('Mappe öffnet sich und ersetzt die Seite', d.getElementById('mappe').hidden === false && d.getElementById('app').classList.contains('pm'));
const pages = [...d.querySelectorAll('#mappeBody .page')];
check('Entweder Formular oder formlos: Wohngeld hat in Bayern einen Formular-Link, also nur ein Brief (Unterhaltsvorschuss), Angabenblatt, Unterlagenliste, Formulare', pages.length === 4, pages.length);
const formSeite = d.querySelector('#mappeBody .forms');
check('Amtliche Formulare: Wohngeld als Link auf die amtliche Seite, kein Knopf zum Ausfüllen', !!formSeite && /Antrag auf Wohngeld \(Mietzuschuss\)/.test(formSeite.textContent) && !!formSeite.querySelector('a[href*="stmb.bayern.de"]') && formSeite.textContent.indexOf(I18N.de['f.formsWeb']) >= 0 && !d.getElementById('formsShare'), formSeite && formSeite.textContent.slice(0, 200));
check('Formular-Link und formloser Brief schließen sich aus: beim Link (Wohngeld Bayern) kein Satz „formloser Antrag in dieser Mappe“', !!formSeite && formSeite.textContent.indexOf(I18N.de['f.formsBrief']) < 0);
check('Amtliche Formulare: ohne Jobcenter keine Jobcenter-Unterlagenliste', !!formSeite && formSeite.textContent.indexOf(I18N.de['f.formsUnt']) < 0);
const txt = pages.map((p) => p.textContent).join('\n');
// Anschrift „91056 Erlangen“ liefert den Wohnort (kein PLZ-Feld ausgefüllt): Empfänger ist die Stadt Erlangen
check('Brief: Absender, Empfänger (aus der PLZ der Anschrift) und Betreff', /Maria Beispiel/.test(txt) && /Hauptstraße 1/.test(txt) && /Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(txt) && /Betreff: Antrag auf Unterhaltsvorschuss/.test(txt));
check('Kein formloser Brief für Wohngeld, weil es den Formular-Link gibt', !/Betreff: Antrag auf Wohngeld/.test(txt));
check('Brief: bittet um Eingangsbestätigung und Formulare', /bestätigen Sie mir den Eingang/.test(txt) && /Antragsformulare/.test(txt));
check('Brief auf Deutsch und links nach rechts gesetzt', pages[0].getAttribute('lang') === 'de' && pages[0].getAttribute('dir') === 'ltr');
check('Angabenblatt enthält Haushalt, Miete, Einkommen', /Angabenblatt/.test(txt) && /Warmmiete im Monat: 950 €/.test(txt) && /Einkommen: Lohn oder Gehalt, brutto 2\.200 €, netto 1\.750 € im Monat/.test(txt) && /Kinder unter 18 Jahren: 2/.test(txt) && /Geburtsdatum: 01\.02\.1985/.test(txt));
check('Angabenblatt nennt Selbstauskunft-Hinweis', /Selbstauskunft/.test(txt));
check('Leere Felder werden zu Strichen statt "undefined"', !/undefined|null/.test(txt));
check('Kopiertext enthält Briefe und Angabenblatt', /Betreff: Antrag auf Unterhaltsvorschuss/.test(d.getElementById('mappeText').value) && /Angabenblatt/.test(d.getElementById('mappeText').value));
// ---------- Empfänger bearbeitbar und Suchlink ----------
{
  const feld = d.querySelector('#mappeBody textarea[data-empf="uvg"]');
  check('[empf] Vor einer Änderung kein Knopf „Wiederherstellen“ sichtbar', d.querySelector('#mappeBody [data-empf-resetbox="uvg"]').hidden === true);
  const brief = () => d.getElementById('brief-uvg').textContent;
  const kopie = () => d.getElementById('mappeText').value;
  check('[empf] Empfängerfeld je Brief, vorbefüllt mit dem Vorschlag der App (Stadt Erlangen, Jugendamt, Anschrift)', !!feld && /^Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle\n.+\n910\d\d Erlangen$/.test(feld.value), feld && feld.value);
  check('[empf] Feld liegt außerhalb der Briefseite und wird nicht gedruckt', !!feld && !feld.closest('.page') && feld.closest('.empf-edit').classList.contains('no-print'));
  check('[empf] Nur ein Feld, weil nur ein Brief (Wohngeld hat Formular-Link)', d.querySelectorAll('#mappeBody textarea[data-empf]').length === 1);
  feld.value = 'Landratsamt Musterkreis\nJugendamt\nMusterweg 5\n12345 Musterstadt'; fire(feld, 'input');
  check('[empf] Änderung erscheint sofort im Brief', /\n\nLandratsamt Musterkreis\nJugendamt\nMusterweg 5\n12345 Musterstadt\n\nDatum:/.test(brief()) && !/Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(brief()), brief().slice(0, 300));
  check('[empf] Änderung erscheint im Kopiertext (auch Grundlage für PDF)', /Landratsamt Musterkreis\nJugendamt\nMusterweg 5\n12345 Musterstadt/.test(kopie()) && /Angabenblatt/.test(kopie()));
  check('[empf] Fokus und Feld bleiben beim Tippen erhalten (Mappe wird nicht neu aufgebaut)', d.querySelector('#mappeBody textarea[data-empf="uvg"]') === feld);
  check('[empf] Absender, Betreff und Text bleiben unverändert', /Maria Beispiel/.test(brief()) && /Betreff: Antrag auf Unterhaltsvorschuss/.test(brief()) && /bestätigen Sie mir den Eingang/.test(brief()));
  feld.value = '  \n \n'; fire(feld, 'input');
  check('[empf] Leeres Feld: Linie zum Ausfüllen statt leerem Empfänger', /\n\n____________________\n\nDatum:/.test(brief()), brief().slice(0, 200));
  feld.value = '<img src=x onerror="window.__xss=1">\nTest'; fire(feld, 'input');
  check('[empf] Eingabe wird nie als HTML ausgeführt', !w.__xss && !d.querySelector('#brief-uvg img') && /<img src=x/.test(brief()));
  const reset = d.querySelector('#mappeBody [data-empf-reset="uvg"]');
  check('[empf] Knopf „Vorschlag wiederherstellen“ erscheint nach einer Änderung', !!reset && reset.textContent === I18N.de['f.empfZurueck'] && !reset.closest('[data-empf-resetbox]').hidden);
  if (reset) reset.click();
  const feld2 = d.querySelector('#mappeBody textarea[data-empf="uvg"]');
  check('[empf] Wiederherstellen: Vorschlag wieder im Feld, im Brief und im Kopiertext, Knopf weg', !!feld2 && /^Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(feld2.value) && /Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(brief()) && /Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(kopie()) && d.querySelector('#mappeBody [data-empf-resetbox="uvg"]').hidden === true);
  const link = d.querySelector('#mappeBody .empf-edit a');
  const q = link ? decodeURIComponent(link.getAttribute('href').split('?q=')[1] || '') : '';
  check('[empf] Suchlink: DuckDuckGo, kurzer Suchbegriff und Ortsname ohne Postleitzahl, öffnet extern', !!link && /^https:\/\/duckduckgo\.com\/\?q=/.test(link.getAttribute('href')) && q === 'Unterhaltsvorschussstelle Jugendamt Erlangen' && link.getAttribute('target') === '_blank' && /noopener/.test(link.getAttribute('rel')) && link.textContent === I18N.de['f.empfSuche'], q);
  check('[empf] Titel und Hinweis in der gewählten Sprache', d.querySelector('#mappeBody .empf-edit label').textContent === I18N.de['f.empfTitel'] && d.querySelector('#mappeBody .empf-edit p.small').textContent === I18N.de['f.empfHinweis']);
  check('[empf] Neue Texte in allen 13 Sprachen vorhanden', ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'].every((l) => ['f.empfTitel', 'f.empfHinweis', 'f.empfSuche', 'f.empfZurueck'].every((k) => I18N[l] && typeof I18N[l][k] === 'string' && I18N[l][k].length > 5)));
  check('[empf] Keine Skriptfehler', errors.length === 0, errors.join('; '));
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
setTimeout(() => {
  check('Kopieren meldet Ergebnis oder zeigt Ersatzfeld', d.getElementById('copyMsg').textContent.length > 0 || d.getElementById('mappeText').hidden === false);
  // Sprache in der Mappe
  setLang('en');
  const docs = d.querySelector('#mappeBody .docs');
  check('Mappe wird bei Sprachwechsel neu aufgebaut: Unterlagenliste englisch', /Documents for this benefit/.test(docs.textContent) && /Rental contract or confirmation of rent/.test(docs.textContent), docs.textContent.slice(0, 80));
  check('Brief bleibt bei Sprachwechsel Deutsch', /Betreff: Antrag auf Unterhaltsvorschuss/.test(d.querySelector('#mappeBody .page').textContent));
  setLang('ar');
  check('Arabisch: Mappe-Leiste rechts nach links, Brief bleibt links nach rechts', d.getElementById('app').getAttribute('dir') === 'rtl' && d.querySelector('#mappeBody .page').getAttribute('dir') === 'ltr');
  setLang('de');
  d.getElementById('mappeClose').click();
  check('Mappe lässt sich schließen', d.getElementById('mappe').hidden === true && !d.getElementById('app').classList.contains('pm'));

  // Struktur
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  check('Titel ist ein Name', title === 'SoLo – Sozialleistungslotse');
  check('Dunkelmodus doppelt definiert', (html.match(/color-scheme: dark/g) || []).length >= 2);
  check('Kein horizontales Scrollen erzwungen', !/min-width:\s*\d{4,}px/.test(html));
  check('Logische statt physische Abstände im Formular (RTL-fähig)', !/\.money input\s*\{[^}]*padding-right/.test(html) && /inset-inline-end/.test(html));
  check('Jedes Formularfeld hat eine Beschriftung', ['miete', 'mietstufe', 'ek1Art', 'ek1Brutto', 'ek1Netto', 'ek2Art', 'ek2Brutto', 'ek2Netto', 'unterhalt', 'vermoegen', 'gebJahr', 'kindEink', 'ausbildung', 'pflegegrad', 'p-name', 'p-geb', 'p-strasse', 'p-ort', 'p-tel'].every((id) => d.querySelector('label[for="' + id + '"]')));
  // Grenze 5 MB (bis 1.4: 2,5 MB; 19.11.2026: 3 MB für 13 Sprachen; 20.11.2026: 4 MB für Vorgänge speichern, Beratungsmodus, Pflege-Unterstützung, Schulden-Tipps, Haushaltsplan; 20.11.2026 nachmittags: 5 MB für Fristen, Schuldenliste, Energie, Mietgrenze, Kostensenkung, Paar-Einkommen – Entscheidung des Nutzers): eine einzige Datei, die offline läuft; der größte Teil sind PLZ-Daten (ganz Deutschland mit Mietenstufen), Behörden (Bayern), 13 Sprachen,
  // seit 1.4 auch „Brief prüfen“ und die Pflegegrad-Einschätzung (zusammen gut 200 KB)
  check('Web-Datei ist ein vollständiges Dokument mit UTF-8 und Viewport (Safari, Handy)', /^<!doctype html>/i.test(html) && /<meta charset="utf-8">/i.test(html.slice(0, 300)) && /name="viewport"/.test(html.slice(0, 400)));
  check('Dateigröße unter 5 MB', html.length < 5 * 1024 * 1024, (html.length / 1024).toFixed(0) + ' KB');
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
  check('Scan: Erklärung folgt der Sprache (Türkisch), Wert bleibt deutsch', /adınız/.test(rowOf('Name, Vorname').textContent) && rowOf('Name, Vorname').querySelector('bdi').textContent === 'Maria Muster');
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
  d.getElementById('goPfaendung').click();
  check('Start → Pfändung: Leiste markiert Start, oben „← Zurück“', sicht() === 'pfaendung' && navAkt() === 'start' && /← /.test(d.querySelector('[data-zurueck="pfaendung"]').textContent));
  d.querySelector('[data-zurueck="pfaendung"]').click();
  check('Pfändung „← Zurück“ führt zur Startseite', sicht() === 'start');
  d.getElementById('goSparen').click(); d.querySelector('[data-zurueck="sparen"]').click();
  check('Geld sparen „← Zurück“ führt zur Startseite', sicht() === 'start');
  d.getElementById('goPflege').click();
  if (sicht() === 'pflege') {
    check('Start → Pflege: Leiste markiert Start', navAkt() === 'start');
    d.querySelector('#pflegeAssist .pa-zur').click();
    check('Start → Pflege → „Zurück“ führt zur Startseite', sicht() === 'start');
  }
  // Geld sparen → Schulden und Pfändung: Knopf zum Rechner oben, 4 erste Schritte, 8 Fälle zum Aufklappen; Verweis im Rechner erst unter dem Ergebnis
  {
    setLang('de');
    d.getElementById('goSparen').click();
    const spB = () => [...d.querySelectorAll('#spInhalt button')];
    const schuldenK = spB().find((b) => b.textContent.indexOf(I18N.de['sp.schulden']) === 0);
    check('[schulden] Kachel „Schulden und Pfändung“ in Geld sparen', !!schuldenK);
    schuldenK.click();
    const box = d.getElementById('spInhalt');
    const ersterKnopf = box.querySelector('button');
    check('[schulden] Ganz oben der Knopf „Ausrechnen, was dir bleibt“', !!ersterKnopf && ersterKnopf.textContent === I18N.de['sp.schulden.pf'] && !ersterKnopf.closest('details'));
    check('[schulden] Erste Schritte mit 4 Punkten', box.querySelectorAll('ol.sp-liste li').length === 4 && box.querySelector('ol.sp-liste li').textContent === I18N.de['sp.schulden.1']);
    const faelle = [...box.querySelectorAll('details.sp-fall')].map((x) => x.getAttribute('data-fall'));
    check('[schulden] Was tun, wenn …: 8 Fälle zum Aufklappen in fester Reihenfolge', faelle.join() === 'inkasso,mahn,konto,strom,miete,rate,unserioes,insolvenz', faelle.join());
    check('[schulden] Fälle zu Beginn zugeklappt, Mahnbescheid nennt die 2-Wochen-Frist mit Quelle', [...box.querySelectorAll('details.sp-fall')].every((x) => !x.open) && /2 Wochen.*§ 692 ZPO/.test(box.querySelector('[data-fall="mahn"] p').textContent));
    const fall = (f) => box.querySelector('[data-fall="' + f + '"] p').textContent;
    check('[schulden-korr] Strom/Gas: 2 Abschläge und 100 €, 4 Wochen Androhung, 8 Werktage, zinsfreie Raten (§§ 41f, 41g EnWG)', /2 Monatsabschlägen und mindestens 100 € .*§ 41f EnWG/.test(fall('strom')) && /4 Wochen vorher angedroht und 8 Werktage/.test(fall('strom')) && /zinsfreie Ratenzahlung .*§ 41g EnWG/.test(fall('strom')) && /Strom und Gas/.test(fall('strom')) && !/StromGVV/.test(fall('strom')));
    check('[schulden-korr] Vollstreckungsbescheid: darf schon gepfändet werden, Einspruch 2 Wochen', /darf schon gepfändet werden \(§ 700 ZPO\)\. Dagegen hilft nur noch ein Einspruch innerhalb von 2 Wochen/.test(fall('mahn')));
    check('[schulden-korr] Mietschulden: ordentliche Kündigung kann trotz Schonfrist bestehen bleiben', /ordentlich \(mit Frist\) gekündigt.*trotz Zahlung bestehen bleiben/.test(fall('miete')));
    check('[schulden] Quellenzeile nennt Verbraucherzentralen, BAG-SB, Caritas/Diakonie und AG SBV', /Verbraucherzentralen.*BAG-SB.*Caritas.*Diakonie.*AG SBV/.test(box.textContent));
    const roh = Object.keys(I18N).filter((l) => { setLang(l); return /sp\.schulden|pf\.tipps|undefined/.test(d.getElementById('spInhalt').textContent); });
    check('[schulden] In allen 13 Sprachen ohne Rohschlüssel', roh.length === 0, roh.join());
    setLang('de');
    d.querySelector('#spInhalt [data-fall="konto"] button').click();
    check('[schulden] P-Konto-Fall führt zum Pfändungsrechner', d.getElementById('app').getAttribute('data-ansicht') === 'pfaendung');
    const pfB = () => [...d.querySelectorAll('#pfInhalt button')];
    check('[schulden] Pfändungsrechner: vor dem Rechnen kein Knopf „Tipps bei Schulden“', !pfB().some((b) => b.textContent === I18N.de['pf.tipps']));
    pfB().find((b) => b.textContent.indexOf(I18N.de['pf.konto']) === 0).click();
    pfB().find((b) => b.textContent === '0').click();
    pfB().find((b) => b.textContent === '0').click();
    const jetztK = [...d.querySelectorAll('#pfInhalt .pf-jetzt li')].map((x) => x.textContent);
    check('[schulden-korr] Konto: Umwandeln innerhalb eines Monats schützt auch gesperrtes Guthaben (§ 899 Abs. 1 ZPO)', jetztK[0] === I18N.de['pf.tipp.umwandeln'] && /innerhalb eines Monats.*schon gesperrte Guthaben geschützt \(§ 899 Abs\. 1 ZPO\)/.test(jetztK[0]), jetztK[0]);
    const erg = d.querySelector('#pfInhalt .pf-zahl'), tk = pfB().find((b) => b.textContent === I18N.de['pf.tipps']);
    check('[schulden] Nach dem Rechnen: Knopf „Tipps bei Schulden“ unter dem Ergebnis', !!erg && !!tk && (erg.compareDocumentPosition(tk) & w.Node.DOCUMENT_POSITION_FOLLOWING));
    tk.click();
    check('[schulden] Knopf öffnet die Schulden-Tipps', d.getElementById('app').getAttribute('data-ansicht') === 'sparen' && d.querySelectorAll('#spInhalt details.sp-fall').length === 8);
  }
  check('Keine Skriptfehler im gesamten Test', errors.length === 0, errors.join('; '));
  console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlle DOM-Tests bestanden');
  process.exit(fails ? 1 : 0);
  }
}, 50);
