import {writeFileSync,readFileSync} from 'node:fs';
import {publicOffers} from '../offer-policy.mjs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const url=process.argv[2];
if(!url || !/^https:\/\/[^/]+(?:\/[^?#]*)?$/.test(url)){
 console.error('Uso: node tools/generate-sitemap.mjs https://dominio-oficial.com.br/');process.exit(1);
}
const base=url.replace(/\/?$/,'/');
const routes=['inicio.html','index.html','produtos.html','loja.html','pcs-montados.html','orcamento.html','aprender.html','meu-pc.html','servicos.html','sobre.html','afiliados.html','contato.html','termos.html','privacidade.html','comparar-pcs.html','comparar-ofertas.html','historico.html','assistente.html','verificar-pc.html'];
const escape=x=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const doc=JSON.parse(readFileSync(resolve(root,'offers.json'),'utf8'));
const partIds=[...new Set(publicOffers(doc.offers).filter(o=>!['pc','kit'].includes(o.category)&&/^[a-z0-9][a-z0-9._-]{0,139}$/i.test(o.partId)).map(o=>o.partId))];
const all=[...routes,...partIds.map(id=>'produto.html?produto='+encodeURIComponent(id))];
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+all.map(r=>'  <url><loc>'+escape(new URL(r,base).href)+'</loc></url>').join('\n')+'\n</urlset>\n';
writeFileSync(resolve(root,'sitemap.xml'),xml);
console.log('Sitemap gerado com '+all.length+' URLs públicas para '+base);
