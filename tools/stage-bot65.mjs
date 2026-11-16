/** Importação local do Market Bot. Não publica no site e não usa credenciais.
 * node tools/stage-bot65.mjs exportacao.json [offers.json]
 */
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stageBotOffers} from '../offer-import65.mjs';
import {qualityReport} from '../offer-policy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=process.argv[2];
if(!file||file.startsWith('-')){console.error('Uso: node tools/stage-bot65.mjs exportacao.json [offers.json]');process.exit(2)}
try{
 const original=JSON.parse(readFileSync(path.resolve(process.argv[3]||path.join(root,'offers.json')),'utf8'));
 const fromBot=JSON.parse(readFileSync(path.resolve(file),'utf8'));
 const staged=stageBotOffers(original,fromBot);
 const target=path.join(root,'offers-para-revisao.json');
 writeFileSync(target,JSON.stringify(staged.document,null,2)+'\n');
 const q=qualityReport(staged.document.offers);
 console.log(JSON.stringify({arquivo:target,novas:staged.inserted,alteradas:staged.updated,iguais:staged.unchanged,rejeitadas:staged.rejected,visiveis:q.published,bloqueadas:q.blocked,avisos:staged.notices},null,2));
 console.log('Nenhuma oferta foi publicada; importe o arquivo de revisão no painel local.');
}catch(error){console.error(error.message);process.exitCode=1}
