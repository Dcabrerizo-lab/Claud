// „Ich ziehe aus“: eigener Bereich für junge Menschen (Azubis, Studierende, junge Erwachsene, Careleaver).
// Checklisten zum Abhaken, Geld, Kostenfallen, Versicherungen, Hilfen. Alles bleibt auf dem Gerät.
// Texte: src/lang/ausziehen/<Sprache>.json (Schlüssel „az.*“), Einfache Sprache: src/lang/einfach/ausziehen.json.
// Quellen: jede Zahl, Frist und Rechtsaussage hat eine Quelle (Q) mit Abrufdatum; die Texte nennen die Vorschrift in Klammern.
var Ausziehen = (function () {
  'use strict';

  // ---------- Quellen (amtlich, sonst Verbraucherzentrale; abgerufen am 20.11.2026) ----------
  var GII = 'gesetze-im-internet.de';
  var Q = {
    bgb551: ['§ 551 BGB', GII + '/bgb/__551.html'],
    bgb540: ['§ 540, § 553 BGB', GII + '/bgb/__540.html'],
    bgb556: ['§ 556 Abs. 3 BGB', GII + '/bgb/__556.html'],
    bgb675x: ['§ 675x BGB', GII + '/bgb/__675x.html'],
    bgb355: ['§ 312g, § 312j, § 355 BGB', GII + '/bgb/__355.html'],
    bgb504a: ['§ 504a BGB', GII + '/bgb/__504a.html'],
    sgb2_22_5: ['§ 22 Abs. 5 SGB II', GII + '/sgb_2/__22.html'],
    sgb2_22_6: ['§ 22 Abs. 6 SGB II', GII + '/sgb_2/__22.html'],
    sgb2_24: ['§ 24 Abs. 3 und 6, § 37 SGB II', GII + '/sgb_2/__24.html'],
    sgb2_7: ['§ 7 Abs. 5, § 27 SGB II', GII + '/sgb_2/__7.html'],
    sgb2_28: ['§ 28 Abs. 1 SGB II', GII + '/sgb_2/__28.html'],
    sgb1_60: ['§ 60 SGB I', GII + '/sgb_1/__60.html'],
    sgb1_14: ['§ 14 SGB I', GII + '/sgb_1/__14.html'],
    sgg84: ['§ 84 SGG', GII + '/sgg/__84.html'],
    wofg27: ['§ 27 WoFG (in Bayern: BayWoFG)', GII + '/wofg/__27.html'],
    dsgvo15: ['Art. 15 Abs. 3 DSGVO', 'eur-lex.europa.eu/eli/reg/2016/679/oj'],
    bmg: ['§ 17 Abs. 1, § 19 BMG', GII + '/bmg/__17.html'],
    stromgvv: ['§ 2 StromGVV', GII + '/stromgvv/__2.html'],
    rbstv: ['§ 2, § 4 Abs. 1 RBeitrStV; Verbraucherzentrale „Rundfunkbeitrag: Infos für Studierende und Auszubildende“ (Stand 16.01.2026)', 'verbraucherzentrale.de/wissen/digitale-welt/fernsehen/rundfunkbeitrag-infos-fuer-studierende-und-auszubildende-5792'],
    tkg56: ['§ 56 TKG', GII + '/tkg_2021/__56.html'],
    estg39e: ['§ 39e Abs. 4 EStG', GII + '/estg/__39e.html'],
    fzv15: ['§ 15 FZV', GII + '/fzv_2023/__15.html'],
    zkg31: ['§ 31 ZKG', GII + '/zkg/__31.html'],
    zpo850k: ['§ 850k ZPO', GII + '/zpo/__850k.html'],
    vzUnterlagen: ['Verbraucherzentrale „Aufbewahrungspflichten: Welche Unterlagen muss ich wie lange behalten?“ (Stand 23.10.2025)', 'verbraucherzentrale.de/node/84296'],
    vzVers: ['Verbraucherzentrale „Zum Start in Ausbildung oder Job: Welche Versicherungen brauche ich?“ (Stand 21.11.2025)', 'verbraucherzentrale.de/wissen/geld-versicherungen/weitere-versicherungen/zum-start-in-ausbildung-oder-job-welche-versicherungen-brauche-ich-40786'],
    vzhhVers: ['Verbraucherzentrale Hamburg „Welche Versicherung brauche ich wirklich?“ (Stand 15.04.2026)', 'vzhh.de/themen/versicherungen/versicherungsbedarf/welche-versicherung-brauche-ich-wirklich'],
    sgb5_10: ['§ 10 SGB V', GII + '/sgb_5/__10.html'],
    vvg19: ['§ 19 VVG', GII + '/vvg_2008/__19.html'],
    vzBnpl: ['Verbraucherzentrale „Jetzt kaufen, später bezahlen“ (Stand 02.12.2025)', 'verbraucherzentrale.de/node/102366'],
    vzKredit: ['Verbraucherzentrale „Unseriöse Kredite erkennen: 6 häufige Fallen“ (Stand 13.01.2026)', 'verbraucherzentrale.de/wissen/geld-versicherungen/kredit-schulden-insolvenz/unserioese-kredite-erkennen-6-haeufige-fallen-11480'],
    sgb3_60: ['§ 56, § 60 SGB III', GII + '/sgb_3/__60.html'],
    bafoeg: ['§ 2 BAföG', GII + '/baf_g/__2.html'],
    wogg20: ['§ 20 Abs. 2 WoGG', GII + '/wogg/__20.html'],
    estg32: ['§ 32 Abs. 4, § 74 Abs. 1 EStG', GII + '/estg/__74.html'],
    sgb6_48: ['§ 48 Abs. 4 SGB VI', GII + '/sgb_6/__48.html'],
    sgb8_41: ['§ 41 SGB VIII', GII + '/sgb_8/__41.html'],
    sgb8_41a: ['§ 41a SGB VIII', GII + '/sgb_8/__41a.html'],
    sgb8_36b: ['§ 41 Abs. 3, § 36b SGB VIII', GII + '/sgb_8/__36b.html'],
    sgb8_94: ['§ 92 Abs. 1a, § 94 Abs. 3 und 6 (weggefallen) SGB VIII', GII + '/sgb_8/__94.html'],
    sgb8_9a: ['§ 9a SGB VIII', GII + '/sgb_8/__9a.html']
  };
  var ABGERUFEN = '20.11.2026';

  // ---------- Inhalt ----------
  // Punkt: id (Texte az.p.<id> und az.p.<id>.t), q: Quellen, mehr: erst unter „Weitere Punkte“, warn: deutlich hervorgehoben,
  // knopf: Weg in einen anderen Bereich (plan, check, briefe, pfaendung, vers, brief), moeglich: Hilfe mit Einstufung „möglich“
  var SYM = {
    vorher: '<path d="M4 11l8-6 8 6v9H4z"/><path d="M9 14l2 2 4-4"/>',
    tage: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="M9 15l2 2 4-4"/>',
    geld: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="14.5" r="1.5"/>',
    achtung: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
    hilfen: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    vers: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',
    care: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M3 20c.5-4 3-6 6-6s5.5 2 6 6M15 14c3 0 5 2 5.5 5"/>'
  };
  var BEREICHE = [
    { id: 'vorher', liste: true, punkte: [
      { id: 'leisten', knopf: 'plan' },
      { id: 'u25', warn: true, q: ['sgb2_22_5', 'sgb2_24'] },
      { id: 'suche', q: ['wofg27'], knopf: 'check' },
      { id: 'vertrag', q: ['bgb551'] },
      { id: 'uebergabe' },
      { id: 'erstausstattung', q: ['sgb2_24'] },
      { id: 'kaution', q: ['sgb2_22_6'] },
      { id: 'wg', mehr: true, q: ['bgb540'] },
      { id: 'schufaAuskunft', mehr: true, q: ['dsgvo15'] }
    ] },
    { id: 'tage', liste: true, punkte: [
      { id: 'melden', q: ['bmg'] },
      { id: 'strom', q: ['stromgvv'] },
      { id: 'rundfunk', q: ['rbstv'] },
      { id: 'haftpflicht', q: ['vzVers'], knopf: 'vers' },
      { id: 'adresse', q: ['sgb1_60'] },
      { id: 'internet', q: ['tkg56'] },
      { id: 'post' },
      { id: 'papiere', mehr: true, q: ['estg39e'] },
      { id: 'arzt', mehr: true },
      { id: 'haus', mehr: true },
      { id: 'kfz', mehr: true, q: ['fzv15'] }
    ] },
    { id: 'geld', punkte: [
      { id: 'konten', q: ['zkg31', 'zpo850k'], knopf: 'pfaendung' },
      { id: 'trick' },
      { id: 'vers', knopf: 'vers' },
      { id: 'termine', q: ['bgb675x'] },
      { id: 'nebenkosten', q: ['bgb556'], knopf: 'briefe' },
      { id: 'ordner', q: ['vzUnterlagen'] }
    ] },
    { id: 'achtung', punkte: [
      { id: 'raten', q: ['vzBnpl'] },
      { id: 'dispo', q: ['bgb504a'] },
      { id: 'handy' },
      { id: 'ohneSchufa', q: ['vzKredit'] },
      { id: 'abo', q: ['bgb355'] },
      { id: 'unnoetig', q: ['vzVers', 'vzhhVers'], knopf: 'vers' },
      { id: 'schufa', q: ['dsgvo15'] },
      { id: 'postLiegen', q: ['sgg84'], knopf: 'briefe' }
    ] },
    { id: 'hilfen', punkte: [
      { id: 'bab', q: ['sgb3_60', 'wogg20'], moeglich: true },
      { id: 'bafoeg', q: ['bafoeg', 'wogg20'], moeglich: true },
      { id: 'wohngeld', q: ['wogg20'], moeglich: true },
      { id: 'kindergeld', q: ['estg32'], moeglich: true },
      { id: 'grundsicherung', q: ['sgb2_22_5', 'sgb2_22_6', 'sgb2_24', 'sgb2_7'], moeglich: true },
      { id: 'rfBefreiung', q: ['rbstv'], moeglich: true },
      { id: 'but', q: ['sgb2_28'], moeglich: true },
      { id: 'waisenrente', q: ['sgb6_48'], moeglich: true }
    ] },
    { id: 'care', liste: true, unter: true, punkte: [
      { id: 'jungVolljaehrig', q: ['sgb8_41'] },
      { id: 'nachbetreuung', q: ['sgb8_41a'] },
      { id: 'uebergang', q: ['sgb8_36b'] },
      { id: 'kostenbeitrag', q: ['sgb8_94'] },
      { id: 'beratung', q: ['sgb1_14', 'sgb8_9a'] },
      { id: 'antrag', q: ['sgb8_41'], knopf: 'brief' }
    ] },
    { id: 'vers', unter: true, stufen: [
      { id: 'muss', punkte: [{ id: 'kv', q: ['sgb5_10', 'vzVers'] }, { id: 'phv', q: ['vzVers'] }] },
      { id: 'sinnvoll', punkte: [{ id: 'bu', q: ['vzVers', 'vvg19'] }, { id: 'kfzH', q: ['vzVers'] }] },
      { id: 'kommtDrauf', punkte: [{ id: 'hausrat', q: ['vzVers'] }] },
      { id: 'unnoetig', punkte: [{ id: 'geraete', q: ['vzVers', 'vzhhVers'] }, { id: 'restschuld', q: ['vzhhVers'] }, { id: 'gepaeck', q: ['vzVers', 'vzhhVers'] }] }
    ] }
  ];
  // Übersicht: 7 Kacheln im 2-Spalten-Raster (Stil der Startseite), jede öffnet ihre Unterseite
  var HAUPT = ['vorher', 'tage', 'geld', 'vers', 'achtung', 'hilfen', 'care'];
  function bereich(id) { return BEREICHE.filter(function (b) { return b.id === id; })[0] || null; }
  function allePunkte(b) { return b.stufen ? b.stufen.reduce(function (a, s) { return a.concat(s.punkte); }, []) : b.punkte; }

  // Alle Textschlüssel (Tests: jede Sprache hat sie, keine Rohschlüssel)
  function schluessel() {
    var k = ['az.h', 'az.kachel', 'az.kachel.t', 'az.lead', 'az.zurueck', 'az.quelle', 'az.mehrDazu', 'az.weitere', 'az.erledigt', 'az.notiz', 'az.notiz.t',
      'az.moeglich', 'az.speicherFehler', 'az.u25.warn', 'az.u25.warn.h', 'az.brief.zeigen', 'az.brief.kopieren', 'az.brief.kopiert',
      'az.brief.hinweis', 'az.brief.label', 'az.knopf.plan', 'az.knopf.check', 'az.knopf.briefe', 'az.knopf.pfaendung', 'az.knopf.vers', 'az.hilfen.check', 'az.vers.tipp', 'az.stand'];
    BEREICHE.forEach(function (b) {
      k.push('az.' + b.id + '.h', 'az.' + b.id + '.t');
      if (b.stufen) b.stufen.forEach(function (s) { k.push('az.stufe.' + s.id); });
      allePunkte(b).forEach(function (p) { k.push('az.p.' + p.id, 'az.p.' + p.id + '.t'); });
    });
    return k;
  }
  function quelleText(p) { return (p.q || []).map(function (id) { return Q[id][0]; }).join('; '); }

  // ---------- Speicherung: kleine Schnittstelle, später an Vorgänge bzw. PIN anzubinden (Ausziehen.speicherOrt) ----------
  var SCHLUESSEL = 'lotse.ausziehen';
  var ctx = null, daten = null, ansicht = '';
  function leer() { return { v: 1, ab: {}, notiz: {} }; }
  var speicher = {
    laden: function (cb) {
      var p = ctx && ctx.plug && ctx.plug('Preferences');
      if (p) { p.get({ key: SCHLUESSEL }).then(function (r) { cb(r && r.value); }, function () { cb(null); }); return; }
      try { cb(localStorage.getItem(SCHLUESSEL)); } catch (e) { cb(null); }
    },
    schreiben: function (text, cb) {
      var p = ctx && ctx.plug && ctx.plug('Preferences');
      if (p) { p.set({ key: SCHLUESSEL, value: text }).then(function () { cb(null); }, function (e) { cb(e || new Error('speichern')); }); return; }
      try { localStorage.setItem(SCHLUESSEL, text); cb(null); } catch (e) { cb(e); }
    }
  };
  function speicherOrt(s) { if (s && s.laden) speicher.laden = s.laden; if (s && s.schreiben) speicher.schreiben = s.schreiben; }
  var LISTEN_IDS = {};
  BEREICHE.forEach(function (b) { if (b.liste) b.punkte.forEach(function (p) { LISTEN_IDS[p.id] = b.id; }); });
  function normiere(d) {
    var x = leer();
    if (!d || typeof d !== 'object') return x;
    if (d.ab && typeof d.ab === 'object') Object.keys(d.ab).forEach(function (k) { if (LISTEN_IDS[k] && d.ab[k] === true) x.ab[k] = true; });
    if (d.notiz && typeof d.notiz === 'object') Object.keys(d.notiz).forEach(function (k) { var b = bereich(k); if (b && b.liste && typeof d.notiz[k] === 'string') x.notiz[k] = d.notiz[k].slice(0, 4000); });
    return x;
  }
  function fortschritt(d, id) {
    var b = bereich(id); if (!b || !b.liste) return null;
    return { n: b.punkte.filter(function (p) { return d.ab[p.id]; }).length, von: b.punkte.length };
  }
  var $ = function (id) { return document.getElementById(id); };
  function sichern() {
    var msg = $('azSpeicherMsg');
    speicher.schreiben(JSON.stringify(daten), function (err) { if (msg) msg.textContent = err ? t('az.speicherFehler') : ''; });
  }

  // ---------- Briefvorlage (Deutsch, für das Jugendamt; nur die Art der Stelle, keine Anschrift) ----------
  function briefText() {
    return [
      'An das Jugendamt', '',
      'Antrag auf Hilfe für junge Volljährige (§ 41 SGB VIII)', '',
      'Sehr geehrte Damen und Herren,', '',
      'hiermit beantrage ich Hilfe für junge Volljährige nach § 41 SGB VIII ab dem ________ [oder: die Fortsetzung meiner bisherigen Hilfe über meinen 18. Geburtstag hinaus].', '',
      'Ich brauche weiter Unterstützung, weil: ________ (zum Beispiel Wohnung, Ausbildung oder Schule, Umgang mit Geld, Post von Ämtern).', '',
      'Bitte laden Sie mich zu einem Gespräch über den Hilfeplan ein (§ 36 SGB VIII). Bitte bestätigen Sie mir den Eingang dieses Antrags schriftlich.', '',
      'Mit freundlichen Grüßen', '',
      'Name, Geburtsdatum', 'Anschrift', 'Telefon oder E-Mail', 'Ort, Datum, Unterschrift'
    ].join('\n');
  }

  // ---------- Oberfläche ----------
  function t(k, p) { return ctx.t(k, p); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }).replace(/§ /g, '§\u00a0'); } // „§ 22“ nicht umbrechen
  function sym(id) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + SYM[id] + '</svg>'; }
  function hatPlan() { return !!$('v-haushalt'); }
  var STIL = '.start-raster .sk-ausziehen{--c:var(--c-ausziehen)}' +
    '.az{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}.az>*{min-width:0}.az h3.pf-frage{font-size:1.45em;font-weight:800;margin:6px 0 0}.az-lead{margin:0;color:var(--muted)}' +
    
    '.az-fort{font-weight:700}' +
    '.az-raster{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9.5em),1fr));gap:12px;margin:8px 0;max-width:640px}' +
    '.az-raster>.az-k:last-child:nth-child(odd){grid-column:1/-1;min-height:0}.az-raster{min-width:0}' +
    '.az .az-k{--c:var(--c-ausziehen);min-height:140px}.az .az-k-achtung{--c:var(--c-briefe)}.az-k .az-fort{font-weight:700;margin-top:4px;background:rgba(255,255,255,.2);border-radius:999px;padding:2px 10px;justify-self:start}' +
    '.az-warn{border:3px solid var(--hint);background:var(--hint-bg);color:var(--ink);border-radius:var(--r-item,16px);padding:14px 16px;display:grid;gap:6px}' +
    '.az-warn b{font-size:1.1em;color:var(--hint)}.az-warn p{margin:0}' +
    '.az-liste{list-style:none;margin:0;padding:0;display:grid;gap:10px}' +
    '.az-punkt{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:12px 14px;display:grid;gap:6px}' +
    '.az-punkt.warn-p{border:2px solid var(--hint)}' +
    '.az-check{display:flex;gap:12px;align-items:flex-start;min-height:44px;cursor:pointer;font-weight:700}' +
    '.az-check input{flex:none;width:26px;height:26px;margin:2px 0 0;accent-color:var(--accent)}' +
    '.az-punkt.ok .az-check span{text-decoration:line-through;text-decoration-thickness:1px;opacity:.75}' +
    '.az-titel{font-weight:700;margin:0}.az-kurz{margin:0}.az-punkt>.az-q{margin:0}.az-punkt>.btns{margin:0}' +
    '.az-punkt details>summary,.az-weitere>summary{min-height:44px;display:flex;align-items:center;cursor:pointer;font-weight:600;color:var(--accent)}' +
    '.az-punkt details p{margin:6px 0}.az-q{font-size:.85em;color:var(--muted)}' +
    '.az-chip{display:inline-block;font-size:.85em;font-weight:700;border-radius:999px;padding:2px 10px;background:var(--warn-bg);color:var(--warn);justify-self:start}' +
    '.az-stufe{margin:10px 0 0;font-size:1.1em;border-inline-start:6px solid var(--c-ausziehen);padding-inline-start:10px}' +
    '.az-stufe.s-unnoetig{border-color:var(--muted)}' +
    '.az textarea{font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--field,var(--line));border-radius:10px;padding:10px 12px;width:100%;min-height:96px;resize:vertical;box-sizing:border-box}' +
    '.az-brief textarea{min-height:320px;font-size:.95em}' +
    '#azSpeicherMsg:empty{display:none}' +
    '@media (forced-colors:active){.az-warn,.az-k{border:2px solid CanvasText}}';
  function stil() { if ($('azStil')) return; var s = document.createElement('style'); s.id = 'azStil'; s.textContent = STIL; document.head.appendChild(s); }

  function knopfHtml(art, cls) {
    if (art === 'plan' && !hatPlan()) return '';
    return '<button type="button" class="btn ' + (cls || 'ghost') + ' klein" data-az-weg="' + art + '">' + esc(t('az.knopf.' + art)) + '</button>';
  }
  // Quelle bleibt deutsch und links-nach-rechts, auch in Arabisch, Farsi und Paschtu (sonst springen Klammern und Paragrafen)
  function quelleHtml(p) { return p.q ? '<p class="az-q">' + esc(t('az.quelle', { q: '@@Q@@', d: ABGERUFEN })).replace('@@Q@@', '<bdi dir="ltr" lang="de">' + esc(quelleText(p)) + '</bdi>') + '</p>' : ''; }
  function punktHtml(p, liste) {
    var ok = liste && daten.ab[p.id];
    var h = '<li class="az-punkt' + (p.warn ? ' warn-p' : '') + (ok ? ' ok' : '') + '" id="az-p-' + p.id + '">';
    if (liste) h += '<label class="az-check"><input type="checkbox" data-az-ab="' + p.id + '"' + (ok ? ' checked' : '') + '><span>' + esc(t('az.p.' + p.id)) + '</span></label>';
    else h += '<p class="az-titel">' + esc(t('az.p.' + p.id)) + '</p>';
    if (p.moeglich) h += '<span class="az-chip">' + esc(t('az.moeglich')) + '</span>';
    var det = esc(t('az.p.' + p.id + '.t', p.id === 'kv' && ctx.famversGrenze ? { grenze: ctx.famversGrenze() } : null)).split('\n').map(function (s) { return '<p>' + s + '</p>'; }).join('');
    if (p.knopf === 'brief') {
      h += '<details class="az-brief"><summary>' + esc(t('az.brief.zeigen')) + '</summary>' + det +
        '<p class="small">' + esc(t('az.brief.hinweis')) + '</p><label for="azBrief" class="small">' + esc(t('az.brief.label')) + '</label>' +
        '<textarea id="azBrief" lang="de" dir="ltr" spellcheck="false">' + esc(briefText()) + '</textarea>' +
        '<div class="btns"><button type="button" class="btn" id="azBriefKopieren">' + esc(t('az.brief.kopieren')) + '</button></div><p class="small" id="azBriefMsg" role="status"></p>' + quelleHtml(p) + '</details>';
    } else if (!liste) {
      // Info-Punkte: der erste Satzblock gleich sichtbar, der Rest zum Aufklappen
      var teile = det.split('</p>').filter(Boolean).map(function (x) { return x + '</p>'; });
      h += teile[0].replace('<p>', '<p class="az-kurz">');
      var rest = teile.slice(1).join('') + (p.knopf ? '<div class="btns">' + knopfHtml(p.knopf) + '</div>' : '') + quelleHtml(p);
      if (teile.length > 1) h += '<details><summary>' + esc(t('az.mehrDazu')) + '</summary>' + rest + '</details>';
      else h += rest;
    } else {
      h += '<details><summary>' + esc(t('az.mehrDazu')) + '</summary>' + det + (p.knopf ? '<div class="btns">' + knopfHtml(p.knopf) + '</div>' : '') + quelleHtml(p) + '</details>';
    }
    return h + '</li>';
  }

  function renderEinstieg(box, fokus) {
    var h = '<p class="az-lead">' + esc(t('az.lead')) + '</p><div class="az-raster">';
    HAUPT.forEach(function (id) {
      var f = fortschritt(daten, id);
      h += '<button type="button" class="sk az-k az-k-' + id + '" data-az-geh="' + id + '" id="az-geh-' + id + '"><span class="sk-sym" aria-hidden="true">' + sym(id) + '</span><span class="sk-txt"><b>' + esc(t('az.' + id + '.h')) + '</b><span>' +
        esc(t('az.' + id + '.t')) + '</span>' + (f ? '<span class="az-fort">' + esc(t('az.erledigt', { n: f.n, von: f.von })) + '</span>' : '') + '</span></button>';
    });
    h += '</div><p class="small muted">' + esc(t('home.privat')) + '</p>';
    box.innerHTML = h;
    if (fokus) { var b = box.querySelector('#az-geh-' + fokus); if (b) b.focus(); }
  }
  function renderBereich(box, b) {
    var h = '<div class="btns"><button type="button" class="btn ghost klein" data-az-zurueck>' + esc(t('az.zurueck')) + '</button></div>' +
      '<h3 class="pf-frage" id="azH" tabindex="-1">' + esc(t('az.' + b.id + '.h')) + '</h3><p class="az-lead">' + esc(t('az.' + b.id + '.t')) + '</p>';
    var f = fortschritt(daten, b.id);
    if (f) h += '<p class="az-fort" id="azFort" role="status">' + esc(t('az.erledigt', { n: f.n, von: f.von })) + '</p>';
    if (b.id === 'vorher') h += '<div class="az-warn" role="note"><b>' + esc(t('az.u25.warn.h')) + '</b><p>' + esc(t('az.u25.warn')) + '</p></div>';
    if (b.id === 'geld' && hatPlan()) h += '<div class="btns">' + knopfHtml('plan', 'primary') + '</div>';
    if (b.id === 'hilfen') h += '<div class="btns">' + knopfHtml('check', 'primary').replace(esc(t('az.knopf.check')), esc(t('az.hilfen.check'))) + '</div>';
    if (b.stufen) {
      b.stufen.forEach(function (s) {
        h += '<h4 class="az-stufe s-' + s.id + '">' + esc(t('az.stufe.' + s.id)) + '</h4><ul class="az-liste">' + s.punkte.map(function (p) { return punktHtml(p, false); }).join('') + '</ul>';
      });
      h += '<p class="small">' + esc(t('az.vers.tipp')) + '</p>';
    } else {
      var oben = b.punkte.filter(function (p) { return !p.mehr; }), unten = b.punkte.filter(function (p) { return p.mehr; });
      h += '<ul class="az-liste">' + oben.map(function (p) { return punktHtml(p, b.liste); }).join('') + '</ul>';
      if (unten.length) h += '<details class="az-weitere"' + (unten.some(function (p) { return daten.ab[p.id]; }) ? ' open' : '') + '><summary>' + esc(t('az.weitere', { n: unten.length })) + '</summary><ul class="az-liste">' + unten.map(function (p) { return punktHtml(p, b.liste); }).join('') + '</ul></details>';
    }
    if (b.liste) h += '<div class="field"><label for="azNotiz">' + esc(t('az.notiz')) + '</label><textarea id="azNotiz" aria-describedby="azNotizH"></textarea><span class="hint" id="azNotizH">' + esc(t('az.notiz.t')) + '</span></div>';
    h += '<p class="small muted">' + esc(t('az.stand', { d: ABGERUFEN })) + '</p>';
    h += '<div class="btns"><button type="button" class="btn ghost" data-az-zurueck>' + esc(t('az.zurueck')) + '</button></div>';
    box.innerHTML = h;
    var n = $('azNotiz'); if (n) n.value = daten.notiz[b.id] || '';
  }
  var zuletzt = '', herkunft = []; // Herkunft merken: „Zurück“ führt dorthin, woher man kam (z. B. Geld -> Versicherungen -> Geld)
  function render(fokus) {
    var box = $('azInhalt'); if (!ctx || !box || !daten) return;
    var b = ansicht ? bereich(ansicht) : null;
    if (!b) renderEinstieg(box, fokus ? zuletzt : ''); else renderBereich(box, b);
    if (fokus && b) { var hh = $('azH'); if (hh) hh.focus(); }
  }
  function geh(id) { herkunft.push(ansicht); zuletzt = ansicht; ansicht = id || ''; render(true); oben(); }
  function zurueck() { zuletzt = ansicht; ansicht = herkunft.length ? herkunft.pop() : ''; render(true); oben(); }
  function oben() { try { window.scrollTo(0, 0); } catch (e) { /* JSDOM */ } }
  function weg(art) {
    if (art === 'vers') { geh('vers'); return; }
    var ziel = { plan: 'haushalt', check: 'leistungen', briefe: 'briefe', pfaendung: 'pfaendung' }[art];
    if (ziel) ctx.zeige(ziel, true);
  }
  function kopieren() {
    var ta = $('azBrief'), msg = $('azBriefMsg'); if (!ta) return;
    var fertig = function () { if (msg) msg.textContent = t('az.brief.kopiert'); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(ta.value).then(fertig, function () { ta.select(); try { document.execCommand('copy'); fertig(); } catch (e) { /* ohne Kopieren */ } }); return; } } catch (e) { /* weiter */ }
    ta.select(); try { document.execCommand('copy'); fertig(); } catch (e) { /* ohne Kopieren */ }
  }
  var notizTimer = null;
  function init(c) {
    ctx = c; daten = leer(); stil();
    var box = $('azInhalt');
    if (box) {
      box.addEventListener('click', function (ev) {
        var el = ev.target.closest ? ev.target.closest('[data-az-geh],[data-az-weg],[data-az-zurueck],#azBriefKopieren') : null; if (!el) return;
        if (el.id === 'azBriefKopieren') { kopieren(); return; }
        if (el.hasAttribute('data-az-weg')) { weg(el.getAttribute('data-az-weg')); return; }
        if (el.hasAttribute('data-az-zurueck')) { zurueck(); return; }
        geh(el.getAttribute('data-az-geh'));
      });
      box.addEventListener('change', function (ev) {
        var id = ev.target.getAttribute && ev.target.getAttribute('data-az-ab'); if (!id) return;
        if (ev.target.checked) daten.ab[id] = true; else delete daten.ab[id];
        var li = $('az-p-' + id); if (li) li.classList.toggle('ok', !!ev.target.checked);
        var f = fortschritt(daten, LISTEN_IDS[id]), fo = $('azFort'); if (f && fo) fo.textContent = t('az.erledigt', { n: f.n, von: f.von });
        sichern();
      });
      box.addEventListener('input', function (ev) {
        if (ev.target.id !== 'azNotiz' || !ansicht) return;
        daten.notiz[ansicht] = ev.target.value.slice(0, 4000);
        clearTimeout(notizTimer); notizTimer = setTimeout(sichern, 400);
      });
    }
    var go = $('goAusziehen'); if (go) go.addEventListener('click', function () { ansicht = ''; herkunft = []; ctx.zeige('ausziehen', true); });
    // „Alle Angaben löschen“ löscht auch Haken und Notizen: das erledigt die App über die Vorgänge (lotse.ausziehen in Vorgaenge.DATEN, danach neuLaden)
    speicher.laden(function (v) { try { daten = normiere(v ? JSON.parse(v) : null); } catch (e) { daten = leer(); } render(); });
  }

  return {
    // Inhalt und Daten (Tests)
    BEREICHE: BEREICHE, HAUPT: HAUPT, Q: Q, ABGERUFEN: ABGERUFEN, schluessel: schluessel, normiere: normiere, fortschritt: fortschritt, briefText: briefText, quelleText: quelleText, allePunkte: allePunkte,
    // Oberfläche
    init: init, zeigen: function () { render(); }, zurueck: zurueck, sprache: function () { render(); }, speicherOrt: speicherOrt, oeffnen: function (id) { geh(id); },
    daten: function () { return JSON.parse(JSON.stringify(daten)); }, laden: function (d) { daten = normiere(d); sichern(); render(); },
    // Nach einem Wechsel des Vorgangs: Haken und Notizen des geöffneten Vorgangs lesen (ohne zu schreiben); offen: Unterseite geöffnet?
    neuLaden: function () { speicher.laden(function (v) { try { daten = normiere(v ? JSON.parse(v) : null); } catch (e) { daten = leer(); } render(); }); },
    offen: function () { return !!ansicht; }
  };
})();
if (typeof module !== 'undefined') module.exports = Ausziehen;
