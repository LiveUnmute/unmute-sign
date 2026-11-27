// Browser provider contract tests. The token broker and Signa endpoints are
// mocked so no API key is exposed and no sandbox video quota is consumed.

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
  await ok("uses a short-lived token, signs en→ase, and receives MP4 directly", async () => {
    const sgn = Buffer.from("fake-sgn-bytes");
    const mp4 = new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50]);
    const requests = [];

    globalThis.fetch = async (url, options = {}) => {
      requests.push({ url: String(url), options });
      if (String(url) === "/api/signa/token") {
        return Response.json({ token: "ct_test_only", expiresAt: new Date(Date.now() + 300_000).toISOString() });
      }
      if (String(url) === "https://api.usesigna.org/v1/sign") {
        return new Response(sgn, { status: 200, headers: { "content-type": "application/vnd.signa.sgn" } });
      }
      if (String(url) === "https://api.usesigna.org/v1/sign/video") {
        return new Response(new Blob([mp4], { type: "video/mp4" }), {
          status: 200,
          headers: { "content-type": "video/mp4" },
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    };

    const provider = createSignaProvider({ baseUrl: "/api/signa" });
    await provider.warm();
    const result = await provider.textToSign({ text: "Where does it hurt?" });

    assert.equal(requests.filter((r) => r.url === "/api/signa/token").length, 1);
    assert.deepEqual(JSON.parse(requests[1].options.body), {
      text: "Where does it hurt?",
      from: "en",
      to: "ase",
    });
    assert.equal(requests[1].options.headers.authorization, "Bearer ct_test_only");
    assert.equal(requests[2].options.headers.authorization, "Bearer ct_test_only");
    assert.equal(requests[2].options.headers["content-type"], "application/octet-stream");
    assert.deepEqual(Buffer.from(requests[2].options.body), sgn);
    assert.equal(result.source, "signa");
    assert.match(result.videoUrl, /^blob:/);
    URL.revokeObjectURL(result.videoUrl);
  });

  await ok("does not accept blank or overlong text", async () => {
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

  await ok("reports the Signa stage and 504 instead of converting it to a local timeout", async () => {
    globalThis.fetch = async (url) => {
      if (String(url) === "/api/signa/token") return Response.json({ token: "ct_test_only" });
      if (String(url) === "https://api.usesigna.org/v1/sign") {
        return Response.json({ message: "render queue unavailable" }, { status: 504 });
      }
      throw new Error(`Unexpected URL ${url}`);
    };
    const provider = createSignaProvider();
    await assert.rejects(
      provider.textToSign({ text: "Hi" }),
      /Signa sign 504: render queue unavailable/
    );
  });

  await ok("clearly rejects patient sign-recognition calls", async () => {
    const provider = createSignaProvider();
    await assert.rejects(provider.signToText(), /does not recognise patient signing/i);
  });
} finally {
  globalThis.fetch = previousFetch;
}

console.log(`\n${pass} passed`);
