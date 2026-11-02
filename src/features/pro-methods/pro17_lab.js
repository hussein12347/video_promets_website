/* ===== pro17: تايم لاين لحظي (تمديد سلس) + «طرق احترافية» للمونتاج بالـAI =====
   Part A  — live timeline drag (scene / layer / audio): the preview and the neighbours follow the pointer.
   Part B  — LAB: Retention Lab · Rhythm presets · Hook Lab · B-roll planner · Story Doctor · Chapter cards.      */
(function(){
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const escH=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtT=t=>{ t=Math.max(0,t); const m=Math.floor(t/60), s=t-m*60; return m+':'+(s<10?'0':'')+s.toFixed(1); };
const LAB=window.LAB=window.LAB||{};

/* ============ Part A — live timeline ============ */
/* single-flight rebuild: while the pointer moves the preview is rebuilt at most once per frame, never queued up */
const LIVE={busy:false,pend:false,t:null};
LAB.live=function(t){ LIVE.t=t; if(LIVE.busy){ LIVE.pend=true; return; } LIVE.busy=true;
  requestAnimationFrame(()=>{ Promise.resolve(animRebuild()).catch(()=>{}).then(()=>{ LIVE.busy=false; if(LIVE.t!=null&&ANIM.rt){ ANIM.t=clampN(LIVE.t,0,ANIM.rt.total-0.01); ANIM._needVid=true; animDraw(); } if(LIVE.pend){ LIVE.pend=false; LAB.live(LIVE.t); } }); }); };
const px=()=>ANIM.zoom;

window.anClipDrag=function(e,el,k,xToT){
  e.preventDefault(); e.stopPropagation(); const p=ANIM.cur, sc=p.scenes[k], raw=sc.raw; const edge=e.target.dataset.e; const L=anLayout(k); const x0=e.clientX; let moved=false;
  ANIM.sel={scene:k,layer:null,clip:null};
  const st={len:L.dur,tin:L.trimIn,full:L.full,start:L.start};
  const audioLocked=!!(sc.audioDur&&p.fitAudio!==false)||!!L.synced;
  const clips=[...document.querySelectorAll('#tl-v .tl-clip')].map(c=>[c,parseFloat(c.style.left)]);
  const voices=[...document.querySelectorAll('.tl-voice')].map(v=>[v,parseFloat(v.style.left),+v.dataset.k]);
  const inner=document.querySelector('.tl-inner'); const w0=inner?parseFloat(inner.style.width):0; let warned=false;
  const setLab=nd=>{ const d=el.querySelector('.tl-d'); if(d) d.textContent=nd.toFixed(1)+'ث'; };
  const mv=ev=>{ const dx=(ev.clientX-x0)/px(); if(!moved&&Math.abs(ev.clientX-x0)<4) return; if(!moved){ moved=true; animPushUndo(); }
    if(edge==='r'){
      const want=Math.max(0.2,st.len+dx), avail=st.full-st.tin; let nd;
      if(want<=avail+1e-6){ raw.len=+want.toFixed(3); nd=want; }
      else if(!audioLocked){ raw.duration=+(want+st.tin).toFixed(3); delete raw.len; nd=want; }   /* extend: the scene itself gets longer */
      else { raw.len=+avail.toFixed(3); nd=avail; if(!warned){ warned=true; toast('طول المشهد متحدد بطول التعليق الصوتي — غيّر الصوت لو عايز تمدّه'); } }
      animNorm(sc,k); const dl=(nd-st.len)*px();
      el.style.width=Math.max(4,nd*px()-2)+'px'; setLab(nd);
      clips.forEach(([c,l0])=>{ if(+c.dataset.i>k) c.style.left=(l0+dl)+'px'; }); voices.forEach(([v,l0,kk])=>{ if(kk>k) v.style.left=(l0+dl)+'px'; });
      if(inner) inner.style.width=Math.max(w0+dl,200)+'px';
      LAB.live(st.start+nd-0.04);
    } else if(edge==='l'){
      const d=Math.max(-st.tin,Math.min(st.len-0.2,dx)); raw.trimIn=+(st.tin+d).toFixed(3); raw.len=+(st.len-d).toFixed(3);
      animNorm(sc,k); el.style.transform='translateX('+(d*px())+'px)'; el.style.width=Math.max(4,(st.len-d)*px()-2)+'px'; setLab(st.len-d);
      LAB.live(st.start+0.05);
    } else { el.style.transform='translateX('+(dx*px())+'px)'; el.classList.add('drag'); } };
  const up=ev=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up);
    if(!moved){ animSeek(xToT(ev.clientX)); ANIM.sel={scene:k,layer:null,clip:null}; animRefreshSide(); if(['fx','trans','json'].includes(ANIM.panel)) animRenderPanel(); return; }
    if(edge){ animNorm(sc,k); animSaveSoon(); Promise.resolve(animRebuild()).then(()=>animRefreshAll()); return; }
    const t=xToT(ev.clientX); const S=ANIM.rt.layout.scenes; let to=S.findIndex(x=>t<x.start+x.dur/2); if(to<0) to=S.length-1; if(to>k) to=Math.max(k,to-1+((t>S[to].start+S[to].dur/2)?1:0));
    to=Math.max(0,Math.min(p.scenes.length-1,to)); if(to!==k){ const it=p.scenes.splice(k,1)[0]; p.scenes.splice(to,0,it); ANIM.sel.scene=to; }
    animSaveSoon(); Promise.resolve(animRebuild()).then(()=>animRefreshAll()); };
  window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up);
};

window.anLayerDrag=function(e,el,i,xToT){
  e.preventDefault(); e.stopPropagation(); const id=el.dataset.id; const raw=anLayerRaw(i,id); const L=anLayout(i); if(!raw||!L) return; const edge=e.target.dataset.e; const x0=e.clientX; let moved=false;
  ANIM.sel.layer=id; ANIM.sel.scene=i; ANIM.sel.clip=null; const scene=ANIM.cur.scenes[i];
  const snap=JSON.parse(JSON.stringify(raw)); const left0=parseFloat(el.style.left), w0=parseFloat(el.style.width); const fullLocal=L.full/L.k;
  const at0=snap.enter&&typeof snap.enter==='object'?(+snap.enter.at||0):0; const end0=snap.exit&&typeof snap.exit==='object'?(+snap.exit.at||0):fullLocal;
  const abs=lt=>L.start+lt*L.k-L.trimIn;
  const mv=ev=>{ if(!moved&&Math.abs(ev.clientX-x0)<4) return; if(!moved){ moved=true; animPushUndo(); } const d=(ev.clientX-x0)/px()/L.k; let seekT=null;
    if(edge==='r'){ const ne=Math.max(at0+0.2,end0+d); raw.exit=Object.assign({type:'fade',dur:0.4},typeof snap.exit==='object'?snap.exit:{}); raw.exit.at=+ne.toFixed(2);
      el.style.width=Math.max(6,w0+(ne-end0)*L.k*px())+'px'; seekT=abs(ne)-0.05; }
    else if(edge==='l'){ const na=clampN(at0+d,0,end0-0.2); raw.enter=Object.assign({type:'fade',dur:0.4},typeof snap.enter==='object'?snap.enter:{}); raw.enter.at=+na.toFixed(2);
      el.style.left=(left0+(na-at0)*L.k*px())+'px'; el.style.width=Math.max(6,w0-(na-at0)*L.k*px())+'px'; seekT=abs(na)+0.05; }
    else { const sh=v=>Math.max(0,+(v+d).toFixed(2)); if(snap.enter&&typeof snap.enter==='object'){ raw.enter.at=sh(+snap.enter.at||0); } if(snap.exit&&typeof snap.exit==='object'){ raw.exit.at=sh(+snap.exit.at||0); }
      if(Array.isArray(snap.motion)) raw.motion=snap.motion.map(m=>{ if(typeof m!=='object') return m; const c=Object.assign({},m); if(c.from!=null) c.from=sh(+c.from); if(c.at!=null) c.at=sh(+c.at); if(c.to!=null) c.to=sh(+c.to); return c; });
      if(snap.count&&snap.count.at!=null) raw.count.at=sh(+snap.count.at); el.style.transform='translateX('+((ev.clientX-x0))+'px)'; }
    animNorm(scene,i); LAB.live(seekT!=null?seekT:null); };
  const up=()=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); if(!moved){ animRefreshSide(); return; } animNorm(ANIM.cur.scenes[i],i); animSaveSoon(); Promise.resolve(animRebuild()).then(()=>{ animRefreshSide(); animRenderTimelineSoon(); }); };
  window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up);
};
/* give every layer bar a left handle too (start time), without touching the base renderer */
if(!LAB._wrapped&&typeof window.animRenderTimeline==='function'){ LAB._wrapped=true; const orig=window.animRenderTimeline;
  window.animRenderTimeline=function(){ const r=orig.apply(this,arguments); try{ document.querySelectorAll('#tl-l .tl-ly').forEach(el=>{ if(!el.querySelector('.tl-hl')){ const h=document.createElement('b'); h.className='tl-h tl-hl'; h.dataset.e='l'; el.appendChild(h); } }); }catch(e){} return r; }; }

/* ============ Part B — LAB ============ */
LAB.st=function(){ return ANIM._lab=ANIM._lab||{open:{r:true,p:false,k:false,b:false,s:false,c:false},arc:'hpscta',plat:'reels',goal:'',bro:null,msg:{}}; };
const eachRaw=(fn)=>{ const p=ANIM.cur; p.scenes.forEach((s,i)=>fn(s,i,s.raw)); };
const toArr=v=>Array.isArray(v)?v:(v?[v]:[]);
const clean=(arr,flag)=>toArr(arr).filter(x=>!(x&&typeof x==='object'&&x[flag]));
const renumber=()=>{ ANIM.cur.scenes.forEach((s,i)=>{ s.raw.scene=i+1; }); };
const mkScene=raw=>({uid:uid(),raw,data:null,audioKey:null,audioName:'',audioDur:null});
const eligible=sc=>!(sc.audioKey||(sc.words&&sc.words.length)||(sc.raw&&(sc.raw._mont||sc.raw._quran)));

/* ---- 1) Retention Lab (local estimate) ---- */
LAB.events=function(){
  const rt=ANIM.rt, ev=[]; if(!rt) return ev;
  rt.layout.scenes.forEach((L,i)=>{ const d=L.data; const tr=(d.transition&&d.transition.type)||'cut'; ev.push({t:L.start,w:i===0?40:(tr==='cut'?26:16)});
    (d.layers||[]).forEach(l=>{ if(l.hidden) return; const at=l.enter&&typeof l.enter==='object'?(+l.enter.at||0):0; const t=L.start+at*L.k-L.trimIn; if(t<L.start-0.01||t>L.start+L.dur) return; if(l.id==='bg'&&at===0) return;
      ev.push({t:Math.max(L.start,t),w:{text:11,mark:10,image:8,video:8,shape:5}[l.type]||5}); });
    (d.camera||[]).forEach(c=>{ const t=L.start+(+c.from||0)*L.k-L.trimIn; if(t>=L.start&&t<L.start+L.dur) ev.push({t,w:9}); });
    (d.effects||[]).forEach(f=>{ if(f.from>0){ const t=L.start+f.from*L.k-L.trimIn; if(t>=L.start&&t<L.start+L.dur) ev.push({t,w:8}); } }); });
  return ev; };
LAB.curve=function(){
  const rt=ANIM.rt; if(!rt||!rt.total) return null; const ev=LAB.events().sort((a,b)=>a.t-b.t); const p=ANIM.cur; const base=(p.audio&&p.audio.length)||p.scenes.some(s=>s.audioKey)?36:28; const step=0.25, n=Math.ceil(rt.total/step), vals=[];
  for(let i=0;i<=n;i++){ const t=i*step; let v=base; for(const e of ev){ if(e.t>t+1e-6) break; v+=e.w*Math.exp(-(t-e.t)/3); } vals.push(clampN(v,0,100)); }
  const avg=vals.reduce((a,b)=>a+b,0)/vals.length; const hook=(()=>{ const m=vals.slice(0,Math.min(vals.length,13)); return m.reduce((a,b)=>a+b,0)/m.length; })();
  const dips=[]; let a=null; vals.forEach((v,i)=>{ if(v<44){ if(a==null) a=i; } else if(a!=null){ if((i-a)*step>=2.5) dips.push([a*step,i*step]); a=null; } }); if(a!=null&&(vals.length-a)*step>=2.5) dips.push([a*step,rt.total]);
  return {vals,step,avg,hook,dips,total:rt.total}; };
LAB.drawCurve=function(cv,c){ const x=cv.getContext('2d'), W=cv.width, H=cv.height; const dark=getComputedStyle(document.body).backgroundColor.match(/\d+/g); const isDark=dark&&(+dark[0]+ +dark[1]+ +dark[2])<300;
  x.clearRect(0,0,W,H); x.fillStyle=isDark?'#161a30':'#f3f5fa'; x.fillRect(0,0,W,H); if(!c) return; const X=t=>t/c.total*W, Y=v=>H-6-(v/100)*(H-14);
  c.dips.forEach(d=>{ x.fillStyle='rgba(224,80,90,.18)'; x.fillRect(X(d[0]),0,X(d[1])-X(d[0]),H); });
  x.strokeStyle='rgba(120,130,170,.35)'; x.setLineDash([4,4]); x.beginPath(); x.moveTo(0,Y(44)); x.lineTo(W,Y(44)); x.stroke(); x.setLineDash([]);
  if(ANIM.rt){ x.strokeStyle='rgba(33,181,115,.7)'; x.lineWidth=1.5; ANIM.rt.layout.scenes.forEach(L=>{ if(L.start<=0) return; x.beginPath(); x.moveTo(X(L.start),H-14); x.lineTo(X(L.start),H); x.stroke(); }); }
  x.lineWidth=2.4; x.strokeStyle='#e8548a'; x.beginPath(); c.vals.forEach((v,i)=>{ const px_=X(i*c.step), py=Y(v); i?x.lineTo(px_,py):x.moveTo(px_,py); }); x.stroke();
  const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(232,84,138,.28)'); g.addColorStop(1,'rgba(232,84,138,0)'); x.lineTo(W,H); x.lineTo(0,H); x.closePath(); x.fillStyle=g; x.fill(); };
LAB.interrupts=async function(){ const c=LAB.curve(); if(!c) return 0; const rt=ANIM.rt, p=ANIM.cur; let n=0;
  await animEdit(()=>{ eachRaw((s,i,r)=>{ r.camera=clean(r.camera,'_lab'); r.effects=clean(r.effects,'_lab'); });
    c.dips.forEach(d=>{ for(let tm=d[0]+1.3;tm<d[1]-0.4;tm+=2.8){ const i=rt.layout.scenes.findIndex(L=>tm>=L.start&&tm<L.start+L.dur); if(i<0) continue; const L=rt.layout.scenes[i], r=p.scenes[i].raw; const lt=+Math.max(0.2,(tm-L.start+L.trimIn)/L.k).toFixed(2);
      r.camera=toArr(r.camera).concat([{type:'zoom',from:lt,to:+(lt+0.5).toFixed(2),scale:1.1,_lab:true}]); r.effects=toArr(r.effects).concat([{type:'chromatic',from:lt,to:+(lt+0.35).toFixed(2),amount:0.55,_lab:true}]); n++; } }); });
  return n; };
LAB.hookBoost=async function(){ if(!ANIM.cur.scenes.length) return false; await animEdit(()=>{ const r=ANIM.cur.scenes[0].raw; r.camera=clean(r.camera,'_labh').concat([{type:'zoom',from:0,to:0.55,scale:1.13,_labh:true}]); r.effects=clean(r.effects,'_labh').concat([{type:'flicker',from:0,to:0.3,amount:0.6,_labh:true}]); }); return true; };
LAB.clearLab=async function(){ await animEdit(()=>{ eachRaw((s,i,r)=>{ ['_lab','_labh'].forEach(f=>{ r.camera=clean(r.camera,f); r.effects=clean(r.effects,f); }); }); }); };

/* ---- 2) Rhythm presets ---- */
LAB.PRESETS={
  social:{n:'سوشيال سريع',ic:'⚡',d:'قطع حاد + ضربات تكبير كل ~2.5 ث',tr:{type:'cut'},punch:{every:2.5,scale:1.08},fx:[['vignette',0.25]],cap:4},
  doc:{n:'وثائقي هادئ',ic:'🎞️',d:'ذوبان ناعم + حبيبات خفيفة وتكبير بطيء',tr:{type:'fade',dur:0.8},slow:1.05,fx:[['grain',0.2],['vignette',0.3]]},
  cine:{n:'سينمائي',ic:'🎬',d:'شريط سينمائي + تلوين درامي + تكبير بطيء',tr:{type:'fade',dur:0.6},slow:1.06,fx:[['letterbox',0.5],['vignette',0.35]],grade:'dramatic'},
  clean:{n:'تعليمي نظيف',ic:'📘',d:'انتقال قصير بدون تأثيرات تشتّت',tr:{type:'fade',dur:0.3},fx:[]}
};
LAB.applyPreset=async function(id){ const P=LAB.PRESETS[id]; if(!P) return 0; let n=0;
  await animEdit(()=>{ eachRaw((s,i,r)=>{ r.camera=clean(r.camera,'_rp'); r.effects=clean(r.effects,'_rp');
      r.transition=i===0?{type:'cut',dur:0}:{type:P.tr.type,dur:P.tr.type==='cut'?0:(P.tr.dur||0.5)};
      P.fx.forEach(f=>r.effects.push({type:f[0],amount:f[1],_rp:true})); if(P.grade) r.effects.push({type:'grade',grade:P.grade,amount:0.6,_rp:true});
      const L=ANIM.rt&&ANIM.rt.layout.scenes[i]; const dur=L?L.dur/(L.k||1):(s.data&&s.data.duration)||3;
      if(P.punch){ for(let t=P.punch.every;t<dur-0.8;t+=P.punch.every){ r.camera.push({type:'zoom',from:+t.toFixed(2),to:+(t+0.35).toFixed(2),scale:P.punch.scale,_rp:true}); } }
      if(P.slow) r.camera.push({type:'zoom',from:0,scale:P.slow,_rp:true});
      if(P.shake&&i>0) r.camera.push({type:'shake',from:0,to:0.3,amount:1.2,_rp:true});
      if(P.cap&&eligible(s)&&dur>P.cap+0.6){ r.duration=P.cap; delete r.len; }
      n++; }); }); return n; };
LAB.clearPreset=async function(){ await animEdit(()=>{ eachRaw((s,i,r)=>{ r.camera=clean(r.camera,'_rp'); r.effects=clean(r.effects,'_rp'); }); }); };

/* ---- shared: scene cards (hook / chapter) ---- */
LAB.card=function(o){ const bg=o.bg||'#0b1020', fg=o.fg||'#FFFFFF', ac=o.accent||'#FFD54F'; const L=[]; const tl=(o.title||'').length; const fit=Math.min(o.size||11,tl<=12?11:(tl<=22?8.5:(tl<=34?7:5.8)));
  L.push({id:'T1',type:'text',text:o.title||'',x:50,y:o.sub?40:48,size:fit,weight:'900',color:fg,font:'Cairo',w:88,z:2,enter:{type:o.enter||'word-pop',at:0.05,dur:0.7}});
  if(o.sub) L.push({id:'T2',type:'text',text:o.sub,x:50,y:66,size:4.8,weight:'600',color:ac,font:'Tajawal',w:80,z:3,enter:{type:'fade',at:0.5,dur:0.5}});
  if(!o.mark) L.push({id:'A1',type:'shape',shape:'rect',x:50,y:o.sub?58:60,w:14,h:0.7,fill:ac,z:1,enter:{type:'wipe',at:0.25,dur:0.4}});
  if(o.mark) L.push({id:'M1',type:'mark',mark:o.mark,variant:o.markVariant||undefined,target:'T1',color:ac,z:4,enter:{type:'draw',at:0.6,dur:0.5}});
  const r={scene:1,title:o.name||'',duration:o.dur||2.4,background:bg,layers:L,transition:{type:'fade',dur:0.35}};
  if(o.punch){ r.camera=[{type:'zoom',from:0,to:0.5,scale:1.1}]; r.effects=[{type:'flicker',from:0,to:0.25,amount:0.5}]; }
  return r; };
LAB.insertScenes=async function(list){ /* list: [{at:index, raw}] — indexes refer to the CURRENT order */
  const p=ANIM.cur; await animEdit(()=>{ list.slice().sort((a,b)=>b.at-a.at).forEach(x=>{ p.scenes.splice(clampN(x.at,0,p.scenes.length),0,mkScene(x.raw)); }); renumber(); });
  await animLoadAssets(); return list.length; };

/* ---- 3) Hook Lab / 4) B-roll / 5) Story Doctor / 6) Chapters — prompts ---- */
const sceneBrief=()=>SM.sceneInfo().map(s=>({n:s.n,start:s.start,dur:s.dur,text:s.texts.join(' / ').slice(0,160),media:s.layers>1}));
const ARCS={hpscta:['خطّاف ← مشكلة ← تضخيم ← حل ← دليل ← دعوة','Hook, Problem, Agitate, Solution, Proof, Call-to-action'],
  list:['قائمة (Top N)','Hook, numbered items (strongest last), recap, CTA'],ba:['قبل / بعد','Hook with the result, Before (pain), Turning point, After, How-to in one line, CTA'],
  story:['قصة 3 فصول','Hook in the middle of action, Setup, Conflict, Climax, Resolution, Takeaway'],how:['شرح خطوة بخطوة','Hook with the end result, Why it matters, Steps 1..N, Common mistake, Summary, CTA']};
const PLATS={reels:'Instagram Reels / TikTok / YouTube Shorts (vertical, 15-60s, fast)',yt:'YouTube long-form (retention graph, chapters)',li:'LinkedIn / professional (clean, credible)',edu:'Educational lesson (clear, calm)'};
LAB.promptHook=function(S){ return ['You are a short-form video strategist. Write 5 DIFFERENT opening hooks (first 3 seconds, on-screen text only) for this video.','PLATFORM: '+PLATS[S.plat],'VIDEO GOAL: '+(S.goal||'make the viewer stay and finish the video'),'SCENES (what the video says):',JSON.stringify(sceneBrief()),
  'Rules: max 9 words for "text"; "sub" is optional, max 8 words; each hook uses a different technique (curiosity gap, bold claim, direct question, number/stat, pattern interrupt). Keep the language of the scenes (Arabic stays Arabic). No clickbait that the video does not deliver.',
  'Reply with ONE JSON object only: {"hooks":[{"name":"short label","technique":"curiosity|claim|question|number|interrupt","text":"...","sub":"...","mark":"underline|circle|burst|highlight|none"}]}'].join('\n'); };
LAB.promptBroll=function(S){ return ['You are a video editor planning B-roll. For the scenes below decide where extra visuals (stock footage, photos, screen recordings, generated images) would raise retention.','PLATFORM: '+PLATS[S.plat],'SCENES:',JSON.stringify(sceneBrief()),
  'Rules: 0 or 1 slot per scene (skip scenes that already show something strong); max '+Math.max(2,Math.ceil(ANIM.cur.scenes.length*0.7))+' slots; vary "role".',
  'Reply with ONE JSON object only: {"summary":"one sentence in Egyptian Arabic","slots":[{"scene":N,"role":"cutaway|overlay|background","search":"2-4 word English stock-search query","prompt":"detailed image/video generation prompt (shot type, subject, lighting, camera move), no text in frame","keywords":["...","..."],"why":"short reason in Egyptian Arabic"}]}',
  'role meanings: cutaway = full-frame visual under the text; overlay = small picture-in-picture; background = replaces the backdrop.'].join('\n'); };
LAB.promptStory=function(S){ return ['You are a senior story editor. Re-structure this video for maximum retention using the arc below.','PLATFORM: '+PLATS[S.plat],'ARC: '+ARCS[S.arc][1],'VIDEO GOAL: '+(S.goal||'inform and convert'),'SCENES (current order):',JSON.stringify(sceneBrief()),
  'Tasks: 1) label every scene with its arc role, 2) propose a new order only if it clearly helps (keep related scenes together), 3) list scenes that are redundant and can be cut (max 25% of scenes), 4) rewrite the on-screen text of the HOOK scene to be stronger, 5) suggest "fade" transitions only at act changes.',
  'Reply with ONE JSON object only: {"summary":"2 sentences in Egyptian Arabic","roles":[{"scene":N,"role":"hook|problem|agitate|solution|proof|cta|item|setup|conflict|climax|resolution|step|other"}],"order":[scene numbers in the new order, every kept scene exactly once],"cut":[scene numbers],"hook":{"scene":N,"text":"new on-screen text"},"fade":[scene numbers]}'].join('\n'); };
LAB.promptChapters=function(S){ return ['You are a video producer. Add chapter title cards and lower-thirds to this video.','PLATFORM: '+PLATS[S.plat],'SCENES:',JSON.stringify(sceneBrief()),
  'Rules: chapters only when the topic clearly changes (2-6 chapters; none for videos under 45 s); titles max 5 words in the language of the scenes; lower-thirds only for real named people/places/terms that appear in the text (never invent names).',
  'Reply with ONE JSON object only: {"chapters":[{"before_scene":N,"title":"...","subtitle":"..."}],"lowerThirds":[{"scene":N,"name":"...","role":"...","at":seconds_into_scene,"dur":seconds}]}'].join('\n'); };

/* ---- apply: hooks / broll slots / story / chapters ---- */
LAB.applyHook=async function(h){ const raw=LAB.card({title:h.text,sub:h.sub||'',mark:/^(underline|circle|burst|highlight)$/.test(h.mark)?h.mark:'',markVariant:h.mark==='underline'?'brush':'',dur:2.6,size:12,punch:true,name:'Hook'});
  const p=ANIM.cur; await animEdit(()=>{ p.scenes.splice(0,0,mkScene(raw)); p.scenes[0].raw.transition={type:'cut',dur:0}; renumber(); }); await animLoadAssets(); animSeek(0.3); return true; };
LAB.attachSlot=async function(slot,file){ const p=ANIM.cur; const sc=p.scenes[slot.scene-1]; if(!sc||!file) return false; const kind=/^video/.test(file.type)?'video':(/^image/.test(file.type)?'image':null); if(!kind){ toast('الملف لازم يكون صورة أو فيديو'); return false; }
  const added=await animAddMedia([file],{noMatch:true}); const m=added&&added[0]; if(!m) return false;
  await animEdit(()=>{ const r=sc.raw; r.layers=r.layers||[]; const bgL=r.layers.find(l=>l.id==='bg'); const bgZ=bgL?(+bgL.z||0):0; const others=r.layers.filter(l=>l!==bgL); const minO=others.length?Math.min(...others.map(l=>+l.z||0)):bgZ+1;
    if(others.length&&minO<=bgZ+0.6) others.forEach(l=>{ l.z=(+l.z||0)-minO+bgZ+1; });   /* make room right above the backdrop */
    const zs=others.map(l=>+l.z||0); const id=anNewId(r,'B'); const role=slot.role;
    const L={id,type:kind,src:m.id,z:role==='background'?+(bgZ+0.01).toFixed(2):(role==='overlay'?(zs.length?Math.max(...zs)+1:2):+(bgZ+0.5).toFixed(2)),fit:'cover',enter:{type:'fade',at:0.15,dur:0.4}};
    if(kind==='video'){ L.muted=true; L.volume=0; L.loop=true; }
    if(role==='overlay'){ delete L.fit; Object.assign(L,{x:74,y:26,w:40,mask:'rounded'}); L.enter={type:'pop',at:0.3,dur:0.4}; }
    if(role==='background'){ const bg=r.layers.find(l=>l.id==='bg'); if(bg){ bg.hidden=true; } }
    r._labb=(r._labb||[]).concat([id]); r.layers.push(L); },{scene:slot.scene-1}); return true; };
LAB.applyStory=async function(o,opts){ const p=ANIM.cur; const uids=p.scenes.map(s=>s.uid); const byN=n=>uids[(+n||0)-1]; let nCut=0, nOrder=0, nRole=0, nHook=0, nFade=0;
  await animEdit(()=>{
    toArr(o.roles).forEach(r=>{ const sc=p.scenes.find(s=>s.uid===byN(r.scene)); if(sc&&typeof r.role==='string'){ sc.raw._role=r.role.slice(0,16); nRole++; } });
    if(o.hook&&o.hook.text){ const sc=p.scenes.find(s=>s.uid===byN(o.hook.scene)); if(sc){ const t=(sc.raw.layers||[]).find(l=>l.type==='text'); if(t){ t.text=String(o.hook.text).slice(0,120); nHook++; } } }
    toArr(o.fade).forEach(n=>{ const sc=p.scenes.find(s=>s.uid===byN(n)); if(sc){ sc.raw.transition={type:'fade',dur:0.5}; nFade++; } });
    const cut=new Set(toArr(o.cut).map(byN).filter(Boolean)); const maxCut=Math.floor(p.scenes.length*0.25);
    if(opts&&opts.doCut){ let k=0; p.scenes=p.scenes.filter(s=>{ if(cut.has(s.uid)&&k<maxCut){ k++; nCut++; return false; } return true; }); }
    const ord=toArr(o.order).map(byN).filter(Boolean); if(opts&&opts.doOrder&&ord.length){ const seen=new Set(), out=[]; ord.forEach(u=>{ if(!seen.has(u)){ const s=p.scenes.find(x=>x.uid===u); if(s){ seen.add(u); out.push(s); } } }); p.scenes.forEach(s=>{ if(!seen.has(s.uid)) out.push(s); }); if(out.map(s=>s.uid).join()!==p.scenes.map(s=>s.uid).join()){ nOrder=1; p.scenes=out; } }
    if(p.scenes[0]) p.scenes[0].raw.transition={type:'cut',dur:0}; renumber(); });
  return {nCut,nOrder,nRole,nHook,nFade}; };
LAB.applyChapters=async function(o){ const p=ANIM.cur; const ins=[]; let lt=0;
  toArr(o.chapters).forEach(c=>{ const idx=(+c.before_scene||0)-1; if(idx<1||idx>=p.scenes.length||!c.title) return; ins.push({at:idx,raw:LAB.card({title:String(c.title).slice(0,60),sub:String(c.subtitle||'').slice(0,70),dur:2.2,size:10,name:'فصل',enter:'fade'})}); });
  await animEdit(()=>{ toArr(o.lowerThirds).forEach(l=>{ const sc=p.scenes[(+l.scene||0)-1]; if(!sc||!l.name||!sc.raw.layers) return; const at=clampN(+l.at||0.4,0,60), dur=clampN(+l.dur||2.5,1,10); const id=anNewId(sc.raw,'LT'); const txt=String(l.name).slice(0,40)+(l.role?' — '+String(l.role).slice(0,40):'');
      sc.raw.layers.push({id,type:'text',text:txt,size:4.6,weight:'700',color:'#FFFFFF',box:'rgba(20,24,40,0.88)',font:'Tajawal',w:62,x:36,y:84,z:(anMaxZ(sc.raw)+1),enter:{type:'wipe-rtl',at:+at.toFixed(2),dur:0.45},exit:{type:'fade',at:+(at+dur).toFixed(2),dur:0.35}}); lt++; }); });
  if(ins.length) await LAB.insertScenes(ins); else await animLoadAssets(); return {chapters:ins.length,lowerThirds:lt}; };

/* ============ the panel ============ */
const LABTYPES={};
window.anPanelLab=function(host){
  const S=LAB.st(), p=ANIM.cur, O=S.open; const has=p.scenes.length>0&&ANIM.rt;
  const sec=(id,ic,t,sub,body)=>`<section class="sm-card${O[id]?' open':''}" data-sec="${id}"><button type="button" class="sm-hd" aria-expanded="${!!O[id]}" data-tog="${id}"><span class="sm-ic" aria-hidden="true">${ic}</span><span class="sm-tt"><b>${t}</b><small>${sub}</small></span><span class="sm-chev" aria-hidden="true">▾</span></button><div class="sm-bd"${O[id]?'':' hidden'}>${body}</div></section>`;
  const msg=id=>`<span class="sm-note" id="lb-m-${id}" aria-live="polite">${escH((S.msg||{})[id]||'')}</span>`;
  const ctl=`<div class="sm-grid3"><label><span class="lbl">المنصة</span><select id="lb-plat">${Object.keys(PLATS).map(k=>`<option value="${k}"${S.plat===k?' selected':''}>${({reels:'ريلز / تيك توك / شورتس',yt:'يوتيوب طويل',li:'لينكدإن',edu:'تعليمي'})[k]}</option>`).join('')}</select></label><label style="grid-column:span 2"><span class="lbl">هدف الفيديو</span><input id="lb-goal" dir="auto" value="${escH(S.goal)}" placeholder="مثال: أبيع كورس · أشرح فكرة · أرفع الوعي"></label></div>`;
  const paste=(id,ph)=>`<label class="sm-lab" for="lb-r-${id}">رد النموذج (JSON)</label><textarea id="lb-r-${id}" dir="ltr" rows="4" placeholder='${ph}'></textarea>`;
  if(!has){ host.innerHTML='<div class="sm-wrap"><p class="hint">ضيف مشاهد الأول (من أي تبويب في المونتاج) وبعدها هتتفتح الطرق الاحترافية.</p></div>'; return; }
  const c=LAB.curve(); const dipHtml=c&&c.dips.length?c.dips.map(d=>`<li class="sm-h warn"><span class="sm-dot"></span><span>هبوط انتباه من ${fmtT(d[0])} لـ ${fmtT(d[1])}</span><button type="button" class="mt2-btn lb-go" data-t="${((d[0]+d[1])/2).toFixed(2)}">روح</button></li>`).join(''):'<li class="sm-h ok"><span class="sm-dot"></span><span>مفيش فترات طويلة بانتباه ضعيف.</span></li>';
  const retBody=`<p class="hint">تقدير تقريبي (مش قياس حقيقي) لمنحنى الانتباه من إيقاع القطع وظهور العناصر والحركة. الفترات الحمراء = احتمال تسرب المشاهد.</p>
    <canvas id="lb-cv" class="sm-cv" width="900" height="130" aria-label="منحنى الانتباه التقديري"></canvas>
    <div class="sm-chips"><span class="mt2-chip" id="lb-avg">متوسط ${c?c.avg.toFixed(0):'—'}</span><span class="mt2-chip" id="lb-hook">هوك ${c?c.hook.toFixed(0):'—'}</span><span class="mt2-chip">${c?c.dips.length:0} هبوط</span></div>
    <ul class="sm-hl" id="lb-dips">${dipHtml}</ul>
    <div class="sm-row"><button type="button" class="mt2-btn pri" id="lb-int">💥 أضف مقاطعات نمط في الهبوط</button><button type="button" class="mt2-btn" id="lb-hb">🪝 عزّز أول ثانية</button><button type="button" class="mt2-btn" id="lb-clr">↩️ شيل تعديلات المختبر</button>${msg('r')}</div>`;
  const preBody=`<p class="hint">قالب واحد يضبط الانتقالات والتأثيرات وحركة الكاميرا على كل المشاهد (ويتشال بضغطة).</p><div class="lb-presets">${Object.entries(LAB.PRESETS).map(([k,v])=>`<button type="button" class="lb-pre" data-id="${k}"><span aria-hidden="true">${v.ic}</span><b>${v.n}</b><small>${v.d}</small></button>`).join('')}</div><div class="sm-row"><button type="button" class="mt2-btn" id="lb-pclr">↩️ شيل القالب</button>${msg('p')}</div>`;
  const hookBody=`<p class="hint">يكتب لك 5 خطّافات مختلفة للثواني الأولى — تختار وتتحط كمشهد افتتاحي بحركة قوية.</p>${ctl}<div class="sm-row"><button type="button" class="mt2-btn pri" id="lb-hc">📋 انسخ البرومبت</button>${msg('k')}</div>${paste('k','{"hooks":[{"name":"…","text":"…"}]}')}<div class="sm-row"><button type="button" class="mt2-btn" id="lb-hp">📥 اعرض الخطّافات</button></div><div id="lb-hooks" class="lb-list">${(S.hooks||[]).map((h,i)=>`<div class="lb-item"><div><b>${escH(h.name||'خطّاف '+(i+1))}</b><small>${escH(h.technique||'')}</small><p dir="auto">${escH(h.text||'')}${h.sub?' — '+escH(h.sub):''}</p></div><button type="button" class="mt2-btn pri lb-hu" data-i="${i}">استخدم</button></div>`).join('')}</div>`;
  const brBody=`<p class="hint">يحدد أين تحتاج لقطات إضافية، ويديك كلمات بحث وبرومبت توليد لكل مكان — وتسحب الملف فيتركّب في المشهد.</p><div class="sm-row"><button type="button" class="mt2-btn pri" id="lb-bc">📋 انسخ البرومبت</button>${msg('b')}</div>${paste('b','{"slots":[{"scene":2,"role":"cutaway","search":"…","prompt":"…"}]}')}<div class="sm-row"><button type="button" class="mt2-btn" id="lb-bp">📥 اعرض الأماكن</button></div><div id="lb-slots" class="lb-list">${(S.slots||[]).map((s,i)=>`<div class="lb-item lb-slot${s.done?' done':''}"><div><b>مشهد ${s.scene} · ${({cutaway:'لقطة كاملة',overlay:'نافذة صغيرة',background:'خلفية'})[s.role]||s.role}</b><small dir="auto">${escH(s.why||'')}</small><p dir="ltr">🔎 ${escH(s.search||'')}</p><div class="sm-row"><button type="button" class="mt2-btn lb-cs" data-i="${i}" data-k="search">نسخ البحث</button><button type="button" class="mt2-btn lb-cs" data-i="${i}" data-k="prompt">نسخ برومبت التوليد</button></div></div><label class="mt2-btn${s.done?'':' pri'}" for="lb-f${i}">${s.done?'✔ اتركّب':'⬆️ ركّب ملف'}</label><input type="file" id="lb-f${i}" class="lb-file" data-i="${i}" accept="image/*,video/*" hidden></div>`).join('')}</div>`;
  const stBody=`<p class="hint">يعيد بناء القصة على هيكل معروف: يحدد دور كل مشهد، ويقترح ترتيبًا أقوى وحذف الحشو ويعيد صياغة الهوك.</p>${ctl}<div class="sm-grid3"><label style="grid-column:span 3"><span class="lbl">هيكل القصة</span><select id="lb-arc">${Object.keys(ARCS).map(k=>`<option value="${k}"${S.arc===k?' selected':''}>${ARCS[k][0]}</option>`).join('')}</select></label></div><div class="sm-row"><button type="button" class="mt2-btn pri" id="lb-sc">📋 انسخ البرومبت</button>${msg('s')}</div>${paste('s','{"roles":[…],"order":[…],"cut":[…],"hook":{…}}')}
    <div class="sm-row"><label class="an-sw"><input type="checkbox" id="lb-do-o" ${S.doOrder!==false?'checked':''}> <span>طبّق الترتيب الجديد</span></label><label class="an-sw"><input type="checkbox" id="lb-do-c" ${S.doCut?'checked':''}> <span>احذف المشاهد المقترحة (بحد أقصى 25%)</span></label></div><div class="sm-row"><button type="button" class="mt2-btn pri" id="lb-sa">✅ طبّق</button></div>`;
  const chBody=`<p class="hint">بطاقات عناوين للفصول + شريط سفلي بأسماء الأشخاص/الأماكن اللي بتظهر في الكلام (بدون اختراع أسماء).</p>${ctl}<div class="sm-row"><button type="button" class="mt2-btn pri" id="lb-cc">📋 انسخ البرومبت</button>${msg('c')}</div>${paste('c','{"chapters":[{"before_scene":3,"title":"…"}],"lowerThirds":[…]}')}<div class="sm-row"><button type="button" class="mt2-btn pri" id="lb-ca">✅ طبّق</button></div>`;
  host.innerHTML=`<div class="sm-wrap">`+sec('r','🔬','مختبر الاحتفاظ','منحنى انتباه تقديري + إصلاح الهبوط',retBody)+sec('p','🎚️','قوالب الإيقاع','سوشيال · وثائقي · سينمائي · تعليمي',preBody)+sec('k','🪝','مختبر الخطّاف (Hook Lab)','5 افتتاحيات مختلفة بالـAI',hookBody)+sec('b','🎯','مخطط اللقطات (B-roll)','الـAI يحدد المكان وأنت تركّب الملف',brBody)+sec('s','🧠','طبيب القصة','هيكل · ترتيب · حذف حشو · هوك',stBody)+sec('c','🏷️','بطاقات الفصول واللوحات السفلية','عناوين + أسماء أشخاص',chBody)+`</div>`;
  LAB.bind(host,c);
};
LAB.bind=function(host,c){
  const S=LAB.st(), $=s=>host.querySelector(s); const say=(id,t)=>{ S.msg[id]=t; const e=$('#lb-m-'+id); if(e) e.textContent=t; };
  host.querySelectorAll('[data-tog]').forEach(b=>b.onclick=()=>{ const id=b.dataset.tog; S.open[id]=!S.open[id]; const k=b.closest('.sm-card'); k.classList.toggle('open',S.open[id]); b.setAttribute('aria-expanded',!!S.open[id]); k.querySelector('.sm-bd').hidden=!S.open[id]; if(id==='r'&&S.open[id]) LAB.drawCurve($('#lb-cv'),LAB.curve()); });
  if($('#lb-cv')) LAB.drawCurve($('#lb-cv'),c);
  host.querySelectorAll('.lb-go').forEach(b=>b.onclick=()=>animSeek(+b.dataset.t));
  const sync=()=>{ const pl=$('#lb-plat'), g=$('#lb-goal'); if(pl) S.plat=pl.value; if(g) S.goal=g.value; };
  host.querySelectorAll('#lb-plat,#lb-goal,#lb-arc').forEach(e=>e.onchange=()=>{ sync(); if(e.id==='lb-arc') S.arc=e.value; });
  const copy=async(txt,id)=>{ sync(); try{ await navigator.clipboard.writeText(txt()); toast('اتنسخ البرومبت — ابعته لأي نموذج ولصق الرد (JSON) تحت'); say(id,'اتنسخ ✔'); }catch(e){ const t=$('#lb-r-'+id); if(t){ t.value=txt(); t.select(); } toast('انسخ النص من الخانة'); } };
  const parse=id=>{ try{ return SM.extractJson(($('#lb-r-'+id)||{}).value); }catch(e){ say(id,'الرد مش JSON صالح: '+(e.message||e)); return null; } };
  const ri=$('#lb-int'); if(ri) ri.onclick=async()=>{ const n=await LAB.interrupts(); say('r',n?`اتضاف ${n} مقاطعة نمط — Ctrl+Z يرجّع`:'مفيش هبوط يحتاج إصلاح'); animRenderPanel(); };
  const hb=$('#lb-hb'); if(hb) hb.onclick=async()=>{ await LAB.hookBoost(); say('r','اتعزّزت أول ثانية'); animRenderPanel(); };
  const cl=$('#lb-clr'); if(cl) cl.onclick=async()=>{ await LAB.clearLab(); say('r','اتشالت تعديلات المختبر'); animRenderPanel(); };
  host.querySelectorAll('.lb-pre').forEach(b=>b.onclick=async()=>{ const n=await LAB.applyPreset(b.dataset.id); say('p','اتطبّق القالب على '+n+' مشهد'); animRenderPanel(); });
  const pc=$('#lb-pclr'); if(pc) pc.onclick=async()=>{ await LAB.clearPreset(); say('p','اتشال القالب'); animRenderPanel(); };
  const hc=$('#lb-hc'); if(hc) hc.onclick=()=>copy(()=>LAB.promptHook(S),'k');
  const hp=$('#lb-hp'); if(hp) hp.onclick=()=>{ const o=parse('k'); if(!o) return; S.hooks=toArr(o.hooks).filter(h=>h&&h.text).slice(0,6); S.open.k=true; animRenderPanel(); };
  host.querySelectorAll('.lb-hu').forEach(b=>b.onclick=async()=>{ await LAB.applyHook(S.hooks[+b.dataset.i]); toast('اتحط الخطّاف كأول مشهد'); animRenderPanel(); });
  const bc=$('#lb-bc'); if(bc) bc.onclick=()=>copy(()=>LAB.promptBroll(S),'b');
  const bp=$('#lb-bp'); if(bp) bp.onclick=()=>{ const o=parse('b'); if(!o) return; S.slots=toArr(o.slots).filter(s=>s&&+s.scene>=1&&+s.scene<=ANIM.cur.scenes.length).map(s=>Object.assign({},s,{scene:+s.scene,role:/^(cutaway|overlay|background)$/.test(s.role)?s.role:'cutaway'})); S.open.b=true; animRenderPanel(); };
  host.querySelectorAll('.lb-cs').forEach(b=>b.onclick=async()=>{ const s=S.slots[+b.dataset.i]; try{ await navigator.clipboard.writeText(s[b.dataset.k]||''); toast('اتنسخ'); }catch(e){ toast('تعذّر النسخ'); } });
  host.querySelectorAll('.lb-file').forEach(f=>f.onchange=async()=>{ const s=S.slots[+f.dataset.i]; if(!f.files[0]) return; if(await LAB.attachSlot(s,f.files[0])){ s.done=true; toast('اتركّب في مشهد '+s.scene); animRenderPanel(); } });
  const sc=$('#lb-sc'); if(sc) sc.onclick=()=>copy(()=>LAB.promptStory(S),'s');
  const sa=$('#lb-sa'); if(sa) sa.onclick=async()=>{ S.doOrder=$('#lb-do-o').checked; S.doCut=$('#lb-do-c').checked; const o=parse('s'); if(!o) return; const r=await LAB.applyStory(o,{doOrder:S.doOrder,doCut:S.doCut}); say('s',`أدوار ${r.nRole} · هوك ${r.nHook} · ترتيب ${r.nOrder?'اتغيّر':'زي ما هو'} · حذف ${r.nCut} · fade ${r.nFade}`); animRefreshAll(); animRenderPanel(); };
  const cc=$('#lb-cc'); if(cc) cc.onclick=()=>copy(()=>LAB.promptChapters(S),'c');
  const ca=$('#lb-ca'); if(ca) ca.onclick=async()=>{ const o=parse('c'); if(!o) return; const r=await LAB.applyChapters(o); say('c',`اتضاف ${r.chapters} بطاقة فصل و ${r.lowerThirds} شريط سفلي`); animRefreshAll(); animRenderPanel(); };
};
})();
