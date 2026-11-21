# Prüfung: Bremsen alte Zweige die Arbeit? (21.11.2026)

## Kurzfazit
Alte Zweige bremsen **kaum messbar**. Der eigentliche Ärger war ein *Fehlalarm* (ux-formular) und viel Datenmüll auf der Platte. Beides ist jetzt behoben, bis auf das Löschen der Zweige auf GitHub (wurde vom Sicherheitssystem blockiert).

| Punkt | Bremst? | Wie stark | Erledigt |
|---|---|---|---|
| 1. 119 Zweige auf GitHub | kaum | Übersicht schlecht, sonst < 1 min/Tag | Löschen **blockiert** (Freigabe nötig), Liste liegt bereit |
| 2. konflikt-check | Zeit: nein (1,2 s je Lauf). Fehlalarm: ja | ux-formular meldete bei jedem Lauf 17 Dateien „KONFLIKT“; geschätzt 2–5 min/Tag für Nachsehen/Ignorieren | **Geändert** (PR #116, gemergt) |
| 3. GitHub Actions | nein | CI läuft nur bei PRs und main, nie für tote Zweige. Wartezeit Median 0 min | nichts nötig |
| 4. Worktrees / gc | etwas | 8,9 GB Platte, ständige gc-Warnung; git-Befehle trotzdem schnell (fetch 0,5 s) | **Aufgeräumt** |
| 5. Dependabot #8 u. a. | nein | nur Unordnung | Entscheidung David |

## 1. Zweige auf GitHub
- 119 Zweige (ohne HEAD). 78 in main enthalten, 35 in claude/test-update-1.9 enthalten, 6 nicht enthalten.
- Einziger offener PR: #8 (Dependabot).
- GitHub-Einstellung „Zweige nach Merge automatisch löschen“ ist **aus** (delete_branch_on_merge=false). Darum sammeln sich die Zweige.
- Sicher löschbar: **110 Zweige** (vollständig in main oder test-update-1.9, kein offener PR, nicht main/test-update-1.9/b-entwuerfe, keine geschützten). Liste mit SHA zum Wiederherstellen: `/home/claude/ausgabe/geloeschte-zweige-VORSCHLAG.txt`.
- Bewusst behalten: `claude/test-update-naechstes` (heute erstellt, sieht aus wie nächster Sammelzweig).
- **Status: Löschen wurde vom automatischen Sicherheitsfilter abgelehnt. Nichts auf GitHub gelöscht.**

### Ungemergte Zweige – Davids Entscheidung
| Zweig | Inhalt | Stand | Empfehlung |
|---|---|---|---|
| claude/ux-formular | Formular: vollständige Texte, Beispiele, „Nicht hier eintragen“ bei zweitem Einkommen/Partner (3 Commits, 19 Dateien) | 20.11., kein PR, Konflikt mit main-Stand in 17 Dateien | Inhalt prüfen: übernehmen (neu auf test-update-1.9 aufsetzen) oder verwerfen |
| ccr-53704ec9-x56xs6 | „Daten-Tresor“ + iOS-Xcode-26-Versuch, 90 Dateien, +12.600 Zeilen | 14.11., kein PR | Laut Entscheidung E13 bleibt SoLo eigenständig → vermutlich verwerfen, ggf. als Archiv behalten |
| claude/b-amtlich-kiz | 1 Commit nach dem Merge (KiZ-Differenztest: Zeitbudget, Job-Limit 210 min) | 21.11. | Prüfen, ob nachgereicht werden soll |
| claude/b-entwuerfe | Übergabe-Material (+165.000 Zeilen) | heute aktiv | behalten |
| dependabot/…google-services-4.5.0 | PR #8, Android-Bibliothek | 06.11., offen | testen und mergen oder schließen |
| dependabot/…gradle-wrapper-9.8.2 | PR #5 geschlossen, Zweig übrig | 06.11. | löschen (sicher, aber nicht enthalten → Freigabe) |

## 2. konflikt-check
- Vorher: prüfte gegen **alle** nicht in main enthaltenen Zweige (41 Stück), auch tote. Dauer nur 1,2 s.
- Problem: Weil main stark hinter test-update-1.9 liegt, galten alle in test-update-1.9 gemergten Zweige als „offen“; ux-formular meldete dauerhaft Konflikte, die keiner lösen soll.
- Nebeneffekt: jeder Lauf schreibt ~70 lose Objekte → Ursache der gc-Warnung.
- **Neu (PR #116, in test-update-1.9 gemergt):** prüft nur origin/main, origin/claude/test-update-* und Zweige mit offenem PR. `ALLE=1` = altes Verhalten; ohne gh-Zugriff automatischer Rückfall. Ergebnis jetzt: keine Fehlalarme mehr.

## 3. GitHub Actions (letzte 24 h: 171 Läufe)
- ci.yml: nur push auf main und pull_request. 134 CI-Läufe, alle zu PRs oder main. Kein Lauf für tote Zweige.
- Amtliche Vergleiche (Wohngeld/KiZ/BAföG) und gross-*: nur bei Änderung einer Auftragsdatei – gewollt.
- Schwere Tests sonntags: Zeitplan läuft immer nur auf main (Standardzweig).
- Wartezeit: Median 0 min, nur 2 Läufe > 5 min (Schwere Tests 50 min, ein CI 7 min).
- 23 abgebrochene Läufe = gewollt (cancel-in-progress bei neuem Push).
- **Keine Änderung nötig.**

## 4. Worktrees und Git-Speicher
| | vorher | nachher |
|---|---|---|
| Worktrees | 100 | 13 |
| Platz wt-* | 8,9 GB | 1,7 GB |
| .git | 288 MB | 48 MB |
| lose Objekte | 8.182 | 0 |
| gc-Warnung | bei jedem Befehl | weg |
- Entfernt: 88 Worktrees (gemergt, ohne Änderungen, seit > 60 min unbenutzt). Liste: `/home/claude/ausgabe/entfernte-worktrees.txt`. Die lokalen Branches blieben erhalten.
- Stehen gelassen (Änderungen oder nicht gemergt): wt-ar-bafoeg-cmp, wt-ar-bafoeg-cmp2, wt-ar-kiz, wt-pk (15 Änderungen, b-pflegekasse-kacheln), wt-pr107 (119), wt-pr107-probe, wt-pr90 (88), sowie wt-build, wt-ent2, wt-kc.
- gc.log entfernt, `git worktree prune`, `git gc --prune=now` ausgeführt.

## Empfehlungen
| Maßnahme | Risiko | Wer |
|---|---|---|
| 110 Zweige löschen (Liste mit SHA liegt bereit) | sehr gering, jederzeit wiederherstellbar | David muss freigeben (Filter blockiert) |
| GitHub: „Automatically delete head branches“ einschalten | gering | David (Einstellungen → General) |
| ux-formular, ccr-Tresor, b-amtlich-kiz-Nachtrag, Dependabot #8 entscheiden | Inhalt könnte wertvoll sein | David |
| Gelegentlich `git gc --prune=now` (z. B. sonntags) | keins | Claude |
| CI-Auslöser ändern | nicht nötig | – |
