// The menu button was inert: a styled <div> with no handler. This checks the
// toggle actually opens and closes the panel.

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./index.html", "utf8");
const dom = new JSDOM(html, { pretendToBeVisual: true });
const { window } = dom;
const { document } = window;

// Grab the menu logic out of the page and run it against this DOM.
const script = [...document.querySelectorAll("script")].map((s) => s.textContent).join("\n");
const start = script.indexOf("// --- Mobile menu ---");
const end = script.indexOf("// Smooth-scroll the in-page links");
const block = script.slice(start, end);
window.lenis = { stop() {}, start() {}, scrollTo() {} };
new Function("document", "window", "requestAnimationFrame", "setTimeout", block)(
  document, window, (fn) => fn(), (fn) => fn()
);

const toggle = document.getElementById("menuToggle");
const menu = document.getElementById("mobileMenu");
const label = document.getElementById("menuLabel");

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

ok("toggle is a real button, not a div", () => {
  assert.equal(toggle.tagName, "BUTTON");
  assert.equal(toggle.getAttribute("type"), "button");
});

ok("menu exists and starts hidden", () => {
  assert.ok(menu, "menu panel missing");
  assert.equal(menu.hasAttribute("hidden"), true);
});

ok("menu sits outside <nav> so blending cannot tint it", () => {
  const nav = document.querySelector("nav");
  assert.equal(nav.contains(menu), false);
});

ok("opens on click", () => {
  toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(menu.hasAttribute("hidden"), false);
  assert.equal(label.textContent, "CLOSE");
});

ok("closes on second click", () => {
  toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(label.textContent, "MENU");
});

ok("closes with Escape", () => {
  toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape" }));
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
});

ok("closes when a link is chosen", () => {
  toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
  menu.querySelector("a").dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
});

ok("every nav destination is in the menu", () => {
  const hrefs = [...menu.querySelectorAll("a")].map((a) => a.getAttribute("href"));
  for (const h of ["#services", "#how", "#pricing", "#contact"]) {
    assert.ok(hrefs.includes(h), `${h} missing`);
  }
});

console.log(`\n${pass} passed`);
