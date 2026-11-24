// The sign screen opens the camera, not a photograph.
//
// This is a behavioural test of the rendered markup in every state the sign
// screen can be in. It exists because the app shipped a version where tapping
// the hand advanced a scripted pose: the camera code was all present and
// working, but a single `isLiveEngine()` guard in app.js meant it was never
// reached unless a paid recognition key was configured. To a user that looked
// like "the app shows pictures of people instead of my patient".
//
// The rule:
//   · before consent          → a held card, never a photograph
//   · consent granted + armed → <video data-cam>
//   · consent declined        → scripted poses are allowed again
//   · clinician side          → never the patient's camera

import { strict as assert } from "node:assert";
import { renderHome, renderSign } from "./js/screens.js";

let pass = 0;
const ok = (name, fn) => {
  try {
    fn();
    pass++;
    console.log(`PASS  ${name}`);
  } catch (e) {
    console.log(`FAIL  ${name}  — ${e.message}`);
    process.exitCode = 1;
  }
};

const live = (patch) => ({ isMock: true, ...patch });

// A patient photograph is what must NOT appear before consent. Any stock pose
// path is media/patient-*.jpg.
const hasPhoto = (html) => /media\/patient-\d+\.jpg/.test(html);
const hasCam = (html) => html.includes("data-cam");
const hasStandby = (html) => html.includes("cam-standby");

ok("boot, no session yet: held card, no photograph", () => {
  const html = renderSign({ mode: "sign", entry: { media: "media/patient-01.jpg" }, live: null });
  assert.ok(hasStandby(html), "expected the standby card");
  assert.ok(!hasPhoto(html), "a photograph was rendered before the session existed");
});

ok("consent phase: held card, no photograph", () => {
  const html = renderSign({
    mode: "sign",
    entry: { media: "media/patient-01.jpg" },
    live: live({ phase: "consent", consent: undefined }),
    ready: true,
  });
  assert.ok(hasStandby(html));
  assert.ok(!hasPhoto(html), "a photograph was rendered while asking for consent");
});

ok("consent card is actually shown", () => {
  const html = renderSign({
    mode: "sign",
    entry: {},
    live: live({ phase: "consent", consent: undefined }),
    ready: true,
  });
  assert.match(html, /data-consent/);
  assert.match(html, /Patient agrees/);
});

ok("camera armed: live video element, no photograph", () => {
  const html = renderSign({
    mode: "sign",
    entry: { media: "media/patient-01.jpg" },
    live: live({ phase: "ready", consent: "granted" }),
    ready: true,
  });
  assert.ok(hasCam(html), "expected <video data-cam>");
  assert.ok(!hasPhoto(html), "a photograph was rendered while the camera was armed");
});

ok("recording: live video element", () => {
  const html = renderSign({
    mode: "sign",
    entry: {},
    live: live({ phase: "recording", consent: "granted" }),
    ready: true,
  });
  assert.ok(hasCam(html));
});

ok("no engine key configured still uses the camera", () => {
  // isMock is true in this build; the camera must not depend on it.
  const html = renderSign({
    mode: "sign",
    entry: {},
    live: live({ phase: "ready", consent: "granted", isMock: true }),
    ready: true,
  });
  assert.ok(hasCam(html), "camera flow was gated on a real recognition engine");
});

ok("consent declined: poses return", () => {
  const html = renderSign({
    mode: "sign",
    entry: { media: "media/patient-01.jpg" },
    live: live({ phase: "blocked", consent: "declined" }),
    ready: true,
  });
  assert.ok(hasPhoto(html), "the demo should still be usable after a decline");
});

ok("clinician side never shows the patient's camera", () => {
  const html = renderSign({
    mode: "speak",
    entry: { media: "media/translator-01.jpg" },
    live: live({ phase: "ready", consent: "granted" }),
    ready: true,
  });
  assert.ok(!hasCam(html), "the patient's camera was rendered on the clinician side");
});

ok("camera blocked: says so, and does not pretend to be on", () => {
  const html = renderSign({
    mode: "sign",
    entry: {},
    live: live({ phase: "error", consent: "granted", error: "Camera blocked." }),
    ready: true,
  });
  assert.ok(hasStandby(html));
  assert.ok(!hasCam(html), "a dead camera was rendered as a live one");
  assert.match(html, /Camera blocked/);
});

ok("Signa output does not make patient-sign recognition look live", () => {
  const html = renderSign({
    mode: "sign",
    live: {
      phase: "consent",
      isMock: false,
      capabilities: {
        signToText: { live: false, provider: "mock", vendor: null },
        textToSign: { live: true, provider: "signa", vendor: "Signa AI" },
      },
    },
    ready: true,
  });
  assert.match(html, /Demo/);
  assert.match(html, /No sign-recognition engine is configured/);
  assert.match(html, /clip stays on this\s+device and is never uploaded/);
  assert.doesNotMatch(html, /sent to <b>Signa AI<\/b>/);
});

ok("the clinician direction labels Signa output live", () => {
  const html = renderSign({
    mode: "speak",
    live: {
      isMock: false,
      capabilities: {
        signToText: { live: false, provider: "mock", vendor: null },
        textToSign: { live: true, provider: "signa", vendor: "Signa AI" },
      },
    },
  });
  assert.match(html, /<span class="demo-chip is-live" title="Signa AI · English to ASL output">Live<\/span>/);
});

ok("clinician screen shows the live transcript and start/stop control without scripted fallback text", () => {
  const html = renderSign({
    mode: "speak",
    entry: { text: "This is not a live transcript." },
    caption: "Where does it hurt?",
    conversationActive: true,
  });
  assert.match(html, /aria-pressed="true" aria-label="End conversation"/);
  assert.match(html, />Stop<\/span>/);
  assert.match(html, /<p class="caption" data-caption>Where does it hurt\?<\/p>/);
  assert.doesNotMatch(html, /This is not a live transcript/);
});

ok("speech transcript is escaped before it enters the rendered HTML", () => {
  const html = renderSign({ mode: "speak", caption: '<img src=x onerror="alert(1)">' });
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.doesNotMatch(html, /<img src=x/);
});

ok("Repeat is disabled until a sign exists, then uses the most recent completed segment", () => {
  const disabled = renderSign({ mode: "speak" });
  assert.match(disabled, /data-repeat[^>]*disabled/);

  const html = renderSign({
    mode: "speak",
    live: { signing: { videoUrl: "blob:older" } },
    lastSignedChunk: { id: 2, text: "For two days", videoUrl: "blob:latest" },
  });
  assert.match(html, /src="blob:latest"/);
  assert.doesNotMatch(html, /src="blob:older"/);
  assert.doesNotMatch(html, /data-repeat[^>]*disabled/);
});

ok("home status states that Signa output is only one direction", () => {
  const html = renderHome({
    live: {
      capabilities: {
        signToText: { live: false, provider: "mock", vendor: null },
        textToSign: { live: true, provider: "signa", vendor: "Signa AI" },
      },
    },
  });
  assert.match(html, /Signa AI can sign clinician English in ASL/);
  assert.match(html, /Patient ASL → English remains a scripted demo/);
});

console.log(`\n${pass} passed`);
