# Übergabe an die nächste Sitzung (Stand 21.11.2026, 14:00)

**Zuerst lesen:** CLAUDE.md, STATUS.md, diese Datei, docs/entwuerfe/naechstes-update.md (Abschnitt „Update nach 1.9“), docs/entwuerfe/pruefungen-21-11/.

## Wo wir stehen
- Store: Version 1.8.0 (VC 150) – Android hochgeladen von David, iOS Build 150 in TestFlight. main = Stand 1.8.0.
- Laufendes Update („1.9“) sammelt sich auf **claude/test-update-1.9** (Draft-PR #78-Nachfolger, Basis main). Davids Vorgabe: **für dieses Update NICHT bauen** (weder Android noch Apple); fertig machen → Schlussprüfung → schwere Tests → auf main mergen → direkt mit dem nächsten Update weitermachen.
- Bereits im Sammelzweig (Bündel 1, PR #102): Rechenkorrekturen Runde 1+2 (#96, #99), Vorgang-PIN (#90), Suche (#98 Teil), „bitte prüfen“-Markierung bei Scan-Werten (#100), QR-Code/SoLo-Datei für Klienten (#101), plus alle früheren Einzel-PRs (Es ist dringend, Haushaltsplan/Abschlag/Tarifvergleich, Raten-Empfehlung, Pflege-Kacheln, Ausziehen, Briefe/Hilfen-Check aufgeräumt, Für Klient zusammenstellen, Telekom raus, Pflege-Kachel Start, PIN-Schalter-Reparatur, Scan-Test-Fixes #97).

## Offene PRs gegen claude/test-update-1.9 (Reihenfolge zum Abschließen)
| PR | Inhalt | Status |
|---|---|---|
| #111 Bündel 2 | #98-Rest, #104 (BAföG 2.300 €/160 €/10-€-Grenze, Cache, Tablet, krypto.js), #108 (enthält #105: Raten mit Pfändungsgrenze, Vorbehalt, LAS, Rundfunk, Anschriften 32 bestätigt/15 korrigiert) | alle Teile geprüft/freigegeben → CI grün machen, mergen; #104/#105/#108/#98 danach schließen |
| #107 Sicherheit | Vorgangswechsel ohne Reste, FLAG_SECURE/iOS-Abdeckung, iOS-Speicher ohne iCloud-Backup (Swift-Plugin, ungetestet!), Datenschutzerklärungen | Sicherheitsprüfung + iOS-Build-Check (neuer Workflow ios-build-check.yml) läuft; erst nach Freigabe + grünem iOS-Build ins Bündel 3 |
| #110 Wohngeld Kinderlohn | Pauschbetrag 102,50 € + § 17 Nr. 4 je Kind; amtlicher Rechner: 344/400 → Probe 400/400 | nach kurzer Fable-Prüfung ins Bündel 3 |
| (neu) Sprachkorrekturen | ~110 Korrekturen aus Rückübersetzung (KRITISCH: Einfache Sprache Pflege „meistens nicht oder nie“ – auch im Store-Stand falsch; Somali az.p.u25.t), Branch claude/b-sprachkorrekturen | wird gebaut, dann Bündel 3 |
| (neu) Deutsch-Netz | deutscher Originalsatz klein unter Fristen/Warnungen in Fremdsprachen, Schalter in Einstellungen | wird gebaut, Branch claude/b-deutsch-netz |
| #109, #103, #106 | Differenztest-Workflows amtliche Rechner (Wohngeld fertig; KiZ, BAföG/Elterngeld laufen) | Werkzeuge; mergen sobald CI grün; Befunde → nächstes Update |

## Danach (Abschluss 1.9)
1. Bündel 3 (#107, #110, Sprachkorrekturen, Deutsch-Netz) mergen.
2. Release-Vorbereitung: package.json → 1.9.0? (Versionsnummer/VC nur auf Davids Wunsch in STATUS), AENDERUNGEN.md Abschnitt „Nächste Version (in Arbeit)“ zu fertigem Abschnitt, STORE.md Neuigkeiten.
3. Schlussprüfung aller neuen Texte (Fable), schwere Tests (schwer.yml auf claude/test-update-1.9; workflow_dispatch nur von main → ggf. per Push-Auslöser), dann PR claude/test-update-1.9 → main mergen.
4. KEIN Build (David). Testliste für Gerätetest vorbereiten (PIN, Teilen/Messenger, SoLo-Datei, Kamera-Scan, iOS-Speicher-Migration `SoloSpeicher.info()` → ohneSicherung:true, ML-Kit-Netzwerk).

## Nächstes Update (Plan: docs/entwuerfe/naechstes-update.md)
Sprachen nur bei Bedarf laden (Datei real 6,35 MB, Grenze vorläufig 7 MB Bytes), höfliche Anrede tr/ru/uk/fr/pl, Dari-Wortschatz (435 Texte mit iranischen Wörtern), QR-Scanner nativ iPhone, .solo direkt öffnen, Befunde amtliche Rechner, Rechenplan je Leistung + unabhängige Referenz, Bedienungs-Top-10, Sicherheit mittel/niedrig, Werkzeug anschriften-uebernehmen.js gegen Wikipedia sperren.
**Lizenzschutz Beratungsmodus:** David will darüber noch sprechen (Empfehlung: einmalige Online-Freischaltung mit Platzzahl je Einrichtung + Name der Einrichtung auf Ausdrucken; siehe Chat 21.11.). Nichts bauen ohne Gespräch.

## Arbeitsregeln (zusätzlich zu CLAUDE.md, gemerkt)
- Fertige Teile gebündelt zusammenführen (Tests einmal statt mehrfach). Bau-Agenten mergen nicht selbst.
- Fable-Prüfung nur für Beträge, Recht, Sicherheit; Optik ohne Extraprüfung.
- Neue Wünsche während eines Updates → übernächstes Update, außer David sagt „noch rein“.
- Nicht ständig nachfragen; alle nötigen Internetseiten dürfen aufgerufen werden.
- Agenten-Regeln: docs/entwuerfe/agenten-regeln.md (Kopie von /home/claude/bau2.md; Inhalt u. a.: Worktrees unter /home/claude/wt-*, node_modules-Symlink, Maschine 2 Kerne → lokal nur Einzeltests, Commit-Fuß, konflikt-check, PR per gh api REST).
- Technik: In neuen Klonen `git config --add remote.origin.fetch '+refs/heads/claude/*:refs/remotes/origin/claude/*'` setzen, sonst sind origin/claude/* veraltet.

## Genehmigungen und Entscheidungen von David (vollständig, Stand 21.11.)
| Thema | Entscheidung |
|---|---|
| GitHub | voller Zugriff in jeder Sitzung; Repo Dcabrerizo-lab/Claud mit Push anbinden, ohne Nachfrage |
| PRs/Merges | PRs automatisch anlegen und nach grünen Tests mergen (gebündelt); kein Push auf main, kein Force-Push |
| Nachfragen | nicht ständig fragen; nur bei echten Weichenstellungen. Alle nötigen Internetseiten dürfen aufgerufen werden |
| Tempo | Vorrang; parallele Agenten so viele wie sinnvoll; Fable dort, wo es um Recht, Beträge, Sicherheit geht |
| Wünsche „fürs nächste Update“ | sofort fertig machen (bauen, prüfen, testen, in Sammelzweig) – nur nicht bauen; schwere Tests erst zum Schluss |
| Nach einem fertigen Update | direkt mit dem nächsten weitermachen |
| Dieses Update (1.9) | KEIN Build für Android/Apple |
| Builds/Store | nur auf ausdrückliche Anweisung; Play-Console-Upload macht David selbst; TestFlight nur nach Freigabe |
| Upload-Schlüssel | liegt NICHT in der neuen Sitzung (nur in der alten). Für einen Build schickt David den Schlüssel als Zip (CLAUDE.md). Nie ins Repo/Chat |
| App-Größe | Variante A: Test misst Bytes, Grenze vorläufig 7 MB; Sprachen-nur-bei-Bedarf im nächsten Update |
| Anrede | tr/ru/uk/fr/pl durchgehend höfliche Form (nächstes Update) |
| Sicherheitsnetz Sprachen | deutscher Originalsatz unter wichtigen Sätzen (Schalter, Standard an) |
| Anschriften | nur mit amtlicher Quelle; Wikipedia-Adressen nur, wenn amtlich bestätigt |
| Korrektheit | amtliche Quellen mit Datum; unsicher → „möglich“; Werte ab 1.1.2027 erst ab dann; jedes Update mit Aktualitätsprüfung vollumfänglich + Fable |
| Lizenzschutz Berater | noch offen – erst mit David besprechen |
| Muttersprachler | keine verfügbar → Rückübersetzung (Fable) + amtliches Glossar + Deutsch-Netz; „mit Fehlern darf nichts veröffentlicht werden“ |
| Termine | Vorprüfung Update 2027 am 1.12.2026, Prüfung am 20.12.2026 (geplante Aufgaben) |
