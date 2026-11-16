/** Raven 7.1 — anúncios publicados adicionais no Montador.
 * Modelos do anúncio não adquirem características "oficiais" por dedução.
 * IDs originais, preços, fotos e links continuam em offers.json.
 */
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const titleOf=o=>String(o.modelName||o.title||'').trim().slice(0,140);
const first=(text,re)=>text.match(re);
const toGb=(n,unit)=>Number(n)*(unit.toUpperCase()==='TB'?1024:1);
export function partFromPublishedOffer(o){
 if(!o||typeof o.partId!=='string'||!o.partId.trim()||!Number.isFinite(o.price)||o.price<=0)return null;
 const title=titleOf(o),upper=title.toUpperCase(),type=String(o.category||'').toLowerCase();
 if(!title||title.length<3)return null;
 const base={id:o.partId,name:title,price:0,desc:'Dados anunciados pelo vendedor · especificações não verificadas',titleDerived:true};
 if(type==='ram'){
  const ddr=first(upper,/\bDDR([345])\b/);
  const amount=first(upper,/\b(\d{1,3})\s*GB\b/);
  if(!ddr||!amount||!/MEM[OÓ]RIA|RAM|UDIMM|SODIMM|DDR/i.test(title))return null;
  // RDIMM/ECC Registered e memória de servidor exigem análise específica.
  if(/\b(?:RDIMM|REGISTERED|SERVER)\b/i.test(upper))return null;
  return {category:'ram',part:{...base,memory:'DDR'+ddr[1],gb:Number(amount[1]),
   desc:'Memória '+amount[1]+' GB '+ddr[0]+' informada no anúncio · confirme UDIMM/SODIMM, módulos e QVL'}};
 }
 if(type==='ssd'||type==='hdd'){
  const size=first(upper,/\b(\d{1,4})\s*(TB|GB)\b/);
  const nvme=/(?:NVME|NVM\.?E)/i.test(title),sata=/\bSATA\b/i.test(title);
  if(!size||(!nvme&&!sata))return null;
  if(type==='ssd'&&!/SSD/i.test(title))return null;
  if(type==='hdd'&&!/\b(?:HD|HDD)\b/i.test(title))return null;
  const declared=toGb(size[1],size[2]);
  return {category:'ssd',part:{...base,storageGb:declared,
   storageInterface:nvme?'nvme':'sata',isHdd:type==='hdd',
   desc:(type==='hdd'?'HD':'SSD')+' '+size[0]+' '+(nvme?'NVMe':'SATA')+' do anúncio · confira formato, interface e slots'}};
 }
 if(type==='psu'){
  const watt=first(upper,/\b(300|350|400|450|500|550|600|650|700|750|800|850|900|1000|1200|1500)\s*W\b/);
  if(!watt||!/\bFONTE\b|\bPSU\b/i.test(title))return null;
  return {category:'psu',part:{...base,watts:Number(watt[1]),
   desc:'Potência '+watt[1]+' W declarada pelo vendedor · valide modelo, conectores e testes independentes'}};
 }
 return null;
}
/**
 * Insere somente referências novas, sem alterar as referências 3D existentes.
 * O anúncio precisa já ter sido filtrado pela política pública e verificação de data.
 */
export function extendBuilderCatalog(catalog,offers,{isRecent=()=>true}={}){
 const added={ram:0,ssd:0,psu:0};
 const known=new Set(Object.values(catalog).flatMap(items=>items.map(p=>p.id)));
 const unique=new Set();
 for(const offer of Array.isArray(offers)?offers:[]){
  if(!isRecent(offer))continue;
  const row=partFromPublishedOffer(offer);
  if(!row||!Object.hasOwn(catalog,row.category)||known.has(row.part.id)||unique.has(row.part.id))continue;
  catalog[row.category].push(row.part);known.add(row.part.id);unique.add(row.part.id);
  added[row.category]++;
 }
 return added;
}
