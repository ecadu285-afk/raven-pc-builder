import assert from 'node:assert/strict';
import {compareSiteBot,offerKey} from '../raven90-sync.mjs';
const x={partId:'a',store:'shopee',url:'https://shopee.com.br/a',price:100,checkedAt:'2026-11-15'};
assert.equal(offerKey(x),'shopee|https://shopee.com.br/a');
const report=compareSiteBot({offers:[x]}, {offers:[x,{...x,price:90},{...x,url:'https://shopee.com.br/b'},{...x,url:'https://shopee.com.br/c',reviewStatus:'hold'},{partId:'x'}]});
assert.equal(report.statuses.presentes,1);assert.equal(report.statuses.divergentes,1);
assert.equal(report.statuses.aguardando,1);assert.equal(report.statuses.suspensos,1);assert.equal(report.statuses.invalidos,1);
assert.equal(report.rows.length,5);
console.log('PASS: diagnóstico de sincronização 9.0 (7 cenários)');
