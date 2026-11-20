// The live conversation.
//
// This is the module that turns the demo into a product: it owns the camera,
// the consent gate, the round-trip to whichever engine is configured, and the
// patient-confirmation step between "the model produced a sentence" and "the
// clinician heard it".
//
// ── The state machine ────────────────────────────────────────────────────
//
//   idle ──arm──▶ consent ──grant──▶ ready ──record──▶ recording
//                   │                                     │
//                   └──decline──▶ blocked                 stop
//                                                           │
//                                                         sending
//                                                           │
//                                                       ┌───┴───┐
//                                                    confirm   error
//                                                       │
//                                          accept ──▶ spoken
//                                          discard ─▶ ready
//
// Nothing is spoken to a clinician that the patient has not confirmed. That is
// not a UX nicety — at 84–90% recognition accuracy, one sentence in ten is
// wrong, and on a ward a wrong sentence is a clinical event. The confirmation
// step is the product.

import { openCamera, createRecorder, blobToBase64, bindPreview, supportsRecording } from "./capture.js";

const SPEECH = typeof window !== "undefined" ? window.speechSynthesis : null;

export function createLiveSession({ provider, config, onChange = () => {} }) {
  const s = {
    phase: "idle", // idle | consent | ready | recording | sending | confirm | spoken | error
    consent: "unknown", // unknown | granted | declined
    transcript: "",
    confidence: 0,
    uncertain: true,
    words: [],
    note: "",
    error: "",
    providerName: provider?.name || "none",
    vendor: provider?.vendor || null,
    isMock: provider?.name === "mock",
    clipUrl: "",
    signing: null, // { videoUrl, durationMs } for the clinician direction
    history: [],
    msLeft: 0,
  };

  let stream = null;
  let recorder = null;
  let countdown = null;
  let videoEl = null;

  const emit = () => onChange(snapshot());

  function snapshot() {
    // Shallow copy: the app renders from this, it must not mutate our state.
    return { ...s, history: s.history.slice() };
  }

  function set(patch) {
    Object.assign(s, patch);
    emit();
  }

  /* ---------------------------------------------------------------
     Camera lifecycle
     --------------------------------------------------------------- */

  function attach(el) {
    videoEl = el || videoEl;
    if (stream && videoEl) bindPreview(videoEl, stream);
    return videoEl;
  }

  async function arm() {
    if (s.phase === "recording" || s.phase === "sending") return;

    if (!supportsRecording()) {
      set({
        phase: "error",
        error: "This browser cannot capture video. Use Chrome, Edge or Safari.",
      });
      return;
    }

    // Consent first, and visibly. This is the moment the patient's image starts
    // leaving the device if a real engine is configured, so it is not a banner
    // buried in settings.
    if (s.consent !== "granted") {
      set({ phase: "consent", note: "" });
      return;
    }

    try {
      if (!stream) {
        const cam = await openCamera({
          maxClipMs: config?.maxClipMs,
          width: config?.captureWidth,
          height: config?.captureHeight,
        });
        stream = cam.stream;
      }
      set({ phase: "ready", note: "", error: "" });
      if (videoEl) bindPreview(videoEl, stream);
    } catch (err) {
      const name = String(err?.name || "");
      set({
        phase: "error",
        error:
          name === "NotAllowedError"
            ? "Camera blocked. Allow camera access for this site, then tap the hand again."
            : name === "NotFoundError"
            ? "No camera found on this device."
            : "The camera could not be opened.",
      });
    }
  }

  function grantConsent() {
    set({ consent: "granted", phase: "idle", note: "" });
    return arm();
  }

  function declineConsent() {
    disarm();
    set({
      consent: "declined",
      phase: "blocked",
      note: "No capture without consent. The scripted demo is still available.",
    });
  }

  function disarm() {
    clearInterval(countdown);
    if (recorder && recorder.state !== "inactive") recorder.cancel();
    recorder = null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (videoEl) videoEl.srcObject = null;
  }

  /* ---------------------------------------------------------------
     Patient signs → clinician reads and hears
     --------------------------------------------------------------- */

  async function record() {
    // Consent is never granted by tapping the hand — only by the button that
    // says what it does. A stray tap must not start filming a patient.
    if (s.phase === "consent" || s.consent === "declined") return;
    if (!stream) {
      await arm();
      if (!stream) return;
    }
    if (!stream) return;

    const clipMs = config?.maxClipMs || 8000;

    recorder = createRecorder(stream, {
      maxMs: clipMs,
      bitsPerSecond: config?.videoBitsPerSecond,
    });
    s.msLeft = clipMs;
    set({ phase: "recording", note: "Recording — tap the hand again when the patient finishes.", error: "" });

    const started = Date.now();
    clearInterval(countdown);
    countdown = setInterval(() => {
      const left = Math.max(0, clipMs - (Date.now() - started));
      s.msLeft = left;
      if (left <= 0) clearInterval(countdown);
      emit();
    }, 200);

    // Auto-send when the clip hits its ceiling.
    window.setTimeout(() => {
      if (s.phase === "recording") stop();
    }, clipMs + 60);
  }

  async function stop() {
    if (!recorder || s.phase !== "recording") return;

    clearInterval(countdown);
    const active = recorder;
    recorder = null;

    set({ phase: "sending", note: "Reading the signs…" });

    let blob = null;
    try {
      blob = await active.stop();
    } catch (err) {
      set({ phase: "error", error: "Recording failed. Try again." });
      return;
    }

    if (!blob || blob.size < 1024) {
      set({ phase: "ready", note: "That clip was too short to read. Try again." });
      return;
    }

    try {
      const result = await provider.signToText({
        blob,
        hints: [s.lastHint].filter(Boolean),
      });

      if (!result?.text) {
        set({ phase: "ready", note: "No signs recognised. Ask the patient to repeat." });
        return;
      }

      set({
        phase: "confirm",
        transcript: result.text,
        confidence: result.confidence,
        uncertain: Boolean(result.uncertain),
        words: result.words || [],
        note: "Check this with the patient before it is spoken.",
        error: "",
      });
    } catch (err) {
      set({
        phase: "error",
        error: humanError(err),
      });
    }
  }

  /** The patient says yes: speak it and keep the turn. */
  function accept() {
    if (!s.transcript) return;

    speak(s.transcript);

    s.history.push({
      at: new Date().toISOString(),
      text: s.transcript,
      confidence: s.confidence,
      source: s.providerName,
      confirmed: true,
    });

    s.lastHint = s.transcript;
    set({ phase: "spoken", note: "Spoken to the clinician.", signing: null });
  }

  /** The patient says no: discard, no trace of it in history. */
  function discard() {
    set({
      phase: "ready",
      transcript: "",
      confidence: 0,
      words: [],
      note: "Discarded — nothing was spoken. Ask the patient to sign again.",
    });
  }

  /* ---------------------------------------------------------------
     Clinician speaks → patient sees it signed
     --------------------------------------------------------------- */

  async function sign(text) {
    if (!text) return null;

    set({ signing: { pending: true }, note: "Rendering the reply in ASL…" });

    try {
      const out = await provider.textToSign({ text });
      set({
        signing: { videoUrl: out.videoUrl, durationMs: out.durationMs, source: out.source },
        note: out.source === "mock" ? "Scripted still — no avatar engine configured." : "Signed reply ready.",
      });
      return out;
    } catch (err) {
      set({
        signing: null,
        note: "Could not render the signed reply. Showing the fallback pose.",
        error: humanError(err),
      });
      return null;
    }
  }

  /* ---------------------------------------------------------------
     Speech out
     --------------------------------------------------------------- */

  function speak(text) {
    if (!SPEECH) return false;
    try {
      SPEECH.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.95;
      SPEECH.speak(u);
      return true;
    } catch {
      return false;
    }
  }

  function stopSpeaking() {
    try {
      SPEECH?.cancel();
    } catch {
      /* nothing to cancel */
    }
  }

  return {
    get state() {
      return snapshot();
    },

    attach, // bind the live stream to a freshly rendered <video>
    arm,
    grantConsent,
    declineConsent,
    disarm,
    record,
    stop,
    accept,
    discard,
    sign,
    speak,
    stopSpeaking,
  };
}

function humanError(err) {
  const msg = String(err?.message || err || "");

  if (/401|403|unauthor|invalid.?key/i.test(msg)) {
    return "The engine rejected the key. Check that this is a PUBLIC key and that it is active.";
  }
  if (/429|rate|quota/i.test(msg)) {
    return "Rate limit or monthly quota reached on the engine account.";
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "Could not reach the engine — check the connection. Sign-Speak also blocks requests from origins it does not recognise, so a new deployment URL may need to be added to their allowlist.";
  }
  if (/did not finish in time|timeout/i.test(msg)) {
    return "The engine took too long. Short clips (one or two phrases) read fastest.";
  }
  return msg.slice(0, 180) || "The engine failed.";
}
