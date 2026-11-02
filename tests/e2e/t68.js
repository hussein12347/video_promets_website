const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const page=await (await b.newContext({viewport:{width:1500,height:900},acceptDownloads:true})).newPage();
  const errors=[]; page.on('pageerror',e=>errors.push('PE '+e.message)); page.on('console',m=>{ if(m.type()==='error') errors.push('CE '+m.text().slice(0,160)); });
  await page.goto('http://127.0.0.1:8777/index.html'); await page.waitForTimeout(600);
  await page.click('.navitem[data-route="anim"]'); await page.waitForTimeout(4500);
  await page.evaluate(async()=>{ await animCreate('x','9:16',false); }); await page.waitForTimeout(1200);
  await page.evaluate(async()=>{ const sc=[3,3,3].map((d,i)=>({scene:i+1,duration:d,background:'#102040',layers:[{id:'bg',type:'shape',shape:'rect',x:50,y:50,w:100,h:100,fill:'#2a4a8a',enter:{type:'fade',at:0,dur:0.3}},{id:'t'+i,type:'text',text:'مشهد '+(i+1),x:50,y:50,size:8,enter:{type:'fade',at:0.1,dur:0.4}}]})); await animIngest(JSON.stringify(sc)); });
  // fake transcript
  const r=await page.evaluate(()=>{ const M=anMontState(ANIM.cur); const T='اهلا اااا بكم في امم هذا الفيديو يعني um سنتكلم الان uh عن اشياء مهمة جدا'.split(' '); M.words=T.map((w,i)=>({w,s:+(i*0.6).toFixed(2),e:+(i*0.6+0.45).toFixed(2)})); M.src={id:'x',kind:'audio',name:'a.wav',dur:12}; ANIM._montMode='smart'; SM.st().open.w=true; anGoPanel('montage'); return M.words.length; });
  await page.waitForTimeout(500); console.log('words',r,'chips',await page.evaluate(()=>document.querySelectorAll('.sm-w').length));
  await page.click('#sm-fil'); await page.waitForTimeout(200);
  console.log('after filler cut',await page.evaluate(()=>[...document.querySelectorAll('.sm-w.cut')].map(x=>x.textContent)),await page.evaluate(()=>document.querySelector('#sm-tcw').textContent+' '+document.querySelector('#sm-tcs').textContent));
  await page.evaluate(()=>{ SM.st().filc=true; animRenderPanel(); }); await page.click('#sm-filc'); await page.click('#sm-fil'); await page.waitForTimeout(150);
  console.log('with common',await page.evaluate(()=>[...document.querySelectorAll('.sm-w.cut')].map(x=>x.textContent)));
  // manual toggle + shift range
  await page.evaluate(()=>{ anMontState(ANIM.cur).tw=[]; animRenderPanel(); }); await page.waitForTimeout(200);
  await page.click('.sm-w[data-wi="3"]'); await page.click('.sm-w[data-wi="6"]',{modifiers:['Shift']});
  console.log('range cut',await page.evaluate(()=>[...document.querySelectorAll('.sm-w.cut')].map(x=>x.dataset.wi)));
  const rem=await page.evaluate(()=>{ const M=anMontState(ANIM.cur); return {removed:anMontRemoved(M).map(x=>x.map(v=>+v.toFixed(2))),pieces:anMontPieces(M,0,9.6)}; }); console.log('removed',JSON.stringify(rem));
  // silence union
  await page.evaluate(()=>{ const M=anMontState(ANIM.cur); const S=anSilState(M); S.on=true; S.ranges=[{a:8.0,b:8.5,on:true}]; }); console.log('union',await page.evaluate(()=>anMontRemoved(anMontState(ANIM.cur)).length));
  await page.evaluate(()=>{ const M=anMontState(ANIM.cur); M.sil.on=false; });
  // pulse needs B
  await page.evaluate(()=>{ SM.st().B={bpm:120,period:0.5,first:0,dur:30,onsets:[],wave:[0.1],conf:1}; SM.st().open.p=true; animRenderPanel(); }); await page.click('#sm-pon'); await page.waitForTimeout(500);
  console.log('pulse',await page.evaluate(()=>ANIM.cur.scenes.map(s=>JSON.stringify(s.raw.layers[0].motion))));
  console.log('rt ok',await page.evaluate(()=>!!ANIM.rt&&ANIM.rt.total));
  await page.click('#sm-poff'); await page.waitForTimeout(400); console.log('pulse off',await page.evaluate(()=>ANIM.cur.scenes.map(s=>JSON.stringify(s.raw.layers[0].motion||null))));
  // loudness
  await page.evaluate(()=>{ const ctx=animActx(); const mk=(amp)=>{ const bf=ctx.createBuffer(1,22050*4,22050); const d=bf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.sin(i*0.05)*amp; return bf; }; ANIM.buffers.v1=mk(0.5); ANIM.buffers.m1=mk(0.5); ANIM.cur.audio=[{uid:'a',key:'v1',name:'voice.wav',start:0,trimIn:0,len:4,volume:1,role:'voice'},{uid:'b',key:'m1',name:'music.mp3',start:0,trimIn:0,len:4,volume:1,role:'music'}]; SM.st().open.l=true; animRenderPanel(); });
  console.log('levels',await page.evaluate(()=>SM.levels().map(x=>[x.role,+x.db.toFixed(1)])));
  await page.click('#sm-bal'); await page.waitForTimeout(600);
  console.log('after balance',await page.evaluate(()=>SM.levels().map(x=>[x.role,+x.eff.toFixed(1),x.vol])));
  // covers
  await page.evaluate(()=>{ SM.st().open.t=true; animRenderPanel(); }); await page.click('#sm-cvb'); await page.waitForTimeout(500); console.log('covers',await page.evaluate(()=>document.querySelectorAll('.sm-cover').length));
  const [dl]=await Promise.all([page.waitForEvent('download',{timeout:8000}).catch(()=>null),page.click('.sm-cover')]); console.log('cover download',dl&&dl.suggestedFilename());
  // help
  await page.keyboard.press('?'); await page.waitForTimeout(200); console.log('help',await page.evaluate(()=>!!document.getElementById('sm-help'))); await page.keyboard.press('Escape'); await page.waitForTimeout(150); console.log('help closed',await page.evaluate(()=>!document.getElementById('sm-help')));
  await page.screenshot({path:'sm4.png'});
  console.log('ERR',JSON.stringify(errors.filter(e=>!/TUNNEL|Failed to fetch|Failed to load/.test(e)))); await b.close();
})();
