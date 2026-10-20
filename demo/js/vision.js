// MediaPipe HandLandmarker wrapper.
//
// The WASM runtime is served locally from ./vendor so the app keeps working if
// the hospital wifi is poor. The model file is the one asset that still needs
// a network fetch on first load — it is cached by the browser afterwards.

import { FilesetResolver, HandLandmarker } from "../vendor/vision_bundle.mjs";

const MODEL_URLS = [
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  "https://cdn.jsdelivr.net/gh/google-ai-edge/mediapipe-samples@main/examples/hand_landmarker/js/hand_landmarker.task",
];

let instance = null;

export async function createLandmarker(onProgress = () => {}) {
  if (instance) return instance;

  onProgress("Loading vision runtime…");
  const vision = await FilesetResolver.forVisionTasks("./vendor/wasm");

  let lastErr = null;
  for (const baseOptions of [
    { modelAssetPath: MODEL_URLS[0], delegate: "GPU" },
    { modelAssetPath: MODEL_URLS[0], delegate: "CPU" },
    { modelAssetPath: MODEL_URLS[1], delegate: "CPU" },
  ]) {
    try {
      onProgress("Loading hand model…");
      instance = await HandLandmarker.createFromOptions(vision, {
        baseOptions,
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.4,
        minTrackingConfidence: 0.4,
      });
      return instance;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `Could not load the hand model. The demo still works in tap mode. (${lastErr?.message || "unknown error"})`
  );
}

export async function startCamera(video, { width = 960, height = 720 } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: width }, height: { ideal: height } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}

export function drawSkeleton(ctx, lm, w, h, connections) {
  ctx.clearRect(0, 0, w, h);
  if (!lm) return;

  const px = (p) => [p.x * w, p.y * h];

  ctx.lineWidth = Math.max(2, w / 320);
  ctx.strokeStyle = "rgba(45, 212, 191, 0.9)";
  for (const [a, b] of connections) {
    if (!lm[a] || !lm[b]) continue;
    const [x1, y1] = px(lm[a]);
    const [x2, y2] = px(lm[b]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  for (const p of lm) {
    const [x, y] = px(p);
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2, w / 340), 0, Math.PI * 2);
    ctx.fill();
  }

  // Fingertips highlighted so the presenter can see what the model is reading.
  ctx.fillStyle = "rgba(250, 204, 21, 1)";
  for (const i of [4, 8, 12, 16, 20]) {
    const [x, y] = px(lm[i]);
    ctx.beginPath();
    ctx.arc(x, y, Math.max(3.5, w / 240), 0, Math.PI * 2);
    ctx.fill();
  }
}
