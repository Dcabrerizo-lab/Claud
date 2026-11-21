# SoLo – Prüfung aller Bereiche: Bedienung, Sprache, Berater-Nutzen

Stand 21.11.2026 · Branch `origin/claude/test-update-1.9` (Commit adae98d). Suche geprüft auf `origin/claude/b-suche`, QR-Weitergabe auf `origin/claude/b-klient-qr`. Beide sind noch nicht im Test-Zweig.
So geprüft: `npm run build:web`, Playwright Chromium. Alle Kacheln bis Ebene 3 automatisch durchgeklickt in 390×844 (de, ar, Einfache Sprache) und 820×1180 (de, Ebene 1). Hilfen-Check Schritt für Schritt bis zum Ergebnis, Antragsmappe, Beratungsmodus mit „Für Klient“ und QR, 60 Suchwörter. Kein Code geändert.
Fotos: `/home/claude/ausgabe/bereiche/ux/` (Dateiname = Sprache-Breite_Nr_Seite). Messwerte: `/home/claude/ux-skript/m_*.json`.
Nutzen: hoch / mittel / gering · Aufwand: S (bis ½ Tag) / M (1–2 Tage) / L (mehr)

## Kennzahlen

| Messung | Ergebnis |
|---|---|
| Fehlende Übersetzungsschlüssel (12 Sprachen, 2.648 Schlüssel, dazu 91 kb/kw-Schlüssel im QR-Branch) | **0** in jeder Sprache. Nur Amtsnamen sind absichtlich deutsch (ZBFS, Landesamt für Pflege). |
| Deutsch trotz Arabisch (sichtbar, 58 Seiten) | 2 Seiten: **Pflegegrad-Einschätzung komplett deutsch** (auch „Zurück“, „Weiter“, „Jahre“, „So geht es“), „Anderer Brief → Brief mit Frist oder Mahnung“ (Erklärtexte deutsch) |
| Paragrafen in der Laienansicht (Beratungsmodus aus) | „Ich ziehe aus“: Geld und Hilfen 12 ×, Finger weg 4 ×, Geld im Griff 2 ×, Versicherungen 1 ×. Hier fehlt `Fmt.ohnePara`. |
| Hilfen-Check, Familie mit 2 Kindern, Schritt für Schritt | 37 Fragen, etwa 58 Tipper bis zum Ergebnis. „Etwa 5 Minuten“ passt nur knapp. |
| Wichtiges in ≤ 3 Schritten | Pfändung 3 ✓, Pflegegrad einschätzen 2 ✓, Brief prüfen 3 ✓ (Foto-Knopf aber unterhalb des sichtbaren Bereichs), Hilfen-Check: Wahlseite + 37 Fragen, Fristen: **ohne offene Frist nicht erreichbar** |
| Einfache Sprache | Satzlänge sinkt auf den meisten Seiten um 20–60 %. Unverändert: Brief-Startseiten (Jobcenter 93 → 93 Wörter, gleiche Sätze), Pflege-Fragen, Einstellungen. Lange Wörter bleiben (Berufsausbildungsbeihilfe, Nebenkostenabrechnung, Wohnberechtigungsschein). |
| Längste Seiten (390 px) | Antragsmappe ≈ 11 Bildschirme, Klient-Blatt ≈ 5,5, Ausziehen „Geld und Hilfen“ 3,4 |
| Skriptfehler | 0 |

---

## Die 10 wichtigsten Verbesserungen

| # | Bereich | Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|---|---|
| 1 | Pflege | Pflegegrad-Einschätzung übersetzen. Sofort-Schritt: wenigstens Knöpfe, Einheiten und Kopf (Zurück, Weiter, Jahre, So geht es, Später weitermachen) in alle Sprachen, Pfeile bei RTL spiegeln | hoch | S (Knöpfe) / L (Fragen) | In ar ist der ganze Ablauf deutsch, nur ein Hinweis sagt das. „Zurück ←“ zeigt in RTL in die falsche Richtung. Laien ohne Deutsch kommen an dieser Stelle nicht weiter (Foto `ar-390_024`). |
| 2 | Ich ziehe aus | Paragrafen in der Laienansicht ausblenden (`Fmt.ohnePara` wie in app.js). Gleich auch Haushaltsplan (hb, 23 Texte mit §) und Geld (gs, 9) prüfen | hoch | S | Das widerspricht der Grundregel „ohne Beratungsmodus ohne Paragrafen“. Auf „Geld und Hilfen“ stehen 12 Paragrafen auf 3,4 Bildschirmen (`de-390_030`). |
| 3 | Suche (b-suche) | Alltagswörter ergänzen: Widerspruch, Einspruch, Überprüfung, Rückforderung, Erstattung, Brille, Zahnersatz, „Bescheid falsch“. Bei keinem Treffer: Kacheln „Brief prüfen“ und „Hilfen-Check“ anbieten | hoch | S | „Widerspruch“ ist das häufigste Anliegen bei Bescheiden und bringt heute 0 Treffer (ar „اعتراض“ ebenso). Sonst findet die Suche gut (40 von 45 deutschen Wörtern). |
| 4 | Hilfen-Check | Über jeder Frage stehen 4 Bedienelemente (Abschnittsname, Umschalter Schritt/Alles, Link Kurz-Check, „Angaben löschen“). Auf der Frageseite nur Zurück + Frage zeigen. Umschalten und Löschen nur auf Wahl- und Übersichtsseite | hoch | S | Muster „Eine Frage pro Seite“ (GOV.UK). Die Weg-Wahl wurde gerade erst getroffen, sie hier wieder anzubieten ist ein doppelter Weg. „Angaben löschen“ neben der ersten Frage lädt zum Fehltipp ein (`fluss-de-390_01-frage1`). |
| 5 | Mein Ordner | Leerer Zustand mit 1 Satz („Hier sammelt SoLo deine Ergebnisse, Fristen und Briefe“) und 3 Kacheln: Hilfen-Check starten, Frist eintragen, Brief prüfen. „Weiteren Vorgang anlegen“ nur im Beratungsmodus, sonst „Neuer Ordner für eine andere Person“ | hoch | S | Heute ist der Ordner eine Sackgasse: ein Knopf „Weiteren…“, obwohl es noch keinen gibt, und das Fachwort „Vorgang“. „Eigene Frist eintragen“ ist erst erreichbar, wenn schon eine Frist offen ist (`de-390_007`). |
| 6 | Briefe | Reihenfolge auf allen Stellen-Seiten: Briefart → grüner Knopf „Foto machen“ → erst dann Datum (wird erkannt, sonst von Hand) | hoch | S–M | Bei Jobcenter liegt der grüne Hauptknopf unterhalb des sichtbaren Bereichs, davor stehen 4 Auswahlknöpfe und ein Datumsfeld. Laien sollen zuerst das tun, was zählt (`de-390_010`). |
| 7 | Antragsmappe | Als Aufgabenliste mit Status zeigen (1 Daten, 2 Anschreiben, 3 Formulare, 4 Unterlagen, 5 Abgeben). „Drucken“ ans Ende statt vor die Eingabe. Wohngeld und Grundsicherungsgeld nicht beide vorab anhaken (Entweder-oder), stattdessen Hinweis | hoch | M | Die Mappe ist etwa 11 Bildschirme lang. „Drucken“ steht über leeren Feldern. Beide Leistungen sind angehakt, obwohl das Ergebnis „Zwei Wege“ erklärt (`mappe-de-beratung-390_2-mappe`). Fachliche Vorauswahl bitte von Fable prüfen lassen. |
| 8 | Beratung | Unterlagen aller Leistungen zu **einem** Laufzettel ohne Doppelungen zusammenführen (Ausweis, Kontoauszüge, Mietvertrag nur einmal), abhakbar, in Klientensprache und „Deutsch daneben“ | hoch | M | Kaufgrund 3 in berater-mehrwert.md. Heute: 7 Blöcke mit je 3 Punkten, Personalausweis 3-mal, Mietvertrag 2-mal (`mappe-de-beratung-390_3-klient`). |
| 9 | Beratung | „Für Klient zusammenstellen“: oben gleich die Knöpfe „Drucken / QR-Code / Datei“, Haken zuklappbar (Standard: alles Passende). Sprache des Klienten vorbelegen mit der zuletzt gewählten | mittel | S | Mit QR stehen vor dem Senden etwa 16 Haken und 2 Auswahlen. Im Gespräch zählt Tempo (`qr-de-beratung-390_4-qr`). |
| 10 | Einfache Sprache | Die Brief-Startseiten und Pflege-Fragen in Einfacher Sprache prüfen und ergänzen. Lange Wörter mit Mediopunkt trennen (Wohn·berechtigungs·schein) oder einmal erklären | mittel | M | Der Schalter wirkt dort kaum (gleiche Wortzahl). Gerade bei Briefen sind Leser am unsichersten. |

---

## Hilfen-Check

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Frageseite entrümpeln (siehe Top 4) | hoch | S | 4 Elemente vor jeder Frage |
| Zweimal „Was ist das Einkommen im Monat?“: Person nennen („von dir“ / „von deinem Partner“) | mittel | S | Gleiche Überschrift für Person 1 und 2. Man weiß nicht, wo man gerade ist. |
| Fortschritt als Abschnitt anzeigen („Haushalt · Wohnen · Einkommen · Vermögen“) statt nur Abschnittsname klein | mittel | S | 37 Fragen ohne Gefühl, wie weit es noch ist (GOV.UK: Schrittanzeige ohne Gesamtzahl, aber mit Abschnitten) |
| Startseite: „Etwa 5 Minuten“ nur einmal; die drei Einleitungen (Kopfzeile, Gruß, Hero-Zeile) auf eine kürzen | mittel | S | 3 Begrüßungstexte und eine große Sprachwahl vor der ersten Kachel (`de-390_001`) |
| Ergebnis: „Ergebnis mitgeben / drucken“ unter den grünen Knopf „Briefe für die Anträge machen“ | mittel | S | Heute steht der Neben-Knopf über den Karten, der Haupt-Knopf nach 6 Karten |
| Beträge auch bei Kindergeld in der Kopfzeile der Karte (wie bei Kinderzuschlag/Wohngeld) | gering | S | Uneinheitlich: einige Karten zeigen den Betrag, andere nur die Stelle |
| Wahlseite „Wie möchtest du antworten?“: Kurz-Check Behinderung bleibt dort, als dritte Kachel gut gelöst | – | – | Umgesetzt aus dem Seitenaudit |

## Briefe

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Foto-Knopf vor das Datum (siehe Top 6) | hoch | S–M | Hauptaktion steht unterhalb des sichtbaren Bereichs |
| Bei Einladung/Anhörung andere Überschrift als „Bescheid … prüfen“ (aus dem Audit, noch offen) | hoch | S | Unter „Einladung“ steht weiter „Bescheid Grundsicherungsgeld prüfen“ |
| „Anderer Brief → Brief mit Frist oder Mahnung“ übersetzen (Erklärtexte, Widerspruchsfrist) | hoch | M | In ar deutsch, obwohl es um Fristen geht. Das ist eine rechtlich heikle Stelle. |
| Dauerhafter blauer Kasten „Briefe an Ämter sind immer deutsch“ (ar) als einzeilige Notiz | gering | S | Großer Infokasten auf jeder Stellenseite |
| Datumfeld: Format zeigt in der Web-Fassung „mm/dd/yyyy“ (Browser-Sprache) | gering | S | In der App folgt es dem Gerät. Im Web-Test wirkt es fremd. Ggf. `lang` am Feld setzen. |

## Antragsmappe

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Aufgabenliste mit Status, „Drucken“ ans Ende (Top 7) | hoch | M | 11 Bildschirme, Hauptaktion vor der Eingabe |
| Entweder-oder (Wohngeld / Grundsicherungsgeld) bei der Vorauswahl beachten | hoch | S | Laien schicken sonst beide Anträge ab. Fachlich von Fable prüfen lassen. |
| Persönliche Daten mit dem Hinweis „nur für den Ausdruck, bleibt auf dem Gerät“ direkt am Feld | mittel | S | 5 Felder mit Name, Geburtsdatum, Anschrift ohne sichtbaren Grund |
| Pro Schritt nur 1 grüner Knopf („Zum Anschreiben“, „Formular öffnen“) – heute schon fast so | – | – | gut |

## Pflege

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Einschätzung übersetzen bzw. Bedienteile übersetzen (Top 1) | hoch | S / L | Ganz deutsch in 12 Sprachen |
| Erste Frage „Wie alt ist die Person?“ mit Feld für Jahre: bei RTL Einheit links/rechts richtig, Zahlenfeld groß | gering | S | Foto `ar-390_024` |
| „Welche Unterstützung gibt es?“: grüner Knopf „Pflegeberatung finden“ (aus dem Audit, offen) | mittel | S | Kein nächster Schritt nach der Leistungsliste |
| Beide Kacheln gut: kurze Unterzeile, 2 Wege, ≤ 2 Schritte | – | – | gut |

## Geld und Schulden

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Tiefe senken: „Post vom Inkasso → Schreiben an Gläubiger → Vorlage“ ist Ebene 4 vom Start. Vorlagen direkt in „Stimmt der Brief?“ am Ende anbieten | mittel | M | Laien wollen nach der Prüfung gleich antworten. Dort fehlt der Weg zur passenden Vorlage. |
| „Gelber Umschlag“ führt jetzt auf dieselbe Seite wie „Mahnbescheid“ (keine Kopie) ✓ | – | – | Audit-Punkt erledigt |
| Überschrift „Pfändung: Was bleibt dir?“ = Kachel „Was bleibt mir?“ angleichen | gering | S | Wiedererkennen |
| Silbentrennung in Kachel-Titeln vermeiden („Schul-den-Liste“, „Schuldnerbe-ratung“, „Gelber Um-schlag“): `hyphens: manual` in `.uk-karte b` | mittel | S | Getrennte Wörter in großen Titeln lesen sich schwer, besonders für Menschen, die Deutsch lernen |
| Haushaltsplan: 3 Sätze über 20 Wörter auf der Startseite kürzen | gering | S | Einfache Sprache senkt nur auf 2 |

## Ich ziehe aus

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Paragrafen nur im Beratungsmodus (Top 2) | hoch | S | 19 Paragrafen auf 4 Seiten |
| „Geld und Hilfen“: alle 10 Karten stehen auf „möglich“. Nach 1–2 Fragen (Ausbildung/Studium? unter 25?) sortieren oder auf den Hilfen-Check verweisen und nur 3 Karten zeigen | mittel | M | 389 Wörter, 3,4 Bildschirme, keine Rangfolge |
| Überschrift „Finger weg!“ freundlicher („Vorsicht bei diesen Angeboten“) | gering | S | Bevormundender Ton (Design-Prüfung L5) |
| Checklisten (Bevor du ausziehst, Die ersten Tage) haben 11–13 Aufklapper ohne Punkt-Satz. Gut, Rand weg wie im Audit | gering | S | – |

## Mein Ordner

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Leerer Zustand und „Frist eintragen“ immer erreichbar (Top 5) | hoch | S | Sackgasse |
| Fachwort „Vorgang“ in der Laienansicht ersetzen („Ordner für eine Person“) | mittel | S | Behördensprache. Im Beratungsmodus bleibt „Vorgang“. |
| Link „PIN-Sperre und automatisch löschen“ als Zeile im gleichen Stil wie die anderen Zeilen | gering | S | Einziger unterstrichener Textlink auf der Seite |

## Einstellungen

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Einfache Sprache auch auf der Startseite in der Sprachwahl (gibt es: „Deutsch – Einfache Sprache“) ✓ und in Einstellungen gleich benennen | gering | S | Zwei Namen: „Einfache Sprache“ (Schalter) / „Deutsch – Einfache Sprache“ (Liste) |
| „Für Fachkräfte“: in 1 Satz sagen, was zusätzlich kommt (Paragrafen, Blatt für Klienten, mehrere Ordner, Weitergabe per QR) | mittel | S | Heute nennt der Text nur die Paragrafen. Berater entdecken den Rest nicht. |
| Liste selbst: gut (5 Zeilen, Status in der Unterzeile, ein Muster) | – | – | Vorbild Banking-Apps |

## Beratungsmodus, Für Klient, QR

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Ein Laufzettel ohne Doppelungen (Top 8) | hoch | M | Kaufgrund 3 |
| Knöpfe „Drucken / QR / Datei“ nach oben, Haken zuklappbar (Top 9) | mittel | S | Tempo im Gespräch |
| „Blatt für die Akte“ (deutsch, Datum, Kürzel, Rechtsstand, Einstufungen) als eigener Teil im Klient-Blatt. Ergebnisblatt hat schon „Kürzel“, das wiederverwenden | hoch | S–M | berater-mehrwert 3.3, ein Teil von Kaufgrund 3. Fehlt bisher als Auswahl. |
| Vergleichstabelle Bescheid / SoLo / Unterschied mit Rechenweg sichtbar machen (Kaufgrund 2) | hoch | L | Größter Zeitgewinn laut berater-mehrwert. Hier nicht mit echtem Bescheid geprüft. |
| „Deutsch daneben“ gibt es im Klient-Blatt ✓. Auch für den Bildschirm im Gespräch anbieten (Ergebnis in 2 Spalten auf 820 px) | mittel | M | Kaufgrund 1. Auf dem Tablet ist Platz (`de-820_*`). |
| QR-Hilfe für den Klienten („SoLo öffnen → Mein Ordner → Von der Beratung bekommen“) zusätzlich als großes Bild neben dem Code | gering | S | Klienten ohne Deutsch folgen einem Bild besser |
| Nicht bauen (wie berater-mehrwert): Statistik, Freitext-Notizen, Gesetzeslinks | – | – | kein Kaufgrund |

## Suche (Branch b-suche)

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Wörter ergänzen (Top 3) | hoch | S | 5 von 45 Alltagswörtern ohne Treffer: Widerspruch, Brille, Rückforderung, „Wohngeld zu wenig“ |
| Bei Kita/Krippe gezielter auf Bildung und Teilhabe bzw. Kinderzuschlag statt auf den Hilfen-Check allgemein | gering | S | Treffer zu allgemein |
| Gut: tippfehlertolerant, alte Namen (Hartz 4, GEZ, Pflegestufe) und ar-Wörter finden die richtige Seite, Treffer mit Bereichssymbol | – | – | Vorbild GOV.UK |

## Tablet (820×1180)

| Verbesserung | Nutzen | Aufwand | Begründung |
|---|---|---|---|
| Startraster: 4 Kacheln in 2×2 statt 3 + 1 einzelne | mittel | S | „Ich ziehe aus“ steht allein in der 2. Reihe (`de-820_001`) |
| Sprachwahl rechts bündig mit der Inhaltsspalte (heute breiter als der Inhalt) | gering | S | Optisch unruhig |

## Grenzen der Prüfung
- Nicht mit echten Bescheiden gescannt (Prüfpaket-Ergebnis, Vergleichstabelle). Kein Dunkelmodus. Von den Sprachen nur ar automatisch auf deutsche Reste geprüft; die Schlüssel-Zählung gilt für alle 12.
- Die Erkennung deutscher Reste sucht nur deutsche Funktionswörter. Kurze deutsche Wörter (z. B. „Weiter“) findet sie nicht, die stehen über die Fotos drin.
- Suche und QR stammen aus eigenen Branches; nach dem Zusammenführen kurz nachprüfen.
