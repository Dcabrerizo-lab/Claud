# SoLo – schneller arbeiten ohne Qualitätsverlust (Stand 21.11.2026)

Umgesetzt in PR #121 (gemergt in `claude/test-update-1.9`, CI grün). Kein Test entfernt, keine Grenze gelockert.
Messwerte: 22 PR-Läufe vom 21.11. (vorher) und Lauf 44917142837 (nachher). Ersparnis geschätzt, wo „ca.“ steht.

## Das Wichtigste

| Was | Vorher | Nachher | Ersparnis |
|---|---|---|---|
| PR-Check gesamt (Wandzeit) | 8,5–9 Min. | **3:55 Min.** | ca. 5 Min. je Push |
| Längster Job | Tests a 7:45 (Median), davon Oberfläche 6:47 nacheinander | Browser-Fälle 3:36; Oberfläche 2 Jobs je 2:10–2:35 | – |
| Schnelltest lokal vor Push | keiner (22 % rote CI-Läufe) | `npm run test:vor-push` ca. 40 s, mit betroffenen Oberflächentests ca. 1,5–2 Min. | ca. 20 rote Läufe/2 Tage weniger |
| Volle Oberflächentests lokal | 8–9 Min. (2 Kerne, teils Abbruch wegen Speicher) | nur betroffene: z. B. 13 von 31 Tests in 84 s | ca. 6 Min. je Prüfung |
| Mutationstest | lief auf diesem Stand gar nicht (Dateien fehlten im Testordner) | läuft, 111/111 entdeckt; Killer-Test zuerst | Teil 22 Min. → geschätzt 8–10 Min. |
| Amtliche Vergleiche | 9 von 16 Läufen reine Wiederholung bei Merges (bis 120 Min. je Lauf) | kein Start bei Merge-Commits | ca. 250 Rechner-Min./Tag |

## Messwerte vorher (CI)

| Job | Median | Max |
|---|---|---|
| Tests a (Lint, Regeln, Oberfläche, Erweiterungen) | 465 s | 602 s |
| davon „npm test“ | 401 s | 528 s |
| Browser – Fälle … (e2e:basis) | 202 s | 249 s |
| Zufalls-Klicktest 1/2, 2/2 | 168 / 198 s | 228 s |
| App-Test | 41 s | 60 s |
| Android | 80 s | 95 s |
| Wartezeit bis Start | 2 s | 743 s (wenn viele Läufe gleichzeitig, z. B. amtliche Vergleiche) |

- `npm ci` 2–7 s, Browser aus Zwischenspeicher 5 s, Systempakete 12 s: Caching ist schon gut, kein Handlungsbedarf.
- concurrency mit cancel-in-progress, Doku-Filter, iOS nur auf Knopfdruck/Tag: waren schon da.
- Oberflächentests einzeln (CI): Jahreswechsel 113 s, Anzeige 83 s, dom-test 23 s, Rest je unter 21 s. Speicherspitzen lokal: Anzeige 3,8 GB, Jahreswechsel 3,2 GB.
- Erster Versuch „3 gleichzeitig in einem Job“: nur ca. 1 Min. besser (Jahreswechsel unter Last 230 s). Deshalb 2 getrennte Jobs.

## Wacklige Tests (21.11.)
| Test | Häufigkeit | Ursache |
|---|---|---|
| e2e-beh.js „page.click: Timeout 30000ms“ | 4 von 22 Läufen, je +3 Min. (Wiederholung) | Klick wartet auf verdecktes/fehlendes Element; Stelle war im Log nicht sichtbar → jetzt mit Fundstelle |
| e2e-beh.js „ps: abgeschnittener Auswahl-Eintrag (emStd)“ | 2 Läufe | echter Textfehler (Paschtu zu lang), kein Wackler |
| Zufalls-Klicktest „erreicht nicht alle Bereiche“ | 7 rote Läufe/2 Tage (Effizienzprüfung) | Zufallsweg, kein App-Fehler → fester Rundgang |

## Umgesetzt (PR #121)

| Nr. | Änderung | Warum sicher |
|---|---|---|
| 1 | Oberflächentests in CI: 2 Jobs „Tests a2 (Oberfläche 1/2, 2/2)“, je 2 gleichzeitig | gleiche Testliste; Schritt prüft, dass beide Teile genau die Liste sind; Pflicht-Check verlangt beide |
| 2 | `tools/tests.js` + Testlisten `test/listen/regeln.txt`, `oberflaeche.txt` (eine Zeile je Test) | Wächter: jede `test/test-*.js` steht in einer Liste (oder `ausgenommen.txt` mit Grund), keine fehlende Datei, package.json darf keine lange Kette mehr bekommen |
| 3 | `npm run test:vor-push` (Lint, Bauen, alle Regeltests 2 gleichzeitig, betroffene Oberflächentests) und `npm run test:betroffen`; `tools/pr-fertig.sh` ruft ihn vor dem Push auf | zusätzlich, CI unverändert vollständig |
| 4 | amtliche Vergleiche (`amtlich-*`, `gross-*`): kein Start bei Merge-Commits, höchstens 1 Lauf je Zweig | gespeicherte Vergleichswerte laufen weiter in jedem PR (test-amtlich*.js); neuer Auftrag = normaler Commit an der Auftragsdatei |
| 5 | ein Zahlen-Test für alle Sprachordner (`test/hilf-zahlen.js`, `test-sprachen-zahlen.js`), die 4 Kopien nutzen dieselbe Funktion | Gegenprobe mit 4.500 künstlichen Fehlern: findet jeden Wertfehler, den die alten fanden; neu: 5 Ordner ohne Prüfung (schritte, klient, suche, denetz, zusatz), Nachkommastellen (2,5 ≠ 25), persische Ziffern im Hauptteil; Probe je Ordner rot |
| 6 | Mutationstest: billige Tests zuerst, Killer-Test aus `tools/mutation-killer.json` zuerst; fehlende Dateien (erweiterungen/, Wohngeld-Kern) mitkopiert | Ergebnis je Fehler identisch (entdeckt = irgendein Test rot); lokal 111/111 entdeckt; schwerer Lauf lädt neue Zuordnung als Artefakt hoch |
| 7 | `test/e2e-rundgang.js` (Start, ausführlich mit Karten, Mappe, einfache Version, Ordner, Einstellungen); Zufalls-Abdeckung im PR nur Warnung | Rundgang besucht jeden Pflichtbereich fest (28 Prüfungen, grün); Zufallstest gleich lang, App-Fehler bleiben rot; lokal und schwerer Lauf weiter streng |
| 8 | `.gitattributes` merge=union für AENDERUNGEN, PRUEFBERICHT, PRUEFLISTE, Testlisten + Wächter `test-doku-zusammenfuehrung.js` | Wächter meldet doppelte Regel-/Aufzählungszeilen und Konfliktmarken; NICHT für JSON |
| 9 | schwer.yml: saubere Testrunde vor dem Mutationstest 3 gleichzeitig | gleiche Listen |
| 10 | e2e-beh.js: Fundstelle bei Absturz im Log | nur Ausgabe |

Nebenbefunde: `test-unterhalt-selbst.js` läuft in `test-faelle.js` (jetzt in `ausgenommen.txt` dokumentiert); veraltete Sprach-Ausnahme `ar ausb.hint` entfernt, veraltete Ausnahmen melden jetzt rot.

## Empfohlen (nicht umgesetzt)

| Empfehlung | Nutzen | Wer |
|---|---|---|
| main schützen (Pflicht-Check „Tests (Regeln, Oberfläche, Browser, App)“), „Auto-Merge erlauben“ und „Branches nach Merge löschen“ einschalten (heute alle aus) | `gh pr merge --auto` statt Warteschleife in pr-fertig.sh (bis 45 Min. Agent wartet) | David (Repo-Einstellung) |
| Merge-Queue | bei Bündeln durch einen Integrator nicht nötig | – |
| 4 laufende KiZ-Vergleiche auf Merge-Commits (b-buendel-3/4, test-update-1.9, seit 13:09–13:57) abbrechen | Runner frei, Behörden-Rechner entlastet | Koordinator |
| KiZ-Vergleich: Ursache „nie fertig“ = kein Zeitbudget, 360 Familien dauern länger als das Zeitlimit 120 Min. (Lauf nach 2 Std. abgebrochen); Zeitbudget auf `claude/b-kiz-abgleich` lief in 11 Min. grün durch → diesen Zweig übernehmen | Vergleich endlich verwertbar | Koordinator |
| test-anzeige.js / test-jahreswechsel.js: Seite wiederverwenden bzw. JSDOM-Fenster schließen | je 100 s → ca. 30 s, weniger Speicher | nächstes Update |
| 10 Lint-Warnungen (toter Code) entfernen, dann `--max-warnings 0` | weniger toter Code | nächstes Update |
| CLAUDE.md „Tests“: „Das Nötigste vor jedem Push = `npm run test:vor-push`“ | eine Regel für alle Sitzungen | David (CLAUDE.md nicht von Agenten geändert); in agenten-regeln.md schon eingetragen |
| Hinweis merge=union: wirkt nur bei lokalem `git merge` (so lösen Agenten Konflikte); der Merge-Knopf von GitHub ignoriert es | – | – |
| Killer-Zuordnung aus dem Artefakt des nächsten schweren Laufs ins Repo übernehmen (Raster 60.000 statt lokal 8.000) | noch weniger Laufzeit | nächster schwerer Lauf |

## Agenten-Zeitfresser und Abhilfe
| Zeitfresser | Abhilfe |
|---|---|
| package.json-Konflikte durch neue Tests | Testlisten-Dateien (umgesetzt) |
| 13 Sprachdateien × neuer Ordner ohne Zahlen-Prüfung | Zahlen-Test findet neue Ordner automatisch (umgesetzt) |
| rote CI-Läufe wegen Wächtern (Testmarke, Einfache Sprache …) | test:vor-push Pflicht (umgesetzt, in agenten-regeln.md) |
| volle Oberflächentests lokal (Speicher, 8 Min.) | test:betroffen (umgesetzt) |
| warten auf CI und Merge | 4 statt 9 Min. (umgesetzt); Auto-Merge nach Repo-Einstellung (empfohlen) |
| schwere Tests nur von main per Knopf startbar | wie amtliche Vergleiche über Auftragsdatei/Push-Auslöser auf schwer.yml (vorhanden); `workflow_dispatch` wirkt nur für Workflows auf main |
