/** RAVEN 6.2 — regras compartilhadas de publicação.
 * Uso no navegador e no Node.js. Não confirma estoque, preço ou comissão.
 */
export const TRUSTED_SHOPS = Object.freeze({
  mercadolivre: ['mercadolivre.com.br','mercadolivre.com','meli.la'],
  shopee: ['shopee.com.br','shopee.com','shope.ee'],
  amazon: ['amazon.com.br','amazon.com','amzn.to','link.amazon'],
  kabum: ['kabum.com.br'],
  terabyte: ['terabyteshop.com.br']
});
export const OFFER_MAX_AGE_DAYS = 45;
const CATEGORIES = new Set(['cpu','board','gpu','ram','ssd','hdd','psu','case','cooler','pc','kit','other','keyboard','headset','mouse','chair','mousepad','monitor','fan','powerstrip','laptop','phone','desk']);
const clean = x => String(x ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function trustedOfferUrl(url, store) {
  if (typeof url !== 'string' || !TRUSTED_SHOPS[store]) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password && !parsed.port &&
      TRUSTED_SHOPS[store].some(d => host === d || host.endsWith('.'+d)) ? parsed.href : null;
  } catch { return null; }
}
export function offerAgeDays(date, now = new Date()) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Infinity;
  const stamp = Date.parse(date+'T00:00:00Z');
  if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0,10) !== date) return Infinity;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((today - stamp) / 86400000);
}
export function auditOffer(o, now = new Date()) {
  const errors=[], warnings=[];
  if (!o || typeof o !== 'object' || Array.isArray(o)) return {displayable:false,errors:['Registro inválido'],warnings};
  if (typeof o.partId !== 'string' || !o.partId.trim() || o.partId.length > 180) errors.push('ID inválido');
  if (!Number.isFinite(o.price) || o.price <= 0 || o.price > 1000000) errors.push('Preço inválido');
  if (!trustedOfferUrl(o.url,o.store)) errors.push('URL da loja inválida ou não autorizada');
  const age=offerAgeDays(o.checkedAt,now);
  if (!Number.isFinite(age)) errors.push('Data de consulta inválida');
  else if (age < -1) errors.push('Data de consulta no futuro');
  else if (age > OFFER_MAX_AGE_DAYS) errors.push('Consulta vencida (mais de '+OFFER_MAX_AGE_DAYS+' dias)');
  if (!['new','used','refurbished'].includes(o.condition)) warnings.push('Condição não especificada');
  if (!o.category || !CATEGORIES.has(o.category)) warnings.push('Categoria ausente ou desconhecida');
  if (!o.imageUrl) warnings.push('Sem imagem do anúncio');
  if (o.affiliate && o.affiliateStatus !== 'confirmed') warnings.push('Comissão de afiliado não confirmada');
  if (!o.modelName && !o.title) warnings.push('Nome do modelo ausente');
  if (o.reviewStatus === 'hold' || o.reviewStatus === 'rejected') errors.push('Oferta bloqueada para revisão');
  if (o.reviewStatus === 'pending') errors.push('Oferta aguardando aprovação');
  const title=clean(o.title);
  if (o.category === 'cpu' && /(?:\bpc\s+gamer\b|\bcomputador\s+completo\b|\bcpu\s+gamer\b|\bdesktop\s+completo\b)/i.test(title))
    errors.push('Possível computador completo classificado como processador');
  if ((o.partId === 'i3-3240' || /\bi3[\s-]?3240\b/.test(title)) && Number(o.price) > 2000)
    errors.push('Preço atípico para i3-3240: revisão obrigatória');
  if (o.category === 'ssd' && /\b(?:sata|ssd)\b/.test(title) && /\b1\s?tb\b/.test(title) && Number(o.price)>2000)
    errors.push('Preço atípico para SSD SATA 1 TB: revisão obrigatória');
  return {displayable:errors.length===0,errors,warnings,ageDays:age};
}
export function publicOffers(source, now = new Date()) {
  return (Array.isArray(source) ? source : []).filter(o => auditOffer(o, now).displayable);
}
export function qualityReport(source, now = new Date()) {
  const offers=Array.isArray(source)?source:[];
  const issues=offers.map((offer,index)=>({index,partId:offer?.partId||null,store:offer?.store||null,...auditOffer(offer,now)}));
  return {total:offers.length,published:issues.filter(i=>i.displayable).length,
    blocked:issues.filter(i=>!i.displayable).length,
    withoutImage:offers.filter(o=>!o?.imageUrl).length,
    affiliatePending:offers.filter(o=>o?.affiliate&&o.affiliateStatus!=='confirmed').length,
    issues:issues.filter(i=>i.errors.length||i.warnings.length)};
}
