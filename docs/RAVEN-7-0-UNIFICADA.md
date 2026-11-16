# Raven PC Builder 7.0 — atualização unificada 6.7 / 6.8 / 6.9 / 7.0

## 6.7 · Catálogo mais completo
- `storefront-shop.js` e `product-details.mjs`: fichas técnicas apenas quando há referência de peça do catálogo com ID correspondente. Informações inferidas do título do vendedor são explicitamente identificadas como **não verificadas**.
- Compare ofertas com loja, preço, data de consulta e aviso de que anúncios agrupados podem variar em marca, capacidade ou SKU.
- Fotos reais só aparecem quando `imageUrl` é cadastrado no anúncio e passa pela política de domínios autorizados. Sem foto real, a vitrine usa representação neutra; nenhum produto recebeu fotografia fictícia.
- O filtro de ofertas recentes da 6.6 continua disponível.

## 6.8 · Integração editorial com Raven Market Bot 5.x
- `tools/revisar-ofertas.html` é um revisor **local e sem acesso administrativo remoto**; contém importação de `offers.json` exportado do bot, comparação de novos e alterados e relatório de qualidade.
- `offer-import65.mjs` registra um log apenas com loja, ID, tipo de alteração, preço anterior/novo e data da conferência. Não importa tokens, senhas, chaves nem campos privados.
- Toda alteração recebida do robô fica **pendente**. Não há publicação automática no GitHub ou Supabase por essa página.
- Para publicar: exporte o catálogo revisado, substitua `offers.json` no repositório com sua conta GitHub e deixe a Action de qualidade analisar o commit. Contas públicas não podem publicar pelo revisor.
- O Bot 5.0 e seu servidor local continuam separados do site estático; esta atualização **não cria conexão contínua, nem geração de links afiliados no navegador**.
- PCs prontos e kits usam formatos JSON próprios; esta importação trata somente `offers[]`.

## 6.9 · Diagnóstico do Montador 3D
- `build-health.mjs`: checklist claro de socket, DDR, formato de gabinete, GPU, potência da fonte, fixação de cooler, BIOS e conectores.
- Diferencia campos coincidentes, informações não verificadas e conflitos.
- A estimativa de watts deriva de campos ilustrativos do catálogo. Não substitui potência real, consumo de pico ou qualidade da fonte.
- Mantém compatibilidade existente, garagem e sessão de usuário.

## 7.0 · Planejador por orçamento
- `orcamento.html`: cinco finalidades: estudos, jogos, edição/criação, base para upgrades e economia.
- `budget-engine.js`: ranking relativo de combinações pelas finalidades, sem inventar benchmarks ou FPS.
- O planejador só usa preços de anúncios publicados com datas recentes; quando não encontra tudo, assinala componentes ausentes e que a proposta é **parcial**.
- O botão "Visualizar no Montador 3D" transfere somente IDs presentes no catálogo 3D; os restantes continuam listados no orçamento sem equivalente fictício.
- Painel Smart Build no Montador 3D agora envia orçamento e objetivo ao planejador 7.0.

## Segurança, desempenho e testes
- Não mudar `offers.json`, tokens, Supabase ou credenciais do bot. Nenhum produto é aprovado, rejeitado ou publicado automaticamente.
- A CI do GitHub roda `tools/raven70.test.mjs`, compatibilidade, política de anúncios, importação segura e verificação de links.
- Testar manualmente no Windows/Android: `inicio.html`, `produtos.html`, `orcamento.html`, `index.html` e `tools/revisar-ofertas.html`.
- O site não oferece checkout, garantia de estoque ou cobrança própria.
- **Limites conhecidos**: sem API autenticada dentro do GitHub Pages, nenhuma sincronização direta contínua com o bot local. Sem `imageUrl` válido, não há fotos exatas. Fotos, preços e links precisam ser conferidos pelo operador.

## Publicação
A publicação do site é feita via pull request para `main` após testes passarem; GitHub Pages poderá demorar para atualizar. Pressione Ctrl+F5 em caso de cache de CSS/JS. Não exponha o revisor local como painel de administração com permissões reais.
