# Unmute — demos

Two builds live here:

| Page | What it demonstrates |
|---|---|
| **`live.html`** | The MVP direction: one tablet, one continuous two-way conversation. Open → pick camera → start. |
| **`index.html`** | The bounded clinical intake: four questions, patient-confirmed answers, structured record. |

Both run from the same server (`npm start`, port 8080) once `npm run setup` has
placed the MediaPipe runtime in `./vendor`.

---

# Clinical Intake Demo

A working, self-contained demonstration of the interaction model: a Deaf patient signs
a bounded answer, the app proposes its three best interpretations, **the patient confirms
which is correct**, and the clinician sees a structured record.

Built to be shown on a laptop in a hospital corridor.

---

## Camera access — read this first

Browsers only allow the camera in a **top-level tab**, not inside an embedded preview.
If you see *"Camera permission was blocked"*, that is the reason — the app will say so
and offer a button.

**Click "Open in new tab"** and the camera prompt appears normally.

Everything also works without a camera: **tap mode** shows every answer as a button, and
the keyboard shortcuts (`1`–`5`, `Y`, `N`, `U`) drive the whole intake. Useful as a
fallback if a hospital machine has no webcam.

---

## Run it

```bash
cd demo
npm install          # first time only
npm run setup        # copies the MediaPipe runtime into ./vendor
npm start            # http://localhost:8080
```

`vendor/` is generated and gitignored — `npm run setup` rebuilds it.

The page needs the internet **once** to fetch the hand-tracking model; the browser caches it
afterwards. The WASM runtime is served locally, so a second load works on poor wifi.

---

## What it actually does

Four questions, each with a closed answer set:

| Question | Answers the recogniser will return |
|---|---|
| How bad is the pain, 1 to 5? | ASL numerals 1–5 (handshapes) |
| Do you understand what the doctor told you? | Yes / No / Not sure |
| Is this your first visit for this problem? | Yes / No / Not sure |
| Do you need an interpreter for the next conversation? | Yes / No / Not sure |

The last question is deliberate. The tool asks the patient whether a **qualified interpreter**
is still needed — and if the answer is yes, it says so on the summary. A product that
replaces interpreters would never ask.

**Answer keys**
- Numerals: hold 1–5 with one hand
- Yes: thumb up · No: thumb down · Not sure: open palm

**Demo keys** (always work, even with no camera): `1`–`5`, `Y`, `N`, `U`, `R` to restart.

---

## Deploy to Netlify

A plain drag-and-drop of `index.html` will **not** work — the app needs the 39 MB
MediaPipe runtime in `vendor/`, which is gitignored. Use one of these instead:

**Option A — drag and drop (fastest)**
```bash
npm install && npm run setup && npm run build
cd dist && zip -r ../../unmute-demo-netlify.zip .
```
Then drag that zip onto <https://app.netlify.com/drop>.

**Option B — connect the Git repo**
`netlify.toml` at the repo root sets base to `demo`, runs
`npm install && npm run setup && npm run build`, and publishes `dist`.
Netlify rebuilds `vendor/` on every deploy, so no binaries go into Git.

Once deployed, the site is a top-level page — **the camera works there**, unlike
inside the Arena preview iframe.

---

## Tests

```bash
npm test
```

29 checks across three files: classifier behaviour on synthetic hand landmarks,
the full tap-mode walkthrough in a real DOM, and the embedded-frame permission
path that blocks the camera in previews.

---

## What this is — and what it is not

**It is** a demonstration of the interaction design and the on-device pipeline. It shows a
clinician, in about ninety seconds, what a patient-confirmed communication record looks like.

**It is not** a trained ASL recognition model. `js/classifier.js` is a geometric prototype:
it measures finger extension from 21 hand landmarks and matches the pattern against
hand-authored templates. It has no training data, no accuracy figure, and no signer-independent
evaluation.

Everything in the UI says so, and you should say so too. The credibility of this demo comes
from the honesty of its limits.

**Published context for the honest version:** isolated ASL recognition on WLASL-100 reaches
roughly 63% top-1 with pose-only methods and 78–81% with heavy multi-modal fusion, on unseen
signers. That is why the product is built around patient confirmation rather than around the
model being right.

---

## Architecture

```
camera
  └─ MediaPipe HandLandmarker (WASM, in-browser, GPU where available)
       └─ 21 landmarks per frame
            └─ js/classifier.js   finger-extension pattern → scored candidates
                 └─ context filter: only the current question's allowed answers
                      └─ EMA smoothing (js/classifier.js: createSmoother)
                           └─ top-3 candidates
                                └─ PATIENT CONFIRMS
                                     └─ structured record → clinician panel
```

**No video, image or landmark data leaves the browser tab.** There is no backend. Close the
tab and nothing remains.

That property is the point. In a hospital procurement conversation it is a stronger answer
than any certification, because there is no data to protect.

---

## Replacing the prototype with a real model

`js/classifier.js` is the only file that needs to change. Keep the interface:

```js
classifyFrame(landmarks, allowedConcepts) -> [{ concept, score }]
```

Point it at a trained ST-GCN or pose-transformer, keep the confirmation UI exactly as it is,
and the product gains accuracy without changing its principles.

The confirmation loop is not a workaround for a weak model. It is the design: the patient
stays the authority regardless of how good the model gets.

---

## Files

| Path | What |
|---|---|
| `index.html` | Two-panel UI: patient on the left, clinician record on the right |
| `js/app.js` | State machine, rendering, keyboard fallbacks, summary |
| `js/classifier.js` | Feature extraction and prototype classification — **replace this first** |
| `js/vision.js` | MediaPipe wrapper, camera, skeleton drawing |
| `js/questions.js` | The clinical intake and its per-question vocabularies |
| `onepager.html` | Printable A4 leave-behind |
| `HOSPITAL_VISIT_PLAYBOOK.md` | What to say, what not to say, who to ask for |
