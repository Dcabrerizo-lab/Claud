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
      const fs = h('fieldset', {}, h('legend', { text: `Modul ${m}: ${P.MODUL[m].name}` }), h('p', { class: 'small muted', text: `${P.MODUL[m].leicht}. Gewichtung ${P.MODUL[m].gewicht}.` }));
      if (m === 5) {
        fs.append(h('div', { class: 'freq kopf' }, h('span', { text: 'Hilfe, die nicht selbst erledigt werden kann' }), h('span', { text: 'pro Tag' }), h('span', { text: 'pro Woche' }), h('span', { text: 'pro Monat' })));
        for (const [id, name, leicht] of P.M5A.concat(P.M5B)) {
          fs.append(h('div', { class: 'freq' }, h('span', {}, `${id} ${leicht}`, h('span', { class: 'amt', text: name })),
            ...['tag', 'woche', 'monat'].map((x) => h('input', { type: 'number', min: '0', step: '1', inputmode: 'numeric', id: `pf-${id}-${x}`, 'aria-label': `${id} ${leicht}: Anzahl ${x === 'tag' ? 'pro Tag' : x === 'woche' ? 'pro Woche' : 'pro Monat'}` }))));
        }
        for (const [id, name, leicht] of P.M5C) {
          const ist512 = id === '5.12';
          fs.append(h('div', { class: 'freq', 'data-kind': id === '5.K' ? '1' : null }, h('span', {}, `${id} ${leicht}`, h('span', { class: 'amt', text: name })),
            ist512 ? h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'pf-5.12-taeglich' }), 'täglich') : h('span', {}),
            ...['woche', 'monat'].map((x) => h('input', { type: 'number', min: '0', step: '1', inputmode: 'numeric', id: `pf-${id}-${x}`, 'aria-label': `${id} ${leicht}: Anzahl pro ${x === 'woche' ? 'Woche' : 'Monat'}` }))));
        }
        const sel = h('select', { id: 'pf-5.16' }, P.SKALA.sel.stufen.map((s, i) => h('option', { value: i, text: s })));
        fs.append(h('div', { class: 'row' }, h('label', { for: 'pf-5.16' }, '5.16 Diät und ärztliche Vorschriften einhalten', h('span', { class: 'amt', text: 'Einhaltung einer Diät und anderer krankheits- oder therapiebedingter Verhaltensvorschriften' })), sel));
      } else {
        for (const k of P.KRITERIEN.filter((x) => x.m === m)) {
          const sel = h('select', { id: 'pf-' + k.id }, h('option', { value: '', text: '– nicht eingetragen –' }), P.SKALA[k.s].stufen.map((s, i) => h('option', { value: i, text: s })));
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
    return { stufen, m5, inkontinenz: { harn: $('pf-harn').checked, stuhl: $('pf-stuhl').checked }, kind: $('pf-kind').checked, pgBescheid: $('pf-pgb').value };
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
      const t = { a: 'Medikamente, Spritzen, Messungen oder Hilfsmittel', b: 'Wundversorgung, Stoma, Katheter oder Therapie zu Hause', c: 'Arztbesuche oder aufwendige Behandlungen', d: 'Diät oder ärztliche Vorschriften' }[w.id.slice(2)];
      return `Modul 5: mehr Hilfe bei ${t}, als im Gutachten steht`;
    }
    const k = P.kriterium(w.id), sk = P.SKALA[k.s].stufen, ist = +($('pf-' + k.id).value || 0);
    return `${k.id} ${k.leicht}: „${sk[w.nach]}“ statt „${sk[ist]}“`;
  }
  function zeigePflege() {
    const g = lesePflege(), r = P.rechne(g), box = $('pf-erg');
    box.replaceChildren();
    const geld = P.geld(r.pg, Rules);
    box.append(h('h2', { text: 'Ergebnis der Nachrechnung' }),
      h('p', {}, h('span', { class: 'big', text: `${zahl(r.gesamt)} Punkte → Pflegegrad ${r.pg || 'keiner'}` })),
      h('p', { class: 'small', text: `Mobilität ${zahl(r.module[1].gewichtet)} · Verstehen/Verhalten ${zahl(r.m23)} (Modul ${r.zaehlt23} zählt) · Selbstversorgung ${zahl(r.module[4].gewichtet)} · Krankheit und Therapie ${zahl(r.module[5].gewichtet)} · Alltag ${zahl(r.module[6].gewichtet)}` }));
    if (r.bescheid) {
      box.append(h('p', {}, r.bescheid.passt ? h('span', { class: 'pill passt', text: `Passt zum Bescheid (Pflegegrad ${r.bescheid.pg})` })
        : h('span', { class: 'pill zuWenig', text: r.bescheid.abweichung > 0 ? `Nach diesen Punkten Pflegegrad ${r.pg}, im Bescheid nur ${r.bescheid.pg}: Rechenfehler oder andere Angaben, bitte genau vergleichen` : `Im Bescheid Pflegegrad ${r.bescheid.pg}, nach diesen Punkten ${r.pg}: Angaben bitte prüfen` })));
    }
    if (r.pg >= 1) box.append(h('p', { class: 'small', text: `Pflegegrad ${r.pg}: Pflegegeld ${eur(geld.pflegegeld)} im Monat, Entlastungsbetrag ${eur(geld.entlastung)}.` }));
    if (r.fehltBisNaechster != null) {
      const naechst = P.geld(r.naechsterPg, Rules);
      box.append(h('p', {}, h('strong', { text: `Bis Pflegegrad ${r.naechsterPg} fehlen ${zahl(r.fehltBisNaechster)} Punkte.` }), naechst.pflegegeld > geld.pflegegeld ? ` Das wären ${eur(naechst.pflegegeld - geld.pflegegeld)} mehr Pflegegeld im Monat.` : ''));
      if (r.hebel.moeglich) {
        box.append(h('p', { text: r.grenzfall ? 'Es ist knapp. Diese Bewertungen würden schon reichen, wenn sie in Wirklichkeit zutreffen:' : 'Für den nächsten Pflegegrad müsste sich mehr ändern, zum Beispiel:' }));
        r.hebel.optionen.slice(0, 3).forEach((o, i) => {
          const ul = h('ul', {}, o.wege.map((w) => h('li', { text: weg(w) })));
          const btn = o.wege.every((w) => !w.id.startsWith('M5')) ? h('button', { type: 'button', class: 'btn', onclick: () => { o.wege.forEach((w) => fuegeWiderspruchHinzu(w.id, w.nach)); $('pf-wid').scrollIntoView({ block: 'start' }); } }, 'Für den Widerspruch übernehmen') : null;
          box.append(h('div', { class: 'opt' }, h('strong', { text: `Möglichkeit ${i + 1}: ${o.schritte} ${o.schritte === 1 ? 'Stufe' : 'Stufen'} anders` }), ul, btn));
        });
        box.append(h('p', { class: 'small muted', text: 'Nur übernehmen, was im Alltag wirklich so ist. Ob eine Bewertung stimmt, weißt nur du.' }));
      }
    }
    const det = h('details', {}, h('summary', { text: 'Erklärung aller Bewertungen in einfachen Worten' }));
    for (const z of P.erklaerung(g, r)) {
      det.append(h('h3', { text: `Modul ${z.modul}: ${z.leicht}` }), h('p', { class: 'small', text: `${z.summe} Punkte = ${z.bereich} Beeinträchtigung → ${zahl(z.gewichtet)} gewichtete Punkte${z.zaehlt ? '' : ' (zählt nicht, Modul 2 und 3: nur der höhere Wert)'}` }), h('ul', {}, z.kriterien.map((k) => h('li', { class: 'small', text: k.text }))));
    }
    box.append(det);
  }
  // Widerspruch Pflege: Liste der Kriterien
  function fuegeWiderspruchHinzu(id, soll) {
    const liste = $('pf-wid-liste');
    if (id && liste.querySelector(`[data-id="${id}"]`)) return;
    const n = liste.children.length + 1;
    const wahl = h('select', { id: `pw-k-${n}`, 'aria-label': `Kriterium ${n}` }, P.KRITERIEN.filter((k) => k.s !== 'sonde').map((k) => h('option', { value: k.id, text: `${k.id} ${k.leicht}`, selected: k.id === id })));
    const sollSel = h('select', { id: `pw-s-${n}` });
    const fuellen = () => { const k = P.kriterium(wahl.value); sollSel.replaceChildren(...P.SKALA[k.s].stufen.map((s, i) => h('option', { value: i, text: s, selected: soll != null && i === soll }))); };
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
  function machePflegeWiderspruch() {
    const g = lesePflege(), r = P.rechne(g);
    const auswahl = [...$('pf-wid-liste').children].map((z) => { const sel = z.querySelectorAll('select'); const id = sel[0].value; return { id, stufeIst: +(g.stufen[id] || 0), stufeSoll: +sel[1].value, alltag: z.querySelector('textarea').value }; }).filter((x) => x.stufeSoll > x.stufeIst);
    const neu = Object.assign({}, g, { stufen: Object.assign({}, g.stufen) }); auswahl.forEach((x) => { neu.stufen[x.id] = x.stufeSoll; });
    const ziel = P.rechne(neu).pg;
    const t = Widerspruch.text({ art: 'pflege', absender: { name: $('pf-name').value.trim(), strasse: $('pf-anschrift').value.trim(), ort: $('pf-ort').value.trim() }, stelle: { name: $('pf-kasse').value.trim() }, bescheidDatum: $('pf-datum').value, zeichen: $('pf-vnr').value.trim(), heute: heute(),
      pflege: { pgBescheid: r.bescheid ? r.bescheid.pg : r.pg, pgZiel: ziel > (r.bescheid ? r.bescheid.pg : r.pg) ? ziel : null }, punkte: Widerspruch.punktePflege(auswahl, P), akteneinsicht: true });
    $('pf-wid-text').value = t; $('pf-wid-text').hidden = false; $('pf-wid-copy').hidden = false;
    $('pf-frist').textContent = $('pf-datum').value ? fristText($('pf-datum').value) : 'Tipp: Datum des Bescheids eintragen, dann zeigt SoLo die Frist.';
    if (!auswahl.length) $('pf-frist').textContent = 'Noch kein Kriterium mit höherer Bewertung gewählt. ' + $('pf-frist').textContent;
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
      h('td', {}, h('input', { type: 'checkbox', id: `bp-schw-${n}`, 'aria-label': `Person ${n}: schwanger ab der 13. Woche`, checked: !!werte.schwanger })),
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
  $('pf-form').addEventListener('input', zeigePflege);
  $('pf-form').addEventListener('change', zeigePflege);
  $('pf-lesen').addEventListener('click', () => {
    const t = $('pf-text').value;
    if (!t.trim()) { $('pf-msg').textContent = 'Bitte zuerst Text einfügen.'; return; }
    const im = PflegeImport.lies(t, P);
    setzePflege(im);
    $('pf-msg').textContent = `${im.gefunden.length} von ${P.KRITERIEN.length} Bewertungen erkannt${im.pgBescheid ? `, Pflegegrad ${im.pgBescheid} im Text gefunden` : ''}. Bitte jede Zahl mit dem Gutachten vergleichen und korrigieren.`;
    zeigePflege();
  });
  $('pf-beispiel').addEventListener('click', () => { $('pf-text').value = BEISPIEL_GUTACHTEN; $('pf-lesen').click(); });
  $('pf-leeren').addEventListener('click', () => { $('pf-form').reset(); $('pf-text').value = ''; $('pf-msg').textContent = ''; for (const el of document.querySelectorAll('#pf-module input')) { if (el.type === 'checkbox') el.checked = false; else el.value = ''; } zeigePflege(); });
  $('pf-wid-plus').addEventListener('click', () => fuegeWiderspruchHinzu(null, null));
  $('pf-wid-mach').addEventListener('click', machePflegeWiderspruch);
  $('pf-wid-copy').addEventListener('click', () => kopiere($('pf-wid-text'), $('pf-copy-msg')));
  zeigePflege();

  $('bs-erw').addEventListener('click', () => { personZeile('erw'); zeigeBescheid(); });
  $('bs-kind').addEventListener('click', () => { personZeile('kind'); zeigeBescheid(); });
  $('bs-form').addEventListener('input', zeigeBescheid);
  $('bs-form').addEventListener('change', zeigeBescheid);
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

  for (const id of ['fr-datum', 'fr-zugang', 'er-leistung', 'er-ende']) $(id).addEventListener('input', zeigeFristen);
  $('li-demo').addEventListener('click', () => zeigeLizenz(DEMO_LIZENZ));
  $('li-datei').addEventListener('change', async (e) => { const f = e.target.files && e.target.files[0]; if (f) zeigeLizenz(await f.text()); });
})();
