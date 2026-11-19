#!/usr/bin/env node
/** Auditoria de ofertas Raven 9.2. NÃO publica, não modifica offers.json. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {monitorSnapshot} from '../raven92-core.mjs';
import {trustedOfferUrl} from '../offer-policy.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),online=args.includes('--online');
const index=args.indexOf('--report');
const reportPath=index>=0?resolve(args[index+1]||''):null;
const allowed=args.every((s,i)=>s==='--online'||s==='--report'||(i>0&&args[i-1]==='--report'));
if(!allowed||index>=0&&!args[index+1]){console.error('Uso: node tools/monitor-ofertas92.mjs [--online] [--report caminho.json]');process.exit(2)}
async function check(url){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
 try{
  const response=await fetch(url,{method:'HEAD',redirect:'manual',signal:controller.signal,
    headers:{'user-agent':'RavenPCBuilder-LinkAudit/1.0 (manual validation)'}});
  if(response.status===404||response.status===410)return {status:'possível link removido',httpStatus:response.status};
  if(response.status>=200&&response.status<300)return {status:'respondeu HTTP '+response.status+'; anúncio não verificado',httpStatus:response.status};
  return {status:'inconclusivo: bloqueio, redirecionamento ou outro HTTP',httpStatus:response.status};
 }catch(e){return {status:'inconclusivo: timeout, DNS ou bloqueio de automação',error:String(e.name||'network')}}
 finally{clearTimeout(timer);}
}
async function main(){
 const doc=JSON.parse(readFileSync(resolve(root,'offers.json'),'utf8'));
 const snapshot=monitorSnapshot(doc.offers,new Date(),doc.history||[]);
 if(online){
  let count=0;
  for(const row of snapshot.rows){
   if(!row.url||!trustedOfferUrl(row.url,row.store))continue;
   if(++count>110)break;
   // HEAD é um sinal técnico, não confirma modelo, preço, estoque nem autorização da foto.
   Object.assign(row,await check(row.url));
  }
 }
 const report={version:'9.2',createdAt:new Date().toISOString(),online,
  disclaimer:'Verificação técnica de URL não comprova anúncio ativo, preço, estoque ou comissão.',
  totals:{total:snapshot.total,needsAttention:snapshot.needsAttention,withPriceChanges:snapshot.withPriceChanges},
  rows:snapshot.rows};
 if(reportPath){writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log('Relatório salvo em: '+reportPath)}
 console.log('Raven 9.2 · '+snapshot.total+' registros · '+snapshot.needsAttention+' com alertas · '+snapshot.withPriceChanges+' mudanças registradas.');
 if(online){const pending=snapshot.rows.filter(o=>o.status&&o.status.startsWith('inconclusivo')).length;console.log(pending+' respostas HTTP inconclusivas; confira manualmente.');}
 console.log('O catálogo original não foi modificado.');
}
main().catch(e=>{console.error('Erro de auditoria:',e.message);process.exitCode=1});
