import {catalog} from './catalog.js';
import {evaluateCompatibility} from './compatibility.js';
import {BUILD_ORDER,BUILD_LABELS,buildLink,parseBuildLink} from './raven79-compare.mjs';
const $=id=>document.getElementById(id);
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const selected={};
const groups=BUILD_ORDER;
for(const kind of groups){
 const label=node('label','raven92-field'),caption=node('span','',BUILD_LABELS[kind]);
 const sel=node('select');sel.id='verify-'+kind;
 const empty=node('option','','Não selecionado');empty.value='';sel.append(empty);
 for(const part of catalog[kind]||[]){
  if(!part?.id||!part.name)continue;
  const option=node('option','',part.name+(part.conceptual?' · referência conceitual':''));option.value=part.id;sel.append(option);
 }
 label.append(caption,sel);$('verify-fields').append(label);
 sel.addEventListener('change',()=>{selected[kind]=sel.value||null;updateLink();});
}
function updateLink(){
 const ids=Object.fromEntries(groups.map(k=>[k,$('verify-'+k).value||null]));
 $('verify-builder').href=buildLink(ids);
}
function panel(title,items,className){
 const box=node('section','raven92-result-group '+className);
 box.append(node('h3','',title));
 const ul=node('ul');for(const x of items)ul.append(node('li','',x));
 box.append(ul);return box;
}
function report(){
 const parts=Object.fromEntries(groups.map(kind=>[kind,(catalog[kind]||[]).find(x=>x.id===$('verify-'+kind).value)||null]));
 const result=evaluateCompatibility(parts);
 const filled=groups.filter(k=>parts[k]).length;
 const root=$('verify-result');root.replaceChildren();
 root.append(node('h2','',filled+'/8 componentes selecionados · '+result.errors.length+' incompatibilidade(s) conhecida(s)'));
 if(result.errors.length)root.append(panel('Incompatibilidades',result.errors,'raven92-errors'));
 if(result.warnings.length)root.append(panel('Avisos',result.warnings,'raven92-warnings'));
 if(result.passed.length)root.append(panel('Verificações sem conflito conhecido',result.passed,'raven92-passed'));
 if(result.unknown.length)root.append(panel('Pontos que exigem conferência',result.unknown,'raven92-unknown'));
 if(!filled)root.append(node('p','raven92-muted','Selecione componentes para verificar.'));
 if(filled&&result.errors.length===0)root.append(node('p','raven92-muted','Nenhum conflito detectado nos campos analisados; isto não garante compatibilidade real.'));
 updateLink();
}
$('verify-run').addEventListener('click',report);
$('verify-clear').addEventListener('click',()=>{for(const k of groups)$('verify-'+k).value='';report()});
const hash=location.hash;
if(hash.startsWith('#b=')){
 try{const ids=parseBuildLink(hash);for(const kind of groups){if(ids[kind]&&[...$('verify-'+kind).options].some(o=>o.value===ids[kind]))$('verify-'+kind).value=ids[kind];}}
 catch(e){console.warn('Montagem compartilhada não reconhecida',e);}
}
const requested=new URLSearchParams(location.search).get('produto');
if(requested)for(const kind of groups){const sel=$('verify-'+kind);if([...sel.options].some(o=>o.value===requested)){sel.value=requested;break}}
report();
