# Prüfbögen für ehrenamtliche Muttersprachler

Entwurf, 22.11.2026. Grundlage: `docs/entwuerfe/sprachen/verfahren-fehlerfrei.md` (Branch `claude/b-sprachverfahren`), Schritt 6 „Muttersprachler prüft die kritischen Texte“. An der App wird nichts geändert.

## Zuerst diesen: Kurzbogen

**Helfern zuerst den Kurzbogen `<sprache>-kurz.html` geben.** Der lange Bogen (`<sprache>.html`) ist erst der zweite Schritt.

| | Kurzbogen | Langer Bogen |
|---|---|---|
| Texte je Sprache | 377 | 1 246 (ps, so: 1 103) |
| Inhalt | Fristen/Daten, Beträge (€), Warnungen, Rechtsfolgen (Sperre, Pfändung, Kündigung, Kürzung), Verbote in Handlungsanweisungen („Nichts unterschreiben“), plus alles aus `src/lang/denetz/wichtig.json` | alle Regeln, Teil A und Teil B |
| Gleicher deutscher Text | nur einmal (weitere Schlüssel in der CSV-Spalte `weitere_schluessel_gleicher_text`) | jeder Schlüssel einzeln |
| Pflege-Texte in so/ps | enthalten (Übersetzung aus `../pflege-wartet/`) | fehlen, dafür eigene Pflege-Bögen |
| Aufbau | Deutsch und Übersetzung nebeneinander, darunter Kästchen und Platz für „besser so“ | Tabelle mit 5 Spalten |

**Umfang ehrlich:** Allein `wichtig.json` liefert 278 der 377 Texte; die Texte sind im Schnitt 159 Zeichen lang. Bei großer Schrift ergibt das geschätzt **45–60 Seiten**, nicht 15. Für ca. 15 Seiten müsste man sich auf ca. 100 Texte beschränken (z. B. nur Frist, Datum, Betrag und Rechtsfolge, ohne die übrigen Muster aus `wichtig.json`). Bis dahin: Kurzbogen in Abschnitten verteilen (z. B. Nr. 1–100 pro Termin).

Bei einem Fehler in einem Text, der mehrfach vorkommt, alle Schlüssel aus `weitere_schluessel_gleicher_text` mit korrigieren.

## Bekannte Fehler (beim Erstellen der Bögen gesehen)

| Sprache | Datei | Schlüssel | Deutsch | Übersetzung jetzt | Problem |
|---|---|---|---|---|---|
| ps | `src/lang/ps.json` | `vertrauen` | „Stand: {stand} · nach amtlichen Quellen“ | „تر {stand} پورې · …“ | heißt „bis {stand}“ statt „Stand: {stand}“ (falscher Sinn: klingt wie ein Ablaufdatum). Vorschlag zum Prüfen durch Muttersprachler: „نېټه: {stand}“ wie bei `stand` („د قواعدو نېټه {stand}“). |

## Was liegt hier?

| Datei | Inhalt |
|---|---|
| `<sprache>-kurz.html` | **Kurzbogen** (zuerst diesen), 377 Texte |
| `<sprache>-kurz.csv` | Zuordnungsliste zum Kurzbogen |
| `<sprache>.html` | Druckbarer Bogen (A4, große Schrift) mit den kritischen Texten einer Sprache |
| `<sprache>.csv` | Zuordnungsliste: Nr. → Datei und Schlüssel (Trennzeichen `;`, UTF-8, öffnet in Excel/LibreOffice) |
| `pflege-so.html`, `pflege-ps.html` | Alle 404 Texte der Pflege-Einschätzung in Somali/Paschtu (noch nicht in der App, liegen in `../pflege-wartet/`) |
| `pflege-so.csv`, `pflege-ps.csv` | Zuordnungsliste dazu |

Sprachen in der Reihenfolge der Dringlichkeit: **ps, so, fa-AF, ar, fa, uk, tr, ru, pl, ro, fr, en** (KI-Übersetzung bei Paschtu, Somali, Dari am schwächsten).

Neu erzeugen (z. B. nach Textänderungen): `node tools/pruefboegen.js`. Danach passen die Nummern nicht mehr zu alten, schon verteilten Bögen – Rückläufe immer mit der CSV vom **selben Tag** wie der Bogen einarbeiten (Datum steht oben auf dem Bogen).

## Wie werden die Texte ausgewählt?

Feste Regeln auf den **deutschen** Text (alle Regeln in `tools/pruefboegen.js`, Spalte `regeln` in der CSV zeigt, welche gegriffen hat):

| Teil | Regel | Beispiele für Wörter |
|---|---|---|
| A – besonders wichtig | Betrag | €, Euro, Platzhalter für Beträge |
| A | Datum | 15.03., Monatsnamen, `{datum}`, `{stand}` |
| A | Gesetz | §, SGB, Art., Gesetz |
| A | Frist | Frist, spätestens, innerhalb, rückwirkend, bis zum, abgelaufen |
| A | Zahl mit Zeitraum/Prozent | „3 Monate“, „{n} Tage“, „60 %“ |
| A | Warnung | Warnung, Achtung, Vorsicht, Wichtig, droht |
| A | Rechtsfolge | Sperre, Sanktion, Pfändung, P-Konto, Kündigung, Räumung, Rückforderung, Mahnung, Vollstreckung |
| A | Widerspruch/Bescheid | Widerspruch, Klage, Bescheid, Anhörung |
| A | Ausschluss | „kein Anspruch“, „nur wenn“, „angerechnet“ |
| A | `wichtig` | Texte, die die App schon heute als wichtig führt (`src/lang/denetz/wichtig.json`) |
| B – wichtig | Zahl, Zeitraum, Schulden, Antrag, Handlungsanweisung | Zahlen, Monat/Woche, Antrag, Nachweis, „muss“, „sofort“, Termin |

Nicht aufgenommen: Überschriften, Knöpfe und Feldnamen (Liste „nie“ in `wichtig.json`), außer sie enthalten Zahl, Betrag, Datum oder Gesetz; außerdem `meta.*` und die Suchwörter (`suche/woerter`).

Ergebnis (Stand `claude/test-update-naechstes`, 22.11.2026): 1 246 deutsche Texte, davon Teil A 755 (ca. 16 200 Wörter) und Teil B 491 (ca. 6 300 Wörter). In ps und so fehlen 143 Pflege-Texte im Hauptbogen – dafür gibt es die eigenen Pflege-Bögen.

**Hinweis:** Das ist mehr als die Schätzung „ca. 350 Texte“ im Verfahrenspapier. Darum steht Teil A vorn. Wer wenig Zeit hat, prüft nur Teil A; Teil B ist der zweite Durchgang.

## So gibt man die Bögen an Helfer

1. **Passende Person finden**: Muttersprachler, die auch gut Deutsch lesen (Wege: AWO-Sprachmittlerpool, ZAB Nürnberg, Migrationsberatung, Studierende – siehe Verfahrenspapier, Abschnitt 1.2). Technik- oder Rechtswissen ist nicht nötig.
2. **Bogen ausdrucken** (zuerst den Kurzbogen): Datei im Browser öffnen → Drucken → A4, Hochformat, „Hintergrundgrafiken“ einschalten (sonst fehlen die Markierungen). Die Bögen sind lang (Teil A allein ca. 60–80 Seiten); lieber in Abschnitte aufteilen (z. B. Nr. 1–150 pro Termin) oder als PDF am Tablet ausfüllen lassen.
3. **Kurz erklären** (oben auf dem Bogen steht die Anleitung auf Deutsch und in der Zielsprache):
   - links Deutsch, rechts die Übersetzung,
   - je Zeile „stimmt“ oder „stimmt nicht“ ankreuzen,
   - bei Fehlern den besseren Text in „besser so“ schreiben,
   - gelb markierte Stellen wie `{n}` füllt die App später aus – stehen lassen. Unter dem deutschen Text steht ein Beispielwert.
4. **Wichtig sagen**: Bei Zahlen, Beträgen, Daten und Fristen genau hinsehen. Lieber „stimmt nicht“ und eine Frage notieren als unsicher „stimmt“ ankreuzen.
5. Pflege-Bögen (so, ps): Die Antwortstufen (★, grau) stehen am Anfang. Sie müssen klar von „leicht“ nach „schwer“ gehen, sonst stimmt die Einschätzung nicht.
6. Keine persönlichen Daten nötig; „Name“ oben ist freiwillig (nur für Rückfragen).

Die Anleitungssätze in den Zielsprachen wurden maschinell erstellt. Verbindlich ist der deutsche Satz; Helfer dürfen auch die Anleitung verbessern.

## Rückläufe einarbeiten

1. Ausgefüllten Bogen (Papier, Foto, Scan) annehmen, Datum des Bogens notieren.
2. Die CSV des Bogens vom gleichen Stand öffnen (z. B. `ps-kurz.csv` oder `ps.csv`). In Spalte `ergebnis` „ok“ oder „falsch“ eintragen, in `besser_so` den Vorschlag abtippen.
3. Jede Zeile mit „falsch“: Nr. → Spalten `datei` und `schluessel` zeigen, wo der Text steht (z. B. `src/lang/fristen/ps.json`, Schlüssel `fri.rest.tage`). Bei Pflege so/ps steht dort `docs/entwuerfe/sprachen/pflege-wartet/<sprache>.json`.
4. Vorschlag prüfen, bevor er in die App kommt:
   - Platzhalter `{…}` alle noch da und unverändert?
   - Zahlen, Beträge, Daten gleich wie im Deutschen?
   - Begriff passt zum Glossar (`docs/entwuerfe/sprachen/glossar-korrekturen.md`)? Sonst Glossar mitändern, damit derselbe Begriff überall gleich ist.
   - Bei Zweifel zweite Person der Sprache fragen.
5. Änderung in einem eigenen Branch eintragen, Tests laufen lassen, die ausgefüllte CSV als Nachweis unter `docs/entwuerfe/sprachen/rueck-<datum>-<sprache>.csv` ablegen (ohne Namen der Helfer).
6. Danach Bögen neu erzeugen; bereits geprüfte Zeilen können beim nächsten Durchgang weggelassen werden (Abgleich über `schluessel` + `deutsch`).
