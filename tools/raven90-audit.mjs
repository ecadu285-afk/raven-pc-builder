/** Executar localmente: node tools/raven90-audit.mjs
 * Não pesquisa ou publica produtos nem adivinha fotos.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';import {resolve,dirname,join} from 'node:path';
import {offerQuality} from '../raven90-quality.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv[2]||join(root,'offers.json');
const data=JSON.parse(readFileSync(resolve(input),'utf8')),rows=Array.isArray(data.offers)?data.offers:[];
const r=rows.map(o=>{const q=offerQuality(o);return {partId:o.partId||'',store:o.store||'',title:o.title||'',price:o.price||0,
 checkedAt:o.checkedAt||'',imageUrl:o.imageUrl||'',reviewStatus:o.reviewStatus||'',score:q.score,state:q.state,
 reason:q.reasons.join(' | '),imageAction:q.needsPhoto?'Obter foto do modelo exato com autorização':'Conferir correspondência de foto'}});
const csvEscape=x=>'"'+String(x??'').replace(/"/g,'""').replace(/\r?\n/g,' ')+'"';
const keys=Object.keys(r[0]||{partId:0});
const csv=[keys.join(';'),...r.map(o=>keys.map(k=>csvEscape(o[k])).join(';'))].join('\n')+'\n';
const report={generatedAt:new Date().toISOString(),total:r.length,withoutPhoto:r.filter(x=>!x.imageUrl).length,
needsReview:r.filter(x=>x.state!=='dados-cadastrados').length,rows:r,disclaimer:'Pontuação de dados, não selo de validade de produto ou preço'};
writeFileSync(join(root,'raven90-revisao-fotos.csv'),'\ufeff'+csv);
writeFileSync(join(root,'raven90-relatorio-qualidade.json'),JSON.stringify(report,null,2)+'\n');
console.log('RAVEN: '+r.length+' ofertas; '+report.withoutPhoto+' sem foto. CSV e relatório gerados localmente, sem publicação.');
