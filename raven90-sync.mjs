/** Comparação local entre exportação do robô e offers.json; não publica. */
export function offerKey(offer){
 const store=String(offer?.store||'').trim().toLowerCase();
 const url=String(offer?.url||'').trim().replace(/\/+$/,'');
 return store&&url?store+'|'+url:null;
}
export function compareSiteBot(site,bot){
 const existing=Array.isArray(site?.offers)?site.offers:[];
 const incoming=Array.isArray(bot)?bot:Array.isArray(bot?.offers)?bot.offers:[];
 const map=new Map(existing.map(o=>[offerKey(o),o]).filter(x=>x[0]));
 const statuses={presentes:0,aguardando:0,divergentes:0,suspensos:0,invalidos:0};
 const rows=incoming.map(x=>{
  const key=offerKey(x);
  if(!key){statuses.invalidos++;return {partId:x?.partId??'',store:x?.store??'',status:'registro-invalido'}}
  if(x.reviewStatus==='hold'||x.reviewStatus==='rejected'){statuses.suspensos++;return {partId:x.partId,store:x.store,status:'suspenso-no-robo'}}
  const old=map.get(key);
  if(!old){statuses.aguardando++;return {partId:x.partId,store:x.store,status:'nao-encontrado-no-github'}}
  if(old.reviewStatus==='hold'||old.reviewStatus==='rejected'||old.reviewStatus==='pending'){
   statuses.suspensos++;return {partId:x.partId,store:x.store,status:'suspenso-no-site'}}
  const mismatch=old.price!==x.price||old.partId!==x.partId||old.checkedAt!==x.checkedAt;
  if(mismatch){statuses.divergentes++;return {partId:x.partId,store:x.store,status:'dados-divergentes'}}
  statuses.presentes++;return {partId:x.partId,store:x.store,status:'presente-no-arquivo-site'};
 });
 return {generatedAt:new Date().toISOString(),siteCount:existing.length,botCount:incoming.length,statuses,rows,
 note:'Presente em offers.json não comprova carregamento no navegador ou venda. O GitHub Pages publica após implantação.'};
}
