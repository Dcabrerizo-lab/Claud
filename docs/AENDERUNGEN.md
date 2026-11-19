# Änderungen (für Tester und Store)

Versionsname (sichtbar im Store) und Versionsnummer (für Google/Apple, muss steigen). Die Versionsnummer kommt aus dem Build.

## Neues Design (ab Versionsnummer 146)
- Design „Warm und menschlich“: Creme-Hintergrund, Petrol als Hauptfarbe, Koralle im Logo und bei persönlichen Hinweisen; weiche Kanten statt grauer Schatten; runde Karten (24 px), Knöpfe als Pille, Hauptknopf mindestens 52 px hoch, Startknopf mit eigener Form.
- Überschriften in Nunito (lokal in der App, SIL OFL 1.1), Text weiter Atkinson Hyperlegible; Schibsted Grotesk entfernt. Einfache Version bleibt bei der Systemschrift.
- Neues Logo „Sprechblase mit Haken“ im Kopf, als App-Symbol (Android adaptiv, iOS) und im Startbild (hell Creme, dunkel warmes Dunkel).
- Dunkelmodus mit eigenen warmen Farben; alle Textpaare mindestens 4,5:1.
- Neuer Aufbau: Start mit Begrüßung, farbigen Kacheln je Bereich (Hilfen, Brief, Schulden, Geld sparen, neu: Pflege) und Hinweis „Deine Angaben bleiben bei dir“; Ergebnis mit „Gute Nachrichten!“ (nur wenn etwas wahrscheinlich ist), Zahl der passenden Hilfen und Hinweis auf kostenlose Beratung. Alle neuen Texte in 13 Sprachen und Einfacher Sprache.

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

