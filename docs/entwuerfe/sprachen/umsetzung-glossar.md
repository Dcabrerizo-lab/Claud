# Umsetzung Sprachen: Glossar, höfliche Anrede, Dari (21.11.2026)

Branch `claude/b-sprachen-glossar` (Basis `origin/main`), nur `src/lang/**` geändert.
Grundlage: `docs/entwuerfe/sprachen/glossar.json/.md`, `glossar-abgleich.md/.json`, Prüfberichte `pruefungen-21-11/rueck-*.md` (Branch `claude/b-entwuerfe`).

## Geänderte Texte je Sprache

| Sprache | Texte | Inhalt |
|---|---|---|
| tr | 701 | Sie-Form (siz) durchgehend; Rundfunk „kayıtlı yaşam ortağı (Lebenspartner)“ |
| pl | 865 | Höfliche Form wie im Familienkasse-Merkblatt (KG2-pl): „Państwo“ + „Proszę …“; Widerspruch = „sprzeciw“ (Einspruch bleibt „odwołanie“); Rundfunk „zarejestrowany partner (Lebenspartner)“ |
| ru | 207 | Вы-Form (klein „вы/ваш“, wie bisherige höfliche Texte); Rundfunk „зарегистрированный партнёр (Lebenspartner)“ |
| uk | 206 | Ви-Form (klein „ви/ваш“); Rundfunk „зареєстрований партнер (Lebenspartner)“ |
| fa-AF | 268 | Dari-Wortschatz in 249 Texten (مشاوره→مشوره, پرونده→دوسیه, اطلاعات→معلومات, بدهی→قرض, اجاره→کرایه, فهرست→لست, بازنشستگی→تقاعد, مدرسه→مکتب, کودک→طفل, گوشی/تلفن همراه→مبایل, مرخصی→رخصتی, پزشک→داکتر, دانشگاه→پوهنتون, شهرداری→شاروالی, پلیس→پولیس); „Bescheid“ übersetzt (19) |
| ar | 41 | „Frist“ einheitlich مهلة/المهل statt موعد (موعد bleibt für „Termin“) |
| so | 39 | „Bescheid“ übersetzt (go'aan … (Bescheid)), Mehrbedarf/Freibetrag mit Erklärung in Klammern, Rundfunk „lammaanaha nolosha ee diiwaangashan (eingetragener Lebenspartner)“ statt nur „Ehefrau/Lebenspartner“ |
| ps | 27 | „Bescheid“ übersetzt (رسمي پرېکړه (Bescheid), mit Kasusformen), Rundfunk „ثبت شوي ژوند ملګري (Lebenspartner)“ (2 Texte) |
| en | 19 | „Bescheid“ einheitlich „decision“ statt „notice“ (s. Zweifel 1) |
| fa | 19 | „Bescheid“ übersetzt: تصمیم رسمی (Bescheid) |
| ro | 1 | Rundfunk „partenerul înregistrat (Lebenspartner)“ |
| fr | 0 | **nicht umgesetzt** (s. Offen) |

Deutsche Amtsbegriffe (Jobcenter, Wohngeld, Pflegekasse …) bleiben deutsch. Knöpfe in tr/pl behalten die übliche kurze Befehlsform (z. B. „Kaydet“, „Zapisz“, „Paylaş“), wie in amtlichen Apps üblich.

## Prüfung

- Werkzeugprüfung jeder Änderung (Skript, vor dem Schreiben): Platzhalter `{…}` und HTML gleich, alle Zahlen gleich, kein deutscher Amtsbegriff aus dem Quelltext verloren – 0 Fehler.
- Rückübersetzung: jede Änderung wurde beim Umschreiben gegen den deutschen Satz gelesen (Sinn, Fristen, Beträge, keine neuen Zusagen); zusätzlich Stichproben-Rückübersetzung (pl 10 Texte) ohne Befund. Eine unabhängige Prüfung durch einen zweiten Prüfer (Fable/Muttersprachler) fehlt noch – vor Veröffentlichung empfohlen, besonders für pl (Grammatik der Państwo-Form), so und ps.
- Eigener Fund bei der Rückübersetzung und sofort korrigiert: ru „ваши общие дети“ (= nur gemeinsame Kinder) wieder zu „ваши дети“ (§ 7 Abs. 3 SGB II umfasst auch Kinder eines Partners).
- Lokal grün: `build:web`, `test:rules` (45/45), `test-sprachen-zahlen` (33 060 Texte), `test-einfach-gleich 500`, `dom-test` (348), `test-denetz-dom`, `test-klient-dom`, `test-weitergabe-dom`.

## Zweifel und bewusst nicht geändert

1. **en Bescheid:** Das Glossar nennt „notice“ (Familienkasse). Vereinheitlicht wurde auf „decision“ (Mehrheit, 37 Texte), weil `el.ks.keinWs` „notice“ für *Hinweis* braucht („it is a notice, not a decision“). Bei Wunsch nach „notice“ müsste dieser Text umformuliert werden.
2. **so Widerspruch:** „diidmo“ und „racfaan“ gemischt; keine amtliche Somali-Quelle → nicht vereinheitlicht. „dacwad“ steht nur für Klage (korrekt).
3. **pl Einspruch:** Familienkasse übersetzt Einspruch mit „odwołanie“, Widerspruch mit „sprzeciw“ – so jetzt auch in der App. Andere „odwołanie“-Stellen für *Einspruch* bleiben.
4. **fa-AF:** „اشتراک‌گذاری“ (teilen) nicht ersetzt, weil dafür Verbformen umgebaut werden müssen; „خانواده“ und „بچه“ bleiben (auch im Dari gebräuchlich). „حقوق تقاعد“ wäre im Dari eher „معاش تقاعد“ – unverändert gelassen.
5. Übrige Einzelfunde aus `glossar-abgleich.md` (Umschreibungen wie „Inkasso“, „Nebenkostenabrechnung“, „P-Konto“) sind meist gleichwertig und wurden nicht angefasst.

## Offen (nicht in diesem Branch)

- **fr: höfliche Anrede (vous)** – ca. 1 500 Texte mit „tu“/Imperativ; aus Zeitgründen nicht begonnen. Kein Teilstand, damit keine neue Mischung entsteht.
- **fa-AF: einheitliche Anrede** – Hauptdatei überwiegend „شما“, neue Bereiche (haushalt, schulden, klient, zusatz, fristen) „تو“; Vereinheitlichung auf „شما“ (ca. 400 Texte) offen. Gleiches gilt für fa.
- Unabhängige Rückübersetzungsprüfung (Fable) aller geänderten Texte vor dem Release.
