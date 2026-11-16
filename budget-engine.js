// RAVEN 6.3 — Planejador por orçamento: utiliza somente anúncios publicados.
// Nunca transforma preço do catálogo ilustrativo em cotação.
import {catalog} from './catalog.js';
import {evaluateCompatibility} from './compatibility.js';

export const BUILD_GROUPS=[
 ['case','Gabinete'],['board','Placa-mãe'],['cpu','Processador'],
 ['ram','Memória RAM'],['ssd','SSD ou HD'],['gpu','Vídeo'],
 ['psu','Fonte de alimentação'],['cooler','Cooler']
];
const BOARD_MANUAL={
 'r37-board-gigabyte-b650m-ds3h':{socket:'AM5',memory:'DDR5',form:'mATX',m2Nvme:true},
 'r37-board-msi-b550m-pro-vdh-wifi':{socket:'AM4',memory:'DDR4',form:'mATX',m2Nvme:true},
 'r37-board-asus-h81m-a':{socket:'LGA1150',memory:'DDR3',form:'mATX',m2Nvme:false},
 'r32-board-placa-mae-b75-lga1155-ddr3':{socket:'LGA1155',memory:'DDR3',form:'mATX',m2Nvme:false},
 'r32-board-gigabyte-ga-b75m-d3h':{socket:'LGA1155',memory:'DDR3',form:'mATX',m2Nvme:false},
 'r32-board-gigabyte-ga-h61m-s2pv':{socket:'LGA1155',memory:'DDR3',form:'mATX',m2Nvme:false}
};
const CATALOG=Object.fromEntries(Object.entries(catalog).map(([type,items])=>[type,new Map(items.filter(p=>!p.conceptual).map(p=>[p.id,p]))]));
const ALL_CATALOG=Object.fromEntries(Object.entries(catalog).map(([type,items])=>[type,items.filter(p=>!p.conceptual)]));
const SORT=(a,b)=>a.offer.price-b.offer.price;
const EXACT=(name)=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
function fitName(type,name){
 if(!name||!['cpu','board','gpu'].includes(type))return null;
 const match=ALL_CATALOG[type].filter(p=>EXACT(p.name)===EXACT(name));
 return match.length===1?match[0]:null;
}
const budgetDays=(value,now)=>{const t=Date.parse(String(value||'')+'T00:00:00Z');return Number.isFinite(t)?Math.floor((now-t)/86400000):Infinity;};
function withSpecs(o,now,maxAge){
 if(!o||!Number.isFinite(o.price)||o.price<=0||!o.url||!o.partId||!o.store)return null;
 const allowed={amazon:['amazon.com.br','amazon.com','amzn.to','link.amazon'],mercadolivre:['mercadolivre.com.br','mercadolivre.com','meli.la'],shopee:['shopee.com.br','shopee.com','shope.ee'],kabum:['kabum.com.br'],terabyte:['terabyteshop.com.br']};
 try{const u=new URL(o.url);if(u.protocol!=='https:'||u.username||u.password||!allowed[o.store]?.some(d=>u.hostname===d||u.hostname.endsWith('.'+d)))return null;}catch{return null}
 const age=budgetDays(o.checkedAt,now);if(age<0||age>maxAge)return null;
 const type=o.category||Object.entries(CATALOG).find(([,map])=>map.has(o.partId))?.[0];
 if(!['cpu','board','ram','ssd','hdd','gpu','psu','case','cooler'].includes(type))return null;
 const productName=o.modelName||o.title||'';if(!productName||!/https:\/\//.test(o.url))return null;
 // Impedir que anúncios de PCs completos vendidos como CPU contaminem o orçamento.
 if(type==='cpu'&&/\b(?:gabinete|pc completo|pc gamer|computador completo)\b/i.test(o.title||'')&&!/\b(?:sem gabinete|somente cpu)\b/i.test(o.title||''))return null;
 let p=CATALOG[type]?.get(o.partId)||fitName(type,productName);
 if(p)p={...p};
 else if(type==='board'&&BOARD_MANUAL[o.partId])p={id:o.partId,name:productName,...BOARD_MANUAL[o.partId]};
 else if(type==='gpu'){
   const sku=(productName.match(/\b(?:RX|GTX|RTX)\s*\d{3,4}(?:\s*(?:SUPER|XT))?\b/i)||[])[0];
   if(!sku)return null;
   const family=sku.toUpperCase().replace(/\s+/g,'');
   // Indicadores ilustrativos por família, NÃO ficha técnica exata do anúncio.
   const specs={
     RX550:[1.0,65],RX560:[1.7,105],RX570:[2.4,185],RX580:[2.6,220],
     RX6500XT:[3.1,150],RX7600:[4.6,210],
     GTX750:[1.1,75],GTX960:[1.9,155],GTX1060:[2.6,170],
     GTX1650:[2.7,120],GTX1660SUPER:[3.5,160],
     RTX2060SUPER:[4.0,220],RTX2060:[3.7,210]
   };
   const approx=specs[family]||[1.5,240];
   p={id:o.partId,name:productName,desc:'Modelo inserido manualmente. Confirme dimensões, consumo e conectores no fabricante.',tier:approx[0],power:approx[1],estimatedPower:true};
 }else if(type==='ram'){
   const memory=(productName.match(/\bDDR[345]\b/i)||[])[0]?.toUpperCase();
   const gb=Number((productName.match(/\b(4|8|16|32|64)\s*GB\b/i)||[])[1]);
   if(!memory||!gb||/\bRDIMM|REGISTERED|SERVER\b/i.test(productName))return null;
   p={id:o.partId,name:productName,memory,gb};
 }else if(type==='ssd'||type==='hdd'){
   const kind=/\bNVME\b/i.test(productName)?'nvme':/\bSATA\b/i.test(productName)?'sata':null;
   if(!kind)return null;
   p={id:o.partId,name:productName,desc:kind==='nvme'?'M.2 NVMe':'SATA',storageInterface:kind};
 }else if(type==='psu'){
   const watts=Number((String(o.title||productName).match(/\b(300|350|400|450|500|550|600|650|700|750|800|850|1000)\s*W\b/i)||[])[1]);
   if(!watts)return null;
   p={id:o.partId,name:o.title||productName,watts};
 }else if(type==='case'&&/\b(?:micro[-\s]?ATX|mATX)\b/i.test(o.title||productName)){
   p={id:o.partId,name:o.title||productName,form:'mATX'};
 }else return null;
 // Specs from the real reference, NOT from catalog.price.
 const value={...p,price:o.price};
 const kind=type==='hdd'?'ssd':type;
 const realOffer={...o,category:kind,modelName:productName};
 return {type:kind,originalType:type,part:value,offer:realOffer,canUse3D:!!CATALOG[type]?.has(p.id)};
}
function trimList(list,limit=6){const seen=new Set();return list.sort(SORT).filter(x=>{const key=[x.part.id,x.offer.condition||'new',x.offer.store].join('|');if(seen.has(key))return false;seen.add(key);return true;}).slice(0,limit)}
export function availableForBudget(offers,{now=Date.now(),maxAgeDays=14}={}){
 const pool=Object.fromEntries(BUILD_GROUPS.map(([key])=>[key,[]]));
 for(const o of Array.isArray(offers)?offers:[]){const item=withSpecs(o,now,maxAgeDays);if(item)pool[item.type].push(item)}
 for(const [k,v] of Object.entries(pool))pool[k]=trimList(v,k==='cpu'?35:k==='board'?24:k==='gpu'?12:k==='ssd'?10:k==='case'?4:k==='psu'?5:k==='ram'?8:4);
 return pool;
}
function isKnownModernBoard(board,cpu){
 if(board.socket!==cpu.socket)return false;
 const n=String(board.name||'').toUpperCase();
 // AMD Ryzen 3200G/3400G não suportados por placas A520 e B550 modernas em geral.
 if(/\b(3200G|3400G)\b/i.test(cpu.name)&&/(?:^|\W)(?:A520|B550)[A-Z0-9-]*/i.test(n))return false;
 return true;
}
function profileScore(parts,purpose){
 const cpu=parts.cpu,gpu=parts.gpu,ram=parts.ram,storage=parts.ssd;
 const cpuScore=Number(cpu?.tier)||1;
 const gpuScore=Number(gpu?.tier)||(gpu?.id==='igpu'?0.8:1);
 const bonus=(ram?.gb>=16?5:ram?.gb>=8?3:0)+(/\bSSD\b/i.test(storage?.name||'')?5:0);
 if(purpose==='games'){
  // Ranking relativo de componentes cadastrados; NÃO estimativa de FPS ou benchmark.
  return Math.min(cpuScore,gpuScore)*37+gpuScore*14+Math.min(cpuScore,3)*5+bonus-Math.max(0,cpuScore-gpuScore-1.2)*14;
 }
 if(purpose==='creative'){
  return Math.min(cpuScore,6)*28+Math.min(gpuScore,5)*11+(ram?.gb>=32?20:ram?.gb>=16?10:0)+bonus;
 }
 if(purpose==='upgrade'){
  const modern=/^(AM5|LGA1700|LGA1851)$/.test(cpu?.socket||'')?22:0;
  return modern+Math.min(cpuScore,5)*21+Math.min(gpuScore,3)*10+bonus+(ram?.gb>=16?6:0);
 }
 if(purpose==='economy')return Math.min(cpuScore,3)*17+Math.min(gpuScore,2)*8+bonus+(cpu?.igpu?12:0);
 return Math.min(cpuScore,4)*18+Math.min(gpuScore,2)*8+bonus+(cpu?.igpu?3:0);
}
const partsPrices=selection=>Object.values(selection).reduce((sum,x)=>sum+(x?.offer?.price||0),0);
function validBudgetParts(parts){
 const result=evaluateCompatibility(parts);
 if(parts.gpu?.estimatedPower)result.unknown.push('GPU adicionada manualmente: potência usada é uma aproximação conservadora; confirme consumo, conectores e dimensões no anúncio e no fabricante.');
 return {valid:result.errors.length===0,errors:result.errors,unknown:result.unknown,warnings:result.warnings,details:result};
}
function selectedVersion(pool,{budget=1000,brand='all',purpose='general',storage='any'}={}){
 const cpus=pool.cpu.filter(x=>brand==='all'||(brand==='intel'?/^Intel\b/i:/^AMD\b/i).test(x.part.name));
 const cases=pool.case.slice(0,3),psus=pool.psu.slice(0,4);
 const ramBy=(type)=>pool.ram.filter(x=>x.part.memory===type).slice(0,4);
 const drivePool=pool.ssd.filter(x=>storage!=='ssd'||x.originalType==='ssd').slice(0,8);
 const dedicated=pool.gpu.slice(0,9);
 const coolerPool=pool.cooler;
 let bestWithin=null,bestOutside=null,completeWithin=null,completeOutside=null;
 const choose=(candidate)=>{
   const cost=partsPrices(candidate.selected),complete=!!candidate.selected.cooler || candidate.coolerIncluded;
   const {valid,unknown,warnings}=validBudgetParts(candidate.parts);
   if(!valid)return;
   const score=profileScore(candidate.parts,purpose)+(complete?8:0)-Math.max(0,warnings.length-1)*0.2-(purpose==='economy'?cost/40:0);
   const record={...candidate,cost,complete,score,unknown,warnings,
     missing:complete?[]:['Cooler sem anúncio confirmado — não está incluído no subtotal']};
   const within=cost<=budget;
   if(within){
     if(!bestWithin||score>bestWithin.score||(score===bestWithin.score&&cost<bestWithin.cost))bestWithin=record;
     if(complete&&(!completeWithin||score>completeWithin.score||(score===completeWithin.score&&cost<completeWithin.cost)))completeWithin=record;
   }else{
     if(!bestOutside||cost<bestOutside.cost||(cost===bestOutside.cost&&score>bestOutside.score))bestOutside=record;
     if(complete&&(!completeOutside||cost<completeOutside.cost||(cost===completeOutside.cost&&score>completeOutside.score)))completeOutside=record;
   }
 };
 for(const c of cpus){
  for(const b of pool.board){
   if(!isKnownModernBoard(b.part,c.part))continue;
   const rs=ramBy(b.part.memory);
   for(const ram of rs)for(const drive of drivePool){
    if(/\bNVMe\b/i.test(drive.part.name)&&b.part.m2Nvme!==true)continue;
    for(const box of cases){
     const ranks={ITX:1,mATX:2,ATX:3};
     if(ranks[b.part.form]&&ranks[box.part.form]&&ranks[b.part.form]>ranks[box.part.form])continue;
     const integrated=c.part.igpu===true?[{part:{...catalog.gpu.find(x=>x.id==='igpu')},offer:null,integrated:true}]:[];
     const graphics=[...integrated,...dedicated];
     for(const gpu of graphics){
      for(const psu of psus){
       const watt=Number(c.part.watts||95)+(gpu.integrated?0:Number(gpu.part.power||200))+110;
       if(psu.part.watts<Math.ceil(watt*1.4/50)*50)continue;
       const coolerIncluded=/\bcom\s+cooler\b/i.test(c.offer.title||'');
       const coolerOptions=coolerIncluded?[null]:coolerPool.length?coolerPool.slice(0,2):[null];
       for(const cooler of coolerOptions){
        const selected={case:box,board:b,cpu:c,ram,ssd:drive,gpu:gpu.integrated?null:gpu,psu,cooler};
        const parts={case:box.part,board:b.part,cpu:c.part,ram:ram.part,ssd:drive.part,gpu:gpu.part,psu:psu.part,cooler:cooler?.part||null};
        if(coolerIncluded)parts.cooler={id:'cooler-incluso',name:'Cooler declarado no anúncio da CPU',sockets:[c.part.socket]};
        choose({selected,parts,coolerIncluded});
       }
      }
     }
    }
   }
  }
 }
 return {within:bestWithin,minimum:bestOutside,completeWithin,completeOutside};
}
export function recommendBudget(offers,{budget=1000,brand='all',purpose='general',storage='any',now=Date.now(),maxAgeDays=14}={}){
 const limit=Math.max(0,Number(budget)||0),pool=availableForBudget(offers,{now,maxAgeDays});
 const searched=selectedVersion(pool,{budget:limit,brand,purpose,storage});
 const chosen=searched.completeWithin||searched.within||searched.completeOutside||searched.minimum;
 const lacking=BUILD_GROUPS.filter(([key])=>!pool[key].length).map(([,name])=>name);
 if(!pool.cpu.some(x=>brand==='all'||(brand==='intel'?/^Intel\b/i:/^AMD\b/i).test(x.part.name)))lacking.push('Processador da marca selecionada');
 return {budget:limit,brand,purpose,storage,chosen,withinBudget:!!chosen&&chosen.cost<=limit,completeQuote:!!chosen?.complete,minimumCompleteCost:searched.completeOutside?.cost||null,missingTypes:lacking,
   pricesAreLive:false,availableCounts:Object.fromEntries(Object.entries(pool).map(([key,val])=>[key,val.length]))};
}
