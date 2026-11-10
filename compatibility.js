// RAVEN 5.0 — motor de compatibilidade, sem dependências do visualizador.
// Dados desconhecidos não equivalem a compatibilidade confirmada.
const rank={ITX:1,mATX:2,ATX:3};
const unique=xs=>[...new Set(xs)];
export function evaluateCompatibility(parts){
 const {case:chassis,board,cpu,ram,gpu,ssd,psu,cooler}=parts;
 const errors=[],warnings=[],passed=[],unknown=[];
 const fail=x=>errors.push(x),warn=x=>warnings.push(x),ok=x=>passed.push(x),check=x=>unknown.push(x);
 const complete=['case','board','cpu','ram','gpu','ssd','psu','cooler'].every(k=>parts[k]);
 if(cpu&&board){
   if(cpu.socket&&board.socket){if(cpu.socket!==board.socket)fail(`CPU ${cpu.socket} e placa-mãe ${board.socket}: sockets incompatíveis.`);else ok(`Socket ${cpu.socket} coincide entre CPU e placa-mãe.`)}
   else check('Socket exato da CPU ou placa-mãe não cadastrado.');
   check(`BIOS: confirme o suporte ao processador ${cpu.name} na lista oficial da placa-mãe ${board.name}, incluindo revisão e versão mínima.`);
   if(['LGA2011','LGA2011-3'].includes(board.socket))check('Plataforma X79/X99: confirme chipset real, revisão da placa, suporte ao Xeon, firmware e tipo de memória aceito.');
 }
 if(ram&&board){
   if(ram.memory&&board.memory){if(ram.memory!==board.memory)fail(`RAM ${ram.memory} incompatível com placa-mãe ${board.memory}.`);else ok(`Geração ${ram.memory} corresponde à placa-mãe.`)}else check('Tipo DDR da RAM ou placa-mãe não informado.');
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
 if(ssd&&board){const isNvme=/NVMe|PCIe/i.test(ssd.name+' '+ssd.desc);if(isNvme){if(board.m2Nvme===false)fail('SSD NVMe exige slot M.2 PCIe ou adaptador compatível; placa-mãe declarada sem suporte.');else if(board.m2Nvme===true)ok('Placa-mãe declara suporte a SSD M.2 NVMe.');else check('Verifique slot M.2 com suporte NVMe, geração PCIe e compartilhamento de pistas/portas SATA.')}else check('Confirme portas SATA disponíveis, cabos e alimentação para o armazenamento.');}
 const cpuW=cpu?(Number(cpu.watts)||90):0,gpuW=gpu?(Number(gpu.power)||0):0;
 const estimatedWatts=cpuW+gpuW+(board?65:0)+(ram?12:0)+(ssd?8:0)+25;
 if(psu&&cpu&&gpu){const recommended=Math.ceil(estimatedWatts*1.4/50)*50;if(psu.watts<recommended)warn(`Fonte de ${psu.watts} W abaixo da margem conservadora estimada de ${recommended} W. Revise consumo de pico e recomendações dos fabricantes.`);else ok(`Potência nominal de ${psu.watts} W supera a margem ilustrativa de ${recommended} W.`);check('Conectores EPS/PCIe/12V-2x6, cabos, transientes e qualidade real da fonte não verificados. Certificação 80 Plus não garante qualidade.');}
 if(cpu&&gpu&&gpu.id==='igpu'&&!cpu.igpu)fail('Processador sem vídeo integrado selecionado com opção de vídeo integrado.');
 if(cpu&&gpu&&cpu.tier&&gpu.tier&&Math.abs(cpu.tier-gpu.tier)>=3)warn('Desempenho de CPU e GPU pode ser desequilibrado conforme jogo, resolução e uso; não é incompatibilidade física.');
 if(Object.values(parts).some(p=>p?.used))warn('Há peças usadas: solicite testes, estado de conservação e garantia.');
 if(!complete)check('Montagem incompleta: selecione as oito categorias para uma análise mais abrangente.');
 return {errors:unique(errors),warnings:unique(warnings),passed:unique(passed),unknown:unique(unknown),estimatedWatts,complete};
}
