// The scripted provider.
//
// This is what runs today, with no key and no network. It is not a stand-in for
// a model — it returns the pre-arranged script, and every caller is expected to
// label the result as simulated in the UI.
//
// Its real job is to be a working implementation of the contract, so the rest of
// the app can be finished and tested before Talksign is wired in.

import { normaliseConfidence } from "./contract.js";
import { PATIENT_SIGNS, TRANSLATOR_SIGNS } from "../media.js";

let cursor = { sign: 0, speak: 0 };

export function createMockProvider() {
  return {
    name: "mock",

    async signToText({ hints } = {}) {
      // If the caller passed a clinical phrase list, prefer a sign in it.
      const pool = hints?.length
        ? hints.map((text) => ({ text }))
        : PATIENT_SIGNS;

      const entry = pool[cursor.sign % pool.length];
      cursor.sign += 1;

      return {
        text: entry.text,
        confidence: normaliseConfidence(94 + Math.random() * 5, 0.96),
        source: "mock",
        uncertain: false,
      };
    },

    async textToSign({ text } = {}) {
      const match =
        TRANSLATOR_SIGNS.find((e) => e.text === text) ||
        TRANSLATOR_SIGNS[cursor.speak++ % TRANSLATOR_SIGNS.length];

      return {
        // The mock ships stills, not video. The caller renders either.
        videoUrl: match.media,
        durationMs: 2400,
        source: "mock",
      };
    },

    async healthy() {
      return true;
    },
  };
}
