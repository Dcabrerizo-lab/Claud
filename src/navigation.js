// Einheitliche Navigation in Ebenen (für alle Ansichten und Unterseiten der App).
// - Die App beschreibt, wo man gerade ist: ebene() = { pfad: 'sparen/schulden', tiefe: 2 }. Start hat Tiefe 0.
// - „Eine Ebene hoch“ macht immer die App selbst (hoch()); diese Datei ruft es auf für den Zurück-Knopf oben links,
//   die Zurück-Taste von Android, Browser-Zurück und das seitliche Wischen auf dem iPhone.
// - Verlauf: Jede tiefere Ebene bekommt einen Eintrag im Browser-Verlauf (History API, pushState). Geht die App
//   eine Ebene hoch, geht der Verlauf mit (history.go), damit Browser-Zurück und Wischen genau eine Ebene hoch führen
//   und Vorwärts (Wischen vom rechten Rand, Browser-Vorwärts) die Ebene wieder öffnet (vor()).
// - Gemeinsamer Zurück-Knopf: kopfHtml() (beim Bauen in die Vorlage eingesetzt, Marke <!--ZURUECK-->) und kopf()
//   (zur Laufzeit). Aussehen wie im Pflege-Assistenten: Textknopf „← Zurück“ oben links in einer Kopfzeile.
var Navigation = (function () {
  'use strict';

  // ---------- Gemeinsamer Zurück-Knopf ----------
  function attr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // o: { id: Knopf-ID, cls: weitere Klassen am Knopf, kid: ID der Kopfzeile, hidden: Kopfzeile zuerst versteckt,
  //     eigen: der Knopf hat einen eigenen Klick (Schritt zurück in einer Fragenfolge), nicht über zurueck() }
  function kopfHtml(o) {
    o = o || {};
    return '<div class="pa-zeile nav-kopf"' + (o.kid ? ' id="' + attr(o.kid) + '"' : '') + (o.hidden ? ' hidden' : '') + '>' +
      '<button type="button" class="linkbtn pa-zur' + (o.cls ? ' ' + attr(o.cls) : '') + '"' + (o.id ? ' id="' + attr(o.id) + '"' : '') + (o.eigen ? '' : ' data-nav-zurueck') + '>' +
      '<span class="nav-pfeil" aria-hidden="true">←</span> <span data-t="nav.zurueck">Zurück</span></button></div>';
  }
  // Dasselbe als Element (ohne innerHTML); t: Übersetzungsfunktion der App
  function kopf(doc, t, o) {
    o = o || {}; doc = doc || document;
    var z = doc.createElement('div'); z.className = 'pa-zeile nav-kopf'; if (o.kid) z.id = o.kid; if (o.hidden) z.hidden = true;
    var b = doc.createElement('button'); b.type = 'button'; b.className = 'linkbtn pa-zur' + (o.cls ? ' ' + o.cls : ''); if (o.id) b.id = o.id;
    b.setAttribute('data-nav-zurueck', '');
    var p = doc.createElement('span'); p.className = 'nav-pfeil'; p.setAttribute('aria-hidden', 'true'); p.textContent = '←';
    var s = doc.createElement('span'); s.setAttribute('data-t', 'nav.zurueck'); s.textContent = t ? t('nav.zurueck') : 'Zurück';
    b.appendChild(p); b.appendChild(doc.createTextNode(' ')); b.appendChild(s); z.appendChild(b);
    return z;
  }
  // Marken in der Vorlage ersetzen: <!--ZURUECK--> oder <!--ZURUECK id=briefZurueck cls=us-zurueck kid=briefeKopf hidden=1-->
  function vorlage(html) {
    return html.replace(/<!--ZURUECK((?:\s+[a-z]+=[A-Za-z0-9_-]+)*)\s*-->/g, function (m, a) {
      var o = {}; (a.match(/[a-z]+=[A-Za-z0-9_-]+/g) || []).forEach(function (x) { var i = x.indexOf('='); o[x.slice(0, i)] = x.slice(i + 1); });
      return kopfHtml(o);
    });
  }

  // ---------- Ebenen und Verlauf ----------
  var app = null, st = [], k = 0, sitzung = '', warte = null, geplant = false;
  function zustand(e, i) { return { solo: sitzung, i: i, t: e.tiefe, p: e.pfad }; }
  function adresse(e) { return '#' + String(e.pfad).split('/')[0]; }
  function setze(art, e, i) { try { history[art](zustand(e, i), '', adresse(e)); } catch (x) { /* ohne Verlauf (z. B. file: in alten WebViews) */ } }
  function gleich(a, b) { return a && b && a.pfad === b.pfad && a.tiefe === b.tiefe; }

  // Stand der App mit dem Verlauf abgleichen. nachVor: nach Vorwärts nicht zurückspringen, nur ersetzen.
  function abgleich(nachVor) {
    if (!app) return;
    if (warte) { warte.nochmal = true; return; }
    var e = app.ebene(), cur = st[k], hs = null;
    try { hs = history.state; } catch (x) { /* ohne Verlauf */ }
    // Ein Link (#ansicht) hat einen eigenen Eintrag angelegt: übernehmen statt einen weiteren anzulegen
    if (!(hs && hs.solo === sitzung)) { k++; st.length = k; st[k] = e; setze('replaceState', e, k); return; }
    if (gleich(e, cur)) { if (location.hash !== adresse(e)) setze('replaceState', e, k); return; }
    if (e.tiefe > cur.tiefe) { k++; st.length = k; st[k] = e; setze('pushState', e, k); return; }
    if (e.tiefe === cur.tiefe || nachVor || k === 0) { st[k] = e; setze('replaceState', e, k); return; }
    // höher: im Verlauf zurück bis zum Eintrag dieser Ebene (größter Eintrag mit Tiefe <= neue Tiefe)
    var j = k - 1; while (j > 0 && st[j].tiefe > e.tiefe) j--;
    warte = { e: e, j: j, nochmal: false };
    setTimeout(function () { if (warte && warte.e === e) { warte = null; k = j; st[k] = e; st.length = k + 1; setze('replaceState', e, k); } }, 1500); // falls kein popstate kommt
    try { history.go(j - k); } catch (x) { warte = null; st[k] = e; setze('replaceState', e, k); }
  }
  function planen() {
    if (geplant || !app) return;
    geplant = true;
    setTimeout(function () { geplant = false; abgleich(false); }, 0);
  }
  function beiPop(ev) {
    var s = ev.state;
    var unser = s && s.solo === sitzung && typeof s.i === 'number';
    if (warte) {
      var w = warte; warte = null;
      k = unser ? s.i : w.j; // fremder Eintrag (z. B. von einem Link #…): übernehmen
      st[k] = w.e; st.length = Math.max(st.length, k + 1); setze('replaceState', w.e, k);
      if (w.nochmal) planen();
      return;
    }
    if (!unser) return; // fremder Eintrag (vor dem Start der App): die App folgt dann der Adresse (hashchange)
    var n = s.i;
    if (n < k) {
      var schritte = k - n; k = n; st[n] = { pfad: s.p, tiefe: s.t };
      for (var i = 0; i < schritte; i++) if (!eineEbeneHoch()) break;
      abgleich(false);
    } else if (n > k) {
      k = n; st[n] = { pfad: s.p, tiefe: s.t };
      if (app.vor) try { app.vor(s.p); } catch (x) { /* Ebene nicht mehr da */ }
      abgleich(true);
    }
  }
  // Erst offene Blätter und Dialoge schließen, dann eine Ebene hoch
  function eineEbeneHoch() { return !!((app.schliessen && app.schliessen()) || app.hoch()); }
  // Zurück-Knopf, Android-Taste, Rand-Wischen: eine Ebene hoch. false: schon ganz oben (Start)
  function zurueck() {
    if (!app) return false;
    if (!eineEbeneHoch()) return false;
    abgleich(false);
    return true;
  }

  // Rückfall für die iPhone-App, wenn das native Wischen fehlt: Wischen vom linken Rand = zurück, vom rechten Rand = vorwärts
  // (bei Schrift von rechts nach links umgekehrt, wie unter iOS)
  function randWischen() {
    var RAND = 24, WEG = 70, x0 = 0, y0 = 0, seite = '';
    document.addEventListener('touchstart', function (ev) {
      seite = '';
      if (!ev.touches || ev.touches.length !== 1) return;
      var p = ev.touches[0], b = window.innerWidth || 0;
      x0 = p.clientX; y0 = p.clientY;
      seite = x0 <= RAND ? 'links' : (b && x0 >= b - RAND ? 'rechts' : '');
    }, { passive: true });
    document.addEventListener('touchend', function (ev) {
      if (!seite || !ev.changedTouches || !ev.changedTouches.length) { seite = ''; return; }
      var p = ev.changedTouches[0], weit = seite === 'links' ? p.clientX - x0 : x0 - p.clientX, quer = Math.abs(p.clientY - y0);
      var rtl = document.documentElement.getAttribute('dir') === 'rtl', zur = (seite === 'links') !== rtl;
      seite = '';
      if (weit < WEG || quer > weit * 0.6) return;
      if (zur) zurueck(); else try { history.forward(); } catch (x) { /* kein Verlauf */ }
    }, { passive: true });
  }

  // a: { ebene(), hoch(), vor(pfad), schliessen(), randWischen }
  function init(a) {
    app = a;
    sitzung = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    st = [app.ebene()]; k = 0; warte = null;
    setze('replaceState', st[0], 0);
    window.addEventListener('popstate', beiPop);
    // ein Knopf für alle Zurück-Knöpfe; andere Klicks können die Ebene ändern: danach abgleichen
    document.addEventListener('click', function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest('[data-nav-zurueck]') : null;
      if (b && !b.disabled) { ev.preventDefault(); zurueck(); return; }
      planen();
    });
    document.addEventListener('change', planen);
    if (a.randWischen) randWischen();
  }

  return {
    kopfHtml: kopfHtml, kopf: kopf, vorlage: vorlage, init: init, zurueck: zurueck, melde: planen, abgleich: abgleich,
    tiefe: function () { return st[k] ? st[k].tiefe : 0; },
    stand: function () { return { k: k, st: JSON.parse(JSON.stringify(st)), warte: !!warte }; }
  };
})();
if (typeof module !== 'undefined') module.exports = Navigation;
