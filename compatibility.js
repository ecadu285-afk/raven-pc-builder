// RAVEN 5.0 — motor de compatibilidade, sem dependências do visualizador.
// Dados desconhecidos não equivalem a compatibilidade confirmada.
const rank={ITX:1,mATX:2,ATX:3};
const unique=xs=>[...new Set(xs)];
// Famílias de controladoras de memória. Não confundir geração da placa com a da CPU.
export function cpuMemoryGenerations(cpu){
 if(!cpu)return null;
 if(cpu.conceptual)return null; // IDs e especificações fictícias nunca validam a controladora
 if(Array.isArray(cpu.memoryTypes)&&cpu.memoryTypes.length)return cpu.memoryTypes;
 const id=String(cpu.id||'').toLowerCase(), name=String(cpu.name||'').toLowerCase();
 if(/^e5-\d+v[34]$/.test(id)||/xeon e5-\d+ v[34]/i.test(name))return ['DDR4'];
 if(/^e5-\d+(v2)?$/.test(id)||/xeon e5-\d+( v2)?$/i.test(name))return ['DDR3'];
 const socket=cpu.socket;
 const map={'AM5':['DDR5'],'AM4':['DDR4'],'AM3+':['DDR3'],'FM2+':['DDR3'],
  'LGA1155':['DDR3'],'LGA1150':['DDR3'],'LGA1151':['DDR4','DDR3L'],
  'LGA1151v2':['DDR4'],'LGA1200':['DDR4'],'LGA1700':['DDR4','DDR5'],
  'LGA2011':['DDR3'],'LGA2011-3':['DDR4']};
 if(socket==='LGA1700'||socket==='LGA1151')return map[socket]; // a placa define qual opção
 return map[socket]||null;
}
export function memoryConflicts(parts){
 const {cpu,board,ram}=parts, errors=[];
 const allowed=cpuMemoryGenerations(cpu);
 if(cpu&&board&&allowed&&board.memory&&!allowed.includes(board.memory))errors.push(`Controladora de memória do processador ${cpu.name}: ${allowed.join(' ou ')}; placa-mãe ${board.name} declara ${board.memory}. Combinação incompatível.`);
 if(cpu&&ram&&allowed&&ram.memory&&!allowed.includes(ram.memory))errors.push(`Processador ${cpu.name} não suporta memória ${ram.memory}; geração esperada: ${allowed.join(' ou ')}.`);
 return unique(errors);
}
export function evaluateCompatibility(parts){
 const {case:chassis,board,cpu,ram,gpu,ssd,psu,cooler}=parts;
 const errors=[],warnings=[],passed=[],unknown=[];
 const fail=x=>errors.push(x),warn=x=>warnings.push(x),ok=x=>passed.push(x),check=x=>unknown.push(x);
 const complete=['case','board','cpu','ram','gpu','ssd','psu','cooler'].every(k=>parts[k]);
 if(cpu&&board){
   if(cpu.socket&&board.socket){if(cpu.socket!==board.socket)fail(`CPU ${cpu.socket} e placa-mãe ${board.socket}: sockets incompatíveis.`);else if(cpu.conceptual||board.conceptual)check(`Socket ${cpu.socket} coincide nos campos ilustrativos; confirme o hardware real.`);else ok(`Socket ${cpu.socket} coincide entre CPU e placa-mãe.`)}
   else check('Socket exato da CPU ou placa-mãe não cadastrado.');
   check(`BIOS: confirme o suporte ao processador ${cpu.name} na lista oficial da placa-mãe ${board.name}, incluindo revisão e versão mínima.`);
   if(['LGA2011','LGA2011-3'].includes(board.socket))check('Plataforma X79/X99: confirme chipset real, revisão da placa, suporte ao Xeon, firmware e tipo de memória aceito.');
 }
 for(const problem of memoryConflicts(parts))fail(problem);
 if(cpu&&board&&!cpuMemoryGenerations(cpu))check('Controladora de memória da CPU não verificada; confirme a ficha técnica do processador real.');
 if(ram&&board){
   if(ram.memory&&board.memory){if(ram.memory!==board.memory)fail(`RAM ${ram.memory} incompatível com placa-mãe ${board.memory}.`);else if(board.conceptual||ram.conceptual||cpu?.conceptual)check(`DDR ${ram.memory} coincide nos campos ilustrativos, mas a combinação inclui hardware conceitual e não foi validada.`);else if(!memoryConflicts(parts).length)ok(`Geração ${ram.memory} corresponde à placa-mãe e não conflita com a controladora conhecida da CPU.`)}else check('Tipo DDR da RAM ou placa-mãe não informado.');
   const moduleCount=ram.modules || Number(ram.name?.match(/\((\d+)\s*[×x]/)?.[1]) || null;
   if(moduleCount&&board.ramSlots){if(moduleCount>board.ramSlots)fail(`${moduleCount} módulos de RAM excedem ${board.ramSlots} slots disponíveis.`);else ok(`${moduleCount} módulos cabem nos ${board.ramSlots} slots informados.`)}else check('Quantidade de slots de RAM da placa-mãe não verificada para este modelo.');
   if(ram.gb&&board.maxRamGb){if(ram.gb>board.maxRamGb)fail(`${ram.gb} GB excedem o limite de ${board.maxRamGb} GB.`);else ok('Capacidade total de RAM dentro do limite cadastrado.')}else check('Capacidade máxima de RAM suportada não confirmada.');
   check('Confirme frequência, QVL e perfil XMP/EXPO; DDR compatível não garante a velocidade anunciada.');
   if(['LGA2011','LGA2011-3'].includes(board.socket))check('Memória Xeon/X79/X99: conferir ECC Registered, ECC UDIMM ou não ECC, conforme a placa e a CPU.');
 }
 if(chassis&&board){if(rank[chassis.form]&&rank[board.form]){if(rank[board.form]>rank[chassis.form])fail(`Placa-mãe ${board.form} não cabe em gabinete ${chassis.form}.`);else ok(`Formato ${board.form} cabe no gabinete ${chassis.form}.`)}else check('Dimensões ou padrão da placa-mãe/gabinete não cadastrados.');}
 if(chassis&&gpu){if(Number.isFinite(gpu.lengthMm)&&Number.isFinite(chassis.gpuMaxMm)){if(gpu.lengthMm>chassis.gpuMaxMm)fail(`GPU de ${gpu.lengthMm} mm excede limite de ${chassis.gpuMaxMm} mm do gabinete.`);else ok(`Comprimento da GPU (${gpu.lengthMm} mm) dentro do limite informado (${chassis.gpuMaxMm} mm).`)}else check('Comprimento exato da GPU ou espaço do gabinete não cadastrado.');check('Confirme espessura da GPU, número de slots, cabos e redução de espaço causada por radiadores.');}
 if(cpu&&cooler){if(Array.isArray(cooler.sockets)&&cpu.socket){if(!cooler.sockets.includes(cpu.socket))fail(`Cooler ${cooler.name} não declara fixação para ${cpu.socket}.`);else ok(`Cooler declara suporte a ${cpu.socket}.`)}else check('Fixação do cooler não cadastrada.');if(Number.isFinite(cooler.tdp)&&Number.isFinite(cpu.watts)&&cpu.watts>cooler.tdp)warn(`Capacidade térmica ilustrativa do cooler (${cooler.tdp} W) pode ser insuficiente para CPU (${cpu.watts} W estimados).`);else check('Confira potência real da CPU, limites térmicos e desempenho do cooler; TDPs não são diretamente comparáveis entre fabricantes.');if(cooler.id==='cooler-stock')check('Cooler genérico: confirme se há um cooler físico adequado e kit de fixação.');}
 if(cooler&&chassis){if(cooler.heightMm&&chassis.coolerMaxMm){if(cooler.heightMm>chassis.coolerMaxMm)fail('Altura do cooler excede o limite informado do gabinete.');else ok('Altura do cooler dentro do limite informado.')}else check('Altura do cooler e limite do gabinete não verificados; radiadores também exigem conferência.');}
 if(ssd&&board){const isNvme=/NVMe|PCIe/i.test(ssd.name+' '+ssd.desc);if(isNvme){if(board.m2Nvme===false)check('Placa-mãe sem M.2 NVMe nativo: adaptador PCIe pode funcionar, mas confirme slot, firmware e suporte a boot.');else if(board.m2Nvme===true)ok('Placa-mãe declara suporte a SSD M.2 NVMe.');else check('Verifique slot M.2 com suporte NVMe, geração PCIe e compartilhamento de pistas/portas SATA.')}else check('Confirme portas SATA disponíveis, cabos e alimentação para o armazenamento.');}
 const cpuW=cpu?(Number(cpu.watts)||90):0,gpuW=gpu&&gpu.id!=='igpu'?(Number(gpu.power)||0):0;
 const estimatedWatts=cpuW+gpuW+(board?65:0)+(ram?12:0)+(ssd?8:0)+25;
 if(psu&&cpu&&gpu){if(!Number.isFinite(psu.watts)||psu.watts<=0){check('Potência nominal da fonte não cadastrada; não é possível avaliar a margem.');}else{const recommended=Math.ceil(estimatedWatts*1.4/50)*50;if(psu.watts<recommended)warn(`Fonte de ${psu.watts} W abaixo da margem conservadora estimada de ${recommended} W. Revise consumo de pico e recomendações dos fabricantes.`);else if(psu.watts===recommended)warn(`Fonte de ${psu.watts} W iguala a margem estimada de ${recommended} W, sem folga adicional. Confirme o modelo real e os picos de consumo.`);else ok(`Potência nominal de ${psu.watts} W excede a margem ilustrativa de ${recommended} W; conectores e qualidade ainda precisam de confirmação.`);check('Conectores EPS/PCIe/12V-2x6, cabos, transientes e qualidade real da fonte não verificados. Certificação 80 Plus não garante qualidade.');}}
 if(Object.values(parts).some(p=>p?.conceptual))check('Há componentes conceituais: características informadas são simulações e não certificam um produto comercial.');
 if(cpu&&gpu&&gpu.id==='igpu'&&!cpu.conceptual&&!cpu.igpu)fail('Processador sem vídeo integrado selecionado com opção de vídeo integrado.');
 if(cpu&&gpu&&!cpu.conceptual&&!gpu.conceptual&&cpu.tier&&gpu.tier&&Math.abs(cpu.tier-gpu.tier)>=3)warn('Desempenho de CPU e GPU pode ser desequilibrado conforme jogo, resolução e uso; não é incompatibilidade física.');
 if(Object.values(parts).some(p=>p?.used))warn('Há peças usadas: solicite testes, estado de conservação e garantia.');
 if(!complete)check('Montagem incompleta: selecione as oito categorias para uma análise mais abrangente.');
 return {errors:unique(errors),warnings:unique(warnings),passed:unique(passed).filter(x=>!errors.some(e=>e.includes('Controladora de memória')&&x.includes('Geração'))),unknown:unique(unknown),estimatedWatts,complete};
}
