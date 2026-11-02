const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const page=await (await b.newContext({viewport:{width:1500,height:900}})).newPage(); const errors=[]; page.on('pageerror',e=>errors.push('PE '+e.message));
  await page.goto('http://127.0.0.1:8777/index.html'); await page.waitForTimeout(600); await page.click('.navitem[data-route="anim"]'); await page.waitForTimeout(4500);
  await page.evaluate(async()=>{ await animCreate('x','16:9',false); await animIngest(JSON.stringify([{scene:1,duration:3,background:'#f4f1ea',layers:[{id:'T',type:'text',text:'مرحبا',x:50,y:50,size:8,color:'#222'},{id:'M1',type:'mark',mark:'underline',target:'T',variant:'wavy'},{id:'M2',type:'mark',mark:'underline',target:'T',variant:'bogus'}]}])); });
  await page.waitForTimeout(800);
  console.log('normalized variants',await page.evaluate(()=>ANIM.cur.scenes[0].data.layers.filter(l=>l.type==='mark').map(l=>l.variant)));
  await page.evaluate(()=>{ ANIM.sel={scene:0,layer:'M1',clip:null}; animRefreshAll(); }); await page.waitForTimeout(500);
  console.log('inspector var select',await page.evaluate(()=>{ const s=document.querySelector('#in-var'); return s&&[s.value,[...s.options].map(o=>o.value).join(',')]; }));
  await page.selectOption('#in-var','double'); await page.waitForTimeout(500);
  console.log('after change',await page.evaluate(()=>ANIM.cur.scenes[0].raw.layers.find(l=>l.id==='M1').variant));
  await page.selectOption('#in-mark','circle'); await page.waitForTimeout(500);
  console.log('after type change',await page.evaluate(()=>[ANIM.cur.scenes[0].raw.layers.find(l=>l.id==='M1').mark,ANIM.cur.scenes[0].raw.layers.find(l=>l.id==='M1').variant||'']),await page.evaluate(()=>[...document.querySelector('#in-var').options].map(o=>o.value).join(',')));
  await page.evaluate(()=>animUndo()); await page.waitForTimeout(500); console.log('undo ->',await page.evaluate(()=>ANIM.cur.scenes[0].raw.layers.find(l=>l.id==='M1').mark));
  console.log('marks manager',await page.evaluate(()=>{ anGoPanel('marks'); return document.querySelectorAll('.mk-t').length; }));
  console.log('ERR',errors); await b.close(); })();
