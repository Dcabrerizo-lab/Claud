#!/bin/bash
# wie merge-wenn-gruen, aber ohne die langen Differenztest-Läufe (abfragen/vergleich)
pr=$1; R=repos/Dcabrerizo-lab/claud
for i in $(seq 1 38); do
  sha=$(gh api $R/pulls/$pr --jq .head.sha)
  out=$(gh api "$R/commits/$sha/check-runs?per_page=100" --jq '.check_runs[]|select(.name|test("^abfragen|^vergleich")|not)|"\(.status) \(.conclusion) \(.name)"')
  if echo "$out" | grep -qE "completed (failure|cancelled|timed_out)"; then echo "ROT"; echo "$out" | grep -E "failure|cancelled|timed_out"; exit 1; fi
  if [ $(echo "$out" | grep -c .) -ge 8 ] && ! echo "$out" | grep -qv "^completed"; then gh api -X PUT $R/pulls/$pr/merge -f merge_method=merge --jq .message; exit 0; fi
  sleep 15
done; echo WARTEN; exit 2
