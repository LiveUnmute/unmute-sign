// Which engine the app talks to.
//
// One place decides, and the rest of the app never asks which vendor answered.
// Resolution order:
//
//   1. ?provider=mock          — force the scripted demo (Demo Day safety)
//   2. ?provider=direct        — skip the proxy, use a key in the page
//   3. the proxy               — /api/sign/status says the server holds a key
//   4. a Sign-Speak key        — direct from the browser (key is public-only)
//   5. a Talksign key          — Echo 1.0 for English→sign, when it ships
//   6. nothing                 — scripted mock, clearly labelled in the UI
//
// The proxy is preferred over a key in the page because a bundle served to the
// public is public. If both exist, the proxy wins.

import { readConfig, probeProxy } from "../config.js";
import { createMockProvider } from "./mock.js";

let cached = null;

export async function resolveProvider(cfg = readConfig()) {
  if (cfg.forceProvider === "mock") {
    return { provider: createMockProvider(), reason: "forced by ?provider=mock", mode: "mock" };
  }

  const forcedDirect = cfg.forceProvider === "direct";

  // ── 1. the proxy ───────────────────────────────────────────────────────
  if (!forcedDirect) {
    const status = await probeProxy(cfg);

    if (status.configured) {
      const { createSignSpeakProvider } = await import("./signspeak.js");
      try {
        const provider = createSignSpeakProvider({
          proxy: true,
          baseUrl: cfg.proxyBase,
          model: status.model || cfg.signSpeakModel,
        });
        return {
          provider,
          reason: `proxy (${status.reason})`,
          mode: "proxy",
        };
      } catch (err) {
        console.warn("[unmute] proxy provider failed to build:", err?.message);
      }
    }
  }

  // ── 2. a key in the page ───────────────────────────────────────────────
  if (cfg.signSpeakKey) {
    const { createSignSpeakProvider } = await import("./signspeak.js");
    try {
      const provider = createSignSpeakProvider({
        apiKey: cfg.signSpeakKey,
        baseUrl: cfg.signSpeakBase,
        model: cfg.signSpeakModel,
      });
      return { provider, reason: "Sign-Speak key in the page", mode: "direct" };
    } catch (err) {
      console.warn("[unmute] Sign-Speak key unusable, falling back:", err?.message);
    }
  }

  // ── 3. Talksign, when Echo 1.0 arrives ─────────────────────────────────
  if (cfg.talksignKey) {
    const { createTalksignProvider } = await import("./talksign.js");
    try {
      const provider = createTalksignProvider({ apiKey: cfg.talksignKey });
      return { provider, reason: "Talksign key present", mode: "direct" };
    } catch (err) {
      console.warn("[unmute] Talksign unusable, falling back:", err?.message);
    }
  }

  // ── 4. nothing ─────────────────────────────────────────────────────────
  return {
    provider: createMockProvider(),
    reason: "no engine key configured — scripted demo",
    mode: "mock",
  };
}

/** Resolve once per page load, then reuse. */
export function getProvider(cfg = readConfig()) {
  if (!cached) cached = resolveProvider(cfg);
  return cached;
}

export function resetProvider() {
  cached = null;
}
