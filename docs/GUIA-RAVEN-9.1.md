# Raven PC Builder 9.1 — Vitrine, fotos, categorias, comparação e Market Bot

## O que muda
- Página inicial: três atalhos comerciais para comparar ofertas, navegar pelo catálogo ou abrir o montador 3D; mantém contas, login e demais páginas existentes.
- Catálogo: cards com indicação clara da loja, preço, data da última consulta, ação para comparar e fotos com status de revisão.
- Categorias: contagem real de anúncios elegíveis; as que estão vazias exibem **Em preparação**, sem inventar produtos.
- Mobile: cards, navegação, filtros e comparador adaptados a telas menores.
- Comparador: `comparar-ofertas.html` agrupa anúncios somente quando possuem a mesma referência interna, categoria e condição. **Não garante SKU igual**. Produtos com especificação genérica trazem alerta especial.
- Importação: `tools/sync-market-bot.mjs` recebe JSON local ou exportação do serviço local e gera uma prévia para revisão.
- Fotos: `tools/revisar-ofertas.html` aceita fonte, crédito, status, data e permissão registrada. Sem conferência documentada, a imagem não recebe indicação de revisada.

## Testar o site sem alterar a produção
Em qualquer terminal, na pasta raiz do repositório:
```sh
python -m http.server 8000 --bind 127.0.0.1
```
Abra `http://127.0.0.1:8000/inicio.html`, `produtos.html`,
`comparar-ofertas.html`, `index.html`, `minha-conta.html` e
`tools/revisar-ofertas.html` no navegador. Confira layout desktop e
mobile, login, favoritos, filtros e fluxo do montador 3D.

Testes automatizados (Node.js 22):
```sh
node compatibility.test.mjs
node tools/raven91.test.mjs
node tools/offer-import65.test.mjs
node tools/offer-policy.test.mjs
node tools/audit-offers.mjs --strict
node tools/site-sanity.mjs
```
Os demais testes da aplicação continuam no workflow de qualidade.

## Sincronização do Market Bot
**Opção A: exportação em arquivo** (recomendado para teste):
```sh
node tools/sync-market-bot.mjs --input exportacao-market-bot.json
```

**Opção B: obter a exportação do Market Bot neste computador**, se o servidor
estiver realmente rodando:
```sh
node tools/sync-market-bot.mjs --endpoint http://localhost:4317/api/raven65/export
```

A ferramenta gera `offers.revisao.json` e `relatorio-sync-bot.json`.
Se houver erro de rede/CORS na interface, prefira a opção A no Node.
Nunca exponha a porta 4317 publicamente. O script aceita apenas
`localhost` e `127.0.0.1` na porta 4317, por HTTP.

**Importante:** a sincronização não publica ofertas e não acessa tokens
do GitHub. Em `tools/revisar-ofertas.html`, clique em
**Carregar offers.json atual** e importe `offers.revisao.json`.
Conferir produto por produto, aprovar e exportar `offers.json`.
Só depois enviar o arquivo revisado para o repositório por commit.
Não substitua o arquivo publicado por uma prévia.

## Foto real e licença
O arquivo `offers.json` pode receber estes campos opcionais em cada oferta:
```json
{
  "imageUrl": "https://DOMINIO-AUTORIZADO/imagem-real-do-modelo.jpg",
  "imageSource": "https://DOMINIO-DE-ORIGEM/anuncio-ou-fabricante",
  "imageCredit": "Crédito/termo de autorização concedida",
  "imageReviewStatus": "verified",
  "imageReviewedAt": "AAAA-MM-DD",
  "imageUsagePermission": true
}
```
Este é um **esquema de exemplo, não uma foto real**. Nunca marcar
`verified` antes de comparar foto e modelo (incluindo capacidade/SKU),
confirmar a autorização de uso e registrar o responsável pela revisão.
Uma URL HTTPS de loja não comprova direito de reprodução. Sem esses
campos, a loja avisa que a foto do anúncio não foi revisada.

O revisor oferece um CSV de imagens ausentes ou pendentes; use-o para
revisar a fila sem fingir que fotografias foram encontradas.

## Limites e proteção de funcionalidades
- GitHub Pages não executa tarefas do robô em segundo plano. O script roda
localmente quando acionado.
- Não houve adição de preços, produtos, links ou fotos inventados.
- Carrinho é uma lista de interesse e não há checkout Raven.
- Filtros, favoritos, login, histórico, PCs montados, comparação de PCs,
Raven Academy e montagem 3D permanecem no projeto.
- Validar em navegador e no Supabase de produção antes de mesclar o PR.
