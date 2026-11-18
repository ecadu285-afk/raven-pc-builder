import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalog} from '../catalog.js';
import {publicOffers} from '../offer-policy.mjs';
import {referenceFor,evidenceFor,catalogHealth,priceTimeline,marketQualitySummary} from '../raven79-intel.mjs';
import {builderCatalog,parseBuildLink,buildLink,compareBuild,BUILD_ORDER} from '../raven79-compare.mjs';
import {understandHardwareRequest,assistantExplanation} from '../raven79-assistant.mjs';

const now=new Date('2026-11-16T12:00:00Z');
const document=JSON.parse(readFileSync(new URL('../offers.json',import.meta.url),'utf8'));
const offers=publicOffers(document.offers,now);
assert.ok(document.offers.length>=100,'O catálogo não deve perder ofertas ao crescer');
assert.ok(offers.length>80,'catálogo real continua publicável');
const health=catalogHealth(document.offers,catalog,now);
assert.equal(health.total,document.offers.length);
assert.equal(health.eligible,offers.length);
assert.ok(health.withoutPhoto>0);
assert.ok(health.recent<=health.eligible);
const model={partId:'16',category:'ram',title:'DDR5 32GB'};
assert.ok(referenceFor(model,catalog));
assert.ok(evidenceFor(model,catalog).issues.some(e=>e.includes('DDR')));
assert.ok(evidenceFor(model,catalog).issues.some(e=>e.includes('Capacidade')));
assert.equal(evidenceFor({partId:'sem-referencia',category:'ram',title:'RAM 8 GB DDR4'},catalog).reference,null);

// Um histórico só existe com datas registradas: nenhuma série de preços inventada.
const one={partId:'5500',category:'cpu',store:'shopee',price:600,checkedAt:'2026-11-15',url:'https://shopee.com.br/item-5500',reviewStatus:'approved',condition:'new',title:'Ryzen 5 5500'};
const before={partId:'5500',store:'shopee',price:670,checkedAt:'2026-11-14',url:'https://shopee.com.br/item-5500'};
let timeline=priceTimeline('5500',[one],[],now,'shopee');
assert.equal(timeline.hasTrend,false);
assert.equal(timeline.points.length,1);
timeline=priceTimeline('5500',[one],[before],now,'shopee');
assert.equal(timeline.hasTrend,true);
assert.deepEqual(timeline.points.map(p=>p.price),[670,600]);
assert.equal(priceTimeline('outro',[one],[before],now).points.length,0);
assert.equal(priceTimeline('5500',[{...one,reviewStatus:'hold'}],[before],now).points.length,0);
const audit=marketQualitySummary([{...one,token:'SEGREDO'},{...one,token:'SEGREDO'}],catalog,now);
assert.equal(audit.duplicates.length,1);
assert.equal(JSON.stringify(audit).includes('SEGREDO'),false);

// Comparar PCs: preserva IDs e exclui qualquer cotação ausente.
const ids={case:'case1',board:'b450',cpu:'5500',ram:'16',gpu:'rx6600',ssd:'500',psu:'psu1',cooler:null};
const link=buildLink(ids);
assert.ok(link.startsWith('index.html#b='));
assert.deepEqual(parseBuildLink(link),Object.fromEntries(BUILD_ORDER.map(k=>[k,ids[k]||null])));
assert.throws(()=>parseBuildLink('https://invalid.test/index.html'),/link|Cole/i);
assert.throws(()=>parseBuildLink('index.html#b=<script>'),/inválido|incompleto|inesperado/i);
const extended=builderCatalog(catalog,document.offers,now);
assert.ok(extended.ram.some(p=>p.titleDerived));
assert.ok(extended.ssd.some(p=>p.titleDerived));
const report=compareBuild(ids,extended,document.offers,now);
assert.ok(report.quoted<=report.filled);
assert.ok(report.total>=0);
assert.equal(report.complete,false);
assert.equal(report.quotes.cooler,undefined);
const none=compareBuild({},extended,[],now);
assert.equal(none.quoted,0);
assert.equal(none.total,0);

// Assistente local: sem chamada a provedores, sem inventar configuração.
let intent=understandHardwareRequest('PC gamer de até R$ 3.000 com AMD');
assert.equal(intent.budget,3000);
assert.equal(intent.purpose,'games');
assert.equal(intent.brand,'amd');
intent=understandHardwareRequest('PC para edição e renderizar por 4 mil');
assert.equal(intent.purpose,'creative');
assert.equal(intent.budget,4000);
assert.equal(understandHardwareRequest('PC para estudar').budget,null);
assert.equal(understandHardwareRequest('Quero economizar R$ 2500').purpose,'economy');
assert.ok(assistantExplanation(understandHardwareRequest('PC por R$ 3000'),null).includes('Não encontrei'));
const assistantCode=readFileSync(new URL('../raven79-assistant.mjs',import.meta.url),'utf8');
assert.equal(/fetch\s*\(/.test(assistantCode),false,'motor de regras não faz requisições de terceiros');

// Verificações de integridade de integração e telas.
for(const page of ['historico.html','comparar-pcs.html','assistente.html']){
 const html=readFileSync(new URL('../'+page,import.meta.url),'utf8');
 assert.ok(html.includes('raven79.css'));
 assert.ok(html.includes('meta name="viewport"'));
 assert.ok(html.includes('<main'));
}
const store=readFileSync(new URL('../storefront-shop.js',import.meta.url),'utf8');
assert.ok(store.includes('evidenceFor(o,catalog)'));
assert.ok(store.includes('historico.html?produto='));
const builder=readFileSync(new URL('../script.js',import.meta.url),'utf8');
const builderHtml=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.ok(builder.includes('viewer={lowPower('));
assert.ok(builderHtml.includes('id="raven-lowpower"'));
const auditPage=readFileSync(new URL('../tools/revisar-ofertas.html',import.meta.url),'utf8');
assert.ok(auditPage.includes('marketQualitySummary'));
console.log('PASS: Raven 7.9 — histórico, catálogo, imagens, comparação, Market Bot, 3D, mobile e assistente Beta');
