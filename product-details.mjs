import {verifiedSpecFor} from './raven-specs-verified.mjs';

/**
 * Raven — ficha para todas as categorias.
 * Prioridades: fonte oficial quando houver; campos explícitos do anúncio;
 * referência interna cadastrada; "A confirmar" quando nada foi fornecido.
 * Uma descrição de vendedor nunca é marcada como verificação oficial.
 */
const text=x=>typeof x==='string'?x.trim():'';
const match=(str,regex)=>str.match(regex)?.[0]||null;
const labels={
 cpu:'Processador',board:'Placa-mãe',gpu:'Placa de vídeo',ram:'Memória RAM',
 ssd:'SSD',hdd:'HD',psu:'Fonte de alimentação',case:'Gabinete',
 keyboard:'Teclado',headset:'Headset',mouse:'Mouse',monitor:'Monitor',
 laptop:'Notebook',phone:'Celular',cooler:'Cooler',fan:'Ventoinha',
 mousepad:'Mousepad',chair:'Cadeira',powerstrip:'Filtro de linha',
 desk:'Mesa',other:'Produto'
};
const fields={
 cpu:['Modelo','Núcleos','Threads','Socket','Frequência','TDP'],
 board:['Modelo / chipset','Socket','Padrão de memória','Formato','Recursos'],
 gpu:['Modelo','Memória de vídeo','Tipo de memória','Consumo','Saídas de vídeo'],
 ram:['Capacidade','Tipo','Frequência','Formato'],
 ssd:['Capacidade','Interface','Formato','Velocidade'],
 hdd:['Capacidade','Interface','Formato','Rotação'],
 psu:['Potência anunciada','Certificação','PFC','Formato'],
 case:['Formato','Cor','Painel lateral','Ventoinhas'],
 keyboard:['Modelo','Tipo de teclado','Conexão','Layout'],
 headset:['Modelo','Conexão','Iluminação','Microfone'],
 mouse:['Modelo','Conexão','DPI'],
 monitor:['Modelo','Tamanho da tela','Taxa de atualização','Resolução'],
 laptop:['Modelo','Processador','Memória RAM','Armazenamento','Tela'],
 phone:['Modelo','Conectividade','Memória RAM','Armazenamento'],
 cooler:['Modelo','Tipo de refrigeração','Socket'],
 fan:['Modelo','Tamanho','Conexão'],
 mousepad:['Modelo','Dimensões','Material'],
 chair:['Modelo','Revestimento','Capacidade'],
 powerstrip:['Modelo','Número de tomadas','Proteção'],
 desk:['Modelo','Dimensões','Material'],
 other:['Modelo','Características']
};
const explicitModel=(title,category)=>{
 const patterns={
  cpu:/\b(?:intel\s+core\s+)?i[3579]\s*[- ]\s*\d{4,5}[a-z]{0,2}\b|\b(?:amd\s+)?ryzen\s+[3579]\s+\d{4,5}[a-z0-9]*\b|\bxeon\s+[a-z0-9-]+\b/i,
  gpu:/\b(?:geforce\s+)?(?:gtx|rtx|gt)\s*\d{3,4}\s*(?:super|ti)?\b|\b(?:radeon\s+)?rx\s*\d{3,4}\s*(?:xt|xtx)?\b|\bintel\s+arc\s+[a-z]\d{3,4}\b/i,
  board:/\b(?:h61|h81|b75|a320|a520|b450|b550|a620|b650|x570|x670e|h610|b660|b760|z790)\w*(?:\s+[a-z0-9-]+)?\b/i
 };
 return match(title,patterns[category])||null;
};
function titleFacts(offer,add){
 const cat=offer.category||'other';
 const title=text(offer.title||offer.modelName);
 const ref=text(offer.modelName);
 const model=explicitModel(title,cat)||explicitModel(ref,cat);
 if(model&&['cpu','gpu','board'].includes(cat))add(cat==='board'?'Modelo / chipset':'Modelo',model,'anúncio');
 if(cat==='cpu'){
  add('Núcleos',title.match(/\b(\d{1,2})\s*(?:n[uú]cleos|cores)\b/i)?.[1]||null,'anúncio');
  add('Threads',title.match(/\b(\d{1,2})\s*(?:threads)\b/i)?.[1]||null,'anúncio');
  add('Socket',match(title,/\b(?:AM[345]|LGA\s*-?\s*\d{3,4})\b/i),'anúncio');
  add('Frequência',match(title,/\b\d(?:[.,]\d{1,2})?\s*GHz\b/i),'anúncio');
  add('TDP',title.match(/\bTDP\s*:?\s*(\d{2,3}\s*W)\b/i)?.[1]||null,'anúncio');
 }else if(cat==='ram'){
  add('Capacidade',match(title,/\b\d{1,3}\s*GB\b/i),'anúncio');
  add('Tipo',match(title,/\bDDR[345]\b/i),'anúncio');
  add('Frequência',match(title,/\b\d{3,5}\s*MHz\b/i),'anúncio');
  add('Formato',match(title,/\b(?:SO-?DIMM|UDIMM|DIMM)\b/i),'anúncio');
 }else if(cat==='gpu'){
  add('Memória de vídeo',match(title,/\b\d{1,2}\s*GB\b/i),'anúncio');
  add('Tipo de memória',match(title,/\bGDDR[3567]X?\b/i),'anúncio');
 }else if(cat==='ssd'||cat==='hdd'){
  add('Capacidade',match(title,/\b\d{2,4}\s*GB\b|\b\d{1,2}\s*TB\b/i),'anúncio');
  add('Interface',match(title,/\bNVMe\b|\bSATA(?:\s*[236])?\b/i),'anúncio');
  add('Formato',match(title,/\bM\.?2\s*\d{4}\b|\bM\.?2\b|\b(?:2[.,]5|3[.,]5)(?:\s*["”]|-?polegadas)?/i),'anúncio');
  if(cat==='hdd')add('Rotação',match(title,/\b(?:5400|7200|10000)\s*RPM\b/i),'anúncio');
 }else if(cat==='psu'){
  add('Potência anunciada',match(title,/\b\d{3,4}\s*W\b/i),'anúncio');
  add('Certificação',match(title,/\b80\s*PLUS(?:\s+(?:WHITE|BRONZE|SILVER|GOLD|PLATINUM|TITANIUM))?\b/i),'anúncio');
  add('PFC',match(title,/\bPFC\s+ATIVO\b/i),'anúncio');
  add('Formato',match(title,/\bATX\b/i),'anúncio');
 }else if(cat==='board'){
  add('Socket',match(title,/\b(?:AM[345]|LGA\s*-?\s*\d{3,4})\b/i),'anúncio');
  add('Padrão de memória',match(title,/\bDDR[345]\b/i),'anúncio');
  add('Formato',match(title,/\b(?:MICRO-?ATX|MINI-?ITX|M-?ATX)\b/i),'anúncio');
  add('Recursos',match(title,/\bWI-?FI\b/i),'anúncio');
 }else if(cat==='case'){
  add('Formato',match(title,/\b(?:MINI-?TOWER|MID-?TOWER|FULL-?TOWER|MICRO\s*ATX|M-?ATX|ATX)\b/i),'anúncio');
  add('Cor',match(title,/\b(?:PRETO|BRANCO|CINZA|ROSA)\b/i),'anúncio');
  add('Painel lateral',match(title,/\b(?:LATERAL\s+DE\s+VIDRO|VIDRO\s+TEMPERADO)\b/i),'anúncio');
  add('Ventoinhas',title.match(/\b(?:COM\s+)?(\d{1,2})\s*(?:FANS|VENTOINHAS)\b/i)?.[1]||null,'anúncio');
 }else if(cat==='monitor'){
  add('Tamanho da tela',match(title,/\b\d{2}(?:[.,]\d)?\s*(?:"|”|POLEGADAS)\b/i),'anúncio');
  add('Taxa de atualização',match(title,/\b\d{2,3}\s*Hz\b/i),'anúncio');
  add('Resolução',match(title,/\b(?:FULL\s*HD|FHD|QHD|4K|1920\s*[x×]\s*1080|2560\s*[x×]\s*1440)\b/i),'anúncio');
 }else if(cat==='laptop'){
  add('Processador',match(title,/\b(?:INTEL\s+)?CELERON\b|\bRYZEN\s+\d\b|\bCORE\s+i[3579]\b/i),'anúncio');
  add('Memória RAM',title.match(/\b(\d{1,3}\s*GB)\s*RAM\b/i)?.[1]||null,'anúncio');
  add('Armazenamento',title.match(/\b(\d{2,4}\s*GB|\d\s*TB)\s*(?:SSD|HD)\b/i)?.[0]||null,'anúncio');
  add('Tela',match(title,/\b\d{2}(?:[.,]\d)?\s*(?:IN|")\b/i),'anúncio');
 }else if(cat==='phone'){
  add('Conectividade',match(title,/\b(?:4G|5G)\b/i),'anúncio');
 }else if(cat==='keyboard'){
  add('Tipo de teclado',match(title,/\bMEC[ÂA]NICO\b|\bMEMBRANA\b/i),'anúncio');
 }else if(cat==='headset'){
  add('Iluminação',match(title,/\bRGB\b/i),'anúncio');
 }
 if(['keyboard','headset','mouse','monitor','laptop','phone','cooler','fan','mousepad','chair','powerstrip','desk','other'].includes(cat)){
  if(title) add('Modelo',text(offer.modelName)||title,'anúncio');
 }
 if(['keyboard','headset','mouse'].includes(cat)){
  add('Conexão',match(title,/\b(?:BLUETOOTH|WIRELESS|SEM\s+FIO|USB|P2|P3)\b/i),'anúncio');
 }
}
function referenceFacts(offer,reference,add){
 const p=reference&&reference.id===offer.partId&&reference.conceptual!==true?reference:null;
 if(!p||p.category&&p.category!==offer.category)return;
 const cat=offer.category||p.category;
 const source='cadastro';
 if(cat==='cpu'){
  add('Socket',text(p.socket),source);
  if(typeof p.igpu==='boolean')add('Vídeo integrado',p.igpu?'Sim':'Não',source);
  if(Number.isFinite(p.watts))add('Potência de referência',p.watts+' W',source);
 }else if(cat==='board'){
  add('Socket',text(p.socket),source);add('Padrão de memória',text(p.memory),source);
  add('Formato',text(p.form),source);
 }else if(cat==='ram'){
  add('Tipo',text(p.memory),source);if(Number.isFinite(p.gb))add('Capacidade',p.gb+' GB',source);
 }else if(cat==='gpu'){
  if(Number.isFinite(p.power))add('Consumo de referência',p.power+' W',source);
  if(Number.isFinite(p.lengthMm))add('Comprimento de referência',p.lengthMm+' mm',source);
 }else if(cat==='psu'){
  if(Number.isFinite(p.watts))add('Potência anunciada',p.watts+' W',source);
 }else if(cat==='case'){
  add('Formato',text(p.form),source);
  if(Number.isFinite(p.gpuMaxMm))add('Espaço de GPU no cadastro',p.gpuMaxMm+' mm',source);
 }else if(cat==='cooler'&&Array.isArray(p.sockets))add('Fixação cadastrada',p.sockets.join(', '),source);
}
export function productSpecificationSheet(offer={},reference=null){
 const official=verifiedSpecFor(offer);
 if(official){
  return {status:'official',facts:official.facts,source:'Fabricante',officialUrl:official.officialUrl,
    warning:'Ficha oficial do modelo; confira se o anúncio corresponde ao mesmo SKU.'};
 }
 const cat=offer.category||reference?.category||'other';
 const list=new Map();
 const add=(label,value,source)=>{
  const v=value==null?'':String(value).trim();
  if(!v||v==='0')return;
  if(!list.has(label)||list.get(label).source==='cadastro'&&source==='anúncio'){
   list.set(label,{label,value:v,source});
  }
 };
 titleFacts({...offer,category:cat},add);
 referenceFacts({...offer,category:cat},reference,add);
 const reported=list.size;
 const expected=fields[cat]||fields.other;
 // Não apresentar uma característica ausente como se fosse confirmada.
 for(const label of expected){
  if(!list.has(label))list.set(label,{label,value:'A confirmar',source:'pendente'});
 }
 // Pelo menos quatro informações estruturadas em todo anúncio, sem falsificar ficha técnica.
 if(reported===0){
  const title=text(offer.title||offer.modelName);
  if(title)list.set('Produto anunciado',{label:'Produto anunciado',value:title,source:'anúncio'});
 }
 return {
  status:reported?'partial':'pending',facts:[...list.values()],source:'Anúncio e/ou cadastro Raven',
  officialUrl:null,
  warning:'Informações declaradas ou cadastradas, não verificadas pelo fabricante. Confirme o modelo e as características na loja.'
 };
}
export function productFacts(offer={},reference=null){
 return productSpecificationSheet(offer,reference).facts;
}
export function productFactsDescription(facts=[]){
 return facts.filter(f=>f.source!=='pendente')
  .map(f=>f.label+': '+f.value+(f.source==='anúncio'?' (declarado no anúncio)':f.source==='cadastro'?' (cadastro interno)':'')).join(' · ');
}
