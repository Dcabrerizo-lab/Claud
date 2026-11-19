#!/bin/sh
# Prüft, ob der aktuelle Stand mit main und mit den Branches anderer Sitzungen Konflikte hätte.
# Ändert nichts am Arbeitsstand. Aufruf: tools/konflikt-check.sh
# Flache Kopien haben keine gemeinsame Basis mit älteren Branches: dann meldet merge-tree falsche Konflikte
[ "$(git rev-parse --is-shallow-repository)" = true ] && { git fetch -q --unshallow origin 2>/dev/null || true; }
git fetch -q origin '+refs/heads/*:refs/remotes/origin/*' || { echo "fetch fehlgeschlagen"; exit 2; }
ich=$(git rev-parse --abbrev-ref HEAD); schlecht=0
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin | grep -v -e '/HEAD$' -e "^origin/$ich$"); do
  # schon in main enthalten (gemergt): kann keinen Konflikt mehr machen
  [ "$b" != origin/main ] && git merge-base --is-ancestor "$b" origin/main 2>/dev/null && continue
  if out=$(git merge-tree --write-tree --name-only HEAD "$b" 2>&1); then :; else
    schlecht=1; echo "KONFLIKT mit $b:"; echo "$out" | sed -n '2,$p' | grep -v '^$' | grep -v -e '^Auto-merging' -e '^CONFLICT' | sed 's/^/  Datei: /'
  fi
done
[ $schlecht = 0 ] && echo "Keine Konflikte mit main und anderen Branches."
exit $schlecht
