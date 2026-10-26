// The letter of intent page.
//
// It is a static document, so the tests care about three things: the fields
// the brief asks for, that nothing submits half-filled, and that a completed
// letter comes out as a coherent message.

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./loi.html", "utf8");
const dom = new JSDOM(html, { url: "http://localhost/loi.html", pretendToBeVisual: true });
const { document } = dom.window;

// jsdom ships neither a canvas backend nor layout, so both are stubbed before
// the page script runs. The drawing itself is not under test here.
dom.window.Element.prototype.scrollIntoView = function () {};
dom.window.HTMLCanvasElement.prototype.getContext = function () {
  return {
    setTransform() {}, clearRect() {}, beginPath() {}, arc() {}, fill() {},
    moveTo() {}, lineTo() {}, stroke() {},
  };
};

const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
const win = { devicePixelRatio: 1, addEventListener() {}, location: { href: "" } };
new Function("document", "window", "FormData", "fetch", script)(
  document, win, dom.window.FormData, function () {}
);

let pass = 0;
const ok = (n, f) => { try { f(); pass++; console.log(`PASS  ${n}`); } catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; } };

const form = document.getElementById("loiForm");
const errors = document.getElementById("errors");
const confirmation = document.getElementById("confirmation");
const click = (el) => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const submit = () => form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));

ok("the page presents itself as a non-binding letter of intent", () => {
  assert.match(document.title, /Letter of Intent/);
  assert.match(html, /Non-binding statement of intent to evaluate and deploy Unmute/);
});

ok("it is built from the three sections in the brief", () => {
  const headings = [...document.querySelectorAll(".section > h2")].map((h) => h.textContent.trim());
  assert.deepEqual(headings, ["Organisation", "Intended Scope of Engagement", "Authorised Signatory"]);
});

ok("organisation and signatory fields carry the right names", () => {
  for (const name of ["orgName", "orgAddress", "sigName", "sigTitle", "sigEmail", "sigPhone", "country"]) {
    assert.ok(form.elements[name], `missing ${name}`);
    assert.equal(form.elements[name].required, true, `${name} must be required`);
  }
});

ok("the use-case list leads with healthcare and offers nine choices", () => {
  const cases = [...document.querySelectorAll('input[name="useCase"]')].map((i) => i.value);
  assert.equal(cases.length, 9);
  assert.equal(cases[0], "Patient–provider communication (healthcare)");
  assert.ok(cases.includes("Other"));
});

ok("deployment scale and estimated usage are both asked for", () => {
  assert.ok(form.elements.scale);
  assert.equal(form.elements.scale.required, true);
  assert.match(form.elements.scale.getAttribute("placeholder"), /sites/);
  assert.ok(form.elements.usage);
  assert.equal(form.elements.usage.options[0].value, "");
});

ok("the signature can be drawn or typed", () => {
  assert.equal(document.getElementById("tabDraw").getAttribute("aria-selected"), "true");
  assert.equal(document.getElementById("tabType").getAttribute("aria-selected"), "false");
  assert.ok(document.getElementById("sigCanvas"));
  assert.ok(document.getElementById("sigTyped"));
});

ok("the date is filled in and not editable", () => {
  const date = document.getElementById("date");
  assert.match(date.value, /^\d{1,2} [A-Za-z]+ \d{4}$/, `unexpected date "${date.value}"`);
  assert.equal(date.hasAttribute("readonly"), true);
});

ok("an empty letter will not submit", () => {
  submit();
  assert.equal(errors.classList.contains("show"), true, "no error summary");
  assert.match(errors.textContent, /required field/);
  assert.equal(confirmation.classList.contains("show"), false);
});

ok("a filled letter prepares the email and confirms", () => {
  form.elements.orgName.value = "Benue Specialist Hospital";
  form.elements.orgAddress.value = "12 Adaka Road, Makurdi, Benue State";
  form.elements.scale.value = "3 sites, 40 practitioners";
  form.elements.usage.value = "1,000 – 10,000 signed minutes";
  form.elements.sigName.value = "Dr Amaka Ije";
  form.elements.sigTitle.value = "Clinical Lead";
  form.elements.sigEmail.value = "amaka@example.org";
  form.elements.sigPhone.value = "+234 800 111 2222";
  form.elements.country.value = "Nigeria";
  document.querySelector('input[name="useCase"]').checked = true;

  click(document.getElementById("tabType"));
  document.getElementById("sigTyped").value = "Amaka Ije";

  submit();

  assert.equal(errors.classList.contains("show"), false, "validated fields still flagged");
  assert.ok(win.location.href.startsWith("mailto:contact@liveunmute.com?subject="), win.location.href);

  const decoded = decodeURIComponent(win.location.href);
  for (const phrase of [
    "Benue Specialist Hospital",
    "Patient–provider communication (healthcare)",
    "Dr Amaka Ije",
    "Clinical Lead",
    "Nigeria",
    "Amaka Ije",
    "non-binding",
  ]) {
    assert.ok(decoded.includes(phrase), `letter is missing "${phrase}"`);
  }

  assert.equal(form.hidden, true, "the form should step aside");
  assert.equal(confirmation.classList.contains("show"), true);
});

ok("the typed name is used as the signature value", () => {
  const decoded = decodeURIComponent(win.location.href);
  assert.match(decoded, /Signature: Amaka Ije/);
});

ok("the page is linked from the site", () => {
  const home = readFileSync("./index.html", "utf8");
  assert.ok(home.includes('href="loi.html"'), "no link to the letter of intent");
});

console.log(`\n${pass} passed`);
