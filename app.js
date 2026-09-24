const header=document.querySelector('#header');
const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('#site-menu');
const setHeader=()=>header.classList.toggle('scrolled',window.scrollY>20);
window.addEventListener('scroll',setHeader,{passive:true});setHeader();
toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'CLOSE':'MENU';});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='MENU';}));
document.querySelector('#year').textContent=new Date().getFullYear();

// Astra-inspired portfolio particle system: continuous spiral/orbit motion,
// cursor repulsion and scroll-driven disintegration/reformation.
(()=>{const c=document.querySelector('#starfield');if(!c||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const x=c.getContext('2d'),p={x:-9999,y:-9999,on:false};let w,h,cx,cy,stars=[],last=scrollY,burst=0;
const resize=()=>{w=innerWidth;h=innerHeight;cx=w*.5;cy=h*.5;const d=Math.min(devicePixelRatio||1,2);c.width=w*d;c.height=h*d;c.style.width=w+'px';c.style.height=h+'px';x.setTransform(d,0,0,d,0,0);const n=Math.min(520,Math.max(220,Math.floor(w*h/2600)));stars=Array.from({length:n},(_,i)=>{const u=Math.random(),r=20+Math.pow(u,.7)*Math.min(w,h)*.62,a=Math.random()*Math.PI*2+(i%5)*1.256;return{r,a,v:(.00035+Math.random()*.0009)*(Math.random()<.5?1:-1),size:Math.random()<.07?1.7+Math.random()*2:Math.random()*.9+.3,alpha:.25+Math.random()*.65,phase:Math.random()*7,x:0,y:0,vx:0,vy:0};});};
const pos=(s,t)=>{const r=s.r+Math.sin(s.phase+t*.0007)*3;const a=s.a+t*s.v;return{x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r*.62};};
addEventListener('resize',resize,{passive:true});addEventListener('pointermove',e=>{p.x=e.clientX;p.y=e.clientY;p.on=true},{passive:true});addEventListener('pointerleave',()=>p.on=false,{passive:true});
addEventListener('scroll',()=>{const d=scrollY-last;if(d<-2){burst=Math.min(22,Math.max(burst,Math.abs(d)*.16));for(const s of stars){const dx=s.x-cx,dy=s.y-cy,l=Math.hypot(dx,dy)||1;s.vx+=dx/l*burst*(.5+Math.random());s.vy+=dy/l*burst*(.5+Math.random());}}last=scrollY},{passive:true});
const frame=t=>{x.clearRect(0,0,w,h);burst*=.9;for(const s of stars){const q=pos(s,t);if(!s.x){s.x=q.x;s.y=q.y;}if(p.on){const dx=s.x-p.x,dy=s.y-p.y,d=Math.hypot(dx,dy);if(d<145&&d>.1){const f=(1-d/145)**2*3.5;s.vx+=dx/d*f;s.vy+=dy/d*f;}}const k=burst>.2?.0025:.008;s.vx+=(q.x-s.x)*k;s.vy+=(q.y-s.y)*k;s.vx*=burst>.2?.965:.88;s.vy*=burst>.2?.965:.88;s.x+=s.vx;s.y+=s.vy;const tw=.72+.28*Math.sin(t*.0015+s.phase);x.globalAlpha=Math.min(1,s.alpha*tw);x.fillStyle=Math.random()<.07?'#f6d58a':'#fff';x.beginPath();x.arc(s.x,s.y,s.size,0,Math.PI*2);x.fill();if(s.size>1.7){x.globalAlpha*=.15;x.beginPath();x.arc(s.x,s.y,s.size*4,0,Math.PI*2);x.fill();}}x.globalAlpha=1;requestAnimationFrame(frame)};resize();requestAnimationFrame(frame)})();