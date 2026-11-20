# AI for Good Nigeria Summit 2026 — "Pitch a tech product"

**Form:** https://www.aiforgood.ng/showcase.html
**Summit:** 9–10 December 2026, Bola Ahmed Tinubu International Conference Centre, Abuja
**Showcase slot:** Day Two, Thursday 10 December, 11:20–12:20
**Status:** form live and accepting. **No published deadline** — shortlisting
happens ahead of the event, so earlier is better. No application fee.

Fill the **"Pitch a tech product"** form, not "Spotlight an innovation" — the
second is for researchers, universities, government teams and NGOs.

---

## Field by field

| Field | Value |
|---|---|
| Full name* | Prince Nzubechukwu Michael |
| Your role | Founder |
| Email* | princeonpurpose@gmail.com |
| Phone* | **← you must type this. Not on file anywhere.** |
| Startup or company* | Unmute |
| Product name* | Unmute |
| Sector* | Healthcare |
| Stage* | **Prototype** — see note below |
| Funding so far | Self-funded |
| Website or demo | see "Demo link" below |
| Pitch deck link | **leave empty** — see "The deck" below |

**Stage.** *Prototype* today, honestly. The app runs end to end but the
English→sign panel is a placeholder, so *Pilot / MVP* would be a stretch. It
becomes *Pilot / MVP* the day the signed clips are in — which, if the clips get
made before you submit, is a better form to send.

---

## What does it do?*

> Unmute is a two-way sign-language layer for Nigerian hospitals, at the bedside.
>
> A Deaf patient signs; the clinician sees what was said in English and hears it
> spoken. The clinician speaks; the patient sees the reply signed back. It runs
> in the browser of the phone or tablet a nurse already carries — nothing to
> install, no interpreter to book, no waiting.
>
> Most attempts at this solve one direction, producing signs, because generation
> is easier than recognition. Unmute is built around the harder half: what the
> patient is trying to say.
>
> It is deliberately narrow. The first release reads a small closed set — yes,
> no, not sure, and the numerals 1 to 5 — and covers twelve clinical phrases in
> the other direction. Anything outside that set is refused out loud instead of
> guessed. A tool that invents a dosage is worse than one that admits it did not
> understand.
>
> The wedge is clinical vocabulary: about two hundred signs and phrases covering
> pain location, severity, onset, allergies and medication — the terms that carry
> most of the routine risk in an encounter.

---

## How does it use AI?

> Three places.
>
> Speech recognition turns the clinician's speech into text, in the browser.
>
> Hand-shape recognition reads a small set of signs from the camera on the
> patient's side of the table.
>
> Translation between English and Nigerian Sign Language is done with licensed
> engines rather than a model we train ourselves. I am not claiming to be
> training a bidirectional sign model. The defensible asset is the clinical layer
> on top of those engines: the vocabulary, the refusal behaviour, and the record
> of what was understood and what was not.
>
> Where the system is uncertain, it says so and asks the patient to confirm,
> rather than smoothing it over.

---

## Traction so far

> What exists today is a working prototype, in a browser: camera capture, a
> hand-shape recogniser, speech in, speech out, and refusal handling, laid out to
> work on a phone held between a nurse and a patient.
>
> What does not exist: a hospital pilot, a Deaf patient who has used it, a paying
> customer, or a signed partner. I would rather say that plainly than let it be
> assumed.
>
> Interest has been tested: a landing page and an expression-of-interest form at
> liveunmute.com. The prototype was built by one founder, from a phone, without a
> laptop.

*(Trim the last sentence if it reads like a gimmick to you. It is true either way.)*

---

## Demo link

The app is at **app.liveunmute.com**, but that is the older scripted flow. The
thing worth showing is `demo/live.html` — the real one, with real camera
recognition — and **it is not online yet.**

Deployable build is ready: `demo/dist/` (and `/home/user/unmute-demo-dist.zip`,
12 MB). Drag that onto Netlify Drop, point a subdomain at it. Camera needs HTTPS
and a top-level tab, which Netlify gives you.

Until it is up, put `app.liveunmute.com` or leave this field empty. An empty
field costs nothing; a broken link costs credibility.

---

## The deck — do not attach the current one

`pitch-deck/Unmute-Pitch-Deck.pdf` is a **US pre-seed fundraising deck**. Page 21
is an appendix titled *"Why not Nigeria first?"* which states, in full:

> ASL was chosen because the published clinical evidence, the open datasets, and
> the payer with budget all exist there. Nigerian Sign Language is the founder's
> home context and a genuine second-market ambition. **NSL is not a current
> capability.** … Nothing in this deck, and nothing in the v1 product, applies to
> Nigerian Sign Language without a separate corpus and validation.

Handing that to the NITDA-partnered national summit is worse than handing over
nothing. The field is optional. Leave it empty, or let me build a six-slide
Nigeria version — different document, not a re-badging of this one.

---

## What I would actually say on the stand

The pitch is not "AI for sign language", which every judge has heard. It is:

> Nine in ten Deaf people in a Nigerian hospital have no interpreter in the room.
> We are not trying to solve sign language in general. We are trying to make one
> sentence — *where does it hurt, and how badly* — arrive correctly, in both
> directions, on the phone already in the nurse's pocket. Here it is running.

Then hand them the device with the camera on. It works in a bad room, it refuses
when it does not know, and it says so.

---

## Still needed from you

1. **Phone number** — required, and I have no record of it.
2. **Yes/no on deploying the demo** — otherwise there is no link to submit.
