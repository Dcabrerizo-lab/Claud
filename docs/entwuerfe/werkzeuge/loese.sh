#!/bin/bash
# loest package.json (Vereinigung) und docs/*.md (beide Seiten) automatisch; gibt andere Konfliktdateien aus
for f in $(git diff --name-only --diff-filter=U); do
  case "$f" in
    package.json) python3 /home/claude/pkg-merge.py package.json && node -e "JSON.parse(require('fs').readFileSync('package.json'))" && git add package.json ;;
    docs/*.md) python3 -c "
import re,sys
p=sys.argv[1]; s=open(p).read()
s=re.sub(r'^<<<<<<< [^\n]*\n(.*?)^=======\n(.*?)^>>>>>>> [^\n]*\n', lambda m: m.group(1)+m.group(2), s, flags=re.S|re.M)
open(p,'w').write(s)" "$f" && git add "$f" ;;
    *) echo "OFFEN $f" ;;
  esac
done
