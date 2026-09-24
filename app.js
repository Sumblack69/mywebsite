const header=document.querySelector('#header');
const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('#site-menu');

const setHeader=()=>header.classList.toggle('scrolled',window.scrollY>20);
window.addEventListener('scroll',setHeader,{passive:true});
setHeader();

toggle.addEventListener('click',()=>{
  const open=menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
});

menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','Open navigation');
}));

document.querySelector('#year').textContent=new Date().getFullYear();

// Orbital starfield inspired by the reference interaction:
// stars continuously orbit in layered spiral rings, repel the pointer,
// and burst outward on upward scrolling before being pulled back into orbit.
(() => {
  const canvas=document.querySelector('#starfield');
  if(!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx=canvas.getContext('2d');
  const pointer={x:-9999,y:-9999,active:false};
  const state={w:0,h:0,cx:0,cy:0,scrollY:window.scrollY,lastScrollY:window.scrollY,burst:0,lastBurst:0};
  let stars=[],raf;

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const makeStar=()=>{
    // More stars live in rings, with a few forming the long outer spiral.
    const u=Math.random();
    const radius=28+Math.pow(u,.72)*Math.min(state.w,state.h)*.58;
    const angle=Math.random()*Math.PI*2;
    const arm=(Math.random()<.72 ? (Math.random()<.5?0:1) : Math.random()*2);
    const armOffset=arm<2 ? arm*Math.PI + radius*.008 : Math.random()*Math.PI*2;
    return {
      radius,
      angle:angle+armOffset,
      speed:(0.00035+Math.random()*0.00075)*(Math.random()<.5?1:-1),
      wobble:Math.random()*Math.PI*2,
      wobbleSpeed:.0004+Math.random()*.001,
      size:Math.random()<.08?1.7+Math.random()*1.7:Math.random()*.95+.35,
      alpha:.22+Math.random()*.7,
      tint:Math.random()<.08?'#ffd27a':(Math.random()<.13?'#9edcff':'#ffffff'),
      x:0,y:0,vx:0,vy:0,ox:0,oy:0
    };
  };

  const resize=()=>{
    state.w=window.innerWidth;
    state.h=window.innerHeight;
    state.cx=state.w*.52;
    state.cy=state.h*.52;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.floor(state.w*dpr);
    canvas.height=Math.floor(state.h*dpr);
    canvas.style.width=state.w+'px';
    canvas.style.height=state.h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const total=Math.min(430,Math.max(190,Math.floor(state.w*state.h/3000)));
    stars=Array.from({length:total},makeStar);
    for(const s of stars){
      const e=ellipsePosition(s,0);
      s.x=s.ox=e.x;s.y=s.oy=e.y;
    }
  };

  const ellipsePosition=(s,t)=>{
    const wobble=Math.sin(s.wobble+t*s.wobbleSpeed)*3.5;
    const r=s.radius+wobble;
    const a=s.angle+t*s.speed;
    // Slightly flattened ellipse gives the same orbital depth as the reference.
    return {
      x:state.cx+Math.cos(a)*r,
      y:state.cy+Math.sin(a)*r*.62
    };
  };

  const pointerMove=e=>{
    pointer.x=e.clientX;
    pointer.y=e.clientY;
    pointer.active=true;
  };
  const pointerLeave=()=>{pointer.active=false;};

  const burst=delta=>{
    // Upward scroll produces the visible "break apart" effect.
    const strength=clamp(Math.abs(delta)*.09,2.5,15);
    state.burst=Math.max(state.burst,strength);
    state.lastBurst=performance.now();

    for(const s of stars){
      const dx=s.x-state.cx,dy=s.y-state.cy;
      const len=Math.hypot(dx,dy)||1;
      const tangent={x:-dy/len,y:dx/len};
      const outward=.75+Math.random()*1.8;
      s.vx+=(dx/len)*strength*outward+tangent.x*(Math.random()-.5)*strength*.45;
      s.vy+=(dy/len)*strength*outward+tangent.y*(Math.random()-.5)*strength*.45;
    }
  };

  const onScroll=()=>{
    const y=window.scrollY;
    const delta=y-state.lastScrollY;
    state.scrollY=y;
    // The reference effect is especially noticeable when scrolling upward.
    if(delta < -1.5) burst(delta);
    state.lastScrollY=y;
  };

  const draw=now=>{
    ctx.clearRect(0,0,state.w,state.h);

    // Burst energy fades quickly, then orbital springs take control again.
    state.burst*=.91;

    for(const s of stars){
      const target=ellipsePosition(s,now);
      s.ox=target.x;s.oy=target.y;

      // Mouse attraction is reversed: stars are pushed away from the cursor.
      if(pointer.active){
        const dx=s.x-pointer.x,dy=s.y-pointer.y;
        const dist=Math.hypot(dx,dy);
        const radius=150;
        if(dist<radius && dist>.1){
          const force=Math.pow(1-dist/radius,2)*2.8;
          s.vx+=(dx/dist)*force;
          s.vy+=(dy/dist)*force;
        }
      }

      // Pull particles back to their moving orbital path.
      const spring=state.burst>.15?.0028:.007;
      s.vx+=(target.x-s.x)*spring;
      s.vy+=(target.y-s.y)*spring;

      // During a burst, preserve a little inertia; otherwise settle smoothly.
      s.vx*=state.burst>.15?.965:.88;
      s.vy*=state.burst>.15?.965:.88;
      s.x+=s.vx;
      s.y+=s.vy;

      const twinkle=.72+.28*Math.sin(now*.0015+s.wobble);
      ctx.globalAlpha=clamp(s.alpha*twinkle,0,1);
      ctx.fillStyle=s.tint;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
      ctx.fill();

      // Larger stars get a tiny glow, like the bright points in the reference.
      if(s.size>1.7){
        ctx.globalAlpha*=.16;
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.size*3.8,0,Math.PI*2);
        ctx.fill();
      }
    }

    ctx.globalAlpha=1;
    raf=requestAnimationFrame(draw);
  };

  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('pointermove',pointerMove,{passive:true});
  window.addEventListener('pointerleave',pointerLeave,{passive:true});
  window.addEventListener('scroll',onScroll,{passive:true});
  resize();
  raf=requestAnimationFrame(draw);
})();
