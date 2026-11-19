# Änderungen (für Tester und Store)

Versionsname (sichtbar im Store) und Versionsnummer (für Google/Apple, muss steigen). Die Versionsnummer kommt aus dem Build.

## 1.4.0 (ab Versionsnummer 143, November 2026)
- „Vorlesen“ entfernt (einfache Version und Pflegegrad-Einschätzung), ab Versionsnummer 144
- Ab Versionsnummer 145: unter jedem Feld mit Amtsbegriff in „Brief prüfen“ ein Hinweis, wo der Wert im Brief steht (Berechnungsbogen, erste Seite, Briefkopf); „formloser Antrag“ in der Ausfüllhilfe erklärt (8 Sprachen); Pflegegutachten empfiehlt Scannen oder PDF statt rund 60 Bewertungen von Hand; Kachel „Zwei Wege“ beginnt mit „Stelle beide Anträge gleichzeitig“; Hinweis bei fremder Sprache empfiehlt Scannen oder PDF.
- Ab Versionsnummer 144 außerdem: **Brief prüfen** mit Ergebnis als Karten je Abweichung (vollständige Tabelle zum Aufklappen), „Das steht in deinem Bescheid“, Name und Anschrift aus der Ausfüllhilfe, Stelle, Aktenzeichen, Nummer der Bedarfsgemeinschaft, Kindergeld- und Versichertennummer aus dem Brief (gelb markiert, Markierung jetzt sichtbar); jedes Schreiben als PDF teilen, drucken oder speichern, mit Hinweis zur Abgabe. **Antragsformular**: gleiches Muster wie die anderen Kacheln, Vorschau des fotografierten Formulars bzw. der PDF-Seiten (nur im Arbeitsspeicher), Ergebnis in zwei Teilen (direkt abschreiben, Liste zum Abhaken), Kopieren über die Zwischenablage der App mit Rückmeldung.
- **Pflegegrad selbst einschätzen** auf der Leistungsseite, mit einfacher Logik: kurze Anleitung, je Bereich zuerst eine Ja/Nein-Frage, Erklärung direkt unter jeder Frage, gleiche Antworten je Bereich, „Frage x von y“. Bereich 5 als Liste zum Ankreuzen, danach nur zu angekreuzten Punkten „Wie oft?“ (von selten nach oft). Ergebnis mit Pflegegrad, Pflegegeld (aufs Konto) und Entlastungsbetrag (Budget), Hauptknopf „Ergebnis übernehmen“; Rechenweg zum Aufklappen.
- **Erklärseite „So funktionieren die Leistungen der Pflegekasse“**: Geld oder Budget, Pflegegeld, Pflegedienst, Entlastungsbetrag, Verhinderungs- und Kurzzeitpflege, Hilfsmittel; Pfeil-Links aus den Pflege-Karten.
- **Brief prüfen**: Übersicht nur mit Kacheln; in der Kachel oben „Brief von: …“, dann die Wahl Scannen, PDF wählen, Text einfügen oder Werte selbst eingeben. Werte aus dem Brief gelb markiert, Haushalt aus „Leistungen“. Anhörung und Aufforderung zur Mitwirkung werden erklärt.
- **PDF**: digitale PDFs werden direkt gelesen, eingescannte Seiten über die Texterkennung des Geräts (pdf.js, Apache 2.0, offline in der App).
- **Antragsformular** als siebte Kachel: alle Felder erkannt und gruppiert, Name des Formulars, Krankenkasse und Aufenthalt neu, Werte aus dem Leistungscheck nur, wenn eingetragen.
- **Pflegegutachten**: jede Bewertung wird mit der eigenen Einschätzung verglichen (Kriterien nach Punkten, Sonde, Inkontinenz, jede Maßnahme in Bereich 5, 5.16). Abweichungen erscheinen als Karten mit Feld für den Alltag und gehen ins Schreiben; nicht eingetragene Bewertungen zählen nicht.
- **Ergebnis**: zuerst, was zutrifft; Karten zum Aufklappen; keine Häkchen-Leiste; Kachel „Zwei Wege“ (Grundsicherungsgeld oder Wohngeld und Kinderzuschlag); Hinweise zu einzelnen Leistungen in deren Karten; „Gut zu wissen für alle Anträge“; unpassende Leistungen für besondere Lagen in einer Zeile. Landespflegegeld außerhalb Bayerns ausgeblendet.
- **Kinderkrankengeld** nur noch, wenn gerade ein Kind krank ist (neue Frage bei den Kindern).

## 1.3.1 (ab Versionsnummer 142, November 2026)
- Bereich „Fristen“ entfernt, auch auf der Startseite, im Fristrechner und beim automatischen Eintragen. Die Leiste hat drei Bereiche: Start, Leistungen, Brief prüfen. Die Widerspruchsfrist steht weiter beim jeweiligen Schreiben. Fristen, die mit Build 141 gespeichert wurden, löscht die App beim Start.
- Store-Bilder und Store-Texte neu, mit neuem Logo (Brief mit Siegel)

## 1.3.0 (ab Versionsnummer 141, November 2026)
- **Neuer Aufbau mit vier Bereichen** (Leiste unten, auf dem Computer oben als Reiter): Start, Leistungen, Brief prüfen, Fristen. Die Startseite zeigt zwei Wege („Welche Hilfen stehen mir zu?“ und „Ich habe einen Brief bekommen“) und die nächsten Fristen. Der bisherige Leistungscheck ist unverändert unter „Leistungen“.
- **Brief prüfen**: Kacheln nach Absender (Jobcenter, Sozialamt, Wohngeldstelle, Familienkasse, Pflegekasse, Vermieter) öffnen die Prüfung: Bescheid Grundsicherungsgeld, Grundsicherung im Alter, Wohngeld, Kinderzuschlag, Pflegegutachten mit Widerspruch oder Höherstufung, Nebenkostenabrechnung. Vorerst nur auf Deutsch, mit Hinweis in den anderen Sprachen.
- **Fristen**: Liste auf dem Gerät mit Tagezähler; Widerspruchsfristen aus „Brief prüfen“ werden automatisch eingetragen (nicht doppelt), dazu eigene Fristen und ein Rechner für Widerspruchsfrist und Folgeantrag. Punkt in der Leiste bei Fristen in den nächsten 14 Tagen.
- Direkt öffnen: `#leistungen`, `#briefe`, `#fristen`
- Grundsicherung im Alter und bei Erwerbsminderung: neues Feld „Davon Betriebsrente, Riester-Rente oder private Rente“. Davon bleiben 100 € und 30 % des Rests frei, höchstens 281,50 € (§ 82 Abs. 4 SGB XII). Bisher wurde diese Rente voll angerechnet, der Anspruch also unterschätzt.
- Grundrentenfreibetrag (§ 82a SGB XII, § 17a WoGG) nur noch auf die gesetzliche Rente, nicht auf eine enthaltene Betriebs- oder Riester-Rente
- Fehler behoben: Bei einer Rente unter 100 € mit 33 Grundrentenjahren war der Freibetrag größer als die Rente und verringerte anderes Einkommen
- Kinderzuschlag genauer: Rente, Arbeitslosengeld I, Krankengeld oder Elterngeld der Eltern über ihrem Bedarf mindern den Kinderzuschlag voll, nur Arbeitseinkommen zu 45 % (§ 6a Abs. 6 BKGG). Bisher wurde alles zu 45 % angerechnet und der Kinderzuschlag zu hoch eingeschätzt
- Grundsicherungsgeld: Versicherungspauschale (30 €) nicht mehr zusätzlich zum Grundfreibetrag, wenn dieselbe Person Lohn und Rente hat
- Rundfunkbeitrag: Befreiung auch bei möglicher Blindenhilfe, Hilfe zur Pflege oder BAföG (nicht bei den Eltern) wird als „möglich“ angezeigt
- Prüfbericht aller Leistungen: docs/PRUEFUNG-LEISTUNGEN.md
- Bedienbarkeit: Schriftgröße aus den Systemeinstellungen (iOS und Android), Tippflächen mindestens 44 Pixel, Seitenstruktur für Screenreader

## 1.2.0 (ab Versionsnummer 136, November 2026)
- Wohngeld genauer: freiwilliges Feld für die Heizkosten (Bruttokaltmiete statt Schätzung)
- Elterngeld: Geschwisterbonus (10 %, mindestens 75 €) wird eingerechnet
- Kinderzuschlag, Kindergeld-Formulare: genauere Links und Ausfüllhilfe
- Rückmeldung per E-Mail unter den Ergebnissen („Passt ein Ergebnis nicht zu deinem Bescheid?“): Entwurf mit App-Version und Einstufungen, ohne Angaben aus dem Fragebogen
- Antragsmappe im dunklen Modus: Formular-Links wieder gut lesbar
- Kinderzuschlag genauer: Wohnanteil der Eltern jetzt exakt nach der Tabelle der Familienkasse (DA-KiZ, Stand 20.02.2026) statt Näherung (Abweichung bisher bis 1 Prozentpunkt)
- Neue feste Tests mit den amtlichen Rechenbeispielen der Bundesagentur (Fachliche Weisungen §§ 11-11b SGB II, DA-KiZ)
- Kinderzuschlag, Grundsicherungsgeld: Alleinerziehende mit einem Kind, das noch 6 sein kann, bekommen nicht mehr fälschlich „eher nicht“ (Mehrbedarf 36 % gilt bis unter 7; gefunden im großen Abgleich mit dem KiZ-Lotsen)
- Drucken der Antragsmappe (Web-Version): feste Briefränder nach DIN 5008, auch wenn im Druckdialog „Ränder: keine“ eingestellt ist
- Antragsmappe in der Android-App: eigene Knöpfe „Drucken“ (Druckdialog des Systems) und „PDF speichern“ (ab Android 10 direkt in „Downloads“, sonst „Speichern unter“)
- „Fristen in den Kalender“ entfernt
- Impressum je Plattform: iPhone-App nennt Natascha Cabrerizo y Polo (Apple-Konto), Android und Web David Cabrerizo; eigene Datenschutzerklärung für iOS
- Antragsmappe: Knöpfe einzeln beschriftet (Drucken, PDF speichern, PDF teilen, Text kopieren), kein doppelter Knopf „Teilen oder speichern“ mehr in der App
- Formulare: keine mitgelieferten oder vorausgefüllten Vordrucke mehr, nur geprüfte Links auf die amtlichen Seiten mit Ausfüllhilfe (defekte Links zum WBS in Bayern und Brandenburg ersetzt bzw. durch Hinweis ersetzt)
- Entweder Formular oder formloser Antrag: Gibt es einen Formular-Link, erstellt die Mappe keinen formlosen Brief für diese Leistung
- Mappe: Bei Leistungen ohne Formular-Link (z. B. Grundsicherung im Alter) steht bei den Formularen, dass der formlose Antrag in der Mappe liegt
- Wohnberechtigungsschein: Stufen je Land mit ihren Grenzen (Berlin WBS 140/180/220, Hamburg/Schleswig-Holstein/Mecklenburg-Vorpommern Förderwege, NRW Einkommensgruppe A/B, Bremen, Rheinland-Pfalz, Sachsen-Anhalt, Thüringen) und welche Stufe das Einkommen voraussichtlich erreicht
- Wohngeld außerhalb Bayerns: auch für Landkreise die Anschrift der Kreisverwaltung mit Hinweis auf Weiterleitung (§ 16 SGB I); Saale-Holzland-Kreis ergänzt

## 1.1.0 (ab Versionsnummer 133, November 2026)
- Neu gerechnet statt nur erwähnt: Selbstständige (eigene Einkommensart), Wohneigentum, Auto, Mitbewohner und Verwandte in der Wohnung, angemessene Miete (Grenze nach Wohngeld-Höchstbeträgen plus 10 %), EU-Bürger (Leistungsausschluss ohne Arbeit)
- Ausfüllhilfe mit den amtlichen Formularen: SoLo sucht zu den gewählten Leistungen die passenden Formulare (Jobcenter: Hauptantrag und Anlagen EK, KDU, VM, KI, WEP, VE, UH2, UH3, MEB, HG, EKS, SV; Einkommens- und Mietbescheinigung; Kinderzuschlag; Wohngeld; Wohnberechtigungsschein: Landesvordruck mit Ausfüllhilfe für 6 Länder, Link für Bayern und Hamburg, sonst Hinweis, wo es ihn gibt)
- Kindergeld, Kinderzuschlag, Wohngeld: Link auf die amtliche Formularseite mit Ausfüllhilfe (welche Anlagen, Nachweise, Fristen; Kinder ab 18; Kind mit Behinderung); Grundsicherung im Alter: Antrag (Muster Deutscher Verein)
- Werte mit der staatlichen Sozialplattform abgeglichen (docs/ABGLEICH-SOZIALPLATTFORM.md)
- Wohnberechtigungsschein: Einkommensgrenzen aller Länder an amtlichen Quellen geprüft und eingerechnet (bisher nur 5 Länder, sonst Bundeswerte), füllt in der App Name, Anschrift und die passenden Ja/Nein-Fragen vor und teilt sie als PDF; dazu die Unterlagenliste fürs Jobcenter
- Modernere Optik bei gleicher Bedienung
- Unterhalt, den man zahlt oder zahlen muss, wird berücksichtigt (Grundsicherungsgeld, Kinderzuschlag, Wohngeld)
- Geschätztes Arbeitslosengeld, Krankengeld und Elterngeld zählen bei anderen Leistungen als künftiges Einkommen
- 2027: neue Minijob-Grenze und Kinderkrankentage, Hinweise auf geplante Änderungen (Kindergeld, Wohngeld, Kinderzuschlag, Unterhaltsvorschuss, Pflegegeld)
- Korrektur Kinderzuschlag (gefunden durch Abgleich mit dem KiZ-Lotsen): ob die Familie ohne Grundsicherung auskommt, wird jetzt mit dem bereinigten Einkommen geprüft (bisher zu optimistisch); reicht es nur zusammen mit Wohngeld, steht das dabei
- Korrektur Elterngeld (gefunden durch Abgleich mit dem amtlichen Elterngeldrechner): Pauschbetrag nach § 2c BEEG wird abgezogen, bisher etwa 54 € zu hoch; 33 von 33 Vergleichswerten gleich
- Korrektur Wohngeld (gefunden durch Abgleich mit dem amtlichen Wohngeldrechner): Werbungskostenpauschale wird abgezogen (bisher zu niedrig geschätzt), Mindestwerte nach Anlage 3 WoGG (bisher bei sehr kleinem Einkommen zu hoch); 60 von 60 Vergleichsfällen gleich
- Korrektur: Wohngeld bei Krankengeld und Werkstattlohn nicht mehr zu hoch
- Korrektur: Minus von der Handy-Tastatur und versehentlich eingetipptes Datum werden bei Beträgen abgewiesen
- Neue Hinweise: was SoLo nicht einrechnet, Widerspruch und Überprüfungsantrag, Beratungsanspruch
- Datenschutz: Abschnitt zur optionalen Auswertung mit Claude (nur Web-Version in Claude)

## 1.0.0 (bis Versionsnummer 132)
- Erste Testversionen im geschlossenen Test

---

# Entwicklungsverlauf (intern)

Aus `STATUS.md` verschoben am 19.11.2026 (ausführliche Einträge zu Erledigtem und älteren Plänen, unverändert). Aktueller Stand: `STATUS.md`.

## Verlauf: 2. Erledigt (im Repo)
- Branch `claude/zwei-wege-but`: Kachel „Zwei Wege“ nennt Bildung und Teilhabe in beiden Wegen; neuer Reiter „Einstellungen“ (4. Knopf unten) mit Unterreitern „Einstellungen“ (Sprache, Große Schrift, Angaben löschen; Kopf-Schalter bleiben vorerst) und „Informationen“ (Passt ein Ergebnis nicht zum Bescheid, So rechnet der Check und woher die Werte kommen, Hinweise, Impressum). Getestet: npm test, e2e-briefe, e2e-einfach, a11y. Tests angepasst (Sprache/Einfach per Skript). Offen: test:app nicht gelaufen.
- Rechenkern: Grundsicherungsgeld, Wohngeld, Kinderzuschlag, Kindergeld, BuT, GSA, UVG, BAföG, Pflege, ALG I, Krankengeld, Elterngeld, Mutterschaftsgeld, Kinderkrankengeld, Blindengeld, WBS, ABL, Rundfunkbefreiung u. a. Werte 2027 mit automatischem Umschalten zum 1.1.2027. Landesleistungen und WBS-Grenzen aller 16 Länder (Saarland: nur Bundeswerte, siehe 4).
- Ergebnis: Karten nach Zutreffen sortiert, einklappbar („Mehr anzeigen“), Kachel „Zwei Wege“ (Grundsicherungsgeld vs. Wohngeld+KiZ), „Gut zu wissen“, Kinderkrankengeld per Frage, Hinweise in den Karten.
- Brief prüfen auf allen Seiten: Absender wählen, dann Scannen / PDF (digital und eingescannt) / Text einfügen / selbst eingeben; erkannte Werte gelb markiert; Abweichungskarten mit Paragraf; Widerspruch und Antworten als PDF (teilen, drucken, speichern).
- Pflege: geführter Assistent (eine Frage je Bildschirm), Gutachten-Vergleich mit jedem Punkt (Module, m5, 5.16), Erklärseite zu Pflegeleistungen.
- Antragsmappe: Empfänger je Anschreiben bearbeitbar (Feld über dem Brief, gilt für Kopiertext und PDF, „Vorschlag wiederherstellen“) und Link „Zuständige Stelle suchen“ (DuckDuckGo, kurzer Suchbegriff je Leistung `SUCHE` + Ortsname; bei Kassen/Bundesstellen ohne Ort). Getestet 19.11.2026 (DOM-Tests [empf], a11y hell/dunkel).
- Antragsmappe: Anschreiben mit Empfänger, Angabenblatt, Unterlagenliste, Antragsformular-Hilfe (Vorschau, Kopieren, Abhakliste). Daten aus PLZ/Anschrift vorbefüllt.
- Anschriften: Bayern vollständig (Kreise, Jobcenter, Familienkasse N/S, ZBFS, Bezirke); 302 Kreise/Städte bundesweit mit Anschrift (Quelle, Abrufdatum). Rundfunk: feste Anschrift.
- Netto aus Brutto (19.11.2026): Lohnsteuer/Soli/Kirchensteuer wie amtlicher Programmablaufplan 2026, Sozialabgaben mit Übergangsbereich (`Rules.nettoLohn`, `bruttoAusNetto`, `lohnAnnahmen`). Ersetzt pauschal 80 % (Netto) und / 0,7 (Brutto beim Lohn). Im Einkommen: geschätztes Netto als Hinweis, Knopf „Netto ausrechnen“ (Steuerklasse und Kirchensteuer als große Knöpfe, „Übernehmen“ füllt das Feld). Test `test/test-netto.js`.
- Pfändung und P-Konto (19.11.2026): großer Startknopf „Ich habe Schulden“, Ansicht `#pfaendung`: Lohn oder Konto wählen, Unterhalt per Zahlenknopf, Ergebnis zuerst, Hinweise aufklappbar. § 850c ZPO mit Tabelle 2026 (BGBl. 2026 I Nr. 80, gilt bis 30.6.2027), P-Konto §§ 899, 902 ZPO. Texte in 8 Sprachen.
- Ersparnisse aufteilen (19.11.2026): Knopf unter dem Vermögensfeld, große Auswahlknöpfe (Konto, Sparbuch, ETF, Bausparvertrag, Lebens-/Rentenversicherung, Riester/Rürup/Betriebsrente, Zinsen). Riester & Co. zählen nicht; Versicherung nur „möglich“, wenn sie über die Grenze bringt (`evaluate` rechnet dafür ein zweites Mal); Zinsen als Einkommen (Grundsicherungsgeld ab 100 € im Jahr, Wohngeld vorsichtig voll). Test `test/test-ersparnis.js`.
- Einmalige Hilfen (19.11.2026): Hinweise in den Karten Grundsicherungsgeld/GSA (Erstausstattung, Umzug mit Zusicherung, Schwangerschaft auch ohne laufende Leistung).
- Neue Karte „Kostenlose Familienversicherung“ (§ 10 SGB V, Grenze 1/7 Bezugsgröße: 2026 565 €, 2027 590 €); jetzt 32 Leistungen (Store-Text, Webseite, docs/index.html angepasst).
- Bereich „Geld sparen im Alltag“ (19.11.2026): vierter Startknopf, Themen Strom, Heizen, Essen (mit 6 eigenen Rezepten, nur Deutsch), Verträge/Sozialtarife, Schulden (führt zur Pfändung).
- Konkurrenzvergleich (19.11.2026): Deutschland-Rechner (Wohngeld, Bürgergeld, Pflegegrad), Online-Bescheidprüfer und Nebenkosten-Dienste sind schwächer als SoLo; übernommen wurde nur, was besser ist (Netto-Berechnung, Pfändung).
- Vorlesen überall entfernt. Einfache Sprache (Werkstatt-Version). Barrierefreiheit (axe, WCAG 2.2 AA).
- Tests grün am 19.11.2026 (Branch claude/schritt-1, Web-Build und App-Build nur lokal für Tests): `npm test`, `npm run test:erweiterungen`, `npm run test:e2e`, `npm run test:app` (66 Checks). Für e2e-pdf vorher `cd app && npm ci`.
- Früher: Tests grün vor Build 145: `npm test`, `npm run test:erweiterungen`, `npm run test:e2e`, `npm run test:app` (66 Checks).
- Store-Texte und -Bilder (`docs/STORE.md`, `tools/store-bilder.js`), `docs/UPDATE-1.4.0.md`. Faktenblatt und Anschriften-Übersicht als Artefakte (siehe 6).

## Verlauf: Sprachen fr, fa-AF, fa, ps, so (19.11.2026)
- Neu: Französisch, Dari (`fa-AF`), Farsi (`fa`, iranisches Persisch), Paschtu (`ps`), Somali (`so`). Dari/Farsi/Paschtu rechts nach links. Startsprache: genaue Gerätesprache zuerst (fa-AF → Dari), sonst die ersten zwei Buchstaben (fa-IR → Farsi).
- Datum in fa-AF/fa/ps als TT.MM.JJJJ (`Fmt.datum`), sonst Gefahr persischer Kalender/Ziffern. PDF bei allen RTL-Sprachen deutsch (`pdfRtl()`, Schrift ohne arabische Zeichen).
- Übersetzt durch KI (je ein Agent), automatisch geprüft (`/home/claude/werkzeug/pruefe.py`-Logik = Schlüssel, Platzhalter, Zahlen, §, Zeilen; im Repo: test-sprachen-zahlen). Unsichere Fachbegriffe bewusst deutsch.
- **Dari, Paschtu, Somali NICHT muttersprachlich geprüft** (Agenten-Selbsteinschätzung: Dari gut bis mittel, Paschtu und Somali mittel). Farsi (fa): Agenten-Selbsteinschätzung hoch, ebenfalls nicht muttersprachlich geprüft. Vor Veröffentlichung Gegenlesen durch Muttersprachler empfohlen, v. a. t.* und es.*. Französisch: hohes Niveau, ebenfalls nicht extern geprüft.
- Größengrenze der Web-Datei im Test von 2,5 auf 3 MB angehoben (jetzt ca. 2,56 MB).
- Store-Texte, Store-Bilder-Skript und docs/index.html auf 13 Sprachen angepasst; die Store-Bilder selbst sind noch nicht neu erzeugt (`tools/store-bilder.js`, nur auf Anweisung).

## Verlauf (Stand vor 19.11.2026): 4. Bekannte Probleme / offen
- WBS-Grenze Saarland nicht abrufbar (Server sperrt): Bundeswerte als Untergrenze (`docs/WBS-GRENZEN.md`).
- WBS-Empfänger: Wohnungsamt der kreisfreien Stadt (alle Länder außer Berlin/Hamburg); Bayern zusätzlich Landratsamt in den Landkreisen OHNE Große Kreisstadt/Große Delegationsgemeinde (`D.wbsAusnahme`, BayernPortal, gegengeprüft mit BayDVWoR, ZustVBau § 5, BayMBl. 2025 Nr. 41 am 19.11.2026). In den 32 Landkreisen mit Ausnahme-Gemeinde, in Landkreisen anderer Länder, Berlin und Hamburg: nur „Wohnungsamt deiner Stadt oder Gemeinde“ (`ANTRAG.wbs`, `ZUST_LAND.wbs`). Bremen/Bremerhaven: Zuständigkeit nicht geprüft. Hinweis „PLZ eingeben“ (`beh.plzHint`) erscheint auch bei WBS, wo keine Anschrift kommt.
- Außerhalb Bayerns keine Anschrift für Jobcenter, Familienkasse, Versorgungsamt, Elterngeldstelle, Eingliederungshilfe, Hilfe zur Pflege; in Landkreisen auch nicht UVG/BuT.
- Kasse/Pflegekasse/Rentenversicherung: Träger der Person unbekannt, keine Anschrift möglich.
- Prüfpaket und Pflege-Assistent nur auf Deutsch. Fachliche Prüfung der Pflege-Inhalte durch Expertin/Experten steht aus.
- iOS: GitHub-Workflow `ios-testflight.yml` (Inputs build, rechner) lief für Build 143 und 145 ohne Runner und wurde nach 15 Minuten abgebrochen (macOS-Billing prüfen) – Alternativen Codemagic oder Mac/Xcode. Swift Playgrounds geht nicht.
- Tag-Push ist blockiert (403), nicht umgehen.
- Build 145 AAB: `/home/user/Claud/SoLo-PlayStore-145.aab` (gitignored), Zips in der Scratchpad der alten Sitzung (nicht dauerhaft).

## Verlauf (Stand vor 19.11.2026): 5. Nächste Schritte (priorisiert)
0. Zusammengeführt am 19.11.2026 (Branch `claude/zusammenfuehrung`): 13 Sprachen, Einfache Sprache, Empfänger, Netto/Pfändung/Ersparnisse/Familienversicherung/Geld sparen. Offen: Rezepte übersetzen; Wohngeld mit Sparer-Pauschbetrag genauer. Danach weiter mit 1.
1. ~~WBS-Empfänger~~ weitgehend erledigt. Rest: in den 32 bayerischen Ausnahme-Landkreisen Stadtanschrift der Großen Kreisstadt/Delegationsgemeinde je nach PLZ/Gemeinde (PLZ-Daten sind nur kreisgenau, Gemeinde nötig); Bremen prüfen; `beh.plzHint` für WBS anpassen.
2. ~~Bayerisches Landespflegegeld (`lpg`)~~ erledigt: `D.fest.landesamtPflege` (Postfach 13 65, 92203 Amberg; Quelle lfp.bayern.de, 19.11.2026), nur Bayern.
3. Teilweise erledigt: Familienkassen für HE, NI+HB, SN, ST+TH, BE+BB, HH+SH+MV (Nord), RP+SL (`D.familienkasseDE`, `D.fkLand`, arbeitsagentur.de, 19.11.2026; Nord und RP-SL nur indirekt belegt). NRW (West 50574 Köln, Nord 44785 Bochum, Ost 44117 Dortmund) und BW (West 76088 Karlsruhe, Ost 70146 Stuttgart): Postanschriften belegt, aber keine amtliche Kreis-Zuordnung auffindbar (BA-Dienststellensuche dynamisch) -> bewusst ohne Anschrift. Jobcenter: nur Stuttgart, Bonn, Wiesbaden belegt (`D.jobcenterDE`). BAS-Mutterschaftsgeldstelle (Friedrich-Ebert-Allee 38, 53113 Bonn, BAS-Antragsformular 2026) bewusst NICHT als Empfänger: Standard ist die Krankenkasse. Rentenversicherung: bewusst KEIN Empfänger je Land (Träger hängt von der Person ab, § 127 SGB VI; 14 Regionalträger + DRV Bund + Knappschaft-Bahn-See; Hinweis auf § 16 SGB I, Servicetelefon 0800 1000 4800). Landesämter (Recherche 19.11.2026, noch NICHT eingebaut, Kandidaten): Ausweis BE LAGeSo (Postfach 31 09 29, 10639 Berlin; Postfach gilt fürs ganze LAGeSo, prüfen), RP LSJV (56065 Koblenz, Info-PDF), HH Versorgungsamt (Adolph-Schönfelder-Str. 5, 22083 Hamburg, keine eigene Postanschrift), HB Amt für Versorgung und Integration (Doventorscontrescarpe 172 D, 28195 Bremen, Zuständigkeit nur aus Formular); Elterngeld BW L-Bank (L-Bank, Familienförderung, 76113 Karlsruhe, aus Antrag); Eingliederungshilfe HE LWV Regionalverwaltung Kassel (Ständeplatz 6-10, 34117 Kassel, nur Teilgebiet). Alle übrigen Länder/Leistungen nicht landesweit oder nicht belegt (SL, SH, NW, SN, ST, TH, MV, BB, NI: Seiten nicht abrufbar oder Zuständigkeit je Kreis); vor dem Einbau Impressum/Antragsseite der Behörde gegenprüfen.
4. Nach Anschrift-Änderungen: `docs/PRUEFLISTE.md`, Faktenblatt-Sätze angleichen, Tests laufen lassen.
5. Jobcenter außerhalb Bayerns (404 Bezirke): mit Web-Tools kaum machbar (viele Seiten robots-gesperrt, Impressen ohne Post-/Hausanschrift, BA-Übersicht ohne Anschriften). Braucht eine Anschriftenliste als Quelle. Außerdem offen: Agenturen, WBS-Gemeindestellen.
6. WBS Saarland aus amtlicher Quelle (z. B. Stadt/Ministerium).
7. iOS-Build klären (Billing oder Codemagic/Mac), dann TestFlight.
8. Play Store: Build 145 hochladen (Konsole), Store-Texte aus `docs/STORE.md`. Nur auf Nutzerwunsch.
9. Übersetzungen Prüfpaket/Pflege-Assistent; Expertenprüfung Pflege.
10. Programmablaufplan Lohnsteuer 2027 eintragen, sobald endgültig (BMF, meist Mitte/Ende November): Tarifwerte in `R.lohn` als `pap2027`, Umschalten in `lohnParam`; Pflege-Kinderlosenzuschlag 2027 nach Beschluss des PNOG.
11. Zum 1.7.2027 neue Pfändungsfreigrenzen eintragen (`R.pfaendung`, `gueltigBis`), Tabellenzeilen in `test/test-netto.js` ersetzen.

