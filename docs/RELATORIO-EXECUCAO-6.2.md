# Relatório da atualização 6.2 — Raven PC Builder

**Base avaliada:** ZIP enviado nesta conversa em 15/11/2026. A revisão foi feita no código; o site publicado não foi alterado.

## Implementado neste pacote

1. **Login:** `script.js` agora importa `raven-account.js` pela mesma URL usada pela tela de entrada; isso evita duas instâncias independentes do estado de autenticação no mesmo navegador.
2. **Compatibilidade:** caminhos de `compatibility.test.mjs` corrigidos; 14 verificações passaram.
3. **Ofertas:** `offer-policy.mjs` centraliza regras de segurança para vitrine, loja, orçamentos, PCs montados e montador. Links de lojas fora da allowlist, datas inválidas/futuras e ofertas vencidas há mais de 45 dias ficam fora do catálogo público.
4. **Qualidade dos produtos:** 4 registros foram bloqueados para revisão, sem exclusão permanente. Nenhum preço ou modelo foi substituído por uma invenção.
5. **Transparência de afiliados:** removidas alegações específicas de associação à Amazon sem verificação; informação explícita de que a atribuição de comissão ainda não foi comprovada.
6. **Revisão pelo operador:** painel local `tools/revisar-ofertas.html`, com importação do arquivo atual e de exportações do bot, edição, suspensão, aprovação e exportação do JSON revisado. Novos registros aguardam conferência, sem publicação automática.
7. **Automação segura:** pipeline semanal e por alteração do GitHub Actions para testes de compatibilidade, política de ofertas e checagem de páginas.
8. **SEO inicial:** metadados Open Graph básicos, robots.txt e gerador de sitemap para o domínio definitivo.
9. **Experiência:** navegação mais clara e distinção entre lista de interesse e compras em lojas externas. Estilos incrementais foram adicionados sem alterar o 3D.
10. **Documentação:** versões antigas arquivadas, instruções atuais e contrato de exportação do robô.

## Números do catálogo no pacote

- Ofertas originais: **102**.
- Ofertas elegíveis após o bloqueio e as verificações atuais: **98** (isso **não** é um selo de revisão manual).
- Bloqueadas por revisão: **4** registros (envolvendo preço suspeito ou categoria incorreta).
- Com imagem preenchida: **10**; sem imagem preenchida: **92**.
- Marcadas `affiliate: true`: **102**; nenhuma com atribuição comprovada nos dados enviados.
- Com ID compatível com o catálogo do montador: **29** originais; **28** após exclusão dos bloqueados.
- Total de modelos de demonstração/peças do catálogo: **800**, vários conceituais e sem oferta. Não há preços reais garantidos para todas as peças.

## Verificação automatizada

- 14 testes de regressão de compatibilidade: **PASS**.
- 13 testes de publicação segura: **PASS**.
- Sintaxe JavaScript do site: **PASS**.
- Referências internas locais: **PASS**.
- 9 scripts incorporados aos HTML: **PASS**.
- Teste visual em navegador: **não concluído** (bloqueio da infraestrutura de navegador neste ambiente).

## Faltam — dependências externas

- Atualizar o instalador **Market Bot 4.6** ou acessar sua API: arquivos-fonte do robô não integravam o ZIP recebido.
- Criar fotos reais/autorizações e comprovar cada URL, preço ou comissão.
- Ativar uma publicação totalmente automática e auditável a partir do bot — requer código e credenciais do lado do operador, backend seguro e gestão das autorizações.
- Testar autenticação e RLS em produção; nenhuma tabela ou política do banco real foi modificada.
- Configurar sitemap/canonical com domínio definitivo, o que não deve ser presumido.
- Realizar teste de UI completo em desktop/mobile e conferir todas as dependências e APIs externas.