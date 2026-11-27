# AfCEN Build 2026 — application copy

**Closes Tue 10 Nov 23:59 GMT.** Scored 1–10 per criterion:
Impact 30 · Quality of AI 25 · Traction 20 · Responsible AI 15 · Policy 10.

---

## 1. Startup profile — the team

> Prince Nzubechukwu Michael — founder, sole team member. Product, the clinical
> vocabulary scope, and the build itself. Built the prototype from a phone,
> without a laptop, using AI-assisted development. A year inside this problem:
> mapping the vendor landscape in both directions, and defining the clinical
> vocabulary that carries the risk in a routine encounter. No engineering team
> yet — the first hires are Deaf advisers and qualified NSL interpreters, not
> engineers.

---

## 6. How the product uses AI and handles data responsibly

> Unmute runs three AI systems at a bedside, under one rule: it never guesses
> into a clinical decision.
>
> Speech recognition turns the clinician's words into text in the browser.
> Hand-shape recognition reads a closed set of signs from the camera — yes, no,
> not sure, and the numerals 1 to 5. In the prototype that tracking runs in the
> browser. If we integrate a vendor recogniser, a frame may leave the device, and
> we will say plainly what does and does not. We will not call the product
> on-device when it is not.
>
> English-to-sign uses licensed engines we pay for. We do not train models on
> patient encounters, and no patient data fine-tunes anything.
>
> Data: conversations are not stored by default. If a hospital asks for a record
> we keep what was understood, the confidence attached to it, and what the
> patient confirmed — not raw video, not audio.
>
> Fairness: Nigerian Sign Language is the target, built with paid Deaf advisers
> and qualified interpreters. Models trained on American or British signing do
> not transfer, and we say so rather than let a clinician find out mid-consultation.
>
> Inclusion: no account, and no smartphone of the patient's own required. The
> recognition runtime is served locally after first load, so it survives ward wifi
> that drops. It runs on a shared device a clinic already owns — which is how most
> rural and low-income patients reach it, including women less likely to own a handset.
>
> Confidence is shown, never hidden. Outside the vocabulary the app refuses out
> loud and asks for a human interpreter. One wrong sentence in a consultation is a
> dosage error; a tool that smooths that over is worse than one that admits it missed.

*(~285 words)*

---

## 7. Traction or impact

> Straight answer: no revenue, no pilot, no paying customer. What exists is a
> working prototype and a problem large enough to justify it. I would rather say
> that here than have it discovered.
>
> Built: live camera capture, hand-shape recognition for a closed set of signs,
> clinician speech to text, spoken replies to the patient, and refusal when a
> phrase falls outside the supported set. It runs in the browser of the phone a
> nurse already carries.
>
> Reach: Deaf Nigerians. The Discrimination Against Persons with Disabilities
> (Prohibition) Act 2018 requires effective communication in public services,
> health included. In practice that access is carried by relatives and by paper.
> Nigeria publishes no Deaf-patient-to-interpreter ratio — an unmetered gap does
> not get funded, which is part of why this persists.
>
> Across borders: the architecture is language-agnostic. The clinical vocabulary —
> roughly 200 terms covering pain, allergies, medication and consent — is the same
> structure in every market; only the sign language changes. Ghana, Kenya and
> South Africa share the interpreter shortage. Expansion is vocabulary and
> validation work, not a rebuild.
>
> Jobs: the first paid roles are Deaf advisers and qualified interpreters building
> and validating that vocabulary — skilled work that barely exists as a paid
> position outside a few urban centres. Every new market adds a vocabulary team,
> and the work stays in the region.
>
> Low connectivity: the recognition runtime is served locally after first load, so
> ward wifi that drops still works. No account, no patient app.
>
> What would change this answer: two pilot departments and the advisers to build
> the two hundred terms. A pilot matters more than a cheque.

*(~285 words)*

---

## Flags — read before you submit

**1. The funding checkboxes are wrong, or I'm missing something.**
You have *Commercial revenue* and *Grants* ticked. The deck says self-funded,
the brief says pre-revenue, and I have no record of a grant. On a form that a
judge reads next to a deck that says "Revenue — does not exist", this is the one
inconsistency that does real damage. Untick both unless there is a grant or an
invoice I don't know about.

**2. Slide 4 of the deck and answer 7 say the same unwelcome thing twice.**
That is deliberate. Traction is 20% and you score near zero on it either way;
being visibly straight about it protects the 30% impact score.

**3. Things only you can do — in the order that costs least time:**

| # | Item | Time |
|---|---|---|
| 8 | Photo of your passport or national ID + date of birth | 5 min |
| 2 | Proof of operating — a screenshot of app.liveunmute.com on a phone | 2 min |
| 3 | Upload the deck PDF from `pitch-deck/afcen/` | 1 min |
| 5 | Demo video, 3 min max | 20–40 min |

Do 8 and 2 first. If the video becomes impossible, submit without it and note
the link in the answers — a missing item beats a missing application.

**4. The theme is a stretch, and that's fine.**
AfCEN's Build theme is digital trade, payments, logistics, manufacturing and
services. Unmute is a health *service* delivered on a phone. Lead with
"services public and private buyers rely on" and the jobs argument, not with
healthcare access as a human-rights story. The deck does this.

**5. Video, if you can only get one shot at it.** Three minutes, screen
recording, no face needed:
- 0:00 — the ready screen, say one line: what it is, who it's for
- 0:20 — show a yes / no / numeral being read from a hand, on camera
- 1:10 — show a clinician phrase matching, and show a phrase being *refused*
- 1:50 — show the spoken reply
- 2:20 — say what it does not do yet, in one sentence
- 2:40 — name the pilot ask

The refusal is the best 20 seconds in the video. Do not cut it for time.
