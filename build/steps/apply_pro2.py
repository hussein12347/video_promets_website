import re
h=open('studio_g.html',encoding='utf-8').read()
R=lambda f:open(f,encoding='utf-8').read()
def rep(a,b,count=1):
    global h
    n=h.count(a); assert n>=1,('missing',a[:90])
    if count==1: assert n==1,('multi',n,a[:90])
    h=h.replace(a,b)
NEW_TR=['blur-dissolve','cross-zoom','zoom-through','film-burn','clock','split-h','split-v','open-h','open-v','iris-box','slice-h','stripes','mosaic','rgb-split','flip-h','flip-v','cube-left','cube-right','wave','curtain','pop-in','drop-in','flash-zoom']
AR={'blur-dissolve':'ذوبان ضبابي','cross-zoom':'زووم متقاطع','zoom-through':'عبور بالزووم','film-burn':'حرق فيلم','clock':'عقارب الساعة','split-h':'انفتاح أفقي','split-v':'انفتاح رأسي','open-h':'ستارة من المنتصف','open-v':'نافذة رأسية','iris-box':'إطار متّسع','slice-h':'شرائح أفقية','stripes':'شرائط رأسية','mosaic':'فسيفساء','rgb-split':'انشقاق ألوان','flip-h':'قلب أفقي','flip-v':'قلب رأسي','cube-left':'مكعب لليسار','cube-right':'مكعب لليمين','wave':'موجة','curtain':'ستارة جانبية','pop-in':'ظهور بوب','drop-in':'سقوط مرتد','flash-zoom':'فلاش زووم'}
# transitions list + labels
rep("'whip','page'];","'whip','page',"+",".join("'%s'"%k for k in NEW_TR)+"];")
rep("page:'قلب صفحة'};","page:'قلب صفحة',"+",".join("['%s']:'%s'"%(k,AR[k]) for k in NEW_TR)+"};")
# composite hook
rep("    function composite(ctx,W,H,A,B,type,p,lin){", R('pro2_engine.js')+"\n    function composite(ctx,W,H,A,B,type,p,lin){")
rep("      else dB();\n      ctx.restore();\n    }","      else if(NEWTR[type]) NEWTR[type](ctx,W,H,A,B,p,lin);\n      else dB();\n      ctx.restore();\n    }")
rep("return {layout:lay, total:lay.total, renderFrame,","return {layout:lay, total:lay.total, transDraw, renderFrame,")
# bleed flag
rep("      const defEnter=type==='mark'?","      o.bleed=!!l.bleed;\n      const defEnter=type==='mark'?")
# safe fit
rep("  function hash(n){","  const SAFEFIT={on:true,m:0.05};\n  function hash(n){")
rep("opts=Object.assign({hand:project.hand||{show:true}},opts||{});","opts=Object.assign({hand:project.hand||{show:true}},opts||{}); SAFEFIT.on=project.safeFit!==false; SAFEFIT.m=Math.max(0,Math.min(0.15,+project.safeMargin||0.05));")
rep("const mx=W*0.02+bs.w/2, my=H*0.02+bs.h/2;","const sfm=SAFEFIT.on?SAFEFIT.m:0.02; const mx=W*sfm+bs.w/2, my=H*sfm+bs.h/2;")
SAFE="""      if(SAFEFIT.on&&!l.bleed&&l.type!=='mark'&&l.type!=='video'&&!(l.type==='image'&&l.fit==='cover')){
        const rr=(l.rot||0)*PI/180, ca=Math.abs(Math.cos(rr)), sa=Math.abs(Math.sin(rr));
        const rw=bs.w*ca+bs.h*sa, rh=bs.w*sa+bs.h*ca, aw=W*(1-2*SAFEFIT.m), ah=H*(1-2*SAFEFIT.m);
        if(rw>1&&rh>1&&(l.type==='text'||(rw<W*0.9&&rh<H*0.9))){
          const f=Math.min(1,aw/rw,ah/rh); if(f<1) v.s*=f;
          const hw=rw*f/2, hh=rh*f/2, mxx=W*SAFEFIT.m, myy=H*SAFEFIT.m;
          cx=Math.max(mxx+hw,Math.min(W-mxx-hw,cx)); cy=Math.max(myy+hh,Math.min(H-myy-hh,cy)); } }
"""
rep("      if(linkTo&&alpha>0.01&&!geo){",SAFE+"      if(linkTo&&alpha>0.01&&!geo){")
# sfx
rep("    if(type==='scribble') return scheduleScribble(actx,dest,when,vol,sdur||1.5);","    if(type==='scribble') return scheduleScribble(actx,dest,when,vol,sdur||1.5);\n    if(SFX2[type]) return scheduleSfx2(actx,dest,when,type,vol,sdur);")
rep("  function scheduleScribble(actx,dest,when,vol,dur){",R('pro2_sfx.js')+"\n  function scheduleScribble(actx,dest,when,vol,dur){")
rep("ev.push({at:L.start,type:'whoosh',vol:(sf.vol!=null?sf.vol:0.5)});","{ const _m=sf.tr||'auto', _t=_m==='off'?null:(_m==='auto'?(TRSND[L.data.transition.type]||'whoosh'):_m); if(_t) ev.push({at:L.start,type:_t,vol:(sf.vol!=null?sf.vol:0.5)}); }")
rep("loadImage, scheduleSfx, cleanCaption,","loadImage, scheduleSfx, sfxCatalog:SFX_CAT, sfxCats:SFX_CATS, sfxAll:SFX_CAT.map(x=>x[0]), sfxLen:t=>SFX2[t]?SFX2[t].l:({pop:0.18,click:0.06,thud:0.35,ding:1.2,riser:1.6,scribble:1.5}[t]||0.55), cleanCaption,")
rep("g.gain.value=Math.max(0,vol)*0.9;","g.gain.value=Math.max(0,vol)*0.9*({pop:4,click:3}[type]||1);")
# defaults / engine project
rep("p.sfx=p.sfx||{on:true, vol:0.45};","p.sfx=Object.assign({on:true, vol:0.45, tr:'auto'},p.sfx||{});")
rep("{snap:true, safe:false, grid:false}","{snap:true, safe:false, grid:false, fit:true, fitm:0.05}")
rep("look:p.look, sfx:p.sfx,","look:p.look, sfx:p.sfx, safeFit:p.guides.fit!==false, safeMargin:p.guides.fitm||0.05,")
# settings UI
rep('<span>شبكة الأثلاث</span></label></div>','<span>شبكة الأثلاث</span></label><label class="an-sw"><input type="checkbox" id="st-sfit" ${p.guides.fit!==false?\'checked\':\'\'}><span>إبقاء كل العناصر داخل الحدود الآمنة تلقائيًا (تصغير/إزاحة أي عنصر يخرج)</span></label><label class="pn-row2"><span class="lbl">هامش الأمان</span><select id="st-sfitm">${[[0.03,\'3%\'],[0.05,\'5%\'],[0.07,\'7%\'],[0.1,\'10%\']].map(([v,t])=>`<option value="${v}"${Math.abs((p.guides.fitm||0.05)-v)<0.001?\' selected\':\'\'}>${t}</option>`).join(\'\')}</select></label></div>')
rep("ch('st-scr',t=>{ p.scribble.on=t.checked; });","ch('st-scr',t=>{ p.scribble.on=t.checked; }); ch('st-sfit',t=>{ p.guides.fit=t.checked; }); ch('st-sfitm',t=>{ p.guides.fitm=+t.value; });")
# export wav
rep("const Ld={scribble:6,ding:1.3,riser:1.7}[type]||0.7;","const Ld=(E.sfxLen&&E.sfxLen(type))||{scribble:6,ding:1.3,riser:1.7}[type]||0.7;")
rep("for(const t of ['whoosh','pop','scribble','click','thud','ding','riser']) root.file","for(const t of Array.from(new Set(['whoosh','pop','scribble','click','thud','ding','riser'].concat((ANIM.engine&&ANIM.engine.sfxAll)||[])))) root.file")
# UI functions + panel wiring
rep("function anPanelTrans(box){",R('pro2_ui.js')+"\nfunction anPanelTrans(box){")
rep("""'<div class="pn-trans">'+Object.entries(AN_TRANS_AR).map(([k,v])=>'<button type="button" data-t="'+k+'" class="'+(tr.type===k?'on':'')+'"><span class="pn-tr-ic pn-tr-'+k.split('-')[0]+'"></span>'+v+'</button>').join('')+'</div>'+""","anTransGrid(tr.type)+")
rep("$$('.pn-trans button',box).forEach(b=>b.onclick=()=>set(b.dataset.t,tr.dur||0.5));","$$('.pn-trans button',box).forEach(b=>b.onclick=()=>set(b.dataset.t,tr.dur||0.5)); anTransThumbs(box);")
rep("{id:'elements',ic:'🧩',t:'عناصر حركة'},","{id:'elements',ic:'🧩',t:'عناصر حركة'},{id:'sounds',ic:'🔊',t:'أصوات'},")
rep("elements:anPanelElements,","elements:anPanelElements,sounds:anPanelSounds,")
# prompts vocab
old="Transitions: cut, fade, fade-black, fade-white, flash, slide-*, push-*, zoom-in, zoom-out, spin, wipe, wipe-rtl, circle, diamond, blinds, glitch, whip, page."
assert h.count(old)>=1
h=h.replace(old,"Transitions: cut, fade, fade-black, fade-white, flash, slide-*, push-*, zoom-in, zoom-out, spin, wipe, wipe-rtl, wipe-up, wipe-down, circle, diamond, blinds, glitch, whip, page, "+", ".join(NEW_TR)+" (pick professionally: cross-zoom / zoom-through / whip / flash-zoom / rgb-split for energy; blur-dissolve / fade / fade-black for calm; clock / open-h / iris-box / curtain / slice-h / stripes / mosaic for graphic reveals; flip-h / cube-left / page / film-burn for stylised moments).")
SF="whoosh|swish|whoosh-long|swoosh-up|slide|pop|click|ding|thud|riser|riser-long|downer|reverse|boom|hit|bass-drop|heartbeat|shimmer|swell|tape-stop|knock|tick|clock|typing|digital|glitch|laser|zap|camera|notify|error|success|coin|cash|sparkle|applause|ding-dong|stamp|paper|snap|pluck|bubble|water-drop"
assert h.count("whoosh|click|ding|thud|riser")>=1; h=h.replace("whoosh|click|ding|thud|riser",SF)
# modes
rep("const AN_MONT_SHOW=[",R('pro2_modes.js')+"\nconst AN_MONT_SHOW=[")
# auto-animate sequences
rep("dynamic:[rtl?'push-right':'push-left','zoom','slide-up','whip','circle'], energetic:['whip','zoom-in','flash','glitch',rtl?'push-right':'push-left']","dynamic:[rtl?'push-right':'push-left','cross-zoom','slide-up','whip','circle','clock'], energetic:['whip','flash-zoom','zoom-through','rgb-split','glitch',rtl?'push-right':'push-left','slice-h']")
rep("calm:['fade','fade','fade-black','fade']","calm:['fade','blur-dissolve','fade-black','fade']")
# css
rep('</head>',R('pro2_css.css')+'</head>')
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('pro2 ok')
