/** Raven 9.2: pesquisa, facetas e identidade — somente dados cadastrados. */
import {foldTerm} from './catalog-filters.mjs';
import {trustedOfferUrl,offerAgeDays} from './offer-policy.mjs';

const STOP=new Set(['de','da','do','para','com','em','um','uma','a','o','e','por','the','pcs']);
const TOKEN_ALIASES=new Map([
 ['gpu','placa video'],['vga','placa video'],['graphics','placa video'],
 ['placa de video','gpu'],['processador','cpu'],['processadores','cpu'],
 ['memoria','ram'],['memorias','ram'],['armazenamento','ssd'],
 ['solid state','ssd'],['mobo','placa mae'],['motherboard','placa mae'],
 ['mb','placa mae'],['gabinete','case'],['headphone','headset'],
 ['fone','headset'],['notebook','laptop'],['celular','phone']
]);
export function searchTokens(value){
 const input=foldTerm(value);
 const terms=input.split(' ').filter(x=>x&&!STOP.has(x));
 return terms.flatMap(t=>[t,...(TOKEN_ALIASES.get(t)||'').split(' ').filter(Boolean)]);
}
export function modelFingerprint(offer){
 const source=foldTerm([offer?.modelName,offer?.title].filter(Boolean).join(' '));
 const category=foldTerm(offer?.category||'');
 const ids=[];
 // Não inventar o SKU: o nome precisa ter uma designação explícita.
 const patterns={
  cpu:/(?:ryzen\s+[3579]\s+\d{4,5}[a-z0-9]*|(?:core\s+)?i[3579]\s*[- ]\s*\d{4,5}[a-z0-9]*|xeon\s+[a-z]\d?[- ]\d{4,5}[a-z0-9]*)/i,
  gpu:/(?:rtx|gtx|rx)\s*[- ]?\s*\d{3,4}\s*(?:ti|super|xt|xtx)?/i
 };
 const match=patterns[category]?.exec(source);
 if(match)ids.push(foldTerm(match[0]).replace(/\s/g,''));
 const memory=/\b(?:ddr[345])\b/i.exec(source);
 const capacity=/\b(\d{1,4})\s*(gb|tb)\b/i.exec(source);
 return {category,partId:String(offer?.partId||''),model:ids[0]||null,
  memory:memory?.[0].toUpperCase()||null,capacity:capacity?capacity[1]+capacity[2].toUpperCase():null,
  explicitModel:Boolean(ids[0])};
}
export function identityAudit(offer,reference=null){
 const observed=modelFingerprint(offer);
 const reasons=[];
 if(!offer?.partId)reasons.push('ID da peça ausente');
 if(['cpu','gpu'].includes(observed.category)&&!observed.explicitModel)
  reasons.push('Modelo exato não identificado no anúncio');
 const refCategory=reference?.category||null;
 if(refCategory&&refCategory!==offer.category)reasons.push('Categoria diferente da referência cadastrada');
 const referenceModel=modelFingerprint({...offer,title:reference?.name,modelName:reference?.name});
 if(reference?.name&&observed.explicitModel&&referenceModel.explicitModel&&observed.model!==referenceModel.model)
  reasons.push('Modelo do anúncio não corresponde à referência');
 if(!offer?.modelName)reasons.push('Nome do modelo não informado separadamente');
 const title=foldTerm(offer?.title||'');
 if(observed.category==='cpu'&&/(?:pc gamer|computador completo|kit upgrade)/.test(title))
  reasons.push('Anúncio de kit ou PC associado a processador');
 return {partId:observed.partId,model:observed.model,confidence:reasons.length?'revisar':'referência-coerente',reasons,
  notice:'Regras de texto, não confirmação de SKU, fabricante ou autenticidade'};
}
export function specifications(offer,reference=null){
 const p=reference&&reference.id===offer?.partId&&!reference.conceptual?reference:null;
 const hay=String([offer?.modelName,offer?.title].join(' '));
 const memory=(p?.memory||hay.match(/\bDDR[345]\b/i)?.[0]||'').toUpperCase();
 const socket=p?.socket||null;
 const capacity=Number.isFinite(p?.gb)?p.gb+' GB':(hay.match(/\b\d{1,4}\s*(?:GB|TB)\b/i)?.[0]||null);
 const wattage=Number.isFinite(p?.watts)?p.watts:(!p&&/^(psu|fonte)$/i.test(offer?.category||'')?null:null);
 return {socket,memory:memory||null,capacity,watts:wattage,
  referenceKnown:Boolean(p),source:p?'referência cadastrada':'texto do anúncio — não verificado'};
}
export function matchedSpecifications(offer,filters={},reference=null){
 const spec=specifications(offer,reference);
 if(filters.socket&&filters.socket!=='all'&&spec.socket!==filters.socket)return false;
 if(filters.memory&&filters.memory!=='all'&&spec.memory!==filters.memory)return false;
 if(filters.capacity&&filters.capacity!=='all'&&foldTerm(spec.capacity)!==foldTerm(filters.capacity))return false;
 return true;
}
export function smartSearchScore(offer,query,reference=null){
 const tokens=searchTokens(query);if(!tokens.length)return 1;
 const core=foldTerm([offer.title,offer.modelName,offer.partId,reference?.name].join(' '));
 const hay=foldTerm([core,offer.category,offer.store].join(' '));
 const catAliases={gpu:'placa video vga',cpu:'processador',board:'placa mae motherboard',
  ram:'memoria',psu:'fonte',ssd:'armazenamento',hdd:'armazenamento',case:'gabinete'};
 const expanded=hay+' '+(catAliases[offer.category]||'');
 const raw=foldTerm(query);
 const requested=raw.split(' ').filter(x=>x&&!STOP.has(x));
 if(!requested.every(t=>expanded.includes(t)||tokens.includes(t)&&tokens.some(x=>expanded.includes(x))))return 0;
 let score=10;
 if(core.includes(raw))score+=40;
 if(foldTerm(offer.partId)===raw)score+=45;
 if(foldTerm(offer.modelName||'')===raw)score+=60;
 for(const t of requested)if(core.split(' ').includes(t))score+=3;
 if(reference&&!reference.conceptual)score+=2;
 return score;
}
export function rankCatalogSearch(offers,query,referenceById=new Map()){
 return (Array.isArray(offers)?offers:[]).map(offer=>({
  offer,score:smartSearchScore(offer,query,referenceById.get(offer.partId))
 })).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.offer.price-b.offer.price).map(x=>x.offer);
}
export function monitorSnapshot(offers,now=new Date(),history=[]){
 const rows=(Array.isArray(offers)?offers:[]).map(o=>{
  const url=trustedOfferUrl(o?.url,o?.store);
  const days=offerAgeDays(o?.checkedAt,now);
  const past=(Array.isArray(history)?history:[]).filter(h=>h.partId===o?.partId&&h.store===o?.store&&Number.isFinite(h.price));
  past.sort((a,b)=>String(b.checkedAt).localeCompare(String(a.checkedAt)));
  const last=past.find(h=>h.checkedAt<o.checkedAt);
  const priceChange=last?Math.round((o.price-last.price)*100)/100:null;
  const problems=[];
  if(!url)problems.push('Link fora dos domínios aprovados ou inválido');
  if(!Number.isFinite(days)||days<0)problems.push('Data de consulta inválida');
  else if(days>14)problems.push('Preço sem conferência há mais de 14 dias');
  if(o?.reviewStatus==='pending'||o?.reviewStatus==='hold')problems.push('Revisão pendente/suspensa');
  return {partId:o?.partId||'',store:o?.store||'',url:url||null,checkedAt:o?.checkedAt||null,
    ageDays:days,price:o?.price,priorPrice:last?.price??null,priceChange,problems,
    linkStatus:'não consultado pela análise estática'};
 });
 return {total:rows.length,needsAttention:rows.filter(x=>x.problems.length).length,
  withPriceChanges:rows.filter(x=>x.priceChange!==null).length,rows};
}

/** Compatibilidade de chave com os favoritos/avaliações existentes no catálogo. */
export function productCollectionKey(offer,reference=null){
 const ref=reference?.id===offer?.partId?reference:null;
 const model=offer?.modelName||ref?.name||offer?.partId||offer?.title;
 const kind=offer?.category||ref?.category||'other';
 const title=String(offer?.title||offer?.modelName||'');
 const cap=['gpu','ram','ssd','hdd'].includes(kind)?(title.match(/\b(\d{1,4})\s*(GB|TB)\b/i)||[]):[];
 return [kind,offer?.condition==='used'?'used':offer?.condition==='refurbished'?'refurbished':'new',
  foldTerm(model),cap[0]?foldTerm(cap[0]):''].join('|').slice(0,180);
}
