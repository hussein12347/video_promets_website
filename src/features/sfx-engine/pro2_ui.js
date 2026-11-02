/* ===================== transitions grid with live thumbnails ===================== */
const AN_TRANS_GROUPS=[
 ['أساسية',['cut','fade','fade-black','fade-white','flash','blur-dissolve']],
 ['حركة وانزلاق',['slide-left','slide-right','slide-up','slide-down','push-left','push-right','push-up','push-down','whip','curtain','slice-h','stripes']],
 ['مسح وأشكال',['wipe','wipe-rtl','wipe-up','wipe-down','circle','diamond','iris-box','clock','open-h','open-v','split-h','split-v','blinds','mosaic']],
 ['زووم ودوران',['zoom','zoom-in','zoom-out','spin','cross-zoom','zoom-through','flash-zoom','pop-in','drop-in']],
 ['3D وتأثيرات سينمائية',['flip-h','flip-v','cube-left','cube-right','page','wave','film-burn','glitch','rgb-split']]
];
function anTransGrid(cur){
  const used=new Set(); let h='';
  const btn=k=>'<button type="button" data-t="'+k+'" class="tr-b'+(cur===k?' on':'')+'"><canvas width="132" height="74" data-tt="'+k+'"></canvas><span>'+AN_TRANS_AR[k]+'</span></button>';
  AN_TRANS_GROUPS.forEach(([t,ks])=>{ const kk=ks.filter(k=>AN_TRANS_AR[k]); kk.forEach(k=>used.add(k)); if(kk.length) h+='<h4 class="tr-h">'+t+' <small>'+kk.length+'</small></h4><div class="pn-trans tr-grid">'+kk.map(btn).join('')+'</div>'; });
  const rest=Object.keys(AN_TRANS_AR).filter(k=>!used.has(k)); if(rest.length) h+='<h4 class="tr-h">أخرى</h4><div class="pn-trans tr-grid">'+rest.map(btn).join('')+'</div>';
  return h;
}
function anTransThumbs(box){
  const E=ANIM.engine; if(!E) return; let rt=ANIM.rt;
  if(!rt||!rt.transDraw){ try{ rt=ANIM._trRt||(ANIM._trRt=E.createRuntime({width:640,height:360,fps:30,sfx:{on:false},scenes:[]},{images:{}})); }catch(e){ return; } }
  if(!rt||!rt.transDraw) return;
  const W=132,H=74; const mk=(c1,c2,txt)=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,c1); g.addColorStop(1,c2); x.fillStyle=g; x.fillRect(0,0,W,H); x.fillStyle='rgba(255,255,255,.92)'; x.font='800 44px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(txt,W/2,H/2+2); return c; };
  const A=ANIM._trA||(ANIM._trA=mk('#3b6df5','#1c3b9e','A')), B=ANIM._trB||(ANIM._trB=mk('#ff9f43','#e0522a','B'));
  const draw=(cv,p)=>{ const x=cv.getContext('2d'); x.setTransform(1,0,0,1,0,0); x.globalAlpha=1; x.globalCompositeOperation='source-over'; x.fillStyle='#000'; x.fillRect(0,0,W,H); try{ rt.transDraw(x,W,H,A,B,cv.dataset.tt,p); }catch(e){} };
  box.querySelectorAll('canvas[data-tt]').forEach(cv=>{ draw(cv,0.5); const b=cv.parentNode; let raf=0,t0=0;
    const loop=ts=>{ if(!t0) t0=ts; const q=((ts-t0)/1500)%1.4; draw(cv,Math.min(1,q)); raf=requestAnimationFrame(loop); };
    b.onmouseenter=b.onfocus=()=>{ t0=0; cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); };
    b.onmouseleave=b.onblur=()=>{ cancelAnimationFrame(raf); draw(cv,0.5); }; });
}

/* ===================== sounds panel ===================== */
function anSfxPreview(type,vol){
  try{ const E=ANIM.engine, ctx=animActx(); if(ctx.state==='suspended') ctx.resume(); E.scheduleSfx(ctx,ctx.destination,ctx.currentTime+0.03,type,vol==null?0.8:vol,(E.sfxLen&&E.sfxLen(type))||1.2); }catch(e){}
}
function anPanelSounds(box){
  const E=ANIM.engine; if(!E||!E.sfxCatalog){ box.innerHTML=anPanelHead('🔊 أصوات','المحرك لا يدعم مكتبة الأصوات.'); return; }
  const p=ANIM.cur; const S=ANIM.sdSet=Object.assign({cat:'all',q:'',vol:1},ANIM.sdSet||{});
  const cats=E.sfxCats, cat=E.sfxCatalog; const si=anSceneIdx(); const raw=si>=0?p.scenes[si].raw:null; const cur=raw&&Array.isArray(raw.sfx)?raw.sfx:[];
  const items=cat.filter(([id,ar,c])=>(S.cat==='all'||c===S.cat)&&(!S.q||ar.includes(S.q)||id.includes(S.q.toLowerCase())));
  const chip=(k,v)=>'<button type="button" class="el-chip'+(k===S.cat?' on':'')+'" data-sc="'+k+'">'+v+'</button>';
  const trOpts=[['auto','تلقائي (حسب نوع الانتقال)'],['off','بدون صوت انتقالات']].concat(cat.map(([id,ar])=>[id,ar]));
  p.sfx=p.sfx||{on:true,vol:0.45}; const trCur=p.sfx.tr||'auto';
  box.innerHTML=anPanelHead('🔊 مكتبة الأصوات','اضغط على أي صوت لتسمعه، وزر ＋ يضيفه للمشهد المحدد عند مؤشر التشغيل.')+
   '<div class="el-search"><input id="sd-q" type="search" placeholder="ابحث: ووش، ضربة، نجاح…" value="'+esc(S.q)+'" aria-label="بحث في الأصوات"></div>'+
   '<div class="el-cats">'+chip('all','الكل ('+cat.length+')')+Object.entries(cats).map(([k,v])=>chip(k,v)).join('')+'</div>'+
   '<label class="pn-row2"><span class="lbl">مستوى المعاينة والإضافة</span><input type="range" id="sd-v" min="0.2" max="1.5" step="0.05" value="'+S.vol+'"></label>'+
   '<div class="sd-grid">'+(items.length?items.map(([id,ar,c])=>'<div class="sd-it"><button type="button" class="sd-play" data-pl="'+id+'" title="استماع"><span class="sd-ic">▶</span><b>'+esc(ar)+'</b><small>'+(E.sfxLen?E.sfxLen(id).toFixed(1):'')+' ث</small></button><button type="button" class="sd-add" data-add="'+id+'" title="أضف للمشهد عند المؤشر" aria-label="إضافة '+esc(ar)+'">＋</button></div>').join(''):'<p class="hint">مفيش نتائج.</p>')+'</div>'+
   '<div class="pn-sec"><b>صوت الانتقالات</b><select id="sd-tr" aria-label="صوت الانتقالات">'+trOpts.map(([k,v])=>'<option value="'+k+'"'+(k===trCur?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select><p class="hint">«تلقائي» يختار صوتًا مناسبًا لكل انتقال (سويش للسحب، جليتش للجليتش، بووم للفلاش…).</p></div>'+
   '<div class="pn-sec"><b>أصوات المشهد'+(raw?' '+p.scenes[si].data.scene:'')+'</b>'+(cur.length?'<div class="sd-list">'+cur.map((x,k)=>'<div class="sd-row"><button type="button" data-pl="'+esc(x.type||x)+'" class="sd-mini">▶</button><span>'+esc((cat.find(c=>c[0]===(x.type||x))||[0,x.type||x])[1])+'</span><em>'+(+x.at||0).toFixed(2)+' ث</em><button type="button" data-rm="'+k+'" class="sd-mini" aria-label="حذف">✕</button></div>').join('')+'</div>':'<p class="hint">'+(raw?'مفيش أصوات مضافة للمشهد ده.':'اختار مشهدًا أولًا.')+'</p>')+'</div>';
  const re=()=>anPanelSounds(box);
  $('#sd-q',box).oninput=e=>{ S.q=e.target.value.trim(); const pos=e.target.selectionStart; re(); const q=$('#sd-q',box); q.focus(); try{ q.setSelectionRange(pos,pos); }catch(_){} };
  $$('[data-sc]',box).forEach(b=>b.onclick=()=>{ S.cat=b.dataset.sc; re(); });
  $('#sd-v',box).oninput=e=>{ S.vol=+e.target.value; };
  $$('[data-pl]',box).forEach(b=>b.onclick=()=>anSfxPreview(b.dataset.pl,S.vol));
  $$('[data-add]',box).forEach(b=>b.onclick=()=>{ if(si<0){ toast('أضف مشهدًا أولًا'); return; } const at=+Math.max(0,anLocalT(si)).toFixed(2); anSfxPreview(b.dataset.add,S.vol);
    animEdit(()=>{ raw.sfx=Array.isArray(raw.sfx)?raw.sfx:[]; raw.sfx.push({type:b.dataset.add,at,vol:S.vol}); },{scene:si,quiet:true}).then(()=>{ re(); toast('تمت إضافة الصوت عند '+at.toFixed(2)+' ث'); }); });
  $$('[data-rm]',box).forEach(b=>b.onclick=()=>animEdit(()=>{ raw.sfx.splice(+b.dataset.rm,1); },{scene:si,quiet:true}).then(re));
  $('#sd-tr',box).onchange=e=>animEdit(()=>{ p.sfx.tr=e.target.value; },{quiet:true});
}
