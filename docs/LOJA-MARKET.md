# Raven Market — Minha conta, carrinho, salvos, CEP e avaliações

## Escopo desta versão
O Raven PC Builder NÃO é uma loja com checkout próprio. O catálogo `offers.json` reúne anúncios e links de lojas externas (Shopee, Mercado Livre, Amazon). A Raven não recebe o pedido, não cobra cartão, não gera etiquetas nem tem acesso ao histórico de compras feito em contas dessas lojas.

O menu **Compras** explica esta limitação e orienta o visitante a conferir pedidos no varejista. O **Carrinho** é uma lista pessoal de links/ofertas para consultar; preços podem mudar.

## Implementado
- Barra inicial estilo varejo de hardware, visual próprio da Raven: conta, salvos, carrinho, compras, CEP, busca e categorias.
- Área `minha-conta.html` que usa **o mesmo Supabase Auth** já instalado para montar PCs.
- Produtos salvos e carrinho por usuário, sem acesso cruzado: `raven_user_items`.
- CEP opcional de 8 dígitos, editável e apagável: `raven_customer_profile`.
- Avaliações de produtos (1 a 5 estrelas, 15–500 caracteres), uma por usuário/modelo. O público só vê as aprovadas; o autor pode consultar e remover sua avaliação pendente ou aprovada: `raven_product_reviews`.
- Botões para salvar, adicionar ao carrinho e avaliar em `produtos.html` e nas ofertas de `inicio.html`; atalhos no Montador 3D.
- Nenhuma permissão de edição de produtos, preços ou aprovação de avaliações para usuários comuns.
- Política de privacidade atualizada.

## Administração das avaliações
Apenas o administrador do projeto Supabase poderá aprovar as avaliações. A etapa inicial usa o Supabase Dashboard, não há controle administrativo público. Consulte a tabela `public.raven_product_reviews`, analise comentários com `moderation_status = 'pending'` e altere a coluna para `approved` ou `rejected` depois da revisão.

**Não publique automaticamente avaliações pendentes.** Não exiba e-mails, telefones ou endereços junto a avaliações. Comentários são exibidos no site com `textContent`, nunca como HTML interpretado.

## Testes de aceitação necessários
1. Abra `inicio.html` em desktop e celular. Verifique o cabeçalho, busca, cards, atalhos e menu da loja no Montador 3D.
2. Entre como usuário A, salve um produto, adicione outro ao carrinho e cadastre um CEP. Saia da conta.
3. Entre como B; as listas e o CEP de A não devem aparecer. Tente consultar os dados de A diretamente pela API usando o token de B; deve ser negado pela RLS.
4. Entre novamente como A em outro navegador e confira persistência das listas e do CEP.
5. Apague o CEP e confirme que some ao atualizar.
6. Envie uma avaliação com usuário A, confira que ela fica **pendente** e não aparece para usuário B.
7. Aprove manualmente no Supabase e confira que a avaliação se torna visível a B. Exclua como A e verifique o resultado.
8. Verifique que o botão **Ver oferta** abre o link externo correto, que não há checkout fictício e que preços e frete não são apresentados como cotação em tempo real.
9. Confirme que o Bot de pesquisa e a publicação de ofertas continuam intactos.

## Arquitetura de segurança
Migração `supabase/raven_market_conta.sql` instalada no projeto `lzgkerswxlpdvmbxykns`. Três tabelas com RLS, índices, concessões explícitas e políticas verificáveis no SQL Editor. A chave publishable pública é utilizada somente no cliente. Nunca use `service_role` no site.

Observação: o Supabase Security Advisor sinalizou que o recurso de proteção contra senhas vazadas ainda não está ativado; revisar em Auth antes de grande divulgação.
