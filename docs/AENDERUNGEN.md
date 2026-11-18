# Änderungen (für Tester und Store)

Versionsname (sichtbar im Store) und Versionsnummer (für Google/Apple, muss steigen). Die Versionsnummer kommt aus dem Build.

## Nächstes Update (nach Build 142)
- **Pflegegrad selbst einschätzen** auf der Leistungsseite: geführt wie die einfache Version, eine Frage pro Bildschirm, Alter zuerst, Vorfrage je Bereich, Erklärung „Was zählt hier?“ zu jeder Frage, Vorlesen. Ergebnis mit Punkten, Pflegegeld und Abstand zum nächsten Grad; Übernahme in den Fragebogen und auf Wunsch der Antrag in die Mappe. Mit vorhandenem Pflegegrad: Höherstufung prüfen und Schreiben vorausgefüllt.
- **Brief scannen** in „Brief prüfen“: Foto oder eingefügter Text; die App erkennt Absender und Art (Jobcenter, Sozialamt, Wohngeld, Familienkasse, Pflegegutachten, Nebenkosten, Antragsformular, Anhörung, Aufforderung zur Mitwirkung), trägt die Beträge gelb markiert ein und übernimmt den Haushalt aus „Leistungen“. In jeder Kachel eigener Scan.
- **Antragsformular** als siebte Kachel; „Formular fotografieren“ ist von der Leistungsseite dorthin umgezogen.
- **Gutachten-Vergleich:** Die eigene Einschätzung wird Frage für Frage mit dem Gutachten verglichen; Abweichungen lassen sich in den Widerspruch übernehmen.

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
