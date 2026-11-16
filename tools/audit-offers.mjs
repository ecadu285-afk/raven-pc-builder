import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {qualityReport} from '../offer-policy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=process.argv.find(a=>a.endsWith('.json'))||path.join(root,'offers.json');
const data=JSON.parse(readFileSync(file,'utf8'));
const report=qualityReport(data.offers);
console.log('RAVEN auditou '+report.total+' ofertas. Visíveis: '+report.published+'; bloqueadas: '+report.blocked+'; sem foto: '+report.withoutImage+'; afiliado não confirmado: '+report.affiliatePending+'.');
for(const issue of report.issues){
  if(issue.errors.length)console.log('BLOQUEADA ['+issue.index+'] '+issue.partId+' — '+issue.errors.join('; '));
}
if(process.argv.includes('--report')){
  const out=path.join(root,'relatorio-ofertas.json');writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log('Relatório em',out);
}
if(process.argv.includes('--strict')){
  const failed=report.issues.filter(i=>i.errors.length && !['hold','pending','rejected'].includes(data.offers[i.index]?.reviewStatus));
  if(failed.length){console.error(failed.length+' anúncio(s) com erro grave sem bloqueio explícito.');process.exitCode=1;}
}
