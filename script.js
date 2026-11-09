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
 const get=id=>{const g=groups.find(x=>x.id===id);return g&&optionFor(g)};
 const pc=get('cpu'),mb=get('board'),mem=get('ram'),gpu=get('gpu'),psu=get('psu'),casePart=get('case'),cooler=get('cooler');
 const errors=[],warnings=[],passed=[];
 if(pc&&mb){if(pc.socket!==mb.socket)errors.push('Soquete incompatível: CPU '+pc.socket+' × placa-mãe '+mb.socket+'.');else passed.push('CPU e placa-mãe usam '+pc.socket+'.');warnings.push('Confirme suporte da BIOS à geração exata do processador.');}
 if(mem&&mb){if(mem.memory!==mb.memory)errors.push('RAM '+mem.memory+' não corresponde à placa-mãe '+mb.memory+'.');else passed.push('Padrão de memória '+mem.memory+' compatível.');}
 if(casePart&&mb){if(RK[mb.form]>RK[casePart.form])errors.push('Placa '+mb.form+' não cabe no gabinete '+casePart.form+'.');else passed.push('Formato da placa-mãe compatível com o gabinete.');}
 if(casePart&&gpu){if(gpu.lengthMm>casePart.gpuMaxMm)errors.push('GPU excede o espaço do gabinete ('+gpu.lengthMm+' > '+casePart.gpuMaxMm+' mm).');else passed.push('Comprimento estimado da GPU cabe no gabinete.');warnings.push('Confirme espessura da GPU e espaço ocupado por ventoinhas/radiadores.');}
 if(pc&&gpu&&gpu.id==='igpu'&&!pc.igpu)errors.push('Este processador não tem vídeo integrado: escolha uma placa de vídeo.');
 // Estimativa grosseira de pico: TDP/limite aproximado da CPU, GPU e outros componentes.
 const cpuWatts=pc?(pc.watts||(pc.id==='5700x'?100:90)):0,estimatedWatts=cpuWatts+(gpu?.power||0)+(mb?65:0)+(mem?12:0)+(get('ssd')?8:0)+25;
 if(psu&&pc&&gpu){const recommended=Math.ceil(estimatedWatts*1.4/50)*50;if(psu.watts<recommended)errors.push('Fonte de '+psu.watts+' W abaixo da margem sugerida de '+recommended+' W para esta estimativa.');else passed.push('Potência nominal com margem estimada ('+psu.watts+' W).');warnings.push('Verifique qualidade real da fonte e conectores PCIe/EPS; certificação 80 Plus não garante qualidade.');}
 if(pc&&gpu&&pc.tier&&gpu.tier){const df=gpu.tier-pc.tier;if(df>=3)warnings.push('Possível gargalo: '+pc.name+' pode limitar a '+gpu.name+' em jogos.');else if(df<=-3)warnings.push(gpu.name+' é bem mais fraca que '+pc.name+'. Considere investir mais na GPU.');else passed.push('CPU e GPU bem equilibradas.');}
 if(pc && !cooler)warnings.push('Cooler não selecionado: confirme se o processador inclui refrigeração e se você possui um cooler adequado.');
  if(pc&&cooler){if(!cooler.sockets.includes(pc.socket))errors.push('Cooler incompatível com o socket '+pc.socket+'.');else passed.push('Fixação do cooler declarada para '+pc.socket+' (verifique o kit).');if((pc.watts||90)>cooler.tdp)warnings.push('Capacidade nominal informada do cooler ('+cooler.tdp+' W) pode ser insuficiente para esta CPU ('+(pc.watts||90)+' W aproximados).');if(cooler.id==='cooler-stock')warnings.push('Cooler original selecionado: só use se já tiver um modelo realmente compatível e suficiente.');}
  if(pc&&mb&&['h61m','h61m-b','b75m'].includes(mb.id)&&/i[357]-3|e3-1230v2|g2020|i3-3240/.test(pc.id))warnings.push('H61/B75 com CPU de 3ª geração: confirme revisão da placa e versão da BIOS; pode exigir atualização prévia.');
  if(mb&&['LGA2011','LGA2011-3'].includes(mb.socket))warnings.push('Kit X79/X99: verifique se a placa exige DDR3/DDR4 ECC REG, ECC UDIMM ou memória comum. DDR4 ou DDR3, por si só, não garante compatibilidade.');
  
  if(!get('ssd'))warnings.push('Selecione armazenamento para concluir a montagem.');
 if(groups.some(g=>!get(g.id)))warnings.push('A montagem ainda está incompleta.');
 if(groups.some(g=>get(g.id)?.used))warnings.push('A build tem peças usadas: peça teste, nota e garantia ao vendedor.');
 warnings.push('Refrigeração, cooler, BIOS, conectores e dimensões exatas requerem verificação manual.');
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)],passed:[...new Set(passed)],estimatedWatts,complete:groups.every(g=>get(g.id))};
}
function issues(){return evaluateBuild().errors;}
function renderDiagnostics(){const d=evaluateBuild(),target=$('diagnostics');if(!target)return;target.replaceChildren();
 const heading=document.createElement('div');heading.className='diag-head';heading.innerHTML='<div><span class="eyebrow">ANÁLISE DE HARDWARE</span><h3>Diagnóstico da montagem</h3></div>';
 const status=document.createElement('span');status.className='diag-status '+(d.errors.length?'danger':d.complete?'ok':'pending');status.textContent=d.errors.length?'INCOMPATÍVEL':d.complete?'REVISÃO NECESSÁRIA':'INCOMPLETA';heading.append(status);target.append(heading);
 const metrics=document.createElement('div');metrics.className='diag-metrics';const total=groups.map(optionFor).filter(Boolean).reduce((n,o)=>n+o.price,0);for(const [label,value] of [['Peças escolhidas',Object.keys(chosen).length+' / 8'],['Custo ilustrativo',fmt(total)],['Consumo estimado',d.estimatedWatts?d.estimatedWatts+' W':'—'],['Conflitos / avisos',d.errors.length+' / '+d.warnings.length]]){const item=document.createElement('div');item.className='diag-metric';const a=document.createElement('small');a.textContent=label;const b=document.createElement('strong');b.textContent=value;item.append(a,b);metrics.append(item)}target.append(metrics);perf(target);
 function section(title,arr,cls){if(!arr.length)return;const block=document.createElement('div');block.className='diag-section '+cls;const h=document.createElement('h4');h.textContent=title;block.append(h);for(const line of arr){const p=document.createElement('p');p.textContent=line;block.append(p)}target.append(block)}
 section('Conflitos que precisam ser corrigidos',d.errors,'error');renderAssistant(target,d);section('Verificações aprovadas',d.passed,'success');section('Atenção antes de comprar',d.warnings,'warning');renderCompare(target);
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
 if(board&&ram&&board.memory!==ram.memory){const alt=catalog.ram.filter(r=>r.memory===board.memory&&r.gb>=ram.gb).sort((a,b)=>a.price-b.price)[0];tip('Memória incompatível','A placa selecionada usa '+board.memory+'.',alt?'Selecionar RAM':'',alt?()=>change('ram',alt):undefined)}
 if(cpu&&gpu&&gpu.id==='igpu'&&!cpu.igpu)tip('Sem vídeo integrado','Este processador precisa de uma placa de vídeo dedicada.','Escolher GPU',()=>{current=4;render();document.querySelector('.config')?.scrollIntoView({behavior:'smooth'})});
 if(ram&&ram.gb<16&&board){const alt=catalog.ram.filter(r=>r.memory===board.memory&&r.gb>=16).sort((a,b)=>a.price-b.price)[0];if(alt)tip('Upgrade de memória','Passar de '+ram.gb+' GB para '+alt.gb+' GB custa '+fmt(alt.price-ram.price)+' a mais (valor ilustrativo).','Aplicar upgrade',()=>change('ram',alt))}
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
 if(a?.ids){const A=summaryFor(a.ids),B=summaryFor(chosen),table=document.createElement('div');table.className='compare-grid';for(const [label,x,y] of [['Componentes',A.count+' / 8',B.count+' / 8'],['Custo ilustrativo',fmt(A.total),fmt(B.total)],['Diferença de preço','—',fmt(B.total-A.total)]]){for(const t of [label,x,y]){const c=document.createElement('span');c.textContent=t;table.append(c)}}panel.append(table);const details=document.createElement('div');details.className='compare-differences';for(const g of groups){const pa=g.options.find(p=>p.id===a.ids[g.id]),pb=optionFor(g);if(pa?.id!==pb?.id){const line=document.createElement('p');line.textContent=g.name+': '+(pa?.name||'—')+' → '+(pb?.name||'—');details.append(line)}}if(!details.childElementCount)details.textContent='As duas montagens têm os mesmos componentes.';panel.append(details)}else{const empty=document.createElement('p');empty.textContent='Nenhuma montagem A salva ainda.';panel.append(empty)}target.append(panel)
}

function render(){const g=groups[current],nav=$('steps');nav.replaceChildren();groups.forEach((item,i)=>{const b=document.createElement('button');b.className='step'+(i===current?' active':'')+(chosen[item.id]?' done':'');b.innerHTML=`<span class="step-num">${chosen[item.id]?'✓':String(i+1).padStart(2,'0')}</span><span>${item.name}</span>`;b.onclick=()=>{current=i;render()};nav.append(b)});$('step-number').textContent=String(current+1).padStart(2,'0');$('category').textContent=g.name;$('category-desc').textContent=g.desc;$('category-icon').textContent=g.icon;const box=$('options');if(lastCat===current)lastY=box.scrollTop;else lastY=0;lastCat=current;box.replaceChildren();listFor(g).forEach(o=>{const b=document.createElement('button');const tg=bad(g,o)?'Incompatível':over(g,o)?'Acima do orçamento':'';b.className='option'+(chosen[g.id]===o.id?' selected':'')+(tg?' dim':'');if(tg)b.dataset.tag=tg;const top=document.createElement('div');top.className='option-top';const n=document.createElement('span');n.className='option-name';n.textContent=o.name;const p=document.createElement('span');p.className='option-price';p.textContent=fmt(o.price);top.append(n,p);const d=document.createElement('div');d.className='option-desc';d.textContent=o.desc;b.append(top,d);b.onclick=()=>{chosen[g.id]=o.id;localStorage.setItem('raven-pc-builder-v1',JSON.stringify(chosen));history.replaceState(null,'',shareHash());render();if(viewer)viewer.update(chosen)};box.append(b)});const problems=issues(),compat=$('compat');compat.className='compat '+(problems.length?'bad':'good');compat.replaceChildren();const strong=document.createElement('strong');strong.textContent=problems.length?'⚠ Atenção à compatibilidade':'✓ Compatibilidade básica';const desc=document.createElement('p');desc.textContent=problems.length?problems.join(' '):'Nenhum conflito detectado nas regras básicas. Verifique BIOS, refrigeração, conectores e dimensões antes da compra.';compat.append(strong,desc);$('back').disabled=current===0;$('next').textContent=current===groups.length-1?'Revisar montagem ↗':'Próxima etapa →';$('count').textContent=Object.keys(chosen).length+'/8';const selected=groups.map(group=>optionFor(group)).filter(Boolean);$('price').textContent=fmt(selected.reduce((sum,o)=>sum+o.price,0));$('summary-items').textContent=(evaluateBuild().errors.length?'⚠ NÃO COMPRAR: corrija os conflitos. · ':'')+(selected.length?selected.map(o=>o.name).join(' · '):'Nenhuma peça selecionada ainda.');const pl=$('platform');if(pl){const cp=optionFor(groups[2]);pl.textContent=cp?cp.socket:'—'}budgetNote();renderDiagnostics();}
$('back').onclick=()=>{current=Math.max(0,current-1);render()};$('next').onclick=()=>{if(current<groups.length-1)current++;else current=0;render()};$('reset').onclick=()=>{if(!confirm('Limpar todas as peças selecionadas?'))return;chosen={};localStorage.removeItem('raven-pc-builder-v1');history.replaceState(null,'',location.pathname);current=0;render();viewer?.update(chosen)};$('copy').onclick=async()=>{const lines=['RAVEN PC BUILDER — Configuração demonstrativa',...groups.map(g=>g.name+': '+(optionFor(g)?.name||'Não selecionado')),'Total ilustrativo: '+$('price').textContent,'Consumo estimado: '+evaluateBuild().estimatedWatts+' W','Conflitos: '+(evaluateBuild().errors.join('; ')||'Nenhum nas regras básicas'),'Aviso: conferir compatibilidade completa e preços antes de comprar.','Link da build: '+location.origin+location.pathname+shareHash()];try{await navigator.clipboard.writeText(lines.join('\n'));$('copy').textContent='✓ Copiado';setTimeout(()=>$('copy').textContent='Copiar configuração ↗',1600)}catch{alert(lines.join('\n'))}};$('explode').onclick=()=>{exploded=!exploded;$('explode').textContent=exploded?'⇲ Montar peças':'⇱ Explodir peças';viewer?.explode(exploded)};$('camera').onclick=()=>viewer?.reset();
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
 if(g.id==='cpu')return !!b&&o.socket!==b.socket;
 if(g.id==='board')return !!((c&&o.socket!==c.socket)||(r&&o.memory!==r.memory)||(k&&RK[o.form]>RK[k.form]));
 if(g.id==='ram')return !!b&&o.memory!==b.memory;
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
async function init3D(){const target=$('scene');try{const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');target.replaceChildren();const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(4.2,2.1,6);camera.lookAt(0,0,0);const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;target.append(renderer.domElement);scene.add(new THREE.HemisphereLight(0xe6f7ff,0x384e51,3.1));const key=new THREE.DirectionalLight(0xffffff,3.8);key.position.set(4,7,6);scene.add(key);const fill=new THREE.DirectionalLight(0xd9f2ff,2.8);fill.position.set(-5,3,5);scene.add(fill);const rim=new THREE.PointLight(0xc2ff4d,13,12);rim.position.set(-4,3,-3);scene.add(rim);const root=new THREE.Group();scene.add(root);const materials={shell:new THREE.MeshStandardMaterial({color:0x191e23,metalness:.72,roughness:.3}),frame:new THREE.MeshStandardMaterial({color:0x333b40,metalness:.75,roughness:.34}),dark:new THREE.MeshStandardMaterial({color:0x0a1014,metalness:.3,roughness:.65}),pcb:new THREE.MeshStandardMaterial({color:0x183026,metalness:.3,roughness:.65}),silver:new THREE.MeshStandardMaterial({color:0x8c9ba3,metalness:.9,roughness:.26}),accent:new THREE.MeshStandardMaterial({color:0xbaff66,emissive:0x456f10,emissiveIntensity:.55,metalness:.35,roughness:.35}),glass:new THREE.MeshPhysicalMaterial({color:0x738a91,metalness:.15,roughness:.12,transparent:true,opacity:.035,depthWrite:false,side:THREE.DoubleSide})};function box(parent,w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m}function cylinder(parent,r,h,x,y,z,mat){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);parent.add(m);return m}const parts={};function part(id){const g=new THREE.Group();root.add(g);parts[id]=g;return g}const caseG=part('case');box(caseG,2.8,.13,1.65,0,-1.65,0,materials.shell);box(caseG,2.8,.13,1.65,0,1.65,0,materials.shell);box(caseG,.13,3.3,1.65,-1.34,0,0,materials.shell);box(caseG,.13,3.3,1.65,1.34,0,0,materials.shell);box(caseG,2.8,3.3,.12,0,0,-.8,materials.shell);box(caseG,2.8,3.3,.12,0,0,.8,materials.glass);for(let i=0;i<3;i++){const fan=cylinder(caseG,.35,.05,.6,1.05-i*1.02,-.67,materials.frame);const inner=cylinder(caseG,.26,.06,.6,1.05-i*1.02,-.6,materials.dark);for(let j=0;j<5;j++){const a=j*Math.PI*2/5;box(caseG,.12,.35,.02,.6+Math.cos(a)*.13,1.05-i*1.02+Math.sin(a)*.13,-.54,materials.silver).rotation.z=-a}}const board=part('board');box(board,1.65,2.2,.10,-.33,0,-.48,materials.pcb);for(let i=0;i<10;i++)box(board,.15,.08,.03,-1+i*.19,-.85+(i%3)*.23,-.4,materials.silver);const cpu=part('cpu');box(cpu,.58,.58,.15,-.52,.44,-.27,materials.silver);box(cpu,.39,.39,.16,-.52,.44,-.15,materials.frame);const ram=part('ram');for(let i=0;i<2;i++){box(ram,.10,1.12,.18,.17+i*.17,.18,-.3,materials.dark);box(ram,.05,.96,.20,.17+i*.17,.18,-.19,materials.accent)}const gpu=part('gpu');box(gpu,1.95,.56,.46,-.02,-.7,.05,materials.frame);for(let i=0;i<2;i++){const fan=cylinder(gpu,.21,.02,-.45+i*.8,-.7,.32,materials.dark);for(let j=0;j<5;j++){const a=j*Math.PI*2/5;const blade=box(gpu,.09,.2,.025,-.45+i*.8+Math.cos(a)*.09,-.7+Math.sin(a)*.09,.35,materials.silver);blade.rotation.z=-a}}const ssd=part('ssd');box(ssd,.55,.13,.10,-.54,-.38,-.29,materials.silver);box(ssd,.41,.07,.11,-.54,-.38,-.21,materials.dark);const psu=part('psu');box(psu,1.12,.57,1.14,.52,-1.26,0,materials.frame);box(psu,.82,.05,.8,.52,-.96,0,materials.dark);// RAVEN 2.1 — detalhes de hardware procedural (modelos ilustrativos, não oficiais)
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
// Luzes de preenchimento para destacar os componentes internos
const fillLight=new THREE.PointLight(0xe9f5ff,13,8);fillLight.position.set(1,1,4);scene.add(fillLight);
const innerLight=new THREE.PointLight(0xc5ffb0,9,5);innerLight.position.set(0,.4,.2);scene.add(innerLight);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x101517,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.81;scene.add(floor);const grid=new THREE.GridHelper(20,35,0x24322c,0x18231e);grid.position.y=-1.79;grid.material.transparent=true;grid.material.opacity=.24;scene.add(grid);let yaw=-.58,pitch=.09,distance=5.85,dragging=false,prevX=0,prevY=0;const spread={case:[0,0,0],board:[-1.4,.3,-.7],cpu:[-.5,.7,1.2],ram:[.5,1.3,.8],gpu:[.2,-.6,1.5],ssd:[-1.4,-.4,.9],psu:[1.2,-.8,.7]};let expand=false;function update(){for(const [id,g] of Object.entries(parts))g.visible=id==='case'||!!chosen[id];
const pick=gid=>{const gr=groups.find(x=>x.id===gid);return gr&&gr.options.find(o=>o.id===chosen[gid])};
const gp=pick('gpu'),bd=pick('board'),cs=pick('case'),cp=pick('cpu');
if(chosen.gpu==='igpu')parts.gpu.visible=false;gpu.scale.x=gp?Math.max(.8,Math.min(1.12,gp.lengthMm/245)):1;gpu.scale.z=gp&&gp.power>200?1.2:1;
board.scale.y=bd&&bd.form==='mATX'?.9:1;
materials.shell.color.set(cs&&cs.id==='case2'?0x0f1316:0x191e23);
rim.color.set(cp&&cp.socket==='AM5'?0x4dd2ff:0xc2ff4d)}function resize(){const w=target.clientWidth,h=target.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}new ResizeObserver(resize).observe(target);resize();renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;prevX=e.clientX;prevY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});renderer.domElement.addEventListener('pointerup',()=>dragging=false);renderer.domElement.addEventListener('pointercancel',()=>dragging=false);renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;yaw+=(e.clientX-prevX)*.007;pitch=Math.max(-.6,Math.min(.65,pitch+(e.clientY-prevY)*.006));prevX=e.clientX;prevY=e.clientY});renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(4.9,Math.min(12,distance+e.deltaY*.007))},{passive:false});let last=0;function animate(t){requestAnimationFrame(animate);const dt=Math.min((t-last)/1000||.016,.05);last=t;if(!dragging)yaw+=dt*.045;root.rotation.y=yaw;root.rotation.x=pitch;camera.position.set(0,1.0,distance);camera.lookAt(0,0,0);for(const [id,g] of Object.entries(parts)){const v=spread[id];const targetX=expand?v[0]:0,targetY=expand?v[1]:0,targetZ=expand?v[2]:0;const factor=Math.min(1,dt*5);g.position.x+=(targetX-g.position.x)*factor;g.position.y+=(targetY-g.position.y)*factor;g.position.z+=(targetZ-g.position.z)*factor}const col=rgb?tmp.setHSL((t/6000)%1,.9,.55):accentCol;detail.led.color.copy(col);detail.led.emissive.copy(col);railMat.color.copy(col);railMat.emissive.copy(col).multiplyScalar(.5);materials.accent.color.copy(col);materials.accent.emissive.copy(col).multiplyScalar(.4);rim.color.copy(col);renderer.render(scene,camera)}let rgb=false;const accentCol=new THREE.Color(0xbaff66),tmp=new THREE.Color();update();requestAnimationFrame(animate);viewer={update,explode(v){expand=v},accent(c){accentCol.set(c)},rgb(v){rgb=v},shot(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')},reset(){yaw=-.58;pitch=.12;distance=5.85;expand=false;exploded=false;$('explode').textContent='⇱ Explodir peças'}}}catch(e){target.innerHTML='<div class="loading" style="padding:25px;text-align:center">Não foi possível carregar o motor 3D. Conecte-se à internet e abra o projeto por um servidor local (Live Server). O configurador de peças continua funcionando.</div>';console.error('Falha no 3D:',e)}}init3D();

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
