import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalog} from '../catalog.js';
import {evaluateCompatibility} from '../compatibility.js';
import {filterCatalogOffers} from '../catalog-filters.mjs';
import {publicOffers} from '../offer-policy.mjs';
import {catalogAnswer} from '../raven92-assistant.mjs';
import {searchTokens,modelFingerprint,identityAudit,specifications,matchedSpecifications,
 smartSearchScore,rankCatalogSearch,monitorSnapshot,productCollectionKey} from '../raven92-core.mjs';
const now=new Date('2026-11-19T12:00:00Z');
const a={partId:'5500',category:'cpu',store:'shopee',condition:'new',modelName:'AMD Ryzen 5 5500',
 title:'Processador AMD Ryzen 5 5500',price:500,checkedAt:'2026-11-19',url:'https://shopee.com.br/p/123'};
const b={...a,partId:'5700x',title:'AMD Ryzen 7 5700X',modelName:'AMD Ryzen 7 5700X',price:700,
 url:'https://shopee.com.br/p/456'};
const bad={...a,category:'gpu',title:'Processador AMD Ryzen 5 5500'};
const known=new Map([['5500',{id:'5500',name:'AMD Ryzen 5 5500',category:'cpu',socket:'AM4',watts:65}]]);
assert.ok(searchTokens('Ryzen 5 5500').includes('ryzen'));
assert.equal(modelFingerprint(a).model,'ryzen55500');
assert.equal(identityAudit(a,known.get('5500')).reasons.length,0);
assert.ok(identityAudit({...a,modelName:'AMD Ryzen 5 5600',title:'AMD Ryzen 5 5600'},known.get('5500')).reasons.length);
assert.ok(identityAudit(bad,known.get('5500')).reasons.length);
assert.equal(specifications(a,known.get('5500')).socket,'AM4');
assert.equal(matchedSpecifications(a,{socket:'AM4'},known.get('5500')),true);
assert.equal(matchedSpecifications(a,{socket:'AM5'},known.get('5500')),false);
assert.ok(smartSearchScore(a,'Ryzen 5 5500',known.get('5500'))>0);
assert.equal(smartSearchScore(a,'RTX 4090',known.get('5500')),0);
assert.equal(rankCatalogSearch([b,a],'Ryzen 5 5500',known)[0].partId,'5500');
const filtered=filterCatalogOffers([a,b],{search:'Ryzen 5 5500',socket:'AM4'},{
  searchScore:(o,q)=>smartSearchScore(o,q,known.get(o.partId)),
  matchesSpecifications:(o,f)=>matchedSpecifications(o,f,known.get(o.partId))
});
assert.equal(filtered.length,1);
assert.equal(filterCatalogOffers([a,b],{socket:'AM5'},{matchesSpecifications:(o,f)=>matchedSpecifications(o,f,known.get(o.partId))}).length,0);
const snapshot=monitorSnapshot([a,{...b,checkedAt:'2026-10-01'}],now,[{
 partId:'5500',store:'shopee',checkedAt:'2026-11-12',price:600
}]);
assert.equal(snapshot.total,2);
assert.ok(snapshot.needsAttention>=1);
assert.equal(snapshot.rows[0].priceChange,-100);
assert.equal(snapshot.rows[0].linkStatus,'não consultado pela análise estática');
assert.equal(productCollectionKey(a,known.get('5500')),'cpu|new|amd ryzen 5 5500|');
const reply=catalogAnswer('Ryzen 5 5500',[a,b],known);
assert.equal(reply.items.length,1);
assert.equal(reply.items[0].offer.partId,'5500');
const incomplete=evaluateCompatibility({case:null,board:catalog.board[0],cpu:catalog.cpu[0],
 ram:null,gpu:null,ssd:null,psu:null,cooler:null});
assert.ok(incomplete.unknown.length>=1);
const json=JSON.parse(readFileSync(new URL('../offers.json',import.meta.url),'utf8'));
assert.ok(publicOffers(json.offers,now).length>80,'Não remover ofertas existentes');
for(const file of ['produto.html','verificar-pc.html','raven92-product.js','raven92-verify.js',
 'tools/central-imagens92.html','tools/painel-comercial92.html','tools/monitor-ofertas92.mjs']){
 const content=readFileSync(new URL('../'+file,import.meta.url),'utf8');assert.ok(content.length>300,file);
}
const shop=readFileSync(new URL('../storefront-shop.js',import.meta.url),'utf8');
assert.ok(shop.includes("smartSearchScore"));
assert.ok(shop.includes("produto.html?produto="));
const assistant=readFileSync(new URL('../assistente.html',import.meta.url),'utf8');
assert.ok(assistant.includes("raven92-assistant.mjs"));
console.log('PASS: Raven 9.2 — busca, identidade, filtros, preços, fichas, verificador, comunidade e operação');
