// The pitch page at /demo on the app site.
//
// Two things can break it and neither is visible in a browser until it is too
// late: the build forgets to copy it (so the URL 404s), or the embedded file id
// drifts from the fallback link (so the player is blank and the escape hatch
// goes somewhere else).

import { readFileSync, existsSync } from "node:fs";
import { strict as assert } from "node:assert";
import { JSDOM } from "jsdom";

const SRC = "./pitch/index.html";
const VIDEO_ID = "1Ic4Yhtm3QB1zh2N7ogCVkuc-MVNdOJNK";

let pass = 0;
const ok = (n, f) => {
  try { f(); pass++; console.log(`PASS  ${n}`); }
  catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; }
};

const html = readFileSync(SRC, "utf8");
const dom = new JSDOM(html, { url: "http://localhost/demo/" });
const { document } = dom.window;

ok("the page source exists where the build expects it", () => {
  assert.ok(existsSync(SRC));
});

ok("build.mjs copies pitch/ to dist/demo/", () => {
  const build = readFileSync("./build.mjs", "utf8");
  assert.match(build, /COPY_RENAMED\s*=\s*\[\s*\[\s*"pitch"\s*,\s*"demo"\s*\]\s*\]/);
});

ok("the player embeds the pitch video", () => {
  const frame = document.querySelector(".player iframe");
  assert.ok(frame, "no iframe");
  assert.equal(frame.getAttribute("src"),
    `https://drive.google.com/file/d/${VIDEO_ID}/preview`);
});

ok("the embed and the fallback link point at the same file", () => {
  const src = document.querySelector(".player iframe").getAttribute("src");
  const idInSrc = src.match(/file\/d\/([^/]+)/)[1];
  const links = [...document.querySelectorAll('a[href*="drive.google.com"]')]
    .map((a) => a.getAttribute("href"));
  assert.ok(links.length >= 1, "no fallback link");
  for (const href of links) {
    assert.equal(href.match(/file\/d\/([^/]+)/)[1], idInSrc);
  }
});

ok("the iframe is titled and can go fullscreen", () => {
  const frame = document.querySelector(".player iframe");
  assert.ok((frame.getAttribute("title") || "").length > 10);
  assert.ok(frame.hasAttribute("allowfullscreen"));
});

ok("it does not claim captions", () => {
  const t = document.body.textContent.toLowerCase();
  assert.ok(t.includes("captions"), "captions state is not mentioned at all");
  assert.ok(!/captions?\s*:?\s*(yes|available|on)\b/.test(t), "claims captions");
});

ok("the page works with no assets from the app build", () => {
  // Only absolute URLs or data: URIs — the app build does not copy /assets.
  const refs = [...document.querySelectorAll("link[href], script[src], img[src]")]
    .map((el) => el.getAttribute("href") || el.getAttribute("src"));
  for (const r of refs) {
    assert.ok(
      /^(https?:|data:)/.test(r),
      `relative asset would 404 on the app site: ${r}`
    );
  }
});

ok("it has one h1, ordered headings, and a transcript landmark", () => {
  assert.equal(document.querySelectorAll("h1").length, 1);
  assert.deepEqual(
    [...document.querySelectorAll("h2")].map((h) => h.textContent.trim()),
    ["Transcript"]
  );
  assert.ok(document.getElementById("transcript"));
});

ok("links that leave the site open in a new tab without an opener", () => {
  // The footer link back to liveunmute.com stays in place on purpose; only
  // links that hand the visitor to Drive need to break away.
  for (const a of document.querySelectorAll('a[href*="drive.google.com"]')) {
    assert.equal(a.getAttribute("target"), "_blank");
    assert.match(a.getAttribute("rel") || "", /noopener/);
  }
});

console.log(`\n${pass} passed`);
