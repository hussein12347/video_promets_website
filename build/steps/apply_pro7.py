h=open('studio_g.html',encoding='utf-8').read()
R=lambda f:open(f,encoding='utf-8').read()
assert h.count('</head>')==1
h=h.replace('</head>',R('i18n.css')+'</head>')
i=h.rindex('</body>')
h=h[:i]+'<script>'+R('i18n_inv.js')+R('pro7_i18n.js')+'</script>\n'+h[i:]
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('pro7 ok')
