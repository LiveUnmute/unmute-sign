// Silence-based speech boundaries for clinician turns. Audio analysis calls
// markVoice() while speech is present; after `silenceMs` without another mark,
// onSilence() runs once for that segment.

export function createSilenceSegmenter({
  silenceMs = 2_000,
  onSilence = () => {},
  schedule = setTimeout,
  cancel = clearTimeout,
} = {}) {
  let timer = null;
  let active = false;
  let stopped = false;

  function reset() {
    if (timer !== null) cancel(timer);
    timer = null;
    active = false;
  }

  function markVoice() {
    if (stopped) return;
    active = true;
    if (timer !== null) cancel(timer);
    timer = schedule(() => {
      timer = null;
      if (!active || stopped) return;
      active = false;
      onSilence();
    }, silenceMs);
  }

  function stop() {
    reset();
    stopped = true;
  }

  return {
    markVoice,
    reset,
    stop,
    get armed() {
      return timer !== null;
    },
  };
}
