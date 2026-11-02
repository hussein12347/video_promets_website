const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const page=await (await b.newContext({viewport:{width:1500,height:900}})).newPage();
  const errors=[]; page.on('pageerror',e=>errors.push('PE '+e.message)); page.on('console',m=>{ if(m.type()==='error') errors.push('CE '+m.text().slice(0,160)); });
  await page.goto('http://127.0.0.1:8777/index.html'); await page.waitForTimeout(600);
  await page.click('.navitem[data-route="anim"]'); await page.waitForTimeout(4500);
  await page.evaluate(async()=>{ await animCreate('x','16:9',false); }); await page.waitForTimeout(1200);
  // scene with a text and one mark per (type,variant)
  const all=await page.evaluate(()=>{ const out=[]; Object.keys(AN_MARK_AR).forEach(k=>ANMV.variants(k).forEach(v=>out.push([k,v[0]]))); return out; });
  console.log('combos',all.length);
  const chunks=[]; for(let i=0;i<all.length;i+=12) chunks.push(all.slice(i,i+12));
  const scenes=chunks.map((ch,si)=>({scene:si+1,duration:3,background:'#f4f1ea',layers:[ ...ch.map((c,i)=>({id:'T'+i,type:'text',text:'كلمة '+(i+1),x:14+(i%4)*24,y:20+Math.floor(i/4)*28,size:5,color:'#222'})), ...ch.map((c,i)=>({id:'M'+i,type:'mark',mark:c[0],variant:c[1]||undefined,target:'T'+i,color:c[0]==='highlight'?'#FFE34D':'#E53935',enter:{type:'draw',at:0,dur:0.3}})) ]}));
  const r=await page.evaluate(async(sc)=>{ await animIngest(JSON.stringify(sc)); return {n:ANIM.cur.scenes.length,warn:ANIM.cur.scenes.map(s=>(s.raw.warnings||[]).length)}; },scenes);
  console.log(JSON.stringify(r));
  for(let si=0;si<chunks.length;si++){ const url=await page.evaluate((si)=>{ const L=ANIM.rt.layout.scenes[si]; const cv=document.createElement('canvas'); cv.width=1200; cv.height=675; const x=cv.getContext('2d'); ANIM.rt.renderFrame(x,1200,675,L.start+2.5,{handAssets:animHandAssets(),cssGrade:false}); return cv.toDataURL('image/png'); },si); require('fs').writeFileSync('mv_'+si+'.png',Buffer.from(url.split(',')[1],'base64')); }
  // gallery panel
  await page.evaluate(()=>{ anGoPanel('marks'); }); await page.waitForTimeout(500);
  console.log('tiles',await page.evaluate(()=>[document.querySelectorAll('.mv-t').length,document.querySelectorAll('.mv-m').length,document.querySelectorAll('.mv-chip').length]));
  await page.screenshot({path:'mv_panel.png'});
  await page.click('.mv-chip[data-cat="circle"]'); await page.click('.mv-t[data-v="double"]'); await page.waitForTimeout(600);
  console.log('added',await page.evaluate(()=>{ const s=ANIM.cur.scenes[ANIM.sel.scene>=0?ANIM.sel.scene:0]; const m=s.raw.layers.filter(l=>l.type==='mark'); return m.slice(-1)[0]; }));
  console.log('ERR',JSON.stringify(errors.filter(e=>!/TUNNEL|Failed to fetch|Failed to load/.test(e)))); await b.close();
})();
