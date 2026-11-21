# UX-Prüfung: Ergebnisanzeige und Antragsmappe (Stand 1.9.0)

Stand 21.11.2026 · geprüft auf `origin/main` cd62ae6 (1.9.0, Build 151), Store-App (`app/www`, nachgeahmte Capacitor-Plugins, Android) bei 390×844 mit Playwright. Kein App-Code geändert.
Bilder: `docs/entwuerfe/ux-bilder/` (12 Stück). Alle Rohfotos und Messwerte: `/home/claude/uxp-bilder/` (nicht im Repo).

## Davids zwei Fragen

| Frage | Antwort | Kurz begründet |
|---|---|---|
| Ist die Mappe mit Anträgen und Links jetzt schön angeordnet und intuitiv? | **Teilweise, eher nein** | Besser als vorher: Empfänger steht direkt im Brief, Suchlink ist dezent und passend, Formulare haben große grüne Knöpfe, oben stehen 4 nummerierte Schritte. Aber: Die Mappe ist weiter **9 Bildschirme** lang (alle Leistungen angehakt: 12–18), oben steht „PDF teilen“ vor den leeren Feldern, die 4 Schritte sind nur ein **Inhaltsverzeichnis mit Sprungknöpfen**, der Inhalt folgt darunter in anderer Reihenfolge. Die amtlichen Formulare kommen erst nach den Briefen (etwa Bildschirm 6), die Unterlagen stehen je Leistung mit Doppelungen, und die Leistungen mit dem meisten Geld (Wohngeld, Grundsicherung, Kinderzuschlag) sind **nicht angehakt**. |
| Ist die Ergebnisanzeige schön angeordnet, maximal nutzerfreundlich und intuitiv? | **Weitgehend ja, aber nicht maximal** | Gut: ruhige, gleiche Karten, Betrag und Stelle in der Kopfzeile, Details zum Aufklappen, „Nächste Schritte/Unterlagen“ sind raus, ein grüner Hauptknopf nach den Karten, Tipps zugeklappt darunter, nur 2,2–2,9 Bildschirme. Schwächen: Das **Entweder-oder** ist unsichtbar (Familie sieht Wohngeld, Kinderzuschlag und Grundsicherungsgeld alle als „Wahrscheinlich“ mit Betrag; der Hinweis „Zwei Wege“ steht zugeklappt unter allem). Erster Knopf ist „Ergebnis mitgeben / drucken“ statt der Hauptaktion. Die aufgeklappte Karte bringt bis zu 170 Wörter Allgemeines, aber keinen Knopf „Antrag vorbereiten“. |

## Ampel je Bereich

| Bereich | Ampel | Was gut ist | Was stört |
|---|---|---|---|
| Ergebnisliste | 🟡 Gelb | Klare Karten, Status-Abzeichen, 7–10 passende Hilfen, Rest unter „Wahrscheinlich nicht passend“ | Entweder-oder nicht sichtbar; Nebenknopf „Ergebnis mitgeben“ als erstes Bedienelement; kein Satz „Am meisten bringt dir …“; Kindergeld steht oben ohne Betrag |
| Karte (aufgeklappt) | 🟡 Gelb | Ganze Kopfzeile tippbar (≥ 119 px), zuständige Stelle mit Anschrift, Hinweis auf Mappe | 100–170 Wörter; zuerst allgemeine Regeln und Sonderfälle (z. B. Familiengeld für vor 2025 Geborene), dann das Persönliche; keine Aktion je Karte; Silbentrennung in Titeln („Grundsiche-rungsgeld“, „Wohnberechti-gungsschein“) |
| Übergang Ergebnis → Mappe | 🟡 Gelb | Ein grüner Knopf direkt unter den Karten | Knopf heißt „Briefe für die Anträge machen“, Seite heißt „Deine Antragsmappe“ (zwei Namen); Vorauswahl lässt Geld-Leistungen weg; Text „siehe Tipp oben“ verweist auf die vorige Seite |
| Mappe-Aufbau | 🔴 Rot | Nummerierte Schritte, „Erledigt“-Haken, eine Seite für alles | 9 Bildschirme; Reihenfolge: PDF teilen → 5 Felder → 8 Haken → Inhaltsverzeichnis → Briefe → Formulare → Angabenblatt → Unterlagen → Drucken. Schritt 1 beginnt erst bei Bildschirm 2, Inhalte erst bei Bildschirm 3 |
| Empfänger und Suchlink | 🟢 Grün | Anschrift steht im Brief, klein „Empfänger ändern“; ohne bekannte Anschrift gestricheltes Feld mit Suchlink „Zuständige Stelle und Anschrift im Internet suchen“ (Bild 09); nie ein unsicherer Empfänger | Hinweistext unter dem Suchlink 4 Zeilen lang (1 Satz reicht) |
| Amtliche Formular-Links | 🟡 Gelb | Großer grüner Knopf „Amtliches Formular öffnen“ je Formular, Name des Vordrucks, „Was gehört in das Formular?“ aufklappbar (Bild 10) | Stehen hinter allen Anschreiben (Fall A bei Pixel 4.400 von 7.600); Formular-Leistungen (Kindergeld, Wohngeld, KiZ) sind gerade die wichtigsten; Hinweistext unter dem Knopf in ar deutsch |
| Unterlagen | 🔴 Rot | Abhaken möglich, Tipp je Leistung | Je Leistung eine eigene Liste: Fall A 29 Punkte, Fall B 27 Punkte; Doppelungen: „Personalausweis oder Reisepass“ bis 4×, „Bescheid über den Pflegegrad“ 3×, „Nachweise über Einkommen und Vermögen“ 3×, „Geburtsurkunde“ 2×; dazu fast gleiche Punkte („Mietvertrag oder Mietbescheinigung“ / „Mietvertrag und Nebenkostenabrechnung“). Kein Abstand zwischen Tipp und nächster Leistungs-Überschrift (Bild 11) |
| Drucken / Teilen | 🟡 Gelb | Ein Hauptknopf, Rest unter „Weitere Möglichkeiten“ | Drei Knöpfe: oben „PDF teilen“ (vor der Eingabe), in Schritt 4 „Drucken“ (Mitte), unten „Drucken“ – zwei Namen für dieselbe Aktion |

## Messwerte (390×844)

| Fall | Ergebnis (ab Überschrift) | Karten passend | Mappe (Vorauswahl) | Mappe (alles angehakt) | Bedienelemente Mappe | Unterlagen-Punkte / exakte Doppelungen |
|---|---|---|---|---|---|---|
| A Alleinerziehend, 2 Kinder, Teilzeit 1.250 € netto, Miete 850 € (Erlangen) | 2,4 Bildschirme, 156 Wörter | 8 | 9,0 Bildschirme, 761 Wörter | 13,7 Bildschirme, 1.207 Wörter | 48 / 72 | 29 / 2 |
| B Rentnerin allein, Rente 880 €, Pflegegrad 2, Miete 520 € (Eckental) | 2,9 | 10 | 8,6 | 17,7 (1.618 Wörter) | 45 / 72 | 27 / 6 |
| C Paar, 3 Kinder, ein Einkommen 2.150 €, Miete 1.150 € (Nürnberg) | 2,2 | 7 | 7,4 | 12,0 | 43 / 66 | 25 / 1 |

Weitere Befunde:
- Tippflächen: alle Knöpfe ≥ 44 px, Kartenkopf ganz tippbar, Haken-Zeilen 44–90 px hoch. ✓ Kontraste der Knöpfe (Weiß auf Petrol, Petrol auf Creme) gut. ✓
- Vorauswahl der Mappe: A angehakt Kindergeld, Bildung und Teilhabe, Unterhaltsvorschuss, Wohnberechtigungsschein; **nicht** Wohngeld (350–470 €), Kinderzuschlag, Grundsicherungsgeld. B angehakt Landespflegegeld, Verhinderungspflege, WBS; **nicht** Wohngeld (270–310 €) und Grundsicherung im Alter (Bild 06). Grund laut Text: Entweder-oder. Für Laien heißt das: Das Wichtigste fehlt, wenn sie nichts anhaken.
- Einfache Sprache: Texte wirken, Umfang bleibt fast gleich (Karte 170 → 180 Wörter, Mappe 9,0 → 9,2 Bildschirme).
- Arabisch (RTL): Spiegelung, Zurück-Pfeil, Abzeichen und Haken korrekt; Amtsbegriffe deutsch mit arabischer Erklärung (gut, Bild 04). Hinweise unter den Formular-Knöpfen bleiben deutsch.
- Skriptfehler: 0 in allen 5 Durchläufen.

## Vergleich mit bewährten Mustern

| Muster | Quelle | Was SoLo daraus übernehmen sollte |
|---|---|---|
| Aufgabenliste („Complete multiple tasks“) | [GOV.UK Design System](https://design-system.service.gov.uk/patterns/complete-multiple-tasks), [NHS Service Manual](https://service-manual.nhs.uk/design-system/components/task-list) | Aufgaben mit Verb benennen, wenige Status („Erledigt“/„Offen“), Liste **ist** die Navigation: Jede Zeile öffnet ihre Aufgabe, nicht ein Inhaltsverzeichnis über einem langen Dokument. Wenn sich Schritte zusammenlegen lassen, braucht man weniger Aufgaben. |
| Schritt-für-Schritt-Navigation | [GOV.UK Step by step](https://design-system.service.gov.uk/patterns/step-by-step-navigation) | Nummerierte Schritte mit „und/oder“-Kennzeichnung – passt genau auf Entweder-oder-Wege (Wohngeld **oder** Grundsicherung). |
| Leistungsrechner mit Ergebnis | [GOV.UK Check benefits](https://www.gov.uk/check-benefits-financial-support), [Citizens Advice](https://www.citizensadvice.org.uk/benefits/benefits-introduction/what-benefits-can-i-get/benefit-checker/) | Ergebnis nach Wichtigkeit, je Leistung ein klarer Link „So beantragst du …“ direkt an der Leistung. |
| Progressive Disclosure / Akkordeons | [NN/g](https://www.nngroup.com/articles/accordions-on-desktop/) | Auf dem Handy sind Aufklapper gut, wenn die Überschrift allein reicht, um zu entscheiden. SoLo macht das in der Liste richtig, in der Mappe fehlt es (alles offen untereinander). |
| Mehrsprachige Kommunal-App | [Integreat](https://integreat-app.de/en) | Kurze Seiten, eine Aufgabe pro Seite, PDF-Ausgabe getrennt vom Bildschirm. |
| Nielsen-Heuristiken | Konsistenz, Erkennen statt Erinnern, minimalistisches Design | Ein Name für eine Aktion („Drucken“ vs. „PDF teilen“, „Briefe für die Anträge“ vs. „Antragsmappe“); keine Verweise auf „oben“, wenn es auf der vorigen Seite steht; nichts zeigen, was jetzt nicht dran ist. |

## Die 10 wichtigsten Verbesserungen (nach Wirkung/Aufwand)

Aufwand: S bis ½ Tag · M 1–2 Tage · L mehr

| # | Verbesserung | Wirkung | Aufwand |
|---|---|---|---|
| 1 | **Drucken/Teilen nur noch am Ende**, ein Name („Drucken oder als PDF teilen“). Oben weg, in Schritt 4 als Ziel des Ablaufs | hoch | S |
| 2 | **Entweder-oder sichtbar machen**: im Ergebnis oben die Wege gegenüberstellen; in der Mappe als Wahl („Welchen Weg möchtest du?“) statt leerer Haken. Fachlich von Fable prüfen lassen | hoch | M |
| 3 | **Vorauswahl**: Leistungen mit Geldbetrag zuerst und angehakt (je gewähltem Weg), WBS/Rundfunk/Zuzahlung danach; Satz „siehe Tipp oben“ ersetzen | hoch | S |
| 4 | **Mappe = Aufgabenliste**: Die 4 Schritt-Karten enthalten ihren Inhalt selbst (aufklappbar), statt auf Abschnitte weiter unten zu springen. Inhalt erscheint nur einmal | hoch | M |
| 5 | **Formulare vor Briefe**: Pro Leistung eine Zeile mit genau einer Aktion – „Amtliches Formular öffnen“ **oder** „Anschreiben ansehen“ | hoch | S–M |
| 6 | **Eine Unterlagen-Liste ohne Doppelungen**: „Für alle Anträge“ (Ausweis, Kontoauszüge, Mietvertrag, Einkommen) + „Zusätzlich für …“, Abstand zwischen Blöcken | hoch | M |
| 7 | **Absender kompakt**: Name/Anschrift als ein Feld-Block „Dein Absender“ im ersten Brief (wie der Empfänger) oder zugeklappt mit Status „fehlt noch“; Telefon unter „mehr“ | mittel | S |
| 8 | **Ergebnis oben**: 1 Satz „Am meisten bringt dir: Wohngeld und Kinderzuschlag, zusammen etwa … €“; „Ergebnis mitgeben / drucken“ unter den grünen Hauptknopf | mittel | S |
| 9 | **Karte aufgeklappt**: zuerst „Warum für dich“ (1–2 Sätze, Betrag), dann Knopf „Antrag vorbereiten“ (öffnet Mappe mit dieser Leistung); Allgemeines und Sonderfälle in „Mehr dazu“ | mittel | S–M |
| 10 | **Feinschliff**: keine Silbentrennung in Kartentiteln, Kindergeld-Betrag in die Kopfzeile, Hauptknopf und Seitentitel gleich benennen („Antragsmappe öffnen“), Formular-Hinweise in ar/übrige Sprachen übersetzen, Suchlink-Hinweis auf 1 Satz | gering–mittel | S |

## Vorher / Nachher

### 1 Drucken ans Ende
```
VORHER                              NACHHER
Deine Antragsmappe                  Deine Antragsmappe
[PDF teilen]   ← vor leeren Feldern 1 Absender ......... fehlt noch ›
Weitere Möglichkeiten ▸             2 Anträge (3) ........ offen ›
Name … Telefon (5 Felder)           3 Unterlagen (12) .... offen ›
…  Schritt 4 [Drucken]  (Mitte)     4 Abschicken
…  [Drucken]  (ganz unten)            [Drucken oder als PDF teilen]
```

### 2 Entweder-oder im Ergebnis
```
VORHER                              NACHHER
Kindergeld        Wahrscheinlich    Für euch gibt es zwei Wege:
Wohngeld 530–730 €  Wahrscheinl.    ┌ Weg A (meist besser)            ┐
Kinderzuschlag 870 € Wahrscheinl.   │ Wohngeld + Kinderzuschlag ≈ 1.400–1.600 €│
Grundsicherungsgeld 750 € Wahrsch.  └─────────────────────────────────┘
…                                   ┌ Weg B                           ┐
(ganz unten, zu)                    │ Grundsicherungsgeld ≈ 750 €     │
▸ Zwei Wege: …                      └─────────────────────────────────┘
                                    Dazu in jedem Fall: Kindergeld, BuT …
```
(Beträge hier aus Fall C; welcher Weg „meist besser“ ist, muss die Regel entscheiden oder offen bleiben – Fable prüfen.)

### 3 Vorauswahl
```
VORHER  ☑ Landespflegegeld ☑ Verhinderungspflege ☑ WBS
        ☐ Wohngeld ☐ Grundsicherung im Alter …  „siehe Tipp oben“
NACHHER Welchen Weg möchtest du?  ◉ Wohngeld (270–310 €)  ○ Grundsicherung im Alter (≈ 200 €)  ○ Beides prüfen lassen
        ☑ Landespflegegeld  ☑ Verhinderungspflege   ▸ Weitere (WBS, Rundfunk, Zuzahlung)
```

### 4 Mappe als Aufgabenliste
```
VORHER  Schritt-Karten 1–4 mit [Zum Anschreiben] [Zu den Formularen] [Zur Unterlagenliste]
        → springen in ein 6-Bildschirm-Dokument darunter
NACHHER ① Anträge  ▾   (aufgeklappt zeigt die Zeilen aus #5)
        ② Unterlagen ▾ (Liste aus #6)
        ③ Abschicken ▾ (Frist-Satz, [Drucken oder als PDF teilen])
        Die Druckansicht (Briefe, Angabenblatt) entsteht erst beim Drucken bzw. hinter „Brief ansehen“.
```

### 5 Formulare vor Briefe
```
VORHER  Brief BuT (1,5 Bildschirme) · Brief UVS (1,5) · dann „Amtliche Formulare“: Kindergeld, WBS
NACHHER Kindergeld ....... [Amtliches Formular öffnen]  online mit BundID möglich
        Wohngeld ......... [Amtliches Formular öffnen]
        Bildung u. Teilh.  [Anschreiben ansehen]  an: Landratsamt ERH ✓
        Unterhaltsvorsch.  [Anschreiben ansehen]  an: Jugendamt ✓
```

### 6 Unterlagen
```
VORHER  Kindergeld: Steuer-ID, Geburtsurkunde, …
        Unterhaltsvorschuss: Geburtsurkunde, …     (Ausweis bis 4×)
NACHHER Für alle Anträge:  ☐ Personalausweis oder Pass  ☐ Kontoauszüge 3 Monate  ☐ Mietvertrag  ☐ Lohnabrechnungen
        Zusätzlich für Kindergeld: ☐ Steuer-ID von dir und den Kindern
        Zusätzlich für Unterhaltsvorschuss: ☐ Angaben zum anderen Elternteil
```

### 7 Absender
```
VORHER  Einleitung + „Was ist ein formloser Antrag?“ + 5 Felder untereinander (≈ 1 Bildschirm)
NACHHER Im ersten Brief an der Stelle des Absenders: gestricheltes Feld „Deinen Namen und deine Anschrift eintragen“
        (wie beim Empfänger), gilt für alle Briefe. Telefon und Geburtsdatum unter „mehr“.
```

### 8 Ergebnis oben
```
VORHER  Gute Nachrichten! · 6 wahrscheinlich · 2 möglich · Für dich kommen 8 Hilfen in Frage · Stand … · [Ergebnis mitgeben / drucken]
NACHHER Gute Nachrichten! Am meisten bringt dir: Wohngeld und Kinderzuschlag (etwa … € im Monat).
        Karten …  [Antragsmappe öffnen]  [Ergebnis mitgeben / drucken]
```

### 9 Karte aufgeklappt
```
VORHER  Für jedes Kind 259 € … · Kinder bis 21 arbeitslos … · Nur in Bayern: Familiengeld … · Hinweis · Stelle · Quelle
NACHHER Für deine 2 Kinder etwa 518 € im Monat.  [Antrag vorbereiten]
        Stelle: Familienkasse Bayern Nord, 90316 Nürnberg
        ▸ Mehr dazu (Ausnahmen, Bayern, Quelle)
```

### 10 Feinschliff
Titel ohne Trennstrich (`hyphens: manual`), gleiche Namen für gleiche Aktionen, Abstand vor jeder Leistungs-Überschrift in Unterlagen, Formular-Hinweise übersetzen.

## Bilder

| Datei | Zeigt |
|---|---|
| 01-ergebnis-oben-paar.png | Fall C: Wohngeld, Kinderzuschlag, Grundsicherungsgeld alle „Wahrscheinlich“ |
| 02-ergebnis-ende-knopf-tipps.png | Hauptknopf nach den Karten, „Zwei Wege“ zugeklappt darunter |
| 03-karte-aufgeklappt.png | Kindergeld-Karte offen (170 Wörter, ohne Aktion) |
| 04-ergebnis-arabisch.png | Ergebnis in Arabisch (RTL) |
| 05-mappe-oben.png | „PDF teilen“ vor den leeren Feldern |
| 06-mappe-vorauswahl-rentnerin.png | Fall B: Wohngeld und Grundsicherung nicht angehakt |
| 07-mappe-schritte.png | Schritte 1–4 als Sprungknöpfe |
| 08-mappe-drucken-mitte-brief.png | „Drucken“ in Schritt 4, darunter Brief mit Empfänger |
| 09-empfaenger-suchlink.png | Unbekannte Anschrift: Feld mit Suchlink |
| 10-amtliche-formulare.png | Formular-Knöpfe |
| 11-unterlagen.png | Unterlagen je Leistung, ohne Abstand |
| 12-mappe-gesamt-9-bildschirme.png | Ganze Mappe Fall A verkleinert mit Abschnitten |

## Grenzen
- Ergebnis über „Alles auf einer Seite“ erreicht (gleiche Ergebnisanzeige wie Schritt für Schritt). Nicht auf echten Geräten, kein Dunkelmodus, keine Tablet-Breite.
- Fachliche Fragen (welcher Weg vorbelegt wird) nur als Vorschlag – vor Umsetzung von Fable prüfen lassen.
