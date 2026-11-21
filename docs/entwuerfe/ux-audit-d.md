# UX-Audit Bereich D: Pflege, „Ich ziehe aus“, Beratungsmodus, Weitergabe, Suche (Stand 1.9.0)

Stand 21.11.2026 · geprüft auf `origin/main` cd62ae6 (1.9.0, Build 151). Store-App (`app/www`, nachgeahmte Capacitor-Plugins, Android), Playwright bei 390×844, jede Ansicht fotografiert und angesehen. **Kein App-Code geändert.**
Aufbau und Maßstab wie `docs/entwuerfe/ux-ergebnis-mappe.md` (Branch `claude/b-ux-pruefung`). Bilder: `docs/entwuerfe/ux-bilder-d/` (8 Stück). Rohfotos und Skripte: `/home/claude/uxd-bilder/`, `/home/claude/uxd-skript/` (nicht im Repo).

## Kurzurteil

| Frage | Antwort | Kurz begründet |
|---|---|---|
| Ist der Pflege-Bereich übersichtlich und intuitiv? | **Weitgehend ja (Deutsch), in Arabisch nein** | Sehr gut: Pflege-Start mit nur 2 Kacheln, Pflegegrad als 6 große Knöpfe, Einschätzung **eine Frage pro Bildschirm** (wie GOV.UK), Ergebnis groß „Wahrscheinlich Pflegegrad 4“ mit 3 Kacheln. Schwächen: Die Einschätzung bleibt in allen Sprachen **deutsch und wird in ar rechtsbündig mit verdrehten Satzzeichen gezeigt** („?allein drehen und aufsetzen“), „← Zurück“ dort deutsch mit falscher Pfeilrichtung. „Gutachten vergleichen“ führt in ein **19-Bildschirme-Formular mit 114 Bedienelementen**, das Alter wird nicht übernommen, die eigene Einschätzung steht erst ganz unten. |
| Sind „Ich ziehe aus“, Beratungsmodus, Weitergabe und Suche klar? | **Teilweise** | „Ich ziehe aus“: klare Kacheln und Abhak-Listen, aber Versicherungen dreifach und Paragrafen im Laientext. Beratungsmodus: „Für Klient zusammenstellen“ ist **7 Bildschirme** lang, zwei verschiedene „Teilen“, und der grüne Hauptknopf „QR-Code zeigen“ **scheitert in der Vorauswahl** („Zu groß für einen QR-Code“). PIN-Import funktioniert, Fehlermeldung aber grau und weit weg vom Feld. Suche: schnell und fehlertolerant, aber „Pflegegeld“ führt nicht zur Pflege-Übersicht mit 599 €, sondern zum Leistungs-Check (Wahl des Wegs). |

## Ampel je Ansicht

| Ansicht | Ampel | Was gut ist | Was stört |
|---|---|---|---|
| Pflege-Start (Auswahl) | 🟢 Grün | 1 Bildschirm, 2 Kacheln, klare Frage „Was möchtest du wissen?“, Zurück oben links | Silbentrennung im Kacheltitel („Unter-stützung“); „Gutachten vergleichen“ fehlt hier als dritter Weg (nur über Ergebnis oder Briefe → Pflegekasse) |
| Pflegegrad wählen | 🟢 Grün | 6 Knöpfe 174×64 px, Hinweis „Er steht im Bescheid“ | – |
| Unterstützung bei PG 3 (Bild 01) | 🟡 Gelb | Betrag groß mit Einheit-Abzeichen, klare Trennung „Geld aufs Konto“ / „Budget“, Weiteres zugeklappt, 2,4 Bildschirme | 5× gleicher Aufklapper „Mehr dazu“ (für Screenreader nicht unterscheidbar). Pflegegeld und Pflegedienst stehen gleichrangig untereinander, das **Entweder-oder/Kombination** steht erst in „Weitere Leistungen (9)“ (Ergebnis der Einschätzung sagt dagegen „Oder ein Pflegedienst“). Pflicht-Beratungsbesuch (sonst Kürzung des Pflegegelds) nur in „Mehr dazu“. Großer grüner Knopf „Pflegegrad selbst einschätzen“, obwohl die Person schon PG 3 hat (in der Einschätzung heißt derselbe Weg „Höherstufung prüfen“). „Rechtsgrundlage: § 37 SGB XI“ auch ohne Beratungsmodus |
| Ohne Pflegegrad | 🟢 Grün | 1,3 Bildschirme, ehrlicher Satz „Geld gibt es erst mit Pflegegrad“, 2 Hilfen | „Wie bekomme ich einen Pflegegrad?“ nur als Aufklapper; kein Knopf „Pflegegrad beantragen“ |
| Einschätzung: Fragen | 🟢 Grün (de) / 🔴 Rot (ar) | Eine Frage pro Bildschirm, 4 Antwortknöpfe 358×64 px, „Frage 1 von 5 · Bereich 1 von 6“, Fortschrittsbalken, „Weiß ich nicht“, „Später weitermachen“ mit Speichern; Hinweis „Zählt: …“ unter der Frage | **45 Bildschirme** im Fall „82 Jahre, mittlere Einschränkung“ (Vergleich Verbraucherzentrale: 6 Module, Unterbrechen nach jedem Modul). Bereich 5 als Liste mit 16 Haken = 1,9 Bildschirme. ar: siehe RTL |
| Einschätzung: Ergebnis (Bild 02) | 🟢 Grün | 1,5 Bildschirme, Ergebnis als Überschrift, „Entscheiden tut die Pflegekasse“, 3 Leistungen mit Betrag, 3 Kacheln in sinnvoller Reihenfolge (Antrag → Gutachten → Was steht mir zu?), Punkte und Termin-Tipp zugeklappt | Kacheln ungleich hoch (2 nebeneinander, 1 breit); Titel der Kacheln fest deutsch im Code; Silbentrennung („Gut-achten“, „Medi-zinischen“) |
| Gutachten vergleichen (Bild 04) | 🔴 Rot | Scannen/PDF/Einfügen zuerst, Datenschutz-Satz, Zurück führt korrekt zum Ergebnis der Einschätzung | „Werte selbst eingeben“ öffnet **ein Formular mit 19 Bildschirmen, 2.870 Wörtern, 114 Bedienelementen** (64 Auswahllisten untereinander). Alter (82) aus der Einschätzung **nicht übernommen**; „Deine Einschätzung: Pflegegrad 4“ steht erst am Ende. „Alles leeren“ als großer Knopf ganz oben. Fachbegriffe der Gutachten-Skala („überwiegend unselbständig“) richtig, aber neben den Laienwörtern doppelt |
| „Ich ziehe aus“ – Übersicht | 🟢 Grün | 6 gleich gebaute Kacheln, Fortschritt „0 von 9 erledigt“ | Kachelhöhen ungleich (210/179/156 px) |
| „Ich ziehe aus“ – Checklisten (Bild 05) | 🟡 Gelb | Abhaken, je Punkt „Mehr dazu“, „Weitere Punkte“ zugeklappt, Notizen | Kästchen selbst 26×26 px (Zeile ist größer und tippbar, ok nach WCAG 2.5.8, aber unter 44 px Eigenmaß der App); Abstand zwischen Titel und „Mehr dazu“ groß → Karte wirkt leer |
| „Ich ziehe aus“ – Geld / Versicherungen / Finger weg / Hilfen | 🟡 Gelb | Kurze Überschriften, „Unbedingt / Sehr sinnvoll / Kommt drauf an / Meist unnötig“ (sehr gut) | **Versicherungen 3×** (eigene Kachel, „Dein Geld im Griff“, „Finger weg!“) plus „Privathaftpflicht klären“ in „Die ersten Tage“. Paragrafen im Fließtext für Jugendliche (§ 31 ZKG, § 556 BGB, § 504a BGB, § 20 Abs. 2 WoGG). „Geld und Hilfen“ 3,3 Bildschirme, 411 Wörter, überschneidet sich mit dem Leistungs-Check |
| Beratungsmodus einschalten | 🟢 Grün | Ein Schalter, ehrliche Beschreibung | Name „Für Fachkräfte“ (Einstellung) / „Beratungsmodus“ (Schalter) / „Fach-Ansicht“ (intern) – drei Namen. Beschreibung verspricht „ausgeschaltet ohne Paragrafen“ – in Pflege und „Ich ziehe aus“ stehen sie trotzdem |
| Ergebnis im Beratungsmodus | 🟡 Gelb | Rechtsgrundlage je Karte als eigene Zeile, sonst gleiche Karten | Ergebnisseite 10 Bildschirme (Formular davor); offene Karte 187 Wörter; zwei Nebenknöpfe nacheinander („Ergebnis mitgeben / drucken“, „Für Klient zusammenstellen“) mit ähnlicher Wirkung |
| Für Klient zusammenstellen (Bild 06) | 🔴 Rot | Alles vorangehakt, Sprache des Klienten wählbar, Datenschutz-Hinweis, Vorschau des Blatts darunter | **7 Bildschirme, 31 Bedienelemente, 18 Haken.** Zwei Wege untereinander ohne Trennung: „Drucken / Teilen“ (Blatt) und darunter „QR-Code zeigen / Als SoLo-Datei teilen“ (App). Mit der Vorauswahl meldet „QR-Code zeigen“ **erst nach dem Tippen** „Zu groß für einen QR-Code“. Unterlagen-Liste je Leistung mit Doppelungen (Ausweis 3×) wie in der Mappe |
| Weitergabe: PIN und QR | 🟡 Gelb | PIN groß angezeigt („951 443“), Hinweis „mündlich sagen“, „Wie sicher ist das?“ zugeklappt, QR mit Anleitung für den Klienten darunter | „Andere PIN“ als Textlink; QR-Code dicht (viel Inhalt) – auf älteren Handys schwer zu scannen |
| Import mit PIN (Bild 07) | 🟡 Gelb | Unter „Mein Ordner“ zugeklappt, klarer Satz „deine anderen Angaben bleiben“, PIN-Feld mit Ziffern-Tastatur, Vorschau „Das bekommst du“ vor dem Speichern, „Nichts wird überschrieben“ | Falsche PIN: Meldung **grau, über dem Erklärsatz, nicht am Feld**; Feld wird geleert. PIN als Passwortfeld (Punkte) – ältere Menschen sehen nicht, was sie getippt haben. Drei gleich breite Knöpfe (Öffnen / Abbrechen) untereinander |
| Suche (Bild 08) | 🟡 Gelb | Lupe auf jeder Seite oben rechts, Vollbild-Suche, Tippfehler („pflegstufe“) und alte Wörter („Hartz 4“) werden gefunden, Treffer mit Bereich, „Nichts gefunden“ mit Ausweg-Knopf, Zurück öffnet wieder die Treffer | „Pflegegeld“ findet nicht „Welche Unterstützung gibt es?“ (Suchwörter von `p-hilfe` ohne „Pflegegeld“); erster Treffer führt nur zur Weg-Wahl des Leistungs-Checks. „Gutachten“ → Treffer heißt nur „Pflegekasse“. „QR“ / „PIN“ / „Beratung bekommen“ finden den Import nicht. Leeren-Knopf × 40×40 px |

## Messwerte (390×844)

| Ansicht | Bildschirme | Wörter | Bedienelemente | Kleinste Tippfläche |
|---|---|---|---|---|
| Pflege-Start | 1,0 | 50 | 4 | 44 (Lupe, Zurück) |
| Unterstützung PG 3 (zu / „Weitere“ offen) | 2,4 / 5,6 | 235 / 560 | 21 | 44 |
| Einschätzung je Frage | 1,0 | 54–90 | 5–8 | 48 |
| Einschätzung bis Ergebnis (82 J.) | 45 Fragen | – | – | – |
| Einschätzung Ergebnis | 1,5 | 123 | 8 | 44 |
| Gutachten „Werte selbst eingeben“ | **19,0** | **2.870** | **114** | 22 (Haken) |
| Ich ziehe aus – Übersicht / Checkliste / Hilfen | 1,1 / 1,9 / 3,3 | 88 / 105 / 411 | 8 / 25 / 8 | 26 (Kästchen) |
| Ergebnis im Beratungsmodus (Seite) | 10,1 | 875 | 148 | 20 (Links „Quelle“) |
| Für Klient zusammenstellen | **7,0** | 665 | 31 | 24 (Haken) |
| Mein Ordner mit Import (PIN) | 1,2 | 84 | 9 | 48 |
| Suche mit Treffern | 1,0 | 30 | 4–9 | 40 (×) |

Weitere Befunde:
- Kontraste: Fließtext 13,8 : 1, Grautext 6,8 : 1, Aufklapper (Petrol auf Creme) 6,2 : 1, Abzeichen „pro Monat“ 6,9 : 1, „pro Jahr“ 5,7 : 1 – alle ≥ 4,5 : 1 ✓.
- Tippflächen: alle Knöpfe ≥ 44 px außer × in der Suche (40 px) und den Kästchen/Haken (22–26 px, aber Zeile tippbar, damit WCAG 2.5.8 ✓).
- Skriptfehler: 0 in allen 12 Durchläufen.
- **RTL (ar, Bild 03):** Pflege-Start übersetzt und gespiegelt („رجوع →“) ✓. Ab „Unterstützung“ und in der ganzen Einschätzung nur Deutsch, aber `dir=rtl`: Satzzeichen springen an den Anfang („.Pflegekasse“, „?allein drehen“), Beträge kippen („€ 599“), Aufklapp-Pfeile ▸ zeigen nach rechts. In der Einschätzung „← Zurück“ deutsch und rechts mit Pfeil nach links. Der Hinweis „nur auf Deutsch“ steht doppelt (arabischer Kasten + deutscher Satz) und schiebt oben unter die Lupe.
- Einfache Sprache: Pflege-Texte bereits einfach; Umfang gleich (PG 3: 235 → 238 Wörter; Frage 90 → 94).

## Vergleich mit bewährten Standards

| Standard | Quelle | Was dort gilt | SoLo heute | Abstand |
|---|---|---|---|---|
| Eine Sache pro Seite | [GOV.UK Question pages](https://design-system.service.gov.uk/patterns/question-pages), [One thing per page](https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/) | Je Seite eine Frage, Zurück-Link oben links | Einschätzung ✓; Gutachten-Formular ✗ (64 Fragen auf einer Seite); Klient-Blatt ✗ | groß beim Gutachten |
| Fehlermeldung am Feld | [GOV.UK Error message](https://design-system.service.gov.uk/components/error-message), [NHS Error message](https://service-manual.nhs.uk/design-system/components/error-message) | Rot, direkt über dem Feld, sagt was zu tun ist | PIN falsch: grau, über dem Erklärsatz | mittel |
| Ratgeber für Pflege/Betreuung | [NHS Social care and support guide](https://www.nhs.uk/conditions/social-care-and-support-guide/help-from-social-services-and-charities/getting-a-needs-assessment/) | Kurze Abschnitte, Du-Form, Beratung/Begleitung früh genannt, nächstes Kapitel am Ende | Pflege-Übersicht ähnlich ✓; Beratung als Zeile unten ✓; Pflicht-Beratungsbesuch versteckt | klein |
| Pflegegradrechner | [Verbraucherzentrale](https://www.verbraucherzentrale.de/pflegegradrechner), [vzhh](https://www.vzhh.de/themen/gesundheit-patientenschutz/betreuung-pflege/pflegegrad-online-selbst-berechnen), Vergleich [pflege.de](https://www.pflege.de/pflegekasse-pflegerecht/pflegegrade/) | 6 Module, Unterbrechen nach jedem Modul; zwei Modi: Selbsteinschätzung **oder** Vergleich mit Gutachten (gleiche Fragen), Entwurf für den Widerspruch | Einschätzung gleichwertig (offline, mehr Erklärung); Vergleich aber als **anderes, langes Formular** statt derselben geführten Fragen | groß beim Vergleich |
| Eindeutige Link-Texte | [NN/g „Learn more“ links](https://nngroup.com/articles/learn-more-links), [NN/g Better link labels](https://nngroup.com/articles/better-link-labels/) | Kein generisches „Mehr“/„Learn more“; Ziel im Text nennen | 5–9× „Mehr dazu“ je Seite | klein (S) |
| Nielsen-Heuristiken | Konsistenz, Fehler vermeiden, Minimalismus | Ein Name pro Sache; Fehler verhindern statt melden | Drei Namen für Beratungsmodus; QR-Knopf scheitert erst nach Tippen; „Versicherungen“ 3× | mittel |
| Barrierefreiheit | [WCAG 2.2 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), BITV 2.0 | Mind. 24×24 px oder genug Abstand; Kontrast ≥ 4,5 : 1; Sprache von Textteilen auszeichnen (3.1.2) | Ziele ✓, Kontrast ✓; **deutscher Text in ar ohne `lang="de" dir="ltr"`** ✗ (3.1.2 Sprache von Teilen) | mittel |
| Plattform-Maß | Material 3 (48 dp), Apple HIG (44 pt), [Übersicht](https://govtnz.github.io/web-a11y-guidance/ka/accessible-ux-best-practices/mobile-apps/mobile-app-a11y-by-feature-type/touch-and-pointer-target-sizing.html) | 44–48 px Tippfläche | ✓ außer × (40 px) | klein |

## Vorschläge als Aufgaben

Aufwand: S bis ½ Tag · M 1–2 Tage · L mehr. „Recht/Beträge“ = berührt Rechtsinhalt oder Beträge (dann vorher von Fable prüfen lassen).

| # | Datei / Funktion | Was | Wirkung | Aufwand | Recht/Beträge |
|---|---|---|---|---|---|
| 1 | `erweiterungen/pflege-assistent.js` `start()`/`zeige()`, `src/app.js` `paStarten()`, `puRender()`, `piRender` | Wenn `lang !== 'de'`: Container `#pflegeAssist`, `#puInhalt`, `#pflegeInfo` mit `lang="de" dir="ltr"` auszeichnen; „← Zurück“ dort über die App-Übersetzung (`t('zurueck')`) mit gespiegeltem Pfeil; Hinweis „nur auf Deutsch“ nur einmal (arabischer Kasten, deutscher Satz weg) und nicht unter die Lupe | hoch (ar/fa/ps) | S | nein |
| 2 | `src/app.js` `paStarten()` (Aktionen) | Kacheltitel „Pflegegrad beantragen“, „Mit dem Gutachten vergleichen“, „Was steht mir zu?“ in `de.json` und Sprachdateien statt fest im Code | mittel | S | nein |
| 3 | `erweiterungen/vorschau.js` (Gutachten-Prüfung `pf-*`), `src/app.js` `briefOeffnen('pk')` | Vergleich als **geführten Ablauf** mit denselben Fragen wie die Einschätzung: je Frage „Deine Antwort: …“ vorbelegt, darunter „Was steht im Gutachten?“ (gleiche 4 Knöpfe). Nur Abweichungen zeigen. Alter aus der Einschätzung übernehmen. Ergebnis „Deine Einschätzung vs. Gutachten“ oben statt unten. Langes Formular nur als „Alle Werte auf einer Seite (für Fachkräfte)“ | hoch | L | nein (Rechnung bleibt `pflege.js`) |
| 4 | `src/app.js` `puRender()` | Pflegegeld und Pflegedienst als **Wahl** zeigen („Entweder Pflegegeld, oder Pflegedienst, oder gemischt“), Kombinationsleistung aus „Weitere“ nach oben; Satz zum Pflicht-Beratungsbesuch sichtbar unter Pflegegeld | hoch | M | **ja** |
| 5 | `src/app.js` `puRender()` (Knopf `pu-schaetzen-knopf`) | Bei vorhandenem Pflegegrad Knopf „Reicht der Pflegegrad noch? Höherstufung prüfen“ (`pa.hoeher`) als Nebenknopf statt grünem „Pflegegrad selbst einschätzen“; bei „Noch keiner“ Hauptknopf „Pflegegrad beantragen“ | mittel | S | nein |
| 6 | `src/app.js` `puRender()`, `src/ausziehen.js` | „Mehr dazu“ eindeutig machen: sichtbar gleich, aber `aria-label` „Mehr zu Pflegegeld“ o. ä.; Paragrafen („Rechtsgrundlage …“, „§ 31 ZKG“ usw.) nur im Beratungsmodus zeigen, wie die Einstellung verspricht | mittel | S–M | nein (Text bleibt, nur Anzeige) |
| 7 | `src/lang/ausziehen/de.json`, `src/ausziehen.js` | Versicherungen nur in der Kachel „Versicherungen“; in „Dein Geld im Griff“ und „Finger weg!“ je ein Satz mit Sprung dorthin; „Privathaftpflicht klären“ verlinkt dorthin. „Geld und Hilfen“: je Hilfe 1 Satz + „Im Leistungs-Check prüfen“ | mittel | M | nein |
| 8 | `src/template.html` `#klientBlatt`, `src/klient.js`, `src/weitergabe.js` | Klient-Seite in **zwei klar getrennte Schritte**: „1 Was bekommt dein Klient?“ (Haken, je Gruppe zugeklappt mit Zähler „8 von 8“) und „2 Wie gibst du es weiter?“ als Wahl: Drucken · PDF teilen · In seine SoLo-App (QR oder Datei). QR-Knopf nur aktiv, wenn der Inhalt passt; sonst vorher Satz „Für einen QR-Code zu viel – Datei nehmen oder weniger anhaken“ | hoch | M | nein |
| 9 | `src/weitergabe.js` (PIN-Import, Z. ~319–335) | Fehlermeldung rot direkt über dem PIN-Feld (GOV.UK-Muster), Feld nicht leeren; Augen-Knopf „PIN zeigen“; Knöpfe „Öffnen“ (grün) und „Abbrechen“ (Textlink) | mittel | S | nein |
| 10 | `src/lang/suche/woerter/de.json` (und Sprachen), `src/suche.js` `ZIELE` | „Pflegegeld“, „Pflegesachleistung“, „Verhinderungspflege“, „Kurzzeitpflege“, „Hausnotruf“ zu `p-hilfe`; „Gutachten“, „MD“, „Widerspruch Pflegegrad“ mit Titel „Pflegegutachten prüfen“; „QR“, „PIN“, „Datei von der Beratung“ → Import in Mein Ordner; × auf 44 px | mittel | S | nein |
| 11 | CSS in `src/template.html` | `hyphens: manual` für Kacheltitel (`.sk`, `.uk-karte`, `.pa-kacheln`); Kacheln einer Reihe gleich hoch (Pflege-Ergebnis, „Ich ziehe aus“) | gering | S | nein |
| 12 | `erweiterungen/pflege-assistent.js` `schritte()` | Nach jedem Bereich kurze Zwischenseite „Bereich 2 von 6 geschafft – weiter oder später?“ (wie Verbraucherzentrale); prüfen, ob Unterfragen bei „meistens allein“ übersprungen werden können, um unter 45 Bildschirme zu kommen | mittel | M | **ja** (Wertung darf sich nicht ändern) |

## Vorher / Nachher (Skizzen)

### 1 Einschätzung in Arabisch
```
VORHER (dir=rtl, Text deutsch)          NACHHER
            Zurück ←                    رجوع →                        (Kopf arabisch, gespiegelt)
Kann sich die Person im Bett            ┌ النص بالألمانية ────────────┐
       ?allein drehen und aufsetzen     │ Kann sich die Person im Bett │ (Block lang=de dir=ltr)
                                        │ allein drehen und aufsetzen? │
                                        └──────────────────────────────┘
```

### 3 Gutachten vergleichen
```
VORHER  [Werte selbst eingeben] → 64 Auswahllisten, 19 Bildschirme, Ergebnis ganz unten
NACHHER Frage 3 von 22 · Bereich 1: Sich bewegen
        Vom Bett auf einen Stuhl wechseln
        Deine Antwort: Schafft nur einen kleinen Teil allein
        Was steht im Gutachten?  [allein] [meistens allein] [kleiner Teil] [gar nicht] [steht nicht drin]
```

### 4 Pflege-Übersicht
```
VORHER  Pflegegeld 599 € · Pflegedienst bis 1.497 € · … · ▸ Weitere (9): Kombinationsleistung
NACHHER Wer pflegt?  ◉ Angehörige → Pflegegeld 599 €   ○ Pflegedienst → bis 1.497 €   ○ Beides gemischt
        (Satz: Mit Pflegegeld kommt alle 6 Monate eine Pflicht-Beratung ins Haus.)
        Dazu immer: Entlastungsbetrag 131 € · Vertretung 3.539 €/Jahr · Tagespflege …
```

### 8 Für Klient zusammenstellen
```
VORHER  Modus · Sprache · 8 Haken Ergebnis · 8 Haken Unterlagen · Datum · 2 Haken Briefe · [Drucken][Teilen]
        · An die SoLo-App: PIN · [QR-Code zeigen] → „Zu groß“ · [Als SoLo-Datei teilen] · Vorschau
NACHHER ① Was bekommt dein Klient?  ▸ Ergebnis (8/8)  ▸ Unterlagen (8/8)  ▸ Musterschreiben (0/2)   Sprache: Deutsch ▾
        ② Wie gibst du es weiter?   ○ Drucken  ○ PDF teilen  ○ In seine SoLo-App (PIN 951 443) → [Datei] [QR, wenn klein genug]
```

## Bilder

| Datei | Zeigt |
|---|---|
| 01-pflege-unterstuetzung-pg3.png | Unterstützung bei PG 3: Pflegegeld und Pflegedienst gleichrangig, „Mehr dazu“ |
| 02-einschaetzung-ergebnis.png | Ergebnis der Einschätzung, 3 Kacheln, Aufklapper (ganze Seite) |
| 03-einschaetzung-arabisch.png | Frage in ar: deutsch, rechtsbündig, „?allein“, „Zurück ←“ |
| 04-gutachten-formular.png | Gutachten „Werte selbst eingeben“: Alter leer, „Alles leeren“ oben, Auswahllisten |
| 05-auszug-checkliste.png | „Bevor du ausziehst“: Abhak-Karten mit „Mehr dazu“ |
| 06-klient-drucken-weitergabe.png | Klient-Seite: „Drucken/Teilen“ und darunter Weitergabe an die App mit PIN |
| 07-import-pin-falsch.png | Import: falsche PIN, graue Meldung oben, Feld geleert |
| 08-suche-pflegegeld.png | Suche „Pflegegeld“: Pflege-Übersicht fehlt in den Treffern |

## Grenzen
- Nur Android-Nachbildung im Browser, kein echtes Gerät, kein Dunkelmodus, keine Tablet-Breite. QR-Scan und Datei-Auswahl nachgeahmt (Datei aus dem Teilen-Aufruf wieder eingelesen).
- Einschätzung mit einem Antwortmuster (82 Jahre, mittlere Antworten); die Zahl der Fragen hängt von den Antworten ab.
- Fachliche Punkte (#4, #12) nur als Vorschlag – vor Umsetzung von Fable prüfen lassen.
