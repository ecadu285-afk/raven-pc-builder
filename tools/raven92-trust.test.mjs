import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publicPriceState} from '../price-visibility.mjs';
const now=new Date('2026-11-19T18:00:00Z'),o={store:'shopee',price:450,checkedAt:'2026-11-11'};
assert.equal(publicPriceState(o,now).show,true);
assert.equal(publicPriceState({...o,checkedAt:'2026-11-05'},now).show,true);
assert.equal(publicPriceState({...o,checkedAt:'2026-11-04'},now).show,false);
assert.equal(publicPriceState({...o,checkedAt:'2026-11-20'},now).show,false);
assert.equal(publicPriceState({...o,store:'amazon'},now).show,false);
assert.equal(publicPriceState({...o,price:0},now).show,false);
const read=x=>readFileSync(new URL('../'+x,import.meta.url),'utf8');
for(const f of ['inicio.html','produtos.html','comparar-ofertas.html']){assert.match(read(f),/raven92-more/);assert.match(read(f),/como-funciona.html/);}
assert.match(read('afiliados.html'),/Programa de Associados da Amazon/);
assert.match(read('afiliados.html'),/TerabyteShop/);
assert.match(read('categorias.html'),/Departamentos e categorias/);
console.log('PASS: Raven 9.2');
