// catalog.js — catálogo de peças do Raven PC Builder (preços ilustrativos em R$).
// Para atualizar preços ou adicionar peças, edite as listas abaixo.
const M=(a,f)=>a.map(f);
export const catalog={
case:[
{id:'case1',name:'Raven Noir M-ATX',desc:'Preto fosco · vidro lateral · micro-ATX',price:320,form:'mATX',gpuMaxMm:300},
{id:'case2',name:'Raven Obsidian ATX',desc:'Preto fosco · vidro lateral · ATX',price:490,form:'ATX',gpuMaxMm:360},
...M([['c-basic','Gabinete Gamer Básico','mATX',260,180],['c-atx','Gabinete ATX Airflow Entrada','ATX',330,280],['c-4000d','Corsair 4000D Airflow','ATX',360,650],['c-h5','NZXT H5 Flow','ATX',365,600],['c-lan216','Lian Li Lancool 216','ATX',392,720],['c-north','Fractal Design North','ATX',355,900],['c-o11','Lian Li O11 Dynamic EVO','ATX',420,1100],['c-nr200','Cooler Master NR200P','ITX',330,800],['c-itx','Mini-ITX Compacto','ITX',280,450]],([id,name,form,g,price])=>({id,name,price,form,gpuMaxMm:g,desc:`${form} · GPU até ${g} mm`}))],
board:M([['a320','A320M DDR4','AM4','DDR4','mATX',350],['b450','B450M AM4 DDR4','AM4','DDR4','mATX',480],['b550','B550M AM4 DDR4','AM4','DDR4','mATX',650],['b550atx','B550 ATX Wi-Fi','AM4','DDR4','ATX',950],['x570','X570 ATX','AM4','DDR4','ATX',1400],['a620','A620M DDR5','AM5','DDR5','mATX',650],['b650','B650M AM5 DDR5','AM5','DDR5','mATX',900],['b650atx','B650 ATX AM5 DDR5','AM5','DDR5','ATX',1150],['b650i','B650I Mini-ITX','AM5','DDR5','ITX',1500],['x670e','X670E ATX','AM5','DDR5','ATX',2300],['h610','H610M DDR4','LGA1700','DDR4','mATX',450],['b660','B660M DDR4','LGA1700','DDR4','mATX',650],['b760d4','B760M DDR4','LGA1700','DDR4','mATX',750],['b760d5','B760M DDR5','LGA1700','DDR5','mATX',850],['b760atx','B760 ATX DDR5','LGA1700','DDR5','ATX',1050],['z790d4','Z790 ATX DDR4','LGA1700','DDR4','ATX',1500],['z790','Z790 ATX DDR5','LGA1700','DDR5','ATX',1700]],([id,name,socket,memory,form,price])=>({id,name,price,socket,memory,form,desc:`${form} · soquete ${socket} · ${memory}`})),
cpu:M([['r3-4100','AMD Ryzen 3 4100',4,8,'AM4',380,1.6,65,0],['5500','AMD Ryzen 5 5500',6,12,'AM4',550,2.4,88,0],['5600g','AMD Ryzen 5 5600G',6,12,'AM4',800,2.5,88,1],['5600','AMD Ryzen 5 5600',6,12,'AM4',750,3,88,0],['5600x','AMD Ryzen 5 5600X',6,12,'AM4',850,3.1,88,0],['5700x','AMD Ryzen 7 5700X',8,16,'AM4',1050,3.4,88,0],['5700x3d','AMD Ryzen 7 5700X3D',8,16,'AM4',1500,4.5,105,0],['7500f','AMD Ryzen 5 7500F',6,12,'AM5',1000,4,88,0],['7600','AMD Ryzen 5 7600',6,12,'AM5',1150,4,88,1],['8600g','AMD Ryzen 5 8600G',6,12,'AM5',1400,3.8,88,1],['7700','AMD Ryzen 7 7700',8,16,'AM5',1550,4.5,88,1],['9600x','AMD Ryzen 5 9600X',6,12,'AM5',1700,4.7,88,1],['9700x','AMD Ryzen 7 9700X',8,16,'AM5',2100,5,88,1],['7800x3d','AMD Ryzen 7 7800X3D',8,16,'AM5',2300,6,120,1],['9800x3d','AMD Ryzen 7 9800X3D',8,16,'AM5',3500,6.6,120,1],['7950x3d','AMD Ryzen 9 7950X3D',16,32,'AM5',4000,6.4,162,1],['9950x','AMD Ryzen 9 9950X',16,32,'AM5',4300,6.5,200,1],['i3-12100f','Intel Core i3-12100F',4,8,'LGA1700',450,2,60,0],['i3-12100','Intel Core i3-12100',4,8,'LGA1700',600,2,60,1],['i5-12400f','Intel Core i5-12400F',6,12,'LGA1700',800,3,90,0],['i5-12400','Intel Core i5-12400',6,12,'LGA1700',950,3,90,1],['i5-13400f','Intel Core i5-13400F',10,16,'LGA1700',1100,3.6,100,0],['i5-13600k','Intel Core i5-13600K',14,20,'LGA1700',1700,4.8,181,1],['i5-14600kf','Intel Core i5-14600KF',14,20,'LGA1700',1800,5,181,0],['i7-14700k','Intel Core i7-14700K',20,28,'LGA1700',2500,5.6,220,1],['i9-14900k','Intel Core i9-14900K',24,32,'LGA1700',3700,6.4,250,1]],([id,name,c,t,socket,price,tier,watts,ig])=>({id,name,price,socket,tier,watts,igpu:!!ig,desc:`${c} núcleos / ${t} threads · ${socket}${ig?' · vídeo integrado':''}`})),
ram:M([['d4-8','8 GB DDR4 (1×8 GB)','DDR4',8,140,'Single channel · 3200 MHz'],['d4-16-1x16','16 GB DDR4 (1×16 GB) 3200 MHz','DDR4',16,230,'Um módulo · 3200 MHz · single channel com um módulo'],['16','16 GB DDR4 (2×8 GB)','DDR4',16,300,'Dual channel · 3200 MHz'],['32','32 GB DDR4 (2×16 GB)','DDR4',32,520,'Dual channel · 3200 MHz'],['d4-64','64 GB DDR4 (2×32 GB)','DDR4',64,1000,'Dual channel · 3200 MHz'],['d5-16','16 GB DDR5 (2×8 GB)','DDR5',16,350,'Dual channel · 5600 MHz'],['d5-32','32 GB DDR5 (2×16 GB)','DDR5',32,650,'Dual channel · 6000 MHz'],['d5-32x','32 GB DDR5 RGB (2×16 GB)','DDR5',32,800,'Dual channel · 6400 MHz · RGB'],['d5-64','64 GB DDR5 (2×32 GB)','DDR5',64,1300,'Dual channel · 6000 MHz'],['d5-96','96 GB DDR5 (2×48 GB)','DDR5',96,2100,'Dual channel · 6400 MHz']],([id,name,memory,gb,price,desc])=>({id,name,memory,gb,price,desc})),
gpu:[{id:'igpu',name:'Sem placa de vídeo (integrado)',desc:'Usa o vídeo da CPU · exige processador com gráfico integrado',price:0,power:15,lengthMm:0,tier:1},
...M([['gt1030','NVIDIA GeForce GT 1030','2 GB GDDR5',350,30,150,1.3],['gtx1650','NVIDIA GeForce GTX 1650','4 GB GDDR6',800,75,200,1.9],['rx6500xt','AMD Radeon RX 6500 XT','4 GB GDDR6',750,107,190,2],['rtx3050','NVIDIA GeForce RTX 3050','6 GB GDDR6',1000,70,200,2.5],['arc580','Intel Arc A580','8 GB GDDR6',1100,185,260,2.9],['rx6600','AMD Radeon RX 6600','8 GB GDDR6',1250,132,190,3],['rx7600','AMD Radeon RX 7600','8 GB GDDR6',1650,165,205,4],['rtx4060','NVIDIA GeForce RTX 4060','8 GB GDDR6',1950,115,245,4],['rx7600xt','AMD Radeon RX 7600 XT','16 GB GDDR6',2200,190,280,4.4],['rtx4060ti','NVIDIA GeForce RTX 4060 Ti','8 GB GDDR6',2600,160,245,4.7],['rx7700xt','AMD Radeon RX 7700 XT','12 GB GDDR6',2900,245,280,5],['rtx4070','NVIDIA GeForce RTX 4070','12 GB GDDR6X',3700,200,245,5.2],['rx7800xt','AMD Radeon RX 7800 XT','16 GB GDDR6',3500,263,290,5.6],['rtx4070s','NVIDIA GeForce RTX 4070 Super','12 GB GDDR6X',4200,220,305,6],['rtx4070tis','NVIDIA GeForce RTX 4070 Ti Super','16 GB GDDR6X',5800,285,310,6.3],['rx7900xtx','AMD Radeon RX 7900 XTX','24 GB GDDR6',6200,355,320,6.6],['rtx4080s','NVIDIA GeForce RTX 4080 Super','16 GB GDDR6X',7500,320,310,6.8],['rtx4090','NVIDIA GeForce RTX 4090','24 GB GDDR6X',14000,450,336,7]],([id,name,vram,price,power,len,tier])=>({id,name,price,power,lengthMm:len,tier,desc:`${vram} · consumo típico ~${power} W · ${len} mm`}))],
ssd:M([['hdd1','HD 1 TB 7200 RPM','SATA · barato, porém lento',250],['sata240','SSD SATA 240 GB','SATA · básico para o sistema',150],['sata480','SSD SATA 480 GB','SATA · custo baixo',230],['sata1t','SSD SATA 1 TB','SATA · bom para arquivos',400],['nvme250','SSD NVMe 250 GB','M.2 · PCIe 3.0',180],['500','SSD NVMe 500 GB','M.2 · PCIe · armazenamento rápido',250],['1000','SSD NVMe 1 TB','M.2 · PCIe · mais espaço para jogos',410],['g4-1t','SSD NVMe 1 TB Gen4','M.2 · PCIe 4.0 · até ~7000 MB/s',520],['kingston-nv3-1tb','SSD Kingston NV3 1 TB M.2 PCIe 4.0','M.2 2280 · NVMe · PCIe 4.0',520],['2000','SSD NVMe 2 TB','M.2 · PCIe · muito espaço',800],['g4-2t','SSD NVMe 2 TB Gen4','M.2 · PCIe 4.0 · alto desempenho',950],['g5-2t','SSD NVMe 2 TB Gen5','M.2 · PCIe 5.0 · topo de linha',1700]],([id,name,desc,price])=>({id,name,desc,price})),
psu:M([['p450','Fonte 450 W 80 Plus White',450,220],['550','Fonte 550 W 80 Plus Bronze',550,320],['650','Fonte 650 W 80 Plus Bronze',650,430],['750','Fonte 750 W 80 Plus Gold',750,600],['p850','Fonte 850 W 80 Plus Gold',850,780],['p1000','Fonte 1000 W 80 Plus Gold',1000,1050],['p1200','Fonte 1200 W 80 Plus Platinum',1200,1600]],([id,name,watts,price])=>({id,name,watts,price,desc:`Potência nominal ${watts} W · confira a qualidade do modelo`}))
};

/* ===== Expansão 3.2: hardware antigo, usado e kits de custo-benefício ===== */
const U=(a,f)=>a.map(r=>{const o=f(r);return {...o,used:true,desc:'Usado · '+o.desc}});
const cpuF=([id,name,c,t,socket,price,tier,watts,ig])=>({id,name,price,socket,tier,watts,igpu:!!ig,desc:`${c} núcleos / ${t} threads · ${socket}${ig?' · vídeo integrado':''}`});
const brdF=([id,name,socket,memory,form,price])=>({id,name,price,socket,memory,form,desc:`${form} · soquete ${socket} · ${memory}`});
const gpuF=([id,name,vram,price,power,len,tier])=>({id,name,price,power,lengthMm:len,tier,desc:`${vram} · consumo típico ~${power} W · ${len} mm`});
const ramF=([id,name,memory,gb,price,desc])=>({id,name,memory,gb,price,desc});
catalog.cpu.push(...U([['i3-3220','Intel Core i3-3220',2,4,'LGA1155',60,.9,55,1],['i5-2400','Intel Core i5-2400',4,4,'LGA1155',70,1.1,95,1],['i5-3470','Intel Core i5-3470',4,4,'LGA1155',100,1.3,77,1],['i5-3570k','Intel Core i5-3570K',4,4,'LGA1155',120,1.4,77,1],['i7-2600','Intel Core i7-2600',4,8,'LGA1155',110,1.4,95,1],['i7-3770','Intel Core i7-3770',4,8,'LGA1155',160,1.7,77,1],
['i3-4130','Intel Core i3-4130',2,4,'LGA1150',70,1,54,1],['i5-4460','Intel Core i5-4460',4,4,'LGA1150',130,1.6,84,1],['i5-4690','Intel Core i5-4690',4,4,'LGA1150',160,1.7,84,1],['i7-4770','Intel Core i7-4770',4,8,'LGA1150',230,2,84,1],['e3-1230v3','Intel Xeon E3-1230 v3',4,8,'LGA1150',200,1.9,80,0],
['i3-6100','Intel Core i3-6100',2,4,'LGA1151',90,1.4,51,1],['i5-6500','Intel Core i5-6500',4,4,'LGA1151',190,2,65,1],['i5-7400','Intel Core i5-7400',4,4,'LGA1151',220,2.1,65,1],['i7-7700','Intel Core i7-7700',4,8,'LGA1151',450,2.5,65,1],
['i3-8100','Intel Core i3-8100',4,4,'LGA1151v2',280,2.3,65,1],['i5-8400','Intel Core i5-8400',6,6,'LGA1151v2',400,2.9,65,1],['i5-9400f','Intel Core i5-9400F',6,6,'LGA1151v2',450,3,65,0],['i7-8700','Intel Core i7-8700',6,12,'LGA1151v2',650,3.4,65,1],
['e5-2640v3','Intel Xeon E5-2640 v3',8,16,'LGA2011-3',130,2.2,90,0],['e5-2666v3','Intel Xeon E5-2666 v3',10,20,'LGA2011-3',160,2.5,105,0],['e5-2670v3','Intel Xeon E5-2670 v3',12,24,'LGA2011-3',220,2.8,120,0],['e5-2680v4','Intel Xeon E5-2680 v4',14,28,'LGA2011-3',330,3.1,120,0],
['e5-2670','Intel Xeon E5-2670',8,16,'LGA2011',90,1.9,115,0],['e5-2650v2','Intel Xeon E5-2650 v2',8,16,'LGA2011',110,2.1,95,0],
['fx-6300','AMD FX-6300',6,6,'AM3+',130,1.2,95,0],['fx-8350','AMD FX-8350',8,8,'AM3+',190,1.5,125,0],['a8-7600','AMD A8-7600',4,4,'FM2+',110,1,65,1],['athlon-860k','AMD Athlon X4 860K',4,4,'FM2+',110,1,95,0]],cpuF),
...M([['i3-10100f','Intel Core i3-10100F',4,8,'LGA1200',450,2.5,65,0],['i5-10400f','Intel Core i5-10400F',6,12,'LGA1200',650,3.1,65,0],['i5-10400','Intel Core i5-10400',6,12,'LGA1200',700,3.1,65,1],['i5-11400f','Intel Core i5-11400F',6,12,'LGA1200',750,3.4,65,0],['athlon-200ge','AMD Athlon 200GE',2,4,'AM4',200,1.2,35,1],['r3-3200g','AMD Ryzen 3 3200G',4,4,'AM4',350,1.7,65,1],['r5-3400g','AMD Ryzen 5 3400G',4,8,'AM4',450,2.2,65,1],['r5-2600','AMD Ryzen 5 2600',6,12,'AM4',380,2.2,88,0],['r5-3600','AMD Ryzen 5 3600',6,12,'AM4',550,2.8,88,0]],cpuF));
catalog.board.push(...U([['h61m','H61M DDR3','LGA1155','DDR3','mATX',130],['b75m','B75M DDR3','LGA1155','DDR3','mATX',160],['h77','H77 ATX DDR3','LGA1155','DDR3','ATX',220],['z77','Z77 ATX DDR3','LGA1155','DDR3','ATX',300],['h81m','H81M DDR3','LGA1150','DDR3','mATX',180],['b85m','B85M DDR3','LGA1150','DDR3','mATX',220],['z97','Z97 ATX DDR3','LGA1150','DDR3','ATX',350],['h110m','H110M DDR4','LGA1151','DDR4','mATX',200],['b250m','B250M DDR4','LGA1151','DDR4','mATX',260],['h310m','H310M DDR4','LGA1151v2','DDR4','mATX',280],['b360m','B360M DDR4','LGA1151v2','DDR4','mATX',350],['z390','Z390 ATX DDR4','LGA1151v2','DDR4','ATX',550],['x99','X99 ATX DDR4 (kit Xeon)','LGA2011-3','DDR4','ATX',330],['x99m','X99 micro-ATX DDR4 (kit Xeon)','LGA2011-3','DDR4','mATX',300],['x79','X79 ATX DDR3 (kit Xeon)','LGA2011','DDR3','ATX',280],['970','970 AM3+ DDR3','AM3+','DDR3','ATX',250],['970m','970 micro-ATX AM3+ DDR3','AM3+','DDR3','mATX',200],['a68h','A68H DDR3','FM2+','DDR3','mATX',180],['a88x','A88X ATX DDR3','FM2+','DDR3','ATX',280]],brdF),
...M([['h410m','H410M DDR4','LGA1200','DDR4','mATX',380],['b460m','B460M DDR4','LGA1200','DDR4','mATX',450],['b560m','B560M DDR4','LGA1200','DDR4','mATX',650]],brdF));
catalog.ram.push(...U([['d3-4','4 GB DDR3 (1×4 GB)','DDR3',4,40,'1333 MHz'],['d3-8','8 GB DDR3 (2×4 GB)','DDR3',8,80,'Dual channel · 1600 MHz'],['d3-16','16 GB DDR3 (2×8 GB)','DDR3',16,150,'Dual channel · 1600 MHz'],['d3-32','32 GB DDR3 (4×8 GB)','DDR3',32,300,'1600 MHz'],['d4-4','4 GB DDR4 (1×4 GB)','DDR4',4,50,'2400 MHz'],['d4-16u','16 GB DDR4 (2×8 GB)','DDR4',16,200,'Dual channel · 2400 MHz']],ramF));
catalog.gpu.push(...M([['gt710','NVIDIA GeForce GT 710','2 GB DDR3',150,19,145,.6],['gt730','NVIDIA GeForce GT 730','2 GB GDDR5',200,38,145,.8]],gpuF),
...U([['rx550','AMD Radeon RX 550','2 GB GDDR5',250,50,170,1.2],['rx560','AMD Radeon RX 560','4 GB GDDR5',320,75,190,1.7],['rx570','AMD Radeon RX 570','4 GB GDDR5',450,150,240,2.3],['rx580','AMD Radeon RX 580','8 GB GDDR5',600,185,245,2.6],['gtx750ti','NVIDIA GeForce GTX 750 Ti','2 GB GDDR5',200,60,145,1.2],['gtx960','NVIDIA GeForce GTX 960','2 GB GDDR5',280,120,230,1.6],['gtx1050ti','NVIDIA GeForce GTX 1050 Ti','4 GB GDDR5',450,75,200,1.7],['gtx1060','NVIDIA GeForce GTX 1060 6GB','6 GB GDDR5',650,120,250,2.4],['gtx1660s','NVIDIA GeForce GTX 1660 Super','6 GB GDDR6',900,125,230,2.9],['rx5500xt','AMD Radeon RX 5500 XT','8 GB GDDR6',850,130,205,2.5],['rx5600xt','AMD Radeon RX 5600 XT','6 GB GDDR6',1000,150,250,3.2],['rx5700xt','AMD Radeon RX 5700 XT','8 GB GDDR6',1300,225,270,3.7]],gpuF));
catalog.case.push(...M([['c-eco','Gabinete ATX Simples','ATX',300,90],['c-eco-m','Gabinete micro-ATX Simples','mATX',230,80],['c-used','Gabinete ATX Usado','ATX',280,50]],([id,name,form,g,price])=>({id,name,price,form,gpuMaxMm:g,desc:`${form} · GPU até ${g} mm`})));
catalog.ssd.push(...M([['sata120','SSD SATA 120 GB','SATA · básico para o sistema',80],['hdd500','HD 500 GB 7200 RPM','SATA · barato, porém lento',100],['hdd2','HD 2 TB 7200 RPM','SATA · muito espaço, lento',350]],([id,name,desc,price])=>({id,name,desc,price})));
catalog.psu.push(...M([['p300','Fonte 300 W Genérica',300,90],['p350','Fonte 350 W 80 Plus White',350,120],['p400','Fonte 400 W 80 Plus White',400,150],['p500','Fonte 500 W 80 Plus Bronze',500,260]],([id,name,watts,price])=>({id,name,watts,price,desc:`Potência nominal ${watts} W · confira a qualidade do modelo`})));
/* ===== 3.3: ainda mais barato (LGA775, Pentium/Celeron, AM3, DDR2...) ===== */
catalog.cpu.push(...U([['c2d-e8400','Intel Core 2 Duo E8400',2,2,'LGA775',30,.6,65,0],['q8400','Intel Core 2 Quad Q8400',4,4,'LGA775',50,.8,95,0],['q9550','Intel Core 2 Quad Q9550',4,4,'LGA775',70,.9,95,0],
['g620','Intel Pentium G620',2,2,'LGA1155',20,.5,65,1],['g2020','Intel Pentium G2020',2,2,'LGA1155',30,.6,55,1],['i3-2120','Intel Core i3-2120',2,4,'LGA1155',40,.8,65,1],['i3-3240','Intel Core i3-3240',2,4,'LGA1155',50,.9,55,1],['i5-3330','Intel Core i5-3330',4,4,'LGA1155',80,1.2,77,1],['e3-1230v2','Intel Xeon E3-1230 v2',4,8,'LGA1155',130,1.6,69,0],
['g3220','Intel Pentium G3220',2,2,'LGA1150',35,.7,53,1],['g3258','Intel Pentium G3258',2,2,'LGA1150',60,.9,53,1],['i5-4570','Intel Core i5-4570',4,4,'LGA1150',110,1.5,84,1],['i7-4790','Intel Core i7-4790',4,8,'LGA1150',280,2.1,84,1],
['g4400','Intel Pentium G4400',2,2,'LGA1151',60,1,54,1],['g4560','Intel Pentium G4560',2,4,'LGA1151',110,1.3,54,1],['i3-7100','Intel Core i3-7100',2,4,'LGA1151',130,1.5,51,1],
['g4900','Intel Celeron G4900',2,2,'LGA1151v2',90,1.1,54,1],['g5400','Intel Pentium Gold G5400',2,4,'LGA1151v2',150,1.6,58,1],
['athlon-ii-640','AMD Athlon II X4 640',4,4,'AM3+',45,.8,95,0],['phenom-ii-955','AMD Phenom II X4 955',4,4,'AM3+',60,.9,125,0],['fx-4300','AMD FX-4300',4,4,'AM3+',70,1,95,0],['fx-6350','AMD FX-6350',6,6,'AM3+',140,1.3,125,0],
['a10-7850k','AMD A10-7850K',4,4,'FM2+',130,1.1,95,1],['r3-1200','AMD Ryzen 3 1200',4,4,'AM4',150,1.4,65,0],['r3-2200g','AMD Ryzen 3 2200G',4,4,'AM4',220,1.6,65,1],['r5-1600','AMD Ryzen 5 1600',6,12,'AM4',230,2,65,0]],cpuF),
...M([['athlon-3000g','AMD Athlon 3000G',2,4,'AM4',280,1.3,35,1],['g6400','Intel Pentium Gold G6400',2,4,'LGA1200',280,1.8,58,1]],cpuF));
catalog.board.push(...U([['g31m','G31M DDR2','LGA775','DDR2','mATX',60],['g41m','G41M DDR3','LGA775','DDR3','mATX',70],['h61m-b','H61M econômica','LGA1155','DDR3','mATX',90],['h81m-b','H81M econômica','LGA1150','DDR3','mATX',130],['h110m-b','H110M econômica','LGA1151','DDR4','mATX',150],['760g','760G AM3+ DDR3','AM3+','DDR3','mATX',140],['a320m-u','A320M usada DDR4','AM4','DDR4','mATX',250]],brdF),
...M([['a520m','A520M DDR4','AM4','DDR4','mATX',420],['h510m','H510M DDR4','LGA1200','DDR4','mATX',500]],brdF));
catalog.ram.push(...U([['d2-2','2 GB DDR2 (2×1 GB)','DDR2',2,20,'800 MHz'],['d2-4','4 GB DDR2 (2×2 GB)','DDR2',4,40,'800 MHz'],['d3-2','2 GB DDR3 (1×2 GB)','DDR3',2,20,'1333 MHz'],['d3-8l','8 GB DDR3 (1×8 GB)','DDR3',8,70,'1600 MHz'],['d4-8u','8 GB DDR4 (1×8 GB)','DDR4',8,90,'2400 MHz']],ramF));
catalog.gpu.push(...U([['gt210','NVIDIA GeForce GT 210','1 GB DDR3',70,30,130,.3],['gt610','NVIDIA GeForce GT 610','1 GB DDR3',80,29,140,.4],['r7-240','AMD Radeon R7 240','2 GB DDR3',90,30,150,.5],['gt740','NVIDIA GeForce GT 740','2 GB GDDR5',130,64,180,.9],['gtx650','NVIDIA GeForce GTX 650','1 GB GDDR5',120,64,145,1],['gtx750','NVIDIA GeForce GTX 750','1 GB GDDR5',150,55,145,1.1],['gtx950','NVIDIA GeForce GTX 950','2 GB GDDR5',220,90,200,1.4],['rx460','AMD Radeon RX 460','4 GB GDDR5',230,75,190,1.4],['gtx1050','NVIDIA GeForce GTX 1050','2 GB GDDR5',300,75,170,1.5],['rx470','AMD Radeon RX 470','4 GB GDDR5',330,120,240,2],['gtx970','NVIDIA GeForce GTX 970','4 GB GDDR5',380,145,250,2.1]],gpuF));
catalog.case.push(...M([['c-free','Gabinete micro-ATX Usado','mATX',200,35],['c-mini','Gabinete Mini Torre','mATX',210,60],['c-rgb','Gabinete Gamer ATX RGB','ATX',320,230],['c-mesh','Gabinete Mesh Airflow','ATX',340,340]],([id,name,form,g,price])=>({id,name,price,form,gpuMaxMm:g,desc:`${form} · GPU até ${g} mm`})));
catalog.ssd.push(...M([['hdd160','HD 160 GB','SATA · muito barato, lento',40],['hdd250','HD 250 GB','SATA · barato, lento',55],['ssd60','SSD SATA 60 GB','SATA · mínimo para sistema leve',50],['sata128','SSD SATA 128 GB','SATA · básico',70],['nvme128','SSD NVMe 128 GB','M.2 · PCIe 3.0 · básico',90]],([id,name,desc,price])=>({id,name,desc,price})));
catalog.psu.push(...M([['p230','Fonte 230 W Genérica',230,70],['p250','Fonte 250 W Genérica',250,80]],([id,name,watts,price])=>({id,name,watts,price,desc:`Potência nominal ${watts} W · confira a qualidade do modelo`})));
for(const k in catalog)catalog[k].sort((a,b)=>a.price-b.price);

/* ===== Montagem automática por orçamento (testável em Node) ===== */
const RKc={ITX:1,mATX:2,ATX:3};
export function autoBuild(B){
 const C=catalog,cheap=a=>a.reduce((m,o)=>!m||o.price<m.price?o:m,null),minRam=B>=1500?16:B>=700?8:4,minSsd=B>=3000?250:B>=1500?150:B>=550?75:0,minCase=B>=3000?250:B>=1500?150:0,ssds=C.ssd.filter(o=>!o.id.startsWith('hdd')&&o.price>=minSsd||o.price===cheap(C.ssd.filter(q=>!q.id.startsWith('hdd'))).price&&minSsd===0);
 let best=null,low=null;
 for(const cpu of C.cpu.filter(x=>!x.conceptual))for(const board of C.board.filter(x=>!x.conceptual)){if(board.socket!==cpu.socket)continue;
  const ram=cheap(C.ram.filter(r=>r.memory===board.memory&&r.gb>=minRam)),ssd=cheap(ssds);if(!ram)continue;
  for(const gpu of C.gpu.filter(x=>!x.conceptual)){if(gpu.id==='igpu'&&!cpu.igpu)continue;
   const cl=C.case.filter(c=>RKc[c.form]>=RKc[board.form]&&c.gpuMaxMm>=gpu.lengthMm),cl2=cl.filter(c=>c.price>=minCase),cas=cheap(cl2.length?cl2:cl);if(!cas)continue;
   const need=Math.ceil(((cpu.watts||90)+gpu.power+110)*1.4/50)*50,psu=cheap(C.psu.filter(p=>p.watts>=need));if(!psu)continue;
   const total=cpu.price+board.price+ram.price+ssd.price+gpu.price+cas.price+psu.price,s=(gpu.tier*.6+cpu.tier*.4)*1000-total*.01,b={s,cpu,board,gpu,cas,psu,ram,ssd,total};
   if(!low||total<low.total)low=b;if(total<=B&&(!best||s>best.s))best=b}}
 const x=best||low;let left=B-x.total;
 const ram=C.ram.filter(r=>r.memory===x.board.memory&&r.price-x.ram.price<=left).sort((a,b)=>(Math.min(b.gb,32)*1000-b.price)-(Math.min(a.gb,32)*1000-a.price))[0]||x.ram;left-=ram.price-x.ram.price;
 const ssd=ssds.filter(o=>o.price-x.ssd.price<=left).sort((a,b)=>b.price-a.price)[0]||x.ssd;
 return [x.cas,x.board,x.cpu,ram,x.gpu,ssd,x.psu].map(o=>o.id)}

/* 3.4 — refrigeração: preços demonstrativos, sem consulta a lojas. */
catalog.cooler = [
 {id:'cooler-stock',name:'Cooler original compatível (já disponível)',price:0,sockets:['LGA775','LGA1155','LGA1150','LGA1151','LGA1151v2','LGA1200','LGA1700','AM4','AM5','AM3+','FM2+'],tdp:65,desc:'Somente se você já possui um cooler adequado; confira fixação e capacidade.'},
 {id:'cooler-basic',name:'Air cooler compacto 95 W',price:75,sockets:['LGA1155','LGA1150','LGA1151','LGA1151v2','LGA1200','LGA1700','AM4','AM5','AM3+','FM2+'],tdp:95,desc:'Modelo genérico ilustrativo · confira kit de fixação.'},
 {id:'cooler-tower',name:'Air cooler torre 150 W',price:170,sockets:['LGA1155','LGA1150','LGA1151','LGA1151v2','LGA1200','LGA1700','AM4','AM5'],tdp:150,desc:'Modelo genérico ilustrativo · confira altura no gabinete.'},
 {id:'cooler-dual',name:'Air cooler torre dupla 220 W',price:290,sockets:['LGA1155','LGA1150','LGA1151','LGA1151v2','LGA1200','LGA1700','AM4','AM5','LGA2011','LGA2011-3'],tdp:220,desc:'Modelo genérico ilustrativo · confira espaço para RAM.'},
 {id:'cooler-xeon',name:'Air cooler para Xeon LGA2011 / 2011-3',price:125,sockets:['LGA2011','LGA2011-3'],tdp:150,desc:'Confirme fixação ILM quadrada/estreita e dissipação do kit.'}
];


/* 4.2 — Expansão conceitual: variantes de especificações, NÃO anúncios comerciais.
   Os valores são demonstrativos e não devem ser usados como cotações. */
const ravenForms=['mATX','ATX','ITX'];
const ravenSockets=['AM4','AM5','LGA1700','LGA1155','LGA1200','LGA2011','LGA2011-3'];
const ravenCoolerSockets=['AM4','AM5','LGA1700','LGA1155','LGA1200','LGA2011','LGA2011-3'];
const conceptual=(base,category,n,extra={})=>({...base,...extra,id:`rv42-${category}-${String(n).padStart(3,'0')}`,conceptual:true,used:false});
for(const category of ['case','board','cpu','ram','gpu','ssd','psu','cooler']){
  const list=catalog[category];const original=[...list];
  let n=0;
  while(list.length<100){
    const i=n++,base=original[i%original.length];
    const tier=Math.floor(i/original.length),white=i%3===0;
    let extra={};let name='';
    if(category==='case'){
      const form=ravenForms[i%3],style=['Airflow Mesh','Panorama Glass','Silent Tower','Compact Flow','Dual Chamber'][Math.floor(i/3)%5];
      const finish=white?'Branco Neve':'Preto Grafite';
      extra={form,gpuMaxMm:form==='ITX'?300:form==='mATX'?340:400,finish:white?'white':'black',style:style.toLowerCase().includes('panorama')?'panorama':style.toLowerCase().includes('mesh')?'mesh':'tower',price:220+(i%12)*42,desc:`Conceito ${form} · ${finish} · GPU até ${form==='ITX'?300:form==='mATX'?340:400} mm`};
      name=`Raven ${style} ${finish} ${form} · C${i+1}`;
    }else if(category==='board'){
      const socket=ravenSockets[i%7],memory=['AM5'].includes(socket)?'DDR5':(socket==='LGA1700'&&i%2===0?'DDR5':socket==='LGA2011'?'DDR3':socket==='LGA2011-3'?'DDR4':socket==='LGA1155'?'DDR3':'DDR4');
      const form=ravenForms[Math.floor(i/7)%3];extra={socket,memory,form,price:280+(i%16)*95,desc:`Conceito ${form} · ${socket} · ${memory}; BIOS e ECC exigem conferência`};name=`Placa conceito ${socket} ${memory} ${form} · B${i+1}`;
    }else if(category==='cpu'){
      const socket=ravenSockets[i%7],cores=[2,4,6,8,10,12,16][Math.floor(i/7)%7],igpu=(i%4===0?1:0),watts=[45,65,88,105,125][i%5];
      extra={socket,cores,threads:cores*2,igpu,watts,tier:Math.min(5,1+Math.floor(cores/4)),price:230+cores*75+(i%4)*85,desc:`CPU conceitual · ${socket} · ${cores} núcleos · ${watts} W · ${igpu?'com':'sem'} vídeo integrado`};name=`CPU conceito ${socket} ${cores}C/${cores*2}T · P${i+1}`;
    }else if(category==='ram'){
      const memory=i%3===0?'DDR3':i%3===1?'DDR4':'DDR5',gb=[4,8,16,32,64][Math.floor(i/3)%5],mhz=memory==='DDR3'?1600:memory==='DDR4'?3200:5600;
      extra={memory,gb,price:Math.round(gb*(memory==='DDR5'?22:memory==='DDR4'?14:10)),desc:`Memória conceitual ${memory} · ${gb} GB · ${mhz} MHz · verifique ECC e slots`};name=`Kit conceito ${gb} GB ${memory} ${mhz} · R${i+1}`;
    }else if(category==='gpu'){
      const power=[75,110,145,180,220,270,320][i%7],lengthMm=170+(i%10)*22,tier=1+(i%5);
      extra={power,lengthMm,tier,price:430+tier*350+(i%4)*80,desc:`GPU conceitual · ${lengthMm} mm · ${power} W · desempenho não aferido`};name=`GPU conceito ${['Compact','Dual Fan','Triple Fan','Creator'][i%4]} ${tier} · G${i+1}`;
    }else if(category==='ssd'){
      const gb=[120,240,480,512,1000,2000,4000][i%7],kind=i%3===0?'SATA':i%3===1?'NVMe PCIe 3.0':'NVMe PCIe 4.0';
      extra={price:Math.round(65+gb*(kind==='SATA'?.27:.37)),desc:`Armazenamento conceitual · ${kind} · ${gb} GB`};name=`SSD conceito ${kind} ${gb} GB · S${i+1}`;
    }else if(category==='psu'){
      const watts=[350,400,450,500,550,600,650,700,750,850,1000][i%11];
      extra={watts,price:Math.round(watts*.57),desc:`Fonte conceitual ${watts} W · potência e proteções NÃO verificadas; confira modelo real`};name=`Fonte conceito ${watts} W · F${i+1}`;
    }else if(category==='cooler'){
      const tdp=[65,95,120,150,180,220,250][i%7],socket=ravenCoolerSockets[i%7];
      extra={tdp,sockets:[socket],price:60+Math.round(tdp*.85),desc:`Cooler conceitual ${tdp} W · suporte declarado a ${socket}; confira fixação e altura`};name=`Cooler conceito ${socket} ${tdp} W · C${i+1}`;
    }
    list.push(conceptual(base,category,n,{...extra,name}));
  }
  list.sort((a,b)=>a.price-b.price);
}
