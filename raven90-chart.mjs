/** Histórico gráfico: somente pontos existentes, sem projeções. */
export function linesFromRegisteredPrices(points=[]){
 const byStore=new Map();
 for(const p of points){
  if(!p||!/^\d{4}-\d{2}-\d{2}$/.test(String(p.date||''))||!Number.isFinite(p.price)||p.price<=0)continue;
  const store=String(p.store||'loja');if(!byStore.has(store))byStore.set(store,new Map());
  byStore.get(store).set(p.date,{date:p.date,price:p.price,store});
 }
 return [...byStore.entries()].map(([store,map])=>({store,points:[...map.values()].sort((a,b)=>a.date.localeCompare(b.date))})).filter(x=>x.points.length>=2);
}
export function renderRecordedPriceChart(parent,points=[]){
 if(!parent||typeof document==='undefined')return false;
 const series=linesFromRegisteredPrices(points);
 const all=series.flatMap(s=>s.points);if(!series.length)return false;
 const dates=[...new Set(all.map(x=>x.date))].sort(),max=Math.max(...all.map(x=>x.price)),min=Math.min(...all.map(x=>x.price));
 const NS='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 700 250');
 svg.setAttribute('role','img');svg.setAttribute('aria-label','Gráfico de preços históricos cadastrados por loja. Datas '+dates[0]+' a '+dates.at(-1)+'.');
 svg.style.width='100%';svg.style.height='auto';
 const colors=['#abed9a','#d7abff','#fbb679','#9dceff','#f6db81'];
 const x=d=>48+(dates.length===1?0:((dates.indexOf(d))/(dates.length-1))*610);
 const y=p=>216-((p-min)/(max-min||1))*173;
 const add=(tag,attrs,text)=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;svg.appendChild(n);return n};
 add('line',{x1:48,y1:216,x2:660,y2:216,stroke:'#9ca3af'});
 add('text',{x:48,y:239,fill:'#ddd','font-size':12},dates[0]);
 add('text',{x:600,y:239,fill:'#ddd','font-size':12},dates.at(-1));
 series.forEach((group,i)=>{
  const color=colors[i%colors.length];
  const list=group.points.map(p=>x(p.date).toFixed(1)+','+y(p.price).toFixed(1)).join(' ');
  add('polyline',{points:list,fill:'none',stroke:color,'stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'});
  for(const p of group.points){
   const dot=add('circle',{cx:x(p.date),cy:y(p.price),r:4,fill:color});
   const title=document.createElementNS(NS,'title');title.textContent=group.store+' · '+p.date+' · R$ '+p.price.toFixed(2);dot.append(title);
  }
 });
 parent.append(svg);
 const note=document.createElement('p');note.className='raven-muted';note.textContent=series.map((s,i)=>s.store+' ('+s.points.length+' registros)').join(' · ')+' — apenas preços cadastrados, não cotação em tempo real.';parent.append(note);
 return true;
}
