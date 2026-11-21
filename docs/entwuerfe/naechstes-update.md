# Sammelliste nächstes Update (nach 1.6.0 / 148)

Stand: 20.11.2026 · Wünsche von David, noch nicht umgesetzt

## Aufräumen der Oberfläche (David, 20.11.2026)
| Bereich | Änderung |
|---|---|
| Mein Ordner | Kasten „Los geht's“ entfernen |
| Mein Ordner | Feld „Alle Haushalte und Vorgänge“ entfernen; stattdessen nur die gespeicherten Vorgänge zeigen und ein Feld „Neuen Vorgang speichern“ |
| Startseite | „Geld sparen im Alltag“ und „Ich habe Schulden“ werden eine Kachel „Geld und Schulden“ mit 6 Unterkacheln (docs/entwuerfe/schulden-bereich.md) |
| Geld sparen im Alltag | Haushaltsplan raus; er wandert nach „Ich habe Schulden“ (mit Haushaltsbuch, Energie-Check, Schuldenliste) |
| Geld sparen im Alltag | Bereich „Schulden und Pfändung“ raus (steckt schon in „Ich habe Schulden“; Tipps der Schuldnerberatungen dorthin mitnehmen) |
| Kopfzeile | Ganze Kopfzeile (Logo, App-Name, Satz „Prüfe in etwa 5 Minuten …“) nur auf der Startseite, sonst nicht |
| Ergebnisliste | Karte „Kostenlose Familienversicherung“ ganz raus (Regel, Texte, Tests, Prüfliste, Karten-Liste) |
| Profile/Vorgänge | Idee gut, Umsetzung unübersichtlich; man wird auf anderen Seiten damit konfrontiert. Neu: Profile nur in Mein Ordner (Liste nach bewährten Mustern anderer Apps, Wechseln mit einem Tipp, „+ Neu“, Bearbeiten dahinter); Kürzel im Kopf, Speichern-Kasten auf der Ergebnisseite und Verwaltung in den Einstellungen entfallen; Sicherheitsfunktionen an einer Stelle |
| Ergebnisliste | „Nächste Schritte“ und „Unterlagen“ aus den Karten raus; sie stehen in der Antragsmappe (Stelle, Unterlagen mit Haken, Tipp) |

Hinweis zur Ergebnisliste: Die Mappe zeigt Schritte und Unterlagen nur für Leistungen, die man in die Mappe übernimmt. Darauf auf der Karte kurz hinweisen („Unterlagen und nächste Schritte findest du in der Antragsmappe“).

| Ich ziehe aus | Kachel „Für Careleaver“ komplett raus, dazu alle Erwähnungen (Bereichs-Beschreibung, Beratungs-Hinweis mit Careleaver-Beratung/Ombudsstelle, Store-Text, Prüfliste, Tests, Farbe „Beere“ in FARBEN.md wieder frei) |
| Pflege – Pflegegrad selbst einschätzen | Nach „Ergebnis übernehmen“ springt die App heute in die Liste „Welche Hilfen stehen mir zu?“ – irreführend; geht man zurück, ist das Ergebnis weg. Neu: zuerst eine Ergebnisseite „Wahrscheinlich Pflegegrad X“ mit kurzer Erklärung, was das bedeutet (Leistungen und Beträge bei diesem Pflegegrad, Hinweis: nur Einschätzung, entscheidet die Pflegekasse). Darunter Kacheln: Antrag an die Pflegekasse (Mappe) · Was steht mir zu? · Mit Gutachten vergleichen. Ergebnis bleibt gespeichert; „Zurück“ führt zur Ergebnisseite, die Pflege-Startseite zeigt „Deine letzte Einschätzung: Pflegegrad X (Datum)“. In den Leistungs-Check nur, wenn man von dort kam. Heute 7 Knöpfe am Ende → auf 3–4 reduzieren. |
| ganze App – Zurück-Knopf | Heute uneinheitlich: Knopf oben als „btn ghost“ (pp-kopf), Knopf unten (nh.zurueck), teils keiner (z. B. Ich ziehe aus, Pflege-Auswahl). Neu überall wie bei „Pflegegrad selbst einschätzen“: oben links „← Zurück“ als Textknopf (linkbtn pa-zur in einer Kopfzeile), auf jeder Unterseite vorhanden, führt immer genau eine Ebene hoch; Zurück-Taste des Handys macht dasselbe. Test ergänzen, der jede Ansicht auf diesen Knopf prüft. |
| ganze App – Steuerung am Handy | iOS: seitlich wischen = eine Ebene zurück bzw. wieder vorwärts. Android: Zurück-Taste/-Geste = eine Ebene zurück (heute springt sie teils direkt zur Startseite). Umsetzung über einen gemeinsamen Ebenen-Verlauf (History API), derselbe Weg wie der „← Zurück“-Knopf. |
| ganze App | Unter jeder Startkachel wieder Kacheln in derselben Form wie die Startseite |

| ganze App – Infotexte | Zu viel Text, Anordnung/Platzierung; prüfen, ob es so viele Infofelder braucht (Prüfbericht docs/entwuerfe/ux-infotexte.md: ca. 160 → 45 Infofelder; wartet auf Davids Freigabe) |

## Inhaltliche Korrekturen
- Fehler: Brief › Anderer Brief zeigt nach „innerhalb eines Monats“ die Zeile „Frist im Brief: Monats“
- WBS bei Asylverfahren/Duldung: „Unwahrscheinlich“ (docs/entwuerfe/wbs-aufenthalt.md)
- Sichere Lücken aus docs/entwuerfe/abhaengigkeiten-pruefung.md: Bildung und Teilhabe, Wohngeld, BAföG, BAB, Hilfe zur Pflege, Eingliederungshilfe, Kindergeld Behinderung
- Mögliche Lücken klären: Arbeitslosengeld, Blindengeld, Schwerbehindertenausweis bei Asyl
- Abhängigkeitstest ergänzen (Angaben für BAB, Kindergeld Behinderung, Arbeit, Kinderkrankengeld)

## Schon vorgemerkt (siehe STATUS.md)
Dokumente einlesen, Brief-Hinweis/Quellen, Pflege-Auswahl, Spartipps der Schuldnerberatung u. a.

## Für das Update nach 1.7.0 (David, 20.11.2026)
- Geld und Schulden → Es ist dringend: Kachel „Mahnbescheid vom Gericht“ an die anderen Kacheln angleichen.
- Test-App mit eigenem Namen („SoLo Test“), damit sie neben der Store-App installierbar ist.
- Seite „Deine Angaben“: Sprachauswahl entfernen (Sprache nur noch in Einstellungen und oben).
- Geld und Schulden neu (PR #76, nach Fable-Prüfung RDG).
- Beratungsmodus: nur zahlungswürdige Kernfunktionen (siehe berater-mehrwert.md).

## Update nach 1.9 (Plan, Stand 21.11.2026 13:20)
Quelle: docs/entwuerfe/pruefungen-21-11/ (bedienung.md, sicherheit.md, technik.md, richtigkeit.md, Abgleich Runde 1/2, Seiten-Audit).
- Sprachen nur bei Bedarf laden (App ca. 3,9 MB kleiner, Start fast doppelt so schnell) – Entscheidung David: A (jetzt Grenze 7 MB in Bytes, Umbau im nächsten Update).
- QR-Scanner nativ (iPhone), .solo-Datei direkt mit SoLo öffnen – mit Gerätetest (TestFlight/Test-App).
- Abgleich amtliche Rechner (Wohngeld, KiZ, BAföG/Elterngeld) – Befunde beheben, Rechenplan je Leistung, unabhängige Referenzrechnung vervollständigen, Fachleute-Prüfung.
- Bedienung: Pflegegrad-Einschätzung übersetzen (ar u. a., Pfeilrichtung RTL), „Ich ziehe aus“ Paragrafen nur im Beratungsmodus, Hilfen-Check: weniger Bedienelemente je Frage, Mein Ordner leer → klarer Einstieg + „Frist eintragen“ immer erreichbar, Jobcenter-Brief Foto-Knopf sichtbar, Antragsmappe kürzen + Drucken ans Ende, Einfache Sprache bei Brief-Seiten, Unterlagen-Liste ohne Doppelungen, Blatt für die Akte, QR-Knopf früher.
- Sicherheit (mittel/niedrig): PIN-Länge/Zähler, Cache-Reste, CSP ohne unsafe-inline, Web-CSP + SRI, pdf.js-Update (CVE-2024-4367), Suchlink ohne Ort/PLZ, ML-Kit-Diagnose prüfen (Gerätetest).
- Technik: Speicherfehler ehrlich melden (Haushalt/Schulden/Ausziehen), kaputte Daten nicht still überschreiben, pflege.js hebel() beschleunigen, jumpPruefen drosseln.
- Richtigkeit gering (siehe richtigkeit.md), BAföG H1/H2/H4, Abgleich-Hinweise.

## Ergänzung 21.11. 14:40 – weitere offene Themen (vollständig)
- **Elterngeld:** Mehrlingszuschlag 300 € je weiteres Kind fehlt; Teilzeit-Rechnung (bis 1.389 € zu hoch); ElterngeldPlus gegen amtlichen Rechner prüfen.
- **BAföG:** statt nur „möglich“ einen Betrag/eine Spanne zeigen (113/200 Fälle „möglich“); Text bafoeg.vermTeil (2.300 € nur bei Ehe/Lebenspartnerschaft und eigenen Kindern).
- **Kinderzuschlag:** Bericht des Differenztests (Workflow amtlich-kiz, PR #103 gemergt) auswerten, Befunde beheben.
- **Pfändung:** BGBl.-Fundstelle in src/rules.js prüfen (weicht von Justiz NRW ab).
- **Daten aus Bescheiden übernehmen** in Deine Angaben / Haushaltsplan / Vorgang (Liste „Das haben wir gefunden“ mit Haken, nichts ungefragt) – von David noch nicht entschieden, vorschlagen.
- **Bescheidprüfung für Privatleute:** Grundprüfung frei, Vergleichstabelle mit Rechenweg nur mit Lizenz? – offen, zusammen mit Lizenzschutz besprechen.
- **Lizenzschutz Beratungsmodus** (Gespräch mit David zuerst): Empfehlung Online-Freischaltung mit Plätzen + Name der Einrichtung auf Ausdrucken.
- **Weitergabe:** QR-Scanner nativ (iPhone), .solo-Datei direkt mit SoLo öffnen, Web-Fassung mit eigener Adresse (QR ohne App), PDF mit PIN (Bibliothek nötig), „Sofort sperren“-Option (Kamera/Teilen-Problem lösen), Kamera-Fotos beim Start aufräumen.
- **Sprachen:** Begriffe nach Glossar vereinheitlichen, höfliche Anrede tr/ru/uk/fr/pl, Dari-Wortschatz (435 Texte), Rundfunk „eingetragene Lebenspartner“ in so/ps, Pflegegrad-Einschätzung auf Arabisch u. a. übersetzen (+ RTL-Pfeile), Einfache Sprache auf Brief-Seiten.
- **Sprachen nur bei Bedarf laden** (App real 6,35 MB → ca. 2,5 MB, Start fast doppelt so schnell).
- **Bedienung (Top-Punkte):** „Ich ziehe aus“ Paragrafen nur im Beratungsmodus; Hilfen-Check weniger Bedienelemente je Frage; Mein Ordner leer → klarer Einstieg, „Frist eintragen“ immer erreichbar; Jobcenter-Brief Foto-Knopf sichtbar; Antragsmappe kürzen, Drucken ans Ende; Unterlagen-Liste ohne Doppelungen; Blatt für die Akte; QR-Knopf früher.
- **Sicherheit mittel/niedrig:** CSP ohne unsafe-inline, Web-CSP + SRI, pdf.js-Update (CVE-2024-4367), PIN-Länge/Zähler, Suchlink ohne Ort/PLZ, ML-Kit-Netzwerk (Gerätetest), iOS Schutzklasse Complete.
- **Technik:** Speicherfehler ehrlich melden; kaputte Daten nicht still überschreiben; pflege.js hebel() und jumpPruefen beschleunigen; Werkzeug anschriften-uebernehmen.js gegen Wikipedia sperren.
- **Richtigkeit:** Rest „gering“ aus richtigkeit.md; Rechenplan je Leistung + vollständig unabhängige Referenzrechnung; Fachleute-Prüfung (2–3 Berater) wenn möglich.
- **Später/optional:** KI-Chat nur als freiwillige Zusatzfunktion mit geprüften SoLo-Inhalten; Nutzertest mit 5 Personen; RDG-Prüfung durch Anwalt; Muttersprachler (keine bekannt).
- **Gerätetest vor Veröffentlichung** (Liste vorbereiten): App-PIN/Vorgang-PIN, Bildschirmfoto-Schutz, Teilen/Messenger, SoLo-Datei/QR, Kamera-Scan, iOS-Speicher-Umzug, ML-Kit-Netzwerk.
- **Hinweis Veröffentlichung:** Im Store-Stand 1.8.0 steckt der kritische Fehler „Urin/Stuhl … meistens oder nie“ (Einfache Sprache Pflege) und das schwache Brief-Einlesen → Update 1.9 bald veröffentlichen (Build nur auf Davids Anweisung).

## Effizienz-Umbau (aus docs/entwuerfe/effizienz.md, U-Punkte)
- Feste Euro-Beträge in Texten (19 + 4) → Platzhalter aus zentraler Wertetabelle (Werte mit gültig ab/bis + Quelle), am besten zur Vollprüfung am 1.12.; Faktenblatt aus den Werten erzeugen.
- PRUEFLISTE.md in Einzeldateien je Bereich (Konfliktschwerpunkt), Sprachdateien-Struktur prüfen.
- Arbeitsweise: Rechenplan zuerst von Fable prüfen lassen, Referenzrechnung von zweitem Agenten unabhängig bauen.
