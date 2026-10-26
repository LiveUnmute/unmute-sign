// Static server for the landing page.
//
// Deliberately does NOT send validators or ETags, and marks everything no-store.
// Python's http.server answers with 304 Not Modified, which makes a deployed fix
// look like it never shipped — that is what left a stale preview on screen.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname;
const PORT = Number(process.env.PORT || 8081);
const HOST = "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let path = decodeURIComponent(url.pathname);
    if (path === "/") path = "/index.html";

    const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
    let file = join(ROOT, safe);

    if (!file.startsWith(ROOT)) {
      res.writeHead(403, { "Cache-Control": "no-store" }).end("Forbidden");
      return;
    }

    // Pretty URLs: Netlify serves /loi for loi.html, so local development
    // should too, or a link that works in production 404s here.
    if (!extname(file)) {
      const html = `${file}.html`;
      try {
        await stat(html);
        file = html;
      } catch {
        /* fall through to the 404 below */
      }
    }

    const info = await stat(file);
    if (info.isDirectory()) {
      res.writeHead(404, { "Cache-Control": "no-store" }).end("Not found");
      return;
    }

    const body = await readFile(file);
    const ext = extname(file);

    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      // Never send ETag / Last-Modified, so no 304 can be produced.
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Cache-Control": "no-store" }).end("Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Unmute landing page on http://${HOST}:${PORT}`);
});
