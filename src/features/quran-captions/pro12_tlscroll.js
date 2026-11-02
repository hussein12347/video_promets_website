/* ===== timeline: scroll up/down with the mouse wheel, touch, or by dragging empty space (not only the slider) ===== */
(function(){ if(window.__tlScroll) return; window.__tlScroll=true;
  const V=()=>document.getElementById('ed-tl'), H=()=>document.getElementById('tl-scroll');
  const canV=el=>el&&el.scrollHeight>el.clientHeight+1;
  document.addEventListener('wheel',e=>{ const tl=V(); if(!tl||!tl.contains(e.target)||e.ctrlKey||e.metaKey) return;
    const ax=Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.shiftKey; const h=H();
    if(ax&&h){ const d=e.shiftKey&&!e.deltaX?e.deltaY:e.deltaX; const b=h.scrollLeft; h.scrollLeft+=d; if(h.scrollLeft!==b) e.preventDefault(); return; }
    if(canV(tl)){ const b=tl.scrollTop; tl.scrollTop+=e.deltaY*(e.deltaMode===1?16:1); if(tl.scrollTop!==b) e.preventDefault(); } },{passive:false,capture:true});
  let drag=null, moved=false;
  const emptyArea=t=>{ if(!t||!t.closest) return false; if(t.closest('.tl-clip,.tl-ly,.tl-aud,.tl-h,.tl-ph,#tl-ruler,button,input,select,.tl-bar,.tl-hd')) return false; return !!t.closest('#ed-tl'); };
  document.addEventListener('pointerdown',e=>{ const tl=V(); if(!tl||!emptyArea(e.target)) return; if(e.pointerType==='touch') return; if(e.button!==0&&e.button!==1) return;
    drag={x:e.clientX,y:e.clientY,sl:(H()||{}).scrollLeft||0,st:tl.scrollTop,mid:e.button===1,id:e.pointerId}; moved=false; },true);
  document.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; if(!moved&&Math.hypot(dx,dy)<6&&!drag.mid) return; moved=true; const tl=V(), h=H(); if(!tl) return;
    tl.scrollTop=drag.st-dy; if(h) h.scrollLeft=drag.sl-dx; tl.classList.add('tl-panning'); e.preventDefault(); },{passive:false,capture:true});
  const end=()=>{ if(!drag) return; drag=null; const tl=V(); if(tl) tl.classList.remove('tl-panning'); if(moved) setTimeout(()=>{ moved=false; },0); };
  document.addEventListener('pointerup',end,true); document.addEventListener('pointercancel',end,true);
  document.addEventListener('click',e=>{ if(moved&&V()&&V().contains(e.target)){ e.stopPropagation(); e.preventDefault(); moved=false; } },true);
})();
