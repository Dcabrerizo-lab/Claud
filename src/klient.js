// „Für Klient zusammenstellen“ (nur im Beratungsmodus): Die Beraterin hakt an, was der Klient bekommen soll –
// Ergebnis des Hilfen-Checks, Unterlagen-Laufzettel, offene Fristen, Musterschreiben aus der Antragsmappe (soweit vorhanden).
// Daraus entsteht EIN Blatt, wahlweise in der Sprache des Klienten mit Deutsch daneben. Weitergabe nur auf Knopfdruck:
// Drucken oder Teilen (Teilen-Menü des Handys). Kein Server, nichts geht automatisch raus. Kein neuer Rechtsinhalt:
// alle Texte kommen aus den vorhandenen Ergebnissen (ctx.inhalt). Alles nur über textContent (kein innerHTML).
// Vorgänge: der geöffnete, andere offene und gesperrte. Ein gesperrter wird erst nach Eingabe seiner PIN nur im Speicher
// entschlüsselt (ctx.oeffneGesperrt → Promise<Daten>); die Daten werden nie zurückgeschrieben. Falsche PIN: nicht verwendbar.
var Klient = (function () {
  'use strict';
  var ctx = null;
  var offen = false, zurueck = null;
  var vgId = null; // gewählter Vorgang (null = geöffneter Vorgang)
  var vgDaten = null; // Daten eines anderen Vorgangs, nur im Speicher
  var sprache = null; // Sprache des Klienten: Sprachcode oder 'de-einfach'
  var daneben = true; // Deutsch daneben
  var bis = ''; // Laufzettel: mitbringen bis (JJJJ-MM-TT)
  var wahl = {}; // Haken: 'h|id', 'u|id', 'f|id', 'b|id' → true/false
  var basis = null; // Inhalt in der Sprache der App (für die Auswahl-Liste)
  // Weitergabe an die SoLo-App des Klienten (QR-Code / SoLo-Datei, src/weitergabe.js)
  var modus = 'blatt'; // 'blatt' = ausgewählte Teile, 'vorgang' = ganzer Vorgang mit gespeicherten Eingaben
  var mitPin = true, pin = ''; // PIN je Weitergabe (Standard an), Vorschlag 6 Ziffern, nur im Speicher
  var fremd = null; // Blatt aus einer Weitergabe (beim Klienten): nur ansehen, drucken, teilen

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function t(k, p) { return ctx.t(k, p); }

  function spracheTeile(s) { return s === 'de-einfach' ? { l: 'de', ein: true } : { l: s || 'de', ein: false }; }
  function mitDeutsch() { var s = spracheTeile(sprache); return daneben && s.l !== 'de'; }
  function inhaltIn(l, ein) { return ctx.inSprache(l, ein, function () { return ctx.inhalt(vgDaten); }); }

  // Standard: alles angehakt außer den Musterschreiben (enthalten Name und Anschrift aus der Antragsmappe)
  function gewaehlt(art, id) { var k = art + '|' + id; return Object.prototype.hasOwnProperty.call(wahl, k) ? wahl[k] : art !== 'b'; }

  // ---------- Dokument (rein: Inhalt in zwei Sprachen → Abschnitte mit Textpaaren) ----------
  // Ergebnis: { titel: {k, de}, kopf: {k, de}, abschnitte: [{ h: {k, de}, zeilen: [{ art: 'h3'|'p'|'li'|'small'|'pre', k, de }] }], rtl, l }
  function dokument() {
    if (fremd) return fremd;
    var s = spracheTeile(sprache), zwei = mitDeutsch();
    var A = inhaltIn(s.l, s.ein), D = zwei ? inhaltIn('de', false) : null;
    var tA = function (k, p) { return ctx.inSprache(s.l, s.ein, function () { return t(k, p); }); };
    var tD = function (k, p) { return zwei ? ctx.inSprache('de', false, function () { return t(k, p); }) : null; };
    var paar = function (art, a, d) { return { art: art, k: a, de: zwei && d !== a ? d : null }; };
    var lab = function (art, key, wertA, wertD, p) { return paar(art, tA(key, p) + ': ' + wertA, zwei ? tD(key, p) + ': ' + wertD : null); };
    var abschnitte = [];
    var hil = A.hilfen.map(function (x, i) { return { a: x, d: D ? D.hilfen[i] : null }; }).filter(function (z) { return gewaehlt('h', z.a.id); });
    if (hil.length) {
      var z = [];
      hil.forEach(function (p) {
        var d = p.d || {};
        z.push(paar('h3', p.a.name, d.name));
        z.push(lab('li', 'eb.col.einstufung', p.a.lvl, d.lvl));
        if (p.a.betrag && p.a.betrag !== '–') z.push(lab('li', 'eb.col.betrag', p.a.betrag, d.betrag));
        z.push(lab('li', 'eb.col.stelle', p.a.stelle, d.stelle));
        z.push(lab('li', 'eb.col.schritt', p.a.schritt, d.schritt));
      });
      z.push(paar('small', tA('rb.satz'), tD('rb.satz')));
      abschnitte.push({ h: paar('h', tA('kb.d.hilfen'), tD('kb.d.hilfen')), zeilen: z, teil: 'hilfen' });
    }
    var unt = A.unterlagen.map(function (x, i) { return { a: x, d: D ? D.unterlagen[i] : null }; }).filter(function (z) { return gewaehlt('u', z.a.id) && z.a.items.length; });
    if (unt.length) {
      var zu = [];
      unt.forEach(function (p) {
        var d = p.d || { items: [] };
        zu.push(paar('h3', p.a.name, d.name));
        p.a.items.forEach(function (it, i) { zu.push(paar('li', it, d.items[i])); });
      });
      var bisT = bis ? { a: ctx.datum(bis, s.l), d: ctx.datum(bis, 'de') } : null;
      var hk = bisT ? 'kb.d.bringen.bis' : 'kb.d.bringen';
      abschnitte.push({ h: paar('h', tA(hk, bisT ? { datum: bisT.a } : null), tD(hk, bisT ? { datum: bisT.d } : null)), zeilen: zu, teil: 'unterlagen' });
    }
    var fri = A.fristen.map(function (x, i) { return { a: x, d: D ? D.fristen[i] : null }; }).filter(function (z) { return gewaehlt('f', z.a.id); });
    if (fri.length) abschnitte.push({ h: paar('h', tA('kb.d.fristen'), tD('kb.d.fristen')), zeilen: fri.map(function (p) { return paar('li', p.a.text, (p.d || {}).text); }), teil: 'fristen' });
    var bri = A.briefe.filter(function (b) { return gewaehlt('b', b.id); });
    if (bri.length) {
      var zb = [];
      bri.forEach(function (b) { zb.push({ art: 'h3', k: b.name, de: null }); zb.push({ art: 'pre', k: b.text, de: null }); }); // Schreiben sind immer deutsch
      abschnitte.push({ h: paar('h', tA('kb.d.briefe'), tD('kb.d.briefe')), zeilen: zb, teil: 'briefe' });
    }
    return {
      l: s.l, rtl: ctx.rtl(s.l), zwei: zwei,
      titel: paar('h', tA('kb.d.titel'), tD('kb.d.titel')),
      kopf: paar('p', tA('eb.datum', { d: ctx.datum(new Date(), s.l) }), tD('eb.datum', { d: ctx.datum(new Date(), 'de') })),
      abschnitte: abschnitte
    };
  }

  // ---------- Blatt am Bildschirm und im Druck: zweispaltig (links Klient, rechts Deutsch) ----------
  function zelle(tag, text, l, rtl) { var e = el(tag, null, text); e.setAttribute('lang', l); e.setAttribute('dir', rtl ? 'rtl' : 'ltr'); return e; }
  function zeileEl(z, doc) {
    var tag = z.art === 'h' ? 'h3' : z.art === 'h3' ? 'h4' : z.art === 'small' ? 'p' : z.art === 'pre' ? 'pre' : 'p';
    var w = el('div', 'kb-zeile kb-' + z.art + (z.de ? ' kb-paar' : ''));
    var a = zelle(tag, (z.art === 'li' ? '• ' : '') + z.k, z.art === 'pre' ? 'de' : doc.l, z.art === 'pre' ? false : doc.rtl);
    if (z.art === 'small') a.className = 'small';
    w.appendChild(a);
    if (z.de) { var d = zelle(tag, (z.art === 'li' ? '• ' : '') + z.de, 'de', false); d.className = 'kb-de' + (z.art === 'small' ? ' small' : ''); w.appendChild(d); }
    return w;
  }
  function blattZeichnen() {
    var seite = $('kbSeite'); if (!seite) return;
    seite.textContent = '';
    if (modus === 'vorgang' && !fremd && W()) {
      seite.classList.remove('kb-zwei');
      seite.appendChild(el('h3', null, t('kw.vorgang.h')));
      var teile = vorgangsTeile(), ul = el('ul');
      teile.forEach(function (x) { ul.appendChild(el('li', null, x)); });
      if (teile.length) seite.appendChild(ul); else seite.appendChild(el('p', 'muted kb-leer', t('kb.nichts')));
      ['kbDruck', 'kbTeilen'].forEach(function (id) { var b = $(id); if (b) { b.disabled = true; b.hidden = true; } });
      if ($('kbWegBlatt')) $('kbWegBlatt').hidden = true;
      return null;
    }
    ['kbDruck', 'kbTeilen'].forEach(function (id) { var b = $(id); if (b) b.hidden = false; });
    if ($('kbWegBlatt')) $('kbWegBlatt').hidden = !!fremd;
    var doc = dokument();
    seite.classList.toggle('kb-zwei', doc.zwei);
    seite.appendChild(zeileEl(doc.titel, doc)).classList.add('kb-titel');
    seite.appendChild(zeileEl(doc.kopf, doc)).classList.add('kb-kopf');
    if (!doc.abschnitte.length) { seite.appendChild(el('p', 'muted kb-leer', t('kb.leer'))); }
    doc.abschnitte.forEach(function (ab) {
      var sec = el('section', 'kb-abschnitt'); sec.setAttribute('data-teil', ab.teil);
      sec.appendChild(zeileEl(ab.h, doc));
      ab.zeilen.forEach(function (z) { sec.appendChild(zeileEl(z, doc)); });
      seite.appendChild(sec);
    });
    var knopfAn = doc.abschnitte.length > 0;
    ['kbDruck', 'kbTeilen'].forEach(function (id) { var b = $(id); if (b) b.disabled = !knopfAn; });
    return doc;
  }

  // ---------- PDF: abschnittsweise (erst die Sprache des Klienten, darunter klein das Deutsche) ----------
  // pdf-lib kann Schrift von rechts nach links nicht setzen: dann nur Deutsch (Hinweis f.pdfArNote).
  function pdfSeiten() {
    var merk = { s: sprache, d: daneben };
    if (ctx.rtl(spracheTeile(sprache).l)) { sprache = 'de'; daneben = false; }
    try {
      var doc = dokument(), b = [];
      if (fremd && fremd.rtl) { // Blatt aus einer Weitergabe in Schrift von rechts nach links: im PDF nur die deutschen Zeilen
        var nurDe = function (z) { return z.de ? { art: z.art, k: z.de, de: null } : (z.art === 'pre' ? z : null); };
        doc = { titel: nurDe(doc.titel) || { art: 'h', k: 'SoLo', de: null }, kopf: nurDe(doc.kopf) || { art: 'p', k: '', de: null },
          abschnitte: doc.abschnitte.map(function (ab) { return { h: nurDe(ab.h) || { art: 'h', k: '', de: null }, zeilen: ab.zeilen.map(nurDe).filter(Boolean) }; }) };
      }
      var add = function (z) {
        var art = z.art === 'h3' ? 'h' : z.art;
        b.push({ t: art, text: z.art === 'li' ? z.k : z.k });
        if (z.de) b.push({ t: 'small', text: 'DE: ' + z.de });
      };
      add(doc.titel); add(doc.kopf);
      doc.abschnitte.forEach(function (ab) { add(ab.h); ab.zeilen.forEach(add); });
      return [{ blocks: b }];
    } finally { sprache = merk.s; daneben = merk.d; }
  }

  // ---------- Datei für „Teilen“ im Browser (ohne PDF-Modul): eigenständige HTML-Seite aus dem fertigen Blatt ----------
  function htmlDatei() {
    var seite = $('kbSeite');
    var kopf = '<!doctype html><html lang="' + spracheTeile(sprache).l + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SoLo</title>' +
      '<style>body{font-family:system-ui,sans-serif;max-width:60em;margin:1em auto;padding:0 1em;color:#000;background:#fff}.kb-paar{display:grid;grid-template-columns:1fr 1fr;gap:1em}.kb-de{color:#333}pre{white-space:pre-wrap;font:inherit}h3{margin-top:1.4em}.small{font-size:.9em}</style></head><body>';
    return kopf + (seite ? new XMLSerializer().serializeToString(seite) : '') + '</body></html>'; // Inhalt wurde nur mit textContent gebaut (keine fremden Tags)
  }

  // ---------- Drucken und Teilen ----------
  function drucken() {
    var art = ctx.druckArt(), msg = $('kbMsg');
    if (art === 'web') { try { window.print(); } catch (e) {} return; }
    ctx.pdf(pdfSeiten(), t('kb.d.titel'), 'SoLo-Klient.pdf', msg, art, rtlJetzt());
  }
  function rtlJetzt() { return fremd ? !!fremd.rtl : ctx.rtl(spracheTeile(sprache).l); }
  function teilen() {
    var msg = $('kbMsg');
    if (ctx.native()) { ctx.pdf(pdfSeiten(), t('kb.d.titel'), 'SoLo-Klient.pdf', msg, 'teilen', rtlJetzt()); return Promise.resolve('app'); }
    return dateiAusgeben('SoLo-Klient.html', htmlDatei(), 'text/html', msg);
  }
  // Datei über das Teilen-Menü (Messenger, Mail, Dateien) oder als Download; in der App über ctx.nativDatei (Filesystem + Share)
  function dateiAusgeben(name, inhalt, typ, msg) {
    if (ctx.native() && ctx.nativDatei) return Promise.resolve(ctx.nativDatei(name, inhalt, msg)).then(function () { return 'app'; });
    var datei = null;
    try { datei = new File([inhalt], name, { type: typ }); } catch (e) { datei = null; }
    var nav = window.navigator;
    if (datei && nav.share && (!nav.canShare || nav.canShare({ files: [datei] }))) {
      return nav.share({ files: [datei], title: t('kb.d.titel') }).then(function () { return 'geteilt'; }, function () { return 'abgebrochen'; });
    }
    // Fallback: Download
    try {
      var url = URL.createObjectURL(new Blob([inhalt], { type: typ }));
      var a = document.createElement('a'); a.href = url; a.download = name; a.hidden = true;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 4000);
      msg.textContent = t('kb.geladen', { name: name });
    } catch (e) { msg.textContent = t('f.pdfFail'); }
    return Promise.resolve('download');
  }

  // ---------- Weitergabe an die SoLo-App des Klienten (QR-Code, SoLo-Datei) ----------
  function W() { return typeof globalThis !== 'undefined' && globalThis.Weitergabe ? globalThis.Weitergabe : null; }
  function json(v) { if (v == null) return null; if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch (e) { return null; } }
  function vorgangsDaten() { return vgDaten || (ctx.vorgangDaten ? ctx.vorgangDaten() : {}) || {}; }
  function vorgangsName() {
    var vg = ctx.vorgaenge(), a = vg.filter(function (v) { return vgId ? v.id === vgId : v.aktiv; })[0];
    return a && !a.gesperrt ? String(a.name || '').slice(0, 24) : '';
  }
  // Was weitergegeben wird (Daten, aus denen die App des Klienten alles neu erzeugt; keine PDF)
  function inhaltFuerWeitergabe() {
    var w = W(), heute = new Date(), datum = heute.getFullYear() + '-' + ('0' + (heute.getMonth() + 1)).slice(-2) + '-' + ('0' + heute.getDate()).slice(-2);
    if (modus === 'vorgang') {
      var roh = vorgangsDaten(), d = {}, n = 0;
      w.FELDER.forEach(function (k) { if (typeof roh[k] === 'string' && roh[k]) { d[k] = roh[k]; n++; } });
      return n ? { s: 1, typ: 'vorgang', name: vorgangsName(), datum: datum, daten: d } : null;
    }
    var doc = dokument();
    if (!doc.abschnitte.length) return null;
    var o = { s: 1, typ: 'auswahl', name: vorgangsName(), datum: datum, blatt: JSON.parse(JSON.stringify(doc)) };
    // Gewählte offene Fristen zusätzlich als Daten: der Klient kann sie als Erinnerung übernehmen
    var fl = json(vorgangsDaten()['lotse.fristliste']);
    if (fl && Array.isArray(fl.e)) {
      var e = fl.e.filter(function (x) { return x && !x.erledigt && typeof x.id === 'string' && gewaehlt('f', x.id); }).slice(0, 50);
      if (e.length) o.fristen = { v: 1, e: e };
    }
    return o;
  }
  function vorgangsTeile() { // Liste für den ganzen Vorgang: was enthalten ist (Bezeichnungen)
    var roh = vorgangsDaten();
    return W().FELDER.filter(function (k) { return typeof roh[k] === 'string' && roh[k]; }).map(function (k) { return t('kw.teil.' + k.replace('lotse.', '')); })
      .filter(function (x, i, a) { return a.indexOf(x) === i; });
  }
  function kwMsg(text) { var m = $('kwMsg'); if (m) m.textContent = text || ''; }
  var FEHLER = { zuGross: 'kw.f.zuGross', technik: 'kw.f.technik', schema: 'kw.f.schema' };
  function codeBauen() {
    // Weitergeben gibt es nur im Beratungsmodus und nur aus der geöffneten Zusammenstellung (nicht aus einem empfangenen Blatt)
    if (!ctx || !ctx.beratung() || !offen || fremd || !W()) return Promise.reject(Object.assign(new Error('technik'), { art: 'technik' }));
    var i = inhaltFuerWeitergabe();
    if (!i) return Promise.reject(Object.assign(new Error('leer'), { art: 'leer' }));
    kwMsg(t('kw.bitte'));
    return W().packen(i, mitPin ? pin : null);
  }
  function qrZeigen() {
    var box = $('kwQr'); if (!box) return Promise.resolve(false);
    box.textContent = ''; box.hidden = true;
    return codeBauen().then(function (code) {
      var svg = W().qrSvg(document, code, t('kw.qr.label'));
      if (!svg) { kwMsg(t('kw.f.qrGross')); return false; }
      box.appendChild(svg);
      box.appendChild(el('p', 'small', t('kw.qr.hilfe')));
      // Die PIN steht bewusst nicht beim QR-Code: ein Foto des Codes soll die PIN nicht mit enthalten
      if (mitPin) box.appendChild(el('p', 'small kw-pinwdh', t('kw.pin.hinweis')));
      box.hidden = false; kwMsg('');
      return true;
    }, function (e) { kwMsg(t(e && e.art === 'leer' ? 'kb.leer' : FEHLER[e && e.art] || 'kw.f.technik')); return false; });
  }
  function dateiTeilen() {
    var box = $('kwQr'); if (box) { box.textContent = ''; box.hidden = true; }
    return codeBauen().then(function (code) {
      var name = 'SoLo-' + (modus === 'vorgang' ? 'Vorgang' : 'Unterlagen') + '.solo';
      kwMsg('');
      return dateiAusgeben(name, W().datei(code), 'text/plain', $('kwMsg'));
    }, function (e) { kwMsg(t(e && e.art === 'leer' ? 'kb.leer' : FEHLER[e && e.art] || 'kw.f.technik')); return false; });
  }
  // Vorab prüfen, ob der Inhalt in einen QR-Code passt (UX-Audit D #8: nicht erst nach dem Tippen „Zu groß“ melden).
  // Ohne PIN packen (keine Schlüsselableitung, schnell) und Platz für Salz, IV und Prüfsumme (44 Byte ≈ 60 Zeichen) dazurechnen.
  // Passt es nicht: Hinweis vorher, „Als SoLo-Datei teilen“ wird Hauptknopf, „QR-Code zeigen“ bleibt tippbar (prüft beim Tippen erneut).
  var qrLauf = 0, qrUhr = null;
  function qrPruefen() {
    if (qrUhr) clearTimeout(qrUhr);
    qrUhr = setTimeout(qrPruefenJetzt, 200);
  }
  function qrPruefenJetzt() {
    qrUhr = null;
    var w = W(), nr = ++qrLauf;
    if (!w || !offen || fremd || !$('kwQrBtn')) return Promise.resolve(null);
    var i = null; try { i = inhaltFuerWeitergabe(); } catch (e) { i = null; }
    if (!i) { qrAnzeige(true); return Promise.resolve(null); }
    return w.packen(i, null).then(function (code) {
      var passt = !!w.qrMatrix(code + new Array(61).join('A'));
      if (nr === qrLauf) qrAnzeige(passt);
      return passt;
    }, function () { if (nr === qrLauf) qrAnzeige(false); return false; });
  }
  function qrAnzeige(passt) {
    var q = $('kwQrBtn'), f = $('kwDateiBtn'), h = $('kwQrHinweis'); if (!q || !f || !h) return;
    q.className = passt ? 'btn' : 'btn ghost'; f.className = passt ? 'btn ghost' : 'btn';
    if (passt) q.removeAttribute('aria-disabled'); else q.setAttribute('aria-disabled', 'true');
    h.hidden = passt;
    if (!passt && q.nextSibling !== null && q.parentNode.firstChild === q) q.parentNode.insertBefore(f, q); // Datei zuerst
    if (passt && q.parentNode.firstChild !== q) q.parentNode.insertBefore(q, f);
  }
  function pinText() { return pin.slice(0, 3) + ' ' + pin.slice(3); }
  function weitergabeZeichnen() {
    var box = $('kwBox'), w = W(); if (!box) return;
    box.textContent = ''; box.hidden = !w || !!fremd;
    if (!w || fremd) return;
    box.appendChild(el('h4', null, t('kw.h')));
    box.appendChild(el('p', 'small', t('kw.intro')));
    var lab = el('label', 'check'), cb = el('input');
    cb.type = 'checkbox'; cb.id = 'kwPinAn'; cb.checked = mitPin;
    lab.appendChild(cb); lab.appendChild(el('span', null, t('kw.pin.an'))); box.appendChild(lab);
    var pinZeile = el('div', 'kw-pin'); pinZeile.id = 'kwPinZeile';
    if (mitPin) {
      var p = el('p', 'kw-pinwert'); p.appendChild(el('span', null, t('kw.pin.ist') + ' '));
      var b = el('b', null, pinText()); b.id = 'kwPin'; b.setAttribute('dir', 'ltr'); p.appendChild(b);
      pinZeile.appendChild(p);
      pinZeile.appendChild(el('p', 'small', t('kw.pin.hinweis')));
      var neuB = el('button', 'linkbtn', t('kw.pin.neu')); neuB.type = 'button'; neuB.id = 'kwPinNeu';
      neuB.addEventListener('click', function () { pin = w.pinVorschlag(); weitergabeZeichnen(); });
      pinZeile.appendChild(neuB);
    } else {
      var warn = el('p', 'small kw-offen', t('kw.pin.aus')); warn.id = 'kwOhnePin'; pinZeile.appendChild(warn);
    }
    box.appendChild(pinZeile);
    var det = el('details', 'kw-wie'); det.appendChild(el('summary', null, t('kw.wie.h'))); det.appendChild(el('p', 'small', t('kw.wie.t'))); box.appendChild(det);
    cb.addEventListener('change', function () { mitPin = cb.checked; weitergabeZeichnen(); var c = $('kwPinAn'); if (c) c.focus(); });
    var btns = el('div', 'btns');
    var q = el('button', 'btn', t('kw.qr')); q.type = 'button'; q.id = 'kwQrBtn'; q.addEventListener('click', qrZeigen);
    var f = el('button', 'btn ghost', t('kw.datei')); f.type = 'button'; f.id = 'kwDateiBtn'; f.addEventListener('click', dateiTeilen);
    btns.appendChild(q); btns.appendChild(f); box.appendChild(btns);
    var qh = el('p', 'small kw-qr-zuviel', t('kw.qr.zuViel')); qh.id = 'kwQrHinweis'; qh.hidden = true; box.appendChild(qh);
    var m = el('p', 'msg'); m.id = 'kwMsg'; m.setAttribute('role', 'status'); box.appendChild(m);
    var qr = el('div', 'kw-qr'); qr.id = 'kwQr'; qr.hidden = true; box.appendChild(qr);
    qrPruefen();
  }
  function modusWahl(wrap) {
    if (!W()) return;
    var f = el('fieldset', 'kb-gruppe kw-modus'); f.id = 'kwModus'; f.appendChild(el('legend', null, t('kw.modus')));
    [['blatt', 'kw.modus.blatt'], ['vorgang', 'kw.modus.vorgang']].forEach(function (x) {
      var lab = el('label', 'check'), r = el('input');
      r.type = 'radio'; r.name = 'kwModus'; r.value = x[0]; r.id = 'kwModus-' + x[0]; r.checked = modus === x[0];
      r.addEventListener('change', function () { if (!r.checked) return; modus = x[0]; auswahlZeichnen(); blattZeichnen(); qrPruefen(); var z = $('kwModus-' + x[0]); if (z) z.focus(); });
      lab.appendChild(r); lab.appendChild(el('span', null, t(x[1]))); f.appendChild(lab);
    });
    if (modus === 'vorgang') f.appendChild(el('p', 'small', t('kw.modus.vorgang.t')));
    wrap.appendChild(f);
  }

  // ---------- Auswahl (Vorgang, Sprache, Haken) ----------
  function haken(box, art, id, text) {
    var lab = el('label', 'check'), cb = el('input');
    cb.type = 'checkbox'; cb.checked = gewaehlt(art, id); cb.setAttribute('data-kb', art + '|' + id);
    cb.addEventListener('change', function () { wahl[art + '|' + id] = cb.checked; zaehlen(); blattZeichnen(); qrPruefen(); });
    lab.appendChild(cb); lab.appendChild(el('span', null, text)); box.appendChild(lab);
  }
  // Jede Gruppe zugeklappt (UX-Audit D #8): Überschrift mit Zähler „8 von 8“, die Haken erst beim Aufklappen
  function gruppe(wrap, titelKey, id) {
    var det = el('details', 'kb-auf'); det.id = id + 'Auf'; det.setAttribute('data-titel', t(titelKey));
    det.appendChild(el('summary', null, t(titelKey)));
    var f = el('fieldset', 'kb-gruppe'); f.id = id; f.appendChild(el('legend', 'vh', t(titelKey)));
    det.appendChild(f); wrap.appendChild(det); return f;
  }
  function zaehlen() {
    var wrap = $('kbWahl'); if (!wrap) return;
    Array.prototype.forEach.call(wrap.querySelectorAll('details.kb-auf'), function (det) {
      var cb = det.querySelectorAll('input[data-kb]'), n = 0;
      Array.prototype.forEach.call(cb, function (c) { if (c.checked) n++; });
      det.querySelector('summary').textContent = t('kb.zaehler', { titel: det.getAttribute('data-titel'), n: String(n), m: String(cb.length) });
    });
  }

  function vorgangWahl(wrap) {
    var vg = ctx.vorgaenge();
    if (vg.length < 2) return;
    var f = el('div', 'field kb-vg'), lab = el('label', null, t('kb.vorgang')), sel = el('select');
    sel.id = 'kbVorgang'; lab.setAttribute('for', 'kbVorgang');
    vg.forEach(function (v) {
      var o = el('option', null, v.gesperrt ? '🔒 ' + t('kb.gesperrt') : (v.name || t('kb.ohneName')) + (v.aktiv ? ' · ' + t('kb.geoeffnet') : ''));
      o.value = v.id; if (v.gesperrt) o.setAttribute('data-gesperrt', '1');
      if ((vgId || (vg.filter(function (x) { return x.aktiv; })[0] || {}).id) === v.id) o.selected = true;
      sel.appendChild(o);
    });
    f.appendChild(lab); f.appendChild(sel);
    var pinBox = el('div', 'kb-pin'); pinBox.hidden = true;
    var pl = el('label', null, t('kb.pin')), pin = el('input'), ok = el('button', 'btn ghost klein', t('kb.pinOk')), pm = el('p', 'msg');
    pin.type = 'password'; pin.id = 'kbPin'; pin.setAttribute('inputmode', 'numeric'); pin.setAttribute('autocomplete', 'off'); pl.setAttribute('for', 'kbPin');
    ok.type = 'button'; ok.id = 'kbPinOk'; pm.id = 'kbPinMsg'; pm.setAttribute('role', 'status');
    pinBox.appendChild(pl); pinBox.appendChild(pin); pinBox.appendChild(ok); pinBox.appendChild(pm);
    f.appendChild(pinBox);
    var vorher = sel.value;
    var nehmen = function (id, daten) { vgId = id; vgDaten = daten; wahl = {}; basisNeu(); auswahlZeichnen(); blattZeichnen(); qrPruefen(); };
    sel.addEventListener('change', function () {
      var o = sel.options[sel.selectedIndex], v = vg.filter(function (x) { return x.id === sel.value; })[0];
      if (!v) return;
      if (o.getAttribute('data-gesperrt')) { pinBox.hidden = false; pm.textContent = ''; pin.value = ''; pin.focus(); return; }
      pinBox.hidden = true; vorher = sel.value;
      nehmen(v.aktiv ? null : v.id, v.aktiv ? null : ctx.daten(v.id));
    });
    ok.addEventListener('click', function () {
      var id = sel.value, p = String(pin.value || '');
      pin.value = ''; // PIN nicht im Feld behalten
      pm.textContent = '';
      Promise.resolve().then(function () { return ctx.oeffneGesperrt(id, p); }).then(function (daten) {
        if (!daten || typeof daten !== 'object') throw new Error('leer');
        nehmen(id, daten);
      }, function (e) {
        sel.value = vorher; pinBox.hidden = true;
        // Wartezeit nach Fehlversuchen (Vorgaenge.oeffneGesperrt: reject ohne falsch, mit warten in ms) ist keine falsche PIN
        var tx = e && !e.falsch && e.warten > 0 ? t('vg.sperre.warten', { s: String(Math.ceil(e.warten / 1000)) }) : t('kb.pinFalsch');
        var m = $('kbPinMsg') || pm; m.textContent = tx;
        var g = $('kbVgMsg'); if (g) g.textContent = tx;
      });
    });
    wrap.appendChild(f);
    var g = el('p', 'msg'); g.id = 'kbVgMsg'; g.setAttribute('role', 'status'); wrap.appendChild(g);
  }

  function spracheWahl(wrap) {
    var f = el('div', 'field kb-sprache'), lab = el('label', null, t('kb.sprache')), sel = el('select');
    sel.id = 'kbSprache'; lab.setAttribute('for', 'kbSprache');
    ctx.sprachen().forEach(function (s) { var o = el('option', null, s.name); o.value = s.code; sel.appendChild(o); });
    var oe = el('option', null, t('kb.einfach')); oe.value = 'de-einfach'; sel.appendChild(oe);
    sel.value = sprache;
    var dl = el('label', 'check kb-daneben'), dc = el('input');
    dc.type = 'checkbox'; dc.id = 'kbDaneben'; dc.checked = daneben;
    dl.appendChild(dc); dl.appendChild(el('span', null, t('kb.daneben')));
    var zeigen = function () { dl.hidden = spracheTeile(sprache).l === 'de'; };
    sel.addEventListener('change', function () { sprache = sel.value; zeigen(); blattZeichnen(); qrPruefen(); });
    dc.addEventListener('change', function () { daneben = dc.checked; blattZeichnen(); qrPruefen(); });
    f.appendChild(lab); f.appendChild(sel); wrap.appendChild(f); wrap.appendChild(dl); zeigen();
  }

  function basisNeu() { basis = ctx.inhalt(vgDaten); }

  function auswahlZeichnen() {
    var wrap = $('kbWahl'); if (!wrap) return;
    wrap.textContent = '';
    wrap.appendChild(el('h3', 'kb-schritt', t('kb.s1')));
    vorgangWahl(wrap);
    modusWahl(wrap);
    if (modus === 'vorgang' && W()) return; // ganzer Vorgang: keine Sprache, keine Haken
    spracheWahl(wrap);
    var b = basis || { hilfen: [], unterlagen: [], fristen: [], briefe: [] };
    if (b.hilfen.length) { var g1 = gruppe(wrap, 'kb.teil.hilfen', 'kbHilfen'); b.hilfen.forEach(function (x) { haken(g1, 'h', x.id, x.name + ' – ' + x.lvl); }); }
    var mitU = b.unterlagen.filter(function (x) { return x.items.length; });
    if (mitU.length) {
      var g2 = gruppe(wrap, 'kb.teil.unterlagen', 'kbUnterlagen');
      mitU.forEach(function (x) { haken(g2, 'u', x.id, x.name + ' (' + x.items.length + ')'); });
      var fb = el('div', 'field kb-bis'), bl = el('label', null, t('kb.bis')), bi = el('input');
      bi.type = 'date'; bi.id = 'kbBis'; bi.value = bis; bl.setAttribute('for', 'kbBis');
      bi.addEventListener('input', function () { bis = /^\d{4}-\d{2}-\d{2}$/.test(bi.value) ? bi.value : ''; blattZeichnen(); });
      bi.addEventListener('change', function () { bis = /^\d{4}-\d{2}-\d{2}$/.test(bi.value) ? bi.value : ''; blattZeichnen(); });
      fb.appendChild(bl); fb.appendChild(bi); g2.appendChild(fb);
    }
    if (b.fristen.length) { var g3 = gruppe(wrap, 'kb.teil.fristen', 'kbFristen'); b.fristen.forEach(function (x) { haken(g3, 'f', x.id, x.text); }); }
    if (b.briefe.length) { var g4 = gruppe(wrap, 'kb.teil.briefe', 'kbBriefe'); b.briefe.forEach(function (x) { haken(g4, 'b', x.id, x.name); }); }
    if (!b.hilfen.length && !mitU.length && !b.fristen.length && !b.briefe.length) wrap.appendChild(el('p', 'muted', t('kb.nichts')));
    zaehlen();
  }

  // ---------- Öffnen, Schließen, Sichtbarkeit ----------
  function oeffnen() {
    if (!ctx || !ctx.beratung()) return;
    zurueck = document.activeElement;
    vgId = null; vgDaten = null; wahl = {}; bis = ''; fremd = null;
    sprache = ctx.lang(); daneben = true;
    modus = 'blatt'; mitPin = true; pin = W() ? W().pinVorschlag() : '';
    $('kbMsg').textContent = '';
    ansichtNurBlatt(false);
    basisNeu(); auswahlZeichnen(); blattZeichnen(); weitergabeZeichnen();
    $('klientBlatt').hidden = false; offen = true;
    ctx.blatt(true);
    var h = $('h-kb'); if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) {} }
  }
  function schliessen() {
    if (!offen) return;
    ansichtNurBlatt(false);
    offen = false; vgDaten = null; vgId = null; fremd = null; pin = ''; // Daten anderer Vorgänge und PIN sofort vergessen
    var kb = $('kwBox'); if (kb) kb.textContent = '';
    var s = $('kbSeite'); if (s) s.textContent = '';
    var w = $('kbWahl'); if (w) w.textContent = '';
    $('klientBlatt').hidden = true;
    ctx.blatt(false);
    if (zurueck && zurueck.focus) zurueck.focus();
  }
  // Knopf nur im Beratungsmodus und mit Ergebnis; Privatmodus: nichts sichtbar
  var letztesErgebnis = false;
  function sichtbar(mitErgebnis) {
    if (mitErgebnis !== undefined) letztesErgebnis = !!mitErgebnis; else mitErgebnis = letztesErgebnis;
    var b = $('kbOpen'); if (!b || !ctx) return;
    b.hidden = !(ctx.beratung() && mitErgebnis);
    if (!ctx.beratung() && offen && !fremd) schliessen();
  }
  function sprachWechsel() { if (offen && !fremd) { basisNeu(); auswahlZeichnen(); blattZeichnen(); weitergabeZeichnen(); } }
  // Blatt aus einer Weitergabe ansehen (beim Klienten, für alle Nutzer): ohne Auswahl, nur Drucken und Teilen
  function vorschau(zeigen) {
    var s = $('kbSeite'), b = $('kbVorschau'); if (s) s.classList.toggle('kb-zu', !zeigen);
    if (b) { b.setAttribute('aria-expanded', zeigen ? 'true' : 'false'); b.textContent = t(zeigen ? 'kb.vorschau.zu' : 'kb.vorschau'); }
  }
  function ansichtNurBlatt(an) {
    ['kbWahl', 'kbDs', 'kbS2'].forEach(function (id) { var e = $(id); if (e) e.hidden = !!an; });
    var vk = $('kbVorschauKopf'); if (vk) vk.hidden = !!an;
    vorschau(!!an); // empfangenes Blatt: das Blatt ist der Inhalt; beim Zusammenstellen zuerst zugeklappt
    var intro = document.querySelector('#klientBlatt [data-t="kb.intro"]'); if (intro) intro.hidden = !!an;
    var h = $('h-kb'); if (h) h.textContent = t(an ? 'kw.blatt.h' : 'kb.h');
  }
  function zeigen(doc) {
    if (!ctx || !doc || !Array.isArray(doc.abschnitte)) return false;
    zurueck = document.activeElement;
    fremd = doc; vgId = null; vgDaten = null;
    $('kbMsg').textContent = '';
    var w = $('kbWahl'); if (w) w.textContent = '';
    ansichtNurBlatt(true); weitergabeZeichnen(); blattZeichnen();
    $('klientBlatt').hidden = false; offen = true;
    ctx.blatt(true);
    var h = $('h-kb'); if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) {} }
    return true;
  }

  // ctx = { t, lang(), sprachen() → [{code, name}], inSprache(l, einfach, fn), inhalt(daten|null) → { hilfen, unterlagen, fristen, briefe },
  //         beratung(), vorgaenge() → [{ id, name, aktiv, gesperrt }], daten(id), oeffneGesperrt(id, pin) → Promise<Daten>,
  //         datum(d, l), rtl(l), native(), druckArt() → 'web'|'drucken'|'teilen', pdf(seiten, titel, name, msg, art, rtlHinweis), blatt(an) }
  function init(c) {
    ctx = c;
    var o = $('kbOpen'); if (o) o.addEventListener('click', oeffnen);
    var d = $('kbDruck'); if (d) d.addEventListener('click', drucken);
    var s = $('kbTeilen'); if (s) s.addEventListener('click', teilen);
    var v = $('kbVorschau'); if (v) v.addEventListener('click', function () { var sei = $('kbSeite'); vorschau(!!(sei && sei.classList.contains('kb-zu'))); });
  }

  return { init: init, oeffnen: oeffnen, zeigen: zeigen, qrZeigen: qrZeigen, qrPruefen: qrPruefenJetzt, dateiTeilen: dateiTeilen, inhaltFuerWeitergabe: function () { return inhaltFuerWeitergabe(); }, schliessen: schliessen, offen: function () { return offen; }, sichtbar: sichtbar, sprache: sprachWechsel,
    dokument: function () { return dokument(); }, pdfSeiten: pdfSeiten, teilen: teilen, drucken: drucken };
})();
Klient.cacheAufraeumen = (function () {
  // Reste vom Teilen: Die App schreibt .solo- und PDF-Dateien (und Seitenbilder beim Einlesen) kurz in ihren eigenen Cache
  // (Capacitor Filesystem, Directory.Cache = 'CACHE') und löscht sie nach dem Teilen. Wird die App dabei beendet, bleiben sie liegen.
  // Beim Start: nur Dateien direkt im App-Cache mit diesen Endungen bzw. diesem Namen löschen, keine Ordner, nichts außerhalb.
  // Dazu die CSV-Dateien aus dem Haushaltsbuch und der Schulden-Liste (src/haushalt.js, src/schulden.js): nur mit genau diesen Namen.
  var CACHE_RESTE = /^[^/\\]+\.(?:solo|pdf)$|^solo-pdfseite-\d+\.jpg$|^(?:Haushaltsbuch|Schulden)-\d{4}-\d\d-\d\d\.csv$|^Belege-\d{4}\.csv$/i;
  function cacheAufraeumen(fsys) {
    if (!fsys || typeof fsys.readdir !== 'function' || typeof fsys.deleteFile !== 'function') return Promise.resolve(0);
    return Promise.resolve().then(function () { return fsys.readdir({ path: '', directory: 'CACHE' }); }).then(function (r) {
      var namen = ((r && r.files) || []).filter(function (f) { // Filesystem ab Version 5: { name, type }; ältere: nur der Name
        var n = typeof f === 'string' ? f : f && f.name;
        return typeof n === 'string' && !(f && f.type === 'directory') && CACHE_RESTE.test(n);
      }).map(function (f) { return typeof f === 'string' ? f : f.name; });
      return Promise.all(namen.map(function (n) {
        return Promise.resolve().then(function () { return fsys.deleteFile({ path: n, directory: 'CACHE' }); }).then(function () { return 1; }, function () { return 0; });
      })).then(function (a) { return a.reduce(function (x, y) { return x + y; }, 0); });
    }).catch(function () { return 0; });
  }
  return cacheAufraeumen;
})();
Klient.fotosAufraeumen = (function () {
  // Android: Fotos der Kamera liegen nicht im Cache, sondern im App-eigenen Bilderordner (getExternalFilesDir(DIRECTORY_PICTURES),
  // Capacitor Filesystem: Directory.External = 'EXTERNAL', Unterordner „Pictures“). Dort legen ab:
  //   - die Dateiauswahl der WebView mit Kamera („QR-Code scannen“, src/weitergabe.js), Capacitor BridgeWebChromeClient.createImageFile,
  //   - das Kamera-Plugin (Foto eines Formulars), CameraUtils.createImageFile,
  // beide mit dem Namen JPEG_<JJJJMMTT>_<HHMMSS>_<Zufallszahl>.jpg (File.createTempFile). Die WebView löscht ihr Foto nicht
  // (Schlussprüfung 21.11.2026, P3). Gelöscht werden nur Dateien mit genau diesem Namen, keine Ordner, nichts außerhalb.
  // Aufruf: nach dem Einlesen eines QR-Fotos und beim App-Start (Reste nach einem Abbruch). Nur Android (src/app.js).
  var FOTO = /^JPEG_\d{8}_\d{6}_\d+\.jpg$/;
  return function fotosAufraeumen(fsys) {
    if (!fsys || typeof fsys.readdir !== 'function' || typeof fsys.deleteFile !== 'function') return Promise.resolve(0);
    return Promise.resolve().then(function () { return fsys.readdir({ path: 'Pictures', directory: 'EXTERNAL' }); }).then(function (r) {
      var namen = ((r && r.files) || []).filter(function (f) {
        var n = typeof f === 'string' ? f : f && f.name;
        return typeof n === 'string' && !(f && f.type === 'directory') && FOTO.test(n);
      }).map(function (f) { return typeof f === 'string' ? f : f.name; });
      return Promise.all(namen.map(function (n) {
        return Promise.resolve().then(function () { return fsys.deleteFile({ path: 'Pictures/' + n, directory: 'EXTERNAL' }); }).then(function () { return 1; }, function () { return 0; });
      })).then(function (a) { return a.reduce(function (x, y) { return x + y; }, 0); });
    }).catch(function () { return 0; });
  };
})();
if (typeof module !== 'undefined') module.exports = Klient;
