# Raven 4.8 — estabilidade da loja e automação editorial do bot

## Site público (GitHub Pages)
- `script.js` importa **o mesmo módulo `raven-account.js`** que a tela de boas-vindas. Corrige a duplicação de cliente/estado Supabase ao acessar diretamente o montador 3D.
- `storefront-shop.js`: preços com mais de **14 dias desde a conferência** ficam sinalizados como antigos. Em comparações de um mesmo modelo, o site prioriza anúncios com data mais recente e só então compara os valores. Os anúncios antigos **não são apagados** e o usuário pode conferir o preço na loja.
- `pcs-montados.html`: aplica o mesmo aviso de preço antigo a computadores completos e kits.
- Versões dos arquivos CSS/JS alteradas para reduzir problemas de cache.
- O Raven **não compra produtos**: carrinho é uma lista de interesse, ofertas e entrega são de lojas externas.

## Bot local (pacote Windows 4.8, entregue separadamente)
- Instalação preserva dados e credenciais locais, com backup antes da troca. Usar instalador 4.8, não arquivos do repositório público.
- Central de automação dentro de **Metas e sincronização**: ligar/desligar, intervalo de 1 a 24 horas, pesquisa Shopee mediante API e botão `Executar pesquisa agora`.
- Diagnóstico editorial privado mostra quantidades pendentes, aprovadas e preços vencidos (mais de 14 dias), divididos em peças, PCs e kits.
- **Nenhuma publicação automática** para GitHub. Revisão, prévia e confirmação manual continuam obrigatórias.
- Regras do pacote anterior de pesquisa e publicação foram preservadas.
- Testes automatizados 4.7 e 4.8 incluídos no `npm test`.

## Limitações e validação
- Código do site integrado ao GitHub não equivale a teste funcional em todos os navegadores; entrar em dois dispositivos e testar sessão é necessário.
- Não temos acesso ao banco privado `data/market.json` nem ao token do bot que está no computador; uma publicação real não foi acionada.
- A automação depende do PC ligado e do servidor local rodando. Apenas a API Shopee conectada permite pesquisa automática real; Amazon e Mercado Livre continuam com pesquisa assistida.
- Preços antigos não significam estoque esgotado. As fotos precisam ser vinculadas ao anúncio real.
- O aviso no Supabase sobre proteção de senhas vazadas ainda exige revisão pelo administrador.

## Testes antes de divulgar amplamente
1. Abrir `inicio.html` e `index.html` com a conta conectada e verificar a persistência de sessão.
2. Salvar e carregar até 5 montagens; testar duas contas para isolamento.
3. Conferir os avisos de preço antigo em `produtos.html` e `pcs-montados.html`.
4. Instalar o bot 4.8 no Windows, depois conferir dados anteriores em `Revisar ofertas`.
5. Em `Metas e sincronização`, executar diagnóstico e pesquisa manual; só habilitar a agenda quando a API estiver configurada.
6. Conferir a prévia e publicar apenas um produto real aprovado, verificando o commit e a página pública; guardar backup.
