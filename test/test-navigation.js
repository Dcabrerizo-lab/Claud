// Einheitliche Navigation (src/navigation.js) in der echten Oberfläche (dist, JSDOM), Marke [nav]:
// - jede Ansicht und jede Unterseite (außer Start und den Leisten-Bereichen Mein Ordner / Einstellungen) hat genau EINEN
//   sichtbaren Zurück-Knopf: Textknopf „← Zurück“ (linkbtn pa-zur) oben links in einer Kopfzeile, vor der Überschrift
// - der Knopf führt genau eine Ebene hoch; Android-Zurück-Taste und Browser-Zurück machen dasselbe; Vorwärts öffnet die Ebene wieder
// - Baustein: kopfHtml/kopf/vorlage
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const Navigation = require('../src/navigation.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL [nav] ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const warte = (ms) => new Promise((r) => setTimeout(r, ms || 30));

// ---------- Baustein ----------
{
  const h = Navigation.kopfHtml({ id: 'x1', cls: 'us-zurueck', kid: 'k1' });
  check('kopfHtml: Kopfzeile, Textknopf, Pfeil, Text', /^<div class="pa-zeile nav-kopf" id="k1"><button type="button" class="linkbtn pa-zur us-zurueck" id="x1" data-nav-zurueck>/.test(h) && /data-t="nav.zurueck">Zurück</.test(h), h);
  check('kopfHtml: keine fremden Zeichen in Attributen', !/<script/.test(Navigation.kopfHtml({ id: '"><script>' })));
  check('vorlage: Marken ersetzt', Navigation.vorlage('a<!--ZURUECK-->b<!--ZURUECK id=piZurueck-->c').split('data-nav-zurueck').length === 3 && !/<!--ZURUECK/.test(Navigation.vorlage('<!--ZURUECK cls=us-zurueck-->')));
  const dom = new JSDOM('<!doctype html><body></body>');
  const el = Navigation.kopf(dom.window.document, (k) => (k === 'nav.zurueck' ? 'Back' : k), { id: 'b' });
  check('kopf(): Element mit „← Back“', el.querySelector('button.linkbtn.pa-zur[data-nav-zurueck]#b') && el.textContent === '← Back', el.textContent);
}

// ---------- Quelltext und fertige Seite: kein umrandeter Zurück-Knopf ----------
{
  const src = ['app.js', 'ausziehen.js', 'schulden.js', 'haushalt.js', 'fristen.js', 'template.html'].map((f) => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8')).join('\n');
  const alt = src.split('\n').filter((z) => /(btn ghost|class="chip"|'chip')[^\n]{0,160}(zurueck|\.close|Zurück)/.test(z));
  check('Quelltext: kein „btn ghost“/Chip mit Zurück- oder Schließen-Text', alt.length === 0, alt.map((z) => z.trim().slice(0, 140)));
  const dom = new JSDOM(html);
  const d = dom.window.document;
  for (const [id, knopf] of [['legal', 'legalClose'], ['mappe', 'mappeClose'], ['ergBlatt', 'ebClose']]) {
    const b = d.querySelector('#' + id + ' button');
    check('Blatt #' + id + ': erster Knopf ist „← Zurück“ oben (#' + knopf + ')', b && b.id === knopf && b.classList.contains('pa-zur') && b.classList.contains('linkbtn') && b.parentElement.classList.contains('nav-kopf'), b && b.outerHTML.slice(0, 120));
  }
}

// ---------- Oberfläche ----------
function starte() {
  const errors = [], mem = {}, cap = { listener: {}, exit: 0 };
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
      // nur das App-Plugin (Zurück-Taste), damit der Listener der App angemeldet wird
      w.Capacitor = { Plugins: { App: { addListener: (name, fn) => { cap.listener[name] = fn; return { remove() {} }; }, exitApp: () => { cap.exit++; } } } };
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors, cap };
}
function sichtbar(el, bis) { for (let e = el; e && e !== bis.parentNode; e = e.parentElement) if (e.hidden) return false; return true; }
function zurueckKnoepfe(d, w) {
  const v = d.getElementById('v-' + w.__solo.nav().ansicht);
  return [...v.querySelectorAll('.pa-zur, [data-nav-zurueck]')].filter((b) => sichtbar(b, v));
}
// Kein Zurück-Knopf mit anderem Aussehen (z. B. „btn ghost“ oder Chip) irgendwo auf dem Bildschirm
const ZUR_TEXT = /^\s*([←→]\s*)?(Zurück|Mappe schließen|Antworten ändern)|^\s*[←→]\s*Anderer Brief/;
function andereZurueck(d) {
  return [...d.querySelectorAll('button')].filter((b) => ZUR_TEXT.test(b.textContent) && sichtbar(b, d.documentElement) &&
    !(b.classList.contains('linkbtn') && b.classList.contains('pa-zur'))).map((b) => (b.id || '') + ' ' + b.className + ' ' + b.textContent.trim());
}
function pruefeKnopf(name, s) {
  check(name + ': kein Zurück-Knopf mit anderem Aussehen', andereZurueck(s.d).length === 0, andereZurueck(s.d));
  const { d, w } = s, v = d.getElementById('v-' + w.__solo.nav().ansicht), k = zurueckKnoepfe(d, w);
  check(name + ': genau ein sichtbarer Zurück-Knopf', k.length === 1, k.map((b) => b.className + ' ' + b.textContent));
  const b = k[0]; if (!b) return null;
  check(name + ': Textknopf „← Zurück“ (linkbtn pa-zur) in einer Kopfzeile', b.tagName === 'BUTTON' && b.classList.contains('linkbtn') && b.classList.contains('pa-zur') &&
    b.textContent.replace(/\s+/g, ' ').trim() === '← Zurück' && b.parentElement.classList.contains('pa-zeile'), b.outerHTML.slice(0, 160));
  const h = [...v.querySelectorAll('h2, h3, .pf-frage')].filter((x) => sichtbar(x, v))[0];
  check(name + ': steht oben (vor der Überschrift)', !h || (b.compareDocumentPosition(h) & 4), h && h.outerHTML.slice(0, 80));
  return b;
}
const klick = (s, el) => el.dispatchEvent(new s.w.MouseEvent('click', { bubbles: true, cancelable: true }));
const hash = (s, a) => { s.w.location.hash = '#' + a; s.w.dispatchEvent(new s.w.HashChangeEvent('hashchange')); };
const start = (s) => klick(s, s.d.querySelector('#appnav [data-ansicht=start]'));

(async () => {
  const s = starte(); await warte(200);
  const { w, d } = s, $ = (id) => d.getElementById(id), nav = () => w.__solo.nav();
  try {
    w.__solo.lang('de'); await warte();
    check('Start: Tiefe 0, kein Zurück-Knopf', nav().ebene.tiefe === 0 && zurueckKnoepfe(d, w).length === 0, nav());

    // Fälle: öffnen, erwartete Ansicht danach, erwartete Ansicht nach „Zurück“
    const faelle = [
      ['Leistungen', () => klick(s, $('goLeistungen')), 'leistungen', 'start'],
      ['Brief: Absender-Auswahl', () => klick(s, $('goBriefe')), 'briefe', 'start'],
      ['Brief: Kachel Jobcenter', () => { klick(s, $('goBriefe')); klick(s, $('brief-jc')); }, 'briefe', 'briefe'],
      ['Geld und Schulden', () => klick(s, $('goGeld')), 'sparen', 'start'],
      ['Geld: Es ist dringend', () => { klick(s, $('goGeld')); klick(s, d.querySelector('#spInhalt .gs-dringend')); }, 'sparen', 'sparen'],
      ['Geld: Dringend – Konto gepfändet', () => { klick(s, $('goGeld')); klick(s, d.querySelector('#spInhalt .gs-dringend')); klick(s, d.querySelector('#spInhalt .gs-d-konto')); }, 'sparen', 'sparen'],
      ['Geld: Sparen im Alltag', () => { klick(s, $('goGeld')); klick(s, d.querySelector('#spInhalt .gs-sparen')); }, 'sparen', 'sparen'],
      ['Geld: Sparen – Thema', () => { klick(s, $('goGeld')); klick(s, d.querySelector('#spInhalt .gs-sparen')); klick(s, d.querySelector('#spInhalt .gs-t-strom')); }, 'sparen', 'sparen'],
      ['Geld: Kostenlose Hilfe', () => { klick(s, $('goGeld')); klick(s, d.querySelector('#spInhalt .gs-hilfe')); }, 'sparen', 'sparen'],
      ['Geld: Was bleibt mir? (Pfändung)', () => { klick(s, $('goGeld')); klick(s, d.querySelector('#spInhalt .gs-bleibt')); }, 'pfaendung', 'sparen'],
      ['Pfändung (direkt)', () => hash(s, 'pfaendung'), 'pfaendung', 'start'],
      ['Haushaltsplan', () => hash(s, 'haushalt'), 'haushalt', 'start'],
      ['Schulden-Liste', () => hash(s, 'schulden'), 'schulden', 'start'],
      ['Ich ziehe aus', () => klick(s, $('goAusziehen')), 'ausziehen', 'start'],
      ['Ich ziehe aus: Unterseite', () => { klick(s, $('goAusziehen')); klick(s, d.querySelector('[data-az-geh]')); }, 'ausziehen', 'ausziehen'],
      ['Pflege-Auswahl', () => klick(s, $('goPflege')), 'pflegestart', 'start'],
      ['Pflege: Pflegegrad wählen', () => { klick(s, $('goPflege')); klick(s, $('pu-hilfe')); }, 'pflegestart', 'pflegestart'],
      ['Pflegegrad selbst einschätzen', () => { klick(s, $('goPflege')); klick(s, $('pu-schaetzen')); }, 'pflege', 'pflegestart'],
      ['Erklärseite Pflege', () => { klick(s, $('goLeistungen')); hash(s, 'pflegeinfo'); }, 'pflegeinfo', null],
      ['Einstellungen: Anzeige', () => w.__solo.unterseite('einst', 'anzeige'), 'einst', 'einst'],
      ['Einstellungen: Sicherheit', () => w.__solo.unterseite('einst', 'sicher'), 'einst', 'einst'],
      ['Einstellungen: Fachleute', () => w.__solo.unterseite('einst', 'fach'), 'einst', 'einst'],
      ['Einstellungen: Erinnern', () => w.__solo.unterseite('einst', 'erinnern'), 'einst', 'einst'],
      ['Einstellungen: Über', () => w.__solo.unterseite('einst', 'about'), 'einst', 'einst'],
      ['Mein Ordner: Fristen', () => w.__solo.unterseite('ordner', 'fristen'), 'ordner', 'ordner'],
      ['Mein Ordner: Alle Haushalte', () => w.__solo.unterseite('ordner', 'alle'), 'ordner', 'ordner']
    ];
    for (const [name, oeffne, ansicht, danach] of faelle) {
      start(s); await warte();
      oeffne(); await warte();
      const e0 = nav();
      check(name + ': Ansicht ' + ansicht, e0.ansicht === ansicht, e0);
      const b = pruefeKnopf(name, s); if (!b) continue;
      klick(s, b); await warte(60);
      const e1 = nav();
      check(name + ': „← Zurück“ führt eine Ebene hoch', e1.ebene.tiefe === e0.ebene.tiefe - 1 && (danach == null || e1.ansicht === danach), [e0, e1]);
      check(name + ': Verlauf folgt (Tiefe ' + e1.ebene.tiefe + ')', w.Navigation.tiefe() === e1.ebene.tiefe, w.Navigation.stand());
    }
    check('Leisten-Bereiche ohne Zurück-Knopf (Mein Ordner, Einstellungen)', (() => { start(s); klick(s, d.querySelector('#appnav [data-ansicht=ordner]')); const a = zurueckKnoepfe(d, w).length; klick(s, d.querySelector('#appnav [data-ansicht=einst]')); return a === 0 && zurueckKnoepfe(d, w).length === 0; })());

    // Browser-Zurück und Vorwärts über die History API
    start(s); await warte(80);
    klick(s, $('goGeld')); await warte();
    const thema = d.querySelector('#spInhalt button.sk, #spInhalt button');
    klick(s, thema); await warte();
    const tief = nav();
    check('Geld und Schulden → Bereich: zwei Ebenen tief, zwei Verlaufseinträge', tief.ebene.tiefe === 2 && w.Navigation.stand().k === 2, [tief, w.Navigation.stand()]);
    w.history.back(); await warte(80);
    check('Browser-Zurück: eine Ebene hoch (Kacheln)', nav().ansicht === 'sparen' && nav().ebene.tiefe === 1, nav());
    w.history.forward(); await warte(80);
    check('Browser-Vorwärts: Bereich wieder offen', nav().ebene.pfad === tief.ebene.pfad, [nav(), tief]);
    w.history.back(); await warte(80); w.history.back(); await warte(80);
    check('Browser-Zurück zweimal: Start', nav().ansicht === 'start' && w.Navigation.stand().k === 0, [nav(), w.Navigation.stand()]);

    // Android-Zurück-Taste: Blatt zuerst, dann Ebene, auf Start beenden
    const taste = s.cap.listener.backButton;
    check('Android: Zurück-Taste angemeldet', typeof taste === 'function');
    if (taste) {
      klick(s, $('goPflege')); await warte(); klick(s, $('pu-hilfe')); await warte();
      taste(); await warte(60);
      check('Android: Pflegegrad-Wahl → Pflege-Auswahl', nav().ebene.pfad === 'pflegestart', nav());
      taste(); await warte(60);
      check('Android: → Start', nav().ansicht === 'start', nav());
      w.__solo.unterseite('einst', 'anzeige'); await warte();
      taste(); await warte(60);
      check('Android: Unterseite → Liste der Einstellungen', nav().ebene.pfad === 'einst', nav());
      klick(s, $('legalBtn2')); await warte();
      const legalOffen = !$('legal').hidden;
      taste(); await warte(60);
      check('Rechtliches: kein anderer Zurück-Knopf', legalOffen && andereZurueck(d).length === 0, andereZurueck(d));
      check('Android: offener Dialog wird zuerst geschlossen', legalOffen && $('legal').hidden && nav().ebene.pfad === 'einst', nav());
      taste(); await warte(60); taste(); await warte(60);
      check('Android: auf der Startseite App beenden', nav().ansicht === 'start' && s.cap.exit === 1, s.cap.exit);
    }
    // einfache Version: Schritt zurück oben mit demselben Knopf, dann kein zweiter Zurück-Knopf der Seite
    start(s); await warte(); klick(s, $('goLeistungen')); await warte();
    klick(s, $('einfachBtn')); await warte();
    const vor = nav().ebene.tiefe;
    if ($('es-in')) { $('es-in').value = '1980'; $('es-in').dispatchEvent(new w.Event('input', { bubbles: true })); }
    const weiter = $('es-weiter') || d.querySelector('#einfach .es-opt, #einfach .es-btn');
    if (weiter) { klick(s, weiter); await warte(); }
    if ($('es-zurueck')) {
      pruefeKnopf('Einfache Version: Frage 2', s);
      klick(s, $('es-zurueck')); await warte(60);
      check('Einfache Version: Schritt zurück', nav().ebene.tiefe === vor && !$('es-zurueck'), [vor, nav()]);
      check('Einfache Version: auf Frage 1 wieder der Zurück-Knopf der Seite', !$('leistungenKopf').hidden);
    } else check('Einfache Version: zweite Frage erreicht', false, $('einfach').innerHTML.slice(0, 200));
    klick(s, $('es-raus')); await warte();
    check('keine Skriptfehler', s.errors.length === 0, s.errors);
  } catch (e) { fehler++; console.log('FAIL [nav] Ausnahme', e && e.stack); }
  console.log((fehler ? 'FEHLER' : 'OK') + ' [nav] ' + (n - fehler) + '/' + n + ' Prüfungen');
  process.exit(fehler ? 1 : 0);
})();
