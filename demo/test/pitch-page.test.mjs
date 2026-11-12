// Regression checks for the branded /demo page and its Vimeo player.

import { readFileSync, existsSync } from "node:fs";
import { strict as assert } from "node:assert";
import { JSDOM } from "jsdom";

const SRC = "./pitch/index.html";
const VIDEO_ID = "1239775906";
const PLAYER_URL = `https://player.vimeo.com/video/${VIDEO_ID}?badge=0&autopause=0&player_id=0&app_id=58479&muted=1`;
const html = readFileSync(SRC, "utf8");
let pass = 0;

async function ok(name, run) {
  try { await run(); pass++; console.log(`PASS  ${name}`); }
  catch (error) { console.log(`FAIL  ${name} — ${error.stack || error.message}`); process.exitCode = 1; }
}

// JSDOM does not fetch external pages. Stub the containing-page fullscreen API
// and exercise the actual inline script and its DOM event handlers.
function page({ fullscreen = true } = {}) {
  const calls = { enter: [], exit: 0 };
  let currentFullscreen = null;
  const dom = new JSDOM(html, {
    url: "https://app.liveunmute.com/demo/",
    runScripts: "dangerously",
    beforeParse(window) {
      Object.defineProperty(window.document, "fullscreenElement", {
        configurable: true,
        get: () => currentFullscreen,
      });
      if (fullscreen) {
        window.HTMLElement.prototype.requestFullscreen = function () {
          calls.enter.push(this.id);
          currentFullscreen = this;
          window.document.dispatchEvent(new window.Event("fullscreenchange"));
          return Promise.resolve();
        };
        window.document.exitFullscreen = function () {
          calls.exit++;
          currentFullscreen = null;
          window.document.dispatchEvent(new window.Event("fullscreenchange"));
          return Promise.resolve();
        };
      }
    },
  });
  return { dom, doc: dom.window.document, calls, close: () => dom.window.close() };
}

await ok("the build publishes pitch/ at /demo", () => {
  assert.ok(existsSync(SRC));
  assert.match(readFileSync("./build.mjs", "utf8"), /COPY_RENAMED\s*=\s*\[\s*\[\s*"pitch"\s*,\s*"demo"\s*\]\s*\]/);
});

await ok("the Unmute logo and both favicons are the actual brand assets", () => {
  const { doc, close } = page();
  assert.equal(doc.querySelector(".brand img").getAttribute("src"), "/demo/assets/unmute-logo.png");
  assert.equal(doc.querySelector(".brand img").getAttribute("alt"), "Unmute");
  assert.ok(readFileSync("pitch/assets/unmute-logo.png").equals(readFileSync("../landing/assets/img/unmute-logo-white.png")));
  assert.ok(readFileSync("pitch/assets/favicon-32.png").equals(readFileSync("../landing/assets/img/favicon-32.png")));
  assert.ok(readFileSync("pitch/assets/favicon-192.png").equals(readFileSync("../landing/assets/img/favicon-192.png")));
  for (const size of ["32x32", "192x192"]) {
    assert.ok(doc.querySelector(`link[rel="icon"][sizes="${size}"]`), `missing ${size} icon`);
  }
  close();
});

await ok("the page uses Unmute's dark palette and local type assets", () => {
  assert.match(html, /name="theme-color" content="#0B0D10"/i);
  assert.match(html, /name="color-scheme" content="dark"/i);
  assert.match(html, /color-scheme:\s*dark/i);
  assert.match(html, /--bone:\s*#0B0D10/i);
  assert.match(html, /--paper:\s*#171A20/i);
  assert.match(html, /--ink:\s*#F3F4F6/i);
  assert.match(html, /--blue:\s*#006AFE/i);
  assert.match(html, /--blue-light:\s*#78ACFF/i);
  for (const name of ["syncopate-latin-400.woff2", "Pretendard-Regular.subset.91.woff2", "Pretendard-Medium.subset.91.woff2", "Pretendard-Bold.subset.91.woff2", "SYNCOPATE-LICENSE.txt", "PRETENDARD-LICENSE.txt"]) {
    assert.ok(existsSync(`pitch/assets/${name}`), `${name} missing`);
  }
});

await ok("the exact IDICE Vimeo embed and all player permissions are present", () => {
  const { doc, close } = page();
  const iframe = doc.querySelector("#vimeo-player");
  assert.ok(iframe);
  assert.equal(iframe.src, PLAYER_URL);
  assert.equal(iframe.title, "Unmute Pitch Video —IDICE");
  assert.equal(iframe.getAttribute("allow"), "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share");
  assert.equal(iframe.getAttribute("referrerpolicy"), "strict-origin-when-cross-origin");
  assert.ok(iframe.hasAttribute("allowfullscreen"));
  assert.equal(iframe.hidden, false);
  assert.ok(doc.querySelector(".player").contains(iframe));
  assert.match(html, /aspect-ratio:\s*9\s*\/\s*20/);
  const sdk = doc.querySelector('script[src="https://player.vimeo.com/api/player.js"]');
  assert.ok(sdk, "Vimeo player SDK missing");
  assert.ok(sdk.hasAttribute("defer"));
  assert.doesNotMatch(html, /drive\.google\.com|drive\.usercontent\.google\.com/i);
  assert.equal(doc.querySelectorAll("video").length, 0);
  close();
});

await ok("the page has a direct Vimeo link and no hard-coded old video metadata", () => {
  const { doc, close } = page();
  const link = doc.querySelector(".video-link");
  assert.equal(link.href, `https://vimeo.com/${VIDEO_ID}`);
  assert.equal(link.target, "_blank");
  assert.match(link.rel, /noopener/);
  assert.match(doc.title, /IDICE pitch video/i);
  assert.doesNotMatch(doc.body.textContent, /114 MB|5:27|Wi-Fi recommended/i);
  close();
});

await ok("Vimeo playback is immediately available, including without JavaScript", () => {
  const noJs = new JSDOM(html, { url: "https://app.liveunmute.com/demo/" });
  const doc = noJs.window.document;
  assert.equal(doc.querySelector("#vimeo-player").src, PLAYER_URL);
  assert.equal(doc.querySelector("#vimeo-player").hidden, false);
  assert.ok(doc.querySelector("#fullscreen").hidden);
  assert.ok(doc.querySelector(".video-link"));
  noJs.window.close();
});

await ok("the branded full-screen button and exit wrap the Vimeo embed", () => {
  const { doc, calls, close } = page();
  const screen = doc.querySelector("#watch-screen");
  const button = doc.querySelector("#fullscreen");
  const exit = doc.querySelector("#exit-fullscreen");
  assert.equal(button.getAttribute("aria-controls"), "watch-screen");
  assert.ok(!button.hidden);
  assert.ok(exit.hidden);
  button.focus();
  button.click();
  assert.deepEqual(calls.enter, ["watch-screen"]);
  assert.ok(!exit.hidden);
  assert.equal(doc.activeElement, exit);
  exit.click();
  assert.equal(calls.exit, 1);
  assert.ok(exit.hidden);
  assert.equal(doc.activeElement, button);
  assert.equal(screen.querySelector("#vimeo-player").src, PLAYER_URL);
  close();
});

await ok("browsers without the Fullscreen API can use Vimeo's own full-screen control", () => {
  const { doc, close } = page({ fullscreen: false });
  assert.ok(doc.querySelector("#fullscreen").hidden);
  assert.ok(doc.querySelector("#vimeo-player").hasAttribute("allowfullscreen"));
  assert.ok(doc.querySelector("#vimeo-player").getAttribute("allow").includes("fullscreen"));
  assert.ok(doc.querySelector(".video-link"));
  close();
});

await ok("captions are described without claiming they are available", () => {
  const { doc, close } = page();
  assert.equal(doc.querySelectorAll("h1").length, 1);
  assert.match(doc.querySelector(".accessibility").textContent, /CC control if captions are available/i);
  assert.match(doc.querySelector(".accessibility").textContent, /written transcript is not provided/i);
  close();
});

console.log(`\n${pass} passed`);
