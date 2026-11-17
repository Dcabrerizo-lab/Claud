// Oberfläche der Vorschau (erweiterungen/vorschau.html). Nicht Teil der App 1.2.0.
// Alle Ausgaben über textContent bzw. Elemente – nie innerHTML mit Eingaben (Schutz vor eingeschleustem Code).
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
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
  async function kopiere(textarea, msg) {
    try { await navigator.clipboard.writeText(textarea.value); msg.textContent = 'Kopiert.'; } catch (e) { textarea.hidden = false; textarea.removeAttribute('readonly'); textarea.select(); msg.textContent = 'Text ist markiert. Bitte mit Strg+C bzw. „Kopieren“ übernehmen.'; textarea.setAttribute('readonly', ''); }
  }

  // ---------------- Reiter ----------------
  const tabs = [...document.querySelectorAll('[role="tab"]')];
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
    for (const m of [1, 2, 3, 4, 5, 6]) {
      const fs = h('fieldset', {}, h('legend', { text: `Bereich ${m}: ${P.MODUL[m].kurz}` }), h('p', { class: 'small muted', text: `Im Gutachten: „${P.MODUL[m].name}“. ${P.MODUL[m].leicht}. Gewichtung ${P.MODUL[m].gewicht}.` }));
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
      box.append(fs);
    }
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
    $('pf-zeile-5K').hidden = !r.kind;
    box.replaceChildren();
    box.append(h('h2', { text: 'Ergebnis: das sagt das Gutachten' }),
      h('p', {}, h('span', { class: 'big', text: r.pg ? `Pflegegrad ${r.pg}` : 'Kein Pflegegrad' }), h('span', { class: 'muted', text: ` · ${zahl(r.gesamt)} von 100 Punkten` })),
      leiste(r.gesamt));
    for (const satz of P.zusammenfassung(g, r, Rules)) box.append(h('p', { text: satz }));
    // Bereiche als kleine Tabelle
    const tb = h('tbody', {}, [1, 2, 3, 4, 5, 6].map((m) => { const mo = r.module[m], zaehlt = !(m === 2 || m === 3) || r.zaehlt23 === m; return h('tr', {}, h('td', { text: P.MODUL[m].kurz }), h('td', { text: mo.bereichName }), h('td', { class: 'z', text: zaehlt ? `${zahl(mo.gewichtet)} / ${zahl(P.ANLAGE2[m].gew[4])}` : 'zählt nicht' })); }));
    box.append(h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': 'Punkte je Bereich' }, h('table', { class: 'modtab' }, h('thead', {}, h('tr', {}, h('th', { text: 'Bereich' }), h('th', { text: 'Einstufung' }), h('th', { class: 'z', text: 'Punkte' }))), tb)));
    if (r.fehltBisNaechster != null && !r.besonders && r.hebel.moeglich) {
      const jetzt = P.geld(r.pg, Rules), naechst = P.geld(r.naechsterPg, Rules);
      box.append(h('h3', { text: `Was für Pflegegrad ${r.naechsterPg} fehlt` }));
      if (naechst.pflegegeld > jetzt.pflegegeld) box.append(h('p', { text: `Pflegegrad ${r.naechsterPg} brächte ${eur(naechst.pflegegeld - jetzt.pflegegeld)} mehr Pflegegeld im Monat.` }));
      box.append(h('p', { text: r.grenzfall ? 'Es ist knapp. Schon diese Änderungen würden reichen, wenn sie im Alltag wirklich so sind:' : 'Dafür müsste sich einiges ändern, zum Beispiel:' }));
      r.hebel.optionen.slice(0, 3).forEach((o, i) => {
        const btn = o.wege.every((w) => !w.id.startsWith('M5')) ? h('button', { type: 'button', class: 'btn', onclick: () => { o.wege.forEach((w) => fuegeWiderspruchHinzu(w.id, w.nach)); $('pf-wid').scrollIntoView({ block: 'start' }); } }, 'Für den Widerspruch übernehmen') : null;
        box.append(h('div', { class: 'opt' }, h('strong', { text: `Möglichkeit ${i + 1}: ${o.schritte === 1 ? 'eine Bewertung' : o.schritte + ' Bewertungen'} anders` }), h('ul', {}, o.wege.map((w) => h('li', { text: weg(w) }))), btn));
      });
      box.append(h('p', { class: 'small muted', text: 'Nur übernehmen, was im Alltag wirklich so ist. Ob eine Bewertung stimmt, wissen nur du und die gepflegte Person.' }));
    }
    box.append(h('details', {}, h('summary', { text: 'So rechnet die Pflegekasse' }), h('ul', {}, P.SO_GEHTS.map((t) => h('li', { text: t })))));
    zeigeErklaerung(g, r);
  }
  // Das Gutachten einfach erklärt: jede eingetragene Bewertung mit ihrer Bedeutung im Alltag
  function zeigeErklaerung(g, r) {
    const box = $('pf-erkl'); box.replaceChildren();
    box.append(h('h2', { text: 'Das Gutachten einfach erklärt' }), h('p', { class: 'small muted', text: 'Hier steht jede Bewertung aus dem Gutachten mit dem, was sie im Alltag bedeutet. Stimmt etwas nicht mit dem Alltag überein, ist das ein Grund für einen Widerspruch.' }));
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
      box.append(sek);
    }
    box.hidden = leer;
  }
  // Widerspruch Pflege: Liste der Kriterien
  function fuegeWiderspruchHinzu(id, soll) {
    const liste = $('pf-wid-liste');
    if (id && liste.querySelector(`[data-id="${id}"]`)) return;
    const n = liste.children.length + 1;
    const wahl = h('select', { id: `pw-k-${n}`, 'aria-label': `Kriterium ${n}` }, P.KRITERIEN.filter((k) => k.s !== 'sonde').map((k) => h('option', { value: k.id, text: `${k.id} ${k.leicht}`, selected: k.id === id })));
    const sollSel = h('select', { id: `pw-s-${n}` });
    const fuellen = () => { const k = P.kriterium(wahl.value); sollSel.replaceChildren(...P.SKALA[k.s].stufen.map((s, i) => h('option', { value: i, text: `${s} (${P.SKALA[k.s].kurz[i]})`, selected: soll != null && i === soll }))); };
    wahl.addEventListener('change', () => { soll = null; fuellen(); });
    fuellen();
    const alltag = h('textarea', { id: `pw-a-${n}`, rows: '3', placeholder: 'Wie ist es im Alltag wirklich? z. B. „Sie kann nicht allein in die Dusche steigen und braucht jedes Mal Hilfe beim Abtrocknen.“' });
    const zeile = h('div', { class: 'opt', 'data-id': id || '' },
      h('div', { class: 'grid2' }, h('div', {}, h('label', { for: `pw-k-${n}`, text: 'Kriterium' }), wahl), h('div', {}, h('label', { for: `pw-s-${n}`, text: 'Tatsächlich' }), sollSel)),
      h('label', { for: `pw-a-${n}`, text: 'Beschreibung aus dem Alltag' }), alltag,
      h('div', { class: 'btns' }, h('button', { type: 'button', class: 'btn', onclick: () => zeile.remove() }, 'Entfernen')));
    wahl.addEventListener('change', () => { zeile.dataset.id = wahl.value; });
    zeile.dataset.id = wahl.value;
    liste.append(zeile);
  }
  const pfArt = () => ($('pf-art-h').checked ? 'hoeher' : 'widerspruch');
  function zeigePfArt() {
    const hoch = pfArt() === 'hoeher';
    $('pf-art-text').textContent = hoch ? 'Wähle die Bewertungen, bei denen es seit der letzten Begutachtung schlimmer geworden ist, und beschreibe, was sich verändert hat und seit wann.' : 'Wähle die Bewertungen, die im Gutachten zu niedrig sind, und beschreibe in eigenen Worten, wie es im Alltag wirklich ist. Nur was stimmt, gehört hinein.';
    $('pf-datum-label').textContent = hoch ? 'Datum der letzten Begutachtung' : 'Datum des Bescheids';
  }
  function machePflegeWiderspruch() {
    const g = lesePflege(), r = P.rechne(g), hoch = pfArt() === 'hoeher';
    const auswahl = [...$('pf-wid-liste').children].map((z) => { const sel = z.querySelectorAll('select'); const id = sel[0].value; return { id, stufeIst: +(g.stufen[id] || 0), stufeSoll: +sel[1].value, alltag: z.querySelector('textarea').value }; }).filter((x) => x.stufeSoll > x.stufeIst);
    const neu = Object.assign({}, g, { stufen: Object.assign({}, g.stufen) }); auswahl.forEach((x) => { neu.stufen[x.id] = x.stufeSoll; });
    const ziel = P.rechne(neu).pg, ist = r.bescheid ? r.bescheid.pg : r.pg;
    const absender = { name: $('pf-name').value.trim(), strasse: $('pf-anschrift').value.trim(), ort: $('pf-ort').value.trim() }, stelle = { name: $('pf-kasse').value.trim() };
    const t = hoch
      ? Widerspruch.hoeherstufung({ absender, stelle, zeichen: $('pf-vnr').value.trim(), heute: heute(), pgJetzt: ist, seit: $('pf-datum').value, punkte: Widerspruch.punkteHoeher(auswahl, P), arzt: true })
      : Widerspruch.text({ art: 'pflege', absender, stelle, bescheidDatum: $('pf-datum').value, zeichen: $('pf-vnr').value.trim(), heute: heute(), pflege: { pgBescheid: ist, pgZiel: ziel > ist ? ziel : null }, punkte: Widerspruch.punktePflege(auswahl, P), akteneinsicht: true });
    $('pf-wid-text').value = t; $('pf-wid-text').hidden = false; $('pf-wid-copy').hidden = false;
    let info = hoch ? 'Keine Frist. Mehr Geld gibt es ab dem Monat, in dem der Antrag bei der Pflegekasse eingeht. Deshalb bald abschicken.' : $('pf-datum').value ? fristText($('pf-datum').value) : 'Tipp: Datum des Bescheids eintragen, dann zeigt SoLo die Frist.';
    if (auswahl.length && ziel > ist) info = `Mit diesen Änderungen ergäbe sich Pflegegrad ${ziel}. ` + info;
    if (!auswahl.length) info = 'Noch keine Bewertung mit höherer Stufe gewählt. ' + info;
    $('pf-frist').textContent = info;
  }
  function fristText(datum) { const f = Fristen.widerspruch({ datum }); return `Frist: Der Widerspruch muss spätestens am ${de(f.fristende)} bei der Stelle sein (frühester möglicher Tag).`; }

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
  function personZeile(rolle, werte) {
    pz++; const n = pz; werte = werte || {};
    const tr = h('tr', { 'data-rolle': rolle },
      h('td', { text: rolle === 'erw' ? 'Erwachsen' : 'Kind' }),
      h('td', {}, h('input', { type: 'number', min: '0', max: '99', id: `bp-alter-${n}`, 'aria-label': `Person ${n}: Alter`, value: werte.alter != null ? werte.alter : '' })),
      ...['brutto', 'netto', 'sonstiges'].map((f) => h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `bp-${f}-${n}`, 'aria-label': `Person ${n}: ${f === 'sonstiges' ? 'anderes Einkommen (z. B. Unterhalt, Rente)' : 'Lohn ' + f}`, value: werte[f] || '' }))),
      h('td', {}, h('label', { class: 'check' }, h('input', { type: 'checkbox', id: `bp-schw-${n}`, 'aria-label': `Person ${n}: schwanger ab der 13. Woche`, checked: !!werte.schwanger }))),
      h('td', {}, h('button', { type: 'button', class: 'btn', 'aria-label': `Person ${n} entfernen`, onclick: () => { tr.remove(); zeigeBescheid(); } }, '×')));
    $('bs-personen').append(tr);
  }
  const wert = (id) => { const v = $(id).value; return v === '' ? null : +v; };
  function leseBescheid() {
    const personen = [...$('bs-personen').children].map((tr) => { const i = tr.querySelectorAll('input'); return { rolle: tr.dataset.rolle, alter: i[0].value === '' ? (tr.dataset.rolle === 'erw' ? 30 : 0) : +i[0].value, brutto: +i[1].value || 0, netto: +i[2].value || 0, sonstiges: +i[3].value || 0, schwanger: i[4].checked }; });
    return { personen, warmwasserDezentral: $('bs-ww').checked, miete: { tatsaechlich: wert('bs-miete'), heizung: wert('bs-heiz') },
      bescheid: { regel: wert('bs-b-regel'), mehrAE: wert('bs-b-ae'), mehrSchwanger: wert('bs-b-schw'), mehrWW: wert('bs-b-ww'), kdu: wert('bs-b-kdu'), einkommen: wert('bs-b-eink'), kindergeld: wert('bs-b-kg'), zahlbetrag: wert('bs-b-zahl') } };
  }
  const WIRK = { passt: 'passt', zuWenig: 'zu deinen Lasten', zuViel: 'zu deinen Gunsten', pruefen: 'bitte prüfen', fehlt: 'nicht eingetragen' };
  function zeigeBescheid() {
    const box = $('bs-erg'); box.replaceChildren();
    const e = leseBescheid();
    if (!e.personen.length) { box.append(h('p', { text: 'Bitte zuerst die Personen eintragen.' })); return; }
    const r = BescheidSGB2.pruefe(e, Rules);
    box.append(h('h2', { text: 'Ergebnis' }));
    r.hinweise.forEach((t) => box.append(h('p', { class: 'note', text: t })));
    box.append(h('p', {}, r.zuWenigImMonat > 0 ? h('span', { class: 'big', text: `Vermutlich ${eur(r.zuWenigImMonat)} im Monat zu wenig` }) : h('span', { class: 'big', text: 'Keine sichere Abweichung zu deinen Lasten gefunden' })));
    const tb = h('tbody', {}, r.posten.map((p) => h('tr', {}, h('td', {}, p.name, h('span', { class: 'amt small muted', text: ' ' + p.recht })), h('td', { class: 'z', text: eur(p.erwartet) }), h('td', { class: 'z', text: p.bescheid == null ? '–' : eur(p.bescheid) }), h('td', {}, h('span', { class: 'pill ' + p.wirkung, text: WIRK[p.wirkung] })))));
    box.append(h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': 'Vergleich der Posten' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Posten' }), h('th', { class: 'z', text: 'nach SoLo' }), h('th', { class: 'z', text: 'im Bescheid' }), h('th', { text: 'Bewertung' }))), tb)));
    if (r.zahlbetrag) box.append(h('p', { class: 'small', text: `Zahlbetrag nach SoLo ${eur(r.zahlbetrag.erwartet)}, im Bescheid ${eur(r.zahlbetrag.bescheid)}.` }));
    r.gruende.forEach((g) => box.append(h('p', { class: 'small' }, h('strong', { text: g.name + ': ' }), g.grund)));
    box.append(h('p', { class: 'small muted', text: r.grenzen }));
  }
  function macheBescheidWiderspruch() {
    const r = BescheidSGB2.pruefe(leseBescheid(), Rules);
    const t = Widerspruch.text({ art: 'sgb2', absender: { name: $('bs-name').value.trim(), strasse: $('bs-anschrift').value.trim(), ort: $('bs-ort').value.trim() }, stelle: { name: $('bs-jc').value.trim() }, bescheidDatum: $('bs-datum').value, zeichen: $('bs-bg').value.trim(), heute: heute(), punkte: Widerspruch.punkteSGB2(r), akteneinsicht: r.gruende.some((g) => g.key === 'kdu') });
    $('bs-wid-text').value = t; $('bs-wid-text').hidden = false; $('bs-wid-copy').hidden = false;
    $('bs-frist').textContent = (r.gruende.length ? '' : 'Es wurde kein Grund gefunden; der Widerspruch hat noch keine Begründung. ') + ($('bs-datum').value ? fristText($('bs-datum').value) : 'Tipp: Datum des Bescheids eintragen, dann zeigt SoLo die Frist.');
  }

  // ---------------- Bescheid Wohngeld ----------------
  let wz = 0;
  const ARTEN = [['lohn', 'Lohn'], ['rente', 'Rente'], ['alg', 'Arbeitslosengeld I'], ['eg', 'Elterngeld'], ['ohne', 'nur Unterhalt / kein Einkommen']];
  function wgZeile(w) {
    wz++; const n = wz; w = w || {};
    const art = h('select', { id: `wm-art-${n}`, 'aria-label': `Einkommen ${n}: Art` }, ARTEN.map(([v, t]) => h('option', { value: v, text: t, selected: v === (w.art || 'lohn') })));
    const abz = h('select', { id: `wm-abz-${n}`, 'aria-label': `Einkommen ${n}: Pauschalabzug` }, [0, 10, 20, 30].map((p) => h('option', { value: p, text: p + ' %', selected: p === (w.abzug != null ? w.abzug : 30) })));
    const tr = h('tr', {}, h('td', {}, art),
      h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `wm-b-${n}`, 'aria-label': `Einkommen ${n}: brutto im Monat`, value: w.brutto || '' })),
      h('td', {}, abz),
      h('td', {}, h('input', { type: 'number', min: '0', step: '0.01', inputmode: 'decimal', id: `wm-u-${n}`, 'aria-label': `Einkommen ${n}: Unterhalt im Monat`, value: w.unterhalt || '' })),
      h('td', {}, h('button', { type: 'button', class: 'btn', 'aria-label': `Einkommen ${n} entfernen`, onclick: () => { tr.remove(); zeigeWG(); } }, '×')));
    $('wg-mitglieder').append(tr);
  }
  function leseWG() {
    const mitglieder = [...$('wg-mitglieder').children].map((tr) => { const s = tr.querySelectorAll('select'), i = tr.querySelectorAll('input'); return { art: s[0].value, abzug: +s[1].value, brutto: +i[0].value || 0, unterhalt: +i[1].value || 0 }; });
    return { personen: +$('wg-n').value || 1, stufe: +$('wg-stufe').value, bruttokalt: +$('wg-kalt').value || 0, schwerbehindert: +$('wg-sb').value || 0, alleinerziehend: $('wg-ae').checked, mitglieder,
      bescheid: { miete: wert('wg-b-miete'), einkommen: wert('wg-b-eink'), wohngeld: wert('wg-b-wg') } };
  }
  function zeigeWG() {
    const box = $('wg-erg'); box.replaceChildren();
    const r = BescheidWG.pruefe(leseWG(), Rules);
    box.append(h('h2', { text: 'Ergebnis' }),
      h('p', {}, h('span', { class: 'big', text: r.posten.length ? (r.zuWenigImMonat > 0 ? `Vermutlich ${eur(r.zuWenigImMonat)} Wohngeld im Monat zu wenig` : r.gruende.length ? 'Abweichung gefunden, bitte prüfen' : 'Keine Abweichung zu deinen Lasten gefunden') : `Nach SoLo: ${eur(r.rechnung.wohngeld)} Wohngeld im Monat` })),
      h('p', { class: 'small', text: `Nach SoLo: Miete ${eur(r.rechnung.miete)} (Höchstbetrag ${eur(r.rechnung.hoechstbetrag)} plus Heizkostenkomponente ${eur(r.rechnung.heizkomponente)}), Einkommen ${eur(r.rechnung.einkommen)}, Wohngeld ${eur(r.rechnung.wohngeld)}.` }));
    if (r.posten.length) {
      const tb = h('tbody', {}, r.posten.map((p) => h('tr', {}, h('td', {}, p.name), h('td', { class: 'z', text: eur(p.erwartet) }), h('td', { class: 'z', text: eur(p.bescheid) }), h('td', {}, h('span', { class: 'pill ' + p.wirkung, text: WIRK[p.wirkung] })))));
      box.append(h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': 'Vergleich Wohngeld' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Posten' }), h('th', { class: 'z', text: 'nach SoLo' }), h('th', { class: 'z', text: 'im Bescheid' }), h('th', { text: 'Bewertung' }))), tb)));
    }
    r.gruende.forEach((g) => box.append(h('p', { class: 'small' }, h('strong', { text: g.name + ': ' }), g.grund)));
    box.append(h('p', { class: 'small muted', text: r.grenzen }));
  }
  function macheWGWiderspruch() {
    const r = BescheidWG.pruefe(leseWG(), Rules);
    const t = Widerspruch.text({ art: 'wohngeld', absender: { name: $('wg-name').value.trim(), strasse: $('wg-anschrift').value.trim(), ort: $('wg-ort').value.trim() }, stelle: { name: $('wg-stelle').value.trim() }, bescheidDatum: $('wg-datum').value, zeichen: $('wg-az').value.trim(), heute: heute(), punkte: Widerspruch.punkteSGB2(r) });
    $('wg-wid-text').value = t; $('wg-wid-text').hidden = false; $('wg-wid-copy').hidden = false;
    $('wg-frist').textContent = (r.gruende.length ? '' : 'Es wurde kein Grund gefunden; der Widerspruch hat noch keine Begründung. ') + ($('wg-datum').value ? fristText($('wg-datum').value) : 'Tipp: Datum des Bescheids eintragen, dann zeigt SoLo die Frist.');
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
  function zeigeKiZ() {
    for (const el of document.querySelectorAll('.kz-zwei')) el.hidden = $('kz-zahl').value !== '2';
    const box = $('kz-erg'); box.replaceChildren();
    const e = leseKiZ();
    if (!e.kinder.length) { box.append(h('p', { text: 'Bitte zuerst die Kinder eintragen.' })); return; }
    const r = BescheidKiZ.pruefe(e, Rules), q = r.rechnung;
    box.append(h('h2', { text: 'Ergebnis' }),
      h('p', {}, h('span', { class: 'big', text: r.posten.length ? (r.zuWenigImMonat > 0 ? `Vermutlich ${eur(r.zuWenigImMonat)} Kinderzuschlag im Monat zu wenig` : r.gruende.length ? 'Abweichung gefunden, bitte prüfen' : 'Keine Abweichung zu deinen Lasten gefunden') : `Nach SoLo: ${eur(q.kiz)} Kinderzuschlag im Monat` })),
      h('p', { class: 'small', text: `Nach SoLo: Bedarf der Eltern ${eur(q.bedarf)}, anzurechnendes Einkommen der Eltern ${eur(q.einkEltern)}, Kinderzuschlag ${eur(q.kiz)} (höchstens ${eur(q.max)} je Kind).` }));
    r.hinweise.forEach((t) => box.append(h('p', { class: 'note', text: t })));
    if (r.posten.length) {
      const tb = h('tbody', {}, r.posten.map((p) => h('tr', {}, h('td', {}, p.name), h('td', { class: 'z', text: eur(p.erwartet) }), h('td', { class: 'z', text: eur(p.bescheid) }), h('td', {}, h('span', { class: 'pill ' + p.wirkung, text: WIRK[p.wirkung] })))));
      box.append(h('div', { class: 'tablewrap', tabindex: '0', role: 'region', 'aria-label': 'Vergleich Kinderzuschlag' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Posten' }), h('th', { class: 'z', text: 'nach SoLo' }), h('th', { class: 'z', text: 'im Bescheid' }), h('th', { text: 'Bewertung' }))), tb)));
    }
    r.gruende.forEach((g) => box.append(h('p', { class: 'small' }, h('strong', { text: g.name + ': ' }), g.grund)));
    box.append(h('p', { class: 'small muted', text: r.grenzen }));
  }
  function macheKiZWiderspruch() {
    const r = BescheidKiZ.pruefe(leseKiZ(), Rules);
    const t = Widerspruch.text({ art: 'kiz', absender: { name: $('kz-name').value.trim(), strasse: $('kz-anschrift').value.trim(), ort: $('kz-ort').value.trim() }, stelle: { name: 'Familienkasse der Bundesagentur für Arbeit' }, bescheidDatum: $('kz-datum').value, zeichen: $('kz-kgnr').value.trim(), heute: heute(), punkte: Widerspruch.punkteSGB2(r) });
    $('kz-wid-text').value = t; $('kz-wid-text').hidden = false; $('kz-wid-copy').hidden = false;
    $('kz-frist').textContent = (r.gruende.length ? '' : 'Es wurde kein Grund gefunden; der Widerspruch hat noch keine Begründung. ') + ($('kz-datum').value ? fristText($('kz-datum').value) : 'Tipp: Datum des Bescheids eintragen, dann zeigt SoLo die Frist.');
  }

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
    setzePflege(im);
    $('pf-msg').textContent = `${im.gefunden.length} von ${P.KRITERIEN.length} Bewertungen erkannt${im.pgBescheid ? `, Pflegegrad ${im.pgBescheid} im Text gefunden` : ''}. Bitte jede Zahl mit dem Gutachten vergleichen und korrigieren.`;
    zeigePflege();
  });
  $('pf-beispiel').addEventListener('click', () => { $('pf-alter').value = 82; $('pf-text').value = BEISPIEL_GUTACHTEN; $('pf-lesen').click(); });
  $('pf-leeren').addEventListener('click', () => { $('pf-form').reset(); $('pf-form2').reset(); $('pf-text').value = ''; $('pf-msg').textContent = ''; for (const el of document.querySelectorAll('#pf-module input')) { if (el.type === 'checkbox') el.checked = false; else el.value = ''; } zeigePflege(); });
  $('pf-wid-plus').addEventListener('click', () => fuegeWiderspruchHinzu(null, null));
  $('pf-wid-mach').addEventListener('click', machePflegeWiderspruch);
  for (const id of ['pf-art-w', 'pf-art-h']) $(id).addEventListener('change', zeigePfArt);
  $('pf-wid-copy').addEventListener('click', () => kopiere($('pf-wid-text'), $('pf-copy-msg')));
  zeigePflege();

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

  for (const id of ['fr-datum', 'fr-zugang', 'er-leistung', 'er-ende']) $(id).addEventListener('input', zeigeFristen);
  $('li-demo').addEventListener('click', () => zeigeLizenz(DEMO_LIZENZ));
  $('li-datei').addEventListener('change', async (e) => { const f = e.target.files && e.target.files[0]; if (f) zeigeLizenz(await f.text()); });
})();
