/* ===== pro18: توليد المشاهد محليًا من الفيديو + «صف شكل المونتاج بكلامك» =====
   GEN.parse(text)      → spec (pace / transitions / camera / fx / grade / colours …) + chips shown to the user
   GEN.sceneJson(i)     → the same JSON an AI reply would contain, built locally from the transcript (no LLM)
   Montage panel        → ⚡ button beside «copy prompt» + a free-text style box (also appended to the prompt)
   Pro-methods panel    → free-text style box that applies a custom rhythm preset (and is added to every prompt) */
(function(){
const GEN=window.GEN=window.GEN||{};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nz=s=>String(s||'').toLowerCase().replace(/[ً-ٰٟـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- 1) describe-your-style parser (keywords, Arabic + English, no LLM) ---------- */
const COLORS=[[/احمر|red/,'#E53935','أحمر'],[/ازرق|blue/,'#1E88E5','أزرق'],[/اخضر|green/,'#43A047','أخضر'],[/اصفر|yellow/,'#FDD835','أصفر'],[/برتقالي|orange/,'#FB8C00','برتقالي'],[/بنفسجي|purple|violet/,'#8E24AA','بنفسجي'],[/وردي|pink/,'#EC407A','وردي'],[/ذهبي|gold/,'#FFC107','ذهبي'],[/تركواز|فيروزي|teal|cyan/,'#00ACC1','تركواز']];
const RULES=[
 ['pace','fast',/سريع|لاهث|حماس|ريلز|تيك ?توك|شورتس|reels|tiktok|shorts|fast|snappy|energetic|punchy|rapid|quick/,'⚡ إيقاع سريع'],
 ['pace','slow',/هادي|هادئ|بطيء|بطي|رايق|تاملي|calm|slow|relax|gentle|elegant|ناعم/,'🐢 إيقاع هادئ'],
 ['tr','cut',/قطع حاد|قطعات حاده|hard cut|jump cut|no transition|بدون انتقال/,'✂️ قطع حاد'],
 ['tr','fade',/fade|ذوبان|تلاشي|انتقال ناعم|dissolve/,'🌫️ ذوبان'],
 ['tr','slide-left',/سلايد|slide|انزلاق/,'➡️ انزلاق'],
 ['tr','wipe',/wipe|مسح/,'🧹 مسح'],
 ['tr','whip',/whip|سحب سريع/,'💨 سحب سريع'],
 ['tr','glitch',/glitch|جلتش|تشويش/,'📺 جلتش'],
 ['tr','zoom-in',/zoom.?in|زووم داخل|تكبير داخل/,'🔍 انتقال زووم'],
 ['tr','push-left',/push|دفع/,'👉 دفع'],
 ['tr','flash',/flash|وميض|فلاش/,'⚪ وميض'],
 ['punch',1,/زووم|زوم|تكبير|zoom|punch|نبض/,'🔍 ضربات تكبير'],
 ['shake',1,/اهتزاز|shake|رعشه|هز /,'📳 اهتزاز'],
 ['slow',1,/كين بيرنز|ken ?burns|دريفت|drift|حركه كاميرا (بطيئه|هادئه)|slow push/,'🎥 حركة كاميرا بطيئة'],
 ['fx','vignette',/فينييت|vignette|اطراف داكنه|تعتيم/,'◐ تعتيم الأطراف'],
 ['fx','grain',/حبيبات|grain|فيلم قديم|film look|35 ?mm/,'🎞️ حبيبات فيلم'],
 ['fx','letterbox',/ليتربوكس|letterbox|شريط سينمائي|سينمائي|cinematic|cinema/,'🎬 شريط سينمائي'],
 ['fx','chromatic',/chromatic|انحراف لوني|rgb/,'🌈 انحراف لوني'],
 ['fx','lightleak',/light ?leak|تسريب ضوء/,'✨ تسريب ضوء'],
 ['grade','dramatic',/درام|dramatic|contrast|تباين عالي/,'🎨 تلوين درامي'],
 ['grade','golden',/ذهبي|golden|غروب|sunset/,'🎨 تلوين ذهبي'],
 ['grade','warm',/دافي|دافئ|warm/,'🎨 تلوين دافئ'],
 ['grade','night',/ليلي|بارد|night|cold|blue tone/,'🎨 تلوين ليلي'],
 ['grade','faded',/باهت|قديم|vintage|faded|retro|ريترو/,'🎨 تلوين باهت'],
 ['size','big',/ضخم|عريض|نص كبير|خط كبير|bold text|huge|big text|large text/,'🔠 نص ضخم'],
 ['minimal',1,/نص قليل|بسيط|minimal|clean|نظيف|مينيمال|هادي بصريا/,'▫️ بساطة'],
 ['notext',1,/بدون نص|no text|بلا نص/,'🚫 بدون نص'],
 ['captions',1,/كابشن|ترجمه|subtitle|caption/,'💬 كابشن'],
 ['marks',1,/علامات|تحديد|خط تحت|underline|highlight|دائره|circle|اسهم|arrow/,'✏️ علامات تحديد'],
 ['hook',1,/هوك|خطاف|hook|بدايه قويه|اول ثانيه|اول ثانيتين/,'🪝 هوك قوي'],
 ['interrupts',1,/مقاطعه|interrupt|تنويع|تغيير مستمر|ما يمل|متملش|مش ممل/,'💥 مقاطعات نمط'],
 ['density','rich',/غني|مزدحم|عناصر كتير|rich|busy|dense/,'🧩 كثافة عالية'],
 ['density','calm',/عناصر قليله|مساحه فارغه|calm layout|airy/,'🫧 كثافة منخفضة'],
 ['dark',1,/خلفيه (داكنه|سودا|سوداء|اسود)|dark bg|dark background/,'🌑 خلفية داكنة'],
 ['light',1,/خلفيه (فاتحه|بيضا|بيضاء|ابيض)|light bg|white bg|light background/,'☀️ خلفية فاتحة']
];
GEN.parse=function(text){
  const t=nz(text), spec={pace:'normal',tr:null,punch:0,shake:0,slow:0,fx:[],grade:null,size:'normal',minimal:0,notext:0,captions:0,marks:0,hook:0,interrupts:0,density:null,dark:0,light:0,accent:null,len:null}, tags=[];
  RULES.forEach(([k,v,re,label])=>{ if(!re.test(t)) return;
    if(k==='fx') { if(!spec.fx.includes(v)) spec.fx.push(v); } else if(k==='tr'){ if(!spec.tr) spec.tr=v; else return; } else if(k==='pace'){ if(spec.pace!=='normal') return; spec.pace=v; } else if(k==='grade'){ if(spec.grade) return; spec.grade=v; } else spec[k]=v;
    tags.push(label); });
  if(spec.pace==='fast'&&/هاد|calm|slow|بطيء/.test(t)&&/سريع|fast/.test(t)){ /* both mentioned: keep the first one found */ }
  const m=t.match(/(?:كل|each|every)?\s*(\d+(?:\.\d+)?)\s*(?:ثانيه|ثواني|ث(?![\u0600-\u06FF])|sec|s(?![a-z]))/); if(m){ spec.len=clampN(+m[1],1.5,20); tags.push('⏱️ كل ~'+spec.len+' ث'); }
  let best=-1; COLORS.forEach(([re,hex,nm])=>{ const mm=re.exec(t); if(mm&&mm.index>best){ best=mm.index; spec.accent=hex; spec._cn=nm; } }); if(spec.accent) tags.push('🎨 لون مميز: '+spec._cn);
  return {spec,tags,text:String(text||'').trim()};
};
GEN.defaults=function(spec,M){
  const o=Object.assign({},spec); const st=M&&M.style;
  if(o.pace==='normal'&&st){ if(/reels|kinetic|motion/.test(st)) o.pace='fast'; else if(/documentary|cinematic|podcast/.test(st)) o.pace='slow'; }
  if(!o.len){ const byLen=M&&M.len?{short:3.5,medium:6,long:10}[M.len]:6; o.len=o.pace==='fast'?3:(o.pace==='slow'?9:byLen); }
  if(!o.tr) o.tr=o.pace==='fast'?'cut':(o.pace==='slow'?'fade':'fade');
  return o; };
/* a spec → preset understood by LAB.applyPreset (pro methods) */
GEN.toPreset=function(spec){
  const o=GEN.defaults(spec,null); const fast=o.pace==='fast', slow=o.pace==='slow';
  const fx=o.fx.map(n=>[n,n==='letterbox'?0.5:(n==='vignette'?0.3:(n==='grain'?0.22:0.45))]);
  if(slow&&!fx.length) fx.push(['vignette',0.25]);
  return {n:'مخصص',tr:{type:o.tr,dur:o.tr==='cut'?0:(slow?0.8:0.4)},punch:(o.punch||fast)?{every:fast?2.5:3.5,scale:fast?1.08:1.06}:null,slow:(o.slow||slow)?1.05:null,shake:!!o.shake,fx,grade:o.grade,cap:(fast||spec.len)?Math.round(o.len):null};
};
GEN.summary=function(P){ return P.tags.length?P.tags.join(' · '):'ما فهمتش كلمات مفتاحية — هتتبعت كتعليمات حرّة للـAI في البرومبت.'; };

/* ---------- 2) local scene generator (transcript → scene JSON, same shape as an AI reply) ---------- */
const STOP=new Set('و في من على الى إلى عن ان أن إن ما لا هذا هذه ذلك التي الذي هو هي انا انت نحن كان كل مع او أو ثم قد لم لن لقد the a an of to and in on is are was it that this for with as at by be or but'.split(' '));
function keyPhrase(ws){
  if(!ws.length) return {text:'',i:0};
  let bi=0,bs=-1; ws.forEach((w,i)=>{ const x=nz(w.w).replace(/[^\p{L}\p{N}]+/gu,''); if(!x||STOP.has(x)) return; const sc=x.length+(i<ws.length*0.6?1.5:0)+(/\d/.test(x)?4:0); if(sc>bs){ bs=sc; bi=i; } });
  const endsS=i=>/[.!?؟…]["”»)]*$/.test(String(ws[i].w));
  let s0=0; for(let i=bi-1;i>=0;i--) if(endsS(i)){ s0=i+1; break; }
  let e0=ws.length; for(let i=bi;i<ws.length;i++) if(endsS(i)){ e0=i+1; break; }
  const a=Math.max(s0,Math.min(bi-1,e0-3)), b=Math.min(e0,a+3);
  return {text:ws.slice(a,b).map(w=>w.w).join(' ').replace(/[،,.؟?!:;…]+$/,''),i:a};
}
function plan(M,part,o){
  const words=M.words.filter(w=>w.s>=part.a-0.02&&w.s<part.b-0.02); const cuts=anMontCuts(M.words,M.src.dur); const out=[]; let from=part.a;
  const minLen=Math.max(1.5,o.len*0.55);
  while(from<part.b-0.3){
    let want=from+o.len; if(want>=part.b-minLen*0.8){ out.push([from,part.b]); break; }
    let t=anMontSnap(cuts,want,Math.max(1,o.len*0.45)); if(t<from+minLen) t=from+minLen; if(t>part.b-0.6) t=part.b; out.push([from,t]); from=t;
  }
  return {words,scenes:out};
}
const TRS={fast:['cut','whip','zoom-in','slide-left','glitch'],normal:['fade','slide-left','push-left','wipe','fade'],slow:['fade','fade','fade-black','fade','fade']};
const ENT={fast:['word-pop','stamp','zoom-blur','slide-blur-up'],normal:['word-rise','pop','slide-blur-up','word-fade'],slow:['word-fade','fade','letter-fade','fade']};
GEN.sceneJson=function(pi,specIn){
  const p=ANIM.cur, M=anMontState(p), parts=anMontParts(M), part=parts[Math.min(pi,parts.length-1)]; const isVid=M.src.kind==='video';
  const P=specIn?{spec:specIn}:GEN.parse(M.styleText||''); const o=GEN.defaults(P.spec,M); const pl=plan(M,part,o); const sc=[]; const vert=/^(9:16|3:4|4:5)$/.test(p.ratio||'');
  const acc=o.accent||'#FFD54F', bgDark=o.light?'#F4F1EA':'#0B0D12', fg=o.light?'#14171F':'#FFFFFF';
  const palette=o.accent?[o.accent,'#FFFFFF']:['#FFD54F','#4FC3F7','#FF8A65','#81C784'];
  const bgs=o.light?['#F4F1EA','#E9EEF5','#F6EFE6']:['#0B0D12','#101B33','#1B1030','#0E2220'];
  pl.scenes.forEach(([a,b],k)=>{
    const ws=pl.words.filter(w=>w.s>=a-0.02&&w.s<b-0.02); const dur=Math.max(0.5,b-a);
    let show='none'; if(isVid&&M.show!=='anim'){ show=M.show==='overlay'?'full':((M.show==='mix'||M.show==='auto')?(k%2===0?'full':'none'):'full'); if(k===0&&M.show!=='mix') show='full'; }
    const kp=keyPhrase(ws); const layers=[]; const cue=ws[kp.i]?String(ws[kp.i].w).replace(/[،,.؟?!:;…"«»]+/g,''):null; const at=ws[kp.i]?Math.max(0.05,+(ws[kp.i].s-a).toFixed(2)):0.2;
    const ac=palette[k%palette.length];
    const full=show==='full'; const big=o.size==='big'?1.25:(o.minimal?0.8:1); const nChar=kp.text.length;
    const size=+(Math.min(vert?10:8,nChar<=10?10:(nChar<=18?8:(nChar<=28?6.4:5.2)))*big*(vert?1:0.82)).toFixed(1);
    if(!o.notext&&kp.text){
      const tl={id:'T1',type:'text',text:kp.text,x:50,y:full?(vert?74:82):46,size,weight:'900',color:fg,font:'Cairo',w:88,z:3,enter:{type:ENT[o.pace][k%ENT[o.pace].length],at,dur:0.55}};
      if(cue) tl.cue=cue; if(full||o.light) tl.box=o.light&&!full?'rgba(255,255,255,0.0)':'rgba(0,0,0,0.5)'; layers.push(tl);
      if(!o.minimal&&!full) layers.push({id:'A1',type:'shape',shape:'rect',x:50,y:58,w:14,h:0.8,fill:ac,z:1,enter:{type:'wipe',at:Math.min(at+0.25,dur*0.6),dur:0.4}});
      if((o.marks||o.density==='rich')&&nChar>3) layers.push({id:'M1',type:'mark',mark:(k%3===0?'underline':(k%3===1?'highlight':'circle')),target:'T1',color:ac,z:4,enter:{type:'draw',at:Math.min(at+0.5,dur*0.7),dur:0.5}});
    }
    if(o.density==='rich'&&!o.minimal&&ws.length>5){ const second=ws.slice(Math.floor(ws.length/2)).find(w=>nz(w.w).length>4); if(second) layers.push({id:'T2',type:'text',text:String(second.w).replace(/[،,.؟?!:;…]+$/,''),x:50,y:full?(vert?62:68):66,size:4.6,weight:'700',color:ac,font:'Tajawal',w:70,z:3,enter:{type:'fade',at:Math.min(+(second.s-a).toFixed(2),dur*0.8),dur:0.4}}); }
    const cam=[]; if(o.punch||o.pace==='fast') cam.push({type:'zoom',from:+Math.min(at,dur*0.5).toFixed(2),to:+Math.min(at+0.4,dur*0.8).toFixed(2),scale:1.09});
    if(o.slow||o.pace==='slow'||(!cam.length&&k%2===0)) cam.push({type:'zoom',from:0,to:+dur.toFixed(2),scale:o.pace==='slow'?1.08:1.05});
    if(o.shake&&k%2===1) cam.push({type:'shake',from:0,to:0.3,amount:1.2});
    const fxs=o.fx.map(n=>({type:n,amount:n==='letterbox'?0.5:0.35})); if(o.grade) fxs.push({type:'grade',grade:o.grade,amount:0.6});
    const tr=k===0?{type:'cut',dur:0}:{type:(o.tr===(o.pace==='fast'?'cut':'fade')&&!P.spec.tr)?TRS[o.pace][k%TRS[o.pace].length]:o.tr,dur:o.tr==='cut'?0:(o.pace==='slow'?0.8:0.4)};
    const r={scene:k+1+(pi*1000),title:kp.text.slice(0,40),from:+a.toFixed(3),to:+b.toFixed(3),background:full?'#000000':bgs[k%bgs.length],source:{show},layers,camera:cam,effects:fxs,transition:tr};
    if(k===0&&o.hook){ r.camera.push({type:'zoom',from:0,to:0.55,scale:1.13}); r.effects.push({type:'flicker',from:0,to:0.3,amount:0.6}); }
    sc.push(r);
  });
  /* scene numbers: 1..n (anMontApply renumbers on clash) */
  sc.forEach((r,i)=>r.scene=i+1);
  return JSON.stringify({title:p.name,style:'محلي — '+(P.tags&&P.tags.length?P.tags.join(' '):'تلقائي'),range:[part.a,part.b],scenes:sc},null,1);
};

/* ---------- 3) prompt: add the user's own style description ---------- */
const lineFor=t=>'CUSTOM MONTAGE STYLE — described by the user in their own words (it overrides the preset above wherever they conflict; follow its rhythm, camera, colours and mood): "'+String(t).replace(/"/g,"'")+'"';
if(typeof anMontPrompt==='function'){ const _p=anMontPrompt; window.anMontPrompt=function(pi){ let s=_p(pi); try{ const M=anMontState(ANIM.cur); if(M.styleText&&M.styleText.trim()){ const L=s.split('\n'); let i=L.findIndex(x=>/EXTRA DIRECTION FROM THE USER/.test(x)); if(i<0) i=Math.min(L.length,12); L.splice(i,0,'- '+lineFor(M.styleText.trim())); s=L.join('\n'); } }catch(e){} return s; }; }

/* ---------- 4) montage panel injection ---------- */
const styleBox=(id,val,sample)=>`<div class="gn-box"><label class="gn-lab" for="${id}">✍️ صف شكل المونتاج بكلامك <small>(بدل الاختيار من قوالب جاهزة)</small></label><textarea id="${id}" dir="auto" rows="3" placeholder="${esc(sample)}">${esc(val||'')}</textarea><div class="gn-chips" id="${id}-c" aria-live="polite"></div><div class="gn-ex">${['سريع ولاهث بزووم وقطع حاد وخلفية داكنة','هادئ وسينمائي بتلوين ذهبي وانتقالات ذوبان','كل 4 ثواني، كابشن ضخم أصفر، علامات تحديد'].map(x=>`<button type="button" class="gn-sg" data-t="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>`;
const showChips=(el,text)=>{ if(!el) return; if(!String(text||'').trim()){ el.innerHTML=''; return; } const P=GEN.parse(text); el.innerHTML='<b>فهمت:</b> '+(P.tags.length?P.tags.map(t=>`<span class="mt2-chip">${esc(t)}</span>`).join(''):'<span class="gn-none">لا كلمات مفتاحية معروفة — هتتبعت للـAI كما هي</span>'); };
const SAMPLE='مثال: عايزه سريع زي الريلز، قطع حاد، زووم على الكلمات المهمة، خلفية داكنة ولون أصفر مميز';
if(typeof anPanelMontage==='function'){
  const _pm=anPanelMontage;
  window.anPanelMontage=function(box){
    _pm(box);
    try{
      const p=ANIM.cur, M=anMontState(p); const has=M.src&&M.words&&M.words.length;
      const s4=box.querySelector('[data-s="s4"] .mt2-body'); const note=box.querySelector('#mt-note');
      if(s4&&note&&!box.querySelector('#gn-st')){
        note.insertAdjacentHTML('beforebegin',styleBox('gn-st',M.styleText,SAMPLE));
        const ta=box.querySelector('#gn-st'), ch=box.querySelector('#gn-st-c'); showChips(ch,M.styleText);
        ta.oninput=()=>{ M.styleText=ta.value; showChips(ch,ta.value); animSaveSoon(); };
        box.querySelectorAll('.gn-sg').forEach(b=>b.onclick=()=>{ ta.value=b.dataset.t; ta.oninput(); });
      }
      if(has){
        const parts=anMontParts(M);
        box.querySelectorAll('.mt-pc').forEach(pc=>{ const i=+pc.dataset.i; const row=pc.querySelector('.mt-pb'); if(!row||pc.querySelector('.gn-gen')) return;
          const b=document.createElement('button'); b.type='button'; b.className='mt2-btn sm gn-gen'; b.dataset.gen=i; b.textContent=M.src.kind==='video'?'⚡ ولّد المشاهد من الفيديو':'⚡ ولّد المشاهد تلقائيًا'; b.title='بيبني المشاهد من الكلام والسكتات على جهازك بدون AI، وبيتبع وصف الأسلوب';
          row.appendChild(b);
          b.onclick=async()=>{ if(ANIM._montApplying){ toast('في تطبيق شغّال — استنى'); return; }
            let js; try{ js=GEN.sceneJson(i); }catch(e){ console.warn(e); toast('تعذّر التوليد: '+(e.message||e)); return; }
            const ta=pc.querySelector('[data-reply]'); ta.value=js; (ANIM._montRep=ANIM._montRep||{})[i]=js; const ap=pc.querySelector('[data-apply]'); if(ap) ap.click(); };
        });
      }
    }catch(e){ console.warn('pro18',e); }
  };
}

/* ---------- 5) pro-methods panel injection + prompts ---------- */
const labStyle=()=>{ const S=LAB.st(); return S.styleText||''; };
['promptHook','promptBroll','promptStory','promptChapters'].forEach(n=>{ const f=LAB[n]; if(typeof f!=='function') return; LAB[n]=function(S){ let s=f.call(LAB,S); const t=labStyle().trim(); if(t){ const L=s.split('\n'); L.splice(Math.max(1,L.length-1),0,lineFor(t)); s=L.join('\n'); } return s; }; });
GEN.applyToProject=async function(text){
  const P=GEN.parse(text); const pr=GEN.toPreset(P.spec); let n=0;
  LAB.PRESETS.custom=pr; try{ n=await LAB.applyPreset('custom'); } finally{ delete LAB.PRESETS.custom; }
  let extra=[]; if(P.spec.hook){ await LAB.hookBoost(); extra.push('هوك'); } if(P.spec.interrupts){ const k=await LAB.interrupts(); extra.push(k+' مقاطعة'); }
  return {n,tags:P.tags,extra}; };
if(typeof window.anPanelLab==='function'){
  const _pl=window.anPanelLab;
  window.anPanelLab=function(host){
    _pl(host);
    try{
      const wrap=host.querySelector('.sm-wrap'); if(!wrap||host.querySelector('#gn-lab')) return; const S=LAB.st();
      const sec=document.createElement('section'); sec.className='sm-card open gn-card';
      sec.innerHTML=`<div class="sm-hd" style="cursor:default"><span class="sm-ic" aria-hidden="true">✍️</span><span class="sm-tt"><b>صف مونتاجك بكلامك</b><small>بدل قالب ثابت — يتفهم ويتطبّق على كل المشاهد</small></span></div><div class="sm-bd">${styleBox('gn-lab',S.styleText,SAMPLE)}<div class="sm-row"><button type="button" class="mt2-btn pri" id="gn-apply">🎛️ طبّق وصفي على كل المشاهد</button><button type="button" class="mt2-btn" id="gn-undo">↩️ شيل القالب</button><span class="sm-note" id="gn-msg" aria-live="polite"></span></div><p class="hint">الوصف بيتحفظ وبيتضاف تلقائيًا لكل برومبتات الطرق الاحترافية تحت. الألوان والخلفيات بتُستخدم في توليد المشاهد وفي البرومبت (التطبيق على مشاهد موجودة بيغيّر الإيقاع والانتقالات والكاميرا والتأثيرات).</p></div>`;
      wrap.insertBefore(sec,wrap.firstChild);
      const ta=sec.querySelector('#gn-lab'), ch=sec.querySelector('#gn-lab-c'), msg=sec.querySelector('#gn-msg'); showChips(ch,S.styleText); msg.textContent=S.gnMsg||'';
      ta.oninput=()=>{ S.styleText=ta.value; showChips(ch,ta.value); };
      sec.querySelectorAll('.gn-sg').forEach(b=>b.onclick=()=>{ ta.value=b.dataset.t; ta.oninput(); });
      sec.querySelector('#gn-apply').onclick=async()=>{ if(!ta.value.trim()){ msg.textContent='اكتب وصف الأول'; return; } const r=await GEN.applyToProject(ta.value); S.gnMsg='اتطبّق على '+r.n+' مشهد'+(r.extra.length?' + '+r.extra.join(' + '):'')+' — Ctrl+Z يرجّع'; msg.textContent=S.gnMsg; if(typeof animRefreshAll==='function') animRefreshAll(); };
      sec.querySelector('#gn-undo').onclick=async()=>{ await LAB.clearPreset(); S.gnMsg='اتشال القالب'; msg.textContent=S.gnMsg; };
    }catch(e){ console.warn('pro18 lab',e); }
  };
}
})();
