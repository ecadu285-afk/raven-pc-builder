import assert from 'node:assert/strict';
import {safeProductImage,imageEvidence,countCategories,comparableOfferGroups} from '../raven91-catalog.mjs';
import {stageBotOffers} from '../offer-import65.mjs';
import {publicOffers} from '../offer-policy.mjs';

const date='2026-11-19',now=new Date('2026-11-19T18:00:00Z');
const base={partId:'5500',store:'shopee',title:'AMD Ryzen 5 5500',modelName:'AMD Ryzen 5 5500',
 category:'cpu',condition:'new',price:580,checkedAt:date,url:'https://shopee.com.br/product/123',affiliate:true,
 imageUrl:'https://cf.shopee.com.br/file/sample'};
const other={...base,store:'mercadolivre',price:500,url:'https://meli.la/sample',imageUrl:''};
assert.ok(safeProductImage(base));
assert.equal(safeProductImage({...base,imageUrl:'https://cf.shopee.com.br.evil.test/foto'}),null);
assert.equal(safeProductImage({...base,imageUrl:'javascript:alert(1)'}),null);
assert.equal(imageEvidence(base).reviewed,false);
assert.equal(imageEvidence({...base,imageReviewStatus:'verified',imageSource:base.url,
 imageReviewedAt:date,imageCredit:'Loja autorizada',imageUsagePermission:true}).reviewed,true);
assert.equal(imageEvidence({...base,imageReviewStatus:'verified',imageSource:base.url,
 imageReviewedAt:date,imageCredit:'Loja autorizada',imageUsagePermission:false}).reviewed,false);
assert.deepEqual(countCategories([base,other]),{cpu:2});
const comps=comparableOfferGroups([base,other]);
assert.equal(comps.length,1);
assert.equal(comps[0].min,500);
assert.equal(comps[0].max,580);
assert.equal(comps[0].stores,2);
assert.equal(comparableOfferGroups([base,{...other,condition:'used'}]).length,0);
assert.equal(comparableOfferGroups([base,{...other,partId:'5600'}]).length,0);
const generic1={...base,partId:'ssd1tb',category:'ssd',modelName:'SSD NVMe 1TB'};
const generic2={...other,partId:'ssd1tb',category:'ssd',modelName:'SSD NVMe 1TB'};
assert.equal(comparableOfferGroups([generic1,generic2])[0].needsSkuReview,true);
assert.equal(publicOffers([base,{...other,reviewStatus:'pending'}],now).length,1);
const old={...base,imageReviewStatus:'verified',imageReviewedAt:date,imageSource:base.url,
 imageCredit:'Loja autorizada',imageUsagePermission:true,reviewStatus:'approved'};
const newer={...base,imageUrl:'https://cf.shopee.com.br/file/new',price:575,affiliateStatus:'confirmed'};
const stage=stageBotOffers({schemaVersion:3,offers:[old]}, {offers:[newer]},{now});
assert.equal(stage.updated,1);
assert.equal(stage.document.offers[0].reviewStatus,'pending');
assert.equal(stage.document.offers[0].imageReviewStatus,'pending');
assert.equal(stage.document.offers[0].imageUsagePermission,false);
assert.equal(stage.document.offers[0].imageCredit,'');
console.log('PASS: 16 verificações Raven 9.1 (foto, catálogo, comparação e sincronização)');
