// Tiny static server for the pitch deck.
//
// The deck is a single HTML file with no build step, so this only needs to
// serve it and its assets. Deliberately no caching, same as the landing page
// server: a stale preview has cost us time before.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname;
const PORT = Number(process.env.PORT || 8082);
const HOST = "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let path = decodeURIComponent(url.pathname);
    if (path === "/") path = "/index.html";

    const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
    const file = join(ROOT, safe);

    if (!file.startsWith(ROOT)) {
      res.writeHead(403, { "Cache-Control": "no-store" }).end("Forbidden");
      return;
    }

    const info = await stat(file);
    if (info.isDirectory()) {
      res.writeHead(404, { "Cache-Control": "no-store" }).end("Not found");
      return;
    }

    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": MIME[extname(file)] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Cache-Control": "no-store" }).end("Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Unmute pitch deck on http://${HOST}:${PORT}`);
});
