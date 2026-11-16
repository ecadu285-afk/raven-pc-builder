/** Raven 6.7 — detalhes somente de fichas já cadastradas ou do próprio anúncio.
 * Nenhum atributo desconhecido é completado por IA nem por estimativa de outro produto.
 */
const allowed=(value)=>typeof value==='string'&&value.trim()?value.trim():null;
export function productFacts(offer={},reference=null){
 const p=reference&&reference.id===offer.partId&&reference.conceptual!==true?reference:null;
 const type=offer.category||p?.category||'other';
 const result=[];
 const add=(label,value,source='catálogo')=>{if(value!==null&&value!==undefined&&value!=='')result.push({label,value:String(value),source})};
 if(p){
  if(type==='cpu'){add('Socket',allowed(p.socket));add('Vídeo integrado',typeof p.igpu==='boolean'?(p.igpu?'Sim':'Não'):null);add('Potência de referência',Number.isFinite(p.watts)?p.watts+' W':null)}
  if(type==='board'){add('Socket',allowed(p.socket));add('Memória',allowed(p.memory));add('Formato',allowed(p.form));add('Suporte NVMe',typeof p.m2Nvme==='boolean'?(p.m2Nvme?'Declarado':'Não declarado'):null)}
  if(type==='ram'){add('Geração',allowed(p.memory));add('Capacidade cadastrada',Number.isFinite(p.gb)?p.gb+' GB':null)}
  if(type==='gpu'){add('Consumo ilustrativo',Number.isFinite(p.power)?p.power+' W':null);add('Comprimento cadastrado',Number.isFinite(p.lengthMm)?p.lengthMm+' mm':null)}
  if(type==='psu')add('Potência nominal cadastrada',Number.isFinite(p.watts)?p.watts+' W':null);
  if(type==='case'){add('Placas compatíveis',allowed(p.form));add('Comprimento máximo da GPU',Number.isFinite(p.gpuMaxMm)?p.gpuMaxMm+' mm':null)}
  if(type==='cooler')add('Fixação declarada',Array.isArray(p.sockets)?p.sockets.join(', '):null);
 }
 const title=allowed(offer.title)||allowed(offer.modelName)||'';
 if(type==='gpu'&&!result.some(x=>x.label==='Memória anunciada')){
  const match=title.match(/\b(2|3|4|6|8|10|12|16|20|24)\s*GB\b/i);
  if(match)add('Memória anunciada',match[1]+' GB','título do anúncio');
 }
 return result;
}
export function productFactsDescription(facts){
 return facts.map(f=>f.label+': '+f.value+(f.source==='título do anúncio'?' (não verificado)':'')).join(' · ');
}