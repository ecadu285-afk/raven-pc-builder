import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
let issues=[];
for(const file of readdirSync(root).filter(n=>n.endsWith('.html'))){
 const src=readFileSync(resolve(root,file),'utf8');
 for(const m of src.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/g)){
  const link=m[1];if(/^(?:https?:|mailto:|tel:|#|\/\/|data:|javascript:)/.test(link))continue;
  const base=link.split(/[?#]/)[0];if(!base)continue;
  const target=resolve(root,base);
  if(!target.startsWith(root+'/')&&!target.startsWith(root+'\\')){issues.push(file+': caminho fora do projeto '+link);continue;}
  if(!existsSync(target))issues.push(file+': referência ausente '+link);
 }
}
for(const file of readdirSync(root).filter(n=>n.endsWith('.js')||n.endsWith('.mjs'))){
 try{execFileSync(process.execPath,['--check',resolve(root,file)],{stdio:'pipe'});}catch(e){issues.push(file+': erro sintático '+String(e.stderr).slice(0,300));}
}
console.log(issues.length?issues.join('\n'):'PASS: páginas e scripts analisados');
if(issues.length)process.exitCode=1;
