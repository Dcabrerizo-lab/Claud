// Sprachen nur bei Bedarf laden (Entscheidung David 21.11.2026, „A“). Beim Start ist nur Deutsch vollständig da; von den anderen
// Sprachen kennt die App nur Name und Schreibrichtung (Schlüssel meta.*), damit die Sprachauswahl alle Sprachen zeigt.
// Die Texte selbst baut scripts/build.js aus src/lang/ (Dateien dort bleiben unverändert) und legt sie je nach Ausgabe ab:
//  - Web (eine HTML-Datei): jede Sprache als JSON-Datenblock (Skript-Element vom Typ application/json, id solo-sprache-xx) in derselben Datei.
//    Datenblöcke führt der Browser nicht aus (auch für die CSP kein Skript); geparst wird erst beim Wechsel, synchron, ohne Netz.
//  - App (Android/iOS): jede Sprache als eigene Datei lang/xx.js im App-Paket (script-src 'self', kein Netz nötig).
//    Die beim Start gewählte Sprache wird noch vor src/app.js eingebunden (document.write, nur eigene Datei mit geprüftem Kürzel).
// Lädt eine Sprache nicht, zeigt die App Deutsch und einen kurzen Hinweis (src/app.js, setLang).
// SPRACH_QUELLE setzt der Build: 'eingebettet' (Web) oder 'datei' (App).
/* exported SprachLaden */
var SprachLaden = (function () {
  var quelle = typeof SPRACH_QUELLE !== 'undefined' ? SPRACH_QUELLE : 'eingebettet';
  var LISTE = Object.keys(I18N), geladen = { de: true }, warten = {};
  function gueltig(l) { return typeof l === 'string' && LISTE.indexOf(l) >= 0; }
  // von lang/xx.js aufgerufen (App) bzw. nach dem Parsen eines Datenblocks (Web)
  function dazu(l, o) {
    if (!gueltig(l) || !o || typeof o !== 'object' || typeof o['meta.name'] !== 'string') return false;
    I18N[l] = o; geladen[l] = true; return true;
  }
  function ausBlock(l) {
    var el = document.getElementById('solo-sprache-' + l);
    if (!el) return false;
    try { if (!dazu(l, JSON.parse(el.textContent))) return false; } catch (e) { return false; }
    if (el.parentNode) el.parentNode.removeChild(el); // Text liegt jetzt in I18N; Block nicht doppelt im Speicher halten
    return true;
  }
  // Ist die Sprache sofort benutzbar? Web: parst den Datenblock beim ersten Aufruf (synchron)
  // Nur Kürzel aus der festen Liste (Unabhängige Prüfung 21.11.2026): sonst gälte z. B. „constructor“ als geladen, weil es das an jedem Objekt gibt
  function da(l) {
    if (!gueltig(l)) return false;
    if (geladen[l] === true) return true;
    return quelle === 'eingebettet' ? ausBlock(l) : false;
  }
  // Lädt die Sprache (App: Datei lang/xx.js aus dem Paket); fertig(true|false) kommt immer, höchstens nach 15 Sekunden
  function laden(l, fertig) {
    var spaeter = function (ok) { setTimeout(function () { fertig(ok); }, 0); };
    if (da(l)) return spaeter(true);
    if (!gueltig(l) || quelle !== 'datei') return spaeter(false);
    if (warten[l]) { warten[l].push(fertig); return; }
    warten[l] = [fertig];
    var s = document.createElement('script'), zu = false, uhr = null;
    var ende = function (ok) {
      if (zu) return; zu = true; clearTimeout(uhr);
      var w = warten[l]; delete warten[l];
      if (!geladen[l] && s.parentNode) s.parentNode.removeChild(s);
      w.forEach(function (f) { f(ok && !!geladen[l]); });
    };
    uhr = setTimeout(function () { ende(false); }, 15000);
    s.onload = function () { ende(true); };
    s.onerror = function () { ende(false); };
    s.src = 'lang/' + l + '.js';
    (document.head || document.documentElement).appendChild(s);
  }
  // Kurzer Hinweis, wenn eine Sprache nicht geladen werden konnte (die App zeigt dann Deutsch)
  function hinweis(l) {
    hinweisWeg();
    var p = document.createElement('p'), vor = document.getElementById('transNotice');
    p.id = 'sprachFehler'; p.className = 'notice info'; p.setAttribute('role', 'status');
    var name = I18N[l] && I18N[l]['meta.name'];
    p.textContent = (name ? name + ': ' : '') + 'Diese Sprache konnte gerade nicht geladen werden. Die App zeigt Deutsch. Bitte später noch einmal wählen. (Language could not be loaded – showing German.)';
    if (vor && vor.parentNode) vor.parentNode.insertBefore(p, vor);
    else { var a = document.getElementById('app') || document.body; a.insertBefore(p, a.firstChild); }
  }
  function hinweisWeg() { var p = document.getElementById('sprachFehler'); if (p && p.parentNode) p.parentNode.removeChild(p); }
  // App: Startsprache (wie detect() in src/app.js) vor src/app.js einbinden, damit die App gleich in dieser Sprache startet
  function startSprache() {
    try { var s = localStorage.getItem('lotse-lang'); if (gueltig(s)) return s; } catch (e) {}
    var n = (typeof navigator !== 'undefined' && navigator.languages && navigator.languages.length) ? navigator.languages : [(typeof navigator !== 'undefined' && navigator.language) || 'de'];
    for (var i = 0; i < n.length; i++) {
      var voll = String(n[i]).toLowerCase(), exakt = LISTE.filter(function (x) { return x.toLowerCase() === voll; })[0];
      if (exakt) return exakt;
      if (gueltig(voll.slice(0, 2))) return voll.slice(0, 2);
    }
    return 'de';
  }
  if (quelle === 'datei' && typeof document !== 'undefined' && document.readyState === 'loading') {
    var start = startSprache();
    if (start !== 'de' && gueltig(start) && /^[a-zA-Z-]+$/.test(start)) document.write('<' + 'script src="lang/' + start + '.js"><' + '/script>'); // zerlegt: kein Skript-Tag im Quelltext (Build-Prüfungen)
  }
  return { da: da, laden: laden, dazu: dazu, hinweis: hinweis, hinweisWeg: hinweisWeg, quelle: function () { return quelle; } };
})();
