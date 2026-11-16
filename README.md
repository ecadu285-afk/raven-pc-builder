# Raven PC Builder — atualização 6.2 (branch de revisão)

Site estático da Raven Creatives Studios, com vitrine de hardware, montador 3D, contas, favoritos e lista de interesse. **Não realiza checkout nem comprova preços, estoque, frete ou comissão em tempo real.**

Esta branch foi criada sobre a versão mais recente de `main` para preservar ajustes já publicados. **Não representa uma implantação validada em produção.**

## Iniciar e testar

Execute um servidor HTTP local na raiz do repositório:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8000/inicio.html` e teste também:
- `index.html` — montador de PCs;
- `produtos.html` e `pcs-montados.html` — catálogo;
- `minha-conta.html` — autenticação e lista de interesse;
- `tools/revisar-ofertas.html` — **revisor local** de JSON, sem login administrativo.

Não use `file://`: scripts em módulo e `fetch()` exigem servidor HTTP.

## Testes automatizados

```sh
node compatibility.test.mjs
node tools/offer-policy.test.mjs
node tools/audit-offers.mjs --strict
node tools/site-sanity.mjs
```

A rotina `.github/workflows/raven-quality.yml` executa verificações em alterações e semanalmente.

## Atualização de ofertas

O site lê `offers.json`. O revisor local importa ofertas do robô, marca novas ou alteradas como pendentes, permite edição e exporta um arquivo revisado. **Nenhuma alteração é publicada automaticamente.**

A política `offer-policy.mjs` bloqueia URLs não confiáveis, datas inválidas, cotações vencidas e ofertas em revisão. Uma aprovação automática não substitui a conferência humana. `affiliate: true` não comprova recebimento de comissão.

Consulte `docs/CONTRATO-EXPORTACAO-ROBO.md`, `docs/GUIA-PUBLICACAO-6.2.md` e `docs/RELATORIO-EXECUCAO-6.2.md`.

## Pendências de produção

Login e RLS no Supabase real, fotos e direitos de uso, links e comissões, integração com API do robô/Market Bot 4.6, e testes de navegador desktop/mobile **ainda precisam de validação externa**. Não coloque tokens ou credenciais em arquivos públicos. O revisor local não é painel administrativo de produção.
