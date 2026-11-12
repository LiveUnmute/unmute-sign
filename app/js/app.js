// The app.
//
// Two entry points, one source of screens.
//   index.html — the board (desktop) / the app itself (mobile)
//   app.html   — the app, framed on desktop
//
// ── What is real and what is scripted ─────────────────────────────────────
// REAL     the camera, the consent gate, the recording, and the clip itself.
//          The patient in front of the lens is the patient you see. Also real:
//          the microphone permission prompt, the audio stream and the level
//          meter, and — where the browser exposes SpeechRecognition — the
//          transcript of the clinician's speech.
// SCRIPTED the reading of those signs. No recognition engine is configured in
//          this build, so the transcript comes from media.js and is labelled
//          Demo. The filming is real; the translation is not.
//
// That split is deliberate and it is the whole reason the camera is not gated
// on a vendor key. A hospital evaluating this needs to see the capture flow
// working with a real person, not a stock photograph of somebody else.
//
// The UI says which half you are getting rather than leaving it ambiguous.

import { renderHome, renderSign, renderHistory, renderSettings } from "./screens.js";
import { SCRIPT, TRANSLATOR_SIGNS, resolveStep } from "./media.js";
import { getProvider } from "./providers/index.js";
import { createLiveSession } from "./live.js";
import { readConfig } from "./config.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const RENDER = { home: renderHome, sign: renderSign, history: renderHistory, settings: renderSettings };

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
  screen: "home",
  mode: "patient",

  // two independent cursors over the same script
  patientIndex: 0,
  clinicianIndex: 0,

  caption: "",
  note: "",
  confidence: 98,
  busy: false,

  micStream: null,
  audioCtx: null,
  levelRAF: null,
  recognition: null,

  // The live engine. `null` until providers/index.js has resolved, which is
  // instant when there is no key and one dynamic import when there is.
  live: null,
  liveReady: false,
  bootFailed: false,
};

/* ------------------------------------------------------------
   Which entry is on screen right now
   ------------------------------------------------------------ */

const patientSteps = SCRIPT.filter((s) => s.who === "patient");
const clinicianSteps = SCRIPT.filter((s) => s.who === "clinician");

function currentEntry() {
  const steps = state.mode === "patient" ? patientSteps : clinicianSteps;
  const i = state.mode === "patient" ? state.patientIndex : state.clinicianIndex;
  const step = steps[i % steps.length];
  return { entry: resolveStep(step), index: i % steps.length, total: steps.length };
}

function signState() {
  const { entry } = currentEntry();
  return {
    mode: state.mode === "patient" ? "sign" : "speak",
    entry,
    caption: state.caption || entry.text,
    note: state.note,
    confidence: state.confidence,
    live: state.live,
    ready: state.liveReady,
    bootFailed: state.bootFailed,
  };
}

/** True only when a real engine is configured and answered. */
const isLiveEngine = () => Boolean(state.live && !state.live.isMock);

/**
 * True when a tap on the hand should open the camera rather than advance the
 * scripted poses.
 *
 * The camera is not a feature of the recognition engine. It is how the
 * patient's signs get into the app at all, and there is no version of this
 * product where a clinician is shown a stock photograph instead of the person
 * in front of them. With no engine configured the transcript is scripted and
 * labelled Demo — but the patient is still filmed, and consent is still asked.
 */
const cameraFlow = () =>
  Boolean(state.liveReady && session && state.live?.consent !== "declined");

/* ------------------------------------------------------------
   The app shell
   ------------------------------------------------------------ */

let host = null;
let session = null;

function paint() {
  if (!host) return;

  const html =
    state.screen === "sign"
      ? renderSign(signState())
      : RENDER[state.screen]();

  host.innerHTML = html;
  wire();
  bindLiveVideo();
}

function go(screen) {
  if (!RENDER[screen] || screen === state.screen) return;

  // Leaving the conversation closes the camera. Browsing history is not a
  // reason for a patient's room to stay on a lens.
  if (state.screen === "sign") session?.disarm();

  state.screen = screen;
  history.replaceState(null, "", `#${screen}`);
  paint();

  if (screen === "sign") armSignScreen();
}

function wire() {
  $$("[data-go]", host).forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      go(el.dataset.go);
    })
  );

  $$("[data-mode]", host).forEach((el) =>
    el.addEventListener("click", () => setMode(el.dataset.mode))
  );

  $$("[data-repeat]", host).forEach((el) =>
    el.addEventListener("click", () => repeatSign())
  );

  $("[data-consent-yes]", host)?.addEventListener("click", () => session?.grantConsent());
  $("[data-consent-no]", host)?.addEventListener("click", () => session?.declineConsent());
  $("[data-confirm-yes]", host)?.addEventListener("click", () => session?.accept());
  $("[data-confirm-no]", host)?.addEventListener("click", () => session?.discard());

  $$("[data-toggle]", host).forEach((el) =>
    el.addEventListener("click", () => {
      const on = el.classList.toggle("is-on");
      el.setAttribute("aria-checked", String(on));
    })
  );
}

function armSignScreen() {
  if (state.mode === "patient") {
    if (cameraFlow()) {
      armPatient();
    } else if (state.live?.consent === "declined") {
      // The patient said no. Fall back to the poses rather than leaving a dead
      // screen — but never quietly reopen the lens.
      showPatient(state.patientIndex, "Camera off — using the demo poses.");
    } else {
      paint();
    }
  } else {
    showClinician(state.clinicianIndex, "Tap the speech button and talk.");
  }
}

/** Bring the camera up, or explain why we cannot. */
function armPatient() {
  if (!state.liveReady) {
    // The screen already shows a held card saying the camera is starting.
    // Writing a note as well would put two contradictory messages on screen.
    paint();
    return;
  }
  session?.arm();
}

/* ------------------------------------------------------------
   Direction
   ------------------------------------------------------------ */

function setMode(mode) {
  const next = mode === "sign" ? "patient" : "clinician";
  if (next === state.mode) {
    if (next === "patient") onHandTap();
    else listen();
    return;
  }

  state.mode = next;
  state.caption = "";
  state.note = "";

  if (next === "patient") {
    if (cameraFlow()) {
      armPatient();
    } else if (state.live?.consent === "declined") {
      showPatient(state.patientIndex, "Camera off — using the demo poses.");
    } else {
      paint();
    }
  } else {
    // The patient must never be visible on the clinician page — and the camera
    // is not merely hidden, it is closed.
    session?.disarm();
    showClinician(state.clinicianIndex, "Tap the speech button and talk.");
  }
}

/* ------------------------------------------------------------
   Patient direction — scripted
   ------------------------------------------------------------ */

function showPatient(index, note = "") {
  state.patientIndex = index;
  const { entry } = currentEntry();

  state.caption = "";
  state.confidence = 96 + Math.floor(Math.random() * 4);
  state.note = note;

  paint();
  typeCaption(entry.text);
}

/** One tap does both jobs: start the take, or end it. */
function onHandTap() {
  // Declined capture, or no session at all: the poses still carry the demo.
  if (!cameraFlow()) {
    if (!state.liveReady && session === null) return;
    nextPatient();
    return;
  }

  const phase = state.live?.phase;

  if (phase === "recording") session.stop();
  else if (phase === "sending") return;
  // A transcript is on screen waiting for a yes or a no. A stray tap must not
  // throw it away and start filming again.
  else if (phase === "confirm") return;
  else session.record();
}

function nextPatient() {
  const next = (state.patientIndex + 1) % patientSteps.length;
  showPatient(next, "");
}

/* ------------------------------------------------------------
   Clinician direction — real mic, scripted fallback
   ------------------------------------------------------------ */

function showClinician(index, note = "") {
  state.clinicianIndex = index;
  const { entry } = currentEntry();

  state.caption = entry.text;
  state.note = note;

  paint();
}

function repeatSign() {
  const { entry } = currentEntry();
  state.caption = entry.text;
  state.note = "Repeated.";
  paint();

  // re-run any video from the top
  const v = $("video.stage-media", host);
  if (v) {
    v.currentTime = 0;
    const started = v.play?.();
    if (started && typeof started.catch === "function") started.catch(() => {});
  }

  // and flash the frame so a repeat is visible even on a still
  const stage = $("[data-stage]", host);
  if (stage) {
    stage.classList.remove("is-flash");
    void stage.offsetWidth;
    stage.classList.add("is-flash");
  }
}

async function listen() {
  if (state.busy) return;
  state.busy = true;

  const btn = $('.dir-btn[data-mode="speak"]', host);
  btn?.classList.add("is-live");

  const proceed = async () => {
    // 1. Ask for the microphone. This is a real permission prompt.
    let granted = false;
    try {
      if (!state.micStream) {
        state.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      granted = true;
      startMeter(state.micStream);
    } catch (err) {
      setNote("Microphone blocked — showing the scripted transcript instead.");
    }

    // 2. Transcribe. Real where the browser offers it.
    if (granted && SR) {
      runRecognition();
    } else {
      window.setTimeout(() => {
        finishListening();
        advanceClinician(granted ? "Scripted transcript — this browser has no speech engine." : "");
      }, 1600);
    }
  };

  await proceed();
}

function runRecognition() {
  const rec = new SR();
  state.recognition = rec;

  rec.lang = "en-US";
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  rec.onresult = (ev) => {
    let interim = "";
    let final = "";

    for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
      const chunk = ev.results[i][0].transcript;
      if (ev.results[i].isFinal) final += chunk;
      else interim += chunk;
    }

    const caption = $("[data-caption]", host);
    if (caption) caption.textContent = (final || interim).trim();
  };

  rec.onerror = () => {
    finishListening();
    advanceClinician("Couldn't hear that — using the scripted line.");
  };

  rec.onend = () => {
    const caption = $("[data-caption]", host);
    const heard = (caption?.textContent || "").trim();

    finishListening();

    if (heard) {
      pickPoseFor(heard);
    } else {
      advanceClinician("Didn't catch that — using the scripted line.");
    }
  };

  try {
    rec.start();
  } catch {
    finishListening();
    advanceClinician("Speech engine unavailable — scripted transcript.");
  }

  // Safety net: a recogniser that never fires still returns the user to a
  // usable screen rather than leaving the button stuck.
  window.setTimeout(() => {
    if (state.busy) rec.stop();
  }, 8000);
}

/** Choose the translator pose whose scripted line best matches what was heard. */
function pickPoseFor(heard) {
  const words = heard.toLowerCase().split(/\W+/).filter((w) => w.length > 3);

  let best = 0;
  let bestScore = -1;

  TRANSLATOR_SIGNS.forEach((entry, i) => {
    const text = entry.text.toLowerCase();
    const score = words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });

  const entry = TRANSLATOR_SIGNS[best];
  const stepIndex = clinicianSteps.findIndex((s) => s.key === entry.id);

  state.clinicianIndex = stepIndex >= 0 ? stepIndex : 0;
  state.caption = heard;
  state.note = "Heard from the microphone.";
  paint();

  // The other half of the conversation: hand the sentence to the engine and
  // render whatever it returns to sign. With no engine this is a no-op and the
  // matched pose above stands.
  maybeSign(heard);
}

function maybeSign(text) {
  if (!isLiveEngine() || !session || !text) return;
  session.sign(text);
}

function advanceClinician(note) {
  const next = (state.clinicianIndex + 1) % clinicianSteps.length;
  state.clinicianIndex = next;
  const { entry } = currentEntry();

  state.caption = entry.text;
  state.note = note;
  paint();
}

function finishListening() {
  state.busy = false;
  stopMeter();
  $('.dir-btn[data-mode="speak"]', host)?.classList.remove("is-live");
}

function setNote(text) {
  state.note = text;
  const el = $("[data-note]", host);
  if (el) el.textContent = text;
}

/* --- live input level -------------------------------------
   Proves the mic is actually open: the ring around the speech button
   tracks real input, not a CSS animation. */

function startMeter(stream) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    state.audioCtx = state.audioCtx || new Ctx();
    const ctx = state.audioCtx;
    if (ctx.state === "suspended") ctx.resume();

    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const btn = $('.dir-btn[data-mode="speak"]', host);

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i += 1) {
        peak = Math.max(peak, Math.abs(data[i] - 128) / 128);
      }
      if (btn) btn.style.setProperty("--lvl", peak.toFixed(3));
      state.levelRAF = requestAnimationFrame(tick);
    };
    tick();
  } catch {
    /* metering is a nicety; never block the demo */
  }
}

function stopMeter() {
  if (state.levelRAF) cancelAnimationFrame(state.levelRAF);
  state.levelRAF = null;
  const btn = $('.dir-btn[data-mode="speak"]', host);
  if (btn) btn.style.setProperty("--lvl", "0");
}

/* ------------------------------------------------------------
   The live engine
   ------------------------------------------------------------ */

function bindLiveVideo() {
  const cam = $("[data-cam]", host);
  if (cam && session) session.attach(cam);

  // play() returns a promise in modern engines and undefined in older ones.
  // Calling .catch() on undefined throws — inside a render path, that turns a
  // working screen into an error state.
  const sv = $("[data-sign-video]", host);
  const started = sv?.play?.();
  if (started && typeof started.catch === "function") started.catch(() => {});
}

/**
 * The engine reports every change here. A full repaint on every tick would
 * detach the camera stream from the <video> each frame, so only material
 * changes repaint; the countdown is written straight into the note.
 */
function onLiveChange(snap) {
  const prev = state.live || {};
  state.live = snap;

  const material = ["phase", "transcript", "confidence", "note", "error", "consent", "signing", "isMock"].some(
    (k) => JSON.stringify(prev[k]) !== JSON.stringify(snap[k])
  );

  if (material) {
    paint();
    return;
  }

  if (snap.phase === "recording") {
    const el = $("[data-note]", host);
    if (el) el.textContent = `Recording — ${(Math.max(0, snap.msLeft) / 1000).toFixed(1)}s left.`;
  }

  bindLiveVideo();
}

async function bootLive() {
  const cfg = readConfig();

  try {
    const { provider, reason } = await getProvider(cfg);
    if (provider.name === "mock") console.info("[unmute] scripted demo:", reason);

    session = createLiveSession({ provider, config: cfg, onChange: onLiveChange });
    state.live = session.state;
    state.liveReady = true;

    paint();
    if (state.screen === "sign") armSignScreen();
  } catch (err) {
    console.warn("[unmute] live engine failed to start:", err?.message);
    state.liveReady = false;
    state.bootFailed = true;
    paint();
  }
}

/* --- typewriter for scripted captions ---------------------- */

let typer = null;

function typeCaption(text) {
  window.clearInterval(typer);
  const el = $("[data-caption]", host);
  if (!el) return;

  el.textContent = "";
  let i = 0;
  typer = window.setInterval(() => {
    i += 1;
    el.textContent = text.slice(0, i);
    if (i >= text.length) window.clearInterval(typer);
  }, 26);
}

/* ------------------------------------------------------------
   Boot — one app, every width
   ------------------------------------------------------------ */

host = $("#app");

const initial = (location.hash || "#home").slice(1);
state.screen = RENDER[initial] ? initial : "home";

paint();
if (state.screen === "sign") armSignScreen();

// Resolve the engine in the background. Everything above already works without
// it, so a slow or failed resolve cannot leave a blank screen.
bootLive();

// 1–4 switch screens, as a keyboard shortcut for desktop.
window.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea")) return;
  const map = { 1: "home", 2: "sign", 3: "history", 4: "settings" };
  if (map[e.key]) go(map[e.key]);
});

// Keep the hash honest when the browser's back button is used.
window.addEventListener("hashchange", () => {
  const next = (location.hash || "#home").slice(1);
  if (RENDER[next] && next !== state.screen) {
    state.screen = next;
    paint();
    if (next === "sign") armSignScreen();
  }
});
