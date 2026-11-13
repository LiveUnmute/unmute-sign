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

async function flushPromises() {
  await new Promise((resolve) => setImmediate(resolve));
}

// JSDOM does not fetch Vimeo. Stub Vimeo.Player, its loaded/error events, the
// timeout, and the containing-page fullscreen API while exercising the page's
// actual script.
function installVimeo(window, calls, vimeo) {
  window.Vimeo = {
    Player: class {
      constructor(iframe) { calls.player = iframe; }
      on(name, callback) { calls[`${name}Handler`] = callback; }
      ready() {
        return vimeo === "reject"
          ? Promise.reject(new Error("Vimeo player failed"))
          : Promise.resolve();
      }
      getVideoId() {
        return Promise.resolve(vimeo === "wrong-id" ? "987654321" : VIDEO_ID);
      }
    },
  };
}

function page({ fullscreen = true, fullscreenReject = false, vimeo = "ready" } = {}) {
  const calls = { enter: [], exit: 0, loadTimeout: null, player: null, errorHandler: null, loadedHandler: null };
  let currentFullscreen = null;
  const dom = new JSDOM(html, {
    url: "https://app.liveunmute.com/demo/",
    runScripts: "dangerously",
    beforeParse(window) {
      const nativeSetTimeout = window.setTimeout.bind(window);
      const nativeClearTimeout = window.clearTimeout.bind(window);
      window.setTimeout = (callback, delay, ...args) => {
        if (delay === 12000) {
          calls.loadTimeout = () => callback(...args);
          return 777777;
        }
        return nativeSetTimeout(callback, delay, ...args);
      };
      window.clearTimeout = (id) => { if (id !== 777777) nativeClearTimeout(id); };
      Object.defineProperty(window.document, "fullscreenElement", {
        configurable: true,
        get: () => currentFullscreen,
      });
      if (fullscreen) {
        window.HTMLElement.prototype.requestFullscreen = function () {
          calls.enter.push(this.id);
          if (fullscreenReject) return Promise.reject(new Error("Fullscreen permission denied"));
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
      if (vimeo !== "missing") installVimeo(window, calls, vimeo);
    },
  });
  return {
    dom,
    doc: dom.window.document,
    calls,
    installVimeo: (mode = "ready") => installVimeo(dom.window, calls, mode),
    close: () => dom.window.close(),
  };
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

await ok("the exact IDICE Vimeo embed and player permissions are present", () => {
  const { doc, close } = page();
  const iframe = doc.querySelector("#vimeo-player");
  assert.ok(iframe);
  assert.equal(iframe.src, PLAYER_URL);
  assert.equal(iframe.title, "Unmute Pitch Video —IDICE");
  assert.equal(iframe.getAttribute("allow"), "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share");
  assert.equal(iframe.getAttribute("referrerpolicy"), "strict-origin-when-cross-origin");
  assert.ok(iframe.hasAttribute("allowfullscreen"));
  assert.equal(iframe.getAttribute("tabindex"), "-1");
  assert.equal(iframe.getAttribute("aria-hidden"), "true");
  assert.equal(iframe.hidden, false);
  assert.ok(doc.querySelector(".player").contains(iframe));
  assert.match(html, /aspect-ratio:\s*9\s*\/\s*20/);
  const sdk = doc.querySelector('script[src="https://player.vimeo.com/api/player.js"]');
  assert.ok(sdk, "Vimeo player SDK missing");
  assert.ok(sdk.hasAttribute("defer"));
  assert.equal(sdk.parentElement.tagName, "HEAD", "the deferred SDK element must exist before the inline script runs");
  assert.ok(doc.querySelector("#vimeo-state").contains(doc.querySelector(".vimeo-open")));
  assert.ok(doc.querySelector("#fullscreen-status"));
  assert.doesNotMatch(html, /getElementById\(['"]video-status['"]\)/);
  assert.doesNotMatch(html, /drive\.google\.com|drive\.usercontent\.google\.com/i);
  assert.equal(doc.querySelectorAll("video").length, 0);
  close();
});

await ok("the embed has a branded loading/error state and direct Vimeo link", () => {
  const { doc, close } = page({ vimeo: "missing" });
  const state = doc.querySelector("#vimeo-state");
  const link = doc.querySelector(".vimeo-open");
  assert.ok(!state.hidden);
  assert.equal(link.href, `https://vimeo.com/${VIDEO_ID}`);
  assert.equal(link.target, "_blank");
  assert.match(link.rel, /noopener/);
  assert.ok(doc.querySelector("#vimeo-contact").hidden, "report link is reserved for an error state");
  assert.match(doc.title, /IDICE pitch video/i);
  assert.doesNotMatch(doc.body.textContent, /114 MB|5:27|Wi-Fi recommended/i);
  close();
});

await ok("the player stays covered until Vimeo reports the video loaded", async () => {
  const { doc, calls, close } = page();
  await flushPromises();
  const iframe = doc.querySelector("#vimeo-player");
  assert.equal(calls.player, iframe);
  assert.ok(!doc.querySelector("#vimeo-state").hidden);
  assert.equal(iframe.getAttribute("tabindex"), "-1");
  assert.ok(doc.querySelector("#fullscreen").hidden);
  assert.equal(typeof calls.loadedHandler, "function");
  calls.loadedHandler();
  assert.ok(doc.querySelector("#vimeo-state").hidden);
  assert.ok(doc.querySelector("#player").classList.contains("is-ready"));
  assert.equal(iframe.getAttribute("tabindex"), "0");
  assert.equal(iframe.hasAttribute("aria-hidden"), false);
  assert.ok(!doc.querySelector("#fullscreen").hidden);
  close();
});

await ok("a deferred Vimeo SDK load connects after the page script has registered its listener", async () => {
  const { dom, doc, calls, installVimeo, close } = page({ vimeo: "missing" });
  installVimeo();
  doc.querySelector("#vimeo-sdk").dispatchEvent(new dom.window.Event("load"));
  await flushPromises();
  calls.loadedHandler();
  assert.ok(doc.querySelector("#vimeo-state").hidden);
  assert.ok(doc.querySelector("#player").classList.contains("is-ready"));
  close();
});

await ok("a Vimeo SDK network error immediately exposes the direct-link fallback", () => {
  const { dom, doc, close } = page({ vimeo: "missing" });
  doc.querySelector("#vimeo-sdk").dispatchEvent(new dom.window.Event("error"));
  assert.ok(!doc.querySelector("#vimeo-state").hidden);
  assert.ok(doc.querySelector("#player").classList.contains("has-error"));
  assert.ok(doc.querySelector(".vimeo-open"));
  close();
});

await ok("an unexpected Vimeo video ID is not exposed as the requested pitch", async () => {
  const { doc, close } = page({ vimeo: "wrong-id" });
  await flushPromises();
  assert.ok(!doc.querySelector("#vimeo-state").hidden);
  assert.ok(doc.querySelector("#player").classList.contains("has-error"));
  assert.ok(doc.querySelector("#fullscreen").hidden);
  close();
});

await ok("an unavailable Vimeo player leaves a compact branded fallback, not a blank white frame", async () => {
  const { doc, close } = page({ vimeo: "reject" });
  await flushPromises();
  assert.ok(!doc.querySelector("#vimeo-state").hidden);
  assert.ok(doc.querySelector("#player").classList.contains("has-error"));
  assert.equal(doc.querySelector("#vimeo-player").getAttribute("tabindex"), "-1");
  assert.equal(doc.querySelector("#vimeo-player").getAttribute("aria-hidden"), "true");
  assert.ok(!doc.querySelector("#vimeo-state-title").textContent.includes("Loading"));
  assert.match(doc.querySelector("#vimeo-state-copy").textContent, /availability or privacy settings/);
  assert.ok(doc.querySelector("#fullscreen").hidden);
  assert.ok(doc.querySelector(".vimeo-open"));
  assert.ok(!doc.querySelector("#vimeo-contact").hidden);
  assert.equal(doc.querySelector("#vimeo-contact").getAttribute("href").split("?")[0], "mailto:contact@liveunmute.com");
  close();
});

await ok("a Vimeo video that never finishes loading times out to the direct-link fallback", async () => {
  const { doc, calls, close } = page();
  await flushPromises();
  assert.ok(!doc.querySelector("#vimeo-state").hidden, "a ready API without loaded video stays covered");
  calls.loadTimeout();
  assert.ok(!doc.querySelector("#vimeo-state").hidden);
  assert.ok(doc.querySelector("#player").classList.contains("has-error"));
  assert.ok(doc.querySelector(".vimeo-open"));
  close();
});

await ok("a Vimeo player error switches to the direct-link fallback", async () => {
  const { doc, calls, close } = page();
  await flushPromises();
  calls.errorHandler();
  assert.ok(!doc.querySelector("#vimeo-state").hidden);
  assert.ok(doc.querySelector("#player").classList.contains("has-error"));
  assert.ok(doc.querySelector("#fullscreen").hidden);
  close();
});

await ok("the branded full-screen button and exit wrap the ready Vimeo embed", async () => {
  const { doc, calls, close } = page();
  await flushPromises();
  calls.loadedHandler();
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

await ok("a denied full-screen request explains how to use Vimeo's own control", async () => {
  const { doc, calls, close } = page({ fullscreenReject: true });
  await flushPromises();
  calls.loadedHandler();
  doc.querySelector("#fullscreen").click();
  await flushPromises();
  const status = doc.querySelector("#fullscreen-status");
  assert.ok(!status.hidden);
  assert.match(status.textContent, /Use the Vimeo player’s full-screen control/);
  close();
});

await ok("browsers without the Fullscreen API can use Vimeo's own full-screen control", async () => {
  const { doc, calls, close } = page({ fullscreen: false });
  await flushPromises();
  calls.loadedHandler();
  assert.ok(doc.querySelector("#fullscreen").hidden);
  assert.ok(doc.querySelector("#vimeo-player").hasAttribute("allowfullscreen"));
  assert.ok(doc.querySelector("#vimeo-player").getAttribute("allow").includes("fullscreen"));
  assert.ok(doc.querySelector(".vimeo-open"));
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
