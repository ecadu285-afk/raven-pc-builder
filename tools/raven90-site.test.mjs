import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';import {resolve,dirname,join} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const get=p=>readFileSync(join(root,p),'utf8');
const main=['inicio.html','index.html','produtos.html','orcamento.html','historico.html','assistente.html','comparar-pcs.html','contato.html'];
for(const p of main){
 const html=get(p);
 assert.ok(html.includes('<link rel="canonical" href="https://ecadu285-afk.github.io/raven-pc-builder/'+p+'">'),p+' sem canonical');
 assert.ok(html.includes('raven90-ui.css?v=1'),p+' sem CSS Raven');
 assert.ok(html.includes('raven90-ui.js?v=1'),p+' sem script mobile');
}
const map=get('sitemap.xml');
for(const p of main)assert.ok(map.includes('/'+p+'</loc>'),p+' não entrou no sitemap');
assert.ok(!map.includes('minha-conta.html'), 'A página de conta não deve ser indexada no sitemap');
assert.ok(get('minha-conta.html').includes('content="noindex,follow"'));
assert.ok(get('robots.txt').includes('Sitemap: https://ecadu285-afk.github.io/raven-pc-builder/sitemap.xml'));
const html=get('index.html');
assert.ok(html.includes('raven90-builder-links.mjs?v=1'));
for(const file of ['raven90-quality.mjs','raven90-chart.mjs','raven90-sync.mjs','raven90-builder-links.mjs','raven90-ui.css','raven90-ui.js'])assert.ok(existsSync(join(root,file)));
console.log('PASS: Raven 8–9 HTML, SEO e dependências (21+ verificações)');
