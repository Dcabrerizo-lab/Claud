# UX-Audit Bereich B: „Ich habe einen Brief bekommen“ und „Mein Ordner“ (Stand 1.9.0)

Stand 21.11.2026 · geprüft auf `origin/main` cd62ae6 (1.9.0, Build 151), Store-App (`app/www`, nachgeahmte Capacitor-Plugins inkl. Kamera und Texterkennung, Android) bei 390×844 mit Playwright. **Kein App-Code geändert.**
Testdaten: Musterbriefe `test/erweiterungen/muster/*.txt` (Jobcenter Nürnberg, Wohngeld Frankfurt, Nebenkosten Verbraucherzentrale, Pflege-Formular), Kostensenkungs-Brief aus `test/erweiterungen/test-kostensenkung.js`, eingebauter Beispiel-Bescheid, eigene Inkasso-Mahnung.
Bilder: `docs/entwuerfe/ux-bilder-b/` (8 Stück). Rohfotos und Messskripte: `/home/claude/audb/` (nicht im Repo). Maßstab und Aufbau wie `ux-ergebnis-mappe.md` (Branch `claude/b-ux-pruefung`).

## Kurzurteil

| Frage | Antwort | Kurz begründet |
|---|---|---|
| Findet ein Laie mit wenig Deutsch den richtigen Einstieg? | **Ja, weitgehend** | Startkachel „Ich habe einen Brief bekommen“ ist klar, danach **eine** Frage „Von wem ist der Brief?“ mit 7 großen Kacheln (1,2 Bildschirme). Schwach: Jobcenter und Wohngeldstelle haben dasselbe Haus-Symbol, Familienkasse ist negativ beschrieben („Nur … nicht Kindergeld“). |
| Ist „Brief prüfen“ übersichtlich (eine Sache pro Bildschirm)? | **Nein** | Nach dem Scan landet alles auf **einer** langen Seite: Jobcenter 5,6 Bildschirme / 48 Bedienelemente, Vermieter 4,9 / 44, Pflegegutachten **19,2 / 114** (2.888 Wörter). Der größte Knopf nach dem Scan ist „Weitere Seite scannen“, das Ergebnis steht 4 Bildschirme tiefer. |
| Ist das Ergebnis (Nachrechnen/Vergleich) verständlich? | **Ja, gut** | Eine große Zeile „Vermutlich 163,12 € im Monat zu wenig“, je Abweichung eine ruhige Karte mit Abzeichen, „Im Bescheid / Nach SoLo“, Paragraf, darunter „Passt: …“ und „Nicht geprüft: …“ (Bild 05). |
| Funktioniert „Frist merken“ und „Mein Ordner“? | **Teilweise** | Fristenliste klar (Datum groß, „noch 12 Tage“, Erledigt/Datum ändern/Entfernen). Aber: Bestätigung erscheint unter dem Knopf außerhalb des Blicks, der Knopf ändert sich nicht, zwei Namen für dieselbe Aktion, abgelaufene Fristen werden nicht als abgelaufen gezeigt, leerer Ordner erklärt nichts. |
| Arabisch (RTL)? | **Rot beim Ergebnis** | Kacheln, Formular und Spiegelung gut. Das **Ergebnis der Nachrechnung und der Widerspruch-Teil bleiben deutsch** und werden ohne `lang="de" dir="ltr"` rechtsbündig gesetzt: „Abs. 3 SGB II 21 §“, „€ 202,68“, Punkt am Satzanfang (Bild 07). |

## Ampel je Ansicht

| Ansicht | Ampel | Was gut ist | Was stört |
|---|---|---|---|
| Start → Kachel „Ich habe einen Brief bekommen“ | 🟢 Grün | Klar benannt, Untertitel nennt Bescheid/Abrechnung/Gutachten/Widerspruch | Kachel steht erst unter dem großen Leistungs-Check, auf 390×844 nur halb sichtbar (Bild aus Start) |
| „Von wem ist der Brief?“ (7 Kacheln) | 🟢 Grün | Eine Frage, 1,2 Bildschirme, 12 Bedienelemente, Karten ≥ 150 px hoch, Zurück oben links | Gleiches Symbol für Jobcenter und Wohngeldstelle; „Familienkasse – Nur Bescheid über Kinderzuschlag, nicht Kindergeld“ (Verneinung, schwer für wenig Deutsch); Silbentrennung „Gutach-ten“, „Nebenkostenabrech-nung“ (Bild 01) |
| Kachel Jobcenter (vor dem Scan) | 🟡 Gelb | Briefart als Auswahl mit Erklärung in Klammern, Datum → sofort „Widerspruch bis …“ | Zwei Überschriften („Brief von: Jobcenter“ + „Bescheid Grundsicherungsgeld prüfen“); Text sagt „Scanne den Bescheid“, aber zuerst kommen Briefart (4 Optionen) und Datum, der Scan-Knopf liegt am unteren Rand (Bild 02); 4 gleichrangige Wege (Scannen, PDF, Text, Werte selbst) |
| Kacheln Sozialamt / Wohngeld / Familienkasse | 🟢 Grün | Kurz (1,2–1,3 Bildschirme, 7–8 Bedienelemente) | Gleiche Schwächen wie Jobcenter, aber ohne Briefart-Auswahl (uneinheitlich: Termin/Anhörung nur beim Jobcenter wählbar) |
| Kachel Pflegekasse | 🔴 Rot (nach Scan) | Vor dem Scan 1 Bildschirm | Nach dem Einlesen **19 Bildschirme, 114 Bedienelemente**, 48 Bewertungen als Auswahllisten untereinander; Hinweis „0 von 48 Bewertungen erkannt“ |
| Kachel Vermieter (Nebenkosten) | 🟡 Gelb | Erkennt 6 Werte, gelb markiert | 4,9 Bildschirme; Fachbegriffe (CO₂ je m², „nach Fläche“, Gesamtfläche); Frage „Bekommst du Leistungen für die Miete?“ erst ganz unten |
| Anderer Brief oder Formular | 🟡 Gelb | Einlesen erkennt Art selbst, „Oder selbst wählen“ als Ausweg; Mahnung: Frist mit Zitat aus dem Brief, Inkasso-Hinweis „Zahle nicht sofort“, kostenlose Hilfe | Unterseite „Antragsformular ausfüllen“ nutzt Emoji-Symbole 📷📄📋 und „Formular fotografieren“ statt „Diesen Brief scannen“; Start-Kachel öffnet danach wieder die zuletzt offene Unterseite statt der Absender-Auswahl |
| Nach dem Scan (Rückmeldung) | 🔴 Rot | Erkannte Werte gelb, Hinweis „Schwer zu lesen. Bitte genau prüfen.“ | Größter Knopf ist „Weitere Seite scannen“ (Bild 03); Meldung „Erkannt: … 11 Werte“ als grauer Fließtext ohne Banner; „Werte stimmen“ steht **über** den Werten (Bild 04); Personen werden nicht gelesen → „Bitte zuerst die Personen eintragen“ erscheint nur unten im Ergebnis-Kasten |
| Bescheid nachrechnen / Vergleich | 🟢 Grün | Eine Kernaussage groß, Karten je Abweichung, Tabelle „Alle Posten im Vergleich“ zugeklappt, „Nicht geprüft“ offen genannt (Bild 05) | Beträge in Eingabefeldern mit Punkt („1644.92“, „24.92“) – auf Gerät prüfen; Einfache Sprache ändert das Ergebnis fast nicht (164 → 170 Wörter, „Erwerbstätigenfreibetrag“ bleibt) |
| Widerspruch | 🟡 Gelb | Felder vorausgefüllt (Jobcenter, BG-Nummer), Text sichtbar und kopierbar, „So geht es weiter“ mit Einwurf-Einschreiben | Formular steht schon vor dem Ergebnis da; ohne Namen entsteht ein Text mit „[Name, Anschrift]“ ohne Hinweis; „Frist merken“ zum zweiten Mal; **Frist 13.03.2023 (längst vorbei) wird normal angezeigt** und Widerspruch trotzdem angeboten (Bild 06); 4 Knöpfe am Ende (Kopieren, Als PDF teilen, Drucken, PDF speichern) |
| Kostensenkung / Mietgrenze | 🟡 Gelb | Sehr gute Einordnung zuerst („noch keine Kürzung“), Zahlenzeile „690 € · Grenze 540 € · Unterschied 150 €“, Frist mit Zitat, klarer Satz „kein Widerspruch möglich“ | 401 Wörter (Einfache Sprache 368), 4 offene Absätze „Was du jetzt tun kannst“ + 5 Aufklapper; Knopf heißt „Frist in ‚Mein Ordner‘ übernehmen“ statt „Frist merken“ |
| „Frist merken“ (Aufforderung Unterlagen) | 🟡 Gelb | Erklärt Folgen („kann die Leistung versagen“), Frist groß im roten Kasten | Bestätigung „In ‚Mein Ordner‘ gemerkt … Rückgängig“ erscheint unterhalb des sichtbaren Bereichs; Knopf bleibt „Frist merken“ (kein Zustand „Gemerkt ✓“) |
| Mein Ordner (leer) | 🟡 Gelb | Ruhig, 5 Bedienelemente | Erster Knopf „**Weiteren** Vorgang anlegen“, obwohl keiner sichtbar ist; kein Satz, wofür der Ordner da ist; Fristen-Karte fehlt ganz, solange keine Frist da ist (Funktion unsichtbar); Überschrift „Gespeicherte Vorgänge“ nur für Screenreader (Bild 08) |
| Mein Ordner → Fristen | 🟢 Grün | Karte „Nächste: … (noch 12 Tage)“, Liste mit großem Datum, „So wurde gerechnet“ zugeklappt | Abzeichen „Fest“/„Gerechnet“ ohne Erklärung; „Erledigt“ und „Entfernen“ gleich gewichtet nebeneinander; je Frist fast ½ Bildschirm |
| PIN / Sicherheit | 🟢 Grün | Weg über Link im Ordner und Einstellungen, klare Lösch-Texte („Weg sind: …“) | Link als unterstrichener Fließtext (48 px, ok), PIN standardmäßig aus – kein Hinweis beim ersten gespeicherten Brief |
| Arabisch (RTL) | 🔴 Rot | Spiegelung, Zurück rechts oben, Amtsbegriffe deutsch in Klammern | Ergebnis, Abweichungs-Karten und Widerspruch-Teil deutsch, Bidi-Fehler (Bild 07); zusätzlicher deutscher Hinweiskasten vor jeder Überschrift schiebt den Inhalt nach unten |
| Einfache Sprache | 🟡 Gelb | Kostensenkung deutlich einfacher („Das Amt sagt: Deine Wohnung kostet zu viel“) | Kachel-Texte und Nachrechnungs-Ergebnis fast unverändert |

## Messwerte (390×844, ab Kopf der Ansicht)

| Ansicht | Bildschirme | Wörter | Bedienelemente | Ziele < 44 px |
|---|---|---|---|---|
| Absender-Kacheln | 1,2 | 63 | 12 | 0 |
| Jobcenter vor Scan | 1,6 | 93 | 12 | Radios 22 px, aber Zeile ≥ 44 px ✓ |
| Jobcenter nach Scan (Muster Nürnberg) | 5,6 | 302 | 48 | Haken „schwanger“ 22×22 ohne große Zeile |
| Jobcenter „Werte selbst eingeben“ | 6,7 | 347 | 59 | – |
| Jobcenter Beispiel + Ergebnis + Widerspruch | 7,0 | – | – | 0 |
| Kostensenkung | 4,5 | 512 (Erklärung 401) | 22 | 0 |
| Vermieter nach Scan | 4,9 | 226 | 44 | 0 |
| Pflegegutachten nach Scan | 19,2 | 2.888 | 114 | 0 |
| Anderer Brief (Inkasso) | 3,0 | 264 | 8 | 0 |
| Mein Ordner leer / mit Frist | 1,0 / 1,0 | 16 / 28 | 5 / 6 | 0 |

Weitere Befunde:
- Kontrast: kein Text unter 5:1 gefunden (automatisch gemessen, Jobcenter-Ergebnis und Ordner). ✓
- Tippflächen: alle Knöpfe, „Wo steht das?“ und Aufklapper ≥ 44 px. ✓
- Konsistenz Zurück: überall oben links (in ar oben rechts). ✓ Kartenform einheitlich. ✓
- Skriptfehler: 0 in allen Durchläufen.

## Vergleich mit Standards

| Standard | Was er verlangt | SoLo heute | Abstand |
|---|---|---|---|
| GOV.UK „Question pages“ / One thing per page ([Muster](https://design-system.service.gov.uk/patterns/question-pages), [Blog](https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/)) | Pro Seite eine Frage oder Aufgabe, dann „Weiter“ | Absender-Auswahl ✓; danach Briefart + Datum + 4 Einlesewege + Werte + Personen + Ergebnis + Widerspruch auf einer Seite | groß |
| GOV.UK „Check answers“ / „Complete multiple tasks“ ([Task list](https://design-system.service.gov.uk/patterns/complete-multiple-tasks), [NHS](https://service-manual.nhs.uk/design-system/components/task-list)) | Erst prüfen, dann bestätigen; Liste der Aufgaben mit Status | „Werte stimmen“ steht vor den Werten; kein Überblick „1 Werte prüfen · 2 Ergebnis · 3 Widerspruch“ | mittel |
| GOV.UK Error summary / Notification banner ([Error summary](https://design-system.service.gov.uk/components/error-summary), [Notification banner](https://design-system.service.gov.uk/components/notification-banner)) | Fehler oben gesammelt mit Sprunglink; Erfolg als Banner oben („Frist gespeichert“) | „Bitte zuerst die Personen eintragen“ unten im Ergebniskasten; „Erkannt: …“ grauer Fließtext; „Frist gemerkt“ unter dem Knopf außer Sicht | mittel |
| NHS Service Standard „einfach zu bedienen“ ([Punkt 4](https://service-manual.nhs.uk/service-standard/4-make-the-service-simple-to-use)) | Nutzer schaffen die Aufgabe beim ersten Mal ohne Hilfe | Ergebnis gut verständlich; Weg dorthin nach Scan unklar (Personen fehlen) | mittel |
| Nielsen-Heuristiken ([NN/g](https://www.nngroup.com/articles/ten-Usability-heuristics/)) | Sichtbarer Systemstatus, Konsistenz, Fehler vermeiden, minimalistisch | Status nach „Frist merken“ unsichtbar; zwei Namen „Frist merken“/„Frist übernehmen“, „Scannen“/„Fotografieren“; abgelaufene Frist ohne Warnung; Pflege 19 Bildschirme | mittel |
| WCAG 2.2 AA / BITV 2.0 ([2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [GOV.UK zu WCAG 2.2](https://design-system.service.gov.uk/accessibility/WCAG-2.2)) | 24 px Mindestziel (AA), Kontrast 4,5:1, 3.1.2 Sprache von Teilen | Ziele ≥ 44 px ✓, Kontrast ✓; **3.1.2 verletzt**: deutsches Ergebnis in ar ohne `lang="de"` (Screenreader liest deutsch mit arabischer Stimme, Bidi falsch) | klein, aber ein klarer Verstoß |
| Apple HIG 44 pt / Material 3 48 dp ([Übersicht](https://smashingmagazine.com/2024/07/getting-bottom-minimum-wcag-conformant-interactive-element-size/)) | Tippziele 44 pt / 48 dp, eine Hauptaktion je Bildschirm | 44–52 px ✓; nach dem Scan zwei Hauptknöpfe (Weitere Seite scannen, Werte stimmen), am Ende 4 Ausgabe-Knöpfe | klein |

## Vorschläge als Aufgaben

Aufwand: S bis ½ Tag · M 1–2 Tage · L mehr. „Recht/Beträge“: ja = Text oder Rechnung mit rechtlicher Aussage, vor Umsetzung von Fable prüfen lassen.

| # | Datei / Funktion | Was | Wirkung | Aufwand | Recht/Beträge |
|---|---|---|---|---|---|
| 1 | `erweiterungen/vorschau.js` (Ergebnis Z. 549/595, Abweichungskarten, Widerspruch-Teil), `src/lang/*.json` | Ergebnis der Nachrechnung über `tA()` übersetzen; wo deutsch bleibt (Paragraf, Postenname), Element mit `lang="de" dir="ltr"` bzw. `<bdi>` setzen | hoch (RTL, WCAG 3.1.2) | M | nein (nur Übersetzung, Beträge bleiben) |
| 2 | `erweiterungen/vorschau.js` `fristText()` / Datumsteil Z. 925–960; `src/fristen.js` `briefKnopf()` | Liegt „Widerspruch bis …“ in der Vergangenheit: roter Hinweis „Frist ist vorbei“ statt normaler Frist, kein „Frist merken“, statt Widerspruch Hinweis auf Überprüfungsantrag | hoch | S | **ja** (§ 44 SGB X, Wortlaut) |
| 3 | `src/app.js` `elFertig()` / `elPlatz()`, `el.mehr` (Z. 4163) | Nach erfolgreichem Scan: oben ein Banner „Erkannt: Bescheid vom Jobcenter. 11 Werte eingetragen“ mit Knopf „Werte ansehen“ (springt hin); „Weitere Seite scannen“ als zweitrangiger Knopf (umrandet) | hoch | S | nein |
| 4 | `erweiterungen/vorschau.js` Z. 32–54 (`erkFertig`, `-erk-ok`) | „Werte stimmen“ **unter** die erkannten Werte setzen; fehlende Pflichtangaben (Personen) oben als Fehlerliste mit Sprunglinks zeigen (GOV.UK Error summary) | hoch | M | nein |
| 5 | `erweiterungen/vorschau.js` (Aufbau Prüfseite), `src/app.js` `briefFormular()` | Prüfseite in 3 Schritte teilen: ① Werte prüfen ② Ergebnis ③ Widerspruch (nur bei Abweichung zu deinen Lasten anbieten, sonst zugeklappt) – eine Sache pro Bildschirm | hoch | L | nein |
| 6 | `erweiterungen/pflege.js` / Pflegegutachten-Ansicht | 48 Bewertungen nach den 6 Bereichen als Aufgabenliste („Bereich 1: Sich bewegen – 3 von 5 eingetragen ›“), je Bereich eigene Seite | hoch | L | nein |
| 7 | `src/lang/de.json` `el.ks.frist.btn`; Formular-Unterseite (`#scan`, `src/template.html`) | Gleiche Namen: überall „Frist merken“, überall „Diesen Brief scannen“ (bzw. „Formular scannen“), SVG-Symbole statt Emoji | mittel | S | nein |
| 8 | `src/fristen.js` `knopf()`/`briefKnopf()` | Nach dem Tippen: Knopf wird „Gemerkt ✓“ (deaktiviert) mit „Rückgängig“ daneben, Meldung per `aria-live` direkt am Knopf | mittel | S | nein |
| 9 | `src/app.js` Ordner-Aufbau (Z. 3677 ff.), `src/lang/de.json` `vg.*` | Leerer Ordner: 1 Satz „Hier landen deine Vorgänge und Fristen. Tipp: Bei ‚Brief prüfen‘ auf ‚Frist merken‘ tippen.“; Knopf „Vorgang anlegen“ ohne „Weiteren“, solange es nur einen gibt; Fristen-Karte immer zeigen („Noch keine Fristen“) | mittel | S | nein |
| 10 | `src/template.html` `#briefKacheln`, `src/lang/de.json` Kachel-Untertitel | Eigenes Symbol für Wohngeldstelle (z. B. Schlüssel/Euro-Haus); Familienkasse positiv: „Kinderzuschlag“ (Kindergeld-Hinweis erst nach dem Tippen); `hyphens: manual` in Kachel-Untertiteln | mittel | S | nein |
| 11 | `src/app.js` `briefOeffnen()` / Start-Kachel `#goBriefe` | Start-Kachel öffnet immer die Absender-Auswahl, nicht die zuletzt offene Unterseite | mittel | S | nein |
| 12 | `src/app.js` Kachel-Kopf (`briefOeffnen`) | Eine Überschrift: „Bescheid vom Jobcenter prüfen“; Reihenfolge: Scannen zuerst (1 großer Knopf), PDF/Text/Selbst eingeben unter „Andere Wege ▸“; Briefart und Datum nach dem Scan (Datum wird ohnehin erkannt) | mittel | M | nein |
| 13 | `erweiterungen/vorschau.js` Widerspruch | Ohne Namen/Anschrift nicht „[Name, Anschrift]“ einsetzen, sondern Hinweis am Feld; Ausgabe: 1 Hauptknopf „Als PDF teilen“, Rest unter „Weitere Möglichkeiten“; zweites „Frist merken“ entfernen, wenn oben schon gemerkt | mittel | S | nein |
| 14 | `erweiterungen/kostensenkung.js` `zeige()` | „Was du jetzt tun kannst“: 4 Punkte als Aufklapper mit Überschrift (Gründe nennen, Bemühungen belegen, Beratung, Nicht einfach umziehen); Knopf „Antwort an das Amt entwerfen“ nach oben unter die Zahlenzeile | mittel | S | nein (Texte bleiben) |
| 15 | `src/fristen.js` Fristenkarte | Abzeichen erklären („Fest = steht im Brief“, „Gerechnet = von SoLo berechnet“) oder als Satz; „Entfernen“ als Textlink rechts, „Erledigt“ als Hauptknopf | gering | S | nein |
| 16 | `src/lang/einfach/brief/*` | Einfache Sprache auch für Kachel-Untertitel, Prüfseiten-Kopf und Ergebnis-Erklärungen (z. B. „Freibetrag für Arbeit“ statt „Erwerbstätigenfreibetrag“) | gering–mittel | M | **ja** (Erklärtexte zu Beträgen) |

## Vorher / Nachher (Kern)

### Nach dem Scan
```
VORHER                                     NACHHER
Brief von: Jobcenter                       ┌ ✓ Erkannt: Bescheid vom Jobcenter ──────┐
Bescheid Grundsicherungsgeld prüfen        │ 11 Werte eingetragen, 2 fehlen noch.    │
Briefart (4) · Datum · Widerspruch bis …   │ [Werte prüfen]                          │
[Frist merken]                             └─────────────────────────────────────────┘
[■ Weitere Seite scannen]  [PDF] [Text]    Widerspruch bis 22.12.2026  [Frist merken]
Erkannt: … 11 Werte … (grau)               (Weitere Seite scannen – kleiner Link)
… 2 Aufklapper · [Werte stimmen] · Werte … 
… Ergebnis: „Bitte zuerst die Personen …“  Schritt 1/3 Werte prüfen → [Weiter]
```

### Abgelaufene Frist
```
VORHER  Widerspruch bis 13.03.2023  [Frist merken] … [Widerspruch erstellen]
NACHHER ⚠ Die Frist für den Widerspruch ist am 13.03.2023 abgelaufen.
        Ist der Bescheid falsch, kannst du trotzdem eine Überprüfung beantragen. [Mehr dazu]
        (Wortlaut und Weg von Fable prüfen lassen)
```

### Mein Ordner leer
```
VORHER  [+ Weiteren Vorgang anlegen] · PIN-Sperre … · Von der Beratung bekommen
NACHHER Mein Ordner
        Hier siehst du deine Fristen und gespeicherten Angaben. Alles bleibt auf dem Gerät.
        ⏰ Fristen – noch keine. Tipp: Bei „Brief prüfen“ auf „Frist merken“ tippen.
        [+ Vorgang anlegen]   PIN-Sperre ›   Von der Beratung bekommen ›
```

## Bilder

| Datei | Zeigt |
|---|---|
| 01-absender-kacheln.png | „Von wem ist der Brief?“ – gleiches Symbol Jobcenter/Wohngeld, Silbentrennung |
| 02-jobcenter-erster-bildschirm.png | Zwei Überschriften, Briefart und Datum vor dem Scan-Knopf |
| 03-nach-scan-weitere-seite-oben.png | Nach dem Scan: „Weitere Seite scannen“ als Hauptknopf, „Erkannt“ als Grautext |
| 04-werte-stimmen-vor-den-werten.png | „Werte stimmen“ über den Werten, leere Personen-Felder |
| 05-ergebnis-vergleich.png | Gutes Ergebnis: 163,12 € zu wenig, Karten je Abweichung |
| 06-widerspruch-alte-frist.png | Widerspruch zu Bescheid von 2023, Frist 13.03.2023 ohne Warnung, zweites „Frist merken“ |
| 07-arabisch-ergebnis-deutsch.png | Arabisch: Ergebnis deutsch, Bidi-Fehler („Abs. 3 SGB II 21 §“) |
| 08-ordner-leer.png | Leerer Ordner: „Weiteren Vorgang anlegen“, keine Erklärung, keine Fristen-Karte |

## Grenzen
- Kamera und Texterkennung nachgeahmt (OCR liefert den Mustertext fehlerfrei); echte Fotos liefern mehr „schwer lesbar“-Fälle.
- Datumsfelder zeigen in Headless-Chromium „mm/dd/yyyy“, Zahlenfelder Punkt statt Komma – auf echtem Android/iOS mit Deutsch prüfen, bevor daraus eine Aufgabe wird.
- Kein Dunkelmodus, keine Tablet-Breite, kein Screenreader-Durchlauf (nur Attribute geprüft).
- Rechtliche Aussagen (abgelaufene Frist, Überprüfungsantrag, Einfache-Sprache-Texte zu Beträgen) nur als Vorschlag – vor Umsetzung von Fable prüfen lassen.
