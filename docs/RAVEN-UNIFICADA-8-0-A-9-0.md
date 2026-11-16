# RAVEN PC BUILDER — Pacote unificado 8.0 a 9.0

Este pacote propõe melhorias incrementais ao código 7.9 sem reescrever o montador ou as contas.

## Implementações

1. Fotografias: auditoria CSV de fotos ausentes / URL cadastrada. Não há foto falsa nem coleta sem autorização. Fotos reais dependem de fontes autorizadas.
2. Dados do produto: avaliação transparente de completude, alerta de nome genérico, falta de referência e categoria; a pontuação não é validação oficial.
3. Preços suspeitos: mantém bloqueios do motor 6.2 e amplia a classificação para revisão (não substitui consulta real).
4. Sincronização: comparador LOCAL de exportações com offers.json. Não altera GitHub nem robô; sincronização real será feita DEPOIS.
5. Validade: idade do preço integra a priorização da vitrine; data não é alterada sem consultar a loja.
6. Qualidade de anúncios: recomenda revisão de condição e marca, sem inventar reputação de vendedor.
7. Início: escolha de destaques por diversidade, completude e preço recente, não só menor preço.
8. Montador: atalhos de orçamento / catálogo e continuidade do 3D existente.
9. Compatibilidade: aproveita build-health e compatibility; mantém alertas de campos faltantes, BIOS e fonte.
10. Orçamento guiado: novos atalhos de valor e objetivo preenchem o motor atual.
11. Valores parciais: avisos explícitos para frete, estoque e itens não cotados.
12. Comparação: mantém até 3 configurações e montagem local; oferece fluxo inicial mais evidente.
13. Histórico: gráfico SVG por loja somente com pelo menos duas datas reais da mesma loja.
14. Assistente: atalhos e transparência do mecanismo local de regras (não generativo).
15. Mobile: controle acessível de menu recolhível em telas pequenas e refinamentos CSS.
16. Primeira visita: início mais orientado a objetivo e orçamento.
17. Desempenho: 3D decorativo só carrega quando necessário, com fallback e modo de movimento reduzido.
18. SEO: canonical / Open Graph em páginas principais, robots e sitemap do endereço GitHub Pages real.
19. Administração: revisor LOCAL recebe relatório de completude e fotos. Painel online privado precisa de backend/autenticação e RLS; NÃO será falsamente considerado pronto.
20. Conversão / suporte: ajustes de informação e evento LOCAL de clique em afiliado, sem transmitir dados; integração real de métricas exigirá infraestrutura e conformidade de privacidade.

## Validação
Node.js: testes de compatibilidade e ofertas anteriores + ferramentas Raven 9.0 e sanity.
GitHub Actions: verificar todos os testes antes do merge.
Fora do escopo técnico desta entrega: preços reais em tempo real, autorização para fotos, taxas/comissões confirmadas, backend administrativo privado, receitas reais, API de IA generativa e integração automática do robô.

## Comandos
node tools/raven90.test.mjs
node tools/raven90-audit.mjs
node tools/raven90-sync-report.mjs exportacao-bot.json

## Implantação
Criar PR, validar testes automáticos e testar visualmente em celular/desktop. Só depois integrar main. O robô permanece em sua versão local até a etapa separada de sincronização.
