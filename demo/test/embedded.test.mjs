import { JSDOM } from "jsdom";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { pathToFileURL } from "node:url";

const html = readFileSync("./index.html", "utf8");
const dom = new JSDOM(html, { url: "https://8080-abc.e2b.app/", pretendToBeVisual: true, runScripts: "outside-only" });
const { window } = dom;

window.HTMLCanvasElement.prototype.getContext = () => ({
  clearRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, arc(){}, fill(){}, save(){}, restore(){}, drawImage(){},
  set lineWidth(_){}, set strokeStyle(_){}, set fillStyle(_){},
});
window.HTMLMediaElement.prototype.play = async () => {};
Object.defineProperty(window, "isSecureContext", { value: true });

// THIS is the user's situation: camera API exists, but the embedding context
// denies it -> NotAllowedError "Permission denied".
Object.defineProperty(window.navigator, "mediaDevices", {
  value: {
    getUserMedia: async () => {
      const e = new Error("Permission denied");
      e.name = "NotAllowedError";
      throw e;
    },
  },
  configurable: true,
});

// Pretend we are inside an iframe. jsdom locks window.top, so proxy the window
// and swap `top`/`self` on the proxy the script actually sees.
const proxied = new Proxy(window, {
  get(target, prop) {
    if (prop === "top") return { fake: "parent" };
    if (prop === "self") return target;
    const v = Reflect.get(target, prop, target);
    return typeof v === "function" ? v.bind(target) : v;
  },
  set(target, prop, val) { return Reflect.set(target, prop, val, target); },
});
global.window = proxied;

global.document = window.document;
Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
global.HTMLCanvasElement = window.HTMLCanvasElement;
global.requestAnimationFrame = () => 0;
global.alert = () => {};

const src = readFileSync("./js/app.js", "utf8");
const tmp = "./js/__t2.mjs";
writeFileSync(tmp, src);
await import(pathToFileURL(tmp).href);
await new Promise(r => setTimeout(r, 150));

const $ = (id) => document.getElementById(id);
let pass = 0, fail = 0;
const t = (n, c, x="") => { c ? pass++ : fail++; console.log(`${c?"PASS":"FAIL"}  ${n}${x?"  — "+x:""}`); };

t("headline explains the block", $("camTitle").textContent.includes("blocked"), $("camTitle").textContent);
t("message blames the embedded frame", $("cameraStateText").textContent.toLowerCase().includes("embedded"));
t("diagnostics flag embedded frame", $("camDiag").textContent.includes("Embedded frame") && $("camDiag").textContent.includes("yes"));
t("diagnostics show NotAllowedError", $("camDiag").textContent.includes("NotAllowedError"));
t("'Open in a new tab' offered", !$("openTabBtn").hidden);
t("open-tab link points at this page", $("openTabBtn").href.includes("e2b.app"));
t("top-bar escape visible", !$("topOpenTab").hidden);
t("options still usable", document.querySelectorAll(".candidate[data-concept]").length === 5);

console.log(`\n${pass} passed, ${fail} failed`);
unlinkSync(tmp);
process.exit(fail ? 1 : 0);
