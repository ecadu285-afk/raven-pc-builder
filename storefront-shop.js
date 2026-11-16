import {catalog} from './catalog.js';
import {
  ravenMarketInit, ravenMarketToggle, ravenMarketSaved, ravenMarketKeys,
  ravenMarketUser, ravenMarketReviews, ravenMarketReviewCreate,
  ravenMarketReviewDelete, ravenMarketOpenAccount
} from './raven-market.js';
import {publicOffers} from './offer-policy.mjs';
import {filterCatalogOffers} from './catalog-filters.mjs';
import {productFacts,productFactsDescription} from './product-details.mjs';
import {evidenceFor} from './raven79-intel.mjs';
import {offerQuality,rankFeaturedGroups} from './raven90-quality.mjs';

const known=new Map(Object.entries(catalog).flatMap(([category,items])=>items.map(item=>[item.id,{...item,category}])));
const labels={cpu:'Processadores',board:'Placas-mãe',gpu:'Placas de vídeo',ram:'Memórias RAM',ssd:'SSDs',hdd:'HDs',psu:'Fontes',case:'Gabinetes',cooler:'Coolers',other:'Outras peças'};
const glyphs={cpu:'CPU',board:'MB',gpu:'GPU',ram:'RAM',ssd:'SSD',hdd:'HD',psu:'PSU',case:'PC',cooler:'FAN',other:'PC'};
const shops={
 shopee:{name:'Shopee',domains:['shopee.com.br','shopee.com','shope.ee']},
 mercadolivre:{name:'Mercado Livre',domains:['mercadolivre.com.br','mercadolivre.com','meli.la']},
 amazon:{name:'Amazon',domains:['amazon.com.br','amazon.com','amzn.to','link.amazon']},
 kabum:{name:'KaBuM!',domains:['kabum.com.br']},
 terabyte:{name:'TerabyteShop',domains:['terabyteshop.com.br']}
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
const MAX_OFFER_AGE_DAYS=14;
function offerAgeDays(checkedAt){
 const date=new Date(String(checkedAt||'')+'T12:00:00Z');
 if(!Number.isFinite(date.getTime()))return Infinity;
 const now=new Date(),today=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate(),12));
 return Math.floor((today.getTime()-date.getTime())/86400000);
}
function isRecent(o){const days=offerAgeDays(o.checkedAt);return days>=0&&days<=MAX_OFFER_AGE_DAYS;}

function identity(o){
 const ref=known.get(o.partId);
 const model=o.modelName||ref?.name||o.partId||o.title;
 const kind=category(o);
 const announced=String(o.title||o.modelName||'');
 const capacity=['gpu','ram','ssd','hdd'].includes(kind)?(announced.match(/\b(\d{1,4})\s*(GB|TB)\b/i)||[]):[];
 return [kind,o.condition==='used'?'used':o.condition==='refurbished'?'refurbished':'new',normalize(model),capacity[0]?normalize(capacity[0]):''].join('|');
}
function grouped(offers){
 const map=new Map();
 for(const offer of offers){
   const groupId=identity(offer);if(!map.has(groupId))map.set(groupId,[]);
   map.get(groupId).push(offer);
 }
 return [...map.values()].map(items=>{
   items.sort((a,b)=>Number(isRecent(b))-Number(isRecent(a))||a.price-b.price);
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
   'kabum.com.br','terabyteshop.com.br','wikimedia.org'];
  return hosts.some(h=>url.hostname===h||url.hostname.endsWith('.'+h))?url.href:null;
 }catch{return null}
}
function photoForGroup(item){
 // Fotos somente de anúncios do MESMO grupo de modelo e condição.
 for(const offer of item.items){
   // Não reutilize foto de outra referência como se fosse do produto mais barato.
   if(offer.partId!==item.best.partId)continue;
   if(item.type==='cpu' && /\b(?:pc\s*gamer|computador\s*completo)\b/i.test(offer.title||''))continue;
   if(evidenceFor(offer,catalog).issues.length)continue;
   const url=imageFor(offer);
   if(url)return {url,offer};
 }
 return null;
}
function productPlaceholder(type){
 const root=element('div','hardware-placeholder placeholder-'+type);
 root.setAttribute('aria-label','Miniatura estilizada da categoria, não é imagem do modelo');
 const object=element('span','hardware-object',glyphs[type]||'PC');
 object.setAttribute('aria-hidden','true');
 root.append(object);
 return root;
}
function categorySymbols(){
 // Remover qualquer fotografia genérica previamente inserida em categorias.
 for(const link of document.querySelectorAll('.cat-card')){
   const frame=link.querySelector('.cat-symbol');
   const key=new URL(link.href).searchParams.get('categoria');
   if(!frame||!key)continue;
   frame.replaceChildren(document.createTextNode(glyphs[key]||'PC'));
 }
}
function productCard(item){
 const o=item.best,article=element('article','offer-card');
 const visual=element('div','offer-visual');
 const photo=photoForGroup(item);
 const caption=element('span','offer-photo-label',photo?'Foto do anúncio':'Sem foto deste modelo');
 if(photo){
   const img=document.createElement('img');
   img.src=photo.url;img.loading='lazy';img.decoding='async';
   img.alt='Foto cadastrada para '+item.model;
   img.onerror=()=>{img.remove();visual.prepend(productPlaceholder(item.type));caption.textContent='Sem foto deste modelo';};
   visual.append(img);
 }else visual.append(productPlaceholder(item.type));
 visual.append(element('span','offer-label',labels[item.type]||'Componente'),caption);
 const content=element('div','offer-info');
 const title=element('h3','',item.model);
 const quality=offerQuality(o);
 const store=element('div','offer-store',(item.primary.length>1?item.primary.length+' lojas · ':'')+(isRecent(o)?'Menor preço recente: ':'Preço antigo cadastrado em: ')+shops[o.store].name+(o.condition==='used'?' · Usado':''));
 const price=element('div','offer-price',BRL(o.price));
 article.dataset.dataQuality=quality.state;
 article.title='Completude do anúncio: '+quality.reasons.slice(0,3).join('; ');
 price.append(element('small','',isRecent(o)
    ? 'Preço conferido em '+o.checkedAt.split('-').reverse().join('/')
    : 'PREÇO ANTIGO · última conferência '+o.checkedAt.split('-').reverse().join('/')+'. Consulte o anúncio antes de comprar.'));
 if(!isRecent(o)){article.classList.add('raven-stale-offer');article.setAttribute('data-price-status','desatualizado');}

 const key=item.id.slice(0,180);
 const save=element('button','market-action','♡ Salvar');
 const cart=element('button','market-action','+ Carrinho');
 const review=element('button','market-action market-review-button','★ Avaliações');
 const marketActions=element('div','market-card-actions');
 function mark(){
  save.textContent=ravenMarketSaved('saved',key)?'♥ Salvo':'♡ Salvar';
  cart.textContent=ravenMarketSaved('cart',key)?'✓ No carrinho':'+ Carrinho';
  save.setAttribute('aria-pressed',String(ravenMarketSaved('saved',key)));
  cart.setAttribute('aria-pressed',String(ravenMarketSaved('cart',key)));
 }
 mark();
 async function change(kind,button){
  button.disabled=true;
  try{await ravenMarketToggle(kind,key);mark();}
  catch(error){marketToast(error.message);}
  finally{button.disabled=false;}
 }
 save.addEventListener('click',()=>change('saved',save));
 cart.addEventListener('click',()=>change('cart',cart));
 review.addEventListener('click',()=>openMarketReviews(item));
 marketActions.append(save,cart,review);
 const a=element('a','offer-link',isRecent(o)?'Ver oferta':'Conferir preço na loja');a.href=safeUrl(o.url,o.store);a.target='_blank';a.rel=o.affiliate?'noopener noreferrer sponsored':'noopener noreferrer';
 const note=element('p','offer-trust-note',o.affiliateStatus==='confirmed'?'Link comissionado, conforme programa da loja.':'Comissão não confirmada · preço e estoque a conferir');
 const evidence=evidenceFor(o,catalog);
 const evidenceLine=element('p','offer-model-evidence',evidence.label+' · '+evidence.imageStatus);
 if(evidence.issues.length){
  evidenceLine.classList.add('needs-review');
  evidenceLine.textContent='Revisão de modelo necessária: '+evidence.issues.join('; ')+'. Confira o SKU antes da compra.';
 }
 const caution=element('p','raven90-product-check',
 quality.needsModel?'Identificação incompleta · confira marca, referência e capacidade na loja.':
 quality.needsPhoto?'Foto não cadastrada · confirme o modelo no anúncio.':
 'Dados cadastrados · confirme vendedor, estado e preço na loja.');
 content.append(title,store,price,caution,note,evidenceLine);
 const detailFacts=productFacts(o,known.get(o.partId));
 const technical=element('details','offer-technical');
 const technicalSummary=element('summary','',detailFacts.length?'Ficha técnica disponível ('+detailFacts.length+' dados)':'Detalhes e identificação');
 technical.append(technicalSummary);
 if(detailFacts.length){
  const list=element('dl','offer-facts');
  detailFacts.forEach(f=>{const entry=element('div','offer-fact');
   entry.append(element('dt','',f.label),element('dd','',f.value+(f.source==='título do anúncio'?' · informado no anúncio':'')));
   list.append(entry);
  });
  technical.append(list);
  technical.append(element('small','offer-spec-disclaimer','Informações da referência cadastrada ou do título do vendedor. Confirme o código exato e a ficha oficial antes da compra.'));
 }else{
  technical.append(element('p','offer-spec-disclaimer','Não há ficha técnica confiável para esta referência. Confira as especificações diretamente no anúncio.'));
 }
 const historyLink=element('a','offer-history-link','Histórico de preços registrados');
 historyLink.href='historico.html?produto='+encodeURIComponent(o.partId);
 content.append(technical,historyLink,marketActions,a);
 if(item.primary.length>1||item.others.length){
   const detail=element('details','offer-alternatives');
   detail.append(element('p','offer-comparison-warning','Compare capacidade, revisão, marca e condição. Anúncios agrupados podem não ter exatamente o mesmo SKU.'));
   detail.append(element('summary','',(item.primary.length+item.others.length-1)+' outra(s) oferta(s) para comparar'));
   for(const v of item.items.filter(x=>x!==o)){
     const link=element('a','',shops[v.store].name+' · '+BRL(v.price)+' · '+v.checkedAt.split('-').reverse().join('/')+(isRecent(v)?'':' · PREÇO ANTIGO'));
     if(!isRecent(v))link.classList.add('raven-alt-stale');
     link.href=safeUrl(v.url,v.store);link.target='_blank';link.rel=v.affiliate?'noopener noreferrer sponsored':'noopener noreferrer';detail.append(link);
   }
   content.append(detail);
 }
 article.append(visual,content);return article;
}
let all=[],groups=[],visibleLimit=24;

function marketToast(message){
 let el=document.getElementById('marketToast');
 if(!el){el=element('p','market-toast');el.id='marketToast';el.setAttribute('role','status');document.body.append(el);}
 el.textContent=message;
 el.hidden=false;
 clearTimeout(marketToast.timer);
 marketToast.timer=setTimeout(()=>{el.hidden=true;},4200);
}
let ravenReviewDialog;
function getReviewDialog(){
 if(ravenReviewDialog)return ravenReviewDialog;
 const d=document.createElement('dialog');d.className='raven-review-dialog';
 d.innerHTML='<div class="market-dialog-head"><h2 id="marketReviewTitle">Avaliações</h2><button type="button" id="marketReviewClose" aria-label="Fechar">×</button></div>'+
   '<p class="market-dialog-help">Avaliações de clientes do Raven. Comentários novos passam por moderação antes de aparecer para todos.</p>'+
   '<p class="market-dialog-status" id="marketReviewStatus" role="status"></p>'+
   '<div id="marketReviewsList"></div>'+
   '<form id="marketReviewForm"><h3>Deixe sua avaliação</h3>'+
   '<label>Nota<select id="marketReviewRating" required><option value="5">5 estrelas</option><option value="4">4 estrelas</option><option value="3">3 estrelas</option><option value="2">2 estrelas</option><option value="1">1 estrela</option></select></label>'+
   '<label>Seu comentário<textarea id="marketReviewBody" minlength="15" maxlength="500" rows="4" placeholder="O que você achou do produto? Evite dados pessoais." required></textarea></label>'+
   '<button class="market-review-submit" type="submit">Enviar avaliação</button></form>'+
   '<button type="button" class="market-login-review" id="marketReviewLogin">Entrar para avaliar</button>';
 document.body.append(d);
 d.querySelector('#marketReviewClose').onclick=()=>d.close();
 d.querySelector('#marketReviewLogin').onclick=()=>{d.close();ravenMarketOpenAccount();};
 d.addEventListener('click',ev=>{if(ev.target===d)d.close();});
 ravenReviewDialog=d;return d;
}
async function openMarketReviews(item){
 const d=getReviewDialog(),key=item.id.slice(0,180);
 d.querySelector('#marketReviewTitle').textContent='Avaliações · '+item.model;
 const list=d.querySelector('#marketReviewsList'),status=d.querySelector('#marketReviewStatus');
 list.replaceChildren();status.textContent='Carregando avaliações...';
 const user=ravenMarketUser();
 const form=d.querySelector('#marketReviewForm');
 form.hidden=!user;d.querySelector('#marketReviewLogin').hidden=Boolean(user);
 if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');
 async function reload(){
  try{
   const reviews=await ravenMarketReviews(key);
   if(!d.open)return;
   list.replaceChildren();
   const approved=reviews.filter(x=>x.moderation_status==='approved');
   status.textContent=approved.length+' avaliação(ões) pública(s)';
   if(!reviews.length)list.append(element('p','market-empty','Ainda não há avaliações aprovadas para este modelo.'));
   for(const r of reviews){
    const entry=element('article','market-review-item');
    const head=element('strong','', '★'.repeat(r.rating)+'☆'.repeat(5-r.rating));
    const date=element('small','',new Date(r.created_at).toLocaleDateString('pt-BR'));
    const content=element('p','',r.body);
    entry.append(head,date,content);
    if(r.moderation_status!=='approved')entry.append(element('small','market-review-pending',r.moderation_status==='pending'?'Sua avaliação está aguardando aprovação.':'Sua avaliação não foi aprovada.'));
    if(user&&r.user_id===user.id){
     const del=element('button','market-action','Excluir minha avaliação');
     del.type='button';
     del.onclick=async()=>{
      if(!confirm('Excluir sua avaliação?'))return;
      try{await ravenMarketReviewDelete(r.id);await reload();}
      catch(err){status.textContent=err.message;}
     };
     entry.append(del);
    }
    list.append(entry);
   }
  }catch(err){status.textContent=err.message;}
 }
 d.querySelector('#marketReviewForm').onsubmit=async e=>{
  e.preventDefault();
  const btn=d.querySelector('.market-review-submit');btn.disabled=true;
  try{
   await ravenMarketReviewCreate(key,Number(d.querySelector('#marketReviewRating').value),d.querySelector('#marketReviewBody').value);
   d.querySelector('#marketReviewBody').value='';
   await reload();
   status.textContent='Avaliação recebida. Ela ficará visível após aprovação da Raven.';
  }catch(err){status.textContent=err.message;}
  finally{btn.disabled=false;}
 };
 await reload();
}
function renderUserCollections(){
 for(const kind of ['saved','cart']){
  const root=document.getElementById('market-'+kind+'-products');
  if(!root)continue;
  root.replaceChildren();
  if(!ravenMarketUser()){
    root.append(element('p','market-empty','Entre na sua conta para consultar seus produtos.'));
    continue;
  }
  const keys=ravenMarketKeys(kind),matches=groups.filter(g=>keys.has(g.id.slice(0,180)));
  if(!matches.length)root.append(element('p','market-empty',keys.size?'Essas ofertas não estão mais no catálogo atual.':'Sua lista está vazia. Abra o catálogo para adicionar produtos.'));
  else root.append(...matches.map(productCard));
  if(keys.size>matches.length)root.append(element('p','market-empty',(keys.size-matches.length)+' item(ns) indisponível(is) no catálogo atual.'));
 }
}
ravenMarketInit(()=>{
 const count=$('live-offer-count');if(count)count.textContent=String(all.length);
 if(all.length){home();catalogPage();}
 renderUserCollections();
});

function home(){
 const root=$('home-deals');if(!root)return;
 // A seleção da vitrine leva em conta completude e consulta recente, sem declarar validação.
 const sorted=rankFeaturedGroups(groups);
 root.replaceChildren(...sorted.map(productCard));
 const count=$('live-offer-count');if(count)count.textContent=String(all.length);
 if(!sorted.length)root.append(element('div','no-offers','Ainda não há ofertas publicadas para exibir.'));
}
function catalogPage(){
 const root=$('catalog-grid');if(!root)return;
 const search=$('catalog-search'),type=$('catalog-category'),shop=$('catalog-store'),order=$('catalog-order');
 const cond=$('catalog-condition'),maximum=$('catalog-max-price'),photos=$('catalog-photos-only'),recent=$('catalog-recent-only');
 const ord=order?.value||'lowest';
 const filtered=filterCatalogOffers(all,{search:search?.value,category:type?.value,
   store:shop?.value,condition:cond?.value,maxPrice:maximum?.value,photoOnly:photos?.checked,recentOnly:recent?.checked},
   {categoryOf:category,hasPhoto:o=>Boolean(imageFor(o)),isRecent,labelOf:o=>known.get(o.partId)?.name});
 const array=grouped(filtered);
 array.sort((a,b)=>ord==='highest'?b.best.price-a.best.price:ord==='recent'?b.best.checkedAt.localeCompare(a.best.checkedAt):a.best.price-b.best.price);
 const count=$('catalog-count');if(count)count.textContent=array.length+' modelos · '+filtered.length+' anúncios nos filtros ('+filtered.filter(isRecent).length+' recentes, '+filtered.filter(x=>!isRecent(x)).length+' com preço antigo)';
 root.replaceChildren(...array.slice(0,visibleLimit).map(productCard));
 if(!array.length)root.append(element('div','no-offers',recent?.checked?'Nenhuma oferta recente corresponde aos filtros. Desmarque “Somente preços conferidos nos últimos 14 dias” para ver anúncios antigos.':'Nenhuma oferta corresponde aos filtros. Tente outra categoria ou pesquise pelo modelo.'));
 const more=$('catalog-more');if(more){more.hidden=array.length<=visibleLimit;more.textContent='Mostrar mais modelos ('+Math.max(0,array.length-visibleLimit)+')';}
}
async function start(){
 const root=$('home-deals')||$('catalog-grid')||$('market-saved-products');if(!root)return;
 try{
   const response=await fetch('./offers.json',{cache:'no-store'});
   if(!response.ok)throw Error('Falha HTTP '+response.status);
   const data=await response.json();
   all=publicOffers(data.offers).filter(valid);
   const status=$('catalog-trust-status');
   if(status){
     const shown=all.filter(o=>!['pc','kit'].includes(category(o)));
     const fresh=shown.filter(isRecent).length,old=shown.length-fresh;
     const date=typeof data.updatedAt==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt)
       ? data.updatedAt.split('-').reverse().join('/'):'não informada';
     status.textContent='Data indicada no catálogo: '+date+' · '+fresh+' anúncio(s) com preço consultado nos últimos 14 dias · '+old+' com preço antigo. Os valores não são verificados em tempo real; confirme preço, disponibilidade e frete na loja.';
     status.classList.toggle('warning',fresh===0||old>fresh);
   }
   groups=grouped(all.filter(o=>!['pc','kit'].includes(category(o))));
   categorySymbols();
   home();
   const search=$('catalog-search'),type=$('catalog-category'),shop=$('catalog-store'),order=$('catalog-order'),more=$('catalog-more');
   const cond=$('catalog-condition'),maximum=$('catalog-max-price'),photos=$('catalog-photos-only'),recent=$('catalog-recent-only'),clear=$('catalog-clear');
   const params=new URLSearchParams(location.search);
   if(search){search.value=params.get('q')||'';search.addEventListener('input',()=>{visibleLimit=24;catalogPage();});}
   if(type){const c=params.get('categoria');if(c&&Object.hasOwn(labels,c))type.value=c;type.addEventListener('change',()=>{visibleLimit=24;catalogPage();});}
   if(shop)shop.addEventListener('change',()=>{visibleLimit=24;catalogPage();});
   if(cond)cond.addEventListener('change',()=>{visibleLimit=24;catalogPage();});
   if(maximum)maximum.addEventListener('input',()=>{visibleLimit=24;catalogPage();});
   if(photos)photos.addEventListener('change',()=>{visibleLimit=24;catalogPage();});
   if(recent)recent.addEventListener('change',()=>{visibleLimit=24;catalogPage();});
   if(clear)clear.addEventListener('click',()=>{
     if(search)search.value='';if(type)type.value='all';if(shop)shop.value='all';
     if(cond)cond.value='all';if(maximum)maximum.value='';if(photos)photos.checked=false;if(recent)recent.checked=false;
     if(order)order.value='lowest';visibleLimit=24;catalogPage();
     history.replaceState(null,'',location.pathname+location.hash);
   });
   if(order)order.addEventListener('change',catalogPage);
   if(more)more.addEventListener('click',()=>{visibleLimit+=24;catalogPage();});
   catalogPage();
   renderUserCollections();
 }catch(err){root.replaceChildren(element('div','no-offers','Não foi possível carregar ofertas. Tente atualizar a página.'));const line=$('catalog-count');if(line)line.textContent='Falha ao carregar arquivo de ofertas.';}
}
start();