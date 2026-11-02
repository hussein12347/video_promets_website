/* ===== UX layer behaviour: mobile tab bar, keyboard nav, language button placement ===== */
(function(){
  const $=s=>document.querySelector(s);
  /* nav items are <a> with no href: make them reachable and operable from the keyboard */
  function a11yNav(){ document.querySelectorAll('.navitem').forEach(a=>{ if(!a.hasAttribute('tabindex')){ a.setAttribute('tabindex','0'); a.setAttribute('role','link'); } }); }
  document.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.classList&&e.target.classList.contains('navitem')){ e.preventDefault(); e.target.click(); } });
  /* tab bar: five destinations that mirror the real nav (clicks are forwarded to it, so routing is unchanged) */
  const TABS=[['dashboard','🏠','الرئيسية'],['projects','🗂️','المشاريع'],['wizard','✨','جديد','cta'],['anim','🎞️','الاستوديو'],['more','☰','المزيد']];
  function build(){ if($('#tabbar')||!$('#shell')) return; const bar=document.createElement('nav'); bar.id='tabbar'; bar.setAttribute('aria-label','Main');
    TABS.forEach(([r,ic,lb,cls])=>{ const b=document.createElement('button'); b.type='button'; b.dataset.r=r; if(cls) b.className=cls; b.innerHTML='<span class="ic" aria-hidden="true">'+ic+'</span><span class="tl"></span>'; b.querySelector('.tl').textContent=lb;
      b.onclick=()=>{ if(r==='more'){ const m=$('#menuBtn'); m&&m.click(); return; } const n=document.querySelector('.navitem[data-route="'+r+'"]'); n&&n.click(); sync(); }; bar.appendChild(b); });
    document.body.appendChild(bar); sync(); }
  function sync(){ const act=document.querySelector('.navitem.active'); const r=act&&act.dataset.route; document.querySelectorAll('#tabbar button').forEach(b=>{ const on=b.dataset.r===r; b.classList.toggle('on',on); if(on) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); }); }
  /* language button: in the top bar on phones, floating on larger screens */
  const mq=window.matchMedia('(max-width:760px)');
  function placeLang(){ const f=$('#lang-fab'); const bar=$('#mobilebar'); if(!f||!bar) return; if(mq.matches){ f.classList.add('in-bar'); if(f.parentElement!==bar){ const t=$('#mobile-title'); bar.insertBefore(f,t?t.nextSibling:null); } } else { f.classList.remove('in-bar'); if(f.parentElement!==document.body) document.body.appendChild(f); } }
  function start(){ a11yNav(); build(); placeLang(); const nav=$('#topnav'); if(nav) new MutationObserver(()=>{ a11yNav(); sync(); }).observe(nav,{attributes:true,subtree:true,attributeFilter:['class']}); setInterval(()=>{ placeLang(); },800); mq.addEventListener&&mq.addEventListener('change',placeLang); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(start,50)); else setTimeout(start,50);
})();
