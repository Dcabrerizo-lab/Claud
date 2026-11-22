#!/usr/bin/env python3
"""Liest ein Drehbuch (.md, .yaml/.yml oder .json) und gibt es als JSON auf stdout aus.

Markdown-Format:
  ---                      (Kopf als YAML: titel, datei, stimme, musik, aussprache …)
  titel: So hilft dir SoLo
  ---
  ## 1 Begrüßung            (jede Szene beginnt mit "## ")
  ```yaml                   (Szenen-Inhalt als YAML; Zaun optional)
  dauer: 4
  ...
  ```
Text außerhalb des YAML-Zauns in einer Szene wird ignoriert (Notizen erlaubt), sofern ein Zaun existiert.
"""
import json, re, sys
import yaml


def lade(pfad):
    text = open(pfad, encoding='utf-8').read()
    if pfad.endswith('.json'):
        return json.loads(text)
    if pfad.endswith(('.yaml', '.yml')):
        return yaml.safe_load(text)
    # Markdown
    kopf = {}
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.S)
    if m:
        kopf = yaml.safe_load(m.group(1)) or {}
        text = text[m.end():]
    teile = re.split(r'^## +(.*)$', text, flags=re.M)
    szenen = []
    for i in range(1, len(teile), 2):
        name, rumpf = teile[i].strip(), teile[i + 1]
        zaun = re.search(r'```(?:ya?ml)?\s*\n(.*?)```', rumpf, re.S)
        roh = zaun.group(1) if zaun else rumpf
        sz = yaml.safe_load(roh) or {}
        if not isinstance(sz, dict):
            raise SystemExit(f'Szene "{name}": YAML muss Schlüssel: Wert enthalten')
        sz.setdefault('name', name)
        szenen.append(sz)
    kopf['szenen'] = szenen
    return kopf


if __name__ == '__main__':
    d = lade(sys.argv[1])
    if not d.get('szenen'):
        raise SystemExit('Drehbuch enthält keine Szenen')
    json.dump(d, sys.stdout, ensure_ascii=False)
