import {publicOffers,trustedOfferUrl} from './offer-policy.mjs';
import {comparableOfferGroups} from './raven91-catalog.mjs';
const $=id=>document.getElementById(id);
const money=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const stores={shopee:'Shopee',mercadolivre:'Mercado Livre',amazon:'Amazon',kabum:'KaBuM!',terabyte:'Terabyte'};
const node=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let groups=[];
function draw(){
 const query=norm($('compare-query').value.trim()),category=$('compare-category').value,sort=$('compare-order').value;
 let rows=groups.filter(g=>(category==='all'||g.category===category)&&norm([g.model,g.partId,g.offers.map(o=>o.title).join(' ')].join(' ')).includes(query));
 rows=rows.sort((a,b)=>sort==='difference'?(b.max-b.min)-(a.max-a.min):sort==='stores'?b.stores-a.stores||a.min-b.min:a.min-b.min);
 $('compare-status').textContent=rows.length+' referência(s) com ofertas em pelo menos duas lojas. Valores cadastrados, não preços ao vivo.';
 const list=$('compare-list');list.replaceChildren();
 if(!rows.length){list.append(node('p','no-offers','Nenhuma comparação disponível para este filtro. Experimente outra categoria ou acesse o catálogo completo.'));return}
 for(const group of rows.slice(0,80)){
  const card=node('article','raven91-compare-card'),head=node('div','raven91-compare-heading');
  const label=node('div'),name=node('h2','',group.model),subtitle=node('p','',
    group.stores+' lojas · '+(group.condition==='used'?'Usado':group.condition==='refurbished'?'Recondicionado':'Novo')+' · referência '+group.partId);
  label.append(name,subtitle);
  const saving=node('div','raven91-price-difference','Diferença cadastrada: '+money(group.max-group.min));
  head.append(label,saving);card.append(head);
  if(group.needsSkuReview)card.append(node('p','raven91-sku-warning','Atenção: anúncio genérico ou nomes divergentes. Confirme marca, capacidade e SKU; pode não ser o mesmo produto.'));
  else card.append(node('p','raven91-sku-warning raven91-neutral','Referência semelhante: confira revisão, garantia, condição e código exato em cada loja.'));
  const table=node('div','raven91-compare-table');
  for(const o of group.offers){
   const row=node('div','raven91-compare-row'),info=node('div');
   info.append(node('strong','',stores[o.store]||o.store),node('small','',o.title||o.modelName||group.model));
   const meta=node('div','raven91-compare-price');
   meta.append(node('strong','',money(o.price)),node('small','', 'Última consulta: '+o.checkedAt.split('-').reverse().join('/')));
   const a=node('a','raven91-compare-open','Ver na loja');a.href=trustedOfferUrl(o.url,o.store);a.target='_blank';a.rel=o.affiliate?'noopener noreferrer sponsored':'noopener noreferrer';
   row.append(info,meta,a);table.append(row);
  }
  card.append(table);list.append(card);
 }
 if(rows.length>80)list.append(node('p','raven91-compare-disclaimer','Exibindo 80 referências. Utilize a pesquisa para refinar.'));
}
async function init(){
 try{
  const response=await fetch('./offers.json',{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();groups=comparableOfferGroups(publicOffers(data.offers));
  const id=new URLSearchParams(location.search).get('produto');
  if(id)$('compare-query').value=id;
  for(const id of ['compare-query','compare-category','compare-order'])$(id).addEventListener(id==='compare-query'?'input':'change',draw);
  draw();
 }catch(err){$('compare-status').textContent='Não foi possível carregar o catálogo.';$('compare-list').replaceChildren(node('p','no-offers','Erro de leitura das ofertas. Recarregue a página ou visite o catálogo de peças.'));}
}
init();
