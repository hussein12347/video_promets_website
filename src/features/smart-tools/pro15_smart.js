/* ===== pro15: أدوات ذكية — Beat Sync · Director review · Health check · SRT/VTT · Snapshots · Command palette ===== */
(function(){
const $q=(r,s)=>r.querySelector(s);
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmtT=t=>{ t=Math.max(0,t); const m=Math.floor(t/60), s=t-m*60; return m+':'+(s<10?'0':'')+s.toFixed(1); };
const escH=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SM=window.SM=window.SM||{};

/* ---------- 1) beat detection (local, no network) ---------- */
SM.detect=function(buf){
  const sr=buf.sampleRate, n=buf.length, hop=Math.max(1,Math.round(sr*0.01)), win=hop*2;
  const c0=buf.getChannelData(0), c1=buf.numberOfChannels>1?buf.getChannelData(1):null;
  const nf=Math.max(0,Math.floor((n-win)/hop)); if(nf<200) return null;
  const env=new Float32Array(nf), peaks=new Float32Array(nf);
  for(let f=0;f<nf;f++){ let e=0,pk=0; const a=f*hop; for(let i=0;i<win;i+=2){ let v=c0[a+i]; if(c1) v=(v+c1[a+i])*0.5; e+=v*v; const av=v<0?-v:v; if(av>pk) pk=av; } env[f]=Math.log(1+200*Math.sqrt(e/(win/2))); peaks[f]=pk; }
  const flux=new Float32Array(nf); for(let f=1;f<nf;f++){ const d=env[f]-env[f-1]; flux[f]=d>0?d:0; }
  const sm=new Float32Array(nf); for(let f=1;f<nf-1;f++) sm[f]=(flux[f-1]+2*flux[f]+flux[f+1])/4;
  /* tempo: autocorrelation over first ~120 s, 55–190 bpm, mild prior around 118 bpm */
  const L=Math.min(nf,12000), lo=32, hi=110; let best=0, bestLag=0; const ac=new Float32Array(hi+2);
  for(let lag=lo-1;lag<=hi+1;lag++){ let s=0; for(let i=lag;i<L;i++) s+=sm[i]*sm[i-lag]; ac[lag]=s/(L-lag); }
  for(let lag=lo;lag<=hi;lag++){ const bpm=6000/lag; const prior=Math.exp(-Math.pow(Math.log2(bpm/118),2)/(2*0.55*0.55)); const sc=ac[lag]*prior; if(sc>best){ best=sc; bestLag=lag; } }
  if(!bestLag) return null;
  let P=bestLag; { const a=ac[bestLag-1], b=ac[bestLag], c=ac[bestLag+1]; const den=a-2*b+c; if(den<0) P=bestLag+0.5*(a-c)/den; }
  let ph=0, bs=-1; for(let p0=0;p0<Math.ceil(P);p0++){ let s=0; for(let k=0;;k++){ const i=Math.round(p0+k*P); if(i>=nf-1) break; s+=sm[i]+0.5*(sm[i-1>=0?i-1:i]+sm[i+1]); } if(s>bs){ bs=s; ph=p0; } }
  const dur=n/sr, comp=win/sr; let period=P*hop/sr, first=ph*hop/sr+comp;
  /* onsets (for display + confidence) */
  let mean=0; for(let i=0;i<nf;i++) mean+=sm[i]; mean/=nf; let vr=0; for(let i=0;i<nf;i++) vr+=(sm[i]-mean)*(sm[i]-mean); const sd=Math.sqrt(vr/nf), th=mean+1.2*sd;
  const onsets=[]; let last=-99; for(let i=2;i<nf-2;i++){ if(sm[i]>th&&sm[i]>=sm[i-1]&&sm[i]>=sm[i+1]&&i-last>=12){ onsets.push(+(i*hop/sr).toFixed(3)); last=i; } }
  /* least-squares refine of period/phase using onsets near the grid */
  { const xs=[],ys=[]; for(let k=0;;k++){ const t=first+k*period; if(t>Math.min(dur,90)) break; let bo=null,bd=0.07; for(const o of onsets){ const d=Math.abs(o+comp-t); if(d<bd){ bd=d; bo=o+comp; } } if(bo!=null){ xs.push(k); ys.push(bo); } }
    if(xs.length>=6){ const m=xs.length; let sx=0,sy=0,sxx=0,sxy=0; for(let i=0;i<m;i++){ sx+=xs[i]; sy+=ys[i]; sxx+=xs[i]*xs[i]; sxy+=xs[i]*ys[i]; } const den=m*sxx-sx*sx; if(den>0){ const sl=(m*sxy-sx*sy)/den, ic=(sy-sl*sx)/m; if(Math.abs(sl-period)<period*0.03){ period=sl; first=ic; } } } }
  first=((first%period)+period)%period;
  const near=t=>{ let m=1e9; for(const o of onsets){ const d=Math.abs(o+comp-t); if(d<m) m=d; else if(o>t) break; } return m; };
  let hit=0,tot=0; for(let t=first;t<Math.min(dur,60);t+=period){ tot++; if(near(t)<0.06) hit++; }
  const wave=[]; const bins=600, per=Math.max(1,Math.floor(nf/bins)); for(let b=0;b<bins;b++){ let m=0; for(let i=b*per;i<Math.min(nf,(b+1)*per);i++) if(peaks[i]>m) m=peaks[i]; wave.push(m); }
  return {bpm:+(60/period).toFixed(1), period, first, dur, onsets, wave, conf:tot?hit/tot:0};
};
SM.grid=function(B,mul){ /* beat times, mul=1 beat, 2 = every other, 0.5 = half-beats */
  const P=B.period*(mul||1), out=[]; for(let t=B.first%P;t<B.dur+1e-6;t+=P) out.push(+t.toFixed(4)); return out; };

/* ---------- state ---------- */
SM.st=function(){ const s=ANIM._sm=ANIM._sm||{src:'',mul:1,off:0,mode:'snap',per:4,B:null,name:'',open:{b:true,r:false,h:false,x:false,v:false,w:false,p:false,l:false,t:false}}; return s; };

/* ---------- 2) apply beat sync to scene durations ---------- */
SM.eligible=function(s){ return !(s.audioKey||(s.words&&s.words.length)||(s.raw&&(s.raw._mont||s.raw._quran))); };
SM.plan=function(){
  const S=SM.st(), p=ANIM.cur, rt=ANIM.rt; if(!S.B||!rt) return null;
  const mul=S.mode==='snap'?(+S.mul||1):1;
  const g=SM.grid(S.B,mul).map(t=>t+(+S.off||0)).filter(t=>t>0.4);
  const per=S.B.period*(+S.per||4);
  let cur=0; const out=[]; let skipped=0, changed=0;
  p.scenes.forEach((sc,i)=>{
    const Ls=rt.layout.scenes[i]; const d0=Ls?Ls.dur:(sc.data&&sc.data.duration)||3;
    if(!SM.eligible(sc)){ out.push({i,keep:true,start:cur,dur:d0}); cur+=d0; skipped++; return; }
    let want=S.mode==='fixed'?cur+per:cur+d0, tgt=want, bd=1e9;
    g.forEach(t=>{ if(t<cur+0.6) return; const d=Math.abs(t-want); if(d<bd){ bd=d; tgt=t; } });
    if(!g.length||tgt<cur+0.6) tgt=cur+Math.max(0.6,d0);
    const dur=+(tgt-cur).toFixed(3); if(Math.abs(dur-d0)>0.01) changed++; out.push({i,dur,start:cur}); cur=tgt;
  });
  return {rows:out,skipped,changed,total:cur};
};
SM.applyBeat=async function(){
  const pl=SM.plan(); if(!pl) return 0; const p=ANIM.cur;
  await animEdit(()=>{ pl.rows.forEach(r=>{ if(r.keep) return; const sc=p.scenes[r.i]; sc.raw.duration=r.dur; delete sc.raw.len; if(sc.raw.holdAnim===undefined) sc.raw.holdAnim=sc.raw.holdAnim; }); });
  return pl.changed;
};

/* ---------- 3) storyboard sheet + director review ---------- */
SM.sceneInfo=function(){
  const p=ANIM.cur, rt=ANIM.rt; if(!rt) return [];
  return p.scenes.map((sc,i)=>{ const L=rt.layout.scenes[i]; const d=L?L.data:(sc.data||{});
    const texts=(d.layers||[]).filter(l=>l.type==='text'&&l.text).map(l=>String(l.text).replace(/\s+/g,' ').slice(0,90));
    return {n:i+1,start:+(L?L.start:0).toFixed(2),dur:+(L?L.dur:0).toFixed(2),texts,
      layers:(d.layers||[]).length,transition:(d.transition&&d.transition.type)||'cut',
      effects:(d.effects||[]).map(e=>e.type),hasAudio:!!(sc.audioKey),user:!!(sc.raw&&sc.raw._user)}; });
};
SM.sheet=function(opts){
  opts=opts||{}; const p=ANIM.cur, rt=ANIM.rt; if(!rt||!p.scenes.length) return null;
  const d=animDims(p), cw=opts.w||300, ch=Math.round(cw*d.H/d.W); const n=p.scenes.length;
  const cols=clampN(Math.round(Math.sqrt(n*(d.W/d.H))+0.4),1,6), rows=Math.ceil(n/cols); const pad=10, lab=34;
  const cv=document.createElement('canvas'); cv.width=cols*(cw+pad)+pad; cv.height=rows*(ch+lab+pad)+pad+30;
  const x=cv.getContext('2d'); x.fillStyle='#10131f'; x.fillRect(0,0,cv.width,cv.height); x.fillStyle='#cfd5ff'; x.font='bold 15px sans-serif'; x.textBaseline='middle';
  x.fillText((p.name||'Project')+'  ·  '+n+' scenes  ·  '+fmtT(rt.total)+'  ·  '+p.ratio,pad,16);
  const tmp=document.createElement('canvas'); tmp.width=cw; tmp.height=ch; const tx=tmp.getContext('2d');
  p.scenes.forEach((sc,i)=>{ const L=rt.layout.scenes[i]; const col=i%cols, row=Math.floor(i/cols); const ox=pad+col*(cw+pad), oy=30+pad+row*(ch+lab+pad);
    tx.setTransform(1,0,0,1,0,0); tx.fillStyle='#000'; tx.fillRect(0,0,cw,ch);
    try{ rt.renderFrame(tx,cw,ch,L.start+Math.min(L.dur*0.6,Math.max(0.05,L.dur-0.05)),{handAssets:animHandAssets(),cssGrade:false,lite:true}); }catch(e){}
    x.drawImage(tmp,ox,oy); x.strokeStyle='#39406a'; x.strokeRect(ox+.5,oy+.5,cw-1,ch-1);
    x.fillStyle='#e9ecff'; x.font='bold 13px sans-serif'; x.fillText('#'+(i+1)+'   '+fmtT(L.start)+'  →  '+L.dur.toFixed(1)+'s',ox+2,oy+ch+13);
    x.fillStyle='#8f98d6'; x.font='11px sans-serif'; x.fillText(((L.data.transition&&L.data.transition.type)||'cut')+' · '+(L.data.layers||[]).length+' layers',ox+2,oy+ch+27); });
  return cv;
};
SM.reviewPrompt=function(goal,hasImg){
  const p=ANIM.cur, info=SM.sceneInfo(); const fx=(ANIM.engine&&ANIM.engine.EFFECTS)||['vignette','grain','fog','dust','sparkles','bokeh','embers','lightrays','letterbox','chromatic'];
  const L=[]; L.push('You are a senior video editor reviewing a short animated video that I built in a browser studio. '+(hasImg?'The attached image is a contact sheet: one frame per scene, labelled with scene number, start time and duration.':'No image is attached, so judge from the data only.'));
  L.push('PROJECT: '+(p.name||'Untitled')+' | ratio '+p.ratio+' | total '+fmtT(ANIM.rt.total)+' | '+info.length+' scenes.');
  L.push('MY GOAL: '+(goal||'Make it feel professional: strong hook in the first 3 seconds, good pacing, no dead scenes, consistent look.'));
  L.push('SCENES (JSON):'); L.push(JSON.stringify(info));
  L.push('Review pacing, hook, rhythm (too-long / too-short scenes), transitions, visual consistency, readability of text, and variety.');
  L.push('Then reply with ONE JSON object ONLY (no markdown fences, no commentary) in exactly this shape:');
  L.push('{"summary":"2-3 sentence verdict in Egyptian Arabic","score":0-100,"ops":[ ... ]}');
  L.push('Allowed ops (scene = 1-based number from the list above; use at most 12 ops, only ones that clearly help):');
  L.push('{"scene":N,"duration":seconds}  // 0.6–40, only scenes with hasAudio=false');
  L.push('{"scene":N,"transition":"cut"|"fade"}');
  L.push('{"scene":N,"text":["new text for 1st text layer","2nd text layer"...]}  // rewrite on-screen text, keep the same language');
  L.push('{"scene":N,"addEffects":["'+fx.slice(0,14).join('","')+'"]}  // pick 1–2 from this list');
  L.push('{"scene":N,"clearEffects":true}');
  L.push('{"scene":N,"delete":true}  // only if truly redundant');
  L.push('{"scene":N,"moveTo":M}  // reorder to position M');
  L.push('Never invent scene numbers. Do not touch scenes with user=true unless the goal says so.');
  return L.join('\n');
};
SM.extractJson=function(t){ t=String(t||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,''); const a=t.indexOf('{'), b=t.lastIndexOf('}'); if(a<0||b<=a) throw new Error('مفيش JSON في الرد'); return JSON.parse(t.slice(a,b+1)); };
SM.applyReview=async function(obj){
  const p=ANIM.cur; const ops=Array.isArray(obj)?obj:(obj.ops||[]); if(!ops.length) return {n:0,skipped:0,msg:''};
  const uids=p.scenes.map(s=>s.uid); const FX=new Set((ANIM.engine&&ANIM.engine.EFFECTS)||['vignette','grain','flicker','glitch','oldfilm','lightleak','fog','rain','snow','dust','sparkles','bokeh','embers','letterbox','chromatic','lightrays','halftone']);
  let n=0, skipped=0; const moves=[], dels=new Set();
  await animEdit(()=>{ ops.forEach(op=>{ const u=uids[(+op.scene||0)-1]; const sc=u&&p.scenes.find(s=>s.uid===u); if(!sc){ skipped++; return; } const r=sc.raw;
    if(op.delete===true){ dels.add(u); n++; return; }
    if(op.moveTo!=null){ moves.push([u,clampN(Math.round(+op.moveTo)-1,0,uids.length-1)]); n++; }
    if(op.duration!=null&&SM.eligible(sc)){ r.duration=+clampN(+op.duration||0,0.6,40).toFixed(2); delete r.len; n++; } else if(op.duration!=null) skipped++;
    if(op.transition&&/^(cut|fade)$/.test(op.transition)){ r.transition={type:op.transition,dur:op.transition==='cut'?0:0.5}; n++; }
    if(op.text!=null){ const arr=Array.isArray(op.text)?op.text:[op.text]; let k=0; (r.layers||[]).forEach(l=>{ if(l&&l.type==='text'&&k<arr.length&&typeof arr[k]==='string'){ l.text=arr[k]; k++; } }); if(k) n++; else skipped++; }
    if(op.clearEffects===true){ r.effects=[]; n++; }
    if(Array.isArray(op.addEffects)){ const cur=(Array.isArray(r.effects)?r.effects:(r.effects?[r.effects]:[])).slice(); const has=new Set(cur.map(e=>typeof e==='string'?e:e.type)); let add=0; op.addEffects.slice(0,3).forEach(e=>{ if(FX.has(e)&&!has.has(e)){ cur.push({type:e}); add++; } }); if(add){ r.effects=cur; n++; } else skipped++; }
  });
  if(dels.size||moves.length){ let arr=p.scenes.filter(s=>!dels.has(s.uid)); moves.forEach(([u,to])=>{ const i=arr.findIndex(s=>s.uid===u); if(i<0) return; const it=arr.splice(i,1)[0]; arr.splice(clampN(to,0,arr.length),0,it); }); p.scenes=arr; } });
  return {n,skipped,msg:(obj&&obj.summary)||''};
};

/* ---------- 4) health check ---------- */
SM.health=function(){
  const p=ANIM.cur, rt=ANIM.rt, out=[]; if(!rt) return out; const info=SM.sceneInfo();
  const push=(lvl,id,t,fix)=>out.push({lvl,id,t,fix});
  if(!p.scenes.length) return [{lvl:'warn',id:'empty',t:'المشروع فاضي — ابدأ من تبويب «من فيديو أو صوت» أو «ريلز قرآن».'}];
  const total=rt.total, vertical=(ANIM_RATIOS[p.ratio]||[16,9])[1]>(ANIM_RATIOS[p.ratio]||[16,9])[0];
  if(vertical&&total>90) push('warn','long','الفيديو الطولي '+fmtT(total)+' — الريلز/الشورتس بتشتغل أحسن تحت 90 ثانية.');
  const shortS=info.filter(s=>s.dur<0.9&&!s.hasAudio), longS=info.filter(s=>s.dur>14&&!s.hasAudio);
  if(shortS.length) push('warn','short','مشاهد أقصر من 0.9 ث ('+shortS.map(s=>'#'+s.n).join('، ')+') — ممكن تبان كوميضة.','fix-short');
  if(longS.length) push('warn','longs','مشاهد أطول من 14 ث ('+longS.map(s=>'#'+s.n).join('، ')+') — الملل خطر؛ قسّمها أو قصّرها.','fix-long');
  const bare=info.filter(s=>!s.texts.length&&s.layers<2&&!s.hasAudio); if(bare.length) push('info','bare','مشاهد شبه فاضية ('+bare.map(s=>'#'+s.n).join('، ')+').');
  const durs=info.map(s=>s.dur); if(durs.length>=4){ const mx=Math.max(...durs), mn=Math.min(...durs); if(mx/Math.max(0.1,mn)>8) push('info','rhythm','إيقاع غير متجانس: أقصر مشهد '+mn.toFixed(1)+' ث وأطول '+mx.toFixed(1)+' ث.'); }
  if(info.length>=4&&info.every(s=>s.transition==='cut')) push('info','trans','كل الانتقالات «قطع» — جرّب fade على نقاط تغيّر الموضوع.');
  if(!(p.audio&&p.audio.length)&&!p.scenes.some(s=>s.audioKey)) push('warn','noaudio','مفيش أي صوت (تعليق أو موسيقى) في المشروع.');
  else { const clips=(p.audio||[]).filter(a=>a.role!=='quran'); const ends=(p.audio||[]).map(a=>a.start+(a.len||0)); if(ends.length&&Math.max(...ends)+0.5<total&&!p.scenes.some(s=>s.audioKey)) push('warn','audshort','الصوت بيخلص عند '+fmtT(Math.max(...ends))+' والفيديو '+fmtT(total)+'.'); }
  try{ const miss=animMissing(p); if(miss&&(miss.length||miss.count)) push('bad','missing','ملفات ناقصة في المشروع ('+(miss.length||miss.count)+') — راجع شريط الوسائط.'); }catch(e){}
  const warns=p.scenes.reduce((a,s)=>a+((s.raw&&s.raw.warnings&&s.raw.warnings.length)||0),0); if(warns) push('info','warns','فيه '+warns+' تحذير من المحرك على بعض المشاهد.');
  if(!out.length) push('ok','ok','ممتاز ✔ مفيش أي مشكلة واضحة في المشروع.');
  return out;
};
SM.fix=async function(id){
  const p=ANIM.cur; const info=SM.sceneInfo(); let n=0;
  await animEdit(()=>{ info.forEach(s=>{ const sc=p.scenes[s.n-1]; if(!sc||s.hasAudio) return;
    if(id==='fix-short'&&s.dur<0.9){ sc.raw.duration=1.2; delete sc.raw.len; n++; }
    if(id==='fix-long'&&s.dur>14){ sc.raw.duration=12; delete sc.raw.len; n++; } }); });
  return n;
};

/* ---------- 5) SRT / VTT ---------- */
SM.cues=function(){
  const p=ANIM.cur, rt=ANIM.rt, cues=[]; if(!rt) return cues;
  p.scenes.forEach((sc,i)=>{ const L=rt.layout.scenes[i]; if(!L) return; const w=sc.words;
    if(w&&w.length){ let cur=null; w.forEach(x=>{ const s=L.start+(+x.s||0), e=L.start+(+x.e||0); if(!cur||cur.n>=7||s-cur.e>0.9){ cur={s,e,t:x.w||x.word||'',n:1}; cues.push(cur); } else { cur.t+=' '+(x.w||x.word||''); cur.e=e; cur.n++; } }); return; }
    const d=L.data; const tl=(d.layers||[]).filter(l=>l.type==='text'&&l.text&&!(l.role==='deco')); if(!tl.length) return;
    const main=tl.slice().sort((a,b)=>String(b.text).length-String(a.text).length)[0];
    cues.push({s:L.start,e:L.start+L.dur,t:String(main.text).replace(/\s+/g,' ').trim(),n:0}); });
  return cues.filter(c=>c.t&&c.e>c.s);
};
SM.srt=function(vtt){ const f=t=>{ const ms=Math.round(t*1000); const h=Math.floor(ms/3600000), m=Math.floor(ms%3600000/60000), s=Math.floor(ms%60000/1000), r=ms%1000; const z=(v,k)=>String(v).padStart(k,'0'); return z(h,2)+':'+z(m,2)+':'+z(s,2)+(vtt?'.':',')+z(r,3); };
  const cs=SM.cues(); let o=vtt?'WEBVTT\n\n':''; cs.forEach((c,i)=>{ o+=(vtt?'':(i+1)+'\n')+f(c.s)+' --> '+f(c.e)+'\n'+c.t+'\n\n'; }); return o; };
SM.download=function(name,data,type){ const b=data instanceof Blob?data:new Blob([data],{type:type||'text/plain;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500); };

/* ---------- 6) snapshots (version history) ---------- */
SM.snapKey=()=>'an_snaps_'+(ANIM.cur&&ANIM.cur.id);
SM.snaps=function(){ try{ return JSON.parse(localStorage.getItem(SM.snapKey())||'[]'); }catch(e){ return []; } };
SM.snapSave=function(label,auto){
  if(!ANIM.cur) return false; const data=animSnap(); if(data.length>1.6e6) { if(!auto) toast('المشروع كبير جدًا للنسخ الاحتياطي المحلي'); return false; }
  let a=SM.snaps(); const last=a[a.length-1]; if(last&&last.data===data) return false;
  a.push({t:Date.now(),label:label||'',auto:!!auto,n:ANIM.cur.scenes.length,data});
  const keepAuto=a.filter(x=>x.auto).slice(-4), manual=a.filter(x=>!x.auto).slice(-6); a=a.filter(x=>keepAuto.includes(x)||manual.includes(x));
  for(;;){ try{ localStorage.setItem(SM.snapKey(),JSON.stringify(a)); return true; }catch(e){ if(a.length<=1) return false; a.shift(); } }
};
SM.snapRestore=async function(i){ const a=SM.snaps(); if(!a[i]) return false; animPushUndo(); await animRestore(a[i].data); return true; };
if(!SM._iv){ SM._iv=setInterval(()=>{ try{ if(document.hidden||!ANIM.cur||!ANIM.cur.scenes.length||!document.querySelector('#ed')) return; SM.snapSave('تلقائي',true); }catch(e){} },300000); }

/* ---------- panel ---------- */
window.anPanelSmart=function(host){
  const S=SM.st(), p=ANIM.cur, O=S.open;
  const sec=(id,ic,t,sub,body)=>`<section class="sm-card${O[id]?' open':''}" data-sec="${id}"><button type="button" class="sm-hd" aria-expanded="${!!O[id]}" data-tog="${id}"><span class="sm-ic" aria-hidden="true">${ic}</span><span class="sm-tt"><b>${t}</b><small>${sub}</small></span><span class="sm-chev" aria-hidden="true">▾</span></button><div class="sm-bd"${O[id]?'':' hidden'}>${body}</div></section>`;
  const srcs=[]; (p.audio||[]).forEach((a,i)=>{ if(ANIM.buffers[a.key]) srcs.push(['c'+i,'🎵 '+(a.name||'مقطع')+' ('+(a.role||'صوت')+')',a]); });
  p.scenes.forEach((s,i)=>{ if(s.audioKey&&ANIM.buffers[s.audioKey]) srcs.push(['s'+i,'🎙️ مشهد '+(i+1)+' — '+(s.audioName||'تعليق'),null]); });
  const B=S.B;
  const beatBody=`<p class="hint">يحلّل الإيقاع محليًا من أي مقطع صوت (موسيقى المشروع أو ملف تضيفه) ← تضبط أطوال المشاهد وقطعاتها على الـBeat. مفيش أي رفع أو اتصال.</p>
   <div class="sm-row"><select id="sm-src" aria-label="مصدر الإيقاع"><option value="">— اختار مقطع صوت من المشروع —</option>${srcs.map(x=>`<option value="${x[0]}"${S.src===x[0]?' selected':''}>${escH(x[1])}</option>`).join('')}</select><label class="mt2-btn" for="sm-file">⬆️ أو ملف جديد</label><input type="file" id="sm-file" accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg" hidden></div>
   <div id="sm-bmsg" class="sm-msg" aria-live="polite"></div>
   ${B?`<canvas id="sm-cv" class="sm-cv" width="900" height="120" aria-label="شكل الموجة ونقاط الإيقاع وحدود المشاهد"></canvas>
   <div class="sm-chips"><span class="mt2-chip" id="sm-bpm">${B.bpm} BPM</span><span class="mt2-chip">ثقة ${Math.round(B.conf*100)}%</span><button type="button" class="mt2-chip act" id="sm-half" title="لو الإيقاع طلع ضعف الحقيقي">÷ 2</button><button type="button" class="mt2-chip act" id="sm-dbl" title="لو الإيقاع طلع نص الحقيقي">× 2</button></div>
   <div class="sm-grid3"><label><span class="lbl">الطريقة</span><select id="sm-mode"><option value="snap"${S.mode==='snap'?' selected':''}>اسحب القطعات لأقرب Beat</option><option value="fixed"${S.mode==='fixed'?' selected':''}>كل مشهد = عدد ثابت من الـBeats</option></select></label>
   <label><span class="lbl">${S.mode==='fixed'?'عدد Beats للمشهد':'الشبكة'}</span>${S.mode==='fixed'?`<select id="sm-per">${[2,4,8,16].map(v=>`<option value="${v}"${+S.per===v?' selected':''}>${v} beats</option>`).join('')}</select>`:`<select id="sm-mul"><option value="0.5"${+S.mul===0.5?' selected':''}>نص beat</option><option value="1"${+S.mul===1?' selected':''}>كل beat</option><option value="2"${+S.mul===2?' selected':''}>كل beatين</option><option value="4"${+S.mul===4?' selected':''}>كل 4 (ميزان)</option></select>`}</label>
   <label><span class="lbl">إزاحة الموسيقى (ث)</span><input type="number" step="0.05" id="sm-off" value="${(+S.off||0).toFixed(2)}"></label></div>
   <div class="sm-row"><button type="button" class="mt2-btn pri" id="sm-apply">🥁 طبّق على المشاهد</button><span class="sm-note" id="sm-plan"></span></div>`:''}`;
  const revBody=`<p class="hint">طريقة «المخرج الذكي»: التطبيق يطلّع لك لوحة بكل المشاهد + برومبت، تبعتهم لأي نموذج بيشوف الصور (Claude / ChatGPT / Gemini)، والرد (JSON) تلصقه هنا فيتطبّق كتعديلات قابلة للتراجع.</p>
   <div class="sm-row"><input id="sm-goal" dir="auto" aria-label="هدفك من المراجعة" placeholder="هدفك؟ مثال: ريلز حماسي، هوك قوي في أول 3 ثواني" value="${escH(S.goal||'')}"></div>
   <div class="sm-row"><button type="button" class="mt2-btn" id="sm-sheet">🖼️ ابنِ لوحة المشاهد</button><button type="button" class="mt2-btn pri" id="sm-copy">📋 انسخ البرومبت</button><button type="button" class="mt2-btn" id="sm-sdl" disabled>⬇️ نزّل اللوحة PNG</button></div>
   <div id="sm-sheetbox" class="sm-sheetbox"></div>
   <label class="sm-lab" for="sm-reply">رد النموذج (JSON)</label><textarea id="sm-reply" dir="ltr" rows="5" placeholder='{"summary":"…","ops":[{"scene":2,"duration":3.5}]}'></textarea>
   <div class="sm-row"><button type="button" class="mt2-btn pri" id="sm-ap">✅ طبّق التعديلات</button><span class="sm-note" id="sm-rmsg" aria-live="polite">${escH(S.rmsg||'')}</span></div>`;
  const hb=(()=>{ const h=SM.health(); return h.map(x=>`<li class="sm-h ${x.lvl}"><span class="sm-dot" aria-hidden="true"></span><span>${escH(x.t)}</span>${x.fix?`<button type="button" class="mt2-btn sm-fix" data-fix="${x.fix}">إصلاح تلقائي</button>`:''}</li>`).join(''); })();
  const hBody=`<ul class="sm-hl" id="sm-hl">${hb}</ul><div class="sm-row"><button type="button" class="mt2-btn" id="sm-hre">🔄 افحص تاني</button></div>`;
  const xBody=`<p class="hint">ترجمة/تعليق جاهز لأي برنامج (Premiere · DaVinci · CapCut · YouTube). بيستخدم توقيت الكلمات لو موجود، وإلا نص كل مشهد.</p><div class="sm-row"><button type="button" class="mt2-btn pri" id="sm-srt">⬇️ SRT</button><button type="button" class="mt2-btn" id="sm-vtt">⬇️ VTT</button><span class="sm-note" id="sm-xmsg"></span></div>`;
  const sn=SM.snaps(); const vBody=`<p class="hint">نسخ احتياطية للمشروع (المشاهد والإعدادات) محفوظة في متصفحك — تلقائيًا كل 5 دقائق وقت التعديل، ويدويًا وقت ما تحب.</p><div class="sm-row"><input id="sm-snl" dir="auto" aria-label="اسم النسخة" placeholder="اسم النسخة (اختياري)"><button type="button" class="mt2-btn pri" id="sm-snb">💾 احفظ نسخة</button></div>
   <ul class="sm-snl" id="sm-snl-list">${sn.length?sn.slice().reverse().map((x,k)=>{ const i=sn.length-1-k; return `<li><span><b>${escH(x.label||new Date(x.t).toLocaleTimeString())}</b><small>${new Date(x.t).toLocaleString()} · ${x.n} مشهد${x.auto?' · تلقائي':''}</small></span><button type="button" class="mt2-btn" data-rs="${i}">استرجاع</button></li>`; }).join(''):'<li class="sm-empty">لسه مفيش نسخ محفوظة.</li>'}</ul>`;
  host.innerHTML=`<div class="sm-wrap">`+
    sec('b','🥁','مزامنة على الإيقاع (Beat Sync)','حلّل الموسيقى واضبط القطعات عليها',beatBody)+
    sec('r','🎬','مراجعة المخرج بالذكاء الاصطناعي','لوحة مشاهد + برومبت ← تعديلات تلقائية',revBody)+
    sec('h','🩺','فحص جودة المشروع','مشاكل الإيقاع والصوت والملفات',hBody)+
    sec('x','💬','تصدير ترجمة SRT / VTT','للمشروع كله',xBody)+
    SM.extraSections(sec)+sec('v','🕘','سجل النسخ','احفظ واسترجع',vBody)+`<p class="sm-kb"><kbd>Ctrl</kbd>+<kbd>K</kbd> لوحة الأوامر — أي أداة بضغطة</p></div>`;
  SM.bind(host); SM.bindExtra(host);
};
SM.drawStrip=function(host){
  const S=SM.st(), B=S.B, cv=host.querySelector('#sm-cv'); if(!B||!cv) return; const x=cv.getContext('2d'), W=cv.width, H=cv.height;
  const cs=getComputedStyle(document.documentElement); const dark=document.documentElement.getAttribute('data-theme')==='dark'||matchMedia('(prefers-color-scheme: dark)').matches&&document.documentElement.getAttribute('data-theme')!=='light';
  x.clearRect(0,0,W,H); x.fillStyle=dark?'#161a30':'#f3f5fa'; x.fillRect(0,0,W,H);
  const span=Math.min(B.dur,Math.max(ANIM.rt?ANIM.rt.total:0,20)+2); const X=t=>t/span*W;
  x.fillStyle=dark?'#4a5290':'#9aa5e8'; B.wave.forEach((m,i)=>{ const t=i/B.wave.length*B.dur; if(t>span) return; const h=Math.max(1,m*H*0.8); x.fillRect(X(t),(H-h)/2,Math.max(1,W/B.wave.length*B.dur/span-0.5),h); });
  const g=SM.grid(B,+S.mul||1).map(t=>t+(+S.off||0)); x.strokeStyle='#e8548a'; x.lineWidth=1; g.forEach(t=>{ if(t<0||t>span) return; x.beginPath(); x.moveTo(X(t)+.5,0); x.lineTo(X(t)+.5,H); x.stroke(); });
  if(ANIM.rt){ x.strokeStyle='#21b573'; x.lineWidth=2; ANIM.rt.layout.scenes.forEach(L=>{ if(L.start>span||L.start<=0) return; x.beginPath(); x.moveTo(X(L.start),0); x.lineTo(X(L.start),H*0.35); x.stroke(); }); }
};
SM.loadBuf=async function(host,v){
  const S=SM.st(), msg=host.querySelector('#sm-bmsg'); const p=ANIM.cur; let buf=null, off=0, name='';
  if(v&&v[0]==='c'){ const a=p.audio[+v.slice(1)]; buf=a&&ANIM.buffers[a.key]; off=a?(a.start-(a.trimIn||0)):0; name=a&&a.name; }
  else if(v&&v[0]==='s'){ const s=p.scenes[+v.slice(1)]; buf=s&&ANIM.buffers[s.audioKey]; if(ANIM.rt&&ANIM.rt.layout.scenes[+v.slice(1)]) off=ANIM.rt.layout.scenes[+v.slice(1)].start; name=s&&s.audioName; }
  if(!buf){ if(msg) msg.textContent='تعذّر قراءة الصوت.'; return; }
  if(msg) msg.textContent='جارِ تحليل الإيقاع…'; await new Promise(r=>setTimeout(r,30));
  const B=SM.detect(buf); if(!B){ if(msg) msg.textContent='الصوت قصير أو ما فيهوش إيقاع واضح.'; S.B=null; return; }
  S.B=B; S.off=+off.toFixed(3); S.name=name||''; S.src=v||''; animRenderPanel();
};

SM.bind=function(host){
  const S=SM.st(), p=ANIM.cur; const $=s=>host.querySelector(s);
  host.querySelectorAll('[data-tog]').forEach(b=>b.onclick=()=>{ const id=b.dataset.tog; S.open[id]=!S.open[id]; const c=b.closest('.sm-card'); c.classList.toggle('open',S.open[id]); b.setAttribute('aria-expanded',!!S.open[id]); c.querySelector('.sm-bd').hidden=!S.open[id]; if(id==='b'&&S.open[id]) SM.drawStrip(host); });
  const src=$('#sm-src'); if(src) src.onchange=()=>{ if(src.value) SM.loadBuf(host,src.value); };
  const f=$('#sm-file'); if(f) f.onchange=async()=>{ const file=f.files[0]; if(!file) return; const m=$('#sm-bmsg'); m.textContent='جارِ القراءة والتحليل…'; try{ const buf=await animDecode(await file.arrayBuffer()); const B=SM.detect(buf); if(!B){ m.textContent='الملف قصير أو ما فيهوش إيقاع واضح.'; return; } S.B=B; S.off=0; S.src=''; S.name=file.name; animRenderPanel(); }catch(e){ m.textContent='ما قدرتش أقرأ الملف: '+(e.message||e); } };
  const ch=(id,fn)=>{ const e=$(id); if(e) e.onchange=()=>{ fn(e); animRenderPanel(); }; };
  ch('#sm-mode',e=>S.mode=e.value); ch('#sm-mul',e=>S.mul=+e.value); ch('#sm-per',e=>S.per=+e.value); ch('#sm-off',e=>S.off=+e.value||0);
  const scale=k=>{ const B=S.B; B.period*=k; animRenderPanel(); }; const h=$('#sm-half'); if(h) h.onclick=()=>scale(2); const d=$('#sm-dbl'); if(d) d.onclick=()=>scale(0.5);
  if(S.B){ SM.drawStrip(host); const pl=SM.plan(); const pe=$('#sm-plan'); if(pl&&pe) pe.textContent=pl.changed?`هيتعدّل ${pl.changed} مشهد`+(pl.skipped?` · ${pl.skipped} متخطّى (صوت/قرآن/تعليق)`:'')+` · الطول الجديد ${fmtT(pl.total)}`:'القطعات متظبطة بالفعل على الإيقاع.'; }
  const ap=$('#sm-apply'); if(ap) ap.onclick=async()=>{ const n=await SM.applyBeat(); toast(n?`اتضبط ${n} مشهد على الإيقاع — تقدر تتراجع (Ctrl+Z)`:'مفيش مشاهد محتاجة تعديل'); animRenderPanel(); };
  const gl=$('#sm-goal'); if(gl) gl.oninput=()=>{ S.goal=gl.value; };
  const sb=$('#sm-sheet'), sd=$('#sm-sdl'), box=$('#sm-sheetbox');
  const build=()=>{ const cv=SM.sheet(); if(!cv){ toast('مفيش مشاهد'); return null; } S._sheet=cv; box.innerHTML=''; cv.className='sm-sheet'; box.appendChild(cv); sd.disabled=false; return cv; };
  if(sb) sb.onclick=build;
  if(sd) sd.onclick=()=>{ if(S._sheet) S._sheet.toBlob(b=>SM.download((p.name||'storyboard')+'-sheet.png',b)); };
  const cp=$('#sm-copy'); if(cp) cp.onclick=async()=>{ if(!ANIM.rt||!p.scenes.length){ toast('ضيف مشاهد الأول'); return; } if(!S._sheet) build(); const txt=SM.reviewPrompt(S.goal,true); try{ await navigator.clipboard.writeText(txt); toast('اتنسخ البرومبت — ارفق معاه صورة اللوحة (نزّلها PNG) وابعتهم للنموذج'); }catch(e){ const t=$('#sm-reply'); t.value=txt; t.select(); toast('انسخ النص من الخانة'); } };
  const ar=$('#sm-ap'); if(ar) ar.onclick=async()=>{ const m=$('#sm-rmsg'); try{ const o=SM.extractJson($('#sm-reply').value); const r=await SM.applyReview(o); S.rmsg=r.n?`اتطبّق ${r.n} تعديل`+(r.skipped?` · اتخطّى ${r.skipped}`:'')+(r.msg?' — '+r.msg:''):'مفيش تعديلات صالحة في الرد.'; m.textContent=S.rmsg; if(r.n){ animRefreshAll(); } }catch(e){ S.rmsg='الرد مش JSON صالح: '+(e.message||e); m.textContent=S.rmsg; } };
  host.querySelectorAll('[data-fix]').forEach(b=>b.onclick=async()=>{ const n=await SM.fix(b.dataset.fix); toast(n?`اتصلّح ${n} مشهد`:'مفيش حاجة تتصلّح'); animRenderPanel(); });
  const hr=$('#sm-hre'); if(hr) hr.onclick=()=>animRenderPanel();
  const dl=(id,vtt)=>{ const e=$(id); if(e) e.onclick=()=>{ const t=SM.srt(vtt); const m=$('#sm-xmsg'); if(!t.replace('WEBVTT','').trim()){ m.textContent='مفيش نصوص أو كلمات متوقّتة.'; return; } SM.download((p.name||'subtitles')+(vtt?'.vtt':'.srt'),t); m.textContent=SM.cues().length+' سطر'; }; };
  dl('#sm-srt',false); dl('#sm-vtt',true);
  const sbn=$('#sm-snb'); if(sbn) sbn.onclick=()=>{ const ok=SM.snapSave($('#sm-snl').value.trim()); toast(ok?'اتحفظت النسخة':'ما اتحفظتش (مفيش تغيير أو المساحة ممتلئة)'); animRenderPanel(); };
  host.querySelectorAll('[data-rs]').forEach(b=>b.onclick=async()=>{ if(await SM.snapRestore(+b.dataset.rs)) toast('اتسترجعت النسخة — Ctrl+Z يرجّعك'); });
};

/* ---------- command palette (Ctrl+K) ---------- */
SM.cmds=function(){
  const C=[]; const add=(t,k,fn)=>C.push({t,k:k||'',fn});
  document.querySelectorAll('#ed .ed-rb').forEach(b=>{ const t=(b.textContent||'').replace(/\s+/g,' ').trim(); if(t) add('افتح: '+t,'panel '+(b.dataset.p||''),()=>b.click()); });
  const tab=(m,t)=>add('تبويب المونتاج: '+t,'montage '+m,()=>{ ANIM._montMode=m; ANIM.panel='montage'; document.querySelectorAll('.ed-rb').forEach(x=>x.classList.toggle('on',x.dataset.p==='montage')); animRenderPanel(); });
  tab('media','من فيديو أو صوت'); tab('image','من صورة'); tab('quran','ريلز قرآن'); tab('smart','أدوات ذكية (إيقاع · مراجعة · فحص)');
  const smart=(id,t)=>add(t,'smart '+id,()=>{ ANIM._montMode='smart'; ANIM.panel='montage'; SM.st().open[id]=true; document.querySelectorAll('.ed-rb').forEach(x=>x.classList.toggle('on',x.dataset.p==='montage')); animRenderPanel(); });
  smart('b','مزامنة المشاهد على إيقاع الموسيقى (Beat Sync)'); smart('r','مراجعة المخرج بالذكاء الاصطناعي + لوحة المشاهد'); smart('h','فحص جودة المشروع'); smart('x','تصدير ترجمة SRT / VTT'); smart('v','سجل النسخ والاسترجاع'); smart('w','تعديل بالنص وحذف الحشو (اااا · امم)'); smart('p','نبض الصورة على الإيقاع'); smart('l','موازنة مستوى الصوت'); smart('t','اقتراح صورة غلاف'); add('اختصارات لوحة المفاتيح','help shortcuts keys ?',()=>SM.help());
  add('تراجع','undo',()=>animUndo()); add('إعادة','redo',()=>animRedo());
  add('تشغيل / إيقاف','play pause',()=>{ const b=document.querySelector('#an-play'); if(b) b.click(); });
  add('احفظ نسخة احتياطية الآن','snapshot',()=>{ toast(SM.snapSave('يدوي (Ctrl+K)')?'اتحفظت النسخة':'مفيش تغيير للحفظ'); });
  add('تصدير الفيديو','export render',()=>{ try{ animExportDialog(); }catch(e){} });
  if(ANIM.cur&&ANIM.rt) ANIM.cur.scenes.forEach((s,i)=>{ const L=ANIM.rt.layout.scenes[i]; if(!L) return; const tx=((L.data.layers||[]).find(l=>l.type==='text'&&l.text)||{}).text||''; add('اذهب لمشهد '+(i+1)+(tx?' — '+String(tx).replace(/\s+/g,' ').slice(0,36):''),'scene '+(i+1)+' '+tx,()=>animSeek(L.start+0.001)); });
  return C;
};
SM.palette=function(){
  if(document.getElementById('sm-pal')) return SM.palClose();
  const cmds=SM.cmds(); const ov=document.createElement('div'); ov.id='sm-pal'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','لوحة الأوامر');
  ov.innerHTML='<div class="sm-pbox"><input id="sm-pin" type="text" dir="auto" autocomplete="off" placeholder="اكتب أمر أو اسم أداة… (↑↓ للتنقل، Enter للتنفيذ، Esc للإغلاق)" aria-label="بحث في الأوامر" aria-controls="sm-pl"><ul id="sm-pl" role="listbox"></ul></div>';
  document.body.appendChild(ov); const inp=ov.querySelector('#sm-pin'), ul=ov.querySelector('#sm-pl'); let sel=0, list=cmds; SM._prevFocus=document.activeElement;
  const norm=s=>String(s).toLowerCase();
  const draw=()=>{ ul.innerHTML=list.slice(0,40).map((c,i)=>`<li role="option" id="sm-po${i}" aria-selected="${i===sel}" class="${i===sel?'on':''}" data-i="${i}">${escH(c.t)}</li>`).join('')||'<li class="sm-empty">مفيش نتيجة</li>'; inp.setAttribute('aria-activedescendant',list.length?'sm-po'+sel:''); const el=ul.querySelector('.on'); if(el&&el.scrollIntoView) el.scrollIntoView({block:'nearest'}); };
  const run=i=>{ const c=list[i]; SM.palClose(); if(c) setTimeout(()=>{ try{ c.fn(); }catch(e){ console.warn(e); } },0); };
  inp.oninput=()=>{ const q=norm(inp.value).split(/\s+/).filter(Boolean); list=q.length?cmds.filter(c=>q.every(w=>norm(c.t+' '+c.k).includes(w))):cmds; sel=0; draw(); };
  ov.onclick=e=>{ if(e.target===ov) SM.palClose(); const li=e.target.closest('li[data-i]'); if(li) run(+li.dataset.i); };
  ov.onkeydown=e=>{ if(e.key==='Escape'){ e.preventDefault(); SM.palClose(); } else if(e.key==='ArrowDown'){ e.preventDefault(); sel=Math.min(list.length-1,sel+1); draw(); } else if(e.key==='ArrowUp'){ e.preventDefault(); sel=Math.max(0,sel-1); draw(); } else if(e.key==='Enter'){ e.preventDefault(); run(sel); } else if(e.key==='Tab'){ e.preventDefault(); } };
  draw(); inp.focus();
};
SM.palClose=function(){ const o=document.getElementById('sm-pal'); if(o) o.remove(); try{ if(SM._prevFocus&&SM._prevFocus.focus) SM._prevFocus.focus(); }catch(e){} };
if(!SM._key){ SM._key=true; document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&String(e.key).toLowerCase()==='k'&&document.querySelector('#ed')){ e.preventDefault(); e.stopPropagation(); SM.palette(); } },true); }

/* ================= pro15b: تعديل بالنص + حذف الحشو · نبض الإيقاع · مستوى الصوت · صورة الغلاف · اختصارات ================= */
const FILLER_HES=/^(?:[اآأإ]+ه+|[اآأإ]{2,}|ا?م{2,}|ه+م{2,}|um+|uh+|uhm+|erm?|hm+|mm+|ah+|eh+)$/i;
const FILLER_COM=new Set(['يعني','كده','طب','بقى','كدا','like','basically','actually','literally']);
const wnorm=w=>String(w||'').replace(/[ً-ٰٟـ]/g,'').replace(/[^\p{L}\p{N}]+/gu,'').toLowerCase();
SM.isFiller=(w,common)=>{ const n=wnorm(w); if(!n) return false; return FILLER_HES.test(n)||(!!common&&FILLER_COM.has(n)); };
SM.tcutSet=function(M){ return new Set((M&&M.tw)||[]); };
SM.tcutRanges=function(M){
  if(!M||!M.tw||!M.tw.length||!M.words) return []; const set=SM.tcutSet(M), out=[];
  M.words.forEach((w,i)=>{ if(!set.has(+w.s.toFixed(3))) return; const prev=M.words[i-1], next=M.words[i+1];
    const a=Math.max(prev?Math.max(prev.e,w.s-0.04):0,w.s-0.04), b=Math.min(next?Math.min(next.s,w.e+0.04):1e9,w.e+0.04);
    const l=out[out.length-1]; if(l&&a-l[1]<0.15) l[1]=Math.max(l[1],b); else out.push([a,b]); });
  return out;
};
/* silence ranges (when enabled) + the words the user cut — one list for every consumer */
window.anMontRemoved=function(M){ const S=M.sil; const base=(S&&S.on&&Array.isArray(S.ranges))?S.ranges.filter(r=>r.on!==false).map(r=>[r.a,r.b]):[]; return base.concat(SM.tcutRanges(M)); };
SM.tcutToggle=function(M,idxs,on){ const set=SM.tcutSet(M); idxs.forEach(i=>{ const k=+M.words[i].s.toFixed(3); on?set.add(k):set.delete(k); }); M.tw=[...set].sort((a,b)=>a-b); animSaveSoon(); };
SM.tcutStats=function(M){ const r=SM.tcutRanges(M); const sec=r.reduce((t,x)=>t+x[1]-x[0],0); return {words:(M.tw||[]).length,sec}; };

/* beat pulse on the backdrop layer of every scene */
SM.pulseOn=function(){ const S=SM.st(); if(!S.B) return 0; let n=0; const amp=+S.pulseAmp||0.035; const per=+(S.B.period*2).toFixed(3); const p=ANIM.cur;
  animEdit(()=>{ p.scenes.forEach(sc=>{ if(!SM.eligible(sc)) return; const L=(sc.raw.layers||[]).filter(l=>l&&l.type!=='text'); const bg=L.find(l=>l.id==='bg')||L[0]; if(!bg) return; let m=Array.isArray(bg.motion)?bg.motion:(bg.motion?[bg.motion]:[]); m=m.filter(x=>!(x&&x._beat)); m.push({type:'pulse',amp,period:per,_beat:true}); bg.motion=m; n++; }); }); return n; };
SM.pulseOff=function(){ let n=0; const p=ANIM.cur; animEdit(()=>{ p.scenes.forEach(sc=>(sc.raw.layers||[]).forEach(l=>{ if(l&&Array.isArray(l.motion)&&l.motion.some(x=>x&&x._beat)){ l.motion=l.motion.filter(x=>!(x&&x._beat)); n++; } })); }); return n; };

/* loudness (RMS dBFS) per audio clip → balance voice vs music */
SM.clipDb=function(a){ const buf=ANIM.buffers[a.key]; if(!buf) return null; const sr=buf.sampleRate, i0=Math.floor((a.trimIn||0)*sr), i1=Math.min(buf.length,i0+Math.floor((a.len||buf.duration)*sr)); if(i1<=i0) return null; const c=buf.getChannelData(0); let s=0,n=0; for(let i=i0;i<i1;i+=3){ s+=c[i]*c[i]; n++; } return 10*Math.log10(s/Math.max(1,n)+1e-12); };
SM.levels=function(){ return (ANIM.cur.audio||[]).map((a,i)=>{ const db=SM.clipDb(a); const voice=a.role&&a.role!=='music'; return {i,name:a.name||'مقطع',role:voice?'voice':'music',db,vol:a.volume!=null?a.volume:1,eff:db==null?null:db+20*Math.log10(Math.max(1e-3,a.volume!=null?a.volume:1))}; }); };
SM.balance=async function(vt,mt){ const L=SM.levels(); const p=ANIM.cur; let n=0; await animEdit(()=>{ L.forEach(x=>{ if(x.db==null) return; const tgt=x.role==='voice'?vt:mt; const v=Math.pow(10,(tgt-x.db)/20); p.audio[x.i].volume=+clampN(v,0.05,3).toFixed(3); n++; }); }); return n; };

/* cover / thumbnail candidates */
SM.coverScore=function(cv){ const x=cv.getContext('2d'), W=cv.width, H=cv.height; const d=x.getImageData(0,0,W,H).data; let s=0,s2=0,e=0,n=0; for(let y=0;y<H;y+=2){ for(let i=0;i<W;i+=2){ const k=(y*W+i)*4; const l=0.299*d[k]+0.587*d[k+1]+0.114*d[k+2]; s+=l; s2+=l*l; n++; if(i+2<W){ const k2=k+8; e+=Math.abs(l-(0.299*d[k2]+0.587*d[k2+1]+0.114*d[k2+2])); } } } const m=s/n, v=Math.sqrt(Math.max(0,s2/n-m*m)); return v*0.6+e/n*2.2-(m<18?40:0); };
SM.covers=function(){ const p=ANIM.cur, rt=ANIM.rt; if(!rt||!p.scenes.length) return []; const d=animDims(p), w=240, h=Math.round(w*d.H/d.W); const out=[];
  p.scenes.forEach((sc,i)=>{ const L=rt.layout.scenes[i]; [0.35,0.7].forEach(f=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const x=cv.getContext('2d'); x.fillStyle='#000'; x.fillRect(0,0,w,h); const t=L.start+Math.max(0.05,Math.min(L.dur-0.05,L.dur*f)); try{ rt.renderFrame(x,w,h,t,{handAssets:animHandAssets(),cssGrade:false,lite:true}); }catch(e){ return; } out.push({i,t,cv,score:SM.coverScore(cv)}); }); });
  return out.sort((a,b)=>b.score-a.score).slice(0,4); };
SM.coverSave=function(c){ const p=ANIM.cur, d=animDims(p); const cv=document.createElement('canvas'); cv.width=d.W; cv.height=d.H; const x=cv.getContext('2d'); try{ ANIM.rt.renderFrame(x,d.W,d.H,c.t,{handAssets:animHandAssets(),cssGrade:true}); }catch(e){} cv.toBlob(b=>SM.download((p.name||'cover')+'-cover.png',b)); };

/* keyboard help */
SM.help=function(){ if(document.getElementById('sm-help')) return SM.helpClose(); const o=document.createElement('div'); o.id='sm-pal'; o.setAttribute('role','dialog'); o.setAttribute('aria-modal','true'); o.setAttribute('aria-label','اختصارات لوحة المفاتيح'); o.dataset.help='1';
  const R=[['Ctrl+K','لوحة الأوامر'],['Ctrl+Z','تراجع'],['Ctrl+Shift+Z / Ctrl+Y','إعادة'],['Ctrl+C / Ctrl+V','نسخ / لصق عنصر'],['Ctrl+Shift+V','لصق الحركة فقط'],['?','عرض هذه القائمة'],['Esc','إغلاق']];
  o.innerHTML='<div class="sm-pbox" id="sm-help"><div class="sm-hh">⌨️ اختصارات لوحة المفاتيح</div><ul class="sm-kl">'+R.map(r=>'<li><span>'+escH(r[1])+'</span><kbd>'+escH(r[0])+'</kbd></li>').join('')+'</ul></div>';
  o.onclick=e=>{ if(e.target===o) SM.helpClose(); }; o.onkeydown=e=>{ if(e.key==='Escape') SM.helpClose(); }; o.tabIndex=-1; document.body.appendChild(o); o.focus(); };
SM.helpClose=function(){ const o=document.getElementById('sm-help'); if(o) o.parentNode.remove(); };
if(!SM._qk){ SM._qk=true; document.addEventListener('keydown',e=>{ if(e.key==='?'&&!e.ctrlKey&&!e.metaKey&&document.querySelector('#ed')&&!/INPUT|TEXTAREA|SELECT/.test((e.target.tagName||''))&&!e.target.isContentEditable){ e.preventDefault(); SM.help(); } },true); }

/* extra panel sections, appended after the base ones */
SM.extraSections=function(sec){
  const S=SM.st(), p=ANIM.cur, M=anMontState(p), has=!!(M.words&&M.words.length); const O=S.open; let html='';
  /* text-based editing */
  { let body; if(!has) body='<p class="hint">حوّل الكلام لنص الأول من تبويب «من فيديو أو صوت» ← بعدها تقدر تمسح الكلمات من هنا فيتقص الصوت والفيديو.</p>';
    else { const st=SM.tcutStats(M), set=SM.tcutSet(M); const segs=anMontSegments(M.words); let idx=0;
      const rows=[]; idx=0; segs.forEach(g=>{ const ws=new Array(g.n||0); idx=g.i0||idx; rows.push(`<div class="sm-sg"><b dir="ltr">${anMontT(g.s)}</b><div class="sm-ws">${M.words.slice(idx,idx+ws.length).map((w,k)=>{ const i=idx+k; const c=set.has(+w.s.toFixed(3)); return `<button type="button" class="sm-w${c?' cut':''}" data-wi="${i}" aria-pressed="${c}" title="${anMontT(w.s)}">${escH(w.w||w.word||'')}</button>`; }).join('')}</div></div>`); idx+=ws.length; });
      body=`<p class="hint">اضغط على أي كلمة لحذفها من الفيديو (Shift لتحديد مدى). الحذف بيشتغل مع قص السكتات، وبعدها اضغط «طبّق».</p>
      <div class="sm-row"><button type="button" class="mt2-btn pri" id="sm-fil">🧹 احذف كلمات التردد (اااا · امم · um · uh)</button><label class="an-sw"><input type="checkbox" id="sm-filc" ${S.filc?'checked':''}> <span>وكمان الحشو الشائع (يعني · كده · like)</span></label></div>
      <div class="sm-chips"><span class="mt2-chip" id="sm-tcw">${st.words} كلمة محذوفة</span><span class="mt2-chip" id="sm-tcs">−${st.sec.toFixed(1)} ث</span><button type="button" class="mt2-chip act" id="sm-tcr">↩️ رجّع الكل</button></div>
      <div class="sm-tr" id="sm-tr">${rows.join('')}</div>
      <div class="sm-row"><button type="button" class="mt2-btn pri" id="sm-tca" ${p.scenes.some(s=>s.raw&&s.raw._mont)?'':'disabled'}>✂️ طبّق على المشاهد الموجودة</button><span class="sm-note" id="sm-tcm" aria-live="polite"></span></div>`; }
    html+=sec('w','📝','تعديل بالنص + حذف الحشو','امسح كلمات من النص فيتقص الفيديو',body); }
  /* beat pulse (needs the analysed track) */
  { const body=S.B?`<p class="hint">يضيف نبضة تكبير خفيفة على خلفية كل مشهد على إيقاع الموسيقى (من نتيجة Beat Sync فوق).</p><div class="sm-row"><label class="sm-lab" for="sm-amp">القوة</label><input type="range" id="sm-amp" min="0.01" max="0.08" step="0.005" value="${+S.pulseAmp||0.035}"><button type="button" class="mt2-btn pri" id="sm-pon">💓 أضف النبض</button><button type="button" class="mt2-btn" id="sm-poff">إزالة</button></div>`:'<p class="hint">حلّل موسيقى من قسم «مزامنة على الإيقاع» الأول.</p>';
    html+=sec('p','💓','نبض الصورة على الإيقاع','حركة متزامنة مع الـBPM',body); }
  /* loudness */
  { const L=SM.levels(); const body=L.length?`<p class="hint">يقيس مستوى كل مقطع صوت ويظبط الصوت الأعلى (تعليق/تلاوة) فوق الموسيقى بدل ما تتخانق معاه.</p><ul class="sm-hl">${L.map(x=>`<li class="sm-h ok"><span class="sm-dot"></span><span>${escH(x.name)} <small>(${x.role==='voice'?'صوت':'موسيقى'})</small></span><b dir="ltr">${x.db==null?'—':x.eff.toFixed(1)+' dB'}</b></li>`).join('')}</ul><div class="sm-row"><button type="button" class="mt2-btn pri" id="sm-bal">🎚️ وازن تلقائيًا (صوت −18 · موسيقى −30)</button><span class="sm-note" id="sm-balm" aria-live="polite"></span></div>`:'<p class="hint">مفيش مقاطع صوت في المشروع لسه.</p>';
    html+=sec('l','🎚️','موازنة مستوى الصوت','الصوت فوق الموسيقى',body); }
  /* cover */
  { const body=`<p class="hint">يختار أفضل لقطات تصلح غلاف (تباين وتفاصيل وإضاءة) وتنزّلها بدقة المشروع.</p><div class="sm-row"><button type="button" class="mt2-btn pri" id="sm-cvb">🖼️ اقترح أغلفة</button></div><div class="sm-covers" id="sm-cvs"></div>`;
    html+=sec('t','🖼️','صورة الغلاف (Thumbnail)','أحسن لقطات للغلاف',body); }
  return html;
};
SM.bindExtra=function(host){
  const S=SM.st(), p=ANIM.cur, M=anMontState(p); const $=s=>host.querySelector(s);
  const upd=()=>{ const st=SM.tcutStats(M); const a=$('#sm-tcw'), b=$('#sm-tcs'); if(a) a.textContent=st.words+' كلمة محذوفة'; if(b) b.textContent='−'+st.sec.toFixed(1)+' ث'; host.querySelectorAll('.sm-w').forEach(el=>{ const c=SM.tcutSet(M).has(+M.words[+el.dataset.wi].s.toFixed(3)); el.classList.toggle('cut',c); el.setAttribute('aria-pressed',c); }); };
  let lastI=null;
  host.querySelectorAll('.sm-w').forEach(el=>el.onclick=e=>{ const i=+el.dataset.wi; const on=!SM.tcutSet(M).has(+M.words[i].s.toFixed(3)); let idxs=[i]; if(e.shiftKey&&lastI!=null){ const a=Math.min(lastI,i), b=Math.max(lastI,i); idxs=[]; for(let k=a;k<=b;k++) idxs.push(k); } lastI=i; SM.tcutToggle(M,idxs,on); upd(); });
  const fc=$('#sm-filc'); if(fc) fc.onchange=()=>{ S.filc=fc.checked; };
  const fb=$('#sm-fil'); if(fb) fb.onclick=()=>{ const idx=[]; M.words.forEach((w,i)=>{ if(SM.isFiller(w.w||w.word,S.filc)) idx.push(i); }); if(!idx.length){ toast('مفيش كلمات تردد واضحة في النص'); return; } SM.tcutToggle(M,idx,true); upd(); toast('اتعلّم '+idx.length+' كلمة للحذف — راجعها وبعدين اضغط «طبّق»'); };
  const tr=$('#sm-tcr'); if(tr) tr.onclick=()=>{ M.tw=[]; animSaveSoon(); upd(); };
  const ta=$('#sm-tca'); if(ta) ta.onclick=async()=>{ const m=$('#sm-tcm'); ta.disabled=true; m.textContent='جارِ إعادة التقطيع…'; try{ const r=await anMontRecut((k,n)=>{ m.textContent='مشهد '+k+' من '+n+'…'; }); m.textContent='✅ '+r.n+' مشهد اتحدّث — وفّرت '+r.saved.toFixed(1)+' ث'; }catch(e){ m.textContent=String(e.message||e); } ta.disabled=false; };
  const am=$('#sm-amp'); if(am) am.oninput=()=>{ S.pulseAmp=+am.value; };
  const po=$('#sm-pon'); if(po) po.onclick=()=>{ const n=SM.pulseOn(); toast(n?'اتضاف النبض على '+n+' مشهد':'مفيش مشاهد مناسبة'); };
  const pf=$('#sm-poff'); if(pf) pf.onclick=()=>{ const n=SM.pulseOff(); toast(n?'اتشال النبض':'مفيش نبض متضاف'); };
  const bl=$('#sm-bal'); if(bl) bl.onclick=async()=>{ const n=await SM.balance(-18,-30); S.balm='اتظبط '+n+' مقطع — Ctrl+Z يرجّعهم'; animRenderPanel(); };
  const bm=$('#sm-balm'); if(bm&&S.balm){ bm.textContent=S.balm; S.balm=''; }
  const cb=$('#sm-cvb'); if(cb) cb.onclick=()=>{ const box=$('#sm-cvs'); const L=SM.covers(); box.innerHTML=''; if(!L.length){ box.textContent='مفيش مشاهد.'; return; } L.forEach(c=>{ const b=document.createElement('button'); b.type='button'; b.className='sm-cover'; b.title='نزّل الغلاف'; c.cv.removeAttribute('class'); b.appendChild(c.cv); const s=document.createElement('span'); s.textContent='مشهد '+(c.i+1)+' · '+fmtT(c.t); b.appendChild(s); b.onclick=()=>SM.coverSave(c); box.appendChild(b); }); };
};

})();
