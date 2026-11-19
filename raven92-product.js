import {catalog} from './catalog.js';
import {publicPriceState} from './price-visibility.mjs';
import {publicOffers,trustedOfferUrl,offerAgeDays} from './offer-policy.mjs';
import {productFacts} from './product-details.mjs';
import {safeProductImage,imageEvidence} from './raven91-catalog.mjs';
import {identityAudit,specifications,productCollectionKey} from './raven92-core.mjs';
import {ravenMarketInit,ravenMarketUser,ravenMarketReviews,ravenMarketReviewCreate} from './raven-market.js';
const $=id=>document.getElementById(id);
const make=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
const money=x=>Number(x).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const stores={shopee:'Shopee',mercadolivre:'Mercado Livre',amazon:'Amazon',kabum:'KaBuM!',terabyte:'TerabyteShop'};
const known=new Map(Object.entries(catalog).flatMap(([category,rows])=>rows.map(item=>[item.id,{...item,category}])));
const id=new URLSearchParams(location.search).get('produto')?.trim()||'';
let reviewKey='';
function card(offer){
 const row=make('article','raven92-offer-row');
 const shop=make('div','');shop.append(make('strong','',stores[offer.store]||offer.store),make('small','','Consultado em '+String(offer.checkedAt||'').split('-').reverse().join('/')));
 const priceState=publicPriceState(offer);
 shop.append(make('small','raven92-muted',priceState.label));
 const price=make('strong','raven92-offer-price',priceState.show?money(offer.price):'Consultar preço na loja');
 const link=make('a','raven92-button',offer.affiliate?'Ver na loja · publicidade':'Ver na loja');
 link.href=trustedOfferUrl(offer.url,offer.store);link.target='_blank';link.rel=offer.affiliate?'noopener noreferrer sponsored':'noopener noreferrer';
 row.append(shop,price,link);return row;
}
function renderReviews(reviews,user){
 const approved=reviews.filter(x=>x.moderation_status==='approved');
 $('reviews-status').textContent=approved.length+' avaliação(ões) aprovada(s)'+
   (approved.length?' · média '+(approved.reduce((n,x)=>n+x.rating,0)/approved.length).toFixed(1).replace('.',',')+'/5':'');
 $('reviews-list').replaceChildren();
 if(!approved.length)$('reviews-list').append(make('p','raven92-muted','Nenhuma avaliação aprovada disponível.'));
 for(const review of approved){
  const entry=make('article','raven92-review');
  entry.append(make('strong','', '★'.repeat(review.rating)+'☆'.repeat(5-review.rating)),
    make('p','', review.body),make('small','',new Date(review.created_at).toLocaleDateString('pt-BR')));
  $('reviews-list').append(entry);
 }
 $('reviews-form').hidden=!user;$('reviews-login').hidden=Boolean(user);
}
async function refreshReviews(){
 try{const user=ravenMarketUser();const reviews=await ravenMarketReviews(reviewKey);renderReviews(reviews,user);}
 catch(e){$('reviews-status').textContent='Avaliações indisponíveis neste momento. Tente novamente.';}
}
async function init(){
 if(!/^[a-z0-9][a-z0-9._-]{0,139}$/i.test(id)){
  $('product-status').textContent='Referência inválida. Volte ao catálogo.';return;
 }
 try{
  const response=await fetch('./offers.json',{cache:'no-store'});if(!response.ok)throw Error('Catálogo indisponível');
  const doc=await response.json();
  const all=publicOffers(doc.offers);
  const choices=all.filter(x=>x.partId===id&&!['pc','kit'].includes(x.category));
  if(!choices.length){$('product-status').textContent='Esta referência não possui ofertas publicadas. Confira o catálogo completo.';return;}
  choices.sort((a,b)=>Number(publicPriceState(b).show)-Number(publicPriceState(a).show)||a.price-b.price);
  const best=choices[0],ref=known.get(best.partId),name=best.modelName||ref?.name||best.title||id;
  document.title=name+' | Raven PC Builder';
  const canonical=document.createElement('link');canonical.rel='canonical';
  canonical.href=new URL('produto.html?produto='+encodeURIComponent(id),location.href).href;
  document.head.append(canonical);
  const description=document.querySelector('meta[name="description"]');
  if(description)description.content='Consulte fichas cadastradas e '+choices.length+' anúncio(s) de '+name+' na Raven PC Builder. Valores a confirmar nas lojas.';
  $('product-status').textContent=choices.length+' anúncio(s) aprovado(s) nesta referência. Preços cadastrados, não ao vivo.';
  const wrap=$('product-head'),photo=make('div','raven92-product-photo'),imgUrl=safeProductImage(best);
  if(imgUrl){
   const img=make('img');img.src=imgUrl;img.alt='Foto associada ao anúncio de '+name;img.loading='lazy';
   img.decoding='async';img.onerror=()=>{img.replaceWith(make('p','raven92-muted','Imagem indisponível. Confira a foto na loja.'))};
   photo.append(img,make('small','',imageEvidence(best).label));
  }else photo.append(make('strong','',best.category.toUpperCase()),make('small','','Sem fotografia cadastrada para este anúncio'));
  const info=make('div','raven92-product-main');info.append(make('span','raven91-store-badge',best.category.toUpperCase()),
   make('h1','',name),make('p','raven92-muted',(publicPriceState(best).show?'Preço cadastrado a partir de '+money(best.price):'Preços disponíveis nas lojas')+' · '+choices.length+' anúncio(s) para consultar'));
  const audit=identityAudit(best,ref);
  info.append(make('p','raven92-notice',audit.reasons.length?'Identificação requer revisão: '+audit.reasons.join('; '):'Referência coerente nos dados cadastrados. Confirme o SKU real antes da compra.'));
  const actions=make('div','raven92-actions');
  const compare=make('a','raven92-button','Comparar lojas');compare.href='comparar-ofertas.html?produto='+encodeURIComponent(id);
  const history=make('a','raven92-button secondary','Histórico');history.href='historico.html?produto='+encodeURIComponent(id);
  actions.append(compare,history);info.append(actions);wrap.append(photo,info);wrap.hidden=false;
  $('product-offers').replaceChildren(...choices.map(card));
  const facts=productFacts(best,ref);
  const root=$('product-facts');root.replaceChildren();
  if(facts.length){
   const dl=make('dl','raven92-facts');
   for(const f of facts){const pair=make('div');pair.append(make('dt','',f.label),make('dd','',f.value+(f.source==='título do anúncio'?' (informado pelo vendedor)':'')));dl.append(pair)}root.append(dl);
  }else root.append(make('p','raven92-muted','Não há especificações técnicas suficientes registradas para este produto.'));
  const spec=specifications(best,ref);
  root.append(make('p','raven92-muted','Fonte dos dados: '+spec.source+'. Verifique ficha oficial, BIOS, revisão e condições de compatibilidade.'));
  const verify=make('a','raven92-button secondary','Abrir verificador de montagem');verify.href='verificar-pc.html?produto='+encodeURIComponent(id);root.append(verify);
  const related=[...new Map(all.filter(x=>x.category===best.category&&x.partId!==id).map(x=>[x.partId,x])).values()].slice(0,6);
  if(related.length)for(const item of related){const a=make('a','raven92-related-link',item.modelName||item.title||item.partId);
   a.href='produto.html?produto='+encodeURIComponent(item.partId);$('product-related').append(a);}
  else $('product-related').append(make('p','raven92-muted','Sem outros modelos publicados nesta categoria.'));
  reviewKey=productCollectionKey(best,ref);ravenMarketInit(()=>{if(reviewKey)refreshReviews()});
  await refreshReviews();
  $('reviews-form').addEventListener('submit',async e=>{
   e.preventDefault();if(!ravenMarketUser()){ $('reviews-status').textContent='Entre na conta antes de avaliar.';return}
   const form=e.currentTarget,button=form.querySelector('button');button.disabled=true;
   try{await ravenMarketReviewCreate(reviewKey,Number(form.elements.rating.value),form.elements.body.value.trim());
     form.reset();$('reviews-status').textContent='Avaliação enviada. Ela ficará pública somente após moderação.';}
   catch(err){$('reviews-status').textContent=err.message;}
   finally{button.disabled=false;}
  });
 }catch(e){$('product-status').textContent='Não foi possível carregar as informações desta referência.';console.warn(e);}
}
init();