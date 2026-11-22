---
titel: Wohngeld
datei: 05-wohngeld
serie: SoLo erklärt
folge: 5
stimme: erzaehler
tempo: 1.0
musik: ja
musik_abstand_db: 25
untertitel: auto
untertitel_y: 1040
hervorhebung: [SoLo]
---

# Folge 5 · Wohngeld

Übertragen aus docs/videos/drehbuecher/5-wohngeld.md (Branch claude/b-videos). Texte und Zahlen wörtlich.
Quellen (siehe Drehbuch): § 25 WoGG und § 7 WoGG (gesetze-im-internet.de, abgerufen 21.11.2026);
BMWSB „Fragen und Antworten zum Wohngeld-Plus“ (abgerufen 22.11.2026): ab Beginn des Antragsmonats, in der Regel 12 Monate.
Mietvertrag und Lohnzettel sind nur Beispiele.

Aufbau: Text oben (Bildunterschrift, Titel/Blase, Untertitel bei y 1040), Figuren unten ab ca. y 1140.

## 1 Haken
```yaml
hintergrund: warm
kamera: ruck
ruck_bei: 1.8
fokus: [480, 900]
sprecher: "Beim Wohngeld kann ein Tag einen ganzen Monat kosten. Warum?"
oben: "Wohngeld – warum der Tag des Antrags zählt."
hervorhebung: [Tag]
titel: {text: "Wohngeld: 1 Tag kann\n1 Monat kosten", groesse: 96, y: 480, start: 0, ausrichtung: center}
schilder:
  - {text: "31.", x: 270, y: 1250, farbe: warm, start: 0.2}
  - {text: "1.", x: 760, y: 1250, farbe: gold, start: 0.3}
bausteine:
  - {was: kalender, x: 270, y: 1720, hoehe: 400}
  - {was: kalender, x: 760, y: 1720, hoehe: 400}
  - {was: brief, x: 520, y: 1560, hoehe: 190, auftritt: links, start: 0.6, ebene: 5}
```

## 2 Die Geschichte beginnt
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [460, 900]
sprecher: "Die Miete steigt. Beide arbeiten, trotzdem wird es knapp."
oben: "Miete hoch, Lohn knapp."
hervorhebung: [Miete]
blase: {text: "Schon wieder mehr Miete?", x: 60, y: 480, breite: 600, zipfel: [790, 1150]}
bausteine:
  - {was: mutter, mimik: sorge, x: 250, y: 1880, hoehe: 720}
  - {was: kind, x: 520, y: 1880, hoehe: 360}
  - {was: brief_offen, x: 520, y: 1380, hoehe: 190, auftritt: plopp, start: 0.5}
  - {was: vater, mimik: sorge, spiegeln: true, x: 810, y: 1880, hoehe: 750}
```

## 3 Was ist das?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [460, 900]
sprecher: "Wohngeld ist ein Zuschuss zur Miete. Auch wenn du arbeitest."
oben: "Für Eigentümer heißt es Lastenzuschuss."
hervorhebung: [Zuschuss, Miete]
blase: {text: "Wohngeld hilft bei der Miete, auch wenn du arbeitest.", x: 60, y: 480, breite: 640, zipfel: [800, 1150]}
schilder:
  - {text: "Zuschuss", x: 330, y: 1130, farbe: gold, start: 1.1}
bausteine:
  - {was: haus, x: 330, y: 1700, hoehe: 360, auftritt: plopp, start: 0.3}
  - {was: muenzen, x: 340, y: 1360, hoehe: 170, auftritt: oben, start: 1.0}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 840, y: 1880, hoehe: 740, auftritt: rechts, start: 0.1}
```

## 4 Checkliste
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [480, 800]
sprecher: "Trifft das zu? Du zahlst Miete. Dein Einkommen ist knapp. Kein Grundsicherungsgeld, keine Sozialhilfe."
oben: "Mit Grundsicherungsgeld gibt es in der Regel kein Wohngeld."
hervorhebung: [knapp]
untertitel: false
checkliste:
  titel: "Trifft das auf dich zu?"
  x: 50
  y: 480
  breite: 860
  punkte: ["Du zahlst Miete oder hast Wohneigentum", "Du hast eigenes Einkommen, aber es ist knapp", "Kein Grundsicherungsgeld, keine Sozialhilfe"]
bausteine:
  - {was: mutter, mimik: denken, x: 240, y: 1880, hoehe: 640}
  - {was: kind, x: 480, y: 1880, hoehe: 330}
  - {was: vater, mimik: denken, spiegeln: true, x: 820, y: 1880, hoehe: 660}
```

## 5 Wie viel?
```yaml
hintergrund: gruen
kamera: zoom-in
fokus: [460, 900]
sprecher: "Die Höhe hängt von drei Dingen ab: Personen, Einkommen, Miete."
oben: "Einen festen Betrag gibt es nicht."
hervorhebung: [drei, Dingen]
blase: {text: "Personen, Einkommen, Miete – daraus wird gerechnet.", x: 60, y: 480, breite: 640, zipfel: [810, 1150]}
bausteine:
  - {was: mutter-kind, x: 150, y: 1500, hoehe: 380, auftritt: plopp, start: 0.6}
  - {was: muenzen, x: 380, y: 1480, hoehe: 190, auftritt: plopp, start: 1.2}
  - {was: haus, x: 580, y: 1490, hoehe: 230, auftritt: plopp, start: 1.8}
  - {was: lotsin, pose: stehen, x: 860, y: 1880, hoehe: 740}
```

## 6 Knall: der Stichtag
```yaml
hintergrund: gold
strahlen: true
kamera: zoom-out
fokus: [480, 760]
sprecher: "Die Antwort: Wohngeld gibt es in der Regel erst ab dem Monat, in dem dein Antrag ankommt."
oben: "Antrag noch am letzten Tag des Monats: der ganze Monat zählt."
untertitel: false
knall: {oben: "Ab dem", text: "1.", unten: "des Antragsmonats", y: 500, groesse: 320, start: 0.4}
bausteine:
  - {was: mutter, mimik: sorge, x: 200, y: 1880, hoehe: 600, auftritt: links, start: 0.5}
  - {was: vater, mimik: sorge, spiegeln: true, x: 860, y: 1880, hoehe: 620, auftritt: rechts, start: 0.6}
```

## 7 Wo beantragen?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [460, 900]
sprecher: "Der Antrag geht an die Wohngeldstelle. Nimm Mietvertrag und Lohnzettel mit."
oben: "Manche Stellen nehmen den Antrag auch online an."
hervorhebung: ["Wohngeldstelle:"]
blase: {text: "Wohngeldstelle: Mietvertrag und Lohnzettel mitnehmen.", x: 60, y: 480, breite: 640, zipfel: [820, 1150]}
schilder:
  - {text: "Wohngeldstelle", x: 285, y: 1170, farbe: warm, start: 0.5}
bausteine:
  - {was: haus, x: 210, y: 1720, hoehe: 380}
  - {was: mutter, pose: halten, haelt: formular, x: 550, y: 1880, hoehe: 660}
  - {was: lotsin, pose: stehen, x: 860, y: 1880, hoehe: 740}
```

## 8 Gut zu wissen
```yaml
hintergrund: gruen
kamera: zoom-in
fokus: [460, 900]
sprecher: "Übrigens: Auch mit Rente kann Wohngeld möglich sein."
oben: "Wohngeld ist auch mit Rente möglich."
hervorhebung: [Rente]
blase: {text: "Geht das auch mit meiner Rente?", x: 60, y: 480, breite: 600, zipfel: [300, 1150]}
schilder:
  - {text: "Rente", x: 720, y: 1150, farbe: gold, start: 0.7}
bausteine:
  - {was: rentnerin, pose: winken, x: 300, y: 1880, hoehe: 740}
  - {was: haus, x: 740, y: 1640, hoehe: 340, auftritt: plopp, start: 0.4}
```

## 9 Erleichterung
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [460, 900]
sprecher: "Antrag gestellt. Bewilligt wird meist für zwölf Monate."
oben: "In der Regel für 12 Monate bewilligt."
hervorhebung: ["12"]
blase: {text: "Gut, dass wir nicht gewartet haben.", x: 60, y: 480, breite: 600, zipfel: [250, 1150]}
bausteine:
  - {was: mutter, pose: freuen, x: 250, y: 1880, hoehe: 720}
  - {was: kind, pose: freuen, x: 520, y: 1880, hoehe: 360}
  - {was: brief_offen, x: 530, y: 1400, hoehe: 180, auftritt: plopp, start: 0.6}
  - {was: vater, pose: freuen, x: 820, y: 1880, hoehe: 750}
```

## 10 Prüf es mit SoLo
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [400, 1000]
sprecher: "Prüf in etwa fünf Minuten mit Solo, ob Wohngeld möglich ist."
oben: "SoLo zeigt, was wahrscheinlich oder möglich ist."
hervorhebung: ["5", Minuten]
blase: {text: "Prüf es in etwa 5 Minuten mit SoLo.", x: 60, y: 500, breite: 600, zipfel: [820, 1080]}
bausteine:
  - {was: handy-app, x: 320, y: 1540, hoehe: 700, auftritt: unten, start: 0.2, bildschirm: {zeilen: [{text: "Wohngeld", marke: wahrscheinlich}, {text: "Miete", marke: formular}]}}
  - {was: lotsin, pose: handy, x: 850, y: 1880, hoehe: 800}
```

## 11 Schluss und Schleife (greift Bild 1 auf)
```yaml
basis: 1
kamera: zoom-in
ruck_bei: 99
fokus: [480, 800]
sprecher: "Wohngeld: Antrag lieber heute als morgen. Schick das jemandem, dessen Miete gerade steigt."
oben: "Schick das jemandem, der es braucht."
hervorhebung: [heute]
titel: {text: "Wohngeld: lieber\nheute als morgen", groesse: 96, y: 480, start: 0.05, auftritt: plopp, ausrichtung: center}
schilder: []
hinweis: "Stand: 22.11.2026 · keine Rechtsberatung"
bausteine:
  - {was: kalender, x: 520, y: 1420, hoehe: 250, bewegung: keine}
  - {was: brief, x: 420, y: 1440, hoehe: 130, ebene: 9, bewegung: keine}
  - {was: haken, x: 680, y: 1260, hoehe: 130, auftritt: plopp, start: 0.5, ebene: 6}
  - {was: mutter, pose: freuen, x: 150, y: 1880, hoehe: 330}
  - {was: vater, pose: freuen, x: 880, y: 1880, hoehe: 700}
```
