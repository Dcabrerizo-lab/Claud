# Änderungen (für Tester und Store)

Versionsname (sichtbar im Store) und Versionsnummer (für Google/Apple, muss steigen). Die Versionsnummer kommt aus dem Build.

## Nächste Version (in Arbeit)
- **Beratungsmodus – an die SoLo-App des Klienten weitergeben**: In „Für Klient zusammenstellen“ wählt die Beraterin *nur ausgewählte Teile* (Ergebnis, Laufzettel, Fristen, Musterschreiben) oder den *ganzen Vorgang mit allen gespeicherten Eingaben*. Weitergabe per **QR-Code** (offline erzeugt; ist der Inhalt zu groß: „bitte als SoLo-Datei teilen“) oder als **SoLo-Datei** (.solo, Teilen-Menü inkl. Messenger). Standard: **mit PIN** (6 Ziffern, mündlich sagen; AES-GCM wie die Vorgangs-PIN, ehrlich als Sichtschutz erklärt); ohne PIN Hinweis „Wer den Code oder die Datei hat, kann es lesen.“ Beim Klienten (für alle): „Mein Ordner“ → „Von der Beratung bekommen“ → Datei öffnen oder QR-Code scannen (wo das Gerät QR-Codes erkennt), PIN, Vorschau „Das bekommst du“ mit Haken, Speichern als **neuer Vorgang** (nichts wird überschrieben), Fristen auf Wunsch mit Erinnerung. Ein weitergegebenes Blatt steht im neuen Vorgang unter „Von deiner Beratung“ zum Ansehen, Drucken, Teilen. Strenge Prüfung aller Daten, Anzeige nur als Text.
- **Beratungsmodus – „Für Klient zusammenstellen“**: Haken setzen (Ergebnis des Hilfen-Checks, Laufzettel „Das bringst du mit – bis …“, Fristen, Musterschreiben), daraus entsteht ein Blatt – auch in der Sprache des Klienten mit Deutsch daneben oder in Einfacher Sprache. Knöpfe „Drucken“ und „Teilen“ (Teilen-Menü des Handys, z. B. Messenger; im Browser Download) mit kurzem Datenschutz-Hinweis. Auch andere und gesperrte Vorgänge (nach PIN, nur im Speicher). Im Privatmodus ändert sich nichts.
- **„Es ist dringend“ aufgeräumt**: alle Fälle gleich aufgebaut – Frist oben, „Das tust du jetzt“ in Schritten, kurze Tipps zum Aufklappen, Knöpfe, Quellen unten. Konto gepfändet mit Bescheinigung und Grundfreibetrag statt doppeltem Tipp; Strom-/Gassperre in 3 Schritten. „Stimmt der Brief?“: Hinweis „keine Rechtsberatung“ unter dem letzten Tipp.
- **PIN-Schalter repariert**: Die PIN-Sperre lässt sich wieder ausschalten (nach Eingabe der bisherigen PIN). Beim Ein- und Ausschalten gibt es „Abbrechen“; erneutes Tippen auf den Schalter schließt das Feld, der Schalter zeigt immer den echten Zustand.
- **PIN festlegen mit kurzer Erklärung**: Unter dem Feld „Neue PIN“ steht in 3 kurzen Sätzen, dass die PIN die ganze App sperrt und die Angaben verschlüsselt, dass man sie sich merken muss und dass bei vergessener PIN niemand die Angaben öffnen kann (13 Sprachen und Einfache Sprache).
- **Geld und Schulden ohne Dopplungen**: Schuldnerberatung ohne eigene Kachel „unseriöse Anbieter“ (Tipp steht in „Beratungsstelle finden“); „Gelber Umschlag vom Gericht?“ führt direkt zum Mahnbescheid, „Zurück“ wieder zu „Post vom Inkasso“; „Schreiben an Gläubiger“ ohne P-Konto-Bescheinigung (bleibt unter „Was bleibt mir?“); „Die Anschrift fehlt noch“ erst beim Drucken/Teilen; Konto gepfändet: wieder „Jeder darf nur ein P-Konto haben“ (§ 850k Abs. 3 ZPO).
- **Haushaltsplan aufgeräumt**: Unter der Eingabe steht nichts mehr. Hinweise stehen in der Auswertung, das Druckblatt auch, die Tabelle (CSV) im Haushaltsbuch. Die Übernahme in den Leistungs-Check steht in der Karte, die bei knappem Geld erscheint.
- **„Bewilligt bis“ entfernt** (auch die Erinnerung an den Folgeantrag in den Fristen). Alte Angaben werden einfach nicht mehr verwendet.
- **Abschlag prüfen** jetzt auf den Seiten „Strom“ und „Heizen“: erst Strom oder Gas wählen, dann nur die Prüfung (Nachzahlung oder Guthaben, ungefähr). Ohne Musterbrief und Zusatz-Tipps.
- **Neu: Tarife vergleichen** (Strom oder Gas): eigener Tarif gegen ein Angebot, Kosten im Jahr mit und ohne Bonus. Dazu kurze Hinweise (Bonus, Vorkasse, Laufzeit, Kündigung, Fernwärme) und ein Link zur Verbraucherzentrale. Es wird nichts gespeichert.
- **Ich ziehe aus – „Bevor du ausziehst“**: großer gerahmter Hinweis „Unter 25 und Grundsicherungsgeld?“ entfernt; das Thema steht in der normalen Karte „Unter 25 mit Grundsicherungsgeld: Zusicherung vor der Unterschrift“ (§ 22 Abs. 5 SGB II), jetzt im gleichen Design wie die anderen Karten. Die Karte sagt jetzt auch: Das gilt, wenn deine Familie Grundsicherungsgeld bekommt oder du es nach dem Umzug brauchst.
- **Brief einlesen und Pflegegutachten lesen genauer** (geprüft mit öffentlichen Musterbescheiden: Jobcenter, Wohngeld, Grundsicherung im Alter, Nebenkosten, Formulargutachten des Medizinischen Dienstes): Summenspalte vorn im Berechnungsbogen des Jobcenters, Bezeichnungen über zwei Zeilen, monatliches statt jährliches Gesamteinkommen beim Wohngeld, zu berücksichtigende Miete statt Höchstbetrag, Datum und Zeichen aus dem Briefkopf in Spalten, typische Fehler der Texterkennung (O/0, l/1, Punkt statt Komma), ungültige Daten bleiben leer. Beim Gutachten: Punktwert oder Bewertung auch ohne Umlaute und bei umbrochenen Namen; ein leeres Formular ergibt keine Werte.
- **Raten anbieten mit Empfehlung**: Ist der Haushaltsplan ausgefüllt, schlägt SoLo eine machbare Rate vor („Diese Rate empfehlen wir dir: … € im Monat“, Faustregel: frei minus Puffer 10 % der Einnahmen, mind. 50 €, abgerundet auf 5 €) – mit „Übernehmen“ ins neue Schreiben „Ratenzahlung anbieten“; bei mehreren Schulden Aufteilung nach Höhe der Forderung; ohne Spielraum Verweis auf die Schuldnerberatung.
- **Pflegegrad selbst einschätzen**: Auf der Ergebnisseite zuerst der passende Antrag (**Pflegegrad beantragen** bzw. **Höherstufung beantragen**), dann die neue Kachel **Mit dem Gutachten vergleichen** (Gutachten vom Medizinischen Dienst scannen oder einfügen), dann „Was steht mir zu?“. Die Gutachten-Prüfung zeigt jetzt eine Tabelle: deine Punkte je Bereich neben dem Gutachten, Unterschiede fett. „← Zurück“ führt zur Ergebnisseite.
- **Brief-Seiten aufgeräumt**: kein großer weißer Rahmen mehr um den Inhalt; „Anderer Brief“ ohne doppelte Überschrift. Beim Jobcenter passt die Überschrift zur Briefart (Einladung, Anhörung, Unterlagen); Bescheid-Erklärungen nur beim Bescheid.
- **Pflege – Unterstützung nach Pflegegrad**: Einleitung in einem Satz (Rest zum Aufklappen), grüner Knopf „Pflegegrad selbst einschätzen“, Tipp „Kostenlose Hilfe: Pflegekasse oder Pflegestützpunkt“.
- Aufklapper überall im gleichen Stil ohne Sonderrahmen (Wörter im Bescheid, Eigene Frist, Weitere Punkte, So rechnet der Check); Versicherungs-Stufen ohne Farbbalken; „Über die App“: Stand in einer Zeile.
- **Startseite**: Die Kachel „Pflege“ steht jetzt direkt unter „Welche Hilfen stehen mir zu?“ (auch in der Tastatur- und Vorlese-Reihenfolge). Farbe unverändert, die anderen Kacheln behalten ihre Reihenfolge.
- **Hilfen-Check übersichtlicher**: grüner Knopf „Briefe für die Anträge machen“ direkt unter den Ergebnis-Karten; Name und Anschrift fragt erst die Antragsmappe (großer Kasten „Ausfüllhilfe“ entfällt). „Zwei Wege“, „Gut zu wissen“ und „Unsicher? Beratungsstelle“ als kurze Tipps zum Aufklappen. Ohne Angaben kein Kasten „So geht's“; „Kurzer Check für Menschen mit Behinderung“ als Wahl oben. Startseite: Datenschutz-Satz als kleine Zeile.

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
