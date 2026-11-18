// Geführte Selbsteinschätzung des Pflegegrads: eine Frage pro Bildschirm, wie die einfache Version der App.
// Rechnung: pflege.js (§ 15 SGB XI). Texte: pflege-fragen.js. Ausgabe nur über Elemente und textContent (kein innerHTML mit Eingaben).
// PflegeAssistent.start(container, { pgAktuell, antworten, speichern(a), aktionen: [{ text, haupt, fn(ergebnis, antworten) }], abbrechen() })
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

  function neu() { return { alterJahre: '', alterMonate: '', vor: {}, stufen: {}, m5: {}, inkontinenz: { harn: false, stuhl: false }, ink: null, sonde: null, k4K: false, pos: 0 }; }
  function monate(a) { const j = a.alterJahre === '' ? null : +a.alterJahre; if (j == null) return null; return j < 2 && a.alterMonate !== '' ? +a.alterMonate : Math.round(j * 12); }
  function istKind(a) { const m = monate(a); return m != null && m < 216; }
  function saeugling(a) { const m = monate(a); return m != null && m < 18; }

  // Ablauf aus den bisherigen Antworten: Alter, je Bereich die Vorfrage und bei „Ja“ die Fragen, am Ende das Ergebnis
  function schritte(a) {
    const s = [{ art: 'alter' }];
    for (const m of [1, 2, 3, 4, 5, 6]) {
      s.push({ art: 'vor', m });
      if (a.vor[m] !== true) continue;
      if (m === 4 && saeugling(a)) { s.push({ art: 'k4K', m }); continue; }
      if (m === 5) {
        for (const [id] of P.M5A.concat(P.M5B)) s.push({ art: 'm5', m, id });
        for (const [id] of P.M5C) if (id !== '5.K' || istKind(a)) s.push({ art: 'm5', m, id });
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
    const m5 = Object.assign({}, a.m5);
    if (a.stufen['5.16'] != null) m5['5.16'] = a.stufen['5.16'];
    const stufen = {};
    for (const [id, v] of Object.entries(a.stufen)) if (id !== '5.16' && a.vor[+id.split('.')[0]] === true) stufen[id] = v;
    return { stufen, m5: a.vor[5] === true ? m5 : {}, inkontinenz: a.vor[4] === true ? a.inkontinenz : { harn: false, stuhl: false }, k4K: a.vor[4] === true && a.k4K,
      alterJahre: a.alterJahre, alterMonate: a.alterMonate, pgBescheid: pgAktuell == null ? '' : pgAktuell };
  }

  function start(box, opt) {
    opt = opt || {};
    const a = Object.assign(neu(), opt.antworten || {});
    const pgAktuell = opt.pgAktuell == null || opt.pgAktuell === '' ? null : +opt.pgAktuell;
    const merken = () => { if (opt.speichern) try { opt.speichern(JSON.parse(JSON.stringify(a))); } catch (e) {} };
    const sprich = (text) => { try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) {} };
    function weiter() { a.pos++; merken(); zeige(true); }
    function zurueck() { if (a.pos > 0) { a.pos--; merken(); zeige(true); } else if (opt.abbrechen) opt.abbrechen(); }

    function kopf(s, liste) {
      const nr = s.m ? `Bereich ${s.m} von 6: ${P.MODUL[s.m].kurz}` : 'Vorab';
      const frac = Math.round(100 * a.pos / Math.max(1, liste.length - 1));
      return h('div', { class: 'es-top' }, h('span', { class: 'es-prog', text: nr }),
        h('div', { class: 'es-bar', 'aria-hidden': 'true' }, h('span', { style: `width:${frac}%` })));
    }
    function erklaerung(text) {
      if (!text) return null;
      const d = h('details', { class: 'pa-info' }, h('summary', { text: 'ⓘ Was zählt hier?' }), h('p', { text }));
      if (istKind(a)) d.append(h('p', { text: F.KIND }));
      return d;
    }
    function knoepfe(antworten, gewaehlt, wahl) {
      return h('div', { class: 'es-wahl', role: 'group', 'aria-labelledby': 'pa-q' }, antworten.map((x, i) =>
        h('button', { type: 'button', class: 'es-btn' + (gewaehlt === i ? ' an' : ''), 'aria-pressed': gewaehlt === i ? 'true' : 'false', onclick: () => wahl(i) },
          h('span', {}, h('span', { class: 'pa-a', text: x.text }), x.amt ? h('span', { class: 'pa-amt', text: x.amt }) : null))));
    }
    function nav(mitWeissNicht, weissNicht) {
      return h('div', { class: 'es-nav' },
        h('button', { type: 'button', class: 'btn ghost', onclick: zurueck, text: '← Zurück' }),
        mitWeissNicht ? h('button', { type: 'button', class: 'btn ghost', onclick: weissNicht || weiter, text: 'Weiß ich nicht' }) : null,
        h('button', { type: 'button', class: 'btn ghost', onclick: () => opt.abbrechen && opt.abbrechen(), text: 'Später weitermachen' }));
    }

    function zeige(fokus) {
      const liste = schritte(a);
      if (a.pos >= liste.length) a.pos = liste.length - 1;
      const s = liste[a.pos];
      box.replaceChildren();
      if (s.art === 'ergebnis') { zeigeErgebnis(); if (fokus) fokusiere(); return; }
      let frage = '', hilfe = '', inhalt;
      if (s.art === 'alter') {
        frage = 'Wie alt ist die Person, die gepflegt wird?';
        hilfe = 'Das Alter ist wichtig: Bei Kindern vergleicht der Gutachter mit gesunden Kindern im gleichen Alter, und bis 18 Monate gelten Sonderregeln.';
        const inp = h('input', { id: 'pa-jahre', type: 'number', min: '0', max: '120', inputmode: 'numeric', value: a.alterJahre, 'aria-labelledby': 'pa-q' });
        const mon = h('input', { id: 'pa-monate', type: 'number', min: '0', max: '23', inputmode: 'numeric', value: a.alterMonate });
        const monBox = h('div', { class: 'field', hidden: !(a.alterJahre !== '' && +a.alterJahre < 2) }, h('label', { for: 'pa-monate', text: 'Alter in Monaten' }), mon);
        const warn = h('p', { class: 'warn', hidden: true });
        inp.addEventListener('input', () => { monBox.hidden = !(inp.value !== '' && +inp.value < 2); });
        inhalt = h('div', {}, h('div', { class: 'es-zahl' }, inp, h('span', { text: 'Jahre' })), monBox, warn,
          h('div', { class: 'es-nav1' }, h('button', { type: 'button', class: 'es-btn es-weiter', text: 'Weiter ➜', onclick: () => {
            const j = inp.value.trim();
            if (j === '' || !(+j >= 0 && +j <= 120)) { warn.hidden = false; warn.textContent = 'Bitte das Alter in Jahren eintragen.'; inp.focus(); return; }
            a.alterJahre = String(Math.floor(+j)); a.alterMonate = +j < 2 ? mon.value : '';
            weiter();
          } })),
          h('details', { class: 'pa-info' }, h('summary', { text: 'ⓘ So funktioniert die Einschätzung' }), h('ul', {}, F.GRUNDSATZ.map((x) => h('li', { text: x })))));
      } else if (s.art === 'vor') {
        frage = F.VORFRAGE[s.m].frage; hilfe = F.VORFRAGE[s.m].hinweis;
        inhalt = knoepfe([{ text: 'Ja' }, { text: 'Nein' }], a.vor[s.m] === true ? 0 : a.vor[s.m] === false ? 1 : null, (i) => { a.vor[s.m] = i === 0; weiter(); });
      } else if (s.art === 'k4K') {
        frage = 'Gibt es beim Füttern so große Probleme, dass die Pflege außergewöhnlich aufwendig ist?';
        hilfe = 'Nur bei Kindern bis 18 Monate: Gemeint sind zum Beispiel Schluckstörungen, sehr lange Mahlzeiten oder Ernährung über eine Sonde.';
        inhalt = knoepfe([{ text: 'Ja' }, { text: 'Nein' }], a.k4K === true ? 0 : null, (i) => { a.k4K = i === 0; weiter(); });
      } else if (s.art === 'ink') {
        frage = 'Ist die Person inkontinent, oder hat sie einen Katheter oder ein Stoma?';
        hilfe = 'Gemeint ist überwiegend oder ganz inkontinent, also mehr als ab und zu ein paar Tropfen.';
        const opts = [{ text: 'Nein' }, { text: 'Ja, Urin (oder Katheter, Urostoma)' }, { text: 'Ja, Stuhl (oder künstlicher Darmausgang)' }, { text: 'Ja, beides' }];
        const cur = a.ink;
        inhalt = knoepfe(opts, cur, (i) => { a.ink = i; a.inkontinenz = { harn: i === 1 || i === 3, stuhl: i === 2 || i === 3 }; weiter(); });
      } else if (s.art === 'krit') {
        const k = P.kriterium(s.id), sk = P.SKALA[s.skala];
        frage = F.frage(s.id); hilfe = k ? k.leicht : '';
        const antworten = sk.kurz.map((t, i) => ({ text: t.charAt(0).toUpperCase() + t.slice(1), amt: 'Im Gutachten: ' + sk.stufen[i] }));
        inhalt = h('div', {}, knoepfe(antworten, a.stufen[s.id] == null ? null : a.stufen[s.id], (i) => { a.stufen[s.id] = i; weiter(); }), erklaerung(F.hinweis(s.id)));
      } else if (s.art === 'm5') {
        frage = F.frage(s.id); hilfe = F.M5_HINWEIS;
        const antw = F.m5Antworten(s.id);
        inhalt = h('div', {}, knoepfe(antw, a.m5Wahl && a.m5Wahl[s.id] != null ? a.m5Wahl[s.id] : null, (i) => {
          a.m5Wahl = a.m5Wahl || {}; a.m5Wahl[s.id] = i; a.m5[s.id] = F.m5Wert(s.id, i); weiter();
        }), erklaerung(F.hinweis(s.id) !== F.M5_HINWEIS ? F.hinweis(s.id) : null));
      }
      box.append(kopf(s, liste), h('h2', { class: 'es-q', id: 'pa-q', tabindex: '-1', text: frage }), hilfe ? h('p', { class: 'es-h', text: hilfe }) : null,
        window.speechSynthesis ? h('button', { type: 'button', class: 'es-vor', text: '🔊 Vorlesen', onclick: () => sprich(frage + ' ' + hilfe) }) : null,
        inhalt, nav(s.art === 'krit' || s.art === 'm5', () => { if (s.art === 'krit') delete a.stufen[s.id]; weiter(); }));
      if (fokus) fokusiere();
    }
    function fokusiere() { const q = box.querySelector('#pa-q'); if (q) { q.focus({ preventScroll: true }); try { box.scrollIntoView({ block: 'start' }); } catch (e) {} } }

    function zeigeErgebnis() {
      const g = eingabe(a, pgAktuell), r = P.rechne(g);
      const geld = P.geld(r.pg, typeof Rules !== 'undefined' ? Rules : null);
      const bar = h('div', { class: 'pa-bar', 'aria-hidden': 'true' }, h('div', { class: 'pa-fill', style: `width:${Math.min(100, r.gesamt)}%` }));
      P.GRAD_AB.forEach((x, i) => bar.append(h('div', { class: 'pa-mark', style: `left:${x}%` }, h('span', { text: `PG ${i + 1}` }))));
      const titel = r.pg ? `Wahrscheinlich Pflegegrad ${r.pg}` : 'Wahrscheinlich kein Pflegegrad';
      box.append(h('div', { class: 'es-top' }, h('span', { class: 'es-prog', text: 'Ergebnis deiner Einschätzung' })),
        h('h2', { class: 'es-q', id: 'pa-q', tabindex: '-1', text: titel }),
        h('p', { class: 'es-h', text: `${zahl(r.gesamt)} von 100 Punkten. Ab 12,5 Punkten gibt es Pflegegrad 1, ab 27 Pflegegrad 2, ab 47,5 Pflegegrad 3, ab 70 Pflegegrad 4, ab 90 Pflegegrad 5.` }), bar);
      if (r.pg >= 1) box.append(h('div', { class: 'es-karte' }, h('div', { class: 'es-lvl', text: 'Das könnte es geben' }),
        h('ul', { class: 'es-liste' }, r.pg >= 2 ? h('li', { text: `Pflegegeld ${eur(geld.pflegegeld)} im Monat aufs Konto, wenn Angehörige pflegen` }) : null,
          h('li', { text: `Entlastungsbetrag ${eur(geld.entlastung)} im Monat: kein Geld aufs Konto, sondern ein Budget bei der Pflegekasse für anerkannte Hilfen im Alltag` }),
          r.pg >= 2 ? h('li', { text: 'Dazu Budgets für Pflegedienst, Vertretung der Pflegeperson und Pflegehilfsmittel' }) : null)));
      if (pgAktuell != null) {
        const t = r.pg > pgAktuell ? `Du hast jetzt Pflegegrad ${pgAktuell}. Nach deiner Einschätzung käme Pflegegrad ${r.pg} in Frage. Ein Antrag auf Höherstufung lohnt sich wahrscheinlich.`
          : r.pg === pgAktuell ? `Das passt zu deinem jetzigen Pflegegrad ${pgAktuell}. Eine Höherstufung lohnt sich nach dieser Einschätzung noch nicht.`
            : `Die Einschätzung liegt unter deinem jetzigen Pflegegrad ${pgAktuell}. Stelle keinen Antrag auf Höherstufung ohne Beratung: Die Pflegekasse prüft dann neu und kann auch niedriger einstufen.`;
        box.append(h('p', { class: 'es-karte', text: t }));
      }
      if (r.fehltBisNaechster != null && !r.besonders && r.hebel && r.hebel.moeglich && r.naechsterPg) {
        box.append(h('p', { text: r.grenzfall ? `Es ist knapp: Bis Pflegegrad ${r.naechsterPg} fehlen ${zahl(r.fehltBisNaechster)} Punkte. Prüfe die Antworten, bei denen du unsicher warst.` : `Bis Pflegegrad ${r.naechsterPg} fehlen ${zahl(r.fehltBisNaechster)} Punkte.` }));
      }
      const tb = h('tbody', {}, [1, 2, 3, 4, 5, 6].map((m) => { const mo = r.module[m], zaehlt = !(m === 2 || m === 3) || r.zaehlt23 === m;
        return h('tr', {}, h('td', { text: P.MODUL[m].kurz }), h('td', { class: 'z', text: zaehlt ? `${zahl(mo.gewichtet)} / ${zahl(P.ANLAGE2[m].gew[4])}` : 'zählt nicht' })); }));
      box.append(h('details', { class: 'pa-info' }, h('summary', { text: 'Punkte je Bereich' }),
        h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': 'Punkte je Bereich' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Bereich' }), h('th', { class: 'z', text: 'Punkte' }))), tb)),
        h('p', { class: 'small', text: 'Von den Bereichen 2 und 3 zählt nur der höhere.' })));
      box.append(h('div', { class: 'es-karte' }, h('div', { class: 'es-lvl', text: 'Tipp vor dem Termin mit dem Gutachter' }),
        h('p', { text: 'Führe eine Woche lang ein Pflegetagebuch: Was war nötig, wie oft, wie lange? Lege beim Termin Arztberichte und den Medikamentenplan bereit, und sei dabei, wenn möglich. Zeige keine besseren Seiten als im Alltag.' })));
      box.append(h('p', { class: 'small muted', text: 'Das ist eine Einschätzung nach den Regeln der Pflegeversicherung (§ 15 SGB XI). Den Pflegegrad legt die Pflegekasse nach der Begutachtung fest.' }));
      const ak = h('div', { class: 'es-nav' });
      for (const x of (opt.aktionen || [])) {
        if (x.wenn && !x.wenn(r, pgAktuell)) continue;
        ak.append(h('button', { type: 'button', class: 'btn' + (x.haupt ? '' : ' ghost'), text: x.text, onclick: () => x.fn(r, JSON.parse(JSON.stringify(a)), g) }));
      }
      ak.append(h('button', { type: 'button', class: 'btn ghost', text: '← Antworten ändern', onclick: zurueck }));
      box.append(ak);
    }
    zeige(true);
    return { zeige };
  }
  return { start, schritte, eingabe, neu };
})();
if (typeof module !== 'undefined') module.exports = PflegeAssistent;
