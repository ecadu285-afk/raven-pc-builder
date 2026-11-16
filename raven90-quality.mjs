/** Raven 8.0/9.0: priorização transparente. Pontuação NÃO é selo de verificação oficial. */
import {auditOffer,offerAgeDays} from './offer-policy.mjs';
const normalize=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const generic=/^(?:ssd|hd|hdd|memoria ram|memória ram|fonte atx|placa mae|placa-mãe)\s+(?:sata|nvme|ddr[345]|\d+(?:gb|tb)|\d+\s?(?:gb|tb)|\d+\s?w|m\.2)/i;
const brands=/(?:\b(?:amd|ryzen|intel|core|nvidia|geforce|radeon|msi|asus|gigabyte|asrock|kingston|crucial|wd|western digital|samsung|corsair|xpg|aigo|tgt|bluecase|t-force|teamgroup|pny|adata|seagate|sandisk|patriot|lexar|hiksemi|deepcool|cooler master)\b)/i;
export function offerQuality(offer, now=new Date()){
 const audit=auditOffer(offer,now),reasons=[...audit.errors,...audit.warnings];
 const title=String(offer?.title||offer?.modelName||'').trim();
 const category=String(offer?.category||'').trim(),model=String(offer?.modelName||title).trim();
 const age=offerAgeDays(offer?.checkedAt,now);
 let score=100;
 if(!audit.displayable)score-=50;
 if(!offer?.imageUrl){score-=18;reasons.push('Sem foto específica cadastrada')}
 if(!category){score-=16;reasons.push('Categoria a conferir')}
 if(!offer?.modelName){score-=10;reasons.push('Modelo completo não informado')}
 if(!title||generic.test(normalize(title))||(!brands.test(normalize(title))&&['ssd','hdd','ram','psu','board'].includes(category))){
   score-=22;reasons.push('Marca e referência exata precisam de confirmação');
 }
 if(age>14){score-=16;reasons.push('Preço com mais de 14 dias')}
 if(age<0||!Number.isFinite(age)){score-=16;reasons.push('Data da consulta inválida')}
 if(offer?.affiliate===true&&offer?.affiliateStatus!=='confirmed'){score-=3;reasons.push('Comissão não comprovada')}
 const unverified=offer?.condition==='new'&&/i[357]-[234567]\d{3}|h61|h81|b75|gtx\s?(?:750|960)|rx\s?(?:550|570|580)/i.test(title);
 if(unverified){score-=7;reasons.push('Conferir se peça antiga é realmente nova')}
 const unique=[...new Set(reasons)];
 return {score:Math.max(0,Math.min(100,score)),state:!audit.displayable?'suspensa':score<58?'revisar':'dados-cadastrados',
  reasons:unique,needsPhoto:!offer?.imageUrl,needsModel:generic.test(normalize(title))||!offer?.modelName,
  recent:age>=0&&age<=14,ageDays:age,canDisplay:audit.displayable,
  disclaimer:'Pontuação de completude dos dados cadastrados, não valida preço, vendedor, modelo ou comissão.'};
}
export function rankFeaturedGroups(groups,now=new Date()){
 if(!Array.isArray(groups))return [];
 const priorities=['gpu','cpu','board','ram','ssd','psu','case','hdd'];
 const ranked=groups.filter(g=>g?.best).map(g=>{
  const q=offerQuality(g.best,now);
  const isBrand=brands.test(normalize(g.best.title||g.best.modelName));
  const extra=(q.recent?25:0)+(q.needsPhoto?0:12)+(isBrand?12:0)+
    (Array.isArray(g.primary)&&g.primary.length>1?6:0);
  return {g,rank:q.score+extra};
 }).sort((a,b)=>b.rank-a.rank||a.g.best.price-b.g.best.price);
 const chosen=[];
 for(const category of priorities){
  const first=ranked.find(x=>x.g.type===category&&!chosen.includes(x.g));
  if(first)chosen.push(first.g);
 }
 for(const item of ranked)if(chosen.length<8&&!chosen.includes(item.g))chosen.push(item.g);
 return chosen.slice(0,8);
}
