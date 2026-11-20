# SoLo – Konzept: Beratungsmodus in den übrigen Kacheln

Stand: 20.11.2026. Grundlage: Test-Zweig `claude/test-naechstes-update` (Web-Fassung gebaut und im Beratungsmodus angesehen: Ergebnis, Bescheidprüfung Jobcenter, Mein Ordner). Nur Konzept, kein App-Code geändert. „Geld“ und „Schulden“ sind ausgenommen (anderer Agent).

Aufwand: klein = bis ½ Tag, mittel = 1–2 Tage, groß = mehr als 2 Tage (jeweils mit Tests und 13 Sprachen, wo Text dazukommt).

## 0. Was der Beratungsmodus heute schon tut (im Code geprüft)

| Stelle | Heute im Beratungsmodus |
|---|---|
| Ergebniskarten | Zeile „Rechtsgrundlage: § …“ (`rechtHtml`), Paragrafen in den Texten bleiben stehen (sonst `Fmt.ohnePara`) |
| Ergebnisblatt | Rechtsgrundlage je Zeile; Blatt ohne Namen, mit freiwilligem Kürzel |
| Leistungs-Check | Startet ohne eigene Wahl in „Alles auf einer Seite“ |
| Haushaltsbuch, Schulden | Druckblatt bzw. Kontrollsumme nur im Beratungsmodus (nicht Teil dieses Konzepts) |
| Mein Ordner | Mehrere Vorgänge mit Kürzel, PIN, automatisches Löschen, Kopie zum Ausprobieren – für alle Nutzer, nicht nur Berater |
| Fristen | Übersicht liest schon die Fristen aller Vorgänge (`tresor.ueberall`) |

Lücken, die beim Ansehen auffielen:
- Der Rechenweg (Bedarf, Freibeträge, Grenzen) ist nur als Satz sichtbar, nicht als Rechnung.
- Bei fremder App-Sprache gibt es keinen deutschen Text daneben. Die Bescheidprüfung zeigt dagegen vieles nur auf Deutsch.
- Gesprächsnotiz gibt es nur bei „Ich ziehe aus“ und bei einzelnen Fristen, nicht je Vorgang.
- Kein Blatt „für die Akte“ aus Bescheidprüfung und Pflege.

## 1. Wie Sozialberatung arbeitet – was die Quellen hergeben

| Beratungsart | Belegte Arbeitsweise | Folge für SoLo | Quelle |
|---|---|---|---|
| Allgemeine Sozialberatung (Wohlfahrtsverbände) | Berater sind „Generalisten“; Clearing: interne und externe Hilfen prüfen; Hilfe „unmittelbar und unbürokratisch“. Sie gilt als erste Anlaufstelle zur Existenzsicherung (SGB II, SGB XII, Kindergeld, Wohnen). Einfache Anträge werden auch in offenen Sprechstunden ausgefüllt. | Breiter Überblick über alle Leistungen mit Paragraf und zuständiger Stelle; Weitervermittlung; schnelles Formular | [Q1], [Q2] |
| Wer kommt | Stichtagserhebung der Caritas: 50 % mit ALG II, 35 % mit Migrationshintergrund (Artikel von 2013) | Grundsicherung und Mehrsprachigkeit sind Kern | [Q3] |
| Migrationsberatung (MBE) | Gefördert werden bedarfsorientierte Erst- und Einzelfallberatung; Träger müssen Erfolgskontrolle ermöglichen (Beratungsdaten erheben). Unzureichende Deutschkenntnisse sind ein typischer Bedarf. | Klient liest in seiner Sprache, Berater auf Deutsch; Zählung ohne Personendaten | [Q4], [Q2] |
| Pflegeberatung § 7a SGB XI | Gesetzliche Schritte: Hilfebedarf erfassen, individuellen Versorgungsplan erstellen, auf Maßnahmen hinwirken, Durchführung überwachen, komplexe Fälle dokumentieren, über Entlastung informieren. Auf Wunsch zu Hause und mit Angehörigen. | Blatt „Hilfen nach Pflegegrad“ als Zuarbeit zum Versorgungsplan; Gebrauch beim Hausbesuch (offline) | [Q5] |
| Pflegeberatung in der Praxis | Erstberatung rund 128 Minuten, davon 64 Minuten Gespräch; 92 % erstellen einen Versorgungsplan; häufigste Themen: Entlastung Angehöriger (66 %), Pflegegeld (46 %), Hilfsmittel (41 %), Wohnraumanpassung (35 %); manche Berater finden das Plan-Format „wenig alltagspraktisch“. | Kurze Liste „Was steht zu, was ist offen“ spart Nacharbeit | [Q6] |
| EUTB | Berater sind „ausschließlich den Ratsuchenden verpflichtet“; erhoben werden „nicht personenbezogene Daten“ und Fallzahlen; vierteljährliche Kennzahlen, jährlicher Tätigkeitsnachweis. | Statistik ohne Personendaten; keine Daten an Dritte | [Q7] |
| Rechtsrahmen Beratung | Wohlfahrtsverbände dürfen im eigenen Aufgabenbereich Rechtsdienstleistungen erbringen, aber nur mit Anleitung durch eine Person mit Befähigung zum Richteramt. Arbeitshilfe der Caritas: Dokumentation der Gespräche „ratsam“, auf Fristen hinweisen, komplexe Fälle an Anwälte verweisen. | Fristen und Gesprächsvermerk wichtig; SoLo liefert Zuarbeit, die Prüfung bleibt bei der Stelle | [Q8], [Q9], [Q10] |
| Schweigepflicht | § 203 Abs. 1 Nr. 6 StGB nennt staatlich anerkannte Sozialarbeiter und Sozialpädagogen; nach Abs. 4 müssen Mitwirkende zur Geheimhaltung verpflichtet werden. | Keine Namen, PIN, Löschfrist, nichts verlässt das Gerät | [Q11] |

Nicht belegt (keine belastbare Fachquelle gefunden, daher nur als Annahme):
- Erwerbslosenberatung: dass Berater Bescheide Posten für Posten nachrechnen. Die Funktion gibt es in SoLo schon; der Bedarf ist plausibel, aber hier ohne Quelle.
- MBE: Sondierungsgespräch, Förderplan, Beratungsdauer. Die Förderrichtlinie selbst (01.03.2010, zuletzt geändert 26.05.2023) wurde nicht im Wortlaut gelesen.
- Die Eckpunkte der Caritas (2001) sagen nichts zu Dokumentation, Statistik und Datenschutz.

## 2. (a) Tabelle je Bereich

### (1) Welche Hilfen stehen mir zu?

| Teil | Privat sieht | Beratungsmodus zusätzlich/anders | Nutzen | Aufwand | Risiko |
|---|---|---|---|---|---|
| Formular | Frage für Frage oder alles auf einer Seite | Bleibt wie heute (alles auf einer Seite). Neu: Feld „Stichtag/Monat der Berechnung“ sichtbar | Schnelles Ausfüllen im Gespräch | klein | gering |
| Ergebniskarte | Einstufung, ein Satz, grober Betrag | Aufklappbar „So wurde gerechnet“: Bedarf, Einkommen, Freibeträge, Grenze, Zwischensummen, je Zeile der Paragraf | Berater kann nachvollziehen und dem Amt gegenüber begründen | mittel–groß | Jede Zahl braucht Quelle und Test; Rechenweg darf nicht genauer wirken, als die Schätzung ist |
| Wohngeld oder Grundsicherungsgeld | Kachel erklärt die zwei Wege in Worten | Zwei Spalten mit Zahlen: Betrag, Folgen (Kinderzuschlag, Bildung und Teilhabe, Rundfunkbeitrag, Krankenversicherung), Hinweis „nur Schätzung“ | Die häufigste Weichenfrage in der Existenzsicherung [Q2] | mittel | Falsche Sicherheit bei Grenzfällen: immer „möglich“, nie Empfehlung |
| Hinweise | Kurze Tipps | Zeile „Ermessen / Einzelfall“ bei Leistungen, die das Amt nach Ermessen entscheidet, und „Von SoLo nicht geprüft“ | Verhindert falsche Zusagen im Gespräch | klein–mittel | Liste muss je Leistung fachlich geprüft sein |
| Ergebnisblatt | Eine Seite ohne Namen, mit Kürzel | Zweite Fassung „für die Akte“: zusätzlich die Angaben, auf denen das Ergebnis beruht, Rechenweg kurz, Stand der Rechtslage, Datum | Aktenvermerk ohne Abschreiben [Q10] | mittel | Blatt enthält mehr Daten: Hinweis „kein Name, nur Kürzel“ beibehalten |

### (2) Ich habe einen Brief bekommen

| Teil | Privat sieht | Beratungsmodus zusätzlich/anders | Nutzen | Aufwand | Risiko |
|---|---|---|---|---|---|
| Bescheidprüfung (Jobcenter, Sozialamt, Wohngeld, Familienkasse) | Abweichungen, „Alle Posten im Vergleich“ zum Aufklappen | Vergleichstabelle sofort offen, Spalten Bescheid / SoLo / Unterschied / Paragraf; Rechenweg je Posten | Spart das Nachrechnen von Hand | mittel | gering, Zahlen liegen vor |
| Was tun? | Widerspruch vorbereiten | Zusätzlich Wegweiser: Widerspruch (Frist läuft) oder Überprüfungsantrag (Frist vorbei), mit Paragraf und Frist-Rechenweg; Hinweis auf Verweis an Anwalt bei komplexen Fällen [Q10] | Richtige Weiche, Fristen im Blick | mittel | Rechtsaussagen: vor Einbau gegen Gesetzestext prüfen |
| „Nicht geprüft“ | Kurze Liste am Ende | Als Prüfliste zum Abhaken für den Berater | Zeigt, was der Berater selbst ansehen muss | klein | gering |
| Blatt | Widerspruchstext | „Prüfvermerk für die Akte“ (Deutsch, ohne Namen, mit Kürzel): Posten, Abweichung, Frist, nächster Schritt | Dokumentation [Q10] | mittel | wie Ergebnisblatt |
| Pflegekasse | Erklärung des Bescheids | Module und Punkte des Gutachtens neben der eigenen Einschätzung | Grundlage für Widerspruch | mittel | Punkte nur mit amtlicher Quelle |
| Nebenkosten | Prüfung der Abrechnung | Paragrafen und Fristen sichtbar, sonst gleich | gering | klein | gering |
| Anderer Brief / Formular | Erklärung, Ausfüllhilfe | Deutsch daneben (siehe 3.1) | Berater und Klient lesen dasselbe | siehe 3.1 | siehe 3.1 |

### (3) Pflege

| Teil | Privat sieht | Beratungsmodus zusätzlich/anders | Nutzen | Aufwand | Risiko |
|---|---|---|---|---|---|
| Einschätzung | Fragen, wahrscheinlicher Pflegegrad | Punkte je Modul, Gewichtung, Gesamtpunkte und Schwellen offen | Vorbereitung der Begutachtung und des Widerspruchs | mittel | Darf nicht wie ein Gutachten wirken: „Einschätzung“ deutlich lassen |
| Unterstützung nach Pflegegrad | Leistungen in einfachen Worten | Tabelle mit Betrag, Paragraf, „schon genutzt / offen“ zum Ankreuzen; Rest-Budgets im Jahr | Passt zu den häufigsten Beratungsthemen (Entlastung, Pflegegeld, Hilfsmittel, Umbau) [Q6] | mittel | Beträge ändern sich: Quelle und Stand je Zeile |
| Blatt | – | „Hilfen-Übersicht“ als Zuarbeit zum Versorgungsplan (Bedarf, empfohlene Leistungen, nächste Schritte, wann wieder ansehen) [Q5] | Berater ergänzen den Plan ohnehin um eigene Listen [Q6] | mittel–groß | Nicht „Versorgungsplan“ nennen: der richtet sich nach den Richtlinien des GKV-Spitzenverbands, die hier nicht gelesen wurden |

### (4) Ich ziehe aus

| Teil | Privat sieht | Beratungsmodus zusätzlich/anders | Nutzen | Aufwand | Risiko |
|---|---|---|---|---|---|
| Checklisten, Notiz | Haken und eigene Notiz | Paragrafen sichtbar (wie heute über `tL`); Druck der Checkliste mit Stand der Haken | Übergabe an den jungen Menschen | klein | gering |
| Careleaver | Hinweise in einfachen Worten | Rechtsgrundlagen und zuständige Stelle je Schritt | Für Jugendhilfe und Jugendmigrationsdienst | klein–mittel | Zuständigkeit ist oft Einzelfall: nur Art der Stelle nennen |

### (5) Antragsmappe

| Teil | Privat sieht | Beratungsmodus zusätzlich/anders | Nutzen | Aufwand | Risiko |
|---|---|---|---|---|---|
| Unterlagen-Checkliste | Liste mit Haken | Spalte „liegt vor / fehlt / nachreichen bis“ und Druck als Laufzettel für den Klienten in seiner Sprache | Klarer Auftrag bis zum nächsten Termin | klein–mittel | gering |
| Anschreiben | Fertiger Text | Zusatzzeile wählbar: „erstellt mit Unterstützung von [Art der Stelle]“ – ohne Namen der Stelle im Gerät gespeichert | Üblich in der Beratung | klein | Kein Auftreten als Vertreter: Klient unterschreibt selbst [Q10] |
| Vorlagen für Stellungnahmen | – | Später: Gerüst „Stellungnahme der Beratungsstelle“ (Überschriften, keine fertigen Rechtsausführungen) | Zeitersparnis | groß | Hoch: rechtliche Begründung ist Rechtsdienstleistung [Q8–Q10]; nur Gerüst |

### (6) Mein Ordner / Vorgänge

| Teil | Privat sieht | Beratungsmodus zusätzlich/anders | Nutzen | Aufwand | Risiko |
|---|---|---|---|---|---|
| Liste der Vorgänge | Vorgänge mit Kürzel, PIN, Löschfrist | Suchfeld, Sortierung nach nächster Frist oder letzter Änderung; Knopf „Neuer Klient“ ganz oben; nach Wechsel sind alle Felder leer | Schneller Klientenwechsel | mittel | Verwechslung von Klienten: Kürzel immer oben anzeigen |
| Fristen | Fristen-Übersicht | Tabelle über alle Vorgänge: Kürzel, Frist, Art, Tage bis Ablauf; Druck | Fristenkontrolle der Stelle [Q10] | klein–mittel (Daten liegen vor) | Erinnerung ist Hilfe, kein Fristenbuch: Hinweis nötig |
| Gesprächsnotiz | – (nur bei „Ich ziehe aus“) | Notizfeld je Vorgang mit Datum; Export „Aktenvermerk“ (Deutsch, Kürzel, Datum, Ergebnis, Vereinbartes) | Dokumentation ist „ratsam“ [Q10] | mittel | Hoch: Freitext enthält sensible Daten. Nur mit PIN, Löschfrist als Voreinstellung, Hinweis „keine Namen, keine Diagnosen“ |
| Statistik | – | Zähler ohne Personendaten: Anzahl Beratungen je Monat, genutzte Bereiche, Sprachen; als Tabelle exportierbar | Kennzahlen für Träger und Förderer [Q4], [Q7] | mittel | Darf nicht mit Vorgängen verknüpft sein; nur Zahlen, nur auf dem Gerät |

### (7) Einstellungen

| Teil | Privat sieht | Beratungsmodus zusätzlich/anders | Nutzen | Aufwand | Risiko |
|---|---|---|---|---|---|
| „Für Fachkräfte“ | Ein Schalter mit einem Satz | Beim Einschalten kurze Seite: was sich ändert, Datenschutz-Hinweise (Kürzel statt Namen, PIN, Löschfrist, Gerät der Stelle), „keine Rechtsberatung durch die App“ | Berater weiß, worauf er achten muss [Q11] | klein | gering |
| Unterschalter | – | Einzeln an/aus: Rechenwege, Deutsch daneben, Notizen, Statistik | Jede Stelle nimmt nur, was sie darf | klein | Mehr Schalter = mehr Tests |
| Sicherheit | PIN freiwillig | Beim Einschalten von Notizen: PIN und Löschfrist vorschlagen (nicht erzwingen, außer David entscheidet anders) | Schweigepflicht [Q11] | klein | gering |

## 3. (b) Übergreifende Funktionen für Berater

| Nr. | Funktion | Kurz | Aufwand | Risiko |
|---|---|---|---|---|
| 3.1 | Deutsch daneben | App läuft in der Sprache des Klienten; Knopf blendet unter jedem Text den deutschen Text ein. Technik ist da (`tDe` beim Schuldenblatt). Blätter für die Akte immer Deutsch, Laufzettel in der Sprache des Klienten. | mittel | Layout bei Sprachen von rechts nach links prüfen |
| 3.2 | Rechenweg offen | Einheitlicher Baustein „So wurde gerechnet“ für Ergebnis, Bescheidprüfung, Pflege | mittel–groß | Quelle und Test je Zahl |
| 3.3 | Blatt für die Akte | Ein Druckbaustein für Ergebnis, Prüfvermerk, Hilfen-Übersicht: Deutsch, Kürzel, Datum, Stand der Rechtslage, „keine Rechtsberatung“ | mittel | gering |
| 3.4 | Fristen über alle Klienten | siehe (6) | klein–mittel | gering |
| 3.5 | Gesprächsnotiz und Aktenvermerk | siehe (6) | mittel | hoch (sensible Daten) |
| 3.6 | Ermessen / Einzelfall / nicht geprüft | Einheitliche Kennzeichnung in allen Bereichen | klein–mittel | fachliche Prüfung |
| 3.7 | Links zu Gesetz und Weisungen | Paragraf antippbar (gesetze-im-internet.de), später Fachliche Weisungen der zuständigen Stelle | mittel | App ist offline: Link verlässt die App, Hinweis nötig; jede Adresse vor Einbau prüfen und mit Datum führen |
| 3.8 | Statistik ohne Personendaten | siehe (6) | mittel | Trennung von Vorgängen |
| 3.9 | Schneller Klientenwechsel | siehe (6) | mittel | Verwechslung |

Datenschutz als Grundsatz für alles: nichts verlässt das Gerät, kein Name nötig, Kürzel, PIN, Löschfrist. Das passt zur Schweigepflicht [Q11] und zur Vorgabe „nicht personenbezogene Daten“ in der EUTB [Q7]. Ob eine Stelle Klientendaten überhaupt in einer App auf einem Handy führen darf, entscheidet ihr Träger – das kann SoLo nicht zusagen.

## 4. (c) Regel: Privatnutzer sieht nichts davon

1. Schalter „Beratungsmodus“ ist ab Werk aus. Kein Hinweis, keine Werbung dafür außerhalb von Einstellungen → „Für Fachkräfte“.
2. Jede neue Berater-Anzeige wird nur erzeugt, wenn der Schalter an ist (wie heute `rechtHtml`: gar nicht im Seiteninhalt, nicht bloß versteckt). Gilt auch für Druckblätter und PDF.
3. Laientexte bleiben ohne Paragrafen (`Fmt.ohnePara`). Neue Beratertexte haben eigene Textschlüssel und werden nie in der Laienansicht verwendet.
4. Berater-Daten (Notizen, Statistik) werden nur bei eingeschaltetem Modus angelegt. Wird der Modus ausgeschaltet, sind sie unsichtbar, bleiben aber im Vorgang und werden mit ihm gelöscht; „Alle Angaben löschen“ löscht auch sie.
5. Rechnung und Ergebnis sind in beiden Ansichten gleich. Der Modus ändert nur die Anzeige.
6. Test in `test/test-beratung.js`: Mit Schalter aus darf in allen 7 Bereichen kein Berater-Baustein, kein „§“ außerhalb der bekannten Ausnahmen und kein Berater-Knopf vorkommen; Größe der Laienansicht bleibt gleich.

## 5. (d) Vorschlag Reihenfolge

| Wann | Was | Warum |
|---|---|---|
| Nächstes Update | 1. Kennzeichnung Ermessen / Einzelfall / nicht geprüft (3.6) – zuerst im Leistungs-Check und in der Bescheidprüfung | klein, senkt das Risiko falscher Zusagen |
| | 2. Bescheidprüfung: Vergleichstabelle offen mit Paragraf und Unterschied | Zahlen liegen vor, großer Nutzen |
| | 3. Fristen-Tabelle über alle Vorgänge mit Druck | Daten liegen vor |
| | 4. Einstiegsseite beim Einschalten mit Datenschutz-Hinweisen | klein, wichtig für Schweigepflicht |
| | 5. Regel (c) als Test | Schutz der Laienansicht vor allem Weiteren |
| Danach | 6. Deutsch daneben (3.1) | größter Nutzen für Migrationsberatung, aber Layout-Arbeit |
| | 7. Rechenweg im Leistungs-Check und Vergleich Wohngeld / Grundsicherungsgeld mit Zahlen | braucht Quellen- und Testarbeit je Leistung |
| | 8. Blatt für die Akte (Ergebnis, Prüfvermerk) | baut auf 2 und 7 auf |
| | 9. Pflege: Punkte je Modul, Hilfen-Übersicht | eigene Zielgruppe |
| Später, nach Entscheidung | 10. Gesprächsnotiz und Aktenvermerk | Datenschutz-Frage offen |
| | 11. Statistik ohne Personendaten, schneller Klientenwechsel mit Suche | erst bei echtem Einsatz in Stellen |
| | 12. Links zu Weisungen, Gerüste für Stellungnahmen | höchstes Risiko, geringster Zeitdruck |

## 6. (e) Offene Fragen an David

1. **Gesprächsnotizen:** Sollen Berater Freitext zu Klienten in der App speichern dürfen (nur mit PIN und Löschfrist) – oder bleibt SoLo bewusst ohne Freitext und liefert nur Blätter zum Ausdrucken für die Akte der Stelle?
2. **Für wen zuerst:** Allgemeine Sozialberatung und Migrationsberatung (dann zuerst „Deutsch daneben“ und Bescheidprüfung) oder Pflegeberatung (dann zuerst Punkte je Modul und Hilfen-Übersicht)?
3. **Frei oder Prüfpaket:** Bleibt der ausgebaute Beratungsmodus für alle frei schaltbar, oder werden die Berater-Funktionen Teil des Prüfpakets mit Lizenz (`erweiterungen/lizenz.js`)?

## 7. Quellen (alle abgerufen am 20.11.2026)

| Nr. | Quelle |
|---|---|
| Q1 | Deutscher Caritasverband: Eckpunkte der Allgemeinen Sozialberatung, beschlossen 25.06.2001 – https://www.caritas.de/cms/contents/caritas.de/medien/dokumente/fachthemen/sozialpolitik/eckpunkte-der-allgem/asb_eckpunkte.pdf |
| Q2 | Deutscher Caritasverband: Orientierungshilfe Zusammenarbeit Migrationsberatung und Allgemeine Sozialberatung, 01.03.2023 – https://www.caritas.de/cms/contents/caritas.de/medien/dokumente/fachthemen/migration/wie-die-zusammenarbe/2023_03_01-orientierungshilfe_mb_asb_final.pdf |
| Q3 | S. Kunz: Zahlen, Daten, Fakten zur Allgemeinen Sozialberatung, neue caritas 2013 – https://www.caritas.de/neue-caritas/heftarchiv/jahrgang2013/artikel/zahlen-daten-fakten-zur-allgemeinen-sozi |
| Q4 | Förderdatenbank des Bundes: Migrationsberatung für erwachsene Zuwanderer (Richtlinie vom 01.03.2010, zuletzt geändert 26.05.2023) – https://www.foerderdatenbank.de/FDB/Content/DE/Foerderprogramm/Bund/BMI/migrationsberatung-fuer-erwachsene-zuwanderer-bme.html |
| Q5 | § 7a SGB XI – https://www.gesetze-im-internet.de/sgb_11/__7a.html |
| Q6 | GKV-Spitzenverband: Bericht nach § 7a Abs. 9 SGB XI, Juni 2026 (S. 7–17) – https://www.gkv-spitzenverband.de/media/dokumente/pflegeversicherung/beratung_und_betreuung/pflegeberatung/2026-06_Bericht_des_GKV-Spitzenverbandes_7a_Absatz_9_SGB_XI.pdf |
| Q7 | Teilhabeberatungsverordnung (EUTBV), §§ 1, 2, 13, 14 – https://www.buzer.de/EUTBV.htm (nichtamtliche Sammlung; vor Einbau gegen gesetze-im-internet.de prüfen) |
| Q8 | § 8 Abs. 1 Nr. 5 RDG – https://www.gesetze-im-internet.de/rdg/__8.html |
| Q9 | § 6 Abs. 2 RDG – https://www.gesetze-im-internet.de/rdg/__6.html |
| Q10 | H. Heinhold: Rechtsdienstleistungsgesetz, Reihe „Migration im Fokus“, Deutscher Caritasverband, November 2023 (S. 18–20, 39–42, 47–49) – https://www.asyl.net/fileadmin/user_upload/publikationen/Arbeitshilfen/2023_11_MigrationImFokus_Rechtsdienstleistungsgesetz_web.pdf |
| Q11 | § 203 StGB (Abs. 1 Nr. 6, Abs. 3, 4) – https://www.gesetze-im-internet.de/stgb/__203.html |

Hinweis zur Belastbarkeit: Q1–Q3 und Q10 sind Verbandspapiere, keine amtlichen Quellen. Für Texte in der App gelten weiter nur amtliche Quellen mit Datum. Die Pflegeberatungs-Richtlinien des GKV-Spitzenverbands und die MBE-Förderrichtlinie im Wortlaut sind vor dem Bau der Punkte 9 und 11 noch zu lesen.
