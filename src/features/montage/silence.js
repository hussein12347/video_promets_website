
/* ===================== automatic silence cutting ===================== */
const AN_SIL_SENS={soft:['حذر — يقصّ السكتات الواضحة بس',46],normal:['متوسط — مناسب لمعظم التسجيلات',38],strong:['قوي — يقصّ حتى الهمس والنَفَس',30]};
const AN_SIL_MIN=[[0.3,'0.3 ث — إيقاع سريع جدًا'],[0.45,'0.45 ث — سريع'],[0.7,'0.7 ث — متوسط'],[1,'1 ث — سكتات طويلة بس'],[1.5,'1.5 ث — سكتات طويلة جدًا']];
function anSilState(M){ if(!M.sil||typeof M.sil!=='object') M.sil={}; const D={on:false,min:0.45,pad:0.12,sens:'normal',ranges:null}; Object.keys(D).forEach(k=>{ if(M.sil[k]===undefined) M.sil[k]=D[k]; }); return M.sil; }
/* short-time energy (dB) every 10 ms — cached per source */
async function anMontEnergy(){
  const M=anMontState(ANIM.cur); if(ANIM._montEn&&ANIM._montEn.id===M.src.id) return ANIM._montEn;
  const buf=await anMontBuf(); const sr=buf.sampleRate, hop=Math.max(1,Math.round(sr*0.01)), win=Math.max(2,Math.round(sr*0.02)); const n=Math.max(1,Math.floor(buf.length/hop)); const C=[]; for(let c=0;c<buf.numberOfChannels;c++) C.push(buf.getChannelData(c));
  const db=new Float32Array(n);
  for(let i=0;i<n;i++){ let s=0,cnt=0; const a=i*hop; const end=Math.min(buf.length,a+win); for(let k=a;k<end;k+=2){ for(let c=0;c<C.length;c++){ const v=C[c][k]; s+=v*v; cnt++; } } db[i]=20*Math.log10(Math.sqrt(s/Math.max(1,cnt))+1e-6); }
  return ANIM._montEn={id:M.src.id,hop:hop/sr,db,dur:buf.length/sr};
}
/* find the silences: below (loud-level − D dB) for at least `min` seconds; each end keeps `pad` s of natural pause; words are never cut */
function anMontDetect(en,words,o){
  const db=en.db, n=db.length, hop=en.hop, total=en.dur;
  const sorted=Float32Array.from(db).sort(); const q=f=>sorted[Math.min(n-1,Math.floor(f*n))];
  const hi=q(0.95), lo=q(0.05); const D=(AN_SIL_SENS[o.sens]||AN_SIL_SENS.normal)[1];
  let thr=Math.max(hi-D,lo+3); thr=Math.min(thr,hi-10);
  const raw=[]; let st=-1;
  for(let i=0;i<=n;i++){ const sil=i<n&&db[i]<thr; if(sil&&st<0) st=i; else if(!sil&&st>=0){ const a=st*hop, b=Math.min(total,i*hop); st=-1; if(b-a>=o.min) raw.push([a,b]); } }
  let out=[];
  raw.forEach(([a,b])=>{ const ra=a<=hop*3?0:a+o.pad, rb=b>=total-hop*3?total:b-o.pad; if(rb-ra>=0.1) out.push([ra,rb]); });
  if(words&&words.length){ /* never cut through a recognised word */
    const prot=words.map(w=>[w.s-0.03,w.e+0.03]); const res=[];
    out.forEach(([a,b])=>{ let seg=[[a,b]]; prot.forEach(([x,y])=>{ if(y<=a||x>=b) return; const nx=[]; seg.forEach(([s,e])=>{ if(y<=s||x>=e){ nx.push([s,e]); return; } if(x>s) nx.push([s,x]); if(y<e) nx.push([y,e]); }); seg=nx; }); seg.forEach(r=>{ if(r[1]-r[0]>=0.1) res.push(r); }); });
    out=res;
  }
  return {thr,hi,lo,ranges:out.map(([a,b])=>({a:+a.toFixed(3),b:+b.toFixed(3),on:true}))};
}
async function anMontDetectRun(){
  const M=anMontState(ANIM.cur), S=anSilState(M); const en=await anMontEnergy(); const r=anMontDetect(en,M.words,S); S.ranges=r.ranges; S.thr=+r.thr.toFixed(1); animSaveSoon(); return r;
}
function anMontRemoved(M){ const S=M.sil; return (S&&S.on&&Array.isArray(S.ranges))?S.ranges.filter(r=>r.on!==false).map(r=>[r.a,r.b]):[]; }
/* the parts of [from,to] that are kept after removing the silences */
function anMontPieces(M,from,to){
  let P=[[from,to]];
  anMontRemoved(M).forEach(([a,b])=>{ if(b<=from||a>=to) return; const N=[]; P.forEach(([x,y])=>{ if(b<=x||a>=y){ N.push([x,y]); return; } if(a>x) N.push([x,a]); if(b<y) N.push([b,y]); }); P=N; });
  P=P.filter(q=>q[1]-q[0]>=0.08); if(!P.length) P=[[from,Math.min(to,from+0.3)]];
  return P.map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)]);
}
function anMontMap(P){ const offs=[]; let acc=0; P.forEach(q=>{ offs.push(acc); acc+=q[1]-q[0]; }); return t=>{ for(let i=0;i<P.length;i++){ if(t<P[i][0]) return offs[i]; if(t<=P[i][1]) return offs[i]+t-P[i][0]; } return acc; }; }
function anMontPDur(P){ return P.reduce((s,q)=>s+q[1]-q[0],0); }
/* concatenate the kept parts (short fades at every joint so a cut never clicks) */
function anPiecesData(buf,P){
  const sr=buf.sampleRate, ch=Math.min(2,buf.numberOfChannels); const lens=P.map(q=>{ const a=Math.max(0,Math.floor(q[0]*sr)), b=Math.min(buf.length,Math.ceil(q[1]*sr)); return [a,Math.max(1,b-a)]; });
  const N=lens.reduce((s,l)=>s+l[1],0); const out=[]; for(let c=0;c<ch;c++) out.push(new Float32Array(N));
  let o=0; lens.forEach(([a,n])=>{ const f=Math.min(Math.floor(n/4),Math.round(sr*0.01)); for(let c=0;c<ch;c++){ const src=buf.getChannelData(c), dst=out[c]; for(let i=0;i<n;i++){ const g=i<f?i/f:(i>n-f?(n-i)/f:1); dst[o+i]=(src[a+i]||0)*g; } } o+=n; });
  return {sr,ch,N,data:out};
}
function anWavFromData(d){
  const {sr,ch,N,data}=d; const out=new ArrayBuffer(44+N*ch*2); const v=new DataView(out); const W=(o,str)=>{ for(let i=0;i<str.length;i++) v.setUint8(o+i,str.charCodeAt(i)); };
  W(0,'RIFF'); v.setUint32(4,36+N*ch*2,true); W(8,'WAVE'); W(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,ch,true); v.setUint32(24,sr,true); v.setUint32(28,sr*ch*2,true); v.setUint16(32,ch*2,true); v.setUint16(34,16,true); W(36,'data'); v.setUint32(40,N*ch*2,true);
  let o=44; for(let i=0;i<N;i++) for(let c=0;c<ch;c++){ const x=Math.max(-1,Math.min(1,data[c][i])); v.setInt16(o,x<0?x*0x8000:x*0x7FFF,true); o+=2; }
  return new Blob([out],{type:'audio/wav'});
}
function anWavBlobPieces(buf,P){ return P.length===1?anWavBlob(buf,P[0][0],P[0][1]):anWavFromData(anPiecesData(buf,P)); }
/* video layers: one copy of SRC per kept part, each visible only in its own window (the preview and the export both honour enter/exit times) */
function anMontPieceLayers(raw,P){
  const L=raw.layers||[]; const idx=L.findIndex(l=>l&&l.id==='SRC'); if(idx<0) return;
  const base=L[idx]; const clean=JSON.parse(JSON.stringify(base)); delete clean.enter; delete clean.exit;
  raw.layers=L.filter(l=>!(l&&/^SRC\d*$/.test(String(l.id))));
  const copies=[]; let off=0; P.forEach((q,i)=>{ const len=q[1]-q[0]; const c=Object.assign(JSON.parse(JSON.stringify(clean)),{id:i?'SRC'+(i+1):'SRC',trimIn:+q[0].toFixed(3)});
    if(P.length>1){ if(i>0) c.enter={type:'fade',at:+off.toFixed(3),dur:0.02}; if(i<P.length-1) c.exit={type:'fade',at:+(off+len-0.04).toFixed(3),dur:0.03}; }
    copies.push(c); off+=len; });
  raw.layers.splice(Math.min(idx,raw.layers.length),0,...copies);
}
/* re-apply the current silence settings to scenes that already exist (also undoes the cut when it is switched off) */
async function anMontRecut(onProg){
  const p=ANIM.cur, M=anMontState(p); if(!M.src||!M.words) return {n:0};
  const sc=p.scenes.filter(s=>s.raw&&s.raw._mont&&s.raw._mont.src===M.src.id); if(!sc.length) return {n:0};
  const buf=await anMontBuf(); animPushUndo(); let n=0, saved=0;
  for(const it of sc){ const {from,to}=it.raw._mont; const P=anMontPieces(M,from,to); const map=anMontMap(P); const dur=anMontPDur(P); saved+=(to-from)-dur;
    const ws=M.words.filter(w=>w.s>=from-0.02&&w.s<to-0.02).map(w=>{ const s=map(Math.max(from,w.s)), e=map(Math.min(to,w.e)); return {w:w.w,s:Math.max(0,s),e:Math.max(s+0.05,e)}; });
    it.raw.duration=+dur.toFixed(3); it.raw.voiceover=ws.map(w=>w.w).join(' '); anMontPieceLayers(it.raw,P);
    if(P.length>1||P[0][0]!==from||P[0][1]!==to) it.raw._mont.pieces=P; else delete it.raw._mont.pieces;
    const f=new File([anWavBlobPieces(buf,P)],(it.audioName||'m.wav').replace(/\.[^.]+$/,'')+'.wav',{type:'audio/wav'});
    if(await animSetAudio(it,f)){ it.audioSrc={name:M.src.name,from,to}; it.asr=ws.length?{src:'whisper',key:it.audioKey,words:ws}:null; }
    animNorm(it,n); n++; if(onProg) onProg(n,sc.length); }
  animSaveSoon(); await animLoadAssets(); await animRebuild(); animRefreshAll();
  return {n,saved};
}
/* waveform with the silences shaded; click a shaded block to keep/cut it */
function anSilDraw(cv,en,S,words){
  const dpr=Math.min(2,window.devicePixelRatio||1); const W=cv.clientWidth||320, H=cv.clientHeight||64; cv.width=W*dpr; cv.height=H*dpr; const x=cv.getContext('2d'); x.scale(dpr,dpr); x.clearRect(0,0,W,H);
  const css=getComputedStyle(cv); const ink=css.getPropertyValue('--mut').trim()||'#8a92a6'; const acc=css.getPropertyValue('--bad').trim()||'#c23526';
  const cols=Math.floor(W/2); const per=en.db.length/cols; const lo=S.thr!=null?S.thr-26:-70, hi=-8;
  x.fillStyle=ink; for(let c=0;c<cols;c++){ let m=-120; for(let k=Math.floor(c*per);k<Math.floor((c+1)*per)&&k<en.db.length;k++) if(en.db[k]>m) m=en.db[k]; const h=Math.max(1,Math.min(1,(m-lo)/(hi-lo))*(H-6)); x.globalAlpha=.75; x.fillRect(c*2,(H-h)/2,1.4,h); }
  x.globalAlpha=1; (S.ranges||[]).forEach(r=>{ const a=r.a/en.dur*W, b=r.b/en.dur*W; x.fillStyle=r.on===false?'rgba(120,130,150,.18)':acc; x.globalAlpha=r.on===false?1:.22; x.fillRect(a,0,Math.max(1.5,b-a),H); x.globalAlpha=1; if(r.on!==false){ x.strokeStyle=acc; x.lineWidth=1; x.strokeRect(a+.5,.5,Math.max(1,b-a-1),H-1); } });
}
