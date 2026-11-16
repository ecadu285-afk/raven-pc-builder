/** Raven 6.9 — checklist educativo derivado de referências cadastradas.
 * "Verificado" significa apenas que os campos do catálogo coincidem; não valida hardware real.
 */
const forms={ITX:1,mATX:2,ATX:3};
export function buildHealth(parts={},report={}){
 const p=k=>parts?.[k]||null;
 const checks=[];
 const add=(name,status,detail)=>checks.push({name,status,detail});
 const cpu=p('cpu'),board=p('board'),ram=p('ram'),chassis=p('case'),
       gpu=p('gpu'),psu=p('psu'),cooler=p('cooler');
 if(cpu&&board&&cpu.socket&&board.socket){
  add('Socket do processador',cpu.socket===board.socket?'match':'error',
    cpu.socket===board.socket?cpu.socket+' nos dois componentes; confirme revisão e BIOS.':'Sockets diferentes: '+cpu.socket+' e '+board.socket+'.');
 }else add('Socket do processador','unknown','Escolha CPU e placa-mãe com socket documentado.');
 if(board&&ram&&board.memory&&ram.memory){
  add('Memória RAM',board.memory!==ram.memory?'error':ram.titleDerived?'warning':'match',
   board.memory!==ram.memory?'Memórias incompatíveis: '+board.memory+' e '+ram.memory+'.':ram.titleDerived?'O título do anúncio declara '+ram.memory+'. Confirme tipo físico, QVL e controladora da CPU.':'Ambos usam '+ram.memory+'; valide QVL e controladora da CPU.');
 }else add('Memória RAM','unknown','Confirme a geração DDR, slots e limites suportados.');
 if(chassis&&board&&forms[chassis.form]&&forms[board.form]){
  add('Gabinete e placa-mãe',forms[board.form]<=forms[chassis.form]?'match':'error',
   forms[board.form]<=forms[chassis.form]?'Formato da placa cabe no padrão cadastrado.':'Formato da placa maior do que o do gabinete.');
 }else add('Gabinete e placa-mãe','unknown','Dimensões do gabinete e formato da placa ainda não confirmados.');
 if(gpu?.id==='igpu'){
  add('Vídeo integrado',cpu?.igpu===true?'match':'error',
    cpu?.igpu===true?'CPU declara vídeo integrado; confira a saída de vídeo da placa.':'Vídeo integrado depende de processador compatível.');
 }else if(gpu&&chassis&&Number.isFinite(gpu.lengthMm)&&Number.isFinite(chassis.gpuMaxMm)){
  add('Espaço da placa de vídeo',gpu.lengthMm<=chassis.gpuMaxMm?'match':'error',
    gpu.lengthMm<=chassis.gpuMaxMm?'Comprimento informado dentro do limite cadastrado.':'Placa de vídeo maior do que o espaço informado no gabinete.');
 }else add('Espaço da placa de vídeo','unknown','Comprimento, espessura e cabos da GPU precisam ser conferidos.');
 const watts=Number(report?.estimatedWatts);
 const recommended=cpu&&gpu&&Number.isFinite(watts)&&watts>0?Math.ceil(watts*1.4/50)*50:null;
 if(recommended!==null&&psu&&Number.isFinite(psu.watts)&&psu.watts>0){
  add('Fonte e potência',psu.watts<recommended||psu.titleDerived?'warning':'match',
    'Estimativa ilustrativa: '+watts+' W; margem sugerida '+recommended+' W; fonte '+psu.watts+' W '+(psu.titleDerived?'declarada apenas no anúncio':'cadastrada')+'. Verifique potência real, conectores e qualidade.');
 }else add('Fonte e potência','unknown','Escolha CPU, GPU e uma fonte com potência nominal documentada.');
 if(cpu&&cooler&&Array.isArray(cooler.sockets)&&cpu.socket){
  add('Cooler e fixação',cooler.sockets.includes(cpu.socket)?'match':'error',
   cooler.sockets.includes(cpu.socket)?'Fixação declarada compatível; revise altura e capacidade térmica.':'Fixação do cooler não declara o socket '+cpu.socket+'.');
 }else add('Cooler e fixação','unknown','Confirme fixação, altura, refrigeração e se a CPU inclui cooler.');
 add('BIOS e conectores','unknown','Confirmar suporte à CPU por revisão/BIOS, EPS, PCIe, 12V-2x6 e conexões SATA/M.2 no fabricante.');
 const error=Array.isArray(report?.errors)?report.errors.length:0;
 return {checks,estimatedWatts:recommended!==null?watts:null,recommendedWatts:recommended,
  errors:error,complete:report.complete===true,hasUnknown:checks.some(x=>x.status==='unknown')};
}