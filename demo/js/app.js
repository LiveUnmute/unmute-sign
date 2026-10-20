import { QUESTIONS, CONCEPTS } from "./questions.js";
import { classifyFrame, createSmoother, HAND_CONNECTIONS } from "./classifier.js";
import { createLandmarker, startCamera, drawSkeleton } from "./vision.js";

/* ------------------------------------------------------------------ */
/* DOM                                                                 */
/* ------------------------------------------------------------------ */

const $ = (id) => document.getElementById(id);

const video = $("video");
const overlay = $("overlay");
const ctx = overlay.getContext("2d");

const cameraState = $("cameraState");
const cameraStateText = $("cameraStateText");
const camTitle = $("camTitle");
const camSpinner = $("camSpinner");
const camDiag = $("camDiag");
const camActions = $("camActions");
const openTabBtn = $("openTabBtn");
const retryCamBtn = $("retryCamBtn");
const tapModeBtn = $("tapModeBtn");
const liveTag = $("liveTag");

const questionPromptEl = $("questionPrompt");
const questionHintEl = $("questionHint");
const stepBadge = $("stepBadge");
const candidateList = $("candidateList");
const recordEl = $("record");
const recordEmpty = $("recordEmpty");
const summaryBtn = $("summaryBtn");
const modelStatus = $("modelStatus");

const summaryOverlay = $("summaryOverlay");
const summaryTable = $("summaryTable");
const summaryFlags = $("summaryFlags");
const summaryDate = $("summaryDate");
const summaryInterp = $("summaryInterp");

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

const state = {
  index: 0,
  answers: {},
  landmarker: null,
  stream: null,
  smoother: createSmoother(),
  lastVideoTime: -1,
  handsVisible: false,
  revealedAll: false,
  tapMode: false,
  running: false,
};

const currentQuestion = () => QUESTIONS[state.index];

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

let lastRenderKey = null;

function renderQuestion() {
  const q = currentQuestion();
  questionPromptEl.textContent = q.prompt;
  questionHintEl.textContent = q.clinicianHint;
  stepBadge.textContent = state.index < QUESTIONS.length ? `${state.index + 1} of ${QUESTIONS.length}` : "Complete";
  // In tap mode every question must stay answerable by hand.
  state.revealedAll = state.tapMode;
  state.smoother.reset();
  lastRenderKey = null;
  renderCandidates([]);
}

function renderCandidates(scored) {
  const q = currentQuestion();
  if (!q) return;

  // Either the recogniser proposes its best three, or the patient has asked to
  // see every option the question allows. Never anything outside `allowed`.
  const usable = state.revealedAll
    ? q.allowed.map((c) => ({
        concept: c,
        score: scored.find((s) => s.concept === c)?.score || 0,
      }))
    : scored.filter((s) => s.score > 0.12).slice(0, 3);

  // Rebuilding the DOM every frame swallows clicks and wastes cycles, so only
  // re-render when the set of visible choices actually changes.
  const key = `${q.id}|${usable.map((u) => u.concept).join(",")}|${state.revealedAll}`;
  if (key === lastRenderKey) {
    candidateList.querySelectorAll(".candidate[data-concept]").forEach((btn) => {
      const match = usable.find((u) => u.concept === btn.dataset.concept);
      const bar = btn.querySelector(".conf");
      if (bar) bar.style.width = `${Math.round(Math.min(1, match?.score || 0) * 100)}%`;
    });
    return;
  }
  lastRenderKey = key;

  candidateList.innerHTML = "";

  if (usable.length === 0) {
    const empty = document.createElement("div");
    empty.className = "candidate empty";
    empty.textContent = state.handsVisible
      ? "Reading your hand — hold the sign steady"
      : "Show your hand to the camera";
    candidateList.appendChild(empty);
    return;
  }

  usable.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.dataset.concept = s.concept;
    btn.className = "candidate" + (!state.revealedAll && i === 0 && s.score > 0.55 ? " best" : "");
    btn.innerHTML = `
      <span class="rank">${state.revealedAll ? "Select" : i === 0 ? "Best match" : `Option ${i + 1}`}</span>
      ${CONCEPTS[s.concept].label}
      <span class="conf" style="width:${Math.round(Math.min(1, s.score) * 100)}%"></span>
    `;
    btn.addEventListener("click", () => confirmAnswer(s.concept));
    candidateList.appendChild(btn);
  });

  if (!state.revealedAll) {
    const none = document.createElement("button");
    none.className = "candidate reject";
    none.textContent = "None of these";
    none.addEventListener("click", () => {
      state.revealedAll = true;
      lastRenderKey = null;
      renderCandidates([]);
    });
    candidateList.appendChild(none);
  }
}

function confirmAnswer(concept) {
  const q = currentQuestion();
  if (!q || !q.allowed.includes(concept)) return;

  state.answers[q.id] = concept;
  renderRecord();
  advance();
}

function advance() {
  if (state.index < QUESTIONS.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    state.index = QUESTIONS.length;
    questionPromptEl.textContent = "Intake complete";
    questionHintEl.textContent = "Show the summary to the clinician.";
    stepBadge.textContent = "Complete";
    candidateList.innerHTML = "";
    const done = document.createElement("div");
    done.className = "candidate empty";
    done.textContent = "All questions answered — press Finish to show the record.";
    candidateList.appendChild(done);
  }
}

function renderRecord() {
  const answered = QUESTIONS.filter((q) => state.answers[q.id] !== undefined);

  recordEmpty.hidden = answered.length > 0;
  recordEl.querySelectorAll(".record-row").forEach((n) => n.remove());

  for (const q of answered) {
    const v = state.answers[q.id];
    const row = document.createElement("div");
    row.className = "record-row" + (q.emphasis ? " emphasis" : "");

    const flag = q.flag ? q.flag(v) : null;
    const extra = q.severity && q.id === "pain" ? `<small>${q.severity(v)}</small>` : "";

    row.innerHTML = `
      <div class="r-label">${q.label}</div>
      <div class="r-value">${q.format(v)}${extra}</div>
      ${flag ? `<div class="r-flag">${flag}</div>` : ""}
    `;
    recordEl.appendChild(row);
  }

  recordEl.scrollTop = recordEl.scrollHeight;
  summaryBtn.disabled = answered.length < QUESTIONS.length;
}

/* ------------------------------------------------------------------ */
/* Vision loop                                                         */
/* ------------------------------------------------------------------ */

function sizeCanvasToVideo() {
  if (!video.videoWidth) return;
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
}

function loop() {
  if (!state.running) return;

  if (state.landmarker && video.readyState >= 2) {
    if (video.currentTime !== state.lastVideoTime) {
      state.lastVideoTime = video.currentTime;

      let result = null;
      try {
        result = state.landmarker.detectForVideo(video, performance.now());
      } catch {
        /* transient detection errors are not worth surfacing */
      }

      const lm = result?.landmarks?.[0] || null;
      state.handsVisible = !!lm;
      drawSkeleton(ctx, lm, overlay.width, overlay.height, HAND_CONNECTIONS);

      const q = currentQuestion();
      if (q) {
        if (lm) {
          const frameScores = classifyFrame(lm, q.allowed);
          const smoothed = state.smoother.update(frameScores);
          renderCandidates(smoothed);
        } else {
          state.smoother.update([]);
          renderCandidates([]);
        }
      }
    }
  }

  requestAnimationFrame(loop);
}

/* ------------------------------------------------------------------ */
/* Start-up                                                            */
/* ------------------------------------------------------------------ */

const inIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

// If we are embedded, a top-level tab is the only place the camera can work.
const topOpenTab = $("topOpenTab");
if (inIframe) {
  topOpenTab.href = window.location.href;
  topOpenTab.hidden = false;
}

function resetCameraState() {
  camSpinner.hidden = false;
  camTitle.hidden = false;
  camTitle.textContent = "Starting camera…";
  cameraStateText.hidden = false;
  cameraStateText.textContent = "Checking permissions…";
  camDiag.hidden = true;
  camDiag.innerHTML = "";
  camActions.hidden = true;
  tapModeBtn.hidden = true;
  openTabBtn.href = window.location.href;
}

async function boot() {
  renderQuestion();
  renderRecord();
  resetCameraState();
  await initCamera();
}

async function initCamera() {
  resetCameraState();

  // Camera is unavailable in some embedding contexts. Say so before we try,
  // rather than letting a NotAllowedError look like a broken app.
  if (!navigator.mediaDevices?.getUserMedia) {
    return enterTapMode(
      "This browser does not expose a camera API to the page.",
      { name: "NoMediaDevices", message: "navigator.mediaDevices.getUserMedia is unavailable" }
    );
  }

  try {
    camTitle.textContent = "Requesting camera…";
    cameraStateText.textContent = "Your browser will ask for permission.";
    state.stream = await startCamera(video);
    sizeCanvasToVideo();
    video.addEventListener("loadedmetadata", sizeCanvasToVideo);

    camTitle.textContent = "Loading hand model…";
    cameraStateText.textContent = "About 7 MB, cached after the first load.";

    state.landmarker = await createLandmarker((msg) => {
      cameraStateText.textContent = msg;
      modelStatus.textContent = msg;
    });

    cameraState.hidden = true;
    liveTag.hidden = false;
    modelStatus.textContent = "Hand tracking active · on-device";
    state.running = true;
    requestAnimationFrame(loop);
  } catch (err) {
    console.warn("Camera/model initialisation failed:", err);
    enterTapMode(err?.message || "Camera unavailable", err);
  }
}

const ERROR_HELP = {
  NotAllowedError: {
    title: "Camera permission was blocked",
    body: inIframe
      ? "This page is running inside an embedded preview, and embedded frames are blocked from using the camera. Open it in its own tab and the permission prompt will appear normally."
      : "The browser blocked camera access. Check the camera icon in the address bar, allow access for this site, then try again.",
  },
  NotFoundError: {
    title: "No camera found",
    body: "The browser could not find a camera on this device. You can still run the whole demonstration with the buttons below.",
  },
  NotReadableError: {
    title: "Camera is busy",
    body: "Another application is using the camera. Close it (video calls are the usual culprit) and try again.",
  },
  SecurityError: {
    title: "Camera needs a secure connection",
    body: "Browsers only allow camera access over HTTPS or on localhost. This page is being served over an insecure origin.",
  },
  NoMediaDevices: {
    title: "No camera API in this browser",
    body: "The page cannot reach a camera at all. Everything still works with the buttons below.",
  },
};

function enterTapMode(reason, err) {
  state.running = false;
  cameraState.hidden = false;
  liveTag.hidden = true;
  modelStatus.textContent = "Tap mode · no camera";

  const help = ERROR_HELP[err?.name] || {
    title: "Camera unavailable",
    body: reason,
  };

  camSpinner.hidden = true;
  camTitle.hidden = false;
  camTitle.textContent = help.title;
  cameraStateText.hidden = false;
  cameraStateText.textContent = help.body;

  const rows = [
    ["Secure connection", window.isSecureContext ? "yes" : "no"],
    ["Embedded frame", inIframe ? "yes" : "no"],
    ["Camera API", navigator.mediaDevices?.getUserMedia ? "available" : "missing"],
    ["Error", err?.name || "—"],
  ];
  camDiag.innerHTML = rows
    .map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`)
    .join("");
  camDiag.hidden = false;

  // Only offer "open in a new tab" when that is actually the likely fix.
  const needsOwnTab = inIframe && (err?.name === "NotAllowedError" || err?.name === "SecurityError");
  openTabBtn.hidden = !needsOwnTab;
  camActions.hidden = false;

  tapModeBtn.hidden = false;

  // Make the tap path a first-class way through the demo, not a dead end.
  state.tapMode = true;
  state.revealedAll = true;
  lastRenderKey = null;
  renderCandidates([]);
}

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */

function showSummary() {
  summaryDate.textContent = new Date().toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  summaryInterp.textContent = state.answers.interpreter === "yes" ? "Required" : "Not indicated";

  summaryTable.innerHTML = QUESTIONS.map((q) => {
    const v = state.answers[q.id];
    return `<tr><td>${q.label}</td><td>${v === undefined ? "—" : q.format(v)}</td></tr>`;
  }).join("");

  const flags = QUESTIONS.map((q) => {
    const v = state.answers[q.id];
    return v !== undefined && q.flag ? q.flag(v) : null;
  }).filter(Boolean);

  summaryFlags.innerHTML = flags.map((f) => `<div class="summary-flag">${f}</div>`).join("");

  summaryOverlay.hidden = false;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

function restart() {
  state.index = 0;
  state.answers = {};
  state.revealedAll = state.tapMode;
  state.smoother.reset();
  summaryOverlay.hidden = true;
  renderQuestion();
  renderRecord();
}

$("restartBtn").addEventListener("click", restart);
$("summaryBtn").addEventListener("click", showSummary);
$("closeSummary").addEventListener("click", () => (summaryOverlay.hidden = true));
$("againBtn").addEventListener("click", restart);
$("printBtn").addEventListener("click", () => window.print());
$("privacyPill").addEventListener("click", () => {
  alert(
    "On-device processing\n\n" +
      "Video from the camera is processed in this browser tab using WebAssembly.\n" +
      "No frames, images, or landmarks are uploaded. There is no server.\n" +
      "Close the tab and nothing remains."
  );
});

tapModeBtn.addEventListener("click", () => {
  enterTapMode("Camera skipped — using buttons.", { name: "Skipped" });
});
retryCamBtn.addEventListener("click", () => {
  state.tapMode = false;
  state.revealedAll = false;
  lastRenderKey = null;
  renderCandidates([]);
  initCamera();
});

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const q = currentQuestion();
  const key = e.key.toLowerCase();

  if (key === "r") { restart(); return; }
  if (summaryOverlay.hidden === false && (key === "escape" || key === "enter")) {
    summaryOverlay.hidden = true;
    return;
  }
  if (!q) return;

  const map = { y: "yes", n: "no", u: "not_sure", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5" };
  const concept = map[key];
  if (concept && q.allowed.includes(concept)) confirmAnswer(concept);
});

/* ------------------------------------------------------------------ */

boot();
