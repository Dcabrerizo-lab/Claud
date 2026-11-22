#!/bin/sh
# Lädt die Piper-Stimmen nach ./stimmen (je ca. 60–75 MB, nicht ins Repo).
# Lizenzen (MODEL_CARD geprüft 22.11.2026), kommerzielle Nutzung erlaubt:
#   de_DE-thorsten_emotional-medium: Datensatz Thorsten-Voice CC0, feinjustiert aus thorsten-medium (Standard-Erzähler, Sprecher 0 "amused")
#   de_DE-thorsten-medium: Datensatz Thorsten-Voice CC0, Basismodell rdh CC0
#   de_DE-mls-medium:      Datensatz Multilingual LibriSpeech (openslr.org/94) CC BY 4.0 → Namensnennung nötig (nicht mehr verwendet)
# NICHT verwenden (nicht-kommerzielle Lizenz im Datensatz oder Basismodell): kerstin, karlsson, pavoque (Ryan CC BY-NC-SA),
#   thorsten-high (Basis lessac/Blizzard-Lizenz), eva_k, ramona (M-AILABS ohne klare Lizenz).
set -e
cd "$(dirname "$0")"; mkdir -p stimmen; cd stimmen
B=https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE
for v in thorsten_emotional/medium/de_DE-thorsten_emotional-medium thorsten/medium/de_DE-thorsten-medium mls/medium/de_DE-mls-medium; do
  n=$(basename "$v")
  [ -f "$n.onnx" ] || curl -sSfL -O "$B/$v.onnx"
  [ -f "$n.onnx.json" ] || curl -sSfL -O "$B/$v.onnx.json"
  curl -sSfL -o "MODEL_CARD-$n.txt" "$B/$(dirname "$v")/MODEL_CARD"
done
ls -la
