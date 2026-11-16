# Guia de publicação segura — Raven PC Builder 6.2

## 1. Antes de substituir os arquivos do GitHub

- Faça backup da versão atual.
- Abra `inicio.html`, `index.html`, `produtos.html`, `pcs-montados.html`, `orcamento.html` e `minha-conta.html` pelo Live Server do VS Code.
- Faça testes no desktop e no celular (menu, busca, navegação, carrinho, fotos, filtros e 3D).
- Teste cadastro, login, logout, confirmação e recuperação por e-mail, avaliação moderada e isolamento de dados entre duas contas Supabase distintas.
- Verifique manualmente a categoria, condição, preço, URL e direitos de uso das fotos de pelo menos 10 anúncios. Não invente fotos.
- Confira se o bot exporta a mesma estrutura JSON esperada pelo painel.

## 2. Importar e aprovar ofertas do robô

- Mantenha o bot local fechado para a internet; **nunca exponha a porta do painel ou credenciais por túnel público**.
- Exporte do bot sem arquivos secretos, apenas o catálogo de anúncios.
- Acesse `tools/revisar-ofertas.html` com o servidor local e carregue o `offers.json` atual.
- Importe a exportação do robô; os itens novos/alterados passarão para pendente.
- Somente após conferir manualmente cada anúncio, clique em Aprovar e exporte o novo `offers.json`.
- Execute os quatro comandos do `README.md`. Erros devem ser corrigidos antes de publicar.

## 3. Publicar

- Coloque os arquivos do site na **raiz** do repositório GitHub Pages (não dentro de uma pasta adicional).
- O repositório deve conter `offer-policy.mjs` para o catálogo funcionar.
- GitHub Pages não recebe atualizações diretamente do robô local; a publicação ocorre por commit/implantação do repositório.
- Em produção, não divulgue `tools/revisar-ofertas.html` como painel autenticado. Ele não modifica dados remotamente.
- Se decidir hospedar em um domínio próprio, configure DNS e HTTPS e teste o domínio antes de anunciar.

## 4. SEO

Adicione o domínio público definitivo ao gerador:

```sh
node tools/generate-sitemap.mjs https://SEU-DOMINIO-REAL/
```

Depois, adicione ao `robots.txt` a linha `Sitemap: https://SEU-DOMINIO-REAL/sitemap.xml`. Configure URL canônica absoluta e tags `og:url` usando o domínio real; não copie o endereço de exemplo. Solicite a indexação no Google Search Console após a publicação.

## 5. Condições de comissão

Confirme conta aprovada, parâmetros de tracking, status do programa e requisitos de divulgação em cada plataforma. Não use uma alegação específica de associação comercial sem confirmação. O `rel="sponsored"` no HTML não comprova comissionamento.

## 6. Revisão de segurança e privacidade

O SQL Supabase do projeto possui RLS e políticas por usuário, mas é necessário testar essas políticas na instância usada. Nunca exponha chaves `secret` ou `service_role` no navegador. Reveja os textos de privacidade, acesso a localização e tratamento de solicitações de exclusão de conta antes de liberar novos serviços. A localização precisa continuar opcional e consentida.

## 7. Escopo entregue vs. pendências

**Entregue no código:** import do login unificado, testes corrigidos, política de ofertas em todas as páginas, bloqueio de anúncios inconsistentes, painel local de aprovação, rotina automática de testes, SEO básico, documentação atualizada e transparência dos afiliados.

**Pendente de validação externa:** integração direta com as APIs das lojas, atualização do instalador 4.6 do bot, geração automatizada de links de afiliado, inclusão de fotos reais autorizadas, teste visual responsivo e operações reais do Supabase. Essas tarefas não podem ser concluídas somente com os arquivos do site.