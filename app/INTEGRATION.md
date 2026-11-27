# Going live: the two-way conversation

The pilot uses separate providers for the two directions. **Signa is integrated
for clinician English → ASL avatar output**; Sign-Speak remains the candidate
for **patient ASL → English recognition**. Signa's avatar output is not sign
recognition.

The Signa setup and current implementation are documented in
[`SIGNA_INTEGRATION.md`](./SIGNA_INTEGRATION.md). The Sign-Speak instructions
below cover its separate recognition integration and key setup.

---

## 1. Direction-by-direction status

| | Direction | Engine | Status |
|---|---|---|---|
| Patient signs → clinician reads and hears | ASL → English | **Sign-Speak** | Provider path exists; awaiting key. Otherwise the response is scripted. |
| Clinician speaks → patient sees it signed | English → ASL | **Signa AI** | Server-minted short-lived client token; browser calls Signa for `.sgn` and MP4. Deploy-context key status and a live sandbox test must be verified. |
| Patient fallback | ASL → English | scripted mock | Patient phrases stay labeled **Demo** until recognition is configured. |
| Speak idle state | English → ASL | Signa idle-avatar API | API mount is present, but the animated idle session is not yet wired; no static image is used. |

With no server-side keys configured, patient recognition remains scripted.
Speak's generated-video path returns output only after a phrase; the separate
animated idle-avatar session still needs its API/SDK integration. Each
direction has its own status, so a live avatar does not imply live patient-sign
recognition.

---

## 2. The flow, as implemented

```
        PATIENT SIGNS                              CLINICIAN SPEAKS
        ─────────────                              ────────────────
   consent gate names recogniser              one tap starts continuous speech
        │                                               │
   camera opens visibly                       transcript stays visible
        │                                               │
   tap hand → record ≤ 8s                     2 seconds of silence completes a chunk
        │                                               │
   Sign-Speak recognition (when set)          POST /api/signa/token (5-minute token)
        │                                               │
   transcript + confidence                    Signa /v1/sign → .sgn → /v1/sign/video → MP4
        │                                               │
   PATIENT CONFIRMS                             later chunks queue while listening continues
        │                                               │
   spoken aloud to the clinician                second tap stops; Repeat replays last output
```

Signa handles only the clinician-text-to-ASL-avatar path. It does not read the
patient's signing. Until Sign-Speak recognition is configured, the first
direction remains a scripted demo. For recognized patient signing, the
confirmation step remains mandatory: the patient approves what was understood
before it is spoken to the clinician.

---

## 3. Sign-Speak: enabling patient-sign recognition

### Step 1 — get a **PUBLIC** key

Sign up at <https://client.sign-speak.com>. Their docs describe three key types:

| Key | Can do | Where it belongs |
|---|---|---|
| `PRIVATE` | mint keys, read all usage, run inference | server only |
| `ROOT` | mint keys | server only |
| **`PUBLIC`** | **inference only, sandboxed per key** | **browser — this one** |

This app is static files on Netlify. There is no server to hold a secret, so a
private key in the bundle is a key anyone can spend. Use `PUBLIC`.

### Step 2 — put the key somewhere the browser cannot read it

Two ways. **Do the first one.**

#### A. Proxy mode — recommended

The key goes in a Netlify environment variable and is used by
`netlify/functions/sign.js`. It never ships to the browser, and the app never
holds it.

1. Netlify → **Site configuration → Environment variables → Add a variable**
2. Name `SIGNSPEAK_KEY`, value = your key
3. Optionally `SIGNSPEAK_MODEL` (defaults to `SLR.2.sm`)
4. **Trigger a deploy** — functions only pick up env changes on a new build

That is all. On boot the app asks `/api/sign/status`, the function says whether
a key exists, and the `Demo` chip becomes `Live`. No key in `index.html`, no
rebuild of the client code.

In proxy mode the app sends `request_class: "BATCH"` and polls, because a
Lambda cannot hold a connection for the 30 seconds `BLOCKING` may take.

#### B. Direct mode — a key in the page

Only if the proxy is unavailable. Uncomment the meta tags near the top of
`index.html`:

```html
<meta name="signspeak-key" content="PUB-xxxxxxxx">
<meta name="signspeak-model" content="SLR.2.sm">
```

In direct mode the browser calls Sign-Speak itself, so the key is readable by
anyone who opens the page, and Sign-Speak must allow your origin. Use a
`PUBLIC` key and nothing else.

### Step 3 — CORS is only a problem in direct mode

Through the proxy the caller is a Netlify server, not a browser, so Sign-Speak's
origin allowlist does not apply. **This is the main practical reason to prefer
the proxy**: the most likely day-one failure simply cannot happen.

In direct mode it can. If every clip fails with
`Could not reach the engine`, open DevTools, watch the Network tab, and look for
a blocked request. Send them:

- `https://liveunmute.netlify.app`
- `https://app.liveunmute.com`
- `http://localhost:8083` for local work

### Step 4 — check it before a patient is in the room

Open the app with `?provider=signspeak` and run one clip. Then confirm in their
portal that the request registered and what it cost.

---

## 4. What to test first, and how

Sign-Speak publish a Drive folder of **easy, medium and advanced sample
sentences** specifically so a team can integrate without knowing ASL. Use it.
Do not start by signing yourself.

Then test the sentences that actually scare you:

| Sentence | Why |
|---|---|
| "My chest hurts." | the baseline |
| "I am allergic to penicillin." | a wrong word here is an adverse event |
| "It started two days ago." | numbers and time |
| "I don't understand." | the most common thing a Deaf patient says |
| "Where does it hurt?" | the reverse direction |
| "Take two tablets twice a day." | dosage — the hardest case |

Record what comes back, verbatim, with the confidence value. That table is your
traction evidence, your 198-phrase justification, and the thing a grant
committee should see instead of a claim.

---

## 5. Known unknowns — the three things to correct first

The integration was written against their published examples. Their doc site
renders in JavaScript, so the individual endpoint pages would not load as text,
which leaves three constants to verify. All three are isolated at the top of
`js/providers/signspeak.js`.

| Unknown | Current assumption | Where to fix |
|---|---|---|
| Batch retrieval path | `GET /recognizeASL?request_id=…` | `ENDPOINTS.batchGet` |
| `payload` encoding | bare base64, no data-URI prefix | `payloadFormat: "bare"` |
| Model string | `SLR.2.sm` (their SDK example) | `<meta name="signspeak-model">` |

If a clip hangs or returns an empty transcript, check these in that order.

---

## 6. Cost, and why clips are capped at 8 seconds

Their inference bills **per second of input**, free during the trial, then
against a monthly minute quota.

`maxClipMs: 8000` in `js/config.js` keeps one take to one or two phrases. That
is a cost decision and a latency decision: a `BLOCKING` request holds for up to
30 seconds and downgrades to a batch job if it overruns, and short clips almost
never do. The cap also means a forgotten tap cannot upload a minute of a
patient's room.

---

## 7. The privacy position, stated honestly

Talksign's Palm 1.0 was going to extract pose landmarks on the device so raw
video never left the browser. **Palm 1.0 is not released, and Sign-Speak's
recognition takes video.** So that property does not exist on this path, and the
app no longer claims it:

- The consent gate **names the vendor that receives the video**, before capture.
- The patient must agree before the camera opens; declining leaves the scripted
  demo available.
- The camera is stopped — not hidden — when the screen changes or when the
  clinician page opens.
- Nothing is written to storage. There is no recording, no history file, no
  upload of anything but the clip being translated.

Before a real pilot this needs, in writing, from Sign-Speak: a **BAA**, a
**no-training-on-our-data** clause, a stated **retention period**, and a named
list of sub-processors. Do not run a patient through this without those.

---

## 8. The commercial thing to keep in view

Sign-Speak sells an **Automated Interpreting System** — AI plus human
interpreters, both directions, 24/7. That is the same job Unmute is aiming at.
They are a supplier today and a competitor on the roadmap.

That is why the code keeps the directions independently replaceable: the
recognition provider can change without changing the Signa output path, and the
mock remains available for safe demos. If Sign-Speak's terms turn bad, or a
better output provider arrives, `js/live.js` does not need a vendor rewrite.

**Pilot sequence:** validate Signa's English → ASL output with short, approved
sample phrases; connect Sign-Speak separately for ASL → English when its key is
available; then evaluate both directions with Deaf ASL users. Do not call the
combined workflow validated until that testing is complete.

---

## 9. Files

| File | Role |
|---|---|
| `js/live.js` | the state machine: consent → record → translate → confirm → speak |
| `js/capture.js` | camera, MediaRecorder, base64, the 8-second ceiling |
| `js/providers/signspeak.js` | recognition + production, confidence, batch polling |
| `js/providers/index.js` | picks the engine; `?provider=mock` forces the demo |
| `js/config.js` | where the key is read, proxy probing, capture limits |
| `netlify/functions/sign.js` | the proxy: holds the key, allowlists five routes, rate limits |
| `tester.html` | the page at `/tester` that tells a clinician what is real |
| `js/screens.js` | consent gate, camera stage, confirmation bar |
| `js/app.js` | wiring; the camera closes on navigation |

---

## 10. If nothing works

1. `?provider=mock` — the demo still runs. Demo Day is not at risk.
2. Check the chip: `Demo` means no key was read; `Live` means one was.
3. Read the note under the caption. Every failure path has a sentence written
   for a clinician, not a developer.
4. Their rate limit or quota will show as a specific message, not a blank screen.
