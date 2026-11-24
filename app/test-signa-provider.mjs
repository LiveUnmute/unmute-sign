// Browser provider contract tests. The fake fetch returns a small MP4 and
// asserts that the provider only uses Unmute's same-origin proxy.

import { strict as assert } from "node:assert";
import { createSignaProvider } from "./js/providers/signa.js";

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
  await ok("signs English text through the same-origin proxy and returns a video URL", async () => {
    const mp4 = new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50]);
    let calledUrl = "";
    let postedBody = "";

    globalThis.fetch = async (url, options) => {
      calledUrl = String(url);
      postedBody = options.body;
      return new Response(new Blob([mp4], { type: "video/mp4" }), {
        status: 200,
        headers: { "content-type": "video/mp4" },
      });
    };

    const provider = createSignaProvider({ baseUrl: "/api/signa" });
    const result = await provider.textToSign({ text: "Where does it hurt?" });

    assert.equal(calledUrl, "/api/signa/video");
    assert.deepEqual(JSON.parse(postedBody), { text: "Where does it hurt?" });
    assert.equal(result.source, "signa");
    assert.equal(result.durationMs, 0);
    assert.match(result.videoUrl, /^blob:/);
    URL.revokeObjectURL(result.videoUrl);
  });

  await ok("does not accept blank text or long multi-sentence payloads", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      throw new Error("unexpected request");
    };
    const provider = createSignaProvider();
    await assert.rejects(provider.textToSign({ text: "   " }), /enter text/i);
    await assert.rejects(provider.textToSign({ text: "x".repeat(301) }), /300 characters/i);
    assert.equal(called, false);
  });

  await ok("clearly rejects patient sign-recognition calls", async () => {
    const provider = createSignaProvider();
    await assert.rejects(provider.signToText(), /does not recognise patient signing/i);
  });
} finally {
  globalThis.fetch = previousFetch;
}

console.log(`\n${pass} passed`);
