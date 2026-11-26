// Oberfläche des Prüfpakets: in der Vorschau (erweiterungen/vorschau.html) und in der App unter „Brief prüfen“ (scripts/build.js).
// In der App gibt es keine Reiter und keine Lizenzprüfung.
// Alle Ausgaben über textContent bzw. Elemente – nie innerHTML mit Eingaben (Schutz vor eingeschleustem Code).
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  // „Keine Rechtsberatung“: immer derselbe Satz (Text rb.satz in src/lang/*.json); in der App aus der gewählten Sprache
  const RB_SATZ = 'Erste Einschätzung, keine Rechtsberatung. Es entscheidet das Amt, im Streit das Gericht.';
  const rbSatz = () => (window.SoloMehr && window.SoloMehr.rb ? window.SoloMehr.rb() : RB_SATZ);
  // Texte in der App-Sprache (src/lang/zusatz/*.json über window.SoloMehr.t); in der Vorschau ohne App der deutsche Text
  const tA = (k, de, p) => {
    const x = window.SoloMehr && window.SoloMehr.t ? window.SoloMehr.t(k, p) : null;
    return x && x !== k ? x : String(de).replace(/\{(\w+)\}/g, (m, n) => (p && p[n] != null ? p[n] : m));
  };
  const h = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  };
  const eur = (x) => BescheidSGB2.eur(x);
  const zahl = (s) => String(s).replace('.', ',');
  const heute = () => new Date().toISOString().slice(0, 10);
  const de = (s) => { const [y, m, d] = s.split('-'); return `${d}.${m}.${y}`; };

  // ---------------- Erkannte Werte prüfen ----------------
  // Werte aus Scan, PDF oder eingefügtem Text sind nur ein Vorschlag: Die Texterkennung kann Ziffern verlesen (z. B. 1.579 statt 1.570)
  // oder eine falsche Zeile treffen (Höchstbetrag statt Miete). Darum bleiben sie markiert („erkannt – bitte prüfen“), bis der Nutzer
  // „Werte stimmen“ tippt oder das Feld ändert. Bis dahin zeigt das Ergebnis keinen Vergleich und es entsteht kein Widerspruch.
  // Teil → [Abschnitt, Formular (Hinweis steht davor), neu zeichnen]
  const ERK = { bs: ['p-bescheid', 'bs-form', () => zeigeBescheid()], ga: ['p-gsa', 'ga-form', () => zeigeGSA()], wg: ['p-wg', 'wg-form', () => zeigeWG()],
    kz: ['p-kiz', 'kz-form', () => zeigeKiZ()], nk: ['p-nk', 'nk-form', () => zeigeNK()], pf: ['p-pflege', 'pf-form', () => zeigePflege()] };
  const erkOffen = {};
  const erkFelder = (p) => ($(ERK[p][0]) ? [...$(ERK[p][0]).querySelectorAll('.pp-erkannt')] : []);
  const erkWarte = () => tA('bp.erk.warte', 'Bitte zuerst die erkannten Werte prüfen.');
  function erkBeschr(el, id, an) { // aria-describedby um eine Kennung ergänzen bzw. sie entfernen, andere bleiben
    const alt = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== id);
    if (an) alt.push(id);
    if (alt.length) el.setAttribute('aria-describedby', alt.join(' ')); else el.removeAttribute('aria-describedby');
  }
  function erkFeldWeg(el, p) {
    el.classList.remove('pp-erkannt', 'pp-unsicher');
    erkBeschr(el, p + '-erk-t', false); erkBeschr(el, el.id + '-unsicher', false);
    const u = el.id && $(el.id + '-unsicher'); if (u) u.remove();
  }
  // Erst prüfen, dann bestätigen (GOV.UK „Check answers“): Hinweis über den Werten, Knopf „Werte stimmen“ darunter (nach dem letzten Formular).
  // Fehlende Angaben stehen schon im Hinweis oben, mit Sprung zum Formular (GOV.UK Error summary), nicht erst unten im Ergebnis.
  const ERK_ENDE = { pf: 'pf-form2' };
  function erkHinweis(p) {
    let d = $(p + '-erk');
    if (!d) {
      d = h('div', { class: 'pp-erk-hinweis', id: p + '-erk' },
        h('p', { id: p + '-erk-t', 'data-t': 'bp.erk.t', text: tA('bp.erk.t', 'Diese Werte hat SoLo aus dem Brief gelesen. Bitte vergleiche sie mit dem Brief.') }),
        h('div', { class: 'pp-erk-fehlt', id: p + '-erk-fehlt', hidden: true }));
      $(ERK[p][1]).insertAdjacentElement('beforebegin', d);
      const unten = h('div', { class: 'btns pp-erk-unten', id: p + '-erk-unten' },
        h('button', { type: 'button', class: 'btn primary', id: p + '-erk-ok', 'data-t': 'bp.erk.ok', text: tA('bp.erk.ok', 'Werte stimmen'), onclick: () => erkFertig(p) }));
      $(ERK_ENDE[p] || ERK[p][1]).insertAdjacentElement('afterend', unten);
    }
    return d;
  }
  // Solange erkannte Werte offen sind: was danach noch fehlt, oben im Hinweis (mit Sprung zum Formular)
  function erkFehlt(p, liste) {
    const box = $(p + '-erk-fehlt'); if (!box) return;
    box.replaceChildren();
    box.hidden = !(erkOffen[p] && liste && liste.length);
    if (box.hidden) return;
    const zu = () => { const f = $(ERK[p][1]), el = f.querySelector('input, select'); f.scrollIntoView({ block: 'start' }); if (el) el.focus({ preventScroll: true }); };
    box.append(h('p', { class: 'pp-fehlt-liste' }, h('strong', { 'data-t': 'bp.erk.fehlt', text: tA('bp.erk.fehlt', 'Außerdem fehlt noch:') }), ' ' + liste.join(', ') + '.'),
      h('button', { type: 'button', class: 'linkbtn', 'data-t': 'bp.erk.zu', text: tA('bp.erk.zu', 'Zu den Angaben'), onclick: zu }));
  }
  // Alle Markierungen eines Teils weg (bestätigt, neu eingelesen oder geleert). neu = false: nicht neu zeichnen
  function erkFertig(p, neu) {
    const war = erkOffen[p];
    erkOffen[p] = false;
    for (const el of erkFelder(p)) erkFeldWeg(el, p);
    const d = $(p + '-erk'); if (d) d.hidden = true;
    const u = $(p + '-erk-unten'); if (u) u.hidden = true;
    if (war && neu !== false) ERK[p][2]();
  }
  // Nach dem Einlesen: markierte Felder des Teils sperren das Ergebnis, bis sie bestätigt oder geändert sind.
  // unsicher: Feld-IDs mit geringer Sicherheit (nur Foto) – zusätzlich farbig und mit kurzem Text „Schwer zu lesen“
  function erkMarke(p, unsicher) {
    const felder = erkFelder(p);
    if (!felder.length) { erkFertig(p, false); return; }
    erkOffen[p] = true;
    erkHinweis(p).hidden = false; $(p + '-erk-unten').hidden = false;
    for (const el of felder) {
      erkBeschr(el, p + '-erk-t', true);
      if (el.id && unsicher && unsicher.has(el.id)) {
        el.classList.add('pp-unsicher');
        const u = h('p', { class: 'small pp-unsicher-t', id: el.id + '-unsicher', 'data-t': 'bp.erk.feld', text: tA('bp.erk.feld', 'Schwer zu lesen. Bitte genau prüfen.') });
        el.insertAdjacentElement('afterend', u); erkBeschr(el, u.id, true);
      }
      if (el.dataset.erkHoert) continue;
      el.dataset.erkHoert = '1';
      // Eigene Änderung = geprüft. Läuft vor der Neuberechnung des Formulars (Ziel-Element vor dem Formular).
      const weg = () => { if (!el.classList.contains('pp-erkannt')) return; erkFeldWeg(el, p); if (erkOffen[p] && !erkFelder(p).length) erkFertig(p); };
      el.addEventListener('input', weg); el.addEventListener('change', weg);
    }
  }
  // Im Ergebnis: solange Werte offen sind, nur der Hinweis. true = gesperrt
  function erkSperre(p, box) {
    if (!erkOffen[p]) return false;
    box.append(h('h2', { text: 'Ergebnis' }), h('p', { class: 'pp-erk-warte', 'data-t': 'bp.erk.warte', text: erkWarte() }));
    return true;
  }
  // Plausibilität bei Texterkennung aus einem Foto: welche erkannten Werte unsicher sind.
  // Spannen sind keine Rechtsgrenzen, nur grobe Grenzen für Monatsbeträge, außerhalb derer ein Lesefehler wahrscheinlich ist.
  const SPANNE = { 'bs-b-regel': [100, 8000], 'bs-b-ae': [0, 2000], 'bs-b-schw': [0, 1500], 'bs-b-ww': [0, 500], 'bs-b-kdu': [0, 6000], 'bs-b-eink': [0, 15000], 'bs-b-kg': [0, 4000], 'bs-b-zahl': [0, 15000],
    'bs-miete': [30, 6000], 'bs-heiz': [0, 1500], 'ga-b-regel': [100, 3000], 'ga-b-g': [0, 500], 'ga-b-ww': [0, 200], 'ga-b-kdu': [0, 4000], 'ga-b-eink': [0, 8000], 'ga-b-zahl': [0, 8000], 'ga-miete': [30, 4000], 'ga-heiz': [0, 1000],
    'wg-b-miete': [30, 4000], 'wg-b-eink': [0, 15000], 'wg-b-wg': [1, 3000], 'wg-kalt': [30, 6000], 'wg-n': [1, 20], 'kz-b-bedarf': [100, 8000], 'kz-b-eink': [0, 15000], 'kz-b-kiz': [1, 4000], 'kz-wohn': [30, 6000],
    'nk-voraus': [0, 30000], 'nk-heiz': [0, 15000], 'nk-wfl': [5, 500], 'nk-gfl': [5, 200000] };
  const DATUM_FELD = { jc: 'bs-datum', sa: 'ga-datum', wg: 'wg-datum', fk: 'kz-datum' };
  const isoGut = (s) => { if (!/^\d{4}-\d\d-\d\d$/.test(String(s || ''))) return false; const d = new Date(s + 'T00:00:00Z'); return !isNaN(d) && d.toISOString().slice(0, 10) === s; };
  function unsichereFelder(art, r, quelle, jetzt) {
    const aus = new Set(), f = Object.assign({}, (r && r.felder) || {});
    const datumId = DATUM_FELD[art]; if (datumId && r && r.datum) f[datumId] = r.datum;
    const n = (id) => (typeof f[id] === 'number' && isFinite(f[id]) ? f[id] : null);
    // 1. Konfidenz der Texterkennung (falls verfügbar): Wörter mit Ziffern, die die Erkennung selbst als unsicher meldet
    const schwach = new Set(((quelle && quelle.unsicher) || []).map((w) => String(w).replace(/\D/g, '')).filter((d) => d.length >= 3));
    const ziffern = (v) => (typeof v === 'number' ? [String(Math.round(v * 100)), Number.isInteger(v) ? String(v) : ''] : isoGut(v) ? [v.slice(8, 10) + v.slice(5, 7) + v.slice(0, 4)] : [String(v).replace(/\D/g, '')]);
    if (schwach.size) for (const [id, v] of Object.entries(f)) if (ziffern(v).some((d) => d && schwach.has(d))) aus.add(id);
    // 2. Wert außerhalb üblicher Spannen
    for (const [id, [lo, hi]] of Object.entries(SPANNE)) { const v = n(id); if (v != null && (v < lo || v > hi)) aus.add(id); }
    // 3. Summe passt nicht: Zahlbetrag = Bedarfe + Unterkunft − Einkommen (wie BescheidSGB2/BescheidGSA rechnen), Spielraum 1 €
    const summe = (plus, minus, zahl) => {
      if (plus.concat([zahl]).some((id) => n(id) == null && !/-(ae|schw|ww|g)$/.test(id))) return;
      const s = plus.reduce((a, id) => a + (n(id) || 0), 0) - minus.reduce((a, id) => a + (n(id) || 0), 0);
      // Grundsicherungsgeld: Der Zahlbetrag enthält oft den Sofortzuschlag (§ 72 SGB II, 25 € je Kind) – Vielfache davon gelten als passend
      const sz = art === 'jc' ? Rules.RULES.sofortzuschlag : 0, d = n(zahl) - Math.max(0, s);
      const passtSZ = sz > 0 && d > 0 && d <= 10 * sz + 1 && Math.abs(d - Math.round(d / sz) * sz) <= 1;
      if (Math.abs(d) > 1 && !passtSZ) plus.concat(minus, [zahl]).filter((id) => n(id) != null).forEach((id) => aus.add(id));
    };
    if (art === 'jc') summe(['bs-b-regel', 'bs-b-ae', 'bs-b-schw', 'bs-b-ww', 'bs-b-kdu'], ['bs-b-eink', 'bs-b-kg'], 'bs-b-zahl');
    if (art === 'sa') summe(['ga-b-regel', 'ga-b-g', 'ga-b-ww', 'ga-b-kdu'], ['ga-b-eink'], 'ga-b-zahl');
    // 4. Datum: ungültig, in der Zukunft oder älter als 3 Jahre (ein Bescheid so alt ist für die Prüfung unüblich)
    const heuteIso = (jetzt || new Date()).toISOString().slice(0, 10), vor3 = String(+heuteIso.slice(0, 4) - 3) + heuteIso.slice(4);
    if (datumId && f[datumId] != null && (!isoGut(f[datumId]) || f[datumId] > heuteIso || f[datumId] < vor3)) aus.add(datumId);
    // Nebenkosten: Zeitraum höchstens 12 Monate (§ 556 Abs. 3 Satz 1 BGB, gesetze-im-internet.de, abgerufen 21.11.2026), Ende nach Beginn
    if (f['nk-von'] != null || f['nk-bis'] != null) {
      const von = f['nk-von'], bis = f['nk-bis'];
      const tage = isoGut(von) && isoGut(bis) ? (new Date(bis) - new Date(von)) / 864e5 : NaN;
      if (!(tage > 0 && tage <= 366)) ['nk-von', 'nk-bis'].forEach((id) => { if (f[id] != null) aus.add(id); });
    }
    return aus;
  }
  async function kopiere(textarea, msg) {
    try { const cb = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Clipboard; if (cb) await cb.write({ string: textarea.value }); else await navigator.clipboard.writeText(textarea.value); msg.textContent = 'Kopiert. Du kannst den Text jetzt in ein Schreibprogramm oder eine E-Mail einfügen.'; } catch (e) { textarea.hidden = false; textarea.removeAttribute('readonly'); textarea.select(); msg.textContent = 'Text ist markiert. Bitte mit Strg+C bzw. „Kopieren“ übernehmen.'; textarea.setAttribute('readonly', ''); }
  }

  // ---------------- Reiter ----------------
  const tabs = [...document.querySelectorAll('nav[aria-label="Bausteine"] [role="tab"]')];
  function zeige(tab) {
    for (const t of tabs) { const an = t === tab; t.setAttribute('aria-selected', an); t.tabIndex = an ? 0 : -1; $(t.getAttribute('aria-controls')).hidden = !an; }
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => zeige(t));
    t.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; zeige(n); n.focus(); } });
  });

  // ---------------- Pflegegutachten ----------------
  const P = Pflege;
  function baueModule() {
    const box = $('pf-module');
    // Jeder Bereich zugeklappt (UX-Audit D #3: sonst 64 Auswahllisten untereinander); Überschrift zeigt, wie viel eingetragen ist
    for (const m of [1, 2, 3, 4, 5, 6]) {
      const fs = h('fieldset', {}, h('legend', { class: 'vh', text: `Bereich ${m}: ${P.MODUL[m].kurz}` }), h('p', { class: 'small muted', text: `Im Gutachten: „${P.MODUL[m].name}“. ${P.MODUL[m].leicht}. Gewichtung ${P.MODUL[m].gewicht}.` }));
      if (m === 5) {
        fs.append(h('p', { class: 'small', text: 'Trage ein, wie oft jemand helfen muss, weil die Person es nicht selbst kann. Was sie selbst schafft, zählt nicht.' }));
        fs.append(h('div', { class: 'freq kopf' }, h('span', { text: 'Hilfe' }), h('span', { text: 'pro Tag' }), h('span', { text: 'pro Woche' }), h('span', { text: 'pro Monat' })));
        for (const [id, name, leicht] of P.M5A.concat(P.M5B)) {
          fs.append(h('div', { class: 'freq' }, h('span', {}, `${id} ${leicht}`, h('span', { class: 'amt', text: name })),
            ...['tag', 'woche', 'monat'].map((x) => h('input', { type: 'number', min: '0', step: '1', inputmode: 'numeric', id: `pf-${id}-${x}`, 'aria-label': `${id} ${leicht}: Anzahl ${x === 'tag' ? 'pro Tag' : x === 'woche' ? 'pro Woche' : 'pro Monat'}` }))));
        }
        for (const [id, name, leicht] of P.M5C) {
          const ist512 = id === '5.12';
          fs.append(h('div', { class: 'freq', id: id === '5.K' ? 'pf-zeile-5K' : null, hidden: id === '5.K' }, h('span', {}, `${id} ${leicht}`, h('span', { class: 'amt', text: name })),
            ist512 ? h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'pf-5.12-taeglich' }), 'täglich') : h('span', {}),
            ...['woche', 'monat'].map((x) => h('input', { type: 'number', min: '0', step: '1', inputmode: 'numeric', id: `pf-${id}-${x}`, 'aria-label': `${id} ${leicht}: Anzahl pro ${x === 'woche' ? 'Woche' : 'Monat'}` }))));
        }
        const sel = h('select', { id: 'pf-5.16' }, P.SKALA.sel.stufen.map((s, i) => h('option', { value: i, text: `${s} (${P.SKALA.sel.kurz[i]})` })));
        fs.append(h('div', { class: 'row' }, h('label', { for: 'pf-5.16' }, '5.16 Diät und ärztliche Anweisungen einhalten', h('span', { class: 'amt', text: 'Einhaltung einer Diät und anderer krankheits- oder therapiebedingter Verhaltensvorschriften' })), sel));
      } else {
        for (const k of P.KRITERIEN.filter((x) => x.m === m)) {
          const sk = P.SKALA[k.s];
          const sel = h('select', { id: 'pf-' + k.id }, h('option', { value: '', text: '– nicht eingetragen –' }), sk.stufen.map((s, i) => h('option', { value: i, text: `${s} (${sk.kurz[i]})` })));
          fs.append(h('div', { class: 'row' }, h('label', { for: 'pf-' + k.id }, `${k.id} ${k.leicht}`, h('span', { class: 'amt', text: k.name + (k.faktor ? ` (zählt ${k.faktor}-fach)` : '') })), sel));
        }
      }
      box.append(h('details', { class: 'pf-bereich', id: 'pf-bereich-' + m, 'data-m': m }, h('summary', {}, h('span', { text: `Bereich ${m}: ${P.MODUL[m].kurz}` }), h('span', { class: 'pf-zahl muted small' })), fs));
    }
  }
  function pfZaehlen() {
    for (const d of document.querySelectorAll('#pf-module details.pf-bereich')) {
      const m = +d.dataset.m; let n = 0, x = 0;
      if (m === 5) for (const z of d.querySelectorAll('.freq:not(.kopf)')) { if (z.hidden) continue; n++; if ([...z.querySelectorAll('input')].some((i) => (i.type === 'checkbox' ? i.checked : i.value !== ''))) x++; }
      else for (const sel of d.querySelectorAll('select')) { n++; if (sel.value !== '') x++; }
      const pruefen = !!d.querySelector('.pp-erkannt'); // aus dem Brief gelesen, noch nicht bestätigt (UX-Audit B)
      d.querySelector('.pf-zahl').textContent = ` · ${x} von ${n} eingetragen` + (pruefen ? ' · bitte prüfen' : '');
      d.classList.toggle('pf-b-pruefen', pruefen);
    }
  }
  // Oben (nach „Wer wird gepflegt?“, vor den Werten aus dem Gutachten): die eigene Einschätzung aus SoLo, damit man weiß, womit verglichen wird
  function zeigeEigenOben() {
    let k = $('pf-eigen-oben');
    if (!k) { k = h('div', { class: 'card pf-eigen-oben', id: 'pf-eigen-oben', hidden: true }); $('pf-form').insertAdjacentElement('afterend', k); }
    k.replaceChildren(); k.hidden = !eigen;
    if (!eigen) return;
    const r = P.rechne(eigen);
    k.append(h('p', {}, h('strong', { text: r.pg ? `Deine Einschätzung in SoLo: Pflegegrad ${r.pg}` : 'Deine Einschätzung in SoLo: kein Pflegegrad' }), h('span', { class: 'muted', text: ` · ${zahl(r.gesamt)} von 100 Punkten` })),
      h('p', { class: 'small', text: 'Trage darunter die Werte aus dem Gutachten ein, Bereich für Bereich. SoLo zeigt dann jede Bewertung, die im Gutachten niedriger ist.' }));
  }
  function lesePflege() {
    const stufen = {};
    for (const k of P.KRITERIEN) { const v = $('pf-' + k.id).value; if (v !== '') stufen[k.id] = +v; }
    const m5 = {};
    for (const [id] of P.M5A.concat(P.M5B)) m5[id] = { tag: $(`pf-${id}-tag`).value, woche: $(`pf-${id}-woche`).value, monat: $(`pf-${id}-monat`).value };
    for (const [id] of P.M5C) m5[id] = { woche: $(`pf-${id}-woche`).value, monat: $(`pf-${id}-monat`).value, taeglich: id === '5.12' && $('pf-5.12-taeglich').checked };
    m5['5.16'] = +$('pf-5.16').value;
    return { stufen, m5, inkontinenz: { harn: $('pf-harn').checked, stuhl: $('pf-stuhl').checked }, alterJahre: $('pf-alter').value, alterMonate: $('pf-monate').value, pgBescheid: $('pf-pgb').value };
  }
  function setzePflege(g) {
    for (const k of P.KRITERIEN) $('pf-' + k.id).value = g.stufen && g.stufen[k.id] != null ? g.stufen[k.id] : '';
    if (g.inkontinenz) { $('pf-harn').checked = !!g.inkontinenz.harn; $('pf-stuhl').checked = !!g.inkontinenz.stuhl; }
    if (g.pgBescheid != null) $('pf-pgb').value = g.pgBescheid;
    if (g.m5) for (const [id, v] of Object.entries(g.m5)) {
      if (id === '5.16') { $('pf-5.16').value = v; continue; }
      for (const x of ['tag', 'woche', 'monat']) { const el = $(`pf-${id}-${x}`); if (el) el.value = v && v[x] ? v[x] : ''; }
      if (id === '5.12') $('pf-5.12-taeglich').checked = !!(v && v.taeglich);
    }
  }
  function weg(w) {
    if (w.id.startsWith('M5')) {
      const t = { a: 'Medikamente, Spritzen, Messen oder Hilfsmittel', b: 'Wunden, Stoma, Katheter oder Übungen zu Hause', c: 'Arztbesuchen oder aufwendigen Behandlungen', d: 'Diät oder ärztlichen Anweisungen' }[w.id.slice(2)];
      return `Umgang mit Krankheit: öfter Hilfe bei ${t}, als im Gutachten steht`;
    }
    const k = P.kriterium(w.id), sk = P.SKALA[k.s], ist = +($('pf-' + k.id).value || 0);
    return `${k.leicht}: „${sk.kurz[w.nach]}“ statt „${sk.kurz[ist]}“`;
  }
  // Punkteleiste 0–100 mit den Grenzen der Pflegegrade (Text steht zusätzlich daneben, die Leiste ist Schmuck)
  function leiste(gesamt) {
    const bar = h('div', { class: 'bar', 'aria-hidden': 'true' }, h('div', { class: 'fill', style: `width:${Math.min(100, gesamt)}%` }));
    P.GRAD_AB.forEach((x, i) => bar.append(h('div', { class: 'mark', style: `left:${x}%` }, h('span', { text: `PG ${i + 1}` }))));
    return bar;
  }
  function zeigePflege() {
    const g = lesePflege(), r = P.rechne(g), box = $('pf-erg');
    $('pf-monate-box').hidden = !(g.alterJahre !== '' && +g.alterJahre < 2);
    const war5K = $('pf-zeile-5K').hidden;
    $('pf-zeile-5K').hidden = !r.kind;
    if (war5K && r.kind && $('pf-bereich-5')) $('pf-bereich-5').open = true; // neue Frage (Kind unter 18 Monaten): Bereich 5 aufklappen, damit man sie sieht
    pfZaehlen(); zeigeEigenOben();
    box.replaceChildren();
    if (erkSperre('pf', box)) { zeigeErklaerung(g, r); if ($('pf-ab-info')) $('pf-ab-info').replaceChildren(h('p', { 'data-t': 'bp.erk.warte', text: erkWarte() })); return; }
    box.append(h('h2', { text: 'Ergebnis: das sagt das Gutachten' }),
      h('p', {}, h('span', { class: 'big', text: r.pg ? `Pflegegrad ${r.pg}` : 'Kein Pflegegrad' }), h('span', { class: 'muted', text: ` · ${zahl(r.gesamt)} von 100 Punkten` })),
      leiste(r.gesamt));
    vergleichTabelle(g, r, box);
    for (const satz of P.zusammenfassung(g, r, Rules)) box.append(h('p', { text: satz }));
    // Bereiche als kleine Tabelle
    const tb = h('tbody', {}, [1, 2, 3, 4, 5, 6].map((m) => { const mo = r.module[m], zaehlt = !(m === 2 || m === 3) || r.zaehlt23 === m; return h('tr', {}, h('td', { text: P.MODUL[m].kurz }), h('td', { text: mo.bereichName }), h('td', { class: 'z', text: zaehlt ? `${zahl(mo.gewichtet)} / ${zahl(P.ANLAGE2[m].gew[4])}` : 'zählt nicht' })); }));
    box.append(h('details', {}, h('summary', { text: 'Punkte je Bereich' }), h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': 'Punkte je Bereich' }, h('table', { class: 'modtab' }, h('thead', {}, h('tr', {}, h('th', { text: 'Bereich' }), h('th', { text: 'Einstufung' }), h('th', { class: 'z', text: 'Punkte' }))), tb))));
    if (r.fehltBisNaechster != null && !r.besonders && r.hebel.moeglich) {
      const jetzt = P.geld(r.pg, Rules), naechst = P.geld(r.naechsterPg, Rules);
      box.append(h('h3', { text: `Was für Pflegegrad ${r.naechsterPg} fehlt` }));
      if (naechst.pflegegeld > jetzt.pflegegeld) box.append(h('p', { text: `Pflegegrad ${r.naechsterPg} brächte ${eur(naechst.pflegegeld - jetzt.pflegegeld)} mehr Pflegegeld im Monat.` }));
      box.append(h('p', { text: r.grenzfall ? 'Es ist knapp. Schon diese Änderungen würden reichen, wenn sie im Alltag wirklich so sind:' : 'Dafür müsste sich einiges ändern, zum Beispiel:' }));
      r.hebel.optionen.slice(0, 3).forEach((o, i) => {
        const btn = o.wege.every((w) => !w.id.startsWith('M5')) ? h('button', { type: 'button', class: 'btn', onclick: () => { o.wege.forEach((w) => fuegeWiderspruchHinzu(w.id, w.nach, false)); $('pf-wid').scrollIntoView({ block: 'start' }); } }, 'Für den Widerspruch übernehmen') : null;
        box.append(h('div', { class: 'opt' }, h('strong', { text: `Möglichkeit ${i + 1}: ${o.schritte === 1 ? 'eine Bewertung' : o.schritte + ' Bewertungen'} anders` }), h('ul', {}, o.wege.map((w) => h('li', { text: weg(w) }))), btn));
      });
      box.append(h('p', { class: 'small muted', text: 'Nur übernehmen, was im Alltag wirklich so ist. Ob eine Bewertung stimmt, wissen nur du und die gepflegte Person.' }));
    }
    box.append(h('details', {}, h('summary', { text: 'So rechnet die Pflegekasse' }), h('ul', {}, P.SO_GEHTS.map((t) => h('li', { text: t })))));
    zeigeErklaerung(g, r);
    zeigeVergleich(g, r);
  }
  // Das Gutachten einfach erklärt: jede eingetragene Bewertung mit ihrer Bedeutung im Alltag
  function zeigeErklaerung(g, r) {
    const box = $('pf-erkl'), offen = !!($('pf-erkl-mehr') && $('pf-erkl-mehr').open); box.replaceChildren();
    // Zugeklappt: die Erklärung jeder Bewertung ist lang (bis zu 48 Einträge) und nur Nachschlagen
    const inhalt = h('div', {});
    box.append(h('h2', { text: 'Das Gutachten einfach erklärt' }), h('p', { class: 'small muted', text: 'Hier steht jede Bewertung aus dem Gutachten mit dem, was sie im Alltag bedeutet. Stimmt etwas nicht mit dem Alltag überein, ist das ein Grund für einen Widerspruch.' }),
      h('details', { class: 'mehr', id: 'pf-erkl-mehr', open: offen }, h('summary', { text: 'Alle Bewertungen erklärt ansehen' }), inhalt));
    let leer = true;
    for (const z of P.erklaerung(g, r)) {
      const sek = h('section', { 'aria-labelledby': `erk-${z.modul}` }, h('h3', { id: `erk-${z.modul}`, text: `${z.modul}. ${z.kurz}` }), h('p', { class: 'small', text: z.satz }));
      const eintraege = z.modul === 5 ? z.kriterien.filter((k) => k.punkte > 0) : z.kriterien;
      for (const k of eintraege) {
        leer = false;
        sek.append(h('div', { class: 'krit' }, h('span', { class: 'pkt', text: `${k.punkte} ${k.punkte === 1 ? 'Punkt' : 'Punkte'}` }), h('strong', { text: k.titel }),
          k.stufe ? h('span', { class: 'stufe', text: `Im Gutachten: „${k.stufe}“` }) : null, h('p', { text: k.bedeutung })));
      }
      if (!eintraege.length) sek.append(h('p', { class: 'small muted', text: z.modul === 5 ? 'Keine Hilfe eingetragen.' : 'Noch keine Bewertung eingetragen.' }));
      inhalt.append(sek);
    }
    box.hidden = leer;
  }
  // Widerspruch Pflege. Mit eigener Einschätzung (Pflegegrad-Einschätzung der App) füllt sich die Liste „Wo das Gutachten zu niedrig ist“
  // von selbst: eine Karte je Bewertung, bei der das Gutachten weniger Punkte gibt als die eigene Einschätzung, mit Feld für den Alltag.
  // Richtigkeit: Nur Bewertungen, die aus dem Gutachten eingetragen sind, zählen; fehlende werden gezählt und genannt, nicht als Abweichung gewertet.
  let eigen = null;
  const punkteVon = (k, stufe) => (stufe == null ? 0 : P.SKALA[k.s].punkte[stufe] || 0);
  // Bereich 5: Maß je Maßnahme wie in pflege.js (1 Tag = 210 Einheiten, Woche 30, Monat 7; Arzt- und Therapiebesuche mit ihrer Gewichtung)
  const zahlP = (x) => (Number.isFinite(+x) && +x > 0 ? +x : 0);
  const M5C_F = Object.fromEntries(P.M5C.map((x) => [x[0], x[3]]));
  function m5Mass(id, v) {
    v = v || {};
    if (M5C_F[id]) { const f = M5C_F[id]; return (f.tag && v.taeglich ? f.tag : 0) + zahlP(v.woche) * f.woche + zahlP(v.monat) * f.monat; }
    return zahlP(v.tag) * 210 + zahlP(v.woche) * 30 + zahlP(v.monat) * 7;
  }
  function haeufigkeit(v) {
    v = v || {}; const t = [];
    if (v.taeglich) t.push('jeden Tag');
    if (zahlP(v.tag)) t.push(`${zahlP(v.tag)}-mal am Tag`);
    if (zahlP(v.woche)) t.push(`${zahlP(v.woche)}-mal pro Woche`);
    if (zahlP(v.monat)) t.push(`${zahlP(v.monat)}-mal im Monat`);
    return t.length ? t.join(' und ') : 'keine Hilfe';
  }
  const M5_NAME = Object.fromEntries(P.M5A.concat(P.M5B, P.M5C).map((x) => [x[0], x]));
  // Jede Bewertung des Gutachtens mit der eigenen Einschätzung vergleichen: Kriterien (nach Punkten), Inkontinenz, jede Maßnahme in Bereich 5, 5.16.
  // ab: Gutachten niedriger als die eigene Einschätzung. fehlt: Kriterium mit eigener Bewertung, im Gutachten noch nicht eingetragen (zählt nicht als Abweichung).
  function abweichungen(g, kind) {
    const ab = [], fehlt = [];
    if (!eigen) return { ab, fehlt };
    const es = eigen.stufen || {}, em = eigen.m5 || {}, ei = eigen.inkontinenz || {};
    for (const art of ['harn', 'stuhl']) if (ei[art] && !(g.inkontinenz && g.inkontinenz[art]))
      ab.push({ typ: 'ink', id: 'ink-' + art, titel: art === 'harn' ? 'Harninkontinenz (oder Katheter, Urostoma)' : 'Stuhlinkontinenz (oder Stoma)', ist: 'nicht angegeben', soll: 'überwiegend oder vollständig inkontinent' });
    for (const k of P.KRITERIEN) {
      const e = es[k.id], gu = g.stufen[k.id];
      if (e == null) continue;
      if (gu == null) { if (punkteVon(k, e) > 0) fehlt.push(k); continue; }
      if (punkteVon(k, e) > punkteVon(k, gu)) ab.push({ typ: 'stufe', id: k.id, k, e, gu });
    }
    for (const [id] of P.M5A.concat(P.M5B, P.M5C)) {
      if (id === '5.K' && !kind) continue;
      if (m5Mass(id, em[id]) > m5Mass(id, g.m5[id])) ab.push({ typ: 'm5', id, titel: `${id} ${M5_NAME[id][2]}`, ist: haeufigkeit(g.m5[id]), soll: haeufigkeit(em[id]), wert: em[id] });
    }
    const e16 = em['5.16'] != null ? +em['5.16'] : es['5.16'] != null ? +es['5.16'] : null, g16 = +g.m5['5.16'] || 0;
    if (e16 != null && e16 > g16) { const sk = P.SKALA.sel; ab.push({ typ: 'm5', id: '5.16', titel: '5.16 Diät oder ärztliche Anweisungen einhalten', ist: `„${sk.kurz[g16]}“ (${sk.stufen[g16]})`, soll: `„${sk.kurz[e16]}“ (${sk.stufen[e16]})`, wert: e16 }); }
    return { ab, fehlt };
  }
  // Eigene Einschätzung neben dem Gutachten: Punkte je Bereich (gewichtet nach Anlage 2 zu § 15 SGB XI, gerechnet von pflege.js), Unterschied hervorgehoben.
  // Von den Bereichen 2 und 3 zählt nur der höhere (§ 15 Abs. 3 SGB XI); ein Bereich, der nicht zählt, geht mit 0 in den Unterschied ein. Keine eigenen Zahlen.
  function vergleichTabelle(g, r, box) {
    if (!eigen || !Object.keys(g.stufen).length) return;
    const re = P.rechne(eigen);
    const zaehlt = (x, m) => !(m === 2 || m === 3) || x.zaehlt23 === m;
    const wert = (x, m) => (zaehlt(x, m) ? x.module[m].gewichtet : 0);
    const r2 = (x) => Math.round(x * 100) / 100;
    const diffText = (d) => (d > 0 ? '+' : d < 0 ? '−' : '') + zahl(Math.abs(d));
    const zelle = (x, m) => (zaehlt(x, m) ? zahl(x.module[m].gewichtet) : tA('bp.vgl.zaehltNicht', 'zählt nicht'));
    let mehr = 0;
    const zeilen = [1, 2, 3, 4, 5, 6].map((m) => {
      const d = r2(wert(re, m) - wert(r, m));
      if (d > 0) mehr++;
      return h('tr', { class: d > 0 ? 'pv-mehr' : null, 'data-m': String(m) }, h('td', { text: P.MODUL[m].kurz }), h('td', { class: 'z', text: zelle(re, m) }), h('td', { class: 'z', text: zelle(r, m) }),
        h('td', { class: 'z' }, d > 0 ? h('strong', { text: diffText(d) }) : diffText(d)));
    });
    const dg = r2(re.gesamt - r.gesamt);
    zeilen.push(h('tr', { class: 'pv-summe' + (dg > 0 ? ' pv-mehr' : '') }, h('th', { scope: 'row', text: tA('bp.vgl.gesamt', 'Zusammen') }), h('td', { class: 'z', text: zahl(re.gesamt) }), h('td', { class: 'z', text: zahl(r.gesamt) }),
      h('td', { class: 'z' }, dg > 0 ? h('strong', { text: diffText(dg) }) : diffText(dg))));
    const pgT = (x) => (x.pg ? tA('bp.vgl.pg', 'Pflegegrad {pg}', { pg: x.pg }) : tA('bp.vgl.kein', 'kein Pflegegrad'));
    const kurz = mehr ? tA('bp.vgl.mehr', 'In {n} von 6 Bereichen gibt das Gutachten weniger Punkte als deine Einschätzung (fett markiert).', { n: mehr }) : tA('bp.vgl.keinMehr', 'In keinem Bereich gibt das Gutachten weniger Punkte als deine Einschätzung.');
    const titel = tA('bp.vgl.h', 'Vergleich mit deiner Einschätzung');
    box.append(h('section', { class: 'pv-vergleich', id: 'pf-vgl', 'aria-labelledby': 'pf-vgl-h' }, h('h3', { id: 'pf-vgl-h', text: titel }),
      h('p', { id: 'pf-vgl-satz', text: tA('bp.vgl.satz', 'Deine Einschätzung: {e}. Gutachten: {g}.', { e: pgT(re), g: pgT(r) }) + ' ' + kurz }),
      h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': titel }, h('table', { class: 'modtab' },
        h('thead', {}, h('tr', {}, h('th', { text: tA('bp.vgl.bereich', 'Bereich') }), h('th', { class: 'z', text: tA('bp.vgl.eigen', 'Deine Punkte') }), h('th', { class: 'z', text: tA('bp.vgl.gutachten', 'Gutachten') }), h('th', { class: 'z', text: tA('bp.vgl.diff', 'Unterschied') }))),
        h('tbody', {}, zeilen))),
      h('p', { class: 'small muted', text: tA('bp.vgl.klein', 'Punkte nach Gewichtung, wie die Pflegekasse rechnet (§ 15 SGB XI). Plus heißt: Deine Einschätzung gibt dort mehr Punkte. Darunter steht, bei welchen Fragen genau.') })));
  }
  function zeigeVergleich(g, r) {
    const info = $('pf-ab-info'); if (!info) return;
    info.replaceChildren();
    const eingetragen = Object.keys(g.stufen).length > 0;
    if (!eigen) {
      const start = window.SoLoPflegeStart;
      info.append(h('div', { class: 'opt' }, h('p', { text: 'Noch keine eigene Einschätzung. Mach sie in wenigen Minuten (Fragen in einfacher Sprache). Danach zeigt SoLo hier von selbst jede Bewertung, die im Gutachten niedriger ist.' }),
        start ? h('div', { class: 'btns' }, h('button', { type: 'button', class: 'btn primary', id: 'pf-eigen-start', onclick: () => start() }, 'Pflegegrad selbst einschätzen')) : null));
    } else {
      const re = P.rechne(eigen), { ab, fehlt } = abweichungen(g, r.kind);
      const satz = [`Deine Einschätzung: ${re.pg ? 'Pflegegrad ' + re.pg : 'kein Pflegegrad'} (${zahl(re.gesamt)} Punkte).`];
      if (eingetragen) satz.push(`Gutachten: ${r.pg ? 'Pflegegrad ' + r.pg : 'kein Pflegegrad'} (${zahl(r.gesamt)} Punkte).`);
      satz.push(!eingetragen ? 'Trage oben die Bewertungen aus dem Gutachten ein oder scanne es, dann erscheinen die Abweichungen hier.' : ab.length ? `Bei ${ab.length} ${ab.length === 1 ? 'Frage' : 'Fragen'} ist das Gutachten niedriger als deine Einschätzung.` : 'Bei keiner Frage ist das Gutachten niedriger als deine Einschätzung.');
      info.append(h('p', { id: 'pf-vergleich', text: satz.join(' ') }));
      const m5Leer = !Object.entries(g.m5).some(([id, v]) => (id === '5.16' ? +v > 0 : m5Mass(id, v) > 0));
      if (eingetragen && m5Leer && ab.some((x) => x.typ === 'm5')) info.append(h('p', { class: 'small muted', id: 'pf-m5-leer', text: 'Bereich 5 (Umgang mit Krankheit und Behandlung) ist aus dem Gutachten noch leer. Steht dort wirklich keine Hilfe? Sonst trage die Häufigkeiten oben ein, damit der Vergleich stimmt.' }));
      if (eingetragen && fehlt.length) info.append(h('p', { class: 'small muted', text: `${fehlt.length} ${fehlt.length === 1 ? 'Bewertung fehlt' : 'Bewertungen fehlen'} noch aus dem Gutachten (zum Beispiel „${fehlt[0].leicht}“). Trage sie oben ein, sonst kann SoLo dort nicht vergleichen.` }));
      if (eingetragen) {
        const ids = new Set(ab.map((x) => x.id));
        // Automatische Karten, die nicht mehr abweichen und leer sind, verschwinden; ausgefüllte bleiben stehen
        for (const z of [...$('pf-wid-liste').children]) if (z.dataset.auto === '1' && !ids.has(z.dataset.id) && !z.querySelector('textarea').value.trim()) z.remove();
        for (const x of ab) { if (x.typ === 'stufe') fuegeWiderspruchHinzu(x.id, x.e, true); else fuegeTextKarte(x); }
        // Text der Häufigkeits- und Inkontinenz-Karten aktualisieren
        for (const x of ab) { const z = $('pf-wid-liste').querySelector(`[data-id="${x.id}"][data-typ]`); if (z) { z.querySelector('.pw-ist').textContent = 'Im Gutachten: ' + x.ist; z.querySelector('.pw-soll').textContent = 'Deine Einschätzung: ' + x.soll; z.dataset.ist = x.ist; z.dataset.soll = x.soll; } }
      }
    }
    // Text der Karten aktualisieren (Gutachten-Wert kann sich geändert haben)
    for (const z of $('pf-wid-liste').children) { if (z.dataset.typ) continue; const k = P.kriterium(z.dataset.id), el = z.querySelector('.pw-ist'); if (k && el) { const gu = g.stufen[k.id]; el.textContent = 'Im Gutachten: ' + (gu == null ? 'nicht eingetragen' : `„${P.SKALA[k.s].kurz[gu]}“ (${P.SKALA[k.s].stufen[gu]})`); } }
  }
  let pwn = 0;
  // Karte für Inkontinenz und Bereich 5 (Häufigkeiten): Werte stehen als Text, die eigene Angabe ändert man in der Einschätzung
  function fuegeTextKarte(x) {
    const liste = $('pf-wid-liste');
    if (liste.querySelector(`[data-id="${x.id}"]`)) return;
    const n = ++pwn;
    const zeile = h('div', { class: 'opt pw', 'data-id': x.id, 'data-auto': '1', 'data-typ': x.typ, 'data-titel': x.titel, 'data-ist': x.ist, 'data-soll': x.soll });
    const mit = h('input', { type: 'checkbox', id: `pw-m-${n}`, class: 'pw-mit', checked: true });
    zeile.append(h('strong', { text: x.titel }), h('p', { class: 'small pw-ist', text: 'Im Gutachten: ' + x.ist }), h('p', { class: 'pw-soll', text: 'Deine Einschätzung: ' + x.soll }),
      h('label', { for: `pw-a-${n}`, text: 'Wie ist es im Alltag wirklich? (in eigenen Worten)' }), h('textarea', { id: `pw-a-${n}`, rows: '3', placeholder: x.typ === 'm5' ? 'z. B. „Morgens, mittags und abends müssen wir die Tabletten richten und geben, allein vergisst sie sie.“' : 'z. B. „Sie schafft es nachts nicht mehr rechtzeitig zur Toilette und braucht Einlagen.“' }),
      h('label', { class: 'check' }, mit, h('span', { text: 'In das Schreiben aufnehmen' })));
    liste.append(zeile);
  }
  // Eine Karte: Bewertung (bei „selbst hinzufügen“ wählbar), wie es tatsächlich ist, Beschreibung aus dem Alltag, Haken „aufnehmen“
  function fuegeWiderspruchHinzu(id, soll, auto) {
    const liste = $('pf-wid-liste');
    if (id && liste.querySelector(`[data-id="${id}"]`)) return;
    const n = ++pwn;
    const zeile = h('div', { class: 'opt pw', 'data-id': id || '', 'data-auto': auto ? '1' : '' });
    const sollSel = h('select', { id: `pw-s-${n}` });
    const fuellen = (kid, wert) => { const k = P.kriterium(kid); sollSel.replaceChildren(...P.SKALA[k.s].kurz.map((s, i) => h('option', { value: i, text: `${s.charAt(0).toUpperCase() + s.slice(1)} (${P.SKALA[k.s].stufen[i]})`, selected: wert != null && i === wert }))); };
    let kopf;
    if (auto && id) {
      const k = P.kriterium(id);
      kopf = h('div', {}, h('strong', { text: `${k.id} ${k.leicht}` }), h('p', { class: 'small pw-ist' }));
      fuellen(id, soll);
    } else {
      const wahl = h('select', { id: `pw-k-${n}` }, P.KRITERIEN.filter((k) => k.s !== 'sonde').map((k) => h('option', { value: k.id, text: `${k.id} ${k.leicht}`, selected: k.id === id })));
      wahl.addEventListener('change', () => { zeile.dataset.id = wahl.value; fuellen(wahl.value, null); });
      fuellen(wahl.value, soll); zeile.dataset.id = wahl.value;
      kopf = h('div', {}, h('label', { for: `pw-k-${n}`, text: 'Bewertung' }), wahl, h('p', { class: 'small pw-ist' }));
    }
    const mit = h('input', { type: 'checkbox', id: `pw-m-${n}`, class: 'pw-mit', checked: true });
    const alltag = h('textarea', { id: `pw-a-${n}`, rows: '3', placeholder: 'z. B. „Sie kann nicht allein in die Dusche steigen und braucht jedes Mal Hilfe beim Abtrocknen.“' });
    zeile.append(...[kopf,
      h('label', { for: `pw-s-${n}`, text: auto ? 'Deine Einschätzung: so ist es wirklich' : 'So ist es wirklich' }), sollSel,
      h('label', { for: `pw-a-${n}`, text: 'Wie ist es im Alltag wirklich? (in eigenen Worten)' }), alltag,
      h('label', { class: 'check' }, mit, h('span', { text: 'In das Schreiben aufnehmen' })),
      auto ? null : h('div', { class: 'btns' }, h('button', { type: 'button', class: 'btn', onclick: () => zeile.remove() }, 'Entfernen'))].filter(Boolean));
    liste.append(zeile);
  }
  const pfArt = () => ($('pf-art-h').checked ? 'hoeher' : 'widerspruch');
  // Widerspruch Pflege: Frist nach dem Datum des Bescheids vorbei → Kasten mit Überprüfung (wie bei den Bescheiden oben)
  function pfVorbei() {
    const box = $('pf-vorbei'); if (!box || !$('pf-zugang-box')) return;
    box.replaceChildren();
    const d = $('pf-datum').value, an = pfArt() !== 'hoeher' && isoGut(d) && Fristen.widerspruch({ datum: d }).fristende < heute();
    $('pf-zugang-box').hidden = !an;
    const f = an ? widFrist('pf', d) : null, vorbei = !!f && f.fristende < heute();
    widKnopf('pf', vorbei);
    if (vorbei) box.append(vorbeiBox('pf', f.fristende));
  }
  function zeigePfArt() {
    pfVorbei();
    const hoch = pfArt() === 'hoeher';
    $('pf-ab-h').textContent = hoch ? 'Wo es schlimmer geworden ist' : 'Wo das Gutachten zu niedrig ist';
    $('pf-art-text').textContent = hoch ? 'Beschreibe bei jeder Bewertung, was sich seit der letzten Begutachtung verändert hat und seit wann. Nur was stimmt, gehört hinein.' : 'Beschreibe bei jeder Bewertung in eigenen Worten, wie es im Alltag wirklich ist. Nur was stimmt, gehört hinein.';
    $('pf-datum-label').textContent = hoch ? 'Datum der letzten Begutachtung' : 'Datum des Bescheids';
  }
  function machePflegeWiderspruch(opt) {
    if (erkOffen.pf) { $('pf-frist').textContent = erkWarte(); return; }
    const g = lesePflege(), r = P.rechne(g), hoch = pfArt() === 'hoeher';
    const gewaehlt = [...$('pf-wid-liste').children].filter((z) => z.querySelector('.pw-mit').checked && z.dataset.id);
    const textKarten = gewaehlt.filter((z) => z.dataset.typ);
    const auswahl = gewaehlt.filter((z) => !z.dataset.typ).map((z) => { const id = z.dataset.id, sel = z.querySelectorAll('select'); return { id, stufeIst: +(g.stufen[id] || 0), stufeSoll: +sel[sel.length - 1].value, alltag: z.querySelector('textarea').value }; }).filter((x) => x.stufeSoll > x.stufeIst);
    const neu = Object.assign({}, g, { stufen: Object.assign({}, g.stufen), m5: Object.assign({}, g.m5), inkontinenz: Object.assign({}, g.inkontinenz) }); auswahl.forEach((x) => { neu.stufen[x.id] = x.stufeSoll; });
    for (const z of textKarten) {
      if (z.dataset.typ === 'ink') neu.inkontinenz[z.dataset.id.slice(4)] = true;
      else if (eigen && eigen.m5 && z.dataset.id !== '5.16') neu.m5[z.dataset.id] = eigen.m5[z.dataset.id];
      else if (eigen && z.dataset.id === '5.16') neu.m5['5.16'] = eigen.m5 && eigen.m5['5.16'] != null ? eigen.m5['5.16'] : eigen.stufen['5.16'];
    }
    const zusatz = textKarten.map((z) => { const a = z.querySelector('textarea').value.trim(); return hoch ? `${z.dataset.titel}: bei der letzten Begutachtung ${z.dataset.ist}, heute ${z.dataset.soll}. ${a || '[Bitte beschreiben, was sich verändert hat und seit wann.]'}` : `${z.dataset.titel}: im Gutachten ${z.dataset.ist}, tatsächlich ${z.dataset.soll}. ${a || '[Bitte beschreiben, wie es im Alltag wirklich ist.]'}`; });
    const ziel = P.rechne(neu).pg, ist = r.bescheid ? r.bescheid.pg : r.pg;
    const absender = { name: $('pf-name').value.trim(), strasse: $('pf-anschrift').value.trim(), ort: $('pf-ort').value.trim() }, stelle = { name: $('pf-kasse').value.trim() };
    const t = hoch
      ? Widerspruch.hoeherstufung({ absender, stelle, zeichen: $('pf-vnr').value.trim(), heute: heute(), pgJetzt: ist, seit: $('pf-datum').value, punkte: Widerspruch.punkteHoeher(auswahl, P).concat(zusatz), arzt: true })
      : Widerspruch.text(Object.assign({ art: 'pflege', absender, stelle, bescheidDatum: $('pf-datum').value, zeichen: $('pf-vnr').value.trim(), heute: heute(), pflege: { pgBescheid: ist, pgZiel: ziel > ist ? ziel : null }, punkte: Widerspruch.punktePflege(auswahl, P).concat(zusatz), akteneinsicht: true }, widArt('pf', $('pf-datum').value, opt)));
    $('pf-wid-text').value = t; $('pf-wid-text').hidden = false; $('pf-wid-copy').hidden = false;
    let info = hoch ? 'Keine Frist. Mehr Geld gibt es ab dem Monat, in dem der Antrag bei der Pflegekasse eingeht. Deshalb bald abschicken.' : $('pf-datum').value ? fristText($('pf-datum').value, 'pf') : 'Tipp: Datum des Bescheids eintragen, dann zeigt SoLo die Frist.';
    if ((auswahl.length || textKarten.length) && ziel > ist) info = `Mit diesen Änderungen ergäbe sich Pflegegrad ${ziel}. ` + info;
    if (!auswahl.length && !textKarten.length) info = 'Noch keine Bewertung mit höherer Stufe gewählt. ' + info;
    $('pf-frist').classList.toggle('frist', !hoch && !!$('pf-datum').value); // Frist-Muster nur bei echter Frist
    $('pf-frist').textContent = info;
    merkKnopf('pf', hoch ? null : widEintrag('pk', $('pf-datum').value)); // Höherstufung: keine Frist
    if (opt && opt.ue === true) $('pf-wid-text').scrollIntoView({ block: 'center' });
  }
  // Knopf „Frist merken“ unter der Frist (nur in der App mit src/fristen.js; erst der Tipp speichert, nie automatisch)
  function merkKnopf(p, eintrag) {
    const alt = $(p + '-merken'); if (alt) alt.remove();
    if ($(p + '-fristbox')) return; // „Frist merken“ steht schon oben bei der Frist; kein zweiter Knopf (UX-Audit B)
    if (!eintrag || !window.FristenOrdner || !$(p + '-frist')) return;
    const k = window.FristenOrdner.knopf(() => eintrag);
    k.id = p + '-merken'; $(p + '-frist').after(k);
  }
  // ---------------- Widerspruchsfrist nach SoLos Rechnung vorbei ----------------
  // Rechtsprüfung docs/entwuerfe/rechtsfragen-rot.md, Frage 1 (21.11.2026; gesetze-im-internet.de, abgerufen 21.11.2026):
  // § 84 Abs. 1, §§ 66, 67 SGG; § 37 Abs. 2 SGB X; Wohngeld §§ 58, 60, 70 VwGO; § 44 SGB X; § 40 Abs. 1 SGB II; § 116a SGB XII.
  // Nie „kein Widerspruch mehr möglich“: SoLo rechnet mit dem Briefdatum (frühestes Ende). Kam der Brief später an oder fehlt die
  // Rechtsbehelfsbelehrung, läuft die Frist noch. Hauptweg dann: Überprüfung beantragen; kein „Frist merken“; Widerspruch nur als Nebenweg (hilfsweise § 44).
  const STELLE_TEIL = { jc: 'bs', sa: 'ga', wg: 'wg', fk: 'kz', pk: 'pf' };
  const TEIL_STELLE = { bs: 'jc', ga: 'sa', wg: 'wg', kz: 'fk', pf: 'pk' };
  const zugangVon = (p) => { const z = $(p + '-zugang'); return z && isoGut(z.value) ? z.value : null; };
  // Fristende: mit dem Tag des Zugangs, wenn er eingetragen ist und die Frist nach dem Briefdatum schon vorbei wäre
  function widFrist(p, datum) {
    if (!isoGut(datum)) return null;
    const f = Fristen.widerspruch({ datum }), z = f.fristende < heute() ? zugangVon(p) : null;
    return z ? Object.assign(Fristen.widerspruch({ zugang: z }), { zugang: z }) : f;
  }
  const fristVorbei = (p, datum) => { const f = widFrist(p, datum); return !!f && f.fristende < heute(); };
  const widEintrag = (stelle, datum) => {
    const p = STELLE_TEIL[stelle], f = p ? widFrist(p, datum) : null;
    if (!datum || (f && f.fristende < heute())) return null; // vergangene Frist nie merken
    return { art: 'wid', stelle, basis: f && f.zugang ? { zugang: f.zugang } : { datum }, quelle: 'bescheid' };
  };
  function fristText(datum, p) {
    const f = p ? widFrist(p, datum) : Fristen.widerspruch({ datum });
    if (f.fristende < heute()) return tA('bp.vb.h', 'Die Frist für den Widerspruch ist nach dieser Rechnung seit dem {datum} vorbei.', { datum: de(f.fristende) }) + ' ' + tA('bp.vb.bald', 'Stell den Antrag deshalb bald.');
    return tA('bp.wid.bis', 'Widerspruch bis {datum}', { datum: de(f.fristende) }) + '.';
  }
  // Knopf „Widerspruch erstellen“: bei vorbei-Frist nur Nebenweg „Trotzdem Widerspruch schreiben“
  const widKnopfAlt = {};
  function widKnopf(p, vorbei) {
    const b = $(p + '-wid-mach'); if (!b) return;
    if (widKnopfAlt[p] == null) widKnopfAlt[p] = b.textContent;
    b.textContent = vorbei ? tA('bp.vb.wid', 'Trotzdem Widerspruch schreiben') : widKnopfAlt[p];
    b.classList.toggle('primary', !vorbei);
  }
  const ueberpruefen = (p) => ({ bs: macheBescheidWiderspruch, ga: macheGSAWiderspruch, wg: macheWGWiderspruch, kz: macheKiZWiderspruch, pf: machePflegeWiderspruch }[p]({ ue: true }));
  // Zusatz für Widerspruch.text: Überprüfungsantrag (Knopf im Kasten) oder Widerspruch mit „hilfsweise § 44 SGB X“, wenn die Frist vorbei ist
  const widArt = (p, datum, opt) => (opt && opt.ue === true ? { ueberpruefung: true } : fristVorbei(p, datum) ? { hilfsweise44: true } : {});
  function vorbeiBox(p, ende) {
    const stelle = TEIL_STELLE[p], jahr = +heute().slice(0, 4), kurz = stelle === 'jc' || stelle === 'sa';
    const zurueck = kurz ? tA('bp.vb.zurueck1', 'Höchstens für das Jahr vor dem Jahr deines Antrags. Antrag in {jahr}: frühestens ab 1. Januar {ab}.', { jahr: String(jahr), ab: String(jahr - 1) })
      : tA('bp.vb.zurueck4', 'Höchstens für 4 Jahre vor dem Jahr deines Antrags. Antrag in {jahr}: frühestens ab 1. Januar {ab}.', { jahr: String(jahr), ab: String(jahr - 4) });
    const zeit = stelle === 'wg' ? tA('bp.vb.2w', '2 Wochen') : tA('bp.vb.1m', '1 Monat');
    const beratung = !window.SoloBeratung || window.SoloBeratung.an();
    return h('div', { class: 'frist frist-vorbei', role: 'note', id: p + '-vorbei-box' },
      h('p', { class: 'frist-wann' }, h('strong', { text: tA('bp.vb.h', 'Die Frist für den Widerspruch ist nach dieser Rechnung seit dem {datum} vorbei.', { datum: de(ende) }) })),
      h('p', { 'data-t': 'bp.vb.pruef', text: tA('bp.vb.pruef', 'Prüf zuerst zwei Dinge:') }),
      h('ol', {}, h('li', { 'data-t': 'bp.vb.1', text: tA('bp.vb.1', 'Kam der Brief später bei dir an? Dann endet die Frist später. Trag oben den Tag ein, an dem er wirklich kam.') }),
        h('li', { 'data-t': 'bp.vb.2', text: tA('bp.vb.2', 'Fehlt am Ende des Bescheids der Abschnitt „Rechtsbehelfsbelehrung“ oder ist er falsch? Dann hast du ein Jahr Zeit.') })),
      h('p', {}, h('strong', { 'data-t': 'bp.vb.sonst', text: tA('bp.vb.sonst', 'Sonst: Beantrage eine Überprüfung.') }), ' ', h('span', { 'data-t': 'bp.vb.sonst.t', text: tA('bp.vb.sonst.t', 'Ist der Bescheid falsch, muss die Stelle ihn auch jetzt noch ändern. Das kostet nichts.') })),
      p === 'pf' ? h('p', { 'data-t': 'bp.vb.hoeher', text: tA('bp.vb.hoeher', 'Oder stell einen Antrag auf Höherstufung.') }) : null,
      h('div', { class: 'btns' }, h('button', { type: 'button', class: 'btn primary', id: p + '-ue-mach', 'data-t': 'bp.vb.btn', text: tA('bp.vb.btn', 'Überprüfung beantragen'), onclick: () => ueberpruefen(p) })),
      h('details', { class: 'mehr' }, h('summary', { 'data-t': 'bp.vb.mehr', text: tA('bp.vb.mehr', 'Mehr dazu') }),
        h('p', {}, h('strong', { 'data-t': 'bp.vb.zurueck.h', text: tA('bp.vb.zurueck.h', 'Wie weit zurück gibt es Geld?') }), ' ' + zurueck + ' ' + tA('bp.vb.bald', 'Stell den Antrag deshalb bald.')),
        h('p', {}, h('strong', { 'data-t': 'bp.vb.achtung.h', text: tA('bp.vb.achtung.h', 'Achtung:') }), ' ' + tA('bp.vb.achtung', 'Der Antrag hält nichts auf. Fordert die Stelle Geld zurück, läuft das weiter. Sprich dann schnell mit einer Beratungsstelle.')),
        h('p', { text: tA('bp.vb.verh', 'Warst du verhindert, ohne dass du etwas dafür kannst (zum Beispiel im Krankenhaus)? Dann schick sofort den Widerspruch und schreib dazu, warum es nicht früher ging („Antrag auf Wiedereinsetzung“). Dafür hast du nur kurz Zeit: {zeit}, nachdem das Hindernis weg ist.', { zeit }) }),
        h('p', { 'data-t': 'bp.vb.erfolg', text: tA('bp.vb.erfolg', 'Ob du Erfolg hast, entscheidet die Stelle. SoLo kann das nicht zusagen.') }),
        beratung ? h('p', { class: 'small muted', 'data-t': 'bp.vb.quellen', text: tA('bp.vb.quellen', 'Quellen: (§ 44 SGB X; § 40 Abs. 1 SGB II; § 116a SGB XII; §§ 66, 67, 84 SGG; Wohngeld: §§ 58, 60, 70 VwGO).') }) : null));
  }
  // Feld „Tag, an dem der Brief wirklich ankam“: nur sichtbar, wenn die Frist nach dem Briefdatum vorbei wäre
  function zugangFeld(p, nachher, neu) {
    const inp = h('input', { type: 'date', id: p + '-zugang' });
    const box = h('div', { class: 'pp-zugang', id: p + '-zugang-box', hidden: true }, h('label', { for: p + '-zugang', 'data-t': 'bp.vb.zugang', text: tA('bp.vb.zugang', 'Tag, an dem der Brief wirklich ankam (falls später)') }), inp);
    inp.addEventListener('input', neu); inp.addEventListener('change', neu);
    nachher.insertAdjacentElement('afterend', box);
    return box;
  }

  const BEISPIEL_GUTACHTEN = `1.1 Positionswechsel im Bett überwiegend selbständig
1.3 Umsetzen überwiegend selbständig
1.4 Fortbewegen innerhalb des Wohnbereichs überwiegend selbständig
1.5 Treppensteigen unselbständig
2.2 Örtliche Orientierung Fähigkeit größtenteils vorhanden
2.3 Zeitliche Orientierung Fähigkeit in geringem Maße vorhanden
2.4 Erinnern an wesentliche Ereignisse oder Beobachtungen Fähigkeit in geringem Maße vorhanden
2.5 Steuern von mehrschrittigen Alltagshandlungen Fähigkeit in geringem Maße vorhanden
2.6 Treffen von Entscheidungen im Alltag Fähigkeit größtenteils vorhanden
2.8 Erkennen von Risiken und Gefahren Fähigkeit in geringem Maße vorhanden
3.2 Nächtliche Unruhe selten (ein- bis dreimal innerhalb von zwei Wochen)
4.1 Waschen des vorderen Oberkörpers überwiegend selbständig
4.2 Körperpflege im Bereich des Kopfes überwiegend selbständig
4.3 Waschen des Intimbereichs überwiegend unselbständig
4.4 Duschen und Baden einschließlich Waschen der Haare unselbständig
4.5 An- und Auskleiden des Oberkörpers überwiegend selbständig
4.6 An- und Auskleiden des Unterkörpers überwiegend unselbständig
4.7 Mundgerechtes Zubereiten der Nahrung überwiegend unselbständig
4.8 Essen überwiegend selbständig
4.9 Trinken überwiegend selbständig
4.10 Benutzen einer Toilette oder eines Toilettenstuhls überwiegend selbständig
6.1 Gestaltung des Tagesablaufs und Anpassung an Veränderungen überwiegend unselbständig
6.3 Sichbeschäftigen überwiegend unselbständig
6.4 Vornehmen von in die Zukunft gerichteten Planungen überwiegend unselbständig
6.6 Kontaktpflege zu Personen außerhalb des direkten Umfelds überwiegend unselbständig
Ergebnis: Pflegegrad 2`;

  // ---------------- Bescheid Grundsicherungsgeld ----------------
  let pz = 0;
  // werte.hh: Zeile aus dem Leistungs-Check (zählt als Person, auch wenn das Alter noch fehlt); werte.gruppe: Altersgruppe als Hinweis im leeren Feld
  const GRUPPE = { u6: '0–5', '6bis13': '6–13', '14plus': '14–24' };
  function personZeile(rolle, werte) {
    pz++; const n = pz; werte = werte || {};
    const tr = h('tr', { 'data-rolle': rolle, 'data-hh': werte.hh ? '1' : null },
      h('td', { text: rolle === 'erw' ? 'Erwachsen' : 'Kind' }),
      h('td', {}, h('input', { type: 'number', min: '0', max: '99', id: `bp-alter-${n}`, 'aria-label': `Person ${n}: Alter`, value: werte.alter != null ? werte.alter : '', placeholder: GRUPPE[werte.gruppe] || null })),
      ...['brutto', 'netto', 'sonstiges'].map((f) => h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `bp-${f}-${n}`, 'aria-label': `Person ${n}: ${f === 'sonstiges' ? 'anderes Einkommen (z. B. Unterhalt, Rente)' : 'Lohn ' + f}`, value: werte[f] || '' }))),
      h('td', {}, h('label', { class: 'check' }, h('input', { type: 'checkbox', id: `bp-schw-${n}`, 'aria-label': `Person ${n}: schwanger ab der 13. Woche`, checked: !!werte.schwanger }))),
      h('td', {}, h('button', { type: 'button', class: 'btn', 'aria-label': `Person ${n} entfernen`, onclick: () => { tr.remove(); zeigeBescheid(); } }, '×')));
    $('bs-personen').append(tr);
  }
  const wert = (id) => { const v = $(id).value; return v === '' ? null : +v; };
  // Eine ganz leere Zeile (kein Alter, kein Einkommen, kein Haken, nicht aus dem Check) ist keine Person: Sie würde sonst als
  // Partner bzw. Kind mitgerechnet (z. B. Regelbedarfe für zwei statt für eine Person). Fehlendes Alter bleibt leer (kein geratener Wert).
  const zeileLeer = (tr) => !tr.dataset.hh && [...tr.querySelectorAll('input')].every((el) => (el.type === 'checkbox' ? !el.checked : el.value === ''));
  function leseBescheid() {
    const personen = [...$('bs-personen').children].filter((tr) => !zeileLeer(tr)).map((tr) => { const i = tr.querySelectorAll('input'); return { rolle: tr.dataset.rolle, alter: i[0].value === '' ? '' : +i[0].value, brutto: +i[1].value || 0, netto: +i[2].value || 0, sonstiges: +i[3].value || 0, schwanger: i[4].checked }; });
    const leereZeilen = personen.length ? [...$('bs-personen').children].filter(zeileLeer).length : 0;
    return { personen, leereZeilen, warmwasserDezentral: $('bs-ww').checked, miete: { tatsaechlich: wert('bs-miete'), heizung: wert('bs-heiz') },
      bescheid: { regel: wert('bs-b-regel'), mehrAE: wert('bs-b-ae'), mehrSchwanger: wert('bs-b-schw'), mehrWW: wert('bs-b-ww'), kdu: wert('bs-b-kdu'), einkommen: wert('bs-b-eink'), kindergeld: wert('bs-b-kg'), zahlbetrag: wert('bs-b-zahl') } };
  }
  const WIRK = { passt: 'passt', zuWenig: 'zu deinen Lasten', zuViel: 'zu deinen Gunsten', pruefen: 'bitte prüfen', fehlt: 'nicht eingetragen' };
  // Ergebnis als Karten: je Abweichung eine Karte (Bescheid, nach SoLo, Grund, Paragraf); was passt, steht in einer Zeile;
  // die vollständige Tabelle zum Aufklappen. Für alle Bescheid-Prüfungen gleich.
  // Hinweis Bescheid-Check Grundsicherung im Alter: Freibetrag für Arbeit offenbar vom Netto (BescheidGSA, tKey bp.sa.nettoFrei)
  const NETTO_FREI_DE = 'Das Sozialamt hat den Freibetrag für deinen Lohn offenbar vom Netto berechnet. Viele Sozialämter rechnen 30 % vom Brutto (zum Beispiel Hamburg und Bremen in ihren Verwaltungsanweisungen). Dann wären es {diff} mehr Grundsicherung im Monat. Das Gesetz sagt es nicht eindeutig (§ 82 Abs. 3 SGB XII). Frag beim Sozialamt nach oder lege vorsorglich innerhalb der Frist Widerspruch ein.';
  function abweichungsKarten(box, r, label) {
    const grundVon = (p) => (p.tKey ? tA(p.tKey, NETTO_FREI_DE, p.tP) : p.grund) || ((r.gruende || []).find((g) => g.key === p.key) || {}).grund || '';
    const ab = r.posten.filter((p) => p.wirkung === 'zuWenig' || p.wirkung === 'pruefen');
    for (const p of ab) {
      box.append(h('div', { class: 'opt abw' },
        h('div', { class: 'abw-kopf' }, h('strong', { text: p.name }), h('span', { class: 'pill ' + p.wirkung, text: WIRK[p.wirkung] })),
        h('p', {}, `Im Bescheid: ${p.bescheid == null ? 'nicht eingetragen' : eur(p.bescheid)} · Nach SoLo: ${eur(p.erwartet)}`),
        grundVon(p) ? h('p', { class: 'small', text: grundVon(p) }) : null,
        p.recht ? h('p', { class: 'small muted', text: p.recht }) : null));
    }
    const ok = r.posten.filter((p) => p.wirkung === 'passt' || p.wirkung === 'zuViel').map((p) => p.name);
    if (ok.length) box.append(h('p', { class: 'small', text: (ab.length ? 'Passt: ' : 'Alles passt: ') + ok.join(', ') + '.' }));
    const tb = h('tbody', {}, r.posten.map((p) => h('tr', {}, h('td', {}, p.name, p.recht ? h('span', { class: 'amt small muted', text: ' ' + p.recht }) : null), h('td', { class: 'z', text: eur(p.erwartet) }), h('td', { class: 'z', text: p.bescheid == null ? '–' : eur(p.bescheid) }), h('td', {}, h('span', { class: 'pill ' + p.wirkung, text: WIRK[p.wirkung] })))));
    box.append(h('details', {}, h('summary', { text: 'Alle Posten im Vergleich' }), h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': label }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Posten' }), h('th', { class: 'z', text: 'nach SoLo' }), h('th', { class: 'z', text: 'im Bescheid' }), h('th', { text: 'Bewertung' }))), tb))));
  }
  // Erst vergleichen, wenn die für die Rechnung nötigen Angaben da sind. Sonst nennt SoLo konkret, was fehlt:
  // Nach dem Einlesen stehen oft nur die Beträge des Bescheids da, und ohne Kinder oder Miete gäbe es einen Fehlalarm.
  const da = (v) => v != null && v !== '';
  function fehltNoch(box, liste) {
    if (!liste.length) return false;
    box.append(h('h2', { text: 'Ergebnis' }),
      h('p', { class: 'pp-fehlt-liste' }, h('strong', { text: 'Es fehlen noch: ' }), liste.join(', ') + '.'),
      h('p', { class: 'small muted', text: 'Erst wenn diese Angaben eingetragen sind, vergleicht SoLo den Bescheid. Vorher wäre das Ergebnis oft falsch.' }));
    return true;
  }
  // Ohne DOM: e wie aus leseBescheid (leere Zeilen schon weggelassen). Das Alter zählt nur bei Kindern (Regelbedarfsstufe);
  // bei Erwachsenen hängt der Regelbedarf nur davon ab, ob sie allein oder zu zweit sind.
  function fehltSGB2(e) {
    const b = e.bescheid, f = [];
    const kinder = e.personen.filter((p) => p.rolle !== 'erw');
    if (!e.personen.length) f.push('Personen der Bedarfsgemeinschaft');
    // Leere Zeile: zählt nicht mit, kann aber ein Partner ohne Einkommen sein – darum erst ausfüllen (Alter) oder mit × entfernen
    if (e.leereZeilen) f.push('Angaben in der leeren Personenzeile (z. B. das Alter eintragen oder die Zeile mit × entfernen)');
    if (kinder.some((p) => p.alter === '')) f.push('Alter jedes Kindes');
    if (!kinder.length && (b.kindergeld > 0 || b.mehrAE > 0)) f.push('Kinder (im Bescheid stehen Kindergeld oder Mehrbedarf für Alleinerziehende)');
    if (da(b.kdu) || da(b.zahlbetrag)) {
      if (!da(e.miete.tatsaechlich)) f.push('Miete');
      if (!da(e.miete.heizung)) f.push('Heizkosten (0, wenn keine)');
    }
    if (b.einkommen > 0 && !e.personen.some((p) => p.brutto || p.netto || p.sonstiges)) f.push('Einkommen der Personen (im Bescheid wird Einkommen angerechnet)');
    if (!Object.values(b).some(da)) f.push('Beträge aus dem Bescheid');
    return f;
  }
  function zeigeBescheid() {
    const box = $('bs-erg'); box.replaceChildren();
    if (erkOffen.bs) erkFehlt('bs', fehltSGB2(leseBescheid())); if (erkSperre('bs', box)) return;
    const e = leseBescheid();
    if (!e.personen.length) { box.append(h('p', { text: 'Bitte zuerst die Personen eintragen.' })); return; }
    if (fehltNoch(box, fehltSGB2(e))) return;
    const r = BescheidSGB2.pruefe(e, Rules);
    box.append(h('h2', { text: 'Ergebnis' }));
    r.hinweise.forEach((t) => box.append(h('p', { class: 'note', text: t })));
    box.append(h('p', {}, r.zuWenigImMonat > 0 ? h('span', { class: 'big', text: `Vermutlich ${eur(r.zuWenigImMonat)} im Monat zu wenig` }) : h('span', { class: 'big', text: 'Keine sichere Abweichung zu deinen Lasten gefunden' })));
    abweichungsKarten(box, r, 'Vergleich der Posten');
    if (r.zahlbetrag) box.append(h('p', { class: 'small', text: `Zahlbetrag nach SoLo ${eur(r.zahlbetrag.erwartet)}${r.zahlbetrag.mitSofortzuschlag ? ` (mit ${eur(r.erwartet.sofortzuschlag)} Sofortzuschlag für Kinder, § 72 SGB II)` : ''}, im Bescheid ${eur(r.zahlbetrag.bescheid)}.${r.zahlbetrag.sofortzuschlagMoeglich ? ` Dazu kommt möglicherweise der Sofortzuschlag für Kinder von ${eur(r.zahlbetrag.sofortzuschlagMoeglich)} (§ 72 SGB II), falls er nicht gesondert gezahlt wird.` : ''}` }));
    box.append(h('p', { class: 'small muted', text: r.grenzen }));
  }
  // Widerspruch mit Zahlen-Begründung nur, wenn der Vergleich vollständig ist. Fehlen Angaben, entsteht ein fristwahrender Widerspruch
  // ohne Zahlen („Begründung folgt“), und SoLo sagt, was fehlt. Gleich für alle Bescheid-Prüfungen.
  function widPunkte(r, fehlt) { return fehlt.length ? [] : Widerspruch.punkteSGB2(r); }
  function widHinweis(p, r, fehlt, datum, extra) {
    const el = $(p + '-frist');
    el.classList.toggle('frist', !!datum); // Frist-Muster nur mit Datum
    if (datum && fristVorbei(p, datum)) { el.textContent = fristText(datum, p); return; } // kein „wahrt die Frist“, wenn sie vorbei ist
    const vor = fehlt.length ? tA('bp.wid.fehlt', 'Es fehlen noch: {liste}. Darum steht im Widerspruch noch keine Begründung mit Zahlen. Er wahrt trotzdem die Frist. Die Begründung reichst du nach.', { liste: fehlt.join(', ') }) + ' '
      : r.gruende.length ? '' : tA('bp.wid.keinGrund', 'SoLo hat keinen Grund gefunden. Der Widerspruch hat darum noch keine Begründung.') + ' ';
    el.textContent = vor + (datum ? fristText(datum, p) + (extra || '') : tA('bp.datum.t', 'Trag das Datum ein. Dann zeigt SoLo sofort, bis wann du Widerspruch einlegen kannst.'));
  }
  function macheBescheidWiderspruch(opt) {
    if (erkOffen.bs) { $('bs-frist').textContent = erkWarte(); return; }
    const e = leseBescheid(), fehlt = fehltSGB2(e);
    const r = BescheidSGB2.pruefe(e, Rules), punkte = widPunkte(r, fehlt);
    const t = Widerspruch.text(Object.assign({ art: 'sgb2', absender: { name: $('bs-name').value.trim(), strasse: $('bs-anschrift').value.trim(), ort: $('bs-ort').value.trim() }, stelle: { name: $('bs-jc').value.trim() }, bescheidDatum: $('bs-datum').value, zeichen: $('bs-bg').value.trim(), heute: heute(), punkte, akteneinsicht: !fehlt.length && r.gruende.some((g) => g.key === 'kdu') }, widArt('bs', $('bs-datum').value, opt)));
    $('bs-wid-text').value = t; $('bs-wid-text').hidden = false; $('bs-wid-copy').hidden = false;
    widHinweis('bs', r, fehlt, $('bs-datum').value);
    merkKnopf('bs', widEintrag('jc', $('bs-datum').value));
    if (opt && opt.ue === true) $('bs-wid-text').scrollIntoView({ block: 'center' });
  }

  // ---------------- Bescheid Grundsicherung im Alter ----------------
  function leseGSA() {
    const zwei = $('ga-zahl').value === '2';
    const person = (i) => ({ renteNetto: +$('ga-rente' + i).value || 0, renteBrutto: +$('ga-brutto' + i).value || 0, zusatzRente: +$('ga-zus' + i).value || 0, lohnNetto: +$('ga-lohn' + i).value || 0, lohnBrutto: +$('ga-lohnb' + i).value || 0, sonstiges: +$('ga-sonst' + i).value || 0, versicherungen: +$('ga-vers' + i).value || 0, grundrente33: $('ga-gr' + i).checked, mzG: $('ga-g' + i).checked });
    return { personen: zwei ? [person(1), person(2)] : [person(1)], warmwasserDezentral: $('ga-ww').checked, miete: { tatsaechlich: wert('ga-miete'), heizung: wert('ga-heiz') },
      bescheid: { regel: wert('ga-b-regel'), mehrG: wert('ga-b-g'), mehrWW: wert('ga-b-ww'), kdu: wert('ga-b-kdu'), einkommen: wert('ga-b-eink'), zahlbetrag: wert('ga-b-zahl') } };
  }
  function fehltGSA(e) {
    const b = e.bescheid, f = [];
    if (da(b.kdu) || da(b.zahlbetrag)) { if (!da(e.miete.tatsaechlich)) f.push('Miete'); if (!da(e.miete.heizung)) f.push('Heizkosten (0, wenn keine)'); }
    if (b.einkommen > 0 && !e.personen.some((p) => p.renteNetto || p.zusatzRente || p.lohnNetto || p.sonstiges)) f.push('Rente oder anderes Einkommen (im Bescheid wird Einkommen angerechnet)');
    return f;
  }
  function zeigeGSA() {
    $('ga-p2').hidden = $('ga-zahl').value !== '2';
    const box = $('ga-erg'); box.replaceChildren();
    if (erkOffen.ga) erkFehlt('ga', fehltGSA(leseGSA())); if (erkSperre('ga', box)) return;
    const e = leseGSA();
    if (fehltNoch(box, fehltGSA(e))) return;
    const r = BescheidGSA.pruefe(e, Rules);
    box.append(h('h2', { text: 'Ergebnis' }),
      h('p', {}, h('span', { class: 'big', text: r.posten.length ? (r.zuWenigImMonat > 0 ? `Vermutlich ${eur(r.zuWenigImMonat)} im Monat zu wenig` : r.gruende.length ? 'Bitte prüfen' : 'Keine Abweichung zu deinen Lasten gefunden') : `Nach SoLo: ${eur(r.erwartet.zahlbetrag)} Grundsicherung im Monat` })),
      h('p', { class: 'small', text: `Nach SoLo: Bedarf ${eur(r.erwartet.bedarf)}, anzurechnendes Einkommen ${eur(r.erwartet.einkommen)}, Zahlbetrag ${eur(r.erwartet.zahlbetrag)}.` }));
    if (r.posten.length) abweichungsKarten(box, r, 'Vergleich Grundsicherung im Alter');
    const zB = r.erwartet.zahlbetragBrutto > r.erwartet.zahlbetrag + 1 ? ` (mit 30 % Freibetrag vom Bruttolohn: ${eur(r.erwartet.zahlbetragBrutto)})` : '';
    if (r.zahlbetrag) box.append(h('p', { class: 'small', text: `Zahlbetrag nach SoLo ${eur(r.zahlbetrag.erwartet)}${zB}, im Bescheid ${eur(r.zahlbetrag.bescheid)}.` }));
    box.append(h('p', { class: 'small muted', text: r.grenzen }));
  }
  function macheGSAWiderspruch(opt) {
    if (erkOffen.ga) { $('ga-frist').textContent = erkWarte(); return; }
    const e = leseGSA(), fehlt = fehltGSA(e), r = BescheidGSA.pruefe(e, Rules);
    const t = Widerspruch.text(Object.assign({ art: 'gsa', absender: { name: $('ga-name').value.trim(), strasse: $('ga-anschrift').value.trim(), ort: $('ga-ort').value.trim() }, stelle: { name: $('ga-stelle').value.trim() }, bescheidDatum: $('ga-datum').value, zeichen: $('ga-az').value.trim(), heute: heute(), punkte: widPunkte(r, fehlt), akteneinsicht: !fehlt.length && r.gruende.some((g) => g.key === 'kdu') }, widArt('ga', $('ga-datum').value, opt)));
    $('ga-wid-text').value = t; $('ga-wid-text').hidden = false; $('ga-wid-copy').hidden = false;
    widHinweis('ga', r, fehlt, $('ga-datum').value);
    merkKnopf('ga', widEintrag('sa', $('ga-datum').value));
    if (opt && opt.ue === true) $('ga-wid-text').scrollIntoView({ block: 'center' });
  }

  // ---------------- Bescheid Wohngeld ----------------
  let wz = 0;
  const ARTEN = [['lohn', 'Lohn'], ['rente', 'Rente'], ['rente33', 'Rente mit 33 Jahren Grundrentenzeiten'], ['alg', 'Arbeitslosengeld I'], ['eg', 'Elterngeld'], ['ohne', 'nur Unterhalt / kein Einkommen']];
  function wgZeile(w) {
    wz++; const n = wz; w = w || {};
    const art = h('select', { id: `wm-art-${n}`, 'aria-label': `Einkommen ${n}: Art` }, ARTEN.map(([v, t]) => h('option', { value: v, text: t, selected: v === (w.art || 'lohn') })));
    const abz = h('select', { id: `wm-abz-${n}`, 'aria-label': `Einkommen ${n}: Pauschalabzug` }, [0, 10, 20, 30].map((p) => h('option', { value: p, text: p + ' %', selected: p === (w.abzug != null ? w.abzug : 30) })));
    // Elterngeld: kein Pauschalabzug, dafür Basiselterngeld oder ElterngeldPlus und Kinder dieser Geburt (Freibetrag § 10 BEEG, BescheidWG egFrei).
    // „Weiß ich nicht“ = egPlus fehlt (dann vorsichtige Spanne). Vorbelegt aus dem Check (Frage „Bekommst du Basiselterngeld oder ElterngeldPlus?“).
    const egWert = w.egPlus === true ? 'plus' : w.egPlus === false ? 'basis' : '';
    const egArt = h('select', { id: `wm-eg-${n}`, 'aria-label': `Einkommen ${n}: Basiselterngeld oder ElterngeldPlus` },
      [['', 'Weiß ich nicht'], ['basis', 'Basiselterngeld'], ['plus', 'ElterngeldPlus']].map(([v, t]) => h('option', { value: v, text: t, selected: v === egWert })));
    const egK = h('select', { id: `wm-egk-${n}`, 'aria-label': `Einkommen ${n}: Kinder bei dieser Geburt` },
      [[1, 'ein Kind'], [2, 'Zwillinge'], [3, 'Drillinge oder mehr']].map(([v, t]) => h('option', { value: v, text: t, selected: v === (Number(w.egKinder) || 1) })));
    const egBox = h('div', { class: 'wm-eg' }, egArt, egK);
    const egZeigen = () => { const eg = art.value === 'eg'; abz.hidden = eg; egBox.hidden = !eg; };
    art.addEventListener('change', egZeigen); egZeigen();
    const tr = h('tr', {}, h('td', {}, art),
      h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `wm-b-${n}`, 'aria-label': `Einkommen ${n}: brutto im Monat`, value: w.brutto || '' })),
      h('td', {}, abz, egBox),
      h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `wm-u-${n}`, 'aria-label': `Einkommen ${n}: Unterhalt im Monat`, value: w.unterhalt || '' })),
      h('td', {}, h('button', { type: 'button', class: 'btn', 'aria-label': `Einkommen ${n} entfernen`, onclick: () => { tr.remove(); zeigeWG(); } }, '×')));
    $('wg-mitglieder').append(tr);
  }
  function leseWG() {
    const mitglieder = [...$('wg-mitglieder').children].map((tr) => {
      const s = tr.querySelectorAll('select'), i = tr.querySelectorAll('input'), m = { art: s[0].value, abzug: +s[1].value, brutto: +i[0].value || 0, unterhalt: +i[1].value || 0 };
      if (m.art === 'eg') { const a = s[2].value; if (a) m.egPlus = a === 'plus'; m.egKinder = +s[3].value || 1; }
      return m;
    });
    return { personen: +$('wg-n').value || 1, stufe: +$('wg-stufe').value, bruttokalt: +$('wg-kalt').value || 0, schwerbehindert: +$('wg-sb').value || 0, alleinerziehend: $('wg-ae').checked, mitglieder,
      bescheid: { miete: wert('wg-b-miete'), einkommen: wert('wg-b-eink'), wohngeld: wert('wg-b-wg') } };
  }
  function fehltWG(e) {
    const b = e.bescheid, f = [];
    if ((da(b.miete) || da(b.wohngeld)) && $('wg-kalt').value === '') f.push('Miete ohne Heizung');
    if (b.einkommen > 0 && !e.mitglieder.some((m) => m.brutto || m.unterhalt)) f.push('Einkommen im Haushalt (im Bescheid steht ein Gesamteinkommen)');
    return f;
  }
  function zeigeWG() {
    const box = $('wg-erg'); box.replaceChildren();
    if (erkOffen.wg) erkFehlt('wg', fehltWG(leseWG())); if (erkSperre('wg', box)) return;
    const e = leseWG();
    if (fehltNoch(box, fehltWG(e))) return;
    const r = BescheidWG.pruefe(e, Rules);
    box.append(h('h2', { text: 'Ergebnis' }),
      h('p', {}, h('span', { class: 'big', text: r.posten.length ? (r.zuWenigImMonat > 0 ? `Vermutlich ${eur(r.zuWenigImMonat)} Wohngeld im Monat zu wenig` : r.gruende.length ? 'Abweichung gefunden, bitte prüfen' : 'Keine Abweichung zu deinen Lasten gefunden') : `Nach SoLo: ${eur(r.rechnung.wohngeld)} Wohngeld im Monat` })),
      h('p', { class: 'small', text: `Nach SoLo: Miete ${eur(r.rechnung.miete)} (Höchstbetrag ${eur(r.rechnung.hoechstbetrag)} plus Heizkostenkomponente ${eur(r.rechnung.heizkomponente)}), Einkommen ${eur(r.rechnung.einkommen)}, Wohngeld ${eur(r.rechnung.wohngeld)}.` }));
    if (r.posten.length) abweichungsKarten(box, r, 'Vergleich Wohngeld');
    box.append(h('p', { class: 'small muted', text: r.grenzen }));
  }
  const WG_KLAGE = 'Wohngeld: In manchen Bundesländern gibt es keinen Widerspruch. Dann ist nur die Klage beim Verwaltungsgericht möglich, mit derselben Frist. Was für dich gilt, steht in der Rechtsbehelfsbelehrung am Ende des Bescheids.';
  function macheWGWiderspruch(opt) {
    if (erkOffen.wg) { $('wg-frist').textContent = erkWarte(); return; }
    const e = leseWG(), fehlt = fehltWG(e), r = BescheidWG.pruefe(e, Rules);
    const t = Widerspruch.text(Object.assign({ art: 'wohngeld', absender: { name: $('wg-name').value.trim(), strasse: $('wg-anschrift').value.trim(), ort: $('wg-ort').value.trim() }, stelle: { name: $('wg-stelle').value.trim() }, bescheidDatum: $('wg-datum').value, zeichen: $('wg-az').value.trim(), heute: heute(), punkte: widPunkte(r, fehlt) }, widArt('wg', $('wg-datum').value, opt)));
    $('wg-wid-text').value = t; $('wg-wid-text').hidden = false; $('wg-wid-copy').hidden = false;
    widHinweis('wg', r, fehlt, $('wg-datum').value, ' ' + tA('fri.wid.wg', WG_KLAGE));
    merkKnopf('wg', widEintrag('wg', $('wg-datum').value));
    if (opt && opt.ue === true) $('wg-wid-text').scrollIntoView({ block: 'center' });
  }

  // ---------------- Bescheid Kinderzuschlag ----------------
  let kz = 0;
  function kzKind(w) {
    kz++; const n = kz; w = w || {};
    const tr = h('tr', {},
      h('td', {}, h('input', { type: 'number', min: '0', max: '24', step: '1', inputmode: 'numeric', id: `kk-a-${n}`, 'aria-label': `Kind ${n}: Alter`, value: w.alter != null ? w.alter : '' })),
      h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `kk-u-${n}`, 'aria-label': `Kind ${n}: Unterhalt oder Unterhaltsvorschuss im Monat`, value: w.unterhalt || '' })),
      h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `kk-e-${n}`, 'aria-label': `Kind ${n}: eigenes Einkommen im Monat`, value: w.eigenes || '' })),
      h('td', {}, h('button', { type: 'button', class: 'btn', 'aria-label': `Kind ${n} entfernen`, onclick: () => { tr.remove(); zeigeKiZ(); } }, '×')));
    $('kz-kinder').append(tr);
  }
  function leseKiZ() {
    const zwei = $('kz-zahl').value === '2';
    const eltern = [{ brutto: +$('kz-b1').value || 0, netto: +$('kz-n1').value || 0 }];
    if (zwei) eltern.push({ brutto: +$('kz-b2').value || 0, netto: +$('kz-n2').value || 0 });
    const kinder = [...$('kz-kinder').children].map((tr) => { const i = tr.querySelectorAll('input'); return { alter: i[0].value === '' ? 5 : +i[0].value, unterhalt: +i[1].value || 0, eigenes: +i[2].value || 0 }; });
    return { eltern, kinder, wohnkosten: +$('kz-wohn').value || 0, bescheid: { bedarf: wert('kz-b-bedarf'), einkommen: wert('kz-b-eink'), kiz: wert('kz-b-kiz') } };
  }
  function fehltKiZ(e) {
    const b = e.bescheid, f = [];
    if (!e.kinder.length) f.push('Kinder');
    if ([...$('kz-kinder').children].some((tr) => tr.querySelector('input').value === '')) f.push('Alter jedes Kindes');
    if ((da(b.bedarf) || da(b.kiz)) && $('kz-wohn').value === '') f.push('Miete mit Heizung');
    if (b.einkommen > 0 && !e.eltern.some((x) => x.brutto || x.netto)) f.push('Lohn der Eltern (im Bescheid wird Einkommen angerechnet)');
    return f;
  }
  function zeigeKiZ() {
    for (const el of document.querySelectorAll('.kz-zwei')) el.hidden = $('kz-zahl').value !== '2';
    const box = $('kz-erg'); box.replaceChildren();
    if (erkOffen.kz) erkFehlt('kz', fehltKiZ(leseKiZ())); if (erkSperre('kz', box)) return;
    const e = leseKiZ();
    if (!e.kinder.length) { box.append(h('p', { text: 'Bitte zuerst die Kinder eintragen.' })); return; }
    if (fehltNoch(box, fehltKiZ(e))) return;
    const r = BescheidKiZ.pruefe(e, Rules), q = r.rechnung;
    box.append(h('h2', { text: 'Ergebnis' }),
      h('p', {}, h('span', { class: 'big', text: r.posten.length ? (r.zuWenigImMonat > 0 ? `Vermutlich ${eur(r.zuWenigImMonat)} Kinderzuschlag im Monat zu wenig` : r.gruende.length ? 'Abweichung gefunden, bitte prüfen' : 'Keine Abweichung zu deinen Lasten gefunden') : `Nach SoLo: ${eur(q.kiz)} Kinderzuschlag im Monat` })),
      h('p', { class: 'small', text: `Nach SoLo: Bedarf der Eltern ${eur(q.bedarf)}, anzurechnendes Einkommen der Eltern ${eur(q.einkEltern)}, Kinderzuschlag ${eur(q.kiz)} (höchstens ${eur(q.max)} je Kind).` }));
    r.hinweise.forEach((t) => box.append(h('p', { class: 'note', text: t })));
    if (r.posten.length) abweichungsKarten(box, r, 'Vergleich Kinderzuschlag');
    box.append(h('p', { class: 'small muted', text: r.grenzen }));
  }
  function macheKiZWiderspruch(opt) {
    if (erkOffen.kz) { $('kz-frist').textContent = erkWarte(); return; }
    const e = leseKiZ(), fehlt = fehltKiZ(e), r = BescheidKiZ.pruefe(e, Rules);
    const t = Widerspruch.text(Object.assign({ art: 'kiz', absender: { name: $('kz-name').value.trim(), strasse: $('kz-anschrift').value.trim(), ort: $('kz-ort').value.trim() }, stelle: { name: 'Familienkasse der Bundesagentur für Arbeit' }, bescheidDatum: $('kz-datum').value, zeichen: $('kz-kgnr').value.trim(), heute: heute(), punkte: widPunkte(r, fehlt) }, widArt('kz', $('kz-datum').value, opt)));
    $('kz-wid-text').value = t; $('kz-wid-text').hidden = false; $('kz-wid-copy').hidden = false;
    widHinweis('kz', r, fehlt, $('kz-datum').value);
    merkKnopf('kz', widEintrag('fk', $('kz-datum').value));
    if (opt && opt.ue === true) $('kz-wid-text').scrollIntoView({ block: 'center' });
  }

  // ---------------- Nebenkosten ----------------
  let nz = 0;
  function nkZeile(w) {
    nz++; const n = nz; w = w || {};
    const tr = h('tr', {},
      h('td', {}, h('input', { type: 'text', id: `np-b-${n}`, 'aria-label': `Posten ${n}: Bezeichnung`, value: w.bez || '' })),
      h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `np-g-${n}`, 'aria-label': `Posten ${n}: Kosten für das ganze Haus`, value: w.gesamt || '' })),
      h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `np-a-${n}`, 'aria-label': `Posten ${n}: mein Anteil`, value: w.anteil || '' })),
      h('td', {}, h('label', { class: 'check' }, h('input', { type: 'checkbox', id: `np-f-${n}`, 'aria-label': `Posten ${n}: nach Wohnfläche verteilt`, checked: !!w.flaeche }))),
      h('td', {}, h('button', { type: 'button', class: 'btn', 'aria-label': `Posten ${n} entfernen`, onclick: () => { tr.remove(); zeigeNK(); } }, '×')));
    $('nk-posten').append(tr);
  }
  function leseNK() {
    const posten = [...$('nk-posten').children].map((tr) => { const i = tr.querySelectorAll('input'); return { bez: i[0].value.trim(), gesamt: +i[1].value || 0, anteil: +i[2].value || 0, flaeche: i[3].checked }; });
    return { von: $('nk-von').value, bis: $('nk-bis').value, zugang: $('nk-zugang').value, vorauszahlungen: +$('nk-voraus').value || 0, wohnflaeche: +$('nk-wfl').value || 0, gesamtflaeche: +$('nk-gfl').value || 0, posten,
      heiz: { anteil: +$('nk-heiz').value || 0, verbrauchProzent: $('nk-verbr').value }, co2: { kosten: +$('nk-co2').value || 0, kgJeQm: $('nk-kg').value, vermieterAbgezogen: $('nk-co2ab').checked }, co2Fehlt: $('nk-co2fehlt').checked };
  }
  const NKW = { ok: ['passt', 'umlagefähig'], nicht: ['zuWenig', 'nicht umlagefähig'], pruefen: ['pruefen', 'bitte prüfen'], unbekannt: ['pruefen', 'unbekannt'] };
  function zeigeNK() {
    const box = $('nk-erg'); box.replaceChildren();
    if (erkSperre('nk', box)) return;
    const a = leseNK(), r = Nebenkosten.pruefe(a);
    const leist = $('nk-leist').value;
    box.append(h('h2', { text: 'Ergebnis' }));
    if (!r.posten.length) { box.append(h('p', { text: 'Bitte die Posten der Abrechnung eintragen.' })); return; }
    const titel = r.ergebnis > 0 ? `Laut Abrechnung ${eur(r.ergebnis)} Nachzahlung` : `Laut Abrechnung ${eur(-r.ergebnis)} Guthaben`;
    box.append(h('p', {}, h('span', { class: 'big', text: titel })));
    if (r.strittig > 0) box.append(h('p', {}, h('strong', { text: `${eur(r.strittig)} sind strittig. ` }), r.korrigiert > 0 ? `Ohne sie bleiben ${eur(r.korrigiert)} Nachzahlung.` : `Ohne sie ergibt sich ${eur(-r.korrigiert)} Guthaben.`));
    r.hinweise.forEach((t) => box.append(h('p', { class: 'note', text: t })));
    if (r.fristen) box.append(h('p', { class: 'small', text: `Die Abrechnung musste bis ${de(r.fristen.abrechnungBis)} da sein.${r.fristen.einwendungBis ? ` Einwände sind bis ${de(r.fristen.einwendungBis)} möglich.` : ''}` }));
    if (r.befunde.length) box.append(h('h3', { text: 'Was auffällt' }), h('ul', {}, r.befunde.map((b) => h('li', {}, h('span', { class: 'pill ' + (b.schwere === 'fehler' ? 'zuWenig' : 'pruefen'), text: b.schwere === 'fehler' ? 'Fehler' : 'prüfen' }), ' ', b.text))));
    else box.append(h('p', { text: 'Keine Auffälligkeiten nach den geprüften Regeln.' }));
    const tb = h('tbody', {}, r.posten.map((p) => h('tr', {}, h('td', {}, p.bez || '–', p.art ? h('span', { class: 'amt small muted', text: ' ' + p.art }) : null), h('td', { class: 'z', text: eur(p.anteil) }), h('td', {}, h('span', { class: 'pill ' + NKW[p.status][0], text: NKW[p.status][1] })))));
    box.append(h('details', {}, h('summary', { text: 'Alle Posten mit Bewertung' }), h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': 'Posten mit Bewertung' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Posten' }), h('th', { class: 'z', text: 'Anteil' }), h('th', { text: 'Bewertung' }))), tb))));
    if (leist === 'sgb2' || leist === 'gsa') box.append(h('p', { class: 'note', text: r.ergebnis > 0 ? `Eine Nachzahlung muss in der Regel das ${leist === 'gsa' ? 'Sozialamt' : 'Jobcenter'} übernehmen, wenn die Miete angemessen ist. Den Antrag bitte sofort stellen, spätestens im Monat, in dem die Nachzahlung fällig ist. Strittige Posten erst mit dem Vermieter klären.` : `Ein Guthaben wird vom ${leist === 'gsa' ? 'Sozialamt' : 'Jobcenter'} im Monat nach der Gutschrift mit den Kosten der Unterkunft verrechnet (§ 22 Abs. 3 SGB II bzw. entsprechend im SGB XII). Bitte die Abrechnung dort vorlegen.` }));
    if (leist === 'wohngeld') box.append(h('p', { class: 'note', text: 'Steigen die Vorauszahlungen deutlich, kann ein Antrag auf Erhöhung des Wohngeldes sinnvoll sein. Die Wohngeldstelle prüft das.' }));
    box.append(h('p', { class: 'small muted', text: r.grenzen }));
  }
  function nkText(t, info) { $('nk-text').value = t; $('nk-text').hidden = false; $('nk-copy').hidden = false; $('nk-info').textContent = info; }

  // ---------------- Fristen ----------------
  function zeigeFristen() {
    const d = $('fr-datum').value, z = $('fr-zugang').value;
    if (d || z) { const f = Fristen.widerspruch(z ? { zugang: z } : { datum: d }); $('fr-erg').textContent = `Bekannt gegeben am ${de(f.bekanntgabe)}. Der Widerspruch muss spätestens am ${de(f.fristende)} bei der Stelle eingegangen sein. ${f.hinweis}`; } else $('fr-erg').textContent = '';
    const e = $('er-ende').value;
    if (e) { const r = Fristen.erinnerung({ leistung: $('er-leistung').value, ende: e }); $('er-erg').textContent = `Erinnerung am ${de(r.erinnerungAm)}: ${r.text} (${r.stelle})`; } else $('er-erg').textContent = '';
  }

  // ---------------- Lizenz ----------------
  async function zeigeLizenz(inhalt) {
    const box = $('li-erg'); box.replaceChildren();
    const r = await Lizenz.pruefe(inhalt, LIZENZ_SCHLUESSEL.jwk, heute());
    box.append(h('p', {}, h('span', { class: 'pill ' + (r.gueltig ? 'passt' : 'zuWenig'), text: Lizenz.TEXT[r.grund] })));
    if (r.stelle) box.append(h('p', { text: `${r.stelle} · ${r.plaetze} ${r.plaetze === 1 ? 'Platz' : 'Plätze'} · gültig ${de(r.ab)} bis ${de(r.bis)}${r.demo ? ' · Demo-Lizenz' : ''}` }));
    if (r.baldAblauf) box.append(h('p', { class: 'note', text: `Läuft in ${r.tageRest} Tagen ab. Bitte rechtzeitig verlängern.` }));
    if (LIZENZ_SCHLUESSEL.demo) box.append(h('p', { class: 'small muted', text: 'Diese Vorschau nutzt einen Demo-Schlüssel. Vor dem Verkauf wird ein eigener Schlüssel erzeugt.' }));
  }

  // ---------------- Start ----------------
  baueModule();
  // Neu rechnen beim Tippen („input“). „change“ nur für Auswahl und Häkchen: Bei Zahlenfeldern kommt „change“ erst beim Verlassen des Feldes,
  // also oft beim Tippen auf einen Knopf im Ergebnis – die Neuberechnung würde den Knopf ersetzen, bevor der Klick ankommt.
  const nurAuswahl = (fn) => (e) => { if (!e.target.matches('input[type="number"], input[type="text"], input[type="date"], textarea')) fn(); };
  for (const f of ['pf-form', 'pf-form2']) { $(f).addEventListener('input', zeigePflege); $(f).addEventListener('change', nurAuswahl(zeigePflege)); }
  $('pf-lesen').addEventListener('click', () => {
    const t = $('pf-text').value;
    if (!t.trim()) { $('pf-msg').textContent = 'Bitte zuerst Text einfügen.'; return; }
    const im = PflegeImport.lies(t, P);
    erkFertig('pf', false);
    setzePflege(im);
    // Erkannte Bewertungen markieren (Inkontinenz: die Beschriftung des Häkchens)
    for (const id of im.gefunden) { const el = $('pf-' + id); if (el) { el.classList.add('pp-erkannt'); const b = el.closest('details.pf-bereich'); if (b) b.open = true; } } // Bereiche mit erkannten Werten aufklappen: man soll sie prüfen
    if (im.pgBescheid != null) $('pf-pgb').classList.add('pp-erkannt');
    for (const id of ['harn', 'stuhl']) if (im.inkontinenz && im.inkontinenz[id]) $('pf-' + id).closest('label').classList.add('pp-erkannt');
    erkMarke('pf', null);
    $('pf-msg').textContent = `${im.gefunden.length} von ${P.KRITERIEN.length} Bewertungen erkannt${im.pgBescheid ? `, Pflegegrad ${im.pgBescheid} im Text gefunden` : ''}. Bitte jede Zahl mit dem Gutachten vergleichen und korrigieren.`;
    zeigePflege();
  });
  $('pf-beispiel').addEventListener('click', () => { $('pf-alter').value = 82; $('pf-text').value = BEISPIEL_GUTACHTEN; $('pf-lesen').click(); erkFertig('pf'); }); // Beispiel: kein Brief, nichts zu prüfen
  $('pf-leeren').addEventListener('click', () => { erkFertig('pf', false); $('pf-form').reset(); $('pf-form2').reset(); $('pf-text').value = ''; $('pf-msg').textContent = ''; for (const el of document.querySelectorAll('#pf-module input')) { if (el.type === 'checkbox') el.checked = false; else el.value = ''; } zeigePflege(); });
  $('pf-wid-plus').addEventListener('click', () => fuegeWiderspruchHinzu(null, null, false));
  $('pf-wid-mach').addEventListener('click', machePflegeWiderspruch);
  for (const id of ['pf-art-w', 'pf-art-h']) $(id).addEventListener('change', zeigePfArt);
  zugangFeld('pf', $('pf-datum'), pfVorbei);
  for (const ev of ['input', 'change']) $('pf-datum').addEventListener(ev, pfVorbei);
  $('pf-wid-copy').addEventListener('click', () => kopiere($('pf-wid-text'), $('pf-copy-msg')));
  zeigePflege();
  // Wo steht das im Brief? Kurzer Hinweis unter jedem Feld mit Amtsbegriff, damit man den Wert auch ohne Vorwissen findet
  const FELD_HILFE = {
    'bs-b-regel': 'Im Berechnungsbogen (die Seiten mit der Rechnung, meist hinten am Bescheid) bei „Regelbedarf“ (fester Betrag für den Alltag), je Person eine Zeile. Hier die Summe aller Personen.',
    'bs-b-ae': 'Im Berechnungsbogen bei „Mehrbedarf“ für Alleinerziehende. Steht dort nichts, leer lassen.',
    'bs-b-schw': 'Im Berechnungsbogen bei „Mehrbedarf“ für Schwangerschaft. Steht dort nichts, leer lassen.',
    'bs-b-ww': 'Im Berechnungsbogen bei „Mehrbedarf“ für Warmwasser (wenn das Wasser mit Strom erwärmt wird). Steht dort nichts, leer lassen.',
    'bs-b-kdu': 'Im Berechnungsbogen bei „Kosten der Unterkunft und Heizung“ (KdU, also Miete, Nebenkosten und Heizung): der Betrag, den das Jobcenter übernimmt.',
    'bs-b-eink': 'Im Berechnungsbogen bei „zu berücksichtigendes Einkommen“, also nach Abzug der Freibeträge, ohne Kindergeld.',
    'bs-b-kg': 'Im Berechnungsbogen: Kindergeld, das als Einkommen der Kinder abgezogen wird.',
    'bs-b-zahl': 'Auf der ersten Seite: der Betrag, der jeden Monat überwiesen wird.',
    'bs-bg': 'Oben im Brief, zum Beispiel 123A4567890 (auch „BG-Nummer“).',
    'ga-b-regel': 'Im Berechnungsbogen (die Seiten mit der Rechnung, meist hinten am Bescheid) bei „Regelbedarf“ bzw. „Regelsatz“ (fester Betrag für den Alltag), für alle Personen zusammen.',
    'ga-b-g': 'Im Berechnungsbogen bei „Mehrbedarf“ wegen Merkzeichen G. Steht dort nichts, leer lassen.',
    'ga-b-ww': 'Im Berechnungsbogen bei „Mehrbedarf“ für Warmwasser. Steht dort nichts, leer lassen.',
    'ga-b-kdu': 'Im Berechnungsbogen bei „Kosten der Unterkunft und Heizung“ (KdU, also Miete, Nebenkosten und Heizung): der Betrag, den das Amt übernimmt.',
    'ga-b-eink': 'Im Berechnungsbogen bei „anzurechnendes Einkommen“, zum Beispiel die Rente nach Abzügen.',
    'ga-b-zahl': 'Auf der ersten Seite: der Betrag, der jeden Monat überwiesen wird.',
    'ga-az': 'Oben im Brief neben „Aktenzeichen“ oder „Geschäftszeichen“.',
    'wg-b-miete': 'In der Berechnung des Bescheids bei „zu berücksichtigende Miete“ oder „Miete/Belastung“.',
    'wg-b-eink': 'In der Berechnung bei „Gesamteinkommen“ (monatlich).',
    'wg-b-wg': 'Auf der ersten Seite: das Wohngeld im Monat.',
    'wg-az': 'Oben im Brief neben „Wohngeldnummer“ oder „Aktenzeichen“.',
    'kz-b-bedarf': 'In der Berechnung des Bescheids bei „Bedarf der Eltern“ bzw. „elterlicher Bedarf“.',
    'kz-b-eink': 'In der Berechnung bei „Einkommen der Eltern“.',
    'kz-b-kiz': 'Auf der ersten Seite: der Kinderzuschlag im Monat für alle Kinder zusammen.',
    'kz-kgnr': 'Oben im Brief, zum Beispiel 123FK456789. Steht auch auf jedem Brief zum Kindergeld.'
  };
  // Zugeklappt hinter „Wo steht das?“ (gemeinsames Bauteil details.mehr): sichtbar wird nur die Hilfe des angetippten Feldes
  for (const [id, text] of Object.entries(FELD_HILFE)) {
    const el = $(id); if (!el || el.dataset.hilfe) continue;
    el.dataset.hilfe = '1';
    const d = h('details', { class: 'mehr feld-hilfe', id: id + '-hilfe' }, h('summary', { text: 'Wo steht das?' }), h('p', { text }));
    el.insertAdjacentElement('afterend', d);
  }
  // Für die App: Gutachten-Prüfung mit den Antworten der eigenen Einschätzung füllen (Leistungsseite → „Brief prüfen“)
  window.PruefpaketPflege = {
    setze(g, art) {
      erkFertig('pf', false); // Antworten der eigenen Einschätzung, nicht aus dem Brief
      setzePflege(g);
      if (g.alterJahre != null) $('pf-alter').value = g.alterJahre;
      if (g.alterMonate != null) $('pf-monate').value = g.alterMonate;
      if (art === 'hoeher') $('pf-art-h').checked = true; else if (art === 'widerspruch') $('pf-art-w').checked = true;
      zeigePfArt(); zeigePflege();
    },
    eigene(g) {
      eigen = g || null;
      // Alter aus der Einschätzung übernehmen, wenn noch keins eingetragen ist (UX-Audit D #3)
      if (eigen && eigen.alterJahre != null && eigen.alterJahre !== '' && !$('pf-alter').value) $('pf-alter').value = eigen.alterJahre;
      if (eigen && eigen.alterMonate != null && eigen.alterMonate !== '' && !$('pf-monate').value) $('pf-monate').value = eigen.alterMonate;
      zeigePflege();
    }
  };
  // Datum des Bescheids nicht sicher erkannt: Feld leer lassen und als „bitte eintragen“ markieren (nie ein anderes Datum raten)
  function datumFehlt(id) {
    const el = $(id); el.classList.add('pp-fehlt');
    let p = $(id + '-fehlt');
    if (!p) {
      p = h('p', { class: 'small pp-fehlt-hinweis', id: id + '-fehlt', text: 'Bitte eintragen: Das Datum des Bescheids wurde nicht sicher erkannt. Es steht meist oben rechts im Brief oder hinter „Bescheid vom“.' });
      el.insertAdjacentElement('afterend', p); el.setAttribute('aria-describedby', p.id);
      el.addEventListener('input', () => { if (el.value) { el.classList.remove('pp-fehlt'); p.hidden = true; } });
    }
    p.hidden = false;
  }
  // Für die App: erkannte Werte eines eingelesenen Briefs eintragen (erweiterungen/brief-lesen.js) und gelb markieren.
  // hh = Haushalt aus „Leistungen“: { erwachsene: [{ alter, brutto, netto }], kinder: [alter], miete, heiz, stufe, alleinerziehend }
  // Personen werden nur eingetragen, wenn dort noch nichts steht. Ergebnis: Zahl der übernommenen Werte aus dem Brief.
  window.PruefpaketLesen = {
    // quelle (optional): { foto: true bei Texterkennung aus einem Foto, unsicher: [Wörter, die die Erkennung als unsicher meldet] }
    fuelle(art, r, hh, quelle) {
      for (const q of Object.keys(ERK)) erkFertig(q, q !== { jc: 'bs', sa: 'ga', wg: 'wg', fk: 'kz', vm: 'nk' }[art]);
      let n = 0;
      const setze = (id, v) => { const el = $(id); if (!el || v == null || v === '') return; el.value = v; el.classList.add('pp-erkannt'); n++; };
      const leer = (id) => !$(id) || $(id).value === '';
      const fuellen = (id, v) => { if (leer(id) && v != null && v !== '' && v !== 0) $(id).value = v; };
      hh = hh || { erwachsene: [], kinder: [] };
      const erw = hh.erwachsene || [], kin = hh.kinder || [];
      // Nur leere Zeilen (z. B. die erste, leere Person) dürfen durch den Haushalt ersetzt werden
      const nurLeer = (tbody) => [...$(tbody).querySelectorAll('input[type="number"]')].every((el) => el.value === '');
      const kAlter = (k) => (k && typeof k === 'object' ? k.alter : k); // Kinder: { alter, gruppe } (Alter nur, wenn wirklich bekannt)
      if (art === 'jc' && erw.length && nurLeer('bs-personen')) {
        $('bs-personen').replaceChildren();
        erw.forEach((p) => personZeile('erw', { alter: p.alter, brutto: p.brutto, netto: p.netto, hh: true }));
        kin.forEach((k) => personZeile('kind', { alter: kAlter(k), gruppe: k && k.gruppe, hh: true }));
        fuellen('bs-miete', hh.miete); fuellen('bs-heiz', hh.heiz); // miete: ohne Heizung (nur, wenn im Check Heizkosten stehen)
      }
      if (art === 'sa') {
        if (erw.length === 2) $('ga-zahl').value = '2';
        fuellen('ga-miete', hh.miete); fuellen('ga-heiz', hh.heiz);
      }
      if (art === 'wg') {
        fuellen('wg-n', erw.length + kin.length || ''); fuellen('wg-kalt', hh.miete);
        if (hh.stufe && $('wg-stufe').querySelector(`option[value="${hh.stufe}"]`)) $('wg-stufe').value = hh.stufe;
        if (hh.alleinerziehend) $('wg-ae').checked = true;
        if (nurLeer('wg-mitglieder')) $('wg-mitglieder').replaceChildren();
        // Elterngeld aus dem Check: ausgezahlter Betrag, Basiselterngeld/ElterngeldPlus und Kinder dieser Geburt (p.eg); sonst wie bisher Lohn mit Brutto
        if (!$('wg-mitglieder').children.length) erw.forEach((p) => { if (p.eg && p.eg.betrag) wgZeile({ art: 'eg', brutto: p.eg.betrag, egPlus: p.eg.plus, egKinder: p.eg.kinder }); else if (p.brutto) wgZeile({ art: 'lohn', brutto: p.brutto }); });
      }
      if (art === 'fk') {
        if (erw.length === 2) $('kz-zahl').value = '2';
        if (erw[0]) { fuellen('kz-b1', erw[0].brutto); fuellen('kz-n1', erw[0].netto); }
        if (erw[1]) { fuellen('kz-b2', erw[1].brutto); fuellen('kz-n2', erw[1].netto); }
        if (kin.length && nurLeer('kz-kinder')) $('kz-kinder').replaceChildren();
        if (!$('kz-kinder').children.length) kin.forEach((k) => kzKind({ alter: kAlter(k) }));
        fuellen('kz-wohn', hh.warm); // Wohnkosten mit Heizung = Warmmiete aus dem Check
      }
      for (const [id, v] of Object.entries((r && r.felder) || {})) setze(id, v);
      if (art === 'vm' && r && r.posten && r.posten.length) {
        $('nk-posten').replaceChildren();
        r.posten.forEach((p) => nkZeile(p));
        for (const el of $('nk-posten').querySelectorAll('input[type="text"], input[type="number"]')) if (el.value !== '') el.classList.add('pp-erkannt');
        n += r.posten.length;
      }
      const datumId = { jc: 'bs-datum', sa: 'ga-datum', wg: 'wg-datum', fk: 'kz-datum' }[art];
      if (datumId && r && r.datum) setze(datumId, r.datum);
      else if (datumId && r && leer(datumId)) datumFehlt(datumId);
      const teil = { jc: 'bs', sa: 'ga', wg: 'wg', fk: 'kz', vm: 'nk' }[art];
      if (teil) erkMarke(teil, quelle && quelle.foto && r ? unsichereFelder(art, r, quelle) : null);
      const fp = { jc: 'bs', sa: 'ga', wg: 'wg', fk: 'kz' }[art]; if (fp && fristNeu[fp]) fristNeu[fp]();
      ({ jc: zeigeBescheid, sa: zeigeGSA, wg: zeigeWG, fk: zeigeKiZ, vm: zeigeNK }[art] || (() => {}))();
      return n;
    }
  };

  $('bs-erw').addEventListener('click', () => { personZeile('erw'); zeigeBescheid(); });
  $('bs-kind').addEventListener('click', () => { personZeile('kind'); zeigeBescheid(); });
  $('bs-form').addEventListener('input', zeigeBescheid);
  $('bs-form').addEventListener('change', nurAuswahl(zeigeBescheid));
  $('bs-beispiel').addEventListener('click', () => {
    $('bs-personen').replaceChildren();
    personZeile('erw', { alter: 34, brutto: 1000, netto: 800 }); personZeile('kind', { alter: 4 }); personZeile('kind', { alter: 9 });
    $('bs-miete').value = 700; $('bs-heiz').value = 100; $('bs-ww').checked = false;
    const b = { 'bs-b-regel': 1310, 'bs-b-ae': 67.56, 'bs-b-schw': '', 'bs-b-ww': '', 'bs-b-kdu': 800, 'bs-b-eink': 500, 'bs-b-kg': 518, 'bs-b-zahl': 1162.56 };
    for (const [k, v] of Object.entries(b)) $(k).value = v;
    zeigeBescheid();
  });
  $('bs-wid-mach').addEventListener('click', macheBescheidWiderspruch);
  $('bs-wid-copy').addEventListener('click', () => kopiere($('bs-wid-text'), $('bs-copy-msg')));
  personZeile('erw'); zeigeBescheid();

  // ---------------- Frist ganz oben (alle Bescheid-Prüfungen) ----------------
  // Datum des Bescheids unter der Überschrift, sofort „Widerspruch bis …“ (.frist). Rechnung: erweiterungen/fristen.js (§ 37 Abs. 2 SGB X,
  // § 84 Abs. 1, § 64 SGG; gesetze-im-internet.de, abgerufen 20.11.2026). Jobcenter: zuerst die Art des Briefs.
  const FRIST_OBEN = [['bs', 'p-bescheid', 'jc', 'bs-datum'], ['ga', 'p-gsa', 'sa', 'ga-datum'], ['wg', 'p-wg', 'wg', 'wg-datum'], ['kz', 'p-kiz', 'fk', 'kz-datum']];
  const ARTWAHL = [['bescheid', 'Bescheid (Entscheidung über Geld)'], ['termin', 'Einladung zu einem Termin'], ['anh', 'Anhörung (das Amt fragt, bevor es entscheidet)'], ['mit', 'Aufforderung, Unterlagen nachzureichen']];
  const ART_KOPF = { bescheid: ['bp.jc.h', 'Bescheid Grundsicherungsgeld prüfen'], termin: ['bp.art.termin.h', 'Einladung zu einem Termin'], anh: ['bp.art.anh.h', 'Anhörung vor einer Entscheidung'], mit: ['bp.art.mit.h', 'Unterlagen nachreichen'] };
  const ART_ERKL = { termin: ['fri.art.termin.t', 'Kannst du nicht kommen, sag vorher ab und nenne den Grund.'], anh: ['fri.art.anh.t', 'Du darfst dich bis zu diesem Tag äußern.'], mit: ['fri.art.mit.t', 'Reiche die Unterlagen bis zu diesem Tag ein.'] };
  function fristOben(p, sec, stelle, datumId) {
    const karte = $(sec) && $(sec).querySelector('.card'), feld = $(datumId);
    if (!karte || !feld || $(p + '-fristbox')) return;
    const box = h('div', { class: 'pp-frist-box', id: p + '-fristbox' });
    const satz = karte.querySelector('h2 + p');
    if (satz) satz.insertAdjacentElement('afterend', box); else karte.append(box);
    // Jobcenter: Art des Briefs
    let art = 'bescheid';
    const anders = h('div', { class: 'pp-art-anders', hidden: true });
    const bescheidTeil = h('div', { class: 'pp-art-bescheid' });
    if (p === 'bs') {
      const fs = h('fieldset', { class: 'pp-artwahl' }, h('legend', { 'data-t': 'bp.art.frage', text: tA('bp.art.frage', 'Was für ein Brief ist es?') }));
      for (const [v, de] of ARTWAHL) fs.append(h('label', { class: 'check' }, h('input', { type: 'radio', name: 'bs-briefart', value: v, checked: v === 'bescheid' }), h('span', { 'data-t': 'bp.art.' + v, text: tA('bp.art.' + v, de) })));
      fs.addEventListener('change', (ev) => { if (ev.target.name === 'bs-briefart') { art = ev.target.value; zeigeArt(); } });
      box.append(fs);
    }
    // Datum des Bescheids (das vorhandene Feld samt Beschriftung)
    const lab = document.querySelector(`label[for="${datumId}"]`), wrap = feld.parentElement;
    if (lab) { lab.setAttribute('data-t', 'bp.datum'); lab.textContent = tA('bp.datum', 'Datum des Bescheids (steht oben rechts im Brief)'); }
    const aus = h('div', { class: 'pp-frist-aus', 'aria-live': 'polite' });
    bescheidTeil.append(wrap, aus);
    box.append(bescheidTeil, anders);
    let zug = null;
    const zeigeFrist = () => {
      aus.replaceChildren();
      const d = feld.value;
      if (zug) zug.hidden = true;
      widKnopf(p, false);
      if (!/^\d{4}-\d\d-\d\d$/.test(d)) { aus.append(h('p', { class: 'small muted', 'data-t': 'bp.datum.t', text: tA('bp.datum.t', 'Trag das Datum ein. Dann zeigt SoLo sofort, bis wann du Widerspruch einlegen kannst.') })); return; }
      zug.hidden = !(isoGut(d) && Fristen.widerspruch({ datum: d }).fristende < heute());
      const f = widFrist(p, d) || Fristen.widerspruch({ datum: d });
      if (f.fristende < heute()) { widKnopf(p, true); aus.append(vorbeiBox(p, f.fristende)); return; } // kein „Frist merken“
      aus.append(h('div', { class: 'frist', role: 'note' },
        h('p', { class: 'frist-wann', text: tA('bp.wid.bis', 'Widerspruch bis {datum}', { datum: de(f.fristende) }) }),
        h('p', { text: tA('bp.wid.bis.t', 'Bis zu diesem Tag muss der Widerspruch bei der Stelle sein, die den Bescheid geschickt hat. Gerechnet: Datum des Bescheids plus 4 Tage für die Post, dann ein Monat. Kam der Brief nachweislich später an, endet die Frist später.') }),
        p === 'wg' ? h('p', { class: 'small', text: tA('fri.wid.wg', WG_KLAGE) }) : null));
      if (window.FristenOrdner) aus.append(window.FristenOrdner.knopf(() => widEintrag(stelle, feld.value)));
    };
    // Einladung, Anhörung, Aufforderung zur Mitwirkung: erster Schritt und der Tag aus dem Brief (kein Nachrechnen des Bescheids)
    const zeigeArt = () => {
      const nb = art !== 'bescheid';
      bescheidTeil.hidden = nb; anders.hidden = !nb;
      $(sec).classList.toggle('pp-anders', nb);
      const ein = document.getElementById('einlesen'); if (ein && karte.contains(ein)) ein.hidden = nb;
      // Überschrift je Briefart; „Scanne den Bescheid …“, „Was prüft SoLo genau?“ und „Wörter im Bescheid“ nur beim Bescheid
      const kopf = karte.querySelector('h2');
      if (kopf) { const [hk, hd] = ART_KOPF[art]; kopf.setAttribute('data-t', hk); kopf.textContent = tA(hk, hd); }
      const scanSatz = karte.querySelector('h2 + p'); if (scanSatz) scanSatz.hidden = nb;
      karte.querySelectorAll(':scope > details').forEach((d) => { d.hidden = nb; });
      anders.replaceChildren();
      if (!nb) return;
      const [k, deText] = ART_ERKL[art];
      const tagFeld = h('input', { type: 'date', id: 'bs-art-tag' });
      const fr = h('div', { 'aria-live': 'polite' });
      const zeigeTag = () => {
        fr.replaceChildren();
        if (!/^\d{4}-\d\d-\d\d$/.test(tagFeld.value)) return;
        fr.append(h('div', { class: 'frist', role: 'note' }, h('p', { class: 'frist-wann', text: tA(art === 'termin' ? 'bp.art.termin.am' : 'bp.art.bis', art === 'termin' ? 'Termin am {datum}' : 'Antworten bis {datum}', { datum: de(tagFeld.value) }) })));
        if (window.FristenOrdner) fr.append(window.FristenOrdner.knopf(() => ({ art: art === 'termin' ? 'termin' : art, stelle: 'jc', bis: tagFeld.value, quelle: 'brief' })));
      };
      tagFeld.addEventListener('input', zeigeTag); tagFeld.addEventListener('change', zeigeTag);
      anders.append(...[h('p', { text: tA(k, deText) }),
        art === 'anh' ? h('p', { class: 'small', text: tA('bp.art.anh.t', 'Eine Anhörung ist noch keine Entscheidung. Erkläre kurz, wie es war, und lege Belege bei. Ein Widerspruch ist erst gegen den Bescheid danach möglich.') }) : null,
        h('label', { for: 'bs-art-tag', text: tA(art === 'termin' ? 'bp.art.termin.tag' : 'bp.art.tag', art === 'termin' ? 'Wann ist der Termin? (steht im Brief)' : 'Bis wann? (Datum aus dem Brief)') }), tagFeld, fr].filter(Boolean)); // ohne filter stünde „null“ im Text
    };
    zug = zugangFeld(p, wrap, zeigeFrist);
    feld.addEventListener('input', zeigeFrist); feld.addEventListener('change', zeigeFrist);
    zeigeFrist();
    // Nach dem Einlesen (PruefpaketLesen.fuelle setzt das Datum ohne Ereignis) die Frist neu zeigen
    fristNeu[p] = zeigeFrist;
  }
  const fristNeu = {};
  FRIST_OBEN.forEach((x) => fristOben(...x));

  $('ga-form').addEventListener('input', zeigeGSA);
  $('ga-form').addEventListener('change', nurAuswahl(zeigeGSA));
  $('ga-beispiel').addEventListener('click', () => {
    $('ga-form').reset();
    $('ga-zahl').value = '1'; $('ga-miete').value = 450; $('ga-heiz').value = 70; $('ga-rente1').value = 900; $('ga-zus1').value = 150; $('ga-gr1').checked = true; $('ga-g1').checked = true;
    $('ga-b-regel').value = 563; $('ga-b-g').value = 0; $('ga-b-kdu').value = 520; $('ga-b-eink').value = 1050; $('ga-b-zahl').value = 33;
    zeigeGSA();
  });
  $('ga-wid-mach').addEventListener('click', macheGSAWiderspruch);
  $('ga-wid-copy').addEventListener('click', () => kopiere($('ga-wid-text'), $('ga-copy-msg')));
  zeigeGSA();

  $('wg-plus').addEventListener('click', () => { wgZeile(); zeigeWG(); });
  $('wg-form').addEventListener('input', zeigeWG);
  $('wg-form').addEventListener('change', nurAuswahl(zeigeWG));
  $('wg-beispiel').addEventListener('click', () => {
    $('wg-mitglieder').replaceChildren(); wgZeile({ art: 'lohn', brutto: 2600, abzug: 30 });
    $('wg-n').value = 4; $('wg-stufe').value = 4; $('wg-kalt').value = 800; $('wg-sb').value = 0; $('wg-ae').checked = false;
    $('wg-b-miete').value = 800; $('wg-b-eink').value = 1748.25; $('wg-b-wg').value = BescheidWG.ausBescheid(4, 800, 1748.25, Rules);
    zeigeWG();
  });
  $('wg-wid-mach').addEventListener('click', macheWGWiderspruch);
  $('wg-wid-copy').addEventListener('click', () => kopiere($('wg-wid-text'), $('wg-copy-msg')));
  wgZeile(); zeigeWG();

  $('kz-plus').addEventListener('click', () => { kzKind(); zeigeKiZ(); });
  $('kz-form').addEventListener('input', zeigeKiZ);
  $('kz-form').addEventListener('change', nurAuswahl(zeigeKiZ));
  $('kz-beispiel').addEventListener('click', () => {
    $('kz-kinder').replaceChildren(); kzKind({ alter: 5 }); kzKind({ alter: 9 });
    $('kz-zahl').value = '2'; $('kz-wohn').value = 900; $('kz-b1').value = 2500; $('kz-n1').value = 1900; $('kz-b2').value = ''; $('kz-n2').value = '';
    $('kz-b-bedarf').value = 1651; $('kz-b-eink').value = 1900; $('kz-b-kiz').value = 481.95;
    zeigeKiZ();
  });
  $('kz-wid-mach').addEventListener('click', macheKiZWiderspruch);
  $('kz-wid-copy').addEventListener('click', () => kopiere($('kz-wid-text'), $('kz-copy-msg')));
  zeigeKiZ();

  $('nk-plus').addEventListener('click', () => { nkZeile(); zeigeNK(); });
  $('nk-form').addEventListener('input', zeigeNK);
  $('nk-form').addEventListener('change', nurAuswahl(zeigeNK));
  $('nk-beispiel').addEventListener('click', () => {
    $('nk-form').reset(); $('nk-posten').replaceChildren();
    [{ bez: 'Grundsteuer', gesamt: 2400, anteil: 240, flaeche: true }, { bez: 'Müllabfuhr', gesamt: 1800, anteil: 200, flaeche: true }, { bez: 'Heizkosten', anteil: 900 }, { bez: 'Hausmeister', gesamt: 3000, anteil: 300, flaeche: true },
      { bez: 'Verwaltungskosten', anteil: 180 }, { bez: 'Reparatur Haustür', anteil: 95 }, { bez: 'Rauchmelder Wartung', anteil: 20 }].forEach(nkZeile);
    const v = { 'nk-von': '2025-01-01', 'nk-bis': '2025-12-31', 'nk-zugang': '2026-06-10', 'nk-voraus': 1800, 'nk-wfl': 60, 'nk-gfl': 600, 'nk-heiz': 900, 'nk-verbr': 70, 'nk-co2': 120, 'nk-kg': 30 };
    for (const [k, x] of Object.entries(v)) $(k).value = x;
    $('nk-leist').value = 'sgb2';
    zeigeNK();
  });
  $('nk-ew-mach').addEventListener('click', () => {
    if (erkOffen.nk) { $('nk-info').textContent = erkWarte(); return; }
    const a = leseNK(), r = Nebenkosten.pruefe(a);
    nkText(Nebenkosten.einwendungen({ absender: { name: $('nk-name').value.trim(), strasse: $('nk-anschrift').value.trim(), ort: $('nk-ort').value.trim() }, vermieter: { name: $('nk-verm').value.trim() }, von: a.von, bis: a.bis, heute: heute(), pruefenMit: $('nk-mitpruefen').checked }, r),
      r.fristen && r.fristen.einwendungBis ? `Einwände bitte bis spätestens ${de(r.fristen.einwendungBis)} schicken, am besten per Einwurf-Einschreiben.` : 'Einwände sind bis 12 Monate nach Erhalt der Abrechnung möglich.');
  });
  $('nk-au-mach').addEventListener('click', () => {
    if (erkOffen.nk) { $('nk-info').textContent = erkWarte(); return; }
    const a = leseNK(), r = Nebenkosten.pruefe(a), leist = $('nk-leist').value === 'gsa' ? 'gsa' : 'sgb2';
    nkText(Nebenkosten.antragUebernahme({ absender: { name: $('nk-name').value.trim(), strasse: $('nk-anschrift').value.trim(), ort: $('nk-ort').value.trim() }, stelle: { name: $('nk-stelle').value.trim() }, von: a.von, bis: a.bis, heute: heute(), faellig: $('nk-faellig').value, leistung: leist }, r),
      r.ergebnis > 0 ? 'Bitte sofort abgeben, spätestens im Monat der Fälligkeit, mit einer Kopie der Abrechnung.' : 'Laut Abrechnung gibt es keine Nachzahlung. Ein Guthaben bitte trotzdem beim Amt vorlegen.');
  });
  $('nk-copy').addEventListener('click', () => kopiere($('nk-text'), $('nk-copy-msg')));
  nkZeile(); zeigeNK();

  // ---------------- Alles leeren (App: Wechsel des Vorgangs, Löschen) ----------------
  // Formulare, eingefügte Texte, erkannte Werte, Ergebnisse und fertige Schreiben aller Prüfungen auf den Anfangsstand,
  // damit beim nächsten Klienten nichts vom vorigen sichtbar bleibt (Sicherheitsprüfung S4, 21.11.2026).
  function allesLeeren() {
    // Jobcenter: Art des Briefs zuerst mit Ereignis zurück auf „Bescheid“ (blendet die Teile für Einladung/Anhörung aus)
    const art = document.querySelector('input[name="bs-briefart"][value="bescheid"]');
    if (art && !art.checked) { art.checked = true; art.dispatchEvent(new Event('change', { bubbles: true })); }
    const teile = [...document.querySelectorAll('section[id^="p-"]')];
    for (const sec of teile) {
      for (const f of sec.querySelectorAll('form')) f.reset();
      // auch Felder außerhalb der Formulare (z. B. Datum und Absender in der Frist-Box oben) auf den Anfangswert
      for (const el of sec.querySelectorAll('input, select')) {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = el.defaultChecked;
        else if (el.tagName === 'SELECT') { for (const o of el.options) o.selected = o.defaultSelected; }
        else if (el.type !== 'button' && el.type !== 'submit' && el.type !== 'file') el.value = el.defaultValue;
      }
      for (const ta of sec.querySelectorAll('textarea')) { ta.value = ''; if (ta.readOnly) ta.hidden = true; }
      for (const el of sec.querySelectorAll('.pp-erkannt')) el.classList.remove('pp-erkannt');
      for (const el of sec.querySelectorAll('.pp-fehlt')) el.classList.remove('pp-fehlt');
      for (const el of sec.querySelectorAll('.pp-fehlt-hinweis')) el.hidden = true;
      for (const el of sec.querySelectorAll('[role="status"]')) el.textContent = '';
      delete sec.dataset.offen; // Formular der Prüfung beim nächsten Öffnen wieder erst nach der Wahl (App: briefOeffnen)
    }
    for (const id of ['pf-wid-copy', 'bs-wid-copy', 'ga-wid-copy', 'wg-wid-copy', 'kz-wid-copy', 'nk-copy']) if ($(id)) $(id).hidden = true;
    for (const id of ['pf-msg', 'nk-info']) if ($(id)) $(id).textContent = '';
    for (const id of ['an-erg', 'pf-wid-liste', 'pf-vorbei']) if ($(id)) $(id).replaceChildren();
    for (const id of ['pf-module']) if ($(id)) for (const el of $(id).querySelectorAll('input')) { if (el.type === 'checkbox') el.checked = false; else el.value = ''; }
    $('bs-personen').replaceChildren(); personZeile('erw');
    $('wg-mitglieder').replaceChildren(); wgZeile();
    $('kz-kinder').replaceChildren();
    $('nk-posten').replaceChildren(); nkZeile();
    eigen = null;
    zeigePfArt(); zeigePflege(); zeigeBescheid(); zeigeGSA(); zeigeWG(); zeigeKiZ(); zeigeNK();
    for (const f of Object.values(fristNeu)) f();
  }
  window.PruefpaketLeeren = allesLeeren;

  // ---------------- Anderer Brief: Frist nur mit Beleg, Hinweise zu Mahnbescheid und Inkasso ----------------
  // opt.wechseln(art): in der App zur passenden Prüfung wechseln, wenn SoLo die Art des Briefs erkennt
  const ARTNAME = { jc: 'Bescheid vom Jobcenter', sa: 'Bescheid vom Sozialamt', wg: 'Wohngeldbescheid', fk: 'Bescheid über Kinderzuschlag', pk: 'Brief der Pflegekasse', vm: 'Nebenkostenabrechnung' };
  function zeigeAndere(text, opt) {
    const box = (opt && opt.box) || $('an-erg'); if (!box) return;
    box.replaceChildren();
    if (!String(text || '').trim()) return;
    const r = BriefLesen.andere(text);
    // Frist zuerst und im festen Frist-Muster (.frist, src/template.html „Gestaltungs-System“); Beleg und Prüfhinweis in normaler Größe
    if (r.fristen.length) {
      box.append(h('div', { class: 'frist', role: 'note' },
        h('p', { class: 'frist-wann', text: tA('bp.an.frist', 'Frist im Brief: {frist}', { frist: BriefLesen.fristLesbar(r.fristen[0].frist) }) }),
        h('p', { text: tA('bp.an.zeile', 'So steht es im Brief: „{zeile}“', { zeile: r.fristen[0].zeile }) }),
        h('p', { text: tA('bp.an.pruefen', 'Bitte lies die Frist im Brief selbst nach. Die Texterkennung kann sich irren.') })));
    }
    // Mahnbescheid: Widerspruch am besten binnen 2 Wochen (§ 692 Abs. 1 Nr. 3 ZPO), danach noch, solange kein Vollstreckungsbescheid verfügt ist
    // (§ 694 Abs. 1 ZPO); Vollstreckungsbescheid: Einspruch 2 Wochen, Notfrist (§§ 700, 339 ZPO). Texte übersetzt (src/lang/zusatz, Prüfung Schulden 24.11.2026).
    if (r.mahnbescheid) box.append(h('p', { class: 'frist', role: 'note' }, h('strong', { 'data-t': 'bp.mb.titel', text: tA('bp.mb.titel', 'Das ist wohl ein gerichtlicher Mahnbescheid.') }), ' ', h('span', { 'data-t': 'bp.mb.frist', text: tA('bp.mb.frist', 'Widerspruch am besten innerhalb von 2 Wochen ab Zustellung. Später geht es nur noch, solange das Gericht keinen Vollstreckungsbescheid erlassen hat. Mehr dazu unten.') })));
    if (r.vollstreckungsbescheid) box.append(h('p', { class: 'frist', role: 'note' }, h('strong', { 'data-t': 'bp.vb.titel', text: tA('bp.vb.titel', 'Das ist wohl ein Vollstreckungsbescheid.') }), ' ', h('span', { 'data-t': 'bp.vb.frist', text: tA('bp.vb.frist', 'Einspruch nur innerhalb von 2 Wochen ab Zustellung. Frag sofort eine Schuldnerberatung.') })));
    // Mahnbescheid/Vollstreckungsbescheid: Tag der Zustellung (gelber Umschlag) erfragen, erst der Tipp merkt die Frist
    if ((r.mahnbescheid || r.vollstreckungsbescheid) && window.FristenOrdner) box.append(window.FristenOrdner.knopf((zugang) => ({ art: r.vollstreckungsbescheid ? 'vb' : 'mb', stelle: 'gericht', basis: { zugang }, quelle: 'brief' }), { feld: 'zugang' }));
    if (r.inkasso) box.append(h('p', { class: 'note' }, h('strong', { text: 'Im Brief steht „Inkasso“. ' }), 'Lies unten, was du prüfen solltest.'));
    if (r.fristen.length) {
      if (r.fristen.length > 1) box.append(h('details', {}, h('summary', { text: 'Weitere Fristen im Brief' }), h('ul', {}, r.fristen.slice(1).map((x) => h('li', { text: BriefLesen.fristLesbar(x.frist) + ': „' + x.zeile + '“' })))));
      // Fester Tag im Brief: „Frist merken“ (Widerspruch/Einspruch/Klage, Zahlung oder allgemeine Frist); der Brieftext wird nie gespeichert
      const fz = r.fristen[0], fd = /^(\d{1,2})\.(\d{1,2})\.(20\d{2})$/.exec(fz.frist);
      if (fd && window.FristenOrdner && !r.mahnbescheid && !r.vollstreckungsbescheid) {
        const art = /Widerspruch|Einspruch|Klage/i.test(fz.zeile) ? 'wid' : /zahl|überweis|Betrag/i.test(fz.zeile) ? 'zahl' : 'frist';
        box.append(window.FristenOrdner.knopf(() => ({ art, bis: `${fd[3]}-${fd[2].padStart(2, '0')}-${fd[1].padStart(2, '0')}`, quelle: 'brief' })));
      }
    } else {
      box.append(h('p', {}, h('strong', { text: 'Keine Frist gefunden.' }), ' Das heißt nicht, dass es keine gibt. Suche im Brief nach „bis zum“, „innerhalb von“ oder „binnen“. Im Zweifel frag eine Beratungsstelle.'));
    }
    if (r.art && ARTNAME[r.art] && opt && opt.wechseln) box.append(h('p', {}, 'Das sieht aus wie: ' + ARTNAME[r.art] + '. ', h('button', { type: 'button', class: 'btn ghost', text: 'Diesen Brief genauer prüfen', onclick: () => opt.wechseln(r.art) })));
    box.append(h('p', { class: 'small muted rb-satz', 'data-t': 'rb.satz', text: rbSatz() })); // unter jedem Prüfergebnis, immer derselbe Satz
  }
  window.PruefpaketAndere = { zeige: zeigeAndere };
  if ($('an-lesen')) $('an-lesen').addEventListener('click', () => zeigeAndere($('an-text').value));
  if ($('an-pfaendung') && !$('v-pfaendung')) $('an-pfaendung').hidden = true; // den Pfändungsrechner gibt es nur in der App

  if ($('fr-datum')) for (const id of ['fr-datum', 'fr-zugang', 'er-leistung', 'er-ende']) $(id).addEventListener('input', zeigeFristen); // nur in der Vorschau
  // Spaltennamen an jede Zelle hängen (für die Blockansicht auf schmalen Bildschirmen); Tabellen entstehen bei jeder Eingabe neu
  function beschrifte() {
    for (const t of document.querySelectorAll('section[id^="p-"] .tablewrap table')) {
      const k = [...t.querySelectorAll('thead th')].map((x) => x.textContent);
      for (const tr of t.querySelectorAll('tbody tr')) [...tr.children].forEach((td, i) => { if (k[i] && td.getAttribute('data-l') !== k[i]) td.setAttribute('data-l', k[i]); });
    }
  }
  // Nur die Prüfungs-Abschnitte beobachten (nicht den Rest der App) und Änderungen gebündelt verarbeiten
  let geplant = false;
  const mo = new MutationObserver(() => { if (!geplant) { geplant = true; setTimeout(() => { geplant = false; beschrifte(); }, 0); } });
  document.querySelectorAll('section[id^="p-"]').forEach((s) => mo.observe(s, { childList: true, subtree: true }));
  beschrifte();
  // ---------------- Einfache Sprache (nur in der App, nur Deutsch; Schalter in den Einstellungen) ----------------
  // Wörterbuch src/lang/einfach/brief/brief.json, im Paket als BRIEF_EINFACH (scripts/build.js). Schlüssel = deutscher Standardtext,
  // {1} {2} … = Werte aus dem Programm. Ersetzt werden nur sichtbare Texte (Textknoten, placeholder, aria-label) unter der Wurzel,
  // nie Eingaben, nie textarea (Schreiben an Ämter bleiben förmlich), nie Elemente mit data-t (übersetzt die App). Ausschalten stellt alles zurück.
  const EIN = typeof BRIEF_EINFACH !== 'undefined' && BRIEF_EINFACH && BRIEF_EINFACH.texte ? BRIEF_EINFACH.texte : null;
  const einNorm = (x) => String(x).replace(/\s+/g, ' ').trim();
  const einGenau = new Map(), einMuster = [], einTeile = [];
  if (EIN) for (const [k, v] of Object.entries(EIN)) {
    if (v === '=' || typeof v !== 'string') continue;
    if (/\{\d+\}/.test(k)) {
      const nr = [], quelle = k.split(/(\{\d+\})/).map((t) => { const m = /^\{(\d+)\}$/.exec(t); if (m) { nr.push(m[1]); return '(.+?)'; } return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('');
      einMuster.push({ re: new RegExp('^' + quelle + '$'), nr, v });
    } else { einGenau.set(k, v); if (k.split(' ').length >= 3) einTeile.push([k, v]); }
  }
  einTeile.sort((x, y) => y[0].length - x[0].length);
  function einText(roh) {
    const n = einNorm(roh); if (!n) return null;
    if (einGenau.has(n)) return einGenau.get(n);
    for (const m of einMuster) { const x = m.re.exec(n); if (x) return m.v.replace(/\{(\d+)\}/g, (y, i) => (m.nr.indexOf(i) >= 0 ? x[m.nr.indexOf(i) + 1] : y)); }
    // zusammengesetzte Texte (z. B. „Kein Grund gefunden. “ + Frist): bekannte ganze Sätze darin ersetzen
    let r = n; for (const [k, v] of einTeile) if (r.indexOf(k) >= 0) r = r.split(k).join(v);
    return r !== n ? r : null;
  }
  let einAn = false, einMo = null;
  const einStand = new Map(); // Knoten oder [Element, Attribut] → { orig, ein }
  const einAus = (el) => !el || el.closest('textarea, script, style, [data-t], [contenteditable="true"]');
  function einKnoten(n) {
    if (n.nodeType === 3) {
      if (einAus(n.parentElement)) return;
      const alt = einStand.get(n); if (alt && n.nodeValue === alt.ein) return;
      const e = einText(n.nodeValue); if (e == null) return;
      const m = /^(\s*)[\s\S]*?(\s*)$/.exec(n.nodeValue), neu = m[1] + e + m[2];
      einStand.set(n, { orig: n.nodeValue, ein: neu }); n.nodeValue = neu;
      return;
    }
    if (n.nodeType !== 1 || einAus(n)) return;
    for (const el of [n, ...n.querySelectorAll('[placeholder], [aria-label]')]) for (const a of ['placeholder', 'aria-label']) {
      if (!el.hasAttribute(a) || einAus(el)) continue;
      const key = el, schl = a + '@'; const st = (einStand.get(key) || {})[schl];
      if (st && el.getAttribute(a) === st.ein) continue;
      const e = einText(el.getAttribute(a)); if (e == null) continue;
      const o = einStand.get(key) || {}; o[schl] = { orig: el.getAttribute(a), ein: e }; einStand.set(key, o); el.setAttribute(a, e);
    }
    const w = document.createTreeWalker(n, 4); for (let t = w.nextNode(); t; t = w.nextNode()) einKnoten(t);
  }
  function einZurueck() {
    for (const [k, v] of einStand) {
      if (k.nodeType === 3) { if (k.nodeValue === v.ein) k.nodeValue = v.orig; continue; }
      for (const schl of Object.keys(v)) { const a = schl.slice(0, -1); if (k.getAttribute(a) === v[schl].ein) k.setAttribute(a, v[schl].orig); }
    }
    einStand.clear();
  }
  function einSetze(an, wurzel) {
    an = !!an && !!EIN && !!wurzel;
    if (einMo) { einMo.disconnect(); einMo = null; }
    if (!an) { if (einAn) einZurueck(); einAn = false; return; }
    einAn = true;
    einKnoten(wurzel); beschrifte();
    einMo = new MutationObserver((liste) => { for (const r of liste) { if (r.type === 'characterData') einKnoten(r.target); else if (r.type === 'attributes') einKnoten(r.target); else r.addedNodes.forEach(einKnoten); } beschrifte(); });
    einMo.observe(wurzel, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label'] });
  }
  window.PruefpaketEinfach = { setze: einSetze, text: (x) => (einAn ? einText(x) || x : x), aktiv: () => einAn };
  if ($('li-demo')) {
    $('li-demo').addEventListener('click', () => zeigeLizenz(DEMO_LIZENZ));
    $('li-datei').addEventListener('change', async (e) => { const f = e.target.files && e.target.files[0]; if (f) zeigeLizenz(await f.text()); });
  }
})();
