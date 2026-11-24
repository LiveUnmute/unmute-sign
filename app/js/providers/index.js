// Resolve one provider per direction. Signa supplies English → ASL avatar
// output; patient sign → English remains a separate recognition capability.
//
// Resolution order:
//   1. ?provider=mock  — force the fully scripted demo
//   2. Sign-Speak      — preferred sign recognition; also a fallback signer
//   3. Signa           — preferred signer when its server key is configured
//   4. Talksign        — legacy fallback, if configured
//   5. mock            — always works and is labelled as a demo
//
// The returned provider is a small directional composite. A live output engine
// never makes the patient-recognition direction look live by association.

import { readConfig, probeProxy, probeSigna } from "../config.js";
import { createMockProvider } from "./mock.js";

let cached = null;

function isLiveProvider(provider) {
  return Boolean(provider && provider.name !== "mock");
}

function capability(provider) {
  return {
    live: isLiveProvider(provider),
    provider: provider?.name || "none",
    vendor: provider?.vendor || null,
  };
}

/** Combine independent incoming and outgoing engines without conflating them. */
export function combineProviders(signToTextProvider, textToSignProvider) {
  const incoming = signToTextProvider;
  const outgoing = textToSignProvider;
  const same = incoming === outgoing;

  return {
    name: same ? incoming.name : "hybrid",
    vendor: same ? incoming.vendor || null : null,
    capabilities: {
      signToText: capability(incoming),
      textToSign: capability(outgoing),
    },
    signToText: (options) => incoming.signToText(options),
    textToSign: (options) => outgoing.textToSign(options),
    async warm() {
      return typeof outgoing.warm === "function" ? outgoing.warm() : true;
    },
    async healthy() {
      const providers = [...new Set([incoming, outgoing])].filter((p) => isLiveProvider(p));
      const results = await Promise.all(
        providers.map((p) => (typeof p.healthy === "function" ? p.healthy() : true))
      );
      return results.every(Boolean);
    },
  };
}

export async function resolveProvider(cfg = readConfig()) {
  const mock = createMockProvider();
  if (cfg.forceProvider === "mock") {
    return { provider: combineProviders(mock, mock), reason: "forced by ?provider=mock", mode: "mock" };
  }

  const forcedDirect = cfg.forceProvider === "direct";
  const forceSignaOutput = cfg.forceProvider === "signa";
  const forceSignSpeakOutput = cfg.forceProvider === "signspeak";

  // Ask both server-side proxies in parallel, so one slow cold start does not
  // serially delay the other direction. Neither endpoint returns a key.
  const [signaStatus, signSpeakStatus] = await Promise.all([
    probeSigna(cfg),
    forcedDirect ? Promise.resolve({ configured: false, reason: "direct mode" }) : probeProxy(cfg),
  ]);

  let signSpeakProvider = null;

  if (signSpeakStatus.configured) {
    const { createSignSpeakProvider } = await import("./signspeak.js");
    try {
      signSpeakProvider = createSignSpeakProvider({
        proxy: true,
        baseUrl: cfg.proxyBase,
        model: signSpeakStatus.model || cfg.signSpeakModel,
      });
    } catch (error) {
      console.warn("[unmute] Sign-Speak proxy provider failed to build:", error?.message);
    }
  }

  // A browser key is only supported for Sign-Speak's inference-only PUBLIC key.
  if (!signSpeakProvider && cfg.signSpeakKey) {
    const { createSignSpeakProvider } = await import("./signspeak.js");
    try {
      signSpeakProvider = createSignSpeakProvider({
        apiKey: cfg.signSpeakKey,
        baseUrl: cfg.signSpeakBase,
        model: cfg.signSpeakModel,
      });
    } catch (error) {
      console.warn("[unmute] Sign-Speak key unusable, falling back:", error?.message);
    }
  }

  let talksignProvider = null;
  if (!signSpeakProvider && cfg.talksignKey) {
    const { createTalksignProvider } = await import("./talksign.js");
    try {
      talksignProvider = createTalksignProvider({ apiKey: cfg.talksignKey });
    } catch (error) {
      console.warn("[unmute] Talksign unusable, falling back:", error?.message);
    }
  }

  let signaProvider = null;
  if (signaStatus.configured) {
    const { createSignaProvider } = await import("./signa.js");
    try {
      signaProvider = createSignaProvider({ baseUrl: cfg.signaProxyBase });
    } catch (error) {
      console.warn("[unmute] Signa provider failed to build:", error?.message);
    }
  }

  // Inbound recognition is never inferred from Signa's avatar output.
  const signToTextProvider = signSpeakProvider || talksignProvider || mock;

  // Signa is the first ASL-output path for this pilot. Sign-Speak's own output
  // remains available as a fallback, but can be explicitly selected for a
  // comparison with ?provider=signspeak.
  const textToSignProvider = forceSignSpeakOutput
    ? signSpeakProvider || talksignProvider || mock
    : forceSignaOutput
    ? signaProvider || mock
    : signaProvider || signSpeakProvider || talksignProvider || mock;

  const provider = combineProviders(signToTextProvider, textToSignProvider);
  const reason =
    `sign→text: ${provider.capabilities.signToText.vendor || provider.capabilities.signToText.provider}; ` +
    `text→sign: ${provider.capabilities.textToSign.vendor || provider.capabilities.textToSign.provider}`;

  const mode =
    provider.capabilities.signToText.live && provider.capabilities.textToSign.live
      ? "live"
      : provider.capabilities.signToText.live || provider.capabilities.textToSign.live
      ? "partial"
      : "mock";

  return { provider, reason, mode, signaStatus, signSpeakStatus };
}

/** Resolve once per page load, then reuse. */
export function getProvider(cfg = readConfig()) {
  if (!cached) cached = resolveProvider(cfg);
  return cached;
}

export function resetProvider() {
  cached = null;
}
