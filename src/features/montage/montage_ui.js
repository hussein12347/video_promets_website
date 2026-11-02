/* ---------------- panel ---------------- */
function anMontStepHtml(id,n,title,state,sub,body,open){
  return `<section class="mt2-step${open?' open':''}" data-state="${state}" data-s="${id}"><header class="mt2-sh" role="button" tabindex="0" aria-expanded="${open?'true':'false'}"><span class="mt2-n">${state==='done'?'✓':n}</span><span class="mt2-t"><h4>${title}</h4><small>${sub||''}</small></span><i class="mt2-chev" aria-hidden="true"></i></header><div class="mt2-body">${body}</div></section>`;
}
function anPanelMontage(box){
  const p=ANIM.cur, M=anMontState(p); const S=anSilState(M); const has=!!M.src; const isVid=has&&M.src.kind==='video'; const wr=!!(M.words&&M.words.length);
  const segs=wr?anMontSegments(M.words):[]; const parts=wr?anMontParts(M):[];
  const nScenes=p.scenes.filter(s=>s.raw&&s.raw._mont).length; const doneParts=parts.filter(pt=>anMontPartState(M,pt)>0).length;
  const removed=(S.ranges||[]).filter(r=>r.on!==false).reduce((t,r)=>t+r.b-r.a,0); const nSil=(S.ranges||[]).filter(r=>r.on!==false).length;
  const st1=has?'done':'active', st2=!has?'todo':(wr?'done':'active'), st3=!has?'todo':(S.ranges?(S.on?'done':'active'):'active'), st4=!wr?'todo':(M.style&&M.style!=='auto'||M.applied?'done':'active'), st5=!wr?'todo':(doneParts===parts.length&&parts.length?'done':'active');
  const OP=ANIM._montOpen=ANIM._montOpen||{}; const isOpen=(id,def)=>OP[id]!==undefined?OP[id]:def;
  const next=!has?'s1':(!wr?'s2':(!S.ranges&&S.on?'s3':'s5'));
  const showOpts=AN_MONT_SHOW.map(o=>{ const dis=o.vid&&has&&!isVid; return `<button type="button" class="mt2-opt${(dis?'anim':M.show)===o.id?' on':''}" data-show="${o.id}"${dis?' disabled':''}><span class="mt2-oi">${o.ic}</span><b>${o.t}</b><small>${o.d}</small></button>`; }).join('');
  const sw=(id,on,label,sub)=>`<label class="mt2-sw"><input type="checkbox" id="${id}" ${on?'checked':''}><i aria-hidden="true"></i><span><b>${label}</b>${sub?`<small>${sub}</small>`:''}</span></label>`;
  const s1=`<div class="mt2-drop" id="mt-drop"><span class="mt2-di" aria-hidden="true">${has?(isVid?'🎥':'🎧'):'⬆️'}</span>${has?`<div class="mt2-file"><b>${esc(M.src.name)}</b><small>${isVid?'فيديو':'صوت'} · ${fmtDur(M.src.dur)}${M.src.w?' · '+M.src.w+'×'+M.src.h:''}</small></div>`:'<div class="mt2-file"><b>اسحب فيديو أو ملف صوت هنا</b><small>MP4 · MOV · WEBM · MP3 · WAV · M4A — بيتقرا جوه المتصفح ومش بيترفع لأي مكان</small></div>'}<label class="mt2-btn${has?'':' pri'}" for="mt-file">${has?'تغيير':'اختيار ملف'}</label><input type="file" id="mt-file" accept="video/*,audio/*,.mp4,.mov,.webm,.m4v,.mp3,.wav,.m4a,.ogg,.aac" hidden></div>`;
  const s2=`<div class="mt2-row"><select id="mt-lang" aria-label="لغة الكلام">${anOpt(AN_ASR_LANG_OPTS,p.asrLang||'auto')}</select><button type="button" class="mt2-btn pri" id="mt-asr" ${has?'':'disabled'}>🎙️ ${wr?'أعد التحويل':'حوّل الكلام لنص'}</button></div><div id="mt-asrbox"></div>
    ${wr?`<div class="mt2-chips"><span class="mt2-chip">${M.words.length} كلمة</span><span class="mt2-chip">${segs.length} جملة</span>${M.orig?'<button type="button" class="mt2-chip act" id="mt-orig" title="الرجوع للنص كما طلع من Whisper">↩️ الأصلي</button>':''}</div>
      <div class="mt-tr" id="mt-tr">${segs.map((g,i)=>`<div class="mt-seg" data-i="${i}"><button type="button" class="mt-pl" data-i="${i}" title="استمع" aria-label="استمع للجملة">▶</button><b dir="ltr">${anMontT(g.s)}</b><span class="mt-tx" contenteditable="true" spellcheck="false" dir="auto" data-i="${i}">${esc(g.text)}</span></div>`).join('')}</div>
      <details class="mt2-more"><summary>بحث واستبدال في كل النص</summary><div class="mt-fr"><input id="mt-find" dir="auto" placeholder="الكلمة الغلط"><input id="mt-repl" dir="auto" placeholder="الصحيحة"><button type="button" class="mt2-btn" id="mt-frb">استبدال</button></div></details>
      <p class="mt2-hint">اضغط على أي جملة وعدّلها بإيدك قبل إرسال البرومبت — التوقيت بيفضل محفوظ للكلمات اللي ما اتغيرتش.</p>`:'<p class="mt2-hint">بعد التحويل بتظهر الجمل هنا وتقدر تسمعها وتصحّحها.</p>'}`;
  const s3=`${sw('sl-on',S.on,'قص السكتات تلقائيًا','بيشيل الفراغات من الصوت والفيديو عند بناء المشاهد (jump cut)')}
    <div class="mt2-wave"><canvas id="sl-wave" aria-label="موجة الصوت والسكتات"></canvas>${S.ranges?'':'<div class="mt2-wave-empty">اضغط «اكتشف السكتات» عشان تشوفها على الموجة</div>'}</div>
    <div class="mt2-stats" id="sl-stats"><div><b>${S.ranges?nSil:'—'}</b><small>سكتة</small></div><div><b dir="ltr">${S.ranges?removed.toFixed(1)+'s':'—'}</b><small>هتتحذف</small></div><div><b dir="ltr">${S.ranges&&has?fmtDur(Math.max(0,M.src.dur-removed)):'—'}</b><small>الناتج</small></div></div>
    <div class="mt2-seg" id="sl-sens" role="group" aria-label="الحساسية">${Object.entries(AN_SIL_SENS).map(([k,v])=>`<button type="button" class="${S.sens===k?'on':''}" data-sens="${k}" title="${v[0]}">${{soft:'حذر',normal:'متوسط',strong:'قوي'}[k]}</button>`).join('')}</div>
    <label class="mt2-f">أقصر سكتة تتقص<select id="sl-min">${anOpt(AN_SIL_MIN.map(x=>[String(x[0]),x[1]]),String(S.min))}</select></label>
    <div class="mt2-row"><button type="button" class="mt2-btn pri" id="sl-detect" ${has?'':'disabled'}>🔎 ${S.ranges?'أعد الاكتشاف':'اكتشف السكتات'}</button><button type="button" class="mt2-btn" id="sl-play" ${S.ranges?'':'disabled'}>▶ اسمع النتيجة</button></div>
    ${nScenes?`<button type="button" class="mt2-btn wide" id="sl-apply">✂️ طبّق على الـ ${nScenes} مشهد الموجودين</button>`:''}
    <div id="sl-res"></div>
    <p class="mt2-hint">اضغط على أي مربع أحمر في الموجة عشان تحتفظ بالسكتة دي. الكلمات المعروفة محمية ومش بتتقص أبدًا.</p>`;
  const s4=`<div class="mt-cards" id="mt-styles">${AN_MONT_STYLES.map(s=>`<button type="button" class="mt-card${M.style===s.id?' on':''}" data-st="${s.id}" title="${esc(s.d)}"><span>${s.ic}</span><b>${s.t}</b><small>${s.d}</small></button>`).join('')}</div>
    <h5 class="mt2-h5">إيه اللي يظهر على الشاشة؟</h5><div class="mt2-opts" id="mt-show">${showOpts}</div>${has&&!isVid?'<p class="mt2-hint">الملف صوت فقط، فالصورة كلها أنيميشن.</p>':''}
    <div class="mt2-grid2"><label class="mt2-f">طول المشهد<select id="mt-len">${anOpt(Object.keys(AN_MONT_LEN).map(k=>[k,AN_MONT_LEN[k][0]]),M.len)}</select></label>
     <label class="mt2-f">كثافة الحركة<select id="mt-dens">${anOpt(Object.keys(AN_MONT_DENS).map(k=>[k,AN_MONT_DENS[k][0]]),M.density)}</select></label></div>
    <textarea id="mt-note" dir="auto" rows="2" placeholder="تعليمات إضافية للـ AI (اختياري): ألوان، خطوط، أسلوب الرسم، عناصر عايزها أو بتتجنبها…">${esc(M.note||'')}</textarea>
    ${sw('mt-fix',M.fix!==false,'الـ AI يصحّح الكلمات الغلط','بيرجّع لك قائمة بالتصحيحات اللي عملها')}
    ${sw('mt-cap',!!M.captions,'كابشن على الفيديو','ترجمة الكلام بتظهر مع الصوت')}`;
  const s5=wr?`<label class="mt2-f">تقسيم الفيديو<select id="mt-split">${anOpt(AN_MONT_SPLIT,M.split||'auto')}</select></label>
     <p class="mt2-hint">${parts.length>1?'الفيديو اتقسّم لـ <b>'+parts.length+' أجزاء</b>. لكل جزء بالترتيب: ① انسخ البرومبت وابعته للـ AI في رسالة مستقلة ② الصق رده ③ اضغط «طبّق».':'جزء واحد: انسخ البرومبت، ابعته للـ AI، والصق رده تحت.'}</p>
     <div class="mt-prog"><i style="width:${Math.round(100*doneParts/Math.max(1,parts.length))}%"></i></div>
     <div class="mt-pcs">${parts.map((pt,i)=>{ const done=anMontPartState(M,pt), est=anMontEst(M,pt); return `<div class="mt-pc${done?' ok':''}" data-i="${i}">
       <div class="mt-ph"><span class="mt2-pn">${i+1}</span><b>${parts.length>1?'جزء '+(i+1)+' من '+parts.length:'البرومبت'}</b><span dir="ltr">${anMontT(pt.a)} → ${anMontT(pt.b)}</span><span class="mt-est${est>40?' warn':''}" title="${est>40?'كبير على رد واحد — قسّم لأجزاء أصغر':'عدد المشاهد المتوقع'}">~${est} مشهد</span><i>${done?'✅ '+done+' مشهد':'⏳ لم يُطبَّق'}</i></div>
       <div class="mt-pb"><button type="button" class="mt2-btn pri sm" data-cp="${i}">📋 نسخ البرومبت</button><button type="button" class="mt2-btn sm" data-dl="${i}">⬇️ TXT</button></div>
       <textarea data-reply="${i}" dir="auto" rows="3" placeholder="الصق رد الـ AI لهذا الجزء (JSON)…">${esc((ANIM._montRep||{})[i]||'')}</textarea>
       <div class="mt-pb"><button type="button" class="mt2-btn pri sm" data-apply="${i}">✨ طبّق ${parts.length>1?'الجزء '+(i+1):'على المشروع'}${done?' (استبدال)':''}</button><button type="button" class="mt2-btn sm" data-clip="${i}">📋 لصق من الحافظة</button></div>
       <div class="mt-pres" data-res="${i}">${(ANIM._montRes||{})[i]||''}</div></div>`; }).join('')}</div>
     ${parts.length>1?'<button type="button" class="mt2-btn wide" id="mt-dlall">⬇️ تنزيل كل البرومبتات في ملف واحد</button>':''}
     <p class="mt2-hint">بعد التطبيق: تبويب «لصق JSON» فيه برومبتات الصور لتوليدها ورفعها، وكل مشهد معاه صوته الأصلي وتوقيت كلماته.</p>`
     :'<p class="mt2-hint">حوّل الكلام لنص الأول وبعدها تظهر الأجزاء والبرومبتات.</p>';
  const sub1=has?(esc(M.src.name.slice(0,28))+' · '+fmtDur(M.src.dur)):'ارفع الفيديو أو الصوت',sub2=wr?M.words.length+' كلمة · '+segs.length+' جملة':'استخراج الكلام بالثواني',sub3=S.ranges?(S.on?'مفعّل · '+nSil+' سكتة · −'+removed.toFixed(1)+'ث':'مطفي · '+nSil+' سكتة اتلاقت'):'اختياري',sub4=(AN_MONT_STYLES.find(x=>x.id===M.style)||{}).t||'',sub5=wr?(doneParts+' من '+parts.length+' اتطبّقوا'):'بعد تحويل الكلام';
  box.innerHTML=`<div class="mt2"><div class="mt2-hero"><div><h3>🎞️ مونتاج بالذكاء الاصطناعي</h3><p>ملف فيديو أو صوت ← كلام بالثواني ← قص السكتات ← الـ AI يصمّم المشاهد والصور والحركة.</p></div></div>
    <nav class="mt2-pipe" aria-label="مراحل المونتاج">${[['s1','الملف',st1],['s2','النص',st2],['s3','السكتات',st3],['s4','الشكل',st4],['s5','البرومبتات',st5]].map(([id,t,s])=>`<button type="button" class="${s}${id===next?' next':''}" data-go="${id}"><i></i><span>${t}</span></button>`).join('')}</nav>
    ${anMontStepHtml('s1',1,'الملف',st1,sub1,s1,isOpen('s1',!has))}${anMontStepHtml('s2',2,'الكلام بالثواني',st2,sub2,s2,isOpen('s2',has&&!wr||wr&&!M.applied&&false))}${anMontStepHtml('s3',3,'قص السكتات ✂️',st3,sub3,s3,isOpen('s3',false))}${anMontStepHtml('s4',4,'الشكل والعرض',st4,sub4,s4,isOpen('s4',wr&&!M.applied))}${anMontStepHtml('s5',5,'الأجزاء والبرومبتات',st5,sub5,s5,isOpen('s5',wr))}</div>`;
  const $m=q=>box.querySelector(q);
  box.querySelectorAll('.mt2-sh').forEach(h=>{ const tg=()=>{ const s=h.parentElement; const o=!s.classList.contains('open'); s.classList.toggle('open',o); h.setAttribute('aria-expanded',o); OP[s.dataset.s]=o; if(o&&s.dataset.s==='s3'){ const cv=$m('#sl-wave'); if(cv&&ANIM._montEn) anSilDraw(cv,ANIM._montEn,S,M.words); } }; h.onclick=tg; h.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); tg(); } }; });
  box.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ const s=box.querySelector('[data-s="'+b.dataset.go+'"]'); if(!s) return; if(!s.classList.contains('open')){ s.classList.add('open'); OP[b.dataset.go]=true; } s.scrollIntoView({behavior:'smooth',block:'start'}); });
  $m('#mt-file').onchange=async e=>{ const f=e.target.files[0]; e.target.value=''; if(f) await anMontPick(f); };
  const dz=$m('#mt-drop'); ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{ e.preventDefault(); dz.classList.add('over'); })); ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{ e.preventDefault(); dz.classList.remove('over'); }));
  dz.addEventListener('drop',async e=>{ const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0]; if(f) await anMontPick(f); });
  $m('#mt-lang').onchange=e=>{ p.asrLang=e.target.value; animSaveSoon(); };
  $m('#mt-note').onchange=e=>{ M.note=e.target.value; animSaveSoon(); };
  $m('#mt-len').onchange=e=>{ M.len=e.target.value; animSaveSoon(); animRenderPanel(); };
  $m('#mt-dens').onchange=e=>{ M.density=e.target.value; animSaveSoon(); };
  $m('#mt-fix').onchange=e=>{ M.fix=e.target.checked; animSaveSoon(); };
  box.querySelectorAll('.mt-tx').forEach(el=>{
    el.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); el.blur(); } };
    el.onblur=()=>{ const g=segs[+el.dataset.i]; const t=el.innerText.replace(/\s+/g,' ').trim(); if(!g||t===g.text) return; if(!M.orig) M.orig=JSON.parse(JSON.stringify(M.words)); anMontPatch(M.words,g.i0,g.n,t); animSaveSoon(); animRenderPanel(); };
  });
  const frb=$m('#mt-frb'); if(frb) frb.onclick=()=>{ const f=$m('#mt-find').value, r=$m('#mt-repl').value; if(!f.trim()){ toast('اكتب الكلمة الغلط'); return; } if(!M.orig) M.orig=JSON.parse(JSON.stringify(M.words)); const c=anMontReplaceAll(M.words,f,r); if(!c) toast('الكلمة دي مش موجودة في النص'); else { animSaveSoon(); animRenderPanel(); toast('اتبدّلت '+c+' مرة ✅'); } };
  const ob=$m('#mt-orig'); if(ob) ob.onclick=()=>{ if(!confirm('الرجوع للنص الأصلي كما طلع من Whisper؟ هتضيع تعديلاتك.')) return; M.words=JSON.parse(JSON.stringify(M.orig)); M.orig=null; animSaveSoon(); animRenderPanel(); };
  $m('#mt-cap').onchange=e=>{ M.captions=e.target.checked; animSaveSoon(); };
  box.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{ M.style=b.dataset.st; animSaveSoon(); animRenderPanel(); });
  box.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>{ if(b.disabled) return; M.show=b.dataset.show; animSaveSoon(); animRenderPanel(); });
  const sp=$m('#mt-split'); if(sp) sp.onchange=e=>{ M.split=e.target.value; ANIM._montRep={}; ANIM._montRes={}; animSaveSoon(); animRenderPanel(); };
  box.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.cp; if(i>0&&!anMontPartState(M,parts[i-1])) toast('الجزء '+i+' لسه ما اتطبّقش — الأفضل تطبّقه الأول عشان الجزء ده يكمّل عليه',4500); else toast('تم نسخ البرومبت'+(parts.length>1?' (جزء '+(i+1)+')':''),2500); copyToClipboard(anMontPrompt(i)); });
  const dla=$m('#mt-dlall'); if(dla) dla.onclick=()=>{ downloadText(animSafeName(p)+'-montage-all-prompts.txt',parts.map((x,i)=>'#'.repeat(60)+'\n# الجزء '+(i+1)+' / '+parts.length+'  ('+anMontT(x.a)+' → '+anMontT(x.b)+')\n'+'#'.repeat(60)+'\n\n'+anMontPrompt(i)).join('\n\n\n')); };
  box.querySelectorAll('[data-dl]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.dl; downloadText(animSafeName(p)+'-montage-prompt-'+(i+1)+'.txt',anMontPrompt(i)); });
  /* listen to a sentence */
  let psrc=null; box.querySelectorAll('.mt-pl').forEach(b=>b.onclick=async()=>{ try{ const buf=await anMontBuf(); const g=segs[+b.dataset.i]; const ctx=animActx(); if(ctx.state==='suspended') await ctx.resume(); if(psrc){ try{ psrc.stop(); }catch(e){} } psrc=ctx.createBufferSource(); psrc.buffer=buf; psrc.connect(ctx.destination); psrc.start(0,Math.max(0,g.s-0.1),g.e-g.s+0.25); }catch(e){ toast(e.message); } });
  /* ---- silence cutting ---- */
  const wave=$m('#sl-wave'); const redraw=()=>{ if(wave&&ANIM._montEn&&S.ranges) anSilDraw(wave,ANIM._montEn,S,M.words); };
  const stats=()=>{ const rm=(S.ranges||[]).filter(r=>r.on!==false).reduce((t,r)=>t+r.b-r.a,0); const n=(S.ranges||[]).filter(r=>r.on!==false).length; const el=$m('#sl-stats'); if(el) el.innerHTML='<div><b>'+n+'</b><small>سكتة</small></div><div><b dir="ltr">'+rm.toFixed(1)+'s</b><small>هتتحذف</small></div><div><b dir="ltr">'+fmtDur(Math.max(0,M.src.dur-rm))+'</b><small>الناتج</small></div>'; };
  const detect=async(quiet)=>{ const b=$m('#sl-detect'); if(b) b.disabled=true; try{ await anMontDetectRun(); }catch(e){ toast(e.message||'تعذّر تحليل الصوت'); } if(!quiet) animRenderPanel(); else { animRenderPanel(); } };
  if(wave&&S.ranges){ requestAnimationFrame(()=>{ if(ANIM._montEn&&ANIM._montEn.id===M.src.id) redraw(); else anMontEnergy().then(()=>redraw()).catch(()=>{}); }); }
  $m('#sl-detect').onclick=()=>detect();
  $m('#sl-on').onchange=async e=>{ S.on=e.target.checked; animSaveSoon(); if(S.on&&has&&!S.ranges){ await detect(true); } else animRenderPanel(); if(nScenes) toast('اضغط «طبّق على المشاهد الموجودين» عشان التغيير يسري على المشاهد اللي اتبنت',4500); };
  box.querySelectorAll('[data-sens]').forEach(b=>b.onclick=async()=>{ S.sens=b.dataset.sens; animSaveSoon(); if(has) await detect(true); else animRenderPanel(); });
  $m('#sl-min').onchange=async e=>{ S.min=+e.target.value; animSaveSoon(); if(has&&S.ranges) await detect(true); };
  if(wave) wave.onclick=e=>{ if(!S.ranges||!ANIM._montEn) return; const r=wave.getBoundingClientRect(); const t=(e.clientX-r.left)/r.width*ANIM._montEn.dur; const hit=S.ranges.find(x=>t>=x.a&&t<=x.b); if(hit){ hit.on=hit.on===false; animSaveSoon(); redraw(); stats(); } };
  let silSrc=null; $m('#sl-play').onclick=async()=>{ try{ const ctx=animActx(); if(silSrc){ try{ silSrc.stop(); }catch(e){} silSrc=null; $m('#sl-play').textContent='▶ اسمع النتيجة'; return; } if(ctx.state==='suspended') await ctx.resume(); const buf=await anMontBuf(); const keep=M.sil.on; const sv=S.on; S.on=true; const P=anMontPieces(M,0,Math.min(M.src.dur,40)); S.on=sv; const d=anPiecesData(buf,P); const ab=ctx.createBuffer(d.ch,d.N,d.sr); d.data.forEach((c,i)=>ab.copyToChannel(c,i)); silSrc=ctx.createBufferSource(); silSrc.buffer=ab; silSrc.connect(ctx.destination); silSrc.onended=()=>{ silSrc=null; const b=document.querySelector('#sl-play'); if(b) b.textContent='▶ اسمع النتيجة'; }; silSrc.start(); $m('#sl-play').textContent='⏹ إيقاف'; }catch(e){ toast(e.message||'تعذّر التشغيل'); } };
  const sa=$m('#sl-apply'); if(sa) sa.onclick=async()=>{ sa.disabled=true; const res=$m('#sl-res'); res.innerHTML='<p class="mt2-hint">جارِ إعادة تقطيع الصوت والفيديو…</p>'; try{ const r=await anMontRecut((k,n)=>{ res.innerHTML='<p class="mt2-hint">مشهد '+k+' من '+n+'…</p>'; }); res.innerHTML='<div class="mt-ok">✅ '+r.n+' مشهد اتحدّث'+(M.sil.on?' · وفّرت '+r.saved.toFixed(1)+' ثانية':' · رجعت الأصل')+'</div>'; }catch(e){ console.warn(e); res.innerHTML='<div class="mt-err">'+esc(e.message||String(e))+'</div>'; } sa.disabled=false; };
  /* ---- transcription ---- */
  if(ANIM._montBusy){ $m('#mt-asr').disabled=true; if(ANIM._montAsrEl) $m('#mt-asrbox').appendChild(ANIM._montAsrEl); }
  $m('#mt-asr').onclick=async()=>{
    if(ANIM._montBusy){ toast('التحويل شغّال بالفعل — استنى لما يخلص'); return; }
    ANIM._montBusy=true; const q=s=>document.querySelector(s);
    const el=document.createElement('div'); el.innerHTML=anAsrUIHtml(); ANIM._montAsrEl=el; const hostEl=q('#mt-asrbox'); hostEl.innerHTML=''; hostEl.appendChild(el);
    const ui=anAsrUI(el.querySelector('.asr')); let cancelled=false; ui.onCancel=()=>{ cancelled=true; };
    const btn=q('#mt-asr'); if(btn) btn.disabled=true;
    const fin=()=>{ ANIM._montBusy=false; ANIM._montAsrEl=null; const b2=q('#mt-asr'); if(b2) b2.disabled=false; };
    try{
      const buf=await anMontBuf(); let words=null;
      for(let attempt=0;attempt<2&&!words;attempt++){
        try{ words=await anRunAsr(buf,{lang:anLang(p),ui}); }
        catch(e){
          /* "Session already started": the model session was left busy (a second run overlapped, or a run was interrupted) — restart the worker once */
          if(!e.cancelled&&!cancelled&&attempt===0&&/session already started/i.test(String(e&&e.message))){ try{ if(ANIM._asrW) ANIM._asrW.kill(); }catch(x){} ANIM._asrW=null; ANIM._asrReady=null; ui.note&&ui.note('أعدت تشغيل محرك Whisper…'); continue; }
          throw e;
        }
      }
      if(cancelled){ fin(); return; }
      if(!words||!words.length) throw new Error('لم يتعرّف على كلام في الملف');
      M.words=words.map(w=>({w:w.w,s:+w.s.toFixed(3),e:+w.e.toFixed(3)})); M.orig=null; if(S.on&&S.ranges){ try{ await anMontDetectRun(); }catch(e){} } fin(); OP.s2=false; OP.s5=true; animSaveSoon(); animRenderPanel(); toast('تم استخراج '+words.length+' كلمة ✅',3500);
    }catch(e){
      fin(); const h2=q('#mt-asrbox');
      if(e.cancelled||cancelled){ if(h2) h2.innerHTML='<p class="hint">اتوقف التحويل.</p>'; return; }
      console.warn(e); if(h2){ h2.innerHTML=anAsrErrHtml(e); anAsrErrBind(h2,e); }
    }
  };
  ANIM._montRep=ANIM._montRep||{}; ANIM._montRes=ANIM._montRes||{};
  box.querySelectorAll('[data-reply]').forEach(t=>t.oninput=()=>{ ANIM._montRep[t.dataset.reply]=t.value; });
  box.querySelectorAll('[data-clip]').forEach(bt=>bt.onclick=async()=>{ const i=bt.dataset.clip; try{ const t=await navigator.clipboard.readText(); box.querySelector('[data-reply="'+i+'"]').value=t; ANIM._montRep[i]=t; toast('تم اللصق — اضغط «طبّق»'); }catch(e){ toast('المتصفح منع قراءة الحافظة — الصق يدويًا (Ctrl+V)'); } });
  box.querySelectorAll('[data-apply]').forEach(btn=>btn.onclick=async()=>{
    const i=+btn.dataset.apply, pt=parts[i]; const ta=box.querySelector('[data-reply="'+i+'"]'); const res=box.querySelector('[data-res="'+i+'"]');
    if(!ta.value.trim()){ toast('الصق رد الذكاء الاصطناعي لهذا الجزء أولًا'); return; }
    if(ANIM._montApplying){ toast('في تطبيق شغّال — استنى'); return; } ANIM._montApplying=true; btn.disabled=true; res.innerHTML='<p class="hint">جارِ بناء المشاهد وتقطيع الصوت…</p>';
    let r; try{ r=await anMontApply(ta.value,(k,n)=>{ res.innerHTML='<p class="hint">مشهد '+k+' من '+n+'…</p>'; },[pt.a,pt.b]); }catch(e){ console.warn(e); r={added:0,errors:[e.message||String(e)]}; }
    ANIM._montApplying=false; btn.disabled=false;
    if(r.added){ ANIM._montRep[i]=''; ta.value=''; }
    const html=(r.fixed?'<div class="mt-ok">✏️ اتصحّحت '+r.fixed+' كلمة/عبارة في النص'+(r.missed&&r.missed.length?' · '+r.missed.length+' ما اتلاقتش':'')+'</div>':'')+(r.added?'<div class="mt-ok">✅ '+r.added+' مشهد اتضاف'+(r.replaced?' (واستبدل '+r.replaced+' قديم)':'')+(r.style?' · الشكل: '+esc(r.style):'')+'</div>':'')+
      (r.errors&&r.errors.length?'<div class="mt-err"><b>⚠️ أخطاء</b><ul>'+r.errors.slice(0,8).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>':'')+
      (r.warnings&&r.warnings.length?'<details class="mt-warn"><summary>ملاحظات ('+r.warnings.length+')</summary><ul>'+r.warnings.slice(0,30).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>':'');
    ANIM._montRes[i]=html; res.innerHTML=html;
    if(r.added){ animRefreshAll(); try{ animSizeCanvas(); }catch(e){} }
  });
}
