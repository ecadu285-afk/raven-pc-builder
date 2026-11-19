# Raven PC Builder 9.2 — guia de revisão (NÃO PUBLICADA)

## Escopo implementado

1. **Busca inteligente no catálogo:** correspondência por termos, apelidos comuns, modelo e referência, sem inventar resultados; opção de ordenar pela relevância.
2. **Fichas individuais:** URLs \`produto.html?produto=PART_ID\`, anúncios publicados, ficha técnica **apenas de fontes cadastradas**, links para histórico e comparação, avaliações aprovadas e formulário autenticado para envio à moderação.
3. **Identificação de modelos:** heurística de CPU/GPU e comparação de nome/categoria contra a referência \`catalog.js\`. "Sem inconsistências textuais" não comprova SKU. O revisor local exibe as divergências.
4. **Monitoramento:** \`tools/monitor-ofertas92.mjs\` analisa datas, links e variação de preços registrada no \`history\`. Com \`--online\`, faz checagens HEAD opcionais de URLs em domínios autorizados. HTTP 403, redirecionamento ou falha de rede são **inconclusivos**, nunca prova de indisponibilidade.
5. **Central de imagens:** \`tools/central-imagens92.html\` lista fotos ausentes, sem revisão documental ou com suspeita de modelo. Exporta fila CSV e remete ao revisor local existente. Não executa buscas em fontes externas, não baixa fotos, não cria direitos de uso.
6. **Filtros técnicos:** socket, tipo DDR e capacidade da referência ou título, além dos filtros anteriores. Mostrar campos incompletos é mais seguro que preencher dados fictícios.
7. **Verificador técnico:** \`verificar-pc.html\` usa o motor já existente de \`compatibility.js\` sem alterar o montador 3D. Pode transferir uma configuração para o montador com \`#b=\`.
8. **Comunidade:** a ficha mostra somente avaliações públicas marcadas como aprovadas. Avaliações novas dependem de login Supabase e continuam sujeitas à moderação.
9. **Painel comercial local:** \`tools/painel-comercial92.html\` resume anúncios, lojas, fotos, alertas e categorias; opcionalmente importa métricas **agregadas** de clicks e pagamentos confirmados do operador. Não atribui vendas a cliques sem registros externos.
10. **Raven AI Beta:** motor de regras local já existente agora pesquisa modelos do catálogo publicado e abre suas fichas, sem alegar ser IA generativa.
11. **Desempenho/SEO/acessibilidade:** carregamento preguiçoso de imagens, CSS responsivo, navegação por teclado, metadados por referência e sitemap ampliado com URLs de produtos publicados. SEO dinâmico em GitHub Pages ainda precisa de teste de indexação.

## Testes

Na raiz do repositório, com Node.js 22:

\`\`\`sh
node compatibility.test.mjs
node tools/raven91.test.mjs
node tools/raven92.test.mjs
node tools/offer-policy.test.mjs
node tools/monitor-ofertas92.mjs
node tools/audit-offers.mjs --strict
node tools/site-sanity.mjs
\`\`\`

O workflow de qualidade executa os testes anteriores do projeto e os novos. Para ver o site localmente:

\`\`\`sh
python -m http.server 8000 --bind 127.0.0.1
\`\`\`

Visite \`http://127.0.0.1:8000/produtos.html\`, \`produto.html?produto=5500\`,
\`verificar-pc.html\`, \`assistente.html\` e \`index.html\`.

## Auditoria do robô

\`\`\`sh
node tools/monitor-ofertas92.mjs --report auditoria92.json
node tools/monitor-ofertas92.mjs --online --report auditoria-online92.json
\`\`\`

A checagem online é **opcional**, manual, exige conexão e pode ser bloqueada pelos sites. Não é monitoramento contínuo, não inclui APIs privadas e **não publica dados**. Só consultar endereços dos domínios autorizados pela política atual.

Para mesclar exportações do Market Bot em uma prévia, siga \`docs/GUIA-RAVEN-9.1.md\`; itens novos/alterados continuam pendentes e precisam de aprovação antes do commit.

## Fotografia e direitos

Manter \`imageSource\`, \`imageCredit\`, \`imageReviewStatus\`,
\`imageReviewedAt\` e \`imageUsagePermission\` para fotos realmente conferidas. Os campos só podem ser marcados como verificados após análise humana da origem, referência/SKU e permissão. URL HTTPS válida **não** prova direito de uso.

## Painel de dados comerciais

Acesse \`tools/painel-comercial92.html\` **localmente** pelo servidor HTTP. Ele não tem autenticação, está excluído do sitemap e do rastreamento por robots, mas quem souber a URL do GitHub Pages **pode abrir a ferramenta pública**. **Não insira dados sensíveis ou confidenciais.**

Formato opcional de entrada agregada (exemplo fictício):

\`\`\`json
{
  "clicksByStore": {"shopee": 12, "mercadolivre": 8},
  "confirmedCommissionsByStore": {"shopee": 5.6}
}
\`\`\`

Os dados importados não são enviados ou salvos no servidor. Verifique a origem dos relatórios antes de usar os valores para gestão.

## Limitações e pendências

- **Não publicados nesta branch:** anúncios adicionais, fotos compradas/licenciadas e preços atualizados. \`offers.json\` não foi modificado.
- Testar fluxos reais de Supabase, políticas de RLS e moderação das avaliações com pelo menos duas contas.
- Testar navegação mobile (320, 375, 768 px), carregamento, acessibilidade, SEO e indexação dinâmica em navegador real.
- Desempenho/vendas reais exigem integração futura com fontes de métricas e pagamentos; sem esta integração o painel mostra apenas dados locais/importados.
- Verificação HTTP de links não garante autenticidade, preço, estoque ou comissão.
- Compatibilidade exige validação oficial de BIOS, placa, RAM, cooler, conectores e dimensões.
- GitHub Pages é estático e não roda tarefas contínuas do robô. Se quiser monitoramento agendado, será necessário configurar workflow/infra separada.
- **Não mesclar a versão 9.2 em produção antes de verificar todos os testes e revisar o PR.**
