/* ===== pro16: أشكال متعددة للعلامات (variants) + أنواع جديدة — مثل مكتبة العناصر ===== */
window.ANMV=(function(){
  const PI=Math.PI, hash=n=>{ const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };
  /* [id, arabic label] — '' is the original look */
  const V={
    underline:[['','مستقيم'],['wavy','متموج'],['double','مزدوج'],['brush','فرشاة'],['dashed','متقطع'],['swoosh','انسيابي']],
    highlight:[['','ماركر'],['pill','كبسولة'],['half','نصف سفلي'],['slant','مائل'],['brush','فرشاة خشنة']],
    circle:[['','يدوية'],['double','لفّتين'],['clean','بيضاوي نظيف'],['rough','خشنة'],['squircle','مربع مدوّر']],
    box:[['','يدوي'],['clean','نظيف'],['round','مدوّر'],['corners','زوايا فقط'],['double','مزدوج']],
    strike:[['','مستقيم'],['double','مزدوج'],['wavy','متموج'],['hatch','تهشير']],
    arrow:[['','منحني'],['straight','مستقيم'],['bold','عريض'],['loop','منحنى كبير'],['double','برأسين']],
    cross:[['','عادية'],['bold','عريضة'],['round','داخل دائرة']],
    check:[['','عادية'],['bold','عريضة'],['round','داخل دائرة'],['double','علامتين']],
    bracket:[['','معقوف'],['square','مربّع'],['paren','هلالي'],['both','من الجهتين']],
    burst:[['','أشعة'],['dense','كثيفة'],['star','نجمة']],
    zigzag:[['','حاد'],['wave','موجة'],['loops','حلقات']],
    scribble:[['','خربشة'],['tight','مكثّفة'],['zig','أفقية']],
    spotlight:[['','بيضاوي'],['rect','مستطيل'],['soft','ناعم']],
    star:[['','خماسية'],['six','سداسية'],['double','نجمتان']],
    heart:[['','قلب'],['double','قلبان'],['small','قلوب صغيرة']],
    sparkle:[['','لمعة'],['cluster','لمعات'],['plus','زائد']],
    question:[['','؟'],['circled','داخل دائرة']],
    exclaim:[['','!'],['double','!!'],['circled','داخل دائرة']],
    bullseye:[['','حلقات'],['cross','تصويب'],['dot','نقطة']],
    lightning:[['','برق'],['double','برقان']]
  };
  const NEW_TYPES={star:['نجمة','★'],heart:['قلب','♥'],sparkle:['لمعة','✦'],question:['علامة استفهام','؟'],exclaim:['علامة تعجب','!'],bullseye:['هدف','◎'],lightning:['برق','ϟ']};
  const SQUARE={star:1,heart:1,sparkle:1,question:1,exclaim:1,bullseye:1,lightning:1,cross:0,check:0};
  const ok=(k,v)=>!v||(V[k]||[]).some(x=>x[0]===v);

  function path(kind,vr,w,h,seed,rtl){
    vr=vr||''; const isNew=!!NEW_TYPES[kind]; if(!vr&&!isNew) return null; if(!ok(kind,vr)&&!isNew) return null;
    const R=n=>hash(seed*13.7+n)-0.5; const wob=Math.min(w,h||w)*0.025+1.5; let pts=[]; let lw=1;
    const jl=(x0,y0,x1,y1,n,k)=>{ k=k==null?1:k; for(let i=0;i<=n;i++){ const t=i/n; pts.push([x0+(x1-x0)*t+R(i+(pts.length))*wob*k, y0+(y1-y0)*t+R(i+50+pts.length)*wob*k]); } };
    const ln=(x0,y0,x1,y1,n)=>{ for(let i=0;i<=n;i++){ const t=i/n; pts.push([x0+(x1-x0)*t,y0+(y1-y0)*t]); } };
    const A=Math.max(3,Math.min(w*0.04,22)); const sgn=rtl?-1:1; const a=-w/2*sgn, b=-a;
    const put=P=>{ P.forEach(p=>pts.push(p)); };
    const ell=(rx,ry,t0,t1,n,jit,rot)=>{ for(let i=0;i<=n;i++){ const t=t0+(t1-t0)*i/n; const rr=1+(jit?R(i)*jit:0); pts.push([Math.cos(t)*rx*rr,Math.sin(t)*ry*rr]); } };
    const gap=()=>pts.push(null);
    const s2=(sx,sy,arr)=>arr.map(p=>p?[p[0]*sx,p[1]*sy]:null);
    const m=Math.min(w,h||w);
    switch(kind){
      case 'underline': {
        const y=(h||w*0.3)/2;
        if(vr==='wavy'){ const cyc=Math.max(2,Math.round(w/60)), n=cyc*12; for(let i=0;i<=n;i++){ const t=i/n; pts.push([a+(b-a)*t,y+Math.sin(t*cyc*2*PI)*A*0.9+R(i)*wob*0.4]); } }
        else if(vr==='double'){ jl(a,y-A*0.6,b,y-A*0.6+R(2)*wob,16,0.6); gap(); jl(a+w*0.06*sgn,y+A*0.7,b-w*0.04*sgn,y+A*0.7+R(3)*wob,14,0.6); }
        else if(vr==='brush'){ jl(a,y,b,y+R(2)*wob*2,18,0.7); lw=2.8; }
        else if(vr==='dashed'){ const n=Math.max(4,Math.round(w/34)); for(let i=0;i<n;i++){ const x0=a+(b-a)*i/n, x1=a+(b-a)*(i+0.62)/n; ln(x0,y+R(i)*wob,x1,y+R(i+9)*wob,3); gap(); } }
        else if(vr==='swoosh'){ const n=30; for(let i=0;i<=n;i++){ const t=i/n; const x=a+(b-a)*t; const yy=y+A*1.2*Math.sin(t*PI)*(1-t*0.5)-A*0.6*t; pts.push([x,yy+R(i)*wob*0.3]); } lw=1.6; }
        break; }
      case 'strike': {
        if(vr==='double'){ jl(a,-A*0.6,b,-A*0.6+R(1)*wob,16,0.6); gap(); jl(b,A*0.6,a,A*0.6+R(2)*wob,16,0.6); }
        else if(vr==='wavy'){ const cyc=Math.max(2,Math.round(w/60)), n=cyc*12; for(let i=0;i<=n;i++){ const t=i/n; pts.push([a+(b-a)*t,Math.sin(t*cyc*2*PI)*A*0.9]); } }
        else if(vr==='hatch'){ const n=Math.max(5,Math.round(w/(A*1.6))); for(let i=0;i<n;i++){ const x=a+(b-a)*(i+0.5)/n; ln(x-A*0.6*sgn,A*1.1,x+A*0.6*sgn,-A*1.1,2); gap(); } }
        break; }
      case 'highlight': break;
      case 'zigzag': {
        if(vr==='wave'){ const cyc=Math.max(3,Math.round(w/50)), n=cyc*10; for(let i=0;i<=n;i++){ const t=i/n; pts.push([-w/2+w*t,Math.sin(t*cyc*2*PI)*(h||A*2)/2]); } }
        else if(vr==='loops'){ const cyc=Math.max(3,Math.round(w/55)), n=cyc*16, r=Math.max(4,(h||A*3)/2); for(let i=0;i<=n;i++){ const t=i/n, ang=t*cyc*2*PI; pts.push([-w/2+w*t-Math.sin(ang)*r*0.9,-Math.cos(ang)*r]); } }
        break; }
      case 'circle': {
        const rx=w/2, ry=(h||w*0.3)/2;
        if(vr==='double'){ const n=90; for(let i=0;i<=n;i++){ const t=i/n, ang=-PI*0.35+t*2.15*2*PI, k=1+t*0.07+R(i)*0.035; pts.push([Math.cos(ang)*rx*k,Math.sin(ang)*ry*k]); } }
        else if(vr==='clean'){ ell(rx,ry,-PI/2,-PI/2+2*PI*1.03,60,0); }
        else if(vr==='rough'){ const n=130; for(let i=0;i<=n;i++){ const t=i/n, ang=-PI*0.2+t*2.6*2*PI, k=1+R(i)*0.16+0.05*Math.sin(t*9); pts.push([Math.cos(ang)*rx*k,Math.sin(ang)*ry*k]); } lw=0.9; }
        else if(vr==='squircle'){ const n=80; for(let i=0;i<=n+3;i++){ const ang=-PI/2+i/n*2*PI; const c=Math.cos(ang), s=Math.sin(ang); pts.push([Math.sign(c)*Math.pow(Math.abs(c),0.5)*rx,Math.sign(s)*Math.pow(Math.abs(s),0.5)*ry]); } }
        break; }
      case 'box': {
        const x0=-w/2,x1=w/2,y0=-h/2,y1=h/2; const rect=(k,ins)=>{ const c=[[x0+ins,y0+ins],[x1-ins,y0+ins],[x1-ins,y1-ins],[x0+ins,y1-ins],[x0+ins,y0+ins]]; for(let q=0;q<4;q++) { if(k) jl(c[q][0],c[q][1],c[q+1][0],c[q+1][1],8,k); else ln(c[q][0],c[q][1],c[q+1][0],c[q+1][1],6); } };
        if(vr==='clean'){ rect(0,0); }
        else if(vr==='round'){ const r=Math.min(w,h)*0.22; const seg=(cx,cy,t0)=>{ for(let i=0;i<=6;i++){ const t=t0+i/6*PI/2; pts.push([cx+Math.cos(t)*r,cy+Math.sin(t)*r]); } };
          pts.push([x0+r,y0]); pts.push([x1-r,y0]); seg(x1-r,y0+r,-PI/2); pts.push([x1,y1-r]); seg(x1-r,y1-r,0); pts.push([x0+r,y1]); seg(x0+r,y1-r,PI/2); pts.push([x0,y0+r]); seg(x0+r,y0+r,PI); pts.push([x0+r,y0]); }
        else if(vr==='corners'){ const L=Math.min(w,h)*0.32; [[x0,y0,1,1],[x1,y0,-1,1],[x1,y1,-1,-1],[x0,y1,1,-1]].forEach(c=>{ ln(c[0],c[1]+c[3]*L,c[0],c[1],4); ln(c[0],c[1],c[0]+c[2]*L,c[1],4); gap(); }); }
        else if(vr==='double'){ rect(0.7,0); gap(); rect(0.7,Math.min(w,h)*0.07); }
        break; }
      case 'scribble': {
        if(vr==='tight'){ const n=150; for(let i=0;i<=n;i++){ const t=i/n, ang=t*5.2*2*PI; pts.push([Math.cos(ang)*w/2*(0.9+R(i)*0.08),Math.sin(ang)*(h||w*0.3)/2*(0.35+0.65*Math.sin(t*PI))]); } }
        else if(vr==='zig'){ const n=Math.max(6,Math.round(w/(A*1.4))); const hh=(h||w*0.3)/2; for(let i=0;i<=n;i++){ const x=-w/2+w*i/n; pts.push([x,(i%2?hh:-hh)*(0.7+0.3*Math.sin(i))]); } }
        break; }
      case 'cross': {
        const x0=-w/2,x1=w/2,y0=-h/2,y1=h/2;
        if(vr==='bold'){ jl(x0,y0,x1,y1,10,0.7); gap(); jl(x1,y0,x0,y1,10,0.7); lw=2.4; }
        else if(vr==='round'){ ell(w/2,h/2,0,2*PI*1.02,48,0.04); gap(); ln(x0*0.55,y0*0.55,x1*0.55,y1*0.55,6); gap(); ln(x1*0.55,y0*0.55,x0*0.55,y1*0.55,6); }
        break; }
      case 'check': {
        const x0=-w/2,x1=w/2,y0=-h/2,y1=h/2;
        if(vr==='bold'){ jl(x0,0,-w/8,y1,8,0.6); jl(-w/8,y1,x1,y0,12,0.6); lw=2.4; }
        else if(vr==='round'){ ell(w/2,h/2,0,2*PI*1.02,48,0.04); gap(); ln(x0*0.5,0,-w/9,y1*0.5,5); ln(-w/9,y1*0.5,x1*0.55,y0*0.5,7); }
        else if(vr==='double'){ jl(x0,0,-w/6,y1*0.9,6,0.6); jl(-w/6,y1*0.9,w*0.28,y0*0.8,9,0.6); gap(); jl(-w*0.18,0,w*0.02,y1*0.9,6,0.6); jl(w*0.02,y1*0.9,x1,y0,12,0.6); }
        break; }
      case 'bracket': {
        const x=rtl?-w/2:w/2, s=rtl?-1:1;
        const curly=(xx,ss)=>{ ln(xx-ss*w*0.15,-h/2,xx,-h/2+h*0.08,4); ln(xx,-h/2+h*0.08,xx,-h*0.06,8); ln(xx,-h*0.06,xx+ss*w*0.12,0,3); ln(xx+ss*w*0.12,0,xx,h*0.06,3); ln(xx,h*0.06,xx,h/2-h*0.08,8); ln(xx,h/2-h*0.08,xx-ss*w*0.15,h/2,4); };
        if(vr==='square'){ ln(x-s*w*0.14,-h/2,x,-h/2,3); ln(x,-h/2,x,h/2,12); ln(x,h/2,x-s*w*0.14,h/2,3); }
        else if(vr==='paren'){ for(let i=0;i<=20;i++){ const t=-PI/3+i/20*2*PI/3; pts.push([x-s*w*0.1+Math.cos(t)*w*0.1*s,Math.sin(t)*h/2*1.15]); } }
        else if(vr==='both'){ curly(w/2,1); gap(); curly(-w/2,-1); }
        break; }
      case 'burst': {
        const n=vr==='dense'?20:10;
        if(vr==='star'){ const N=10; for(let i=0;i<=N;i++){ const ang=-PI/2+i*2*PI/N; const r=i%2?0.6:1; pts.push([Math.cos(ang)*w/2*r,Math.sin(ang)*h/2*r]); } }
        else if(vr==='dense'){ for(let i=0;i<n;i++){ const ang=-PI/2+i*2*PI/n; const r0=0.7, r1=(i%2?0.84:0.95)+R(i)*0.06; ln(Math.cos(ang)*w/2*r0,Math.sin(ang)*h/2*r0,Math.cos(ang)*w/2*r1,Math.sin(ang)*h/2*r1,2); gap(); } }
        break; }
      /* ---------- new kinds (fit inside a w×h box) ---------- */
      case 'star': { const N=vr==='six'?6:5; const sp=(r0,r1,rot)=>{ for(let i=0;i<=N*2;i++){ const ang=rot+i*PI/N; const r=i%2?r1:r0; pts.push([Math.cos(ang)*w/2*r,Math.sin(ang)*h/2*r]); } };
        sp(1,vr==='six'?0.58:0.42,-PI/2); if(vr==='double'){ gap(); sp(0.55,0.23,-PI/2); } break; }
      case 'heart': { const hp=(cx,cy,sc)=>{ for(let i=0;i<=40;i++){ const t=i/40*2*PI; const x=16*Math.pow(Math.sin(t),3), y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)); pts.push([cx+x/17*w/2*sc,cy+y/17*h/2*sc]); } };
        if(vr==='double'){ hp(0,0,1); gap(); hp(0,0.04*h,0.55); } else if(vr==='small'){ hp(-w*0.28,h*0.12,0.42); gap(); hp(w*0.22,-h*0.1,0.5); gap(); hp(-w*0.02,-h*0.3,0.3); } else hp(0,0,1); break; }
      case 'sparkle': { const sp=(cx,cy,r)=>{ const N=8; for(let i=0;i<=N;i++){ const ang=-PI/2+i*PI*2/N; const rr=i%2?r*0.22:r; pts.push([cx+Math.cos(ang)*rr*w/2,cy+Math.sin(ang)*rr*h/2]); } };
        if(vr==='cluster'){ sp(-w*0.18,h*0.1,0.75); gap(); sp(w*0.3,-h*0.28,0.4); gap(); sp(w*0.28,h*0.32,0.28); } else if(vr==='plus'){ ln(0,-h/2,0,h/2,6); gap(); ln(-w/2,0,w/2,0,6); } else sp(0,0,1); break; }
      case 'question': { const u=Math.min(w,h*0.95); const c=vr==='circled'; if(c){ ell(u/2,u/2,0,2*PI*1.02,48,0.02); gap(); } const k=c?0.5:1, r=u*0.27*k, cy=-u*0.2*k;
        for(let i=0;i<=26;i++){ const t=-PI*1.0+i/26*PI*1.55; pts.push([Math.cos(t)*r,cy+Math.sin(t)*r]); } ln(Math.cos(PI*0.55)*r,cy+Math.sin(PI*0.55)*r,0,u*0.16*k,3); gap(); ln(0,u*0.34*k,0,u*0.35*k,1); lw=1.3; break; }
      case 'exclaim': { const u=Math.min(w,h*0.95); const c=vr==='circled'; const k=c?0.5:1; if(c){ ell(u/2,u/2,0,2*PI*1.02,48,0.02); gap(); }
        const one=x=>{ ln(x,-u*0.44*k,x+R(1)*2,u*0.1*k,8); gap(); ln(x,u*0.3*k,x,u*0.32*k,1); gap(); }; if(vr==='double'){ one(-u*0.16); one(u*0.16); } else one(0); lw=1.5; break; }
      case 'bullseye': { const ring=(f)=>{ ell(w/2*f,h/2*f,0,2*PI*1.02,48,0.02); gap(); };
        if(vr==='dot'){ ring(1); ring(0.55); ln(0,0,0.5,0,1); } else if(vr==='cross'){ ring(1); ring(0.5); ln(-w/2*1.12,0,-w/2*0.28,0,3); gap(); ln(w/2*0.28,0,w/2*1.12,0,3); gap(); ln(0,-h/2*1.12,0,-h/2*0.28,3); gap(); ln(0,h/2*0.28,0,h/2*1.12,3); } else { ring(1); ring(0.62); ring(0.26); } break; }
      case 'lightning': { const bolt=(dx,sc)=>{ put(s2(w/2*sc,h/2*sc,[[0.18,-1],[-0.5,0.1],[-0.02,0.1],[-0.3,1],[0.55,-0.25],[0.05,-0.25],[0.18,-1]]).map(p=>[p[0]+dx,p[1]])); };
        if(vr==='double'){ bolt(-w*0.22,0.75); gap(); bolt(w*0.22,0.75); } else bolt(0,1); break; }
      default: return null;
    }
    if(!pts.length) return null; if(lw!==1) pts.lw=lw; return pts;
  }

  /* highlight look variants (filled band). returns true if handled */
  function hl(ctx,vr,x,ww,hh,seed){ if(!vr) return false; const y=-hh/2, rr=n=>hash(seed*7.7+n)-0.5; ctx.beginPath();
    if(vr==='pill'){ const r=hh/2; ctx.moveTo(x+r,y); ctx.lineTo(x+Math.max(r,ww-r),y); ctx.arc(x+Math.max(r,ww-r),0,r,-PI/2,PI/2); ctx.lineTo(x+r,hh/2); ctx.arc(x+r,0,r,PI/2,PI*1.5); }
    else if(vr==='half'){ ctx.rect(x,0,ww,hh/2); }
    else if(vr==='slant'){ const k=hh*0.35; ctx.moveTo(x+k,y); ctx.lineTo(x+ww,y); ctx.lineTo(x+ww-k,hh/2); ctx.lineTo(x,hh/2); }
    else if(vr==='brush'){ const n=Math.max(6,Math.round(ww/22)); for(let i=0;i<=n;i++){ const px=x+ww*i/n; const py=y+rr(i)*hh*0.22; i?ctx.lineTo(px,py):ctx.moveTo(px,py); } for(let i=n;i>=0;i--){ ctx.lineTo(x+ww*i/n,hh/2+rr(i+40)*hh*0.22); } }
    else return false; ctx.closePath(); ctx.fill(); return true; }

  return {V,NEW_TYPES,SQUARE,ok,path,hl,variants:k=>V[k]||[['','']],label:(k,v)=>((V[k]||[]).find(x=>x[0]===(v||''))||['',''])[1]};
})();

/* ===== معاينات + لوحة العلامات الجديدة (معرض أشكال مثل العناصر) ===== */
(function(){
  const PI=Math.PI, hash=n=>{ const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };
  /* copy of the engine's default marks, used only for gallery previews */
  ANMV.base=function(kind,w,h,seed){ const R=n=>hash(seed*13.7+n)-0.5; const wob=Math.min(w,h||w)*0.025+1.5; const pts=[];
    const line=(x0,y0,x1,y1,n)=>{ for(let i=0;i<=n;i++){ const t=i/n; pts.push([x0+(x1-x0)*t+R(i)*wob,y0+(y1-y0)*t+R(i+50)*wob]); } };
    if(kind==='underline'||kind==='highlight'||kind==='strike'){ const y=kind==='underline'?h/2:0; line(-w/2,y+R(1)*wob*2,w/2,y+R(2)*wob*2,18); }
    else if(kind==='zigzag'){ const n=10; for(let i=0;i<=n;i++) pts.push([-w/2+w*i/n,(i%2?-h/2:h/2)+R(i)*wob]); }
    else if(kind==='circle'||kind==='scribble'){ const turns=kind==='scribble'?2.6:1.12, n=kind==='scribble'?90:48, a0=-PI*0.35; for(let i=0;i<=n;i++){ const t=i/n, ang=a0+t*turns*2*PI, rr=1+R(i)*0.06+(t>0.9?(t-0.9)*0.5:0); pts.push([Math.cos(ang)*w/2*rr,Math.sin(ang)*h/2*rr*(kind==='scribble'?0.55+0.45*Math.sin(t*PI):1)]); } }
    else if(kind==='box'){ const c=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2],[-w/2+w*0.08,-h/2-wob]]; for(let k=0;k<4;k++) line(c[k][0],c[k][1],c[k+1][0],c[k+1][1],8); }
    else if(kind==='cross'){ line(-w/2,-h/2,w/2,h/2,10); pts.push(null); line(w/2,-h/2,-w/2,h/2,10); }
    else if(kind==='check'){ line(-w/2,0,-w/8,h/2,8); line(-w/8,h/2,w/2,-h/2,12); }
    else if(kind==='bracket'){ const x=w/2, s=1; line(x-s*w*0.15,-h/2,x,-h/2+h*0.08,4); line(x,-h/2+h*0.08,x,-h*0.06,8); line(x,-h*0.06,x+s*w*0.12,0,3); line(x+s*w*0.12,0,x,h*0.06,3); line(x,h*0.06,x,h/2-h*0.08,8); line(x,h/2-h*0.08,x-s*w*0.15,h/2,4); }
    else if(kind==='burst'){ const n=10; for(let i=0;i<n;i++){ const ang=-PI/2+i*2*PI/n, r0=0.62, r1=0.85+R(i)*0.1; line(Math.cos(ang)*w/2*r0,Math.sin(ang)*h/2*r0,Math.cos(ang)*w/2*r1,Math.sin(ang)*h/2*r1,2); pts.push(null); } }
    return pts; };
  const strokePts=(ctx,pts)=>{ ctx.beginPath(); let pen=false; pts.forEach(p=>{ if(!p){ pen=false; return; } if(!pen){ ctx.moveTo(p[0],p[1]); pen=true; } else ctx.lineTo(p[0],p[1]); }); ctx.stroke(); };
  ANMV.preview=function(cv,k,v,color){
    const W=cv.width, H=cv.height, x=cv.getContext('2d'); x.clearRect(0,0,W,H); x.save(); x.translate(W/2,H/2); x.lineCap='round'; x.lineJoin='round'; x.strokeStyle=color; x.fillStyle=color; x.lineWidth=3.2;
    const sq=!!ANMV.SQUARE[k]; let w=sq?H*0.7:W*0.72, h=sq?H*0.7:H*0.5;
    if(k==='underline'||k==='strike'){ h=H*0.3; } if(k==='circle'){ w=W*0.74; h=H*0.62; } if(k==='bracket'){ w=W*0.3; h=H*0.74; } if(k==='cross'||k==='check'){ w=W*0.42; h=H*0.5; } if(k==='bullseye'){ w=H*0.74; h=H*0.74; }
    try{
      if(k==='highlight'){ x.globalAlpha=0.7; x.fillStyle='#FFE34D'; const hh=H*0.36; if(!ANMV.hl(x,v,-w/2,w,hh,3)){ x.beginPath(); const r=hh*0.25; x.moveTo(-w/2+r,-hh/2); x.arcTo(w/2,-hh/2,w/2,hh/2,r); x.arcTo(w/2,hh/2,-w/2,hh/2,r); x.arcTo(-w/2,hh/2,-w/2,-hh/2,r); x.arcTo(-w/2,-hh/2,w/2,-hh/2,r); x.fill(); } x.globalAlpha=1; x.fillStyle=color; x.font='700 '+Math.round(H*0.3)+'px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.globalAlpha=0.35; x.fillText('Aa',0,0); }
      else if(k==='spotlight'){ x.setTransform(1,0,0,1,0,0); x.fillStyle=v==='soft'?'rgba(0,0,0,.4)':'rgba(0,0,0,.65)'; x.beginPath(); x.rect(0,0,W,H); if(v==='rect') x.rect(W*0.22,H*0.2,W*0.56,H*0.6); else x.ellipse(W/2,H/2,W*0.28,H*0.3,0,0,2*PI,true); x.fill('evenodd'); }
      else if(k==='arrow'){ const kk=({straight:0,loop:0.55})[v]; const c=kk==null?0.25:kk; const sx=-W*0.34, sy=H*0.26, tx=W*0.3, ty=-H*0.2; const mx=(sx+tx)/2+(ty-sy)*c, my=(sy+ty)/2-(tx-sx)*c; if(v==='bold') x.lineWidth=6; x.beginPath(); x.moveTo(sx,sy); x.quadraticCurveTo(mx,my,tx,ty); x.stroke(); const head=(px,py,qx,qy)=>{ const a=Math.atan2(py-qy,px-qx), hs=x.lineWidth*3.4; x.beginPath(); x.moveTo(px,py); x.lineTo(px-hs*Math.cos(a-0.5),py-hs*Math.sin(a-0.5)); x.moveTo(px,py); x.lineTo(px-hs*Math.cos(a+0.5),py-hs*Math.sin(a+0.5)); x.stroke(); };
        const t2=0.92, qx=(1-t2)*(1-t2)*sx+2*(1-t2)*t2*mx+t2*t2*tx, qy=(1-t2)*(1-t2)*sy+2*(1-t2)*t2*my+t2*t2*ty; head(tx,ty,qx,qy); if(v==='double'){ const t3=0.08, rx=(1-t3)*(1-t3)*sx+2*(1-t3)*t3*mx+t3*t3*tx, ry=(1-t3)*(1-t3)*sy+2*(1-t3)*t3*my+t3*t3*ty; head(sx,sy,rx,ry); } }
      else { const hh=(k==='underline')?h:h; const p=ANMV.path(k,v,w,k==='underline'?h:h,3,false)||ANMV.base(k,w,h,3); if(k==='underline'&&!v){ x.translate(0,-h/2+2); } if(p.lw) x.lineWidth*=p.lw; if(k==='bracket') x.translate(-w*0.3,0); strokePts(x,p); }
    }catch(e){ /* preview is cosmetic */ }
    x.restore(); };

  window.anPanelMarks=function(box){
    const sel=ANIM.sel.layer; const i=anSceneIdx(); const tl=sel&&i>=0?anLayerRaw(i,sel):null; const S=ANMV._st=ANMV._st||{color:'#E53935',hand:true};
    const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const types=Object.keys(AN_MARK_AR); const COLORS=['#E53935','#FFD54F','#1E88E5','#43A047','#111111','#FFFFFF','#FF7043','#8E24AA'];
    box.innerHTML=anPanelHead('✏️ علامات يدوية','لكل علامة أكثر من شكل — اختار الشكل وهيتحط على العنصر المحدد (أو في المشهد).')+
     (tl&&tl.type!=='mark'?'<p class="an-ok">ستُطبَّق على العنصر المحدد: '+esc2(tl.id)+'</p>':'')+
     '<div class="pn-sec"><label class="an-sw"><input type="checkbox" id="pn-mk-hand" '+(S.hand?'checked':'')+'><span>تُرسم باليد (تظهر اليد أثناء الرسم)</span></label><div class="pn-colors">'+COLORS.map(c=>'<button type="button" class="pn-col'+(c===S.color?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="'+c+'"></button>').join('')+'</div></div>'+
     '<div class="mv-chips" role="tablist" aria-label="نوع العلامة">'+types.map(k=>'<button type="button" class="mv-chip'+((S.cat||types[0])===k?' on':'')+'" data-cat="'+k+'" aria-pressed="'+((S.cat||types[0])===k)+'"><span aria-hidden="true">'+AN_MARK_AR[k][1]+'</span>'+AN_MARK_AR[k][0]+'</button>').join('')+'</div>'+
     '<div class="mv-grid" id="mv-grid"></div>'+'<div class="mv-all-h">كل الأشكال</div><div id="mv-all"></div>';
    const drawGrid=()=>{ const cat=S.cat||types[0]; const g=box.querySelector('#mv-grid'); g.innerHTML=ANMV.variants(cat).map(v=>'<button type="button" class="mv-t" data-k="'+cat+'" data-v="'+v[0]+'" title="'+esc2(AN_MARK_AR[cat][0]+' — '+v[1])+'"><canvas width="132" height="76"></canvas><span>'+esc2(v[1])+'</span></button>').join(''); g.querySelectorAll('.mv-t').forEach(b=>ANMV.preview(b.querySelector('canvas'),b.dataset.k,b.dataset.v,S.color)); g.querySelectorAll('.mv-t').forEach(b=>b.onclick=()=>add(b.dataset.k,b.dataset.v)); };
    const drawAll=()=>{ const a=box.querySelector('#mv-all'); a.innerHTML=types.map(k=>'<div class="mv-row"><b>'+AN_MARK_AR[k][1]+' '+esc2(AN_MARK_AR[k][0])+'</b><div class="mv-mini">'+ANMV.variants(k).map(v=>'<button type="button" class="mv-m" data-k="'+k+'" data-v="'+v[0]+'" title="'+esc2(v[1])+'"><canvas width="84" height="48"></canvas></button>').join('')+'</div></div>').join(''); a.querySelectorAll('.mv-m').forEach(b=>{ ANMV.preview(b.querySelector('canvas'),b.dataset.k,b.dataset.v,S.color); b.onclick=()=>add(b.dataset.k,b.dataset.v); }); };
    const add=(k,v)=>{ S.hand=box.querySelector('#pn-mk-hand').checked; const sq=!!ANMV.SQUARE[k]; const thin=k==='underline'||k==='strike'||k==='zigzag';
      const l={type:'mark',mark:k,color:k==='highlight'?'#FFE34D':S.color,x:50,y:50,w:sq?16:30,h:thin?4:(sq?16:18),enter:{type:k==='spotlight'?'fade':(S.hand?'handdraw':'draw'),dur:k==='spotlight'?0.5:0.8}};
      if(v) l.variant=v; if(tl&&tl.type!=='mark') l.target=tl.id; if(k==='arrow'){ l.w=14; l.h=14; } anAddLayer(l,'M'); };
    box.querySelectorAll('.pn-col').forEach(b=>b.onclick=()=>{ S.color=b.dataset.c; box.querySelectorAll('.pn-col').forEach(x=>x.classList.toggle('on',x===b)); drawGrid(); drawAll(); });
    box.querySelectorAll('.mv-chip').forEach(b=>b.onclick=()=>{ S.cat=b.dataset.cat; box.querySelectorAll('.mv-chip').forEach(x=>{ x.classList.toggle('on',x===b); x.setAttribute('aria-pressed',x===b); }); drawGrid(); });
    box.querySelector('#pn-mk-hand').onchange=e=>{ S.hand=e.target.checked; };
    drawGrid(); drawAll(); anMarksManager(box);
  };
})();
