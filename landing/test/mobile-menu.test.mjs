// The menu button was inert: a styled <div> with no handler. These checks cover
// the toggle, and the history handling that keeps the phone's Back button from
// leaving the site.

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./index.html", "utf8");
const dom = new JSDOM(html, { url: "http://localhost/", pretendToBeVisual: true });
const { document } = dom.window;

const script = [...document.querySelectorAll("script")].map((s) => s.textContent).join("\n");
const start = script.indexOf("// --- Mobile menu ---");
const end = script.indexOf("// Smooth-scroll the in-page links");
const block = script.slice(start, end);

// Deterministic stand-ins so the history contract can be asserted directly.
const history = {
  state: null,
  pushes: 0,
  backs: 0,
  pushState(s) { this.state = s; this.pushes++; },
  replaceState(s) { this.state = s; },
  back() { this.state = null; this.backs++; },
};
const listeners = {};
const win = {
  history,
  lenis: { stop() {}, start() {}, scrollTo() {} },
  addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
  emit(type) { (listeners[type] || []).forEach((fn) => fn({ type })); },
};

new Function("document", "window", "requestAnimationFrame", "setTimeout", block)(
  document, win, (fn) => fn(), (fn) => fn()
);

const toggle = document.getElementById("menuToggle");
const menu = document.getElementById("mobileMenu");
const label = document.getElementById("menuLabel");
const click = (el) => el.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

ok("toggle is a real button, not a div", () => {
  assert.equal(toggle.tagName, "BUTTON");
  assert.equal(toggle.getAttribute("type"), "button");
});

ok("menu exists, starts hidden, and sits outside <nav>", () => {
  assert.ok(menu, "menu panel missing");
  assert.equal(menu.hasAttribute("hidden"), true);
  assert.equal(document.querySelector("nav").contains(menu), false, "blend mode would tint it");
});

ok("opens on click and claims a history entry", () => {
  click(toggle);
  assert.equal(isOpen(), true);
  assert.equal(menu.hasAttribute("hidden"), false);
  assert.equal(label.textContent, "CLOSE");
  assert.deepEqual(history.state, { unmuteMenu: true });
});

ok("the phone's Back button closes the menu, not the site", () => {
  // Back pops our entry; the state is no longer ours, then popstate fires.
  history.state = null;
  win.emit("popstate");
  assert.equal(isOpen(), false);
  assert.equal(label.textContent, "MENU");
  assert.ok(document.body, "still on the page");
});

ok("closing with the toggle unwinds the history entry", () => {
  const before = history.backs;
  click(toggle);                    // open -> pushes
  assert.equal(isOpen(), true);
  click(toggle);                    // close -> should call back()
  assert.equal(isOpen(), false);
  assert.equal(history.backs, before + 1, "history entry was left behind");
});

ok("closes with Escape", () => {
  click(toggle);
  document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape" }));
  assert.equal(isOpen(), false);
});

ok("a link closes the menu without leaving a stale entry", () => {
  click(toggle);
  const before = history.backs;
  click(menu.querySelector("a"));
  assert.equal(isOpen(), false);
  assert.equal(history.state, null, "menu entry still active");
  assert.equal(history.backs, before, "should replace, not unwind, before a hash nav");
});

ok("every nav destination is in the menu", () => {
  const hrefs = [...menu.querySelectorAll("a")].map((a) => a.getAttribute("href"));
  for (const h of ["#services", "#how", "#pricing", "#contact"]) {
    assert.ok(hrefs.includes(h), `${h} missing`);
  }
});

console.log(`\n${pass} passed`);
