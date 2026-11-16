/** Raven 7.2–7.5 — leitura pública, não validação de produto ou estoque.
 * Nenhum dado remoto é enviado a serviços terceiros por este módulo.
 */
import {auditOffer,offerAgeDays} from './offer-policy.mjs';
const strip=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const sizeOf=name=>{const found=String(name||'').match(/\b(\d{1,4})\s*(GB|TB)\b/i);return found?Number(found[1])*(found[2].toUpperCase()==='TB'?1024:1):null};
const ddrOf=name=>String(name||'').match(/\bDDR[345]\b/i)?.[0]?.toUpperCase()||null;
export function referenceFor(offer,catalog){
 if(!offer?.partId||!catalog)return null;
 for(const [category,items] of Object.entries(catalog)){
  const part=Array.isArray(items)?items.find(x=>x.id===offer.partId):null;
  if(part)return {...part,category};
 }
 return null;
}
export function evidenceFor(offer,catalog){
 const ref=referenceFor(offer,catalog),title=String(offer?.title||offer?.modelName||'');
 const issues=[];
 const type=offer?.category||ref?.category||'other';
 const size=sizeOf(title),referenceSize=sizeOf(ref?.name);
 if(['ram','ssd','hdd','gpu'].includes(type)&&size!==null&&referenceSize!==null&&size!==referenceSize)
  issues.push('Capacidade anunciada diferente da referência cadastrada');
 if(['ram','board'].includes(type)){
  const declared=ddrOf(title),reference=ref?.memory||ddrOf(ref?.name);
  if(declared&&reference&&declared!==reference)issues.push('Geração DDR divergente');
 }
 if(type==='cpu'&&/\b(?:pc\s*gamer|computador\s+completo)\b/i.test(title))issues.push('Possível computador completo');
 const hasImage=typeof offer?.imageUrl==='string'&&/^https:\/\//i.test(offer.imageUrl);
 const direct=ref&&!ref.conceptual;
 return {partId:String(offer?.partId||''),type,reference:direct?ref:null,
  label:issues.length?'Conferir divergência':direct?'Referência cadastrada':'Informações do vendedor',
  imageStatus:hasImage?'Imagem cadastrada (modelo não certificado)':'Sem imagem cadastrada',
  issues,hasImage};
}
export function catalogHealth(offers,catalog,now=new Date()){
 const source=Array.isArray(offers)?offers:[];
 const result={total:source.length,eligible:0,recent:0,withoutPhoto:0,withoutReference:0,needsReview:0,issues:[]};
 for(const o of source){
  const review=auditOffer(o,now),ev=evidenceFor(o,catalog);
  if(review.displayable){
   result.eligible++;
   const age=offerAgeDays(o.checkedAt,now);if(age>=0&&age<=14)result.recent++;
   if(!ev.hasImage)result.withoutPhoto++;
   if(!ev.reference)result.withoutReference++;
  }
  if(!review.displayable||ev.issues.length){
   result.needsReview++;
   if(result.issues.length<30)result.issues.push({partId:ev.partId,store:String(o.store||''),
    problems:[...review.errors,...ev.issues]});
  }
 }
 return result;
}
export function priceTimeline(partId,offers,history=[],now=new Date(),store=null){
 const key=String(partId||'');
 const publicRows=(Array.isArray(offers)?offers:[]).filter(o=>o?.partId===key&&(store===null||o.store===store)&&auditOffer(o,now).displayable);
 const allowedShops=new Set(publicRows.map(x=>x.store));
 const lines=[];
 for(const row of Array.isArray(history)?history:[]){
  if(row?.partId!==key||!allowedShops.has(row.store)||(store!==null&&row.store!==store))continue;
  if(!Number.isFinite(row.price)||row.price<=0)continue;
  const age=offerAgeDays(row.checkedAt,now);
  if(age<0||age>3650||!Number.isFinite(age))continue;
  lines.push({date:row.checkedAt,price:row.price,store:row.store,kind:'histórico registrado'});
 }
 for(const o of publicRows){
  if(offerAgeDays(o.checkedAt,now)<0)continue;
  lines.push({date:o.checkedAt,price:o.price,store:o.store,kind:'preço cadastrado'});
 }
 const unique=new Map();
 for(const p of lines)unique.set(p.store+'|'+p.date,{...p});
 const data=[...unique.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.store.localeCompare(b.store));
 const distinctDates=new Set(data.map(x=>x.date)).size;
 return {partId:key,points:data,hasTrend:distinctDates>=2,
  notice:distinctDates<2?'Histórico insuficiente para afirmar alta ou queda. Não há consulta em tempo real.':'Comparação de registros cadastrados; não comprova promoções nem estoque.'};
}
export function marketQualitySummary(offers,catalog,now=new Date()){
 const health=catalogHealth(offers,catalog,now),byStore={},keyCount=new Map(),duplicates=[];
 for(const o of Array.isArray(offers)?offers:[]){
  const store=String(o?.store||'sem loja');byStore[store]=(byStore[store]||0)+1;
  const key=[store,String(o?.partId||''),String(o?.url||'')].join('|');
  const count=(keyCount.get(key)||0)+1;keyCount.set(key,count);
  if(count===2)duplicates.push({partId:String(o?.partId||''),store});
 }
 return {...health,byStore,duplicates:duplicates.slice(0,30),
  disclaimer:'Relatório local. Aprovação, fotos e enlaces devem ser conferidos pelo operador.'};
}
