// Abschlag prüfen und Tarife vergleichen in der echten Oberfläche (dist, JSDOM), seit 1.9 auf den Seiten „Strom“ und „Heizen“:
// Kacheln (Werkzeug → Strom/Gas → Rechner), „Zurück“ je eine Ebene hoch, Ergebnis vor den Eingaben, keine Zusätze (Brief, Tipps, Nebenfelder),
// Fehler, Speichern über den Vorgangswechsel, Tarifvergleich mit/ohne Bonus, Hinweise und Link zur Verbraucherzentrale, Sprachen ohne Rohschlüssel.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const mem = {}; const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
  beforeParse(w) {
    w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
const setze = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
const haken = (id, an) => { const e = $(id); e.checked = an; e.dispatchEvent(new w.Event('change', { bubbles: true })); };
const klick = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const tx = (e) => e.textContent.replace(/[  ]/g, ' ');
const zumPlan = () => { klick($('goGeld')); klick(d.querySelector('#spInhalt .gs-planen')); klick(d.querySelector('#spInhalt .gs-p-hh')); }; // „Mein Geld planen“ → Karte Haushaltsplan
const sp = (sel) => d.querySelector('#spInhalt ' + sel);
const zuSeite = (thema) => { klick($('goGeld')); klick(sp('.gs-planen')); klick(sp('.gs-t-' + thema)); }; // „Mein Geld planen“ → Seite „Strom“ bzw. „Heizen“
const zumCheck = () => { klick($('goGeld')); klick(sp('.gs-planen')); klick(sp('.gs-p-energie')); }; // „Mein Geld planen“ → „Energie-Check“ (UX-Audit C Nr. 11)
const zumRechner = (wz, art) => { zumCheck(); klick(sp('.gs-e-' + wz)); if (art !== 'strom') klick(sp('.gs-e-' + wz + '-' + art)); };
const zurueck = () => klick(d.querySelector('#v-sparen [data-nav-zurueck]'));
const gespeichert = () => JSON.parse(mem['lotse.haushalt'] || '{}');
const iso = (tageZurueck) => { const x = new Date(); x.setDate(x.getDate() - tageZurueck); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
setTimeout(() => {
  try {
    w.__solo.lang('de');
    w.__solo.set({ adults: 1, kids: 0, miete: 500, heizkosten: 60, plz: '90542', bezug: { grundsicherungsgeld: true } });
    // Haushaltsplan: unter „Strom und Gas“ kein Abschlag-Knopf mehr
    zumPlan(); klick($('hb-kat-energie'));
    check('Haushaltsplan: kein Abschlag-Knopf, keine Energie-Box', !$('hb-en-knopf') && !$('hbEnergie'));
    // Seite „Strom“: zwei Kacheln (Abschlag prüfen, Tarife vergleichen) vor den Spartipps
    // UX-Audit C Nr. 11: Werkzeuge nur einmal (Kachel „Energie-Check“ unter „Mein Geld planen“), nicht mehr auf den Seiten Strom/Heizen
    ['strom', 'heizen', 'essen'].forEach((th) => { zuSeite(th); check('[ux-c] Seite ' + th + ': keine Energie-Werkzeuge (nur im Energie-Check)', !sp('.gs-e-abschlag') && !sp('.gs-e-tarif') && !!sp('.sp-tipps')); });
    zumCheck();
    check('[ux-c] Energie-Check: Kacheln „Abschlag prüfen“ und „Tarife vergleichen“', !!sp('.gs-e-abschlag') && !!sp('.gs-e-tarif') && /Abschlag prüfen/.test(sp('.gs-e-abschlag').textContent) && /Tarife vergleichen/.test(sp('.gs-e-tarif').textContent) && !$('hbEnergie'));
    // Abschlag prüfen: Rechner sofort (Strom), Umschalter Strom/Gas oben statt Zwischenseite
    klick(sp('.gs-e-abschlag'));
    check('[ux-c] Abschlag: Umschalter Strom/Gas im Rechner, Strom gewählt', !!sp('.gs-e-abschlag-strom') && !!sp('.gs-e-abschlag-gas') && sp('.gs-e-abschlag-strom').getAttribute('aria-pressed') === 'true' && sp('.gs-e-abschlag-gas').getAttribute('aria-pressed') === 'false' && !!$('hbEnergie'));
    check('Strom: Rechner offen, Ergebnis vor den Eingaben (aria-live)', !!$('hbEnergie') && !!($('hbEnErgebnis').compareDocumentPosition($('hb-en-a')) & w.Node.DOCUMENT_POSITION_FOLLOWING) && $('hbEnErgebnis').getAttribute('aria-live') === 'polite');
    check('Keine Zusätze: keine Heizart-Auswahl, keine Reiter, kein Warmwasser, keine Personen, keine aufklappbaren Extras', !$('hb-en-heiz') && !$('hb-en-tab-gas') && !$('hb-en-ww') && !$('hb-en-personen') && !d.querySelector('#hbEnergie details') && !d.querySelector('.hb-en-nz, .hb-en-dv, .hb-en-sperre, .hb-en-tipps'));
    check('Keine Spartipps unter dem Rechner', !sp('.sp-tipps'));
    setze('hb-en-a', '65');
    check('Abschlag ohne Verbrauch: „fehlt noch“', /fehlt noch/.test(tx($('hbEnErgebnis'))) && d.activeElement === $('hb-en-a'));
    setze('hb-en-z1', '10000'); setze('hb-en-d1', iso(100)); setze('hb-en-z2', '10500'); setze('hb-en-d2', iso(10));
    check('Ohne Preis: Schätzung mit Durchschnittspreis', /Durchschnittspreis 37,97 Cent/.test(tx($('hbEnErgebnis'))));
    setze('hb-en-ap', '36,5'); setze('hb-en-gp', '12');
    const erg = d.querySelector('.hb-en-erg');
    check('Nachzahlung möglich, ungefährer Betrag, Kosten im Jahr, kein Vorschlag, kein Brief', erg.classList.contains('nach') && /^Möglich: Nachzahlung von ungefähr \d+ €/.test(tx(erg)) && /Kosten im Jahr/.test(tx($('hbEnErgebnis'))) && !d.querySelector('.hb-en-vorschlag') && !$('hb-en-brief'), tx(erg));
    check('Gespeichert in lotse.haushalt', gespeichert().energie.strom.a === 6500 && gespeichert().energie.strom.ap === 36.5);
    check('Plan nicht verändert (keine Übernahme)', gespeichert().plan.aus.energie === undefined);
    haken('hb-en-heizt', true);
    check('Heizen mit Strom (90 Tage): ungenau mit Jahreszeit-Hinweis', gespeichert().energie.heiz === 'strom' && /Beim Heizen ist der Verbrauch im Winter/.test(tx($('hbEnErgebnis'))));
    haken('hb-en-heizt', false);
    check('Haken weg: wieder belastbar', gespeichert().energie.heiz === '' && !/Beim Heizen/.test(tx($('hbEnErgebnis'))));
    setze('hb-en-z2', '9000');
    check('Zählerstand rückwärts: Fehler, kein Ergebnis', d.querySelector('.hb-en-erg').classList.contains('fehler') && /kleiner als der alte/.test(tx($('hbEnErgebnis'))));
    setze('hb-en-z2', '10500');
    setze('hb-en-a', '100');
    check('Guthaben als Info (nicht grün)', d.querySelector('.hb-en-erg').classList.contains('gut'));
    setze('hb-en-a', '65');
    // Umschalter Gas: eigene Felder; Zurück führt eine Ebene hoch zu den Werkzeugen
    klick(sp('.gs-e-abschlag-gas'));
    check('Gas: eigene Felder (Rechnung, m³)', !!$('hbEnergie') && $('hb-en-weg').value === 'rechnung' && !!$('hb-en-m3') && !$('hb-en-heizt') && sp('.gs-e-abschlag-gas').getAttribute('aria-pressed') === 'true' && d.activeElement === sp('.gs-e-abschlag-gas'));
    zurueck();
    check('[ux-c] Zurück aus dem Rechner: Werkzeuge des Energie-Checks', !!sp('.gs-e-abschlag') && !!sp('.gs-e-tarif') && !$('hbEnergie'));
    // Strom-/Gassperre droht: Knopf „Abschlag prüfen“ öffnet den Rechner (Strom)
    klick($('goGeld')); klick(sp('.gs-dringend')); klick(sp('.gs-d-strom')); klick(sp('.gs-abschlag'));
    check('Sperre droht → Abschlag prüfen: Rechner mit Umschalter Strom/Gas', !!$('hbEnergie') && !!sp('.gs-e-abschlag-strom') && !!sp('.gs-e-abschlag-gas'));
    // Tarife vergleichen
    zumRechner('tarif', 'strom');
    check('Tarif: Rechner offen, Hinweise, Link zur Verbraucherzentrale', !!$('hbTarif') && d.querySelectorAll('#spInhalt .tv-tipps details.tipp').length === 5 && /verbraucherzentrale\.de/.test($('tv-vz').href) && /fehlt noch/.test(tx($('hbTvErgebnis'))));
    check('Tarif: Hinweise zum Aufklappen, kurz', [...d.querySelectorAll('#spInhalt .tv-tipps .tipp-kurz')].every((k) => k.textContent.trim().split(/\s+/).length <= 12));
    setze('hb-tv-kwh', '2500'); setze('hb-tv-eigen-ap', '40'); setze('hb-tv-eigen-gp', '15');
    setze('hb-tv-angebot-ap', '32'); setze('hb-tv-angebot-gp', '12');
    let te = tx($('hbTvErgebnis'));
    check('Tarif ohne Bonus: Angebot 236 € günstiger, Kosten beider', /ungefähr 236 € im Jahr günstiger/.test(te) && /dein Tarif 1\.180 €, das Angebot 944 €/.test(te) && d.querySelector('#hbTvErgebnis .hb-en-erg').classList.contains('passt') && d.activeElement === $('hb-tv-angebot-gp'), te);
    setze('hb-tv-bonus', '300');
    te = tx($('hbTvErgebnis'));
    check('Tarif mit Bonus: 1. Jahr 536 € günstiger, ab 2. Jahr 236 €', /Im 1\. Jahr \(mit Bonus\): Das Angebot ist ungefähr 536 € günstiger/.test(te) && /Ab dem 2\. Jahr \(ohne Bonus\): ungefähr 236 € günstiger/.test(te), te);
    setze('hb-tv-angebot-ap', '45');
    te = tx($('hbTvErgebnis'));
    check('Tarif: Angebot teurer ab dem 2. Jahr (Warnfarbe), 1. Jahr günstiger', /Im 1\. Jahr \(mit Bonus\): Das Angebot ist ungefähr 211 € günstiger/.test(te) && /Ab dem 2\. Jahr \(ohne Bonus\): ungefähr 89 € teurer/.test(te), te);
    check('Tarif: nichts gespeichert', !/hb-tv|tarif/.test(mem['lotse.haushalt'] || '') && !Object.keys(mem).some((k) => /tarif/i.test(k)));
    setze('hb-tv-eigen-ap', '0');
    check('Tarif: Arbeitspreis 0 → Fehlermeldung unter dem Feld', !!$('hb-tv-eigen-ap-f'));
    zurueck();
    check('Tarif: Zurück zu den Werkzeugen', !!sp('.gs-e-tarif') && !$('hbTarif'));
    // Vorgangswechsel: Abschlag-Daten bleiben
    w.Haushalt.neuLaden();
  } catch (e) { fehler++; console.log('FAIL Ausnahme: ' + e.stack); }
  setTimeout(teil2, 100);
}, 300);
function teil2() {
  try {
    zumRechner('abschlag', 'strom');
    check('Nach neuLaden: Daten erhalten', gespeichert().energie.strom.z1 === 10000 && gespeichert().energie.strom.ap === 36.5 && $('hb-en-z1').value === '10000' && $('hb-en-ap').value === '36,5');
    // Befund 7: Preis mit mehr als 4 Nachkommastellen, sichtbare Fehlermeldung unter dem Feld
    setze('hb-en-ap', '32,87555');
    check('[en-check] Befund 7: 5 Nachkommastellen: Fehlermeldung unter dem Feld, nichts gespeichert', !!$('hb-en-ap-f') && /Diese Zahl passt nicht/.test($('hb-en-ap-f').textContent) && $('hb-en-ap').getAttribute('aria-invalid') === 'true' && /hb-en-ap-f/.test($('hb-en-ap').getAttribute('aria-describedby') || '') && gespeichert().energie.strom.ap === 36.5);
    setze('hb-en-ap', '32,875');
    check('[en-check] Befund 7: 32,875 ct angenommen und angezeigt', gespeichert().energie.strom.ap === 32.875 && $('hb-en-ap').value === '32,875' && !$('hb-en-ap-f'));
    setze('hb-en-ap', '36,5');
    // Befund 12: alte Ablesung → Bitte um neue Ablesung
    setze('hb-en-d2', iso(40));
    check('[en-check] Befund 12: Ablesung 40 Tage alt: „Bitte lies den Zähler neu ab“', /Bitte lies den Zähler neu ab/.test(tx($('hbEnErgebnis'))), tx($('hbEnErgebnis')));
    setze('hb-en-d2', iso(10));
    check('[en-check] Befund 12: Aktuelle Ablesung: kein Hinweis', !/Bitte lies den Zähler neu ab/.test(tx($('hbEnErgebnis'))));
    // Alte Daten (personen, bewilligt) ohne Fehler ignoriert
    w.Haushalt.laden({ bewilligt: { kiz: '2027-01-31' }, energie: { heiz: 'gas', personen: 3, strom: { a: 5000 } } });
    check('Alte Felder (bewilligt, personen) verworfen', !('bewilligt' in w.Haushalt.daten()) && !('personen' in w.Haushalt.daten().energie) && w.Haushalt.daten().energie.strom.a === 5000);
    // Sprachen: keine Rohschlüssel
    ['en', 'ar', 'fa', 'so', 'uk'].forEach((l) => {
      w.__solo.lang(l); zumRechner('abschlag', 'gas');
      check(l + ': Abschlag ohne Rohschlüssel', !!$('hbEnergie') && !/hb\.en\.|hb\.tv\.|tv\.[a-z]/.test($('spInhalt').textContent));
      zumRechner('tarif', 'strom');
      check(l + ': Tarif ohne Rohschlüssel', !!$('hbTarif') && !/hb\.en\.|hb\.tv\.|tv\.[a-z]|pl\.abschlag/.test($('spInhalt').textContent));
    });
    w.__solo.lang('de');
    check('Keine Skriptfehler', !errors.length, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme: ' + e.stack); }
  if (fehler) { console.log('\n' + fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
  console.log('Energie-DOM-Test bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}
