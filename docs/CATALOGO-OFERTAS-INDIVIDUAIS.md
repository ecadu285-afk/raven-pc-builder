# Raven: correção da visibilidade de anúncios (novembro de 2026)
Causa confirmada:
- Todos os 85 anúncios do último JSON enviado pelo Market Bot estavam no offers.json; o envio não foi a origem da diferença.
- A página produtos.html agrupava anúncios de várias lojas e apresentava apenas 24 cartões até clicar em “Mostrar mais”.
- Nove anúncios Mercado Livre estavam sem categoria explícita e podiam aparecer em "other", fora dos filtros por peça.
- Quatro ofertas no arquivo estão suspensas e devem permanecer fora da vitrine.
- O teste Raven 7.9 esperava exatamente 101 registros, mas o catálogo tinha 105.

Correção:
- Catálogo oferece **Todos os anúncios, separados por loja** (padrão) e **Agrupar por modelo** (opcional).
- Mostra contagem de anúncios, modelos e itens já visíveis; há opção de carregar todos os resultados.
- Nove anúncios com títulos inequívocos receberam categoria; preço, URLs, status de revisão e datas foram preservados.
- Filtro de categoria inclui outros/sem identificação e coolers.
- Testes garantem que cada oferta elegível aparece na categoria correta, sem misturar lojas.
- Oferta suspensa não é publicada.
- Os preços só são registros; não significam estoque ou preço corrente.
- A comparação foi com a exportação 6.5 recebida em 16/11; anúncios adicionados no robô após essa data não podem ser verificados sem uma exportação nova.
