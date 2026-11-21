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
const NEU = ['nav.ordner', 'vg.liste.h', 'vg.plus', 'vg.plusWeiter', 'vg.anlegen', 'vg.neu.t', 'vg.bearbeiten', 'vg.fertig', 'vg.zuSicher', 'akt.antrag', 'ordner.ergebnis', 'ordner.mappe', 'ordner.mappe.n', 'ordner.ausziehen', 'ordner.ausziehen.n', 'ordner.pflege', 'ordner.pfaendung', 'set.sicher.h', 'set.sicher.t', 'set.an', 'set.aus', 'set.thema', 'set.thema.auto', 'set.thema.hell', 'set.thema.dunkel', 'set.loeschen.h', 'l.eins', 'l.alle', 'l.ja', 'set.fach.h', 'set.beratung.label', 'set.beratung.t', 'recht.label',
  'akt.drucken', 'eb.h', 'eb.intro', 'eb.kuerzel', 'eb.titel', 'eb.datum', 'eb.kuerzelZeile', 'eb.col.leistung', 'eb.col.einstufung', 'eb.col.betrag', 'eb.col.stelle', 'eb.col.schritt', 'eb.hinweis'];

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
check('Einstellungen: jede Zeile mit einer Zeile Status (Sprache, PIN, Beratungsmodus, Version)', /Deutsch/.test($('stAnzeige').textContent) && $('stSicher').textContent === I18N.de['set.sicher.t'] + ' · ' + I18N.de['set.sicher.loeschen'] && $('stFach').textContent === 'Beratungsmodus: Aus' && /^Version \d/.test($('stAbout').textContent));
check('Einstellungen: kein Kopftext, keine Reiter, kein Kurzer Check, kein „Alle Angaben löschen“ ganz unten', w.getComputedStyle(d.querySelector('header.top')).position === 'absolute' && !$('tab-info') && !d.querySelector('#v-einst [role="tablist"]') && !$('einfachBtn').closest('#v-einst'));
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
check('Sicherheit und Daten: zwei Löschen-Zeilen (nur dieser Vorgang, alles auf dem Gerät)', /löschen/.test($('clear2').querySelector('b').textContent) && $('vgAlle').querySelector('b').textContent === I18N.de['l.alle'] && $('loeschListe').children.length === 2);
$('vgAlle').click();
check('Löschen-Rückfrage wiederholt den Text der Zeile nicht', !!$('loeschFrage') && !$('loeschFrage').textContent.includes($('vgAlle').querySelector('.zeile-st').textContent));
$('loeschNein').click();
check('„So rechnet der Check“: je Leistung ein Aufklapper statt einer langen Tabelle', d.querySelectorAll('#es-about .regel-liste details').length > 10 && !d.querySelector('#es-about .rules table'));
check('„Mehr dazu“ sagt, worum es geht (PIN)', /PIN/.test(d.querySelector('#setSicher .set-mehr summary').textContent));
d.querySelector('#appnav [data-ansicht="einst"]').click();
check('Leiste „Einstellungen“ führt aus der Unterseite zur Liste', !$('einstListe').hidden && $('es-sicher').hidden);
zeilenE[2].click();
check('Beratungsmodus: Schalter standardmäßig aus', $('beratungBtn').getAttribute('aria-checked') === 'false' && $('beratungBtn').getAttribute('role') === 'switch' && $('beratungBtn').querySelector('.schalter-t').textContent === 'Beratungsmodus' && $('beratungT').textContent === I18N.de['set.beratung.t']);
d.querySelector('#appnav [data-ansicht="start"]').click(); $('goLeistungen').click();
check('Startkachel Leistungen: Leiste markiert Start', navAkt() === 'start' && !$('v-leistungen').hidden);
check('[hilfen-aufraeumen] Kurzer Check als Wahl oben im Leistungs-Check (Wahl-Karte oder Leiste über „Deine Angaben“), nicht am Formularende', $('einfachBtn') && $('einfachBtn').closest('#schritte') && $('einfachBtn').textContent.trim().startsWith(I18N.de['einfach.btn']) && !$('cols').contains($('einfachBtn')));
check('Schlüssel einfach.vor in keiner Sprache mehr', LANGS.every((l) => !I18N[l] || !('einfach.vor' in I18N[l])));
check('Vor dem ersten Ergebnis kein Knopf „Drucken oder teilen“', !$('ebOpen'));

// ---------- Laienansicht ----------
$('p1').click();
const passend = () => [...d.querySelectorAll('#cards article.card')].filter((a) => /pill (ja|vielleicht)/.test(a.querySelector('.pill').className));
const gut = () => d.querySelector('#gutWissen') ? d.querySelector('#gutWissen').textContent : '';
check('Laienansicht: keine Rechtsgrundlage in den Karten', d.querySelectorAll('#cards .recht').length === 0);
check('Laienansicht: keine Paragrafen in Karten und „Gut zu wissen“ (z. B. § 44 SGB X)', !/§/.test(d.getElementById('cards').textContent) && /Überprüfungsantrag/.test(gut()), gut().slice(0, 200));
check('Knopf „Drucken oder teilen“ (Ergebnisblatt) direkt unter dem Hauptknopf „Antrag vorbereiten“ (UX-Prüfung 21.11.2026, Nr. 8)', !!$('ebOpen') && $('ebOpen').textContent === I18N.de['akt.drucken'] && $('ebOpen').previousElementSibling === $('mappeMake'));

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
check('Ergebnisblatt: eine Zeile je passender Leistung, gleiche Einstufung wie die Karte', zeilen().length === passend().length && zeilen().every((tr) => tr.querySelector('.pill').textContent === passend().find((a) => tr.querySelector('th').textContent.indexOf(a.querySelector('h3').textContent) === 0).querySelector('.pill').textContent), zeilen().length + ' vs ' + passend().length);
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
check('[karte-mappe] Karte: keine Unterlagen und nächsten Schritte, dafür der Knopf „Antrag vorbereiten“ (Antragsmappe)', wgHaken().length === 0 && !d.querySelector('#c-wohngeld .haken-liste') && d.querySelector('#c-wohngeld [data-antrag="wohngeld"]').textContent === I18N.de['akt.antrag']);
// Wohngeld (als Haken oder als Weg „Wohngeld und Kinderzuschlag“) und Unterhaltsvorschuss wählen
[...d.querySelectorAll('[data-pick]')].forEach((cb) => { cb.checked = ['wohngeld', 'uvg'].includes(cb.getAttribute('data-pick')); fire(cb, 'change'); });
{ const ra = d.querySelector('#pick input[data-weg][value="a"]'); if (ra) { ra.checked = true; fire(ra, 'change'); } }
$('p-geb').value = '1.2.1985'; fire($('p-geb'), 'input'); fire($('p-geb'), 'change');
check('Geburtsdatum wird beim Verlassen des Feldes einheitlich formatiert', $('p-geb').value === '01.02.1985');
$('mappeMake').click();
// Unterlagen: eine Liste ohne Doppelungen; Haken je Sache (u|…), alte Haken (id|Schlüssel) zählen weiter
const mh = () => [...d.querySelectorAll('#aufUnterlagen input[data-haken^="u|"]')];
check('[karte-mappe] Mappe: Unterlagen zum Abhaken, Hinweis „genaue Liste nennt die Stelle“', mh().length >= 3 && mh().every((c) => !c.checked) && $('aufUnterlagen').textContent.includes(I18N.de['steps.note']));
mh()[0].checked = true; fire(mh()[0], 'change');
check('Haken in der Mappe wird auf dem Gerät gespeichert', JSON.parse(store['lotse.haken'] || '{}')[mh()[0].getAttribute('data-haken')] === true);
check('Druck/PDF: Unterlagenliste mit Stelle und Tipp je Leistung', $('m-unterlagen').textContent.includes(I18N.de['s.uvg.wo']) && $('m-unterlagen').textContent.includes(I18N.de['s.uvg.tip']));

// ---------- Antragsmappe: Aufgabenliste, ein Ausgabe-Knopf, Geburtsdatum ----------
check('Mappe: kein Inhaltsverzeichnis (die Aufgabenliste ist das Verzeichnis)', !d.querySelector('#mappe .mappe-inhalt') && !!d.querySelector('#mappe .aufgaben') && !d.querySelector('[data-sprung]'));
check('Mappe: ein Hauptknopf „Drucken oder teilen“ im letzten Schritt; Kopieren und Teilen unter „Weitere Möglichkeiten“', !$('mappePrint').closest('details.mappe-mehr') && !!$('mappePrint').closest('#auf-abschicken') && $('mappeCopy').closest('details.mappe-mehr') && $('mappeShare').closest('details.mappe-mehr') && $('mappeDruck').closest('details.mappe-mehr') && !$('mappePrint2'));
gedruckt = 0; $('mappePrint').click();
check('Mappe: „Drucken oder teilen“ druckt (Web)', gedruckt === 1);
check('Angabenblatt: Geburtsdatum TT.MM.JJJJ', /Geburtsdatum: 01\.02\.1985/.test($('m-angaben').textContent));
{
  // Altes Format im Speicher (z. B. „1985-02-01“): im Angabenblatt trotzdem einheitlich
  $('p-geb').value = '1985-02-01'; fire($('p-geb'), 'input'); setLang('de');
  check('Angabenblatt: Geburtsdatum aus ISO-Schreibweise wird TT.MM.JJJJ', /Geburtsdatum: 01\.02\.1985/.test($('m-angaben').textContent));
}
const nGew = d.querySelectorAll('#aufAntraege .ant-zeile').length;
$('mappeClose').click();
// ---------- Mein Ordner ----------
d.querySelector('#appnav [data-ansicht="ordner"]').click();
check('Mein Ordner mit Beispiel (nicht eigene Angaben): kein Kasten „Los geht\'s“, keine Inhaltszeilen, Vorgänge sichtbar', !$('ordnerLeer') && !$('ordnerLos') && $('ordnerKarten').hidden && !$('setHaushalte').hidden && !!$('vgH'));
$('miete').value = '700'; fire($('miete'), 'input'); fire($('miete'), 'change');
d.querySelector('#appnav [data-ansicht="ordner"]').click();
const orZ = () => [...d.querySelectorAll('#ordnerKarten .zeile')].map((b) => b.id);
check('Mein Ordner: Leiste markiert Mein Ordner, kein Kopftext', navAkt() === 'ordner' && !$('v-ordner').hidden && w.getComputedStyle(d.querySelector('header.top')).position === 'absolute');
check('[navigation] Mein Ordner: Vorgänge oben, ohne Kopfzeile „Geöffnet“ und ohne „Wechseln“', !$('ordnerKopf') && $('setHaushalte').compareDocumentPosition($('ordnerKarten')) === 4);
check('Mein Ordner: letztes Ergebnis mit Zähler und Antragsmappe mit Auswahl', orZ()[0] === 'or-ergebnis' && /wahrscheinlich|möglich/.test($('or-ergebnis').textContent) && new RegExp('Ausgewählt: ' + nGew).test(($('or-mappe') || {}).textContent || ''), orZ().join());
check('Mein Ordner: keine Fristen, kein leerer Bereich (Pflege, Pfändung ohne Angaben)', !$('or-fristen') && !/Frist/.test($('ordnerHaupt').textContent) && !$('or-pflege') && !$('or-pfaendung'));
$('or-ergebnis').click();
check('Sprung zum Ergebnis: Leistungen offen, Leiste markiert Mein Ordner (Herkunft)', !$('v-leistungen').hidden && navAkt() === 'ordner');
d.querySelector('#appnav [data-ansicht="ordner"]').click();
check('Mein Ordner: kein Feld „Alle Haushalte und Vorgänge“, ein Vorgang: nur „+ Weiteren Vorgang anlegen“', !$('or-alle') && !$('ordnerAlle') && !!$('vgH') && /Weiteren Vorgang anlegen/.test($('vgPlus').textContent) && !$('vgBearb'));
$('vgZuSicher').click();
check('„PIN-Sperre und automatisch löschen“ öffnet Einstellungen → Sicherheit und Daten', !$('v-einst').hidden && !$('es-sicher').hidden && !!$('vgTage'));
d.querySelector('#appnav [data-ansicht="ordner"]').click();
setLang('ar');
check('Arabisch: Leiste und Ordner übersetzt, rechts nach links', $('app').getAttribute('dir') === 'rtl' && d.querySelector('#appnav [data-ansicht="ordner"]').textContent === I18N.ar['nav.ordner'] && $('or-ergebnis').querySelector('b').textContent === I18N.ar['ordner.ergebnis']);
setLang('de');
// ---------- Geld und Schulden: Beratungsmodus als dichtere Sicht (Konzept g, U8); Privatnutzer sieht NICHTS Zusätzliches ----------
{
  const navZur = (v) => d.querySelector('#v-' + v + ' [data-nav-zurueck]').click();
  const sp = () => $('spInhalt');
  const zuGeld = () => { d.querySelector('#appnav [data-ansicht="start"]').click(); $('goGeld').click(); };
  const k = (sel) => { const e = sp().querySelector(sel); if (!e) throw new Error('fehlt: ' + sel); e.click(); };
  // ein Eintrag in der Schulden-Liste (für Tabelle und Auswahl im Schreiben)
  w.location.hash = '#schulden'; w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  if (!d.querySelector('#slInhalt .sl-eintrag')) { $('sl-neu').click(); $('sl-f-g').value = 'Beispiel Inkasso'; fire($('sl-f-g'), 'input'); $('sl-speichern').click(); }
  const seiten = () => {
    const o = {};
    zuGeld(); o.kacheln = sp().innerHTML;
    k('.gs-dringend'); o.dringend = sp().innerHTML; k('.gs-d-check'); o.check = sp().innerHTML; navZur('sparen'); navZur('sparen');
    k('.gs-inkasso'); k('.gs-i-pruef'); o.pruef = sp().innerHTML; navZur('sparen');
    k('.gs-i-schreiben'); k('.ms-geduld'); o.schreiben = sp().innerHTML; navZur('sparen'); navZur('sparen'); navZur('sparen');
    k('.gs-hilfe'); k('.gs-h-termin'); o.termin = sp().innerHTML; navZur('sparen'); k('.gs-h-mappe'); o.mappe = sp().innerHTML; navZur('sparen'); navZur('sparen');
    k('.gs-bleibt'); let n = 0; while (!d.querySelector('#pfInhalt .pf-w-lohn') && n++ < 5) navZur('pfaendung'); o.pfaendung = $('pfInhalt').innerHTML;
    w.location.hash = '#schulden'; w.dispatchEvent(new w.HashChangeEvent('hashchange')); o.schulden = $('slInhalt').innerHTML;
    return o;
  };
  check('[ber-geld] Beratungsmodus ist aus', $('beratungBtn').getAttribute('aria-checked') === 'false');
  const vorher = seiten();
  const mitBer = (o) => Object.keys(o).filter((x) => /ber-nur/.test(o[x]));
  const VERBOTEN = /Gesprächsnotiz|Klient|Handzettel|13a Abs\. 1 Nr|Pfändung auf einer Seite|sl-tabelle|sl-ansicht/;
  check('[ber-geld] Privatmodus: auf keiner Seite ein Element für Fachkräfte (ber-nur), keine Fundstelle, keine Gesprächsnotiz, kein Klient', mitBer(vorher).length === 0 && !Object.values(vorher).some((h) => VERBOTEN.test(h)), mitBer(vorher).concat(Object.keys(vorher).filter((x) => VERBOTEN.test(vorher[x]))));
  $('beratungBtn').click();
  const an = seiten();
  check('[ber-geld] Beratungsmodus: zusätzliche Sicht auf Kacheln (Klient), Krisen-Check (alle Fragen, Notiz), Prüfliste (Fundstellen), Schreiben (Absender), Bis zum Termin (Handzettel), Pfändung (eine Seite), Schulden-Liste (Tabelle)',
    ['kacheln', 'check', 'pruef', 'schreiben', 'termin', 'mappe', 'pfaendung', 'schulden'].every((x) => /ber-nur/.test(an[x])) && /Klient/.test(an.kacheln) && /kc-notiz/.test(an.check) && /§ 13a Abs\. 1 Nr\. 1 RDG/.test(an.pruef) && /pf-maske/.test(an.pfaendung) && /sl-ansicht-tabelle/.test(an.schulden), mitBer(an));
  zuGeld(); k('.gs-dringend'); k('.gs-d-check');
  check('[ber-geld] Krisen-Check im Beratungsmodus: alle 7 Fragen auf einer Seite', sp().querySelectorAll('.kc-alle input[type=checkbox]').length === 7);
  w.location.hash = '#schulden'; w.dispatchEvent(new w.HashChangeEvent('hashchange')); $('sl-ansicht-tabelle').click();
  check('[ber-geld] Schulden-Liste: Tabelle mit Gläubiger und Sortierung', !!d.querySelector('#slInhalt .sl-tabelle') && /Beispiel Inkasso/.test(d.querySelector('#slInhalt .sl-tabelle').textContent) && !!$('sl-sort'));
  $('sl-ansicht-karten').click();
  $('beratungBtn').click();
  const nachher = seiten();
  const anders = Object.keys(vorher).filter((x) => vorher[x] !== nachher[x]);
  check('[ber-geld] Nach dem Ausschalten: jede Seite wieder genau wie vorher (DOM-Vergleich)', anders.length === 0, anders);
  d.querySelector('#appnav [data-ansicht="start"]').click();
}
check('Keine Skriptfehler', errors.length === 0, errors.join('; '));
console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlle Tests (Beratungsmodus, Ergebnisblatt, Checkliste, Mappe) bestanden');
process.exit(fails ? 1 : 0);
