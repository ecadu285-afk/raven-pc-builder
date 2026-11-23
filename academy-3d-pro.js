/**
 * RAVEN Academy · 3D Pro Lab
 * Simulação educativa, não representa medidas/encaixes exatos de produtos.
 * Dependência única: Three.js (mesma versão usada anteriormente).
 */
export async function createAcademy3D({host, fallback, onSelect = () => {}, onStatus = () => {}} = {}) {
  if (!host) throw new Error('Área do laboratório não encontrada.');
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');
  const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({antialias: !lowPower, alpha: true, powerPreference: lowPower ? 'low-power' : 'high-performance'});
  } catch (error) {
    throw new Error('O navegador não conseguiu iniciar o WebGL.');
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.15 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.38;
  renderer.setClearColor(0x07100d, 0);
  host.replaceChildren(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'Modelo 3D de computador. Use o mouse para girar e clicar nas peças.');
  renderer.domElement.style.cursor = 'grab';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 80);
  const root = new THREE.Group();
  scene.add(root);
  scene.add(new THREE.HemisphereLight(0xe8fff0, 0x152822, 2.3));
  const key = new THREE.DirectionalLight(0xf3fff4, 3.0);
  key.position.set(4, 6, 7); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9ac9ff, 1.5);
  fill.position.set(-4, 1, 3); scene.add(fill);
  const rim = new THREE.PointLight(0xa9ff74, 20, 11);
  rim.position.set(-3, 3, -1); scene.add(rim);

  const M = {
    shell: new THREE.MeshStandardMaterial({color:0x2b3539, metalness:.72, roughness:.33}),
    edge: new THREE.MeshStandardMaterial({color:0x8ba59d, metalness:.82, roughness:.25}),
    black: new THREE.MeshStandardMaterial({color:0x10191a, metalness:.35, roughness:.48}),
    matte: new THREE.MeshStandardMaterial({color:0x192825, metalness:.26, roughness:.57}),
    pcb: new THREE.MeshStandardMaterial({color:0x16433a, metalness:.18, roughness:.67}),
    trace: new THREE.MeshStandardMaterial({color:0x6aab8b, metalness:.35, roughness:.38}),
    gold: new THREE.MeshStandardMaterial({color:0xc7a46d, metalness:.74, roughness:.31}),
    silver: new THREE.MeshStandardMaterial({color:0xb4c5c2, metalness:.78, roughness:.25}),
    chip: new THREE.MeshStandardMaterial({color:0x111c20, metalness:.2, roughness:.45}),
    accent: new THREE.MeshStandardMaterial({color:0xbaff63, metalness:.2, roughness:.26, emissive:0x245015, emissiveIntensity:.44}),
    mutedAccent: new THREE.MeshStandardMaterial({color:0x5d9e73, metalness:.2, roughness:.42}),
    glass: new THREE.MeshPhysicalMaterial({color:0xc2f5e2, transparent:true, opacity:.075, metalness:0, roughness:.12, side:THREE.DoubleSide, depthWrite:false}),
    fan: new THREE.MeshStandardMaterial({color:0x485e5b, metalness:.55, roughness:.34}),
    label: new THREE.MeshBasicMaterial({color:0xeaffd0})
  };

  const ids = ['case','board','cpu','ram','gpu','ssd','fan','psu'];
  const names = {case:'Gabinete',board:'Placa-mãe',cpu:'Processador',ram:'Memória RAM',gpu:'Placa de vídeo',ssd:'Armazenamento SSD',fan:'Ventoinhas',psu:'Fonte de alimentação'};
  const descriptions = {
    case:'Estrutura que protege as peças e organiza fluxo de ar e cabos.',
    board:'Conecta CPU, RAM, SSD, placa de vídeo e periféricos.',
    cpu:'Processa instruções e precisa de refrigeração compatível.',
    ram:'Armazena temporariamente dados dos programas; observe o padrão DDR.',
    gpu:'Processa gráficos e exige espaço, energia e conexões compatíveis.',
    ssd:'Armazena sistema e arquivos; verifique SATA ou NVMe.',
    fan:'Move o ar para resfriar componentes e dissipadores.',
    psu:'Fornece energia ao PC; não abra a fonte, mesmo desconectada.'
  };
  const sections = Object.fromEntries(ids.map(id => [id, new THREE.Group()]));
  for (const [id, group] of Object.entries(sections)) { group.name = id; root.add(group); }
  const meshes = [];
  function attach(id, mesh, {pickable = true} = {}) {
    mesh.userData.partId = id;
    mesh.userData.pickable = pickable;
    meshes.push(mesh);
    sections[id].add(mesh);
    return mesh;
  }
  function box(id, w, h, d, x, y, z, mat, opts) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    mesh.position.set(x,y,z);
    return attach(id,mesh,opts);
  }
  function cyl(id,r,height,x,y,z,mat,axis = 'z') {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r,r,height,28),mat);
    mesh.position.set(x,y,z);
    if(axis === 'z') mesh.rotation.x = Math.PI/2;
    if(axis === 'x') mesh.rotation.z = Math.PI/2;
    return attach(id,mesh);
  }
  function ring(id,r,x,y,z,mat,tube = .024) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,34),mat);
    mesh.position.set(x,y,z);
    return attach(id,mesh);
  }
  function line(id,x1,y1,x2,y2,z,mat,thickness=.012) {
    const dx=x2-x1,dy=y2-y1,length=Math.hypot(dx,dy);
    const bar = box(id,thickness,length,.01,(x1+x2)/2,(y1+y2)/2,z,mat);
    bar.rotation.z = -Math.atan2(dx,dy);
    return bar;
  }

  // Gabinete ATX ilustrativo: chassis, trilhos, pés, painel de vidro leve.
  box('case',3.02,.09,1.94,0,-1.58,0,M.shell);
  box('case',3.02,.09,1.94,0,1.58,0,M.shell);
  for(const x of [-1.47,1.47]) for(const z of [-.94,.94]) box('case',.075,3.13,.075,x,0,z,M.edge);
  box('case',3.02,3.13,.07,0,0,-.95,M.black);
  box('case',3.02,3.13,.035,0,0,.95,M.glass,{pickable:false});
  for(const y of [-1.63,1.63]) box('case',3.08,.07,.09,0,y,.95,M.edge);
  for(const x of [-1.48,1.48]) box('case',.07,3.2,.09,x,0,.95,M.edge);
  for(const x of [-1.07,1.07]) box('case',.50,.16,.80,x,-1.72,-.16,M.matte);
  for(let i=0;i<5;i++) box('case',.20,.025,.035,-.95+i*.47,1.65,.35,M.mutedAccent,{pickable:false});

  // PCB, barramentos, slots e trilhas.
  box('board',1.78,2.42,.10,-.40,.08,-.69,M.pcb);
  box('board',1.61,2.23,.012,-.40,.08,-.628,M.matte);
  for(let i=0;i<5;i++) {
    line('board',-1.13,-.83+i*.27,.22,-.66+i*.34,-.615,M.trace,.013);
    line('board',-.98,.91-i*.26,.18,.66-i*.23,-.612,M.trace,.008);
  }
  for(let i=0;i<4;i++) {
    box('board',.15,.13,.038,-1.11+i*.14,1.04,-.56,M.silver);
    box('board',.11,.12,.032,-1.10+i*.16,-1.02,-.56,M.chip);
  }
  for(let i=0;i<3;i++) {
    box('board',1.28,.07,.10,-.41,-.49-i*.19,-.54,i===0?M.silver:M.black);
    box('board',.47,.23,.05,-.89,1.05-i*.20,-.56,M.chip);
  }
  for(let i=0;i<4;i++) box('board',.13,.09,.06,.22-i*.26,-.99,-.55,M.gold);
  for(let i=0;i<7;i++) cyl('board',.014,.016,-1.12+i*.32,1.16,-.53,M.gold);

  // CPU: soquete, tampa metálica, contatos e dissipador com aletas.
  box('cpu',.83,.83,.08,-.72,.46,-.53,M.black);
  box('cpu',.70,.70,.085,-.72,.46,-.44,M.silver);
  box('cpu',.53,.53,.015,-.72,.46,-.383,M.edge);
  for(let i=0;i<8;i++)box('cpu',.65,.022,.16,-.72,.17+i*.084,-.30,M.silver);
  for(let i=0;i<4;i++)box('cpu',.05,.46,.19,-.98+i*.17,.47,-.29,M.edge);

  // RAM: PCB e oito chips por pente, contacts no encaixe.
  for(let stick=0;stick<2;stick++){
    const x=.35+stick*.22;
    box('ram',.14,1.38,.065,x,.35,-.52,M.pcb);
    for(let i=0;i<7;i++)box('ram',.115,.105,.022,x,-.20+i*.17,-.47,M.chip);
    for(let i=0;i<9;i++)box('ram',.10,.018,.024,x,-.315+i*.058,-.44,M.gold);
    box('ram',.16,.17,.08,x,1.03,-.51,M.accent);
  }

  // GPU: backplate, dois coolers e conectores PCIe.
  box('gpu',2.18,.58,.38,-.10,-.65,-.05,M.shell);
  box('gpu',2.07,.46,.024,-.10,-.65,.16,M.black);
  box('gpu',2.08,.09,.11,-.10,-.98,-.09,M.pcb);
  for(let i=0;i<12;i++)box('gpu',.075,.045,.018,-.96+i*.17,-1.045,-.05,M.gold);
  for(let i=0;i<2;i++){
    const cx=-.60+i*.99;
    ring('gpu',.23,cx,-.65,.19,M.edge,.021);
    cyl('gpu',.085,.028,cx,-.65,.21,M.matte);
    for(let n=0;n<7;n++){
      const a=n*2*Math.PI/7;
      const blade=box('gpu',.075,.17,.019,cx+Math.cos(a)*.11,-.65+Math.sin(a)*.11,.226,M.fan);
      blade.rotation.z=-a;
    }
  }
  box('gpu',.21,.46,.16,1.07,-.65,-.06,M.matte);

  // SSD M.2: placa, controlador e memória flash.
  box('ssd',.68,.17,.05,-.92,-.37,-.48,M.pcb);
  for(let i=0;i<3;i++)box('ssd',.12,.10,.021,-1.16+i*.20,-.37,-.44,M.chip);
  box('ssd',.075,.13,.02,-.58,-.37,-.42,M.gold);

  // PSU: caixa fechada e grade externa (não desmontável).
  box('psu',1.03,.61,1.12,.76,-1.20,-.27,M.shell);
  box('psu',.90,.48,.02,.76,-1.20,.30,M.matte);
  ring('psu',.20,.76,-1.20,.318,M.edge,.012);
  for(let i=-2;i<=2;i++)line('psu',.56,-1.20+i*.072,.96,-1.20+i*.072,.328,M.edge,.012);
  box('psu',.23,.09,.04,1.05,-1.40,.31,M.accent);

  // Fans: suporte, raios e pás.
  const fans = [];
  for(let i=0;i<3;i++) {
    const y=.95-i*.90,x=1.06,z=-.49;
    box('fan',.70,.70,.08,x,y,z,M.black);
    ring('fan',.29,x,y,z+.06,M.edge,.025);
    cyl('fan',.055,.07,x,y,z+.12,M.matte);
    // Rotor único: cada pá gira ao redor do eixo, não individualmente.
    const rotor=new THREE.Group();
    rotor.position.set(x,y,z+.09);
    sections.fan.add(rotor);
    for(let j=0;j<7;j++){
      const angle=j*Math.PI*2/7;
      const blade=new THREE.Mesh(new THREE.BoxGeometry(.105,.26,.024),M.fan);
      blade.position.set(Math.cos(angle)*.135,Math.sin(angle)*.135,0);
      blade.rotation.z=-angle+.24;
      blade.userData.partId='fan';blade.userData.pickable=true;
      meshes.push(blade);rotor.add(blade);
    }
    fans.push(rotor);
  }

  const highlights = new Map();
  for(const mesh of meshes){
    mesh.userData.baseMaterial=mesh.material;
    if(!highlights.has(mesh.material)){
      const m=mesh.material.clone();
      if(m.emissive) { m.emissive.setHex(0x4b7c24); m.emissiveIntensity=.42; }
      highlights.set(mesh.material,m);
    }
    mesh.userData.highlightMaterial=highlights.get(mesh.material);
  }

  const explodeOffsets={
    case:[0,0,0],board:[-.30,.15,-.60],cpu:[-.95,.53,.88],ram:[.61,.75,.88],
    gpu:[-.11,-.29,1.07],ssd:[-.79,-.42,.65],fan:[.94,.06,.83],psu:[.86,-.47,.50]
  };
  const targets=Object.fromEntries(ids.map(id=>[id,new THREE.Vector3(...explodeOffsets[id])]));
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let focusId='board', hoverId=null, exploded=false, autoRotate=!reducedMotion;
  let yaw=-.35,pitch=.08,distance=6.65,targetDistance=6.65;
  let desiredYaw=-.35,desiredPitch=.08,viewTarget=new THREE.Vector3(),desiredTarget=new THREE.Vector3();
  let drag=false,moved=false,lastX=0,lastY=0,startX=0,startY=0,mode='explore';
  let active=true,visible=true,raf=0,prevFrame=0;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  function selectedGeometry() {
    const selected=focusId==='case'?null:focusId;
    for(const mesh of meshes){
      const shouldGlow=mesh.userData.partId===selected && mesh.userData.baseMaterial!==M.glass;
      mesh.material=shouldGlow?mesh.userData.highlightMaterial:mesh.userData.baseMaterial;
    }
  }
  function focus(id, userInitiated=false) {
    if(!sections[id]) id='board';
    focusId=id;
    const bounds=new THREE.Box3().setFromObject(sections[id]);
    if(bounds.isEmpty()) desiredTarget.set(0,0,0);
    else bounds.getCenter(desiredTarget);
    targetDistance=id==='case'?6.8:5.1;
    selectedGeometry();
    if(userInitiated) onSelect({id,name:names[id],description:descriptions[id]});
    return id;
  }
  function setExploded(next=!exploded) {
    exploded=Boolean(next);
    onStatus({exploded,autoRotate,mode,focusId});
    return exploded;
  }
  function setRotation(next=!autoRotate) {
    autoRotate=Boolean(next)&&!reducedMotion;
    onStatus({exploded,autoRotate,mode,focusId});
    return autoRotate;
  }
  function setMode(next){
    if(!['explore','assembly','clean','diagnostics'].includes(next))return mode;
    mode=next;
    // Montagem começa com as peças separadas; outros modos preservam controle do usuário.
    exploded=next==='assembly';
    if(next==='clean'){focus('fan');}
    if(next==='diagnostics'){focus('psu');}
    onStatus({exploded,autoRotate,mode,focusId});
    return mode;
  }
  function reset(){
    desiredYaw=-.35;desiredPitch=.08;targetDistance=6.65;
    focus('case');onStatus({exploded,autoRotate,mode,focusId});
  }
  function pick(event){
    const rect=renderer.domElement.getBoundingClientRect();
    if(!rect.width||!rect.height)return null;
    pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
    pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(pointer,camera);
    const list=raycaster.intersectObjects(meshes,false);
    return list.find(hit=>hit.object.userData.pickable!==false)?.object.userData.partId || null;
  }
  function showHover(id,e){
    if(id===hoverId)return;
    hoverId=id;
    renderer.domElement.style.cursor=id?'pointer':drag?'grabbing':'grab';
    host.title=id?names[id]+' — clique para detalhes':'Arraste para girar o computador';
  }
  function down(e){
    if(e.button!==0 && e.pointerType==='mouse')return;
    drag=true;moved=false;startX=lastX=e.clientX;startY=lastY=e.clientY;
    renderer.domElement.setPointerCapture?.(e.pointerId);
    renderer.domElement.style.cursor='grabbing';
  }
  function move(e){
    if(!drag){showHover(pick(e),e);return;}
    const dx=e.clientX-lastX,dy=e.clientY-lastY;
    if(Math.hypot(e.clientX-startX,e.clientY-startY)>5)moved=true;
    if(moved){
      desiredYaw+=dx*.008;
      desiredPitch=clamp(desiredPitch+dy*.0055,-.62,.65);
      autoRotate=false;
    }
    lastX=e.clientX;lastY=e.clientY;
  }
  function up(e){
    const wasDrag=drag;drag=false;
    renderer.domElement.style.cursor='grab';
    if(wasDrag&&!moved){
      const id=pick(e);
      if(id)focus(id,true);
    }
    try{if(renderer.domElement.hasPointerCapture?.(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);}catch{}
  }
  function wheel(e){
    e.preventDefault();targetDistance=clamp(targetDistance+e.deltaY*.006,3.2,10.4);
    autoRotate=false;
  }
  function keydown(e){
    if(e.key==='ArrowLeft'){desiredYaw-=.22;e.preventDefault();}
    else if(e.key==='ArrowRight'){desiredYaw+=.22;e.preventDefault();}
    else if(e.key==='ArrowUp'){desiredPitch=clamp(desiredPitch-.15,-.62,.65);e.preventDefault();}
    else if(e.key==='ArrowDown'){desiredPitch=clamp(desiredPitch+.15,-.62,.65);e.preventDefault();}
    else if(e.key==='+'||e.key==='='){targetDistance=clamp(targetDistance-.5,3.2,10.4);e.preventDefault();}
    else if(e.key==='-'){targetDistance=clamp(targetDistance+.5,3.2,10.4);e.preventDefault();}
    else if(e.key==='Escape'){reset();e.preventDefault();}
    if(e.defaultPrevented)autoRotate=false;
  }
  renderer.domElement.tabIndex=0;
  renderer.domElement.addEventListener('pointerdown',down);
  renderer.domElement.addEventListener('pointermove',move);
  renderer.domElement.addEventListener('pointerup',up);
  renderer.domElement.addEventListener('pointercancel',up);
  renderer.domElement.addEventListener('lostpointercapture',()=>{drag=false;});
  renderer.domElement.addEventListener('wheel',wheel,{passive:false});
  renderer.domElement.addEventListener('keydown',keydown);

  function resize(){
    if(!active)return;
    const w=Math.max(host.clientWidth,1),h=Math.max(host.clientHeight,1);
    camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  const ro=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;
  ro?.observe(host);
  window.addEventListener('resize',resize);
  const io=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
    visible=entries.some(entry=>entry.isIntersecting);
  },{threshold:0}):null;
  io?.observe(host);
  resize();

  const zero=new THREE.Vector3(),focusBounds=new THREE.Box3(),focusCenter=new THREE.Vector3();
  function frame(ms){
    if(!active)return;
    raf=requestAnimationFrame(frame);
    if(document.hidden||!visible||!host.offsetParent){prevFrame=ms;return;}
    const minInterval=lowPower?1000/35:1000/60;
    if(ms-prevFrame<minInterval)return;
    const dt=Math.min(.05,(ms-prevFrame)/1000||.016);
    prevFrame=ms;
    const ease=Math.min(1,dt*(reducedMotion?18:7));
    if(autoRotate&&!drag)desiredYaw+=dt*.09;
    yaw+=(desiredYaw-yaw)*ease;
    pitch+=(desiredPitch-pitch)*ease;
    distance+=(targetDistance-distance)*ease;
    viewTarget.lerp(desiredTarget,ease);
    root.rotation.set(pitch,yaw,0);
    for(const [id,group] of Object.entries(sections)){
      const offset=exploded?targets[id]:zero;
      group.position.lerp(offset,ease);
    }
    // As ventoinhas só giram no modo normal; em limpeza ficam paradas.
    if(!reducedMotion && mode!=='clean'){
      for(const rotor of fans)rotor.rotation.z-=dt*1.55;
    }
    const selected=sections[focusId];
    if(selected){
      focusBounds.setFromObject(selected);
      if(!focusBounds.isEmpty()){
        focusBounds.getCenter(focusCenter);
        desiredTarget.lerp(focusCenter,Math.min(1,dt*4));
      }
    }
    camera.position.set(viewTarget.x,viewTarget.y+.56,viewTarget.z+distance);
    camera.lookAt(viewTarget);
    renderer.render(scene,camera);
  }
  focus('board');
  raf=requestAnimationFrame(frame);
  fallback.hidden=true;
  onStatus({exploded,autoRotate,mode,focusId,lowPower});

  function dispose(){
    if(!active)return;
    active=false;cancelAnimationFrame(raf);
    ro?.disconnect();io?.disconnect();
    window.removeEventListener('resize',resize);
    renderer.domElement.removeEventListener('pointerdown',down);
    renderer.domElement.removeEventListener('pointermove',move);
    renderer.domElement.removeEventListener('pointerup',up);
    renderer.domElement.removeEventListener('pointercancel',up);
    renderer.domElement.removeEventListener('wheel',wheel);
    renderer.domElement.removeEventListener('keydown',keydown);
    const geometries=new Set(meshes.map(m=>m.geometry));
    geometries.forEach(g=>g.dispose());
    new Set([...Object.values(M),...highlights.values()]).forEach(m=>m.dispose());
    renderer.dispose();renderer.forceContextLoss?.();
  }
  return {focus,setMode,setExploded,setRotation,reset,dispose,partNames:names,partDescriptions:descriptions,getState:()=>({exploded,autoRotate,mode,focusId,lowPower})};
}
