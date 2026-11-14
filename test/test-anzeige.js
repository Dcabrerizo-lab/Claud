// Anzeige = Rechnung: Zufallshaushalte laufen durch die echte Oberfläche (dist, JSDOM), in allen 8 Sprachen.
// Geprüft wird, dass jede Karte genau die Einstufung, Überschrift und den Text (mit allen Beträgen) zeigt, die die Rechnung
// ergibt, in der richtigen Reihenfolge, und dass nirgends Kaputtes steht (NaN, undefined, {platzhalter}, negative Beträge, Rohschlüssel).
// Aufruf: node test/test-anzeige.js [Anzahl Haushalte, Standard 240]
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const I18N = require('../dist/i18n.js');
const Fmt = require('../src/fmt.js');
const N = Number(process.argv[2]) || 240;
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro'];
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const fehler = [];
const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.__SOLO_TEST__ = true;
    w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    const mem = {};
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window, d = w.document;

// Zufall mit festem Startwert (Fehler sind reproduzierbar)
let seed = 4711;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const geld = (max, schritt) => Math.round(rnd() * max / schritt) * schritt;
function haushalt() {
  const adults = rnd() < 0.6 ? 1 : 2, kids = pick([0, 0, 1, 2, 3]), young = pick([0, 0, 0, 1]);
  const kidsU6 = kids ? Math.floor(rnd() * (kids + 1)) : 0;
  const art = () => pick(['lohn', 'lohn', 'rente', 'alg', 'kg', 'eg', 'wfbm', 'ohne']);
  const ek1Art = art(), ek2Art = adults === 2 ? art() : '';
  const b1 = ek1Art === 'ohne' ? '' : geld(4500, 10), b2 = ek2Art && ek2Art !== 'ohne' ? geld(3000, 10) : '';
  const netto = (b) => (b === '' ? '' : (rnd() < 0.3 ? '' : Math.round(b * (0.6 + rnd() * 0.25))));
  return {
    adults, kids, kidsU6, kids14: kids - kidsU6 > 0 ? Math.floor(rnd() * (kids - kidsU6 + 1)) : 0, young,
    ek1Art, ek1Brutto: b1, ek1Netto: netto(b1), ek2Art, ek2Brutto: b2, ek2Netto: netto(b2),
    miete: rnd() < 0.1 ? '' : geld(1600, 10), mietstufe: pick(['', '1', '2', '3', '4', '5', '6', '7']),
    vermoegen: rnd() < 0.1 ? '' : pick([0, 2000, 8000, 15000, 40000, 90000]),
    gebJahr: pick(['', 1940, 1955, 1960, 1975, 1990, 2003]), bundesland: pick(['', 'BY', 'BY', 'NW', 'BE', 'HE', 'SN']),
    unterhalt: kids && rnd() < 0.3 ? geld(800, 10) : '', unterhaltFehlt: kids > 0 && rnd() < 0.4, kinder12: kids > 0 && rnd() < 0.3,
    kindEink: kids + young > 0 && rnd() < 0.2 ? geld(1000, 10) : '',
    uzBetrag: rnd() < 0.15 ? geld(900, 10) : '', uzAn: pick(['', 'k1', 'k2', 'ex', 'exk']), uzTitel: rnd() < 0.5,
    arbeitSit: pick(['', '', '', 'arbeitslos', 'krank']), algZeit: rnd() < 0.7, algMonate: pick(['', '12', '24', '36']),
    krankWochen: pick(['', 'unter6', 'laeuft', 'ende']), lohnVorher: pick(['', 1500, 2800, 4500, 7000]),
    baby: pick(['', '', '', 'bald', 'da']), egVor: pick(['', 0, 900, 2000]), aufenthalt: rnd() < 0.05 ? 'asyl' : '',
    ausbildung: pick(['', '', '', 'ich', 'kind', 'kindBetrieb']), pflegegrad: pick(['', '', '', 'antrag', '1', '2', '3', '5']),
    bhPerson: pick(['', '', '', 'ich', 'minder', 'erwVor25', 'erwNach25']), gdb: pick(['', '', '50', '80', '100', 'antrag']),
    blind: pick(['', '', '', '', 'blind', 'hoch']), emStd: pick(['', '', '', 'unter3', '3bis6', 'unklar']),
    schwanger: rnd() < 0.05, warmwasser: rnd() < 0.1,
    bezug: rnd() < 0.15 ? { [pick(['grundsicherungsgeld', 'sozialamt', 'wohngeld', 'kiz', 'kindergeld'])]: true } : {}
  };
}

// Erwarteter Text einer Karte, unabhängig von der App aus den Sprachdateien gebaut
function text(lang, key, p) {
  const dl = I18N[lang] || I18N.de;
  let s = Object.prototype.hasOwnProperty.call(dl, key) ? dl[key] : (Object.prototype.hasOwnProperty.call(I18N.de, key) ? I18N.de[key] : null);
  if (s == null) return null; // Schlüssel fehlt: wird als Fehler gemeldet
  const rtl = dl['meta.dir'] === 'rtl';
  s = s.replace(/\{eur:(\d+(?:\.\d+)?)\}/g, (m, n) => Fmt.euro(Number(n), lang, rtl));
  if (p) s = s.replace(/\{(\w+)\}/g, (m, k) => (!Object.prototype.hasOwnProperty.call(p, k) ? m : (p[k] && typeof p[k] === 'object' && 'eur' in p[k] ? Fmt.euro(p[k].eur, lang, rtl) : p[k])));
  return s;
}
const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
const melde = (art, info) => { if (fehler.filter((f) => f.art === art).length < 3) fehler.push({ art, info }); else fehler.push({ art }); };

// Kaputtes auf dem Bildschirm
const KAPUTT = [/\bNaN\b/, /\bundefined\b/, /\bInfinity\b/, /\bnull\b/, /\[object Object\]/, /\{[a-zA-Z]\w*(:\d+)?\}/, /[-−]\s?\d[\d.,]*\s?€|€\s?[-−]\d/, /(^|\s)(t|h|lvl|s|u|z|n|steps|plan|zuk|uz)\.[a-zA-Z][\w.]*\b/];

let geprueft = 0, karten = 0;
const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const e = haushalt();
  const langs = i % 12 === 0 ? LANGS : [LANGS[i % LANGS.length]];
  for (const lang of langs) {
    w.__solo.lang(lang);
    w.__solo.set(e);
    geprueft++;
    const out = w.__solo.eval();
    const dl = I18N[lang];
    const fall = { lang, e: JSON.stringify(e).slice(0, 400) };
    // Reihenfolge und Vollständigkeit: erst alle nicht-„nein“, dann die „nein“ im aufklappbaren Bereich
    const erwartet = out.results.filter((r) => r.level !== 'nein').concat(out.results.filter((r) => r.level === 'nein')).map((r) => r.id);
    const ist = [...d.querySelectorAll('#cards article.card')].map((a) => a.getAttribute('data-id'));
    if (ist.join() !== erwartet.join()) melde('Karten fehlen oder Reihenfolge falsch', { ...fall, ist: ist.join(), erwartet: erwartet.join() });
    for (const r of out.results) {
      karten++;
      const a = d.getElementById('c-' + r.id);
      if (!a) continue;
      const pill = a.querySelector('.pill');
      if (!pill.classList.contains(r.level)) melde('Einstufung (Farbe) passt nicht', { ...fall, id: r.id, ist: pill.className, soll: r.level });
      if (norm(pill.textContent).indexOf(norm(dl['lvl.' + r.level])) < 0) melde('Einstufung (Text) passt nicht', { ...fall, id: r.id, ist: pill.textContent });
      const h2 = text(lang, 'h.' + r.hl);
      if (h2 == null) melde('Überschrift fehlt in der Sprachdatei', { ...fall, key: 'h.' + r.hl });
      else if (norm(a.querySelector('.head2').textContent) !== norm(h2)) melde('Überschrift passt nicht', { ...fall, id: r.id, ist: a.querySelector('.head2').textContent, soll: h2 });
      const teile = r.tx.map((x) => text(lang, 't.' + x[0], x[1]));
      const fehltKey = r.tx.filter((x, j) => teile[j] == null).map((x) => 't.' + x[0]);
      if (fehltKey.length) { melde('Text fehlt in der Sprachdatei', { ...fall, id: r.id, keys: fehltKey.join() }); continue; }
      const body = a.querySelectorAll('.body p')[1];
      if (!body || norm(body.textContent) !== norm(teile.join(' '))) melde('Kartentext passt nicht zur Rechnung', { ...fall, id: r.id, ist: body && body.textContent.slice(0, 300), soll: teile.join(' ').slice(0, 300) });
      // Jeder Betrag, für den der Text einen Platzhalter hat, steht so auf der Karte; Platzhalter des deutschen Textes gibt es auch in der Übersetzung
      r.tx.forEach((x) => {
        const roh = (l) => { const t2 = (I18N[l] || {})['t.' + x[0]]; return t2 == null ? I18N.de['t.' + x[0]] : t2; };
        const ph = (s2) => new Set((String(s2).match(/\{(\w+)\}/g) || []).map((m) => m.slice(1, -1)));
        const phDe = ph(roh('de')), phL = ph(roh(lang));
        phDe.forEach((k) => { if (!phL.has(k)) melde('Platzhalter fehlt in der Übersetzung', { ...fall, key: 't.' + x[0], k }); });
        Object.keys(x[1] || {}).forEach((k) => {
        const v = x[1][k];
        if (phL.has(k) && v && typeof v === 'object' && 'eur' in v) {
          if (!isFinite(v.eur) || v.eur < 0) melde('Betrag ungültig oder negativ', { ...fall, id: r.id, key: x[0], k, v: v.eur });
          const s = Fmt.euro(v.eur, lang, dl['meta.dir'] === 'rtl');
          if (body && norm(body.textContent).indexOf(norm(s)) < 0) melde('Betrag fehlt auf der Karte', { ...fall, id: r.id, key: x[0], betrag: s });
        }
        });
      });
    }
    // Zählung oben = Karten
    const n = { ja: 0, vielleicht: 0 };
    out.results.forEach((r) => { if (r.level in n) n[r.level]++; });
    const zahl = norm(d.getElementById('count').textContent);
    const sollZahl = norm([n.ja ? text(lang, 'c.ja', { n: n.ja }) : '', n.vielleicht ? text(lang, 'c.vielleicht', { n: n.vielleicht }) : ''].filter(Boolean).join(' · ') || text(lang, 'c.none'));
    if (zahl !== sollZahl) melde('Zählung oben passt nicht', { ...fall, ist: zahl, soll: sollZahl });
    // Hinweise „Das solltest du beachten“ = Rechnung
    const tog = [...d.querySelectorAll('#together li')].map((li) => norm(li.textContent));
    const sollTog = out.zusammen.map((z) => norm(text(lang, z[0], z[1]) || '?' + z[0]));
    if (tog.join('|') !== sollTog.join('|')) melde('Hinweise „beachten“ passen nicht', { ...fall, ist: tog.join(' | ').slice(0, 200), soll: sollTog.join(' | ').slice(0, 200) });
    // Speichern und Laden: gespeicherter Stand ergibt nach dem Laden genau dasselbe Ergebnis
    if (i % 3 === 0) {
      w.__solo.speichern();
      const gesp = JSON.parse(w.localStorage.getItem('lotse.state') || 'null');
      const vorher = JSON.stringify(out.results.map((r) => [r.id, r.level, r.tx]));
      if (!gesp || !gesp.s) melde('Speichern: kein Speicherstand', fall);
      else {
        w.__solo.set(gesp.s);
        const nachher = JSON.stringify(w.__solo.eval().results.map((r) => [r.id, r.level, r.tx]));
        if (nachher !== vorher) melde('Speichern und Laden ändert das Ergebnis', { ...fall, vorher: vorher.slice(0, 200), nachher: nachher.slice(0, 200) });
      }
    }
    // Kaputtes irgendwo im Ergebnis (Karten, Übersicht, Hinweise, Auswahl für die Antragsmappe)
    const alles = ['ergebnis', 'pick'].map((id) => d.getElementById(id)).filter(Boolean).map((x) => x.textContent).join('\n');
    KAPUTT.forEach((re) => { const m = alles.match(re); if (m) melde('Kaputte Anzeige: ' + re, { ...fall, fund: alles.slice(Math.max(0, m.index - 60), m.index + 60) }); });
  }
}
if (errors.length) melde('Skriptfehler', errors.slice(0, 3).join(' | '));

// Betragsformat je Sprache (Stichproben): Tausender, Cent, Eurozeichen
const FMT = { de: ['1.234 €', '242,70 €'], en: ['€1,234', '€242.70'], pl: ['1234 €', '242,70 €'] };
Object.keys(FMT).forEach((l) => { const a = Fmt.euro(1234, l), b = Fmt.euro(242.7, l); if (norm(a).replace(/\s/g, ' ') !== FMT[l][0].replace(/\s/g, ' ') && !(l === 'pl' && /^1\s?234\s?€$/.test(norm(a)))) melde('Betragsformat ' + l, { ist: a, soll: FMT[l][0] }); if (norm(b) !== FMT[l][1]) melde('Betragsformat ' + l + ' (Cent)', { ist: b, soll: FMT[l][1] }); });

const arten = {};
fehler.forEach((f) => { arten[f.art] = (arten[f.art] || 0) + 1; });
if (fehler.length) {
  console.log('FEHLER Anzeige-Test:');
  Object.keys(arten).forEach((a) => { console.log('- ' + a + ': ' + arten[a] + 'x'); const b = fehler.find((f) => f.art === a && f.info); if (b) console.log('  Beispiel: ' + JSON.stringify(b.info).slice(0, 900)); });
  process.exit(1);
}
console.log('[anzeige-rechnung] Anzeige-Test bestanden: ' + geprueft + ' Seiten (' + N + ' Haushalte, 8 Sprachen), ' + karten + ' Karten mit Einstufung, Überschrift, Text und jedem Betrag wie berechnet; Speichern und Laden ohne Änderung, keine kaputte Anzeige (' + Math.round((Date.now() - t0) / 1000) + ' s)');
process.exit(0);
