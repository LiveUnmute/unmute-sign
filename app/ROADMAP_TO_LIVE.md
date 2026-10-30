# From here to live: what's actually left

The question was: what does it take to get to the point where the only thing
missing is a Talksign API key.

The honest answer is that **the key is step seven of nine, not step one.** An
API key does not make a product. What makes a product is everything around the
model: the capture pipeline, the failure states, the record of what was said,
the consent story, and the thing a hospital's IT department asks before they let
it near a patient.

This is what is left, in the order it has to be built.

---

## Where the build actually stands

**Working today**

- Four screens, in the brand's own design language, responsive from 320px up
- Two-way conversation script, five exchanges each way
- Real microphone capture with level metering
- Real speech recognition where the browser supports it
- Tap-to-repeat on the translator
- Media layer that takes stills or video, swappable by one string
- A provider interface (`js/providers/`) with a working mock implementation
- Deployed on Netlify, custom domain pending

**Not started**

- Anything that recognises sign language
- Anything that stores a conversation
- Anything that identifies a user
- Anything that would survive a hospital security review

---

## The architecture, once the key arrives

```
PATIENT SIGNS                          CLINICIAN SPEAKS
────────────────                       ────────────────
camera (getUserMedia)                  microphone
        │                                      │
        ▼                                      ▼
landmark extraction                    speech → text
(on device, per Talksign)              (browser or cloud)
        │                                      │
        ▼                                      ▼
   Palm 1.0  ──────────► English ──────►  Echo 1.0
        │                                (ASL gloss → avatar)
        ▼                                      │
  transcript + confidence                      ▼
        │                              signed video, 30 FPS
        ▼                                      ▼
   caption on screen                    repeat button reruns it
```

Two things about this diagram matter more than they look.

**Landmarks, not video.** Talksign's material says landmark extraction happens on
the client and raw video is not transmitted. If that holds, the privacy story is
excellent — and also means the capture pipeline is not "record and upload", it is
"extract 133 points and stream coordinates". That changes the client work
substantially. Confirm before building it.

**Confidence is part of the interface.** Palm 1.0 is 84.2% semantic accurate. One
sentence in six is wrong. A clinical tool must surface that rather than smooth it
over, which is why the contract carries `confidence` and `uncertain`.

---

## The nine workstreams

Estimates assume one founder, full time, and are for the work — not for waiting
on vendors, contracts or pilot sites.

### 1. Capture pipeline — 1.5 weeks

The camera path is a placeholder. Real work:

- `getUserMedia` with device selection, front/rear switching, permission states
- Frame extraction at the rate Palm requires, without dropping frames on a
  mid-range Android — hospital tablets are not MacBooks
- Resize/encode on a worker thread so the UI never stutters
- Handle: permission denied, camera in use by another app, phone rotated,
  backgrounded tab, screen locked mid-sentence
- A visible "camera off" state that is honest, not a frozen last frame

### 2. Provider integration — 1 week *(needs the key)*

The seam exists; the implementation does not.

- Correct every URL and field in `talksign.js` against the real docs
- Wire the transport — WebSocket for live, REST as fallback
- Map their confidence onto the contract's 0–1
- Timeouts, retries, and a fallback that degrades to "please repeat" rather
  than a spinner
- Contract tests: the mock and the real provider must pass the same suite

### 3. Latency budget — 0.5 week

A conversation feels broken above ~1 second of lag between signing and text.
Measure the whole chain — capture, encode, network, model, render — and set a
target. If the real figure is worse than the promise, the UI has to show it
(a "still reading" state) instead of silently lagging.

### 4. Clinical vocabulary and guardrails — 2 weeks

This is the wedge, and it is the part a competitor cannot copy quickly.

- The ~200-term clinical list, selected from real encounter transcripts
- Pass it as `hints` so the decoder is biased toward "allergic", "chest",
  "dose", "consent" rather than general conversation
- A confirmation step: on critical terms the patient sees and approves what was
  understood before it is spoken to the clinician
- A hard rule: outside the supported vocabulary, the app says so. It never
  guesses into a dosage.

### 5. Persistence and history — 1.5 weeks

History is a static mockup. Real work:

- Local-first storage (IndexedDB) so a conversation works with bad ward wifi
- Encounter records: time, clinician, transcript, corrections
- A clinician can correct a mistranslation, and that correction is the most
  valuable training data the company will ever collect
- Retention policy enforced in code, not in a document: patient data expires by
  default, and someone has to actively decide otherwise
- Export and delete, per patient

### 6. Consent and recording — 1 week

The first question every hospital asks.

- Consent captured before the camera opens, in plain language, for the patient
- A visible recording indicator that cannot be missed
- Per-patient, per-encounter consent state
- Data flowing to Talksign described precisely — what leaves the device, what
  does not, under what terms
- Written against HIPAA from the start. Retrofitting it later is a rewrite.

### 7. Accounts and teams — 1 week

The team plan is 10 practitioners per hospital, so tenancy is not optional.

- Auth — email magic link or SSO; hospitals will want SSO eventually
- Organisation → department → practitioner
- Role separation: a clinician sees their patients, an admin sees usage
- Audit log: who translated what, when. Procurement will ask.

### 8. Reliability, accessibility, degradation — 1.5 weeks

- Offline and poor-network states that fail honestly
- Screen-reader support, high contrast, 200% zoom — this is a product for Deaf
  users, and its accessibility is the product
- Text sizes that work across a bed, not just on a phone held close
- Error telemetry with no patient content in it
- A kill switch, so a bad deploy can be turned off in one click

### 9. Legal and positioning — parallel, start now

- Terms of service, privacy policy, DPA template
- A BAA with Talksign, or a written answer on why one is not needed
- Decide the regulatory posture in writing: a communication aid, not a medical
  device. This shapes the copy on every screen.
- Cyber insurance, which hospitals request during onboarding

---

## The gate: "only the key is missing"

The build is ready for the key when **all of these are true**:

- [ ] The app runs end to end on the mock, on a real phone, in a real room
- [ ] The provider contract has a passing test suite, with the mock as reference
- [ ] Every failure path works: no camera, no mic, no network, timeout, low confidence
- [ ] The key is read from config, never committed, and rotating it needs no code change
- [ ] A clinician can complete a full encounter and find it again in History
- [ ] Consent is captured before any capture, and retention is enforced in code
- [ ] Swapping the provider is a one-file change

When that list is green, the key is a configuration step. Until then, a key just
gives a scripted app a network call.

---

## What to ask Talksign for — this week

Their developer docs are not public; `/docs` and `/api` both return 404. Access
comes with the key, which makes these questions worth sending before you pay:

1. **The API reference.** Transport — WebSocket, WebRTC or REST?
2. **Landmarks or video?** Confirm whether extraction is client-side, and what
   exactly leaves the device.
3. **Palm 1.1 domain modules.** Is a medical module available? What does
   fine-tuning cost in data and time? Palm 1.0's 84.2% is a general figure and
   the clinical vocabulary is where it will be weakest.
4. **Echo 1.0 for medical text.** They state specialised vocabulary needs
   fine-tuning. Does that include a hospital phrase list, or do we accept
   generic rendering of clinical sentences?
5. **BAA and DPA.** Will they sign one? Do they train on customer data, and for
   how long do they retain it?
6. **Sandbox access.** Integration must not be billed against a live patient flow.
7. **Rate limits and session semantics.** The API is PAYG from $10 and a session
   is 30 minutes — clarify what a concurrent conversation costs.

Ask all seven in one email. The answers determine whether this is a two-month
build or a six-month one.

---

## Cost of running it

| Item | Estimate |
|---|---|
| Talksign API | PAYG, minimum $10; sessions of 30 min. Volume pricing is negotiable |
| Hosting | Netlify free tier covers a pilot; ~$20/month at real traffic |
| Speech-to-text | Browser-native is free; a cloud provider is ~$0.006/min |
| Domain, email, certificates | Already covered |
| **Corpus collection** | **The real cost — $85,000 in the deck.** Contractor time, Deaf participants paid fairly, annotation to protocol |

That last line is why the raise exists. The API key is the cheap part.

---

## Timeline

| Phase | Duration | Ends with |
|---|---|---|
| Build the shell properly (1, 5, 6, 7, 8) | 6 weeks | A real app on a mock provider |
| Wire Talksign (2, 3) | 1.5 weeks | Live translation, measured latency |
| Clinical layer (4) | 2 weeks | 200-term vocabulary, confirmation step |
| **Total to pilot-ready** | **~9–10 weeks** | Three design partners can use it |

Legal (9) runs alongside from week one. Corpus collection is the long pole and
does not block the pilot — it improves it.

---

## The thing worth saying plainly

An API key will make this app translate. It will not make it trustworthy, and
trust is what a hospital buys. The gap between the two is the work above — and
it is also the moat, because anyone can buy the same key.
