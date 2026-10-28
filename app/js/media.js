// Sign media and the scripted conversation.
//
// ── Swapping an image for a video ─────────────────────────────────────────
// Every entry below has a `media` field. Point it at an .mp4, .webm or .mov
// and the app renders a looping video instead of a still. Nothing else
// changes — same framing, same crop, same sheet.
//
//     { media: "media/patient-02.jpg" }              still
//     { media: "media/patient-02.mp4" }              video
//     { media: "https://example.com/sign-02.mp4" }   remote video
//
// ── Adding a pose ─────────────────────────────────────────────────────────
// Add an object to PATIENT_SIGNS or TRANSLATOR_SIGNS. To keep the character
// consistent, generate new stills from the existing ones (image-to-image with
// the same prompt, changing only the hands) and drop them in media/.
// Keep the subject centred with clear space above and below the hands:
// the stage crops the sides, never the top or bottom.

export const PATIENT_SIGNS = [
  {
    id: "dont-understand",
    text: "I don't understand.",
    media: "media/patient-01.jpg",
  },
  {
    id: "chest",
    text: "My chest hurts.",
    media: "media/patient-02.jpg",
  },
  {
    id: "two-days",
    text: "It started two days ago.",
    media: "media/patient-03.jpg",
  },
  {
    id: "throat",
    text: "My throat is sore.",
    media: "media/patient-04.jpg",
  },
  {
    id: "dizzy",
    text: "I get dizzy when I stand up.",
    media: "media/patient-05.jpg",
  },
];

export const TRANSLATOR_SIGNS = [
  {
    id: "where-hurt",
    text: "Where does it hurt?",
    media: "media/translator-01.jpg",
  },
  {
    id: "severity",
    text: "On a scale of 1 to 5, how bad is it?",
    media: "media/translator-02.jpg",
  },
  {
    id: "medication",
    text: "Are you taking any medication?",
    media: "media/translator-03.jpg",
  },
  {
    id: "moment",
    text: "One moment, please.",
    media: "media/translator-04.jpg",
  },
];

// The pre-arranged conversation. `who` decides which character appears and
// which direction the screen is in.
export const SCRIPT = [
  { who: "clinician", key: "where-hurt" },
  { who: "patient",   key: "chest" },
  { who: "clinician", key: "severity" },
  { who: "patient",   key: "two-days" },
  { who: "clinician", key: "medication" },
  { who: "patient",   key: "dizzy" },
];

const byId = (list, key) => list.find((e) => e.id === key) || list[0];

/** Resolve a script step to its full entry. */
export function resolveStep(step) {
  return step.who === "patient"
    ? byId(PATIENT_SIGNS, step.key)
    : byId(TRANSLATOR_SIGNS, step.key);
}

export const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

/** Is this media a video, so the caller renders <video> instead of <img>? */
export const isVideo = (src) => VIDEO_RE.test(src);

/**
 * The markup for a media surface.
 * `poster` is optional and only applies to video.
 */
export function mediaMarkup(src, alt = "", poster = "") {
  if (isVideo(src)) {
    return `<video
        class="stage-media"
        src="${src}"
        ${poster ? `poster="${poster}"` : ""}
        autoplay muted loop playsinline
        preload="auto"
        aria-label="${alt}"></video>`;
  }
  return `<img class="stage-media" src="${src}" alt="${alt}" decoding="async">`;
}
