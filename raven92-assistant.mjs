/** Raven 9.2: consulta explicável de ofertas; motor determinístico, não LLM. */
import {rankCatalogSearch,identityAudit} from './raven92-core.mjs';
const queryTerms=/\b(quero|procuro|preciso|comprar|encontrar|veja|mostre|mostrar|me|um|uma|o|a|qual|melhor|preco|preço|comparar|pesquisar|sobre|para|por|ate|até)\b/gi;
export function catalogAnswer(query,offers,referenceById=new Map()){
 const cleaned=String(query||'').replace(queryTerms,' ').replace(/\s+/g,' ').trim();
 if(cleaned.length<2)return {items:[],text:'Informe uma marca ou modelo mais específico, como Ryzen 5 5500 ou RX 6600.'};
 const ranked=rankCatalogSearch(offers,cleaned,referenceById);
 const unique=new Map();
 for(const offer of ranked){
  if(!unique.has(offer.partId))unique.set(offer.partId,offer);
  if(unique.size>=5)break;
 }
 const items=[...unique.values()].map(o=>({offer:o,review:identityAudit(o,referenceById.get(o.partId))}));
 return {items,text:items.length?
  'Localizei '+items.length+' referência(s) em anúncios publicados. Veja a ficha de cada produto e confirme o modelo e o preço na loja.':
  'Não localizei anúncios aprovados compatíveis com essa pesquisa. Tente um modelo mais específico.'};
}
