#!/bin/bash
# Abschluss einer Aufgabe in einem Schritt: Konflikt-Check, Push, PR anlegen (oder vorhandenen nutzen),
# auf grüne Tests warten und dann mergen. Mergt NIE bei roten Tests. Aufruf: tools/pr-fertig.sh "Titel" "Beschreibung"
# Nur von einem eigenen Branch aus (nie main). Ohne Mergen: NUR_PR=1 tools/pr-fertig.sh ...
set -u
R=repos/Dcabrerizo-lab/claud
b=$(git rev-parse --abbrev-ref HEAD)
[ "$b" = main ] && { echo "Nicht von main aus."; exit 1; }
[ -n "$(git status --porcelain --untracked-files=no)" ] && { echo "Ungesicherte Änderungen: erst committen."; exit 1; }
tools/konflikt-check.sh | grep -q "KONFLIKT mit origin/main" && { echo "Konflikt mit main: erst git merge origin/main, lösen, testen."; exit 1; }
git -c push.negotiate=true push -q -u origin "$b" 2>&1 | grep -v '^remote:' || true
pr=$(gh api "$R/pulls?head=Dcabrerizo-lab:$b&state=open" --jq '.[0].number // empty')
if [ -z "$pr" ]; then
  pr=$(gh api $R/pulls -f title="${1:-$b}" -f head="$b" -f base=main -f body="${2:-}" --jq .number) || exit 1
fi
echo "PR #$pr"
[ "${NUR_PR:-0}" = 1 ] && exit 0
gh api -X PUT "$R/pulls/$pr/ccr/auto_merge" >/dev/null 2>&1 && { echo "Auto-Merge eingeschaltet."; exit 0; }
for i in $(seq 1 90); do
  sha=$(gh api "$R/pulls/$pr" --jq .head.sha)
  out=$(gh api "$R/commits/$sha/check-runs?per_page=100" --jq '.check_runs[]|"\(.status) \(.conclusion) \(.name)"')
  if echo "$out" | grep -qE "completed (failure|cancelled|timed_out)"; then echo "ROT – nicht gemergt:"; echo "$out" | grep -E "failure|cancelled|timed_out"; exit 1; fi
  if [ -n "$out" ] && ! echo "$out" | grep -qv '^completed'; then gh api -X PUT "$R/pulls/$pr/merge" -f merge_method=merge --jq .message; exit $?; fi
  sleep 30
done
echo "Zeitüberschreitung (45 Min.), PR #$pr bleibt offen."; exit 2
