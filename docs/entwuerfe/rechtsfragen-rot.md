# Rechtsprüfung zu den roten UX-Punkten (Audits B, C, D und A Nr. 7)

Stand 21.11.2026 · unabhängige Prüfung · **kein App-Code geändert**.
Geprüft: `docs/entwuerfe/ux-audit-b.md`, `-c.md`, `-d.md` (Branches `claude/b-ux-audit-b/-c/-d`), Aufgabe 7 aus `ux-audit-a.md`, und die betroffenen Stellen in `src/rules.js`, `src/app.js`, `src/lang/de.json`, `src/plz.js`, `erweiterungen/fristen.js`, `erweiterungen/vorschau.js` (Stand `origin/claude/b-buendel-n2`).
Alle Paragrafen wurden am 21.11.2026 direkt bei gesetze-im-internet.de abgerufen (Wortlaut der geltenden Fassung). Entwürfe: Drucksachen von Bundestag und Bundesrat (dserver.bundestag.de, bundestag.de), Abruf 21.11.2026.

Einstufung: **sicher** = steht so im Gesetz · **möglich** = hängt vom Einzelfall oder von einer Entscheidung der Stelle ab; SoLo darf es nur als Möglichkeit nennen.

## Kurzfassung

| Frage | Ergebnis | Was in SoLo sofort falsch oder irreführend ist |
|---|---|---|
| 1 Widerspruch nach Fristende | Vorschlag aus Audit B ist richtig, aber zu kurz. Wortlaut unten. | Abgelaufene Frist wird wie eine laufende gezeigt, Widerspruch und „Frist merken“ werden normal angeboten. Hinweis nennt § 66 SGG auch beim Wohngeld (dort gilt § 58 VwGO, Inhalt gleich). |
| 2 Mietschulden, Stromsperre | Zahlen und Fristen in SoLo **stimmen**. Die Sperre steht nicht mehr in § 19 StromGVV, sondern in §§ 41f, 41g EnWG. SoLo zitiert richtig. | Nichts falsch. Irreführend: Kurztext Miete liest sich wie „Zeit bis 2 Monate nach der Klage“. Zwei Vorschläge aus Audit C brauchen einen anderen Wortlaut. |
| 3 Pflege | Alle Beträge **stimmen** (2026 = 2025, nächste Erhöhung laut Gesetz erst 1.1.2028). Darstellung aus Audit D ist zulässig, mit 4 Auflagen. | Wohngruppenzuschlag wird mit „§ 38a SGB XI“ angezeigt, richtig ist **§ 45f SGB XI**. Ein Satz zur stundenweisen Vertretung hat keine amtliche Quelle. |
| 4 Mietenstufe aus PLZ | Als Vorbelegung zulässig. **Nicht** unter „Mehr“ verstecken: Ort und Stufe sichtbar lassen, Nutzer bestätigt. | Nichts falsch (Stand 1.1.2023 gilt). **Risiko ab 1.1.2027:** Der Entwurf zum Wohngeldgesetz ersetzt die Liste; rund ein Drittel der Gemeinden bekäme eine andere Stufe. Noch nicht beschlossen. |

---

## 1. Widerspruchsfrist abgelaufen

### Was SoLo jetzt zeigt

| Stelle | Text / Verhalten |
|---|---|
| `erweiterungen/vorschau.js` (Fristkasten, `fristText()`) | „Widerspruch bis {Datum}“, auch wenn das Datum Jahre zurückliegt (Audit B, Bild 06: 13.03.2023). Darunter „Frist merken“ und später „Widerspruch erstellen“. |
| `erweiterungen/fristen.js` Z. 45 | „… Fehlt im Bescheid die Rechtsbehelfsbelehrung, gilt ein Jahr (§ 66 SGG).“ |
| `de.json` `z.verfahren` | „Ist ein älterer Bescheid falsch, hilft ein Überprüfungsantrag (§ 44 SGB X); rückwirkend gibt es dann Geld nur für eine begrenzte Zeit.“ (richtig) |

### Was rechtlich gilt

| Punkt | Regel | Fundstelle (Abruf 21.11.2026) | Einstufung |
|---|---|---|---|
| Frist | 1 Monat ab Bekanntgabe. Post: bekannt gegeben am 4. Tag nach Aufgabe zur Post, außer der Brief kam später oder gar nicht; im Zweifel muss die Stelle den Zugang beweisen. | § 84 Abs. 1 SGG; § 37 Abs. 2 SGB X; Wohngeld und BAföG: § 70 Abs. 1 VwGO | sicher |
| Belehrung fehlt oder ist falsch | Dann gilt 1 Jahr statt 1 Monat. | § 66 Abs. 2 SGG (über § 84 Abs. 2 Satz 3 SGG); Wohngeld: § 58 Abs. 2 VwGO (über § 70 Abs. 2 VwGO) | sicher |
| Wiedereinsetzung | Nur wer **ohne eigene Schuld** verhindert war (z. B. Krankenhaus). Antrag **und** Widerspruch nachholen: **1 Monat** nach Wegfall des Hindernisses (Jobcenter, Sozialamt, Familienkasse-KiZ, Pflegekasse), **2 Wochen** beim Wohngeld und BAföG. Nach 1 Jahr in der Regel ausgeschlossen. | § 84 Abs. 2 Satz 3 i. V. m. § 67 SGG; § 70 Abs. 2 i. V. m. § 60 VwGO. § 27 SGB X (2 Wochen) gilt für andere Fristen im Verwaltungsverfahren, **nicht** als Grundlage für den Widerspruch nennen. | Regel sicher, Erfolg möglich |
| Überprüfungsantrag | Die Stelle muss einen falschen, belastenden Bescheid auch nach Fristende zurücknehmen, wenn deshalb Leistungen zu Unrecht nicht gezahlt wurden. Gilt nicht, wenn der Bescheid auf vorsätzlich falschen Angaben beruht. | § 44 Abs. 1 SGB X | sicher (Anspruch auf Prüfung), Ergebnis möglich |
| Wie weit zurück | Allgemein (Wohngeld, Kinderzuschlag, Pflegekasse, Elterngeld): bis zu **4 Jahre**, gerechnet ab Beginn des Jahres, in dem der Antrag gestellt wird. **Jobcenter und Sozialamt: nur 1 Jahr**; dort muss der Antrag außerdem spätestens 4 Jahre nach Ablauf des Jahres der Bekanntgabe gestellt sein. | § 44 Abs. 4 SGB X; § 40 Abs. 1 Satz 2 SGB II; § 116a SGB XII; § 68 Nr. 9, 10 SGB I | sicher |
| Rechenbeispiel | Antrag im November 2026: Jobcenter/Sozialamt Nachzahlung frühestens ab 1.1.2025; sonst ab 1.1.2022. | wie oben | sicher |
| Wirkung | Der Überprüfungsantrag hält nichts auf: Eine Rückforderung oder Kürzung läuft weiter. Gegen die Entscheidung über den Antrag gibt es wieder Widerspruch (1 Monat). | § 44 SGB X (kein Aufschub geregelt); § 84 SGG | sicher |
| Kindergeld | Kein § 44 SGB X (Steuerrecht, Einspruch). SoLo prüft bei der Familienkasse nur Kinderzuschlag: dort gilt § 44 SGB X. | § 68 Nr. 9 SGB I (BKGG) | sicher |

### Was SoLo raten darf und was nicht

| Darf SoLo sagen | Darf SoLo nicht sagen |
|---|---|
| „Die Frist ist nach dieser Rechnung vorbei.“ (SoLo rechnet mit dem Briefdatum, also dem frühesten Ende.) | „Ein Widerspruch ist nicht mehr möglich.“ (Zugang später, Belehrung fehlt: dann läuft die Frist noch.) |
| „Du kannst eine Überprüfung beantragen.“ | „Du bekommst das Geld nach.“ / „ohne Frist“ / „jederzeit“ |
| „Geld gibt es höchstens für … zurück.“ (1 Jahr bzw. 4 Jahre, mit Stichtag) | „4 Jahre“ beim Jobcenter oder Sozialamt |
| „Warst du ohne eigene Schuld verhindert, stell sofort einen Antrag auf Wiedereinsetzung und leg den Widerspruch gleich dazu.“ | Wiedereinsetzung als normalen Weg oder für „vergessen“ / „Urlaub ohne Vorsorge“ anbieten |
| „Der Antrag stoppt eine Rückforderung nicht.“ | „Damit musst du erst einmal nicht zahlen.“ |
| Muster: „Widerspruch, hilfsweise Antrag auf Überprüfung nach § 44 SGB X“ (üblich, schadet nicht) | Den normalen Widerspruch ohne Warnung anbieten, „Frist merken“ für eine vergangene Frist |

### Textvorschlag (seriöses Du)

**Kasten statt „Widerspruch bis …“, wenn das Datum vorbei ist:**

> **Die Frist für den Widerspruch ist nach dieser Rechnung seit dem {Datum} vorbei.**
> Prüf zuerst zwei Dinge:
> 1. Kam der Brief später bei dir an? Dann endet die Frist später. Trag oben den Tag ein, an dem er wirklich kam.
> 2. Fehlt am Ende des Bescheids der Abschnitt „Rechtsbehelfsbelehrung“ oder ist er falsch? Dann hast du ein Jahr Zeit.
>
> **Sonst: Beantrage eine Überprüfung.** Ist der Bescheid falsch, muss die Stelle ihn auch jetzt noch ändern. Das kostet nichts.

**Aufklapper „Mehr dazu“:**

> **Wie weit zurück gibt es Geld?** {Jobcenter/Sozialamt: „Höchstens für das Jahr vor dem Jahr deines Antrags. Antrag in 2026: frühestens ab 1. Januar 2025.“ · sonst: „Höchstens für 4 Jahre vor dem Jahr deines Antrags. Antrag in 2026: frühestens ab 1. Januar 2022.“} Stell den Antrag deshalb bald.
> **Achtung:** Der Antrag hält nichts auf. Fordert die Stelle Geld zurück, läuft das weiter. Sprich dann schnell mit einer Beratungsstelle.
> **Warst du verhindert, ohne dass du etwas dafür kannst** (zum Beispiel im Krankenhaus)? Dann schick sofort den Widerspruch und schreib dazu, warum es nicht früher ging („Antrag auf Wiedereinsetzung“). Dafür hast du nur kurz Zeit: {Wohngeld: „2 Wochen“ · sonst: „1 Monat“}, nachdem das Hindernis weg ist.
> Ob du Erfolg hast, entscheidet die Stelle. SoLo kann das nicht zusagen.
> Quellen (nur Beratungsmodus): § 44 SGB X; § 40 Abs. 1 SGB II; § 116a SGB XII; §§ 66, 67, 84 SGG; Wohngeld: §§ 58, 60, 70 VwGO.

**Knöpfe:** Hauptknopf „Überprüfung beantragen“ (Muster: „Ich beantrage, den Bescheid vom {Datum} zu überprüfen (§ 44 SGB X). Begründung: …“). Kein „Frist merken“. „Trotzdem Widerspruch schreiben“ nur als Nebenweg, mit dem Zusatz „hilfsweise Antrag auf Überprüfung“.

**Korrektur am bestehenden Hinweis (`fristen.js`):** „Fehlt die Rechtsbehelfsbelehrung oder ist sie falsch, gilt ein Jahr.“ Paragraf nur im Beratungsmodus: „§ 66 SGG, beim Wohngeld § 58 VwGO“.

**Grenzen:** Gilt nur für Bescheide von Sozialleistungsträgern. Nicht für Vermieter, Inkasso, Mahnbescheid, Kindergeld. Bei Pflegegrad zusätzlich nennen: „Oder stell einen Antrag auf Höherstufung“ (steht schon in `vorschau.js` Z. 426).

---

## 2. Mietschulden und Stromsperre

### 2a Mietschulden

| SoLo jetzt (`de.json`) | Rechtslage | Fundstelle (Abruf 21.11.2026) | Urteil |
|---|---|---|---|
| `gs.d.miete.frist`: „Zahlst du spätestens 2 Monate nach Zustellung der Räumungsklage oder übernimmt das Amt die Schulden, wird die Kündigung unwirksam (§ 569 BGB).“ | 2 Monate ab Rechtshängigkeit des Räumungsanspruchs (= Zustellung der Klage). Es reicht, dass sich eine öffentliche Stelle in dieser Zeit **verpflichtet**. Bezahlt sein müssen **alle** fälligen Mieten und die Entschädigung für die Zeit nach der Kündigung. | § 569 Abs. 3 Nr. 2 Satz 1 BGB | richtig; „alle offenen Mieten“ fehlt |
| `sp.schulden.miete`: „Das geht nur einmal in 2 Jahren.“ | Gilt nicht, wenn in den letzten 2 Jahren schon eine Kündigung so unwirksam wurde. | § 569 Abs. 3 Nr. 2 Satz 2 BGB | richtig |
| „Hat der Vermieter zusätzlich ordentlich gekündigt, kann diese Kündigung trotz Zahlung bestehen bleiben.“ | Geltendes Recht: § 573 BGB hat keine Schonfrist. Änderung ist nur Entwurf (BT-Drs. 21/6807 vom 1.7.2026, 1. Lesung 9.7.2026, Anhörung 14.10.2026, **nicht beschlossen**). | § 573 BGB; bundestag.de, Textarchiv KW 42/2026 | richtig, so lassen |
| „Bei mehr als einer Monatsmiete Rückstand über zwei Monate ist eine fristlose Kündigung möglich.“ | Zwei Termine hintereinander mit zusammen mehr als einer Monatsmiete Rückstand, **oder** über längere Zeit Rückstand von zwei Monatsmieten. | § 543 Abs. 2 Satz 1 Nr. 3, § 569 Abs. 3 Nr. 1 BGB | ungenau, nicht falsch |
| `gs.d.miete.schritt`: „Beantrage sofort beim Jobcenter oder Sozialamt, dass es die Mietschulden übernimmt.“ / „meist als Darlehen“ | Jobcenter: **kann** übernehmen, **soll** bei drohender Wohnungslosigkeit; nur wer Grundsicherungsgeld für die Unterkunft bekommt; eigenes Vermögen zuerst; Geld **soll** als Darlehen. Sozialamt: Beihilfe oder Darlehen, auch für Menschen ohne laufende Leistung. | § 22 Abs. 8 SGB II (Fassung G v. 16.4.2026, BGBl. 2026 I Nr. 107); § 36 Abs. 1, § 21 Satz 2 SGB XII | richtig; kein Anspruch zusagen |
| `gs.d.miete.frist.kurz`: „Spätestens 2 Monate nach Zustellung der Räumungsklage zahlen.“ | Sachlich richtig, aber als „Frist“ irreführend: passt nicht ohne Klage, rettet nicht vor der ordentlichen Kündigung, klingt nach „so lange Zeit“. | wie oben | **ändern** |

**Zu Audit C Nr. 6** („Sofort handeln. Letzte Rettung: bis 2 Monate nach der Räumungsklage zahlen“): „Letzte Rettung“ sagt zu viel zu. So ist es sauber:

> **Kurz (immer sichtbar):** Sofort handeln. Warte nicht auf die Klage.
> **Lang:** Hat der Vermieter fristlos gekündigt, weil Miete fehlt? Dann kannst du die Kündigung noch abwenden: Alle offenen Mieten müssen bezahlt sein, spätestens 2 Monate nachdem dir das Gericht die Räumungsklage zugestellt hat. Es reicht auch, wenn Jobcenter oder Sozialamt in dieser Zeit schriftlich zusagen, die Schulden zu übernehmen. Das geht nur einmal in 2 Jahren.
> **Achtung:** Viele Vermieter kündigen zusätzlich „ordentlich“ (mit Frist). Diese Kündigung kann trotz Zahlung bestehen bleiben. Hol dir sofort Hilfe beim Mieterverein oder einer Beratungsstelle.

Einstufung: Regel sicher; ob die Wohnung bleibt: möglich.

**Zu Audit C Nr. 5** (Hauptknopf „Antrag auf Übernahme der Mietschulden“): zulässig. Wortlaut im Muster: „Ich beantrage die Übernahme meiner Mietschulden, um die Wohnung zu sichern (Jobcenter: § 22 Abs. 8 SGB II · Sozialamt: § 36 SGB XII). Mir droht der Verlust der Wohnung.“ Dazu der Satz: „Das Amt entscheidet. Meist gibt es das Geld als Darlehen.“ Empfänger nur als Art der Stelle (Jobcenter, wenn du Grundsicherungsgeld bekommst; sonst Sozialamt). Einstufung: möglich.

### 2b Strom- und Gassperre

**Wichtig für die Prüfliste:** Die Sperre wegen Schulden steht nicht mehr in § 19 StromGVV. § 19 StromGVV regelt nur noch die Sperre bei Manipulation und verweist ausdrücklich auf §§ 41f und 41g EnWG. SoLo zitiert schon richtig.

| SoLo jetzt | Rechtslage | Fundstelle (Abruf 21.11.2026) | Urteil |
|---|---|---|---|
| „4 Wochen vorher angedroht“ | Sperre frühestens 4 Wochen nach Androhung; Androhung darf mit der Mahnung kommen | § 41f Abs. 1 EnWG | richtig |
| „8 Werktage vorher angekündigt“ | Beginn 8 Werktage vorher **per Brief** ankündigen | § 41f Abs. 5 EnWG | richtig |
| „ab 2 Monatsabschlägen und mindestens 100 €“ | Das Doppelte des monatlichen Abschlags (ohne Abschläge: ein Sechstel der Jahresrechnung) **und** mindestens 100 €. Nicht mitgezählt: Beträge, die du begründet beanstandet hast, gestundete Beträge, strittige Preiserhöhung, Beträge im Schlichtungsverfahren | § 41f Abs. 3 EnWG | richtig |
| „Gilt für Strom und Gas“ | „Energielieferant“ und „Haushaltskunde“, also beide, auch außerhalb der Grundversorgung | § 41f EnWG | richtig |
| „In der Grundversorgung muss er sie dir zinsfrei anbieten (§ 41g EnWG)“ | Du kannst nach der Androhung ein Angebot verlangen; es muss binnen 1 Woche kommen, sonst spätestens mit der Ankündigung. Zinsfreie Raten, meist 6 bis 18 Monate, über 300 € Rückstand 12 bis 24 Monate. Nimmst du **in Textform vor der Sperre** an, darf nicht gesperrt werden | § 41g Abs. 1 EnWG | richtig |
| „Schreib dem Versorger, wenn die Sperre dich besonders hart trifft, zum Beispiel bei Krankheit oder kleinen Kindern.“ | Unzulässig, wenn die Folgen außer Verhältnis stehen, vor allem bei konkreter Gefahr für Leib oder Leben wegen Gesundheit oder Alter; in Textform mitteilen, auf Verlangen belegen. **Auch** unzulässig, wenn du darlegst, dass du bald zahlen kannst | § 41f Abs. 1 Satz 2, Abs. 2 EnWG | richtig als Beispiel; zweiter Grund fehlt |
| „Darlehen für die Energieschulden beim Jobcenter oder Sozialamt“ | „vergleichbare Notlage“; Kann-Leistung | § 22 Abs. 8 SGB II; § 36 SGB XII | richtig |

**Zu Audit C Nr. 6** („Sofort handeln: Die Sperre kommt frühestens 8 Werktage nach der Ankündigung“): richtig, aber nur die halbe Regel. Vorschlag:

> **Kurz:** Sofort handeln. Vor einer Sperre kommen zwei Briefe: die Androhung (mindestens 4 Wochen vorher) und die Ankündigung mit dem Tag (mindestens 8 Werktage vorher).
> **Lang, neu dazu:** Schreib dem Versorger auch, wenn du bald zahlen kannst, zum Beispiel weil du beim Jobcenter oder Sozialamt Hilfe beantragt hast. Leg einen Nachweis bei.

**Zu Audit C Nr. 5** (Hauptknopf „Mit dem Versorger Raten vereinbaren“): zulässig. Im Muster trennen:

> Grundversorgung: „Ich habe Ihre Androhung vom {Datum} erhalten. Bitte schicken Sie mir ein Angebot für eine Abwendungsvereinbarung mit zinsfreien Raten (§ 41g EnWG).“
> Anderer Tarif: „Ich bitte um eine Ratenzahlung.“ (kein Anspruch)

Hinweis im Text: „Ob du in der Grundversorgung bist, steht auf der Rechnung.“ Einstufung: Zahlen und Fristen sicher; Schutz vor der Sperre im Einzelfall möglich.

---

## 3. Pflegeleistungen

### Beträge (alle aus `src/rules.js`, verglichen mit dem Gesetzestext)

| Leistung | SoLo | Gesetz | Fundstelle (Abruf 21.11.2026) | Urteil |
|---|---|---|---|---|
| Pflegegeld PG 2/3/4/5 | 347 / 599 / 800 / 990 € | gleich | § 37 Abs. 1 SGB XI | richtig |
| Pflegedienst (Sachleistung) | bis 796 / 1.497 / 1.859 / 2.299 € | gleich | § 36 Abs. 3 SGB XI | richtig |
| Tages- und Nachtpflege | bis 721 / 1.357 / 1.685 / 2.085 € | gleich, zusätzlich zu Pflegegeld und Pflegedienst | § 41 Abs. 2, 3 SGB XI | richtig |
| Entlastungsbetrag | bis 131 € im Monat, ab PG 1, Rest bis 30.6. des Folgejahres | „bis zu 131 Euro“; Übertrag ins folgende Kalenderhalbjahr | § 45b Abs. 1 SGB XI | richtig |
| Gemeinsamer Jahresbetrag (Verhinderungs- und Kurzzeitpflege) | bis 3.539 € im Jahr, ab PG 2 | gleich; je höchstens 8 Wochen | § 42a Abs. 1, § 39 Abs. 1, § 42 Abs. 2 SGB XI; BMG „Verhinderungspflege“ („im Jahr 2026 insgesamt bis zu 3.539 Euro“) | richtig |
| Vertretung durch nahe Angehörige | höchstens das Doppelte des Pflegegelds, plus nachgewiesene Kosten | Pflegegeld „für bis zu zwei Monate“, Kosten zusätzlich, zusammen höchstens Jahresbetrag | § 39 Abs. 3 SGB XI | richtig |
| Erstattung nachträglich | „spätestens bis zum Ende des folgenden Jahres“ (`puTexte`) | gleich | § 39 Abs. 1 Satz 2 SGB XI | richtig; in `pflegeInfoBauen` („Tipp: … auch nachträglich“) fehlt die Frist |
| Halbes Pflegegeld läuft weiter | bis 8 Wochen im Jahr | je bis 8 Wochen für Kurzzeit- **und** Verhinderungspflege | § 37 Abs. 2 Satz 2, § 38 Satz 4 SGB XI | richtig |
| Kombination | Rest anteilig als Pflegegeld; Beispiel halb/halb | gleich; **6 Monate an das Verhältnis gebunden** | § 38 Sätze 1 bis 3 SGB XI | richtig; Bindung fehlt |
| Umwandlung | bis 40 % des Pflegedienst-Betrags für Hilfen im Alltag | gleich, ohne Antrag vorab | § 45a Abs. 4 SGB XI | richtig |
| Pflicht-Beratung | PG 2 bis 5 einmal im halben Jahr, PG 4 und 5 auf Wunsch jedes Vierteljahr | gleich | § 37 Abs. 3 Satz 1 SGB XI | richtig |
| Pflegehilfsmittel, Umbau | 42 € im Monat; 4.180 € je Maßnahme, zusammen bis zum Vierfachen | 42 €; 4.180 €; 16.720 € | § 40 Abs. 2, 4 SGB XI | richtig |
| Wohngruppenzuschlag | 224 €, „§ 38a SGB XI“ | 224 €, aber **§ 45f SGB XI** (§ 38a gibt es nicht mehr) | § 45f Abs. 1, § 28a Nr. 12 SGB XI | **Paragraf falsch** |
| „Wer nur stundenweise vertreten wird (weniger als 8 Stunden am Tag), behält das volle Pflegegeld.“ (`app.js`, Abschnitt `pi-verh`) | Steht nicht im Gesetz und nicht auf der BMG-Seite (dort nur: „kann auch stundenweise in Anspruch genommen werden“). Praxis der Pflegekassen. | § 37 Abs. 2 SGB XI; BMG „Verhinderungspflege“ | **nur „möglich“** |

Stand der Beträge: § 30 Abs. 1 SGB XI: Erhöhung zum 1.1.2025, die nächste zum 1.1.2028. 2026 gelten also die Beträge von 2025. SGB XI zuletzt geändert durch G v. 24.7.2026 (BGBl. 2026 I Nr. 228).

**Entwurf beachten:** Pflegeneuordnungsgesetz (BT-Drs. 21/8869), 1. Lesung 5.11.2026, **nicht beschlossen**, Nachbesserungen angekündigt. Geplant unter anderem: Entlastungsbetrag in PG 1 fällt weg, Umbau der Budgets, Wegfall der Erhöhung 2028. Der Merker in `rules.js` („nicht anzeigen“) ist richtig. Vor dem 1.1.2027 neu prüfen (`pruefenAb` steht schon auf 2027-01-01).

### Vereinfachte Darstellung aus Audit D (Nr. 4)

Vorschlag: „Wer pflegt? ◉ Angehörige → Pflegegeld 599 € ○ Pflegedienst → bis 1.497 € ○ Beides gemischt · Dazu immer: Entlastungsbetrag 131 € · Vertretung 3.539 €/Jahr · Tagespflege …“

| Teil | Rechtlich sauber? | Auflage |
|---|---|---|
| Wahl Pflegegeld / Pflegedienst / gemischt | ja (§§ 36, 37, 38 SGB XI) | „Angehörige“ erweitern: auch Freunde und Nachbarn. Bei „gemischt“ Satz: „An die Aufteilung bist du 6 Monate gebunden.“ |
| „Pflicht-Beratung alle 6 Monate“ sichtbar unter Pflegegeld | ja (§ 37 Abs. 3) | Wortlaut: „kann kürzen“ beibehalten, nicht „wird gestrichen“ |
| „Dazu immer: Entlastungsbetrag 131 €“ | nur mit „bis“ und „kein Geld aufs Konto“ | „bis 131 € im Monat für anerkannte Hilfen“. „Immer“ stimmt nur für häusliche Pflege |
| „Vertretung 3.539 €/Jahr“ | nur mit „bis“ | „bis 3.539 € im Jahr, die Pflegekasse bezahlt Rechnungen“. Nicht bei PG 1 zeigen |
| Tagespflege „dazu“ | ja (§ 41 Abs. 3) | Betrag mit „bis“ |
| Paragrafen nur im Beratungsmodus (Audit D Nr. 6) | zulässig | Quelle und Stand der Beträge bleiben sichtbar |

**Textvorschlag:**

> **Wer pflegt?**
> ◉ Familie, Freunde oder Nachbarn: **Pflegegeld {599 €} im Monat** aufs Konto.
> ○ Ein Pflegedienst: **bis {1.497 €} im Monat**. Der Dienst rechnet mit der Pflegekasse ab.
> ○ Beides gemischt: Nutzt der Pflegedienst nur einen Teil, kommt der Rest anteilig als Pflegegeld. An die Aufteilung bist du 6 Monate gebunden.
>
> Mit Pflegegeld kommt einmal im halben Jahr eine kostenlose Pflicht-Beratung ins Haus. Fällt sie aus, kann die Pflegekasse das Pflegegeld kürzen.
>
> **Zusätzlich (kein Geld aufs Konto, die Pflegekasse bezahlt Rechnungen):** bis 131 € im Monat für Hilfe im Alltag · bis 3.539 € im Jahr für Vertretung · Tagespflege bis {1.357 €} im Monat.
> Den genauen Anspruch legt die Pflegekasse fest.

Einstufung: Beträge sicher; Anspruch im Einzelfall möglich (die Pflegekasse entscheidet).

**Zu Audit D Nr. 12** (Fragen überspringen bei „meistens allein“): Die Punktwertung nach § 15 SGB XI und Anlagen 1 und 2 darf sich nicht ändern. Überspringen nur, wenn die übersprungene Frage mit dem Wert der Oberantwort belegt wird und das Ergebnis mit „Schätzung“ gekennzeichnet bleibt. Vor Umsetzung eigene Prüfung mit Testfällen.

---

## 4. Mietenstufe aus der Postleitzahl

### Was SoLo jetzt tut

| Stelle | Verhalten |
|---|---|
| `src/plz.js`, `content/plz-data.json` | PLZ → Ort und Kreis aus GeoNames (nicht amtlich, CC BY 4.0, Abruf 5.11.2026), Stufe aus der Anlage zur WoGV „ab 1. Januar 2023“. 8.920 PLZ; 218 mit mehreren Stufen; 160 ohne Stufe; bei 5.580 steht der Ort nicht einzeln in der Verordnung (Stufe des Kreises). Vermerk in den Daten: „Bayern geprüft, übrige Länder automatisch“. |
| `src/app.js` `plzUpdate()` | Eindeutig: setzt die Stufe selbst, zeigt „Gefunden: {Ort}. Mietenstufe {Stufe}.“, blendet die Felder Bundesland und Mietenstufe aus. Mehrdeutig: fragt nach dem Wohnort. Zusätzlich Aufklapper „Dein Ort kann zu einer größeren Gemeinde gehören …“. |
| `de.json` `plz.source`, `wgmax.d.stufe` | „Mietenstufen gültig seit 1.1.2023 (aktuelle Fassung). Die Wohngeldstelle entscheidet verbindlich.“ |

### Was rechtlich gilt

| Punkt | Regel | Fundstelle (Abruf 21.11.2026) |
|---|---|---|
| Maßstab | Die Stufe hängt an der **Gemeinde**, nicht an der PLZ. Gemeinden ab 10.000 Einwohnern einzeln, kleinere über den Kreis. | § 12 Abs. 1 bis 3 WoGG; § 1 Abs. 3 WoGV mit Anlage („Mietenstufen der Gemeinden nach Ländern ab 1. Januar 2023“, BGBl. I 2022 S. 2166; Gebietsstand 31.3.2021) |
| Geltung heute | Liste von 2023 gilt weiter. Die Fortschreibung alle 2 Jahre ändert Höchstbeträge, nicht die Stufen. | § 43 Abs. 1, 2 WoGG; WoGV zuletzt geändert durch V v. 21.10.2024 (BGBl. 2024 I Nr. 314) |
| **Geplant ab 1.1.2027** | Entwurf „Gesetz zur Vereinfachung und Fortentwicklung des Wohngeldgesetzes“: Art. 2 **ersetzt die Anlage** („Mietenstufen … ab dem 1. Januar 2027“, Gebietsstand 31.3.2025). Laut Begründung ändern sich **537 von 1.602 Gemeinden** (411 herauf, 126 herab) und **75 von 278 Kreisen** (60 herauf, 15 herab). Dazu neue Anlage 1 (Höchstbeträge), halbe Heizkostenkomponente, keine Fortschreibung 2027. Inkrafttreten laut Art. 3: 1.1.2027. Laufende Bewilligungen bleiben bis zu ihrem Ende. | BR-Drs. 474/26 vom 14.8.2026; BT-Drs. 21/8284 vom 30.9.2026 |
| Stand des Entwurfs | 1. Lesung 8.10.2026, Anhörung 4.11.2026. Ausschüsse des Bundesrats empfehlen Ablehnung, auch der neuen Stufen. **Nicht beschlossen, nicht verkündet.** | bundestag.de, Textarchiv KW 45/2026; BR-Drs. 474/1/26 vom 11.9.2026 |

### Bewertung

| Frage | Antwort | Einstufung |
|---|---|---|
| Darf SoLo die Stufe aus der PLZ vorbelegen? | Ja. Es gibt keine Vorschrift dagegen; es ist eine Rechenhilfe. | zulässig |
| Ist das Ergebnis sicher? | Nein. PLZ und Gemeinde decken sich nicht (Beispiel 91054: Buckenhof Stufe III über den Kreis, Erlangen Stufe IV). Die Ortsliste stammt nicht aus amtlicher Quelle, Ortsteile können fehlen, Gebietsstand 2021. | **möglich** |
| Darf man Mietenstufe und Bundesland „nur unter Mehr“ zeigen (Audit A Nr. 7)? | **Nicht ganz.** Der Fachbegriff darf weg, aber **Ort und Stufe müssen sichtbar bleiben** und der Nutzer muss den Ort bestätigen oder ändern können. Bei mehreren Möglichkeiten weiter fragen, nie still wählen. | Auflage |
| Wirkung auf das Ergebnis | Eine Stufe Unterschied ändert den Höchstbetrag der Miete und damit Anspruch und Höhe. Das Wohngeld-Ergebnis darf deshalb aus einer nur per PLZ gesetzten Stufe keine feste Zusage machen. | möglich |
| Ab 1.1.2027 | Wird der Entwurf Gesetz, ist die eingebaute Liste für etwa ein Drittel der Gemeinden falsch, dazu ändern sich Höchstbeträge und Formel. Dann: Liste und Tabellen tauschen, Stand im Text ändern, bis dahin kein „sicher“. Für Bewilligungen, die vor 2027 beginnen, gilt die alte Liste weiter. | offen |

### Textvorschlag

> **Eindeutig:** Wohnort: **{Ort}** · Mietenstufe {III} [Ändern]
> Stimmt der Ort? Die Mietenstufe hängt von deiner Gemeinde ab, nicht von der Postleitzahl.
>
> **Mehrere Möglichkeiten:** Zu dieser Postleitzahl gehören mehrere Orte. Wähle deinen Wohnort.
>
> **Unter „Mehr“:** Die Mietenstufe sagt, wie teuer Wohnen in deiner Gemeinde ist (I günstig bis VII teuer). Danach richtet sich, wie viel Miete beim Wohngeld höchstens zählt. Quelle: Anlage zur Wohngeldverordnung, Stand 1.1.2023. Verbindlich entscheidet die Wohngeldstelle.
>
> **Im Ergebnis, wenn die Stufe nur aus der PLZ kommt:** Gerechnet mit Mietenstufe {III} für {Ort}. Gehört deine Adresse zu einer anderen Gemeinde, kann der Betrag anders sein.

Nicht schreiben: „Deine Mietenstufe ist III.“ ohne Ort und ohne Möglichkeit zu ändern. Kein Hinweis auf 2027, solange das Gesetz nicht verkündet ist (Regel im Projekt: nur geltendes Recht anzeigen).

---

## Offen geblieben

| Punkt | Warum offen | Nächster Schritt |
|---|---|---|
| Volles Pflegegeld bei stundenweiser Vertretung unter 8 Stunden | Keine amtliche Fundstelle beim BMG oder im Gesetz gefunden; Rundschreiben des GKV-Spitzenverbands nicht abgerufen | Satz auf „in der Regel, frag deine Pflegekasse“ ändern oder Fundstelle nachtragen |
| Tag des Inkrafttretens von §§ 41f, 41g EnWG | Geltende Fassung bestätigt, Fundstelle im BGBl. nicht einzeln abgerufen | Für `docs/QUELLEN.md` nachtragen |
| Wohngeld 2027, Mietrecht (Schonfrist bei ordentlicher Kündigung), Pflegeneuordnung | Entwürfe, nicht beschlossen | Vor dem 1.1.2027 und nach jeder Verkündung neu prüfen |
| Abgleich der PLZ-Daten mit der Entwurfs-Anlage 2027 | Nicht Teil dieses Auftrags | Erst nach Verkündung; dann `tools/build-plz-data.js` mit neuer Anlage |
| Überprüfungsantrag gegen Rückforderungs- und Aufhebungsbescheide | Im Grundsatz § 44 SGB X, Einzelheiten Rechtsprechung, hier nicht geprüft | In SoLo nur allgemein nennen und an Beratung verweisen |

## Prüfvermerk (21.11.2026)

Schwere: hoch = kann zu einem Nachteil für Nutzer führen · mittel = irreführend · gering = Zitat oder Feinheit. „Korrektur“ ist ein Vorschlag; in der App wurde nichts geändert.

| Befund | Schwere | Korrektur | Quelle (Abruf 21.11.2026) |
|---|---|---|---|
| Abgelaufene Widerspruchsfrist wird wie eine laufende gezeigt; Widerspruch und „Frist merken“ normal angeboten | hoch | Kasten „Frist vorbei“ mit zwei Prüffragen, Hauptweg Überprüfungsantrag, Nachzahlung 1 Jahr (Jobcenter, Sozialamt) bzw. 4 Jahre, kein „Frist merken“ | § 44 SGB X; § 40 Abs. 1 SGB II; § 116a SGB XII; §§ 66, 84 SGG (gesetze-im-internet.de) |
| Vorschlag Audit B nennt Überprüfung ohne Grenzen (Zeitraum, kein Aufschub) | mittel | Wortlaut aus Abschnitt 1 verwenden | wie oben |
| Wiedereinsetzung: Grundlage beim Widerspruch ist § 67 SGG (1 Monat), beim Wohngeld § 60 VwGO (2 Wochen), nicht § 27 SGB X | mittel | Fristen je Stelle unterscheiden, § 27 SGB X nicht nennen | § 84 Abs. 2 Satz 3, § 67 SGG; § 70 Abs. 2, § 60 VwGO |
| Hinweis „ein Jahr (§ 66 SGG)“ auch beim Wohngeld; „oder ist sie falsch“ fehlt | gering | Text ergänzen, Paragraf je Stelle | § 66 Abs. 2 SGG; § 58 Abs. 2 VwGO |
| Kurztext Miete „Spätestens 2 Monate nach Zustellung der Räumungsklage zahlen“ wirkt wie Zeit zum Abwarten; Vorschlag Audit C „Letzte Rettung“ sagt zu viel zu | mittel | Kurz: „Sofort handeln. Warte nicht auf die Klage.“; lang wie Abschnitt 2a | § 569 Abs. 3 Nr. 2, § 573 BGB |
| „Mehr als eine Monatsmiete über zwei Monate“ ungenau | gering | Beide Fälle nennen (zwei Termine > 1 Monatsmiete; länger: 2 Monatsmieten) | § 543 Abs. 2 Nr. 3, § 569 Abs. 3 Nr. 1 BGB |
| Stromsperre: alle Zahlen und Fristen richtig; Grundlage ist §§ 41f, 41g EnWG, nicht mehr § 19 StromGVV | kein Fehler | Prüflisten und Quellen auf EnWG umstellen; zweiten Schutzgrund („bald zahlen können“) ergänzen | § 41f, § 41g EnWG; § 19 StromGVV |
| Vorschlag Audit C Strom nennt nur die 8 Werktage | gering | Beide Schritte nennen (4 Wochen Androhung, 8 Werktage Ankündigung) | § 41f Abs. 1, 5 EnWG |
| Pflegebeträge alle richtig | kein Fehler | keine | §§ 36, 37, 39, 40, 41, 42, 42a, 45b SGB XI |
| Wohngruppenzuschlag mit „§ 38a SGB XI“ angezeigt | gering | `recht: '§ 45f SGB XI'` in `rules.js` (2 Stellen: Kommentar und Liste) | § 45f Abs. 1 SGB XI |
| „Stundenweise unter 8 Stunden: volles Pflegegeld“ ohne amtliche Quelle | mittel | „in der Regel“ und Nachfrage bei der Pflegekasse, oder Quelle nachtragen | § 37 Abs. 2 SGB XI; BMG „Verhinderungspflege“ |
| `pflegeInfoBauen`: „Antrag auch nachträglich“ ohne Frist | gering | „spätestens bis zum Ende des folgenden Jahres“ ergänzen (steht in `puTexte` schon) | § 39 Abs. 1 Satz 2 SGB XI |
| Darstellung Audit D: „Dazu immer 131 € · 3.539 €“ ohne „bis“, Bindung 6 Monate fehlt | mittel | Wortlaut aus Abschnitt 3 | § 38 Satz 3, § 45b Abs. 1, § 42a Abs. 1 SGB XI |
| Mietenstufe aus PLZ unter „Mehr“ verstecken (Audit A Nr. 7) | mittel | Ort und Stufe sichtbar, Nutzer bestätigt; Ergebnis nennt Ort und Stufe | § 12 Abs. 3 WoGG; Anlage zu § 1 Abs. 3 WoGV |
| Mietenstufen-Liste 2023 kann ab 1.1.2027 für rund ein Drittel der Gemeinden überholt sein | hoch (ab 2027, falls beschlossen) | Verkündung beobachten; dann Liste, Höchstbeträge und Formel tauschen | BR-Drs. 474/26; BT-Drs. 21/8284 |
