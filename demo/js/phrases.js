// The supported vocabulary for the live MVP.
//
// Two separate lists, because the two directions are different problems.
//
//   CLINICIAN_PHRASES  — English speech the app can turn into an ASL output.
//   PATIENT_RESPONSES  — meaning the app can recognise from the patient, either
//                        from the camera (a very small set) or by selection.
//
// Nothing here is a claim of general translation. If the clinician says
// something outside this list, the app says so instead of guessing. That is
// the single most important behaviour in the whole build: a clinical tool that
// silently guesses is worse than one that admits it missed.

/** Clinician speech the app has an ASL output for. */
export const CLINICIAN_PHRASES = [
  { id: "where_hurts",  text: "Where does it hurt?",              keywords: ["where", "hurt", "pain", "hurts", "hurting"] },
  { id: "how_long",     text: "How long has this been going on?",  keywords: ["how", "long", "when", "start", "started", "began"] },
  { id: "severity",     text: "On a scale of 1 to 5, how bad is the pain?", keywords: ["scale", "bad", "severe", "level", "rate", "1", "5", "five"] },
  { id: "fever",        text: "Do you have a fever?",              keywords: ["fever", "temperature", "hot", "chills"] },
  { id: "dizzy",        text: "Are you feeling dizzy?",            keywords: ["dizzy", "lightheaded", "faint", "spinning"] },
  { id: "allergies",    text: "Do you have any allergies?",        keywords: ["allergies", "allergy", "allergic", "reaction"] },
  { id: "medication",   text: "Are you taking any medication?",    keywords: ["medication", "medicine", "medicines", "drugs", "taking", "pills"] },
  { id: "first_visit",  text: "Is this your first visit for this problem?", keywords: ["first", "visit", "before", "seen"] },
  { id: "understand",   text: "Do you understand what I have explained?",   keywords: ["understand", "clear", "explained", "explain"] },
  { id: "repeat",       text: "Could you sign that again, please?", keywords: ["repeat", "again", "sign", "please", "slower"] },
  { id: "wait",         text: "One moment, please.",               keywords: ["moment", "wait", "second", "minute"] },
  { id: "interpreter",  text: "Do you need an interpreter for the next conversation?", keywords: ["interpreter", "translator", "sign", "language"] },
];

/** Meaning the app can recognise back from the patient. */
export const PATIENT_RESPONSES = [
  { id: "yes",        text: "Yes",                        spoken: "Yes",                        signs: "THUMB_UP",   group: "answer" },
  { id: "no",         text: "No",                         spoken: "No",                         signs: "THUMB_DOWN", group: "answer" },
  { id: "not_sure",   text: "I'm not sure",               spoken: "I am not sure",              signs: "OPEN_PALM",  group: "answer" },
  { id: "repeat",     text: "Please repeat that",         spoken: "Please repeat that",         signs: null,         group: "need" },
  { id: "dont_understand", text: "I don't understand",    spoken: "I do not understand",        signs: null,         group: "need" },
  { id: "head",       text: "My head hurts",              spoken: "My head hurts",              signs: null,         group: "where" },
  { id: "stomach",    text: "My stomach hurts",           spoken: "My stomach hurts",           signs: null,         group: "where" },
  { id: "chest",      text: "My chest hurts",             spoken: "My chest hurts",             signs: null,         group: "where" },
  { id: "arm",        text: "My arm hurts",               spoken: "My arm hurts",               signs: null,         group: "where" },
  { id: "today",      text: "It started today",           spoken: "It started today",           signs: null,         group: "when" },
  { id: "days",       text: "It started a few days ago",  spoken: "It started a few days ago",  signs: null,         group: "when" },
  { id: "week",       text: "It started over a week ago", spoken: "It started over a week ago", signs: null,         group: "when" },
  { id: "p1", text: "1", spoken: "One",   signs: "1", group: "level" },
  { id: "p2", text: "2", spoken: "Two",   signs: "2", group: "level" },
  { id: "p3", text: "3", spoken: "Three", signs: "3", group: "level" },
  { id: "p4", text: "4", spoken: "Four",  signs: "4", group: "level" },
  { id: "p5", text: "5", spoken: "Five",  signs: "5", group: "level" },
];

export const RESPONSE_GROUPS = [
  { id: "answer", label: "Answers" },
  { id: "need",   label: "Ask again" },
  { id: "where",  label: "Where it hurts" },
  { id: "when",   label: "When it started" },
  { id: "level",  label: "Pain level, 1–5" },
];

const norm = (s) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

// Words that appear in many phrases, so a single hit on one of them says
// almost nothing. "Where is the bathroom?" contains "where" but is not a
// question about pain. A lone generic hit is not enough to match.
const GENERIC = new Set([
  "where", "when", "how", "long", "please", "second", "minute", "sign",
  "taking", "bad", "level", "rate", "before", "seen", "clear", "explain",
  "explained", "start", "started", "began", "hurt", "hurts", "hurting",
  "again", "moment", "wait", "first", "visit", "understand",
]);

/**
 * Match spoken English against the supported clinician phrases.
 *
 * Deliberately conservative: a phrase is only matched when it clears a keyword
 * threshold. Below that we return null and the UI says the phrase is not
 * supported, rather than showing the patient an approximate ASL output.
 */
export function matchClinicianPhrase(said) {
  const words = new Set(norm(said).split(" ").filter(Boolean));
  if (words.size === 0) return null;

  let best = null;
  for (const phrase of CLINICIAN_PHRASES) {
    const matched = phrase.keywords.filter((k) => words.has(k));
    if (matched.length === 0) continue;

    // A single specific keyword is enough ("temperature" → fever). A single
    // generic one is not ("where" alone could be anything).
    const specific = matched.filter((k) => !GENERIC.has(k)).length;
    if (specific === 0 && matched.length < 2) continue;

    const score = Math.min(1, (specific * 0.5) + (matched.length * 0.25));
    if (!best || score > best.score) best = { phrase, score, matched };
  }

  if (!best) return null;
  return { ...best.phrase, score: best.score, matched: best.matched };
}

export function responseById(id) {
  return PATIENT_RESPONSES.find((r) => r.id === id) || null;
}
