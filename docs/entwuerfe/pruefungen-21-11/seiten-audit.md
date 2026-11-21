# Seiten-Prüfung im neuen Stil – SoLo (Stand origin/claude/test-update-1.9, Commit c8aa941)

Geprüft am 21.11.2026 mit Playwright (Chromium 390×844, de, Faktor 2), Build `npm run build:web`.
76 Ganzseiten-Fotos in diesem Ordner (Dateiname = Weg durch die Kacheln). Es wurde kein Code geändert.

Maßstab (Davids Stil): oben große Kacheln (überall gleich), grüne Hauptknöpfe direkt darunter, Inhalte ohne Kachel nur wenn nötig,
keine großen Infokästen, keine Dopplungen, kurze Tipps mit Symbol zum Aufklappen, Rechtshinweis und Quellen klein unten.

**Ausgenommen (schon in Arbeit, nur fotografiert):** Haushaltsplan, Strom/Heizen/Abschlag, alle „Es ist dringend“-Seiten,
„Stimmt der Brief?“, Raten anbieten, Pflegegrad-Ergebnis, Ausziehen „Bevor du ausziehst“ (mit Unter-25-Kasten), Schulden-Liste.

**Nie entfernen (rechtlich nötig):** „Erste Einschätzung, keine Rechtsberatung“, „Allgemeines Muster, keine Rechtsberatung“,
„Quellen und Stand“, „Stand: November 2026 · nach amtlichen Quellen“, alle Frist-Kästen. Diese bleiben überall klein unten.

---

## Die 10 wichtigsten Empfehlungen

| # | Seite | Was | Empfehlung | Priorität |
|---|---|---|---|---|
| 1 | Hilfen-Check, Ergebnis (ausführlich) | Kein grüner Knopf unter den Ergebnis-Karten; die „Ausfüllhilfe: Antrag vorbereiten“ steht ganz unten als großer grün umrandeter Kasten mit 5 Feldern und 7 Haken | Grünen Knopf „Briefe für die Anträge machen“ direkt unter die Karten (wie im Kurz-Check); Namen/Anschrift erst in der Antragsmappe abfragen; Kasten raus | hoch |
| 2 | Hilfen-Check, Ergebnis | „Unsicher? Eine Beratungsstelle …“ als blauer Infokasten; „Zwei Wege …“ als grün umrandeter Kasten über den Karten; „Gut zu wissen für alle Anträge“ als Kasten | Alle drei als kurze Tipps mit Symbol zum Aufklappen, unter die Karten; „Zwei Wege“ nur als Aufklapp-Tipp | hoch |
| 3 | Geld → Schuldnerberatung | Kachel „Vorsicht: unseriöse Anbieter“ enthält nur einen Aufklapp-Tipp, und der steht wortgleich auch in „Beratungsstelle finden“ | Kachel raus; Tipp bleibt in „Beratungsstelle finden“ | hoch |
| 4 | Geld → Post vom Inkasso | Kachel „Gelber Umschlag vom Gericht?“ öffnet dieselbe Seite wie „Es ist dringend → Mahnbescheid vom Gericht“ | Kachel raus oder direkt auf die Dringend-Seite verlinken (keine zweite Fassung) | hoch |
| 5 | Geld → Schreiben an Gläubiger | Kachel „Bescheinigung für das P-Konto“ ist dieselbe Vorlage wie „Was bleibt mir? → Bescheinigung für das P-Konto“; sie richtet sich auch nicht an Gläubiger | Hier raus; bleibt unter „Was bleibt mir?“ | hoch |
| 6 | Brief → Jobcenter: Einladung / Anhörung | Überschrift bleibt „Bescheid Grundsicherungsgeld prüfen“; „Was prüft SoLo genau?“ und „Wörter im Bescheid erklärt“ passen nicht zu Einladung/Anhörung | Bei Einladung/Anhörung Überschrift anpassen und die beiden Bescheid-Aufklapper ausblenden | hoch |
| 7 | Alle Brief-Stellen (7 Seiten) | Gesamter Inhalt in einem großen weißen Rahmen (`.card`); „Anderer Brief“: Überschrift doppelt (Seite + Rahmen) | Rahmen weglassen, Inhalte direkt auf die Seite; doppelte Überschrift raus | mittel |
| 8 | Pflege → Welche Unterstützung (Pflegegrad gewählt) | 5-zeiliger Einleitungstext über den Leistungen; Hinweis „Pflegekasse oder Pflegestützpunkt“ unten als Fließtext; kein grüner Knopf | Einleitung auf 1 Satz kürzen, Rest aufklappbar; Hinweis als Tipp mit Symbol; grüner Knopf (z. B. „Pflegeberatung finden“ oder „Antrag vorbereiten“) unter die Leistungen | mittel |
| 9 | Muster-Schreiben (4 Seiten + P-Konto) | Gelber Warnkasten „Die Anschrift fehlt noch“ erscheint schon, bevor man etwas eingetragen hat | Erst beim Drucken/Teilen zeigen, wenn das Feld leer ist | mittel |
| 10 | Startseite | Datenschutz-Satz „Deine Angaben bleiben auf diesem Gerät …“ als farbiger Kasten mit Rand | Als kleine Zeile ohne Kasten unten (Inhalt bleibt) | mittel |

---

## Alle Seiten im Einzelnen

### Start und Hilfen-Check

| Seite | Element unten ohne Kachel / Kasten / Rahmen | Empfehlung | Begründung | Prio |
|---|---|---|---|---|
| Start (`start.png`) | Kasten „Deine Angaben bleiben auf diesem Gerät …“ (`.hinweis-koralle`, Farbe + Rand) | kleine Zeile, ohne Kasten | Wichtig, aber kein Infokasten nötig; Kacheln sollen allein wirken | mittel |
| Hilfen-Check, leer (`welche-hilfen-stehen-mir-zu.png`) | Kasten „So geht's“ (`.startcard`) unter „Dein Ergebnis / Noch keine Angaben“ | raus oder 1 Satz klein | Erklärt nur, was die Seite ohnehin zeigt | mittel |
| Hilfen-Check, leer | Umrandeter Block „Kurzer Check für Menschen mit Behinderung“ am Formularende | als Kachel/Wahl oben neben „Schritt für Schritt / Alles auf einer Seite“ | Ganz unten nach 7 Fragebereichen findet ihn niemand | mittel |
| Hilfen-Check, leer | „Angaben löschen“ oben groß (18 px) | klein, ans Formularende | Vor der ersten Eingabe ohne Nutzen | gering |
| Hilfen-Check, leer | „Stand: November 2026 · nach amtlichen Quellen“ | bleibt (rechtlich nötig) | Quelle und Stand | – |
| Schritt für Schritt (`hilfen-check_schritt-fuer-schritt.png`) | „Warum fragt die App das?“ (umrandeter Aufklapper) | bleibt aufklappbar, Rand weg | Passt zum Stil, nur Sonderrahmen | gering |
| Ergebnis ausführlich (`hilfen-check_ergebnis_familie.png`) | Kasten „Zwei Wege: Grundsicherungsgeld oder Wohngeld und Kinderzuschlag“ (grüner Rand, über den Karten) | Aufklapp-Tipp mit Symbol unter den Karten | Großer Infokasten vor dem eigentlichen Ergebnis | hoch |
| Ergebnis ausführlich | Zeile „Ergebnis mitgeben / drucken“ | als zweiter Knopf unter dem grünen Hauptknopf | Aktion, gehört zu den Knöpfen | mittel |
| Ergebnis ausführlich | Kasten „Gut zu wissen für alle Anträge“ | Aufklapp-Tipp mit 💡 ohne Kasten | Tipp-Stil | mittel |
| Ergebnis ausführlich | „Wahrscheinlich nicht passend (24)“ gestrichelter Rahmen | aufklappbar lassen, Rahmen weg | Sonderrahmen | gering |
| Ergebnis ausführlich | Blauer Kasten „Unsicher? Eine Beratungsstelle …“ | kurzer Tipp mit Symbol | Großer Infokasten | hoch |
| Ergebnis ausführlich | „Erste Einschätzung, keine Rechtsberatung …“ | bleibt (rechtlich nötig), klein ganz unten | – | – |
| Ergebnis ausführlich | „Ausfüllhilfe: Antrag vorbereiten“ (großer grün umrandeter Kasten, 5 Felder, 7 Haken, Knopf) | raus; grüner Knopf direkt unter die Karten, Felder in die Antragsmappe | Wichtigste Aktion steht am Seitenende; Doppelung mit Haken-Auswahl in der Mappe | hoch |
| Ergebnis Kurz-Check (`hilfen-check_kurzcheck-behinderung_ergebnis.png`) | Kasten „💡 Gut zu wissen“ (`.es-tipps`) | Aufklapp-Tipp | Tipp-Stil | mittel |
| Ergebnis Kurz-Check | Knöpfe „Ergebnis teilen“, „Neu anfangen“, „Zur ausführlichen Version“ | bleiben, aber unter den grünen Knopf „Briefe für die Anträge machen“ (ist schon so) | Passt | – |
| Antragsmappe (`antragsmappe.png`) | Zweimal „Drucken“ (oben und unten) | bleibt | Bei langer Seite sinnvoll | – |
| Antragsmappe | „Die Links führen auf amtliche Seiten …“, „Erste Einschätzung …“ | bleibt (rechtlich nötig) | – | – |
| Antragsmappe | Tipps je Leistung (`.tip`) | bleiben; ggf. mit Symbol | gut kurz | gering |

### Ich habe einen Brief bekommen

| Seite | Element | Empfehlung | Begründung | Prio |
|---|---|---|---|---|
| Absender-Auswahl | – (nur Kacheln) | passt | – | – |
| Jobcenter, Sozialamt, Wohngeld, Familienkasse, Pflegekasse, Vermieter, Anderer Brief | Ganzer Inhalt in großem weißem Rahmen (`.card`) | Rahmen weg | Sonderrahmen um die ganze Seite | mittel |
| alle Stellen | „Foto und PDF bleiben auf dem Gerät …“ | bleibt klein | Datenschutz, schon klein | – |
| alle Stellen | „Trag das Datum ein. Dann zeigt SoLo sofort, bis wann …“ | bleibt (Frist) | Frist | – |
| Jobcenter, Sozialamt | „Wörter im Bescheid erklärt“ (umrandeter Aufklapper) | bleibt aufklappbar, Rand weg | Sonderrahmen | gering |
| Jobcenter: Einladung / Anhörung (`brief_jobcenter_*.png`) | Überschrift „Bescheid Grundsicherungsgeld prüfen“, „Was prüft SoLo genau?“, „Wörter im Bescheid erklärt“ | Überschrift je Briefart; Bescheid-Aufklapper ausblenden | Passt nicht zur gewählten Briefart, verwirrt Laien | hoch |
| Anderer Brief | Überschrift „Anderer Brief oder Formular“ doppelt | eine raus | Dopplung | mittel |
| Anderer Brief | „Oder selbst wählen:“ + 2 Karten unter den Scan-Knöpfen | Karten nach oben (Kacheln zuerst) | Stil: Kacheln oben | gering |
| Anderer Brief | Karte „Brief mit Frist oder Mahnung“ überschneidet sich mit Geld → Es ist dringend / Post vom Inkasso | bleibt als Weg, aber auf dieselben Seiten führen (keine zweite Fassung) | Dopplung prüfen | gering |

### Geld und Schulden (ohne ausgenommene Seiten)

| Seite | Element | Empfehlung | Begründung | Prio |
|---|---|---|---|---|
| Übersicht | – (nur Kacheln) | passt | – | – |
| Was bleibt mir? | Drei Wahlkarten (`.weg`) | passt | gleiches Kachel-Aussehen | – |
| Was bleibt mir? | Überschrift „Pfändung: Was bleibt dir?“ ≠ Kachel „Was bleibt mir?“ | gleich benennen | Wiedererkennen | gering |
| Bescheinigung P-Konto (Was bleibt mir?) | Hinweis über den Feldern (`.hint`, 3 Zeilen) | auf 1 Satz kürzen | kurze Tipps | gering |
| Post vom Inkasso | Kachel „Gelber Umschlag vom Gericht?“ | raus / auf Dringend-Seite „Mahnbescheid“ verlinken | Gleicher Inhalt wie Es ist dringend → Mahnbescheid | hoch |
| Gelber Umschlag (`…gelber-umschlag-vom-gericht.png`) | Frist-Kasten „Widerspruch innerhalb von 2 Wochen“ | bleibt (Frist) | rechtlich nötig | – |
| Gelber Umschlag | Kasten „Erster Schritt …“ + zwei umrandete Knöpfe | grüner Hauptknopf „Beratungsstelle finden“ oben, Kasten zu Text | Stil: grüner Knopf unter den Kacheln | mittel (entfällt, wenn Kachel raus) |
| Schreiben an Gläubiger | Kachel „Bescheinigung für das P-Konto“ | raus | Doppelt mit „Was bleibt mir?“, geht nicht an Gläubiger | hoch |
| Schreiben an Gläubiger | „Allgemeines Muster, keine Rechtsberatung …“ (Liste und jede Vorlage) | bleibt in jeder Vorlage (rechtlich nötig); auf der Listen-Seite genügt es dort | Kein Entfernen aus den Vorlagen | gering |
| Vorlagen (Geduld, Aufstellung, Widerspruch, P-Konto) | Gelber Kasten „Die Anschrift fehlt noch“ schon vor der Eingabe | erst beim Drucken/Teilen zeigen | Warnkasten ohne Anlass | mittel |
| Vorlage Widerspruch | Warnkasten „Schick das nur, wenn …“ | als kurzer Tipp mit ⚠️, bleibt sichtbar | Sachlich wichtig, aber kein großer Kasten | gering |
| Vorlage „Bitte um Geduld“ | Gleiche Vorlage wird aus „Bis zum Termin“ geöffnet | bleibt (Verlinkung, keine Kopie) | – | – |
| Mein Geld planen | Zwischenüberschrift „Geld sparen im Alltag“ | bleibt | gliedert Kacheln | – |
| Günstig und gesund essen | Link-Karte Verbraucherzentrale (umrandet) | bleibt (wie Kachel) | passt | – |
| Essen, Verträge | „Quellen und Stand“ | bleibt (rechtlich nötig) | – | – |
| Schuldnerberatung | Kachel „Vorsicht: unseriöse Anbieter“ | raus | Inhalt = ein Tipp, steht wortgleich in „Beratungsstelle finden“ | hoch |
| Beratungsstelle finden | Großer Kasten mit 5 Absätzen (`.gs-box gs-beratung`) | 1–2 Sätze sichtbar (meine-schulden.de), Rest (Jobcenter/Sozialamt) aufklappbar, ohne Kasten | Großer Infokasten | mittel |
| Bis zum Termin, Beratungsmappe | Abhak-Listen, Tipp „Ein Ordner …“, „Mappe drucken“ | bleiben; „Mappe drucken“ als grüner Knopf nach oben | Hauptaktion steht unten | gering |
| Ablauf und Privatinsolvenz | Einleitung (`.hint`, mehrere Sätze) vor der Schrittliste | kürzen | Doppelt mit der Schrittliste darunter | gering |

### Pflege

| Seite | Element | Empfehlung | Begründung | Prio |
|---|---|---|---|---|
| Pflege (Auswahl) | Zwei Wahlkarten (`.weg`) | passt | sehen wie Kacheln aus | – |
| Welche Unterstützung (Grad wählen) | „Er steht im Bescheid der Pflegekasse.“ | bleibt | kurz, hilfreich | – |
| Welche Unterstützung, Grad 3 (`pflege_unterstuetzung_grad3.png`) | Einleitung 5 Zeilen („Aufs Konto kommen nur …“) | 1 Satz, Rest aufklappbar | Langer Text vor den Leistungen | mittel |
| Grad 3 | „Hilfe bei allen Fragen und beim Antrag: Pflegekasse oder Pflegestützpunkt“ | Tipp mit Symbol, oder grüner Knopf | Stil | mittel |
| Grad 3 | Kein grüner Hauptknopf | ergänzen (z. B. „Pflegeberatung finden“) | Stil | mittel |
| Grad 3 | „Weitere Leistungen (9)“, „Quellen und Stand“ | bleiben | gut | – |
| Pflegegrad einschätzen, Frage 1 | „So geht es“ (Aufklapper), „Später weitermachen“ | bleiben | passt | – |
| Pflege-Erklärseite (`pflege_erklaerseite.png`) | Direkt aufgerufen leer | nicht bewertbar; nur aus einem Ergebnis erreichbar | – | – |

### Ich ziehe aus (ohne „Bevor du ausziehst“)

| Seite | Element | Empfehlung | Begründung | Prio |
|---|---|---|---|---|
| Übersicht | Satz „Deine erste eigene Wohnung … Tippe auf einen Bereich.“ | „Tippe auf einen Bereich“ raus | Selbsterklärend | gering |
| Die ersten Tage | „Meine Notizen“ (Textfeld) unten | aufklappbar („Notizen ▸“) | Selten gebraucht, nimmt Platz | gering |
| Die ersten Tage | „Weitere Punkte (4)“ mit Rand | Rand weg | Sonderrahmen | gering |
| Dein Geld im Griff, Geld und Hilfen | Grüner Knopf oben über der Liste | passt | Stil erfüllt | – |
| Versicherungen | Stufen-Überschriften mit farbigem Rand | Rand weg oder kleiner Punkt | Sonderrahmen | gering |
| Versicherungen | „Keine Werbung, keine Anbieter …“ | bleibt klein | Neutralität | – |
| alle | „Quellen und Stand“ | bleibt | rechtlich nötig | – |

### Mein Ordner, Fristen, Einstellungen, Beratungsmodus

| Seite | Element | Empfehlung | Begründung | Prio |
|---|---|---|---|---|
| Mein Ordner | Link „PIN-Sperre und automatisch löschen“ | bleibt (Abkürzung zu Einstellungen) | Absicht laut Vorlage; keine Inhaltskopie | gering |
| Fristen | „Keine offene Frist“, „Eigene Frist eintragen“ (umrandeter Aufklapper) | bleibt; Rand weg | Sonderrahmen | gering |
| Einstellungen (Liste) | – | passt | – | – |
| Anzeige und Sprache, Erinnerungen, Fachleute | – | passt | kurz | – |
| Sicherheit und Daten | „Mehr dazu“ (umrandet) | Rand weg | Sonderrahmen | gering |
| Über die App | „Regeln Stand November 2026“ und „Stand: Rechtslage 2026 …“ | zu **einer** Stand-Zeile zusammenlegen (nicht entfernen) | Doppelter Stand | gering |
| Über die App | „Wichtig: erste Einschätzung, keine Rechtsberatung …“ | bleibt (rechtlich nötig) | – | – |
| Über die App | Umrandeter Block „So rechnet der Check …“ | bleibt aufklappbar, Rand weg | Sonderrahmen | gering |
| Beratungsmodus (Start, Geld, Ordner, Check) | Zeile „Klient (Vorgang): … wechseln“ klein | passt | – | – |

---

## Dopplungen (Übersicht)

| Inhalt | Fundort 1 | Fundort 2 | Empfehlung |
|---|---|---|---|
| Mahnbescheid vom Gericht (2-Wochen-Frist) | Geld → Es ist dringend → Mahnbescheid | Geld → Post vom Inkasso → Gelber Umschlag | Inkasso-Kachel raus oder Link auf Dringend-Seite |
| Bescheinigung für das P-Konto (Vorlage) | Geld → Was bleibt mir? | Geld → Inkasso → Schreiben an Gläubiger | bei „Schreiben an Gläubiger“ raus |
| „Schnelle Hilfe gegen Geld: Vorsicht, oft unseriös“ | Schuldnerberatung → Beratungsstelle finden | Schuldnerberatung → Vorsicht: unseriöse Anbieter (einziger Inhalt) | Kachel raus |
| Antrag vorbereiten (Name, Anschrift, Leistungen anhaken) | Ergebnis ausführlich → Ausfüllhilfe | Antragsmappe (Auswahl der Briefe) | Ausfüllhilfe-Kasten raus, grüner Knopf zur Mappe |
| Überschrift „Anderer Brief oder Formular“ | Seitenkopf | Kopf des Rahmens darunter | eine raus |
| Stand der Regeln | Über die App: Versionszeile | Über die App: „Stand: Rechtslage 2026“ | zusammenlegen |
| Beratungsstelle-Hinweis | Ergebnis: blauer Kasten | Geld → Schuldnerberatung (andere Zielgruppe) | im Ergebnis als kurzer Tipp |

## Hinweise zum Vorgehen
- Erfasst: Start, Hilfen-Check (leer, Schritt für Schritt, Ergebnis ausführlich, Kurz-Check-Ergebnis), Antragsmappe, Brief + 7 Stellen + Briefarten Einladung/Anhörung, Geld und Schulden mit allen Unterseiten (inkl. ausgenommener), Pflege + Unterseiten, Ausziehen + Unterseiten, Mein Ordner, Fristen, Einstellungen + 5 Unterseiten, Beratungsmodus (Start, Geld, Ordner, Check).
- Nicht einzeln fotografiert: „Mein Konto ist gepfändet“ (erste Frage identisch mit „Lohn“), Unterseiten von „Anderer Brief“ (Frist/Mahnung, Antragsformular), Pflege-Erklärseite (nur aus Ergebnis erreichbar). Eine Vorgänge-Liste mit Einträgen gibt es erst nach Anlegen eines Vorgangs.
- Bei den Ganzseiten-Fotos liegt teils die untere Leiste (Start/Mein Ordner/Einstellungen) über dem Inhalt; das ist ein Effekt des Fotos, kein Fehler der App.
