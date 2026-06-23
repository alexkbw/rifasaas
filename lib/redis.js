import { Redis } from "@upstash/redis";

export const TUNNEL_KEY = process.env.TUNNEL_REDIS_KEY || "tunnel:saas-explorer";

export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error("Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN na Vercel.");
  }

  return new Redis({ url, token });
}

export function normalizeTunnelUrl(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value.url || value["saas-explorer"] || value.saasExplorer || "").trim();
}

export function buildTargetUrl(baseUrl, nextPath = "/login") {
  const cleanBase = normalizeTunnelUrl(baseUrl).replace(/\/+$/, "");
  const cleanPath =
    typeof nextPath === "string" && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/login";

  return `${cleanBase}${cleanPath}`;
}
