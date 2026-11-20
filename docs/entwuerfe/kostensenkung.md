# Entwurf: Hilfe bei einer Aufforderung zur Senkung der Unterkunftskosten (b-kostensenkung)

Stand: 20.11.2026 · Bereich: „Ich habe einen Brief bekommen“ → Jobcenter / Sozialamt (auch ohne Kachel beim Einlesen) · Code gelesen: `/home/claude/s1` (PR #42)

---

## 1. Kurzfassung (was der Nutzer sieht)

1. Wer einen Brief „Aufforderung zur Senkung der Unterkunftskosten“ (oder der Heizkosten) einscannt oder einfügt, bekommt **keine Nachrechnung**. Stattdessen erscheint ein Erklärkasten „Das Amt hält deine Miete für zu hoch“ mit den erkannten Zahlen (deine Miete, Grenze des Amts, Frist).
2. Ganz oben steht das Wichtigste: **Das ist noch keine Kürzung.** Die volle Miete wird in der Regel noch höchstens 6 Monate gezahlt. Ein Widerspruch gegen diesen Brief ist in der Regel nicht möglich, erst gegen den späteren Bescheid.
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
| `el.ks.kern` | Das ist noch keine Kürzung. Das Amt hält deine Kosten für höher als die örtliche Grenze. Es zahlt sie in der Regel noch so lange, wie du sie nicht senken kannst, meist höchstens 6 Monate.[^1][^2] Danach zahlt es möglicherweise nur noch den Betrag bis zur Grenze. | Du bekommst noch dein Geld für die Miete. Das Amt zahlt die volle Miete meistens noch 6 Monate. Danach zahlt es vielleicht weniger. |
| `el.ks.zahlen` | Deine Kosten laut Brief: {ist} · Grenze des Amts: {grenze} · Unterschied: {diff} im Monat | Deine Miete: {ist}. Das Amt zahlt bis: {grenze}. Das sind {diff} zu viel im Monat. |
| `el.ks.frist` | Frist im Brief: {frist} | Bis zu diesem Tag sollst du etwas tun: {frist} |
| `el.ks.stichtag` | Ab {datum} will das Amt laut Brief nur noch die Grenze zahlen. | Ab {datum} zahlt das Amt vielleicht weniger. |
| `el.ks.keinWs` | Gegen diesen Brief kannst du in der Regel keinen Widerspruch einlegen: Er ist ein Hinweis, keine Entscheidung.[^3] Wenn das Amt später weniger zahlt, kommt ein Bescheid. Gegen den kannst du innerhalb eines Monats Widerspruch einlegen. Antworte trotzdem jetzt, das hilft dir später. | Gegen diesen Brief kannst du meistens nichts einlegen. Es ist nur ein Hinweis. Später kommt vielleicht ein Bescheid mit weniger Geld. Dagegen kannst du dich wehren. Schreib dem Amt aber jetzt schon. |

Anzeige nur der Zeilen, für die etwas erkannt wurde (`{ist}`, `{grenze}`, `{frist}`, `{datum}`); `{diff}` nur, wenn beide Beträge erkannt sind und `ist > grenze`. Beträge mit `fmt.js` wie im Rest der App.

### 2.2 Was du jetzt tun kannst (immer sichtbar, drei kurze Punkte)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `el.ks.tun.h` | Was du jetzt tun kannst | Das kannst du jetzt tun |
| `el.ks.tun.gruende` | **Gründe nennen:** Schreib dem Amt, warum ein Umzug für dich nicht möglich oder nicht zumutbar ist (zum Beispiel Krankheit, Pflege, Kinder in Kita oder Schule, Schwangerschaft, hohes Alter, du bekommst bald keine Leistung mehr). Lege Belege bei, etwa ein ärztliches Attest.[^1][^6] | **Sag dem Amt, warum du nicht umziehen kannst.** Zum Beispiel: Du bist krank. Du pflegst jemanden. Deine Kinder gehen hier zur Schule. Schick Papiere mit, die das zeigen. Zum Beispiel vom Arzt. |
| `el.ks.tun.belege` | **Bemühungen belegen:** Sammle ab heute jede Wohnungssuche (Anzeige, Anfrage, Besichtigung, Absage) mit Datum. Frag deinen Vermieter schriftlich nach einer niedrigeren Miete und nach einer Erlaubnis zur Untervermietung. Bewahre die Antworten auf.[^6] | **Schreib alles auf, was du tust.** Jede Wohnung, nach der du fragst. Jede Absage. Frag auch deinen Vermieter: Geht die Miete billiger? Darf ich ein Zimmer vermieten? Heb die Antworten auf. |
| `el.ks.tun.beratung` | **Beratung holen:** Ein Mieterverein, eine Sozialberatung (zum Beispiel Caritas, Diakonie, AWO) oder eine Anwältin für Sozialrecht kann prüfen, ob die Grenze des Amts stimmt. Mit wenig Geld hilft ein Beratungshilfeschein vom Amtsgericht. | **Hol dir Hilfe.** Zum Beispiel beim Mieterverein oder bei einer Sozialberatung. Die prüfen, ob das Amt richtig rechnet. Wenn du wenig Geld hast, gibt es dafür Hilfe vom Amtsgericht. |
| `el.ks.tun.umzug` | **Nicht einfach umziehen:** Unterschreibe einen neuen Mietvertrag erst, wenn das Amt die neue Miete vorher zugesichert hat. Sonst zahlt es möglicherweise nur einen Teil. Umzugskosten und Kaution gibt es nur mit vorheriger Zusicherung.[^4] | **Unterschreib keinen neuen Mietvertrag ohne das Amt.** Frag vorher das Amt. Sonst zahlt das Amt vielleicht nicht die ganze neue Miete. |

Hinweis „Beratungshilfeschein“: Rechtsgrundlage Beratungshilfegesetz; keine Zahl im Text, daher keine Tabellenzeile nötig. Ob die Kosten für einen Mieterverein vom Amt übernommen werden, ist örtlich verschieden (Beispiel Hamburg übernimmt sie in bestimmten Fällen[^6]) – im App-Text bewusst nicht versprochen.

### 2.3 Aufklappbare Details (`<details>`, je ein Abschnitt)

**`el.ks.d.karenz.h`** – Deutsch: „Gilt für mich schon das erste Jahr (Karenzzeit)?“ · Einfach: „Ich bekomme erst seit kurzem Geld vom Amt“

- `el.ks.d.karenz` (Deutsch): „Im ersten Jahr, in dem du Grundsicherungsgeld oder Grundsicherung bekommst, zahlt das Amt die Miete (ohne Heizung) grundsätzlich in voller Höhe (Karenzzeit).[^1][^5] Seit 1.7.2026 gilt aber auch im ersten Jahr: Mehr als das Eineinhalbfache der örtlichen Grenze wird nicht übernommen. Ausnahmen sind im Einzelfall möglich, wenn die Kosten unvermeidbar sind oder Kinder im Haushalt leben.[^1][^5][^7] Außerdem gilt die Karenzzeit nicht, wenn die Miete über der Mietpreisbremse liegt oder über einer örtlichen Höchstgrenze pro Quadratmeter.[^1][^5] Die 6 Monate zum Senken beginnen erst nach dem ersten Jahr.[^1]“
- `el.ks.d.karenz` (Einfach): „Im ersten Jahr zahlt das Amt die Miete meistens ganz. Ohne Heizung. Aber nur bis zu einer Grenze: höchstens das Eineinhalbfache vom normalen Betrag. Bei Kindern geht manchmal mehr. Die 6 Monate fangen erst nach dem ersten Jahr an.“

**`el.ks.d.heiz.h`** – Deutsch: „Und die Heizkosten?“ · Einfach: „Was ist mit der Heizung?“

- Deutsch: „Für die Heizkosten gibt es kein freies erstes Jahr. Sind sie zu hoch, kann das Amt dich gleich auffordern, sie zu senken; auch dann gilt in der Regel höchstens 6 Monate.[^1][^2] Erkläre, warum deine Heizkosten höher sind: zum Beispiel alte Fenster oder Heizung, Wohnung unter dem Dach oder an einer Außenwand, kleine Kinder, Krankheit, viel Zeit zu Hause.[^6] Liegen Miete und Heizung zusammen unter der Gesamtgrenze, muss das Amt möglicherweise nicht kürzen (wenn es eine Gesamtgrenze bildet).[^1][^2]“
- Einfach: „Bei der Heizung gibt es kein freies erstes Jahr. Das Amt kann gleich sagen: Heiz weniger. Erklär dem Amt, warum du mehr heizen musst. Zum Beispiel: alte Fenster, kleine Kinder, du bist krank.“

**`el.ks.d.wirt.h`** – Deutsch: „Lohnt sich ein Umzug überhaupt?“ · Einfach: „Ist ein Umzug teurer?“

- Deutsch: „Das Amt muss keine Senkung verlangen, wenn ein Umzug wegen der Umzugskosten unwirtschaftlich wäre.[^1][^2] Wie es das rechnet, legt jede Stadt oder jeder Kreis selbst fest. Frag nach, ob das Amt das geprüft hat, besonders wenn deine Miete nur wenig über der Grenze liegt.“
- Einfach: „Manchmal kostet ein Umzug mehr, als er spart. Dann muss das Amt keine billigere Wohnung verlangen. Frag das Amt, ob es das geprüft hat.“

**`el.ks.d.tod.h`** – Deutsch: „Jemand aus dem Haushalt ist gestorben“ · Einfach: „Jemand aus deiner Familie ist gestorben“

- Deutsch: „Waren die Kosten vorher angemessen und ist ein Mitglied des Haushalts gestorben, muss die Miete mindestens 12 Monate nach dem Sterbemonat nicht gesenkt werden.[^1][^2]“
- Einfach: „Ist jemand aus deinem Haushalt gestorben? Dann musst du mindestens 12 Monate lang nicht umziehen.“

**`el.ks.d.mpb.h`** – Deutsch: „Das Amt sagt, meine Miete verstößt gegen die Mietpreisbremse“ · Einfach: „Das Amt sagt: Der Vermieter verlangt zu viel“

- Deutsch: „Liegt die Miete über der Mietpreisbremse, fordert das Amt dich auf, das beim Vermieter zu rügen (schriftlich beanstanden).[^1][^7] Lass dich dabei von einem Mieterverein beraten. Solange die zulässige Miethöhe strittig ist, zahlt das Amt nach der Gesetzesbegründung die tatsächliche Miete weiter, bis ein Gericht entschieden hat.[^8]“
- Einfach: „Das Amt sagt vielleicht: Dein Vermieter verlangt mehr als erlaubt. Dann sollst du dich beim Vermieter beschweren. Lass dir dabei vom Mieterverein helfen.“

**`el.ks.d.sa.h`** (nur bei Sozialamt) – Deutsch: „Grundsicherung im Alter und Sozialhilfe“ · Einfach: „Ich bekomme Geld vom Sozialamt“

- Deutsch: „Beim Sozialamt gelten fast die gleichen Regeln: erstes Jahr Karenzzeit für die Miete (ohne Heizung), höchstens das Eineinhalbfache der Grenze, danach in der Regel höchstens 6 Monate zum Senken.[^2][^7] Hast du vorher Grundsicherungsgeld vom Jobcenter bekommen, wird die dort schon genutzte Karenzzeit angerechnet.[^2] Vor einem Umzug musst du das Sozialamt informieren; höhere Kosten zahlt es nur, wenn es vorher zugestimmt hat.[^9]“
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

[ks-g-krank]  Ein Umzug ist mir aus gesundheitlichen Gründen nicht zumutbar. Ein ärztliches Attest lege ich bei.
[ks-g-pflege] Ich bin auf Pflege bzw. Hilfe in meinem jetzigen Wohnumfeld angewiesen (bzw. pflege einen Angehörigen in der Nähe).
[ks-g-kinder] In meinem Haushalt leben Kinder, die hier Kita bzw. Schule besuchen. Ein Umzug würde einen Wechsel mitten im Kita- bzw. Schuljahr bedeuten.
[ks-g-schwanger] Ich bin schwanger; der Haushalt wird größer. Für die künftige Haushaltsgröße sind meine Kosten möglicherweise angemessen.
[ks-g-alter]  Ich wohne seit {jahre} Jahren in dieser Wohnung. Wegen meines Alters bzw. meiner Einschränkungen ist mir ein Umzug kaum möglich.
[ks-g-kurz]   Ich werde voraussichtlich bald keine Leistungen mehr benötigen (zum Beispiel wegen Arbeitsaufnahme am {datum2}).
[ks-g-tod]    Ein Mitglied meines Haushalts ist im {monat} verstorben; die Kosten waren davor angemessen.
[ks-g-wirt]   Meine Kosten liegen nur geringfügig über der Grenze. Ich bitte zu prüfen, ob ein Umzug unter Berücksichtigung der Umzugskosten wirtschaftlich wäre (§ 22 Abs. 1 SGB II / § 35 Abs. 3 SGB XII).
[ks-g-heiz]   Meine Heizkosten sind aus folgenden Gründen höher: {freitext}.
[ks-g-grenze] Ich bitte um Mitteilung, wie die von Ihnen genannte Angemessenheitsgrenze ermittelt wurde (Konzept, Stand, Vergleichsraum).

Ich bemühe mich um eine Senkung der Kosten. Bisher habe ich: {freitext oder „die beigefügte Liste meiner Bemühungen“}.

Ich bitte Sie, die tatsächlichen Kosten weiter zu übernehmen, solange mir eine Senkung nicht möglich oder nicht zumutbar ist, und vor einer Kürzung meine Gründe zu prüfen. Bitte bestätigen Sie mir den Eingang dieses Schreibens.

Mit freundlichen Grüßen

________________________
{name}

Anlagen: {liste}
```

Paragraf im Text: bei `jc` „§ 22 Abs. 1 SGB II“, bei `sa` „§ 35 Abs. 3 SGB XII“ (nur die passende Angabe einsetzen, die andere weglassen).

---

## 3. Zahlen und Regeln (mit Quelle, Abruf 20.11.2026)

| Regel | Wert | Gilt ab / bis | Quelle (amtlich) |
|---|---|---|---|
| Karenzzeit Unterkunft SGB II (nur Unterkunft, **nicht Heizung**) | 1 Jahr ab Beginn des Monats des ersten Leistungsbezugs; Unterbrechung ≥ 1 Monat verlängert; neue Karenzzeit nach 3 Jahren ohne SGB-II/XII-Leistung | seit 1.1.2023 (Bürgergeld-Gesetz vom 16.12.2022, BGBl. I S. 2328), unverändert fortgeltend | § 22 Abs. 1 S. 2–5 SGB II[^1] |
| Deckel auch in der Karenzzeit | Unterkunftskosten über dem **1,5-fachen** der abstrakt angemessenen Aufwendungen werden nicht anerkannt | **seit 1.7.2026** | § 22 Abs. 1 S. 6 SGB II[^1]; Art. 1 Nr. 20, Art. 12 Abs. 1 13. SGB-II-ÄndG, BGBl. 2026 I Nr. 107[^7] |
| Ausnahme vom Deckel | im Einzelfall höher, wenn unabweisbar oder in Bedarfsgemeinschaften mit Kindern („können“) | seit 1.7.2026 | § 22 Abs. 1 S. 7 SGB II[^1] |
| Karenzzeit entfällt | wenn örtliche qm-Obergrenze überschritten oder Miete über Mietpreisbremse (§§ 556d–556g BGB); dann Aufforderung zur Rüge | seit 1.7.2026 | § 22 Abs. 1 S. 8 SGB II[^1][^7] |
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
| Rechtsnatur der Aufforderung | Informationsschreiben mit Aufklärungs- und Warnfunktion, **kein Verwaltungsakt** | ständige Rspr. seit 2006 | BSG, Urt. v. 27.02.2008 – B 14/7b AS 70/06 R; BSG, Urt. v. 07.11.2006 – B 7b AS 10/06 R (SozR 4-4200 § 22 Nr 2)[^3] |
| Widerspruchsfrist gegen den späteren Bescheid | 1 Monat | gilt | § 84 Abs. 1 SGG (schon in `erweiterungen/fristen.js`) |
| Übergang | keine KdU-Übergangsregel in § 65a SGB II → neue Regeln **möglich**erweise auch für vor dem 1.7.2026 begonnene Karenzzeiten (nicht ausdrücklich geregelt) | — | § 65a SGB II i. d. F. BGBl. 2026 I Nr. 107[^7] |
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

- `traeger`: `sa` bei `/SGB XII|Zwölfte|Sozialamt|Grundsicherung im Alter/i`, sonst `jc` bei `/SGB II\b|Jobcenter|Zweite/i`, sonst `null` (dann beide Paragrafen nennen).
- `heiz`: `/Heizkosten/` und keine Unterkunfts-Begriffe.
- `kostenIst`: erster Betrag in einer Zeile mit `/tatsächliche|Ihre (Brutto)?kaltmiete|betragen/i`; `grenze`: letzter Betrag in Zeile mit `angemessen|Angemessenheitsgrenze|Mietobergrenze` ohne `unangemessen|übersteigt|tatsächlich`, sonst Zeile „übersteigt die angemessene …“ (letzter Betrag). Hilfsfunktion `betraege()` vorhanden.
- `frist`: vorhandenes `frist(text)`; `stichtag`: `/ab (?:dem )?(\d{1,2}\.\d{1,2}\.20\d{2})[^\n]{0,80}(nur noch|angemessen)/i`; `datum`: vorhandenes `bescheidDatum(zeilen(text))`.
- `anhoerung`: `ARTEN.anh`-Punkte ≥ 9 (Anhörung + § 24 SGB X) → dann bleibt die Art `anh` (Anhörungsfrist zählt), der KS-Kasten erscheint zusätzlich darunter.
- Export erweitern: `return { erkenne, lies, betraege, ERKLAERUNG, frist, andere, ARTEN, kostensenkung };`
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
- Ohne Kachel (`briefArt === null`): `briefOeffnen(ks.traeger || 'jc')` aufrufen (damit Kopf „Brief von: Jobcenter/Sozialamt“ und `elErg` an der richtigen Karte steht), dann `ksZeigen`. Achtung: `briefOeffnen` leert `elErg` (Z. 3232) – deshalb erst öffnen, dann zeigen.
- Kein `briefFormular()`: das Bescheid-Formular bleibt zu (`pp-zu`), „Werte selbst eingeben“ bleibt sichtbar.

**Neue Funktion `ksZeigen(ks, text)`** (neben `textLesen`, ca. Z. 3323): baut in `$('elErg')` einen Block `div.el-erkl.el-ks` mit
1. `<b>` Titel, `<p>` `el.ks.kern`, ggf. `el.ks.zahlen`, `el.ks.frist`, `el.ks.stichtag`;
2. `<p class="el-ks-ws">` `el.ks.keinWs` (Hintergrund `--na-bg`, Info);
3. `<h3>` `el.ks.tun.h` + `<ul>` mit den vier `el.ks.tun.*`-Punkten (die fett gedruckten Anfänge als `<b>`, Text per `textContent`, kein `innerHTML` mit Nutzertext);
4. sechs `<details>` (`el.ks.d.*`), `el.ks.d.sa` nur bei `traeger === 'sa'`, `el.ks.d.heiz` zuerst, wenn `heiz`;
5. Knopfgruppe `.btns`: „Antwort entwerfen“ (`.btn`), „Frist übernehmen“ (`.btn` sekundär/`.chip`, nur wenn `window.FristenOrdner && FristenOrdner.hinzu`) ;
6. `<p class="note">` `el.ks.hinweis`.

**Antwort-Entwurf:** Klick blendet ein kleines Formular ein: Checkboxen `ks-g-krank … ks-g-grenze` (Beschriftung `el.ks.g.*`, Texte siehe 2.6, kurz), Freitextfeld Bemühungen (`ks-bem`), Textfeld `ks-text` (Ergebnis) und Kopieren-Knopf `ks-copy`. Danach in `SCHREIBEN` (Z. 1445) eintragen: `['ks-text', 'ks-copy', ks.traeger === 'sa' ? 'Stellungnahme-Sozialamt' : 'Stellungnahme-Jobcenter', 'amt']` – da `SCHREIBEN` statisch ist, als fester Eintrag `['ks-text', 'ks-copy', 'Stellungnahme-Wohnkosten', 'amt']`. Teilen/Drucken/Speichern und der Hinweis `ABGEBEN.amt` kommen dann automatisch.

**Frist übernehmen:** Schnittstelle zum Modul aus **b-fristen** (dort zu definieren; hier nur Vorschlag):
```js
FristenOrdner.hinzu({ art: 'kostensenkung', datum: 'JJJJ-MM-TT', titel: t('el.ks.titel'), stelle: ks.traeger, quelle: 'brief', notiz: t('el.ks.tun.belege') })
```
Ist kein Datum erkannt, fragt ein Datumsfeld (`el.ks.frist.datum`) nach. **Keine** selbst berechnete Frist („6 Monate ab Zugang“): Beginn und Länge legt das Amt fest; die Karenzzeit verschiebt den Beginn.[^1] Speicherung übernimmt b-fristen (im Vorgang, mit PIN verschlüsselt über `src/vorgaenge.js`). b-kostensenkung legt **keinen** eigenen Speicherschlüssel an.

**Optional Stufe 2 (nicht in diesem Auftrag bauen):** Liste der Bemühungen (Datum, was, Ergebnis) im Vorgang unter neuem Schlüssel `lotse.kostensenkung` (Eintrag in `DATEN`, `src/vorgaenge.js` Z. 7, und `STORE_SCHLUESSEL`, `src/app.js` Z. 2118) mit Anlage-Ausgabe als PDF. Konfliktrisiko mit b-fristen, die `DATEN` ebenfalls ändert.

### 4.3 Bescheid-Prüfung ergänzen (klein)

`erweiterungen/bescheid-sgb2.js` Z. 97: Der Hinweis nennt schon die vorherige Aufforderung. Ergänzen (deutsch, wie dort üblich): „… In der Karenzzeit (erstes Jahr) wird die Miete bis zum Eineinhalbfachen der Grenze voll übernommen (§ 22 Abs. 1 Satz 2 und 6 SGB II, seit 1.7.2026).“ Entsprechend `erweiterungen/bescheid-gsa.js` mit § 35 SGB XII prüfen. (Nur Vorschlag; Datei gehört zum Prüfpaket, das nur deutsch ist, `ppNurDe`.)

### 4.4 i18n-Schlüssel

Neu in `src/lang/de.json` (und Übersetzung in en, ar, fa, fa-AF, fr, pl, ps, ro, ru, so, tr, uk) und `src/lang/einfach/d.json`:

`el.ks.titel`, `el.ks.titelHeiz`, `el.ks.kern`, `el.ks.zahlen`, `el.ks.frist`, `el.ks.stichtag`, `el.ks.keinWs`, `el.ks.tun.h`, `el.ks.tun.gruende`, `el.ks.tun.belege`, `el.ks.tun.beratung`, `el.ks.tun.umzug`, `el.ks.d.karenz.h`, `el.ks.d.karenz`, `el.ks.d.heiz.h`, `el.ks.d.heiz`, `el.ks.d.wirt.h`, `el.ks.d.wirt`, `el.ks.d.tod.h`, `el.ks.d.tod`, `el.ks.d.mpb.h`, `el.ks.d.mpb`, `el.ks.d.sa.h`, `el.ks.d.sa`, `el.ks.hinweis`, `el.ks.frist.btn`, `el.ks.frist.ok`, `el.ks.frist.datum`, `el.ks.antwort.btn`, `el.ks.antwort.hinweis`, `el.ks.g.krank`, `el.ks.g.pflege`, `el.ks.g.kinder`, `el.ks.g.schwanger`, `el.ks.g.alter`, `el.ks.g.kurz`, `el.ks.g.tod`, `el.ks.g.wirt`, `el.ks.g.heiz`, `el.ks.g.grenze`, `el.ks.bem`.

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

**`test/e2e-briefe.js`** (ergänzen): Text `KS_JC` in „Text einfügen“ ohne Kachel → Kopf „Brief von: Jobcenter“, Kasten `.el-ks` sichtbar, Bescheid-Formular `#p-bescheid.pp-zu` bleibt zu, Text enthält „noch keine Kürzung“; in Kachel „Anderer Brief“ → ebenfalls `.el-ks` (nicht `PruefpaketAndere`); Klick „Antwort entwerfen“ + Haken „Kinder“ → `#ks-text` enthält „Kita bzw. Schule“ und „§ 22 Abs. 1 SGB II“; bei `KS_SA` „§ 35 Abs. 3 SGB XII“ und **nicht** „SGB II“. Einfache Sprache an → Titel „Das Amt sagt: Deine Miete ist zu hoch“. Sprache `ar` → `dir="rtl"`, keine fehlenden Schlüssel.
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
2. **Übergang 1.7.2026:** § 65a SGB II enthält keine KdU-Übergangsregel. Ob der 1,5-Deckel auch für Karenzzeiten gilt, die vor dem 1.7.2026 begonnen haben, ist nicht ausdrücklich geregelt → in der App nur „möglich“, nicht berechnen.
3. **Quellen BSG:** Die Urteile von 2006/2008 stehen nicht auf rechtsprechung-im-internet.de (erst ab 2010) und nicht auf bsg.bund.de; Volltext gelesen bei lexetius.com (nicht amtlich). Aktenzeichen und Fundstelle (SozR 4-4200 § 22 Nr 2) sind amtlich zitierfähig; bitte bei Bedarf über die BSG-Pressestelle/Juris gegenprüfen.
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
[^3]: BSG, Urteil vom 27.02.2008 – B 14/7b AS 70/06 R (Kostensenkungsaufforderung = Informationsschreiben ohne Verwaltungsaktqualität, „Aufklärungs- und Warnfunktion“; unter Verweis auf BSG, Urteil vom 07.11.2006 – B 7b AS 10/06 R, SozR 4-4200 § 22 Nr 2 RdNr 29 ff.). Volltext (nicht amtlich): https://lexetius.com/2008,1460
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
