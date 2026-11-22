#!/usr/bin/env node
'use strict';
// SoLo-Video-Werkzeug: Drehbuch (Markdown/YAML/JSON) → Hochformat-Video 1080×1920, 30 fps, Comic-Stil, mit Sprecherstimme.
// Aufruf: node video.js <drehbuch.md> [--aus <ordner>] [--probe <szene@sek,…>|voll] [--nur <n,…>] [--ohne-ton] [--streng]
// Siehe README.md.

const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const F = require('./bausteine/figuren.js');

const W = 1080, H = 1920, FPS = 30;
const SICHER = { oben: 220, unten: H - 380, rechts: W - 160, links: 24 };
const BASIS = __dirname;
const FONTS = process.env.VIDEO_FONTS || path.join(BASIS, 'fonts');
const STIMMEN = process.env.VIDEO_STIMMEN || path.join(BASIS, 'stimmen');
function findePlaywright() {
  const kandidaten = [process.env.PLAYWRIGHT_PFAD, 'playwright', path.join(process.cwd(), 'node_modules/playwright'), path.join(__dirname, '../../node_modules/playwright')].filter(Boolean);
  for (const k of kandidaten) { try { return require.resolve(k); } catch (e) { /* weiter */ } }
  throw new Error('Playwright nicht gefunden: PLAYWRIGHT_PFAD=/pfad/zu/node_modules/playwright setzen');
}
const PY = process.env.PYTHON || 'python3';
const P = F.P;

const HINTERGRUND = {
  hellblau: ['#f2f5f9', '#cfd8ea'], blau: ['#2b4a9b', '#3a5bb2'], navy: ['#1a2456', '#2a3670'],
  gruen: ['#e2f3ea', '#bfe0cb'], warm: ['#fbefcf', '#f1dc9f'], gold: ['#f2b233', '#e39f1c'], weiss: ['#ffffff', '#e3e8f1'],
};

// ---------- Aussprache ----------
const AUSSPRACHE = [
  [/\bSozialleistungslotse\b/g, 'Sozial-Leistungs-Lohtse'], [/\bLotsin\b/g, 'Lohtsinn'], [/\bLotsen?\b/g, (m) => (m.endsWith('n') ? 'Lohtsen' : 'Lohtse')],
  [/\bSoLo\b/g, 'Solo'], [/\bBAföG\b/g, 'Bafög'], [/(\d+(?:,\d+)?)\s*€/g, '$1 Euro'], [/€/g, 'Euro'],
  [/\bz\.\s?B\./g, 'zum Beispiel'], [/\bu\.\s?a\./g, 'unter anderem'], [/\bd\.\s?h\./g, 'das heißt'], [/\bca\./g, 'circa'],
  [/\bbzw\./g, 'beziehungsweise'], [/\bggf\./g, 'gegebenenfalls'], [/\bNr\./g, 'Nummer'], [/§\s?/g, 'Paragraf '],
  [/\bSGB\b/g, 'S G B'], [/\bWBS\b/g, 'W B S'], [/\bKiZ\b/g, 'Kinderzuschlag'], [/\bApp\b/g, 'Äpp'],
  [/–/g, ', '], [/„|“|"/g, ''],
];
const EINER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const ZEHNER = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
function zahlWort(n) {
  if (n < 20) return EINER[n];
  const e = n % 10, z = Math.floor(n / 10);
  return (e ? (e === 1 ? 'ein' : EINER[e]) + 'und' : '') + ZEHNER[z];
}
function sprechText(t, extra = {}) {
  let s = String(t);
  for (const [k, v] of Object.entries(extra)) s = s.split(k).join(v);
  for (const [re, v] of AUSSPRACHE) s = s.replace(re, v);
  s = s.replace(/\b(\d{1,2})\b(?![.,]\d)/g, (m, d) => zahlWort(+d));
  return s.replace(/\s+/g, ' ').trim();
}

// ---------- Hilfen ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const woerter = (s) => String(s || '').trim().split(/\s+/).filter(Boolean);
function args() {
  const a = process.argv.slice(2); const o = { _: [] };
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) { const k = a[i].slice(2); const v = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; o[k] = v; } else o._.push(a[i]);
  }
  return o;
}
function lauf(cmd, argv, opts = {}) { return execFileSync(cmd, argv, { encoding: 'utf8', maxBuffer: 1 << 26, ...opts }); }
function fontDaten() {
  const lies = (n) => { const p = path.join(FONTS, n); if (!fs.existsSync(p)) throw new Error(`Schrift fehlt: ${p} – erst ./fonts-laden.sh ausführen`); return fs.readFileSync(p).toString('base64'); };
  return { titel: lies('SchibstedGrotesk-ExtraBold.ttf'), text: lies('AtkinsonHyperlegible-Bold.ttf') };
}
const textArr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const norm = (w) => String(w).toLowerCase().replace(/[.,!?:;„“"()…–\-+]/g, '');
function hvListe(db, sz) { return new Set(textArr(db.hervorhebung).concat(textArr(sz.hervorhebung)).flatMap((x) => woerter(x)).map(norm).filter(Boolean)); }
function markiere(text, hv) { return woerter(text).map((w) => (hv.has(norm(w)) ? `<span class="hv">${esc(w)}</span>` : esc(w))).join(' ').replace(/\n/g, '<br>'); }
// Effekte: "pop@1.2" oder {art: pop, bei: 1.2, staerke: 0.8}
function tonListe(v) { return textArr(v).map((x) => (typeof x === 'string' ? { art: x.split('@')[0], bei: +(x.split('@')[1] || 0) } : x)); }

// ---------- Planung (Zeiten) ----------
function plane(db, stimmeDauer) {
  const n = db.szenen.length;
  let t0 = 0;
  return db.szenen.map((sz, i) => {
    const erste = i === 0, letzte = i === n - 1;
    const rein = erste ? 0 : (sz.uebergang === 'keiner' ? 0 : 0.35);
    const raus = letzte ? 0 : (sz.uebergang === 'keiner' ? 0 : 0.3);
    const sStart = sz.sprecher_start != null ? +sz.sprecher_start : (erste ? 0.05 : rein + 0.1);
    const A = stimmeDauer[i] || 0;
    let dauer = Math.max(+sz.dauer || 0, A ? sStart + A + 0.6 + raus * 0.5 : 0, 2);
    if (letzte) dauer += +(db.schluss_halten ?? 1.2);
    const frames = Math.round(dauer * FPS);
    dauer = frames / FPS;
    // Sprechblasen: Wörter verteilt über die Sprechzeit
    const blasen = textArr(sz.blase).concat(textArr(sz.blasen));
    const fensterEnde = A ? sStart + A * 0.92 : Math.min(dauer - raus - 0.4, (blasen[0]?.start ?? rein + 0.2) + 0.32 * blasen.reduce((s, b) => s + woerter(b.text).length, 0));
    const gesamtW = blasen.reduce((s, b) => s + woerter(b.text).length, 0) || 1;
    let cursor = blasen[0]?.start != null ? +blasen[0].start : sStart;
    const span = Math.max(0.6, fensterEnde - cursor);
    const bl = blasen.map((b) => {
      const w = woerter(b.text).length;
      const start = b.start != null ? +b.start : cursor;
      const ende = b.ende != null ? +b.ende : start + span * (w / gesamtW);
      cursor = ende;
      return { ...b, start, ende };
    });
    // Kinetische Untertitel: Stücke zu höchstens ~3 Wörtern / 20 Zeichen, Zeit nach Zeichenzahl
    let untertitel = null;
    const utQuelle = sz.untertitel === false ? null : (typeof sz.untertitel === 'string' ? sz.untertitel : ((sz.untertitel === true || (db.untertitel === 'auto' && !blasen.length)) ? sz.sprecher : null));
    if (utQuelle) {
      const ws = woerter(utQuelle);
      const stuecke = []; let cur = [];
      for (const w of ws) {
        const len = cur.concat(w).join(' ').length;
        if (cur.length && (cur.length >= 3 || len > 20)) { stuecke.push(cur); cur = []; }
        cur.push(w);
        if (/[.!?:]$/.test(w)) { stuecke.push(cur); cur = []; }
      }
      if (cur.length) stuecke.push(cur);
      const von = sStart, bis = A ? sStart + A : Math.max(sStart + 1, dauer - raus - 0.5);
      const zeichen = ws.join(' ').length || 1;
      let t = von;
      untertitel = stuecke.map((st) => {
        const d = (bis - von) * (st.join(' ').length + 1) / (zeichen + stuecke.length);
        const worte = st.map((w, j) => ({ w, t: t + d * 0.8 * (j / st.length) }));
        const o = { von: t, bis: t + d, worte }; t += d; return o;
      });
      untertitel[untertitel.length - 1].bis = dauer + 1;
    }
    // Checkliste: Häkchen über die Sprechzeit verteilt
    let checkliste = null;
    if (sz.checkliste) {
      const c = sz.checkliste; const pk = textArr(c.punkte); const n = pk.length;
      const a0 = c.start != null ? +c.start : sStart + 0.2, a1 = A ? sStart + A * 0.85 : a0 + n * 0.8;
      checkliste = { ...c, punkte: pk.map((x, k) => { const o = typeof x === 'string' ? { text: x } : x; return { ...o, bei: o.bei != null ? +o.bei : a0 + (a1 - a0) * (n > 1 ? k / (n - 1) : 0.5) }; }) };
    }
    // Ton-Akzente
    const effekte = [];
    if (rein > 0) effekte.push({ art: 'wusch', t: 0.0 });
    if (erste) textArr(sz.titel).forEach((tt) => { const st = tt.start ?? 0; if ((tt.auftritt || 'knall') === 'knall') effekte.push({ art: 'knall', t: st, staerke: 0.7 }); });
    bl.forEach((b) => effekte.push({ art: 'pop', t: b.start }));
    textArr(sz.laut).forEach((l) => effekte.push({ art: 'pop', t: +(l.start ?? 0.5), staerke: 0.9 }));
    textArr(sz.schilder).forEach((c, k) => { if (k < 4 || c.farbe) effekte.push({ art: 'pop', t: +(c.start ?? 0.4 + k * 0.2), staerke: 0.45 }); });
    (sz.bausteine || []).forEach((b) => { if (b.auftritt === 'plopp') effekte.push({ art: 'pop', t: +(b.start ?? 0), staerke: 0.6 }); });
    if (sz.knall) effekte.push({ art: 'knall', t: +(sz.knall.start ?? rein + 0.1) });
    if (checkliste) checkliste.punkte.forEach((x) => effekte.push({ art: 'ding', t: x.bei }));
    tonListe(sz.ton).forEach((x) => effekte.push({ art: x.art, t: +x.bei, staerke: x.staerke }));
    const plan = { i, t0, dauer, frames, rein, raus, sStart, A, blasen: bl, untertitel, checkliste, effekte: db.effekte === false ? [] : effekte, erste };
    t0 += dauer;
    return plan;
  });
}

// ---------- HTML einer Szene ----------
function sternPunkte(w, h, n = 14) {
  const pts = [];
  for (let k = 0; k < n * 2; k++) {
    const a = (k / (n * 2)) * Math.PI * 2; const rr = k % 2 ? 0.72 : 1;
    pts.push(`${(w / 2 + Math.cos(a) * w / 2 * rr).toFixed(1)},${(h / 2 + Math.sin(a) * h / 2 * rr).toFixed(1)}`);
  }
  return pts.join(' ');
}
const LOGO = `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="28" fill="${P.blau}"/><path d="M30 26h40a12 12 0 0 1 12 12v20a12 12 0 0 1-12 12H50L36 82V70h-6a12 12 0 0 1-12-12V38a12 12 0 0 1 12-12z" fill="#fff"/><path d="M37 48l9 9 18-18" fill="none" stroke="${P.gold}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function marke(m) {
  switch (m) {
    case 'wahrscheinlich': return '<span class="mk mk-w">wahrscheinlich</span>';
    case 'moeglich': case 'möglich': return '<span class="mk mk-m">möglich</span>';
    case 'haken': return `<span class="ic"><svg viewBox="0 0 200 200">${F.DINGE.haken()}</svg></span>`;
    case 'frist': return `<span class="ic"><svg viewBox="0 0 200 200">${F.DINGE.kalender()}</svg></span>`;
    case 'schloss': return `<span class="ic"><svg viewBox="0 0 200 200">${F.DINGE.schloss()}</svg></span>`;
    case 'formular': return `<span class="ic"><svg viewBox="0 0 200 200">${F.DINGE.formular()}</svg></span>`;
    case 'brief': return `<span class="ic"><svg viewBox="0 0 200 200">${F.DINGE.brief()}</svg></span>`;
    default: return '';
  }
}
function handyApp(b) {
  const s = b.bildschirm || {};
  let h = `<div class="hy"><div class="sc"><div class="kopf">${LOGO}<b>SoLo</b></div>`;
  if (s.titel) h += `<div class="st txt">${esc(s.titel)}</div>`;
  if (s.fortschritt) h += `<div class="fb"><i data-fb='${JSON.stringify(s.fortschritt)}'></i></div>`;
  (s.zeilen || []).forEach((z, k) => {
    const zz = typeof z === 'string' ? { text: z } : z;
    const breit = ['wahrscheinlich', 'moeglich', 'möglich'].includes(zz.marke);
    h += `<div class="z ${breit ? 'z2' : ''} ani" data-a='${JSON.stringify({ typ: 'rechts', start: zz.start ?? (b.start ?? 0.3) + 0.35 + k * 0.45, d: 0.35 })}'>` +
      `${breit ? '' : marke(zz.marke)}<span class="zt txt">${esc(zz.text)}</span>${breit ? marke(zz.marke) : ''}</div>`;
  });
  if (s.knopf) h += `<div class="kn txt ani" data-a='${JSON.stringify({ typ: 'plopp', start: s.knopf_start ?? (b.start ?? 0.3) + 0.5 + (s.zeilen || []).length * 0.45 })}'>${esc(s.knopf)}</div>`;
  h += '</div></div>';
  return { w: 560, h: 900, html: h };
}

function szeneHtml(db, sz, pl, fonts) {
  const [bg, dot] = HINTERGRUND[sz.hintergrund || 'hellblau'] || HINTERGRUND.hellblau;
  const dunkel = ['blau', 'navy'].includes(sz.hintergrund);
  const fokus = sz.fokus || [540, 1000];
  const hv = hvListe(db, sz);
  const hvFarbe = (sz.hervorhebung_farbe || db.hervorhebung_farbe) === 'gruen' ? 'gruen' : 'gold';
  const obenY = db.folge != null ? SICHER.oben + 78 : SICHER.oben + 14;
  let cam = '';
  // Bausteine
  (sz.bausteine || []).forEach((b, k) => {
    const hoehe = +b.hoehe || 600;
    let inhalt, bw, bh;
    if (b.was === 'handy-app') { const a = handyApp(b); bw = a.w; bh = a.h; inhalt = `<div class="hyw" style="transform:scale(${hoehe / a.h})">${a.html}</div>`; } else {
      const x = F.baustein(b.was, b);
      bw = x.w; bh = x.h;
      inhalt = `<svg viewBox="0 0 ${x.w} ${x.h}" width="${(x.w * hoehe / x.h).toFixed(1)}" height="${hoehe}" style="overflow:visible${b.spiegeln ? ';transform:scaleX(-1)' : ''}">${x.svg}</svg>`;
    }
    const breite = bw * hoehe / bh;
    const istFigur = F.FIGUREN.includes(b.was);
    const bew = b.bewegung || (istFigur ? 'wippen' : (b.was === 'handy-app' ? 'keine' : 'schweben'));
    const a = { typ: b.auftritt || (k === 0 && !istFigur ? 'keiner' : 'keiner'), start: +(b.start ?? 0), bew, phase: k * 1.3, d: 0.45 };
    cam += `<div class="bs ani" style="left:${(b.x - breite / 2).toFixed(1)}px;top:${(b.y - hoehe).toFixed(1)}px;width:${breite.toFixed(1)}px;height:${hoehe}px;z-index:${b.ebene ?? 10 + k}" data-a='${JSON.stringify(a)}'><div class="bw">${inhalt}</div></div>`;
  });
  // Lautwörter
  textArr(sz.laut).forEach((l) => {
    const w = l.breite || Math.max(300, String(l.text).length * (l.groesse || 64) * 0.78 + 130), h = l.hoehe || Math.round(w * 0.6);
    cam += `<div class="laut ani" style="left:${l.x - w / 2}px;top:${l.y - h / 2}px;width:${w}px;height:${h}px;z-index:60" data-a='${JSON.stringify({ typ: 'plopp', start: +(l.start ?? 0.5), d: 0.4, dreh: l.drehung ?? -8 })}'>` +
      `<svg viewBox="0 0 ${w} ${h}"><polygon points="${sternPunkte(w, h)}" fill="${l.farbe === 'weiss' ? '#fff' : P.gold}" stroke="#111" stroke-width="7" stroke-linejoin="round"/></svg><span class="txt" style="font-size:${l.groesse || 64}px">${esc(l.text)}</span></div>`;
  });
  // Schilder (kleine Wort-Etiketten, z. B. Begrüßungen in vielen Sprachen)
  textArr(sz.schilder).forEach((c, k) => {
    const farbe = { gold: P.gold, gruen: P.gruenhell, warm: P.warm }[c.farbe] || '#fff';
    cam += `<div class="schild ani" style="left:${c.x}px;top:${c.y}px;z-index:${50 + k}" data-a='${JSON.stringify({ typ: 'plopp', start: +(c.start ?? 0.4 + k * 0.2), d: 0.35, dreh: c.drehung ?? 0 })}'><span class="txt" dir="auto" style="font-size:${c.groesse || 50}px;background:${farbe}">${esc(c.text)}</span></div>`;
  });
  // Sprechblasen
  pl.blasen.forEach((b, k) => {
    const ws = woerter(b.text);
    const n = ws.length;
    const spans = ws.map((w, j) => `<span class="w${hv.has(norm(w)) ? ' hv' : ''}" data-t="${(b.start + 0.12 + (b.ende - b.start - 0.12) * (j / Math.max(1, n))).toFixed(3)}">${esc(w)}</span>`).join(' ');
    const art = b.art || 'sprechen';
    const zipfel = b.zipfel || [b.x + (b.breite || 700) / 2, b.y + 360];
    cam += `<div class="bgrp ani" data-a='${JSON.stringify({ typ: 'plopp', start: b.start, d: 0.38, ox: zipfel[0], oy: zipfel[1] })}' style="z-index:${70 + k}" data-zipfel='${JSON.stringify(zipfel)}' data-art="${art}">` +
      `<svg class="zu" width="1080" height="1920"></svg><div class="blase ${art} txt" style="left:${b.x}px;top:${b.y}px;width:${b.breite || 700}px;font-size:${b.groesse || 56}px${b.ausrichtung ? ';text-align:' + b.ausrichtung : ''}">${spans}</div><svg class="zo" width="1080" height="1920"></svg></div>`;
  });
  // Titel
  let fix = '';
  textArr(sz.titel).forEach((t) => {
    const tt = typeof t === 'string' ? { text: t } : t;
    const auf = tt.auftritt || (pl.erste ? 'knall' : 'plopp');
    fix += `<div class="titel txt ani ${tt.stil || (dunkel ? 'hell' : 'dunkel')}" style="top:${tt.y ?? obenY + 20}px;font-size:${tt.groesse || 120}px${tt.ausrichtung ? ';text-align:' + tt.ausrichtung : ''}" data-a='${JSON.stringify({ typ: auf, start: +(tt.start ?? (pl.erste ? 0 : 0.2)), d: 0.5 })}'>${markiere(tt.text, hv)}</div>`;
  });
  // Bildunterschriften
  for (const pos of ['oben', 'unten']) {
    textArr(sz[pos]).forEach((c) => {
      const cc = typeof c === 'string' ? { text: c } : c;
      const st = pos === 'oben' ? `top:${cc.y ?? obenY}px` : `top:${cc.y ?? 0}px;${cc.y == null ? 'bottom:auto' : ''}`;
      fix += `<div class="kasten ${pos} txt ani" style="${st}${cc.x != null ? `;left:${cc.x}px` : ''}" data-pos="${pos}" data-a='${JSON.stringify({ typ: pos === 'oben' ? 'oben' : 'unten', start: +(cc.start ?? (pl.rein + 0.05)), d: 0.4 })}'>${markiere(cc.text, hv)}</div>`;
    });
  }
  // Kleiner Hinweis (Stand, keine Rechtsberatung) direkt über der unteren Sicherheitszone
  if (sz.hinweis) fix += `<div class="hinweis txt ani" data-a='${JSON.stringify({ typ: 'blende', start: +(sz.hinweis_start ?? pl.rein + 0.2), d: 0.3 })}'>${esc(sz.hinweis)}</div>`;
  // Folgen-Abzeichen (Serien-Erkennung)
  if (db.folge != null) fix += `<div class="folge txt">${esc(db.serie || 'SoLo erklärt')} · Folge ${esc(db.folge)}</div>`;
  // Knall: großes Wort / große Zahl
  if (sz.knall) {
    const k = typeof sz.knall === 'string' ? { text: sz.knall } : sz.knall;
    fix += `<div class="knall ani" style="top:${k.y ?? 520}px" data-a='${JSON.stringify({ typ: 'knall', start: +(k.start ?? pl.rein + 0.1), d: 0.45, gross: 2.4 })}'>` +
      (k.oben ? `<div class="k1 txt">${esc(k.oben)}</div>` : '') + `<div class="k2 txt" style="font-size:${k.groesse || 380}px">${esc(k.text)}</div>` + (k.unten ? `<div class="k3 txt">${esc(k.unten)}</div>` : '') + '</div>';
    fix += `<div class="blitz" data-t="${+(k.start ?? pl.rein + 0.1)}"></div>`;
  }
  // Checkliste mit einschnappenden Häkchen
  if (pl.checkliste) {
    const c = pl.checkliste;
    let h = `<div class="cl ani" style="left:${c.x ?? 60}px;top:${c.y ?? obenY + 120}px;width:${c.breite ?? 840}px" data-a='${JSON.stringify({ typ: 'plopp', start: +(c.start_karte ?? pl.rein + 0.05), d: 0.4 })}'>`;
    if (c.titel) h += `<div class="clt txt">${markiere(c.titel, hv)}</div>`;
    c.punkte.forEach((x) => {
      h += `<div class="clz ani" data-a='${JSON.stringify({ typ: 'rechts', start: x.bei - 0.45, d: 0.3 })}'><span class="box"><svg viewBox="0 0 100 100" class="ck" data-t="${x.bei.toFixed(3)}"><path d="M18 52 l22 22 l44 -50" fill="none" stroke="${P.gruen}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="txt">${markiere(x.text, hv)}</span></div>`;
    });
    fix += h + '</div>';
  }
  // Kinetische Untertitel
  if (pl.untertitel) {
    const y = sz.untertitel_y ?? db.untertitel_y ?? 1330;
    pl.untertitel.forEach((st) => {
      fix += `<div class="ut txt" style="top:${y}px" data-von="${st.von.toFixed(3)}" data-bis="${st.bis.toFixed(3)}">` + st.worte.map((x) => `<span class="w${hv.has(norm(x.w)) ? ' hv' : ''}" data-t="${x.t.toFixed(3)}">${esc(x.w)}</span>`).join(' ') + '</div>';
    });
  }
  const strahlen = sz.strahlen ? `<div class="strahlen" style="--fx:${fokus[0]}px;--fy:${fokus[1]}px;--sa:${dunkel ? (sz.hintergrund === 'navy' ? 0.1 : 0.16) : 0.3}"></div>` : '';
  const daten = { dauer: pl.dauer, rein: pl.rein, raus: pl.raus, kamera: sz.kamera || 'zoom-in', ruck: +(sz.ruck_bei ?? pl.dauer * 0.5), fokus, sicher: SICHER, knall: sz.knall ? +(sz.knall.start ?? pl.rein + 0.1) : null };
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Schibsted Grotesk';font-weight:800;src:url(data:font/ttf;base64,${fonts.titel}) format('truetype')}
@font-face{font-family:'Atkinson Hyperlegible';font-weight:700;src:url(data:font/ttf;base64,${fonts.text}) format('truetype')}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${P.navy}}
body{font-family:'Atkinson Hyperlegible','Noto Sans','Noto Sans Arabic','DejaVu Sans',sans-serif;font-weight:700;color:#111}
#buehne{position:absolute;inset:0;background:${P.navy};background-image:radial-gradient(circle,#2c3a7e 30%,transparent 33%);background-size:22px 22px}
#panel{position:absolute;left:18px;top:18px;width:1044px;height:1884px;border:8px solid #111;border-radius:8px;overflow:hidden;background:${bg};box-shadow:12px 12px 0 #0b1030}
#innen{position:absolute;left:-26px;top:-26px;width:${W}px;height:${H}px}
.ht{position:absolute;inset:-40px;background-image:radial-gradient(circle,${dot} 36%,transparent 39%);background-size:24px 24px;-webkit-mask-image:radial-gradient(ellipse at 50% 48%,transparent 22%,#000 78%)}
.ht2{position:absolute;inset:-40px;background-image:radial-gradient(circle,${dot} 22%,transparent 25%);background-size:24px 24px;background-position:12px 12px;-webkit-mask-image:radial-gradient(ellipse at 50% 48%,transparent 40%,#000 95%)}
.strahlen{position:absolute;inset:-600px;background:repeating-conic-gradient(from 0deg at calc(var(--fx) + 600px) calc(var(--fy) + 600px),rgba(255,255,255,var(--sa)) 0 7deg,transparent 7deg 18deg)}
#cam{position:absolute;inset:0;transform-origin:${fokus[0]}px ${fokus[1]}px}
.o{stroke:#111;stroke-width:7;stroke-linejoin:round;stroke-linecap:round}
.bs{position:absolute;transform-origin:50% 60%}
.bw{position:absolute;inset:0;transform-origin:50% 100%}
.bw>svg{position:absolute;left:0;top:0}
.hyw{position:absolute;left:0;top:0;transform-origin:0 0}
.hy{width:560px;height:900px;background:${P.navy};border:10px solid #111;border-radius:74px;padding:28px 24px 44px;box-shadow:14px 14px 0 rgba(0,0,0,.25)}
.sc{width:100%;height:100%;background:${P.hell};border:6px solid #111;border-radius:44px;overflow:hidden;padding:26px 24px}
.kopf{display:flex;align-items:center;gap:14px;font-family:'Schibsted Grotesk';font-weight:800;font-size:46px;color:${P.navy};margin-bottom:18px}
.kopf svg{width:70px;height:70px}
.st{font-size:42px;line-height:1.15;color:${P.navy};margin-bottom:18px}
.fb{height:30px;border:5px solid #111;border-radius:15px;background:#fff;overflow:hidden;margin-bottom:20px}.fb i{display:block;height:100%;width:0;background:${P.gruen}}
.z{display:flex;align-items:center;gap:14px;background:#fff;border:5px solid #111;border-radius:22px;padding:14px 16px;margin-bottom:14px;font-size:38px;line-height:1.12;color:#111}
.z2{flex-direction:column;align-items:flex-start;gap:8px}
.mk{font-size:32px;padding:4px 16px;border-radius:999px;border:4px solid #111}
.mk-w{background:${P.gruenhell};color:${P.gruen}}.mk-m{background:${P.warm};color:${P.navy}}
.ic{flex:0 0 64px;height:64px}.ic svg{width:64px;height:64px}
.kn{margin-top:10px;background:${P.blau};color:#fff;border:5px solid #111;border-radius:24px;padding:16px;text-align:center;font-size:38px}
.bgrp{position:absolute;inset:0;pointer-events:none}
.bgrp svg{position:absolute;left:0;top:0;overflow:visible}
.blase{position:absolute;background:#fff;border:7px solid #111;border-radius:60px;padding:30px 40px 34px;line-height:1.2;color:#111;box-shadow:8px 8px 0 rgba(17,17,17,.18)}
.blase.denken{border-radius:50%/46%;padding:52px 64px;text-align:center}
.w{opacity:0;display:inline-block}
.schild{position:absolute;width:0;height:0}.schild span{position:absolute;left:0;top:0;transform:translate(-50%,-50%);white-space:nowrap;border:6px solid #111;border-radius:999px;padding:8px 30px 12px;box-shadow:6px 6px 0 #111;color:#111}
.laut{position:absolute}.laut svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.laut span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Schibsted Grotesk';font-weight:800;color:${P.navy};letter-spacing:1px}
.titel{position:absolute;left:40px;width:880px;font-family:'Schibsted Grotesk';font-weight:800;line-height:1.02;letter-spacing:-1px}
.titel.dunkel{color:${P.blau};text-shadow:6px 6px 0 #111}
.titel.hell{color:#fff;text-shadow:6px 6px 0 #111}
.hv{background:${hvFarbe === 'gruen' ? P.gruen : P.gold};color:${hvFarbe === 'gruen' ? '#fff' : '#111'};border-radius:12px;padding:0 10px;margin:0 -4px;-webkit-box-decoration-break:clone}
.ut{position:absolute;left:40px;width:880px;text-align:center;font-size:68px;line-height:1.12;color:#fff;-webkit-text-stroke:14px #111;paint-order:stroke fill;text-shadow:0 7px 0 #111;opacity:0}
.ut .hv{background:none;color:${hvFarbe === 'gruen' ? '#7be0a6' : P.gold};padding:0;margin:0}
.hinweis{position:absolute;left:44px;max-width:876px;bottom:${H - SICHER.unten + 10}px;background:rgba(255,255,255,.92);color:${P.navy};font-size:36px;line-height:1.15;padding:6px 18px 8px;border:4px solid #111;border-radius:14px}
.folge{position:absolute;left:44px;top:${SICHER.oben + 8}px;background:${P.navy};color:#fff;font-family:'Schibsted Grotesk';font-weight:800;font-size:34px;padding:6px 20px 8px;border:5px solid #111;border-radius:999px;letter-spacing:.5px}
.knall{position:absolute;left:40px;width:880px;text-align:center;font-family:'Schibsted Grotesk';font-weight:800;color:#fff;-webkit-text-stroke:18px #111;paint-order:stroke fill;transform-origin:50% 50%}
.knall .k1{font-size:96px;line-height:1}.knall .k2{line-height:.95;text-shadow:14px 14px 0 #111;color:${P.gold}}.knall .k3{font-size:104px;line-height:1.05}
.blitz{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:200}
.cl{position:absolute;background:#fff;border:7px solid #111;border-radius:36px;padding:30px 34px 14px;box-shadow:12px 12px 0 #111;z-index:80}
.clt{font-family:'Schibsted Grotesk';font-weight:800;font-size:60px;line-height:1.05;color:${P.navy};margin-bottom:22px}
.clz{display:flex;align-items:center;gap:24px;font-size:52px;line-height:1.12;margin-bottom:22px}
.box{flex:0 0 84px;height:84px;border:7px solid #111;border-radius:18px;background:${P.gruenhell};position:relative}
.ck{position:absolute;left:-6px;top:-14px;width:96px;height:96px;overflow:visible;transform:scale(0)}
.kasten{position:absolute;left:44px;max-width:876px;background:${P.warm};border:6px solid #111;padding:16px 28px 18px;font-size:52px;line-height:1.15;color:${P.navy};box-shadow:8px 8px 0 #111}
</style></head><body><div id="buehne"><div id="panel"><div id="innen">
<div class="ht"></div><div class="ht2"></div>${strahlen}
<div id="cam">${cam}</div>${fix}
</div></div></div>
<script>
(function(){
${seitenSkript.toString()}
seitenSkript(${JSON.stringify(daten)});
})();
</script></body></html>`;
}

// läuft im Browser
function seitenSkript(D) {
  const kl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const eo = (p) => 1 - Math.pow(1 - p, 3);
  const ei = (p) => p * p * p;
  const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const back = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const elems = [...document.querySelectorAll('.ani')].map((el) => ({ el, a: JSON.parse(el.dataset.a), bw: el.querySelector(':scope > .bw'), wink: el.querySelectorAll('.wink') }));
  const worte = [...document.querySelectorAll('.w')].map((el) => ({ el, t: +el.dataset.t, ut: !!el.closest('.ut') }));
  const cks = [...document.querySelectorAll('.ck')].map((el) => ({ el, t: +el.dataset.t }));
  const uts = [...document.querySelectorAll('.ut')].map((el) => ({ el, von: +el.dataset.von, bis: +el.dataset.bis }));
  const blitz = document.querySelector('.blitz');
  const fbs = [...document.querySelectorAll('[data-fb]')].map((el) => ({ el, f: JSON.parse(el.dataset.fb) }));
  // untere Bildunterschrift über der Sicherheitszone ausrichten
  document.querySelectorAll('.kasten.unten').forEach((k) => { if (!k.style.top || k.style.top === '0px') k.style.top = (D.sicher.unten - 14 - k.offsetHeight) + 'px'; });
  // Zipfel der Sprechblasen
  document.querySelectorAll('.bgrp').forEach((g) => {
    const b = g.querySelector('.blase'); const [tx, ty] = JSON.parse(g.dataset.zipfel);
    const L = b.offsetLeft, T = b.offsetTop, Wd = b.offsetWidth, Ht = b.offsetHeight;
    const unten = ty > T + Ht / 2;
    const bx = kl(tx, L + 90, L + Wd - 90), by = unten ? T + Ht - 4 : T + 4;
    const zu = g.querySelector('.zu'), zo = g.querySelector('.zo');
    if (g.dataset.art === 'denken') {
      let s = '';
      [0.35, 0.65, 0.9].forEach((p, i) => { const x = bx + (tx - bx) * p, y = by + (ty - by) * p; const r = 26 - i * 7; s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" stroke="#111" stroke-width="6"/>'; });
      zu.innerHTML = s;
    } else {
      const dx = tx - bx, dy = ty - by, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len, bb = 38;
      const p1 = [bx - bb, by], p2 = [bx + bb, by];
      zu.innerHTML = '<path d="M' + p1 + ' Q' + (bx + dx * 0.5 - nx * 10) + ',' + (by + dy * 0.5) + ' ' + tx + ',' + ty + ' L' + p2 + ' Z" fill="#fff" stroke="#111" stroke-width="7" stroke-linejoin="round"/>';
      const s = unten ? -1 : 1;
      zo.innerHTML = '<path d="M' + (bx - bb + 7) + ',' + (by + s * 9) + ' L' + (bx + bb - 7) + ',' + (by + s * 9) + ' L' + (bx + dx * 0.25) + ',' + (by + dy * 0.25) + ' Z" fill="#fff"/>';
    }
  });
  function auftritt(a, t, el) {
    const p = kl((t - a.start) / (a.d || 0.45));
    if (a.typ === 'keiner' || !a.typ) return { tr: '', op: 1 };
    if (a.typ === 'knall') { // startet groß und knallt auf Normalgröße; bei start 0 schon im ersten Bild sichtbar
      if (t < a.start) return { tr: '', op: 0 };
      const g = a.gross || 1.12;
      const s = 1 + (g - 1) * Math.pow(1 - p, 3) - Math.sin(p * Math.PI) * 0.06;
      return { tr: 'scale(' + s + ') rotate(' + (-(a.gross ? 4 : 2) * (1 - p)) + 'deg)', op: 1 };
    }
    if (p <= 0) return { tr: '', op: 0 };
    switch (a.typ) {
      case 'plopp': {
        const s = 0.2 + 0.8 * back(p);
        if (a.ox != null) el.style.transformOrigin = a.ox + 'px ' + a.oy + 'px';
        return { tr: 'scale(' + s + ')' + (a.dreh ? ' rotate(' + a.dreh + 'deg)' : ''), op: kl(p * 3) };
      }
      case 'links': return { tr: 'translateX(' + (-700 * (1 - eo(p))) + 'px)', op: 1 };
      case 'rechts': return { tr: 'translateX(' + (700 * (1 - eo(p))) + 'px)', op: kl(p * 2) };
      case 'unten': return { tr: 'translateY(' + (500 * (1 - eo(p))) + 'px)', op: kl(p * 2) };
      case 'oben': return { tr: 'translateY(' + (-260 * (1 - eo(p))) + 'px)', op: kl(p * 2) };
      case 'blende': return { tr: '', op: p };
      default: return { tr: '', op: 1 };
    }
  }
  window.zeit = function (t) {
    // Panel-Übergang
    const panel = document.getElementById('panel');
    let px = 0, rot = 0;
    if (D.rein && t < D.rein) { const p = eo(t / D.rein); px = 640 * (1 - p); rot = 3 * (1 - p); }
    if (D.raus && t > D.dauer - D.raus) { const p = ei((t - (D.dauer - D.raus)) / D.raus); px = -640 * p; rot = -3 * p; }
    let py = 0;
    if (D.knall != null && t >= D.knall && t < D.knall + 0.35) { const k = (t - D.knall) / 0.35; px += Math.sin(k * 40) * 14 * (1 - k); py = Math.cos(k * 33) * 10 * (1 - k); }
    panel.style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + rot + 'deg)';
    if (blitz) { const k = (t - +blitz.dataset.t) / 0.18; blitz.style.opacity = k >= 0 && k < 1 ? 0.75 * (1 - k) : 0; }
    // Kamera
    const q = eio(kl(t / D.dauer));
    const cam = document.getElementById('cam');
    let cs = 1, cx = 0;
    switch (D.kamera) {
      case 'zoom-in': cs = 1 + 0.07 * q; break;
      case 'zoom-out': cs = 1.08 - 0.08 * q; break;
      case 'schwenk-links': cs = 1.06; cx = 36 - 72 * q; break;
      case 'schwenk-rechts': cs = 1.06; cx = -36 + 72 * q; break;
      case 'ruck': { const p = kl((t - D.ruck) / 0.18); cs = 1 + 0.02 * q + 0.1 * eo(p); break; }
      default: cs = 1.02;
    }
    cam.style.transform = 'translateX(' + cx + 'px) scale(' + cs + ')';
    const st = document.querySelector('.strahlen'); if (st) st.style.transform = 'rotate(' + (t * 4) + 'deg)';
    for (const e of elems) {
      const r = auftritt(e.a, t, e.el);
      e.el.style.transform = r.tr; e.el.style.opacity = r.op;
      if (e.bw) {
        let m = '';
        const ph = e.a.phase || 0;
        if (e.a.bew === 'wippen') m = 'translateY(' + (Math.sin((t + ph) * 2 * Math.PI * 0.75) * 7) + 'px) rotate(' + (Math.sin((t + ph) * 2 * Math.PI * 0.375) * 1.2) + 'deg)';
        else if (e.a.bew === 'schweben') m = 'translateY(' + (Math.sin((t + ph) * 2 * Math.PI * 0.5) * 10) + 'px) rotate(' + (Math.sin((t + ph) * 2 * Math.PI * 0.25) * 3) + 'deg)';
        else if (e.a.bew === 'pulsieren') m = 'scale(' + (1 + Math.sin((t + ph) * 2 * Math.PI * 1.2) * 0.03) + ')';
        e.bw.style.transform = m;
      }
      e.wink.forEach((w) => w.setAttribute('transform', 'rotate(' + (Math.sin(t * 2 * Math.PI * 1.6) * 12) + ' ' + w.dataset.px + ' ' + w.dataset.py + ')'));
    }
    for (const w of worte) { const p = kl((t - w.t) / 0.14); w.el.style.opacity = p; w.el.style.transform = w.ut ? 'scale(' + (0.6 + 0.4 * back(p)) + ')' : 'translateY(' + (8 * (1 - p)) + 'px)'; }
    for (const c of cks) { const p = kl((t - c.t) / 0.22); c.el.style.transform = 'scale(' + (p <= 0 ? 0 : back(p)) + ')'; }
    for (const u of uts) { const an = t >= u.von && t < u.bis; u.el.style.opacity = an ? 1 : 0; }
    for (const f of fbs) { const p = eio(kl((t - f.f.start) / ((f.f.ende || f.f.start + 1.5) - f.f.start))); f.el.style.width = ((f.f.von ?? 0) + ((f.f.bis ?? 100) - (f.f.von ?? 0)) * p) + '%'; }
  };
  window.pruefe = function () {
    const fehler = [];
    document.querySelectorAll('.txt').forEach((el) => {
      let o = el, sicht = true;
      while (o && o !== document.body) { if (getComputedStyle(o).opacity === '0') { sicht = false; break; } o = o.parentElement; }
      if (!sicht) return;
      const r = el.getBoundingClientRect();
      const s = D.sicher, m = [];
      if (r.top < s.oben - 0.5) m.push('oben ' + Math.round(s.oben - r.top) + ' px');
      if (r.bottom > s.unten + 0.5) m.push('unten ' + Math.round(r.bottom - s.unten) + ' px');
      if (r.right > s.rechts + 0.5) m.push('rechts ' + Math.round(r.right - s.rechts) + ' px');
      if (r.left < s.links - 0.5) m.push('links ' + Math.round(s.links - r.left) + ' px');
      if (m.length) fehler.push((el.textContent || '').trim().slice(0, 40) + ' → zu weit ' + m.join(', '));
    });
    return fehler;
  };
}

// ---------- Rendern ----------
async function rendere(db, plaene, opt) {
  const { chromium } = require(findePlaywright());
  const fonts = fontDaten();
  const browser = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const warnungen = [];
  const dateien = [];
  try {
    for (const pl of plaene) {
      const sz = db.szenen[pl.i];
      if (opt.nur && !opt.nur.includes(pl.i + 1)) { dateien.push(path.join(opt.tmp, `szene-${String(pl.i + 1).padStart(2, '0')}.mp4`)); continue; }
      const html = szeneHtml(db, sz, pl, fonts);
      fs.writeFileSync(path.join(opt.tmp, `szene-${String(pl.i + 1).padStart(2, '0')}.html`), html);
      await page.setContent(html, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      // Prüfung der Sicherheitszonen an mehreren Zeitpunkten
      for (const t of [pl.dauer - pl.raus - 0.05, ...(pl.untertitel || []).map((u) => Math.min(u.bis, pl.dauer - pl.raus) - 0.05)]) {
        await page.evaluate((tt) => window.zeit(tt), t);
        const f = await page.evaluate(() => window.pruefe());
        f.forEach((x) => warnungen.push(`Szene ${pl.i + 1} (${sz.name || ''}) bei ${t.toFixed(1)} s: ${x}`));
      }
      if (opt.probe) {
        const zeiten = opt.probe === true ? [pl.dauer - pl.raus - 0.05] : opt.probe.filter((p) => p.szene === pl.i + 1).map((p) => p.t);
        for (const t of zeiten) {
          await page.evaluate((tt) => window.zeit(tt), t);
          const ziel = path.join(opt.aus, `probe-${String(pl.i + 1).padStart(2, '0')}-${t.toFixed(1)}s.png`);
          await page.screenshot({ path: ziel, type: 'png' });
          console.log('Probebild:', ziel);
        }
        continue;
      }
      const ziel = path.join(opt.tmp, `szene-${String(pl.i + 1).padStart(2, '0')}.mp4`);
      const tmp = ziel.replace(/\.mp4$/, '.tmp.mp4');
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
        '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
        '-r', String(FPS), '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
      const fertig = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg Szene ' + (pl.i + 1) + ' Code ' + c)))));
      const t0 = Date.now();
      for (let f = 0; f < pl.frames; f++) {
        await page.evaluate((tt) => window.zeit(tt), f / FPS);
        const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      ff.stdin.end();
      await fertig;
      fs.renameSync(tmp, ziel);
      dateien.push(ziel);
      console.log(`Szene ${pl.i + 1}/${plaene.length}: ${pl.frames} Bilder, ${(pl.dauer).toFixed(2)} s, ${((Date.now() - t0) / 1000).toFixed(0)} s Rechenzeit`);
    }
  } finally { await browser.close(); }
  return { dateien, warnungen };
}

// ---------- Ton ----------
function ton(db, plaene, stimmen, opt, gesamt) {
  const teile = plaene.filter((p) => stimmen[p.i]).map((p) => ({ datei: stimmen[p.i].datei, start: p.t0 + p.sStart }));
  const musik = db.musik !== false && db.musik !== 'nein';
  const effekte = plaene.flatMap((p) => p.effekte.map((e) => ({ ...e, t: p.t0 + e.t }))).filter((e) => e.t >= 0);
  if (!teile.length && !musik && !effekte.length) return null;
  const sp = path.join(opt.tmp, 'stimme.wav');
  fs.writeFileSync(path.join(opt.tmp, 'spur.json'), JSON.stringify({ laenge: gesamt, ziel: sp, teile }));
  lauf(PY, [path.join(BASIS, 'stimme.py'), 'spur', path.join(opt.tmp, 'spur.json')]);
  let mu = '-';
  if (musik) { mu = path.join(opt.tmp, 'musik.wav'); lauf(PY, [path.join(BASIS, 'musik.py'), String(gesamt), mu]); }
  const effDatei = path.join(opt.tmp, 'effekte.json');
  fs.writeFileSync(effDatei, JSON.stringify(effekte));
  const mix = path.join(opt.tmp, 'mix.wav');
  lauf(PY, [path.join(BASIS, 'mischen.py'), sp, mu, mix, String(db.musik_abstand_db ?? 25), effDatei]);
  // Lautheit: zweistufig loudnorm auf -14 LUFS
  const mess = spawnSyncText('ffmpeg', ['-hide_banner', '-i', mix, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
  const j = JSON.parse(mess.slice(mess.lastIndexOf('{'), mess.lastIndexOf('}') + 1));
  const norm = path.join(opt.tmp, 'ton.wav');
  lauf('ffmpeg', ['-y', '-loglevel', 'error', '-i', mix, '-af', `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000`, '-ar', '48000', norm]);
  return norm;
}
function spawnSyncText(cmd, a) { const r = require('child_process').spawnSync(cmd, a, { encoding: 'utf8', maxBuffer: 1 << 26 }); return (r.stdout || '') + (r.stderr || ''); }

// ---------- Hauptprogramm ----------
async function main() {
  const o = args();
  const quelle = o._[0];
  if (!quelle) { console.error('Aufruf: node video.js <drehbuch.md|yaml|json> [--aus ordner] [--probe voll|2@3.5,5@4] [--nur 3,4] [--ohne-ton] [--streng]'); process.exit(2); }
  const db = JSON.parse(lauf(PY, [path.join(BASIS, 'drehbuch.py'), quelle]));
  // basis: n → Felder von Szene n übernehmen (eigene Felder haben Vorrang)
  db.szenen = db.szenen.map((sz) => (sz.basis ? { ...db.szenen[sz.basis - 1], name: undefined, ...sz } : sz));
  const name = db.datei || path.basename(quelle).replace(/\.[^.]+$/, '');
  const aus = path.resolve(o.aus || 'ausgabe');
  const tmp = path.join(aus, `.arbeit-${name}`);
  fs.mkdirSync(tmp, { recursive: true });
  const opt = { aus, tmp, nur: o.nur ? String(o.nur).split(',').map(Number) : null };
  if (o.probe) opt.probe = o.probe === true || o.probe === 'voll' ? true : String(o.probe).split(',').map((s) => { const [a, b] = s.split('@'); return { szene: +a, t: +b }; });

  // Stimme
  const ohneTon = !!o['ohne-ton'] || db.ton === false;
  let stimmen = {};
  const texte = db.szenen.map((sz, i) => (sz.sprecher && !ohneTon ? { id: `s${String(i + 1).padStart(2, '0')}`, text: sprechText(sz.sprecher, db.aussprache), stimme: sz.stimme || db.stimme || 'lotsin', tempo: sz.tempo || db.tempo || 1.1 } : null));
  if (o.aussprache) { // Lautschrift ausgeben, um Aussprache ohne Anhören zu prüfen
    const f = path.join(tmp, 'lautschrift.json');
    fs.writeFileSync(f, JSON.stringify({ stimmen: STIMMEN, texte: texte.filter(Boolean) }));
    console.log(lauf(PY, [path.join(BASIS, 'stimme.py'), 'lautschrift', f]));
    return;
  }
  if (texte.some(Boolean)) {
    const auftrag = path.join(tmp, 'sprechen.json');
    fs.writeFileSync(auftrag, JSON.stringify({ stimmen: STIMMEN, ziel: path.join(tmp, 'stimme'), texte: texte.filter(Boolean) }));
    const erg = JSON.parse(lauf(PY, [path.join(BASIS, 'stimme.py'), 'sprechen', auftrag]));
    texte.forEach((t, i) => { if (t) stimmen[i] = erg[t.id]; });
  }
  const plaene = plane(db, db.szenen.map((_, i) => stimmen[i]?.sekunden || 0));
  const gesamt = plaene.reduce((s, p) => s + p.dauer, 0);

  // Wörter zählen (Bildschirmtext und Sprechertext)
  const wBild = db.szenen.reduce((s, sz) => s + textArr(sz.blase).concat(textArr(sz.blasen)).reduce((a, b) => a + woerter(b.text).length, 0) + ['oben', 'unten'].reduce((a, k) => a + textArr(sz[k]).reduce((x, c) => x + woerter(typeof c === 'string' ? c : c.text).length, 0), 0), 0);
  const wSpr = db.szenen.reduce((s, sz) => s + woerter(sz.sprecher).length, 0);
  console.log(`Drehbuch „${db.titel || name}“: ${db.szenen.length} Szenen, ${gesamt.toFixed(1)} s, ${wSpr} Wörter gesprochen, ${wBild} Wörter Bildtext.`);
  plaene.forEach((p) => console.log(`  ${String(p.i + 1).padStart(2)}. ${(db.szenen[p.i].name || '').padEnd(28).slice(0, 28)} ${p.dauer.toFixed(2)} s  (Stimme ${p.A.toFixed(2)} s)`));
  // Mindestgröße Sprechblasen
  db.szenen.forEach((sz, i) => textArr(sz.blase).concat(textArr(sz.blasen)).forEach((b) => { if ((b.groesse || 56) < 52) console.warn(`WARNUNG Szene ${i + 1}: Sprechblasen-Schrift ${b.groesse} px < 52 px`); }));

  const { dateien, warnungen } = await rendere(db, plaene, opt);
  warnungen.forEach((w) => console.warn('WARNUNG Sicherheitszone:', w));
  if (warnungen.length && o.streng) process.exit(1);
  if (opt.probe) return;

  // Zusammenfügen
  const liste = path.join(tmp, 'liste.txt');
  fs.writeFileSync(liste, dateien.map((d) => `file '${d}'`).join('\n'));
  const stumm = path.join(tmp, 'stumm.mp4');
  lauf('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', liste, '-c', 'copy', stumm]);
  const ziel = path.join(aus, `${name}.mp4`);
  const tonDatei = ohneTon ? null : ton(db, plaene, stimmen, opt, gesamt);
  if (tonDatei) {
    lauf('ffmpeg', ['-y', '-loglevel', 'error', '-i', stumm, '-i', tonDatei, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', ziel + '.tmp.mp4']);
  } else {
    lauf('ffmpeg', ['-y', '-loglevel', 'error', '-i', stumm, '-c', 'copy', '-movflags', '+faststart', ziel + '.tmp.mp4']);
  }
  fs.renameSync(ziel + '.tmp.mp4', ziel);
  console.log('Fertig:', ziel);
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
module.exports = { sprechText, plane };
