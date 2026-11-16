import assert from 'node:assert/strict';
import {foldTerm,filterCatalogOffers,validPriceLimit} from '../catalog-filters.mjs';
const offers=[
 {partId:'a',title:'Ryzen 5 5600G',category:'cpu',store:'shopee',condition:'new',price:700,imageUrl:'https://example.test/a'},
 {partId:'a',title:'Ryzen 5 5600G',category:'cpu',store:'mercadolivre',condition:'used',price:500},
 {partId:'b',title:'GeForce RTX 3060',category:'gpu',store:'mercadolivre',condition:'new',price:1200},
 {partId:'c',title:'PC completo',category:'pc',store:'shopee',condition:'new',price:4500}];
const test=filters=>filterCatalogOffers(offers,filters,{categoryOf:x=>x.category});
assert.equal(foldTerm('Pláca de Vídeo'),'placa de video');
assert.equal(test({}).length,3);
assert.equal(test({search:'Ryzen 5600G'}).length,2);
assert.equal(test({search:'Ryzen 5'}).length,2);
assert.equal(test({category:'gpu'}).length,1);
assert.equal(test({store:'mercadolivre'}).length,2);
assert.equal(test({condition:'used'}).length,1);
assert.equal(test({maxPrice:600}).length,1);
assert.equal(test({photoOnly:true}).length,1);
assert.equal(test({maxPrice:'abc'}).length,3);
assert.equal(validPriceLimit(-1),null);
// Raven 6.6: filtro recente nunca deve reaproveitar uma oferta antiga.
const byRecency=filters=>filterCatalogOffers(offers,filters,{
 categoryOf:x=>x.category,isRecent:o=>o.partId==='a'&&o.store==='shopee'});
assert.equal(byRecency({recentOnly:true}).length,1);
assert.equal(byRecency({recentOnly:true,category:'gpu'}).length,0);
assert.equal(byRecency({recentOnly:false}).length,3);
assert.equal(test({recentOnly:true}).length,0); // Falha fechada sem verificação de data.
console.log('PASS: filtros 6.6 (15 cenários)');
