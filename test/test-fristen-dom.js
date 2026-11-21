// Fristen in der echten Oberfläche (dist, JSDOM): Karte in „Mein Ordner“, Unterseite mit Worten und Rechenweg, Hinweis beim Öffnen
// höchstens einmal am Tag (Merker lotse.fristTag nur JJJJ-MM-TT), Erledigt/Später/Ansehen, Schalter, PIN, „Frist merken“ nur auf Knopfdruck, XSS.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const { webcrypto } = require('crypto');
const V = require('../src/vorgaenge.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : JSON.stringify(x)); } };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const zwei = (x) => (x < 10 ? '0' : '') + x;
const tagIn = (k) => { const d = new Date(); d.setDate(d.getDate() + k); return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); };
const HEUTE = tagIn(0), GESTERN = tagIn(-1), MORGEN = tagIn(1);

function seite(mem) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      w.confirm = () => true;
      Object.defineProperty(w, 'crypto', { value: webcrypto, configurable: true });
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  const w = dom.window;
  return { w, d: w.document, $: (id) => w.document.getElementById(id), errors, mem, klick: (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })) };
}
const knopf = (wurzel, text) => [...wurzel.querySelectorAll('button')].find((b) => b.textContent.trim() === text || (text === 'Frist merken' && b.classList.contains('fri-merken-btn'))); // nach dem Tipp heißt der Knopf „Gemerkt ✓“
const XSS = '<img src=x onerror="window.__xss=1">';
const liste = (e) => JSON.stringify({ v: 1, e, wb: {} });
const E = {
  bald: { id: 'a1', art: 'zahl', stelle: 'vm', basis: { fest: tagIn(3) }, quelle: 'brief', neu: 3 },
  eigen: { id: 'a2', art: 'eigen', titel: XSS, basis: { fest: tagIn(20) }, quelle: 'hand', neu: 2 },
  offen: { id: 'a3', art: 'mit', stelle: 'jc', basis: { frist: '2W' }, quelle: 'brief', neu: 1 },
  wid: { id: 'a4', art: 'wid', stelle: 'jc', basis: { datum: tagIn(-45) }, quelle: 'bescheid', neu: 4 }
};

(async () => {
  // 1. Erstes Öffnen heute: Hinweis unter der Begrüßung, Merker gesetzt
  const mem = { 'lotse.ack': '1', 'lotse.fristliste': liste([E.bald, E.eigen, E.offen]) };
  let s = seite(mem); await warte(30);
  ck('[fristen-dom] lädt ohne Skriptfehler', !s.errors.length, s.errors);
  let st = s.$('friStart');
  ck('[fristen-dom] Hinweis beim Öffnen: dringendste Frist', st && /^Frist: Zahlen bis \(Vermieter\) – bis \w\w\., \d\d\.\d\d\.\d{4} \(noch 3 Tage\)\.$/.test(st.querySelector('.fri-start-t').textContent), st && st.textContent);
  ck('[fristen-dom] Hinweis unter der Begrüßung, vor den Kacheln, role=status, Bernstein', st && st.previousElementSibling.classList.contains('gruss-t') && st.nextElementSibling.classList.contains('start-raster') && st.getAttribute('role') === 'status' && st.classList.contains('bald'));
  ck('[fristen-dom] Drei Knöpfe, kein Schließen-Kreuz', st && ['Erledigt', 'Später erinnern', 'Ansehen'].every((x) => knopf(st, x)) && !/×/.test(st.textContent));
  ck('[fristen-dom] Nur ein Hinweis (kein #hbStart)', !s.$('hbStart'));
  ck('[fristen-dom] Merker lotse.fristTag = heute, nur JJJJ-MM-TT', mem['lotse.fristTag'] === HEUTE && /^\d{4}-\d\d-\d\d$/.test(mem['lotse.fristTag']));
  // Mein Ordner: Karte als erste Zeile, Unterseite
  s.klick(s.d.querySelector('#appnav button[data-ansicht="ordner"]'));
  const erste = s.d.querySelector('#ordnerKarten .zeile');
  ck('[fristen-dom] Karte „Fristen“ als erste Zeile mit nächster Frist', erste && erste.id === 'or-fristen' && /Nächste: Zahlen bis \(Vermieter\), bis/.test(erste.textContent), erste && erste.textContent);
  s.klick(erste);
  const seiteF = s.$('ordnerFristen');
  ck('[fristen-dom] Unterseite data-seite=fristen mit „← Zurück“', !seiteF.hidden && seiteF.getAttribute('data-seite') === 'fristen' && /Zurück/.test(seiteF.querySelector('.us-zurueck').textContent) && s.$('ordnerHaupt').hidden);
  const arts = [...s.d.querySelectorAll('#friListe .fri-e')];
  ck('[fristen-dom] Liste: 3 offene, sortiert (ohne Datum zuletzt)', arts.length === 3 && arts[0].id === 'fri-a1' && arts[2].id === 'fri-a3', arts.map((a) => a.id));
  ck('[fristen-dom] Worte Fest / Datum fehlt sichtbar', /Fest/.test(arts[0].querySelector('.pill').textContent) && /Datum fehlt/.test(arts[2].querySelector('.pill').textContent));
  ck('[fristen-dom] „So wurde gerechnet“ zum Aufklappen', arts[0].querySelector('details > summary').textContent === 'So wurde gerechnet' && !arts[0].querySelector('details').open);
  ck('[fristen-dom] XSS: eigener Titel als Text', arts[1].querySelector('h3').textContent === XSS && !s.d.querySelector('#friListe img') && !s.w.__xss);
  // Datum nachtragen: Mitwirkung, Brief bekommen
  s.klick(knopf(arts[2], 'Datum ändern'));
  const f = arts[2].querySelector('form'); f.querySelector('input').value = tagIn(-2);
  f.dispatchEvent(new s.w.Event('submit', { bubbles: true, cancelable: true }));
  const a3 = s.$('fri-a3');
  ck('[fristen-dom] Datum nachgetragen: gerechnet (2 Wochen ab Erhalt)', a3 && /Gerechnet/.test(a3.querySelector('.pill').textContent) && JSON.parse(mem['lotse.fristliste']).e.find((e) => e.id === 'a3').basis.erhalten === tagIn(-2), a3 && a3.textContent);
  ck('[fristen-dom] Rechenweg mit Feiertags-Hinweis', /Brief bekommen am .* Ab dem Tag danach: 2 Wochen/.test(a3.querySelector('details').textContent) && /ganz Deutschland/.test(a3.querySelector('details').textContent));
  // Eigene Frist eintragen, Dublette
  s.$('friEigenTitel').value = 'Kita-Anmeldung'; s.$('friEigenBis').value = tagIn(40);
  s.$('friEigenTitel').form.dispatchEvent(new s.w.Event('submit', { bubbles: true, cancelable: true }));
  ck('[fristen-dom] Eigene Frist gespeichert, Meldung mit Rückgängig', JSON.parse(mem['lotse.fristliste']).e.some((e) => e.titel === 'Kita-Anmeldung') && /gemerkt/.test(s.$('friMsg').textContent) && knopf(s.$('friMsg'), 'Rückgängig'));
  ck('[fristen-dom] Schnittstelle hinzu: Dublettenschutz', s.w.FristenOrdner.hinzu({ art: 'eigen', titel: 'Kita-Anmeldung', bis: tagIn(40) }) === 'da' && s.w.FristenOrdner.hinzu({ art: 'xx' }) === false);
  // Kurzform wie b-kostensenkung: { art, datum, titel, stelle, quelle, notiz }
  {
    const FO = s.w.globalThis.FristenOrdner, ks = { art: 'kostensenkung', datum: tagIn(150), titel: 'Wohnkosten senken ' + XSS, stelle: 'jc', quelle: 'brief', notiz: 'Belege sammeln\n' + XSS };
    ck('[fristen-dom] Kurzform: neu, dann Dublette', FO.hinzu(ks) === 'neu' && FO.hinzu(Object.assign({}, ks, { titel: 'anders' })) === 'da');
    const g = JSON.parse(mem['lotse.fristliste']).e.find((e) => e.schluessel === 'kostensenkung-' + tagIn(150));
    ck('[fristen-dom] Kurzform gespeichert: Fest, Titel und Notiz bereinigt', g && g.art === 'frist' && g.wort === 'fest' && g.bis === tagIn(150) && g.stelle === 'jc' && g.notiz === 'Belege sammeln ' + XSS && !/\n/.test(g.notiz), g);
    const ge = s.$('fri-' + g.id);
    ck('[fristen-dom] Kurzform in der Liste als Text', ge && ge.querySelector('h3').textContent === 'Wohnkosten senken ' + XSS && /Belege sammeln/.test(ge.querySelector('.fri-notiz').textContent) && !s.d.querySelector('#friListe img'));
    ck('[fristen-dom] Kurzform ohne gültiges Datum: false', FO.hinzu({ art: 'kostensenkung', datum: '31.05.2027' }) === false && FO.hinzu(null) === false);
  }
  // Befund 6: Widerspruch mit Zustellung: Rechenweg nennt die Zustellung, nicht „Brief vom … vierter Tag“
  {
    ck('[fristen-dom] Befund 6: Widerspruch mit Zugang gespeichert', s.w.FristenOrdner.hinzu({ art: 'wid', stelle: 'jc', basis: { zugang: tagIn(-2) } }) === 'neu');
    const g = JSON.parse(mem['lotse.fristliste']).e.find((e) => e.art === 'wid');
    const det = s.$('fri-' + g.id).querySelector('details').textContent;
    ck('[fristen-dom] Befund 6: Rechenweg bei Zustellung passend', /Zugestellt oder persönlich bekommen am/.test(det) && !/vierten Tag/.test(det), det);
    s.w.FristenOrdner.entfernen(g.id);
  }
  // Rechtsweg: Wohngeld „Widerspruch oder Klage“ (je Land kein Widerspruch), Brief ohne Stelle „Widerspruch, Einspruch oder Klage“; Jobcenter und Kinderzuschlag unverändert
  {
    const F = s.w.FristenOrdner;
    ck('[fristen-dom] Rechtsweg: vier Fristen gespeichert', F.hinzu({ art: 'wid', stelle: 'wg', basis: { datum: tagIn(-3) }, quelle: 'bescheid' }) === 'neu' && F.hinzu({ art: 'wid', stelle: 'fk', basis: { datum: tagIn(-4) }, quelle: 'bescheid' }) === 'neu' && F.hinzu({ art: 'wid', bis: tagIn(25), quelle: 'brief' }) === 'neu' && F.hinzu({ art: 'wid', stelle: 'jc', basis: { datum: tagIn(-5) }, quelle: 'bescheid' }) === 'neu');
    const alle = JSON.parse(mem['lotse.fristliste']).e, txt = (x) => s.$('fri-' + x.id).textContent, kopf = (x) => s.$('fri-' + x.id).querySelector('h3').textContent;
    const wg = alle.find((e) => e.stelle === 'wg'), fk = alle.find((e) => e.stelle === 'fk'), br = alle.find((e) => e.art === 'wid' && !e.stelle), jc = alle.find((e) => e.art === 'wid' && e.stelle === 'jc');
    ck('[fristen-dom] Rechtsweg Wohngeld: Titel „Widerspruch oder Klage“, Hinweis auf Länder und Rechtsbehelfsbelehrung', kopf(wg) === 'Widerspruch oder Klage gegen den Bescheid (Wohngeldstelle)' && /In manchen Bundesländern gibt es keinen Widerspruch/.test(txt(wg)) && /Rechtsbehelfsbelehrung am Ende des Bescheids/.test(txt(wg)), txt(wg));
    ck('[fristen-dom] Rechtsweg Brief ohne Stelle: kein festes Wort, Einspruch beim Kindergeld genannt', kopf(br) === 'Widerspruch, Einspruch oder Klage' && /beim Kindergeld Einspruch/.test(txt(br)) && /Rechtsbehelfsbelehrung am Ende des Briefs/.test(txt(br)) && !/Der Widerspruch muss bis zum Ende/.test(txt(br)), txt(br));
    ck('[fristen-dom] Rechtsweg Kinderzuschlag und Jobcenter: weiter „Widerspruch“, ohne Länder-Hinweis', kopf(fk) === 'Widerspruch gegen den Bescheid (Familienkasse)' && kopf(jc) === 'Widerspruch gegen den Bescheid (Jobcenter)' && !/Bundesländern|Einspruch/.test(txt(fk).split('So wurde gerechnet')[0]) && !/Bundesländern/.test(txt(jc)), txt(fk));
    [wg, fk, br, jc].forEach((x) => F.entfernen(x.id));
  }
  // Kein Klartext außer Merker: Schlüssel gehört zum Vorgang
  ck('[fristen-dom] lotse.fristliste gehört zu Vorgaenge.DATEN', V.DATEN.indexOf('lotse.fristliste') >= 0);

  // 2. Zweites Öffnen am selben Tag: kein Hinweis
  s = seite(mem); await warte(30);
  ck('[fristen-dom] Zweites Öffnen am selben Tag: kein Hinweis', !s.$('friStart'));
  // 3. Nächster Tag (Merker von gestern): Hinweis; Erledigt
  mem['lotse.fristTag'] = GESTERN;
  s = seite(mem); await warte(30);
  st = s.$('friStart');
  ck('[fristen-dom] Nächster Tag: Hinweis wieder da', !!st && mem['lotse.fristTag'] === HEUTE);
  s.klick(knopf(st, 'Erledigt'));
  ck('[fristen-dom] Erledigt: Meldung mit Rückgängig, gespeichert', /Als erledigt markiert/.test(st.textContent) && JSON.parse(mem['lotse.fristliste']).e.find((e) => e.id === 'a1').erledigt === HEUTE);
  mem['lotse.fristTag'] = GESTERN;
  s = seite(mem); await warte(30);
  st = s.$('friStart');
  ck('[fristen-dom] Erledigte Frist kommt nie wieder', !st || !/Vermieter/.test(st.textContent), st && st.textContent);
  // 4. Später erinnern
  const m4 = { 'lotse.ack': '1', 'lotse.fristTag': GESTERN, 'lotse.fristliste': liste([E.bald]) };
  s = seite(m4); await warte(30);
  s.klick(knopf(s.$('friStart'), 'Später erinnern'));
  ck('[fristen-dom] Später erinnern: morgen', JSON.parse(m4['lotse.fristliste']).e[0].spaeter === MORGEN && /erinnert dich am/.test(s.$('friStart').textContent));
  m4['lotse.fristTag'] = GESTERN; s = seite(m4); await warte(30);
  ck('[fristen-dom] Später: heute kein Hinweis', !s.$('friStart'));
  // 5. Abgelaufen: rot
  const m5 = { 'lotse.ack': '1', 'lotse.fristliste': liste([E.wid]) };
  s = seite(m5); await warte(30);
  ck('[fristen-dom] Abgelaufen: Wort und Zustand', s.$('friStart') && s.$('friStart').classList.contains('vorbei') && /^Abgelaufen: Widerspruch gegen den Bescheid \(Jobcenter\)/.test(s.$('friStart').textContent), s.$('friStart') && s.$('friStart').textContent);
  // 6. Schalter aus: nie, Merker trotzdem gesetzt; Merker auch ohne jede Frist
  const m6 = { 'lotse.ack': '1', 'lotse.fristHinweis': '0', 'lotse.fristTag': GESTERN, 'lotse.fristliste': liste([E.bald]) };
  s = seite(m6); await warte(30);
  ck('[fristen-dom] Schalter aus: kein Hinweis, Merker gesetzt, Schalter zeigt Aus', !s.$('friStart') && m6['lotse.fristTag'] === HEUTE && s.$('friHinweisBtn').getAttribute('aria-checked') === 'false');
  s.klick(s.$('friHinweisBtn'));
  ck('[fristen-dom] Schalter an: gespeichert als 1', m6['lotse.fristHinweis'] === '1');
  const m7 = { 'lotse.ack': '1' };
  s = seite(m7); await warte(30);
  ck('[fristen-dom] Merker auch ohne Frist gesetzt, keine Karte', m7['lotse.fristTag'] === HEUTE && !s.$('friStart'));
  s.klick(s.d.querySelector('#appnav button[data-ansicht="ordner"]'));
  ck('[fristen-dom] Ohne Frist keine Karte in „Mein Ordner“', !s.$('or-fristen'));
  // 7. Brief prüfen: „Frist merken“ nur auf Knopfdruck
  {
    const text = 'Jobcenter Musterstadt\nDatum: ' + tagIn(-3).split('-').reverse().join('.') + '\nAufforderung zur Mitwirkung\nBitte reichen Sie die fehlenden Unterlagen innerhalb von zwei Wochen ein.';
    const k = s.w.FristenOrdner.briefKnopf(text, 'mit');
    s.d.body.appendChild(k);
    ck('[fristen-dom] Knopf mit freiwilligem Feld „Brief bekommen am“, nichts gespeichert', !!k.querySelector('input[type=date]') && /Brief bekommen am/.test(k.textContent) && !m7['lotse.fristliste']);
    s.klick(knopf(k, 'Frist merken'));
    const gespeichert = JSON.parse(m7['lotse.fristliste'] || '{"e":[]}').e;
    ck('[fristen-dom] Nach dem Tipp: Knopf zeigt „Gemerkt ✓“', knopf(k, 'Frist merken').textContent === 'Gemerkt ✓');
    ck('[fristen-dom] Nach dem Tipp gespeichert (Ungefähr), Meldung', gespeichert.length === 1 && gespeichert[0].art === 'mit' && gespeichert[0].wort === 'ungefaehr' && /In „Mein Ordner“ gemerkt/.test(k.textContent), gespeichert);
    ck('[fristen-dom] Kein Brieftext gespeichert', !/Musterstadt|Unterlagen/.test(m7['lotse.fristliste']));
    s.klick(knopf(k.querySelector('.msg'), 'Rückgängig'));
    ck('[fristen-dom] Rückgängig entfernt die gemerkte Frist', JSON.parse(m7['lotse.fristliste']).e.length === 0);
    s.klick(knopf(k, 'Frist merken')); s.klick(knopf(k, 'Frist merken'));
    ck('[fristen-dom] Zweiter Tipp: schon da', /steht schon/.test(k.textContent) && JSON.parse(m7['lotse.fristliste']).e.length === 1);
    // Befund 3: „Rückgängig“ nach einem Wechsel des Vorgangs schreibt nicht in den falschen Vorgang
    s.w.FristenOrdner.entfernen(JSON.parse(m7['lotse.fristliste']).e[0].id);
    s.klick(knopf(k, 'Frist merken'));
    const alterKnopf = knopf(k.querySelector('.msg'), 'Rückgängig');
    s.w.FristenOrdner.neuLaden();
    ck('[fristen-dom] Befund 3: neuLaden leert die Meldungen samt Rückgängig', alterKnopf && !k.querySelector('.msg').textContent && !knopf(k.querySelector('.msg'), 'Rückgängig'));
    alterKnopf.dispatchEvent(new s.w.MouseEvent('click', { bubbles: true }));
    ck('[fristen-dom] Befund 3: alter Rückgängig-Knopf ändert nach dem Wechsel nichts', JSON.parse(m7['lotse.fristliste']).e.length === 1);
    ck('[fristen-dom] Alte Namen nicht wieder benutzt', !s.d.querySelector('#v-fristen, [data-ansicht=fristen], #startFristen') && m7['lotse.fristen'] === undefined);
  }

  // 7b. Befund 1 und 2: Zeile und Tag vor dem Speichern zeigen, Tag änderbar; „ab Datum dieses Schreibens“ ohne Feld „bekommen am“
  {
    const m = { 'lotse.ack': '1', 'lotse.fristTag': HEUTE };
    s = seite(m); await warte(30);
    const brief = 'Jobcenter Musterstadt\nDatum: 01.12.2026\nAnhörung nach § 24 SGB X\nIhnen wurden Leistungen bis zum 31.01.2027 bewilligt.\nSie können sich bis zum 15.12.2026 äußern.';
    const k = s.w.FristenOrdner.briefKnopf(brief, 'anh'); s.d.body.appendChild(k);
    const feld = k.querySelector('input[type=date]');
    ck('[fristen-dom] Befund 1: Zeile aus dem Brief und Tag (15.12.2026) im Feld sichtbar', /Im Brief gefunden: „Sie können sich bis zum 15\.12\.2026 äußern\.“/.test(k.textContent) && feld && feld.value === '2026-12-15' && /Frist laut Brief/.test(k.textContent), k.textContent);
    feld.value = '';
    s.klick(knopf(k, 'Frist merken'));
    ck('[fristen-dom] Befund 1: leeres Feld → Hinweis, nichts gespeichert', /Tag der Frist/.test(k.textContent) && !m['lotse.fristliste']);
    feld.value = '2026-12-14';
    s.klick(knopf(k, 'Frist merken'));
    const g = JSON.parse(m['lotse.fristliste']).e;
    ck('[fristen-dom] Befund 1: geänderter Tag gespeichert (Fest), keine Briefzeile gespeichert', g.length === 1 && g[0].bis === '2026-12-14' && g[0].wort === 'fest' && !/äußern|bewilligt/.test(m['lotse.fristliste']), g);
    const ab = 'Jobcenter Musterstadt\nDatum: 01.12.2026\nAufforderung zur Mitwirkung\nBitte reichen Sie die Unterlagen innerhalb von zwei Wochen ab Datum dieses Schreibens ein.';
    const k2 = s.w.FristenOrdner.briefKnopf(ab, 'mit'); s.d.body.appendChild(k2);
    ck('[fristen-dom] Befund 2: „ab Datum dieses Schreibens“: kein Feld „bekommen am“', !k2.querySelector('input') && !/bekommen am/.test(k2.textContent));
    s.klick(knopf(k2, 'Frist merken'));
    const g2 = JSON.parse(m['lotse.fristliste']).e.find((e) => e.art === 'mit');
    ck('[fristen-dom] Befund 2: ab Briefdatum gerechnet: 15.12.2026, Gerechnet', g2 && g2.bis === '2026-12-15' && g2.wort === 'gerechnet' && g2.basis.abBrief === true, g2);
    // Befund 7: Schreibfehler → kein „Gemerkt“, sondern Fehlermeldung, nichts in der Liste
    const FO = s.w.FristenOrdner, vorher = m['lotse.fristliste'];
    FO.speicherOrt({ schreiben: (t, cb) => cb(new Error('voll')) });
    const k3 = FO.knopf(() => ({ art: 'eigen', titel: 'Test', bis: '2026-12-20' })); s.d.body.appendChild(k3);
    s.klick(knopf(k3, 'Frist merken'));
    ck('[fristen-dom] Befund 7: Speichern misslingt → „hat nicht geklappt“, kein „gemerkt“', /nicht geklappt/.test(k3.textContent) && !/gemerkt/.test(k3.textContent) && m['lotse.fristliste'] === vorher);
    ck('[fristen-dom] Befund 7: Schnittstelle meldet false', FO.hinzu({ art: 'eigen', titel: 'Test2', bis: '2026-12-21' }) === false);
    FO.speicherOrt({ schreiben: (t, cb) => { m['lotse.fristliste'] = t; cb(null); } });
    // Befund 5: höchstens 50; voll mit offenen → ablehnen mit „Liste voll“; mit erledigten → erledigte zuerst kürzen
    let neu = 0; for (let i = 0; i < 60 && FO.hinzu({ art: 'eigen', titel: 'F' + i, bis: '2027-02-01' }) === 'neu'; i++) neu++;
    const nachher = JSON.parse(m['lotse.fristliste']).e;
    ck('[fristen-dom] Befund 5: bei 50 offenen kein weiterer Eintrag', nachher.length === 50 && neu === 48, { n: nachher.length, neu });
    const k4 = FO.knopf(() => ({ art: 'eigen', titel: 'Zu viel', bis: '2027-03-01' })); s.d.body.appendChild(k4);
    s.klick(knopf(k4, 'Frist merken'));
    ck('[fristen-dom] Befund 5: Meldung „Liste voll“', /Die Liste ist voll/.test(k4.textContent) && !/Zu viel/.test(m['lotse.fristliste']));
    s.klick(s.d.querySelector('#appnav button[data-ansicht="ordner"]')); s.klick(s.$('or-fristen'));
    s.klick(knopf(s.d.querySelector('#friListe .fri-e'), 'Erledigt'));
    ck('[fristen-dom] Befund 5: ein Eintrag erledigt', JSON.parse(m['lotse.fristliste']).e.filter((e) => e.erledigt).length === 1);
    ck('[fristen-dom] Befund 5: mit erledigtem Eintrag: neu, erledigter gekürzt', FO.hinzu({ art: 'eigen', titel: 'Passt', bis: '2027-03-01' }) === 'neu' && JSON.parse(m['lotse.fristliste']).e.length === 50 && !JSON.parse(m['lotse.fristliste']).e.some((e) => e.erledigt));
    // Befund 4: Löschtext nennt die Fristen
    ck('[fristen-dom] Befund 4: „Nur diesen Vorgang löschen“ nennt die Fristen', /Fristen/.test(s.$('clear2').textContent), s.$('clear2').textContent);
  }

  // 8. Mit PIN, zwei Vorgänge: kein Hinweis vor dem Entsperren, kein Klartext; Frist im anderen Vorgang → nur „Ansehen“
  {
    const m8 = { 'lotse.ack': '1', 'lotse.fristTag': GESTERN };
    const roh = { get: (k, cb) => cb(k in m8 ? m8[k] : null), set: (k, v, f, ok) => { m8[k] = String(v); if (ok) ok(); }, remove: (k) => { delete m8[k]; } };
    const t = V.tresor(roh, { iter: 2000 });
    t.set('lotse.state', JSON.stringify({ s: { adults: 1, kids: 0, bezug: {} }, p: {}, e: false }));
    t.umbenennen(t.aktiv().id, 'Eigen');
    t.neu('Oma');
    t.set('lotse.fristliste', liste([Object.assign({}, E.bald, { titel: '' }), { id: 'b9', art: 'eigen', titel: 'Geheimtitel', basis: { fest: tagIn(2) }, neu: 9 }]));
    const omaId = t.aktiv().id;
    t.oeffnen(t.liste()[0].id);
    await t.fertig(); await t.pinSetzen('258013'); await t.fertig();
    ck('[fristen-dom] PIN: Fristen nicht im Klartext gespeichert', !Object.values(m8).some((v) => /Geheimtitel|Vermieter|"art"/.test(v)) && !m8['lotse.fristliste']);
    s = seite(m8); await warte(50);
    ck('[fristen-dom] Gesperrt: kein Hinweis, Merker noch von gestern', !s.$('friStart') && m8['lotse.fristTag'] === GESTERN);
    s.$('vgPinEin').value = '258013';
    s.$('vgPinEin').form.dispatchEvent(new s.w.Event('submit', { bubbles: true, cancelable: true }));
    for (let i = 0; i < 100 && !s.$('friStart'); i++) await warte(50);
    st = s.$('friStart');
    ck('[fristen-dom] Nach dem Entsperren: Hinweis über alle Vorgänge mit Vorgangsname', st && /Geheimtitel/.test(st.textContent) && /Vorgang: Oma/.test(st.textContent), st && st.textContent);
    ck('[fristen-dom] Frist in anderem Vorgang: nur „Ansehen“', st && knopf(st, 'Ansehen') && !knopf(st, 'Erledigt') && !knopf(st, 'Später erinnern'));
    ck('[fristen-dom] „und 1 weitere“', st && /und 1 weitere/.test(st.textContent));
    // „Oma“ nur als eigenes Wort: Base64-Geheimtext enthält die drei Zeichen zufällig (~1:1000 Läufe), Klartext im JSON stünde in Anführungszeichen
    ck('[fristen-dom] Mit PIN: Merker nur Datum, sonst nichts im Klartext', m8['lotse.fristTag'] === HEUTE && !Object.values(m8).some((v) => /Geheimtitel|(?<![A-Za-z0-9+/=])Oma(?![A-Za-z0-9+/=])/.test(v)));
    s.klick(knopf(st, 'Ansehen'));
    await warte(30);
    ck('[fristen-dom] Ansehen: öffnet den Vorgang und die Liste', !s.$('ordnerFristen').hidden && /Geheimtitel/.test(s.$('friListe').textContent) && !s.$('friStart'));
    ck('[fristen-dom] Vorgang gewechselt', (() => { const c = s.d.querySelector('#setHaushalte .vg-offen [data-vg-name]'); return c && c.getAttribute('data-vg-name') === 'Oma'; })(), omaId);
  }

  ck('[fristen-dom] keine Skriptfehler', !s.errors.length, s.errors);
  console.log(fails ? `\n${fails} von ${n} Prüfungen fehlgeschlagen` : `Fristen-DOM-Test bestanden: ${n} Prüfungen`);
  process.exit(fails ? 1 : 0);
})();
