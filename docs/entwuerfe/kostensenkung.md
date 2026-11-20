# Entwurf: Hilfe bei einer Aufforderung zur Senkung der Unterkunftskosten (b-kostensenkung)

Stand: 20.11.2026 · Bereich: „Ich habe einen Brief bekommen“ → Jobcenter / Sozialamt (auch ohne Kachel beim Einlesen) · Code gelesen: `/home/claude/s1` (PR #42)

---

## 1. Kurzfassung (was der Nutzer sieht)

1. Wer einen Brief „Aufforderung zur Senkung der Unterkunftskosten“ (oder der Heizkosten) einscannt oder einfügt, bekommt **keine Nachrechnung**. Stattdessen erscheint ein Erklärkasten „Das Amt hält deine Miete für zu hoch“ mit den erkannten Zahlen (deine Miete, Grenze des Amts, Frist).
2. Ganz oben steht das Wichtigste: **Das ist in der Regel noch keine Kürzung.** Die Miete wird in der Regel noch höchstens 6 Monate weitergezahlt – aber nur bis zum Eineinhalbfachen der örtlichen Grenze; der Teil darüber kann sofort wegfallen. Ein Widerspruch gegen diesen Brief ist in der Regel nicht möglich, erst gegen den späteren Bescheid. Steht im Brief aber eine Rechtsbehelfsbelehrung, sagt die App das Gegenteil: Frist von einem Monat beachten.
3. Darunter drei Schritte: Gründe nennen, die gegen einen Umzug sprechen · Bemühungen sammeln und belegen · Beratung holen (Mieterverein, Sozialberatung).
4. Knöpfe: „Frist in Mein Ordner übernehmen“ (nur, wenn das Fristen-Modul aus b-fristen da ist) und „Antwort an das Amt entwerfen“ (Entwurf zum Bearbeiten, Teilen/Drucken wie die anderen Schreiben).
5. Details (Karenzzeit, Grenze vom Eineinhalbfachen, Heizkosten, Umzug nur mit Zusicherung, Wirtschaftlichkeit) sind zum Aufklappen (`<details>`), jede Aussage mit Paragraf.

---

## 2. Inhalte und Texte (Deutsch + Einfache Sprache)

Vorschlag: alle Texte unter dem Präfix `el.ks.` in `src/lang/de.json` (wie die übrigen `el.*`-Schlüssel), Einfache Sprache in `src/lang/einfach/d.json` (dort stehen schon `el.*`-Schlüssel). Zahlen und Paragrafen stehen bewusst in jeder Sprache gleich (Prüfung `test/test-sprachen-zahlen.js`).

### 2.1 Kopf und Kernaussage (immer sichtbar)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `el.ks.titel` | Aufforderung, die Wohnkosten zu senken | Das Amt sagt: Deine Miete ist zu hoch |
| `el.ks.titelHeiz` | Aufforderung, die Heizkosten zu senken | Das Amt sagt: Deine Heizkosten sind zu hoch |
| `el.ks.kern` | Das ist in der Regel noch keine Kürzung. Das Amt hält deine Kosten für höher als die örtliche Grenze. Es zahlt sie in der Regel noch so lange weiter, wie du sie nicht senken kannst, meist höchstens 6 Monate.[^1][^2] Danach zahlt es möglicherweise nur noch den Betrag bis zur Grenze. | Dieser Brief kürzt meistens noch kein Geld. Das Amt zahlt die Miete meistens noch 6 Monate weiter. Danach zahlt es vielleicht weniger. |
| `el.ks.deckel` | Achtung: Liegt deine Miete (ohne Heizung) über dem Eineinhalbfachen der Grenze, zahlt das Amt den Teil darüber seit 1.7.2026 möglicherweise sofort nicht mehr, ohne die 6 Monate. Ausnahmen sind im ersten Jahr im Einzelfall möglich, zum Beispiel mit Kindern.[^1][^7][^8] | Achtung: Ist deine Miete sehr viel höher als die Grenze? Mehr als das 1,5-fache? Dann zahlt das Amt den Teil darüber vielleicht sofort nicht mehr. Mit Kindern gibt es manchmal eine Ausnahme. Frag eine Beratungsstelle. |
| `el.ks.zahlen` | Deine Kosten laut Brief: {ist} · Grenze des Amts: {grenze} · Unterschied: {diff} im Monat | Deine Miete: {ist}. Das Amt zahlt bis: {grenze}. Das sind {diff} zu viel im Monat. |
| `el.ks.frist` | Frist im Brief: {frist} | Bis zu diesem Tag sollst du etwas tun: {frist} |
| `el.ks.stichtag` | Ab {datum} will das Amt laut Brief nur noch die Grenze zahlen. | Ab {datum} zahlt das Amt vielleicht weniger. |
| `el.ks.keinWs` | Gegen diesen Brief kannst du in der Regel keinen Widerspruch einlegen: Er ist ein Hinweis, keine Entscheidung.[^3] Wenn das Amt später weniger zahlt, kommt ein Bescheid. Gegen den kannst du innerhalb eines Monats Widerspruch einlegen. Antworte trotzdem jetzt, das hilft dir später. | Gegen diesen Brief kannst du meistens nichts einlegen. Es ist nur ein Hinweis. Später kommt vielleicht ein Bescheid mit weniger Geld. Dagegen kannst du dich wehren. Schreib dem Amt aber jetzt schon. |
| `el.ks.wsDoch` (statt `el.ks.keinWs`, wenn im Brief „Rechtsbehelfsbelehrung“ oder „Widerspruch erheben/einlegen“ steht) | In deinem Brief steht, dass du Widerspruch einlegen kannst. Dann ist es möglicherweise schon eine Entscheidung (Bescheid). Die Frist für den Widerspruch beträgt in der Regel einen Monat ab Zugang. Lass den Brief schnell von einer Beratungsstelle prüfen. | In deinem Brief steht: Du kannst Widerspruch einlegen. Dann ist der Brief vielleicht schon eine Entscheidung. Du hast meistens nur einen Monat Zeit. Geh schnell zu einer Beratungsstelle. |

Anzeige nur der Zeilen, für die etwas erkannt wurde (`{ist}`, `{grenze}`, `{frist}`, `{datum}`); `{diff}` nur, wenn beide Beträge erkannt sind und `ist > grenze`. `el.ks.deckel` immer sichtbar, wenn beide Beträge erkannt sind und `ist > 1,5 × grenze` oder der Brief das Eineinhalbfache nennt (`/eineinhalb|anderthalb|1,5[- ]?fach|150\s*(%|Prozent)/i`); sonst steht derselbe Inhalt nur im Detail „Karenzzeit“. Nicht bei `heiz` (der Deckel gilt nur für die Unterkunft). `el.ks.frist` zeigt zusätzlich die Zeile aus dem Brief, aus der das Datum stammt (Beleg, wie bei „Anderer Brief“), weil `frist()` das erste „bis zum …“ im Text nimmt und das auch ein anderes Datum sein kann. Beträge mit `fmt.js` wie im Rest der App.

### 2.2 Was du jetzt tun kannst (immer sichtbar, drei kurze Punkte)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `el.ks.tun.h` | Was du jetzt tun kannst | Das kannst du jetzt tun |
| `el.ks.tun.gruende` | **Gründe nennen:** Schreib dem Amt, warum ein Umzug für dich nicht möglich oder nicht zumutbar ist (zum Beispiel Krankheit, Pflege, Kinder in Kita oder Schule, Schwangerschaft, hohes Alter, du bekommst bald keine Leistung mehr). Lege Belege bei, etwa ein ärztliches Attest.[^1][^6] | **Sag dem Amt, warum du nicht umziehen kannst.** Zum Beispiel: Du bist krank. Du pflegst jemanden. Deine Kinder gehen hier zur Schule. Schick Papiere mit, die das zeigen. Zum Beispiel vom Arzt. |
| `el.ks.tun.belege` | **Bemühungen belegen:** Sammle ab heute jede Wohnungssuche (Anzeige, Anfrage, Besichtigung, Absage) mit Datum. Frag deinen Vermieter schriftlich nach einer niedrigeren Miete und nach einer Erlaubnis zur Untervermietung. Bewahre die Antworten auf.[^6] | **Schreib alles auf, was du tust.** Jede Wohnung, nach der du fragst. Jede Absage. Frag auch deinen Vermieter: Geht die Miete billiger? Darf ich ein Zimmer vermieten? Heb die Antworten auf. |
| `el.ks.tun.beratung` | **Beratung holen:** Ein Mieterverein, eine Sozialberatung (zum Beispiel Caritas, Diakonie, AWO) oder eine Anwältin für Sozialrecht kann prüfen, ob die Grenze des Amts stimmt. Mit wenig Geld hilft ein Beratungshilfeschein vom Amtsgericht. | **Hol dir Hilfe.** Zum Beispiel beim Mieterverein oder bei einer Sozialberatung. Die prüfen, ob das Amt richtig rechnet. Wenn du wenig Geld hast, gibt es dafür Hilfe vom Amtsgericht. |
| `el.ks.tun.umzug` | **Nicht einfach umziehen:** Unterschreibe einen neuen Mietvertrag erst, wenn das Amt die neue Miete vorher zugesichert hat. Sonst zahlt es möglicherweise nur einen Teil. Umzugskosten und Kaution kann das Amt nur übernehmen, wenn es vorher zugesichert hat. Bist du unter 25, zahlt das Amt ohne vorherige Zusicherung nach einem Umzug möglicherweise gar keine Miete.[^4] | **Unterschreib keinen neuen Mietvertrag ohne das Amt.** Frag vorher das Amt. Sonst zahlt das Amt vielleicht nicht die ganze neue Miete. |

Hinweis „Beratungshilfeschein“: Rechtsgrundlage Beratungshilfegesetz; keine Zahl im Text, daher keine Tabellenzeile nötig. Ob die Kosten für einen Mieterverein vom Amt übernommen werden, ist örtlich verschieden (Beispiel Hamburg übernimmt sie in bestimmten Fällen[^6]) – im App-Text bewusst nicht versprochen.

### 2.3 Aufklappbare Details (`<details>`, je ein Abschnitt)

**`el.ks.d.karenz.h`** – Deutsch: „Gilt für mich schon das erste Jahr (Karenzzeit)?“ · Einfach: „Ich bekomme erst seit kurzem Geld vom Amt“

- `el.ks.d.karenz` (Deutsch): „Im ersten Jahr, in dem du Grundsicherungsgeld oder Grundsicherung bekommst, zahlt das Amt die Miete (ohne Heizung) grundsätzlich in voller Höhe (Karenzzeit).[^1][^5] Seit 1.7.2026 gilt aber vom ersten Tag an: Mehr als das Eineinhalbfache der örtlichen Grenze wird nicht übernommen; für den Teil darüber gibt es in der Regel auch keine 6 Monate.[^1][^7][^8] Ausnahmen kann das Amt im ersten Jahr im Einzelfall machen, wenn die Kosten unvermeidbar sind oder Kinder im Haushalt leben.[^1][^7] Außerdem gilt die Karenzzeit nicht, wenn die Miete über der Mietpreisbremse liegt oder über einer örtlichen Höchstgrenze pro Quadratmeter,[^1] und nicht, wenn das Amt für diese Wohnung früher schon einmal nur die Grenze gezahlt hat.[^14] Sonst beginnen die 6 Monate zum Senken in der Regel erst nach dem ersten Jahr.[^1] Ob das Eineinhalbfache auch gilt, wenn dein erstes Jahr vor dem 1.7.2026 begonnen hat, ist nicht ausdrücklich geregelt; möglich ist es (es gibt keine Übergangsregel).[^7]“
- `el.ks.d.karenz` (Einfach): „Im ersten Jahr zahlt das Amt die Miete meistens ganz. Ohne Heizung. Aber nur bis zu einer Grenze: höchstens das 1,5-fache vom normalen Betrag. Was darüber liegt, zahlt das Amt meistens sofort nicht mehr. Bei Kindern geht manchmal mehr. Die 6 Monate fangen meistens erst nach dem ersten Jahr an.“

**`el.ks.d.heiz.h`** – Deutsch: „Und die Heizkosten?“ · Einfach: „Was ist mit der Heizung?“

- Deutsch: „Für die Heizkosten gibt es kein freies erstes Jahr. Sind sie zu hoch, kann das Amt dich gleich auffordern, sie zu senken; auch dann gilt in der Regel höchstens 6 Monate.[^1][^2] Erkläre, warum deine Heizkosten höher sind: zum Beispiel alte Fenster oder Heizung, Wohnung unter dem Dach oder an einer Außenwand, kleine Kinder, Krankheit, viel Zeit zu Hause.[^6] Liegen Miete und Heizung zusammen unter der Gesamtgrenze, muss das Amt möglicherweise nicht kürzen (wenn es eine Gesamtgrenze bildet).[^1][^2]“
- Einfach: „Bei der Heizung gibt es kein freies erstes Jahr. Das Amt kann gleich sagen: Heiz weniger. Erklär dem Amt, warum du mehr heizen musst. Zum Beispiel: alte Fenster, kleine Kinder, du bist krank.“

**`el.ks.d.wirt.h`** – Deutsch: „Lohnt sich ein Umzug überhaupt?“ · Einfach: „Ist ein Umzug teurer?“

- Deutsch: „Das Amt muss keine Senkung verlangen, wenn ein Umzug wegen der Umzugskosten unwirtschaftlich wäre.[^1][^2] Wie es das rechnet, legt jede Stadt oder jeder Kreis selbst fest. Frag nach, ob das Amt das geprüft hat, besonders wenn deine Miete nur wenig über der Grenze liegt.“
- Einfach: „Manchmal kostet ein Umzug mehr, als er spart. Dann muss das Amt keine billigere Wohnung verlangen. Frag das Amt, ob es das geprüft hat.“

**`el.ks.d.tod.h`** – Deutsch: „Jemand aus dem Haushalt ist gestorben“ · Einfach: „Jemand aus deiner Familie ist gestorben“

- Deutsch: „Waren die Kosten vorher angemessen und ist ein Mitglied des Haushalts gestorben, muss die Miete mindestens 12 Monate nach dem Sterbemonat nicht gesenkt werden.[^1][^2]“
- Einfach: „Ist jemand aus deinem Haushalt gestorben? War die Miete vorher nicht zu hoch? Dann musst du mindestens 12 Monate lang nicht umziehen.“

**`el.ks.d.mpb.h`** – Deutsch: „Das Amt sagt, meine Miete verstößt gegen die Mietpreisbremse“ · Einfach: „Das Amt sagt: Der Vermieter verlangt zu viel“

- Deutsch: „Liegt die Miete über der Mietpreisbremse, fordert das Amt dich auf, das beim Vermieter zu rügen (schriftlich beanstanden).[^1][^7] Lass dich dabei von einem Mieterverein beraten. Bleibt die zulässige Miethöhe strittig, soll das Amt nach der Gesetzesbegründung die tatsächliche Miete weiter anerkennen, bis ein Gericht entschieden hat (das steht in der Begründung, nicht im Gesetz selbst; die Grenze vom Eineinhalbfachen gilt daneben).[^8]“
- Einfach: „Das Amt sagt vielleicht: Dein Vermieter verlangt mehr als erlaubt. Dann sollst du dich beim Vermieter beschweren. Lass dir dabei vom Mieterverein helfen.“

**`el.ks.d.sa.h`** (nur bei Sozialamt) – Deutsch: „Grundsicherung im Alter und Sozialhilfe“ · Einfach: „Ich bekomme Geld vom Sozialamt“

- Deutsch: „Beim Sozialamt gelten fast die gleichen Regeln: erstes Jahr Karenzzeit für die Miete (ohne Heizung), von Anfang an höchstens das Eineinhalbfache der Grenze, nach dem ersten Jahr in der Regel höchstens 6 Monate zum Senken.[^2][^7] Hast du vorher Grundsicherungsgeld vom Jobcenter bekommen, wird die dort schon genutzte Karenzzeit angerechnet.[^2] Vor einem Umzug musst du das Sozialamt informieren; höhere Kosten zahlt es nur, wenn es vorher zugestimmt hat.[^9]“
- Einfach: „Beim Sozialamt ist es fast genauso. Im ersten Jahr zahlt es die Miete meistens ganz. Dann hast du meistens 6 Monate Zeit. Vor einem Umzug musst du das Sozialamt fragen.“

### 2.4 Hinweis am Ende (immer sichtbar, klein)

- `el.ks.hinweis` (Deutsch): „Das ist eine allgemeine Erklärung und keine Rechtsberatung. Die Grenzen und das Verfahren legt jede Stadt oder jeder Kreis selbst fest. Lass deinen Fall im Zweifel beraten.“
- (Einfach): „Das ist nur eine Hilfe. Es ist keine Beratung von einem Anwalt. Jede Stadt hat eigene Regeln. Frag im Zweifel eine Beratungsstelle.“

### 2.5 Knöpfe

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `el.ks.frist.btn` | Frist in „Mein Ordner“ übernehmen | Termin in „Mein Ordner“ speichern |
| `el.ks.frist.ok` | Frist gespeichert. Du findest sie in „Mein Ordner“. | Gespeichert. Du findest den Termin in „Mein Ordner“. |
| `el.ks.frist.datum` | Datum der Frist (aus dem Brief) | Bis wann? (steht im Brief) |
| `el.ks.antwort.btn` | Antwort an das Amt entwerfen | Brief an das Amt schreiben |
| `el.ks.antwort.hinweis` | Entwurf: Bitte anpassen, Unzutreffendes löschen, unterschreiben und mit Kopie abgeben. | Das ist ein Vorschlag. Ändere ihn. Streiche, was nicht stimmt. Unterschreibe. Mach dir eine Kopie. |

### 2.6 Antwort-Entwurf (Stellungnahme) – Text im Textfeld (`ks-text`)

Der Text wird mit Name/Anschrift aus der Ausfüllhilfe (`person.name`, `person.strasse`, `person.ort`, wie in `briefOeffnen()`), Stelle und Zeichen aus `kennungen()` vorbelegt. Die Gründe-Absätze erscheinen nur, wenn der Nutzer sie vorher angehakt hat (Checkboxen `ks-g-*`, siehe Bauplan). Der Entwurf bleibt Deutsch (wie die anderen Schreiben in „Brief prüfen“; es geht an ein deutsches Amt) – nur die Bedienung wird übersetzt.

```
{name}
{anschrift}
{ort}

An: {stelle}
{zeichen-zeile: „BG-Nummer / Aktenzeichen: …“}

{ort-kurz}, den {heute}

Ihr Schreiben vom {datum} zur Senkung der Kosten der Unterkunft und Heizung

Sehr geehrte Damen und Herren,

ich habe Ihr Schreiben vom {datum} erhalten. Dazu nehme ich wie folgt Stellung:

[ks-g-krank]  Ein Umzug ist mir aus gesundheitlichen Gründen nicht zumutbar. Ein ärztliches Attest lege ich bei / reiche ich nach. (Nichtzutreffendes streichen)
[ks-g-pflege] Ich bin auf Pflege bzw. Hilfe in meinem jetzigen Wohnumfeld angewiesen (bzw. pflege einen Angehörigen in der Nähe).
[ks-g-kinder] In meinem Haushalt leben Kinder, die hier Kita bzw. Schule besuchen. Ein Umzug könnte einen Wechsel der Kita bzw. Schule bedeuten.
[ks-g-schwanger] Ich bin schwanger; der Haushalt wird größer. Für die künftige Haushaltsgröße sind meine Kosten möglicherweise angemessen.
[ks-g-alter]  Ich wohne seit {jahre} Jahren in dieser Wohnung. Wegen meines Alters bzw. meiner Einschränkungen ist mir ein Umzug kaum möglich.
[ks-g-kurz]   Ich werde voraussichtlich bald keine Leistungen mehr benötigen (zum Beispiel wegen Arbeitsaufnahme am {datum2}).
[ks-g-tod]    Ein Mitglied meines Haushalts ist im {monat} verstorben. Ich bitte zu prüfen, ob die Kosten davor angemessen waren und eine Senkung deshalb mindestens zwölf Monate nicht zumutbar ist (§ 22 Abs. 1 Satz 11 SGB II / § 35 Abs. 3 Satz 4 SGB XII).
[ks-g-wirt]   Meine Kosten liegen nur geringfügig über der Grenze. Ich bitte zu prüfen, ob ein Umzug unter Berücksichtigung der Umzugskosten wirtschaftlich wäre (§ 22 Abs. 1 Satz 12 SGB II / § 35 Abs. 3 Satz 3 SGB XII).
[ks-g-heiz]   Meine Heizkosten sind aus folgenden Gründen höher: {freitext}.
[ks-g-grenze] Ich bitte um Mitteilung, wie die von Ihnen genannte Angemessenheitsgrenze ermittelt wurde (Konzept, Stand, Vergleichsraum).

{nur wenn das Feld ks-bem ausgefüllt ist:} Ich bemühe mich um eine Senkung der Kosten. Bisher habe ich: {freitext}.

Ich bitte Sie, die tatsächlichen Kosten weiter zu übernehmen, solange mir eine Senkung nicht möglich oder nicht zumutbar ist, und vor einer Kürzung meine Gründe zu prüfen. Bitte bestätigen Sie mir den Eingang dieses Schreibens.

Mit freundlichen Grüßen

________________________
{name}

Anlagen: {liste}
```

Paragraf im Text: bei `jc` „§ 22 Abs. 1 Satz 12 SGB II“ bzw. „Satz 11“, bei `sa` „§ 35 Abs. 3 Satz 3 SGB XII“ bzw. „Satz 4“ (nur die passende Angabe einsetzen, die andere weglassen; bei `traeger === null` beide).

Keine falschen Zusagen im Schreiben (Prüfung 20.11.2026): Der Entwurf behauptet nichts, was der Nutzer nicht selbst angehakt oder eingetragen hat. Der Satz zu den Bemühungen erscheint nur mit eigenem Text (in der Karenzzeit sind Bemühungen in der Regel noch nicht nötig[^8]). Ohne erkannten Namen der Stelle steht nur „An das Jobcenter“ bzw. „An das Sozialamt“ (keine Anschrift raten). Die angehakten Gründe (Gesundheit, Schwangerschaft) werden **nicht gespeichert**; sie stehen nur im Textfeld, bis die Karte geschlossen wird.

---

## 3. Zahlen und Regeln (mit Quelle, Abruf 20.11.2026)

| Regel | Wert | Gilt ab / bis | Quelle (amtlich) |
|---|---|---|---|
| Karenzzeit Unterkunft SGB II (nur Unterkunft, **nicht Heizung**) | 1 Jahr ab Beginn des Monats des ersten Leistungsbezugs; Unterbrechung ≥ 1 Monat verlängert; neue Karenzzeit nach 3 Jahren ohne SGB-II/XII-Leistung | seit 1.1.2023 (Bürgergeld-Gesetz vom 16.12.2022, BGBl. I S. 2328), unverändert fortgeltend | § 22 Abs. 1 S. 2–5 SGB II[^1] |
| Deckel (unabhängig von der Karenzzeit, „ab dem ersten Tag“) | Unterkunftskosten über dem **1,5-fachen** der abstrakt angemessenen Aufwendungen werden nicht anerkannt; **kein** Kostensenkungsverfahren und keine 6 Monate für den Teil darüber (anders als bei S. 8); nur wenn die Bedarfsgemeinschaft kleiner geworden ist, gilt S. 9 (6 Monate) | **seit 1.7.2026** | § 22 Abs. 1 S. 6 SGB II[^1]; Art. 1 Nr. 20, Art. 12 Abs. 1 13. SGB-II-ÄndG, BGBl. 2026 I Nr. 107[^7]; Begründung BT-Drs. 21/3541 S. 67[^8]; Beispiel Jobcenter Landkreis Leipzig („ohne Übergangszeit“)[^15] |
| Ausnahme vom Deckel | nur **in der Karenzzeit**: im Einzelfall höher, wenn unabweisbar oder in Bedarfsgemeinschaften mit Kindern („können“ = Ermessen) | seit 1.7.2026 | § 22 Abs. 1 S. 7 SGB II[^1]; Kinder-Ausnahme aus Beschlussempfehlung BT-Drs. 21/4522[^8] |
| Keine Karenzzeit (Altregel, gilt weiter) | wenn für die aktuell bewohnte Unterkunft in einem früheren Bewilligungszeitraum schon nur die angemessenen Kosten anerkannt wurden; Bezugszeiten bis 31.12.2022 zählen nicht mit | seit 1.1.2023 | § 65 Abs. 2 und 4 SGB II; § 140 SGB XII[^14] |
| Karenzzeit entfällt | soweit örtliche qm-Obergrenze überschritten oder Miete über Mietpreisbremse (§§ 556d–556g BGB); dann Kostensenkungsverfahren schon in der Karenzzeit (S. 9, in der Regel 6 Monate), bei Mietpreisbremse Aufforderung zur Rüge | seit 1.7.2026 | § 22 Abs. 1 S. 8 SGB II[^1][^7]; Begründung BT-Drs. 21/3541 S. 67–68[^8] |
| Weiterzahlung unangemessener Kosten (Heizung immer, Unterkunft nach Karenzzeit) | solange Senkung nicht möglich/zumutbar, **in der Regel längstens 6 Monate**; Karenzzeit wird nicht angerechnet | gilt (Satznummer seit 1.7.2026: S. 9 und 10) | § 22 Abs. 1 S. 9–10 SGB II[^1] |
| Todesfall | Senkung mind. **12 Monate** nach Sterbemonat unzumutbar (wenn vorher angemessen); Deckel gilt dann nicht | seit 1.7.2026 mit Deckel-Ausnahme | § 22 Abs. 1 S. 11 SGB II[^1] |
| Wirtschaftlichkeit | Senkung muss nicht gefordert werden, wenn unwirtschaftlich (unter Berücksichtigung der Umzugsleistungen) | gilt | § 22 Abs. 1 S. 12 SGB II[^1] |
| Mitteilungspflicht | Angemessenheit wird je Bewilligungszeitraum geprüft; Träger teilt Überschreitung mit und informiert über Dauer und Voraussetzungen | **seit 1.7.2026** | § 22 Abs. 1a SGB II[^1]; Begründung BT-Drs. 21/3541 S. 68[^8] |
| Bewilligungszeitraum bei unangemessenen KdU | „soll“ regelmäßig auf **6 Monate** verkürzt werden | gilt | § 41 Abs. 3 S. 2 Nr. 2 SGB II[^10] |
| Umzug: Zusicherung | vor Vertragsschluss „soll“ Zusicherung eingeholt werden; höhere als angemessene Kosten nach Umzug nur mit vorheriger schriftlicher Zusicherung; Umzug im selben Gebiet ohne Erforderlichkeit: höchstens bisheriger Bedarf | gilt (Abs. 4 S. 2–3 neu gefasst seit 1.7.2026) | § 22 Abs. 4 SGB II[^1][^7] |
| Unter 25 | Zusicherung vor Vertrag erforderlich | gilt | § 22 Abs. 5 SGB II[^1] |
| Umzugskosten, Kaution | nur mit vorheriger Zusicherung; „soll“, wenn vom Träger veranlasst/notwendig; Kaution als Darlehen | gilt | § 22 Abs. 6 SGB II[^1] |
| SGB XII (Sozialhilfe, Grundsicherung im Alter): Karenzzeit | 1 Jahr, nur Unterkunft; im SGB II genutzte Karenzzeit (letzte 2 Jahre) wird angerechnet | seit 1.1.2023 | § 35 Abs. 1 S. 2–6 SGB XII[^2] |
| SGB XII: Deckel 1,5-fach, Ausnahmen, qm-Grenze/Mietpreisbremse | wie SGB II | **seit 1.7.2026** | § 35 Abs. 1 S. 7–9 SGB XII[^2]; Art. 9 Nr. 1, Art. 12 Abs. 1 BGBl. 2026 I Nr. 107[^7] |
| SGB XII: Weiterzahlung | Heizung und (nach Karenzzeit) Unterkunft in der Regel längstens 6 Monate; Wirtschaftlichkeit; Todesfall 12 Monate | gilt | § 35 Abs. 3 SGB XII[^2] |
| SGB XII: Mitteilung | mit dem ersten Bewilligungsbescheid | gilt | § 35 Abs. 2 SGB XII[^2] |
| SGB XII: Umzug | vorher informieren; Mehrkosten nur mit vorheriger Zustimmung; in Karenzzeit nur mit Zusicherung | gilt | § 35a Abs. 2 SGB XII[^9] |
| Grundsicherung im Alter (4. Kapitel) | verweist auf § 35 ff. (Ausnahmen in bes. Wohnformen) | gilt | § 42a Abs. 1 SGB XII[^11] |
| Rechtsnatur der Aufforderung | Informationsschreiben mit Aufklärungs- und Warnfunktion, **kein Verwaltungsakt** | ständige Rspr. seit 2006 | BSG, Urt. v. 21.07.2021 – B 14 AS 31/20 R (amtlich, bsg.bund.de: „(lediglich) … Informationsschreiben mit Aufklärungs- und Warnfunktion“); BSG, Urt. v. 27.02.2008 – B 14/7b AS 70/06 R (SozR 4-4200 § 22 Nr 8); BSG, Urt. v. 07.11.2006 – B 7b AS 10/06 R (BSGE 97, 231 = SozR 4-4200 § 22 Nr 2, RdNr 29 ff.)[^3] |
| Widerspruchsfrist gegen den späteren Bescheid | 1 Monat | gilt | § 84 Abs. 1 SGG (schon in `erweiterungen/fristen.js`) |
| Übergang | § 65a SGB II regelt nur § 12 (Vermögen, Abs. 1), §§ 31 ff. (Abs. 2–3) und den Namen „Bürgergeld“ bis 31.12.2026 (Abs. 4) – **keine** Übergangsregel zu § 22. Auch die Gesetzesbegründung (BT-Drs. 21/3541, zu Art. 1 Nr. 20 und Nr. 42, S. 67–69, 77) und die Beschlussempfehlung (BT-Drs. 21/4522) nennen keinen Bestandsschutz; der Deckel gilt laut Begründung „unabhängig von der Karenzzeit“ und „ab dem ersten Tag des Leistungsbezuges“. → Der 1,5-Deckel gilt ab 1.7.2026 **möglich**erweise auch für vorher begonnene Karenzzeiten (naheliegend, aber nicht ausdrücklich geregelt; keine Gerichtsentscheidung gefunden). App: nur „möglich“, nichts berechnen. | ab 1.7.2026 | § 65a SGB II[^16]; BGBl. 2026 I Nr. 107[^7]; BT-Drs. 21/3541[^8] |
| Geplant, **nicht beschlossen** | Bundesrats-Entwurf „Entlastung der Sozialverwaltung“: Umzugskosten künftig nur über Träger am neuen Ort, Pauschalen ohne Nachweis | Entwurf vom 22.04.2026, Stand des Verfahrens offen | BT-Drs. 21/5509[^12] |

**Nur Beispiel, kein bundesweiter Wert (nicht in der App als Regel verwenden):** Hamburg (Fachanweisung § 22 SGB II, Stand 22.05.2026): Umzug unwirtschaftlich, wenn Kosten sich nicht in 36 Monaten amortisieren, generell bei Überschreitung bis 20 %; Nachweis: 2 dokumentierte Bemühungen pro Woche, monatlich vorlegen; vor der Aufforderung persönliches Gespräch; Frist 6 Monate ab Zugang.[^6] Die BA gibt zu § 22 SGB II keine Fachlichen Weisungen heraus (kommunale Leistung, § 6 Abs. 1 S. 1 Nr. 2 SGB II); in der Weisungsübersicht der BA steht keine Weisung zu § 22.[^13] Deshalb Hamburg als amtliches Beispiel einer kommunalen Weisung.

---

## 4. Bauplan

### 4.1 Erkennung (`erweiterungen/brief-lesen.js`)

**Neue Funktion `kostensenkung(text)`** (eigene Funktion statt neuer Eintrag in `ARTEN`, weil ein Kostensenkungsbrief vom Jobcenter in `erkenne()` sonst als `jc` gewinnt – Prototyp: JC-Testtext ergibt `jc` mit 11 Punkten). Rückgabe:

```js
// { ist: true|false, punkte, traeger: 'jc'|'sa'|null, heiz: bool, kostenIst, grenze, frist, stichtag, datum, anhoerung: bool }
const KS = [
  [/Kostensenkung|Senkung (der|Ihrer) (Unterkunfts|Wohn|Heiz)?(kosten|Aufwendungen)|(kosten|Aufwendungen)[^.\n]{0,30}zu senken/i, 6], // Kern
  [/unangemessen/i, 3],
  [/Angemessenheitsgrenze|Mietobergrenze|angemessene[nr]? (Aufwendungen|Kosten|Miete|Bruttokaltmiete|Heizkosten)|Richtwert/i, 3],
  [/Kosten der Unterkunft|Unterkunftskosten|Unterkunft und Heizung|Bruttokaltmiete/i, 2],
  [/§\s*22 Abs(?:atz|\.)?\s*1\b[^\n]{0,20}SGB II|§\s*35 Abs(?:atz|\.)?\s*[13]\b[^\n]{0,20}SGB XII/i, 4],
  [/(sechs|6) Monate/i, 2],
  [/Wohnungssuche|Bemühungen|Wohnungsangebote|Untervermietung/i, 2],
  [/Karenzzeit/i, 1]
];
const BESCHEID = [/Bewilligungszeitraum/i, /Berechnungsbogen|Berechnung der Leistung/i, /Zahlbetrag|Auszahlungsbetrag|Gesamtanspruch/i,
  /Rechtsbehelfsbelehrung/i, /hiermit (bewillige|bewilligt)|werden .{0,40}bewilligt/i];
// ist = Kern UND (unangemessen ODER Angemessenheit) UND punkte >= 9 UND weniger als 2 Bescheid-Merkmale
```

- `traeger` (korrigiert 20.11.2026: ein Jobcenter-Brief, der das SGB XII nur erwähnt, darf nicht als Sozialamt gelten): zuerst der Paragraf – `/§\s*35\b[^\n]{0,30}SGB XII/i` → `sa`, `/§\s*22\b[^\n]{0,30}SGB II\b/i` → `jc`; sonst `/Jobcenter/i` → `jc`; sonst `/Sozialamt|Amt für Soziales|Grundsicherung im Alter|SGB XII\b|Zwölfte[sn]? Buch/i` → `sa`; sonst `/SGB II\b|Zweite[sn]? Buch/i` → `jc`; sonst `null`. Bei `null` beide Paragrafen nennen und **keinen** Absender behaupten (Kopf bleibt die gewählte Kachel).
- `rechtsbehelf`: `/Rechtsbehelfsbelehrung|Widerspruch (erheben|einlegen|erhoben werden)/i` und nicht `/kein(en)? Widerspruch|Widerspruch (ist )?nicht (zulässig|möglich|statthaft)|kein Verwaltungsakt/i` → dann `el.ks.wsDoch` statt `el.ks.keinWs`.
- `keinVA`: `/kein Verwaltungsakt|kein Bescheid|Widerspruch (ist )?nicht (zulässig|möglich|statthaft)/i` → hebt die Bescheid-Merkmale auf (`ist` bleibt wahr), weil echte Hinweisschreiben seit § 22 Abs. 1a oft „Bewilligungszeitraum“ nennen.
- `heiz`: `/Heizkosten/` und keine Miet-Begriffe (`/Bruttokaltmiete|Kaltmiete|Mietobergrenze|Unterkunftskosten/i`). Risiko: Echte Heizkosten-Briefe schreiben oft „Kosten der Unterkunft und Heizung“; dann bleibt der allgemeine Titel „Wohnkosten“ – deshalb den Einfache-Sprache-Titel `el.ks.titel` besser neutral halten („Das Amt sagt: Deine Wohnung kostet zu viel“), wenn `heiz` unsicher ist.
- `kostenIst`: erster Betrag in einer Zeile mit `/tatsächliche|Ihre (Brutto)?kaltmiete|betragen/i`; `grenze`: letzter Betrag in Zeile mit `angemessen|Angemessenheitsgrenze|Mietobergrenze` ohne `unangemessen|übersteigt|tatsächlich`, sonst Zeile „übersteigt die angemessene …“ (letzter Betrag). Hilfsfunktion `betraege()` vorhanden.
- `frist`: vorhandenes `frist(text)`; `stichtag`: `/ab (?:dem )?(\d{1,2}\.\d{1,2}\.20\d{2})[^\n]{0,80}(nur noch|angemessen)/i`; `datum`: vorhandenes `bescheidDatum(zeilen(text))`.
- `anhoerung`: `ARTEN.anh`-Punkte ≥ 9 (Anhörung + § 24 SGB X) → dann bleibt die Art `anh` (Anhörungsfrist zählt), der KS-Kasten erscheint zusätzlich darunter.
- Export erweitern: `return { erkenne, lies, betraege, ERKLAERUNG, frist, andere, ARTEN, kostensenkung, kennungen: (text) => kennungen(zeilen(text), String(text || '')) };` – `kennungen()` ist bisher **nicht** exportiert (nur intern in `lies()`), und in der Kachel „Anderer Brief“ liefert `lies(text, 'an')` keine Stelle und kein Zeichen. `bescheidDatum` ebenfalls intern: in `kostensenkung()` direkt aufrufen.
- `frist`: `frist(text)` nimmt das erste „bis zum <Datum>“ im ganzen Text. Für die Anzeige die Zeile mitgeben (`andere(text).fristen` liefert `{ frist, zeile }`) und Zeilen mit `senk|Bemühung|Nachweis|Unterkunft|Heiz` bevorzugen; „innerhalb von sechs Monaten“ erkennt `frist()` nicht (nur Wochen) → `null`, das ist gewollt.
- `ERKLAERUNG` bleibt unverändert (deutsche Texte dort sind nur für `anh`/`mit`); die KS-Texte kommen aus i18n, damit 13 Sprachen + Einfache Sprache möglich sind.

Prototyp (in `/tmp`, nicht im Repo) mit den Testtexten aus 4.6: Kostensenkung JC 21 Punkte → erkannt; Sozialamt 17 → erkannt; Heizkosten 18 → erkannt, `heiz: true`; gekürzter Bescheid mit Verweis auf „Kostensenkungsaufforderung“ 11 Punkte, aber 4 Bescheid-Merkmale → **nicht** KS (bleibt `jc`); Anhörung, Nebenkostenabrechnung, Mieterhöhung, normaler JC-Bescheid → nicht KS. Beträge/Frist/Stichtag JC: 690 / 540 / 31.05.2027 / 01.06.2027; Sozialamt 610 / 495.

### 4.2 Ablauf in `src/app.js` → `textLesen(text)` (ca. Z. 3286–3322)

Direkt nach `var r = BriefLesen.lies(...)` und der `e0`-Prüfung (Z. 3290–3291):

```js
var ks = BriefLesen.kostensenkung ? BriefLesen.kostensenkung(text) : null;
if (ks && ks.ist && !ks.anhoerung && (!briefArt || briefArt === 'jc' || briefArt === 'sa' || briefArt === 'an')) {
  $('elErg').textContent = ''; ksZeigen(ks, text); elNachricht(t('el.erkanntOhne', { titel: t(ks.heiz ? 'el.ks.titelHeiz' : 'el.ks.titel') })); return;
}
```

- Muss **vor** dem Zweig `briefArt === 'an'` (Z. 3294) stehen, sonst landet ein KS-Brief in „Anderer Brief“ (`PruefpaketAndere.zeige`).
- Im Anhörungs-Zweig (Z. 3296–3302): nach `$('elErg').appendChild(d)` zusätzlich `if (ks && ks.ist) ksZeigen(ks, text);`.
- Ohne Kachel (`briefArt === null`): Dieser Fall ist in der App derzeit **nicht erreichbar** – `elPlatz()` (Z. 3263–3271) blendet den Einlese-Kasten ohne Kachel aus (`box.hidden = true`), `textLesen` läuft also immer mit gesetzter `briefArt`. Der Zweig bleibt nur als Absicherung: `if (!briefArt && ks.traeger) briefOeffnen(ks.traeger)`; **kein** `|| 'jc'` (sonst behauptet die App einen Absender, den sie nicht kennt). `briefOeffnen` leert `elErg` nur bei Wechsel der Kachel (Z. 3233) – erst öffnen, dann zeigen.
- In der Kachel bleibt der Kopf, wie gewählt („Brief von: Jobcenter“). Weicht `ks.traeger` davon ab (Sozialamt-Brief in der Jobcenter-Kachel), richtet sich nur der Inhalt (Paragrafen, Detail `el.ks.d.sa`) nach `ks.traeger`.
- Kein `briefFormular()`: das Bescheid-Formular bleibt zu (`pp-zu`), „Werte selbst eingeben“ bleibt sichtbar.

**Neue Funktion `ksZeigen(ks, text)`** (neben `textLesen`, ca. Z. 3323): baut in `$('elErg')` einen Block `div.el-erkl.el-ks` mit
1. `<b>` Titel, `<p>` `el.ks.kern`, ggf. `el.ks.zahlen`, `el.ks.frist`, `el.ks.stichtag`;
2. `<p class="el-ks-ws">` `el.ks.keinWs` (Hintergrund `--na-bg`, Info);
3. `<h3>` `el.ks.tun.h` + `<ul>` mit den vier `el.ks.tun.*`-Punkten. Die Sternchen aus Abschnitt 2.2 sind nur Schreibweise des Entwurfs: je Punkt **zwei Schlüssel** anlegen (`el.ks.tun.gruende.t` = fetter Anfang, `el.ks.tun.gruende` = Text) und beide per `textContent` setzen (`<b>` + Textknoten). Kein `innerHTML`, auch nicht für die Zeile aus dem Brief (`{frist}`-Beleg) und nicht für `{stelle}`/`{zeichen}` (kommen aus dem eingelesenen Brief = fremder Text);
4. sechs `<details>` (`el.ks.d.*`), `el.ks.d.sa` nur bei `traeger === 'sa'`, `el.ks.d.heiz` zuerst, wenn `heiz`;
5. Knopfgruppe `.btns`: „Antwort entwerfen“ (`.btn`), „Frist übernehmen“ (`.btn` sekundär/`.chip`, nur wenn `window.FristenOrdner && FristenOrdner.hinzu`) ;
6. `<p class="note">` `el.ks.hinweis`.

**Antwort-Entwurf:** Klick blendet ein kleines Formular ein: Checkboxen `ks-g-krank … ks-g-grenze` (Beschriftung `el.ks.g.*`, Texte siehe 2.6, kurz), Freitextfeld Bemühungen (`ks-bem`), Textfeld `ks-text` (Ergebnis) und Kopieren-Knopf `ks-copy`. Danach in `SCHREIBEN` (Z. 1445) eintragen: `['ks-text', 'ks-copy', 'Stellungnahme-Wohnkosten', 'amt']`. **Korrektur (Prüfung 20.11.2026): Das reicht nicht.** `schreibenKnoepfe()` (Z. 1484 ff.) läuft einmal beim Start und überspringt Einträge, deren Elemente es noch nicht gibt (`if (!ta || !copy) return;`); `ks-text`/`ks-copy` entstehen aber erst in `ksZeigen`, und `elErg` wird bei jedem Einlesen geleert. Zwei Wege: (a) den Rumpf der Schleife als `schreibenKnopf(x)` herauslösen und in `ksZeigen` nach dem Anlegen der Elemente aufrufen (kleiner Umbau, empfohlen), oder (b) Textfeld und Kopieren-Knopf fest in `src/template.html` außerhalb von `elErg` anlegen. In beiden Fällen muss `ks-text` über das Attribut `hidden` ein- und ausgeblendet werden (der `MutationObserver` in Z. 1503 beobachtet nur `hidden`). Die Knopftexte dort („Als PDF teilen“, „Drucken“) und `ABGEBEN.amt` sind fest deutsch – für 13 Sprachen entweder übersetzen oder hinnehmen wie im übrigen Prüfpaket (`ppNurDe`). `ABGEBEN.amt` sagt „vor Ablauf der Frist abgeben“ – passt.

**Frist übernehmen:** Schnittstelle zum Modul aus **b-fristen** (dort zu definieren; hier nur Vorschlag):
```js
FristenOrdner.hinzu({ art: 'kostensenkung', datum: 'JJJJ-MM-TT', titel: t('el.ks.titel'), stelle: ks.traeger, quelle: 'brief', notiz: t('el.ks.tun.belege') })
```
Ist kein Datum erkannt, fragt ein Datumsfeld (`el.ks.frist.datum`) nach. **Keine** selbst berechnete Frist („6 Monate ab Zugang“): Beginn und Länge legt das Amt fest; die Karenzzeit verschiebt den Beginn.[^1] Speicherung übernimmt b-fristen (im Vorgang, mit PIN verschlüsselt über `src/vorgaenge.js`). b-kostensenkung legt **keinen** eigenen Speicherschlüssel an. Achtung für b-fristen: `window.FristenOrdner` gibt es im Code noch nicht, und der alte Schlüssel `lotse.fristen` wird bei jedem Start gelöscht (`Store.remove('lotse.fristen')`, `src/app.js` Z. 3401) – dort einen neuen Schlüsselnamen wählen. In der `notiz` keinen langen i18n-Text mit Hervorhebung speichern, nur einen kurzen Titel.

**Optional Stufe 2 (nicht in diesem Auftrag bauen):** Liste der Bemühungen (Datum, was, Ergebnis) im Vorgang unter neuem Schlüssel `lotse.kostensenkung` (Eintrag in `DATEN`, `src/vorgaenge.js` Z. 7, und `STORE_SCHLUESSEL`, `src/app.js` Z. 2118) mit Anlage-Ausgabe als PDF. Konfliktrisiko mit b-fristen, die `DATEN` ebenfalls ändert.

### 4.3 Bescheid-Prüfung ergänzen (klein)

`erweiterungen/bescheid-sgb2.js` Z. 97: Der Hinweis nennt schon die vorherige Aufforderung. Ergänzen (deutsch, wie dort üblich): „… In der Karenzzeit (erstes Jahr) wird die Miete ohne Heizung in der Regel bis zum Eineinhalbfachen der Grenze übernommen (§ 22 Abs. 1 Satz 2, 3 und 6 SGB II, seit 1.7.2026); Ausnahmen: Mietpreisbremse, örtliche Quadratmeter-Obergrenze (Satz 8), frühere Kürzung für dieselbe Wohnung (§ 65 Abs. 4 SGB II).“ Entsprechend `erweiterungen/bescheid-gsa.js` mit § 35 SGB XII prüfen. (Nur Vorschlag; Datei gehört zum Prüfpaket, das nur deutsch ist, `ppNurDe`.)

### 4.4 i18n-Schlüssel

Neu in `src/lang/de.json` (und Übersetzung in en, ar, fa, fa-AF, fr, pl, ps, ro, ru, so, tr, uk) und `src/lang/einfach/d.json`:

`el.ks.titel`, `el.ks.titelHeiz`, `el.ks.kern`, `el.ks.zahlen`, `el.ks.frist`, `el.ks.stichtag`, `el.ks.keinWs`, `el.ks.tun.h`, `el.ks.tun.gruende`, `el.ks.tun.belege`, `el.ks.tun.beratung`, `el.ks.tun.umzug`, `el.ks.d.karenz.h`, `el.ks.d.karenz`, `el.ks.d.heiz.h`, `el.ks.d.heiz`, `el.ks.d.wirt.h`, `el.ks.d.wirt`, `el.ks.d.tod.h`, `el.ks.d.tod`, `el.ks.d.mpb.h`, `el.ks.d.mpb`, `el.ks.d.sa.h`, `el.ks.d.sa`, `el.ks.hinweis`, `el.ks.frist.btn`, `el.ks.frist.ok`, `el.ks.frist.datum`, `el.ks.antwort.btn`, `el.ks.antwort.hinweis`, `el.ks.g.krank`, `el.ks.g.pflege`, `el.ks.g.kinder`, `el.ks.g.schwanger`, `el.ks.g.alter`, `el.ks.g.kurz`, `el.ks.g.tod`, `el.ks.g.wirt`, `el.ks.g.heiz`, `el.ks.g.grenze`, `el.ks.bem`; ergänzt in der Prüfung 20.11.2026: `el.ks.deckel`, `el.ks.wsDoch`, `el.ks.tun.gruende.t`, `el.ks.tun.belege.t`, `el.ks.tun.beratung.t`, `el.ks.tun.umzug.t`.

Vorschlag Kurztexte Checkboxen (de / einfach):
`el.ks.g.krank` „Krankheit oder Behinderung“ / „Ich bin krank oder habe eine Behinderung“ · `el.ks.g.pflege` „Pflege (ich werde gepflegt oder pflege jemanden)“ / „Ich werde gepflegt oder pflege jemanden“ · `el.ks.g.kinder` „Kinder in Kita oder Schule hier“ / „Meine Kinder gehen hier in Kita oder Schule“ · `el.ks.g.schwanger` „Schwangerschaft“ / „Ich bin schwanger“ · `el.ks.g.alter` „Lange Wohndauer, Alter“ / „Ich wohne schon lange hier oder bin alt“ · `el.ks.g.kurz` „Ich brauche bald keine Leistung mehr“ / „Ich brauche bald kein Geld mehr vom Amt“ · `el.ks.g.tod` „Todesfall im Haushalt“ / „Jemand aus meinem Haushalt ist gestorben“ · `el.ks.g.wirt` „Miete nur wenig über der Grenze“ / „Meine Miete ist nur ein bisschen zu hoch“ · `el.ks.g.heiz` „Gründe für hohe Heizkosten“ / „Darum heize ich mehr“ · `el.ks.g.grenze` „Ich will wissen, wie die Grenze berechnet ist“ / „Wie rechnet das Amt die Grenze?“ · `el.ks.bem` „Was ich schon getan habe (Wohnungssuche, Vermieter gefragt …)“ / „Was hast du schon gemacht?“

In `test/sprachen-zahlen-ausnahmen.json` nichts nötig, solange „6“, „12“, „1,5“ und Paragrafen in allen Sprachen als Ziffern stehen (bei „Eineinhalbfache“ in Übersetzungen „1.5“ bzw. „1,5“ schreiben oder Ausnahme eintragen – Hinweis an Übersetzung).

### 4.5 Farben (nur Palette aus `docs/FARBEN.md`)

| Element | Variable | Warum |
|---|---|---|
| Erklärkasten | `.el-erkl` = `--warn-bg` (vorhanden, Z. 755 `template.html`) | Warnung/„möglich“ |
| Zeile „kein Widerspruch gegen diesen Brief“ | `--na-bg` / Schrift `--na` | Info |
| Linker Rand des Kastens | `--c-jobcenter-t` bzw. `--c-sozialamt-t` je `traeger` (Petrol-Schrift / Indigo-Schrift) | gleiche Sache = gleiche Farbe wie Absender-Kachel |
| Knöpfe „Antwort entwerfen“ / „Frist übernehmen“ | `.btn` (`--accent`) und `.chip` (Rand `--accent`, keine Fläche) | Bedienfarbe; keine neue Kachelgruppe, keine Farbe doppelt als Fläche |
| `<details>`-Überschriften | wie vorhandene `<details>` (Z. 1484) | — |

Keine neue Startkachel, keine neue Absender-Kachel, keine neue `/* gruppe */`-Regel → `tools/kontrast-pruefen.js` braucht keine neue Anzahl. Neue CSS-Regeln nur mit Variablen (z. B. `.el-ks { border-inline-start: 4px solid var(--c-jobcenter-t); } .el-ks[data-traeger="sa"] { border-inline-start-color: var(--c-sozialamt-t); } .el-ks-ws { background: var(--na-bg); color: var(--na); border-radius: 8px; padding: 6px 10px; }`).

### 4.6 Tests

**`test/erweiterungen/test-brief-lesen.js`** (ergänzen; Testtexte wie im Prototyp):

```js
const KS_JC = `Jobcenter Musterstadt
Musterstadt, den 03.11.2026
BG-Nummer: 123A1234567
Aufforderung zur Senkung der Kosten der Unterkunft (§ 22 Abs. 1 SGB II)
Ihre tatsächlichen Aufwendungen für die Unterkunft (Bruttokaltmiete) betragen 690,00 EUR monatlich.
Für einen Haushalt mit 2 Personen ist in Musterstadt eine Bruttokaltmiete von 540,00 EUR angemessen (Angemessenheitsgrenze).
Ihre Kosten sind damit unangemessen. Die Karenzzeit endete am 31.10.2026.
Wir bitten Sie, Ihre Unterkunftskosten bis zum 31.05.2027 zu senken, z. B. durch Umzug, Untervermietung oder Verhandlung mit dem Vermieter.
Ab dem 01.06.2027 werden nur noch die angemessenen Kosten in Höhe von 540,00 EUR berücksichtigt.
Bitte weisen Sie Ihre Bemühungen (Wohnungssuche) monatlich nach.
Grundsicherungsgeld nach dem Zweiten Buch Sozialgesetzbuch`;
const KS_SA = `Landratsamt Musterkreis – Sozialamt
Grundsicherung im Alter und bei Erwerbsminderung nach dem SGB XII
Hinweis zur Angemessenheit Ihrer Unterkunftskosten (§ 35 Abs. 3 SGB XII)
Ihre Bruttokaltmiete von 610,00 € übersteigt die angemessene Miete von 495,00 € für einen Einpersonenhaushalt.
Die Aufwendungen werden längstens für sechs Monate in tatsächlicher Höhe übernommen.
Wir fordern Sie auf, Ihre Kosten zu senken.`;
const KS_HEIZ = `Jobcenter Musterstadt
Ihre Heizkosten sind unangemessen hoch
Nach der Prüfung Ihrer Heizkostenabrechnung liegen Ihre Heizkosten über den angemessenen Heizkosten.
Wir bitten Sie, Ihre Heizkosten zu senken. Nach Ablauf von sechs Monaten werden nur noch die angemessenen Heizkosten anerkannt (§ 22 Abs. 1 SGB II).`;
const BESCHEID_GEKUERZT = `Jobcenter Musterstadt
Datum: 12.06.2027
Bescheid über Grundsicherungsgeld nach dem SGB II
Bewilligungszeitraum 01.06.2027 bis 30.11.2027
Berechnungsbogen
Regelbedarf 563,00
Kosten der Unterkunft und Heizung 610,00
Die Unterkunftskosten werden nach Ablauf der Frist aus unserer Kostensenkungsaufforderung vom 03.11.2026 nur noch in angemessener Höhe berücksichtigt; die tatsächlichen Kosten sind unangemessen.
Zahlbetrag 1.173,00
Rechtsbehelfsbelehrung: Gegen diesen Bescheid kann innerhalb eines Monats Widerspruch erhoben werden.`;
const ANH_KS = `Jobcenter Musterstadt
Anhörung nach § 24 SGB X
Ihre Unterkunftskosten sind unangemessen. Wir beabsichtigen, die Kosten zu senken. Sie haben Gelegenheit, sich bis zum 30.04.2027 zu äußern.`;
```

Testfälle:
1. `kostensenkung(KS_JC)`: `ist`, `traeger === 'jc'`, `kostenIst === 690`, `grenze === 540`, `frist === '31.05.2027'`, `stichtag === '01.06.2027'`, `heiz === false`, `datum === '2026-11-03'`.
2. `kostensenkung(KS_SA)`: `ist`, `traeger === 'sa'`, `kostenIst === 610`, `grenze === 495`, `frist === null`.
3. `kostensenkung(KS_HEIZ)`: `ist`, `heiz === true`.
4. `kostensenkung(BESCHEID_GEKUERZT).ist === false` und `erkenne(...).art === 'jc'` (Bescheid-Prüfung bleibt).
5. `kostensenkung(ANH_KS)`: `ist === true`, `anhoerung === true`; `erkenne(ANH_KS).art === 'anh'`.
6. Negativ: vorhandene Texte `JC`, `NK`, `WG`, `KIZ`, `GSA` und „Mieterhöhung … angemessen“ → `ist === false` (kein „unangemessen“-Fehlalarm bei „angemessen“).
7. OCR-Variante: `KS_JC` mit `690,00` als `690, 00`/Zeilenumbruch mitten im Satz → mindestens `ist === true` (Beträge dürfen fehlen).

8. `rechtsbehelf`: `KS_JC` + Zeile „Rechtsbehelfsbelehrung: Gegen diesen Bescheid kann Widerspruch erhoben werden.“ → `ist === true`, `rechtsbehelf === true` (App zeigt `el.ks.wsDoch`, nicht `el.ks.keinWs`).
9. `keinVA`: `KS_JC` + „Bewilligungszeitraum … bewilligt“ + „Dieses Schreiben ist kein Verwaltungsakt.“ → `ist === true`.
10. `traeger`: Jobcenter-Brief mit „§ 22 Abs. 1 SGB II“ und dem Satz „Leistungen nach dem SGB XII erhalten Sie nicht“ → `traeger === 'jc'`.
11. Deckel: `KS_JC` mit 900,00 statt 690,00 → App zeigt `el.ks.deckel` (900 > 1,5 × 540 = 810).

**`test/e2e-briefe.js`** (ergänzen; korrigiert: Einlesen gibt es nur in einer Kachel, `elPlatz()`): Kachel „Jobcenter“ öffnen, Text `KS_JC` in „Text einfügen“ → Kopf „Brief von: Jobcenter“, Kasten `.el-ks` sichtbar, Bescheid-Formular `#p-bescheid.pp-zu` bleibt zu, Text enthält „noch keine Kürzung“; in Kachel „Anderer Brief“ → ebenfalls `.el-ks` (nicht `PruefpaketAndere`); Klick „Antwort entwerfen“ + Haken „Kinder“ → `#ks-text` enthält „Kita bzw. Schule“ und „§ 22 Abs. 1 SGB II“; bei `KS_SA` „§ 35 Abs. 3 SGB XII“ und **nicht** „SGB II“. Einfache Sprache an → Titel „Das Amt sagt: Deine Miete ist zu hoch“. Sprache `ar` → `dir="rtl"`, keine fehlenden Schlüssel.
**`test/a11y.js`**: `.el-ks` ohne Kontrastfehler hell/dunkel; `<details>` per Tastatur bedienbar.
Bestehende Prüfungen, die automatisch greifen: `test-sprachen-zahlen.js` (Zahlen in allen Sprachen), Vollständigkeit der Sprachdateien, `tools/kontrast-pruefen.js` (keine verstreuten Farbwerte).

### 4.7 Konfliktrisiko mit anderen Aufgaben

| Datei / Stelle | Wer noch | Risiko |
|---|---|---|
| `src/app.js` `textLesen()` Z. 3286 ff. | b-fristen (Frist aus Brief übernehmen?), evtl. andere Brief-Erweiterungen | **hoch** – gleiche Funktion; Einfügepunkt klein halten (ein `if` + `ksZeigen`) |
| `src/app.js` `SCHREIBEN` Z. 1445 | — | gering (eine Zeile) |
| Fristen-Schnittstelle (`FristenOrdner.hinzu`) | **b-fristen** besitzt Speicher und Ansicht | mittel – Namen/Felder mit b-fristen abstimmen; bis dahin Knopf ausgeblendet |
| `src/vorgaenge.js` `DATEN` | b-fristen (eigener Schlüssel), b-schuldenliste, b-energie | nur bei Stufe 2; hier nicht anfassen |
| `src/lang/*.json`, `einfach/d.json` | alle Aufgaben | mittel (Merge-Konflikte an Dateienden); Schlüssel als Block unter `el.*` einfügen |
| `src/template.html` CSS | b-energie, b-mietgrenze | gering (neue Klassen `.el-ks*`) |
| `erweiterungen/brief-lesen.js` | evtl. b-fristen (Fristerkennung) | mittel; nur neue Funktion + Export |
| Inhalt Karenzzeit/1,5-fach | **b-mietgrenze** (Wohngeld, `t.kdu.angemessen`) | inhaltlich abstimmen: `t.kdu.angemessen` sagt schon „im ersten Jahr höchstens das Eineinhalbfache“ – stimmt mit § 22 Abs. 1 S. 6 überein; Ausnahme Kinder fehlt dort |
| `erweiterungen/bescheid-sgb2.js` Z. 97 | — | gering |

---

## 5. Offene Fragen und Unsicherheiten

1. **Rechtsnatur nach der Reform:** Die BSG-Rechtsprechung (kein Verwaltungsakt) stammt von 2006/2008 zur alten Fassung. Der neue § 22 Abs. 1a SGB II nennt die Mitteilung laut Gesetzesbegründung eine „Information“ zur Aufklärung[^8] – spricht für Fortgeltung, ist aber **möglich**, nicht sicher. Einzelne Ämter erlassen die Mitteilung als Teil des Bescheids (im SGB XII „mit dem ersten Bewilligungsbescheid“, § 35 Abs. 2); dann kann ein Widerspruch gegen den Bescheid möglich sein. Text daher „in der Regel“.
2. **Übergang 1.7.2026:** § 65a SGB II enthält keine KdU-Übergangsregel (nur § 12, §§ 31 ff., Begriff „Bürgergeld“). Gesetzesbegründung BT-Drs. 21/3541 und Beschlussempfehlung 21/4522 am 20.11.2026 durchsucht: kein Bestandsschutz für laufende Karenzzeiten, der Deckel soll „ab dem ersten Tag des Leistungsbezuges“ und „unabhängig von der Karenzzeit“ gelten. Naheliegend ist daher die Anwendung ab 1.7.2026 auch auf vorher begonnene Karenzzeiten (für laufende Bewilligungen bräuchte das Amt einen Änderungsbescheid) – aber nicht ausdrücklich geregelt und noch nicht entschieden → in der App nur „möglich“, nicht berechnen. Ebenfalls offen: ob der Deckel auch nach der Karenzzeit während der 6 Monate (Satz 9) gilt; Wortlaut („abweichend von den Sätzen 1 bis 3“, Halbsatz 2) und Begründung sprechen dafür.
3. **Quellen BSG (Prüfung 20.11.2026):** Amtlich belegt ist die Aussage jetzt über BSG, Urteil vom 21.07.2021 – B 14 AS 31/20 R (bsg.bund.de, Volltext abgerufen), das die Linie von 2006/2008 wörtlich bestätigt und B 7b AS 10/06 R zitiert. Die beiden alten Urteile selbst: bsg.bund.de führt Entscheidungen erst ab 2018; rechtsprechung-im-internet.de war am 20.11.2026 nicht erreichbar (Verbindung abgebrochen) und beginnt 2010; sozialgerichtsbarkeit.de führt B 7b AS 10/06 R (Dokument 64144), lässt automatischen Abruf aber nicht zu (robots.txt) – nicht umgangen. Der Wortlaut „keine Verwaltungsaktqualität“ aus B 14/7b AS 70/06 R ist daher nur nicht-amtlich (lexetius) gelesen; Fundstellen SozR 4-4200 § 22 Nr 8 (2008) und Nr 2 (2006) sind durch die amtlichen BSG-Texte von 2019 und 2021 bestätigt.
4. **Keine BA-Weisung zu § 22:** Die BA veröffentlicht keine Fachlichen Weisungen zu § 22 SGB II (kommunale Zuständigkeit). Alle Verfahrensdetails (Gespräch vorher, Nachweis-Takt, Wirtschaftlichkeitsrechnung, 20-%-Grenze) sind **örtlich**; Hamburg nur als Beispiel. Die App nennt keine dieser Zahlen als allgemeine Regel.
5. **Beginn der 6 Monate:** Gesetz sagt nur „in der Regel längstens sechs Monate“; Hamburg rechnet ab Zugang der Aufforderung. Deshalb keine eigene Fristberechnung, nur das Datum aus dem Brief.
6. **Bundesrats-Entwurf BT-Drs. 21/5509** (Umzugskosten, Pauschalen): Verfahrensstand am 20.11.2026 nicht gefunden → nicht in die App, nur beobachten.
7. **Gesamtangemessenheitsgrenze (Miete + Heizung):** im SGB II nach § 22 Abs. 10, im SGB XII § 35 Abs. 7 zulässig, aber nur, wenn der Träger sie bildet → Text „möglicherweise“.
8. **Schnittstelle zu b-fristen** (Name `FristenOrdner`, Felder) muss dort festgelegt werden; bis dahin Knopf verborgen.
9. **Übersetzung „Eineinhalbfache“** in 12 Sprachen: als Ziffer „1,5“/„1.5“ schreiben, sonst schlägt `test-sprachen-zahlen.js` an (oder Ausnahme eintragen).
10. **Anhörung mit Kostensenkung** (Testfall `ANH_KS`): Reihenfolge der beiden Kästen (Anhörung zuerst, weil deren Frist zählt) bitte bei der Umsetzung mit dem Nutzer bestätigen.

---

### Quellen (alle abgerufen am 20.11.2026)

[^1]: § 22 SGB II (aktuelle Fassung): https://www.gesetze-im-internet.de/sgb_2/__22.html
[^2]: § 35 SGB XII: https://www.gesetze-im-internet.de/sgb_12/__35.html
[^3]: Amtlich: BSG, Urteil vom 21.07.2021 – B 14 AS 31/20 R („Bei der Kostensenkungsaufforderung handelt es sich (lediglich) um ein Informationsschreiben mit Aufklärungs- und Warnfunktion“, unter Verweis auf BSG vom 07.11.2006 – B 7b AS 10/06 R, BSGE 97, 231 = SozR 4-4200 § 22 Nr 2, RdNr 29): https://www.bsg.bund.de/SharedDocs/Entscheidungen/DE/2021/2021_07_21_B_14_AS_31_20_R.html · ebenso BSG, Urteil vom 19.05.2021 – B 14 AS 57/19 R (Aufklärungs- und Warnfunktion, auch bei Heizkosten): https://www.bsg.bund.de/SharedDocs/Entscheidungen/DE/2021/2021_05_19_B_14_AS_57_19_R.html · BSG, Urteil vom 30.01.2019 – B 14 AS 11/18 R (zitiert B 14/7b AS 70/06 R als SozR 4-4200 § 22 Nr 8 RdNr 15 f.): https://www.bsg.bund.de/SharedDocs/Entscheidungen/DE/2019/2019_01_30_B_14_AS_11_18_R.html · Ursprung: BSG, Urteil vom 27.02.2008 – B 14/7b AS 70/06 R („Informationsschreiben …, dem keine Verwaltungsaktqualität zukommt“), Volltext nur nicht amtlich gelesen: https://lexetius.com/2008,1460 · BSG, Urteil vom 07.11.2006 – B 7b AS 10/06 R, amtliches Portal der Sozialgerichtsbarkeit (automatischer Abruf gesperrt, im Browser öffnen): https://www.sozialgerichtsbarkeit.de/legacy/64144
[^4]: § 22 Abs. 4–6 SGB II: https://www.gesetze-im-internet.de/sgb_2/__22.html
[^5]: wie [^1]; Karenzzeit eingeführt durch Bürgergeld-Gesetz vom 16.12.2022 (BGBl. I S. 2328), Gesetzentwurf BT-Drs. 20/3873: https://dserver.bundestag.de/btd/20/038/2003873.pdf
[^6]: Freie und Hansestadt Hamburg, Sozialbehörde, Fachanweisung § 22 SGB II (Stand 22.05.2026), Ziffern 6–6.8 (Beispiel einer kommunalen Weisung): Seite https://www.hamburg.de/politik-und-verwaltung/behoerden/sozialbehoerde/rechtliche-grundlagen/infoline/fachliche-vorgaben-und-hinweise/sgb-ii-grundsicherung-fuer-arbeitsuchende/fa-sgbii-22-kdu-45744 · PDF https://dokumente.hamburg.de/resource/blob/46622/a81471fb2df41a856600cb3507f32519/fa-sgbii-22-kdu-00-pdf-data.pdf
[^7]: Dreizehntes Gesetz zur Änderung des Zweiten Buches Sozialgesetzbuch und anderer Gesetze vom 16.04.2026, BGBl. 2026 I Nr. 107 (ausgegeben 22.04.2026); Art. 1 Nr. 20 (§ 22 SGB II), Art. 1 Nr. 42 (§ 65a), Art. 9 Nr. 1–3 (§§ 35, 35a, 42a SGB XII), Art. 12 Abs. 1 (Inkrafttreten 1.7.2026): https://www.recht.bund.de/bgbl/1/2026/107/VO.html · Gesetzesbeschluss BR-Drs. 116/26: https://dserver.bundestag.de/brd/2026/0116-26.pdf · Bundesregierung „Neue Grundsicherung löst Bürgergeld ab“ (1.7.2026): https://www.bundesregierung.de/breg-de/aktuelles/neue-grundsicherung-2399562
[^8]: Gesetzentwurf der Bundesregierung, BT-Drs. 21/3541, Begründung zu Art. 1 Nr. 20 (S. 67–68): https://dserver.bundestag.de/btd/21/035/2103541.pdf · Beschlussempfehlung BT-Drs. 21/4522: https://dserver.bundestag.de/btd/21/045/2104522.pdf
[^9]: § 35a SGB XII: https://www.gesetze-im-internet.de/sgb_12/__35a.html
[^10]: § 41 SGB II: https://www.gesetze-im-internet.de/sgb_2/__41.html
[^11]: § 42a SGB XII: https://www.gesetze-im-internet.de/sgb_12/__42a.html
[^12]: Gesetzentwurf des Bundesrates „Entwurf eines Gesetzes zur Entlastung der Sozialverwaltung“, BT-Drs. 21/5509 vom 22.04.2026: https://dserver.bundestag.de/btd/21/055/2105509.pdf
[^13]: Bundesagentur für Arbeit, Weisungen SGB II (Übersicht, keine Weisung zu § 22): https://www.arbeitsagentur.de/ueber-uns/veroeffentlichungen/gesetze-und-weisungen/sgbii-grundsicherung
[^14]: § 65 Abs. 2 und 4 SGB II: https://www.gesetze-im-internet.de/sgb_2/__65.html · § 140 SGB XII: https://www.gesetze-im-internet.de/sgb_12/__140.html
[^15]: Landkreis Leipzig, Kommunales Jobcenter, „Änderungen im SGB II – neues Grundsicherungsgeld ab 1. Juli 2026“ (Nr. 4: mehr als 50 % über dem Richtwert → „ohne Übergangszeit“ nur noch bis zur Obergrenze; Beispiel eines kommunalen Trägers): https://www.landkreisleipzig.de/files/user_upload/Landkreis/Jobcenter/Aktuelles/AEnderungen_im_SGB_II_ab_1.7.2026.pdf
[^16]: § 65a SGB II: https://www.gesetze-im-internet.de/sgb_2/__65a.html

---

## Prüfvermerk Fable (20.11.2026)

Unabhängige Prüfung. Selbst abgerufen am 20.11.2026: §§ 22, 41, 65, 65a SGB II, §§ 35, 35a, 42a, 140 SGB XII (gesetze-im-internet.de), BGBl. 2026 I Nr. 107 (Regelungstext-PDF, recht.bund.de), BT-Drs. 21/3541 und 21/4522 (Volltext durchsucht), BT-Drs. 21/5509 (Deckblatt), BSG-Urteile auf bsg.bund.de, Fachanweisung Hamburg (PDF), BA-Weisungsübersicht, Merkblatt Landkreis Leipzig. Code gelesen: `erweiterungen/brief-lesen.js` (ganz), `src/app.js` (`textLesen`, `briefOeffnen`, `elPlatz`, `SCHREIBEN`/`schreibenKnoepfe`), `src/vorgaenge.js` Kopf, `test/test-sprachen-zahlen.js`. Der Prototyp der Erkennung wurde nicht erneut ausgeführt, nur gegen den Code gelesen.

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Kernaussage „Das ist noch keine Kürzung … volle Miete noch 6 Monate“ stimmt nicht für den Teil der Miete über dem 1,5-fachen: Der wird seit 1.7.2026 ab dem ersten Tag nicht anerkannt, ohne Kostensenkungsverfahren und ohne 6 Monate. Einfache Sprache versprach „Du bekommst noch dein Geld für die Miete“. | **Fehler** (falsche Zusage) | `el.ks.kern` auf „in der Regel“ umgestellt, neuer Schlüssel `el.ks.deckel` (sichtbar bei ist > 1,5 × Grenze oder wenn der Brief es nennt), Detail Karenzzeit und Tabelle ergänzt, Kurzfassung angepasst | § 22 Abs. 1 S. 6 SGB II; BT-Drs. 21/3541 S. 67; Landkreis Leipzig[^15] |
| „Kein Widerspruch möglich“ wurde auch gezeigt, wenn der Brief selbst eine Rechtsbehelfsbelehrung enthält (ein Bescheid-Merkmal allein schließt die Erkennung nicht aus). Dann läuft möglicherweise eine Monatsfrist. | **Fehler** (Fristversäumnis möglich) | neuer Text `el.ks.wsDoch`, Erkennungsmerkmal `rechtsbehelf`, Testfall 8 | § 84 Abs. 1 SGG; § 35 Abs. 2 SGB XII (Mitteilung „mit dem ersten Bewilligungsbescheid“) |
| Bauplan: Eintrag in `SCHREIBEN` erzeugt **keine** Teilen/Drucken-Knöpfe, weil `schreibenKnoepfe()` nur einmal beim Start läuft und die Elemente `ks-text`/`ks-copy` dann noch fehlen. | **Fehler** (nicht baubar wie beschrieben) | zwei Wege beschrieben (Funktion herauslösen oder festes Markup) | `src/app.js` Z. 1484–1503 |
| Bauplan: `kennungen()` ist nicht exportiert; in der Kachel „Anderer Brief“ gibt es weder Stelle noch Zeichen. | **Fehler** | Export ergänzt | `erweiterungen/brief-lesen.js` Z. 147–157, 189 |
| Bauplan/Test: „Text einfügen ohne Kachel“ gibt es nicht (`elPlatz()` blendet das Einlesen ohne Kachel aus). `briefOeffnen(ks.traeger || 'jc')` hätte bei unbekanntem Absender „Jobcenter“ behauptet. | **Fehler** | Zweig und e2e-Test korrigiert, kein Standard-Absender | `src/app.js` Z. 3263–3271; Regel „nie unsicheren Empfänger“ |
| `traeger`: Reihenfolge machte jeden Jobcenter-Brief, der „SGB XII“ oder „Sozialamt“ erwähnt, zum Sozialamt-Brief (falscher Paragraf im Schreiben). | Risiko | Reihenfolge: Paragraf → „Jobcenter“ → Sozialamt-Wörter; Testfall 10 | eigener Abgleich mit `ARTEN` |
| Erkennung schließt echte Hinweisschreiben aus, die „Bewilligungszeitraum“ und „bewilligt“ nennen (seit § 22 Abs. 1a häufiger). | Risiko | Merkmal `keinVA` hebt Bescheid-Merkmale auf; Testfall 9 | § 22 Abs. 1a SGB II |
| `frist(text)` nimmt das erste „bis zum <Datum>“ im Text – kann ein anderes Datum sein und stünde dann als „Frist im Brief“ da. | Risiko | Zeile aus dem Brief als Beleg mit anzeigen, passende Zeilen bevorzugen | `brief-lesen.js` Z. 164 |
| Musterstellungnahme behauptete Dinge, die der Nutzer nicht bestätigt hat: „Ich bemühe mich …“ (immer), „Attest lege ich bei“, „Wechsel mitten im Schuljahr“, „Kosten waren davor angemessen“. | Risiko (falsche Erklärung gegenüber dem Amt) | Sätze bedingt bzw. als Bitte um Prüfung formuliert; Satz-genaue Paragrafen (S. 11, S. 12 / § 35 Abs. 3 S. 3, S. 4) | § 22 Abs. 1 S. 11–12 SGB II; § 35 Abs. 3 S. 3–4 SGB XII |
| Einfache Sprache Todesfall: Bedingung „Kosten vorher angemessen“ fehlte. | Fehler (klein) | ergänzt | § 22 Abs. 1 S. 11 SGB II |
| „Die 6 Monate beginnen erst nach dem ersten Jahr“ gilt nicht bei Mietpreisbremse/qm-Obergrenze (Verfahren schon in der Karenzzeit) und nicht bei früherer Kürzung für dieselbe Wohnung. | Fehler (klein) | „in der Regel“, § 65 Abs. 4 SGB II / § 140 SGB XII in Text und Tabelle | § 22 Abs. 1 S. 8 SGB II; § 65 Abs. 4 SGB II; BT-Drs. 21/3541 S. 67–68 |
| Übergangsrecht: Entwurf nannte nur „nicht geregelt“. Begründung durchsucht: kein Bestandsschutz, Deckel „ab dem ersten Tag“, „unabhängig von der Karenzzeit“. | Hinweis | Tabellenzeile und offene Frage 2 präzisiert; bleibt „möglich“ | § 65a SGB II; BT-Drs. 21/3541 S. 67, 77; BT-Drs. 21/4522 |
| BSG nur über lexetius belegt; Fundstelle „SozR 4-4200 § 22 Nr 2“ gehört zum Urteil von 2006, das Urteil von 2008 ist Nr 8. | Hinweis | amtliche Quelle bsg.bund.de (B 14 AS 31/20 R, B 14 AS 57/19 R, B 14 AS 11/18 R) eingesetzt; Wortlaut 2008 bleibt nicht amtlich | Fußnote [^3] |
| U25-Regel (ohne Zusicherung nach Umzug gar keine Unterkunftskosten) stand nur in der Tabelle, nicht im App-Text. | Hinweis | ein Satz in `el.ks.tun.umzug` (nur Deutsch; für Einfache Sprache bei der Umsetzung ergänzen) | § 22 Abs. 5 SGB II |
| Mietpreisbremse: „Amt zahlt weiter bis zur Gerichtsentscheidung“ steht nur in der Begründung, nicht im Gesetz. | Hinweis | als „soll … nach der Gesetzesbegründung“ gekennzeichnet | BT-Drs. 21/3541 S. 68 |
| Sicherheit: Hervorhebungen (`**…**`) in i18n-Texten verleiten zu `innerHTML`; Stelle/Zeichen/Belegzeile stammen aus fremdem Text. Gesundheits-Haken dürfen nicht gespeichert werden. `lotse.fristen` wird bei jedem Start gelöscht. | Risiko | zwei Schlüssel je Punkt, nur `textContent`; Hinweis „nicht speichern“; Hinweis an b-fristen | `src/app.js` Z. 3401 |
| Geprüft und **richtig**: alle Satznummern § 22 Abs. 1 S. 2–12, Abs. 1a, 4–6, 10; § 35 Abs. 1 S. 2–9, Abs. 2, 3, 7; § 35a Abs. 2; § 41 Abs. 3 S. 2 Nr. 2; § 42a Abs. 1; Art. 1 Nr. 20 und 42, Art. 9 Nr. 1–3, Art. 12 Abs. 1 BGBl. 2026 I Nr. 107 (vom 16.04.2026, ausgegeben 22.04.2026); Hamburg (Stand 22.05.2026; 36 Monate, 20 %, 2 Bemühungen/Woche, Gespräch); BT-Drs. 21/5509 vom 22.04.2026; BA-Übersicht ohne § 22; Zeilennummern in `src/app.js` (3286, 3294, 1445, 2118); Farben nur Palette, keine neue Kachel. | — | — | wie oben |

Offen: (1) Gilt der 1,5-Deckel für vor dem 1.7.2026 begonnene Karenzzeiten und während der 6 Monate nach der Karenzzeit? – keine ausdrückliche Regel, keine Rechtsprechung. (2) Wortlaut B 14/7b AS 70/06 R amtlich (Portal sperrt automatischen Abruf). (3) Verfahrensstand BT-Drs. 21/5509 nicht geprüft. (4) Einfache-Sprache-Texte für `el.ks.tun.umzug` (U25) und neutraler Titel bei unsicherem `heiz`. (5) Prototyp der Erkennung mit den neuen Merkmalen (`rechtsbehelf`, `keinVA`, `traeger`) neu laufen lassen.
