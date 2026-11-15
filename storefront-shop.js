import {catalog} from './catalog.js';
import {categoryPhotos} from './product-photos.js';
const known=new Map(Object.entries(catalog).flatMap(([category,items])=>items.map(item=>[item.id,{...item,category}])));
const labels={cpu:'Processadores',board:'Placas-mãe',gpu:'Placas de vídeo',ram:'Memórias RAM',ssd:'SSDs',hdd:'HDs',psu:'Fontes',case:'Gabinetes',cooler:'Coolers',other:'Outras peças'};
const glyphs={cpu:'CPU',board:'MB',gpu:'GPU',ram:'RAM',ssd:'SSD',hdd:'HD',psu:'PSU',case:'PC',cooler:'FAN',other:'PC'};
const shops={
 shopee:{name:'Shopee',domains:['shopee.com.br','shopee.com','shope.ee']},
 mercadolivre:{name:'Mercado Livre',domains:['mercadolivre.com.br','mercadolivre.com','meli.la']},
 amazon:{name:'Amazon',domains:['amazon.com.br','amazon.com','amzn.to','link.amazon']}
};
const $=id=>document.getElementById(id);
const BRL=value=>Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function category(o){
 const title=String(o.title||o.modelName||'');
 const original=o.category||known.get(o.partId)?.category||'other';
 if(original==='cpu'&&/\b(?:RTX\s*\d|GTX\s*\d|RX\s*\d|placa\s+de\s+video)\b/i.test(title))return 'gpu';
 if(original==='cpu'&&/\b(?:fonte\s+(?:atx|de\s+alimentacao)|psu\s+\d+|\d{3,4}\s*W\b)/i.test(title))return 'psu';
 return original;
}
function safeUrl(link,shop){
 if(typeof link!=='string'||!shops[shop])return null;
 try{const u=new URL(link);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&shops[shop].domains.some(d=>u.hostname===d||u.hostname.endsWith('.'+d))?u.href:null}catch{return null}
}
function valid(o){return o&&Number.isFinite(o.price)&&o.price>0&&o.partId&&safeUrl(o.url,o.store)&&/^\d{4}-\d\d-\d\d$/.test(o.checkedAt||'');}
function identity(o){
 const ref=known.get(o.partId);
 const model=o.modelName||ref?.name||o.partId||o.title;
 return [category(o),o.condition==='used'?'used':'new',normalize(model)].join('|');
}
function grouped(offers){
 const map=new Map();
 for(const offer of offers){
   const groupId=identity(offer);if(!map.has(groupId))map.set(groupId,[]);
   map.get(groupId).push(offer);
 }
 return [...map.values()].map(items=>{
   items.sort((a,b)=>a.price-b.price);
   const seen=new Set(),primary=[],others=[];
   for(const item of items){(seen.has(item.store)?others:primary).push(item);seen.add(item.store);}
   const best=items[0];
   return {best,items,primary,others,id:identity(best),type:category(best),
           model:best.modelName||known.get(best.partId)?.name||best.title||'Peça de computador'};
 });
}
function element(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function imageFor(offer){
 const link=offer?.imageUrl;
 if(typeof link!=='string'||!link)return null;
 try{
  const url=new URL(link);
  if(url.protocol!=='https:'||url.username||url.password||url.port)return null;
  const hosts=['shopee.com.br','shopee.com','shopeecdn.com','shopeeusercontent.com',
   'amazon.com.br','amazon.com','media-amazon.com','ssl-images-amazon.com',
   'mlstatic.com','mercadolivre.com.br','mercadolibre.com',
   'wikimedia.org'];
  return hosts.some(h=>url.hostname===h||url.hostname.endsWith('.'+h))?url.href:null;
 }catch{return null}
}
function photoForGroup(item){
 // A menor oferta nem sempre possui imagem. Procura foto de outro anúncio do mesmo modelo.
 for(const offer of item.items){
   if(/\b(?:PC\s+gamer|computador\s+completo|gabinete\s+c\/)/i.test(offer.title||'')&&item.type==='cpu')continue;
   const url=imageFor(offer);
   if(url)return {url,illustrative:false};
 }
 const url=categoryPhotos[item.type]?.url||categoryPhotos.other.url;
 return {url,illustrative:true};
}
function categoryPhotosInNav(){
 for(const a of document.querySelectorAll('.cat-card')){
  const key=new URL(a.href).searchParams.get('categoria');
  const photo=categoryPhotos[key];
  const frame=a.querySelector('.cat-symbol');
  if(!frame||!photo||frame.querySelector('img'))continue;
  const alt=frame.textContent;
  frame.replaceChildren();
  const img=document.createElement('img');img.loading='lazy';img.decoding='async';
  img.src=photo.url;img.alt='Foto ilustrativa: '+(labels[key]||alt);
  img.onerror=()=>{frame.replaceChildren(document.createTextNode(alt));};
  frame.append(img);
 }
}
function productCard(item){
 const o=item.best,article=element('article','offer-card');
 const visual=element('div','offer-visual');
 const photo=photoForGroup(item);
 const img=document.createElement('img');
 img.src=photo.url;img.loading='lazy';img.decoding='async';
 img.alt=photo.illustrative?'Foto ilustrativa de '+(labels[item.type]||'hardware'):'Imagem do anúncio do modelo '+item.model;
 let isFallback=photo.illustrative;
 img.onerror=()=>{
   if(!isFallback){isFallback=true;img.src=categoryPhotos[item.type]?.url||categoryPhotos.other.url;
      img.alt='Foto ilustrativa de '+(labels[item.type]||'hardware');caption.textContent='Foto ilustrativa';return;}
   img.remove();visual.append(element('span','offer-glyph',glyphs[item.type]||'PC'));
 };
 visual.append(img);
 visual.append(element('span','offer-label',labels[item.type]||'Componente'));
 const caption=element('span','offer-photo-label',photo.illustrative?'Foto ilustrativa':'Foto do anúncio');
 visual.append(caption);
 const content=element('div','offer-info');
 const title=element('h3','',item.model);
 const store=element('div','offer-store',(item.primary.length>1?item.primary.length+' lojas · ':'')+'Menor oferta: '+shops[o.store].name+(o.condition==='used'?' · Usado':''));
 const price=element('div','offer-price',BRL(o.price));
 price.append(element('small','','Preço registrado em '+o.checkedAt.split('-').reverse().join('/')));
 const a=element('a','offer-link','Ver oferta');a.href=safeUrl(o.url,o.store);a.target='_blank';a.rel=o.affiliate?'noopener noreferrer sponsored':'noopener noreferrer';
 content.append(title,store,price,a);
 if(item.primary.length>1||item.others.length){
   const detail=element('details','offer-alternatives');
   detail.append(element('summary','',(item.primary.length+item.others.length-1)+' outra(s) oferta(s) para comparar'));
   for(const v of item.items.filter(x=>x!==o)){
     const link=element('a','','Ver '+shops[v.store].name+' · '+BRL(v.price));
     link.href=safeUrl(v.url,v.store);link.target='_blank';link.rel=v.affiliate?'noopener noreferrer sponsored':'noopener noreferrer';detail.append(link);
   }
   content.append(detail);
 }
 article.append(visual,content);return article;
}
let all=[],groups=[],visibleLimit=24;
function home(){
 const root=$('home-deals');if(!root)return;
 const priority=['gpu','cpu','board','ram','ssd','psu','case','hdd'];
 const sorted=[];
 for(const categoryName of priority){
   const matches=groups.filter(g=>g.type===categoryName).sort((a,b)=>a.best.price-b.best.price);
   if(matches.length)sorted.push(matches[0]);
 }
 // Evita várias ofertas do mesmo grupo e mantém diversidade.
 for(const item of groups.slice().sort((a,b)=>a.best.price-b.best.price))if(sorted.length<8&&!sorted.includes(item))sorted.push(item);
 root.replaceChildren(...sorted.slice(0,8).map(productCard));
 const count=$('live-offer-count');if(count)count.textContent=String(all.length);
 if(!sorted.length)root.append(element('div','no-offers','Ainda não há ofertas publicadas para exibir.'));
}
function catalogPage(){
 const root=$('catalog-grid');if(!root)return;
 const search=$('catalog-search'),type=$('catalog-category'),shop=$('catalog-store'),order=$('catalog-order');
 const q=normalize(search?.value||''),c=type?.value||'all',s=shop?.value||'all',ord=order?.value||'lowest';
 const filtered=all.filter(o=>!['pc','kit'].includes(category(o))&&(c==='all'||category(o)===c)&&(s==='all'||o.store===s)&&(!q||normalize([o.title,o.modelName,o.partId,known.get(o.partId)?.name].join(' ')).includes(q)));
 const array=grouped(filtered);
 array.sort((a,b)=>ord==='highest'?b.best.price-a.best.price:ord==='recent'?b.best.checkedAt.localeCompare(a.best.checkedAt):a.best.price-b.best.price);
 const count=$('catalog-count');if(count)count.textContent=array.length+' modelos · '+filtered.length+' anúncios cadastrados';
 root.replaceChildren(...array.slice(0,visibleLimit).map(productCard));
 if(!array.length)root.append(element('div','no-offers','Nenhuma oferta corresponde aos filtros. Tente outra categoria ou pesquise pelo modelo.'));
 const more=$('catalog-more');if(more){more.hidden=array.length<=visibleLimit;more.textContent='Mostrar mais modelos ('+Math.max(0,array.length-visibleLimit)+')';}
}
async function start(){
 const root=$('home-deals')||$('catalog-grid');if(!root)return;
 try{
   const response=await fetch('./offers.json',{cache:'no-store'});
   if(!response.ok)throw Error('Falha HTTP '+response.status);
   const data=await response.json();
   all=(Array.isArray(data.offers)?data.offers:[]).filter(valid);
   groups=grouped(all.filter(o=>!['pc','kit'].includes(category(o))));
   categoryPhotosInNav();
   home();
   const search=$('catalog-search'),type=$('catalog-category'),shop=$('catalog-store'),order=$('catalog-order'),more=$('catalog-more');
   const params=new URLSearchParams(location.search);
   if(search){search.value=params.get('q')||'';search.addEventListener('input',()=>{visibleLimit=24;catalogPage();});}
   if(type){const c=params.get('categoria');if(c&&Object.hasOwn(labels,c))type.value=c;type.addEventListener('change',()=>{visibleLimit=24;catalogPage();});}
   if(shop)shop.addEventListener('change',()=>{visibleLimit=24;catalogPage();});
   if(order)order.addEventListener('change',catalogPage);
   if(more)more.addEventListener('click',()=>{visibleLimit+=24;catalogPage();});
   catalogPage();
 }catch(err){root.replaceChildren(element('div','no-offers','Não foi possível carregar ofertas. Tente atualizar a página.'));const line=$('catalog-count');if(line)line.textContent='Falha ao carregar arquivo de ofertas.';}
}
start();