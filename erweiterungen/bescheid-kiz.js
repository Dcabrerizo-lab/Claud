// Bescheid-Check Kinderzuschlag – Erweiterung, nicht Teil der App 1.2.0
// Vergleicht den Bescheid der Familienkasse mit der Rechnung nach § 6a BKGG, mit denselben Werten und demselben Rechenweg wie die App
// (src/rules.js: Regelbedarfe, Wohnkostenanteil der Eltern nach DA-KiZ, Freibetrag § 11b SGB II, 45 % Anrechnung, 297 € je Kind).
// Rechtsgrundlagen: § 6a BKGG (Abs. 2 Höchstbetrag, Abs. 3 Einkommen des Kindes, Abs. 5 Bedarf der Eltern, Abs. 6 Anrechnung, Abs. 8 Bemessungszeitraum).
const BescheidKiZ = (function () {
  'use strict';
  const TOL = 1;
  const z = (x) => (Number.isFinite(+x) ? +x : 0);
  const c2 = (x) => Math.round(x * 100) / 100;

  // f = { eltern: [{brutto, netto, sonstiges}], kinder: [{alter, unterhalt, eigenes}], wohnkosten (Miete + Heizung im Monat) }
  function rechne(f, Rules) {
    const R = Rules.RULES;
    const eltern = (f.eltern || []).filter(Boolean).slice(0, 2), kinder = (f.kinder || []).filter((k) => k && +k.alter < 25);
    const ad = Math.max(1, eltern.length), nk = kinder.length;
    const regel = ad === 2 ? 2 * R.regelbedarf.partner : R.regelbedarf.alleinstehend;
    // Mehrbedarf Alleinerziehende (§ 21 Abs. 3 SGB II) gehört zum Bedarf des Elternteils
    let mehrAE = 0;
    const minderj = kinder.filter((k) => +k.alter < 18);
    if (ad === 1 && minderj.length) {
      let p = R.mehr.aeJeKind * minderj.length;
      const u7 = minderj.filter((k) => +k.alter < 7).length, u16 = minderj.filter((k) => +k.alter < 16).length;
      if (u7 >= 1 || (u16 >= 2 && u16 <= 3)) p = Math.max(p, R.mehr.ae36);
      mehrAE = c2(Math.min(p, R.mehr.aeMax) * R.regelbedarf.alleinstehend);
    }
    const anteil = Rules.kizWohnanteil(ad, nk);
    const wohnEltern = c2(z(f.wohnkosten) * anteil);
    const bedarf = c2(regel + mehrAE + wohnEltern);
    // Einkommen der Eltern wie beim Grundsicherungsgeld (§ 11b SGB II, Freibetrag mit Kind bis 1.500 €)
    let einkEltern = 0, brutto = 0;
    for (const e of eltern) {
      const b = z(e.brutto), n = z(e.netto), s = z(e.sonstiges);
      brutto += b;
      if (b > 0 || n > 0) einkEltern += Math.max(0, n - Rules.sgb2Freibetrag(b, nk > 0));
      if (s > 0) einkEltern += Math.max(0, s - (b > 0 ? 0 : 30));
    }
    einkEltern = c2(einkEltern);
    const ueber = c2(Math.max(0, einkEltern - bedarf));
    const minijob = R.minijob;
    const jeKind = kinder.map((k) => { const anr = z(k.unterhalt) + Math.max(0, z(k.eigenes) - minijob); return c2(Math.max(0, R.kiz.max - R.kiz.anrechnung * anr)); });
    const summeKinder = c2(jeKind.reduce((s, x) => s + x, 0));
    const kiz = c2(Math.max(0, summeKinder - R.kiz.anrechnung * ueber));
    const minEink = ad === 2 ? R.kiz.minPaar : R.kiz.minAlleinerziehend;
    return { eltern: ad, kinder: nk, regel, mehrAE, wohnanteil: anteil, wohnEltern, bedarf, einkEltern, ueber, jeKind, summeKinder, kiz, mindestOk: brutto >= minEink, minEink, max: R.kiz.max };
  }

  // e = { ...f, bescheid: { bedarf, einkommen, kiz } } (Monat; kiz = Kinderzuschlag aller Kinder zusammen)
  function pruefe(e, Rules) {
    const r = rechne(e, Rules), b = e.bescheid || {};
    const leer = (v) => v == null || v === '';
    const posten = [];
    if (!leer(b.bedarf)) {
      const diff = c2(r.bedarf - z(b.bedarf)), w = Math.abs(diff) <= TOL ? 'passt' : diff > 0 ? 'zuWenig' : 'zuViel';
      posten.push({ key: 'bedarf', name: 'Bedarf der Eltern', erwartet: r.bedarf, bescheid: z(b.bedarf), diff, wirkung: w, recht: '§ 6a Abs. 5 BKGG',
        grund: w === 'zuWenig' ? `Der Bedarf der Eltern besteht aus den Regelbedarfen (${eur(r.regel)})${r.mehrAE ? `, dem Mehrbedarf für Alleinerziehende (${eur(r.mehrAE)})` : ''} und dem Wohnkostenanteil der Eltern (${Math.round(r.wohnanteil * 100)} % von ${eur(z(e.wohnkosten))} = ${eur(r.wohnEltern)}). Zusammen ${eur(r.bedarf)}, im Bescheid nur ${eur(z(b.bedarf))}.` : null });
    }
    if (!leer(b.einkommen)) {
      const diff = c2(z(b.einkommen) - r.einkEltern), w = Math.abs(diff) <= TOL ? 'passt' : diff > 0 ? 'zuWenig' : 'zuViel';
      posten.push({ key: 'einkommen', name: 'Einkommen der Eltern', erwartet: r.einkEltern, bescheid: z(b.einkommen), diff, wirkung: w, recht: '§ 6a Abs. 6 BKGG, § 11b SGB II',
        grund: w === 'zuWenig' ? `Vom Nettolohn ist der Freibetrag für Erwerbstätige abzuziehen (bis zu 348 € bzw. 378 € mit Kind, je Elternteil). Anzurechnen sind ${eur(r.einkEltern)}, im Bescheid ${eur(z(b.einkommen))}.` : null });
    }
    if (!leer(b.kiz)) {
      const diff = c2(r.kiz - z(b.kiz)), w = Math.abs(diff) <= TOL ? 'passt' : diff > 0 ? 'zuWenig' : 'zuViel';
      posten.push({ key: 'kiz', name: 'Kinderzuschlag im Monat (alle Kinder)', erwartet: r.kiz, bescheid: z(b.kiz), diff, wirkung: w, recht: '§ 6a Abs. 2, 3, 6 BKGG',
        grund: w === 'zuWenig' && !posten.some((p) => p.grund) ? `Nach der Rechnung stehen ${eur(r.kiz)} im Monat zu (höchstens ${eur(r.max)} je Kind, gemindert um 45 % des Einkommens der Kinder und um 45 % des Elterneinkommens über dem Bedarf von ${eur(r.bedarf)}). Bewilligt sind ${eur(z(b.kiz))}.` : null });
    }
    const hinweise = [];
    if (!r.mindestOk) hinweise.push(`Die Eltern brauchen mindestens ${eur(r.minEink)} Bruttoeinkommen im Monat (Mindesteinkommensgrenze). Darunter gibt es keinen Kinderzuschlag.`);
    const k = posten.find((p) => p.key === 'kiz');
    return { rechnung: r, posten, hinweise, gruende: posten.filter((p) => p.grund), zuWenigImMonat: k && k.wirkung === 'zuWenig' ? k.diff : 0,
      grenzen: 'Die Familienkasse rechnet mit dem Durchschnitt der letzten sechs Monate vor dem Antrag (§ 6a Abs. 8 BKGG). Bitte diese Beträge eintragen. Nicht geprüft: Vermögen, Mehrbedarfe außer Alleinerziehenden, Selbständige, Wohngeld als Einkommen, Bildung und Teilhabe.' };
  }
  function eur(x) { return (Math.round(x * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
  return { rechne, pruefe };
})();
if (typeof module !== 'undefined') module.exports = BescheidKiZ;
