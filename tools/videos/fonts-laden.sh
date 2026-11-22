#!/bin/sh
# Lädt die beiden Schriften (Google Fonts, SIL Open Font License) nach ./fonts. Nicht ins Repo committen.
set -e
cd "$(dirname "$0")"; mkdir -p fonts
UA="Mozilla/5.0"
hole() { # $1 Familie+Gewicht, $2 Zieldatei
  url=$(curl -sSf -A "$UA" "https://fonts.googleapis.com/css2?family=$1" | grep -o 'https://fonts.gstatic.com/[^)]*\.ttf' | head -1)
  curl -sSf -o "fonts/$2" "$url"; echo "fonts/$2"
}
[ -f fonts/SchibstedGrotesk-ExtraBold.ttf ] || hole "Schibsted+Grotesk:wght@800" SchibstedGrotesk-ExtraBold.ttf
[ -f fonts/AtkinsonHyperlegible-Bold.ttf ] || hole "Atkinson+Hyperlegible:wght@700" AtkinsonHyperlegible-Bold.ttf
