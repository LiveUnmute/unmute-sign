# 01 — Strategy & Evidence

**Prepared:** 20 October 2026
**Purpose:** Set out what the ASL-first, healthcare, B2B direction changes, which old evidence dies with it, and what replaces it.

---

## The short version

The new direction is a real strategy, and it is materially better than what was on file. But it is not a re-wording of the old pitch. It is a different company in a different market, and four things that were true last week are now false:

1. **The Nigerian evidence is no longer relevant to the core pitch.** The 8%/7% GDRI statistics were the strongest numbers in the corpus. They describe Deaf Nigerians and Nigerian Sign Language. They cannot carry an ASL-first, dollar-denominated, hospital-subscription story. Keeping them in the deck would be a category error.
2. **"NSL, ASL and more" must go.** Under the pivot, NSL is not a current capability, not a roadmap stage, and not a claim. It is out of scope for v1, full stop.
3. **"0 — Interpreters Needed" was pointing at something true and saying it badly.** The instinct — that in most encounters no interpreter is present, and that the shortage is the reason the product exists — is correct, and it is the entire commercial case. What fails is the wording, because "0 interpreters needed" reads as *hospitals can stop providing interpreters*, which is legally wrong and the fastest way to lose the community you are building for. The defensible version is narrower and stronger: **no interpreter needs to be on site.**
4. **The seven payments become an awkward fact rather than a traction line.** They were consumer payments. The model is now institutional. Raising them in a B2B deck invites "so who is your customer?" — a question the deck cannot currently answer well.

None of these is fatal. All of them have to be decided before a single slide is written.

---

## Decision 1 — Which market does "ASL-first" actually mean?

This is the decision the whole deck rests on, and the brief does not resolve it. There are two readings, and they lead to different companies.

**Reading A — ASL is the commercial beachhead.**
ASL is the primary language of Deaf communities in the United States and anglophone Canada. A monthly per-team subscription sold to hospitals and clinics, with an enterprise tier above 50 practitioners, is a US software motion — dollar pricing, procurement departments, security review, HIPAA. Under this reading you are building an American healthcare company from Enugu.

**Reading B — ASL is the technical proving ground.**
You build on ASL because How2Sign exists and benchmarks are comparable, prove the method, then port it to Nigerian Sign Language and sell in Nigeria. Under this reading the business model in the brief does not fit: a 10-seat Team Plan at US price points is not sellable to a Nigerian public hospital, and the whole point of the pivot was to escape the NSL data problem.

**My reading: the brief describes Reading A.** Ten-practitioner team plans and 50+ enterprise tiers are a US SaaS shape. The word "enterprise" alone implies a procurement function that Nigerian clinics do not have.

**If Reading A is right, three consequences follow immediately and must appear in the deck:**

- **Compliance stops being a footnote and becomes a slide.** HIPAA, a Business Associate Agreement with every hospital customer, and a security posture that survives an IT review. A solo founder in Nigeria will be asked where data is processed. That answer has to exist before the first sales call.
- **The founder's geography becomes an objection you must answer, not hide.** Investors will ask how an Enugu-based solo founder runs US hospital pilots. There is a good answer — capital efficiency, a 4–5× engineering-cost advantage, remote-first design-partner recruiting — but it has to be on a slide.
- **The evidence base is entirely replaced.** See the table below.

If Reading B is what you actually meant, say so and I will rewrite this. The rest of this document assumes Reading A.

---

## Decision 2 — The evidence swap

The old deck leaned on Nigerian statistics. The new deck needs American ones. Here is the replacement set, all sourced, with the caveats you should carry into a room.

### Live evidence — US-specific

| Claim | Figure | Source | How to use it |
|---|---|---|---|
| Deaf adults in the US who use ASL | **~500,000** | AAFP, Oct 2024 [1] | The population denominator. Use it plainly, do not inflate it. |
| Deaf and hard-of-hearing adults who use sign language | **~1 million** | Mitchell & Young (2023), NHIS 2010–2018 [2] | Use when someone challenges the 500k figure as too small. |
| Certified ASL interpreters in the US | **~10,000** | Registry of Interpreters for the Deaf, via Deaf Services Unlimited [3] | Gives you the **50:1 ratio**. This is your single best structural stat. |
| Deaf patients' hospital use | More likely to have been admitted in the past 12 months; higher rates of chronic illness | AAFP, Oct 2024 [1] | Frames Deaf patients as high-frequency, not marginal. |
| Legal obligation | Hospitals must provide "effective communication"; staff with limited sign language may interpret **only briefly, in emergencies, until a qualified interpreter arrives** | ADA Business Brief, hospital settings [4] | This is the sentence that defines your product category. It literally describes the gap you are filling. |
| Family members as interpreters | Should be avoided — lack of impartiality, unfamiliar medical terminology, distress | National Association of the Deaf [5] | Kills the "just use a relative" objection. |
| **How Deaf patients actually communicate in the ED** | **63.9%** family member · **16.9%** writing · **6.0%** friend · **4.8%** hospital interpreter · **3.6%** video interpreter | Cureus / Akeely et al., 2022 (n=166 emergency physicians) [10] | **The single most important statistic in the deck.** Under 10% had professional interpretation. This is the proof that Unmute is the alternative, not the stopgap. |
| Department readiness | **74.1%** of EDs had no policy for Deaf patients; **90.4%** of staff knew no sign language | Cureus / Akeely et al., 2022 [10] | Shows this is systemic, not anecdotal. |
| Interpreter presence at consultation | BSL interpreters present at **7%** of ED and **17%** of GP consultations | Reeves et al., 2002, cited in *Frontiers in Communication* [11] | UK data — label it as such. Useful corroboration across health systems. |
| Interpreter absence at the decisive moments | Access "uncertain, delayed or absent at key points of emergency care, including assessment and consent" | Hazelwood et al., *Journal of Clinical Nursing*, Oct 2026 [6] | The core problem statement, from peer-reviewed qualitative work. |
| Waits | Up to **8 hours** where interpreter requests were declined | Wilson-Menzfeld et al., 2025 systematic review [7] | Powerful, but the context is international (largely NHS). Do not label it US. |
| Documented harm | ED triage delayed awaiting an ASL interpreter; patient restrained during a scan, agitated, skin tear | Pennsylvania Patient Safety Authority, May 2025 [8] | The safety case, from a state body. Use one example, not a list. |

### Dead evidence — do not carry forward

| Claim | Why it must go |
|---|---|
| 8% of Deaf Nigerians have full healthcare communication access | Nigerian population; irrelevant to a US pitch and unverifiable in the Drive (no GDRI report, no methodology). |
| 7% can communicate with their doctors | Same. |
| 38% can afford healthcare | Same, and it was never a communication statistic anyway. |
| "70 million+ Deaf people lack accessible healthcare" | Unsourced in every version. It also conflates Deaf population with healthcare-access deficit. |
| NSL dataset: 8,000 images, 137 signs | No paper, author, year or link. It described the Nigerian state of the art. Deleting it loses nothing. |
| "Documented preventable deaths across multiple Nigerian states" | No case cited, ever. |
| The Zulaihatu Abdullahi case | No provenance. See Decision 6. |

**If you keep any Nigerian material at all**, keep exactly one sentence — *"the same failure pattern is documented across health systems, including in Nigeria, where our founder has direct community relationships"* — and put the research in the appendix. It is a credibility signal, not evidence.

---

## Decision 3 — The baseline is "nothing," not "interpreter"

**A correction to the previous draft of this document, and the most important change in this revision.**

The earlier framing said Unmute covers the interval before a qualified interpreter arrives. That framing was wrong. It implies an interpreter is coming.

For most encounters involving a Deaf patient, none is. In a survey of **166 emergency physicians**, the most commonly reported ways of communicating with Deaf patients were:

| Method | Share of physicians |
|---|---|
| A family member interpreting | **63.9%** |
| The patient writing on paper | **16.9%** |
| A friend interpreting | **6.0%** |
| An official hospital staff interpreter | **4.8%** |
| Video link to an interpreter | **3.6%** |

*(Cureus / Akeely et al., 2022)*

Four in five used a family member or a notepad. Fewer than one in ten used any professional interpretation at all. In the same study, **74.1% of departments had no policy for Deaf patients** and **90.4% of staff knew no sign language**. A separate 2002 study found BSL interpreters present at just **7% of emergency consultations** and 17% of GP consultations.

So the comparison is not Unmute versus a qualified interpreter. **It is Unmute versus a notepad and a cousin.** Against that baseline, Unmute is not a stopgap. In the encounters it serves, it is the only communication access present at all.

Three consequences:

**The market is bigger, not smaller.** "The interval" describes a window — narrow, defensible, small. "No interpreter on site" describes the default condition of the large majority of Deaf patient encounters. The insufficiency of interpreters is the whole point, and the data above proves it far more starkly than the old deck's framing did.

**It removes a budget objection.** A hospital director hearing *"we cover the gap before your interpreter arrives"* hears a new line item on top of interpreter spend. One hearing *"this is what runs in the encounters that never had an interpreter"* hears coverage for an exposure they already carry and cannot currently close.

**It converts the interpreter shortage from a weakness into the thesis.** You are not asking a hospital to swap a qualified interpreter for software. You are asking it to stop relying on a patient's cousin.

---

### The one line that must stay precise

ADA requires *effective communication*, and for complex matters a qualified interpreter. A hospital cannot treat software as satisfying that obligation. If your deck implies it can, you hand their counsel a reason to reject you, and you become the vendor who created a compliance problem rather than the one who solved an access problem.

So hold **"no interpreter on site,"** not **"no interpreter needed."** They sound similar and are not. The first says: no human has to be physically in the room. The second says: the hospital's legal obligation is discharged. The first is true, provable, and sellable. The second will end the meeting.

**Scope it explicitly on a slide — two tiers:**

| | Unmute is the access layer | A qualified interpreter is engaged |
|---|---|---|
| **Encounters** | Triage intake · routine history · pain assessment · appointment and wayfinding · discharge medication instructions · follow-up questions · ward check-ins | Consent for procedures · diagnosis disclosure · mental health assessment · complex discharge planning · end-of-life discussions · legal and forensic |
| **Volume** | The large majority — see the table above | The minority, and the highest-stakes minority |
| **What it replaces** | Nothing, because there was no interpreter. It replaces notes, gestures, and a relative's phone. | Nothing. It does not substitute, and should not. |

This table does more for you than "0 — Interpreters Needed" ever did. It tells a buyer what they are purchasing, tells a Deaf reader where the limits are, and makes the product *more* credible by conceding the one area it cannot cover.

**Say this:** *"In most Deaf patient encounters, no interpreter is present — under ten per cent, by the numbers. The alternative on offer is a family member or a notepad. We're the alternative that actually works."*

**Not this:** *"AI replaces interpreters."* It is untrue, it is legally reckless for the buyer, and it converts your best referral channel into an opponent.

---

## Decision 4 — Cut the avatar from v1

The brief describes both directions: signs → text/speech, and speech/text → visual sign output.

These are not equally hard. Sign→text is a recognition problem you can attack with How2Sign and a fine-tuned model. Text→sign requires a generative avatar that produces grammatically correct ASL — including non-manual markers (facial expression, mouth morphemes, eyebrow raises) that carry grammatical meaning, not decoration. An avatar that signs word-for-word English is not ASL; it is signed English, and Deaf users reject it. This is a well-known failure mode in the field.

**Recommendation:** v1 ships **sign → text and speech only.** For the practitioner's side, ship structured phrase selection (the clinician picks "where is the pain?" from a clinical phrase bank, and it renders as video of a real signer, not a synthesised avatar). Recorded human video for a fixed phrase set is cheaper, more accurate, and more trusted than a generative avatar — and it is buildable now.

Ship text→sign when you have the corpus and a Deaf design panel telling you the output is acceptable. Do not promise it on a slide before then.

This is a scope decision, not a capability claim. It should be explicit in the deck's product slide, because "we do both directions" will invite a technical question you cannot yet answer.

---

## Decision 5 — There is a hole between 10 and 50

The brief has a Team Plan to 10 practitioners and enterprise from 50. A 30-person clinic has no tier.

This matters more than it looks. The 11–50 segment is exactly where a bottom-up sale works: small enough to buy without procurement, large enough to pay properly. It is probably your best early revenue segment, and it currently has no product.

**Recommendation — three tiers, not two:**

| Tier | Practitioners | Indicative price | Buyer | Motion |
|---|---|---|---|---|
| **Ward** | up to 10 | ~$199/mo | Nurse manager, clinic manager, ADA coordinator | Self-serve, card on file |
| **Department** | up to 50 | ~$599/mo | Department head, accessibility lead | Light sales call |
| **Enterprise** | 50+ | custom | Procurement, IT security, legal | Full cycle, BAA, security review |

Per-practitioner: $19.90 at Ward, ~$12 at Department. The discount curve is coherent, and the middle tier closes the gap without changing the top or bottom.

**These prices are a hypothesis, not a finding.** They are set so that a single avoided delayed triage or one declined-interpreter incident pays for a year. Validate in ten pricing conversations before printing them on a slide — the worst outcome is a deck that states a price the market has already rejected.

---

## Decision 6 — The Zulaihatu Abdullahi story

The old deck opens with the death of a 19-year-old Deaf woman in a Nigerian hospital. It appears in four documents. All four are copies of one text, none cite a source, and none name the hospital, the date, or any published account.

Three problems, in ascending order of seriousness:

1. **It is unverifiable.** A journalist or investor who searches will find nothing.
2. **It exploits a death you cannot evidence.** If the story is real and you have permission, say so and cite it. If it is real and you do not, it is not yours to open a pitch with.
3. **It contradicts the ASL pivot.** A Nigerian case cannot open an American healthcare deck without explanation, and the explanation ("this happens everywhere") is exactly the kind of unsourced generalisation the audit flagged.

**Recommendation:** open with the *structural* fact instead — that the law requires effective communication, that a 50:1 interpreter ratio makes that impossible on demand, and that in practice under 10% of emergency encounters involve any professional interpretation at all. That is more damning than a single anecdote precisely because it is systemic, citable, and applies to the market you are selling into.

If the personal story matters to you — and it may — use your own. A first-person account of why you started this is legitimate, and it is the one version nobody can fact-check you out of.

---

## Decision 7 — The legitimacy problem does not go away, it gets worse

The audit's hardest finding stands: a hearing solo founder, no Deaf advisor with decision authority, and a product that translates a language he does not use, sold into a community he is not part of.

The pivot sharpens this rather than softening it. You are now proposing to build an American product for a community whose language and institutions you have no documented relationship with, from another continent.

**This will be the first question, and no slide about market size will answer it.**

The only credible response is structural, and it has to be visible in the deck:

- **A Deaf co-founder or head of product with real decision authority** — not an advisor, not a logo on a slide.
- **A clinical co-founder or advisor** — an ED physician or nurse who has actually hit this problem at 3am.
- **An ASL linguistics advisor** — for the corpus annotation protocol, because that is the technical heart of the moat.
- **A paid Deaf design panel** — 5–8 people, paid for their time, reviewing every build. Not a focus group, a standing panel with veto power.

None of these people currently exist in the corpus. The deck must say so and say what happens to them. "Recruiting" is an acceptable answer on a pre-seed slide. Implying they exist is not.

**Make the Deaf co-founder a condition of the round.** It is the single strongest legitimacy signal available to you, and it is worth more than the money it costs.

---

## What this repositions Unmute *as*

| | Old | New |
|---|---|---|
| **Product** | Sign language translation, bidirectional, multilingual | Clinical communication layer for encounters with no interpreter on site |
| **User** | Deaf people, globally | Deaf ASL users in US healthcare settings |
| **Buyer** | Hospitals and government | Nurse managers, clinic managers, ADA coordinators → enterprise |
| **Language** | NSL, ASL and more | ASL only, stated without apology |
| **Competitor** | The interpreter | The family member, the notepad, the missed appointment |
| **Moat** | Data | Corpus + clinical workflow + completed institutional trust |
| **Proof** | Claims | Published accuracy on a held-out clinical set |

The last row is the one that matters. Everything in this company becomes fundable the moment there is a number on a slide that says how accurate the model is on clinical ASL, measured on data the model has never seen.

That number does not exist yet. It is the first thing to build.

---

## Sources

[1] Graham Center / *American Family Physician*, "Understanding the Health Care Needs of the Deaf Community Through Medical Interpreters," October 2024. https://www.aafp.org/pubs/afp/issues/2024/1000/graham-center-deaf-community-health-care-needs.html

[2] Mitchell & Young (2023), "How Many People Use Sign Language? A National Health Survey-Based Estimate," NHIS 2010–2018; summarised by RIT Libraries, Deaf Demographics guide. https://infoguides.rit.edu/c.php?g=380750&p=9393643

[3] Deaf Services Unlimited, citing the Registry of Interpreters for the Deaf (~10,000 certified interpreters) and the National Census of the Deaf Population. https://deafservicesunlimited.com/asl-interpreter-shortage-and-accessibility-in-higher-education/

[4] US Department of Justice, "ADA Business Brief: Communicating with People Who Are Deaf or Hard of Hearing in Hospital Settings." https://archive.ada.gov/hospcombr.htm

[5] National Association of the Deaf, "Position Statement on Health Care Access for Deaf Patients." https://www.nad.org/about-us/position-statements/position-statement-on-health-care-access-for-deaf-patients/

[6] Hazelwood et al., "Communication Access and Emergency Care for D/deaf People: A Reflexive Thematic Analysis of Patient Experiences," *Journal of Clinical Nursing*, October 2026. https://onlinelibrary.wiley.com/doi/full/10.1111/jocn.70578

[7] Wilson-Menzfeld et al., "Communication Experiences of Deaf/Hard-of-Hearing Patients During Healthcare Access and Consultation: A Systematic Narrative Review," *Health & Social Care in the Community*, 2025. https://onlinelibrary.wiley.com/doi/full/10.1155/hsc/8867224

[8] Pennsylvania Patient Safety Authority, "Overcoming Communication Barriers to Improve Patient Safety for American Sign Language Users Who Are Deaf or Hard of Hearing," May 2025. https://patientsafety.pa.gov/psj/Pages/2025-5-28-138084.aspx

[9] Gallaudet University, "How Many People Use ASL in the United States?" — estimates of primary users range from 100,000 to 500,000. https://www.gallaudet.edu/documents/Research-Support-and-International-Affairs/ASL_Users.pdf

[10] Akeely et al., "Communication Challenges While Dealing With a Deaf Patient in the Emergency Department and Suggested Solutions," *Cureus*, November 2022. n=166 emergency physicians. https://pmc.ncbi.nlm.nih.gov/articles/PMC9719717/ · full text: https://assets.cureus.com/uploads/original_article/pdf/123472/20221204-14608-chmml1.pdf

[11] Reeves et al. (2002), cited in "Deaf Sign-Language Using Patients' Experiences in Health Consultations," *Frontiers in Communication*, 2020. https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2020.572855/pdf
