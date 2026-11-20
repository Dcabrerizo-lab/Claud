// Höchstbetrag der Miete beim Wohngeld in der Oberfläche (dist, JSDOM): Zeile unter dem Mietfeld, Aufklapptext,
// Einfache Sprache, alle 13 Sprachen, Sicherheit, und die Einfache Version (Ergebnis, „Gut zu wissen“).
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const I18N = require('../dist/i18n.js');
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
let n = 0, fails = 0;
const check = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : String(x).slice(0, 400)); } };

function seite(speicher) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      const mem = Object.assign({ 'lotse.ack': '1', 'lotse-lang': 'de' }, speicher);
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors };
}
const norm = (s) => String(s).replace(/[\s  ]+/g, ' ').trim();

const S = seite({});
const { w, d } = S;
const zeile = () => d.getElementById('mieteGrenze'), mehr = () => d.getElementById('mieteGrenzeMehr');
const txt = () => norm(zeile().textContent), inhalt = () => norm(d.getElementById('mieteGrenzeInhalt').textContent);
const basis = { adults: 1, kids: 2, kidsU6: 1, kids14: 0, young: 0, bezug: {} };
const setze = (s) => w.__solo.set(Object.assign({}, basis, s));
const tippe = (id, v) => { const el = d.getElementById(id); el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); };

// 1) Leeres Formular: ausgeblendet
setze({});
check('leer: Zeile und Aufklapper ausgeblendet', zeile().hidden && mehr().hidden);
// 2) Stufe III, 3 Personen, 950 € warm
setze({ mietstufe: '3', miete: 950 });
check('III/3: Zeile sichtbar', !zeile().hidden && !mehr().hidden);
check('III/3: 686,60 €, III, 3 Personen, darüber', /686,60/.test(txt()) && /Mietenstufe III/.test(txt()) && /3 Personen/.test(txt()) && /darüber/.test(txt()) && /779,80/.test(txt()), txt());
check('III/3: Klasse ohne „moeglich“', !zeile().classList.contains('moeglich'));
// 3) Heizkosten eingeben
setze({ mietstufe: '3', miete: 950, heizkosten: 300 });
check('mit Heizkosten: 650 €, darunter, nicht geschätzt', /650,00|650 €/.test(txt()) && /darunter/.test(txt()) && !/geschätzt/.test(txt()), txt());
// nah an der Grenze
setze({ mietstufe: '3', miete: 850 });
check('nahe an der Grenze: Klasse moeglich', /nahe an der Grenze/.test(txt()) && zeile().classList.contains('moeglich'), txt());
// 4) PLZ mit zwei Stufen (84416: Taufkirchen (Vils) V, Inning am Holz IV) -> Spanne, dann Wohnort wählen
setze({ miete: 700, plz: '84416' });
check('PLZ mit zwei Stufen: Möglich, Spanne IV bis V, Klasse moeglich', /^Möglich/.test(txt()) && /Stufe IV bis V/.test(txt()) && zeile().classList.contains('moeglich'), txt());
const pick = d.getElementById('plzPick');
check('Auswahl Wohnort vorhanden', !!pick);
if (pick) {
  const opt = [...pick.options].find((o) => /^Taufkirchen \(Vils\)\|/.test(o.value));
  pick.value = opt.value; pick.dispatchEvent(new w.Event('change', { bubbles: true }));
  check('Wohnort gewählt: eine Stufe (V)', /Mietenstufe V,/.test(txt()) && !zeile().classList.contains('moeglich'), txt());
}
// Spanne (PLZ 84416, Stufe IV bis V) und Miete über dem höchsten Wert: keine feste Aussage „nur {bis}“, sondern je nach Stufe {von} bis {bis}
setze({ miete: 1500, plz: '84416' });
check('Spanne + darüber: „je nach Mietenstufe nur … bis …“', /je nach Mietenstufe nur .+ bis .+\./.test(txt()) && !/Dann zählen nur/.test(txt()) && /geschätzt/.test(txt()), txt());
setze({ miete: 1500, heizkosten: 100, plz: '84416' });
check('Spanne + darüber mit Heizkosten: ohne „geschätzt“', /liegt darüber\. Dann zählen je nach Mietenstufe nur/.test(txt()) && !/geschätzt/.test(txt()), txt());
// 11) PLZ mit einem Ort ohne bekannte Stufe (14542): ganze Spanne I bis VII, nicht die engere
setze({ miete: 700, plz: '14542', adults: 1, kids: 0, kidsU6: 0 });
check('Ort ohne Stufe: Spanne I bis VII (380,20 bis 696,20)', /380,20/.test(txt()) && /696,20/.test(txt()), txt());
// ohne PLZ und Stufe, aber Miete: Spanne, Hinweis auf PLZ
setze({ miete: 500, adults: 1, kids: 0, kidsU6: 0 });
check('ohne Stufe: zeileOhne mit Postleitzahl-Hinweis', /Postleitzahl/.test(txt()) && /380,20/.test(txt()) && /1 Person\b/.test(txt()), txt());
// 5) Eigentum
setze({ mietstufe: '3', miete: 1200, wohnart: 'eigentum' });
check('Eigentum: Lastenzuschuss, kein Vergleich', /Lastenzuschuss/.test(txt()) && !/darüber|darunter/.test(txt()), txt());
check('Eigentum: Aufklapptext ohne Bruttokaltmiete', !/Bruttokaltmiete/.test(inhalt()));
setze({ miete: 1200, wohnart: 'eigentum' });
check('Eigentum ohne Stufe: Spanne statt festem Betrag', /bis/.test(txt()) && !/Lastenzuschuss/.test(txt()), txt());
// 6) Verwandte
setze({ mietstufe: '2', miete: 600, hhAndere: 'verwandte' });
check('Verwandte: Hinweis', /Verwandte/.test(txt()), txt());
// 7) Aufklapptext: KdU-Absatz fett, ohne KdU-Orientierungsbetrag
setze({ mietstufe: '3', miete: 950 });
check('Aufklapptext: Bruttokaltmiete, Heizbetrag 170,20, Klima 29,60, 2027, KdU', /Bruttokaltmiete/.test(inhalt()) && /170,20/.test(inhalt()) && /29,60/.test(inhalt()) && /1\.1\.2027/.test(inhalt()) && /Nicht verwechseln/.test(inhalt()), inhalt());
check('KdU-Absatz fett', /Nicht verwechseln/.test(d.querySelector('#mieteGrenzeInhalt strong').textContent));
const kdu = Math.round(686.6 * 1.1 * 100) / 100;
check('keine KdU-Orientierung (Tabelle × 1,1) im Aufklapptext', !inhalt().includes(String(kdu).replace('.', ',')), kdu);
check('summary übersetzt', norm(mehr().querySelector('summary').textContent) === 'Was zählt beim Wohngeld als Miete?');
// 8) Einfache Sprache
w.__solo.lang('de');
d.getElementById('einfacheSpracheBtn').click();
setze({ mietstufe: '3', miete: 950 });
check('Einfache Sprache: Text aus einfach/mietgrenze.json', /zählt die Miete ohne Heizung höchstens mit/.test(txt()) && /Das ist wahrscheinlich mehr/.test(txt()), txt());
d.getElementById('einfacheSpracheBtn').click();
check('Einfache Sprache wieder aus', /Für Wohngeld zählt höchstens/.test(txt()), txt());
// 9) Alle Sprachen: keine Rohschlüssel, keine Platzhalter, kein NaN
for (const l of LANGS) {
  w.__solo.lang(l);
  for (const s of [{ mietstufe: '3', miete: 950 }, { miete: 700, plz: '84416' }, { miete: 500 }, { mietstufe: '4', miete: 900, wohnart: 'eigentum', hhAndere: 'verwandte' }]) {
    setze(s);
    const t = txt() + ' ' + inhalt() + ' ' + norm(mehr().querySelector('summary').textContent);
    check(`${l}: ohne Rohschlüssel und Platzhalter ${JSON.stringify(s)}`, !/wgmax\.|\{[a-z]\w*\}|NaN|undefined/.test(t) && t.length > 100, t);
  }
  check(`${l}: Text übersetzt`, l === 'de' || txt() !== norm(I18N.de['wgmax.eigen']));
}
w.__solo.lang('de');
// 10) Ungültige Miete
setze({ mietstufe: '3' });
tippe('miete', 'abc');
check('ungültige Miete: Zeile weg, Warnung sichtbar', zeile().hidden && !d.getElementById('mieteWarn').hidden);
// 12) Eingabe mit HTML im Mietfeld: nichts wird eingefügt
const vorher = d.querySelectorAll('img').length;
tippe('miete', '<img src=x onerror=1>');
check('HTML im Mietfeld: kein neues Element', d.querySelectorAll('img').length === vorher && !d.querySelector('#mieteGrenze *'));
// 13) Farben: nur Variablen aus der Palette
const css = [...d.querySelectorAll('style')].map((s) => s.textContent).join('\n');
const regeln = css.match(/\.mietgrenze[^{]*\{[^}]*\}/g) || [];
check('CSS: Regeln vorhanden, nur --na/--warn', regeln.length >= 2 && regeln.every((r) => !/#[0-9a-f]{3,6}\b|rgb/i.test(r) && !/var\(--(?!na\b|na-bg\b|warn\b|warn-bg\b)/.test(r)), regeln.join(' '));
check('keine Skriptfehler (Formular)', S.errors.length === 0, S.errors.join(' | '));

// Einfache Version: Ergebnis mit „Gut zu wissen“
const esBasis = { schritt: 99, geb: '1980', wohnen: 'allein', mieteJa: '', miete: '700', arbeit: 'job', lohn: '1300', essen: '', em: '', renteJa: 'nein', rente: '', ausweis: 'nein', gdb: '', mz: {}, kind: 'nein', pflege: 'nein', schon: {}, wfbmJahre: '', erspart: 'wenig', plz: '' };
const esSeite = (es) => seite({ 'lotse.einfach': JSON.stringify({ es: Object.assign({}, esBasis, es), an: true }) });
const tippsText = (p) => [...p.d.querySelectorAll('.es-tipps li')].map((li) => norm(li.textContent));
{
  const p = esSeite({ plz: '90542' }); // Eckental: Stufe III
  const t = tippsText(p);
  const wgDa = [...p.d.querySelectorAll('.es-karte h3')].some((h) => /Wohngeld/.test(h.textContent));
  check('ES: Wohngeld-Karte im Ergebnis', wgDa, [...p.d.querySelectorAll('.es-karte h3')].map((h) => h.textContent).join(' | '));
  check('ES, Stufe III: Grenze 475,20 € für 1 Person', t.some((x) => /Grenze 475,20/.test(x) && /wahrscheinlich (höher|niedriger)/.test(x)), t.join(' || '));
  check('ES: keine Skriptfehler', p.errors.length === 0, p.errors.join(' | '));
}
{
  const p = esSeite({ plz: '' });
  const t = tippsText(p);
  check('ES ohne PLZ: Spanne 380,20 bis 696,20', t.some((x) => /380,20/.test(x) && /696,20/.test(x)), t.join(' || '));
}
{
  const p = esSeite({ wohnen: 'eltern', mieteJa: 'ja', miete: '300', plz: '90542' });
  check('ES bei den Eltern: kein Höchstbetrag', !tippsText(p).some((x) => /Grenze/.test(x) && /Wohngeld/.test(x)), tippsText(p).join(' || '));
}
{
  const p = esSeite({ arbeit: 'nein', lohn: '', erspart: 'wenig', plz: '90542', miete: '650' });
  const karten = [...p.d.querySelectorAll('.es-karte h3')].map((h) => h.textContent).join(' | ');
  const gs = /Grundsicherung/.test(karten);
  check('ES mit Grundsicherungs-Karte: Hinweis andere Grenze', !gs || tippsText(p).some((x) => /andere Grenze für die Miete/.test(x)), karten + ' // ' + tippsText(p).join(' || '));
  check('ES ohne Einkommen: Grundsicherungs-Karte gezeigt (Testfall greift)', gs, karten);
}
for (const l of LANGS) {
  const p = seite({ 'lotse.einfach': JSON.stringify({ es: Object.assign({}, esBasis, { plz: '' }), an: true }), 'lotse-lang': l });
  p.w.__solo.lang(l);
  const t = norm(p.d.getElementById('einfach').textContent);
  check(`ES ${l}: ohne Rohschlüssel`, !/es\.tipp\.|\{[a-z]\w*\}|NaN|undefined/.test(t), t.slice(0, 300));
}

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '[mietgrenze-dom] Höchstbetrag der Miete in der Oberfläche: ' + n + ' Prüfungen bestanden (Formular, Einfache Sprache, 13 Sprachen, Sicherheit, Einfache Version)');
process.exit(fails ? 1 : 0);
