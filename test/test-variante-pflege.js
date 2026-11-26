// Variante „SoLo Pflege“ (VARIANTE=pflege, scripts/build.js): baut die Variante im Speicher und prüft in JSDOM
// Startseite (zwei Einstiege, weggefallene Kacheln aus), Ansicht „sen“ mit Zurück, Kartenfilter, Fragen ohne Kinder/Arbeit/Ausbildung,
// große Schrift beim ersten Start, Telefonnummern als tel:-Links, Suche ohne weggefallene Ziele. Dazu: Grundfassung ohne Variantenteile.
// Aufruf: node test/test-variante-pflege.js
'use strict';
const { JSDOM } = require('jsdom');
const path = require('path');
const { render, VARIANTEN } = require(path.join(__dirname, '..', 'scripts', 'build.js'));

let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : x); } else console.log('ok  ', n); };

const solo = render({ variante: 'solo' });
check('Grundfassung: keine Teile der Pflege-Variante', !/goSelbst|id="v-sen"|VAR-START|VAR-ANSICHT|VAR-STIL|VARJS|VAR-PFLEGE|var-einstiege/.test(solo.html));
check('Grundfassung: Variante „solo“', solo.variante.id === 'solo' && /var VARIANTE = (\/\*VARIANTE\*\/)? *'solo';/.test(solo.html));
check('Name, App-Kennung und Datei der Variante an einer Stelle', VARIANTEN.pflege.name === 'SoLo Pflege & Rente' && VARIANTEN.pflege.kurzname === 'SoLo Pflege' && VARIANTEN.pflege.appId === 'com.Sozialleistungslotse.pflege' && VARIANTEN.pflege.datei === 'solo-pflege.html');

const gebaut = render({ variante: 'pflege' });
const I18N = new Function(gebaut.i18n.replace('if (typeof module !== "undefined") module.exports = I18N;', '') + '; return I18N;')();
const de = I18N.de;
const appQuelle = require('fs').readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8') + require('fs').readFileSync(path.join(__dirname, '..', 'src', 'variante', 'pflege.html'), 'utf8');
const svFehlt = [...new Set([...appQuelle.matchAll(/(?:t\('|data-t=")(sv\.[\w.]+)/g)].map((m) => m[1]).concat([...appQuelle.matchAll(/'(sv\.[\w.]+)'/g)].map((m) => m[1])))].filter((k) => !(k in de));
check('Pflege: alle Texte sv.* vorhanden (src/lang/sen-ui/de.json)', svFehlt.length === 0, svFehlt);
check('Pflege: Variante im Code gesetzt', /var VARIANTE = "pflege";/.test(gebaut.html));
check('Pflege: ohne „Ich ziehe aus“ und Haushaltsplan (Startgröße)', !/var Ausziehen = /.test(gebaut.html) && !/var Haushalt = /.test(gebaut.html));
const start = Buffer.byteLength(gebaut.html.replace(/<script type="application\/json" id="solo-sprache-[^"]+">[^<]*<\/script>\n/g, ''), 'utf8');
check('Pflege: beim Start geparster Teil unter 3 MB', start < 3 * 1024 * 1024, (start / 1024).toFixed(0) + ' KB');

function app(store) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + gebaut.html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.org/',
    beforeParse(w) {
      w.__SOLO_TEST__ = true;
      w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
      w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {}; w.print = function () { w.__gedruckt = true; };
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
    }
  });
  return { w: dom.window, d: dom.window.document, errors };
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms || 5));

(async () => {
  const store = {};
  const { w, d, errors } = app(store);
  const $ = (id) => d.getElementById(id);
  const ansicht = () => $('app').getAttribute('data-ansicht');
  const sichtbar = (el) => !!el && !el.hidden && !el.classList.contains('var-aus') && !el.closest('.var-aus, [hidden]');
  await warte(20);
  check('Keine Skriptfehler beim Laden', errors.length === 0, errors.join('; '));
  check('Klasse var-pflege am Dokument', d.documentElement.classList.contains('var-pflege'));
  check('Erster Start: große Schrift an', d.documentElement.classList.contains('big') && $('bigBtn').getAttribute('aria-checked') === 'true');
  check('Titel „SoLo Pflege & Rente“', /SoLo\s*Pflege & Rente/.test(d.querySelector('h1 .titel').textContent));
  check('Startseite: zwei große Einstiege', sichtbar($('goSelbst')) && sichtbar($('goAngeh')) && $('goSelbst').textContent.includes(de['sv.selbst']) && $('goAngeh').textContent.includes(de['sv.angeh']));
  // Wunsch David 24.11.2026: Startseite nur mit den zwei Einstiegen (alle übrigen Ziele über die Unterseiten, siehe unten „Inventur“)
  const startKnoepfe = [...$('v-start').querySelectorAll('button, a')].filter((b) => sichtbar(b) && !b.closest('#firstNotice')).map((b) => b.id); // Erststart-Hinweis (rechtlich nötig, nur beim ersten Start) ausgenommen
  check('Startseite: nur die zwei Einstiege (keine Kacheln, keine Telefon-Karte, keine Datenschutz-Zeile)', startKnoepfe.join() === 'goSelbst,goAngeh' && !$('varSprechen') && !$('goGeldAlter'), startKnoepfe);
  check('Startseite: alle alten Kacheln ausgeblendet', ['goLeistungen', 'goPflege', 'goBriefe', 'goGeld', 'goAusziehen', 'startSicher'].every((id) => !sichtbar($(id))));

  // Ansicht „sen“
  $('goSelbst').click();
  check('Ich brauche selbst Hilfe: eigene Seite', ansicht() === 'sen' && $('h-sen').textContent === de['sv.selbst']);
  const knoepfe = () => [...$('senInhalt').querySelectorAll('.weg-liste .weg')].filter((b) => !b.hidden).map((b) => b.id);
  check('Selbst: Check, Einschätzen, Antrag, Pflegekasse, Geld, Brief', knoepfe().join() === 'sen-selbst-check,sen-selbst-schaetzen,sen-selbst-antrag,sen-selbst-pflege,sen-selbst-geld,sen-selbst-brief', knoepfe());
  check('Selbst: Karte „Lieber mit jemandem sprechen?“ mit Bürgertelefon', !!$('senInhalt').querySelector('#varSprechen a.var-tel[href^="tel:"]') && !!$('varSprechenMehr'));
  check('Ausdrucken sichtbar', !!$('senInhalt').querySelector('.sen-druck button'));
  $('senInhalt').querySelector('.sen-druck button').click();
  check('Ausdrucken öffnet den Druck (Browser)', w.__gedruckt === true);
  $('sen-selbst-check').click();
  check('„Welche Hilfen stehen mir zu?“: Übersicht aus src/senioren.js', $('h-sen').textContent === de['sv.k.check'] && !!$('senInhalt').querySelector('.sen-inhalt [data-karte="gsa"]'));
  check('„Was steht mir zu?“: antippbare Zeilen in Gruppen, Check-Knopf oben', $('senInhalt').querySelectorAll('.sen-inhalt button.weg[data-karte]').length >= 12 && $('senInhalt').querySelector('.sen-inhalt button').getAttribute('data-sen-ziel') === 'check');
  const nav = $('senInhalt').querySelector('.sen-inhalt [data-sen-ziel="check"]');
  if (nav) nav.click();
  check('… Knopf führt zum Leistungs-Check', ansicht() === 'leistungen');
  await warte(50); d.querySelector('#appnav button[data-ansicht="start"]').click(); await warte(50);
  $('goSelbst').click(); await warte(50);
  $('sen-selbst-antrag').click(); await warte(50);
  check('Unterseite Pflegegrad beantragen mit Schritten aus src/senioren.js', $('h-sen').textContent === de['sv.antrag'] && $('senInhalt').querySelectorAll('.sen-inhalt .sen-schritte > li').length === 7);
  const zur = () => d.querySelector('#v-sen [data-nav-zurueck]');
  zur().click(); await warte(30);
  check('Zurück: wieder „Ich brauche selbst Hilfe“', ansicht() === 'sen' && $('h-sen').textContent === de['sv.selbst']);
  zur().click(); await warte();
  check('Zurück: Startseite', ansicht() === 'start');
  $('goAngeh').click();
  check('Ich pflege einen Angehörigen: zuerst Hilfen für Angehörige', ansicht() === 'sen' && knoepfe()[0] === 'sen-angeh-hilfen');
  check('Angehörige: Hilfen, Einschätzen, Antrag, Pflegekasse, Check, Brief', knoepfe().join() === 'sen-angeh-hilfen,sen-angeh-schaetzen,sen-angeh-antrag,sen-angeh-pflege,sen-angeh-check,sen-angeh-brief', knoepfe());
  check('Angehörige: Karte „Lieber mit jemandem sprechen?“ mit Bürgertelefon', !!$('senInhalt').querySelector('#varSprechen a.var-tel[href^="tel:"]'));
  $('varSprechenMehr').click(); await warte(20);
  check('„Mehr Wege zur Beratung“ öffnet „Hilfe am Telefon“, Zurück führt zu den Angehörigen', $('h-sen').textContent === de['sen.ang.hilfe.h'] && (zur().click(), $('h-sen').textContent === de['sv.angeh']));
  $('sen-angeh-brief').click(); await warte(20);
  check('Angehörige: Brief prüfen öffnet die Briefe', ansicht() === 'briefe');
  d.querySelector('#appnav button[data-ansicht="start"]').click(); await warte(20);
  $('goAngeh').click(); await warte(20);
  $('sen-angeh-hilfen').click();
  check('Hilfen für Angehörige: oben „Die 3 wichtigsten Schritte“, darunter vier Gruppen', $('h-sen').textContent === de['sv.hilfen'] && !$('senInhalt').querySelector('.sen-platzhalter') &&
    $('senInhalt').querySelectorAll('.sen-top3 .sen-schritte > li').length === 3 && $('senInhalt').querySelectorAll('.sen-inhalt [data-sen-ziel^="sen-ang-"]').length === 4);
  check('Vorlesen-Knopf auf der Seite', !!d.querySelector('#v-sen .vl-knopf'));
  $('senInhalt').querySelector('[data-sen-ziel="sen-ang-hilfe"]').click(); await warte(20);
  check('Gruppe „Hilfe am Telefon“: Bürgertelefon als Knopf mit tel:-Link', $('h-sen').textContent === de['sen.ang.hilfe.h'] && !!$('senInhalt').querySelector('a.sen-tel-knopf[href^="tel:"]'));
  zur().click(); await warte(); zur().click(); await warte(); zur().click(); await warte();
  check('Zurück aus den Angehörigen-Seiten: Startseite', ansicht() === 'start');
  $('goSelbst').click(); await warte(20);
  $('sen-selbst-geld').click(); await warte(20);
  check('Geld im Alter: Check, Brief und Schuldnerberatung', knoepfe().join() === 'sen-geld-check,sen-geld-brief' && !!$('sen-sb') && /meine-schulden\.de/.test($('sen-sb').href));
  $('sen-geld-check').click();
  check('Check aus „Geld im Alter“ öffnet die Leistungen', ansicht() === 'leistungen');
  await warte(20);
  check('Leistungs-Check: Frage für Frage als Standard (erste Frage)', !!$('sfFrage') && $('sfFrage').textContent === de['sf.q.adults'], ($('sfFrage') || {}).textContent);
  const opt = [...$('schritte').querySelectorAll('[data-i]')].find((x) => x.textContent.trim() === de['sux.a.allein']);
  opt.click(); await warte(20);
  // Seit 25.11.2026: eine Frage nach Kindern unter 25 (Auftrag David); bei „Nein“ weiter mit dem Geburtsjahr
  check('Nach „allein“: Frage nach Kindern unter 25', $('sfFrage').textContent === de['sux.q.kinder'], $('sfFrage').textContent);
  [...$('schritte').querySelectorAll('[data-i]')].find((x) => x.textContent.trim() === de['sf.a.nein']).click(); await warte(20);
  check('Kinder „Nein“: weiter mit dem Geburtsjahr', $('sfFrage').textContent === de['sf.q.geb'], $('sfFrage').textContent);
  check('Formular: Felder zu Schwangerschaft, Elterngeld ausgeblendet', ['schwanger', 'baby', 'egVor', 'kindKrank', 'unterhaltFehlt', 'uvgWechsel'].every((id) => $(id).closest('.var-aus')));
  check('Formular: Felder zu Kindern sichtbar', ['kids', 'kidsU6', 'kids14', 'young', 'waisen', 'kindEink'].every((id) => !$(id).closest('.var-aus')));
  check('Formular: Abschnitte Arbeit und Ausbildung ausgeblendet', $('arbeitSit').closest('fieldset').classList.contains('var-aus') && $('ausbildung').closest('fieldset').classList.contains('var-aus'));
  check('Formular: Pflegegrad, Erwerbsminderung, Geburtsjahr bleiben', ['pflegegrad', 'emStd', 'gebJahr', 'miete'].every((id) => !$(id).closest('.var-aus')));

  // Kartenfilter: Rentnerin mit Pflegegrad 2, kleine Rente (Rechnung unverändert, Anzeige gefiltert)
  w.__solo.set({ adults: 1, kids: 0, gebJahr: 1950, ek1Art: 'rente', ek1Brutto: 900, ek1Netto: 800, miete: 450, heizkosten: 60, mietstufe: '3', pflegegrad: '2', vermoegen: 1000 });
  await warte(20);
  const V = w.__soloVariante;
  const roh = w.__solo.eval(), gef = V.filter(roh);
  check('Rechnung selbst unverändert (alle Karten)', roh.results.length > gef.results.length && roh.results.some((r) => r.id === 'kindergeld'));
  check('Anzeige nur mit Karten der Variante', gef.results.length > 0 && gef.results.every((r) => V.karten.includes(r.id)), gef.results.map((r) => r.id));
  check('Grundsicherung im Alter, Wohngeld und Pflege bleiben', ['gsa', 'wohngeld', 'pflege'].every((id) => gef.results.some((r) => r.id === id)));
  check('Zwei Wege nur, wenn beide Seiten in der Variante', !gef.wege || gef.wege.a.concat(gef.wege.b).every((id) => V.karten.includes(id)));
  const karten = [...d.querySelectorAll('#cards article[data-id]')].map((a) => a.getAttribute('data-id'));
  check('Ergebnisliste zeigt keine weggefallenen Karten', karten.length > 0 && karten.every((id) => V.karten.includes(id)), karten);

  // Telefonnummern
  const nr = (s) => V.telNummern(s).map((x) => x.tel);
  check('Telefon: 030 340 60 66-02', nr('Ruf an: 030 340 60 66-02.').join() === '03034060660' + '2');
  check('Telefon: 0800 1234567 und +49 911 123456', nr('Tel. 0800 1234567 oder +49 911 123456').join() === '08001234567,+49911123456');
  check('Kein Telefon: PLZ, Datum, Betrag, IBAN', nr('01067 Dresden, 01.07.2025, 1.230 €, DE12 0123 4567 8901').length === 0, nr('01067 Dresden, 01.07.2025, 1.230 €, DE12 0123 4567 8901'));
  const p = d.createElement('p'); p.textContent = 'Pflegetelefon: 030 20179131 (Mo–Do)'; $('senInhalt').appendChild(p);
  await warte(20);
  const a = p.querySelector('a[href^="tel:"]');
  check('Telefonnummer im Text wird zum tel:-Link', !!a && a.getAttribute('href') === 'tel:03020179131' && p.textContent === 'Pflegetelefon: 030 20179131 (Mo–Do)');

  // Suche
  check('Suche: ohne weggefallene Ziele', w.Suche && w.Suche.index({ lang: 'de', titel: (z) => z[2], erlaubt: (id) => w.__soloVariante && id !== 'a-geld' }).length < w.Suche.ZIELE.length);

  check('Keine Skriptfehler im Ablauf', errors.length === 0, errors.join('; '));
  console.log(fails ? fails + ' Fehler' : 'Variante Pflege: alles ok');
  process.exit(fails ? 1 : 0);
})();
