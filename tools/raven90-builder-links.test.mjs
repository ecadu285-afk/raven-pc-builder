import assert from 'node:assert/strict';import {searchLinksForBuild} from '../raven90-builder-links.mjs';
const sample={cpu:[{id:'5600g',name:'Ryzen 5 5600G'}],ssd:[{id:'ssd-a',name:'SSD Kingston NV2 1TB'}]};
const rows=searchLinksForBuild({cpu:'5600g',ssd:'ssd-a'},sample,[]);
assert.equal(rows.length,2);assert.equal(rows[0].known,true);
assert.match(rows[0].href,/categoria=cpu/);assert.match(rows[1].href,/categoria=ssd/);
assert.equal(searchLinksForBuild({},sample).length,0);
assert.equal(searchLinksForBuild({cpu:'???'},sample)[0].known,false);
console.log('PASS: integração de peças selecionadas com o catálogo (6 cenários)');
