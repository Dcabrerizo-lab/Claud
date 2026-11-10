# Store-Angaben

Texte und Antworten zum Kopieren in die Google Play Console und App Store Connect.
Alles muss zur [Datenschutzerklärung](../datenschutz.html) passen. Bei Änderungen an der App beide Stellen prüfen.

## Grunddaten

| Feld | Wert |
|---|---|
| App-Name | SoLo – Sozialleistungslotse (27 Zeichen) |
| Untertitel (iOS, max. 30 Zeichen) | Sozialleistungen schnell prüfen |
| Kategorie | Play: *Finanzen* · iOS: *Finanzen* (Zweitkategorie *Dienstprogramme*) |
| Altersfreigabe | Ab 0 / 4+ (keine kritischen Inhalte) |
| Preis | Kostenlos, keine In-App-Käufe, keine Werbung |
| Datenschutz-URL | `datenschutz.html` öffentlich ins Netz stellen, z. B. GitHub Pages (`https://dcabrerizo-lab.github.io/Claud/datenschutz.html`), eine eigene Website, Netlify oder Codeberg Pages |
| Support-E-Mail | d.cabrerizo@gmx.de |
| Sprachen im Store | Deutsch (Haupt), weitere optional: Englisch, Türkisch, Arabisch, Russisch, Ukrainisch, Polnisch, Rumänisch |

## Kurzbeschreibung (Play, max. 80 Zeichen)

> Prüfe in zwei Minuten, welche Sozialleistungen dir zustehen könnten. Offline.

## Beschreibung (Play und iOS)

> Steht dir Wohngeld zu? Kinderzuschlag? Grundsicherung? SoLo prüft in zwei Minuten 28 Sozialleistungen und Vergünstigungen und zeigt dir, was wahrscheinlich, möglich oder unwahrscheinlich ist, mit den nächsten Schritten, der zuständigen Stelle und den nötigen Unterlagen.
>
> **Was die App prüft**
> Kindergeld, Elterngeld, Wohngeld, Kinderzuschlag, Grundsicherungsgeld, Arbeitslosengeld I, Krankengeld, Bildung und Teilhabe, Unterhaltsvorschuss, Grundsicherung im Alter und bei Erwerbsminderung, BAföG, Berufsausbildungsbeihilfe, Pflegegeld, Entlastungsbetrag, Verhinderungspflege und Pflegehilfsmittel, Hilfe zur Pflege, Leistungen bei Behinderung (Pauschbetrag, Schwerbehindertenausweis, Eingliederungshilfe, Budget für Arbeit, Erwerbsminderungsrente, Altersrente für schwerbehinderte Menschen), Landesblindengeld, Blindenhilfe, Wohnberechtigungsschein, Befreiung vom Rundfunkbeitrag und von Zuzahlungen, Leistungen nach dem Asylbewerberleistungsgesetz.
>
> **Auch in einfacher Sprache**
> Für Menschen mit Lernschwierigkeiten, zum Beispiel in einer Werkstatt: eine Frage pro Bildschirm, große Knöpfe, Vorlesen. Das Ergebnis zeigt, was du bekommen kannst, wie viel ungefähr und wo du hingehst.
>
> **Antragsmappe**
> Die App schreibt dir formlose Anträge auf Deutsch, so wie die Ämter sie brauchen. Damit sicherst du bei vielen Leistungen den Startmonat. Dazu kommen ein Angabenblatt und eine Liste der Unterlagen. Teile alles als PDF, zum Drucken oder per E-Mail.
>
> **Formular fotografieren**
> Du hast ein Antragsformular bekommen? Fotografiere es, und die App erklärt dir die Felder. Die Erkennung läuft nur auf deinem Gerät.
>
> **In 8 Sprachen**
> Deutsch, Englisch, Türkisch, Arabisch, Russisch, Ukrainisch, Polnisch und Rumänisch. Amtsbegriffe bleiben deutsch, damit du sie beim Amt wiedererkennst.
>
> **Deine Daten bleiben bei dir**
> Keine Anmeldung, keine Server, keine Werbung, kein Tracking. Alles wird auf deinem Gerät berechnet und gespeichert.
>
> **Für ganz Deutschland**
> Die Leistungen werden für alle Bundesländer geprüft. Für Bayern nennt SoLo die zuständige Stelle mit Anschrift, in den anderen Ländern die Art der Stelle.
>
> **Wichtig:** SoLo ist eine Orientierung, keine Rechtsberatung. Über deinen Anspruch entscheidet immer die zuständige Stelle. Rechtsstand: November 2026.

## Google Play: Datensicherheit

| Frage | Antwort |
|---|---|
| Erhebt oder teilt die App Nutzerdaten? | **Nein.** Alle Daten werden nur auf dem Gerät verarbeitet (Google-Definition: Daten, die das Gerät nicht verlassen, gelten nicht als „erhoben“). |
| Daten verschlüsselt übertragen? | Nicht zutreffend (keine Übertragung) |
| Können Nutzer das Löschen beantragen? | Ja: „Alle Angaben löschen“ in der App oder Deinstallation |
| Werbung | Nein |
| Zielgruppe | Erwachsene (18+); nicht für Kinder gestaltet |
| Gesundheits-Apps-Erklärung | Keine Gesundheits-App (Angaben zu Pflegegrad/Behinderung dienen nur der Leistungsprüfung, bleiben auf dem Gerät) |
| Behörden-App? | **Nein.** In Beschreibung und Screenshots nicht den Eindruck einer offiziellen Behörden-App erwecken (Play-Richtlinie „Irreführende Behauptungen“). |

## Apple: App-Datenschutz („Nutritional Label“)

- **Datenerfassung:** „Wir erfassen keine Daten aus dieser App.“
- **Tracking:** Nein.
- **Exportkontrolle:** In `Info.plist` ist `ITSAppUsesNonExemptEncryption = false` gesetzt (nur Standard-Verschlüsselung des Systems).
- **Kamera:** Begründung steht in `Info.plist` (`NSCameraUsageDescription`).
- **Review-Hinweis an Apple** (App Review Information → Notes):
  > Die App läuft vollständig offline und benötigt kein Konto. Zum Testen: oben ein Beispiel wählen („Alleinerziehend …“), Ergebnisse ansehen, unten „Antragsmappe erstellen“ → „Als PDF teilen“. „Formular fotografieren“ nutzt die Kamera und erkennt Text auf dem Gerät (Apple Vision).

## Screenshots

Benötigt: Play mindestens 2 Handy-Screenshots und eine Werbegrafik (1024 × 500); iOS 6,9″ (1320 × 2868) und 6,5″ (1242 × 2688), optional iPad.
Fertige Bilder (7 Motive in allen drei Formaten, Werbegrafik, Symbol 512 × 512) entstehen mit `node tools/store-bilder.js` nach `store-bilder/`.
Ursprünglicher Vorschlag für die Motive:

1. Fragebogen mit Beispiel: „In zwei Minuten zum Überblick“
2. Ergebnis mit grünen Karten: „28 Leistungen geprüft“
3. Karte aufgeklappt (Wo beantragen, Unterlagen): „Nächste Schritte und Unterlagen“
4. Antragsmappe: „Formlose Anträge als PDF“
5. Sprache Arabisch oder Türkisch: „In 8 Sprachen“
