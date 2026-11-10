import {evaluateCompatibility,memoryConflicts} from './compatibility.js';
import {catalog,autoBuild as autoBuildCat} from './catalog.js';
const groups=[
 {id:'case',name:'Gabinete',icon:'▣',desc:'Escolha a estrutura e o visual da sua máquina.',options:[{id:'case1',name:'Raven Noir M-ATX',desc:'Preto fosco · vidro lateral · micro-ATX',price:320,form:'mATX',gpuMaxMm:300},{id:'case2',name:'Raven Obsidian ATX',desc:'Preto fosco · vidro lateral · ATX',price:490,form:'ATX',gpuMaxMm:360}]},
 {id:'board',name:'Placa-mãe',icon:'▦',desc:'A base que conecta todos os componentes.',options:[{id:'b550',name:'B550M AM4 DDR4',desc:'Micro-ATX · soquete AM4 · DDR4',price:650,socket:'AM4',memory:'DDR4',form:'mATX',biosNote:'Verifique a versão da BIOS para a CPU escolhida.'},{id:'b450',name:'B450M AM4 DDR4',desc:'Micro-ATX · soquete AM4 · DDR4',price:480,socket:'AM4',memory:'DDR4',form:'mATX',biosNote:'Verifique a versão da BIOS para a CPU escolhida.'},{id:'b650',name:'B650M AM5 DDR5',desc:'Micro-ATX · soquete AM5 · DDR5',price:900,socket:'AM5',memory:'DDR5',form:'mATX'},{id:'b650atx',name:'B650 ATX AM5 DDR5',desc:'ATX · soquete AM5 · DDR5 · mais espaço',price:1150,socket:'AM5',memory:'DDR5',form:'ATX'}]},
 {id:'cpu',name:'Processador',icon:'▤',desc:'Defina a capacidade de processamento.',options:[{id:'5500',name:'AMD Ryzen 5 5500',desc:'6 núcleos / 12 threads · AM4',price:550,socket:'AM4',tier:2},{id:'5600',name:'AMD Ryzen 5 5600',desc:'6 núcleos / 12 threads · AM4',price:750,socket:'AM4',tier:3},{id:'5700x',name:'AMD Ryzen 7 5700X',desc:'8 núcleos / 16 threads · AM4',price:1050,socket:'AM4',tier:3},{id:'7600',name:'AMD Ryzen 5 7600',desc:'6 núcleos / 12 threads · AM5',price:1150,socket:'AM5',tier:4,watts:65},{id:'7800x3d',name:'AMD Ryzen 7 7800X3D',desc:'8 núcleos / 16 threads · AM5 · cache 3D',price:2300,socket:'AM5',tier:6,watts:120}]},
 {id:'ram',name:'Memória RAM',icon:'▥',desc:'Escolha a capacidade de memória.',options:[{id:'16',name:'16 GB DDR4 (2×8 GB)',desc:'Dual channel · 3200 MHz',price:300,memory:'DDR4'},{id:'32',name:'32 GB DDR4 (2×16 GB)',desc:'Dual channel · 3200 MHz',price:520,memory:'DDR4'},{id:'d5-16',name:'16 GB DDR5 (2×8 GB)',desc:'Dual channel · 5600 MHz',price:350,memory:'DDR5'},{id:'d5-32',name:'32 GB DDR5 (2×16 GB)',desc:'Dual channel · 6000 MHz',price:650,memory:'DDR5'}]},
 {id:'gpu',name:'Placa de vídeo',icon:'▰',desc:'O desempenho gráfico da sua montagem.',options:[{id:'rx6600',name:'AMD Radeon RX 6600',desc:'8 GB GDDR6 · consumo típico ~132 W',price:1250,power:132,lengthMm:190,tier:3},{id:'rx7600',name:'AMD Radeon RX 7600',desc:'8 GB GDDR6 · consumo típico ~165 W',price:1650,power:165,lengthMm:205,tier:4},{id:'rtx4060',name:'NVIDIA GeForce RTX 4060',desc:'8 GB GDDR6 · consumo típico ~115 W',price:1950,power:115,lengthMm:245,tier:4},{id:'rtx4070s',name:'NVIDIA GeForce RTX 4070 Super',desc:'12 GB GDDR6X · consumo típico ~220 W · 305 mm',price:4200,power:220,lengthMm:305,tier:6}]},
 {id:'ssd',name:'Armazenamento',icon:'▱',desc:'Velocidade para sistema, aplicativos e jogos.',options:[{id:'500',name:'SSD NVMe 500 GB',desc:'M.2 · PCIe · armazenamento rápido',price:250},{id:'1000',name:'SSD NVMe 1 TB',desc:'M.2 · PCIe · mais espaço para jogos',price:410}]},
 {id:'psu',name:'Fonte de alimentação',icon:'◈',desc:'Escolha uma fonte de qualidade e potência adequada.',options:[{id:'550',name:'Fonte 550 W 80 Plus Bronze',desc:'Potência nominal · qualidade do modelo deve ser verificada',price:320,watts:550},{id:'650',name:'Fonte 650 W 80 Plus Bronze',desc:'Potência nominal · margem para upgrades',price:430,watts:650},{id:'750',name:'Fonte 750 W 80 Plus Gold',desc:'Potência nominal · folga para GPU topo',price:600,watts:750}]}];
groups.push({id:'cooler',name:'Cooler do processador',icon:'❄',desc:'Escolha a refrigeração e confira o encaixe no socket.',options:[]});
groups.forEach(g=>{g.options=catalog[g.id]});const RK={ITX:1,mATX:2,ATX:3};const $=id=>document.getElementById(id),fmt=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});let chosen={};let current=0;let viewer=null;let exploded=false;
try{chosen=JSON.parse(localStorage.getItem('raven-pc-builder-v1')||'{}');if(!chosen||typeof chosen!=='object'||Array.isArray(chosen))chosen={};}catch{chosen={};}
try{const m=location.hash.match(/b=([^&]*)/);if(m){const ids=decodeURIComponent(m[1]).split(',');groups.forEach((g,i)=>{const o=g.options.find(x=>x.id===ids[i]);if(o)chosen[g.id]=o.id})}}catch{}
for(const g of groups)if(!g.options.some(o=>o.id===chosen[g.id]))delete chosen[g.id];
const shareHash=()=>'#b='+groups.map(x=>chosen[x.id]||'').join(',');
function optionFor(g){return g.options.find(o=>o.id===chosen[g.id]);}
function evaluateBuild(){
 const parts=Object.fromEntries(groups.map(g=>[g.id,optionFor(g)]));
 return evaluateCompatibility(parts);
}
function issues(){return evaluateBuild().errors;}
function renderDiagnostics(){const d=evaluateBuild(),target=$('diagnostics');if(!target)return;target.replaceChildren();
 const heading=document.createElement('div');heading.className='diag-head';heading.innerHTML='<div><span class="eyebrow">ANÁLISE DE HARDWARE</span><h3>Diagnóstico da montagem</h3></div>';
 const status=document.createElement('span');status.className='diag-status '+(d.errors.length?'danger':d.complete?'ok':'pending');status.textContent=d.errors.length?'INCOMPATÍVEL':!d.complete?'INCOMPLETA':d.unknown.length?'NÃO VERIFICADO':d.warnings.length?'ATENÇÃO':'SEM CONFLITOS NAS REGRAS';heading.append(status);target.append(heading);
 const metrics=document.createElement('div');metrics.className='diag-metrics';const total=groups.map(optionFor).filter(Boolean).reduce((n,o)=>n+o.price,0);for(const [label,value] of [['Peças escolhidas',Object.keys(chosen).length+' / 8'],['Custo ilustrativo',fmt(total)],['Consumo estimado',d.estimatedWatts?d.estimatedWatts+' W':'—'],['Conflitos / avisos',d.errors.length+' / '+d.warnings.length],['Não verificados',String(d.unknown.length)]]){const item=document.createElement('div');item.className='diag-metric';const a=document.createElement('small');a.textContent=label;const b=document.createElement('strong');b.textContent=value;item.append(a,b);metrics.append(item)}target.append(metrics);perf(target);
 function section(title,arr,cls){if(!arr.length)return;const block=document.createElement('div');block.className='diag-section '+cls;const h=document.createElement('h4');h.textContent=title;block.append(h);for(const line of arr){const p=document.createElement('p');p.textContent=line;block.append(p)}target.append(block)}
 section('Conflitos que precisam ser corrigidos',d.errors,'error');renderAssistant(target,d);section('Verificações aprovadas',d.passed,'success');section('Atenção antes de comprar',d.warnings,'warning');section('Não verificado — confira antes de comprar',d.unknown,'warning');renderCompare(target);
}

// 3.5 — sugestões baseadas em regras explícitas; não são recomendações de compra verificadas.
function renderAssistant(target,d){
 const panel=document.createElement('section');panel.className='assistant35';
 const title=document.createElement('h4');title.textContent='Assistente de montagem Raven';panel.append(title);
 const caption=document.createElement('p');caption.textContent=d.errors.length?'Há conflitos impeditivos. Corrija-os antes de considerar a compra.':'Confira estas melhorias e verificações antes de comprar.';panel.append(caption);
 const cpu=sel('cpu'),board=sel('board'),cooler=sel('cooler'),ram=sel('ram'),psu=sel('psu'),gpu=sel('gpu');
 function tip(label,detail,action,run){const row=document.createElement('div');row.className='assistant-tip';const copy=document.createElement('div');const strong=document.createElement('strong');strong.textContent=label;const small=document.createElement('p');small.textContent=detail;copy.append(strong,small);row.append(copy);if(action){const btn=document.createElement('button');btn.className='ghost';btn.textContent=action;btn.addEventListener('click',run);row.append(btn)}panel.append(row)}
 function change(id,part){chosen[id]=part.id;localStorage.setItem('raven-pc-builder-v1',JSON.stringify(chosen));history.replaceState(null,'',shareHash());render();viewer?.update(chosen)}
 if(cpu&&cooler&&!cooler.sockets.includes(cpu.socket)){
  const available=catalog.cooler.filter(c=>c.sockets.includes(cpu.socket)&&c.tdp>=(cpu.watts||90));
  const candidate=available.sort((a,b)=>a.price-b.price)[0];
  tip('Cooler incompatível com '+cpu.socket,candidate?'Opção genérica cadastrada: '+candidate.name+' ('+fmt(candidate.price)+'). Confirme fixação, ILM e altura do gabinete.':'Nenhum cooler cadastrado atende aos requisitos básicos. Pesquise o modelo exato e a fixação.',candidate?'Selecionar cooler':'',candidate?()=>change('cooler',candidate):undefined);
 }
 if(cpu&&board&&cpu.socket!==board.socket){const alt=catalog.board.filter(b=>b.socket===cpu.socket&&(!ram||b.memory===ram.memory)&&(!sel('case')||RK[b.form]<=RK[sel('case').form])).sort((a,b)=>a.price-b.price)[0];tip('Socket da CPU e placa-mãe não coincide','Troque a CPU ou escolha uma placa-mãe de socket '+cpu.socket+'.',alt?'Ver placa compatível':'',alt?()=>{current=1;render();document.querySelector('.config')?.scrollIntoView({behavior:'smooth'})}:undefined)}
 if(board&&ram&&(board.memory!==ram.memory||memoryConflicts({cpu,board,ram}).length)){const alt=catalog.ram.filter(r=>r.memory===board.memory&&r.gb>=ram.gb&&!memoryConflicts({cpu,board,ram:r}).length).sort((a,b)=>a.price-b.price)[0];tip('Memória incompatível','Confira o padrão de memória aceito simultaneamente pela CPU e pela placa-mãe.',alt?'Selecionar RAM':'',alt?()=>change('ram',alt):undefined)}
 if(cpu&&gpu&&gpu.id==='igpu'&&!cpu.igpu)tip('Sem vídeo integrado','Este processador precisa de uma placa de vídeo dedicada.','Escolher GPU',()=>{current=4;render();document.querySelector('.config')?.scrollIntoView({behavior:'smooth'})});
 if(ram&&ram.gb<16&&board){
  const candidates=catalog.ram.filter(r=>r.memory===board.memory&&r.gb>=16&&!memoryConflicts({cpu,board,ram:r}).length);
  const alt=candidates.sort((a,b)=>a.price-b.price)[0];
  if(alt){
   const modules=alt.modules||Number(alt.name?.match(/\((\d+)\s*[×x]/)?.[1])||null;
   const slotsConfirmed=Number.isFinite(board.ramSlots)&&modules!==null&&modules<=board.ramSlots;
   const capacityConfirmed=Number.isFinite(board.maxRamGb)&&alt.gb<=board.maxRamGb;
   const approved=slotsConfirmed&&capacityConfirmed;
   tip('Upgrade de memória', 'Opção de '+alt.gb+' GB: diferença ilustrativa de '+fmt(alt.price-ram.price)+'. '+(approved?'Quantidade de slots e capacidade cadastradas permitem a troca; confirme QVL, frequência e modelo real.':'Sugestão apenas para pesquisa: slots e/ou capacidade máxima não foram confirmados. Não aplique automaticamente.'),approved?'Aplicar upgrade':'Verificar memória',approved?()=>change('ram',alt):()=>{current=3;render();document.querySelector('.config')?.scrollIntoView({behavior:'smooth'})});
  }
 }
 if(psu&&cpu&&gpu){const rec=Math.ceil(d.estimatedWatts*1.4/50)*50;if(psu.watts<rec){const alt=catalog.psu.filter(p=>p.watts>=rec).sort((a,b)=>a.price-b.price)[0];if(alt)tip('Fonte com margem insuficiente','Estimativa sugere ao menos '+rec+' W; confira também conectores e qualidade.','Selecionar fonte',()=>change('psu',alt))}}
 if(board&&['LGA2011','LGA2011-3'].includes(board.socket))tip('Kit Xeon X79/X99','Confirme ECC/REG ECC/UDIMM, fixação ILM do cooler e suporte do firmware. Não é possível validar esses detalhes apenas pelo socket.');
 if(panel.querySelectorAll('.assistant-tip').length===0)tip('Revisão final','Sem correção automática sugerida. Confirme BIOS, conectores, dimensões e preços com o vendedor.');
 target.append(panel);
}
function snapshot(){return {ids:Object.fromEntries(groups.map(g=>[g.id,chosen[g.id]||null])),date:new Date().toISOString()}}
function summaryFor(ids){const items=groups.map(g=>g.options.find(p=>p.id===ids[g.id])).filter(Boolean);return {total:items.reduce((v,p)=>v+p.price,0),count:items.length,parts:items}}
function renderCompare(target){
 const panel=document.createElement('section');panel.className='compare35';const head=document.createElement('div');head.className='compare-head';const title=document.createElement('h4');title.textContent='Comparar montagens';const save=document.createElement('button');save.className='ghost';save.textContent='Salvar montagem A';head.append(title,save);panel.append(head);
 const note=document.createElement('p');note.textContent='Salve uma configuração A, monte outra e compare com a configuração B atual. Os dados ficam apenas neste navegador.';panel.append(note);
 save.onclick=()=>{localStorage.setItem('raven-compare-a-v35',JSON.stringify(snapshot()));renderDiagnostics()};
 let a=null;try{a=JSON.parse(localStorage.getItem('raven-compare-a-v35')||'null')}catch{}
 if(a?.ids){const A=summaryFor(a.ids),B=summaryFor(chosen),table=document.createElement('div');table.className='compare-grid';for(const [label,x,y] of [['Componentes',A.count+' / 8',B.count+' / 8'],['Custo ilustrativo'+(A.count<8||B.count<8?' (parcial se incompleta)':''),fmt(A.total),fmt(B.total)],['Diferença de subtotais','—',fmt(B.total-A.total)]]){for(const t of [label,x,y]){const c=document.createElement('span');c.textContent=t;table.append(c)}}panel.append(table);const details=document.createElement('div');details.className='compare-differences';for(const g of groups){const pa=g.options.find(p=>p.id===a.ids[g.id]),pb=optionFor(g);if(pa?.id!==pb?.id){const line=document.createElement('p');line.textContent=g.name+': '+(pa?.name||'—')+' → '+(pb?.name||'—');details.append(line)}}if(!details.childElementCount)details.textContent='As duas montagens têm os mesmos componentes.';panel.append(details)}else{const empty=document.createElement('p');empty.textContent='Nenhuma montagem A salva ainda.';panel.append(empty)}target.append(panel)
}

function render(){const g=groups[current],nav=$('steps');nav.replaceChildren();groups.forEach((item,i)=>{const b=document.createElement('button');b.className='step'+(i===current?' active':'')+(chosen[item.id]?' done':'');b.innerHTML=`<span class="step-num">${chosen[item.id]?'✓':String(i+1).padStart(2,'0')}</span><span>${item.name}</span>`;b.onclick=()=>{current=i;render()};nav.append(b)});$('step-number').textContent=String(current+1).padStart(2,'0');$('category').textContent=g.name;$('category-desc').textContent=g.desc;$('category-icon').textContent=g.icon;const box=$('options');if(lastCat===current)lastY=box.scrollTop;else lastY=0;lastCat=current;box.replaceChildren();listFor(g).forEach(o=>{const b=document.createElement('div');b.setAttribute('role','button');b.tabIndex=0;const tg=bad(g,o)?'Incompatível':over(g,o)?'Acima do orçamento':'';b.className='option'+(chosen[g.id]===o.id?' selected':'')+(tg?' dim':'');if(tg)b.dataset.tag=tg;const top=document.createElement('div');top.className='option-top';const n=document.createElement('span');n.className='option-name';n.textContent=o.name;const p=document.createElement('span');p.className='option-price';p.textContent=fmt(o.price);top.append(n,p);const d=document.createElement('div');d.className='option-desc';d.textContent=o.desc+(o.conceptual?' · Modelo conceitual / preço ilustrativo':'');b.append(top,d);const inspectBtn=document.createElement('button');inspectBtn.type='button';inspectBtn.className='raven-inspect-option';inspectBtn.textContent='◉ Visualizar em 3D';inspectBtn.setAttribute('aria-label','Inspecionar '+o.name+' em 3D');inspectBtn.onclick=(ev)=>{ev.preventDefault();ev.stopPropagation();chosen[g.id]=o.id;localStorage.setItem('raven-pc-builder-v1',JSON.stringify(chosen));history.replaceState(null,'',shareHash());render();viewer?.update(chosen);if(viewer?.inspect){viewer.inspect(g.id,o.name);$('scene').scrollIntoView({behavior:'smooth',block:'center'});}else alert('Visualizador 3D ainda está carregando.');};b.append(inspectBtn);b.onclick=()=>{chosen[g.id]=o.id;localStorage.setItem('raven-pc-builder-v1',JSON.stringify(chosen));history.replaceState(null,'',shareHash());render();if(viewer)viewer.update(chosen)};b.onkeydown=e=>{if(e.target===b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();b.click()}};box.append(b)});const problems=issues(),compat=$('compat');compat.className='compat '+(problems.length?'bad':'good');compat.replaceChildren();const strong=document.createElement('strong');strong.textContent=problems.length?'⚠ Atenção à compatibilidade':'◌ Sem conflito confirmado';const desc=document.createElement('p');desc.textContent=problems.length?problems.join(' '):'Nenhum conflito confirmado nas regras cadastradas. Isso NÃO garante compatibilidade: confira a seção Não verificado.';compat.append(strong,desc);$('back').disabled=current===0;$('next').textContent=current===groups.length-1?'Revisar montagem ↗':'Próxima etapa →';$('count').textContent=Object.keys(chosen).length+'/8';const selected=groups.map(group=>optionFor(group)).filter(Boolean);$('price').textContent=fmt(selected.reduce((sum,o)=>sum+o.price,0));const completeness=$('build-completeness');if(completeness){completeness.textContent=selected.length===8?'8/8 categorias selecionadas · Valor ilustrativo, não é cotação de loja.':selected.length+'/8 categorias · SUBTOTAL PARCIAL. Faltam '+(8-selected.length)+' peça(s); o custo final será maior.';completeness.className=selected.length===8?'raven52-complete':'raven52-incomplete';}$('summary-items').textContent=(evaluateBuild().errors.length?'⚠ NÃO COMPRAR: corrija os conflitos. · ':'')+(selected.length?selected.map(o=>o.name).join(' · '):'Nenhuma peça selecionada ainda.');const pl=$('platform');if(pl){const cp=optionFor(groups[2]);pl.textContent=cp?cp.socket:'—'}budgetNote();renderDiagnostics();}
$('back').onclick=()=>{current=Math.max(0,current-1);render()};$('next').onclick=()=>{if(current<groups.length-1)current++;else current=0;render()};$('reset').onclick=()=>{if(!confirm('Limpar todas as peças selecionadas?'))return;chosen={};localStorage.removeItem('raven-pc-builder-v1');history.replaceState(null,'',location.pathname);current=0;render();viewer?.update(chosen)};$('copy').onclick=async()=>{const lines=['RAVEN PC BUILDER — Configuração demonstrativa',...groups.map(g=>g.name+': '+(optionFor(g)?.name||'Não selecionado')),(groups.every(g=>optionFor(g))?'Total ilustrativo: ':'Subtotal parcial (montagem incompleta): ')+$('price').textContent,'Consumo estimado: '+evaluateBuild().estimatedWatts+' W','Conflitos: '+(evaluateBuild().errors.join('; ')||'Nenhum confirmado'), 'Pendências: '+evaluateBuild().unknown.join('; '),'Aviso: conferir compatibilidade completa e preços antes de comprar.','Link da build: '+location.origin+location.pathname+shareHash()];try{await navigator.clipboard.writeText(lines.join('\n'));$('copy').textContent='✓ Copiado';setTimeout(()=>$('copy').textContent='Copiar configuração ↗',1600)}catch{alert(lines.join('\n'))}};$('explode').onclick=()=>{exploded=!exploded;$('explode').textContent=exploded?'⇲ Montar peças':'⇱ Explodir peças';viewer?.explode(exploded)};$('camera').onclick=()=>viewer?.reset();
const presets=[{n:'Básico e barato',d:'Internet, estudos e escritório',ids:['c-eco','h61m','i5-3470','d3-8','rx550','sata120','p350']},{n:'Ultra barato',d:'O mínimo que liga e funciona',ids:['c-free','h61m-b','i3-2120','d3-4','igpu','hdd160','p300']},{n:'Raiz até R$ 600',d:'Vídeo integrado, o mais barato',ids:['c-used','h61m','i5-3470','d3-8','igpu','sata120','p300']},{n:'Gamer R$ 1000',d:'Upgrade com RX 560 usada',ids:['c-eco','h61m','i5-3470','d3-8','rx560','sata120','p400']},{n:'Econômico',d:'Jogos leves em 1080p',ids:['case1','b450','5500','16','rx6600','500','550']},{n:'Custo-benefício',d:'1080p alto, AM4 maduro',ids:['case1','b550','5600','32','rx7600','1000','650']},{n:'Gamer AM5',d:'DDR5 e caminho de upgrade',ids:['case2','b650atx','7600','d5-32','rtx4060','1000','650']},{n:'Extremo',d:'2K/4K e criação pesada',ids:['case2','b650atx','7800x3d','d5-32','rtx4070s','1000','750']}];
function applyPreset(ids){chosen={};groups.forEach((g,i)=>{if(ids[i])chosen[g.id]=ids[i]});localStorage.setItem('raven-pc-builder-v1',JSON.stringify(chosen));history.replaceState(null,'',shareHash());current=0;render();viewer?.update(chosen);$('scene').scrollIntoView({behavior:'smooth',block:'center'})}
const pbox=$('presets');if(pbox)presets.forEach(p=>{const total=p.ids.reduce((n,id,i)=>n+(groups[i].options.find(o=>o.id===id)?.price||0),0);const b=document.createElement('button');b.className='preset';b.innerHTML='<b></b><small></small><strong></strong>';b.children[0].textContent=p.n;b.children[1].textContent=p.d;b.children[2].textContent=fmt(total);b.onclick=()=>applyPreset(p.ids);pbox.append(b)});
const sw=$('swatches');if(sw)['#c2ff4d','#4dd2ff','#ff4dc4','#ffa94d'].forEach(c=>{const b=document.createElement('button');b.style.background=c;b.title='Cor de destaque';b.onclick=()=>{document.documentElement.style.setProperty('--accent',c);viewer?.accent(c)};sw.append(b)});
let rgbOn=false;$('rgb').onclick=()=>{rgbOn=!rgbOn;viewer?.rgb(rgbOn);$('rgb').classList.toggle('on',rgbOn)};
$('shot').onclick=()=>{if(!viewer)return;const a=document.createElement('a');a.href=viewer.shot();a.download='minha-build-raven.png';a.click()};
$('link').onclick=async()=>{const u=location.origin+location.pathname+shareHash();try{await navigator.clipboard.writeText(u);$('link').textContent='✓ Link copiado';setTimeout(()=>$('link').textContent='🔗 Copiar link',1600)}catch{prompt('Copie o link:',u)}};
function perf(t){const o=id=>optionFor(groups.find(g=>g.id===id));const c=o('cpu'),g=o('gpu'),r=o('ram');if(!c||!g)return;const m=r?(r.gb>=64?7:r.gb>=32?6:r.gb>=16?4.5:3):3,p=x=>Math.max(8,Math.min(100,Math.round(x/7*100)));const rows=[['Jogos 1080p',g.tier*.7+c.tier*.3],['Jogos 2K',(g.tier*.85+c.tier*.15)*(g.tier<=3?.85:1)-.2],['Edição de vídeo',c.tier*.5+m*.25+g.tier*.25],['Multitarefa',c.tier*.6+m*.4]];const box=document.createElement('div');box.className='perf';box.innerHTML='<h4>Desempenho estimado <small>índice relativo, não é benchmark</small></h4>';rows.forEach(([n,v])=>{const w=p(v);box.insertAdjacentHTML('beforeend','<div class="bar"><span>'+n+'</span><i><b style="width:'+w+'%"></b></i><em>'+w+'</em></div>')});t.append(box)}
let lastCat=-1,lastY=0;const ui={q:'',sort:'def',hide:false,budget:1000,on:false};
const sel=id=>optionFor(groups.find(x=>x.id===id));
function bad(g,o){const c=sel('cpu'),b=sel('board'),r=sel('ram'),k=sel('case'),u=sel('gpu');
 if(g.id==='cpu')return !!b&&(o.socket!==b.socket||memoryConflicts({cpu:o,board:b,ram:r}).length>0);
 if(g.id==='board')return !!((c&&o.socket!==c.socket)||(r&&o.memory!==r.memory)||(memoryConflicts({cpu:c,board:o,ram:r}).length>0)||(k&&RK[o.form]>RK[k.form]));
 if(g.id==='ram')return !!((b&&o.memory!==b.memory)||memoryConflicts({cpu:c,board:b,ram:o}).length);
 if(g.id==='gpu')return !!((k&&o.lengthMm>k.gpuMaxMm)||(o.id==='igpu'&&c&&!c.igpu));
 if(g.id==='cooler')return !!(c&&!o.sockets.includes(c.socket));
 if(g.id==='case')return !!((b&&RK[b.form]>RK[o.form])||(u&&u.lengthMm>o.gpuMaxMm));
 return false}
function over(g,o){return ui.on&&groups.filter(x=>x.id!==g.id).reduce((n,x)=>n+(optionFor(x)?.price||0),0)+o.price>ui.budget}
function listFor(g){let a=g.options.filter(o=>!ui.q||(o.name+' '+o.desc).toLowerCase().includes(ui.q));if(ui.hide)a=a.filter(o=>!bad(g,o));const k=o=>o.tier??o.gb??o.watts??o.price;if(ui.sort==='asc')a=[...a].sort((x,y)=>x.price-y.price);if(ui.sort==='desc')a=[...a].sort((x,y)=>y.price-x.price);if(ui.sort==='perf')a=[...a].sort((x,y)=>k(y)-k(x)||y.price-x.price);return a}
function budgetNote(){const n=$('budget-note'),bx=$('options');if(bx)bx.scrollTop=lastY;if(!n)return;const t=groups.reduce((s,x)=>s+(optionFor(x)?.price||0),0);n.textContent=!ui.on?'':t>ui.budget?'Sua build está '+fmt(t-ui.budget)+' acima do orçamento.':'Total '+fmt(t)+' · restam '+fmt(ui.budget-t)+' do seu orçamento.'}
function autoBuild(B){const O=id=>groups.find(g=>g.id===id).options,cheap=a=>[...a].sort((x,y)=>x.price-y.price),pick=(a,cap,f)=>{const ok=a.filter(o=>o.price<=cap);return ok.length?[...ok].sort((x,y)=>f(y)-f(x))[0]:cheap(a)[0]};
const cpu=pick(O('cpu'),B*.2,o=>o.tier*10000+o.price),board=pick(O('board').filter(o=>o.socket===cpu.socket),B*.11,o=>o.price),ram=pick(O('ram').filter(o=>o.memory===board.memory),B*.08,o=>o.price),ssd=pick(O('ssd'),B*.08,o=>o.price);
const gpu=pick(O('gpu').filter(o=>o.id!=='igpu'||cpu.igpu),B-cpu.price-board.price-ram.price-ssd.price-B*.12,o=>o.tier*10000+o.price);
let cs=O('case').filter(c=>RK[c.form]>=RK[board.form]&&c.gpuMaxMm>=gpu.lengthMm);if(!cs.length)cs=[...O('case')].sort((x,y)=>y.gpuMaxMm-x.gpuMaxMm).slice(0,1);const cas=pick(cs,B*.05,o=>o.price);
const need=Math.ceil(((cpu.watts||90)+gpu.power+110)*1.4/50)*50,ps=O('psu'),psu=cheap(ps.filter(p=>p.watts>=need))[0]||[...ps].sort((x,y)=>y.watts-x.watts)[0];
return [cas,board,cpu,ram,gpu,ssd,psu].map(o=>o.id).concat((catalog.cooler.find(c=>c.sockets.includes(cpu.socket)&&c.tdp>=(cpu.watts||90))||catalog.cooler.find(c=>c.sockets.includes(cpu.socket))||catalog.cooler[0]).id)}
$('q').oninput=e=>{ui.q=e.target.value.trim().toLowerCase();render()};$('sort').onchange=e=>{ui.sort=e.target.value;render()};$('hide').onchange=e=>{ui.hide=e.target.checked;render()};
$('budget').oninput=e=>{ui.budget=+e.target.value;ui.on=true;$('bval').textContent=fmt(ui.budget);render()};$('auto').onclick=()=>{ui.on=true;applyPreset(autoBuildCat(ui.budget))};
render();
// Controles de câmera fora da inicialização do Three.js.
function bindMobileZoom(){
 const out=$('zoomOut'), inside=$('zoomIn'), status=$('zoomStatus');
 function apply(delta){
  if(!viewer||typeof viewer.zoom!=='function'){
   if(status)status.textContent='Aguardando visualização 3D';
   return;
  }
  const dist=viewer.zoom(delta);
  if(status)status.textContent='Distância: '+dist.toFixed(1);
 }
 out?.addEventListener('click',()=>apply(1.5));
 inside?.addEventListener('click',()=>apply(-1.5));
}
bindMobileZoom();
async function init3D(){const target=$('scene');try{const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');target.replaceChildren();const inspectHud=document.createElement('div');inspectHud.className='raven-inspect-hud';inspectHud.hidden=true;const inspectTitle=document.createElement('strong');const inspectHint=document.createElement('span');inspectHint.textContent='Arraste para girar · use −/+ para aproximar';const inspectClose=document.createElement('button');inspectClose.type='button';inspectClose.textContent='✕ Voltar à montagem';inspectHud.append(inspectTitle,inspectHint,inspectClose);target.append(inspectHud);const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(4.2,2.1,6);camera.lookAt(0,0,0);const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,window.innerWidth<700?1.25:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;target.append(renderer.domElement);scene.add(new THREE.HemisphereLight(0xe6f7ff,0x384e51,3.1));const key=new THREE.DirectionalLight(0xffffff,3.8);key.position.set(4,7,6);scene.add(key);const fill=new THREE.DirectionalLight(0xd9f2ff,2.8);fill.position.set(-5,3,5);scene.add(fill);const rim=new THREE.PointLight(0xc2ff4d,13,12);rim.position.set(-4,3,-3);scene.add(rim);const root=new THREE.Group();scene.add(root);const materials={shell:new THREE.MeshStandardMaterial({color:0x191e23,metalness:.72,roughness:.3}),frame:new THREE.MeshStandardMaterial({color:0x333b40,metalness:.75,roughness:.34}),dark:new THREE.MeshStandardMaterial({color:0x0a1014,metalness:.3,roughness:.65}),pcb:new THREE.MeshStandardMaterial({color:0x183026,metalness:.3,roughness:.65}),silver:new THREE.MeshStandardMaterial({color:0x8c9ba3,metalness:.9,roughness:.26}),accent:new THREE.MeshStandardMaterial({color:0xbaff66,emissive:0x456f10,emissiveIntensity:.55,metalness:.35,roughness:.35}),glass:new THREE.MeshPhysicalMaterial({color:0x738a91,metalness:.15,roughness:.12,transparent:true,opacity:.025,depthWrite:false,side:THREE.DoubleSide})};function box(parent,w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m}function cylinder(parent,r,h,x,y,z,mat){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);parent.add(m);return m}const parts={};function part(id){const g=new THREE.Group();root.add(g);parts[id]=g;return g}const caseG=part('case');box(caseG,2.8,.13,1.65,0,-1.65,0,materials.shell);box(caseG,2.8,.13,1.65,0,1.65,0,materials.shell);box(caseG,.13,3.3,1.65,-1.34,0,0,materials.shell);box(caseG,.13,3.3,1.65,1.34,0,0,materials.shell);box(caseG,2.8,3.3,.12,0,0,-.8,materials.shell);box(caseG,2.8,3.3,.12,0,0,.8,materials.glass);for(let i=0;i<3;i++){const fan=cylinder(caseG,.35,.05,.6,1.05-i*1.02,-.67,materials.frame);const inner=cylinder(caseG,.26,.06,.6,1.05-i*1.02,-.6,materials.dark);for(let j=0;j<5;j++){const a=j*Math.PI*2/5;box(caseG,.12,.35,.02,.6+Math.cos(a)*.13,1.05-i*1.02+Math.sin(a)*.13,-.54,materials.silver).rotation.z=-a}}// 4.2: painel frontal com perfurações, vidro lateral e moldura iluminada.
const panelTrim=new THREE.MeshStandardMaterial({color:0x65737b,metalness:.82,roughness:.23});
for(let i=0;i<16;i++)for(let j=0;j<5;j++)box(caseG,.018,.09,.014,1.28,1.32-i*.175,-.52+j*.25,panelTrim);
for(const x of [-1.19,1.19])for(const y of [-1.49,1.49])box(caseG,.11,.10,.11,x,y,.83,materials.silver);
for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.36,.023,9,40),materials.accent);ring.position.set(.6,1.05-i*1.02,-.48);caseG.add(ring)}
const board=part('board');box(board,1.65,2.2,.10,-.33,0,-.48,materials.pcb);for(let i=0;i<10;i++)box(board,.15,.08,.03,-1+i*.19,-.85+(i%3)*.23,-.4,materials.silver);const cpu=part('cpu');box(cpu,.58,.58,.15,-.52,.44,-.27,materials.silver);box(cpu,.39,.39,.16,-.52,.44,-.15,materials.frame);const ram=part('ram');for(let i=0;i<2;i++){box(ram,.10,1.12,.18,.17+i*.17,.18,-.3,materials.dark);box(ram,.05,.96,.20,.17+i*.17,.18,-.19,materials.accent)}const gpu=part('gpu');box(gpu,1.95,.56,.46,-.02,-.7,.05,materials.frame);for(let i=0;i<2;i++){const fan=cylinder(gpu,.21,.02,-.45+i*.8,-.7,.32,materials.dark);for(let j=0;j<5;j++){const a=j*Math.PI*2/5;const blade=box(gpu,.09,.2,.025,-.45+i*.8+Math.cos(a)*.09,-.7+Math.sin(a)*.09,.35,materials.silver);blade.rotation.z=-a}}const ssd=part('ssd');box(ssd,.55,.13,.10,-.54,-.38,-.29,materials.silver);box(ssd,.41,.07,.11,-.54,-.38,-.21,materials.dark);const psu=part('psu');box(psu,1.12,.57,1.14,.52,-1.26,0,materials.frame);box(psu,.82,.05,.8,.52,-.96,0,materials.dark);// RAVEN 2.1 — detalhes de hardware procedural (modelos ilustrativos, não oficiais)
const detail={copper:new THREE.MeshStandardMaterial({color:0xb68a4c,metalness:.8,roughness:.32}),black:new THREE.MeshStandardMaterial({color:0x11161c,metalness:.4,roughness:.45}),white:new THREE.MeshStandardMaterial({color:0xd4e0e5,metalness:.65,roughness:.28}),chip:new THREE.MeshStandardMaterial({color:0x202a32,metalness:.25,roughness:.7}),led:new THREE.MeshStandardMaterial({color:0xbaff66,emissive:0x7aff00,emissiveIntensity:1.5}),blue:new THREE.MeshStandardMaterial({color:0x2d8ec7,metalness:.5,roughness:.3})};
// Gabinete: pés, estrutura, botões e frente ventilada
for(const x of [-1.05,1.05])for(const z of [-.57,.57])box(caseG,.34,.13,.35,x,-1.78,z,detail.black);
// Frente de vidro limpa: sem grelha horizontal obstruindo os componentes.

for(const x of [-1.2,1.2])box(caseG,.05,3.15,.05,x,0,.85,materials.silver);
box(caseG,.34,.025,.22,.78,1.75,.42,detail.black);
const power=cylinder(caseG,.045,.018,.78,1.77,.42,detail.led);power.rotation.x=0;
// Placa-mãe: trilhas, capacitores, slots PCIe, VRMs e dissipadores
for(let i=0;i<18;i++){const xx=-1.08+(i%9)*.18,yy=-.96+Math.floor(i/9)*1.85;box(board,.075,.1,.038,xx,yy,-.405,detail.chip)}
for(let i=0;i<18;i++){const xx=-1.04+(i%6)*.29, yy=-.83+Math.floor(i/6)*.2;box(board,.18,.012,.018,xx,yy,-.407,detail.copper)}
for(let i=0;i<8;i++){box(board,.07,.28,.08,-1.07+i*.115,.95,-.38,materials.silver)}
for(let i=0;i<4;i++)box(board,.042,1.36,.065,.13+i*.115,.15,-.37,detail.black);
for(let i=0;i<3;i++)box(board,1.35,.07,.07,-.38,-.46-i*.17,-.35,detail.black);
for(let i=0;i<7;i++)box(board,.07,.07,.07,-1.03+i*.17,.25,-.38,detail.copper);
// CPU: moldura metálica, die e trava
box(cpu,.69,.69,.045,-.52,.44,-.2,detail.white);
box(cpu,.43,.43,.035,-.52,.44,-.13,materials.silver);
box(cpu,.025,.78,.06,-.12,.44,-.22,detail.copper);
// RAM: chips e contatos dourados
for(let r=0;r<2;r++){const x=.17+r*.17;for(let k=0;k<6;k++)box(ram,.055,.115,.027,x,-.26+k*.16,-.155,detail.chip);for(let k=0;k<7;k++)box(ram,.055,.027,.03,x,-.37+k*.15,-.12,detail.copper);box(ram,.12,.07,.20,x,.77,-.3,detail.led)}
// GPU: backplate, aletas, parafusos, bordas e alimentação
box(gpu,2.04,.62,.035,-.02,-.7,-.20,detail.black);
box(gpu,2.06,.08,.50,-.02,-.37,.05,detail.black);
box(gpu,2.06,.08,.50,-.02,-1.02,.05,detail.black);
for(let i=0;i<22;i++)box(gpu,.023,.42,.25,-.93+i*.088,-.7,.04,materials.silver);
for(let i=0;i<2;i++){const x=-.45+i*.8;const ring=new THREE.Mesh(new THREE.TorusGeometry(.23,.026,8,40),materials.silver);ring.position.set(x,-.7,.37);gpu.add(ring);const hub=cylinder(gpu,.07,.05,x,-.7,.39,detail.white);for(let k=0;k<7;k++){const a=k*Math.PI*2/7;const blade=box(gpu,.105,.19,.027,x+Math.cos(a)*.11,-.7+Math.sin(a)*.11,.4,detail.black);blade.rotation.z=-a}}
for(let i=0;i<3;i++)box(gpu,.07,.12,.09,.55+i*.12,-.33,.03,detail.copper);
// SSD M.2: chips, etiquetas e contatos
box(ssd,.58,.16,.018,-.54,-.38,-.22,detail.black);
for(let i=0;i<3;i++)box(ssd,.10,.11,.024,-.72+i*.16,-.38,-.2,detail.chip);
box(ssd,.055,.12,.027,-.29,-.38,-.18,detail.copper);
// PSU: grelha superior e conectores
const psuRing=new THREE.Mesh(new THREE.TorusGeometry(.34,.028,8,36),materials.silver);psuRing.rotation.x=Math.PI/2;psuRing.position.set(.52,-.94,0);psu.add(psuRing);
for(let i=0;i<7;i++)box(psu,.78,.015,.016,.52,-.92,-.3+i*.1,materials.silver);
for(let i=0;i<4;i++)box(psu,.1,.09,.04,.22+i*.18,-1.25,.59,detail.black);
// RAVEN 2.2 — detalhes visuais adicionais, sem modelos externos.
const railMat=new THREE.MeshStandardMaterial({color:0x9ce85b,emissive:0x4d9c21,emissiveIntensity:.85,metalness:.25});
const brushed=new THREE.MeshStandardMaterial({color:0x505d65,metalness:.84,roughness:.32});
for(const x of [-1.25,1.25])box(caseG,.028,3.0,.035,x,0,.765,brushed);
for(const x of [-1.18,1.18])box(caseG,.018,2.75,.022,x,0,.785,railMat);
for(let i=0;i<11;i++){const x=-1.05+(i%6)*.33,y=-.9+Math.floor(i/6)*1.55;box(board,.22,.009,.008,x,y,-.395,detail.copper)}
for(let i=0;i<9;i++){box(board,.018,.28,.012,-1.05+i*.23,.62-(i%3)*.18,-.39,detail.copper)}
for(let i=0;i<8;i++)box(gpu,.18,.025,.035,-.83+i*.235,-.39,.23,brushed);
for(let i=0;i<4;i++)box(psu,.17,.015,.02,.18+i*.21,-1.42,.6,materials.silver);
for(const y of [1.05,.03,-.99]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.315,.019,8,40),railMat);ring.position.set(.6,y,-.49);caseG.add(ring)}
// Suporte horizontal do vidro, linhas discretas no lugar de grades.
box(caseG,2.55,.035,.035,0,-1.52,.825,brushed);
box(caseG,2.55,.035,.035,0,1.52,.825,brushed);
// RAVEN 4.1 — Studio Edition: componentes procedurais detalhados, sem marcas oficiais.
const studioMat={matte:new THREE.MeshStandardMaterial({color:0x20262b,metalness:.45,roughness:.58}),mesh:new THREE.MeshStandardMaterial({color:0x353f45,metalness:.62,roughness:.48,side:THREE.DoubleSide}),gold:new THREE.MeshStandardMaterial({color:0xc4a16a,metalness:.83,roughness:.24}),rubber:new THREE.MeshStandardMaterial({color:0x0a0e11,roughness:.9}),blade:new THREE.MeshStandardMaterial({color:0x78858b,metalness:.7,roughness:.4})};
// Estrutura: pés, parafusos, entradas de ar e painel superior.
for(const x of [-1.05,1.05])for(const z of [-.57,.57])box(caseG,.28,.11,.28,x,-1.77,z,studioMat.rubber);
for(let i=0;i<18;i++)box(caseG,1.35,.009,.035,-.50,1.726,-.59+i*.07,studioMat.mesh);
for(let i=0;i<21;i++)box(caseG,.028,.10,.022,1.383,-1.28+i*.126,.42,studioMat.mesh);
for(const x of [-1.22,1.22])for(const y of [-1.48,1.48]){const screw=cylinder(caseG,.027,.013,x,y,.835,studioMat.gold);screw.rotation.x=Math.PI/2;}
// I/O: USB, áudio e botão de energia no topo.
for(let i=0;i<2;i++)box(caseG,.11,.012,.052,.52+i*.22,1.728,.43,studioMat.rubber);
const powerButton=cylinder(caseG,.067,.015,.99,1.728,.45,materials.accent);powerButton.rotation.x=0;
// Placa-mãe: trilhas, VRM, capacitores, slots PCIe e conectores.
for(let i=0;i<12;i++){const x=-1.04+(i%6)*.27;const y=-.95+Math.floor(i/6)*.12;box(board,.20,.018,.012,x,y,-.395,studioMat.gold)}
for(let i=0;i<7;i++)box(board,.095,.13,.095,-1.03+i*.15,.99,-.34,studioMat.matte);
for(let i=0;i<5;i++)box(board,.29,.026,.022,-1.00+i*.29,-.28,-.37,studioMat.rubber);
for(let i=0;i<5;i++)box(board,.045,.13,.038,-1.05+i*.13,.1,-.36,studioMat.gold);
// RAM: dissipadores e contatos dourados.
for(let i=0;i<2;i++){const x=.17+i*.17;for(let k=0;k<10;k++)box(ram,.075,.014,.008,x,-.29+k*.105,-.075,studioMat.gold);box(ram,.095,.10,.20,x,.68,-.22,studioMat.matte)}
// GPU: dissipador com aletas, backplate, conectores de energia.
for(let i=0;i<20;i++)box(gpu,.022,.36,.33,-.91+i*.095,-.70,.045,studioMat.blade);
box(gpu,1.91,.045,.47,-.02,-.385,.05,studioMat.matte);
for(let i=0;i<2;i++)box(gpu,.12,.09,.12,.52+i*.17,-.31,-.01,studioMat.gold);
for(let i=0;i<6;i++)box(gpu,.13,.014,.018,-.75+i*.27,-.99,.12,studioMat.gold);
// Fonte e SSD: texturas geométricas e parafusos.
for(let i=0;i<13;i++)box(psu,.016,.18,.025,-.02+i*.085,-1.26,.595,studioMat.mesh);
for(const x of [-.43,-.08])for(const y of [-.43,-.33])box(ssd,.025,.025,.014,x,y,-.145,studioMat.gold);
// Cooler de torre visível apenas quando selecionado.
const cooler=part('cooler');
for(let i=0;i<13;i++)box(cooler,.69,.025,.37,-.52,.12+i*.052,-.045,studioMat.blade);
for(const x of [-.74,-.30]){const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.78,10),studioMat.gold);pipe.position.set(x,.43,-.035);cooler.add(pipe)}
const coolerFan=cylinder(cooler,.285,.075,-.52,.43,.18,studioMat.rubber);
const coolerRing=new THREE.Mesh(new THREE.TorusGeometry(.26,.021,8,40),materials.accent);coolerRing.position.set(-.52,.43,.235);cooler.add(coolerRing);
for(let k=0;k<7;k++){const a=k*Math.PI*2/7;const blade=box(cooler,.105,.19,.017,-.52+Math.cos(a)*.11,.43+Math.sin(a)*.11,.245,studioMat.blade);blade.rotation.z=-a;}
// Cabos internos discretos, representados por curvas suaves.
function studioCable(points,material,radius=.018){const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,22,radius,6,false),material);root.add(mesh);return mesh;}
const studioCables=[studioCable([[.6,-1.05,.22],[1.0,-.6,.20],[.95,.25,-.30],[.64,.55,-.30]],studioMat.rubber),studioCable([[.65,-1.06,.3],[.90,-.8,.46],[.45,-.5,.36],[.42,-.34,.10]],studioMat.rubber)];

// RAVEN 4.4 — Studio Rebuild: elementos independentes, sem redeclarar variáveis anteriores.
const raven44={rotors:[],styles:[],glass:[],panorama:[],mesh:[],aio:[],decor:[]};
const raven44Mat={white:new THREE.MeshStandardMaterial({color:0xe7eef3,metalness:.55,roughness:.27}),black:new THREE.MeshStandardMaterial({color:0x131a20,metalness:.7,roughness:.32}),titanium:new THREE.MeshStandardMaterial({color:0x899ca9,metalness:.82,roughness:.27}),carbon:new THREE.MeshStandardMaterial({color:0x20282e,metalness:.45,roughness:.55}),glow:new THREE.MeshStandardMaterial({color:0xc2ff4d,emissive:0x6de81e,emissiveIntensity:1.4}),glass:new THREE.MeshPhysicalMaterial({color:0xa8c8d7,transparent:true,opacity:.11,metalness:.04,roughness:.08,depthWrite:false,side:THREE.DoubleSide})};
// Detalhes de gabinete e painéis removíveis por estilo.
for(let i=0;i<17;i++){const bar=box(caseG,.018,.11,.025,1.403,1.35-i*.17,-.43,raven44Mat.titanium);raven44.mesh.push(bar)}
for(let i=0;i<7;i++){const bar=box(caseG,.025,2.95,.018,-1.22+i*.40,0,.85,raven44Mat.glass);raven44.panorama.push(bar)}
const raven44PanoramaGlass=box(caseG,2.50,3.03,.018,0,0,.858,raven44Mat.glass);raven44.panorama.push(raven44PanoramaGlass);
for(let i=0;i<10;i++){const vent=box(caseG,1.7,.014,.026,-.25,1.73,-.57+i*.12,raven44Mat.titanium);raven44.decor.push(vent)}
// Ventoinhas tridimensionais: rotor e pás giram juntos, sem recriar geometrias a cada frame.
function raven44Fan(parent,x,y,z,r,orientation='front'){
 const housing=new THREE.Group();housing.position.set(x,y,z);parent.add(housing);
 const frame=new THREE.Mesh(new THREE.TorusGeometry(r,.052,10,48),raven44Mat.carbon);housing.add(frame);
 const light=new THREE.Mesh(new THREE.TorusGeometry(r*.86,.022,8,48),raven44Mat.glow);housing.add(light);
 const rotor=new THREE.Group();housing.add(rotor);
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(r*.19,r*.19,.075,24),raven44Mat.titanium);hub.rotation.x=Math.PI/2;rotor.add(hub);
 for(let j=0;j<7;j++){const blade=new THREE.Mesh(new THREE.BoxGeometry(r*.30,r*.72,.045),raven44Mat.titanium);blade.position.y=r*.37;blade.rotation.z=-.32;const pivot=new THREE.Group();pivot.rotation.z=j*Math.PI*2/7;pivot.add(blade);rotor.add(pivot)}
 if(orientation==='top')housing.rotation.x=-Math.PI/2;
 raven44.rotors.push(rotor);return housing;
}
for(const y of [1.04,.03,-.98])raven44Fan(caseG,.60,y,-.36,.30);
for(const x of [-.73,.02,.77])raven44Fan(caseG,x,1.53,-.07,.24,'top');
// Water cooler ilustrativo com radiador, bomba e tubos curvos.
const raven44Aio=new THREE.Group();root.add(raven44Aio);raven44.aio.push(raven44Aio);
box(raven44Aio,1.90,.18,.66,0,1.42,-.10,raven44Mat.black);
for(let i=0;i<23;i++)box(raven44Aio,1.70,.018,.46,0,1.31+i*.007,-.10,raven44Mat.titanium);
const raven44Pump=cylinder(raven44Aio,.27,.15,-.52,.44,.24,raven44Mat.black);
const raven44PumpRing=new THREE.Mesh(new THREE.TorusGeometry(.21,.035,12,48),raven44Mat.glow);raven44PumpRing.position.set(-.52,.44,.33);raven44Aio.add(raven44PumpRing);
for(const offset of [-.09,.09]){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.36+offset,.49,.28),new THREE.Vector3(.18+offset,.92,.49),new THREE.Vector3(.65+offset,1.28,.34),new THREE.Vector3(.72+offset,1.42,.04)]);raven44Aio.add(new THREE.Mesh(new THREE.TubeGeometry(curve,32,.034,8,false),raven44Mat.carbon))}
// GPU reforçada: três ventoinhas e backplate com acabamento premium.
for(const x of [-.62,0,.62])raven44Fan(gpu,x,-.70,.44,.175);
for(let i=0;i<26;i++)box(gpu,.018,.40,.23,-.92+i*.075,-.70,.05,raven44Mat.titanium);
box(gpu,1.98,.055,.43,-.02,-.37,.09,raven44Mat.black);
for(const x of [-.75,.75])box(gpu,.12,.06,.05,x,-.37,.36,raven44Mat.glow);
// SSD e RAM: rótulos geométricos e dissipadores com relevo.
for(const x of [.17,.34]){box(ram,.095,1.0,.045,x,.18,-.08,raven44Mat.titanium);for(let i=0;i<9;i++)box(ram,.075,.022,.012,x,-.28+i*.11,-.047,raven44Mat.black)}
for(let i=0;i<4;i++)box(ssd,.08,.12,.025,-.75+i*.15,-.38,-.17,raven44Mat.carbon);
// Piso de exposição e assinatura luminosa do gabinete.
const raven44Base=box(caseG,3.04,.06,1.89,0,-1.84,0,raven44Mat.carbon);raven44.decor.push(raven44Base);
for(const x of [-1.41,1.41])box(caseG,.026,2.92,.025,x,0,.83,raven44Mat.glow);
function raven44Update(){
 const group=groups.find(g=>g.id==='case');const selected=group?.options.find(o=>o.id===chosen.case);
 const white=!!selected&&(selected.finish==='white'||/branco|white/i.test(selected.name));
 const panoramic=!!selected&&/panor|aquar|o11|evo|vision|glass/i.test(selected.name+' '+(selected.desc||''));
 const compact=!!selected&&selected.form==='ITX';
 raven44Mat.titanium.color.set(white?0xd6e0e8:0x84949e);
 raven44Mat.carbon.color.set(white?0xb8c7d1:0x20282e);
 raven44Mat.black.color.set(white?0xe2e8ed:0x131a20);
 raven44.panorama.forEach(o=>o.visible=panoramic);
 raven44.mesh.forEach(o=>o.visible=!panoramic);
 raven44.aio.forEach(o=>o.visible=!!chosen.cooler&&/water|aio|líquid|liquid|radiador/i.test(groups.find(g=>g.id==='cooler')?.options.find(o=>o.id===chosen.cooler)?.name||''));
 cooler.visible=!!chosen.cooler&&!raven44Aio.visible;
 caseG.scale.x=compact?.86:1;
}

// RAVEN 4.6 — Biblioteca procedural de familias de hardware.
// As variacoes sao derivadas dos atributos do catalogo, nao sao replicas CAD.
const raven46={groups:{},rotors:[],metal:new THREE.MeshStandardMaterial({color:0x7f929e,metalness:.82,roughness:.31}),
 copper:new THREE.MeshStandardMaterial({color:0xc38b51,metalness:.84,roughness:.29}),
 white:new THREE.MeshStandardMaterial({color:0xe7f0f5,metalness:.58,roughness:.31}),
 graphite:new THREE.MeshStandardMaterial({color:0x151e27,metalness:.65,roughness:.42}),
 led:new THREE.MeshStandardMaterial({color:0xbaff66,emissive:0x70dd22,emissiveIntensity:1.2})};
function v46group(key,parent){const g=new THREE.Group();parent.add(g);raven46.groups[key]=g;return g}
function v46fan(parent,x,y,z,r){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.032,8,32),raven46.graphite);g.add(ring);
 const rotor=new THREE.Group();g.add(rotor);raven46.rotors.push(rotor);
 cylinder(rotor,r*.17,.055,0,0,.018,raven46.metal);
 for(let i=0;i<7;i++){const pivot=new THREE.Group();pivot.rotation.z=i*Math.PI*2/7;rotor.add(pivot);const blade=box(pivot,r*.36,r*.65,.022,0,r*.4,.018,raven46.metal);blade.rotation.z=-.35}
 return g}
// Gabinete: tres familias de frente e acabamento; perfis laterais de vidro.
const meshFront=v46group('caseMesh',caseG);
for(let i=0;i<30;i++)box(meshFront,.018,2.90,.018,1.415,-0.01,-.72+i*.049,raven46.metal);
const panoramaFront=v46group('casePanorama',caseG);
box(panoramaFront,.018,2.92,1.42,1.413,0,.015,raven44Mat.glass);
for(const y of [-1.43,1.43])box(panoramaFront,.024,.028,1.45,1.425,y,.015,raven46.metal);
const solidFront=v46group('caseSolid',caseG);
for(let i=0;i<6;i++)box(solidFront,.025,.31,1.3,1.414,-1.03+i*.42,0,raven46.graphite);
// GPU: carenagem extra, tres configuracoes de ventoinhas e dissipador.
const gpuDual=v46group('gpuDual',gpu),gpuTriple=v46group('gpuTriple',gpu),gpuCompact=v46group('gpuCompact',gpu);
for(const [g,positions,r] of [[gpuCompact,[0],.22],[gpuDual,[-.48,.48],.21],[gpuTriple,[-.69,0,.69],.19]]){
 box(g,2.15,.72,.08,-.02,-.69,.47,raven46.graphite);
 for(const x of positions)v46fan(g,x,-.70,.535,r);
 for(let i=0;i<14;i++)box(g,.018,.54,.07,-.96+i*.145,-.69,.43,raven46.metal);
}
// RAM: dissipadores e barra RGB selecionavel.
const ramRgb=v46group('ramRgb',ram),ramPlain=v46group('ramPlain',ram);
for(const x of [.17,.34]){box(ramRgb,.115,1.10,.09,x,.13,-.12,raven46.graphite);box(ramRgb,.12,.085,.10,x,.72,-.12,raven46.led);
 box(ramPlain,.115,1.10,.09,x,.13,-.12,raven46.metal)}
// CPU: heatspreader diferenciado por familia de socket.
const cpuAm5=v46group('cpuAm5',cpu),cpuIntel=v46group('cpuIntel',cpu),cpuLegacy=v46group('cpuLegacy',cpu);
box(cpuAm5,.46,.46,.08,-.52,.44,-.04,raven46.metal);
for(const x of [-.76,-.28])for(const y of [.2,.68])box(cpuAm5,.09,.08,.09,x,y,-.035,raven46.copper);
box(cpuIntel,.53,.48,.07,-.52,.44,-.04,raven46.metal);
box(cpuLegacy,.40,.40,.065,-.52,.44,-.04,raven46.copper);
// SSD: familia M.2 e SATA/HD com proporcoes diferentes.
const storageM2=v46group('storageM2',ssd),storageSata=v46group('storageSata',ssd);
box(storageM2,.75,.15,.035,-.55,-.37,-.12,raven46.graphite);
for(let i=0;i<4;i++)box(storageM2,.12,.12,.04,-.82+i*.16,-.37,-.08,raven46.metal);
box(storageSata,.76,.56,.11,-.55,-.38,-.06,raven46.graphite);
box(storageSata,.62,.27,.013,-.55,-.38,.004,raven46.metal);
// Fonte: familias modular e compacta, grelha e tomadas traseiras.
const psuPremium=v46group('psuPremium',psu),psuBasic=v46group('psuBasic',psu);
for(let i=0;i<8;i++)box(psuPremium,.022,.38,.024,.16+i*.12,-1.23,.64,raven46.metal);
for(let i=0;i<5;i++)box(psuBasic,.12,.13,.028,.24+i*.16,-1.21,.64,raven46.graphite);
// Cooler: perfil baixo, torre dupla e AIO (AIO principal ja existente).
const coolerLow=v46group('coolerLow',cooler),coolerTower=v46group('coolerTower',cooler);
for(let i=0;i<9;i++)box(coolerLow,.70,.018,.58,-.52,.18+i*.025,.02,raven46.metal);
for(let i=0;i<16;i++)box(coolerTower,.83,.023,.52,-.52,.12+i*.052,-.025,raven46.metal);
function raven46Update(pick){
 const cs=pick('case'),gp=pick('gpu'),bd=pick('board'),cpuPart=pick('cpu'),ramPart=pick('ram'),ssdPart=pick('ssd'),psuPart=pick('psu'),coolerPart=pick('cooler');
 const cn=(cs?.name||'').toLowerCase();const panoramic=/panoram|aquar|o11|vision|glass|vidro duplo/.test(cn);
 const mesh=/mesh|airflow|flow|ventilad|grade|frontal perfurad/.test(cn);
 meshFront.visible=!panoramic&&mesh;panoramaFront.visible=panoramic;solidFront.visible=!panoramic&&!mesh;
 const white=cs?.finish==='white'||/branco|white|snow/.test(cn);
 raven46.metal.color.set(white?0xb6c9d4:0x7f929e);
 const gpuName=(gp?.name||'').toLowerCase();const len=gp?.lengthMm||0;
 gpuCompact.visible=!!gp&&gp.id!=='igpu'&&(len<215||/1030|1650|compact|mini/.test(gpuName));
 gpuTriple.visible=!!gp&&gp.id!=='igpu'&&!gpuCompact.visible&&(len>=275||/triple|trio|3 fan/.test(gpuName));
 gpuDual.visible=!!gp&&gp.id!=='igpu'&&!gpuCompact.visible&&!gpuTriple.visible;
 const socket=cpuPart?.socket||'';cpuAm5.visible=socket==='AM5';cpuIntel.visible=/LGA/.test(socket);cpuLegacy.visible=!!socket&&!cpuAm5.visible&&!cpuIntel.visible;
 const rgb=/rgb|argb|led|iluminad/i.test(ramPart?.name||'');ramRgb.visible=!!ramPart&&rgb;ramPlain.visible=!!ramPart&&!rgb;
 const storageName=(ssdPart?.name||'').toLowerCase();storageSata.visible=!!ssdPart&&/sata|hd |hdd|2.5/.test(storageName);storageM2.visible=!!ssdPart&&!storageSata.visible;
 psuPremium.visible=!!psuPart&&(psuPart.watts>=750||/gold|platinum|modular/i.test(psuPart.name));psuBasic.visible=!!psuPart&&!psuPremium.visible;
 const coolerName=(coolerPart?.name||'').toLowerCase();coolerLow.visible=!!coolerPart&&/stock|box|baixo|low profile/.test(coolerName);
 coolerTower.visible=!!coolerPart&&!coolerLow.visible&&!/aio|water|líquid|liquid|radiador/.test(coolerName);
 if(bd)board.scale.x=bd.form==='ITX'?.77:bd.form==='mATX'?.91:1;
}

// RAVEN 4.8 — assinatura geométrica determinística por SKU.
// Cada identificador gera um conjunto exclusivo de relevos, circuitos, grelhas,
// acabamentos e detalhes. Não é uma reprodução oficial do fabricante.
const raven48={active:{}, ids:{},rotors:[]};
function raven48Hash(str){let h=2166136261;for(const c of String(str)){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0}
function raven48Rand(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
function raven48Material(hex,metal=.55){return new THREE.MeshStandardMaterial({color:hex,metalness:metal,roughness:.32})}
function raven48Dispose(group){group.traverse(obj=>{if(obj.isMesh){obj.geometry?.dispose();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material?.dispose()}});group.removeFromParent()}
function raven48Build(kind,item){
 const g=new THREE.Group(),rand=raven48Rand(raven48Hash(kind+':'+item.id)),n=(a,b)=>a+(b-a)*rand();
 const finish=/branco|white|snow/i.test(item.name)||item.finish==='white';
 const body=raven48Material(finish?0xdbe5ed:0x202b34,.78),metal=raven48Material(finish?0x8fa9b7:0x657d8d,.88);
 const bright=raven48Material([0xbaff66,0x55d9ed,0xffb15c,0x9d8aff,0xff5c91][Math.floor(rand()*5)],.35);
 bright.emissive=bright.color.clone().multiplyScalar(.25);
 const dark=raven48Material(0x10161b,.48),gold=raven48Material(0xb49a69,.85);
 const cube=(w,h,d,x,y,z,mat=body)=>box(g,w,h,d,x,y,z,mat);
 const stud=(x,y,z,r=.022,mat=metal)=>{const o=cylinder(g,r,.022,x,y,z,mat);o.rotation.x=Math.PI/2};
 const fan=(x,y,z,r)=>{const fg=new THREE.Group();fg.position.set(x,y,z);g.add(fg);const rim=new THREE.Mesh(new THREE.TorusGeometry(r,.027,8,28),metal);fg.add(rim);const rotor=new THREE.Group();fg.add(rotor);const hub=new THREE.Mesh(new THREE.CylinderGeometry(r*.19,r*.19,.035,14),bright);hub.rotation.x=Math.PI/2;rotor.add(hub);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const b=new THREE.Mesh(new THREE.BoxGeometry(r*.32,r*.68,.018),body);b.position.set(Math.cos(a)*r*.43,Math.sin(a)*r*.43,.016);b.rotation.z=a-.35;rotor.add(b)}raven48.rotors.push(rotor)};
 if(kind==='case'){
  const mesh=/mesh|airflow|flow|grade/i.test(item.name),pan=/panoram|glass|aquar|vision|dual chamber/i.test(item.name);
  const count=mesh?34:pan?4:10;
  for(let i=0;i<count;i++){const y=-1.32+(i+.5)*2.64/count;cube(.022,mesh?.027:.045,n(.05,.10),1.433,y,-.52+n(-.13,.13),i%5===0?bright:metal)}
  for(let i=0;i<6;i++){const x=-1.12+i*.44;cube(.20,.016,.024,x,1.77,-.46+n(0,.6),i%3===0?bright:dark)}
  if(pan){cube(.025,2.8,1.48,1.43,0,.04,metal);for(let i=0;i<4;i++)stud(1.46,-1.1+i*.72,.65,.034,bright)}
  else {for(let i=0;i<3;i++)cube(.024,.12,.7,1.43,-1+i*.92,.15,bright)}
  for(let i=0;i<4;i++)stud(-1.23,-1.40+i*.94,.87,.026,gold);
 }else if(kind==='board'){
  const cols=item.form==='ITX'?5:item.form==='mATX'?8:11;
  for(let i=0;i<cols*3;i++){const x=-1.03+(i%cols)*1.48/cols,y=-.95+Math.floor(i/cols)*.60+n(-.08,.08);cube(n(.035,.15),.012,.016,x,y,-.285,i%7===0?bright:gold)}
  for(let i=0;i<6;i++)cube(.14,.09,.07,-1.04+i*.18,.88,-.25,i%2?dark:metal);
  for(let i=0;i<4;i++)cube(.06,.24,.06,.67,-.7+i*.38,-.29,bright);
 }else if(kind==='cpu'){
  const intel=/LGA/.test(item.socket||'');const size=intel?.56:.49;
  cube(size,size,.035,-.52,.44,-.005,metal);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;cube(.07,.06,.025,-.52+Math.cos(a)*size*.36,.44+Math.sin(a)*size*.36,.026,gold)}
  for(let i=0;i<4;i++)cube(.065,.013,.012,-.68+i*.11,.39+n(-.1,.13),.033,bright);
 }else if(kind==='ram'){
  const sticks=/4\s*[x×]|4x|quad/i.test(item.name)?4:2;
  for(let j=0;j<sticks;j++){const x=.13+j*.13;cube(.11,1.10,.075,x,.14,.015,j%2?body:metal);for(let k=0;k<7;k++)cube(.092,.035,.009,x,-.28+k*.14,.06,k%3===0?bright:dark);cube(.12,.045,.08,x,.72,.015,bright)}
 }else if(kind==='gpu'){
  if(item.id==='igpu')return g;
  const count=(item.lengthMm||230)>275?3:(item.lengthMm||230)<180?1:2;
  const length=count===3?2.15:count===2?1.72:1.15;
  cube(length,.72,.07,-.02,-.70,.57,body);
  for(let i=0;i<count;i++)fan(-.02+(i-(count-1)/2)*length/(count+.12),-.70,.635,Math.min(.25,length/(count*2.8)));
  for(let i=0;i<16;i++)cube(.012,.49,.08,-length*.46+i*length/16,-.70,.48,i%4===0?bright:metal);
  for(let i=0;i<5;i++)stud(-length*.4+i*length*.2,-.35,.58,.024,gold);
  cube(.28,.055,.09,length*.32,-.32,.50,bright);
 }else if(kind==='ssd'){
  const sata=/sata|hdd|hd |2.5/i.test(item.name);
  if(sata){cube(.78,.50,.075,-.52,-.39,.04,body);cube(.62,.32,.013,-.52,-.39,.087,metal)}
  else{cube(.78,.15,.04,-.52,-.38,.05,dark);for(let i=0;i<4;i++)cube(.12,.12,.025,-.78+i*.17,-.38,.085,i%2?metal:body)}
  for(let i=0;i<4;i++)cube(.065,.013,.01,-.72+i*.13,-.39,.11,bright);
 }else if(kind==='psu'){
  cube(.88,.59,.04,.52,-1.12,.64,body);
  const count=5+Math.floor(rand()*8);
  for(let i=0;i<count;i++)cube(.72,.016,.016,.52,-1.36+i*.49/count,.672,i%4===0?bright:dark);
  for(let i=0;i<3;i++)cube(.10,.065,.035,.24+i*.25,-1.42,.69,gold);
 }else if(kind==='cooler'){
  const aio=/aio|water|líquid|liquid|radiador/i.test(item.name),low=/stock|box|low|baixo/i.test(item.name);
  if(aio){cube(1.30,.30,.18,-.23,1.33,.03,dark);for(let i=0;i<2;i++)fan(-.65+i*.75,1.33,.16,.17);cube(.40,.40,.07,-.52,.44,.39,body);fan(-.52,.44,.45,.16)}
  else{const fins=low?7:16;for(let i=0;i<fins;i++)cube(low?.67:.82,.015,low?.35:.48,-.52,.11+i*(low?.035:.048),.22,metal);fan(-.52,.42,.49,low?.20:.28)}
 }
 return g;
}
function raven48Update(pick){
 for(const [kind,parent] of Object.entries(parts)){
  const item=pick(kind),id=item?.id||'';
  if(raven48.ids[kind]===id)continue;
  if(raven48.active[kind])raven48Dispose(raven48.active[kind]);
  raven48.ids[kind]=id;
  if(item){const overlay=raven48Build(kind,item);parent.add(overlay);raven48.active[kind]=overlay}else delete raven48.active[kind];
 }
}


// RAVEN 4.9 — Hardware Atelier: silhuetas especificas por SKU e referencias fisicas.
// Variacoes procedurais, nao replicas certificadas de fabricantes.
const atelier49={nodes:{},ids:{},animated:[]};
const at49mat=(c,metal=.55,rough=.38)=>new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
function atelier49Create(kind,item){
 const group=new THREE.Group();const seed=raven48Hash(kind+'|'+item.id),rng=raven48Rand(seed);
 const v=(a,b)=>a+(b-a)*rng();const name=(item.name||'').toLowerCase();
 const white=item.finish==='white'||/branco|white|snow|neve/.test(name);
 const shell=at49mat(white?0xe2e8eb:0x242d35,.68),edge=at49mat(white?0xaebcc7:0x6e8290,.84),black=at49mat(0x111820,.46),pcb=at49mat(0x183c31,.28,.65),copper=at49mat(0xc09b61,.83),
 led=at49mat([0xbaff66,0x5bc6ff,0xff8c61,0xd49cff][seed%4],.25,.24);
 led.emissive=led.color.clone().multiplyScalar(.45);
 const glass=new THREE.MeshPhysicalMaterial({color:0x9fb6c5,transparent:true,opacity:.18,metalness:.05,roughness:.07,depthWrite:false,side:THREE.DoubleSide});
 const b=(w,h,d,x,y,z,m=shell)=>box(group,w,h,d,x,y,z,m);
 const c=(r,h,x,y,z,m=edge)=>cylinder(group,r,h,x,y,z,m);
 const tor=(r,t,x,y,z,m=edge)=>{const q=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,32),m);q.position.set(x,y,z);group.add(q);return q};
 function fan(x,y,z,r,frame=edge){const fg=new THREE.Group();fg.position.set(x,y,z);group.add(fg);const outer=new THREE.Mesh(new THREE.TorusGeometry(r,.028,8,36),frame);fg.add(outer);const rotor=new THREE.Group();fg.add(rotor);const hub=new THREE.Mesh(new THREE.CylinderGeometry(r*.19,r*.19,.055,20),black);hub.rotation.x=Math.PI/2;rotor.add(hub);for(let i=0;i<7;i++){const pivot=new THREE.Group();pivot.rotation.z=i*Math.PI*2/7;const blade=new THREE.Mesh(new THREE.BoxGeometry(r*.28,r*.67,.024),shell);blade.position.y=r*.40;blade.rotation.z=-.35;pivot.add(blade);rotor.add(pivot)}atelier49.animated.push(rotor);return fg}
 if(kind==='case'){
  const panoramic=/panoram|aquar|glass|vision|dual chamber|o11/.test(name),mesh=/mesh|airflow|flow|ventilad|grade/.test(name);
  const mini=item.form==='ITX'||/mini|compact/.test(name);const width=mini?1.94:2.7,height=mini?2.55:3.18,depth=mini?1.3:1.65;
  const side=width/2,top=height/2;
  // Painel frontal, tampa superior e pés de dimensões variáveis.
  for(const x of [-side,side])b(.07,height,.08,x,0,.87,edge);
  for(const y of [-top,top])b(width,.065,.08,0,y,.87,edge);
  for(const x of [-side+.18,side-.18])b(.24,.10,.3,x,-top-.13,.36,black);
  if(panoramic){b(width-.18,height-.16,.018,0,0,.915,glass);b(.024,height-.13,depth,side+.03,0,.05,glass);for(const y of [-top+.08,top-.08])b(width,.025,.025,0,y,.935,edge)}
  else if(mesh){for(let i=0;i<36;i++)b(.024,.055,depth*.9,side+.08,-top+.09+i*(height-.18)/36,-.02,i%6===0?edge:black);for(const y of [-.83,0,.83])fan(side+.10,y,.0,.24,edge)}
  else{b(.05,height-.18,depth*.85,side+.06,0,-.02,shell);for(let i=0;i<5;i++)b(.025,.26,depth*.7,side+.1,-1+i*.5,-.02,black)}
  const topVents=mini?8:16;for(let i=0;i<topVents;i++)b(.10,.012,.52,-width*.40+i*width*.80/topVents,top+.035,-.08,black);
  for(let i=0;i<4;i++)c(.025,.018,side-.10,top+.05,.24+i*.10,i===0?led:edge);
 }else if(kind==='gpu'){
  if(item.id==='igpu')return group;
  const length=item.lengthMm||225;const fans=/founders|fe\b/.test(name)?2:length>=275?3:length<195?1:2;
  const w=Math.min(2.28,Math.max(1.02,length/140));const thick=item.power>=210?.90:.66;
  b(w,thick,.18,-.02,-.69,.55,shell);b(w-.09,thick-.10,.026,-.02,-.69,.665,black);
  for(let i=0;i<fans;i++){const x=-.02+(i-(fans-1)/2)*(w-.20)/fans;fan(x,-.69,.71,Math.min(.27,(w-.12)/(fans*2.35)))}
  for(let i=0;i<Math.min(22,Math.round(w*9));i++)b(.018,thick*.78,.12,-w*.47+i*w/Math.round(w*9),-.69,.42,edge);
  b(w,.048,.20,-.02,-.69+thick*.55,.51,edge);
  b(.25,.075,.10,w*.28,-.69+thick*.56,.52,copper);
  for(let i=0;i<3;i++)b(.06,.09,.035,-w*.30+i*.15,-.69-thick*.45,.56,led);
 }else if(kind==='board'){
  const form=item.form||'mATX',w=form==='ITX'?1.04:form==='ATX'?1.83:1.51,h=form==='ITX'?1.08:form==='ATX'?2.08:1.75;
  b(w,h,.052,-.37,-.04,-.22,pcb);
  const x0=-.37-w/2,y0=-.04-h/2;
  for(let i=0;i<7;i++)b(.19,.09,.09,x0+.14+i*(w-.27)/7,y0+h-.16,-.15,edge);
  b(.53,.52,.035,-.52,.43,-.15,edge);
  for(let i=0;i<(form==='ITX'?2:4);i++)b(.052,.70,.065,.08+i*.105,.18,-.13,black);
  for(let i=0;i<(form==='ATX'?4:2);i++)b(w*.70,.052,.055,-.40,y0+.24+i*.20,-.14,black);
  for(let i=0;i<35;i++){const x=x0+v(.08,w-.08),y=y0+v(.08,h-.08);b(v(.025,.12),.012,.014,x,y,-.115,i%5===0?copper:edge)}
  for(let i=0;i<6;i++)b(.065,.10,.07,x0+.13+i*.18,y0+h-.33,-.12,black);
 }else if(kind==='cpu'){
  const socket=item.socket||'',intel=/LGA/.test(socket),w=intel?.58:.52;
  b(w,w,.065,-.52,.44,.05,copper);b(w-.09,w-.09,.018,-.52,.44,.10,edge);
  for(let i=0;i<8;i++){const x=-.52-w*.43+i*w*.86/7;b(.025,.045,.015,x,.44-w*.40,.11,black);b(.025,.045,.015,x,.44+w*.40,.11,black)}
  if(socket==='AM5')for(const x of [-.52-w*.48,-.52+w*.48])b(.055,w*.50,.018,x,.44,.115,black);
 }else if(kind==='ram'){
  const count=/4\s*[x×]|quad|4x/.test(name)?4:/1\s*[x×]|single/.test(name)?1:2;
  const rgb=/rgb|argb|led/.test(name),tall=/heatsink|gamer|vengeance|fury|trident/.test(name);
  for(let i=0;i<count;i++){const x=.13+i*.13;b(.105,tall?1.12:.91,.07,x,.13,.08,pcb);b(.12,tall?1.03:.80,.045,x,.16,.13,i%2?shell:edge);for(let j=0;j<9;j++)b(.086,.023,.018,x,-.24+j*.09,.158,black);for(let j=0;j<9;j++)b(.09,.016,.015,x,-.34+j*.04,.03,copper);if(rgb)b(.12,.055,.07,x,.70,.13,led)}
 }else if(kind==='ssd'){
  const sata=/sata|hdd|hd |2\.5/.test(name),hdd=/hdd|hd |disco rigido/.test(name);
  if(sata){b(.83,.56,.11,-.54,-.39,.09,black);b(.68,.38,.018,-.54,-.39,.157,shell);if(hdd){tor(.17,.018,-.54,-.39,.175,edge);c(.04,.02,-.54,-.39,.18,copper)}}
  else{b(.82,.17,.03,-.54,-.38,.09,pcb);for(let i=0;i<4;i++)b(.14,.13,.027,-.80+i*.18,-.38,.12,black);for(let i=0;i<8;i++)b(.025,.018,.018,-.25+i*.024,-.38,.125,copper)}
 }else if(kind==='psu'){
  const modular=/modular|gold|platinum/.test(name),w=item.watts||550;
  b(.98,.60,.12,.52,-1.14,.72,shell);tor(.25,.027,.52,-1.14,.795,edge);for(let i=0;i<10;i++)b(.73,.014,.015,.52,-1.38+i*.05,.80,black);
  for(let i=0;i<(modular?8:4);i++)b(.085,.064,.02,.20+(i%4)*.20,-1.41+Math.floor(i/4)*.12,.80,black);
  b(.32,.055,.016,.52,-.81,.80,w>750?led:copper);
 }else if(kind==='cooler'){
  const aio=/aio|water|líquid|liquid|radiador/.test(name),low=/stock|box|low|baixo/.test(name),dual=/dual|duplo|nh-d15|assassin/.test(name);
  if(aio){const f=/360/.test(name)?3:/280|240/.test(name)?2:1;b(1.9,.20,.40,0,1.38,.07,black);for(let i=0;i<20;i++)b(1.75,.012,.27,0,1.29+i*.008,.09,edge);for(let i=0;i<f;i++)fan(-.63+(i-(f-1)/2)*.54,1.38,.30,.19);c(.24,.11,-.52,.44,.39,shell);tor(.19,.023,-.52,.44,.46,led);for(const o of [-.08,.08]){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.35+o,.43,.43),new THREE.Vector3(.10+o,.87,.54),new THREE.Vector3(.65+o,1.32,.28)]);group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,22,.029,7,false),black))}}
  else{const towers=dual?2:1,finCount=low?7:22;for(let t=0;t<towers;t++)for(let i=0;i<finCount;i++)b(dual?.38:.72,.014,low?.35:.46,-.52+(t-(towers-1)/2)*.43,.11+i*(low?.031:.037),.25,edge);for(let t=0;t<towers;t++)for(let j=0;j<3;j++){const x=-.52+(t-(towers-1)/2)*.43+(j-1)*.11;b(.024,low?.29:.84,.025,x,low?.28:.51,.06,copper)}fan(-.52,.42,.54,low?.20:.28)}
 }
 return group;
}
function atelier49Update(pick){for(const [kind,parent] of Object.entries(parts)){
 const item=pick(kind),id=item?.id||'';if(atelier49.ids[kind]===id)continue;
 if(atelier49.nodes[kind]){raven48Dispose(atelier49.nodes[kind]);delete atelier49.nodes[kind]}
 atelier49.ids[kind]=id;if(item){const node=atelier49Create(kind,item);parent.add(node);atelier49.nodes[kind]=node}
 }}

// Luzes de preenchimento para destacar os componentes internos
const fillLight=new THREE.PointLight(0xe9f5ff,13,8);fillLight.position.set(1,1,4);scene.add(fillLight);
const innerLight=new THREE.PointLight(0xf0f7ff,14,6);innerLight.position.set(0,.4,.2);scene.add(innerLight);
// RAVEN 4.6 — cenário de estúdio: piso abaixo da base, sem grade atravessando o gabinete.
const studioFloor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x080d12,roughness:.83,metalness:.08}));
studioFloor.rotation.x=-Math.PI/2;studioFloor.position.y=-2.14;scene.add(studioFloor);
const podium=new THREE.Group();scene.add(podium);
const podiumBase=new THREE.Mesh(new THREE.CylinderGeometry(2.55,2.7,.20,96),new THREE.MeshStandardMaterial({color:0x171f25,metalness:.73,roughness:.34}));podiumBase.position.y=-2.025;podium.add(podiumBase);
const podiumTop=new THREE.Mesh(new THREE.CylinderGeometry(2.48,2.48,.055,96),new THREE.MeshStandardMaterial({color:0x253039,metalness:.75,roughness:.27}));podiumTop.position.y=-1.9;podium.add(podiumTop);
const ringMat=new THREE.MeshStandardMaterial({color:0xbaff66,emissive:0x5b8b1c,emissiveIntensity:.8,metalness:.2,roughness:.24});
const ring=new THREE.Mesh(new THREE.TorusGeometry(2.49,.014,8,112),ringMat);ring.rotation.x=Math.PI/2;ring.position.y=-1.867;podium.add(ring);
const studioBack=new THREE.Mesh(new THREE.PlaneGeometry(120,90),new THREE.MeshBasicMaterial({color:0x0b1219}));studioBack.position.z=-18;scene.add(studioBack);
const spotL=new THREE.SpotLight(0xc3e8ff,36,18,Math.PI/5,.6);spotL.position.set(-5,7,4);spotL.target.position.set(0,-.6,0);scene.add(spotL,spotL.target);
const spotR=new THREE.SpotLight(0xbaff66,15,16,Math.PI/6,.65);spotR.position.set(5,5,-3);spotR.target.position.set(0,0,0);scene.add(spotR,spotR.target);
let yaw=-.88,pitch=.12,distance=window.innerWidth<700?8.4:5.35,dragging=false,prevX=0,prevY=0;const spread={cooler:[-.5,.9,1.4],case:[0,0,0],board:[-1.4,.3,-.7],cpu:[-.5,.7,1.2],ram:[.5,1.3,.8],gpu:[.2,-.6,1.5],ssd:[-1.4,-.4,.9],psu:[1.2,-.8,.7]};let expand=false;function update(){for(const [id,g] of Object.entries(parts))g.visible=id==='case'||!!chosen[id];studioCables.forEach(c=>c.visible=!!chosen.psu);
const pick=gid=>{const gr=groups.find(x=>x.id===gid);return gr&&gr.options.find(o=>o.id===chosen[gid])};
const gp=pick('gpu'),bd=pick('board'),cs=pick('case'),cp=pick('cpu');
if(chosen.gpu==='igpu')parts.gpu.visible=false;gpu.scale.x=gp?Math.max(.8,Math.min(1.12,gp.lengthMm/245)):1;gpu.scale.z=gp&&gp.power>200?1.2:1;
board.scale.y=bd&&bd.form==='mATX'?.9:1;
materials.shell.color.set(cs&&(cs.finish==='white'||/branco|white/i.test(cs.name))?0xe5eaf0:cs&&cs.id==='case2'?0x0f1316:0x191e23);materials.frame.color.set(cs&&(cs.finish==='white'||/branco|white/i.test(cs.name))?0xb8c3cc:0x333b40);
rim.color.set(cp&&cp.socket==='AM5'?0x4dd2ff:0xc2ff4d);raven44Update();raven46Update(pick);raven48Update(pick);atelier49Update(pick);for(const node of Object.values(raven48.active))node.visible=false;for(const key of ["gpuCompact","gpuDual","gpuTriple","storageM2","storageSata","coolerLow","coolerTower","ramPlain","ramRgb","cpuAm5","cpuIntel","cpuLegacy","psuPremium","psuBasic"]){if(raven46.groups[key])raven46.groups[key].visible=false}}function resize(){const w=Math.max(1,target.clientWidth),h=Math.max(1,target.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}new ResizeObserver(resize).observe(target);resize();renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;prevX=e.clientX;prevY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});renderer.domElement.addEventListener('pointerup',()=>dragging=false);renderer.domElement.addEventListener('pointercancel',()=>dragging=false);renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;yaw+=(e.clientX-prevX)*.007;pitch=Math.max(-.6,Math.min(.65,pitch+(e.clientY-prevY)*.006));prevX=e.clientX;prevY=e.clientY});renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(inspecting?2.3:4.9,Math.min(22,distance+e.deltaY*.007))},{passive:false});const activeTouches=new Map();let pinchSpan=null;renderer.domElement.style.touchAction='none';renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){activeTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(activeTouches.size===2){dragging=false;pinchSpan=null}}});renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||!activeTouches.has(e.pointerId))return;activeTouches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(activeTouches.size===2){const [a,b]=[...activeTouches.values()];const span=Math.hypot(a.x-b.x,a.y-b.y);if(pinchSpan!==null)distance=Math.max(inspecting?2.3:4.9,Math.min(22,distance*pinchSpan/Math.max(1,span)));pinchSpan=span;dragging=false}});for(const eventName of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(eventName,e=>{activeTouches.delete(e.pointerId);pinchSpan=null});let inspecting=null;const restoreParts=()=>{inspecting=null;inspectHud.hidden=true;podium.visible=true;studioFloor.visible=true;update();distance=window.innerWidth<700?8.4:5.35;};inspectClose.onclick=restoreParts;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&inspecting)restoreParts()});function isolate(){if(!inspecting)return;for(const [id,g] of Object.entries(parts))g.visible=(id===inspecting);podium.visible=false;studioFloor.visible=false;}let last=0;function animate(t){requestAnimationFrame(animate);const dt=Math.min((t-last)/1000||.016,.05);last=t;if(!dragging)yaw+=dt*.045;root.rotation.y=yaw;root.rotation.x=pitch;camera.position.set(0,1.0,distance);camera.lookAt(0,0,0);for(const [id,g] of Object.entries(parts)){const v=spread[id];const targetX=expand?v[0]:0,targetY=expand?v[1]:0,targetZ=expand?v[2]:0;const factor=Math.min(1,dt*5);g.position.x+=(targetX-g.position.x)*factor;g.position.y+=(targetY-g.position.y)*factor;g.position.z+=(targetZ-g.position.z)*factor}if(inspecting)isolate();for(const rotor of raven44.rotors)rotor.rotation.z+=dt*5.2;for(const rotor of raven46.rotors)if(rotor.parent?.visible)rotor.rotation.z+=dt*4.7;for(const rotor of raven48.rotors)if(rotor.parent?.visible)rotor.rotation.z+=dt*4.1;for(const rotor of atelier49.animated)if(rotor.parent?.visible)rotor.rotation.z+=dt*4.5;const col=rgb?tmp.setHSL((t/6000)%1,.9,.55):accentCol;detail.led.color.copy(col);detail.led.emissive.copy(col);railMat.color.copy(col);railMat.emissive.copy(col).multiplyScalar(.5);materials.accent.color.copy(col);materials.accent.emissive.copy(col).multiplyScalar(.4);rim.color.copy(col);raven44Mat.glow.color.copy(col);raven44Mat.glow.emissive.copy(col).multiplyScalar(.55);renderer.render(scene,camera)}let rgb=false;const accentCol=new THREE.Color(0xbaff66),tmp=new THREE.Color();update();requestAnimationFrame(animate);viewer={zoom(delta){distance=Math.max(inspecting?2.3:4.9,Math.min(22,distance+delta));return distance},inspect(id,name){if(!parts[id])return;update();inspecting=id;inspectTitle.textContent=name;inspectHud.hidden=false;isolate();yaw=-.6;pitch=.1;distance=id==='case'?(window.innerWidth<700?5.3:4.6):(window.innerWidth<700?3.9:3.1);expand=false;},closeInspect:restoreParts,update,explode(v){expand=v},accent(c){accentCol.set(c)},rgb(v){rgb=v},shot(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')},reset(){restoreParts();yaw=-.88;pitch=.12;distance=window.innerWidth<700?8.4:5.35;expand=false;exploded=false;$('explode').textContent='⇱ Explodir peças'}}}catch(e){target.innerHTML='<div class="loading" style="padding:25px;text-align:center">Não foi possível carregar o motor 3D. Conecte-se à internet e abra o projeto por um servidor local (Live Server). O configurador de peças continua funcionando.</div>';console.error('Falha no 3D:',e)}}init3D();

// 3.4 — lista de compras com preços explicitamente estimados.
const shoppingButton=document.getElementById('shopping');
if(shoppingButton)shoppingButton.addEventListener('click',async()=>{
 const items=groups.map(g=>({g,part:optionFor(g)}));
 const lines=['RAVEN PC BUILDER — LISTA DE COMPRAS (ESTIMATIVAS)','',...items.map(({g,part})=>`${g.name}: ${part?part.name+' — '+fmt(part.price):'NÃO SELECIONADO'}`),'','TOTAL ESTIMADO: '+fmt(items.reduce((n,x)=>n+(x.part?.price||0),0)),'','ATENÇÃO: valores ilustrativos, sem cotação. Confira modelo exato, BIOS, memória, cooler, conectores, garantia e frete.','Configuração: '+location.origin+location.pathname+shareHash()];
 const message=lines.join('\n');
 try{await navigator.clipboard.writeText(message);shoppingButton.textContent='✓ Lista copiada';setTimeout(()=>shoppingButton.textContent='Lista para WhatsApp',1800)}catch{prompt('Copie a lista para o WhatsApp:',message)}
});


// 3.6 Marketplace: somente ofertas cadastradas explicitamente, sem coleta automatizada.
const RAVEN_STORES={kabum:{name:'KaBuM!',domain:'kabum.com.br'},mercadolivre:{name:'Mercado Livre',domain:'mercadolivre.com.br'},terabyte:{name:'TerabyteShop',domain:'terabyteshop.com.br'},shopee:{name:'Shopee',domain:'shopee.com.br'}};
let ravenOffers=[];let ravenHistory=[];
function ravenMoney(n){return Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function ravenSearchUrl(part,store){return 'https://www.google.com/search?q='+encodeURIComponent('site:'+store.domain+' '+part.name);}
function ravenVerifiedOffer(o){
 if(!o||!RAVEN_STORES[o.store]||!o.partId||!Number.isFinite(o.price)||o.price<=0||!/^\d{4}-\d{2}-\d{2}$/.test(o.checkedAt||''))return false;
 try{const u=new URL(o.url);const host=u.hostname.toLowerCase();return u.protocol==='https:'&&(host===RAVEN_STORES[o.store].domain||host.endsWith('.'+RAVEN_STORES[o.store].domain));}catch{return false;}
}
function ravenDaysOld(date){const ms=Date.parse(date+'T00:00:00Z');return Number.isFinite(ms)?Math.max(0,Math.floor((Date.now()-ms)/86400000)):Infinity;}
function ravenFresh(o){return ravenDaysOld(o.checkedAt)<=14;}
function ravenRenderInsights(selected){
 const el=document.getElementById('marketInsights');if(!el)return;
 const matched=selected.flatMap(({part})=>ravenOffers.filter(o=>o.partId===part.id));
 const fresh=matched.filter(ravenFresh),stale=matched.length-fresh.length;
 const total=selected.reduce((sum,{part})=>{const prices=fresh.filter(o=>o.partId===part.id).map(o=>o.price);return sum+(prices.length?Math.min(...prices):0)},0);
 const covered=selected.filter(({part})=>fresh.some(o=>o.partId===part.id)).length;
 el.replaceChildren();
 for(const [label,value] of [['Peças com cotação recente',covered+' / '+selected.length],['Ofertas recentes',String(fresh.length)],['Cotações antigas',String(stale)],['Subtotal cotado',ravenMoney(total)]]){const item=document.createElement('div');item.className='market-insight';const a=document.createElement('small');a.textContent=label;const b=document.createElement('strong');b.textContent=value;item.append(a,b);el.append(item)}
 const note=document.createElement('p');note.className='market-hint';note.textContent='Cotação recente = consultada há até 14 dias. Subtotal exclui peças sem cotação recente, frete e taxas; não é preço final da montagem.';el.append(note);
}
function ravenCopyShopping(){
 const selected=groups.map(g=>({group:g,part:optionFor(g)})).filter(x=>x.part);
 const byStore=new Map();const missing=[];
 for(const {part} of selected){const available=ravenOffers.filter(o=>o.partId===part.id&&ravenFresh(o)).sort((a,b)=>a.price-b.price);if(!available.length){missing.push(part.name);continue;}const best=available[0];const store=RAVEN_STORES[best.store].name;if(!byStore.has(store))byStore.set(store,[]);byStore.get(store).push({part,best});}
 const lines=['RAVEN PC BUILDER — Lista de compras por loja','Cotações cadastradas, não são preços em tempo real.'];let subtotal=0;
 for(const [store,items] of byStore){lines.push('\n'+store);for(const {part,best} of items){subtotal+=best.price;lines.push('• '+part.name+' — '+ravenMoney(best.price)+' ('+best.checkedAt+')',best.url);}}
 if(missing.length)lines.push('\nSEM COTAÇÃO RECENTE: '+missing.join(', '));lines.push('\nSubtotal parcial: '+ravenMoney(subtotal),'Confira estoque, vendedor, frete, impostos e compatibilidade antes da compra.');
 const message=lines.join('\n');if(navigator.clipboard?.writeText){navigator.clipboard.writeText(message).then(()=>alert('Lista copiada.')).catch(()=>prompt('Copie sua lista:',message));}else prompt('Copie sua lista:',message);
}
function ravenRenderMarket(){
 const list=document.getElementById('marketList');if(!list)return;
 list.replaceChildren();const selected=groups.map(g=>({group:g,part:optionFor(g)})).filter(x=>x.part);
 if(!selected.length){const p=document.createElement('p');p.className='market-empty';p.textContent='Selecione componentes para visualizar ofertas e pesquisar nas lojas.';list.append(p);return;}
 ravenRenderInsights(selected);
 const only=document.getElementById('onlyOffers')?.checked;
 for(const {group,part} of selected){
  const offers=ravenOffers.filter(o=>o.partId===part.id).sort((a,b)=>a.price-b.price);
  if(only&&!offers.length)continue;
  const card=document.createElement('article');card.className='market-item';
  const head=document.createElement('div');head.className='market-item-head';
  const names=document.createElement('div');const cat=document.createElement('small');cat.textContent=group.name;const title=document.createElement('h3');title.textContent=part.name;names.append(cat,title);
  const estimate=document.createElement('span');estimate.className='market-estimate';estimate.textContent='Estimativa: '+ravenMoney(part.price);head.append(names,estimate);card.append(head);
  if(offers.length){const best=document.createElement('div');best.className='market-best';const fresh=offers.filter(ravenFresh);best.textContent=fresh.length?'Menor cotação recente: '+ravenMoney(fresh[0].price)+' · '+RAVEN_STORES[fresh[0].store].name:'Todas as ofertas desta peça precisam de nova conferência';card.append(best);
   for(const o of offers){const line=document.createElement('div');line.className='market-offer'+(ravenFresh(o)?'':' market-stale');const label=document.createElement('div');const strong=document.createElement('strong');strong.textContent=RAVEN_STORES[o.store].name+' · '+ravenMoney(o.price);const meta=document.createElement('small');meta.textContent='Consultada em '+o.checkedAt.split('-').reverse().join('/')+' · '+(o.condition==='used'?'Usado':'Novo')+' · '+(o.affiliate?'Link comissionado':'Link externo')+' · '+(ravenFresh(o)?'Cotação recente':'DESATUALIZADA — verificar preço')+' · confirme estoque/frete';label.append(strong,meta);const a=document.createElement('a');a.className='market-link';a.href=o.url;a.target='_blank';a.rel=o.affiliate?'noopener noreferrer sponsored':'noopener noreferrer';a.textContent='Ver oferta ↗';line.append(label,a);card.append(line);}const history=ravenHistory.filter(h=>h.partId===part.id).sort((a,b)=>a.checkedAt.localeCompare(b.checkedAt)).slice(-12);if(history.length){const section=document.createElement('details');section.className='market-details';const label=document.createElement('summary');label.textContent='Histórico de preços cadastrados ('+history.length+')';section.append(label);const ul=document.createElement('ul');ul.className='market-history';for(const h of history){const li=document.createElement('li');li.textContent=h.checkedAt+' · '+(RAVEN_STORES[h.store]?.name||h.store)+' · '+ravenMoney(h.price);ul.append(li)}section.append(ul);card.append(section);}}
  else {const empty=document.createElement('p');empty.className='market-no-offer';empty.textContent='Sem oferta cadastrada e verificada para esta peça.';card.append(empty);}
  const details=document.createElement('details');details.className='market-details';const summary=document.createElement('summary');summary.textContent='Comparar preços nas lojas';details.append(summary);
  const links=document.createElement('div');links.className='market-search';for(const [key,store] of Object.entries(RAVEN_STORES)){const a=document.createElement('a');a.href=ravenSearchUrl(part,store);a.target='_blank';a.rel='noopener noreferrer';a.textContent='Pesquisar '+store.name+' ↗';a.title='Pesquisa externa; não representa oferta verificada';links.append(a);}details.append(links);card.append(details);list.append(card);
 }
 if(!list.children.length){const p=document.createElement('p');p.className='market-empty';p.textContent='Nenhuma peça selecionada possui oferta verificada. Desmarque o filtro para pesquisar nas lojas.';list.append(p);}
}
async function ravenLoadOffers(){try{const r=await fetch('./offers.json',{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const data=await r.json();ravenOffers=Array.isArray(data.offers)?data.offers.filter(ravenVerifiedOffer):[];ravenHistory=Array.isArray(data.history)?data.history.filter(h=>ravenVerifiedOffer({...h,url:h.url||'https://'+(RAVEN_STORES[h.store]?.domain||'invalid')})):[];}catch(e){ravenOffers=[];console.warn('Ofertas indisponíveis:',e);}ravenRenderMarket();}
document.getElementById('onlyOffers')?.addEventListener('change',ravenRenderMarket);
document.getElementById('marketRefresh')?.addEventListener('click',ravenLoadOffers);
// A lista de ofertas acompanha a seleção sem alterar a lógica 3D existente.
const ravenObserver=new MutationObserver(()=>ravenRenderMarket());
const ravenSummary=document.getElementById('summary-items');if(ravenSummary)ravenObserver.observe(ravenSummary,{childList:true,characterData:true,subtree:true});
ravenLoadOffers();

document.getElementById('marketShopping')?.addEventListener('click',ravenCopyShopping);


// RAVEN 4.0 — Garagem local e Smart Build. Sem autenticação ou sincronização em nuvem.
const RAVEN_GARAGE_KEY='raven-pc-garage-v4';
const ravenGarageEl=document.getElementById('garageList');
function ravenReadGarage(){try{const v=JSON.parse(localStorage.getItem(RAVEN_GARAGE_KEY)||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x.name==='string'&&x.parts&&typeof x.parts==='object').slice(0,40):[]}catch{return []}}
function ravenGarageNotice(msg){const n=document.getElementById('garageNotice');if(n)n.textContent=msg}
function ravenSetBuild(parts){const ids=groups.map(g=>g.options.some(o=>o.id===parts[g.id])?parts[g.id]:null);applyPreset(ids);document.getElementById('raven-next')?.scrollIntoView({behavior:'smooth',block:'start'});}
function ravenGarageRender(){if(!ravenGarageEl)return;ravenGarageEl.replaceChildren();const entries=ravenReadGarage();if(!entries.length){const p=document.createElement('p');p.className='next-note';p.textContent='Nenhuma montagem salva ainda.';ravenGarageEl.append(p);return}entries.forEach((entry,i)=>{const card=document.createElement('div');card.className='garage-entry';const label=document.createElement('div');const title=document.createElement('strong');title.textContent=entry.name;const small=document.createElement('small');small.textContent=Object.keys(entry.parts).length+'/8 peças · '+new Date(entry.savedAt).toLocaleDateString('pt-BR');label.append(title,small);const actions=document.createElement('div');actions.className='next-inline';const load=document.createElement('button');load.type='button';load.className='ghost';load.textContent='Carregar';load.onclick=()=>ravenSetBuild(entry.parts);const del=document.createElement('button');del.type='button';del.className='ghost';del.textContent='Excluir';del.onclick=()=>{if(!confirm('Excluir esta montagem salva?'))return;const all=ravenReadGarage();all.splice(i,1);localStorage.setItem(RAVEN_GARAGE_KEY,JSON.stringify(all));ravenGarageRender()};actions.append(load,del);card.append(label,actions);ravenGarageEl.append(card)})}
document.getElementById('garageSave')?.addEventListener('click',()=>{const name=document.getElementById('garageName').value.trim()||'Minha montagem';if(!Object.keys(chosen).length){ravenGarageNotice('Escolha ao menos uma peça antes de salvar.');return}const all=ravenReadGarage();if(all.length>=40){ravenGarageNotice('Limite de 40 montagens. Exclua uma antes de salvar.');return}all.unshift({name,parts:{...chosen},savedAt:new Date().toISOString()});try{localStorage.setItem(RAVEN_GARAGE_KEY,JSON.stringify(all));ravenGarageNotice('Montagem salva neste navegador. Exporte uma cópia de segurança.');ravenGarageRender()}catch{ravenGarageNotice('Não foi possível salvar: armazenamento indisponível ou cheio.')}});
document.getElementById('garageExport')?.addEventListener('click',()=>{const data={schemaVersion:1,app:'Raven PC Builder',builds:ravenReadGarage()};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='raven-minha-garagem.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
document.getElementById('garageImport')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>200000){ravenGarageNotice('Arquivo muito grande.');return}try{const data=JSON.parse(await f.text());if(data.app!=='Raven PC Builder'||!Array.isArray(data.builds))throw Error('Formato inválido');const clean=data.builds.slice(0,40).filter(b=>b&&typeof b.name==='string'&&b.parts&&typeof b.parts==='object').map(b=>({name:b.name.slice(0,55),parts:Object.fromEntries(groups.map(g=>[g.id,b.parts[g.id]]).filter(([k,v])=>groups.find(g=>g.id===k).options.some(o=>o.id===v))),savedAt:new Date().toISOString()}));localStorage.setItem(RAVEN_GARAGE_KEY,JSON.stringify(clean));ravenGarageRender();ravenGarageNotice(clean.length+' montagem(ns) importada(s). O arquivo substituiu a garagem anterior.')}catch{ravenGarageNotice('Arquivo inválido. Use um JSON exportado pela garagem Raven.')}e.target.value=''});
function ravenSmartPick(goal,budget){
 // Examina os presets e o gerador existente. Não afirma FPS nem preços reais.
 const candidates=[];const add=(ids,label)=>{if(!Array.isArray(ids)||ids.length<7)return;ids=[...ids];if(ids.length===7){const cpuPart=groups.find(g=>g.id==='cpu').options.find(o=>o.id===ids[2]);const coolerGroup=groups.find(g=>g.id==='cooler');const cooler=coolerGroup.options.find(o=>cpuPart&&o.sockets.includes(cpuPart.socket)&&o.tdp>=(cpuPart.watts||90))||coolerGroup.options.find(o=>cpuPart&&o.sockets.includes(cpuPart.socket));if(!cooler)return;ids.push(cooler.id)}const parts=Object.fromEntries(groups.map((g,i)=>[g.id,g.options.find(o=>o.id===ids[i])]));if(Object.values(parts).some(x=>!x))return;const price=Object.values(parts).reduce((n,p)=>n+p.price,0);const cpu=parts.cpu,gpu=parts.gpu,ram=parts.ram;const score=goal==='office'?-(price/100)+((cpu.igpu||gpu.id==='igpu')?10:0):goal==='creative'?(cpu.tier||1)*5+(ram.gb||8)/4+(gpu.tier||1)*2:goal==='upgrade'?(cpu.socket==='AM5'?30:cpu.socket==='AM4'?15:0)+(ram.gb||8)/8:((gpu.tier||1)*6+(cpu.tier||1)*3);candidates.push({ids,label,price,score})};
 for(const p of (typeof presets!=='undefined'&&Array.isArray(presets)?presets:[])){add(p.ids||p.parts||p.build,p.name||'Build pronta')}
 for(const ratio of [.65,.8,1,1.15,1.4,1.8]){try{add(autoBuild(Math.max(300,Math.round(budget*ratio))),'Sugestão automática')}catch{}}
 const within=candidates.filter(x=>x.price<=budget);within.sort((a,b)=>b.score-a.score||a.price-b.price);return {best:within[0]||null,min:candidates.sort((a,b)=>a.price-b.price)[0]||null};
}
document.getElementById('smartGenerate')?.addEventListener('click',()=>{const goal=document.getElementById('smartGoal').value;const budget=Number(document.getElementById('smartBudget').value);const out=document.getElementById('smartResult');if(!Number.isFinite(budget)||budget<300||budget>25000){out.textContent='Informe um orçamento entre R$ 300 e R$ 25.000.';return}const result=ravenSmartPick(goal,budget);const choice=result.best;if(!choice){out.textContent=result.min?'Nenhuma configuração completa encontrada nesse orçamento. Menor configuração calculada: '+fmt(result.min.price)+'.':'Não foi possível gerar uma montagem válida.';return}ravenSetBuild(Object.fromEntries(groups.map((g,i)=>[g.id,choice.ids[i]])));const report=evaluateBuild();out.textContent='Sugestão aplicada: '+fmt(choice.price)+' (estimativa). '+(report.errors.length?'Atenção: '+report.errors.join(' '):'Sem conflitos básicos detectados.')+' Confirme BIOS, cooler, fonte e preços reais antes de comprar.'});
document.getElementById('nextShare')?.addEventListener('click',()=>document.getElementById('link')?.click());
document.getElementById('nextImage')?.addEventListener('click',()=>document.getElementById('shot')?.click());
ravenGarageRender();
