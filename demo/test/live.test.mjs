// Live conversation MVP — structure and honesty checks.
//
// The behaviours that matter most here are not visual. They are the ones that
// decide whether a clinician can trust what is on screen:
//   * the path from open → live must not require a menu;
//   * unrecognised speech must say so, not guess;
//   * the ASL panel must never imply a working translation.

import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { strict as assert } from "node:assert";
import { matchClinicianPhrase, CLINICIAN_PHRASES, PATIENT_RESPONSES } from "../js/phrases.js";

const html = readFileSync("./live.html", "utf8");
const css = readFileSync("./css/live.css", "utf8");
const js = readFileSync("./js/live.js", "utf8");
const dom = new JSDOM(html, { url: "http://localhost/live.html" });
const doc = dom.window.document;

let pass = 0;
const ok = (n, f) => {
  try { f(); pass++; console.log(`PASS  ${n}`); }
  catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; }
};

/* ---------------- the pre-conversation path ---------------- */

ok("there are exactly three states", () => {
  const ids = ["screenReady", "screenLive", "screenEnded"];
  for (const id of ids) assert.ok(doc.getElementById(id), `${id} missing`);
  assert.equal(doc.querySelectorAll(".screen").length, 3);
});

ok("before starting there are only two decisions", () => {
  const ready = doc.getElementById("screenReady");
  const buttons = [...ready.querySelectorAll("button")];
  const controls = buttons.filter((b) => !b.hidden);
  // two camera segments + one start button
  assert.equal(controls.length, 3, `found ${controls.length} controls: ${controls.map((b) => b.textContent.trim()).join(" | ")}`);
  assert.equal(ready.querySelectorAll(".seg").length, 2, "expected front/back segments");
  assert.ok(doc.getElementById("startBtn"), "start button missing");
});

ok("camera choice is front/back and defaults to front", () => {
  const segs = [...doc.querySelectorAll(".seg")];
  assert.deepEqual(segs.map((s) => s.dataset.facing).sort(), ["environment", "user"]);
  assert.ok(segs.find((s) => s.dataset.facing === "user").classList.contains("is-on"));
});

ok("the camera can be changed mid-session without a menu", () => {
  assert.ok(doc.getElementById("cameraBtn"), "in-session camera switch missing");
  assert.match(js, /cameraBtn\.addEventListener/);
});

ok("there is exactly one way out of the session", () => {
  const live = doc.getElementById("screenLive");
  const danger = [...live.querySelectorAll("button")].filter((b) => b.classList.contains("danger"));
  assert.equal(danger.length, 1);
  assert.equal(danger[0].id, "endBtn");
});

/* ---------------- the two directions ---------------- */

ok("both sides of the conversation are on screen at once", () => {
  assert.ok(doc.querySelector(".side.patient"), "patient side missing");
  assert.ok(doc.querySelector(".side.clinician"), "clinician side missing");
});

ok("the ASL panel states plainly that no clip is connected", () => {
  const note = doc.getElementById("aslNote");
  assert.ok(note, "ASL note missing");
  assert.match(note.textContent, /not connected/i);
});

ok("the app admits it for unsupported speech rather than guessing", () => {
  assert.match(js, /No ASL output for that phrase/);
  assert.match(js, /outside the supported set/);
});

ok("a patient response can come from signing or from selection", () => {
  assert.match(js, /Read from signing/);
  assert.match(js, /Selected by patient/);
});

ok("every response has a spoken form for audio playback", () => {
  for (const r of PATIENT_RESPONSES) {
    assert.ok(r.spoken && r.spoken.length > 0, `${r.id} has no spoken form`);
  }
  assert.match(js, /SpeechSynthesisUtterance/);
});

/* ---------------- phrase matching ---------------- */

ok("a supported question matches its phrase", () => {
  const m = matchClinicianPhrase("Where does it hurt?");
  assert.ok(m, "no match");
  assert.equal(m.id, "where_hurts");
});

ok("everyday paraphrases still match", () => {
  const cases = [
    ["where's the pain", "where_hurts"],
    ["when did it start", "how_long"],
    ["do you have a temperature", "fever"],
    ["are you on any medication", "medication"],
    ["any allergies", "allergies"],
  ];
  for (const [said, expected] of cases) {
    const m = matchClinicianPhrase(said);
    assert.ok(m, `"${said}" did not match`);
    assert.equal(m.id, expected, `"${said}" matched ${m.id}`);
  }
});

ok("unrelated speech is refused, not forced onto a phrase", () => {
  const outOfScope = [
    "I am going to prescribe antibiotics",
    "let me check your blood pressure",
    "you will need a blood test",
    // Contains "where", a keyword of where_hurts. A lone generic question
    // word must not be enough to put a clinical question on screen.
    "where is the bathroom",
    "hello",
    "",
  ];
  for (const said of outOfScope) {
    assert.equal(matchClinicianPhrase(said), null, `"${said}" should not match`);
  }
});

ok("matching does not depend on punctuation or case", () => {
  assert.ok(matchClinicianPhrase("WHERE DOES IT HURT"));
  assert.ok(matchClinicianPhrase("where does it hurt"));
});

ok("the supported set is a stated, closed list", () => {
  assert.ok(CLINICIAN_PHRASES.length >= 10 && CLINICIAN_PHRASES.length <= 20,
    `${CLINICIAN_PHRASES.length} phrases — the MVP calls for roughly 15-20`);
  for (const p of CLINICIAN_PHRASES) {
    assert.ok(p.id && p.text && p.keywords.length, `${p.id} incomplete`);
  }
});

/* ---------------- honesty in the copy ---------------- */

ok("the build is labelled a demonstration", () => {
  assert.match(html, /Demonstration build/i);
});

ok("it makes no accuracy claim", () => {
  assert.ok(!/\b\d{1,3}(\.\d+)?%\s*(accurate|accuracy)/i.test(html), "accuracy figure found in UI");
  assert.ok(!/\bverified|validated by\b/i.test(html), "validation claim found in UI");
});

ok("the interpreter boundary is stated where it belongs", () => {
  assert.match(html, /interpreter/i);
});

ok("no AI-completion language that implies free signing", () => {
  assert.ok(!/understands?\s+any\s+sign/i.test(html + js));
  assert.ok(!/fully\s+translate/i.test(html + js));
});

/* ---------------- layout guards ---------------- */

ok("the two-panel layout collapses for a phone", () => {
  assert.match(css, /\.live-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(min-width: 900px\)[\s\S]{0,120}grid-template-columns:\s*1fr 1fr/);
});

ok("reduced motion is respected", () => {
  assert.match(css, /prefers-reduced-motion/);
});

console.log(`\n${pass} passed`);
