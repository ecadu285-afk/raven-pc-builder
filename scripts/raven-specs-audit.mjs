/** Raven PC Builder — auditoria local de cobertura das fichas técnicas.
 * Uso: node scripts/raven-specs-audit.mjs offers.json
 * Não altera preços, ofertas, IDs nem o status de publicação.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifiedSpecFor} from '../raven-specs-verified.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=path.resolve(root,process.argv[2]||'offers.json');
const output=path.resolve(root,'raven-specs-review.json');
let data;
try{data=JSON.parse(fs.readFileSync(input,'utf8'));}catch(error){
 console.error('Não foi possível ler o arquivo de ofertas:',error.message);
 process.exitCode=1;
 process.exit();
}
const offers=Array.isArray(data)?data:data?.offers;
if(!Array.isArray(offers)){
 console.error('O arquivo precisa conter uma lista de ofertas ou uma propriedade offers.');
 process.exitCode=1;
 process.exit();
}
const seen=new Map();
for(const offer of offers){
 if(!offer||typeof offer!=='object')continue;
 const model=String(offer.modelName||offer.title||'Não identificado').trim();
 const groupKey=[offer.category||'other',model.toLowerCase()].join('|');
 const verified=verifiedSpecFor(offer);
 if(!seen.has(groupKey))seen.set(groupKey,{
  categoria:offer.category||'other',modelo:model,exemploId:String(offer.partId||''),
  status:verified?'ficha-oficial-cadastrada':'precisa-revisao',
  fonteOficial:verified?.officialUrl||null,ocorrencias:0
 });
 const entry=seen.get(groupKey);
 entry.ocorrencias++;
 if(verified){entry.status='ficha-oficial-cadastrada';entry.fonteOficial=verified.officialUrl;}
}
const models=[...seen.values()].sort((a,b)=>
  Number(a.status==='ficha-oficial-cadastrada')-Number(b.status==='ficha-oficial-cadastrada')||
  a.categoria.localeCompare(b.categoria)||a.modelo.localeCompare(b.modelo,'pt-BR')
);
const cpuModels=models.filter(m=>m.categoria==='cpu');
const result={versao:1,geradoEm:new Date().toISOString(),arquivo:path.basename(input),
 ofertas:offers.length,modelos:models.length,
 modelosCpu:cpuModels.length,cpuVerificados:cpuModels.filter(x=>x.status==='ficha-oficial-cadastrada').length,
 pendencias:models.filter(x=>x.status==='precisa-revisao').length,
 observacao:'Registros não verificados NÃO são enriquecidos com dados inferidos. Cada modelo requer fonte oficial, conferência e inclusão na base raven-specs-verified.mjs.',
 modelos:models
};
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n','utf8');
console.log('Raven: '+offers.length+' ofertas, '+models.length+' modelos, '+result.cpuVerificados+'/'+result.modelosCpu+' modelos de CPU com ficha oficial; '+result.pendencias+' modelos sem verificação.\nRelatório: '+output);
