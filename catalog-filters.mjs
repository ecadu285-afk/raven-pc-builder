/** RAVEN 6.4 — filtros sem fabricar produtos, imagens ou preços. */
export function foldTerm(value) {
 return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
export function validPriceLimit(value){
 const n=Number(value);return Number.isFinite(n)&&n>=1&&n<=1000000?n:null;
}
export function filterCatalogOffers(offers,filters={},options={}){
 if(!Array.isArray(offers))return [];
 const categoryOf=options.categoryOf||((x)=>x.category);
 const hasPhoto=options.hasPhoto||((x)=>Boolean(x.imageUrl));
 const isRecent=typeof options.isRecent==='function'?options.isRecent:()=>false;
 const labelOf=options.labelOf||((x)=>x.modelName??x.title);
 const terms=foldTerm(filters.search).split(' ').filter(Boolean);
 const category=String(filters.category||'all'),store=String(filters.store||'all'),condition=String(filters.condition||'all');
 const max=validPriceLimit(filters.maxPrice);
 return offers.filter(o=>{
  if(!o||typeof o!=='object'||!Number.isFinite(o.price)||o.price<=0)return false;
  const kind=categoryOf(o);
  if(['pc','kit'].includes(kind))return false;
  if(category!=='all'&&kind!==category)return false;
  if(store!=='all'&&o.store!==store)return false;
  if(condition!=='all'&&(o.condition||'unknown')!==condition)return false;
  if(max!==null&&o.price>max)return false;
  if(filters.photoOnly===true&&!hasPhoto(o))return false;
  if(filters.recentOnly===true&&!isRecent(o))return false;
  const hay=foldTerm([o.title,o.modelName,o.partId,labelOf(o),o.store,o.category].join(' '));
  return terms.every(t=>hay.includes(t));
 });
}
