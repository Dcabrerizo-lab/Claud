# Entwurf: Fristen in „Mein Ordner“

Stand 20.11.2026. Code gelesen auf dem Stand von PR #42 (`/home/claude/s1`). Alle Quellen abgerufen am 20.11.2026.
Verbindliche Ergänzung des Nutzers (20.11.2026) ist eingearbeitet: Die Fristen aus 1.3.0 bleiben gelöscht. Neue Fristen werden **nur in der App** gespeichert (auf dem Gerät, je Vorgang, mit PIN verschlüsselt). Keine Übergabe an einen Kalender, keine Cloud, keine Push-Mitteilungen des Systems. Erinnerung nur als ruhiger Hinweis beim Öffnen.

---

## 1. Kurzfassung (was der Nutzer sieht)

1. In „Mein Ordner“ steht oben die Karte **„Fristen“** mit der nächsten Frist, z. B. „Widerspruch Jobcenter: bis Mo., 14.12.2026 (noch 5 Tage)“. Ein Tipp darauf öffnet die Liste.
2. Fristen aus „Brief prüfen“ (Widerspruch, Unterlagen nachreichen, Anhörung, Zahlung, Mahnbescheid) und das Ende eines Bewilligungszeitraums aus dem Haushaltsplan kommen **von selbst** in die Liste. Dazu erscheint die Meldung „In Mein Ordner gemerkt · Rückgängig“.
3. Jede Frist hat ein Wort: **„Fest“**, wenn das Datum im Brief steht, **„Gerechnet“**, wenn die App es aus dem Datum des Briefs ausgerechnet hat, **„Ungefähr“**, wenn das Datum des Briefs fehlt. Die Rechnung steht unter „So wurde gerechnet“ zum Aufklappen.
4. Beim Öffnen der App erscheint **höchstens einmal am Tag** ein kleiner Hinweis auf der Startseite. Er kommt nur, wenn eine Frist in den nächsten 7 Tagen endet oder schon abgelaufen ist (beim Folgeantrag 6 Wochen bzw. 2 Monate vorher). Knöpfe: „Erledigt“, „Später erinnern“, „Ansehen“.
5. Alles bleibt auf dem Gerät und gehört zum geöffneten Vorgang: Mit PIN ist es verschlüsselt, beim Kopieren wird es mitkopiert, beim Löschen mitgelöscht.

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
| `fri.rechnung.woche` | Brief vom {datum}, bekannt gegeben am {bekannt}.¹ Ab dann {n} Wochen.⁴ Fällt das Ende auf Samstag, Sonntag oder Feiertag, endet die Frist am nächsten Werktag.⁵ | Der Brief ist vom {datum}. Für das Amt kommt er am {bekannt} an. Ab dann hast du {n} Wochen Zeit. |
| `fri.rechnung.zustellung` | Zugestellt am {datum} (Datum auf dem gelben Umschlag).⁶ Ab dann zwei Wochen.⁷ Fällt das Ende auf Samstag, Sonntag oder Feiertag, endet die Frist am nächsten Werktag.⁸ | Der Brief kam am {datum}. Das Datum steht auf dem gelben Umschlag. Ab dann hast du 2 Wochen Zeit. |
| `fri.rechnung.fest` | Der Brief nennt diesen Tag. Die App verschiebt ihn nicht.⁹ | Der Tag steht im Brief. Die App ändert ihn nicht. |
| `fri.rechnung.feiertag` | Gezählt werden nur bundesweite Feiertage. Ein Feiertag in deinem Bundesland kann die Frist um einen Tag verlängern. Die App nennt deshalb eher einen zu frühen Tag. | Die App rechnet nur mit Feiertagen in ganz Deutschland. Deine Frist ist also vielleicht 1 Tag länger. |
| `fri.eingang` | Bis zu diesem Tag muss dein Schreiben **bei der Stelle angekommen** sein, nicht nur abgeschickt. Sicher ist: persönlich abgeben mit Eingangsstempel, Fax mit Sendebericht oder Einwurf in den Briefkasten der Stelle. | Dein Brief muss bis zu dem Tag **beim Amt sein**. Abschicken reicht nicht. Am besten: selbst hinbringen und einen Stempel geben lassen. |
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
| `fri.art.termin` / `.t` | Termin bei {stelle} / Ein Termin gilt auch, wenn er auf ein Wochenende fällt.⁹ Kannst du nicht kommen, sag vorher ab und nenne den Grund. Beim Jobcenter kann ein zweiter verpasster Termin die Leistung um 30 % für einen Monat kürzen.¹⁶ | Termin beim Amt / Kannst du nicht kommen? Sag vorher Bescheid und sag warum. Beim Jobcenter: Wer 2-mal nicht kommt, bekommt weniger Geld. |
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
| ¹ | Bekanntgabe eines Verwaltungsakts per Post im Inland | **am 4. Tag nach Aufgabe zur Post**. Nicht, wenn der Brief nicht oder später zugegangen ist; im Zweifel muss die Behörde Zugang und Zeitpunkt nachweisen | § 37 Abs. 2 SGB X, https://www.gesetze-im-internet.de/sgb_10/__37.html ; geändert durch Art. 33 PostModG, BGBl. 2024 I Nr. 236 (Fundstelle laut buzer.de, nur ergänzend) | ab 1.1.2025 (vorher 3. Tag) / unbefristet |
| ² | Widerspruchsfrist | **1 Monat** ab Bekanntgabe; 3 Monate bei Bekanntgabe im Ausland | § 84 Abs. 1 SGG, https://www.gesetze-im-internet.de/sgg/__84.html | geltend / unbefristet |
| ³ | Fristberechnung Widerspruch/Klage | Beginn am Tag nach dem Ereignis; Monatsfrist endet am Tag mit derselben Zahl, fehlt er, am Monatsletzten; Ende an Sa, So oder gesetzlichem Feiertag → nächster Werktag | § 64 Abs. 1–3 SGG, https://www.gesetze-im-internet.de/sgg/__64.html | geltend |
| ⁴ | Behördliche Fristen (Mitwirkung, Anhörung) | §§ 187–193 BGB gelten entsprechend; Wochenfrist endet am gleichen Wochentag der letzten Woche | § 26 Abs. 1 SGB X, https://www.gesetze-im-internet.de/sgb_10/__26.html ; §§ 187, 188 BGB, https://www.gesetze-im-internet.de/bgb/__187.html , https://www.gesetze-im-internet.de/bgb/__188.html | geltend |
| ⁵ | Ende an Sa, So, Feiertag (behördliche Frist) | nächster Werktag, **außer** die Behörde hat unter Hinweis auf diese Vorschrift einen bestimmten Tag mitgeteilt | § 26 Abs. 3 SGB X (Quelle wie ⁴) | geltend |
| ⁶ | Zustellung mit Zustellungsurkunde | Datum der Zustellung steht auf dem Umschlag (auch bei Einwurf in den Briefkasten) | § 180 ZPO, https://www.gesetze-im-internet.de/zpo/__180.html | geltend |
| ⁷ | Widerspruch gegen den Mahnbescheid | **2 Wochen** ab Zustellung | § 692 Abs. 1 Nr. 3 ZPO, https://www.gesetze-im-internet.de/zpo/__692.html | geltend |
| ⁸ | Fristende ZPO an Sa, So, Feiertag | nächster Werktag | § 222 Abs. 1, 2 ZPO, https://www.gesetze-im-internet.de/zpo/__222.html ; § 193 BGB, https://www.gesetze-im-internet.de/bgb/__193.html | geltend |
| ⁹ | Von der Behörde gesetzter Termin | ist auch an Sa, So oder Feiertag einzuhalten. SoLo verschiebt Daten, die im Brief stehen, nie | § 26 Abs. 5 SGB X (Quelle wie ⁴) | geltend |
| ¹⁰ | Fehlende oder falsche Rechtsbehelfsbelehrung | 1 Jahr statt 1 Monat | § 66 Abs. 2 SGG, https://www.gesetze-im-internet.de/sgg/__66.html | geltend |
| ¹¹ | Verlängerung behördlicher Fristen | möglich, auch rückwirkend | § 26 Abs. 7 SGB X (Quelle wie ⁴) | geltend |
| ¹² | Folgen fehlender Mitwirkung | Versagung oder Entziehung, erst nach schriftlichem Hinweis und angemessener Frist | § 66 Abs. 1, 3 SGB I, https://www.gesetze-im-internet.de/sgb_1/__66.html | geltend |
| ¹³ | Anhörung | Gelegenheit zur Äußerung vor belastendem Verwaltungsakt; **keine feste Länge im Gesetz**, die Behörde setzt die Frist | § 24 Abs. 1 SGB X, https://www.gesetze-im-internet.de/sgb_10/__24.html | geltend |
| ¹⁴ | Widerspruch nach Fristablauf | zulässig, solange der Vollstreckungsbescheid nicht verfügt ist; ein verspäteter Widerspruch wird als Einspruch behandelt | § 694 Abs. 1, 2 ZPO, https://www.gesetze-im-internet.de/zpo/__694.html | geltend |
| ¹⁵ | Einspruch gegen den Vollstreckungsbescheid | **2 Wochen**, Notfrist, ab Zustellung | § 700 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__700.html ; § 339 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__339.html | geltend |
| ¹⁶ | Meldeversäumnis beim Jobcenter (Neue Grundsicherung) | 1. Versäumnis ohne Folgen, ab dem 2. **30 % für einen Monat**, nach drei Versäumnissen in Folge im Extremfall Wegfall | Bundesregierung, „Neue Grundsicherung löst Bürgergeld ab“, 1.7.2026, https://www.bundesregierung.de/breg-de/aktuelles/neue-grundsicherung-2399562 (Gesetzestext § 32 SGB II n. F. vor dem Einbau prüfen) | ab 1.7.2026 |
| ¹⁷a | Bewilligungszeitraum Grundsicherungsgeld | in der Regel **12 Monate**; **6 Monate** sollen es sein bei vorläufiger Entscheidung (§ 41a) oder unangemessenen Kosten der Unterkunft | § 41 Abs. 3 SGB II, https://www.gesetze-im-internet.de/sgb_2/__41.html | geltend (Neue Grundsicherung ab 1.7.2026 ändert das laut Bundesregierung und Jobcenter-Übersicht nicht; neue Vermögensregeln gelten für Bewilligungszeiträume ab 1.7.2026) |
| ¹⁷b | Bewilligungszeitraum Grundsicherung im Alter | in der Regel **12 Monate**, vorläufig höchstens 6 | § 44 Abs. 3 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__44.html | geltend |
| ¹⁷c | Bewilligungszeitraum Wohngeld | soll **12 Monate** sein; kürzer möglich; bis **24 Monate**, wenn keine Änderung zu erwarten ist | § 25 Abs. 1 WoGG, https://www.gesetze-im-internet.de/wogg/__25.html | geltend. Reform 2027: Kabinettsentwurf vom 6.7.2026, geplant ab 1.1.2027. Laufende Bescheide gelten bis zum Ende weiter. Zum Bewilligungszeitraum sagt die Seite nichts (https://www.bundesregierung.de/breg-de/aktuelles/neuordnung-wohngeld-2445796), daher **möglich**, vor dem Einbau BGBl prüfen |
| ¹⁷d | Wohngeld: Antrag für die Zeit danach | Wird er **mehr als 2 Monate** vor Ende gestellt, gilt der Erste des zweiten Monats vor Ablauf als Antragstag (ein früher Antrag schadet also nicht). Beginn des Zeitraums: Erster des Antragsmonats | § 22 Abs. 4 WoGG, https://www.gesetze-im-internet.de/wogg/__22.html ; § 25 Abs. 2 WoGG | geltend |
| ¹⁷e | Kinderzuschlag | immer **6 Monate**; beginnt mit dem Antragsmonat, frühestens nach Ende des laufenden Zeitraums | § 6a Abs. 7 BKGG, https://www.gesetze-im-internet.de/bkgg_1996/__6a.html ; schriftlich bei der Familienkasse: § 9 Abs. 1 BKGG, https://www.gesetze-im-internet.de/bkgg_1996/__9.html | geltend |
| ¹⁸ | Rückwirkung des Antrags | SGB II: auf den Ersten des Antragsmonats, nicht davor (§ 37 Abs. 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__37.html). SGB XII: Erster des Antragsmonats (§ 44 Abs. 2 SGB XII). Wohngeld: Erster des Antragsmonats (§ 25 Abs. 2 WoGG). KiZ: Antragsmonat (§ 6a Abs. 7 BKGG) | wie links | geltend |
| – | Vorlauf der Erinnerung an den Folgeantrag (App-Regel, kein Gesetz) | Grundsicherungsgeld, GSA, KiZ: **42 Tage**; Wohngeld: **60 Tage** (passt zu § 22 Abs. 4 WoGG) | bestehende Werte `Haushalt.VORLAUF_TAGE` (`src/haushalt.js` Z. 230) und `erweiterungen/fristen.js` `VORLAUF` | – |
| – | Feiertage | Gezählt werden nur die 9 bundesweit geltenden Feiertage (Neujahr, Karfreitag, Ostermontag, 1. Mai, Himmelfahrt, Pfingstmontag, 3. Oktober, 25./26. Dezember). Landesfeiertage verlängern höchstens, SoLo nennt also eher einen zu frühen Tag. § 193 BGB stellt auf Feiertage am Erklärungs- oder Leistungsort ab | `Fristen.feiertage` in `erweiterungen/fristen.js`; § 193 BGB | – |

**Sicherheitsregel der Rechnung:** SoLo nennt immer den **frühesten möglichen Tag**:
- Die Bekanntgabe am 4. Tag wird nicht auf einen Werktag verschoben. Ob sich die Bekanntgabe verschiebt, wenn der 4. Tag auf ein Wochenende fällt, ist in der Rechtsprechung **umstritten**; für SoLo gilt sie deshalb als „nicht verschoben“, also als früher Tag.
- Es zählen keine Landesfeiertage.
- Fehlt das Datum des Briefs, rechnet SoLo vom Tag des Erhalts („Ungefähr“). Das ist nie später als die echte Frist, denn die Bekanntgabe kann nicht vor dem tatsächlichen Erhalt liegen, wenn dieser nach dem 4. Tag kam. Kam der Brief früher, gilt trotzdem der 4. Tag nach Aufgabe zur Post, also ein späterer Tag.
- Daten, die im Brief stehen, werden nie verschoben (§ 26 Abs. 3 Satz 2, Abs. 5 SGB X).

**Prüffälle für die Tests** (mit `erweiterungen/fristen.js` nachgerechnet):

| Fall | Eingabe | Erwartet |
|---|---|---|
| Widerspruch, Ende fällt auf Werktag | Bescheid 10.11.2026 | bekannt 14.11.2026 (Sa, nicht verschoben), Ende **Mo 14.12.2026** (wie bestehender e2e-Test) |
| Monatsende + Wochenende | Bescheid 27.01.2026 | bekannt 31.01.2026, 28.02.2026 ist Sa → **Mo 02.03.2026** |
| Ostern | Bescheid 24.03.2027 | bekannt 28.03.2027 (Ostersonntag), Ende **Mi 28.04.2027** |
| Wochenfrist über Jahreswechsel | Mitwirkung „innerhalb von zwei Wochen“, Brief 18.12.2026 | bekannt Di 22.12.2026 → **Di 05.01.2027** |
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
| Wie oft? | **Höchstens einmal je Kalendertag.** Wurde er heute schon gezeigt, kommt er erst morgen wieder (Merker `lotse.fristTag`, siehe 6.3). |
| Wie viele? | **Ein** Hinweis mit der dringendsten Frist: abgelaufen vor heute vor morgen vor später, bei gleichem Tag „Fest“ vor „Gerechnet“. Dazu „und {n} weitere“ als Link zur Liste. |
| Aussehen | Wie der vorhandene Hinweis `.hb-start`: unter der Begrüßung, vor den Kacheln. Bald: `--warn-bg` / `--warn` mit Wort „Frist“. Abgelaufen: `--bad-bg` / `--bad` mit Wort „Abgelaufen“. Farbe ist nie die einzige Information. Eine Zeile Text, darunter klein der Vorgangsname (nur bei mehr als einem Vorgang), drei Knöpfe als `btn ghost klein`. Kein Dialog, nichts Modales, kein `role="alert"`, sondern `role="status"`. |
| Knopf „Erledigt“ | Markiert die Frist als erledigt (`erledigt: heute`). Der Hinweis verschwindet. Meldung „Als erledigt markiert · Rückgängig“ (10 s). Die Frist erscheint nie wieder im Hinweis. In der Liste steht sie zugeklappt unter „Erledigt (n)“ und verschwindet dort nach 30 Tagen. |
| Knopf „Später erinnern“ | Kurze Fristen: **morgen** wieder. Folgeantrag: **in 7 Tagen**, aber spätestens 7 Tage vor dem Ende. Am Tag des Fristendes und danach: morgen. Meldung „Die App erinnert dich am {datum} wieder.“ |
| Knopf „Ansehen“ | Öffnet „Mein Ordner“ → Fristen. Gehört die Frist zu einem anderen Vorgang, wird dieser vorher geöffnet (`vgOeffnen`). |
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
| `bekanntgabe({ datum, zugang })` | `zugang` (Zustellung oder persönlich) sonst `datum + 4`. Wort: `gerechnet`; ohne `datum`, nur mit Erhalt: `ungefaehr` mit `bekannt = erhalten` |
| `endeMonat(bekannt, n)` | n Monate nach § 64 Abs. 2 SGG / § 188 Abs. 2, 3 BGB, dann `werktag` |
| `endeWochen(bekannt, n)` | n×7 Tage, dann `werktag` |
| `endeTage(bekannt, n)` | n Tage, dann `werktag` |
| `ausBrief(text, art, heute)` | wertet `BriefLesen.frist(text)` / `BriefLesen.andere(text)` und `BriefLesen.lies(text).datum` aus: Datum im Brief → `{bis, wort:'fest'}`; „zwei Wochen“, „ein Monat“, „14 Tagen“ → Rechnung ab Bekanntgabe; Mahnbescheid/Vollstreckungsbescheid → `art:'mb'|'vb'`, Datum der Zustellung erfragen (`wort:'offen'`, bis eingetragen) |
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
- `titel`: nur bei `eigen` frei (≤ 60 Zeichen), sonst leer; der Text kommt aus `fri.art.*`. Es wird **keine Briefzeile** gespeichert: weniger sensible Daten, keine fremde Sprache in der Liste.
- **Folgeantrag nicht doppelt speichern:** `wb`-Einträge werden beim Anzeigen aus `lotse.haushalt` → `bewilligt` abgeleitet. In `lotse.fristliste` steht nur der Zustand: `{ "wb": { "wb-sgb2-2027-03-31": { "erledigt": "…", "spaeter": "…" } } }`.

### 6.3 Änderungen an vorhandenen Dateien

| Datei | Stelle | Änderung |
|---|---|---|
| `src/vorgaenge.js` | Z. 7 `DATEN` | `'lotse.fristliste'` anhängen. Damit wird der Schlüssel mit PIN verschlüsselt, kopiert und gelöscht. |
| `src/vorgaenge.js` | `tresor` → `api` | Neu `ueberall(k)`: `bereit ? c.liste.map(v => ({ id, name, wert: v.daten && v.daten[k] }))` (für den geöffneten Vorgang `wert(k)`). Nötig für den Start-Hinweis über alle Vorgänge. Ohne PIN stehen die Daten der anderen Vorgänge in `meta.klar` (Z. 87–90), also auch dort vorhanden. |
| `src/app.js` | Z. 2118 `STORE_SCHLUESSEL` | `'lotse.fristTag'` und `'lotse.fristHinweis'` ergänzen. `'lotse.fristen'` bleibt. |
| `src/app.js` | neu, nach Z. 3399 (bei `Ausziehen.init`) | `FristListe.speicherOrt` über `Store` mit `lotse.fristliste`. `FristListe.init({...})`: `hinweisErlaubt` liest `lotse.fristHinweis`; `alle` = `tresor.ueberall('lotse.fristliste')` plus `ueberall('lotse.haushalt')`; `oeffneVorgang` = `vgOeffnen`. |
| `src/app.js` | Z. 3401 | `Store.remove('lotse.fristen')` **unverändert lassen**. |
| `src/app.js` | `textLesen` Z. 3286–3300 | Bei `anh`/`mit`: `FristListe.ausBrief(text, r.art)` → `merken`, Meldung `fri.gemerkt` / `fri.schonDa` mit Rückgängig. `el.frist` bleibt. |
| `src/app.js` | `vgNeuLaden` Z. 2611 | `if (window.FristListe) FristListe.neuLaden();` |
| `src/app.js` | `ordnerRender` Z. 2844 | Neue `zeile('fristen', t('fri.karte'), stand, sym, () => usZeigen('ordner','fristen',true))` **als erste Zeile**, nur wenn es mindestens einen offenen Eintrag gibt. Symbol: Uhr `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`. Steht eine Frist in 0–7 Tagen an oder ist sie abgelaufen, hängt an den Status das Wort aus `fri.rest.*`. |
| `src/app.js` | `vgBereit` / nach `stateLaden` | `FristListe.startHinweis()` nach dem Entsperren bzw. wenn der Tresor bereit ist; danach, wenn gezeigt, `StoreRoh.set('lotse.fristTag', heute)`. |
| `src/app.js` | `vgRender` → Sicherheit und Daten | Schalter `fri.set.label` (Klasse `.schalter`, wie die vorhandenen). |
| `src/template.html` | `#v-ordner` Z. 1423 | Neue Unterseite `<div id="ordnerFristen" class="unterseite" data-seite="fristen" hidden><button class="us-zurueck">…</button><h2 data-t="fri.h"></h2><p class="small muted" data-t="fri.lead"></p><div id="friListe"></div></div>`. **Nicht** `v-fristen` oder `startFristen` nennen. |
| `src/template.html` | CSS „Gruppenfarben“ Z. 850 ff. | Gruppe `ordner` (siehe 6.5) und `.fri-start` (wie `.hb-start`, `--warn-bg` bzw. `--bad-bg`). |
| `src/template.html` | Skript-Einbindung | `src/fristen.js` wie `haushalt.js` / `ausziehen.js` einbinden (`scripts/build.js`). |
| `erweiterungen/vorschau.js` | `fristText` Z. 287 und die Stellen Z. 282, 392, 421, 460, 503 | Nach dem Setzen von `*-frist` (nicht beim Beispiel, Knopf `*-beispiel`): `window.FristListe && FristListe.merken({art:'wid', stelle, basis:{datum}, quelle:'bescheid'})`. Bei der Pflege-Höherstufung (`hoch`) keine Frist. |
| `erweiterungen/vorschau.js` | `zeigeAndere` Z. 782–785 | Bei `r.mahnbescheid` / `r.vollstreckungsbescheid`: Feld „Zugestellt am (gelber Umschlag)“, dann `merken({art:'mb'|'vb', basis:{zugang}})`. Bei einer festen Datums-Frist mit „Widerspruch/Einspruch/Klage“ in der Zeile: `art:'wid'`, sonst `zahl`, wenn „zahlen/überweisen/Betrag“ in der Zeile steht; sonst nur anzeigen und anbieten („Merken“). |
| `src/haushalt.js` | `startHinweis` Z. 506 | Keinen eigenen `#hbStart` mehr zeichnen, sondern `if (ctx.fristenNeu) ctx.fristenNeu()`. Beim Ändern von `bewilligt` (Z. 526) ebenso. **Konflikt mit b-energie** (gleiche Datei). |
| `scripts/build.js` | Z. 36–38 | `src/lang/fristen/<Sprache>.json` wie `haushalt` und `ausziehen` zusammenführen. |
| `tools/kontrast-pruefen.js` | `erwartet` Z. 84 | `ordner: (app.match(/zeile\('[a-z]+'/g) \|\| []).length` (heute 6 + fristen = 7). |
| `docs/FARBEN.md` | Gruppenfarben | Zeile „Mein Ordner“ ergänzen. |
| `docs/AENDERUNGEN.md`, Store-Texte | – | Erwähnen: „Fristen in Mein Ordner (nur auf dem Gerät, keine Mitteilungen)“. `APPLE-REVIEW-ANTWORT.md` „ohne Kalender/Fristen“ bleibt sinngemäß wahr: kein Kalender. |

**Warum `lotse.fristTag` nicht im Vorgang liegt:** Jeder Schreibvorgang im Tresor setzt `geaendert` (`wertSetzen`, Z. 25–30). Ein täglicher Merker würde „Automatisch löschen“ (30/90 Tage ab letzter Änderung) aushebeln. `lotse.fristTag` enthält nur ein Datum, keinen Inhalt. Er liegt deshalb im normalen Speicher (`StoreRoh`) und wird bei „Alle Angaben löschen“ mitgelöscht. „Erledigt“ und „Später“ sind echte Nutzeraktionen und dürfen `geaendert` setzen.

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
| `test/test-fristen.js` (neu, in `npm test`) | Alle 8 Prüffälle aus Abschnitt 4. `einMonat` 31.01.→28.02. und im Schaltjahr 2028 →29.02. `ausBrief`: „bis zum 15.12.2026“ → fest; „innerhalb von zwei Wochen“ mit Briefdatum → gerechnet; ohne Briefdatum → ungefähr bzw. offen; Mahnbescheid → `mb`, offen bis zur Eingabe der Zustellung. Dubletten: zweimal derselbe Bescheid → `'da'`. `zeigen()`: 8 Tage vorher → nichts; 7 Tage → ja; erledigt → nie; `spaeter` = morgen → heute nichts; abgelaufen vor 15 Tagen → nicht im Hinweis, aber in der Liste; `wb` Wohngeld ab −60 Tagen; Sortierung (abgelaufen vor heute vor morgen). `normiere`: Müll, zu lange Titel, über 50 Einträge, erledigt vor über 30 Tagen weg. |
| `test/test-vorgaenge.js` | `DATEN` enthält `lotse.fristliste`; mit PIN verschlüsselt (Klartext nicht im Speicher); `kopie` kopiert, `loeschen` löscht; `ueberall()` liefert alle Vorgänge, ohne PIN auch die nicht geöffneten. |
| `test/test-fristen-dom.js` (neu, wie `test-haushalt-dom.js`) | Karte `#or-fristen` erscheint als erste Zeile nur mit Einträgen; Unterseite `data-seite="fristen"`, „← Zurück“; Worte „Fest/Gerechnet/Ungefähr“ sichtbar; `<details>` „So wurde gerechnet“; Start-Hinweis `#friStart` unter der Begrüßung; **zweites Öffnen am selben Tag → kein Hinweis**; nächster Tag (Uhr gestellt) → Hinweis; „Erledigt“ → weg und am nächsten Tag nicht wieder; „Später erinnern“ → morgen; Schalter aus → nie; mit PIN gesperrt → kein Hinweis vor dem Entsperren. |
| `test/test-haushalt-dom.js` Z. 97–98 | auf `#friStart` umstellen; prüfen, dass `#hbStart` nicht mehr entsteht (nur ein Hinweis). |
| `test/e2e-briefe.js` | bleibt; neu: Pflegekasse-Widerspruch mit Datum 10.11.2026 → in „Mein Ordner“ steht „bis 14.12.2026“; `localStorage['lotse.fristen']` weiter `null`; `#v-fristen`, `[data-ansicht=fristen]`, `#startFristen` weiter 0; Beispiel laden → **nichts** gemerkt. |
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
2. **Bekanntgabe an Wochenende/Feiertag:** Ob sich der 4. Tag auf den nächsten Werktag verschiebt, ist umstritten. SoLo verschiebt nicht und nennt so den früheren, sicheren Tag. Eine amtliche Klarstellung zu § 37 Abs. 2 SGB X n. F. habe ich nicht gefunden.
3. **Landesfeiertage:** Sollen sie über die PLZ (`Plz.lookup().bl`) mitzählen? Dann wird die Frist genauer, aber länger. Ein Fehler bei der PLZ würde einen zu späten Tag nennen. Empfehlung: nicht mitzählen, nur der Hinweis `fri.rechnung.feiertag`.
4. **Rechenkern doppelt:** `erweiterungen/fristen.js` gegenüber dem neuen `src/fristen.js`. Ist das Prüfpaket im App-Build immer dabei? Davon hängt ab, ob verschoben oder kopiert wird.
5. **Automatisch übernehmen ohne Rückfrage:** So verlangt es der Auftrag. Vorgeschlagen ist: automatisch speichern mit Meldung und „Rückgängig“, nicht bei Beispielen und nicht ohne Datum (dann Eintrag „Datum fehlt“). Alternative wäre ein Knopf „Frist merken“. Bitte entscheiden.
6. **Wohngeld-Reform 2027** (Kabinettsentwurf 6.7.2026, geplant ab 1.1.2027): Ob der Bewilligungszeitraum geändert wird, ist nicht belegt. Vor dem Einbau BGBl prüfen. Laufende Bescheide gelten laut Bundesregierung weiter.
7. **Neue Grundsicherung:** Die Kürzung bei Meldeversäumnissen (30 %) ist nur über die Seite der Bundesregierung belegt. Vor dem Einbau den Gesetzestext (§ 32 SGB II n. F., BGBl. 2026) prüfen. Die Fristart `termin` ist optional.
8. **Folgeantrag, „letzter Tag ohne Geldverlust“:** Nach § 37 Abs. 2 SGB II, § 44 Abs. 2 SGB XII, § 25 Abs. 2 WoGG und § 6a Abs. 7 BKGG wirkt ein Antrag ab dem Ersten des Antragsmonats. Ein Antrag im Monat nach dem Ende kostet also meist kein Geld, nur eine Zahlungslücke. Bewusst wird das nur als Trost-Text (`fri.art.wb.spaet`) gezeigt, nicht als Frist, weil Bewilligungszeiträume nicht immer am Monatsende enden. Bitte bestätigen.
9. **Schwelle „7 Tage“ und „14 Tage abgelaufen“:** Das sind Vorschläge des Nutzers bzw. von mir, keine Rechtsregeln. Beim Folgeantrag bleibt der bisherige Vorlauf von 42/60 Tagen (ohne Gesetzesgrundlage, App-Regel).
10. **Schalter „Erinnerung beim Öffnen“:** Ist er nötig, oder reicht die Tagesregel? Er macht eine Einstellung mehr.

## Entscheidungen des Nutzers (20.11.2026)
- Frist aus „Brief prüfen“ wird **nur auf Knopfdruck** übernommen (Knopf „Frist merken“ unter der erkannten Frist), nicht automatisch.
- **Keine Landesfeiertage** über die PLZ: nur bundesweite Feiertage zählen, dazu der Hinweis „Bei einem Feiertag in deinem Bundesland kann es einen Tag später sein“. Die App nennt nie einen zu späten Tag.
- Fristen nur in der App (Gerät, je Vorgang, PIN-verschlüsselt); kein Kalender, keine Cloud, keine Push-Mitteilungen; Hinweis beim Öffnen höchstens einmal am Tag mit „Erledigt“ / „Später erinnern“.
