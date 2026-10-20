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
  state.revealedAll = false;
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

async function boot() {
  renderQuestion();
  renderRecord();

  // Camera and model are optional: the demo runs in tap mode without them.
  try {
    cameraStateText.textContent = "Requesting camera…";
    state.stream = await startCamera(video);
    sizeCanvasToVideo();
    video.addEventListener("loadedmetadata", sizeCanvasToVideo);

    cameraStateText.textContent = "Loading hand model…";
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
    console.warn(err);
    enterTapMode(err?.message || "Camera unavailable");
  }
}

function enterTapMode(reason) {
  state.running = false;
  cameraState.hidden = false;
  cameraState.innerHTML = `
    <p style="font-weight:600;color:#e8f4f2">Tap mode</p>
    <p>${reason}</p>
    <p>The demonstration continues: press the keys below, or tap an option once it appears.</p>
  `;
  liveTag.hidden = true;
  modelStatus.textContent = "Tap mode · no camera";
  state.revealedAll = true;
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

tapModeBtn.addEventListener("click", () => enterTapMode("Camera skipped."));

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
