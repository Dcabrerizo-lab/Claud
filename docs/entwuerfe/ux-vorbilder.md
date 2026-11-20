# UX-Vorbilder für SoLo – was andere übersichtlich machen

Stand: 20.11.2026 · Nur Recherche, kein App-Code geändert.
Auftrag: „Orientiere dich an anderen Seiten, bei denen man ähnliche Sachen machen muss, wenn sie als sehr übersichtlich beurteilt wurden.“

---

## 1. Vorbilder und Belege

Wie stark der Beleg ist: **stark** = Preis, unabhängiger Test oder dokumentierte Nutzertests. **mittel** = sehr viele Store-Bewertungen oder amtliche Auswertung. **schwach** = nur Beschreibung, Beleg fehlt.

| # | Vorbild | Was es macht (ähnlich wie SoLo) | Beleg für Übersichtlichkeit | Stärke |
|---|---|---|---|---|
| 1 | **GOV.UK** (britisches Behördenportal) | Alle Behördenleistungen an einer Stelle | „Design of the Year 2013“ des Design Museum London, einstimmige Jury, gelobt als „well thought out, yet understated design“ [Q1] | stark |
| 2 | **GOV.UK Design System**: Muster „Eine Frage pro Seite“, „Antworten prüfen“, „Aufgabenliste“, „Details“, „Zurück-Link“, „Warnhinweis“ | Bauteile für Anträge und Formulare | In Laborforschung bei „Register to vote“ und „GOV.UK Verify“ getestet, laut GDS leichter für Nutzer mit wenig Erfahrung im Netz [Q2]. Aufgabenliste: 5 Testrunden mit 34 Nutzern [Q3] | stark (qualitativ, keine A/B-Zahlen) |
| 3 | **GOV.UK „Check benefits and financial support you can get“** | Leistungs-Check wie SoLo | Startseite: ein Satz, ein Knopf „Check what you can get“, ein ehrlicher Hinweis, was der Check nicht abdeckt [Q4] | mittel (gebaut auf Nr. 2, eigene Tests nicht veröffentlicht) |
| 4 | **Turn2us Benefits Calculator** (britischer Leistungsrechner) | Leistungsrechner für Laien | Neuer Rechner zusammen mit einem Beirat von „lived experts“ (Menschen mit eigener Erfahrung im Leistungssystem), über ein Jahr [Q5] | mittel (Vorgehen belegt, Ergebnis nicht gemessen) |
| 5 | **Taxfix** (Steuer-App) | Schwierige Behördensache als Frage-Antwort-Gespräch | 4,8 von 5 Sternen bei 274.190 Bewertungen im App Store [Q6]. Stiftung Warentest 4/2026: Bedienung = 35 % der Note, geprüft mit System Usability Scale; Einzelnote hinter Bezahlschranke [Q7] | mittel |
| 6 | **Finanzguru** (Konten und Verträge) | Geld-Überblick, Verträge, Kündigen mit einem Tipp | 4,7 von 5 bei 129.117 Bewertungen im App Store [Q8] | mittel |
| 7 | **Netflix-Profile** („Wer schaut?“) | Mehrere Personen in einem Konto | Profilauswahl einmal beim Öffnen, bis zu 5 Profile; eingeführt, weil sich die Vorschläge mehrerer Haushaltsmitglieder vermischt hatten [Q9] | mittel (bekanntes Muster, keine Studie) |
| 8 | **Pflegegradrechner der Verbraucherzentralen** | Pflegegrad-Einschätzung wie SoLo | 6 Module, 64 Kriterien, Schritt für Schritt, Hinweise zum Aufklappen, Pause nach jedem Modul möglich, zwei Wege (Antrag oder Widerspruch), danach Musterbegründung [Q10] | schwach bis mittel (gute Struktur, kein Usability-Beleg) |
| 9 | **Familienportal des Bundes + Infotool Familie** | Familienleistungen „aus einer Hand“, Rechner und Anträge | Leichte-Sprache-Fassung von capito Berlin, von 4 Menschen mit Lernschwierigkeiten geprüft [Q11]. Aufbau in 3 Hauptbereiche: Leistungen, Lebenslagen, Rechner & Anträge [Q11] | mittel |
| 10 | **Digitale Rentenübersicht** | Viele Ansprüche auf einen Blick | Amtliche Auswertung 2024: Ansprüche verständlich, Vertrauen hoch; **aber** Wunsch nach einfacherer Anmeldung [Q12] | mittel |
| 11 | **Nielsen Norman Group** (NN/g, führendes Usability-Institut) | Kein Produkt, sondern Forschungsbelege für Kacheln, Aufklapptexte, Bestätigungsfragen, einfache Sprache | Usability-Studien [Q13–Q16] | stark (Fachquelle) |

**Gegenbeispiele / Vergleich**

| Vorbild | Befund | Lehre für SoLo |
|---|---|---|
| **Mein ELSTER** | Stiftung Warentest: kostenlos, aber ohne Spartipps und Hilfe, „vor allem für erfahrene Nutzer“ geeignet [Q7] | Formular 1:1 abbilden reicht nicht. Laien brauchen Führung. |
| **Digitale Rentenübersicht** | Anmeldung als Hürde genannt [Q12] | SoLo-Vorteil: kein Konto, offline. Nicht durch Profilpflicht verspielen. |
| **D-App** (web.d-app.com) | Öffentlich nur als „AI Chat Interface“ beschrieben; keine Bewertungen oder Tests auffindbar [Q17] | Kein belastbares Vorbild. SoLo grenzt sich ab durch geführte Fragen, amtliche Quellen und offline. (Nicht verwechseln mit der App „deutschland.de“, 4,7 Sterne bei nur 242 Bewertungen [Q18].) |

---

## 2. Muster – was genau, wo gesehen, warum es Laien hilft

### A. Startseite und Unterseiten mit Kacheln
| Muster | Wo gesehen | Warum es hilft |
|---|---|---|
| **A1 Ganze Kachel tippbar, klarer Rahmen, leichter Schatten** | NN/g „Cards“ [Q13] | Große Trefferfläche, eindeutig „hier kann ich tippen“. |
| **A2 Kacheln nur zum Stöbern, nicht zum Vergleichen** | NN/g [Q13]: Karten sind gut zum Stöbern, schlecht zum Suchen und Vergleichen | Startseite = Kacheln. Ergebnislisten (z. B. Leistungen) = Liste, nicht Kacheln. |
| **A3 Wenige Hauptbereiche, nach Lebenslage benannt** | Familienportal: 3 Hauptbereiche, u. a. „Lebenslagen“ wie Schwangerschaft oder Trennung [Q11]; GOV.UK Check benefits: Einstiege nach Familie, Pflege, Behinderung, niedriges Einkommen [Q4] | Laien denken in ihrer Lage („Ich habe Schulden“), nicht in Gesetzen. |
| **A4 Eine Hauptaktion pro Startseite** | GOV.UK Check benefits: ein Satz, ein Startknopf [Q4] | Kein Suchen, wo es losgeht. Passt zu Davids Wunsch: Kopfzeile mit Einleitungssatz nur auf der Startseite. |

### B. Frage-für-Frage-Formulare
| Muster | Wo gesehen | Warum es hilft |
|---|---|---|
| **B1 Eine Frage pro Seite** (Startpunkt; nur zusammenlegen, wenn Tests das nahelegen) | GOV.UK „One thing per page“ [Q2], „Question pages“ [Q19] | Leichter für unsichere Nutzer, gut auf dem Handy, Verzweigungen und Speichern einfacher [Q2]. |
| **B2 Einfache Schrittanzeige ohne Gesamtzahl**, wenn die Fragenzahl schwankt | GOV.UK-Diskussion [Q2] | Keine falsche Erwartung („Frage 3 von 40“). |
| **B3 Pause nach jedem Abschnitt, später weitermachen** | Pflegegradrechner Verbraucherzentrale [Q10] | Unterlagen suchen, Pausen bei Stress, Pflegesituation. |
| **B4 „Antworten prüfen“-Seite mit „Ändern“ je Antwort; nach Ändern direkt zurück zur Übersicht** | GOV.UK „Check answers“ [Q20] | Weniger Fehler, mehr Vertrauen; man muss nicht alles neu durchklicken. |
| **B5 Gespräch statt Formular** | Taxfix: einfache Fragen Schritt für Schritt [Q6] | Gleiche Idee wie B1, in einer App mit sehr hoher Bewertung. |

### C. Ergebnisdarstellung
| Muster | Wo gesehen | Warum es hilft |
|---|---|---|
| **C1 Ergebnis zuerst, dann Bedeutung, dann nächster Schritt** | Pflegegradrechner: Ergebnis, Einordnung (Antrag lohnt? Widerspruch sinnvoll?), dann Musterbegründung [Q10] | Stress senken: erst „was kommt raus“, dann „was heißt das“, dann „was tue ich“. Passt zu Davids Vorgabe für die Pflegegrad-Einschätzung. |
| **C2 Ehrliche Grenzen direkt am Ergebnis** | Verbraucherzentrale: „nur Ersteinschätzung, ersetzt keine Begutachtung“ [Q10]; GOV.UK: Check deckt nicht alle Hilfen ab [Q4] | Keine falschen Zusagen (SoLo-Grundsatz „möglich“). |
| **C3 Zwei Wege im selben Werkzeug** | Pflegegradrechner: „Antrag lohnt sich?“ oder „Widerspruch prüfen?“ [Q10] | Gleiche Fragen, zwei Zwecke. Passt zu SoLo „Brief prüfen“ + Pflege. |

### D. Infotexte, Warnungen, Fristen
| Muster | Wo gesehen | Warum es hilft |
|---|---|---|
| **D1 Aufklappen nur für Infos, die wenige brauchen; Wichtiges nie verstecken** | GOV.UK „Details“ [Q21]; NN/g Akkordeons [Q14] | Seite bleibt kurz. Fristen, Beträge, Warnungen bleiben sichtbar. |
| **D2 Aufklapp-Überschrift sagt, was drin ist** (z. B. „Was zählt als Einkommen?“ statt „Mehr Infos“) | NN/g [Q14] | Laien klicken nur, wenn sie wissen, was kommt. GOV.UK: manche klicken nicht, weil sie fürchten, die Seite zu verlassen [Q21]. |
| **D3 Ein klarer Warnhinweis (Symbol „!“ + fetter Satz) nur bei rechtlichen Folgen** | GOV.UK „Warning text“ [Q22] | Warnungen wirken nur, wenn sie selten sind. Für Fristen und Folgen von Nichtstun. |
| **D4 Kurze Sätze (15–20 Wörter), eine Idee pro Absatz, Listen und Tabellen** | NN/g „Plain language“ [Q16] | Auch Fachleute wollen knappe Texte; „niemand beschwert sich, dass ein Text zu leicht war“ [Q16]. |

### E. Zurück-Navigation
| Muster | Wo gesehen | Warum es hilft |
|---|---|---|
| **E1 Zurück-Link auf jeder Frageseite, immer oben, gleich aussehend** | GOV.UK „Back link“ [Q23] | Nutzer meiden den Browser-Zurück aus Angst vor Datenverlust; der eigene Link ist sicher [Q23]. |
| **E2 Zurück zeigt die Seite so, wie man sie verlassen hat** (Antworten, Ergebnis bleiben) | GOV.UK „Back link“, „Check answers“ [Q20, Q23] | Genau Davids Fehler bei der Pflegegrad-Einschätzung (Ergebnis weg). |
| **E3 Kein Zurück-Link und Brotkrumen gleichzeitig; bei vielen Bereichen „Zurück zu [Seite]“** | GOV.UK [Q23] | Eine Art Navigation statt zwei. |

### F. Profile / mehrere Fälle
| Muster | Wo gesehen | Warum es hilft |
|---|---|---|
| **F1 Profil einmal wählen („Für wen?“), danach nicht mehr stören** | Netflix: Auswahl beim Öffnen [Q9] | Davids Kritik: Profile tauchen auf anderen Seiten auf. Lösung: Profil nur am Anfang bzw. in „Mein Ordner“ wählen, sonst nur kleiner Name oben. |
| **F2 Kein Konto-Zwang** | Gegenbeispiel Digitale Rentenübersicht (Anmeldehürde) [Q12] | Profile bleiben freiwillig, ohne Profil geht alles. |
| **F3 Wenige Profile, klar benannt** (Netflix: max. 5) | [Q9] | Übersicht bleibt erhalten. |

### G. Löschen und Datenschutz
| Muster | Wo gesehen | Warum es hilft |
|---|---|---|
| **G1 Bestätigung nur bei endgültigem Löschen, konkret benennen, was weg ist** | NN/g „Confirmation dialog“ [Q15] | „Wirklich?“ ohne Inhalt wird weggeklickt. |
| **G2 Knöpfe nach Ergebnis benennen** („Profil Anna löschen“ / „Behalten“ statt Ja/Nein), **kein vorgewählter Ja-Knopf** | NN/g [Q15] | Weniger Fehlbedienung unter Stress. |
| **G3 Rückgängig anbieten, wo möglich** (z. B. „Gelöscht – Rückgängig“ für einige Sekunden) | NN/g [Q15] | Nimmt Angst. |
| **G4 Kurzer Haupttext, Details zum Aufklappen** | NN/g [Q15], GOV.UK Details [Q21] | „Sicherheit und Daten“ ist laut David zu lang. |

### H. Formular- und Dokumentenmappe
| Muster | Wo gesehen | Warum es hilft |
|---|---|---|
| **H1 Aufgabenliste: alle Schritte sichtbar, gruppiert, nummeriert, mit Status „Erledigt“** – auch Schritte außerhalb der App (z. B. „Formular beim Amt abgeben“) | GOV.UK „Task list“ [Q3] | Eine Behörde führte über 60 % der Rückfragen auf Unklarheit im Antragsablauf zurück [Q3]. Status „Erledigt“ war für Nutzer wichtiger als „Nicht begonnen“ [Q3]. |
| **H2 Formulare dort, wo man sie braucht: Rechner und Anträge zusammen** | Familienportal „Rechner & Anträge“, Formulare je Bundesland [Q11] | Ein Ort für „ausrechnen“ und „beantragen“. |
| **H3 Absende-/Haupt-Knopf nennt die Handlung** („Anschreiben erstellen“, „Formular öffnen“) | GOV.UK „Check answers“ [Q20] | Klar, was beim Tippen passiert. |

### I. Einfache Sprache
| Muster | Wo gesehen | Warum es hilft |
|---|---|---|
| **I1 Texte von Betroffenen prüfen lassen** | Familienportal (4 Prüfer mit Lernschwierigkeiten) [Q11]; Turn2us (Beirat mit eigener Erfahrung) [Q5] | Nur Betroffene merken, wo es hakt. |
| **I2 Einfache Sprache als App-weiter Schalter, gut sichtbar oben** | Familienportal: Knöpfe „Leichte Sprache“, „Gebärdensprache“ oben auf jeder Seite [Q11] | Passt zu Davids Fehlermeldung „Schalter wirkt auf vielen Seiten nicht“. |
| **I3 Lesbarkeit Klasse 6–8** | NN/g [Q16] | Messbares Ziel für Texte. |

---

## 3. Zuordnung zu den SoLo-Bereichen

| SoLo-Bereich | Vorbild | Muster | Konkrete Umsetzung in SoLo |
|---|---|---|---|
| **Startseite** | GOV.UK Check benefits, Familienportal, NN/g Cards | A1, A3, A4 | Eine Petrol-Karte „Los geht's“ + 6–8 Lebenslagen-Kacheln, ganze Fläche tippbar, je 1 Zeile Untertext. Einleitungssatz nur hier. |
| **Unterseiten der Kacheln** | NN/g Cards | A1, A2 | Gleiche Kachelform eine Ebene tiefer (z. B. „Pflege“ → „Pflegegrad einschätzen“ / „Unterstützung“). Ab Ergebnislisten keine Kacheln mehr, sondern Listen. |
| **Sozialleistungs-Check** | GOV.UK One thing per page, Taxfix | B1, B2, B4 | Eine Frage pro Bildschirm, Schrittanzeige ohne Gesamtzahl, am Ende „Angaben prüfen“ mit „Ändern“ je Zeile, danach direkt zurück. |
| **Ergebnis Leistungs-Check** | GOV.UK, Verbraucherzentrale | C1, C2, A2 | Oben: „Wahrscheinlich / Möglich / Eher nicht“ als Liste. Pro Leistung: 1 Satz Bedeutung, 1 Knopf nächster Schritt („In die Antragsmappe“). Grenzen als ein Satz, nicht als Infokasten. |
| **Pflegegrad-Einschätzung** | Pflegegradrechner Verbraucherzentrale | B3, C1, C3, E2 | Module mit Pause-Möglichkeit; nach „Übernehmen“: Pflegegrad groß → was er bedeutet (Geld/Leistungen) → nächster Schritt (Antrag / Widerspruch). Zurück behält das Ergebnis. |
| **Brief vom Amt prüfen** | GOV.UK Warning text, Pflegegradrechner (Widerspruchsweg) | D3, C1, C3 | Oben: „Was will das Amt? Bis wann?“ Frist als einziger Warnhinweis mit „!“; Knopf „Frist merken“; darunter „Was kann ich tun?“ (z. B. Widerspruch). |
| **Antragsmappe** | GOV.UK Task list, Familienportal Rechner & Anträge | H1, H2, H3 | Mappe als Aufgabenliste: 1. Empfänger (PLZ-Suche direkt im Schritt), 2. Anschreiben, 3. Amtliches Formular (großer Knopf „Formular öffnen“), 4. Unterlagen, 5. Abschicken/Abgeben. Status „Erledigt“. Inhaltsverzeichnis entfällt, die Liste ist das Verzeichnis. |
| **Geld und Schulden / Pfändungsrechner** | Finanzguru, GOV.UK | A1, B1, C1 | Kacheln: „Was bleibt mir? (Pfändung)“, „Haushaltsplan“, „Spartipps“, „Beratung finden“. Pfändungsrechner Frage für Frage, Ergebnis zuerst („Geschützt sind … €“). |
| **Haushaltsplan** | Finanzguru | A2, D4 | Übersicht Einnahmen / Ausgaben / Rest oben als drei Zahlen, darunter Liste nach Kategorien. Eingabe als kurzer Dialog. |
| **Fristen** | GOV.UK Warning text, NN/g Confirmation | D3, G1 | Liste nach Datum, nächste Frist oben. Warnfarbe nur bei < 7 Tagen. Erinnerungs-Einstellung in „Einstellungen“. |
| **Mein Ordner / Profile** | Netflix, Digitale Rentenübersicht (Gegenbeispiel) | F1, F2, F3 | Profil wählen nur in „Mein Ordner“ oder einmal beim Speichern („Für wen ist das?“). Sonst nur Name klein oben, kein Profil-Hinweis auf anderen Seiten. Ohne Profil alles nutzbar. |
| **Einstellungen: Sicherheit, Daten, Löschen** | NN/g Confirmation dialog, GOV.UK Details | G1–G4 | Eine Zeile pro Funktion. Löschen: „Profil Anna und 3 Vorgänge löschen?“ – Knöpfe „Löschen“ / „Behalten“, keiner vorgewählt; danach „Rückgängig“ für einige Sekunden. Datenschutz-Text: 3 Sätze, Rest aufklappbar. |
| **Infotexte (ganze App)** | GOV.UK Details, NN/g Akkordeons + Plain language | D1, D2, D4 | Pflichtinfo sichtbar, Rest aufklappbar mit Frage als Überschrift. Höchstens 1 Aufklapptext pro Bildschirm als Richtwert. Sätze ≤ 15–20 Wörter. |
| **Zurück-Navigation (ganze App)** | GOV.UK Back link | E1, E2, E3 | Ein einheitlicher Zurück-Knopf oben links auf jeder Unterseite; Zustand bleibt erhalten; zusätzlich System-Zurück (Android) und Wischgeste (iOS) mit demselben Verhalten. |
| **Einfache Sprache (ganze App)** | Familienportal, Turn2us | I1, I2, I3 | Schalter gilt für alle Seiten; Texte vor Freigabe von 2–4 Betroffenen bzw. Beratungsklienten gegenlesen lassen. |

---

## 4. Grenzen dieser Recherche
- Die GOV.UK-Belege sind **qualitativ** (Labortests, Praxis), öffentliche A/B-Zahlen gibt es laut GDS nicht [Q2].
- Store-Bewertungen messen Zufriedenheit insgesamt, nicht nur Übersichtlichkeit.
- Die Einzelnoten der Stiftung Warentest für Taxfix sind hinter einer Bezahlschranke und wurden nicht gelesen [Q7].
- Zum Infotool Familie (Fragen, Ergebnisseite, Anonymität) fand sich keine öffentliche Beschreibung oder Bewertung; nur Zweck und Einbindung [Q24].
- D-App: keine öffentlichen Tests oder Bewertungen gefunden.
- Nicht belegt und daher nicht aufgenommen: Pflegegrad-Rechner einzelner Krankenkassen, meine-schulden.de (keine Usability-Belege gefunden).

---

## 5. Quellen (alle abgerufen am 20.11.2026)
- [Q1] GDS Blog: GOV.UK wins Design of the Year 2013 – https://gds.blog.gov.uk/2013/04/17/gov-uk-wins-design-of-the-year-2013/
- [Q2] GOV.UK Design Notes: One thing per page (2015) – https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/
- [Q3] GOV.UK Design Notes: We've published the task list pattern (2017) – https://designnotes.blog.gov.uk/2017/04/04/weve-published-the-task-list-pattern ; aktuelle Fassung: https://design-system.service.gov.uk/patterns/complete-multiple-tasks
- [Q4] GOV.UK: Check benefits and financial support you can get – https://www.gov.uk/check-benefits-financial-support
- [Q5] Turn2us: Creating a new Benefits Calculator – my experience – https://www.turn2us.org.uk/about-us/news-and-media/latest-news/creating-a-new-benefits-calculator-my-experience
- [Q6] Apple App Store: Taxfix – https://apps.apple.com/DE/app/id1163776422
- [Q7] Stiftung Warentest: Steuerprogramme und Steuer-Apps im Test (21.04.2026) – https://www.test.de/news/Stiftung-Warentest-testet-Steuer-Apps-Gute-Loesungen-fuer-PC-und-Smartphone-kostenloses-Steuerprogramm-ueberzeugt-6320926-0/ und https://www.test.de/Steuerprogramme-im-Test-5165521-0/
- [Q8] Apple App Store: Finanzguru – https://apps.apple.com/DE/app/id1214803607
- [Q9] TechCrunch: Netflix user profiles (01.08.2013) – https://techcrunch.com/2013/08/01/netflix-user-profiles/
- [Q10] Verbraucherzentrale: Pflegegradrechner – https://www.verbraucherzentrale.de/pflegegradrechner
- [Q11] Familienportal: Leichte Sprache – https://familienportal.de/familienportal/meta/leichte-sprache
- [Q12] Deutsche Rentenversicherung: Digitale Rentenübersicht – positive Resonanz nach erster Evaluation (08.08.2024) – https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Pressemitteilungen/Pressemitteilungen-archiv/2024/2024-08-08-dig-rentenuebersicht-evaluation-positiv.html
- [Q13] Nielsen Norman Group: Cards: UI-Component Definition – https://www.nngroup.com/articles/cards-component/
- [Q14] Nielsen Norman Group: Accordions on Desktop – https://www.nngroup.com/articles/accordions-on-desktop/
- [Q15] Nielsen Norman Group: Confirmation Dialogs – https://www.nngroup.com/articles/confirmation-dialog/
- [Q16] Nielsen Norman Group: Plain Language Is for Everyone, Even Experts – https://www.nngroup.com/articles/plain-language-experts/
- [Q17] D-App Web – https://web.d-app.com
- [Q18] mwm.ai: App deutschland.de – https://mwm.ai/de/apps/deutschland-de/6450415860
- [Q19] GOV.UK Design System: Question pages – https://design-system.service.gov.uk/patterns/question-pages
- [Q20] GOV.UK Design System: Check answers – https://design-system.service.gov.uk/patterns/check-answers
- [Q21] GOV.UK Design System: Details – https://design-system.service.gov.uk/components/details
- [Q22] GOV.UK Design System: Warning text – https://design-system.service.gov.uk/components/warning-text/
- [Q23] GOV.UK Design System: Back link – https://design-system.service.gov.uk/components/back-link/
- [Q24] Familienportal: Familienleistungen und Informationen aus einer Hand (04.07.2018) – https://familienportal.de/familienportal/meta/aktuelles/aktuelle-meldungen/familienleistungen-und-informationen-aus-einer-hand-127064
