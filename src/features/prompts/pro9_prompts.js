/* ===== prompt upgrade: frame-aware typography / layout spec for every montage & animation prompt ===== */
(function(){
  const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
  const r1=v=>(Math.round(v*10)/10);
  function frame(ratio){
    const rr=(typeof ANIM_RATIOS!=='undefined'&&ANIM_RATIOS[ratio])||[9,16]; const wu=rr[0],hu=rr[1], land=wu>=hu;
    const Wp=Math.round(land?1080*wu/hu:1080), Hp=Math.round(land?1080:1080*hu/wu); const asp=wu/hu;
    const orient=asp<0.9?'portrait':(asp>1.15?'landscape':'square'); return {ratio,wu,hu,Wp,Hp,asp,orient};
  }
  function anFrameSpec(ratio,opt){
    opt=opt||{}; const F=frame(ratio), Wp=F.Wp, Hp=F.Hp; const o=F.orient;
    const f=o==='portrait'?1:(o==='square'?0.92:0.82);      /* perceived-size factor: landscape text is read on bigger/farther screens, portrait on a phone */
    const cap=(typeof ANIM!=='undefined'&&ANIM.cur&&ANIM.cur.captions)||{}; const capOn=!!(cap.on||opt.captions);
    const capY=cap.y!=null?+cap.y:(cap.pos==='top'?14:(cap.pos==='middle'?50:84)); const capH=r1(2*(+cap.size||5.2)*1.32);
    const L=[];
    L.push('=== FRAME & TYPOGRAPHY SPEC for '+ratio+' ('+o+' frame, '+Wp+'×'+Hp+' px reference) — obey it numerically ===');
    L.push('UNITS (the #1 source of broken layouts): x and w are % of the frame WIDTH, y is % of the frame HEIGHT, and text "size" is % of the frame HEIGHT. The same number does not look the same in every ratio: in this frame "size":1 = '+r1(Hp/100)+' px tall text and "w":10 = '+Math.round(Wp/10)+' px wide. Layer x,y is the CENTRE of the layer. The app clamps everything to a 5% margin, so a layer that needs more room is squeezed — size it correctly instead of relying on the clamp.');
    /* safe area */
    const yTop=o==='portrait'?10:8, yBot=o==='portrait'?80:(o==='square'?(F.asp<1?86:90):92);
    L.push('SAFE AREA: keep every important element and all text inside x 6–94 and y '+yTop+'–'+yBot+'.'+(o==='portrait'?' The top 8% and the bottom 16–20% are covered by the app/platform interface on Reels, Shorts and TikTok — nothing essential there (a background may bleed into it).':'')+(capOn?' AUTO-CAPTIONS ARE ON: the app writes the spoken words centred at y '+capY+' in a band about '+capH+'% tall (y '+r1(capY-capH/2)+'–'+r1(capY+capH/2)+'). Never place text, labels, marks or key parts of an element in that band.':' (Auto-captions, if the user turns them on later, occupy y ~84 — avoid putting essential text exactly there.)'));
    /* type ladder */
    const lad=[['hero — 1-3 words: the hook, one number',150],['display — a short title',108],['headline — a key phrase',78],['body / quote — a full sentence',56],['label / callout — tag next to an element',44]];
    L.push('TYPE LADDER ("size" values for THIS ratio; at full-screen on a phone the smallest readable text is '+r1(40*f/Hp*100)+' — never go below it):');
    lad.forEach(([n,px])=>{ const real=px*f; const sz=r1(real/Hp*100); const w=86; const cAr=Math.max(1,Math.floor(Wp*w/100/(0.46*real))), cLa=Math.max(1,Math.floor(Wp*w/100/(0.56*real))); L.push('  - '+n+': size '+sz+' (≈'+Math.round(real)+' px) → at w '+w+' about '+cAr+' Arabic / '+cLa+' Latin characters fit on one line');});
    L.push('FITTING TEXT — do this arithmetic for every text layer before writing it: characters per line ≈ (frame width px × w/100) ÷ (0.46 × font px) for Arabic, ÷ (0.56 × font px) for Latin, where font px = '+Hp+' × size/100. Number of lines = ceil(characters ÷ characters per line). Block height in % of the frame height = lines × size × lineHeight (1.35 default; use "lineHeight":1.55 for Arabic with diacritics). The block must fit its zone below; if it does not, shorten the text first, then reduce size (not below the ladder floor), then widen w (max 90) — never let it spill or rely on the clamp. Limits: hero ≤ 2 lines, display ≤ 2, headline ≤ 3, body ≤ 4 lines; at most '+(o==='landscape'?4:3)+' text layers visible at the same time; leave ≥ 2% of the height between stacked text blocks.');
    /* zones */
    const Z=o==='portrait'?['title zone y 10–22','upper content y 22–42','centre (hero element) y 40–62','lower content / labels y 62–78'+(capOn?' (captions band below)':''),'reserved y 80–96 (platform UI / captions)']
      :(o==='landscape'?['title band y 8–22 (x 6–94)','split layout: text column x 6–46 + element column x 54–94 (mirror it for right-to-left languages: text on the RIGHT)','centre stage x 25–75, y 25–72','lower third y 72–90, x 6–62'+(capOn?' (captions band at y '+capY+')':'')]
      :['title zone y 8–20','centre stage y 22–68','lower content y 68–86'+(capOn?' (captions band at y '+capY+')':'')]);
    L.push('LAYOUT ZONES: '+Z.join(' · ')+'. Compose each scene from these zones (one focal element, one text block, at most one supporting element) instead of scattering layers.');
    /* elements */
    const shortPx=Math.min(Wp,Hp); const pw=px=>Math.round(px/Wp*1000)/10;
    L.push('ELEMENT SIZES ("w" is % of frame width; element images are roughly square unless stated): hero element w '+pw(shortPx*0.40)+'–'+pw(shortPx*0.62)+'; secondary elements w '+pw(shortPx*0.20)+'–'+pw(shortPx*0.34)+'; icons / small props w '+pw(shortPx*0.10)+'–'+pw(shortPx*0.18)+'. A wide element (banner, bar, map) may reach w 88. Keep each element fully inside the safe area: a square hero element of w '+pw(shortPx*0.40)+'–'+pw(shortPx*0.62)+' is '+r1(pw(shortPx*0.40)*Wp/Hp)+'–'+r1(pw(shortPx*0.62)*Wp/Hp)+'% of the frame HEIGHT tall, so for the largest size its centre y must lie between '+r1(yTop+pw(shortPx*0.62)/2*Wp/Hp)+' and '+r1(yBot-pw(shortPx*0.62)/2*Wp/Hp)+' and its centre x between '+r1(6+pw(shortPx*0.62)/2)+' and '+r1(94-pw(shortPx*0.62)/2)+' (smaller elements have proportionally more room). Never let two elements overlap by more than 15% unless one is a deliberate background/frame.');
    L.push('IMAGE COMPOSITION: write every image prompt for the '+ratio+' frame: '+(o==='portrait'?'vertical composition, the focal subject in the middle 55% of the height, calm low-detail area (sky, floor, soft gradient) in the top 22% and bottom 22% where titles and captions will sit':(o==='landscape'?'wide composition, focal subject on a third line (not dead centre) so a text column fits on the opposite side, calm low-detail area on that side':'balanced centred composition, focal subject in the middle 60%, calm margins'))+'. Background plates must contain no text, no logos, no UI.');
    /* fonts */
    L.push('FONTS (the only ones the app loads — "font" must be one of them): Arabic-capable → Cairo (clean, weights 600–900: default for headlines and body), Tajawal (narrower — best for tall narrow columns and long Arabic lines), Noto Kufi Arabic and Reem Kufi (geometric headlines), Lalezar (heavy display for hooks and numbers), El Messiri (elegant titles), Amiri / Lateef / Aref Ruqaa (naskh and calligraphic: quotes, verses, contemplative style; use at body size or larger), IBM Plex Sans Arabic / Almarai (neutral body), Changa / Marhey / Rakkas (playful, display only). Latin-only → Inter, Poppins, Montserrat, Bebas Neue, Oswald, Playfair Display, Caveat, Permanent Marker: NEVER use these for Arabic text (the letters fall back to a random font). Use at most 2 fonts in the whole video (one for titles, one for body) and keep them identical in every scene.');
    L.push('TEXT STYLING: weight 800–900 for hero/display, 700 for headline/label, ≥ 600 for anything on top of a photo or video; over video or busy images always add a "box" (e.g. "rgba(0,0,0,0.55)") or a "stroke" colour with "shadow":true; contrast of text vs. what is behind it ≥ 4.5:1 (white on dark, or near-black on light); "italic" never for Arabic; keep the line length of body text at 20–34 Arabic characters. Centre-aligned for 1-3 line blocks, "align":"right" for Arabic paragraphs of 3+ lines (left for Latin).');
    L.push('ARABIC / RIGHT-TO-LEFT: reveal Arabic text with word-pop / word-fade / word-rise / fade / pop / wipe-rtl — never "typewriter" or "letter-fade" (they split the letters and break the joined script). In a right-to-left video the reader\'s eye starts on the RIGHT: place the first thing on the right, enter things from the right ("slide-right" moves in from the right edge), put arrows and progress pointing leftwards, order lists top-to-bottom and columns right-to-left. Use "count":{"digits":"ar"} for Arabic-Indic digits when the text is Arabic. Never mix scripts in one text layer (put a Latin brand name in its own layer) unless it is a single short word.');
    if(ratio!=='9:16') L.push('NOTE: size values and y-ranges that appear in the montage style brief ("size 9-13", "y 18-82"…) were written for a 9:16 frame — re-derive them from the TYPE LADDER and SAFE AREA above for this '+ratio+' frame.');
    return L.join('\n');
  }
  window.anFrameSpec=anFrameSpec;
  const CHECK=['=== FINAL CHECK (do this silently before you answer) ===',
   '1. Every text layer: the arithmetic of "FITTING TEXT" holds, size ≥ the ladder floor, font is on the list and supports the script, a box/stroke is present over video or busy images.',
   '2. Every layer centre and its full extent are inside the SAFE AREA; nothing sits in the captions band or the platform-UI zone; no two text blocks overlap; no element covers a face or the main subject of the video.',
   '3. Element "w" values follow ELEMENT SIZES for this ratio (not copied from another ratio); each scene has one focal element and a clear reading order; things appear in the order they are spoken (cue words are exact words from the scene).',
   '4. JSON is strict and every id referenced by a layer ("src", "target", "attach") exists in the same scene or an earlier one.'].join('\n');
  /* wire in */
  const _schema=anMontSchema, _mont=anMontPrompt; let inMont=false;
  anMontSchema=function(ratio){ return _schema(ratio)+(inMont?'':'\n\n'+anFrameSpec(ratio)); };
  anMontPrompt=function(pi){ inMont=true; let t; try{ t=_mont(pi); } finally{ inMont=false; }
    const p=ANIM.cur, M=anMontState(p); const spec=anFrameSpec(p.ratio,{captions:!!M.captions});
    t=t.replace('\n=== WHAT THE VIEWER SEES ===','\n'+spec+'\n\n=== WHAT THE VIEWER SEES ===');
    t=t.replace('\n=== OUTPUT ===','\n'+CHECK+'\n\n=== OUTPUT ===');
    return t; };
})();
