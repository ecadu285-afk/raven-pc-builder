#!/usr/bin/env node
/** Raven 9.1 — sincronização LOCAL por prévia, nunca publicação automática.
 * node tools/sync-market-bot.mjs --input export.json [--current offers.json] [--out offers.revisao.json]
 * node tools/sync-market-bot.mjs --endpoint http://localhost:4317/api/raven65/export
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {stageBotOffers} from '../offer-import65.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function argsOf(argv){
 const args={};
 for(let i=0;i<argv.length;i++){
  const part=argv[i];if(!part.startsWith('--'))throw Error('Argumento desconhecido: '+part);
  const [name,inline]=part.slice(2).split('=',2);
  if(!['input','endpoint','current','out','report'].includes(name))throw Error('Opção não permitida: --'+name);
  args[name]=inline??argv[++i];
  if(!args[name]||args[name].startsWith('--'))throw Error('Informe um valor para --'+name);
 }
 if(Boolean(args.input)===Boolean(args.endpoint))throw Error('Use exatamente uma fonte: --input ou --endpoint');
 return args;
}
async function readBotData(args){
 if(args.input){
  const data=readFileSync(resolve(args.input),'utf8');
  if(data.length>5000000)throw Error('Exportação excede 5 MB');
  return JSON.parse(data);
 }
 const url=new URL(args.endpoint);
 if(url.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.username||url.password)
  throw Error('O endpoint precisa ser HTTP e estar neste computador (localhost/127.0.0.1).');
 if(url.port!=='4317')throw Error('A porta esperada do Market Bot é 4317.');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch(url,{signal:controller.signal,headers:{accept:'application/json'},redirect:'error'});
  if(!response.ok)throw Error('O Market Bot respondeu HTTP '+response.status);
  const body=await response.text();
  if(body.length>5000000)throw Error('Exportação excede 5 MB');
  return JSON.parse(body);
 }finally{clearTimeout(timeout)}
}
async function main(){
 const args=argsOf(process.argv.slice(2));
 const currentPath=resolve(args.current||resolve(root,'offers.json'));
 const outputPath=resolve(args.out||resolve(root,'offers.revisao.json'));
 const reportPath=resolve(args.report||resolve(root,'relatorio-sync-bot.json'));
 if(outputPath===currentPath)throw Error('Saída não pode sobrescrever o catálogo publicado.');
 const current=JSON.parse(readFileSync(currentPath,'utf8'));
 if(!Array.isArray(current.offers))throw Error('Catálogo atual inválido.');
 const bot=await readBotData(args);
 const result=stageBotOffers(current,bot);
 writeFileSync(outputPath,JSON.stringify(result.document,null,2)+'\n','utf8');
 const report={generatedAt:new Date().toISOString(),source:args.input?'arquivo local':'Market Bot local',
  totalBefore:current.offers.length,totalAfter:result.document.offers.length,
  inserted:result.inserted,updated:result.updated,unchanged:result.unchanged,rejected:result.rejected,
  changes:result.changes,notices:result.notices,
  publication:'NÃO PUBLICADO: importe a prévia no revisor, confira e aprove antes de substituir offers.json no GitHub'};
 writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n','utf8');
 console.log('RAVEN 9.1 | novos: '+result.inserted+' | alterados: '+result.updated+
   ' | iguais: '+result.unchanged+' | rejeitados: '+result.rejected);
 console.log('Prévia: '+outputPath+'\nRelatório: '+reportPath);
 console.log(report.publication);
}
main().catch(e=>{console.error('Sincronização não concluída: '+e.message);process.exitCode=1});
