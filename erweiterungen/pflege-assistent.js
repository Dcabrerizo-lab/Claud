// Geführte Selbsteinschätzung des Pflegegrads: eine Frage pro Bildschirm, wie die einfache Version der App.
// Rechnung: pflege.js (§ 15 SGB XI). Texte: pflege-fragen.js. Ausgabe nur über Elemente und textContent (kein innerHTML mit Eingaben).
// PflegeAssistent.start(container, { pgAktuell, antworten, ergebnis, speichern(a), beimErgebnis(r), aktionen: [{ titel, text, kachel, sym, wenn(r, pg), fn(r, antworten, eingabe) }], abbrechen() })
// Aktionen mit „kachel“ erscheinen als Kachel (höchstens 3), die übrigen als Textlink.
const PflegeAssistent = (function () {
  'use strict';
  const P = Pflege, F = PflegeFragen;
  const h = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  };
  const zahl = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
  const eur = (x) => (Math.round(x * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €';

  function neu() { return { v: 2, alterJahre: '', alterMonate: '', vor: {}, stufen: {}, m5: {}, m5Hilfe: {}, m5Wahl: {}, inkontinenz: { harn: false, stuhl: false }, ink: null, sonde: null, k4K: false, pos: 0 }; }
  function monate(a) { const j = a.alterJahre === '' ? null : +a.alterJahre; if (j == null) return null; return j < 2 && a.alterMonate !== '' ? +a.alterMonate : Math.round(j * 12); }
  function istKind(a) { const m = monate(a); return m != null && m < 216; }
  function saeugling(a) { const m = monate(a); return m != null && m < 18; }

  // Punkte in Bereich 5 in der Reihenfolge von pflege.js; Frühförderung nur bei Kindern
  function m5Ids(a) { return P.M5A.concat(P.M5B, P.M5C).map((x) => x[0]).filter((id) => id !== '5.K' || istKind(a)); }
  // Ältere Speicherstände (Bereich 5 als 16 Einzelfragen) auf die Liste umstellen; die Werte für die Rechnung bleiben gleich
  function migriere(a) {
    if (a.v === 2) return a;
    a.m5Hilfe = {};
    for (const [id, w] of Object.entries(a.m5 || {})) if (w && Object.keys(w).length) a.m5Hilfe[id] = true;
    delete a.m5Wahl; a.v = 2;
    return a;
  }
  // Ablauf aus den bisherigen Antworten: Alter, je Bereich die Vorfrage und bei „Ja“ die Fragen, am Ende das Ergebnis
  function schritte(a) {
    const s = [{ art: 'alter' }];
    for (const m of [1, 2, 3, 4, 5, 6]) {
      s.push({ art: 'vor', m });
      if (a.vor[m] !== true) continue;
      if (m === 4 && saeugling(a)) { s.push({ art: 'k4K', m }); continue; }
      if (m === 5) {
        s.push({ art: 'm5liste', m });
        for (const id of m5Ids(a)) if ((a.m5Hilfe || {})[id]) s.push({ art: 'm5', m, id });
        s.push({ art: 'krit', m, id: '5.16', skala: 'sel' });
        continue;
      }
      for (const k of P.KRITERIEN.filter((x) => x.m === m)) {
        if (k.id === '4.11') { s.push({ art: 'ink', m }); if (a.inkontinenz.harn) s.push({ art: 'krit', m, id: k.id, skala: k.s }); continue; }
        if (k.id === '4.12') { if (a.inkontinenz.stuhl) s.push({ art: 'krit', m, id: k.id, skala: k.s }); continue; }
        s.push({ art: 'krit', m, id: k.id, skala: k.s });
      }
    }
    s.push({ art: 'ergebnis' });
    return s;
  }
  // Antworten in die Eingabe von pflege.js übersetzen
  function eingabe(a, pgAktuell) {
    const m5 = {};
    for (const [id, w] of Object.entries(a.m5 || {})) if (!a.m5Hilfe || a.m5Hilfe[id]) m5[id] = w;
    if (a.stufen['5.16'] != null) m5['5.16'] = a.stufen['5.16'];
    const stufen = {};
    for (const [id, v] of Object.entries(a.stufen)) if (id !== '5.16' && a.vor[+id.split('.')[0]] === true) stufen[id] = v;
    return { stufen, m5: a.vor[5] === true ? m5 : {}, inkontinenz: a.vor[4] === true ? a.inkontinenz : { harn: false, stuhl: false }, k4K: a.vor[4] === true && a.k4K,
      alterJahre: a.alterJahre, alterMonate: a.alterMonate, pgBescheid: pgAktuell == null ? '' : pgAktuell };
  }

  // Feste Texte: F.ui(Schlüssel, Standardtext, Werte) liefert bei Einfacher Sprache die einfache Fassung (src/lang/einfach/pflege/pflege.json)
  const T = (k, std, p) => F.ui(k, std, p);
  const modulKurz = (m) => F.modul(m, P.MODUL[m].kurz);

  function start(box, opt) {
    opt = opt || {};
    F.setEinfach(!!opt.einfach); // Einfache Sprache (nur Deutsch): setzt die App beim Start
    const a = migriere(Object.assign(neu(), opt.antworten || {}));
    const pgAktuell = opt.pgAktuell == null || opt.pgAktuell === '' ? null : +opt.pgAktuell;
    const merken = () => { if (opt.speichern) try { opt.speichern(JSON.parse(JSON.stringify(a))); } catch (e) {} };
    function weiter() { a.pos++; merken(); zeige(true); }
    function zurueck() { if (a.pos > 0) { a.pos--; merken(); zeige(true); } else if (opt.abbrechen) opt.abbrechen(); }

    // Kopf: oben „Zurück“, dann wo man ist (Bereich, Frage x von y) und ein Balken
    function kopf(s, liste) {
      let wo = T('kopf.vorab', 'Vorab'), nr = '';
      if (s.m) {
        wo = T('kopf.bereich', 'Bereich {m} von 6: {name}', { m: s.m, name: modulKurz(s.m) });
        const imBereich = liste.filter((x) => x.m === s.m && x.art !== 'vor');
        const k = imBereich.indexOf(s);
        if (k >= 0) nr = T('kopf.frage', 'Frage {k} von {n}', { k: k + 1, n: imBereich.length });
      }
      const frac = Math.round(100 * a.pos / Math.max(1, liste.length - 1));
      return h('div', { class: 'es-top pa-kopf' },
        h('div', { class: 'pa-zeile' }, h('button', { type: 'button', class: 'linkbtn pa-zur', onclick: zurueck, text: T('zurueck', '← Zurück') }), nr ? h('span', { class: 'es-prog', text: nr }) : null),
        h('span', { class: 'es-prog pa-wo', text: wo }),
        h('div', { class: 'es-bar', 'aria-hidden': 'true' }, h('span', { style: `width:${frac}%` })));
    }
    function knoepfe(antworten, gewaehlt, wahl) {
      return h('div', { class: 'es-wahl', role: 'group', 'aria-labelledby': 'pa-q' }, antworten.map((x, i) =>
        h('button', { type: 'button', class: 'es-btn' + (gewaehlt === i ? ' an' : ''), 'aria-pressed': gewaehlt === i ? 'true' : 'false', onclick: () => wahl(i) },
          h('span', { class: 'pa-a', text: x.text }))));
    }
    // Unten: „Weiß ich nicht“ (nur bei Einzelfragen) und „Später weitermachen“, beides schlicht als Link
    function nav(weissNicht) {
      return h('div', { class: 'pa-unten' },
        weissNicht ? h('button', { type: 'button', class: 'linkbtn', onclick: weissNicht, text: T('weissNicht', 'Weiß ich nicht') }) : null,
        h('button', { type: 'button', class: 'linkbtn', onclick: () => opt.abbrechen && opt.abbrechen(), text: T('spaeter', 'Später weitermachen') }));
    }

    function zeige(fokus) {
      const liste = schritte(a);
      if (a.pos >= liste.length) a.pos = liste.length - 1;
      const s = liste[a.pos];
      box.replaceChildren();
      if (s.art === 'ergebnis') { zeigeErgebnis(); if (fokus) fokusiere(); return; }
      let frage = '', hilfe = '', inhalt, weissNicht = null, nachher = null;
      if (s.art === 'alter') {
        frage = T('alter.frage', 'Wie alt ist die Person, die gepflegt wird?');
        const inp = h('input', { id: 'pa-jahre', type: 'number', min: '0', max: '120', inputmode: 'numeric', value: a.alterJahre, 'aria-labelledby': 'pa-q' });
        const mon = h('input', { id: 'pa-monate', type: 'number', min: '0', max: '23', inputmode: 'numeric', value: a.alterMonate });
        const monBox = h('div', { class: 'field', hidden: !(a.alterJahre !== '' && +a.alterJahre < 2) }, h('label', { for: 'pa-monate', text: T('alter.monate', 'Alter in Monaten') }), mon);
        const warn = h('p', { class: 'warn', hidden: true });
        inp.addEventListener('input', () => { monBox.hidden = !(inp.value !== '' && +inp.value < 2); });
        // „So geht es“ zugeklappt unter dem Weiter-Knopf (gemeinsames Bauteil details.mehr): die erste Frage steht zuerst
        nachher = h('details', { class: 'mehr pa-sogehts' }, h('summary', { text: T('sogehts.titel', 'So geht es') }),
            h('ol', { class: 'es-liste' },
              h('li', { text: T('sogehts.1', 'Es gibt 6 Lebensbereiche. Zu jedem kommt zuerst eine Frage mit Ja oder Nein.') }),
              h('li', { text: T('sogehts.2', 'Nur bei „Ja“ folgen genauere Fragen. Unter jeder Frage steht, was zählt.') }),
              h('li', { text: T('sogehts.3', 'Am Ende siehst du, welcher Pflegegrad wahrscheinlich ist.') })),
            h('p', { class: 'small', text: T('sogehts.klein', 'Es zählt nur Hilfe durch andere Menschen. Hilfsmittel wie Rollator oder Brille zählen als „allein“. Du kannst jederzeit aufhören.') }));
        inhalt = h('div', {},
          h('div', { class: 'es-zahl' }, inp, h('span', { text: T('alter.jahre', 'Jahre') })), monBox, warn,
          h('div', { class: 'es-nav1' }, h('button', { type: 'button', class: 'es-btn es-weiter', text: T('weiter', 'Weiter ➜'), onclick: () => {
            const j = inp.value.trim();
            if (j === '' || !(+j >= 0 && +j <= 120)) { warn.hidden = false; warn.textContent = T('alter.warn', 'Bitte das Alter in Jahren eintragen.'); inp.focus(); return; }
            a.alterJahre = String(Math.floor(+j)); a.alterMonate = +j < 2 ? mon.value : '';
            weiter();
          } })));
      } else if (s.art === 'vor') {
        const vf = F.vorfrage(s.m); frage = vf.frage; hilfe = vf.hinweis;
        inhalt = knoepfe([{ text: T('ja', 'Ja') }, { text: T('nein', 'Nein') }], a.vor[s.m] === true ? 0 : a.vor[s.m] === false ? 1 : null, (i) => { a.vor[s.m] = i === 0; weiter(); });
      } else if (s.art === 'k4K') {
        frage = T('k4K.frage', 'Gibt es beim Füttern so große Probleme, dass die Pflege außergewöhnlich aufwendig ist?');
        hilfe = T('k4K.hinweis', 'Nur bei Kindern bis 18 Monate: Gemeint sind zum Beispiel Schluckstörungen, sehr lange Mahlzeiten oder Ernährung über eine Sonde.');
        inhalt = knoepfe([{ text: T('ja', 'Ja') }, { text: T('nein', 'Nein') }], a.k4K === true ? 0 : null, (i) => { a.k4K = i === 0; weiter(); });
      } else if (s.art === 'ink') {
        frage = T('ink.frage', 'Ist die Person inkontinent, oder hat sie einen Katheter oder ein Stoma?');
        hilfe = T('ink.hinweis', 'Gemeint ist überwiegend oder ganz inkontinent, also mehr als ab und zu ein paar Tropfen.');
        const opts = [{ text: T('ink.0', 'Nein') }, { text: T('ink.1', 'Ja, Urin (oder Katheter, Urostoma)') }, { text: T('ink.2', 'Ja, Stuhl (oder künstlicher Darmausgang)') }, { text: T('ink.3', 'Ja, beides') }];
        inhalt = knoepfe(opts, a.ink, (i) => { a.ink = i; a.inkontinenz = { harn: i === 1 || i === 3, stuhl: i === 2 || i === 3 }; weiter(); });
      } else if (s.art === 'krit') {
        const sk = P.SKALA[s.skala];
        frage = F.frage(s.id); hilfe = F.hinweis(s.id) + (istKind(a) ? ' ' + F.kind() : '');
        const antworten = F.antwortTexte(s.skala, sk.kurz).map((t) => ({ text: t.charAt(0).toUpperCase() + t.slice(1) }));
        inhalt = knoepfe(antworten, a.stufen[s.id] == null ? null : a.stufen[s.id], (i) => { a.stufen[s.id] = i; weiter(); });
        weissNicht = () => { delete a.stufen[s.id]; weiter(); };
      } else if (s.art === 'm5liste') {
        frage = T('m5liste.frage', 'Wobei muss jemand helfen?');
        hilfe = T('m5liste.hinweis', 'Tippe alles an, was zutrifft. Es zählt nur, wenn jemand anderes hilft, weil die Person es nicht selbst kann. Danach fragen wir nur zu diesen Punkten, wie oft.');
        a.m5Hilfe = a.m5Hilfe || {};
        const liste5 = h('div', { class: 'pa-checks', role: 'group', 'aria-labelledby': 'pa-q' }, m5Ids(a).map((id) => {
          const cb = h('input', { type: 'checkbox', 'data-m5': id, checked: !!a.m5Hilfe[id] });
          cb.addEventListener('change', () => { if (cb.checked) a.m5Hilfe[id] = true; else { delete a.m5Hilfe[id]; delete a.m5[id]; if (a.m5Wahl) delete a.m5Wahl[id]; } merken(); });
          return h('label', { class: 'check pa-check' }, cb, h('span', { text: F.kurz(id) }));
        }));
        inhalt = h('div', {}, liste5, h('div', { class: 'es-nav1' }, h('button', { type: 'button', class: 'es-btn es-weiter', text: T('weiter', 'Weiter ➜'), onclick: weiter })));
      } else if (s.art === 'm5') {
        frage = F.m5Oft(s.id); hilfe = F.m5Tipp(s.id);
        a.m5Wahl = a.m5Wahl || {};
        inhalt = knoepfe(F.m5Antworten(s.id), a.m5Wahl[s.id] != null ? a.m5Wahl[s.id] : null, (i) => { a.m5Wahl[s.id] = i; a.m5[s.id] = F.m5Wert(s.id, i); weiter(); });
        weissNicht = () => { delete a.m5[s.id]; delete a.m5Wahl[s.id]; weiter(); };
      }
      box.append(...[kopf(s, liste), h('h2', { class: 'es-q', id: 'pa-q', tabindex: '-1', text: frage }), hilfe ? h('p', { class: 'es-h', text: hilfe }) : null,
        inhalt, nachher, nav(weissNicht)].filter(Boolean));
      if (fokus) fokusiere();
    }
    function fokusiere() { const q = box.querySelector('#pa-q'); if (q) { q.focus({ preventScroll: true }); try { box.scrollIntoView({ block: 'start' }); } catch (e) {} } }

    // Ergebnisseite: groß der wahrscheinliche Pflegegrad, kurz was er bedeutet, dann höchstens 3 Kacheln; Punkte und Tipp zum Aufklappen.
    // Das Ergebnis meldet opt.beimErgebnis (die App speichert es). „← Zurück“ verlässt die Einschätzung, „Antworten ändern“ geht zur letzten Frage.
    function zeigeErgebnis() {
      const g = eingabe(a, pgAktuell), r = P.rechne(g);
      if (opt.beimErgebnis) try { opt.beimErgebnis(r); } catch (e) {}
      const titel = r.pg ? T('erg.titel', 'Wahrscheinlich Pflegegrad {pg}', { pg: r.pg }) : T('erg.titel0', 'Wahrscheinlich kein Pflegegrad');
      box.append(h('div', { class: 'es-top pa-kopf' }, h('div', { class: 'pa-zeile' }, h('button', { type: 'button', class: 'linkbtn pa-zur', onclick: () => opt.abbrechen && opt.abbrechen(), text: T('zurueck', '← Zurück') })),
        h('span', { class: 'es-prog pa-wo', text: T('erg.wo', 'Ergebnis deiner Einschätzung') })),
        h('h2', { class: 'es-q pa-grad', id: 'pa-q', tabindex: '-1', text: titel }),
        h('p', { class: 'es-h pa-hinweis', text: T('erg.hinweis', 'Das ist eine Einschätzung. Entscheiden tut die Pflegekasse.') }));
      if (pgAktuell != null) {
        const pw = { jetzt: pgAktuell, pg: r.pg };
        const t = r.pg > pgAktuell ? T('erg.hoeher', 'Du hast jetzt Pflegegrad {jetzt}. Nach deiner Einschätzung käme Pflegegrad {pg} in Frage. Ein Antrag auf Höherstufung lohnt sich wahrscheinlich.', pw)
          : r.pg === pgAktuell ? T('erg.gleich', 'Das passt zu deinem jetzigen Pflegegrad {jetzt}. Eine Höherstufung lohnt sich nach dieser Einschätzung noch nicht.', pw)
            : T('erg.niedriger', 'Die Einschätzung liegt unter deinem jetzigen Pflegegrad {jetzt}. Stelle keinen Antrag auf Höherstufung ohne Beratung: Die Pflegekasse prüft dann neu und kann auch niedriger einstufen.', pw);
        box.append(h('p', { class: 'es-karte' + (r.pg > pgAktuell ? ' ja' : ''), text: t }));
      }
      box.append(bedeutung(r.pg));
      // Kacheln wie auf der Startseite (höchstens 3), übrige Aktionen als Textlinks
      const sichtbar = (opt.aktionen || []).filter((x) => !x.wenn || x.wenn(r, pgAktuell));
      const tu = (x) => () => x.fn(r, JSON.parse(JSON.stringify(a)), g);
      // Texte der Aktionen: mit „id“ gibt es eine einfache Fassung (ui „aktion.<id>.titel/text“, bei Pflegegrad 0 „text0“)
      const txt = (x, k) => { const std = typeof x[k] === 'function' ? x[k](r, pgAktuell) : x[k];
        return x.id && F.istEinfach() ? T('aktion.' + x.id + '.' + k + (k === 'text' && !r.pg && x.id === 'hilfen' ? '0' : ''), std, { pg: r.pg }) : std; };
      const kacheln = sichtbar.filter((x) => x.kachel).slice(0, 3), links = sichtbar.filter((x) => !x.kachel);
      if (kacheln.length) box.append(h('div', { class: 'pa-kacheln' }, kacheln.map((x) => h('button', { type: 'button', class: 'uk-karte pa-k-' + x.kachel, onclick: tu(x) },
        h('span', { class: 'sk-sym', 'aria-hidden': 'true' }, symbol(x.sym || [])), h('span', { class: 'sk-txt' }, h('b', { text: txt(x, 'titel') }), x.text ? h('span', { text: txt(x, 'text') }) : null)))));
      box.append(h('ul', { class: 'pa-links' }, links.map((x) => h('li', {}, h('button', { type: 'button', class: 'linkbtn', text: txt(x, 'titel') + ' ›', onclick: tu(x) }))),
        h('li', {}, h('button', { type: 'button', class: 'linkbtn pa-aendern', text: T('erg.aendern', 'Antworten ändern ›'), onclick: zurueck }))));
      // Zum Aufklappen: Punkte je Bereich
      const bar = h('div', { class: 'pa-bar', 'aria-hidden': 'true' }, h('div', { class: 'pa-fill', style: `width:${Math.min(100, r.gesamt)}%` }));
      P.GRAD_AB.forEach((x, i) => bar.append(h('div', { class: 'pa-mark', style: `left:${x}%` }, h('span', { text: `PG ${i + 1}` }))));
      const tb = h('tbody', {}, [1, 2, 3, 4, 5, 6].map((m) => { const mo = r.module[m], zaehlt = !(m === 2 || m === 3) || r.zaehlt23 === m;
        return h('tr', {}, h('td', { text: modulKurz(m) }), h('td', { class: 'z', text: zaehlt ? `${zahl(mo.gewichtet)} / ${zahl(P.ANLAGE2[m].gew[4])}` : T('erg.zaehltNicht', 'zählt nicht') })); }));
      let knapp = null;
      if (r.fehltBisNaechster != null && !r.besonders && r.hebel && r.hebel.moeglich && r.naechsterPg) {
        const kw = { pg: r.naechsterPg, f: zahl(r.fehltBisNaechster) };
        knapp = h('p', { text: r.grenzfall ? T('erg.knapp', 'Es ist knapp: Bis Pflegegrad {pg} fehlen {f} Punkte. Prüfe die Antworten, bei denen du unsicher warst.', kw) : T('erg.fehlt', 'Bis Pflegegrad {pg} fehlen {f} Punkte.', kw) });
      }
      box.append(h('details', { class: 'pa-info pa-punkte-box' }, h('summary', { text: T('erg.punkteTitel', 'Punkte je Bereich') }),
        h('p', { class: 'pa-punkte', text: T('erg.punkte', '{p} von 100 Punkten.', { p: zahl(r.gesamt) }) }), bar, knapp,
        h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': T('erg.punkteTitel', 'Punkte je Bereich') }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: T('erg.bereich', 'Bereich') }), h('th', { class: 'z', text: T('erg.punkteSp', 'Punkte') }))), tb)),
        h('p', { class: 'small', text: T('erg.grenzen', 'Ab 12,5 Punkten gibt es Pflegegrad 1, ab 27 Pflegegrad 2, ab 47,5 Pflegegrad 3, ab 70 Pflegegrad 4, ab 90 Pflegegrad 5. Von den Bereichen 2 und 3 zählt nur der höhere. Grundlage: § 15 SGB XI.') })));
      box.append(h('details', { class: 'pa-info' }, h('summary', { text: T('erg.tippTitel', 'Tipp für den Termin mit dem Gutachter') }),
        h('p', { text: T('erg.tipp', 'Führe eine Woche lang ein Pflegetagebuch: Was war nötig, wie oft, wie lange? Lege beim Termin Arztberichte und den Medikamentenplan bereit, und sei dabei, wenn möglich. Zeige keine besseren Seiten als im Alltag.') })));
    }
    // Was der Pflegegrad bedeutet: die wichtigsten Leistungen mit Beträgen. Beträge nur aus den Rechenregeln der App
    // (Rules.pflegeFuer; Quellen dort: §§ 36, 37, 40, 45b SGB XI, BMG-Ratgeber Pflege, Stand 14.9.2026, abgerufen 20.11.2026).
    function bedeutung(pg) {
      const R = typeof Rules !== 'undefined' ? Rules : null;
      const w = {};
      if (R && R.pflegeFuer) R.pflegeFuer(pg).forEach((l) => { w[l.id] = l.wert; });
      else { const geld = P.geld(pg, null); w.geld = geld.pflegegeld || null; w.entl = geld.entlastung || null; }
      const li = [];
      let vorweg = null;
      if (pg >= 2) {
        if (w.geld) li.push(T('bed.geld', 'Pflegegeld: {b} im Monat aufs Konto, wenn Angehörige pflegen', { b: eur(w.geld) }));
        if (w.dienst) li.push(T('bed.dienst', 'Oder ein Pflegedienst: bis {b} im Monat, die Pflegekasse bezahlt direkt', { b: eur(w.dienst) }));
        if (w.entl) li.push(T('bed.entl', 'Entlastungsbetrag: {b} im Monat für Hilfe im Alltag, kein Geld aufs Konto', { b: eur(w.entl) }));
      } else if (pg === 1) {
        vorweg = T('bed.vorweg1', 'Bei Pflegegrad 1 gibt es noch kein Pflegegeld, aber diese Hilfen der Pflegekasse:');
        if (w.entl) li.push(T('bed.entl', 'Entlastungsbetrag: {b} im Monat für Hilfe im Alltag, kein Geld aufs Konto', { b: eur(w.entl) }));
        if (w.hilfs) li.push(T('bed.hilfs', 'Pflegehilfsmittel wie Handschuhe: bis {b} im Monat', { b: eur(w.hilfs) }));
        if (w.umbau) li.push(T('bed.umbau', 'Umbau der Wohnung: bis {b} je Maßnahme', { b: eur(w.umbau) }));
      } else {
        li.push(T('bed.kein1', 'Ohne Pflegegrad gibt es kein Geld von der Pflegekasse.'));
        li.push(T('bed.kein2', 'Kostenlos sind Pflegeberatung und Pflegekurse für Angehörige.'));
      }
      const stand = R && R.RULES && R.RULES.pflegeUnterst ? R.RULES.pflegeUnterst.stand : null;
      return h('div', { class: 'es-karte pa-bedeutung' }, h('div', { class: 'es-lvl', text: pg ? T('bed.titel', 'Das bedeutet Pflegegrad {pg}', { pg }) : T('bed.titel0', 'Das bedeutet das') }),
        vorweg ? h('p', { text: vorweg }) : null, h('ul', { class: 'es-liste' }, li.map((x) => h('li', { text: x }))),
        stand ? h('p', { class: 'small muted', text: T('bed.stand', 'Stand der Beträge: {stand}.', { stand }) }) : null);
    }
    // Symbol der Kachel aus Pfaden (ohne innerHTML)
    function symbol(pfade) {
      const ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg');
      s.setAttribute('viewBox', '0 0 24 24');
      pfade.forEach((d) => { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); s.appendChild(p); });
      return s;
    }
    if (opt.ergebnis) a.pos = schritte(a).length - 1; // Gespeichertes Ergebnis direkt ansehen
    zeige(true);
    return { zeige };
  }
  return { start, schritte, eingabe, neu, m5Ids, migriere };
})();
if (typeof module !== 'undefined') module.exports = PflegeAssistent;
