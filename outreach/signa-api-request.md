# Email: Signa AI API access

**STATUS: SENT** — 9 November 2026
Message ID `1a1c00210163bb10`
From: princeonpurpose@gmail.com (the only verified send-as address on this
mailbox — `contact@liveunmute.com` is not yet a send-as alias here)
To: support@usesigna.org
Sent as plain text, no markdown, signed "Prince Nzubechukwu Michael".

---

**To:** support@usesigna.org
**Subject:** Signa AI API access

Their docs pre-fill this subject:
https://mailto:support@usesigna.org?subject=Signa%20AI%20API%20access
(their exact wording: "Contact us with what you want to build and roughly how
much: how many words a month, how many hours of live signing, how many videos")

---

Hello Signa team,

I'm [YOUR NAME], founder of Unmute, a two-way sign-language communication tool
for hospitals — based in Abuja, Nigeria. I'd like a trial key for the Signa API.

**What we're building**

A clinician speaks, and the Deaf patient sees the reply signed. That is the
direction we need from you: **English text in, ASL out.** Not Kinyarwanda, not
RSL — English to American Sign Language.

It runs in hospitals, on the ward, at the bedside. A nurse has no training
session and no patience; the signed reply has to appear in a second or two,
in a browser, on whatever device is in the room.

**Roughly how much**

- About **18,000 words a month** to start — roughly **110,000 characters**
- Around 50 sentences a day, 12 words per sentence, across a small pilot
- No live signing initially; we may want it later
- A few hundred exported videos for testing

**What I'd like to know**

1. A trial key (`sk_trial_…`) with limits around the figures above.
2. Confirmation that **English → ASL** output is production-quality, not
   secondary to Kinyarwanda → RSL. I'd rather know now than discover it in
   front of a clinician.
3. **Client tokens** — our app is browser-based. Their docs say to use
   short-lived client tokens rather than shipping the key, and I'd like to
   understand the shape before I build against it.
4. Whether `.sgn` requires your player, or whether `POST /v1/sign/video`
   returning MP4 is the intended path for a web app.
5. Clinical vocabulary — *milligrams*, *NPO*, *penicillin*, "on a scale of one
   to five". Is there a way to add signs, or is coverage fixed?
6. Whether a plan at ~110,000 characters/month can be agreed rather than
   starting on Pro and topping up.

**About us**

We're pre-revenue, building on licensed engines rather than training our own
models, and heading into a national demo day with a working prototype. Two
reasons I'm asking you specifically rather than an American vendor: your
pricing is in RWF and payable by MTN MoMo, which actually works from Nigeria,
and an African engine is a better fit for an African hospital than renting
recognition from California.

Happy to answer anything or do a short call.

Thanks,
**[YOUR NAME]**
Founder, Unmute
contact@liveunmute.com · app.liveunmute.com

---

## Before you send

- Name used: **Prince Nzubechukwu Michael**.
- **Send from `contact@liveunmute.com`.**
- **Ask for the trial, not a purchase.** Their docs say "most teams start with
  a trial … about a month with modest limits". That is the cheap route in.
- **The ASL question (2) is the one that matters.** They are Kinyarwanda-first;
  ASL is a secondary output. If ASL is weak, the whole point of using them
  collapses and you should know before writing code.
- **110,000 characters is deliberate.** Pro is 25,000/month — four times too
  small for a pilot. Naming the real figure now avoids a `429` mid-demo.
- **Do not mention the Avec contest or the iDICE grant.**

## When the key arrives

**Do not put it in `index.html`.** It is a live credential that spends a plan.

1. Netlify → Site configuration → Environment variables → `SIGNA_KEY`
2. `app/netlify/functions/sign.js` gains a `/api/sign/v1/sign` route that
   attaches it server-side — same pattern as `SIGNSPEAK_KEY`
3. Or use their client tokens, which is tighter: short-lived, scoped, no
   standing key anywhere

Then the composite provider routes `textToSign` → Signa, `signToText` →
Sign-Speak, each failing independently.

---

# Reply received — 11 November 2026

**From:** Support Team `support@usesigna.org`
**Thread:** `1a1c00210163bb10`

They said yes to a trial key and offered a custom usage-based monthly
arrangement around 110,000 characters rather than the standard Pro plan.
They will look at clinical vocabulary coverage. They asked two questions:
integration architecture, and which clinical scenarios come first.

## What they did not answer

**Whether English → ASL is production-quality or secondary to Kinyarwanda →
RSL.** This was question 2 in the original email and the most consequential
one. Their reply discusses ASL support and then says they would want to
"understand your specific requirements and evaluate the expected vocabulary
and signing accuracy before making production-level commitments" — which is
reasonable, but it is not an answer.

Signa is a Rwandan company whose documented strength is Kinyarwanda and RSL.
An ASL pipeline that is second-class would be worse than useless in a
Nigerian hospital, and would fail in front of a clinician rather than in a
test harness. **Do not build against the API until the 20-clip test in the
draft reply has been run and shown to an ASL signer.**

## Reply drafted

Draft `r-6484002114579792047` in the thread. It:

1. Answers the architecture question with what actually exists — static
   browser app, Netlify Function proxy, key server-side. This is stronger
   than the client tokens they recommended, so say so rather than adopting
   a weaker pattern out of politeness.
2. Gives the real clinical phrase list from `app/js/media.js`.
3. Names the vocabulary that actually carries risk: milligrams, dosage,
   twice a day, NPO, penicillin, allergies — and asks whether the API can
   refuse an unsupported term rather than sign something approximate.
4. Proposes a 20-clip production-settings test as the go/no-go gate.
5. Declines to sign a monthly commitment pre-revenue, and asks for a written
   quote plus a 30–60 day capped trial instead.

## Before sending

- [ ] Confirm 110,000 characters/month is still the right estimate
- [ ] Decide whether to name a call slot or leave it open
