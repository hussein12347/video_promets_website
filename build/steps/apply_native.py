h=open('studio_g.html',encoding='utf-8').read()
R=lambda f:open(f,encoding='utf-8').read()
a="const ANIM_GSAP_URL='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';"
assert h.count(a)==1
h=h.replace(a,"const ANIM_GSAP_URL=(window.NativeBridge&&window.NativeBridge.vendorGsap)||'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';")
i=h.rindex('</body>'); h=h[:i]+'<script>'+R('native_patch.js')+'</script>\n'+h[i:]
open('studio_g.html','w',encoding='utf-8').write(h); open('serve/index.html','w',encoding='utf-8').write(h); print('native ok')
