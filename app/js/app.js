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
import { SCRIPT, resolveStep } from "./media.js";
import { getProvider } from "./providers/index.js";
import { createLiveSession } from "./live.js";
import { readConfig } from "./config.js";
import { createSpeechConversation } from "./speech-conversation.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const RENDER = { home: renderHome, sign: renderSign, history: renderHistory, settings: renderSettings };

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

  speechConversation: null,
  conversationActive: false,
  speechError: "",
  segmentCounter: 0,
  signedQueue: [],
  signedQueueBusy: false,
  lastSignedChunk: null,

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
    caption: state.caption,
    note: state.note,
    confidence: state.confidence,
    live: state.live,
    ready: state.liveReady,
    bootFailed: state.bootFailed,
    conversationActive: state.conversationActive,
    conversationBusy: state.busy,
    lastSignedChunk: state.lastSignedChunk,
  };
}

/** Check the active direction; a live avatar must not imply live recognition. */
const isLiveCapability = (direction) => {
  const capability = state.live?.capabilities?.[direction];
  if (capability) return Boolean(capability.live);
  return Boolean(state.live && !state.live.isMock);
};

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
      : state.screen === "home"
      ? renderHome({ live: state.live })
      : RENDER[state.screen]();

  host.innerHTML = html;
  wire();
  bindLiveVideo();
}

function go(screen) {
  if (!RENDER[screen] || screen === state.screen) return;

  // Leaving the conversation closes both microphone and camera. A clinician's
  // audio session must not keep running behind another screen.
  if (state.screen === "sign") {
    stopSpeechConversation();
    session?.disarm();
  }

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
    else toggleSpeechConversation();
    return;
  }

  if (state.conversationActive || state.busy) stopSpeechConversation();
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
    // is not merely hidden, it is closed. The Speak tap also starts the session.
    session?.disarm();
    showClinician(state.clinicianIndex, "Tap Speak to start. A 2-second pause ends each signed segment.");
    toggleSpeechConversation();
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
  state.caption = "";
  state.note = note;
  paint();
}

function setClinicianNote(text) {
  state.note = text;
  const el = $("[data-note]", host);
  if (el) el.textContent = text;
}

function updateClinicianTranscript(transcript = state.caption) {
  state.caption = String(transcript || "");
  if (state.mode !== "clinician") return;
  const caption = $("[data-caption]", host);
  if (caption) caption.textContent = state.caption;
  if (state.conversationActive) {
    setClinicianNote(state.busy
      ? "Listening — translating a completed segment."
      : "Listening — a two-second pause completes each segment.");
  }
}

function updateConversationControls() {
  const button = $('.dir-btn[data-mode="speak"]', host);
  if (button) {
    button.classList.toggle("is-live", state.conversationActive);
    button.setAttribute("aria-pressed", String(state.conversationActive));
    button.setAttribute("aria-label", state.conversationActive ? "End conversation" : "Start conversation");
    button.style.setProperty("--lvl", state.conversationActive ? button.style.getPropertyValue("--lvl") || "0" : "0");
  }
  const label = $('.dir[data-dir="speak"] .dir-label', host);
  if (label) label.textContent = state.conversationActive ? "Stop" : "Speak";
}

function ensureSpeechConversation() {
  if (state.speechConversation) return state.speechConversation;

  state.speechConversation = createSpeechConversation({
    language: "en-US",
    silenceMs: 2_000,
    onTranscript: (transcript) => updateClinicianTranscript(transcript),
    onChunk: (text, index) => {
      state.segmentCounter = index;
      state.signedQueue.push({ id: index, text });
      state.busy = true;
      if (state.mode === "clinician") {
        setClinicianNote(state.conversationActive
          ? "Listening — translating a completed segment."
          : "Conversation ended — translating the final segment.");
      }
      drainSignedQueue();
    },
    onState: (speechState) => {
      const wasActive = state.conversationActive;
      state.conversationActive = Boolean(speechState.active);

      if (speechState.error) {
        state.speechError = speechState.error;
        setClinicianNote(speechState.error);
      } else if (speechState.active) {
        state.speechError = "";
        setClinicianNote(speechState.warning || (state.busy
          ? "Listening — translating a completed segment."
          : "Listening — a two-second pause completes each segment."));
      } else if (speechState.stopping) {
        if (!state.speechError) setClinicianNote("Ending conversation…");
      } else if (!state.speechError) {
        setClinicianNote(state.busy
          ? "Conversation ended — finishing the signed segments."
          : "Conversation ended.");
      }

      if (wasActive !== state.conversationActive) updateConversationControls();
      if (speechState.error && state.mode === "clinician") updateConversationControls();
    },
    onLevel: (level) => {
      const button = $('.dir-btn[data-mode="speak"]', host);
      if (button) button.style.setProperty("--lvl", Number(level || 0).toFixed(3));
    },
  });

  return state.speechConversation;
}

function maybeSign(text) {
  if (!isLiveCapability("textToSign") || !session || !text) return Promise.resolve(null);
  return session.sign(text);
}

function drainSignedQueue() {
  if (state.signedQueueBusy) return;
  const item = state.signedQueue.shift();
  if (!item) {
    state.busy = false;
    if (state.mode === "clinician" && !state.conversationActive && !state.speechError) {
      setClinicianNote("Conversation ended.");
    }
    return;
  }

  state.busy = true;
  state.signedQueueBusy = true;
  if (state.mode === "clinician") {
    setClinicianNote(state.conversationActive
      ? "Listening — translating a completed segment."
      : "Conversation ended — finishing the signed segments.");
  }

  Promise.resolve(maybeSign(item.text)).then((result) => {
    if (result?.videoUrl) {
      state.lastSignedChunk = {
        id: item.id,
        text: item.text,
        videoUrl: result.videoUrl,
        source: result.source || "",
      };
      if (state.screen === "sign" && state.mode === "clinician") paint();
      if (state.mode === "clinician") {
        setClinicianNote(state.conversationActive
          ? "Listening — signed the last completed segment."
          : "ASL output ready. Tap Repeat to replay the last segment.");
      }
    } else if (!isLiveCapability("textToSign")) {
      if (state.mode === "clinician") setClinicianNote("Transcript captured. No live ASL output is configured.");
    } else if (state.live?.error && state.mode === "clinician") {
      setClinicianNote(state.live.error);
    }
  }).catch((error) => {
    console.warn("Signa rendering failed:", error);
    if (state.mode === "clinician") setClinicianNote(String(error?.message || "Could not render this signed segment."));
  }).finally(() => {
    state.signedQueueBusy = false;
    state.busy = state.signedQueue.length > 0;
    if (state.busy) drainSignedQueue();
    else if (state.mode === "clinician" && state.conversationActive && !state.speechError) {
      setClinicianNote("Listening — a two-second pause completes each segment.");
    } else if (state.mode === "clinician" && !state.speechError && !state.live?.error) {
      setClinicianNote(state.lastSignedChunk
        ? "ASL output ready. Tap Repeat to replay the last segment."
        : "Conversation ended.");
    }
  });
}

function startSpeechConversation() {
  if (state.mode !== "clinician") return;
  state.caption = "";
  state.speechError = "";
  state.segmentCounter = 0;
  const caption = $("[data-caption]", host);
  if (caption) caption.textContent = "";
  setClinicianNote("Starting conversation…");

  const speech = ensureSpeechConversation();
  Promise.resolve(session?.warmOutput?.()).catch((error) => {
    console.warn("Signa output warmup failed:", error);
  });
  Promise.resolve(speech.start()).then((started) => {
    if (!started && state.conversationActive && !state.speechError) {
      setClinicianNote("Speech recognition could not start. Check microphone access and try again.");
    }
  }).catch((error) => {
    console.warn("Could not start speech conversation:", error);
    state.speechError = "Could not start the conversation. Check microphone permission and try again.";
    setClinicianNote(state.speechError);
    state.speechConversation?.stop().catch(() => {});
    state.conversationActive = false;
    updateConversationControls();
  });
}

function stopSpeechConversation() {
  const speech = state.speechConversation;
  if (!speech || (!state.conversationActive && !speech.active)) return Promise.resolve();
  return speech.stop().catch((error) => {
    console.warn("Could not stop speech conversation cleanly:", error);
    state.conversationActive = false;
    updateConversationControls();
  });
}

function toggleSpeechConversation() {
  if (state.mode !== "clinician") return;
  if (state.conversationActive) {
    stopSpeechConversation();
    return;
  }
  startSpeechConversation();
}

function repeatSign() {
  const chunk = state.lastSignedChunk;
  const video = $("[data-sign-video]", host);
  if (!chunk?.videoUrl || !video) {
    setClinicianNote("There is no completed ASL segment to repeat yet.");
    return;
  }

  try { video.currentTime = 0; } catch { /* metadata may still be loading */ }
  const started = video.play?.();
  if (started && typeof started.catch === "function") started.catch(() => {});
  setClinicianNote(`Repeating the sign for: “${chunk.text}”`);
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

  const material = ["phase", "transcript", "transcriptSource", "confidence", "note", "error", "consent", "signing", "isMock", "capabilities"].some(
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
    const { provider, reason, mode } = await getProvider(cfg);
    if (mode === "mock") console.info("[unmute] scripted demo:", reason);
    else console.info("[unmute] provider directions:", reason);

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
    if (state.screen === "sign" && next !== "sign") {
      stopSpeechConversation();
      session?.disarm();
    }
    state.screen = next;
    paint();
    if (next === "sign") armSignScreen();
  }
});

window.addEventListener("pagehide", () => {
  stopSpeechConversation();
  session?.disarm();
});
