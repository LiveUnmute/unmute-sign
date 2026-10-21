// Guards the mobile card layout. jsdom cannot do layout, so this checks the
// structure and the CSS contract that produces it.

import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./index.html", "utf8");
const css = html.slice(html.indexOf("<style>"), html.indexOf("</style>"));
const mobile = css.slice(css.indexOf("@media (max-width: 768px)"));
const firstMobileBlock = mobile.slice(0, mobile.indexOf("@media (max-width: 768px) and"));

let pass = 0;
const ok = (name, fn) => {
  try { fn(); pass++; console.log(`PASS  ${name}`); }
  catch (e) { console.log(`FAIL  ${name}  — ${e.message}`); process.exitCode = 1; }
};

ok("every card has head, description, image and action", () => {
  const cards = html.split('<div class="card-inner">').slice(1);
  assert.equal(cards.length, 3, "expected 3 cards");
  for (const c of cards) {
    const body = c.split("</div>\n      </div>")[0];
    assert.match(body, /card-head/);
    assert.match(body, /card-desc/);
    assert.match(body, /card-img-wrap/);
    assert.match(body, /<button/);
  }
});

ok("content column unwraps so children can be ordered", () => {
  assert.match(firstMobileBlock, /\.card-content\s*\{[^}]*display:\s*contents/);
});

ok("heading comes before the image", () => {
  const head = firstMobileBlock.match(/\.card-head\s*\{[^}]*order:\s*(\d+)/);
  const img = firstMobileBlock.match(/\.card-img-wrap\s*\{[^}]*order:\s*(\d+)/);
  assert.ok(head && img, "both need an order");
  assert.ok(Number(head[1]) < Number(img[1]), `head ${head[1]} should precede image ${img[1]}`);
});

ok("image takes the free space, text does not", () => {
  assert.match(firstMobileBlock, /grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)\s+auto\s+auto/);
});

ok("image is no longer a fixed 40% slice", () => {
  assert.ok(!/card-img-wrap\s*\{[^}]*height:\s*40%/.test(css), "old 40% rule still present");
});

ok("image height is bounded so the card cannot overflow", () => {
  assert.match(firstMobileBlock, /max-height:\s*58vh/);
});

ok("portrait art direction is served on mobile", () => {
  const sources = [...html.matchAll(/<source media="\(max-width: 768px\)" srcset="([^"]+)"/g)];
  assert.equal(sources.length, 3, "one <source> per card");
  for (const [, path] of sources) {
    assert.ok(readFileSync(path) .length > 1000, `${path} looks empty`);
  }
});

ok("desktop still gets the landscape image", () => {
  const imgs = [...html.matchAll(/<img src="(assets\/img\/feature-[a-z-]+\.jpg)" class="card-img"/g)];
  assert.equal(imgs.length, 3);
  for (const [, path] of imgs) assert.ok(!path.includes("portrait"));
});

console.log(`\n${pass} passed`);
