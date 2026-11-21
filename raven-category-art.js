/** Ilustracoes genericas por categoria. Nao sao fotografias de modelos especificos. */
const icons={
 "cpu": "<rect x=\"24\" y=\"24\" width=\"52\" height=\"52\" rx=\"9\" fill=\"#4c2781\"/><rect x=\"36\" y=\"36\" width=\"28\" height=\"28\" rx=\"5\" fill=\"#eadbff\"/><path d=\"M33 13v11 M45 13v11 M57 13v11 M69 13v11 M33 76v11 M45 76v11 M57 76v11 M69 76v11 M13 33h11 M13 45h11 M13 57h11 M13 69h11 M76 33h11 M76 45h11 M76 57h11 M76 69h11\" stroke=\"#4c2781\" stroke-width=\"6\" stroke-linecap=\"round\"/>",
 "gpu": "<rect x=\"9\" y=\"29\" width=\"82\" height=\"47\" rx=\"7\" fill=\"#4c2781\"/><circle cx=\"35\" cy=\"52\" r=\"16\" fill=\"#ebdcff\"/><circle cx=\"35\" cy=\"52\" r=\"6\" fill=\"#4c2781\"/><circle cx=\"67\" cy=\"52\" r=\"16\" fill=\"#ebdcff\"/><circle cx=\"67\" cy=\"52\" r=\"6\" fill=\"#4c2781\"/><path d=\"M17 76v10h47V76 M9 37H4v31h5\" stroke=\"#4c2781\" stroke-width=\"5\" fill=\"none\"/>",
 "board": "<rect x=\"17\" y=\"14\" width=\"66\" height=\"73\" rx=\"7\" fill=\"#4c2781\"/><rect x=\"28\" y=\"27\" width=\"29\" height=\"29\" rx=\"4\" stroke=\"#eadbff\" stroke-width=\"5\" fill=\"none\"/><rect x=\"64\" y=\"26\" width=\"5\" height=\"36\" rx=\"2\" fill=\"#eadbff\"/><rect x=\"73\" y=\"26\" width=\"5\" height=\"36\" rx=\"2\" fill=\"#eadbff\"/><path d=\"M28 68h29 M28 76h38\" stroke=\"#eadbff\" stroke-width=\"5\" stroke-linecap=\"round\"/>",
 "ram": "<rect x=\"6\" y=\"34\" width=\"88\" height=\"35\" rx=\"5\" fill=\"#4c2781\"/><path d=\"M18 43h12v15H18z M37 43h12v15H37z M56 43h12v15H56z M75 43h10v15H75z\" fill=\"#eadbff\"/><path d=\"M21 69v9 M32 69v9 M43 69v9 M57 69v9 M68 69v9 M79 69v9\" stroke=\"#4c2781\" stroke-width=\"5\" stroke-linecap=\"round\"/>",
 "ssd": "<rect x=\"18\" y=\"18\" width=\"64\" height=\"64\" rx=\"9\" fill=\"#4c2781\"/><rect x=\"27\" y=\"29\" width=\"46\" height=\"37\" rx=\"5\" stroke=\"#eadbff\" stroke-width=\"3\" fill=\"none\"/><path d=\"M31 50h34 M35 60h25\" stroke=\"#eadbff\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M37 82v6 M48 82v6 M59 82v6\" stroke=\"#dd8d21\" stroke-width=\"5\"/>",
 "hdd": "<rect x=\"18\" y=\"16\" width=\"64\" height=\"68\" rx=\"9\" fill=\"#4c2781\"/><circle cx=\"51\" cy=\"45\" r=\"23\" fill=\"#eadbff\"/><circle cx=\"51\" cy=\"45\" r=\"7\" fill=\"#4c2781\"/><path d=\"M34 73 62 50\" stroke=\"#4c2781\" stroke-width=\"7\" stroke-linecap=\"round\"/><circle cx=\"34\" cy=\"73\" r=\"6\" fill=\"#eadbff\"/>",
 "psu": "<path d=\"M18 32 42 17l42 13v46L60 88 18 76Z\" fill=\"#4c2781\"/><circle cx=\"61\" cy=\"52\" r=\"21\" fill=\"none\" stroke=\"#eadbff\" stroke-width=\"5\"/><circle cx=\"61\" cy=\"52\" r=\"7\" fill=\"#eadbff\"/><path d=\"M45 37 77 67 M77 37 45 67 M18 44l17-9 M18 55l17-9 M18 66l17-9\" stroke=\"#eadbff\" stroke-width=\"3\" stroke-linecap=\"round\"/>",
 "case": "<rect x=\"27\" y=\"10\" width=\"47\" height=\"81\" rx=\"8\" fill=\"#4c2781\"/><rect x=\"33\" y=\"18\" width=\"34\" height=\"49\" rx=\"4\" fill=\"#e3c9fe\"/><circle cx=\"50\" cy=\"43\" r=\"17\" stroke=\"#4c2781\" stroke-width=\"5\" fill=\"none\"/><circle cx=\"50\" cy=\"43\" r=\"5\" fill=\"#4c2781\"/><circle cx=\"50\" cy=\"79\" r=\"5\" fill=\"#eadbff\"/>",
 "cooler": "<circle cx=\"50\" cy=\"50\" r=\"38\" fill=\"#4c2781\"/><path d=\"M51 48C30 15 73 11 66 35 59 45 50 45 51 48Zm2 2c38-13 38 31 14 29-12-1-16-14-14-29Zm-4 3c-7 39-43 17-28-2 9-11 21-9 28 2Z\" fill=\"#eadbff\"/><circle cx=\"50\" cy=\"50\" r=\"8\" fill=\"#4c2781\"/>",
 "keyboard": "<rect x=\"9\" y=\"26\" width=\"82\" height=\"49\" rx=\"7\" fill=\"#4c2781\"/><path d=\"M19 38h8 M35 38h8 M51 38h8 M67 38h8 M19 50h8 M35 50h8 M51 50h8 M67 50h8 M28 63h44\" stroke=\"#eadbff\" stroke-width=\"6\" stroke-linecap=\"round\"/>",
 "headset": "<path d=\"M20 59V46c0-41 60-41 60 0v13\" stroke=\"#4c2781\" stroke-width=\"10\" stroke-linecap=\"round\" fill=\"none\"/><rect x=\"13\" y=\"52\" width=\"19\" height=\"32\" rx=\"9\" fill=\"#4c2781\"/><rect x=\"68\" y=\"52\" width=\"19\" height=\"32\" rx=\"9\" fill=\"#4c2781\"/>",
 "mouse": "<path d=\"M50 11c-19 0-28 13-28 30v18c0 21 12 30 28 30s28-9 28-30V41C78 24 69 11 50 11Z\" fill=\"#4c2781\"/><path d=\"M50 16v27 M36 47h28\" stroke=\"#eadbff\" stroke-width=\"5\" stroke-linecap=\"round\"/><rect x=\"46\" y=\"30\" width=\"8\" height=\"14\" rx=\"4\" fill=\"#eadbff\"/>",
 "chair": "<rect x=\"24\" y=\"12\" width=\"52\" height=\"46\" rx=\"12\" fill=\"#4c2781\"/><path d=\"M20 54h60v11H20z\" fill=\"#eadbff\" stroke=\"#4c2781\" stroke-width=\"4\"/><path d=\"M50 65v19 M30 89h40 M27 77h-7V54 M73 77h7V54\" stroke=\"#4c2781\" stroke-width=\"7\" stroke-linecap=\"round\"/>",
 "mousepad": "<rect x=\"8\" y=\"43\" width=\"84\" height=\"37\" rx=\"8\" fill=\"none\" stroke=\"#4c2781\" stroke-width=\"7\"/><path d=\"M62 20c-9 0-15 7-15 17v17c0 12 7 18 15 18s15-6 15-18V37c0-10-6-17-15-17Z\" fill=\"#4c2781\"/><path d=\"M62 22v18\" stroke=\"#eadbff\" stroke-width=\"3\"/>",
 "monitor": "<rect x=\"8\" y=\"15\" width=\"84\" height=\"59\" rx=\"7\" fill=\"#4c2781\"/><rect x=\"16\" y=\"23\" width=\"68\" height=\"43\" rx=\"3\" fill=\"#eadbff\"/><path d=\"M50 74v12 M32 89h36\" stroke=\"#4c2781\" stroke-width=\"8\" stroke-linecap=\"round\"/>",
 "fan": "<circle cx=\"50\" cy=\"50\" r=\"38\" stroke=\"#4c2781\" stroke-width=\"8\" fill=\"none\"/><path d=\"M50 48c-29-3-20-31-5-25 13 5 12 16 5 25Zm3 3c26-15 37 14 23 22-13 7-22-4-23-22Zm-6 2c-8 29-34 15-30-1 4-12 18-13 30 1Z\" fill=\"#4c2781\"/><circle cx=\"50\" cy=\"50\" r=\"8\" fill=\"#eadbff\"/>",
 "powerstrip": "<rect x=\"10\" y=\"35\" width=\"80\" height=\"30\" rx=\"12\" fill=\"#4c2781\"/><circle cx=\"28\" cy=\"50\" r=\"10\" fill=\"#eadbff\"/><circle cx=\"52\" cy=\"50\" r=\"10\" fill=\"#eadbff\"/><circle cx=\"76\" cy=\"50\" r=\"10\" fill=\"#eadbff\"/><path d=\"M28 46v8 M52 46v8 M76 46v8\" stroke=\"#4c2781\" stroke-width=\"3\"/>",
 "laptop": "<rect x=\"19\" y=\"16\" width=\"62\" height=\"56\" rx=\"6\" fill=\"#4c2781\"/><rect x=\"26\" y=\"23\" width=\"48\" height=\"41\" rx=\"2\" fill=\"#eadbff\"/><path d=\"M13 77h74l-8 9H21Z\" fill=\"#4c2781\"/>",
 "phone": "<rect x=\"28\" y=\"8\" width=\"44\" height=\"84\" rx=\"10\" fill=\"#4c2781\"/><rect x=\"34\" y=\"18\" width=\"32\" height=\"57\" rx=\"3\" fill=\"#eadbff\"/><circle cx=\"50\" cy=\"83\" r=\"4\" fill=\"#eadbff\"/>",
 "desk": "<rect x=\"11\" y=\"32\" width=\"78\" height=\"13\" rx=\"5\" fill=\"#4c2781\"/><path d=\"M23 45v41 M77 45v41 M23 57h54\" stroke=\"#4c2781\" stroke-width=\"8\" stroke-linecap=\"round\"/>",
 "other": "<path d=\"M50 10 85 30v40L50 90 15 70V30Z\" fill=\"#4c2781\"/><path d=\"M15 30 50 51 85 30 M50 51v39\" stroke=\"#eadbff\" stroke-width=\"5\" fill=\"none\"/>"
};
const labels={
 "cpu": "CPU",
 "gpu": "GPU",
 "board": "PLACA-MÃE",
 "ram": "RAM",
 "ssd": "SSD",
 "hdd": "HD",
 "psu": "FONTE",
 "case": "GABINETE",
 "cooler": "COOLER",
 "keyboard": "TECLADO",
 "headset": "HEADSET",
 "mouse": "MOUSE",
 "chair": "CADEIRA",
 "mousepad": "MOUSEPAD",
 "monitor": "MONITOR",
 "fan": "FAN",
 "powerstrip": "FILTRO DE LINHA",
 "laptop": "NOTEBOOK",
 "phone": "CELULAR",
 "desk": "MESA",
 "other": "COMPONENTE"
};
export function ravenCategoryArt(type){
 const kind=Object.prototype.hasOwnProperty.call(icons,type)?type:'other';
 const root=document.createElement('div');root.className='raven-category-art';
 root.setAttribute('role','img');root.setAttribute('aria-label','Imagem ilustrativa da categoria '+labels[kind]+'. Nao representa fotografia do produto anunciado.');
 const tile=document.createElement('div');tile.className='raven-category-art-tile';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','raven-category-art-icon');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');
 svg.innerHTML=icons[kind];
 const accent=document.createElement('span');accent.className='raven-category-art-accent';accent.setAttribute('aria-hidden','true');
 const label=document.createElement('strong');label.className='raven-category-art-name';label.textContent=labels[kind];
 tile.append(svg,accent,label);root.append(tile);
 // As dez artes geradas originalmente sao servidas em WebP. A miniatura vetorial
 // permanece como reserva caso a imagem ainda nao tenha sido publicada.
 if(['gpu','cpu','board','ram','ssd','psu','case','hdd','kit','pc'].includes(kind)){
  const img=document.createElement('img');img.className='raven-category-art-original';
  img.src='raven-art/'+kind+'.webp';img.loading='lazy';img.decoding='async';
  img.alt='Arte roxa ilustrativa de '+labels[kind];
  img.addEventListener('load',()=>{tile.hidden=true;});
  img.addEventListener('error',()=>{img.remove();});
  root.append(img);
 }
 return root;
}
