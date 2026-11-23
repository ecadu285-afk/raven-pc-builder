/** Raven PC Builder — especificações verificadas em fontes oficiais.
 * A correspondência por modelo é automática para anúncios existentes e futuros.
 * Modelos não cadastrados aqui não recebem dados inventados.
 */
export const verifiedModels = Object.freeze({
  "intel-core-i3-3220": {
    name:"Intel Core i3-3220",category:"cpu",socket:"LGA1155",memory:"DDR3",watts:55,
    fields:[["Fabricante","Intel"],["Geração","3ª geração"],["Núcleos","2"],["Threads","4"],["Frequência base","3,30 GHz"],["Socket","LGA1155"],["TDP","55 W"],["Gráficos integrados","Intel HD Graphics 2500"]],
    officialUrl:"https://www.intel.com.br/content/www/br/pt/products/sku/65693/intel-core-i33220-processor-3m-cache-3-30-ghz/specifications.html",
    checkedAt:"2026-11-22"
  },
  "intel-core-i3-3250": {
    name:"Intel Core i3-3250",category:"cpu",socket:"LGA1155",memory:"DDR3",watts:55,
    fields:[["Fabricante","Intel"],["Geração","3ª geração"],["Núcleos","2"],["Threads","4"],["Frequência base","3,50 GHz"],["Socket","LGA1155"],["TDP","55 W"],["Gráficos integrados","Intel HD Graphics 2500"]],
    officialUrl:"https://www.intel.com.br/content/www/br/pt/products/sku/74744/intel-core-i33250-processor-3m-cache-3-50-ghz/specifications.html",
    checkedAt:"2026-11-22"
  },
  "intel-core-i3-7100": {
    name:"Intel Core i3-7100",category:"cpu",socket:"LGA1151",memory:null,watts:51,
    fields:[["Fabricante","Intel"],["Geração","7ª geração"],["Núcleos","2"],["Threads","4"],["Frequência base","3,90 GHz"],["Socket","LGA1151"],["TDP","51 W"],["Gráficos integrados","Intel HD Graphics 630"]],
    officialUrl:"https://www.intel.com.br/content/www/br/pt/products/sku/97455/intel-core-i37100-processor-3m-cache-3-90-ghz/specifications.html",
    checkedAt:"2026-11-22"
  },
  "amd-ryzen-5-5500": {
    name:"AMD Ryzen 5 5500",category:"cpu",socket:"AM4",memory:"DDR4",watts:65,
    fields:[["Fabricante","AMD"],["Núcleos","6"],["Threads","12"],["Frequência base","3,60 GHz"],["Socket","AM4"],["TDP","65 W"]],
    officialUrl:"https://www.amd.com/pt/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5500.html",
    checkedAt:"2026-11-22"
  }
});
const latin=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const tokens=x=>latin(x).match(/\b(?:intel\s+core\s+)?i[3579]\s*[- ]\s*\d{4,5}[a-z]{0,2}\b|\b(?:amd\s+)?ryzen\s+[3579]\s+\d{4,5}[a-z0-9]*\b/g)||[];
function keyOf(token){
 const m=token.match(/\bi([3579])\s*[- ]\s*(\d{4,5}[a-z]{0,2})\b/);
 if(m)return 'intel-core-i'+m[1]+'-'+m[2];
 const a=token.match(/ryzen\s+([3579])\s+(\d{4,5}[a-z0-9]*)/);
 return a?'amd-ryzen-'+a[1]+'-'+a[2]:null;
}
export function verifiedSpecFor(offer={}){
 if(offer?.category!=='cpu')return null;
 const title=latin(offer.title||'');
 if(/\b(pc gamer|computador completo|kit upgrade|kit processador|placa mae|motherboard)\b/.test(title))return null;
 const ids=new Set([...(tokens(offer.modelName)),...(tokens(offer.title))].map(keyOf).filter(Boolean));
 if(ids.size!==1)return null;
 const entry=verifiedModels[[...ids][0]];
 return entry?{...entry,source:'ficha oficial do fabricante',facts:entry.fields.map(([label,value])=>({label,value,source:'fabricante'}))}:null;
}
