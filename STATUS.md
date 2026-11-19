# STATUS – SoLo (Sozialleistungslotse)

Stand: Version 1.4.0, Build 145 (Play Store AAB gebaut, nicht veröffentlicht). Branch: `claude/app-development-next-steps-2n8dzt`. Letzter Commit: 42a8ea2.

## 1. Projekt
- Offline-App für Android, iOS, Web: prüft Sozialleistungen (Anspruch wahrscheinlich/möglich, grobe Höhe, Stelle, Unterlagen), prüft Briefe (Bescheid, Pflegegutachten, Nebenkosten), erzeugt Antragsmappe und Widerspruch als PDF.
- Ziel: rechtlich wasserdicht UND maximal einfach; Korrektheit gleichrangig mit Bedienbarkeit. Zielgruppe: Laien ohne Bürokratie- und Technikwissen.
- Stack: Vanilla JS, ein-Datei-Web-Build. Capacitor 8 für Android/iOS. Tesseract (Web) bzw. natives TextRecognition-Plugin für OCR, pdf.js 3.11.174 für PDF. Tests: Node-Skripte + Playwright. 8 Sprachen (Prüfpaket und Pflege-Assistent nur Deutsch).
- Build: `scripts/build.js` (src/template.html + src/app.js + src/lang/*.json + erweiterungen/* → `dist/sozialleistungslotse.html`), `scripts/build-app.js` (→ `app/www`, eigenes NATIVE_SCAN-Markup und CSP), `tools/paket-bauen.sh <VC> <dir> <jks> <pwfile>` (AAB, `OHNE_TESTS=1`).
- Dateien: `src/rules.js` (Rechenregeln), `src/app.js` (UI), `src/behoerden.js` (Stellen + Anschriften), `src/plz.js`, `erweiterungen/vorschau.js|html` (Prüfpaket), `brief-lesen.js`, `pflege-assistent.js`, `pflege-fragen.js`, `content/*.json` (Behörden, PLZ), `docs/` (Prüfliste, Quellen, Store, WBS-Grenzen).

## 2. Erledigt (im Repo)
- Branch `claude/zwei-wege-but`: Kachel „Zwei Wege“ nennt Bildung und Teilhabe in beiden Wegen; neuer Reiter „Einstellungen“ (4. Knopf unten) mit Unterreitern „Einstellungen“ (Sprache, Große Schrift, Angaben löschen; Kopf-Schalter bleiben vorerst) und „Informationen“ (Passt ein Ergebnis nicht zum Bescheid, So rechnet der Check und woher die Werte kommen, Hinweise, Impressum). Getestet: npm test, e2e-briefe, e2e-einfach, a11y. Tests angepasst (Sprache/Einfach per Skript). Offen: test:app nicht gelaufen.
- Rechenkern: Grundsicherungsgeld, Wohngeld, Kinderzuschlag, Kindergeld, BuT, GSA, UVG, BAföG, Pflege, ALG I, Krankengeld, Elterngeld, Mutterschaftsgeld, Kinderkrankengeld, Blindengeld, WBS, ABL, Rundfunkbefreiung u. a. Werte 2027 mit automatischem Umschalten zum 1.1.2027. Landesleistungen und WBS-Grenzen aller 16 Länder (Saarland: nur Bundeswerte, siehe 4).
- Ergebnis: Karten nach Zutreffen sortiert, einklappbar („Mehr anzeigen“), Kachel „Zwei Wege“ (Grundsicherungsgeld vs. Wohngeld+KiZ), „Gut zu wissen“, Kinderkrankengeld per Frage, Hinweise in den Karten.
- Brief prüfen auf allen Seiten: Absender wählen, dann Scannen / PDF (digital und eingescannt) / Text einfügen / selbst eingeben; erkannte Werte gelb markiert; Abweichungskarten mit Paragraf; Widerspruch und Antworten als PDF (teilen, drucken, speichern).
- Pflege: geführter Assistent (eine Frage je Bildschirm), Gutachten-Vergleich mit jedem Punkt (Module, m5, 5.16), Erklärseite zu Pflegeleistungen.
- Antragsmappe: Anschreiben mit Empfänger, Angabenblatt, Unterlagenliste, Antragsformular-Hilfe (Vorschau, Kopieren, Abhakliste). Daten aus PLZ/Anschrift vorbefüllt.
- Anschriften: Bayern vollständig (Kreise, Jobcenter, Familienkasse N/S, ZBFS, Bezirke); 302 Kreise/Städte bundesweit mit Anschrift (Quelle, Abrufdatum). Rundfunk: feste Anschrift.
- Vorlesen überall entfernt. Einfache Sprache (Werkstatt-Version). Barrierefreiheit (axe, WCAG 2.2 AA).
- Tests grün vor Build 145: `npm test`, `npm run test:erweiterungen`, `npm run test:e2e`, `npm run test:app` (66 Checks).
- Store-Texte und -Bilder (`docs/STORE.md`, `tools/store-bilder.js`), `docs/UPDATE-1.4.0.md`. Faktenblatt und Anschriften-Übersicht als Artefakte (siehe 6).

## 3. Entscheidungen / Regeln
- Korrektheit zuerst: unsichere Fälle „möglich“ statt „wahrscheinlich“; nie falschen Empfänger einsetzen, dann nur Art der Stelle.
- Anschrift wird nur eingesetzt, wenn PLZ bekannt (Frage oder Antragsmappe). Widerspruch nimmt die Stelle aus dem eingelesenen Bescheid.
- Außerhalb Bayerns nur Kreis/Stadt mit Anschrift. Wohngeld: Kreisanschrift + Weiterleitung nach § 16 SGB I. WBS gehört NICHT dazu (Gemeinde zuständig).
- Jede Anschrift/Grenze braucht amtliche Quelle + Datum.
- Kein Vorlesen. Keine Fristen-Kalender. Keine mitgelieferten Formulare, nur geprüfte amtliche Links.
- Mietobergrenze: App rechnet Orientierung (§ 12 WoGG +10 % + Heizung), echte Grenze je Kommune unbekannt; Hinweis in der App.
- Erweiterungen (Prüfpaket) per signierter Lizenzdatei, offline geprüft; privater Lizenzschlüssel nie im Repo.

## 4. Bekannte Probleme / offen
- WBS-Grenze Saarland nicht abrufbar (Server sperrt): Bundeswerte als Untergrenze (`docs/WBS-GRENZEN.md`).
- WBS-Empfänger fehlt: im Antrag nur „Wohnungsamt deiner Stadt oder Gemeinde“ (`ANTRAG.wbs`, `ZUST_LAND.wbs`).
- Außerhalb Bayerns keine Anschrift für Jobcenter, Familienkasse, Versorgungsamt, Elterngeldstelle, Eingliederungshilfe, Hilfe zur Pflege; in Landkreisen auch nicht UVG/BuT.
- Kasse/Pflegekasse/Rentenversicherung: Träger der Person unbekannt, keine Anschrift möglich.
- Prüfpaket und Pflege-Assistent nur auf Deutsch. Fachliche Prüfung der Pflege-Inhalte durch Expertin/Experten steht aus.
- iOS: GitHub-Workflow `ios-testflight.yml` (Inputs build, rechner) lief für Build 143 und 145 ohne Runner und wurde nach 15 Minuten abgebrochen (macOS-Billing prüfen) – Alternativen Codemagic oder Mac/Xcode. Swift Playgrounds geht nicht.
- Tag-Push ist blockiert (403), nicht umgehen.
- Build 145 AAB: `/home/user/Claud/SoLo-PlayStore-145.aab` (gitignored), Zips in der Scratchpad der alten Sitzung (nicht dauerhaft).

## 5. Nächste Schritte (priorisiert)
1. WBS-Empfänger: kreisfreie Städte bundesweit (Daten in `content/behoerden-deutschland.json`, typ `stadt`) als „Wohnungsamt“; Bayern: Landkreise erst nach amtlicher Prüfung (Große Kreisstädte!). Andere Landkreise: unverändert ohne Anschrift. In `src/behoerden.js` ZUST ergänzen (`wbs`), Test in `test/test-behoerden.js`.
2. Bayerisches Landespflegegeld (`lpg`): feste Anschrift Landesamt für Pflege (Quelle prüfen), `D.fest` wie Rundfunk.
3. Weitere feste Anschriften mit Quelle: Mutterschaftsgeldstelle BAS, Landesämter (Ausweis, Elterngeld, Blindengeld, Eingliederungshilfe), Rentenversicherung je Land.
4. Nach Anschrift-Änderungen: `docs/PRUEFLISTE.md`, Faktenblatt-Sätze angleichen, Tests laufen lassen.
5. Große Recherche nur mit Netzfreigabe: Jobcenter/Familienkassen/Agenturen außerhalb Bayerns, WBS-Gemeindestellen.
6. WBS Saarland aus amtlicher Quelle (z. B. Stadt/Ministerium).
7. iOS-Build klären (Billing oder Codemagic/Mac), dann TestFlight.
8. Play Store: Build 145 hochladen (Konsole), Store-Texte aus `docs/STORE.md`. Nur auf Nutzerwunsch.
9. Übersetzungen Prüfpaket/Pflege-Assistent; Expertenprüfung Pflege.

## 6. Arbeitsregeln für den nächsten Chat
- Nur auf Branch `claude/app-development-next-steps-2n8dzt`. Kein Force-Push, kein PR ohne Auftrag.
- Commit-Fuß: `Co-Authored-By: Claude <Modell> <noreply@anthropic.com>` und `Claude-Session: <Sitzungslink>`; keine Modell-ID im Repo.
- Builds NUR auf ausdrücklichen Wunsch starten. Keine Store-Aktionen ohne Freigabe. Netz-/Rechtegrenzen nicht umgehen.
- Keystore + Passwort liegen nur in der Scratchpad (`schluessel/upload.jks`, `upload-schluessel.txt`), nie in Repo oder Chat. Signatur-SHA beginnt `C8:E4:5D:61`.
- E-Mail der Nutzerin/des Nutzers privat halten. Antworten auf Deutsch, kurz, übersichtlich.
- Testen: `npm test`, `npm run test:erweiterungen`, `npm run test:e2e` (lang, 10+ Min, Timeout hoch setzen), `npm run test:app`. Nicht `npm install --omit=optional` (bricht esbuild).
- Artefakte (privat): Faktenblatt https://claude.ai/artifact/8nR97c2tqV6soVJQs3FLLg ; Anschriften-Übersicht https://claude.ai/artifact/XCWJ5EqUuvuHUXNt1bMJEV (Quelle der Übersicht: Plan zu Schritt 1–3).
- Guthaben knapp: kurze Chats, kleine Etappen, nach jeder Etappe committen und pushen.
