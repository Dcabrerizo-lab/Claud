# Löst Konflikte in package.json-Testskripten: Vereinigung der "&&"-Befehle (Reihenfolge von main, eigene neue hinten).
import re,sys
p=sys.argv[1]; s=open(p).read()
def merge(m):
    ours,theirs=m.group(1).splitlines(),m.group(2).splitlines()
    res=[]
    for t in theirs:
        k=re.match(r'\s*"([^"]+)":',t); 
        o=next((x for x in ours if k and re.match(r'\s*"%s":'%re.escape(k.group(1)),x)),None)
        if o and o!=t:
            val=lambda l: re.search(r':\s*"(.*)"',l).group(1)
            tc=val(t).split(' && '); oc=val(o).split(' && ')
            tc+= [c for c in oc if c not in tc]
            t=t.replace(val(t),' && '.join(tc))
        res.append(t)
    return '\n'.join(res)+'\n'
s=re.sub(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n',merge,s,flags=re.S)
open(p,'w').write(s)
