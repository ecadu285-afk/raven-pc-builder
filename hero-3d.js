/* Raven PC Studio — geometria 3D real de hardware, sem imagens rasterizadas.
   O modelo é ilustrativo, não representa uma placa-mãe ou marca específica. */
const host=document.querySelector('[data-raven-hero3d]');
if(host){
  const canvas=host.querySelector('canvas');
  const fallback=host.querySelector('.hardware-fallback');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  async function start(){
    if(!canvas||!window.WebGLRenderingContext){return;}
    let T;
    try{T=await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');}
    catch{return;}
    let renderer;
    try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});}catch{return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
    renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.5;
    canvas.hidden=false;
    if(fallback)fallback.hidden=true;
    const scene=new T.Scene();
    const camera=new T.PerspectiveCamera(33,1,.1,100);
    camera.position.set(5.2,4.4,12.4);camera.lookAt(0,0,0);
    scene.add(new T.AmbientLight(0x9fb1ff,2.0));
    const key=new T.DirectionalLight(0xffffff,4.5);key.position.set(-2,7,9);scene.add(key);
    const rim=new T.PointLight(0x9c5cff,80);rim.position.set(-5,-2,4);scene.add(rim);
    const acid=new T.PointLight(0xc2ff3a,55);acid.position.set(4,3,4);scene.add(acid);
    const root=new T.Group();scene.add(root);
    const materials={
      board:new T.MeshStandardMaterial({color:0x142e31,metalness:.34,roughness:.48}),
      black:new T.MeshStandardMaterial({color:0x161b27,metalness:.62,roughness:.27}),
      metal:new T.MeshStandardMaterial({color:0x626b8b,metalness:.92,roughness:.24}),
      purple:new T.MeshStandardMaterial({color:0x6b3cff,metalness:.25,roughness:.32,emissive:0x3a1cff,emissiveIntensity:.6}),
      neon:new T.MeshStandardMaterial({color:0xc8ff4c,metalness:.12,roughness:.33,emissive:0x94d600,emissiveIntensity:.65}),
      gold:new T.MeshStandardMaterial({color:0xfbc26b,metalness:.86,roughness:.25})
    };
    function box(parent,w,h,d,mat,x=0,y=0,z=0){
      const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);
      mesh.position.set(x,y,z);parent.add(mesh);return mesh;
    }
    function fan(parent,x,y,z,r=.28){
      const center=new T.Group();center.position.set(x,y,z);
      const outer=new T.Mesh(new T.TorusGeometry(r,.045,9,34),materials.metal);center.add(outer);
      const inner=new T.Mesh(new T.CylinderGeometry(r*.18,r*.18,.075,16),materials.neon);
      inner.rotation.x=Math.PI/2;center.add(inner);
      for(let j=0;j<5;j++){
        const blade=new T.Mesh(new T.BoxGeometry(r*.23,r*.75,.045),materials.metal);
        blade.position.y=r*.36;blade.rotation.z=j*Math.PI*2/5+.38;
        const arm=new T.Group();arm.rotation.z=j*Math.PI*2/5;arm.add(blade);center.add(arm);
      }
      parent.add(center);return center;
    }
    function floatingPart(geom,assembled,expanded){
      geom.position.copy(assembled);
      root.add(geom);
      return {geom,assembled,expanded:new T.Vector3(...expanded)};
    }
    // Placa-mãe: o verdadeiro centro físico da maquete.
    const board=new T.Group();
    box(board,3.15,3.85,.17,materials.board);
    for(let i=-1;i<=1;i++){box(board,.038,3.15,.025,materials.neon,-1.25+i*.31,.1,.1);}
    box(board,1.06,1.06,.14,materials.metal,-.35,.6,.16);
    box(board,.81,.81,.12,materials.black,-.35,.6,.28);
    box(board,.79,.18,.13,materials.purple,-.35,-.6,.17);
    box(board,1.9,.13,.18,materials.metal,-.1,-1.06,.14);
    box(board,1.9,.12,.18,materials.black,-.1,-1.36,.14);
    box(board,.56,.69,.21,materials.black,1.08,-1.43,.17);
    box(board,.32,.9,.21,materials.metal,-1.24,1.28,.17);
    for(let i=0;i<4;i++)box(board,.095,2.24,.11,i%2?materials.metal:materials.black,.55+i*.20,.63,.19);
    for(let i=0;i<8;i++)box(board,.13,.13,.14,materials.gold,-1.24+i*.22,-1.75,.21);
    for(let i=0;i<6;i++)box(board,.10,.35,.13,materials.metal,-1.3+i*.17,.93,.20);
    for(let i=0;i<7;i++)box(board,.04,1.4,.02,i%2?materials.purple:materials.neon,-.2+i*.22,-.27,.11);
    floatingPart(board,new T.Vector3(0,-.1,0),[0,-.3,0]);
    // CPU quadrada flutuando de forma separada do soquete.
    const cpu=new T.Group();box(cpu,.76,.76,.17,materials.gold);box(cpu,.64,.64,.18,materials.metal,0,0,.1);
    for(let i=0;i<7;i++){box(cpu,.065,.05,.03,materials.gold,-.3+i*.1,.36,.01);box(cpu,.065,.05,.03,materials.gold,-.3+i*.1,-.36,.01);}
    const parts=[floatingPart(cpu,new T.Vector3(-.35,.52,.43),[-2.1,1.35,1.6])];
    // Dois módulos RAM com circuitos e contatos dourados.
    for(let j=0;j<2;j++){const ram=new T.Group();
      box(ram,.19,1.85,.13,materials.black);
      box(ram,.17,1.66,.025,materials.purple,0,0,.08);
      for(let k=0;k<7;k++){box(ram,.13,.08,.045,materials.metal,0,-.75+k*.25,.105);}
      box(ram,.18,.09,.015,materials.gold,0,-.88,.11);
      parts.push(floatingPart(ram,new T.Vector3(.59+j*.20,.62,.42),[2+j*.39,.95-j*.40,1.05+j*.32]));
    }
    // GPU de três ventoinhas em uma única placa alongada.
    const gpu=new T.Group();box(gpu,2.45,.92,.24,materials.black);
    box(gpu,2.42,.065,.1,materials.purple,0,.47,.08);
    box(gpu,2.1,.08,.03,materials.neon,0,-.5,.15);
    for(let i=-1;i<=1;i++)fan(gpu,i*.75,0,.18,.30);
    parts.push(floatingPart(gpu,new T.Vector3(0,-1.05,.46),[-2.06,-1.57,2.2]));
    // SSD NVMe ilustrativo.
    const ssd=new T.Group();box(ssd,1.15,.33,.08,materials.black);
    box(ssd,.60,.22,.02,materials.purple,-.05,0,.057);
    box(ssd,.12,.31,.03,materials.gold,.56,0,.045);
    parts.push(floatingPart(ssd,new T.Vector3(.15,-1.49,.25),[2,-1.65,1.7]));
    // Dissipador/cooler.
    const cooler=new T.Group();box(cooler,.96,.96,.48,materials.black);
    for(let i=0;i<6;i++)box(cooler,1.0,.07,.55,materials.metal,0,-.35+i*.15,.01);
    const fan1=fan(cooler,0,0,.34,.39);
    parts.push(floatingPart(cooler,new T.Vector3(-.37,.57,.55),[1.75,1.95,1.8]));
    // Pontos na região do soquete, como partículas de energia.
    for(let i=0;i<24;i++){
      const p=new T.Mesh(new T.SphereGeometry(.014+(i%4)*.009,8,8),i%2?materials.purple:materials.neon);
      p.position.set(Math.sin(i*2.4)*2.9,Math.cos(i*1.8)*2.7,(i%5)*.33-.6);
      root.add(p);
    }
    const observer=('IntersectionObserver'in window)?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{threshold:.05}):null;
    let visible=true; if(observer)observer.observe(host);
    let width=0,height=0;
    function size(){
      const rect=host.getBoundingClientRect(),w=Math.max(rect.width,100),h=Math.max(rect.height,100);
      if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    }
    const resize=('ResizeObserver'in window)?new ResizeObserver(size):null;if(resize)resize.observe(host);
    size();
    let x=0,y=0;host.addEventListener('pointermove',e=>{
      const b=host.getBoundingClientRect();x=((e.clientX-b.left)/b.width-.5)*.32;y=((e.clientY-b.top)/b.height-.5)*.15;
    },{passive:true});
    host.addEventListener('pointerleave',()=>{x=0;y=0});
    const began=performance.now();let last=0,stopped=false;
    function frame(now){
      if(stopped)return;
      requestAnimationFrame(frame);
      if(!visible||document.hidden)return;
      if(now-last<28)return;last=now;
      size();
      const t=Math.min(1,(now-began)/2450),e=1-Math.pow(1-t,3),motion=reduced.matches?1:e;
      for(const p of parts){
        p.geom.position.lerpVectors(p.assembled,p.expanded,motion);
        if(!reduced.matches)p.geom.position.y+=Math.sin(now*.0007+p.expanded.x)*.03;
      }
      root.rotation.y+=(x + (reduced.matches ? .10 : (.10+Math.sin(now*.00019)*.13))-root.rotation.y)*.032;
      root.rotation.x+=(-.12+y-root.rotation.x)*.032;
      if(!reduced.matches)root.position.y=Math.sin(now*.00064)*.075;
      if(!reduced.matches)fan1.rotation.z=now*.00045;
      renderer.render(scene,camera);
    }
    requestAnimationFrame(frame);
    window.addEventListener('pagehide',()=>{stopped=true;observer?.disconnect();resize?.disconnect();renderer.dispose();},{once:true});
  }
  start();
}