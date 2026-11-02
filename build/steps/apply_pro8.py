h=open('studio_g.html',encoding='utf-8').read()
R=lambda f:open(f,encoding='utf-8').read()
assert h.count('</head>')==1
h=h.replace('</head>',R('pro8_ux.css')+'</head>')
i=h.rindex('</body>'); h=h[:i]+'<script>'+R('pro8_ux.js')+'</script>\n'+h[i:]
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('pro8 ok')
