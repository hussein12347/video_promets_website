h=open('studio_g.html',encoding='utf-8').read()
R=lambda f:open(f,encoding='utf-8').read()
i=h.index('</head>'); h=h[:i]+'<style>'+R('pro18.css')+'</style>'+h[i:]
i=h.rindex('</body>'); h=h[:i]+'<script>'+R('pro18_gen.js')+'</script>\n'+h[i:]
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('pro18 ok')
