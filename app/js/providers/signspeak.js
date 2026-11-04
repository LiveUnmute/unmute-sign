// Sign-Speak — ASL recognition (sign → English) and ASL production
// (English → signing avatar).
//
// ── What is verified, and what is not ────────────────────────────────────
// VERIFIED, from their own docs and SDK README:
//   · POST https://api.sign-speak.com/recognizeASL  { payload: "<base64 video>" }
//   · POST https://api.sign-speak.com/produceASL    { english: "…" }
//   · Request classes BLOCKING / BATCH; BLOCKING holds the connection 30s and
//     downgrades to a 202 + request_id if it overruns.
//   · SDK fields: request_class, model, hint, single_recognition_mode.
//   · Recognition returns prediction[] entries carrying { prediction,
//     confidence }, where confidence is a LOG probability — their own example
//     filters with `confidence > Math.log(0.5)`. We convert with exp().
//   · Billing is per second of input, free during the trial, then a monthly
//     minute quota. PUBLIC keys do inference only and are the ones safe to
//     ship in a browser.
//
// NOT VERIFIED — their doc site renders client-side, so the endpoint pages
// would not load as text. The two uncertain items are isolated as constants in
// ENDPOINTS below so correcting them is a one-line edit, not a refactor:
//   1. The batch-retrieval path and its query parameter name.
//   2. Whether `payload` wants bare base64 or a data URI (see payloadFormat).
//
// ── The privacy fact this file must not hide ─────────────────────────────
// Recognition takes VIDEO. The patient's hands and face are transmitted to
// Sign-Speak to be read. There is no landmark-only endpoint, so the "raw video
// never leaves the device" property that Palm 1.0 promised does not exist on
// this path. The UI states this before capture; this module does not soften it.

import { normaliseConfidence } from "./contract.js";

/** Correct these against the real spec the day the key arrives. */
const ENDPOINTS = {
  recognize: "/recognizeASL",
  produce: "/produceASL",
  // UNVERIFIED: batch results are described as a GET carrying a request_id.
  batchGet: "/recognizeASL", // ?request_id=…
  batchGetParam: "request_id",
};

const DEFAULTS = {
  baseUrl: "https://api.sign-speak.com",
  model: "SLR.2.sm",
  // "log" per their documented filter at Math.log(0.5). See toProbability.
  confidenceScale: "log",
  payloadFormat: "bare", // "bare" | "dataUri"
  // BLOCKING can legitimately hold 30s, so we must outwait it rather than
  // aborting into a confusing client timeout.
  timeoutMs: 35000,
  pollMs: 1200,
  pollTimeoutMs: 45000,
  // Below this probability the UI must ask the patient to repeat rather than
  // present a guess as fact. Sign-Speak's own example treats 0.5 as the floor.
  lowConfidence: 0.5,
};

/**
 * Confidence → 0–1, with the encoding stated rather than guessed.
 *
 * Sign-Speak reports log probabilities — their own example filters on
 * `confidence > Math.log(0.5)`. Guessing per-value is a trap: a log probability
 * of exactly 0 means certainty (p = 1), while a unit confidence of 0 means no
 * confidence at all. Same number, opposite meaning. So the scale is configuration:
 *
 *   "log"  — exp(value)             Sign-Speak's documented encoding
 *   "unit" — value already 0–1      if they ever change it
 *   "auto" — the old heuristic, kept only for inspection
 */
export function toProbability(value, scale = "log") {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;

  if (scale === "unit") return normaliseConfidence(value, 0);
  if (scale === "log") return Math.max(0, Math.min(1, Math.exp(value)));

  if (value <= 0) return Math.exp(value);
  return normaliseConfidence(value, 0);
}

/** Dig a prediction array out of whichever envelope came back. */
function extractPrediction(payload) {
  if (!payload || typeof payload !== "object") return null;

  const candidates = [
    payload.prediction,
    payload.predictions,
    payload.data?.prediction,
    payload.data?.predictions,
    payload.result?.prediction,
    payload.result?.predictions,
    payload.data?.result?.prediction,
    payload.request?.result?.prediction,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    if (typeof c === "string") return [c];
  }
  return null;
}

/** Normalise one entry into { word, p }. */
function readEntry(entry, scale) {
  if (typeof entry === "string") return { word: entry, p: NaN };

  const word =
    entry?.prediction ?? entry?.text ?? entry?.word ?? entry?.token ?? entry?.label ?? "";
  const raw = entry?.confidence ?? entry?.score ?? entry?.probability ?? entry?.logprob;

  return { word: String(word), p: toProbability(raw, scale) };
}

export function createSignSpeakProvider(config = {}) {
  const cfg = { ...DEFAULTS, ...config };
  const key = cfg.apiKey;

  if (!key) {
    throw new Error(
      "Sign-Speak: no API key. Set window.UNMUTE_CONFIG.signSpeakKey, or a " +
        '<meta name="signspeak-key"> tag. Use a PUBLIC key — never a private one.'
    );
  }

  const headers = {
    "content-type": "application/json",
    authorization: key,
  };

  async function request(method, path, body, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs ?? cfg.timeoutMs);

    try {
      const res = await fetch(`${cfg.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });

      const text = await res.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      // 202 is not a failure — it is "this became a batch job".
      if (res.status === 202) {
        return { status: 202, json, text };
      }

      if (!res.ok) {
        const detail = (json?.error || json?.message || text || "").slice(0, 240);
        throw new Error(`Sign-Speak ${res.status}: ${detail || "no detail"}`);
      }

      return { status: res.status, json, text };
    } finally {
      clearTimeout(timer);
    }
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /** Poll a batch job until it reports a result or we give up. */
  async function pollBatch(requestId) {
    const deadline = Date.now() + cfg.pollTimeoutMs;

    while (Date.now() < deadline) {
      await sleep(cfg.pollMs);

      const q = `${ENDPOINTS.batchGet}?${ENDPOINTS.batchGetParam}=${encodeURIComponent(requestId)}`;

      let res;
      try {
        res = await request("GET", q, null, 15000);
      } catch {
        continue; // a transient poll failure must not kill the job
      }

      const body = res.json;
      if (body?.status === "pending" || body?.status === "processing" || body?.pending === true) {
        continue;
      }
      return body;
    }

    throw new Error("Sign-Speak: the batch job did not finish in time.");
  }

  /** Handles the 200-or-202 dance in one place. */
  async function submit(path, body) {
    const first = await request("POST", path, body);

    if (first.status !== 202) return first.json;

    const requestId =
      first.json?.request_id ?? first.json?.requestId ?? first.json?.batch_id ?? first.json?.id;

    if (!requestId) {
      throw new Error("Sign-Speak: batch downgrade without a request id.");
    }

    return await pollBatch(requestId);
  }

  return {
    name: "signspeak",
    vendor: "Sign-Speak",

    /**
     * Sign → English.
     *
     * @param {{ blob?: Blob, base64?: string, hints?: string[], singleRecognition?: boolean }} opts
     * @returns {Promise<{text:string, confidence:number, source:string, uncertain:boolean, words:Array}>}
     */
    async signToText({ blob, base64, hints, singleRecognition = true } = {}) {
      let payload = base64;

      if (!payload) {
        if (!blob) throw new Error("Sign-Speak: no video supplied.");
        const { blobToBase64 } = await import("../capture.js");
        payload = await blobToBase64(blob);
      }

      const body = {
        payload: cfg.payloadFormat === "dataUri" ? `data:video/webm;base64,${payload}` : payload,
        request_class: "BLOCKING",
        model: cfg.model,
        single_recognition_mode: Boolean(singleRecognition),
      };

      // `hint` is a string in their SDK. Pass the phrase most likely on this
      // ward — it biases the decoder toward clinical vocabulary, which is the
      // whole reason our corpus matters.
      if (hints?.length) body.hint = hints[hints.length - 1];

      const json = await submit(ENDPOINTS.recognize, body);
      const entries = extractPrediction(json);

      if (!entries) {
        throw new Error("Sign-Speak: the response contained no prediction.");
      }

      const words = entries.map((e) => readEntry(e, cfg.confidenceScale)).filter((w) => w.word);

      // Keep words above the floor; if that removes everything, keep the best
      // single candidate so the clinician sees something rather than nothing —
      // flagged as uncertain, never presented as certain.
      let kept = words.filter((w) => !Number.isNaN(w.p) && w.p >= cfg.lowConfidence);
      if (!kept.length && words.length) {
        kept = [words.reduce((a, b) => (b.p > a.p ? b : a), words[0])];
      }

      const scored = kept.filter((w) => !Number.isNaN(w.p));
      const confidence = scored.length
        ? scored.reduce((sum, w) => sum + w.p, 0) / scored.length
        : 0;

      return {
        text: kept.map((w) => w.word).join(" ").replace(/\s+/g, " ").trim(),
        confidence: normaliseConfidence(confidence, 0),
        source: "signspeak",
        uncertain: confidence < 0.8,
        words: kept,
      };
    },

    /**
     * English → signing avatar.
     *
     * Returns a URL the caller can render. If Sign-Speak hands back base64
     * instead of a URL, it is turned into a blob URL here so the UI stays
     * ignorant of the difference.
     */
    async textToSign({ text, model = "MALE" } = {}) {
      if (!text) throw new Error("Sign-Speak: nothing to sign.");

      const json = await submit(ENDPOINTS.produce, {
        english: text,
        request_class: "BATCH",
        model,
      });

      const url =
        json?.video_url ??
        json?.url ??
        json?.video ??
        json?.signed_video_url ??
        json?.data?.video_url ??
        json?.data?.url ??
        "";

      if (url) {
        return {
          videoUrl: /^https?:|^blob:|^data:/.test(url) ? url : `${cfg.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`,
          durationMs: Number(json?.duration_ms ?? json?.duration ?? 0) || 0,
          source: "signspeak",
        };
      }

      const b64 = json?.video_base64 ?? json?.data?.video_base64 ?? json?.payload;
      if (typeof b64 === "string" && b64.length > 64) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
        return {
          videoUrl: URL.createObjectURL(new Blob([bytes], { type: "video/mp4" })),
          durationMs: 0,
          source: "signspeak",
        };
      }

      throw new Error("Sign-Speak: no video in the production response.");
    },

    /**
     * Cheap, non-billing readiness check. Called before a conversation starts
     * so a dead key surfaces at sign-in rather than mid-sentence.
     */
    async healthy() {
      return Boolean(key);
    },

    /** Spends inference. Only call it from Settings, never from the ward. */
    async verify() {
      try {
        await this.signToText({ base64: "AAAAIGZ0eXBpc29tAAACAGlzb21pc28y", hints: [] });
        return true;
      } catch (err) {
        // A 4xx here still proves the key reached them; a 401/403 does not.
        return !/401|403|unauthor/i.test(String(err?.message || ""));
      }
    },

    /** Exposed so the UI can name the vendor without importing constants. */
    get meta() {
      return { vendor: "Sign-Speak", model: cfg.model, baseUrl: cfg.baseUrl };
    },
  };
}
