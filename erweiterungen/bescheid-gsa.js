// Bescheid-Check Grundsicherung im Alter und bei Erwerbsminderung (SGB XII, 4. Kapitel) – Erweiterung, nicht Teil der App 1.2.0
// Vergleicht den Bescheid des Sozialamts (Monat, ganze Einsatzgemeinschaft) mit der Rechnung nach dem SGB XII.
// Werte aus der App (src/rules.js): Regelbedarfsstufen, Mehrbedarf Merkzeichen G 17 %, Warmwasser, Grundrentenfreibetrag, Freibetrag Arbeit.
// Zusätzlich zur App: Freibetrag für zusätzliche Altersvorsorge (Betriebsrente, Riester, private Rente), § 82 Abs. 4 SGB XII.
// Rechtsgrundlagen: §§ 27a, 30 (Mehrbedarfe), 35/42a (Unterkunft), 42, 43, 82 (Einkommen, Abs. 2 Abzüge, Abs. 3 Arbeit, Abs. 4 Altersvorsorge), 82a (Grundrente) SGB XII.
const BescheidGSA = (function () {
  'use strict';
  const TOL = 1;
  const z = (x) => (Number.isFinite(+x) ? +x : 0);
  const c2 = (x) => Math.round(x * 100) / 100;

  // Freibeträge je Person
  function freiGrundrente(n, R) { return n > 0 ? Math.min(R.grundrente.sockel + R.grundrente.quote * Math.max(0, n - R.grundrente.sockel), R.grundrente.max * R.regelbedarf.alleinstehend, n) : 0; }
  // § 82 Abs. 4 SGB XII: 100 € + 30 % des übersteigenden Betrags, höchstens 50 % der Regelbedarfsstufe 1 (gleiche Zahlen wie § 82a)
  function freiVorsorge(n, R) { return freiGrundrente(n, R); }
  // § 82 Abs. 3 Satz 1: 30 % des Einkommens aus Arbeit, höchstens 50 % der Regelbedarfsstufe 1
  // Bezugsgröße: viele Sozialämter rechnen die 30 % vom Brutto (Fachanweisung Hamburg §§ 82–84 SGB XII, Stand 1.1.2022, Ziff. 5.6; Verwaltungs-
  // anweisung Bremen zu § 82, 20.2.2019; Kreis Viersen 82.5.3; Abruf 26.11.2026), der Wortlaut sagt nur „Einkommen“. b = Bruttolohn (freiwillig):
  // dann 30 % vom Brutto, nie mehr als das Netto. Ohne b wie bisher vom Netto.
  function freiArbeit(n, R, b) { return n > 0 ? Math.min(R.gsaArbeit.quote * (b > n ? b : n), R.gsaArbeit.max * R.regelbedarf.alleinstehend, n) : 0; }

  // e = { personen: [{ mzG, renteNetto, renteBrutto (gesetzliche Rente vor Kranken- und Pflegeversicherung, für § 82a), grundrente33, zusatzRente, lohnNetto, lohnBrutto (freiwillig, § 82 Abs. 3), sonstiges, versicherungen }], warmwasserDezentral,
  //       miete: { tatsaechlich, heizung }, bescheid: { regel, mehrG, mehrWW, kdu, einkommen, zahlbetrag } }
  function pruefe(e, Rules) {
    const R = Rules.RULES, ps = (e.personen || []).filter(Boolean).slice(0, 2);
    const n = Math.max(1, ps.length);
    const regelP = n === 2 ? R.regelbedarf.partner : R.regelbedarf.alleinstehend;
    const regel = regelP * n;
    const mehrG = c2(ps.filter((p) => p.mzG).length * c2(R.mehr.g * regelP));
    const mehrWW = e.warmwasserDezentral ? c2(n * c2(R.mehr.ww.erw * regelP)) : 0;
    let einkommen = 0, einkommenN = 0; const teile = [];
    for (const p of ps) {
      const rente = z(p.renteNetto), zus = z(p.zusatzRente), lohn = z(p.lohnNetto), lohnB = z(p.lohnBrutto), sonst = z(p.sonstiges), vers = z(p.versicherungen);
      // § 82a Abs. 1 SGB XII (https://www.gesetze-im-internet.de/sgb_12/__82a.html, Abruf 21.11.2026): Freibetrag aus der gesetzlichen Rente
      // brutto (Broschüre Rentenversicherung „Die Grundsicherung“ 5/2026, S. 18). Ohne Brutto aus dem Netto (kann zu klein sein, Hinweis in grenzen).
      const brutto = Math.max(rente, z(p.renteBrutto));
      const fG = p.grundrente33 ? Math.min(rente, freiGrundrente(brutto, R)) : 0, fV = freiVorsorge(zus, R), fA = freiArbeit(lohn, R, lohnB), fAN = freiArbeit(lohn, R);
      const anr = Math.max(0, rente - fG + zus - fV + lohn - fA + sonst - vers);
      einkommen += anr; einkommenN += Math.max(0, rente - fG + zus - fV + lohn - fAN + sonst - vers);
      teile.push({ freiGrundrente: c2(fG), freiVorsorge: c2(fV), freiArbeit: c2(fA), freiArbeitNetto: c2(fAN), versicherungen: c2(vers), anrechenbar: c2(anr) });
    }
    // einkommen: mit 30 % vom Brutto (wenn angegeben); einkommenN: mit 30 % vom Netto (wie vor dem 26.11.2026)
    einkommen = c2(einkommen); einkommenN = c2(einkommenN);
    const m = e.miete || {}, kduIst = c2(z(m.tatsaechlich) + z(m.heizung));
    const b = e.bescheid || {};
    const leer = (v) => v == null || v === '';
    const posten = [];
    const add = (key, name, erwartet, imBescheid, richtung, recht, grund) => {
      if (leer(imBescheid)) return;
      const ib = z(imBescheid), diff = c2(richtung === 'bedarf' ? erwartet - ib : ib - erwartet);
      const w = Math.abs(diff) <= TOL ? 'passt' : diff > 0 ? 'zuWenig' : 'zuViel';
      posten.push({ key, name, erwartet: c2(erwartet), bescheid: ib, diff, wirkung: w, recht, grund: w === 'zuWenig' ? grund : null });
    };
    add('regel', 'Regelbedarf', regel, b.regel, 'bedarf', '§ 27a SGB XII, Regelbedarfsstufen', `Für ${n === 2 ? 'ein Paar 2 × ' + eur(regelP) : 'eine alleinstehende Person'} beträgt der Regelbedarf ${eur(regel)}. Im Bescheid sind nur ${eur(z(b.regel))} angesetzt.`);
    if (mehrG || z(b.mehrG)) add('mehrG', 'Mehrbedarf Merkzeichen G', mehrG, leer(b.mehrG) ? 0 : b.mehrG, 'bedarf', '§ 30 Abs. 1 SGB XII', `Mit Merkzeichen G im Schwerbehindertenausweis und Erreichen der Altersgrenze oder voller Erwerbsminderung steht ein Mehrbedarf von 17 % des Regelbedarfs zu (${eur(mehrG)}). Im Bescheid sind ${eur(z(b.mehrG))} angesetzt.`);
    if (mehrWW || z(b.mehrWW)) add('mehrWW', 'Mehrbedarf für dezentrale Warmwasserbereitung', mehrWW, leer(b.mehrWW) ? 0 : b.mehrWW, 'bedarf', '§ 30 Abs. 7 SGB XII', `Das Warmwasser wird in der Wohnung erzeugt (z. B. Durchlauferhitzer oder Boiler). Dafür stehen ${eur(mehrWW)} zu. Im Bescheid sind ${eur(z(b.mehrWW))} angesetzt.`);
    const welche = [];
    if (teile.some((t) => t.freiGrundrente)) welche.push('Grundrentenfreibetrag (§ 82a)');
    if (teile.some((t) => t.freiVorsorge)) welche.push('Freibetrag für Betriebs-, Riester- oder private Rente (§ 82 Abs. 4)');
    if (teile.some((t) => t.freiArbeit)) welche.push('Freibetrag für Arbeit (§ 82 Abs. 3)');
    if (teile.some((t) => t.versicherungen)) welche.push('Versicherungsbeiträge (§ 82 Abs. 2)');
    const hatEink = ps.some((p) => z(p.renteNetto) || z(p.zusatzRente) || z(p.lohnNetto) || z(p.sonstiges)) || z(b.einkommen);
    const ibE = leer(b.einkommen) ? 0 : z(b.einkommen);
    // Bruttolohn angegeben und der Bescheid passt nur zur Rechnung mit 30 % vom Netto: kein Fehler, sondern „prüfen“ mit vorsichtigem Hinweis
    // (die Bezugsgröße ist nicht höchstrichterlich geklärt). Liegt der Bescheid noch über der Netto-Rechnung, bleibt es „zu wenig“, gemessen an der Netto-Rechnung.
    if (hatEink && einkommenN - einkommen > TOL && ibE - einkommen > TOL && ibE - einkommenN <= TOL) {
      const diff = c2(ibE - einkommen), fAN = teile.reduce((s, t) => s + t.freiArbeitNetto, 0), fAB = teile.reduce((s, t) => s + t.freiArbeit, 0);
      posten.push({ key: 'einkommen', name: 'Angerechnetes Einkommen', erwartet: einkommen, bescheid: ibE, diff, wirkung: 'pruefen', recht: '§ 82 Abs. 3 Satz 1 SGB XII',
        tKey: 'bp.sa.nettoFrei', tP: { diff: eur(diff) },
        grund: `Der Freibetrag für Erwerbseinkommen (§ 82 Abs. 3 Satz 1 SGB XII) wurde offenbar aus dem Nettolohn berechnet (${eur(fAN)} statt ${eur(fAB)}). Nach verbreiteter Verwaltungspraxis sind 30 % des Bruttoeinkommens abzusetzen (z. B. Fachanweisung Hamburg zu §§ 82–84 SGB XII, Ziff. 5.6; Verwaltungsanweisung Bremen zu § 82 SGB XII). Das anzurechnende Einkommen wäre damit um ${eur(diff)} im Monat niedriger.` });
    } else if (hatEink) add('einkommen', 'Angerechnetes Einkommen', ibE - einkommenN > TOL ? einkommenN : einkommen, ibE, 'einkommen', '§§ 82, 82a SGB XII',
      `Anzurechnen sind höchstens ${eur(einkommenN)}${welche.length ? `, weil abzuziehen sind: ${welche.join(', ')}, zusammen ${eur(teile.reduce((s, t) => s + t.freiGrundrente + t.freiVorsorge + t.freiArbeitNetto + t.versicherungen, 0))}` : ''}. Im Bescheid sind ${eur(z(b.einkommen))} angerechnet.` +
      (einkommenN - einkommen > TOL ? ` Werden die 30 % vom Bruttolohn berechnet, wie viele Sozialämter es tun, sind es nur ${eur(einkommen)}.` : ''));
    let kdu = null;
    if (kduIst > 0 && !leer(b.kdu)) {
      const diff = c2(kduIst - z(b.kdu));
      kdu = { tatsaechlich: kduIst, anerkannt: z(b.kdu), gekuerzt: diff > TOL ? diff : 0 };
      posten.push({ key: 'kdu', name: 'Unterkunft und Heizung', erwartet: kduIst, bescheid: z(b.kdu), diff, wirkung: diff > TOL ? 'pruefen' : 'passt', recht: '§§ 35, 42a SGB XII',
        grund: diff > TOL ? `Anerkannt sind ${eur(z(b.kdu))}, die tatsächlichen Kosten betragen ${eur(kduIst)}. Bitte prüfen: Ging der Kürzung eine schriftliche Aufforderung zur Senkung der Kosten voraus (§ 35 Abs. 2 SGB XII)? Ist die Angemessenheitsgrenze nachvollziehbar begründet?` : null });
    }
    const bedarf = c2(regel + mehrG + mehrWW + (kdu ? kdu.anerkannt : kduIst));
    // Zahlbetrag: sicher mit der Netto-Rechnung; mit Bruttolohn zusätzlich die Rechnung mit 30 % vom Brutto (zahlbetragBrutto)
    const zahl = c2(Math.max(0, bedarf - einkommenN)), zahlB = c2(Math.max(0, bedarf - einkommen));
    const ohneBrutto = ps.some((p) => p.grundrente33 && z(p.renteNetto) > 0 && !(z(p.renteBrutto) > 0));
    const res = { posten, kdu, teile, erwartet: { regel, mehrG, mehrWW, einkommen: einkommenN, einkommenBrutto: einkommen, bedarf, zahlbetrag: zahl, zahlbetragBrutto: zahlB }, gruende: posten.filter((p) => p.wirkung === 'zuWenig' || p.wirkung === 'pruefen'),
      zuWenigImMonat: c2(posten.filter((p) => p.wirkung === 'zuWenig').reduce((s, p) => s + p.diff, 0)),
      grenzen: 'Nicht geprüft: kostenaufwändige Ernährung, Mehrbedarf 35 % bei Eingliederungshilfe, einmalige Bedarfe, Vermögen, Einkommen aus Vermietung oder Selbständigkeit, Angemessenheit der Miete. Wohngeld und Grundsicherung schließen sich aus.' + (ohneBrutto ? ' Grundrenten-Freibetrag aus der Netto-Rente gerechnet, weil die Bruttorente fehlt; mit der Bruttorente kann er etwas höher sein (§ 82a SGB XII).' : '') };
    if (!leer(b.zahlbetrag)) res.zahlbetrag = { bescheid: z(b.zahlbetrag), erwartet: zahl, diff: c2(zahl - z(b.zahlbetrag)) };
    return res;
  }
  function eur(x) { return (Math.round(x * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
  return { pruefe, freiGrundrente, freiVorsorge, freiArbeit };
})();
if (typeof module !== 'undefined') module.exports = BescheidGSA;
