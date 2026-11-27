// The two directions have separate providers. This guards against Signa's
// signing avatar being mistaken for patient-sign recognition.

import { strict as assert } from "node:assert";
import { readConfig } from "./js/config.js";
import { resolveProvider } from "./js/providers/index.js";

let pass = 0;
const ok = async (name, run) => {
  try {
    await run();
    pass += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}  — ${error?.stack || error}`);
    process.exitCode = 1;
  }
};

const previousFetch = globalThis.fetch;
try {
  await ok("Signa-only configuration activates only English-to-ASL output", async () => {
    globalThis.fetch = async (url) => {
      if (String(url) === "/api/signa/status") {
        return Response.json({ configured: true, vendor: "Signa AI", from: "en", to: "ase" });
      }
      if (String(url) === "/api/sign/status") {
        return Response.json({ configured: false, vendor: "Sign-Speak" });
      }
      if (String(url) === "/api/signa/token") {
        return Response.json({ token: "ct_composition_test", expiresAt: new Date(Date.now() + 300_000).toISOString() });
      }
      if (String(url) === "https://api.usesigna.org/v1/sign") {
        return new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { "content-type": "application/vnd.signa.sgn" },
        });
      }
      if (String(url) === "https://api.usesigna.org/v1/sign/video") {
        return new Response(new Blob([new Uint8Array([4, 5, 6])], { type: "video/mp4" }), {
          status: 200,
          headers: { "content-type": "video/mp4" },
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    };

    const cfg = {
      ...readConfig(),
      forceProvider: "",
      useProxy: true,
      proxyBase: "/api/sign",
      signaProxyBase: "/api/signa",
      proxyProbeMs: 500,
      signSpeakKey: "",
      talksignKey: "",
    };
    const { provider, mode } = await resolveProvider(cfg);

    assert.equal(mode, "partial");
    assert.equal(provider.capabilities.signToText.live, false);
    assert.equal(provider.capabilities.signToText.provider, "mock");
    assert.equal(provider.capabilities.textToSign.live, true);
    assert.equal(provider.capabilities.textToSign.vendor, "Signa AI");

    const recognized = await provider.signToText({ hints: ["My chest hurts."] });
    assert.equal(recognized.source, "mock");

    const signed = await provider.textToSign({ text: "Where does it hurt?" });
    assert.equal(signed.source, "signa");
    assert.match(signed.videoUrl, /^blob:/);
    URL.revokeObjectURL(signed.videoUrl);
  });

  await ok("forced mock mode never probes either vendor", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      throw new Error("vendor probe should be skipped");
    };
    const { provider, mode } = await resolveProvider({ ...readConfig(), forceProvider: "mock" });
    assert.equal(mode, "mock");
    assert.equal(provider.capabilities.signToText.live, false);
    assert.equal(provider.capabilities.textToSign.live, false);
    assert.equal(called, false);
  });
} finally {
  globalThis.fetch = previousFetch;
}

console.log(`\n${pass} passed`);
