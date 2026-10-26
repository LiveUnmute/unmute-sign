// The desktop navigation bar.
//
// It is a floating glass pill: logo left, links centred, two calls to action
// right. The failure this guards against is the one that prompted the rework —
// a narrow window silently collapsing everything into the hamburger.

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./index.html", "utf8");
const css = html.slice(html.indexOf("<style>") + 7, html.indexOf("</style>"));
const dom = new JSDOM(html, { url: "http://localhost/" });
const { document } = dom.window;

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

// Find a top-level rule by name. A plain indexOf would also match the
// descendant forms (`body.menu-open .nav-inner`), so the rule has to start a
// line of its own.
const ruleFor = (selector) => {
  let at = -1;
  while ((at = css.indexOf(selector, at + 1)) !== -1) {
    if (at === 0 || css[at - 1] === "\n") {
      return css.slice(at, css.indexOf("}", at));
    }
  }
  return "";
};

// Reads one declaration's value out of a rule block. A plain regex is no good
// here: `border-radius:\s*(?!0)` backtracks \s* to zero width and matches.
const declValue = (block, prop) => {
  const m = block.match(new RegExp(`(?:^|[\\s;{])${prop}:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
};

ok("there is no panel around the nav — only the contents", () => {
  // The rounded glass wrapper was removed by request. Nothing should paint a
  // background, border, radius, blur or shadow behind the row.
  const inner = ruleFor(".nav-inner {");
  assert.ok(inner, "no .nav-inner rule");

  assert.ok(["none", "0", "transparent"].includes(declValue(inner, "background")), "still painting a fill");
  assert.ok(["none", "0", "transparent"].includes(declValue(inner, "border-radius")), "the row is still rounded");
  assert.ok(["none", "0"].includes(declValue(inner, "box-shadow")), "still casting a shadow");
  assert.ok(["0", "none", "0px"].includes(declValue(inner, "border")), "still drawing a border");
  assert.equal(declValue(inner, "backdrop-filter"), null, "still blurred");
});

ok("the row keeps its width and spacing, so nothing moved", () => {
  const inner = ruleFor(".nav-inner {");
  assert.match(inner, /max-width:\s*1400px/);
  assert.match(inner, /margin:\s*0 auto/);
  assert.match(inner, /justify-content:\s*space-between/);
  assert.match(inner, /padding:\s*0\.45rem 0\.5rem 0\.45rem 1\.1rem/);
});

ok("the whole desktop bar shows from 768px, not 1024px", () => {
  // This is the regression: at 1024 the pills vanished on a narrower desktop
  // window and only the hamburger remained.
  const m = css.match(/@media \(min-width: 768px\) \{([\s\S]*?)\n\}/);
  assert.ok(m, "no 768px block");
  assert.match(m[1], /\.nav-cta\s*\{\s*display:\s*flex/);
  assert.ok(!/@media \(min-width: 1024px\)/.test(css), "the old 1024px gate is still present");
});

ok("the hamburger is hidden at the same width the links appear", () => {
  // Tailwind's `md:` on the toggle must agree with the 768px CSS block, or a
  // window width ends up with neither control.
  const toggle = document.getElementById("menuToggle");
  assert.ok(toggle.className.includes("md:hidden"), "toggle must hide at md");
  assert.ok(!toggle.className.includes("lg:hidden"), "toggle still hides at lg");
});

ok("the bar holds only the logo and the two calls to action", () => {
  // Platform / How It Works / For Hospitals / Contact were removed by request;
  // navigation now lives in the footer row below "Get in Touch".
  const bar = document.querySelector(".nav-inner");
  assert.ok(bar, "no .nav-inner");

  const links = [...bar.querySelectorAll("a")].filter((a) => a.getAttribute("href") === "#services");
  assert.equal(links.length, 0, "in-page link row is still in the bar");
  assert.equal(bar.querySelector(".nav-links"), null, ".nav-links still present");
  assert.equal(css.includes(".nav-links"), false, "dead CSS for the removed row");

  const kids = [...bar.children].map((el) => el.className);
  assert.ok(kids[0].includes("nav-blend"), "logo should come first");
  assert.ok(kids.some((c) => c.includes("nav-cta")), "no call-to-action row");
});

ok("the footer still carries the removed links", () => {
  // They were moved in effect, not deleted: the footer row is now the
  // navigation on desktop.
  const nav = document.querySelector(".footer-nav");
  assert.ok(nav, "no footer navigation");
  const hrefs = [...nav.querySelectorAll("a")].map((a) => a.getAttribute("href"));
  for (const h of ["#services", "#how", "#pricing"]) {
    assert.ok(hrefs.includes(h), `footer lost ${h}`);
  }
  assert.ok(hrefs.some((h) => h.startsWith("mailto:")), "footer lost the contact link");
});

ok("both calls to action live in the bar", () => {
  const cta = document.querySelector(".nav-inner .nav-cta");
  assert.ok(cta.querySelector("[data-waitlist-open]"), "waitlist trigger missing");
  assert.ok(cta.querySelector('a[href="loi.html"]'), "LOI link missing");
});

ok("the pills are solid so they survive both the dark hero and the pale body", () => {
  const primary = ruleFor(".cta-pill--primary {");
  const secondary = ruleFor(".cta-pill--secondary {");
  assert.match(primary, /background:\s*#fff/);
  assert.match(secondary, /background:\s*rgba\(18,\s*18,\s*18/);
});

ok("the logo blend is individual, so the accent pill is not inverted", () => {
  // mix-blend-difference on the whole bar would turn the blue pill orange.
  assert.ok(!/(?:^|\n)\.nav-inner\s*\{[^}]*mix-blend-mode/.test(css), "the bar itself must not blend");
  assert.match(ruleFor(".nav-blend {"), /mix-blend-mode:\s*difference/);
});

ok("the bar floats above the page content", () => {
  assert.match(ruleFor(".nav-shell {"), /position:\s*fixed/);
  assert.match(ruleFor(".nav-shell {"), /z-index:\s*50/);
});

ok("nothing in the bar can overflow the screen", () => {
  assert.match(ruleFor(".nav-cta {"), /flex-shrink:\s*0/);
  assert.match(ruleFor(".cta-pill {"), /white-space:\s*nowrap/);
});

console.log(`\n${pass} passed`);
