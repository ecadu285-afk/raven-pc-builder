# Raven PC — entregas agrupadas 6.3, 6.4 e 6.5

## 6.3 — estabilidade e testes
- Preserva o login existente, o montador 3D, as regras de ofertas e a visualização de preços antigos.
- Adiciona testes de regressão para filtros do catálogo e importação segura do robô.
- Os testes automáticos NÃO substituem teste manual de login no Supabase, carrinho, 3D nem dispositivos reais.

## 6.4 — catálogo
- Filtros por condição, preço máximo e fotos cadastradas.
- Pesquisa tolerante a acentos e palavras em ordem diferente.
- Opção de limpar filtros; layout responsivo.
- Suporte a anúncios DIRETOS e autorizados de KaBuM! e TerabyteShop, além das três lojas anteriores.
- Foto genérica não é exibida como sendo foto real. Não foram inventadas imagens, preços ou anúncios.

## 6.5 — Market Bot
- O pacote separado do Market Bot 5.1 usa a rota LOCAL http://127.0.0.1:4317/api/raven65/export.
- No computador do operador, baixe essa exportação e importe em tools/revisar-ofertas.html depois de carregar offers.json.
- Apenas itens inalterados preservam a aprovação; novos e alterados ficam pendentes. A oferta antiga correspondente é substituída no catálogo revisável, sem ficar ativa.
- O comando node tools/stage-bot65.mjs arquivo-do-robo.json produz offers-para-revisao.json SEM sobrescrever o arquivo publicado.
- Fonte de busca da Shopee ou Mercado Livre não prova estoque, preço, comissão ou permissão de API; confirme cada oferta no parceiro.

## Segurança e limites
- Nunca publique pastas data/private do robô, tokens OAuth, chaves GitHub ou service_role.
- O painel em tools/ é revisor LOCAL, não painel online autenticado.
- APIs de parceiros só funcionam com autorização do usuário e disponibilidade dos serviços; integração de arquivos não equivale a cotação em tempo real.
- Não publique em main sem conferir os checks e testar manualmente o fluxo essencial no navegador.
