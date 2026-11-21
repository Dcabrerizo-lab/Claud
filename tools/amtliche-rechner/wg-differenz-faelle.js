// Zufällige, realistische Wohngeld-Haushalte für den Differenztest gegen den amtlichen Wohngeldrechner des BMWSB.
// Nur Eingaben, die beide Rechner kennen: Haushaltsgröße 1-8 (1-2 Erwachsene, Kinder unter 18, junge Erwachsene 18-24),
// Mietenstufe I-VII, Lohn/Rente/Arbeitslosengeld je erwachsener Person, Minijob eines Kindes (§ 17 Nr. 4 WoGG),
// Unterhalt für die Kinder (Einkommen der Kinder, § 14 Abs. 2 WoGG), Unterhaltspflichten mit Titel (§ 18 WoGG, unter allen
// Höchstbeträgen), Schwerbehinderung GdB 100 (§ 17 Nr. 1), Alleinerziehende (§ 17 Nr. 3), Grundrentenzeiten (§ 17a),
// angegebene Heizkosten oder Heizkostenkomponente (§ 12 Abs. 6 WoGG). Kindergeld ist kein Einkommen beim Wohngeld
// (nicht in § 14 Abs. 2 WoGG genannt) und kommt in keinem der beiden Rechner vor.
// modus 'hoch' = größter Pauschalabzug (Lohn 30 %, Rente 20 %; entspricht SoLos oberer Schätzung),
// modus 'klein' = kleinster Abzug (je 10 %; entspricht SoLos unterer Schätzung).
const HEIZ = [110.4, 142.6, 170.2, 197.8, 225.4], HEIZ_WEITER = 27.6;
const heizKomp = (n) => (n <= 5 ? HEIZ[n - 1] : HEIZ[4] + (n - 5) * HEIZ_WEITER);

function faelle(N, start) {
  let seed = Number(start) || 2611;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const r10 = (x) => Math.round(x / 10) * 10;
  const out = [];
  while (out.length < N) {
    const adults = pick([1, 1, 2, 2]);
    const kids = pick([0, 0, 1, 1, 2, 2, 3, 4, 5, 6]);
    const young = rnd() < 0.15 ? pick([1, 1, 2]) : 0;
    const persons = adults + kids + young;
    if (persons > 8) continue;
    const einkommen = () => {
      const a = pick(['lohn', 'lohn', 'lohn', 'rente', 'rente', 'alg', 'ohne']);
      const b = a === 'lohn' ? r10(250 + rnd() * 4300) : a === 'rente' ? r10(250 + rnd() * 2000) : a === 'alg' ? r10(400 + rnd() * 1600) : 0;
      return { art: a, b };
    };
    const p = [einkommen()];
    if (adults === 2) p.push(einkommen());
    if (p.every((x) => x.b === 0)) p[0] = { art: 'lohn', b: r10(300 + rnd() * 2000) };
    const hatRente = p.some((x) => x.art === 'rente');
    const kinderGes = kids + young;
    // Minijob eines Kindes / jungen Erwachsenen (ausgezahlt = brutto, keine Abzüge), bei zwei Kindern teils aufgeteilt
    let kindEink = [];
    if (kinderGes > 0 && rnd() < 0.3) {
      const g = r10(80 + rnd() * 520);
      kindEink = kinderGes >= 2 && rnd() < 0.4 ? [r10(g / 2), g - r10(g / 2)] : [g];
    }
    const unterhaltKind = adults === 1 && kids > 0 && rnd() < 0.35 ? r10(150 + rnd() * 350 * kids) : 0;
    const uz = rnd() < 0.15 ? r10(30 + rnd() * 120) : 0; // gezahlter Unterhalt mit Titel, 30-150 € (unter jedem Höchstbetrag nach § 18 WoGG)
    const gdb100 = rnd() < 0.15;
    const bhWeitere = persons > 1 && rnd() < 0.08 ? 1 : 0;
    const gr = hatRente && rnd() < 0.4;
    const stufe = 1 + Math.floor(rnd() * 7);
    const kalt = r10(200 + rnd() * 1000 + persons * 70);
    const heiz = rnd() < 0.5 ? r10(40 + rnd() * 200) : 0; // 0 = nicht angegeben: SoLo zieht die Heizkostenkomponente ab
    const warm = Math.round((kalt + (heiz || heizKomp(persons))) * 100) / 100;
    const modus = rnd() < 0.7 ? 'hoch' : 'klein';
    out.push({ nr: out.length, stufe, adults, kids, young, persons, p, kindEink, unterhaltKind, uz, gdb100, bhWeitere, gr, kalt, heiz, warm, modus });
  }
  return out;
}

// Übersetzt einen Haushalt in die Eingaben des amtlichen Rechners: { miete, stufe, mitglieder, allein, unterhalt, sb }
// mitglieder: [{ ek, wk, steuer, kv, rv, kind25, grBetrag }]
function amtlicheEingabe(f) {
  const hoch = f.modus === 'hoch';
  const m = f.p.map((x) => {
    if (x.art === 'lohn') return { ek: x.b, wk: Math.min(102.5, x.b), steuer: hoch, kv: true, rv: hoch };
    if (x.art === 'rente') return { ek: x.b, wk: Math.min(8.5, x.b), steuer: hoch, kv: true, rv: false, grBetrag: f.gr ? x.b : 0 };
    if (x.art === 'alg') return { ek: x.b, wk: 0 }; // Arbeitslosengeld: steuerfrei, Beiträge zahlt die Agentur (§ 16 WoGG: kein Abzug)
    return { ek: 0, wk: 0 };
  });
  const kinder = Array.from({ length: f.kids + f.young }, () => ({ ek: 0, wk: 0 }));
  // Unterhalt für die Kinder: beim ersten Kind (unter 18) als Einkommen, ohne Abzüge
  if (f.unterhaltKind && f.kids > 0) kinder[0].ek += f.unterhaltKind;
  // Minijob: bei den letzten Kindern (zuerst junge Erwachsene), mit Werbungskosten-Pauschbetrag und Haken „Erwerbstätiges Kind unter 25“
  f.kindEink.forEach((b, i) => { const k = kinder[kinder.length - 1 - i]; k.ek += b; k.wk = Math.min(102.5, b); k.kind25 = true; });
  return { miete: f.kalt, stufe: f.stufe, mitglieder: m.concat(kinder), allein: f.adults === 1 && f.kids > 0, unterhalt: f.uz, sb: (f.gdb100 ? 1 : 0) + f.bhWeitere };
}

// Übersetzt denselben Haushalt in SoLo-Eingaben (Hauptformular, wie in der App)
function soloEingabe(f) {
  const art = (x) => (x ? x.art : 'ohne');
  return {
    adults: f.adults, kids: f.kids, young: f.young, kidsU6: 0, kids14: 0,
    art1: art(f.p[0]), art2: art(f.p[1]), brutto: f.p.reduce((a, x) => a + x.b, 0), brutto2: f.p[1] ? f.p[1].b : 0,
    netto: 9000, // hoch: SoLos Plausibilitätsprüfung (Einkommen unter Bedarf) soll die Betragsschätzung nicht ausblenden
    miete: f.warm, heizkosten: f.heiz || '', mietstufe: String(f.stufe), vermoegen: 0,
    gebJahr: f.p.some((x) => x.art === 'rente') ? 1955 : 1985, bezug: {}, heute: 2026.9,
    kindEink: f.kindEink.reduce((a, x) => a + x, 0), unterhalt: f.unterhaltKind,
    uzBetrag: f.uz, uzTitel: f.uz > 0, uzAn: 'k1', gdb: f.gdb100 ? '100' : '', bhWeitere: f.bhWeitere, grundrente33: f.gr
  };
}
module.exports = { faelle, amtlicheEingabe, soloEingabe, heizKomp };
