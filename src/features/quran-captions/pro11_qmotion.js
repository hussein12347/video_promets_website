/* ===== Quran reels: animated backgrounds (moving plates + engine particle effects) ===== */
const QR_MOS=[['auto','حسب النمط'],['none','بدون حركة'],['rays','أشعة دوّارة'],['medal','وردة دوّارة'],['stars','نجوم متلألئة'],['clouds','سحاب منجرف'],['dust','غبار ذهبي'],['fog','ضباب'],['waves','موج متحرّك'],['lanterns','فوانيس وجمر']];
function qrMoKinds(q){ const m=q.motion||'auto'; if(m==='none') return []; if(m==='auto'){ const S=qrStyOf(q); return S.mo||[]; } return [m]; }
function qrPlateDraw(kind,c,W,H,acc){
  c.clearRect(0,0,W,H);
  if(kind==='rays'){ const R=W/2; c.save(); c.translate(W/2,H/2); const n=30; for(let i=0;i<n;i++){ const a0=i*2*Math.PI/n, a1=a0+Math.PI/n*0.62; c.beginPath(); c.moveTo(0,0); c.arc(0,0,R,a0,a1); c.closePath(); c.fillStyle=qrCa(acc,0.16); c.fill(); } c.restore(); c.globalCompositeOperation='destination-in'; const g=c.createRadialGradient(W/2,H/2,R*0.04,W/2,H/2,R); g.addColorStop(0,'rgba(0,0,0,0.9)'); g.addColorStop(0.5,'rgba(0,0,0,0.45)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,0,W,H); c.globalCompositeOperation='source-over'; }
  else if(kind==='medal'){ qrMedal(c,W/2,H/2,W*0.47,acc,0.34); c.save(); c.translate(W/2,H/2); for(let k=0;k<2;k++){ c.rotate(Math.PI/8); qrStar(c,0,0,W*0.36,W*0.2,8,0); c.strokeStyle=qrCa(acc,0.22); c.lineWidth=Math.max(1,W/700); c.stroke(); } c.restore(); }
  else if(kind==='stars'){ qrStars(c,W,H,Math.round(W/5),71,'#ffffff',1); qrStars(c,W,H,Math.round(W/16),72,acc,1); }
  else if(kind==='clouds'){ qrClouds(c,W,H,16,81,'#ffffff',0.34,0.1,0.9); }
  else if(kind==='waves'){ const cols=[0.22,0.3,0.4]; for(let i=0;i<3;i++) qrRidge(c,W,H,H*(0.25+i*0.22),H*0.07,qrCa(acc,cols[i]),90+i,3+i*0.8); }
}
/* what each kind needs: a plate image (size, frame placement, motion) and/or engine particle effects */
function qrMoSpec(kind,o){ const hF=o.hFrac, acc=o.acc, dur=o.dur, r={pl:null,layer:null,fx:[]};
  if(kind==='rays') { r.pl={W:1536,H:1536}; r.layer={x:50,y:36,w:+(200*Math.hypot(0.5,0.64*hF)*1.04).toFixed(1),motion:[{type:'spin',deg:26,period:12}]}; }
  else if(kind==='medal'){ r.pl={W:1536,H:1536}; r.layer={x:50,y:+(hF>1?44:50).toFixed(0),w:hF>1?150:105,motion:[{type:'spin',deg:-12,period:12}]}; }
  else if(kind==='stars'){ r.pl={W:1296,H:Math.round(1296*Math.max(hF,0.5625)*1.0)}; r.layer={x:50,y:50,w:120,h:+(120*hF).toFixed(1),motion:[{type:'pan',dx:-3,dy:-2.5},{type:'flicker',amp:0.28,period:0.7}]}; r.fx=[{type:'sparkles',color:acc,amount:0.8}]; }
  else if(kind==='clouds'){ r.pl={W:2200,H:700}; r.layer={x:75,y:+(hF>1?30:36).toFixed(0),w:200,motion:[{type:'pan',dx:-Math.min(70,1.5*dur),dy:0}]}; }
  else if(kind==='waves'){ r.pl={W:2200,H:700}; r.layer={x:75,y:+(hF>1?80:78).toFixed(0),w:200,motion:[{type:'pan',dx:-Math.min(70,2.2*dur),dy:0},{type:'float',amp:0.9,period:3.4}]}; }
  else if(kind==='dust'){ r.fx=[{type:'dust',color:acc,amount:0.9},{type:'sparkles',color:acc,amount:0.45}]; }
  else if(kind==='fog'){ r.fx=[{type:'fog',color:'#ffffff',amount:0.45}]; }
  else if(kind==='lanterns'){ r.fx=[{type:'bokeh',color:acc,amount:0.9},{type:'embers',color:acc,amount:0.7}]; }
  return r; }
async function qrPlateMedia(p,kind,ratio,acc,spec){
  const nm='quran_pl_'+kind+'_'+acc.replace('#','')+'_'+ratio.replace(':','x')+'.png'; const ex=p.media.find(m=>m.kind==='image'&&m.name===nm); if(ex) return ex.id;
  const cv=document.createElement('canvas'); cv.width=spec.pl.W; cv.height=spec.pl.H; qrPlateDraw(kind,cv.getContext('2d'),cv.width,cv.height,acc);
  const blob=await new Promise(r=>cv.toBlob(r,'image/png')); const added=await animAddMedia([new File([blob],nm,{type:'image/png'})],{noMatch:true,noUndo:true}); return added&&added[0]?added[0].id:null; }
async function qrPrepPlates(p,q,ratio){ const rr=ANIM_RATIOS[ratio]||[9,16], hF=rr[1]/rr[0]; const S=qrStyOf(q); const acc=(q.acc==='auto'||!QR_ACC[q.acc])?S.acc:QR_ACC[q.acc][1]; const out={}; for(const k of qrMoKinds(q)){ const sp=qrMoSpec(k,{hFrac:hF,acc,dur:6}); if(sp.pl){ const id=await qrPlateMedia(p,k,ratio,acc,sp); if(id) out[k]=id; } } q._pl=out; return out; }
/* layers/effects for one scene */
function qrMoApply(q,o,layers,S,accent,hFrac){ const kinds=qrMoKinds(q), fx=[]; kinds.forEach((k,i)=>{ const sp=qrMoSpec(k,{hFrac,acc:accent,dur:o.dur}); if(sp.layer&&q._pl&&q._pl[k]) layers.push(Object.assign({id:'mo_'+k,type:'image',src:q._pl[k],bleed:true,z:1+i*0.1,fit:'contain'},sp.layer)); sp.fx.forEach(e=>fx.push(e)); });
  return (q.motion==='none'?[]:(q.motion==='auto'||!q.motion?S.fx:[])).map(e=>Object.assign({},e)).concat(fx); }
/* animated style presets (group «متحرّك») */
(function(){ const base=(id,name,from,mo,o)=>{ const b=QR_STY[from]; qrS(id,'🎞 '+name,'mov',b.draw,Object.assign({},b,{mo:mo,fx:[]},o||{})); QR_STY[id].id=id; QR_STY[id].name='🎞 '+name; };
  base('mv_rays','نور دوّار','noorrays',['rays','dust']);
  base('mv_rosette','وردة تدور','rosette',['medal','stars']);
  base('mv_night','ليل متلألئ','stars',['stars','clouds']);
  base('mv_mosque','مسجد وغيوم','mosquenight',['clouds','stars']);
  base('mv_waves','موج حيّ','ocean',['waves','fog']);
  base('mv_dunes','ريح الصحراء','dunes',['dust','fog']);
  base('mv_lantern','فوانيس وجمر','goldluxe',['lanterns','stars']);
  base('mv_aurora','شفق حيّ','aurora',['stars','fog']);
  base('mv_gold','ذهب لامع','mihrab',['dust','rays']);
  base('mv_sky','سحاب النهار','daysky',['clouds']);
})();
