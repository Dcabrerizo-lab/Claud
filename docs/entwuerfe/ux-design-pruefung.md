# SoLo – Design-Prüfung (Brand, UI, Informationsdesign)

Stand: 20.11.2026 · Arbeitskopie `/home/claude/wt-uxpruef` (Commit f28dc1a) · nur Prüfung, kein Code geändert.

## Grundlage und Grenzen

| Was | Wie geprüft |
|---|---|
| Bildschirmfotos | 46 von 134 angesehen (Start, Leistungs-Check, Ergebnis, Wohngeld-Karte, Antragsmappe, Ergebnisblatt, Brief prüfen ×6, Pflege ×3, Geld sparen, Pfändung ×3, Haushaltsplan ×3, Schulden, Ich ziehe aus ×2, Mein Ordner ×2, Einstellungen ×3) |
| Farben | `docs/FARBEN.md`, `:root` in `src/template.html`, `tools/kontrast-pruefen.js --tabelle` (48 Paare, alle bestanden) |
| Farbfehlsichtigkeit | eigene Simulation (Machado 2009, volle Protanopie/Deuteranopie, Abstand ΔE76 in Lab). Näherung, kein Test mit Betroffenen |
| Vorbilder | GOV.UK Design System, KERN (Deutschland), Material Design – nur abgerufene Seiten, Links in Abschnitt 4 |

**Nicht geprüft werden konnte:**
- **Dunkelmodus:** kein einziges dunkles Bildschirmfoto vorhanden. Urteil nur aus den Variablen.
- **Rechts-nach-links und andere Sprachen:** alle Fotos sind Deutsch. Urteil nur aus dem CSS.
- **Schriften:** Die Fotos zeigen nicht Nunito / Atkinson Hyperlegible, sondern die Ersatzschrift (in `src/template.html` gibt es kein `@font-face`; die Schriften kommen erst über `scripts/build-app.js` in die App). Die Wirkung der echten Schriften ist also nicht beurteilt.
- **Banking- und Steuer-Apps als Vorbild:** dazu habe ich keine belegbare Quelle abgerufen und nenne deshalb keine.

---

## (a) Kurzurteil

Noten wie in der Schule (1 = sehr gut, 6 = ungenügend).

| Bereich | Note | Ein Satz |
|---|---|---|
| Passung zur Zielgruppe (Würde, Ton) | 2 | Warm, respektvoll, kein Mitleid, kein Amtsgrau. |
| Kontrast, Lesbarkeit der Farben | 1–2 | Alle Paare geprüft und bestanden; das ist selten so sauber. |
| Kernbotschaft und Vertrauen | 3 | „Wir helfen dir“ kommt an. „Geprüft, unabhängig, kein Amt“ kommt zu wenig an. |
| Visuelle Hierarchie | 3–4 | Das Wichtigste (Frist, nächster Schritt) ist oft leiser als Nebensachen. |
| Farbsystem | 3–4 | Zu viele gleich laute Farben; Signalfarben und Bereichsfarben überschneiden sich. |
| Typografie | 3 | Gute Grundgröße, aber rund 35 Schriftgrößen, viel Kleingedrucktes, Worttrennung in Überschriften. |
| Symbole | 3 | Linienstil stimmig, aber Emoji daneben, doppelte Symbole, ein kulturell heikles. |
| Abstände, Formen, Konsistenz | 3 | Zwei Feld-Stile, vier Knopf-Stile, elf Eckenradien, Karten in Karten. |
| Logo | 3+ | Freundlich und sauber, aber austauschbar (wirkt wie Chat-App). |
| Dunkelmodus | ohne Note | Variablen solide, aber nicht gesehen. |
| Rechts-nach-links | ohne Note | Ansätze da, nicht gesehen. |

**Gesamt: 3+ (befriedigend bis gut).** Das Fundament (Ton, Kontrast, Datenschutz-Hinweise) ist überdurchschnittlich. Die Schwäche ist nicht „hässlich“, sondern „zu vieles ist gleich wichtig“. Für gestresste Menschen ist das die entscheidende Stelle.

---

## 1. Passt das Design zur Zielgruppe?

| Kriterium | Urteil | Begründung |
|---|---|---|
| Würde, kein Stigma | gut | „Schön, dass du da bist.“, „Was bleibt dir?“, keine Bilder von Not, kein Rot-Alarm auf der Startseite. |
| Amtlich oder warm | zu einseitig warm | Creme, runde Kacheln, Pillen-Knöpfe wirken freundlich, aber wenig „geprüft“. Quelle und Stand stehen nur klein und tief in den Details. |
| Lesbarkeit | mittel | Fließtext gut. Wichtige Vorbehalte (z. B. „Frist im Brief selbst nachlesen“, „Anschrift vor dem Absenden prüfen“) stehen in der kleinsten grauen Schrift (0,85 em). |
| Ältere, Sehschwäche | mittel | Tippflächen groß, „Große Schrift“ vorhanden. Aber: blasse Feldränder in „Brief prüfen“ und „Mein Ordner“ (sichtbar hell; `--line` hat nur 1,2:1 zur Karte), native Auswahllisten, viel Kleintext. |
| Farbfehlsichtigkeit | mittel | Farbe ist nie allein Träger (gut). Aber mehrere Kachelfarben fallen zusammen, siehe Tabelle unten. |
| Kulturelle Wirkung | meist unkritisch, ein Risiko | Farben: keine problematische Belegung erkennbar. Symbol **Sparschwein** bei „Geld sparen“: Für viele muslimisch geprägte Nutzer (arabisch, persisch, türkisch, somalisch, Dari, Paschtu) ist das Schwein ein unpassendes Bild. Das ist meine fachliche Einschätzung, kein Testergebnis. |
| Rechts-nach-links | unvollständig | Nur 4 Spiegel-Regeln im CSS. Pfeile als Textzeichen („←“, „➜“, „▾“) spiegeln nicht von selbst. Überschriften haben Zeilenhöhe 1,2 – für arabische Schrift zu eng. Nunito hat keine arabischen und kyrillischen Zeichen, dort greift die Systemschrift (in Ordnung, aber ungeprüft). |

**Farbfehlsichtigkeit – Farben, die fast gleich aussehen** (ΔE unter etwa 10 = schwer unterscheidbar):

| Sicht | Paar | Abstand |
|---|---|---|
| Rot-Schwäche (Protanopie) | Ziegel `--c-briefe` ↔ Grün `--c-sparen` | 4,3 |
| Grün-Schwäche (Deuteranopie) | Pflaume `--c-pfaendung` ↔ Schiefer `--c-formular` | 3,9 |
| Grün-Schwäche | Blau `--c-pflege` ↔ Violett `--c-ausziehen` | 7,1 |
| normale Sicht | Violett `--c-ausziehen` ↔ Indigo `--c-sozialamt` | 10,0 |
| alle | Ziegel ↔ `--bad` ↔ `--focus` | 4 bis 11 |

Dazu: Alle zehn Kachelfarben haben fast dieselbe Helligkeit (L* 33 bis 42). Bei schwachem Sehen, in der Sonne oder in Graustufen sind alle Kacheln ein und dasselbe Dunkel. Unterschieden wird dann nur über Symbol und Text – das funktioniert, aber die vielen Farben leisten dann nichts mehr.

---

## 2. Was soll die App vermitteln – und tut sie das?

**Vorschlag Kernbotschaft:** „Dir steht etwas zu. Wir zeigen dir Schritt für Schritt, was – und was du heute tun kannst.“

**Markenwerte:** auf Augenhöhe · verlässlich (jede Zahl mit Quelle) · klar (ein Schritt nach dem anderen) · privat (alles bleibt auf dem Gerät).

| Gewünschte Wirkung | Wo es gelingt | Wo es kippt |
|---|---|---|
| Erleichterung | Begrüßung; Pfändungs-Ergebnis als ganzer Satz („Von 2.100 € darf nichts gepfändet werden.“) – vorbildlich | Leistungs-Check: langes Formular mit „Beispiel laden“, „Alle Angaben löschen“ und Löschliste **vor** der ersten Frage |
| Zuversicht, „ich schaffe das“ | Kasten „Das tust du jetzt“ mit nummerierten Schritten; Pflege-Einschätzung mit einer Frage pro Bildschirm | Ergebnis „Zwei Wege“: Rahmen in Rahmen in Rahmen, viel Text, bevor eine einzige Leistung sichtbar ist |
| Handeln vor Fristen | Fristen-Erinnerung in den Einstellungen | Die erkannte Frist im Brief steht als kleine fette Zeile ohne jede Auszeichnung zwischen Kleintext. Das ist die wichtigste Information der ganzen App und optisch die unauffälligste. |
| Vertrauen | „Alles bleibt auf diesem Gerät“; Quelle mit Datum bei Anschriften | Ein nützlicher Tipp („Wohngeld und Kinderzuschlag lassen sich kombinieren“) erscheint in Rot auf Rosa mit ⓘ – das liest sich wie eine Fehlermeldung. Kamera-/Papier-Emoji auf Knöpfen wirken verspielt. |
| Ernst genommen werden | Sprache durchweg respektvoll | „Finger weg!“ (Ich ziehe aus) ist als einzige Stelle bevormundend im Ton |

**Misstrauens-Risiko:** bezahlte App eines Privatanbieters, duzt, sieht nicht amtlich aus. Das ist richtig so (kein Amt vortäuschen), braucht aber einen festen, sichtbaren Vertrauensanker: „Unabhängig · kein Amt · Zahlen Stand MM/JJJJ · amtliche Quellen“.

---

## 3. Gestaltung im Einzelnen

### (b) Stärken

1. **Ton und Haltung:** warm, ohne zu verniedlichen. Creme `--bg` #fffaf3 statt kaltem Weiß nimmt Amtsangst.
2. **Kontrast als System:** eine Stelle für alle Farben, automatischer Test in `npm test`. Alle 48 Paare mindestens 4,5:1.
3. **Farbe nie allein:** Einstufung immer als Wort plus Zeichen („✓ Wahrscheinlich“, „~ Möglich“). Entspricht der Forderung von GOV.UK.
4. **Ergebnis als Satz mit Zahl** (Pfändung) und **„Das tust du jetzt“** – genau die richtige Reihenfolge: Antwort, dann Handlung.
5. **Papier-Metapher** in der Antragsmappe (weißes Blatt, Serifenschrift): Man erkennt sofort „das ist der Brief, der rausgeht“.
6. **Datenschutz sichtbar an der richtigen Stelle** (bei Scan, PIN, Ordner).
7. **Untere Leiste** mit drei klaren Zielen, große Tippflächen (44 px und mehr), Schalter „Große Schrift“ und „Einfache Sprache“.
8. **Linien-Symbole** in einheitlicher Strichstärke auf Kacheln und in Listen.

### (c) Probleme nach Schwere

**Schwer (beeinträchtigt Verstehen oder Handeln)**

| Nr. | Problem | Beleg |
|---|---|---|
| S1 | **Frist ohne Gewicht.** Die erkannte Frist ist kleiner und leiser als jeder Tipp-Kasten. | `11-brief-an-gelesen-s2.png` |
| S2 | **Signalfarben sind keine Signale mehr.** `--hint` ist exakt dieselbe Farbe wie `--c-briefe` (Ziegel #a14a2f). `--bad` (#9a3b26) und `--focus` (#b4472a) liegen direkt daneben. Ziegel bedeutet also gleichzeitig: Bereich Briefe, Heizen, „Achtung“, Tipp, Fehler, Löschen, Fokus. | FARBEN.md, `:root`; `05-karte-wohngeld-s1.png` (Tipp sieht aus wie Fehler) |
| S3 | **„Wahrscheinlich“ sieht aus wie ein Knopf.** `--ok` = `--accent` = Petrol, und Einstufung wie Knöpfe haben Pillenform. Die Plakette steht neben unterstrichenen Links und direkt über dem ähnlich geformten Knopf „Reicht der Pflegegrad noch?“. | `04-ergebnis-s1.png`, `04-ergebnis-s4.png` |
| S4 | **Ergebnisblatt unlesbar:** fünf Spalten auf 390 px, Wörter brechen buchstabenweise („Le-is-tu-ng“, „Näc-hs-ter Sch-ritt“). | `08-ergebnisblatt.png` (Vorschau; Ausdruck auf A4 nicht geprüft) |
| S5 | **Zwei Feld-Stile.** Leistungs-Check und Haushaltsplan: kräftiger Rand (`--field`, 3,8:1). Brief prüfen und Mein Ordner: fast unsichtbarer Rand. Für Sehschwache sind die blassen Felder kaum zu finden. | `12-brief-jc-selbst-s2.png`, `81-ordner-alle.png` gegen `50-haushalt-plan.png` |

**Mittel (kostet Klarheit und Vertrauen)**

| Nr. | Problem | Beleg |
|---|---|---|
| M1 | **Zu viele gleich laute Farben.** 10 Flächenfarben, alle gleich dunkel und gleich satt. Die Startseite hat keinen ruhigen Punkt; die Hauptkarte unterscheidet sich nur durch Größe. | `01-start.png`, `01-briefe.png`, `01-ausziehen.png` |
| M2 | **Zwei Regeln widersprechen sich.** „Dieselbe Sache hat überall dieselbe Farbe“ gegen „keine Farbe doppelt in einer Gruppe“. Folge: Farben werden nach Verfügbarkeit vergeben. „Mein Konto“ ist Meerblau (= Wohngeld = Strom), „Versicherungen“ ist Pflege-Blau, die Schulden-Liste ist Grün, „Hilfen“ ist Leistungen-Petrol. Farbe trägt unterhalb der Startseite keine verlässliche Bedeutung mehr. | FARBEN.md „Gruppenfarben“ |
| M3 | **Zwei Muster für dieselbe Ebene.** Unterauswahl mal als bunte Kacheln (Briefe, Ich ziehe aus), mal als weiße Listenkarten mit rundem Symbol (Pflege, Geld sparen, Pfändung). | `01-briefe.png` gegen `01-sparen.png` |
| M4 | **Vier Knopf-Stile** ohne klare Rangfolge: gefüllt Petrol, Petrol-Rand, weiße Pille mit Schatten, weiße Pille mit hellem Rand. Dazu Textlinks in Petrol fett und unterstrichene Links. | `07-antragsmappe.png`, `10-brief-jc.png`, `60-schulden.png` |
| M5 | **Emoji neben Linien-Symbolen** (📷 📄 📋 ✏️). Emoji sehen auf jedem Gerät anders aus, passen nicht zum Strichstil und wirken unseriös. | `10-brief-jc.png`, `13-brief-pk.png` |
| M6 | **Kleingedrucktes trägt Wichtiges.** 0,85 em grau (etwa 13,6 px) für Rechts- und Prüfhinweise; insgesamt rund 35 verschiedene Schriftgrößen im CSS. | CSS-Auszählung |
| M7 | **Worttrennung an sichtbaren Stellen:** „Grundsi-cherungsgeld“ in der Überschrift, „Wahrschein-lich“ in der Plakette, „Höherstu-fung“ im Knopf, „Versicherung|en“ auf der Kachel ohne Trennstrich. | `10-brief-jc.png`, `04-ergebnis-s1.png`, `01-ausziehen.png` |
| M8 | **Karten in Karten in Rahmen** (bis drei Ebenen) – Textspalte wird schmal, Ränder konkurrieren. Elf verschiedene Eckenradien; die Karten in „Brief prüfen“ sind eckig, alle anderen rund. | `04-ergebnis-s1.png`, `10-brief-jc.png` |
| M9 | **Symbole doppelt oder unklar:** Jobcenter und Wohngeldstelle haben dasselbe Haus; Herz in drei Bedeutungen (Pflege, Pflegekasse, Hilfen); „~“ für „Möglich“ ist kein allgemein bekanntes Zeichen; Sparschwein siehe oben. | `01-briefe.png`, `04-ergebnis-s4.png` |
| M10 | **Empfänger-Kasten steht zwischen zwei Briefen** und sieht aus wie eine Warnung (gestrichelt, Bernstein). Auf dem Foto steht unter dem Antrag „Bildung und Teilhabe“ die Anschrift des Landesamts für Pflege – vermutlich gehört sie zum nächsten Brief. Die Zuordnung ist optisch nicht eindeutig. Bitte prüfen. | `07-antragsmappe-s3.png` |

**Leicht**

| Nr. | Problem |
|---|---|
| L1 | Logo: Sprechblase mit Haken ist freundlich, aber ein Allerweltszeichen (Chat, Aufgabenliste). Koralle `--coral` #ff7a59 kommt nur im Logo vor, nirgends in der Oberfläche. |
| L2 | Name „SoLo“ liest sich in vielen Sprachen als „allein“. Das kann passen („du schaffst das selbst“), kann aber auch einsam wirken. Der Untertitel ist sehr klein. |
| L3 | Feste Leiste unten plus Ergebnis-Leiste belegen im Leistungs-Check etwa ein Fünftel des Bildschirms. |
| L4 | Dunkelmodus (nur gerechnet): Farbkacheln heben sich vom dunklen Hintergrund nur mit 2,1 bis 3,0:1 ab (Blau 2,1; Violett 2,2; Pflaume 2,2). Weiße Schrift bleibt lesbar, aber die Kachelform verschwimmt. `--focus`, `--hint` und `--c-briefe-t` sind im Dunkeln dieselbe Farbe #ffb398. |
| L5 | „Finger weg!“ als Überschrift – Ton prüfen. |

---

## 4. Vergleich mit Vorbildern (nur belegte Punkte)

| Vorbild | Was es vorgibt | SoLo heute | Quelle |
|---|---|---|---|
| GOV.UK – Fragen | Eine Frage pro Seite hilft Nutzern zu verstehen, was verlangt wird. Oben immer ein Zurück-Link. „Weiter“-Knopf links ausgerichtet. | Pflege-Einschätzung macht es so. Leistungs-Check und Brief prüfen sind lange Formulare. | https://design-system.service.gov.uk/patterns/question-pages |
| GOV.UK – Farbe | Wenige Funktionsfarben mit je einem Zweck (Text, Link, Fokus, Fehler, Erfolg). Die Fokusfarbe wird nur für den Fokus benutzt. Kontrast nach WCAG 2.2 AA. | Kontrast erfüllt. Fokusfarbe liegt neben Fehler- und Bereichsfarbe. | https://design-system.service.gov.uk/styles/colour |
| GOV.UK – Plaketten | Farbe nie allein. Plaketten nicht wie Links oder Knöpfe gestalten, weil Nutzer sie sonst für bedienbar halten bzw. nicht einordnen können. Mit möglichst wenigen Zuständen beginnen. Rot für Dringendes. | Wort plus Zeichen: erfüllt. Plakette sieht aus wie Knopf: nicht erfüllt. | https://design-system.service.gov.uk/components/tag/ |
| GOV.UK – Warnung | Eigenes, festes Muster nur für wirklich Wichtiges (Folgen von Handeln oder Nichthandeln): Ausrufezeichen-Symbol plus fetter Text. | Frist hat kein solches Muster; Tipps sehen wie Warnungen aus. | https://design-system.service.gov.uk/components/warning-text |
| GOV.UK – Schrift | Fließtext 19 px auch auf kleinen Bildschirmen, kleinste Stufe 16 px, nur sieben Größen (zwei davon für Ausnahmen). | Fließtext 16 px, Kleintext etwa 13,6 px, rund 35 Größen. | https://design-system.service.gov.uk/styles/type-scale/ |
| KERN (Design-System der deutschen Verwaltung) | Text bis 24 px: 4,5:1. Grafiken und Bedienelemente: 3:1. Fokus: 3:1. Text muss sich auf 200 % vergrößern lassen, Seite auf 320 px Breite nutzbar. | Text erfüllt. Blasse Feldränder und Kachelkanten im Dunkelmodus unter 3:1. 200 % nicht geprüft. | https://www.designsystem.gov.de/design-system/barrierefreiheit |
| Material Design – Rechts-nach-links | Zurück- und Vor-Pfeile sind die wichtigsten Symbole zum Spiegeln. Fortschrittsbalken läuft von rechts nach links. Uhren, Zahlen und Medien-Knöpfe nicht spiegeln. | 4 Spiegel-Regeln vorhanden; Text-Pfeile und Fortschrittsbalken ungeprüft. | https://m1.material.io/usability/bidirectionality.html |

---

## (d) Konkrete Empfehlungen

### D1 Farbrollen trennen (löst S2, S3, M1, M2)

| Rolle | Heute | Empfehlung |
|---|---|---|
| Bedienen (Knöpfe, Links, Auswahl) | `--accent` Petrol | bleibt. Petrol heißt ab jetzt nur noch „hier kannst du tippen“. |
| Wahrscheinlich | `--ok` = Petrol | eigener Ton, z. B. das vorhandene Grün #2f6b3a auf hellem Grün (#2f6b3a auf #e3f1e4 ergibt gerechnet 5,5:1). Und: Plakette **eckig** (Radius 6 px) statt Pille, damit sie nicht wie ein Knopf aussieht. |
| Tipp, persönlicher Hinweis | `--hint` = Ziegel auf Rosa | neutral-freundlich: Fläche `--accent-soft` oder `--na-bg`, Schrift `--ink` (12:1). Kein Rot-Ton. |
| Frist, Fehler, „fehlt“, Löschen | `--bad` | bleibt und wird die **einzige** Verwendung der Rot-Familie außerhalb der Brief-Kachel. |
| Fokus | `--focus` #b4472a | deutlich von Rot absetzen, z. B. doppelter Ring aus `--ink` und `--surface`. Nur für Fokus verwenden. |
| Bereichsfarben | 10 Flächenfarben | nur auf der **Startseite** als Fläche (nach dem Umbau 5: Petrol, Ziegel, Pflaume, Blau, Violett). Darunter erbt jede Seite die Farbe ihres Bereichs für Symbolkreise; unterschieden wird über Symbol und Text. Damit entfallen Indigo, Meerblau, Beere und Schiefer als Flächen. |

Neue Werte immer mit `node tools/kontrast-pruefen.js` prüfen.

**Achtung, Weichenstellung:** Das hebt die Regel „keine Farbe doppelt in einer Gruppe“ (Nutzer, 20.11.2026) unterhalb der Startseite auf. Die Regel erzeugt Buntheit ohne Bedeutung und widerspricht „dieselbe Sache, dieselbe Farbe“. Das muss der Nutzer entscheiden. Mittelweg: Regel nur für die Startseite behalten.

### D2 Ein festes Muster „Frist“ (löst S1)

- Eigener Baustein, immer ganz oben im Ergebnis: Fläche `--bad-bg`, Balken 4 px `--bad` an `border-inline-start`, Kalender-Symbol, Datum oder Dauer in `--font-display` 1,25 rem, darunter ein Satz in `--ink`: „Bis … Widerspruch einlegen.“
- Unsichere Erkennung bleibt als „möglich“ gekennzeichnet (Vorgabe aus CLAUDE.md), aber in normaler Schriftgröße, nicht im Kleintext.
- Dieselbe Optik in Mein Ordner und in der Erinnerung beim Öffnen.

### D3 Schrift (löst M6, M7, S4)

- Sechs Stufen statt 35: 0,875 rem (nur Zusatzangaben wie Datum) · 1 · 1,125 · 1,25 · 1,5 · 1,75 rem.
- Grundschrift auf 17 bis 18 px anheben; Prüf- und Rechtshinweise mindestens 1 rem.
- In Überschriften, Knöpfen, Plaketten und Kacheln keine automatische Worttrennung (`hyphens: manual`); lange Wörter gezielt mit weichem Trennzeichen versehen.
- Ergebnisblatt auf dem Handy als gestapelte Karten je Leistung, Tabelle nur im Druck.
- Für arabische Schrift (`[lang=ar]`, `fa`, `ps`): Zeilenhöhe der Überschriften etwa 1,4 statt 1,2.

### D4 Formulare, Knöpfe, Karten (löst S5, M3, M4, M8)

| Baustein | Regel |
|---|---|
| Eingabefeld | überall Rand in `--field`, 2 px, Radius 12 px, Höhe mindestens 48 px. Blasse Variante entfernen. |
| Knöpfe | drei Ränge: Hauptknopf (Fläche `--accent`, höchstens einer pro Bildschirm) · Nebenknopf (Rand `--accent`) · Textlink. Weiße Schatten-Pillen nur noch für Auswahl-Chips („Beispiel laden“). |
| Unterauswahl | ein Muster: weiße Listenkarte mit Symbolkreis (wie Pflege, Geld sparen). Farbkacheln nur auf der Startseite. |
| Karten | höchstens eine Verschachtelung. Radien als feste Stufen: 8 / 14 / 24 px / Pille. Karten in „Brief prüfen“ angleichen. |
| Hinweis-Kästen | drei Sorten mit festem Aussehen: Tipp (neutral), Achtung (`--warn`), Frist/Fehler (`--bad`). |

### D5 Symbole (löst M5, M9)

- Emoji auf Knöpfen durch Linien-Symbole aus demselben Satz ersetzen (Kamera, Blatt, Zwischenablage, Stift).
- Sparschwein ersetzen durch Münze, Geldbörse oder Münzstapel.
- Jobcenter und Wohngeldstelle unterscheidbar machen (z. B. Person mit Aktentasche / Haus mit Euro).
- „~“ bei „Möglich“ durch „?“ oder halb gefüllten Kreis ersetzen.
- Pfeile als Symbol statt als Textzeichen, damit `[dir="rtl"]` sie spiegeln kann.

### D6 Vertrauen und Marke (löst L1, L2)

- Eine feste Zeile auf der Startseite und im Ergebnis: „Unabhängig · kein Amt · deine Angaben bleiben auf dem Gerät · Zahlen Stand MM/JJJJ“.
- Ein einheitlicher Baustein „Quelle · Stand“ unter jeder Zahl (heute je Seite anders gesetzt).
- Koralle `--coral` entweder bewusst als Marken-Akzent nutzen (z. B. der Haken bei „geschafft“) oder aus den Variablen streichen. Nicht als Warnfarbe.
- Logo behalten. Untertitel „Sozialleistungslotse“ auf der Startseite größer, damit „SoLo“ erklärt ist.

### D7 Dunkelmodus und Sprachen (löst L4, RTL)

- Bildschirmfotos im Dunkelmodus und in Arabisch, Persisch, Ukrainisch, Türkisch nachziehen (je etwa 10 Kernseiten) – ohne sie bleibt beides ungeprüft.
- Farbkacheln im Dunkeln mit 1 px Kante (`--line`) versehen oder leicht aufhellen, bis 3:1 zum Hintergrund erreicht ist.
- `--focus`, `--hint`, `--c-briefe-t` im Dunkeln auseinanderziehen.

---

## (e) Die 5 wichtigsten Änderungen

| Rang | Änderung | Wirkung | Aufwand |
|---|---|---|---|
| 1 | **Frist als eigenes, lautes Muster** ganz oben (D2) | Handeln vor Fristablauf; größter Nutzen für die Zielgruppe | klein |
| 2 | **Farbrollen trennen:** Tipp nicht mehr rot, „Wahrscheinlich“ nicht mehr Knopf-Petrol und eckig, Fokus eigene Farbe (D1) | weniger Fehlalarm, weniger Fehltipps, mehr Vertrauen | mittel |
| 3 | **Farbkacheln nur auf der Startseite**, darunter weiße Listenkarten in der Bereichsfarbe (D1, D4) – braucht Entscheidung zur Regel „keine Farbe doppelt“ | Ruhe, klare Orientierung, besser bei Farbfehlsichtigkeit | mittel |
| 4 | **Ein Feld-Stil, drei Knopf-Ränge, Emoji raus** (D4, D5) | Sehschwache finden Felder; App wirkt geprüft statt gebastelt | klein bis mittel |
| 5 | **Schrift:** sechs Stufen, Hinweise mindestens 1 rem, keine Worttrennung in Überschriften und Plaketten, Ergebnisblatt mobil als Karten (D3) | Lesbarkeit für Ältere und für Menschen mit wenig Deutsch | mittel |

Danach: Sparschwein ersetzen, Vertrauenszeile, Fotos für Dunkelmodus und Rechts-nach-links-Sprachen.
