// Bescheid-Check Grundsicherungsgeld (SGB II) – Erweiterung, nicht Teil der App 1.2.0
// Vergleicht die Beträge aus dem Bescheid (Summen der Bedarfsgemeinschaft für einen Monat) mit der Rechnung nach den SoLo-Regeln.
// Nutzt dieselben Werte wie die App (src/rules.js): Regelbedarfe, Mehrbedarf-Sätze, Erwerbstätigenfreibetrag, Kindergeld.
// Rechtsgrundlagen: §§ 20, 21, 22, 11, 11b, 72 SGB II; Regelbedarfsstufen nach RBSFV. Keine Oberfläche, kein Netz.
const BescheidSGB2 = (function () {
  'use strict';
  const TOL = 1; // Rundungsdifferenzen bis 1 € gelten als passend

  function regelbedarfPerson(p, erwZahl, R) {
    const rb = R.regelbedarf;
    if (p.rolle === 'erw') return { betrag: erwZahl >= 2 ? rb.partner : rb.alleinstehend, stufe: erwZahl >= 2 ? 2 : 1 };
    const a = +p.alter;
    if (a < 6) return { betrag: rb.kind0, stufe: 6 };
    if (a < 14) return { betrag: rb.kind, stufe: 5 };
    if (a < 18) return { betrag: rb.kind14, stufe: 4 };
    return { betrag: rb.jungErwachsener, stufe: 3 }; // volljähriges Kind unter 25 im Haushalt der Eltern
  }
  function wwSatz(p, R) {
    const w = R.mehr.ww;
    if (p.rolle === 'erw' || +p.alter >= 18) return w.erw;
    if (+p.alter >= 14) return w.kind14;
    if (+p.alter >= 6) return w.kind;
    return w.kind0;
  }
  const z = (x) => (Number.isFinite(+x) ? +x : 0);
  const c2 = (x) => Math.round(x * 100) / 100;

  // e = { personen: [{rolle:'erw'|'kind', alter, schwanger, brutto, netto, sonstiges}], warmwasserDezentral,
  //       miete: {tatsaechlich, heizung}, bescheid: {regel, mehrAE, mehrSchwanger, mehrWW, kdu, einkommen, kindergeld, sofortzuschlag, zahlbetrag} }
  function pruefe(e, Rules) {
    const R = Rules.RULES;
    const ps = (e.personen || []).filter(Boolean);
    const erw = ps.filter((p) => p.rolle === 'erw');
    const kinder = ps.filter((p) => p.rolle !== 'erw');
    const minderj = kinder.filter((p) => +p.alter < 18);
    const hinweise = [];
    if (!erw.length) hinweise.push('Mindestens eine erwachsene Person angeben.');
    if (erw.length > 2) hinweise.push('Eine Bedarfsgemeinschaft hat höchstens zwei erwachsene Partner. Weitere Erwachsene bitte als eigene Bedarfsgemeinschaft prüfen.');
    if (kinder.some((p) => +p.alter >= 25)) hinweise.push('Kinder ab 25 Jahren bilden eine eigene Bedarfsgemeinschaft und gehören nicht in diese Rechnung.');

    // Regelbedarfe (§ 20 SGB II)
    let regel = 0; const regelTeile = [];
    for (const p of ps) { if (p.rolle !== 'erw' && +p.alter >= 25) continue; const r = regelbedarfPerson(p, erw.length, R); regel += r.betrag; regelTeile.push(r); }

    // Mehrbedarf Alleinerziehende (§ 21 Abs. 3): 36 % bei einem Kind unter 7 oder 2–3 Kindern unter 16, sonst 12 % je Kind, höchstens 60 %
    let mehrAE = 0;
    if (erw.length === 1 && minderj.length) {
      let p = R.mehr.aeJeKind * minderj.length;
      const u7 = minderj.filter((k) => +k.alter < 7).length, u16 = minderj.filter((k) => +k.alter < 16).length;
      if (u7 >= 1 || (u16 >= 2 && u16 <= 3)) p = Math.max(p, R.mehr.ae36);
      mehrAE = c2(Math.min(p, R.mehr.aeMax) * R.regelbedarf.alleinstehend);
    }
    // Schwangerschaft ab der 13. Woche (§ 21 Abs. 2): 17 % des maßgebenden Regelbedarfs
    let mehrSchw = 0;
    for (const p of ps) if (p.schwanger) mehrSchw += c2(R.mehr.schwanger * regelbedarfPerson(p, erw.length, R).betrag);
    // Dezentrale Warmwasserbereitung (§ 21 Abs. 7)
    let mehrWW = 0;
    if (e.warmwasserDezentral) for (const p of ps) { if (p.rolle !== 'erw' && +p.alter >= 25) continue; mehrWW += c2(wwSatz(p, R) * regelbedarfPerson(p, erw.length, R).betrag); }

    // Einkommen (§§ 11, 11b): Erwerbseinkommen netto minus Erwerbstätigenfreibetrag; sonstiges Einkommen voll, bei Erwachsenen ohne Erwerbseinkommen minus 30 € Versicherungspauschale
    const mitKindern = minderj.length > 0;
    let einkommen = 0; const einkTeile = [];
    for (const p of ps) {
      const b = z(p.brutto), n = z(p.netto), s = z(p.sonstiges);
      let anr = 0, frei = 0;
      if (b > 0 || n > 0) { frei = Rules.sgb2Freibetrag(b, mitKindern); anr += Math.max(0, n - frei); }
      if (s > 0) anr += Math.max(0, s - (p.rolle === 'erw' && !(b > 0) ? 30 : 0));
      einkommen += anr; if (b || n || s) einkTeile.push({ rolle: p.rolle, alter: p.alter, freibetrag: c2(frei), anrechenbar: c2(anr) });
    }
    // Kindergeld zählt beim Kind (§ 11 Abs. 1 Satz 5) – je Kind unter 25 der volle Betrag. Volljährige Kinder: minus 30 € Versicherungspauschale
    // (§ 11b Abs. 1 Satz 1 Nr. 3 SGB II i. V. m. § 6 Abs. 1 Nr. 1 Grundsicherungsgeld-V, https://www.gesetze-im-internet.de/algiiv_2008/__6.html,
    // abgerufen 24.11.2026), einmal je Kind; nicht bei eigenem Erwerbseinkommen (dort steckt sie im Grundfreibetrag, § 11b Abs. 2).
    // Bei minderjährigen Kindern nur mit eigener Versicherung – nicht gefragt (Hinweis in grenzen).
    const kgVolljaehrig = kinder.filter((k) => +k.alter >= 18 && +k.alter < 25 && !(z(k.brutto) > 0) && !(z(k.netto) > 0)).length;
    const kindergeld = c2(kinder.filter((k) => +k.alter < 25).length * R.kindergeld - kgVolljaehrig * Math.min(R.versPauschale, R.kindergeld));

    const miete = e.miete || {};
    const kduIst = z(miete.tatsaechlich) + z(miete.heizung);
    const b = e.bescheid || {};
    const posten = [];
    // richtung „bedarf“: zu wenig im Bescheid = zu wenig Geld; richtung „einkommen“: zu viel im Bescheid = zu wenig Geld
    const add = (key, name, erwartet, imBescheid, richtung, recht, grund) => {
      if (imBescheid == null || imBescheid === '') { posten.push({ key, name, erwartet: c2(erwartet), bescheid: null, wirkung: 'fehlt', recht }); return; }
      const ib = z(imBescheid);
      const diff = c2(richtung === 'bedarf' ? erwartet - ib : ib - erwartet); // > 0: zu deinen Lasten
      const wirkung = Math.abs(diff) <= TOL ? 'passt' : diff > 0 ? 'zuWenig' : 'zuViel';
      posten.push({ key, name, erwartet: c2(erwartet), bescheid: ib, diff, wirkung, recht, grund: wirkung === 'zuWenig' ? grund : null });
    };
    add('regel', 'Regelbedarfe', regel, b.regel, 'bedarf', '§ 20 SGB II, Regelbedarfsstufen', `Für die Bedarfsgemeinschaft ergeben sich Regelbedarfe von ${eur(regel)} (Stufen ${regelTeile.map((r) => r.stufe).join(', ')}). Im Bescheid sind nur ${eur(z(b.regel))} angesetzt.`);
    if (mehrAE || z(b.mehrAE)) add('mehrAE', 'Mehrbedarf für Alleinerziehende', mehrAE, b.mehrAE == null ? 0 : b.mehrAE, 'bedarf', '§ 21 Abs. 3 SGB II', `Als alleinerziehende Person mit ${minderj.length} minderjährigen ${minderj.length === 1 ? 'Kind' : 'Kindern'} steht ein Mehrbedarf von ${eur(mehrAE)} zu. Im Bescheid sind ${eur(z(b.mehrAE))} angesetzt.`);
    if (mehrSchw || z(b.mehrSchwanger)) add('mehrSchw', 'Mehrbedarf bei Schwangerschaft', mehrSchw, b.mehrSchwanger == null ? 0 : b.mehrSchwanger, 'bedarf', '§ 21 Abs. 2 SGB II', `Ab der 13. Schwangerschaftswoche steht ein Mehrbedarf von 17 % des Regelbedarfs zu (${eur(mehrSchw)}). Im Bescheid sind ${eur(z(b.mehrSchwanger))} angesetzt.`);
    if (mehrWW || z(b.mehrWW)) add('mehrWW', 'Mehrbedarf für dezentrale Warmwasserbereitung', mehrWW, b.mehrWW == null ? 0 : b.mehrWW, 'bedarf', '§ 21 Abs. 7 SGB II', `Das Warmwasser wird in der Wohnung erzeugt (z. B. Durchlauferhitzer oder Boiler). Dafür steht ein Mehrbedarf von ${eur(mehrWW)} zu. Im Bescheid sind ${eur(z(b.mehrWW))} angesetzt.`);
    if (ps.some((p) => z(p.brutto) || z(p.netto) || z(p.sonstiges)) || z(b.einkommen)) add('einkommen', 'Angerechnetes Einkommen', einkommen, b.einkommen == null ? 0 : b.einkommen, 'einkommen', '§§ 11, 11b SGB II', `Nach Abzug des Erwerbstätigenfreibetrags (${einkTeile.map((t) => eur(t.freibetrag)).join(', ')}) sind höchstens ${eur(einkommen)} anzurechnen. Im Bescheid sind ${eur(z(b.einkommen))} angerechnet.`);
    if (kindergeld || z(b.kindergeld)) add('kindergeld', 'Angerechnetes Kindergeld', kindergeld, b.kindergeld == null ? 0 : b.kindergeld, 'einkommen', '§ 11 Abs. 1 SGB II', `Kindergeld wird je Kind mit ${eur(R.kindergeld)} angerechnet${kgVolljaehrig ? `, bei volljährigen Kindern abzüglich ${eur(R.versPauschale)} Versicherungspauschale (§ 6 Abs. 1 Nr. 1 Grundsicherungsgeld-V)` : ''}, zusammen ${eur(kindergeld)}. Im Bescheid sind ${eur(z(b.kindergeld))} angerechnet.`);
    // Unterkunft und Heizung: Kürzung ist nicht automatisch falsch, aber zu prüfen
    let kdu = null;
    if (kduIst > 0 && b.kdu != null && b.kdu !== '') {
      const diff = c2(kduIst - z(b.kdu));
      kdu = { tatsaechlich: c2(kduIst), anerkannt: z(b.kdu), gekuerzt: diff > TOL ? diff : 0 };
      posten.push({ key: 'kdu', name: 'Unterkunft und Heizung', erwartet: c2(kduIst), bescheid: z(b.kdu), diff, wirkung: diff > TOL ? 'pruefen' : 'passt', recht: '§ 22 SGB II',
        grund: diff > TOL ? `Anerkannt sind ${eur(z(b.kdu))}, die tatsächlichen Kosten betragen ${eur(kduIst)}. Bitte prüfen: Ging der Kürzung eine schriftliche Aufforderung zur Senkung der Kosten voraus (§ 22 Abs. 1 SGB II)? Ist die Angemessenheitsgrenze nachvollziehbar begründet? Die Heizkosten werden in tatsächlicher Höhe übernommen, soweit sie angemessen sind.` : null });
    }

    const bedarf = c2(regel + mehrAE + mehrSchw + mehrWW + (kdu ? kdu.anerkannt : kduIst));
    const erwartetZahl = c2(Math.max(0, bedarf - einkommen - kindergeld));
    // Sofortzuschlag (§ 72 Abs. 1 SGB II, Fassung ab 1.7.2026, https://www.buzer.de/72_SGB_II.htm, abgerufen 24.11.2026): 25 € im Monat
    // je Kind, Jugendlichem und jungem Erwachsenen mit Regelbedarfsstufe 3 bis 6, zusätzlich zum Grundsicherungsgeld; auch wenn nur
    // das Kindergeld den Anspruch entfallen lässt (Satz 2 Nr. 2). Kein Einkommen, keine Kürzung der übrigen Posten. Viele Bescheide
    // weisen ihn gesondert aus und rechnen ihn in den Zahlbetrag ein – Zahlbetrag mit und ohne ihn gilt als richtig. Eigener Posten nur,
    // wenn er im Bescheid eingetragen ist (kein Pflichtfeld).
    const szKinder = regelTeile.filter((r) => r.stufe >= 3).length;
    const szAnspruch = szKinder > 0 && c2(bedarf - einkommen) > 0;
    const sofortzuschlag = szAnspruch ? c2(szKinder * R.sofortzuschlag) : 0;
    if (b.sofortzuschlag != null && b.sofortzuschlag !== '') add('sofort', 'Sofortzuschlag für Kinder', sofortzuschlag, b.sofortzuschlag, 'bedarf', '§ 72 SGB II', `Für jedes Kind (auch volljährige Kinder unter 25) steht zusätzlich ein Sofortzuschlag von ${eur(R.sofortzuschlag)} im Monat zu, zusammen ${eur(sofortzuschlag)}. Im Bescheid sind ${eur(z(b.sofortzuschlag))} angesetzt.`);
    const zuWenig = c2(posten.filter((p) => p.wirkung === 'zuWenig').reduce((s, p) => s + p.diff, 0));
    const res = { posten, kdu, hinweise, erwartet: { regel, mehrAE, mehrSchw: c2(mehrSchw), mehrWW: c2(mehrWW), einkommen: c2(einkommen), kindergeld, bedarf, zahlbetrag: erwartetZahl, sofortzuschlag, zahlbetragMitSofortzuschlag: c2(erwartetZahl + sofortzuschlag) },
      zuWenigImMonat: zuWenig, gruende: posten.filter((p) => p.wirkung === 'zuWenig' || p.wirkung === 'pruefen') };
    // Zahlbetrag mit oder ohne Sofortzuschlag: Passt der Bescheid zu einer der beiden Varianten, gilt er als richtig. Sonst wird vorsichtig
    // ohne Sofortzuschlag verglichen (er kann gesondert ausgezahlt sein) und sofortzuschlagMoeglich nennt den Betrag, der dazukommen kann.
    if (b.zahlbetrag != null && b.zahlbetrag !== '') {
      const ib = z(b.zahlbetrag), mit = c2(erwartetZahl + sofortzuschlag);
      const mitSZ = sofortzuschlag > 0 && Math.abs(erwartetZahl - ib) > TOL && Math.abs(mit - ib) <= TOL;
      const erw = mitSZ ? mit : erwartetZahl;
      res.zahlbetrag = { bescheid: ib, erwartet: erw, mitSofortzuschlag: mitSZ, diff: c2(erw - ib),
        sofortzuschlagMoeglich: !mitSZ && Math.abs(erwartetZahl - ib) > TOL ? sofortzuschlag : 0 };
    }
    res.grenzen = 'Nicht geprüft: kostenaufwändige Ernährung, Mehrbedarf bei Behinderung, einmalige Bedarfe, Sanktionen, Aufrechnungen, Einkommen aus Selbständigkeit, Ausbildungsvergütung, Einkommen von Schülern und Studierenden, Überschuss beim Kindergeld, Versicherungspauschale bei minderjährigen Kindern mit eigener Versicherung, Kindergeld für volljährige Kinder nur, wenn es tatsächlich gezahlt wird (Schule, Ausbildung, Studium), Angemessenheit der Miete, Sofortzuschlag für ein Kind, dessen eigenes Einkommen (ohne Kindergeld) seinen Bedarf deckt (dann möglicherweise kein Sofortzuschlag).';
    return res;
  }
  function eur(x) { return (Math.round(x * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }

  return { pruefe, regelbedarfPerson, eur };
})();
if (typeof module !== 'undefined') module.exports = BescheidSGB2;
