# Engine options: what each one can actually do

A decision memo, written 20 October 2026, after checking each vendor's own
licence file, repository and docs rather than their marketing.

The question it answers: **what runs the demo for free, and what runs the
product once there is revenue?**

Read section 3 first if you only read one thing. Both of the free options are
one-directional, and it is the wrong direction.

---

## 1. The two directions are not equally hard

| Direction | What it means on a ward | Market supply |
|---|---|---|
| **sign → text** | The Deaf patient signs; the clinician reads it | **One commercial ASL API** — Sign-Speak. Everything else is research code or unreleased. |
| **text → sign** | The clinician speaks; the patient sees it signed | Commoditising. AWS gives the code away; SignCaption charges $19.99/month. |

That asymmetry is the whole strategic picture. Recognition is scarce,
production is abundant. It also predicts where the money goes.

---

## 2. sign.mt — now "Rylo Translate", run by Nagish Inc.

`sign.mt` redirects to `rylo.com/sign/translate`. The repository is
`github.com/sign/translate` — 798 stars, last commit August 2026, actively
maintained.

### What it genuinely does well

- **Both directions.** Spoken → signed (text → SignWriting → pose → avatar) and
  signed → spoken (video → segmentation → SignWriting → text).
- **ASL, DGS, LSF** sign languages against English, German, French.
- **Runs in the browser.** The models are loaded client-side and it works
  offline. This is the single best property in this whole document: **the
  patient's video need not leave the device**, which would make the privacy
  story and the BAA conversation dramatically easier than Sign-Speak's.

### Why it cannot simply be wired in

**It is an application, not an API.** The only package published under the
`@sign-mt` scope is `@sign-mt/browsermt` v0.2.3 — "browsermt inference code",
published November 2023, with **no licence declared in its package metadata**.
There is no translation SDK and no REST endpoint. Integration means one of:

1. Iframe their hosted app — a foreign UI inside ours, and their terms apply.
2. Fork and self-host the Angular app — real work, and ShareAlike follows.
3. Open it in a second browser tab during a demo — honest, and actually fine.

**The current models are gated.** Their own site, on the page: *"The latest
Sign models are currently in research preview and are not available to the
public."* Whatever the public demo runs is not their best work.

**Licence is two-tier, and this is the binding constraint.** From
`LICENSE.md`:

> Individuals, non-profit organizations, and educational institutions are
> permitted to use Rylo Translate for sign language translation without charge,
> while **a separate license is required for for-profit commercial
> organizations.**

Free tier is **CC BY-NC-SA 4.0** — NonCommercial **and ShareAlike**. Two
separate problems for Unmute:

- Unmute is a for-profit company seeking a $10,000 grant. *NonCommercial* means
  "not primarily intended for or directed towards commercial advantage or
  monetary compensation" — which describes this application uncomfortably well.
- *ShareAlike* means a deployed derivative must itself be licensed
  CC BY-NC-SA. Putting it on `app.liveunmute.com` would purport to relicense
  the product.

**Quality is a known unknown.** An independent technical assessment of the
field (Arm developer blog, 2025) put avatar-based sign production at **10–40%
accuracy** and noted that *"many deaf users find avatars inauthentic or
visually unnatural."* Take that as the prior, not the verdict — but do not
promise a jury otherwise.

### Verdict

**Demo: yes, as a prop. Not as an integration.**
Open `rylo.com/sign/translate` in a second tab, type a clinical sentence, show
the avatar. That is a truthful showcase of what sign production looks like
today, it costs nothing, and it touches none of our code.

**Do not:** deploy it on the public site, embed it in the product, or wire it
behind the provider interface.

**Do:** ask Nagish for a **commercial licence quote**. They have a commercial
tier — most open projects in this field do not. If it is affordable, an
on-device two-way engine with no per-minute cost would be a materially better
architecture than renting recognition from Sign-Speak.

---

## 3. GenASL — and the hole in this plan

`github.com/aws-samples/genai-asl-avatar-generator`. **MIT-0 licence**, so
commercial use is unambiguously fine. That part of the plan is correct.

### What it actually is

Not a generative avatar model. It is a **video stitcher**:

1. Offline, an EC2 batch job runs RTMPose over the **American Sign Language
   Lexicon Video Dataset** — about **3,300 signs, in citation form** — and
   pre-renders an avatar clip for each gloss into S3, indexed in DynamoDB.
2. At request time: audio → Amazon Transcribe → English text → **Amazon
   Bedrock (Claude V3)** → ASL gloss → DynamoDB lookup → **stitch the clips
   together** → pre-signed URL.

Two consequences follow directly:

- **Vocabulary is capped at ~3,300 citation-form signs.** No co-articulation,
  no transitions, no spatial grammar. Concatenated citation forms are exactly
  the "puppet signing letters" failure that Deaf reviewers criticise.
- **The grammar lives entirely in a Bedrock prompt.** English → ASL gloss is a
  few-shot LLM call. That is where quality will come from, and it is also the
  cheapest part to improve.

### What it does not do

**There is no sign → text path.** The `detection/` directory in the repository
contains two JPEGs — `hello.jpeg` and `how.jpeg` — and nothing else. AWS's own
architecture post says the reverse direction *"can also be done by navigating
in the reverse direction"*, i.e. it is a suggestion, not shipped code.

### Condition

**Last commit September 2024 — two years stale.** Ten open issues, 38 stars,
not archived. It pins Claude V3 model IDs that have since moved on, and stacks
Amplify + Cognito + SAM + Step Functions + DynamoDB + S3 + EC2. It is a
reference architecture you would own the maintenance of, not a product.

### Verdict

**Commercial text → sign: reasonable, with eyes open.** MIT-0, self-hosted,
bounded vocabulary — and a bounded clinical vocabulary is Unmute's thesis
anyway, so ~3,300 signs comfortably contains 198 clinical phrases. Budget for
resurrecting a two-year-old sample.

**It is not the commercial path.** It covers half of one direction.

---

## 4. The corrected split

```
                 sign → text                        text → sign
              (the hard half)                     (the easy half)
                    │                                    │
   DEMO      Sign-Speak free trial                 sign.mt, second tab
             (per-second billing starts            (free, non-commercial,
              after the trial period)              no API, demo only)
                    │                                    │
 COMMERCIAL  Sign-Speak, paid                      GenASL self-hosted (MIT-0)
             — or own corpus + recogniser           — or Signapse / SignCaption
             — or SignGemma when weights ship
```

**The demo does not need sign.mt to be two-way.** If the Sign-Speak key lands,
the hard direction is covered and sign.mt is only there to show what a signing
avatar looks like. If the key does not land, no combination of free tools makes
the demo two-way, because the only free sign→text options are gated,
unlicensed, or unbuilt.

**Say that plainly in the application.** "One direction is available
commercially today; the other we are building around a licensed engine plus our
own clinical corpus" is a stronger claim than a two-vendor diagram that
collapses under one question.

---

## 5. Actions, in order

| # | Action | Owner | Why |
|---|---|---|---|
| 1 | Ask Nagish/Rylo for a commercial licence quote | You | An on-device two-way engine is architecturally better than rented recognition. Worth one email to rule in or out. |
| 2 | Get the Sign-Speak key live in Netlify | You | It is the only free path to a genuine two-way demo. |
| 3 | Spike GenASL in your own AWS account | Later | Only after the demo. It is the commercial text→sign half, not a priority now. |
| 4 | Test sign.mt's ASL → English with a real signer | You | If it works and the licence is affordable, it changes the roadmap. If not, close the question and stop revisiting it. |
| 5 | Stop claiming Palm 1.0 anywhere | Me | The deck still says it. See `INTEGRATION.md` §7. |

---

## 6. The line to use in the application

> We integrate licensed sign-recognition engines rather than training our own,
> and we own the clinical vocabulary, the confirmation step and the record. The
> production direction is commoditising — AWS ships reference code for it — so
> our defensibility is not the avatar. It is the corpus of 198 clinical phrases
> and the audited workflow around them.

That is true today, it survives a technical question, and it explains why the
grant money goes to the corpus and not to model training.
