"use strict";

// The sign-language proxy.
//
// ── Why this exists ──────────────────────────────────────────────────────
// The app is static files. Any key shipped in the browser is a key the whole
// internet can read and spend. So the vendor key lives here, in a Netlify
// Function's environment, and never reaches the client.
//
// It also removes a different problem: Sign-Speak has to allow the calling
// origin. With this proxy, the caller is a Netlify server, not a browser, so a
// missing CORS allowlist on their side can no longer break the app.
//
// ── The constraints that shape the code ──────────────────────────────────
// Netlify Functions are AWS Lambda:
//   · 6 MB maximum request payload
//   · 10 s default timeout (26 s at most)
//
// The vendor's BLOCKING mode holds a connection for up to 30 s, which would be
// killed here. So proxy mode uses BATCH: POST returns a request id immediately,
// and the client polls. Every individual call is short. `app/js/providers/
// signspeak.js` already understands a 202 and polls — this function just has to
// stay out of the way.
//
// ── What it will and will not do ─────────────────────────────────────────
// It forwards exactly five routes, listed in RULES. It is not a general proxy:
// an open relay that attaches your vendor key to any URL is worse than no
// proxy at all.

const VENDOR = "https://api.sign-speak.com";

/** Route allowlist. Anything not here is rejected before the key is touched. */
const RULES = {
  "POST /recognizeASL": { maxBytes: 5_000_000 }, // base64 video; Lambda caps at 6 MB
  "POST /produceASL": { maxBytes: 400_000 }, // a sentence of English
  "GET /recognizeASL": { maxBytes: 0 }, // batch poll
  "GET /produceASL": { maxBytes: 0 }, // batch poll
  "GET /status": { maxBytes: 0 }, // readiness, answered locally
};

// ── crude but honest rate limiting ───────────────────────────────────────
// A warm Lambda keeps this map; a cold start resets it. That is not a
// security control, it is a burst guard so one tab in a loop cannot drain the
// account before a human notices. The real ceiling is the vendor's quota.

const WINDOW_MS = 60_000;
const PER_IP = 30;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, n: 1 });
    return false;
  }

  entry.n += 1;

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k);
  }

  return entry.n > PER_IP;
}

// ── helpers ──────────────────────────────────────────────────────────────

function clientIp(event) {
  return (
    event.headers?.["x-nf-client-connection-ip"] ||
    event.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Work out which vendor route was asked for.
 * Netlify rewrites `/api/sign/x` to `/.netlify/functions/sign/x`, and which of
 * the two arrives in `event.path` depends on the redirect; both are handled.
 */
function resolvePath(event) {
  let p = event.path || "";

  for (const prefix of ["/.netlify/functions/sign", "/api/sign", "/sign"]) {
    if (p === prefix) {
      p = "";
      break;
    }
    if (p.startsWith(`${prefix}/`)) {
      p = p.slice(prefix.length);
      break;
    }
  }

  // Optional ?action= override, for callers that cannot rewrite the path.
  const qs = event.queryStringParameters || {};
  if (qs.action) p = `/${qs.action}`;

  p = p.replace(/\/+$/, "");
  if (!p) p = "/status";
  return p.startsWith("/") ? p : `/${p}`;
}

/** Rebuild the query string, dropping our own `action` control parameter. */
function forwardQuery(event) {
  const qs = { ...(event.queryStringParameters || {}) };
  delete qs.action;
  const s = new URLSearchParams(qs).toString();
  return s ? `?${s}` : "";
}

function bodyBytes(event) {
  if (!event.body) return 0;
  return event.isBase64Encoded
    ? Math.floor((event.body.length * 3) / 4)
    : Buffer.byteLength(event.body, "utf8");
}

const ALLOWED_ORIGINS = (
  process.env.UNMUTE_ALLOWED_ORIGINS ||
  "https://liveunmute.netlify.app,https://app.liveunmute.com,http://localhost:8083"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function corsHeaders(event) {
  const origin = event.headers?.origin;
  if (!origin) return {};
  if (!ALLOWED_ORIGINS.includes(origin)) return {};
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
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-unmute-proxy": "1",
      ...corsHeaders(event),
      ...extra,
    },
    body: JSON.stringify(body),
  };
}

// ── the handler ──────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const method = (event.httpMethod || "GET").toUpperCase();
  const path = resolvePath(event);

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event), body: "" };
  }

  // /status is answered locally and never contacts the vendor.
  if (path === "/status") {
    const key = process.env.SIGNSPEAK_KEY || process.env.SIGNSPEAK_PUBLIC_KEY || "";
    return reply(
      200,
      {
        configured: Boolean(key),
        vendor: "Sign-Speak",
        model: process.env.SIGNSPEAK_MODEL || "SLR.2.sm",
        mode: "proxy",
        requestClass: "BATCH",
        note: key
          ? "Server-side key present. Requests are forwarded from Netlify, never from the browser."
          : "No server-side key set. Set SIGNSPEAK_KEY in Netlify's environment variables.",
      },
      event
    );
  }

  const rule = RULES[`${method} ${path}`];

  if (!rule) {
    return reply(
      403,
      {
        error: "route_not_allowed",
        message: `The proxy does not forward ${method} ${path}.`,
        allowed: Object.keys(RULES),
      },
      event
    );
  }

  const ip = clientIp(event);
  if (rateLimited(ip)) {
    return reply(
      429,
      { error: "rate_limited", message: "Too many requests from this address in the last minute." },
      event
    );
  }

  const key = process.env.SIGNSPEAK_KEY || process.env.SIGNSPEAK_PUBLIC_KEY || "";

  if (!key) {
    return reply(
      503,
      {
        error: "not_configured",
        message:
          "SIGNSPEAK_KEY is not set on this deployment. Set it in Netlify → Site configuration → Environment variables, then redeploy.",
      },
      event
    );
  }

  const size = bodyBytes(event);
  if (rule.maxBytes && size > rule.maxBytes) {
    return reply(
      413,
      {
        error: "payload_too_large",
        message: `${Math.round(size / 1024)} KB exceeds the ${Math.round(
          rule.maxBytes / 1024
        )} KB limit for this route. Shorten the clip.`,
      },
      event
    );
  }

  const target = `${VENDOR}${path}${forwardQuery(event)}`;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000); // under Lambda's 10 s

  try {
    const upstream = await fetch(target, {
      method,
      headers: {
        "content-type": "application/json",
        authorization: key,
      },
      body: method === "GET" ? undefined : event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body,
      signal: ac.signal,
    });

    const text = await upstream.text();

    // Pass the vendor's status through untouched: 202 in particular is
    // meaningful to the client, which reacts by polling.
    return {
      statusCode: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
        "x-unmute-proxy": "1",
        "x-unmute-upstream-status": String(upstream.status),
        ...corsHeaders(event),
      },
      body: text,
    };
  } catch (err) {
    const aborted = err?.name === "AbortError";
    return reply(
      aborted ? 504 : 502,
      {
        error: aborted ? "upstream_timeout" : "upstream_unreachable",
        message: aborted
          ? "Sign-Speak did not answer within 8 seconds. The clip is probably too long for the proxy — BATCH mode should return instantly, so check request_class."
          : `Could not reach Sign-Speak: ${String(err?.message || err).slice(0, 160)}`,
      },
      event
    );
  } finally {
    clearTimeout(timer);
  }
};
