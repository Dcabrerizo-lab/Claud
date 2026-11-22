---
titel: Grundsicherung im Alter
datei: 06-grundsicherung-im-alter
serie: SoLo erklärt
folge: 6
stimme: erzaehler
tempo: 1.0
musik: ja
musik_abstand_db: 25
untertitel: auto
untertitel_y: 1040
hervorhebung: [SoLo]
---

# Folge 6 · Grundsicherung im Alter und bei Erwerbsminderung

Übertragen aus docs/videos/drehbuecher/6-grundsicherung-im-alter.md (Branch claude/b-videos, Stand Faktenprüfung
a72438cb). Texte und Zahlen wörtlich.
Quellen (siehe Drehbuch): § 41, § 44, § 94 Abs. 1a SGB XII (gesetze-im-internet.de, abgerufen 21./22.11.2026);
Deutsche Rentenversicherung „Grundsicherung“ (abgerufen 22.11.2026): Kinder erst über 100.000 € im Jahr,
Schonvermögen 10.000 € / 20.000 €, Antrag beim Sozialamt; BMAS FAQ Regelbedarfe 2026: 563 €.
Rentenbescheid und Kontoauszüge sind nur Beispiele.

Aufbau: Text oben (Bildunterschrift, Titel/Blase, Untertitel bei y 1040), Figuren unten ab ca. y 1160.

## 1 Haken
```yaml
hintergrund: warm
kamera: ruck
ruck_bei: 2.2
fokus: [470, 900]
sprecher: "Grundsicherung im Alter – und deine Kinder müssen zahlen? Nicht so schnell."
oben: "Grundsicherung im Alter und bei Erwerbsminderung."
hervorhebung: [Nicht, so, schnell.]
titel: {text: "Grundsicherung?\nZahlen dann\ndeine Kinder?", groesse: 92, y: 480, start: 0, ausrichtung: center}
laut: {text: "NICHT SO SCHNELL", x: 470, y: 905, start: 2.3, drehung: -5, groesse: 48, breite: 720, hoehe: 220}
bausteine:
  - {was: rentnerin, pose: halten, haelt: formular, mimik: sorge, x: 280, y: 1880, hoehe: 720}
  - {was: vater, mimik: sorge, spiegeln: true, x: 800, y: 1880, hoehe: 700, auftritt: plopp, start: 0.5}
```

## 2 Die Geschichte beginnt
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [460, 900]
sprecher: "Ihre Rente ist klein. Nach der Miete bleibt fast nichts."
oben: "Kleine Rente, hohe Miete."
hervorhebung: [kleine, Rente]
blase: {text: "Mein Sohn soll nicht für mich zahlen.", x: 60, y: 480, breite: 600, zipfel: [270, 1150]}
bausteine:
  - {was: rentnerin, mimik: sorge, x: 260, y: 1880, hoehe: 720}
  - {was: brief_offen, x: 540, y: 1420, hoehe: 180, auftritt: plopp, start: 0.5}
  - {was: muenzen, x: 540, y: 1700, hoehe: 130, auftritt: plopp, start: 0.9}
  - {was: lotsin, pose: stehen, x: 850, y: 1880, hoehe: 720, auftritt: rechts, start: 0.3}
```

## 3 Was ist das?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [460, 900]
sprecher: "Die Grundsicherung füllt die Lücke, wenn die Rente nicht reicht."
oben: "Sie kommt vom Sozialamt, nicht von der Rentenversicherung."
hervorhebung: [ergänzt]
blase: {text: "Grundsicherung ergänzt deine Rente.", x: 60, y: 520, breite: 600, zipfel: [820, 1150]}
schilder:
  - {text: "Grundsicherung", x: 360, y: 1180, farbe: gold, start: 1.1}
bausteine:
  - {was: brief_offen, x: 220, y: 1480, hoehe: 210}
  - {was: muenzen, x: 470, y: 1470, hoehe: 190, auftritt: oben, start: 1.0}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 860, y: 1880, hoehe: 740}
```

## 4 Checkliste
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [480, 800]
sprecher: "Trifft das zu? Rentenalter erreicht – oder ab achtzehn dauerhaft voll erwerbsgemindert. Und das Geld reicht nicht."
oben: "Voll erwerbsgemindert = du kannst kaum oder gar nicht arbeiten."
hervorhebung: [Rentenalter]
untertitel: false
checkliste:
  titel: "Trifft das auf dich zu?"
  x: 50
  y: 545
  breite: 860
  punkte: ["Rentenalter erreicht – oder ab 18 dauerhaft voll erwerbsgemindert", "Rente und Erspartes reichen nicht", "Du wohnst in Deutschland"]
bausteine:
  - {was: rentnerin, mimik: denken, x: 260, y: 1880, hoehe: 640}
  - {was: lotsin, pose: stehen, x: 850, y: 1880, hoehe: 660}
```

## 5 Knall: die Kinder
```yaml
hintergrund: gold
strahlen: true
kamera: zoom-out
fokus: [480, 700]
sprecher: "Deine Kinder müssen erst zahlen, wenn sie über hunderttausend Euro im Jahr verdienen."
oben: "Bis 100.000 € Einkommen im Jahr muss ein Kind nichts zahlen."
hervorhebung: ["100.000"]
knall: {oben: "Kinder erst über", text: "100.000 €", unten: "im Jahr", y: 540, groesse: 150, start: 0.4}
blase: {text: "So viel verdiene ich lange nicht.", x: 60, y: 950, breite: 560, zipfel: [790, 1210], start: 2.0}
bausteine:
  - {was: rentnerin, mimik: freude, x: 230, y: 1880, hoehe: 600, auftritt: links, start: 0.6}
  - {was: vater, pose: handy, mimik: freude, x: 820, y: 1880, hoehe: 660, auftritt: rechts, start: 0.7}
```

## 6 Wie viel ungefähr?
```yaml
hintergrund: hellblau
kamera: ruck
ruck_bei: 3.6
fokus: [480, 900]
sprecher: "Allein gilt ein Regelsatz von fünfhundertdreiundsechzig Euro, plus angemessene Miete und Heizung. Die Rente wird angerechnet."
oben: "Regelsatz 2026: 563 €, plus angemessene Wohnkosten, minus Einkommen."
hervorhebung: ["563"]
schilder:
  - {text: "563 €", x: 260, y: 1200, farbe: gold, groesse: 70, start: 0.5}
  - {text: "+ Miete und Heizung", x: 580, y: 1360, farbe: warm, start: 2.0, groesse: 46}
bausteine:
  - {was: muenzen, x: 260, y: 1560, hoehe: 260, auftritt: plopp, start: 0.4}
  - {was: haus, x: 680, y: 1780, hoehe: 320, auftritt: plopp, start: 1.9}
```

## 7 Erspartes
```yaml
hintergrund: gruen
kamera: zoom-in
fokus: [460, 900]
sprecher: "Erspartes darfst du bis zehntausend Euro behalten, als Paar bis zwanzigtausend."
oben: "Schonvermögen: 10.000 € allein, 20.000 € als Paar."
hervorhebung: ["10.000"]
blase: {text: "Ein Notgroschen bleibt geschützt.", x: 60, y: 520, breite: 600, zipfel: [820, 1150]}
schilder:
  - {text: "10.000 €", x: 300, y: 1170, farbe: gold, groesse: 64, start: 0.5}
bausteine:
  - {was: muenzen, x: 290, y: 1540, hoehe: 280, auftritt: plopp, start: 0.3}
  - {was: schloss, x: 450, y: 1560, hoehe: 170, auftritt: plopp, start: 1.0}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 860, y: 1880, hoehe: 740}
```

## 8 Wo beantragen?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [460, 900]
sprecher: "Der Antrag geht ans Sozialamt. Nimm Rentenbescheid und Kontoauszüge mit."
oben: "Die Rentenversicherung nimmt Anträge auch an und leitet sie weiter."
hervorhebung: ["Sozialamt:"]
blase: {text: "Sozialamt: Rentenbescheid und Kontoauszüge mitnehmen.", x: 60, y: 560, breite: 640, zipfel: [830, 1150]}
schilder:
  - {text: "Sozialamt", x: 220, y: 1170, farbe: warm, start: 0.5}
bausteine:
  - {was: haus, x: 200, y: 1720, hoehe: 380}
  - {was: rentnerin, pose: halten, haelt: brief_offen, x: 540, y: 1880, hoehe: 660}
  - {was: lotsin, pose: stehen, x: 860, y: 1880, hoehe: 740}
```

## 9 Die Falle
```yaml
hintergrund: navy
kamera: ruck
ruck_bei: 2.4
fokus: [480, 900]
sprecher: "Die Falle: Es gilt erst ab dem Monat deines Antrags. Davor gibt es nichts."
oben: "Gilt ab dem 1. des Antragsmonats. Nicht warten."
hervorhebung: [Nicht, warten.]
titel: {text: "Nicht für Monate\nvor dem Antrag", groesse: 96, y: 520, start: 0.3}
bausteine:
  - {was: kalender, x: 280, y: 1700, hoehe: 380, auftritt: plopp, start: 0.4}
  - {was: schloss, x: 400, y: 1720, hoehe: 170, auftritt: plopp, start: 1.4}
  - {was: kalender, x: 740, y: 1700, hoehe: 380, auftritt: plopp, start: 2.4}
  - {was: haken, x: 850, y: 1440, hoehe: 150, auftritt: plopp, start: 2.8}
```

## 10 Prüf es mit SoLo
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [420, 1000]
sprecher: "Vielleicht passt auch Wohngeld. Prüf es in etwa fünf Minuten mit Solo."
oben: "SoLo zeigt, was wahrscheinlich oder möglich ist."
hervorhebung: ["5", Minuten]
blase: {text: "Prüf es in etwa 5 Minuten mit SoLo.", x: 60, y: 500, breite: 600, zipfel: [830, 1080]}
bausteine:
  - {was: rentnerin, pose: handy, x: 150, y: 1880, hoehe: 600}
  - {was: handy-app, x: 470, y: 1540, hoehe: 640, auftritt: unten, start: 0.2, bildschirm: {zeilen: [{text: "Grundsicherung im Alter", marke: moeglich}, {text: "Wohngeld"}]}}
  - {was: lotsin, pose: handy, x: 860, y: 1880, hoehe: 780}
```

## 11 Schluss und Schleife (greift Bild 1 auf)
```yaml
basis: 1
kamera: zoom-in
ruck_bei: 99
fokus: [480, 800]
sprecher: "Kleine Rente ist kein Grund zur Scham. Schick das jemandem, der es braucht."
oben: "Schick das jemandem, der es braucht."
hervorhebung: [Scham.]
titel: {text: "Kleine Rente?\nGrundsicherung\nprüfen.", groesse: 92, y: 480, start: 0.05, auftritt: plopp, ausrichtung: center}
laut: null
hinweis: "Stand: 22.11.2026 · keine Rechtsberatung"
bausteine:
  - {was: vater, mimik: freude, spiegeln: true, x: 990, y: 1880, hoehe: 740, ebene: 1}
  - {was: rentnerin, pose: halten, haelt: formular, mimik: freude, x: 850, y: 1880, hoehe: 680, ebene: 2}
  - {was: haken, x: 300, y: 1760, hoehe: 180, auftritt: plopp, start: 0.5}
```
