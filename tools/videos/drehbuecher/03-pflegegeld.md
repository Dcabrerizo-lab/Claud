---
titel: Pflegegeld
datei: 03-pflegegeld
serie: SoLo erklärt
folge: 3
stimme: lotsin
tempo: 1.1
musik: ja
musik_abstand_db: 25
untertitel: auto
untertitel_y: 1060
hervorhebung: [SoLo]
---

# Folge 3 · Pflegegeld

Übertragen aus docs/videos/drehbuecher/3-pflegegeld.md (Branch claude/b-videos, Stand nach Faktenprüfung,
Commit a72438cb). Texte und Zahlen wörtlich aus dem Drehbuch; Quellen siehe dort (§ 37 SGB XI; BMG „Pflegebedürftig.
Was nun?“, abgerufen 21./22.11.2026). Figuren: Tochter = Baustein `pflegerin`, Mutter = `rentnerin`.
Für die Gutachterin gibt es keinen Baustein: dargestellt mit Formular und Lupe.
Layout-Regel: Figuren-Köpfe unterhalb y 1170, Untertitel bei y 1060, Bildunterschrift oben – kein Text über Figuren.

## 1 Haken
```yaml
hintergrund: warm
kamera: ruck
ruck_bei: 1.6
fokus: [540, 900]
sprecher: "Du pflegst jemanden zu Hause, ganz allein? Dann geht es um Pflegegeld."
hervorhebung: [Pflegegeld]
titel: {text: "Du pflegst zu Hause – und keiner hilft?", groesse: 100, start: 0}
unten: {text: "Pflegegeld: Geld, wenn jemand zu Hause gepflegt wird.", y: 700, start: 0.6}
bausteine:
  - {was: rentnerin, mimik: freundlich, x: 840, y: 1880, hoehe: 560}
  - {was: pflegerin, mimik: sorge, x: 300, y: 1880, hoehe: 700}
  - {was: stapel, x: 560, y: 1380, hoehe: 150, auftritt: plopp, start: 0.3}
  - {was: mappe, x: 640, y: 1250, hoehe: 130, auftritt: plopp, start: 0.6}
  - {was: kalender, x: 540, y: 1620, hoehe: 160, auftritt: plopp, start: 0.9}
```

## 2 Die Geschichte beginnt
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [540, 600]
sprecher: "Ihre Mutter braucht jeden Tag Hilfe. Sie pflegt neben der Arbeit."
hervorhebung: [jeden, Tag]
oben: "Pflege neben der Arbeit."
blase: {text: "Ich schaffe das kaum noch.", x: 60, y: 470, breite: 560, zipfel: [240, 1150]}
bausteine:
  - {was: pflegerin, mimik: sorge, x: 230, y: 1880, hoehe: 720}
  - {was: rentnerin, pose: winken, x: 540, y: 1880, hoehe: 600}
  - {was: lotsin, pose: winken, x: 860, y: 1880, hoehe: 860, auftritt: rechts, start: 0.2}
```

## 3 Was ist das?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [540, 560]
sprecher: "Die Pflegekasse zahlt es an die gepflegte Person. Sie kann es weitergeben."
hervorhebung: [Pflegekasse]
oben: "Pflegekasse = gehört zur Krankenkasse."
blase: {text: "Das Geld geht an deine Mutter. Sie kann es weitergeben.", x: 60, y: 500, breite: 640, zipfel: [830, 1040]}
schilder:
  - {text: "Pflegekasse", x: 330, y: 1000, farbe: gold, groesse: 60, start: 0.4}
bausteine:
  - {was: muenzen, x: 330, y: 1200, hoehe: 120, auftritt: plopp, start: 0.9}
  - {was: rentnerin, mimik: freude, x: 210, y: 1880, hoehe: 580}
  - {was: pflegerin, x: 500, y: 1880, hoehe: 640}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 860, y: 1880, hoehe: 840}
```

## 4 Checkliste
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [450, 800]
sprecher: "Trifft das zu? Pflegegrad zwei oder höher. Und die Pflege klappt zu Hause, etwa durch Familie."
untertitel: false
hervorhebung: [Pflegegrad, "2"]
oben: "Pflegegrad = Stufe von 1 bis 5, je nach Hilfebedarf."
checkliste:
  titel: "Trifft das auf dich zu?"
  y: 480
  punkte: ["Pflegegrad 2 oder höher", "Pflege zu Hause, zum Beispiel durch Familie"]
bausteine:
  - {was: rentnerin, x: 220, y: 1880, hoehe: 620}
  - {was: pflegerin, pose: denken, x: 480, y: 1880, hoehe: 680}
  - {was: lotsin, pose: halten, haelt: formular, x: 840, y: 1880, hoehe: 700}
```

## 5 Großer Bruch: die Beträge
```yaml
hintergrund: gold
strahlen: true
kamera: zoom-out
fokus: [540, 800]
sprecher: "Je nach Pflegegrad sind das dreihundertsiebenundvierzig bis neunhundertneunzig Euro im Monat."
untertitel: false
hervorhebung: ["347", "990", "€"]
oben: "Je nach Pflegegrad 2 bis 5, Stand 2026."
knall: {text: "347 € bis 990 €", unten: "im Monat", y: 490, groesse: 150, start: 0.4}
schilder:
  - {text: "347 €", x: 140, y: 1180, farbe: warm, groesse: 50, start: 1.2}
  - {text: "599 €", x: 350, y: 1180, farbe: warm, groesse: 50, start: 1.7}
  - {text: "800 €", x: 560, y: 1180, farbe: warm, groesse: 50, start: 2.2}
  - {text: "990 €", x: 770, y: 1180, farbe: warm, groesse: 50, start: 2.7}
bausteine:
  - {was: rentnerin, mimik: freude, x: 330, y: 1880, hoehe: 560, auftritt: unten, start: 0.5}
  - {was: pflegerin, pose: freuen, x: 700, y: 1880, hoehe: 600, auftritt: unten, start: 0.6}
```

## 6 Wo beantragen?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [540, 600]
sprecher: "Den Antrag stellst du bei der Pflegekasse. Das geht sogar am Telefon."
hervorhebung: [Telefon, Pflegekasse]
oben: "Antrag auch telefonisch, auch durch Angehörige mit Vollmacht."
blasen:
  - {text: "Pflegekasse, guten Tag.", x: 60, y: 520, breite: 470, zipfel: [250, 1170], groesse: 52, start: 0.4, ende: 1.3}
  - {text: "Ein Anruf bei der Pflegekasse reicht für den Start.", x: 320, y: 760, breite: 560, zipfel: [860, 1060], start: 1.4}
bausteine:
  - {was: pflegerin, pose: handy, x: 210, y: 1880, hoehe: 700}
  - {was: rentnerin, x: 500, y: 1880, hoehe: 600}
  - {was: lotsin, pose: stehen, x: 860, y: 1880, hoehe: 820}
```

## 7 Die Begutachtung
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [540, 560]
sprecher: "Dann prüft eine Gutachterin, wie viel Hilfe nötig ist."
hervorhebung: [Gutachterin]
oben: "Medizinischer Dienst = prüft im Auftrag der Pflegekasse."
blase: {text: "Erzähl ehrlich, was im Alltag schwerfällt.", x: 60, y: 500, breite: 620, zipfel: [850, 1040]}
bausteine:
  - {was: formular, x: 470, y: 1240, hoehe: 200, auftritt: plopp, start: 0.4}
  - {was: lupe, x: 600, y: 1240, hoehe: 150, auftritt: plopp, start: 0.8}
  - {was: rentnerin, x: 200, y: 1880, hoehe: 600}
  - {was: pflegerin, x: 480, y: 1880, hoehe: 620}
  - {was: lotsin, pose: stehen, x: 860, y: 1880, hoehe: 840}
```

## 8 Die Falle
```yaml
hintergrund: navy
kamera: ruck
ruck_bei: 2.5
fokus: [540, 900]
sprecher: "Die Falle: Jedes halbe Jahr ist ein Beratungsbesuch Pflicht. Sonst wird gekürzt."
hervorhebung: [halbe, Jahr, "6", Monate]
oben: "Pflicht: alle 6 Monate Beratung zu Hause (Pflegegrad 2–5)."
titel: {text: "Beratungsbesuch nicht vergessen", groesse: 92, y: 540, start: 0.3}
schilder:
  - {text: "P̶f̶l̶e̶g̶e̶g̶e̶l̶d̶ ̶g̶e̶k̶ü̶r̶z̶t̶", x: 600, y: 1400, farbe: warm, groesse: 40, start: 2.4}
bausteine:
  - {was: pflegerin, mimik: sorge, x: 230, y: 1880, hoehe: 700}
  - {was: kalender, x: 640, y: 1340, hoehe: 200, auftritt: plopp, start: 0.6}
  - {was: brief, x: 800, y: 1660, hoehe: 160, auftritt: plopp, start: 2.0}
```

## 9 Erleichterung
```yaml
hintergrund: gruen
kamera: zoom-in
fokus: [540, 500]
sprecher: "Antrag gestellt, Termin notiert. Endlich ein Plan."
hervorhebung: [Plan]
oben: "Antrag gestellt. Beratung im Kalender."
blase: {text: "Gut, dass wir gefragt haben.", x: 60, y: 470, breite: 560, zipfel: [230, 1250]}
bausteine:
  - {was: rentnerin, mimik: freude, x: 230, y: 1880, hoehe: 620}
  - {was: pflegerin, pose: freuen, x: 560, y: 1880, hoehe: 680}
  - {was: kalender, x: 830, y: 1380, hoehe: 200, auftritt: plopp, start: 0.6}
  - {was: haken, x: 900, y: 1200, hoehe: 110, auftritt: plopp, start: 1.1}
```

## 10 Prüf es mit SoLo
```yaml
hintergrund: hellblau
kamera: ruck
ruck_bei: 2.8
fokus: [540, 560]
sprecher: "Welcher Pflegegrad passt? Schätz es mit SoLo ein. Entscheiden tut die Pflegekasse."
hervorhebung: [SoLo]
oben: "Nur eine Einschätzung. Entscheiden tut die Pflegekasse."
blase: {text: "Mit SoLo den Pflegegrad selbst einschätzen.", x: 300, y: 545, breite: 570, groesse: 52, zipfel: [830, 1000]}
bausteine:
  - {was: handy-app, x: 320, y: 1560, hoehe: 720, auftritt: unten, start: 0.2, bildschirm: {titel: "Pflegegrad selbst einschätzen", zeilen: [{text: "Pflegegrad 2", marke: formular}, {text: "Pflegegrad 3", marke: formular}, {text: "Pflegegrad 4", marke: formular}, {text: "Pflegegrad 5", marke: formular}]}}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 850, y: 1880, hoehe: 880}
```

## 11 Schluss und Schleife
```yaml
basis: 1
kamera: zoom-in
ruck_bei: 99
sprecher: "Du pflegst? Du musst nicht alles allein tragen. Schick das jemandem, der pflegt."
hervorhebung: [nicht, allein]
titel: {text: "Pflege zu Hause? Pflegegeld prüfen.", groesse: 104, start: 0.05, auftritt: plopp}
unten: {text: "Schick das jemandem, der es braucht.", y: 700, start: 0.6}
hinweis: "Stand: 22.11.2026 · keine Rechtsberatung"
bausteine:
  - {was: lotsin, pose: halten, haelt: mappe, x: 975, y: 1880, hoehe: 700, ebene: 1}
  - {was: pflegerin, pose: stehen, mimik: freude, x: 870, y: 1880, hoehe: 600, ebene: 2}
  - {was: stapel, x: 300, y: 1420, hoehe: 140, auftritt: plopp, start: 0.4}
```
