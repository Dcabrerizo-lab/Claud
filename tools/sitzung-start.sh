#!/bin/bash
# Läuft automatisch zu Beginn jeder Claude-Sitzung (Hook in .claude/settings.json). Ändert keinen Code.
# Holt den neuesten Stand, installiert Abhängigkeiten nur wenn nötig und zeigt offene PRs und Branches.
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0
git fetch -q origin '+refs/heads/*:refs/remotes/origin/*' 2>/dev/null
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 timeout 300 npm ci --no-audit --no-fund >/dev/null 2>&1 && echo "Abhängigkeiten installiert."
fi
echo "Stand main: $(git log -1 --format='%h %s' origin/main 2>/dev/null)"
if command -v gh >/dev/null; then
  echo "Offene PRs:"; gh api 'repos/Dcabrerizo-lab/claud/pulls?state=open&per_page=30' --jq '.[]|"  #\(.number) \(.head.ref): \(.title)"' 2>/dev/null || echo "  (nicht abrufbar)"
fi
echo "Branches mit Arbeit, die nicht in main ist:"
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin | grep -v -e '/HEAD$' -e '^origin/main$'); do
  git merge-base --is-ancestor "$b" origin/main 2>/dev/null || echo "  $b ($(git log -1 --format=%cr "$b"))"
done | head -30
exit 0
