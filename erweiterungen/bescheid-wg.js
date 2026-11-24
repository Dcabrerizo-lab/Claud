// Bescheid-Check Wohngeld – Erweiterung, nicht Teil der App 1.2.0
// Vergleicht den Wohngeldbescheid (zu berücksichtigende Miete, Gesamteinkommen, Wohngeld im Monat) mit der Rechnung nach dem WoGG.
// Nutzt die Formel und Tabellen der App (src/rules.js: wgBetrag, wgCap, wgHeiz). Gegen den amtlichen Wohngeldrechner geprüft:
// in allen Vergleichsfällen höchstens 1 € Unterschied (Rundung des amtlichen Rechners), deshalb gilt bis 1 € als „passt“.
// Rechtsgrundlagen: §§ 11, 12 (Höchstbeträge, Heizkosten- und Klimakomponente), 14–17 (Einkommen, Pauschalabzug, Freibeträge),
// 19 (Formel), 21 Nr. 1 WoGG (unter 10 € kein Wohngeld).
// § 17a WoGG (https://www.gesetze-im-internet.de/wogg/__17a.html, Abruf 21.11.2026): Freibetrag bei mindestens 33 Jahren Grundrentenzeiten,
// 1.200 € im Jahr aus der gesetzlichen Rente plus 30 % des Rests, höchstens 12 × 50 % der Regelbedarfsstufe 1 (2026: 281,50 € im Monat).
// Art 'rente33' (oder grundrente33: true) = gesetzliche Rente mit 33 Jahren Grundrentenzeiten. Abgleich: Musterbescheid Wohngeld der Stadt
// Frankfurt a. M. vom 03.06.2025 („Freibetrag nach § 17a WoGG 3.378 €“, Wohngeld 355 €).
// § 19 Abs. 3 WoGG (https://www.gesetze-im-internet.de/wogg/__19.html, Abruf 21.11.2026): ab dem 13. Haushaltsmitglied je Person 65 € mehr,
// höchstens bis zur zu berücksichtigenden Miete (Rules.wgUeber12).
const BescheidWG = (function () {
  'use strict';
  const TOL = 1;
  const z = (x) => (Number.isFinite(+x) ? +x : 0);
  const c2 = (x) => Math.round(x * 100) / 100;
  // Pauschalabzug § 16 WoGG: je 10 % für Steuern vom Einkommen, Pflichtbeiträge zur Kranken- und Pflegeversicherung, zur Rentenversicherung
  function abzugAus(m) {
    if (m.abzug != null && m.abzug !== '') return Math.max(0, Math.min(30, +m.abzug)) / 100;
    return ((m.steuer ? 1 : 0) + (m.kv ? 1 : 0) + (m.rv ? 1 : 0)) * 0.1;
  }
  // Werbungskosten: tatsächliche, sonst Pauschbetrag (Lohn 1.230 €, Rente 102 € im Jahr), höchstens das Einkommen
  function werbung(m, R) {
    if (m.werbung != null && m.werbung !== '') return Math.min(z(m.werbung), z(m.brutto));
    const p = m.art === 'lohn' ? R.wgWerbung.lohn / 12 : m.art === 'rente' || m.art === 'rente33' ? R.wgWerbung.rente / 12 : 0;
    return Math.min(p, z(m.brutto));
  }

  // f = { personen, stufe (1–7), bruttokalt (Miete ohne Heizung), mitglieder: [{art, brutto, werbung?, abzug?|steuer,kv,rv, unterhalt, egPlus?, egKinder?}],
  //       alleinerziehend, schwerbehindert (Zahl der Personen mit GdB 100 oder GdB ab 50 und Pflegegrad) }
  // Elterngeld-Freibetrag beim Wohngeld (§ 14 Abs. 2 Nr. 6 WoGG: „§ 10 BEEG bleibt unberührt“, https://www.buzer.de/14_WoGG.htm; § 10 Abs. 1, 3, 4
  // BEEG, https://www.buzer.de/10_BEEG.htm, beide abgerufen 24.11.2026): 300 €, bei ElterngeldPlus 150 €, je Kind der Geburt vervielfacht. Die
  // Bedingung „Einkommen vor der Geburt“ (§ 10 Abs. 5) gilt nur für SGB II/XII, Kinderzuschlag und AsylbLG, nicht beim Wohngeld.
  // m.egPlus: true = ElterngeldPlus, false = Basiselterngeld, fehlt = unbekannt; m.egKinder: Kinder dieser Geburt (Standard 1).
  // Unbekannt: unter dem Mindestbetrag des Basiselterngelds (300 € je Kind) sicher Plus, über dem höchsten ElterngeldPlus sicher Basis,
  // dazwischen offen (lo 150 €, hi 300 € je Kind). Gleiche Logik wie derive egFrei in src/rules.js. Bis 24.11.2026: immer 300 €.
  function egFrei(m, b, R) {
    const k = Math.min(3, Math.max(1, Math.round(z(m.egKinder)) || 1)), F = R.elterngeldFrei;
    if (m.egPlus === true) return { lo: F / 2 * k, hi: F / 2 * k };
    if (m.egPlus === false) return { lo: F * k, hi: F * k };
    const plusSicher = b < R.eg.min + R.eg.mehrling * (k - 1), basisSicher = b > (R.eg.max / 2) * (1 + R.eg.bonus) + (R.eg.mehrling / 2) * (k - 1);
    const f = plusSicher ? [F / 2] : basisSicher ? [F] : [F / 2, F];
    return { lo: Math.min(...f) * k, hi: Math.max(...f) * k };
  }

  // opt.egHoch: obere Variante (höherer Elterngeld-Freibetrag), wenn offen ist, ob Basiselterngeld oder ElterngeldPlus
  function rechne(f, Rules, opt) {
    let egOffen = false;
    const R = Rules.RULES, n = Math.max(1, Math.round(z(f.personen) || 1)), st = Math.max(1, Math.min(7, Math.round(z(f.stufe) || 1)));
    const hoechst = Rules.wgCap(st, n), heiz = Rules.wgHeiz(n);
    const kalt = z(f.bruttokalt);
    const miete = Math.min(kalt, hoechst) + heiz;
    let eink = 0, grFrei = 0; const teile = [];
    for (const m of f.mitglieder || []) {
      const b = z(m.brutto);
      if (b > 0 && (m.art === 'rente33' || (m.art === 'rente' && m.grundrente33))) {
        // Freibetrag „vom Einkommen aus der gesetzlichen Rente“ (§ 17a Abs. 1 Satz 2 WoGG): nie höher als die Rente selbst
        grFrei += Math.min(b, R.grundrente.sockel + R.grundrente.quote * Math.max(0, b - R.grundrente.sockel), R.grundrente.max * R.regelbedarf.alleinstehend);
      }
      let anr = 0;
      if (b > 0) {
        if (m.art === 'eg') { const ef = egFrei(m, b, R); anr = Math.max(0, b - (opt && opt.egHoch ? ef.hi : ef.lo)); if (ef.hi !== ef.lo) egOffen = true; }
        else anr = (b - werbung(m, R)) * (1 - abzugAus(m));
      }
      anr += z(m.unterhalt); // Unterhalt ohne Pauschalabzug
      eink += anr; teile.push(c2(anr));
    }
    let frei = 0;
    if (f.alleinerziehend) frei += R.wohngeld.freibetragAlleinerzMonat; // § 17 Nr. 3 WoGG
    frei += Math.max(0, Math.round(z(f.schwerbehindert))) * R.wohngeld.freibetragBehinderungMonat; // § 17 Nr. 1 WoGG
    frei += grFrei; // § 17a WoGG
    eink = Math.max(0, eink - frei);
    const roh = Rules.wgBetrag(n, miete, eink);
    let wg = Math.max(0, Math.round(roh));
    if (wg < 10) wg = 0; // § 21 Nr. 1 WoGG
    wg = Rules.wgUeber12(n, wg, miete); // § 19 Abs. 3 WoGG
    return { personen: n, stufe: st, hoechstbetrag: c2(hoechst), heizkomponente: c2(heiz), miete: c2(miete), mieteGekappt: kalt > hoechst, einkommen: c2(eink), freibetraege: c2(frei), teile, wohngeld: wg, egOffen };
  }
  function ausBescheid(n, M, Y, Rules) {
    let w = Math.max(0, Math.round(Rules.wgBetrag(n, z(M), z(Y))));
    return Rules.wgUeber12(n, w < 10 ? 0 : w, z(M));
  }

  // e = { ...f, bescheid: { miete, einkommen, wohngeld } } (Beträge im Monat)
  function pruefe(e, Rules) {
    const r = rechne(e, Rules), b = e.bescheid || {};
    // Offener Elterngeld-Freibetrag: vorsichtig mit dem kleineren gerechnet (nie zu viel versprechen); passt der Bescheid zur Variante mit dem
    // größeren Freibetrag (ElterngeldPlus oder Basiselterngeld nicht bekannt), gilt er auch als passend
    const rHoch = r.egOffen ? rechne(e, Rules, { egHoch: true }) : r;
    const passtHoch = (key, ib) => r.egOffen && Math.abs((key === 'einkommen' ? rHoch.einkommen : rHoch.wohngeld) - ib) <= TOL;
    const posten = [];
    const leer = (v) => v == null || v === '';
    if (!leer(b.miete)) {
      const diff = c2(r.miete - z(b.miete));
      const w = Math.abs(diff) <= TOL ? 'passt' : diff > 0 ? 'zuWenig' : 'zuViel';
      posten.push({ key: 'miete', name: 'Zu berücksichtigende Miete', erwartet: r.miete, bescheid: z(b.miete), diff, wirkung: w, recht: '§§ 11, 12 WoGG',
        grund: w === 'zuWenig' ? `Die Miete ohne Heizung (${eur(z(e.bruttokalt))}) ist bis zum Höchstbetrag für ${r.personen} ${r.personen === 1 ? 'Person' : 'Personen'} in Mietenstufe ${['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][r.stufe]} (${eur(r.hoechstbetrag)}, mit Klimakomponente) zu berücksichtigen, dazu die Heizkostenkomponente von ${eur(r.heizkomponente)}. Zusammen ${eur(r.miete)}, im Bescheid nur ${eur(z(b.miete))}.` : null });
    }
    if (!leer(b.einkommen)) {
      const diff = c2(z(b.einkommen) - r.einkommen);
      const w = Math.abs(diff) <= TOL || passtHoch('einkommen', z(b.einkommen)) ? 'passt' : diff > 0 ? 'zuWenig' : 'zuViel';
      posten.push({ key: 'einkommen', name: 'Gesamteinkommen im Monat', erwartet: r.einkommen, bescheid: z(b.einkommen), diff, wirkung: w, recht: '§§ 14–17 WoGG',
        grund: w === 'zuWenig' ? `Nach Abzug der Werbungskosten, des Pauschalabzugs (je 10 % für Steuern, Kranken- und Pflegeversicherung, Rentenversicherung) und der Freibeträge (${eur(r.freibetraege)}) ergeben sich ${eur(r.einkommen)} im Monat. Im Bescheid sind ${eur(z(b.einkommen))} angesetzt.` : null });
    }
    if (!leer(b.wohngeld) && !leer(b.miete) && !leer(b.einkommen)) {
      const nach = ausBescheid(r.personen, b.miete, b.einkommen, Rules);
      const diff = c2(nach - z(b.wohngeld));
      const w = Math.abs(diff) <= TOL ? 'passt' : diff > 0 ? 'zuWenig' : 'zuViel';
      posten.push({ key: 'formel', name: 'Rechnung mit den Zahlen des Bescheids', erwartet: nach, bescheid: z(b.wohngeld), diff, wirkung: w, recht: '§ 19 WoGG',
        grund: w === 'zuWenig' ? `Schon mit der Miete und dem Einkommen aus dem Bescheid ergibt die Formel ${eur(nach)} Wohngeld, bewilligt sind ${eur(z(b.wohngeld))}. Das deutet auf einen Rechenfehler.` : null });
    }
    if (!leer(b.wohngeld)) {
      const diff = c2(r.wohngeld - z(b.wohngeld));
      posten.push({ key: 'wohngeld', name: 'Wohngeld im Monat', erwartet: r.wohngeld, bescheid: z(b.wohngeld), diff, wirkung: Math.abs(diff) <= TOL || passtHoch('wohngeld', z(b.wohngeld)) ? 'passt' : diff > 0 ? 'zuWenig' : 'zuViel', recht: '§ 19 WoGG', grund: null });
    }
    const gesamt = posten.find((p) => p.key === 'wohngeld');
    return { rechnung: r, posten, gruende: posten.filter((p) => p.grund), zuWenigImMonat: gesamt && gesamt.wirkung === 'zuWenig' ? gesamt.diff : 0,
      grenzen: 'Nicht geprüft: Mietenstufe der Gemeinde (bitte aus dem Bescheid übernehmen), Einkommen aus Selbständigkeit, Vermögen, Untermiete, Wohneigentum (Lastenzuschuss), Freibeträge für Kinder mit eigenem Einkommen und für Pflegepersonen, Grundrentenfreibetrag bei Betriebs- oder Privatrenten (gilt nur für die gesetzliche Rente), Einkommen über ein ganzes Jahr mit wechselnden Beträgen. Elterngeld: Ohne Angabe, ob Basiselterngeld oder ElterngeldPlus, rechnet SoLo vorsichtig mit dem kleineren Freibetrag (150 statt 300 € je Kind).' };
  }
  function eur(x) { return (Math.round(x * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
  return { rechne, pruefe, ausBescheid, abzugAus };
})();
if (typeof module !== 'undefined') module.exports = BescheidWG;
