/** Todos os anúncios elegíveis podem aparecer individualmente ou agrupados. 
 * Não faz alterações no status de publicação nem tenta recuperar ofertas suspensas.
 */
export function catalogDisplayEntries(offers,mode='offers',groupEntries){
 const source=Array.isArray(offers)?offers:[];
 if(typeof groupEntries!=='function')throw new TypeError('Agrupador não informado');
 if(mode==='models')return groupEntries(source);
 // Em modo ofertas, cada entrada é um anúncio real — evita esconder anúncios da segunda loja.
 return source.map(offer=>groupEntries([offer])[0]).filter(Boolean);
}
