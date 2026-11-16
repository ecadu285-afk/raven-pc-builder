import assert from 'node:assert/strict';import {linesFromRegisteredPrices} from '../raven90-chart.mjs';
const x=[{store:'shopee',date:'2026-11-10',price:100},{store:'shopee',date:'2026-11-12',price:90},{store:'amazon',date:'2026-11-13',price:180},{store:'shopee',date:'falso',price:3},{store:'mercadolivre',date:'2026-11-12',price:0}];
const lines=linesFromRegisteredPrices(x);
assert.equal(lines.length,1);assert.equal(lines[0].store,'shopee');assert.equal(lines[0].points[1].price,90);
assert.equal(linesFromRegisteredPrices([x[0]]).length,0);
console.log('PASS: Raven 9.0 gráfico com dados registrados (4 cenários)');
