# STATUS – SoLo (Sozialleistungslotse)

Stand: Version 1.4.0, Build 145 (Play Store AAB gebaut, nicht veröffentlicht). Branch: `claude/app-development-next-steps-2n8dzt`. Letzter Commit: 42a8ea2.

## 1. Projekt
- Offline-App für Android, iOS, Web: prüft Sozialleistungen (Anspruch wahrscheinlich/möglich, grobe Höhe, Stelle, Unterlagen), prüft Briefe (Bescheid, Pflegegutachten, Nebenkosten), erzeugt Antragsmappe und Widerspruch als PDF.
- Ziel: rechtlich wasserdicht UND maximal einfach; Korrektheit gleichrangig mit Bedienbarkeit. Zielgruppe: Laien ohne Bürokratie- und Technikwissen.
- Stack: Vanilla JS, ein-Datei-Web-Build. Capacitor 8 für Android/iOS. Tesseract (Web) bzw. natives TextRecognition-Plugin für OCR, pdf.js 3.11.174 für PDF. Tests: Node-Skripte + Playwright. 8 Sprachen (Prüfpaket und Pflege-Assistent nur Deutsch).
- Build: `scripts/build.js` (src/template.html + src/app.js + src/lang/*.json + erweiterungen/* → `dist/sozialleistungslotse.html`), `scripts/build-app.js` (→ `app/www`, eigenes NATIVE_SCAN-Markup und CSP), `tools/paket-bauen.sh <VC> <dir> <jks> <pwfile>` (AAB, `OHNE_TESTS=1`).
- Dateien: `src/rules.js` (Rechenregeln), `src/app.js` (UI), `src/behoerden.js` (Stellen + Anschriften), `src/plz.js`, `erweiterungen/vorschau.js|html` (Prüfpaket), `brief-lesen.js`, `pflege-assistent.js`, `pflege-fragen.js`, `content/*.json` (Behörden, PLZ), `docs/` (Prüfliste, Quellen, Store, WBS-Grenzen).

## 2. Erledigt (im Repo)
- Rechenkern: Grundsicherungsgeld, Wohngeld, Kinderzuschlag, Kindergeld, BuT, GSA, UVG, BAföG, Pflege, ALG I, Krankengeld, Elterngeld, Mutterschaftsgeld, Kinderkrankengeld, Blindengeld, WBS, ABL, Rundfunkbefreiung u. a. Werte 2027 mit automatischem Umschalten zum 1.1.2027. Landesleistungen und WBS-Grenzen aller 16 Länder (Saarland: nur Bundeswerte, siehe 4).
- Ergebnis: Karten nach Zutreffen sortiert, einklappbar („Mehr anzeigen“), Kachel „Zwei Wege“ (Grundsicherungsgeld vs. Wohngeld+KiZ), „Gut zu wissen“, Kinderkrankengeld per Frage, Hinweise in den Karten.
- Brief prüfen auf allen Seiten: Absender wählen, dann Scannen / PDF (digital und eingescannt) / Text einfügen / selbst eingeben; erkannte Werte gelb markiert; Abweichungskarten mit Paragraf; Widerspruch und Antworten als PDF (teilen, drucken, speichern).
- Pflege: geführter Assistent (eine Frage je Bildschirm), Gutachten-Vergleich mit jedem Punkt (Module, m5, 5.16), Erklärseite zu Pflegeleistungen.
- Antragsmappe: Empfänger je Anschreiben bearbeitbar (Feld über dem Brief, gilt für Kopiertext und PDF, „Vorschlag wiederherstellen“) und Link „Zuständige Stelle suchen“ (DuckDuckGo, kurzer Suchbegriff je Leistung `SUCHE` + Ortsname; bei Kassen/Bundesstellen ohne Ort). Noch NICHT im Build/DOM/E2E getestet (19.11.2026).
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
- WBS-Empfänger: Wohnungsamt der kreisfreien Stadt (alle Länder außer Berlin/Hamburg); Bayern zusätzlich Landratsamt in den Landkreisen OHNE Große Kreisstadt/Große Delegationsgemeinde (`D.wbsAusnahme`, BayernPortal, gegengeprüft mit BayDVWoR, ZustVBau § 5, BayMBl. 2025 Nr. 41 am 19.11.2026). In den 32 Landkreisen mit Ausnahme-Gemeinde, in Landkreisen anderer Länder, Berlin und Hamburg: nur „Wohnungsamt deiner Stadt oder Gemeinde“ (`ANTRAG.wbs`, `ZUST_LAND.wbs`). Bremen/Bremerhaven: Zuständigkeit nicht geprüft. Hinweis „PLZ eingeben“ (`beh.plzHint`) erscheint auch bei WBS, wo keine Anschrift kommt.
- Außerhalb Bayerns keine Anschrift für Jobcenter, Familienkasse, Versorgungsamt, Elterngeldstelle, Eingliederungshilfe, Hilfe zur Pflege; in Landkreisen auch nicht UVG/BuT.
- Kasse/Pflegekasse/Rentenversicherung: Träger der Person unbekannt, keine Anschrift möglich.
- Prüfpaket und Pflege-Assistent nur auf Deutsch. Fachliche Prüfung der Pflege-Inhalte durch Expertin/Experten steht aus.
- iOS: GitHub-Workflow `ios-testflight.yml` (Inputs build, rechner) lief für Build 143 und 145 ohne Runner und wurde nach 15 Minuten abgebrochen (macOS-Billing prüfen) – Alternativen Codemagic oder Mac/Xcode. Swift Playgrounds geht nicht.
- Tag-Push ist blockiert (403), nicht umgehen.
- Build 145 AAB: `/home/user/Claud/SoLo-PlayStore-145.aab` (gitignored), Zips in der Scratchpad der alten Sitzung (nicht dauerhaft).

## 5. Nächste Schritte (priorisiert)
1. ~~WBS-Empfänger~~ weitgehend erledigt. Rest: in den 32 bayerischen Ausnahme-Landkreisen Stadtanschrift der Großen Kreisstadt/Delegationsgemeinde je nach PLZ/Gemeinde (PLZ-Daten sind nur kreisgenau, Gemeinde nötig); Bremen prüfen; `beh.plzHint` für WBS anpassen.
2. ~~Bayerisches Landespflegegeld (`lpg`)~~ erledigt: `D.fest.landesamtPflege` (Postfach 13 65, 92203 Amberg; Quelle lfp.bayern.de, 19.11.2026), nur Bayern.
3. Teilweise erledigt: Familienkassen für HE, NI+HB, SN, ST+TH, BE+BB, HH+SH+MV (Nord), RP+SL (`D.familienkasseDE`, `D.fkLand`, arbeitsagentur.de, 19.11.2026; Nord und RP-SL nur indirekt belegt). NRW (West 50574 Köln, Nord 44785 Bochum, Ost 44117 Dortmund) und BW (West 76088 Karlsruhe, Ost 70146 Stuttgart): Postanschriften belegt, aber keine amtliche Kreis-Zuordnung auffindbar (BA-Dienststellensuche dynamisch) -> bewusst ohne Anschrift. Jobcenter: nur Stuttgart, Bonn, Wiesbaden belegt (`D.jobcenterDE`). BAS-Mutterschaftsgeldstelle (Friedrich-Ebert-Allee 38, 53113 Bonn, BAS-Antragsformular 2026) bewusst NICHT als Empfänger: Standard ist die Krankenkasse. Rentenversicherung: bewusst KEIN Empfänger je Land (Träger hängt von der Person ab, § 127 SGB VI; 14 Regionalträger + DRV Bund + Knappschaft-Bahn-See; Hinweis auf § 16 SGB I, Servicetelefon 0800 1000 4800). Landesämter (Recherche 19.11.2026, noch NICHT eingebaut, Kandidaten): Ausweis BE LAGeSo (Postfach 31 09 29, 10639 Berlin; Postfach gilt fürs ganze LAGeSo, prüfen), RP LSJV (56065 Koblenz, Info-PDF), HH Versorgungsamt (Adolph-Schönfelder-Str. 5, 22083 Hamburg, keine eigene Postanschrift), HB Amt für Versorgung und Integration (Doventorscontrescarpe 172 D, 28195 Bremen, Zuständigkeit nur aus Formular); Elterngeld BW L-Bank (L-Bank, Familienförderung, 76113 Karlsruhe, aus Antrag); Eingliederungshilfe HE LWV Regionalverwaltung Kassel (Ständeplatz 6-10, 34117 Kassel, nur Teilgebiet). Alle übrigen Länder/Leistungen nicht landesweit oder nicht belegt (SL, SH, NW, SN, ST, TH, MV, BB, NI: Seiten nicht abrufbar oder Zuständigkeit je Kreis); vor dem Einbau Impressum/Antragsseite der Behörde gegenprüfen.
4. Nach Anschrift-Änderungen: `docs/PRUEFLISTE.md`, Faktenblatt-Sätze angleichen, Tests laufen lassen.
5. Jobcenter außerhalb Bayerns (404 Bezirke): mit Web-Tools kaum machbar (viele Seiten robots-gesperrt, Impressen ohne Post-/Hausanschrift, BA-Übersicht ohne Anschriften). Braucht eine Anschriftenliste als Quelle. Außerdem offen: Agenturen, WBS-Gemeindestellen.
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
