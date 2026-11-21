# Übergabe an die nächste Sitzung (Stand 21.11.2026, 14:55)

> **NEU 14:55: Alle Pakete sind in claude/test-update-1.9 gemergt (#102, #111, #113, #115), kein PR mehr offen.** Die Tabelle „Offene PRs“ unten ist damit erledigt. Nächster Schritt: Abschnitt „Danach (Abschluss 1.9)“ ab Punkt 2. Hilfsskripte (Konflikte lösen, mergen bei grünen Pflicht-Checks): docs/entwuerfe/werkzeuge/. Offen: Bericht des KiZ-Differenztests (Workflow amtlich-kiz, Ergebnisse als Actions-Artefakt) auswerten; lange Differenztest-Läufe aus #113 auf Grün prüfen.

**Zuerst lesen:** CLAUDE.md, STATUS.md, diese Datei, docs/entwuerfe/naechstes-update.md (Abschnitt „Update nach 1.9“), docs/entwuerfe/pruefungen-21-11/.

## Umbau der Arbeitsabläufe (21.11., fertig, PR #116 + #121 in claude/test-update-1.9)
- PR-Check 3:55 Min statt 8,5–9 Min (Oberflächentests in 2 parallelen Jobs).
- Testlisten stehen in test/listen/*.txt (eine Zeile je Test, merge=union) – NICHT mehr in package.json eintragen. tools/tests.js meldet vergessene Tests.
- Vor jedem Push Pflicht: `npm run test:vor-push` (~40 s); `npm run test:betroffen` testet nur Betroffenes; tools/pr-fertig.sh macht Schnelltest + Push.
- konflikt-check prüft nur gegen main, test-update-* und Zweige mit offenem PR (kein ux-formular-Fehlalarm mehr).
- Amtliche Vergleichs-Workflows starten nicht mehr bei Merge-Commits. KiZ-Vergleich: Zeitbudget-Variante auf claude/b-kiz-abgleich übernehmen (lief in 11 Min grün).
- Gemeinsamer Zahlen-Test für alle Sprachordner; Mutationstest „Killer zuerst“ (111/111 erkannt); e2e-rundgang.js feste Pflichtbesuche.
- Offen: Wackler in e2e-beh.js (Klick-Zeitüberschreitung, Stelle im Log); Repo-Einstellungen für David: Branch-Schutz main, „Allow auto-merge“, „Automatically delete head branches“.
- Berichte: docs/entwuerfe/beschleunigung.md, effizienz.md, zweige-pruefung.md.

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

## Befunde amtliche Rechner (21.11., fürs nächste Update beheben, mit Fable-Prüfung)
- Wohngeld: behoben (#110), 400/400.
- BAföG (BAföG Digital, 200 Fälle): 0 Widersprüche mit Stand inkl. #99/#104. SoLo zeigt keinen Betrag, 113/200 „möglich“ → Betrag/Spanne prüfen.
- Elterngeld (Schnellrechner, 300 Fälle): ohne Teilzeit/Mehrlinge 180/180 gleich. FEHLER: Mehrlingszuschlag 300 € je weiteres Kind fehlt (§ 2a Abs. 4 BEEG). Teilzeit: SoLo bis 1.389 € zu hoch (nur Hinweis „anteilig weniger“) → richtig rechnen. ElterngeldPlus nicht geprüft.
- Pfändung (Justiz NRW, 300 Fälle): 300/300 auf den Cent; BGBl.-Fundstelle in src/rules.js prüfen (weicht von Justiz NRW ab).
- KiZ: Bericht steht aus (Agent lief noch, PR #103).
Berichte: /home/claude/ausgabe/amtlich/ (alte Sitzung) – Kopien in docs/entwuerfe/pruefungen-21-11/ nachlegen.

## Sprachen (21.11.)
- Glossar amtlicher Begriffe: docs/entwuerfe/sprachen/glossar.json/.md, Abgleich glossar-abgleich.md/.json (Abweichungen: ar 89, so 73, ps 54, fa-AF 48, fa 47 …). Fürs nächste Update: Begriffe je Sprache vereinheitlichen (z. B. ar „Frist“ = مهلة statt موعد; „Bescheid“ in fa/fa-AF/ps/so übersetzen statt deutsch lassen; en decision vs notice; pl sprzeciw), höfliche Anrede, Dari-Wortschatz.
- Für fa-AF, ps, so gibt es keine amtlichen Übersetzungen (nur Integreat) → besonders vorsichtig, Deutsch-Netz (#112) als Absicherung.
