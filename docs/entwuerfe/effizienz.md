# SoLo – Effizienzprüfung: Daten, Prüfungen, Tests

Stand: 21.11.2026, geprüft am Zweig `claude/test-update-1.9` (Commit 554fd8c). Nur geprüft, nichts geändert.
Messwerte stammen aus den GitHub-Läufen vom 19.–21.11.2026 (300 Läufe), aus lokalen Zeitmessungen und aus der Git-Historie (725 Commits).
Zeitersparnis ist jeweils **geschätzt**. Kennzeichnung: **S** = sofort sicher umsetzbar · **U** = größerer Umbau (nächstes Update).

## Das Wichtigste in 5 Sätzen

1. Die Rechentests sind **nicht** das Problem: alle 46 Regeltests zusammen brauchen auf GitHub 49 Sekunden (Raster mit 60.000 Haushalten: 11 Sekunden). Dort kürzen bringt nichts.
2. Die Bremse ist der Block „Oberflächentests“: 31 Tests laufen **nacheinander** und brauchen 6 Min 47 s. Deshalb dauert jeder PR-Check 8,5 bis 9 Minuten statt etwa 4.
3. 46 von 205 CI-Läufen waren rot (22 %). Mindestens 20 davon hätte ein 1-Minuten-Test vor dem Push verhindert (Buchhaltungs-Wächter wie „Testmarke fehlt in der Prüfliste“).
4. Die Vergleiche mit den amtlichen Rechnern starten bei jedem Zusammenführen neu: 16 Läufe, 417 Minuten an einem Tag, davon 9 reine Wiederholungen derselben Abfragen bei den Behörden-Rechnern.
5. Die größten Konflikt-Dateien sind `src/app.js` (97 Commits in 3 Tagen), `docs/PRUEFLISTE.md` (88), die 13 Sprachdateien (je 78) und die Testliste in `package.json` (49). Das ist eine Frage der Datei-Struktur, nicht der Sorgfalt.

## Top 10 nach Nutzen

| # | Maßnahme | Art | Ersparnis (geschätzt) | Fehler-Risiko | Aufwand |
|---|---|---|---|---|---|
| 1 | Oberflächentests parallel laufen lassen | S | 5 Min je PR-Check (9 → 4 Min) | gleich | 1–2 Std. |
| 2 | Pflicht-Schnelltest vor jedem Push (1 Min) | S | ca. 20 rote Läufe in 2 Tagen, je 5–15 Min Rücklauf | sinkt | 30 Min |
| 3 | Amtliche Vergleiche nicht bei Merges neu starten | S | ca. 250 Rechner-Minuten je Tag, weniger Last auf Behörden-Rechnern | gleich | 20 Min |
| 4 | Ein Zahlen-Test für alle Sprachordner (statt 5 Kopien) | S | schließt Lücke in 4 Ordnern; neue Bereiche ohne Mehrarbeit | sinkt | 1 Std. |
| 5 | Rechenplan zuerst prüfen, dann bauen; Referenz unabhängig | S (Regel) | weniger Rückläufer (23 Korrektur-Commits, 4 rote Läufe in einem PR) | sinkt | Arbeitsregel |
| 6 | Prüfliste und Änderungsliste in kleine Dateien teilen | U (klein) | Konflikte in den 2 meistgeänderten Doku-Dateien entfallen | gleich | 1–2 Std. |
| 7 | Feste Euro-Beträge in Texten durch Platzhalter ersetzen | U | Jahreswechsel: 0 statt ca. 300 Text-Änderungen | sinkt | 3–4 Std. |
| 8 | Werte mit „gültig ab/bis“ und Quelle als Daten | U | Jahreswechsel wird reine Datenpflege, Quellen prüfbar | sinkt | 1 Tag |
| 9 | Mutationstest: „Killer-Test zuerst“ | S | 22 → ca. 6 Min je Teil (längster Teil der schweren Tests) | gleich | 1–2 Std. |
| 10 | Zufalls-Klicktest: feste Besuche als eigener kurzer Test | S | ca. 7 rote Läufe in 2 Tagen, 1 Browser-Job weniger je PR | gleich | 2 Std. |

---

## Umsetzung der Top 10 (für den Bau-Agenten)

### 1. Oberflächentests parallel (S)
- **Befund:** `test:dom` in `package.json` ist eine Kette aus 31 `node …`-Aufrufen mit `&&`. Jeder Test ist ein eigener Prozess und liest nur `dist/`.
- **Messwert (CI-Lauf 44910484851):** Job „Tests a“ 8 Min 37 s. Davon Regeln 49 s, Oberfläche 6 Min 47 s, Erweiterungen 31 s, Einrichten 25 s. Längste Tests: Jahreswechsel 113 s, Anzeige 83 s, dom-test 23 s, Altstände 21 s, Mietgrenze 21 s, Vorgänge 18 s. Die Browser-Jobs daneben brauchen nur 3,5 Min.
- **Schritte:**
  1. Neu `tools/tests-parallel.js <Skriptname> <Anzahl gleichzeitig>`: liest die Kette aus `package.json`, startet die Einträge mit höchstens N gleichzeitig, sammelt je Test die Ausgabe, druckt sie nach Testende am Stück und am Schluss eine Tabelle (Test, Sekunden, bestanden/rot). Rückgabe ungleich 0, sobald **ein** Test ungleich 0 endet.
  2. `package.json`: `"test:dom:parallel": "node tools/tests-parallel.js test:dom 3"`. `test:dom` und `npm test` bleiben für lokale Läufe unverändert.
  3. `.github/workflows/ci.yml`, Job `regeln`: Schritt „Regel- und Oberflächentests“ ersetzen durch `npm run build:web && npm run test:rules && npm run test:dom:parallel`.
  4. Höchstens 3 gleichzeitig: `test-jahreswechsel.js` braucht viel Speicher (lokal bei voller Last mit Code 137 abgebrochen).
- **Abnahme „kein Fehler wird übersehen“:**
  - Die Tabelle zeigt genau so viele Tests, wie `test:dom` Einträge hat (im Skript prüfen, sonst rot).
  - Probe: einen Test absichtlich rot machen (lokal, nicht committen) → Gesamtlauf rot, die Fehlermeldung steht im Log.
  - Ein Test, der abstürzt oder vom System beendet wird, zählt als rot.
- **Später (U):** `test-jahreswechsel.js` lädt die 6,7 MB große Seite für jede Kombination aus 2 Tagen × 13 Sprachen × Haushalten neu. Seite je Datum einmal laden und wiederverwenden: 113 s → geschätzt 30 s.

### 2. Pflicht-Schnelltest vor dem Push (S)
- **Befund:** `CLAUDE.md` sagt „lokal nur das Nötigste“. In der Praxis wurde oft gar nicht getestet.
- **Messwert:** 46 rote CI-Läufe. Bei 36 ist die Ursache im Log erkennbar:

| Ursache | Läufe | lokal findbar in |
|---|---|---|
| Wächter: Testmarke fehlt in Prüfliste (4), Einfache Sprache fehlt (3), Mutations-Stelle nicht gefunden (2), PIN-Text zu lang (2), CSS-Regel (2), Zahl in Übersetzung (1), Amtsbegriff (1), Dateigröße (1) | 16 | unter 1 Min |
| App und Referenzrechnung weichen ab (ein PR, 4-mal hintereinander) | 4 | 1 Min |
| Text passt bei 390 px nicht ins Auswahlfeld (Browser) | 6 | nur mit Browser |
| Zufalls-Klicktest „erreicht nicht alle Bereiche“ | 7 | nur mit Browser |
| Echte Fehler in der Oberfläche (PIN-Speicher, Suche, Vorgänge, Karte klappt nicht auf) | ca. 8 | 2–7 Min |

- **Schritte:**
  1. `package.json`: `"test:vor-push": "npm run lint && npm run build:web && npm run test:rules"` (lokal gemessen: 64 s Regeln + wenige Sekunden).
  2. `tools/pr-fertig.sh` und die Push-Regel in `CLAUDE.md` („committen, konflikt-check, pushen“) um `npm run test:vor-push` ergänzen. Text in `CLAUDE.md`: „Das Nötigste = `npm run test:vor-push`“.
  3. `eslint` mit `--max-warnings 0` (heute 10 Warnungen über unbenutzte Namen, das ist toter Code).
- **Abnahme:** Kein Test wird entfernt; die CI bleibt wie sie ist. Der Schnelltest ist zusätzlich. Ziel-Messwert: Anteil roter CI-Läufe unter 10 %.

### 3. Amtliche Vergleiche nicht bei Merges neu starten (S)
- **Befund:** `amtlich-wohngeld.yml`, `amtlich-kiz.yml`, `amtlich-bafoeg-eg.yml`, `gross-*.yml` starten bei jedem Push, der die jeweilige Auftragsdatei (`tools/amtliche-rechner/*auftrag*.txt`) enthält. Ein Merge in einen Bündel-Zweig enthält sie auch.
- **Messwert:** 21.11.: 16 Läufe, 417 Minuten. 9 davon auf `b-buendel-3`, `b-buendel-4`, `test-update-1.9` – dieselben Abfragen dreimal bei den Behörden-Rechnern. KiZ-Vergleich: 42–55 Min je Lauf, von 5 Läufen noch keiner erfolgreich beendet.
- **Schritte:** In jedem dieser Workflows beim ersten Job ergänzen:
  `if: github.event_name != 'push' || !startsWith(github.event.head_commit.message, 'Merge')`
  und oben `concurrency: { group: <Workflow-Name>, cancel-in-progress: false }`. Sobald die Workflows auf `main` liegen: `push`-Auslöser ganz entfernen, nur noch Knopfdruck und der monatliche Lauf (`amtliche-rechner.yml`, am 3. jedes Monats und am 2. Januar – das ist gut so).
- **Abnahme:** Die gespeicherten amtlichen Vergleichswerte (`test/amtlich-*.json`) laufen weiter bei jedem PR in `test-amtlich.js` und `test-amtlich-wohngeld.js`. Es entfällt nur die doppelte Abfrage, kein Vergleich.

### 4. Ein Zahlen-Test für alle Sprachordner (S)
- **Befund:** Der Test „Zahlen in allen Sprachen wie im Deutschen“ (`test/test-sprachen-zahlen.js`) prüft nur die 13 Hauptdateien. Für die Unterordner gibt es 5 eigene Kopien der Zähl-Funktion mit **unterschiedlicher** Logik (`test-haushalt.js`, `test-schulden.js`, `test-fristen.js`, `test-ausziehen.js`; persische Ziffern kennen nur 2 davon, arabische die in `test-fristen.js` gar nicht). Die Ordner `schritte`, `klient`, `suche`, `denetz` haben **keinen** Zahlen-Vergleich. `scripts/build.js` hat 10 fast gleiche Blöcke je Ordner, `test-einfach-vollstaendig.js` eine eigene Ordnerliste.
- **Messwert (eigene Gegenprobe über alle 10 Ordner, 32.000 Texte):** derzeit keine echte Abweichung; 4 Fälle, in denen die Übersetzung die Zahl als Wort schreibt (`schritte` ar, `klient` fa/fa-AF/ps). Die Lücke ist also heute folgenlos, aber offen.
- **Schritte:**
  1. `test/hilf-zahlen.js`: eine Funktion `zahlen()` (arabische **und** persische Ziffern, Tausenderpunkte, Platzhalter ausgenommen) und `platzhalter()`.
  2. `test/test-sprachen-zahlen.js` läuft über die Hauptdateien **und** automatisch über jeden Unterordner von `src/lang/` mit einer `de.json`. Prüft je Schlüssel: vorhanden, nicht leer, gleiche Zahlen, gleiche Platzhalter. Ausnahmen wie bisher in `test/sprachen-zahlen-ausnahmen.json` (um die 4 Fälle erweitern, je mit dem deutschen Zahlenwert).
  3. `scripts/build.js`: die 10 Blöcke durch eine Schleife über dieselbe Ordnerliste ersetzen.
  4. Die Kopien in den 4 Tests erst entfernen, wenn der neue Test dieselben Fälle rot meldet.
- **Abnahme:** Probe je Ordner: eine Zahl in einer Übersetzung ändern → Test rot. `dist/i18n.js` ist vor und nach dem Umbau von `build.js` inhaltsgleich (Vergleich der geladenen Objekte).

### 5. Rechenplan zuerst, Referenz unabhängig (S, Arbeitsregel)
- **Befund aus der Historie:** 23 Commits heißen „Nachprüfung/Korrektur“; PR `b-rest-19` war 4-mal rot, weil die Regel geändert, die Referenzrechnung aber nicht angepasst war; Prüfer fanden Fehler erst nach dem Bau.
- **Neue Reihenfolge für jede Regel-Änderung:**
  1. **Rechenplan** als `docs/entwuerfe/<thema>.md`: Paragraf mit Quelle und Abrufdatum, Formel in Worten, 3–5 von Hand gerechnete Beispiele (auch Grenzfälle auf den Euro).
  2. **Fable prüft den Plan** gegen das Gesetz – ohne Code. Erst danach wird gebaut.
  3. Agent A baut `src/rules.js`. **Agent B** baut unabhängig `test/referenz.js` und die Testfälle – nur aus dem Plan, ohne den Code von A zu lesen. Der Rastertest vergleicht beide.
  4. Die Prüfung nach dem Bau vergleicht nur noch: Entspricht der Code dem geprüften Plan?
- **Abnahme:** Kein PR mit Änderung an `src/rules.js` ohne Rechenplan-Datei und ohne Änderung in `test/` (als kleiner Wächter in der CI machbar: `git diff --name-only`).
- **Zusätzlich:** Heiße Dateien haben einen „Besitzer“ je Zeitfenster. Bündel-PRs nur durch **einen** Integrator.

### 6. Prüfliste und Änderungsliste teilen (U, klein)
- **Befund:** `docs/PRUEFLISTE.md`: 105 KB, 389 Regeln, 88 Commits in 3 Tagen (zweithäufigste Datei), 4 rote Läufe wegen „Testmarke ohne Zeile“. `docs/AENDERUNGEN.md`: 51 Commits. Jeder PR hängt an denselben Stellen an → Konflikte.
- **Bewertung:** Inhaltlich ist die Prüfliste **keine Bremse**, sondern das einzige Mittel, das fehlende Regeln zeigt (Tests prüfen nur vorhandene). Die Bremse ist das Format „eine große Datei“.
- **Schritte:** `docs/pruefliste/<Leistung>.md` (eine Datei je Abschnitt); `test/test-pruefliste.js` liest alle Dateien des Ordners. Für Änderungen: je PR eine kleine Datei `docs/aenderungen/<Thema>.md`, beim Release zusammengefügt.
- **Abnahme:** Vor und nach der Teilung meldet `test-pruefliste.js` dieselben Zahlen (31 Karten, 389 Regeln, 348 Testmarken). Umbau nur, wenn kein PR offen ist, der die Prüfliste ändert.

### 7. Feste Beträge in Texten → Platzhalter (U)
- **Befund:** Gute Nachricht: 203 Texte nutzen schon Platzhalter. Übrig sind 19 deutsche Texte in der Hauptdatei mit festem Euro-Betrag (z. B. `t.kiz.verm`, `t.gsa.eltern`, `es.tipp.grundrente`), 4 in Unterordnern, dazu die Tabelle „Rechenregeln“ in `src/template.html` (z. B. „Regelsatz 563 €“). `test-feste-zahlen.js` fängt veraltete Beträge im Deutschen ab, aber nur in der Hauptdatei, und jede Wertänderung bedeutet weiter 13 Dateien von Hand.
- **Schritte:** Je Text den Betrag durch `{name}` ersetzen und den Wert beim Anzeigen aus `Rules.RULES` einsetzen (per Skript in allen 13 Sprachen und Einfacher Sprache). `test-feste-zahlen.js` auf alle Unterordner ausdehnen.
- **Abnahme:** Angezeigter Text vor und nach dem Umbau zeichengleich in allen 13 Sprachen (automatischer Vergleich über alle Schlüssel). Danach kann eine Übersetzung keinen falschen Betrag mehr enthalten.

### 8. Werte mit Gültigkeit und Quelle als Daten (U)
- **Befund:** Die Werte stehen schon zentral im Objekt `R` am Anfang von `src/rules.js` – das ist gut. Aber: Gültigkeit steckt in Namen (`minijob` / `minijob2027`, `bezug2026` / `bezug2027`, Schalter `svrg2027.verkuendet`), Quelle und Abrufdatum nur in Kommentaren (nicht prüfbar).
- **Schritte:** Für jährlich wechselnde Werte die Form `{ wert, ab, bis, quelle, abruf }`; eine Funktion wählt nach Datum. Neuer Test: jeder Wert hat Quelle und Abrufdatum; kein Wert ist am Testtag abgelaufen, ohne dass ein Nachfolger da ist (ersetzt Merkposten wie „Pfändungsgrenzen zum 1.7.2027“).
- **Zeitpunkt:** Mit der Vollprüfung am 1.12.2026, bevor die Werte 2027 eingetragen werden. Nicht kurz vor einem Release.
- **Abnahme:** Raster-, Eigenschafts- und Jahreswechsel-Test liefern vor und nach dem Umbau dieselben Ergebnisse (für 2026 und mit `HEUTE=2027.05`).
- **Dazu:** Das Faktenblatt liegt außerhalb des Repos und muss von Hand angeglichen werden (nicht prüfbar). Besser aus `R` erzeugen (`tools/faktenblatt.js` → `docs/FAKTENBLATT.md`).

### 9. Mutationstest: Killer-Test zuerst (S)
- **Befund:** 114 absichtliche Fehler; für jeden läuft eine von Hand gepflegte Testliste (`TESTS` in `tools/mutationstest.js`, dritte Kopie der Testliste) bis zum ersten roten Test. Die Fehler sind über Text-Stellen verankert; ändert sich der Code, bricht der Anker.
- **Messwert:** 3 Teile je 21–22 Min = längster Teil der schweren Tests (alles andere höchstens 13 Min). 24 Commits an der Datei in 3 Tagen, 2 rote PR-Läufe („Stelle 0-mal gefunden“). In der Historie fand ich **keinen** Commit, der belegt, dass ein überlebender Fehler zu einem neuen Test führte – der Nutzen ist also eine Versicherung, kein nachgewiesener Fund.
- **Empfehlung:** Behalten, nur vor Release (wie entschieden). Schneller machen: Datei `tools/mutation-killer.json` merkt je Fehler, welcher Test ihn fand; dieser läuft beim nächsten Mal zuerst. Findet er ihn nicht mehr, läuft die ganze Liste wie bisher.
- **Abnahme:** Ergebnis je Fehler (gefunden/überlebt) identisch zum Lauf ohne die Datei. Ein überlebender Fehler bleibt rot.

### 10. Zufalls-Klicktest entkoppeln (S)
- **Befund:** Der Test prüft zwei Dinge zugleich: „stürzt etwas ab?“ und „wurden alle Bereiche erreicht?“. Das Zweite hängt vom Zufallsweg ab und bricht bei jeder Änderung der Navigation.
- **Messwert:** 7 rote Läufe „erreicht nicht alle Bereiche“ (kein App-Fehler). Etwa die Hälfte der 19 Commits zum Test repariert den Test selbst. 2 Jobs je PR mit je 3,5 Min.
- **Schritte:** Neuer kurzer Test `test/e2e-rundgang.js`: besucht jeden Bereich einmal gezielt (Start, einfach, ausführlich, Ergebnis, Mappe, Karten, Mein Ordner, Einstellungen) und prüft „keine Skriptfehler“. Der Zufallstest prüft nur noch Abstürze; die Bereichs-Quote gilt nur im schweren Lauf (2.000 Schritte). Im PR ein Teil statt zwei.
- **Abnahme:** Jeder Bereich, den die Quote heute verlangt, steht im Rundgang als Pflichtbesuch. Schwerer Lauf vor Release unverändert.

---

## Weitere Befunde je Bereich

### 1. Tests

| Befund | Messwert | Empfehlung | Ersparnis | Risiko | Aufwand |
|---|---|---|---|---|---|
| Raster verkleinern lohnt nicht | 60.000 Haushalte: 11 s (CI), 15 s lokal; alle Regeltests 49 s | so lassen | 0 | – | – |
| Testlisten als eine lange Zeile in `package.json` | 77 Einträge, 49 Commits in 3 Tagen | Tests per Ordner/Namensmuster finden lassen (passt zum Skript aus Nr. 1); Wächter: jede Datei `test/test-*.js` läuft in genau einer Gruppe | Konflikte entfallen | sinkt | 1–2 Std. (U) |
| Überlappung Regeln | Raster, Eigenschaften, Abhängigkeiten, strenge Tests, Fälle, Grenzen prüfen dieselbe Rechnung aus 6 Blickwinkeln | behalten: zusammen unter 1 Min, verschiedene Fehlerarten | 0 | – | – |
| Überlappung Oberfläche | `test-anzeige.js` (83 s, 240 Haushalte × 13 Sprachen) und `test-jahreswechsel.js` (113 s) laden beide die ganze Seite sehr oft | nach Nr. 1 kein Engpass mehr; nicht verkleinern | – | – | – |
| Schwere Tests öfter als entschieden | 28 Läufe in 2 Tagen (786 Min), 8 rot; Entscheidung war „einmal vor Release + sonntags“ | Auslöser `push: paths: schwer.yml` belassen, Knopfdruck auf Arbeitszweigen nur bei Änderungen an Tests | ca. 500 Min | gleich | Regel |
| Wackler | Mutationstest (1 Lauf, alle 3 Teile) und Firefox (1 Lauf, 3 Teile) rot, danach grün; im PR-Lauf fängt die einmalige Wiederholung Wackler ab | Wiederholungen zählen und wöchentlich ansehen (steht schon als Warnung im Log) | – | sinkt | 30 Min |
| Lücke | Kein Wächter „PR ändert `rules.js`, aber keinen Test“ | siehe Nr. 5 | – | sinkt | 30 Min |
| Lücke | Zahlen-Vergleich fehlt in 4 Sprachordnern | siehe Nr. 4 | – | sinkt | – |

### 2. Prüfungen

| Befund | Messwert | Empfehlung | Risiko | Aufwand |
|---|---|---|---|---|
| Prüfliste: Format bremst, Inhalt nicht | 88 Commits, 4 rote Läufe | Nr. 6 | gleich | klein |
| Prüfbericht wächst als eine Datei | `docs/PRUEFBERICHT.md` 49 KB, Konflikt bei Bündel 4 genannt | je Prüfung eine Datei `docs/pruefberichte/<Datum>-<Thema>.md` | gleich | 30 Min |
| Faktenblatt außerhalb des Repos | nicht testbar | aus den Werten erzeugen (Nr. 8) | sinkt | 2 Std. |
| Quellen nur als Kommentar | 53 Stellen mit „Stand/Abruf“ in `rules.js`; `content/quellen/abruf.json` vorhanden | monatlichen Lauf (`amtliche-rechner.yml`) um „Quellen-Seite hat sich geändert“ erweitern, sofern `tools/quellen-abrufen.py` das hergibt (nicht im Detail geprüft) | sinkt | 2–3 Std. (U) |
| Prüfung nach dem Bau | 23 Korrektur-Commits | Plan zuerst prüfen (Nr. 5) | sinkt | Regel |

### 3. Datenstruktur

| Befund | Messwert | Empfehlung | Risiko | Aufwand |
|---|---|---|---|---|
| 13 Hauptsprachdateien sind Konflikt-Schwerpunkt | je 78 Commits in 3 Tagen; 1.615 Schlüssel, neue Einträge an wenigen Stellen angehängt | Neue Bereiche immer in eigenen Unterordner (klappt schon bei 9 Ordnern); mit Nr. 4 kostet ein neuer Ordner keine Änderung an Build und Tests mehr | sinkt | – |
| Schlüssel in Hauptdateien unsortiert | 740 von 1.615 Übergängen unsortiert | einmalig alphabetisch sortieren (dann verteilen sich Einfügungen). Nur wenn kein PR offen ist. Abnahme: geladenes Objekt vorher = nachher | gleich | 30 Min (U) |
| Meldung „nicht verwendete Schlüssel“ ist unbrauchbar | nennt 1.716 Schlüssel, weil zusammengesetzte Schlüssel nicht erkannt werden | Erkennung verbessern oder Meldung entfernen; echte tote Texte kosten ×13 Pflege | gleich | 1 Std. |
| Einfache Sprache | 31 Dateien, Vollständigkeit geprüft (`test-einfach-vollstaendig.js`), „=“-Regel ist sauber | Ordnerliste aus Nr. 4 mitnutzen | – | – |
| Anschriften, PLZ | erzeugte Dateien in `content/`, Tests in Millisekunden | so lassen | – | – |

### 4. Code und Build

| Befund | Messwert | Empfehlung | Risiko | Aufwand |
|---|---|---|---|---|
| `src/app.js` ist die meistgeänderte Datei | 4.556 Zeilen, 379 KB, 982 Funktionen, 97 Commits in 3 Tagen | weiter Bereiche auslagern wie schon bei Haushalt, Fristen, Schulden (Mappe, Einstellungen, Ergebniskarten) | gleich, wenn Tests grün | je Bereich 2–3 Std. (U) |
| Neues Modul = 4 Stellen ändern | `build.js` (20 Marken), `template.html`, Sprach-Block, Testlisten | eine Modul-Liste, aus der Build und Tests lesen | sinkt | 2 Std. (U) |
| Toter Code | 10 Lint-Warnungen (unbenutzte Namen in `app.js`, `formulare.js`, `plz.js`) | entfernen, dann `--max-warnings 0` | gleich | 20 Min (S) |
| Build selbst | `build:web` wenige Sekunden | kein Handlungsbedarf | – | – |

### 5. Arbeitsweise

| Befund | Messwert | Empfehlung |
|---|---|---|
| Viele kleine PRs, dann Bündel | 213 Merges auf 243 Commits in 3 Tagen; 23 Commits nennen „Konflikt“ | ein Integrator, heiße Dateien mit Besitzer; Struktur-Maßnahmen Nr. 4 und 6 nehmen die häufigsten Konfliktstellen weg |
| Push ohne lokalen Test | 22 % rote Läufe | Nr. 2 |
| Prüfung nach Bau | Rückläufer, Prüfer finden Fehler in Korrekturen | Nr. 5 |
| CI-Abbrüche | 29 abgebrochene Läufe (neuer Push auf denselben Zweig) | normal und gewollt; weniger Pushes je Auftrag durch Nr. 2 |

## Nicht geprüft / unsicher
- Den Ablauf der Fable-Prüfungen kenne ich nur aus Commit-Texten, nicht aus Protokollen.
- Zeitersparnisse sind Schätzungen aus den Messwerten; die parallele Laufzeit (Nr. 1) ist nicht ausprobiert.
- Lokale Zeitmessung der Oberflächentests ist unvollständig (ein Test wurde wegen Speichermangel beendet); maßgeblich sind die CI-Zeiten.
- CI-Caching, concurrency, Merge-Ablauf und alte Branches prüfen zwei andere Agenten; hier nur ergänzt (Nr. 3, Testliste).
