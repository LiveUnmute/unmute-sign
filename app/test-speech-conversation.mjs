// Continuous speech contract: a 2-second pause emits a chunk without ending
// recognition, later speech forms a second chunk, and stopping cleans up input.

import { strict as assert } from "node:assert";
import { createSpeechConversation } from "./js/speech-conversation.js";

let pass = 0;
const ok = async (name, run) => {
  try {
    await run();
    pass += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}  — ${error?.stack || error}`);
    process.exitCode = 1;
  }
};

class FakeClock {
  now = 0;
  next = 0;
  timers = new Map();

  schedule = (callback, delay) => {
    const id = ++this.next;
    this.timers.set(id, { callback, at: this.now + delay });
    return id;
  };

  cancel = (id) => this.timers.delete(id);

  tick(ms) {
    const end = this.now + ms;
    for (;;) {
      const due = [...this.timers.entries()]
        .filter(([, timer]) => timer.at <= end)
        .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!due) break;
      const [id, timer] = due;
      this.timers.delete(id);
      this.now = timer.at;
      timer.callback();
    }
    this.now = end;
  }
}

class FakeRecognition {
  static instances = [];

  constructor() {
    this.started = false;
    this.stopped = false;
    FakeRecognition.instances.push(this);
  }

  start() {
    this.started = true;
    this.onstart?.();
  }

  stop() {
    this.stopped = true;
    this.onend?.();
  }

  abort() {
    this.aborted = true;
  }

  emit(results, resultIndex = 0) {
    this.onresult?.({ results, resultIndex });
  }

  end() {
    this.onend?.();
  }
}

const result = (transcript, isFinal) => ({
  0: { transcript },
  isFinal,
});

function createTestConversation({ clock = new FakeClock(), ...overrides } = {}) {
  FakeRecognition.instances = [];
  const chunks = [];
  const transcripts = [];
  const states = [];
  const conversation = createSpeechConversation({
    Recognition: FakeRecognition,
    mediaDevices: null,
    AudioContextClass: null,
    schedule: clock.schedule,
    cancel: clock.cancel,
    onChunk: (text, index) => chunks.push({ text, index }),
    onTranscript: (text) => transcripts.push(text),
    onState: (state) => states.push(state),
    ...overrides,
  });
  return { clock, chunks, transcripts, states, conversation };
}

await ok("shows live transcript and closes a chunk after two seconds of silence", async () => {
  const test = createTestConversation();
  await test.conversation.start();
  const rec = FakeRecognition.instances[0];
  assert.equal(rec.continuous, true);
  assert.equal(rec.interimResults, true);

  rec.emit([result("Where does it hurt", false)]);
  assert.equal(test.transcripts.at(-1), "Where does it hurt");
  test.clock.tick(1_999);
  assert.equal(test.chunks.length, 0);
  test.clock.tick(1);

  assert.deepEqual(test.chunks, [{ text: "Where does it hurt", index: 1 }]);
  assert.equal(test.conversation.active, true, "a silence boundary must not stop the conversation");
});

await ok("speech after a silence boundary becomes a fresh chunk", async () => {
  const test = createTestConversation();
  await test.conversation.start();
  const rec = FakeRecognition.instances[0];

  rec.emit([result("My chest hurts", true)]);
  test.clock.tick(2_000);
  assert.deepEqual(test.chunks, [{ text: "My chest hurts", index: 1 }]);

  rec.emit([result("My chest hurts", true), result("For two days", false)], 1);
  assert.equal(test.transcripts.at(-1), "My chest hurts For two days");
  test.clock.tick(2_000);

  assert.deepEqual(test.chunks, [
    { text: "My chest hurts", index: 1 },
    { text: "For two days", index: 2 },
  ]);
  assert.equal(test.conversation.active, true);
});

await ok("a late final result for an already flushed interim does not create a duplicate chunk", async () => {
  const test = createTestConversation();
  await test.conversation.start();
  const rec = FakeRecognition.instances[0];
  const interim = result("Where does it hurt", false);

  rec.emit([interim]);
  test.clock.tick(2_000);
  assert.deepEqual(test.chunks, [{ text: "Where does it hurt", index: 1 }]);

  rec.emit([result("Where does it hurt", true)]);
  assert.deepEqual(test.chunks, [{ text: "Where does it hurt", index: 1 }]);
  assert.equal(test.transcripts.at(-1), "Where does it hurt");
});

await ok("recognition reconnects after a browser ends its continuous session", async () => {
  const test = createTestConversation();
  await test.conversation.start();
  const first = FakeRecognition.instances[0];
  first.end();
  assert.equal(FakeRecognition.instances.length, 1);
  test.clock.tick(250);
  assert.equal(FakeRecognition.instances.length, 2);
  assert.equal(FakeRecognition.instances[1].started, true);
  assert.equal(test.conversation.active, true);
});

await ok("end tap flushes the current chunk and releases recognition and microphone meter", async () => {
  let trackStops = 0;
  let audioClosed = 0;
  let sourceDisconnected = 0;
  let framesCancelled = 0;
  const stream = {
    getTracks: () => [{ stop: () => { trackStops += 1; } }],
  };
  const mediaDevices = { getUserMedia: async () => stream };
  class FakeAudioContext {
    state = "running";
    createMediaStreamSource() {
      return { connect() {}, disconnect() { sourceDisconnected += 1; } };
    }
    createAnalyser() {
      return { fftSize: 512, getByteTimeDomainData() {} };
    }
    close() { audioClosed += 1; return Promise.resolve(); }
  }
  const testWithMeter = createTestConversation({
    mediaDevices,
    AudioContextClass: FakeAudioContext,
    requestFrame: () => 33,
    cancelFrame: (id) => { if (id === 33) framesCancelled += 1; },
  });

  await testWithMeter.conversation.start();
  const rec = FakeRecognition.instances[0];
  rec.emit([result("I need help", false)]);
  await testWithMeter.conversation.stop();

  assert.equal(testWithMeter.conversation.active, false);
  assert.equal(rec.stopped, true);
  assert.deepEqual(testWithMeter.chunks, [{ text: "I need help", index: 1 }]);
  assert.equal(trackStops, 1);
  assert.equal(audioClosed, 1);
  assert.equal(sourceDisconnected, 1);
  assert.equal(framesCancelled, 1);
});

console.log(`\n${pass} passed`);
