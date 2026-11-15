import {catalog} from './catalog.js';
const $=id=>document.getElementById(id);
const stores={
 amazon:['amazon.com.br','amazon.com','amzn.to','link.amazon'],
 mercadolivre:['mercadolivre.com.br','mercadolivre.com','meli.la'],
 shopee:['shopee.com.br','shopee.com','shope.ee']
};
const labels={pc:'PC montado',kit:'Kit de upgrade',cpu:'Processador',board:'Placa-mãe',gpu:'Placa de vídeo',ram:'RAM',ssd:'SSD',hdd:'HD',psu:'Fonte',case:'Gabinete',cooler:'Cooler',other:'Outros'};
const items=Object.entries(catalog).flatMap(([category,array])=>array.filter(item=>!item.conceptual).map(item=>({...item,category})));
const catalogMap=new Map(items.map(x=>[x.id,x]));
let offers=[],doc={schemaVersion:3,offers:[],history:[]},editing=-1,loaded=false;
const notify=msg=>{$('status').textContent=msg};
function currency(value){return Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function parsePrice(value){
 let str=String(value||'').replace(/R\$\s*/gi,'').replace(/\s/g,'');
 if(!/^\d[\d.,]*$/.test(str))return NaN;
 const index=Math.max(str.lastIndexOf(','),str.lastIndexOf('.'));
 let integer=str,decimal='';
 if(index>=0){const suffix=str.slice(index+1);if(suffix.length>0&&suffix.length<=2){integer=str.slice(0,index);decimal=suffix;}}
 integer=integer.replace(/[,.]/g,'');
 if(!/^\d+$/.test(integer)||decimal&&!/^\d{1,2}$/.test(decimal))return NaN;
 const result=Number(integer+(decimal?'.'+decimal:''));
 return Number.isFinite(result)?Math.round(result*100)/100:NaN;
}
function allowedUrl(value,store){
 if(!stores[store]||typeof value!=='string'||value.length>2048)return false;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&stores[store].some(d=>u.hostname===d||u.hostname.endsWith('.'+d))}catch{return false}
}
function imageValid(value){if(!value)return true;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&value.length<=2048}catch{return false}}
function validated(o){
 return o&&typeof o.partId==='string'&&o.partId.trim().length>0&&stores[o.store]&&Number.isFinite(o.price)&&o.price>0&&o.price<10000000&&/^\d{4}-\d{2}-\d{2}$/.test(o.checkedAt||'')&&!Number.isNaN(Date.parse(o.checkedAt+'T00:00:00Z'))&&allowedUrl(o.url,o.store)&&(!o.title||typeof o.title==='string'&&o.title.length<=180)&&(!o.modelName||typeof o.modelName==='string'&&o.modelName.length<=130)&&imageValid(o.imageUrl);
}
function slug(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55)}
function hash(value){let h=2166136261;for(const x of value){h^=x.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function makeId(category,name,details){
 const normalized=[category,String(name||'').trim().toLowerCase(),String(details||'').trim().toLowerCase()].join('|');
 return 'raven-'+category+'-'+slug(name).slice(0,34)+'-'+hash(normalized);
}
function categoryOf(o){return o.category||catalogMap.get(o.partId)?.category||'other'}
function clearForm(){
 $('offerForm').reset();editing=-1;$('formTitle').textContent='Cadastrar nova oferta';$('save').textContent='Cadastrar oferta';$('cancel').hidden=true;
 $('mode').value='manual';$('catalogLabel').hidden=true;$('checkedAt').value=new Date().toISOString().slice(0,10);updateImagePreview();
 const c=new URLSearchParams(location.search).get('categoria');if(labels[c])$('category').value=c;
}
function copyToForm(index){
 const o=offers[index];if(!o)return;
 editing=index;$('formTitle').textContent='Editando oferta já cadastrada';$('save').textContent='Salvar alterações';$('cancel').hidden=false;
 $('mode').value=catalogMap.has(o.partId)?'catalog':'manual';
 $('catalogLabel').hidden=$('mode').value!=='catalog';
 if(catalogMap.has(o.partId))$('part').value=o.partId;
 $('category').value=labels[categoryOf(o)]?categoryOf(o):'other';
 $('store').value=o.store;$('modelName').value=o.modelName||catalogMap.get(o.partId)?.name||o.title||'';
 $('title').value=o.title||'';$('price').value=o.price.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
 $('checkedAt').value=o.checkedAt;$('condition').value=o.condition==='used'?'used':'new';
 $('url').value=o.url;$('imageUrl').value=o.imageUrl||'';$('specs').value=o.specs||'';updateImagePreview();
 $('affiliate').checked=o.affiliate===true;
 $('offerForm').scrollIntoView({behavior:'smooth',block:'start'});
}
function render(){
 const filter=$('filter').value,search=$('search').value.trim().toLowerCase();
 $('count').textContent='('+offers.length+')';
 const div=$('items');div.replaceChildren();let count=0;
 for(const [i,o] of offers.entries()){
  const label=categoryOf(o);
  if(filter!=='all'&&filter!==label)continue;
  if(search&&![o.title,o.modelName,o.specs,o.partId].join(' ').toLowerCase().includes(search))continue;
  count++;const row=document.createElement('div');row.className='row';const description=document.createElement('div');
  const title=document.createElement('strong');title.textContent=(o.modelName||o.title||catalogMap.get(o.partId)?.name||o.partId)+' · '+currency(o.price);
  const meta=document.createElement('small');meta.textContent=(labels[label]||label)+' · '+o.store+' · '+o.checkedAt+' · '+(o.condition==='used'?'Usado':'Novo');
  const buttons=document.createElement('div');buttons.className='actions';
  const edit=document.createElement('button');edit.textContent='Editar';edit.className='secondary';edit.type='button';edit.onclick=()=>copyToForm(i);
  const del=document.createElement('button');del.textContent='Excluir';del.className='danger';del.type='button';
  del.onclick=()=>{if(confirm('Excluir esta oferta apenas do arquivo em edição?')){offers.splice(i,1);if(editing===i)clearForm();else if(editing>i)editing--;render();notify('Oferta removida da cópia em edição. Publique o JSON atualizado para refletir no site.')}};
  description.append(title,meta);buttons.append(edit,del);row.append(description,buttons);div.append(row);
 }
 if(!count)div.append(Object.assign(document.createElement('p'),{textContent:'Nenhum anúncio corresponde aos filtros.'}));
}
function importData(data){
 if(!data||!Array.isArray(data.offers))throw Error('Arquivo JSON não contém a lista offers.');
 const bad=data.offers.map((o,i)=>[o,i]).filter(([o])=>!validated(o));
 if(bad.length)throw Error('Há '+bad.length+' oferta(s) inválida(s); primeiro ajuste a estrutura do arquivo, URLs ou preços. Índices: '+bad.slice(0,5).map(([o,i])=>i+1).join(', '));
 doc={...data};offers=data.offers.map(x=>({...x}));loaded=true;clearForm();render();notify(offers.length+' ofertas carregadas. Você pode incluir PCs e kits sem apagar as peças já cadastradas.');
}
function updateCatalogMode(){
 const mode=$('mode').value;$('catalogLabel').hidden=mode!=='catalog';
 if(mode==='catalog')updatePart();
}
function updatePart(){
 const item=catalogMap.get($('part').value);if(!item)return;
 $('category').value=item.category;$('modelName').value=item.name;
}
for(const p of items){
 const o=document.createElement('option');o.value=p.id;o.textContent=(labels[p.category]||p.category)+' · '+p.name;$('part').append(o);
}
function updateImagePreview(){
 const root=$('imagePreview');if(!root)return;
 root.replaceChildren();
 const url=$('imageUrl').value.trim();
 if(!url){const message=document.createElement('span');message.textContent='Sem imagem cadastrada';message.style.cssText='color:#626b7c;font-size:12px;text-align:center;padding:8px';root.append(message);return;}
 if(!imageValid(url)){const message=document.createElement('span');message.textContent='Endereço HTTPS inválido';message.style.color='#b65c67';root.append(message);return;}
 const img=document.createElement('img');img.src=url;img.alt='Prévia da imagem do produto';
 img.loading='lazy';img.referrerPolicy='no-referrer';
 img.style.cssText='max-width:100%;height:100%;object-fit:contain';
 img.onerror=()=>{root.textContent='Imagem indisponível — verifique a URL';root.style.color='#a1505a'};
 root.append(img);
}
$('imageUrl').addEventListener('change',updateImagePreview);
$('imageUrl').addEventListener('blur',updateImagePreview);
$('mode').addEventListener('change',updateCatalogMode);$('part').addEventListener('change',updatePart);
$('search').addEventListener('input',render);$('filter').addEventListener('change',render);
$('cancel').onclick=clearForm;
$('offerForm').addEventListener('reset',()=>{editing=-1;$('formTitle').textContent='Cadastrar nova oferta';$('save').textContent='Cadastrar oferta';$('cancel').hidden=true;$('catalogLabel').hidden=true;});
$('offerForm').onsubmit=e=>{
 e.preventDefault();
 if(!loaded){notify('Carregue ou importe o arquivo offers.json antes de editar, para não sobrescrever anúncios publicados.');return}
 const category=$('category').value,modelName=$('modelName').value.trim(),title=$('title').value.trim()||modelName,part=$('mode').value==='catalog'?catalogMap.get($('part').value):null;
 const price=parsePrice($('price').value),store=$('store').value,specs=$('specs').value.trim();
 let id=editing>=0?offers[editing].partId:(part?part.id:makeId(category,modelName,specs));
 const obj={...(editing>=0?offers[editing]:{}),partId:id,category:part?part.category:category,modelName:part?part.name:modelName,title,store,price,
   checkedAt:$('checkedAt').value,condition:$('condition').value,url:$('url').value.trim(),
   affiliate:$('affiliate').checked,imageUrl:$('imageUrl').value.trim(),specs};
 if(!validated(obj)||!modelName){notify('Verifique nome, preço no formato brasileiro, data, loja e URL HTTPS do anúncio.');return}
 if(editing<0&&offers.some(o=>o.store===obj.store&&o.url===obj.url)){notify('Esse anúncio já existe para a mesma loja. Utilize Editar, em vez de cadastrar duplicado.');return}
 if(editing>=0)offers[editing]=obj;else offers.push(obj);
 const notice=editing<0?'Oferta cadastrada na cópia local.':'Oferta atualizada na cópia local.';
 clearForm();render();notify(notice+' Baixe offers.json para publicar.');
};
$('load').onclick=async()=>{try{const r=await fetch('./offers.json',{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);importData(await r.json())}catch(e){notify('Não foi possível carregar ofertas do GitHub Pages: '+e.message)}};
$('file').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{importData(JSON.parse(await file.text()))}catch(err){notify('Importação não realizada: '+err.message)}};
$('export').onclick=()=>{
 if(!loaded){notify('Primeiro carregue a versão existente ou importe um offers.json.');return}
 const updated={...doc,schemaVersion:Math.max(Number(doc.schemaVersion)||3,3),updatedAt:new Date().toISOString().slice(0,10),offers};
 const content=JSON.stringify(updated,null,2)+'\n',file=new Blob([content],{type:'application/json'}),url=URL.createObjectURL(file),a=document.createElement('a');
 a.href=url;a.download='offers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2500);
 notify('Arquivo offers.json exportado com '+offers.length+' ofertas. Envie ao GitHub para aparecer no site.');
};
clearForm();render();$('load').click();
