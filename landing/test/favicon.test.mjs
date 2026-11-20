// The tab icon is served but was never declared the way browsers look for it:
// there was no /favicon.ico, which is what a browser requests implicitly.

import { readFileSync, existsSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./index.html", "utf8");
const head = html.slice(0, html.indexOf("</head>"));

const pngSize = (buf) => [buf.readUInt32BE(16), buf.readUInt32BE(20)];

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

ok("/favicon.ico exists at the site root", () => {
  assert.ok(existsSync("./favicon.ico"), "browser default request would 404");
});

ok("the .ico carries several sizes", () => {
  const buf = readFileSync("./favicon.ico");
  assert.equal(buf.readUInt16LE(0), 0, "not an ICO");
  assert.equal(buf.readUInt16LE(2), 1, "not an ICO");
  const count = buf.readUInt16LE(4);
  assert.ok(count >= 2, `only ${count} image(s) in the ico`);
});

ok("the icon is declared in <head>", () => {
  assert.match(head, /<link rel="icon" href="\/favicon\.ico"/);
});

ok("a 32px PNG is offered for crisp tab rendering", () => {
  assert.match(head, /favicon-32\.png/);
  const [w, h] = pngSize(readFileSync("./assets/img/favicon-32.png"));
  assert.deepEqual([w, h], [32, 32]);
});

ok("the apple touch icon is 180x180 and opaque", () => {
  assert.match(head, /rel="apple-touch-icon"/);
  const buf = readFileSync("./assets/img/apple-touch-icon.png");
  const [w, h] = pngSize(buf);
  assert.deepEqual([w, h], [180, 180]);
  // PNG colour type byte: 2 = truecolour (no alpha). iOS fills alpha with black.
  assert.equal(buf[25], 2, "touch icon has an alpha channel");
});

ok("theme colour is declared for mobile browser chrome", () => {
  assert.match(head, /<meta name="theme-color"/);
});

console.log(`\n${pass} passed`);
