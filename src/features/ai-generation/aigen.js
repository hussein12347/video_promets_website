/* ---------------- GENERATE-LAYERS mode: image + prompt → AI → JSON (image prompts + animation) → Google Flow → back ---------------- */
function anAIGenNextNo(){ const p=ANIM.cur; const rep=document.querySelector('#ai-replace'); if(rep&&rep.checked) return 1; return Math.max(0,...p.scenes.map(s=>+s.data.scene||0))+1; }
async function anAIPromptGen(id){
  const p=ANIM.cur; const im=ANIM.assets.images[id]; const iw=im?(im.naturalWidth||im.width):0, ih=im?(im.naturalHeight||im.height):0;
  const goal={EXPLAIN:'an educational explainer that teaches what the image shows, part by part',PROMO:'a premium product or service promo that reveals the key features and ends on a strong call to action',STORY:'a cinematic micro-story set in the world of the image',SOCIAL:'a fast, punchy social-media clip',ISLAMIC:'a calm, respectful, reflective piece (no music instruments implied, no faces of prophets or companions)',DOC:'a documentary / historical piece',QUOTE:'a quote or wisdom piece where the words are the star'}[AI_IMG.goal]||'a professional motion-graphics video';
  const lang={AR:'Modern Standard Arabic (with full tashkeel on short texts)',EGY:'clean Egyptian colloquial Arabic',EN:'English',NONE:'no on-screen text at all (visual motion only)'}[AI_IMG.lang];
  const pace={CALM:'calm: slow camera moves, soft fades and wipes, gentle floating, no shake',MEDIUM:'balanced: clear stagger of reveals, smooth camera moves, a few accents',ENERGETIC:'energetic: snappy pops, punch-in zooms, word-by-word kinetic text, quick transitions'}[AI_IMG.style];
  const nSc=AI_IMG.scenes==='AUTO'?'choose 1-6 scenes that fit the duration':('exactly '+AI_IMG.scenes+' scene(s)');
  const ratio=p.ratio; const start=anAIGenNextNo(); const sn=String(start).padStart(2,'0');
  const plate={CLEAN:'CLEAN PLATE — the exact same scene and camera framing as the reference with EVERY subject, character and movable object removed (an empty set), completed behind them, and extended to fill the whole '+ratio+' frame',EXTEND:'EXTENDED — the reference image itself, outpainted outward so it fills the whole '+ratio+' frame, keeping the subjects in place',REIMAGINE:'NEW BACKGROUND — a new environment that suits the story, in exactly the same art style, palette and lighting as the reference, in the full '+ratio+' frame, with clear foreground / middle / far depth'}[AI_IMG.plate||'CLEAN'];
  const maxEl=AI_IMG.elems&&AI_IMG.elems!=='AUTO'?('at most '+AI_IMG.elems+' element images per scene'):'1-5 element images per scene';
  const depth=AI_IMG.depth==='NO'?'no parallax; keep a simple camera':'use PARALLAX: give "depth" values (0.6 far … 1.4 near) to the plate and the elements and move the camera slowly (pan / zoom) so the layers slide against each other';
  const L=[];
  L.push('You are a senior motion-graphics director and art director. I attached ONE reference image. Build '+goal+' from it. Unlike a cut-out job you are NOT limited to the pixels of this image: you write prompts for an AI image generator (Google Flow / Imagen) that will receive THIS SAME image as its visual reference, and you design the animation of the new images it will produce — a fresh background plate, separate elements that move on their own, extra shots — freely and professionally.');
  L.push('');
  L.push('FACTS: reference image '+iw+'×'+ih+' px; video frame '+ratio+'; total duration about '+AI_IMG.dur+' seconds; '+nSc+'; on-screen text language: '+lang+'; pace: '+pace+'.'+(AI_IMG.hand?' Style: whiteboard hand-drawing — elements appear with "enter":{"type":"handdraw"} one at a time.':'')+(AI_IMG.text.trim()?' The user\'s message / required text: «'+AI_IMG.text.trim()+'».':''));
  L.push('');
  L.push('STEP 1 — Study the reference: describe (briefly, in your head) its art style, palette, lighting, perspective and every important subject. For each subject estimate its box in % of the REFERENCE: [x, y, w, h] (x,y = top-left).');
  L.push('STEP 2 — Plan the story and the layers per scene: far background plate → middle elements → near elements/foreground, text, marks, effects; what appears first, what moves, how the camera travels.');
  L.push('STEP 3 — Output ONLY one ```json block with {"scenes":[…]} (strict JSON). Before it you may write 2-4 short lines in Arabic describing the plan.');
  L.push('');
  L.push('RULES');
  L.push('- Scenes are numbered from '+start+'. Image IDs follow the scene number: S'+sn+'_IMG1, S'+sn+'_IMG2 … (two digits for the scene, then _IMG and a number). Re-use an ID in later scenes when the same image returns (do not list it again).');
  L.push('- Every generated image is listed in the scene\'s "images" array: {"id":"S'+sn+'_IMG1","role":"background|character|object|prop|icon|extra","prompt":"…"} and used by a layer through "src":"<that id>".');
  L.push('- EVERY image prompt is complete, standalone, in English, and starts with: "Using the attached reference image as the exact visual reference (same art style, same characters, same colours, same lighting and perspective), …". It ends with "aspect ratio '+ratio+' (or the element\'s own canvas), no text, no watermark, no border".');
  L.push('- BACKGROUND plate ("role":"background", full frame, "fit":"cover", z 0): '+plate+'. Each scene normally has one (re-use the same plate across scenes whenever the place does not change).');
  L.push('- ELEMENTS ("role":"character" | "object" | "prop" | "icon"): one image per thing that moves on its own, drawn exactly as in the reference (same design and pose, or the new pose / state you need), COMPLETE (nothing cropped), centred and filling its canvas, isolated on a perfectly flat solid pure green (#00FF00) background with no shadow, gradient, glow or floor — the app removes the green ("key":"auto") and trims to the element. '+maxEl+'. Variants of the same character (another pose, expression, a hand holding something) are separate elements you can swap during the scene.');
  L.push('- EXTRA full-frame shots ("role":"extra"): a close-up, a different angle or a detail the story needs, in the same style, used as its own scene or as a cut.');
  L.push('- You may also use the ORIGINAL reference as a layer with "src":"IMG" (for example "fit":"cover" for an opening frame before the plate takes over, or as a cut-out with "place":"image" + "crop":[x,y,w,h]). Do not list "IMG" in "images".');
  L.push('- PLACEMENT: at the start of the first scene the composition should look like the reference. Place each element at the spot where its subject sits in the reference: x,y = the element CENTRE and w = its visible width, in % of the FRAME ('+ratio+')'+(ratio==='16:9'&&iw&&ih&&Math.abs(iw/ih-16/9)<0.05?'':'; when the reference ratio differs from the frame, treat the reference as centred and fitted in the frame and convert the coordinates')+'.');
  L.push('- '+depth+'.');
  L.push('- Animate freely: elements enter from where it makes sense (slide-blur-* from their side, pop / squash / swirl for objects, rise / drop for things that fall or grow), then keep a gentle continuous motion (float, breathe, sway, bob, pulse); the camera pushes toward the key subject; marks, callouts and kinetic text appear on the exact moment of the story; effects (dust, light rays, vignette, grade…) set the mood. Keep 4-10 layers per scene and reveal them one after another. Use "cue" only if there is a voiceover; otherwise time everything in seconds from the start of the scene.');
  L.push('- Text on screen (only if the language is not NONE): 2-6 words, high contrast, never covering faces or the key subject.');
  L.push('- Scene object also has "title", "duration" (seconds), "background" (a hex colour), "transition" and optional "sfx". Keep "voiceover" empty unless the user\'s message gives a script.');
  L.push('');
  L.push('SCENE FORMAT AND ANIMATION VOCABULARY (the app understands exactly these names)');
  L.push(anMontSchema(ratio));
  return L.join('\n');
}
function anAIGenRemap(raw,oldNo,newNo,imgId){
  if(oldNo!==newNo&&isFinite(oldNo)){ const re=new RegExp('\\bS0*'+oldNo+'_IMG(\\d+)','g'); const n2=String(newNo).padStart(2,'0'); raw=JSON.parse(JSON.stringify(raw).replace(re,(m,d)=>'S'+n2+'_IMG'+d)); }
  raw._gen={img:imgId}; return raw;
}
function anAIGenItems(p){
  const out=[]; p.scenes.forEach(s=>{ if(!(s.raw&&s.raw._gen)) return; animSceneImageIds(s).forEach(id=>{ if(id===s.raw._gen.img||out.some(x=>x.id===id)) return; const im=animPromptOf(p,id); if(im&&im.prompt) out.push({id,prompt:im.prompt,role:im.role||'',scene:s.data.scene}); }); });
  return out;
}
const AN_GEN_ROLE={background:'🏞️ خلفية',character:'🧍 شخصية',object:'📦 عنصر',prop:'🎒 إكسسوار',icon:'🔣 أيقونة',extra:'🎞️ لقطة إضافية',full:'🖼️ لقطة'};
function anAIGenCard(box){
  const host=box.querySelector('#ai-gen'); if(!host) return; const p=ANIM.cur; const items=anAIGenItems(p);
  if(!items.length){ host.innerHTML=''; return; }
  const ready=items.filter(x=>p.images[x.id]).length; const cur=AI_IMG.id&&p.images[AI_IMG.id]?AI_IMG.id:null;
  host.innerHTML=`<div class="pn-sec ai-gen"><b>🎨 توليد الطبقات في Google Flow — ${ready}/${items.length} جاهزة</b>
   <ol class="ai-steps"><li>نزّل الصورة الأصلية لإرفاقها كمرجع: <button type="button" class="in-mini" id="gn-dl" ${cur?'':'disabled'}>⬇️ الصورة الأصلية</button></li>
    <li>افتح <a href="https://flow.google.com/" target="_blank" rel="noopener noreferrer">Google Flow</a> وأنشئ صورة: أرفق الصورة الأصلية كمرجع (Ingredients / Reference) والصق البرومبت. كرّر لكل بند تحت.</li>
    <li>سمّي الناتج بنفس رقم البند (<span dir="ltr">S01_IMG1.png</span>) وارفعه هنا — أو ارفعها كلها مرة واحدة بالترتيب.</li></ol>
   <div class="pn-grid2"><button type="button" id="gn-all">📋 نسخ الكل (بالترتيب)</button><button type="button" id="gn-miss" ${ready<items.length?'':'disabled'}>⏳ الناقص فقط</button></div>
   <label class="btn-like pri-lite pn-wide" for="gn-bulk">⬆️ رفع الصور المولّدة</label><input type="file" id="gn-bulk" accept="image/*" multiple hidden>
   <div class="gn-list">${items.map(x=>`<div class="gn-row${p.images[x.id]?' ok':''}"><div class="gn-h"><b dir="ltr">${esc(x.id)}</b><span>${AN_GEN_ROLE[x.role]||esc(x.role||'')}</span><i>${p.images[x.id]?'✓ جاهزة':'○ ناقصة'}</i></div><div class="gn-p" dir="ltr">${esc(x.prompt)}</div><div class="gn-b"><button type="button" class="in-mini" data-cp="${esc(x.id)}">📋 نسخ</button><label class="btn-like in-mini" for="gn-f-${esc(x.id)}">⬆️ رفع</label><input type="file" id="gn-f-${esc(x.id)}" data-up="${esc(x.id)}" accept="image/*" hidden></div></div>`).join('')}</div></div>`;
  const $g=q=>host.querySelector(q);
  $g('#gn-dl').onclick=async()=>{ const b=await animIdb.getBlob(p.images[cur]); if(b) animDownload(b,p.imageNames[cur]||'reference.png'); };
  const fmt=l=>l.map(x=>x.id+'\n'+x.prompt).join('\n\n');
  $g('#gn-all').onclick=()=>{ copyToClipboard(fmt(items)); toast('تم نسخ '+items.length+' برومبت — لكل واحد أرفق الصورة الأصلية',4000); };
  $g('#gn-miss').onclick=()=>{ const l=items.filter(x=>!p.images[x.id]); if(!l.length){ toast('كل الصور جاهزة 👌'); return; } copyToClipboard(fmt(l)); toast('تم نسخ '+l.length+' برومبت ناقص',3500); };
  $g('#gn-bulk').onchange=async e=>{ const f=Array.from(e.target.files); e.target.value=''; if(f.length) await animBulkImages(f); };
  host.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>{ const x=items.find(y=>y.id===b.dataset.cp); copyToClipboard(x.prompt); toast('تم نسخ البرومبت — أرفق معه الصورة الأصلية',3000); });
  host.querySelectorAll('[data-up]').forEach(inp=>inp.onchange=async e=>{ const f=e.target.files[0]; if(!f) return; animPushUndo(); await animSetImage(inp.dataset.up,f); await animLoadAssets(); await animRebuild(); animRefreshAll(); toast('تم ربط الصورة بـ '+inp.dataset.up,2500); });
}
