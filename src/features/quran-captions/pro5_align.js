/* ===== word timing for recitation: align Whisper words to the known ayah text =====
   The reciter may repeat part of an ayah (khushu') and an ayah may contain similar / identical words,
   so a plain "find the word" does not work. We run a monotone DP alignment where the path normally
   advances one canonical word per ASR word, but may also skip words (ASR missed them), skip ASR words
   (noise / hallucination) or jump BACK (a repetition) — each with a cost. First pass of each word wins. */
function qrKey(s){ return String(s||'').replace(/[ً-ٰٟۖ-ۭـ‌‍]/g,'').replace(/[ٱآأإ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ء/g,'').replace(/[^ء-ي]/g,'').replace(/ا/g,''); }
function qrLev(a,b){ const m=a.length,n=b.length; if(!m) return n; if(!n) return m; let p=new Array(n+1),c=new Array(n+1); for(let j=0;j<=n;j++) p[j]=j; for(let i=1;i<=m;i++){ c[0]=i; for(let j=1;j<=n;j++){ c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a.charCodeAt(i-1)===b.charCodeAt(j-1)?0:1)); } const t=p; p=c; c=t; } return p[n]; }
function qrSim(a,b){ if(a===b) return a?1:0.5; if(!a||!b) return 0; const L=Math.max(a.length,b.length); let s=1-qrLev(a,b)/L; if(Math.min(a.length,b.length)<=2) s=Math.min(s,0.35); return s; }
/* canon: array of words (any script form); asr: [{w,s,e}] ; returns {times:[start per canon word], end:[end per canon word], matched, rewinds:[{from,to,at}], used} */
function qrAlign0(canon,asr){
  const C=canon.map(qrKey), A=asr.map(a=>({k:qrKey(a.w),s:a.s,e:a.e})); const n=C.length, m=A.length; if(!n||!m) return null;
  const NEG=-1e9, TH=0.45; const sim=A.map(a=>C.map(c=>qrSim(a.k,c))); const best=[],bp=[];
  for(let j=0;j<m;j++){ best.push(new Float64Array(n).fill(NEG)); bp.push(new Int32Array(n*2).fill(-1)); }
  for(let j=0;j<m;j++){ for(let i=0;i<n;i++){ const base=(sim[j][i]-TH)*2;
    if(j<=2){ const v=base-0.15*i-0.35*j; if(v>best[j][i]){ best[j][i]=v; bp[j][i*2]=-2; bp[j][i*2+1]=-2; } }
    for(let sk=0;sk<=2;sk++){ const pj=j-1-sk; if(pj<0) break; const pen=0.35*sk; const bj=best[pj];
      for(let k=0;k<n;k++){ const pv=bj[k]; if(pv<=NEG/2) continue; const d=i-k; const cost=d===1?0:(d>1?0.45*(d-1):(d===0?0.6:1.2)); const v=pv+base-pen-cost; if(v>best[j][i]){ best[j][i]=v; bp[j][i*2]=pj; bp[j][i*2+1]=k; } } } } }
  let bv=NEG, bj=-1, bi=-1; for(let j=Math.max(0,m-3);j<m;j++) for(let i=0;i<n;i++){ const v=best[j][i]-0.35*(m-1-j)-0.15*(n-1-i); if(v>bv){ bv=v; bj=j; bi=i; } }
  if(bj<0) return null; const asg=new Array(m).fill(-1); let j=bj,i=bi; while(j>=0&&i>=0){ asg[j]=i; const pj=bp[j][i*2], pi=bp[j][i*2+1]; if(pj<0) break; j=pj; i=pi; }
  const first=new Array(n).fill(-1), last=new Array(n).fill(-1), rew=[]; let prev=-1, used=0;
  for(let q=0;q<m;q++){ const ci=asg[q]; if(ci<0) continue; used++; if(sim[q][ci]>=0.55){ if(first[ci]<0) first[ci]=q; last[ci]=q; } if(prev>=0&&ci<=prev&&ci!==prev) rew.push({from:ci,to:prev,at:A[q].s}); prev=ci; }
  const T=new Array(n).fill(null), En=new Array(n).fill(null); let matched=0; for(let c=0;c<n;c++) if(first[c]>=0){ T[c]=A[first[c]].s; En[c]=A[first[c]].e; matched++; }
  const w=C.map(c=>c.length+1); const anchors=[]; for(let c=0;c<n;c++) if(T[c]!=null) anchors.push(c);
  if(!anchors.length) return {times:null,matched:0,rewinds:rew,used,n,m};
  const rate=(()=>{ let tw=0,tt=0; for(let a=1;a<anchors.length;a++){ const p=anchors[a-1],q=anchors[a]; let ws=0; for(let c=p;c<q;c++) ws+=w[c]; tw+=ws; tt+=Math.max(0,T[q]-T[p]); } return tw>0&&tt>0?tt/tw:0.12; })();
  for(let a=0;a<anchors.length-1;a++){ const p=anchors[a], q=anchors[a+1]; if(q-p<=1) continue; let tot=0; for(let c=p;c<q;c++) tot+=w[c]; let cum=0; for(let c=p;c<q-1;c++){ cum+=w[c]; T[c+1]=T[p]+(Math.max(T[q],T[p])-T[p])*cum/tot; } }
  { const f=anchors[0]; let acc=0; for(let c=f-1;c>=0;c--){ acc+=w[c]*rate; T[c]=Math.max(0,T[f]-acc); } }
  { const l=anchors[anchors.length-1]; let acc=En[l]!=null?Math.max(En[l],T[l]):T[l]+w[l]*rate; for(let c=l+1;c<n;c++){ T[c]=acc; acc+=w[c]*rate; } }
  for(let c=1;c<n;c++) if(T[c]<T[c-1]) T[c]=T[c-1];
  return {times:T,matched:matched/n,rewinds:rew,used,n,m,rate};
}

/* waqf / pause signs (ۖ ۗ ۚ …) are separate tokens in the text but are never pronounced: align only the spoken words */
function qrAlign(canon,asr){
  const idx=[]; canon.forEach((w,i)=>{ if(qrKey(w)) idx.push(i); }); if(!idx.length||!asr.length) return null;
  const r=qrAlign0(idx.map(i=>canon[i]),asr); if(!r||!r.times) return r; const T=new Array(canon.length).fill(0);
  idx.forEach((ci,k)=>{ T[ci]=r.times[k]; }); for(let i=0;i<canon.length;i++){ if(!qrKey(canon[i])){ let b=i-1; while(b>=0&&!qrKey(canon[b])) b--; let f=i+1; while(f<canon.length&&!qrKey(canon[f])) f++; T[i]=b>=0?T[b]:(f<canon.length?T[f]:0); } }
  r.times=T; r.rewinds=r.rewinds.map(x=>({from:idx[x.from],to:idx[x.to],at:x.at})); return r;
}
