import re,sys
h=open('studio_g.html',encoding='utf-8').read()
gl=open('glyphs.js',encoding='utf-8').read(); el=open('elements.js',encoding='utf-8').read()
css=open('glyphs.css',encoding='utf-8').read() if __import__('os').path.exists('glyphs.css') else ''
def rep(old,new,cnt=1):
    global h
    assert h.count(old)>=1,('missing',old[:70])
    h=h.replace(old,new,cnt)
# 1 library + SHAPES
rep("  const SHAPES=['rect','circle','underline','arrow','line'];", gl+"\n  const SHAPES=['rect','circle','underline','arrow','line',...GLYPH_NAMES];")
# 2 normalize
rep("o.shape=SHAPES.includes(String(l.shape))?String(l.shape):'rect';","{ const sk=String(l.shape).toLowerCase().replace(/_/g,'-'); o.shape=SHAPES.includes(sk)?sk:'rect'; }")
rep("o.fill=!!l.fill; o.stroke=clamp(num(l.stroke,0.6),0.1,8); if(o.h==null) o.h=o.shape==='underline'||o.shape==='line'?0:o.w*0.6;",
 "o.fill=!!l.fill&&l.fill!=='none'; o.stroke=clamp(num(l.stroke,0.6),0.1,8); if(GLYPHS[o.shape]){ if(o.h==null) o.h=0; o.look=GLOOKS[l.look]?l.look:'hand'; o.fillMode=['solid','hatch','wash','dots'].includes(l.fill)?l.fill:(l.fill===true?'solid':'none'); o.fillColor=l.fillColor?String(l.fillColor):''; o.seed=Math.round(num(l.seed,i*5+3)); } else if(o.h==null) o.h=o.shape==='underline'||o.shape==='line'?0:o.w*0.6;")
# 3 drawShape + baseSize + time
rep("  function drawShape(ctx,l,v,w,h,H,handAt){\n","  function drawShape(ctx,l,v,w,h,H,handAt){\n    if(GLYPHS[l.shape]) return drawGlyph(ctx,l,v,w,h,H,handAt);\n")
rep("    return {w:W*l.w/100, h:H*(l.h||0)/100};\n  }","    if(l.type==='shape'&&GLYPHS[l.shape]&&!l.h) return {w:W*l.w/100, h:W*l.w/100};\n    return {w:W*l.w/100, h:H*(l.h||0)/100};\n  }")
rep("    const d=rt.L.data; opts=opts||{}; const hands=[];","    const d=rt.L.data; opts=opts||{}; GT=opts.local!=null?opts.local:0; const hands=[];")
rep("vocab:{ENTER,EXIT,MOTION,","glyphs:GLYPHS, glyphCats:GLYPH_CATS, glyphLooks:GLOOKS, glyphFills:GFILLS, glyphThumb, glyphPaths,\n    vocab:{ENTER,EXIT,MOTION,")
# 4 inspector
rep("inSel('in-shape',[['rect','مستطيل'],['circle','دائرة'],['underline','خط'],['line','خط مستقيم'],['arrow','سهم']],l.shape||'rect')",
 "inSel('in-shape',[['rect','مستطيل'],['circle','دائرة'],['underline','خط'],['line','خط مستقيم'],['arrow','سهم']].concat(Object.entries(ANIM.engine.glyphs).map(([k,v])=>[k,'✦ '+v[0]])),l.shape||'rect')")
rep("""<label class="an-sw"><input type="checkbox" id="in-fill" '+(l.fill?'checked':'')+'><span>تعبئة</span></label></details>';""",
 """'+(ANIM.engine.glyphs[l.shape]?inF('أسلوب الرسم',inSel('in-look',Object.entries(ANIM.engine.glyphLooks),l.look||'hand'))+inF('التعبئة',inSel('in-fillm',Object.entries(ANIM.engine.glyphFills),typeof l.fill==='string'?l.fill:(l.fill?'solid':'none')))+inF('لون التعبئة',inCol('in-fillcol',l.fillColor||l.color||'#e53935')):'<label class="an-sw"><input type="checkbox" id="in-fill" '+(l.fill?'checked':'')+'><span>تعبئة</span></label>')+'</details>';""")
rep("bindSel('in-shape',(r,v)=>{ r.shape=v; });","bindSel('in-shape',(r,v)=>{ r.shape=v; }); bindSel('in-look',(r,v)=>{ r.look=v; }); bindSel('in-fillm',(r,v)=>{ r.fill=v==='none'?false:v; }); bindCol('in-fillcol',(r,v)=>{ r.fillColor=v; });")
# 5 AI vocab
names=re.findall(r"(?:^|[\s,{])'?([a-z0-9][\w-]*)'?:\['",gl,re.M)
names=[n for n in names if n not in('a','b')]
txt='SHAPE: "shape": rect | circle | underline | line | arrow, OR a DRAWN ELEMENT (doodle/icon, drawn stroke by stroke like a pen): '+', '.join(names)+'. Drawn elements are square boxes ("w" 8-30, no "h"), and take "look": hand|marker|sketch|chalk|ink|neon|clean (hand = pen with a slight tremor, the default), "fill": none|solid|hatch|wash|dots, "fillColor", "stroke" (0.4-1.4), "rot" (degrees), "flip", "attach"/"side" like any layer. Use 2-5 of them per scene as lively doodles around the key element (sparkles, arrows, check, bulb, stars, speed-lines) with enter handdraw/pop/stamp and a light motion (float, pulse, wiggle).'
n=h.count('SHAPE: "shape": rect | circle | underline | line | arrow.')
assert n>=1
h=h.replace('SHAPE: "shape": rect | circle | underline | line | arrow.',txt)
# 6 panel
anchor="function anPanelMarks(box){"
rep(anchor,el+"\n"+anchor)
rep("{id:'marks',ic:'✏️',t:'علامات'},","{id:'marks',ic:'✏️',t:'علامات'},{id:'elements',ic:'🧩',t:'عناصر حركة'},")
rep("marks:anPanelMarks,","marks:anPanelMarks,elements:anPanelElements,")
if css: rep('</head>',css+'</head>')
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h)
print('ok',len(names),'glyph names')
