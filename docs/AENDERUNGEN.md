# Änderungen (für Tester und Store)

Versionsname (sichtbar im Store) und Versionsnummer (für Google/Apple, muss steigen). Die Versionsnummer kommt aus dem Build.

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
- Korrektur Elterngeld (gefunden durch Abgleich mit dem amtlichen Elterngeldrechner): Pauschbetrag nach § 2c BEEG wird abgezogen, bisher etwa 54 € zu hoch; 33 von 33 Vergleichswerten gleich
- Korrektur Wohngeld (gefunden durch Abgleich mit dem amtlichen Wohngeldrechner): Werbungskostenpauschale wird abgezogen (bisher zu niedrig geschätzt), Mindestwerte nach Anlage 3 WoGG (bisher bei sehr kleinem Einkommen zu hoch); 60 von 60 Vergleichsfällen gleich
- Korrektur: Wohngeld bei Krankengeld und Werkstattlohn nicht mehr zu hoch
- Korrektur: Minus von der Handy-Tastatur und versehentlich eingetipptes Datum werden bei Beträgen abgewiesen
- Neue Hinweise: was SoLo nicht einrechnet, Widerspruch und Überprüfungsantrag, Beratungsanspruch
- Datenschutz: Abschnitt zur optionalen Auswertung mit Claude (nur Web-Version in Claude)

## 1.0.0 (bis Versionsnummer 132)
- Erste Testversionen im geschlossenen Test
