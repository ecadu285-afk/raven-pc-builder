import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const src=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
for(const page of ['produto.html','verificar-pc.html','produtos.html','assistente.html','inicio.html',
 'tools/central-imagens92.html','tools/painel-comercial92.html']){
 const html=src(page);
 assert.match(html,/<meta name="viewport"/,page+' mobile');
 assert.match(html,/<main/,page+' sem conteúdo principal');
 assert.ok(!html.includes('rel="noopener" target="_blank"'),page+' links externos devem ser seguros');
}
for(const page of ['assistente.html','tools/central-imagens92.html','tools/painel-comercial92.html']){
 const html=src(page);
 for(const m of html.matchAll(/<script\s+type="module"[^>]*>([\s\S]*?)<\/script>/g)){
  const r=spawnSync(process.execPath,['--check','--input-type=module'],{input:m[1],encoding:'utf8'});
  assert.equal(r.status,0,page+' JavaScript inline inválido: '+r.stderr);
 }
}
assert.match(src('raven92.css'),/@media\(max-width:650px\)/);
assert.match(src('storefront-shop.js'),/hydrateCatalogUI\(all,known\)/);
assert.ok(!src('raven92-catalog-ui.js').includes("fetch('./offers.json'"),'Não fazer segundo fetch para sugestões');
assert.match(src('produtos.html'),/catalog-socket/);
assert.match(src('produtos.html'),/catalog-memory/);
assert.match(src('produtos.html'),/catalog-capacity/);
assert.match(src('sitemap.xml'),/comparar-ofertas.html/);
assert.match(src('sitemap.xml'),/verificar-pc.html/);
assert.match(src('sitemap.xml'),/produto.html\?produto=/);
console.log('PASS: Raven 9.2 — sintaxe inline, navegação, busca compartilhada, sitemap e responsividade');
