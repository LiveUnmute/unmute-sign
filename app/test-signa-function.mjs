// Contract tests for the server-side Signa token broker. No live API key or
// network access is required; mocked upstream responses keep the sandbox quota intact.

import { strict as assert } from "node:assert";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handler } = require("./netlify/functions/signa.js");

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

const event = ({ method = "GET", path = "/api/signa/status", body = null, ip = "192.0.2.10" } = {}) => ({
  httpMethod: method,
  path,
  headers: { "x-nf-client-connection-ip": ip },
  queryStringParameters: {},
  body,
  isBase64Encoded: false,
});

const previousFetch = globalThis.fetch;
const previousKey = process.env.SIGNA_KEY;

try {
  await ok("status reports configuration but never returns the key", async () => {
    process.env.SIGNA_KEY = "test-secret-do-not-return";
    const response = await handler(event());
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.equal(body.configured, true);
    assert.equal(body.vendor, "Signa AI");
    assert.equal(body.from, "en");
    assert.equal(body.to, "ase");
    assert.equal(JSON.stringify(body).includes("test-secret-do-not-return"), false);
  });

  await ok("missing key is explicit and makes no upstream request", async () => {
    delete process.env.SIGNA_KEY;
    globalThis.fetch = async () => {
      throw new Error("fetch must not be called without SIGNA_KEY");
    };
    const response = await handler(event({ method: "POST", path: "/api/signa/token", body: "{}" }));
    assert.equal(response.statusCode, 503);
    assert.match(JSON.parse(response.body).message, /SIGNA_KEY/);
  });

  await ok("mints only a short-lived client token and keeps the key private", async () => {
    process.env.SIGNA_KEY = "test-secret";
    let request = null;
    globalThis.fetch = async (url, options) => {
      request = { url: String(url), options };
      return Response.json({ token: "ct_test_only", expiresAt: "2026-12-01T12:05:00Z" });
    };

    const response = await handler(event({
      method: "POST",
      path: "/api/signa/token",
      body: "{}",
      ip: "192.0.2.11",
    }));
    const body = JSON.parse(response.body);

    assert.equal(response.statusCode, 200);
    assert.equal(body.token, "ct_test_only");
    assert.equal(body.expiresAt, "2026-12-01T12:05:00Z");
    assert.equal(JSON.stringify(body).includes("test-secret"), false);
    assert.equal(request.url, "https://api.usesigna.org/v1/api/client-tokens");
    assert.equal(request.options.headers.authorization, "Bearer test-secret");
    assert.deepEqual(JSON.parse(request.options.body), { ttlSeconds: 300 });
  });

  await ok("blocks video rendering through Netlify; the browser calls Signa directly", async () => {
    process.env.SIGNA_KEY = "test-secret";
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      throw new Error("unexpected upstream call");
    };
    const response = await handler(event({ method: "POST", path: "/api/signa/video", body: "{}", ip: "192.0.2.12" }));
    assert.equal(response.statusCode, 403);
    assert.equal(called, false);
  });

  await ok("blocks unsupported routes", async () => {
    process.env.SIGNA_KEY = "test-secret";
    const response = await handler(event({ method: "POST", path: "/api/signa/arbitrary", body: "{}", ip: "192.0.2.13" }));
    assert.equal(response.statusCode, 403);
  });
} finally {
  globalThis.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.SIGNA_KEY;
  else process.env.SIGNA_KEY = previousKey;
}

console.log(`\n${pass} passed`);
