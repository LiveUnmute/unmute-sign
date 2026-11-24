"use strict";

// Signa AI's ASL output proxy.
//
// Only clinician text is sent through this function. The Signa key remains in
// the server environment; neither the key nor a reusable client token reaches
// the browser. Patient signing is handled by a separate recognition provider.
//
// POST /video performs the documented two-step flow:
//   POST /v1/sign       { text, from: "en", to: "ase" } -> .sgn bytes
//   POST /v1/sign/video .sgn bytes                        -> MP4 bytes
//
// The text and returned video are not written to disk or logged. This endpoint
// is intentionally limited to short, single-turn requests for the ASL pilot.

const API_ORIGIN = "https://api.usesigna.org";
const MAX_BODY_BYTES = 8_192;
const MAX_TEXT_CHARS = 300;
const MAX_SGN_BYTES = 2_000_000;
// Base64 expansion in a Netlify function response must remain comfortably
// below the platform's roughly 6 MB synchronous payload ceiling.
const MAX_VIDEO_BYTES = 3_500_000;
const UPSTREAM_TIMEOUT_MS = 8_500;
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

function videoReply(bytes, event) {
  return {
    statusCode: 200,
    headers: {
      "content-type": "video/mp4",
      "content-length": String(bytes.length),
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-unmute-proxy": "1",
      ...corsHeaders(event),
    },
    body: bytes.toString("base64"),
    isBase64Encoded: true,
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

async function upstreamMessage(response) {
  const raw = await response.text().catch(() => "");
  if (!raw) return "";

  try {
    const json = JSON.parse(raw);
    const message = json?.message || json?.error || json?.detail;
    return typeof message === "string" ? message.slice(0, 180) : "";
  } catch {
    return raw.slice(0, 180);
  }
}

function upstreamFailure(response, stage, event) {
  return upstreamMessage(response).then((detail) =>
    reply(
      response.status >= 400 && response.status < 500 ? response.status : 502,
      {
        error: `signa_${stage}_failed`,
        message: `Signa ${stage} request failed (HTTP ${response.status})${detail ? `: ${detail}` : "."}`,
      },
      event,
      { "x-unmute-upstream-status": String(response.status) }
    )
  );
}

exports.handler = async (event) => {
  const method = (event.httpMethod || "GET").toUpperCase();
  const path = resolvePath(event);

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event), body: "" };
  }

  // Status reports configuration only; it never returns or tests the key.
  if (method === "GET" && path === "/status") {
    const configured = Boolean(process.env.SIGNA_KEY);
    return reply(
      200,
      {
        configured,
        vendor: "Signa AI",
        mode: "server-proxy",
        from: "en",
        to: "ase",
        note: configured
          ? "Server-side key present. This integration signs English text into ASL output; it does not recognise patient signing."
          : "No SIGNA_KEY is set on this deployment. Add it as a server-side environment variable and redeploy.",
      },
      event
    );
  }

  if (method !== "POST" || path !== "/video") {
    return reply(
      403,
      { error: "route_not_allowed", message: `The Signa proxy does not allow ${method} ${path}.` },
      event
    );
  }

  const key = process.env.SIGNA_KEY || "";
  if (!key) {
    return reply(
      503,
      {
        error: "not_configured",
        message: "SIGNA_KEY is not set. Add it in Netlify's environment variables, then redeploy.",
      },
      event
    );
  }

  const ip = clientIp(event);
  if (rateLimited(ip)) {
    return reply(
      429,
      { error: "rate_limited", message: "Signa test limit reached for this address. Wait a minute before trying again." },
      event,
      { "retry-after": "60" }
    );
  }

  const size = bodyBytes(event);
  if (size > MAX_BODY_BYTES) {
    return reply(
      413,
      { error: "payload_too_large", message: `Request body exceeds ${MAX_BODY_BYTES} bytes.` },
      event
    );
  }

  let input;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body || "";
    input = JSON.parse(raw);
  } catch {
    return reply(400, { error: "invalid_json", message: "Send a JSON object containing text." }, event);
  }

  const text = typeof input?.text === "string" ? input.text.trim() : "";
  if (!text) {
    return reply(400, { error: "text_required", message: "Enter a sentence to sign." }, event);
  }
  if (text.length > MAX_TEXT_CHARS) {
    return reply(
      413,
      { error: "text_too_long", message: `Keep each Signa request to ${MAX_TEXT_CHARS} characters or fewer.` },
      event
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const signResponse = await fetch(`${API_ORIGIN}/v1/sign`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        accept: "application/vnd.signa.sgn",
      },
      body: JSON.stringify({ text, from: "en", to: "ase" }),
      signal: controller.signal,
    });

    if (!signResponse.ok) return await upstreamFailure(signResponse, "sign", event);

    const sgnLength = Number(signResponse.headers.get("content-length") || 0);
    if (sgnLength > MAX_SGN_BYTES) {
      return reply(413, { error: "sign_output_too_large", message: "The signed output is too large for this prototype." }, event);
    }

    const sgn = Buffer.from(await signResponse.arrayBuffer());
    if (!sgn.length) {
      return reply(502, { error: "empty_sign_output", message: "Signa returned no signed animation for this text." }, event);
    }
    if (sgn.length > MAX_SGN_BYTES) {
      return reply(413, { error: "sign_output_too_large", message: "The signed output is too large for this prototype." }, event);
    }

    const videoResponse = await fetch(`${API_ORIGIN}/v1/sign/video`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/octet-stream",
        accept: "video/mp4",
      },
      body: sgn,
      signal: controller.signal,
    });

    if (!videoResponse.ok) return await upstreamFailure(videoResponse, "video", event);

    const contentType = videoResponse.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("video/mp4")) {
      return reply(502, { error: "invalid_video_response", message: "Signa did not return an MP4 video." }, event);
    }

    const videoLength = Number(videoResponse.headers.get("content-length") || 0);
    if (videoLength > MAX_VIDEO_BYTES) {
      return reply(413, { error: "video_too_large", message: "The rendered video is too large for this prototype." }, event);
    }

    const video = Buffer.from(await videoResponse.arrayBuffer());
    if (!video.length) {
      return reply(502, { error: "empty_video", message: "Signa returned an empty video." }, event);
    }
    if (video.length > MAX_VIDEO_BYTES) {
      return reply(413, { error: "video_too_large", message: "The rendered video is too large for this prototype." }, event);
    }

    return videoReply(video, event);
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    return reply(
      timedOut ? 504 : 502,
      {
        error: timedOut ? "upstream_timeout" : "upstream_unreachable",
        message: timedOut
          ? "Signa did not finish rendering within the serverless time limit. Try a shorter sentence."
          : `Could not reach Signa: ${String(error?.message || error).slice(0, 160)}`,
      },
      event
    );
  } finally {
    clearTimeout(timer);
  }
};
