// Regression checks for the branded /demo page. Its source is copied into the
// app and the demo build; the Drive video is intentionally loaded only when a
// visitor asks to play it.

import { readFileSync, existsSync } from "node:fs";
import { strict as assert } from "node:assert";
import { JSDOM } from "jsdom";

const SRC = "./pitch/index.html";
const VIDEO_ID = "1uEhWk72tQQtbQfzMFaQRp6FBe4NLPTcn";
const html = readFileSync(SRC, "utf8");
let pass = 0;

async function ok(name, run) {
  try { await run(); pass++; console.log(`PASS  ${name}`); }
  catch (error) { console.log(`FAIL  ${name} — ${error.stack || error.message}`); process.exitCode = 1; }
}

// No external resource is fetched by JSDOM. We stub the browser media and
// fullscreen APIs, then exercise the real inline page script and DOM events.
function page({ fullscreen = true, ios = false, playError = null } = {}) {
  const calls = { play: 0, pause: 0, load: 0, enter: [], exit: 0, ios: 0, loadingTimer: null };
  let currentFullscreen = null;
  const dom = new JSDOM(html, {
    url: "https://app.liveunmute.com/demo/",
    runScripts: "dangerously",
    beforeParse(window) {
      window.HTMLMediaElement.prototype.play = function () {
        calls.play++;
        Object.defineProperty(this, "paused", { configurable: true, value: false });
        return playError ? Promise.reject(playError) : Promise.resolve();
      };
      window.HTMLMediaElement.prototype.pause = function () {
        calls.pause++;
        Object.defineProperty(this, "paused", { configurable: true, value: true });
      };
      window.HTMLMediaElement.prototype.load = function () { calls.load++; };
      const nativeSetTimeout = window.setTimeout.bind(window);
      const nativeClearTimeout = window.clearTimeout.bind(window);
      window.setTimeout = (callback, delay, ...args) => {
        if (delay === 25000) {
          calls.loadingTimer = () => callback(...args);
          return 999999;
        }
        return nativeSetTimeout(callback, delay, ...args);
      };
      window.clearTimeout = (id) => { if (id !== 999999) nativeClearTimeout(id); };
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
      if (ios) {
        window.HTMLVideoElement.prototype.webkitEnterFullscreen = function () { calls.ios++; };
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
  assert.ok(readFileSync("pitch/assets/unmute-logo.png").equals(readFileSync("../app/assets/unmute-logo-trimmed.png")));
  assert.ok(readFileSync("pitch/assets/favicon-32.png").equals(readFileSync("../landing/assets/img/favicon-32.png")));
  assert.ok(readFileSync("pitch/assets/favicon-192.png").equals(readFileSync("../landing/assets/img/favicon-192.png")));
  for (const size of ["32x32", "192x192"]) {
    assert.ok(doc.querySelector(`link[rel="icon"][sizes="${size}"]`), `missing ${size} icon`);
  }
  close();
});

await ok("the palette, fonts and hero image are available without a font CDN", () => {
  assert.match(html, /#E3E1DC/i);
  assert.match(html, /#006AFE/i);
  assert.match(html, /#121212/i);
  for (const name of ["demo-poster.jpg", "syncopate-latin-400.woff2", "Pretendard-Regular.subset.91.woff2", "Pretendard-Medium.subset.91.woff2", "Pretendard-Bold.subset.91.woff2", "SYNCOPATE-LICENSE.txt", "PRETENDARD-LICENSE.txt"]) {
    assert.ok(existsSync(`pitch/assets/${name}`), `${name} missing`);
  }
});

await ok("the custom player has no embedded Drive UI or browser control overlay", () => {
  const { doc, close } = page();
  const video = doc.querySelector("#video");
  assert.equal(doc.querySelectorAll("iframe").length, 0);
  assert.equal(video.hasAttribute("controls"), false);
  assert.equal(doc.querySelector("#toggle-play").getAttribute("aria-label"), "Play video");
  assert.equal(doc.querySelector("#seek").type, "range");
  assert.equal(doc.querySelector("#seek").getAttribute("aria-label"), "Seek video");
  assert.equal(doc.querySelector("#fullscreen").getAttribute("aria-controls"), "watch-screen");
  assert.equal(doc.querySelector("#toggle-play").getAttribute("aria-controls"), "video");
  assert.ok(doc.querySelector("#exit-fullscreen"));
  assert.equal(doc.querySelector(".player").contains(doc.querySelector("#transport")), false);
  close();
});

await ok("the native source and every Drive link use the product video", () => {
  const { doc, close } = page();
  const video = doc.querySelector("#video");
  const direct = new URL(video.dataset.src);
  assert.equal(direct.hostname, "drive.usercontent.google.com");
  assert.equal(direct.searchParams.get("id"), VIDEO_ID);
  assert.equal(direct.searchParams.get("confirm"), "t");
  assert.ok(doc.querySelector("#playback-error").textContent.includes("Google Drive"));
  for (const link of doc.querySelectorAll('a[href*="drive.google.com"]')) {
    assert.equal(link.href, `https://drive.google.com/file/d/${VIDEO_ID}/view`);
    assert.equal(link.target, "_blank");
    assert.match(link.rel, /noopener/);
  }
  close();
});

await ok("initial state has one branded cover, no loaded media and a no-JS Drive link", () => {
  const noJs = new JSDOM(html, { url: "https://app.liveunmute.com/demo/" });
  const doc = noJs.window.document;
  const video = doc.querySelector("#video");
  assert.equal(doc.querySelectorAll("#play-demo").length, 1);
  assert.equal(doc.querySelector("#play-demo").getAttribute("href"), `https://drive.google.com/file/d/${VIDEO_ID}/view`);
  assert.ok(video.hidden);
  assert.ok(doc.querySelector("#transport").hidden);
  assert.ok(doc.querySelector("#playback-error").hidden);
  assert.ok(doc.querySelector("#fullscreen").hidden);
  assert.equal(video.getAttribute("src"), null);
  assert.equal(video.getAttribute("preload"), "none");
  assert.ok(video.hasAttribute("playsinline"));
  assert.equal(video.hasAttribute("controls"), false);
  noJs.window.close();
});

await ok("play opens one native player and the custom controls sit below the video", () => {
  const { doc, calls, close } = page();
  const poster = doc.querySelector("#play-demo");
  const video = doc.querySelector("#video");
  poster.focus();
  poster.click();
  assert.equal(calls.play, 1);
  assert.ok(poster.hidden);
  assert.ok(!video.hidden);
  assert.ok(!doc.querySelector("#transport").hidden);
  assert.equal(doc.activeElement, video);
  assert.equal(video.src, video.dataset.src);
  assert.equal(doc.querySelectorAll("iframe").length, 0);
  video.dispatchEvent(new doc.defaultView.Event("playing"));
  assert.match(doc.querySelector("#video-status").textContent, /controls are below/);
  assert.equal(doc.querySelector("#toggle-play").getAttribute("aria-label"), "Pause video");
  close();
});

await ok("timeline follows the loaded media and remains keyboard/touch seekable", () => {
  const { doc, close } = page();
  doc.querySelector("#play-demo").click();
  const video = doc.querySelector("#video");
  let current = 0;
  Object.defineProperty(video, "duration", { configurable: true, value: 327 });
  Object.defineProperty(video, "currentTime", {
    configurable: true,
    get: () => current,
    set: (value) => { current = Number(value); },
  });
  video.dispatchEvent(new doc.defaultView.Event("loadedmetadata"));
  const seek = doc.querySelector("#seek");
  assert.equal(seek.disabled, false);
  assert.equal(seek.max, "327");
  assert.equal(doc.querySelector("#total-time").textContent, "5:27");
  seek.value = "60";
  seek.dispatchEvent(new doc.defaultView.Event("input", { bubbles: true }));
  assert.equal(video.currentTime, 60);
  assert.equal(doc.querySelector("#current-time").textContent, "1:00");
  close();
});

await ok("stream failure shows a branded message instead of an embedded Drive player", () => {
  const { doc, close } = page();
  const video = doc.querySelector("#video");
  doc.querySelector("#play-demo").focus();
  doc.querySelector("#play-demo").click();
  video.dispatchEvent(new doc.defaultView.Event("error"));
  assert.ok(video.hidden);
  assert.equal(video.getAttribute("src"), null);
  assert.ok(doc.querySelector("#transport").hidden);
  assert.ok(!doc.querySelector("#playback-error").hidden);
  assert.ok(doc.querySelector("#fullscreen").hidden);
  assert.equal(doc.querySelectorAll("iframe").length, 0);
  assert.equal(doc.activeElement, doc.querySelector("#fallback-drive-link"));
  assert.match(doc.querySelector("#video-status").textContent, /Inline playback failed/);
  close();
});

await ok("a stalled stream shows a clean Drive link and allows an inline retry", () => {
  const { doc, calls, close } = page();
  doc.querySelector("#play-demo").click();
  assert.ok(doc.querySelector("#playback-error").hidden);
  calls.loadingTimer();
  assert.ok(!doc.querySelector("#playback-error").hidden);
  assert.equal(calls.pause, 1);
  assert.equal(calls.load, 1);
  assert.equal(doc.querySelectorAll("iframe").length, 0);
  assert.equal(doc.querySelector("#fallback-drive-link").target, "_blank");
  doc.querySelector("#retry-playback").click();
  assert.equal(calls.play, 2);
  assert.ok(doc.querySelector("#playback-error").hidden);
  assert.ok(!doc.querySelector("#transport").hidden);
  close();
});

await ok("autoplay denial asks for a tap rather than reporting a broken file", async () => {
  const { doc, close } = page({ playError: { name: "NotAllowedError" } });
  doc.querySelector("#play-demo").click();
  await Promise.resolve();
  assert.ok(!doc.querySelector("#video").hidden);
  assert.ok(!doc.querySelector("#transport").hidden);
  assert.ok(doc.querySelector("#playback-error").hidden);
  assert.match(doc.querySelector("#video-status").textContent, /Tap the play button below/);
  close();
});

await ok("full screen starts playback, includes controls and has a working exit", () => {
  const { doc, calls, close } = page();
  const button = doc.querySelector("#fullscreen");
  const exit = doc.querySelector("#exit-fullscreen");
  assert.ok(!button.hidden);
  button.focus();
  button.click();
  assert.equal(calls.play, 1);
  assert.deepEqual(calls.enter, ["watch-screen"]);
  assert.ok(!exit.hidden);
  assert.equal(doc.activeElement, exit);
  exit.focus();
  exit.click();
  assert.equal(calls.exit, 1);
  assert.ok(exit.hidden);
  assert.equal(doc.activeElement, button);
  close();
});

await ok("iPhone video fullscreen and unsupported-browser fallback are handled", () => {
  const iphone = page({ fullscreen: false, ios: true });
  assert.ok(!iphone.doc.querySelector("#fullscreen").hidden);
  iphone.doc.querySelector("#fullscreen").click();
  assert.equal(iphone.calls.ios, 1);
  iphone.doc.querySelector("#video").dispatchEvent(new iphone.doc.defaultView.Event("error"));
  assert.ok(iphone.doc.querySelector("#fullscreen").hidden);
  assert.ok(!iphone.doc.querySelector("#playback-error").hidden);
  iphone.close();
  const unsupported = page({ fullscreen: false });
  assert.ok(unsupported.doc.querySelector("#fullscreen").hidden);
  assert.ok(unsupported.doc.querySelector(".drive-link"));
  unsupported.close();
});

await ok("captions and transcript availability are stated accurately", () => {
  const { doc, close } = page();
  assert.equal(doc.querySelectorAll("h1").length, 1);
  assert.match(doc.querySelector(".accessibility").textContent, /captions and a written transcript are not yet available/i);
  close();
});

console.log(`\n${pass} passed`);
