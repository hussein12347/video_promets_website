h=open('studio_g.html',encoding='utf-8').read()
R=lambda f:open(f,encoding='utf-8').read()
assert h.count('</head>')==1
css='<style id="pro15">'+R('pro15.css')+'</style>'
user='<style id="user-spacing">'+R('user_spacing.css')+'</style>'
h=h.replace('</head>',css+user+'</head>')
i=h.rindex('</body>'); h=h[:i]+'<script>'+R('pro15_smart.js')+'</script>\n'+h[i:]
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('pro15 ok')
