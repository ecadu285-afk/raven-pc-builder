# Raven PC Builder 9.2 — revisão

Implementado nesta branch: menu simplificado com Explorar; página Como funciona; transparência comercial reformulada; publicidade junto aos botões; preços exibidos apenas se consultados nos últimos 14 dias; valores Amazon sem fonte autorizada consultados na própria loja; comparador somente com preços elegíveis; guia estático de categorias e fallback sem JavaScript; testes CI.

Catálogo 19/11/2026: 105 ofertas cadastradas, 11 com URL de imagem. Todos os registros têm affiliate:true, mas nenhum tem affiliateStatus:"confirmed". Não significa comissão efetivamente confirmada.

Pendente: revisão das 94 imagens ausentes e direitos de uso por SKU; APIs de atualização de preços e estoque; integração ponta a ponta do aplicativo local Raven Market Bot; páginas individuais SEO com SKUs verificados; validação de login e mobile em navegador; domínio próprio confirmado. Nenhum dado de ofertas foi inventado ou modificado nesta versão.

Testar: node tools/raven92.test.mjs; node tools/raven91.test.mjs; node tools/audit-offers.mjs --strict; node tools/site-sanity.mjs. A produção permanece inalterada até mesclagem.
