// The waitlist dialog.
//
// Two things matter here beyond "a form appears": it has to use the same
// frosted material as the mobile menu, and it has to work on a static host
// where there is no server to receive the answers.

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./index.html", "utf8");
const css = html.slice(html.indexOf("<style>") + 7, html.indexOf("</style>"));
const dom = new JSDOM(html, { url: "http://localhost/", pretendToBeVisual: true });
const { document } = dom.window;

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

const waitlist = document.getElementById("waitlist");
const form = document.getElementById("waitlistForm");
const formView = document.getElementById("waitlistFormView");
const done = document.getElementById("waitlistDone");
const scrollBox = waitlist.querySelector(".wl-scroll");

// --- markup and material (no script needed) ---

ok("the dialog starts hidden and announces itself as a modal", () => {
  assert.ok(waitlist, "no #waitlist");
  assert.equal(waitlist.hasAttribute("hidden"), true);
  assert.equal(waitlist.getAttribute("role"), "dialog");
  assert.equal(waitlist.getAttribute("aria-modal"), "true");
  const label = waitlist.getAttribute("aria-labelledby");
  assert.ok(document.getElementById(label), "aria-labelledby points at nothing");
});

ok("the backdrop is translucent, not a blackout", () => {
  const block = css.slice(css.indexOf(".wl-overlay {"), css.indexOf("}", css.indexOf(".wl-overlay {")));
  const m = block.match(/background:\s*rgba\(\s*\d+,\s*\d+,\s*\d+,\s*([\d.]+)\s*\)/);
  assert.ok(m, "no rgba background on the overlay");
  assert.ok(parseFloat(m[1]) < 0.8, `alpha ${m[1]} is effectively opaque`);
});

ok("the backdrop blurs the page, with the Safari prefix", () => {
  const block = css.slice(css.indexOf(".wl-overlay {"), css.indexOf("}", css.indexOf(".wl-overlay {")));
  assert.match(block, /backdrop-filter:\s*blur\(/);
  assert.match(block, /-webkit-backdrop-filter:\s*blur\(/);
});

ok("the panel itself is glass, not a solid sheet", () => {
  const block = css.slice(css.indexOf(".wl-panel {"), css.indexOf("}", css.indexOf(".wl-panel {")));
  const m = block.match(/background:\s*rgba\(\s*\d+,\s*\d+,\s*\d+,\s*([\d.]+)\s*\)/);
  assert.ok(m, "panel has no translucent fill");
  assert.ok(parseFloat(m[1]) < 0.9, "panel is effectively opaque");
  assert.match(block, /backdrop-filter:\s*blur\(/);
});

ok("the bar offers both calls to action", () => {
  const bar = document.querySelector(".nav-cta");
  assert.ok(bar, "no .nav-cta");
  assert.ok(bar.querySelector("[data-waitlist-open]"), "no waitlist trigger in the bar");
  const loi = bar.querySelector('a[href="loi.html"]');
  assert.ok(loi, "the second CTA must point at the LOI page");
});

ok("the mobile menu offers both too", () => {
  const menu = document.getElementById("mobileMenu");
  assert.ok(menu.querySelector("[data-waitlist-open]"), "no waitlist pill in the menu");
  assert.ok(menu.querySelector('a[href="loi.html"]'), "no LOI pill in the menu");
});

ok("the form asks the nine questions from the brief", () => {
  const expected = {
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    role: ["", "Individual", "Parent / Caregiver", "Educator", "Healthcare professional",
      "Business / Employer", "Government / Public service", "School / University",
      "Accessibility organisation", "Other"],
    needs: ["", "I am Deaf or hard of hearing", "I communicate primarily using sign language",
      "I regularly communicate with someone who uses sign language",
      "I need accessibility support for work or education",
      "I am exploring accessibility solutions for my organisation", "None of the above"],
    audience: ["", "Family and friends", "Customers or clients", "Colleagues", "Students",
      "Patients", "Employees", "Public service providers", "Other"],
    purpose: ["", "Everyday conversations", "Work and meetings", "Education and learning",
      "Healthcare", "Customer service", "Travel and public services", "Content creation", "Other"],
    interest: ["", "Very interested — I want early access", "Interested — keep me updated",
      "I want to learn more first", "Just exploring"],
  };

  for (const [name, options] of Object.entries(expected)) {
    const el = form.elements[name];
    assert.ok(el, `missing field: ${name}`);
    if (options) {
      const actual = [...el.querySelectorAll("option")].map((o) => o.value === "" ? "" : o.textContent.trim());
      assert.deepEqual(actual, options, `options differ for ${name}`);
      assert.equal(el.options[0].value, "", "the placeholder must carry an empty value");
    }
  }
});

ok("the first four fields are required text inputs", () => {
  for (const [name, type] of [["firstName", "text"], ["lastName", "text"], ["email", "email"], ["phone", "tel"]]) {
    const el = form.elements[name];
    assert.equal(el.getAttribute("type"), type);
  }
  assert.equal(form.elements.firstName.required, true);
  assert.equal(form.elements.email.required, true);
});

// --- behaviour ---

const script = [...document.querySelectorAll("script")].map((s) => s.textContent).join("\n");
const start = script.indexOf("// --- Waitlist dialog ---");
const block = script.slice(start);

const history = {
  state: null,
  pushes: 0,
  backs: 0,
  pushState(s) { this.state = s; this.pushes++; },
  replaceState(s) { this.state = s; },
  back() { this.state = null; this.backs++; },
};
const win = {
  history,
  location: { href: "" },
  addEventListener() {},
};
new Function("document", "window", "requestAnimationFrame", "setTimeout", "FormData", block)(
  document, win, (fn) => fn(), (fn) => fn(), dom.window.FormData
);

const click = (el) => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const opener = document.querySelector("[data-waitlist-open]");
const isOpen = () => waitlist.classList.contains("open") && !waitlist.hasAttribute("hidden");

ok("any hook opens it, locks the page and claims a history entry", () => {
  click(opener);
  assert.equal(isOpen(), true);
  assert.equal(document.body.classList.contains("wl-open"), true);
  assert.deepEqual(history.state, { unmuteWaitlist: true });
});

ok("Escape closes it", () => {
  document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape" }));
  assert.equal(isOpen(), false);
  assert.equal(document.body.classList.contains("wl-open"), false);
});

ok("clicking the blur closes it, clicking the panel does not", () => {
  click(opener);
  click(waitlist.querySelector(".wl-panel"));
  assert.equal(isOpen(), true, "a click inside the form must not dismiss it");
  click(waitlist);
  assert.equal(isOpen(), false);
});

ok("closing unwinds the history entry", () => {
  click(opener);
  const before = history.backs;
  document.querySelector("#waitlist .wl-close").dispatchEvent(
    new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })
  );
  assert.equal(isOpen(), false);
  assert.equal(history.backs, before + 1, "history entry was left behind");
});

const fill = (name, value) => { form.elements[name].value = value; };

function completeForm() {
  fill("firstName", "Ada");
  fill("lastName", "Okafor");
  fill("email", "ada@example.com");
  fill("phone", "+234 800 000 0000");
  fill("role", "Healthcare professional");
  fill("needs", "I regularly communicate with someone who uses sign language");
  fill("audience", "Patients");
  fill("purpose", "Healthcare");
  fill("interest", "Very interested — I want early access");
}

ok("submitting confirms in place and never hijacks the tab", () => {
  click(opener);
  completeForm();
  form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));

  // Assigning window.location.href to a mailto: used to fire here. With no
  // mail handler registered the browser does nothing and the dialog looks
  // frozen, so navigation must not happen on its own.
  assert.equal(win.location.href, "", "the page navigated away on submit");

  const link = document.getElementById("waitlistMailto");
  assert.ok(link.href.startsWith("mailto:contact@liveunmute.com?subject="), link.href);
  const decoded = decodeURIComponent(link.href);
  for (const phrase of ["Ada Okafor", "ada@example.com", "Patients", "Healthcare", "Very interested"]) {
    assert.ok(decoded.includes(phrase), `email body is missing "${phrase}"`);
  }

  assert.equal(formView.hasAttribute("hidden"), true, "the form should step aside");
  assert.equal(done.hasAttribute("hidden"), false, "no confirmation shown");
  assert.equal(link.parentElement.hidden, false, "the send link should be visible");
  assert.equal(scrollBox.scrollTop, 0);
});

ok("reopening after a signup gives a clean form again", () => {
  click(document.querySelector("#waitlist .wl-close"));
  assert.equal(done.hasAttribute("hidden"), true);
  assert.equal(formView.hasAttribute("hidden"), false);
  assert.equal(form.elements.firstName.value, "", "stale answers survived");
});

console.log(`\n${pass} passed`);
