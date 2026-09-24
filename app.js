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