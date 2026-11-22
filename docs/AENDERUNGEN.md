# Änderungen (für Tester und Store)

Versionsname (sichtbar im Store) und Versionsnummer (für Google/Apple, muss steigen). Die Versionsnummer kommt aus dem Build.

## Nächste Version (in Arbeit)

(noch keine Einträge)

## Version 1.10.0 (VersionCode/Build 152, 22.11.2026)

| Bereich | Was ist neu |
|---|---|
| **SoLo-Datei direkt öffnen** (Android und iPhone) | Eine SoLo-Datei (.solo) aus Messenger, Mail oder Dateien-App öffnet sich direkt mit SoLo („Öffnen mit“ bzw. „Teilen“ → SoLo). SoLo zeigt „Mein Ordner“ → „Von der Beratung bekommen“ mit der PIN-Abfrage, danach wie bisher Vorschau und Speichern als neuer Vorgang. Gleiche strenge Prüfung wie „Datei öffnen“; eine falsche Datei ergibt nur einen Hinweis. Keine neue Berechtigung, kein Netz. iPhone: SoLo liest eine Kopie und löscht sie gleich danach. Android: Weil .solo kein eigener Dateityp ist, kann SoLo auch bei anderen Dateien (z. B. „application/octet-stream“) in der Auswahl stehen. |
| **iPhone: stärkerer Speicherschutz** | Die Datei mit den Angaben ist jetzt nur lesbar, solange das iPhone entsperrt ist (Datenschutzklasse „vollständig“ statt „bis zum ersten Entsperren“). Vorhandene Dateien werden beim nächsten Öffnen umgestellt. SoLo speichert beim Verlassen der App sofort; bei gesperrtem Gerät lehnt SoLo das Schreiben ab und meldet es, statt still Daten zu verlieren. |

## Version 1.9.0 (VersionCode/Build 151, 21.11.2026)

Stand: Sammelzweig für Update 1.9 (21.11.2026). Versionsnummer (VersionCode) legt David fest.

### Neu

| Bereich | Was ist neu |
|---|---|
| **Suche** | Lupe oben auf jeder Seite (Startseite: neben der Sprachwahl) öffnet „Was suchst du?“. Findet alle Seiten der App, auch mit Alltagswörtern, alten Namen (z. B. Hartz 4, Mietzuschuss, gelber Brief, Pflegestufe, GEZ, Widerspruch, Einspruch, Rückforderung, Überzahlung) und mit Tippfehlern. Höchstens 6 Treffer. Zurück, Esc, Android-Zurück und Wischen schließen das Fenster. Ganz offline, nichts wird gespeichert. 13 Sprachen und Einfache Sprache. |
| **Einzelne Vorgänge mit PIN sperren** | Mein Ordner → Bearbeiten → „Mit PIN sperren“ (4–8 Ziffern, empfohlen 6), zusätzlich zur App-PIN. In der Liste steht nur „Gesperrter Vorgang“ mit Schloss. Nach dem Wechseln, nach 2 Minuten im Hintergrund und nach dem Neustart wieder gesperrt. Fristen daraus erscheinen nur, solange er offen ist. Löschen geht ohne PIN (mit Rückfrage). PIN vergessen = Vorgang verloren. Nach mehreren Fehlversuchen kommt eine Wartezeit. |
| **Bildschirmfoto-Schutz** | Ist die App-PIN an, sind Bildschirmfotos gesperrt (Android) und die Vorschau in der App-Übersicht ist verdeckt (Android und iPhone). Abschaltbar: Einstellungen → „Bildschirmfotos erlauben“. |
| **Beratungsmodus: „Für Klient zusammenstellen“** | Haken setzen (Ergebnis des Hilfen-Checks, Laufzettel „Das bringst du mit – bis …“, Fristen, Musterschreiben), daraus entsteht ein Blatt, auch in der Sprache des Klienten mit Deutsch daneben oder in Einfacher Sprache. Knöpfe „Drucken“ und „Teilen“ (z. B. Messenger) mit kurzem Datenschutz-Hinweis. Im Privatmodus ändert sich nichts. |
| **Beratungsmodus: an die SoLo-App des Klienten weitergeben** | Ausgewählte Teile oder der ganze Vorgang gehen per **QR-Code** oder als **SoLo-Datei** (.solo, z. B. per Messenger) an den Klienten. Standard mit PIN (6 Ziffern, mündlich sagen). Ohne PIN Hinweis „Wer den Code oder die Datei hat, kann es lesen.“ Beim Klienten: Mein Ordner → „Von der Beratung bekommen“ → Datei öffnen oder QR-Code scannen → PIN → Vorschau „Das bekommst du“ → Speichern als neuer Vorgang (nichts wird überschrieben). Fremde Dateien werden streng geprüft und nur als Text angezeigt. |
| **Sicherheitsnetz für Übersetzungen** | Bei einer Fremdsprache steht unter wichtigen Sätzen (Fristen, Warnungen, „keine Rechtsberatung“, Ausschlüsse, Beträge mit Bedingung, Schritte in „Es ist dringend“) klein der deutsche Originalsatz, zum Vergleichen mit dem Brief oder zum Zeigen. Abschaltbar: Einstellungen → Anzeige → „Wichtige Sätze auch auf Deutsch zeigen“ (Standard an). |
| **Raten anbieten mit Empfehlung** | Ist der Haushaltsplan ausgefüllt (Einnahmen, Miete, Essen), schlägt SoLo eine machbare Rate vor, nie mehr als der pfändbare Betrag (§ 850c ZPO). Bei mehreren Schulden Aufteilung nach Vorrang der Schulden-Liste. Neues Schreiben „Ratenzahlung anbieten“ mit Vorbehalt (kein Anerkenntnis der Forderung, der Zinsen und Kosten). Ist nichts pfändbar: eigener Hinweis und Verweis auf die Schuldnerberatung. |
| **Tarife vergleichen** (Strom, Gas) | Eigener Tarif gegen ein Angebot, Kosten im Jahr mit und ohne Bonus, kurze Hinweise (Bonus, Vorkasse, Laufzeit, Kündigung, Fernwärme) und Link zur Verbraucherzentrale. Nichts wird gespeichert. |
| **Pflege: Mit dem Gutachten vergleichen** | Neue Kachel auf der Ergebnisseite der Pflegegrad-Einschätzung: Gutachten des Medizinischen Dienstes scannen oder einfügen. Tabelle zeigt deine Punkte je Bereich neben dem Gutachten, Unterschiede fett. Zuerst steht der passende Antrag (Pflegegrad bzw. Höherstufung beantragen). |
| **Brief prüfen: erkannte Werte erst prüfen** | Werte aus Foto, PDF oder eingefügtem Text sind gelb markiert: „Bitte vergleiche sie mit dem Brief.“ Erst nach „Werte stimmen“ kommen Vergleich und Widerspruch. Unsichere Werte bei Fotos zusätzlich mit „Schwer zu lesen“. |

### Genauer gerechnet (mit amtlichen Quellen geprüft)

| Leistung | Was sich ändert |
|---|---|
| **Wohngeld** | Für Rentner mit kleiner Rente jetzt ein Betrag statt „Einkommen eher zu niedrig“. Grenze dort, wo noch mindestens 10 € bleiben. Mehr als 12 Personen möglich. Lohn der Kinder: Arbeitnehmer-Pauschbetrag und Freibetrag nach § 17 Nr. 4 WoGG je Kind (geprüft mit dem amtlichen Wohngeldrechner: 400 von 400 Haushalten gleich oder in der Spanne). Bescheid-Check kennt den Freibetrag für 33 Jahre Grundrentenzeiten. |
| **Kinderzuschlag** | Rechnet mit dem geschätzten Wohngeld statt einem festen Betrag. Vermögen knapp über der Grenze heißt „möglich“. Genauer bei Alleinerziehenden mit Altersrente. |
| **Vermögen bei Paaren** | Freibetrag hängt vom Alter beider ab, deshalb öfter „möglich“ statt „wahrscheinlich“. |
| **BAföG** | Sagt nicht mehr zu früh „eher nicht“: Vom Einkommen der Eltern über dem Freibetrag bleibt die Hälfte frei; eigenes Vermögen zählt nur über dem Freibetrag (plus 2.300 € je Partner und je Kind), verteilt auf 12 Monate. Kinderbetreuungszuschlag 160 € je Kind. Unter 10 € im Monat keine Zahlung (§ 51 Abs. 4 BAföG). |
| **Grundsicherung im Alter** | Freibetrag für 33 Jahre Grundrentenzeiten aus der Bruttorente (auch im Bescheid-Check, neues Feld „Rente brutto“). Hinweis, wenn beide das Merkzeichen G haben. |
| **Hilfe zur Pflege, Blindenhilfe** | Einkommensgrenze mit der ganzen Warmmiete und Familienzuschlag 395 €. |
| **Blindengeld Bayern** | Bei Pflegegrad 4 und 5: 611,33 €. |
| **Landespflegegeld** | Hinweis: Das Geld kommt in der Regel bis 31. Januar des Folgejahres (keine feste Zusage). |
| **Arbeitslosengeld, Krankengeld** | Spanne reicht jetzt auch für Steuerklasse III. |
| **Rundfunkbeitrag** | Befreiung kann bis zu 3 Jahre rückwirkend gelten (§ 4 Abs. 4 RBStV). |
| **Zuständige Stellen** | Sachsen-Anhalt: Landesamt für Soziales, Jugend und Gesundheit (LAS) seit 1.4.2026; Eingliederungshilfe beim Sozialamt. Anschriften außerhalb Bayerns nur noch aus amtlichen Seiten: 60 frühere Wikipedia-Anschriften geprüft (33 bestätigt, 15 korrigiert, 12 ohne Beleg → nur Name und Website; Nachprüfung 21.11.2026: Solingen bestätigt, Website gesperrt oder nicht abrufbar bei den übrigen 12). |

### Übersichtlicher

| Bereich | Was ist anders |
|---|---|
| **Startseite** | Kachel „Pflege“ direkt unter „Welche Hilfen stehen mir zu?“. Auf dem Tablet stehen die vier Kacheln 2 × 2. Datenschutz-Satz als kleine Zeile. |
| **Hilfen-Check** | Grüner Knopf „Briefe für die Anträge machen“ direkt unter den Ergebnis-Karten; Name und Anschrift fragt erst die Antragsmappe. „Zwei Wege“, „Gut zu wissen“, „Unsicher? Beratungsstelle“ als kurze Tipps zum Aufklappen. Bei „Zwei Wege“ ist in der Antragsmappe keine Leistung vorab angehakt. |
| **„Es ist dringend“** | Alle Fälle gleich aufgebaut: Frist oben, „Das tust du jetzt“ in Schritten, Tipps zum Aufklappen, Quellen unten. |
| **Geld und Schulden** | Keine Dopplungen mehr (z. B. „Gelber Umschlag vom Gericht?“ führt direkt zum Mahnbescheid; „Jeder darf nur ein P-Konto haben“). |
| **Haushaltsplan** | Unter der Eingabe steht nichts mehr, Hinweise stehen in der Auswertung. „Bewilligt bis“ entfernt (auch die Erinnerung an den Folgeantrag). |
| **Strom und Heizen** | „Abschlag prüfen“ jetzt dort: erst Strom oder Gas wählen, dann die Prüfung (Nachzahlung oder Guthaben, ungefähr). |
| **Ich ziehe aus** | Großer Kasten „Unter 25 und Grundsicherungsgeld?“ entfernt; Thema in der normalen Karte (§ 22 Abs. 5 SGB II), auch wenn die Familie Grundsicherungsgeld bekommt oder man es nach dem Umzug braucht. |
| **Briefe und Pflege** | Brief-Seiten ohne großen weißen Rahmen; Überschrift beim Jobcenter passend zur Briefart. Pflege-Seite mit kurzer Einleitung und grünem Knopf „Pflegegrad selbst einschätzen“. Aufklapper überall im gleichen Stil. |
| **Brief einlesen, Gutachten lesen** | Liest Musterbescheide (Jobcenter, Wohngeld, Grundsicherung im Alter, Nebenkosten) und MD-Gutachten genauer, typische Fehler der Texterkennung (O/0, l/1, Punkt statt Komma) werden erkannt. |
| **Verträge und Sozialtarife** | Telekom-Sozialtarif entfernt. |

### Korrekturen, Sprachen, Sicherheit

| Bereich | Was ist anders |
|---|---|
| **PIN-Schalter repariert** | Die App-PIN lässt sich wieder ausschalten (mit der bisherigen PIN); „Abbrechen“ beim Ein- und Ausschalten. |
| **PIN-Erklärung ehrlich** | Unter „Neue PIN“ und beim Vorgang-PIN: Die PIN verschlüsselt die Angaben; vergessen = Angaben verloren; Sichtschutz, kein Schutz gegen Fachleute mit Spezialwerkzeug. |
| **Sprachkorrekturen** | Rund 110 Korrekturen nach Rückübersetzung. Wichtig: Einfache Sprache beim Pflegegutachten („Urin/Stuhl: kann ihn meistens nicht oder nie halten“ – vorher Sinn umgekehrt); Somali: Text zur Zusicherung für unter 25-Jährige; Einspruch, Kündigung, P-Konto und Rundfunk in mehreren Sprachen einheitlich. |
| **Vorgang wechseln ohne Reste** | Beim Wechsel des Vorgangs wird alles vom vorigen Klienten geleert (Scan, eingefügter Brief, Prüfungen, Namen in Schreiben, Antragsmappe, Blatt für Klienten, Pflege-Einschätzung). |
| **iPhone: Angaben ohne Sicherung** | Die Angaben liegen in einer eigenen Datei, die iOS nicht in iCloud- oder Finder-Sicherungen aufnehmen soll (Hinweis an iOS, Apple garantiert das nicht). Alte Angaben werden beim ersten Start übernommen. |
| **Keine Datei-Reste** | Beim Start werden liegengebliebene .solo-, PDF- und CSV-Dateien vom Teilen gelöscht. |
| **Speichern ehrlich** | Haushaltsplan, Schulden-Liste und „Ich ziehe aus“ melden, wenn Speichern nicht geklappt hat (z. B. Vorgang gesperrt), statt still weiterzumachen. 13 Sprachen und Einfache Sprache. |
| **Kaputte Daten nicht überschreiben** | Lässt sich ein gespeicherter Stand (Haushaltsplan, Schulden-Liste, „Ich ziehe aus“) nicht lesen, sichert SoLo ihn im selben Vorgang (lotse.<name>.defekt, mit PIN verschlüsselt wie der Rest), zeigt einen kurzen Hinweis und startet leer. |
| **Weniger Rechenlast beim Scrollen** | Der Knopf „Zum Ergebnis“ beobachtet das Ergebnis (IntersectionObserver) statt bei jedem Scrollen zu messen; ältere Geräte ohne diese Funktion wie bisher. Werkzeug für Anschriften übernimmt nur noch amtliche Quellen (Impressum), nie Wikipedia. |
| **Datenschutzerklärung** | Ergänzt: Einlesen von Briefen und PDF, Zwischenablage, Vorgang-PIN, Weitergabe per QR-Code/Datei (Messenger-Hinweis), Bildschirmfoto-Schutz, Diagnosedaten von Google ML Kit (nur Android), ältere iOS-Sicherungen. |
| **Große Schrift (200 %)** | Lange Wörter in Kartentiteln werden umgebrochen, kein seitliches Scrollen. |
| Technik | Gemeinsames Verschlüsselungs-Modul (src/krypto.js), alte verschlüsselte Daten bleiben lesbar. Neue Prüfwerkzeuge gegen amtliche Rechner (Wohngeld, Kinderzuschlag, BAföG, Elterngeld, Pfändung) – nicht in der App. |

## 1.8.0 (ab Versionsnummer 150, November 2026)
- **Geld und Schulden neu geordnet**: Es ist dringend · Was bleibt mir? · Meine Schulden-Liste · **Post vom Inkasso** · Mein Geld planen (mit Spartipps) · **Schuldnerberatung**.
- **Krisen-Check „Was ist zuerst dran?“** (7 Fragen) und neuer Fall **Geldstrafe: Haft droht**.
- **Inkasso-Brief prüfen** (6 Punkte nach § 13a RDG) und **Musterschreiben**: Bitte um Geduld, Forderungsaufstellung, Widerspruch, Bescheinigung für das P-Konto.
- **Bis zum Termin** und **Beratungsmappe** zum Abhaken (je Vorgang gespeichert); Schulden-Liste mit „Was ist zuerst wichtig?“ oben und Knöpfen je Eintrag.
- **Schulden-Liste übersichtlicher** (Kacheln oben).
- Haushaltsplan: bei knappem Geld Karte „Leistungs-Check“ direkt unter dem Ergebnis.
- **Beratungsmodus**: dichtere Sicht für Fachkräfte (Tabelle, Pfändung auf einer Seite, Gesprächsnotiz, Handzettel); im Privatmodus ändert sich nichts.
- Alle Kacheln in „Geld und Schulden“ gleich hoch; „Mahnbescheid vom Gericht“ sieht jetzt aus wie die anderen Kacheln, auch in den Übersetzungen.
- **Sprachwahl** nur noch oben auf der Startseite und in den Einstellungen, nicht mehr auf der Seite „Deine Angaben“.
- Die Test-App für Android heißt „SoLo Test“ und lässt sich neben der Store-App installieren.

## 1.7.0 (ab Versionsnummer 149, November 2026)
- **Geld und Schulden** sind jetzt eine Kachel auf der Startseite, mit 6 Unterkacheln (z. B. „Es ist dringend“, Schulden-Liste, Haushaltsplan, Kostenlose Hilfe).
- **Pflege**: Die Pflegegrad-Einschätzung hat eine eigene Ergebnisseite.
- **Leistungs-Check**: Du wählst, ob du Schritt für Schritt (eine Frage pro Bildschirm) oder alles auf einer Seite ausfüllst.
- **Zurück** funktioniert überall gleich: ein Zurück-Knopf oben, die Zurück-Taste bei Android und das Wischen beim iPhone führen immer eine Ebene zurück.
- **Neues Design**: weiße Unterkacheln, einheitliche Felder und Knöpfe, klarere Schriftgrößen.
- **Weniger Text**: Zuerst steht, was zu tun ist. Einzelheiten stehen zum Aufklappen darunter.
- **Neue Antragsmappe**.
- **Mein Ordner** neu: gespeicherte Haushalte (Vorgänge) liegen nur noch dort; Löschen neu gestaltet.
- **Einfache Sprache überall**: Jeder deutsche Text hat jetzt eine einfache Fassung, auch „Brief prüfen“ und die Pflege-Einschätzung.
- **Sprachwahl auf der Startseite** oben rechts.
- **Korrekturen**: Asyl und Duldung (neue Auswahl „Ausreisepflichtig, ohne Duldung“, Einkommensart „Asylbewerberleistungen“), Menschen aus anderen EU-Ländern (Hilfe zur Pflege, Blindenhilfe, BAföG), Krankengeld bei Rente; Hort ohne Beitrag bei Bildung und Teilhabe; Verjährung beim Inkasso genauer erklärt.
- **Entfernt**: Karte Familienversicherung; Rezepte (stattdessen ein Link zur Verbraucherzentrale); der Teil für Careleaver in „Ich ziehe aus“.
- **Viele Fehler behoben**, z. B. abgeschnittene Auswahl-Texte auf kleinen Bildschirmen.

## 1.6.0 (ab Versionsnummer 148, November 2026)
- Ab Versionsnummer 148: **Fristen-Übersicht** in „Mein Ordner“: Fristen aus Briefen merken (Tag vor dem Speichern prüfen und ändern), Rechenweg sichtbar, erledigte abhaken.
- Ab Versionsnummer 148: **Schulden-Liste** mit Druckblatt (auch als PDF) und CSV-Export; Haushaltsplan kann mitgedruckt werden.
- Ab Versionsnummer 148: **Energiekosten-Check** für Strom und Gas: Zählerstände eintragen, Verbrauch und Abschlag vergleichen, Brief zum Senken des Abschlags.
- Ab Versionsnummer 148: **Höchstbetrag der Miete beim Wohngeld** wird angezeigt (bei unsicherer Mietenstufe als Spanne, „möglich“).
- Ab Versionsnummer 148: **Hilfe bei Aufforderung zur Senkung der Wohnkosten** (Brief vom Amt lesen, Antwort-Entwurf, Frist merken).
- Ab Versionsnummer 148: **Zweites Einkommen je Person**: Bei zwei Erwachsenen hat jede Person ein Feld „Weiteres Einkommen“ (Fragebogen, Haushaltsplan, Antragsmappe).
- Ab Versionsnummer 148: **Hinweise im Haushaltsbuch** zu Mehrbedarf, Erspartem sowie Pflege- und Steuer-Belegen.
- Ab Versionsnummer 148: **Nur geltendes Recht**: Hinweise auf geplante Änderungen entfernt. Neue Werte erscheinen erst, wenn sie gelten.
- Ab Versionsnummer 148: Korrekturen bei Mahnbescheid und Stromschulden. Neue Texte in 13 Sprachen und Einfacher Sprache.

## 1.5.0 (ab Versionsnummer 147, November 2026)
- Ab Versionsnummer 147: **Neue Leiste** Start | Mein Ordner | Einstellungen; Einstellungen als Liste mit Unterseiten (Haushalte, Anzeige, Fachkräfte, Über die App).
- Ab Versionsnummer 147: **Vorgänge speichern** (z. B. einer je Haushalt) mit freiwilliger PIN-Sperre (Sichtschutz, verschlüsselt auf dem Gerät), Selbstsperre, Rückfrage vor dem Löschen und automatischem Löschen länger nicht geänderter Vorgänge.
- Ab Versionsnummer 147: **Beratungsmodus** (Rechtsgrundlagen mit Paragrafen bei den Ergebnissen), **Ergebnisblatt** zum Drucken oder Mitgeben, **Unterlagen-Checkliste**, Antragsmappe mit Übersicht.
- Ab Versionsnummer 147: **Pflege**: Startkachel mit Auswahl Unterstützung oder Einschätzung, Leistungen je Pflegegrad; Beratungsbesuch, Verhinderungspflege durch Angehörige, Wohngruppenzuschlag, 10 Tage Arbeitsverhinderung.
- Ab Versionsnummer 147: **Geld sparen**: Schulden und Pfändung mit Tipps von Schuldnerberatungen; **Haushaltsplan und Haushaltsbuch** mit Kassenzettel-Scan (Texterkennung auf dem Gerät) und CSV-Export.
- Ab Versionsnummer 147: neue Einkommensart **„Unterhalt für sich selbst“** (Trennungs-/Ehegattenunterhalt, Unterhalt von den Eltern).
- Ab Versionsnummer 147: neuer Bereich **„Ich ziehe aus“** für junge Menschen (Azubis, Studierende, junge Erwachsene, Careleaver): Checklisten, Geld, Kostenfallen, Versicherungen, Hilfen; 13 Sprachen und Einfache Sprache.
- Ab Versionsnummer 147: **einheitliches Farbkonzept** (Palette an einer Stelle, keine Farbe doppelt je Kachelgruppe); Verbesserungen aus der Nutzerprüfung (Zurück-Wege, Rückfrage vor „Beispiel laden“, Rückgängig nach Löschen, Brief prüfen erst bei vollständigen Angaben, Fachwörter erklärt, Kachel „Anderer Brief“, Formularprüfungen); Korrekturen bei Brief-Erkennung, Pfändung, Rechtsgrundlagen und Schulden-Tipps.

## 1.4.0 (ab Versionsnummer 143, November 2026)
- Ab Versionsnummer 146: Renten-Netto genauer (Beiträge zur Kranken- und Pflegeversicherung statt Pauschale); Krankenversicherung beim Lohn korrigiert; Netto wird je Person gerechnet; Unterhaltsvorschuss vollständig (Waisenrente, Kind zu 40 % oder mehr beim anderen Elternteil, neue Partnerschaft, Aufenthalt und mehr); Auto bei Grundsicherung im Alter geschützt; Pläne für 2027 aktualisiert; Sicherheits-Updates.
- Ab Versionsnummer 146: **Neues Design** „Warm und menschlich“: Creme, Petrol, Koralle; runde Karten, Knöpfe als Pille, warmer Dunkelmodus (alle Texte mindestens 4,5:1); Überschriften in Nunito; neues Logo „Sprechblase mit Haken“ als App-Symbol und Startbild. Startseite mit Begrüßung und farbigen Kacheln je Bereich (neu: Kachel „Pflege“), Hinweis „Deine Angaben bleiben bei dir“. Ergebnis mit „Gute Nachrichten!“ (nur wenn etwas wahrscheinlich ist), Zahl der passenden Hilfen und Hinweis auf kostenlose Beratung. Neue Texte in 13 Sprachen und Einfacher Sprache.
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
