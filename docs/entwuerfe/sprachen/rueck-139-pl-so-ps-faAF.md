# Rückübersetzungs-Prüfung PR #139: pl, so, ps, fa-AF (21.11.2026)

Unabhängige Prüfung der Änderungen aus `claude/b-sprachen-glossar` gegen `origin/main`.
Methode: jeden neuen Text ins Deutsche zurückgelesen und mit dem deutschen Text des gleichen Schlüssels verglichen (Sinn, Zusagen, Zahlen, Fristen, Platzhalter, deutsche Amtsbegriffe, Anrede).

## Umfang

| Sprache | Geänderte Texte | Davon gelesen | Fehler korrigiert | Freigabe |
|---|---|---|---|---|
| so | 39 | 39 (alle) | 0 | ja |
| ps | 27 | 27 (alle) | 0 | ja |
| fa-AF | 268 | 268 (alle) | 7 Texte | ja, nach Korrektur |
| pl | 865 | 594: alle 363 mit Zahl, Frist, Warnung oder Rechtsfolge, dazu 231 von 502 übrigen (46 %, Zufallsauswahl) | 18 Texte | ja, nach Korrektur |

Zusätzlich für alle 865 polnischen Texte per Skript: Platzhalter gleich, Zahlen gleich (2 Abweichungen sind nur das Tausender-Leerzeichen „7 400“, „1 800“), keine Du-Form mehr, keine Mischung mit „Pan/Pani“. Knopfnamen in Anführungszeichen („Zapisz“, „Zmień datę“, „Sprawdź pismo“, „Zachowaj rachunek“, „Dalej“, „Anuluj“) stimmen mit den echten Knöpfen überein.

Nicht gelesen: 271 polnische Texte ohne Zahl, Frist oder Warnung (kurze Beschriftungen und Hinweise).

## Prüfvermerk (21.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| fa-AF `dn.set.t`, `fri.feld.fest`, `sf.wahl.h`: Die Ersetzung „بدهی → قرض“ (Schulden) hat auch das Verb „بدهی“ (du gibst) getroffen. Ergebnis war sinnlos: „jemandem zeigen Schulden“, „den Tag ändern Schulden“, „wie antworten Schulden?“ | hoch | Verb wiederhergestellt („نشان بدهی“, „تغییر بدهی“, „جواب بدهی“) | de.json, gleicher Schlüssel |
| fa-AF `hb.f.brutto`: „Rentenbescheid“ nur als „حکم تقاعد“ (Urteil), deutscher Begriff fehlte | mittel | „تصمیم رسمی تقاعد (Rentenbescheid)“ | Glossar: Bescheid = تصمیم رسمی |
| fa-AF `pf.tipp.beratung`, `sp.vertraege.3`: „Landkreis“ als „بخش“ (Abteilung), an anderer Stelle „ولسوالی“ | niedrig | „ولسوالی (Landkreis)“ | de.json |
| fa-AF `sl.hilfe.3`: „soll übernehmen“ als „muss“ übersetzt (zu starke Zusage) | mittel | „معمولاً باید“ (in der Regel) | de.json; § 11 SGB XII („Angemessene Kosten … sollen übernommen werden“), gesetze-im-internet.de, abgerufen 21.11.2026 |
| pl `az.p.uebergabe.t`: Grammatikbruch „Zapiszcie … i zrobić“ (Ihr-Form neben Państwo-Form) | mittel | „Proszę razem zapisać … i zrobić zdjęcia.“ | de.json |
| pl `az.p.nebenkosten.t`, `sp.heizen.5`, `sp.heizen.5.kurz`: „złożyć dopłatę w Jobcenter“ heißt „die Nachzahlung beim Jobcenter einzahlen“ | mittel | „zgłosić dopłatę“ (melden, einreichen) | de.json |
| pl `el.ks.tun.gruende`: „du bekommst bald keine Leistung mehr“ als „brauchst bald keine Leistung mehr“ | mittel | „nie będą już Państwo pobierać świadczeń“ | de.json |
| pl `bp.w.bg`: „unverheiratete Kinder“ als „niezamężne“ (nur für Töchter) | mittel | „dzieci niepozostające w związku małżeńskim“ | de.json; § 7 Abs. 3 Nr. 4 SGB II |
| pl `es.q.rente`: „Rente“ nur als „renta“ (im Polnischen nicht die Altersrente) | mittel | „rentę lub emeryturę (Rente)“ | de.json |
| pl `hb.hw.mb.ae.d`: „allein“ als „sami“ (kann auch „als Paar allein“ heißen) | niedrig | „samotnie“ | de.json |
| pl `az.p.postLiegen.t`: „Na decyzję … miesiąc na sprzeciw“ schief, Bescheid ohne deutschen Begriff | niedrig | „Od decyzji urzędu (Bescheid) … w ciągu miesiąca wnieść sprzeciw (Widerspruch)“ | de.json |
| pl `bp.wid.fehlt`: falsches Pronomen („ono“ für „sprzeciw“) | niedrig | „sprzeciw zachowuje termin“ | Grammatik |
| pl `t.kdu.hoch`: „półtorej granicy“ (falsche Form) | niedrig | „półtorakrotność granicy“ | Grammatik |
| pl `tv.kuendigung`, `z.stichtag`, `vg.pin.erkl`, `es.r.kgBeh`, `az.p.haftpflicht.t`, `az.p.u25.t`, `wgmax.d.personen`: kleine Sprachfehler („bez terminu“, „w formie swobodnej“, Wortstellung, „za Państwa“, „robią naukę“, fehlendes Subjekt, „rozstanych“) | niedrig | sprachlich berichtigt, Sinn unverändert | de.json |
| so, ps: keine Abweichung. „eingetragener Lebenspartner“ beim Rundfunkbeitrag ist richtig (Befreiung gilt für Ehegatten und eingetragene Lebenspartner) | – | keine | § 4 Abs. 3 RBStV; Fundstelle recht.nrw.de, am 21.11.2026 nur als Treffer gefunden, Wortlaut nicht neu im Volltext gelesen |

## Offen (bewusst nicht geändert)

- pl: „Schuldnerberatung“ heißt mal „poradnia zadłużeniowa“, mal „poradnia dłużników“, mal „poradnia dłużnicze“. Alle verständlich, aber nicht einheitlich. Gleiches bei „Rundfunkbeitrag“ („opłata radiowo-telewizyjna“ und „opłata audiowizualna“) und „Regelbedarf“ („stawka podstawowa“ und „potrzeba podstawowa“).
- pl: Die Państwo-Form wirkt bei Fragen an eine einzelne Person ungewohnt („Są Państwo w ciąży?“). Grammatisch richtig und einheitlich; eine Muttersprachler-Prüfung vor dem Release bleibt sinnvoll.
- ps: nach „په … کې“ steht „رسمي پرېکړه“ in der Grundform; streng wäre die gebeugte Form „پرېکړې“. Beides ist üblich.
- fa-AF: einzelne iranische Wörter stehen weiter in den geprüften Texten (zum Beispiel „هنرستان“, „مهدکودک“, „دادگاه“ neben „محکمه“). Die Anrede ist weiter gemischt („شما“ und „تو“), wie im Bericht des Autors genannt.
- fa-AF `ms.pkonto.lead`: „از روز کاری 2“ ist verständlich, schöner wäre „از دومین روز کاری“.
- Die Rechtsaussagen der deutschen Originaltexte waren nicht Gegenstand dieser Prüfung; geprüft wurde nur die Übereinstimmung mit dem Deutschen.
