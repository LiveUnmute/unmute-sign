// Continuous clinician speech capture with silence-delimited chunks.
// SpeechRecognition supplies the English transcript; a separate audio meter
// resets a two-second silence timer even when a browser delays transcript
// events. This is spoken-language transcription, not ASL recognition.

import { createSilenceSegmenter } from "./speech-segmenter.js";

function browserRecognition() {
  const w = typeof window === "undefined" ? null : window;
  return w?.SpeechRecognition || w?.webkitSpeechRecognition || null;
}

function browserMediaDevices() {
  return typeof navigator === "undefined" ? null : navigator.mediaDevices || null;
}

function browserAudioContext() {
  const w = typeof window === "undefined" ? null : window;
  return w?.AudioContext || w?.webkitAudioContext || null;
}

function joinText(...parts) {
  return parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function stopTracks(stream) {
  try { stream?.getTracks?.().forEach((track) => track.stop()); } catch { /* best effort */ }
}

export function createSpeechConversation(options = {}) {
  const Recognition = options.Recognition === undefined ? browserRecognition() : options.Recognition;
  const mediaDevices = options.mediaDevices === undefined ? browserMediaDevices() : options.mediaDevices;
  const AudioContextClass = options.AudioContextClass === undefined ? browserAudioContext() : options.AudioContextClass;
  const schedule = options.schedule || setTimeout;
  const cancel = options.cancel || clearTimeout;
  const requestFrame = options.requestFrame || (typeof requestAnimationFrame === "function" ? requestAnimationFrame : null);
  const cancelFrame = options.cancelFrame || (typeof cancelAnimationFrame === "function" ? cancelAnimationFrame : null);
  const silenceMs = options.silenceMs || 2_000;
  const restartDelayMs = options.restartDelayMs ?? 250;
  const stopDrainMs = options.stopDrainMs ?? 1_000;
  const speechThreshold = options.speechThreshold ?? 0.022;
  const onTranscript = options.onTranscript || (() => {});
  const onChunk = options.onChunk || (() => {});
  const onState = options.onState || (() => {});
  const onLevel = options.onLevel || (() => {});

  let active = false;
  let stopping = false;
  let recognition = null;
  let restartTimer = null;
  let stopTimer = null;
  let stopPromise = null;
  let resolveStop = null;
  let stream = null;
  let audioContext = null;
  let audioSource = null;
  let analyser = null;
  let audioData = null;
  let frameId = null;
  let meterAvailable = false;
  let finalText = "";
  let interimText = "";
  let completed = [];
  let chunkIndex = 0;
  let segmenter = null;
  let activeResultState = null;

  function notifyState(patch = {}) {
    try {
      onState({
        active,
        stopping,
        listening: Boolean(recognition),
        ...patch,
      });
    } catch (error) {
      console.warn("Speech conversation state callback failed:", error);
    }
  }

  function currentChunkText() {
    return joinText(finalText, interimText);
  }

  function notifyTranscript() {
    const transcript = joinText(completed.join(" "), currentChunkText());
    try {
      onTranscript(transcript, {
        active,
        stopping,
        completed: completed.slice(),
        current: currentChunkText(),
        chunkIndex,
      });
    } catch (error) {
      console.warn("Speech transcript callback failed:", error);
    }
  }

  function flushChunk() {
    if (!active && !stopping) return null;
    const text = currentChunkText();
    finalText = "";
    interimText = "";
    if (activeResultState) {
      for (const index of activeResultState.pendingInterim) {
        activeResultState.flushedInterim.add(index);
      }
      activeResultState.pendingInterim.clear();
    }
    segmenter?.reset();

    if (!text) {
      notifyTranscript();
      return null;
    }

    chunkIndex += 1;
    completed.push(text);
    notifyTranscript();
    try {
      onChunk(text, chunkIndex);
    } catch (error) {
      console.warn("Speech chunk callback failed:", error);
    }
    return { text, index: chunkIndex };
  }

  function markSpeechActivity() {
    if (active) segmenter?.markVoice();
  }

  function stopMeter() {
    if (frameId !== null && cancelFrame) cancelFrame(frameId);
    frameId = null;
    meterAvailable = false;
    try { audioSource?.disconnect(); } catch { /* best effort */ }
    audioSource = null;
    analyser = null;
    audioData = null;
    stopTracks(stream);
    stream = null;
    if (audioContext) {
      try {
        const closing = audioContext.close?.();
        closing?.catch?.(() => {});
      } catch { /* best effort */ }
    }
    audioContext = null;
    try { onLevel(0); } catch { /* best effort */ }
  }

  function meterTick() {
    if (!active || !analyser || !audioData) return;
    try {
      analyser.getByteTimeDomainData(audioData);
      let sum = 0;
      for (const sample of audioData) {
        const centered = sample - 128;
        sum += centered * centered;
      }
      const rms = Math.sqrt(sum / audioData.length) / 128;
      if (rms > speechThreshold) markSpeechActivity();
      try { onLevel(rms); } catch { /* best effort */ }
    } catch (error) {
      console.warn("Speech activity meter stopped:", error);
      stopMeter();
      return;
    }
    if (active && requestFrame) frameId = requestFrame(meterTick);
  }

  async function startMeter() {
    if (!mediaDevices?.getUserMedia) return false;
    let openedStream;
    try {
      openedStream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
    } catch (error) {
      if (active) notifyState({ warning: "Microphone metering is unavailable; trying speech recognition." });
      return false;
    }

    if (!active) {
      stopTracks(openedStream);
      return false;
    }

    stream = openedStream;
    if (!AudioContextClass || !requestFrame) return false;

    try {
      audioContext = new AudioContextClass();
      if (audioContext.state === "suspended") await audioContext.resume();
      if (!active) return false;
      audioSource = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      audioSource.connect(analyser);
      audioData = new Uint8Array(analyser.fftSize);
      meterAvailable = true;
      frameId = requestFrame(meterTick);
      return true;
    } catch (error) {
      meterAvailable = false;
      if (active) notifyState({ warning: "Microphone metering is unavailable; trying speech recognition." });
      return false;
    }
  }

  function detachRecognition(rec) {
    if (!rec) return;
    rec.onstart = null;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    try { rec.stop(); } catch { /* may already be stopped */ }
    try { rec.abort?.(); } catch { /* best effort */ }
  }

  function finishStop() {
    if (!stopping) return;
    if (stopTimer !== null) cancel(stopTimer);
    stopTimer = null;
    if (recognition) {
      const old = recognition;
      recognition = null;
      detachRecognition(old);
    }
    flushChunk();
    segmenter?.stop();
    segmenter = null;
    stopping = false;
    const resolve = resolveStop;
    resolveStop = null;
    stopPromise = null;
    notifyState({ listening: false, warning: "" });
    resolve?.();
  }

  function handleRecognitionResult(rec, event, resultState) {
    if ((recognition !== rec && !stopping) || (!active && !stopping)) return;
    const results = event?.results || [];
    const start = Number.isInteger(event?.resultIndex) ? event.resultIndex : 0;
    const newFinals = [];

    for (let i = start; i < results.length; i += 1) {
      const result = results[i];
      const text = String(result?.[0]?.transcript || "").trim();
      if (!text) continue;
      const previous = resultState.seen.get(i);
      if (result.isFinal) {
        const wasAlreadyFlushed = resultState.flushedInterim.delete(i);
        if (!previous?.isFinal && !wasAlreadyFlushed) newFinals.push(text);
        resultState.pendingInterim.delete(i);
      } else {
        if (previous?.text !== text) resultState.flushedInterim.delete(i);
        if (!resultState.flushedInterim.has(i)) resultState.pendingInterim.add(i);
      }
      resultState.seen.set(i, { text, isFinal: Boolean(result.isFinal) });
    }

    const interims = [];
    for (let i = 0; i < results.length; i += 1) {
      const result = results[i];
      if (result?.isFinal || resultState.flushedInterim.has(i)) continue;
      const text = String(result?.[0]?.transcript || "").trim();
      if (text) interims.push(text);
    }

    if (newFinals.length) finalText = joinText(finalText, newFinals.join(" "));
    interimText = interims.join(" ");

    if (newFinals.length || interims.length) {
      // Interims indicate live speech even if the audio level is too low for
      // VAD. A final-only event is a fallback when VAD did not leave a silence
      // timer armed; flushing an already-completed interim is explicitly
      // suppressed above so it cannot become a duplicate chunk.
      if (interims.length || (!meterAvailable && newFinals.length) || (newFinals.length && !segmenter?.armed)) {
        markSpeechActivity();
      }
      notifyTranscript();
    }
  }

  function finishRecognition(rec) {
    if (recognition !== rec) return;
    recognition = null;

    if (stopping) {
      finishStop();
      return;
    }
    if (!active) return;

    // SpeechRecognition instances can stop themselves after a quiet interval.
    // Preserve an unfinalized interim as part of the current chunk before the
    // replacement recognizer starts with a fresh result index.
    if (activeResultState) {
      for (const index of activeResultState.pendingInterim) {
        activeResultState.flushedInterim.add(index);
      }
      activeResultState.pendingInterim.clear();
    }
    if (interimText) {
      finalText = joinText(finalText, interimText);
      interimText = "";
    }

    notifyState({ listening: false });
    if (restartTimer !== null) cancel(restartTimer);
    restartTimer = schedule(() => {
      restartTimer = null;
      if (active) startRecognition();
    }, restartDelayMs);
  }

  function recognitionError(rec, event) {
    if (recognition !== rec && !stopping) return;
    const error = String(event?.error || "unknown");
    if (error === "not-allowed" || error === "service-not-allowed") {
      notifyState({ error: "Microphone permission is blocked. Allow it in your browser, then tap Speak to retry." });
      stop().catch(() => {});
      return;
    }
    if (error !== "no-speech" && error !== "aborted") {
      notifyState({ warning: `Speech recognition paused (${error}); reconnecting.` });
    }
  }

  function startRecognition() {
    if (!Recognition || !active || stopping) return false;
    let rec;
    try {
      rec = new Recognition();
    } catch (error) {
      active = false;
      segmenter?.stop();
      segmenter = null;
      stopMeter();
      notifyState({ listening: false, error: "Speech recognition could not start. Check microphone access and try again." });
      return false;
    }
    const resultState = {
      seen: new Map(),
      pendingInterim: new Set(),
      flushedInterim: new Set(),
    };
    activeResultState = resultState;
    rec.lang = options.language || "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      if (recognition === rec && active) notifyState({ listening: true, warning: "" });
    };
    rec.onresult = (event) => handleRecognitionResult(rec, event, resultState);
    rec.onerror = (event) => recognitionError(rec, event);
    rec.onend = () => finishRecognition(rec);
    recognition = rec;
    try {
      rec.start();
      notifyState({ listening: true });
      return true;
    } catch (error) {
      if (recognition === rec) recognition = null;
      detachRecognition(rec);
      active = false;
      segmenter?.stop();
      segmenter = null;
      stopMeter();
      notifyState({ listening: false, error: "Speech recognition could not start. Check microphone access and try again." });
      return false;
    }
  }

  async function start() {
    if (active) return true;
    if (stopping) await stopPromise;
    if (active) return true;
    if (!Recognition) {
      notifyState({ active: false, error: "Speech recognition is not available in this browser. Try a recent Chrome or Edge build." });
      return false;
    }

    if (restartTimer !== null) cancel(restartTimer);
    if (stopTimer !== null) cancel(stopTimer);
    restartTimer = null;
    stopTimer = null;
    finalText = "";
    interimText = "";
    completed = [];
    chunkIndex = 0;
    activeResultState = null;
    segmenter?.stop();
    segmenter = createSilenceSegmenter({
      silenceMs,
      onSilence: () => {
        if (active) flushChunk();
      },
      schedule,
      cancel,
    });

    active = true;
    stopping = false;
    notifyTranscript();
    notifyState({ error: "", warning: "", listening: false });

    // Initiate the meter permission request, then start SpeechRecognition in
    // the same user gesture (some browsers require activation). If metering is
    // blocked or unsupported, recognition can still proceed on its own.
    const meterPromise = startMeter();
    if (!active) return false;
    const recognitionStarted = startRecognition();
    if (!recognitionStarted) return false;
    await meterPromise;
    return active;
  }

  function stop() {
    if (!active && !stopping) return Promise.resolve();
    if (stopping) return stopPromise || Promise.resolve();

    active = false;
    stopping = true;
    if (restartTimer !== null) cancel(restartTimer);
    restartTimer = null;
    segmenter?.reset();
    stopMeter();
    notifyState({ listening: Boolean(recognition), warning: "" });

    const rec = recognition;
    if (!rec) {
      finishStop();
      return Promise.resolve();
    }

    stopPromise = new Promise((resolve) => { resolveStop = resolve; });
    stopTimer = schedule(finishStop, stopDrainMs);
    try {
      rec.stop();
    } catch {
      finishStop();
    }
    return stopPromise || Promise.resolve();
  }

  return {
    start,
    stop,
    get active() { return active; },
    get transcript() { return joinText(completed.join(" "), currentChunkText()); },
  };
}
