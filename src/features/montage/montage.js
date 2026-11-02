/* =========================================================================
   AI MONTAGE — video / audio  →  timed transcript  →  prompt  →  scene JSON  →  project
   The source media is cut into consecutive scenes; each scene gets its own slice of the
   original audio (with word timing, so "cue" words stay in sync) and, when the video is
   shown, a video layer that plays the matching part of the source underneath the animation.
   ========================================================================= */
const AN_MONT_STYLES=[
 {id:'auto',ic:'🤖',t:'الذكاء الاصطناعي يصمم الشكل',d:'يقرأ الكلام كله ويختار الشكل الأنسب (أو يمزج شكلين) ويثبّت ألوانه وخطوطه',brief:''},
 {id:'motion',ic:'🌀',t:'موشن جرافيك',d:'أشكال وأيقونات وأرقام تتحرك، ألوان جريئة',
  brief:'MOTION GRAPHICS / animated infographic. Flat vector look: bold geometric shapes, icons, big numbers, simple charts built from shape layers (rect bars) with counters, a palette of 3-4 saturated colours on a solid colour background (use the scene "background" hex, no background image needed). Every idea = a short punchy title (2-5 words) + an icon or small graphic + one supporting shape/number. Entrances: pop, squash, slide-blur-*, expand-x, elastic, stamp, word-pop, swirl; after entering give every element a gentle motion (float, breathe, pulse). Transitions: slide-*, push-*, zoom-in, whip (0.3-0.5 s). Use "count" on every number that is spoken. Fonts: Poppins / Bebas Neue for Latin, Lalezar / Reem Kufi / Noto Kufi Arabic for Arabic, text size 6-9. Element images are flat vector icons or illustrations on a flat green backdrop (key:"auto"), 2-5 per scene.'},
 {id:'kinetic',ic:'✍️',t:'تايبوجرافي متحرك',d:'الكلام نفسه هو الصورة: عبارات كبيرة تتحرك مع النطق',
  brief:'KINETIC TYPOGRAPHY. The text IS the visual. Split the narration into short phrases (2-5 words) shown as large text layers (size 9-16), each timed to its first spoken word with "cue" and leaving with "until" when the next phrase comes. Bold fonts, high contrast, alternate 2-3 accent colours, emphasise the key word of a phrase in the accent colour (a separate text layer with "attach"/same position or a mark "highlight"). Entrances: word-pop, word-rise, typewriter, slide-blur-*, stamp, zoom-blur; camera push/zoom on emphasis, shake on punch-lines. At most 1 supporting icon/image per scene; background = solid colour or one abstract gradient image. Transitions: whip, push-*, zoom-in, fade-black.'},
 {id:'explainer',ic:'🧠',t:'شرح بالرسوم والعلامات',d:'شخصيات وعناصر، أسهم ودوائر وعدادات على الكلام',
  brief:'ILLUSTRATED EXPLAINER with annotations. Per scene: 1 background + 1-3 character/object element images, callout labels attached to elements ("attach"), marks (circle / underline / arrow / check / cross / highlight) drawn on the key detail at the exact moment it is spoken, counters for numbers, gentle float/breathe on elements, camera zoom between focus points. One friendly flat-illustration style, identical in every scene (write the style block once and repeat it in every prompt). Transitions: fade, slide-*, wipe.'},
 {id:'documentary',ic:'🎞️',t:'وثائقي',d:'لقطات سينمائية كاملة بحركة كاميرا هادئة وعناوين سفلية',
  brief:'DOCUMENTARY / storytelling. Each scene is a full-frame photoreal image (35 mm look, natural light) with a slow camera move (zoom 1.05-1.15, pan), subtle effects (vignette, grain, grade, dust), lower-third labels (name / place / date) as text with a "box", very sparse on-screen text. 1-2 images per scene (alternate two shots for long scenes). Consistent look across all prompts. Transitions: fade, fade-black, soft push. Scenes 6-12 s.'},
 {id:'news',ic:'📰',t:'أخبار / تقرير',d:'عناوين سفلية، أرقام وإحصائيات، ألوان إذاعية',
  brief:'NEWS / REPORT broadcast graphics. Lower thirds, headline bars, source tags, statistics with counters, highlight marks on numbers, a clean palette (navy, white and one accent red), fonts Cairo / Tajawal / Poppins, confident fast entrances (slide-*, wipe, expand-x). Images: photoreal stills or clean infographic cards, 1-2 per scene. Transitions: wipe, push-*, slide-*.'},
 {id:'reels',ic:'📱',t:'ريلز / شورتس',d:'سريع وقوي: خطّاف، زوم، نص ضخم، إيقاع لاهث',
  brief:'SHORT-FORM VERTICAL (Reels / TikTok / Shorts). Hook in the first 2 seconds (huge text + zoom), scenes of 2-4 s, relentless pacing, big bold text (size 8-12) centred inside the safe area y 18-82, emoji-like icon images, a zoom punch-in on every beat, shake or glitch on emphasis (sparingly), sfx "pop"/"whoosh" on entrances. Transitions: whip, zoom-in, glitch — never slow fades.'},
 {id:'cinematic',ic:'🎬',t:'سينمائي',d:'ليتربوكس، تدرّج لوني، غبار وضباب، نص قليل وأنيق',
  brief:'CINEMATIC. Letterbox, filmic grade (dramatic / golden / night / faded), slow camera drift, light leaks, fog / dust / embers, minimal text (quotes or chapter titles in elegant fonts Amiri / El Messiri, size 5-7, fade / letter-fade). Moody photoreal or painterly prompts, 1-2 images per scene. Scenes 6-12 s. Transitions: fade, fade-black.'},
 {id:'podcast',ic:'🎙️',t:'بودكاست / صوتي',d:'بطاقات اقتباس وصور للموضوعات بإيقاع هادئ',
  brief:'PODCAST / AUDIO-FIRST. Calm, readable. A consistent background look (soft gradient or blurred textured image), a quote card (text with "box") for the key sentence of each scene, a small topic label, one illustrative image per scene with slow motion (breathe / kenburns), counters for figures. Entrances: fade, rise, word-fade. Scenes 8-15 s. Transitions: fade, soft slide.'},
 {id:'whiteboard',ic:'🖍️',t:'سبورة / رسم يد',d:'رسومات خطية تُرسم أمامك مع الكلام',
  brief:'WHITEBOARD / HAND-DRAWN. White paper background, black line-art element images with key:"white" revealed with enter "handdraw", marks and underlines with "draw", marker-style text, callouts. Steady hand-draw pace. Scenes 6-12 s. Transitions: wipe (wipe-rtl for Arabic), fade.'}
];
const AN_MONT_SHOW=[
 {id:'overlay',ic:'🎥',t:'الفيديو ظاهر + الأنيميشن فوقه',d:'نص وأيقونات وعلامات على لقطات الفيديو الأصلي',vid:true},
 {id:'anim',ic:'🖼️',t:'الصوت فقط + أنيميشن كامل',d:'نستخدم صوت الفيديو، والصورة كلها أنيميشن وصور مولّدة'},
 {id:'mix',ic:'🔀',t:'دمج الاثنين',d:'لقطات فيديو ولقطات أنيميشن بالتبادل',vid:true},
 {id:'auto',ic:'🤖',t:'الذكاء الاصطناعي يقرر لكل مشهد',d:'يختار فيديو/أنيميشن/نافذة صغيرة حسب المحتوى',vid:true}
];
const AN_MONT_LEN={short:['قصيرة 2–5 ث',4],medium:['متوسطة 5–9 ث',7],long:['طويلة 8–15 ث',11]};
const AN_MONT_DENS={calm:['هادئ — عناصر قليلة','1-3 layers per scene, lots of breathing room, one idea at a time'],balanced:['متوازن','3-6 layers per scene, a clear focal element, one callout or mark per idea'],rich:['غني — حركة كثيرة','5-9 layers per scene, layered depth, callouts, marks, counters and continuous motion on every element']};

function anMontState(p){
  const D={style:'auto',show:'auto',density:'balanced',len:'medium',captions:false,note:'',src:null,words:null};
  if(!p.montage||typeof p.montage!=='object') p.montage={};
  Object.keys(D).forEach(k=>{ if(p.montage[k]===undefined) p.montage[k]=D[k]; });
  return p.montage;
}
function anMontT(t){ t=Math.max(0,t); const m=Math.floor(t/60); const s=t-m*60; return m+':'+(s<10?'0':'')+s.toFixed(1); }

/* words → sentence-like segments */
function anMontSegments(words){
  const segs=[]; let cur=null;
  (words||[]).forEach((w,wi)=>{
    if(cur&&(w.s-cur.e>0.7||cur.ws.length>=18||w.e-cur.s>9)){ segs.push(cur); cur=null; }
    if(!cur) cur={s:w.s,e:w.e,ws:[],i0:wi};
    cur.ws.push(w); cur.e=w.e;
    if(/[.!?؟…。]["”»)]*$/.test(String(w.w))&&cur.ws.length>=3){ segs.push(cur); cur=null; }
  });
  if(cur) segs.push(cur);
  return segs.map(g=>({s:g.s,e:g.e,i0:g.i0,n:g.ws.length,text:g.ws.map(x=>x.w).join(' ')}));
}
/* ---- editing the transcript: words keep their timestamps; only the changed part is re-timed ---- */
function anMontTok(x){ return String(x||'').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}]+/gu,''); }
/* replace words[i0 .. i0+n-1] by the words of newText (spreads the time of the changed middle part) */
function anMontPatch(words,i0,n,newText){
  const nt=String(newText||'').trim().split(/\s+/).filter(Boolean); const old=words.slice(i0,i0+n);
  let a=0; while(a<old.length&&a<nt.length&&anMontTok(old[a].w)===anMontTok(nt[a])) a++;
  let b=0; while(b<old.length-a&&b<nt.length-a&&anMontTok(old[old.length-1-b].w)===anMontTok(nt[nt.length-1-b])) b++;
  for(let k=0;k<a;k++) old[k].w=nt[k]; for(let k=0;k<b;k++) old[old.length-1-k].w=nt[nt.length-1-k];
  const oi=i0+a, on=old.length-a-b, mid=nt.slice(a,nt.length-b);
  if(!on&&!mid.length) return;
  let s0,e0; if(on){ s0=words[oi].s; e0=words[oi+on-1].e; } else { const prev=words[oi-1], next=words[oi]; s0=prev?prev.e:(next?next.s:0); e0=next?Math.max(s0+0.1*mid.length,next.s):s0+0.3*mid.length; }
  if(!mid.length){ words.splice(oi,on); return; }
  if(mid.length===on){ for(let k=0;k<on;k++) words[oi+k].w=mid[k]; return; }
  const tot=mid.reduce((q,t)=>q+Math.max(1,t.length),0); let t=s0; const fresh=mid.map(tk=>{ const d=(e0-s0)*Math.max(1,tk.length)/tot; const o={w:tk,s:+t.toFixed(3),e:+(t+d).toFixed(3)}; t+=d; return o; });
  words.splice(oi,on,...fresh);
}
/* find a phrase (list of normalized tokens) in the words; returns start index or -1 (nearest to time `near` when given) */
function anMontFind(words,phrase,near){
  const toks=String(phrase||'').trim().split(/\s+/).map(anMontTok).filter(Boolean); if(!toks.length) return -1;
  let best=-1, bd=1e9;
  for(let i=0;i+toks.length<=words.length;i++){ let ok=true; for(let k=0;k<toks.length;k++) if(anMontTok(words[i+k].w)!==toks[k]){ ok=false; break; } if(!ok) continue; const d=near==null?i:Math.abs(words[i].s-near); if(d<bd){ bd=d; best=i; } if(near==null) break; }
  return best;
}
function anMontReplaceAll(words,find,repl){
  const n=String(find||'').trim().split(/\s+/).filter(Boolean).length; let c=0, from=0;
  while(n){ const sub=words.slice(from); const i=anMontFind(sub,find,null); if(i<0) break; anMontPatch(words,from+i,n,repl); c++; from=from+i+Math.max(1,String(repl||'').trim().split(/\s+/).filter(Boolean).length); }
  return c;
}
/* split the whole timeline into parts the AI can answer in one reply (about 25 scenes each) */
const AN_MONT_SPLIT=[['auto','تلقائي (≈25 مشهد في الجزء)'],['m2','كل ~2 دقيقة'],['m3','كل ~3 دقايق'],['m5','كل ~5 دقايق'],['m10','كل ~10 دقايق'],['n2','جزئين'],['n3','3 أجزاء'],['n4','4 أجزاء'],['n6','6 أجزاء'],['n10','10 أجزاء']];
function anMontPartState(M,pt){ const p=ANIM.cur; const n=p.scenes.filter(s=>s.raw&&s.raw._mont&&s.raw._mont.from>=pt.a-0.6&&s.raw._mont.to<=pt.b+0.6).length; return n; }
function anMontEst(M,pt){ return Math.max(1,Math.round((pt.b-pt.a)/(AN_MONT_LEN[M.len]||AN_MONT_LEN.medium)[1])); }
function anMontParts(M){
  const total=M.src.dur, segs=anMontSegments(M.words);
  const sp=String(M.split||'auto'); let partSec=Math.max(60,25*(AN_MONT_LEN[M.len]||AN_MONT_LEN.medium)[1]);
  if(/^m\d+$/.test(sp)) partSec=Math.max(5,+sp.slice(1)*60); else if(/^n\d+$/.test(sp)) partSec=Math.max(5,total/Math.max(1,+sp.slice(1)));
  const parts=[]; let a=0, cur=[];
  segs.forEach(sg=>{ cur.push(sg); if(sg.e-a>=partSec){ parts.push({a,b:sg.e,segs:cur}); a=sg.e; cur=[]; } });
  if(cur.length){ const last=parts[parts.length-1]; if(last&&cur[cur.length-1].e-a<partSec*0.3){ last.segs=last.segs.concat(cur); last.b=cur[cur.length-1].e; } else parts.push({a,b:cur[cur.length-1].e,segs:cur}); }
  if(!parts.length) parts.push({a:0,b:total,segs:[]});
  parts[0].a=0; parts[parts.length-1].b=total;
  return parts;
}
/* pauses between words = the only places a scene may be cut */
function anMontCuts(words,total){
  const g=[{e:0,s:words.length?words[0].s:0}];
  for(let i=0;i<words.length-1;i++) g.push({e:words[i].e,s:Math.max(words[i].e,words[i+1].s),end:/[.!?؟…。]["”»)]*$/.test(String(words[i].w))});
  g.push({e:words.length?words[words.length-1].e:total,s:total});
  return g;
}
/* snap a wanted cut time into the best nearby pause: big pauses and sentence ends win */
function anMontSnap(cuts,t,maxd){
  const lim=maxd||1.2; let best=null, bs=1e9;
  for(let i=1;i<cuts.length-1;i++){ const c=cuts[i]; const d=t<c.e?c.e-t:(t>c.s?t-c.s:0); if(d>lim) continue;
    const sc=d-Math.min(1,c.s-c.e)*0.6-(c.end?0.3:0); if(sc<bs){ bs=sc; best=c; } }
  if(!best) return t;
  const gap=best.s-best.e; return gap<0.04?(best.e+best.s)/2:(gap<=0.8?(best.e+best.s)/2:best.s-0.4);
}

/* ---------------- the prompt ---------------- */
function anMontSchema(ratio){
  const L=[], lay=true, tts=false;
/*__SCHEMA__*/
  return L.join('\n');
}
function anMontShowRule(M,isVid,part){
  if(!isVid) return 'The source is AUDIO ONLY (no video picture). Set "source":{"show":"none"} in every scene. The animation is the entire picture: a background plus elements, text and marks.';
  if(M.show==='anim') return 'AUDIO ONLY MODE: use the sound of the source but NEVER show its video image. Set "source":{"show":"none"} in every scene. The animation is the entire picture: a background plus elements, text and marks.';
  if(M.show==='overlay') return 'VIDEO + ANIMATION MODE: the original video is ALWAYS visible. Every scene has "source":{"show":"full"} (video fills the frame — do NOT add any full-frame background image) or, when a graphic needs most of the screen, "source":{"show":"pip","pip":{"x":78,"y":76,"w":34}} (small video window over your own background). Default to "full". The animation (text, icons, callouts, marks, lower thirds, element images, effects) is layered ON TOP of the video: keep the speaker\'s face and the main subject clear, prefer lower thirds, side callouts, corner icons, highlighted keywords and kinetic text. Use "source.dim" (0-0.5) only when text needs more contrast.';
  if(M.show==='mix') return 'MIX MODE: alternate on purpose. About 40-50% of the scenes show the video ("source":{"show":"full"} with overlay graphics, no background image) and the rest are full-animation scenes ("source":{"show":"none"}, with their own background). Use animation scenes when the speaker explains something abstract, lists facts or numbers, or the footage is visually weak; use video scenes for the hook, emotional moments, demonstrations and the closing. Never more than 3 consecutive scenes of the same kind.';
  return 'YOU DECIDE PER SCENE what the viewer sees: "source":{"show":"full"} = the original video fills the frame with your graphics layered on top (no background image); "source":{"show":"pip","pip":{"x":78,"y":76,"w":34}} = a small video window over your own background; "source":{"show":"none"} = a full animation scene with its own background. Decide from the content: speaker on camera, demonstration or emotion → "full"; abstract idea, list, statistics, definition → "none" (or "pip" when the speaker should stay visible); open with the video (the hook). Vary the rhythm and never more than 3 consecutive scenes of the same kind. Keep faces and the main subject clear of overlays.';
}
function anMontPrompt(pi){
  const p=ANIM.cur, M=anMontState(p); const parts=anMontParts(M); const part=parts[Math.min(pi,parts.length-1)]; const n=parts.length;
  const isVid=M.src.kind==='video'; const ratio=p.ratio;
  const style=AN_MONT_STYLES.find(x=>x.id===M.style)||AN_MONT_STYLES[0];
  const all=M.words.map(w=>w.w).join(' '); const ar=(all.match(/[؀-ۿ]/g)||[]).length>all.length*0.25;
  const langName=ar?'Arabic (keep the speaker\'s own dialect and wording)':'the same language as the speech';
  const lenR=AN_MONT_LEN[M.len]||AN_MONT_LEN.medium; const lenTxt={short:'2-5 seconds',medium:'5-9 seconds',long:'8-15 seconds'}[M.len]||'5-9 seconds';
  const prevMax=p.scenes.reduce((m,s)=>(s.raw&&s.raw._mont&&s.raw._mont.to<=part.a+0.2)?Math.max(m,+s.data.scene||0):m,0);
  const startNo=pi===0?1:(prevMax?prevMax+1:pi*60+1);
  const L=[];
  L.push('You are a senior motion-graphics editor and art director. Below is the timed transcript of a '+(isVid?'VIDEO':'AUDIO recording')+' ('+anMontT(M.src.dur)+' long, file "'+M.src.name+'"). Re-edit it as a finished animated video: cut the timeline into consecutive scenes, and for every scene design the picture — image prompts for an AI image generator plus a complete layer-by-layer animation that follows the words as they are spoken.');
  L.push('');
  L.push('=== PROJECT ===');
  L.push('- Frame: '+ratio+'. Language of the speech: '+langName+'. All on-screen text is in that language; image prompts are always in English.');
  if(n>1) L.push('- This is PART '+(pi+1)+' of '+n+'. Cover ONLY the time range '+part.a.toFixed(2)+' s → '+part.b.toFixed(2)+' s. Number the scenes from '+startNo+'. Image IDs follow the scene number (S'+String(startNo).padStart(2,'0')+'_IMG1 …). Re-use the visual identity (palette, fonts, illustration style) of the other parts: it is fixed by the style brief below.');
  else L.push('- Cover the whole recording: '+part.a.toFixed(2)+' s → '+part.b.toFixed(2)+' s. Number the scenes from 1.');
  L.push('');
  if(pi>0){
    const prev=p.scenes.filter(s=>s.raw&&s.raw._mont&&s.raw._mont.to<=part.a+0.3).sort((x,y)=>x.raw._mont.from-y.raw._mont.from);
    if(prev.length){ const last=prev[prev.length-1]; const imgs=[]; prev.forEach(s=>(s.data.images||[]).forEach(im=>{ if(im.prompt&&!imgs.some(x=>x.id===im.id)) imgs.push(im); }));
      L.push('=== CONTINUITY (the previous parts are already built) ===');
      L.push('- The previous part ended with scene '+last.data.scene+(last.data.title?' "'+last.data.title+'"':'')+': «'+String(last.raw.voiceover||'').slice(0,140)+'». Continue naturally from there.');
      if(imgs.length){ L.push('- These images already exist. RE-USE them by ID in "src" whenever the same place, character or object returns; do NOT list them again in "images", and never redefine them:'); imgs.slice(-24).forEach(im=>L.push('  * '+im.id+' ('+(im.role||'image')+'): '+String(im.prompt).replace(/\s+/g,' ').slice(0,110))); }
      L.push('');
    }
  }
  L.push('=== MONTAGE STYLE: '+style.t+' ===');
  if(style.id==='auto'&&pi>0&&M.decided){
    L.push('The look was already decided in part 1 — use EXACTLY the same style, palette, fonts, transitions and image style (copy them into project.style / project.palette): '+JSON.stringify(M.decided)+'.');
  } else if(style.id==='auto'){
    L.push('The user lets YOU design the look. First read the whole transcript and decide the single best visual style for THIS content (or a deliberate blend of two) from the catalogue below. Write your choice in project.style (the catalogue id, or "custom") and one sentence of reasoning in project.style_note, then fix a palette (3-4 hex colours), at most 2 fonts, a transition language and one image style, and apply them consistently in every scene. You may invent a style that is not in the catalogue.');
    L.push('Catalogue:');
    AN_MONT_STYLES.filter(x=>x.id!=='auto').forEach(x=>L.push('* '+x.id+' ('+x.t+'): '+x.brief));
  } else L.push(style.brief);
  L.push('- Density: '+AN_MONT_DENS[M.density][1]+'.');
  L.push('- Scene length: '+lenTxt+' on average — cut only at sentence or phrase boundaries (use the timestamps), never in the middle of a phrase. Very short sentences may be merged; a long sentence may be split at a natural pause.');
  if(M.note&&M.note.trim()) L.push('- EXTRA DIRECTION FROM THE USER (highest priority): '+M.note.trim());
  L.push('');
  L.push('=== WHAT THE VIEWER SEES ===');
  L.push(anMontShowRule(M,isVid,part));
  L.push('');
  L.push('=== TRANSCRIPT WITH TIMESTAMPS (seconds from the start of the original file; the app knows the exact time of every word) ===');
  part.segs.forEach(sg=>L.push('['+sg.s.toFixed(2)+' – '+sg.e.toFixed(2)+'] '+sg.text));
  L.push('');
  if(M.fix!==false){
    L.push('=== TRANSCRIPT CHECK ===');
    L.push('The transcript above comes from speech recognition and may contain mistakes: misheard or split words, wrong homophones, mangled names, brands and technical terms, wrong numbers, broken sentences. Read it as a whole, use the context to find the mistakes and silently use the CORRECT words everywhere you write (voiceover, on-screen text, image prompts, "cue" words). List EVERY fix in "project.corrections": [{"at":<seconds where the wrong words start>,"was":"<the wrong words exactly as written in the transcript>","now":"<the correct words>"}]. Fix only real recognition errors — never restyle, shorten or translate; keep the speaker\'s dialect and wording; if you are not sure, leave it unchanged.');
    L.push('');
  }
  L.push('=== SCENE RULES ===');
  L.push('- Every scene has "from" and "to" = seconds in the ORIGINAL file. Scenes are consecutive and cover the range with no gaps and no overlaps: the first "from" is '+part.a.toFixed(2)+', each "from" equals the previous "to", the last "to" is '+part.b.toFixed(2)+'. "duration" = to − from.');
  L.push(M.fix!==false?'- "voiceover" = the transcript text of the scene with your corrections applied (see TRANSCRIPT CHECK) — do not translate or rewrite it otherwise. The app attaches the real audio slice of the scene.':'- "voiceover" = the exact transcript text of the scene, copied as is (do not translate, correct or rewrite). The app attaches the real audio slice of the scene.');
  L.push('- All times inside a scene ("enter.at", "motion.from", "camera.from", "sfx.at"…) are seconds from the START OF THAT SCENE, not of the file. Prefer "cue" (an exact word or 2-3 consecutive words spoken in this scene) over seconds for every layer except the first one, so that each element appears exactly when it is said.');
  L.push('- Add to every scene the field "source" described above: {"show":"full"|"pip"|"none","dim":0-0.5,"pip":{"x":…,"y":…,"w":…}} ("dim" and "pip" only when needed).');
  L.push('- Image prompts: complete, standalone, in English, with the style block repeated, the aspect ratio '+ratio+', and "no text, no watermark". Element images (characters, objects, icons) are isolated on a perfectly flat solid pure green (#00FF00) background with no shadow, so the app can remove it ("key":"auto"). Scenes that show the video need no background image; scenes with "show":"none" need one. Keep the number of images sensible (a scene normally needs 1-4); re-use an image by its ID when the same thing returns.');
  L.push('- On-screen text is a short headline, a keyword, a number or a label (1-6 words) — never a copy of the whole sentence (the app can add captions on its own).');
  L.push('- Think like an editor: a strong first scene (hook), visual rhythm that changes every few scenes, emphasis on the key words, and a clear last scene.');
  L.push('');
  L.push('=== OUTPUT ===');
  L.push('Reply with ONE ```json block containing {"project":{…},"scenes":[…]} (strict JSON: double quotes, no comments, no trailing commas, numbers as numbers) and, outside it, at most one short line. Positions are % of the frame ('+ratio+') unless "place":"image"; x,y = layer CENTRE; w = width %; text "size" = % of frame height.');
  L.push('project = {"title":"…","ratio":"'+ratio+'","language":"…","part":'+(pi+1)+',"parts":'+n+',"range":['+part.a.toFixed(2)+','+part.b.toFixed(2)+']'+(M.fix!==false?',"corrections":[{"at":0.0,"was":"…","now":"…"}]':'')+(style.id==='auto'?',"style":"…","style_note":"…","palette":["#…","#…","#…"]':'')+'}');
  L.push('');
  L.push('=== SCENE FORMAT AND ANIMATION VOCABULARY (the app understands exactly these names) ===');
  L.push(anMontSchema(ratio));
  L.push('  Additional fields for this montage, in EVERY scene object: "from": 0.0, "to": 0.0, "source": {"show":"full|pip|none"} — everything else is as in the format above ("voiceover", "images", "layers", "camera", "effects", "transition", "sfx"). In scenes where the video is shown ("full"/"pip") omit the full-frame background layer and its image.');
  return L.join('\n');
}

/* ---------------- source media ---------------- */
async function anMontBuf(){
  const p=ANIM.cur, M=anMontState(p); if(!M.src) return null;
  if(ANIM._montBuf&&ANIM._montBuf.id===M.src.id) return ANIM._montBuf.buf;
  const b=await animIdb.getBlob(M.src.key); if(!b) throw new Error('ملف المصدر اتمسح من المكتبة — ارفعه تاني');
  const buf=await animDecode(await b.arrayBuffer()); ANIM._montBuf={id:M.src.id,buf}; return buf;
}
async function anMontPick(file){
  const p=ANIM.cur, M=anMontState(p); const kind=animKindOf(file);
  if(kind!=='video'&&kind!=='audio'){ toast('ارفع ملف فيديو أو صوت'); return; }
  if(file.size>1.2e9){ toast('الملف كبير جدًا للمتصفح (أكتر من 1.2GB) — قصّه أو صغّره الأول'); return; }
  toast('جارِ قراءة الصوت من «'+file.name+'»…',6000);
  let buf; try{ buf=await animDecode(await file.arrayBuffer()); }
  catch(e){ toast(kind==='video'?'المتصفح ما قدرش يقرا صوت الفيديو ده. جرّب MP4 (H.264 + AAC) أو ارفع الصوت لوحده.':'تعذّر قراءة ملف الصوت — جرّب MP3 أو WAV',6000); return; }
  if(M.src&&M.src.id){ /* replace the previous source */ const old=p.media.find(m=>m.id===M.src.id); if(old) p.media=p.media.filter(m=>m!==old); }
  const added=await animAddMedia([file],{noMatch:true,noUndo:true}); const m=added&&added[0]; if(!m){ toast('ما قدرتش أضيف الملف للمكتبة'); return; }
  let w=0,h=0; if(kind==='video'){ const v=ANIM.assets&&ANIM.assets.videos&&ANIM.assets.videos[m.id]; if(v){ w=v.videoWidth||0; h=v.videoHeight||0; } }
  M.src={id:m.id,key:m.key,name:file.name,kind,dur:buf.duration,w,h}; M.words=null; ANIM._montBuf={id:m.id,buf};
  if(!p.scenes.length&&w&&h){ const ar=w/h; p.ratio=ar>1.5?'16:9':(ar>1.15?'4:3':(ar>0.9?'1:1':(ar>0.7?'3:4':'9:16'))); }
  if(kind==='audio'&&M.show!=='anim') M.show='anim';
  animSaveSoon(); animRenderPanel(); try{ animSizeCanvas(); }catch(e){}
  toast('تم — '+fmtDur(buf.duration)+(kind==='video'&&w?' · '+w+'×'+h:''),3500);
}

/* ---------------- apply the AI reply ---------------- */
function anMontShift(raw,fromZ,by){ (raw.layers||[]).forEach(l=>{ if((+l.z||0)>=fromZ) l.z=(+l.z||0)+by; }); }
function anMontInject(raw,M,from,to,warns,no){
  const isVid=M.src.kind==='video'; const s=raw.source&&typeof raw.source==='object'?raw.source:{};
  let show=String(s.show||'').toLowerCase();
  if(!['full','pip','none'].includes(show)) show=M.show==='overlay'?'full':'none';
  if(!isVid||M.show==='anim') show='none'; else if(M.show==='overlay'&&show==='none') show='full';
  raw.layers=Array.isArray(raw.layers)?raw.layers:[]; raw.source={show};
  if(show==='none'){ if(!raw.background) raw.background='#0B0D12'; return show; }
  raw.background='#000000';
  const vid={id:'SRC',type:'video',src:M.src.id,trimIn:+from.toFixed(3),muted:true,volume:0,loop:false,speed:1};
  if(show==='full'){
    const before=raw.layers.length;
    raw.layers=raw.layers.filter(l=>!(l.type==='image'&&l.fit==='cover'&&(+l.z||0)<=0&&!l.crop));
    if(raw.layers.length<before) warns.push('مشهد '+no+': تم حذف صورة الخلفية لأن الفيديو ظاهر');
    if(Array.isArray(raw.images)){ const used=new Set(raw.layers.map(l=>l.src)); raw.images=raw.images.filter(im=>used.has(im.id)); }
    anMontShift(raw,0,1); const dim=Math.max(0,Math.min(0.7,+s.dim||0));
    Object.assign(vid,{fit:'cover',z:0}); raw.layers.unshift(vid);
    if(dim>0.01) raw.layers.push({id:'DIM',type:'shape',shape:'rect',fill:true,color:'#000000',opacity:dim,x:50,y:50,w:100,h:100,z:0.5});
  } else {
    const pp=Object.assign({x:78,y:76,w:34},s.pip&&typeof s.pip==='object'?s.pip:{});
    anMontShift(raw,1,1);
    Object.assign(vid,{fit:'contain',x:+pp.x,y:+pp.y,w:+pp.w,mask:'rounded',fx:{shadow:true,border:'#FFFFFF'},z:1});
    raw.layers.push(vid);
  }
  return show;
}
async function anMontApply(text,onProg,force){
  const p=ANIM.cur, M=anMontState(p); const E=await animEnsureEngine();
  if(!M.src||!M.words||!M.words.length) return {errors:['حوّل الكلام لنص الأول (الخطوة 2).'],added:0};
  const {objects,errors,meta}=E.extractJsonObjects(text); const prompts=E.extractPrompts(text);
  const errs=errors.slice(), warns=[];
  let fixed=0; const missed=[];
  if(meta&&Array.isArray(meta.corrections)&&M.fix!==false){
    if(!M.orig) M.orig=JSON.parse(JSON.stringify(M.words));
    meta.corrections.forEach(c=>{ if(!c||!c.was||c.now==null) return; const at=isFinite(+c.at)?+c.at:null; const i=anMontFind(M.words,c.was,at);
      if(i<0||(at!=null&&Math.abs(M.words[i].s-at)>20)){ missed.push(String(c.was)); return; }
      anMontPatch(M.words,i,String(c.was).trim().split(/\s+/).filter(Boolean).length,String(c.now)); fixed++; });
    if(fixed) M.fixes=(M.fixes||0)+fixed;
  }
  let sc=objects.filter(o=>o&&Array.isArray(o.layers||[])&&(o.layers||o.images));
  const noTime=sc.filter(o=>!(isFinite(+o.from)&&isFinite(+o.to)&&+o.to>+o.from));
  if(noTime.length) errs.push(noTime.length+' مشهد من غير from/to صحيحين — اتتجاهلوا.');
  sc=sc.filter(o=>isFinite(+o.from)&&isFinite(+o.to)&&+o.to>+o.from).sort((a,b)=>+a.from-+b.from);
  if(!sc.length) return {errors:errs.length?errs:['ما لقيتش مشاهد في النص. الصق رد الذكاء الاصطناعي كاملًا.'],added:0};
  const buf=await anMontBuf(); const total=M.src.dur; const cuts=anMontCuts(M.words,total);
  const rg=force?force.slice():(meta&&Array.isArray(meta.range)?meta.range.map(Number):null);
  const a0=rg&&isFinite(rg[0])?Math.max(0,rg[0]):(+sc[0].from<=1.5?0:+sc[0].from);
  const b0=rg&&isFinite(rg[1])?Math.min(total,rg[1]):(+sc[sc.length-1].to>=total-1.5?total:+sc[sc.length-1].to);
  /* boundaries snapped to pauses, strictly increasing */
  let B=[a0]; for(let k=1;k<sc.length;k++){ let t=anMontSnap(cuts,+sc[k].from); if(t<B[B.length-1]+0.5) t=B[B.length-1]+0.5; B.push(t); }
  let n=sc.length; while(n>1&&B[n-1]>b0-0.4){ n--; warns.push('مشهد '+(sc[n].scene!=null?sc[n].scene:n+1)+' تجاوز نهاية الجزء — اتشال'); }
  sc=sc.slice(0,n); B=B.slice(0,n); B.push(b0);
  animPushUndo();
  /* drop earlier montage scenes inside this range (re-running a part replaces it) */
  const gone=p.scenes.filter(s=>s.raw&&s.raw._mont&&s.raw._mont.from<b0-0.05&&s.raw._mont.to>a0+0.05);
  gone.forEach(s=>{ if(s.audioKey){ animIdb.delBlob(s.audioKey).catch(()=>{}); delete ANIM.buffers[s.audioKey]; } });
  p.scenes=p.scenes.filter(s=>!gone.includes(s));
  const taken=new Set(p.scenes.map(s=>+s.data.scene)); let maxNo=p.scenes.reduce((m,s)=>Math.max(m,+s.data.scene||0),0);
  const nums=sc.map(o=>+o.scene); const clash=nums.some((x,i)=>!isFinite(x)||taken.has(x)||nums.indexOf(x)!==i);
  const fresh=[]; const base=p.name.replace(/\.[^.]+$/,'');
  for(let k=0;k<n;k++){
    const raw=JSON.parse(JSON.stringify(sc[k])); const from=B[k], to=B[k+1];
    const newNo=clash?(maxNo+1+k):nums[k];
    if(clash&&isFinite(nums[k])&&nums[k]!==newNo){ /* keep image ids in step with the new scene number */
      const o2=String(nums[k]).padStart(2,'0'), n2=String(newNo).padStart(2,'0'); const re=new RegExp('\\bS0*'+nums[k]+'_IMG(\\d+)','g');
      const fix=s=>String(s).replace(re,(m,d)=>'S'+n2+'_IMG'+d); const j=JSON.parse(fix(JSON.stringify(raw))); Object.keys(raw).forEach(x=>delete raw[x]); Object.assign(raw,j);
      Object.keys(prompts).forEach(id=>{ if(new RegExp('^S0*'+nums[k]+'_IMG').test(id)){ prompts[fix(id)]=prompts[id]; delete prompts[id]; } });
    }
    const P=anMontPieces(M,from,to), map=anMontMap(P);
    raw.scene=newNo; raw.duration=+anMontPDur(P).toFixed(3);
    const ws=M.words.filter(w=>w.s>=from-0.02&&w.s<to-0.02).map(w=>{ const s0=map(Math.max(from,w.s)), e0=map(Math.min(to,w.e)); return {w:w.w,s:Math.max(0,s0),e:Math.max(s0+0.05,e0)}; });
    raw.voiceover=ws.map(w=>w.w).join(' ');
    anMontInject(raw,M,from,to,warns,newNo);
    anMontPieceLayers(raw,P);
    raw._mont={from:+from.toFixed(3),to:+to.toFixed(3),src:M.src.id}; if(P.length>1||P[0][0]!==from||P[0][1]!==to) raw._mont.pieces=P;
    const it={uid:uid(),raw,data:null,audioKey:null,audioName:'',audioDur:null};
    animNorm(it,fresh.length);
    if(!it.data){ errs.push('مشهد '+newNo+': ما اتقراش'); continue; }
    const blob=anWavBlobPieces(buf,P); const f=new File([blob],base+'_m'+String(newNo).padStart(3,'0')+'.wav',{type:'audio/wav'});
    if(await animSetAudio(it,f)){ it.audioSrc={name:M.src.name,from:+P[0][0].toFixed(3),to:+P[P.length-1][1].toFixed(3)}; if(ws.length) it.asr={src:'whisper',key:it.audioKey,words:ws}; }
    (it.warnings||[]).forEach(x=>warns.push('مشهد '+newNo+': '+x));
    fresh.push(it); if(onProg) onProg(k+1,n);
  }
  Object.assign(p.prompts,prompts);
  p.scenes=p.scenes.concat(fresh);
  if(p.scenes.every(s=>s.raw&&s.raw._mont)) p.scenes.sort((a,b)=>a.raw._mont.from-b.raw._mont.from);
  if(meta&&meta.title&&/جديد|تجريبي|^فيديو أنيميشن|^مونتاج/.test(p.name)) p.name=String(meta.title).slice(0,80);
  p.captions.on=!!M.captions;
  if(meta&&(meta.style||meta.palette)&&(!M.decided||a0<1)) M.decided={style:meta.style||null,note:meta.style_note||'',palette:meta.palette||null};
  M.applied=(M.applied||0)+1; animSaveSoon(); await animLoadAssets(); await animRebuild();
  return {added:fresh.length,fixed,missed,replaced:gone.length,errors:errs,warnings:warns,prompts:Object.keys(prompts).length,range:[a0,b0],style:meta&&meta.style};
}

