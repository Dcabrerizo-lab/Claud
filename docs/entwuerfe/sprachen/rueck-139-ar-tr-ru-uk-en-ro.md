# Rückübersetzungs-Prüfung PR #139: ar, tr, ru, uk, en, ro, fa (21.11.2026)

Unabhängige Prüfung (nicht vom Autor). Grundlage: `git diff origin/main...origin/claude/b-sprachen-glossar -- src/lang`.
Verfahren: jeden geänderten Text ins Deutsche zurückübersetzt und gegen `de.json` gelesen (Sinn, Zusagen, Beträge, Fristen, Platzhalter, deutsche Amtsbegriffe, Anrede).

## Umfang

| Sprache | geändert | zurückübersetzt | Anrede | Ergebnis |
|---|---|---|---|---|
| ar | 41 | 41 (100 %) | – | 1 Korrektur |
| en | 19 | 19 (100 %) | – | 1 Korrektur (Rest-Stelle außerhalb des Diffs) |
| ro | 1 | 1 (100 %) | – | ohne Befund |
| fa | 19 | 19 (100 %) | شما einheitlich in den geänderten Texten | ohne Befund |
| ru | 207 | 207 (100 %) | вы/ваш durchgehend, kein „ты“-Rest (Suche über alle ru-Dateien) | 4 Korrekturen |
| uk | 206 | 206 (100 %) | ви/ваш durchgehend, kein „ти“-Rest | 3 Korrekturen |
| tr | 701 | 420 (60 %): alle 234 Texte mit Zahl, §, Frist, Warnung, Rechtsfolge, Bescheid/Antrag/PIN vollständig; vom Rest (467) Zufallsstichprobe 186 (40 %) | siz-Form durchgehend, kein „sen“-Rest (Suche über alle tr-Dateien) | 20 Korrekturen in 17 Texten |

Nicht gelesen: 281 tr-Texte ohne Zahl/Frist/Rechtsfolge (kurze Fragen, Überschriften, Hinweise). In der Stichprobe derselben Gruppe kein Sinnfehler.

## Befunde und Korrekturen

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| ar `kb.d.fristen`: „مهلك“ ist ohne Vokalzeichen mehrdeutig (liest sich auch als „tödlich“ / „langsam“) | mittel | „المهل الخاصة بك“ | de: „Deine Fristen“ |
| en `t.uz.wg`: Bescheid noch „official notice“ (Glossar jetzt „decision“) | gering | „official decision (Bescheid)“ | de.json, Autorenbericht Zweifel 1 |
| ru/uk `az.p.kindergeld.t`: „можно получать / можна отримувати Kindergeld“ = Zusage statt „beantragen“ | mittel | „можно подать заявление на … / можна подати заяву на …“ | de: „kannst du Kindergeld für dich selbst beantragen“ (§ 1 Abs. 2 BKGG) |
| ru/uk `bp.art.anh.t`: Anhörung = „Слушание/Слухання“ (klingt nach Gerichtstermin), Amtsbegriff fehlte | gering | „Заслушивание (Anhörung)“ / „Заслуховування (Anhörung)“ | de.json |
| ru `bp.w.bg`: „неженатые дети“ meint nur Söhne | gering | „не состоящие в браке дети“ | § 7 Abs. 3 SGB II: „unverheiratete Kinder“ |
| ru/uk `bp.wg.p`: Wohngeldgesetz ohne deutschen Begriff | gering | „(Wohngeldgesetz)“ ergänzt | de.json |
| tr `vg.pin.ok`: „PIN kilidi açık“ liest sich als „PIN-Sperre ist offen/entsperrt“ | mittel | „PIN kilidi etkin.“ | de: „Die PIN-Sperre ist an.“ |
| tr `t.alg1.sperrzeit`: „ohne wichtigen Grund“ nur auf den Aufhebungsvertrag bezogen; Sperrzeit = „bekleme süresi“ ohne Amtsbegriff | mittel | Satz neu: gilt für Kündigung und Aufhebungsvertrag; „ceza süresi (Sperrzeit)“, „fesih sözleşmesi (Aufhebungsvertrag)“ | de.json |
| tr `f.formsBrief`: formloser Antrag = „resmî olmayan başvuru“ (= „nicht amtlicher Antrag“) | mittel | „formsuz başvuru (formloser Antrag)“ wie in `f.intro.mehr` | de.json |
| tr `hb.hw.verm.d.kiz`: „ilk ay kesilir“ (= erster Monat fällt weg) | mittel | „yalnızca ilk ayın ödemesi azaltılır“ | de: „wird nur der erste Monat gekürzt“ |
| tr `sl.warum.geldstrafe`, `gs.d.geld.frist`: Tagessatz = „günlük ceza“ unklar | mittel | „2 Tagessatz (günlük ceza birimi) için 1 gün hapis“ | de: „1 Tag Haft für 2 Tagessätze“ |
| tr `el.ks.d.karenz`, `el.ks.d.sa`: Karenzzeit = „bekleme süresi“ (Wartezeit, Gegenteil der Bedeutung) | mittel | „koruma süresi (Karenzzeit)“ | de.json |
| tr `t.land.blindengeld`: Gesetzesname und Blindengeld/Landesblindengeld ohne deutschen Begriff, Gesetz falsch benannt | gering | deutsche Begriffe eingesetzt | de.json |
| tr `fri.art.mb.t`, `sl.frist.vollstreckungsbescheid`, `sp.schulden.mahn`, `sl.warum.energie`, `bp.art.anh.t`: Amtsbegriffe fehlten (Vollstreckungsbescheid, Notfrist, Abwendungsvereinbarung, Anhörung) | gering | in Klammern ergänzt | de.json |
| tr `fri.rechnung.feiertag`: „asla geç bir gün“ statt „zu späten Tag“ | gering | „asla fazla geç bir gün göstermez“ | de.json |
| tr `sl.warum.behoerde`: Rückforderungen = „geri ödemeleri“ (Rückzahlungen) | gering | „geri istediği tutarları“ | de.json |
| tr `ra.ohnePlan`: „önerelim“ (Aufforderungsform) | gering | „öneririz“ | de.json |
| tr `vg.fehler.speicher`: gesperrt = „engelli“ | gering | „kilitli“ | de.json |
| tr `az.p.kindergeld.t`: „Sind deine Eltern gestorben“ = „Aileniz öldüyse“ (Familie) | gering | „Anne babanız öldüyse“ | de.json |

Beträge, Fristen, Paragrafen und Platzhalter: in allen gelesenen Texten wie im Deutschen; `test/test-sprachen-zahlen.js` nach den Korrekturen grün (33 060 Texte).

## Offen / Hinweise (nicht geändert)

- tr: Wohngeld teils „kira yardımı“, teils „konut yardımı“; Leistungs-Check teils „Yardım kontrolü“, teils deutsch. Immer mit deutschem Begriff, daher kein Fehler, aber uneinheitlich.
- tr: „Eltern“ wird meist mit „aileniz“ wiedergegeben (umgangssprachlich üblich); nur die Stelle mit Rechtsfolge wurde präzisiert.
- ru/uk `hb.hw.schulden`: „Raten“ als „кредиты“ wiedergegeben; Sinn bleibt verständlich.
- en: „decision“ für Bescheid ist verständlich; natürlicher wäre „decision letter“. Entscheidung des Autors (Zweifel 1) bleibt.
- Kein Muttersprachler hat gelesen; die Prüfung ist eine Rückübersetzung durch ein Sprachmodell.
- Lokal nicht lauffähig: `test/test-pflege-einfach.js` (Modul `jsdom` fehlt in dieser Umgebung, unabhängig von den Änderungen). Übrige 44 Regel-Tests und `build:web` grün.

## Freigabe

ar ja · en ja · ro ja · fa ja · ru ja · uk ja · tr ja (nach den Korrekturen; 40 % der unkritischen tr-Texte ungelesen).
