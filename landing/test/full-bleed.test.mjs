// Guards against the side gutter that showed as a margin next to the dark
// sections: a reserved scrollbar groove painted with the body colour.

import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./index.html", "utf8");
const css = html.slice(html.indexOf("<style>") + 7, html.indexOf("</style>"));

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

ok("no scrollbar groove can reserve space", () => {
  assert.match(css, /scrollbar-width:\s*none/, "Firefox rule missing");
  assert.match(css, /::-webkit-scrollbar\s*\{[^}]*width:\s*0/, "WebKit rule missing");
});

ok("horizontal overflow is clipped, not scrolled", () => {
  assert.match(css, /overflow-x:\s*clip/);
  assert.ok(!/overflow-x:\s*hidden/.test(css), "overflow-x:hidden forces overflow-y:auto and breaks sticky");
});

ok("body cannot be a scroll container", () => {
  // overflow-x: hidden on body computes overflow-y to auto -> body scrolls,
  // Lenis and the sticky cards stop working.
  const bodyBlock = css.slice(css.indexOf("body {"), css.indexOf("}", css.indexOf("body {")));
  assert.ok(!/overflow-x:\s*hidden/.test(bodyBlock));
});

ok("dark sections are explicitly full width", () => {
  assert.match(css, /\.stack-section,[\s\S]{0,200}?#contact,[\s\S]{0,80}?\{[^}]*width:\s*100%/);
});

ok("html and body have no default margin or padding", () => {
  for (const sel of ["html {", "body {"]) {
    const block = css.slice(css.indexOf(sel), css.indexOf("}", css.indexOf(sel)));
    assert.match(block, /margin:\s*0/);
    assert.match(block, /padding:\s*0/);
  }
});

console.log(`\n${pass} passed`);
