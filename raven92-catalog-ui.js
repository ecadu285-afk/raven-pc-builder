/** Raven 9.2 — sugestões da busca e facetas extraídas somente de dados publicados. */
import {specifications,rankCatalogSearch} from './raven92-core.mjs';
const $=id=>document.getElementById(id);
function optionsFor(select,values){
 const unique=[...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'pt-BR',{numeric:true}));
 for(const value of unique){
  const opt=document.createElement('option');opt.value=value;opt.textContent=value;select.append(opt);
 }
}
export function hydrateCatalogUI(sourceOffers,reference){
 const input=$('catalog-search');if(!input||input.dataset.raven92Ready)return;
 input.dataset.raven92Ready='true';
 try{
  const offers=(Array.isArray(sourceOffers)?sourceOffers:[]).filter(o=>!['pc','kit'].includes(o.category));
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

