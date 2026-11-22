---
titel: Kindergeld
datei: 01-kindergeld
serie: SoLo erklärt
folge: 1
stimme: lotsin
tempo: 1.1
musik: ja
musik_abstand_db: 25
untertitel: auto
untertitel_y: 1060
hervorhebung: [SoLo]
---

# Folge 1 · Kindergeld

Übertragen aus docs/videos/drehbuecher/1-kindergeld.md (Branch claude/b-videos). Texte und Zahlen wörtlich
aus dem Drehbuch (Stand nach Faktenprüfung, Commit a72438cb); Quellen siehe dort (§ 62, § 66, § 70 EStG; arbeitsagentur.de, abgerufen 21./22.11.2026).
Layout-Regel: Figuren-Köpfe unterhalb y 1170, Untertitel bei y 1060, Bildunterschrift oben – kein Text über Figuren.

## 1 Haken
```yaml
hintergrund: warm
kamera: ruck
ruck_bei: 1.6
fokus: [540, 900]
sprecher: "Beim Kindergeld gibt es eine Frist, die Familien Geld kosten kann."
hervorhebung: [Frist]
titel: {text: "Kindergeld: Diese Frist kann Geld kosten", groesse: 100, start: 0}
unten: {text: "Kindergeld – eine Frist, die viele nicht kennen.", y: 720, start: 0.6}
bausteine:
  - {was: vater, mimik: sorge, x: 270, y: 1880, hoehe: 700}
  - {was: kalender, x: 640, y: 1380, hoehe: 200, auftritt: plopp, start: 0.25}
  - {was: kalender, x: 880, y: 1300, hoehe: 160, auftritt: plopp, start: 0.55}
  - {was: kalender, x: 760, y: 1620, hoehe: 180, auftritt: plopp, start: 0.85}
  - {was: frage, x: 560, y: 1000, hoehe: 130, auftritt: plopp, start: 1.1}
```

## 2 Die Geschichte beginnt
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [540, 600]
sprecher: "Neues Baby, viel zu tun. Und dann die Briefe."
hervorhebung: [Baby]
oben: "Neues Baby. Viele Briefe."
blase: {text: "Wo fange ich nur an?", x: 60, y: 470, breite: 560, zipfel: [250, 1150]}
bausteine:
  - {was: vater, mimik: sorge, x: 250, y: 1880, hoehe: 740}
  - {was: stapel, x: 560, y: 1560, hoehe: 200, auftritt: plopp, start: 0.4}
  - {was: brief, x: 560, y: 1330, hoehe: 140, auftritt: plopp, start: 0.7}
  - {was: lotsin, pose: winken, x: 840, y: 1880, hoehe: 880, auftritt: rechts, start: 0.2}
```

## 3 Was ist das?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [540, 520]
sprecher: "Kindergeld ist Geld vom Staat für dein Kind. Jeden Monat."
hervorhebung: [jeden, Monat]
oben: "Kindergeld = Geld vom Staat für Kinder."
blase: {text: "Kindergeld gibt es jeden Monat für dein Kind.", x: 60, y: 500, breite: 620, zipfel: [790, 990]}
schilder:
  - {text: "Kindergeld", x: 330, y: 1040, farbe: gold, groesse: 60, start: 0.5}
bausteine:
  - {was: muenzen, x: 330, y: 1420, hoehe: 230, auftritt: plopp, start: 0.8}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 820, y: 1880, hoehe: 900}
```

## 4 Checkliste
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [450, 800]
sprecher: "Trifft das zu? Dein Kind ist unter achtzehn. Oder bis fünfundzwanzig in Ausbildung oder Studium."
untertitel: false
hervorhebung: [unter, "18", bis, "25"]
oben: "Ohne deutschen Pass: hängt vom Aufenthaltstitel ab."
checkliste:
  titel: "Trifft das auf dich zu?"
  y: 480
  punkte: ["Kind unter 18", "oder bis 25 in Ausbildung oder Studium"]
bausteine:
  - {was: vater, pose: denken, x: 260, y: 1880, hoehe: 700}
  - {was: lotsin, pose: halten, haelt: formular, x: 800, y: 1880, hoehe: 720}
```

## 5 Großer Bruch: der Betrag
```yaml
hintergrund: gold
strahlen: true
kamera: zoom-out
fokus: [540, 800]
sprecher: "Zweihundertneunundfünfzig Euro pro Kind und Monat. Stand zweitausendsechsundzwanzig."
untertitel: false
oben: "259 € je Kind und Monat (Stand 2026)."
knall: {text: "259 €", unten: "pro Kind und Monat", y: 470, groesse: 280, start: 0.4}
bausteine:
  - {was: muenzen, x: 190, y: 1300, hoehe: 160, auftritt: plopp, start: 0.7}
  - {was: stern, x: 860, y: 1250, hoehe: 130, auftritt: plopp, start: 0.9}
  - {was: vater, pose: freuen, mimik: freude, x: 540, y: 1880, hoehe: 620, auftritt: unten, start: 0.5}
```

## 6 Wo beantragen?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [540, 600]
sprecher: "Den Antrag stellst du bei der Familienkasse. Das geht auch online."
hervorhebung: [Familienkasse]
oben: "Zuständig: die Familienkasse."
blase: {text: "Antrag bei der Familienkasse, auch online.", x: 60, y: 450, breite: 620, zipfel: [800, 1000]}
schilder:
  - {text: "Familienkasse", x: 380, y: 1010, farbe: gold, groesse: 56, start: 0.5}
bausteine:
  - {was: vater, pose: handy, x: 250, y: 1880, hoehe: 740}
  - {was: formular, x: 520, y: 1380, hoehe: 200, auftritt: plopp, start: 0.8}
  - {was: lotsin, pose: stehen, x: 830, y: 1880, hoehe: 880}
```

## 7 Unterlage
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [540, 550]
sprecher: "Halte deine Steuer-Identifikationsnummer bereit. Die Familienkasse braucht sie."
hervorhebung: [Steuer-ID]
oben: "Steuer-ID = deine 11-stellige Nummer für die Steuer."
blase: {text: "Deine Steuer-ID brauchst du für den Antrag.", x: 60, y: 505, breite: 620, zipfel: [800, 1000]}
schilder:
  - {text: "Steuer-ID", x: 600, y: 1130, farbe: gold, groesse: 64, start: 0.4}
bausteine:
  - {was: vater, mimik: freundlich, x: 250, y: 1880, hoehe: 740}
  - {was: lotsin, pose: halten, haelt: formular, x: 830, y: 1880, hoehe: 880}
```

## 8 Die Falle
```yaml
hintergrund: navy
kamera: ruck
ruck_bei: 2.2
fokus: [540, 900]
sprecher: "Die Falle: Rückwirkend gibt es höchstens sechs Monate. Also früh beantragen."
hervorhebung: ["6", Monate, sechs, früh]
oben: "Kindergeld rückwirkend höchstens 6 Monate. Früh beantragen."
titel: {text: "Rückwirkend nur 6 Monate", groesse: 112, y: 560, start: 0.3}
bausteine:
  - {was: kalender, x: 700, y: 1000, hoehe: 200, auftritt: plopp, start: 0.6}
  - {was: vater, pose: denken, mimik: sorge, x: 280, y: 1880, hoehe: 700}
  - {was: kalender, x: 760, y: 1560, hoehe: 260, auftritt: plopp, start: 1.0}
```

## 9 Erleichterung
```yaml
hintergrund: gruen
kamera: zoom-in
fokus: [540, 500]
sprecher: "Antrag geschickt. Jetzt kann er sich wieder um das Baby kümmern."
hervorhebung: [geschickt]
oben: "Antrag gestellt."
blase: {text: "Erledigt. Das ging schneller als gedacht.", x: 60, y: 440, breite: 600, zipfel: [260, 1120]}
bausteine:
  - {was: vater, pose: freuen, x: 260, y: 1880, hoehe: 740}
  - {was: haken, x: 560, y: 1200, hoehe: 170, auftritt: plopp, start: 0.6}
  - {was: lotsin, pose: freuen, x: 830, y: 1880, hoehe: 860}
```

## 10 Prüf es mit SoLo
```yaml
hintergrund: hellblau
kamera: ruck
ruck_bei: 2.5
fokus: [540, 560]
sprecher: "Vielleicht steht euch mehr zu. Prüf es in etwa fünf Minuten mit SoLo."
hervorhebung: [SoLo]
oben: "SoLo zeigt, was wahrscheinlich oder möglich ist."
blase: {text: "Prüf es in etwa 5 Minuten mit SoLo.", x: 300, y: 500, breite: 560, zipfel: [820, 1000]}
bausteine:
  - {was: handy-app, x: 320, y: 1560, hoehe: 740, auftritt: unten, start: 0.2, bildschirm: {titel: "Das passt zu dir", zeilen: [{text: "Kindergeld", marke: haken}, {text: "?"}, {text: "?"}]}}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 850, y: 1880, hoehe: 880}
```

## 11 Schluss und Schleife
```yaml
basis: 1
kamera: zoom-in
ruck_bei: 99
sprecher: "Kindergeld: früh beantragen. Schick das jemandem, der gerade ein Baby bekommen hat."
hervorhebung: [früh]
titel: [{text: "Früh beantragen.", groesse: 100, start: 0.05, auftritt: plopp}, {text: "Rückwirkend höchstens 6 Monate.", y: 440, groesse: 84, start: 0.3, auftritt: plopp}]
unten: {text: "Schick das jemandem, der es braucht.", y: 760, start: 0.6}
hinweis: "Stand: 22.11.2026 · keine Rechtsberatung"
bausteine:
  - {was: vater, pose: freuen, x: 880, y: 1880, hoehe: 640}
  - {was: kalender, x: 420, y: 1400, hoehe: 230, auftritt: plopp, start: 0.3}
  - {was: haken, x: 560, y: 1300, hoehe: 120, auftritt: plopp, start: 0.8}
```
