# Entwurf: Schulden-Liste bei den Schulden-Tipps (Geld sparen → Schulden und Pfändung)

Stand: 20.11.2026 · Grundlage: Code-Stand PR #42 in `/home/claude/s1` (nur gelesen) · Aufgabe `b-schuldenliste`

---

## 1. Kurzfassung (was der Nutzer sieht)

1. Auf der Seite „Schulden und Pfändung“ (Geld sparen → Schulden) gibt es einen neuen Knopf **„Meine Schulden-Liste“**. Er steht direkt unter „Erste Schritte“ Punkt 1 („aufschreiben, wem du wie viel schuldest“). Eine neue Startkachel gibt es nicht.
2. In der Liste trägt man jede Schuld ein: Gläubiger, wofür, Betrag am Anfang und jetzt, Rate, Fälligkeit, Stand (Mahnung … Pfändung), Aktenzeichen, Notiz. Oben stehen die **Summe der Schulden**, die **Raten im Monat** und der Vergleich mit dem **frei verfügbaren Betrag aus dem Haushaltsplan**.
3. Die Liste ist **nach Dringlichkeit geordnet**. Ganz oben steht „Frist läuft“ (z. B. Mahnbescheid, Vollstreckungsbescheid). Danach kommt „Zuerst“ (Miete, Energie, Unterhalt, Geldstrafe), dann „Auch wichtig“, dann „Kann meist warten“. Warum, steht jeweils mit Gesetz zum Aufklappen.
4. Ein **Blatt für die Schuldnerberatung** zum Drucken bzw. als PDF: Gläubigerliste, Summen, Haushaltsplan kurz, Liste der Unterlagen zum Mitbringen. Ohne Namen, höchstens mit Kürzel. Notizen werden nur auf Wunsch mitgedruckt. Dazu ein CSV-Export.
5. Zum Aufklappen: **„Kostenlose Schuldnerberatung finden“** (Suche der BAG-SB, Jobcenter § 16a SGB II, Sozialamt § 11 Abs. 4 SGB XII). Gespeichert wird alles nur auf dem Gerät, je Vorgang. Verschlüsselt ist es nur, wenn eine PIN gesetzt ist.

---

## 2. Inhalte und Texte (de + Einfache Sprache), mit Quellen-Fußnoten

Schlüssel-Präfix: **`sl.*`** (Schulden-Liste). Wie bei `hb.*` und `az.*` stehen die Texte in eigenen Sprachdateien: `src/lang/schulden/<Sprache>.json` (13 Sprachen) und `src/lang/einfach/schulden.json`. So gibt es keine Konflikte in `src/lang/*.json`. Platzhalter wie bei `hb.*`: `{b}` = Betrag (über `t(k, { b: { eur: … } })`), `{n}` = Zahl, `{d}` = Datum.

### 2.1 Einstieg (auf der Seite „Schulden und Pfändung“)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `sl.knopf` | Meine Schulden-Liste | Liste mit meinen Schulden |
| `sl.knopf.t` | Wem du wie viel schuldest, was zuerst wichtig ist, Blatt für die Beratung | Wem schulde ich Geld? Was ist zuerst wichtig? |

### 2.2 Kopf der Liste

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `sl.h` | Meine Schulden-Liste | Meine Schulden |
| `sl.lead` | Schreib alle Schulden auf, auch bei Familie und Freunden. Die Liste zeigt, was zuerst wichtig ist. Sie hilft dir auch bei der Schuldnerberatung.[^vz-vorb][^ms-sort] | Schreib alle Schulden auf. Auch Schulden bei Familie oder Freunden. Die Liste zeigt: Was ist zuerst wichtig? Die Liste hilft bei der Schuldner-Beratung. |
| `sl.leer` | Noch keine Schulden eingetragen. | Hier steht noch nichts. |
| `sl.neu` | Schuld eintragen | Neue Schuld aufschreiben |
| `sl.privat` | Die Liste bleibt auf diesem Gerät, im geöffneten Vorgang. Sie wird nicht ins Internet geschickt. Verschlüsselt ist sie nur, wenn du in den Einstellungen eine PIN festlegst. | Die Liste bleibt auf deinem Handy. Sie wird nicht ins Internet geschickt. Andere Menschen benutzen dein Handy auch? Dann leg in den Einstellungen eine PIN fest. |

### 2.3 Summen und Vergleich mit dem Haushaltsplan

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `sl.sum.gesamt` | Schulden zusammen: etwa {b} | So viel Schulden hast du: etwa {b} |
| `sl.sum.n` | {n} offene Forderungen | {n} Schulden sind noch offen |
| `sl.sum.raten` | Raten im Monat zusammen: {b} | So viel zahlst du jeden Monat ab: {b} |
| `sl.sum.ohneBetrag` | Bei {n} Forderungen fehlt der Betrag. Die Summe ist deshalb zu klein. | Bei {n} Schulden fehlt der Betrag. Darum stimmt die Summe noch nicht. |
| `sl.sum.check` | Kontrolle: Gruppen zusammen {b1} = Gesamtsumme {b2} | Kontrolle: Alles zusammen ist {b2}. |
| `sl.hh.frei` | Im Haushaltsplan bleiben vor Raten etwa {b} im Monat frei. | Nach Miete, Essen und anderen festen Kosten bleiben etwa {b} im Monat. |
| `sl.hh.reicht` | Nach deinen Raten aus dieser Liste bleiben etwa {b}. | Nach den Raten bleiben dir etwa {b}. |
| `sl.hh.zuviel` | Deine Raten sind etwa {b} höher als das, was frei ist. Sag keine neuen Raten zu, bevor dich eine Schuldnerberatung beraten hat.[^ms-vorb] | Deine Raten sind zu hoch: etwa {b} zu viel. Versprich niemandem neue Raten. Geh erst zur Schuldner-Beratung. |
| `sl.hh.abweichung` | Im Haushaltsplan stehen {a} für Raten, in dieser Liste {b}. Bitte trag im Haushaltsplan denselben Betrag ein. | Im Haushalts-Plan steht {a} für Raten. Hier steht {b}. Schreib im Plan den gleichen Betrag. |
| `sl.hh.keiner` | Wie viel Geld im Monat frei ist, rechnet der Haushaltsplan aus. | Wie viel Geld bleibt dir im Monat? Das rechnet der Haushalts-Plan aus. |
| `sl.hh.knopf` | Zum Haushaltsplan | Zum Haushalts-Plan |

### 2.4 Eingabe einer Schuld

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `sl.f.glaeubiger` | Wem schuldest du Geld? (Gläubiger) | Wem schuldest du Geld? |
| `sl.f.glaeubiger.h` | Firma, Amt oder Person. Steht meist oben im Brief. | Eine Firma, ein Amt oder ein Mensch. Das steht oben im Brief. |
| `sl.f.art` | Wofür? | Wofür ist das Geld? |
| `sl.f.anfang` | Betrag am Anfang | So viel war es am Anfang |
| `sl.f.stand` | Betrag jetzt (laut letztem Brief) | So viel ist es jetzt (im letzten Brief) |
| `sl.f.stand.h` | Mit Zinsen und Gebühren. Weißt du es nicht genau, lass das Feld leer. | Mit Zinsen und Gebühren. Du weißt es nicht? Dann lass es leer. |
| `sl.f.standDatum` | Stand vom | Datum vom letzten Brief |
| `sl.f.rate` | Vereinbarte Rate im Monat | So viel zahlst du jeden Monat |
| `sl.f.faellig` | Nächste Zahlung fällig am | Wann musst du das nächste Mal zahlen? |
| `sl.f.status` | Wo steht die Sache? | Was ist passiert? |
| `sl.f.zugestellt` | Zugestellt am (Datum auf dem gelben Umschlag) | Wann kam der Brief? (Datum auf dem gelben Umschlag) |
| `sl.f.az` | Aktenzeichen oder Kundennummer | Nummer im Brief (Aktenzeichen) |
| `sl.f.anschrift` | Anschrift des Gläubigers (freiwillig) | Adresse von der Firma oder dem Amt (wenn du willst) |
| `sl.f.anschrift.h` | Straße, Hausnummer, Postleitzahl, kein Postfach. Das braucht die Beratungsstelle.[^vz-vorb] | Straße, Haus-Nummer und Post-Leitzahl. Kein Post-Fach. |
| `sl.f.notiz` | Notiz (nur für dich) | Notiz (nur für dich) |
| `sl.speichern` / `sl.abbrechen` / `sl.bearbeiten` / `sl.loeschen` | Speichern / Abbrechen / Ändern / Löschen | Speichern / Zurück / Ändern / Löschen |
| `sl.loeschen.frage` | „{name}“ wirklich aus der Liste löschen? | Willst du „{name}“ wirklich löschen? |
| `sl.fehlt.glaeubiger` | Bitte schreib, wem du das Geld schuldest. | Bitte schreib: Wem schuldest du Geld? |

**Art der Forderung** (`sl.art.<id>`; Auswahlliste, keine Kacheln, deshalb keine Farbgruppe):

| id | Deutsch | Einfache Sprache | Stufe |
|---|---|---|---|
| `miete` | Miete oder Wohnung | Miete | 1 |
| `energie` | Strom, Gas, Heizung | Strom, Gas, Heizung | 1 |
| `unterhalt` | Unterhalt | Unterhalt (Geld für Kinder oder Ex-Partner) | 1 |
| `geldstrafe` | Geldstrafe (Strafgericht, Staatsanwaltschaft) | Geld-Strafe vom Gericht | 1 |
| `kranken` | Krankenversicherung | Kranken-Kasse | 2 |
| `bussgeld` | Bußgeld (zum Beispiel Verkehr) | Buß-Geld (zum Beispiel zu schnell gefahren) | 2 |
| `behoerde` | Amt fordert Geld zurück (zum Beispiel Jobcenter, Familienkasse, Wohngeldstelle) | Ein Amt will Geld zurück | 2 |
| `bank` | Bank, Kredit, Dispo | Bank oder Kredit | 3 |
| `inkasso` | Inkasso oder Anwalt (Auftraggeber noch unklar) | Inkasso-Firma | 3 |
| `handy` | Handy, Internet | Handy oder Internet | 3 |
| `versand` | Versandhandel, Ratenkauf | Bestellt im Internet oder auf Raten gekauft | 3 |
| `sonst` | Sonstiges (zum Beispiel Familie, Freunde) | Etwas anderes (zum Beispiel Familie, Freunde) | 3 |

**Stand der Sache** (`sl.st.<id>`; Auswahlliste; Anzeige als Wort-Pille mit Zustandsfarbe, siehe 4.6):

| id | Deutsch | Einfache Sprache | Wirkung |
|---|---|---|---|
| `offen` | Rechnung offen | Rechnung nicht bezahlt | – |
| `mahnung` | Mahnung bekommen | Mahnung bekommen | – |
| `inkasso` | Brief vom Inkasso oder Anwalt | Brief von einer Inkasso-Firma | – |
| `drohung` | Kündigung, Sperre oder Haft angedroht | Es droht: Kündigung, Strom-Sperre oder Gefängnis | **dringend** |
| `mahnbescheid` | Mahnbescheid vom Gericht | Mahn-Bescheid vom Gericht (gelber Umschlag) | **Frist** (Zustelldatum) |
| `vollstreckungsbescheid` | Vollstreckungsbescheid vom Gericht | Vollstreckungs-Bescheid vom Gericht (gelber Umschlag) | **Frist** (Zustelldatum) |
| `pfaendung` | Pfändung (Lohn oder Konto) | Pfändung: Geld wird vom Lohn oder Konto genommen | **dringend** |
| `ratenzahlung` | Ratenzahlung läuft | Ich zahle in Raten ab | – |
| `widersprochen` | Widersprochen oder strittig | Ich habe widersprochen | – |
| `erledigt` | Bezahlt oder erledigt | Fertig bezahlt | zählt nicht zur Summe |

### 2.5 „Was zuerst?“ (Stufen und Begründungen, Begründung zum Aufklappen)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `sl.prio.h` | Was ist zuerst wichtig? | Was ist zuerst wichtig? |
| `sl.prio.lead` | So empfehlen es Schuldnerberatungen: zuerst Essen, Miete und Strom. Auch Geldstrafen haben Vorrang. Raten an Banken, Inkasso oder Versandhandel kommen ganz zum Schluss.[^ms-vorb][^vz-engpass] | Das sagen Schuldner-Beratungen: Zuerst Essen, Miete und Strom bezahlen. Auch Geld-Strafen sind wichtig. Banken, Inkasso und Versand-Handel kommen zum Schluss. |
| `sl.stufe.frist` | Frist läuft | Schnell handeln! |
| `sl.stufe.1` | Zuerst: sichert Wohnung, Strom und Freiheit | Zuerst bezahlen |
| `sl.stufe.2` | Auch wichtig | Auch wichtig |
| `sl.stufe.3` | Kann meist warten, bis du beraten wurdest | Kann meistens warten |
| `sl.frist.mahnbescheid` | Mahnbescheid zugestellt am {d}. Widersprich möglichst bis {frist}, wenn die Forderung nicht oder nicht ganz stimmt. Danach kann jederzeit ein Vollstreckungsbescheid kommen.[^zpo692][^zpo694] | Der Mahn-Bescheid kam am {d}. Stimmt das Geld nicht? Dann widersprich bis {frist}. Sonst kann das Gericht erlauben, dass dein Geld genommen wird. |
| `sl.frist.vollstreckungsbescheid` | Vollstreckungsbescheid zugestellt am {d}. Einspruch nur bis {frist} möglich (Notfrist). Achtung: Mit dem Vollstreckungsbescheid darf schon jetzt gepfändet werden, auch wenn du Einspruch einlegst. Hol dir sofort Hilfe.[^zpo700][^zpo339] | Der Vollstreckungs-Bescheid kam am {d}. Du kannst nur bis {frist} etwas dagegen tun. Schon jetzt darf Geld von deinem Lohn oder Konto genommen werden. Hol dir sofort Hilfe. |
| `sl.frist.mahnbescheid.vorbei` | Die 2 Wochen seit der Zustellung am {d} sind vorbei. Ein Widerspruch ist trotzdem noch möglich, solange das Gericht noch keinen Vollstreckungsbescheid erlassen hat. Handle heute.[^zpo694] | Die 2 Wochen sind vorbei. Du kannst vielleicht trotzdem noch widersprechen. Mach das heute. Hol dir Hilfe. |
| `sl.frist.vollstreckungsbescheid.vorbei` | Die Einspruchsfrist seit der Zustellung am {d} ist nach der Rechnung der App vorbei. Geh sofort mit dem Bescheid und dem Umschlag zu einer Schuldnerberatung oder Rechtsberatung. Dort wird geprüft, was noch möglich ist. | Die Zeit für den Einspruch ist wohl vorbei. Geh sofort mit dem Brief und dem Umschlag zur Schuldner-Beratung. |
| `sl.frist.ungefaehr` | Ungefähr gerechnet: 2 Wochen ab Zustellung. Fällt das Ende auf Samstag, Sonntag oder Feiertag, endet die Frist am nächsten Werktag. Die App kennt nur die bundesweiten Feiertage, nicht die deines Bundeslands. Sie nennt deshalb eher einen zu frühen Tag. Maßgeblich ist das Zustelldatum, das der Zusteller auf dem Umschlag vermerkt hat.[^zpo222][^zpo180] | Die App rechnet nur ungefähr. Wichtig ist das Datum auf dem Umschlag. |
| `sl.frist.ohneDatum` | Schreib das Datum vom gelben Umschlag dazu, dann rechnet die App die Frist ungefähr aus. | Schreib das Datum vom gelben Umschlag auf. |
| `sl.dringend` | Dringend: Hol dir heute noch Hilfe bei einer Schuldnerberatung und sag dort, dass Wohnung, Strom, Konto oder Freiheit in Gefahr sind. | Das ist dringend! Ruf heute eine Schuldner-Beratung an. Sag: Es geht um Wohnung, Strom, Konto oder Gefängnis. |
| `sl.warum.miete` | Bei Mietschulden kann der Vermieter fristlos kündigen: wenn du an zwei Terminen hintereinander mehr als eine Monatsmiete schuldest oder über längere Zeit zwei Monatsmieten. Zahlst du spätestens 2 Monate nach Zustellung der Räumungsklage alles nach oder verpflichtet sich das Amt dazu, wird die fristlose Kündigung unwirksam, aber nur einmal in 2 Jahren. Hat der Vermieter zusätzlich mit Frist gekündigt, kann diese Kündigung trotz Zahlung bestehen bleiben (wie im vorhandenen Text `sp.schulden.miete`). Jobcenter oder Sozialamt können Mietschulden übernehmen, meist als Darlehen.[^bgb543][^bgb569][^sgb2-22][^sgb12-36] | Hast du Miet-Schulden von mehr als einer Monats-Miete? Dann kann der Vermieter dir kündigen. Du kannst die Wohnung verlieren. Das Jobcenter oder Sozial-Amt kann helfen. |
| `sl.warum.energie` | Der Versorger darf Strom oder Gas erst sperren, wenn du nach einer Mahnung mindestens zwei Monatsabschläge und mindestens 100 € im Rückstand bist. Er muss die Sperre 4 Wochen vorher androhen und 8 Werktage vorher ankündigen. Die Sperre ist nicht erlaubt, wenn sie dich unverhältnismäßig hart trifft (zum Beispiel Gefahr für die Gesundheit); schreib das dem Versorger. In der Grundversorgung kannst du nach der Androhung eine Abwendungsvereinbarung mit zinsfreien Raten verlangen. Bekommst du Grundsicherungsgeld oder Sozialhilfe und droht die Sperre, kannst du beim Jobcenter oder Sozialamt ein Darlehen beantragen. Ob du es bekommst, entscheidet das Amt im Einzelfall.[^enwg41f][^enwg41g][^sgb2-24][^fw24] | Hast du Strom- oder Gas-Schulden? Dann kann der Strom abgestellt werden. Vorher muss die Firma dir schreiben. Beim Grund-Versorger kannst du Raten ohne Zinsen verlangen. Bekommst du Geld vom Jobcenter oder Sozial-Amt? Dann frag dort: Könnt ihr mir das Geld leihen? |
| `sl.warum.unterhalt` | Unterhalt sichert den Lebensunterhalt deiner Kinder oder anderer Berechtigter. Wer sich der Unterhaltspflicht entzieht, kann sich strafbar machen. Wegen Unterhalt darf auch mehr vom Lohn gepfändet werden als sonst.[^stgb170][^zpo850d][^vz-engpass] | Unterhalt ist Geld für deine Kinder oder andere. Das ist sehr wichtig. Wenn du nicht zahlst, kann das eine Straf-Tat sein. |
| `sl.warum.geldstrafe` | Kann eine Geldstrafe nicht eingetrieben werden, droht Ersatzfreiheitsstrafe: ein Tag Haft für zwei Tagessätze. Frag früh bei der Staatsanwaltschaft nach Ratenzahlung. In vielen Ländern kann man die Haft durch gemeinnützige Arbeit abwenden.[^stgb43][^stpo459a][^stpo459e][^egstgb293][^ms-vorb] | Bezahlst du eine Geld-Strafe nicht? Dann kannst du ins Gefängnis kommen. Frag bei der Staats-Anwaltschaft nach Raten. Oft geht auch Arbeit statt Gefängnis. |
| `sl.warum.kranken` | Gesetzliche Krankenkasse: Bist du mit Beiträgen für 2 Monate im Rückstand und zahlst trotz Mahnung nicht, ruht dein Anspruch auf Leistungen. Es bleiben nur die Behandlung akuter Krankheiten und Schmerzen, Leistungen bei Schwangerschaft und Mutterschaft und Untersuchungen zur Früherkennung. Bist du hilfebedürftig (Grundsicherungsgeld, Sozialhilfe), ruht nichts. Mit einer Ratenvereinbarung bekommst du wieder alle Leistungen, solange du die Raten pünktlich zahlst. Private Krankenversicherung: Nach zwei Mahnungen ruht der Vertrag und du bist im Notlagentarif versichert.[^sgb5-16][^vvg193] | Schulden bei der Kranken-Kasse? Dann bezahlt die Kasse vielleicht nur noch das Nötigste, zum Beispiel bei starken Schmerzen. Mach Raten mit der Kasse aus. Dann bezahlt sie wieder alles. |
| `sl.warum.bussgeld` | Zahlst du ein Bußgeld nicht und zeigst nicht, dass du es nicht zahlen kannst, kann das Gericht Erzwingungshaft anordnen. Sag der Behörde früh, dass du nicht zahlen kannst, und frag nach Raten.[^owig96] | Bezahlst du ein Buß-Geld nicht und sagst nichts? Dann kann das Gericht Haft anordnen. Sag dem Amt früh: Ich kann nicht zahlen. Frag nach Raten. |
| `sl.warum.behoerde` | Das Jobcenter kann Rückforderungen mit deinem laufenden Grundsicherungsgeld verrechnen (10 oder 30 Prozent des Regelbedarfs). Zusammen dürfen es höchstens 30 Prozent sein. Prüfe den Bescheid. Gegen einen falschen Bescheid des Jobcenters kannst du innerhalb eines Monats nach Erhalt Widerspruch einlegen. Bei anderen Ämtern steht die Frist am Ende des Bescheids.[^sgb2-43][^sgg84] | Will das Jobcenter Geld zurück? Dann zieht es oft jeden Monat etwas ab. Lass den Brief prüfen. Ist der Brief falsch? Dann hast du meistens 1 Monat Zeit für einen Widerspruch. |
| `sl.warum.rest` | Banken, Inkasso, Versandhandel und Handyfirmen können dir Wohnung, Strom oder Freiheit nicht nehmen. Sie können aber pfänden lassen, wenn ein Gericht die Forderung bestätigt hat (zum Beispiel durch einen Vollstreckungsbescheid). Dann schützen dich die Pfändungsfreigrenze und das P-Konto. Diese Raten kommen laut Schuldnerberatung zum Schluss. Unterschreibe nichts und sag keine neuen Raten zu, bevor du beraten wurdest. Laufende Kosten für Telefon und Internet bezahlst du aber weiter.[^ms-vorb][^vz-engpass] | Banken, Inkasso und Versand-Firmen können warten. Unterschreib nichts. Versprich keine Raten. Geh erst zur Beratung. Telefon und Internet für jetzt zahlst du weiter. |

Hinweis für den Entwickler (Prüfung 20.11.2026): Die Monatsfrist ist geprüft, § 84 Abs. 1 SGG gilt für Jobcenter und Sozialamt. Für Familienkasse (Kindergeld) und Wohngeldstelle gelten andere Verfahrensgesetze. Deshalb nennt der Text die Monatsfrist nur für das Jobcenter und verweist sonst auf die Rechtsbehelfsbelehrung im Bescheid.

### 2.6 Kostenlose Schuldnerberatung finden (`<details>`)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `sl.hilfe.h` | Kostenlose Schuldnerberatung finden | Wo bekomme ich Hilfe? Kostenlos. |
| `sl.hilfe.1` | Suche nach Postleitzahl: meine-schulden.de → „Hilfe finden“ (Bundesarbeitsgemeinschaft Schuldnerberatung, BAG-SB). Dort kannst du einen Umkreis wählen und nach „kostenfrei“, P-Konto-Bescheinigungen oder Insolvenzberatung filtern.[^ms-suche] | Such im Internet: meine-schulden.de. Gib deine Post-Leitzahl ein. Dann siehst du Beratungs-Stellen in deiner Nähe. |
| `sl.hilfe.2` | Bekommst du Grundsicherungsgeld (früher Bürgergeld)? Das Jobcenter kann dir eine Schuldnerberatung vermitteln oder bezahlen, wenn sie dir hilft, Arbeit zu finden oder zu behalten (kein fester Anspruch). Frag deine Ansprechperson.[^sgb2-16a] | Bekommst du Geld vom Jobcenter? Dann frag dort nach Schuldner-Beratung. Das Jobcenter kann sie bezahlen. |
| `sl.hilfe.3` | Bekommst du Sozialhilfe oder Grundsicherung im Alter? Ist eine Schuldnerberatung nötig, muss das Sozialamt dich darauf hinweisen und dabei unterstützen. Angemessene Kosten soll es übernehmen, wenn die Notlage sonst nicht zu überwinden ist. In anderen Fällen kann es sie übernehmen.[^sgb12-11] | Bekommst du Geld vom Sozial-Amt? Dann frag dort nach Schuldner-Beratung. |
| `sl.hilfe.4` | Anerkannte Stellen gibt es bei Wohlfahrtsverbänden (zum Beispiel Caritas, Diakonie, AWO), Verbraucherzentralen und Städten oder Landkreisen. Sie sind in der Regel kostenlos. Vorsicht bei Firmen, die Geld im Voraus oder einen neuen Kredit wollen.[^breg-sb][^vz-unser] | Gute Beratung gibt es bei Caritas, Diakonie, AWO, Verbraucher-Zentrale oder der Stadt. Das kostet meistens nichts. Vorsicht bei Firmen, die zuerst Geld wollen. |
| `sl.hilfe.5` | Ist es dringend (Räumung, Strom- oder Gassperre, Haft, Konto gesperrt)? Sag das gleich beim ersten Anruf. Dann kann die Stelle schon vor der eigentlichen Beratung helfen. | Ist es dringend? Sag das sofort am Telefon. |

### 2.7 Blatt für die Schuldnerberatung (Druck, PDF)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `sl.druck` | Blatt für die Schuldnerberatung | Blatt für die Beratung |
| `sl.druck.intro` | Eine Übersicht zum Mitnehmen. Dein Name steht nicht darauf. Aktenzeichen und Kundennummern stehen aber darauf, darüber kann man dich zuordnen. Bring die Briefe trotzdem mit. | Ein Blatt zum Mitnehmen. Dein Name steht nicht darauf. Aber die Nummern aus den Briefen stehen darauf. Bring auch die Briefe mit. |
| `sl.druck.nurDeutsch` | Das Blatt ist auf Deutsch, damit die Beratungsstelle es lesen kann. | Das Blatt ist auf Deutsch. So kann die Beratung es lesen. |
| `sl.druck.az` | Aktenzeichen und Kundennummern mitdrucken | Nummern aus den Briefen auch drucken |
| `sl.druck.kuerzel` | Kürzel (freiwillig, zum Beispiel Initialen) | (wie `eb.kuerzel`, Einfache Sprache: „Deine Buchstaben, wenn du willst“) |
| `sl.druck.notizen` | Notizen mitdrucken | Notizen auch drucken |
| `sl.druck.anschrift` | Anschriften der Gläubiger mitdrucken | Adressen auch drucken |
| `sl.druck.titel` | Gläubigerliste – Übersicht für die Schuldnerberatung | Liste mit meinen Schulden |
| `sl.druck.stand` | Erstellt am {d} | Gemacht am {d} |
| `sl.col.nr` … `sl.col.notiz` | Nr. · Gläubiger (Anschrift) · Wofür · Aktenzeichen · Anfang · Jetzt (Stand vom) · Rate/Monat · Fällig · Stand der Sache · Notiz | (Spaltenköpfe bleiben gleich; das Blatt ist für die Fachkraft) |
| `sl.druck.summen` | Summe offen: {b1} · Raten im Monat: {b2} · Haushaltsplan, frei vor Raten: {b3} | – |
| `sl.druck.hh` | Haushaltsplan: Einnahmen {e}, feste Ausgaben {a}, Rest {r} | – |
| `sl.u.h` | Bitte mitbringen[^vz-vorb][^ms-sort] | Das bringst du mit |
| `sl.u.1` | Nachweise über dein Einkommen: Lohnabrechnung, Bescheide über Rente, Arbeitslosengeld, Grundsicherungsgeld, Sozialhilfe, Wohngeld, Kindergeld | Papiere über dein Geld: Lohn-Zettel, Briefe vom Amt über Rente, Jobcenter, Wohngeld, Kindergeld |
| `sl.u.2` | Eine Übersicht über Einnahmen und Ausgaben im Monat (Haushaltsplan) | Deinen Haushalts-Plan |
| `sl.u.3` | Alle Briefe zu den Schulden, nach Gläubiger sortiert, das neueste oben, mit Trennblättern, ohne Klarsichthüllen | Alle Briefe zu den Schulden. Für jede Firma ein Stapel. Der neueste Brief oben. |
| `sl.u.4` | Verträge, Rechnungen, Mahnungen, Schreiben von Inkasso und Anwälten, Forderungsaufstellungen | Verträge, Rechnungen, Mahnungen, Briefe vom Inkasso |
| `sl.u.5` | Gerichtspost: Mahn- und Vollstreckungsbescheide, Urteile, Pfändungsbeschlüsse, Ladung zur Vermögensauskunft | Briefe vom Gericht (oft im gelben Umschlag) |
| `sl.u.6` | Kündigungen, Sperrandrohungen, Unterhaltstitel, Bußgeldbescheide, Beschlüsse über Geldstrafen | Kündigung, Brief über Strom-Sperre, Unterhalt, Buß-Geld, Geld-Strafe |
| `sl.u.7` | Schuldanerkenntnisse und Ratenvereinbarungen, die du unterschrieben hast | Papiere, die du unterschrieben hast (zum Beispiel Raten) |
| `sl.u.8` | Weißt du nicht, wem du was schuldest? Bei Auskunfteien (zum Beispiel Schufa) kannst du eine kostenlose Datenkopie anfordern (nicht die kostenpflichtige Bonitätsauskunft). | Du weißt nicht mehr, wem du Geld schuldest? Bitte die Schufa um die „Daten-Kopie“. Die kostet nichts. Andere Auskünfte der Schufa kosten Geld. |
| `sl.druck.hinweis` | Eigene Angaben, nicht geprüft. Allgemeine Hinweise, keine Rechtsberatung. Stand der Regeln: November 2026. | – |
| `sl.druck.privat` | Auf dem Blatt stehen Angaben zu deinen Schulden. Gib es nur der Beratungsstelle und lass es nicht offen liegen. | Auf dem Blatt stehen deine Schulden. Gib es nur der Beratung. |

### 2.8 CSV

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `sl.csv` | Als Tabelle exportieren (CSV) | Als Tabelle speichern |
| `sl.csv.warn` | Die Datei enthält Angaben zu deinen Schulden. Speichere oder teile sie nur, wo andere sie nicht sehen. | In der Datei stehen deine Schulden. Gib sie nur Menschen, denen du vertraust. |
| `sl.csv.ok` / `sl.csv.fehler` | Die Datei {name} wurde erstellt. / Der Export hat nicht geklappt. | Fertig: {name}. / Das hat nicht geklappt. |

### 2.9 „Mein Ordner“ (eine Zeile, nur wenn Einträge da sind)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `sl.ordner` | Schulden-Liste | Meine Schulden |
| `sl.ordner.st` | {n} offen · etwa {b} | {n} offen · etwa {b} |
| `sl.ordner.frist` | Frist bis {d} | Schnell handeln bis {d} |

Nur anzeigen, solange es die Fristen-Karte aus b-fristen (`fri.karte`) noch nicht gibt. Danach steht die Frist dort, sonst erscheint dieselbe Frist in zwei Zeilen (siehe 4.8).

---

## 3. Zahlen und Regeln (Quelle, Abruf 20.11.2026, gültig ab/bis)

| Regel | Wert in der App | Quelle (amtlich, außer markiert) | gültig ab / bis |
|---|---|---|---|
| Fristlose Kündigung wegen Mietrückstand | 2 Termine hintereinander mehr als eine Monatsmiete **oder** über mehr als 2 Termine Rückstand in Höhe von 2 Monatsmieten | § 543 Abs. 2 S. 1 Nr. 3 BGB, § 569 Abs. 3 Nr. 1 BGB, https://www.gesetze-im-internet.de/bgb/__543.html, https://www.gesetze-im-internet.de/bgb/__569.html | geltendes Recht, keine Änderung bekannt |
| Schonfrist Mietschulden | Zahlung oder Verpflichtung einer öffentlichen Stelle bis 2 Monate nach Rechtshängigkeit der Räumungsklage, nicht erneut innerhalb von 2 Jahren | § 569 Abs. 3 Nr. 2 BGB (wie oben) | wie oben |
| Mietschulden-Übernahme | „können“/„sollen“ bei drohender Wohnungslosigkeit; Jobcenter: Geldleistungen „sollen als Darlehen“ erbracht werden; Sozialamt: „als Beihilfe oder als Darlehen“ | § 22 Abs. 8 SGB II (Fassung „Grundsicherungsgeld“), https://www.gesetze-im-internet.de/sgb_2/__22.html; § 36 Abs. 1 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__36.html | Neue Grundsicherung in Kraft seit 01.07.2026[^breg-ng] |
| Energiesperre, Voraussetzungen | Mahnung; Rückstand ≥ doppelter Monatsabschlag (ohne Abschläge: 1/6 der Jahresrechnung) **und** ≥ 100 €; Androhung ≥ 4 Wochen vorher; Ankündigung 8 Werktage vorher; nicht bei Unverhältnismäßigkeit oder Gefahr für Leib oder Leben | § 41f Abs. 1–3, 5, 6 EnWG, https://www.gesetze-im-internet.de/enwg_2005/__41f.html (gilt für alle Haushaltskunden) | geltendes Recht |
| Abwendungsvereinbarung | Angebot binnen 1 Woche, spätestens mit der Ankündigung; zinsfreie Monatsraten, üblich 6–18 Monate, bei Rückstand über 300 € 12–24 Monate | § 41g Abs. 1 EnWG, https://www.gesetze-im-internet.de/enwg_2005/__41g.html (**nur Grundversorgung**, Strom und Gas) | geltendes Recht |
| Energieschulden: Darlehen vom Amt | **Haushaltsstrom** ist Teil des Regelbedarfs. Schulden, die **während** des Leistungsbezugs entstanden sind: Darlehen nach **§ 24 Abs. 1 SGB II** (Jobcenter), wenn der Bedarf unabweisbar ist (Sperre droht) und nicht anders gedeckt werden kann (zum Beispiel Raten beim Versorger); Sozialamt: § 37 Abs. 1 SGB XII. **Altschulden** aus der Zeit vor dem Bezug und **Heizkosten-/Heizstrom-Schulden**: nicht § 24, sondern **§ 22 Abs. 8 SGB II** (kommunaler Träger, „vergleichbare Notlage“) bzw. § 36 Abs. 1 SGB XII. Rückzahlung des Darlehens im Bezug: 5 % des Regelbedarfs im Monat | § 24 Abs. 1 SGB II, https://www.gesetze-im-internet.de/sgb_2/__24.html; § 22 Abs. 8 SGB II; § 42a Abs. 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__42a.html; § 37 Abs. 1 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__37.html; BA, Fachliche Weisungen § 24 SGB II, Rz. 24.2–24.3, Stand 01.07.2023, https://www.arbeitsagentur.de/datei/dok_ba035755.pdf | Gesetz: geltend; Weisung: Stand 01.07.2023 (vor der Reform, Wortlaut § 24 Abs. 1 aber unverändert) |
| Ersatzfreiheitsstrafe | 1 Tag für 2 Tagessätze, mindestens 1 Tag | § 43 StGB, https://www.gesetze-im-internet.de/stgb/__43.html | Umrechnung 2:1 geltendes Recht |
| Ratenzahlung bei Geldstrafe | Vollstreckungsbehörde (Staatsanwaltschaft) entscheidet; Hinweis auf Raten und freie Arbeit vor Anordnung der Ersatzfreiheitsstrafe | § 459a, § 459e Abs. 2 StPO, https://www.gesetze-im-internet.de/stpo/__459a.html, https://www.gesetze-im-internet.de/stpo/__459e.html; Art. 293 EGStGB, https://www.gesetze-im-internet.de/stgbeg/art_293.html | geltendes Recht; freie Arbeit nach Landesrecht („möglich“) |
| Erzwingungshaft bei Bußgeld | nur wenn nicht gezahlt **und** Zahlungsunfähigkeit nicht dargetan; höchstens 6 Wochen je Geldbuße | § 96 OWiG, https://www.gesetze-im-internet.de/owig_1968/__96.html | geltendes Recht |
| Unterhalt | Strafbarkeit bei Entziehen und Gefährdung des Lebensbedarfs; erweiterte Pfändbarkeit | § 170 StGB, https://www.gesetze-im-internet.de/stgb/__170.html; § 850d ZPO, https://www.gesetze-im-internet.de/zpo/__850d.html | geltendes Recht |
| Krankenversicherung | Gesetzlich: Anspruch **ruht** (kein Ermessen der Kasse) bei Rückstand in Höhe von Beitragsanteilen für 2 Monate trotz Mahnung; nicht für akute Erkrankungen und Schmerzzustände, Schwangerschaft und Mutterschaft, Früherkennung (§§ 25, 26 SGB V); wieder Anspruch bei wirksamer Ratenvereinbarung, solange die Raten gezahlt werden; kein Ruhen bei Hilfebedürftigkeit nach SGB II/XII. Privat: nach 2 Mahnungen ruht der Vertrag, Notlagentarif | § 16 Abs. 3a SGB V, https://www.gesetze-im-internet.de/sgb_5/__16.html; § 193 Abs. 6, 7 VVG, https://www.gesetze-im-internet.de/vvg_2008/__193.html | geltendes Recht |
| Aufrechnung Jobcenter | 10 % bzw. 30 % des Regelbedarfs | § 43 Abs. 1, 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__43.html | Fassung Neue Grundsicherung (seit 01.07.2026) |
| Mahnbescheid | Aufforderung: binnen 2 Wochen ab Zustellung zahlen oder widersprechen; Widerspruch aber möglich, **solange kein Vollstreckungsbescheid verfügt ist**; verspäteter Widerspruch gilt als Einspruch | § 692 Abs. 1 Nr. 3, 4 ZPO, https://www.gesetze-im-internet.de/zpo/__692.html; § 694 ZPO, https://www.gesetze-im-internet.de/zpo/__694.html | geltendes Recht |
| Vollstreckungsbescheid | steht einem **für vorläufig vollstreckbar erklärten** Versäumnisurteil gleich, Pfändung also sofort möglich, nicht erst nach Fristablauf; Einspruch 2 Wochen ab Zustellung, Notfrist; Einspruch stoppt die Vollstreckung nicht von selbst (Einstellung nur auf Antrag, § 719 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__719.html) | § 699, § 700 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__700.html; § 339 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__339.html | geltendes Recht |
| Fristende | fällt es auf Sa, So, Feiertag: nächster Werktag | § 222 Abs. 2 ZPO, https://www.gesetze-im-internet.de/zpo/__222.html | geltendes Recht |
| Zustelldatum auf dem Umschlag | Der Zusteller vermerkt bei Einwurf in den Briefkasten das Datum der Zustellung auf dem Umschlag | § 180 Satz 3 ZPO, https://www.gesetze-im-internet.de/zpo/__180.html | geltendes Recht |
| Widerspruch gegen Bescheid (Jobcenter, Sozialamt) | 1 Monat nach Bekanntgabe | § 84 Abs. 1 SGG, https://www.gesetze-im-internet.de/sgg/__84.html | geltendes Recht |
| Schuldnerberatung über das Jobcenter | kommunale Eingliederungsleistung „die Schuldnerberatung“ (Ermessen) | § 16a Nr. 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__16a.html | Wortlaut am 20.11.2026 geprüft: 4 Leistungen (Nr. 2 „die Schuldnerberatung“), „können … erbracht werden“, nur soweit für die Eingliederung in das Erwerbsleben erforderlich. Reform: Dreizehntes Gesetz zur Änderung des SGB II, BGBl. 2026 I Nr. 107, https://www.recht.bund.de/bgbl/1/2026/107/VO.html |
| Schuldnerberatung über das Sozialamt | „ist auf ihre Inanspruchnahme hinzuwirken“, wenn die Beratung geboten ist (Pflicht); angemessene Kosten „sollen“ übernommen werden, wenn die Lebenslage sonst nicht überwunden werden kann, sonst „können“; auch pauschal | **§ 11 Abs. 4 S. 2–4 SGB XII**, https://www.gesetze-im-internet.de/sgb_12/__11.html (einen **Abs. 5 gibt es nicht**) | geltendes Recht |
| Reihenfolge beim Zahlen | Lebensmittel, Miete, Strom zuerst; Geldstrafen haben Vorrang; Banken, Inkasso, Versand zum Schluss | BAG-SB, meine-schulden.de „Vorbereitung Erstgespräch“, https://www.meine-schulden.de/hilfe-finden/gute-beratung/beratungsprozess/vorbereitung-erstgespraech (Fachverband, ergänzend; letzte Aktualisierung 09.07.2026). **Die Seite nennt Unterhalt, Krankenversicherung und Bußgeld nicht.** | Abruf 20.11.2026 |
| Existenziell wichtige Zahlungen | Wohnen, Energie, Lebensmittel, Medikamente, Telefon/Internet, Unterhalt | Verbraucherzentrale, „Finanzieller Engpass“, Stand 27.01.2026, https://www.verbraucherzentrale.de/wissen/geld-versicherungen/kredit-schulden-insolvenz/coronahilfspaket-und-andere-moeglichkeiten-wenn-das-geld-knapp-wird-45990 (ergänzend). **Krankenversicherung, Geldstrafen und Bußgeld stehen dort nicht.** Ebenso Bundesregierung, Newsletter Verbraucherschutz 24.07.2023 (Archiv), https://www.bundesregierung.de/breg-de/service/newsletter-und-abos/newsletter-verbraucherschutz/schuldnerberatung-2165880 | Abruf 20.11.2026 |
| Unterlagen für die Beratung | siehe `sl.u.1`–`sl.u.8` | Verbraucherzentrale NRW, „Vorbereitung für die Schuldner- und Verbraucherinsolvenzberatung“ (PDF, Stand 11/2016), https://www.verbraucherzentrale.nrw/sites/default/files/2017-06/Vorbereitung%20f%C3%BCr%20die%20Schulden-%20und%20Insolvenzberatung.pdf; VZ NRW „Gläubigerübersicht“, https://www.verbraucherzentrale.nrw/wissen/geld-versicherungen/kredit-schulden-insolvenz/glaeubigeruebersicht-16335; BAG-SB „Sortierhilfe“, https://www.meine-schulden.de/sortierhilfe (alle ergänzend) | Abruf 20.11.2026 |
| Beratungsstellen-Suche | Suche nach PLZ/Ort, Umkreis 10–100 km, Filter „kostenfrei“, P-Konto, § 305 InsO; Datenbank der BAG-SB, Seite zuletzt aktualisiert 05.11.2026 | https://www.meine-schulden.de/hilfe-finden/stellensuche | Abruf 20.11.2026 |

**Nicht verwendet:** BMFSFJ-Broschüre „Was mache ich mit meinen Schulden?“ (13. Auflage). Sie hat Stand **Juli 2006** und nennt z. B. noch 6 Jahre bis zur Restschuldbefreiung. Sie bestätigt nur inhaltlich die Unterlagenliste und den Rat, akute Gefahr (Wohnung, Energie, Haft, Konto) sofort zu melden.

---

## 4. Bauplan

### 4.1 Dateien im Überblick

| Datei | Änderung |
|---|---|
| **`src/schulden.js` (neu)** | Eigenes Modul wie `src/haushalt.js` / `src/ausziehen.js`: reine Rechnung (Node-Tests) und Oberfläche. `var Schulden = (function () { … })(); if (typeof module !== 'undefined') module.exports = Schulden;` |
| `src/lang/schulden/<13 Sprachen>.json` (neu) | Schlüssel `sl.*` |
| `src/lang/einfach/schulden.json` (neu) | Einfache Sprache für `sl.*`. `scripts/build.js` `einfachSource()` liest alle Dateien im Ordner und prüft die Schlüssel gegen de. Dafür müssen die `sl.*`-Schlüssel in `all.de` stehen, also **nach** dem Zusammenführen in `i18nSource()`. Prüfen: `einfachSource(all.de)` wird erst nach den `Object.assign`-Schleifen aufgerufen (Zeile 38). Das ist bereits so. |
| `scripts/build.js` | Z. 35–37: dritte Schleife für `lang/schulden`; Z. 105 `schulden: read('schulden.js')`; Z. 120–121 `.replace('/*SCHULDEN*/\n', () => parts.schulden)` |
| `src/template.html` | Z. 1660–1661: Platzhalter `/*SCHULDEN*/` nach `/*AUSZIEHEN*/`. Neue Ansicht `<section id="v-schulden" class="ansicht" aria-labelledby="h-schulden" hidden>` mit Zurück-Knopf (`data-zurueck`) und `<div id="slInhalt" class="pf">` (nach `v-haushalt`, Z. ~969). Druckblatt `<section id="slBlatt" hidden aria-labelledby="h-slb">` nach `#ergBlatt` (Z. 1603–1615), gleich aufgebaut: `.mappe-bar.no-print` mit Kürzel-Feld (`maxlength=8`), drei Kontrollkästchen (Notizen, Anschriften, Aktenzeichen), Knöpfe Drucken/Zurück, dazu `<article class="page ergblatt sl-blatt" id="slSeite">`. CSS siehe 4.6. |
| `src/app.js` | (a) `ANSICHTEN` Z. 2475 um `'schulden'` ergänzen. (b) `spRender` Zweig `sp.thema === 'schulden'` Z. 2337–2353: nach der `ol` „Erste Schritte“ (Z. 2343) einen Knopf einfügen: `var d = document.createElement('div'); d.className = 'btns'; d.appendChild(nhKnopf('btn', esc(t('sl.knopf')), null, function () { oeffneVon('schulden', true); })); box.appendChild(d);` (eine Funktion `knopfZeile` gibt es im Code nicht; Muster wie `zumRechner` in Z. 2338). Als `btn` (gefüllt) neben dem Pfändungsrechner-Knopf (`sp-rechner`) **oder** als `ghost`, damit oben nicht zwei gleich starke Knöpfe stehen. Vorschlag: Rechner bleibt oben, die Liste kommt als gefüllter Knopf unter „Erste Schritte“. Eine Funktion `Haushalt.csvFeld` gibt es nicht im Export (haushalt.js Z. 835–845), siehe 4.3. (c) Init-Block nach Haushalt (Z. 3380–3396): `Schulden.speicherOrt({ laden: cb => Store.get('lotse.schulden', cb), schreiben: (text, cb) => { Store.set('lotse.schulden', text); cb(null); } })` und `Schulden.init({ t: tL, euro, datum, locale, zeige: oeffneVon, plug, nativ: NATIVE, haushalt: () => window.Haushalt ? { rest: Haushalt.rest(), raten: (Haushalt.daten().plan.aus.raten || 0) } : null, pdf: (seiten, titel, name, msg) => …, druckModus: … })`. Der PDF-Weg nutzt `loadPdfLib()`/`buildPdf` wie `ebAusgeben` (Z. 1351–1372). Dafür eine kleine Hilfsfunktion `pdfSeitenAusgeben(seiten, titel, name, msg, art)` aus `ebAusgeben` herauslösen oder im ctx durchreichen. (d) `zeigeAnsicht`: bei `a === 'schulden'` `Schulden.zeigen()`. (e) `ordnerRender` Z. 2870–2873: nach der Haushalt-Zeile `if (window.Schulden && Schulden.kurz) { var sk = Schulden.kurz(); if (sk && sk.n) zeile('schulden', t('sl.ordner'), …, symbol, () => oeffneVon('schulden', true)); }`. (f) Nach Vorgangswechsel: dort, wo `Haushalt.neuLaden()` aufgerufen wird, auch `Schulden.neuLaden()` aufrufen. Die Stelle per `grep -n "neuLaden" src/app.js` finden. (g) Sprachwechsel: wie `Haushalt.sprache()` auch `Schulden.sprache()`. |
| `src/vorgaenge.js` | Z. 7 `DATEN` um `'lotse.schulden'` ergänzen. Damit gilt automatisch: PIN-Verschlüsselung, Kopieren, Löschen, Auto-Löschen und „Alle Angaben löschen“ mit Rückgängig (`app.js` Z. 710–716). |
| `src/template.html` Datenschutz (Z. ~1556) und `docs/datenschutz.html`, `docs/datenschutz-ios.html` | Einen Satz ergänzen: „Die Schulden-Liste (Gläubiger, Beträge, Notizen) wird nur auf dem Gerät im Vorgang gespeichert, mit PIN verschlüsselt.“ |
| `package.json` | `test:rules` + `node test/test-schulden.js`; `test:dom` + `node test/test-schulden-dom.js` |
| `docs/PRUEFLISTE.md`, Faktenblatt | Neue Zahlen (§ 41f/41g EnWG, § 43 StGB, § 543/569 BGB, § 16a SGB II, § 11 Abs. 4 SGB XII) eintragen (CLAUDE.md: nach Textänderungen angleichen). |

Warum ein eigenes Modul statt eines Zweigs in `spRender`: Die Seite hat Eingabe, Speicherung, Druck und CSV wie der Haushaltsplan. In `app.js` bliebe sie schwer testbar und kollidierte mit allen anderen Aufgaben.

### 4.2 Datenmodell (`lotse.schulden`, JSON-Text im Vorgang)

```js
{ v: 1,
  liste: [ {
    id: 'a1b2c3',            // 6 Hex-Zeichen, zufällig (wie Vorgaenge.neueId)
    g: 'Stadtwerke',         // Gläubiger, Pflicht, nameSauber-artig, max. 60 Zeichen
    art: 'energie',          // ART_IDS
    anfang: 45000,           // Cent oder null
    stand: 51230,            // Cent oder null
    standD: '2026-11-02',    // ISO-Datum oder ''
    rate: 5000,              // Cent/Monat oder null
    faellig: '2026-12-01',   // ISO-Datum oder ''
    st: 'mahnung',           // STATUS_IDS
    zu: '',                  // Zustelldatum (nur bei mahnbescheid/vollstreckungsbescheid), ISO oder ''
    az: 'KD 4711',           // max. 40 Zeichen
    adr: '',                 // Anschrift, max. 160 Zeichen, Zeilenumbrüche erlaubt (max. 4)
    n: ''                    // Notiz, max. 500 Zeichen
  } ] }
```

- Beträge in **Cent** (ganze Zahlen), Eingabe über `Haushalt.zuCent` bzw. dieselbe Logik (`Fmt.parse`). Nur Werte ≥ 0 und < 100 Mio. Cent.
- `normiere(d)`: unbekannte `art`/`st` → `'sonst'`/`'offen'`; Datumsfelder nur `^\d{4}-\d\d-\d\d$`; Texte: Steuerzeichen entfernen (wie `Vorgaenge.nameSauber`), kürzen; Einträge ohne `g` verwerfen; höchstens 200 Einträge.
- Alles wird nur per `textContent` ausgegeben, nie als HTML (wie `el()` in haushalt.js Z. 324). So kann auch ein manipulierter Speicherstand kein HTML einschleusen.

### 4.3 Reine Rechnung (exportiert, Node-testbar)

```js
var ART = [ ['miete',1], ['energie',1], ['unterhalt',1], ['geldstrafe',1], ['kranken',2], ['bussgeld',2], ['behoerde',2],
            ['bank',3], ['inkasso',3], ['handy',3], ['versand',3], ['sonst',3] ];
var STATUS = ['offen','mahnung','inkasso','drohung','mahnbescheid','vollstreckungsbescheid','pfaendung','ratenzahlung','widersprochen','erledigt'];
var FRIST_TAGE = { mahnbescheid: 14, vollstreckungsbescheid: 14 }; // § 692 Abs. 1 Nr. 3, § 339 Abs. 1 ZPO
var DRINGEND = ['drohung', 'pfaendung'];

function stufe(e)            // 'frist' | 'dringend' | 1 | 2 | 3 | 'erledigt'
function betrag(e)           // stand ?? anfang ?? null (Cent)
function summen(liste)       // { gesamt, raten, n, ohneBetrag, proStufe:{1,2,3}, proArt:{…}, ok }
                             //   ok === (proStufe[1]+proStufe[2]+proStufe[3] === gesamt) && (Σ proArt === gesamt)
                             //   (Kontrolle: Teilmengen ergeben lückenlos und ohne Überschneidung die Gesamtsumme; erledigte zählen nirgends)
function fristEnde(zuIso, tage) // ISO-Datum: zu + tage, dann nächster Werktag (§ 222 Abs. 2 ZPO). NICHT selbst rechnen, wenn es den Rechenkern aus b-fristen gibt:
                             //   FristListe.endeWochen(zu, 2) bzw. Fristen.werktag (9 bundesweite Feiertage). Rückfall ohne dieses Modul: nur Sa/So.
                             //   Sonst zeigt die App für denselben Mahnbescheid zwei verschiedene Tage (Beispiel fristen.md: Zustellung 11.12.2026 → 28.12.2026; ohne Feiertage 25.12.2026)
function fristVorbei(e, heute) // true, wenn fristEnde < heute → Texte sl.frist.*.vorbei statt „bis {frist}“
function sortiert(liste, heute) // frist (früheste zuerst) → dringend → Stufe 1 → 2 → 3 → erledigt; innerhalb: faellig aufsteigend, leere zuletzt, dann Name
function vergleich(ratenListe, hh) // hh = { rest:{rest,leer}, raten } oder null
                             //   → null, wenn kein Plan; sonst { frei: hh.rest.rest + hh.raten, nachRaten: frei - ratenListe,
                             //        zuviel: nachRaten < 0, abweichung: hh.raten !== ratenListe }
function fristen(liste, heute) // für b-fristen / „Mein Ordner“: [{ id, art:'mb'|'vb', basis:{ zugang: zu }, bis:ISO }]
                             //   Art-Kennungen wie in fristen.md (fri.art.mb / fri.art.vb), damit FristListe.schluessel() Dubletten erkennt
                             //   (derselbe Mahnbescheid aus „Brief prüfen“ und aus der Schulden-Liste). Der Gläubigername wird NICHT übergeben
                             //   (fristen.md speichert bewusst keine Brieftexte). Abgeleitet, nicht doppelt gespeichert.
function csv(liste, kopf, namen, mitNotiz) // Semikolon, CRLF, BOM vom Aufrufer; csvFeld wie haushalt.js Z. 160
function normiere(d)
```

**Kontrolle mit dem Haushaltsplan (keine Doppelzählung):** `Haushalt.rest().rest` ist der Rest **nach** allen festen Ausgaben, also auch nach der Kategorie `raten` (`haushalt.js` Z. 17, `planRechnung` Z. 47). Deshalb gilt: frei vor Raten = `rest + plan.aus.raten`. Danach werden die Raten **aus der Liste** abgezogen. Weichen beide Ratensummen voneinander ab, erscheint `sl.hh.abweichung`. Die Liste schreibt **nicht** in den Haushaltsplan (siehe Offene Fragen).

**csvFeld:** Die Funktion ist in `haushalt.js` Z. 160 vorhanden, aber **nicht exportiert**. Nicht neu erfinden, sondern übernehmen (`/^[=+\-@\t\r]/` → `'` voranstellen; `;`, `"`, Zeilenumbruch → in Anführungszeichen, `"` verdoppeln). Besser: `Haushalt.csvFeld` exportieren und in beiden Modulen nutzen (kleine Änderung an haushalt.js, Konflikt mit b-energie möglich, siehe 4.8). Spalten: Nr; Gläubiger; Anschrift; Wofür; Aktenzeichen; Anfang; Jetzt; Stand vom; Rate/Monat; Fällig; Stand der Sache; Zugestellt; [Notiz]. Beträge als `123,45`. Dateiname `Schulden-<JJJJ-MM-TT>.csv`. Export-Weg wie `exportCsv()` haushalt.js Z. 601–620 (nativ: Filesystem CACHE → Share → Datei löschen; Web: Blob-Download). **Vorher** `sl.csv.warn` als Rückfrage (Ja/Abbrechen) zeigen.

### 4.4 Oberfläche (`#slInhalt`), Reihenfolge von oben nach unten

1. `h2#h-schulden` „Meine Schulden-Liste“ und `sl.lead` (nur, solange die Liste leer ist; danach eingeklappt in `<details>`).
2. **Summen-Karte** (`.sl-summe`, Rand links 4 px `--c-pfaendung-t`): `sl.sum.gesamt` (groß), `sl.sum.n`, `sl.sum.raten`, ggf. `sl.sum.ohneBetrag` (`--warn`). Darunter der Vergleich mit dem Haushaltsplan (`sl.hh.*`, `aria-live="polite"`). Die Kontrollzeile `sl.sum.check` nur im Beratungsmodus (`beratung()` wie haushalt.js Z. 585). Bei `ok === false` steht ein Fehler-Hinweis in `--bad`. Das sollte nie passieren, und ein Test sichert es ab.
3. Knopf **„Schuld eintragen“** (`btn`).
4. **Liste**, gruppiert nach `sortiert()`: Zwischenüberschriften `sl.stufe.frist`, `sl.stufe.1`, `sl.stufe.2`, `sl.stufe.3` (nur Gruppen mit Einträgen). Jeder Eintrag ist eine Zeile (`.sl-eintrag`, `<li>` mit Knopf „Ändern“): **Gläubiger** fett, Wort-Pille Stand (`sl.st.*`), Art, Betrag jetzt, Rate, Fälligkeit. Bei `frist`/`dringend` darunter `sl.frist.*` bzw. `sl.dringend` in `.warn`. Darunter `<details class="pf-tipps">` „Warum?“ mit `sl.warum.<art>` (Stufe 3: `sl.warum.rest`). Erledigte stehen eingeklappt unten („Erledigt (n)“).
5. `<details>` **„Was ist zuerst wichtig?“** mit `sl.prio.lead`.
6. `<details>` **„Kostenlose Schuldnerberatung finden“** mit `sl.hilfe.1`–`5`.
7. Knöpfe (`ghost`): **„Blatt für die Schuldnerberatung“**, **„Als Tabelle exportieren (CSV)“**, **„Zum Haushaltsplan“**, **„Ausrechnen, was dir bleibt“** (Pfändungsrechner, `oeffneVon('pfaendung')`).
8. `sl.privat` (klein, gedämpft) und `sp.schulden.quellen`.

**Eingabeformular** (ersetzt die Liste wie `renderEingabe` im Haushaltsbuch): Pflichtfeld Gläubiger; `select` Art; Geldfelder (`geldFeld`-Muster aus haushalt.js Z. 326) für Anfang, Jetzt, Rate; `input type="date"` für Stand vom, Fällig und Zugestellt. „Zugestellt“ erscheint nur bei Status `mahnbescheid`/`vollstreckungsbescheid`. Ohne Datum steht dort `sl.frist.ohneDatum`. Dazu `select` Status sowie Textfelder Aktenzeichen, Anschrift (`textarea`, 3 Zeilen) und Notiz. Anschrift und Notiz stehen in einem `<details>` „Weitere Angaben“. Nach Speichern Fokus auf den Eintrag in der Liste; nach Löschen (mit Rückfrage) Fokus auf „Schuld eintragen“.

### 4.5 Druckblatt (`#slBlatt`), nach dem Vorbild des Ergebnisblatts

- Öffnen/Schließen wie `ebOeffnen`/`ebSchliessen` (`app.js` Z. 1320–1334): `#slBlatt` sichtbar, `$('app').classList.add('pm')` (blendet Kopf, Fuß usw. aus, `template.html` Z. 668), Fokus auf `h-slb`.
- Inhalt (`slBauen()`), alles per `textContent`/`esc()`:
  1. Titel `sl.druck.titel`, Zeile `sl.druck.stand` + ggf. Kürzel (`eb.kuerzelZeile` wiederverwenden).
  2. Tabelle `table.eb-tab` (Klassen wiederverwenden, Druck-CSS Z. 340–348 greift schon): Spalten `sl.col.*`, Reihenfolge wie `sortiert()`, ohne erledigte. Anschrift nur bei Haken „Anschriften“ (Standard: an, denn die Beratung braucht sie), Notiz nur bei Haken „Notizen“ (Standard: **aus**). Aktenzeichen nur bei Haken „Aktenzeichen“ (Standard: an). Einträge der Art `sonst` (oft Familie oder Freunde, also Namen von Privatpersonen) werden mit Gläubigername gedruckt; darauf weist `sl.druck.privat` hin.
  3. Summenzeile `sl.druck.summen` und, falls ein Haushaltsplan existiert, `sl.druck.hh` (Einnahmen, Ausgaben, Rest aus `Haushalt.rest()`: `ein`, `aus`, `rest`).
  4. „Bitte mitbringen“: `sl.u.h`, `sl.u.1`–`8` als Liste mit Kästchen „☐“.
  5. `sl.druck.hinweis` klein.
- Sprache des Blatts: **Deutsch** (die Fachkraft liest es), wie Briefe und Angabenblatt der Antragsmappe. Im Kopf der Bildschirmansicht steht bei `lang !== 'de'` der neue Hinweis `sl.druck.nurDeutsch`. (`briefe.nurDeutsch` passt nicht: Der Text handelt von der Brief-Prüfung und vom Scannen.) Offene Frage: zweisprachig?
- Ausgabe: Web → `window.print()`. App → PDF über `LotsePdf.buildPdf` mit Blöcken (`h`, `p`, `li`, `small`) wie `ebPdfSeiten()` Z. 1335–1349. Eine Zeile je Forderung, „Gläubiger · Wofür · AZ · Jetzt · Rate · Stand“. Name der Datei `SoLo-Schulden.pdf`, nach dem Teilen aus dem Cache löschen (wie Z. 1370).
- Unter den Knöpfen steht immer `sl.druck.privat`.

### 4.6 Farben (nur Palette aus `docs/FARBEN.md`)

| Element | Variable | Begründung |
|---|---|---|
| Symbol im Kopf der Ansicht `schulden` | Fläche `--c-pfaendung`, Symbol `--on-c` | Schulden = Pflaume (FARBEN.md, Bereiche); einzelnes Symbol, keine Gruppe |
| Symbol der Ordner-Zeile `#or-schulden` | Fläche **`--c-sparen` (Grün)**, Symbol `--on-c` | **Nicht Pflaume:** In der Gruppe `ordner` (b-fristen, fristen.md 6.5) hat schon die Zeile `pfaendung` Pflaume. Frei sind laut fristen.md Indigo, Meerblau, Grün. Grün passt, weil die Liste zu „Geld sparen“ gehört. CSS: `.app[data-ansicht="ordner"] #or-schulden .zeile-sym { background: var(--c-sparen); } /* gruppe ordner */`; `erwartet.ordner` in `tools/kontrast-pruefen.js` von 7 auf 8; Zeile in docs/FARBEN.md ergänzen. Solange b-fristen nicht gemergt ist, bleibt die Zeile wie alle anderen Petrol (`--accent-soft`). |
| Rand der Summen-Karte, Zwischenüberschriften der Stufen (Balken links) | `--c-pfaendung-t` | Bereichsfarbe als Rand/Schrift auf Karte |
| Pille `frist`, `vollstreckungsbescheid`, `mahnbescheid`, `pfaendung`, `drohung` | `--bad` / `--bad-bg`, Wort dabei | Zustand „Fehler/Gefahr“, nie nur Farbe |
| Pille `mahnung`, `inkasso`; Hinweis `sl.sum.ohneBetrag`, `sl.hh.zuviel` | `--warn` / `--warn-bg` | Warnung |
| Pille `ratenzahlung` | `--ok` / `--ok-bg` | läuft |
| Pille `offen`, `widersprochen`, `erledigt` | `--na` / `--na-bg` | neutral |
| Knöpfe | Petrol (`btn`, `btn ghost`) | Bedienfarbe |
| Druckblatt | Schwarz auf Weiß (`.ergblatt`-Druckregeln) | Ausnahme Druckstile |

- Es gibt **keine neue Kachel- oder Knopfgruppe** (Art und Stand sind Auswahllisten). `tools/kontrast-pruefen.js` braucht deshalb keine neue Gruppe. In der Gruppe `sparen` bleibt es bei 6 Einträgen.
- Neue CSS-Regeln nur mit Variablen, keine Farbwerte (prüft `kontrast-pruefen.js`). Die Pillen-Klassen gibt es schon (`.pill.ja/.vielleicht/.nein/.na` im Ergebnisblatt); dieselben Klassen wiederverwenden.

### 4.7 Tests

**`test/test-schulden.js`** (Node, in `test:rules`):
1. `stufe()`: jede `art` hat Stufe 1–3; `miete/energie/unterhalt/geldstrafe` = 1; `bank/inkasso/handy/versand/sonst` = 3; `mahnbescheid`/`vollstreckungsbescheid` → `'frist'` unabhängig von der Art; `drohung`/`pfaendung` → `'dringend'`; `erledigt` → `'erledigt'`.
2. `summen()`: Cent-genau (0,10 + 0,20 = 0,30 → 30); `stand` hat Vorrang vor `anfang`; ohne beide zählt `ohneBetrag`; erledigte zählen weder in `gesamt` noch in `raten`; **Kontrolle `ok`**: für 5000 Zufallslisten (Seed wie test-einfach-gleich.js) gilt Σ proStufe = gesamt und Σ proArt = gesamt. Eine absichtlich falsche Stufen-Tabelle (Mutation) muss `ok === false` liefern.
3. `fristEnde()`: Zustellung Fr 2026-12-11 → Mo 2026-12-28 (25./26.12. Feiertage, 27.12. Sonntag; gleicher Prüffall wie fristen.md Abschnitt 4), ohne Rechenkern von b-fristen im Rückfall 2026-12-25; `fristVorbei()` einen Tag nach dem Ende → true; Zustellung Mo 2026-11-16 + 14 → Mo 2026-11-30; Zustellung Sa 2026-11-21 + 14 → Sa 2026-12-05 → Mo 2026-12-07; Monats- und Jahreswechsel (2026-12-24 → 2027-01-07); Schaltjahr 2028-02-20 → 2028-03-05 (So) → 2028-03-06; leeres Datum → null.
4. `sortiert()`: Frist vor Dringend vor Stufe 1 vor 2 vor 3 vor erledigt; gleiche Stufe nach Fälligkeit, leere Fälligkeit zuletzt; stabil.
5. `vergleich()`: Plan rest = 20000, Plan-Raten = 5000, Liste-Raten = 8000 → frei 25000, nachRaten 17000, abweichung true; zuviel bei nachRaten < 0; ohne Plan (`hh === null` oder `rest.leer`) → null.
6. `normiere()`: Müll (`null`, Zahl, Array, `{liste:'x'}`) → leere Liste; unbekannte Art/Status → `sonst`/`offen`; negative oder nicht-ganzzahlige Cent → null; `<img onerror>` im Namen bleibt Text (DOM-Test prüft die Ausgabe); Längen werden gekürzt; mehr als 200 Einträge → 200.
7. `csv()`: Formel-Injection: Felder `=1+1`, `+49…`, `-5`, `@SUM`, `\tx`, `\rx` beginnen mit `'`; auch `  =1+1` (Leerzeichen davor) und eine Anschrift, deren **erste** Zeile mit `=` beginnt; auch die Kopfzeile und die übersetzten Namen von Art und Stand laufen durch `csvFeld`; `;` und `"` korrekt gequotet; Notiz-Spalte fehlt bei `mitNotiz=false`; Beträge `512,30`; Zeilenende CRLF.
8. `fristen()`: liefert nur nicht erledigte Einträge mit Zustelldatum; `art` `mb` bzw. `vb`; kein Gläubigername im Ergebnis.
9. i18n: alle `sl.*`-Schlüssel aus `src/lang/schulden/de.json` sind in allen 13 Dateien vorhanden und nicht leer; alle Schlüssel in `src/lang/einfach/schulden.json` gibt es in de; Platzhalter (`{b}`, `{n}`, `{d}`, `{frist}`) stimmen je Sprache mit de überein (wie `test-sprachen-zahlen.js`); keine Zahl in einer Übersetzung, die in de fehlt (Ausnahmen in `sprachen-zahlen-ausnahmen.json`).

**`test/test-schulden-dom.js`** (in `test:dom`, Muster `test-haushalt-dom.js`):
1. Geld sparen → Schulden → Knopf „Meine Schulden-Liste“ öffnet `#v-schulden`; keine neue Startkachel (`class="sk sk-` zählt weiter 6).
2. Eintrag anlegen (Stadtwerke, Energie, 512,30 €, Mahnung) → erscheint unter „Zuerst“; Summe „512,30 €“ bzw. „etwa 512 €“.
3. Mahnbescheid mit Zustelldatum → Gruppe „Frist läuft“ ganz oben, Datum korrekt.
4. Speichern im Vorgang: `Store.get('lotse.schulden')` enthält den Eintrag; Vorgang wechseln → leere Liste; zurück → Eintrag da. Mit PIN: In `localStorage` steht der Gläubigername **nicht** im Klartext.
5. „Alle Angaben löschen“ → Liste leer; „Rückgängig“ → wieder da.
6. Gläubiger `<img src=x onerror=alert(1)>` wird als Text angezeigt (kein `img`-Element in `#slInhalt` und `#slSeite`).
7. Druckblatt: ohne Name aus `person`; Kürzel erscheint; Notiz fehlt standardmäßig und erscheint mit Haken; erledigte Einträge fehlen.
8. Haushaltsplan mit Rest 200 €, Raten 50 €; Liste mit Raten 80 € → Text „etwa 250 €“ frei, „etwa 170 €“ danach, Hinweis auf Abweichung.
9. „Mein Ordner“ zeigt die Zeile „Schulden-Liste · 1 offen · etwa 512 €“.
10. Sprachwechsel auf `ar` (RTL) und Einfache Sprache: Ansicht rendert ohne fehlende Schlüssel (`[sl.` kommt im Text nicht vor).

Außerdem: `test/test-vorgaenge.js` um die Prüfung „`lotse.schulden` in `DATEN`“ ergänzen. `test/a11y.js` öffnet die neue Ansicht und das Druckblatt (axe ohne Verstöße, Fokus nach Öffnen auf der Überschrift).

### 4.8 Konfliktrisiken mit anderen Aufgaben

| Datei / Stelle | Mögliche Kollision | Empfehlung |
|---|---|---|
| `src/app.js` `ordnerRender` (Z. 2844 ff.) | **b-fristen** baut die Fristen-Übersicht in „Mein Ordner“ (Risiko laut fristen.md 6.7: **hoch**) | (1) **Farbe:** Ordner-Zeile Grün statt Pflaume (4.6), `erwartet.ordner` = 8. (2) **Eine Rechnung:** Fristende über den Rechenkern von b-fristen (bundesweite Feiertage), nicht zweimal verschieden. (3) **Keine doppelte Frist:** `Schulden.fristen()` liefert `art:'mb'|'vb'` mit Zustelldatum; `FristListe` zeigt sie an und erkennt über `schluessel()` denselben Bescheid aus „Brief prüfen“. `sl.ordner.frist` entfällt dann. (4) **Start-Hinweis über alle Vorgänge:** fristen.md liest dafür `tresor.ueberall('lotse.fristliste')`; damit Schulden-Fristen anderer Vorgänge erscheinen, muss b-fristen auch `ueberall('lotse.schulden')` auswerten (über das reine `Schulden.fristen(normiere(json).liste, heute)`). (5) Reihenfolge der Zeilen: Fristen zuerst (fristen.md), Schulden nach Haushalt. (6) Gesperrte Namen aus fristen.md nicht benutzen: `lotse.fristen`, `#v-fristen`, `[data-ansicht=fristen]`, `#startFristen`. Reihenfolge der Merges absprechen. |
| `src/haushalt.js` (`csvFeld`-Export, `Haushalt.rest()`/`daten()`) | **b-energie** (Haushaltsplan) ändert vermutlich haushalt.js und evtl. die Kategorie `raten` bzw. die Rest-Rechnung | Nur lesend über `ctx.haushalt()` zugreifen. Den `csvFeld`-Export als einzeilige Ergänzung im `return` platzieren oder die Funktion in schulden.js kopieren (mit Verweis-Kommentar). |
| `src/vorgaenge.js` Z. 7 `DATEN` | b-fristen oder andere fügen evtl. weitere Schlüssel hinzu | Einfacher Zeilen-Konflikt, beim Merge beide Schlüssel behalten. |
| `src/app.js` `ANSICHTEN`, Init-Block Z. 3380 ff., `spRender` Z. 2337 ff. | alle Aufgaben, die neue Ansichten oder Module bringen; **b-kostensenkung** evtl. Verweise | Kleine, getrennte Einfügungen; vor dem Push `tools/konflikt-check.sh`. |
| `scripts/build.js` Z. 35–38, 105, 120 | jede Aufgabe mit eigenem Sprachordner | Je eine Zeile, beim Merge alle behalten. |
| `src/template.html` (neue Sections, CSS-Block) | b-fristen (Ordner), b-energie (Haushalt-CSS) | Eigenen CSS-Block „/* Schulden-Liste (src/schulden.js) */“ nach dem Haushalt-Block anlegen. |
| Text `sp.schulden.mahn` (bestehend) | – | siehe Offene Fragen Nr. 1, nur nach Freigabe ändern |
| Texte `sp.vertraege.4`, `sp.schulden.strom`, `sp.schulden.2` (bestehend) | **b-energie** (energie.md Abschnitt 5 Punkt 4) | siehe Offene Fragen Nr. 12 und 13; nur einer der beiden Branches ändert sie, nach Freigabe |
| `package.json` Testskripte | alle | Zeilenkonflikt, alle Einträge behalten |

---

## 5. Offene Fragen und Unsicherheiten

1. **Bestehender Text `sp.schulden.mahn` ist zu streng.** Dort steht, der Widerspruch „muss innerhalb von 2 Wochen … beim Gericht ankommen“. Nach § 694 Abs. 1 ZPO ist der Widerspruch aber möglich, „solange der Vollstreckungsbescheid nicht verfügt ist“. Die 2 Wochen sind die Aufforderung in § 692 Abs. 1 Nr. 3 ZPO, und erst danach darf der Vollstreckungsbescheid beantragt werden (§ 699 Abs. 1 S. 2 ZPO). Die Liste formuliert deshalb „möglichst bis …“. Soll `sp.schulden.mahn` in allen Sprachen angeglichen werden? Das wäre eine eigene kleine Aufgabe.
2. **Auftrag nennt „§ 11 Abs. 5 SGB XII“.** Den Absatz gibt es in der geltenden Fassung nicht. Die Schuldnerberatung steht in **§ 11 Abs. 4 S. 2–4 SGB XII**. Der Entwurf nutzt Abs. 4.
3. **„Neue Grundsicherung“:** Laut Bundesregierung ist sie seit 01.07.2026 schrittweise in Kraft (Bundestag 05.03.2026, Bundesrat 27.03.2026). § 16a Nr. 2 SGB II (Schuldnerberatung) ist auf gesetze-im-internet.de unverändert. In § 22 Abs. 8 SGB II heißt es schon „Grundsicherungsgeld“. Ob einzelne Teile erst zum 01.01.2027 greifen, ist für diese Funktion nicht erheblich, aber ungeprüft.
4. **Widerspruchsfrist gegen Bescheide (1 Monat, § 84 SGG):** am 20.11.2026 geprüft und im Text auf das Jobcenter begrenzt (erledigt, siehe Prüfvermerk).
5. **Widerspruch zum vorhandenen Text `sp.schulden.2`:** Dort steht die Krankenversicherung bei „zuerst zahlen“ (zusammen mit Miete, Strom, Unterhalt, Geldstrafen). Der Knopf zur Liste steht direkt unter diesem Text, die Liste stuft die Krankenversicherung aber als „Auch wichtig“ ein. Das muss vor dem Bau entschieden werden: entweder Stufe 1 für `kranken` oder `sp.schulden.2` anpassen. Geprüft am 20.11.2026: Weder BAG-SB noch Verbraucherzentrale nennen Krankenversicherung oder Bußgeld in ihrer Reihenfolge; Unterhalt nennt nur die Verbraucherzentrale, Geldstrafen nur die BAG-SB. Eine amtliche Rangfolge wurde nicht gefunden. **Krankenversicherung und Bußgeld als „Auch wichtig“ (Stufe 2):** Die Stufe ist aus den Gesetzesfolgen abgeleitet (§ 16 Abs. 3a SGB V, § 96 OWiG). BAG-SB und Verbraucherzentrale nennen beide nicht ausdrücklich. Die Reihenfolge innerhalb von Stufe 2 ist eine Einschätzung und deshalb nur als „Auch wichtig“ formuliert, nicht als „zuerst“. Bitte von einer Schuldnerberatung gegenlesen lassen.
6. **Feiertage** kennt die App nicht (Länderunterschiede). Die Frist wird nur um Wochenenden verschoben und ist als „ungefähr“ gekennzeichnet. Alternative: gar kein Fristende ausrechnen, nur „2 Wochen ab {d}“ anzeigen.
7. **Raten in den Haushaltsplan übernehmen?** Der Entwurf zeigt nur die Abweichung an und schreibt nicht in `lotse.haushalt` (eine Datenquelle, kein Konflikt mit b-energie). Ein Knopf „Raten im Haushaltsplan übernehmen“ wäre bequem, braucht aber `Haushalt.setzeRaten()` und Absprache mit b-energie.
8. **Sprache des Druckblatts:** nur Deutsch (für die Beratungsstelle) oder zweispaltig mit der Nutzersprache? Arabisch, Persisch und Paschtu kann pdf-lib ohnehin nicht setzen (`pdfRtl()`).
9. **Beratungsmodus:** Soll die Kontrollzeile (`sl.sum.check`) und der Druck nur im Beratungsmodus erscheinen (wie `hb.drucken`, haushalt.js Z. 447)? Vorschlag: Druckblatt immer, denn es ist gerade für Laien gedacht, die zur Beratung gehen. Kontrollzeile nur im Beratungsmodus.
10. **Unterlagenliste:** Die VZ-NRW-Vorlage hat Stand 11/2016, ist aber inhaltlich deckungsgleich mit der aktuellen Sortierhilfe der BAG-SB. Eine aktuelle amtliche Liste (Ministerium) wurde nicht gefunden. Die BMFSFJ-Broschüre ist von 2006 und wird deshalb nicht verwendet.
11. **Online-Beratung:** meine-schulden.de verlinkt eine Online-Beratung. Inhalt und Anbieter sind nicht geprüft, deshalb wird sie nicht genannt.
12. **Stromschulden: § 22 Abs. 8 oder § 24 Abs. 1 SGB II? (geklärt 20.11.2026, Hinweis aus b-energie)** Der vorhandene Text `sp.vertraege.4` nennt für Energieschulden nur § 22 Abs. 8 SGB II. Nach den Fachlichen Weisungen der BA zu § 24 SGB II (Rz. 24.2–24.3, Stand 01.07.2023) gilt: Haushaltsstrom gehört zum Regelbedarf. Für Stromschulden, die **während** des Leistungsbezugs entstanden sind, kommt ein Darlehen nach **§ 24 Abs. 1 SGB II** in Betracht, wenn eine Sperre droht und es keinen anderen Weg gibt (zum Beispiel Raten beim Versorger). **Altschulden** aus der Zeit davor und **Heizkosten- oder Heizstrom-Schulden** fallen nicht unter § 24; dafür bleibt § 22 Abs. 8 SGB II (Entscheidung des kommunalen Trägers). Beide Paragraphen sind also richtig, je nach Fall. Der Entwurf nennt deshalb in `sl.warum.energie` keinen Paragraphen im Text für Laien, sondern nur „Darlehen beantragen“, und führt beide in Abschnitt 3. Vorschlag für `sp.vertraege.4` (eigene kleine Aufgabe, mit b-energie abstimmen): „… als Darlehen übernehmen (§ 24 Abs. 1 oder § 22 Abs. 8 SGB II)“. Die Weisung ist älter als die Reform; der Wortlaut von § 24 Abs. 1 ist am 20.11.2026 geprüft und passt weiter. Eine Weisung nach dem 01.07.2026 wurde nicht gesucht.
13. **`sp.vertraege.4` nennt veraltete Paragraphen (Befund, nicht Teil dieses Auftrags):** Die Ratenzahlung vor der Sperre steht nicht mehr in § 19 StromGVV / § 19 GasGVV, sondern in § 41g EnWG. § 19 StromGVV regelt heute nur noch die Unterbrechung ohne Androhung bei Stromdiebstahl und verweist auf §§ 41f, 41g EnWG (https://www.gesetze-im-internet.de/stromgvv/__19.html, abgerufen 20.11.2026). § 19 GasGVV wurde nicht abgerufen. `sp.schulden.strom` nennt schon §§ 41f, 41g EnWG.
14. **Kündigung mit Frist bleibt trotz Nachzahlung möglich** (`sl.warum.miete`, übernommen aus `sp.schulden.miete`): Das steht nicht im Gesetz, sondern folgt aus Urteilen des Bundesgerichtshofs. Die Fundstelle wurde in dieser Prüfung nicht amtlich nachgeschlagen. Der Satz ist mit „kann“ formuliert. Vor dem Bau die BGH-Fundstelle ergänzen oder den Satz von einer Mieterberatung bestätigen lassen.
15. **Kostenlose Datenkopie der Auskunfteien** (`sl.u.8`): Quelle wäre Art. 12 Abs. 5 und Art. 15 DSGVO. Nicht abgerufen, bitte vor dem Bau ergänzen.
16. **Betrag in „Mein Ordner“:** `sl.ordner.st` zeigt die Schuldensumme auf der Übersichtsseite, die man auch anderen zeigt. Datensparsamer wäre nur „{n} offen“. Der Haushaltsplan zeigt dort allerdings auch seinen Rest. Bitte entscheiden.
17. **CSV im Browser:** Beim Web-Download liegt die Datei unverschlüsselt im Download-Ordner. Die App kann sie dort nicht löschen. `sl.csv.warn` sagt das nur allgemein. Vorschlag: CSV nur im Beratungsmodus anbieten oder den Hinweis um „Lösche die Datei danach“ ergänzen.

---

[^ms-vorb]: BAG-SB, meine-schulden.de, „Vorbereitung Erstgespräch“ (letzte Aktualisierung 09.07.2026): „Zahlen Sie – wenn irgendwie möglich – zunächst Lebensmittel, Miete und Strom. Auch Geldstrafen haben Priorität und sollten weitergezahlt werden. Raten an Banken, Inkassounternehmen oder Versandhäuser kommen ganz zum Schluss.“ (Wortlaut am 20.11.2026 bestätigt.) Außerdem: keine neuen Zahlungsversprechen vor dem Erstgespräch. https://www.meine-schulden.de/hilfe-finden/gute-beratung/beratungsprozess/vorbereitung-erstgespraech, abgerufen 20.11.2026 (Fachverband, ergänzend).
[^ms-sort]: BAG-SB, „Sortierhilfe“, https://www.meine-schulden.de/sortierhilfe, abgerufen 20.11.2026.
[^ms-suche]: BAG-SB, „Schuldnerberatungsstelle finden“, Datenbank Stand 05.11.2026, https://www.meine-schulden.de/hilfe-finden/stellensuche, abgerufen 20.11.2026.
[^vz-vorb]: Verbraucherzentrale NRW, „Vorbereitung für die Schuldner- und Verbraucherinsolvenzberatung“ (Stand 11/2016), https://www.verbraucherzentrale.nrw/sites/default/files/2017-06/Vorbereitung%20f%C3%BCr%20die%20Schulden-%20und%20Insolvenzberatung.pdf, und „Gläubigerübersicht“, https://www.verbraucherzentrale.nrw/wissen/geld-versicherungen/kredit-schulden-insolvenz/glaeubigeruebersicht-16335, abgerufen 20.11.2026 (ergänzend).
[^vz-engpass]: Verbraucherzentrale (verbraucherzentrale.de, gemeinsames Portal der Verbraucherzentralen), „Finanzieller Engpass: Was tun, wenn ich nicht rechtzeitig bezahlen kann?“, Stand 27.01.2026, https://www.verbraucherzentrale.de/wissen/geld-versicherungen/kredit-schulden-insolvenz/coronahilfspaket-und-andere-moeglichkeiten-wenn-das-geld-knapp-wird-45990, abgerufen 20.11.2026 (ergänzend). Dazu VZ NRW, „Erste Schritte, wenn die Schulden drücken“, Stand 16.07.2026: „Miete und Energiekosten vor allem anderen“, https://www.verbraucherzentrale.nrw/wissen/geld-versicherungen/kredit-schulden-insolvenz/erste-schritte-wenn-die-schulden-druecken-16328.
[^vz-unser]: Verbraucherzentrale, „Schuldnerberatungen: So erkennen Sie unseriöse Angebote“, https://www.verbraucherzentrale.de/wissen/geld-versicherungen/kredit-schulden-insolvenz/unserioese-schuldnerberatungen-horrende-preise-fuer-ueberfluessige-oder-schlechte-leistungen-10475 (schon in den Quellen von `app.js` Z. 2290 genannt).
[^breg-sb]: Bundesregierung, Newsletter Verbraucherschutz „Einer Privatinsolvenz vorbeugen“, 24.07.2023 (Archivseite): rund 1.400 Stellen bei Verbraucherzentralen, Wohlfahrtsverbänden, Kommunen, „in der Regel … kostenlos“, Suche über meine-schulden.de. https://www.bundesregierung.de/breg-de/service/newsletter-und-abos/newsletter-verbraucherschutz/schuldnerberatung-2165880, abgerufen 20.11.2026.
[^breg-ng]: Bundesregierung, „Neue Grundsicherung löst Bürgergeld ab“ (in Kraft 01.07.2026; Bundestag 05.03.2026, Bundesrat 27.03.2026), https://www.bundesregierung.de/breg-de/aktuelles/neue-grundsicherung-2399562, abgerufen 20.11.2026.
[^bgb543]: § 543 Abs. 2 S. 1 Nr. 3 BGB, https://www.gesetze-im-internet.de/bgb/__543.html, abgerufen 20.11.2026.
[^bgb569]: § 569 Abs. 3 Nr. 1, 2 BGB, https://www.gesetze-im-internet.de/bgb/__569.html, abgerufen 20.11.2026.
[^sgb2-22]: § 22 Abs. 8, 9 SGB II, https://www.gesetze-im-internet.de/sgb_2/__22.html, abgerufen 20.11.2026.
[^enwg41f]: § 41f EnWG, https://www.gesetze-im-internet.de/enwg_2005/__41f.html, abgerufen 20.11.2026.
[^enwg41g]: § 41g EnWG (Grundversorgung), https://www.gesetze-im-internet.de/enwg_2005/__41g.html, abgerufen 20.11.2026.
[^stgb170]: § 170 Abs. 1 StGB, https://www.gesetze-im-internet.de/stgb/__170.html, abgerufen 20.11.2026.
[^zpo850d]: § 850d Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__850d.html, abgerufen 20.11.2026.
[^stgb43]: § 43 StGB („Zwei Tagessätzen entspricht ein Tag Ersatzfreiheitsstrafe.“), https://www.gesetze-im-internet.de/stgb/__43.html, abgerufen 20.11.2026.
[^stpo459a]: § 459a StPO, https://www.gesetze-im-internet.de/stpo/__459a.html, abgerufen 20.11.2026.
[^stpo459e]: § 459e Abs. 2 StPO, https://www.gesetze-im-internet.de/stpo/__459e.html, abgerufen 20.11.2026.
[^egstgb293]: Art. 293 EGStGB, https://www.gesetze-im-internet.de/stgbeg/art_293.html, abgerufen 20.11.2026.
[^owig96]: § 96 OWiG, https://www.gesetze-im-internet.de/owig_1968/__96.html, abgerufen 20.11.2026.
[^sgb5-16]: § 16 Abs. 3a SGB V, https://www.gesetze-im-internet.de/sgb_5/__16.html, abgerufen 20.11.2026.
[^sgb2-43]: § 43 Abs. 1, 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__43.html, abgerufen 20.11.2026.
[^zpo692]: § 692 Abs. 1 Nr. 3, 4 ZPO, https://www.gesetze-im-internet.de/zpo/__692.html, abgerufen 20.11.2026.
[^zpo694]: § 694 ZPO, https://www.gesetze-im-internet.de/zpo/__694.html, abgerufen 20.11.2026.
[^zpo700]: §§ 699, 700 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__699.html und https://www.gesetze-im-internet.de/zpo/__700.html; § 719 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__719.html, abgerufen 20.11.2026.
[^zpo339]: § 339 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__339.html, abgerufen 20.11.2026.
[^zpo222]: § 222 Abs. 2 ZPO, https://www.gesetze-im-internet.de/zpo/__222.html, abgerufen 20.11.2026.
[^sgb2-16a]: § 16a Nr. 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__16a.html, abgerufen 20.11.2026.
[^sgb12-11]: § 11 Abs. 4 S. 2–4 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__11.html, abgerufen 20.11.2026.
[^sgb12-36]: § 36 Abs. 1 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__36.html, abgerufen 20.11.2026.
[^sgb2-24]: § 24 Abs. 1 SGB II, https://www.gesetze-im-internet.de/sgb_2/__24.html; § 22 Abs. 8 SGB II, https://www.gesetze-im-internet.de/sgb_2/__22.html; § 37 Abs. 1 und § 36 Abs. 1 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__37.html, abgerufen 20.11.2026.
[^fw24]: Bundesagentur für Arbeit, Fachliche Weisungen § 24 SGB II, Rz. 24.2–24.3 (Energieschulden), Stand 01.07.2023, https://www.arbeitsagentur.de/datei/dok_ba035755.pdf, abgerufen 20.11.2026.
[^vvg193]: § 193 Abs. 6, 7 VVG, https://www.gesetze-im-internet.de/vvg_2008/__193.html, abgerufen 20.11.2026.
[^sgg84]: § 84 Abs. 1 SGG, https://www.gesetze-im-internet.de/sgg/__84.html, abgerufen 20.11.2026.
[^zpo180]: § 180 Satz 3 ZPO, https://www.gesetze-im-internet.de/zpo/__180.html, abgerufen 20.11.2026.

---

## Prüfvermerk Fable (20.11.2026)

Unabhängige Prüfung. Alle Paragraphen wurden am 20.11.2026 direkt auf gesetze-im-internet.de abgerufen und mit dem Entwurf verglichen (EnWG §§ 41f, 41g; StGB §§ 43, 170; StPO §§ 459a, 459e; Art. 293 EGStGB; OWiG § 96; BGB §§ 543, 569; ZPO §§ 180, 222, 339, 692, 694, 699, 700, 719, 850d; SGB II §§ 16a, 22, 24, 42a, 43; SGB V § 16; SGB XII §§ 11, 36, 37; SGG § 84; VVG § 193; StromGVV § 19). Die Seiten von BAG-SB und Verbraucherzentrale wurden abgerufen und die Zitate verglichen. Der Code in `/home/claude/s1` wurde nur gelesen. Tests wurden nicht ausgeführt (es gibt noch keinen Code zu dieser Funktion).

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| `sl.frist.vollstreckungsbescheid` sagte „Danach kann gepfändet werden“. Falsch: Der Vollstreckungsbescheid ist sofort vollstreckbar, nicht erst nach Ablauf der Einspruchsfrist. Der Text hätte Nutzer in falscher Sicherheit gewiegt. | Fehler | Text (de + Einfach) und Tabelle 3 korrigiert: Pfändung schon jetzt möglich, Einspruch stoppt sie nicht von selbst | § 700 Abs. 1, § 719 Abs. 1 ZPO, https://www.gesetze-im-internet.de/zpo/__700.html, https://www.gesetze-im-internet.de/zpo/__719.html |
| Ordner-Zeile in Pflaume (`--c-pfaendung`). In der Gruppe `ordner` aus fristen.md (6.5) hat die Zeile `pfaendung` schon Pflaume: Farbe doppelt, Verstoß gegen FARBEN.md. | Fehler | 4.6: Ordner-Zeile Grün (`--c-sparen`), `erwartet.ordner` 8; Symbol im Kopf der Ansicht bleibt Pflaume | `/home/claude/s1/docs/FARBEN.md`; fristen.md 6.5 („Freie Farben …“) |
| Fristende wurde ohne Feiertage gerechnet, fristen.md rechnet mit 9 bundesweiten Feiertagen. Derselbe Mahnbescheid hätte zwei verschiedene Tage gezeigt (25.12. und 28.12.2026). Zudem hätte dieselbe Frist doppelt in „Mein Ordner“ gestanden (aus „Brief prüfen“ und aus der Liste). | Fehler | 4.3, 4.7, 4.8: gemeinsamer Rechenkern, `fristen()` liefert `mb`/`vb` für den Dublettenschutz, `sl.ordner.frist` nur ohne Fristen-Karte, `sl.frist.ungefaehr` angepasst | fristen.md Abschnitt 4, 6.1, 6.7; § 222 Abs. 2 ZPO |
| Abgelaufene Frist: Die Liste hätte dauerhaft „Widersprich bis {vergangenes Datum}“ gezeigt. | Risiko | Neue Texte `sl.frist.mahnbescheid.vorbei`, `sl.frist.vollstreckungsbescheid.vorbei`, Funktion `fristVorbei()` | § 694 Abs. 1 ZPO |
| ZPO-Fristen Mahnbescheid (2 Wochen als Aufforderung, Widerspruch bis zum Erlass des Vollstreckungsbescheids, verspäteter Widerspruch gilt als Einspruch) und Einspruch (2 Wochen, Notfrist): im Entwurf richtig. Fußnote `zpo700` verwies für § 699 auf die falsche Seite. | Hinweis | Fußnote ergänzt; § 180 Satz 3 ZPO (Datum auf dem Umschlag) als Quelle ergänzt | §§ 692, 694, 699, 700, 339, 180 ZPO |
| §§ 41f, 41g EnWG: Zahlen richtig (doppelter Abschlag oder 1/6 der Jahresrechnung, mindestens 100 €, 4 Wochen, 8 Werktage, 1 Woche, 6–18 bzw. 12–24 Monate ab 300 €). Im Laientext fehlte das Verbot bei Unverhältnismäßigkeit und der Weg zum Amt. | Hinweis | `sl.warum.energie` ergänzt | https://www.gesetze-im-internet.de/enwg_2005/__41f.html, …/__41g.html |
| Stromschulden: § 22 Abs. 8 oder § 24 Abs. 1 SGB II? Beides stimmt, je nach Fall: laufender Haushaltsstrom im Bezug → § 24 Abs. 1; Altschulden und Heizkosten → § 22 Abs. 8. `sp.vertraege.4` nennt nur § 22 Abs. 8 und ist unvollständig. | Risiko | Neue Zeile in Tabelle 3, Offene Frage 12, Laientext ohne Paragraph | § 24 Abs. 1, § 22 Abs. 8 SGB II; BA, Fachliche Weisungen § 24, Rz. 24.2–24.3, Stand 01.07.2023, https://www.arbeitsagentur.de/datei/dok_ba035755.pdf |
| `sp.vertraege.4` (vorhanden) nennt für die Ratenzahlung § 19 StromGVV / § 19 GasGVV. Das ist veraltet, die Regel steht in § 41g EnWG. | Risiko | Nur vermerkt (Offene Frage 13), fremde Datei nicht geändert | https://www.gesetze-im-internet.de/stromgvv/__19.html |
| § 43 StGB: 2 Tagessätze = 1 Tag, mindestens 1 Tag: richtig. § 459a, § 459e Abs. 2 StPO und Art. 293 EGStGB tragen die Aussagen zu Raten und freier Arbeit. | Hinweis | keine | https://www.gesetze-im-internet.de/stgb/__43.html |
| § 11 Abs. 4 SGB XII: Absatz und Sätze richtig, einen Abs. 5 gibt es nicht. „Soll hinwirken“ war zu schwach: Das Gesetz sagt „ist hinzuwirken“. | Hinweis | `sl.hilfe.3` und Tabelle 3 genauer gefasst | https://www.gesetze-im-internet.de/sgb_12/__11.html |
| § 16a SGB II nach der Reform: Wortlaut geprüft, Nr. 2 „die Schuldnerberatung“, Ermessen, nur für die Eingliederung in Arbeit. „Hilfe zur Arbeit“ in `sl.hilfe.2` ist ein Begriff aus dem alten Sozialhilferecht und klang nach Anspruch. | Risiko | `sl.hilfe.2` neu gefasst („kann“, „kein fester Anspruch“); BGBl.-Fundstelle der Reform ergänzt | https://www.gesetze-im-internet.de/sgb_2/__16a.html; BGBl. 2026 I Nr. 107, https://www.recht.bund.de/bgbl/1/2026/107/VO.html |
| Krankenversicherung: „kann ruhen lassen“ war falsch (der Anspruch ruht kraft Gesetzes), „Vorsorge“ ungenau, Ratenvereinbarung ohne Bedingung, private Versicherung fehlte. | Fehler | `sl.warum.kranken` und Tabelle 3 korrigiert, § 193 Abs. 6, 7 VVG ergänzt | https://www.gesetze-im-internet.de/sgb_5/__16.html; https://www.gesetze-im-internet.de/vvg_2008/__193.html |
| Einstufung Krankenversicherung/Bußgeld (Stufe 2): durch BAG-SB und Verbraucherzentrale nicht belegt (beide nennen sie nicht). Zugleich Widerspruch zum vorhandenen Text `sp.schulden.2`, der die Krankenversicherung bei „zuerst“ nennt. | Risiko | Offene Frage 5 erweitert, Tabelle 3 mit Hinweis; Entscheidung des Nutzers nötig | meine-schulden.de (Aktualisierung 09.07.2026); verbraucherzentrale.de (Stand 27.01.2026); `src/lang/de.json` Z. 1407 |
| Rangfolge: Zitat der BAG-SB wörtlich bestätigt (Lebensmittel, Miete, Strom; Geldstrafen; Banken, Inkasso, Versand zum Schluss). Unterhalt belegt nur die Verbraucherzentrale. | Hinweis | Fußnote um Aktualisierungsdatum und vollständigen Wortlaut ergänzt; Herausgeber von verbraucherzentrale.de berichtigt | wie oben |
| `sl.warum.behoerde`: Monatsfrist war ungeprüft und galt im Text für alle Ämter. | Risiko | Geprüft, auf das Jobcenter begrenzt, 30-Prozent-Deckel ergänzt | § 84 Abs. 1 SGG; § 43 Abs. 2 SGB II |
| `sl.warum.miete`: „wird unwirksam“ ohne Hinweis, dass eine Kündigung mit Frist bestehen bleiben kann. Sozialamt: nicht nur Darlehen, auch Beihilfe. | Risiko | Satz aus `sp.schulden.miete` übernommen; Tabelle 3 und Fußnote § 36 SGB XII ergänzt. BGH-Fundstelle offen (Offene Frage 14) | § 569 Abs. 3 Nr. 2 BGB; § 36 Abs. 1 SGB XII |
| `sl.warum.rest`: „haben keinen Weg …“ verschwieg, dass diese Gläubiger pfänden lassen können. | Risiko | Satz ergänzt (Pfändung mit Titel, Schutz durch Freigrenze und P-Konto) | § 700 Abs. 1 ZPO; vorhandener Text `sp.schulden.konto` |
| Datenschutz Speicherung: „Niemand sonst sieht sie“ und „mit PIN verschlüsselt“ waren zu stark. Ohne PIN liegen die Daten im Klartext im Gerätespeicher (`vorgaenge.js` Z. 2–4). | Fehler | `sl.privat` und Kurzfassung korrigiert | `/home/claude/s1/src/vorgaenge.js` |
| Druckblatt: kein Name, Notizen standardmäßig aus: gut. Aber Aktenzeichen und Kundennummern machen die Person zuordenbar, und bei „Familie, Freunde“ stehen Namen Dritter darauf. `briefe.nurDeutsch` passt inhaltlich nicht. | Risiko | `sl.druck.intro` ehrlich gefasst, Haken `sl.druck.az`, neuer Schlüssel `sl.druck.nurDeutsch`, Hinweis in 4.5 | `src/lang/de.json` Z. 1181 |
| CSV-Injection: `csvFeld` aus `haushalt.js` Z. 160 deckt `= + - @ Tab CR` ab und setzt Felder mit `;`, `"` und Zeilenumbruch in Anführungszeichen. Lücken: Die Funktion ist nicht exportiert; Felder mit Leerzeichen vor dem `=` und mehrzeilige Anschriften waren nicht im Test. | Risiko | 4.3 berichtigt, Testfälle in 4.7 ergänzt. Empfehlung: in der Kopie `/^\s*[=+\-@]/` prüfen | `/home/claude/s1/src/haushalt.js` Z. 160, 835–845 |
| Bauplan gegen Code: Zeilenangaben stimmen (ANSICHTEN 2475, spRender 2337, ordnerRender 2844, Init 3380, build.js 35–37 und 120–121, template 969/1603/1660). Fehler: `knopfZeile()` gibt es nicht; `el()` steht in Z. 324, nicht 319. `Haushalt.daten().plan.aus.raten` und `Haushalt.rest()` (`ein`, `aus`, `rest`, `leer`) gibt es. Keine neue Startkachel, 6 bleiben. | Hinweis | 4.1 und 4.2 berichtigt | `/home/claude/s1/src/app.js`, `haushalt.js` |
| Einfache Sprache: `sl.warum.bussgeld` („Ärger mit dem Gericht“) war zu vage, `sl.u.8` konnte zur kostenpflichtigen Schufa-Auskunft führen. | Hinweis | Beide Texte konkreter gefasst | § 96 Abs. 1 OWiG |
| Stellensuche der BAG-SB: Umkreis 10–100 km, Filter kostenfrei, P-Konto, § 305 InsO bestätigt. „Stand der Datenbank“ steht dort nicht, nur „Letzte Aktualisierung: 05.11.2026“. | Hinweis | Tabelle 3 und `sl.hilfe.1` angepasst | https://www.meine-schulden.de/hilfe-finden/stellensuche |

**Offen nach der Prüfung:** Offene Fragen 5 (Stufe der Krankenversicherung), 12 und 13 (vorhandene Texte zu Energieschulden), 14 (BGH-Fundstelle), 15 (DSGVO-Quelle), 16 und 17 (Datensparsamkeit). Nicht geprüft: § 19 GasGVV, § 850c ZPO, die VZ-NRW-Unterlagenliste von 2016, der Newsletter der Bundesregierung von 2023 und ob es eine BA-Weisung zu § 24 SGB II nach dem 01.07.2026 gibt.

## Entscheidung Koordination (20.11.2026)
- Krankenversicherung kommt wie im vorhandenen Text `sp.schulden.2` in Stufe 1 „Zuerst“ (Ruhen des Anspruchs § 16 Abs. 3a SGB V, Einheitlichkeit der App). Bußgeld bleibt Stufe 2 „Auch wichtig“ mit Hinweis auf Erzwingungshaft (§ 96 OWiG) – ohne Rangfolge-Zusage, nur Erklärung.
- Schuldensumme wird in „Mein Ordner“ nicht angezeigt (nur Zahl der Einträge), damit die Übersicht nicht überladen ist und beim Zeigen des Handys nichts preisgibt.
- CSV-Export wie im Haushaltsbuch (gleicher Weg, gleicher Schutz).
