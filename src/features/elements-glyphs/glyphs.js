  /* ===================== GLYPH LIBRARY (hand-drawn / precise vector elements) ===================== */
  /* path mini-language, 0..100 box (y down): M L H V Q C Z (absolute) + helpers:
     S cx cy n ro ri [rot] star · P cx cy n r [rot] polygon · O cx cy r circle · E cx cy rx ry [rot] ellipse
     G cx cy n ro ri gear · R cx cy r0 r1 n [rot] radial lines · Y cx cy r0 r1 turns spiral · A cx cy r a0 a1 arc */
  const GLYPH_CATS={shapes:'أشكال',arrows:'أسهم',symbols:'رموز',biz:'أعمال',edu:'علم وتعليم',tech:'تقنية',nature:'طبيعة',people:'أشخاص',motion:'حركة وتأثير'};
  const GLYPHS={
    /* shapes */
    star:['نجمة','shapes','S 50 54 5 47 19 -90'], star6:['نجمة سداسية','shapes','S 50 50 6 47 26 -90'], star8:['نجمة ثمانية','shapes','S 50 50 8 47 30 -90'],
    triangle:['مثلث','shapes','P 50 56 3 48 -90'], diamond:['معين','shapes','P 50 50 4 48 -90'], pentagon:['خماسي','shapes','P 50 52 5 46 -90'], hexagon:['سداسي','shapes','P 50 50 6 46 0'], octagon:['ثماني','shapes','P 50 50 8 46 22.5'],
    ring:['حلقة','shapes','O 50 50 44 | O 50 50 32'], roundbox:['مربع مدوّر','shapes','M18 8 H82 Q92 8 92 18 V82 Q92 92 82 92 H18 Q8 92 8 82 V18 Q8 8 18 8 Z'],
    ribbon:['شريط','shapes','M4 30 H96 L88 50 L96 70 H4 L12 50 Z'], frame:['إطار تركيز','shapes','M8 30 V8 H30 | M70 8 H92 V30 | M92 70 V92 H70 | M30 92 H8 V70'],
    seal:['ختم','shapes','S 50 50 18 47 40 | O 50 50 30'], dots3:['ثلاث نقاط','shapes','O 18 50 7 | O 50 50 7 | O 82 50 7'],
    /* arrows */
    'arrow-right':['سهم','arrows','M8 50 H90 | M64 24 L92 50 L64 76'], 'arrow-double':['سهم مزدوج','arrows','M10 50 H90 | M30 28 L8 50 L30 72 | M70 28 L92 50 L70 72'],
    'arrow-curve':['سهم منحني','arrows','M12 82 C8 36 48 14 84 26 | M64 8 L88 27 L62 42'], 'arrow-loop':['سهم دوّار','arrows','M8 78 C30 96 66 78 50 50 C38 28 10 44 28 64 C46 82 86 66 90 30 | M76 40 L90 26 L98 46'],
    'arrow-bend':['سهم بزاوية','arrows','M12 12 V70 Q12 82 24 82 H84 | M68 62 L88 82 L68 98'], 'arrow-trend':['اتجاه صاعد','arrows','M8 78 L34 52 L52 66 L88 22 | M62 20 L90 20 L90 48'],
    'arrow-refresh':['تحديث','arrows','M80 40 C70 14 34 12 20 38 C8 60 20 86 46 88 C66 90 82 76 84 58 | M86 20 L82 42 L62 36'],
    'arrow-block':['سهم عريض','arrows','M6 36 H56 V14 L94 50 L56 86 V64 H6 Z'], 'arrow-zig':['سهم متعرج','arrows','M6 80 L30 40 L52 66 L84 20 | M62 18 L88 16 L84 42'],
    'arrow-down':['سهم لأسفل','arrows','M50 8 V90 | M24 64 L50 92 L76 64'], 'arrow-up':['سهم لأعلى','arrows','M50 92 V10 | M24 36 L50 8 L76 36'],
    wave:['موجة','arrows','M4 50 Q16 26 28 50 Q40 74 52 50 Q64 26 76 50 Q88 74 96 50'], zigzag:['خط متعرج','arrows','M6 62 L22 32 L38 62 L54 32 L70 62 L86 32'],
    spiral:['حلزون','arrows','Y 50 50 3 46 3'], infinity:['لانهاية','arrows','M50 50 C62 26 94 26 94 50 C94 74 62 74 50 50 C38 26 6 26 6 50 C6 74 38 74 50 50'],
    'brace-l':['قوس {','arrows','M66 6 C44 6 54 40 36 50 C54 60 44 94 66 94'], 'brace-r':['قوس }','arrows','M34 6 C56 6 46 40 64 50 C46 60 56 94 34 94'],
    /* symbols */
    heart:['قلب','symbols','M50 90 C8 60 4 30 28 18 C42 12 50 24 50 32 C50 24 58 12 72 18 C96 30 92 60 50 90 Z'],
    check:['صح','symbols','M16 54 L40 78 L86 24'], cross:['خطأ','symbols','M20 20 L80 80 | M80 20 L20 80'], plus:['زائد','symbols','M50 14 V86 | M14 50 H86'], minus:['ناقص','symbols','M14 50 H86'],
    question:['استفهام','symbols','M30 34 C30 6 74 6 74 34 C74 54 50 54 50 72 | O 50 88 3'], exclaim:['تعجب','symbols','M50 10 V64 | O 50 86 3'],
    checkbox:['مربع صح','symbols','M14 14 H86 V86 H14 Z | M28 52 L44 68 L74 30'], warning:['تحذير','symbols','P 50 56 3 48 -90 | M50 36 V62 | O 50 76 2'],
    info:['معلومة','symbols','O 50 50 43 | M50 44 V72 | O 50 29 2'], ban:['ممنوع','symbols','O 50 50 43 | M20 20 L80 80'],
    bolt:['برق','symbols','M60 4 L22 56 H46 L38 96 L80 40 H54 Z'], bulb:['لمبة','symbols','M38 72 C20 60 18 30 42 18 C64 8 88 28 76 52 C72 62 64 66 64 72 Z | M40 82 H62 | M44 92 H58 | M44 58 L50 44 L56 58'],
    target:['هدف','symbols','O 50 50 44 | O 50 50 28 | O 50 50 12'], flag:['علم','symbols','M24 94 V6 | M24 10 H82 L68 30 L82 50 H24'],
    pin:['موقع','symbols','M50 94 C26 62 22 50 22 38 C22 22 34 8 50 8 C66 8 78 22 78 38 C78 50 74 62 50 94 Z | O 50 38 10'],
    bell:['جرس','symbols','M50 8 C30 8 26 30 26 50 C26 66 14 72 14 78 H86 C86 72 74 66 74 50 C74 30 70 8 50 8 Z | M42 88 C44 98 56 98 58 88'],
    thumb:['إعجاب','symbols','M10 46 H28 V90 H10 Z | M28 50 L44 10 C58 10 58 24 54 38 H84 C92 38 92 50 88 56 C92 62 90 70 84 72 C86 80 80 86 74 86 H28'],
    shield:['درع','symbols','M50 6 L88 20 V50 C88 74 68 88 50 94 C32 88 12 74 12 50 V20 Z | M34 50 L46 62 L68 38'],
    infoq:['فكرة','symbols','O 50 50 43 | M36 40 C36 22 64 22 64 40 C64 52 50 52 50 64 | O 50 76 2'],
    /* business */
    coin:['عملة','biz','O 50 50 43 | O 50 50 32 | M58 38 C46 30 36 40 46 48 C56 54 62 58 54 66 C46 72 38 66 36 62 | M50 24 V32 | M50 68 V76'],
    'chart-bars':['أعمدة','biz','M8 92 H94 | M16 92 V62 H32 V92 | M42 92 V40 H58 V92 | M68 92 V18 H84 V92'], 'chart-line':['منحنى','biz','M10 8 V90 H94 | M18 70 L38 48 L54 60 L86 24'],
    pie:['دائري','biz','O 50 50 43 | M50 50 V7 | M50 50 L87 72'], crown:['تاج','biz','M8 78 L14 28 L36 54 L50 18 L64 54 L86 28 L92 78 Z | M8 92 H92'],
    trophy:['كأس','biz','M30 10 H70 V40 C70 60 30 60 30 40 Z | M30 18 H12 C12 40 22 46 32 46 | M70 18 H88 C88 40 78 46 68 46 | M50 58 V76 | M30 92 H70 L64 76 H36 Z'],
    medal:['ميدالية','biz','O 50 64 26 | M34 40 L20 6 H40 L50 28 | M66 40 L80 6 H60 L50 28 | S 50 64 5 14 6 -90'], gift:['هدية','biz','M14 40 H86 V92 H14 Z | M8 26 H92 V40 H8 Z | M50 26 V92 | M50 26 C34 2 18 20 36 26 | M50 26 C66 2 82 20 64 26'],
    cart:['سلة','biz','M4 12 H20 L32 62 H78 L90 26 H24 | O 38 80 6 | O 72 80 6'], tag:['وسم','biz','M6 50 L48 8 H92 V52 L50 94 Z | O 72 28 6'],
    calendar:['تقويم','biz','M12 20 H88 V92 H12 Z | M12 40 H88 | M32 8 V28 | M68 8 V28'], doc:['مستند','biz','M24 6 H62 L78 22 V94 H24 Z | M62 6 V22 H78 | M36 46 H66 | M36 60 H66 | M36 74 H56'],
    mail:['بريد','biz','M6 24 H94 V78 H6 Z | M6 24 L50 58 L94 24'], plane:['طائرة ورقية','biz','M6 46 L94 8 L68 92 L48 62 Z | M48 62 L94 8'], hourglass:['ساعة رملية','biz','M22 6 H78 | M22 94 H78 | M28 6 C28 36 46 44 50 50 C54 56 72 64 72 94 | M72 6 C72 36 54 44 50 50 C46 56 28 64 28 94'],
    clock:['ساعة','biz','O 50 50 43 | M50 22 V50 L68 62'], key:['مفتاح','biz','O 26 50 18 | M44 50 H94 | M78 50 V68 | M90 50 V64'],
    lock:['قفل','biz','M26 46 V34 C26 8 74 8 74 34 V46 | M18 46 H82 V92 H18 Z | O 50 68 5'], home:['بيت','biz','M8 50 L50 14 L92 50 | M20 44 V90 H80 V44 | M42 90 V62 H58 V90'],
    /* education */
    book:['كتاب','edu','M50 22 C36 12 18 12 6 18 V84 C18 78 36 78 50 88 C64 78 82 78 94 84 V18 C82 12 64 12 50 22 Z | M50 22 V88'], pencil:['قلم','edu','M14 88 L20 64 L70 14 L88 32 L38 82 Z | M60 24 L78 42 | M20 64 L38 82'],
    magnifier:['عدسة','edu','O 42 42 28 | M62 62 L92 92'], flask:['دورق','edu','M38 8 H62 | M42 8 V36 L12 86 Q9 94 18 94 H82 Q91 94 88 86 L58 36 V8 | M24 68 H76'],
    atom:['ذرة','edu','E 50 50 44 16 0 | E 50 50 44 16 60 | E 50 50 44 16 120 | O 50 50 5'], grad:['قبعة تخرج','edu','M50 18 L95 38 L50 58 L5 38 Z | M24 48 V70 C36 84 64 84 76 70 V48 | M95 38 V66'],
    globe:['كرة أرضية','edu','O 50 50 43 | E 50 50 18 43 0 | M7 50 H93 | M16 28 H84 | M16 72 H84'], ruler:['مسطرة','edu','M8 66 L66 8 L92 34 L34 92 Z | M26 48 L36 58 | M38 36 L48 46 | M50 24 L60 34'],
    brain:['عقل','edu','M50 14 C34 4 14 14 18 32 C6 38 6 56 20 60 C16 76 34 88 46 80 C48 88 52 88 54 80 C66 88 84 76 80 60 C94 56 94 38 82 32 C86 14 66 4 50 14 Z | M50 14 V82 | M30 38 C38 40 40 46 36 54 | M70 38 C62 40 60 46 64 54'],
    /* tech */
    gear:['ترس','tech','G 50 50 10 46 36 | O 50 50 14'], phone:['هاتف','tech','M30 6 H70 V94 H30 Z | M42 84 H58 | M42 14 H58'], laptop:['حاسوب','tech','M16 22 H84 V66 H16 Z | M4 80 H96 L88 66 H12 Z'],
    camera:['كاميرا','tech','M6 30 H30 L36 16 H64 L70 30 H94 V84 H6 Z | O 50 58 18'], speaker:['صوت','tech','M8 38 H28 L50 20 V80 L28 62 H8 Z | M62 38 C70 46 70 54 62 62 | M72 26 C90 42 90 58 72 74'],
    wifi:['شبكة','tech','M8 40 C34 16 66 16 92 40 | M22 54 C40 38 60 38 78 54 | M36 68 C44 60 56 60 64 68 | O 50 82 3'], music:['موسيقى','tech','M36 76 V20 L78 10 V64 | O 26 78 10 | O 68 66 10'],
    cursor:['مؤشر','tech','M24 8 L24 80 L40 64 L52 92 L64 86 L52 60 L78 60 Z'], download:['تنزيل','tech','M50 8 V66 | M24 44 L50 70 L76 44 | M14 92 H86'], link:['رابط','tech','M38 62 L62 38 | M38 46 L26 58 C14 70 30 88 42 76 L54 64 | M62 54 L74 42 C86 30 70 12 58 24 L46 36'],
    battery:['بطارية','tech','M6 28 H86 V72 H6 Z | M86 42 H96 V58 H86 | M16 38 H30 V62 H16 Z | M36 38 H50 V62 H36 Z'], rocket:['صاروخ','tech','M50 4 C72 22 76 54 66 72 H34 C24 54 28 22 50 4 Z | O 50 38 8 | M34 72 L18 90 L38 84 | M66 72 L82 90 L62 84 | M44 80 L50 96 L56 80'],
    car:['سيارة','tech','M6 64 L14 42 H34 L44 26 H72 L84 42 H94 V64 Z | O 28 70 9 | O 72 70 9'],
    /* nature */
    sun:['شمس','nature','O 50 50 18 | R 50 50 28 46 12 0'], moon:['هلال','nature','M68 8 C34 12 16 42 26 68 C36 92 66 98 90 78 C62 84 44 60 54 38 C58 28 62 18 68 8 Z'],
    cloud:['سحابة','nature','M26 74 C6 74 4 48 26 46 C26 26 54 20 62 38 C78 28 96 46 84 62 C98 68 90 78 76 74 Z'], drop:['قطرة','nature','M50 6 C62 28 82 46 82 64 C82 82 68 94 50 94 C32 94 18 82 18 64 C18 46 38 28 50 6 Z'],
    flame:['نار','nature','M50 4 C58 26 82 38 82 64 C82 84 68 96 50 96 C32 96 18 84 18 64 C18 50 28 42 34 28 C40 40 44 42 46 44 C50 30 46 16 50 4 Z | M50 64 C58 72 62 78 56 86 C52 90 44 90 42 84 C40 76 46 70 50 64 Z'],
    leaf:['ورقة','nature','M12 88 C12 40 44 12 90 10 C90 56 62 88 12 88 Z | M12 88 L58 42'], flower:['زهرة','nature','O 50 22 14 | O 78 42 14 | O 68 76 14 | O 32 76 14 | O 22 42 14 | O 50 50 10'],
    tree:['شجرة','nature','O 50 34 28 | M50 62 V94 | M50 80 L36 68 | M50 74 L64 62'], mountain:['جبل','nature','M4 90 L36 32 L52 60 L66 38 L96 90 Z | M26 50 L36 56 L44 46'], snow:['ندفة','nature','R 50 50 0 46 6 0 | R 50 50 26 38 6 30 | O 50 50 6'],
    wavesea:['بحر','nature','M4 40 Q16 24 28 40 Q40 56 52 40 Q64 24 76 40 Q88 56 96 40 | M4 62 Q16 46 28 62 Q40 78 52 62 Q64 46 76 62 Q88 78 96 62'], eye:['عين','nature','M4 50 C26 18 74 18 96 50 C74 82 26 82 4 50 Z | O 50 50 15 | O 50 50 5'],
    /* people */
    person:['شخص','people','O 50 20 13 | M50 33 V66 | M50 44 L26 58 | M50 44 L74 58 | M50 66 L32 94 | M50 66 L68 94'], team:['فريق','people','O 30 28 11 | M30 42 C12 46 10 68 12 78 H48 C50 68 48 46 30 42 Z | O 68 30 13 | M68 46 C48 50 46 74 48 86 H88 C90 74 88 50 68 46 Z'],
    smile:['وجه مبتسم','people','O 50 50 43 | O 34 40 3 | O 66 40 3 | M28 60 C36 78 64 78 72 60'], think:['تفكير','people','O 50 50 43 | O 34 42 3 | O 66 42 3 | M36 68 H64 | M64 24 L80 20'],
    bubble:['فقاعة كلام','people','M12 14 H88 Q94 14 94 20 V62 Q94 68 88 68 H46 L26 88 L30 68 H12 Q6 68 6 62 V20 Q6 14 12 14 Z'], thought:['فقاعة تفكير','people','M26 66 C6 66 4 40 26 38 C26 18 54 12 62 30 C78 20 96 38 84 54 C98 60 90 70 76 66 Z | O 30 80 5 | O 18 92 3'],
    hand:['كف','people','M30 94 L18 60 C16 52 26 50 30 58 L34 66 V18 C34 10 44 10 44 18 V46 V12 C44 4 54 4 54 12 V46 V16 C54 8 64 8 64 16 V50 V26 C64 18 74 18 74 26 V70 C74 86 62 94 50 94 Z'],
    /* motion */
    'speed-lines':['خطوط سرعة','motion','M10 22 H62 | M24 38 H88 | M4 54 H70 | M28 70 H92 | M14 86 H58'], 'speed-radial':['انفجار خطوط','motion','R 50 50 24 48 12 0'], pow:['ضربة','motion','S 50 50 14 48 26 -90'],
    swoosh:['سووش','motion','M4 72 C30 92 72 80 96 28 C70 60 36 72 4 72 Z'], ripple:['تموّج','motion','O 50 50 11 | O 50 50 27 | O 50 50 44'], sparkle:['لمعة','motion','M50 4 C54 36 64 46 96 50 C64 54 54 64 50 96 C46 64 36 54 4 50 C36 46 46 36 50 4 Z'],
    sparkles:['لمعات','motion','S 32 64 4 26 8 -90 | S 72 28 4 18 6 -90 | S 76 78 4 12 4 -90'], shine:['إشعاع','motion','M50 4 V28 | M50 72 V96 | M4 50 H28 | M72 50 H96 | M18 18 L34 34 | M66 66 L82 82 | M82 18 L66 34 | M34 66 L18 82'],
    soundbars:['موجات صوت','motion','M10 42 V58 | M22 30 V70 | M34 16 V84 | M46 32 V68 | M58 22 V78 | M70 36 V64 | M82 44 V56 | M94 48 V52'], heartbeat:['نبض','motion','M2 56 H26 L36 30 L48 84 L58 12 L68 56 H98'],
    loading:['تحميل','motion','A 50 50 40 -90 200 | O 50 50 3'], dizzy:['دوخة','motion','Y 50 50 4 44 3.4'], dust:['غبار','motion','O 28 64 14 | O 52 50 19 | O 76 64 13'], dotstrail:['أثر نقاط','motion','O 12 50 4 | O 30 50 6 | O 54 50 8 | O 82 50 11'],
    attention:['انتباه','motion','M16 38 L4 28 | M30 22 L24 6 | M50 16 V0 | M70 22 L76 6 | M84 38 L96 28'], confetti:['قصاصات','motion','M18 24 L32 16 | M72 14 L80 28 | O 48 40 4 | M12 72 L28 64 | M82 62 L92 76 | O 60 86 4 | M44 62 L54 72'],
    click:['نقرة','motion','M30 26 L30 76 L42 64 L52 88 L62 83 L52 60 L70 60 Z | A 30 26 16 200 320 | A 30 26 26 200 320'], bounce:['ارتداد','motion','M8 20 C20 20 24 80 36 80 C48 80 52 40 62 40 C72 40 74 80 82 80 | O 90 80 3'],
    burst:['شرارة','motion','S 50 50 10 47 20 -90 | O 50 50 8'], orbit:['مدار','motion','E 50 50 46 20 -30 | O 50 50 8 | O 88 34 4']
  };
  const GLYPH_NAMES=Object.keys(GLYPHS);
  const _GP={};
  function glyphPaths(name){
    if(_GP[name]) return _GP[name]; const src=(GLYPHS[name]||[])[2]||''; const subs=[];
    const bez=(p0,p1,p2,p3,n)=>{ const o=[]; for(let i=1;i<=n;i++){ const t=i/n,u=1-t; o.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0], u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]); } return o; };
    src.split('|').forEach(seg=>{
      const tk=seg.match(/[A-Za-z]|-?\d*\.?\d+/g)||[]; let i=0, cur=null, start=null, pts=null, closed=false;
      const flush=()=>{ if(pts&&pts.length>1) subs.push({pts,closed}); pts=null; closed=false; };
      const nx=()=>parseFloat(tk[i++]);
      while(i<tk.length){ const c=tk[i++];
        if(c==='M'){ flush(); cur=[nx(),nx()]; start=cur; pts=[cur]; }
        else if(c==='L'){ cur=[nx(),nx()]; pts.push(cur); }
        else if(c==='H'){ cur=[nx(),cur[1]]; pts.push(cur); }
        else if(c==='V'){ cur=[cur[0],nx()]; pts.push(cur); }
        else if(c==='Q'){ const a=[nx(),nx()], b=[nx(),nx()]; const c1=[cur[0]+2/3*(a[0]-cur[0]),cur[1]+2/3*(a[1]-cur[1])], c2=[b[0]+2/3*(a[0]-b[0]),b[1]+2/3*(a[1]-b[1])]; bez(cur,c1,c2,b,12).forEach(q=>pts.push(q)); cur=b; }
        else if(c==='C'){ const a=[nx(),nx()], b=[nx(),nx()], e=[nx(),nx()]; bez(cur,a,b,e,16).forEach(q=>pts.push(q)); cur=e; }
        else if(c==='Z'){ pts.push(start); closed=true; flush(); cur=start; }
        else if(c==='O'||c==='E'){ flush(); const cx=nx(),cy=nx(),rx=nx(),ry=c==='E'?nx():rx; const rot=c==='E'&&/^-?\d/.test(tk[i]||'')?nx():0; const cr=Math.cos(rot*PI/180), sr=Math.sin(rot*PI/180); const o=[]; for(let k=0;k<=48;k++){ const a=k/48*2*PI-PI/2; const x=Math.cos(a)*rx, y=Math.sin(a)*ry; o.push([cx+x*cr-y*sr, cy+x*sr+y*cr]); } subs.push({pts:o,closed:true}); }
        else if(c==='P'||c==='S'){ flush(); const cx=nx(),cy=nx(),n=nx(),ro=nx(); const ri=c==='S'?nx():0; const rot=/^-?\d/.test(tk[i]||'')?nx():-90; const o=[]; const m=c==='S'?n*2:n; for(let k=0;k<m;k++){ const a=(rot+k*360/m)*PI/180; const r=c==='S'?(k%2?ri:ro):ro; o.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); } o.push(o[0]); subs.push({pts:o,closed:true}); }
        else if(c==='G'){ flush(); const cx=nx(),cy=nx(),n=nx(),ro=nx(),ri=nx(); const o=[]; const step=360/n; for(let k=0;k<n;k++){ const a0=k*step; [[a0-step*0.22,ri],[a0-step*0.16,ro],[a0+step*0.16,ro],[a0+step*0.22,ri]].forEach(([a,r])=>{ const rr=a*PI/180; o.push([cx+Math.cos(rr)*r, cy+Math.sin(rr)*r]); }); } o.push(o[0]); subs.push({pts:o,closed:true}); }
        else if(c==='R'){ flush(); const cx=nx(),cy=nx(),r0=nx(),r1=nx(),n=nx(); const rot=/^-?\d/.test(tk[i]||'')?nx():0; for(let k=0;k<n;k++){ const a=(rot+k*360/n)*PI/180; subs.push({pts:[[cx+Math.cos(a)*r0,cy+Math.sin(a)*r0],[cx+Math.cos(a)*r1,cy+Math.sin(a)*r1]],closed:false}); } }
        else if(c==='Y'){ flush(); const cx=nx(),cy=nx(),r0=nx(),r1=nx(),tn=nx(); const o=[]; const N=Math.round(40*tn); for(let k=0;k<=N;k++){ const t=k/N; const a=t*tn*2*PI-PI/2; const r=r0+(r1-r0)*t; o.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); } subs.push({pts:o,closed:false}); }
        else if(c==='A'){ flush(); const cx=nx(),cy=nx(),r=nx(),a0=nx(),a1=nx(); const o=[]; const N=Math.max(8,Math.round(Math.abs(a1-a0)/6)); for(let k=0;k<=N;k++){ const a=(a0+(a1-a0)*k/N)*PI/180; o.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); } subs.push({pts:o,closed:false}); }
      }
      flush();
    });
    return _GP[name]=subs;
  }
  /* smooth value-noise: deterministic hand tremor (same frame -> same wobble, so preview and export match) */
  function gnoise(x){ const i=Math.floor(x), f=x-i; const a=hash(i*3.17+1.3)*2-1, b=hash((i+1)*3.17+1.3)*2-1; const s=f*f*(3-2*f); return a+(b-a)*s; }
  const GLOOKS={clean:'دقيق',hand:'يد (قلم)',marker:'ماركر',sketch:'سكتش رصاص',chalk:'طباشير',ink:'حبر متدرّج',neon:'نيون'};
  const GFILLS={none:'بدون',solid:'ملء',hatch:'تظليل خطوط',wash:'ألوان مائية',dots:'نقاط'};
  let GT=0;
  /* build the stroked point lists of a glyph for one pass */
  function glyphBuild(name,w,hh,amp,seed,boil,resample){
    const subs=glyphPaths(name); const out=[]; const sz=Math.min(w,hh);
    subs.forEach((sp,si)=>{
      let pts=sp.pts.map(p=>[(p[0]-50)*w/100,(p[1]-50)*hh/100]);
      if(resample){ const step=sz*0.035; const r=[pts[0]]; let acc=0; for(let i=1;i<pts.length;i++){ let a=pts[i-1], b=pts[i]; let d=Math.hypot(b[0]-a[0],b[1]-a[1]); while(acc+d>=step){ const t=(step-acc)/d; a=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]; r.push(a); d=Math.hypot(b[0]-a[0],b[1]-a[1]); acc=0; } acc+=d; } if(Math.hypot(r[r.length-1][0]-pts[pts.length-1][0],r[r.length-1][1]-pts[pts.length-1][1])>step*0.2) r.push(pts[pts.length-1]); pts=r; }
      if(amp>0){ const sd=seed+si*17.3+boil*5.1; pts=pts.map((p,i)=>[p[0]+gnoise(i*0.55+sd)*amp, p[1]+gnoise(i*0.55+sd+91.7)*amp]); }
      out.push({pts,closed:sp.closed});
    });
    return out;
  }
  function glyphStrokeLen(subs){ let L=0; subs.forEach(s=>{ for(let i=1;i<s.pts.length;i++) L+=Math.hypot(s.pts[i][0]-s.pts[i-1][0],s.pts[i][1]-s.pts[i-1][1]); }); return L; }
  /* stroke a set of sub-paths up to progress (0..1) of the total length; widthFn(t) optional (ink taper); returns pen position */
  function glyphStroke(ctx,subs,prog,lw,widthFn){
    const total=glyphStrokeLen(subs); let budget=total*prog, last=null, done=0;
    for(const s of subs){ const pts=s.pts; if(pts.length<2) continue; if(budget<=0) break;
      if(!widthFn){ ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); let acc=0; last=pts[0];
        for(let i=1;i<pts.length;i++){ const seg=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); if(acc+seg>=budget){ const t=seg?(budget-acc)/seg:0; last=[pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t]; ctx.lineTo(last[0],last[1]); acc=budget; break; } ctx.lineTo(pts[i][0],pts[i][1]); acc+=seg; last=pts[i]; }
        ctx.stroke(); budget-=acc; }
      else { let L=0; for(let i=1;i<pts.length;i++) L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); let acc=0; last=pts[0];
        for(let i=1;i<pts.length;i++){ const seg=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); let b=pts[i]; let stop=false; if(acc+seg>=budget){ const t=seg?(budget-acc)/seg:0; b=[pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t]; stop=true; }
          ctx.lineWidth=lw*widthFn(L?(acc+seg/2)/L:0); ctx.beginPath(); ctx.moveTo(pts[i-1][0],pts[i-1][1]); ctx.lineTo(b[0],b[1]); ctx.stroke(); last=b; acc+=seg; if(stop){ acc=budget; break; } }
        budget-=acc; }
      done++; }
    return last;
  }
  function glyphClosedPath(ctx,subs){ ctx.beginPath(); subs.forEach(s=>{ if(!s.closed) return; s.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); }); }
  function glyphFill(ctx,subs,mode,col,fa,lw,sz,seed,hand){
    if(mode==='none'||fa<=0.01||!subs.some(s=>s.closed)) return;
    ctx.save(); ctx.globalAlpha*=fa; ctx.fillStyle=col; ctx.strokeStyle=col;
    if(mode==='solid'){ glyphClosedPath(ctx,subs); ctx.globalAlpha*=hand?0.85:1; ctx.fill('evenodd'); }
    else if(mode==='wash'){ const off=sz*0.025; ctx.translate(off,off*0.8); glyphClosedPath(ctx,subs); ctx.globalAlpha*=0.3; ctx.fill('evenodd'); ctx.translate(-off*1.6,-off*1.2); ctx.globalAlpha*=0.7; ctx.fill('evenodd'); }
    else { glyphClosedPath(ctx,subs); ctx.clip('evenodd'); const gap=Math.max(4,sz*(mode==='dots'?0.09:0.075)); ctx.lineWidth=Math.max(1,lw*0.5); ctx.globalAlpha*=0.85; ctx.lineCap='round';
      if(mode==='hatch'){ ctx.beginPath(); for(let d=-sz*1.2,k=0;d<sz*1.2;d+=gap,k++){ const j=hand?gnoise(k*0.7+seed)*gap*0.18:0; ctx.moveTo(d-sz+j,sz); ctx.lineTo(d+sz+j,-sz+(hand?gnoise(k+seed+4)*gap*0.3:0)); } ctx.stroke(); }
      else { for(let y=-sz;y<sz;y+=gap){ for(let x=-sz;x<sz;x+=gap){ ctx.beginPath(); ctx.arc(x+((y/gap)%2?gap/2:0),y,Math.max(1,lw*0.28),0,2*PI); ctx.fill(); } } } }
    ctx.restore();
  }
  function drawGlyph(ctx,l,v,w,h,H,handAt,tOverride){
    const hh=h>0?h:w; const sz=Math.min(w,hh); const look=l.look||'hand'; const fillMode=l.fillMode||(l.fill?'solid':'none');
    const lw0=Math.max(1.2,H*l.stroke/100); const col=l.color; const fcol=l.fillColor||l.color; const prog=Math.min(v.draw,v.hd);
    const t=tOverride!=null?tOverride:GT; const boil=(look==='hand'||look==='sketch'||look==='chalk')?Math.floor(t*7)%3:0; const seed=(l.seed||5)*1.7;
    ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle=col; ctx.fillStyle=col;
    if(l.fx) applyLayerFx(ctx,l.fx,v.glow,H);
    const rough=look==='clean'||look==='neon'||look==='ink'?(look==='ink'?sz*0.004:0):look==='marker'?sz*0.008:look==='chalk'?sz*0.011:look==='sketch'?sz*0.013:sz*0.011;
    const base=glyphBuild(l.shape,w,hh,rough,seed,boil,rough>0);
    const fa=Math.max(0,Math.min(1,(prog-0.55)/0.45));
    glyphFill(ctx,base,fillMode,fcol,fa,lw0,sz,seed,look!=='clean'&&look!=='neon');
    let pen=null;
    if(look==='clean'){ ctx.lineWidth=lw0; pen=glyphStroke(ctx,base,prog,lw0); }
    else if(look==='neon'){ ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=lw0*5; ctx.lineWidth=lw0*1.3; pen=glyphStroke(ctx,base,prog,lw0); ctx.shadowBlur=lw0*2; glyphStroke(ctx,base,prog,lw0); ctx.shadowBlur=0; ctx.strokeStyle='#ffffff'; ctx.globalAlpha*=0.8; ctx.lineWidth=lw0*0.4; glyphStroke(ctx,base,prog,lw0); ctx.restore(); }
    else if(look==='marker'){ ctx.save(); ctx.globalAlpha*=0.9; ctx.lineWidth=lw0*1.7; pen=glyphStroke(ctx,base,prog,lw0); ctx.restore(); }
    else if(look==='ink'){ ctx.lineWidth=lw0; pen=glyphStroke(ctx,base,prog,lw0,u=>0.35+1.05*Math.sin(Math.PI*Math.min(1,Math.max(0,u)))); }
    else if(look==='hand'){ ctx.lineWidth=lw0; pen=glyphStroke(ctx,base,prog,lw0); const p2=glyphBuild(l.shape,w,hh,rough*1.3,seed+40,boil,true); ctx.save(); ctx.globalAlpha*=0.55; ctx.lineWidth=lw0*0.6; glyphStroke(ctx,p2,prog,lw0); ctx.restore(); }
    else if(look==='sketch'){ ctx.lineWidth=lw0*0.5; pen=glyphStroke(ctx,base,prog,lw0); for(let k=1;k<=2;k++){ const pk=glyphBuild(l.shape,w*(1+0.012*k),hh*(1+0.012*k),rough*1.5,seed+23*k,boil,true); ctx.save(); ctx.globalAlpha*=0.7; ctx.lineWidth=lw0*0.4; glyphStroke(ctx,pk,prog,lw0); ctx.restore(); } }
    else if(look==='chalk'){ for(let k=0;k<3;k++){ const pk=k?glyphBuild(l.shape,w,hh,rough*1.4,seed+31*k,boil,true):base; ctx.save(); ctx.globalAlpha*=0.5; ctx.lineWidth=lw0*(0.9-0.15*k); ctx.setLineDash([lw0*(3+k*1.5),lw0*(0.5+0.4*k)]); const pp=glyphStroke(ctx,pk,prog,lw0); if(!k) pen=pp; ctx.restore(); } }
    ctx.setLineDash([]);
    if(v.hd<0.999&&prog>0.001&&pen) handAt(pen[0],pen[1]);
  }
  /* static thumbnail used by the elements picker */
  function glyphThumb(cv,name,opts){ opts=opts||{}; const S=cv.width, H=cv.height; const ctx=cv.getContext('2d'); ctx.clearRect(0,0,S,H); ctx.save(); ctx.translate(S/2,H/2); const l={shape:name,look:opts.look||'hand',fillMode:opts.fill||'none',stroke:opts.stroke||(opts.look==='marker'?1.4:2.2),color:opts.color||'#e53935',fillColor:opts.fillColor||opts.color||'#e53935',seed:opts.seed||5};
    drawGlyph(ctx,l,{draw:1,hd:1,glow:0},S*0.74,H*0.74,H,()=>{},0); ctx.restore(); }
