import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const url=process.argv[2];
if(!url || !/^https:\/\/[^/]+(?:\/[^?#]*)?$/.test(url)){
 console.error('Uso: node tools/generate-sitemap.mjs https://dominio-oficial.com.br/');process.exit(1);
}
const base=url.replace(/\/?$/,'/');
const routes=['inicio.html','index.html','produtos.html','loja.html','pcs-montados.html','orcamento.html','aprender.html','meu-pc.html','servicos.html','sobre.html','afiliados.html','contato.html','termos.html','privacidade.html','comparar-pcs.html','historico.html','assistente.html'];
const escape=x=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+routes.map(r=>'  <url><loc>'+escape(new URL(r,base).href)+'</loc></url>').join('\n')+'\n</urlset>\n';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
writeFileSync(resolve(root,'sitemap.xml'),xml);
console.log('Sitemap gerado com '+routes.length+' páginas para '+base);
