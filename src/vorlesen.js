// Vorlesen (Senioren-/Pflege-Version, Entscheidung David 24.11.2026): liest den sichtbaren Inhalt einer Seite absatzweise vor.
//  - Browser: Web Speech API (speechSynthesis). App (Capacitor): Plugin @capacitor-community/text-to-speech („TextToSpeech“),
//    nutzt die Sprachausgabe des Geräts (Android TextToSpeech, iOS AVSpeechSynthesizer). Kein eigener Netzzugriff, keine Daten nach außen.
//  - Sprache = Sprache der App (html[lang]); Blöcke mit eigenem lang (z. B. deutscher Text auf einer arabischen Seite) in ihrer Sprache.
//  - Keine Stimme für die Sprache: Knopf aus, kurzer Hinweis. Keine Sprachausgabe im Gerät: ganze Leiste aus.
//  - Gelesen wird nur Sichtbares: nichts mit hidden, aria-hidden, display:none, zugeklappte <details> (nur die Überschrift),
//    keine Navigation, keine Eingabefelder, nichts mit data-vorlesen="nein".
// Aufruf (src/app.js): if (window.VORLESEN) VORLESEN.knopf(seitenContainer);  optional VORLESEN.uebersetzer(t) für Einfache Sprache.
/* exported VORLESEN */
/* global I18N, I18N_EINFACH */
var VORLESEN = (function () {
  'use strict';

  // App-Sprache → BCP-47 (erste Wahl, dann Ersatz). Dari (fa-AF) hat selten eine eigene Stimme: Persisch als Ersatz.
  var BCP = {
    de: ['de-DE', 'de'], en: ['en-GB', 'en-US', 'en'], tr: ['tr-TR', 'tr'], ar: ['ar-SA', 'ar-EG', 'ar'], ru: ['ru-RU', 'ru'],
    uk: ['uk-UA', 'uk'], pl: ['pl-PL', 'pl'], ro: ['ro-RO', 'ro'], fr: ['fr-FR', 'fr'], fa: ['fa-IR', 'fa'],
    'fa-AF': ['fa-AF', 'prs-AF', 'prs', 'fa-IR', 'fa'], ps: ['ps-AF', 'ps'], so: ['so-SO', 'so']
  };
  var TEMPO = { normal: 1, langsam: 0.75 };
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|INPUT|SELECT|TEXTAREA|NAV|IFRAME|CANVAS|OPTION|DIALOG|OBJECT|IMG|VIDEO|AUDIO)$/;
  var INLINE = /^(A|SPAN|STRONG|EM|B|I|U|S|SMALL|ABBR|CODE|BDI|BDO|MARK|TIME|BR|SUP|SUB|Q|CITE|DFN|KBD|SAMP|VAR|WBR|DATA|LABEL)$/;

  var tFn = null;            // optional: t() der App (dann gilt auch Einfache Sprache)
  var leisten = [];          // alle erzeugten Leisten {el, container, wurzel}
  var stimmenWeb = null;     // Cache getVoices()
  var nativPruef = {};       // Cache isLanguageSupported je BCP-Tag
  var lauf = null;           // laufendes Vorlesen {leiste, bloecke, i, abbruch}

  // ---------- Umgebung ----------
  function nativ() {
    try {
      var C = window.Capacitor;
      if (!C || !C.isNativePlatform || !C.isNativePlatform()) return null;
      return (C.Plugins && C.Plugins.TextToSpeech) || null;
    } catch (e) { return null; }
  }
  function web() { return typeof window !== 'undefined' && window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function' ? window.speechSynthesis : null; }
  function motor() { return nativ() ? 'nativ' : (web() ? 'web' : null); }

  function appSprache() {
    var l = (document.documentElement.getAttribute('lang') || 'de');
    return BCP[l] ? l : (BCP[l.split('-')[0]] ? l.split('-')[0] : 'de');
  }
  function spracheVon(el) {
    var n = el && el.closest ? el.closest('[lang]') : null;
    var l = n ? n.getAttribute('lang') : appSprache();
    if (BCP[l]) return l;
    return BCP[String(l).split('-')[0]] ? String(l).split('-')[0] : appSprache();
  }

  // ---------- Texte ----------
  function einfachAn() {
    try { var s = document.getElementById('langTop'); return !!(s && s.value === 'de-einfach'); } catch (e) { return false; }
  }
  function txt(k) {
    if (tFn) { try { var s = tFn(k); if (s && s !== k) return s; } catch (e) { /* weiter mit eigenen Texten */ } }
    var l = appSprache();
    var I = typeof I18N !== 'undefined' ? I18N : {};
    if (l === 'de' && einfachAn() && typeof I18N_EINFACH !== 'undefined' && I18N_EINFACH && Object.prototype.hasOwnProperty.call(I18N_EINFACH, k)) return I18N_EINFACH[k];
    return (I[l] && I[l][k]) || (I.de && I.de[k]) || k;
  }

  // ---------- Stimmen ----------
  function webStimmen() {
    var s = web(); if (!s) return [];
    try { var v = s.getVoices() || []; if (v.length) stimmenWeb = v; } catch (e) { /* kein Zugriff */ }
    return stimmenWeb || [];
  }
  function webStimme(code) {
    var v = webStimmen(), tags = BCP[code] || [code];
    var norm = function (x) { return String(x || '').replace('_', '-').toLowerCase(); };
    for (var i = 0; i < tags.length; i++) {
      var t = tags[i].toLowerCase();
      for (var j = 0; j < v.length; j++) if (norm(v[j].lang) === t) return v[j];
      if (t.indexOf('-') < 0) for (var k = 0; k < v.length; k++) if (norm(v[k].lang).split('-')[0] === t) return v[k];
    }
    return null;
  }
  // Ergebnis: true / false / null (noch unbekannt, z. B. Stimmen werden noch geladen)
  function verfuegbar(code) {
    code = code || appSprache();
    var m = motor();
    if (!m) return false;
    if (m === 'web') {
      if (webStimme(code)) return true;
      return webStimmen().length ? false : null;
    }
    var tags = BCP[code] || [code], unbekannt = false;
    for (var i = 0; i < tags.length; i++) {
      var r = nativPruef[tags[i]];
      if (r === true) return true;
      if (r === undefined) { unbekannt = true; nativFrage(tags[i]); }
    }
    return unbekannt ? null : false;
  }
  function nativTag(code) {
    var tags = BCP[code] || [code];
    for (var i = 0; i < tags.length; i++) if (nativPruef[tags[i]] === true) return tags[i];
    return tags[0];
  }
  function nativFrage(tag) {
    var P = nativ(); if (!P || nativPruef[tag] !== undefined) return;
    nativPruef[tag] = null; // Frage läuft
    try {
      Promise.resolve(P.isLanguageSupported({ lang: tag })).then(function (r) { nativPruef[tag] = !!(r && r.supported); alleAktualisieren(); },
        function () { nativPruef[tag] = false; alleAktualisieren(); });
    } catch (e) { nativPruef[tag] = false; }
  }

  // ---------- Text der Seite sammeln ----------
  function versteckt(el) {
    if (el.nodeType !== 1) return false;
    if (SKIP.test(el.tagName.toUpperCase())) return true;
    if (el.hidden || el.getAttribute('aria-hidden') === 'true' || el.getAttribute('data-vorlesen') === 'nein' || el.getAttribute('role') === 'navigation') return true;
    var p = el.parentElement;
    if (p && p.tagName === 'DETAILS' && !p.open && el.tagName !== 'SUMMARY') return true;
    try {
      var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
      if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) return true;
    } catch (e) { /* ohne Stilinfo: sichtbar */ }
    return false;
  }
  function nurInline(el) {
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
      if (versteckt(c)) continue;
      if (!INLINE.test(c.tagName.toUpperCase()) || !nurInline(c)) return false;
    }
    return true;
  }
  function textVon(el) {
    var out = '';
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) out += n.nodeValue;
      else if (n.nodeType === 1 && !versteckt(n)) out += (n.tagName === 'BR' ? ' ' : textVon(n));
    }
    return out;
  }
  function sauber(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function sammle(el, out) {
    if (versteckt(el)) return;
    if (nurInline(el)) { var s = sauber(textVon(el)); if (s) out.push({ el: el, text: s, sprache: spracheVon(el) }); return; }
    var lose = '';
    var fluss = function () { var x = sauber(lose); if (x) out.push({ el: el, text: x, sprache: spracheVon(el) }); lose = ''; };
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) lose += n.nodeValue;
      else if (n.nodeType === 1) {
        if (versteckt(n)) continue;
        if (INLINE.test(n.tagName.toUpperCase()) && nurInline(n)) lose += ' ' + textVon(n) + ' ';
        else { fluss(); sammle(n, out); }
      }
    }
    fluss();
  }
  function bloecke(wurzel) { var out = []; if (wurzel) sammle(wurzel, out); return out; }

  // Lange Absätze in Sätze teilen (manche Browser brechen lange Äußerungen nach etwa 15 Sekunden ab)
  function stuecke(text) {
    var saetze = text.split(/(?<=[.!?؟۔:;])\s+/), out = [], cur = '';
    saetze.forEach(function (s) {
      if (cur && (cur + ' ' + s).length > 220) { out.push(cur); cur = s; } else cur = cur ? cur + ' ' + s : s;
    });
    if (cur) out.push(cur);
    return out;
  }

  // ---------- Sprechen ----------
  var tempoMerk = null; // falls der Browser-Speicher fehlt (z. B. Datei ohne Herkunft): nur für diese Sitzung
  function tempo() { var v = tempoMerk; try { var x = window.localStorage.getItem('lotse.vorlesenTempo'); if (x) v = x; } catch (e) { /* kein Speicher */ } return v === 'langsam' ? 'langsam' : 'normal'; }
  function tempoSetzen(v) { tempoMerk = v; try { window.localStorage.setItem('lotse.vorlesenTempo', v); } catch (e) { /* kein Speicher */ } }

  function sprich(text, code) {
    var rate = TEMPO[tempo()];
    var P = nativ();
    if (P) return Promise.resolve(P.speak({ text: text, lang: nativTag(code), rate: rate, pitch: 1, volume: 1, queueStrategy: 0 }));
    var s = web();
    if (!s) return Promise.reject(new Error('keine Sprachausgabe'));
    return new Promise(function (ok, nein) {
      var u = new window.SpeechSynthesisUtterance(text);
      var v = webStimme(code);
      u.lang = v ? v.lang : (BCP[code] || [code])[0];
      if (v) u.voice = v;
      u.rate = rate;
      u.onend = function () { ok(); };
      u.onerror = function (e) { (e && (e.error === 'interrupted' || e.error === 'canceled')) ? ok() : nein(e); };
      s.speak(u);
    });
  }
  function markieren(el) {
    document.querySelectorAll('.vl-aktiv').forEach(function (x) { x.classList.remove('vl-aktiv'); });
    if (!el) return;
    el.classList.add('vl-aktiv');
    try { if (el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* alte Browser */ }
  }

  function stop() {
    var l = lauf; lauf = null;
    if (l) l.abbruch = true;
    try { var P = nativ(); if (P && P.stop) P.stop(); } catch (e) { /* egal */ }
    try { var s = web(); if (s) s.cancel(); } catch (e) { /* egal */ }
    markieren(null);
    alleAktualisieren();
  }

  // lesen(text | element[, leiste]): Text oder sichtbaren Inhalt eines Elements absatzweise vorlesen
  function lesen(ziel, leiste) {
    stop();
    var bl = typeof ziel === 'string' ? [{ el: null, text: sauber(ziel), sprache: appSprache() }] : bloecke(ziel);
    bl = bl.filter(function (b) { return b.text; });
    if (!bl.length || !motor()) return Promise.resolve(false);
    var l = { leiste: leiste || null, bloecke: bl, i: 0, abbruch: false };
    lauf = l; alleAktualisieren();
    var weiter = function () {
      if (l.abbruch) return Promise.resolve(false);
      if (l.i >= l.bloecke.length) { if (lauf === l) { lauf = null; markieren(null); alleAktualisieren(); } return Promise.resolve(true); }
      var b = l.bloecke[l.i];
      if (b.el && !b.el.isConnected) { l.i++; return weiter(); } // Seite hat sich geändert
      markieren(b.el);
      var code = verfuegbar(b.sprache) === false ? appSprache() : b.sprache;
      var teile = stuecke(b.text), k = 0;
      var naechstes = function () {
        if (l.abbruch) return Promise.resolve(false);
        if (k >= teile.length) { l.i++; return weiter(); }
        return sprich(teile[k++], code).then(naechstes);
      };
      return naechstes();
    };
    return weiter().catch(function () { if (lauf === l) stop(); return false; });
  }

  // ---------- Leiste mit Knopf ----------
  function stil() {
    if (document.getElementById('vl-stil')) return;
    var st = document.createElement('style');
    st.id = 'vl-stil';
    st.textContent =
      '.vl-leiste{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 14px}' +
      '.vl-knopf{display:inline-flex;align-items:center;gap:10px;min-height:56px;padding:10px 22px;font:inherit;font-size:1.15rem;font-weight:700;' +
      'border-radius:var(--r-ctl,14px);border:2px solid var(--petrol,#0b5f63);background:var(--petrol,#0b5f63);color:#fff;cursor:pointer}' +
      '.vl-knopf[aria-pressed="true"]{background:#fff;color:var(--petrol,#0b5f63)}' +
      '.vl-tempo{min-height:48px;padding:8px 16px;font:inherit;font-size:1rem;border-radius:var(--r-ctl,14px);border:2px solid currentColor;background:transparent;color:inherit;cursor:pointer}' +
      '.vl-knopf:focus-visible,.vl-tempo:focus-visible{outline:3px solid #f2b705;outline-offset:2px}' +
      '.vl-hinweis{font-size:1rem}' +
      '.vl-aktiv{outline:3px solid #f2b705;outline-offset:3px;background:rgba(242,183,5,.18);border-radius:6px}';
    (document.head || document.body).appendChild(st);
  }
  var SYM_LESEN = '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  var SYM_STOPP = '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';

  function aktualisieren(L) {
    var el = L.el;
    if (!el.isConnected) return;
    var m = motor();
    el.hidden = !m;
    if (!m) return;
    var ok = verfuegbar(appSprache());
    var knopf = el.querySelector('.vl-knopf'), tb = el.querySelector('.vl-tempo'), hin = el.querySelector('.vl-hinweis');
    var laeuft = !!(lauf && lauf.leiste === L);
    knopf.hidden = ok === false && !laeuft;
    tb.hidden = knopf.hidden;
    hin.hidden = ok !== false;
    hin.textContent = ok === false ? txt('vl.keineStimme') : '';
    knopf.setAttribute('aria-pressed', laeuft ? 'true' : 'false');
    knopf.innerHTML = (laeuft ? SYM_STOPP : SYM_LESEN) + '<span>' + esc(txt(laeuft ? 'vl.stopp' : 'vl.lesen')) + '</span>';
    knopf.setAttribute('aria-label', laeuft ? txt('vl.stopp') : txt('vl.aria'));
    tb.textContent = txt(tempo() === 'langsam' ? 'vl.tempo.langsam' : 'vl.tempo.normal');
  }
  function alleAktualisieren() {
    leisten = leisten.filter(function (L) { return L.el.isConnected; });
    leisten.forEach(aktualisieren);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // knopf(container[, {wurzel}]): Leiste oben in container einsetzen (einmal je Container). Gelesen wird wurzel (Standard: container).
  function knopf(container, opts) {
    if (!container || !container.ownerDocument) return null;
    stil();
    var vorhanden = null;
    for (var c = container.firstElementChild; c; c = c.nextElementSibling) if (c.classList && c.classList.contains('vl-leiste')) { vorhanden = c; break; }
    var L = null;
    leisten.forEach(function (x) { if (x.el === vorhanden) L = x; });
    if (!L) {
      var el = document.createElement('div');
      el.className = 'vl-leiste';
      el.setAttribute('data-vorlesen', 'nein');
      el.innerHTML = '<button type="button" class="vl-knopf" aria-pressed="false"></button>' +
        '<button type="button" class="vl-tempo"></button><span class="vl-hinweis" role="status" hidden></span>';
      container.insertBefore(el, container.firstChild);
      L = { el: el, container: container, wurzel: (opts && opts.wurzel) || container };
      el.querySelector('.vl-knopf').addEventListener('click', function () {
        if (lauf && lauf.leiste === L) stop(); else lesen(L.wurzel, L);
      });
      el.querySelector('.vl-tempo').addEventListener('click', function () {
        tempoSetzen(tempo() === 'langsam' ? 'normal' : 'langsam'); aktualisieren(L);
      });
      leisten.push(L);
    } else if (opts && opts.wurzel) L.wurzel = opts.wurzel;
    aktualisieren(L);
    return L.el;
  }

  // Sprache der App gewechselt: Vorlesen anhalten, Beschriftungen neu
  function beobachten() {
    try {
      var s = web();
      if (s && s.addEventListener) s.addEventListener('voiceschanged', function () { stimmenWeb = null; alleAktualisieren(); });
      else if (s) s.onvoiceschanged = function () { stimmenWeb = null; alleAktualisieren(); };
    } catch (e) { /* egal */ }
    try {
      if (window.MutationObserver) new window.MutationObserver(function () { if (lauf) stop(); else alleAktualisieren(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    } catch (e) { /* egal */ }
    try { window.addEventListener('pagehide', stop); } catch (e) { /* egal */ }
  }
  if (typeof document !== 'undefined') beobachten();

  return {
    knopf: knopf, lesen: function (z) { return lesen(z, null); }, stop: stop, verfuegbar: verfuegbar,
    uebersetzer: function (f) { tFn = typeof f === 'function' ? f : null; alleAktualisieren(); },
    aktualisieren: alleAktualisieren,
    // für Tests
    _bloecke: bloecke, _bcp: BCP, _laeuft: function () { return !!lauf; }
  };
})();
if (typeof window !== 'undefined') window.VORLESEN = VORLESEN;
if (typeof module !== 'undefined') module.exports = VORLESEN;
