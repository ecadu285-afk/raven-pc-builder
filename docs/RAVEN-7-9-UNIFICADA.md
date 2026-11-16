# Raven PC Builder 7.9 — atualização unificada

Esta atualização preserva a versão 7.1, as ofertas existentes, as contas Supabase e as credenciais privadas do Market Bot.

## Versões incluídas
- 7.2: auditoria de modelo, ID, capacidade e DDR no catálogo; informações de vendedor não são tratadas como oficiais.
- 7.3: fotos com correspondência mais conservadora, sem imagens genéricas apresentadas como reais; status de imagem e ficha técnica.
- 7.4: tela historico.html com preços e datas efetivamente registrados em offers.json e history[].
- 7.5: relatório local exportável no revisor do Market Bot sobre ofertas, duplicatas, imagem, divergência de modelo e status.
- 7.6: comparar-pcs.html compara até três links do Montador, componentes, preços registrados recentes e conflitos.
- 7.7: Modo leve no visualizador 3D, com pixel ratio reduzido, menos animações e quadros renderizados.
- 7.8: estilos responsivos nas novas páginas, melhorias de navegação/touch e respeito a movimento reduzido.
- 7.9: assistente.html usa regras locais de hardware, orçamento, uso e catálogo aprovado para produzir uma sugestão explicada.

## Limitações da entrega
- O histórico não inventa preços anteriores: em 16/11/2026 havia apenas uma entrada histórica em offers.json.
- Fotos reais continuam dependendo de imagens cadastradas com autorização e modelo exato; imagens faltantes não são criadas automaticamente.
- A integração Market Bot continua por importação, auditoria, revisão e exportação de JSON. Não há sincronização contínua pelo GitHub Pages nem publicação automática.
- O Montador 3D continua esquemático, sem garantia de dimensões oficiais.
- O assistente Raven Beta é um motor de regras, não um modelo generativo de IA e não faz chamadas a provedores externos.
- Comparações não incluem frete, preço em tempo real, estoque, FPS ou validação definitiva de compatibilidade.

## Fluxo de uso
1. Consulte ofertas em produtos.html e abra historico.html para registros de preços.
2. Use assistente.html ou orcamento.html para planejar uma configuração com ofertas aprovadas.
3. Monte o computador em index.html e copie o link.
4. Compare dois ou três links em comparar-pcs.html.
5. Para administração, use tools/revisar-ofertas.html localmente, importe o JSON do Market Bot, faça auditoria e revisão e publique o catálogo apenas via GitHub autenticado.

## Segurança e testes
- Nenhuma nova tabela ou permissão do Supabase; nenhum token de afiliados inserido no repositório.
- O revisor local não publica produtos nem transfere credenciais.
- Anúncios só se tornam públicos após passarem pelas regras de publicação.
- Execute node tools/raven79.test.mjs e os testes GitHub Actions antes de liberar a atualização.
- Teste manualmente no desktop e celular; GitHub Actions não substitui teste visual.

## Etapas futuras não incluídas
- IA generativa exige backend próprio e tokens em cofre de segredos do lado servidor.
- Integração ao vivo com APIs de marketplaces e fotos oficiais exige acesso e autorização apropriados.
