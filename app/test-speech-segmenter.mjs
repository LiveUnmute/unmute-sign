// A 2-second silence ends a chunk; renewed speech resets the window.

import { strict as assert } from "node:assert";
import { createSilenceSegmenter } from "./js/speech-segmenter.js";

let pass = 0;
const ok = (name, run) => {
  try {
    run();
    pass += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}  — ${error?.stack || error}`);
    process.exitCode = 1;
  }
};

function fakeTimers() {
  let next = 0;
  const timers = new Map();
  return {
    timers,
    schedule(callback, delay) {
      const id = ++next;
      timers.set(id, { callback, delay });
      return id;
    },
    cancel(id) { timers.delete(id); },
    fire(id) {
      const entry = timers.get(id);
      if (!entry) return false;
      timers.delete(id);
      entry.callback();
      return true;
    },
  };
}

ok("silence callback is delayed by exactly two seconds", () => {
  const clock = fakeTimers();
  let flushed = 0;
  const segmenter = createSilenceSegmenter({
    onSilence: () => { flushed += 1; },
    schedule: clock.schedule,
    cancel: clock.cancel,
  });
  segmenter.markVoice();
  const [id, timer] = [...clock.timers.entries()][0];
  assert.equal(timer.delay, 2_000);
  assert.equal(flushed, 0);
  clock.fire(id);
  assert.equal(flushed, 1);
});

ok("speaking again restarts the two-second silence window", () => {
  const clock = fakeTimers();
  let flushed = 0;
  const segmenter = createSilenceSegmenter({
    onSilence: () => { flushed += 1; },
    schedule: clock.schedule,
    cancel: clock.cancel,
  });
  segmenter.markVoice();
  const first = [...clock.timers.keys()][0];
  segmenter.markVoice();
  assert.equal(clock.timers.has(first), false);
  const second = [...clock.timers.keys()][0];
  assert.equal(clock.fire(first), false);
  assert.equal(flushed, 0);
  clock.fire(second);
  assert.equal(flushed, 1);
});

ok("reset and stop cancel pending boundaries", () => {
  const clock = fakeTimers();
  let flushed = 0;
  const segmenter = createSilenceSegmenter({
    onSilence: () => { flushed += 1; },
    schedule: clock.schedule,
    cancel: clock.cancel,
  });
  segmenter.markVoice();
  segmenter.reset();
  assert.equal(clock.timers.size, 0);
  segmenter.markVoice();
  segmenter.stop();
  assert.equal(clock.timers.size, 0);
  segmenter.markVoice();
  assert.equal(clock.timers.size, 0);
  assert.equal(flushed, 0);
});

console.log(`\n${pass} passed`);
