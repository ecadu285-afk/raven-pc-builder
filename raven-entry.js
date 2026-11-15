/**
 * Raven PC Builder · primeira visita.
 * Reaproveita o Supabase Auth da loja (sessão persistente, sem guardar senhas no código).
 * Visitantes podem navegar sem login; dados salvos exigem conta.
 */
import { ravenGetAccount, ravenGetSupabaseClient } from './raven-account.js';

const panel=document.getElementById('raven-entry');
if(panel){
 const $=id=>panel.querySelector('#'+id);
 let mode='login',working=false,accountReady=false;
 const guestFlag='raven_visitor_guest_v1';
 let browsed=false;
 try{browsed=sessionStorage.getItem(guestFlag)==='yes';}catch{}
 function message(msg,err=false){
   const status=$('entryStatus');status.textContent=msg;status.dataset.error=String(err);
 }
 function screen(next){
   mode=next;
   $('entryNameRow').hidden=next!=='signup';
   $('entryEmailRow').hidden=false;
   $('entryPasswordRow').hidden=next==='forgot';
   $('entryPassword').required=next!=='forgot';
   $('entryName').required=next==='signup';
   $('entryPassword').autocomplete=next==='signup'?'new-password':'current-password';
   $('entryTitle').textContent=next==='signup'?'Crie sua conta Raven':next==='forgot'?'Recuperar acesso':'Bem-vindo de volta';
   $('entrySubtitle').textContent=next==='signup'?'Uma conta para acompanhar seus PCs e produtos favoritos.':next==='forgot'?'Enviaremos um link seguro para redefinir sua senha.':'Entre e continue exatamente de onde parou.';
   $('entrySubmit').textContent=next==='signup'?'Criar minha conta':next==='forgot'?'Enviar recuperação':'Entrar na minha conta';
   $('entryLoginTab').setAttribute('aria-selected',String(next==='login'));
   $('entrySignupTab').setAttribute('aria-selected',String(next==='signup'));
   $('entryTabs').hidden=next==='forgot';
   $('entryForgot').hidden=next==='forgot';
   $('entryReturn').hidden=next!=='forgot';
   $('entryPassword').value='';
   message('');
 }
 function render(){
   // Espera carregar o estado de autenticação; evita mostrar login
   // para usuários já conectados.
   if(!accountReady)return;
   const needLogin=!ravenGetAccount()&&!browsed;
   panel.hidden=!needLogin;
   document.body.classList.toggle('raven-entry-active',needLogin);
   if(needLogin){$('entryEmail').focus({preventScroll:true});}
 }
 function authReady(){accountReady=true;render();}
 window.addEventListener('raven-auth-ready',authReady);
 window.addEventListener('raven-market-update',authReady);
 // Caso o estado tenha sido carregado antes do módulo da tela.
 if(ravenGetSupabaseClient()){
   ravenGetSupabaseClient().auth.getUser().then(authReady).catch(authReady);
 }
 $('entryLoginTab').addEventListener('click',()=>screen('login'));
 $('entrySignupTab').addEventListener('click',()=>screen('signup'));
 $('entryForgot').addEventListener('click',()=>screen('forgot'));
 $('entryReturn').addEventListener('click',()=>screen('login'));
 $('entryGuest').addEventListener('click',()=>{
   browsed=true;
   try{sessionStorage.setItem(guestFlag,'yes')}catch{}
   render();
 });
 $('entryForm').addEventListener('submit',async ev=>{
   ev.preventDefault();
   if(working)return;
   const client=ravenGetSupabaseClient();
   if(!client){message('Conexão com o sistema de contas indisponível. Recarregue e tente novamente.',true);return}
   const email=$('entryEmail').value.trim().toLowerCase();
   const password=$('entryPassword').value;
   const name=$('entryName').value.trim();
   if(mode==='signup'&&name.length<2){message('Informe seu nome com pelo menos dois caracteres.',true);return}
   if(mode!=='forgot'&&password.length<8){message('A senha precisa ter pelo menos oito caracteres.',true);return}
   working=true;$('entrySubmit').disabled=true;message('Processando...');
   try{
     if(mode==='login'){
       const {error}=await client.auth.signInWithPassword({email,password});
       if(error)throw error;
       message('Conectado. Carregando suas informações...');
       // O evento SIGNED_IN atualiza o estado e fecha a tela.
     }else if(mode==='signup'){
       const {data,error}=await client.auth.signUp({
         email,password,
         options:{
           data:{full_name:name},
           emailRedirectTo:new URL('index.html',location.href).href
         }
       });
       if(error)throw error;
       if(data.session)message('Conta criada. Carregando suas informações...');
       else message('Confira seu e-mail para confirmar o cadastro. Depois, entre com sua senha.');
     }else{
       const {error}=await client.auth.resetPasswordForEmail(email,{
         redirectTo:new URL('index.html',location.href).href
       });
       if(error)throw error;
       message('Se o e-mail estiver cadastrado, você receberá um link de recuperação.');
     }
   }catch(error){
     const detail=String(error?.message||'');
     message(/invalid login credentials/i.test(detail)
       ?'E-mail ou senha não conferem. Use “Esqueci minha senha” se sua conta foi criada por convite.'
       :/email not confirmed/i.test(detail)
         ?'Confirme seu e-mail antes de entrar.'
         :/rate limit|too many requests/i.test(detail)
           ?'Muitas tentativas. Tente novamente mais tarde.'
           :'Não foi possível concluir. Confira os dados e tente novamente.',true);
   }finally{working=false;$('entrySubmit').disabled=false;}
 });
 screen(new URLSearchParams(location.search).get('conta')==='cadastro'?'signup':'login');
 // Caso o SDK falhe, não deixe o visitante preso:
 setTimeout(()=>{
   if(accountReady)return;
   accountReady=true;message('Não conseguimos carregar a conta. Você pode navegar como visitante.',true);render();
 },12000);
}
