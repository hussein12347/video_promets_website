h=open('/tmp/claude-0/mont/studio_g.html',encoding='utf-8').read()
def rep(old,new):
    global h
    assert h.count(old)==1,(h.count(old),old[:80]); h=h.replace(old,new)
rep("""function animNormId(s){ const m=String(s).match(/S\\s*0*(\\d{1,3})[\\s_\\-.]*IMG[\\s_\\-.]*0*(\\d{1,2})/i); return m?('S'+String(+m[1]).padStart(2,'0')+'_IMG'+(+m[2])):null; }""",
r"""/* ---- file-name → image / audio id. Tolerant of anything extra in the name: "Flow_x9_S01_IMG1 (2).png", "s1-img-2 final", "scene 3 image 2", "مشهد ٣ صورة ٢", "IMG2_S3" … ---- */
function anDigits(s){ return String(s).replace(/[٠-٩]/g,d=>d.charCodeAt(0)-0x660).replace(/[۰-۹]/g,d=>d.charCodeAt(0)-0x6F0); }
function anBaseName(name){ return anDigits(String(name||'').split(/[\\/]/).pop()).replace(/\.[a-z0-9]{2,5}$/i,''); }
function animImgCands(name){
  const t=anBaseName(name); const out=[]; let m;
  const add=(sc,im)=>{ const id='S'+String(+sc).padStart(2,'0')+'_IMG'+(+im); if(!out.includes(id)) out.push(id); };
  const SC='(?:(?<![a-z])(?:scene|shot|مشهد|لقطة|لقطه|S)|S(?=\\d))', IM='(?:IMG|image|picture|photo|pic|صورة|صوره)', SEP='[\\s_\\-.:#]*';
  const R1=new RegExp(SC+SEP+'0*(\\d{1,3})'+SEP+IM+SEP+'0*(\\d{1,2})(?!\\d)','gi'); while((m=R1.exec(t))) add(m[1],m[2]);
  const R2=new RegExp('(?<![a-z])'+IM+SEP+'0*(\\d{1,2})'+SEP+SC+SEP+'0*(\\d{1,3})(?!\\d)','gi'); while((m=R2.exec(t))) add(m[2],m[1]);
  const R3=/(?<![a-z0-9])S0*(\d{1,3})I0*(\d{1,2})(?![a-z0-9])/gi; while((m=R3.exec(t))) add(m[1],m[2]);
  return out;
}
function animNormId(s){ return animImgCands(s)[0]||null; }
/* the id a file name points to; with `ids` only an id that exists in the project counts */
function anSceneNoFromName(name){ const t=anBaseName(name); const m=t.match(/(?<![a-z])(?:scene|shot|مشهد|لقطة|لقطه|S)[\s_\-.:#]*0*(\d{1,3})(?!\d)/i)||t.match(/(?<![a-z0-9])S0*(\d{1,3})(?=[_\-\s.]|$)/i); return m?+m[1]:null; }
/* canonical form for comparing ids with file names: upper-case, one separator, no leading zeros after the S */
function anCanonId(x){ return anDigits(String(x||'')).toUpperCase().replace(/[\s\-.]+/g,'_').replace(/_+/g,'_').replace(/^S0*(\d)/,'S$1'); }
/* the project's image slot a file name points to. Understands: S03_IMG2 variants (any extra text),
   the slot's own id inside the name (S03_STAR_55c842d5.jpg → S03_STAR), and — when the name only has a scene
   number plus an element word (S02_BOOK_91216fb1.jpg) — the slot of that scene whose id / role / prompt fits the word. */
function animMatchImageId(name,ids){
  const c=animImgCands(name); if(!ids) return c[0]||null; const hit=c.find(x=>ids.includes(x)); if(hit) return hit;
  const base=anCanonId(anBaseName(name)); let best=null;
  ids.forEach(id=>{ const k=anCanonId(id); if(!k) return; let i=base.indexOf(k); while(i>=0){ const before=i===0||!/[A-Z0-9]/.test(base[i-1]), after=base[i+k.length]; const ok=before&&(after===undefined||!/[A-Z0-9]/.test(after)); if(ok){ if(!best||k.length>best.k.length) best={id,k}; break; } i=base.indexOf(k,i+1); } });
  if(best) return best.id;
  const sn=anSceneNoFromName(name); if(sn==null||!ANIM.cur) return null;
  const sc=ANIM.cur.scenes.find(s=>s.data&&+s.data.scene===sn); if(!sc) return null;
  const mine=animSceneImageIds(sc).filter(id=>ids.includes(id)); if(!mine.length) return null;
  const tok=base.replace(new RegExp('^S0*'+sn+'(?![0-9])_?'),'').replace(/(?:^|_)[0-9A-F]{6,}(?=_|$)/g,'').replace(/_?\(\d+\)$/,'').replace(/^_+|_+$/g,'');
  if(!tok) return null;
  const words=tok.split('_').filter(Boolean); let top=null, ts=0;
  mine.forEach(id=>{ const im=animPromptOf(ANIM.cur,id)||{}; const key=anCanonId(id).replace(new RegExp('^S0*'+sn+'(?![0-9])_?'),''); const pr=String(im.prompt||'').toUpperCase(); let sc2=0;
    words.forEach(w=>{ if(key===w) sc2+=4; else if(key&&(key.includes(w)||w.includes(key))&&key.length>1) sc2+=2.5; if(pr.includes(w)&&w.length>2) sc2+=2; if(/^(BG|BACK|BACKGROUND|BKG|BACKDROP|خلفيه|خلفية)$/.test(w)&&/^(background|scene|full)$/.test(im.role||'')) sc2+=3; });
    if(sc2>ts){ ts=sc2; top=id; } });
  return ts>=2?top:null;
}
function animAudioNo(name){
  const t=anBaseName(name);
  const m=t.match(/(?<![a-z])(?:scene|shot|voiceover|voice|vo|audio|narration|narr|S|مشهد|لقطة|لقطه|صوت|تعليق)[\s_\-.:#]*0*(\d{1,3})(?!\d)/i)||t.match(/^\s*0*(\d{1,3})(?!\d)/)||t.match(/(?:^|[\s_\-.(\[])0*(\d{1,3})(?:$|[\s_\-.)\]])/);
  return m?+m[1]:null;
}""")
rep("    const sid=kind==='image'?animNormId(f.name):null;\n    if(!o.noMatch&&sid&&animAllImageIds(p).includes(sid)){","    const sid=kind==='image'?animMatchImageId(f.name,animAllImageIds(p)):null;\n    if(!o.noMatch&&sid){")
rep("for(const f of files){ const id=animNormId(f.name); if(id&&ids.includes(id)){ await animSetImage(id,f); matched++; } else rest.push(f); }","for(const f of files){ const id=animMatchImageId(f.name,ids); if(id){ await animSetImage(id,f); matched++; } else rest.push(f); }")
rep("for(const f of files){ const m=f.name.match(/(?:scene|مشهد|s)[\\s_\\-]*0*(\\d{1,3})/i)||f.name.match(/^0*(\\d{1,3})\\D/); const sc=m&&p.scenes.find(s=>s.data.scene===+m[1]);","for(const f of files){ const no=animAudioNo(f.name); const sc=no!=null&&p.scenes.find(s=>s.data.scene===no);")
rep("  const nameOf=k=>anIdFromName(files[k].name);","  const nameOf=k=>animMatchImageId(files[k].name,slots);")
rep("const poolWhy=k=>{ const id=nameOf(k); if(!id) return 'اسمه مفيهوش رقم مشهد';","const poolWhy=k=>{ const id=nameOf(k); if(!id){ const sn=anSceneNoFromName(files[k].name); return sn==null?'اسمه مفيهوش رقم مشهد':'مشهد '+sn+' — مفيش مكان بنفس اسم الصورة'; }")
open('/tmp/claude-0/mont/studio_g.html','w',encoding='utf-8').write(h)
open('/tmp/claude-0/mont/serve/index.html','w',encoding='utf-8').write(h)
