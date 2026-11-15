/**
 * Geolocalização opcional com consentimento.
 * Somente após clique: coordenadas atuais vão DIRETAMENTE do navegador para
 * BigDataCloud (serviço de geocodificação), nunca para nosso banco.
 * Armazenamos apenas CEP no Supabase se a pessoa clicar em "Salvar CEP".
 * API free client-side: https://www.bigdatacloud.com/docs/article/fair-use-policy-for-free-client-side-reverse-geocoding-api
 */
export function ravenLocate(){
 return new Promise((resolve,reject)=>{
   if(!window.isSecureContext || !navigator.geolocation){
     reject(Error('Localização automática indisponível. Digite seu CEP manualmente.'));return;
   }
   navigator.geolocation.getCurrentPosition(resolve,err=>{
     reject(Error(err.code===1
       ?'Você não autorizou a localização. Pode digitar seu CEP manualmente.'
       :err.code===3
         ?'A localização demorou muito. Tente novamente ou digite o CEP.'
         :'Não foi possível detectar sua posição. Digite seu CEP manualmente.'));
   },{enableHighAccuracy:false,timeout:11000,maximumAge:0});
 }).then(async position=>{
   const lat=position.coords.latitude,lon=position.coords.longitude;
   if(!Number.isFinite(lat)||!Number.isFinite(lon))throw Error('Coordenadas indisponíveis.');
   const url=new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
   url.searchParams.set('latitude',String(lat));
   url.searchParams.set('longitude',String(lon));
   url.searchParams.set('localityLanguage','pt');
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
   let data;
   try{
     const response=await fetch(url,{signal:controller.signal,cache:'no-store'});
     if(!response.ok)throw Error('Serviço de localização indisponível.');
     data=await response.json();
   }catch{
     throw Error('Não conseguimos identificar sua região agora. Você ainda pode informar o CEP manualmente.');
   }finally{clearTimeout(timer);}
   const city=String(data.city||data.locality||data.localityInfo?.administrative?.[0]?.name||'').slice(0,95);
   const state=String(data.principalSubdivisionCode||data.principalSubdivision||'').slice(0,80);
   const zip=String(data.postcode||data.postalCode||'').replace(/\D/g,'');
   return {city,state,cep:zip.length===8?zip:'',country:String(data.countryCode||'')};
 });
}
export function ravenInstallLocation(){
 const buttons=[...document.querySelectorAll('[data-raven-detect]')];
 for(const btn of buttons){
  btn.addEventListener('click',async()=>{
   if(btn.disabled)return;
   btn.disabled=true;
   const status=document.getElementById(btn.dataset.statusId||'ravenLocateStatus')
      ||document.getElementById('marketCepStatus');
   if(status)status.textContent='Solicitando permissão de localização...';
   try{
    const place=await ravenLocate();
    if(place.country && place.country!=='BR')throw Error('A detecção de CEP desta versão está disponível apenas no Brasil.');
    const placeText=[place.city,place.state].filter(Boolean).join(' · ');
    if(place.cep){
      const input=document.getElementById('marketCep');
      if(input)input.value=place.cep.slice(0,5)+'-'+place.cep.slice(5);
      if(status)status.textContent=(placeText?placeText+' — ':'')+'CEP aproximado: '+place.cep.slice(0,5)+'-'+place.cep.slice(5)+'. '+(input?'Confira e clique em Salvar CEP.':'Confira e informe o CEP na área Minha conta.');
    }else if(status){
      status.textContent=(placeText||'Região aproximada detectada')+'. Não encontramos um CEP confiável. Informe manualmente.';
    }
   }catch(err){if(status)status.textContent=err.message;}
   finally{btn.disabled=false;}
  });
 }
}
ravenInstallLocation();
