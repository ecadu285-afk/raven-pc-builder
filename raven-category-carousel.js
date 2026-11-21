/** Navegacao por categorias: as setas movimentam listas reais, sem clonar cards. */
(function(){
 function setup(section,index){
  const track=section.querySelector('.categories');
  const heading=section.querySelector('h2');
  if(!track||!heading||track.classList.contains('raven-carousel-track'))return;
  track.classList.add('raven-carousel-track');
  const label=heading.textContent.trim()||'Categorias';
  track.setAttribute('role','region');
  track.setAttribute('aria-label',label+' — deslize ou use as setas');
  track.tabIndex=0;
  const buttons=document.createElement('div');
  buttons.className='raven-carousel-actions';
  const makeButton=(dir,mark,name)=>{
   const b=document.createElement('button');b.type='button';
   b.className='raven-carousel-arrow';
   b.textContent=mark;b.setAttribute('aria-label',name+' — '+label);
   b.setAttribute('aria-controls','raven-cat-track-'+index);
   b.addEventListener('click',()=>{
    const first=track.querySelector('.cat-card');
    const w=first?first.getBoundingClientRect().width+14:160;
    const num=Math.max(1,Math.floor(track.clientWidth/w));
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({left:dir*w*num,behavior:reduce?'auto':'smooth'});
   });
   return b;
  };
  track.id='raven-cat-track-'+index;
  const previous=makeButton(-1,'‹','Categorias anteriores');
  const next=makeButton(1,'›','Próximas categorias');
  buttons.append(previous,next);heading.after(buttons);
  let raf=0;
  const update=()=>{
   if(raf)cancelAnimationFrame(raf);
   raf=requestAnimationFrame(()=>{
    const end=Math.max(0,track.scrollWidth-track.clientWidth);
    previous.disabled=track.scrollLeft<2;
    next.disabled=track.scrollLeft>=end-2;
    buttons.hidden=end<2;
   });
  };
  track.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  update();
 }
 const run=()=>document.querySelectorAll('.catalog-v8 .catalog-quick').forEach(setup);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
 else run();
})();
