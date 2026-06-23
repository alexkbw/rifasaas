# RifaSaas landing para Vercel

Esta pasta contem uma versao enxuta da landing page do `alexkbw/saas-explorer`, preparada para Vercel.

## Rotas

- `/` mostra a landing em `public/index.html`.
- `/api/tunnel-update` recebe o link atualizado da VM e salva no Redis/Upstash.
- `/api/entrar` le o ultimo link salvo e redireciona o usuario para `/login` no tunel Cloudflared.

## Variaveis na Vercel

Configure no projeto:

```env
TUNNEL_PUSH_TOKEN=troque-por-um-token-forte
UPSTASH_REDIS_REST_URL=https://seu-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=seu-token-upstash
TUNNEL_REDIS_KEY=tunnel:saas-explorer
```

Para testar localmente com as funcoes da Vercel, use:

```bash
npx vercel dev
```

## Endpoint para a VM

Depois do deploy, a VM deve fazer POST para:

```text
https://SEU-PROJETO.vercel.app/api/tunnel-update
```

Com:

```text
Authorization: Bearer <TUNNEL_PUSH_TOKEN>
Content-Type: application/json
```

Corpo:

```json
{
  "updated_at": "2026-06-23T00:00:00Z",
  "saas-explorer": "https://exemplo.trycloudflare.com"
}
```
