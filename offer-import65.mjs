/** RAVEN 6.5: mescla exportações do Market Bot sem alterar publicações automaticamente.
 * Nunca transfere senhas, tokens ou campos desconhecidos do robô.
 */
import {auditOffer} from './offer-policy.mjs';
const fields=['partId','store','url','price','checkedAt','category','condition','title','modelName','imageUrl','affiliate','priceCondition','source','sourceId'];
const asText=x=>String(x??'').trim();
export const offerIdentity=x=>[asText(x?.store).toLowerCase(),asText(x?.url).replace(/\/+$/,'')].join('|');
const changed=(a,b)=>['partId','store','url','price','checkedAt','category','condition','title','modelName','imageUrl','affiliate','priceCondition'].some(k=>(a?.[k]??'')!==(b?.[k]??''));
function incoming(raw,now){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const o=Object.fromEntries(fields.filter(k=>Object.hasOwn(raw,k)).map(k=>[k,raw[k]]));
 o.partId=asText(o.partId);o.store=asText(o.store).toLowerCase();
 o.url=asText(o.url);o.checkedAt=asText(o.checkedAt);
 o.category=asText(o.category);o.condition=asText(o.condition||'new');
 o.title=asText(o.title).slice(0,240);
 o.modelName=asText(o.modelName||o.title).slice(0,240);
 o.affiliate=o.affiliate===true;o.affiliateStatus='pending';
 if(typeof o.price!=='number'||!Number.isFinite(o.price)||o.price<=0)return null;
 if(auditOffer({...o,reviewStatus:'approved'},now).errors.length)return null;
 return o;
}
export function stageBotOffers(current,bot,{now=new Date()}={}){
 if(!current||!Array.isArray(current.offers))throw Error('Carregue primeiro o offers.json atual.');
 const list=Array.isArray(bot)?bot:bot?.offers;
 if(!Array.isArray(list))throw Error('A exportação precisa conter offers[].');
 if(list.length>10000)throw Error('Arquivo grande demais para revisão.');
 const document=structuredClone(current);
 document.history=Array.isArray(document.history)?document.history:[];
 const exact=new Map(),byModel=new Map();
 document.offers.forEach((o,i)=>{
  exact.set(offerIdentity(o),i);
  const key=asText(o.store)+'|'+asText(o.partId);
  const existing=byModel.get(key)||[];
  existing.push(i);byModel.set(key,existing);
 });
 const output={document,inserted:0,updated:0,unchanged:0,rejected:0,notices:[],changes:[]};
 const seen=new Set();
 for(const raw of list){
  const row=incoming(raw,now);
  if(!row){output.rejected++;continue}
  const key=offerIdentity(row);
  if(seen.has(key)){output.rejected++;continue}
  seen.add(key);
  let i=exact.get(key);
  const modelKey=row.store+'|'+row.partId;
  if(i===undefined){
   const sameModel=byModel.get(modelKey)||[];
   if(sameModel.length===1)i=sameModel[0]; // Troca de URL do mesmo modelo/loja: não deixa a anterior pública.
  }
  if(i===undefined){
   document.offers.push({...row,reviewStatus:'pending',reviewNote:'Oferta nova do robô; confira preço, URL e modelo'});
   const position=document.offers.length-1;
   exact.set(key,position);
   byModel.set(modelKey,[...(byModel.get(modelKey)||[]),position]);
   output.inserted++;output.changes.push({kind:'novo',store:row.store,partId:row.partId,price:row.price,checkedAt:row.checkedAt});continue;
  }
  const previous=document.offers[i];
  if(row.checkedAt<(previous.checkedAt||'')){
   output.unchanged++;
   output.notices.push('Data mais antiga ignorada: '+row.partId+' / '+row.store);
   continue;
  }
  if(!changed(previous,row)){output.unchanged++;continue}
  if(previous.price!==row.price)document.history.push({partId:previous.partId,store:previous.store,price:previous.price,checkedAt:previous.checkedAt,url:previous.url});
  const imageChanged=Object.hasOwn(row,'imageUrl')&&row.imageUrl!==previous.imageUrl;
  document.offers[i]={...previous,...row,reviewStatus:'pending',affiliateStatus:'pending',
    ...(imageChanged?{imageReviewStatus:'pending',imageReviewedAt:'',imageUsagePermission:false,imageCredit:''}:{}),
    reviewNote:'Alterada pelo robô; confirmar novamente na loja'};
  exact.delete(offerIdentity(previous));exact.set(key,i);
  output.updated++;output.changes.push({kind:'alterado',store:row.store,partId:row.partId,oldPrice:previous.price,price:row.price,checkedAt:row.checkedAt});
 }
 document.schemaVersion=Math.max(3,Number(document.schemaVersion)||3);
 document.history=document.history.slice(-2000);
 if(output.rejected)output.notices.push(output.rejected+' registros inválidos ou duplicados rejeitados.');
 return output;
}
