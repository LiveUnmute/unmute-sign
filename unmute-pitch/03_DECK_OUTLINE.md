# 03 — Deck Outline

**Prepared:** 20 October 2026
**Format:** 15 main slides + 6 appendix
**Companion:** `02_PITCH_NARRATIVE.md` — read that first; this is the same argument in slide form.

Each slide below gives you: the **headline** (the assertion a reader should get in three seconds), the **content** (what is physically on the slide), the **speaker note** (what you say that isn't written), and a **status flag** marking which claims are sourced and which are still yours to prove.

Status flags: `SOURCED` · `YOUR CLAIM` · `TO BE BUILT` · `DO NOT USE`

---

## Slide 1 — Title

**Headline**
> ## Unmute
> ### Most Deaf patients never get an interpreter. Unmute is what's there instead.

**Content**
- Name, one line, one image — a hospital corridor, not a hand. The product is about a gap in care, not about sign language as decoration.
- Contact line: `liveunmute.com` · `contact@liveunmute.com`
- Date on the deck. An undated deck is assumed to be stale.

**Speaker note**
Open with the sentence, not your name. "Fifty to one" is the first thing out of your mouth.

**Avoid** the old tagline *"Every Voice Deserves to Be Heard."* It is a good mission line and a bad title — it describes a wish, not a product.

---

## Slide 2 — What actually happens

**Headline**
> **Under one in ten Deaf patient encounters involves a professional interpreter.**

**Content** — one bar chart, five bars, source line in 9pt. No other text.

```
How emergency physicians actually communicate with Deaf patients
(n = 166)

A family member interprets  ████████████████████████████████  63.9%
The patient writes on paper ████████                          16.9%
A friend interprets         ███                                6.0%
A hospital interpreter      ██▌                                4.8%
Video link to interpreter   █▌                                 3.6%
                                                          — Cureus, 2022
```

**Speaker note**
This is the most important slide in the deck and the one that does the work the old "0 interpreters needed" line was reaching for, without the legal exposure.

Say it plainly: "The alternative in use today is a family member. Sixty-four per cent. That is not a gap in the system — that is the system."

Be ready for "that's one study, one country, 166 physicians." Answer: it isn't a claim about the exact percentage; it's a claim about the order of magnitude, and it replicates across health systems — a 2002 UK study found interpreters present at 7% of emergency consultations.

**Status** `SOURCED` — Cureus / Akeely et al., 2022, n=166 emergency physicians. Also 74.1% of those departments had no policy for Deaf patients, and 90.4% of staff knew no sign language — use those as the second slide's sub-line or on the speaker note.

**Do not** replace this with a timeline showing an interpreter arriving. An earlier draft did exactly that and it was wrong: it implied an interpreter is coming, when the data says the opposite.

---

## Slide 3 — The arithmetic

**Headline**
> **Fifty Deaf ASL users for every certified interpreter.**

**Content** — three numbers, large, each with a source line in 9pt:

| | |
|---|---|
| **~500,000** | Deaf adults in the US who use ASL as a primary language |
| **~10,000** | Certified ASL interpreters in the US |
| **~50 : 1** | The ratio, before accounting for geography, hours, or scheduling |

**Speaker note**
Give the smaller number, not the bigger one. Around a million deaf and hard-of-hearing adults use some form of signing; I'm giving you the half-million because it is the defensible figure. That choice — being conservative in public — is itself a signal, and it's the one you want to send.

**Status** `SOURCED` — AAFP 2024 for the population; Registry of Interpreters for the Deaf for the interpreter count. See `01_STRATEGY_AND_EVIDENCE.md`, sources [1] and [3].

---

## Slide 4 — What it costs

**Headline**
> **In the vacuum, care is improvised — and sometimes it goes wrong.**

**Content** — three fragments, quoted, with attribution in small type:

> *"Interpreter access was uncertain, delayed or absent at key points of emergency care, including assessment and consent."*
> — Hazelwood et al., *Journal of Clinical Nursing*, 2026

> A triage delayed awaiting an ASL interpreter. A Deaf patient restrained for a scan, unable to understand what was happening, tearing skin trying to get free.
> — Pennsylvania Patient Safety Authority, 2025

> **What fills the gap in practice:** handwritten notes · lip-reading · a relative's phone · gestures

**Speaker note**
Do not read all of this out. Read the first quote, then say: "consent is the word I'd circle." Move on.

**Status** `SOURCED`. Both are real, published, citable.

**Avoid** the Zulaihatu Abdullahi story. No provenance, no date, no hospital, and it is Nigerian — it does not belong in an American deck.

---

## Slide 5 — Why this isn't already solved

**Headline**
> **General sign models fail exactly where clinical communication lives.**

**Content** — three failures, each with an example:

| Failure | Why it breaks in a hospital |
|---|---|
| **Vocabulary** | Trained on broadcast and lecture footage. Knows *family*, *school*, *weather*. Has never seen *hypertension*, *NPO after midnight*, or a fingerspelled drug name. |
| **Numeracy** | *Fifteen milligrams* and *fifty milligrams* differ by one handshape. Dosage is the highest-consequence token in the room. |
| **Grammar** | ASL has its own syntax and non-manual markers. Anything that transcribes word-for-word produces signed English, which Deaf users correctly reject. |

**Speaker note**
This slide does the most work in the deck. It converts "AI sign language" — which every investor has heard a hundred times — into a specific engineering problem. It also answers "why hasn't Google done this?" before it is asked.

**Status** `YOUR CLAIM`, well-founded. Say "we believe" lightly; the technical content is standard in the field.

---

## Slide 6 — The narrow build

**Headline**
> **Two hundred signs and phrases carry most of the routine clinical risk.**

**Content** — the scoping argument in one line, then the vocabulary domains:

**Pain** · location, severity, onset, duration
**History** · allergies, current medication, prior conditions
**Consent** · affirmation, teach-back, understanding check
**Discharge** · dose, frequency, warning signs, follow-up

> Bounded vocabulary. High stakes. Repeated thousands of times a day, in every hospital in the country.

**Speaker note**
The counter-intuitive move is to make the product *smaller*. Most founders in this space pitch a general translator because it sounds bigger. Yours is credible precisely because it is finite — and finite is what makes an accuracy number possible.

**Status** `YOUR CLAIM` / product design.

---

## Slide 7 — The product

**Headline**
> **Three flows. One direction. Measured, not promised.**

**Content** — three columns. This one slide does the work of a product slide and a scope slide, and it is the slide that makes the replacement claim safe.

| **v1 ships** | **Not in v1** | **A qualified interpreter is still engaged** |
|---|---|---|
| Sign → text, on the patient's device | Generative signing avatars | Consent for procedures |
| Sign → speech, for the clinician | Text → sign synthesis | Diagnosis disclosure |
| Clinician → patient via recorded human signing, fixed clinical phrase set | Multilingual | Mental health assessment |
| Runs on the hardware already in the room | EHR integration | Complex discharge planning |
| | Offline mode | End-of-life discussions |

**Speaker note**
Say both right-hand columns out loud. They are the most persuasive part of the slide, because every experienced listener is currently assuming you'll promise all of it.

On the third column: "We're not claiming to satisfy the requirement for a qualified interpreter, and we never will. There's a list of conversations where a human being has to be in the room, and we say so on the slide. That's why hospital counsel can approve us."

On avatars: a generative avatar producing signed English is a liability in a clinical setting, and the research problem is different and harder. We sequence it.

**Status** `TO BE BUILT`. There is no model. Say so — this slide is a specification, and it should be labelled as one.

---

## Slide 8 — Where we are today

**Headline**
> **What exists, and what doesn't.**

**Content** — two honest columns, no spin.

| Exists | Does not exist |
|---|---|
| Problem definition, grounded in published clinical evidence | A trained model |
| ASL data pipeline; How2Sign loaded and schema verified | A published accuracy number |
| Clinical vocabulary scope defined | A pilot |
| A founder who has worked this problem for a year | A signed design partner |
| | Revenue |

**Speaker note**
This slide will feel like a risk. It is the opposite. Every other pre-seed deck in this category claims a prototype. The one that says "here is exactly what is missing, and here is the order we fix it in" is the one that gets believed for the rest of the meeting.

Do not pad the left column. Four real items beat eight thin ones.

**Status** Verifiable from the audit. `D_Facts_and_Metrics.md` is the backing.

---

## Slide 9 — The moat

**Headline**
> **The only defensible asset here is a corpus nobody can scrape.**

**Content** — four layers, built in this order:

1. **Data** — consented clinical ASL. Deaf patients and qualified interpreters, recording clinical vocabulary in clinical context, annotated to a protocol written with an ASL linguist, regional variation preserved rather than averaged away.
2. **Benchmark** — the published clinical accuracy number becomes what procurement asks every vendor for.
3. **Workflow** — embedded in triage. Switching cost rises with every shift that runs on it.
4. **Institution** — security review completed, BAA signed, procurement navigated. Paperwork is a moat when your competitor is a solo founder.

**Speaker note**
Be precise about tense. "We are building this" — not "we have this." If you overclaim here, a technical investor will ask how many annotated clips you hold, and the answer is currently zero.

**Status** `YOUR CLAIM` / thesis. Legitimate as a thesis; illegitimate as an achievement.

---

## Slide 10 — Business model

**Headline**
> **Subscription, per care team. Priced against the encounter it covers.**

**Content**

| Tier | Practitioners | Price | Buyer |
|---|---|---|---|
| **Ward** | up to 10 | ~$199 / month | Nurse manager, clinic manager, ADA coordinator |
| **Department** | up to 50 | ~$599 / month | Department head, accessibility lead |
| **Enterprise** | 50+ | custom | Procurement, IT security, legal |

> Billed monthly. Annual prepay discount. BAA included from the Ward tier up.

**Speaker note**
Flag the middle tier as your addition — the brief had a hole between 10 and 50, and that gap is where a bottom-up sale actually works: small enough to buy without procurement, large enough to pay properly.

Say plainly: "These prices are a hypothesis. We're testing them in ten conversations before we hold them."

**Status** `YOUR CLAIM` / pricing hypothesis. Never present an untested price as a finding.

---

## Slide 11 — Why the buyer says yes

**Headline**
> **The current alternative is free. That is the objection to answer.**

**Content** — name the objection, then answer it.

> **"A family member does it for free."**

| | Current practice | Unmute |
|---|---|---|
| Cost | $0 | ~$199/month, up to 10 practitioners |
| Compliance posture | Discouraged by the NAD — no impartiality, no medical vocabulary, no capacity for distress | Purpose-built, documented, auditable |
| Record of the encounter | None | Communication log |
| Risk if it goes wrong | The hospital chose the free option knowingly | — |

> **The buyer's choice is not "Unmute vs. $0."**
> It is "Unmute vs. a practice their own professional guidance tells them to avoid."

**Speaker note**
This is the objection that kills the deal if you don't raise it yourself, because every hospital administrator is thinking it: *we already do this for nothing.* Name it out loud, then use the NAD's own guidance as the answer — their professional body says a family member should not interpret, because they lack impartiality, don't know the terminology, and are often in distress themselves.

Then the second half of the answer: nobody is asking them to swap out a service they are paying for. They are being offered coverage for encounters that currently have none, plus a record that says a communication attempt was made. That record is what a compliance officer actually needs.

**Status** `TO BE BUILT` — the price is a hypothesis. If you want a cost comparison against video interpreting, get three real VRI quotes; do not use a figure from another deck.

---

## Slide 12 — Go to market

**Headline**
> **Three design partners, not a sales team.**

**Content** — a three-step sequence:

1. **Design partners (0–6 months).** Three departments — one ED, one outpatient clinic, one community health centre. Free for six months. In exchange: workflow access, data collection consent, a named testimonial.
2. **Paid ward deployments (6–12 months).** Bottom-up. Nurse manager buys the Ward tier on a card. No procurement.
3. **Enterprise (12–24 months).** The first two steps generate the security review, the BAA template, and the reference customer that enterprise sales requires.

**Channels:** Deaf community organisations and interpreter agencies as referrers — not competitors.

**Speaker note**
The channel point is strategic, not decorative. Interpreter agencies are the incumbents you are *not* displacing, and they have the hospital relationships. A referral arrangement with two of them is worth more than any amount of paid acquisition.

**Status** `YOUR CLAIM` / plan. Zero design partners today — say so.

---

## Slide 13 — Roadmap

**Headline**
> **Eighteen months. Three milestones. One number we're willing to publish.**

**Content**

| | Milestone | Proof |
|---|---|---|
| **M1** *(0–6 mo)* | Clinical ASL model, 200-term scope | Accuracy on **held-out clinical data**, published with failure modes |
| **M2** *(6–12 mo)* | Three design partners live | Deaf user + clinician testing; measured time-to-communication |
| **M3** *(12–18 mo)* | First paid contract + corpus | One Ward-tier customer; annotated corpus at a defensible size |

> If we miss M1, you'll know before we do — because we'll have published the number.

**Speaker note**
The last line is the strongest thing in the deck. It is also a real commitment, so only say it if you mean to publish a bad number as readily as a good one.

**Status** `TO BE BUILT`.

**Avoid** the six-stage roadmap from the old deck — ASL PoC, NSL corpus, three Nigerian hospitals, Ministry of Health, Africa expansion, global. Four of those six stages no longer exist under this pivot, and the remaining two have no dates.

---

## Slide 14 — Team

**Headline**
> **One founder today. The gap is the pitch.**

**Content** — two columns, same honesty as slide 8.

**Today**
- Founder — AI research, NLP, product. Built the ASL pipeline. One year inside this problem.

**Being recruited — before or alongside this round**
- **Deaf co-founder / Head of Product** — decision authority, not an advisory title
- **Clinical advisor** — emergency medicine or nursing, currently practising
- **ASL linguistics advisor** — owns the corpus annotation protocol
- **Paid Deaf design panel** — 5–8 people, paid, with veto power over releases

**Speaker note**
Do not soften this. "It's me today, I'm hearing, and I'm building for a community I'm not part of. I don't think that's disqualifying — I think it's disqualifying if it stays that way."

Then stop. Let them ask the next question.

**Status** Names must be real or absent. An unnamed advisor is fine; an implied one is not.

---

## Slide 15 — The ask

**Headline**
> **What this round buys.**

**Content**

| Use of funds | |
|---|---|
| Model development & compute | |
| Corpus collection & annotation | |
| Deaf design panel & advisory | |
| Clinical validation | |
| Compliance — HIPAA posture, BAA, security review | |

> **Milestone:** a published accuracy number on held-out clinical ASL, three live design partners, one paying customer.

**Speaker note**
Give the structure and the milestone. If the amount is not yet modelled, say "I'm building the number bottom-up from these five lines" — that is a better answer than a round figure with no arithmetic behind it.

**Status** `TO BE BUILT`. Do not attach figures until the cost model exists.

---

# Appendix

Put these behind the main deck. They exist to answer the questions that would otherwise derail the room.

**A1 — Evidence and sources.** Every statistic in the deck, with publication, date, and link. One page. This single slide is why people will believe the other fourteen.

**A2 — The competitive landscape.** Named, not categorical. VRI providers, sign-language AI startups, human interpreter agencies. The old deck had no named competitor; that reads as not having looked.

**A3 — Regulatory posture.** ADA's effective-communication requirement, and how the product sits relative to it. One critical sentence: *Unmute does not satisfy the requirement for a qualified interpreter and is not positioned as doing so.* Have this reviewed by a US healthcare lawyer before external use.

**A4 — Data ethics and consent.** How corpus data is collected, consented, stored, and withdrawn. This is the highest legal exposure in the venture and the slide most likely to be probed.

**A5 — What we are deliberately not doing.** Multilingual. Avatar synthesis. EHR integration. Consumer app. Listing exclusions signals judgement.

**A6 — The NSL question.** If asked why not Nigeria: ASL was chosen because the data and the benchmark exist, and because the buyer with budget exists. Nigerian Sign Language remains the founder's home market and a second-market ambition, not a current capability.

---

## Build order

1. Slides 2, 3, 9 — the argument. If these three don't hold, no amount of design saves the deck.
2. Slides 7, 8 — the product and the honest status.
3. Slides 10, 11 — the money. Do not write these until you have three VRI quotes.
4. The rest.

## One structural warning

The deck currently has **no market-size slide**, and that is deliberate. The standing rule is not to invent TAM/SAM/SOM, and there is no bottom-up model yet.

A US investor will ask. The answer is not a global Deaf-population figure — that is the mistake the old deck made. It is a bottom-up count: *US hospitals and clinics that serve Deaf patients, by facility count and bed count, times your tier price.* Build it from real facility counts before the first serious meeting, or be ready to say "we're building it bottom-up and I won't give you a number I can't defend."

The second answer is acceptable from a pre-seed founder. The first, done badly, is not.
