// Minimal static server for the demo.
// No origin restrictions — it serves files and nothing else.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname;
const PORT = Number(process.env.PORT || 8080);
const HOST = "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".task": "application/octet-stream",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let path = decodeURIComponent(url.pathname);
    if (path === "/") path = "/index.html";

    const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
    const file = join(ROOT, safe);

    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    const info = await stat(file);
    if (info.isDirectory()) {
      res.writeHead(404).end("Not found");
      return;
    }

    const body = await readFile(file);

    res.writeHead(200, {
      "Content-Type": MIME[extname(file)] || "application/octet-stream",
      "Content-Length": body.length,
      // The WASM is large and never changes for a given version, so cache it.
      // Everything else must revalidate, or a fix can appear to do nothing.
      "Cache-Control": extname(file) === ".wasm" ? "public, max-age=86400" : "no-store, must-revalidate",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Unmute demo running on http://${HOST}:${PORT}`);
});
