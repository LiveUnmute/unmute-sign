// Runtime configuration.
//
// ── The rule this file exists to enforce ─────────────────────────────────
// The app is static files on Netlify. There is no server to hold a secret, so
// **nothing in here may be a private key**. Sign-Speak's docs are explicit
// about the distinction:
//
//   PRIVATE key — can mint keys, read all usage. SERVER ONLY. Never here.
//   ROOT key    — mints other keys. SERVER ONLY. Never here.
//   PUBLIC key  — inference requests only, sandboxed per key. This one is
//                 designed to sit in browser code. Use it.
//
// A private key pasted into this file is a key anyone can spend. If you ever
// suspect one leaked, rotate it at client.sign-speak.com rather than editing
// this repo.
//
// ── What this file is NOT ────────────────────────────────────────────────
// It does not gate the app. With no key configured the provider resolver falls
// back to the scripted mock and every screen still works, clearly labelled.
// That is deliberate: Demo Day must not depend on a key, a network, or a
// vendor having a good morning.

/**
 * Where the browser looks for keys, in order:
 *
 *   1. ?provider=… query string — testing only, never a key
 *   2. window.UNMUTE_CONFIG  — set by an inline script you deploy per-install
 *   3. <meta name="signspeak-key"> — per-deployment config
 *   4. nothing → mock provider
 *
 * @returns {{
 *   signSpeakKey: string, signSpeakBase: string, signSpeakModel: string,
 *   talksignKey: string, forceProvider: string, maxClipMs: number,
 *   captureWidth: number, captureHeight: number
 * }}
 */
export function readConfig() {
  const g = globalThis.UNMUTE_CONFIG || {};

  const meta = (name) => {
    if (typeof document === "undefined") return "";
    return document.querySelector?.(`meta[name="${name}"]`)?.getAttribute("content")?.trim() || "";
  };

  const param = (name) => {
    if (typeof location === "undefined") return "";
    try {
      return new URLSearchParams(location.search).get(name) || "";
    } catch {
      return "";
    }
  };

  return {
    // Inference-only public key. See the warning at the top of this file.
    signSpeakKey: String(g.signSpeakKey || meta("signspeak-key") || "").trim(),
    signSpeakBase: String(g.signSpeakBase || meta("signspeak-base") || "https://api.sign-speak.com").replace(/\/+$/, ""),

    // "SLR.2.sm" is the model string used in Sign-Speak's own SDK example.
    // If they give you a newer clinical model, it goes here and nowhere else.
    signSpeakModel: String(g.signSpeakModel || meta("signspeak-model") || "SLR.2.sm"),

    // Echo 1.0 arrives from Talksign; unused until their key exists.
    talksignKey: String(g.talksignKey || meta("talksign-key") || "").trim(),

    // Where the proxy lives. Netlify rewrites /api/sign/* to the function in
    // netlify/functions/sign.js, which holds the vendor key server-side. This
    // is the preferred mode: nothing sensitive ships to the browser.
    proxyBase: String(g.proxyBase || meta("proxy-base") || "/api/sign").replace(/\/+$/, ""),

    // Set false to stop the app even asking the proxy (e.g. a static preview
    // deploy where functions are not available).
    useProxy: g.useProxy !== false,

    // How long to wait for /api/sign/status before deciding there is no proxy.
    proxyProbeMs: Number(g.proxyProbeMs) || 2500,

    // ?provider=mock|signspeak — lets you demo without spending inference.
    forceProvider: param("provider") || String(g.provider || ""),

    // 8s is one or two short phrases. Longer clips cost more per request and
    // make the BLOCKING round-trip more likely to overflow into a batch.
    maxClipMs: Number(g.maxClipMs) || 8000,

    captureWidth: Number(g.captureWidth) || 1280,
    captureHeight: Number(g.captureHeight) || 720,

    // 1.2 Mbps at 720p for 8 s is about 1.2 MB of video, ~1.6 MB once base64.
    // That matters: a Netlify Function rejects anything over 6 MB, and an
    // oversized clip would fail as a confusing 413 rather than a clear error.
    videoBitsPerSecond: Number(g.videoBitsPerSecond) || 1_200_000,
  };
}

/**
 * Is a real engine configured?
 *
 * A key in the page is only one way. The proxy is checked separately and
 * asynchronously — see providers/index.js, which asks /api/sign/status before
 * deciding. This function stays synchronous so it can be used during render.
 */
export function hasLiveEngine(cfg = readConfig()) {
  return Boolean(cfg.signSpeakKey || cfg.talksignKey);
}

/**
 * Ask the proxy whether the server holds a key. Never returns the key itself.
 *
 * A static host with no functions answers 404, a preview deploy may answer
 * HTML, and a cold function may be slow — all of which mean "no proxy", not
 * "broken app". The timeout keeps a dead endpoint from delaying first paint.
 */
export async function probeProxy(cfg = readConfig()) {
  if (!cfg.useProxy || !cfg.proxyBase) return { configured: false, reason: "proxy disabled" };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), cfg.proxyProbeMs);

  try {
    const res = await fetch(`${cfg.proxyBase}/status`, {
      headers: { accept: "application/json" },
      signal: ctrl.signal,
    });

    if (!res.ok) return { configured: false, reason: `status ${res.status}` };

    const type = res.headers.get("content-type") || "";
    if (!type.includes("json")) return { configured: false, reason: "not a function" };

    const json = await res.json();
    return {
      configured: Boolean(json?.configured),
      model: json?.model,
      vendor: json?.vendor,
      note: json?.note,
      reason: json?.configured ? "server key present" : "no server key",
    };
  } catch (err) {
    return { configured: false, reason: err?.name === "AbortError" ? "timed out" : "unreachable" };
  } finally {
    clearTimeout(timer);
  }
}
