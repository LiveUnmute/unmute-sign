// Talksign — Palm 1.0 (sign → English) and Echo 1.0 (English → sign).
//
// ── STATUS: NOT WIRED. DO NOT SHIP THIS AS WORKING. ──────────────────────
// The shape below matches Talksign's published model capabilities, not a
// verified API contract. Their developer documentation is not public — it is
// released with key access. Every URL, field name and transport choice here is
// a placeholder to be corrected against the real docs on day one.
//
// It is written now so the interface is settled: when the key arrives, the work
// is filling in four functions, not redesigning the app.
//
// ── What the key unlocks, and what it does not ────────────────────────────
// Palm 1.0 is 84.2% semantic / 79.6% word-level accurate on general ASL.
// 84.2% means roughly one sentence in six is wrong. On a ward, "one in six"
// is not a shipping accuracy — which is why the UI in this app shows a
// confidence value, and why the clinical phrase library exists: constraining
// the decoder to 200 known terms is the difference between a demo and a tool.
//
// Echo 1.0 renders photorealistic avatars at 30 FPS with ~29 ms translation
// latency. Talksign states that specialised vocabulary — medicine, law —
// requires additional fine-tuning, and that multi-word ASL phrases are only
// partially modelled. That fine-tuning is a conversation, not a config value.
//
// ── Before you flip this on, ask Talksign for ─────────────────────────────
//   1. The API reference, and whether transport is WebSocket, WebRTC or REST.
//   2. Whether landmark extraction must happen on our client (their press
//      material says landmarks are extracted on-device and raw video is not
//      transmitted — that decision changes what we capture and what we store).
//   3. Palm 1.1's domain modules: is a medical module available, and what does
//      fine-tuning cost in data and time?
//   4. A BAA or DPA, plus retention and training-on-customer-data terms.
//   5. Rate limits and what a "session" means on the PAYG API (30 minutes).
//   6. A sandbox key, so integration is not billed against a live patient flow.

import { normaliseConfidence } from "./contract.js";

const DEFAULTS = {
  baseUrl: "https://api.talksign.co/v1", // UNVERIFIED — correct from docs
  signPath: "/palm/translate",           // UNVERIFIED
  speakPath: "/echo/render",             // UNVERIFIED
  timeoutMs: 12000,
};

export function createTalksignProvider(config = {}) {
  const cfg = { ...DEFAULTS, ...config };
  const key = cfg.apiKey;

  if (!key) {
    // Fail loudly and early. A missing key must never look like a slow network.
    throw new Error(
      "Talksign: no API key. Set it with createTalksignProvider({ apiKey }) " +
      "or window.UNMUTE_CONFIG.talksignKey."
    );
  }

  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${key}`,
  };

  async function post(path, body) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs);

    try {
      const res = await fetch(`${cfg.baseUrl}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Talksign ${res.status}: ${detail.slice(0, 200)}`);
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    name: "talksign",

    /**
     * Palm 1.0. Real implementation depends entirely on the transport:
     *
     *   WebSocket  — open a socket, push frames, resolve on the final transcript
     *                event. Lowest latency; the right answer for a ward.
     *   WebRTC     — negotiate once per conversation, stream continuously.
     *   REST       — POST a recorded clip, await a transcript. Simplest, and
     *                the worst experience: the patient has to stop signing.
     *
     * Nothing here can be finished without the docs.
     */
    async signToText({ stream, hints } = {}) {
      if (!stream) throw new Error("Talksign: no media stream supplied");

      // TODO: replace with the documented transport.
      const data = await post(cfg.signPath, {
        // Placeholder shape.
        hints: hints || [],
      });

      return {
        text: data.text ?? "",
        confidence: normaliseConfidence(data.confidence, 0),
        source: "talksign",
        // Their own accuracy figure means the UI must treat low confidence as
        // "ask the patient to repeat", never as "guess loudly".
        uncertain: normaliseConfidence(data.confidence, 0) < 0.8,
      };
    },

    /** Echo 1.0. Returns a renderable URL for the signing avatar. */
    async textToSign({ text, voice } = {}) {
      const data = await post(cfg.speakPath, { text, voice });

      return {
        videoUrl: data.video_url ?? data.url ?? "",
        durationMs: data.duration_ms ?? 0,
        source: "talksign",
      };
    },

    async healthy() {
      try {
        // TODO: the documented health or account endpoint.
        await post(cfg.signPath, { probe: true });
        return true;
      } catch {
        return false;
      }
    },
  };
}

/**
 * Build the provider from the environment, falling back to the mock.
 *
 * The key is read from, in order:
 *   1. window.UNMUTE_CONFIG.talksignKey   (set by a config.js you do not commit)
 *   2. <meta name="talksign-key">         (per-deployment config)
 *   3. nothing → mock
 *
 * It is never read from a hard-coded string, and it must never be committed.
 * A key in a public JS file is a key anyone can spend.
 */
export async function resolveProvider() {
  const { createMockProvider } = await import("./mock.js");

  const fromGlobal = globalThis.UNMUTE_CONFIG?.talksignKey;
  const fromMeta = document
    ?.querySelector?.('meta[name="talksign-key"]')
    ?.getAttribute("content");

  const key = fromGlobal || fromMeta;

  if (!key) return createMockProvider();

  try {
    return createTalksignProvider({ apiKey: key });
  } catch {
    return createMockProvider();
  }
}
