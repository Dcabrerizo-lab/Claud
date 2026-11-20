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
const NEU = ['nav.ordner', 'ordner.leer', 'ordner.wechseln', 'ordner.alle', 'ordner.ergebnis', 'ordner.mappe', 'ordner.mappe.n', 'ordner.ausziehen', 'ordner.ausziehen.n', 'ordner.pflege', 'ordner.pfaendung', 'set.sicher.h', 'set.sicher.t', 'set.an', 'set.aus', 'set.thema', 'set.thema.auto', 'set.thema.hell', 'set.thema.dunkel', 'set.loeschen.h', 'set.vgLoeschen', 'set.fach.h', 'set.beratung.label', 'set.beratung.t', 'recht.label', 'haken.hint',
  'eb.btn', 'eb.h', 'eb.intro', 'eb.kuerzel', 'eb.titel', 'eb.datum', 'eb.kuerzelZeile', 'eb.col.leistung', 'eb.col.einstufung', 'eb.col.betrag', 'eb.col.stelle', 'eb.col.schritt', 'eb.hinweis'];

// ---------- Hilfsfunktionen in fmt.js ----------
check('ohnePara: Paragraf in Klammern weg, Satzzeichen bleibt', Fmt.ohnePara('Überprüfungsantrag (§ 44 SGB X); rückwirkend') === 'Überprüfungsantrag; rückwirkend' && Fmt.ohnePara('mitgenommen (§ 899 ZPO).') === 'mitgenommen.');
check('ohnePara: Begriff vor dem Paragrafen bleibt, Klammern ohne § bleiben', Fmt.ohnePara('prüft (Nahtlosigkeit, § 145 SGB III).') === 'prüft (Nahtlosigkeit).' && Fmt.ohnePara('Urteil (BVerwG, 12.12.2023)') === 'Urteil (BVerwG, 12.12.2023)' && Fmt.ohnePara('angerechnet (Art. 4 BayBlindG): rund') === 'angerechnet: rund');
check('gebDatum: einheitlich TT.MM.JJJJ', ['1.2.1985', '01021985', '1985-02-01', '1/2/1985', '01.02.1985'].every((x) => Fmt.gebDatum(x) === '01.02.1985'));
check('gebDatum: Unklares und Ungültiges bleibt wie eingegeben', Fmt.gebDatum('1.2.85') === '1.2.85' && Fmt.gebDatum('31.02.1985') === '31.02.1985' && Fmt.gebDatum('') === '');
check('Neue Texte in allen 13 Sprachen', LANGS.every((l) => NEU.every((k) => typeof I18N[l][k] === 'string' && I18N[l][k].length > 1)), LANGS.map((l) => NEU.filter((k) => !I18N[l][k]).map((k) => l + ':' + k)).flat().join());
check('Platzhalter in allen Sprachen wie im Deutschen', LANGS.every((l) => NEU.every((k) => (I18N.de[k].match(/\{\w+\}/g) || []).join() === (I18N[l][k].match(/\{\w+\}/g) || []).join())));
check('Kein Paragraf in einem Sprachtext außerhalb von Klammern (sonst bliebe er in der Laienansicht stehen)', LANGS.every((l) => Object.values(I18N[l]).every((v) => typeof v !== 'string' || !/§|Art\. \d/.test(Fmt.ohnePara(v)))));

// ---------- Rechtsgrundlagen (Korrektur 11) ----------
{
  const R = require('../src/rules.js').RECHT;
  check('Rechtsgrundlage WBS: § 27 WoFG, Grenze § 9 Abs. 2 WoFG, Landesrecht', /§ 27 WoFG/.test(R.wbs) && /§ 9 Abs\. 2 WoFG/.test(R.wbs) && /Landesrecht/.test(R.wbs));
  check('Rechtsgrundlage Pflege: §§ 36–38, 41, 44, 45b SGB XI; weitere Pflegeleistungen §§ 39, 40, 42, 42a', R.pflege === '§§ 36–38, 41, 44, 45b SGB XI' && R.pflegeplus === '§§ 39, 40, 42, 42a SGB XI');
}

// ---------- Leiste unten und Einstellungen (kurze Liste, Unterseiten, Schalter) ----------
const navB = () => [...d.querySelectorAll('#appnav button')];
const navAkt = () => (d.querySelector('#appnav button[aria-current="page"]') || {}).getAttribute?.('data-ansicht');
check('[navigation] Leiste: drei Punkte Start | Mein Ordner | Einstellungen, beschriftet', navB().map((x) => x.getAttribute('data-ansicht')).join() === 'start,ordner,einst' && navB().map((x) => x.textContent).join('|') === 'Start|Mein Ordner|Einstellungen');
d.querySelector('#appnav [data-ansicht="einst"]').click();
const zeilenE = [...d.querySelectorAll('#einstListe .zeile')];
check('Einstellungen: fünf Zeilen (Anzeige und Sprache, Erinnerungen, Sicherheit und Daten, Für Fachkräfte, Über die App), Leiste markiert Einstellungen', zeilenE.map((z) => z.getAttribute('data-seite')).join() === 'anzeige,erinnern,sicher,fach,about' && zeilenE.map((z) => z.querySelector('b').textContent).join('|') === [I18N.de['set.anzeige.h'], I18N.de['set.erinnern.h'], I18N.de['set.sicher.h'], I18N.de['set.fach.h'], I18N.de['set.about.h']].join('|') && navAkt() === 'einst');
check('Einstellungen: jede Zeile mit einer Zeile Status (Sprache, PIN, Beratungsmodus, Version)', /Deutsch/.test($('stAnzeige').textContent) && $('stSicher').textContent === I18N.de['set.sicher.t'] && $('stFach').textContent === 'Beratungsmodus: Aus' && /^Version \d/.test($('stAbout').textContent));
check('Einstellungen: kein Kopftext, keine Reiter, kein Kurzer Check, kein „Alle Angaben löschen“ ganz unten', w.getComputedStyle(d.querySelector('.top .lead')).display === 'none' && !$('tab-info') && !d.querySelector('#v-einst [role="tablist"]') && !$('einfachBtn').closest('#v-einst'));
check('Unterseiten zu Beginn zu, Liste sichtbar', !$('einstListe').hidden && [...d.querySelectorAll('#v-einst .unterseite')].every((u) => u.hidden));
zeilenE[0].click();
check('Zeile öffnet die Unterseite „Anzeige und Sprache“ mit „← Zurück“, Fokus auf der Überschrift', !$('es-anzeige').hidden && $('einstListe').hidden && /← Zurück/.test($('es-anzeige').querySelector('.us-zurueck').textContent) && d.activeElement === $('es-anzeige').querySelector('h2'));
const sw = ['bigBtn', 'einfacheSpracheBtn'].map($);
check('[navigation] Schalter: role="switch", aria-checked aus, sichtbar „Aus“', sw.every((b) => b.getAttribute('role') === 'switch' && b.getAttribute('aria-checked') === 'false' && b.querySelector('.schalter-zst').textContent === 'Aus') && !sw.some((b) => b.hasAttribute('aria-pressed')));
$('bigBtn').click();
check('Große Schrift an: aria-checked, sichtbar „An“, Status der Zeile', $('bigBtn').getAttribute('aria-checked') === 'true' && $('bigBtn').querySelector('.schalter-zst').textContent === 'An' && /Große Schrift/.test($('stAnzeige').textContent));
$('bigBtn').click();
check('Große Schrift wieder aus', $('bigBtn').getAttribute('aria-checked') === 'false' && !$('app').classList.contains('big'));
check('Hell/Dunkel/wie Gerät: drei Auswahlfelder, „Wie Gerät“ gewählt', [...d.querySelectorAll('input[name="thema"]')].map((r) => r.value).join() === ',light,dark' && $('thema-auto').checked && !d.documentElement.hasAttribute('data-theme'));
$('thema-dunkel').click();
check('Dunkel: data-theme="dark" und gespeichert', d.documentElement.getAttribute('data-theme') === 'dark' && store['lotse.thema'] === 'dark');
$('thema-auto').click();
check('Wie Gerät: Attribut weg, gespeichert leer', !d.documentElement.hasAttribute('data-theme') && store['lotse.thema'] === '');
$('es-anzeige').querySelector('.us-zurueck').click();
check('„← Zurück“ führt zur Liste, Fokus auf der Zeile', !$('einstListe').hidden && $('es-anzeige').hidden && d.activeElement === zeilenE[0]);
zeilenE[1].click();
check('Sicherheit und Daten: „Diesen Vorgang löschen“ und „Alle Vorgänge löschen“', $('clear2').textContent === I18N.de['set.vgLoeschen'] && !!$('vgAlleBox').querySelector('button') && $('vgAlleBox').textContent === I18N.de['vg.alleLoeschen']);
d.querySelector('#appnav [data-ansicht="einst"]').click();
check('Leiste „Einstellungen“ führt aus der Unterseite zur Liste', !$('einstListe').hidden && $('es-sicher').hidden);
zeilenE[2].click();
check('Beratungsmodus: Schalter standardmäßig aus', $('beratungBtn').getAttribute('aria-checked') === 'false' && $('beratungBtn').getAttribute('role') === 'switch' && $('beratungBtn').querySelector('.schalter-t').textContent === 'Beratungsmodus' && $('beratungT').textContent === I18N.de['set.beratung.t']);
d.querySelector('#appnav [data-ansicht="start"]').click(); $('goLeistungen').click();
check('Startkachel Leistungen: Leiste markiert Start', navAkt() === 'start' && !$('v-leistungen').hidden);
check('Kurzer Check als dezenter Link am Anfang des Leistungs-Checks, ohne „Lieber Schritt für Schritt?“', $('einfachBtn').closest('.es-link') && $('einfachBtn').closest('#cols') && $('einfachBtn').closest('.es-link').textContent.trim() === I18N.de['einfach.btn'] && !/Schritt für Schritt/.test($('einfachBtn').closest('.es-link').textContent));
check('Schlüssel einfach.vor in keiner Sprache mehr', LANGS.every((l) => !I18N[l] || !('einfach.vor' in I18N[l])));
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
check('Beratungsmodus an: Schalter an und gespeichert', $('beratungBtn').getAttribute('aria-checked') === 'true' && store['lotse.beratung'] === '1' && $('stFach').textContent === 'Beratungsmodus: An');
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
// Mappe (Vorgabe David 20.11.2026): kein Inhaltsverzeichnis, ein Hauptknopf, Formulare direkt nach den Briefen
check('Mappe: kein Inhaltsverzeichnis mehr (die Aufgabenliste ist das Verzeichnis)', !d.querySelector('#mappeBody .mappe-inhalt') && !!d.querySelector('#mappeBody .aufgaben'));
check('Mappe: oben ein Hauptknopf, Kopieren und Teilen unter „Weitere Möglichkeiten“', !$('mappePrint').closest('details') && $('mappeCopy').closest('details.mappe-mehr') && $('mappeShare').closest('details.mappe-mehr') && $('mappeDruck').closest('details.mappe-mehr'));
{ const teile = [...d.querySelectorAll('#mappeBody > .page')].map((p) => p.id); const f = teile.indexOf('m-formulare');
  check('Mappe: amtliche Formulare direkt nach den Briefen', f < 0 || teile.slice(0, f).every((x) => /^m-brief-/.test(x)), teile.join(', ')); }
gedruckt = 0; $('mappePrint2').click();
check('Mappe: „Drucken“ auch am Ende', !!$('mappePrint2') && $('mappePrint2').textContent === I18N.de['f.print'] && gedruckt === 1 && $('mappePrint2').closest('#mappe') && $('mappePrint2').closest('.no-print'));
check('Angabenblatt: Geburtsdatum TT.MM.JJJJ', /Geburtsdatum: 01\.02\.1985/.test($('m-angaben').textContent));
{
  // Altes Format im Speicher (z. B. „1985-02-01“): im Angabenblatt trotzdem einheitlich
  $('p-geb').value = '1985-02-01'; fire($('p-geb'), 'input'); setLang('de');
  check('Angabenblatt: Geburtsdatum aus ISO-Schreibweise wird TT.MM.JJJJ', /Geburtsdatum: 01\.02\.1985/.test($('m-angaben').textContent));
}
$('mappeClose').click();
// ---------- Mein Ordner ----------
d.querySelector('#appnav [data-ansicht="ordner"]').click();
check('Mein Ordner mit Beispiel (nicht eigene Angaben): freundlicher Leerzustand mit „Los geht\'s“', !$('ordnerLeer').hidden && $('ordnerKarten').hidden && $('ordnerLos').textContent.indexOf(I18N.de['home.los']) === 0);
$('miete').value = '700'; fire($('miete'), 'input'); fire($('miete'), 'change');
d.querySelector('#appnav [data-ansicht="ordner"]').click();
const orZ = () => [...d.querySelectorAll('#ordnerKarten .zeile')].map((b) => b.id);
check('Mein Ordner: Leiste markiert Mein Ordner, kein Kopftext', navAkt() === 'ordner' && !$('v-ordner').hidden && w.getComputedStyle(d.querySelector('.top .lead')).display === 'none');
check('[navigation] Mein Ordner: geöffneter Vorgang oben mit „Wechseln“', !$('ordnerKopf').hidden && /Geöffnet:/.test($('ordnerKopf').textContent) && [...$('ordnerKopf').querySelectorAll('button')].some((b) => b.textContent === I18N.de['ordner.wechseln']));
check('Mein Ordner: letztes Ergebnis mit Zähler und Antragsmappe mit Auswahl', orZ()[0] === 'or-ergebnis' && /wahrscheinlich|möglich/.test($('or-ergebnis').textContent) && /Ausgewählt: 2/.test(($('or-mappe') || {}).textContent || ''), orZ().join());
check('Mein Ordner: keine Fristen, kein leerer Bereich (Pflege, Pfändung ohne Angaben)', !$('or-fristen') && !/Frist/.test($('ordnerHaupt').textContent) && !$('or-pflege') && !$('or-pfaendung') && $('ordnerLeer').hidden);
$('or-ergebnis').click();
check('Sprung zum Ergebnis: Leistungen offen, Leiste markiert Mein Ordner (Herkunft)', !$('v-leistungen').hidden && navAkt() === 'ordner');
d.querySelector('#appnav [data-ansicht="ordner"]').click();
$('or-alle').click();
check('Unterseite „Alle Haushalte und Vorgänge“ mit der Verwaltung', !$('ordnerAlle').hidden && $('ordnerHaupt').hidden && !!$('setHaushalte').querySelector('#vgH') && !!$('vgNameSet'));
$('ordnerAlle').querySelector('.us-zurueck').click();
check('„← Zurück“ führt zur Übersicht', !$('ordnerHaupt').hidden && $('ordnerAlle').hidden);
setLang('ar');
check('Arabisch: Leiste und Ordner übersetzt, rechts nach links', $('app').getAttribute('dir') === 'rtl' && d.querySelector('#appnav [data-ansicht="ordner"]').textContent === I18N.ar['nav.ordner'] && $('or-ergebnis').querySelector('b').textContent === I18N.ar['ordner.ergebnis']);
setLang('de');
check('Keine Skriptfehler', errors.length === 0, errors.join('; '));
console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlle Tests (Beratungsmodus, Ergebnisblatt, Checkliste, Mappe) bestanden');
process.exit(fails ? 1 : 0);
