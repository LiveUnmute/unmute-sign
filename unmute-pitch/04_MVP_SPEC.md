# 04 — MVP Product & Technical Spec

**Prepared:** 20 October 2026
**Scope:** what gets built, in what order, to what standard of evidence.

---

## What we are building

A web app that runs on the phone already in the patient's hand, or on a tablet already on the ward cart. No new hardware.

**The patient signs. The app proposes. The patient confirms. The clinician reads the result.**

That is the whole product. Everything below is how to make it work and how to know it does.

---

## The two design decisions that make this buildable

Everything in this spec follows from two decisions, and both are attempts to solve the same problem: ASL recognition is not accurate enough to be trusted on its own.

### Decision 1 — Constrain the conversation, not the model

Do not build a translator. Build a **structured clinical interview** where the patient answers one bounded question at a time.

| Clinician asks (via recorded ASL video) | Patient signs | Vocabulary the model must hold |
|---|---|---|
| "Where does it hurt?" | A body-part sign | ~20 body locations |
| "How bad, from one to ten?" | A number | 10 numerals |
| "When did it start?" | A time expression | ~15 time signs |
| "Any allergies?" | Yes / no / a named common allergen | ~25 signs |
| "Are you taking any medication?" | Yes / no / "I don't know" | ~10 signs |
| "Do you understand?" | Yes / no / "again please" | 5 signs |

**A free-flowing translator needs to recognise anything.** This needs to recognise about **80 concepts**, in a known order, in response to a known prompt. That is the difference between a research problem and a product.

The scope widens later. The first version is deliberately narrow enough that a solo founder can actually validate it.

### Decision 2 — The patient is the authority, never the model

The published state of the art on isolated ASL recognition (WLASL-100, signer-independent) is roughly **63% top-1 for pose-only methods** and **78–81%** for heavy multi-modal fusion. WLASL-100 is only 100 classes. Nobody is shipping 95%.

So the product must never present a single guess as a fact.

Instead:

```
Patient signs [concept]
        ↓
Model returns top-3 candidates
        ↓
App shows:   ┌──────────────────────────┐
             │  Did you mean:           │
             │  ▸ CHEST                 │
             │  ▸ STOMACH               │
             │  ▸ SHOULDER              │
             │  ▸ None of these         │
             └──────────────────────────┘
        ↓
Patient taps the correct one
        ↓
Confirmed concept recorded
```

This changes the accuracy requirement from *"top-1 must be right"* to *"top-3 must contain the right answer"* — a far easier target, and one that pose-based models can clear.

It does three other things that matter more than the engineering:

- **The Deaf patient holds authority over their own meaning.** The model proposes; it never overrules.
- **It produces a labelled data stream for free.** Every correction is an (observation, true label) pair — exactly what the corpus needs, collected during use with consent.
- **It is the honest answer to "what if the AI is wrong?"** — because the wrong answer is visible, and the patient rejects it in one tap.

**This should be the product's stated principle, not a fallback.** "The AI never speaks for the Deaf patient. It offers, and the patient chooses." That single sentence does more for the legitimacy problem than any advisor hire.

---

## What the model actually does

**Task:** isolated sign recognition over a fixed vocabulary. Not continuous translation.

**Why isolated:** continuous sign language recognition (CSLR) needs gloss-annotated sequence data at a scale that does not exist for clinical ASL, and the accuracy is worse. Isolated recognition on a bounded vocabulary is the tractable version, and it fits a prompted interview.

**Pipeline:**

```
camera frame
   ↓  MediaPipe Holistic / MMPose
21 hand landmarks × 2 hands + upper-body pose + face points
   ↓  normalise (shoulder-centred, scale-invariant)
sequence of ~30–60 frames of keypoints
   ↓  ST-GCN / pose-transformer / small temporal transformer
top-3 concept predictions + confidence
   ↓
patient confirmation UI
```

**Why keypoints rather than raw video:**

| | Keypoints | Raw video |
|---|---|---|
| Data leaving device | Coordinates only, or nothing | Video frames |
| On-device inference | Feasible on a mid-range phone | Needs a server or serious GPU |
| Accuracy (WLASL-100, pose-only) | ~63% top-1 | 78–81% with multimodal fusion |
| Accuracy (top-3) | Usable with confirmation | Better, but unnecessary |
| Privacy posture | Strong — no identifiable imagery | Needs a BAA and a security story immediately |

The accuracy trade is real and it is worth taking **for v1**, because confirmation closes the gap and privacy is what gets you through hospital procurement. Move to video-based models in v2 once the corpus exists and a customer is paying for the extra accuracy.

---

## The corpus — and why it does not need patients in it

The moat is a clinical ASL corpus. That does not mean filming patients.

**Collect from paid Deaf signers and interpreters.**

| | |
|---|---|
| Who | 8–12 Deaf ASL signers, deliberately varied by region, age, and signing style |
| What | Each signs the ~80-concept clinical vocabulary, 3 repetitions |
| Volume | 80 × 3 × 10 signers = **~2,400 clips** |
| How | Phone camera, controlled lighting, a fixed protocol, one afternoon per signer |
| Cost | Paid at a fair rate — this is skilled linguistic labour, budget for it |
| Split | Hold out 2 signers entirely for testing — **signer-independent evaluation is the only honest number** |
| Consent | Explicit, written, revocable, with a stated purpose and a share of any commercial benefit |

This is achievable in weeks, not years, and it is how every existing sign dataset was built. Nobody has to be a patient to contribute clinical vocabulary.

**What this produces:**
- Training data for the model
- A held-out benchmark you can publish
- A defensible asset: consented, annotated, documented provenance

**On existing datasets:** use WLASL and MS-ASL (isolated, word-level) to pre-train and to prove the pipeline. Do **not** expect How2Sign to help here — it is continuous, sentence-level, and non-medical, which makes it the wrong shape for isolated clinical recognition. Keep it for the v2 continuous work.

---

## Build sequence

Four gates. Each one has a defined exit, and none of them can be skipped by starting the next.

### Gate 0 — The phrase bank (weeks 1–4)

**No AI at all.** This is the part that ships first and is useful immediately.

- Script ~80 clinical phrases in clinician-side language
- Film a Deaf signer (or two, for regional variation) signing each one
- Build the patient-facing app: the clinician taps a phrase, the patient watches it signed
- Add the comprehension check ("Do you understand? Yes / No / Again")

**Exit criteria:** a Deaf person can complete a triage intake with a clinician who knows no sign, using only recorded video. No model, no accuracy claim.

**Why first:** it produces a genuinely useful product in a month, it gets a Deaf design panel using the real thing, and it generates the vocabulary list the model will later be trained on. It also means you have something to demo before you have a number.

### Gate 1 — Recognition on public data (weeks 5–10)

- Build the keypoint pipeline
- Train an isolated recogniser on WLASL/MS-ASL
- Establish that the pipeline works end to end on signer-independent splits
- Publish nothing yet; this is plumbing

**Exit criteria:** the model reproduces published ballpark accuracy on WLASL signer-independent splits. If it can't, the pipeline is wrong and there is no point collecting clinical data.

### Gate 2 — The clinical corpus (weeks 10–16)

- Recruit and pay 8–12 signers
- Record ~2,400 clips against the protocol
- Annotate, version, and document provenance
- Written consent, revocable, with a stated commercial-purpose clause

**Exit criteria:** a versioned, consented corpus with a signer-independent holdout.

### Gate 3 — The number (weeks 16–24)

- Fine-tune on the clinical corpus
- Evaluate on signers the model has never seen
- Report **top-1, top-3, and failure modes** — including which concepts it confuses

**Exit criteria:** a published top-3 accuracy figure on held-out clinical ASL, with a written list of known failure cases.

**That number is the moment this becomes a fundable company.** Not the deck, not the positioning — the number.

---

## What is deliberately out of scope for v1

| | Why |
|---|---|
| Continuous sign language translation | Needs gloss-annotated data at a scale that doesn't exist for clinical ASL |
| Text → sign synthesis / avatars | Requires grammatically correct non-manual markers; word-for-word output is signed English and Deaf users reject it |
| Nigerian Sign Language | Superseded by the pivot. Out of scope, not a roadmap item |
| EHR integration | A procurement cycle, not a build. Later |
| Offline / on-device-only inference | Keypoint extraction is on-device; classification can be server-side at first |
| Multilingual, multi-sign-language | One language done well beats four done badly |

---

## Stack, concretely

| Layer | Choice | Why |
|---|---|---|
| Pose / hand extraction | MediaPipe Holistic | Runs on-device, free, well-documented, good enough |
| Sequence model | ST-GCN or a small pose-transformer | Strong on WLASL-style data without huge compute |
| Training | A single rented GPU | This is a small-model problem, not a foundation-model problem |
| App | Web app (PWA), camera via browser | No app-store review, works on any device in the room |
| Phrase bank video | Hosted MP4s, human signer | Cheapest, most accurate, most trusted |
| Backend | Minimal — auth, session log, video serving | Do not build a platform before the model works |
| Data | Versioned corpus with signer-disjoint splits | The asset. Treat it like production code |

Deliberately boring. The novel part is the corpus and the confirmation UX, not the infrastructure.

---

## What "done" looks like, in order

1. A Deaf person completes triage intake using recorded phrases only. *(No AI.)*
2. The keypoint pipeline reproduces WLASL ballpark accuracy on unseen signers.
3. ~2,400 consented clinical clips exist, with a documented protocol.
4. A published top-3 accuracy figure on held-out clinical ASL, with named failure modes.
5. Three design partners using it, with Deaf and clinician feedback recorded.
6. One paying Ward-tier customer.

Anything on a pitch slide before item 4 is a claim. Item 4 is the first fact.

---

## The three risks worth naming

**1. Signer-independent accuracy may not reach usability even with confirmation.**
Pose-only methods sit near 63% top-1 on WLASL-100. Top-3 will be higher, but nobody has published a clinical-vocabulary top-3 number, because no clinical corpus exists. This is the central technical risk and Gate 3 either resolves it or kills the approach. **Do not skip Gate 1** — if the pipeline can't reproduce public benchmarks, the clinical corpus will not save it.

**2. 80 concepts may be too few to be useful, or too many to be accurate.**
Both failure modes are real. Start narrower if needed — the 20 body-part signs plus 10 numerals may be enough to prove the loop, and a working 30-concept demo beats a broken 80-concept one.

**3. The confirmation loop may slow the encounter down.**
Every tap costs seconds in a queue. This must be measured with real clinicians, not assumed. It is also the strongest argument for starting with the phrase bank, which has no latency cost at all.

---

## The one-sentence version

> We are building a structured clinical interview where a Deaf patient signs a bounded answer, the app offers its best three guesses, and the patient tells it which one is right — so the AI never has to be right on its own, and the patient is never spoken for.
