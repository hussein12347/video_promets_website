h=open('studio_g.html',encoding='utf-8').read()
css=open('studio_pro.css',encoding='utf-8').read(); js=open('studio_pro.js',encoding='utf-8').read()
def rep(a,b):
    global h
    assert a in h,a[:60]; h=h.replace(a,b,1)
rep("function animRenderEditor(root){",js+"\nfunction animRenderEditor(root){")
rep("  $('#ed-undo').onclick=()=>animUndo(); $('#ed-redo').onclick=()=>animRedo();","  anEdPro();\n  $('#ed-undo').onclick=()=>animUndo(); $('#ed-redo').onclick=()=>animRedo();")
rep('</head>',css+'</head>')
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('pro ok')
