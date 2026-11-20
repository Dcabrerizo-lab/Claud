// Fragen und Erklärungen für die geführte Selbsteinschätzung des Pflegegrads (Leistungsseite der App).
// Grundlage: § 15 SGB XI mit Anlage 1 und 2 und die Begutachtungs-Richtlinien (BRi) des Medizinischen Dienstes.
// Die Rechnung selbst steht in pflege.js; hier stehen nur die Texte: eine Frage pro Kriterium, „Was zählt hier?“,
// eine Vorfrage je Bereich (bei „Nein“ wird der Bereich übersprungen) und die vereinfachten Antworten für Bereich 5.
const PflegeFragen = (function () {
  'use strict';

  // Grundsätze, die für alle Fragen gelten (stehen einmal am Anfang und bei jeder Erklärung als Link)
  const GRUNDSATZ = [
    'Es zählt, was die Person selbst kann, nicht was sie gerade tut oder ob jemand es ihr aus Gewohnheit abnimmt.',
    'Hilfsmittel wie Rollator, Haltegriff oder Brille zählen als „allein“: Bewertet wird nur Hilfe durch andere Menschen.',
    'Denke an einen ganz normalen Tag, auch an schlechte Tage, wenn sie oft vorkommen. Es zählt, was in den letzten Monaten so war und noch mindestens sechs Monate so bleibt.',
    'Lieber ehrlich als hoch: Nur wenn die Antworten stimmen, hilft die Einschätzung beim Antrag und beim Termin mit dem Gutachter.'
  ];
  const KIND = 'Bei Kindern vergleicht der Gutachter mit einem gesunden Kind im gleichen Alter. Was ein Kind in dem Alter ohnehin noch nicht kann, zählt nicht.';

  // Vorfragen je Bereich: bei „Nein“ bekommen alle Kriterien des Bereichs die niedrigste Stufe
  const VORFRAGE = {
    1: { frage: 'Hat die Person Probleme, sich zu bewegen?', hinweis: 'Zum Beispiel beim Aufstehen, Umsetzen, Gehen in der Wohnung oder auf der Treppe.' },
    2: { frage: 'Hat die Person Probleme mit dem Verstehen, Erinnern oder Sich-Zurechtfinden?', hinweis: 'Zum Beispiel bei Demenz, geistiger Behinderung oder nach einem Schlaganfall: Personen erkennen, Wochentag wissen, Gespräche verstehen.' },
    3: { frage: 'Gibt es Verhalten oder Gefühle, bei denen jemand eingreifen, beruhigen oder aufpassen muss?', hinweis: 'Zum Beispiel nächtliche Unruhe, Weglaufen, Ängste, Aggression, Abwehr bei der Pflege oder starke Antriebslosigkeit.' },
    4: { frage: 'Braucht die Person Hilfe beim Waschen, Anziehen, Essen, Trinken oder auf der Toilette?', hinweis: 'Auch Erinnern, Anleiten oder Bereitlegen ist Hilfe.' },
    5: { frage: 'Braucht die Person Hilfe bei Medikamenten, Messungen, Wunden, Therapien oder Arztbesuchen?', hinweis: 'Gemeint ist Hilfe, weil die Person es nicht selbst kann, zum Beispiel Tabletten richten, Blutzucker messen oder zum Arzt begleiten.' },
    6: { frage: 'Braucht die Person Hilfe, ihren Tag zu gestalten oder Kontakte zu halten?', hinweis: 'Zum Beispiel Tagesablauf einteilen, sich beschäftigen, schlafen, telefonieren oder Besuch empfangen.' }
  };

  // Je Kriterium: frage (wie im Alltag gefragt) und hinweis („Was zählt hier?“). Kriterien und Stufen aus pflege.js.
  const TEXT = {
    '1.1': ['Kann sich die Person im Bett allein drehen und aufsetzen?', 'Zählt: vom Rücken auf die Seite drehen, im Bett hochrutschen, vom Liegen zum Sitzen kommen. Ein Bettgalgen oder eine Strickleiter gilt als Hilfsmittel.'],
    '1.2': ['Kann die Person allein aufrecht sitzen bleiben?', 'Zählt: auf einem Stuhl oder Bettrand sitzen, ohne zur Seite zu kippen. Wer sich nur mit den Armen abstützen muss, sitzt noch allein.'],
    '1.3': ['Kann die Person allein vom Bett auf einen Stuhl wechseln und zurück?', 'Zählt auch: vom Rollstuhl auf die Toilette oder vom Sessel aufstehen. Muss jemand stützen, halten oder heben, ist das Hilfe.'],
    '1.4': ['Kann die Person allein in der Wohnung von Raum zu Raum gehen?', 'Mit Rollator oder Rollstuhl, den die Person selbst bewegt, gilt das als allein. Zählt nicht: Gehen draußen auf der Straße.'],
    '1.5': ['Kann die Person allein eine Treppe zwischen zwei Stockwerken gehen?', 'Gefragt ist die Fähigkeit, auch wenn es zu Hause keine Treppe gibt. Wer sich nur am Geländer festhält, geht allein; wer gestützt oder getragen werden muss, nicht.'],

    '2.1': ['Erkennt die Person vertraute Menschen?', 'Zum Beispiel Familie, Nachbarn oder die Pflegekraft, die regelmäßig kommt. Es geht ums Erkennen, nicht ums Erinnern an den Namen.'],
    '2.2': ['Weiß die Person, wo sie ist, und findet sie sich in der Wohnung zurecht?', 'Zum Beispiel: findet das Bad, weiß, dass sie zu Hause ist, findet zurück, wenn sie draußen ist.'],
    '2.3': ['Weiß die Person, welche Tageszeit, welcher Tag und welche Jahreszeit ist?', 'Wer ab und zu den Wochentag verwechselt, ist noch weitgehend orientiert. Verwechselt die Person Tag und Nacht, ist die Fähigkeit stark eingeschränkt.'],
    '2.4': ['Kann sich die Person an Wichtiges erinnern?', 'Zum Beispiel: was es zum Mittagessen gab, ob Besuch da war, wichtige Ereignisse aus ihrem Leben.'],
    '2.5': ['Schafft die Person Abläufe mit mehreren Schritten in der richtigen Reihenfolge?', 'Zum Beispiel: sich der Reihe nach anziehen, Kaffee kochen, ein Brot schmieren. Muss jemand jeden Schritt ansagen, ist die Fähigkeit kaum vorhanden.'],
    '2.6': ['Kann die Person im Alltag selbst sinnvolle Entscheidungen treffen?', 'Zum Beispiel: passende Kleidung zum Wetter wählen, entscheiden, was sie essen oder tun möchte.'],
    '2.7': ['Versteht die Person, was um sie herum passiert und was man ihr erklärt?', 'Zum Beispiel: versteht sie, warum der Arzt kommt oder dass ein Termin ansteht?'],
    '2.8': ['Erkennt die Person Gefahren?', 'Zum Beispiel heiße Herdplatte, offenes Fenster, Straßenverkehr, verdorbene Lebensmittel, Stolperfallen.'],
    '2.9': ['Kann die Person sagen oder zeigen, wenn sie etwas braucht?', 'Zum Beispiel Hunger, Durst, Schmerzen, frieren oder auf die Toilette müssen. Gesten und Laute zählen auch.'],
    '2.10': ['Versteht die Person einfache Bitten?', 'Zum Beispiel „Bitte setz dich“ oder „Heb den Arm“. Ein Hörgerät gilt als Hilfsmittel.'],
    '2.11': ['Kann die Person einem Gespräch folgen und mitreden?', 'Zum Beispiel beim Besuch oder am Telefon: Fragen beantworten, beim Thema bleiben.'],

    '3.1': ['Wie oft muss jemand eingreifen, weil die Person umherläuft, nicht sitzen bleibt oder weglaufen will?', 'Bei allen Fragen in diesem Bereich zählt, wie oft jemand eingreifen, beruhigen oder aufpassen muss, nicht wie oft das Verhalten vorkommt.'],
    '3.2': ['Wie oft braucht die Person nachts Hilfe, weil sie wach und unruhig ist?', 'Zählt: nachts aufstehen und umherlaufen, Tag und Nacht verwechseln, jemanden wecken. Zählt nicht: nur schlecht schlafen ohne Hilfe von anderen.'],
    '3.3': ['Wie oft muss jemand verhindern, dass sich die Person selbst verletzt?', 'Zum Beispiel sich kratzen, schlagen, beißen, gefährliche Dinge essen oder trinken.'],
    '3.4': ['Wie oft muss jemand eingreifen, weil die Person Dinge kaputt macht oder wegwirft?', 'Zum Beispiel Geschirr zerschlagen, Kleidung zerreißen, Gegenstände aus dem Fenster werfen.'],
    '3.5': ['Wie oft greift die Person andere körperlich an?', 'Zum Beispiel schlagen, treten, kratzen, stoßen oder mit Gegenständen werfen.'],
    '3.6': ['Wie oft beschimpft oder bedroht die Person andere?', 'Zählt, wenn jemand darauf reagieren und beruhigen muss.'],
    '3.7': ['Wie oft ruft, schreit oder wiederholt die Person ständig etwas, sodass jemand reagieren muss?', 'Zum Beispiel lautes Rufen, Klagen, ständiges Fragen oder Wiederholen von Sätzen.'],
    '3.8': ['Wie oft wehrt die Person Pflege oder Hilfe ab?', 'Zum Beispiel beim Waschen, Anziehen, Essen oder bei Medikamenten, sodass man es mehrmals versuchen oder überzeugen muss.'],
    '3.9': ['Wie oft muss jemand helfen, weil die Person Dinge sieht oder glaubt, die nicht wirklich sind?', 'Zum Beispiel glaubt sie, bestohlen oder verfolgt zu werden, oder sieht Menschen, die nicht da sind.'],
    '3.10': ['Wie oft hat die Person starke Ängste, bei denen jemand beruhigen muss?', 'Zum Beispiel Angst vor dem Alleinsein, Panik ohne erkennbaren Grund.'],
    '3.11': ['Wie oft muss die Person aufgefordert und motiviert werden, weil sie antriebslos und niedergeschlagen ist?', 'Zum Beispiel: steht ohne Aufforderung nicht auf, isst nicht, wäscht sich nicht, zieht sich ganz zurück.'],
    '3.12': ['Wie oft verhält sich die Person so unpassend, dass jemand eingreifen muss?', 'Zum Beispiel sich in der Öffentlichkeit ausziehen, fremde Menschen anfassen, distanzlos sein.'],
    '3.13': ['Wie oft macht die Person andere unpassende Dinge, bei denen jemand eingreifen muss?', 'Zum Beispiel Dinge verstecken oder horten, mit Kot schmieren, Essen in den Schrank legen.'],

    '4.1': ['Kann sich die Person allein Hände, Gesicht, Arme, Brust und Bauch waschen?', 'Erinnern, Waschlappen reichen oder anleiten ist auch Hilfe.'],
    '4.2': ['Kann die Person allein kämmen, Zähne putzen und sich rasieren?', 'Auch Zahnprothese reinigen gehört dazu.'],
    '4.3': ['Kann die Person allein den Intimbereich waschen?', 'Zählt auch dann, wenn es aus Scham schwerfällt, darüber zu sprechen. Gerade hier ist eine ehrliche Antwort wichtig.'],
    '4.4': ['Kann die Person allein duschen oder baden und die Haare waschen?', 'Zählt auch: in die Dusche oder Wanne steigen und wieder heraus. Ein Badewannenlifter gilt als Hilfsmittel.'],
    '4.5': ['Kann die Person allein Hemd, Pullover oder BH an- und ausziehen?', 'Auch Kleidung bereitlegen, Knöpfe schließen oder an die Reihenfolge erinnern ist Hilfe.'],
    '4.6': ['Kann die Person allein Hose, Unterwäsche, Strümpfe und Schuhe an- und ausziehen?', 'Kompressionsstrümpfe gehören nicht hierher, sondern zu Bereich 5.'],
    '4.7': ['Kann die Person allein Essen klein schneiden, Brot schmieren und Getränke eingießen?', 'Zählt nicht: Kochen und Einkaufen.'],
    '4.8': ['Kann die Person allein essen?', 'Das Essen zum Mund führen, kauen und schlucken. Muss jemand immer wieder zum Essen auffordern, ist das auch Hilfe. Diese Frage zählt dreifach.'],
    '4.9': ['Trinkt die Person allein und genug?', 'Muss jemand immer wieder zum Trinken auffordern oder das Glas reichen, ist das Hilfe. Diese Frage zählt doppelt.'],
    '4.10': ['Kann die Person allein zur Toilette gehen und sich danach sauber machen?', 'Zählt: hingehen, hinsetzen, Kleidung richten, abwischen, spülen. Auch Toilettenstuhl, Urinflasche oder Steckbecken. Diese Frage zählt doppelt.'],
    '4.11': ['Kann die Person allein Einlagen wechseln oder Katheter oder Urostoma versorgen?', 'Wird nur gefragt, wenn die Person überwiegend oder ganz inkontinent ist oder einen Katheter oder ein Urostoma hat.'],
    '4.12': ['Kann die Person bei Stuhlinkontinenz allein sauber machen oder ein Stoma versorgen?', 'Wird nur gefragt, wenn die Person überwiegend oder ganz stuhlinkontinent ist oder ein künstlicher Darmausgang besteht.'],
    '4.13': ['Wie wird die Person ernährt?', 'Nur wichtig, wenn eine Sonde oder Infusion nötig ist. „Teilweise“ gibt mehr Punkte als „vollständig“, weil dann zusätzlich beim normalen Essen geholfen wird.'],

    '6.1': ['Kann die Person ihren Tag selbst einteilen und mit Änderungen zurechtkommen?', 'Zum Beispiel wissen, wann sie aufsteht, isst und schlafen geht, und mit einem verschobenen Termin klarkommen.'],
    '6.2': ['Kann die Person allein zur Ruhe kommen und schlafen?', 'Zählt: ins Bett gehen, einschlafen, durchschlafen. Muss jemand nachts helfen, beruhigen oder umlagern, ist das Hilfe.'],
    '6.3': ['Kann sich die Person allein sinnvoll beschäftigen?', 'Zum Beispiel lesen, fernsehen, Musik hören, Handarbeit. Muss jemand Beschäftigung anbieten und anleiten, ist das Hilfe.'],
    '6.4': ['Kann die Person selbst etwas für die nächsten Tage planen?', 'Zum Beispiel einen Arzttermin im Kopf behalten oder sich auf Besuch am Wochenende einstellen.'],
    '6.5': ['Kommt die Person allein mit Menschen in ihrer Nähe zurecht?', 'Zum Beispiel Besuch begrüßen, mit Mitbewohnern umgehen, auf andere reagieren.'],
    '6.6': ['Kann die Person allein Kontakt zu Freunden und Verwandten halten?', 'Zum Beispiel anrufen, Nachrichten schreiben, Treffen verabreden.']
  };

  // Bereich 5: Fragen in Alltagssprache. Die Antwort wird in die Häufigkeiten von pflege.js übersetzt.
  // Zählt nur, wenn jemand anderes hilft, weil die Person es nicht selbst kann.
  const M5_HINWEIS = 'Zählt nur, wenn jemand anderes hilft, weil die Person es nicht selbst kann. Macht die Person es selbst, ist die Antwort „Nein“.';
  // Bereich 5 läuft in zwei Schritten: erst eine Liste „Wobei hilft jemand?“ (mehrere ankreuzen), dann nur zu den
  // angekreuzten Punkten die Frage „Wie oft?“. Die Antworten stehen von selten nach oft.
  // Antworten für 5.1 bis 5.11 (Hilfe pro Tag, Woche oder Monat)
  const M5_OFT = [
    { text: 'Ein paarmal im Monat', wert: { monat: 2 } },
    { text: '1- bis 3-mal pro Woche', wert: { woche: 2 } },
    { text: '1-mal am Tag', wert: { tag: 1 } },
    { text: '2- bis 3-mal am Tag', wert: { tag: 3 } },
    { text: '4-mal am Tag oder öfter', wert: { tag: 5 } }
  ];
  // Antworten für Arzt- und Therapiebesuche (5.13 bis 5.15, 5.K): Begleitung nötig
  const M5_BESUCH = [
    { text: '1-mal im Monat', wert: { monat: 1 } },
    { text: '2- bis 3-mal im Monat', wert: { monat: 3 } },
    { text: 'Jede Woche', wert: { woche: 1 } },
    { text: 'Mehrmals pro Woche', wert: { woche: 3 } }
  ];
  const M5_AUFWENDIG = [{ text: 'An einigen Tagen pro Woche', wert: { woche: 2 } }, { text: 'Jeden Tag', wert: { taeglich: true } }];
  // Kurze Bezeichnungen für die Liste „Wobei hilft jemand?“
  const M5_KURZ = {
    '5.1': 'Medikamente richten oder geben', '5.2': 'Spritzen geben, zum Beispiel Insulin', '5.3': 'Port oder Venenzugang versorgen',
    '5.4': 'Absaugen oder Sauerstoff geben', '5.5': 'Eincremen, Kälte- oder Wärmepackungen', '5.6': 'Blutzucker, Blutdruck oder Gewicht messen',
    '5.7': 'Kompressionsstrümpfe, Prothese, Hörgerät oder Brille anlegen', '5.8': 'Verband wechseln, Wunden versorgen', '5.9': 'Stoma versorgen',
    '5.10': 'Einmalkatheter legen oder beim Abführen helfen', '5.11': 'Übungen aus Krankengymnastik oder Logopädie zu Hause',
    '5.12': 'Aufwendige Behandlung zu Hause, zum Beispiel Heimbeatmung oder Dialyse', '5.13': 'Zum Arzt begleiten',
    '5.14': 'Zur Therapie begleiten, zum Beispiel Krankengymnastik (bis 3 Stunden)', '5.15': 'Zu langen Behandlungen begleiten, zum Beispiel Dialyse oder Chemotherapie (über 3 Stunden)',
    '5.K': 'Zur Frühförderung begleiten'
  };
  const M5 = {
    '5.1': 'Muss jemand die Medikamente richten oder geben?',
    '5.2': 'Muss jemand Spritzen geben, zum Beispiel Insulin?',
    '5.3': 'Muss jemand einen Port oder Venenzugang versorgen?',
    '5.4': 'Muss jemand absaugen oder Sauerstoff geben?',
    '5.5': 'Muss jemand mit Salben eincremen oder Kälte- und Wärmepackungen machen?',
    '5.6': 'Muss jemand Blutzucker, Blutdruck oder Gewicht messen und deuten?',
    '5.7': 'Muss jemand Kompressionsstrümpfe, Prothese, Hörgerät oder Brille anlegen?',
    '5.8': 'Muss jemand Verbände wechseln oder Wunden versorgen?',
    '5.9': 'Muss jemand ein Stoma versorgen?',
    '5.10': 'Muss jemand einen Einmalkatheter legen oder beim Abführen helfen?',
    '5.11': 'Muss jemand zu Hause Übungen aus Krankengymnastik oder Logopädie mit der Person machen?',
    '5.12': 'Braucht die Person zu Hause aufwendige Behandlungen wie Heimbeatmung oder Dialyse, bei denen jemand hilft?',
    '5.13': 'Muss jemand die Person zum Arzt begleiten?',
    '5.14': 'Muss jemand die Person zu Krankengymnastik oder einer anderen Therapie begleiten (bis 3 Stunden)?',
    '5.15': 'Muss jemand die Person zu langen Behandlungen begleiten, zum Beispiel Dialyse oder Chemotherapie (über 3 Stunden)?',
    '5.K': 'Muss jemand das Kind zur Frühförderung begleiten?',
    '5.16': 'Kann die Person eine Diät oder ärztliche Anweisungen allein einhalten?'
  };
  const M5_TIPP = {
    '5.1': 'Zum Beispiel Tabletten in die Dosierbox legen, Tropfen geben, an die Einnahme erinnern und darauf achten, dass sie wirklich genommen werden.',
    '5.6': 'Zum Beispiel Blutzucker vor dem Essen messen und die Insulinmenge danach richten.',
    '5.7': 'Nur das Anlegen und Ablegen zählt. Kompressionsstrümpfe morgens an und abends aus sind zweimal am Tag.',
    '5.13': 'Zählt, wenn die Person nicht allein hingehen kann, sondern begleitet oder gebracht werden muss.',
    '5.16': 'Zum Beispiel eine Diabetes-Diät, Trinkmengen bei Herzschwäche oder Verbote nach einer Operation.'
  };

  // Einfache Sprache (Schalter in den Einstellungen, nur Deutsch): einfache Fassungen aus src/lang/einfach/pflege/pflege.json,
  // im Paket als PFLEGE_EINFACH (scripts/build.js), in Node per require. Gleicher Aufbau wie hier; "=" heißt: Standardtext ist schon einfach.
  // Ausgetauscht werden nur Texte. Stufen, Werte und Punkte bleiben gleich (Prüfung: test/test-pflege-einfach.js).
  let EINFACH = null;
  try { EINFACH = typeof PFLEGE_EINFACH !== 'undefined' ? PFLEGE_EINFACH : typeof require === 'function' ? require('../src/lang/einfach/pflege/pflege.json') : null; } catch (e) { EINFACH = null; }
  let einfach = false;
  function setEinfach(an) { einfach = !!an && !!EINFACH; }
  function istEinfach() { return einfach; }
  // Text an Pfad (z. B. ['text', '1.1', 0]) in Einfacher Sprache, sonst der Standardtext
  function ein(pfad, std) {
    if (!einfach) return std;
    let v = EINFACH;
    for (const k of pfad) v = v == null ? null : v[k];
    return typeof v === 'string' && v !== '=' && v.trim() ? v : std;
  }
  const fuellen = (s, p) => (p ? s.replace(/\{(\w+)\}/g, (x, k) => (p[k] != null ? String(p[k]) : x)) : s);
  // Feste Texte der Oberfläche (pflege-assistent.js): Schlüssel, Standardtext mit {Platzhaltern}, Werte
  function ui(key, std, p) { return fuellen(ein(['ui', key], std), p); }

  function frage(id) {
    if (TEXT[id]) return ein(['text', id, 0], TEXT[id][0]);
    if (M5[id]) return ein(['m5', id], M5[id]);
    return id;
  }
  function m5Tipp(id) { return M5_TIPP[id] ? ein(['m5Tipp', id], M5_TIPP[id]) : ''; }
  function hinweis(id) {
    if (TEXT[id]) return ein(['text', id, 1], TEXT[id][1]);
    return m5Tipp(id) || (id.startsWith('5.') ? ein(['m5Hinweis'], M5_HINWEIS) : '');
  }
  function vorfrage(m) { return { frage: ein(['vorfrage', m, 0], VORFRAGE[m].frage), hinweis: ein(['vorfrage', m, 1], VORFRAGE[m].hinweis) }; }
  function kurz(id) { return M5_KURZ[id] ? ein(['m5Kurz', id], M5_KURZ[id]) : id; }
  function kind() { return ein(['kind'], KIND); }
  function grundsatz() { return GRUNDSATZ.map((t, i) => ein(['grundsatz', i], t)); }
  // Antworttexte einer Skala aus pflege.js (sel, fae, hfg, sonde): Reihenfolge und Anzahl bleiben, nur die Worte ändern sich
  function antwortTexte(skala, std) { return std.map((t, i) => ein(['antworten', skala, i], t)); }
  function modul(m, std) { return ein(['modul', m], std); }

  // Antwort für Bereich 5 in die Werte von pflege.js übersetzen (Werte immer aus den Standardlisten)
  function m5Liste(id) { return id === '5.12' ? ['aufwendig', M5_AUFWENDIG] : /^5\.(13|14|15|K)$/.test(id) ? ['besuch', M5_BESUCH] : ['oft', M5_OFT]; }
  function m5Antworten(id) { const [art, l] = m5Liste(id); return l.map((x, i) => ({ text: ein(['antworten', art, i], x.text), wert: x.wert })); }
  function m5Wert(id, antwortIndex) { const a = m5Liste(id)[1][antwortIndex]; return a ? Object.assign({}, a.wert) : {}; }
  // „Wie oft …?“-Frage zu einem angekreuzten Punkt
  function m5Oft(id) {
    if (id === '5.12') return ein(['m5Oft', '5.12'], 'Wie oft ist die aufwendige Behandlung zu Hause nötig?');
    return frage(id).replace(/^Muss jemand /, 'Wie oft muss jemand ');
  }

  return { GRUNDSATZ, KIND, VORFRAGE, TEXT, M5, M5_KURZ, M5_HINWEIS, M5_TIPP, frage, hinweis, m5Wert, m5Antworten, m5Oft,
    EINFACH, setEinfach, istEinfach, ui, vorfrage, kurz, kind, grundsatz, antwortTexte, modul, m5Tipp };
})();
if (typeof module !== 'undefined') module.exports = PflegeFragen;
