# Anschriften mit dem Android-Handy sammeln

SoLo kennt die Anschriften der Ämter bisher nur für Bayern. Für die anderen Bundesländer sammelt dieses Skript die Anschriften der rund 300 Landkreise und kreisfreien Städte: zuerst aus dem Impressum der Behörde, und wo das nicht klappt, aus dem Wikipedia-Artikel (Adresse der Kreis- oder Stadtverwaltung). Es läuft auf deinem Android-Handy in der kostenlosen App **Termux**. Dauer: etwa 40 bis 60 Minuten.

## 1. Termux installieren (einmalig)

1. Installiere **F-Droid** (ein seriöser, freier App-Store): auf dem Handy `f-droid.org` öffnen, „F-Droid herunterladen“, die Datei antippen und installieren. Das Handy fragt nach „Unbekannte Apps erlauben“, das für den Browser erlauben.
2. In F-Droid nach **Termux** suchen und installieren. Wichtig: Termux aus F-Droid nehmen, nicht aus dem Play Store, die Version dort ist veraltet.
3. Termux öffnen. Es erscheint ein schwarzes Fenster mit Text, das ist richtig.

## 2. Python einrichten (einmalig)

Tippe in Termux nacheinander diese Zeilen ein und bestätige jede mit der Eingabetaste:

```
pkg update -y
pkg install -y python
termux-setup-storage
```

Bei `pkg update` kommen eventuell Fragen, einfach mit Eingabetaste bestätigen. Bei `termux-setup-storage` fragt das Handy, ob Termux auf Dateien zugreifen darf: **Erlauben**.

## 3. Skript starten

1. Lade die Datei **`solo-anschriften.py`** aus dem Chat auf das Handy. Sie landet im Ordner **Download**.
2. Tippe in Termux:

```
python ~/storage/downloads/solo-anschriften.py
```

3. Das Skript zeigt, welche Behörde es gerade abruft, zum Beispiel `[12/302] Stadt Köln: 1 Anschrift(en)`. Es hält das Handy wach: Du kannst Termux verlassen, das Handy weiter benutzen oder den Bildschirm ausschalten. In der Benachrichtigungsleiste steht dann „Termux – wake lock held“. Das Handy am besten am Ladekabel lassen.
4. Bricht es trotzdem ab (Netz weg, Akku-Sparmodus), einfach denselben Befehl noch einmal eingeben. Es macht dort weiter, wo es aufgehört hat. Hilft das nicht: In den Android-Einstellungen bei Termux den Akku-Sparmodus ausschalten („Akku: Nicht eingeschränkt“).

## 4. Ergebnis schicken

Am Ende steht `Fertig: ... Datei: .../solo-anschriften.json`. Die Datei **`solo-anschriften.json`** liegt im Ordner **Download**. Schick sie mir hier im Chat (über das Büroklammer-Symbol anhängen).

Ich übernehme dann nur Anschriften, deren Postleitzahl im eigenen Kreis der Behörde liegt. Alles andere wird verworfen. Die Anschrift aus dem Impressum hat Vorrang; kommt sie aus Wikipedia, sagt die App das dazu und bittet, sie auf der Website der Behörde zu prüfen.

Hast du das Skript schon einmal laufen lassen: einfach mit der neuen Datei noch einmal starten. Es ergänzt dann nur die Wikipedia-Angaben.

## Was das Skript tut und was nicht

- Es ruft nur öffentliche Seiten auf: die Startseite und das Impressum jeder Behörde und den Wikipedia-Artikel des Kreises.
- Es meldet sich ehrlich als „SoLo-Sozialleistungslotse“, beachtet die Regeln der Seiten (robots.txt) und wartet 3 Sekunden zwischen den Abrufen.
- Lehnt eine Seite den Abruf ab, wird sie übersprungen, nicht umgangen.
- Es sendet keine Daten von dir irgendwohin und speichert nur die eine Ergebnisdatei.
- Datenvolumen: etwa 100 bis 250 MB. Am besten im WLAN starten.
