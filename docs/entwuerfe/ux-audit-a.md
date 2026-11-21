# UX-Audit A: Startseite, Leistungs-Check, Einstellungen, Leiste unten (Stand 1.9.0)

Stand 21.11.2026 · geprüft auf `origin/main` cd62ae6 (1.9.0, Build 151), Store-App (`app/www`, nachgeahmte Capacitor-Plugins, Android) bei 390×844 mit Playwright. **Kein App-Code geändert.** Aufbau und Maßstab wie `ux-ergebnis-mappe.md` (Branch `claude/b-ux-pruefung`).
Bilder: `docs/entwuerfe/ux-bilder-a/` (8 Stück). Rohfotos (≈ 70) und Skripte: `/home/claude/auda-bilder/`, `/home/claude/auda-skript/` (nicht im Repo).

## Kurzantwort

| Frage | Antwort | Kurz begründet |
|---|---|---|
| Ist der Weg Start → Check → Angaben prüfen übersichtlich? | **Weitgehend ja, aber nicht „extrem übersichtlich“** | Gut: wirklich eine Frage pro Seite, große Antwortknöpfe (64 px), Fokus springt auf die Frage, „Deine Angaben“ mit „ändern“ führt zurück auf die Prüfseite (wie GOV.UK). Schwächen: Über **jeder** Frage stehen 4 weitere Bedienelemente (Wegwahl, Kurzer Check, Angaben löschen), die Frage beginnt erst bei ~ 290–340 px. Kein Fortschritt („Frage 3 von …“) – der Kurze Check hat einen, der Hauptweg nicht. Mehrfachauswahl sieht aus wie Einfachauswahl. |
| Sind die Einstellungen klar? | **Ja, mit Ausnahmen** | Übersicht mit 5 gleichen Karten ist vorbildlich (Material/HIG-Listenmuster). Schwach: „Sicherheit und Daten“ (Lösch-Knöpfe sehen aus wie Navigationskarten, „Mehr dazu“ ohne Ziel), „Über die App“ (ein Aufklapper mit 1.868 Wörtern), Leiste unten verschwindet auf „Impressum, Datenschutz, Lizenzen“. |

## Ampel je Ansicht

| Ansicht | Ampel | Was gut ist | Was stört |
|---|---|---|---|
| Erststart-Hinweis | 🟡 | Kurz, ein Knopf „Verstanden“ | Schiebt die Hauptkarte nach unten; Datenschutz-Satz steht danach noch einmal unten auf der Startseite (Bild 01) |
| Startseite – Kopfzeile | 🟡 | Logo, Sprache sofort wählbar (Weltkugel, 48 px), Suche 44 px | 3 Einleitungen hintereinander: Untertitel „Prüfe in etwa 5 Minuten …“, „Schön, dass du da bist. Wir schauen gemeinsam …“, Kartenzeile „Etwa 5 Minuten · ohne Anmeldung“ (5 Minuten doppelt). Hauptkarte beginnt erst bei 354 px, mit Hinweis bei 556 px |
| Startseite – Kacheln | 🟡 | Klare Hauptkarte oben, 4 farbige Kacheln, Tippflächen 173×222–246 px, Kontrast ≥ 4,5:1 | Kacheln gleich hoch, Text unten → große Leerfläche (Pflege); Silbentrennung („Unterstützungsleis-tungen“, „Abrech-nung“, „Wider-spruch“); Untertitel mal Stichworte, mal ganzer Satz mit Punkt; nur 1,1 Kachelreihen im ersten Bildschirm |
| Suche | 🟡 | Sofort Fokus im Feld, Zurück oben links | Leere Seite ohne Vorschläge („Wohngeld“, „Brief vom Amt“ …) |
| Startwahl „Wie möchtest du …?“ | 🟡 | Zwei große Karten mit Symbol und Untertitel, „(empfohlen)“ | „Angaben löschen“ als erstes Element nach Zurück, obwohl noch nichts eingegeben ist; „Alles auf einer Seite“ hat grünen Rahmen (wirkt ausgewählt), obwohl „Schritt für Schritt“ empfohlen ist; dritte Karte (Kurzer Check) ohne Untertitel, mit Trennstrich „Be-hinderung“ |
| Frageseiten Schritt für Schritt | 🟡 | Eine Frage pro Seite, Frage als Überschrift mit Fokus, Antworten 64–111 px, Zähler mit 72-px-Knöpfen, „Warum fragt die App das?“ zugeklappt, „Weiß ich nicht“ als echte Antwort | Kopfbereich ~ 190 px mit Wegwahl-Chips, Link Kurzer Check, „Angaben löschen“ auf **jeder** Frage (Bild 02); Abschnittsname („Haushalt“) statt Fortschritt; auf Frage 1 steht „Haushalt“ in eigener Zeile, ab Frage 2 neben Zurück (springt); im Pfad A 32 Fragen ohne Anzeige, wie viele noch kommen |
| Mehrfachauswahl („Trifft etwas davon zu?“, „Was bekommt ihr schon?“) | 🔴 | „Nichts davon“ als eigene Antwort, `aria-pressed` gesetzt | Sieht aus wie Einfachauswahl (dieselben Knöpfe, die dort sofort weiterspringen); gewählt = nur dunklerer Rahmen, kein Haken; kein Hinweis „Mehrere möglich“; „Nichts davon“ steht **unter** „Weiter“ (Bild 03) |
| Hinweise/Fehler | 🟡 | Fehler direkt am Feld, verständlich („Bitte ein Jahr mit 4 Ziffern eintragen, zum Beispiel 1962.“), `role=status`, Ziffern-Tastatur | Gelber Kasten statt Fehlerfarbe/-symbol, Feld wird nicht `aria-invalid`/`aria-describedby`; Eingabefeld ohne Beispiel vor dem Fehler (Hinweis erst nach Fehlversuch); unplausible Werte (Geburtsjahr 1890, Warmmiete 4.500 €) laufen ohne Rückfrage durch |
| „Deine Angaben“ (Prüfseite) | 🟡 | GOV.UK-Muster: Frage – Antwort – „ändern“, Abschnitte (Haushalt, Gesundheit und Pflege, Wohnen, Geld …), „ändern“ führt nach „Weiter“ **zurück auf die Prüfseite** ✓ | 31 Zeilen, ~ 650 Wörter, 4.170–4.270 px = 5 Bildschirme; Antworten wie „0“ oder „Nein“ werden alle gelistet; Kopfbereich mit Wegwahl/Löschen auch hier; Knopf heißt „Ergebnis zeigen“, im Formular „Ergebnis ansehen“ (Bild 04) |
| Alles auf einer Seite | 🟡 | Abschnitte in Karten mit Überschrift, feste Leiste „Ergebnis ansehen“, Hilfen zugeklappt | 4.760 px (5,6 Bildschirme), 70 Felder; „1 Person“ und alle Auswahllisten sind vorbelegt („Nein“, „Weiß ich nicht“); Fachbegriffe für Laien („Mietenstufe deines Wohnorts“, „Bundesland“ zusätzlich zur PLZ); andere Schrift (Ziffer 0 mit Schrägstrich) als im Schritt-Weg; Überschrift „Deine Angaben“ = gleicher Name wie die Prüfseite; zwei feste Leisten unten (≈ 130 px) (Bild 05) |
| Kurzer Check (Behinderung) | 🟢 | Fortschrittsbalken „Frage 1“, Beispiel unter der Frage, ein Feld, „Weiter ➜“ | Weiter-Pfeil anders als im Hauptweg („Weiter“ ohne Pfeil); Rückweg „Zur ausführlichen Version“ als kleiner Knopf |
| Zurück-Navigation | 🟢 | Überall „← Zurück“ oben links (44 px), in ar gespiegelt oben rechts mit →; „Zurück“ geht genau eine Frage zurück, Antworten bleiben | Auf „Impressum, Datenschutz, Lizenzen“ verschwindet die Leiste unten (einzige Seite); Zurück-Stil im Schritt-Weg größer/fetter als im Formular und in Einstellungen |
| Einstellungen – Übersicht | 🟢 | 5 gleiche Karten (68 px) mit Symbol, Titel, aktuellem Wert („Deutsch“, „An“, „Version 1.9.0“), Pfeil › | – |
| Anzeige und Sprache | 🟢 | Sprache, Große Schrift, Einfache Sprache, „Wichtige Sätze auch auf Deutsch“, Farben als 3er-Segment; Schalter mit Text „An/Aus“; in ar ist Einfache Sprache ausgegraut mit Grund | Sprache steht doppelt (Startseite + hier), ok; Optionsfelder der Farben nur 13 px (Etikett ist aber ganze Fläche) |
| Erinnerungen | 🟢 | Ein Schalter, Text erklärt genau, was passiert | – |
| Sicherheit und Daten | 🟡 | Rückfrage beim Löschen direkt unter dem Knopf, „Behalten“ links / „Löschen“ rot, 10 s Rückgängig beim Vorgang (Bild 08) | Lösch-Knöpfe sehen aus wie die Navigationskarten (gleiche Karte, Symbol auf grünlichem Grund); Rückfrage wiederholt den Kartentext; „Mehr dazu“ sagt nicht, wozu; **drei Namen** fürs Löschen: „Angaben löschen“ (Check), „Nur den geöffneten Vorgang löschen“, „Alles auf diesem Gerät löschen“ – und die Datenschutzerklärung nennt „Alle Angaben löschen“ |
| Für Fachkräfte | 🟢 | Ein Schalter, Erklärung darunter | Erklärung steht unter dem Schalter statt in der Karte |
| Über die App / Lizenzen | 🟡 | Version und Regelstand oben, Haftungssatz | „So rechnet der Check …“ klappt **1.868 Wörter / 8,4 Bildschirme** in einem Stück auf; „Impressum, Datenschutz, Lizenzen“ als Textlink, Seite 3 Bildschirme ohne Sprungmarken, Leiste unten weg |
| Leiste unten | 🟢 | 3 Ziele (Start, Mein Ordner, Einstellungen) mit Symbol + Text, 126×56 px, aktiver Punkt markiert, `aria-current="page"`, in ar gespiegelt | Beschriftung 12,5 px (Material: 12 sp, ok); Suche ist nicht in der Leiste, sondern als Lupe je Seite; „Mein Ordner“ leer: „Weiteren Vorgang anlegen“ ohne Erklärung, was ein Vorgang ist |
| Arabisch (RTL) | 🟡 | Spiegelung, Zurück rechts mit →, Kacheln gespiegelt, Leiste gespiegelt | Übersetzungshinweis (`#transNotice`) liegt auf Frageseiten **unter der Lupe** (Text verdeckt) und schiebt alles um ~ 110 px nach unten (Bild 06) |
| Einfache Sprache | 🟡 | Startseite und Startwahl spürbar einfacher („Immer nur eine Frage. Das ist leichter.“) | Kopfbereich der Frageseiten unverändert (Wegwahl, Kurzer Check, Löschen); erste Frage wortgleich; nur Deutsch |
| Große Schrift | 🟡 | Texte wachsen, nichts abgeschnitten | Lupe rutscht unter die Sprachwahl links in eine eigene Zeile, Hauptknopf „Los geht's“ erst am Bildschirmrand (Bild 07) |

Nicht geprüft: Dunkelmodus (Umschalten im Skript nicht ausgelöst), Tablet-Breite, echte Geräte, Bildschirmleser.

## Messwerte (390×844)

| Ansicht | Höhe | Wörter | Bedienelemente | Erstes Inhalts-Element |
|---|---|---|---|---|
| Startseite | 1,5 Bildschirme (1.250 px) | ~ 70 | 8 + 3 Leiste | Hauptkarte bei 354 px (mit Erststart-Hinweis 556 px) |
| Startwahl | 1 | 40 | 5 | Überschrift bei 140 px |
| Frageseite (Schritt) | 1 (844–1.136 px) | 31–58 | 6–12 (davon 4 Kopf) | Frage bei 290–340 px |
| Pfad A (allein, 2 Kinder, Miete) | 32 Fragen + Prüfseite | – | – | – |
| „Deine Angaben“ | 5 Bildschirme | ~ 650 | 33 (31 × „ändern“) | – |
| Alles auf einer Seite | 5,6 Bildschirme | 485 | 76 (70 Felder) | erstes Feld bei 380 px |
| Einstellungen (Unterseiten) | 1 | 30–80 | 2–8 | Titel bei 85 px |
| Über die App, aufgeklappt | 8,4 Bildschirme | 1.868 | 3 | – |

- Tippflächen: alle Knöpfe ≥ 44 px (Zurück 71×44, Chips 44, Antworten 64–111, Zähler 72, Weiter 56, Leiste 56). Kleiner nur native Optionsfelder/Haken (13–24 px), deren Etikett aber die ganze Zeile ist (WCAG 2.5.8 erfüllt).
- Kontrast: keine Texte unter 4,5:1 gefunden (Start, Frageseite, Über). Kleinste Schrift: Leiste unten und App-Untertitel 12,5 px.
- Skriptfehler: 0 in allen Durchläufen.

## Abgleich mit Standards

| Muster (Quelle) | SoLo heute | Abweichung |
|---|---|---|
| **One thing per page** – eine Frage je Seite als Standard ([GOV.UK Question pages](https://design-system.service.gov.uk/patterns/question-pages), [Design Notes](https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/)) | Schritt-Weg: ja | Pro Seite zusätzlich 4 Bedienelemente, die mit der Frage nichts zu tun haben |
| **Question page = Zurück-Link oben, Überschrift, Weiter-Knopf** ([GOV.UK Question pages](https://design-system.service.gov.uk/patterns/question-pages), [NHS Question pages](https://service-manual.nhs.uk/design-system/patterns/question-pages), [Back link](https://design-system.service.gov.uk/components/back-link/)) | Zurück oben links ✓, Frage als h2 mit Fokus ✓, „Weiter“ ✓ | Wegwahl/Löschen gehören nicht auf die Frageseite; Antwortknöpfe springen ohne „Weiter“ (für Einfachauswahl üblich in Apps, aber dann muss die Mehrfachauswahl klar anders aussehen) |
| **Fortschritt optional, dann kurz „Frage 3 von 9“** ([GOV.UK Question pages](https://design-system.service.gov.uk/patterns/question-pages)) | Abschnittsname („Haushalt“, „Geld“); Kurzer Check hat Balken | Uneinheitlich. Da die Fragenzahl je nach Antworten schwankt: Abschnitt „Teil 2 von 5: Wohnen“ statt Fragezahl |
| **Hinweistext kurz, ohne Links; keine Sternchen** (GOV.UK) | Hinweise unter „Warum fragt die App das?“ zugeklappt ✓ | Beispiel („zum Beispiel 1962“) erscheint erst im Fehler; besser als Hinweis vorab |
| **Check answers: Frage – Antwort – Ändern; nach Ändern zurück zur Prüfseite; Abschnitte** ([GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers), [NHS](https://service-manual.nhs.uk/design-system/patterns/check-answers)) | Erfüllt ✓ | Sehr lang (5 Bildschirme); Abschnitte nicht zuklappbar; „ändern“ kleingeschrieben (versteckter Kontext für Bildschirmleser ist vorhanden ✓) |
| **Task list** ([GOV.UK Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks)) | Startseite = Kacheln, kein Status | Für die Startseite passt eher „Weiter, wo du warst“: eine Zeile „Dein Check: 18 von ~ 32 beantwortet – weitermachen“ |
| **Fehlermeldung** ([GOV.UK Error message](https://design-system.service.gov.uk/components/error-message/)) | Gelber Kasten, `role=status` | Fehlerfarbe + „Fehler:“-Präfix für Bildschirmleser, `aria-invalid` und `aria-describedby` am Feld |
| **Nielsen-Heuristiken** ([NN/g](https://www.nngroup.com/articles/ten-usability-heuristics/)): Systemstatus, Konsistenz, minimalistisches Design, Fehler vermeiden | Status ✓ (Wahl sichtbar), Fehler direkt am Feld | Kein Fortschritt (#1); „Ergebnis zeigen“/„Ergebnis ansehen“, „Deine Angaben“ für zwei Seiten, drei Lösch-Namen, zwei Schriften (#4); 3 Einleitungen auf Start, Kopfleiste je Frage (#8); Vorbelegungen im Formular (#5) |
| **WCAG 2.2 AA / BITV 2.0**: 2.5.8 Zielgröße ≥ 24 px ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)), 1.4.3 Kontrast, 1.4.4/1.4.10 Vergrößern ohne Verlust, 3.3.1 Fehler erkennen | Zielgröße ✓ (44 px sogar AAA-nah), Kontrast ✓, Fehlertext ✓ | 1.4.10/1.4.4: bei großer Schrift verrutscht die Lupe; ar: Hinweis überdeckt Bedienelement (1.4.10-Risiko); 3.3.1: Feld nicht als fehlerhaft markiert |
| **Apple HIG / Material 3 Navigation**: Tab-/Navigationsleiste 3–5 Ziele, immer sichtbar, Symbol + Text, 44 pt / 48 dp ([Apple HIG Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [Material 3 Navigation bar](https://m3.material.io/components/navigation-bar/overview)) | 3 Ziele, Symbol + Text, 56 px, aktiv markiert ✓ | Auf Impressum/Lizenzen ausgeblendet; Unterseiten der Einstellungen ✓ mit Zurück, aber Tippen auf aktiven Tab „Einstellungen“ in einer Unterseite sollte zur Übersicht führen (HIG) – prüfen |
| **NHS App / Service Manual: einfache Sprache, kurze Sätze, Wichtigstes zuerst** ([NHS Content style](https://service-manual.nhs.uk/content)) | Einfache Sprache ab Start ✓ | Frageseiten-Kopf und Prüfseite nicht vereinfacht; Fachbegriffe im Formular (Mietenstufe) |

## Verbesserungen als Aufgaben

Aufwand: S bis ½ Tag · M 1–2 Tage · L mehr. „Recht/Beträge“ = ändert Regeln, Grenzen oder Beträge.

| # | Aufgabe | Datei/Funktion | Was genau | Aufwand | Recht/Beträge |
|---|---|---|---|---|---|
| 1 | **Kopfleiste der Frageseiten leeren** | `src/schritte.js` `leiste()`, `leisteEinsetzen()` | Auf Frageseiten nur „← Zurück“ + Abschnitt. Wegwahl und Kurzer Check nur auf der Startwahl und auf „Deine Angaben“; „Angaben löschen“ nur auf der Prüfseite bzw. in Einstellungen. Frage rückt von ~ 300 px auf ~ 90 px | S | nein |
| 2 | **Fortschritt einheitlich** | `src/schritte.js` `kopf()` (`.sf-bereich`) | „Teil 2 von 5 · Wohnen“ (Abschnitte stehen fest) plus dünner Balken wie im Kurzen Check; „Haushalt“ auf Frage 1 in dieselbe Zeile wie Zurück | S | nein |
| 3 | **Mehrfachauswahl klar kennzeichnen** | `src/schritte.js` (Art `mehr`, `.es-btn`, `#sfNichts`), `src/template.html` CSS | Haken-Kästchen links in jedem Knopf, Zeile „Mehrere Antworten möglich“, gewählt = gefüllt + Haken; „Nichts davon“ als letzte Antwort **über** „Weiter“, mit Trennlinie „oder“ (GOV.UK „none“-Muster) | S | nein |
| 4 | **Gleiche Namen** | `src/lang/*.json` (`jump`, `sf.zumErgebnis`, `l.link`, Datenschutz-Text in Legal), `src/schritte.js` | Ein Name „Ergebnis zeigen“ (Formular + Prüfseite); Formular-Überschrift „Alle Fragen“ statt „Deine Angaben“; Löschen: „Angaben dieses Vorgangs löschen“ überall, Datenschutz-Text angleichen | S | nein |
| 5 | **Startseite straffen** | `src/template.html` (`#v-start`, `#firstNotice`), `src/lang/*.json` (`home.*`) | Eine Einleitung statt drei (Untertitel streichen oder „Schön, dass du da bist“-Absatz kürzen); „5 Minuten“ nur einmal; Erststart-Hinweis als schmale Zeile unter der Hauptkarte statt darüber; unteren Datenschutz-Satz entfernen, wenn Hinweis gezeigt; Kachel-Untertitel einheitlich als Stichworte, ohne Silbentrennung (`hyphens: manual` für `.sk-txt`), Text oben in der Kachel | S | nein |
| 6 | **Prüfseite kürzer** | `src/schritte.js` (Prüfseite, `anzeigeWert`) | Abschnitte als Karten mit Kopf „Haushalt – 2 Kinder, allein“ und „ändern“ je Abschnitt, Details zum Aufklappen; „0/Nein“-Antworten zu einer Zeile „Sonst nichts angegeben“ zusammenfassen; Ziel ≤ 2 Bildschirme | M | nein |
| 7 | **Formular „Alles auf einer Seite“ ohne Vorbelegung und ohne Fachbegriff** | `src/template.html` (`#adults1`, Auswahllisten, `mieteLab`, Mietenstufe/Bundesland), `src/app.js` | Keine vorgewählten Antworten (GOV.UK: nicht vorbelegen) bzw. Vorbelegung sichtbar als „noch offen“; „Mietenstufe“ und „Bundesland“ aus PLZ ableiten und nur unter „Mehr“ zeigen; gleiche Schrift wie im Schritt-Weg | M | **ja** (Mietenstufe-Ableitung berührt Wohngeld-Rechnung – von Fable prüfen lassen) |
| 8 | **ar: Übersetzungshinweis nicht über die Lupe** | `src/template.html` (`#transNotice`, `.su-lupe-knopf`), `src/app.js` Z. 660 | Hinweis nur auf Start und Ergebnis, zuklappbar „Übersetzt – Amtsbegriffe bleiben Deutsch ▸“, nie über festen Knöpfen; auch Große Schrift: Lupe neben der Sprachwahl halten (`flex-wrap: nowrap`) | S | nein |
| 9 | **Fehler und Plausibilität** | `src/schritte.js` (Art `zahl`), CSS `.fehler` | Beispiel als Hinweis vor dem Fehler; Fehler in Fehlerfarbe mit Symbol, `aria-invalid` + `aria-describedby`; weiche Rückfrage bei unplausiblen Werten („4.500 € Warmmiete – stimmt das?“), ohne zu blockieren | S–M | nein (Grenzen nur als Hinweis) |
| 10 | **Einstellungen: Löschen und Über** | `src/template.html` (`#clear2`, `#vgAlle`, Über-Seite, `#legal`), `src/app.js` (Leiste auf Legal) | Lösch-Knöpfe als rote Textknöpfe/Rahmen statt Navigationskarte, Rückfrage ohne Wiederholung des Kartentextes; „Mehr dazu“ → „Was schützt die PIN?“; „So rechnet der Check“ als eigene Unterseite mit Liste je Leistung (zuklappbar); Leiste unten auch auf Impressum/Lizenzen | S–M | nein |
| 11 | **Startwahl entrümpeln** | `src/schritte.js` `renderWahl()`, `leiste()` | „Angaben löschen“ erst zeigen, wenn Angaben da sind; Rahmen-Hervorhebung auf die empfohlene Karte; Kurzer Check mit Untertitel („12 Fragen, für eine Person“) | S | nein |
| 12 | **Suche mit Vorschlägen; „Mein Ordner“ leer erklären** | `src/suche.js`, `src/vorgaenge.js` | Unter dem leeren Suchfeld 5 häufige Begriffe; leerer Ordner: 1 Satz „Hier liegen deine gespeicherten Checks und Briefe“ + Knopf „Neuen Check anlegen“ | S | nein |

**Top 8 nach Wirkung/Aufwand:** 1, 3, 2, 4, 5, 8, 6, 9.

## Vorher / Nachher

### Frageseite (Aufgaben 1–3)
```
VORHER (bis Frage ~ 300 px)            NACHHER (Frage ~ 90 px)
← Zurück   Haushalt          [🔍]      ← Zurück                 [🔍]
[Schritt für Schritt][Alles auf …]     Teil 1 von 5 · Haushalt  ▬▬▭▭▭
Kurzer Check für Menschen mit …        Trifft etwas davon zu?
                 Angaben löschen       Mehrere Antworten möglich
Trifft etwas davon zu?                 [☑ Ein Kind ist 12 oder älter   ]
[ Ein Kind ist 12 …      ]             [☐ Ein Kind ist krank …         ]
[ Ein Kind ist krank …   ]             [☐ Anderer Elternteil zahlt …   ]
[ Anderer Elternteil …   ]             ──────── oder ────────
[ Weiter ]                             [☐ Nichts davon                 ]
[ Nichts davon ]                       [ Weiter ]
```

### Startseite (Aufgabe 5)
```
VORHER                                  NACHHER
SoLo / Sozialleistungslotse             SoLo            [Deutsch ▾] [🔍]
Prüfe in etwa 5 Minuten, … (3 Zeilen)   Welche Hilfen stehen dir zu?
[🌐 Deutsch ▾]  [🔍]                    [ Etwa 5 Minuten · ohne Anmeldung
(Hinweis-Kasten, 190 px)                  Los geht's → ]
Schön, dass du da bist. Wir schauen …   Erste Orientierung, keine Rechtsberatung. Mehr ▸
[ Welche Hilfen … 5 Minuten … ]         [Pflege] [Brief bekommen]
[Pflege (leer)] [Brief …]               [Geld/Schulden] [Ich ziehe aus]
```

### Prüfseite (Aufgabe 6)
```
VORHER  31 Zeilen Frage/Antwort/ändern, 5 Bildschirme
NACHHER Haushalt ............ allein, 2 Kinder (1 unter 6)   ändern ▸
        Gesundheit, Pflege .. nichts angegeben                ändern ▸
        Wohnen .............. Miete 750 € warm, 91054 Buckenhof ändern ▸
        Geld ................ kein Einkommen, Erspartes 500 €  ändern ▸
        [ Ergebnis zeigen ]
```

## Bilder

| Datei | Zeigt |
|---|---|
| ux-bilder-a/01-start-erststart.png | Startseite beim ersten Öffnen: 3 Einleitungen, Hinweis schiebt Hauptkarte nach unten |
| ux-bilder-a/02-frage-kopfleiste.png | Frage 1: 4 Bedienelemente vor der Frage, „Haushalt“ statt Fortschritt |
| ux-bilder-a/03-mehrfachauswahl.png | Mehrfachauswahl sieht aus wie Einfachauswahl, „Nichts davon“ unter „Weiter“ |
| ux-bilder-a/04-deine-angaben-pruefen.png | Prüfseite „Deine Angaben“ (Anfang von 5 Bildschirmen) |
| ux-bilder-a/05-alles-auf-einer-seite.png | Formular: „1 Person“ vorbelegt, feste Leiste „Ergebnis ansehen“ über der Leiste unten |
| ux-bilder-a/06-ar-hinweis-ueber-suche.png | Arabisch: Übersetzungshinweis unter der Lupe |
| ux-bilder-a/07-grosse-schrift-start.png | Große Schrift: Lupe rutscht in eigene Zeile |
| ux-bilder-a/08-sicherheit-loeschen.png | Löschen-Rückfrage, Lösch-Knöpfe im Navigationskarten-Stil |

## Grenzen
- Ein Pfad im Schritt-Weg vollständig durchgespielt (allein, 2 Kinder, Miete, kein Einkommen; 32 Fragen); andere Verzweigungen nur stichprobenhaft (Fehler, Zurück, „ändern“).
- Kein Dunkelmodus, keine Tablet-Breite, keine echten Geräte, kein Bildschirmleser-Test.
- Aufgabe 7 berührt die Wohngeld-Rechnung (Mietenstufe) – vor Umsetzung fachlich von Fable prüfen lassen.
