// The app site routes /demo to the pitch page, not to the app shell.
//
// This is not a style check. A catch-all rewrite sitting above the /demo rule
// makes app.liveunmute.com/demo render the app home — a live 404 that looks
// like success. Both redirect files must agree, and /* must come last.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { strict as assert } from "node:assert";

// Resolve from this file, not from the shell's cwd — otherwise running it from
// the repo root silently tests the *other* netlify.toml.
const APP = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(join(APP, f), "utf8");

let pass = 0;
const ok = (n, f) => {
  try { f(); pass++; console.log(`PASS  ${n}`); }
  catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; }
};

const toml = read("netlify.toml");
const redirects = existsSync(join(APP, "_redirects")) ? read("_redirects") : "";

ok("netlify.toml routes /demo", () => {
  assert.match(toml, /from\s*=\s*"\/demo"/);
  assert.match(toml, /to\s*=\s*"\/demo\/index\.html"/);
});

ok("/demo is declared before the catch-all in netlify.toml", () => {
  const demoAt = toml.indexOf('from = "/demo"');
  const catchAt = toml.indexOf('from = "/*"');
  assert.ok(demoAt > -1 && catchAt > -1, "one of the rules is missing");
  assert.ok(demoAt < catchAt, "/demo is after the catch-all — it will never match");
});

ok("_redirects mirrors it", () => {
  assert.ok(redirects, "_redirects is missing");
  const demoLine = redirects.split("\n").findIndex((l) => /^\/demo\s/.test(l.trim()));
  const catchLine = redirects.split("\n").findIndex((l) => /^\/\*\s/.test(l.trim()));
  assert.ok(demoLine > -1, "/demo missing from _redirects");
  assert.ok(catchLine > -1, "catch-all missing from _redirects");
  assert.ok(demoLine < catchLine, "/demo is after the catch-all in _redirects");
});

ok("_redirects still carries every rule netlify.toml has", () => {
  for (const path of ["/app", "/tester", "/api/sign/*", "/demo", "/*"]) {
    assert.ok(
      redirects.split("\n").some((l) => l.trim().startsWith(path)),
      `${path} missing from _redirects — the two files have drifted`
    );
  }
});

ok("all demo page URLs revalidate after a deploy", () => {
  const headers = read("_headers").split(/\n(?=\/)/);
  for (const path of ["/demo", "/demo/", "/demo/index.html"]) {
    const blocks = toml.split("[[headers]]");
    const block = blocks.find((b) => b.includes(`for = "${path}"`));
    assert.ok(block, `no cache headers in netlify.toml for ${path}`);
    assert.match(block, /Cache-Control\s*=\s*"no-store, must-revalidate"/);
    const staticBlock = headers.find((b) => b.split("\n")[0] === path);
    assert.ok(staticBlock, `no cache headers in _headers for ${path}`);
    assert.match(staticBlock, /Cache-Control:\s*no-store, must-revalidate/);
  }
});

ok("the pitch page exists in the app site with the clean custom player", () => {
  assert.ok(existsSync(join(APP, "demo/index.html")), "app/demo/index.html is missing");
  const html = read("demo/index.html");
  assert.match(html, /id="watch-screen"/);
  assert.match(html, /id="toggle-play"/);
  assert.match(html, /id="seek"/);
  assert.match(html, /id="fullscreen"/);
  assert.match(html, /name="theme-color" content="#0B0D10"/i);
  assert.match(html, /--bone:\s*#0B0D10/i);
  assert.match(html, /--paper:\s*#171A20/i);
  assert.match(html, /drive\.usercontent\.google\.com\/download/);
  assert.doesNotMatch(html, /<iframe\b/i, "Drive's unstyleable controls must not be embedded");
  assert.doesNotMatch(html, /<video[^>]+\bcontrols\b/i, "mobile browser controls must not overlay the video");
});

console.log(`\n${pass} passed`);
