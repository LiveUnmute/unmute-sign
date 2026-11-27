#!/usr/bin/env node
// Static server for the app screens. No framework, no build step.
// Binds 0.0.0.0 so the preview proxy can reach it.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const signaFunction = require("./netlify/functions/signa.js");
const ROOT = new URL(".", import.meta.url).pathname;
const PORT = Number(process.env.PORT || 8083);
const HOST = "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function readLimited(req, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error("Request body too large");
      error.code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/signa" || url.pathname.startsWith("/api/signa/")) {
      let requestBody = "";
      try {
        requestBody = await readLimited(req, 10_000);
      } catch (error) {
        const tooLarge = error?.code === "PAYLOAD_TOO_LARGE";
        res.writeHead(tooLarge ? 413 : 400, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: tooLarge ? "payload_too_large" : "invalid_request", message: error.message }));
        return;
      }

      const headers = Object.fromEntries(
        Object.entries(req.headers).map(([key, value]) => [key.toLowerCase(), Array.isArray(value) ? value.join(",") : value])
      );
      headers["x-nf-client-connection-ip"] ||= req.socket.remoteAddress || "unknown";

      try {
        const result = await signaFunction.handler({
          httpMethod: req.method,
          path: url.pathname,
          headers,
          queryStringParameters: Object.fromEntries(url.searchParams.entries()),
          body: requestBody || null,
          isBase64Encoded: false,
        });
        res.writeHead(result.statusCode || 500, result.headers || {});
        res.end(result.isBase64Encoded ? Buffer.from(result.body || "", "base64") : result.body || "");
      } catch (error) {
        res.writeHead(502, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        res.end(JSON.stringify({ error: "local_function_failed", message: String(error?.message || error).slice(0, 160) }));
      }
      return;
    }

    let path = decodeURIComponent(url.pathname);
    if (path === "/") path = "/index.html";

    const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
    const file = join(ROOT, safe);

    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    const info = await stat(file);
    const target = info.isDirectory() ? join(file, "index.html") : file;
    const body = await readFile(target);

    res.writeHead(200, {
      "content-type": MIME[extname(target).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(PORT, HOST, () => {
  console.log(`app screens on http://${HOST}:${PORT}`);
});
