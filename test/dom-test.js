const { JSDOM } = require('jsdom');
const fs = require('fs');
const I18N = require('../dist/i18n.js');
const html = fs.readFileSync(__dirname + '/../dist/leistungs-lotse.html', 'utf8');
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
const setLang = (c) => { const s = d.getElementById('lang'); s.value = c; fire(s, 'change'); };
const setSel = (id, v) => { const s = d.getElementById(id); s.value = v; fire(s, 'change'); };
const setChk = (id, v) => { const c = d.getElementById(id); c.checked = v; fire(c, 'change'); };
const setNum = (id, v) => { const c = d.getElementById(id); c.value = String(v); fire(c, 'input'); fire(c, 'change'); }; // Tippen, dann Feld verlassen

check('Keine Skriptfehler beim Laden', errors.length === 0, errors.join('; '));
check('Startsprache folgt dem Browser (Deutsch)', d.getElementById('lang').value === 'de' && d.getElementById('app').getAttribute('lang') === 'de');
check('Sprachwahl bietet 8 Sprachen', d.getElementById('lang').options.length === 8);
check('Start ohne Beispielwerte: leeres Formular', d.getElementById('ek1Brutto').value === '' && d.getElementById('miete').value === '');
check('Start zeigt Anleitung statt Karten', d.querySelector('#cards .startcard') !== null && cards().length === 0, d.getElementById('cards').innerHTML.slice(0, 200));
check('Start: Beispiel-Hinweis versteckt', d.getElementById('sampleNotice').hidden === true);
d.getElementById('p1').click();
check('21 Ergebnis-Karten', cards().length === 21, cards().length);
check('Beispiel 1: Wohngeld, Kinderzuschlag, Kindergeld wahrscheinlich', ['Wohngeld', 'Kinderzuschlag', 'Kindergeld'].every((n) => level(n) === 'ja'), names() + ' | ' + pills());
check('Zusammenfassung zeigt Anzahl', /\d+ wahrscheinlich/.test(d.getElementById('count').textContent), d.getElementById('count').textContent);
check('Unwahrscheinliche Leistungen sind eingeklappt gruppiert', d.querySelector('.neinbox') !== null && d.querySelector('.neinbox').open === false);
check('Hinweis auf Beispielwerte sichtbar', d.getElementById('sampleNotice').hidden === false);
check('Übersetzungs-Hinweis bei Deutsch versteckt', d.getElementById('transNotice').hidden === true);
check('Nächste Schritte vorhanden bei Treffer', card('Wohngeld').querySelector('details') !== null);
check('Zusammenspiel-Hinweis Wohngeld und Kinderzuschlag', /kombinieren/.test(d.getElementById('together').textContent));
check('Neue Karten vorhanden', ['Grundsicherungsgeld', 'Unterhaltsvorschuss', 'BAföG', 'Pflegegeld und Entlastungsbetrag', 'Kindergeld'].every((n) => names().includes(n)));
check('Unterhaltsvorschuss im Beispiel 1 wahrscheinlich', level('Unterhaltsvorschuss') === 'ja');

// Beispiel 2
d.getElementById('p2').click();
check('Beispiel 2: Grundsicherung im Alter wahrscheinlich', level('Grundsicherung im Alter und bei voller Erwerbsminderung') === 'ja', pills() + '');
check('Beispiel 2 füllt Formular und Auswahlfelder', d.getElementById('ek1Art').value === 'rente' && d.getElementById('ek1Brutto').value === '880' && d.getElementById('alter').checked === true && d.getElementById('alterGruppe').value === '51+' && d.getElementById('mietstufe').value === '3');
check('Beispiel 2: Entweder-oder-Hinweis', /nicht gleichzeitig/.test(d.getElementById('together').textContent));
check('Ohne Kinder sind Kinder-Fragen ausgeblendet', [...d.querySelectorAll('.cond-kids')].every((e) => e.hidden === true));

// Eingabe ändern
d.getElementById('p1').click();
check('Mit Kindern sind Kinder-Fragen sichtbar', [...d.querySelectorAll('.cond-kids')].every((e) => e.hidden === false));
setNum('ek1Brutto', 9000); setNum('ek1Netto', 6500);
check('Hinweis verschwindet nach eigener Eingabe', d.getElementById('sampleNotice').hidden === true);
check('Hohes Einkommen: Wohngeld und Kinderzuschlag unwahrscheinlich', level('Wohngeld') === 'nein' && level('Kinderzuschlag') === 'nein');

// Stepper
d.getElementById('p1').click();
d.querySelector('[data-step="kids"][data-d="1"]').click();
check('Stepper erhöht Kinderzahl', d.getElementById('kids').textContent === '3');
for (let i = 0; i < 5; i++) d.querySelector('[data-step="kids"][data-d="-1"]').click();
check('Stepper geht nicht unter 0', d.getElementById('kids').textContent === '0');
check('Ohne Kinder: Kinderzuschlag und Unterhaltsvorschuss unwahrscheinlich', level('Kinderzuschlag') === 'nein' && level('Unterhaltsvorschuss') === 'nein');

// Neue Eingaben
d.getElementById('p1').click();
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
setSel('alterGruppe', '<31'); setNum('vermoegen', 16000);
check('Grundsicherungsgeld: Vermögen über Schonbetrag (5.000 € + 2 Kinder × 5.000 €)', level('Grundsicherungsgeld') === 'nein');
setNum('vermoegen', 9000);
check('Grundsicherungsgeld: 9.000 € liegen unter 15.000 € Schonbetrag der Familie', level('Grundsicherungsgeld') !== 'nein');
setNum('vermoegen', 16000);

// Bezug Grundsicherungsgeld
d.getElementById('p1').click();
setChk('b-grundsicherungsgeld', true);
check('Grundsicherungsgeld: Hinweis im Zusammenspiel', /Grundsicherungsgeld/.test(d.getElementById('together').textContent));
d.getElementById('p1').click();
d.getElementById('adults2').checked = true; fire(d.getElementById('adults2'), 'change');
check('Zwei Erwachsene werden übernommen', cards().length === 21);

// ---------- Einkommen je Person: nur passende Felder, verständliche Beschriftung ----------
d.getElementById('p1').click();
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
d.getElementById('p3').click();
check('Beispiel Paar: Partner-Block sichtbar, Partner ohne Einkommen', d.getElementById('ekbox2').hidden === false && d.getElementById('ek2Art').value === 'ohne');
d.getElementById('p1').click();

// Große Schrift
d.getElementById('bigBtn').click();
check('Große Schrift schaltet Klasse', d.getElementById('app').classList.contains('big') && d.getElementById('bigBtn').getAttribute('aria-pressed') === 'true');

// Leere Eingaben
['miete', 'ek1Brutto', 'ek1Netto', 'vermoegen'].forEach((k) => setNum(k, ''));
check('Leere Felder erzeugen keinen Fehler', errors.length === 0 && cards().length === 21, errors.join('; '));

// ---------- Sprachen ----------
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro'];
LANGS.forEach((l) => {
  d.getElementById('p1').click();
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
  ['p2', 'p3'].forEach((p) => { d.getElementById(p).click(); });
  check(l + ': Beispiele laden ohne Fehler', errors.length === 0, errors.join('; '));
  check(l + ': Preset-Knopf übersetzt', d.getElementById('p1').textContent === dict['preset.p1']);
});
check('Sprachwahl wird gemerkt', store['lotse-lang'] === 'ro');
setLang('de');

// ---------- Ausfüllhilfe ----------
d.getElementById('p1').click();
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
check('Mappe enthält zwei Briefe, ein Angabenblatt und die Unterlagenliste', pages.length === 4, pages.length);
const txt = pages.map((p) => p.textContent).join('\n');
// Anschrift „91056 Erlangen“ liefert den Wohnort (kein PLZ-Feld ausgefüllt): Empfänger ist die Stadt Erlangen
check('Brief: Absender, Empfänger (aus der PLZ der Anschrift) und Betreff', /Maria Beispiel/.test(txt) && /Hauptstraße 1/.test(txt) && /Stadt Erlangen\nWohngeldstelle\nRathausplatz 1\n91052 Erlangen/.test(txt) && /Stadt Erlangen\nJugendamt, Unterhaltsvorschussstelle/.test(txt) && /Betreff: Antrag auf Wohngeld/.test(txt) && /Betreff: Antrag auf Unterhaltsvorschuss/.test(txt));
check('Brief: bittet um Eingangsbestätigung und Formulare', /bestätigen Sie mir den Eingang/.test(txt) && /Antragsformulare/.test(txt));
check('Brief auf Deutsch und links nach rechts gesetzt', pages[0].getAttribute('lang') === 'de' && pages[0].getAttribute('dir') === 'ltr');
check('Angabenblatt enthält Haushalt, Miete, Einkommen', /Angabenblatt/.test(txt) && /Warmmiete im Monat: 950 €/.test(txt) && /Einkommen: Lohn oder Gehalt, brutto 2\.200 €, netto 1\.750 € im Monat/.test(txt) && /Kinder unter 18 Jahren: 2/.test(txt) && /Geburtsdatum: 01\.02\.1985/.test(txt));
check('Angabenblatt nennt Selbstauskunft-Hinweis', /Selbstauskunft/.test(txt));
check('Leere Felder werden zu Strichen statt "undefined"', !/undefined|null/.test(txt));
check('Kopiertext enthält Briefe und Angabenblatt', /Betreff: Antrag auf Wohngeld/.test(d.getElementById('mappeText').value) && /Angabenblatt/.test(d.getElementById('mappeText').value));
d.getElementById('mappeCopy').click();
setTimeout(() => {
  check('Kopieren meldet Ergebnis oder zeigt Ersatzfeld', d.getElementById('copyMsg').textContent.length > 0 || d.getElementById('mappeText').hidden === false);
  // Sprache in der Mappe
  setLang('en');
  const docs = d.querySelector('#mappeBody .docs');
  check('Mappe wird bei Sprachwechsel neu aufgebaut: Unterlagenliste englisch', /Documents for this benefit/.test(docs.textContent) && /Rental contract or confirmation of rent/.test(docs.textContent), docs.textContent.slice(0, 80));
  check('Brief bleibt bei Sprachwechsel Deutsch', /Betreff: Antrag auf Wohngeld/.test(d.querySelector('#mappeBody .page').textContent));
  setLang('ar');
  check('Arabisch: Mappe-Leiste rechts nach links, Brief bleibt links nach rechts', d.getElementById('app').getAttribute('dir') === 'rtl' && d.querySelector('#mappeBody .page').getAttribute('dir') === 'ltr');
  setLang('de');
  d.getElementById('mappeClose').click();
  check('Mappe lässt sich schließen', d.getElementById('mappe').hidden === true && !d.getElementById('app').classList.contains('pm'));

  // Struktur
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  check('Titel ist ein Name', title === 'Leistungs-Lotse');
  check('Dunkelmodus doppelt definiert', (html.match(/color-scheme: dark/g) || []).length >= 2);
  check('Kein horizontales Scrollen erzwungen', !/min-width:\s*\d{4,}px/.test(html));
  check('Logische statt physische Abstände im Formular (RTL-fähig)', !/\.money input\s*\{[^}]*padding-right/.test(html) && /inset-inline-end/.test(html));
  check('Jedes Formularfeld hat eine Beschriftung', ['miete', 'mietstufe', 'ek1Art', 'ek1Brutto', 'ek1Netto', 'ek2Art', 'ek2Brutto', 'ek2Netto', 'unterhalt', 'vermoegen', 'alterGruppe', 'ausbildung', 'pflegegrad', 'p-name', 'p-geb', 'p-strasse', 'p-ort', 'p-tel'].every((id) => d.querySelector('label[for="' + id + '"]')));
  check('Dateigröße unter 1 MB', html.length < 1024 * 1024, (html.length / 1024).toFixed(0) + ' KB');
  // ----- Antrag scannen -----
  setLang('de');
  d.getElementById('p1').click();
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
  check('Scan: IBAN wird nie vorausgefüllt, Hinweis "selbst eintragen"', !rowOf('IBAN').querySelector('bdi') && /selbst/.test(rowOf('IBAN').textContent));
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
  check('Alte Angaben übernommen: erste Person Lohn 2.000 € brutto, Netto 2.300 €', d3.getElementById('ek1Art').value === 'lohn' && d3.getElementById('ek1Brutto').value === '2000' && d3.getElementById('ek1Netto').value === '2300', d3.getElementById('ek1Art').value + ' ' + d3.getElementById('ek1Brutto').value);
  check('Alte Angaben übernommen: Partner Rente o. Ä. 1.000 € brutto', d3.getElementById('ek2Art').value === 'rente' && d3.getElementById('ek2Brutto').value === '1000');

  check('Keine Skriptfehler im gesamten Test', errors.length === 0, errors.join('; '));
  console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlle DOM-Tests bestanden');
  process.exit(fails ? 1 : 0);
  }
}, 50);
