const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const page=await (await b.newContext({viewport:{width:1500,height:900}})).newPage(); const errors=[]; page.on('pageerror',e=>errors.push('PE '+e.message)); page.on('console',m=>{ if(m.type()==='error') errors.push('CE '+m.text().slice(0,160)); });
  await page.goto('http://127.0.0.1:8777/index.html'); await page.waitForTimeout(600); await page.click('.navitem[data-route="anim"]'); await page.waitForTimeout(4500);
  await page.evaluate(async()=>{ await animCreate('x','16:9',false); const sc=[3,3,3].map((d,i)=>({scene:i+1,duration:d,background:'#102040',layers:[{id:'bg',type:'shape',shape:'rect',x:50,y:50,w:100,h:100,fill:'#2a4a8a'},{id:'t'+i,type:'text',text:'مشهد '+(i+1),x:50,y:50,size:8,enter:{type:'fade',at:0.2,dur:0.4},exit:{type:'fade',at:2.4,dur:0.4}}]})); await animIngest(JSON.stringify(sc)); }); await page.waitForTimeout(800);
  const lay=()=>page.evaluate(()=>ANIM.rt.layout.scenes.map(l=>[+l.start.toFixed(2),+l.dur.toFixed(2)]));
  console.log('start',JSON.stringify(await lay()));
  // scene right-edge drag: extend scene 1 by ~2s (zoom px/sec)
  const z=await page.evaluate(()=>ANIM.zoom); const h=await page.locator('#tl-v .tl-clip[data-i="0"] .tl-hr').boundingBox(); const x=h.x+h.width/2, y=h.y+h.height/2;
  await page.mouse.move(x,y); await page.mouse.down(); await page.mouse.move(x+z*1,y,{steps:4}); await page.waitForTimeout(250);
  const mid=await page.evaluate(()=>({raw:ANIM.cur.scenes[0].raw.duration,lay:ANIM.rt.layout.scenes.map(l=>[+l.start.toFixed(2),+l.dur.toFixed(2)]),left1:document.querySelector('#tl-v .tl-clip[data-i="1"]').style.left,w0:document.querySelector('#tl-v .tl-clip[data-i="0"]').style.width,t:+ANIM.t.toFixed(2)}));
  console.log('DURING drag (mouse still down)',JSON.stringify(mid));
  await page.mouse.move(x+z*2,y,{steps:4}); await page.waitForTimeout(250);
  console.log('DURING 2s',JSON.stringify(await lay()));
  await page.mouse.up(); await page.waitForTimeout(600); console.log('after up',JSON.stringify(await lay()), 'clip1 left',await page.evaluate(()=>document.querySelector('#tl-v .tl-clip[data-i="1"]').style.left), 'expected',3+2);
  await page.evaluate(()=>animUndo()); await page.waitForTimeout(500); console.log('undo',JSON.stringify(await lay()));
  // shrink scene 2 (index1) by 1s
  const h2=await page.locator('#tl-v .tl-clip[data-i="1"] .tl-hr').boundingBox(); await page.mouse.move(h2.x+h2.width/2,h2.y+h2.height/2); await page.mouse.down(); await page.mouse.move(h2.x+h2.width/2-z,h2.y+h2.height/2,{steps:4}); await page.waitForTimeout(200); console.log('shrink during',JSON.stringify(await lay())); await page.mouse.up(); await page.waitForTimeout(500);
  // layer bar right-edge drag (select scene 0 first)
  await page.evaluate(()=>{ ANIM.sel={scene:0,layer:null,clip:null}; animRefreshAll(); }); await page.waitForTimeout(400);
  console.log('layer left handles',await page.evaluate(()=>document.querySelectorAll('#tl-l .tl-ly .tl-hl').length));
  const lr=await page.locator('#tl-l .tl-ly[data-id="t0"] .tl-hr').boundingBox(); const wBefore=await page.evaluate(()=>parseFloat(document.querySelector('#tl-l .tl-ly[data-id="t0"]').style.width));
  await page.mouse.move(lr.x+lr.width/2,lr.y+lr.height/2); await page.mouse.down(); await page.mouse.move(lr.x+lr.width/2-z*0.8,lr.y+lr.height/2,{steps:4}); await page.waitForTimeout(250);
  console.log('layer during: width',wBefore,'->',await page.evaluate(()=>parseFloat(document.querySelector('#tl-l .tl-ly[data-id="t0"]').style.width)),'exit.at',await page.evaluate(()=>ANIM.cur.scenes[0].raw.layers.find(l=>l.id==='t0').exit.at));
  await page.mouse.up(); await page.waitForTimeout(500);
  const ll=await page.locator('#tl-l .tl-ly[data-id="t0"] .tl-hl').boundingBox(); await page.mouse.move(ll.x+ll.width/2,ll.y+ll.height/2); await page.mouse.down(); await page.mouse.move(ll.x+ll.width/2+z*0.5,ll.y+ll.height/2,{steps:3}); await page.waitForTimeout(200);
  console.log('layer left during: enter.at',await page.evaluate(()=>ANIM.cur.scenes[0].raw.layers.find(l=>l.id==='t0').enter.at)); await page.mouse.up();
  console.log('ERR',JSON.stringify(errors.filter(e=>!/TUNNEL|Failed to fetch|Failed to load/.test(e)))); await b.close(); })();
