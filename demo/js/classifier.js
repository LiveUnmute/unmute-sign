// Handshape feature extraction and prototype classification.
//
// IMPORTANT — what this is and is not:
// This is a GEOMETRIC PROTOTYPE classifier. It does not learn. It measures
// finger extension from 21 hand landmarks and matches the resulting pattern
// against a handful of hand-authored templates (ASL numerals 1-5 and three
// gesture answers).
//
// It is NOT a trained ASL recognition model. It has no accuracy figure, no
// clinical validation, and no signer-independent evaluation. It exists to
// demonstrate the interaction model — prompt, sign, top-3 candidates, patient
// confirms — and to prove the on-device pipeline works.
//
// Replacing this file with a trained model behind the same interface is the
// whole point of the design.

const FINGERS = {
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
};

const THUMB = [1, 2, 3, 4];

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));

/** Hand span used to normalise every measurement, so distance from camera stops mattering. */
function handScale(lm) {
  const d = dist(lm[0], lm[9]);
  return d > 1e-6 ? d : 1e-6;
}

/**
 * Returns [thumb, index, middle, ring, pinky] as booleans.
 * A finger counts as extended when its tip sits meaningfully further from the
 * wrist than its middle joint does.
 */
export function fingerPattern(lm) {
  const scale = handScale(lm);
  const wrist = lm[0];

  const extended = (pts) => {
    const pip = lm[pts[1]];
    const tip = lm[pts[3]];
    return dist(wrist, tip) > dist(wrist, pip) * 1.12;
  };

  // Thumb extension is measured against the pinky knuckle rather than the
  // index knuckle: an open thumb swings far from it, a thumb tucked across the
  // palm sits close to it. Measuring to the index knuckle misfires, because a
  // folded thumb rests right next to it.
  const thumbTip = lm[THUMB[3]];
  const thumbOut = dist(thumbTip, lm[17]) / scale > 1.0;

  return [
    thumbOut,
    extended(FINGERS.index),
    extended(FINGERS.middle),
    extended(FINGERS.ring),
    extended(FINGERS.pinky),
  ];
}

const patternKey = (p) => p.map((v) => (v ? 1 : 0)).join("");

/** Hand-authored templates. Key = binary finger pattern, thumb first. */
const TEMPLATES = {
  // ASL numerals
  "01000": { concept: "1", weight: 1.0 },
  "01100": { concept: "2", weight: 1.0 },
  "11100": { concept: "3", weight: 1.0 },
  "01111": { concept: "4", weight: 1.0 },
  "11111": { concept: "5", weight: 1.0 },

  // Gesture answers
  "10000": { concept: "THUMB", weight: 1.0 }, // disambiguated by orientation
  "00000": { concept: "FIST", weight: 1.0 },
};

/** How similar two patterns are, as a 0-1 score. */
function similarity(a, b) {
  let same = 0;
  for (let i = 0; i < 5; i++) if (a[i] === b[i]) same++;
  return same / 5;
}

/**
 * Classify one frame against the vocabulary the current question allows.
 *
 * @param {Array} lm        21 hand landmarks
 * @param {string[]} allowed  concept ids permitted by the current question
 * @returns {Array<{concept:string, score:number}>} sorted, unfiltered
 */
export function classifyFrame(lm, allowed) {
  const pattern = fingerPattern(lm);
  const key = patternKey(pattern);
  const scale = handScale(lm);
  const out = new Map();

  const add = (concept, score) => {
    if (!allowed.includes(concept)) return;
    if (score > (out.get(concept) || 0)) out.set(concept, score);
  };

  // --- numerals: exact pattern match, softened by Hamming similarity ---
  for (const [tplKey, tpl] of Object.entries(TEMPLATES)) {
    if (!/^\d{5}$/.test(tplKey)) continue;
    const tplPattern = tplKey.split("").map((c) => c === "1");
    if (tpl.concept === "THUMB" || tpl.concept === "FIST") continue;
    const exact = key === tplKey;
    const sim = similarity(pattern, tplPattern);
    if (exact) add(tpl.concept, 1.0);
    else if (sim >= 0.8) add(tpl.concept, sim * 0.85);
  }

  // --- thumb alone: yes (up) / no (down) by orientation ---
  if (key === "10000") {
    const thumbTip = lm[4];
    const wrist = lm[0];
    const vertical = (wrist.y - thumbTip.y) / scale; // + means tip above wrist
    if (vertical > 0.25) add("yes", Math.min(1, 0.7 + vertical * 0.3));
    else if (vertical < -0.25) add("no", Math.min(1, 0.7 + Math.abs(vertical) * 0.3));
  }

  // --- open palm: "not sure" in a yes/no context ---
  if (key === "11111") add("not_sure", 0.92);

  // --- fist with two fingers curled reads as "no" when offered ---
  if (key === "00000") add("no", 0.55);

  return [...out.entries()]
    .map(([concept, score]) => ({ concept, score }))
    .sort((a, b) => b.score - a.score);
}

/** Exponential smoothing so a single noisy frame cannot flip the display. */
export function createSmoother(alpha = 0.28) {
  let state = new Map();
  return {
    update(frameScores) {
      const next = new Map();
      for (const [k, v] of state) next.set(k, v * (1 - alpha));
      for (const { concept, score } of frameScores) {
        next.set(concept, (next.get(concept) || 0) * (1 - alpha) + score * alpha);
      }
      // decay anything untouched
      for (const [k, v] of next) {
        if (!frameScores.some((f) => f.concept === k)) next.set(k, v * (1 - alpha));
        if (v < 0.02) next.delete(k);
      }
      state = next;
      return this.top();
    },
    top(n = 3) {
      return [...state.entries()]
        .map(([concept, score]) => ({ concept, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, n);
    },
    reset() {
      state = new Map();
    },
  };
}

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];
