const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const page=await (await b.newContext({viewport:{width:1500,height:950}})).newPage(); await page.addInitScript(()=>{ window.__noRT=true; });
  const errors=[]; page.on('pageerror',e=>errors.push('PE '+e.message)); page.on('console',m=>{ if(m.type()==='error') errors.push('CE '+m.text().slice(0,160)); });
  await page.goto('http://127.0.0.1:8777/index.html'); await page.waitForTimeout(600);
  await page.click('.navitem[data-route="anim"]'); await page.waitForTimeout(5000);
  await page.click('#an-mont'); await page.waitForTimeout(2000);
  await page.setInputFiles('#mt-file','/tmp/claude-0/mont/serve/src.mp4'); await page.waitForTimeout(3500);
  await page.evaluate(()=>{ const M=ANIM.cur.montage; const w=[]; const T='اهلا بكم في هذه الحلقة سنتحدث اليوم عن أهمية النوم الصحي وكيف يؤثر على التركيز والذاكرة'.split(' '); for(let i=0;i<48;i++) w.push({w:T[i%T.length]+(i%8===7?'.':''),s:+(i*0.5).toFixed(2),e:+(i*0.5+0.4).toFixed(2)}); M.words=w; M.src.dur=Math.max(M.src.dur||0,24); animRenderPanel(); });
  await page.waitForTimeout(500);
  console.log('src kind',await page.evaluate(()=>ANIM.cur.montage.src.kind),'dur',await page.evaluate(()=>ANIM.cur.montage.src.dur));
  console.log('gen button',await page.$$eval('.gn-gen',e=>e.map(x=>x.textContent)),'style box',!!(await page.$('#gn-st')));
  // parse
  console.log('parse',JSON.stringify(await page.evaluate(()=>{ const P=GEN.parse('عايزه سريع زي الريلز، قطع حاد، زووم، خلفية داكنة، لون أصفر، كل 3 ثواني، هوك، علامات'); return {tags:P.tags,len:P.spec.len,acc:P.spec.accent,tr:P.spec.tr,pace:P.spec.pace}; })));
  await page.fill('#gn-st','عايزه سريع زي الريلز، قطع حاد، زووم، خلفية داكنة، لون أصفر، كل 3 ثواني، علامات'); await page.waitForTimeout(300);
  console.log('chips',await page.$$eval('#gn-st-c .mt2-chip',e=>e.length),'saved',await page.evaluate(()=>ANIM.cur.montage.styleText));
  console.log('prompt has custom',await page.evaluate(()=>anMontPrompt(0).includes('CUSTOM MONTAGE STYLE')));
  await page.evaluate(()=>{ const s=document.querySelector('[data-s="s5"]'); if(s&&!s.classList.contains('open')) s.classList.add('open'); });
  const js=await page.evaluate(()=>{ const o=JSON.parse(GEN.sceneJson(0)); return {n:o.scenes.length,first:o.scenes[0],lens:o.scenes.map(s=>+(s.to-s.from).toFixed(1)),show:o.scenes.map(s=>s.source.show).join(','),tr:o.scenes.map(s=>s.transition.type).join(',')}; });
  console.log('gen',JSON.stringify(js).slice(0,900));
  await page.click('.gn-gen'); await page.waitForTimeout(4000);
  const r=await page.evaluate(()=>({scenes:ANIM.cur.scenes.length,mont:ANIM.cur.scenes.filter(s=>s.raw&&s.raw._mont).length,txt:ANIM.cur.scenes.slice(0,3).map(s=>s.raw.layers.filter(l=>l.type==='text').map(l=>l.text).join('/')),vid:ANIM.cur.scenes[0].raw.layers.some(l=>l.type==='video'),res:(document.querySelector('[data-res="0"]')||{}).innerText}));
  console.log('applied',JSON.stringify(r));
  await page.screenshot({path:'gen1.png'});
  // audio-only + notext + light
  await page.evaluate(()=>{ ANIM.cur.montage.styleText='هادئ سينمائي تلوين ذهبي ذوبان خلفية فاتحة'; const o=JSON.parse(GEN.sceneJson(0)); window.__o=o; });
  console.log('slow',JSON.stringify(await page.evaluate(()=>({len:window.__o.scenes.length,fx:window.__o.scenes[1].effects,tr:window.__o.scenes[1].transition,bg:window.__o.scenes[1].background}))));
  // pro methods panel
  await page.evaluate(()=>{ ANIM._montMode='lab'; anGoPanel('montage'); }); await page.waitForTimeout(600);
  console.log('lab box',!!(await page.$('#gn-lab')));
  await page.fill('#gn-lab','سريع ولاهث بزووم وقطع حاد وهوك ومقاطعات'); await page.waitForTimeout(200);
  const before=await page.evaluate(()=>JSON.stringify(ANIM.cur.scenes.map(s=>s.raw.transition)));
  await page.click('#gn-apply'); await page.waitForTimeout(1500);
  console.log('lab msg',await page.$eval('#gn-msg',e=>e.textContent));
  console.log('lab applied',JSON.stringify(await page.evaluate(()=>({tr:ANIM.cur.scenes.slice(0,3).map(s=>s.raw.transition.type),cam:ANIM.cur.scenes[1].raw.camera.length,promptHas:LAB.promptHook(LAB.st()).includes('CUSTOM MONTAGE STYLE'),presetsClean:!('custom' in LAB.PRESETS)}))));
  await page.click('#gn-undo'); await page.waitForTimeout(300);
  console.log('after clear cam',await page.evaluate(()=>ANIM.cur.scenes[1].raw.camera.filter(c=>c._rp).length));
  await page.screenshot({path:'gen2.png'});
  console.log('errors',errors.slice(0,6)); await b.close();
})();
