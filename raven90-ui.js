/** Navegação móvel acessível e eventos locais de saída: sem envio a serviços externos. */
(function(){
 const init=()=>{
  const nav=document.querySelector('.market-nav-strip nav, .raven-nav-links');
  if(nav&&nav.querySelectorAll('a').length>=5&&!nav.dataset.raven90Menu){
    nav.dataset.raven90Menu='yes';
    document.body.classList.add('raven90-menu-ready');
    if(!nav.id)nav.id='raven90-primary-nav';
    const b=document.createElement('button');b.type='button';b.className='raven90-menu-toggle';
    b.textContent='Menu de navegação';b.setAttribute('aria-controls',nav.id);b.setAttribute('aria-expanded','false');
    nav.before(b);
    const close=()=>{nav.classList.remove('raven90-mobile-open');b.setAttribute('aria-expanded','false')};
    b.addEventListener('click',()=>{const on=nav.classList.toggle('raven90-mobile-open');b.setAttribute('aria-expanded',String(on))});
    nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    window.addEventListener('resize',()=>{if(innerWidth>850)close()});
  }
  document.addEventListener('click',e=>{
   const link=e.target instanceof Element?e.target.closest('a[rel~="sponsored"]'):null;if(!link)return;
   // Evento transitório útil para métricas futuras. Não coleta dados pessoais nem trafega pela rede.
   document.dispatchEvent(new CustomEvent('raven:offer-click',{detail:{source:'external-affiliate',host:(()=>{try{return new URL(link.href).hostname}catch{return ''}})()}}));
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
