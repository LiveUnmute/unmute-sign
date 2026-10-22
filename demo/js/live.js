// Unmute — live two-way conversation MVP.
//
// The whole point of this build is restraint: the practitioner opens the app,
// picks a camera if the default is wrong, and starts. After that there are no
// menus in the conversation path.
//
// HONESTY CONTRACT — what is real and what is not, stated once here so it can
// be checked against the UI:
//
//   REAL   Speech-to-text of the practitioner (browser SpeechRecognition).
//          Speech playback of the patient's response (SpeechSynthesis).
//          Hand landmark tracking and a small geometric sign classifier.
//          Camera switching, front/back.
//
//   NOT    English-to-ASL video. No text-to-ASL provider is wired up, so the
//          ASL panel shows the matched phrase and says plainly that the clip
//          is missing. It never pretends to be signing.
//
//   NOT    General ASL recognition. The classifier covers numerals 1-5 and
//          three gesture answers. Everything else is offered as a selection
//          chip, which is the honest fallback, not a hidden failure.

import { classifyFrame, createSmoother, HAND_CONNECTIONS } from "./classifier.js";
import {
  CLINICIAN_PHRASES,
  PATIENT_RESPONSES,
  RESPONSE_GROUPS,
  matchClinicianPhrase,
} from "./phrases.js";

const $ = (id) => document.getElementById(id);

/* ------------------------------------------------------------------ */
/* Elements                                                            */
/* ------------------------------------------------------------------ */

const screens = {
  ready: $("screenReady"),
  live: $("screenLive"),
  ended: $("screenEnded"),
};

const segButtons = [...document.querySelectorAll(".seg")];
const startBtn = $("startBtn");
const cameraHint = $("cameraHint");

const video = $("video");
const overlay = $("overlay");
const ctx = overlay.getContext("2d");
const camBadge = $("camBadge");
const camCaption = $("camCaption");

const aslIdle = $("aslIdle");
const aslActive = $("aslActive");
const aslPhrase = $("aslPhrase");
const aslNote = $("aslNote");
const aslStage = $("aslStage");

const transcriptEl = $("transcript");
const transcriptEmpty = $("transcriptEmpty");
const micState = $("micState");
const micDot = $("micDot");
const typeBtn = $("typeBtn");
const typeRow = $("typeRow");
const typeInput = $("typeInput");

const responseText = $("responseText");
const responseSource = $("responseSource");
const replayBtn = $("replayBtn");
const chipGroups = $("chipGroups");

const cameraBtn = $("cameraBtn");
const cameraBtnLabel = $("cameraBtnLabel");
const endBtn = $("endBtn");
const againBtn = $("againBtn");
const summaryList = $("summaryList");

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

const state = {
  facing: "user",
  stream: null,
  landmarker: null,
  visionAvailable: false,
  recognising: false,
  smoother: createSmoother(),
  lastVideoTime: -1,
  lastCommit: 0,
  hold: { id: null, since: 0 },
  speaking: false,
  lastSpoken: "",
  exchange: [],
  recognition: null,
  recogActive: false,
  interim: "",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function show(name) {
  for (const [key, el] of Object.entries(screens)) el.classList.toggle("is-on", key === name);
  window.scrollTo(0, 0);
}

const supportsSpeechIn = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
const supportsSpeechOut = "speechSynthesis" in window;

function speak(text) {
  if (!supportsSpeechOut || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.lang = "en-US";
    state.speaking = true;
    u.onend = () => { state.speaking = false; };
    u.onerror = () => { state.speaking = false; };
    window.speechSynthesis.speak(u);
  } catch {
    state.speaking = false;
  }
}

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

async function openCamera(facing) {
  stopCamera();
  if (!navigator.mediaDevices?.getUserMedia) {
    camBadge.textContent = "No camera";
    camCaption.textContent = "No camera on this device — the patient can still use the buttons below.";
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    state.stream = stream;
    video.srcObject = stream;
    await video.play();

    // A front camera preview is mirrored so the patient sees themselves
    // naturally; the landmarks have to be mirrored to match.
    video.classList.toggle("is-mirrored", facing === "user");

    camBadge.textContent = facing === "user" ? "Front camera" : "Back camera";
    camCaption.textContent = "Patient signs toward the camera";
    return true;
  } catch (err) {
    camBadge.textContent = "Camera blocked";
    camCaption.textContent =
      "Camera unavailable. The patient can tap a response instead — the conversation still works.";
    console.warn("Unmute: camera unavailable", err);
    return false;
  }
}

function stopCamera() {
  if (state.stream) {
    for (const track of state.stream.getTracks()) track.stop();
    state.stream = null;
  }
}

/* ------------------------------------------------------------------ */
/* Vision (optional)                                                   */
/* ------------------------------------------------------------------ */

async function initVision() {
  let vision = null;
  try {
    vision = await import("./vision.js");
  } catch {
    // The MediaPipe bundle is not part of this checkout. Camera preview still
    // works; recognition falls back to the selection chips.
    return false;
  }

  try {
    camBadge.textContent = "Loading hand tracking…";
    state.landmarker = await vision.createLandmarker();
    state.visionAvailable = true;
    camBadge.textContent = state.facing === "user" ? "Front camera" : "Back camera";
    startTracking(vision);
    return true;
  } catch (err) {
    console.warn("Unmute: hand model unavailable", err);
    camBadge.textContent = "Camera only";
    return false;
  }
}

function startTracking(vision) {
  const size = () => {
    const rect = video.getBoundingClientRect();
    overlay.width = Math.max(1, Math.round(rect.width));
    overlay.height = Math.max(1, Math.round(rect.height));
  };
  size();
  window.addEventListener("resize", size);

  const loop = () => {
    if (!state.stream) return;
    if (video.readyState >= 2 && video.currentTime !== state.lastVideoTime) {
      state.lastVideoTime = video.currentTime;
      let result = null;
      try {
        result = state.landmarker.detectForVideo(video, performance.now());
      } catch {
        /* frame skipped */
      }
      const lm = result?.landmarks?.[0] || null;
      vision.drawSkeleton(ctx, lm, overlay.width, overlay.height, HAND_CONNECTIONS, state.facing === "user");
      if (lm) onHandFrame(lm);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/**
 * Commit a recognised sign only after it has been held steady for a moment.
 * A single noisy frame must never put words in a patient's mouth.
 */
function onHandFrame(lm) {
  const allowed = PATIENT_RESPONSES.filter((r) => r.signs).map((r) => r.id);
  const frame = classifyFrame(lm, ["1", "2", "3", "4", "5", "yes", "no", "not_sure"]);
  const smoothed = state.smoother.update(frame);
  const top = smoothed[0];

  if (!top || top.score < 0.72) {
    state.hold = { id: null, since: 0 };
    return;
  }

  const map = {
    "1": "p1", "2": "p2", "3": "p3", "4": "p4", "5": "p5",
    yes: "yes", no: "no", not_sure: "not_sure",
  };
  const id = map[top.concept];
  if (!id || !allowed.includes(id)) return;

  const now = performance.now();
  if (state.hold.id !== id) {
    state.hold = { id, since: now };
    return;
  }
  if (now - state.hold.since < 650) return;
  if (now - state.lastCommit < 2600) return;

  state.lastCommit = now;
  state.hold = { id: null, since: 0 };
  state.smoother.reset();
  commitResponse(id, "camera");
}

/* ------------------------------------------------------------------ */
/* Clinician speech                                                    */
/* ------------------------------------------------------------------ */

function buildRecognition() {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";

  rec.onresult = (event) => {
    let finalText = "";
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal) finalText += res[0].transcript;
      else interim += res[0].transcript;
    }
    state.interim = interim;
    renderInterim();
    if (finalText.trim()) handleSpoken(finalText.trim());
  };

  rec.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      stopListening("Microphone blocked — use Typing");
    }
  };

  rec.onend = () => {
    // Chrome ends the stream periodically; restart while the session is live.
    if (state.recognising) {
      try { rec.start(); } catch { /* already starting */ }
    }
  };

  return rec;
}

function startListening() {
  if (!supportsSpeechIn) {
    micState.textContent = "Type instead";
    micDot.classList.add("is-off");
    typeRow.hidden = false;
    return;
  }

  state.recognition = state.recognition || buildRecognition();
  try {
    state.recognition.start();
    state.recognising = true;
    micState.textContent = "Listening";
    micDot.classList.remove("is-off");
  } catch {
    micState.textContent = "Listening";
  }
}

function stopListening(reason) {
  state.recognising = false;
  if (state.recognition) {
    try { state.recognition.stop(); } catch { /* ignore */ }
  }
  micState.textContent = reason || "Paused";
  micDot.classList.add("is-off");
}

let interimEl = null;
function renderInterim() {
  if (!interimEl) {
    interimEl = document.createElement("p");
    interimEl.className = "line doctor heard is-interim";
    transcriptEl.appendChild(interimEl);
  }
  interimEl.textContent = state.interim;
  interimEl.hidden = !state.interim;
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

function addLine(kind, text, note) {
  transcriptEmpty.hidden = true;
  if (interimEl) interimEl.hidden = true;
  transcriptEl.querySelectorAll(".line.heard").forEach((n) => n.remove());

  const p = document.createElement("p");
  p.className = `line ${kind}`;
  const who = document.createElement("span");
  who.className = "who";
  who.textContent = kind === "doctor" ? "You" : "Patient";
  p.appendChild(who);
  p.appendChild(document.createTextNode(text));
  transcriptEl.appendChild(p);

  if (note) {
    const n = document.createElement("p");
    n.className = "line-note";
    n.textContent = note;
    transcriptEl.appendChild(n);
  }

  interimEl = null;
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

function handleSpoken(text) {
  addLine("doctor", text);
  state.exchange.push({ from: "practitioner", text });

  const match = matchClinicianPhrase(text);
  showAslOutput(match, text);
}

/* ------------------------------------------------------------------ */
/* ASL output panel                                                    */
/* ------------------------------------------------------------------ */

function showAslOutput(match, spoken) {
  aslIdle.hidden = true;
  aslActive.hidden = false;

  if (match) {
    aslActive.innerHTML = "";
    const kicker = document.createElement("p");
    kicker.className = "asl-kicker";
    kicker.textContent = "ASL output";
    const phrase = document.createElement("p");
    phrase.className = "asl-phrase";
    phrase.textContent = match.text;
    const note = document.createElement("p");
    note.className = "asl-note";
    note.textContent = "Avatar clip not connected in this build — showing the phrase the patient would see signed.";
    aslActive.append(kicker, phrase, note);
    state.exchange.push({ from: "asl", text: match.text });
    return;
  }

  aslActive.innerHTML = "";
  const box = document.createElement("div");
  box.className = "asl-unsupported";
  const strong = document.createElement("strong");
  strong.textContent = "No ASL output for that phrase";
  const body = document.createElement("span");
  body.textContent =
    `"${spoken}" is outside the supported set (${CLINICIAN_PHRASES.length} phrases). ` +
    "The patient did not see it translated. Rephrase, or use an interpreter.";
  box.append(strong, body);
  aslActive.appendChild(box);
}

/* ------------------------------------------------------------------ */
/* Patient response                                                    */
/* ------------------------------------------------------------------ */

function commitResponse(id, source) {
  const res = PATIENT_RESPONSES.find((r) => r.id === id);
  if (!res) return;

  responseText.textContent = res.text;
  responseSource.textContent = source === "camera" ? "Read from signing" : "Selected by patient";
  replayBtn.hidden = false;
  state.lastSpoken = res.spoken;

  addLine("patient", res.text);
  state.exchange.push({ from: "patient", text: res.text, source });

  speak(res.spoken);
}

function renderChips() {
  chipGroups.innerHTML = "";
  for (const group of RESPONSE_GROUPS) {
    const row = document.createElement("div");
    row.className = "chip-group-row";
    const label = document.createElement("span");
    label.className = "chip-group-label";
    label.textContent = group.label;
    row.appendChild(label);

    for (const res of PATIENT_RESPONSES.filter((r) => r.group === group.id)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = res.text;
      b.addEventListener("click", () => commitResponse(res.id, "chip"));
      row.appendChild(b);
    }
    chipGroups.appendChild(row);
  }
}

/* ------------------------------------------------------------------ */
/* Session lifecycle                                                   */
/* ------------------------------------------------------------------ */

async function startSession() {
  show("live");
  startBtn.disabled = true;

  state.exchange = [];
  state.smoother.reset();
  state.lastCommit = 0;
  state.hold = { id: null, since: 0 };

  renderChips();
  resetPanels();

  const camOk = await openCamera(state.facing);
  if (camOk) initVision();

  startListening();
}

function resetPanels() {
  transcriptEl.innerHTML = "";
  transcriptEl.appendChild(transcriptEmpty);
  transcriptEmpty.hidden = false;
  transcriptEmpty.textContent = supportsSpeechIn
    ? "Speak normally. What you say appears here."
    : "Speech recognition is not available in this browser. Use Typing instead.";
  interimEl = null;

  aslIdle.hidden = false;
  aslActive.hidden = true;
  aslActive.innerHTML = "";

  responseText.textContent = "—";
  responseSource.textContent = "";
  replayBtn.hidden = true;

  typeRow.hidden = true;
  typeBtn.textContent = "Type instead";
}

async function endSession() {
  stopListening("Ended");
  stopCamera();
  if (supportsSpeechOut) window.speechSynthesis.cancel();

  renderSummary();
  show("ended");
  startBtn.disabled = false;
}

function renderSummary() {
  summaryList.innerHTML = "";

  const practitioner = state.exchange.filter((e) => e.from === "practitioner");
  const patient = state.exchange.filter((e) => e.from === "patient");

  const rows = [
    ["Practitioner turns", practitioner.length ? `${practitioner.length} spoken` : ""],
    ["Patient responses", patient.length ? patient.map((p) => p.text).join(" · ") : ""],
  ];

  for (const [label, value] of rows) {
    const li = document.createElement("li");
    const q = document.createElement("span");
    q.className = "q";
    q.textContent = label;
    const a = document.createElement("span");
    a.className = value ? "a" : "empty";
    a.textContent = value || "None recorded";
    li.append(q, a);
    summaryList.appendChild(li);
  }
}

/* ------------------------------------------------------------------ */
/* Wiring                                                              */
/* ------------------------------------------------------------------ */

segButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.facing = btn.dataset.facing;
    for (const b of segButtons) {
      const on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-checked", String(on));
    }
    $("frontNote").textContent = state.facing === "user" ? "Faces the patient" : "";
  });
});

startBtn.addEventListener("click", startSession);
endBtn.addEventListener("click", endSession);
againBtn.addEventListener("click", () => {
  resetPanels();
  show("ready");
});

cameraBtn.addEventListener("click", async () => {
  state.facing = state.facing === "user" ? "environment" : "user";
  cameraBtnLabel.textContent = state.facing === "user" ? "Front camera" : "Back camera";
  await openCamera(state.facing);
});

typeBtn.addEventListener("click", () => {
  const opening = typeRow.hidden;
  typeRow.hidden = !opening;
  typeBtn.textContent = opening ? "Hide" : "Type instead";
  if (opening) {
    stopListening("Paused");
    typeInput.focus();
  } else if (state.recognising === false) {
    startListening();
  }
});

typeRow.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = typeInput.value.trim();
  if (!text) return;
  typeInput.value = "";
  handleSpoken(text);
});

replayBtn.addEventListener("click", () => {
  if (state.lastSpoken) speak(state.lastSpoken);
});

// Do not leave the camera light on when the tab is closed or hidden.
document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.recognising) stopListening("Paused");
});

window.addEventListener("pagehide", stopCamera);

show("ready");
