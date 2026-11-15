import {
  ravenInitAccount, ravenGetAccount, ravenGetSupabaseClient, ravenOpenAccount
} from './raven-account.js';

const tables = { items:'raven_user_items', profile:'raven_customer_profile', reviews:'raven_product_reviews' };
const records = { saved:new Set(), cart:new Set() };
let syncHandler = () => {};
let initialized = false;
let loadingAccountId = null;
let currentCep = '';

export const ravenMarketUser = () => ravenGetAccount();
export const ravenMarketSaved = (kind,key) => Boolean(records[kind]?.has(key));
export const ravenMarketKeys = kind => new Set(records[kind]||[]);

function requireLogin(){
  if(!ravenGetAccount() || !ravenGetSupabaseClient()){
    ravenOpenAccount();
    throw Error('Entre na sua conta para salvar produtos ou usar o carrinho.');
  }
  return {client:ravenGetSupabaseClient(),id:ravenGetAccount().id};
}
function informativeError(err){
  const msg=String(err?.message||'').toLowerCase();
  if(msg.includes('duplicate key')||msg.includes('23505'))return 'Você já avaliou este produto. Exclua sua avaliação anterior se quiser publicar outra.';
  return 'Não foi possível concluir. Verifique sua conexão e tente novamente.';
}
function repaint(){
 const user=ravenGetAccount();
 const acc=document.getElementById('marketWelcome');
 for(const n of document.querySelectorAll('[data-market-cep]'))n.textContent=currentCep?'CEP '+currentCep.slice(0,5)+'-'+currentCep.slice(5):'Informe seu CEP';
 if(acc)acc.textContent=user ? 'Olá, '+(user.user_metadata?.full_name||user.email?.split('@')[0]||'cliente Raven') : 'Entre ou crie sua conta';
 for(const kind of ['saved','cart']){
  for(const node of document.querySelectorAll('[data-market-count="'+kind+'"]'))node.textContent=String(records[kind].size);
 }
 syncHandler();
 window.dispatchEvent(new CustomEvent('raven-market-update'));
}
export async function ravenMarketRefresh(){
 const currentId=ravenGetAccount()?.id;
 loadingAccountId=currentId||null;
 records.saved.clear();records.cart.clear();currentCep='';
 if(!currentId){repaint();return}
 try{
  const {client}=requireLogin();
  const [items,profile]=await Promise.all([
    client.from(tables.items).select('product_key,list_type').eq('user_id',currentId).limit(500),
    client.from(tables.profile).select('cep').eq('user_id',currentId).maybeSingle()
  ]);
  if(items.error)throw items.error;
  if(profile.error)throw profile.error;
  const data=items.data;
  if(loadingAccountId!==currentId||ravenGetAccount()?.id!==currentId)return;
  currentCep=profile.data?.cep||'';
  for(const x of data||[]) if(records[x.list_type])records[x.list_type].add(x.product_key);
 }catch(err){console.warn('Raven Market: não foi possível carregar listas',err);}
 if(loadingAccountId===currentId)repaint();
}
export function ravenMarketInit(onChange=()=>{}){
 syncHandler=onChange;
 if(initialized)return;
 initialized=true;
 ravenInitAccount({onChange: ravenMarketRefresh});
}
export async function ravenMarketToggle(kind,key){
 if(!['saved','cart'].includes(kind)||typeof key!=='string'||key.length>180)throw Error('Produto inválido.');
 const {client,id}=requireLogin();
 const exists=records[kind].has(key);
 const query=client.from(tables.items);
 const {error}=exists
   ? await query.delete().eq('user_id',id).eq('list_type',kind).eq('product_key',key)
   : await query.insert({user_id:id,list_type:kind,product_key:key});
 if(error)throw Error(informativeError(error));
 if(ravenGetAccount()?.id!==id)return;
 exists?records[kind].delete(key):records[kind].add(key);
 repaint();
}
export async function ravenMarketGetCep(){
 if(!ravenGetAccount())return '';
 const {client,id}=requireLogin();
 const {data,error}=await client.from(tables.profile).select('cep').eq('user_id',id).maybeSingle();
 if(error)throw Error(informativeError(error));
 return ravenGetAccount()?.id===id ? (data?.cep||'') : '';
}
export async function ravenMarketSetCep(raw){
 const digits=String(raw||'').replace(/\D/g,'');
 if(!/^\d{8}$/.test(digits))throw Error('Informe um CEP brasileiro válido, com oito números.');
 const {client,id}=requireLogin();
 const {data,error}=await client.from(tables.profile).select('user_id').eq('user_id',id).maybeSingle();
 if(error)throw Error(informativeError(error));
 const result=data
 ? await client.from(tables.profile).update({cep:digits}).eq('user_id',id)
 : await client.from(tables.profile).insert({user_id:id,cep:digits});
 if(result.error)throw Error(informativeError(result.error));
 currentCep=digits;repaint();
 return digits;
}
export async function ravenMarketClearCep(){
 const {client,id}=requireLogin();
 const {error}=await client.from(tables.profile).delete().eq('user_id',id);
 if(error)throw Error(informativeError(error));
 currentCep='';repaint();
}
export async function ravenMarketReviews(key){
 const client=ravenGetSupabaseClient();if(!client)return [];
 const {data,error}=await client.from(tables.reviews)
    .select('id,user_id,rating,body,moderation_status,created_at')
    .eq('product_key',key).order('created_at',{ascending:false}).limit(40);
 if(error)throw Error(informativeError(error));
 return data||[];
}
export async function ravenMarketReviewCreate(key,rating,body){
 const {client,id}=requireLogin();
 if(typeof key!=='string'||key.length>180||!Number.isInteger(rating)||rating<1||rating>5)throw Error('Avaliação inválida.');
 body=String(body||'').trim();
 if(body.length<15||body.length>500)throw Error('Escreva de 15 a 500 caracteres sobre o produto.');
 const {error}=await client.from(tables.reviews).insert({user_id:id,product_key:key,rating,body});
 if(error)throw Error(informativeError(error));
}
export async function ravenMarketReviewDelete(reviewId){
 const {client,id}=requireLogin();
 const {error}=await client.from(tables.reviews).delete().eq('id',reviewId).eq('user_id',id);
 if(error)throw Error(informativeError(error));
}
export const ravenMarketOpenAccount = ravenOpenAccount;
