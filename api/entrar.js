import { buildTargetUrl, getRedis, normalizeTunnelUrl, TUNNEL_KEY } from "../lib/redis.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Metodo nao permitido." });
  }

  try {
    const redis = getRedis();
    const stored = await redis.get(TUNNEL_KEY);
    const fallback = process.env.FALLBACK_TUNNEL_URL || "";
    const tunnelUrl = normalizeTunnelUrl(stored) || normalizeTunnelUrl(fallback);

    if (!tunnelUrl) {
      return res.status(503).send(renderUnavailablePage());
    }

    const targetUrl = buildTargetUrl(tunnelUrl, req.query?.next || "/login");

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.writeHead(302, { Location: targetUrl });
    return res.end();
  } catch (error) {
    console.error(error);
    return res.status(500).send(renderUnavailablePage());
  }
}

function renderUnavailablePage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>RifaSaas indisponivel</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Arial, sans-serif; background: #f7fafc; color: #172033; }
      main { width: min(520px, calc(100% - 32px)); border: 1px solid #d8e0ec; border-radius: 8px; background: white; padding: 28px; }
      h1 { margin: 0 0 10px; font-size: 24px; }
      p { margin: 0; color: #59677a; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>Aplicacao temporariamente indisponivel</h1>
      <p>Ainda nao recebemos o link atualizado da VM. Tente novamente em instantes.</p>
    </main>
  </body>
</html>`;
}
