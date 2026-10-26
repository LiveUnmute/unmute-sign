// Mobile chrome: the contact button, the full-screen footer reveal, and the
// translucent menu backdrop.

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./index.html", "utf8");
const css = html.slice(html.indexOf("<style>") + 7, html.indexOf("</style>"));

// There are several max-width:768px blocks; collect them all rather than
// assuming the first (card layout) or last (footer) is the one under test.
const mobileBlocks = [];
for (let i = css.indexOf("@media (max-width: 768px)"); i !== -1; i = css.indexOf("@media (max-width: 768px)", i + 1)) {
  mobileBlocks.push(css.slice(i, css.indexOf("\n}\n", i) + 3));
}

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

ok("contact button no longer relies on a tracked utility class", () => {
  const a = html.slice(html.indexOf('class="contact-cta"') - 200, html.indexOf('class="contact-cta"') + 40);
  assert.match(a, /href="mailto:contact@liveunmute\.com"/);
  assert.ok(!/tracking-\[0\.3em\]/.test(a), "utility would override the mobile size");
});

ok("contact button cannot spill past the screen edge", () => {
  const block = css.slice(css.indexOf(".contact-cta {"), css.indexOf("}", css.indexOf(".contact-cta {")));
  assert.match(block, /display:\s*inline-block/, "must hug its text, not stretch full width");
  assert.match(block, /max-width:\s*100%/);
  assert.match(block, /white-space:\s*nowrap/);
});

ok("contact button steps down in size on a phone", () => {
  const block = mobileBlocks.find((b) => b.includes(".contact-cta"));
  assert.ok(block, "no mobile rule for .contact-cta");
  const rule = block.slice(block.indexOf(".contact-cta {"));
  assert.match(rule, /font-size:\s*0\.7rem/);
  assert.match(rule, /letter-spacing:\s*0\.16em/);
});

ok("footer is pinned and one screen tall on mobile again", () => {
  const block = mobileBlocks.find((b) => b.includes(".footer-sticky"));
  assert.ok(block, "no mobile rule for .footer-sticky");
  assert.match(block, /\.wrapper\s*\{[^}]*margin-bottom:\s*100svh/);
  assert.match(block, /\.footer-sticky\s*\{[^}]*height:\s*100svh/);
  assert.ok(!/position:\s*relative/.test(block), "footer must stay fixed for the reveal");
});

ok("the footer link row is hidden on mobile", () => {
  const block = mobileBlocks.find((b) => b.includes(".footer-nav"));
  assert.ok(block, "rule missing");
  // A bare .footer-nav ties with Tailwind's .flex utility, which is injected
  // after this stylesheet and therefore wins. The selector must outrank it.
  assert.match(
    block,
    /\.footer-sticky\s+\.footer-nav\s*\{\s*display:\s*none/,
    "single-class selector loses the cascade to .flex"
  );
  assert.match(html, /class="footer-nav flex/, "hook missing from markup");
});

ok("the footer call to action is hero-sized on mobile", () => {
  // Anchor on the mailto so this cannot accidentally match a hero headline.
  const m = html.match(/href="mailto:contact@liveunmute\.com" class="display text-\[(\d+(?:\.\d+)?)vw\]/);
  assert.ok(m, "footer CTA sizing class not found");
  assert.ok(parseFloat(m[1]) >= 8, `only ${m[1]}vw — too small next to the desktop 7vw`);
  assert.match(html, /whitespace-nowrap/, "must not wrap at this size");
});

ok("menu backdrop is translucent, not opaque", () => {
  const block = css.slice(css.indexOf(".mobile-menu {"), css.indexOf("}", css.indexOf(".mobile-menu {")));
  const m = block.match(/background:\s*rgba\(\s*\d+,\s*\d+,\s*\d+,\s*([\d.]+)\s*\)/);
  assert.ok(m, "no rgba background");
  const alpha = parseFloat(m[1]);
  assert.ok(alpha < 0.8, `alpha ${alpha} is effectively opaque`);
});

ok("the CLOSE button stays above the overlay", () => {
  // The bar is .nav-shell now that it floats as a pill; the rule that lifts it
  // above the menu panel has to follow it there.
  assert.match(css, /body\.menu-open \.nav-shell\s*\{[^}]*z-index:\s*70/);
  const menuZ = Number((css.slice(css.indexOf(".mobile-menu {")).match(/z-index:\s*(\d+)/) || [])[1]);
  assert.ok(70 > (menuZ || 0), "nav must outrank the panel or the button is unreachable");
});

ok("menu backdrop blurs what is behind it", () => {
  const block = css.slice(css.indexOf(".mobile-menu {"), css.indexOf("}", css.indexOf(".mobile-menu {")));
  assert.match(block, /backdrop-filter:\s*blur\(/);
  assert.match(block, /-webkit-backdrop-filter:\s*blur\(/, "Safari needs the prefixed form");
});

ok("the page script parses", () => {
  const dom = new JSDOM(html, { url: "http://localhost/" });
  const script = [...dom.window.document.querySelectorAll("script")].map((s) => s.textContent).join("\n");
  new Function(script);   // throws on a syntax error
});

console.log(`\n${pass} passed`);
