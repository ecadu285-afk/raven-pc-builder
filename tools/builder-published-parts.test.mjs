import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalog} from '../catalog.js';
import {publicOffers,offerAgeDays} from '../offer-policy.mjs';
import {partFromPublishedOffer,extendBuilderCatalog} from '../builder-published-parts.mjs';
import {evaluateCompatibility} from '../compatibility.js';
import {buildHealth} from '../build-health.mjs';

// Testa o próprio offers.json do site: anúncios reais cadastrados, sem criar preços novos.
const root=new URL('../offers.json',import.meta.url);
const doc=JSON.parse(readFileSync(root,'utf8'));
const now=new Date('2026-11-16T12:00:00Z');
const offers=publicOffers(doc.offers,now);
const groups=Object.fromEntries(Object.entries(catalog).map(([key,items])=>[key,items.map(x=>({...x}))]));
const isRecent=o=>offerAgeDays(o.checkedAt,now)>=0&&offerAgeDays(o.checkedAt,now)<=14;
const added=extendBuilderCatalog(groups,offers,{isRecent});

assert.ok(added.ram>=6,'RAM publicada e recente deve entrar na etapa Memória RAM');
assert.ok(added.ssd>=10,'SSD/HD publicados e recentes devem entrar em Armazenamento');
assert.ok(added.psu>=3,'Fontes cadastradas devem aparecer com potência informada no título');
assert.equal(added.ram,new Set(groups.ram.filter(x=>x.titleDerived).map(x=>x.id)).size);
assert.equal(added.ssd,new Set(groups.ssd.filter(x=>x.titleDerived).map(x=>x.id)).size);
assert.equal(extendBuilderCatalog(groups,offers,{isRecent}).ram,0,'refresh não deve duplicar modelos');
assert.equal(extendBuilderCatalog(groups,offers,{isRecent}).ssd,0,'refresh não deve duplicar SSDs e HDs');
assert.equal(groups.ram.find(x=>x.id==='16')?.name,catalog.ram.find(x=>x.id==='16')?.name,'referências antigas permanecem iguais');
assert.ok(groups.ram.every(p=>!p.titleDerived||p.price===0),'preço do catálogo ilustrativo não deve passar por real');
assert.ok(groups.ssd.some(p=>p.isHdd===true),'HD também deve aparecer no grupo Armazenamento');
assert.ok(groups.ssd.some(p=>p.storageInterface==='nvme'),'NVMe deve ser reconhecido');
assert.ok(groups.ssd.some(p=>p.storageInterface==='sata'),'SATA deve ser reconhecido');
assert.ok(groups.ram.some(p=>p.memory==='DDR3'),'DDR3 não deve desaparecer do catálogo de anúncios');
assert.ok(groups.ram.some(p=>p.memory==='DDR4'),'DDR4 não deve desaparecer do catálogo de anúncios');
assert.equal(groups.ram.filter(x=>x.titleDerived).some(x=>x.memory==='DDR5'),false,'não inventar DDR5');

const ram=groups.ram.find(x=>x.titleDerived&&x.memory==='DDR4');
assert.ok(ram);
const board={id:'board',name:'B450M',socket:'AM4',memory:'DDR4',form:'mATX'};
const cpu={id:'cpu',name:'Ryzen 5 5500',socket:'AM4',watts:65};
const compat=evaluateCompatibility({board,cpu,ram});
assert.ok(compat.unknown.some(x=>x.includes('título do vendedor')),'título do vendedor não pode virar verificação aprovada');
const health=buildHealth({board,ram,cpu},{errors:[],estimatedWatts:120});
assert.equal(health.checks.find(x=>x.name==='Memória RAM').status,'warning');
const psu=groups.psu.find(x=>x.titleDerived);
const healthPsu=buildHealth({board,ram,cpu,gpu:{id:'igpu'},psu},{errors:[],estimatedWatts:150});
assert.equal(healthPsu.checks.find(x=>x.name==='Fonte e potência').status,'warning');
assert.equal(partFromPublishedOffer({partId:'a',price:100,category:'ram',title:'Memoria de Servidor DDR4 16GB RDIMM'}),null);
assert.equal(partFromPublishedOffer({partId:'a',price:100,category:'ram',title:'Memoria sem tipo DDR'}),null);
assert.equal(partFromPublishedOffer({partId:'a',price:100,category:'ssd',title:'SSD 1TB sem interface'}),null);

// Uma entrada em revisão nunca deve chegar ao montador pela política de ofertas.
const held=doc.offers.filter(o=>o.reviewStatus==='hold');
for(const o of held)assert.equal(offers.includes(o),false);
const safe=Object.fromEntries(Object.entries(catalog).map(([k,items])=>[k,items.map(x=>({...x}))]));
assert.deepEqual(extendBuilderCatalog(safe,offers,{isRecent:()=>false}),{ram:0,ssd:0,psu:0});

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../script.js',import.meta.url),'utf8');
for(const id of ['raven-step-status','raven-pick-cheapest','raven-clear-step'])assert.ok(html.includes('id="'+id+'"'));
assert.ok(js.includes('extendBuilderCatalog(catalog,ravenOffers,{isRecent:ravenFresh})'));
assert.ok(js.includes('raven-part-comparison'));
console.log('PASS: Raven Builder 7.1 — RAM '+added.ram+', Armazenamento '+added.ssd+', Fontes '+added.psu+', seleção/segurança/integração');
