# UX-Nachprüfung: Ergebnisanzeige und Antragsmappe

Stand 22.11.2026 · geprüft auf `origin/claude/test-update-naechstes` a7385044 (enthält Ergebnisliste #160, Mappe #159, Bündel n3 #165). Web-Build (`npm run build:web`, `dist/sozialleistungslotse.html`) mit nachgeahmten Capacitor-Plugins (Android), 390×844, ein Headless-Chromium (Playwright), je Durchlauf ein neuer Kontext. Kein App-Code geändert.
Gleiche Kriterien, Fälle und Ampel wie die erste Prüfung (`docs/entwuerfe/ux-ergebnis-mappe.md` auf `claude/b-ux-pruefung`, PR #145).
Bilder: `docs/entwuerfe/ux-bilder-nach/` (12 Stück). Rohfotos und Messwerte: `/home/claude/uxn-bilder/` (nicht im Repo).

Fälle (unverändert): **A** alleinerziehend, 2 Kinder, Teilzeit 1.250 € netto, Miete 850 € (91054) · **B** Rentnerin allein, Rente 880 €, Pflegegrad 2, Miete 520 € (90542 Eckental) · **C** Paar, 3 Kinder, ein Einkommen 2.150 €, Miete 1.150 € (90402 Nürnberg). Dazu A in Einfacher Sprache, C auf Arabisch, A mit großer Schrift.

## Ergebnis in einem Satz

Großer Sprung: 5 von 8 Punkten sind besser geworden, Mappe-Aufbau und Unterlagen sind nicht mehr rot. **Aber nicht alles ist grün:** Der neue Knopf „Antrag vorbereiten“ in jeder Karte **tut nichts** (Fehler beim Zusammenführen, rot). Dazu kommen 4 kleine gelbe Punkte.

## Ampel je Punkt: vorher → nachher

| Bereich | Vorher | Nachher | Was jetzt gut ist | Was noch stört |
|---|---|---|---|---|
| Ergebnisliste | 🟡 | 🟢 | Satz „Am meisten bringt dir: Wohngeld und Kinderzuschlag, ca. 1.400 € bis 1.600 €“ oben; Entweder-oder als eigener Kasten mit „oder“ und „Voraussichtlich dein Weg“ (Bild 01, 04); erstes Bedienelement ist jetzt die erste Karte; Kindergeld mit Betrag (518 €/777 €); grüner Hauptknopf „Antrag vorbereiten“ nach den Karten (Bild 02) | Feinschliff: Summe steht zweimal (Kopfsatz und Weg-Kasten); Ergebnis ist etwas länger (siehe Zahlen) |
| Karte (aufgeklappt) | 🟡 | 🔴 | Inhalt sehr gut: 35–72 Wörter statt 100–170, zuerst das Persönliche, dann Knopf „Antrag vorbereiten“, Stelle, „Mehr dazu“ zu (Bild 03). Titel ohne Silbentrennung | **Knopf „Antrag vorbereiten“ in der Karte hat keine Wirkung** (in allen Karten, alle Fälle, auch nach echtem Tippen). Fall B: Pflegegeld-Karte ohne Betrag im Kopf (347 € steht erst innen) |
| Übergang Ergebnis → Mappe | 🟡 | 🟡 | Hauptknopf öffnet die Mappe; Vorauswahl mit Weg-Wahl: A und C „Wohngeld und Kinderzuschlag“ vorgewählt; „siehe Tipp oben“ ist weg | **Fall B: vorgewählt ist „Ich weiß es noch nicht“** → in der Mappe steht weder Wohngeld noch Grundsicherung, und „Anträge stellen (2)“ sagt nicht, dass da noch etwas fehlt (Bild 06). Knopf in der Karte führt nicht in die Mappe (s. o.). „Drucken oder teilen“ unter dem Hauptknopf druckt das Ergebnis, in der Mappe die Briefe – gleicher Name für zwei Ausdrucke |
| Mappe-Aufbau | 🔴 | 🟢 | Echte Aufgabenliste mit 4 Schritten und Status („fehlt noch“, „offen“, „0 von 13“), Inhalt steckt in der Aufgabe, nur der erste offene Schritt ist auf (Bild 05). 1,7–1,8 Bildschirme statt 7,4–9,0 | Feinschliff: Überschrift „Welchen Weg möchtest du?“ sitzt mit dicker Linie auf dem Rahmen des Kastens (wirkt wie ein Darstellungsfehler, Bild 05/06/11) |
| Empfänger und Suchlink | 🟢 | 🟡 | Anschrift weiter im Brief; ohne sichere Anschrift nur die Art der Stelle („Pflegekasse“) und Suchlink; in der Zeile der Leistung Warnung „Die Anschrift der Stelle fehlt noch“ (gut) | **Hinweis unter dem Suchlink ist länger geworden**: 2 Absätze, 9 Zeilen statt 5. Suchlink-Knopf: blaue Schrift im grünen Rahmen, 3 Zeilen in einer Pille (Bild 09) |
| Amtliche Formular-Links | 🟡 | 🟢 | Formulare stehen jetzt **zuerst** in „Anträge stellen“, je Leistung genau eine Aktion („Amtliches Formular öffnen“ oder „Anschreiben ansehen“) (Bild 07); Hinweise auf Arabisch übersetzt | – |
| Unterlagen | 🔴 | 🟡 | Eine Liste: „Für mehrere Anträge“ + „Zusätzlich für …“, Abstand zwischen den Blöcken, 0 exakte Doppelungen; 13/5/11 Punkte statt 29/27/25 (Bild 08) | **Fast gleiche Punkte zum Einkommen**: Fall A (alles angehakt) 4×: „Nachweise über Einkommen und Vermögen“, „Einkommensnachweise aller Haushaltsmitglieder, meist der letzten 12 Monate“, „Einkommensnachweise der Eltern, meist der letzten 6 Monate“, „Nachweise über dein Einkommen“. Ausweis steht in A/C nur unter Wohngeld |
| Drucken / Teilen | 🟡 | 🟢 | Ein Knopf „Drucken oder teilen“ nur in Schritt 4, Rest unter „Weitere Möglichkeiten“; oben kein „PDF teilen“ mehr (Bild 10) | (Namensgleichheit mit dem Ergebnis-Ausdruck: siehe Übergang) |
| Arabisch (RTL) | (nur Hinweis) | 🟢 | Spiegelung, Status, Haken, Knöpfe korrekt; Formular-Hinweise jetzt arabisch (Bild 11) | Feinschliff: Feld „PLZ und Ort“ zeigt „Nürnberg 90402“ (Zahl wandert nach rechts) |
| Große Schrift (neu angesehen) | – | 🟡 | App-Schalter „Große Schrift“: nichts ragt über den Rand | **Systemschrift 200 % (nachgestellt): Seite wird breiter als der Bildschirm** – Ergebnis 526 px statt 390 (Titel „Wohnberechtigungsschein“, „Grundsicherungsgeld“, „Unterhaltsvorschuss“), Mappe 419 px (Bild 12). Bei ca. 180 % schon 404 px |

Bilanz: 🟢 5 · 🟡 4 · 🔴 1 (vorher 🟢 1 · 🟡 5 · 🔴 2, ohne die zwei neuen Zeilen).

## Messwerte (390×844)

| Fall | Ergebnis Bildschirme vorher → nachher | Wörter Ergebnis | Karten passend | Mappe beim Öffnen vorher → nachher | Mappe alle Schritte offen | Mappe alles angehakt + offen vorher → nachher | Bedienelemente Mappe (Öffnen / alles) vorher → nachher | Unterlagen (Vorauswahl / alles) · exakte Doppelungen |
|---|---|---|---|---|---|---|---|---|
| A | 2,4 → 3,0 | 156 → 217 | 8 | 9,0 → **1,8** | 5,6 | 13,7 → **6,8** | 48 / 72 → **16 / 49** | 13 / 15 · 0 (vorher 29 · 2) |
| B | 2,9 → 3,5 | 232 | 10 | 8,6 → **1,8** | 3,6 | 17,7 → **6,3** | 45 / 72 → **15 / 44** | 5 / 11 · 0 (vorher 27 · 6) |
| C | 2,2 → 2,9 | 212 | 7 | 7,4 → **1,7** | 5,1 | 12,0 → **6,4** | 43 / 66 → **15 / 46** | 11 / 14 · 0 (vorher 25 · 1) |
| A Einfache Sprache | – → 3,2 | 234 | 8 | 9,2 → 1,8 | 5,8 | 7,0 | 16 / 49 | 13 / 15 · 0 |
| C Arabisch | – → 3,2 | 264 | 7 | – → 1,7 | 4,8 | 6,1 | 15 / 46 | 11 / 14 · 0 |
| A große Schrift | – → 5,9 | 217 | 8 | – → 3,1 | 11,0 | 12,2 | 16 / 49 | – |

Weitere Befunde:
- Wörter Mappe beim Öffnen: 110–128 (vorher 761 in Fall A). Karte aufgeklappt: Kindergeld 39 Wörter (vorher 170).
- Tippflächen: alle Knöpfe und Haken-Zeilen ≥ 44 px (0 zu kleine). Skriptfehler: 0 in allen Durchläufen.
- Briefe: geöffnet je etwa 1,1–1,6 Bildschirme, direkt in der Zeile der Leistung. Ohne sichere Anschrift (Fall B: Verhinderungspflege → „Pflegekasse“, Zuzahlungen → Krankenkasse) erscheint das Feld mit Suchlink, nie eine geratene Anschrift. ✓
- Das Ergebnis ist um 0,6–0,7 Bildschirme länger geworden (Weg-Kasten, Kopfsatz). Das ist der Preis für die sichtbare Entweder-oder-Wahl und vertretbar.

## Nicht-grüne Punkte: konkrete kleine Vorschläge

| # | Punkt | Ampel | Vorschlag (Datei / Text) | Aufwand |
|---|---|---|---|---|
| 1 | Knopf „Antrag vorbereiten“ in der Karte ohne Wirkung | 🔴 | `src/app.js` Zeile 943 (Klick-Handler an `#cards`): Die Bedingung `&& !window.SoloMappe` verweist auf einen Klick-Handler der Mappe, den es nicht gibt. Ersetzen durch: `else if (z.closest('[data-antrag]')) { var id = z.closest('[data-antrag]').getAttribute('data-antrag'); if (window.SoloMappe) SoloMappe.oeffnenMit(id); else antragFuer(id); }`. Dazu ein e2e-Test: Karte öffnen → „Antrag vorbereiten“ tippen → `#mappe` sichtbar, Leistung angehakt, „Anträge stellen“ offen | S |
| 2 | Fall B: „Ich weiß es noch nicht“ lässt Wohngeld und Grundsicherung weg, ohne Hinweis | 🟡 | `src/app.js`, Aufbau von „Anträge stellen“ (`aufAntraege`): Ist ein Weg „offen“, oben eine Zeile „Wohngeld oder Grundsicherung im Alter: Weg noch nicht gewählt“ mit Knopf „Weg wählen“ (springt zu `#pick`) und dem Satz „Tipp: Stell den Antrag beim Sozialamt. Es prüft auch, ob Wohngeld besser ist.“ (Satz vorher von Fable fachlich prüfen lassen). Zähler im Titel dann „Anträge stellen (2 + 1 offen)“. Fachliche Vorbelegung bleibt unverändert (#160) | S |
| 3 | Gleicher Name für zwei Ausdrucke | 🟡 (Teil von 2) | `src/app.js` Zeile 1154 (`#ebOpen`): eigener Schlüssel `akt.ergDrucken` = „Ergebnis drucken oder teilen“ in `src/lang/de.json` (und Sprachdateien) statt `akt.drucken` | S |
| 4 | Hinweis unter dem Suchlink zu lang, Knopf eng | 🟡 | `src/app.js` `empfHtml` (Zeile ~1402–1405): `f.empfSucheOrt` und `f.empfHinweis` zu einem Satz zusammenführen, z. B. „Schreib deinen Ort selbst in die Suche und trag die gefundene Anschrift oben ein.“ (Datenschutz-Satz „Die Suche enthält keine Angaben von dir“ in „Mehr dazu“ oder weglassen, falls rechtlich nicht nötig). `src/template.html` Zeile 882: Suchlink-Knopf in `--accent` statt `--papier-link`, Text kürzer: „Anschrift im Internet suchen“ | S |
| 5 | Unterlagen: fast gleiche Einkommens-Punkte | 🟡 | `src/app.js` `U_SACHE` (Zeile 1589): `'s.wohngeld.u2'` und `'s.kiz.u2'` der Sache `einkommen` zuordnen und einen gemeinsamen Text als neuen Schlüssel in `src/lang/de.json`, z. B. „Einkommensnachweise aller im Haushalt (für Wohngeld meist 12 Monate, für Kinderzuschlag 6 Monate)“; vor Umsetzung Fable prüfen (Zeiträume amtlich belegen). Ausweis (`u.ausweis`) in die gemeinsame Liste, wenn ≥ 2 Anträge gewählt | S–M |
| 6 | Große Schrift: Seite breiter als der Bildschirm | 🟡 | `src/template.html` Zeile 1004: `.card header h3 { overflow-wrap: anywhere; }` statt `break-word` (Notumbruch nur, wenn ein Wort nicht in die Zeile passt; bei normaler Schrift keine Änderung). Ebenso `.aufgabe summary` / `.auf-status` in der Mappe `min-width: 0` und `overflow-wrap: anywhere`. Test in `test:e2e`: `html { font-size: 200% }` → `scrollWidth ≤ 390` auf Ergebnis und Mappe | S |

Feinschliff (für Grün nicht nötig):
- `src/template.html` Zeile 920: `.weg-wahl > legend { float: left; width: 100%; border-bottom: 0; padding: 0; margin: 0 0 6px; }` (wie `.hb-karte > legend`), damit die Überschrift im Kasten steht statt auf dem Rahmen.
- Ergebnis: Summe im Weg-Kasten weglassen, wenn sie schon im Kopfsatz steht (`wegeHtml`, `weg.zusammen`).
- Pflegegeld-Karte: Betrag in die Kopfzeile („347 € im Monat · Pflegekasse“).
- Arabisch: Felder `p-strasse`, `p-ort` mit `dir="auto"` (Anschrift bleibt deutsch geschrieben).
- Fall B, Pflegegeld-Karte: Knopf „Höherstufung prüfen“ ragt über den Kartenrand.

## Bilder

| Datei | Zeigt |
|---|---|
| 01-ergebnis-oben-wege-paar.png | Fall C: „Am meisten bringt dir …“, Entweder-oder-Kasten |
| 02-ergebnis-hauptknopf.png | Hauptknopf „Antrag vorbereiten“, darunter „Drucken oder teilen“ |
| 03-karte-aufgeklappt-knopf-ohne-wirkung.png | Kindergeld-Karte offen (39 Wörter) – der Knopf reagiert nicht |
| 04-ergebnis-rentnerin-zwei-wege.png | Fall B: zwei Wege, keine Vorgabe |
| 05-mappe-aufgabenliste.png | Ganze Mappe Fall A beim Öffnen (1,8 Bildschirme) |
| 06-mappe-rentnerin-weiss-nicht.png | Fall B: „Ich weiß es noch nicht“ vorgewählt |
| 07-antraege-formulare-zuerst.png | Anträge: Formulare zuerst, je Zeile eine Aktion |
| 08-unterlagen-eine-liste.png | Unterlagen gruppiert, 13 Punkte |
| 09-empfaenger-suchlink.png | Unbekannte Anschrift: Feld, Suchlink, langer Hinweis |
| 10-abschicken-drucken.png | Schritt 4 mit einem Druckknopf |
| 11-mappe-arabisch.png | Mappe auf Arabisch (RTL) |
| 12-grosse-schrift-200-ueberlauf.png | Systemschrift 200 %: Titel ragt über den Rand |

## Grenzen
- Web-Build statt Store-App (gleiche Oberfläche, nachgeahmte Android-Plugins). Nicht auf echten Geräten, kein Dunkelmodus, keine Tablet-Breite.
- Große Systemschrift über `html { font-size }` nachgestellt; der Android-Textzoom verhält sich ähnlich, aber nicht gleich. Auf einem echten Gerät mit 200 % gegenprüfen.
- Fachliche Vorschläge (Nr. 2 Satz, Nr. 5 Zeiträume) vor Umsetzung von Fable prüfen lassen.

## Kontrolle 22.11.2026

Geprüft auf `origin/claude/test-update-naechstes` c8633115 (nach PR #179), gleiche Fälle A/B/C (dazu Einfache Sprache, Arabisch, große Schrift), 390×844, ein Headless-Chromium, Web-Build. Skriptfehler: 0. Rohdaten: `/home/claude/uxk-bilder/` (nicht im Repo).

### Ampel

| Bereich | Erste Prüfung | Nachprüfung | Kontrolle | Beleg |
|---|---|---|---|---|
| Ergebnisliste | 🟡 | 🟢 | 🟢 | unverändert gut; Nebenknopf heißt jetzt „Ergebnis drucken oder teilen“ |
| Karte (aufgeklappt) | 🟡 | 🔴 | 🟢 | „Antrag vorbereiten“ öffnet die Mappe (echtes Tippen, A Kindergeld, B Wohngeld, B Landespflegegeld, C Kinderzuschlag); Leistung angehakt, bei Entweder-oder wird der passende Weg gewählt (B Wohngeld → Weg „Wohngeld“) |
| Übergang Ergebnis → Mappe | 🟡 | 🟡 | 🟢 | Fall B: „Anträge stellen (2 + 1 offen)“ mit Zeile „Wohngeld oder Grundsicherung im Alter – Weg noch nicht gewählt“, Knopf „Weg wählen“ und Tipp; eindeutige Namen der zwei Ausdrucke |
| Mappe-Aufbau | 🔴 | 🟢 | 🟢 | 1,7–1,8 Bildschirme beim Öffnen; Überschrift „Welchen Weg möchtest du?“ steht jetzt sauber im Kasten |
| Empfänger und Suchlink | 🟢 | 🟡 | 🟢 | Hinweis 1 Satz (3 Zeilen statt 9), Knopf „Anschrift im Internet suchen“ einzeilig, 44 px, Petrol |
| Amtliche Formular-Links | 🟡 | 🟢 | 🟢 | unverändert |
| Unterlagen | 🔴 | 🟡 | 🟢 | Einkommen ein Punkt in „Für mehrere Anträge“ (mit Zeiträumen je Leistung), Ausweis dort ebenfalls; A 11/13, B 5/11, C 10/12 Punkte (Vorauswahl/alles), 0 Doppelungen |
| Drucken / Teilen | 🟡 | 🟢 | 🟢 | ein Knopf in Schritt 4 |
| Arabisch (RTL) | – | 🟢 | 🟢 | „PLZ und Ort“ jetzt links nach rechts („90402 Nürnberg“) |
| Große Schrift | – | 🟡 | 🟢 | Systemschrift 180 % und 200 % (nachgestellt): Ergebnis und Mappe 390 px breit, nichts ragt heraus; lange Titel brechen im Notfall im Wort um |

**Alle 10 Punkte grün.**

### Zahlen (Fall A / B / C)

| Messwert | Erste Prüfung | Nachprüfung | Kontrolle |
|---|---|---|---|
| Ergebnis (Bildschirme) | 2,4 / 2,9 / 2,2 | 3,0 / 3,5 / 2,9 | 2,9 / 3,4 / 2,7 |
| Wörter Ergebnis | 156 / – / – | 217 / 232 / 212 | 209 / 233 / 204 |
| Mappe beim Öffnen (Bildschirme) | 9,0 / 8,6 / 7,4 | 1,8 / 1,8 / 1,7 | 1,8 / 1,8 / 1,7 |
| Mappe alles angehakt und offen | 13,7 / 17,7 / 12,0 | 6,8 / 6,3 / 6,4 | 6,7 / 6,6 / 6,2 |
| Bedienelemente Mappe (Öffnen / alles) | 48/72 · 45/72 · 43/66 | 16/49 · 15/44 · 15/46 | 16/47 · 15/45 · 15/44 |
| Unterlagen (Vorauswahl / alles) | 29 · 27 · 25 | 13/15 · 5/11 · 11/14 | 11/13 · 5/11 · 10/12 |
| Exakte Doppelungen Unterlagen | 2 · 6 · 1 | 0 | 0 |
| Zu kleine Tippflächen (< 44 px) | 0 | 0 | 0 |

### Feinschliff (für Grün nicht nötig)
- Karte „Antrag vorbereiten“ bei Leistungen mit amtlichem Formular (Kindergeld, Wohngeld): Die Mappe öffnet richtig, aber „Anträge stellen“ klappt nicht von selbst auf (bei Anschreiben-Leistungen schon). `src/app.js` `openMappe(mit)`: Der Wähler `[data-ant$="-" + mit]` findet die Formular-Zeilen nicht. Bitte auch diese Zeilen mit `data-ant` versehen oder den Wähler erweitern.
- Einkommens-Punkt in den Unterlagen ist mit gut 30 Wörtern und Klammer in der Klammer lang. Vorschlag: „(z. B. Unterhalt)“ als eigenen Satz oder Zeiträume als Unterzeile.
