"use strict";

// Signa's main key stays server-side. This function mints a short-lived client
// token so the browser can call Signa directly for the two-step .sgn → MP4 flow.
// Rendering in Netlify was timing out at the synchronous-function ceiling; the
// browser can wait for Signa's several-second render without a serverless 504.

const API_ORIGIN = "https://api.usesigna.org";
const TOKEN_TTL_SECONDS = 300;
const MAX_BODY_BYTES = 2_048;
const UPSTREAM_TIMEOUT_MS = 7_500;
const WINDOW_MS = 60_000;
const PER_IP = 6;
const hits = new Map();

const ALLOWED_ORIGINS = (
  process.env.UNMUTE_ALLOWED_ORIGINS ||
  "https://liveunmute.netlify.app,https://app.liveunmute.com,http://localhost:8083"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function clientIp(event) {
  return (
    event.headers?.["x-nf-client-connection-ip"] ||
    event.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// Per-warm-instance burst guard, not a durable authentication mechanism.
function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, n: 1 });
    return false;
  }

  entry.n += 1;
  if (hits.size > 500) {
    for (const [key, value] of hits) {
      if (now - value.start > WINDOW_MS) hits.delete(key);
    }
  }
  return entry.n > PER_IP;
}

function corsHeaders(event) {
  const origin = event.headers?.origin;
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    vary: "Origin",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  };
}

function reply(statusCode, body, event, extra = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-unmute-proxy": "1",
      ...corsHeaders(event),
      ...extra,
    },
    body: JSON.stringify(body),
  };
}

function resolvePath(event) {
  let path = event.path || "";
  for (const prefix of ["/.netlify/functions/signa", "/api/signa", "/signa"]) {
    if (path === prefix) {
      path = "";
      break;
    }
    if (path.startsWith(`${prefix}/`)) {
      path = path.slice(prefix.length);
      break;
    }
  }

  const query = event.queryStringParameters || {};
  if (query.action) path = `/${query.action}`;
  path = path.replace(/\/+$/, "");
  if (!path) path = "/status";
  return path.startsWith("/") ? path : `/${path}`;
}

function bodyBytes(event) {
  if (!event.body) return 0;
  return event.isBase64Encoded
    ? Math.floor((event.body.length * 3) / 4)
    : Buffer.byteLength(event.body, "utf8");
}

async function upstreamError(response) {
  const raw = await response.text().catch(() => "");
  if (!raw) return "";
  try {
    const json = JSON.parse(raw);
    const detail = json?.message || json?.error || json?.detail;
    return typeof detail === "string" ? detail.slice(0, 180) : "";
  } catch {
    return raw.slice(0, 180);
  }
}

exports.handler = async (event) => {
  const method = (event.httpMethod || "GET").toUpperCase();
  const path = resolvePath(event);

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event), body: "" };
  }

  // This confirms only that a key is present; it never returns or tests it.
  if (method === "GET" && path === "/status") {
    const configured = Boolean(String(process.env.SIGNA_KEY || "").trim());
    return reply(
      200,
      {
        configured,
        vendor: "Signa AI",
        mode: "server-minted-client-token",
        from: "en",
        to: "ase",
        note: configured
          ? "Server-side key present. The browser gets a short-lived token for English-to-ASL output only."
          : "No SIGNA_KEY is set for this deploy context. Add it as a server-side environment variable and redeploy.",
      },
      event
    );
  }

  if (method !== "POST" || path !== "/token") {
    return reply(
      403,
      { error: "route_not_allowed", message: `The Signa token function does not allow ${method} ${path}.` },
      event
    );
  }

  const key = String(process.env.SIGNA_KEY || "").trim();
  if (!key) {
    return reply(
      503,
      { error: "not_configured", message: "SIGNA_KEY is not set for this deploy context." },
      event
    );
  }

  const ip = clientIp(event);
  if (rateLimited(ip)) {
    return reply(
      429,
      { error: "rate_limited", message: "Too many Signa token requests from this address. Wait a minute and try again." },
      event,
      { "retry-after": "60" }
    );
  }

  if (bodyBytes(event) > MAX_BODY_BYTES) {
    return reply(413, { error: "payload_too_large", message: "Token request body is too large." }, event);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${API_ORIGIN}/v1/api/client-tokens`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ ttlSeconds: TOKEN_TTL_SECONDS }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const detail = await upstreamError(upstream);
      const status = upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502;
      return reply(
        status,
        {
          error: "signa_token_failed",
          message: `Signa could not issue a client token (HTTP ${upstream.status})${detail ? `: ${detail}` : "."}`,
        },
        event,
        { "x-unmute-upstream-status": String(upstream.status) }
      );
    }

    const result = await upstream.json();
    if (typeof result?.token !== "string" || !result.token.startsWith("ct_")) {
      return reply(502, { error: "invalid_signa_token_response", message: "Signa returned no usable client token." }, event);
    }

    return reply(
      200,
      { token: result.token, expiresAt: result.expiresAt || null },
      event
    );
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    return reply(
      timedOut ? 504 : 502,
      {
        error: timedOut ? "token_timeout" : "token_unreachable",
        message: timedOut
          ? "Signa's token service did not respond in time. Try again."
          : `Could not reach Signa's token service: ${String(error?.message || error).slice(0, 160)}`,
      },
      event
    );
  } finally {
    clearTimeout(timer);
  }
};
