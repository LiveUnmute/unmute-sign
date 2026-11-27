import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const html = readFileSync("./index.html", "utf8");

const dom = new JSDOM(html, {
  url: "https://8080-abc.e2b.app/",
  pretendToBeVisual: true,
  runScripts: "outside-only",
});
const { window } = dom;

// --- stubs jsdom lacks ---
window.HTMLCanvasElement.prototype.getContext = () => ({
  clearRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, arc(){}, fill(){}, save(){}, restore(){}, drawImage(){},
  set lineWidth(_){}, set strokeStyle(_){}, set fillStyle(_){},
});
window.HTMLMediaElement.prototype.play = async () => {};
Object.defineProperty(window, "isSecureContext", { value: true });
// No camera API at all -> this is the "no camera" path.
Object.defineProperty(window.navigator, "mediaDevices", { value: undefined, configurable: true });

global.window = window;
global.document = window.document;
Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
global.HTMLCanvasElement = window.HTMLCanvasElement;
global.requestAnimationFrame = () => 0;
global.alert = () => {};

const { pathToFileURL } = await import("node:url");
// app.js imports relative modules; make them absolute so Node resolves them.
const src = readFileSync("./js/app.js", "utf8");
const tmp = "./js/__test_app.mjs";
const { writeFileSync, unlinkSync } = await import("node:fs");
writeFileSync(tmp, src);

await import(pathToFileURL(tmp).href);
await new Promise(r => setTimeout(r, 150));

const $ = (id) => document.getElementById(id);
const opts = () => [...document.querySelectorAll(".candidate[data-concept]")];

let pass = 0, fail = 0;
const t = (name, cond, extra="") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
};

// 1. tap mode engaged with a clear explanation
t("tap mode shows a title", $("camTitle").textContent.length > 5, $("camTitle").textContent);
t("diagnostics visible", !$("camDiag").hidden);
t("diagnostics list camera API", $("camDiag").textContent.includes("Camera API"));
t("no 'open in new tab' when not embedded", $("openTabBtn").hidden);

// 2. Q1 offers all five numbers
t("Q1 renders 5 answer buttons", opts().length === 5, opts().map(o=>o.dataset.concept).join(","));

// 3. answer Q1 by clicking, and confirm Q2 also offers buttons (the bug I fixed)
document.querySelector('.candidate[data-concept="3"]').click();
await new Promise(r => setTimeout(r, 30));
t("advanced to Q2", $("stepBadge").textContent === "2 of 4", $("stepBadge").textContent);
t("Q2 renders buttons in tap mode (cross-question bug)", opts().length === 3, opts().map(o=>o.dataset.concept).join(","));

// 4. answer the rest
for (const c of ["no", "yes", "yes"]) {
  const el = document.querySelector(`.candidate[data-concept="${c}"]`);
  if (el) el.click();
  await new Promise(r => setTimeout(r, 20));
}

t("record captured 4 rows", document.querySelectorAll(".record-row").length === 4,
  `${document.querySelectorAll(".record-row").length} rows`);
t("summary button enabled", !$("summaryBtn").disabled);

// 5. summary renders, interpreter flag appears
$("summaryBtn").click();
await new Promise(r => setTimeout(r, 20));
t("summary overlay opens", !$("summaryOverlay").hidden);
t("summary warns a qualified interpreter is required",
  $("summaryFlags").textContent.includes("Qualified interpreter required"));
t("summary states it is not a medical device",
  $("summaryOverlay").textContent.includes("Not a medical device"));

console.log(`\n${pass} passed, ${fail} failed`);
unlinkSync(tmp);
process.exit(fail ? 1 : 0);
