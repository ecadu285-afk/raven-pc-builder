import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalogDisplayEntries} from '../catalog-display.mjs';
import {filterCatalogOffers} from '../catalog-filters.mjs';
import {publicOffers} from '../offer-policy.mjs';
const document=JSON.parse(readFileSync(new URL('../offers.json',import.meta.url),'utf8'));
const source=document.offers;
const today=new Date('2026-11-17T12:00:00Z');
const published=publicOffers(source,today);
assert.ok(published.length>=80,'Catálogo elegível inesperadamente pequeno');
assert.ok(source.every(o=>typeof o.category==='string'&&o.category.length>0),'Todo anúncio deve ter categoria');
assert.equal(source.filter(o=>o.reviewStatus==='hold').length,4,'Não remova suspensões já verificadas sem revisão');
assert.equal(published.length,source.length-source.filter(o=>o.reviewStatus==='hold').length);
const simpleGroup=list=>[...new Map(list.map(o=>[o.partId,o])).values()].map(best=>({best}));
const singles=catalogDisplayEntries(published,'offers',simpleGroup);
assert.equal(singles.length,published.length,'Modo todos os anúncios não deve juntar lojas');
assert.ok(catalogDisplayEntries(published,'models',simpleGroup).length<singles.length,'Modo agrupado junta referências');
const categories=[...new Set(published.map(o=>o.category))];
let counted=0;
for(const category of categories){
 const rows=filterCatalogOffers(published,{category},{categoryOf:o=>o.category});
 counted+=rows.length;
 assert.equal(catalogDisplayEntries(rows,'offers',simpleGroup).length,rows.length,category+' perdeu anúncios');
}
assert.equal(counted,published.length,'Todos os anúncios devem pertencer a uma categoria');
const shopee=published.filter(o=>o.store==='shopee');
assert.equal(filterCatalogOffers(published,{store:'shopee'},{categoryOf:o=>o.category}).length,shopee.length);
for(const id of ['5500','c-eco-m','gtx750','a520m','r5-3400g','5600g','5700x','7600','5600x']){
 const o=source.find(x=>x.partId===id&&x.store==='mercadolivre');
 assert.ok(o&&o.category&&o.category!=='other','Categoria de '+id+' ausente');
}
assert.equal(catalogDisplayEntries([],'offers',simpleGroup).length,0);
console.log('PASS: ofertas individuais, categorias e lojas (12+ verificações).');
