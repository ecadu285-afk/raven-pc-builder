import {
  ravenMarketUser, ravenMarketGetCep, ravenMarketSetCep, ravenMarketClearCep,
  ravenMarketOpenAccount
} from './raven-market.js';

const $=id=>document.getElementById(id);
let currentLoaded=null;
async function updateDashboard(){
 const user=ravenMarketUser();
 $('marketDashboardLogin').textContent=user?'Gerenciar conta / Sair':'Entrar / Criar conta';
 if(!user){
  currentLoaded=null;
  $('marketCep').value='';
  $('marketCepStatus').textContent='Entre ou crie uma conta para salvar seu CEP.';
  return;
 }
 if(currentLoaded===user.id)return;
 currentLoaded=user.id;
 $('marketCepStatus').textContent='Carregando seu CEP...';
 try{
  const cep=await ravenMarketGetCep();
  if(currentLoaded!==user.id)return;
  $('marketCep').value=cep?cep.slice(0,5)+'-'+cep.slice(5):'';
  $('marketCepStatus').textContent=cep?'CEP cadastrado. Frete e prazo dependem da loja.':'Nenhum CEP cadastrado.';
 }catch(err){$('marketCepStatus').textContent=err.message;}
}
$('marketDashboardLogin').addEventListener('click',ravenMarketOpenAccount);
$('marketCepForm').addEventListener('submit',async event=>{
 event.preventDefault();
 if(!ravenMarketUser()){ravenMarketOpenAccount();return;}
 const btn=$('marketCepForm').querySelector('button');
 btn.disabled=true;
 try{
  const cep=await ravenMarketSetCep($('marketCep').value);
  $('marketCep').value=cep.slice(0,5)+'-'+cep.slice(5);
  $('marketCepStatus').textContent='CEP salvo com sucesso. Consulte o frete na loja escolhida.';
 }catch(err){$('marketCepStatus').textContent=err.message;}
 finally{btn.disabled=false;}
});
$('marketCepClear').addEventListener('click',async ()=>{
 if(!ravenMarketUser()){ravenMarketOpenAccount();return;}
 const btn=$('marketCepClear');btn.disabled=true;
 try{
  await ravenMarketClearCep();
  $('marketCep').value='';
  $('marketCepStatus').textContent='CEP excluído da sua conta.';
 }catch(err){$('marketCepStatus').textContent=err.message;}
 finally{btn.disabled=false;}
});
window.addEventListener('raven-market-update',updateDashboard);
updateDashboard();
