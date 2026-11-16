/** Execução local futura: node tools/raven90-sync-report.mjs caminho/robo.json
 * Só compara arquivos, nunca publica.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';import {fileURLToPath} from 'node:url';
import {compareSiteBot} from '../raven90-sync.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
if(!process.argv[2]){console.error('Uso: node tools/raven90-sync-report.mjs exportacao-bot.json');process.exit(2)}
try{
 const bot=JSON.parse(readFileSync(resolve(process.argv[2]),'utf8'));
 const site=JSON.parse(readFileSync(join(root,'offers.json'),'utf8'));
 const report=compareSiteBot(site,bot);
 writeFileSync(join(root,'raven90-relatorio-sincronizacao.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({site:report.siteCount,bot:report.botCount,...report.statuses},null,2));
 console.log('Relatório local salvo. Não comprova disponibilidade no navegador; não publica ofertas.');
}catch(e){console.error(e.message);process.exitCode=1}
