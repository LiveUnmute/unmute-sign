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
import { renderSign } from "./js/screens.js";

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

console.log(`\n${pass} passed`);
