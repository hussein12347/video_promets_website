const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const page=await (await b.newContext({viewport:{width:390,height:800},hasTouch:true})).newPage(); const errs=[]; page.on('pageerror',e=>errs.push(e.message));
await page.goto('http://127.0.0.1:8777/index.html'); await page.waitForTimeout(600); await page.evaluate(()=>{ const x=document.querySelector('.navitem[data-route="anim"]'); x.click(); }); await page.waitForTimeout(4500);
await page.evaluate(async()=>{ await animCreate('x','9:16',false); }); await page.waitForTimeout(1200);
await page.evaluate(()=>{ SM.st().open={b:true,r:true,h:true,x:true,v:true}; ANIM._montMode='smart'; anGoPanel('montage'); }); await page.waitForTimeout(500);
console.log('overflowX', await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth, [...document.querySelectorAll('.sm-wrap *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1||e.getBoundingClientRect().left<-1).length]));
await page.keyboard.press('Control+k'); await page.waitForTimeout(300); console.log('pal w',await page.evaluate(()=>document.querySelector('.sm-pbox').getBoundingClientRect().width));
await page.screenshot({path:'sm3.png'}); console.log(errs); await b.close(); })();
