// Suche auf der Startseite (src/suche.js), Marke [suche]:
// - Unit: Vergleich (Umlaute, Groß/Klein, Tippfehler), Alltagswörter und alte Namen, Ranking, alle Sprachen, Wörterlisten vollständig
// - DOM (dist, JSDOM): Feld mit Beschriftung, Treffer als Zeilen mit Bereich, Trefferzahl in aria-live, Tastatur, kein Treffer,
//   Treffer öffnet die Seite, „Zurück“ führt zur Startseite mit Suche, RTL, nichts wird gespeichert
'use strict';
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = path.join(__dirname, '..');
const { render, LANGS } = require(path.join(ROOT, 'scripts', 'build.js'));
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL [suche] ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };

// ---------- Unit ----------
const html = render().html;
const sucheJs = html.slice(html.indexOf('var Suche = (function'), html.indexOf('if (typeof module !== \'undefined\') module.exports = Suche;'));
const Suche = new Function(sucheJs + '; return Suche;')();
const I18N = new Function(require(path.join(ROOT, 'scripts', 'build.js')).i18nSource().replace(/if \(typeof module[^\n]*\n/, '') + '; return I18N;')();
const NAMES = require(path.join(ROOT, 'src', 'rules.js')).NAMES;
const titel = (l) => (z) => (z[2].startsWith('N:') ? (l === 'de' ? NAMES[z[2].slice(2)] : I18N[l]['n.' + z[2].slice(2)]) : I18N[l][z[2]]);
const idx = {};
LANGS.forEach((l) => { idx[l] = Suche.index({ lang: l, titel: titel(l), titelDe: titel('de') }); });
const erster = (l, q) => { const r = Suche.suche(idx[l], q); return r[0] && r[0].id; };
const unter = (l, q, id, bis) => Suche.suche(idx[l], q).slice(0, bis || 3).some((x) => x.id === id);

check('norm: Umlaute, ß, Groß/Klein, Satzzeichen', Suche.norm('Größe-Ärger ÜBEL') === 'groesse aerger uebel' && Suche.norm('Straße') === Suche.norm('strasse'));
check('norm: Akzente und arabische Varianten', Suche.norm('Écolé') === 'ecole' && Suche.norm('كيف') === Suche.norm('کیف'));
check('dist: Vertauschen zählt 1', Suche.dist('wohngedl', 'wohngeld') === 1 && Suche.dist('abc', 'abc') === 0 && Suche.dist('kitten', 'sitting') === 3);
check('toleranz je Wortlänge', Suche.toleranz(3) === 0 && Suche.toleranz(5) === 1 && Suche.toleranz(9) === 2);

// Alltagswörter und alte Namen (Deutsch)
[['Mietzuschuss', 'l-wohngeld'], ['Hartz 4', 'l-ggeld'], ['Hartz IV', 'l-ggeld'], ['hartz4', 'l-ggeld'], ['Bürgergeld', 'l-ggeld'], ['Stütze', 'l-ggeld'],
  ['Sozialhilfe', 'l-gsa'], ['gelber Brief', 'g-mahn'], ['Konto gesperrt', 'g-konto'], ['Strom abgestellt', 'g-strom'], ['Kündigung Wohnung', 'g-miete'],
  ['Klassenfahrt', 'l-but'], ['Pflegestufe', 'p-schaetzen'], ['Schwerbehindertenausweis', 'l-ausweis'], ['GEZ', 'l-rundfunk'], ['Rente zu niedrig', 'l-gsa'],
  ['Unterhalt fehlt', 'l-uvg'], ['Inkasso', 'g-inkasso'], ['Haushaltsplan', 'g-haushalt'], ['Tarife vergleichen', 'g-tarif'], ['PIN', 'e-sicher'], ['Fristen', 'o-fristen'],
  ['Musterschreiben', 'g-schreiben'], ['Privatinsolvenz', 'g-ablauf'], ['Kaution', 'a-vorher'], ['Antragsmappe', 'mappe'], ['Jobcenter', 'b-jc']].forEach(([q, id]) => {
  check('Deutsch: „' + q + '“ → ' + id, unter('de', q, id, 2), Suche.suche(idx.de, q).slice(0, 3));
});
// UX-Audit D #10: Pflegegeld findet die Pflege-Übersicht, Gutachten die Gutachten-Prüfung, QR/SoLo-Datei den Import
[['Pflegegeld', 'p-hilfe'], ['Verhinderungspflege', 'p-hilfe'], ['Gutachten', 'p-gutachten'], ['QR-Code', 'o-import'], ['SoLo-Datei', 'o-import']].forEach(([q, id]) => check('[rot-d] Deutsch: „' + q + '“ → ' + id, unter('de', q, id, 3), Suche.suche(idx.de, q).slice(0, 3)));
// 21.11.2026: Widerspruch -> Briefe (Bescheid prüfen, Widerspruch schreiben), Rückforderung -> Brief vom Jobcenter; „Brille“ ohne passendes Ziel (kein Eintrag)
[['Widerspruch', 'brief'], ['Einspruch', 'brief'], ['Rückforderung', 'b-jc'], ['Überzahlung', 'b-jc']].forEach(([q, id]) => check('Deutsch: „' + q + '“ → ' + id, unter('de', q, id, 3), Suche.suche(idx.de, q).slice(0, 3)));
[['en', 'objection', 'brief'], ['tr', 'itiraz', 'brief'], ['ru', 'переплата', 'b-jc'], ['uk', 'заперечення', 'brief'], ['ar', 'اعتراض', 'brief'], ['pl', 'Rückforderung', 'b-jc']].forEach(([l, q, id]) => check(l + ': „' + q + '“ → ' + id, unter(l, q, id, 3), Suche.suche(idx[l], q).slice(0, 3)));
check('Kita-Gebühren findet den Hilfen-Check', unter('de', 'Kita-Gebühren', 'check'), Suche.suche(idx.de, 'Kita-Gebühren'));
check('Pfändung: Konto gepfändet zuerst', erster('de', 'Konto gepfändet') === 'g-konto' && erster('de', 'Pfändung Konto') === 'g-konto');
// Tippfehler, Umlaute, Teilwörter, Groß/Klein
[['Wohngedl', 'l-wohngeld'], ['wohngel', 'l-wohngeld'], ['WOHNGELD', 'l-wohngeld'], ['Kindergled', 'l-kindergeld'], ['Mahnbeschied', 'g-mahn'],
  ['Buergergeld', 'l-ggeld'], ['Burgergeld', 'l-ggeld'], ['Pflegegard', 'p-schaetzen'], ['Strasse', null], ['Kinderzuschlg', 'l-kiz'], ['mahnbesch', 'g-mahn'], ['Schuldnerberatnug', 'g-hilfe'], ['Rundfunkbeitrag', 'l-rundfunk']].forEach(([q, id]) => {
  if (id) check('Tippfehler/Umlaut: „' + q + '“ → ' + id, unter('de', q, id, 2), Suche.suche(idx.de, q).slice(0, 3));
});
check('Ranking: genauer Titel vor Teilwort („Wohngeld“ vor „Wohngeldstelle“)', erster('de', 'Wohngeld') === 'l-wohngeld' && unter('de', 'Wohngeld', 'b-wg', 4));
check('Ranking: höchstens 6 Treffer', Suche.suche(idx.de, 'geld').length <= 6 && Suche.suche(idx.de, 'geld').length >= 3);
check('kurze Eingabe (1 Zeichen) und Unsinn: kein Treffer', Suche.suche(idx.de, 'w').length === 0 && Suche.suche(idx.de, 'xqzjvv').length === 0);
check('Mehrere Wörter mit Füllwörtern: „mein konto ist gepfändet“', erster('de', 'mein Konto ist gepfändet') === 'g-konto', Suche.suche(idx.de, 'mein konto ist gepfändet'));

// Fremdsprachen: Seitentitel der Sprache und Alltagswörter; deutsche Amtswörter gehen auch
const proSprache = {
  en: [['housing benefit', 'l-wohngeld'], ['TV licence', 'l-rundfunk'], ['debt collection', 'g-inkasso'], ['electricty cut off', 'g-strom']],
  fr: [['aide au logement', 'l-wohngeld'], ['sortie scolaire', 'l-but'], ['compte saisi', 'g-konto']],
  tr: [['kira yardımı', 'l-wohngeld'], ['cocuk parasi', 'l-kindergeld'], ['elektrik kesildi', 'g-strom']],
  pl: [['dodatek mieszkaniowy', 'l-wohngeld'], ['wycieczka szkolna', 'l-but'], ['zajecie konta', 'g-konto']],
  ro: [['ajutor pentru chirie', 'l-wohngeld'], ['cont poprit', 'g-konto']],
  ru: [['пособие на жильё', 'l-wohngeld'], ['пособие на жилье', 'l-wohngeld'], ['коллекторы', 'g-inkasso']],
  uk: [['допомога на житло', 'l-wohngeld'], ['жовтий конверт', 'g-mahn']],
  ar: [['مساعدة السكن', 'l-wohngeld'], ['قطع الكهرباء', 'g-strom'], ['رحلة مدرسية', 'l-but']],
  fa: [['کمک اجاره', 'l-wohngeld'], ['قطع برق', 'g-strom']],
  'fa-AF': [['کمک کرایه خانه', 'l-wohngeld'], ['برق قطع شد', 'g-strom']],
  ps: [['د کرایې مرسته', 'l-wohngeld'], ['د ماشومانو پیسې', 'l-kindergeld']],
  so: [['kaalmada kirada', 'l-wohngeld'], ['korontada waa la gooyay', 'g-strom']]
};
Object.keys(proSprache).forEach((l) => proSprache[l].forEach(([q, id]) => check(l + ': „' + q + '“ → ' + id, unter(l, q, id, 2), Suche.suche(idx[l], q).slice(0, 3))));
LANGS.filter((l) => l !== 'de').forEach((l) => {
  check(l + ': Seitentitel der Sprache wird gefunden (Einstellungen)', unter(l, I18N[l]['nav.einst'], 'einst', 3), Suche.suche(idx[l], I18N[l]['nav.einst']).slice(0, 3));
  check(l + ': deutsches Wort „Wohngeld“ geht auch', unter(l, 'Wohngeld', 'l-wohngeld', 3));
});

// Wörterlisten: Deutsch mind. 80, jede Fremdsprache mind. 20; nur bekannte Ziele; Texte su.* in allen Sprachen
const W = Suche.WOERTER, ids = new Set(Suche.ZIELE.map((z) => z[0]));
const zahl = (l) => Object.values(W[l] || {}).reduce((a, v) => a + v.length, 0);
check('Deutsch: mindestens 80 Alltagswörter', zahl('de') >= 80, zahl('de'));
LANGS.filter((l) => l !== 'de').forEach((l) => check(l + ': mindestens 20 Alltagswörter', zahl(l) >= 20, zahl(l)));
Object.keys(W).forEach((l) => Object.keys(W[l]).forEach((id) => check(l + ': Ziel bekannt: ' + id, ids.has(id))));
LANGS.forEach((l) => ['su.label', 'su.suchen', 'su.leeren', 'su.n', 'su.n1', 'su.nichts', 'su.b.leistungen', 'su.b.briefe', 'su.b.mappe'].forEach((k) => check(l + ': Text ' + k, typeof I18N[l][k] === 'string' && I18N[l][k].trim())));
Suche.ZIELE.forEach((z) => LANGS.forEach((l) => { const t = titel(l)(z); check(l + ': Titel für ' + z[0], typeof t === 'string' && t.trim(), z[2]); }));
Object.values(Suche.BEREICHE).forEach((b) => LANGS.forEach((l) => check(l + ': Bereich ' + b[0], I18N[l][b[0]])));

// ---------- DOM ----------
const dist = fs.readFileSync(path.join(ROOT, 'dist', 'sozialleistungslotse.html'), 'utf8');
function starte(sprache) {
  const errors = [], mem = {}, cap = { listener: {} };
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + dist + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      Object.defineProperty(w.navigator, 'languages', { value: [sprache || 'de-DE'], configurable: true });
      w.Capacitor = { Plugins: { App: { addListener: (name, fn) => { cap.listener[name] = fn; return { remove() {} }; }, exitApp: () => {} } } };
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors, mem, cap };
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms || 30));
function tippe(w, d, text) { const f = d.getElementById('suFeld'); f.value = text; f.dispatchEvent(new w.Event('input', { bubbles: true })); }
async function zurueck(d) { const v = d.getElementById('v-' + d.defaultView.__solo.nav().ansicht); const b = [...v.querySelectorAll('[data-nav-zurueck], .pa-zur')].find((x) => !x.closest('[hidden]')); b.click(); await warte(60); }

(async () => {
  const { w, d, errors, mem, cap } = starte();
  await warte(120);
  const feld = d.getElementById('suFeld'), status = d.getElementById('suStatus'), box = d.getElementById('suTreffer');
  const lab = d.querySelector('label[for="suFeld"]');
  const fen = d.getElementById('suFenster'), lupeS = d.getElementById('suLupeStart');
  const sichtbar = (el) => w.getComputedStyle(el).display !== 'none';
  check('Startseite: kein sichtbares Suchfeld, nur die Lupe in der Kopfzeile', fen.hidden && fen.contains(feld) && !d.getElementById('v-start').contains(feld) && lupeS.closest('header.top') && sichtbar(lupeS) && lupeS.getAttribute('aria-label') === 'Suchen');
  lupeS.focus(); lupeS.click(); await warte(30);
  check('Startseite: Lupe öffnet das Such-Fenster, Fokus im Feld', !fen.hidden && d.activeElement === feld);
  check('DOM: Beschriftung „Was suchst du?“ (label) und Platzhalter', lab && lab.textContent === 'Was suchst du?' && feld.placeholder === 'Was suchst du?');
  check('DOM: Suchbereich role=search, Trefferzahl aria-live', d.getElementById('suSuche').getAttribute('role') === 'search' && status.getAttribute('aria-live') === 'polite');
  tippe(w, d, 'Mietzuschuss');
  let zeilen = [...box.querySelectorAll('button.su-zeile')];
  check('DOM: Treffer als Zeilen mit Symbol und Bereich', zeilen.length >= 1 && zeilen.length <= 6 && zeilen[0].querySelector('.zeile-sym svg') && zeilen[0].querySelector('.zeile-st').textContent === 'Hilfen-Check', zeilen.map((z) => z.textContent));
  check('DOM: erster Treffer Wohngeld', zeilen[0].querySelector('b').textContent === 'Wohngeld' && zeilen[0].getAttribute('data-ziel') === 'l-wohngeld');
  check('DOM: Trefferzahl im Status', /Treffer$/.test(status.textContent), status.textContent);
  // Tastatur
  feld.focus();
  feld.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  check('DOM: Pfeil runter springt zum ersten Treffer', d.activeElement === zeilen[0]);
  zeilen[0].dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
  check('DOM: Pfeil hoch zurück ins Feld', d.activeElement === feld);
  // kein Treffer
  tippe(w, d, 'xqzjvvk');
  check('DOM: kein Treffer → Hinweis und Knopf „Welche Hilfen stehen mir zu?“', box.textContent.includes('Nichts gefunden. Versuch ein anderes Wort.') && d.getElementById('suCheck') && d.getElementById('suCheck').textContent === 'Welche Hilfen stehen mir zu?');
  check('DOM: Status meldet „Nichts gefunden“', status.textContent.startsWith('Nichts gefunden'));
  d.getElementById('suCheck').click(); await warte(60);
  check('DOM: Knopf öffnet den Hilfen-Check', w.__solo.nav().ansicht === 'leistungen');
  await zurueck(d);
  check('DOM: Zurück → Startseite mit Such-Fenster (Text bleibt)', w.__solo.nav().ansicht === 'start' && !fen.hidden && feld.value === 'xqzjvvk' && d.activeElement === feld, w.__solo.nav());
  // Leeren und Escape
  d.getElementById('suLeeren').click();
  check('DOM: Leeren-Knopf leert Feld und Treffer', feld.value === '' && box.hidden && d.getElementById('suLeeren').hidden);
  check('DOM: leeres Feld zeigt häufige Begriffe; Tippen sucht danach', (() => { const v = d.getElementById('suVorschlag'), b = v && v.querySelector('button.chip'); if (!b || v.hidden) return false; b.click(); const ok = feld.value === b.textContent && !box.hidden && !!box.querySelector('button[data-ziel]') && v.hidden; d.getElementById('suLeeren').click(); return ok; })());

  // Navigation zu Zielen und zurück
  const ziele = [['gelber Brief', 'g-mahn', 'sparen'], ['Konto gesperrt', 'g-konto', 'sparen'], ['Musterschreiben', 'g-schreiben', 'sparen'], ['Tarife vergleichen', 'g-tarif', 'sparen'],
    ['Haushaltsplan', 'g-haushalt', 'haushalt'], ['Nebenkostenabrechnung', 'b-vm', 'briefe'], ['Jobcenter', 'b-jc', 'briefe'], ['Pflegestufe', 'p-schaetzen', 'pflege'],
    ['Welche Unterstützung', 'p-hilfe', 'pflegestart'], ['Kaution', 'a-vorher', 'ausziehen'], ['PIN', 'e-sicher', 'einst'], ['Fristen', 'o-fristen', 'ordner'],
    ['Lohnpfändung', 'g-lohn', 'pfaendung'], ['Schuldenliste', 'g-liste', 'schulden'], ['Klassenfahrt', 'l-but', 'leistungen'], ['Antragsmappe', 'mappe', 'leistungen'], ['Pflegegutachten prüfen', 'p-gutachten', 'briefe']];
  for (const [q, id, ansicht] of ziele) {
    tippe(w, d, q);
    const z = box.querySelector('button[data-ziel="' + id + '"]');
    check('DOM: „' + q + '“ zeigt ' + id, !!z, [...box.querySelectorAll('button')].map((b) => b.getAttribute('data-ziel')));
    if (!z) continue;
    z.click(); await warte(80);
    const nav = w.__solo.nav();
    check('DOM: ' + id + ' öffnet ' + ansicht, nav.ansicht === ansicht && nav.ebene.tiefe >= 1, nav);
    if (id === 'g-mahn') check('DOM: Mahnbescheid-Seite offen', /dringend-mahn|dringend.*mahn/.test(nav.ebene.pfad) && d.getElementById('spInhalt').textContent.includes('Mahnbescheid'), nav.ebene.pfad);
    if (id === 'b-jc') check('DOM: Jobcenter-Brief offen', nav.ebene.pfad === 'briefe/jc', nav.ebene.pfad);
    if (id === 'e-sicher') check('DOM: Unterseite Sicherheit offen', nav.ebene.pfad === 'einst/sicher' && !d.getElementById('es-sicher').hidden, nav.ebene.pfad);
    if (id === 'a-vorher') check('DOM: Ich ziehe aus → Bevor du ausziehst offen', nav.ebene.pfad === 'ausziehen/offen', nav.ebene.pfad);
    await zurueck(d);
    const n2 = w.__solo.nav();
    check('DOM: Zurück von ' + id + ' → Startseite mit Suche', n2.ansicht === 'start' && !fen.hidden && feld.value === q && box.querySelector('button[data-ziel="' + id + '"]') && d.activeElement === feld, n2);
  }
  feld.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await warte(30);
  check('DOM: Esc schließt das Fenster auf der Startseite, Fokus auf die Lupe', fen.hidden && d.activeElement === lupeS);
  // Danach öffnet die Startkachel „Geld und Schulden“ wieder die Übersicht (kein alter Unterstand)
  d.getElementById('goGeld').click(); await warte(60);
  check('DOM: Startkachel Geld danach auf der obersten Ebene', w.__solo.nav().ebene.pfad === 'sparen', w.__solo.nav().ebene.pfad);
  await zurueck(d);
  // Lupe auf allen anderen Seiten: Such-Fenster mit demselben Feld
  const lupe = d.getElementById('suLupe');
  check('Lupe: auf der Startseite nur eine Lupe (die in der Kopfzeile)', w.__solo.nav().ansicht === 'start' && !sichtbar(lupe) && sichtbar(lupeS));
  check('Lupe: aria-label „Suchen“', lupe.getAttribute('aria-label') === 'Suchen' && fen.getAttribute('role') === 'dialog' && fen.getAttribute('aria-modal') === 'true');
  d.getElementById('goGeld').click(); await warte(60);
  d.querySelector('#spInhalt .gs-inkasso').click(); await warte(60);
  const vorher = w.__solo.nav().ebene.pfad;
  check('Lupe: sichtbar auf Unterseite', sichtbar(lupe) && vorher === 'sparen/inkasso', vorher);
  lupe.focus(); lupe.click(); await warte(30);
  check('Lupe: Fenster offen, Fokus im Feld, Feld im Fenster', !fen.hidden && d.activeElement === feld && fen.contains(feld) && d.getElementById('inhalt').inert);
  feld.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await warte(30);
  check('Lupe: Esc schließt, Seite bleibt, Fokus zurück auf Lupe, Feld wieder auf der Startseite', fen.hidden && w.__solo.nav().ebene.pfad === vorher && d.activeElement === lupe && fen.contains(feld) && !d.getElementById('inhalt').inert, [w.__solo.nav().ebene.pfad, d.activeElement && d.activeElement.id]);
  lupe.click(); await warte(30);
  cap.listener.backButton(); await warte(60);
  check('Lupe: Android-Zurück schließt nur das Fenster', fen.hidden && w.__solo.nav().ebene.pfad === vorher, w.__solo.nav().ebene.pfad);
  lupe.click(); await warte(30);
  d.getElementById('suZu').click(); await warte(30);
  check('Lupe: „← Zurück“ im Fenster schließt es', fen.hidden && w.__solo.nav().ebene.pfad === vorher);
  lupe.click(); await warte(30);
  tippe(w, d, 'Klassenfahrt');
  const tb = fen.querySelector('button[data-ziel="l-but"]');
  check('Lupe: dieselben Treffer im Fenster', !!tb);
  tb.click(); await warte(100);
  check('Lupe: Treffer öffnet die Seite und schließt das Fenster', fen.hidden && w.__solo.nav().ansicht === 'leistungen', w.__solo.nav());
  await zurueck(d);
  check('Lupe: Zurück vom Treffer → Startseite mit Suche', w.__solo.nav().ansicht === 'start' && feld.value === 'Klassenfahrt' && !fen.hidden, w.__solo.nav());
  d.getElementById('suZu').click(); await warte(30);
  // Einstellungen und Mein Ordner (Leiste unten), tiefere Ebene
  d.querySelector('#appnav button[data-ansicht="einst"]').click(); await warte(60);
  d.querySelector('#einstListe .zeile[data-seite="sicher"]').click(); await warte(60);
  check('Lupe: in Einstellungen → Sicherheit sichtbar', sichtbar(lupe) && w.__solo.nav().ebene.pfad === 'einst/sicher');
  lupe.click(); await warte(30); tippe(w, d, 'Mahnbescheid');
  fen.querySelector('button[data-ziel="g-mahn"]').click(); await warte(100);
  check('Lupe: aus Einstellungen zum Mahnbescheid', w.__solo.nav().ebene.pfad.indexOf('sparen/dringend') === 0, w.__solo.nav().ebene.pfad);
  await zurueck(d);
  check('Lupe: danach Zurück → Start', w.__solo.nav().ansicht === 'start');
  d.getElementById('suZu').click(); await warte(30);
  // Import „Von der Beratung bekommen“ (Mein Ordner, Hauptseite): Treffer öffnet Mein Ordner mit aufgeklapptem Import
  lupe.click(); await warte(30); tippe(w, d, 'SoLo-Datei');
  const zi = fen.querySelector('button[data-ziel="o-import"]'); if (zi) { zi.click(); await warte(100); }
  check('[rot-d] DOM: „SoLo-Datei“ öffnet Mein Ordner mit aufgeklapptem Import', !!zi && w.__solo.nav().ansicht === 'ordner' && d.getElementById('kwImport').open, w.__solo.nav());
  check('DOM: Suchbegriffe werden nicht gespeichert', !Object.values(mem).some((v) => /Lohnpf|Antragsmappe|xqzjvvk/.test(v)), Object.keys(mem));
  check('DOM: keine Fehler', errors.length === 0, errors);

  // Arabisch: RTL, Titel und Bereich in der Sprache
  const a = starte('ar');
  await warte(120);
  const fa = a.d.getElementById('suFeld');
  a.d.getElementById('suLupeStart').click(); await warte(30);
  check('RTL: Seite dir=rtl, Platzhalter arabisch', a.d.documentElement.getAttribute('dir') === 'rtl' && fa.placeholder === I18N.ar['su.label'], fa.placeholder);
  tippe(a.w, a.d, 'مساعدة السكن');
  const az = a.d.querySelector('#suTreffer button.su-zeile');
  check('RTL: Treffer in Arabisch', az && az.getAttribute('data-ziel') === 'l-wohngeld' && az.querySelector('b').textContent === I18N.ar['n.wohngeld'], az && az.textContent);
  check('RTL: keine Fehler', a.errors.length === 0, a.errors);

  console.log(fehler ? `\n${fehler} von ${n} Prüfungen fehlgeschlagen` : `Suche-Test bestanden: ${n} Prüfungen`);
  process.exit(fehler ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
