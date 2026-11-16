// Pflegegutachten-Check (Erweiterung, nicht Teil der App 1.2.0)
// Rechnet die Einstufung aus einem Gutachten des Medizinischen Dienstes nach, zeigt Grenzfälle und erklärt jedes Kriterium.
// Rechtsgrundlage (Stand November 2026, geprüft am Gesetzestext gesetze-im-internet.de):
//   § 15 SGB XI (Gewichtung, Pflegegrade, Abs. 4 besondere Bedarfskonstellation, Abs. 7 Kinder bis 18 Monate)
//   Anlage 1 zu § 15 (Einzelpunkte der Module 1 bis 6), Anlage 2 zu § 15 (Punktbereiche und gewichtete Punkte)
// Reine Rechnung ohne Oberfläche und ohne Netz; läuft im Browser und in Node.
const Pflege = (function () {
  'use strict';

  // Skalen aus Anlage 1
  const SKALA = {
    // stufen: Wortlaut im Gutachten · kurz: für Auswahllisten · leicht: was die Stufe im Alltag bedeutet
    sel: { stufen: ['selbständig', 'überwiegend selbständig', 'überwiegend unselbständig', 'unselbständig'], punkte: [0, 1, 2, 3],
      kurz: ['schafft es allein', 'schafft es meistens allein', 'schafft nur einen kleinen Teil allein', 'schafft es gar nicht allein'],
      leicht: ['Das schafft die Person ohne Hilfe, auch wenn sie dafür ein Hilfsmittel wie einen Rollator oder Haltegriff braucht.',
        'Das schafft die Person meistens allein. Sie braucht nur ab und zu Hilfe, zum Beispiel Erinnern, Bereitlegen oder kurzes Stützen.',
        'Das schafft die Person nur zu einem kleinen Teil allein. Jemand muss den größten Teil übernehmen.',
        'Das schafft die Person gar nicht allein. Jemand muss alles übernehmen.'] },
    fae: { stufen: ['Fähigkeit vorhanden/unbeeinträchtigt', 'Fähigkeit größtenteils vorhanden', 'Fähigkeit in geringem Maße vorhanden', 'Fähigkeit nicht vorhanden'], punkte: [0, 1, 2, 3],
      kurz: ['klappt ohne Probleme', 'klappt meistens', 'klappt nur selten', 'klappt gar nicht'],
      leicht: ['Das klappt ohne Probleme.', 'Das klappt meistens. Manchmal gibt es Schwierigkeiten.', 'Das klappt nur selten oder nur mit viel Unterstützung.', 'Das klappt gar nicht mehr.'] },
    hfg: { stufen: ['nie oder sehr selten', 'selten (ein- bis dreimal in zwei Wochen)', 'häufig (zweimal bis mehrmals wöchentlich, nicht täglich)', 'täglich'], punkte: [0, 1, 3, 5],
      kurz: ['nie oder fast nie', 'ein- bis dreimal in 2 Wochen', 'mehrmals pro Woche', 'jeden Tag'],
      leicht: ['Das kommt nie oder fast nie vor.', 'Das kommt ein- bis dreimal in zwei Wochen vor.', 'Das kommt mehrmals in der Woche vor, aber nicht jeden Tag.', 'Das kommt jeden Tag vor.'] },
    sonde: { stufen: ['entfällt', 'teilweise', 'vollständig'], punkte: [0, 6, 3],
      kurz: ['keine Sonde nötig', 'Sonde zusätzlich zum Essen', 'fast nur über Sonde'],
      leicht: ['Keine Ernährung über Sonde oder Infusion nötig, oder die Person macht es selbst.', 'Jeden Tag Sonde oder Infusion zusätzlich zum normalen Essen und Trinken.',
        'Ernährung fast nur über Sonde oder Infusion. Das gibt weniger Punkte als „teilweise“, weil dann die Hilfe beim normalen Essen wegfällt.'] }
  };

  // Kriterien der Module 1 bis 4 und 6 (Modul 5 hat eigene Häufigkeitsregeln, siehe unten).
  // faktor: stärkere Gewichtung nach Anlage 1 (4.8 Essen ×3, 4.9 Trinken und 4.10 Toilette ×2)
  // leicht: Erklärung in einfachen Worten
  const K = [
    { id: '1.1', m: 1, s: 'sel', name: 'Positionswechsel im Bett', leicht: 'Sich im Bett drehen und aufsetzen' },
    { id: '1.2', m: 1, s: 'sel', name: 'Halten einer stabilen Sitzposition', leicht: 'Aufrecht sitzen bleiben, ohne umzukippen' },
    { id: '1.3', m: 1, s: 'sel', name: 'Umsetzen', leicht: 'Vom Bett auf einen Stuhl wechseln und zurück' },
    { id: '1.4', m: 1, s: 'sel', name: 'Fortbewegen innerhalb des Wohnbereichs', leicht: 'In der Wohnung von Raum zu Raum gehen' },
    { id: '1.5', m: 1, s: 'sel', name: 'Treppensteigen', leicht: 'Eine Treppe zwischen zwei Stockwerken gehen' },

    { id: '2.1', m: 2, s: 'fae', name: 'Erkennen von Personen aus dem näheren Umfeld', leicht: 'Familie, Nachbarn und Pflegekräfte erkennen' },
    { id: '2.2', m: 2, s: 'fae', name: 'Örtliche Orientierung', leicht: 'Wissen, wo man ist, und sich in der Wohnung zurechtfinden' },
    { id: '2.3', m: 2, s: 'fae', name: 'Zeitliche Orientierung', leicht: 'Tageszeit, Wochentag und Jahreszeit kennen' },
    { id: '2.4', m: 2, s: 'fae', name: 'Erinnern an wesentliche Ereignisse oder Beobachtungen', leicht: 'Sich an Wichtiges von heute oder früher erinnern' },
    { id: '2.5', m: 2, s: 'fae', name: 'Steuern von mehrschrittigen Alltagshandlungen', leicht: 'Abläufe wie Ankleiden oder Kaffeekochen in der richtigen Reihenfolge schaffen' },
    { id: '2.6', m: 2, s: 'fae', name: 'Treffen von Entscheidungen im Alltag', leicht: 'Selbst entscheiden, z. B. welche Kleidung zum Wetter passt' },
    { id: '2.7', m: 2, s: 'fae', name: 'Verstehen von Sachverhalten und Informationen', leicht: 'Verstehen, was passiert und was einem gesagt wird' },
    { id: '2.8', m: 2, s: 'fae', name: 'Erkennen von Risiken und Gefahren', leicht: 'Gefahren erkennen, z. B. heiße Herdplatte oder Straßenverkehr' },
    { id: '2.9', m: 2, s: 'fae', name: 'Mitteilen von elementaren Bedürfnissen', leicht: 'Sagen oder zeigen können, wenn man Hunger, Durst oder Schmerzen hat' },
    { id: '2.10', m: 2, s: 'fae', name: 'Verstehen von Aufforderungen', leicht: 'Einfache Bitten verstehen, z. B. „Bitte setz dich“' },
    { id: '2.11', m: 2, s: 'fae', name: 'Beteiligen an einem Gespräch', leicht: 'Einem Gespräch folgen und mitreden' },

    { id: '3.1', m: 3, s: 'hfg', name: 'Motorisch geprägte Verhaltensauffälligkeiten', leicht: 'Ziellos umherlaufen, nicht still sitzen können, weglaufen wollen' },
    { id: '3.2', m: 3, s: 'hfg', name: 'Nächtliche Unruhe', leicht: 'Nachts wach und unruhig, Tag und Nacht verwechselt' },
    { id: '3.3', m: 3, s: 'hfg', name: 'Selbstschädigendes und autoaggressives Verhalten', leicht: 'Sich selbst verletzen' },
    { id: '3.4', m: 3, s: 'hfg', name: 'Beschädigen von Gegenständen', leicht: 'Dinge kaputt machen oder wegwerfen' },
    { id: '3.5', m: 3, s: 'hfg', name: 'Physisch aggressives Verhalten gegenüber anderen Personen', leicht: 'Andere schlagen, kratzen oder stoßen' },
    { id: '3.6', m: 3, s: 'hfg', name: 'Verbale Aggression', leicht: 'Andere beschimpfen oder bedrohen' },
    { id: '3.7', m: 3, s: 'hfg', name: 'Andere pflegerelevante vokale Auffälligkeiten', leicht: 'Lautes Rufen, Schreien, ständiges Wiederholen' },
    { id: '3.8', m: 3, s: 'hfg', name: 'Abwehr pflegerischer und anderer unterstützender Maßnahmen', leicht: 'Hilfe abwehren, z. B. beim Waschen oder bei Medikamenten' },
    { id: '3.9', m: 3, s: 'hfg', name: 'Wahnvorstellungen', leicht: 'Dinge sehen oder glauben, die nicht wirklich sind' },
    { id: '3.10', m: 3, s: 'hfg', name: 'Ängste', leicht: 'Starke Ängste, die Beruhigung brauchen' },
    { id: '3.11', m: 3, s: 'hfg', name: 'Antriebslosigkeit bei depressiver Stimmungslage', leicht: 'Antriebslos und niedergeschlagen, muss zu allem aufgefordert werden' },
    { id: '3.12', m: 3, s: 'hfg', name: 'Sozial inadäquate Verhaltensweisen', leicht: 'Unpassendes Verhalten, z. B. sich in der Öffentlichkeit ausziehen' },
    { id: '3.13', m: 3, s: 'hfg', name: 'Sonstige pflegerelevante inadäquate Handlungen', leicht: 'Andere unpassende Handlungen, z. B. Dinge verstecken oder horten' },

    { id: '4.1', m: 4, s: 'sel', name: 'Waschen des vorderen Oberkörpers', leicht: 'Hände, Gesicht, Hals, Arme, Brust und Bauch waschen' },
    { id: '4.2', m: 4, s: 'sel', name: 'Körperpflege im Bereich des Kopfes', leicht: 'Kämmen, Zähne putzen oder Prothese reinigen, rasieren' },
    { id: '4.3', m: 4, s: 'sel', name: 'Waschen des Intimbereichs', leicht: 'Den Intimbereich waschen' },
    { id: '4.4', m: 4, s: 'sel', name: 'Duschen und Baden einschließlich Waschen der Haare', leicht: 'Duschen oder baden und die Haare waschen' },
    { id: '4.5', m: 4, s: 'sel', name: 'An- und Auskleiden des Oberkörpers', leicht: 'Hemd, Pullover oder BH an- und ausziehen' },
    { id: '4.6', m: 4, s: 'sel', name: 'An- und Auskleiden des Unterkörpers', leicht: 'Hose, Unterwäsche, Strümpfe und Schuhe an- und ausziehen' },
    { id: '4.7', m: 4, s: 'sel', name: 'Mundgerechtes Zubereiten der Nahrung und Eingießen von Getränken', leicht: 'Essen klein schneiden, Brot schmieren, Getränke eingießen' },
    { id: '4.8', m: 4, s: 'sel', faktor: 3, name: 'Essen', leicht: 'Das Essen zum Mund führen und essen' },
    { id: '4.9', m: 4, s: 'sel', faktor: 2, name: 'Trinken', leicht: 'Genug trinken und das Glas zum Mund führen' },
    { id: '4.10', m: 4, s: 'sel', faktor: 2, name: 'Benutzen einer Toilette oder eines Toilettenstuhls', leicht: 'Zur Toilette gehen, sich hinsetzen, sauber machen, Kleidung richten' },
    { id: '4.11', m: 4, s: 'sel', ink: 'harn', name: 'Bewältigen der Folgen einer Harninkontinenz und Umgang mit Dauerkatheter und Urostoma', leicht: 'Einlagen wechseln, Katheter oder Urostoma versorgen' },
    { id: '4.12', m: 4, s: 'sel', ink: 'stuhl', name: 'Bewältigen der Folgen einer Stuhlinkontinenz und Umgang mit Stoma', leicht: 'Bei Stuhlinkontinenz sauber machen, Stoma versorgen' },
    { id: '4.13', m: 4, s: 'sonde', name: 'Ernährung parenteral oder über Sonde', leicht: 'Ernährung über eine Sonde oder Infusion' },

    { id: '6.1', m: 6, s: 'sel', name: 'Gestaltung des Tagesablaufs und Anpassung an Veränderungen', leicht: 'Den Tag einteilen und mit Änderungen zurechtkommen' },
    { id: '6.2', m: 6, s: 'sel', name: 'Ruhen und Schlafen', leicht: 'Zur Ruhe kommen, ins Bett gehen, durchschlafen' },
    { id: '6.3', m: 6, s: 'sel', name: 'Sichbeschäftigen', leicht: 'Sich sinnvoll beschäftigen, z. B. lesen, fernsehen, Hobbys' },
    { id: '6.4', m: 6, s: 'sel', name: 'Vornehmen von in die Zukunft gerichteten Planungen', leicht: 'Etwas für morgen oder nächste Woche planen' },
    { id: '6.5', m: 6, s: 'sel', name: 'Interaktion mit Personen im direkten Kontakt', leicht: 'Mit Menschen in der Nähe umgehen, z. B. mit Besuch' },
    { id: '6.6', m: 6, s: 'sel', name: 'Kontaktpflege zu Personen außerhalb des direkten Umfelds', leicht: 'Kontakt zu Freunden und Verwandten halten, z. B. telefonieren' }
  ];

  const MODUL = {
    1: { kurz: 'Sich bewegen', name: 'Mobilität', leicht: 'Wie gut sich die Person bewegen kann', gewicht: '10 %' },
    2: { kurz: 'Verstehen, Erinnern, Sprechen', name: 'Kognitive und kommunikative Fähigkeiten', leicht: 'Verstehen, Erinnern, Orientierung, Sprechen', gewicht: '15 % (zusammen mit Modul 3, der höhere Wert zählt)' },
    3: { kurz: 'Verhalten und Gefühle', name: 'Verhaltensweisen und psychische Problemlagen', leicht: 'Unruhe, Ängste, Abwehr, Aggression, Wahn', gewicht: '15 % (zusammen mit Modul 2, der höhere Wert zählt)' },
    4: { kurz: 'Sich selbst versorgen', name: 'Selbstversorgung', leicht: 'Waschen, Anziehen, Essen, Trinken, Toilette', gewicht: '40 %' },
    5: { kurz: 'Umgang mit Krankheit und Behandlung', name: 'Bewältigung von und selbständiger Umgang mit krankheits- oder therapiebedingten Anforderungen und Belastungen', leicht: 'Medikamente, Messungen, Wunden, Arztbesuche, Therapien', gewicht: '20 %' },
    6: { kurz: 'Tagesablauf und Kontakte', name: 'Gestaltung des Alltagslebens und sozialer Kontakte', leicht: 'Tagesablauf, Schlaf, Beschäftigung, Kontakte', gewicht: '15 %' }
  };

  // Anlage 2: obere Grenzen der Punktbereiche 0 bis 3 (Bereich 4 = alles darüber) und gewichtete Punkte je Bereich
  const ANLAGE2 = {
    1: { bis: [1, 3, 5, 9], gew: [0, 2.5, 5, 7.5, 10] },
    2: { bis: [1, 5, 10, 16], gew: [0, 3.75, 7.5, 11.25, 15] },
    3: { bis: [0, 2, 4, 6], gew: [0, 3.75, 7.5, 11.25, 15] },
    4: { bis: [2, 7, 18, 36], gew: [0, 10, 20, 30, 40] },
    5: { bis: [0, 1, 3, 5], gew: [0, 5, 10, 15, 20] },
    6: { bis: [0, 3, 6, 11], gew: [0, 3.75, 7.5, 11.25, 15] }
  };
  const BEREICH = ['keine', 'geringe', 'erhebliche', 'schwere', 'schwerste'];
  // § 15 Abs. 3: Untergrenzen der Pflegegrade 1 bis 5
  const GRAD_AB = [12.5, 27, 47.5, 70, 90];

  // Alter: alterJahre (ganze Jahre) und bei Kleinkindern alterMonate. Ergebnis in Monaten oder null (unbekannt).
  function alterAus(g) {
    const j = g.alterJahre === '' || g.alterJahre == null ? null : +g.alterJahre;
    const m = g.alterMonate === '' || g.alterMonate == null ? null : +g.alterMonate;
    if (j == null && m == null) return { monate: null };
    if (j != null && j >= 2) return { monate: Math.round(j * 12) };
    if (m != null) return { monate: Math.max(0, Math.round(m)) };
    return { monate: Math.round(j * 12) };
  }

  function bereich(m, summe) {
    const b = ANLAGE2[m].bis;
    for (let i = 0; i < b.length; i++) if (summe <= b[i]) return i;
    return 4;
  }
  // Pflegegrad aus Gesamtpunkten; Kinder bis 18 Monate nach § 15 Abs. 7 (eine Stufe höher, ab 12,5 Punkten Pflegegrad 2)
  function grad(gesamt, saeugling) {
    let g = 0;
    for (let i = 0; i < GRAD_AB.length; i++) if (gesamt >= GRAD_AB[i]) g = i + 1;
    if (saeugling && g > 0) g = Math.min(5, g + 1);
    return g;
  }
  const r2 = (x) => Math.round(x * 100) / 100;

  // ---------------------------------------------------------------
  // Modul 5: Häufigkeiten. Exakt in ganzen Zahlen gerechnet (1 Tag = 210 Einheiten, weil 7 und 30 darin aufgehen)
  // ---------------------------------------------------------------
  const M5A = [['5.1', 'Medikation', 'Medikamente richten und geben'], ['5.2', 'Injektionen (subcutan oder intramuskulär)', 'Spritzen, z. B. Insulin'], ['5.3', 'Versorgung intravenöser Zugänge (Port)', 'Port oder Venenzugang versorgen'], ['5.4', 'Absaugen und Sauerstoffgabe', 'Absaugen, Sauerstoff geben'], ['5.5', 'Einreibungen oder Kälte- und Wärmeanwendungen', 'Eincremen mit Salben, Kälte- oder Wärmepackungen'], ['5.6', 'Messung und Deutung von Körperzuständen', 'Blutzucker, Blutdruck oder Gewicht messen und deuten'], ['5.7', 'Körpernahe Hilfsmittel', 'Kompressionsstrümpfe, Prothese, Hörgerät, Brille anlegen']];
  const M5B = [['5.8', 'Verbandswechsel und Wundversorgung', 'Verband wechseln, Wunden versorgen'], ['5.9', 'Versorgung mit Stoma', 'Stoma versorgen'], ['5.10', 'Regelmäßige Einmalkatheterisierung und Nutzung von Abführmethoden', 'Einmalkatheter, Einlauf oder Abführhilfen'], ['5.11', 'Therapiemaßnahmen in häuslicher Umgebung', 'Übungen aus Krankengymnastik oder Logopädie zu Hause']];
  // 5.12 bis 5.15 (5.K nur bei Kindern): Punkte je Häufigkeit in Zehnteln (Anlage 1: täglich 60, wöchentlich 8,6 bzw. 4,3, monatlich 2 bzw. 1)
  const M5C = [['5.12', 'Zeit- und technikintensive Maßnahmen in häuslicher Umgebung', 'z. B. Heimbeatmung oder Dialyse zu Hause', { tag: 600, woche: 86, monat: 20 }], ['5.13', 'Arztbesuche', 'Besuche beim Arzt', { woche: 43, monat: 10 }], ['5.14', 'Besuch anderer medizinischer oder therapeutischer Einrichtungen (bis zu drei Stunden)', 'z. B. Krankengymnastik in der Praxis', { woche: 43, monat: 10 }], ['5.15', 'Zeitlich ausgedehnte Besuche anderer medizinischer oder therapeutischer Einrichtungen (länger als drei Stunden)', 'z. B. Dialyse in der Praxis, Chemotherapie', { woche: 86, monat: 20 }], ['5.K', 'Besuche von Einrichtungen zur Frühförderung bei Kindern', 'Frühförderung', { woche: 43, monat: 10 }]];

  const zahl = (x) => (Number.isFinite(+x) && +x > 0 ? +x : 0);
  const einheiten = (h) => Math.round((zahl(h && h.tag) * 210 + zahl(h && h.woche) * 30 + zahl(h && h.monat) * 7) * 1000) / 1000;
  // 5.1 bis 5.7: Maßnahmen pro Tag → 0 (unter 1), 1 (1 bis 3), 2 (über 3 bis 8), 3 (über 8)
  function punkteA(e) { return e < 210 ? 0 : e <= 630 ? 1 : e <= 1680 ? 2 : 3; }
  // 5.8 bis 5.11: 0 (seltener als einmal wöchentlich), 1 (ein- bis mehrmals wöchentlich), 2 (ein- bis unter dreimal täglich), 3 (mindestens dreimal täglich)
  function punkteB(e) { return e < 30 ? 0 : e < 210 ? 1 : e < 630 ? 2 : 3; }
  // 5.12 bis 5.15 (5.K): Summe → 0 (unter 4,3), 1 (unter 8,6), 2 (unter 12,9), 3 (unter 60), 6 (60 und mehr)
  function punkteC(z) { return z < 43 ? 0 : z < 86 ? 1 : z < 129 ? 2 : z < 600 ? 3 : 6; }

  function modul5(m5, kind) {
    m5 = m5 || {};
    const eA = M5A.reduce((s, [id]) => s + einheiten(m5[id]), 0);
    const eB = M5B.reduce((s, [id]) => s + einheiten(m5[id]), 0);
    let zC = 0;
    for (const [id, , , f] of M5C) {
      if (id === '5.K' && !kind) continue;
      const h = m5[id] || {};
      if (f.tag && h.taeglich) zC += f.tag;
      zC += zahl(h.woche) * f.woche + zahl(h.monat) * f.monat;
    }
    zC = Math.round(zC * 1000) / 1000;
    const a = punkteA(eA), b = punkteB(eB), c = punkteC(zC);
    const d = Math.max(0, Math.min(3, Math.round(zahl(m5['5.16']))));
    return { summe: a + b + c + d, teile: { a, b, c, d }, proTagA: r2(eA / 210), proTagB: r2(eB / 210), punkteC: r2(zC / 10) };
  }

  // ---------------------------------------------------------------
  // Einzelpunkte eines Kriteriums (Stufe 0..3 bzw. 0..2 bei 4.13)
  // ---------------------------------------------------------------
  function einzel(k, stufe, g) {
    if (stufe == null || stufe === '') return 0;
    const sk = SKALA[k.s];
    const i = Math.max(0, Math.min(sk.punkte.length - 1, Math.round(+stufe) || 0));
    // 4.11 und 4.12 zählen nur bei „überwiegend“ oder „vollständig inkontinent“ oder künstlicher Ableitung
    if (k.ink && !(g.inkontinenz && g.inkontinenz[k.ink])) return 0;
    return sk.punkte[i] * (k.faktor || 1);
  }

  // ---------------------------------------------------------------
  // Hauptrechnung. g = { stufen: {'1.1': 2, ...}, m5: {...}, inkontinenz: {harn, stuhl}, alterMonate, kind, bedarfskonstellation, pgBescheid }
  // ---------------------------------------------------------------
  function rechne(g) {
    g = g || {};
    const st = g.stufen || {};
    const alter = alterAus(g);
    const saeugling = alter.monate != null && alter.monate < 18; // § 15 Abs. 7 SGB XI
    const kind = alter.monate != null ? alter.monate < 216 : !!g.kind; // unter 18 Jahren: Vergleich mit gesunden Kindern gleichen Alters (§ 15 Abs. 6)
    const mod = {};
    for (const m of [1, 2, 3, 4, 6]) mod[m] = { summe: 0, kriterien: [] };
    for (const k of K) {
      if (saeugling && k.m === 4) continue; // bei Kindern bis 18 Monate ersetzt 4.K die Kriterien 4.1 bis 4.13
      const p = einzel(k, st[k.id], g);
      mod[k.m].summe += p;
      mod[k.m].kriterien.push({ id: k.id, stufe: st[k.id] == null ? null : +st[k.id], punkte: p });
    }
    if (saeugling && g.k4K) { mod[4].summe = 20; mod[4].kriterien.push({ id: '4.K', stufe: 1, punkte: 20 }); }
    const m5 = modul5(g.m5, kind);
    mod[5] = { summe: m5.summe, kriterien: [], teile: m5.teile, info: m5 };
    for (const m of [1, 2, 3, 4, 5, 6]) {
      mod[m].bereich = bereich(m, mod[m].summe);
      mod[m].bereichName = BEREICH[mod[m].bereich];
      mod[m].gewichtet = ANLAGE2[m].gew[mod[m].bereich];
    }
    const m23 = Math.max(mod[2].gewichtet, mod[3].gewichtet);
    const zaehlt23 = mod[2].gewichtet >= mod[3].gewichtet ? 2 : 3;
    const gesamt = r2(mod[1].gewichtet + m23 + mod[4].gewichtet + mod[5].gewichtet + mod[6].gewichtet);
    let pg = grad(gesamt, saeugling);
    const besonders = !!g.bedarfskonstellation; // § 15 Abs. 4 (z. B. Gebrauchsunfähigkeit beider Arme und beider Beine)
    if (besonders) pg = 5;
    const ab = GRAD_AB.map((x) => x);
    // Abstand zum nächsten Grad (bei Säuglingen gelten dieselben Punktgrenzen, nur eine Stufe höher)
    const stufeOhne = grad(gesamt, false);
    const naechsteGrenze = stufeOhne < 5 ? ab[stufeOhne] : null;
    const fehlt = naechsteGrenze == null || besonders ? null : r2(naechsteGrenze - gesamt);
    const ueber = stufeOhne > 0 ? r2(gesamt - ab[stufeOhne - 1]) : null;
    const res = { module: mod, m23, zaehlt23, gesamt, pg, saeugling, kind, besonders, alterBekannt: alter.monate != null, alterMonate: alter.monate, fehltBisNaechster: fehlt, ueberUntergrenze: ueber, naechsterPg: fehlt == null ? null : Math.min(5, pg + 1) };
    if (g.pgBescheid != null && g.pgBescheid !== '') {
      const b = +g.pgBescheid;
      res.bescheid = { pg: b, passt: b === pg, abweichung: pg - b };
    }
    res.hebel = hebel(g, res);
    res.grenzfall = fehlt != null && fehlt <= 7.5; // höchstens 7,5 Punkte bis zum nächsten Grad
    return res;
  }

  // ---------------------------------------------------------------
  // Grenzfall-Analyse: kleinste Zahl von einzelnen Stufen-Änderungen, die zum nächsten Pflegegrad führen würde.
  // Gewichtete Punkte ändern sich nur an den Bereichsgrenzen der Module, daher wird je Modul gesucht,
  // wie viele Stufen nötig sind, um den nächsten (oder übernächsten) Punktbereich zu erreichen.
  // ---------------------------------------------------------------
  function stufenFuer(m, g, mehr) {
    // kleinste Zahl von Stufen-Schritten in Modul m, die mindestens „mehr“ Einzelpunkte bringt (Rucksack-Suche), mit den Kriterien dazu
    if (mehr <= 0) return { schritte: 0, wege: [] };
    const st = g.stufen || {};
    const opts = [];
    for (const k of K) {
      if (k.m !== m) continue;
      if (k.ink && !(g.inkontinenz && g.inkontinenz[k.ink])) continue;
      if (k.s === 'sonde') continue; // 4.13 hängt an der Ernährungsform, nicht an einer Einschätzung
      const sk = SKALA[k.s];
      const jetzt = Math.max(0, Math.round(+st[k.id] || 0));
      const wahl = [];
      for (let z = jetzt + 1; z < sk.punkte.length; z++) wahl.push({ k, nach: z, schritte: z - jetzt, plus: (sk.punkte[z] - sk.punkte[jetzt]) * (k.faktor || 1) });
      if (wahl.length) opts.push(wahl);
    }
    // dp[p] = kleinste Schrittzahl für mindestens p Punkte (p gedeckelt bei „mehr“)
    let dp = new Array(mehr + 1).fill(null); dp[0] = { s: 0, w: [] };
    for (const wahl of opts) {
      const neu = dp.slice();
      for (let p = 0; p <= mehr; p++) {
        if (!dp[p]) continue;
        for (const o of wahl) {
          const q = Math.min(mehr, p + o.plus), s = dp[p].s + o.schritte;
          if (!neu[q] || s < neu[q].s) neu[q] = { s, w: dp[p].w.concat([{ id: o.k.id, nach: o.nach, schritte: o.schritte, plus: o.plus }]) };
        }
      }
      dp = neu;
    }
    return dp[mehr] ? { schritte: dp[mehr].s, wege: dp[mehr].w } : null;
  }

  function hebel(g, res) {
    if (res.fehltBisNaechster == null) return { moeglich: false, optionen: [] };
    // je Modul: Möglichkeiten (Bereich höher → gewichteter Gewinn, Schritte)
    const proModul = {};
    for (const m of [1, 2, 3, 4, 6]) {
      const mo = res.module[m];
      const liste = [{ gewinn: 0, schritte: 0, wege: [], bereich: mo.bereich }];
      for (let b = mo.bereich + 1; b <= 4; b++) {
        const noetig = ANLAGE2[m].bis[b - 1] + 1 - mo.summe;
        const f = stufenFuer(m, g, noetig);
        if (!f) break;
        liste.push({ gewinn: ANLAGE2[m].gew[b] - mo.gewichtet, schritte: f.schritte, wege: f.wege, bereich: b });
      }
      proModul[m] = liste;
    }
    // Modul 5: Teile a, b, c, d einzeln um eine Stufe erhöhen (Hinweis, welche Häufigkeit nötig wäre)
    const t = res.module[5].teile;
    const m5opts = [{ gewinn: 0, schritte: 0, wege: [], bereich: res.module[5].bereich }];
    const naechst = { a: t.a < 3 ? t.a + 1 : null, b: t.b < 3 ? t.b + 1 : null, c: t.c < 3 ? t.c + 1 : t.c === 3 ? 6 : null, d: t.d < 3 ? t.d + 1 : null };
    const teilWege = [];
    for (const key of ['a', 'b', 'c', 'd']) if (naechst[key] != null) teilWege.push({ teil: key, plus: naechst[key] - t[key] });
    // alle Teilmengen der Teil-Erhöhungen (höchstens 16)
    for (let mask = 1; mask < 1 << teilWege.length; mask++) {
      let plus = 0, schritte = 0; const w = [];
      teilWege.forEach((tw, i) => { if (mask & (1 << i)) { plus += tw.plus; schritte++; w.push({ id: 'M5' + tw.teil, plus: tw.plus }); } });
      const summe = res.module[5].summe + plus, b = bereich(5, summe);
      const gewinn = ANLAGE2[5].gew[b] - res.module[5].gewichtet;
      if (gewinn > 0) m5opts.push({ gewinn, schritte, wege: w, bereich: b });
    }
    proModul[5] = m5opts;
    // Kombinationen: Module 2 und 3 zählen gemeinsam (der höhere gewichtete Wert)
    const ziel = res.fehltBisNaechster;
    const best = [];
    const ms = [1, 2, 3, 4, 5, 6];
    const rek = (i, wahl) => {
      if (i === ms.length) {
        const w2 = res.module[2].gewichtet + wahl[2].gewinn, w3 = res.module[3].gewichtet + wahl[3].gewinn;
        const gewinn = wahl[1].gewinn + (Math.max(w2, w3) - res.m23) + wahl[4].gewinn + wahl[5].gewinn + wahl[6].gewinn;
        const schritte = ms.reduce((s, m) => s + wahl[m].schritte, 0);
        if (schritte > 0 && gewinn >= ziel - 1e-9) best.push({ schritte, gewinn: r2(gewinn), wege: ms.flatMap((m) => wahl[m].wege.map((x) => Object.assign({ modul: m }, x))) });
        return;
      }
      for (const o of proModul[ms[i]]) { wahl[ms[i]] = o; rek(i + 1, wahl); }
    };
    rek(0, {});
    best.sort((x, y) => x.schritte - y.schritte || y.gewinn - x.gewinn);
    // nur Kombinationen, die keine Obermenge einer besseren sind; höchstens 5
    const out = [];
    const teile = (x) => new Set(x.wege.map((w) => w.id + '>' + (w.nach != null ? w.nach : w.plus)));
    for (const b of best) {
      if (out.length >= 5) break;
      const tb = teile(b);
      if (out.some((o) => [...teile(o)].every((x) => tb.has(x)))) continue; // Obermenge einer schon gezeigten Kombination
      out.push(b);
    }
    return { moeglich: out.length > 0, minSchritte: out.length ? out[0].schritte : null, optionen: out };
  }

  // ---------------------------------------------------------------
  // Erklärung in einfachen Worten
  // ---------------------------------------------------------------
  function kriterium(id) { return K.find((k) => k.id === id) || null; }
  function erklaerung(g, res) {
    res = res || rechne(g);
    const st = g.stufen || {};
    const zeilen = [];
    for (const m of [1, 2, 3, 4, 5, 6]) {
      const mo = res.module[m];
      const kopf = { modul: m, kurz: MODUL[m].kurz, name: MODUL[m].name, leicht: MODUL[m].leicht, summe: mo.summe, bereich: mo.bereichName, gewichtet: mo.gewichtet,
        zaehlt: m === 2 || m === 3 ? res.zaehlt23 === m : true, kriterien: [] };
      kopf.satz = `${MODUL[m].kurz}: ${mo.summe} ${mo.summe === 1 ? 'Punkt' : 'Punkte'}. Das gilt als ${mo.bereichName} Beeinträchtigung und bringt ${fmt(mo.gewichtet)} von ${fmt(ANLAGE2[m].gew[4])} möglichen Punkten.` +
        (m === 2 || m === 3 ? (kopf.zaehlt ? ' Von den Bereichen „Verstehen“ und „Verhalten“ zählt nur der höhere, hier dieser.' : ' Zählt nicht, weil der Bereich „' + MODUL[m === 2 ? 3 : 2].kurz + '“ höher ist. Es zählt nur der höhere von beiden.') : '');
      if (m === 5) {
        const t = mo.teile, i = mo.info;
        kopf.kriterien.push({ id: '5.1–5.7', titel: 'Medikamente, Spritzen, Messen, Hilfsmittel anlegen', bedeutung: `Im Schnitt ${fmt(i.proTagA)}-mal am Tag Hilfe nötig.`, punkte: t.a });
        kopf.kriterien.push({ id: '5.8–5.11', titel: 'Wunden, Stoma, Katheter, Übungen zu Hause', bedeutung: `Im Schnitt ${fmt(i.proTagB)}-mal am Tag Hilfe nötig.`, punkte: t.b });
        kopf.kriterien.push({ id: '5.12–5.15', titel: 'Arztbesuche und aufwendige Behandlungen', bedeutung: `Zusammen ${fmt(i.punkteC)} Rechenpunkte aus Häufigkeit und Dauer.`, punkte: t.c });
        kopf.kriterien.push({ id: '5.16', titel: 'Diät und ärztliche Anweisungen einhalten', bedeutung: SKALA.sel.leicht[t.d], punkte: t.d });
      } else {
        for (const c of mo.kriterien) {
          const k = kriterium(c.id);
          if (!k) continue;
          const s = st[k.id];
          if (s == null || s === '') continue;
          const i = Math.round(+s), sk = SKALA[k.s];
          let zusatz = '';
          if (k.faktor) zusatz = ` Diese Bewertung zählt ${k.faktor}-fach, weil sie für die Pflege besonders wichtig ist.`;
          if (k.ink && !(g.inkontinenz && g.inkontinenz[k.ink])) zusatz = ' Zählt hier nicht: Punkte gibt es nur, wenn im Gutachten „überwiegend“ oder „vollständig inkontinent“ steht oder ein Katheter oder Stoma da ist.';
          kopf.kriterien.push({ id: k.id, titel: k.leicht, amtlich: k.name, stufe: sk.stufen[i], bedeutung: sk.leicht[i] + zusatz, punkte: c.punkte });
        }
      }
      for (const x of kopf.kriterien) x.text = `${x.titel}: ${x.stufe ? `„${x.stufe}“. ` : ''}${x.bedeutung} → ${x.punkte} ${x.punkte === 1 ? 'Punkt' : 'Punkte'}`;
      zeilen.push(kopf);
    }
    return zeilen;
  }

  // Zusammenfassung in einfachen Sätzen (für Ergebnis und Ausdruck)
  function zusammenfassung(g, res, regeln) {
    res = res || rechne(g);
    const s = [];
    if (!res.alterBekannt) s.push('Bitte das Alter der gepflegten Person eintragen. Bei Kindern gelten andere Regeln.');
    s.push(res.pg ? `Nach den Bewertungen im Gutachten ergeben sich ${fmt(res.gesamt)} von 100 Punkten. Das ist Pflegegrad ${res.pg}.` : `Nach den Bewertungen im Gutachten ergeben sich ${fmt(res.gesamt)} von 100 Punkten. Das reicht noch nicht für einen Pflegegrad (ab 12,5 Punkten).`);
    if (res.besonders) s.push('Wegen einer besonderen Bedarfskonstellation gilt Pflegegrad 5, auch mit weniger Punkten.');
    if (res.saeugling) s.push('Bei Kindern bis 18 Monate ist der Pflegegrad eine Stufe höher, als die Punkte allein ergeben würden. Statt der Bewertungen zur Selbstversorgung zählt nur, ob es große Probleme beim Essen und Trinken gibt (§ 15 Abs. 7 SGB XI).');
    else if (res.kind) s.push('Bei Kindern vergleicht der Gutachter mit gesunden Kindern im gleichen Alter. Bewertet wird nur, was über das Übliche in diesem Alter hinausgeht (§ 15 Abs. 6 SGB XI).');
    if (res.bescheid) s.push(res.bescheid.passt ? `Das passt zum Pflegegrad im Bescheid.` : res.bescheid.abweichung > 0 ? `Im Bescheid steht aber nur Pflegegrad ${res.bescheid.pg}. Bitte jede Bewertung mit dem Gutachten vergleichen: Passt alles, liegt ein Rechenfehler vor.` : `Im Bescheid steht Pflegegrad ${res.bescheid.pg}. Vermutlich fehlt hier noch eine Bewertung aus dem Gutachten.`);
    if (res.fehltBisNaechster != null && !res.besonders) s.push(`Bis Pflegegrad ${res.naechsterPg} fehlen ${fmt(res.fehltBisNaechster)} Punkte.${res.grenzfall ? ' Das ist knapp.' : ''}`);
    const geldJetzt = geld(res.pg, regeln);
    if (res.pg >= 2) s.push(`Mit Pflegegrad ${res.pg} gibt es ${geldJetzt.pflegegeld} € Pflegegeld im Monat, wenn Angehörige pflegen, und dazu ${geldJetzt.entlastung} € Entlastungsbetrag.`);
    else if (res.pg === 1) s.push(`Mit Pflegegrad 1 gibt es kein Pflegegeld, aber ${geldJetzt.entlastung} € Entlastungsbetrag im Monat.`);
    return s;
  }
  // So rechnet die Pflegekasse (fester Erklärtext)
  const SO_GEHTS = [
    'Der Gutachter bewertet in sechs Bereichen, wie selbständig die Person ist. Jede Bewertung bringt Punkte.',
    'Die Punkte jedes Bereichs werden umgerechnet und gewichtet. Am meisten zählt „Sich selbst versorgen“ mit bis zu 40 Punkten.',
    'Von den Bereichen „Verstehen, Erinnern, Sprechen“ und „Verhalten und Gefühle“ zählt nur der höhere.',
    'Zusammen sind höchstens 100 Punkte möglich. Ab 12,5 Punkten gibt es Pflegegrad 1, ab 27 Pflegegrad 2, ab 47,5 Pflegegrad 3, ab 70 Pflegegrad 4 und ab 90 Pflegegrad 5.',
    'Punkte ändern sich nur an bestimmten Grenzen. Deshalb kann schon eine einzige andere Bewertung einen ganzen Pflegegrad ausmachen, oder auch gar nichts.'
  ];
  function fmt(x) { return String(r2(x)).replace('.', ','); }

  // Pflegegeld und Entlastungsbetrag aus den SoLo-Regeln (gleiche Werte wie in der App)
  function geld(pg, regeln) {
    const p = (regeln && regeln.RULES && regeln.RULES.pflege) || { geld: { 2: 347, 3: 599, 4: 800, 5: 990 }, entlastung: 131 };
    return { pflegegeld: pg >= 2 ? p.geld[pg] : 0, entlastung: pg >= 1 ? p.entlastung : 0 };
  }

  return { SKALA, KRITERIEN: K, MODUL, ANLAGE2, GRAD_AB, BEREICH, M5A, M5B, M5C, SO_GEHTS, rechne, erklaerung, zusammenfassung, bereich, grad, modul5, geld, kriterium, alterAus };
})();
if (typeof module !== 'undefined') module.exports = Pflege;
