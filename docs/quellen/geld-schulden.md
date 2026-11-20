# Quellen „Geld und Schulden“ (Update nach 1.7.0) – abgerufen 20.11.2026

Amtlicher Wortlaut auf gesetze-im-internet.de gelesen (Status BELEGT), sonst Fachquelle (Status FACHQUELLE). Verwendung in `src/geld.js`, `src/app.js` (Geld und Schulden), `src/lang/schulden/*.json`.

| Aussage in der App | Fundstelle | URL | Status |
|---|---|---|---|
| Ersatzfreiheitsstrafe: 1 Tag für 2 Tagessätze, Mindestmaß 1 Tag | § 43 StGB | https://www.gesetze-im-internet.de/stgb/__43.html | BELEGT |
| Zahlungsfrist oder Raten durch das Gericht | § 42 StGB | https://www.gesetze-im-internet.de/stgb/__42.html | BELEGT |
| Nach Rechtskraft entscheidet die Vollstreckungsbehörde über Zahlungserleichterungen | § 459a Abs. 1 StPO | https://www.gesetze-im-internet.de/stpo/__459a.html | BELEGT |
| Staatsanwaltschaft ist Vollstreckungsbehörde | § 451 Abs. 1 StPO | https://www.gesetze-im-internet.de/stpo/__451.html | BELEGT |
| Abwendung der Ersatzfreiheitsstrafe durch freie Arbeit nach Landesverordnung | Art. 293 Abs. 1 EGStGB | https://www.gesetze-im-internet.de/stgbeg/art_293.html | BELEGT |
| Pflichtangaben im ersten Inkasso-Schreiben (Nr. 1–8), Auskunft auf Anfrage (Abs. 2), Kostenhinweis vor Raten (Abs. 3), Hinweis vor Schuldanerkenntnis (Abs. 4) | § 13a RDG | https://www.gesetze-im-internet.de/rdg/__13a.html | BELEGT |
| P-Konto-Bescheinigung: Familienkasse, Sozialleistungsträger, Arbeitgeber, Stelle nach § 305 Abs. 1 Nr. 1 InsO; Inhalt; Bank beachtet ab dem 2. Geschäftstag; unbefristet 2 Jahre | § 903 Abs. 1–4 ZPO | https://www.gesetze-im-internet.de/zpo/__903.html | BELEGT |
| Dieselben Pflichten für Rechtsanwälte, die Inkasso betreiben (Musterschreiben Forderungsaufstellung) | § 43d Abs. 1 und 2 BRAO | https://www.gesetze-im-internet.de/brao/__43d.html | BELEGT |
| Inkassokosten höchstens bis zur Vergütung eines Rechtsanwalts erstattungsfähig (nur Beratungsmodus) | § 13e Abs. 1 RDG | https://www.gesetze-im-internet.de/rdg/__13e.html | BELEGT |
| Widerspruch gegen den Mahnbescheid: Aufforderung binnen 2 Wochen; möglich, solange der Vollstreckungsbescheid nicht verfügt ist | § 692 Abs. 1 Nr. 3, § 694 Abs. 1 ZPO | https://www.gesetze-im-internet.de/zpo/__692.html, __694.html | BELEGT |
| Pfändungsfreigrenzen 1.7.2026–30.6.2027: 1 587,40 € Grund, 597,42 € erste Person, 332,83 € jede weitere, 4 866,30 € Höchstbetrag (Pfändungs-Maske im Beratungsmodus, Werte aus `Rules`) | Pfändungsfreigrenzenbekanntmachung 2026 | https://www.gesetze-im-internet.de/pf_ndfreigrbek_2026/----.html | BELEGT |
| Verjährung 3 Jahre; 30 Jahre bei rechtskräftig festgestellten Ansprüchen; Neubeginn durch Anerkenntnis, z. B. Abschlagszahlung (bestehender Text sp.schulden.inkasso) | § 195, § 197 Abs. 1 Nr. 3, § 212 Abs. 1 Nr. 1 BGB | https://www.gesetze-im-internet.de/bgb/__195.html, __197.html, __212.html | BELEGT |
| Verjährung beginnt mit dem Schluss des Jahres der Entstehung (bestehender Text sp.schulden.inkasso) | § 199 Abs. 1 BGB | https://www.gesetze-im-internet.de/bgb/__199.html | BELEGT |
| Reihenfolge Existenzsicherung zuerst; Ablauf der Beratung | AG SBV „Konzept Soziale Schuldnerberatung“ (2018), S. 10–14 | siehe Konzept, Quelle [Q1] | FACHQUELLE |
| Bitte um Geduld vor der Beratung | meine-schulden.de (BAG-SB) „Vorbereitung Erstgespräch“ | siehe Konzept, Quelle [Q3] | FACHQUELLE |
| Ordner-Anleitung, Unterlagen | Verbraucherzentrale NRW „Vorbereitung für die Schulden- und Insolvenzberatung“ | siehe Konzept, Quelle [Q4] | FACHQUELLE |
| Widerspruch gegen Inkasso (eigene Worte) | Verbraucherzentrale, Musterbrief (Stand 14.04.2025) | siehe Konzept, Quelle [Q5] | FACHQUELLE |

Nicht gebaut: Fall „Kein Geld für Essen“ (keine geprüfte Quelle für einen eigenen Fall; der Krisen-Check führt zum Leistungs-Check), Verjährungs-Rechner und Inkassokosten-Beträge (zurückgestellt), Gläubigerverzeichnis nach VbrInsFV (erst nach Fachprüfung).

## Prüfvermerk (20.11.2026)

Unabhängige Inhalts- und Sicherheitsprüfung von PR #76. Alle Fundstellen am 20.11.2026 direkt auf gesetze-im-internet.de abgerufen und mit den Texten in `src/geld.js`, `src/app.js` und `src/lang/schulden/*.json` verglichen.

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Prüfliste „Stimmt der Brief?“: Punkte, die nur bedingt gelten (Zinsen, Inkassokosten, Anschrift nicht vom Gläubiger), erschienen ohne Haken als „findest du nicht im Brief“ mit Knopf zum Schreiben. Das liest sich wie ein Mangel des Briefs, auch wenn der Punkt gar nicht zutrifft. | mittel | `ip.erg.fehlt` neu: „nicht angehakt“, manche Punkte nur, wenn sie zutreffen (13 Sprachen, Einfache Sprache) | § 13a Abs. 1 Nr. 3–7 RDG („wenn … geltend gemacht werden“) |
| Prüfliste ohne sichtbaren Hinweis auf die RDG-Grenze | mittel | Neuer Text `ip.hinweis` „Erste Einschätzung, keine Rechtsberatung …“, immer unter der Liste (13 Sprachen, Einfache Sprache); DOM-Test ergänzt | Projektregel (CLAUDE.md), § 2 Abs. 1 RDG |
| Musterschreiben Forderungsaufstellung: Satz „Bis zur Klärung zahle ich nicht.“ ist eine Zahlungsverweigerung, also eine Entscheidung im Einzelfall, und kann bei berechtigter Forderung schaden (Verzug läuft weiter). | mittel | Ersetzt durch „Sobald mir die Angaben vorliegen, prüfe ich die Forderung.“; Test ergänzt | § 286 BGB (Verzug), RDG-Grenze |
| Musterschreiben Forderungsaufstellung berief sich nur auf § 13a RDG. Die Vorschrift gilt für registrierte Inkassodienstleister, nicht für Rechtsanwälte; das Schreiben ist auch aus der Schulden-Liste für „Inkasso oder Anwalt“ erreichbar. | gering | Satz nennt jetzt § 13a RDG für Inkassodienstleister und § 43d BRAO für Rechtsanwälte | § 13a Abs. 1 RDG, § 43d Abs. 1 und 2 BRAO |
| P-Konto-Bescheinigung: „ab dem 2. Geschäftstag“ ohne Bezug. Das Gesetz zählt ab dem Tag nach der Vorlage. | gering | „ab dem 2. Geschäftstag nach der Vorlage“ (13 Sprachen); Einfache Sprache „Geschäfts-Tag danach“ statt „Arbeits-Tag“ | § 903 Abs. 4 ZPO |
| Beratungsmodus: Zahlen der Pfändungs-Maske (Netto, Personen) blieben beim Wechsel des Vorgangs im Arbeitsspeicher stehen. | gering | `Geld.neuLaden()` leert die Maske | Datenschutz, Projektregel |
| Rand der Kopfkarte/Brücke fiel ohne Bereichsfarbe auf Petrol (`--accent`) zurück; Petrol ist nur Bedienfarbe. | gering | Rückfall jetzt `--hint-rand` | docs/FARBEN.md |
| Geprüft, ohne Befund: § 43 StGB (2 Tagessätze = 1 Tag, Mindestmaß 1 Tag), § 42 StGB, §§ 451 Abs. 1, 459a Abs. 1 StPO, § 459e Abs. 2 StPO (Hinweis auf Zahlungserleichterung und freie Arbeit vor der Anordnung), Art. 293 Abs. 1 EGStGB, § 13a Abs. 1–4 RDG (Zuordnung der 6 Punkte), § 13e RDG, § 903 Abs. 1–3 ZPO, §§ 692, 694 ZPO, §§ 850k Abs. 2, 899 Abs. 1 ZPO, §§ 195, 197, 199, 212 BGB, Pfändungsfreigrenzen 2026 | – | – | Fundstellen wie oben |
| Sicherheit, ohne Befund: neue Ausgaben nur über `textContent`; `innerHTML` nur mit festen Symbolen und `esc()`; Haken in `lotse.beratung-haken` (in `Vorgaenge.DATEN`, also PIN, Kopie, Löschen); Eingaben der Schreiben werden nicht gespeichert; kein Netzwerkzugriff; Druck der Schreiben und Notizen enthält nur, was der Nutzer selbst eingibt. | – | – | Code gelesen |

Offen (kein Fehler, bewusst so belassen):
- „schriftlich“ steht in den Laientexten für „in Textform“ (§ 13a Abs. 3 und 4 RDG; Textform umfasst auch E-Mail).
- Die neuen Sätze in Arabisch, Persisch, Dari, Paschtu, Somali, Türkisch, Russisch, Ukrainisch, Polnisch und Rumänisch sind nicht von Muttersprachlern gegengelesen.
- Jugendstrafrecht (Vollstreckung durch den Jugendrichter) ist im Fall Geldstrafe nicht erwähnt; der Text verweist auf das Aktenzeichen im Brief.
