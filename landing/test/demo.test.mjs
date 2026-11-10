// The pitch video page.
//
// It does not own the video: the file lives in Google Drive and is embedded
// with Drive's preview player. That means the tests care about the things that
// break a public page — a wrong file id, a player that silently fails for a
// viewer without Drive access, and a page that claims captions it does not have.

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const html = readFileSync("./demo/index.html", "utf8");
const dom = new JSDOM(html, { url: "http://localhost/demo/" });
const { document } = dom.window;

const VIDEO_ID = "1Ic4Yhtm3QB1zh2N7ogCVkuc-MVNdOJNK";

let pass = 0;
const ok = (n, f) => {
  try { f(); pass++; console.log(`PASS  ${n}`); }
  catch (e) { console.log(`FAIL  ${n}  — ${e.message}`); process.exitCode = 1; }
};

ok("the video is embedded with Drive's preview player", () => {
  const frame = document.querySelector(".player iframe");
  assert.ok(frame, "no iframe");
  assert.equal(
    frame.getAttribute("src"),
    `https://drive.google.com/file/d/${VIDEO_ID}/preview`
  );
});

ok("the iframe is titled, so it is not an unlabelled frame", () => {
  const title = document.querySelector(".player iframe").getAttribute("title");
  assert.ok(title && title.length > 10, `weak title: ${title}`);
});

ok("the player is allowed to go fullscreen on a phone", () => {
  const frame = document.querySelector(".player iframe");
  assert.ok(frame.hasAttribute("allowfullscreen"), "no allowfullscreen");
});

ok("there is a fallback link for anyone the player fails", () => {
  const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
  assert.ok(
    links.filter((h) => h.includes(`/file/d/${VIDEO_ID}/view`)).length >= 2,
    "fewer than two direct Drive links"
  );
});

ok("the page never claims captions it does not have", () => {
  const text = document.body.textContent.toLowerCase();
  assert.ok(!/captions?:?\s*(available|on)\b(?!.*not)/.test(text), "claims captions");
  const facts = [...document.querySelectorAll(".fact")].map((f) => f.textContent.toLowerCase());
  assert.ok(facts.some((f) => f.includes("captions") && f.includes("not yet")),
    "captions state is not stated plainly");
});

ok("the external links open in a new tab without handing over the opener", () => {
  const external = [...document.querySelectorAll('a[href^="https://drive.google.com"]')];
  assert.ok(external.length > 0, "no drive links");
  for (const a of external) {
    assert.equal(a.getAttribute("target"), "_blank");
    assert.match(a.getAttribute("rel") || "", /noopener/);
  }
});

ok("there is one h1 and the headings are ordered", () => {
  assert.equal(document.querySelectorAll("h1").length, 1);
  const h2s = [...document.querySelectorAll("h2")].map((h) => h.textContent.trim());
  assert.deepEqual(h2s, ["Transcript"]);
});

ok("the transcript is a real landmark, not decoration", () => {
  const section = document.getElementById("transcript");
  assert.ok(section, "no transcript section");
  assert.ok(section.textContent.trim().length > 40, "transcript section is empty");
});

ok("the page does not autoplay sound at a visitor", () => {
  // Drive's embed only plays on interaction; nothing here should force it.
  assert.ok(!/autoplay\s*[:=]\s*true/i.test(html), "autoplay forced in markup");
});

console.log(`\n${pass} passed`);
