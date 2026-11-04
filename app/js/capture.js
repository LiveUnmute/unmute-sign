// Camera capture.
//
// ── Why video and not landmarks ──────────────────────────────────────────
// Talksign's Palm 1.0 was going to extract pose landmarks on the device and
// send only keypoints, so raw video never left the browser. That decision has
// not survived contact with reality: Palm 1.0 is not released, and Sign-Speak's
// recognition endpoint takes **base64 video** or a WebSocket video stream.
//
// So the privacy property changes, and the app must say so rather than keep
// claiming the old one. Every capture therefore goes through an explicit
// consent gate in live.js, and the capture is discarded from memory as soon as
// the transcript comes back unless the clinician chose to keep it.
//
// ── Format ───────────────────────────────────────────────────────────────
// MediaRecorder emits whatever the browser likes: webm/VP9 in Chrome and
// Firefox, mp4 in Safari. Sign-Speak decides what it accepts; we prefer webm
// and fall back to whatever the platform supports. If a deployment rejects the
// clip, the first thing to check is this list.

const PREFERRED_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4",
];

export function supportsRecording() {
  return (
    typeof MediaRecorder !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

/** Pick the first container this browser will actually produce. */
function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  for (const type of PREFERRED_TYPES) {
    if (MediaRecorder.isTypeSupported?.(type)) return type;
  }
  return "";
}

/**
 * Open the front camera.
 *
 * `video` only — we are not recording the clinician's voice here, and asking
 * for an unused microphone permission is one more prompt to explain.
 */
export async function openCamera({ maxClipMs = 8000, width = 1280, height = 720 } = {}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("CAMERA_UNSUPPORTED");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: width },
      height: { ideal: height },
    },
    audio: false,
  });

  return { stream, stop: () => stream.getTracks().forEach((t) => t.stop()) };
}

/**
 * Record a clip from a live stream.
 *
 * Returns a handle with `stop()`; the blob resolves when recording ends.
 * `maxMs` stops it automatically so a forgotten tap cannot upload a minute of
 * a patient's room — which is both a cost problem and a consent problem.
 *
 * @param {MediaStream} stream
 * @param {{ maxMs?: number, timesliceMs?: number }} opts
 */
export function createRecorder(stream, { maxMs = 8000, bitsPerSecond } = {}) {
  const mimeType = pickMimeType();

  // The bitrate is not a quality knob here, it is a size guarantee. Through the
  // proxy a clip must stay under 6 MB (Lambda's request ceiling), so the
  // recorder is told what to spend rather than left to guess.
  const options = {};
  if (mimeType) options.mimeType = mimeType;
  if (bitsPerSecond) options.videoBitsPerSecond = bitsPerSecond;

  const recorder = new MediaRecorder(stream, Object.keys(options).length ? options : undefined);
  const chunks = [];

  let settled = false;
  let autoStop = null;
  let resolveBlob;
  let rejectBlob;

  const blob = new Promise((resolve, reject) => {
    resolveBlob = resolve;
    rejectBlob = reject;
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.onerror = (e) => {
    if (settled) return;
    settled = true;
    clearTimeout(autoStop);
    rejectBlob(new Error(`RECORDER_ERROR: ${e?.error?.name || "unknown"}`));
  };

  recorder.onstop = () => {
    if (settled) return;
    settled = true;
    clearTimeout(autoStop);
    const type = mimeType || chunks[0]?.type || "video/webm";
    resolveBlob(new Blob(chunks, { type }));
  };

  recorder.start();

  autoStop = setTimeout(() => {
    if (recorder.state !== "inactive") recorder.stop();
  }, maxMs);

  return {
    /** Stop early. Resolves with the clip. */
    stop() {
      clearTimeout(autoStop);
      if (recorder.state !== "inactive") recorder.stop();
      return blob;
    },

    /** Stop and abandon — used when consent is withdrawn mid-recording. */
    cancel() {
      clearTimeout(autoStop);
      chunks.length = 0;
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch {
        /* already dead */
      }
      return Promise.resolve(null);
    },

    get state() {
      return recorder.state;
    },

    mimeType,
  };
}

/**
 * Base64 a blob without the `data:video/webm;base64,` prefix.
 *
 * Sign-Speak's own example is `{ "payload": "b64video" }` with a comment
 * reading "your base64-encoded video", so the prefix is stripped. If their
 * endpoint turns out to want a data URI, that is a one-line change in
 * signspeak.js — see `payloadFormat` there.
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("BASE64_FAILED"));
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

/** Attach a stream to a <video> and start it. Returns the video element. */
export async function bindPreview(video, stream) {
  if (!video) return null;
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
  try {
    await video.play();
  } catch {
    /* autoplay can be refused; the frames still paint once the user taps */
  }
  return video;
}
