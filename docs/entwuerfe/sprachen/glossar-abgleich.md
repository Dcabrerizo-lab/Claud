# Abgleich App-Übersetzungen mit dem Glossar

Stand 21.11.2026 · Worktree `origin/claude/test-update-1.9` (adae98d) · nur gelesen, nichts geändert.

**Was geprüft wurde:** Alle Texte in `src/lang/<sprache>.json` und `src/lang/<bereich>/<sprache>.json` (ohne `einfach/`, das ist nur Deutsch). Für jeden der 65 Glossarbegriffe wurden die Schlüssel gesucht, deren deutscher Text den Begriff enthält (1 396 Fundstellen je Sprache). Dann wurde der Text in der Zielsprache geprüft.

**Bewertung (automatisch, mit Handprüfung der Auffälligkeiten):**

| Bewertung | Bedeutung |
|---|---|
| gleichwertig | amtliches Wort, ein belegtes Synonym, eine Wortform oder der deutsche Leistungs-/Ämtername (so gewollt: „Namen bleiben auf Deutsch“) steht im Text |
| abweichend | anderes Wort, nur das deutsche Wort ohne Übersetzung bei einem Allgemeinbegriff, oder mehrdeutiges Wort |
| fraglich | Wort mit anderem Sinn (möglicher Fehler) |
| falsch | bekannte Fehlübersetzung (falscher Freund) – Suchliste siehe unten |
| nicht bewertbar | keine amtliche Übersetzung gefunden und kein Kandidat im Text |

**Grenzen:** Die Prüfung erkennt Wörter, nicht Sinn. „gleichwertig“ heißt: das erwartete Wort steht im Satz – nicht, dass der ganze Satz richtig ist. Gezielt gesucht wurden falsche Freunde: Widerspruch → „contradiction/çelişki/تناقض/противоречие…“, Abschlag → „discount/remise/indirim/خصم/скидка…“ (außer Rente), Kaution → „bail“, Pfändung → „pawn/رهن/залог…“, Mahnbescheid → „reminder/rappel…“, Räumung → „cleaning…“, Vermögen → „ability…“, Termin → „deadline“, Frist → „appointment“. **Kein Treffer.**

## Übersicht je Sprache

| Sprache | Fundstellen | gleichwertig | abweichend | fraglich | falsch | nicht bewertbar | Glossar belegt (von 65) |
|---|---|---|---|---|---|---|---|
| en | 1396 | 1381 | 13 | 0 | 0 | 2 | 59 |
| fr | 1396 | 1379 | 17 | 0 | 0 | 0 | 60 |
| tr | 1396 | 1381 | 13 | 0 | 0 | 2 | 55 |
| ar | 1396 | 1292 | 89 | 0 | 0 | 15 | 54 |
| fa | 1396 | 1339 | 47 | 0 | 0 | 10 | 50 |
| fa-AF | 1396 | 1322 | 48 | 0 | 0 | 26 | 20 |
| ps | 1396 | 1325 | 54 | 0 | 0 | 17 | 24 |
| ru | 1396 | 1362 | 27 | 0 | 0 | 7 | 45 |
| uk | 1396 | 1370 | 21 | 0 | 0 | 5 | 48 |
| pl | 1396 | 1365 | 26 | 0 | 0 | 5 | 41 |
| ro | 1396 | 1338 | 35 | 0 | 0 | 23 | 43 |
| so | 1396 | 1291 | 73 | 4 | 0 | 28 | 35 |

## Wichtigste Befunde (von Hand geprüft)

1. **„Bescheid“ bleibt in fa, fa-AF, ps und so oft unübersetzt** (fa 13, fa-AF 13, ps 17, so 19 Stellen nur „Bescheid“; daneben „تصمیم“/„پرېکړه“/„go’aan“). en/fr/tr/ar/ru/uk/pl/ro übersetzen durchgehend. Vorschlag: einheitlich „Bescheid (amtliches Wort)“ wie in den anderen Sprachen, z. B. fa „تصمیم رسمی (Bescheid)“.
2. **Arabisch „Frist“ uneinheitlich und mehrdeutig:** 28× „مهلة“, 31× „موعد/مواعيد“. „موعد“ heißt auch Termin (so auch für „Termin“ verwendet). Amtlich (Familienkasse KiZ-Merkblatt) „الموعد النهائي“, Handbook Germany „مهلة“. Vorschlag: einheitlich „المهلة“.
3. **Somali „Widerspruch“ uneinheitlich:** „diidmo“ 11×, „racfaan“ 6×, „dacwad“ 4×, sonst nur „Widerspruch“. „dacwad“ heißt Klage/Prozess → **fraglich** (Verwechslung Widerspruch/Klage). Vorschlag: einheitlich „racfaan (Widerspruch)“ oder „diidmo (Widerspruch)“ – vor Festlegung von Muttersprachler bestätigen lassen (keine amtliche so-Quelle).
4. **Somali „Freibetrag“ und „Mehrbedarf“ meist nur deutsch** (9× bzw. 11× ohne Übersetzung).
5. **Englisch „Bescheid“ uneinheitlich:** 26× „decision“, 15× „notice“. Beides korrekt (Familienkasse: „notice“), aber einheitlich wäre besser.
6. **Polnisch „Widerspruch“:** 15× „sprzeciw“ (amtlich, Familienkasse), 8× „odwołanie“ (heißt eher Berufung/Rechtsmittel) → angleichen.
7. **„Pflegegrad“ in fa, fa-AF, ps, so fast immer nur deutsch** (34–36 Stellen ohne Erklärung); en/fr/tr/ar/ru/uk/pl/ro geben eine Übersetzung dazu („care level“, „degré de dépendance“, „درجة الرعاية“, „степень ухода“ …). Ist so gewollt (Leistungsnamen deutsch), aber hier fehlt die Erklärung beim ersten Vorkommen. Hinweis: amtlich (Germany4Ukraine) uk „ступінь потреби в догляді“, App „ступінь догляду“ – verständlich, gleichwertig.
8. **Russisch/Ukrainisch „Widerspruch“:** App „возражение/заперечення“ einheitlich (21/22×) – gut. Handbook Germany ru nutzt „протест“; beides verständlich.
9. **Keine falschen Freunde gefunden** (siehe Suchliste oben).

## Einheitlichkeit wichtiger Begriffe

Anzahl Stellen je gefundener Wortwahl („andere“ = umschrieben, deutsch belassen oder nicht erkannt).

| Begriff | Sprache | Verteilung |
|---|---|---|
| Frist | ar | مهل: 28 · موعد: 22 · (andere/umschrieben): 13 · مواعيد: 9 |
| Frist | fa | مهلت: 62 · (andere/umschrieben): 10 |
| Frist | fa-AF | مهلت: 62 · (andere/umschrieben): 10 |
| Frist | ps | موده: 43 · مودې: 15 · (andere/umschrieben): 10 · نېټ: 4 |
| Frist | ru | срок: 55 · (andere/umschrieben): 17 |
| Frist | uk | строк: 56 · (andere/umschrieben): 15 · термін: 1 |
| Frist | tr | süre: 58 · (andere/umschrieben): 10 · son gün: 4 |
| Frist | pl | termin: 52 · (andere/umschrieben): 20 |
| Frist | ro | termen: 53 · (andere/umschrieben): 19 |
| Frist | so | (andere/umschrieben): 35 · waqti: 29 · muddo: 6 · wakhti: 2 |
| Frist | en | deadline: 50 · (andere/umschrieben): 21 · period: 1 |
| Frist | fr | délai: 48 · (andere/umschrieben): 24 |
| Termin | ar | موعد: 11 · (andere/umschrieben): 3 · مواعيد: 2 |
| Termin | fa | (andere/umschrieben): 6 · قرار: 6 · وقت: 4 |
| Termin | fa-AF | (andere/umschrieben): 7 · قرار: 5 · وقت: 4 |
| Termin | ps | ملاقات: 7 · (andere/umschrieben): 5 · وخت: 4 |
| Termin | ru | (andere/umschrieben): 7 · встреч: 7 · приём: 2 |
| Termin | uk | (andere/umschrieben): 7 · зустріч: 7 · прийом: 2 |
| Termin | tr | randevu: 9 · (andere/umschrieben): 7 |
| Termin | pl | termin: 9 · wizyt: 4 · (andere/umschrieben): 3 |
| Termin | ro | (andere/umschrieben): 8 · întâlnire: 4 · programare: 4 |
| Termin | so | (andere/umschrieben): 8 · ballan: 8 |
| Termin | en | (andere/umschrieben): 8 · appointment: 8 |
| Termin | fr | rendez-vous: 9 · (andere/umschrieben): 7 |
| Widerspruch | ar | اعتراض: 23 · (andere/umschrieben): 6 · طعن: 1 |
| Widerspruch | fa | اعتراض: 25 · (andere/umschrieben): 5 |
| Widerspruch | fa-AF | اعتراض: 25 · (andere/umschrieben): 5 |
| Widerspruch | ps | اعتراض: 24 · (andere/umschrieben): 6 |
| Widerspruch | ru | возраж: 21 · (andere/umschrieben): 8 · обжал: 1 |
| Widerspruch | uk | запереч: 22 · (andere/umschrieben): 7 · оскарж: 1 |
| Widerspruch | tr | itiraz: 23 · (andere/umschrieben): 7 |
| Widerspruch | pl | sprzeciw: 15 · odwoł: 8 · (andere/umschrieben): 7 |
| Widerspruch | ro | contesta: 16 · (andere/umschrieben): 9 · opozi: 5 |
| Widerspruch | so | (andere/umschrieben): 19 · racfaan: 6 · diidmo: 5 |
| Widerspruch | en | objection: 18 · (andere/umschrieben): 8 · object: 4 |
| Widerspruch | fr | recours: 13 · opposition: 8 · (andere/umschrieben): 8 · contest: 1 |
| Bescheid | ar | قرار: 44 · (andere/umschrieben): 9 · إشعار: 4 |
| Bescheid | fa | تصمیم: 32 · bescheid: 13 · (andere/umschrieben): 11 · ابلاغ: 1 |
| Bescheid | fa-AF | تصمیم: 30 · bescheid: 13 · (andere/umschrieben): 11 · فیصله: 2 · ابلاغ: 1 |
| Bescheid | ps | پرېکړ: 25 · bescheid: 17 · (andere/umschrieben): 15 |
| Bescheid | ru | решени: 42 · (andere/umschrieben): 15 |
| Bescheid | uk | рішенн: 43 · (andere/umschrieben): 14 |
| Bescheid | tr | karar: 43 · (andere/umschrieben): 14 |
| Bescheid | pl | decyzj: 43 · (andere/umschrieben): 14 |
| Bescheid | ro | decizi: 41 · (andere/umschrieben): 16 |
| Bescheid | so | go'aan: 22 · bescheid: 19 · (andere/umschrieben): 16 |
| Bescheid | en | decision: 26 · (andere/umschrieben): 16 · notice: 15 |
| Bescheid | fr | décision: 36 · (andere/umschrieben): 21 |
| Pflegegrad | ru | степени ухода: 18 · степень ухода: 15 · (andere/umschrieben): 8 |
| Pflegegrad | uk | ступінь догляду: 18 · ступеня догляду: 12 · (andere/umschrieben): 8 · ступені догляду: 3 |
| Pflegegrad | pl | stopień opieki: 13 · stopnia opieki: 11 · (andere/umschrieben): 9 · stopniu opieki: 8 |
| Pflegegrad | ro | gradul de îngrijire: 18 · grad de îngrijire: 16 · (andere/umschrieben): 7 |
| Pflegegrad | tr | bakım derece: 34 · (andere/umschrieben): 7 |
| Pflegegrad | fr | degré de dépendance: 22 · (andere/umschrieben): 19 |
| Pflegegrad | en | care level: 34 · (andere/umschrieben): 7 |
| Pflegegrad | ar | درجة الرعاية: 23 · (andere/umschrieben): 18 |
| Pflegegrad | fa | (andere/umschrieben): 34 · درجه مراقبت: 7 |
| Pflegegrad | fa-AF | (andere/umschrieben): 36 · درجه مراقبت: 5 |
| Pflegegrad | ps | (andere/umschrieben): 35 · د پاملرنې درج: 6 |
| Pflegegrad | so | (andere/umschrieben): 34 · heerka daryeel: 7 |
| Kaution | ar | (andere/umschrieben): 5 · تأمين: 2 |
| Kaution | fa | (andere/umschrieben): 4 · ودیعه: 3 |
| Kaution | fa-AF | (andere/umschrieben): 4 · ودیعه: 3 |
| Kaution | en | (andere/umschrieben): 4 · deposit: 3 |
| Kaution | fr | (andere/umschrieben): 4 · caution: 3 |
| Kaution | ru | (andere/umschrieben): 4 · залог: 3 |
| Kaution | uk | (andere/umschrieben): 4 · застав: 3 |
| Kaution | tr | (andere/umschrieben): 4 · depozito: 3 |
| Kaution | pl | (andere/umschrieben): 4 · kaucj: 3 |
| Kaution | ro | (andere/umschrieben): 4 · garanți: 3 |
| Kaution | ps | (andere/umschrieben): 4 · ضمانت: 3 |
| Kaution | so | (andere/umschrieben): 4 · dammaanad: 3 |
| Freibetrag | so | freibetr: 9 · (andere/umschrieben): 7 · dhaaf: 4 · qadar: 2 |
| Freibetrag | ar | (andere/umschrieben): 11 · الإعفاء: 6 · معفى: 5 |
| Freibetrag | ru | льгот: 10 · (andere/umschrieben): 10 · необлагаем: 2 |
| Freibetrag | uk | (andere/umschrieben): 11 · пільг: 10 · неоподатк: 1 |
| Mehrbedarf | so | mehrbedarf: 11 · (andere/umschrieben): 4 · dheeraad: 4 |
| Mehrbedarf | ar | إضافي: 16 · (andere/umschrieben): 3 |
| Mehrbedarf | fa | اضافی: 16 · (andere/umschrieben): 3 |
| Mehrbedarf | ps | اضافي: 15 · (andere/umschrieben): 4 |

## Liste je Sprache (nur nicht gleichwertige Stellen)

Alle 1 396 Fundstellen je Sprache mit Bewertung: `glossar-abgleich.json`. „App-Wort“ = erkanntes Wort; bei „?“ steht der App-Text-Auszug daneben.

### en (15 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `en.json` t.alg1.melden | Kündigung | „Important: register as a job seeker at least 3 months before the end, …“ | termination | abweichend (amtliches Wort fehlt, prüfen) |
| `en.json` t.mu.ohne | Mehrbedarf | „Without work or Arbeitslosengeld there is no Mutterschaftsgeld. With G…“ | additional needs | abweichend (amtliches Wort fehlt, prüfen) |
| `en.json` t.krank.selbst | Krankenkasse | „Self-employed people only get Krankengeld if they chose it with their …“ | health insurance fund | abweichend (amtliches Wort fehlt, prüfen) |
| `en.json` gs.d.strom | Stromsperre | „Electricity or gas cut-off threatened…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `en.json` sp.schulden.inkasso | Frist | „Check calmly: Do you know the company the collector writes for? Did yo…“ | deadline | abweichend (amtliches Wort fehlt, prüfen) |
| `schritte/en.json` sf.h.ernaehrung | Mehrbedarf | nur deutsch: „For example with coeliac disease, cystic fibrosis or severe kidney dis…“ | additional needs | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/en.json` sl.frist.mahnbescheid | Frist | nur deutsch: „Payment order delivered on {d}. If the claim is wrong or only partly r…“ | deadline | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/en.json` sl.frist.vollstreckungsbescheid.vorbei | Bescheid | „According to the app's calculation, the appeal deadline since delivery…“ | notice | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/en.json` sl.hilfe.5 | Stromsperre | „Is it urgent (eviction, electricity or gas cut-off, detention, account…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/en.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB); meine-schulden.de…“ | debt counselling | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/en.json` hb.hw.verm.d.kiz | Antrag | „With the child supplement (Kinderzuschlag), {a} for the applicant and …“ | application | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/en.json` az.p.strom.t | Bescheid | „Sign an electricity contract. On the day you move in, note the meter r…“ | notice | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/en.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch or Klage against the decision ({stelle})…“ | objection | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/en.json` fri.wid.offen | Widerspruch | nur deutsch: „The legal remedy has a different name depending on the office: usually…“ | objection | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/en.json` fri.wid.wg | Widerspruch | nur deutsch: „Housing benefit (Wohngeld): in some federal states there is no Widersp…“ | objection | abweichend (nur deutsches Wort, keine Übersetzung) |

### fr (17 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `fr.json` t.rundfunk.weitere | Befreiung | „D'après tes informations, une prestation qui exonère aussi de la redev…“ | exonération | abweichend (amtliches Wort fehlt, prüfen) |
| `fr.json` bh.gdb.antrag | Bescheid | nur deutsch: „Demandé, Bescheid pas encore reçu…“ | décision | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fr.json` t.alg1.melden | Kündigung | „Important : inscris-toi comme demandeur d'emploi au plus tard 3 mois a…“ | résiliation | abweichend (amtliches Wort fehlt, prüfen) |
| `fr.json` pf.tipp.unterhalt | Freibetrag | „Si la saisie concerne des dettes de pension alimentaire, des seuils pl…“ | abattement | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fr.json` sl.frist.mahnbescheid | Frist | nur deutsch: „Injonction de payer notifiée le {d}. Si la créance est fausse ou seule…“ | délai | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/fr.json` sl.warum.miete | Termin | „En cas de loyers impayés, le bailleur peut résilier sans préavis : si …“ | rendez-vous | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fr.json` sl.warum.rest | Schuldnerberatung | „Les banques, sociétés de recouvrement, de vente par correspondance et …“ | conseil en matière de dettes | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fr.json` ip.1 | Inkasso | „Pour qui la société écrit : nom et adresse de l'entreprise…“ | recouvrement | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fr.json` ip.6 | Inkasso | „Si la société n'a pas obtenu ton adresse du créancier : une mention à …“ | recouvrement | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fr.json` ip.w1 | Inkasso | „Avec une reconnaissance de dette, tu ne peux souvent plus contester pl…“ | recouvrement | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fr.json` ip.w2 | Inkasso | „Avant un accord d'échelonnement ou de report, la société doit t'indiqu…“ | recouvrement | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/fr.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB) ; meine-schulden.de…“ | conseil en matière de dettes | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/fr.json` hb.hw.mb.dauer.d | Regelbedarf | „Exemples concrets : trajets pour voir votre enfant (droit de visite), …“ | besoin de base | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/fr.json` hb.hw.verm.d.gsa | Unterhalt | „À l'aide sociale (Sozialhilfe, p. ex. Grundsicherung im Alter), {a} pa…“ | pension alimentaire | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/fr.json` az.p.strom.t | Bescheid | „Souscris un contrat d'électricité. Le jour de l'emménagement, note le …“ | décision | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/fr.json` az.p.kv.t | Krankenkasse | „Jusqu'à 25 ans, tu peux être assuré gratuitement par tes parents (Fami…“ | caisse d'assurance maladie | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/fr.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch ou Klage contre la décision ({stelle})…“ | recours | abweichend (nur deutsches Wort, keine Übersetzung) |

### tr (15 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `tr.json` s.ggeld.u2 | Nebenkostenabrechnung | „Kira sözleşmesi ve ek gider hesabı…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `tr.json` s.gsa.u2 | Nebenkostenabrechnung | „Kira sözleşmesi ve ek gider hesabı…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `tr.json` t.uvg.titel | Aufenthaltstitel | nur deutsch: „Ne sizin ne de çocuğun Alman veya AB vatandaşlığı yoksa sadece belirli…“ | oturma izni | abweichend (nur deutsches Wort, keine Übersetzung) |
| `tr.json` t.alg1.melden | Kündigung | „Önemli: Sonundan en az 3 ay önce iş arayan olarak kaydolun, yoksa bekl…“ | fesih | abweichend (amtliches Wort fehlt, prüfen) |
| `tr.json` t.kgBeh.hoch | Unterhalt | „Kendi geliri temel muafiyetin (yılda {gfb}) ve götürü indirimin açıkça…“ | nafaka | abweichend (amtliches Wort fehlt, prüfen) |
| `tr.json` t.but.kita | Asylbewerberleistungen | „Grundsicherungsgeld, Wohngeld, Kinderzuschlag veya sığınmacı yardımı a…“ | sığınmacı yardımları | abweichend (amtliches Wort fehlt, prüfen) |
| `tr.json` sc.f.aufenthalt | Aufenthaltstitel | nur deutsch: „Vatandaşlık ve oturum durumu (Aufenthaltstitel). Pasaportta veya oturu…“ | oturma izni | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/tr.json` sl.frist.vollstreckungsbescheid.vorbei | Bescheid | „Uygulamanın hesabına göre {d} tarihindeki tebliğden itibaren itiraz sü…“ | karar | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/tr.json` sl.warum.miete | Termin | „Kira borcunda ev sahibi süresiz fesih yapabilir: art arda 2 vadede bir…“ | randevu | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/tr.json` sl.u.5 | Vermögen | „Mahkeme postası: ödeme ve icra emirleri, kararlar, haciz kararları, ma…“ | varlık | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/tr.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB); meine-schulden.de…“ | borç danışmanlığı | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/tr.json` hb.hw.verm.d.gsa | Unterhalt | „Sosyal yardımda (Sozialhilfe, ör. Grundsicherung im Alter) yetişkin ba…“ | nafaka | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/tr.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Karara Widerspruch veya Klage ({stelle})…“ | itiraz | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/tr.json` fri.wid.offen | Widerspruch | nur deutsch: „Başvuru yolunun adı kuruma göre değişir: çoğunlukla Widerspruch, çocuk…“ | itiraz | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/tr.json` fri.wid.wg | Widerspruch | nur deutsch: „Kira yardımı (Wohngeld): Bazı eyaletlerde Widerspruch yoktur. O zaman …“ | itiraz | abweichend (nur deutsches Wort, keine Übersetzung) |

### ar (104 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `ar.json` s.ggeld.u2 | Nebenkostenabrechnung | „عقد الإيجار وكشف المصاريف الإضافية…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ar.json` s.gsa.u2 | Nebenkostenabrechnung | „عقد الإيجار وكشف المصاريف الإضافية…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ar.json` s.pflege.wo | Krankenkasse | „لدى Pflegekasse التابع لتأمينك الصحي. مكالمة هاتفية تكفي لتقديم الطلب.…“ | شركة التأمين الصحي | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` cb.bhSelbst | Unterhalt | „لا يستطيع الشخص ذو الإعاقة إعالة نفسه بسبب الإعاقة (دون دخل خاص أو بدخ…“ | النفقة | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` s.pausch.wo | Einkommen | „في الإقرار الضريبي لدى Finanzamt. لا حاجة إلى طلب منفصل.…“ | الدخل | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` s.pflegeplus.wo | Krankenkasse | „لدى Pflegekasse التابعة لصندوق تأمينك الصحي.…“ | شركة التأمين الصحي | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` s.rundfunk.wo | Sozialleistungen | „لدى Beitragsservice التابع لـ ARD وZDF وDeutschlandradio، مع النموذج و…“ | المساعدات الاجتماعية | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.kgBeh.ja | Unterhalt | „قد يُدفع Kindergeld لطفل بالغ ذي إعاقة دون حد أقصى للعمر. الشرط: أن تك…“ | النفقة | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.kgBeh.pruefen | Unterhalt | „ممكن إذا بدأت الإعاقة قبل عيد ميلاده الخامس والعشرين ولم يستطع الطفل إ…“ | النفقة | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.ausweis.niedrig | Schwerbehindertenausweis | „مع GdB أقل من 30 لا توجد بطاقة إعاقة شديدة ولا مساواة. وقد يظل المبلغ …“ | بطاقة الإعاقة | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` l.einsKurz | Frist | „كل البيانات والمواعيد وقائمة الديون والعلامات – لهذا الملف فقط. تبقى ا…“ | الموعد النهائي | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.wbs.abzug | Freibetrag | „الحساب مبسّط. يُخصم من الدخل حسب الحالة مبالغ جزافية (حتى 30٪، لكن كلٌ…“ | الإعفاء | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.rundfunk.folgt | Sozialleistungen | „إذا مُنحت Grundsicherung أو Grundsicherungsgeld يمكنك بعدها طلب الإعفا…“ | المساعدات الاجتماعية | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.rundfunk.haerte | Sozialleistungen | „إذا كان دخلك يتجاوز حد الاحتياج لمزية اجتماعية بأقل من رسوم البث، يمكن…“ | المساعدات الاجتماعية | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.rundfunk.nein | Sozialleistungen | „وفق بياناتك لا يوجد حق في الإعفاء. يُمنح الإعفاء أساساً عند تلقي مزايا…“ | المساعدات الاجتماعية | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` s.krankengeld.wo | Krankenkasse | „ترسل العيادة الإجازة المرضية إلكترونيًا إلى صندوق التأمين. عادةً لا حا…“ | شركة التأمين الصحي | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` s.krankengeld.tip | Krankenkasse | „انتبه لرسائل صندوق التأمين: إذا طلب منك تقديم طلب إعادة تأهيل فلديك 10…“ | شركة التأمين الصحي | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.alg1.melden | Kündigung | „مهم: سجّل كباحث عن عمل قبل النهاية بـ 3 أشهر على الأقل، وإلا قد تُفرض …“ | إنهاء العقد | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.krank.keine | Krankenkasse | „يدفع صندوق التأمين Krankengeld إذا استمرت الإجازة المرضية أكثر من 6 أس…“ | شركة التأمين الصحي | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.krank.lfz | Krankenkasse | „في أول 6 أسابيع يواصل صاحب العمل دفع الأجر. بعد ذلك يدفع صندوق التأمين…“ | شركة التأمين الصحي | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.krank.ja | Krankenkasse | „يدفع صندوق التأمين Krankengeld: 70 % من الإجمالي، وبحد أقصى 90 % من ال…“ | شركة التأمين الصحي | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` es.q.gdb | Ausweis | „ما الرقم المكتوب في بطاقتك؟…“ | الهوية | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` es.q.mz | Ausweis | „ما الحروف المكتوبة في بطاقتك؟…“ | الهوية | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` es.tipp.pauschEltern | Freibetrag | „يمكن لوالديك استخدام إعفائك الضريبي لأنفسهم. عندها يدفعان ضرائب أقل.…“ | الإعفاء | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` es.tipp.pauschElternH | Freibetrag | „يمكن لوالديك استخدام إعفائك الضريبي: 7,400 € سنويًا مع H أو Bl أو TBl.…“ | الإعفاء | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.kgBeh.hoch | Unterhalt | „الدخل الخاص أعلى بوضوح من الإعفاء الأساسي ({gfb} سنويًا) والمبلغ المقط…“ | النفقة | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.hzp.verm | Vermögen | „يجب أولًا استخدام الأموال فوق المبلغ المحمي للرعاية.…“ | الأصول | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.hzp.heim | Vermögen | „في دار الرعاية: يدفع الدخل والمال الخاص الحصة الذاتية أولًا، ثم جهة ال…“ | الأصول | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` t.mu.ohne | Mehrbedarf | „بدون عمل أو Arbeitslosengeld لا يوجد Mutterschaftsgeld. لكن مع Grundsi…“ | احتياجات إضافية | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` heiz.hint | Nebenkostenabrechnung | „دفعة التدفئة مذكورة في عقد الإيجار أو في فاتورة التكاليف الجانبية. بها…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ar.json` el.frist | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `ar.json` el.ks.frist | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `ar.json` el.ks.beleg | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `ar.json` el.ks.frist.btn | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `ar.json` el.ks.frist.ok | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `ar.json` el.ks.frist.da | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `ar.json` el.ks.frist.fehler | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `ar.json` el.ks.frist.datum | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `ar.json` ww.a.t | Termin | „يغطي الحاجة كلها: الاحتياج الأساسي والإيجار والتدفئة، إضافة إلى التأمي…“ | الموعد | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` pf.kg.hint | P-Konto | „إعانة الأطفال (Kindergeld) محمية إضافيًا في حساب الحماية.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ar.json` pf.erg.konto | P-Konto | „في حساب الحماية يُحمى {g} شهريًا.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ar.json` pf.tipp.unterhalt | Freibetrag | „إذا كان الحجز بسبب ديون نفقة، تسري مبالغ معفاة أقل (§ 850d ZPO). عندها…“ | الإعفاء | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` gs.d.mahn | Mahnbescheid | „أمر دفع من المحكمة (Mahn­bescheid)…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ar.json` sp.schulden.insolvenz | Befreiung | „بالإعسار الشخصي (Privatinsolvenz) يمكن إعفاؤك من الديون المتبقية بعد إ…“ | إعفاء | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` sp.schulden.insolvenz.kurz | Befreiung | „ديون كثيرة جدًا: الإعسار الشخصي يحررك غالبًا بعد 3 سنوات.…“ | إعفاء | abweichend (amtliches Wort fehlt, prüfen) |
| `ar.json` sp.vertraege.6 | Kündigung | „افحص العقود المكلفة (الهاتف المحمول، النادي الرياضي، المجلات). بعد الم…“ | إنهاء العقد | abweichend (amtliches Wort fehlt, prüfen) |
| `zusatz/ar.json` ww.a.t0 | Termin | „يغطي الاحتياج كله: الاحتياج الأساسي والإيجار والتدفئة، إضافة إلى التأم…“ | الموعد | abweichend (amtliches Wort fehlt, prüfen) |
| `zusatz/ar.json` gn.vermoegen | Vermögen | „الأموال المدخرة (0 إذا لم يوجد)…“ | الأصول | abweichend (amtliches Wort fehlt, prüfen) |
| `zusatz/ar.json` bp.nk.h | Nebenkostenabrechnung | nur deutsch: „فحص كشف التكاليف الجانبية (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `zusatz/ar.json` bp.nk.p | Frist | „امسح الكشف ضوئيًا. يفحص SoLo المواعيد والبنود.…“ | الموعد النهائي | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ar.json` sl.frist.mahnbescheid | Frist | nur deutsch: „سُلِّم أمر الدفع في {d}. إذا كانت المطالبة غير صحيحة أو صحيحة جزئيًا ف…“ | الموعد النهائي | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/ar.json` sl.frist.mahnbescheid | Vollstreckungsbescheid | „سُلِّم أمر الدفع في {d}. إذا كانت المطالبة غير صحيحة أو صحيحة جزئيًا ف…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ar.json` sl.frist.mahnbescheid.vorbei | Vollstreckungsbescheid | „مضى أسبوعان (2) منذ التسليم في {d}. ومع ذلك لا يزال الاعتراض ممكنًا ما…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ar.json` sl.frist.vollstreckungsbescheid.vorbei | Bescheid | „حسب حساب التطبيق انتهت مهلة الطعن منذ التسليم في {d}. اذهب فورًا مع ال…“ | قرار | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ar.json` sl.warum.behoerde | Rückforderung | „يمكن لـ Jobcenter أن يخصم المبالغ المطلوب ردها من Grundsicherungsgeld …“ | استرداد | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ar.json` sl.warum.rest | Vollstreckungsbescheid | „البنوك وشركات التحصيل والشراء عبر البريد وشركات الهاتف لا يمكنها أن تأ…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ar.json` sl.hilfe.1 | P-Konto | „البحث حسب الرمز البريدي: meine-schulden.de ← „Hilfe finden“ (الرابطة ا…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ar.json` sl.u.5 | Vermögen | „بريد المحكمة: أوامر الدفع وأوامر التنفيذ والأحكام وقرارات الحجز والاست…“ | الأصول | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ar.json` ip.1 | Inkasso | „لصالح من تكتب الشركة: اسم الشركة الدائنة وعنوانها…“ | تحصيل الديون | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ar.json` ip.6 | Inkasso | „إذا لم تحصل الشركة على عنوانك من الدائن: ملاحظة بذلك…“ | تحصيل الديون | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ar.json` ip.w1 | Inkasso | „إذا وقّعت إقرارًا بالدين فلن تستطيع غالبًا الاعتراض لاحقًا بأن الدين غ…“ | تحصيل الديون | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ar.json` ip.w2 | Inkasso | „قبل اتفاق تقسيط أو تأجيل يجب على الشركة أن تخبرك كتابيًا بالتكاليف الن…“ | تحصيل الديون | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ar.json` hb.tipp.miete | Nebenkostenabrechnung | „تحقق مما إذا كان بإمكانك الحصول على إعانة السكن (Wohngeld). اطلب فحص ك…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/ar.json` hb.tipp.handy | Kündigung | „بعد انتهاء المدة الدنيا يمكنك إلغاء عقود الهاتف والإنترنت بمهلة شهر وا…“ | إنهاء العقد | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ar.json` hb.tipp.sonst | Kündigung | „راجع اشتراكاتك وعضوياتك، مثل البث والنادي الرياضي والمجلات. ألغِ ما لا…“ | إنهاء العقد | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ar.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB)؛ meine-schulden.de…“ | استشارات الديون | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/ar.json` hb.hw.mb.dauer.d | Regelbedarf | „أمثلة من الواقع: رحلات لرؤية الطفل (حق الزيارة)، مواد العناية والنظافة…“ | الاحتياجات الأساسية | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ar.json` hb.hw.verm.d.gsa | Unterhalt | „في المساعدة الاجتماعية (Sozialhilfe، مثل Grundsicherung im Alter) يبقى…“ | النفقة | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ar.json` hb.en.passt | Abschlag | „دفعتك المسبقة مناسبة تقريباً.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `klient/ar.json` kb.teil.fristen | Frist | „المواعيد النهائية…“ | الموعد النهائي | abweichend (amtliches Wort fehlt, prüfen) |
| `klient/ar.json` kb.d.fristen | Frist | „مواعيدك النهائية…“ | الموعد النهائي | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ar.json` az.notiz.t | Termin | „مثلاً مواعيد أو أسماء أو أسئلة…“ | الموعد | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ar.json` az.p.vertrag.t | Kaution | nur deutsch: „انتبه إلى الإيجار الأساسي (Kaltmiete) والتكاليف الجانبية (Nebenkosten،…“ | التأمين | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ausziehen/ar.json` az.p.kaution | Kaution | „الكفالة: ممكنة كقرض من Jobcenter…“ | التأمين | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ar.json` az.p.kaution.t | Kaution | „إذا كنت تحصل على Grundsicherungsgeld، يمكن لـ Jobcenter في مكانك الجدي…“ | التأمين | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ar.json` az.p.melden.t | Termin | „سجّل في مكتب المواطنين (Bürgeramt، Meldebehörde) خلال أسبوعين (2) من ا…“ | الموعد | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ar.json` az.p.strom.t | Bescheid | „اعقد عقد كهرباء. في يوم الانتقال دوّن قراءة العداد والتقط صورة. بدون ع…“ | قرار | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ar.json` az.p.internet.t | Kündigung | „قارن الأسعار. يجوز أن يستمر العقد الجديد 24 شهراً كحد أقصى. بعدها يمكن…“ | إنهاء العقد | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ar.json` az.p.termine | Termin | „مواعيد مهمة في الشهر وكشوف الحساب…“ | الموعد | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ar.json` az.p.nebenkosten | Nebenkostenabrechnung | „افهم حساب التكاليف الجانبية…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/ar.json` az.p.ordner.t | Nebenkostenabrechnung | „ملف واحد يكفي في البداية، بأقسام: السكن، العمل أو التدريب، الدوائر، ال…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/ar.json` az.p.raten.t | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `ausziehen/ar.json` az.p.postLiegen.t | Frist | „افتح الرسائل فوراً، خاصة من الدوائر والمحاكم وشركات التحصيل. لكثير منه…“ | الموعد النهائي | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ar.json` az.p.grundsicherung.t | Kaution | „إذا كان مالك لا يكفي للمعيشة. تحت 25: الموافقة قبل الانتقال (§ 22 Abs.…“ | التأمين | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ar.json` fri.karte | Frist | „المواعيد النهائية…“ | الموعد النهائي | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ar.json` fri.karte.keine | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.h | Frist | „المواعيد النهائية…“ | الموعد النهائي | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ar.json` fri.wort.ungefaehr.t | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.wort.offen.t | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.eigen | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.erledigtListe.t | Frist | „المواعيد المنجزة تختفي بعد 30 يومًا.…“ | الموعد النهائي | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ar.json` fri.vorgangWeg | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.merken | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.merken.t | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.schonDa | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.art.wid.t | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.art.mit.t | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.art.mb.t | Vollstreckungsbescheid | „أسبوعان من التبليغ. بعدها يمكن للدائن طلب أمر تنفيذ. ما دام لا يوجد بع…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fristen/ar.json` fri.art.frist | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.art.eigen | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.start.bald | Frist | موعد/مواعيد | الموعد النهائي | abweichend (mehrdeutig: „موعد“ heißt auch Termin; amtlich „المهلة/الموعد النهائي“) |
| `fristen/ar.json` fri.set.label | Frist | „التذكير بالمواعيد عند الفتح…“ | الموعد النهائي | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ar.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch أو Klage ضد القرار ({stelle})…“ | الاعتراض | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/ar.json` fri.wid.wg | Widerspruch | nur deutsch: „إعانة السكن (Wohngeld): في بعض الولايات لا يوجد Widerspruch. عندها تكو…“ | الاعتراض | abweichend (nur deutsches Wort, keine Übersetzung) |

### fa (57 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `fa.json` s.ggeld.u2 | Nebenkostenabrechnung | nur deutsch: „قرارداد اجاره و صورت‌حساب هزینه‌های جانبی (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` s.gsa.u2 | Nebenkostenabrechnung | nur deutsch: „قرارداد اجاره و صورت‌حساب هزینه‌های جانبی (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` cb.bhSelbst | Unterhalt | „فرد دارای معلولیت به دلیل معلولیتش نمی‌تواند هزینه زندگی خود را تأمین …“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `fa.json` s.rundfunk.tip | Bescheid | nur deutsch: „درخواست را ظرف دو ماه پس از Bescheid بدهید. معافیت برای همسر یا شریک ز…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` t.kgBeh.ja | Unterhalt | „برای فرزند بزرگسال دارای معلولیت ممکن است Kindergeld بدون محدودیت سنی …“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `fa.json` t.kgBeh.pruefen | Unterhalt | „ممکن است، اگر معلولیت پیش از 25 سالگی ایجاد شده باشد و فرزند به همین د…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `fa.json` t.rundfunk.mehr | Bescheid | nur deutsch: „دلایل دیگر معافیت از جمله این‌هاست: BAföG، Berufsausbildungsbeihilfe ی…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` t.rundfunk.weitere | Bescheid | nur deutsch: „طبق اطلاعات شما، کمکی مطرح است که از Rundfunkbeitrag هم معاف می‌کند: H…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` ek.betrag | Bescheid | nur deutsch: „مبلغ ماهانه طبق Bescheid…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` ek.betrag.hint.alg | Bescheid | nur deutsch: „در Bescheid از Agentur für Arbeit آمده است. اگر مبلغ روزانه ذکر شده: ض…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` bh.gdb.hint | Bescheid | nur deutsch: „در Bescheid از Versorgungsamt یا ZBFS یا در Schwerbehindertenausweis آ…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` ek.betrag.hint.eg | Bescheid | nur deutsch: „در Bescheid از Elterngeldstelle آمده است. برای ElterngeldPlus مبلغ ماه…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` bh.gdb.antrag | Bescheid | nur deutsch: „درخواست شده، Bescheid هنوز نیامده…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` t.ausweis.laeuft | Bescheid | nur deutsch: „درخواست شما در جریان است. اگر Bescheid درست نباشد، می‌توانید ظرف یک ما…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` t.alg1.melden | Kündigung | nur deutsch: „مهم: دست‌کم 3 ماه پیش از پایان کار، خود را به‌عنوان جویای کار ثبت کنید…“ | فسخ قرارداد | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` es.tipp.grundrente | Bescheid | nur deutsch: „آیا 33 سال حق بیمه بازنشستگی دارید؟ سال‌های کار در کارگاه هم حساب می‌ش…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` t.kgBeh.hoch | Unterhalt | „درآمد خود فرد به‌طور واضح بالاتر از Grundfreibetrag ({gfb} در سال) و P…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `fa.json` t.mehr.erstausstattung | Erstausstattung | nur deutsch: „برای بارداری و تولد، علاوه بر آن پول برای لوازم اولیه (Erstausstattung…“ | تجهیزات اولیه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` aufenthalt.0 | Aufenthaltstitel | nur deutsch: „آلمانی یا Aufenthaltstitel…“ | اجازه اقامت | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` t.rundfunk.asyl | Bescheid | nur deutsch: „کسی که کمک‌ها طبق Asylbewerberleistungsgesetz را می‌گیرد، با درخواست ا…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` s.lpg.tip | Bescheid | nur deutsch: „Bescheid از Pflegekasse درباره Pflegegrad را پیوست کنید. یک درخواست کا…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` t.mu.ohne | Erstausstattung | nur deutsch: „بدون کار یا Arbeitslosengeld، Mutterschaftsgeld پرداخت نمی‌شود. اما با…“ | تجهیزات اولیه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` t.but.kita | Bescheid | nur deutsch: „مهدکودک (Kita) و مراقبت روزانه کودک (Tagespflege) رایگان است، اگر Grun…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` z.verfahren | Bescheid | nur deutsch: „پس از درخواست: در برابر یک Bescheid می‌توانید ظرف یک ماه اعتراض رسمی (…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` heiz.hint | Nebenkostenabrechnung | nur deutsch: „پیش‌پرداخت گرمایش، در قرارداد اجاره یا صورت‌حساب هزینه‌های جانبی (Nebe…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` fb.h | Bescheid | nur deutsch: „نتیجه با Bescheid شما جور نیست؟…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` fb.text | Bescheid | nur deutsch: „پس کمک کنید SoLo دقیق‌تر شود: این دکمه یک ایمیل به ارائه‌دهنده با نتیج…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` home.brief.t | Bescheid | nur deutsch: „بررسی Bescheid، صورت‌حساب یا نظر کارشناسی و نوشتن اعتراض رسمی (Widersp…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` briefe.vermieter.t | Nebenkostenabrechnung | nur deutsch: „صورت‌حساب هزینه‌های جانبی (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa.json` pf.konto.t | Freibetrag | „بانک پول را مسدود می‌کند. در حساب P مبلغی محافظت‌شده باقی می‌ماند.…“ | معافیت | abweichend (amtliches Wort fehlt, prüfen) |
| `fa.json` pf.kg.hint | P-Konto | „کمک‌هزینه فرزند (Kindergeld) در حساب P به‌طور جداگانه محافظت می‌شود.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa.json` pf.erg.konto | P-Konto | „در یک حساب P، {g} در ماه محافظت می‌شود.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa.json` gs.dringend.t | Mahnbescheid | „توقیف حساب، قطع، اخطاریه پرداخت، فسخ اجاره…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa.json` gs.d.mahn | Mahnbescheid | „اخطاریه پرداخت از دادگاه (Mahn­bescheid)…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa.json` sp.schulden.inkasso | Frist | „با آرامش بررسی کنید: آیا شرکتی را که وصول‌کننده از طرف آن می‌نویسد می‌…“ | مهلت | abweichend (amtliches Wort fehlt, prüfen) |
| `fa.json` sp.schulden.insolvenz | Befreiung | „با ورشکستگی شخصی (Privatinsolvenz) می‌توانید پس از یک روند در دادگاه ا…“ | معافیت | abweichend (amtliches Wort fehlt, prüfen) |
| `fa.json` sp.schulden.insolvenz.kurz | Befreiung | „بدهی زیاد: ورشکستگی شخصی معمولاً بعد از 3 سال آزاد می‌کند.…“ | معافیت | abweichend (amtliches Wort fehlt, prüfen) |
| `schritte/fa.json` sf.h.heiz | Nebenkostenabrechnung | „در قرارداد اجاره یا صورت‌حساب هزینه‌های جانبی نوشته شده است. با آن Woh…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `zusatz/fa.json` bp.nk.h | Nebenkostenabrechnung | nur deutsch: „بررسی صورت‌حساب هزینه‌های جانبی (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/fa.json` sl.frist.mahnbescheid | Frist | nur deutsch: „حکم پرداخت در {d} ابلاغ شد. اگر طلب درست نیست یا فقط بخشی از آن درست ا…“ | مهلت | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/fa.json` sl.warum.miete | Termin | „با بدهی اجاره، صاحب‌خانه می‌تواند بدون مهلت فسخ کند: اگر در 2 موعد پشت…“ | وقت ملاقات | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fa.json` sl.hilfe.1 | P-Konto | „جستجو بر اساس کد پستی: meine-schulden.de ← „Hilfe finden“ (انجمن فدرال…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/fa.json` ip.1 | Inkasso | „شرکت از طرف چه کسی می‌نویسد: نام و نشانی شرکت…“ | وصول مطالبات | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fa.json` ip.6 | Inkasso | „اگر شرکت نشانی شما را از طلبکار نگرفته: یادداشتی درباره آن…“ | وصول مطالبات | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fa.json` ip.w1 | Inkasso | „با امضای اقرار به بدهی، معمولاً بعداً نمی‌توانید اعتراض کنید که بدهی و…“ | وصول مطالبات | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fa.json` ip.w2 | Inkasso | „پیش از توافق قسطی یا تعویق، شرکت باید کتبی بگوید چه هزینه‌هایی دارد (§…“ | وصول مطالبات | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/fa.json` hb.tipp.miete | Nebenkostenabrechnung | „بررسی کن آیا می‌توانی کمک‌هزینه مسکن (Wohngeld) بگیری. صورت‌حساب هزینه…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/fa.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB)؛ meine-schulden.de…“ | مشاوره بدهی | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/fa.json` hb.hw.verm.d.ggeld | Bewilligungszeitraum | „در Grundsicherungsgeld پس‌انداز بیش از مبلغ معاف حساب می‌شود. از 1.7.2…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/fa.json` hb.hw.verm.d.gsa | Unterhalt | „در کمک اجتماعی (Sozialhilfe، مثلاً Grundsicherung im Alter) برای هر بز…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/fa.json` hb.hw.verm.d.kiz | Antrag | „در Kinderzuschlag برای متقاضی {a} و برای هر نفر بعدی {b} معاف می‌ماند …“ | درخواست | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/fa.json` az.p.strom.t | Bescheid | „یک قرارداد برق ببندید. روز ورود عدد کنتور را بنویسید و عکس بگیرید. بدو…“ | تصمیم | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/fa.json` az.p.internet.t | Frist | „قیمت‌ها را مقایسه کنید. قرارداد جدید حداکثر 24 ماه طول می‌کشد. بعد از …“ | مهلت | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/fa.json` az.p.nebenkosten | Nebenkostenabrechnung | „صورت‌حساب هزینه‌های جانبی را بفهمید…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/fa.json` az.p.ordner.t | Nebenkostenabrechnung | „برای شروع یک کلاسور با بخش‌ها کافی است: خانه، کار یا آموزش، ادارات، بی…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fristen/fa.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch یا Klage علیه تصمیم ({stelle})…“ | تجدید نظر | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/fa.json` fri.wid.wg | Widerspruch | nur deutsch: „کمک‌هزینه مسکن (Wohngeld): در بعضی ایالت‌ها Widerspruch وجود ندارد. آن…“ | تجدید نظر | abweichend (nur deutsches Wort, keine Übersetzung) |

### fa-AF (74 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `fa-AF.json` eb.hinweis | Bescheid | nur deutsch: „یک رهنمایی غیرالزامی بر اساس معلومات شما و قواعد ساده‌شده (وضعیت: {sta…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` s.ggeld.u2 | Nebenkostenabrechnung | nur deutsch: „قرارداد کرایه و حساب مصارف جانبی (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` s.gsa.u2 | Nebenkostenabrechnung | nur deutsch: „قرارداد کرایه و حساب مصارف جانبی (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` cb.bhSelbst | Unterhalt | „شخص دارای معلولیت به دلیل معلولیت نمی‌تواند مصارف زندگی خود را تأمین ک…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` s.rundfunk.tip | Bescheid | nur deutsch: „درخواست را در مدت دو ماه بعد از Bescheid بدهید. معافیت برای همسر یا شر…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.kgBeh.ja | Unterhalt | „برای فرزند بالغ دارای معلولیت ممکن است Kindergeld بدون حد سنی داده شود…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` t.kgBeh.pruefen | Unterhalt | „ممکن است، اگر معلولیت پیش از روز تولد 25 سالگی به وجود آمده باشد و فرز…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` t.rundfunk.mehr | Bescheid | nur deutsch: „دلایل دیگر معافیت از جمله این‌ها است: BAföG، Berufsausbildungsbeihilfe…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.rundfunk.weitere | Bescheid | nur deutsch: „طبق معلومات شما، کمکی مطرح است که از Rundfunkbeitrag هم معاف می‌کند: H…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.uvg.melden | Rückforderung | „تغییرات را فوراً اطلاع بدهید، مثلاً عروسی، یکجا شدن یا پرداخت نفقه. در…“ | بازپرداخت | abweichend (amtliches Wort fehlt, prüfen) |
| `fa-AF.json` ek.betrag | Bescheid | nur deutsch: „مبلغ ماهانه طبق Bescheid…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` ek.betrag.hint.alg | Bescheid | nur deutsch: „در Bescheid از Agentur für Arbeit نوشته است. اگر مبلغ روزانه ذکر شده: …“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` bh.gdb.hint | Bescheid | nur deutsch: „در Bescheid از Versorgungsamt یا ZBFS یا در Schwerbehindertenausweis ن…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` ek.betrag.hint.eg | Bescheid | nur deutsch: „در Bescheid از Elterngeldstelle نوشته است. برای ElterngeldPlus مبلغ ما…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` bh.gdb.antrag | Bescheid | nur deutsch: „درخواست شده، Bescheid هنوز نیامده…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.ausweis.laeuft | Bescheid | nur deutsch: „درخواست شما در جریان است. اگر Bescheid درست نباشد، می‌توانید در مدت یک…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` u.kuendigung | Kündigung | nur deutsch: „نامه برکناری از کار (Kündigung) یا قرارداد کار با تاریخ ختم…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.alg1.melden | Kündigung | nur deutsch: „مهم: حداقل 3 ماه پیش از ختم کار خود را به حیث کارجو ثبت کنید، در غیر آ…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.gsa.heim | Regelbedarf | nur deutsch: „در خوابگاه یا خانه رهایشی (Wohnheim)، Grundsicherung مبلغ معیاری (Rege…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` es.tipp.grundrente | Bescheid | nur deutsch: „آیا 33 سال حق بیمه تقاعد دارید؟ سال‌های کار در کارگاه هم حساب می‌شوند.…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.kgBeh.hoch | Unterhalt | „عاید خود شخص به‌طور واضح بالاتر از Grundfreibetrag ({gfb} در سال) و Pa…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` t.mehr.teilhabe | Regelbedarf | nur deutsch: „در این مبلغ یک نیاز اضافی (Mehrbedarf) به اندازه {betrag} شامل است: 35…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.mehr.schwanger | Regelbedarf | „در این مبلغ یک نیاز اضافی (Mehrbedarf) برای بارداری به اندازه {betrag}…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` t.mehr.erstausstattung | Erstausstattung | nur deutsch: „برای بارداری و تولد، علاوه بر آن پول برای لوازم اولیه (Erstausstattung…“ | تجهیزات اولیه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.ausweis.kuendigung | Kündigung | nur deutsch: „اشخاص دارای معلولیت شدید حفاظت خاص در برابر برکناری از کار (Kündigungs…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` aufenthalt.0 | Aufenthaltstitel | nur deutsch: „تابعیت آلمان یا Aufenthaltstitel…“ | اجازه اقامت | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.rundfunk.asyl | Bescheid | nur deutsch: „کسی که کمک‌ها طبق Asylbewerberleistungsgesetz می‌گیرد، با درخواست از R…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` s.lpg.tip | Bescheid | nur deutsch: „Bescheid از Pflegekasse درباره Pflegegrad را ضمیمه کنید. یک درخواست کا…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.mu.ohne | Erstausstattung | nur deutsch: „بدون کار یا Arbeitslosengeld، Mutterschaftsgeld داده نمی‌شود. ولی با G…“ | تجهیزات اولیه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` t.but.kita | Bescheid | nur deutsch: „کودکستان (Kita) و نگهداری روزانه طفل (Tagespflege) رایگان است، اگر Gru…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` z.verfahren | Bescheid | nur deutsch: „بعد از درخواست: در برابر یک Bescheid می‌توانید در مدت یک ماه اعتراض رس…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` heiz.hint | Nebenkostenabrechnung | nur deutsch: „پیش‌پرداخت برای گرمی، در قرارداد کرایه یا در حساب مصارف جانبی (Nebenko…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` fb.h | Bescheid | nur deutsch: „نتیجه با Bescheid شما مطابقت ندارد؟…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` fb.text | Bescheid | nur deutsch: „پس کمک کنید که SoLo دقیق‌تر شود: این دکمه یک ایمیل به ارائه‌کننده با ن…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` home.brief.t | Bescheid | nur deutsch: „بررسی Bescheid، صورت‌حساب یا نظر کارشناسی و نوشتن اعتراض رسمی (Widersp…“ | تصمیم | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` briefe.familienkasse.t | Bescheid | „فقط فیصله دربارهٔ Kinderzuschlag، نه Kindergeld…“ | تصمیم | abweichend (amtliches Wort fehlt, prüfen) |
| `fa-AF.json` briefe.vermieter.t | Nebenkostenabrechnung | nur deutsch: „حساب مصارف جانبی (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` el.ks.tun.beratung | Mieterverein | „انجمن مستأجران، یک مرکز مشاوره اجتماعی (مثلاً Caritas، Diakonie، AWO) …“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` el.ks.d.mpb | Mieterverein | „اگر اجاره بالاتر از ترمز اجاره باشد، اداره از شما می‌خواهد که کتباً به…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` ww.a.t | Regelbedarf | nur deutsch: „همه نیاز را پوشش می‌دهد: مبلغ معیاری (Regelbedarf)، کرایه و گرمی، و عل…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fa-AF.json` ww.a.t | Termin | „همه نیاز را پوشش می‌دهد: مبلغ معیاری (Regelbedarf)، کرایه و گرمی، و عل…“ | وقت ملاقات | abweichend (amtliches Wort fehlt, prüfen) |
| `fa-AF.json` pf.konto.t | Freibetrag | „بانک پول را مسدود می‌کند. در حساب P مبلغی محافظت‌شده باقی می‌ماند.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` pf.kg.hint | P-Konto | „کمک‌هزینه فرزند (Kindergeld) در حساب P به‌طور جداگانه محافظت می‌شود.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` pf.erg.konto | P-Konto | „در یک حساب P، {g} در ماه محافظت می‌شود.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` gs.dringend.t | Mahnbescheid | „توقیف حساب، قطع، اخطاریه پرداخت، فسخ اجاره…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` gs.d.mahn | Mahnbescheid | „اخطاریه پرداخت از دادگاه (Mahn­bescheid)…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fa-AF.json` sp.schulden.inkasso | Frist | „با آرامش بررسی کنید: آیا شرکتی را که وصول‌کننده از طرف آن می‌نویسد می‌…“ | مهلت | abweichend (amtliches Wort fehlt, prüfen) |
| `fa-AF.json` sp.schulden.insolvenz | Befreiung | „با ورشکستگی شخصی (Privatinsolvenz) می‌توانید پس از یک روند در دادگاه ا…“ | معافیت | abweichend (amtliches Wort fehlt, prüfen) |
| `fa-AF.json` sp.schulden.insolvenz.kurz | Befreiung | „بدهی زیاد: ورشکستگی شخصی معمولاً بعد از 3 سال آزاد می‌کند.…“ | معافیت | abweichend (amtliches Wort fehlt, prüfen) |
| `schritte/fa-AF.json` sf.h.heiz | Nebenkostenabrechnung | „در قرارداد کرایه یا صورت‌حساب هزینه‌های جانبی نوشته شده است. با آن Woh…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `zusatz/fa-AF.json` ww.a.t0 | Termin | „تمام نیاز را پوشش می‌دهد: نیاز اساسی، کرایه و گرمایش، به‌علاوهٔ بیمهٔ …“ | وقت ملاقات | abweichend (amtliches Wort fehlt, prüfen) |
| `zusatz/fa-AF.json` bp.nk.h | Nebenkostenabrechnung | nur deutsch: „بررسی صورت‌حساب مصارف جانبی (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/fa-AF.json` sl.frist.mahnbescheid | Frist | nur deutsch: „حکم پرداخت در {d} ابلاغ شد. اگر طلب درست نیست یا فقط بخشی از آن درست ا…“ | مهلت | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/fa-AF.json` sl.frist.mahnbescheid | Mahnbescheid | „حکم پرداخت در {d} ابلاغ شد. اگر طلب درست نیست یا فقط بخشی از آن درست ا…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/fa-AF.json` sl.warum.miete | Termin | „با بدهی اجاره، صاحب‌خانه می‌تواند بدون مهلت فسخ کند: اگر در 2 موعد پشت…“ | وقت ملاقات | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/fa-AF.json` sl.hilfe.1 | P-Konto | „جستجو بر اساس کد پستی: meine-schulden.de ← „Hilfe finden“ (انجمن فدرال…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/fa-AF.json` ip.1 | Inkasso | „شرکت از طرف چه کسی می‌نویسد: نام و نشانی شرکت…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/fa-AF.json` ip.6 | Inkasso | „اگر شرکت نشانی شما را از طلبکار نگرفته: یادداشتی درباره آن…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/fa-AF.json` ip.erg.fehlt | Inkasso | „این‌ها را علامت نزده‌اید. بعضی موارد فقط وقتی باید در نامه باشند که به…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/fa-AF.json` ip.w1 | Inkasso | „با امضای اقرار به بدهی، معمولاً بعداً نمی‌توانید اعتراض کنید که بدهی و…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/fa-AF.json` ip.w2 | Inkasso | „پیش از توافق قسطی یا تعویق، شرکت باید کتبی بگوید چه هزینه‌هایی دارد (§…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/fa-AF.json` hb.tipp.miete | Nebenkostenabrechnung | „بررسی کن آیا می‌توانی کمک‌هزینه مسکن (Wohngeld) بگیری. صورت‌حساب هزینه…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/fa-AF.json` hb.tipp.miete | Mieterverein | „بررسی کن آیا می‌توانی کمک‌هزینه مسکن (Wohngeld) بگیری. صورت‌حساب هزینه…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/fa-AF.json` hb.quelle.kinder | Bildung und Teilhabe | „بسته تعلیم و اشتراک در زندگی اجتماعی برای اطفال (§ 28 SGB II، § 34 SGB…“ | آموزش و مشارکت | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/fa-AF.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB)؛ meine-schulden.de…“ | مشاوره بدهی | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/fa-AF.json` hb.hw.verm.d.ggeld | Bewilligungszeitraum | „در Grundsicherungsgeld پس‌انداز بیش از مبلغ معاف حساب می‌شود. از 1.7.2…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/fa-AF.json` hb.hw.verm.d.gsa | Unterhalt | „در کمک اجتماعی (Sozialhilfe، مثلاً Grundsicherung im Alter) برای هر بز…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/fa-AF.json` hb.hw.verm.d.kiz | Antrag | „در Kinderzuschlag برای متقاضی {a} و برای هر نفر بعدی {b} معاف می‌ماند …“ | درخواست | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/fa-AF.json` az.p.strom.t | Bescheid | „یک قرارداد برق ببندید. روز ورود عدد کنتور را بنویسید و عکس بگیرید. بدو…“ | تصمیم | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/fa-AF.json` az.p.internet.t | Frist | „قیمت‌ها را مقایسه کنید. قرارداد جدید حداکثر 24 ماه طول می‌کشد. بعد از …“ | مهلت | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/fa-AF.json` az.p.nebenkosten | Nebenkostenabrechnung | „صورت‌حساب هزینه‌های جانبی را بفهمید…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/fa-AF.json` az.p.ordner.t | Nebenkostenabrechnung | „برای شروع یک کلاسور با بخش‌ها کافی است: خانه، کار یا آموزش، ادارات، بی…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fristen/fa-AF.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch یا Klage علیه تصمیم ({stelle})…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/fa-AF.json` fri.wid.wg | Widerspruch | nur deutsch: „کمک کرایه خانه (Wohngeld): در بعضی ایالت‌ها Widerspruch وجود ندارد. آن…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |

### ps (71 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `ps.json` s.but.u1 | Bescheid | nur deutsch: „د Wohngeld، Kinderzuschlag یا Grundsicherung په اړه Bescheid…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` sc.f.gesundheit | Bescheid | nur deutsch: „د معلولیت، Pflegegrad یا د کار د وړتیا د کمښت (Erwerbsminderung) په اړ…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` cb.bhSelbst | Unterhalt | „معلول کس د معلولیت له امله نه شي کولای خپل ژوند پخپله تأمین کړي (هېڅ ی…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` u.bescheide | Bescheid | nur deutsch: „د نورو مرستو په اړه Bescheide، د بېلګې په توګه Pflegegeld…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` u.pflegebescheid | Bescheid | nur deutsch: „د Pflegegrad په اړه Bescheid…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` s.rundfunk.wo | Bescheid | nur deutsch: „د ARD، ZDF او Deutschlandradio په Beitragsservice کې، له فورمې او ستاس…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.kgBeh.ja | Unterhalt | „د معلولیت لرونکي بالغ ماشوم لپاره ښايي Kindergeld پرته له عمر حد څخه و…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` t.kgBeh.pruefen | Unterhalt | „ممکن دی، که معلولیت د 25. کلیزې دمخه پیدا شوی وي او ماشوم له دې امله ن…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` t.rundfunk.mehr | Bescheid | nur deutsch: „د معافیت نور دلایل د نورو په منځ کې دا دي: BAföG، Berufsausbildungsbei…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.wbs.abzug | Unterhalt | „حساب ساده شوی دی. له عاید څخه د حالت له مخې ټاکلي مبلغونه (Pauschalen)…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` t.rundfunk.weitere | Bescheid | nur deutsch: „ستاسو د معلوماتو له مخې یوه مرسته ممکنه ده چې له Rundfunkbeitrag څخه ه…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.uvg.melden | Unterhalt | „بدلونونه سمدستي خبر کړئ، د بېلګې په توګه واده، یوځای اوسېدل یا د نفقې …“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` t.uvg.frist | Unterhalt | nur deutsch: „ژر غوښتنه وکړئ: د تېر وخت لپاره Unterhaltsvorschuss تر ټولو ډېر د غوښت…“ | نفقه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` ek.betrag | Bescheid | nur deutsch: „د Bescheid له مخې میاشتنی مبلغ…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` kindEink.hint | Unterhalt | „د بېلګې په توګه د مسلکي زده کړې معاش (Ausbildungsvergütung) یا Minijob…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` bh.gdb.antrag | Bescheid | nur deutsch: „غوښتل شوی، Bescheid لا نه دی راغلی…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.pausch.laeuft | Bescheid | nur deutsch: „کله چې Bescheid راشي، له GdB 20 څخه په مالیې اظهارنامه (Steuererklärun…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` u.kuendigung | Kündigung | nur deutsch: „د دندې د پای لیک (Kündigung) یا د کار تړون د پای نېټې سره…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.alg1.melden | Kündigung | „مهم: تر ټولو ناوخته د پای څخه 3 میاشتې دمخه د کار لټونکي په توګه ځان ث…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ps.json` es.n.ausweis | Ausweis | nur deutsch: „Schwerbehinderten-Ausweis…“ | د هویت کارت | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.kgBeh.hoch | Unterhalt | „خپل عاید د بنسټیز معاف مبلغ (Grundfreibetrag، په کال کې {gfb}) او Paus…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` t.mehr.erstausstattung | Erstausstattung | nur deutsch: „د امیندوارۍ او زېږون لپاره سربېره پر دې د لومړنیو توکو (Erstausstattun…“ | لومړني تجهیزات | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.ausweis.kuendigung | Kündigung | nur deutsch: „سخت معلول کسان د دندې د ختمولو په وړاندې ځانګړې ساتنه لري: د دندې له خ…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` aufenthalt.0 | Aufenthaltstitel | nur deutsch: „الماني تابعیت یا Aufenthaltstitel…“ | د استوګنې اجازه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.eg.asyl | Aufenthaltstitel | nur deutsch: „د پناه غوښتنې په پروسه کې یا د Duldung سره Elterngeld معمولاً نه ورکول…“ | د استوګنې اجازه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.kindergeld.asyl | Aufenthaltstitel | nur deutsch: „د پناه غوښتنې په پروسه کې یا د Duldung سره Kindergeld معمولاً نه ورکول…“ | د استوګنې اجازه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.mu.ohne | Erstausstattung | nur deutsch: „پرته له کار یا Arbeitslosengeld څخه Mutterschaftsgeld نشته. خو په Grun…“ | لومړني تجهیزات | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` t.but.kita | Bescheid | nur deutsch: „Kita او Tagespflege (د ماشوم ورځنۍ پالنه) وړیا دي، که تاسو Grundsicher…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` fb.h | Bescheid | nur deutsch: „ایا یوه پایله ستاسو له Bescheid سره سمون نه خوري؟…“ | خبرتیا | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` home.brief.t | Gutachten | nur deutsch: „Bescheid، حساب یا Gutachten وګورئ او Widerspruch (اعتراض) ولیکئ.…“ | ارزونه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` briefe.pflegekasse.t | Gutachten | nur deutsch: „Pflegegrad، Gutachten، Höherstufung (لوړې درجې ته لېږد)…“ | ارزونه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` sc.f.aufenthalt | Aufenthaltstitel | nur deutsch: „تابعیت او د اقامې حالت. دا په پاسپورټ یا Aufenthaltstitel کې لیکل شوي.…“ | د استوګنې اجازه | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ps.json` el.ks.d.mpb | Mieterverein | „که کرایه د کرایې له بریک لوړه وي، اداره له تاسو غواړي چې کور خاوند ته …“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ps.json` nh.basis | Krankenkasse | „لکه د مالیې اداره حساب شوی (رسمي پروګرام)، د مالیې ټولګی {k}، د روغتیا…“ | روغتیا بیمه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` pf.konto.t | P-Konto | „بانک پیسې بندوي. په P-حساب کې یو خوندي مقدار پاتې کېږي.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ps.json` pf.konto.t | Freibetrag | „بانک پیسې بندوي. په P-حساب کې یو خوندي مقدار پاتې کېږي.…“ | معافیت | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` pf.kg.hint | P-Konto | „د ماشوم پیسې (Kindergeld) په P-حساب کې اضافي خوندي دي.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ps.json` pf.erg.konto | P-Konto | „په P-حساب کې {g} په میاشت کې خوندي دي.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ps.json` pf.tipp.umwandeln | P-Konto | „لا P-حساب نه لرئ؟ خپل جاري حساب په P-حساب واړوئ. بانک باید تر ډېره د غ…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ps.json` pf.tipp.unterhaltspflichten.kurz | Unterhalt | „د معاش پاڼه وګورئ: ټول د نفقې مکلفیتونه حساب شوي؟…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` pf.tipp.kontomehr | Freibetrag | „که مقدار بس نه وي (لکه د لوړ کرایې یا ناروغۍ له امله)، د اجرا محکمه کو…“ | معافیت | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` pf.tipp.unterhalt | Unterhalt | „که ضبط د نفقې د پورونو له امله وي، ټیټ معاف حدونه پلي کېږي (§ 850d ZPO…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` pf.tipp.unterhalt.kurz | Unterhalt | „د نفقې پورونو لپاره دا حساب نه پلي کېږي.…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` pf.tipp.kg | Unterhalt | „د ماشوم پیسې (Kindergeld) یوازې د هماغه ماشوم د نفقې لپاره ضبط کېدای ش…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` pf.tipp.mehr | Freibetrag | „که پیسې بیا هم د ژوند لپاره بس نه وي، کولی شئ د اجرا له محکمې لوړ خوند…“ | معافیت | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` gs.d.miete.frist.kurz | Räumung | „د وتلو دعوې له سپارلو وروسته تر 2 میاشتو پورې ورکړئ.…“ | ایستل | abweichend (amtliches Wort fehlt, prüfen) |
| `ps.json` sp.schulden.insolvenz.kurz | Befreiung | „ډېر پورونه: شخصي افلاس معمولاً له 3 کلونو وروسته آزادوي.…“ | معافیت | abweichend (amtliches Wort fehlt, prüfen) |
| `schritte/ps.json` sf.h.kindEink | Unterhalt | „د بېلګې په توګه د مسلکي زده کړې معاش یا Minijob، یوځای. پرته له Kinder…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `zusatz/ps.json` bp.nk.h | Nebenkostenabrechnung | nur deutsch: „د اړخیزو لګښتونو حساب (Nebenkostenabrechnung) وګوره…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/ps.json` sl.frist.mahnbescheid | Frist | nur deutsch: „د تادیې امر په {d} وسپارل شو. که غوښتنه سمه نه وي یا یوازې یوه برخه یې…“ | موده | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/ps.json` sl.frist.mahnbescheid | Vollstreckungsbescheid | „د تادیې امر په {d} وسپارل شو. که غوښتنه سمه نه وي یا یوازې یوه برخه یې…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ps.json` sl.frist.vollstreckungsbescheid | Vollstreckungsbescheid | „د اجرا امر په {d} وسپارل شو. اعتراض (Einspruch) یوازې تر {frist} پورې …“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ps.json` sl.warum.miete | Räumung | „د کرایې پور سره کور څښتن کولی شي پرته له مودې فسخ وکړي: که په 2 پرله پ…“ | ایستل | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ps.json` sl.hilfe.1 | P-Konto | „د پوستي کوډ له مخې لټون: meine-schulden.de ← „Hilfe finden“ (د پور مشو…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ps.json` sl.u.6 | Unterhalt | „فسخونه، د قطع ګواښونه، د نفقې اسناد، د اداري جریمو پرېکړې، د جزایي نغد…“ | نفقه | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ps.json` kc.q4 | Stromsperre | „ایا تاسو ته د برېښنا یا ګاز د پرې کولو ګواښ شوی؟…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ps.json` ip.1 | Inkasso | „شرکت د چا لپاره لیکي: د شرکت نوم او پته…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ps.json` ip.6 | Inkasso | „که شرکت ستاسو پته له پور ورکوونکي نه وي اخیستې: پدې اړه یادونه…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ps.json` ip.w1 | Inkasso | „که د پور اقرار لاسلیک کړئ، وروسته معمولاً نشئ ویلی چې پور نشته، ورکړل …“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ps.json` ip.w2 | Inkasso | „د قسطونو یا ځنډ له تړون مخکې شرکت باید په لیکلي ډول ووایي چې کوم لګښتو…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/ps.json` hb.tipp.miete | Nebenkostenabrechnung | „وګورئ چې ایا د کور مرسته (Wohngeld) اخیستلای شئ. د اړخیزو لګښتونو حساب…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/ps.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB)؛ meine-schulden.de…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/ps.json` hb.hw.mb.schwanger.d | Erstausstattung | „اضافي اړتیا د اساسي اړتیا {p} % ده او د زیږون د میاشتې تر پایه پورې اع…“ | لومړني تجهیزات | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ps.json` hb.hw.verm.d.kiz | Antrag | „په Kinderzuschlag کې د غوښتونکي لپاره {a} او د هر بل کس لپاره {b} معاف…“ | غوښتنه | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ps.json` az.p.strom.t | Abschlag | „د برېښنا تړون وکړئ. د ننوتو په ورځ د میټر شمېره ولیکئ او انځور یې واخل…“ | مخکې تادیه | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ps.json` az.p.internet.t | Frist | „بیې پرتله کړئ. نوی تړون تر ټولو زیات 24 میاشتې دوام کولی شي. وروسته هر…“ | موده | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ps.json` az.p.nebenkosten | Nebenkostenabrechnung | „د اړخیزو لګښتونو حساب وپېژنئ…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/ps.json` az.p.ordner.t | Nebenkostenabrechnung | „د پیل لپاره یو فولډر له برخو سره بس دی: کور، کار یا زده کړه، ادارې، بی…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fristen/ps.json` fri.set.label | Frist | „د خلاصېدو پر مهال د مودو یادونه…“ | موده | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ps.json` fri.art.wid.wg | Widerspruch | nur deutsch: „د پرېکړې پر ضد Widerspruch یا Klage ({stelle})…“ | عرض | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/ps.json` fri.wid.wg | Widerspruch | nur deutsch: „د کور د کرایې مرسته (Wohngeld): په ځینو ایالتونو کې Widerspruch نشته. …“ | عرض | abweichend (nur deutsches Wort, keine Übersetzung) |

### ru (34 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `ru.json` s.pausch.wo | Einkommen | „В налоговой декларации в Finanzamt. Отдельное заявление не нужно.…“ | доход | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` t.kgBeh.pruefen | Mehrbedarf | „Возможно, если инвалидность возникла до 25-летия и из-за неё ребёнок н…“ | дополнительные потребности | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` t.rundfunk.mehr | Bescheid | „Другие основания для освобождения: BAföG, Berufsausbildungsbeihilfe ил…“ | уведомление | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` t.but.azubi | Bildung und Teilhabe | „Образовательный пакет положен детям до 18 лет и молодым людям до 25 ле…“ | образование и участие | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` t.kgBeh.hoch | Unterhalt | „Собственный доход явно выше необлагаемого минимума ({gfb} в год) и фик…“ | алименты | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` t.mu.ohne | Erstausstattung | „Без работы или Arbeitslosengeld Mutterschaftsgeld нет. Но при Grundsic…“ | первоначальное оснащение | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` heiz.hint | Nebenkostenabrechnung | „Платёж за отопление указан в договоре аренды или в расчёте коммунальны…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ru.json` el.ks.tun.beratung | Mieterverein | „Союз арендаторов, социальная консультация (например Caritas, Diakonie,…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ru.json` el.ks.d.mpb | Mieterverein | „Если аренда выше ограничения арендной платы, ведомство просит вас пись…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ru.json` pf.konto.t | P-Konto | „Банк блокирует деньги. На P-счёте остаётся необлагаемая сумма.…“ | P-счет | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` pf.kg.hint | P-Konto | „Детское пособие (Kindergeld) дополнительно защищено на P-счёте.…“ | P-счет | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` pf.erg.konto | P-Konto | „На P-счёте защищено {g} в месяц.…“ | P-счет | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` pf.tipp.umwandeln | P-Konto | „Ещё нет P-счёта? Попросите преобразовать текущий счёт в P-счёт. Банк о…“ | P-счет | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` sp.schulden.insolvenz | Pfändung | „С помощью личного банкротства (Privatinsolvenz) вы можете после судебн…“ | арест | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` sp.vertraege.6 | Kündigung | „Проверьте дорогие договоры (мобильная связь, спортзал, журналы). После…“ | расторжение | abweichend (amtliches Wort fehlt, prüfen) |
| `ru.json` sp.vertraege.6.kurz | Frist | „Проверьте дорогие договоры: часто можно расторгнуть за 1 месяц.…“ | срок | abweichend (amtliches Wort fehlt, prüfen) |
| `schritte/ru.json` sf.h.heiz | Nebenkostenabrechnung | „Указано в договоре аренды или расчёте коммунальных расходов. Так Wohng…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `zusatz/ru.json` bp.nk.h | Nebenkostenabrechnung | nur deutsch: „Проверить расчёт коммунальных расходов (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/ru.json` sl.frist.mahnbescheid | Frist | nur deutsch: „Приказ о взыскании вручён {d}. Если требование неверно или верно лишь …“ | срок | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/ru.json` sl.frist.mahnbescheid | Mahnbescheid | „Приказ о взыскании вручён {d}. Если требование неверно или верно лишь …“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ru.json` sl.frist.vollstreckungsbescheid.vorbei | Bescheid | „По расчёту приложения срок для протеста с вручения {d} истёк. Немедлен…“ | уведомление | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ru.json` sl.warum.rest | Schuldnerberatung | „Банки, коллекторы, почтовые магазины и операторы связи не могут отнять…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ru.json` sl.hilfe.1 | P-Konto | „Поиск по почтовому индексу: meine-schulden.de → «Hilfe finden» (Федера…“ | P-счет | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ru.json` ip.erg.fehlt | Inkasso | „Это вы не отметили. Некоторые пункты должны быть в письме, только если…“ | взыскание долгов | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ru.json` hb.tipp.miete | Mieterverein | „Проверь, можешь ли ты получить жилищное пособие (Wohngeld). Дай провер…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/ru.json` hb.tipp.handy | Kündigung | „После минимального срока договоры на мобильную связь и интернет можно …“ | расторжение | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ru.json` hb.tipp.sonst | Kündigung | „Пересмотри подписки и членства, например стриминг, фитнес-клуб или жур…“ | расторжение | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ru.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB); meine-schulden.de…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/ru.json` hb.hw.mb.dauer.d | Regelbedarf | „Примеры из практики: поездки к ребёнку для общения, средства ухода и г…“ | стандартная потребность | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ru.json` az.p.strom.t | Bescheid | „Заключи договор на электричество. В день въезда запиши показания счётч…“ | уведомление | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ru.json` az.p.internet.t | Kündigung | „Сравни цены. Новый договор может длиться не больше 24 месяцев. После э…“ | расторжение | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ru.json` fri.art.vb.t | Rechtsberatung | „Две недели с момента вручения. Этот срок не продлевается (Notfrist). Н…“ | юридическая консультация | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ru.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch или Klage на решение ({stelle})…“ | протест | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/ru.json` fri.wid.wg | Widerspruch | nur deutsch: „Жилищное пособие (Wohngeld): в некоторых федеральных землях Widerspruc…“ | протест | abweichend (nur deutsches Wort, keine Übersetzung) |

### uk (26 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `uk.json` u.steuererklaerung | Einkommen | „Декларація про прибутковий податок…“ | дохід | abweichend (amtliches Wort fehlt, prüfen) |
| `uk.json` s.pausch.wo | Einkommen | „У податковій декларації у Finanzamt. Окрема заява не потрібна.…“ | дохід | abweichend (amtliches Wort fehlt, prüfen) |
| `uk.json` t.kgBeh.pruefen | Mehrbedarf | „Можливо, якщо інвалідність виникла до 25-річчя і через неї дитина не м…“ | додаткові потреби | abweichend (amtliches Wort fehlt, prüfen) |
| `uk.json` t.rundfunk.mehr | Bescheid | „Інші підстави для звільнення: BAföG, Berufsausbildungsbeihilfe або Aus…“ | рішення | abweichend (amtliches Wort fehlt, prüfen) |
| `uk.json` t.mu.ohne | Erstausstattung | „Без роботи або Arbeitslosengeld Mutterschaftsgeld немає. Але при Grund…“ | первинне облаштування | abweichend (amtliches Wort fehlt, prüfen) |
| `uk.json` heiz.hint | Nebenkostenabrechnung | „Платіж за опалення вказаний у договорі оренди або в розрахунку комунал…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `uk.json` el.ks.tun.umzug | Zusicherung | „Підписуйте новий договір оренди лише після того, як відомство заздалег…“ | гарантія | abweichend (amtliches Wort fehlt, prüfen) |
| `uk.json` sp.schulden.insolvenz | Pfändung | „Завдяки особистому банкрутству (Privatinsolvenz) ви можете після судов…“ | стягнення | abweichend (amtliches Wort fehlt, prüfen) |
| `uk.json` sp.vertraege.6.kurz | Frist | „Перевірте дорогі договори: часто можна розірвати за 1 місяць.…“ | термін | abweichend (amtliches Wort fehlt, prüfen) |
| `schritte/uk.json` sf.h.heiz | Nebenkostenabrechnung | „Зазначено в договорі оренди або розрахунку комунальних витрат. Так Woh…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `zusatz/uk.json` bp.nk.h | Nebenkostenabrechnung | nur deutsch: „Перевірити розрахунок комунальних витрат (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/uk.json` sl.frist.mahnbescheid | Frist | nur deutsch: „Наказ про сплату вручено {d}. Якщо вимога неправильна або правильна ли…“ | термін | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/uk.json` sl.frist.vollstreckungsbescheid.vorbei | Bescheid | „За розрахунком застосунку строк для скарги від вручення {d} минув. Нег…“ | рішення | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/uk.json` sl.warum.rest | Schuldnerberatung | „Банки, колектори, поштові магазини та оператори зв’язку не можуть віді…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/uk.json` ip.erg.fehlt | Inkasso | „Це ви не позначили. Деякі пункти мають бути в листі, лише якщо вони ва…“ | стягнення боргів | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/uk.json` hb.tipp.sonst | Kündigung | „Переглянь підписки та членства, наприклад стримінг, спортзал чи журнал…“ | розірвання | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/uk.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB); meine-schulden.de…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/uk.json` hb.hw.mb.dauer.d | Regelbedarf | „Приклади з практики: поїздки до дитини для спілкування, засоби догляду…“ | стандартні потреби | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/uk.json` az.p.strom.t | Bescheid | „Уклади договір на електрику. У день в'їзду запиши показники лічильника…“ | рішення | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/uk.json` az.p.internet.t | Frist | „Порівняй ціни. Новий договір може тривати не більше 24 місяців. Після …“ | термін | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/uk.json` az.p.nebenkosten | Nebenkostenabrechnung | „Розуміти розрахунок додаткових витрат…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/uk.json` az.p.ordner.t | Nebenkostenabrechnung | „Для початку вистачить однієї папки з розділами: житло, робота або навч…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fristen/uk.json` fri.art.anh | Anhörung | „Відповісти на запит пояснень ({stelle})…“ | слухання | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/uk.json` fri.art.vb.t | Rechtsberatung | „Два тижні від вручення. Цей строк не продовжується (Notfrist). Негайно…“ | юридична консультація | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/uk.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch або Klage на рішення ({stelle})…“ | заперечення | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/uk.json` fri.wid.wg | Widerspruch | nur deutsch: „Житлова допомога (Wohngeld): у деяких федеральних землях Widerspruch н…“ | заперечення | abweichend (nur deutsches Wort, keine Übersetzung) |

### pl (31 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `pl.json` s.ggeld.u2 | Nebenkostenabrechnung | „Umowa najmu i rozliczenie opłat dodatkowych…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `pl.json` s.gsa.u2 | Nebenkostenabrechnung | „Umowa najmu i rozliczenie opłat dodatkowych…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `pl.json` u.arzt | Schwerbehindertenausweis | „Zaświadczenia lekarskie, opinie lub karta osoby ze znacznym stopniem n…“ | legitymacja osoby niepełnosprawnej | abweichend (amtliches Wort fehlt, prüfen) |
| `pl.json` s.pausch.wo | Einkommen | „W zeznaniu podatkowym w Finanzamt. Osobny wniosek nie jest potrzebny.…“ | dochód | abweichend (amtliches Wort fehlt, prüfen) |
| `pl.json` s.ausweis.tip | Ausweis | „Karta jest dobrowolna, ale otwiera dostęp do wielu ulg.…“ | dowód osobisty | abweichend (amtliches Wort fehlt, prüfen) |
| `pl.json` t.ausweis.schwer | Schwerbehindertenausweis | „Od stopnia niepełnosprawności 50 osoba uznawana jest za osobę ze znacz…“ | legitymacja osoby niepełnosprawnej | abweichend (amtliches Wort fehlt, prüfen) |
| `pl.json` t.ausweis.niedrig | Schwerbehindertenausweis | „Przy GdB poniżej 30 nie ma karty ani zrównania. Ryczałt podatkowy dla …“ | legitymacja osoby niepełnosprawnej | abweichend (amtliches Wort fehlt, prüfen) |
| `pl.json` t.ausweis.laeuft | Widerspruch | odwołanie | sprzeciw | abweichend (odwołanie = Rechtsmittel/Berufung; amtlich „sprzeciw“) |
| `pl.json` s.alg1.wo | Ausweis | „Zgłoszenie jako poszukujący pracy: online, telefonicznie lub osobiście…“ | dowód osobisty | abweichend (amtliches Wort fehlt, prüfen) |
| `pl.json` t.alg1.melden | Kündigung | „Ważne: zgłoś się jako poszukujący pracy najpóźniej 3 miesiące przed ko…“ | wypowiedzenie | abweichend (amtliches Wort fehlt, prüfen) |
| `pl.json` t.alg1.sperrzeit | Kündigung | „Kto sam wypowie umowę lub podpisze porozumienie o rozwiązaniu bez ważn…“ | wypowiedzenie | abweichend (amtliches Wort fehlt, prüfen) |
| `pl.json` sp.schulden.insolvenz.kurz | Befreiung | „Za dużo długów: upadłość konsumencka zwykle uwalnia po 3 latach.…“ | zwolnienie | abweichend (amtliches Wort fehlt, prüfen) |
| `zusatz/pl.json` bp.wid.fehlt | Widerspruch | odwołanie | sprzeciw | abweichend (odwołanie = Rechtsmittel/Berufung; amtlich „sprzeciw“) |
| `zusatz/pl.json` bp.wid.keinGrund | Widerspruch | odwołanie | sprzeciw | abweichend (odwołanie = Rechtsmittel/Berufung; amtlich „sprzeciw“) |
| `zusatz/pl.json` bp.wid.bis | Widerspruch | odwołanie | sprzeciw | abweichend (odwołanie = Rechtsmittel/Berufung; amtlich „sprzeciw“) |
| `zusatz/pl.json` bp.wid.bis.t | Widerspruch | odwołanie | sprzeciw | abweichend (odwołanie = Rechtsmittel/Berufung; amtlich „sprzeciw“) |
| `zusatz/pl.json` bp.art.anh.t | Widerspruch | odwołanie | sprzeciw | abweichend (odwołanie = Rechtsmittel/Berufung; amtlich „sprzeciw“) |
| `zusatz/pl.json` bp.datum.t | Widerspruch | odwołanie | sprzeciw | abweichend (odwołanie = Rechtsmittel/Berufung; amtlich „sprzeciw“) |
| `schulden/pl.json` sl.frist.mahnbescheid | Frist | nur deutsch: „Nakaz zapłaty doręczony {d}. Jeśli roszczenie jest błędne lub słuszne …“ | termin | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/pl.json` sl.frist.vollstreckungsbescheid.vorbei | Bescheid | „Według obliczeń aplikacji termin na zarzut od doręczenia {d} minął. Id…“ | decyzja | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/pl.json` sl.warum.rest | Schuldnerberatung | „Banki, firmy windykacyjne, sprzedaż wysyłkowa i firmy telefoniczne nie…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/pl.json` sl.hilfe.3 | Schuldnerberatung | „Otrzymujesz pomoc społeczną lub zabezpieczenie na starość (Grundsicher…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/pl.json` ip.6 | Inkasso | „Jeśli firma nie ma twojego adresu od wierzyciela: informacja o tym…“ | windykacja | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/pl.json` ip.w1 | Inkasso | „Po podpisaniu uznania długu zwykle nie możesz już później podnieść, że…“ | windykacja | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/pl.json` ip.w2 | Inkasso | „Przed umową o raty lub odroczenie firma musi pisemnie poinformować cię…“ | windykacja | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/pl.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB); meine-schulden.de…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/pl.json` hb.hw.mb.dauer.d | Regelbedarf | „Przykłady z praktyki: dojazdy do dziecka w ramach kontaktów, środki pi…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/pl.json` az.p.strom.t | Bescheid | „Zawrzyj umowę na prąd. W dniu wprowadzenia zapisz stan licznika i zrób…“ | decyzja | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/pl.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch lub Klage od decyzji ({stelle})…“ | sprzeciw | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/pl.json` fri.wid.offen | Widerspruch | odwołanie | sprzeciw | abweichend (odwołanie = Rechtsmittel/Berufung; amtlich „sprzeciw“) |
| `fristen/pl.json` fri.wid.wg | Widerspruch | nur deutsch: „Dodatek mieszkaniowy (Wohngeld): w niektórych krajach związkowych nie …“ | sprzeciw | abweichend (nur deutsches Wort, keine Übersetzung) |

### ro (58 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `ro.json` s.ggeld.u2 | Nebenkostenabrechnung | „Contract de închiriere și decontul cheltuielilor…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` s.gsa.u2 | Nebenkostenabrechnung | „Contract de închiriere și decontul cheltuielilor…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` u.arzt | Schwerbehindertenausweis | „Rapoarte medicale, expertize sau cardul de persoană cu dizabilitate gr…“ | certificat de handicap | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` s.pausch.wo | Einkommen | „În declarația de impozit la Finanzamt. Nu este nevoie de o cerere sepa…“ | venit | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` t.ausweis.schwer | Schwerbehindertenausweis | „De la un grad de dizabilitate de 50 persoana este considerată cu dizab…“ | certificat de handicap | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` t.ausweis.niedrig | Schwerbehindertenausweis | „Cu un GdB sub 30 nu există card și nici echivalare. Deducerea fiscală …“ | certificat de handicap | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` t.bab.ja | Freibetrag | „Posibil. Suma depinde de venitul tău și de venitul părinților sau al p…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` t.uvg.teil | Unterhalt | nur deutsch: „Pensia pe care copiii o primesc deja ({u} pe lună) se scade. Unterhalt…“ | întreținere | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ro.json` t.uvg.melden | Rückforderung | „Anunțați imediat schimbările, de exemplu căsătoria, mutarea împreună s…“ | recuperare | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` s.krankengeld.tip | Krankenkasse | „Fii atent la scrisorile casei de asigurări: dacă îți cere să soliciți …“ | casa de asigurări de sănătate | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` t.alg1.melden | Kündigung | „Important: înregistrează-te cu cel puțin 3 luni înainte de final, altf…“ | reziliere | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` es.n.pausch | Freibetrag | „Scutire de impozit…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` es.r.pausch | Freibetrag | „Dacă plătești impozit, cu scutirea plătești mai puțin.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` es.tipp.pauschEltern | Freibetrag | „Părinții tăi pot folosi scutirea ta de impozit. Atunci plătesc mai puț…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` es.tipp.pauschElternH | Freibetrag | „Părinții tăi pot folosi scutirea ta de impozit: 7.400 € pe an cu H, Bl…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` es.tipp.pflegePausch | Freibetrag | „Părinții te îngrijesc? Atunci primesc o scutire pentru îngrijire la im…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` t.alg1.sperrzeit | Kündigung | „Cine demisionează sau semnează un acord de încetare fără un motiv impo…“ | reziliere | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` t.wbs.landUeber | Freibetrag | „În landul {land}, limita de venit pentru gospodăria ta este de aproxim…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` t.mu.ohne | Mehrbedarf | „Fără muncă sau Arbeitslosengeld nu există Mutterschaftsgeld. La Grunds…“ | nevoi suplimentare | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` heiz.hint | Nebenkostenabrechnung | „Avansul pentru încălzire, trecut în contractul de închiriere sau în de…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` briefe.vermieter.t | Nebenkostenabrechnung | „Decontul cheltuielilor de întreținere…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` ww.a.t | Termin | „Acoperă tot necesarul: nivelul de bază, chiria și încălzirea, plus asi…“ | programare | abweichend (amtliches Wort fehlt, prüfen) |
| `ro.json` pf.konto.t | P-Konto | „Banca blochează banii. Pe un cont P rămâne o sumă protejată.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` pf.kg.hint | P-Konto | „Alocația pentru copii (Kindergeld) este protejată suplimentar pe contu…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` pf.erg.konto | P-Konto | „Pe un cont P sunt protejați {g} pe lună.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` pf.tipp.umwandeln | P-Konto | „Nu ai încă un cont P? Cere transformarea contului curent într-un cont …“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ro.json` gs.d.mahn.schritt | Widerspruch | nur deutsch: „Verifică pretenția. Dacă nu este corectă sau este corectă doar în part…“ | obiecție | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ro.json` wgmax.d.kdu | Kosten der Unterkunft | „Nu confunda: la Grundsicherungsgeld (fost Bürgergeld) și la Sozialhilf…“ | costuri de cazare | abweichend (amtliches Wort fehlt, prüfen) |
| `schritte/ro.json` sf.h.heiz | Nebenkostenabrechnung | „Este în contractul de închiriere sau în decontul cheltuielilor. Astfel…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schritte/ro.json` sf.h.grundrente33 | Freibetrag | „Din muncă (și în atelier), creșterea copiilor sau îngrijire. Important…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `zusatz/ro.json` ww.a.t0 | Termin | „Acoperă tot necesarul: nevoia standard, chiria și încălzirea, plus asi…“ | programare | abweichend (amtliches Wort fehlt, prüfen) |
| `zusatz/ro.json` bp.nk.h | Nebenkostenabrechnung | nur deutsch: „Verifică decontul costurilor suplimentare (Nebenkostenabrechnung)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/ro.json` sl.frist.mahnbescheid | Frist | nur deutsch: „Somație de plată comunicată la {d}. Dacă creanța nu este corectă sau d…“ | termen | abweichend (nur deutsches Wort, keine Übersetzung) |
| `schulden/ro.json` sl.frist.vollstreckungsbescheid.vorbei | Bescheid | „După calculul aplicației, termenul de contestație de la comunicarea di…“ | decizia | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ro.json` sl.warum.rest | Schuldnerberatung | „Băncile, firmele de recuperare, comenzile prin poștă și firmele de tel…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ro.json` sl.hilfe.1 | P-Konto | „Căutare după cod poștal: meine-schulden.de → „Hilfe finden” (Asociația…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ro.json` sl.hilfe.3 | Schuldnerberatung | „Primești asistență socială sau ajutor la bătrânețe (Grundsicherung im …“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/ro.json` ip.1 | Inkasso | „Pentru cine scrie firma: numele și adresa companiei…“ | recuperare creanțe | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ro.json` ip.6 | Inkasso | „Dacă firma nu are adresa ta de la creditor: o mențiune despre asta…“ | recuperare creanțe | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ro.json` ip.w1 | Inkasso | „Cu o recunoaștere de datorie, de obicei nu mai poți obiecta mai târziu…“ | recuperare creanțe | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/ro.json` ip.w2 | Inkasso | „Înainte de un acord de rate sau de amânare, firma trebuie să-ți spună …“ | recuperare creanțe | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/ro.json` hb.tipp.miete | Nebenkostenabrechnung | „Verifică dacă poți primi ajutor pentru locuință (Wohngeld). Dă la veri…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/ro.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB); meine-schulden.de…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/ro.json` hb.hw.verm.d.gsa | Unterhalt | „La asistența socială (Sozialhilfe, de ex. Grundsicherung im Alter) răm…“ | întreținere | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ro.json` az.notiz.t | Termin | „De exemplu programări, nume sau întrebări…“ | programare | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ro.json` az.p.erstausstattung.t | Erstausstattung | nur deutsch: „Primești Grundsicherungsgeld de la Jobcenter? Atunci poți primi bani s…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `ausziehen/ro.json` az.p.melden.t | Termin | „Înregistrează-te la biroul cetățenilor (Bürgeramt, Meldebehörde) în 2 …“ | programare | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ro.json` az.p.strom.t | Bescheid | „Încheie un contract de curent. În ziua mutării notează indexul contoru…“ | decizia | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ro.json` az.p.rundfunk | Rundfunkbeitrag | „Înregistrează-te pentru taxa audiovizuală – sau cere scutire…“ | taxa de radiodifuziune | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ro.json` az.p.termine | Termin | „Date importante în lună și extrase de cont…“ | programare | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ro.json` az.p.nebenkosten | Nebenkostenabrechnung | „Înțelege decontul costurilor suplimentare…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/ro.json` az.p.ordner.t | Nebenkostenabrechnung | „Un biblioraft ajunge la început, cu secțiuni: locuință, muncă sau form…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/ro.json` az.p.rfBefreiung | Rundfunkbeitrag | „Scutire de taxa audiovizuală…“ | taxa de radiodifuziune | abweichend (amtliches Wort fehlt, prüfen) |
| `ausziehen/ro.json` az.p.kv.t | Krankenkasse | „Până la 25 de ani poți fi asigurat gratuit prin părinți (Familienversi…“ | casa de asigurări de sănătate | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ro.json` fri.art.mb.t | Widerspruch | „Două săptămâni de la comunicare. După aceea creditorul poate cere un t…“ | obiecție | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/ro.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch sau Klage împotriva deciziei ({stelle})…“ | obiecție | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/ro.json` fri.wid.offen | Widerspruch | nur deutsch: „Calea de atac are alt nume în funcție de instituție: de obicei Widersp…“ | obiecție | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/ro.json` fri.wid.wg | Widerspruch | nur deutsch: „Ajutor pentru locuință (Wohngeld): în unele landuri nu există Widerspr…“ | obiecție | abweichend (nur deutsches Wort, keine Übersetzung) |

### so (105 Stellen)

| Schlüssel | Begriff | App-Wort / Auszug | amtliches Wort | Bewertung |
|---|---|---|---|---|
| `so.json` foot.1 | Bescheid | nur deutsch: „Muhiim: Hubintani waxay bixisaa qiimayn hordhac ah, ma aha talo sharci…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` foot.1 | Erste Einschätzung | „Muhiim: Hubintani waxay bixisaa qiimayn hordhac ah, ma aha talo sharci…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` t.wohngeld.vielleicht | Freibetrag | nur deutsch: „Waxaad ku dhow tahay xadka. Wohngeldstelle ayaa si sax ah u xisaabisa …“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.bedarfRand | Freibetrag | nur deutsch: „Sida sharcigu sheegayo, qoyskaagu wuxuu u baahan yahay qiyaastii {beda…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.bafoeg.kindJa | Freibetrag | nur deutsch: „Dakhliga waalidiintu wuxuu ka hooseeyaa Freibetrag (qadarka aan la xis…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.bafoeg.kindRand | Freibetrag | nur deutsch: „Dakhligu wuxuu ka sarreeyaa Freibetrag oo qiyaastii ah {fb} bishii. Ma…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.bafoeg.kindNein | Freibetrag | nur deutsch: „Dakhligu si cad ayuu uga sarreeyaa Freibetrag oo qiyaastii ah {fb} bis…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` s.ggeld.u2 | Nebenkostenabrechnung | nur deutsch: „Heshiiska kirada iyo xisaabta kharashyada dheeriga ah (Nebenkostenabre…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` s.but.u1 | Bescheid | nur deutsch: „Bescheid ee Wohngeld, Kinderzuschlag ama Grundsicherung…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` s.gsa.u2 | Nebenkostenabrechnung | nur deutsch: „Heshiiska kirada iyo Nebenkostenabrechnung…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` u.pflegebescheid | Bescheid | nur deutsch: „Bescheid ee Pflegegrad…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` s.pausch.wo | Einkommen | nur deutsch: „Einkommensteuererklärung ee Finanzamt. Codsi gaar ah looma baahna.…“ | dakhli | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` s.rundfunk.wo | Bescheid | nur deutsch: „Beitragsservice von ARD, ZDF und Deutschlandradio, adigoo isticmaalaya…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.wbs.abzug | Freibetrag | nur deutsch: „Xisaabtu waa la fududeeyay. Dakhliga waxaa laga jaraa, iyadoo ku xidha…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.bab.ja | Freibetrag | nur deutsch: „Waa suurtagal. Qadarku wuxuu ku xidhan yahay dakhligaaga iyo dakhliga …“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.uvg.melden | Rückforderung | „Isbeddellada isla markiiba sheeg, tusaale ahaan guur, wada degid ama b…“ | dib u celin | abweichend (amtliches Wort fehlt, prüfen) |
| `so.json` ek.betrag | Bescheid | nur deutsch: „Qadarka bishii sida ku qoran Bescheid-ka…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` ek.betrag.hint.alg | Bescheid | nur deutsch: „Wuxuu ku qoran yahay Bescheid-ka Agentur für Arbeit. Haddii halkaas la…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` bh.gdb.hint | Bescheid | nur deutsch: „Wuxuu ku qoran yahay Bescheid-ka Versorgungsamt ama ZBFS ama Schwerbeh…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` ek.betrag.hint.eg | Bescheid | nur deutsch: „Wuxuu ku qoran yahay Bescheid-ka Elterngeldstelle. ElterngeldPlus, gel…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` bh.gdb.antrag | Bescheid | nur deutsch: „La codsaday, Bescheid weli ma iman…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.alg1.melden | Kündigung | „Muhiim: isu diiwaangeli shaqo-raadin ugu dambayn 3 bilood ka hor dhamm…“ | ogeysiis joojin | abweichend (amtliches Wort fehlt, prüfen) |
| `so.json` es.q.ausweis | Ausweis | nur deutsch: „Ma haysataa Schwerbehinderten-Ausweis?…“ | aqoonsi | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` es.n.ausweis | Ausweis | nur deutsch: „Schwerbehinderten-Ausweis…“ | aqoonsi | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` es.n.pausch | Freibetrag | nur deutsch: „Steuer-Freibetrag (dhimista canshuurta)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` es.r.pausch | Freibetrag | nur deutsch: „Haddii aad canshuur bixiso, Freibetrag-ka darteed wax ka yar ayaad bix…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` es.tipp.pauschEltern | Freibetrag | nur deutsch: „Waalidkaa waxay naftooda u isticmaali karaan Steuer-Freibetrag-gaaga. …“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` es.tipp.pauschElternH | Freibetrag | nur deutsch: „Waalidkaa waxay naftooda u isticmaali karaan Steuer-Freibetrag-gaaga. …“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` es.tipp.pflegePausch | Freibetrag | nur deutsch: „Waalidkaa ma ku daryeelaan? Markaas canshuurta waxaa laga siinayaa Pfl…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` cb.wfbmEssen | Mehrbedarf | nur deutsch: „Wuxuu ku qadeeyaa Werkstatt-ka (taas waxaa loo bixiyaa Mehrbedarf)…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` es.tipp.grundrente | Bescheid | nur deutsch: „Ma leedahay 33 sano oo khidmad Rente ah? Sannadaha Werkstatt-ka sidoo …“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.mehr.teilhabe | Regelbedarf | nur deutsch: „Waxaa ku jira Mehrbedarf (baahi dheeri ah) oo ah {betrag}: 35 % Regels…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.ggeld.mehrBeh | Mehrbedarf | nur deutsch: „Ilmo naafo ah oo 15 jir ah ama ka weyn, waxaa lagu dari karaa Mehrbeda…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.mehr.schwanger | Regelbedarf | nur deutsch: „Waxaa ku jira Mehrbedarf uurka ah oo ah {betrag} (17 % Regelsatz-ka la…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.mehr.schwanger | Mehrbedarf | nur deutsch: „Waxaa ku jira Mehrbedarf uurka ah oo ah {betrag} (17 % Regelsatz-ka la…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.mehr.warmwasser | Mehrbedarf | nur deutsch: „Waxaa ku jira Mehrbedarf biyaha kulul ee Boiler-ka ah oo ah {betrag}.…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.mehr.ernaehrung | Mehrbedarf | nur deutsch: „Cunto qaali ah oo cudur darteed loo baahan yahay waxaa loo bixiyaa Meh…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` aufenthalt.0 | Aufenthaltstitel | nur deutsch: „Jarmal ama Aufenthaltstitel…“ | sharciga deganaanshaha | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.eg.asyl | Aufenthaltstitel | nur deutsch: „Asylverfahren ama Duldung, Elterngeld inta badan lama helo. Waxyaabo k…“ | sharciga deganaanshaha | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.kindergeld.asyl | Aufenthaltstitel | nur deutsch: „Asylverfahren ama Duldung, Kindergeld inta badan lama helo. Waxyaabo k…“ | sharciga deganaanshaha | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.rundfunk.asyl | Bescheid | nur deutsch: „Qofka hela gargaarka Asylbewerberleistungsgesetz, codsi kadib waa laga…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.wbs.landUeber | Freibetrag | nur deutsch: „{land}, xadka dakhliga ee qoyskaagu waa qiyaastii {grenze} sannadkii (…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` s.lpg.tip | Bescheid | nur deutsch: „Ku lifaaq Bescheid-ka Pflegekasse ee Pflegegrad. Hal codsi ayaa ku fil…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.mu.ohne | Erstausstattung | nur deutsch: „Shaqo ama Arbeitslosengeld la'aan, Mutterschaftsgeld lama helo. Laakii…“ | qalabka bilowga | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.mu.ohne | Mehrbedarf | nur deutsch: „Shaqo ama Arbeitslosengeld la'aan, Mutterschaftsgeld lama helo. Laakii…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` z.verfahren | Widerspruch | nur deutsch: „Kadib codsiga: Bescheid waxaad ka gudbin kartaa Widerspruch hal bil gu…“ | diidmo | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` heiz.hint | Abschlag | nur deutsch: „Lacagta horay loo bixiyo ee kululaynta (Abschlag), waxay ku qoran taha…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` heiz.hint | Nebenkostenabrechnung | nur deutsch: „Lacagta horay loo bixiyo ee kululaynta (Abschlag), waxay ku qoran taha…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` t.kiz.ae7 | Mehrbedarf | nur deutsch: „Haddii ilmo uusan weli gaadhin 7 sano, Kinderzuschlag-ka waxaa lagu xi…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` home.brief.t | Bescheid | nur deutsch: „Hubi Bescheid, xisaab (Abrechnung) ama Gutachten, oo qor Widerspruch.…“ | go'aan | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` home.brief.t | Widerspruch | nur deutsch: „Hubi Bescheid, xisaab (Abrechnung) ama Gutachten, oo qor Widerspruch.…“ | diidmo | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` home.brief.t | Gutachten | nur deutsch: „Hubi Bescheid, xisaab (Abrechnung) ama Gutachten, oo qor Widerspruch.…“ | qiimeyn | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` briefe.pflegekasse.t | Gutachten | nur deutsch: „Pflegegrad, Gutachten, Höherstufung (kor u qaadis)…“ | qiimeyn | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` briefe.vermieter.t | Nebenkostenabrechnung | nur deutsch: „Nebenkostenabrechnung…“ | — | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` el.erkanntPk | Gutachten | nur deutsch: „Waa la aqoonsaday: {titel}. Qiimaynta qoraalka hoos ayay ku qoran yihi…“ | qiimeyn | abweichend (nur deutsches Wort, keine Übersetzung) |
| `so.json` el.ks.keinWs | Widerspruch | dacwad | diidmo | abweichend (fraglich: „dacwad“ bedeutet Klage/Prozess) |
| `so.json` el.ks.wsDoch | Widerspruch | dacwad | diidmo | abweichend (fraglich: „dacwad“ bedeutet Klage/Prozess) |
| `so.json` el.ks.tun.beratung | Mieterverein | „Urur kireystayaal, xarun talo-bixin bulsho (tusaale ahaan Caritas, Dia…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` el.ks.d.mpb | Mieterverein | „Haddii kiradu ka sarreyso xakamaynta kirada, xafiisku wuxuu kaa codsan…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` pf.konto.t | P-Konto | „Bangigu lacagta wuu xiraa. Koontada P waxaa ku haray lacag la ilaaliyo…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` pf.konto.t | Freibetrag | „Bangigu lacagta wuu xiraa. Koontada P waxaa ku haray lacag la ilaaliyo…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` pf.kg.hint | P-Konto | „Lacagta carruurta (Kindergeld) waxaa si dheeri ah loogu ilaaliyaa koon…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` pf.erg.konto | P-Konto | „Koontada P waxaa bishii lagu ilaaliyaa {g}.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` pf.tipp.kontomehr | Freibetrag | „Haddii lacagtu aysan ku filnayn (tusaale kiro sare ama jirro), maxkama…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` pf.tipp.unterhalt | Freibetrag | „Haddii qabashadu tahay deynta nafaqada, xadad hoose ayaa khuseeya (§ 8…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` pf.tipp.mehr | Freibetrag | „Haddii lacagtu weli aysan kugu filnayn noloshaada, waxaad maxkamadda f…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` sp.schulden.insolvenz | Pfändung | „Kicidda shakhsiga ah (Privatinsolvenz) waxaad ku heli kartaa in lagaa …“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` sp.schulden.insolvenz.kurz | Befreiung | „Deyn aad u badan: kicitaanka shakhsiga ah badanaa wuu ku xoreeyaa 3 sa…“ | ka dhaafid | abweichend (amtliches Wort fehlt, prüfen) |
| `so.json` sp.vertraege.1 | Rundfunkbeitrag | „Grundsicherungsgeld, Grundsicherung im Alter ama BAföG (adigoon la deg…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `so.json` sp.vertraege.6.kurz | Frist | „Hubi heshiisyada qaaliga ah: badanaa waa la joojin karaa 1 bil ka hor.…“ | muddo | abweichend (amtliches Wort fehlt, prüfen) |
| `so.json` rb.satz | Erste Einschätzung | „Qiimayn hore, ma aha talo sharci. Xafiiska ayaa go'aamiya, haddii mura…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schritte/so.json` sf.h.heiz | Nebenkostenabrechnung | „Waxay ku qoran tahay heshiiska kirada ama xisaabta kharashyada. Sidaas…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `zusatz/so.json` bp.art.anh | Anhörung | nur deutsch: „Dhagaysi (Anhörung – xafiisku wuu ku weydiinayaa ka hor go'aanka)…“ | dhageysi | abweichend (nur deutsches Wort, keine Übersetzung) |
| `zusatz/so.json` bp.art.anh.h | Anhörung | nur deutsch: „Dhagaysi (Anhörung) ka hor go'aan…“ | dhageysi | abweichend (nur deutsches Wort, keine Übersetzung) |
| `zusatz/so.json` bp.art.anh.t | Anhörung | „Dhagaysigu weli ma aha go'aan. Si kooban u sharax sidii ay ahayd oo ku…“ | dhageysi | abweichend (amtliches Wort fehlt, prüfen) |
| `zusatz/so.json` bp.pf.p | Gutachten | „Iskaan garee qiimaynta ama dooro PDF. SoLo ayaa dib u xisaabinaya dhib…“ | qiimeyn | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/so.json` sl.warum.behoerde | Widerspruch | „Jobcenter wuxuu lacagaha dib loo doonayo ka jari karaa Grundsicherungs…“ | diidmo | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/so.json` sl.warum.behoerde | Rückforderung | „Jobcenter wuxuu lacagaha dib loo doonayo ka jari karaa Grundsicherungs…“ | dib u celin | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/so.json` sl.hilfe.5 | Stromsperre | „Ma degdeg baa (guri-ka-saarid, go'idda korontada ama gaaska, xarig, ko…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/so.json` gs.planen.t | Abschlag | „Qorshaha miisaaniyadda, lacagta tamarta ee horay iyo talooyin keyd…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/so.json` pl.abschlag | Abschlag | „Hubi lacagta horay…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/so.json` ip.1 | Inkasso | „Cidda shirkaddu u qorayso: magaca iyo cinwaanka shirkadda…“ | ururinta deynta | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/so.json` ip.6 | Inkasso | „Haddii shirkaddu cinwaankaaga aysan ka helin deyn-bixiyaha: xusid arri…“ | ururinta deynta | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/so.json` ip.hinweis | Erste Einschätzung | „Qiimayn hordhac ah, ma aha talo sharci. Liisku wuxuu muujinayaa oo kel…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `schulden/so.json` ip.w1 | Inkasso | „Haddii aad saxiixdo qirashada deynta, inta badan hadhow ma odhan karti…“ | ururinta deynta | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/so.json` ip.w2 | Inkasso | „Ka hor heshiis qaybo ama dib-u-dhigis, shirkaddu waa inay qoraal kuugu…“ | ururinta deynta | abweichend (amtliches Wort fehlt, prüfen) |
| `schulden/so.json` sl.kopf.2 | Rückforderung | „Kadib: ganaaxyada maamulka iyo lacagaha xafiisyadu dib u rabaan…“ | dib u celin | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/so.json` hb.tipp.miete | Nebenkostenabrechnung | „Hubi haddii aad heli karto gargaarka guriga (Wohngeld). Ha la hubiyo x…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/so.json` hb.tipp.sonst | Kündigung | „Dib u eeg rukummadaada iyo xubinnimadaada, tusaale streaming, jimicsi …“ | ogeysiis joojin | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/so.json` hb.quelle.raten | Schuldnerberatung | nur deutsch: „BAG Schuldnerberatung (BAG-SB); meine-schulden.de…“ | la-talinta deynta | abweichend (nur deutsches Wort, keine Übersetzung) |
| `haushalt/so.json` hb.hw.schulden.d | Schuldnerberatung | „La-talinta deymaha ee aan faa'iido doonka ahayn badanaa waa bilaash. K…“ | la-talinta deynta | abweichend (amtliches Wort fehlt, prüfen) |
| `haushalt/so.json` hb.hw.verm.d.ggeld | Bewilligungszeitraum | „Grundsicherungsgeld kaydka ka badan qaddarka laga dhaafay ayaa la tiri…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/so.json` hb.en.abschlag | Abschlag | „Lacagta horay loo bixiyo bishii…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/so.json` hb.en.anzahl | Abschlag | „Sanadkii immisa jeer ayaad bixisaa lacagta horay loo bixiyo?…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/so.json` hb.en.kosten | Abschlag | „Kharashka sanadkii: qiyaastii {b} (lacagaha horay loo bixiyay: {a}).…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `haushalt/so.json` hb.en.passt | Abschlag | „Lacagtaada horay loo bixiyo qiyaas ahaan way ku habboon tahay.…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/so.json` az.p.rundfunk | Rundfunkbeitrag | „Iska diiwaangeli khidmadda warbaahinta – ama codso dhaafis…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/so.json` az.p.nebenkosten | Nebenkostenabrechnung | „Faham xisaabta kharashyada dheeraadka ah…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/so.json` az.p.ordner.t | Nebenkostenabrechnung | „Bilowga hal faylka oo qaybo leh ayaa ku filan: guriga, shaqada ama tab…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `ausziehen/so.json` az.p.rfBefreiung | Rundfunkbeitrag | „Ka dhaafis khidmadda warbaahinta…“ | — | nicht bewertbar (keine amtliche Übersetzung gefunden) |
| `fristen/so.json` fri.art.anh | Anhörung | „Ka jawaab dhegeysiga ({stelle})…“ | dhageysi | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/so.json` fri.art.vb.t | Schuldnerberatung | „Laba toddobaad laga bilaabo gaarsiinta. Waqtigan lama kordhiyo (Notfri…“ | la-talinta deynta | abweichend (amtliches Wort fehlt, prüfen) |
| `fristen/so.json` fri.art.wid.offen | Widerspruch | dacwad | diidmo | abweichend (fraglich: „dacwad“ bedeutet Klage/Prozess) |
| `fristen/so.json` fri.art.wid.wg | Widerspruch | nur deutsch: „Widerspruch ama Klage ka dhan ah go'aanka ({stelle})…“ | diidmo | abweichend (nur deutsches Wort, keine Übersetzung) |
| `fristen/so.json` fri.wid.wg | Widerspruch | dacwad | diidmo | abweichend (fraglich: „dacwad“ bedeutet Klage/Prozess) |

