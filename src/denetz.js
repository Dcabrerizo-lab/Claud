// Sicherheitsnetz für Übersetzungen (David, 21.11.2026): Ist eine Fremdsprache gewählt, steht unter wichtigen Sätzen
// (Fristen, Warnungen, Ausschlüsse, Rechtshinweis, Schritte in „Es ist dringend“, Beträge mit Bedingung) klein der deutsche
// Originalsatz, z. B. „Deutsch: Du hast 2 Wochen Zeit für den Widerspruch.“ Nicht bei Deutsch und nicht bei Einfacher Sprache.
// Was „wichtig“ ist, steht an EINER Stelle: src/lang/denetz/wichtig.json (beim Bauen hier eingesetzt, Marke WICHTIG).
// So funktioniert es: t() in src/app.js meldet jeden übersetzten Text mit Schlüssel und Parametern (merke). Nach jeder
// Änderung im DOM sucht ein MutationObserver Textelemente, deren Text genau so ein gemerkter Text ist, und setzt darunter
// eine Zeile <small class="de-netz" lang="de" dir="ltr">. Der deutsche Text wird mit denselben Parametern gebildet.
// Nur textContent, kein innerHTML. Schalter: Einstellungen → Anzeige → „Wichtige Sätze auch auf Deutsch zeigen“ (Standard an).
(function () {
  var W = /*WICHTIG*/null;
  if (!W) W = { textmuster: '', schluessel: [], nie: [], bereiche: [], ausnahmen: [] };
  var ctx = null; // { lang(), de(key, p, ohnePara), t(key), wurzel() }
  var an = true;
  var merk = new Map(); // angezeigter (übersetzter) Text -> { k: Schlüssel, p: Parameter, o: ohne Paragrafen, w: wichtig }
  var MAX = 8000;
  var wichtig = null; // Schlüssel -> true
  var zeileVon = new WeakMap(); // Textelement -> seine deutsche Zeile
  var quelleVon = new WeakMap(); // deutsche Zeile -> Textelement
  var obs = null;
  var BEREICH = W.bereiche.join(', ');
  var AUSNAHME = W.ausnahmen.join(', ');
  var TEXT_TAGS = { P: 1, LI: 1, SPAN: 1, B: 1, STRONG: 1, EM: 1, H2: 1, H3: 1, H4: 1, DIV: 1, SMALL: 1, TD: 1, DD: 1, DT: 1, SUMMARY: 1 };
  var BLOCK = { P: 1, DIV: 1, UL: 1, OL: 1, LI: 1, DETAILS: 1, SECTION: 1, ARTICLE: 1, H2: 1, H3: 1, H4: 1, TABLE: 1, FORM: 1, FIELDSET: 1, HEADER: 1, DL: 1 };
  var INNEN = { SUMMARY: 1, LI: 1, TD: 1, DD: 1, DT: 1 }; // Zeile kommt ans Ende des Elements statt dahinter (gültiges HTML, sichtbar bei zugeklappten Details)

  function istWichtig(k) {
    if (!wichtig) {
      wichtig = {};
      var text = W.textmuster ? new RegExp(W.textmuster) : null;
      var sch = W.schluessel.map(function (r) { return new RegExp(r); });
      var nie = W.nie.map(function (r) { return new RegExp(r); });
      var de = (typeof I18N !== 'undefined' && I18N.de) || {};
      Object.keys(de).forEach(function (key) {
        var v = de[key];
        if (typeof v !== 'string' || !v) return;
        if (nie.some(function (r) { return r.test(key); })) return;
        if (sch.some(function (r) { return r.test(key); }) || (text && text.test(v))) wichtig[key] = true;
      });
    }
    return wichtig[k] === true;
  }

  function aktiv() { return !!ctx && an && ctx.lang() !== 'de'; }

  function setze(s, e) {
    s = String(s).replace(/\s+/g, ' ').trim();
    if (s.length < 3) return;
    var alt = merk.get(s);
    if (alt && alt.w && !e.w) return; // gleicher Text aus einem wichtigen Schlüssel bleibt wichtig
    if (alt) merk.delete(s);
    merk.set(s, e);
    if (merk.size > MAX) merk.delete(merk.keys().next().value);
  }
  // Von t() in src/app.js: jeder übersetzte Text (nur bei Fremdsprache und eingeschaltetem Netz)
  function merke(key, s, p) {
    if (!aktiv() || typeof s !== 'string' || !s) return;
    var w = istWichtig(key);
    setze(s, { k: key, p: p, w: w });
    var o = typeof Fmt !== 'undefined' && Fmt.ohnePara ? Fmt.ohnePara(s) : s; // tL(): ohne Paragrafen (Laienansicht)
    if (o !== s) setze(o, { k: key, p: p, o: true, w: w });
  }

  function eigenText(el) {
    var s = '';
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) s += n.nodeValue;
      else if (n.nodeType === 1 && !n.classList.contains('de-netz') && n.getAttribute('aria-hidden') !== 'true') s += eigenText(n); // Symbole (ⓘ, aria-hidden) und eigene Zeilen zählen nicht
    }
    return s.replace(/\s+/g, ' ').trim();
  }
  function hatBlockKind(el) {
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) if (BLOCK[c.tagName]) return true;
    return false;
  }
  function entferne(z) { if (z && z.parentNode) z.parentNode.removeChild(z); }
  function istDeutsch(el) { var l = el.closest('[lang]'); return !!l && /^de\b/.test(l.getAttribute('lang')) && l !== ctx.wurzel(); }

  function zeileBauen(de) {
    var z = document.createElement('small');
    z.className = 'de-netz';
    z.setAttribute('lang', 'de');
    z.setAttribute('dir', 'ltr');
    z.setAttribute('data-de', de);
    var l = ctx.lang(), v = document.createElement('span');
    v.className = 'de-netz-v';
    v.setAttribute('lang', l); // Vorsilbe in der App-Sprache (Screenreader liest sie in dieser Sprache)
    v.setAttribute('dir', (I18N[l] && I18N[l]['meta.dir']) || 'ltr');
    v.textContent = ctx.t('dn.vorsilbe');
    var d = document.createElement('span');
    d.textContent = de;
    z.appendChild(v); z.appendChild(document.createTextNode(' ')); z.appendChild(d);
    return z;
  }

  function pruefe(el) {
    if (!el || el.nodeType !== 1 || !TEXT_TAGS[el.tagName]) return;
    if (el.closest('.de-netz')) return;
    var alt = zeileVon.get(el);
    if (alt && !alt.isConnected) { zeileVon.delete(el); alt = null; }
    var weg = function () { if (alt) { entferne(alt); zeileVon.delete(el); } };
    if (hatBlockKind(el)) return weg();
    var txt = eigenText(el), e = txt && merk.get(txt);
    if (!e) return weg();
    var pa = el.parentElement; // <summary><span>Satz</span></summary>, <p><b>Satz</b></p>: die Zeile gehört zum äußeren Element, nicht doppelt
    if (pa && TEXT_TAGS[pa.tagName] && !hatBlockKind(pa) && eigenText(pa) === txt) return weg();
    var imBereich = !!(BEREICH && el.closest(BEREICH));
    if (!e.w && (!imBereich || /^(SUMMARY|H2|H3|H4)$/.test(el.tagName))) return weg(); // Überschriften wie „Frist“ brauchen keine Zeile
    if ((AUSNAHME && el.closest(AUSNAHME)) || istDeutsch(el)) return weg();
    var de = ctx.de(e.k, e.p, e.o);
    de = String(de || '').replace(/\s+/g, ' ').trim();
    if (!de || de === txt) return weg(); // Übersetzung fehlt (deutscher Text steht schon da)
    if (alt && alt.getAttribute('data-de') === de) return;
    weg();
    var z = zeileBauen(de);
    if (el.tagName === 'SUMMARY') { // Summary ist eine Flex-Zeile: Zeile in das innerste Element mit dem Satz (z. B. .tipp-kurz), damit sie darunter steht
      var ziel = el, c;
      do { c = null; for (var k = ziel.firstElementChild; k; k = k.nextElementSibling) if (!k.classList.contains('de-netz') && eigenText(k) === txt) { c = k; break; } if (c) ziel = c; } while (c);
      ziel.appendChild(z);
    } else if (INNEN[el.tagName]) el.appendChild(z); else el.parentNode.insertBefore(z, el.nextSibling);
    zeileVon.set(el, z); quelleVon.set(z, el);
  }

  // Verwaiste Zeilen (Textelement weg oder geändert) aufräumen
  function aufraeumen(root) {
    root.querySelectorAll('.de-netz').forEach(function (z) {
      var q = quelleVon.get(z);
      if (!q || !q.isConnected || zeileVon.get(q) !== z) entferne(z);
    });
  }
  function lauf(root) {
    if (!root || root.nodeType !== 1) return;
    if (!aktiv()) { alleWeg(); return; }
    pruefe(root);
    root.querySelectorAll('p, li, span, b, strong, em, h2, h3, h4, div, small, td, dd, dt, summary').forEach(pruefe);
    aufraeumen(root);
  }
  function alleWeg() { var w = ctx && ctx.wurzel(); if (w) w.querySelectorAll('.de-netz').forEach(entferne); }

  function nurNetz(nodes) {
    for (var i = 0; i < nodes.length; i++) { var n = nodes[i]; if (!(n.nodeType === 1 && n.classList.contains('de-netz'))) return false; }
    return true;
  }
  function beobachten(records) {
    if (!aktiv()) return;
    var ziele = [];
    records.forEach(function (r) {
      var t = r.type === 'characterData' ? r.target.parentElement : r.target;
      if (!t || t.nodeType !== 1 || (t.closest && t.closest('.de-netz'))) return;
      if (r.type === 'childList' && nurNetz(r.addedNodes) && nurNetz(r.removedNodes)) return; // eigene Zeilen
      if (ziele.indexOf(t) < 0) ziele.push(t);
    });
    ziele.forEach(function (t) {
      if (!t.isConnected) return;
      lauf(t);
      for (var a = t.parentElement, i = 0; a && i < 3; a = a.parentElement, i++) pruefe(a); // Text in <b> geändert: der Absatz zählt
      if (t.parentElement) aufraeumen(t.parentElement);
    });
    if (obs) obs.takeRecords(); // eigene Änderungen nicht noch einmal ansehen
  }

  function init(c) {
    ctx = c;
    if (typeof MutationObserver !== 'undefined' && !obs) {
      obs = new MutationObserver(beobachten);
      obs.observe(ctx.wurzel(), { childList: true, subtree: true, characterData: true });
    }
  }
  // Sprache gewechselt: alte Texte vergessen (applyLang zeichnet danach alles neu)
  function sprache() { merk.clear(); if (!aktiv()) alleWeg(); }
  function setzeAn(x) { an = !!x; if (!an) alleWeg(); else if (ctx) lauf(ctx.wurzel()); }

  window.DeNetz = { init: init, merke: merke, sprache: sprache, an: function () { return an; }, setzeAn: setzeAn, alles: function () { if (ctx) lauf(ctx.wurzel()); }, istWichtig: istWichtig };
})();

// Deutsch gebliebene Teile auszeichnen (UX-Audit, WCAG 3.1.2 „Sprache von Teilen“): Einige Bereiche gibt es nur auf Deutsch
// (Brief prüfen: Formular, Ergebnis, Widerspruch; welche Bereiche, legt src/app.js fest). Ist eine andere Sprache gewählt,
// bekommt jeder rein deutsche Block lang="de" dir="ltr": Bildschirmleser lesen ihn deutsch, und in Arabisch, Farsi oder Paschtu
// steht er links nach rechts (sonst falsch gesetzt, z. B. „Abs. 3 SGB II 21 §“, Punkt am Satzanfang).
// Woher die App weiß, was übersetzt ist: t() in src/app.js meldet jeden übersetzten Text (merke). Elemente mit data-t sind übersetzt.
// Text in nicht lateinischer Schrift (Arabisch, Kyrillisch …) ist nie deutsch. Übrig bleibt lateinischer Text, der nicht als
// Übersetzung gemeldet wurde: der deutsche Text. Ausgezeichnet wird jeweils der größte Block ohne übersetzten Inhalt.
// Gemischte Zeilen (Knopf übersetzt, Zähler deutsch) bleiben in App-Richtung; nur ihre deutschen Teile werden ausgezeichnet.
(function () {
  var ctx = null; // { lang(), bereiche(): Elemente }
  var uebersetzt = new Set();
  var MAX = 20000;
  var geplant = null, obs = null;
  var MARKE = 'data-nur-de';
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, TEMPLATE: 1, svg: 1, SVG: 1 };
  var FREMD = /[\u0370-\u03FF\u0400-\u052F\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/; // Griechisch, Kyrillisch, Hebräisch, Arabisch
  var LATEIN = /[A-Za-zÄÖÜäöüß]{2,}/;

  function norm(x) { return String(x).replace(/\s+/g, ' ').trim(); }
  function merke(s) {
    if (typeof s !== 'string') return;
    var n = norm(s); if (!n) return;
    uebersetzt.add(n);
    var o = typeof Fmt !== 'undefined' && Fmt.ohnePara ? norm(Fmt.ohnePara(s)) : n; if (o !== n) uebersetzt.add(o); // tL(): ohne Paragrafen
    if (uebersetzt.size > MAX) uebersetzt.delete(uebersetzt.values().next().value);
  }
  // 0 = kein Text, 1 = deutsch, 2 = übersetzt (oder schon ausgezeichnet in anderer Sprache)
  function textArt(s) {
    var n = norm(s);
    if (!n || !LATEIN.test(n)) return FREMD.test(n) ? 2 : 0;
    if (FREMD.test(n) || uebersetzt.has(n)) return 2;
    return 1;
  }
  // Art eines Elements; merkt sich die Art für den zweiten Durchgang
  function art(el, arten) {
    if (SKIP[el.tagName] || el.classList.contains('de-netz')) { arten.set(el, 0); return 0; }
    var a = 0;
    var l = el.hasAttribute(MARKE) ? null : el.getAttribute('lang');
    if (el.hasAttribute('data-t') || (l && !/^de\b/.test(l))) a = 2;
    else if (l) a = 1; // schon von der App als deutsch ausgezeichnet
    else if (uebersetzt.has(norm(el.textContent))) a = 2;
    else {
      for (var n = el.firstChild; n; n = n.nextSibling) {
        var b = n.nodeType === 3 ? textArt(n.nodeValue) : n.nodeType === 1 ? art(n, arten) : 0;
        if (b > a) a = b;
      }
    }
    arten.set(el, a);
    return a;
  }
  function auszeichnen(el, arten) {
    var a = arten.get(el);
    if (a === 1) { if (!el.hasAttribute('lang')) { el.setAttribute('lang', 'de'); el.setAttribute('dir', 'ltr'); el.setAttribute(MARKE, ''); } return; }
    if (a !== 2) return;
    for (var c = el.firstElementChild; c; c = c.nextElementSibling) auszeichnen(c, arten);
  }
  function weg(root) {
    root.querySelectorAll('[' + MARKE + ']').forEach(function (e) { e.removeAttribute('lang'); e.removeAttribute('dir'); e.removeAttribute(MARKE); });
    if (root.hasAttribute(MARKE)) { root.removeAttribute('lang'); root.removeAttribute('dir'); root.removeAttribute(MARKE); }
  }
  function lauf() {
    geplant = null;
    if (!ctx) return;
    var de = ctx.lang() === 'de';
    ctx.bereiche().forEach(function (root) {
      if (!root) return;
      weg(root);
      if (de) return;
      var arten = new Map();
      art(root, arten);
      auszeichnen(root, arten);
    });
    if (obs) obs.takeRecords();
  }
  function planen() { if (!geplant) geplant = setTimeout(lauf, 30); }
  function init(c) {
    ctx = c;
    if (typeof MutationObserver === 'undefined') return;
    obs = new MutationObserver(planen);
    ctx.bereiche().forEach(function (root) { if (root) obs.observe(root, { childList: true, subtree: true, characterData: true }); });
    planen(); // schon gezeichnete Bereiche (Start in einer Fremdsprache)
  }
  // Sprache gewechselt: nach dem Neuzeichnen neu auszeichnen. Gemerkte Übersetzungen bleiben (Teile, die nicht neu gezeichnet
  // werden, stehen noch in der alten Sprache und sind trotzdem kein Deutsch)
  function sprache() { planen(); }

  window.NurDeutsch = { init: init, merke: merke, sprache: sprache, jetzt: lauf, uebersetzt: function (s) { return uebersetzt.has(norm(s)); } };
})();
