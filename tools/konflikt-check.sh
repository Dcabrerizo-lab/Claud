#!/bin/sh
# Prüft, ob der aktuelle Stand mit main, den Test-Update-Zweigen und den Branches mit offenem PR Konflikte hätte.
# Alte Branches ohne offenen PR werden übersprungen (kosten nur Zeit und melden irrelevante Konflikte).
# Ändert nichts am Arbeitsstand. Aufruf: tools/konflikt-check.sh   (ALLE=1 prüft wie früher alle Branches)
# Flache Kopien haben keine gemeinsame Basis mit älteren Branches: dann meldet merge-tree falsche Konflikte
[ "$(git rev-parse --is-shallow-repository)" = true ] && { git fetch -q --unshallow origin 2>/dev/null || true; }
git fetch -q --prune origin '+refs/heads/*:refs/remotes/origin/*' || { echo "fetch fehlgeschlagen"; exit 2; }
ich=$(git rev-parse --abbrev-ref HEAD); schlecht=0
alle=$(git for-each-ref --format='%(refname:short)' refs/remotes/origin | grep -v -e '/HEAD$' -e "^origin/$ich$" -e '^origin$')
ziele=$(echo "$alle" | grep -e '^origin/main$' -e '^origin/claude/test-update-')
# Branches mit offenem PR (über gh); geht das nicht, wie früher alle Branches prüfen
repo=$(git remote get-url origin | sed -E 's#.*github\.com[:/]##; s#\.git$##; s#^git/##')
if [ -z "$ALLE" ] && prs=$(gh api "repos/$repo/pulls?state=open&per_page=100" --jq '.[].head.ref' 2>/dev/null); then
  for p in $prs; do echo "$alle" | grep -qx "origin/$p" && ziele="$ziele
origin/$p"; done
else
  [ -z "$ALLE" ] && echo "Hinweis: offene PRs nicht abrufbar, prüfe alle Branches."
  ziele=$alle
fi
for b in $(echo "$ziele" | sort -u); do
  # schon in main enthalten (gemergt): kann keinen Konflikt mehr machen
  [ "$b" != origin/main ] && git merge-base --is-ancestor "$b" origin/main 2>/dev/null && continue
  if out=$(git merge-tree --write-tree --name-only HEAD "$b" 2>&1); then :; else
    schlecht=1; echo "KONFLIKT mit $b:"; echo "$out" | sed -n '2,$p' | grep -v '^$' | grep -v -e '^Auto-merging' -e '^CONFLICT' | sed 's/^/  Datei: /'
  fi
done
[ $schlecht = 0 ] && echo "Keine Konflikte mit main, Test-Update-Zweigen und offenen PRs."
exit $schlecht
