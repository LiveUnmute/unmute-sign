// Two entry points, one source of screens.
//
//   index.html  — the three compositions side by side (the reference layout)
//   app.html    — one phone you can actually drive
//
// Everything simulated here is labelled as simulated in the UI. There is no
// model behind this build; the recognition is a scripted queue of phrases.

import { device, renderHome, renderTranslate, renderChat } from "./screens.js";

/* ------------------------------------------------------------
   Sample content. Clinical, plausible, finite — the same discipline
   as the demo build: nothing outside this list can be "recognised".
   ------------------------------------------------------------ */

const DEMO_SIGNS = [
  "My chest hurts.",
  "It started two days ago.",
  "I am allergic to penicillin.",
  "I get dizzy when I stand up.",
  "My stomach hurts.",
];

const CLINICIAN_LINES = [
  "Where does it hurt?",
  "On a scale of 1 to 5, how bad is it?",
  "Are you taking any medication?",
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ------------------------------------------------------------
   Launcher — three static devices
   ------------------------------------------------------------ */

function mountLauncher(rack) {
  const order = [
    ["home", renderHome()],
    ["translate", renderTranslate()],
    ["chat", renderChat()],
  ];

  rack.innerHTML = order
    .map(
      ([key, html]) => `
      <a class="slot" href="app.html#${key}" aria-label="Open the ${key} screen">
        ${device(html)}
        <span class="slot-label">${key === "translate" ? "Translate" : key === "chat" ? "Conversation" : "Home"}</span>
      </a>`
    )
    .join("");
}

/* ------------------------------------------------------------
   Interactive phone
   ------------------------------------------------------------ */

const state = { screen: "home", signIndex: -1, clinicianIndex: -1, typing: null };

function mountSolo(host, nav) {
  const paint = () => {
    const html =
      state.screen === "home"
        ? renderHome()
        : state.screen === "translate"
        ? renderTranslate()
        : renderChat();

    host.innerHTML = device(html);

    $$(".chip", nav).forEach((c) =>
      c.classList.toggle("is-on", c.dataset.screen === state.screen)
    );

    wire(host);
  };

  const go = (screen) => {
    if (!screen || screen === state.screen) return;
    state.screen = screen;
    history.replaceState(null, "", `#${screen}`);
    paint();
    if (screen === "translate") startRecognition();
  };

  const wire = (root) => {
    // in-phone navigation
    $$("[data-go]", root).forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        go(el.dataset.go);
      })
    );

    $$(".tab", root).forEach((tab, i) =>
      tab.addEventListener("click", () => {
        const map = ["home", "translate", "chat", "chat"];
        go(map[i]);
      })
    );

    const shutter = $("[data-shutter]", root);
    if (shutter) shutter.addEventListener("click", sign);

    const play = $("[data-play]", root);
    if (play) play.addEventListener("click", () => {
      const tile = play.closest(".tile");
      tile.classList.remove("is-playing");
      void tile.offsetWidth; // restart the bar
      tile.classList.add("is-playing");
    });

    const swap = $("[data-swap]", root);
    if (swap) swap.addEventListener("click", () => swap.classList.toggle("is-flipped"));

    const mic = $("[data-mic]", root);
    if (mic) {
      const hint = $("[data-mic-hint]", root);
      mic.addEventListener("click", () => listen(mic, hint, root));
    }
  };

  /* --- camera: scripted recognition ------------------------- */

  function startRecognition() {
    window.setTimeout(() => sign(), 900);
  }

  function sign() {
    const caption = $("[data-caption]", host);
    const chip = $("[data-chip]", host);
    if (!caption) return;

    window.clearInterval(state.typing);
    state.signIndex = (state.signIndex + 1) % DEMO_SIGNS.length;
    const target = DEMO_SIGNS[state.signIndex];

    caption.textContent = "";
    let i = 0;
    state.typing = window.setInterval(() => {
      i += 1;
      caption.textContent = target.slice(0, i);
      if (i >= target.length) window.clearInterval(state.typing);
    }, 26);

    if (chip) {
      chip.textContent = `${96 + Math.floor(Math.random() * 4)}%`;
      chip.style.transform = "translateX(-50%) scale(1.12)";
      window.setTimeout(() => (chip.style.transform = "translateX(-50%)"), 180);
    }
  }

  /* --- voice: scripted clinician line ----------------------- */

  function listen(mic, hint, root) {
    if (mic.dataset.busy) return;
    mic.dataset.busy = "1";
    mic.classList.add("is-live");
    if (hint) hint.textContent = "Listening…";

    window.setTimeout(() => {
      mic.classList.remove("is-live");
      const line = CLINICIAN_LINES[++state.clinicianIndex % CLINICIAN_LINES.length];
      if (hint) hint.textContent = `Heard: “${line}”`;
      appendClinicianBubble(root, line);
      window.setTimeout(() => {
        mic.dataset.busy = "";
        if (hint) hint.textContent = "Hold to speak";
      }, 2200);
    }, 1500);
  }

  function appendClinicianBubble(root, line) {
    const thread = $("[data-thread]", root);
    if (!thread) return;

    $$(".bubble--right", thread).forEach((b) => b.remove());

    const el = document.createElement("div");
    el.className = "bubble bubble--right";
    el.innerHTML = `<p>${line}</p>
      <div class="bubble-foot"><span class="bubble-meta bubble-meta--right">Spoken</span></div>`;
    thread.insertBefore(el, $(".tile", thread));
  }

  // initial screen from the hash, so a launcher card can deep-link
  const initial = (location.hash || "#home").slice(1);
  state.screen = ["home", "translate", "chat"].includes(initial) ? initial : "home";
  paint();
  if (state.screen === "translate") startRecognition();

  $$(".chip", nav).forEach((c) =>
    c.addEventListener("click", () => go(c.dataset.screen))
  );
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */

const rack = $("#rack");
if (rack) mountLauncher(rack);

const solo = $("#solo");
if (solo) mountSolo(solo, $("#nav"));

// keyboard: 1 / 2 / 3 jump between screens on the interactive page
if (solo) {
  window.addEventListener("keydown", (e) => {
    const map = { 1: "home", 2: "translate", 3: "chat" };
    if (map[e.key]) {
      const chip = $(`.chip[data-screen="${map[e.key]}"]`);
      chip?.click();
    }
  });
}
