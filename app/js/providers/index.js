// Which engine the app talks to.
//
// One place decides, and the rest of the app never asks which vendor answered.
// Resolution order:
//
//   1. ?provider=mock          — force the scripted demo (Demo Day safety)
//   2. a Sign-Speak key        — sign→English live, English→sign live
//   3. a Talksign key          — Echo 1.0 for English→sign (when it ships)
//   4. nothing                 — scripted mock, clearly labelled in the UI
//
// Both real providers are loaded dynamically, so a deployment with no key never
// downloads integration code it cannot use.

import { readConfig } from "../config.js";
import { createMockProvider } from "./mock.js";

let cached = null;

export async function resolveProvider(cfg = readConfig()) {
  if (cfg.forceProvider === "mock") {
    return { provider: createMockProvider(), reason: "forced by ?provider=mock" };
  }

  if (cfg.signSpeakKey) {
    const { createSignSpeakProvider } = await import("./signspeak.js");
    try {
      const provider = createSignSpeakProvider({
        apiKey: cfg.signSpeakKey,
        baseUrl: cfg.signSpeakBase,
        model: cfg.signSpeakModel,
      });
      return { provider, reason: "Sign-Speak key present" };
    } catch (err) {
      console.warn("[unmute] Sign-Speak unusable, falling back:", err?.message);
    }
  }

  if (cfg.talksignKey) {
    const { createTalksignProvider } = await import("./talksign.js");
    try {
      const provider = createTalksignProvider({ apiKey: cfg.talksignKey });
      return { provider, reason: "Talksign key present" };
    } catch (err) {
      console.warn("[unmute] Talksign unusable, falling back:", err?.message);
    }
  }

  return {
    provider: createMockProvider(),
    reason: "no engine key configured — scripted demo",
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
