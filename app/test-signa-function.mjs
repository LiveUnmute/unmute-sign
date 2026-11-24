// Contract tests for the server-side Signa proxy. No live API key or network
// access is required; mocked upstream responses keep the sandbox quota intact.

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

const jsonBody = (value) => JSON.stringify(value);
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
    const response = await handler(event({ method: "POST", path: "/api/signa/video", body: jsonBody({ text: "Hello." }) }));
    assert.equal(response.statusCode, 503);
    assert.match(JSON.parse(response.body).message, /SIGNA_KEY/);
  });

  await ok("English text is sent as en-to-ase and MP4 bytes are returned", async () => {
    process.env.SIGNA_KEY = "test-secret";
    const requests = [];
    const sgn = Buffer.from("fake-sgn-bytes");
    const mp4 = Buffer.from([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50]);

    globalThis.fetch = async (url, options) => {
      requests.push({ url: String(url), options });
      if (String(url) === "https://api.usesigna.org/v1/sign") {
        return new Response(sgn, {
          status: 200,
          headers: { "content-type": "application/vnd.signa.sgn", "content-length": String(sgn.length) },
        });
      }
      if (String(url) === "https://api.usesigna.org/v1/sign/video") {
        return new Response(mp4, {
          status: 200,
          headers: { "content-type": "video/mp4", "content-length": String(mp4.length) },
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    };

    const response = await handler(event({
      method: "POST",
      path: "/api/signa/video",
      body: jsonBody({ text: "Where does it hurt?" }),
      ip: "192.0.2.11",
    }));

    assert.equal(response.statusCode, 200);
    assert.equal(response.isBase64Encoded, true);
    assert.equal(response.headers["content-type"], "video/mp4");
    assert.deepEqual(Buffer.from(response.body, "base64"), mp4);
    assert.equal(requests.length, 2);

    const signRequest = requests[0];
    assert.equal(signRequest.options.headers.authorization, "Bearer test-secret");
    assert.deepEqual(JSON.parse(signRequest.options.body), {
      text: "Where does it hurt?",
      from: "en",
      to: "ase",
    });
    assert.equal(requests[1].options.headers.authorization, "Bearer test-secret");
    assert.equal(requests[1].options.headers["content-type"], "application/octet-stream");
    assert.deepEqual(Buffer.from(requests[1].options.body), sgn);
  });

  await ok("empty and overlong text are rejected before contacting Signa", async () => {
    process.env.SIGNA_KEY = "test-secret";
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      throw new Error("unexpected request");
    };

    const empty = await handler(event({ method: "POST", path: "/api/signa/video", body: jsonBody({ text: "   " }), ip: "192.0.2.12" }));
    assert.equal(empty.statusCode, 400);
    const long = await handler(event({ method: "POST", path: "/api/signa/video", body: jsonBody({ text: "x".repeat(301) }), ip: "192.0.2.13" }));
    assert.equal(long.statusCode, 413);
    assert.equal(called, false);
  });

  await ok("unsupported routes are blocked", async () => {
    process.env.SIGNA_KEY = "test-secret";
    const response = await handler(event({ method: "POST", path: "/api/signa/arbitrary", body: "{}", ip: "192.0.2.14" }));
    assert.equal(response.statusCode, 403);
  });
} finally {
  globalThis.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.SIGNA_KEY;
  else process.env.SIGNA_KEY = previousKey;
}

console.log(`\n${pass} passed`);
