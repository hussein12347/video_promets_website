/* ===================== elements picker panel (hand-drawn / precise animated elements) ===================== */
const AN_EL_ENTERS=['handdraw','draw','pop','bounce','stamp','elastic','zoom-in','spin','swing','fade','wipe','drop','rise','squash','slide-left','slide-up','flip-x'];
const AN_EL_MOTIONS=[['','بدون'],['float','طفو'],['pulse','نبض'],['wiggle','ارتعاش يد'],['sway','تأرجح'],['spin','لف'],['heartbeat','نبضة قلب'],['bob','تمايل'],['breathe','تنفّس'],['shake','اهتزاز'],['glow','توهج'],['orbit','مدار'],['jelly','جيلي'],['tilt','ميلان'],['flicker','وميض']];
const AN_EL_SIDES=[['','حر في المنتصف'],['top','فوق العنصر المحدد'],['bottom','تحته'],['after','بعده (جنب)'],['before','قبله'],['top-right','ركن علوي'],['top-left','ركن علوي آخر'],['bottom-right','ركن سفلي'],['center','فوقه تمامًا']];
const AN_EL_COLORS=['#E53935','#FF7043','#FFB300','#43A047','#1E88E5','#8E24AA','#111111','#FFFFFF'];
function anPanelElements(box){
  const E=ANIM.engine; if(!E||!E.glyphs){ box.innerHTML=anPanelHead('🧩 عناصر','المحرك لا يدعم العناصر.'); return; }
  const G=E.glyphs, CATS=E.glyphCats, LOOKS=E.glyphLooks, FILLS=E.glyphFills;
  const S=ANIM.elSet=Object.assign({cat:'all',q:'',look:'hand',fill:'none',color:'#E53935',w:16,stroke:0.7,rot:0,enter:'handdraw',motion:'',side:'',flip:false},ANIM.elSet||{});
  const sel=ANIM.sel.layer; const si=anSceneIdx(); const tl=sel&&si>=0?anLayerRaw(si,sel):null;
  const chip=(k,v,cur,attr)=>'<button type="button" class="el-chip'+(k===cur?' on':'')+'" '+attr+'="'+k+'">'+v+'</button>';
  const names=Object.keys(G).filter(n=>(S.cat==='all'||G[n][1]===S.cat)&&(!S.q||G[n][0].includes(S.q)||n.includes(S.q.toLowerCase())));
  box.innerHTML=anPanelHead('🧩 عناصر الحركة','أشكال ورموز مرسومة بخط اليد أو بدقة هندسية — اضغط على أي عنصر لإضافته للمشهد، وبيتحرك ويترسم لوحده.')+
   '<div class="el-search"><input id="el-q" type="search" placeholder="ابحث: قلب، سهم، نجمة…" value="'+esc(S.q)+'" aria-label="بحث في العناصر"></div>'+
   '<div class="el-cats">'+chip('all','الكل ('+Object.keys(G).length+')',S.cat,'data-cat')+Object.entries(CATS).map(([k,v])=>chip(k,v,S.cat,'data-cat')).join('')+'</div>'+
   '<div class="el-grid" id="el-grid">'+(names.length?names.map(n=>'<button type="button" class="el-it" data-n="'+n+'" title="'+esc(G[n][0])+'"><canvas width="96" height="96"></canvas><span>'+esc(G[n][0])+'</span></button>').join(''):'<p class="hint">مفيش نتائج.</p>')+'</div>'+
   '<div class="pn-sec el-opts"><b>أسلوب الرسم</b><div class="el-chips">'+Object.entries(LOOKS).map(([k,v])=>chip(k,v,S.look,'data-look')).join('')+'</div>'+
   '<b>التعبئة</b><div class="el-chips">'+Object.entries(FILLS).map(([k,v])=>chip(k,v,S.fill,'data-fill')).join('')+'</div>'+
   '<b>اللون</b><div class="el-sw">'+AN_EL_COLORS.map(c=>'<button type="button" class="pn-col'+(c.toLowerCase()===S.color.toLowerCase()?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="'+c+'"></button>').join('')+'<input type="color" id="el-col" value="'+S.color+'" aria-label="لون مخصص"></div>'+
   '<div class="el-rng"><label>الحجم <output>'+S.w+'</output><input type="range" id="el-w" min="6" max="60" step="1" value="'+S.w+'"></label>'+
   '<label>السُمك <output>'+S.stroke+'</output><input type="range" id="el-sw" min="0.3" max="2.2" step="0.1" value="'+S.stroke+'"></label>'+
   '<label>الدوران <output>'+S.rot+'°</output><input type="range" id="el-rot" min="-180" max="180" step="5" value="'+S.rot+'"></label></div>'+
   '<label class="an-sw"><input type="checkbox" id="el-flip" '+(S.flip?'checked':'')+'><span>قلب أفقي</span></label>'+
   '<div class="el-two"><label class="mt-f">الظهور<select id="el-en">'+AN_EL_ENTERS.map(k=>'<option value="'+k+'"'+(k===S.enter?' selected':'')+'>'+((typeof AN_ENTER_AR==='object'&&AN_ENTER_AR[k])||k)+'</option>').join('')+'</select></label>'+
   '<label class="mt-f">حركة مستمرة<select id="el-mo">'+AN_EL_MOTIONS.map(([k,v])=>'<option value="'+k+'"'+(k===S.motion?' selected':'')+'>'+v+'</option>').join('')+'</select></label></div>'+
   (tl?'<label class="mt-f">المكان بالنسبة لـ «'+esc(tl.id)+'»<select id="el-side">'+AN_EL_SIDES.map(([k,v])=>'<option value="'+k+'"'+(k===S.side?' selected':'')+'>'+v+'</option>').join('')+'</select></label>':'<p class="hint">حدّد عنصرًا في المشهد لو عايز تحط العنصر الجديد حواليه تلقائيًا.</p>')+'</div>';
  const paint=()=>$$('#el-grid .el-it',box).forEach(b=>{ try{ E.glyphThumb(b.querySelector('canvas'),b.dataset.n,{look:S.look,fill:S.fill,color:S.color,fillColor:S.color,stroke:S.look==='marker'?2.4:2.6}); }catch(e){} });
  paint();
  const re=()=>anPanelElements(box);
  $('#el-q',box).oninput=e=>{ S.q=e.target.value.trim(); const pos=e.target.selectionStart; re(); const q=$('#el-q',box); q.focus(); try{ q.setSelectionRange(pos,pos); }catch(_){} };
  $$('[data-cat]',box).forEach(b=>b.onclick=()=>{ S.cat=b.dataset.cat; re(); });
  $$('[data-look]',box).forEach(b=>b.onclick=()=>{ S.look=b.dataset.look; re(); });
  $$('[data-fill]',box).forEach(b=>b.onclick=()=>{ S.fill=b.dataset.fill; re(); });
  $$('.el-sw .pn-col',box).forEach(b=>b.onclick=()=>{ S.color=b.dataset.c; re(); });
  $('#el-col',box).onchange=e=>{ S.color=e.target.value; re(); };
  const rng=(id,key,fmt)=>{ const r=$('#'+id,box); r.oninput=()=>{ S[key]=+r.value; r.previousElementSibling.textContent=fmt?fmt(S[key]):S[key]; }; }; rng('el-w','w'); rng('el-sw','stroke'); rng('el-rot','rot',v=>v+'°');
  $('#el-flip',box).onchange=e=>{ S.flip=e.target.checked; };
  $('#el-en',box).onchange=e=>{ S.enter=e.target.value; }; $('#el-mo',box).onchange=e=>{ S.motion=e.target.value; };
  const sd=$('#el-side',box); if(sd) sd.onchange=e=>{ S.side=e.target.value; };
  $$('.el-it',box).forEach(b=>b.onclick=()=>{
    const dur=(S.enter==='handdraw'||S.enter==='draw')?1.1:0.7;
    const l={type:'shape',shape:b.dataset.n,x:50,y:50,w:S.w,color:S.color,look:S.look,fill:S.fill==='none'?false:S.fill,stroke:S.stroke,rot:S.rot,flip:S.flip,seed:Math.floor(Math.random()*90)+1,enter:{type:S.enter,dur}};
    if(S.motion) l.motion=[{type:S.motion,from:dur,to:60}];
    if(tl&&S.side){ l.attach=tl.id; l.side=S.side; l.gap=1.2; }
    anAddLayer(l,'E'); });
}
