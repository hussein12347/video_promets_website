import re
h=open('studio_g.html',encoding='utf-8').read()
R=lambda f:open(f,encoding='utf-8').read()
def rep(a,b,count=1):
    global h
    n=h.count(a); assert n>=1,('missing',a[:90])
    if count==1: assert n==1,('multi',n,a[:90])
    h=h.replace(a,b)

def scope(css):
    out=[]
    for ln in css.split('\n'):
        if ln.startswith('.'):
            sel,rest=ln.split('{',1); sel=','.join('#ed '+x.strip() for x in sel.split(',')); ln=sel+'{'+rest
        elif ln.startswith('@media') and '{.' in ln:
            ln=ln.replace('{.','{#ed .')
        out.append(ln)
    return '\n'.join(out)
rep('</head>', R('pro4_font.css')+R('pro6_font.css')+scope(R('pro4_css.css'))+'</head>')

# ---- s4: professional selection cards (no animate block: "التحريك الاحترافي" stays its own panel) ----
OLD_S4 = """  const s4=`<div class="mt-cards" id="mt-styles">${AN_MONT_STYLES.map(s=>`<button type="button" class="mt-card${M.style===s.id?' on':''}" data-st="${s.id}" title="${esc(s.d)}"><span>${s.ic}</span><b>${s.t}</b><small>${s.d}</small></button>`).join('')}</div>
    <h5 class="mt2-h5">إيه اللي يظهر على الشاشة؟</h5><div class="mt2-opts" id="mt-show">${showOpts}</div>"""
NEW_S4 = """  const msShowOpts=AN_MONT_SHOW.map(o=>{ const dis=o.vid&&has&&!isVid; return `<button type="button" class="ms-show-btn${(dis?'anim':M.show)===o.id?' on':''}" data-show="${o.id}"${dis?' disabled':''}><span class="ms-oi">${o.ic}</span><b>${o.t}</b><small>${o.d}</small></button>`; }).join('');
  const s4=`<div class="ms-sec"><span class="ms-sec-title">أسلوب المونتاج</span><div class="ms-grid" id="mt-styles">${AN_MONT_STYLES.map(s=>`<button type="button" class="ms-card${M.style===s.id?' on':''}" data-st="${s.id}" aria-pressed="${M.style===s.id}" title="${esc(s.d)}"><span class="ms-ic">${s.ic}</span><b>${s.t}</b><small>${s.d}</small><span class="ms-badge">✓</span></button>`).join('')}</div></div>
    <div class="ms-sec"><span class="ms-sec-title">إيه اللي يظهر على الشاشة؟</span><div class="ms-show" id="mt-show">${msShowOpts}</div></div>"""
rep(OLD_S4, NEW_S4)

# ---- source tabs inside the AI-montage panel ----
rep("function anPanelMontage(box){\n  const p=ANIM.cur, M=anMontState(p);",
"function anPanelMontage(box){\n  if((ANIM._montMode||'media')!=='media') return anMontAltMode(box,ANIM._montMode);\n  const p=ANIM.cur, M=anMontState(p);")
rep('<nav class="mt2-pipe"','${anMontTabs(\'media\')}<nav class="mt2-pipe"')
rep("  const $m=q=>box.querySelector(q);\n","  const $m=q=>box.querySelector(q); anMontTabsBind(box);\n")
TABS = r"""
function anMontTabs(cur){ const T=[['media','🎥','من فيديو أو صوت','كلام ← مشاهد بالـ AI'],['image','🖼️','من صورة','تحريك صورة بالـ AI'],['quran','📖','ريلز قرآن','آيات + تلاوة + ترجمة'],['lab','🎬','طرق احترافية','هوك · احتفاظ · B-roll · قصة'],['smart','🧰','أدوات ذكية','إيقاع · مراجعة · فحص']];
  return '<div class="src-tabs" role="tablist" aria-label="مصدر المونتاج">'+T.map(t=>'<button type="button" role="tab" aria-selected="'+(cur===t[0])+'" class="src-tab'+(cur===t[0]?' on':'')+'" data-src="'+t[0]+'"><span class="src-ic">'+t[1]+'</span><b>'+t[2]+'</b><small>'+t[3]+'</small></button>').join('')+'</div>'; }
function anMontTabsBind(box){ box.querySelectorAll('.src-tab').forEach(b=>b.onclick=()=>{ if(b.classList.contains('on')) return; ANIM._montMode=b.dataset.src; animRenderPanel(); }); }
function anMontAltMode(box,mode){
  box.innerHTML='<div class="mt2"><div class="mt2-hero"><div><h3>🎞️ مونتاج بالذكاء الاصطناعي</h3><p>اختار مصدر الفيديو: ملف كلام، صورة تتحرّك، أو آيات قرآن بالتلاوة والترجمة.</p></div></div>'+anMontTabs(mode)+'<div id="mt-alt" class="mt-alt"></div></div>';
  anMontTabsBind(box); const host=box.querySelector('#mt-alt'); if(mode==='image') anPanelAI(host); else if(mode==='lab') anPanelLab(host); else if(mode==='smart') anPanelSmart(host); else anPanelQuran(host);
}
function anPanelAIinMont(box){ ANIM._montMode='image'; ANIM.panel='montage'; document.querySelectorAll('.ed-rb').forEach(x=>x.classList.toggle('on',x.dataset.p==='montage')); anPanelMontage(box); }
"""
rep("function anPanelMontage(box){", R('pro6_hafs_data.js')+R('pro5_align.js')+R('pro4_quran.js')+R('pro10_qstyles.js')+R('pro11_qmotion.js')+R('pro12_tlscroll.js')+R('pro13_qcom.js')+R('pro14_own.js')+TABS+"function anPanelMontage(box){")
# ---- engine: per-word reveal times (word-fade / word-pop / word-rise with enter.times) ----
rep("    if(a.cue||a.word){ r.cue=String(a.cue||a.word);","    if(Array.isArray(a.times)&&/^word-/.test(type)) r.times=a.times.map(x=>Math.max(0,num(x,0)));\n    if(a.cue||a.word){ r.cue=String(a.cue||a.word);")
rep("  function easeFn(name){\n    name=String(name||'power2.out').trim();","  function easeFn(name){\n    if(typeof name==='function') return name;\n    name=String(name||'power2.out').trim();")
rep("let ez=ease||'power2.out'; if(hasGsap&&/^steps\\.12$/.test(ez)) ez='steps(12)';","let ez=ease||'power2.out'; if(typeof ez==='string'&&hasGsap&&/^steps\\.12$/.test(ez)) ez='steps(12)';")
rep("        tw(tl,c,from,neutral(Object.keys(from)),T(l.enter.dur),l.enter.ease||ENTER_EASE[l.enter.type]||'power2.out',T(l.enter.at));",
"""        let _ez=l.enter.ease||ENTER_EASE[l.enter.type]||'power2.out', _d=T(l.enter.dur), _at=T(l.enter.at);
        if(l.enter.times&&l.enter.times.length>1&&/^word-/.test(l.enter.type)){ const ts=l.enter.times.map(x=>T(x)), N=ts.length; const fd=ts.map((x,q)=>Math.min(0.24*k,Math.max(0.06*k,q+1<N?ts[q+1]-x:0.3*k))); _at=0; _d=Math.max(0.05,ts[N-1]+fd[N-1]); _ez=u=>{ const tau=u*_d; let pos=0; for(let q=0;q<N;q++){ const pp=(tau-ts[q])/fd[q]; if(pp<=0) break; pos+=Math.min(1,pp); } return pos/N; }; }
        tw(tl,c,from,neutral(Object.keys(from)),_d,_ez,_at);""")

# ---- image animation no longer has its own rail item: it lives in the montage tabs ----
rep("{id:'ai',ic:'🪄',t:'تحريك صورة بالذكاء الاصطناعي'},","")
rep("['ai','hand','pro','finish']","['hand','pro','finish']")
rep("ai:(typeof anPanelAI==='function'?anPanelAI:anPanelJson),","ai:anPanelAIinMont,")
rep("ANIM.panel='ai'; animRenderPanel(); };","ANIM._montMode='image'; ANIM.panel='montage'; animRenderPanel(); };")

rep('const ARABIC=/[\u0600-\u06ff]/;','const ARABIC=/[\u0600-\u06ff\ue000-\uf8ff]/;')
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('pro4 ok')

