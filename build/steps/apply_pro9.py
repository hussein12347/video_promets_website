h=open('studio_g.html',encoding='utf-8').read()
R=lambda f:open(f,encoding='utf-8').read()
i=h.rindex('</body>'); h=h[:i]+'<script>'+R('pro9_prompts.js')+'</script>\n'+h[i:]
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('pro9 ok')
