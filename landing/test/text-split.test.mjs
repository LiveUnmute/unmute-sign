import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const html = readFileSync("./index.html", "utf8");
const dom = new JSDOM(html);
const { document } = dom.window;
global.Node = dom.window.Node;
global.document = document;

// Pull the splitter straight out of the page so we test the shipped code.
const script = [...document.querySelectorAll("script")]
  .map(s => s.textContent)
  .find(t => t.includes("function splitIntoWords")) || "";
const fn = script.slice(script.indexOf("function splitIntoWords"), script.indexOf("document.querySelectorAll('.split-animate')"));
const splitIntoWords = new Function("document", "Node", `${fn}; return splitIntoWords;`)(document, dom.window.Node);

let pass = 0, fail = 0;
const t = (n, c, extra="") => { c ? pass++ : fail++; console.log(`${c?"PASS":"FAIL"}  ${n}${extra?"  — "+extra:""}`); };

// ---- paragraph ----
const p = document.querySelector("p.split-animate");
const before = p.textContent.trim();
const el = p.cloneNode(false);
splitIntoWords(p.cloneNode(true), el);
const after = el.textContent.replace(/\s+/g, " ").trim();

t("paragraph text is identical after splitting", before === after);
t("words are separated by real spaces", !el.textContent.includes("Unmuteisan"));
t("no doubled spaces between words", !el.textContent.includes("  "));
t("renders as 'Unmute is an AI-powered'",
   el.textContent.startsWith("Unmute is an AI-powered sign-language"));

// whitespace must be OUTSIDE .word-inner (inside it, inline-block clips it)
const inners = [...el.querySelectorAll(".word-inner")].map(s => s.textContent);
t("no trailing spaces inside word spans", inners.every(w => w === w.trim()), inners.slice(0,5).join("|"));

// ---- heading with coloured span ----
const h = document.querySelector("h2.split-animate");
const accentBefore = h.querySelector("span")?.className;
const hEl = h.cloneNode(false);
splitIntoWords(h.cloneNode(true), hEl);
const accentAfter = [...hEl.querySelectorAll("span")].find(s => s.className.includes("c-accent"))?.className;
t("accent span class preserved", accentBefore === accentAfter, accentAfter);
t("heading still reads correctly",
   hEl.textContent.replace(/\s+/g," ").trim() === h.textContent.replace(/\s+/g," ").trim());
t("heading words are spaced", !hEl.textContent.includes("GapBetween"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
