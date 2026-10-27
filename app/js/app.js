// Two entry points, one source of screens.
//
//   index.html — the four screens laid out as a board
//   app.html   — one phone you can drive
//
// Everything simulated is labelled as simulated on the page. There is no model
// behind this build: the camera cycles a fixed list of signed phrases and the
// speech control plays a fixed list of clinician questions.

import { device, renderHome, renderSign, renderHistory, renderSettings } from "./screens.js";

const SIGNED = [
  "My chest hurts.",
  "It started two days ago.",
  "I am allergic to penicillin.",
  "I get dizzy when I stand up.",
];

const SPOKEN = [
  "Where does it hurt?",
  "On a scale of 1 to 5, how bad is it?",
  "Are you taking any medication?",
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const RENDER = {
  home: renderHome,
  sign: renderSign,
  history: renderHistory,
  settings: renderSettings,
};

/* ------------------------------------------------------------
   Board — four static devices
   ------------------------------------------------------------ */

const BOARD = [
  ["home", "Home", "Entry point. One action."],
  ["sign", "Sign", "Two-way. Sign or speak."],
  ["history", "History", "Past encounters."],
  ["settings", "Settings", "Language, capture, data."],
];

function mountBoard(rack) {
  rack.innerHTML = BOARD.map(
    ([key, label, note], i) => `
    <a class="slot" href="app.html#${key}" aria-label="Open the ${label} screen">
      ${device(RENDER[key]())}
      <span class="slot-foot">
        <span class="slot-num">0${i + 1}</span>
        <span class="slot-label">${label}</span>
        <span class="slot-note">${note}</span>
      </span>
    </a>`
  ).join("");
}

/* ------------------------------------------------------------
   Interactive phone
   ------------------------------------------------------------ */

const state = { screen: "home", mode: "sign", signedIndex: -1, spokenIndex: -1, typing: null };

function mountSolo(host, nav) {
  const paint = () => {
    host.innerHTML = device(RENDER[state.screen]());

    $$(".chip", nav).forEach((c) =>
      c.classList.toggle("is-on", c.dataset.screen === state.screen)
    );

    wire();
  };

  const go = (screen) => {
    if (!screen || !RENDER[screen] || screen === state.screen) return;
    state.screen = screen;
    history.replaceState(null, "", `#${screen}`);
    paint();
    if (screen === "sign") window.setTimeout(() => run("sign"), 800);
  };

  const wire = () => {
    $$("[data-go]", host).forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        go(el.dataset.go);
      })
    );

    $$("[data-mode]", host).forEach((el) =>
      el.addEventListener("click", () => setMode(el.dataset.mode))
    );

    $$("[data-toggle]", host).forEach((el) =>
      el.addEventListener("click", () => {
        const on = el.classList.toggle("is-on");
        el.setAttribute("aria-checked", String(on));
      })
    );
  };

  /* --- direction -------------------------------------------- */

  function setMode(mode) {
    if (mode === state.mode) return;
    state.mode = mode;

    $$(".dir", host).forEach((d) => d.classList.toggle("is-on", d.dataset.dir === mode));

    const kicker = $("[data-kicker]", host);
    const caption = $("[data-caption]", host);

    if (mode === "sign") {
      if (kicker) kicker.innerHTML = "Patient <b>signed</b>";
      run("sign");
    } else {
      if (kicker) kicker.innerHTML = "Clinician <b>speaking</b>";
      window.clearInterval(state.typing);
      if (caption) caption.textContent = "";
      window.setTimeout(() => run("speak"), 420);
    }
  }

  /* --- simulation -------------------------------------------- */

  function run(mode) {
    const caption = $("[data-caption]", host);
    const chip = $("[data-chip]", host);
    if (!caption) return;

    window.clearInterval(state.typing);

    const list = mode === "sign" ? SIGNED : SPOKEN;
    const idx = mode === "sign" ? ++state.signedIndex : ++state.spokenIndex;
    const target = list[idx % list.length];

    caption.textContent = "";
    let i = 0;
    state.typing = window.setInterval(() => {
      i += 1;
      caption.textContent = target.slice(0, i);
      if (i >= target.length) window.clearInterval(state.typing);
    }, mode === "sign" ? 30 : 34);

    if (chip) {
      chip.style.opacity = mode === "sign" ? "1" : "0.35";
      chip.textContent = mode === "sign" ? `${96 + Math.floor(Math.random() * 4)}%` : "voice";
    }
  }

  // initial screen from the hash, so a board card can deep-link
  const initial = (location.hash || "#home").slice(1);
  state.screen = RENDER[initial] ? initial : "home";

  paint();
  if (state.screen === "sign") window.setTimeout(() => run("sign"), 800);

  $$(".chip", nav).forEach((c) =>
    c.addEventListener("click", () => go(c.dataset.screen))
  );
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */

const rack = $("#rack");
if (rack) mountBoard(rack);

const solo = $("#solo");
if (solo) mountSolo(solo, $("#nav"));

/* keyboard: 1–4 jump between screens */
if (solo) {
  window.addEventListener("keydown", (e) => {
    const map = { 1: "home", 2: "sign", 3: "history", 4: "settings" };
    if (map[e.key]) $(`.chip[data-screen="${map[e.key]}"]`)?.click();
  });
}
