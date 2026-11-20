// Hilfe bei einer Aufforderung zur Senkung der Unterkunfts- oder Heizkosten (Jobcenter § 22 Abs. 1 SGB II, Sozialamt § 35 SGB XII).
// Erkennung: BriefLesen.kostensenkung(). Hier: was angezeigt wird (anzeige), der Antwort-Entwurf (entwurf) und der Erklärkasten (zeige).
// Keine Nachrechnung, keine selbst berechnete Frist. Texte aus i18n (el.ks.*), nur textContent. Gespeichert wird hier nichts;
// die Frist übernimmt das Fristen-Modul (FristenOrdner.hinzu), der Knopf erscheint nur, wenn es das gibt.
// Stand der Regeln: 20.11.2026 (§ 22 SGB II und § 35 SGB XII in der Fassung seit 1.7.2026, BGBl. 2026 I Nr. 107).
const KostensenkungHilfe = (function () {
  'use strict';

  const DETAILS = ['karenz', 'heiz', 'wirt', 'tod', 'mpb', 'sa'];
  const GRUENDE = ['krank', 'pflege', 'kinder', 'schwanger', 'alter', 'kurz', 'tod', 'wirt', 'heiz', 'grenze'];

  // Was angezeigt wird (ohne Oberfläche, für Tests)
  function anzeige(ks) {
    const beide = ks.kostenIst != null && ks.grenze != null;
    const det = DETAILS.filter((d) => d !== 'sa' || ks.traeger === 'sa');
    if (ks.heiz) { det.splice(det.indexOf('heiz'), 1); det.unshift('heiz'); }
    return {
      titel: ks.heiz ? 'el.ks.titelHeiz' : 'el.ks.titel',
      zahlen: beide && ks.kostenIst > ks.grenze,
      diff: beide ? Math.round((ks.kostenIst - ks.grenze) * 100) / 100 : null,
      // Grenze vom 1,5-Fachen (§ 22 Abs. 1 S. 6 SGB II, § 35 Abs. 1 S. 7 SGB XII): nur für die Unterkunft, nicht für die Heizung
      deckel: !ks.heiz && ((beide && ks.kostenIst > 1.5 * ks.grenze) || !!ks.eineinhalb),
      ws: ks.rechtsbehelf ? 'el.ks.wsDoch' : 'el.ks.keinWs',
      details: det
    };
  }

  const p2 = (n) => ('0' + n).slice(-2);
  const deDatum = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '.' + m[2] + '.' + m[1] : ''; };
  const isoAus = (d) => { const m = /^(\d{1,2})\.(\d{1,2})\.(20\d{2})$/.exec(d || ''); return m ? m[3] + '-' + p2(m[2]) + '-' + p2(m[1]) : ''; };
  // Paragraf passend zum Träger; unbekannt: beide nennen
  const para = (tr, jc, sa) => (tr === 'jc' ? jc : tr === 'sa' ? sa : jc + ' / ' + sa);

  // Antwort an das Amt (deutsch, geht an ein deutsches Amt). Behauptet nur, was angehakt oder eingetragen ist.
  // o: { name, anschrift, ort, stelle, bg, az, art (Kachel), heute: Date, gruende: { krank: true, … }, bem }
  function entwurf(ks, o) {
    o = o || {}; const g = o.gruende || {}, L = [], tr = ks.traeger;
    const h = o.heute || new Date();
    const heute = p2(h.getDate()) + '.' + p2(h.getMonth() + 1) + '.' + h.getFullYear();
    const ortKurz = String(o.ort || '').replace(/^\s*\d{5}\s*/, '').trim();
    [o.name, o.anschrift, o.ort].forEach((x) => { if (x) L.push(String(x)); });
    if (L.length) L.push('');
    // Empfänger: nur die Stelle aus dem Brief; sonst nur die Art der Stelle, nie eine geratene Anschrift
    const art = tr || (o.art === 'jc' || o.art === 'sa' ? o.art : null);
    L.push(o.stelle ? 'An: ' + o.stelle : art === 'jc' ? 'An das Jobcenter' : art === 'sa' ? 'An das Sozialamt' : 'An: ________ (Stelle, die den Brief geschickt hat)');
    const z = [];
    if (o.bg) z.push('BG-Nummer: ' + o.bg);
    if (o.az && o.az !== o.bg) z.push('Aktenzeichen: ' + o.az);
    if (z.length) L.push(z.join(' · '));
    L.push('', (ortKurz ? ortKurz + ', ' : '') + 'den ' + heute, '');
    const vom = ks.datum ? ' vom ' + deDatum(ks.datum) : '';
    L.push('Ihr Schreiben' + vom + ' zur Senkung der Kosten der Unterkunft und Heizung', '', 'Sehr geehrte Damen und Herren,', '',
      'ich habe Ihr Schreiben' + vom + ' erhalten. Dazu nehme ich wie folgt Stellung:', '');
    const T = {
      krank: 'Ein Umzug ist mir aus gesundheitlichen Gründen nicht zumutbar. Ein ärztliches Attest lege ich bei / reiche ich nach. (Nichtzutreffendes streichen)',
      pflege: 'Ich bin auf Pflege bzw. Hilfe in meinem jetzigen Wohnumfeld angewiesen (bzw. pflege einen Angehörigen in der Nähe).',
      kinder: 'In meinem Haushalt leben Kinder, die hier Kita bzw. Schule besuchen. Ein Umzug könnte einen Wechsel der Kita bzw. Schule bedeuten.',
      schwanger: 'Ich bin schwanger; der Haushalt wird größer. Für die künftige Haushaltsgröße sind meine Kosten möglicherweise angemessen.',
      alter: 'Ich wohne seit ___ Jahren in dieser Wohnung. Wegen meines Alters bzw. meiner Einschränkungen ist mir ein Umzug kaum möglich.',
      kurz: 'Ich werde voraussichtlich bald keine Leistungen mehr benötigen (zum Beispiel wegen Arbeitsaufnahme am ___).',
      tod: 'Ein Mitglied meines Haushalts ist im ___ verstorben. Ich bitte zu prüfen, ob die Kosten davor angemessen waren und eine Senkung deshalb mindestens zwölf Monate nicht zumutbar ist (' +
        para(tr, '§ 22 Abs. 1 Satz 11 SGB II', '§ 35 Abs. 3 Satz 4 SGB XII') + ').',
      wirt: 'Meine Kosten liegen nur geringfügig über der Grenze. Ich bitte zu prüfen, ob ein Umzug unter Berücksichtigung der Umzugskosten wirtschaftlich wäre (' +
        para(tr, '§ 22 Abs. 1 Satz 12 SGB II', '§ 35 Abs. 3 Satz 3 SGB XII') + ').',
      heiz: 'Meine Heizkosten sind aus folgenden Gründen höher: ___.',
      grenze: 'Ich bitte um Mitteilung, wie die von Ihnen genannte Angemessenheitsgrenze ermittelt wurde (Konzept, Stand, Vergleichsraum).'
    };
    GRUENDE.forEach((k) => { if (g[k]) L.push(T[k], ''); });
    const bem = String(o.bem || '').trim();
    if (bem) L.push('Ich bemühe mich um eine Senkung der Kosten. Bisher habe ich: ' + bem, '');
    L.push('Ich bitte Sie, die tatsächlichen Kosten weiter zu übernehmen, solange mir eine Senkung nicht möglich oder nicht zumutbar ist, und vor einer Kürzung meine Gründe zu prüfen. Bitte bestätigen Sie mir den Eingang dieses Schreibens.',
      '', 'Mit freundlichen Grüßen', '', '', '________________________', o.name ? String(o.name) : '');
    const anl = [];
    if (g.krank) anl.push('ärztliches Attest');
    if (bem) anl.push('Nachweise über meine Bemühungen');
    if (anl.length) L.push('', 'Anlagen: ' + anl.join(', '));
    return L.join('\n').replace(/\n+$/, '') + '\n';
  }

  // Erklärkasten in box (z. B. #elErg). ctx: { t, tL, person, kennungen, briefArt, schreibenKnopf, heute }
  function zeige(box, ks, ctx) {
    const t = ctx.t, tL = ctx.tL || ctx.t, a = anzeige(ks);
    const neu = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };
    const d = neu('div', null, 'el-erkl el-ks');
    d.setAttribute('data-traeger', ks.traeger || 'x');
    d.appendChild(neu('b', t(a.titel)));
    d.appendChild(neu('p', tL('el.ks.kern')));
    if (a.deckel) d.appendChild(neu('p', tL('el.ks.deckel'), 'el-ks-deckel'));
    if (a.zahlen) d.appendChild(neu('p', t('el.ks.zahlen', { ist: { eur: ks.kostenIst }, grenze: { eur: ks.grenze }, diff: { eur: a.diff } })));
    else {
      if (ks.kostenIst != null) d.appendChild(neu('p', t('el.ks.ist', { ist: { eur: ks.kostenIst } })));
      if (ks.grenze != null) d.appendChild(neu('p', t('el.ks.grenze', { grenze: { eur: ks.grenze } })));
    }
    if (ks.frist) {
      d.appendChild(neu('p', t('el.ks.frist', { frist: ks.frist })));
      if (ks.fristZeile) d.appendChild(neu('p', t('el.ks.beleg', { zeile: ks.fristZeile }), 'small muted'));
    }
    if (ks.stichtag) d.appendChild(neu('p', t('el.ks.stichtag', { datum: ks.stichtag })));
    d.appendChild(neu('p', t(a.ws), 'el-ks-ws'));

    d.appendChild(neu('h3', t('el.ks.tun.h')));
    const ul = d.appendChild(neu('ul'));
    ['gruende', 'belege', 'beratung', 'umzug'].forEach((k) => {
      const li = ul.appendChild(neu('li'));
      li.appendChild(neu('b', t('el.ks.tun.' + k + '.t')));
      li.appendChild(document.createTextNode(' ' + tL('el.ks.tun.' + k)));
    });
    a.details.forEach((k) => {
      const det = d.appendChild(neu('details'));
      det.appendChild(neu('summary', t('el.ks.d.' + k + '.h')));
      const inn = det.appendChild(neu('div', null, 'inner'));
      inn.appendChild(neu('p', tL('el.ks.d.' + k)));
    });

    // Knöpfe: Antwort entwerfen; Frist übernehmen nur mit dem Fristen-Modul
    const btns = d.appendChild(neu('div', null, 'btns'));
    const bAntw = btns.appendChild(neu('button', t('el.ks.antwort.btn'), 'btn'));
    bAntw.type = 'button'; bAntw.id = 'ks-antwort'; bAntw.setAttribute('aria-expanded', 'false');
    const FO = typeof globalThis !== 'undefined' ? globalThis.FristenOrdner : undefined;
    if (FO && typeof FO.hinzu === 'function') {
      const fw = d.appendChild(neu('div', null, 'el-ks-frist'));
      const lab = fw.appendChild(neu('label', t('el.ks.frist.datum')));
      lab.setAttribute('for', 'ks-frist-datum');
      const inp = fw.appendChild(neu('input')); inp.type = 'date'; inp.id = 'ks-frist-datum'; inp.value = isoAus(ks.frist);
      const bF = fw.appendChild(neu('button', t('el.ks.frist.btn'), 'chip')); bF.type = 'button'; bF.id = 'ks-frist';
      const fm = fw.appendChild(neu('p', null, 'small')); fm.setAttribute('role', 'status');
      const fehler = () => { fm.textContent = t('el.ks.frist.fehler'); inp.focus(); };
      bF.addEventListener('click', () => {
        const v = inp.value;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { fehler(); return; }
        // Notiz nur ein kurzer Titel; Beginn und Länge der Frist legt das Amt fest, die App rechnet nichts aus
        try {
          Promise.resolve(FO.hinzu({ art: 'kostensenkung', datum: v, titel: t(a.titel), stelle: ks.traeger, quelle: 'brief', notiz: t('el.ks.tun.belege.t') }))
            .then((r) => { if (r === false) fehler(); else fm.textContent = t('el.ks.frist.ok'); }, fehler);
        } catch (e) { fehler(); }
      });
    }

    // Antwort-Entwurf: Haken (werden nicht gespeichert), Bemühungen, Textfeld mit dem Schreiben
    const form = d.appendChild(neu('div', null, 'el-ks-antwort')); form.hidden = true;
    const fs = form.appendChild(neu('fieldset'));
    fs.appendChild(neu('legend', t('el.ks.g.h')));
    GRUENDE.forEach((k) => {
      const l = fs.appendChild(neu('label', null, 'el-ks-g'));
      const cb = l.appendChild(neu('input')); cb.type = 'checkbox'; cb.id = 'ks-g-' + k;
      l.appendChild(document.createTextNode(' ' + t('el.ks.g.' + k)));
    });
    const lb = form.appendChild(neu('label', t('el.ks.bem'))); lb.setAttribute('for', 'ks-bem');
    const bem = form.appendChild(neu('textarea')); bem.id = 'ks-bem'; bem.rows = 2;
    const lt = form.appendChild(neu('label', t('el.ks.text'))); lt.setAttribute('for', 'ks-text');
    const ta = form.appendChild(neu('textarea')); ta.id = 'ks-text'; ta.rows = 14; ta.hidden = true;
    const cRow = form.appendChild(neu('div', null, 'btns'));
    const copy = cRow.appendChild(neu('button', t('el.ks.kopieren'), 'btn')); copy.type = 'button'; copy.id = 'ks-copy';
    const cm = form.appendChild(neu('p', null, 'small')); cm.setAttribute('role', 'status');
    form.appendChild(neu('p', t('el.ks.antwort.hinweis'), 'note'));

    const k = ctx.kennungen || {}, pe = ctx.person || {};
    const schreiben = () => {
      const gr = {}; GRUENDE.forEach((x) => { gr[x] = $q('ks-g-' + x).checked; });
      ta.value = entwurf(ks, { name: pe.name, anschrift: pe.strasse, ort: pe.ort, stelle: k.stelle, bg: k.bg, az: k.az, art: ctx.briefArt, heute: ctx.heute, gruende: gr, bem: bem.value });
    };
    const $q = (id) => form.querySelector('#' + id);
    fs.addEventListener('change', schreiben);
    bem.addEventListener('input', schreiben);
    bAntw.addEventListener('click', () => {
      const auf = form.hidden;
      form.hidden = !auf; bAntw.setAttribute('aria-expanded', String(auf));
      if (auf) { schreiben(); ta.hidden = false; const f = $q('ks-g-krank'); if (f) f.focus(); }
    });
    copy.addEventListener('click', () => {
      const ok = () => { cm.textContent = t('f.copied'); };
      const hand = () => {
        ta.focus(); ta.select(); let r = false;
        try { r = document.execCommand && document.execCommand('copy'); } catch (e) { r = false; }
        cm.textContent = r ? t('f.copied') : t('f.copyFail');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(ok, hand); else hand();
    });

    d.appendChild(neu('p', t('el.ks.hinweis'), 'note'));
    box.appendChild(d);
    // Teilen/Drucken wie bei den anderen Schreiben (die Elemente gibt es erst jetzt im Dokument)
    if (ctx.schreibenKnopf) ctx.schreibenKnopf(['ks-text', 'ks-copy', 'Stellungnahme-Wohnkosten', 'amt']);
    return d;
  }

  return { anzeige, entwurf, zeige, GRUENDE };
})();
if (typeof window !== 'undefined') window.KostensenkungHilfe = KostensenkungHilfe;
if (typeof module !== 'undefined') module.exports = KostensenkungHilfe;
