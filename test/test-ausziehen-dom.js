// „Ich ziehe aus“ in der echten Oberfläche (dist, JSDOM): Startkachel, Übersicht mit Kacheln, Unterseiten mit Zurück (Herkunft),
// Abhaken mit Fortschritt, Speichern und Laden, Notizen, Speicherfehler, Briefvorlage, alle Sprachen ohne Rohschlüssel (Marke az-oberflaeche)
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
function starte(mem, voll) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { if (voll && k === 'lotse.ausziehen') throw new Error('QuotaExceeded'); mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors };
}
const klick = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const mem = {};
const a = starte(mem, false);
setTimeout(() => {
  const { w, d } = a, $ = (id) => d.getElementById(id);
  try {
    w.__solo.lang('de');
    const kachel = $('goAusziehen');
    check('[az-oberflaeche] Startkachel da', !!kachel && /Ich ziehe aus/.test(kachel.textContent) && /Checklisten, Geld, Hilfen/.test(kachel.textContent), kachel && kachel.textContent);
    check('[az-oberflaeche] 6 Kacheln auf der Startseite', d.querySelectorAll('.start-raster > .sk').length === 6 /* Hauptkachel + 5 */);
    klick(w, kachel);
    check('[az-oberflaeche] Bereich offen', !$('v-ausziehen').hidden && w.location.hash === '#ausziehen');
    const k = d.querySelectorAll('#azInhalt .az-k');
    check('[az-oberflaeche] 6 Kacheln in der Übersicht, keine Kachel „Für Careleaver“', k.length === 6 && !$('az-geh-care') && !/Careleaver/.test($('azInhalt').textContent), k.length);
    check('[az-oberflaeche] Fortschritt auf Kachel', /0 von 9 erledigt/.test($('az-geh-vorher').textContent), $('az-geh-vorher').textContent);
    klick(w, $('az-geh-vorher'));
    check('[az-oberflaeche] Unterseite mit Überschrift', /Bevor du ausziehst/.test($('azH').textContent) && d.activeElement === $('azH'));
    check('[az-oberflaeche] U25-Warnung sichtbar', /Erst fragen, dann unterschreiben/.test(d.querySelector('.az-warn').textContent));
    check('[az-oberflaeche] Weitere Punkte zugeklappt', !!d.querySelector('.az-weitere') && !d.querySelector('.az-weitere').open);
    check('[az-oberflaeche] Quelle mit Datum', /Quelle: §[ \u00a0]551 BGB \(abgerufen am 20\.11\.2026\)/.test($('az-p-vertrag').textContent));
    const cb = d.querySelector('[data-az-ab="vertrag"]'); cb.checked = true; cb.dispatchEvent(new w.Event('change', { bubbles: true }));
    check('[az-oberflaeche] Haken gespeichert', JSON.parse(mem['lotse.ausziehen']).ab.vertrag === true, mem['lotse.ausziehen']);
    { const st = w.Ausziehen.stand(); check('[az-oberflaeche] Ausziehen.stand(): erledigt und alle 20 Punkte (ohne Careleaver) für „Mein Ordner“', st && st.n === 1 && st.von === 20, st); }
    { const nb = d.querySelector('#appnav [data-ansicht="ordner"]'); if (nb) { klick(w, nb); check('[az-oberflaeche] Mein Ordner zeigt „Ich ziehe aus“ mit Fortschritt', /„Ich ziehe aus“\s*1 von \d+ erledigt/.test($('v-ordner').textContent), $('v-ordner').textContent.slice(0, 200)); klick(w, $('goAusziehen') || nb); klick(w, $('az-geh-vorher')); } }
    check('[az-oberflaeche] Fortschritt aktualisiert', /1 von 9 erledigt/.test($('azFort').textContent));
    const no = $('azNotiz'); no.value = 'Besichtigung Freitag'; no.dispatchEvent(new w.Event('input', { bubbles: true }));
    klick(w, d.querySelector('[data-az-zurueck]'));
    check('[az-oberflaeche] Zurück zur Übersicht, Fokus auf Kachel', !!$('az-geh-vorher') && d.activeElement === $('az-geh-vorher') && /1 von 9/.test($('az-geh-vorher').textContent));
    // Herkunft: Geld -> Versicherungen -> Zurück -> Geld
    klick(w, $('az-geh-geld')); klick(w, d.querySelector('#az-p-vers [data-az-weg="vers"]'));
    check('[az-oberflaeche] Versicherungen gestuft', /Unbedingt/.test($('azInhalt').textContent) && /Meist unnötig/.test($('azInhalt').textContent));
    const unbedingt = [...d.querySelectorAll('#azInhalt .az-stufe')][0].nextElementSibling;
    check('[az-oberflaeche] Kfz-Haftpflicht unter „Unbedingt“', !!unbedingt.querySelector('#az-p-kfzH'));
    check('[az-oberflaeche] Auslandsreise-Krankenversicherung unter „Kommt drauf an“', !![...d.querySelectorAll('#azInhalt .az-stufe')][2].nextElementSibling.querySelector('#az-p-auslandKv'));
    check('[az-oberflaeche] Familienversicherung mit Grenze', /mehr als \d{3} € im Monat/.test($('az-p-kv').textContent.replace(/[  ]/g, ' ')), $('az-p-kv').textContent);
    klick(w, d.querySelector('[data-az-zurueck]'));
    check('[az-oberflaeche] Zurück nach Herkunft (Geld)', /Dein Geld im Griff/.test($('azH').textContent));
    klick(w, d.querySelector('[data-az-zurueck]'));
    // Hilfen -> Leistungs-Check
    klick(w, $('az-geh-hilfen'));
    check('[az-oberflaeche] Hilfen „möglich“', d.querySelectorAll('#azInhalt .az-chip').length === 9);
    klick(w, d.querySelector('[data-az-weg="check"]'));
    check('[az-oberflaeche] Weg zum Leistungs-Check', !$('v-leistungen').hidden);
    check('[az-oberflaeche] keine Skriptfehler', a.errors.length === 0, a.errors);
  } catch (e) { check('[az-oberflaeche] Ablauf', false, e.stack); }
  // Laden nach Neustart, Notiz gespeichert
  setTimeout(() => {
    const b = starte(mem, false);
    setTimeout(() => {
      const { w, d } = b, $ = (id) => d.getElementById(id);
      try {
        w.__solo.lang('de'); klick(w, $('goAusziehen'));
        check('[az-oberflaeche] nach Neustart geladen', /1 von 9/.test($('az-geh-vorher').textContent));
        klick(w, $('az-geh-vorher'));
        check('[az-oberflaeche] Notiz geladen', $('azNotiz').value === 'Besichtigung Freitag', $('azNotiz').value);
        // Alle Sprachen: keine Rohschlüssel, RTL
        LANGS.forEach((l) => {
          w.__solo.lang(l);
          ['', 'vorher', 'tage', 'geld', 'vers', 'achtung', 'hilfen'].forEach((id) => {
            w.Ausziehen.oeffnen(id);
            const tx = $('v-ausziehen').textContent + $('goAusziehen').textContent;
            check('[az-oberflaeche] ' + l + ' ' + (id || 'übersicht') + ' ohne Rohschlüssel', !/\baz\.[a-zA-Z]/.test(tx) && !/\{\w+\}/.test(tx), (tx.match(/\baz\.[a-zA-Z.]+|\{\w+\}/g) || []).slice(0, 3));
          });
        });
        // Alle Angaben löschen löscht auch Haken und Notizen
        w.__solo.lang('de'); klick(w, $('clear2')); klick(w, $('loeschJa'));
        check('[az-oberflaeche] Löschen leert Haken (ganzer Vorgang)', !mem['lotse.ausziehen'] && JSON.stringify(w.Ausziehen.daten().ab) === '{}', mem['lotse.ausziehen']);
        check('[az-oberflaeche] keine Skriptfehler nach Neustart', b.errors.length === 0, b.errors);
      } catch (e) { check('[az-oberflaeche] Neustart', false, e.stack); }
      // Speicherfehler wird gemeldet
      const c = starte({}, true);
      setTimeout(() => {
        const { w, d } = c, $ = (id) => d.getElementById(id);
        try {
          w.__solo.lang('de'); klick(w, $('goAusziehen')); klick(w, $('az-geh-tage'));
          const cb = d.querySelector('[data-az-ab="melden"]'); cb.checked = true; cb.dispatchEvent(new w.Event('change', { bubbles: true }));
          check('[az-oberflaeche] Speicherfehler gemeldet (Meldung der Vorgänge-Speicherung)', !$('vgFehler').hidden && /Speicher voll oder gesperrt/.test($('vgFehler').textContent));
        } catch (e) { check('[az-oberflaeche] Speicherfehler', false, e.stack); }
        console.log((fehler ? 'FEHLER: ' + fehler : 'OK') + ' – Ich ziehe aus (Oberfläche): ' + n + ' Prüfungen');
        process.exit(fehler ? 1 : 0);
      }, 300);
    }, 300);
  }, 600);
}, 300);
