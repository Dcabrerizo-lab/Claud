# Schlussprüfung Update 1.9: neue Texte (Deutsch, Einfache Sprache, Übersetzungen)

Geprüft: `git diff origin/main origin/claude/test-update-1.9 -- src/lang/` (Stand 554fd8c), alle neuen und geänderten Texte in `de.json`, den Unterordnern (`ausziehen`, `denetz`, `fristen`, `haushalt`, `klient`, `schulden`, `suche`, `zusatz`) und `einfach/`. Alle Quellen abgerufen am 21.11.2026.

## Ergebnis in Kürze

- Kein hoher oder kritischer Fehler in den neuen Texten.
- 5 kleine Korrekturen in Einfacher Sprache (siehe Tabelle).
- Der bekannte Fehler „Urin/Stuhl … meistens oder nie halten“ ist behoben („meistens nicht oder nie“). Die Pflege-Texte gibt es nur auf Deutsch und in Einfacher Sprache (`erweiterungen/*.js`, `einfach/brief/brief.json`, `einfach/pflege/pflege.json`); in den 12 Fremdsprachen gibt es dazu keinen Text, also dort auch keinen Fehler.
- Schlüssel und Platzhalter: In allen 13 Sprachen und 10 Ordnern fehlt kein Schlüssel, alle Platzhalter stimmen mit Deutsch überein. Kein geänderter deutscher Text hat eine alte Übersetzung behalten. Jeder neue deutsche Schlüssel hat einen Eintrag in `einfach/`.
- Zahlen: In allen geänderten Texten stehen in jeder Sprache dieselben Zahlen wie im Deutschen (Ausnahme: „6-stellig“ ist in fa, fa-AF und ps als Wort geschrieben, richtig).

## Prüfvermerk (21.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| `einfach/geld.json` `ra.unpf`: „Gläubiger dürfen davon gerade nichts pfänden“ klang wie eine Zusage. Deutsch sagt nur „nach der Pfändungstabelle“. Unterhalts-Gläubiger und ein Konto ohne P-Konto sind davon nicht erfasst. | mittel | „Nach der Pfändungs-Tabelle können Gläubiger davon gerade nichts pfänden.“ | § 850d, § 850k ZPO, gesetze-im-internet.de |
| `einfach/schulden.json` `sl.warum.energie`: „weil du krank bist? Dann darf sie nicht sperren“ war weiter als das Gesetz (unverhältnismäßig, vor allem bei Gefahr für Leib oder Leben). | mittel | „viel zu hart, zum Beispiel weil deine Gesundheit in Gefahr ist“ | § 41f Abs. 1 Satz 2, Abs. 2 EnWG, gesetze-im-internet.de/enwg_2005/__41f.html |
| `einfach/haushalt2.json` `tv.kuendigung`: „darfst du sofort kündigen“ konnte heißen, der Vertrag endet sofort. Er endet, wenn der neue Preis gilt. | niedrig | „ohne Frist kündigen. Der Vertrag endet dann an dem Tag, ab dem der neue Preis gilt.“ | § 41 Abs. 5 EnWG; § 20 Abs. 1 StromGVV (2 Wochen) |
| `einfach/ausziehen.json` `az.p.u25.t`: Satz „Das gilt auch: Deine Familie bekommt …“ war schwer zu verstehen. | niedrig | „Das gilt auch, wenn deine Familie Grundsicherungsgeld bekommt. Oder wenn du es nach dem Umzug brauchst.“ | § 22 Abs. 5 SGB II |
| `einfach/vorgang-pin.json` `vgp.kurz`: „Das musst du nicht.“ war unvollständig. | niedrig | „Name in der Liste (musst du nicht ausfüllen)“ | – |
| Rundfunkbeitrag (`s.rundfunk.tip`): Befreiung ab dem Monat, ab dem der Bescheid gilt, höchstens 3 Jahre vor dem Antragsmonat; gilt für Ehe- und Lebenspartner. | richtig | keine | § 4 Abs. 3 und 4 RBeitrStV, gesetze-bayern.de/Content/Document/RBeitrStV-4 |
| Landespflegegeld (`t.lpg.antrag`): Auszahlung bis 31. Januar des Folgejahres; Antrag wirkt fort. | richtig | keine | Art. 2 Abs. 4, Art. 3 BayLPflGG (Fassung ab 1.1.2026), gesetze-bayern.de |
| Unterhalt beim Wohngeld (`t.uz.wg`): 3 000 € bzw. 6 000 € im Jahr (= 250 € / 500 € im Monat), mit Titel, Notarvertrag oder Bescheid der dort festgelegte Betrag. | richtig | keine | § 18 WoGG |
| P-Konto (`gs.d.konto.schritt`): 4. Geschäftstag, nur ein P-Konto je Person. | richtig | keine | § 850k Abs. 2 und 3 ZPO |
| Energiesperre (`gs.d.strom.*`, `sl.warum.energie`): 2 Abschläge und mindestens 100 €, 4 Wochen Androhung, 8 Werktage Ankündigung, Abwendungsvereinbarung in der Grundversorgung. | richtig | keine | § 41f Abs. 1, 3, 5 und § 41g Abs. 1 EnWG |
| Mietschulden (`sl.warum.miete`, Einfache Sprache): fristlose Kündigung, Nachzahlung bis 2 Monate nach Zustellung der Räumungsklage, einmal in 2 Jahren. | richtig | keine | § 543 Abs. 2 Nr. 3, § 569 Abs. 3 BGB |
| Krankenkasse (`sl.warum.kranken`, Einfache Sprache): Ruhen ab 2 Monaten Rückstand, Ausnahmen, Ratenvereinbarung, nicht bei Hilfebedürftigkeit. | richtig | keine | § 16 Abs. 3a SGB V |
| Kostensenkung (`el.ks.*`, Einfache Sprache): Karenzzeit 1 Jahr, höchstens das 1,5-Fache, Mietpreisbremse, Quadratmeter-Grenze, in der Regel 6 Monate; Sozialamt mit Anrechnung der Zeit beim Jobcenter; Zusicherung vor Umzug. | richtig | keine | § 22 Abs. 1, 4 bis 6, § 65 Abs. 4 SGB II; § 35, § 35a Abs. 2 SGB XII |
| Vermögen (`t.ggeld.vermAlter`, `t.kiz.vermKnapp`, `t.bafoeg.vermTeil`): Freibetrag nach Alter je Person; Kinderzuschlag nur im ersten Monat gemindert; BAföG verteilt auf die Monate der Bewilligung. | richtig; Hinweis | keine. „12 Monate“ ist der Regelfall, das Gesetz teilt durch die Monate des Bewilligungszeitraums. Der Text sagt „etwa“ und „das Amt rechnet genau“. | § 12 Abs. 2 SGB II; § 6a Abs. 3 BKGG; § 30 BAföG |
| Mehrbedarf Schwangerschaft (Einfache Sprache): bis zum Ende des Monats der Geburt. | richtig | keine | § 21 Abs. 2 SGB II |
| Ratenvorschlag (`ra.*`): Rechenhilfe nach festem Schema mit Hinweis „Faustregel, keine Rechtsberatung, du entscheidest selbst“; Warnung vor Anerkenntnis; Vorrang Miete, Strom, Geldstrafe. Keine Prüfung des Einzelfalls, keine Zusage. | richtig (allgemeine Information, § 2 Abs. 1 RDG) | keine | § 2 RDG, gesetze-im-internet.de |
| Tarifvergleich (`tv.*`): Tipps stammen von den Verbraucherzentralen (nicht amtlich, im Text so genannt). Die Rechtsaussagen darin (2 Wochen, Kündigung bei Preiserhöhung) sind amtlich belegt. | Hinweis | keine | § 20 StromGVV, § 41 Abs. 5 EnWG |
| Stichproben Rückübersetzung fa-AF, ps, so (16 Schlüssel: Rundfunk, Landespflegegeld, Stromsperre, P-Konto, Darlehen, Ratenvorschlag, Kündigungsfrist, PIN vergessen, Kinderzuschlag, BAföG): Fristen, Beträge und Warnungen stimmen mit Deutsch überein. | richtig | keine | Vergleich mit `de.json` |
| `suche/woerter/`: Die Fremdsprachen haben 32 statt 90 Ziele. Das ist so gebaut (Suchwörter sind je Sprache freiwillig), kein fehlender Text. | Hinweis | keine | `scripts/build.js`, `src/suche.js` |

## Offen

- Fremdsprachen wurden nur in Stichproben zurückübersetzt (Schwerpunkt fa-AF, ps, so), nicht Satz für Satz von Muttersprachlern.
- fa-AF wechselt zwischen „شما“ (Sie) und „تو“ (du) je nach Datei. Das ist kein Sachfehler, aber uneinheitlich.
