import re,base64,struct,sys
h=open('studio_g.html',encoding='utf-8').read()
AR=re.compile(r'[\u0600-\u06FF]')
def norm(s):
    s=re.sub(r'\s+',' ',s).strip()
    return re.sub(r'[0-9\u0660-\u0669\u06F0-\u06F9]+','#',s)
def fnv(s):
    x=2166136261
    for ch in s:
        x^=ord(ch); x=(x*16777619)&0xFFFFFFFF
    return x
S=set()
def add(p):
    p=p.strip()
    if AR.search(p) and 2<=len(p)<=500:
        S.add(norm(p))
        for sub in re.split(r'[·—–|:،؛;•/()\[\]….!?؟]+',p):
            sub=sub.strip()
            if AR.search(sub) and 3<=len(sub)<=500: S.add(norm(sub))
# variant A: ${..} replaced by '#', variant B: split at ${..}
for variant in (0,1,2):
    t=h
    if variant==2: t=t.replace('${','\n').replace('}','\n')
    else: t=re.sub(r'\$\{[^{}]*\}','#' if variant==0 else '\n',t)
    for p in re.split(r'[<>`"\'\\]|\n',t): add(p)
# also strip leading/trailing punctuation/emoji variants
extra=set()
for s in S:
    s2=re.sub(r'^[^\u0600-\u06FF#]+|[^\u0600-\u06FF#]+$','',s)
    if s2 and s2!=s and AR.search(s2): extra.add(s2)
S|=extra
S|={'مزامنة','لمسات','آية','مفيش علامات في المشهد ده.','البسملة مش هتتضاف','# آية · البسملة مش هتتضاف','ريلز / شورتس','الافتراضي / شرح'}
H=sorted({fnv(s) for s in S})
open('i18n_inv.js','w').write("const I18N_INV='"+base64.b64encode(struct.pack('<%dI'%len(H),*H)).decode()+"';\n")
print(len(S),len(H))
