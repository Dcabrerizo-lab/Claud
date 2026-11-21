#!/bin/bash
# $1 = PR-Nummer. Wartet auf Checks, merged bei grün.
pr=$1; R=repos/Dcabrerizo-lab/claud
for i in $(seq 1 90); do
  sha=$(gh api $R/pulls/$pr --jq .head.sha)
  out=$(gh api "$R/commits/$sha/check-runs?per_page=100" --jq '.check_runs[]|"\(.status) \(.conclusion) \(.name)"')
  if echo "$out" | grep -qE "completed (failure|cancelled|timed_out)"; then echo "ROT PR $pr"; echo "$out" | grep -E "failure|cancelled|timed_out"; exit 1; fi
  if [ -n "$out" ] && ! echo "$out" | grep -qv "^completed"; then
    gh api -X PUT $R/pulls/$pr/merge -f merge_method=merge --jq .message; exit 0; fi
  sleep 30
done; echo "ZEITÜBERSCHREITUNG PR $pr"; exit 2
