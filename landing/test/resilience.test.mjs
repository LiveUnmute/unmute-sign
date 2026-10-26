// Resilience: the page must survive a dependency that never arrives.
//
// The landing page loads GSAP, ScrollTrigger and Lenis from public CDNs. A
// blocked or slow CDN used to throw on the first line of the script, which
// killed the entire block: no menu, no waitlist, and — because the loader is an
// opaque full-screen sheet that only JS could move — a black page that ignored
// every click. These checks pin down the three independent safety nets.

import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { strict as assert } from "node:assert";

const html = readFileSync("./index.html", "utf8");
const css = html.slice(html.indexOf("<style>") + 7, html.indexOf("</style>"));
const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

ok("the page is visible without waiting for any script", () => {
  const body = css.slice(css.indexOf("body {"), css.indexOf("}", css.indexOf("body {")));
  assert.match(body, /opacity:\s*1/, "body must not start invisible");
  assert.ok(!/opacity:\s*0\b/.test(body), "an invisible body depends on JS to appear");
});

ok("the loader clears itself with CSS if JS never runs", () => {
  const loader = css.slice(css.indexOf(".loader {"), css.indexOf("}", css.indexOf(".loader {")));
  assert.match(loader, /animation:\s*loader-escape/, "no CSS fail-safe on the loader");
  const keyframes = css.slice(css.indexOf("@keyframes loader-escape"));
  assert.match(keyframes, /translateY\(-100%\)/);
  assert.match(keyframes, /visibility:\s*hidden/, "the escaped loader could still swallow clicks");
});

ok("animation libraries are checked before use", () => {
  assert.match(script, /const HAS_ANIM = !!\(window\.gsap && window\.ScrollTrigger\)/);
  assert.match(script, /const HAS_SMOOTH_SCROLL = !!window\.Lenis/);
  // registerPlugin used to be the first statement, so a missing gsap threw
  // before anything else could be set up.
  assert.ok(!/^\s*gsap\.registerPlugin/m.test(script), "unguarded registerPlugin at the top");
  assert.match(script, /if \(HAS_ANIM\) window\.gsap\.registerPlugin/);
});

ok("a missing library still reveals the page", () => {
  assert.match(script, /}\s*else\s*\{[\s\S]{0,200}revealSite\(\);/, "no no-anim reveal path");
  assert.match(html, /classList\.add\('no-anim'\)/);
  assert.match(css, /html\.no-anim \.hero-text span/);
  assert.match(css, /html\.no-anim \.word-inner/);
});

ok("a stalled timeline still reveals the page", () => {
  assert.match(script, /setTimeout\(revealSite,\s*\d{4}\)/, "no timeout fallback");
});

ok("revealing twice is harmless", () => {
  assert.match(script, /function revealSite\(\)\s*\{[\s\S]{0,120}if \(siteRevealed\) return;/);
});

ok("smooth scrolling degrades to the browser's own", () => {
  assert.match(script, /else target\.scrollIntoView\(\{ behavior: 'smooth'/);
});

ok("the script parses with the libraries absent", () => {
  // A parse error would take the menu and the waitlist down with it.
  new Function(script);
});

ok("the menu and waitlist do not depend on the animation libraries", () => {
  // Any line that touches lenis must also carry the existence check. A bare
  // `if (lenis)` would throw when the binding is absent entirely.
  const tail = script.slice(script.indexOf("// --- Mobile menu ---"));
  assert.ok(!/\bgsap\./.test(tail), "the menu block calls gsap directly");

  const offenders = tail
    .split("\n")
    .filter((line) => /\blenis\b/.test(line))
    .filter((line) => !/typeof lenis !== 'undefined'/.test(line));
  assert.deepEqual(offenders, [], `unguarded lenis use: ${offenders.join(" | ")}`);
});

ok("reduced-motion users get no loader animation and no nav delay", () => {
  const rm = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(rm, /\.loader\s*\{\s*animation:\s*none/);
});

const dom = new JSDOM(html, { url: "http://localhost/" });

ok("the footer navigation is present to carry the links", () => {
  const nav = dom.window.document.querySelector(".footer-nav");
  assert.ok(nav, "no footer navigation");
  assert.equal(nav.querySelectorAll("a").length, 4);
});

ok("the footer navigation is revealed without GSAP", () => {
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /nav\.classList\.add\('is-in'\)/);
  const rule = css.slice(css.indexOf(".footer-sticky .footer-nav a {"));
  assert.match(rule, /font-weight:\s*700/, "the links should carry more weight");
});

ok("the wordmark is thickened rather than resampled", () => {
  const logo = css.slice(css.indexOf(".nav-logo {"), css.indexOf("}", css.indexOf(".nav-logo {")));
  assert.match(logo, /drop-shadow/, "no weight added to the wordmark");
  assert.match(logo, /height:\s*26px/, "the logo should not have been resized");
});

console.log(`\n${pass} passed`);
