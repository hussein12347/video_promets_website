/* ===== Quran reels from YOUR OWN recitation file: Whisper → align to the known text → handle repeats (ayah or phrase rewinds) ===== */
function qrDPAlign(C,A){ const n=C.length,m=A.length; if(!n||!m) return null; const NEG=-1e9,TH=0.45,BACK=Math.min(n,150),FWD=12; const sim=new Array(m); for(let j=0;j<m;j++){ const a=A[j].k, r=new Float32Array(n); for(let i=0;i<n;i++) r[i]=qrSim(a,C[i]); sim[j]=r; }
  const best=new Array(m), bpj=new Array(m), bpk=new Array(m); for(let j=0;j<m;j++){ best[j]=new Float32Array(n).fill(NEG); bpj[j]=new Int32Array(n).fill(-1); bpk[j]=new Int32Array(n).fill(-1); }
  for(let j=0;j<m;j++){ const sj=sim[j]; for(let i=0;i<n;i++){ const base=(sj[i]-TH)*2; if(j<=2){ const v=base-0.15*Math.min(i,20)-0.35*j; if(v>best[j][i]){ best[j][i]=v; bpj[j][i]=-2; bpk[j][i]=-2; } }
      for(let sk=0;sk<=2;sk++){ const pj=j-1-sk; if(pj<0) break; const pen=0.35*sk, bj=best[pj]; const k0=Math.max(0,i-FWD), k1=Math.min(n-1,i+BACK); for(let k=k0;k<=k1;k++){ const pv=bj[k]; if(pv<=NEG/2) continue; const d=i-k; const cost=d===1?0:(d>1?0.45*(d-1):(d===0?0.6:1.2)); const v=pv+base-pen-cost; if(v>best[j][i]){ best[j][i]=v; bpj[j][i]=pj; bpk[j][i]=k; } } } } }
  let bv=NEG,bj=-1,bi=-1; for(let j=Math.max(0,m-3);j<m;j++) for(let i=0;i<n;i++){ const v=best[j][i]-0.35*(m-1-j)-0.15*Math.min(n-1-i,20); if(v>bv){ bv=v; bj=j; bi=i; } } if(bj<0) return null;
  const asg=new Int32Array(m).fill(-1); let j=bj,i=bi; while(j>=0&&i>=0){ asg[j]=i; const pj=bpj[j][i], pk=bpk[j][i]; if(pj<0) break; j=pj; i=pk; } return {asg,sim}; }
/* decide which ASR words are kept and which time ranges are repeats to cut.  mode 'last' = the last pass wins (cleanest), 'first' = first pass wins */
function qrOwnPlan(asg,sim,A,mode,tokJob){ const m=A.length; const valid=[]; for(let q=0;q<m;q++){ const ci=asg[q]; if(ci>=0&&sim[q][ci]>=0.55) valid.push({q,ci}); }
  const kept=[], disc=[], rew=[]; let maxCi=-1, inRep=false;
  for(let t=0;t<valid.length;t++){ const v=valid[t]; const top=kept.length?kept[kept.length-1]:null;
    if(top&&v.ci<=top.ci){ const nx=valid[t+1], nx2=valid[t+2]; const ok=(!nx)||(nx.ci>v.ci&&nx.ci<=v.ci+4)||(nx2&&nx2.ci>v.ci&&nx2.ci<=v.ci+8); if(!ok) continue; /* lone noisy word — ignore */
      if(mode==='keep'){ rew.push({from:top.ci,to:v.ci,at:A[v.q].s,fj:tokJob[top.ci],tj:tokJob[v.ci]}); kept.push(v); continue; }
      if(mode==='first'){ if(!inRep){ inRep=true; rew.push({from:top.ci,to:v.ci,at:A[v.q].s,fj:tokJob[top.ci],tj:tokJob[v.ci]}); } disc.push(v); continue; }
      const popped=[]; while(kept.length&&kept[kept.length-1].ci>=v.ci) popped.push(kept.pop()); inRep=false; popped.forEach(x=>disc.push(x)); rew.push({from:top.ci,to:v.ci,at:A[v.q].s,fj:tokJob[top.ci],tj:tokJob[v.ci]}); kept.push(v); maxCi=Math.max(maxCi,v.ci); continue; }
    if(mode==='first'&&v.ci<=maxCi){ disc.push(v); continue; } inRep=false; kept.push(v); maxCi=Math.max(maxCi,v.ci); }
  /* cut ranges = runs of discarded words, bounded by the neighbouring kept words so no kept audio is touched */
  const keptQ=new Set(kept.map(x=>x.q)); disc.sort((a,b)=>a.q-b.q); const cuts=[]; let run=null; const flush=()=>{ if(!run) return; let prevK=null,nextK=null; for(let q=run.q0-1;q>=0;q--) if(keptQ.has(q)){ prevK=A[q]; break; } for(let q=run.q1+1;q<m;q++) if(keptQ.has(q)){ nextK=A[q]; break; }
      const a=Math.max(A[run.q0].s-0.03,prevK?prevK.e+0.02:0); let b=nextK?Math.min(nextK.s-0.05,Math.max(A[run.q1].e+0.4,A[run.q1].e)):A[run.q1].e+0.3; if(nextK&&b>nextK.s-0.05) b=nextK.s-0.05; if(b>a+0.15) cuts.push([a,b]); run=null; };
  disc.forEach(d=>{ if(run&&d.q<=run.q1+3){ run.q1=Math.max(run.q1,d.q); } else { flush(); run={q0:d.q,q1:d.q}; } }); flush();
  cuts.sort((a,b)=>a[0]-b[0]); const merged=[]; cuts.forEach(c=>{ const l=merged[merged.length-1]; if(l&&c[0]<=l[1]+0.05) l[1]=Math.max(l[1],c[1]); else merged.push(c.slice()); });
  return {kept,cuts:merged,rew}; }
function qrCutBuf(buf,a,b,cuts){ const sr=buf.sampleRate; const pieces=[]; let s=a; for(const c of cuts){ if(c[1]<=s||c[0]>=b) continue; if(c[0]>s) pieces.push([s,Math.min(c[0],b)]); s=Math.max(s,c[1]); if(s>=b) break; } if(s<b) pieces.push([s,b]);
  const len=pieces.reduce((t,p)=>t+Math.max(0,Math.round((p[1]-p[0])*sr)),0)||1; const FD=Math.round(sr*0.02); const out=new AudioBuffer({length:len,sampleRate:sr,numberOfChannels:Math.min(2,buf.numberOfChannels)}); for(let c=0;c<out.numberOfChannels;c++){ const d=out.getChannelData(c), sd=buf.getChannelData(c); let o=0; pieces.forEach((p,pi)=>{ const i0=Math.max(0,Math.round(p[0]*sr)), n=Math.max(0,Math.round((p[1]-p[0])*sr)); const o0=o; for(let i=0;i<n&&i0+i<sd.length&&o<len;i++){ let v=sd[i0+i]; if(pi>0&&i<FD) v*=i/FD; if(pi<pieces.length-1&&n-i<=FD) v*=(n-i)/FD; d[o++]=v; } }); } return out; }
const qrCutBefore=(t,cuts)=>{ let s=0; for(const c of cuts){ if(c[0]>=t) break; s+=Math.min(c[1],t)-c[0]; } return s; };
async function qrOwnPrep(q,jobs,prog,warns){
  const file=ANIM._qrOwnFile; if(!file) throw new Error('ارفع ملف التلاوة الأول'); prog('جارِ قراءة ملف التلاوة…'); const buf=await animDecode(await file.arrayBuffer()); const dur=buf.duration;
  const ui={stage:s=>prog(s==='load'?'تحميل Whisper…':(s==='prep'?'تجهيز الصوت…':'Whisper بيحلّل التلاوة…')),dl:(l,t)=>prog('تحميل نموذج Whisper '+(t?Math.round(100*l/t):0)+'% (مرة واحدة بس)'),run:r=>prog('Whisper بيحلّل التلاوة… '+Math.round(100*r.done/Math.max(0.01,r.total))+'% — فاضل تقريبًا '+Math.round(r.eta)+' ث'),words:()=>{},device:()=>{},note:()=>{},cancelled:()=>false};
  const heard=await anRunAsr(buf,{lang:'arabic',ui,model:q.asrModel||undefined}); if(!heard||heard.length<3) throw new Error('Whisper ما سمعش كلام كفاية في الملف');
  const canon=[], tokJob=[], tokLoc=[], jobToks=[]; jobs.forEach((j,ji)=>{ const toks=String(j.em||'').split(/\s+/).filter(Boolean); jobToks.push(toks); toks.forEach((w,li)=>{ if(qrKey(w)){ canon.push(w); tokJob.push(ji); tokLoc.push(li); } }); });
  const C=canon.map(qrKey), A=heard.map(h=>({k:qrKey(h.w),s:h.s,e:h.e})).filter(a=>a.k); if(C.length*A.length>7e6) throw new Error('المدى كبير على المطابقة ('+jobs.length+' آية) — قسّمه لأجزاء أقل من ~40 آية');
  prog('جارِ مطابقة الكلام بالنص وكشف التكرار…'); await new Promise(r=>setTimeout(r,30)); const R=qrDPAlign(C,A); if(!R) throw new Error('المطابقة فشلت — تأكد إن السورة والآيات المختارة هي اللي في الملف');
  const mode=q.rep==='first'?'first':(q.rep==='keep'?'keep':'last'); const P=qrOwnPlan(R.asg,R.sim,A,mode,tokJob); if(!P.kept.length) throw new Error('ما اتعرّفش على أي آية من الملف');
  const seen=new Set(P.kept.map(x=>tokJob[x.ci])); if(seen.size<jobs.length*0.5) throw new Error('الملف مش مطابق للآيات المختارة (اتعرّف على '+seen.size+' من '+jobs.length+' آية بس)');
  const nm=x=>x?(x.num?('آية '+x.a):'البسملة'):'?'; const tm=sec=>Math.floor(sec/60)+':'+String(Math.round(sec%60)).padStart(2,'0');
  P.rew.forEach(r=>{ warns.push((r.fj===r.tj?'تكرار داخل '+nm(jobs[r.fj]):'القارئ رجع من '+nm(jobs[r.fj])+' لـ '+nm(jobs[r.tj]))+' عند '+tm(r.at)+' — '+(mode==='keep'?'اتسابت زي ما هي والشاشة رجعت معاه':(mode==='first'?'اتخطّى التكرار وبقيت أول مرة':'اتحذف التكرار وبقيت آخر مرة'))); });
  /* 1) chronological segments: a new one at every ayah change or rewind */
  const segs=[]; let cur=null, prev=null; P.kept.forEach(v=>{ const ji=tokJob[v.ci]; const rewind=prev&&v.ci<=prev.ci; if(!cur||cur.ji!==ji||rewind){ cur={ji,rew:!!rewind,words:[v]}; segs.push(cur); } else cur.words.push(v); prev=v; });
  /* 2) contiguous time ranges (original time) */
  segs.forEach((g,k)=>{ g.s0=A[g.words[0].q].s; g.e1=A[g.words[g.words.length-1].q].e; });
  segs.forEach((g,k)=>{ if(k===0){ g.t0=Math.max(0,g.s0-0.25); } else { const pe=segs[k-1].e1, gap=g.s0-pe; g.t0=gap>0.7?g.s0-0.3:pe+Math.max(0,gap)/2; if(g.t0<segs[k-1].t0+0.05) g.t0=segs[k-1].t0+0.05; } });
  segs.forEach((g,k)=>{ g.t1=k<segs.length-1?segs[k+1].t0:Math.min(dur,g.e1+0.4); });
  /* 3) ayahs that were not recognised at all: carve their share out of the gap between neighbours (by word count) */
  const out=[]; for(let k=0;k<segs.length;k++){ const g=segs[k]; const pj=k?segs[k-1].ji:-1; if(k&&g.ji>pj+1&&!g.rew){ const miss=[]; for(let x=pj+1;x<g.ji;x++) if(!seen.has(x)) miss.push(x); if(miss.length){ const a=segs[k-1].e1+0.05, b=g.s0-0.05; const span=b-a; if(span>0.3*miss.length){ const wts=miss.map(x=>Math.max(1,jobToks[x].length)); const tot=wts.reduce((p,c)=>p+c,0); let t=a; miss.forEach((x,mi)=>{ const dd=span*wts[mi]/tot; out.push({ji:x,rew:false,words:[],t0:t,t1:t+dd,miss:true}); t+=dd; }); segs[k-1].t1=a; g.t0=b; warns.push('آية/آيات '+miss.map(x=>nm(jobs[x])).join('، ')+' ما اتعرّفش عليها في التسجيل — اتوزّع وقتها على قد طول الكلام في الفجوة'); } else warns.push(nm(jobs[miss[0]])+' ما اتعرّفش عليها وفجوتها صغيرة — اتخطّت'); } } out.push(g); }
  /* put the carved ayahs in time order */ out.sort((x,y)=>x.t0-y.t0);
  const T0=out[0].t0, T1=out[out.length-1].t1; const cuts=P.cuts; const cl=t=>t-qrCutBefore(t,cuts); const base=cl(T0);
  /* 4) the ONE continuous audio (original file untouched unless repeats are cut — then stitched with 20 ms cross-fades) */
  let audio; if(!cuts.length){ audio={buf,key:null,trimIn:T0,len:T1-T0,reuse:true}; } else { const cb=qrCutBuf(buf,T0,T1,cuts); audio={buf:cb,trimIn:0,len:cb.duration,reuse:false,file:new File([qrWav(cb,0,cb.duration)],'quran_recitation.wav',{type:'audio/wav'})}; }
  /* 5) per-segment duration + word times */
  const res=[]; out.forEach(g=>{ const a0=cl(g.t0)-base, a1=cl(g.t1)-base; let dd=a1-a0; if(dd<0.25){ if(res.length) res[res.length-1].dur+=Math.max(0,dd); return; } const toks=jobToks[g.ji], job=jobs[g.ji]; let times=null;
    if(g.words.length){ const hw=g.words.map(x=>({w:canon[x.ci],s:Math.max(0,cl(A[x.q].s)-base-a0),e:Math.max(0,cl(A[x.q].e)-base-a0)})); const r=qrAlign(toks,hw); const pw=job.text.split(' ').filter(Boolean).slice(0,-1); if(r&&r.times&&r.matched>=0.3){ let te=r.times.slice(); if(g.rew){ const first=Math.min(...g.words.map(x=>tokLoc[x.ci])); for(let i=0;i<first;i++) te[i]=0; } const T=qrHafsMap(pw,toks).map(i=>te[i]); times=T.map(t=>Math.max(0,+(t-0.04).toFixed(3))); } }
    if(!times){ const pw=job.text.split(' ').filter(Boolean).slice(0,-1); const wt=toks.map(w=>Math.max(1,qrKey(w).length)+0.4), tot=wt.reduce((p,c)=>p+c,0); let acc=0; const te=wt.map(w=>{ const t=dd*0.05+dd*0.8*acc/tot; acc+=w; return t; }); times=qrHafsMap(pw,toks).map(i=>+te[i].toFixed(3)); }
    if(job.num) times.push(+Math.min(dd-0.05,(times[times.length-1]||0)+0.45).toFixed(3)); res.push({ji:g.ji,dur:dd,times,rew:g.rew,miss:!!g.miss}); });
  return { rewinds:P.rew.length, cutSec:cuts.reduce((t,c)=>t+c[1]-c[0],0), segs:res, audio, name:file.name }; }
