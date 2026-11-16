import assert from 'node:assert/strict';
import {catalog} from '../catalog.js';
import {productFacts,productFactsDescription} from '../product-details.mjs';
import {buildHealth} from '../build-health.mjs';
import {recommendBudget} from '../budget-engine.js';
import {stageBotOffers} from '../offer-import65.mjs';

// 6.7: nenhuma ficha deve ser inventada quando modelo não consta nas referências.
const cpu=catalog.cpu.find(x=>x.id==='5500');
const facts=productFacts({partId:cpu.id,category:'cpu',title:cpu.name},{...cpu,category:'cpu'});
assert.ok(facts.some(x=>x.label==='Socket'&&x.value==='AM4'));
assert.ok(productFactsDescription(facts).includes('Socket: AM4'));
assert.deepEqual(productFacts({partId:'unlisted',category:'cpu',title:'Modelo não validado'}),[]);
const card=productFacts({partId:'gpu-unknown',category:'gpu',title:'Placa RX 590 8GB'});
assert.ok(card.some(x=>x.label==='Memória anunciada'&&x.source==='título do anúncio'));
assert.equal(productFacts({partId:'non-matching',category:'cpu',title:'CPU'},{...cpu}).length,0);

// 6.9: conflitos e campos não verificados devem continuar explícitos.
const board={id:'b450',socket:'AM4',memory:'DDR4',form:'mATX'};
const ram={memory:'DDR4'};
const casePart={form:'ATX',gpuMaxMm:350};
const gpu={id:'igpu'};
const health=buildHealth({cpu:{socket:'AM4',igpu:true},board,ram,case:casePart,gpu,psu:{watts:500}},
 {errors:[],warnings:[],unknown:[],estimatedWatts:190,complete:false});
assert.equal(health.checks.find(x=>x.name==='Socket do processador').status,'match');
assert.ok(health.recommendedWatts>=190);
assert.equal(health.checks.find(x=>x.name==='BIOS e conectores').status,'unknown');
const conflict=buildHealth({cpu:{socket:'AM5'},board},{errors:['socket'],estimatedWatts:120});
assert.equal(conflict.checks.find(x=>x.name==='Socket do processador').status,'error');
assert.equal(conflict.recommendedWatts,null);

// 7.0: perfis são aceitos sem criar ofertas inexistentes.
for(const purpose of ['general','games','creative','upgrade','economy']){
 const res=recommendBudget([],{purpose,budget:2500,now:Date.parse('2026-11-16T12:00:00Z')});
 assert.equal(res.purpose,purpose);
 assert.equal(res.chosen,null);
 assert.equal(res.pricesAreLive,false);
}

// 6.8: log não aprova a mudança e não divulga token privado.
const offer={partId:'5500',store:'shopee',category:'cpu',title:'Ryzen 5 5500',url:'https://shopee.com.br/example',price:600,checkedAt:'2026-11-16',condition:'new',reviewStatus:'approved',affiliate:false};
const update=stageBotOffers({schemaVersion:3,offers:[offer],history:[]},{offers:[{...offer,price:590,token:'NAO-EXPORTAR'}]},{now:new Date('2026-11-16T12:00:00Z')});
assert.equal(update.updated,1);
assert.equal(update.changes[0].kind,'alterado');
assert.equal(update.document.offers[0].reviewStatus,'pending');
assert.equal(JSON.stringify(update).includes('NAO-EXPORTAR'),false);
console.log('PASS: Raven 6.7–7.0 (18 verificações de integração e privacidade)');