/** Raven 9.1 — dados de vitrine, fotos e comparações; sem scraping ou preço ao vivo. */
import {trustedOfferUrl} from './offer-policy.mjs';

const imageHosts=[
 'shopee.com.br','shopee.com','shopeecdn.com','shopeeusercontent.com',
 'amazon.com.br','amazon.com','media-amazon.com','ssl-images-amazon.com',
 'mlstatic.com','mercadolivre.com.br','mercadolibre.com',
 'kabum.com.br','terabyteshop.com.br','wikimedia.org'
];
export function safeProductImage(offer){
 const input=offer?.imageUrl;
 if(typeof input!=='string'||!input.trim())return null;
 try{
  const url=new URL(input);
  if(url.protocol!=='https:'||url.username||url.password||url.port)return null;
  return imageHosts.some(domain=>url.hostname===domain||url.hostname.endsWith('.'+domain))?url.href:null;
 }catch{return null;}
}
export function imageEvidence(offer){
 const url=safeProductImage(offer);
 if(!url)return {url:null,label:'Sem foto deste anúncio',reviewed:false};
 // "Verificada" é um dado explícito da revisão manual; nunca é inferido do domínio.
 const reviewed=offer?.imageReviewStatus==='verified'&&
   typeof offer?.imageSource==='string'&&offer.imageSource.startsWith('https://')&&
   typeof offer?.imageReviewedAt==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(offer.imageReviewedAt)&&
   offer?.imageUsagePermission===true&&typeof offer?.imageCredit==='string'&&offer.imageCredit.trim().length>0;
 return {url,label:reviewed?'Foto conferida pela equipe':'Foto do anúncio · não revisada',reviewed};
}
export function countCategories(offers){
 const counts={};
 for(const offer of Array.isArray(offers)?offers:[]){
  const category=String(offer?.category||'other');
  counts[category]=(counts[category]||0)+1;
 }
 return counts;
}
const normalized=text=>String(text??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const genericModel=/^(ssd|hd|hdd|memoria|placa mae|fonte|gabinete|processador|placa de video)\b/;
export function comparableOfferGroups(offers){
 const byKey=new Map();
 for(const offer of Array.isArray(offers)?offers:[]){
  if(!offer?.partId||!offer?.store||!trustedOfferUrl(offer.url,offer.store)||!(offer.price>0))continue;
  if(['pc','kit'].includes(offer.category))continue;
  // Referência interna + categoria + condição. Não confundir novo com usado.
  const key=[normalized(offer.category),normalized(offer.condition||'new'),normalized(offer.partId)].join('|');
  if(!byKey.has(key))byKey.set(key,[]);
  byKey.get(key).push(offer);
 }
 return [...byKey].map(([key,items])=>{
  const distinct=new Map();
  for(const offer of items){
   const url=trustedOfferUrl(offer.url,offer.store);
   const identity=offer.store+'|'+url;
   if(!distinct.has(identity))distinct.set(identity,offer);
  }
  const sorted=[...distinct.values()].sort((a,b)=>a.price-b.price);
  const stores=new Set(sorted.map(x=>x.store));
  if(stores.size<2)return null;
  const model=sorted.find(o=>o.modelName)?.modelName||sorted[0].title||sorted[0].partId;
  // Mesmo ID Raven não é prova de SKU: nomes genéricos sempre exigem conferência.
  const names=sorted.map(x=>normalized(x.modelName||x.title||''));
  const sameName=names.every(x=>x===names[0]);
  const needsSkuReview=!sameName||genericModel.test(normalized(model))||
    !sorted.every(x=>x.modelName&&x.modelName.trim());
  return {key,partId:sorted[0].partId,category:sorted[0].category,
    condition:sorted[0].condition||'new',model,offers:sorted,stores:stores.size,
    min:sorted[0].price,max:sorted.at(-1).price,needsSkuReview};
 }).filter(Boolean).sort((a,b)=>a.needsSkuReview-b.needsSkuReview||a.min-b.min);
}
