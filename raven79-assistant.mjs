/** Raven Assistente Beta 7.9. Motor local de regras; NÃO é modelo generativo.
 * Só consulta ofertas publicadas do mesmo site, sem enviar conversas a terceiros.
 */
const fold=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function understandHardwareRequest(query){
 const text=fold(query).slice(0,500);
 let budget=null;
 const mil=text.match(/(?:r\$\s*)?(\d{1,3}(?:[.,]\d{1,2})?)\s*mil\b/);
 if(mil)budget=Math.round(Number(mil[1].replace(',','.'))*1000);
 if(budget===null){
  const currency=text.match(/r\$\s*([\d.,]+)/);
  const candidates=currency?[currency[1]]:[...(text.matchAll(/\b(\d{3,5}(?:[.,]\d{2})?)\b/g))].map(x=>x[1]);
  for(const item of candidates){
   const value=item.includes('.')&&item.includes(',')?Number(item.replace(/\./g,'').replace(',','.')) :
    /\.\d{3}$/.test(item)?Number(item.replace('.','')) :Number(item.replace(',','.'));
   if(Number.isFinite(value)&&value>=600&&value<=100000){budget=value;break;}
  }
 }
 if(budget!==null&&(budget<600||budget>100000))budget=null;
 let purpose='general';
 if(/\b(?:jogos?|gamer|fps|fortnite|valorant|gta|minecraft|cyberpunk)\b/.test(text))purpose='games';
 if(/\b(?:edicao|editar|criacao|renderizar|render|design|3d|photoshop|premiere|davinci)\b/.test(text))purpose='creative';
 if(/\b(?:upgrade|melhorar|atualizar|trocar pecas|futuro)\b/.test(text))purpose='upgrade';
 if(/\b(?:economizar|barato|economia|mais barato)\b/.test(text))purpose='economy';
 let brand='all';
 if(/\b(?:amd|ryzen)\b/.test(text)&&!/\bintel\b/.test(text))brand='amd';
 if(/\b(?:intel|core i[3579])\b/.test(text)&&!/\bamd\b/.test(text))brand='intel';
 const questions=[];
 if(/\b(?:quanto|preco|valor)\b/.test(text))questions.push('preço');
 if(/\b(?:compatibilidade|compativel|socket|ddr|fonte)\b/.test(text))questions.push('compatibilidade');
 return {budget,purpose,brand,storage:/\bssd\b/.test(text)?'ssd':'any',questions,
  understood:Boolean(text.trim()),method:'regras locais',privacy:'A mensagem não é enviada a nenhuma API de IA'};
}
export function assistantExplanation(request,result){
 if(!request.understood)return 'Descreva o uso e informe um orçamento, por exemplo: PC para jogos até R$ 3.000.';
 if(request.budget===null)return 'Informe um orçamento entre R$ 600 e R$ 100.000 para consultar ofertas. Exemplo: Quero um PC para edição por R$ 4.000.';
 if(!result?.chosen)return 'Não encontrei combinações suficientes nas ofertas publicadas e recentes. Não vou completar sua montagem com preços ilustrativos. Tente outro orçamento ou aguarde novas peças.';
 const q=result.chosen;
 const limit=result.withinBudget?'dentro do orçamento informado':'acima do orçamento informado';
 const completeness=result.completeQuote?'com categorias cotadas ou cooler informado':'parcial; há componentes sem cotação confirmada';
 return 'Encontrei uma proposta '+limit+' ('+completeness+'). '+
  'Subtotal cadastrado: '+Number(q.cost).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})+'. '+
  'A seleção usa regras de categoria, socket e peças anunciadas, não testes de desempenho ou estoque em tempo real. '+
  (q.unknown?.length?'Há '+q.unknown.length+' verificações técnicas pendentes. ':'')+
  'Confira o anúncio, a BIOS, a fonte, o cooler e o frete antes de comprar.';
}
