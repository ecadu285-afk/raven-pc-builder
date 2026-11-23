import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const load=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=load('aprender.html');
const engine=load('academy-3d-pro.js');
const styles=load('academy-3d-pro.css');

execFileSync(process.execPath,['--check',new URL('../academy-3d-pro.js',import.meta.url).pathname],{stdio:'pipe'});
const inline=(html.match(/<script type="module">([\s\S]*?)<\/script>/)||[])[1];
assert.ok(inline,'Script do laboratório não encontrado');
new Function(inline); // verifica sintaxe sem executar acesso ao DOM

const htmlIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(htmlIds.length,new Set(htmlIds).size,'IDs duplicados no HTML');
for(const id of [
 'stage','fallback','resetCamera','partLabel','rvaLabFinish','rvaExplode','rvaRotate',
 'rvaProPartTitle','rvaProPartDescription','rvaPanelVideos','rvaPanelLab','rvaPanelQuiz'
]) assert.ok(htmlIds.includes(id),'Elemento ausente: '+id);

for(const file of ['academy-3d-pro.css','academy-3d-pro.js'])
 assert.ok(html.includes(file),'O site precisa carregar '+file);
for(const part of ['case','board','cpu','ram','gpu','ssd','fan','psu']){
 assert.ok(engine.includes(part+':')||engine.includes("'"+part+"'"),'Peça não declarada: '+part);
 assert.ok(html.includes('data-lab-part="'+part+'"'),'Botão da peça não encontrado: '+part);
}
for(const mode of ['parts','assembly','clean','diagnostics']){
 assert.ok(html.includes('data-lab-mode="'+mode+'"'),'Modo de aprendizagem ausente: '+mode);
}
for(const api of ['focus','setMode','setExploded','setRotation','reset','dispose']){
 assert.ok(engine.includes(api),'Interface do motor não implementada: '+api);
}
assert.ok(engine.includes('reduced-motion'),'Respeitar preferência de redução de movimento');
assert.ok(engine.includes('devicePixelRatio'),'Limitar resolução de renderização');
assert.ok(engine.includes('webgl')||engine.includes('WebGLRenderer'),'Proteger inicialização WebGL');
assert.ok(engine.includes('ResizeObserver'),'Adaptar canvas a diferentes telas');
assert.ok(engine.includes('IntersectionObserver'),'Suspender renderização fora da tela');
assert.ok(styles.includes('@media(max-width:680px)'),'Deve haver layout otimizado para celular');
assert.ok(inline.includes("chapters[chapter]"),'A cena deve continuar ligada às aulas');
assert.ok(html.includes('10 aulas')||html.includes('10 videoaulas'),'Manter playlist de videoaulas');
assert.ok(html.includes('rvaQuizModules'),'Manter exercícios existentes');
assert.ok(!engine.includes('eval('),'Não executar código dinâmico no motor');
console.log('PASS: Raven Academy 3D Pro — scripts, oito peças, quatro modos, responsividade, integração de aulas e acessibilidade.');
