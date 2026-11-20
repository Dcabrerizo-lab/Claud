// Geld und Schulden – neue Teile (Update nach 1.7.0, Konzept docs/entwuerfe/geld-schulden-konzept.md, Entscheidung David 20.11.2026):
// Krisen-Check „Was ist zuerst dran?“ (unter „Es ist dringend“), Prüfliste „Stimmt der Brief?“ und Musterschreiben (Kachel „Post vom Inkasso“,
// P-Konto-Bescheinigung unter „Was bleibt mir?“), Kachel „Schuldnerberatung“ (Bis zum Termin, Beratungsmappe) und Teile des Beratungsmodus.
// Eigenes Modul: reine Rechnung (Node-Tests) und Oberfläche. Ausgabe nur per textContent (el()), nie als HTML.
// RDG-Grenze: nur allgemeine Information, Prüflisten und Vorlagen, die der Nutzer selbst ausfüllt. Kein Urteil über eine Forderung.
// Gläubiger-Anschrift nie vorschlagen, nur aus der Eingabe oder der Schulden-Liste des Nutzers.
// Texte für Fachkräfte (Beratungsmodus) stehen nur auf Deutsch hier im Code (Konzept Abschnitt g: spart Größe und Übersetzung).
var Geld = (function () {
  'use strict';

  // ---------- Krisen-Check ----------
  // Reihenfolge der Fragen = Reihenfolge im Ergebnis (Existenzsicherung zuerst: AG SBV „Konzept Soziale Schuldnerberatung“ 2018, S. 11–12,
  // abgerufen 20.11.2026). Ziel je Frage: Fall unter „Es ist dringend“ oder ein anderer Teil der App.
  //  mahn: Mahnbescheid, Widerspruch binnen 2 Wochen (§ 692 Abs. 1 Nr. 3 ZPO); geld: Ersatzfreiheitsstrafe (§ 43 StGB);
  //  miete: Schonfrist (§ 569 Abs. 3 Nr. 2 BGB); strom: Sperre (§ 41f EnWG); konto: P-Konto (§§ 850k, 899 ZPO);
  //  essen: Leistungs-Check (kein eigener Fall „Kein Geld für Essen“, weil dafür keine geprüfte Quelle vorliegt); inkasso: Kachel „Post vom Inkasso“.
  var KC = ['mahn', 'geld', 'miete', 'strom', 'konto', 'essen', 'inkasso'];
  var KC_ZUERST = 3;
  // antworten: { mahn: true, … } (true = Ja). Ergebnis: höchstens 3 „zuerst“, Rest „danach“; ohne Ja: Schulden-Liste. Immer am Ende: Beratung finden.
  function krisenErgebnis(antworten) {
    var ja = KC.filter(function (k) { return antworten && antworten[k] === true; });
    if (!ja.length) ja = ['liste'];
    return { zuerst: ja.slice(0, KC_ZUERST), danach: ja.slice(KC_ZUERST), ende: 'finden' };
  }
  // Normen je Frage, nur Beratungsmodus (Deutsch). Geprüft am amtlichen Text (gesetze-im-internet.de, abgerufen 20.11.2026):
  //  § 43 StGB (2 Tagessätze = 1 Tag Ersatzfreiheitsstrafe), § 459a StPO (Zahlungserleichterungen durch die Vollstreckungsbehörde),
  //  § 451 StPO (Staatsanwaltschaft ist Vollstreckungsbehörde), Art. 293 EGStGB (Abwendung durch freie Arbeit nach Landesrecht).
  var KC_NORM = { mahn: 'Widerspruch 2 Wochen (§ 692 Abs. 1 Nr. 3 ZPO), danach bis zum Vollstreckungsbescheid (§ 694 ZPO); Einspruch 2 Wochen (§§ 700, 339 ZPO)',
    geld: 'Ersatzfreiheitsstrafe (§ 43 StGB); Zahlungserleichterung durch die Staatsanwaltschaft (§§ 451, 459a StPO); freie Arbeit (Art. 293 EGStGB, Landesrecht)',
    miete: 'Schonfrist 2 Monate nach Zustellung der Räumungsklage (§ 569 Abs. 3 Nr. 2 BGB); Mietschulden-Darlehen (§ 22 Abs. 8 SGB II, § 36 SGB XII)',
    strom: 'Androhung 4 Wochen, Ankündigung 8 Werktage (§ 41f EnWG); Abwendungsvereinbarung (§ 41g EnWG)',
    konto: 'P-Konto-Umwandlung (§ 850k ZPO), gesperrtes Guthaben binnen 1 Monat (§ 899 Abs. 1 ZPO), Bescheinigung (§ 903 ZPO)',
    essen: 'Leistungsprüfung (SGB II, SGB XII, WoGG, BKGG)', inkasso: 'Darlegungspflichten (§ 13a RDG)' };

  // ---------- Prüfliste „Stimmt der Brief?“ ----------
  // § 13a Abs. 1 RDG (Darlegungs- und Informationspflichten bei Inkassodienstleistungen gegenüber Privatpersonen), Wortlaut abgerufen
  // 20.11.2026 auf https://www.gesetze-im-internet.de/rdg/__13a.html. Nr. 1 Auftraggeber mit Anschrift; Nr. 2 Forderungsgrund (Vertrag:
  // Gegenstand und Datum); Nr. 3 Zinsberechnung; Nr. 4 Zinssatz über Verzugszins: Hinweis und Begründung; Nr. 5 Inkassokosten nach Art,
  // Höhe und Entstehungsgrund; Nr. 6 Umsatzsteuer: Erklärung zum Vorsteuerabzug; Nr. 7 Anschrift nicht vom Gläubiger: Hinweis;
  // Nr. 8 Aufsichtsbehörde mit Anschrift und elektronischer Erreichbarkeit. Abs. 2: auf Anfrage ursprünglicher Gläubiger und Umstände des
  // Vertragsschlusses. Abs. 3: Kostenhinweis vor Raten-/Stundungsvereinbarung. Abs. 4: Hinweis vor einem Schuldanerkenntnis.
  // Für Laien 6 Punkte (Nr. 3 mit 4, Nr. 5 mit 6 zusammengefasst); die genaue Fundstelle zeigt der Beratungsmodus.
  var IP = [['1', 'Abs. 1 Nr. 1'], ['2', 'Abs. 1 Nr. 2'], ['3', 'Abs. 1 Nr. 3 und 4'], ['4', 'Abs. 1 Nr. 5 und 6'], ['5', 'Abs. 1 Nr. 8'], ['6', 'Abs. 1 Nr. 7']];
  function ipFehlend(haken) { return IP.map(function (x) { return x[0]; }).filter(function (k) { return !(haken && haken[k]); }); }

  // ---------- Musterschreiben (immer Deutsch) ----------
  // C1 Bitte um Geduld (meine-schulden.de „Vorbereitung Erstgespräch“, abgerufen 20.11.2026); C2 Forderungsaufstellung (§ 13a Abs. 1 und 2 RDG,
  // Wortlaut abgerufen 20.11.2026); C3 Widerspruch (sinngemäß nach dem Musterbrief der Verbraucherzentrale, Stand 14.04.2025, in eigenen Worten);
  // C4 P-Konto-Bescheinigung: § 903 Abs. 1 und 3 ZPO (Familienkasse, Sozialleistungsträger, Arbeitgeber, Stelle nach § 305 Abs. 1 Nr. 1 InsO;
  // Pflicht zur Ausstellung für Stellen nach Abs. 1 Nr. 1, die Leistungen überweisen; Wortlaut abgerufen 20.11.2026).
  // Die App setzt nur ein, was der Nutzer eingibt; fehlt etwas, bleibt eine Lücke [ … ] zum Ausfüllen. Keine Wertung der Forderung.
  var MUSTER = ['geduld', 'aufst', 'wider', 'pkonto'];
  var LUECKE = { name: '[Dein Name, deine Anschrift]', g: '[Name der Firma oder Stelle]', adr: '[Anschrift aus dem Brief]', az: '[Aktenzeichen oder Kundennummer]', ort: '[Ort]' };
  function zeilen(s) { return String(s || '').replace(/\r\n?/g, '\n').split('\n').map(function (z) { return z.replace(/[\u0000-\u001f\u007f]/g, '').trim(); }).filter(Boolean); }
  function einzeilig(s, max) { return String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 120); }
  // f = { g, adr, az, datum, absender } (alles Text vom Nutzer); Ergebnis: fertiger Brief als Text
  function schreiben(art, f) {
    f = f || {};
    var g = einzeilig(f.g) || LUECKE.g, adr = zeilen(f.adr).slice(0, 6), az = einzeilig(f.az, 60) || LUECKE.az;
    var kopf = [LUECKE.name].concat(f.absender ? [einzeilig(f.absender)] : [], ['', g], adr.length ? adr : [LUECKE.adr], ['', LUECKE.ort + ', ' + (einzeilig(f.datum, 20) || '[Datum]'), '']);
    var b;
    if (art === 'geduld') b = ['Aktenzeichen: ' + az, '', 'Bitte um Geduld', '', 'Sehr geehrte Damen und Herren,', '',
      'ich bereite zurzeit eine Beratung bei einer Schuldnerberatungsstelle vor. Dort verschaffe ich mir einen Überblick über alle Forderungen und meine Möglichkeiten.',
      'Bitte sehen Sie bis dahin von weiteren Maßnahmen ab und schicken Sie mir keine Zahlungsvereinbarung zur Unterschrift. Sobald ich beraten wurde, melde ich mich unaufgefordert bei Ihnen.',
      'Bitte schicken Sie mir eine aktuelle Aufstellung Ihrer Forderung (Hauptforderung, Zinsen und Kosten einzeln).', '', 'Mit freundlichen Grüßen', '', '[Unterschrift]'];
    else if (art === 'aufst') b = ['Aktenzeichen: ' + az, '', 'Bitte um Forderungsaufstellung', '', 'Sehr geehrte Damen und Herren,', '',
      'Ihre Forderung kann ich so nicht nachvollziehen. Bitte teilen Sie mir in Textform mit:',
      '- Name und Anschrift Ihres Auftraggebers und des ursprünglichen Gläubigers,',
      '- den Grund der Forderung, bei einem Vertrag den Vertragsgegenstand und das Datum des Vertragsschlusses,',
      '- eine Aufstellung von Hauptforderung, Zinsen (Betrag, Zinssatz, Zeitraum) und Kosten (Art, Höhe, Grund),',
      '- die zuständige Aufsichtsbehörde.',
      'Diese Angaben sehen § 13a Abs. 1 und 2 des Rechtsdienstleistungsgesetzes vor.',
      'Dieses Schreiben ist kein Anerkenntnis der Forderung. Bis zur Klärung zahle ich nicht.', '', 'Mit freundlichen Grüßen', '', '[Unterschrift]'];
    else if (art === 'wider') b = ['Aktenzeichen: ' + az, '', 'Widerspruch gegen Ihre Forderung', '', 'Sehr geehrte Damen und Herren,', '',
      'hiermit widerspreche ich Ihrer Forderung. [Zutreffendes stehen lassen, anderes löschen:]',
      '- Ich habe mit Ihrem Auftraggeber keinen Vertrag geschlossen. Die Forderung ist mir nicht bekannt.',
      '- Ich habe den Betrag bereits am [Datum] bezahlt. Einen Beleg lege ich bei.',
      'Ich erkenne die Forderung nicht an. Bitte stellen Sie Ihre Mahnungen ein und bestätigen Sie mir das schriftlich.', '', 'Mit freundlichen Grüßen', '', '[Unterschrift]'];
    else b = ['Kundennummer oder Aktenzeichen: ' + az, '', 'Antrag auf eine Bescheinigung für mein Pfändungsschutzkonto (§ 903 ZPO)', '', 'Sehr geehrte Damen und Herren,', '',
      'mein Konto ist ein Pfändungsschutzkonto (P-Konto). Damit meine Bank die höheren Freibeträge berücksichtigt, bitte ich Sie um eine Bescheinigung nach § 903 ZPO.',
      'Bitte bescheinigen Sie, soweit Ihnen bekannt: die Höhe und Art der Leistungen, die Sie auf mein Konto überweisen, und den Zeitraum sowie die Zahl der Personen, denen ich Unterhalt gewähre, mit dem Geburtsdatum minderjähriger Kinder.',
      'Bitte schicken Sie mir die Bescheinigung an meine Anschrift oben.', '', 'Mit freundlichen Grüßen', '', '[Unterschrift]'];
    return kopf.concat(b).join('\n');
  }

  // ---------- Bis zum Termin und Beratungsmappe (Haken je Vorgang, lotse.beratung-haken) ----------
  // Bis zum Termin: meine-schulden.de „Vorbereitung Erstgespräch“; Unterlagen: Verbraucherzentrale NRW „Vorbereitung für die Schulden- und
  // Insolvenzberatung“ (Texte sl.u.1–8, Quelle in src/schulden.js); beide abgerufen 20.11.2026.
  var WARTEN = ['1', '2', '3', '4', '5', '6'];
  function hakenLeer() { return { v: 1, w: {}, u: {} }; }
  function hakenNormiere(d) {
    var o = hakenLeer();
    if (!d || typeof d !== 'object') return o;
    WARTEN.forEach(function (k) { if (d.w && d.w[k] === true) o.w[k] = true; });
    for (var i = 1; i <= 8; i++) if (d.u && d.u[String(i)] === true) o.u[String(i)] = true;
    return o;
  }

  // ---------- Oberfläche ----------
  var ctx = null, haken = hakenLeer();
  var st = { kc: { i: 0, a: {} }, ip: {}, ms: { art: '', g: '', adr: '', az: '', von: '', absender: '' } };
  var speicher = {
    laden: function (cb) { try { cb(localStorage.getItem('lotse.beratung-haken')); } catch (e) { cb(null); } },
    schreiben: function (txt) { try { localStorage.setItem('lotse.beratung-haken', txt); } catch (e) { /* Speicher gesperrt */ } }
  };
  function speicherOrt(s) { if (s && s.laden) speicher.laden = s.laden; if (s && s.schreiben) speicher.schreiben = s.schreiben; }
  function laden(fertig) { speicher.laden(function (v) { try { haken = hakenNormiere(v ? JSON.parse(v) : null); } catch (e) { haken = hakenLeer(); } if (fertig) fertig(); }); }
  function sichern() { speicher.schreiben(JSON.stringify(haken)); }
  function t(k, p) { return ctx.t(k, p); }
  function ber() { return !!(ctx && ctx.beratung && ctx.beratung()); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function knopf(cls, txt, fn, attr) { var b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', fn); if (attr) Object.keys(attr).forEach(function (k) { b.setAttribute(k, attr[k]); }); return b; }
  function frage(box, txt) { return box.appendChild(el('p', 'pf-frage', txt)); }
  function btns(box) { return box.appendChild(el('div', 'btns')); }
  function raster(box) { return box.appendChild(el('div', 'uk-raster')); }
  // Nur im Beratungsmodus: Klasse ber-nur (Test: im Privatmodus gibt es kein solches Element)
  function berEl(tag, txt) { var e = el(tag, 'ber-nur small', txt); return e; }

  // Krisen-Check. ziele(art) öffnet das Ziel einer Ergebniskarte.
  function krisenCheck(box, neu) {
    var a = st.kc.a;
    frage(box, t('kc.h'));
    if (ber()) { // Beratungsmodus: alle 7 Fragen auf einer Seite, Ergebnis darunter, als Gesprächsnotiz druckbar
      var fs = box.appendChild(el('fieldset', 'kc-alle ber-nur'));
      KC.forEach(function (k, i) {
        var l = el('label', 'check'), c = el('input'); c.type = 'checkbox'; c.id = 'kc-c-' + k; c.checked = a[k] === true;
        c.addEventListener('change', function () { a[k] = c.checked; neu(); var f = document.getElementById('kc-c-' + k); if (f) f.focus(); });
        l.appendChild(c); l.appendChild(el('span', '', t('kc.q' + (i + 1)) + ' – ' + KC_NORM[k])); fs.appendChild(l);
      });
      ergebnisZeigen(box, a);
      var m = el('p', 'small'); m.setAttribute('aria-live', 'polite');
      btns(box).appendChild(knopf('btn ghost ber-nur', 'Als Gesprächsnotiz drucken', function () { ctx.textAusgeben(notiz(a), 'Gespraechsnotiz', m); }, { id: 'kc-notiz' }));
      box.appendChild(m);
      return;
    }
    if (st.kc.i < KC.length) {
      box.appendChild(el('p', 'hint kc-nr', t('kc.nr', { n: String(st.kc.i + 1), m: String(KC.length) })));
      var q = el('p', 'kc-frage', t('kc.q' + (st.kc.i + 1))); q.id = 'kc-q'; box.appendChild(q);
      var b = box.appendChild(el('div', 'wahl-raster kc-knoepfe'));
      var k = KC[st.kc.i], weiter = function (v) { if (v === null) delete a[k]; else a[k] = v; st.kc.i++; neu(); };
      b.appendChild(knopf('wahl', t('kc.ja'), function () { weiter(true); }, { id: 'kc-ja', 'aria-pressed': String(a[k] === true) }));
      b.appendChild(knopf('wahl', t('kc.nein'), function () { weiter(false); }, { id: 'kc-nein', 'aria-pressed': String(a[k] === false) }));
      btns(box).appendChild(knopf('linkbtn', t('kc.weiter'), function () { weiter(null); }, { id: 'kc-weiter' }));
      return;
    }
    ergebnisZeigen(box, a);
    btns(box).appendChild(knopf('btn ghost', t('kc.neu'), function () { st.kc = { i: 0, a: {} }; neu(); }, { id: 'kc-neu' }));
  }
  var KC_KARTE = { mahn: ['gs.d.mahn', 'post'], geld: ['gs.d.geld', 'waage'], miete: ['gs.d.miete', 'haus'], strom: ['gs.d.strom', 'blitz'], konto: ['pf.konto', 'bank'],
    essen: ['kc.essen', 'geld'], inkasso: ['gs.inkasso', 'lupe'], liste: ['sl.h', 'liste'], finden: ['sb.finden', 'person'] };
  function ergebnisZeigen(box, a) {
    var e = krisenErgebnis(a), keinJa = e.zuerst[0] === 'liste';
    var h = el('h3', 'kc-erg', t('kc.erg')); h.id = 'kc-erg'; h.tabIndex = -1; box.appendChild(h);
    if (keinJa) box.appendChild(el('p', '', t('kc.keins')));
    var ol = box.appendChild(el('ol', 'kc-liste'));
    var karte = function (ziel, liste) { var li = el('li'); li.appendChild(ctx.kachel('kc-z-' + ziel, KC_KARTE[ziel][1], t(KC_KARTE[ziel][0]), ber() && KC_NORM[ziel] ? KC_NORM[ziel] : '', function () { ctx.ziel(ziel); })); liste.appendChild(li); };
    e.zuerst.forEach(function (z) { karte(z, ol); });
    if (e.danach.length) {
      box.appendChild(el('h3', 'kc-danach', t('kc.danach')));
      var ul = box.appendChild(el('ul', 'kc-liste'));
      e.danach.forEach(function (z) { karte(z, ul); });
    }
    var ue = box.appendChild(el('ul', 'kc-liste kc-ende')); karte(e.ende, ue);
    box.appendChild(el('p', 'small muted', t('kc.hinweis')));
  }
  function notiz(a) {
    var e = krisenErgebnis(a), d = ctx.datumDe ? ctx.datumDe(new Date()) : '';
    var L = ['Gesprächsnotiz Krisen-Check (' + d + ')', ''];
    KC.forEach(function (k, i) { L.push((a[k] === true ? '[x] ' : '[ ] ') + ctx.tDe('kc.q' + (i + 1))); });
    L.push('', 'Reihenfolge (Existenzsicherung zuerst):');
    e.zuerst.concat(e.danach).forEach(function (z, i) { L.push((i + 1) + '. ' + ctx.tDe(KC_KARTE[z][0]) + (KC_NORM[z] ? ' – ' + KC_NORM[z] : '')); });
    L.push('', 'Nur Reihenfolge, keine Prüfung des Einzelfalls.');
    return L.join('\n');
  }

  // Prüfliste „Stimmt der Brief?“
  function pruefliste(box, neu) {
    frage(box, t('ip.h'));
    box.appendChild(el('p', 'hint', t('ip.lead')));
    var fs = box.appendChild(el('fieldset', 'ip-liste'));
    fs.setAttribute('aria-label', t('ip.h'));
    IP.forEach(function (x) {
      var l = el('label', 'check'), c = el('input'); c.type = 'checkbox'; c.id = 'ip-' + x[0]; c.checked = !!st.ip[x[0]];
      c.addEventListener('change', function () { st.ip[x[0]] = c.checked; erg(); });
      l.appendChild(c); var s = el('span', '', t('ip.' + x[0])); l.appendChild(s);
      if (ber()) s.appendChild(berEl('span', ' (§ 13a ' + x[1] + ' RDG)'));
      fs.appendChild(l);
    });
    var out = box.appendChild(el('div', 'ip-erg')); out.id = 'ip-erg'; out.setAttribute('aria-live', 'polite');
    function erg() {
      out.textContent = '';
      var f = ipFehlend(st.ip);
      if (!f.length) { out.appendChild(el('p', 'ok', t('ip.erg.alle'))); return; }
      out.appendChild(el('p', '', t('ip.erg.fehlt')));
      var ul = out.appendChild(el('ul', 'sp-liste')); f.forEach(function (k) { ul.appendChild(el('li', '', t('ip.' + k))); });
      btns(out).appendChild(knopf('btn', t('ms.aufst'), function () { ctx.schreibenOeffnen('aufst'); }, { id: 'ip-zum-schreiben' }));
    }
    erg();
    ['ip.w1', 'ip.w2', 'ip.w3'].forEach(function (k) { box.appendChild(ctx.tipp(k, 'ip-warn')); });
    if (ber()) box.appendChild(berEl('p', 'Prüfhinweise für Fachkräfte: Kostenhinweis vor Raten- oder Stundungsvereinbarung (§ 13a Abs. 3 RDG); Hinweis vor einem Schuldanerkenntnis (§ 13a Abs. 4 RDG); Erstattungsfähigkeit der Inkassokosten höchstens wie bei einem Rechtsanwalt (§ 13e RDG). Abrufdatum 20.11.2026.'));
  }

  // Musterschreiben: erst wählen (Kacheln), dann Felder und Text. fest: Muster vorgegeben (P-Konto aus „Was bleibt mir?“)
  function schreibenSeite(box, neu, fest) {
    var m = st.ms;
    if (fest) m.art = fest;
    if (!m.art) {
      frage(box, t('ms.h'));
      box.appendChild(el('p', 'hint', t('ms.wahl')));
      var r = raster(box);
      MUSTER.forEach(function (a) { r.appendChild(ctx.kachel('ms-' + a, { geduld: 'uhr', aufst: 'lupe', wider: 'stopp', pkonto: 'beleg' }[a], t('ms.' + a), t('ms.' + a + '.t'), function () { m.art = a; neu(); })); });
      box.appendChild(el('p', 'small muted', t('ms.hinweis')));
      return;
    }
    frage(box, t('ms.' + m.art));
    if (m.art === 'pkonto') box.appendChild(el('p', 'hint', t('ms.pkonto.lead')));
    if (m.art === 'wider') box.appendChild(el('p', 'warn', t('ms.wider.warn')));
    var liste = ctx.schulden ? ctx.schulden() : [];
    if (liste.length && m.art !== 'pkonto') {
      var f0 = box.appendChild(el('div', 'field')), l0 = el('label', '', t('ms.liste')); l0.htmlFor = 'ms-von'; f0.appendChild(l0);
      var s0 = el('select'); s0.id = 'ms-von'; var o0 = el('option', '', t('ms.liste.leer')); o0.value = ''; s0.appendChild(o0);
      liste.forEach(function (e) { var o = el('option', '', e.g); o.value = e.id; s0.appendChild(o); });
      s0.value = m.von || '';
      s0.addEventListener('change', function () {
        m.von = s0.value; var e = liste.filter(function (x) { return x.id === s0.value; })[0];
        if (e) { m.g = e.g || ''; m.adr = e.adr || ''; m.az = e.az || ''; }
        neu('ms-von');
      });
      f0.appendChild(s0);
    }
    var feld = function (id, k, label, mehr) {
      var f = box.appendChild(el('div', 'field')), l = el('label', '', label); l.htmlFor = id; f.appendChild(l);
      var i = el(mehr ? 'textarea' : 'input'); i.id = id; if (!mehr) { i.type = 'text'; i.maxLength = 120; } else { i.rows = 3; i.maxLength = 300; }
      i.autocomplete = 'off'; i.value = m[k] || '';
      i.addEventListener('input', function () { m[k] = i.value; text(); });
      f.appendChild(i); return i;
    };
    feld('ms-g', 'g', t('ms.g'));
    feld('ms-adr', 'adr', t('ms.adr'), true);
    var ohne = box.appendChild(el('p', 'small warn')); ohne.id = 'ms-ohne-adr';
    feld('ms-az', 'az', t('ms.az'));
    if (ber()) { var fb = feld('ms-abs', 'absender', 'Absender-Zusatz (z. B. „vertreten durch …“)'); fb.closest('.field').classList.add('ber-nur'); }
    var lt = el('label', '', t('ms.text')); lt.htmlFor = 'ms-text'; box.appendChild(lt);
    if (ctx.lang() !== 'de') box.appendChild(el('p', 'small hint', t('ms.de')));
    var ta = el('textarea', 'ms-text'); ta.id = 'ms-text'; ta.rows = 16; ta.lang = 'de'; ta.dir = 'ltr'; box.appendChild(ta);
    var msg = el('p', 'small'); msg.setAttribute('aria-live', 'polite');
    btns(box).appendChild(knopf('btn', t('hb.hw.briefAus'), function () { ctx.textAusgeben(ta.value, 'Schreiben', msg); }, { id: 'ms-aus' }));
    box.appendChild(msg);
    box.appendChild(el('p', 'small ms-hinweis', t('ms.hinweis')));
    function text() {
      ta.value = schreiben(m.art, { g: m.g, adr: m.adr, az: m.az, absender: ber() ? m.absender : '', datum: ctx.datumDe ? ctx.datumDe(new Date()) : '' });
      ohne.textContent = zeilen(m.adr).length ? '' : t('ms.ohneAdr'); ohne.hidden = !ohne.textContent;
    }
    text();
  }
  function schreibenVorbelegen(art, e) {
    st.ms = { art: art || '', g: e && e.g || '', adr: e && e.adr || '', az: e && e.az || '', von: e && e.id || '', absender: st.ms.absender || '' };
  }

  // Bis zum Termin: 6 Haken, je Zeile ein Sprung. Haken 4 (Liste) und 5 (Haushaltsplan) setzen sich von selbst.
  var W_ZIEL = { '1': 'geduld', '2': 'pkonto-rechner', '4': 'liste', '5': 'haushalt' };
  function wartezeit(box) {
    frage(box, t('sb.termin'));
    box.appendChild(el('p', 'hint', t('sb.w.lead')));
    var auto = { '4': !!(ctx.schulden && ctx.schulden().length), '5': !!(ctx.planFertig && ctx.planFertig()) };
    var ul = box.appendChild(el('ul', 'sb-haken'));
    WARTEN.forEach(function (k) {
      var li = ul.appendChild(el('li', 'sb-zeile')), l = el('label', 'check'), c = el('input'); c.type = 'checkbox'; c.id = 'sb-w-' + k;
      c.checked = !!(haken.w[k] || auto[k]); if (auto[k]) c.disabled = true;
      c.addEventListener('change', function () { if (c.checked) haken.w[k] = true; else delete haken.w[k]; sichern(); });
      l.appendChild(c); l.appendChild(el('span', '', t('sb.w' + k))); li.appendChild(l);
      if (W_ZIEL[k]) li.appendChild(knopf('btn ghost klein', t('sb.oeffnen'), function () { ctx.ziel(W_ZIEL[k]); }, { id: 'sb-w-' + k + '-los', 'aria-label': t('sb.oeffnen') + ': ' + t('sb.w' + k) }));
    });
    handzettelKnopf(box, 'sb-handzettel');
  }
  function handzettelKnopf(box, id) {
    if (!ber()) return;
    var m = el('p', 'small ber-nur'); m.setAttribute('aria-live', 'polite');
    btns(box).appendChild(knopf('btn ghost ber-nur', 'Handzettel für den Klienten drucken (in der App-Sprache)', function () { ctx.textAusgeben(handzettel(), 'Handzettel', m); }, { id: id }));
    box.appendChild(m);
  }
  function handzettel() {
    var L = [t('sb.termin'), ''];
    WARTEN.forEach(function (k) { L.push('☐ ' + t('sb.w' + k)); });
    L.push('', t('sl.u.h'), '');
    for (var i = 1; i <= 8; i++) L.push('☐ ' + t('sl.u.' + i));
    return L.join('\n');
  }
  // Beratungsmappe: Unterlagen abhaken, Ordner-Anleitung, ein Druck (Blatt der Schulden-Liste mit Haushaltsplan und Unterlagenliste)
  function mappe(box) {
    frage(box, t('sb.mappe'));
    box.appendChild(el('p', 'hint', t('sb.mappe.lead')));
    var ul = box.appendChild(el('ul', 'sb-haken'));
    for (var i = 1; i <= 8; i++) (function (k) {
      var li = ul.appendChild(el('li', 'sb-zeile')), l = el('label', 'check'), c = el('input'); c.type = 'checkbox'; c.id = 'sb-u-' + k; c.checked = !!haken.u[k];
      c.addEventListener('change', function () { if (c.checked) haken.u[k] = true; else delete haken.u[k]; sichern(); });
      l.appendChild(c); l.appendChild(el('span', '', t('sl.u.' + k))); li.appendChild(l);
    })(String(i));
    box.appendChild(ctx.tipp('sb.ordner'));
    if (ctx.mappeDrucken) btns(box).appendChild(knopf('btn', t('sb.druck'), ctx.mappeDrucken, { id: 'sb-druck' }));
    handzettelKnopf(box, 'sb-handzettel2');
  }

  // Beratungsmodus: Pfändung auf einer Seite (Netto, Unterhaltsberechtigte, Kindergeld-Kinder), Rechenweg aus Rules.pfaendung/pkonto (keine neuen Zahlen).
  // Prüfhinweise § 850d ZPO (Unterhaltsgläubiger), § 850f ZPO (Antrag auf höheren Freibetrag), § 906 ZPO (Festsetzung durch das Vollstreckungsgericht).
  var pm = { netto: '', pers: 0, kg: 0 };
  function pfMaske(box, R, euro, parse) {
    var f = box.appendChild(el('fieldset', 'ber-nur pf-maske'));
    f.appendChild(el('legend', '', 'Pfändung auf einer Seite (Beratungsmodus)'));
    var zahl = function (id, label, wert, setze, art) {
      var d = f.appendChild(el('div', 'field')), l = el('label', '', label); l.htmlFor = id; d.appendChild(l);
      var i; if (art === 'n') { i = el('select'); [0, 1, 2, 3, 4, 5].forEach(function (n) { var o = el('option', '', n === 5 ? '5 und mehr' : String(n)); o.value = String(n); i.appendChild(o); }); i.value = String(wert); i.addEventListener('change', function () { setze(+i.value); aus(); }); }
      else { i = el('input'); i.type = 'text'; i.inputMode = 'decimal'; i.autocomplete = 'off'; i.value = wert; i.addEventListener('input', function () { setze(i.value); aus(); }); }
      i.id = id; d.appendChild(i);
    };
    zahl('pm-netto', 'Monatliches Netto (Lohn)', pm.netto, function (v) { pm.netto = v; });
    zahl('pm-pers', 'Unterhaltsberechtigte Personen', pm.pers, function (v) { pm.pers = v; }, 'n');
    zahl('pm-kg', 'Kinder mit Kindergeld (P-Konto)', pm.kg, function (v) { pm.kg = v; }, 'n');
    var out = f.appendChild(el('div', 'pf-maske-erg')); out.setAttribute('aria-live', 'polite');
    function zeile(tab, a, b) { var tr = tab.insertRow(); tr.insertCell().textContent = a; tr.insertCell().textContent = b; }
    function aus() {
      out.textContent = '';
      var n = parse(pm.netto), P = R.RULES.pfaendung;
      var t1 = out.appendChild(el('table', 'pf-tab'));
      if (n !== '' && n >= 0) {
        var e = R.pfaendung(n, pm.pers);
        zeile(t1, 'Freibetrag (Grund + Unterhalt)', euro(e.frei));
        zeile(t1, 'Pfändbar vom Lohn', euro(e.pfaendbar));
        zeile(t1, 'Bleibt vom Lohn', euro(e.bleibt));
        if (e.ueberHoechst) zeile(t1, 'Über ' + euro(P.hoechst) + ' voll pfändbar', '✓');
      }
      var k = R.pkonto({ personen: pm.pers, kindergeldKinder: pm.kg });
      zeile(t1, 'P-Konto Grundfreibetrag (gerundet)', euro(k.sockel));
      zeile(t1, 'P-Konto Erhöhung Unterhalt (mit Bescheinigung)', euro(k.unterhalt));
      zeile(t1, 'P-Konto Kindergeld (mit Bescheinigung)', euro(k.kindergeld));
      zeile(t1, 'P-Konto geschützt im Monat', euro(k.gesamt));
      out.appendChild(el('p', 'small', 'Werte: Grund ' + euro(P.grund) + ', 1. Person ' + euro(P.erste) + ', jede weitere ' + euro(P.weitere) + '; Tabelle gültig bis ' + P.gueltigBis.split('-').reverse().join('.') + ' (§§ 850c, 899, 902 ZPO).'));
      out.appendChild(el('p', 'small', 'Prüfhinweise: Unterhaltsgläubiger (§ 850d ZPO), Antrag auf höheren Freibetrag (§ 850f ZPO), Festsetzung durch das Vollstreckungsgericht (§ 906 ZPO). Für die P-Konto-Bescheinigung stellt SoLo selbst keine Bescheinigung aus.'));
    }
    aus();
  }

  // Ebenen innerhalb der Seiten (für Zurück und Tiefe): Schreiben nach der Wahl des Musters
  function tiefe(fall) { return fall === 'schreiben' && st.ms.art ? 1 : 0; }
  function zurueck(fall) {
    if (fall === 'schreiben' && st.ms.art) { st.ms.art = ''; return true; }
    return false;
  }
  function zuruecksetzen() { st.kc = { i: 0, a: {} }; st.ip = {}; }
  function init(c) { ctx = c; laden(); }
  function neuLaden() { st = { kc: { i: 0, a: {} }, ip: {}, ms: { art: '', g: '', adr: '', az: '', von: '', absender: '' } }; laden(); }

  return {
    // Rechnung (Tests)
    KC: KC, KC_ZUERST: KC_ZUERST, krisenErgebnis: krisenErgebnis, IP: IP.map(function (x) { return x[0]; }), ipFehlend: ipFehlend, MUSTER: MUSTER, schreiben: schreiben,
    LUECKE: LUECKE, WARTEN: WARTEN, hakenNormiere: hakenNormiere,
    // Oberfläche
    init: init, speicherOrt: speicherOrt, neuLaden: neuLaden, krisenCheck: krisenCheck, pruefliste: pruefliste, schreibenSeite: schreibenSeite,
    schreibenVorbelegen: schreibenVorbelegen, wartezeit: wartezeit, mappe: mappe, pfMaske: pfMaske, tiefe: tiefe, zurueck: zurueck, zuruecksetzen: zuruecksetzen,
    kcStart: function () { st.kc = { i: 0, a: {} }; }, haken: function () { return JSON.parse(JSON.stringify(haken)); }
  };
})();
if (typeof module !== 'undefined') module.exports = Geld;
