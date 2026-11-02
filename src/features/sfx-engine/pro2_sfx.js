/* ===== NEW SOUND LIBRARY (procedural, offline) ===== */
const SFX2={
 'swish':{l:0.28,f:(t,ts,r)=>r()*Math.sin(PI*Math.pow(t,0.6)),flt:['bandpass',1500,4500,0.5,1.1]},
 'whoosh-long':{l:1.1,f:(t,ts,r)=>r()*Math.sin(PI*Math.pow(t,0.8)),flt:['bandpass',300,3200,0.55,0.9]},
 'boom':{l:1.8,f:(t,ts,r,s,sr)=>{ s.ph+=2*PI*(28+70*Math.exp(-t*5))/sr; return Math.sin(s.ph)*Math.exp(-t*2.4)+r()*0.3*Math.exp(-t*16); },flt:['lowpass',1400]},
 'hit':{l:0.9,f:(t,ts,r,s,sr)=>{ s.ph+=2*PI*(48+90*Math.exp(-t*18))/sr; return r()*0.9*Math.exp(-t*14)+Math.sin(s.ph)*Math.exp(-t*4.5); },flt:['lowpass',5000]},
 'bass-drop':{l:1.6,f:(t,ts,r,s,sr)=>{ s.ph+=2*PI*(26+150*Math.pow(1-t,4))/sr; return Math.sin(s.ph)*Math.exp(-t*1.6); },flt:['lowpass',500]},
 'riser-long':{l:2.6,f:(t,ts,r,s,sr)=>{ s.ph+=2*PI*(200+1800*t*t)/sr; return (r()*0.8+Math.sin(s.ph)*0.4)*Math.pow(t,1.8); },flt:['bandpass',300,7000,1,1.2]},
 'downer':{l:1.4,f:(t,ts,r)=>r()*Math.pow(1-t,1.3),flt:['bandpass',6000,200,1,1.1]},
 'glitch':{l:0.4,f:(t,ts,r)=>{ const g=(Math.floor(ts*45)%3===0)?1:0; return (Math.sign(Math.sin(ts*2*PI*(180+hash(Math.floor(ts*45))*1800)))*0.5+r()*0.6)*g*(1-t); },flt:['highpass',500]},
 'digital':{l:0.35,f:(t,ts)=>{ const k=Math.floor(ts*32); return Math.sin(2*PI*(700+(k%5)*420)*ts)*((k%2)?0.3:1)*(1-t)*0.9; },flt:['lowpass',6000]},
 'tick':{l:0.08,f:(t,ts,r)=>(r()*0.6+Math.sin(2*PI*2100*ts)*0.6)*Math.exp(-t*30),flt:['highpass',900]},
 'clock':{l:0.55,f:(t,ts,r)=>{ const a=ts%0.25; return (r()*0.6+Math.sin(2*PI*(ts<0.25?2200:1700)*a)*0.7)*Math.exp(-a*140)*(ts<0.5?1:0); },flt:['highpass',700]},
 'camera':{l:0.26,f:(t,ts,r)=>r()*(Math.exp(-ts*160)+(ts>0.1?Math.exp(-(ts-0.1)*120)*0.8:0)),flt:['bandpass',2800,null,1,0.9]},
 'typing':{l:0.85,f:(t,ts,r)=>{ let v=0; for(let k=0;k<8;k++){ const dt=ts-(k*0.105+hash(k+4)*0.04); if(dt>=0) v+=r()*Math.exp(-dt*180)*(0.6+hash(k)*0.4); } return v; },flt:['bandpass',2300,null,1,0.8]},
 'sparkle':{l:1.0,f:(t,ts)=>{ let v=0; const fr=[2637,3136,3951,4699,5588,6272]; for(let k=0;k<6;k++){ const dt=ts-k*0.11; if(dt>=0) v+=Math.sin(2*PI*fr[k]*dt)*Math.exp(-dt*9)*0.5; } return v; }},
 'success':{l:0.9,f:(t,ts)=>{ let v=0; const n=[523.25,659.25,783.99,1046.5]; for(let k=0;k<4;k++){ const dt=ts-k*0.1; if(dt>=0) v+=(Math.sin(2*PI*n[k]*dt)+0.3*Math.sin(2*PI*n[k]*2*dt))*Math.exp(-dt*(k===3?4:9))*0.5; } return v; }},
 'error':{l:0.5,f:(t,ts)=>{ const a=ts%0.25, fq=ts<0.25?190:150, w=Math.sin(2*PI*fq*ts); return (Math.sign(w)*0.5+w*0.5)*Math.exp(-a*5)*(ts<0.5?1:0); },flt:['lowpass',1200]},
 'notify':{l:0.7,f:(t,ts)=>{ let v=0; [[880,0],[1318.5,0.13]].forEach(([fq,t0])=>{ const dt=ts-t0; if(dt>=0) v+=Math.sin(2*PI*fq*dt)*Math.exp(-dt*7)*0.6; }); return v; }},
 'coin':{l:0.6,f:(t,ts)=>{ let v=0; [[987.8,0],[1318.5,0.075]].forEach(([fq,t0])=>{ const dt=ts-t0; if(dt>=0){ const w=Math.sin(2*PI*fq*dt); v+=(w+0.4*Math.sign(w))*Math.exp(-dt*(t0?6:30))*0.4; } }); return v; }},
 'bubble':{l:0.22,f:(t,ts,r,s,sr)=>{ s.ph+=2*PI*(350+1100*t)/sr; return Math.sin(s.ph)*Math.sin(PI*Math.pow(t,0.5))*(1-t); }},
 'water-drop':{l:0.4,f:(t,ts,r,s,sr)=>{ s.ph+=2*PI*(1500*Math.exp(-t*7)+250)/sr; return Math.sin(s.ph)*Math.exp(-t*7); }},
 'stamp':{l:0.4,f:(t,ts,r,s,sr)=>{ s.ph+=2*PI*(60+60*Math.exp(-t*30))/sr; return Math.sin(s.ph)*Math.exp(-t*11)+r()*0.5*Math.exp(-t*70); },flt:['lowpass',2500]},
 'paper':{l:0.6,f:(t,ts,r)=>r()*Math.sin(PI*t)*(0.4+0.6*Math.abs(Math.sin(ts*47+Math.sin(ts*13)*3))),flt:['bandpass',4200,null,1,0.5]},
 'heartbeat':{l:1.0,f:(t,ts)=>{ let v=0; [[0,1],[0.3,0.7]].forEach(([t0,a])=>{ const dt=ts-t0; if(dt>=0) v+=Math.sin(2*PI*(55+25*Math.exp(-dt*20))*dt)*Math.exp(-dt*14)*a; }); return v; },flt:['lowpass',400]},
 'laser':{l:0.5,f:(t,ts,r,s,sr)=>{ s.ph+=2*PI*(180+2400*Math.exp(-t*7))/sr; return Math.sin(s.ph)*Math.exp(-t*3.5); }},
 'zap':{l:0.3,f:(t,ts,r)=>(r()*0.7+Math.sign(Math.sin(2*PI*(90+800*t)*ts))*0.5)*Math.pow(1-t,1.5),flt:['bandpass',2000,600,1,1.4]},
 'tape-stop':{l:1.0,f:(t,ts,r,s,sr)=>{ s.ph+=2*PI*(420*Math.pow(1-t,2)+20)/sr; const w=Math.sin(s.ph); return (w+0.4*Math.sign(w))*(1-Math.pow(t,3))*0.6; },flt:['lowpass',2500]},
 'cash':{l:0.9,f:(t,ts,r)=>{ let v=r()*Math.exp(-ts*90)*0.7+r()*Math.exp(-Math.abs(ts-0.06)*140)*0.4; [[1568,0.12],[2093,0.2]].forEach(([fq,t0])=>{ const dt=ts-t0; if(dt>=0) v+=Math.sin(2*PI*fq*dt)*Math.exp(-dt*5)*0.6; }); return v; }},
 'applause':{l:2.4,f:(t,ts,r)=>r()*(0.35+0.65*hash(Math.floor(ts*55)))*Math.min(1,t*8,(1-t)*6)*0.9,flt:['bandpass',2600,null,1,0.6]},
 'reverse':{l:1.5,f:(t,ts,r)=>r()*Math.pow(t,3),flt:['highpass',2500]},
 'shimmer':{l:1.4,f:(t,ts)=>{ let v=0; [1760,2349,3136,4186].forEach((fq,k)=>{ v+=Math.sin(2*PI*fq*ts)*(0.5+0.5*Math.sin(2*PI*(3+k)*ts)); }); return v*Math.sin(PI*Math.pow(t,0.7))*0.3; }},
 'snap':{l:0.14,f:(t,ts,r)=>r()*Math.exp(-t*28)*0.9+Math.sin(2*PI*420*ts)*Math.exp(-t*45)*0.6,flt:['bandpass',2600,null,1,0.8]},
 'pluck':{l:0.6,f:(t,ts)=>(Math.sin(2*PI*329.6*ts)+0.5*Math.sin(2*PI*659.2*ts)+0.25*Math.sin(2*PI*989*ts))*Math.exp(-t*7)},
 'swell':{l:1.6,f:(t,ts)=>(Math.sin(2*PI*220*ts)+Math.sin(2*PI*277.2*ts)+Math.sin(2*PI*329.6*ts))*Math.pow(Math.sin(PI*t),2)*0.4,flt:['lowpass',1500]},
 'swoosh-up':{l:0.5,f:(t,ts,r)=>r()*Math.pow(t,1.4)*(1-Math.pow(t,6)),flt:['bandpass',400,3500,1,1.0]},
 'slide':{l:0.45,f:(t,ts,r)=>r()*Math.sin(PI*Math.pow(t,0.6))*0.9,flt:['bandpass',3000,600,1,1.0]},
 'knock':{l:0.45,f:(t,ts,r)=>{ let v=0; [0,0.18].forEach(t0=>{ const dt=ts-t0; if(dt>=0) v+=(Math.sin(2*PI*(160-40*Math.min(1,dt*10))*dt)+r()*0.2)*Math.exp(-dt*32); }); return v; },flt:['lowpass',1800]},
 'ding-dong':{l:1.5,f:(t,ts)=>{ let v=0; [[784,0],[622.3,0.38]].forEach(([fq,t0])=>{ const dt=ts-t0; if(dt>=0) v+=(Math.sin(2*PI*fq*dt)+0.35*Math.sin(2*PI*fq*2.01*dt))*Math.exp(-dt*3.2)*0.55; }); return v; }}
};
const SFX_CAT=[
 ['whoosh','ووش','move'],['swish','سويش سريع','move'],['whoosh-long','ووش طويل','move'],['swoosh-up','صعود','move'],['slide','انزلاق','move'],['riser','تصاعد قصير','move'],['riser-long','تصاعد طويل','move'],['downer','هبوط','move'],['reverse','ريفيرس','move'],
 ['boom','بووم','cine'],['hit','ضربة سينمائية','cine'],['bass-drop','دروب باس','cine'],['heartbeat','نبض قلب','cine'],['shimmer','لمعان سحري','cine'],['swell','موجة هادئة','cine'],['tape-stop','توقف شريط','cine'],['knock','طَرق','cine'],
 ['click','كليك','ui'],['tick','تيك','ui'],['clock','ساعة','ui'],['typing','كتابة','ui'],['digital','رقمي','ui'],['glitch','جليتش','ui'],['laser','ليزر','ui'],['zap','شرارة','ui'],['camera','كاميرا','ui'],['notify','إشعار','ui'],['error','خطأ','ui'],
 ['pop','بوب','win'],['ding','دينج','win'],['success','نجاح','win'],['coin','عملة','win'],['cash','كاش','win'],['sparkle','تلألؤ','win'],['applause','تصفيق','win'],['ding-dong','جرس','win'],
 ['thud','دَبّة','obj'],['stamp','ختم','obj'],['paper','ورق','obj'],['snap','فرقعة أصابع','obj'],['pluck','وتر','obj'],['bubble','فقاعة','obj'],['water-drop','قطرة ماء','obj'],['scribble','خربشة قلم','obj']
];
const SFX_CATS={move:'حركة وانتقال',cine:'سينمائي',ui:'واجهة وتقنية',win:'نجاح ومكافأة',obj:'أشياء وأدوات'};
const TRSND={whip:'swish',glitch:'glitch','rgb-split':'glitch',flash:'boom','flash-zoom':'boom','film-burn':'whoosh-long','cross-zoom':'whoosh-long','zoom-through':'whoosh-long',clock:'tick',
 'flip-h':'swish','flip-v':'swish','cube-left':'swish','cube-right':'swish',mosaic:'digital','pop-in':'pop','drop-in':'thud','slice-h':'swish',stripes:'swish',curtain:'swish',wave:'shimmer',page:'paper',
 'open-h':'swish','open-v':'swish','split-h':'swish','split-v':'swish','iris-box':'swish','blur-dissolve':'swell',fade:'swell','fade-black':'swell','fade-white':'swell'};
function scheduleSfx2(actx,dest,when,type,vol,sdur){
  const S=SFX2[type], sr=actx.sampleRate, len=Math.max(16,Math.floor(sr*S.l)); const buf=actx.createBuffer(1,len,sr), d=buf.getChannelData(0);
  let seed=24681+type.length*131; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff*2-1; };
  const st={ph:0}; let mx=1e-6;
  for(let i=0;i<len;i++){ const v=S.f(i/len,i/sr,rnd,st,sr); d[i]=v; const a=Math.abs(v); if(a>mx) mx=a; }
  const nf=((S.flt&&S.flt[0]==='highpass')?0.68:0.9)/mx, e0=Math.floor(sr*0.003), e1=Math.floor(sr*0.012);
  for(let i=0;i<len;i++){ let g=nf; if(i<e0) g*=i/e0; const j=len-1-i; if(j<e1) g*=j/e1; d[i]*=g; }
  const w0=Math.max(0,when); const src=actx.createBufferSource(); src.buffer=buf; let node=src;
  if(S.flt){ const f=actx.createBiquadFilter(); f.type=S.flt[0]; f.frequency.setValueAtTime(S.flt[1],w0); if(S.flt[2]) f.frequency.exponentialRampToValueAtTime(S.flt[2],w0+S.l*(S.flt[3]||1)); f.Q.value=S.flt[4]||0.8; node.connect(f); node=f; }
  const g=actx.createGain(); g.gain.value=Math.max(0,vol)*0.8; node.connect(g); g.connect(dest); src.start(w0); return src;
}
