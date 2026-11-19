/** Raven 9.2 — sugestões da busca e facetas extraídas somente de dados publicados. */
import {catalog} from './catalog.js';
import {publicOffers} from './offer-policy.mjs';
import {specifications,rankCatalogSearch} from './raven92-core.mjs';
const $=id=>document.getElementById(id);
const reference=new Map(Object.entries(catalog).flatMap(([category,items])=>items.map(o=>[o.id,{...o,category}])));
function optionsFor(select,values){
 const unique=[...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'pt-BR',{numeric:true}));
 for(const value of unique){
  const opt=document.createElement('option');opt.value=value;opt.textContent=value;select.append(opt);
 }
}
async function init(){
 const input=$('catalog-search');if(!input)return;
 try{
  const r=await fetch('./offers.json',{cache:'no-store'});if(!r.ok)throw Error('falha HTTP '+r.status);
  const doc=await r.json();
  const offers=publicOffers(doc.offers).filter(o=>!['pc','kit'].includes(o.category));
  const socks=[],memory=[],capacities=[];
  for(const item of offers){
   const specs=specifications(item,reference.get(item.partId));
   if(specs.socket)socks.push(specs.socket);
   if(specs.memory)memory.push(specs.memory);
   if(specs.capacity)capacities.push(specs.capacity.toUpperCase().replace(/\s+/g,' ').trim());
  }
  optionsFor($('catalog-socket'),socks);
  optionsFor($('catalog-memory'),memory);
  optionsFor($('catalog-capacity'),capacities);
  const list=document.createElement('datalist');list.id='raven92-suggestions';
  input.setAttribute('list',list.id);
  input.parentElement.append(list);
  let previous='';
  function suggest(){
   const query=input.value.trim();
   if(query===previous)return;previous=query;
   list.replaceChildren();
   if(query.length<2)return;
   const candidates=rankCatalogSearch(offers,query,reference);
   const labels=new Set();
   for(const offer of candidates){
    const name=String(offer.modelName||reference.get(offer.partId)?.name||offer.title||'').trim();
    if(!name||labels.has(name))continue;labels.add(name);
    const option=document.createElement('option');option.value=name;list.append(option);
    if(labels.size>=7)break;
   }
  }
  input.addEventListener('input',suggest);
  if(input.value)suggest();
 }catch(e){console.warn('Raven: sugestões/facetas não disponíveis',e);}
}
init();
