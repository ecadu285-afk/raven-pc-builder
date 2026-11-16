# Formato de exportação do robô — Raven 6.2

O painel local aceita um arquivo JSON que contenha `offers` ou uma lista de ofertas.

```json
{
  "schemaVersion": 3,
  "offers": [{
    "partId": "5600g",
    "store": "mercadolivre",
    "category": "cpu",
    "title": "AMD Ryzen 5 5600G",
    "modelName": "Ryzen 5 5600G",
    "price": 700,
    "checkedAt": "2026-11-15",
    "url": "https://meli.la/EXEMPLO",
    "condition": "new",
    "affiliate": false,
    "affiliateStatus": "pending",
    "reviewStatus": "pending"
  }]
}
```

Este é um exemplo **fictício**, não uma oferta real.

- `partId`: ID exato da peça existente no catálogo do montador, quando houver correspondência.
- `store`: `mercadolivre`, `shopee` ou `amazon`; o endereço deve ser HTTPS e do domínio permitido.
- `price`: número positivo em reais, não string formatada.
- `checkedAt`: data da conferência real, AAAA-MM-DD. Nunca altere a data sem consultar o anúncio.
- `imageUrl`: opcional, somente quando houver autorização para usar a imagem do modelo exato.
- `reviewStatus`: novas e alteradas ficam `pending`, somente o operador aprova ou suspende.
- `affiliateStatus`: não use `confirmed` sem confirmação efetiva do programa.
- O revisor identifica anúncios pela combinação `store + url + partId`. Mudanças nessas chaves podem gerar um novo registro.
- O importador não executa scrapers, não cria links de afiliado e não publica remotamente.

O instalador Market Bot 4.6 não faz parte desta branch.
