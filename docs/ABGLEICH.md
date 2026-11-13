# Abgleich mit den amtlichen Rechnern

Die Datei `Musterfaelle-Abgleich.csv` enthält 39 typische Haushalte mit dem Ergebnis der App. Ziel: Jeden Fall in den amtlichen Rechner eingeben und vergleichen. So findet man Fehler, die alle eigenen Tests nicht sehen können, weil sie auf demselben Wissen beruhen.

## So geht es (etwa 2 bis 3 Stunden)

1. Die CSV-Datei mit Excel, LibreOffice oder Numbers öffnen.
2. Für jede Zeile den genannten Rechner öffnen (Name in eine Suchmaschine eingeben):
   - **Wohngeldrechner** des Bundesministeriums für Wohnen, Stadtentwicklung und Bauwesen
   - **KiZ-Lotse** der Familienkasse (Bundesagentur für Arbeit)
   - **Elterngeldrechner** auf dem Familienportal des Bundesfamilienministeriums
   - **Arbeitslosengeldrechner** der Bundesagentur für Arbeit
   - **Krankengeldrechner** einer Krankenkasse
   - Grundsicherungsgeld: Rechner einer Beratungsstelle oder direkt mit dem Jobcenter durchsprechen
3. Die Werte aus der Spalte „Eingaben für den Rechner“ eintragen. Was dort nicht steht, auf „nein“ bzw. leer lassen.
4. Das Ergebnis in die Spalte „Amtlicher Rechner: Betrag“ schreiben.
5. In „Passt?“ eintragen:
   - **ja**, wenn der amtliche Betrag im Bereich der App liegt (z. B. App „220 € bis 270 €“, Rechner 245 €). Bei „etwa“ sind Abweichungen bis 10 € normal (die App rundet).
   - **nein**, wenn er außerhalb liegt oder die Einstufung nicht passt (App „unwahrscheinlich“, Rechner zahlt etwas).
6. Die Datei mit allen „nein“ zurückgeben. Jede Abweichung wird geprüft: Entweder hat die App einen Fehler (dann wird er behoben und ein Test dafür geschrieben) oder der Rechner fragt etwas, das die App bewusst vereinfacht (dann wird es dokumentiert).

## Hinweise

- Die App gibt beim Wohngeld bewusst einen Bereich an, weil sie die genauen Abzüge (Steuern, Versicherungen) nicht kennt. Der amtliche Rechner sollte innerhalb liegen.
- Beim Wohngeld fragt die App die Warmmiete, der Rechner die Bruttokaltmiete. Die Spalte nennt den passenden Wert (Warmmiete minus Heizkosten-Pauschale).
- Die Liste wird mit `node tools/musterfaelle.js` neu erzeugt, wenn sich Regeln ändern.
