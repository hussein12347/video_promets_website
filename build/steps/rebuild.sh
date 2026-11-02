cd /tmp/claude-0/mont && python3 - <<'PY'
h=open('studio.html',encoding='utf-8').read(); js=''.join(open(f,encoding='utf-8').read()+'\n' for f in ('montage.js','silence.js','montage_ui.js'))
a=h.index("  L.push('- JSON SCHEMA (strict JSON"); b=h.index("  return L.join('\\n');\n}\nfunction odAnimAudioLine")
js=js.replace('/*__SCHEMA__*/',h[a:b].rstrip('\n'))
js=js.replace("""    res.innerHTML=(r.added?'<div class="mt-ok">""","""    const html=(r.added?'<div class="mt-ok">""")
js=js.replace("""    if(r.added){ animRefreshAll(); try{ animSizeCanvas(); }catch(e){} }
  };""","""    ANIM._montResHtml=html; res.innerHTML=html;
    if(r.added){ animRefreshAll(); try{ animSizeCanvas(); }catch(e){} const r2=document.querySelector('#mt-res'); if(r2) r2.innerHTML=html; }
  };""")
js=js.replace("""  const res=$m('#mt-res');""","""  const res=$m('#mt-res'); if(ANIM._montResHtml) res.innerHTML=ANIM._montResHtml;""")
anchor="/* ---------------- marks: list / move / retarget / delete ---------------- */"
h=h.replace(anchor,js+"\n"+anchor)
h=h.replace("  fn(box);\n}","  fn(box); { const ed=document.getElementById('ed'); if(ed) ed.classList.toggle('pn-wide',P==='montage'||P==='elements'); }\n}",1)
h=h.replace(" {id:'json',ic:'📥',t:'لصق JSON'},{id:'media'"," {id:'montage',ic:'🎞️',t:'مونتاج AI'}, {id:'json',ic:'📥',t:'لصق JSON'},{id:'media'",1)
h=h.replace("json:anPanelJson,media:anPanelMedia,","montage:anPanelMontage,json:anPanelJson,media:anPanelMedia,",1)
h=h.replace('<button id="an-demo">جرّب مشروعًا تجريبيًا</button>','<button class="pri" id="an-mont">🎞️ مونتاج من فيديو / صوت</button><button id="an-demo">جرّب مشروعًا تجريبيًا</button>',1)
o="  $('#an-demo').onclick=()=>animCreate('مشروع تجريبي','16:9',true);"
h=h.replace(o,o+"\n  $('#an-mont').onclick=async()=>{ ANIM.panel='montage'; await animCreate('مونتاج جديد','16:9'); };",1)
css=open('montage.css',encoding='utf-8').read()
h=h.replace('</head>',css+'</head>',1)
open('serve/index.html','w',encoding='utf-8').write(h); open('studio_m.html','w',encoding='utf-8').write(h)
PY
