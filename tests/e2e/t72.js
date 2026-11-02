const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{
  const b=await chromium.launch(); const page=await (await b.newContext({viewport:{width:1500,height:900}})).newPage(); const errors=[]; page.on('pageerror',e=>errors.push('PE '+e.message)); page.on('console',m=>{ if(m.type()==='error') errors.push('CE '+m.text().slice(0,160)); });
  await page.goto('http://127.0.0.1:8777/index.html'); await page.waitForTimeout(600); await page.click('.navitem[data-route="anim"]'); await page.waitForTimeout(4500);
  await page.evaluate(async()=>{ await animCreate('x','9:16',false); const T=['هل تعرف سر النجاح؟','المشكلة أن الكل يبدأ بلا خطة','أحمد علي مدرب تنمية بشرية يقول','الحل هو الاستمرار يوميًا','النتيجة بعد 30 يوم مذهلة','ابدأ اليوم واشترك'];
    const sc=T.map((t,i)=>({scene:i+1,duration:i===1?9:4,background:'#102040',layers:[{id:'bg',type:'shape',shape:'rect',x:50,y:50,w:100,h:100,fill:'#2a4a8a'},{id:'t'+i,type:'text',text:t,x:50,y:50,size:7,enter:{type:'fade',at:0.2,dur:0.4}}]})); await animIngest(JSON.stringify(sc)); }); await page.waitForTimeout(800);
  await page.evaluate(()=>{ Object.assign(LAB.st().open,{r:true,p:true,k:true,b:true,s:true,c:true}); ANIM._montMode='lab'; anGoPanel('montage'); }); await page.waitForTimeout(600);
  console.log('tabs',await page.evaluate(()=>[...document.querySelectorAll('.src-tab')].map(x=>x.querySelector('b').textContent)));
  console.log('curve',await page.evaluate(()=>{ const c=LAB.curve(); return {avg:+c.avg.toFixed(1),hook:+c.hook.toFixed(1),dips:c.dips.map(d=>d.map(v=>+v.toFixed(1)))}; }));
  await page.screenshot({path:'lab1.png'});
  const before=await page.evaluate(()=>+LAB.curve().avg.toFixed(1));
  await page.click('#lb-int'); await page.waitForTimeout(700);
  console.log('interrupts',await page.evaluate(()=>document.querySelector('#lb-m-r').textContent),'avg',before,'->',await page.evaluate(()=>+LAB.curve().avg.toFixed(1)),'dips',await page.evaluate(()=>LAB.curve().dips.length),'warnings',await page.evaluate(()=>ANIM.cur.scenes.map(s=>(s.warnings||[]).length).join()));
  console.log('cam/fx on scene2',await page.evaluate(()=>JSON.stringify([ANIM.cur.scenes[1].raw.camera,ANIM.cur.scenes[1].raw.effects])));
  await page.click('#lb-clr'); await page.waitForTimeout(400); console.log('cleared',await page.evaluate(()=>JSON.stringify(ANIM.cur.scenes[1].raw.camera)));
  // presets
  for(const id of ['social','cine']){ await page.click('.lb-pre[data-id="'+id+'"]'); await page.waitForTimeout(600); console.log('preset',id,await page.evaluate(()=>JSON.stringify({durs:ANIM.rt.layout.scenes.map(l=>+l.dur.toFixed(1)),tr:ANIM.cur.scenes.map(s=>s.data.transition.type).join(),fx:ANIM.cur.scenes[2].data.effects.map(e=>e.type).join('+'),cam:ANIM.cur.scenes[2].data.camera.length,warn:ANIM.cur.scenes.reduce((a,s)=>a+(s.warnings||[]).length,0)}))); }
  await page.click('#lb-pclr'); await page.waitForTimeout(300);
  // hook lab
  await page.evaluate(()=>{ LAB.st().open.k=true; animRenderPanel(); }); 
  await page.fill('#lb-r-k','```json\n'+JSON.stringify({hooks:[{name:'فضول',technique:'curiosity',text:'لن تصدق ما حدث بعد 30 يوم',sub:'السر في الخطوة 3',mark:'underline'},{name:'سؤال',text:'لماذا تفشل؟',mark:'none'}]})+'\n```'); await page.click('#lb-hp'); await page.waitForTimeout(300);
  console.log('hooks listed',await page.evaluate(()=>document.querySelectorAll('.lb-hu').length)); await page.click('.lb-hu[data-i="0"]'); await page.waitForTimeout(900);
  console.log('after hook',await page.evaluate(()=>JSON.stringify({n:ANIM.cur.scenes.length,first:ANIM.cur.scenes[0].raw.layers.map(l=>l.type+':'+(l.text||l.mark||'')),tr:ANIM.cur.scenes[0].data.transition.type,warn:(ANIM.cur.scenes[0].warnings||[])})));
  await page.evaluate(()=>{ const c=document.createElement('canvas'); c.width=1080; c.height=1920; const L=ANIM.rt.layout.scenes[0]; ANIM.rt.renderFrame(c.getContext('2d'),360,640,L.start+1.2,{}); const x=c.getContext('2d'); window.__hook=c.toDataURL('image/png'); });
  const hd=await page.evaluate(()=>{ const c=document.createElement('canvas'); c.width=360; c.height=640; ANIM.rt.renderFrame(c.getContext('2d'),360,640,ANIM.rt.layout.scenes[0].start+1.3,{handAssets:animHandAssets(),cssGrade:false}); return c.toDataURL('image/png'); }); fs.writeFileSync('lab_hook.png',Buffer.from(hd.split(',')[1],'base64'));
  // story doctor (scenes now 7: hook + 6)
  await page.evaluate(()=>{ LAB.st().open.s=true; animRenderPanel(); });
  await page.fill('#lb-r-s',JSON.stringify({summary:'تمام',roles:[{scene:1,role:'hook'},{scene:2,role:'solution'}],order:[1,3,2,4,5,6,7],cut:[6],hook:{scene:2,text:'سر النجاح الحقيقي'},fade:[4]}));
  await page.check('#lb-do-c'); await page.click('#lb-sa'); await page.waitForTimeout(800);
  console.log('story',await page.evaluate(()=>document.querySelector('#lb-m-s').textContent),await page.evaluate(()=>JSON.stringify(ANIM.cur.scenes.map(s=>[s.raw.scene,s.raw._role||'',(s.raw.layers.find(l=>l.type==='text')||{}).text]))));
  // chapters
  await page.evaluate(()=>{ LAB.st().open.c=true; animRenderPanel(); });
  await page.fill('#lb-r-c',JSON.stringify({chapters:[{before_scene:3,title:'الحل',subtitle:'خطوة بخطوة'},{before_scene:5,title:'النتيجة'}],lowerThirds:[{scene:3,name:'أحمد علي',role:'مدرب',at:0.5,dur:2.5}]})); await page.click('#lb-ca'); await page.waitForTimeout(900);
  console.log('chapters',await page.evaluate(()=>document.querySelector('#lb-m-c').textContent),'scenes',await page.evaluate(()=>ANIM.cur.scenes.length),await page.evaluate(()=>JSON.stringify(ANIM.cur.scenes.map(s=>s.raw.title||(s.raw.layers.find(l=>l.type==='text')||{}).text))));
  const cd=await page.evaluate(()=>{ const i=ANIM.cur.scenes.findIndex(s=>s.raw.title==='فصل'); const L=ANIM.rt.layout.scenes[i]; const c=document.createElement('canvas'); c.width=360; c.height=640; ANIM.rt.renderFrame(c.getContext('2d'),360,640,L.start+1.3,{handAssets:animHandAssets(),cssGrade:false}); return c.toDataURL('image/png'); }); fs.writeFileSync('lab_card.png',Buffer.from(cd.split(',')[1],'base64'));
  // broll
  await page.evaluate(()=>{ LAB.st().open.b=true; animRenderPanel(); });
  await page.fill('#lb-r-b',JSON.stringify({slots:[{scene:2,role:'cutaway',search:'sunrise running',prompt:'a runner at sunrise',why:'تعزيز'},{scene:4,role:'overlay',search:'calendar',prompt:'calendar pages flipping'},{scene:99,role:'x'}]})); await page.click('#lb-bp'); await page.waitForTimeout(300);
  console.log('slots',await page.evaluate(()=>document.querySelectorAll('.lb-slot').length));
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAFklEQVR4nGP8z8Dwn4EIwESMolGFpAMAxXkEBvQlCcUAAAAASUVORK5CYII=','base64'); fs.writeFileSync('/tmp/claude-0/mont/px.png',png);
  await page.setInputFiles('#lb-f0','/tmp/claude-0/mont/px.png'); await page.waitForTimeout(1500);
  console.log('attached',await page.evaluate(()=>JSON.stringify(ANIM.cur.scenes[1].raw.layers.map(l=>[l.id,l.type,l.z,l.hidden||false]))),'done',await page.evaluate(()=>LAB.st().slots[0].done),'warn',await page.evaluate(()=>(ANIM.cur.scenes[1].warnings||[]).join('|')));
  await page.setInputFiles('#lb-f1','/tmp/claude-0/mont/px.png'); await page.waitForTimeout(1500);
  console.log('overlay',await page.evaluate(()=>JSON.stringify(ANIM.cur.scenes[3].raw.layers.filter(l=>l.type==='image'))),await page.evaluate(()=>(ANIM.cur.scenes[3].warnings||[]).join('|')));
  await page.screenshot({path:'lab2.png'});
  console.log('ERR',JSON.stringify(errors.filter(e=>!/TUNNEL|Failed to fetch|Failed to load/.test(e)))); await b.close(); })();
