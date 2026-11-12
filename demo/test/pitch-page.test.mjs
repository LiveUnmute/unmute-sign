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
        return playError ? Promise.reject(playError) : Promise.resolve();
      };
      window.HTMLMediaElement.prototype.pause = function () { calls.pause++; };
      window.HTMLMediaElement.prototype.load = function () { calls.load++; };
      const nativeSetTimeout = window.setTimeout.bind(window);
      const nativeClearTimeout = window.clearTimeout.bind(window);
      window.setTimeout = (callback, delay, ...args) => {
        if (delay === 12000) {
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

await ok("native source, fallback iframe and links all use the product video", () => {
  const { doc, close } = page();
  const video = doc.querySelector("#video");
  const direct = new URL(video.dataset.src);
  assert.equal(direct.hostname, "drive.usercontent.google.com");
  assert.equal(direct.searchParams.get("id"), VIDEO_ID);
  assert.equal(direct.searchParams.get("confirm"), "t");
  const frame = doc.querySelector("#drive-player");
  assert.equal(frame.dataset.src, `https://drive.google.com/file/d/${VIDEO_ID}/preview`);
  assert.ok(frame.title.length > 10);
  assert.ok(frame.hasAttribute("allowfullscreen"));
  assert.match(frame.getAttribute("allow"), /fullscreen/);
  for (const link of doc.querySelectorAll('a[href*="drive.google.com"]')) {
    assert.match(link.href, new RegExp(`/file/d/${VIDEO_ID}/view`));
    assert.equal(link.target, "_blank");
    assert.match(link.rel, /noopener/);
  }
  close();
});

await ok("initial state has one cover, no loaded player and a no-JS fallback", () => {
  const noJs = new JSDOM(html, { url: "https://app.liveunmute.com/demo/" });
  const doc = noJs.window.document;
  assert.equal(doc.querySelectorAll("#play-demo").length, 1);
  assert.equal(doc.querySelector("#play-demo").getAttribute("href"), `https://drive.google.com/file/d/${VIDEO_ID}/view`);
  assert.ok(doc.querySelector("#video").hidden);
  assert.ok(doc.querySelector("#drive-player").hidden);
  assert.ok(doc.querySelector("#fullscreen").hidden);
  assert.equal(doc.querySelector("#video").getAttribute("src"), null);
  assert.equal(doc.querySelector("#drive-player").getAttribute("src"), null);
  assert.equal(doc.querySelector("#video").getAttribute("preload"), "none");
  assert.ok(doc.querySelector("#video").hasAttribute("playsinline"));
  assert.ok(doc.querySelector("#video").hasAttribute("controls"));
  noJs.window.close();
});

await ok("play opens one native player with focus and no Drive overlay", () => {
  const { doc, calls, close } = page();
  const poster = doc.querySelector("#play-demo");
  const video = doc.querySelector("#video");
  poster.focus();
  poster.click();
  assert.equal(calls.play, 1);
  assert.ok(poster.hidden);
  assert.ok(!video.hidden);
  assert.equal(doc.activeElement, video);
  assert.equal(video.src, video.dataset.src);
  assert.ok(doc.querySelector("#drive-player").hidden);
  assert.equal(doc.querySelector("#drive-player").getAttribute("src"), null);
  video.dispatchEvent(new doc.defaultView.Event("playing"));
  assert.match(doc.querySelector("#video-status").textContent, /pause or seek/);
  close();
});

await ok("native failure falls back to the same Drive video without trapping focus", () => {
  const { doc, close } = page();
  const video = doc.querySelector("#video");
  const frame = doc.querySelector("#drive-player");
  doc.querySelector("#play-demo").focus();
  doc.querySelector("#play-demo").click();
  video.dispatchEvent(new doc.defaultView.Event("error"));
  assert.ok(video.hidden);
  assert.equal(video.getAttribute("src"), null);
  assert.ok(!frame.hidden);
  assert.equal(frame.src, frame.dataset.src);
  assert.equal(doc.activeElement, frame);
  assert.match(doc.querySelector("#video-status").textContent, /Google Drive player/);
  close();
});

await ok("a slow stream offers the Drive player and cancels the native download", () => {
  const { doc, calls, close } = page();
  doc.querySelector("#play-demo").click();
  assert.ok(doc.querySelector("#use-drive-player").hidden);
  calls.loadingTimer();
  const fallback = doc.querySelector("#use-drive-player");
  assert.ok(!fallback.hidden);
  fallback.focus();
  fallback.click();
  assert.ok(fallback.hidden);
  assert.equal(calls.pause, 1);
  assert.equal(calls.load, 1);
  assert.equal(doc.activeElement, doc.querySelector("#drive-player"));
  assert.ok(!doc.querySelector("#drive-player").hidden);
  close();
});

await ok("autoplay denial asks for a tap rather than reporting a broken file", async () => {
  const { doc, close } = page({ playError: { name: "NotAllowedError" } });
  doc.querySelector("#play-demo").click();
  await Promise.resolve();
  assert.ok(!doc.querySelector("#video").hidden);
  assert.ok(doc.querySelector("#drive-player").hidden);
  assert.match(doc.querySelector("#video-status").textContent, /Tap play/);
  close();
});

await ok("full screen starts playback, fills the player and has a working exit", () => {
  const { doc, calls, close } = page();
  const button = doc.querySelector("#fullscreen");
  const exit = doc.querySelector("#exit-fullscreen");
  assert.ok(!button.hidden);
  button.click();
  assert.equal(calls.play, 1);
  assert.deepEqual(calls.enter, ["player"]);
  assert.ok(!exit.hidden);
  exit.focus();
  exit.click();
  assert.equal(calls.exit, 1);
  assert.ok(exit.hidden);
  assert.equal(doc.activeElement, button);
  close();
});

await ok("the Drive fallback can also enter full screen", () => {
  const { doc, calls, close } = page();
  doc.querySelector("#play-demo").click();
  doc.querySelector("#video").dispatchEvent(new doc.defaultView.Event("error"));
  doc.querySelector("#fullscreen").click();
  assert.deepEqual(calls.enter, ["player"]);
  assert.ok(!doc.querySelector("#exit-fullscreen").hidden);
  close();
});

await ok("iPhone video fullscreen and unsupported-browser fallback are handled", () => {
  const iphone = page({ fullscreen: false, ios: true });
  assert.ok(!iphone.doc.querySelector("#fullscreen").hidden);
  iphone.doc.querySelector("#fullscreen").click();
  assert.equal(iphone.calls.ios, 1);
  iphone.doc.querySelector("#video").dispatchEvent(new iphone.doc.defaultView.Event("error"));
  assert.ok(iphone.doc.querySelector("#fullscreen").hidden);
  assert.ok(!iphone.doc.querySelector("#drive-player").hidden);
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
