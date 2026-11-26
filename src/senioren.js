// SoLo für Rente & Pflege (Senioren-Variante): Seiten für pflegende Angehörige und den Pflegegrad-Antrag.
// Schnittstelle: SENIOREN.render(id, container, opt)  id: 'sen-antrag' | 'sen-angehoerige' | 'sen-selbst'
//   opt.navigiere(ziel)  optional; ziel: 'sen-antrag' | 'pflege-einschaetzen' | 'check' | 'karte:<id>'.
//   Ohne opt.navigiere wird ein Ereignis 'sen-navigiere' (detail.ziel) am container ausgelöst.
// Texte: src/lang/senioren/<Sprache>.json (Schlüssel „sen.*“), Einfache Sprache: src/lang/einfach/senioren.json.
// Beträge: vorhandene Werte aus den Rechenregeln (Rules.RULES), keine doppelte Wahrheit. Nur Werte, die es dort nicht gibt, stehen in WERTE
// mit Rechtsgrundlage und Quelle (docs/entwuerfe/senioren-quellen.md). Nur geltendes Recht (Stand 24.11.2026).
// Alle Texte nur per textContent (nie HTML von außen); Symbole sind feste SVG-Pfade.
var SENIOREN = (function () {
  'use strict';

  // Werte, die es in rules.js nicht gibt. Am 24.11.2026 gegen den amtlichen Wortlaut geprüft (gesetze-im-internet.de), siehe Quellen-Datei.
  var WERTE = {
    beratungTage: { wert: 14, recht: '§ 7b Abs. 1 Satz 1 SGB XI', quelle: 'https://www.gesetze-im-internet.de/sgb_11/__7b.html' },
    bescheidArbeitstage: { wert: 25, recht: '§ 18c Abs. 1 Satz 1 SGB XI', quelle: 'https://www.gesetze-im-internet.de/sgb_11/__18c.html' },
    verzugJeWoche: { wert: 70, recht: '§ 18c Abs. 5 Satz 1 und 2 SGB XI', quelle: 'https://www.gesetze-im-internet.de/sgb_11/__18c.html' },
    widerspruchMonate: { wert: 1, recht: '§ 84 Abs. 1 Satz 1 SGG', quelle: 'https://www.gesetze-im-internet.de/sgg/__84.html' },
    akutTage: { wert: 10, recht: '§ 2 Abs. 1 PflegeZG (Fernbleiben), § 44a Abs. 3 Satz 1 und 2 SGB XI (Pflegeunterstützungsgeld je Kalenderjahr)', quelle: 'https://www.gesetze-im-internet.de/sgb_11/__44a.html' },
    pugProzent: { wert: 90, recht: '§ 44a Abs. 3 Satz 4 SGB XI i. V. m. § 45 Abs. 2 Satz 3 bis 5 SGB V', quelle: 'https://www.gesetze-im-internet.de/sgb_5/__45.html' },
    pflegezeitMonate: { wert: 6, recht: '§ 4 Abs. 1 Satz 1 PflegeZG', quelle: 'https://www.gesetze-im-internet.de/pflegezg/__4.html' },
    pflegezeitBeschaeftigte: { wert: 15, recht: '§ 3 Abs. 1 Satz 2 PflegeZG', quelle: 'https://www.gesetze-im-internet.de/pflegezg/__3.html' },
    pflegezeitAnkuendigung: { wert: 10, recht: '§ 3 Abs. 3 Satz 1 PflegeZG', quelle: 'https://www.gesetze-im-internet.de/pflegezg/__3.html' },
    letzteLebensphaseMonate: { wert: 3, recht: '§ 3 Abs. 6 Satz 1, § 4 Abs. 3 Satz 2 PflegeZG', quelle: 'https://www.gesetze-im-internet.de/pflegezg/__4.html' },
    fpzMonate: { wert: 24, recht: '§ 2 Abs. 1 Satz 1 und Abs. 2 FPfZG, § 4 Abs. 1 Satz 4 PflegeZG', quelle: 'https://www.gesetze-im-internet.de/fpfzg/__2.html' },
    fpzBeschaeftigte: { wert: 25, recht: '§ 2 Abs. 1 Satz 4 FPfZG', quelle: 'https://www.gesetze-im-internet.de/fpfzg/__2.html' },
    fpzStunden: { wert: 15, recht: '§ 2 Abs. 1 Satz 2 FPfZG', quelle: 'https://www.gesetze-im-internet.de/fpfzg/__2.html' },
    fpzAnkuendigungWochen: { wert: 8, recht: '§ 2a Abs. 1 Satz 1 FPfZG', quelle: 'https://www.gesetze-im-internet.de/fpfzg/__2a.html' },
    rvStunden: { wert: 10, recht: '§ 19 Satz 2, § 44 Abs. 1 Satz 2 SGB XI, § 3 Satz 1 Nr. 1a SGB VI', quelle: 'https://www.gesetze-im-internet.de/sgb_11/__19.html' },
    rvTage: { wert: 2, recht: '§ 19 Satz 2 SGB XI', quelle: 'https://www.gesetze-im-internet.de/sgb_11/__19.html' },
    rvArbeitMax: { wert: 30, recht: '§ 3 Satz 3 SGB VI, § 44 Abs. 1 Satz 1 SGB XI', quelle: 'https://www.gesetze-im-internet.de/sgb_6/__3.html' }
  };
  var STAND = '24.11.2026';
  // Bundesweit feste Nummer: Bürgertelefon des BMG, Pflegeversicherung (Quelle: bundesgesundheitsministerium.de/service/buergertelefon)
  var BMG_TEL = { anzeige: '030 340 60 66-02', tel: '+4930340606602', quelle: 'https://www.bundesgesundheitsministerium.de/service/buergertelefon' };

  // Karten im Leistungs-Check, die für Menschen in Rente oder mit voller Erwerbsminderung am häufigsten passen (ids aus test/karten.js)
  var KARTEN_SELBST = ['pflege', 'gsa', 'wohngeld', 'hzp', 'ausweis', 'pausch', 'rundfunk', 'zuzahl', 'lpg', 'blindengeld', 'emrente', 'srente'];

  var SYM = {
    telefon: '<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    person: '<circle cx="12" cy="7" r="3"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
    liste: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    post: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    waage: '<path d="M12 4v16M6 20h12M5 7h14"/><path d="M5 7l-3 6h6zM19 7l-3 6h6z"/>',
    weiter: '<path d="M4 12h14M13 6l6 6-6 6"/>',
    haus: '<path d="M4 11l8-6 8 6v9H4z"/><path d="M10 20v-5h4v5"/>',
    kalender: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    schild: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/>',
    geld: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    herz: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    warn: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>'
  };

  function R() { return (typeof Rules !== 'undefined' && Rules.RULES) || null; }
  function t(k, p) {
    var s = window.SoloMehr && window.SoloMehr.t ? window.SoloMehr.t(k, p) : null;
    if (s != null) return s;
    // Rückfall (z. B. im Test ohne App): deutscher Text aus I18N, Platzhalter ersetzen
    var d = (typeof I18N !== 'undefined' && I18N.de && I18N.de[k]) || k;
    return String(d).replace(/\{(\w+)\}/g, function (m, n) { return p && p[n] != null ? p[n] : m; });
  }
  function euro(x) { return Number(x).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €'; }
  function w(id) { return String(WERTE[id].wert); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // Aufklapp-Karte wie tippEl in app.js (details.mehr.tipp): Symbol + kurzer Satz, ausführlicher Text darunter
  function karte(key, sym, p, extra) {
    var d = el('details', 'mehr tipp'); d.setAttribute('data-sen', key);
    var s = el('summary');
    var sy = el('span', 'tipp-sym'); sy.setAttribute('aria-hidden', 'true');
    sy.innerHTML = '<svg viewBox="0 0 24 24">' + (SYM[sym] || SYM.liste) + '</svg>'; // feste Pfade aus SYM
    s.appendChild(sy); s.appendChild(el('span', 'tipp-kurz', t(key + '.kurz', p))); d.appendChild(s);
    d.appendChild(el('p', null, t(key, p)));
    (extra || []).forEach(function (x) { d.appendChild(x); });
    return d;
  }
  function navKnopf(ziel, text, container, opt) {
    var b = el('button', 'btn sen-weiter', text); b.type = 'button'; b.setAttribute('data-sen-ziel', ziel);
    b.addEventListener('click', function () {
      if (opt && typeof opt.navigiere === 'function') opt.navigiere(ziel);
      else container.dispatchEvent(new CustomEvent('sen-navigiere', { bubbles: true, detail: { ziel: ziel } }));
    });
    return b;
  }
  function quellen() {
    return window.SoloMehr && window.SoloMehr.quellen ? window.SoloMehr.quellen([t('sen.stand', { stand: STAND })]) : el('p', 'small muted', t('sen.stand', { stand: STAND }));
  }
  function abschnitt(box, key) { var h = el('h3', 'sen-abschnitt', t(key)); box.appendChild(h); }
  // Text, den nur die App mitbringt (Oberflächentexte „sux.*“ der Pflege-Variante); fehlt er, bleibt die Stelle leer
  function tApp(k, p) { var s = window.SoloMehr && window.SoloMehr.t ? window.SoloMehr.t(k, p) : null; return s == null ? '' : s; }
  // Antippbare Zeile in derselben Form wie die anderen Unterseiten (.weg: Symbol, Titel, kurze Unterzeile, Pfeil per CSS)
  function zeile(sym, titel, unter, ziel, container, opt) {
    var b = el('button', 'weg sen-zeile'); b.type = 'button'; b.setAttribute('data-sen-ziel', ziel);
    var sy = el('span', 'weg-sym'); sy.setAttribute('aria-hidden', 'true'); sy.innerHTML = '<svg viewBox="0 0 24 24">' + (SYM[sym] || SYM.liste) + '</svg>'; // feste Pfade
    var tx = el('span', 'weg-txt'); tx.appendChild(el('b', null, titel)); if (unter) tx.appendChild(el('span', null, unter));
    b.appendChild(sy); b.appendChild(tx);
    b.addEventListener('click', function () {
      if (opt && typeof opt.navigiere === 'function') opt.navigiere(ziel);
      else container.dispatchEvent(new CustomEvent('sen-navigiere', { bubbles: true, detail: { ziel: ziel } }));
    });
    return b;
  }

  function antrag(box, opt) {
    box.appendChild(el('h2', null, t('sen.antrag.h'))).id = 'h-sen-antrag';
    box.appendChild(el('p', 'lead', t('sen.antrag.lead')));
    var ol = el('ol', 'sen-schritte');
    var li = function (x) { var l = el('li'); l.appendChild(x); ol.appendChild(l); };
    li(karte('sen.antrag.s1', 'telefon', null, [el('p', 'small', t('sen.antrag.s1.wer'))]));
    li(karte('sen.antrag.s2', 'person', { tage: w('beratungTage') }));
    var ul = el('ul', 'sen-liste');
    for (var i = 0; i < 6; i++) ul.appendChild(el('li', null, t('sen.antrag.liste.' + i)));
    var lh = el('p', 'sen-liste-h'); lh.appendChild(el('b', null, t('sen.antrag.liste.h')));
    li(karte('sen.antrag.s3', 'liste', null, [lh, ul]));
    li(karte('sen.antrag.s4', 'haus'));
    li(karte('sen.antrag.s5', 'uhr', { tage: w('bescheidArbeitstage'), betrag: euro(WERTE.verzugJeWoche.wert) }));
    li(karte('sen.antrag.s6', 'post'));
    li(karte('sen.antrag.s7', 'weiter'));
    box.appendChild(ol);
    box.appendChild(navKnopf('pflege-einschaetzen', t('sen.antrag.einschaetzen'), box, opt));
    box.appendChild(quellen());
  }

  // Gruppen der Angehörigen-Seite (Senioren-Prüfung 24.11.2026, Punkt 7): oben „Die 3 wichtigsten Schritte“, der Rest auf eigenen Unterseiten.
  // Ohne opt.navigiere (z. B. eigenständig im Test) steht alles auf einer Seite wie bisher.
  var GRUPPEN = [
    { id: 'sen-ang-entl', h: 'sen.ang.entl.h', sym: 'herz', t: 'sux.ang.entl.t' },
    { id: 'sen-ang-arbeit', h: 'sen.ang.arbeit.h', sym: 'kalender', t: 'sux.ang.arbeit.t' },
    { id: 'sen-ang-schutz', h: 'sen.ang.schutz.h', sym: 'schild', t: 'sux.ang.schutz.t' },
    { id: 'sen-ang-hilfe', h: 'sen.ang.hilfe.h', sym: 'telefon', t: 'sux.ang.hilfe.t' }
  ];
  function angEntl(box) {
    var r = R();
    box.appendChild(karte('sen.ang.verh', 'kalender', { betrag: euro(r.entlastungsbudget) }));
    box.appendChild(karte('sen.ang.fed', 'person', { ent: euro(r.pflege.entlastung) }));
    box.appendChild(karte('sen.ang.tages', 'haus'));
    box.appendChild(karte('sen.ang.kurs', 'liste'));
    box.appendChild(karte('sen.ang.hilfs', 'liste', { betrag: euro(r.beh.verbrauch) }));
    box.appendChild(karte('sen.ang.notruf', 'warn'));
    box.appendChild(karte('sen.ang.umbau', 'haus', { betrag: euro(r.beh.wohnumfeld) }));
  }
  function angArbeit(box) {
    box.appendChild(karte('sen.ang.akut', 'uhr', { tage: w('akutTage'), prozent: w('pugProzent') }));
    box.appendChild(karte('sen.ang.pzeit', 'kalender', { monate: w('pflegezeitMonate'), beschaeftigte: w('pflegezeitBeschaeftigte'), ankuendigung: w('pflegezeitAnkuendigung'), letzte: w('letzteLebensphaseMonate') }));
    box.appendChild(karte('sen.ang.fpz', 'kalender', { monate: w('fpzMonate'), beschaeftigte: w('fpzBeschaeftigte'), stunden: w('fpzStunden'), wochen: w('fpzAnkuendigungWochen') }));
  }
  function angSchutz(box) {
    var r = R();
    box.appendChild(karte('sen.ang.rente', 'schild', { stunden: w('rvStunden'), tage: w('rvTage'), arbeit: w('rvArbeitMax') }, [el('p', 'small', t('sen.ang.rente.alt'))]));
    box.appendChild(karte('sen.ang.unfall', 'schild', { stunden: w('rvStunden'), tage: w('rvTage') }));
    box.appendChild(karte('sen.ang.alv', 'schild', { stunden: w('rvStunden'), tage: w('rvTage') }));
    box.appendChild(karte('sen.ang.pausch', 'geld', { betrag: euro(r.pflegePausch[5]), pg2: euro(r.pflegePausch[2]), pg3: euro(r.pflegePausch[3]), pg4: euro(r.pflegePausch[4]) }));
  }
  // Telefon-Knopf in voller Breite (Senioren-Prüfung Punkt 17): Hörer, „Bürgertelefon anrufen“, Nummer darunter
  function telKnopf() {
    var a = el('a', 'btn sen-tel-knopf'); a.href = 'tel:' + BMG_TEL.tel;
    var sy = el('span', 'sen-tel-sym'); sy.setAttribute('aria-hidden', 'true'); sy.innerHTML = '<svg viewBox="0 0 24 24">' + SYM.telefon + '</svg>';
    var tx = el('span', 'sen-tel-txt'); tx.appendChild(el('b', null, tApp('sux.tel.bmg') || t('sen.tel', { nr: BMG_TEL.anzeige })));
    var nr = el('span', 'sen-tel-nr no-tel', BMG_TEL.anzeige); nr.setAttribute('dir', 'ltr'); if (tApp('sux.tel.bmg')) tx.appendChild(nr);
    a.appendChild(sy); a.appendChild(tx);
    return a;
  }
  function angHilfe(box) {
    box.appendChild(el('p', null, t('sen.ang.hilfe.kasse')));
    box.appendChild(el('p', null, t('sen.ang.hilfe.stp')));
    box.appendChild(el('p', 'sen-tel', t('sen.ang.hilfe.bmg')));
    box.appendChild(telKnopf());
  }
  var GRUPPE_FN = { 'sen-ang-entl': angEntl, 'sen-ang-arbeit': angArbeit, 'sen-ang-schutz': angSchutz, 'sen-ang-hilfe': angHilfe };
  function angehoerige(box, opt) {
    var r = R(), geteilt = !!(opt && typeof opt.navigiere === 'function');
    box.appendChild(el('h2', null, t('sen.ang.h'))).id = 'h-sen-angehoerige';
    box.appendChild(el('p', 'lead', t('sen.ang.lead')));
    // „Die 3 wichtigsten Schritte“ als hervorgehobener, nummerierter Kasten
    var top = el('section', 'sen-top3'); top.setAttribute('aria-labelledby', 'sen-top3-h');
    var th = el('h3', 'sen-abschnitt', tApp('sux.ang.top3') || t('sen.ang.top.h')); th.id = 'sen-top3-h'; top.appendChild(th);
    var ol = el('ol', 'sen-schritte');
    [karte('sen.ang.top1', 'telefon', null, [navKnopf('sen-antrag', t('sen.antrag.h'), box, opt)]), karte('sen.ang.top2', 'person'), karte('sen.ang.top3', 'herz', { betrag: euro(r.entlastungsbudget) })]
      .forEach(function (k) { var li = el('li'); li.appendChild(k); ol.appendChild(li); });
    top.appendChild(ol); box.appendChild(top);
    if (geteilt) {
      abschnitt(box, tApp('sux.ang.mehr') ? 'sux.ang.mehr' : 'sen.ang.entl.h');
      var l = el('div', 'weg-liste'); box.appendChild(l);
      GRUPPEN.forEach(function (g) { l.appendChild(zeile(g.sym, t(g.h), tApp(g.t), g.id, box, opt)); });
    } else {
      GRUPPEN.forEach(function (g) { abschnitt(box, g.h); GRUPPE_FN[g.id](box); });
    }
    box.appendChild(quellen());
  }
  function gruppe(id) {
    return function (box) {
      var g = GRUPPEN.filter(function (x) { return x.id === id; })[0];
      box.appendChild(el('h2', null, t(g.h)));
      GRUPPE_FN[id](box);
      box.appendChild(quellen());
    };
  }

  // „Was steht mir zu?“ (Senioren-Prüfung Punkt 6): Knopf zum Check oben, darunter antippbare Zeilen in vier Gruppen
  var GRUPPEN_SELBST = [
    { h: 'sux.grp.pflege', karten: ['pflege', 'hzp', 'lpg'] },
    { h: 'sux.grp.geld', karten: ['gsa', 'wohngeld', 'emrente', 'srente'] },
    { h: 'sux.grp.ausweis', karten: ['ausweis', 'pausch', 'blindengeld'] },
    { h: 'sux.grp.kosten', karten: ['rundfunk', 'zuzahl'] }
  ];
  var SYM_KARTE = { pflege: 'herz', hzp: 'herz', lpg: 'herz', gsa: 'geld', wohngeld: 'haus', emrente: 'schild', srente: 'kalender', ausweis: 'person', pausch: 'geld', blindengeld: 'person', rundfunk: 'post', zuzahl: 'liste' };
  function selbst(box, opt) {
    var names = (typeof Rules !== 'undefined' && Rules.NAMES) || {};
    box.appendChild(el('h2', null, t('sen.selbst.h'))).id = 'h-sen-selbst';
    box.appendChild(el('p', 'lead', t('sen.selbst.lead')));
    box.appendChild(navKnopf('check', t('sen.selbst.check'), box, opt));
    GRUPPEN_SELBST.forEach(function (g) {
      var h = tApp(g.h); if (h) box.appendChild(el('h3', 'sen-abschnitt', h));
      var l = el('div', 'weg-liste sen-karten'); box.appendChild(l);
      g.karten.forEach(function (id) {
        if (KARTEN_SELBST.indexOf(id) < 0) return;
        var name = tApp('n.' + id) || names[id] || id, unter = t('sen.selbst.' + id);
        // Unterzeile nur mit Zusatznutzen (nicht, wenn sie den Titel wiederholt)
        if (unter.toLowerCase().indexOf(String(name).toLowerCase()) >= 0 && unter.length < String(name).length + 12) unter = '';
        var z = zeile(SYM_KARTE[id], name, unter, 'karte:' + id, box, opt); z.setAttribute('data-karte', id); l.appendChild(z);
      });
    });
  }

  var SEITEN = { 'sen-antrag': antrag, 'sen-angehoerige': angehoerige, 'sen-selbst': selbst, 'sen-ang-entl': gruppe('sen-ang-entl'), 'sen-ang-arbeit': gruppe('sen-ang-arbeit'), 'sen-ang-schutz': gruppe('sen-ang-schutz'), 'sen-ang-hilfe': gruppe('sen-ang-hilfe') };
  function render(id, container, opt) {
    if (!SEITEN[id] || !container) return false;
    container.textContent = '';
    SEITEN[id](container, opt || {});
    return true;
  }
  var api = { render: render, seiten: Object.keys(SEITEN), WERTE: WERTE, STAND: STAND, BMG_TEL: BMG_TEL, KARTEN_SELBST: KARTEN_SELBST };
  if (typeof window !== 'undefined') window.SENIOREN = api;
  return api;
})();
if (typeof module !== 'undefined') module.exports = SENIOREN;
