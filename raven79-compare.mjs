/** Raven 7.6: compara até três links públicos do Montador.
 * Nunca atribui preço ao catálogo ilustrativo.
 */
import {evaluateCompatibility} from './compatibility.js';
import {publicOffers,offerAgeDays} from './offer-policy.mjs';
import {extendBuilderCatalog} from './builder-published-parts.mjs';
export const BUILD_ORDER=Object.freeze(['case','board','cpu','ram','gpu','ssd','psu','cooler']);
export const BUILD_LABELS={case:'Gabinete',board:'Placa-mãe',cpu:'CPU',ram:'Memória RAM',gpu:'Placa de vídeo',ssd:'Armazenamento',psu:'Fonte',cooler:'Cooler'};
export function builderCatalog(catalog,approved,now=new Date()){
 const clone=Object.fromEntries(Object.entries(catalog).map(([k,list])=>[k,list.map(x=>({...x}))]));
 extendBuilderCatalog(clone,publicOffers(approved,now),{
  isRecent:o=>{const n=offerAgeDays(o.checkedAt,now);return n>=0&&n<=14}});
 return clone;
}
export function parseBuildLink(value){
 if(typeof value!=='string'||value.length>4000)throw Error('Link muito grande ou inválido.');
 const input=value.trim(),match=input.match(/(?:#|^)b=([^&#\s]+)/);
 if(!match)throw Error('Cole um link do Montador com #b= e as peças selecionadas.');
 let ids;try{ids=decodeURIComponent(match[1]).split(',')}catch{throw Error('Codificação do link inválida.')}
 if(ids.length!==BUILD_ORDER.length)throw Error('Link de montagem incompleto ou em formato inesperado.');
 if(ids.some(x=>x&&!/^[\w.:-]{1,180}$/.test(x)))throw Error('Identificador de peça inválido.');
 return Object.fromEntries(BUILD_ORDER.map((group,i)=>[group,ids[i]||null]));
}
export function buildLink(ids){
 const parts=BUILD_ORDER.map(k=>String(ids?.[k]||''));
 if(parts.some(x=>x&&!/^[\w.:-]{1,180}$/.test(x)))throw Error('ID inválido.');
 return 'index.html#b='+parts.join(',');
}
export function compareBuild(ids,catalog,offers,now=new Date()){
 const available=publicOffers(offers,now).filter(o=>{
  const age=offerAgeDays(o.checkedAt,now);return age>=0&&age<=14;
 });
 const parts={},quotes={},unknownIds=[];
 let quoted=0,total=0;
 for(const key of BUILD_ORDER){
  const part=(catalog[key]||[]).find(p=>p.id===ids?.[key])||null;
  parts[key]=part;
  if(ids?.[key]&&!part)unknownIds.push(key);
  if(!part)continue;
  const matches=available.filter(o=>o.partId===part.id).sort((a,b)=>a.price-b.price);
  if(matches.length){quotes[key]=matches[0];quoted++;total+=matches[0].price;}
 }
 const assessment=evaluateCompatibility(parts);
 const filled=Object.values(parts).filter(Boolean).length;
 return {parts,quotes,unknownIds,filled,quoted,total,assessment,
  complete:filled===8&&quoted===8&&assessment.errors.length===0,
  note:'Subtotal apenas de anúncios recentes publicados, sem frete. Compatibilidade parcial; não é laudo técnico.'};
}
