/* ===== native bridge integration (inert in a normal browser; active inside the desktop/mobile app) ===== */
(function(){
  const NB=()=>window.NativeBridge||null;
  /* stream a Blob to disk in 8 MB pieces instead of building one giant object URL */
  async function nbSave(blob,name,onProg,opts){ const nb=NB(); const h=await nb.openSave(name,opts||{}); if(!h||h.canceled) return {canceled:true}; const CH=8*1048576;
    try{ for(let o=0;o<blob.size;o+=CH){ const u8=new Uint8Array(await blob.slice(o,o+CH).arrayBuffer()); await nb.write(h.id,u8); onProg&&onProg(Math.min(1,(o+CH)/blob.size)); } }catch(e){ try{ await nb.abortSave(h.id); }catch(x){} throw e; }
    const r=await nb.closeSave(h.id); return {path:(r&&r.path)||h.path}; }
  window.nbSave=nbSave;
  const _dl=animDownload;
  animDownload=function(blob,name){ const nb=NB(); if(nb&&nb.openSave&&blob&&blob.size>=(nb.saveAll?0:8*1048576)){
      nbSave(blob,name,f=>{ try{ animProg(true,f,'جارٍ حفظ الملف على الجهاز…'); }catch(e){} }).then(r=>{ if(r.canceled){ toast('أُلغي الحفظ'); return; } try{ animProg(true,1,'✓ اتحفظ: '+r.path); }catch(e){} toast('تم الحفظ على الجهاز ✅',3500); })
        .catch(e=>{ console.warn(e); toast('تعذّر الحفظ المباشر — جارٍ التنزيل بالمتصفح'); _dl(blob,name); }); return; }
    return _dl(blob,name); };
  const _ffd=animFFmpegDialog;
  animFFmpegDialog=function(){ const nb=NB(); if(!(nb&&nb.hasFfmpeg&&nb.convert)) return _ffd(); const le=ANIM.lastExport; let picked=null;
    openModal(`<div class="modal-head"><h3>🛠️ تحويل بـ FFmpeg الأصلي (سريع، لأي حجم)</h3><button class="icon-btn" onclick="closeModal()" aria-label="إغلاق">✕</button></div>
     <div class="modal-body"><p class="hint">التحويل بيتم بواسطة FFmpeg المثبّت مع التطبيق، من الملف على القرص للقرص مباشرة — من غير تحميل الفيديو في الذاكرة، فالملفات الكبيرة (ساعات / عدّة جيجا) مفيهاش مشكلة.</p>
     <div class="field"><span class="lbl">الملف</span>${le?'<label class="an-sw"><input type="radio" name="nv-src" value="last" checked><span>آخر تصدير: '+esc(le.name)+' ('+(le.blob.size/1048576).toFixed(1)+' MB)</span></label>':''}<label class="an-sw"><input type="radio" name="nv-src" value="file" ${le?'':'checked'}><span>ملف من جهازي</span></label><button type="button" id="nv-pick">📂 اختر ملف فيديو…</button> <span id="nv-picked" class="hint"></span></div>
     <div class="field"><span class="lbl">نوع التحويل</span>
       <label class="an-sw"><input type="radio" name="nv-mode" value="audio" ${le&&le.audio==='opus'?'checked':''}><span>الصوت فقط إلى AAC (الفيديو بيتنسخ زي ما هو — سريع جدًا)</span></label>
       <label class="an-sw"><input type="radio" name="nv-mode" value="full" ${le&&le.audio==='opus'?'':'checked'}><span>تحويل كامل إلى MP4 H.264 + AAC</span></label></div>
     <div class="field"><span class="lbl">الجودة</span><select id="nv-q"><option value="18">عالية (ملف أكبر)</option><option value="22" selected>متوازنة</option><option value="27">ملف أصغر</option></select>
       <label class="an-sw"><input type="checkbox" id="nv-hw" checked><span>استخدم كارت الشاشة للتشفير لو متاح</span></label></div>
     <pre id="nv-log" class="an-fflog"></pre></div>
     <div class="modal-foot"><button id="nv-cancel" hidden>إلغاء</button><button class="pri" id="nv-go">ابدأ التحويل</button></div>`);
    const log=t=>{ const e=$('#nv-log'); if(e) e.textContent=(e.textContent+'\n'+t).split('\n').slice(-8).join('\n'); };
    $('#nv-pick').onclick=async()=>{ const f=await nb.pickVideo(); if(f&&f.path){ picked=f; $('#nv-picked').textContent=f.name+' ('+(f.size/1048576).toFixed(0)+' MB)'; const r=document.querySelector('input[name="nv-src"][value="file"]'); if(r) r.checked=true; } };
    $('#nv-cancel').onclick=()=>{ try{ nb.cancel(); }catch(e){} };
    $('#nv-go').onclick=async()=>{ const src=(document.querySelector('input[name="nv-src"]:checked')||{}).value, mode=(document.querySelector('input[name="nv-mode"]:checked')||{}).value; let input=null;
      $('#nv-go').disabled=true; $('#nv-cancel').hidden=false;
      try{ if(src==='last'&&le){ log('جارٍ تجهيز آخر تصدير…'); const r=await nbSave(le.blob,le.name,null,{temp:true}); input=r.path; } else { if(!picked){ toast('اختر ملفًا'); throw new Error('no file'); } input=picked.path; }
        nb.onProgress&&nb.onProgress(p=>log('التقدم: '+Math.round(p.fraction*100)+'% · '+p.elapsed.toFixed(0)+'ث'));
        const r=await nb.convert({input,mode,crf:+$('#nv-q').value,hw:$('#nv-hw').checked}); log('✓ تم — '+(r.bytes/1048576).toFixed(1)+' MB · '+(r.encoder==='copy'?'نسخ الفيديو':r.encoder)+' · '+r.seconds.toFixed(1)+'ث\n'+r.path);
        if(nb.reveal){ const b=document.createElement('button'); b.textContent='📁 إظهار الملف'; b.onclick=()=>nb.reveal(r.path); $('#nv-log').after(b); }
      }catch(e){ if(e.message!=='no file') log('✗ '+(/cancel/i.test(e.message)?'أُلغي':(e.message||e))); }
      $('#nv-go').disabled=false; $('#nv-cancel').hidden=true; };
  };
})();
