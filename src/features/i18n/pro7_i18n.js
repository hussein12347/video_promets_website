/* ===== i18n: runtime UI translation (ar → en/fr/es/tr/ur/fa/id/de) =====
   Source UI is Arabic. Strings are translated in the DOM (text nodes + placeholder/title/aria-label/alt),
   in this order: curated dictionary → local cache → on-device browser Translator API → online fallback.
   Only strings that belong to the app's own static UI (hash inventory) are ever sent to a translator —
   user content (project names, typed text, scenes, prompts) never is. */
(function(){
  const LANGS={ar:['العربية','ar','rtl'],en:['English','en','ltr'],fr:['Français','fr','ltr'],es:['Español','es','ltr'],tr:['Türkçe','tr','ltr'],ur:['اردو','ur','rtl'],fa:['فارسی','fa','rtl'],id:['Bahasa Indonesia','id','ltr'],de:['Deutsch','de','ltr']};
  const DICT={en:{
    'الأقسام والأدوات':'Sections & tools','استوديو الفيديو الذكي':'AI Video Studio','الرئيسية':'Home','مشروع جديد':'New project','المشاريع':'Projects','المفضلة':'Favorites','استوديو الأنيميشن':'Animation Studio','الشخصيات':'Characters','أنماط الرسم':'Art styles','الإعدادات':'Settings','المزيد':'More','جديد':'New','الاستوديو':'Studio',
    'أضف القسم للمفضلة':'Add section to favorites','+ مشروع جديد':'+ New project','+ ابدأ فيديو جديد':'+ Start a new video','أحدث المشاريع':'Latest projects','الشخصيات المحفوظة':'Saved characters','عرض الكل ›':'View all ›','عرض الكل':'View all','مرحبًا بك في استوديو الفيديو الذكي':'Welcome to AI Video Studio','لا توجد مشاريع بعد':'No projects yet','لم تضف أي شخصية بعد':'No characters added yet'
  }};
  const FALL='ar'; let lang=FALL; try{ const s=localStorage.getItem('vs.lang'); if(s&&LANGS[s]) lang=s; }catch(e){}
  const AR=/[؀-ۿ]/;
  const norm=s=>s.replace(/\s+/g,' ').trim().replace(/[0-9٠-٩۰-۹]+/g,'#');
  const fnv=s=>{ let x=2166136261; for(let i=0;i<s.length;i++){ x^=s.charCodeAt(i); x=Math.imul(x,16777619)>>>0; } return x>>>0; };
  let INV=null; const inv=()=>{ if(INV) return INV; INV=new Set(); try{ const b=atob(I18N_INV), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); const v=new Uint32Array(u.buffer); v.forEach(x=>INV.add(x)); }catch(e){} return INV; };
  const has1=k=>{ const t=k.trim(); return inv().has(fnv(t)) || inv().has(fnv(t.replace(/^[^\u0600-\u06FF#]+|[^\u0600-\u06FF#]+$/g,''))); };
  /* a string is UI text if it is in the inventory as-is, or every Arabic piece around its numbers is (e.g. "الكل (44)" = "الكل (" + number + ")") */
  const allowed=k=>{ if(has1(k)) return true; const ps=k.split(/[#·—–|:،؛;•\/()\[\]…"'«»“”<>`.!?؟]+/); if(ps.length<2) return false; return ps.every(p0=>{ const p=p0.trim(); return !AR.test(p)||p.length<=2||has1(p)||has1(p.replace(/^[^\u0600-\u06FF]+|[^\u0600-\u06FF]+$/g,'')); }); };
  /* cache */
  const BLOCKED=new Set(); const cache={}; const loadCache=l=>{ if(cache[l]) return cache[l]; let o={}; try{ o=JSON.parse(localStorage.getItem('vs.i18n.'+l)||'{}')||{}; }catch(e){} return cache[l]=o; };
  let saveT=0; const saveCache=l=>{ clearTimeout(saveT); saveT=setTimeout(()=>{ try{ const s=JSON.stringify(cache[l]); if(s.length<2.2e6) localStorage.setItem('vs.i18n.'+l,s); }catch(e){} },1500); };
  const look=(k,l)=>{ const d=DICT[l]&&DICT[l][k]; if(d) return d; const c=loadCache(l)[k]; return c||null; };
  /* providers */
  const dev={}; const tmo=(p,ms)=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))]); async function getDev(l,dl){ if(!('Translator' in self)) return null; if(dev[l]!==undefined&&!(dl&&dev[l]===null&&dev['_dl'+l]===undefined)) return dev[l]; try{ const o={sourceLanguage:'ar',targetLanguage:l}; const av=await tmo(self.Translator.availability(o),1500); if(av==='available'||(dl&&av==='downloadable')){ dev['_dl'+l]=1; dev[l]=await tmo(self.Translator.create(o),dl?600000:3000); } else dev[l]=null; }catch(e){ dev[l]=null; } return dev[l]; }
  const STAT={ok:0,fail:0,err:'',prov:''}; let fails=0, coolUntil=0; const ENDPOINT=()=>{ try{ return localStorage.getItem('vs.trEndpoint')||'https://translate.googleapis.com/translate_a/single'; }catch(e){ return 'https://translate.googleapis.com/translate_a/single'; } };
  async function mymemory(text,l){ const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),9000); try{ const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair=ar|'+l,{signal:ctl.signal}); if(!r.ok) throw new Error('HTTP '+r.status); const j=await r.json(); const out=j&&j.responseData&&j.responseData.translatedText; if(!out||/MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(out)) throw new Error('mymemory limit'); return out; } finally{ clearTimeout(to); } }
  async function online(text,l){ try{ const o=await online1(text,l); STAT.prov='google'; return o; }catch(e1){ STAT.err=String(e1.message||e1).slice(0,80); try{ const o=await mymemory(text,l); STAT.prov='mymemory'; return o; }catch(e2){ STAT.err+=' / '+String(e2.message||e2).slice(0,60); throw e2; } } }
  async function online1(text,l){ if(Date.now()<coolUntil) throw new Error('cooldown'); const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),9000); try{ const r=await fetch(ENDPOINT()+'?client=gtx&sl=ar&tl='+l+'&dt=t&q='+encodeURIComponent(text),{signal:ctl.signal}); if(!r.ok) throw new Error('HTTP '+r.status); const j=await r.json(); const out=(j[0]||[]).map(x=>x[0]).join(''); if(!out) throw new Error('empty'); fails=0; return out; }catch(e){ if(++fails>=5){ coolUntil=Date.now()+60000; fails=0; } throw e; } finally{ clearTimeout(to); } }
  const waiting=new Map(); const queue=[]; let active=0, pumpT=0;
  function request(k,l,cb){ const id=l+'\u0001'+k; if(waiting.has(id)){ waiting.get(id).push(cb); return; } waiting.set(id,[cb]); queue.push([k,l,id,0]); pump(); }
  const FIN=(it,out)=>{ const [k,l,id]=it; if(out){ out=String(out).trim(); const need=(k.match(/#/g)||[]).length, got=(out.match(/#/g)||[]).length; if(need===got){ loadCache(l)[k]=out; saveCache(l); STAT.ok++; } else { out=null; STAT.fail++; } } else STAT.fail++; const cbs=waiting.get(id)||[]; waiting.delete(id); if(out&&l===lang) cbs.forEach(f=>{ try{ f(); }catch(e){} }); };
  /* several strings per request (one per line) — validated: if the line count comes back different we fall back to one-by-one */
  async function gBatch(texts,l){ if(Date.now()<coolUntil) throw new Error('cooldown'); const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),15000); try{ const r=await fetch(ENDPOINT(),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'client=gtx&sl=ar&tl='+l+'&dt=t&q='+encodeURIComponent(texts.join('\n')),signal:ctl.signal}); if(!r.ok) throw new Error('HTTP '+r.status); const j=await r.json(); const out=(j[0]||[]).map(x=>x[0]).join(''); const parts=out.replace(/\n+$/,'').split('\n'); if(parts.length!==texts.length) throw new Error('batch-mismatch'); fails=0; STAT.prov='google'; return parts; }catch(e){ if(!/batch-mismatch/.test(String(e.message))&&++fails>=5){ coolUntil=Date.now()+30000; fails=0; } throw e; } finally{ clearTimeout(to); } }
  const requeue=(it)=>{ const n=it[3]+1; if(n>6){ FIN(it,null); return; } it[3]=n; setTimeout(()=>{ queue.push(it); pump(); },Math.min(30000,2500*n)); };
  function pump(){ if(pumpT){ clearTimeout(pumpT); pumpT=0; } if(Date.now()<coolUntil&&queue.length&&!(('Translator' in self))){ pumpT=setTimeout(pump,coolUntil-Date.now()+50); return; }
    while(active<3&&queue.length){ const first=queue.shift(); const l=first[1]; const batch=[first]; let chars=first[0].length; for(let i=0;i<queue.length&&batch.length<14;){ const it=queue[i]; if(it[1]===l&&chars+it[0].length<2200){ batch.push(it); chars+=it[0].length; queue.splice(i,1); } else i++; }
      active++; (async()=>{ try{ const d=await getDev(l,false); const left=[]; if(d){ for(const it of batch){ let o=null; try{ o=await tmo(d.translate(it[0]),8000); }catch(e){} if(o) FIN(it,o); else left.push(it); } } else left.push(...batch);
          if(left.length>1){ try{ const parts=await gBatch(left.map(x=>x[0]),l); left.forEach((it,i)=>FIN(it,parts[i])); left.length=0; }catch(e){ STAT.err=String(e.message||e).slice(0,80); } }
          for(const it of left){ let out=null; try{ out=await online(it[0],l); }catch(e){ out=null; } if(out) FIN(it,out); else requeue(it); } }catch(e){ batch.forEach(it=>{ if(waiting.has(it[2])) requeue(it); }); } active--; pump(); })(); } }
  function fill(res,core){ const ds=core.match(/[0-9٠-٩۰-۹]+/g)||[]; let i=0; return res.replace(/#/g,()=>ds[i++]||'#'); }
  /* DOM */
  const SKIP=new Set(['SCRIPT','STYLE','TEXTAREA','CODE','PRE','NOSCRIPT','CANVAS','SVG','INPUT']);
  const skipEl=el=>{ for(let e=el;e&&e.nodeType===1;e=e.parentElement){ if(SKIP.has(e.tagName.toUpperCase())||e.hasAttribute('data-notr')||e.isContentEditable) return true; } return false; };
  function procText(n){ const p=n.parentElement; if(!p) return; if(n.__t!==undefined&&n.data===n.__t){ /* ours */ } else { if(!AR.test(n.data)&&n.__t===undefined) return; n.__o=n.data; n.__t=undefined; }
    if(skipEl(p)){ return; }
    if(lang===FALL){ if(n.__t!==undefined&&n.data===n.__t){ n.data=n.__o; n.__t=undefined; } return; }
    const o=n.__o; const m=o.match(/^(\s*)([\s\S]*?)(\s*)$/); const core=m[2]; if(!AR.test(core)) return; const k=norm(core); let r=look(k,lang);
    if(r){ const t=m[1]+fill(r,core)+m[3]; if(n.data!==t){ n.data=t; } n.__t=t; return; }
    if(n.__t!==undefined&&n.data===n.__t){ n.data=o; n.__t=undefined; }
    if(allowed(k)) request(k,lang,()=>procText(n)); else BLOCKED.add(k); }
  const ATTRS=['placeholder','title','aria-label','alt'];
  function procAttrs(el){ if(el.nodeType!==1||skipEl(el.parentElement||el)&&el.tagName!=='INPUT') return; const st=el.__oa||(el.__oa={}); const list=ATTRS.concat(el.tagName==='INPUT'&&/^(button|submit|reset)$/i.test(el.type)?['value']:[]);
    for(const a of list){ if(!el.hasAttribute(a)) continue; const cur=el.getAttribute(a); let rec=st[a]; if(rec&&cur===rec.t){ /* ours */ } else { if(!AR.test(cur)) { delete st[a]; continue; } rec=st[a]={o:cur,t:undefined}; }
      if(lang===FALL){ if(rec.t!==undefined&&cur===rec.t){ el.setAttribute(a,rec.o); rec.t=undefined; } continue; }
      const m=rec.o.match(/^(\s*)([\s\S]*?)(\s*)$/), core=m[2], k=norm(core); const r=look(k,lang);
      if(r){ const t=m[1]+fill(r,core)+m[3]; el.setAttribute(a,t); rec.t=t; } else { if(rec.t!==undefined&&cur===rec.t){ el.setAttribute(a,rec.o); rec.t=undefined; } if(allowed(k)) request(k,lang,()=>procAttrs(el)); } } }
  function walk(root){ if(!root) return; if(root.nodeType===3){ procText(root); return; } if(root.nodeType!==1) return; if(SKIP.has(root.tagName.toUpperCase())&&root.tagName!=='INPUT') return; procAttrs(root);
    const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,null); let n=tw.nextNode(); while(n){ if(n.nodeType===3) procText(n); else { if(SKIP.has(n.tagName.toUpperCase())&&n.tagName!=='INPUT'){ /* skip children */ } procAttrs(n); } n=tw.nextNode(); } }
  let pend=new Set(), tm=0; const flush=()=>{ tm=0; const s=pend; pend=new Set(); s.forEach(n=>{ try{ walk(n); }catch(e){} }); };
  const sched=n=>{ pend.add(n); if(!tm) tm=setTimeout(flush,40); };
  const mo=new MutationObserver(ms=>{ for(const m of ms){ if(m.type==='childList') m.addedNodes.forEach(sched); else if(m.type==='characterData') sched(m.target); else if(m.type==='attributes') sched(m.target); } });
  function setDir(){ const d=LANGS[lang]; document.documentElement.lang=d[1]; document.documentElement.dir=d[2]; document.documentElement.setAttribute('data-lang',lang); }
  function apply(){ setDir(); walk(document.body); const tt=document.title; }
  /* native dialogs */
  const _c=window.confirm.bind(window), _a=window.alert.bind(window), _p=window.prompt.bind(window);
  const nat=s=>{ if(lang===FALL||typeof s!=='string'||!AR.test(s)) return s; return s.split('\n').map(line=>{ const core=line.trim(); if(!AR.test(core)) return line; const k=norm(core); const r=look(k,lang); if(r) return fill(r,core); if(allowed(k)) request(k,lang,()=>{}); return line; }).join('\n'); };
  window.confirm=s=>_c(nat(s)); window.alert=s=>_a(nat(s)); window.prompt=(s,d)=>_p(nat(s),d);
  /* picker */
  function ui(){ const b=document.createElement('button'); b.id='lang-fab'; b.type='button'; b.setAttribute('data-notr',''); b.title='Language / اللغة'; b.setAttribute('aria-label','Language'); b.innerHTML='<span aria-hidden="true">🌐</span> <span class="ln"></span>'; b.querySelector('.ln').textContent=LANGS[lang][0]; const menu=document.createElement('div'); menu.id='lang-menu'; menu.setAttribute('data-notr',''); menu.hidden=true;
    menu.innerHTML=Object.keys(LANGS).map(k=>'<button type="button" data-l="'+k+'"'+(k===lang?' class="on"':'')+'>'+LANGS[k][0]+'</button>').join('')+'<small dir="auto">Auto-translated · الترجمة آلية وقد تحتاج مراجعة</small><small id="lang-stat" dir="auto"></small>';
    document.body.appendChild(b); document.body.appendChild(menu);
    const st=()=>{ const e=document.getElementById('lang-stat'); if(!e) return; e.textContent=lang===FALL?'':('✓ '+STAT.ok+' · ⏳ '+(queue.length+active)+' · ✗ '+STAT.fail+(STAT.fail&&STAT.err?' — '+STAT.err:'')+(STAT.prov?' ['+STAT.prov+']':'')); }; setInterval(()=>{ if(!menu.hidden) st(); },700);
    b.onclick=e=>{ e.stopPropagation(); menu.hidden=!menu.hidden; st(); }; document.addEventListener('click',e=>{ if(!menu.contains(e.target)) menu.hidden=true; });
    menu.onclick=e=>{ const t=e.target.closest('button[data-l]'); if(!t) return; const l=t.dataset.l; setLang(l); menu.hidden=true; if(l!==FALL) getDev(l,true).then(d=>{ if(d&&lang===l) apply(); }).catch(()=>{}); }; }
  function setLang(l){ if(!LANGS[l]) return; lang=l; try{ localStorage.setItem('vs.lang',l); }catch(e){} const b=document.getElementById('lang-fab'); if(b){ const ln=b.querySelector('.ln'); if(ln) ln.textContent=LANGS[l][0]; } document.querySelectorAll('#lang-menu button[data-l]').forEach(x=>x.classList.toggle('on',x.dataset.l===l)); apply(); if(l!==FALL) loadStart(); else { try{ const d=loadUI(); d.o.hidden=true; d.bar.hidden=true; clearInterval(ldTimer); }catch(e){} } }

  /* ---- professional loading state while a language is being prepared ---- */
  const MSG={ar:['جارٍ تجهيز الترجمة…','بيحصل مرة واحدة بس — الترجمات بتتحفظ على جهازك','تعذّر الوصول لخدمة الترجمة — النصوص الناقصة هتظهر بالعربي','تم ✓'],
    en:['Preparing translation…','This only happens once — translations are saved on your device','Translation service unreachable — missing texts will stay in Arabic','Done ✓'],
    fr:['Préparation de la traduction…','Une seule fois — les traductions sont enregistrées sur votre appareil','Service de traduction inaccessible — les textes manquants resteront en arabe','Terminé ✓'],
    es:['Preparando la traducción…','Solo ocurre una vez: las traducciones se guardan en tu dispositivo','Servicio de traducción inaccesible: los textos que falten quedarán en árabe','Listo ✓'],
    tr:['Çeviri hazırlanıyor…','Bu yalnızca bir kez olur — çeviriler cihazınıza kaydedilir','Çeviri hizmetine ulaşılamıyor — eksik metinler Arapça kalacak','Tamam ✓'],
    ur:['ترجمہ تیار ہو رہا ہے…','یہ صرف ایک بار ہوتا ہے — ترجمے آپ کے آلے پر محفوظ ہو جاتے ہیں','ترجمے کی سروس دستیاب نہیں — باقی متن عربی میں رہے گا','مکمل ✓'],
    fa:['در حال آماده‌سازی ترجمه…','فقط یک بار انجام می‌شود — ترجمه‌ها روی دستگاه شما ذخیره می‌شوند','سرویس ترجمه در دسترس نیست — متن‌های باقی‌مانده عربی می‌مانند','انجام شد ✓'],
    id:['Menyiapkan terjemahan…','Hanya sekali — terjemahan disimpan di perangkat Anda','Layanan terjemahan tidak dapat dijangkau — teks yang kurang tetap berbahasa Arab','Selesai ✓'],
    de:['Übersetzung wird vorbereitet…','Das passiert nur einmal – Übersetzungen werden auf Ihrem Gerät gespeichert','Übersetzungsdienst nicht erreichbar – fehlende Texte bleiben arabisch','Fertig ✓']};
  let LD=null;
  function loadUI(){ if(LD) return LD; const o=document.createElement('div'); o.id='lang-load'; o.setAttribute('data-notr',''); o.hidden=true; o.setAttribute('role','status'); o.setAttribute('aria-live','polite');
    o.innerHTML='<div class="ll-card"><div class="ll-ring"></div><b class="ll-t"></b><div class="ll-bar"><i></i></div><div class="ll-n"></div><small class="ll-s"></small></div>';
    const bar=document.createElement('div'); bar.id='lang-bar'; bar.setAttribute('data-notr',''); bar.hidden=true; bar.innerHTML='<i></i>';
    document.body.appendChild(o); document.body.appendChild(bar); return LD={o,bar,t:o.querySelector('.ll-t'),i:o.querySelector('.ll-bar i'),n:o.querySelector('.ll-n'),s:o.querySelector('.ll-s'),card:o.querySelector('.ll-card')}; }
  let ldTimer=0, ldBase=0, ldPeak=0, ldStart=0, ldIdle=0, ldFull=false;
  function pending(){ return waiting.size; }
  function loadStart(){ const d=loadUI(); const m=MSG[lang]||MSG.en; d.t.textContent=m[0]; d.s.textContent=m[1]; d.card.classList.remove('err','ok'); ldBase=STAT.ok+STAT.fail; ldPeak=0; ldStart=Date.now(); ldIdle=0; ldFull=true; d.o.hidden=false; d.i.style.width='3%'; d.n.textContent=''; clearInterval(ldTimer); ldTimer=setInterval(loadTick,150); }
  function loadTick(){ const d=loadUI(); if(lang===FALL){ clearInterval(ldTimer); d.o.hidden=true; d.bar.hidden=true; return; } const m=MSG[lang]||MSG.en; const done=STAT.ok+STAT.fail-ldBase, p=pending(); ldPeak=Math.max(ldPeak,done+p); const frac=ldPeak?Math.min(1,done/ldPeak):0;
    d.bar.hidden=!(p>0)||ldFull; if(ldFull){ d.i.style.width=(Math.max(3,frac*100)).toFixed(0)+'%'; d.n.textContent=ldPeak?(done+' / '+ldPeak):''; }
    if(p===0&&Date.now()-ldStart>500){ ldIdle+=150; } else ldIdle=0;
    const allFail=done>0&&STAT.ok===0&&STAT.fail>=Math.min(done,3);
    if(ldFull&&(ldIdle>=450||Date.now()-ldStart>40000)){ ldFull=false; if(allFail||(Date.now()-ldStart>40000&&p>0)){ d.card.classList.add('err'); d.t.textContent='⚠'; d.s.textContent=m[2]; d.o.hidden=false; setTimeout(()=>{ d.o.hidden=true; },3800); } else { d.card.classList.add('ok'); d.t.textContent=m[3]; d.i.style.width='100%'; setTimeout(()=>{ d.o.hidden=true; },550); } }
  }
  const _setLang=setLang;
  window.VSI18N={_blocked:()=>[...BLOCKED],setLang,get lang(){return lang;},LANGS,_stats:()=>({queue:queue.length,active,STAT})};
  function start(){ ui(); apply(); if(lang!==FALL) loadStart(); mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS.concat(['value'])}); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
