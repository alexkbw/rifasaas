import { getRedis, normalizeTunnelUrl, TUNNEL_KEY } from "../lib/redis.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Metodo nao permitido." });
  }

  const expectedToken = process.env.TUNNEL_PUSH_TOKEN;
  const authHeader = req.headers.authorization || "";

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ ok: false, error: "Nao autorizado." });
  }

  try {
    const payload = await readJson(req);
    const tunnelUrl = normalizeTunnelUrl(payload);

    if (!/^https:\/\/[-a-zA-Z0-9]+\.trycloudflare\.com\/?$/.test(tunnelUrl)) {
      return res.status(400).json({ ok: false, error: "Link trycloudflare invalido." });
    }

    const redis = getRedis();
    const record = {
      url: tunnelUrl.replace(/\/+$/, ""),
      updated_at: payload.updated_at || new Date().toISOString(),
    };

    await redis.set(TUNNEL_KEY, record);

    return res.status(200).json({ ok: true, key: TUNNEL_KEY, updated_at: record.updated_at });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Falha ao atualizar link." });
  }
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const text = Buffer.concat(chunks).toString("utf8").trim();
  return text ? JSON.parse(text) : {};
}
