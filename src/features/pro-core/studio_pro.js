/* ---------------- studio pro: rail groups, resizable panes, collapsible side panels ---------------- */
const AN_RAIL_GROUPS=[['montage','json','media'],['text','marks','elements'],['animate','sync','captions','fx','trans','sounds'],['ai','hand','pro','finish'],['settings','props']];
function anPrefGet(k,d){ try{ const v=localStorage.getItem('an.pro.'+k); return v==null?d:v; }catch(e){ return d; } }
function anPrefSet(k,v){ try{ if(v==null) localStorage.removeItem('an.pro.'+k); else localStorage.setItem('an.pro.'+k,v); }catch(e){} }
function anEdPro(){
  const ed=document.getElementById('ed'); if(!ed||ed.classList.contains('pro')) return; ed.classList.add('pro');
  const rail=ed.querySelector('#ed-rail'), body=ed.querySelector('.ed-body'), left=ed.querySelector('#ed-left'), right=ed.querySelector('#ed-right'), tl=ed.querySelector('#ed-tl'), stage=ed.querySelector('#ed-stage');
  /* group the tools with thin dividers */
  AN_RAIL_GROUPS.slice(1).forEach(g=>{ const b=rail.querySelector('[data-p="'+g[0]+'"]'); if(b){ const s=document.createElement('i'); s.className='ed-sep'; s.setAttribute('aria-hidden','true'); rail.insertBefore(s,b); } });
  /* saved sizes */
  const apply=(k,css,v)=>{ if(v) ed.style.setProperty(css,v+'px'); else ed.style.removeProperty(css); };
  const lw=+anPrefGet('lw',0), rw=+anPrefGet('rw',0), th=+anPrefGet('tlh',0); apply('lw','--lw-user',lw); apply('rw','--rw-user',rw); apply('tlh','--tl-user',th);
  if(anPrefGet('noleft')==='1') ed.classList.add('no-left'); if(anPrefGet('noright')==='1') ed.classList.add('no-right');
  /* splitters */
  const mk=(cls,label,parent,before)=>{ const s=document.createElement('div'); s.className='ed-split '+cls; s.setAttribute('role','separator'); s.setAttribute('tabindex','0'); s.setAttribute('aria-label',label); s.title=label+' — اسحب لتغيير الحجم، دبل كليك للرجوع للافتراضي'; parent.insertBefore(s,before); return s; };
  const s1=mk('v s1','عرض اللوحة',body,right), s2=mk('v s2','عرض الخصائص',body,right.nextSibling), s3=mk('h s3','ارتفاع التايم لاين',ed,tl);
  const rtl=()=>getComputedStyle(ed).direction==='rtl';
  const sizeSoon=()=>{ cancelAnimationFrame(ed._rs); ed._rs=requestAnimationFrame(()=>{ try{ animSizeCanvas(); }catch(e){} try{ animDrawOverlay(); }catch(e){} }); };
  const drag=(s,onMove,onEnd)=>{ s.addEventListener('pointerdown',e=>{ if(e.button!==0) return; e.preventDefault(); s.setPointerCapture(e.pointerId); s.classList.add('drag'); document.body.classList.add('an-dragging'); const mv=ev=>{ onMove(ev); sizeSoon(); }; const up=()=>{ s.classList.remove('drag'); document.body.classList.remove('an-dragging'); s.removeEventListener('pointermove',mv); s.removeEventListener('pointerup',up); s.removeEventListener('pointercancel',up); onEnd&&onEnd(); sizeSoon(); }; s.addEventListener('pointermove',mv); s.addEventListener('pointerup',up); s.addEventListener('pointercancel',up); }); };
  const clampW=(v,a,b)=>Math.max(a,Math.min(b,Math.round(v)));
  const total=()=>body.getBoundingClientRect().width;
  drag(s1,ev=>{ const r=left.getBoundingClientRect(); const far=rtl()?r.right:r.left; const w=clampW(Math.abs(ev.clientX-far),260,Math.min(760,total()*0.55)); ed.style.setProperty('--lw-user',w+'px'); },()=>anPrefSet('lw',parseInt(ed.style.getPropertyValue('--lw-user'))||null));
  drag(s2,ev=>{ const r=right.getBoundingClientRect(); const far=rtl()?r.left:r.right; const w=clampW(Math.abs(ev.clientX-far),240,Math.min(620,total()*0.45)); ed.style.setProperty('--rw-user',w+'px'); },()=>anPrefSet('rw',parseInt(ed.style.getPropertyValue('--rw-user'))||null));
  drag(s3,ev=>{ const r=ed.getBoundingClientRect(); const h=clampW(r.bottom-ev.clientY-8,120,r.height*0.62); ed.style.setProperty('--tl-user',h+'px'); },()=>anPrefSet('tlh',parseInt(ed.style.getPropertyValue('--tl-user'))||null));
  [[s1,'--lw-user','lw'],[s2,'--rw-user','rw'],[s3,'--tl-user','tlh']].forEach(([s,css,k])=>{ s.ondblclick=()=>{ ed.style.removeProperty(css); anPrefSet(k,null); sizeSoon(); }; });
  /* keyboard resize (arrows) so the splitters are accessible */
  [[s1,'--lw-user',left,'w'],[s2,'--rw-user',right,'w'],[s3,'--tl-user',tl,'h']].forEach(([s,css,el,ax])=>{ s.onkeydown=e=>{ const k=e.key; if(!/^Arrow/.test(k)) return; e.preventDefault(); const r=el.getBoundingClientRect(); const cur=ax==='w'?r.width:r.height; const step=(e.shiftKey?60:20); let d=0; if(ax==='w'){ d=(k==='ArrowLeft'?-1:k==='ArrowRight'?1:0)*(rtl()?-1:1); if(el===right) d=-d; } else d=(k==='ArrowUp'?1:k==='ArrowDown'?-1:0); if(!d) return; ed.style.setProperty(css,Math.max(120,Math.round(cur+d*step))+'px'); sizeSoon(); }; });
  /* collapse the side panels (the inspector is a drawer on narrower windows) */
  const view=document.getElementById('view'); const drawer=()=>view&&view.getBoundingClientRect().width<1300;
  const exp=ed.querySelector('.ed-exp');
  const mkb=(id,ic,tip,isOn,flip)=>{ const b=document.createElement('button'); b.type='button'; b.id=id; b.className='ed-pbtn'; b.title=tip; b.setAttribute('aria-label',tip); b.textContent=ic; b.onclick=()=>{ flip(); sync(); sizeSoon(); }; b._on=isOn; return b; };
  const bl=mkb('ed-tg-left','▤','إظهار / إخفاء اللوحة الجانبية',()=>!ed.classList.contains('no-left'),()=>{ const on=ed.classList.toggle('no-left'); anPrefSet('noleft',on?'1':null); });
  const br=mkb('ed-tg-right','▥','إظهار / إخفاء الخصائص',()=>drawer()?ed.classList.contains('insp-open'):!ed.classList.contains('no-right'),()=>{ if(drawer()) ed.classList.toggle('insp-open'); else { const on=ed.classList.toggle('no-right'); anPrefSet('noright',on?'1':null); } });
  const sync=()=>{ bl.classList.toggle('on',bl._on()); br.classList.toggle('on',br._on()); }; ed._syncTg=sync; sync();
  if(exp){ const f=exp.querySelector('#ed-auto'); exp.insertBefore(bl,f); exp.insertBefore(br,f); }
  const sb=document.createElement('button'); sb.type='button'; sb.id='ed-stepsbtn'; sb.className='ed-stepsbtn'; sb.title='خطوات العمل'; sb.innerHTML='📋 الخطوات'; sb.onclick=e=>{ e.stopPropagation(); ed.classList.toggle('steps-open'); }; if(exp) exp.insertBefore(sb,exp.firstChild);
  document.addEventListener('pointerdown',e=>{ if(ed.classList.contains('steps-open')&&!e.target.closest('.ed-steps')&&e.target!==sb) ed.classList.remove('steps-open'); },true);
  /* in drawer mode: picking an element opens the inspector */
  ed._inspAuto=()=>{ if(drawer()&&ANIM.sel&&ANIM.sel.layer&&!ed.classList.contains('insp-open')){ ed.classList.add('insp-open'); sync(); } };
  window.addEventListener('resize',()=>sync());

  /* tools that do not fit the rail's height go into a ⋯ menu (like pro editors) */
  const more=document.createElement('button'); more.type='button'; more.className='ed-more'; more.hidden=true; more.title='المزيد من الأدوات'; more.setAttribute('aria-haspopup','menu'); more.innerHTML='<span>⋯</span><small>المزيد</small>'; rail.appendChild(more);
  const pop=document.createElement('div'); pop.className='ed-pop'; pop.setAttribute('role','menu'); pop.hidden=true; body.appendChild(pop);
  const closePop=()=>{ pop.hidden=true; more.setAttribute('aria-expanded','false'); };
  const railFit=()=>{ const vertical=getComputedStyle(rail).flexDirection==='column'; const kids=[...rail.children].filter(k=>k!==more);
    kids.forEach(k=>k.classList.remove('ov')); more.hidden=true; more.classList.remove('on'); if(!vertical){ closePop(); return; }
    const H=rail.clientHeight-16; let acc=0, cut=-1; const hs=kids.map(k=>k.offsetHeight+(k.classList.contains('ed-sep')?12:2));
    const total=hs.reduce((a,b)=>a+b,0); if(total<=H){ closePop(); return; }
    const budget=H-58; for(let i=0;i<kids.length;i++){ acc+=hs[i]; if(acc>budget){ cut=i; break; } }
    if(cut<0) return; while(cut>0&&kids[cut-1].classList.contains('ed-sep')) cut--; /* never end on a divider */
    const hidden=kids.slice(cut).filter(k=>k.classList.contains('ed-rb')&&!k.classList.contains('ed-mob')); kids.slice(cut).forEach(k=>k.classList.add('ov')); more.hidden=false;
    more.classList.toggle('on',hidden.some(b=>b.classList.contains('on')));
    pop.innerHTML=hidden.map(b=>'<button type="button" role="menuitem" class="ed-pi'+(b.classList.contains('on')?' on':'')+'" data-p="'+b.dataset.p+'"><span>'+b.querySelector('span').textContent+'</span>'+esc(b.title)+'</button>').join('');
    pop.querySelectorAll('.ed-pi').forEach(x=>x.onclick=()=>{ const o=rail.querySelector('.ed-rb[data-p="'+x.dataset.p+'"]'); closePop(); if(o) o.click(); setTimeout(railFit,0); }); };
  more.onclick=e=>{ e.stopPropagation(); const open=pop.hidden; railFit(); pop.hidden=!open; more.setAttribute('aria-expanded',String(open)); };
  document.addEventListener('pointerdown',e=>{ if(!pop.hidden&&!pop.contains(e.target)&&!more.contains(e.target)) closePop(); },true);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closePop(); });
  rail.addEventListener('click',()=>setTimeout(railFit,0));
  ed._railFit=railFit; if(window.ResizeObserver){ try{ const ro2=new ResizeObserver(()=>railFit()); ro2.observe(rail); }catch(e){} } setTimeout(railFit,50); setTimeout(railFit,600);
  /* open on a fitted timeline */
  setTimeout(()=>{ const f=document.getElementById('tl-fit'); if(f&&!ANIM._tlFitted){ f.click(); ANIM._tlFitted=true; } },700);
  /* the stage follows its container (window resize, splitters, panel collapse) */
  if(window.ResizeObserver&&stage){ try{ if(ed._ro) ed._ro.disconnect(); ed._ro=new ResizeObserver(()=>sizeSoon()); ed._ro.observe(stage); }catch(e){} }
  /* clicking the tool that is already open hides the panel (like pro editors) */
  rail.addEventListener('click',e=>{ const b=e.target.closest('.ed-rb'); if(!b||window.matchMedia(AN_PHONE_Q).matches) return; if(b.dataset.same==='1'){ const on=ed.classList.toggle('no-left'); anPrefSet('noleft',on?'1':null); sync(); sizeSoon(); } else if(ed.classList.contains('no-left')){ ed.classList.remove('no-left'); anPrefSet('noleft',null); sync(); sizeSoon(); } },true);
  rail.addEventListener('pointerdown',e=>{ const b=e.target.closest('.ed-rb'); if(b) b.dataset.same=b.classList.contains('on')?'1':'0'; },true);
}

/* wrap the inspector refresh so the drawer opens when an element is picked */
(function(){ const f=window.animRefreshSide; if(typeof f==='function'&&!f._pro){ const g=function(){ const r=f.apply(this,arguments); try{ const ed=document.getElementById('ed'); if(ed&&ed._inspAuto) ed._inspAuto(); }catch(e){} return r; }; g._pro=true; window.animRefreshSide=g; } })();
