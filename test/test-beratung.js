// Beratungsmodus, Ergebnisblatt zum Mitgeben, Unterlagen-Checkliste und Antragsmappe (Übersicht, Drucken am Ende, Geburtsdatum).
// Läuft mit der fertigen Web-Version (dist) in JSDOM. Aufruf: node test/test-beratung.js
const { JSDOM } = require('jsdom');
const fs = require('fs');
const I18N = require('../dist/i18n.js');
const Fmt = require('../src/fmt.js');
const html = fs.readFileSync(__dirname + '/../dist/sozialleistungslotse.html', 'utf8');
const errors = [];
const store = {};
let gedruckt = 0;
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
    w.HTMLElement.prototype.scrollIntoView = function () {};
    w.scrollTo = function () {};
    w.print = function () { gedruckt++; };
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x || ''); } else console.log('ok  ', n); };
const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
const setLang = (c) => { const s = $('lang'); s.value = c; fire(s, 'change'); };
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
const NEU = ['set.hh.h', 'set.fach.h', 'set.beratung.label', 'set.beratung.t', 'recht.label', 'haken.hint', 'f.inhalt', 'f.inh.brief', 'f.inh.angaben',
  'eb.btn', 'eb.h', 'eb.intro', 'eb.kuerzel', 'eb.close', 'eb.titel', 'eb.datum', 'eb.kuerzelZeile', 'eb.col.leistung', 'eb.col.einstufung', 'eb.col.betrag', 'eb.col.stelle', 'eb.col.schritt', 'eb.hinweis'];

// ---------- Hilfsfunktionen in fmt.js ----------
check('ohnePara: Paragraf in Klammern weg, Satzzeichen bleibt', Fmt.ohnePara('Überprüfungsantrag (§ 44 SGB X); rückwirkend') === 'Überprüfungsantrag; rückwirkend' && Fmt.ohnePara('mitgenommen (§ 899 ZPO).') === 'mitgenommen.');
check('ohnePara: Begriff vor dem Paragrafen bleibt, Klammern ohne § bleiben', Fmt.ohnePara('prüft (Nahtlosigkeit, § 145 SGB III).') === 'prüft (Nahtlosigkeit).' && Fmt.ohnePara('Urteil (BVerwG, 12.12.2023)') === 'Urteil (BVerwG, 12.12.2023)' && Fmt.ohnePara('angerechnet (Art. 4 BayBlindG): rund') === 'angerechnet: rund');
check('gebDatum: einheitlich TT.MM.JJJJ', ['1.2.1985', '01021985', '1985-02-01', '1/2/1985', '01.02.1985'].every((x) => Fmt.gebDatum(x) === '01.02.1985'));
check('gebDatum: Unklares und Ungültiges bleibt wie eingegeben', Fmt.gebDatum('1.2.85') === '1.2.85' && Fmt.gebDatum('31.02.1985') === '31.02.1985' && Fmt.gebDatum('') === '');
check('Neue Texte in allen 13 Sprachen', LANGS.every((l) => NEU.every((k) => typeof I18N[l][k] === 'string' && I18N[l][k].length > 1)), LANGS.map((l) => NEU.filter((k) => !I18N[l][k]).map((k) => l + ':' + k)).flat().join());
check('Platzhalter in allen Sprachen wie im Deutschen', LANGS.every((l) => NEU.every((k) => (I18N.de[k].match(/\{\w+\}/g) || []).join() === (I18N[l][k].match(/\{\w+\}/g) || []).join())));
check('Kein Paragraf in einem Sprachtext außerhalb von Klammern (sonst bliebe er in der Laienansicht stehen)', LANGS.every((l) => Object.values(I18N[l]).every((v) => typeof v !== 'string' || !/§|Art\. \d/.test(Fmt.ohnePara(v)))));

// ---------- Einstellungen: drei Blöcke ----------
const gruppen = [...d.querySelectorAll('#pn-einst .set-gruppe')];
check('Einstellungen: Haushalte (Platzhalter, ausgeblendet), Anzeige und Sprache, Für Fachkräfte – in dieser Reihenfolge', gruppen[0].id === 'setHaushalte' && gruppen[0].hidden && gruppen[1].querySelector('h3').textContent === 'Anzeige und Sprache' && !!gruppen[1].querySelector('#lang') && !!gruppen[1].querySelector('#bigBtn') && gruppen[2].id === 'setFach' && gruppen[2].querySelector('h3').textContent === 'Für Fachkräfte');
check('Beratungsmodus: Schalter standardmäßig aus', $('beratungBtn').getAttribute('aria-pressed') === 'false' && $('beratungBtn').textContent.trim() === 'Beratungsmodus' && $('beratungT').textContent === I18N.de['set.beratung.t']);
check('Vor dem ersten Ergebnis kein Knopf „Ergebnis mitgeben“', $('ebOpen').hidden === true);

// ---------- Laienansicht ----------
$('p1').click();
const passend = () => [...d.querySelectorAll('#cards article.card')].filter((a) => /pill (ja|vielleicht)/.test(a.querySelector('.pill').className));
const gut = () => d.querySelector('#gutWissen') ? d.querySelector('#gutWissen').textContent : '';
check('Laienansicht: keine Rechtsgrundlage in den Karten', d.querySelectorAll('#cards .recht').length === 0);
check('Laienansicht: keine Paragrafen in Karten und „Gut zu wissen“ (z. B. § 44 SGB X)', !/§/.test(d.getElementById('cards').textContent) && /Überprüfungsantrag/.test(gut()), gut().slice(0, 200));
check('Knopf „Ergebnis mitgeben / drucken“ direkt unter dem Ergebniszähler', !$('ebOpen').hidden && $('ebOpen').textContent === I18N.de['eb.btn'] && $('ebOpen').closest('.summary') === $('count').closest('.summary'));

// ---------- Beratungsmodus an ----------
$('beratungBtn').click();
check('Beratungsmodus an: Schalter gedrückt und gespeichert', $('beratungBtn').getAttribute('aria-pressed') === 'true' && store['lotse.beratung'] === '1');
check('Beratungsmodus: jede Karte mit Rechtsgrundlage', [...d.querySelectorAll('#cards article.card')].every((a) => /Rechtsgrundlage:/.test((a.querySelector('.recht') || {}).textContent || '')));
check('Beratungsmodus: Wohngeld nennt das WoGG, Kinderzuschlag § 6a BKGG', /WoGG/.test(d.querySelector('#c-wohngeld .recht').textContent) && /§ 6a BKGG/.test(d.querySelector('#c-kiz .recht').textContent));
check('Beratungsmodus: Paragrafen in „Gut zu wissen“ sichtbar (§ 44 SGB X)', /§ 44 SGB X/.test(gut()));

// ---------- Ergebnisblatt ----------
$('p-name').value = 'Maria Beispiel'; fire($('p-name'), 'input');
$('ebOpen').click();
const seite = () => $('ebSeite');
const zeilen = () => [...seite().querySelectorAll('tbody tr')];
check('Ergebnisblatt öffnet sich und ersetzt die Seite', !$('ergBlatt').hidden && $('app').classList.contains('pm'));
check('Ergebnisblatt: Spalten Leistung – Einstufung – ungefährer Betrag – Stelle – nächster Schritt', [...seite().querySelectorAll('thead th')].map((x) => x.textContent).join('|') === 'Leistung|Einstufung|Ungefährer Betrag|Stelle|Nächster Schritt');
check('Ergebnisblatt: eine Zeile je passender Leistung, gleiche Einstufung wie die Karte', zeilen().length === passend().length && zeilen().every((tr, i) => tr.querySelector('.pill').textContent === passend()[i].querySelector('.pill').textContent), zeilen().length + ' vs ' + passend().length);
const kgZeile = zeilen().find((tr) => /Kindergeld/.test(tr.querySelector('th').textContent));
check('Ergebnisblatt: Betrag mit denselben Wörtern wie auf der Karte', !!kgZeile && d.querySelector('#c-kindergeld .kern').textContent.indexOf(kgZeile.children[2].textContent) >= 0, kgZeile && kgZeile.children[2].textContent);
check('Ergebnisblatt: nächster Schritt = „Wo beantragen?“ der Karte', !!kgZeile && kgZeile.children[4].textContent === I18N.de['s.kindergeld.wo']);
check('Ergebnisblatt: Datum und Hinweis „unverbindliche Orientierung“', /Erstellt am \d{2}\.\d{2}\.\d{4}/.test(seite().textContent) && /Unverbindliche Orientierung/.test(seite().textContent));
check('Ergebnisblatt: kein Name', !/Maria|Beispiel/.test(seite().textContent));
$('ebKuerzel').value = 'M.B.'; fire($('ebKuerzel'), 'input');
check('Ergebnisblatt: Kürzel erscheint, wenn eingetragen', /Kürzel: M\.B\./.test(seite().textContent));
check('Ergebnisblatt: Beratungsmodus nennt die Rechtsgrundlage', /§ 6a BKGG/.test(seite().textContent));
check('Ergebnisblatt: „du“ bleibt (Hinweis in der Du-Form)', /deinen Angaben/.test(seite().textContent));
gedruckt = 0; $('ebDruck').click();
check('Ergebnisblatt: Drucken öffnet den Druckdialog (Web)', gedruckt === 1);
check('Druck-CSS für das Ergebnisblatt vorhanden', /@media print\s*\{[^@]*\.eb-tab/.test(html));
setLang('en');
check('Ergebnisblatt folgt der Sprache (Englisch), Leistungsname bleibt deutsch', /Approximate amount/.test(seite().textContent) && /Kindergeld/.test(seite().textContent));
setLang('de');
$('ebClose').click();
check('Ergebnisblatt schließen', $('ergBlatt').hidden && !$('app').classList.contains('pm'));
$('beratungBtn').click();
check('Beratungsmodus wieder aus: Paragrafen weg', !/§/.test(d.getElementById('cards').textContent) && store['lotse.beratung'] === '0');

// ---------- Unterlagen-Checkliste (ersetzt die Listen in Karte und Mappe) ----------
const wgHaken = () => [...d.querySelectorAll('#c-wohngeld input[data-haken]')];
const docsBox = () => [...d.querySelectorAll('#c-wohngeld .lab-s')].find((x) => x.textContent === I18N.de['steps.docs']).parentNode;
check('Karte: Unterlagen als Checkliste, keine zweite Liste', wgHaken().length === 3 && d.querySelectorAll('#c-wohngeld .haken-liste').length === 1 && docsBox().querySelectorAll('ul').length === 1 && !!docsBox().querySelector('ul.haken-liste'));
wgHaken()[0].checked = true; fire(wgHaken()[0], 'change');
check('Haken wird auf dem Gerät gespeichert', JSON.parse(store['lotse.haken'] || '{}')['wohngeld|s.wohngeld.u1'] === true);
[...d.querySelectorAll('[data-pick]')].forEach((cb) => { cb.checked = ['wohngeld', 'uvg'].includes(cb.getAttribute('data-pick')); fire(cb, 'change'); });
$('p-geb').value = '1.2.1985'; fire($('p-geb'), 'input'); fire($('p-geb'), 'change');
check('Geburtsdatum wird beim Verlassen des Feldes einheitlich formatiert', $('p-geb').value === '01.02.1985');
$('mappeMake').click();
const mh = () => [...d.querySelectorAll('#m-unterlagen input[data-haken="wohngeld|s.wohngeld.u1"]')];
check('Mappe: dieselbe Checkliste, Haken aus der Karte übernommen', mh().length === 1 && mh()[0].checked && d.querySelectorAll('#m-unterlagen .haken-liste').length === 2);
mh()[0].checked = false; fire(mh()[0], 'change');
check('Haken in der Mappe gilt auch in der Karte', wgHaken()[0].checked === false);

// ---------- Antragsmappe: Übersicht, Drucken am Ende, Geburtsdatum ----------
const links = [...d.querySelectorAll('#mappeBody .mappe-inhalt a[data-sprung]')];
check('Mappe: Übersicht „In dieser Mappe:“ mit Sprungmarken auf vorhandene Teile', d.querySelector('#mappeBody .mappe-inhalt h3').textContent === 'In dieser Mappe:' && links.length === 4 && links.every((a) => !!$(a.getAttribute('data-sprung'))), links.map((a) => a.textContent).join(' | '));
check('Mappe: Übersicht nennt Brief, Angabenblatt, Unterlagen, Formulare', /Unterhaltsvorschuss/.test(links[0].textContent) && links[1].getAttribute('data-sprung') === 'm-angaben' && links[2].getAttribute('data-sprung') === 'm-unterlagen' && links[3].getAttribute('data-sprung') === 'm-formulare');
check('Mappe: Übersicht wird nicht gedruckt', d.querySelector('#mappeBody .mappe-inhalt').classList.contains('no-print'));
links[1].click();
check('Sprungmarke setzt den Fokus auf den Abschnitt', d.activeElement === $('m-angaben'));
gedruckt = 0; $('mappePrint2').click();
check('Mappe: „Drucken“ auch am Ende', !!$('mappePrint2') && $('mappePrint2').textContent === I18N.de['f.print'] && gedruckt === 1 && $('mappePrint2').closest('#mappe') && $('mappePrint2').closest('.no-print'));
check('Angabenblatt: Geburtsdatum TT.MM.JJJJ', /Geburtsdatum: 01\.02\.1985/.test($('m-angaben').textContent));
{
  // Altes Format im Speicher (z. B. „1985-02-01“): im Angabenblatt trotzdem einheitlich
  $('p-geb').value = '1985-02-01'; fire($('p-geb'), 'input'); setLang('de');
  check('Angabenblatt: Geburtsdatum aus ISO-Schreibweise wird TT.MM.JJJJ', /Geburtsdatum: 01\.02\.1985/.test($('m-angaben').textContent));
}
$('mappeClose').click();
check('Keine Skriptfehler', errors.length === 0, errors.join('; '));
console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlle Tests (Beratungsmodus, Ergebnisblatt, Checkliste, Mappe) bestanden');
process.exit(fails ? 1 : 0);
