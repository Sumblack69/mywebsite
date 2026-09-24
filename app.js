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

// Interactive star field: stars gently repel the pointer and drift back into place.
(() => {
  const canvas = document.querySelector('#starfield');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pointer = { x: -9999, y: -9999, active: false };
  let stars = [];
  let raf;
  const count = () => Math.min(150, Math.max(70, Math.floor(window.innerWidth * window.innerHeight / 10500)));
  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: count() }, () => {
      const x = Math.random() * window.innerWidth, y = Math.random() * window.innerHeight;
      return { x, y, ox:x, oy:y, vx:(Math.random()-.5)*.08, vy:(Math.random()-.5)*.08, r:Math.random()*1.35+.35, a:Math.random()*.55+.2 };
    });
  };
  const move = e => { pointer.x=e.clientX; pointer.y=e.clientY; pointer.active=true; };
  const leave = () => { pointer.active=false; };
  const draw = () => {
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    for (const s of stars) {
      if (pointer.active) {
        const dx=s.x-pointer.x, dy=s.y-pointer.y, dist=Math.hypot(dx,dy), radius=125;
        if (dist < radius && dist > .1) { const force=(1-dist/radius)*1.8; s.vx += dx/dist*force; s.vy += dy/dist*force; }
      }
      s.vx += (s.ox-s.x)*.006; s.vy += (s.oy-s.y)*.006;
      s.vx *= .92; s.vy *= .92; s.x += s.vx; s.y += s.vy;
      ctx.globalAlpha=s.a; ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1; raf=requestAnimationFrame(draw);
  };
  window.addEventListener('resize', resize, {passive:true});
  window.addEventListener('pointermove', move, {passive:true});
  window.addEventListener('pointerleave', leave, {passive:true});
  resize(); draw();
})();
