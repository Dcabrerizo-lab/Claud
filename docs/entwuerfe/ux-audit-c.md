# UX-Audit C: Geld und Schulden, Pfändung, Netto aus Brutto, Ersparnisse (Stand 1.9.0)

Stand 21.11.2026 · geprüft auf `origin/main` cd62ae6 (1.9.0), Store-App (`app/www`, nachgeahmte Capacitor-Plugins, Android) bei 390×844 mit Playwright, ein Browser. **Nur geprüft, kein App-Code geändert.**
Aufbau und Maßstab wie `docs/entwuerfe/ux-ergebnis-mappe.md` (Branch `claude/b-ux-pruefung`). Bilder: `docs/entwuerfe/ux-bilder-c/` (8 Stück). Rohfotos und Messwerte (≈ 60 Ansichten, je Bild + JSON): `/home/claude/uxc-bilder/` (nicht im Repo).

## Kurzurteil

| Frage | Antwort | Kurz begründet |
|---|---|---|
| Findet ein Mensch in der Krise sofort, was zu tun ist? | **Ja, überwiegend** | „Es ist dringend“ ist die erste Kachel, jeder Notfall hat dieselbe Form: **Frist** (rot) → **Das tust du jetzt** (grün) → Knöpfe. Fast jede Seite passt auf **1 Bildschirm**, die Kacheln sind groß, Zurück steht überall oben links. Der Krisen-Check (7 Ja/Nein-Fragen) gibt eine nummerierte Reihenfolge. |
| Ist der Bereich so übersichtlich wie GOV.UK/MoneyHelper oder StepChange? | **Noch nicht** | Drei Schwächen: (1) **„Beratungsstelle finden“ ist eine Textwand ohne Link** – der wichtigste Ausweg führt nirgends hin (168 Wörter, 0 tippbare Links). (2) **Doppelungen**: „Mein Konto ist gepfändet“ gibt es zweimal mit anderem Inhalt; Prüfliste zeigt dieselben 6 Punkte zweimal; Mitbring-Liste steht in Beratungsmappe und Druckblatt; „Abschlag prüfen/Tarife“ unter Strom **und** Heizen. (3) **Viele Wege, viele Namen**: Kachel „Was bleibt mir?“ → Seite „Pfändung: Was bleibt dir?“, „Haushaltsplan“ → „Haushaltsplan und Haushaltsbuch“ → Tab „Ausgaben“, „Beratungsstelle finden“ / „Schuldnerberatung“ / „Kostenlose Hilfe“ für dasselbe Ziel. |

## Ampel je Ansicht

Messwerte: Bs = Bildschirme (Seitenhöhe/844 px), W = sichtbare Wörter (zugeklappte nicht gezählt), Bed = Bedienelemente (davon Aufklapper).

| Ansicht | Ampel | Bs / W / Bed | Was gut ist | Was stört |
|---|---|---|---|---|
| Geld und Schulden (6 Kacheln) | 🟢 | 1,1 / 55 / 7 | Reihenfolge wie Schuldnerberatung (sichern → ordnen → antworten → planen → Hilfe), „Es ist dringend“ oben links (Bild 01) | Silbentrennung in Titeln („Schul-den-Liste“, „Schuldnerbera-tung“, „Mahnbe-scheid“); Kachel „Was bleibt mir?“ öffnet eine Seite mit anderem Titel und **lila** Symbolen |
| Es ist dringend | 🟢 | 1,1 / 43 / 7 | 6 große Kacheln, Krisen-Check zuerst | 5 der 6 Kacheln ohne Untertitel (nur Titel, viel Leerraum); keine Notfall-Nummer/„sofort anrufen“ |
| Krisen-Check Frage | 🟢 | 1,0 / 23 / 4 | Eine Frage pro Seite, „Frage 1 von 7“, „Weiß nicht – weiter“ (wie GOV.UK „one thing per page“) | „Weiß nicht“ ist nur Textlink (Ja/Nein sind große Knöpfe) |
| Krisen-Check Ergebnis | 🟡 | 1,3 / 41 / 6 | Nummerierte Reihenfolge, Beratung am Ende (Bild 02) | Überschrift doppelt („Was ist zuerst dran?“ / „Das ist zuerst dran“); Karten nur mit Titel – **keine Frist und kein Grund** je Punkt („Widerspruch in 2 Wochen“ steht erst eine Ebene tiefer); Karte „Beratungsstelle finden“ ohne Nummer, anders eingerückt |
| Konto gepfändet | 🟢 | 1,1 / 55 (offen 169) / 8 | Frist, 2 Schritte, Grundfreibetrag 1.590 €, grüner Hauptknopf „Ausrechnen, was dir bleibt“ (Bild 03) | Paragrafen im Laientext (§ 850k, § 899, § 903 ZPO); Frist muss man aufklappen, um „ab Eingang bei der Bank“ zu lesen |
| Strom-/Gassperre | 🟡 | 1,1 / 55 / 9 (6) | 3 klare Schritte, „Abschlag prüfen“ | Die „Frist“ ist eine Pflicht des Versorgers („4 Wochen vorher androhen …“), keine Frist für den Nutzer; kein grüner Hauptknopf |
| Mahnbescheid | 🟡 | 1,0 / 41 / 7 (4) | Frist 2 Wochen prominent | Kein Hauptknopf; der entscheidende Satz „kreuze im **beiliegenden Formular** an“ steht nur aufgeklappt; kein Knopf „Frist merken“ (gibt es bei „Brief prüfen“) |
| Wohnung/Mietschulden | 🟡 | 1,0 / 42 / 6 (4) | Schritt „Sofort beim Amt Übernahme beantragen“ | Frist „Spätestens 2 Monate nach Zustellung der Räumungsklage zahlen“ passt nicht zu „Wohnung gekündigt“ ohne Klage und klingt nach „Zeit bis dahin“ – **fachlich prüfen**; kein Knopf zum Antrag (Jobcenter/Sozialamt) |
| Geldstrafe: Haft droht | 🟢 | 1,0 / 32 / 5 (3) | Kurz | – |
| Post vom Inkasso (4 Kacheln) | 🟢 | 1,0 / 35 / 5 | Klare Aufgaben mit Verb | „Gelber Umschlag vom Gericht?“ ist eine Kopie aus „Es ist dringend“ (Link, gewollt) |
| Stimmt der Brief? (Prüfliste) | 🔴 | 2,2 / 237 / 13 (5) | Haken-Zeilen 68–92 px hoch, Hinweis „keine Rechtsberatung“ | **Ohne Haken stehen alle 6 Punkte ein zweites Mal** als „Was fehlt“-Liste (Bild 04); dazu 4 Tipp-Zeilen; Abstand zwischen Haken-Zeilen sehr groß |
| Schreiben an Gläubiger | 🟢 | 1,0 / 51 / 4 | 3 Muster als Kacheln | Hinweis „Bei Post vom Gericht … sofort Beratung“ ohne Knopf |
| Raten anbieten | 🔴 | 1,7–1,9 / 103–132 / 11 | Rate aus dem Haushaltsplan, Warnung „Anerkennung der Forderung“ | Mit Plan sagt die App „**Biete keine Rate an**“ – darunter steht trotzdem das ganze Ratenformular (Bild 07); 2 gelbe Warnkästen + 2 Nebenknöpfe vor dem Formular; Knopf „Stimmt der Brief?“ klebt an der Überschrift |
| Schulden-Liste (leer) | 🟡 | 1,4 / 87 / 7 | Gute Prioritäten-Karte „Was ist zuerst wichtig?“ | 3 Verweis-Kacheln (Beratung, Haushaltsplan, Was bleibt mir?) **vor** dem Hauptknopf „Schuld eintragen“ |
| Schulden-Liste (3 Einträge) | 🟡 | 2,8 / 168 / 20 | Summe, Gruppen „Dringend“ / „Zuerst“, Status-Abzeichen | 4 Verweis-Kacheln ≈ 1 Bildschirm vor der Liste (Bild 06); je Eintrag „Warum?“ + 2–3 kleine Rahmenknöpfe („Ändern“, „Stimmt der Brief?“, „Schreiben“) |
| Schuld eintragen | 🟢 | 1,7 / 136 / 15 | Nur nötige Felder offen, Rest unter „Weitere Angaben“ | 10 Felder; zwei Datumsfelder ohne Erklärung, wofür |
| Druckblatt Gläubigerliste | 🟡 | 3,0 / 219 / 7 | Ohne Namen, Kürzel freiwillig, Datenschutz-Hinweis | Vorschau: Beträge **ohne Beschriftung** („1.280 €“, „30 €“ – was ist was?); Mitbring-Liste = Beratungsmappe (doppelt gepflegt) |
| Schuldnerberatung (4 Kacheln) | 🟢 | 1,0 / 31 / 5 | Finden, Termin, Mappe, Ablauf | – |
| Beratungsstelle finden | 🔴 | 1,4 / 168 / 3 | Inhalt fachlich stark (BAG-SB, Wohlfahrt, Jobcenter, Sozialamt) | **Kein Link, keine Suche, kein Telefon** – „meine-schulden.de → Hilfe finden“ ist reiner Text (Bild 05); 5 Absätze in einem Kasten. Einfache Sprache halbiert (87 W), Link fehlt auch dort |
| Bis zum Termin | 🟡 | 1,4 / 71 / 12 | Abhaken, Sprungknöpfe | 3× gleicher Knopftext „Öffnen“ (Ziel unklar, WCAG 2.4.4/2.4.6) |
| Beratungsmappe | 🟡 | 1,8 / 124 / 12 | Abhaken + „Mappe drucken“ | 8 lange Punkte; dieselbe Liste wie Druckblatt |
| Ablauf und Privatinsolvenz | 🟢 | 1,0 / 71 / 6 | 4 Kernsätze, Rest aufklappbar | – |
| Mein Geld planen | 🟢 | 1,1 / 48 / 6 | Haushaltsplan als breite Kachel, darunter 4 Spar-Themen | – |
| Strom / Heizen (Themen) | 🟡 | 1,0–1,1 / 50–59 / 9–10 | Wirksamste Tipps zuerst, je 1 Satz | „Abschlag prüfen“ und „Tarife vergleichen“ stehen **auf beiden Seiten**, danach nochmals Wahl Strom/Gas (Zwischenseite mit 9 Wörtern) |
| Abschlag prüfen (Energie-Check) | 🟡 | 2,0 / 159 / 11 | Oben „Für das Ergebnis fehlt noch: …“ (sehr gut), Dauer „etwa 3 Minuten“ | 9 Felder; „Strom“ steht doppelt (Kartenkopf + Abschnitt); Datumsfelder im Test „mm/dd/yyyy“ (auf Gerät prüfen) |
| Tarife vergleichen | 🟢 | 2,1 / 132 / 14 | Fehlt-noch-Kasten, 5 Tipps zugeklappt, neutraler Link Verbraucherzentrale | – |
| Essen / Verträge | 🟢 | 1,0 / 32–58 | Kurz, VZ-Link | – |
| Haushaltsplan (Plan) | 🟡 | 2,1 / 124 / 19 | 9 Ausgaben-Kacheln mit Symbol, Netto wird in den Leistungs-Check übernommen | Seitentitel „Haushaltsplan und Haushaltsbuch“ ≠ Kachel „Haushaltsplan“; Ergebnis „was übrig bleibt“ steht oben, Eingabe darunter (gut), aber 2 Bildschirme |
| Ausgaben / Kassenzettel | 🟡 | 1,0 / 31 / 8; Eintragen 1,7 / 35 / 32 | Großer Knopf „+ Ausgabe eintragen“, Satz zum Foto-Datenschutz | Eigene Zifferntastatur (12 Tasten) **und** Eingabefeld mit Fokus – auf dem Handy öffnet sich zusätzlich die System-Tastatur (auf Gerät prüfen); Kassenzettel-Scan im Browser-Test nicht auslösbar |
| Auswertung (leer) | 🟡 | 1,0 / 22 / 9 | Hinweis „Trag sie unter Ausgaben ein“ | Kein Knopf zu „Ausgaben“; Karte „Belege 2026“ ohne Erklärung, halb leer |
| Pfändung: Wahl | 🟡 | 1,0 / 51 / 4 | 3 klare Fälle | Lila Symbole (andere Farbe als der Rest des Bereichs); „Mein Konto ist gepfändet“ führt hier zum Rechner, unter „Es ist dringend“ zu einer anderen Seite gleichen Namens |
| Pfändung Konto/Lohn | 🟢 | Fragen 1,0 / 23–31; Ergebnis 1,2–1,3 / 61–70 | Eine Frage pro Seite, große Zahlknöpfe, Ergebnis als Satz in groß („Dir bleiben 1.741,18 € im Monat.“), Schritte grün | Konto-Ergebnis nennt 1.590 € zweimal (Satz + Tabelle); Knopf heißt „Schuldnerberatung“ (sonst „Beratungsstelle finden“); in Lohn-Schritt kein Weg zu „Netto ausrechnen“ |
| P-Konto-Bescheinigung | 🟢 | 1,3 / 77 / 6 | Muster mit 3 Feldern, „Drucken oder teilen“ | – |
| Netto aus Brutto (im Leistungs-Check) | 🟢 | 2 Fragen (Steuerklasse, Kirche) | Große Wahlknöpfe mit Erklärung („Allein, ohne Kind“), Ergebnis landet direkt im Feld | Knopf „Netto ausrechnen“ steht **unter** dem Netto-Feld, braucht aber das Brutto darüber (ohne Brutto nur „Bitte zuerst das Brutto eintragen“); Ergebnis mit Cent („1696,07“) ohne Bestätigungssatz |
| Ersparnisse aufteilen | 🟡 | 7 Wahlknöpfe → Beträge → Ergebnis | „Tippe alles an, was passt“, Ergebnis „Zählt als Vermögen 9.000 €“ mit Begründung | Zweiter „← Zurück“ als Textlink **im** Helfer (Zurück sonst nur oben links); Auslöser-Knopf zweizeilig |

## Querschnitt

| Kriterium | Befund |
|---|---|
| Was man zuerst sieht | Überall: Zurück → Bereichstitel „Geld und Schulden“ → Seitentitel (kleiner). Der große Titel ist auf jeder Unterseite gleich, die eigentliche Aufgabe steht kleiner darunter. GOV.UK/NHS zeigen die Aufgabe als H1. |
| 44 px | Alle Knöpfe, Kacheln, Aufklapper ≥ 44 px ✓. Kontrollkästchen 24×24 px, aber die ganze Zeile (Label) ist tippbar: 68–92 px ✓. Zurück 71×44 ✓. |
| Kontrast/Schrift | Automatische Prüfung (WCAG-Formel, alle sichtbaren Texte, ≈ 60 Ansichten): **0 Verstöße** unter 4,5 : 1. Kleinste Schrift 14 px (Untertitel), Fließtext 15–16 px ✓. |
| Aufklapp-Logik | Einheitlich (Symbol + 1 Satz fett, Rest zugeklappt, ▸). Ausnahme: „Frist“ ist auch zugeklappt – das Wichtigste der Seite braucht einen Tipp. |
| Konsistenz | Zurück immer oben links (RTL oben rechts) ✓, Kartenform gleich ✓. Uneinheitlich: Farben (Pfändung lila), Namen (siehe Kurzurteil), Hauptknopf mal vorhanden (Konto), mal nicht (Mahn, Miete, Strom). |
| Doppelungen | Konto gepfändet (2 Seiten), Prüfliste (6 Punkte 2×), Mitbring-Liste (Mappe + Druckblatt), Energie-Werkzeuge (Strom + Heizen), Gelber Umschlag (Inkasso + Dringend, gewollt), Grundfreibetrag (2× auf einer Seite). |
| Arabisch (RTL) | Spiegelung, Zurück-Pfeil (→ rechts oben), Symbole und Haken korrekt; Amtsbegriffe deutsch kursiv unter der Übersetzung (gut für den Behördengang, Bild 08). Euro-Beträge lesbar („1,590 €“). |
| Einfache Sprache | Wirkt im Bereich (eigene Texte `src/lang/einfach/schulden*.json`): „Beratung finden“ 168 → 87 Wörter, Frist heißt „Bis wann?“. Sonst gleich lang oder länger (Prüfliste 237 → 246, Übersicht 55 → 66). Seitentitel wechselt („Meine Schulden-Liste“ → „Meine Schulden“). |
| Skriptfehler | 0 in allen Durchläufen. |

## Abgleich mit Standards

| Standard | Kernregel | SoLo Bereich C | Bewertung |
|---|---|---|---|
| [GOV.UK Design System – Question pages](https://design-system.service.gov.uk/patterns/question-pages/) („one thing per page“) | Eine Frage pro Seite, Frage als Überschrift | Krisen-Check und Pfändung genau so | 🟢 |
| [MoneyHelper – Debt advice locator](https://www.moneyhelper.org.uk/en/money-troubles/dealing-with-debt/debt-advice-locator.html) | Eigenes Werkzeug: Ort eingeben → kostenlose Beratung in der Nähe, online/Telefon | Nur Text „meine-schulden.de → Hilfe finden“, kein Link | 🔴 |
| [StepChange – What debts to pay first](https://www.stepchange.org/debt-info/dealing-with-debt-problems/what-debts-to-pay-first.aspx), [Priority debts](https://www.stepchange.org/7-days-7-ways/work-out-your-priority-debts.aspx) | Vorrangige Schulden (Miete, Energie, Steuern, Strafen) zuerst, mit Grund | Krisen-Check und Schulden-Liste ordnen so; Ergebnis-Karten nennen aber keinen Grund/keine Frist | 🟡 |
| [meine-schulden.de (BAG-SB)](https://www.meine-schulden.de/en) | Beratungsstellen-Suche nach Ort/Bundesland, Filter kostenfrei | Wird empfohlen, aber nicht verlinkt; [Suche nach Bundesland](https://www.meine-schulden.de/en/hilfe-finden/schuldnerberatungsstellen/bundesland) wäre direkt ansteuerbar | 🔴 |
| [Caritas Schuldnerberatung](https://caritas.de/hilfeundberatung/ratgeber/schulden/finanzcoaching-fuer-junge-leute) | Wenige Schritte, Beratung als Ziel jeder Seite | „Beratungsstelle finden“ als letzter Knopf auf jeder Notfallseite ✓ | 🟢 |
| [NHS App / NHS Service Manual – Content](https://service-manual.nhs.uk/content) | Kurze Sätze, Aufgabe als Titel, keine Fachbegriffe ohne Erklärung | Sätze kurz; Paragrafen im Laientext; Aufgabe nur als H2 | 🟡 |
| [Nielsen-Heuristiken](https://www.nngroup.com/articles/ten-usability-heuristics/) Nr. 4 Konsistenz, Nr. 8 Minimalismus | Ein Name pro Sache, nichts Doppeltes | 3–4 Namen für Beratung, doppelte Seiten (siehe oben) | 🟡 |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) / BITV 2.0: 1.4.3 Kontrast, 2.5.8 Zielgröße (24 px), 2.4.6/2.4.4 Beschriftung/Linkzweck | Kontrast 4,5 : 1, Ziele ≥ 24 px, eindeutige Knopftexte | Kontrast ✓, Ziele ✓ (sogar 44 px); 3× „Öffnen“ ohne Ziel ✗ | 🟢/🟡 |
| [Apple HIG – Layout](https://developer.apple.com/design/human-interface-guidelines/layout) (44 pt), [Material 3 – Accessibility](https://m3.material.io/foundations/designing/structure) (48 dp) | Tippflächen 44 pt / 48 dp, ein Hauptknopf je Seite | Tippflächen ✓; Hauptknopf fehlt auf 3 Notfallseiten | 🟡 |

## Aufgaben (Vorschläge, nach Wirkung)

Aufwand: S bis ½ Tag · M 1–2 Tage · L mehr. „Recht/Beträge“ = ja → vor Umsetzung fachlich (Fable) prüfen.

| # | Datei / Funktion | Was | Aufwand | Recht/Beträge |
|---|---|---|---|---|
| 1 | `src/app.js` `spRender` Zweig `hilfe`/`finden` (Texte `sl.hilfe.1–5`) | **Großer Knopf „Beratungsstelle in deiner Nähe suchen“** (meine-schulden.de, öffnet extern wie `linkKarte`), darunter 3 kurze Sätze; Jobcenter/Sozialamt-Absätze in „Mehr dazu“ | S | nein (Link prüfen) |
| 2 | `src/geld.js` `pruefliste` | „Was fehlt“-Liste nur zeigen, wenn mindestens 1 Haken gesetzt ist, oder nur die fehlenden Punkte als Satz; Abstand der Haken-Zeilen verkleinern | S | nein |
| 3 | `src/geld.js` `rateSeite` | Wenn „nichts pfändbar“: Formular zuklappen („Trotzdem ein Schreiben machen ▸“), Hauptknopf „Beratungsstelle finden“; nur 1 Warnkasten | S | ja (Satz zur Pfändungstabelle) |
| 4 | `src/app.js` `GS_KACHELN`/`pfRender`; `GS_DRINGEND` | **Eine** Seite „Mein Konto ist gepfändet“: Notfallseite behält Frist/Schritte, Rechner ist ihr Hauptknopf (ist schon so) – in „Was bleibt mir?“ die Kachel umbenennen in „Freibetrag auf dem P-Konto ausrechnen“ | S | nein |
| 5 | `src/app.js` Zweig `dringend` (`gs-knoepfe`) | Jede Notfallseite mit **einem grünen Hauptknopf**: Mahn → „Frist merken“ (wie in Brief prüfen) bzw. „In die Schulden-Liste“; Miete → „Antrag auf Übernahme der Mietschulden“ (Muster/Leistungs-Check); Strom → „Mit dem Versorger Raten vereinbaren“ (Musterschreiben) | M | ja (Miete, Strom) |
| 6 | `src/lang/de.json` `gs.d.*.frist.kurz` (+ Übersetzungen) | Frist als Handlung des Nutzers formulieren und **nicht zuklappen**: Strom „Sofort handeln: Die Sperre kommt frühestens 8 Werktage nach der Ankündigung“; Miete „Sofort handeln. Letzte Rettung: bis 2 Monate nach der Räumungsklage zahlen“ | S | **ja** |
| 7 | `src/geld.js` `ergebnisZeigen` | Krisen-Check-Ergebnis: je Karte 1 Zeile Grund/Frist („Widerspruch in 2 Wochen“), Überschrift nur einmal, Beratung als nummerierter letzter Schritt | S | ja (Fristtexte aus vorhandenen Schlüsseln) |
| 8 | `src/schulden.js` `render` (Kacheln `sl-zur-beratung`, `sl-druck`, `sl-hh`, `sl-pf`) | „Schuld eintragen“ und Liste zuerst; Verweis-Kacheln ans Ende als schmale Zeilen; „Warum?“ je Eintrag in die Gruppe verschieben | S–M | nein |
| 9 | `src/schulden.js` `blattOeffnen` | Druckvorschau: Beträge beschriften („Offen: 1.280 €“, „Rate: 30 €/Monat“); Mitbring-Liste aus derselben Quelle wie `Geld.mappe` | S | nein |
| 10 | Namen: `src/lang/de.json` (`gs.bleibt`, `pf.h`, `hb.h`, `hb.kachel`, `sb.finden`, Knopf `pf-zur-hilfe`) | Ein Name je Ziel: „Was bleibt mir?“ = Seitentitel; „Haushaltsplan“ = Seitentitel (Tabs bleiben); Beratung überall „Beratungsstelle finden“ | S | nein |
| 11 | `src/app.js` `spRender` (Themen strom/heizen, `EN_WERKZEUGE`) | Werkzeuge nur einmal: auf „Mein Geld planen“ eine Kachel „Energie-Check: Abschlag und Tarif“; Strom/Gas als Umschalter **im** Rechner statt Zwischenseite | M | nein |
| 12 | `src/template.html` / `src/navigation.js` (Ansicht `sparen`) | Seitentitel = Aufgabe (H1 „Mahnbescheid vom Gericht“), „Geld und Schulden“ als kleine Zeile darüber (Breadcrumb) | M | nein |
| 13 | `src/geld.js` `wartezeit` | Knopftexte statt „Öffnen“: „Schreiben öffnen“, „P-Konto ausrechnen“, „Zur Schulden-Liste“ | S | nein |
| 14 | `src/app.js` `pfRender` (Lohn, Schritt Netto) | Link „Netto aus Brutto ausrechnen“ wie im Leistungs-Check; Konto-Ergebnis: Tabelle mit 1.590 € weglassen (steht im Satz) | S | nein |
| 15 | `src/app.js` Netto-Helfer (`ek*Nh`), `vaRender` | „Netto ausrechnen“ direkt unter das Brutto-Feld; Ergebnis auf volle Euro + Satz „Geschätzt: etwa 1.696 € netto“; im Ersparnis-Helfer inneren Textlink „← Zurück“ durch Knopf „Auswahl ändern“ ersetzen | S | ja (Rundung) |
| 16 | `src/haushalt.js` Ausgabe eintragen, Auswertung | Eigene Zifferntastatur nur, wenn die System-Tastatur unterdrückt ist (`inputmode="none"`), sonst weglassen – auf Gerät prüfen; Auswertung leer: Knopf „Ausgabe eintragen“, „Belege 2026“ erklären | M | nein |
| 17 | CSS `src/template.html` (Kacheltitel `.sk-txt b`), Farbe `--c-pfaendung` | `hyphens: manual` für Kacheltitel (wie in Audit B #10); Pfändung im Bereich Geld in Grün oder Lila überall | S | nein |
| 18 | Texte Notfallseiten (`gs.d.konto.*`, `pf.tipp.bescheinigung`) | Paragrafen im normalen Modus in „Quellen“ verschieben (in Einfacher Sprache entfernt sie `Fmt.ohnePara` schon) | S | ja (Quellen bleiben) |

## Vorher / Nachher

### 1 Beratungsstelle finden
```
VORHER                                   NACHHER
Beratungsstelle finden                   Beratungsstelle finden
┌ Suche nach Postleitzahl: meine-        Kostenlos bei Caritas, Diakonie, AWO,
│ schulden.de → „Hilfe finden“ … (Text)  Verbraucherzentrale und Kommunen.
│ Anerkannte Stellen gibt es bei …       [ Beratungsstelle in deiner Nähe suchen ↗ ]
│ Ist es dringend …? Sag das gleich …    Dringend (Räumung, Sperre, Konto)? Sag es beim ersten Anruf.
│ Bekommst du Grundsicherungsgeld …      ▸ Jobcenter oder Sozialamt kann helfen
└ Bekommst du Sozialhilfe …              ▸ Vorsicht: unseriöse Anbieter
```

### 2 Prüfliste
```
VORHER  ☐ 6 Punkte  →  „Du hast nichts angehakt …“  + dieselben 6 Punkte als Liste  + [Bitte um Forderungsaufstellung]
NACHHER ☐ 6 Punkte  →  (erst nach dem ersten Haken) „Es fehlen 3 Angaben. Du kannst sie anfordern.“ [Forderungsaufstellung anfordern]
```

### 3 Raten anbieten bei „nichts pfändbar“
```
VORHER  ⚠ Biete keine Rate an …  [Schuldnerberatung]  ⚠ Anerkennung …  [Stimmt der Brief?]  Formular (5 Felder) [Drucken]
NACHHER ⚠ Nach der Pfändungstabelle bleibt dir alles. Erst zur Beratung.
        [Beratungsstelle finden]
        ▸ Trotzdem ein Ratenschreiben machen
```

### 4 Krisen-Check-Ergebnis
```
VORHER  Was ist zuerst dran? / Das ist zuerst dran
        1. [Mahnbescheid vom Gericht]  2. [Wohnung gekündigt …]  3. [Mein Konto ist gepfändet]  [Beratungsstelle finden]
NACHHER Das ist zuerst dran
        1. Mahnbescheid – Widerspruch in 2 Wochen ›
        2. Wohnung – heute beim Amt Übernahme beantragen ›
        3. Konto – in 1 Monat P-Konto ›
        4. Beratungsstelle anrufen ›
```

## Bilder

| Datei | Zeigt |
|---|---|
| 01-geld-uebersicht.png | 6 Kacheln, Silbentrennung in Titeln |
| 02-krisencheck-ergebnis.png | Reihenfolge ohne Frist/Grund, Überschrift doppelt |
| 03-konto-gepfaendet.png | Gutes Muster: Frist → Das tust du jetzt → Hauptknopf |
| 04-pruefliste-doppelt.png | 6 Punkte zum Abhaken und darunter nochmals als Liste |
| 05-beratung-finden-textwand.png | 168 Wörter, kein Link |
| 06-schuldenliste-karten-oben.png | 4 Verweis-Kacheln vor „Schuld eintragen“ und der Liste |
| 07-raten-warnung-und-formular.png | „Biete keine Rate an“ und darunter das Ratenformular |
| 08-arabisch-konto.png | RTL korrekt, deutsche Amtsbegriffe kursiv |

## Grenzen
- Browser-Test (Chromium, Android-Nachahmung), keine echten Geräte, kein Dunkelmodus, keine Tablet-Breite. Kassenzettel-Scan (Kamera) und System-Tastatur nicht prüfbar.
- Beratungsmodus nicht geprüft (nur Laien-Ansicht).
- Fachliche Aussagen (Fristtexte Miete/Strom, Rate bei Pfändungsfreiheit, Rundung Netto) nur als Vorschlag – vor Umsetzung von Fable prüfen lassen.
