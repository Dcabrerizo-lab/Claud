# Google Play: Geschlossener Test und Antrag auf Produktion

## 1. Webseite online stellen (vor dem Anlegen der App)

Im Ordner `site/` liegen zwei Seiten: `index.html` (kurze Startseite) und `datenschutz.html` (Datenschutz und Impressum).

1. Auf **app.netlify.com/drop** gehen (kostenlos, Anmeldung mit E-Mail).
2. Den ganzen Ordner `site` in das Feld ziehen.
3. Netlify zeigt eine Adresse wie `https://irgendein-name.netlify.app`. Unter „Site configuration“ kann man den Namen ändern, z. B. `sozialleistungslotse.netlify.app`.
4. In der Play Console als Datenschutz-Adresse eintragen: `https://sozialleistungslotse.netlify.app/datenschutz.html`

## 2. Einladung an die Tester (zum Kopieren)

Mindestens 12 Personen, die 14 Tage am Stück dabeibleiben. Am besten 15 bis 20 einladen, falls jemand abspringt.

> Hallo,
>
> ich habe eine App entwickelt: den **SoLo**. Er zeigt in zwei Minuten, welche Sozialleistungen jemandem zustehen könnten, zum Beispiel Wohngeld, Kinderzuschlag oder Pflegegeld. Alles bleibt auf dem Handy, es gibt keine Anmeldung und keine Werbung.
>
> Damit die App in den Play Store darf, verlangt Google einen Test mit mindestens 12 Personen über 14 Tage. Hilfst du mir?
>
> So geht's (dauert 2 Minuten):
> 1. Schick mir die **Gmail-Adresse**, mit der du im Play Store angemeldet bist.
> 2. Ich trage dich ein und schicke dir einen Link und einen Gutscheincode. Für dich als Tester kostet die App nichts.
> 3. Code einlösen: Play Store öffnen, oben rechts auf dein Profilbild, „Zahlungen und Abos“, „Code einlösen“.
> 4. Link öffnen, „Tester werden“ tippen, dann die App aus dem Play Store installieren.
> 5. **Die App 14 Tage lang nicht deinstallieren.** Es reicht, sie ab und zu zu öffnen und einmal auszuprobieren.
>
> Wenn dir etwas auffällt (unklare Frage, falsches Ergebnis, Fehler), schreib mir gern. Jede Rückmeldung hilft.
>
> Danke!

**Erinnerung nach 7 Tagen** (zum Kopieren):

> Kurze Erinnerung zum SoLo: Bitte die App noch 7 Tage drauflassen, sonst zählt der Test nicht. Wenn du magst, probier einmal die „einfache Version“ oder die Antragsmappe aus und sag mir, ob alles klar war. Danke!

## 3. Antrag auf Produktionszugriff: Antwortentwürfe

Google stellt nach den 14 Tagen Fragen zum Test. **Die Platzhalter in [eckigen Klammern] mit den echten Zahlen und Rückmeldungen füllen.** Nichts angeben, was nicht stimmt.

**Wie haben Sie Tester gefunden?**
> Familie, Freunde, Kolleginnen und Kollegen sowie [z. B. Bekannte aus der Sozialberatung / einer Werkstatt]. Insgesamt [Zahl] Personen, darunter Eltern, Rentnerinnen und Rentner und Menschen, die Angehörige pflegen.

**Wie leicht war es, Tester zu finden?**
> [Leicht / mittel / schwer], weil [kurze Begründung].

**Beschreiben Sie die Nutzung während des Tests.**
> Die Tester haben den Fragebogen mit eigenen oder ausgedachten Haushalten ausgefüllt, die Ergebnisse gelesen und teils die Antragsmappe erstellt. [Zahl] haben die einfache Version ausprobiert. [Ergänzen: was wie oft genutzt wurde, soweit bekannt.]

**Fassen Sie das Feedback zusammen. Wie haben Sie es gesammelt?**
> Rückmeldungen kamen per [Nachricht / E-Mail / Gespräch]. Genannt wurden: [z. B. „Frage nach dem Netto unklar“, „Schrift größer“]. [Nur echte Rückmeldungen eintragen.]

**Welche Änderungen haben Sie aufgrund des Tests gemacht?**
> [Konkrete Änderungen, z. B. „Text der Frage X vereinfacht (Version 82)“.]

**Für wen ist die App?**
> Für Menschen in Deutschland, die wissen möchten, welche Sozialleistungen ihnen zustehen könnten, z. B. Familien mit kleinem Einkommen, Alleinerziehende, Rentnerinnen und Rentner, Menschen mit Behinderung und pflegende Angehörige. Es gibt eine einfache Version für Menschen mit Lernschwierigkeiten und 8 Sprachen.

**Welchen Nutzen bietet die App?**
> Viele Menschen beantragen Leistungen nicht, weil sie nicht wissen, dass sie Anspruch haben. Die App prüft 31 Leistungen in zwei Minuten, nennt die zuständige Stelle und die Unterlagen und schreibt formlose Anträge. Sie läuft vollständig offline, ohne Konto, ohne Werbung, ohne In-App-Käufe und ohne Datenübertragung. Sie ist eine Orientierung und keine Behörden-App.

**Wie viele Installationen erwarten Sie im ersten Jahr?**
> [Realistische Schätzung, z. B. 1.000 bis 10.000.]

**Woran haben Sie erkannt, dass die App bereit ist?**
> Die Rechenregeln sind gegen eine Prüfliste vom Gesetz her mit über 1.000 automatischen Prüfungen und einer unabhängigen Vergleichsrechnung über 3 Millionen Zufallshaushalte getestet. Dazu kommen Barrierefreiheitstests (WCAG 2.1 AA) und der geschlossene Test ohne offene Fehler. [Falls zutreffend: Eine Sozialberatung hat die Ergebnisse gegengelesen.]

## 4. Danach

- Produktion: „Neuer Release“, die neueste AAB-Datei hochladen, Versionshinweise schreiben, zur Prüfung senden.
- Jede neue Version bekommt eine höhere Versionsnummer; die AAB-Datei dafür baue ich.
- Datei `upload.jks` und Passwort an zwei sicheren Orten aufbewahren.
