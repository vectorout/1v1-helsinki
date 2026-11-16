/* Reusable Keybridge credit. Each badge links normally even without JavaScript. */
(() => {
 function init(){document.querySelectorAll('[data-kb-credit]').forEach(badge => {
  if(badge.dataset.kbReady)return;badge.dataset.kbReady='true';
  const link=badge.querySelector('.kb-credit-link'),preview=badge.querySelector('.kb-credit-preview');
  if(!link||!preview)return;
  let timer,hovering=false,focused=false,suppressed=false;
  const position=()=>{const r=link.getBoundingClientRect(),w=preview.offsetWidth,h=preview.offsetHeight;const x=Math.max(16,Math.min(r.right-w,window.innerWidth-w-16));const y=r.top>=h+28?r.top-h-12:Math.min(r.bottom+12,window.innerHeight-h-16);preview.style.setProperty('--kb-preview-left',x+'px');preview.style.setProperty('--kb-preview-top',Math.max(16,Math.min(y,window.innerHeight-h-16))+'px');};
  const close=()=>{clearTimeout(timer);badge.classList.remove('is-open');preview.setAttribute('aria-hidden','true');};
  const open=()=>{clearTimeout(timer);if(suppressed)return;position();badge.classList.add('is-open');preview.setAttribute('aria-hidden','false');};
  const later=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(!hovering&&!focused)close();},180);};
  badge.addEventListener('mouseenter',()=>{if(!window.matchMedia('(hover:hover)').matches)return;hovering=true;open();});
  badge.addEventListener('mouseleave',()=>{hovering=false;suppressed=false;later();});
  preview.addEventListener('mouseenter',()=>{hovering=true;open();});
  preview.addEventListener('mouseleave',()=>{hovering=false;later();});
  link.addEventListener('focus',()=>{focused=true;suppressed=false;open();});
  link.addEventListener('blur',()=>{focused=false;suppressed=false;later();});
  badge.addEventListener('keydown',event=>{if(event.key==='Escape'){suppressed=true;close();}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&badge.classList.contains('is-open')){suppressed=true;close();}});
  link.addEventListener('click',close);
  const moved=()=>{if(focused&&!suppressed){position();}else close();};
  window.addEventListener('resize',moved,{passive:true});
  window.addEventListener('scroll',moved,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)close();});
  preview.querySelector('img')?.addEventListener('load',()=>{if(badge.classList.contains('is-open'))position();});
 });}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 new MutationObserver(init).observe(document.documentElement,{subtree:true,childList:true});
})();
