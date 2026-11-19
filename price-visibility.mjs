import {offerAgeDays} from './offer-policy.mjs';
/** Never label old manual values as current. Amazon requires authorized price data. */
export const MAX_PUBLIC_PRICE_DAYS=14;
export function publicPriceState(offer,now=new Date()){
 const days=offerAgeDays(offer?.checkedAt,now);
 const date=typeof offer?.checkedAt==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(offer.checkedAt)?offer.checkedAt.split('-').reverse().join('/'):'não informada';
 if(offer?.store==='amazon')return {show:false,days,label:'Consulte o preço diretamente na Amazon'};
 if(!Number.isFinite(days)||days<0||days>MAX_PUBLIC_PRICE_DAYS)return {show:false,days,label:'Preço a confirmar na loja · consulta anterior: '+date};
 if(!Number.isFinite(offer?.price)||offer.price<=0)return {show:false,days,label:'Consulte o preço na loja'};
 return {show:true,days,label:'Preço registrado em '+date+' · confirme na loja'};
}