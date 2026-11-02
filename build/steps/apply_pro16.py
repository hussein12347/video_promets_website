h=open('studio_g.html',encoding='utf-8').read()
R=lambda f:open(f,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global h
    assert h.count(a)==cnt,(h.count(a),a[:70])
    h=h.replace(a,b)
rep("const MARKS=['highlight','underline','circle','box','strike','arrow','cross','check','bracket','burst','zigzag','spotlight','scribble'];",
    "const MARKS=['highlight','underline','circle','box','strike','arrow','cross','check','bracket','burst','zigzag','spotlight','scribble','star','heart','sparkle','question','exclaim','bullseye','lightning'];")
rep("o.seed=Math.round(num(l.seed,i*7+3));","o.seed=Math.round(num(l.seed,i*7+3)); o.variant=(typeof ANMV!=='undefined'&&l.variant&&ANMV.ok(o.mark,String(l.variant)))?String(l.variant):'';")
rep("check:'after',cross:'center',scribble:'center'}[l.mark]","check:'after',cross:'center',scribble:'center',star:'after',heart:'after',sparkle:'after',question:'after',exclaim:'after',lightning:'after'}[l.mark]")
rep("function markPath(kind,w,h,seed,rtl){","function markPath(kind,w,h,seed,rtl,vr){ if(typeof ANMV!=='undefined'){ const q=ANMV.path(kind,vr,w,h,seed,rtl); if(q) return q; }")
rep("const pts=markPath(l.mark,w,h||w*0.3,l.seed,rtl);","const pts=markPath(l.mark,w,h||w*0.3,l.seed,rtl,l.variant);")
rep("    const end=strokePartial(ctx,pts,prog);","    if(pts.lw) ctx.lineWidth*=pts.lw; const end=strokePartial(ctx,pts,prog);")
rep("ctx.beginPath(); roundRect(ctx,rtl?x0-ww:x0,-hh/2,ww,hh,hh*0.25); ctx.fill();","if(!(typeof ANMV!=='undefined'&&ANMV.hl(ctx,l.variant,rtl?x0-ww:x0,ww,hh,l.seed))){ ctx.beginPath(); roundRect(ctx,rtl?x0-ww:x0,-hh/2,ww,hh,hh*0.25); ctx.fill(); }")
rep("ctx.fillStyle='rgba(0,0,0,0.62)'; ctx.beginPath(); ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height); ctx.ellipse(px,py,rx,ry,0,0,2*PI,true); ctx.fill('evenodd');",
    "ctx.fillStyle=l.variant==='soft'?'rgba(0,0,0,0.4)':'rgba(0,0,0,0.62)'; ctx.beginPath(); ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height); if(l.variant==='rect'){ ctx.rect(px-rx,py-ry,rx*2,ry*2); } else ctx.ellipse(px,py,rx,ry,0,0,2*PI,true); ctx.fill('evenodd');")
rep("const mx=(sx+tx)/2+(ty-sy)*0.25, my=(sy+ty)/2-(tx-sx)*0.25;","const _ak=({straight:0,loop:0.55})[l.variant], _kk=_ak==null?0.25:_ak; const mx=(sx+tx)/2+(ty-sy)*_kk, my=(sy+ty)/2-(tx-sx)*_kk;")
rep("      const end=strokePartial(ctx,pts,Math.min(1,prog/0.85));","      if(l.variant==='bold') ctx.lineWidth*=2; const end=strokePartial(ctx,pts,Math.min(1,prog/0.85));")
rep("if(v.hd<0.999&&end) handAt(end[0],end[1]); return; }","if(prog>0.85&&l.variant==='double'){ const q2=(prog-0.85)/0.15; const a2=Math.atan2(sy-pts[2][1],sx-pts[2][0]); const hs2=ctx.lineWidth*4*q2; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx-hs2*Math.cos(a2-0.5),sy-hs2*Math.sin(a2-0.5)); ctx.moveTo(sx,sy); ctx.lineTo(sx-hs2*Math.cos(a2+0.5),sy-hs2*Math.sin(a2+0.5)); ctx.stroke(); } if(v.hd<0.999&&end) handAt(end[0],end[1]); return; }")
rep("spotlight:['بقعة ضوء','◉']};","spotlight:['بقعة ضوء','◉'],star:['نجمة','★'],heart:['قلب','♥'],sparkle:['لمعة','✦'],question:['علامة استفهام','؟'],exclaim:['علامة تعجب','!'],bullseye:['هدف','◎'],lightning:['برق','ϟ']};")
rep("inF('النوع',inSel('in-mark',Object.keys(AN_MARK_AR),l.mark||'underline',Object.fromEntries(Object.entries(AN_MARK_AR).map(([k,v])=>[k,v[0]]))))+",
    "inF('النوع',inSel('in-mark',Object.keys(AN_MARK_AR),l.mark||'underline',Object.fromEntries(Object.entries(AN_MARK_AR).map(([k,v])=>[k,v[0]]))))+inF('الشكل',inSel('in-var',ANMV.variants(l.mark||'underline').map(x=>x[0]),l.variant||'',Object.fromEntries(ANMV.variants(l.mark||'underline').map(x=>[x[0],x[1]]))))+")
rep("bindSel('in-mark',(r,v)=>{ r.mark=v; });","bindSel('in-mark',(r,v)=>{ r.mark=v; delete r.variant; setTimeout(()=>{ try{ animRenderInspector(); }catch(e){} },80); }); bindSel('in-var',(r,v)=>{ if(v) r.variant=v; else delete r.variant; });")
rep('scribble | spotlight + "target"','scribble | spotlight | star | heart | sparkle | question | exclaim | bullseye | lightning + optional "variant" (a different look of the same mark; omit for the default; vary it across marks instead of repeating one look): underline wavy|double|brush|dashed|swoosh; highlight pill|half|slant|brush; circle double|clean|rough|squircle; box clean|round|corners|double; strike double|wavy|hatch; arrow straight|bold|loop|double; cross bold|round; check bold|round|double; bracket square|paren|both; burst dense|star; zigzag wave|loops; scribble tight|zig; spotlight rect|soft; star six|double; heart double|small; sparkle cluster|plus; question circled; exclaim double|circled; bullseye cross|dot; lightning double + "target"',2)
i=h.rindex('</body>'); h=h[:i]+'<script>'+R('pro16_marks.js')+'</script>\n'+h[i:]
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('pro16 ok')
