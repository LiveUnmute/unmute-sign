# Unmute — Clinical Intake Demo

A working, self-contained demonstration of the interaction model: a Deaf patient signs
a bounded answer, the app proposes its three best interpretations, **the patient confirms
which is correct**, and the clinician sees a structured record.

Built to be shown on a laptop in a hospital corridor.

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
