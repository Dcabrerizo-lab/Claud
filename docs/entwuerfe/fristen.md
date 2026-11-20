# Entwurf: Fristen in „Mein Ordner“

Stand 20.11.2026. Code gelesen auf dem Stand von PR #42 (`/home/claude/s1`). Alle Quellen abgerufen am 20.11.2026.
Verbindliche Ergänzung des Nutzers (20.11.2026) ist eingearbeitet: Die Fristen aus 1.3.0 bleiben gelöscht. Neue Fristen werden **nur in der App** gespeichert (auf dem Gerät, je Vorgang, mit PIN verschlüsselt). Keine Übergabe an einen Kalender, keine Cloud, keine Push-Mitteilungen des Systems. Erinnerung nur als ruhiger Hinweis beim Öffnen.

---

## 1. Kurzfassung (was der Nutzer sieht)

1. In „Mein Ordner“ steht oben die Karte **„Fristen“** mit der nächsten Frist, z. B. „Widerspruch Jobcenter: bis Mo., 14.12.2026 (noch 5 Tage)“. Ein Tipp darauf öffnet die Liste.
2. Fristen aus „Brief prüfen“ (Widerspruch, Unterlagen nachreichen, Anhörung, Zahlung, Mahnbescheid) kommen **nur auf Knopfdruck** in die Liste: Unter der erkannten Frist steht der Knopf „Frist merken“ (Entscheidung des Nutzers, 20.11.2026). Danach erscheint die Meldung „In Mein Ordner gemerkt · Rückgängig“. Nur das Ende eines Bewilligungszeitraums wird von selbst angezeigt, weil der Nutzer es im Haushaltsplan selbst eingetragen hat.
3. Jede Frist hat ein Wort: **„Fest“**, wenn das Datum im Brief steht, **„Gerechnet“**, wenn die App es aus dem Datum des Briefs ausgerechnet hat, **„Ungefähr“**, wenn das Datum des Briefs fehlt. Die Rechnung steht unter „So wurde gerechnet“ zum Aufklappen.
4. Beim Öffnen der App erscheint **höchstens einmal am Tag** ein kleiner Hinweis auf der Startseite. Er kommt nur, wenn eine Frist in den nächsten 7 Tagen endet oder schon abgelaufen ist (beim Folgeantrag 6 Wochen bzw. 2 Monate vorher). Knöpfe: „Erledigt“, „Später erinnern“, „Ansehen“.
5. Alles bleibt auf dem Gerät und gehört zum geöffneten Vorgang: Mit PIN ist es verschlüsselt (ohne PIN liegt es wie alle anderen Angaben unverschlüsselt im App-Speicher des Geräts), beim Kopieren wird es mitkopiert, beim Löschen mitgelöscht.

---

## 2. Warum die Fristen aus 1.3.0 gelöscht wurden und was diesmal anders ist

**Befund aus den Unterlagen.** Einen ausdrücklichen Grund nennen `docs/VERLAUF.md`, `docs/AENDERUNGEN.md` und `STATUS.md` nicht. Belegt ist Folgendes:

| Stelle | Inhalt |
|---|---|
| `docs/AENDERUNGEN.md`, 1.3.0 (Build 141) | Eigener **Bereich „Fristen“** als vierter Reiter, Fristen auf der Startseite, Widerspruchsfristen **automatisch eingetragen**, eigene Fristen, Fristrechner, **Punkt in der Leiste** bei Fristen in den nächsten 14 Tagen, Direktlink `#fristen`. |
| `docs/AENDERUNGEN.md`, 1.3.1 (Build 142) | Bereich, Startseite, Rechner und automatisches Eintragen entfernt. „Fristen, die mit Build 141 gespeichert wurden, löscht die App beim Start.“ |
| `docs/AENDERUNGEN.md`, 1.2.0 | „Fristen in den Kalender“ entfernt. |
| `STATUS.md`, Entscheidungen | „Kein Vorlesen, **keine Fristen-Kalender**, keine mitgelieferten Formulare.“ |
| `docs/APPLE-REVIEW-ANTWORT.md` | Store-Texte „ohne Kalender/Fristen“. |
| `test/e2e-briefe.js` Z. 17 | Das alte Format war **Klartext-JSON unter einem eigenen, globalen Schlüssel**: `localStorage['lotse.fristen'] = '[{"titel":"Alt","datum":"2026-12-01"}]'`. Es lag also außerhalb der Vorgänge und war nie mit PIN verschlüsselt. |
| `src/app.js` Z. 3401, Z. 2118 | `Store.remove('lotse.fristen')` beim Start; Schlüssel steht in `STORE_SCHLUESSEL` („Alle Angaben löschen“). |

**Folgerung (abgeleitet, nicht ausdrücklich dokumentiert):** Die damalige Lösung war ein eigener Bereich mit Kalender-Charakter: eigener Reiter, Punkt in der Leiste, eigener Rechner. Die Daten lagen im Klartext und nicht im Vorgang. Laut Nutzer (20.11.2026) war das Löschen richtig.

**Was diesmal anders ist:**
- **Kein eigener Bereich.** Kein Reiter, kein Punkt in der Leiste, kein `#fristen`, keine neue Startkachel. Die Liste ist eine Unterseite von „Mein Ordner“.
- **Neuer Schlüssel `lotse.fristliste`**, eingetragen in `Vorgaenge.DATEN`: je Vorgang gespeichert, mit PIN verschlüsselt, mitkopiert und mitgelöscht.
- **`Store.remove('lotse.fristen')` bleibt** (Z. 3401). Die Tests `e2e-briefe.js` Z. 20–21, 57 und `app-test.js` Z. 73–85 bleiben unverändert grün. Sie prüfen den genauen Schlüssel `lotse.fristen`, den IDs `#v-fristen`, `[data-ansicht=fristen]`, `#startFristen` und den Link `#fristen`. **Diese Namen dürfen nicht wieder benutzt werden.**
- **Kein Kalender-Export, keine Mitteilung des Systems.** Es gibt keine .ics-Datei, kein `LocalNotifications`-Plugin und keine Badge.
- **Kein eigener Fristrechner** als Bereich. Gerechnet wird nur im Hintergrund, mit Anzeige des Rechenwegs.

---

## 3. Inhalte und Texte (Deutsch + Einfache Sprache)

Präfix der Schlüssel: `fri.*`. `fr.*` wäre mit dem Sprachcode Französisch verwechselbar; `fri.*` gibt es in `de.json` noch nicht (geprüft). Es kommen eigene Sprachdateien `src/lang/fristen/<Sprache>.json` dazu, wie bei `haushalt` und `ausziehen`, damit andere Arbeiten nicht kollidieren. Einfache Sprache steht in `src/lang/einfach/fristen.json`.

Fußnoten ¹–¹⁸ verweisen auf Abschnitt 4.

### 3.1 Karte in „Mein Ordner“

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `fri.karte` | Fristen | Termine und Fristen |
| `fri.karte.naechste` | Nächste: {titel}, bis {datum} ({rest}) | Als Nächstes: {titel}. Bis {datum}. ({rest}) |
| `fri.karte.keine` | Keine offene Frist | Gerade keine Frist |
| `fri.rest.heute` | heute | heute |
| `fri.rest.morgen` | morgen | morgen |
| `fri.rest.tage` | noch {n} Tage | noch {n} Tage |
| `fri.rest.vorbei` | seit {n} Tagen abgelaufen | Die Zeit ist seit {n} Tagen vorbei |

### 3.2 Liste (Unterseite „Fristen“)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `fri.h` | Fristen | Termine und Fristen |
| `fri.lead` | Das Wichtigste zuerst. Die Fristen gehören zu diesem Vorgang und bleiben auf deinem Gerät. | Oben steht, was zuerst kommt. Die Termine bleiben nur auf deinem Handy. |
| `fri.wort.fest` | Fest | Fest |
| `fri.wort.fest.t` | Dieses Datum steht so im Brief. | Das Datum steht so im Brief. |
| `fri.wort.gerechnet` | Gerechnet | Ausgerechnet |
| `fri.wort.gerechnet.t` | Aus dem Datum des Briefs ausgerechnet. Im Zweifel gilt dein Brief. | Die App hat das Datum ausgerechnet. Wichtig ist, was im Brief steht. |
| `fri.wort.ungefaehr` | Ungefähr | Ungefähr |
| `fri.wort.ungefaehr.t` | Das Datum des Briefs fehlt. Die App rechnet vorsichtig vom Tag, an dem du den Brief bekommen hast. Die echte Frist kann ein paar Tage später enden, aber nicht früher. Trag das Datum des Briefs nach, dann wird es genau. | Das Datum vom Brief fehlt. Die App rechnet vorsichtig. Schreib das Datum vom Brief dazu. Dann stimmt es genau. |
| `fri.wort.offen` | Datum fehlt | Datum fehlt |
| `fri.wort.offen.t` | Für diese Frist fehlt ein Datum. Trag das Datum des Briefs ein. | Hier fehlt ein Datum. Schreib das Datum vom Brief dazu. |
| `fri.rechnung` | So wurde gerechnet | So hat die App gerechnet |
| `fri.rechnung.wid` | Brief vom {datum}. Ein Brief per Post gilt am vierten Tag danach als bekannt gegeben: {bekannt}.¹ Ab dann ein Monat.² Fällt das Ende auf Samstag, Sonntag oder Feiertag, endet die Frist am nächsten Werktag.³ | Der Brief ist vom {datum}. Für das Amt kommt ein Brief 4 Tage später an: {bekannt}. Ab dann hast du 1 Monat Zeit. Ist der letzte Tag ein Samstag, Sonntag oder Feiertag? Dann darfst du bis zum nächsten Werktag. |
| `fri.rechnung.woche` | Brief bekommen am {bekannt}. Ab dem Tag danach {n} Wochen.⁴ Fällt das Ende auf Samstag, Sonntag oder Feiertag, endet die Frist am nächsten Werktag.⁵ | Du hast den Brief am {bekannt} bekommen. Ab dann hast du {n} Wochen Zeit. |
| `fri.rechnung.woche.ohne` | Brief vom {datum}. Du hast nicht eingetragen, wann er ankam. Die App rechnet deshalb vorsichtig ab dem Tag nach dem Datum des Briefs: {n} Wochen.⁴ Trag ein, wann der Brief ankam, dann wird es genau. | Der Brief ist vom {datum}. Die App weiß nicht, wann er ankam. Sie rechnet vorsichtig. Schreib dazu, wann der Brief ankam. Dann stimmt es genau. |
| `fri.rechnung.zustellung` | Zugestellt am {datum} (Datum auf dem gelben Umschlag).⁶ Ab dann zwei Wochen.⁷ Fällt das Ende auf Samstag, Sonntag oder Feiertag, endet die Frist am nächsten Werktag.⁸ | Der Brief kam am {datum}. Das Datum steht auf dem gelben Umschlag. Ab dann hast du 2 Wochen Zeit. |
| `fri.rechnung.fest` | Der Brief nennt diesen Tag. Die App verschiebt ihn nicht.⁹ | Der Tag steht im Brief. Die App ändert ihn nicht. |
| `fri.rechnung.feiertag` | Die App zählt nur Feiertage, die in ganz Deutschland gelten. Bei einem Feiertag in deinem Bundesland kann es einen Tag später sein. Die App nennt nie einen zu späten Tag. | Die App rechnet nur mit Feiertagen in ganz Deutschland. Gibt es in deinem Bundesland noch einen Feiertag? Dann kann es 1 Tag später sein. |
| `fri.eingang` | Bis zu diesem Tag muss dein Schreiben bei der Stelle angekommen sein. Abschicken allein reicht nicht. Sicher ist: persönlich abgeben mit Eingangsstempel, Fax mit Sendebericht oder Einwurf in den Briefkasten der Stelle. | Dein Brief muss bis zu dem Tag beim Amt sein. Abschicken reicht nicht. Am besten: selbst hinbringen und einen Stempel geben lassen. |
| `fri.belehrung` | Fehlt im Bescheid die Rechtsbehelfsbelehrung oder ist sie falsch, gilt ein Jahr statt ein Monat.¹⁰ | Steht im Bescheid nicht, wie du dich wehren kannst? Dann hast du 1 Jahr Zeit. |
| `fri.erledigt` | Erledigt | Erledigt |
| `fri.erledigt.ok` | Als erledigt markiert. | Gut. Das ist erledigt. |
| `fri.rueck` | Rückgängig | Zurück |
| `fri.aendern` | Datum ändern | Datum ändern |
| `fri.loeschen` | Entfernen | Löschen |
| `fri.eigen` | Eigene Frist eintragen | Eigenen Termin dazuschreiben |
| `fri.eigen.titel` | Worum geht es? | Was ist das? |
| `fri.eigen.bis` | Bis wann? | Bis wann? |
| `fri.erledigtListe` | Erledigt ({n}) | Erledigt ({n}) |
| `fri.erledigtListe.t` | Erledigte Fristen verschwinden nach 30 Tagen. | Erledigte Termine sind nach 30 Tagen weg. |
| `fri.vorgangWeg` | Achtung: Dieser Vorgang wird am {datum} automatisch gelöscht, also vor der Frist am {bis}. Die Frist geht dann mit verloren. Du kannst „Automatisch löschen“ in den Einstellungen ändern. | Achtung: Die App löscht diesen Vorgang am {datum}. Die Frist ist aber erst am {bis}. Dann ist auch die Frist weg. Du kannst das in den Einstellungen ändern. |
| `fri.merken` | Frist merken | Termin merken |
| `fri.merken.t` | Die Frist kommt in „Mein Ordner“. Sie bleibt auf deinem Gerät. | Der Termin kommt in „Mein Ordner“. Er bleibt nur auf deinem Handy. |
| `fri.gemerkt` | In „Mein Ordner“ gemerkt: {titel}, bis {datum}. | Gemerkt in „Mein Ordner“: {titel}, bis {datum}. |
| `fri.schonDa` | Diese Frist steht schon in „Mein Ordner“. | Den Termin gibt es schon in „Mein Ordner“. |

### 3.3 Arten von Fristen (Titel und Erklärung)

| Schlüssel | Deutsch (Titel / Erklärung) | Einfache Sprache |
|---|---|---|
| `fri.art.wid` / `.t` | Widerspruch gegen den Bescheid ({stelle}) / Ein Monat ab Bekanntgabe.² Der Widerspruch muss bis zum Ende der Frist bei der Stelle sein. | Widerspruch gegen den Brief vom Amt / Du hast 1 Monat Zeit. Dein Widerspruch muss bis dahin beim Amt sein. |
| `fri.art.mit` / `.t` | Unterlagen nachreichen ({stelle}) / Reiche die Unterlagen bis zu diesem Tag ein. Schaffst du es nicht, schreib vorher und bitte um mehr Zeit. Die Stelle kann die Frist verlängern.¹¹ Ohne Unterlagen kann sie die Leistung versagen.¹² | Unterlagen schicken / Schick die Papiere bis zu dem Tag. Schaffst du es nicht? Schreib vorher an das Amt und bitte um mehr Zeit. |
| `fri.art.anh` / `.t` | Anhörung beantworten ({stelle}) / Du darfst dich bis zu diesem Tag äußern.¹³ Wenn du nicht antwortest, entscheidet die Stelle ohne deine Sicht. | Auf die Anhörung antworten / Bis zu dem Tag darfst du deine Sicht schreiben. Sonst entscheidet das Amt ohne dich. |
| `fri.art.zahl` / `.t` | Zahlen bis ({stelle}) / So steht es im Brief. Kannst du nicht zahlen, frag vorher nach Raten oder Stundung. | Bezahlen bis / Kannst du nicht zahlen? Frag vorher nach kleinen Raten. |
| `fri.art.mb` / `.t` | Widerspruch gegen den Mahnbescheid / Zwei Wochen ab Zustellung.⁷ Danach kann der Gläubiger einen Vollstreckungsbescheid beantragen. Solange es den noch nicht gibt, ist ein Widerspruch noch möglich.¹⁴ Hol dir schnell Hilfe bei einer Schuldnerberatung. | Widerspruch gegen den Mahn-Bescheid / Du hast 2 Wochen Zeit. Hol dir schnell Hilfe bei einer Schuldner-Beratung. |
| `fri.art.vb` / `.t` | Einspruch gegen den Vollstreckungsbescheid / Zwei Wochen ab Zustellung. Diese Frist wird nicht verlängert (Notfrist).¹⁵ Hol dir sofort Hilfe bei einer Schuldnerberatung oder Rechtsberatung. | Einspruch gegen den Vollstreckungs-Bescheid / Du hast nur 2 Wochen. Hol dir sofort Hilfe. |
| `fri.art.termin` / `.t` | Termin bei {stelle} / Ein Termin gilt auch, wenn er auf ein Wochenende fällt.⁹ Kannst du nicht kommen, sag vorher ab und nenne den Grund. Beim Jobcenter gilt: Wer wiederholt ohne wichtigen Grund nicht kommt, bekommt einen Monat lang weniger Geld (30 % vom Regelbedarf; Miete und Heizung werden nicht gekürzt). Wer drei Termine nacheinander ohne wichtigen Grund versäumt, kann die Leistung ganz verlieren. Den wichtigen Grund musst du nachweisen, zum Beispiel mit einem Attest.¹⁶ | Termin beim Amt / Kannst du nicht kommen? Sag vorher Bescheid und sag warum. Heb den Beweis auf, zum Beispiel ein Attest. Beim Jobcenter: Wer mehrmals ohne wichtigen Grund fehlt, bekommt 1 Monat weniger Geld. Wer 3-mal hintereinander fehlt, bekommt vielleicht gar kein Geld mehr. |
| `fri.art.wb` / `.t` | Folgeantrag {leistung} stellen / Bewilligt bis {ende}. Ohne neuen Antrag endet die Zahlung.¹⁷ Am besten jetzt stellen, damit das Geld ohne Lücke weiterkommt. | Neuen Antrag stellen: {leistung} / Das Geld gibt es nur bis zum {ende}. Stell jetzt einen neuen Antrag. Dann kommt das Geld ohne Pause weiter. |
| `fri.art.wb.spaet` | Schon vorbei? Stell den Antrag sofort, noch in diesem Monat. Er gilt dann meist ab dem Ersten des Monats, in dem du ihn stellst. Für frühere Monate gibt es nichts.¹⁸ | Schon vorbei? Stell den Antrag sofort, noch in diesem Monat. Für die Monate davor gibt es kein Geld. |
| `fri.art.eigen` | Eigene Frist | Eigener Termin |

Leistungsnamen für `{leistung}`: die vorhandenen Schlüssel `hb.wb.sgb2`, `hb.wb.sgb12`, `hb.wb.wohngeld`, `hb.wb.kiz` (`src/lang/haushalt/*.json`) werden wiederverwendet. Für `{stelle}` gibt es Kurzschlüssel `fri.stelle.jc|sa|wg|fk|pk|vm|gericht|andere` („Jobcenter“, „Sozialamt“, „Wohngeldstelle“, „Familienkasse“, „Pflegekasse“, „Vermieter“, „Gericht“, „Stelle“). In der Einfachen Sprache: „Jobcenter“, „Sozial-Amt“, „Wohngeld-Stelle“, „Familien-Kasse“, „Pflege-Kasse“, „Vermieter“, „Gericht“, „Amt“.

### 3.4 Hinweis beim Öffnen (Startseite)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `fri.start.bald` | Frist: {titel} – bis {datum} ({rest}). | Bald: {titel}. Bis {datum}. ({rest}) |
| `fri.start.vorbei` | Abgelaufen: {titel} – am {datum}. Ist es schon erledigt? | Vorbei: {titel}. Das war am {datum}. Hast du es schon gemacht? |
| `fri.start.vorgang` | Vorgang: {name} | Für: {name} |
| `fri.start.mehr` | und {n} weitere | und noch {n} |
| `fri.start.ansehen` | Ansehen | Ansehen |
| `fri.start.spaeter` | Später erinnern | Später |
| `fri.start.spaeter.ok` | Die App erinnert dich am {datum} wieder. | Die App sagt es dir am {datum} wieder. |
| `fri.set.label` | Erinnerung an Fristen beim Öffnen | Beim Öffnen an Termine erinnern |
| `fri.set.t` | Ein kurzer Hinweis auf der Startseite, höchstens einmal am Tag. Keine Mitteilungen auf dem Sperrbildschirm. | Ein kleiner Hinweis in der App, höchstens 1-mal am Tag. Nicht auf dem Sperr-Bildschirm. |

---

## 4. Zahlen und Regeln (mit Quelle)

Alle Quellen abgerufen am 20.11.2026.

| Nr. | Regel | Wert / Rechnung | Quelle (amtlich) | gültig ab / bis |
|---|---|---|---|---|
| ¹ | Bekanntgabe eines Verwaltungsakts per Post im Inland | **am 4. Tag nach Aufgabe zur Post**. Nicht, wenn der Brief nicht oder später zugegangen ist; im Zweifel muss die Behörde Zugang und Zeitpunkt nachweisen | § 37 Abs. 2 Satz 1 und 3 SGB X, https://www.gesetze-im-internet.de/sgb_10/__37.html ; geändert durch das Gesetz zur Modernisierung des Postrechts, BGBl. 2024 I Nr. 236, https://www.recht.bund.de/bgbl/1/2024/236/VO.html . Dasselbe gilt für elektronisch übermittelte Bescheide (4. Tag nach Absendung, § 37 Abs. 2 Satz 2, Abs. 2a SGB X). **Gilt nur für Verwaltungsakte (Bescheide)**, nicht für einfache Schreiben wie Anhörung oder Aufforderung zur Mitwirkung (siehe ⁴) | ab 1.1.2025 (vorher 3. Tag) / unbefristet |
| ² | Widerspruchsfrist | **1 Monat** ab Bekanntgabe; 3 Monate bei Bekanntgabe im Ausland | § 84 Abs. 1 SGG, https://www.gesetze-im-internet.de/sgg/__84.html . Wohngeld (Verwaltungsrechtsweg): ebenfalls 1 Monat, § 70 Abs. 1 VwGO, https://www.gesetze-im-internet.de/vwgo/__70.html ; Berechnung über § 57 Abs. 2 VwGO, § 222 ZPO mit gleichem Ergebnis. In manchen Ländern gibt es beim Wohngeld keinen Widerspruch, sondern gleich die Klage (ebenfalls 1 Monat): Maßgeblich ist die Rechtsbehelfsbelehrung im Bescheid | geltend / unbefristet |
| ³ | Fristberechnung Widerspruch/Klage | Beginn am Tag nach dem Ereignis; Monatsfrist endet am Tag mit derselben Zahl, fehlt er, am Monatsletzten; Ende an Sa, So oder gesetzlichem Feiertag → nächster Werktag | § 64 Abs. 1–3 SGG, https://www.gesetze-im-internet.de/sgg/__64.html (vom BSG auch für die Zeit ab Bekanntgabe eines Bescheids angewandt, Urteil vom 6.5.2010, B 14 AS 12/09 R); gleiches Ergebnis über § 26 Abs. 1, 3 SGB X mit §§ 187, 188 BGB | geltend |
| ⁴ | Behördliche Fristen (Mitwirkung, Anhörung) | §§ 187–193 BGB gelten entsprechend; die Frist beginnt am Tag nach der Bekanntgabe der Frist (§ 26 Abs. 2 SGB X); Wochenfrist endet am gleichen Wochentag der letzten Woche. **Keine 4-Tage-Fiktion:** Diese Schreiben sind keine Verwaltungsakte, es zählt der tatsächliche Zugang. Der kann schon am Tag nach dem Briefdatum sein. SoLo rechnet deshalb ab dem eingetragenen Tag des Erhalts, sonst ab Briefdatum + 1 Tag (Wort „Ungefähr“) | § 26 Abs. 1, 2 SGB X, https://www.gesetze-im-internet.de/sgb_10/__26.html ; §§ 187, 188 BGB, https://www.gesetze-im-internet.de/bgb/__187.html , https://www.gesetze-im-internet.de/bgb/__188.html | geltend |
| ⁵ | Ende an Sa, So, Feiertag (behördliche Frist) | nächster Werktag, **außer** die Behörde hat unter Hinweis auf diese Vorschrift einen bestimmten Tag mitgeteilt | § 26 Abs. 3 SGB X (Quelle wie ⁴) | geltend |
| ⁶ | Zustellung mit Zustellungsurkunde | Datum der Zustellung steht auf dem Umschlag (auch bei Einwurf in den Briefkasten) | § 180 Satz 3 ZPO, https://www.gesetze-im-internet.de/zpo/__180.html ; § 182 Abs. 2 Nr. 6 ZPO, https://www.gesetze-im-internet.de/zpo/__182.html | geltend |
| ⁷ | Widerspruch gegen den Mahnbescheid | **2 Wochen** ab Zustellung | § 692 Abs. 1 Nr. 3 ZPO, https://www.gesetze-im-internet.de/zpo/__692.html ; Vollstreckungsbescheid erst nach Ablauf dieser Frist: § 699 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__699.html | geltend |
| ⁸ | Fristende ZPO an Sa, So, Feiertag | nächster Werktag | § 222 Abs. 1, 2 ZPO, https://www.gesetze-im-internet.de/zpo/__222.html ; § 193 BGB, https://www.gesetze-im-internet.de/bgb/__193.html | geltend |
| ⁹ | Von der Behörde gesetzter Termin | ist auch an Sa, So oder Feiertag einzuhalten. SoLo verschiebt Daten, die im Brief stehen, nie | § 26 Abs. 5 SGB X (Quelle wie ⁴) | geltend |
| ¹⁰ | Fehlende oder falsche Rechtsbehelfsbelehrung | 1 Jahr statt 1 Monat | § 66 Abs. 2 SGG, https://www.gesetze-im-internet.de/sgg/__66.html | geltend |
| ¹¹ | Verlängerung behördlicher Fristen | möglich, auch rückwirkend | § 26 Abs. 7 SGB X (Quelle wie ⁴) | geltend |
| ¹² | Folgen fehlender Mitwirkung | Versagung oder Entziehung, erst nach schriftlichem Hinweis und angemessener Frist | § 66 Abs. 1, 3 SGB I, https://www.gesetze-im-internet.de/sgb_1/__66.html | geltend |
| ¹³ | Anhörung | Gelegenheit zur Äußerung vor belastendem Verwaltungsakt; **keine feste Länge im Gesetz**, die Behörde setzt die Frist | § 24 Abs. 1 SGB X, https://www.gesetze-im-internet.de/sgb_10/__24.html | geltend |
| ¹⁴ | Widerspruch nach Fristablauf | zulässig, solange der Vollstreckungsbescheid nicht verfügt ist; ein verspäteter Widerspruch wird als Einspruch behandelt | § 694 Abs. 1, 2 ZPO, https://www.gesetze-im-internet.de/zpo/__694.html | geltend |
| ¹⁵ | Einspruch gegen den Vollstreckungsbescheid | **2 Wochen**, Notfrist, ab Zustellung | § 700 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__700.html ; § 339 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__339.html | geltend |
| ¹⁶ | Meldeversäumnis beim Jobcenter (Neue Grundsicherung) | Wer einer Meldeaufforderung **wiederholt** nicht nachkommt (trotz Rechtsfolgenbelehrung): Minderung um **30 % des maßgebenden Regelbedarfs**, **1 Monat**. Nicht, wenn ein wichtiger Grund dargelegt **und nachgewiesen** wird; nicht bei außergewöhnlicher Härte. Unterkunft und Heizung werden nicht gemindert; insgesamt höchstens 30 %. **Drei aufeinanderfolgende** Meldeaufforderungen ohne nachgewiesenen wichtigen Grund: gilt als nicht erreichbar, der Leistungsanspruch entfällt ab dem Folgemonat der Feststellung | Gesetzestext (geprüft 20.11.2026): § 32 Abs. 1, 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__32.html ; § 31a Abs. 3, 4 SGB II, https://www.gesetze-im-internet.de/sgb_2/__31a.html ; § 7b Abs. 4 SGB II, https://www.gesetze-im-internet.de/sgb_2/__7b.html ; Dreizehntes Gesetz zur Änderung des SGB II, BGBl. 2026 I Nr. 107, https://www.recht.bund.de/bgbl/1/2026/107/VO.html | ab 1.7.2026 |
| ¹⁷a | Bewilligungszeitraum Grundsicherungsgeld | in der Regel **12 Monate**; **6 Monate** sollen es sein bei vorläufiger Entscheidung (§ 41a) oder unangemessenen Kosten der Unterkunft | § 41 Abs. 3 SGB II, https://www.gesetze-im-internet.de/sgb_2/__41.html | geltend. Am 20.11.2026 im Gesetzestext nach der Reform (BGBl. 2026 I Nr. 107) geprüft: § 41 Abs. 3 SGB II lautet unverändert „in der Regel für ein Jahr“, Verkürzung „regelmäßig auf sechs Monate“ in den zwei genannten Fällen. Das konkrete Ende steht immer im Bescheid |
| ¹⁷b | Bewilligungszeitraum Grundsicherung im Alter | in der Regel **12 Monate**, vorläufig höchstens 6 | § 44 Abs. 3 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__44.html | geltend |
| ¹⁷c | Bewilligungszeitraum Wohngeld | soll **12 Monate** sein; kürzer möglich; bis **24 Monate**, wenn keine Änderung zu erwarten ist | § 25 Abs. 1 WoGG, https://www.gesetze-im-internet.de/wogg/__25.html | geltend. Reform 2027: Gesetzentwurf der Bundesregierung, BT-Drucksache 21/8284 vom 30.9.2026 (https://dserver.bundestag.de/btd/21/082/2108284.pdf), 1. Lesung 8.10.2026, Anhörung im Ausschuss 4.11.2026, am 20.11.2026 **noch nicht beschlossen**; geplant ab 1.1.2027. Der Entwurf ändert § 25 und § 22 Abs. 4 WoGG **nicht**. Laufende Bewilligungen bleiben bis zum Ende ihres Zeitraums bestehen (§ 42e Abs. 1 WoGG-Entwurf; ebenso https://www.bundesregierung.de/breg-de/aktuelles/neuordnung-wohngeld-2445796). Vor dem Einbau die verkündete Fassung im BGBl. prüfen |
| ¹⁷d | Wohngeld: Antrag für die Zeit danach | Wird er **mehr als 2 Monate** vor Ende gestellt, gilt der Erste des zweiten Monats vor Ablauf als Antragstag (ein früher Antrag schadet also nicht). Beginn des Zeitraums: Erster des Antragsmonats | § 22 Abs. 4 WoGG, https://www.gesetze-im-internet.de/wogg/__22.html ; § 25 Abs. 2 WoGG | geltend |
| ¹⁷e | Kinderzuschlag | immer **6 Monate**; beginnt mit dem Antragsmonat, frühestens nach Ende des laufenden Zeitraums | § 6a Abs. 7 BKGG, https://www.gesetze-im-internet.de/bkgg_1996/__6a.html ; schriftlich bei der Familienkasse: § 9 Abs. 1 BKGG, https://www.gesetze-im-internet.de/bkgg_1996/__9.html | geltend |
| ¹⁸ | Rückwirkung des Antrags | SGB II: auf den Ersten des Antragsmonats, nicht davor (§ 37 Abs. 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__37.html). SGB XII: Erster des Antragsmonats (§ 44 Abs. 2 SGB XII). Wohngeld: Erster des Antragsmonats (§ 25 Abs. 2 WoGG). KiZ: Antragsmonat (§ 6a Abs. 7 BKGG) | wie links | geltend |
| – | Vorlauf der Erinnerung an den Folgeantrag (App-Regel, kein Gesetz) | Grundsicherungsgeld, GSA, KiZ: **42 Tage**; Wohngeld: **60 Tage** (passt zu § 22 Abs. 4 WoGG) | bestehende Werte `Haushalt.VORLAUF_TAGE` (`src/haushalt.js` Z. 230) und `erweiterungen/fristen.js` `VORLAUF` | – |
| – | Feiertage | Gezählt werden nur die 9 bundesweit geltenden Feiertage (Neujahr, Karfreitag, Ostermontag, 1. Mai, Himmelfahrt, Pfingstmontag, 3. Oktober, 25./26. Dezember). Landesfeiertage verlängern höchstens, SoLo nennt also eher einen zu frühen Tag. § 193 BGB stellt auf Feiertage am Erklärungs- oder Leistungsort ab | `Fristen.feiertage` in `erweiterungen/fristen.js`; § 193 BGB | – |

**Sicherheitsregel der Rechnung:** SoLo nennt immer den **frühesten möglichen Tag**:
- Die Bekanntgabe am 4. Tag wird nicht auf einen Werktag verschoben. Das entspricht der Rechtsprechung des BSG zum Sozialrecht: Der Bescheid gilt auch dann am (damals dritten) Tag als bekannt gegeben, wenn dieser Tag ein Samstag, Sonntag oder Feiertag ist (BSG, Urteil vom 6.5.2010, B 14 AS 12/09 R, Leitsatz; amtlich: https://www.rechtsprechung-im-internet.de/jportal/?quelle=jlink&docid=KSRE123901513&psml=bsjrsprod.psml&max=true). Das Urteil betrifft die alte 3-Tage-Regel; eine höchstrichterliche Entscheidung zur 4-Tage-Regel habe ich nicht gefunden. Im Steuerrecht (Kindergeld nach dem EStG, § 108 Abs. 3 AO) verschiebt sich der Tag; SoLo nennt dort also einen früheren, sicheren Tag.
- Die 4-Tage-Regel wird **nur bei Bescheiden** angewandt (Widerspruch). Bei Anhörung und Mitwirkung rechnet SoLo ab dem Tag des Erhalts, ohne diese Angabe ab dem Tag nach dem Briefdatum (früheste mögliche Ankunft per Post), siehe ⁴.
- Es zählen keine Landesfeiertage.
- Fehlt das Datum des Briefs, rechnet SoLo vom Tag des Erhalts („Ungefähr“). Das ist nie später als die echte Frist, denn die Bekanntgabe kann nicht vor dem tatsächlichen Erhalt liegen, wenn dieser nach dem 4. Tag kam. Kam der Brief früher, gilt trotzdem der 4. Tag nach Aufgabe zur Post, also ein späterer Tag.
- Daten, die im Brief stehen, werden nie verschoben (§ 26 Abs. 3 Satz 2, Abs. 5 SGB X).

**Prüffälle für die Tests** (mit `erweiterungen/fristen.js` nachgerechnet):

| Fall | Eingabe | Erwartet |
|---|---|---|
| Widerspruch, Ende fällt auf Werktag | Bescheid 10.11.2026 | bekannt 14.11.2026 (Sa, nicht verschoben), Ende **Mo 14.12.2026** (wie bestehender e2e-Test) |
| Monatsende + Wochenende | Bescheid 27.01.2026 | bekannt 31.01.2026, 28.02.2026 ist Sa → **Mo 02.03.2026** |
| Ostern | Bescheid 24.03.2027 | bekannt 28.03.2027 (Ostersonntag), Ende **Mi 28.04.2027** |
| Wochenfrist über Jahreswechsel, Erhalt eingetragen | Mitwirkung „innerhalb von zwei Wochen“, Brief Fr 18.12.2026, erhalten Di 22.12.2026 | **Di 05.01.2027**, Wort „Gerechnet“ |
| Wochenfrist ohne Erhalt | wie oben, kein Tag des Erhalts | ab Sa 19.12.2026 (Briefdatum + 1): 02.01.2027 ist Sa → **Mo 04.01.2027**, Wort „Ungefähr“ (keine 4-Tage-Regel) |
| Mahnbescheid, Ende an Feiertagen | zugestellt Fr 11.12.2026 | 25.12. (Feiertag), 26.12. (Sa, Feiertag), 27.12. (So) → **Mo 28.12.2026** |
| Fester Tag an einem Samstag | „bis zum 12.12.2026“ | **12.12.2026** unverändert, Wort „Fest“ |
| Ungefähr | Widerspruch, kein Datum, erhalten 16.11.2026 | **16.12.2026**, Wort „Ungefähr“ |
| Folgeantrag Wohngeld | bewilligt bis 31.03.2027 | Aufgabe fällig 30.01.2027 (−60 Tage), Hinweis ab dann |

---

## 5. Erinnerung beim Öffnen: Regeln (Vorschlag)

Ziel: Der Hinweis hilft, ohne zu nerven. Es gibt **keine** Mitteilung des Systems, keinen Ton, keine Badge und keinen Punkt in der Leiste.

| Regel | Vorschlag |
|---|---|
| Wann erscheint er? | Beim Öffnen der App (Kaltstart oder Rückkehr nach mehr als 2 Minuten im Hintergrund, wie `VG_SPERRE_MS`), nur auf der Startseite. |
| Welche Fristen? | Offen, nicht erledigt, nicht „später“ bis nach heute, und: **endet in 0–7 Tagen** oder **seit 1–14 Tagen abgelaufen**. Beim **Folgeantrag**: ab dem Erinnerungstag (Ende − 42 bzw. − 60 Tage), weil Unterlagen Zeit brauchen. Ältere abgelaufene Fristen stehen nur noch in der Liste. |
| Wie oft? | **Höchstens einmal je Kalendertag.** Wurde heute schon geprüft, kommt er erst morgen wieder (Merker `lotse.fristTag`, siehe 6.3). Der Merker wird bei **jeder** Tagesprüfung gesetzt, auch wenn es nichts zu zeigen gab; so verrät er nicht, ob es eine Frist gibt. |
| Wie viele? | **Ein** Hinweis mit der dringendsten Frist: abgelaufen vor heute vor morgen vor später, bei gleichem Tag „Fest“ vor „Gerechnet“. Dazu „und {n} weitere“ als Link zur Liste. |
| Aussehen | Wie der vorhandene Hinweis `.hb-start`: unter der Begrüßung, vor den Kacheln. Bald: `--warn-bg` / `--warn` mit Wort „Frist“. Abgelaufen: `--bad-bg` / `--bad` mit Wort „Abgelaufen“. Farbe ist nie die einzige Information. Eine Zeile Text, darunter klein der Vorgangsname (nur bei mehr als einem Vorgang), drei Knöpfe als `btn ghost klein`. Kein Dialog, nichts Modales, kein `role="alert"`, sondern `role="status"`. |
| Knopf „Erledigt“ | Markiert die Frist als erledigt (`erledigt: heute`). Der Hinweis verschwindet. Meldung „Als erledigt markiert · Rückgängig“ (10 s). Die Frist erscheint nie wieder im Hinweis. In der Liste steht sie zugeklappt unter „Erledigt (n)“ und verschwindet dort nach 30 Tagen. |
| Knopf „Später erinnern“ | Kurze Fristen: **morgen** wieder. Folgeantrag: **in 7 Tagen**, aber spätestens 7 Tage vor dem Ende. Am Tag des Fristendes und danach: morgen. Meldung „Die App erinnert dich am {datum} wieder.“ |
| Knopf „Ansehen“ | Öffnet „Mein Ordner“ → Fristen. Gehört die Frist zu einem anderen Vorgang, wird dieser vorher geöffnet (`vgOeffnen`). |
| Frist in einem anderen Vorgang | `tresor.set` schreibt nur in den **geöffneten** Vorgang (`src/vorgaenge.js`, `api.set` → `wertSetzen(aktiv)`). Für eine Frist aus einem anderen Vorgang zeigt der Hinweis deshalb nur „Ansehen“ (öffnet den Vorgang); „Erledigt“ und „Später erinnern“ gibt es dann in der Liste. So ist keine neue Schreib-Schnittstelle im Tresor nötig. |
| Schließen ohne Knopf | Es gibt kein ×. Wer nichts tippt, sieht den Hinweis am nächsten Tag wieder (Tagesregel). |
| Mit PIN | Erst nach dem Entsperren (die Daten sind verschlüsselt). Der Hinweis kommt nie auf den Sperrbildschirm. |
| Ausschalten | Schalter `fri.set.label` in „Einstellungen → Sicherheit und Daten“, Standard **An**. Aus: kein Hinweis, die Karte in „Mein Ordner“ bleibt. |
| Mehrere Vorgänge | Der Hinweis prüft **alle** Vorgänge (siehe `Vorgaenge`-Erweiterung `ueberall`), nennt aber nur Titel, Datum und den Namen des Vorgangs. |

**Folgeantrag aus dem Haushaltsplan.** Heute zeigt `Haushalt.startHinweis()` (`src/haushalt.js` Z. 506) einen eigenen Startseiten-Hinweis `#hbStart` ab 42/60 Tagen vor Ende. Er kommt bei jedem Öffnen, nicht nur einmal am Tag. Künftig soll es **nur einen** Hinweis geben: Fristen übernimmt den Folgeantrag. `startHinweis()` zeichnet nichts mehr und ruft stattdessen `ctx.fristenNeu()`. Die Erinnerung bleibt in den Hinweisen des Haushaltsplans (`hinweise()`) stehen. Der Test `test/test-haushalt-dom.js` Z. 97–98 wird angepasst und prüft dann `#friStart` statt `#hbStart`.

---

## 6. Bauplan

### 6.1 Neue Datei `src/fristen.js` (Modul `Fristen` für die App)

`erweiterungen/fristen.js` heißt schon `Fristen` und ist im Build enthalten (`scripts/build.js` Z. 98). Das neue App-Modul soll deshalb **`FristListe`** heißen und die Rechenfunktionen von `Fristen` wiederverwenden (`einMonat`, `werktag`, `feiertage`, `plusTage`). Fehlt `Fristen` (Web ohne Prüfpaket), gibt es eine Kopie der 30 Zeilen als Rückfall oder die Rechenfunktionen ziehen nach `src/fmt.js`. Empfehlung: **Rechenkern nach `src/fristen.js` verschieben**; `erweiterungen/fristen.js` nutzt ihn dann. Das ist nur sinnvoll, wenn das Prüfpaket im Build immer mitkommt; sonst die Kopie behalten (offene Frage 4).

Reine Funktionen (ohne DOM, in Node testbar), Daten immer `'JJJJ-MM-TT'`:

| Funktion | Zweck |
|---|---|
| `bekanntgabe({ datum, zugang })` | **Nur für Bescheide (`wid`):** `zugang` (Zustellung oder persönlich) sonst `datum + 4`. Wort: `gerechnet`; ohne `datum`, nur mit Erhalt: `ungefaehr` mit `bekannt = erhalten` |
| `zugangEinfach({ datum, erhalten })` | Für `mit`/`anh` mit Wochen- oder Tagesfrist (kein Verwaltungsakt, keine 4-Tage-Regel): `erhalten` → Wort `gerechnet`; sonst `datum + 1` → Wort `ungefaehr` |
| `endeMonat(bekannt, n)` | n Monate nach § 64 Abs. 2 SGG / § 188 Abs. 2, 3 BGB, dann `werktag` |
| `endeWochen(bekannt, n)` | n×7 Tage, dann `werktag` |
| `endeTage(bekannt, n)` | n Tage, dann `werktag` |
| `ausBrief(text, art, heute)` | wertet `BriefLesen.frist(text)` / `BriefLesen.andere(text)` und `BriefLesen.lies(text).datum` aus: Datum im Brief → `{bis, wort:'fest'}`; „zwei Wochen“, „ein Monat“, „14 Tagen“ → Rechnung ab `zugangEinfach` (bei `wid` ab `bekanntgabe`). **Die Funktion rechnet nur und speichert nichts**; gespeichert wird erst beim Tipp auf „Frist merken“; Mahnbescheid/Vollstreckungsbescheid → `art:'mb'|'vb'`, Datum der Zustellung erfragen (`wort:'offen'`, bis eingetragen) |
| `widerspruch(datum, zugang, erhalten)` | für die Bescheid-Checks (`pf/bs/ga/wg/kz-datum`) |
| `folgeantrag(l, ende)` | `{art:'wb', leistung:l, ende, faellig: ende − VORLAUF_TAGE[l], bis: ende}` |
| `faellig(e)` | Tag, an dem der Hinweis beginnt: `wb` → `faellig`, sonst `bis − 7` |
| `zeigen(liste, heute)` | Auswahl für den Start-Hinweis nach Abschnitt 5 (sortiert, gefiltert) |
| `schluessel(e)` | Dublettenschutz: `art|stelle|bis` bzw. bei `wb` `wb-<l>-<ende>` (gleich wie die Hinweis-ID im Haushaltsplan) |
| `normiere(json)` | Laden mit Prüfung: unbekannte Felder weg, Datum per Regex, Titel ≤ 60 Zeichen ohne Steuerzeichen, höchstens 50 Einträge, erledigte nach 30 Tagen weg |

Oberfläche (wie `Haushalt` und `Ausziehen`): `FristListe.speicherOrt({laden, schreiben})`, `FristListe.init(ctx)` mit `ctx = { t, datum, zeige, oeffneVorgang, alle(), haushaltBewilligt(), hinweisErlaubt() }`, `FristListe.merken(eintrag)` (gibt `'neu'|'da'` zurück), `FristListe.stand()` (für die Karte: nächste offene Frist), `FristListe.render(box)` (Liste), `FristListe.startHinweis()`, `FristListe.neuLaden()`.

### 6.2 Datenmodell `lotse.fristliste` (JSON-Text im Vorgang)

```json
{ "v": 1, "e": [
  { "id": "a1b2c3", "art": "wid", "stelle": "jc", "titel": "",
    "bis": "2026-12-14", "wort": "gerechnet",
    "basis": { "datum": "2026-11-10", "zugang": null, "erhalten": null, "frist": "1M" },
    "quelle": "brief", "erledigt": null, "spaeter": null, "neu": 1795171073000 }
] }
```

- `art`: `wid|mit|anh|zahl|mb|vb|termin|wb|eigen`
- `wort`: `fest|gerechnet|ungefaehr|offen`
- `basis.frist`: `1M|2W|14T|…` (für „So wurde gerechnet“)
- `quelle`: `brief|bescheid|hand|haushalt`
- `titel`: nur bei `eigen` frei (≤ 60 Zeichen), sonst leer. Der freie Titel und der Vorgangsname werden **nur mit `textContent`** in die Seite gesetzt, nie mit `innerHTML` (wie `zeile()` in `ordnerRender`). `art`, `stelle`, `wort`, `quelle` werden beim Laden gegen feste Listen geprüft, weil daraus i18n-Schlüssel gebildet werden; der Text kommt aus `fri.art.*`. Es wird **keine Briefzeile** gespeichert: weniger sensible Daten, keine fremde Sprache in der Liste.
- **Folgeantrag nicht doppelt speichern:** `wb`-Einträge werden beim Anzeigen aus `lotse.haushalt` → `bewilligt` abgeleitet. In `lotse.fristliste` steht nur der Zustand: `{ "wb": { "wb-sgb2-2027-03-31": { "erledigt": "…", "spaeter": "…" } } }`.

### 6.3 Änderungen an vorhandenen Dateien

| Datei | Stelle | Änderung |
|---|---|---|
| `src/vorgaenge.js` | Z. 7 `DATEN` | `'lotse.fristliste'` anhängen. Damit wird der Schlüssel mit PIN verschlüsselt, kopiert und gelöscht. |
| `src/vorgaenge.js` | `tresor` → `api` | Neu `ueberall(k)`: `bereit ? c.liste.map(v => ({ id, name, wert: v.daten && v.daten[k] }))` (für den geöffneten Vorgang `wert(k)`). Nötig für den Start-Hinweis über alle Vorgänge. Ohne PIN stehen die Daten der anderen Vorgänge in `meta.klar` (Z. 87–90), also auch dort vorhanden. |
| `src/app.js` | Z. 2118 `STORE_SCHLUESSEL` | `'lotse.fristTag'` und `'lotse.fristHinweis'` ergänzen. `'lotse.fristen'` bleibt. `lotse.fristliste` gehört **nicht** hierher: Der Schlüssel steht in `Vorgaenge.DATEN` und wird über den Tresor gelöscht (vor dem Bau prüfen, dass „Alle Angaben löschen“ `tresor.allesLoeschen()` ruft). |
| `src/app.js` | neu, nach Z. 3399 (bei `Ausziehen.init`) | `FristListe.speicherOrt` über `Store` mit `lotse.fristliste`. `FristListe.init({...})`: `hinweisErlaubt` liest `lotse.fristHinweis`; `alle` = `tresor.ueberall('lotse.fristliste')` plus `ueberall('lotse.haushalt')`; `oeffneVorgang` = `vgOeffnen`. |
| `src/app.js` | Z. 3401 | `Store.remove('lotse.fristen')` **unverändert lassen**. |
| `src/app.js` | `textLesen` Z. 3286–3300 | Bei `anh`/`mit`: `FristListe.ausBrief(text, r.art)` rechnet nur. Unter der Zeile `el.frist` erscheint der Knopf `fri.merken` („Frist merken“, `btn ghost klein`) und, wenn der Tag des Erhalts fehlt, ein Datumsfeld „Brief bekommen am“. **Erst der Tipp auf den Knopf** ruft `merken`; dann Meldung `fri.gemerkt` / `fri.schonDa` mit Rückgängig. Nichts wird automatisch gespeichert (Entscheidung des Nutzers). `el.frist` bleibt. |
| `src/app.js` | `vgNeuLaden` Z. 2611 | `if (window.FristListe) FristListe.neuLaden();` |
| `src/app.js` | `ordnerRender` Z. 2844 | Neue `zeile('fristen', t('fri.karte'), stand, sym, () => usZeigen('ordner','fristen',true))` **als erste Zeile**, nur wenn es mindestens einen offenen Eintrag gibt. Symbol: Uhr `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`. Steht eine Frist in 0–7 Tagen an oder ist sie abgelaufen, hängt an den Status das Wort aus `fri.rest.*`. |
| `src/app.js` | `vgBereit` / nach `stateLaden` | `FristListe.startHinweis()` nach dem Entsperren bzw. wenn der Tresor bereit ist. Zuerst `StoreRoh.get('lotse.fristTag')`: gleich heute → nichts tun. Sonst prüfen und **in jedem Fall** `StoreRoh.set('lotse.fristTag', heute)` schreiben (auch wenn kein Hinweis gezeigt wurde und auch wenn der Schalter aus ist). Wert ausschließlich `JJJJ-MM-TT`: keine Vorgangs-ID, kein Titel, keine Anzahl, keine Frist. Beim Lesen per Regex prüfen, sonst wie „leer“ behandeln. |
| `src/app.js` | `vgRender` → Sicherheit und Daten | Schalter `fri.set.label` (Klasse `.schalter`, wie die vorhandenen). |
| `src/template.html` | `#v-ordner` Z. 1423 | Neue Unterseite `<div id="ordnerFristen" class="unterseite" data-seite="fristen" hidden><button class="us-zurueck">…</button><h2 data-t="fri.h"></h2><p class="small muted" data-t="fri.lead"></p><div id="friListe"></div></div>`. **Nicht** `v-fristen` oder `startFristen` nennen. |
| `src/template.html` | CSS „Gruppenfarben“ Z. 850 ff. | Gruppe `ordner` (siehe 6.5) und `.fri-start` (wie `.hb-start`, `--warn-bg` bzw. `--bad-bg`). |
| `src/template.html` | Skript-Einbindung | `src/fristen.js` wie `haushalt.js` / `ausziehen.js` einbinden (`scripts/build.js`). |
| `erweiterungen/vorschau.js` | `fristText` Z. 287 und die Stellen Z. 282, 392, 421, 460, 503 | Unter dem gesetzten `*-frist` einen Knopf `fri.merken` zeigen (nicht beim Beispiel, Knopf `*-beispiel`). **Erst der Tipp** ruft `window.FristListe && FristListe.merken({art:'wid', stelle, basis:{datum}, quelle:'bescheid'})`. Bei der Pflege-Höherstufung (`hoch`) keine Frist. |
| `erweiterungen/vorschau.js` | `zeigeAndere` Z. 782–785 | Bei `r.mahnbescheid` / `r.vollstreckungsbescheid`: Feld „Zugestellt am (gelber Umschlag)“ und Knopf `fri.merken`; erst der Tipp ruft `merken({art:'mb'|'vb', basis:{zugang}})`. Bei einer festen Datums-Frist mit „Widerspruch/Einspruch/Klage“ in der Zeile: `art:'wid'`, sonst `zahl`, wenn „zahlen/überweisen/Betrag“ in der Zeile steht. In allen Fällen nur anzeigen und mit dem Knopf `fri.merken` anbieten. Der Text des Briefs wird nie gespeichert. |
| `src/haushalt.js` | `startHinweis` Z. 506 | Keinen eigenen `#hbStart` mehr zeichnen, sondern `if (ctx.fristenNeu) ctx.fristenNeu()`. Beim Ändern von `bewilligt` (Z. 526) ebenso. **Konflikt mit b-energie** (gleiche Datei). |
| `scripts/build.js` | Z. 36–38 | `src/lang/fristen/<Sprache>.json` wie `haushalt` und `ausziehen` zusammenführen. |
| `tools/kontrast-pruefen.js` | `erwartet` Z. 84 | `ordner: (app.match(/zeile\('[a-z]+'/g) \|\| []).length` (heute 6 + fristen = 7). |
| `docs/FARBEN.md` | Gruppenfarben | Zeile „Mein Ordner“ ergänzen. |
| `docs/AENDERUNGEN.md`, Store-Texte | – | Erwähnen: „Fristen in Mein Ordner (nur auf dem Gerät, keine Mitteilungen)“. `APPLE-REVIEW-ANTWORT.md` „ohne Kalender/Fristen“ bleibt sinngemäß wahr: kein Kalender. |

**Warum `lotse.fristTag` nicht im Vorgang liegt:** Jeder Schreibvorgang im Tresor setzt `geaendert` (`wertSetzen`, Z. 25–30). Ein täglicher Merker würde „Automatisch löschen“ (30/90 Tage ab letzter Änderung) aushebeln. `lotse.fristTag` enthält nur ein Datum, keinen Inhalt. Er liegt deshalb im normalen Speicher (`StoreRoh`) und wird bei „Alle Angaben löschen“ mitgelöscht. **Damit der Merker auch mit PIN nichts verrät**, wird er bei jeder Tagesprüfung gesetzt, nicht nur, wenn ein Hinweis erschien. Er sagt dann nur „an diesem Tag wurde die App geöffnet“. Das steht ohnehin unverschlüsselt in `lotse.vorgaenge` (`meta.zuletzt`, `src/vorgaenge.js` `abgelaufenePruefen`). Ob es Fristen gibt, wie viele, in welchem Vorgang und wann sie enden, ist daraus nicht ablesbar. Gleiches gilt für `lotse.fristHinweis` (nur `0`/`1`). „Erledigt“ und „Später“ sind echte Nutzeraktionen und dürfen `geaendert` setzen.

**Automatisch löschen vs. Frist:** Ist „Automatisch löschen“ an und liegt `ablauf` des Vorgangs vor einer gespeicherten Frist, steht in der Liste über dieser Frist `fri.vorgangWeg`. Die Lösch-Logik selbst bleibt unverändert.

### 6.4 i18n

- Neu: `src/lang/fristen/{de,en,ar,fa,fa-AF,fr,pl,ps,ro,ru,so,tr,uk}.json` mit allen `fri.*` aus Abschnitt 3 (de vollständig oben; die 12 Übersetzungen per KI wie bisher, Paragrafen und Platzhalter unverändert, geprüft durch `test-sprachen-zahlen.js`).
- Neu: `src/lang/einfach/fristen.json` (Texte der Spalte „Einfache Sprache“).
- Datum über `Fmt.datum(d, lang)` (fa/fa-AF/ps als TT.MM.JJJJ, siehe VERLAUF), Wochentag nur in `de` (`Mo., 14.12.2026`), sonst nur das Datum.
- Paragrafen in Klammern verschwinden ohne Beratungsmodus wie überall (`tL` → `Fmt.ohnePara`). Die Fußnotenziffern oben sind nur Entwurfsbelege und kommen nicht in die Texte.

### 6.5 Farbzuordnung: Gruppe `ordner` (keine Farbe doppelt)

Heute haben alle Zeilen in „Mein Ordner“ dasselbe Petrol (`.zeile-sym` mit `--accent-soft`). FARBEN.md kündigt die Gruppenregel „künftig die Mein-Ordner-Karten“ an. Vorschlag nach „dieselbe Sache, dieselbe Farbe“:

| Zeile (`#or-…`) | Farbe | Variable | Begründung |
|---|---|---|---|
| fristen | Ziegel | `--c-briefe` | Fristen kommen aus Briefen |
| ergebnis | Petrol | `--c-leistungen` | Leistungen |
| mappe | Schiefer | `--c-formular` | Formulare/Antrag |
| haushalt | Beere | `--c-familienkasse` | wie Kachel Haushaltsplan in „Geld sparen“ |
| ausziehen | Violett | `--c-ausziehen` | Bereich |
| pflege | Blau | `--c-pflege` | Bereich |
| pfaendung | Pflaume | `--c-pfaendung` | Bereich |

CSS (Form muss zur Prüf-Regex in `kontrast-pruefen.js` Z. 83 passen: `{ background: var(--x); } /* gruppe ordner */`):

```css
.app[data-ansicht="ordner"] #or-fristen .zeile-sym { background: var(--c-briefe); } /* gruppe ordner */
.app[data-ansicht="ordner"] #or-ergebnis .zeile-sym { background: var(--c-leistungen); } /* gruppe ordner */
.app[data-ansicht="ordner"] #or-mappe .zeile-sym { background: var(--c-formular); } /* gruppe ordner */
.app[data-ansicht="ordner"] #or-haushalt .zeile-sym { background: var(--c-familienkasse); } /* gruppe ordner */
.app[data-ansicht="ordner"] #or-ausziehen .zeile-sym { background: var(--c-ausziehen); } /* gruppe ordner */
.app[data-ansicht="ordner"] #or-pflege .zeile-sym { background: var(--c-pflege); } /* gruppe ordner */
.app[data-ansicht="ordner"] #or-pfaendung .zeile-sym { background: var(--c-pfaendung); } /* gruppe ordner */
.app[data-ansicht="ordner"] #ordnerKarten .zeile-sym { color: var(--on-c); }
```

Es werden ID-Selektoren statt `nth-child` verwendet, weil Zeilen nur erscheinen, wenn es Inhalt gibt. Der Start-Hinweis nutzt **keine** Bereichsfarbe, sondern den Zustand: Bernstein (`--warn`) für „bald“, `--bad` für „abgelaufen“ (FARBEN.md: Bernstein nur für Warnungen).
Freie Farben, falls b-schuldenliste eine Zeile „Schulden“ ergänzt: Indigo `--c-sozialamt`, Meerblau `--c-wohngeld`, Grün `--c-sparen`. Pflaume wäre doppelt.

### 6.6 Neue Tests

| Datei | Testfälle |
|---|---|
| `test/test-fristen.js` (neu, in `npm test`) | Alle 8 Prüffälle aus Abschnitt 4. `einMonat` 31.01.→28.02. und im Schaltjahr 2028 →29.02. `ausBrief`: „bis zum 15.12.2026“ → fest; „innerhalb von zwei Wochen“ mit Tag des Erhalts → gerechnet; nur mit Briefdatum → ungefähr (Briefdatum + 1, **nicht** + 4); ohne beides → offen; `ausBrief` allein speichert nichts; Mahnbescheid → `mb`, offen bis zur Eingabe der Zustellung. Dubletten: zweimal derselbe Bescheid → `'da'`. `zeigen()`: 8 Tage vorher → nichts; 7 Tage → ja; erledigt → nie; `spaeter` = morgen → heute nichts; abgelaufen vor 15 Tagen → nicht im Hinweis, aber in der Liste; `wb` Wohngeld ab −60 Tagen; Sortierung (abgelaufen vor heute vor morgen). `normiere`: Müll, zu lange Titel, über 50 Einträge, erledigt vor über 30 Tagen weg. |
| `test/test-vorgaenge.js` | `DATEN` enthält `lotse.fristliste`; mit PIN verschlüsselt (Klartext nicht im Speicher); `kopie` kopiert, `loeschen` löscht; `ueberall()` liefert alle Vorgänge, ohne PIN auch die nicht geöffneten. |
| `test/test-fristen-dom.js` (neu, wie `test-haushalt-dom.js`) | Karte `#or-fristen` erscheint als erste Zeile nur mit Einträgen; Unterseite `data-seite="fristen"`, „← Zurück“; Worte „Fest/Gerechnet/Ungefähr“ sichtbar; `<details>` „So wurde gerechnet“; Start-Hinweis `#friStart` unter der Begrüßung; **zweites Öffnen am selben Tag → kein Hinweis**; nächster Tag (Uhr gestellt) → Hinweis; „Erledigt“ → weg und am nächsten Tag nicht wieder; „Später erinnern“ → morgen; Schalter aus → nie; mit PIN gesperrt → kein Hinweis vor dem Entsperren. **Merker:** `lotse.fristTag` passt nach jedem Öffnen auf `/^\d{4}-\d\d-\d\d$/` und wird auch **ohne** jede Frist gesetzt; mit PIN steht außer diesem Datum und `lotse.fristHinweis` nichts von den Fristen im Klartext-Speicher (Titel, Datum der Frist, Vorgangsname nicht auffindbar). XSS: eigener Titel `<img src=x onerror=…>` erscheint als Text. Frist in einem anderen Vorgang → nur „Ansehen“. |
| `test/test-haushalt-dom.js` Z. 97–98 | auf `#friStart` umstellen; prüfen, dass `#hbStart` nicht mehr entsteht (nur ein Hinweis). |
| `test/e2e-briefe.js` | bleibt; neu: Pflegekasse-Widerspruch mit Datum 10.11.2026 → ohne Tipp auf „Frist merken“ steht **nichts** in „Mein Ordner“; nach dem Tipp steht dort „bis 14.12.2026“; `localStorage['lotse.fristen']` weiter `null`; `#v-fristen`, `[data-ansicht=fristen]`, `#startFristen` weiter 0; Beispiel laden → **nichts** gemerkt. |
| `test/app-test.js` | bleibt; neu: kein `Preferences.set` mit Schlüssel `lotse.fristen`; kein Aufruf von `LocalNotifications`; mit PIN kein Klartext von `lotse.fristliste` in `Preferences.set`. |
| `tools/kontrast-pruefen.js` | Gruppe `ordner` mit 7 Farben, keine doppelt (läuft in `npm test`). |
| `test/test-sprachen-zahlen.js`, `test-einfach-gleich.js` | erfassen die neuen Dateien automatisch (prüfen, ob die Sprachdateien eingelesen werden). |

### 6.7 Konfliktrisiko mit anderen Aufgaben

| Aufgabe | Überschneidung | Risiko |
|---|---|---|
| b-energie (Haushaltsplan) | `src/haushalt.js` (`startHinweis`, `bewilligtBox`), `src/lang/haushalt/*` | **hoch**: Absprache, wer `startHinweis` ändert |
| b-schuldenliste | neue Zeile in `ordnerRender`, Farbe in Gruppe `ordner`, ggf. Mahnbescheid/Inkasso-Fristen | **hoch**: Farbe (nicht Pflaume doppelt), Reihenfolge der Zeilen, `erwartet.ordner` |
| b-kostensenkung (Brief prüfen) | `textLesen`, `erweiterungen/vorschau.js`, ggf. Frist der Kostensenkungsaufforderung (6 Monate, § 22 Abs. 1 SGB II) als neue Fristart | mittel |
| b-mietgrenze (Wohngeld) | kaum (WoGG-Reform 2027, Bewilligungszeitraum) | gering |
| b-paar-einkommen | keine | gering |
| alle | `src/app.js`, `src/template.html` (Gruppenfarben-Block), `src/vorgaenge.js` `DATEN`, `scripts/build.js`, `STORE_SCHLUESSEL` | mittel: kleine, getrennte Einfügungen |

---

## 7. Offene Fragen und Unsicherheiten

1. **Grund der Löschung 2026 (1.3.1):** Er ist nicht ausdrücklich dokumentiert, Abschnitt 2 ist abgeleitet. Der Nutzer bestätigt, dass das Löschen richtig war. Soll der Grund in `docs/VERLAUF.md` nachgetragen werden?
2. **Bekanntgabe an Wochenende/Feiertag:** Für das Sozialrecht vom BSG entschieden (6.5.2010, B 14 AS 12/09 R, zur alten 3-Tage-Regel): keine Verschiebung. SoLo verschiebt nicht. Offen ist nur, ob ein Gericht das für die 4-Tage-Regel seit 2025 anders sieht; SoLo wäre auch dann auf der sicheren (früheren) Seite.
3. **Landesfeiertage:** **Entschieden (Nutzer, 20.11.2026):** nicht mitzählen, nur der Hinweis `fri.rechnung.feiertag`.
4. **Rechenkern doppelt:** `erweiterungen/fristen.js` gegenüber dem neuen `src/fristen.js`. Ist das Prüfpaket im App-Build immer dabei? Davon hängt ab, ob verschoben oder kopiert wird.
5. **Übernehmen aus „Brief prüfen“:** **Entschieden (Nutzer, 20.11.2026):** nur auf Knopfdruck („Frist merken“), nie automatisch. Abschnitte 1, 3.2, 6.1, 6.3 und 6.6 sind angepasst.
6. **Wohngeld-Reform 2027** (BT-Drucksache 21/8284 vom 30.9.2026, am 20.11.2026 noch im Ausschuss): Der Entwurf ändert § 25 und § 22 Abs. 4 WoGG nicht; laufende Bewilligungen bleiben (§ 42e WoGG-Entwurf). Vor dem Einbau die verkündete Fassung im BGBl. prüfen.
7. **Neue Grundsicherung:** Erledigt. Die Kürzung bei Meldeversäumnissen ist jetzt mit dem Gesetzestext belegt (§ 32, § 31a Abs. 3 und 4, § 7b Abs. 4 SGB II, BGBl. 2026 I Nr. 107), Text `fri.art.termin.t` entsprechend berichtigt (30 % vom Regelbedarf, nicht von der ganzen Leistung). Die Fristart `termin` bleibt optional.
8. **Folgeantrag, „letzter Tag ohne Geldverlust“:** Nach § 37 Abs. 2 SGB II, § 44 Abs. 2 SGB XII, § 25 Abs. 2 WoGG und § 6a Abs. 7 BKGG wirkt ein Antrag ab dem Ersten des Antragsmonats. Ein Antrag im Monat nach dem Ende kostet also meist kein Geld, nur eine Zahlungslücke. Bewusst wird das nur als Trost-Text (`fri.art.wb.spaet`) gezeigt, nicht als Frist, weil Bewilligungszeiträume nicht immer am Monatsende enden. Bitte bestätigen.
9. **Schwelle „7 Tage“ und „14 Tage abgelaufen“:** Das sind Vorschläge des Nutzers bzw. von mir, keine Rechtsregeln. Beim Folgeantrag bleibt der bisherige Vorlauf von 42/60 Tagen (ohne Gesetzesgrundlage, App-Regel).
10. **Schalter „Erinnerung beim Öffnen“:** Ist er nötig, oder reicht die Tagesregel? Er macht eine Einstellung mehr.

## Entscheidungen des Nutzers (20.11.2026)
- Frist aus „Brief prüfen“ wird **nur auf Knopfdruck** übernommen (Knopf „Frist merken“ unter der erkannten Frist), nicht automatisch.
- **Keine Landesfeiertage** über die PLZ: nur bundesweite Feiertage zählen, dazu der Hinweis „Bei einem Feiertag in deinem Bundesland kann es einen Tag später sein“. Die App nennt nie einen zu späten Tag.
- Fristen nur in der App (Gerät, je Vorgang, PIN-verschlüsselt); kein Kalender, keine Cloud, keine Push-Mitteilungen; Hinweis beim Öffnen höchstens einmal am Tag mit „Erledigt“ / „Später erinnern“.

## Prüfvermerk Fable (20.11.2026)

Unabhängige Prüfung. Alle Paragrafen wurden am 20.11.2026 direkt auf gesetze-im-internet.de abgerufen (SGB X §§ 24, 26, 37; SGG §§ 64, 66, 84; SGB I § 66; SGB II §§ 7b, 31a, 31b, 32, 37, 41; SGB XII § 44; WoGG §§ 22, 25; BKGG §§ 6a, 9; ZPO §§ 180, 182, 222, 339, 692, 694, 699, 700; BGB §§ 187, 188, 193; VwGO §§ 57, 58, 70; AO §§ 108, 122). Die Prüffälle wurden mit `erweiterungen/fristen.js` nachgerechnet. Korrekturen stehen direkt im Text oben.

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Entwurf übernahm Fristen aus „Brief prüfen“ **automatisch** (Abschnitte 1, 6.3, 6.6, Frage 5). Widerspricht der verbindlichen Entscheidung des Nutzers | Fehler | Überall auf Knopf „Frist merken“ umgestellt; neue Schlüssel `fri.merken`, `fri.merken.t`; `ausBrief` rechnet nur; Test „ohne Tipp nichts gespeichert“ | Abschnitt „Entscheidungen des Nutzers“ |
| 4-Tage-Fiktion wurde auch auf Anhörung und Mitwirkung angewandt (`fri.rechnung.woche`, Prüffall 18.12.2026 → 05.01.2027). Diese Schreiben sind keine Verwaltungsakte; es zählt der echte Zugang, der früher sein kann. Die App hätte einen **zu späten** Tag nennen können | Fehler | Rechnung ab Tag des Erhalts, sonst Briefdatum + 1 mit Wort „Ungefähr“; neue Funktion `zugangEinfach`, neuer Text `fri.rechnung.woche.ohne`, Prüffall geteilt (05.01.2027 mit Erhalt, 04.01.2027 ohne) | § 37 Abs. 2 SGB X (nur „Verwaltungsakt“), § 26 Abs. 2 SGB X |
| Meldeversäumnis: „Leistung um 30 %“ und nur Regierungsseite als Quelle | Fehler | Gesetzestext eingesetzt: 30 % **des Regelbedarfs**, 1 Monat, bei „wiederholtem“ Versäumnis; wichtiger Grund muss nachgewiesen werden; Unterkunft/Heizung nicht gemindert; drei Meldeaufforderungen in Folge → Anspruch entfällt. Texte de + Einfache Sprache berichtigt | § 32 Abs. 1, 2, § 31a Abs. 3, 4, § 7b Abs. 4 SGB II; BGBl. 2026 I Nr. 107 (recht.bund.de, Titel geprüft) |
| Verschiebung des 4. Tages am Wochenende als „umstritten“ bezeichnet | Fehler (Begründung; Rechenregel war richtig) | BSG hat für das SGB X entschieden: keine Verschiebung (zur 3-Tage-Regel). Text und Frage 2 berichtigt; Hinweis auf abweichende AO | BSG 6.5.2010, B 14 AS 12/09 R, Leitsatz (rechtsprechung-im-internet.de); § 108 Abs. 3 AO |
| `lotse.fristTag` wurde nur gesetzt, **wenn ein Hinweis gezeigt wurde**. Mit PIN hätte der Klartext-Merker verraten, dass es eine nahe oder abgelaufene Frist gibt | Risiko | Merker wird bei jeder Tagesprüfung gesetzt (auch ohne Frist, auch bei Schalter aus), Format nur `JJJJ-MM-TT`, Regex beim Lesen; Test ergänzt. Er sagt dann nicht mehr als `meta.zuletzt`, das schon heute unverschlüsselt gespeichert ist | `src/vorgaenge.js` (`klarMeta`, `speichernJetzt`: `zuletzt` im Klartext) |
| „Erledigt“/„Später“ im Start-Hinweis für Fristen aus einem **anderen** Vorgang nicht baubar: `tresor.set` schreibt nur in den geöffneten Vorgang | Risiko (Bauplan) | Für fremde Vorgänge nur „Ansehen“; keine neue Schreib-Schnittstelle im Tresor | `src/vorgaenge.js` `api.set`, `wertSetzen` |
| `fri.eingang` enthielt `**fett**`; die Sprachdateien kennen weder Markdown noch HTML, Texte werden als Text gesetzt | Fehler (klein) | Sternchen entfernt, Satz umgestellt | `src/lang/de.json` (kein `**`, kein `<b>`) |
| XSS: freier Titel (`eigen`) und Vorgangsname im Hinweis; Bauplan nannte die Ausgabeart nicht | Risiko | Vorgabe „nur `textContent`“, Enum-Prüfung für `art/stelle/wort/quelle`, XSS-Testfall ergänzt | `ordnerRender` `zeile()` als Muster |
| Wohngeld-Reform als „Kabinettsentwurf, zum Bewilligungszeitraum nichts bekannt“ | Hinweis | Aktualisiert: BT-Drs. 21/8284, noch nicht beschlossen; § 25 und § 22 Abs. 4 WoGG im Entwurf unverändert; laufende Bewilligungen bleiben (§ 42e-Entwurf) | dserver.bundestag.de/btd/21/082/2108284.pdf (erste 100.000 Zeichen gelesen); bundestag.de Textarchiv KW 45/2026 |
| § 37 SGB X: Fundstelle der Änderung nur über buzer.de, Artikelnummer ungeprüft | Hinweis | Amtliche Fundstelle BGBl. 2024 I Nr. 236 (recht.bund.de) eingesetzt, Artikelnummer gestrichen | recht.bund.de/bgbl/1/2024/236/VO.html |
| Bewilligungszeitraum SGB II nach der Reform nur „laut Bundesregierung“ | Hinweis | Im geltenden Gesetzestext bestätigt (12 Monate Regel, 6 Monate Soll-Fälle), Quelle ersetzt | § 41 Abs. 3 SGB II |
| Widerspruch Wohngeld läuft nicht über das SGG | Hinweis | § 70 VwGO ergänzt (gleiche Monatsfrist, gleiche Berechnung); in manchen Ländern gleich Klage: Belehrung im Bescheid gilt | § 70, § 57 Abs. 2, § 58 Abs. 2 VwGO |
| Feiertags-Hinweis wich im Wortlaut von der Entscheidung ab | Hinweis | Text an die Entscheidung angeglichen („kann es einen Tag später sein“, „nie einen zu späten Tag“) | Entscheidungen des Nutzers |
| Ohne PIN liegt `lotse.fristliste` des geöffneten Vorgangs im Klartext (wie alle Angaben) | Hinweis | In der Kurzfassung klargestellt; kein neues Risiko gegenüber dem Bestand | `src/vorgaenge.js` Kopfkommentar |
| Geprüft und richtig: Monatsfrist § 84 SGG, Fristende § 64 SGG, § 26 Abs. 3, 5, 7 SGB X, § 66 SGG (1 Jahr), Mahnbescheid 2 Wochen (§ 692), Einspruch 2 Wochen Notfrist (§§ 700, 339), § 694 ZPO, § 222 ZPO, § 44 Abs. 3 SGB XII, § 25 und § 22 Abs. 4 WoGG, § 6a Abs. 7 BKGG, Rückwirkung § 37 Abs. 2 SGB II; alle übrigen Prüffälle (14.12.2026, 02.03.2026, 28.04.2027, 28.12.2026, 16.12.2026, 30.01.2027); Farben der Gruppe `ordner` (7 verschiedene Palettenfarben, Regex-Form passt); keine neue Startkachel; Zeilennummern in `app.js`, `haushalt.js`, `vorgaenge.js`, `template.html`, Tests | – | keine | Quellen wie in Abschnitt 4 |
| Nicht einschlägig: CSV-Export und Druckblatt (der Entwurf hat beides nicht) | – | keine | – |

**Offen:** (1) Keine höchstrichterliche Entscheidung zur Wochenend-Frage bei der 4-Tage-Regel gefunden (SoLo liegt auf der sicheren Seite). (2) Wohngeld-Gesetz 2027 ist noch nicht verkündet; die BT-Drucksache wurde nur zur Hälfte gelesen. (3) Die Einfache-Sprache-Texte zu `fri.rechnung.woche`/`.zustellung` lassen die Wochenend-Regel weg; das angezeigte Datum ist trotzdem richtig. (4) Ob „Alle Angaben löschen“ den Tresor vollständig leert, vor dem Bau im Code bestätigen. (5) Konflikt mit b-energie an `Haushalt.startHinweis` bleibt abzustimmen.
