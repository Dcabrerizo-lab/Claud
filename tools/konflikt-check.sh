#!/bin/sh
# Prüft, ob der aktuelle Stand mit main und mit den Branches anderer Sitzungen Konflikte hätte.
# Ändert nichts am Arbeitsstand. Aufruf: tools/konflikt-check.sh
git fetch -q origin || { echo "fetch fehlgeschlagen"; exit 2; }
ich=$(git rev-parse --abbrev-ref HEAD); schlecht=0
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin | grep -v -e '/HEAD$' -e "^origin/$ich$"); do
  if out=$(git merge-tree --write-tree --name-only HEAD "$b" 2>&1); then :; else
    schlecht=1; echo "KONFLIKT mit $b:"; echo "$out" | sed -n '2,$p' | grep -v '^$' | grep -v -e '^Auto-merging' -e '^CONFLICT' | sed 's/^/  Datei: /'
  fi
done
[ $schlecht = 0 ] && echo "Keine Konflikte mit main und anderen Branches."
exit $schlecht
