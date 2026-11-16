/** Raven 8.5: atalhos de ofertas por item selecionado. Sem cotação falsa. */
import {catalog} from './catalog.js';
import {publicOffers} from './offer-policy.mjs';
const labels={case:'Gabinete',board:'Placa-mãe',cpu:'Processador',ram:'RAM',gpu:'GPU',ssd:'Armazenamento',psu:'Fonte',cooler:'Cooler'};
const order=['case','board','cpu','ram','gpu','ssd','psu','cooler'];
export function searchLinksForBuild(chosen,reference=catalog,offers=[]){
 if(!chosen||typeof chosen!=='object'||Array.isArray(chosen))return [];
 const byId=new Map();
 for(const [category,list] of Object.entries(reference))for(const p of Array.isArray(list)?list:[])byId.set(p.id,{name:p.name,category});
 for(const o of Array.isArray(offers)?offers:[])if(o?.partId&&!byId.has(o.partId))
  byId.set(o.partId,{name:o.modelName||o.title||o.partId,category:o.category});
 return order.flatMap(group=>{
  const id=chosen[group];if(!id||typeof id!=='string'||id.length>180)return [];
  const ref=byId.get(id);
  const name=ref?.name||id,category=group==='ssd'?'ssd':group;
  const query=new URLSearchParams({q:name,categoria:category});
  return [{group,id,name,label:labels[group],href:'produtos.html?'+query.toString()+'#catalogo',known:Boolean(ref)}];
 });
}
if(typeof document!=='undefined'){
 const panel=document.getElementById('raven90-builder-links');
 if(panel){
  const root=document.getElementById('raven90-builder-links-list');
  let offers=[];
  const update=()=>{
   let chosen={};try{chosen=JSON.parse(localStorage.getItem('raven-pc-builder-v1')||'{}')}catch{}
   const list=searchLinksForBuild(chosen,catalog,offers);
   root.replaceChildren();
   for(const item of list){
    const a=document.createElement('a');a.href=item.href;
    a.textContent=item.label+': '+item.name+(item.known?'':' · conferir modelo');
    root.append(a);
   }
   panel.hidden=!list.length;
  };
  fetch('./offers.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
   offers=publicOffers(data?.offers||[]);update();
  }).catch(()=>update());
  document.addEventListener('click',()=>requestAnimationFrame(update),{passive:true});
  window.addEventListener('hashchange',update);
  window.addEventListener('storage',update);
  update();
 }
}
