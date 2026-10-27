# 05 — Application answers

For the Founders Smith pitch submission.

Everything below is drawn from the deck outline, the narrative, and the source research
in this folder. Where a fact is yours and not something I can verify, it is marked
**▸ CONFIRM** — do not submit until those are checked. Nothing here claims a model,
a pilot, or revenue that does not exist.

---

## Company name

```
Unmute
```

## One liner — 145 / 200 characters

```
Unmute is two-way sign-language translation for hospitals, so Deaf patients are understood at the point of care, not when an interpreter is free.
```

Shorter alternative, 114 characters:

```
Unmute is two-way sign-language communication for hospitals, so Deaf patients are understood at the point of care.
```

## Website

**▸ CONFIRM** — pick whichever is genuinely live:

- `https://liveunmute.com` if that domain is live
- Otherwise the deployed landing/demo URL
- Otherwise leave blank rather than listing something that 404s

A reviewer clicks this first. A dead link costs more than an empty field.

## Where is the company based?

**▸ CONFIRM**

```
Nigeria
```

Add a city if the field allows. If you are operating for a US market from Nigeria,
that is normal at pre-seed and worth stating plainly in the traction box.

## Is the company incorporated?

**▸ CONFIRM** — this is a factual field; answer exactly.

| If | Then |
|---|---|
| Registered | `Yes` + jurisdiction |
| In progress | `In progress` — say where and expected date in the traction box |
| Not yet | `No` |

Do not round up. Diligence checks this within days, and it is the single easiest
thing to be caught on.

## Founder

**▸ CONFIRM**

```
[Your full name] — Founder
[your email]
```

## Your email

**▸ CONFIRM** — use a domain address (`@liveunmute.com`) if you have one. It reads
better than Gmail for an accelerator, and it takes ten minutes to set up.

## Is this a full-time effort?

**▸ CONFIRM** — answer honestly. Accelators accept part-time founders at pre-seed far
more often than founders think; they do not accept being misled about it.

---

## Who is building this?

The form asks for every builder, who the lead is, previous company and previous role.

**▸ CONFIRM** all of it. Suggested structure:

| Field | Answer |
|---|---|
| Full name | [Your name] |
| Role | Founder — AI research, NLP, product |
| Previous company | [ ] |
| Previous role | [ ] |
| Lead founder | ☑ checked |

If you have a co-founder, add them. If you do not, leave the co-founder row empty —
an empty row is fine, an inflated one is not.

---

## Sector

**▸ CONFIRM** — pick what the picker actually offers. Best fit, in order of preference:

1. HealthTech / Healthcare
2. Accessibility / Assistive Technology
3. AI / Machine Learning
4. SaaS / B2B

If they force a single choice, take **HealthTech** — it is the buyer, the budget and
the compliance story in one word.

## How far along are you?

**▸ CONFIRM** — choose whichever matches their scale, honestly.

The truthful position, in plain language:

> Problem defined and grounded in published clinical evidence. Market and vendor
> landscape mapped and priced. Clinical vocabulary scoped. No trained model, no pilot,
> no revenue yet. Pre-product, with the research and specification complete.

## Traction so far

This is the field where most pre-seed founders overreach. Yours should be specific:

```
Research and validation:
- Problem grounded in published clinical evidence: 166-physician survey showing
  fewer than 1 in 10 Deaf patient encounters involve a professional interpreter
  (Cureus 2022), corroborated by Pennsylvania Patient Safety Authority (2025)
  and Journal of Clinical Nursing (2026).
- Market sized bottom-up: ~500,000 Deaf ASL users against ~10,000 certified
  interpreters in the US — roughly 50:1.
- Vendor landscape for both translation directions researched and priced against
  primary documentation, including the finding that no vendor publishes an
  independent, healthcare-relevant continuous ASL→English accuracy figure.

Product:
- Clinical vocabulary scoped to ~200 high-risk terms across pain, history, consent
  and discharge.
- Two-way communication prototype built and running (sign→text and clinician→patient).
- Landing page with waitlist and letter-of-intent intake live.
```

**▸ CONFIRM** the last two lines before including them — only claim what is actually
deployed. If the prototype is the demo folder and the page is the landing page, say so
in those words rather than implying more.

**▸ ADD** anything real that is missing: grants, programme places, competitions,
mentions, partnerships, waitlist numbers, LOIs. If you have any signed letter of
intent, it belongs here and it is worth more than everything above.

## Pitch video

**▸ CONFIRM** — if you have none, leave blank.

If you make one: 90 seconds, shot on a phone, your face on camera, no slides. Say the
one-liner, the 50:1 ratio, the 63.9% figure, what v1 does, and what does not exist yet.
That last part is the one that gets remembered.

## Pitch deck & data room

Paste the Drive folder link, **shared as "Anyone with the link → Viewer"** before you
submit. See the structure below.

The reviewer must be able to open it on the first click. A folder that shows
"You need access" reads as a broken application.

## Who does the technical work?

The form warns that unsourced work is the most common thing that breaks a company
later. This is your strongest field — answer it precisely:

```
Technical work is done by the founder, who owns architecture, integration and
evaluation.

Deliberately, we are not training a model for v1. The product integrates verified
third-party engines behind our own interface, with a clinical phrase library and a
confirmation layer where the patient sees and approves what was understood before
anything is spoken to the clinician.

That decision is documented rather than assumed: each candidate engine was checked
against its own primary documentation for capability, pricing, licence terms and
data-retention posture. Several well-funded options were rejected on those grounds —
one consumer product trains on uploaded content and retains it indefinitely, and one
market-leading model is not licensable for medical use at all.

Where no vendor meets the bar, the plan is to build and own the clinical ASL corpus,
which is the durable asset and the reason the company is defensible.

Modelling, annotation protocol and clinical validation are supported by an ASL
linguistics advisor and a clinical advisor. Both roles are being recruited —
neither is claimed as filled.
```

**▸ CONFIRM** the advisor sentence matches reality. If nobody is engaged yet, say
"being recruited" and nothing more. An implied advisor is a diligence failure.

## Anything else you considered building? (optional)

Worth answering. It shows judgement rather than a single idea:

```
Two alternatives were considered and rejected for v1.

A generative signing avatar, translating the clinician's speech into synthetic
sign language. Rejected because a general model trained on broadcast footage
produces fluent but wrong signing in exactly the vocabulary that matters —
dosages, allergies, consent — and a synthetic avatar carries clinical liability
that a recorded human signing library does not. It is sequenced, not abandoned.

A consumer interpreter app for Deaf users direct. Rejected because it moves the
buyer from a hospital with a compliance obligation and a budget to an individual
with neither, and changes the entire regulatory story.
```

---

## The Drive folder — build it before you submit

Share settings that make this work:

| Who | Access |
|---|---|
| **Anyone with the link** | **Viewer** |
| You | Owner |
| Your graphics designer | **Editor** (added by email) |

That combination lets the reviewer open it today and lets your designer edit, and
nobody can alter anything you did not intend. The link never changes when you add
files, so you submit it once.

Structure:

```
Unmute — Data Room/
├── 01 Pitch Deck/          Unmute — Deck v1 (Oct 2026).pdf
├── 02 Product/             Prototype screenshots, link to live page
├── 03 Evidence/            The sourced statistics, one page
└── 04 Team & Legal/        Incorporation docs, if they exist
```

Do not submit it empty. A two-page PDF in `01` changes the read from "nothing here"
to "early, but organised" — and you cannot control which hour they open it.

---

## Order of operations

1. **▸ CONFIRM** every flagged field above — website, incorporation, full-time, name,
   previous role, traction, advisors.
2. Export the deck to PDF from `pitch-deck/index.html` (Print → Landscape →
   background graphics on → margins none).
3. Create the Drive folder, add the PDF and whatever else is real, set
   **Anyone with the link → Viewer**.
4. Open the link in a private window. If it asks for access, it is wrong.
5. Send the designer the deck PDF *and* `03_DECK_OUTLINE.md` — the outline explains
   the argument behind each slide, which is what stops a redesign from flattening it.
6. Submit.

The deadline pressure is real, and the folder sharing is the one item that must be
right on the first try, because you get no second click.
