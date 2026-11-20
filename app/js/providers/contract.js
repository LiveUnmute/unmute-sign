// The translation contract.
//
// Everything the UI knows about sign language lives behind this interface.
// The app calls these two methods and renders whatever comes back — it does
// not know whether the answer came from Talksign, from a different vendor, or
// from the scripted mock.
//
// That is the whole point: when the Talksign key arrives, `talksign.js` starts
// returning real results and nothing else in the codebase changes.

/**
 * @typedef {Object} Translation
 * @property {string} text        What was said, in English.
 * @property {number} confidence  0–1. The UI must show this rather than hide it.
 * @property {string} source      "talksign" | "mock" | "error"
 * @property {boolean} uncertain  True when the provider is guessing. A clinical
 *                                tool that hides this is worse than one that
 *                                admits it.
 */

/**
 * A provider translates in both directions.
 *
 * @typedef {Object} Provider
 * @property {string} name
 *
 * @property {(opts: {
 *   stream: MediaStream|null,
 *   hints?: string[],
 *   timeoutMs?: number
 * }) => Promise<Translation>} signToText
 *   Sign language → English. `hints` is the clinical phrase list; passing it
 *   lets a provider bias its decoder toward words that matter on a ward
 *   ("allergic", "chest", "dose") instead of toward general conversation.
 *
 * @property {(opts: {
 *   text: string,
 *   voice?: string
 * }) => Promise<{ videoUrl: string, durationMs: number, source: string }>} textToSign
 *   English → sign language. Returns a URL the caller can render — a video
 *   file, a stream, or a WebGL canvas source.
 *
 * @property {() => Promise<boolean>} healthy
 *   Cheap check used before a clinician starts a conversation, so a dead key
 *   is discovered at sign-in rather than mid-sentence with a patient present.
 */

export const CONTRACT_VERSION = "1.0";

/**
 * Normalise confidence to 0–1 so providers can report it however they like.
 * @param {number|null|undefined} value
 * @param {number} fallback
 */
export function normaliseConfidence(value, fallback = 0) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  if (value > 1) return Math.min(value / 100, 1);
  return Math.max(0, Math.min(1, value));
}
