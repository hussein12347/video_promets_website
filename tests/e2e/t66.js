const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const page=await (await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true})).newPage();
  const errors=[]; page.on('pageerror',e=>errors.push('PE '+e.message)); page.on('console',m=>{ if(m.type()==='error') errors.push('CE '+m.text().slice(0,160)); });
  await page.goto('http://127.0.0.1:8777/index.html'); await page.waitForTimeout(600);
  await page.click('.navitem[data-route="anim"]'); await page.waitForTimeout(4500);
  await page.evaluate(async()=>{ await animCreate('x','9:16',false); }); await page.waitForTimeout(1500);
  const ing=await page.evaluate(async()=>{ const sc=[2.3,3.1,4.4,2.0,5.2].map((d,i)=>({scene:i+1,duration:d,background:{type:'solid',color:'#102040'},layers:[{id:'t'+i,type:'text',text:'مشهد رقم '+(i+1),x:50,y:50,size:8,enter:{type:'fade',at:0.1,dur:0.4}}]})); try{ await animIngest(JSON.stringify(sc)); }catch(e){ return 'ERR '+e.message; } return ANIM.cur.scenes.length; });
  console.log('ingest',ing, await page.evaluate(()=>ANIM.rt&&ANIM.rt.layout.scenes.map(l=>+l.dur.toFixed(2))));
  // synthetic 120bpm beat track
  const det=await page.evaluate(()=>{ const ctx=animActx(); const sr=22050, len=sr*30; const buf=ctx.createBuffer(1,len,sr); const d=buf.getChannelData(0); for(let t=0.12;t<30;t+=0.5){ const i=Math.round(t*sr); for(let k=0;k<400;k++) d[i+k]+=Math.sin(k*0.2)*Math.exp(-k/80)*0.9; } ANIM.buffers['kk']=buf; ANIM.cur.audio=ANIM.cur.audio||[]; ANIM.cur.audio.push({uid:'u1',key:'kk',name:'beat.wav',start:0,trimIn:0,len:30,volume:1,role:'music'}); const B=SM.detect(buf); return {bpm:B.bpm,first:+B.first.toFixed(3),conf:+B.conf.toFixed(2),on:B.onsets.slice(0,4)}; });
  console.log('detect',JSON.stringify(det));
  await page.evaluate(()=>{ ANIM._montMode='smart'; anGoPanel('montage'); }); await page.waitForTimeout(500);
  console.log('tabs',await page.evaluate(()=>[...document.querySelectorAll('.src-tab')].map(x=>x.textContent.trim().slice(0,12))));
  await page.selectOption('#sm-src','c0'); await page.waitForTimeout(1200);
  console.log('bpm chip',await page.evaluate(()=>(document.querySelector('#sm-bpm')||{}).textContent),'off',await page.evaluate(()=>SM.st().off),'plan',await page.evaluate(()=>document.querySelector('#sm-plan').textContent));
  await page.screenshot({path:'sm1.png'});
  await page.click('#sm-apply'); await page.waitForTimeout(800);
  const after=await page.evaluate(()=>ANIM.rt.layout.scenes.map(l=>[+l.start.toFixed(3),+l.dur.toFixed(3)]));
  console.log('after snap',JSON.stringify(after));
  const onBeat=await page.evaluate(()=>{ const ends=ANIM.rt.layout.scenes.map(l=>l.start+l.dur); return ends.map(e=>+(((e-0.12)/0.5)%1).toFixed(3)); }); console.log('end phase (0=on beat)',JSON.stringify(onBeat));
  await page.evaluate(()=>animUndo()); await page.waitForTimeout(600); console.log('undo durations',await page.evaluate(()=>ANIM.rt.layout.scenes.map(l=>+l.dur.toFixed(2))));
  // fixed mode
  await page.evaluate(()=>{ const S=SM.st(); S.mode='fixed'; S.per=4; }); await page.evaluate(()=>animRenderPanel()); await page.click('#sm-apply'); await page.waitForTimeout(600);
  console.log('fixed 4 beats',await page.evaluate(()=>ANIM.rt.layout.scenes.map(l=>+l.dur.toFixed(2))));
  // sheet + review
  await page.evaluate(()=>{ SM.st().open.r=true; animRenderPanel(); });
  await page.click('#sm-sheet'); await page.waitForTimeout(500);
  console.log('sheet',await page.evaluate(()=>S=SM.st()._sheet&&[SM.st()._sheet.width,SM.st()._sheet.height]));
  const pr=await page.evaluate(()=>SM.reviewPrompt('hook',true)); console.log('prompt len',pr.length, pr.includes('"scene":N'));
  await page.evaluate(()=>{ document.querySelector('#sm-reply').value='ما يلي ```json\n'+JSON.stringify({summary:'تمام',ops:[{scene:1,duration:4},{scene:2,transition:'fade'},{scene:3,text:['عنوان جديد'],addEffects:['vignette','nonsense']},{scene:4,delete:true},{scene:5,moveTo:1},{scene:99,duration:2}]})+'\n```'; }); 
  await page.click('#sm-ap'); await page.waitForTimeout(800);
  console.log('review msg',await page.evaluate(()=>document.querySelector('#sm-rmsg').textContent));
  console.log('after review',await page.evaluate(()=>ANIM.cur.scenes.map(s=>[s.raw.layers[0].text,s.data.transition.type,(s.data.effects||[]).map(e=>e.type).join('+'),+s.data.duration.toFixed(2)])));
  // health
  await page.evaluate(()=>{ SM.st().open.h=true; animRenderPanel(); }); console.log('health',await page.evaluate(()=>[...document.querySelectorAll('.sm-h')].map(x=>x.textContent.trim())));
  // srt
  const srt=await page.evaluate(()=>SM.srt(false)); console.log('srt\n'+srt.slice(0,260));
  // snapshots
  console.log('snap',await page.evaluate(()=>SM.snapSave('t1')),await page.evaluate(()=>SM.snaps().length));
  await page.evaluate(()=>{ SM.st().open.v=true; animRenderPanel(); });
  await page.click('[data-rs="0"]'); await page.waitForTimeout(800); console.log('restored scenes',await page.evaluate(()=>ANIM.cur.scenes.length));
  // palette
  await page.keyboard.press('Control+k'); await page.waitForTimeout(300); console.log('palette open',await page.evaluate(()=>!!document.getElementById('sm-pal')),'items',await page.evaluate(()=>document.querySelectorAll('#sm-pl li').length));
  await page.keyboard.type('فحص'); await page.waitForTimeout(200); console.log('filtered',await page.evaluate(()=>[...document.querySelectorAll('#sm-pl li')].map(x=>x.textContent)));
  await page.keyboard.press('Enter'); await page.waitForTimeout(500); console.log('palette closed',await page.evaluate(()=>!document.getElementById('sm-pal')),'mode',await page.evaluate(()=>ANIM._montMode));
  await page.screenshot({path:'sm2.png'});
  console.log('ERR',JSON.stringify(errors.filter(e=>!/TUNNEL|Failed to fetch|Failed to load/.test(e)))); await b.close();
})();
