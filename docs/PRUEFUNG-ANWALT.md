# SoLo – Sozialleistungslotse: Unterlage für die rechtliche Prüfung

Stand: 14. November 2026, Version 1.1.0. Für eine Rechtsanwältin oder einen Rechtsanwalt mit Schwerpunkt Sozial- und
Verwaltungsrecht (gegebenenfalls zusätzlich IT-/Datenschutzrecht). Ziel: in wenigen Stunden die Risiken bewerten und die
Rechenregeln stichprobenartig prüfen.

## 1. Was die App ist
- Offline-App (Android, iOS, Web) für Laien. Fragebogen zu Haushalt, Einkommen, Miete, Vermögen, Behinderung, Pflege, Arbeit.
- Ergebnis: 31 Karten (Leistungen) mit Einstufung „wahrscheinlich“ / „möglich“ / „eher nicht“, grober Betrag oder Spanne,
  zuständige Stelle (mit Anschrift, wo belegt), Unterlagen, Hinweise. Dazu eine „Antragsmappe“: formlose Antragsschreiben und
  ein Angabenblatt als PDF.
- Keine Server, keine Konten, keine Weitergabe von Daten. Angaben bleiben auf dem Gerät.
- Preis im Store: 1,49 € einmalig (geplant), Tester kostenlos.

## 2. Fragen an die Prüfung (bitte bewerten)
1. **Rechtsdienstleistungsgesetz:** Ist die automatische Einschätzung im Einzelfall eine Rechtsdienstleistung nach § 2 Abs. 1
   RDG (vgl. BGH, Urteil vom 9.9.2021, I ZR 113/20, „Smartlaw“)? Ändert der Verkaufspreis etwas? Reichen die Hinweise
   (Abschnitt 4)? Sind einzelne Formulierungen („Anspruch ist wahrscheinlich“, Beträge) zu konkret?
2. **Haftung:** Haftungsrisiko bei falscher Einschätzung (z. B. Nutzer stellt keinen Antrag wegen „eher nicht“)? Wie ist die
   Haftung gegenüber Verbrauchern bei einer bezahlten App sinnvoll und zulässig begrenzt?
3. **Aktualisierungspflicht (§ 327f BGB):** Wie lange und in welchem Umfang müssen Gesetzesänderungen nachgeliefert werden?
   Vorgesehen: jährliche Prüfung zum 1.12., Hinweis in der App ab 1.1., wenn die Regeln nicht geprüft sind.
4. **Antragsmappe:** Sind die Musterschreiben als formlose Anträge geeignet (Antragsdatum, § 16 SGB I, § 37 SGB II,
   Rückwirkung je Leistung)? Gibt es Formulierungen, die schaden können?
5. **Datenschutz:** Datenschutzerklärung (`datenschutz.html`) einschließlich der optionalen Auswertung eines Fotos mit Claude
   (nur Web-Version innerhalb von Claude, Einwilligung je Foto, Gesundheitsdaten, Drittland USA).
6. **Impressum, Verbraucherrecht, Barrierefreiheit:** Impressum nach § 5 DDG; Pflichten nach dem
   Barrierefreiheitsstärkungsgesetz (die App ist nach WCAG 2.1 AA automatisiert geprüft); Werbeaussagen im Store
   („31 Leistungen“, „offline“).
7. **Amtliche Formulare (Ausfüllhilfe, Abschnitt 8):** Darf die App die Formulare der Bundesagentur für Arbeit (Jobcenter,
   Familienkasse) und den Wohngeld-Vordruck mitliefern und vorausfüllen (§ 5 UrhG amtliche Werke; Nutzungsbedingungen der BA)?
   Haftung, wenn eine vorausgefüllte Ja/Nein-Antwort nicht stimmt (Hinweis: „Prüfe jedes vorausgefüllte Feld, bevor du
   unterschreibst“)? Pflicht, neue Formularstände nachzuliefern?
8. **Zuständige Stellen und Anschriften:** Anschriften stammen aus Impressen und Wikipedia, mit Quelle und Datum und dem Hinweis,
   vor dem Absenden zu prüfen. Ausreichend?

## 3. Fachliche Prüfung der Rechenregeln
- **Prüfliste vom Gesetz her:** `docs/PRUEFLISTE.md` – je Leistung alle Voraussetzungen, Freibeträge und Sonderregeln mit Status
  (✓ gerechnet, ◐ als Hinweis oder „möglich“, ○ bewusst nicht gerechnet, mit Begründung) und der Testmarke, die sie prüft.
  Bitte besonders die ○- und ◐-Zeilen und die bayerischen Sonderregeln (Bezirk als Träger) ansehen.
- **Rechenregeln in Kurzform:** in der App unter „Rechenregeln“ (Tabelle) und im Code `src/rules.js` mit Paragrafen in Kommentaren.
- **Werte 2026 und Stand 2027:** `docs/PRUEFBERICHT.md`, Abschnitt „Änderungen 2027“: Beschlossenes ist eingerechnet,
  Entwürfe stehen nur als gekennzeichneter Hinweis auf der Karte.
- **Musterfälle zum Nachrechnen:** `docs/Musterfaelle-Abgleich.csv` (für die amtlichen Rechner) und die Fall-Tests
  `test/test-faelle.js` (rund 280 Fälle mit Erwartung aus dem Gesetz).

## 4. Hinweise, die die App heute gibt
- Beim ersten Start und im Impressum: „SoLo gibt eine allgemeine Orientierung nach deinen Angaben und vereinfachten Regeln. SoLo ist
  keine Rechtsberatung und prüft keinen Einzelfall rechtlich. Über deinen Anspruch entscheidet immer die zuständige Stelle. Bei
  Fragen helfen kostenlose Sozialberatungen.“ (Impressum zusätzlich: Schätzungen ohne Gewähr, maßgeblich ist der Bescheid.)
- Auf der Ergebnisseite: was SoLo nicht einrechnet (Selbstständigkeit, Wohneigentum, Auto, Mitbewohner, angemessene Miete,
  EU-Bürger); Widerspruch (§ 84 SGG), Überprüfungsantrag (§ 44 SGB X), Beratung (§ 14 SGB I), Weiterleitung (§ 16 SGB I);
  Antrag früh stellen (Stichtag).
- Je Karte: grobe Schätzung, Grenzbereich, Hinweise auf Sonderfälle; Übersetzungen mit dem Hinweis, dass der deutsche Text gilt.

## 5. Bekannte Grenzen und Näherungen (bitte besonders prüfen)
- Angemessene Wohnkosten: Orientierung WoGG-Höchstbetrag + 10 % plus Heizkostenkomponente (Rechtsprechung ohne schlüssiges
  Konzept), nicht die örtliche Richtlinie. Darüber rechnet die App zusätzlich mit der Grenze und zeigt „möglich“.
- Selbstständige: Gewinn wie Erwerbseinkommen; keine Prüfung der vorläufigen Bewilligung (§ 41a SGB II).
- Eigentum: Grundsicherung und Lastenzuschuss nur als „möglich“ (Tilgung, Belastung nach § 10 WoGG nicht gerechnet).
- Auto: Grenze 15.000 € nach der Weisungslage bis 2026 als Prüfgrenze; nach der Reform 2026 nicht am Gesetzestext geprüft.
- Verwandte in der Wohnung (§ 9 Abs. 5 SGB II, § 5 WoGG): nur Hinweis und „möglich“, kein Einkommen der Verwandten.
- EU-Bürger: Ausschluss ohne Arbeit unter 5 Jahren (§ 7 SGB II, § 23 SGB XII) vereinfacht (Arbeitnehmerstatus, Verlust des
  Freizügigkeitsrechts, Überbrückungsleistungen nicht im Einzelnen).
- Kein schwankendes Einkommen (Durchschnitt, Zufluss).
- Landesrecht außerhalb Bayerns teilweise nur als Spanne oder Hinweis (Landesblindengeld, Wohnberechtigungsschein).
- Schätzungen beruhen auf Pauschalen (z. B. Abzüge beim Wohngeld, Kinderzuschlag-Wohnkostenanteil).

## 6. Wie Fehler vermieden werden (Technik, kurz)
Unabhängige Referenzrechnung (3 Millionen Zufallshaushalte), Prüfung Anzeige = Rechnung in 8 Sprachen, Grenzwerte auf den Euro,
Mutationstest (absichtlich eingebaute Fehler müssen gefunden werden), Tests auf echten Android-Geräten im Emulator und in drei
Browsern. Grenze: Alle Tests prüfen gegen das eigene Verständnis des Gesetzes. Deshalb ist diese fachliche Prüfung nötig.

## 7. Ausfüllhilfe mit amtlichen Formularen
- Mitgeliefert: Hauptantrag und Anlagen des Jobcenters (Stand 10/2026), Einkommensbescheinigung (04/2025), Mietbescheinigung,
  Antrag auf Kinderzuschlag (KiZ 1), Muster-Vordruck Wohngeld (Mietzuschuss), Wohnberechtigungsschein mit Landesvordruck für
  Bayern (Stand 04/2026), Berlin, Brandenburg (amtlicher Vordruck nach Erlass, Amtsblatt 5/2020) und Hamburg; für Bremen,
  Rheinland-Pfalz und Saarland nur Fundstelle (Server lassen keinen automatischen Abruf zu); in den übrigen 9 Ländern gibt die
  Stadt oder Gemeinde den Vordruck heraus. Ordner `content/formulare/`.
- Auswahl nach dem Anforderungskatalog des Jobcenters (`src/formulare.js`): z. B. Anlage KI je Kind unter 15, WEP für Partner
  und Kinder ab 15, UH3 bei Alleinerziehenden, EKS und SV bei Selbstständigen, MEB bei kostenaufwändiger Ernährung.
- Vorausgefüllt wird nur, was aus den Angaben sicher folgt: Name, Geburtsdatum, Anschrift, Telefon und Ja/Nein-Fragen
  (z. B. alleinerziehend, schwanger, selbstständig, Miete). Beträge in der Anlage KDU bleiben leer (SoLo kennt nur die Summe).
- Welcher Knopf „Ja“ und welcher „Nein“ ist, wurde für jede Frage aus der Lage der Beschriftung im PDF bestimmt
  (`tools/formulare-pruefen.py`, 181 von 182 Fragen eindeutig; die unklare wird nie gesetzt) und im Test nach dem Füllen
  zurückgelesen, zusätzlich mit einem zweiten PDF-Programm.
- Kinderzuschlag- und Wohngeld-Vordruck sind vom Herausgeber gegen Veränderung geschützt (Ausfüllen erlaubt). SoLo verändert sie
  nicht und gibt sie als leeren Vordruck weiter.
- Die Formulare bleiben ausfüllbar; die Person ergänzt, prüft und unterschreibt selbst. Nichts wird an eine Stelle gesendet.

## 8. Bitte um Rückmeldung
Je Punkt aus Abschnitt 2: Risiko (gering / mittel / hoch) und empfohlene Änderung. Für Abschnitt 3: jede Regel, die fehlt
oder falsch ist, mit Fundstelle.
