// Guards the narrow-layout regression: in a short viewport the two panels are
// stacked as grid rows that shrink below their content, so the patient panel's
// answer buttons rendered on top of the clinician panel's "Finish" button.
//
// jsdom cannot do layout, so this asserts the CSS and headers that prevent it
// rather than measuring boxes. It is a guard, not a rendering test.

import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const css = readFileSync("./css/app.css", "utf8");
const server = readFileSync("./server.mjs", "utf8");
const html = readFileSync("./index.html", "utf8");

let pass = 0;
const ok = (name, fn) => {
  try {
    fn();
    pass++;
    console.log(`PASS  ${name}`);
  } catch (err) {
    console.log(`FAIL  ${name}  — ${err.message}`);
    process.exitCode = 1;
  }
};

const narrow = css.slice(css.indexOf("@media (max-width: 980px)"));

ok("narrow layout sizes rows to content", () => {
  assert.match(narrow, /grid-auto-rows:\s*min-content/);
});

ok("narrow layout scrolls instead of overflowing", () => {
  const block = narrow.slice(0, narrow.indexOf("@media (max-width: 700px)"));
  assert.match(block, /overflow-y:\s*auto/);
});

ok("narrow layout lets panels grow past the viewport", () => {
  const block = narrow.slice(0, narrow.indexOf("@media (max-width: 700px)"));
  assert.match(block, /\.panel\s*\{\s*min-height:\s*auto/);
});

ok("stage can scroll when content is taller than the screen", () => {
  const stage = css.slice(css.indexOf(".stage {"), css.indexOf(".panel {"));
  assert.match(stage, /overflow:\s*auto/);
});

ok("camera is height-capped so answers stay reachable", () => {
  assert.match(narrow, /max-height:\s*46vh/);
});

ok("tap mode collapses the empty camera box", () => {
  assert.match(css, /\.patient\.tap-mode \.camera-wrap\s*\{[^}]*flex:\s*0 0 auto/);
});

ok("HTML and JS are never cached by the demo server", () => {
  assert.match(server, /no-store/);
  assert.doesNotMatch(server, /"no-cache"/);
});

ok("script tag is versioned so a reload cannot serve stale code", () => {
  assert.match(html, /app\.js\?v=/);
});

ok("a visible build tag exists for verifying the running version", () => {
  assert.match(html, /build-tag/);
});

console.log(`\n${pass} passed`);
