# Unmute — Complete Knowledge Audit and Intelligence Report

**Prepared:** 20 October 2026
**Scope:** All Google Drive material accessible to the account, searched and inspected for Unmute-related content
**Auditor role:** Research archivist / knowledge analyst
**Status of underlying venture:** Pre-seed, pre-MVP, single founder, Nigeria

---

## How to read this report

Every material statement carries an evidence label. These are used strictly:

| Label | Meaning |
|---|---|
| **DOCUMENTED FACT** | Stated in a file and consistent across sources, or verifiable from file metadata |
| **FOUNDER CLAIM** | Asserted by the founder in a document, not independently evidenced in Drive |
| **THIRD-PARTY RESEARCH** | Attributed in a file to an external study, report, or dataset |
| **PROPOSED PLAN** | A stated intention, roadmap item, or target — not evidence of execution |
| **UNVALIDATED ASSUMPTION** | A belief the documents themselves flag as untested, or that is stated without support |
| **ANALYSIS** | My own inference or judgement, clearly not sourced from the files |
| **UNKNOWN / NOT FOUND** | Absent from the accessible corpus |

Source IDs (S1–S25) map to full filenames, links, and dates in **B_Source_Register.md**.

### Important boundary on this audit

This is an audit of **what the Drive contains**, not of what Unmute has actually built. The Drive is unusually thin on engineering artefacts: there is **no Unmute code repository, no technical architecture document, no model card, no API specification, no prototype recording, and no test results** anywhere in the accessible corpus. The repository checked out for this session (`unmute-sign`) contains only a two-line `README.md` and an initial commit. That absence is itself a finding and is treated as such throughout.

Three files could not be read for content and are disclosed in Section 8 and in the Source Register: the ASLIN interview audio (S15), the IDICE pitch video (S16), and the PDF export of the July deck (S10). One file (S6) was read with a gap in the middle caused by response-size truncation; the missing segment is identified.

---

# 1. Executive summary

## One sentence

**Unmute is a pre-MVP Nigerian venture building an AI-powered, bidirectional sign-language interpretation tool for healthcare settings — turning a Deaf patient's signing into text and speech for clinicians, and a clinician's speech into text and an AI-generated signing avatar for the patient — intended to be sold to hospitals rather than to Deaf users themselves.**

## Detailed explanation

**What it is.** Unmute is described consistently across its three most recent strategy documents as "an AI-powered sign-language communication platform designed to help Deaf people and hearing people communicate" (S4), with healthcare in Nigeria as the entry market (S1, S4, S5, S6). The product concept has two translation directions:

- **Sign → text/speech.** A camera captures the Deaf patient signing; a vision model recognises the signs; the output is text and synthesised speech for the clinician (S3, S4).
- **Speech/text → sign.** The clinician speaks or types; the system converts the message into text and an **AI-generated signing avatar** (S1, S4).

**What problem it addresses.** Deaf sign-language users cannot reliably communicate with clinicians who do not sign. In Nigeria this is compounded by a shortage of qualified interpreters, cost, rural unavailability, and the absence of a structured Nigerian Sign Language (NSL) training corpus. The founder's framing is that the barrier is **structural**, not attitudinal: "Expecting every healthcare worker to learn sign language is unrealistic" (S1).

**Who experiences it.** Primarily Deaf sign-language users in Nigeria, with hearing clinicians as the second party to every failed exchange. The market research document broadens the affected population to Deaf people interacting with schools and public services as well (S6).

**How the proposed solution works.** A mobile application. The patient signs to a camera; the clinician's speech is captured by microphone; both are translated and displayed/voiced. The pitch deck promises under-2-second latency, offline capability in low-connectivity settings, multilingual support (NSL, ASL, "and more"), and on-device privacy (S1). **None of these four properties is evidenced anywhere in the Drive as built or measured** — they are product-positioning claims, not test results.

**What makes it potentially valuable.** Three things, in the documents' own logic:

1. A genuinely severe, documented, and under-served problem at the intersection of disability access and clinical safety.
2. A defensible data position *if* the promised NSL corpus is actually built — the deck explicitly names "Nigeria has almost no structured Nigerian Sign Language dataset" as the commercial opportunity (S1).
3. An institutional buyer (hospitals, health networks, government) rather than a low-willingness-to-pay consumer segment (S3).

**What stage the venture is actually at today.** This is the single most important correction the audit makes to the venture's own narrative. Unmute is at **pre-prototype, pre-pilot, pre-revenue-definition stage**, with:

- **No demonstrated working product** in the Drive — no demo video of the system functioning, no screenshots of a running application, no repository, no accuracy figures.
- **No completed hospital pilot**, no signed pilot agreement, no letter of intent.
- **No pricing, no financial model, no budget, no funding ask, and no market-size calculation** (TAM/SAM/SOM) in any file.
- **Seven informal payments** from people who want early access — the only revenue-adjacent signal in the corpus (S6). Amount, channel, and terms are not recorded.
- **A one-person team**, with the founder simultaneously holding a CTO role at another venture and a product/research role at a third organisation (S11).
- **Strategy documents dated 18–19 October 2026** — one and two days before this audit — indicating the business framing is being actively rewritten right now.

The venture's presentation layer (a polished narrative deck, a named victim story, a six-stage global roadmap) is roughly two to three stages ahead of its evidence layer. That gap is the central risk this report documents.

---

# 2. Origin story and evolution

## 2.1 The documented origin

The Drive contains **two different origin accounts**, and they do not contradict each other so much as operate at different levels.

**Account A — the institutional origin (CV, S11).**
Prince Michael worked as an **Artificial Intelligence Research Intern at Robotics and Artificial Intelligence Nigeria (RAIN), Ibadan, April 2025 – August 2025**. Under that role the CV lists: "Developed Unmute, an AI-powered sign language translation system designed to improve communication accessibility for the deaf and hard-of-hearing community," plus "Researched and implemented machine learning approaches for translating sign language into text and speech in real time," "Worked with computer vision datasets and AI models to recognize and interpret sign language gestures," and "Designed a 3D sign language representation system using digital modeling techniques."

This is the **only dated, institutional, third-party-contextualised statement of where Unmute came from**. It places the technical origin in a research internship, working on computer-vision sign recognition and 3D signing representation — which is precisely the two-direction architecture the pitch deck later presents.

**Account B — the narrative origin (deck, S1/S2/S8/S9).**
The pitch opens not with the founder's biography but with a patient: **Zulaihatu Abdullahi, a 19-year-old Deaf woman who presented at a Nigerian hospital, could not communicate with her doctors, and died.** "Her death wasn't caused by a lack of medicine. It was caused by a lack of communication."

**This story has no citation anywhere in the corpus** — no news article, no report, no case file, no interview transcript. It appears in four files, but three of them are copies of the same document (S8 and S9 are near-identical Google Docs; S1 and S2 are the same deck text). **Repeat appearances across copies are not independent corroboration.** It must be treated as an unverified founder claim until provenance is produced.

**ANALYSIS:** The two accounts are compatible — a research internship produced the technical capability, and a case (however sourced) supplied the mission. But the *documents never link them*. A reader of the deck would assume the founder witnessed the case; a reader of the CV would assume the project was an internship assignment. Which is true matters for how the venture is pitched to accelerators and to the Deaf community.

## 2.2 Evolution timeline

| Date | Artefact | What it shows about the venture's stage |
|---|---|---|
| Apr–Aug 2025 | RAIN internship (S11) | Technical origin: sign→text/speech recognition + 3D signing representation |
| 14 Jul 2026 | "Every-Voice-Deserves-to-Be-Heard" deck (S8/S9/S10) | First full pitch narrative. Contact: `prince@unmute.ai`, `www.unmute.ai`. Pure healthcare framing. |
| 6 Aug 2026 | "Unmute Pitch Video — IDICE" (S16) | Video produced for an iDICE-related pitch. **Content not viewable in this audit.** |
| 16 Aug 2026 | How2Sign dataset added (S13/S14) | Concrete technical step: ASL dataset acquired/loaded |
| 15 Sep 2026 | ASLIN interview recorded (S15); blank market-research template (S7) | Primary qualitative research begins. **Audio not transcribable in this audit.** |
| 30 Sep 2026 | Market Research Module 2 (S6) | Most substantive analytical document. Introduces **two products**: Unmute Sign + **Unmute Expression** |
| 14 Oct 2026 | Hackaholics 7.0 Enugu submission (S17/S24); earlier deck (S2, later trashed) | Competition entry. Deck v1 |
| 15 Oct 2026 | Current pitch deck (S1) | Deck v2. Domain changed to **liveunmute.com** / `contact@liveunmute.com` |
| 16 Oct 2026 | Founders Lab Cohort 2 base-grant session (S25) | Grant track engaged |
| 18 Oct 2026 | Value Proposition Canvas (S4) | Problem/solution/gain/pain formalised |
| 19 Oct 2026 | Lean Canvas (S3) + Digital Presence Worksheet (S5) | Business model and go-to-market formalised |
| 20 Oct 2026 | This audit | — |

## 2.3 Strategy changes that are documented

**Change 1 — domain and contact repositioning.** July deck: `unmute.ai` / `prince@unmute.ai`. October deck: `liveunmute.com` / `contact@liveunmute.com`. **DOCUMENTED FACT** (S8 vs S1). No file explains why. **ANALYSIS:** likely a switch from an aspirational `.ai` domain to an owned/available `.com` brand, or a deliberate split between a personal brand (`@PrinceOnPurpose`) and a venture brand (`@LiveUnmute`).

**Change 2 — from one product to two, then back to one.** The 30 September document defines "Unmute" as an umbrella over **Unmute Sign** (Deaf communication) and **Unmute Expression** (helping people "turn knowledge, thoughts and ideas into clear, effective communication" — essentially a communication-coaching/AI-writing product) (S6). By 18–19 October, both the Value Proposition Canvas and Lean Canvas describe **only the healthcare sign-language product** (S3, S4), and the 15 October deck contains no trace of Expression (S1).

**This is an undocumented strategic reversal.** The documents do not say Expression was dropped, parked, or renamed. See Section 13, Conflict C1.

**Change 3 — from "replace interpreters" to "complement interpreters," and back.** The market research explicitly warns: "Unmute should complement rather than claim to replace interpreters, especially in high-stakes cases" (S6). The pitch deck, written two weeks later, headlines **"0 — Interpreters Needed: AI replaces the need for scarce, expensive human interpreters"** (S1). See Conflict C2. This is the most reputationally dangerous contradiction in the corpus, because it is a claim about a protected community made in a public-facing asset.

**Change 4 — narrower geography in the newer documents.** The July deck and October deck both promise eventual expansion to Kenya, Ghana, South Africa and a "global platform." But the October canvases are strictly Nigerian and hospital-specific (S3, S4). **ANALYSIS:** the operating scope has quietly narrowed to "one Nigerian hospital workflow" while the narrative scope remains global — a normal and healthy divergence for a pre-seed venture, but one that should be made explicit to avoid the pitch being read as fantasy.

## 2.4 Current vision, mission, brand message

- **Tagline / brand line:** "Every Voice Deserves to Be Heard." — consistent across July and October decks (S1, S8).
- **Positioning sentence:** "An AI-powered healthcare communication platform that enables real-time conversation between Deaf patients and healthcare professionals — using sign language recognition, speech recognition, and AI-generated sign language" (S1).
- **Mission framing:** "I'm not building another AI product. I'm building the future of accessible healthcare — starting in Nigeria and scaling to the world" (S1).
- **Stated expansion thesis:** "Start in hospitals. Scale to education, government, and global accessibility infrastructure" (S1).
- **Mission (canvas version, more sober):** "Bridge the communication gap between Deaf patients and healthcare workers through AI-powered sign-language technology" (S3).

There is no separate, formally adopted vision statement or mission statement anywhere in the Drive. The two sentences above are the closest artefacts.

---

# 3. Problem definition and evidence

## 3.1 The problem as the documents define it

Unmute defines its problem at three levels of abstraction, and the documents are not consistent about which is primary.

**Level 1 — the healthcare communication gap (primary framing).**
"Deaf patients struggle to communicate with healthcare workers who do not understand sign language. Qualified sign-language interpreters may be unavailable. Medical information can be misunderstood, delayed or communicated through unsuitable alternatives" (S3).

**Level 2 — the structural access gap (deck framing).**
Three named barriers: **workforce scale** (hundreds of thousands of health workers — training all is "logistically impossible"), **cost** (interpreters "expensive, scarce, rarely available in rural or emergency settings"), and **time** ("years of training required — while patients need help today") (S1).

**Level 3 — the universal communication gap (September framing).**
"UNMUTE addresses the gap between what a person has to communicate and what they are able to communicate or have understood" (S6) — a thesis broad enough to cover both Deaf communication and general expressive difficulty.

**ANALYSIS:** Level 3 is the strongest *company* thesis and the weakest *fundraising* thesis, because it describes an enormous, unfocused market. Levels 1 and 2 are what the October documents converged back to. The reversion is strategically correct.

## 3.2 Evidence table — every documented problem claim

| # | Claim | Source | Type | Assessment |
|---|---|---|---|---|
| P1 | Only **8%** of surveyed Deaf Nigerians could access full communication in healthcare | S6, citing Global Deaf Research Institute 2024 Nigeria pilot | THIRD-PARTY RESEARCH (as cited) | Strongest quantitative evidence in the corpus. **Not independently verified in this audit** — no GDRI document, dataset, or link exists in the Drive. Sample size, methodology, and geography unknown. |
| P2 | Only **7%** could communicate with their doctors | S6, same source | THIRD-PARTY RESEARCH (as cited) | Same caveat. |
| P3 | Only **38%** reported being able to afford required healthcare services | S6, same source | THIRD-PARTY RESEARCH (as cited) | Used as context. This is a *financial access* statistic, not a communication statistic — it does not directly support Unmute's thesis and should not be bundled with P1/P2 as if it did. |
| P4 | A Nigerian Sign Language dataset of **8,000 static images, curated to 5,000 frames, covering 137 signs/words**, with a real-time sign-to-speech pipeline | S6, citing "IJCAI research" | THIRD-PARTY RESEARCH (as cited) | No paper title, authors, year, or link. **This is the most important citation to verify**, because it defines the known state of the art for NSL and therefore the novelty of Unmute's intended contribution. |
| P5 | Direct interview with the **Association of Sign Language Interpreters of Nigeria (ASLIN)** confirmed reliance on gestures / local or "pidgin" signs and the need for native NSL resources | S6; audio at S15 | FOUNDER CLAIM (primary research conducted) | The *existence* of the interview is evidenced by the 20.7 MB recording (S15). The *findings* are reported second-hand in S6. The recording itself was not transcribed in this audit. |
| P6 | Nigerian investigative reporting documented Deaf people **paying private interpreters** to accompany them to hospitals | S6, citing "ICIR" | THIRD-PARTY RESEARCH (as cited) | No article title, date, or URL. Cited as proof the problem is already monetised. |
| P7 | **70 million+** Deaf people globally lack accessible healthcare | S1 | UNVERIFIED | No source cited. This conflates (a) global Deaf population estimates with (b) lack of *healthcare access specifically*. Widely repeated in the deck as "the market is vast." Must be re-sourced or removed before external use. |
| P8 | Unmute has **received seven payments** from people waiting to use the product | S6 | FOUNDER CLAIM | Only revenue-adjacent signal. No amounts, dates, channel, or refund terms recorded. See Section 8. |
| P9 | Deaf patients face "delayed treatment, misdiagnosis, and preventable death" with "documented cases across multiple Nigerian states" | S1 | UNVERIFIED | "Documented" is asserted without a single citation. |
| P10 | The **Zulaihatu Abdullahi** case (19-year-old Deaf woman died after communication failure) | S1, S2, S8, S9 | UNVERIFIED | No provenance in any file. |
| P11 | Health-worker training is infeasible at scale ("hundreds of thousands of healthcare workers") | S1 | FOUNDER CLAIM / REASONED ARGUMENT | Directionally sound; no workforce figure is cited. |

## 3.3 What is external research vs founder observation

The corpus is admirably disciplined about this in **one** document — S6 — which repeatedly separates "secondary data," "direct ecosystem research," and "company signal." It is notably less disciplined in **S1**, where third-party statistics, founder narrative, and product promises sit side by side without distinction.

**Where S6 deserves credit:** it explicitly states that its statistics "are supporting evidence for communication barriers, not estimates of Unmute's market size," and that the seven payments are "early company-level demand signals, not yet proof of repeat usage or institutional purchasing." That is exactly the right epistemic posture, and it is the single strongest indicator of analytical maturity in the corpus.

## 3.4 What is missing from the problem evidence

- **No primary interviews with Deaf patients are documented.** Ten discovery interviews are *targeted* in S5; none are recorded, summarised, or transcribed in the Drive.
- **No clinician interviews** are documented.
- **No hospital-side evidence** of any kind — no procurement conversation, no clinical champion, no workflow observation.
- **No prevalence denominator.** The corpus never states how many Deaf sign-language users are in Nigeria, or how many hospital encounters involve them. Without that, the problem is vivid but not sized.

---

# 4. Product and technical architecture

## 4.1 The proposed user experience

The clearest description across all files is a **single shared device in a consultation room**, running a mobile application (S4), used alternately by patient and clinician:

1. **Patient signs to camera** → vision model → text → speech for the clinician ("Vision → Text") (S1).
2. **Clinician speaks** → speech recognition → text → **AI avatar signs** the message back to the patient ("Medical AI → Avatar Signs") (S1).
3. The deck compresses this to: "From camera to comprehension in under two seconds — a seamless, bidirectional conversation powered entirely by AI" (S1).

The Lean Canvas describes the same thing more soberly: "Sign-to-text and sign-to-speech translation. Speech/text-to-sign visual representation. A mobile platform for basic healthcare communication" (S3).

## 4.2 Feature-by-feature status assessment

Each feature is labelled strictly. **Nothing in this table may be read as "working"** — the corpus contains no build artefacts.

| Feature | Claimed in | Status | Reasoning |
|---|---|---|---|
| Sign → text recognition (ASL) | S1, S3, S4, S11 | **Partially implemented / unverified** | CV states machine-learning approaches were "researched and implemented" during a 5-month internship (S11). A How2Sign ASL manifest was loaded in Aug 2026 (S13/S14). No accuracy metric, demo, or repo exists. |
| Sign → speech synthesis | S1, S3, S4 | **Partially implemented / unverified** | Same basis. "Real-time sign-to-speech" is claimed in CV and referenced as a third-party pipeline in S6. |
| Speech → text (clinician side) | S1, S4 | **Proposed but not built** | No ASR vendor, model, or implementation is named anywhere. |
| Text → AI signing avatar | S1, S4, S11 | **Experimental / unverified** | CV: "Designed a 3D sign language representation system using digital modeling techniques." That is *design*, not a deployed avatar. No Blender file, rig, animation library, or avatar asset appears in Drive. |
| Nigerian Sign Language support | S1 ("supports NSL, ASL, and more"), S3, S4 | **Proposed but not built** | The deck itself says Nigeria has "almost no structured NSL dataset" and that building it is a *future* roadmap step (S1, step 2). Claiming NSL support in the same deck is internally inconsistent. |
| ASL support | S1, S2 | **Dataset present; model unverified** | How2Sign is an ASL dataset. Presence of a manifest ≠ a trained model. |
| **Under 2-second latency** | S1 | **Unverified claim** | No benchmark, device spec, or measurement. |
| **Offline capable** | S1 | **Unverified claim; technically doubtful as stated** | No on-device model, size, or architecture is described. Vision transformers + speech + avatar rendering on a low-end Android device offline is a hard engineering claim. |
| **Private by design — "patient data never leaves the device without consent"** | S1 | **Unverified claim; conflicts with cloud AI** | No privacy architecture, DPA, or data-flow diagram exists. If any recognition or LLM call is cloud-based, the claim is false as written. |
| Multilingual / multi-sign-language | S1 | **Proposed** | No second-language dataset beyond ASL exists. |
| Hospital deployment / institutional mode | S1, S3, S4 | **Proposed** | No pilot build, no admin console, no EHR integration. |
| **Unmute Expression** (general communication coaching product) | S6 only | **Deprecated or parked** | Present in the 30 Sep document, absent from all 15–19 Oct documents. No build evidence. |
| Web/landing page | S1, S5 | **UNKNOWN** | `liveunmute.com` and `unmute.ai` are cited as live URLs. Neither was fetched in this audit. |
| Hardware / wearable | — | **NOT FOUND** | No hardware component is discussed anywhere. |

## 4.3 Technology stack actually named in the files

This is a short list, and its shortness is a finding.

| Layer | Named technology | Source |
|---|---|---|
| Dataset | **How2Sign** (ASL, RGB front-view video, sentence-level alignment) | S13, S14 |
| Modelling approach | "computer vision datasets and AI models," "vision models, transformers, and edge AI" — generic, no named architecture | S11, S1 |
| 3D representation | "digital modeling techniques" — **Blender is never named in any file** | S11 |
| Speech | "speech recognition," "speech synthesis" — no vendor | S1 |
| Platform | Mobile application (iOS/Android unspecified) | S3, S4 |
| Cloud | "Cloud infrastructure and hosting" listed as a cost line | S3 |
| APIs / third parties | **None named.** No ASR API, no LLM provider, no avatar SDK, no cloud vendor. | — |
| Repository | **None for Unmute.** The session repo `unmute-sign` contains only `README.md`. | — |

**ANALYSIS:** A pitch that promises "under two seconds" and "offline" cannot be evaluated without knowing whether inference is on-device or server-side. The complete absence of any architecture document means every technical claim is currently unfalsifiable — which protects the venture in the short term and exposes it badly in any technical due-diligence conversation.

## 4.4 Prototype vs MVP vs long-term vision

The documents do not use these terms consistently. Reconstructed from the roadmap (S1) and canvases (S3, S4):

- **Current prototype:** *No documented prototype.* The closest artefact is a research-internship implementation of sign→text/speech plus a 3D representation design (S11), and an ASL dataset manifest (S13). There is no evidence these were integrated, and no demo exists in Drive.
- **Proposed MVP:** ASL proof of concept validating the core recognition engine (S1, stage 1) — i.e. **the MVP is explicitly an ASL system, not an NSL system.**
- **Proposed pilot product:** an NSL-trained model deployed in three Nigerian hospitals, measured on outcomes (S1, stage 3).
- **Long-term vision:** national rollout via the Ministry of Health, then Kenya/Ghana/South Africa, then a global multilingual accessibility platform (S1).

**This sequencing is the most consequential architectural fact in the corpus:** the venture intends to validate on **American** Sign Language and then re-train on **Nigerian** Sign Language. Those are different languages with different grammar, lexicon, and fingerspelling systems. Recognition accuracy on ASL predicts almost nothing about NSL performance. See Section 5 and Risk R3.

---

# 5. Datasets and AI research

## 5.1 Inventory

### D1 — How2Sign (ASL)

| Attribute | Detail |
|---|---|
| **Files** | `how2sign_realigned_train` (Google Sheet, 16 Aug 2026, ~1.8 MB) and `how2sign_realigned_train.csv` (5.6 MB, uploaded to this Drive 8 Nov 2023, last modified 2 May 2024) — S13, S14 |
| **Provenance** | Not owned by the founder. The CSV is owned by a third party (`mandacduarte2@gmail.com`), last modified 2024. This is an **externally sourced, shared research dataset**, not a Unmute-created asset. |
| **Purpose** | Sentence-level alignment manifest for continuous sign-language video |
| **Schema (verified)** | `VIDEO_ID, VIDEO_NAME, SENTENCE_ID, SENTENCE_NAME, START_REALIGNED, END_REALIGNED, SENTENCE` |
| **Language** | **American Sign Language.** Spoken-English sentence transcripts aligned to signer video. |
| **Vocabulary / domain** | Open-domain instructional speech — the rows sampled cover art history (acanthus leaves, illuminated manuscripts), psychology (self-esteem), massage technique, pet care (fleas, parrot grooming), tennis, and marathon running. **No medical vocabulary whatsoever.** |
| **Format & scale** | Tabular alignment metadata; the underlying videos are not in Drive. The spreadsheet is ~18,000+ rows (1.8 MB of CSV-equivalent text). |
| **Licensing** | **Not documented anywhere in the Drive.** How2Sign has its own academic licence terms; nothing in the corpus records that Unmute reviewed or complies with them. |
| **Intended use** | Implicitly: train/validate the ASL recognition engine for "MVP stage 1" (S1). |
| **What remains** | Everything downstream: no model, no training run, no evaluation split, no accuracy baseline, no licence record. |

**Critical analytical point:** How2Sign is continuous, open-domain, *American* Sign Language. Unmute's clinical use case requires **domain-specific, Nigerian** sign vocabulary (symptoms, body parts, pain descriptors, instructions, consent language). The dataset in the Drive cannot produce the product described in the deck. It can only prove that a pipeline runs.

### D2 — Nigerian Sign Language corpus (planned)

| Attribute | Detail |
|---|---|
| **Status** | **Does not exist.** Entirely a proposal. |
| **Source** | S1 roadmap stage 2: "Build the first structured Nigerian Sign Language training corpus" |
| **Stated plan** | "Unmute will build the definitive corpus" (S1); "Potential to build locally relevant sign-language datasets through community collaboration" (S3) |
| **Language** | Nigerian Sign Language (NSL) |
| **Vocabulary coverage** | Undefined. No target sign count, no clinical vocabulary list, no grammar model. |
| **Format & scale** | Undefined. No specification of video vs skeletal keypoints, signer count, regional variation, or annotation schema. |
| **Access / consent / licensing** | **Not addressed in any file.** This is the single largest unmanaged legal and ethical exposure in the venture. |
| **What remains** | Everything: protocol design, ethics approval, Deaf community partnership, consent framework, compensation model, annotation standards, regional variation handling, storage, and governance. |

### D3 — Referenced third-party NSL work

S6 cites "IJCAI research" producing an NSL dataset of **8,000 static images → 5,000 curated frames, 137 signs/words**, with a real-time sign-to-speech pipeline. No paper, author, year, or link is recorded. **This must be located and read** before Unmute can claim novelty, because 137 signs is a meaningful starting lexicon and may already cover part of the intended clinical vocabulary.

### D4 — Research paper (adjacent, not Unmute)

`When AI Becomes a Confidant` (S23, 10 Jul 2026) is a conceptual AI-safety paper by the founder on **Relational Role Attribution** in human–AI interaction. It is not about sign language and is not a Unmute asset. It is relevant only as evidence of the founder's research capability and interest in AI safety/trust — which is directly pertinent to a product that will ask Deaf patients to trust a machine translation in a clinical setting.

## 5.2 ASL vs NSL — the distinction the documents blur

This deserves its own subsection because it is the most likely source of a fatal technical misjudgement.

| Dimension | ASL (what the data is) | NSL (what the product needs) |
|---|---|---|
| Recognition data available to Unmute | How2Sign manifest (S13/S14) | None |
| Grammar | Distinct syntax, topic-comment structures, spatial grammar | Distinct; influenced by Nigerian linguistic environment; under-documented |
| Lexicon | Large, standardised, documented | Smaller documented lexicon; significant regional variation and "local/pidgin signs" per ASLIN interview (S6) |
| Fingerspelling | ASL manual alphabet | Different manual alphabet |
| Clinical vocabulary | Absent from How2Sign | Must be elicited from Deaf community and clinicians |
| Transferability | **Near zero at the sign level** | — |

The pitch deck's line "Supports Nigerian Sign Language, ASL, and more" (S1) implies a shared engine across languages. **That is not how sign languages work.** A model trained on ASL does not "support" NSL; it must be retrained, and the data must be built first. The venture's own roadmap acknowledges this. The marketing copy does not.

## 5.3 What must be verified before any dataset or API can be used

1. **How2Sign licence terms** — permitted use, redistribution, commercial restriction, attribution requirement.
2. **Provenance of the CSV in this Drive** — it is a shared third-party file, not a licensed acquisition. Whether the founder has independent access rights is unknown.
3. **The IJCAI NSL paper** — title, authors, dataset access conditions, whether the 137-sign vocabulary is reusable.
4. **GDRI 2024 Nigeria pilot** — full report, sample, methodology, permission to cite.
5. **Any speech-recognition or LLM API** — data residency, whether audio is retained, whether patient speech would constitute special-category health data, and whether the provider trains on submitted data.
6. **Deaf community consent model** — who owns contributed sign data, how contributors are credited/compensated, and whether the corpus can be commercialised.

---

# 6. Customers, users, and market

## 6.1 Segments, separated by role

| Role | Who | Evidence |
|---|---|---|
| **End users (demand side)** | Deaf sign-language users, characterised as "Amina, a Deaf student/young professional who uses Nigerian Sign Language and regularly deals with hearing people who do not sign, including healthcare workers" (S6) | S6, S3 |
| **End users (supply side)** | Doctors and nurses in consultation, triage, and admissions | S3, S4 |
| **Influencers of adoption** | Deaf associations; sign-language interpreter networks; individual clinicians who champion accessibility | S3, S6, S5 |
| **Economic buyer** | "Hospitals, healthcare networks and public healthcare institutions" (S3); "Initial institutional buyer may be a hospital/accessibility programme" (S6) | S3, S6 |
| **Partners / channels** | Association of Sign Language Interpreters of Nigeria (engaged); Deaf associations; hospital partnerships | S6, S3 |
| **Future expansion** | Education, government/public services, then Kenya, Ghana, South Africa, then "global accessibility infrastructure" | S1, S6 |

**Persons who are explicitly *not* the buyer:** individual Deaf users. The Lean Canvas lists only institutional revenue (S3). The seven payments (S6) are therefore anomalous relative to the stated model — see Conflict C4.

## 6.2 Market sizing

**There is no TAM, SAM, or SOM calculation anywhere in the corpus.** This is a genuine absence, not a document I failed to open. S6 explicitly declines to convert its statistics into market size ("These figures are supporting evidence for communication barriers, not estimates of Unmute's market size").

The only sizing-adjacent figures are:
- "Over 70 million Deaf people globally lack accessible healthcare" (S1) — unsourced, and not a revenue-relevant number.
- "Hundreds of thousands of healthcare workers across Nigeria" (S1) — unsourced, and a cost-of-training argument, not a market.

**ANALYSIS:** For a hospital-subscription model, the relevant market is *Nigerian hospitals and clinics that serve Deaf patients and have budget*, not global Deaf population. That number is derivable (tertiary/secondary/primary facility counts, private hospital counts in Lagos/Abuja/Enugu) but has not been derived. Any investor conversation will surface this within two questions.

## 6.3 Competitive landscape as documented

S6 contains the only competitor analysis in the corpus. Its structure is honest and useful:

| Alternative | Type | What users like | What frustrates |
|---|---|---|---|
| Human interpreter | Direct/Indirect | High-quality, nuanced communication | Availability, cost, scheduling, scalability, privacy |
| Family / friends | Indirect | Trusted, often free | Dependence, unavailability, privacy, insufficient signs |
| Writing / texting | Indirect | Easy, ubiquitous | Slow, literacy-dependent, weak for complex interaction |
| Local/pidgin signs & gestures | Indirect | Immediate, familiar | Limited/inconsistent vocabulary |
| Remote/video interpretation | Direct/Adjacent | Interpreter without travel | Human availability, connectivity, scheduling |
| Sign-language learning apps | Adjacent | Useful for vocabulary | Learning-focused, not real-time clinical communication |
| General AI / speech tools | Adjacent | Fast, scalable | May not recognise localised NSL; no trusted bidirectional sign |

**No named commercial competitor** (e.g. SignAll, SLAIT, Signapse, Google's sign-language efforts, or Nigerian entrants) is identified. The analysis is category-level, not company-level. That is sufficient for a Lean Canvas and insufficient for a fundraise.

## 6.4 Willingness to pay — evidence vs hypothesis

**Evidence (weak but real):**
- People already pay for private interpreters to accompany Deaf patients to hospitals, per ICIR reporting cited in S6. This proves the *problem* is monetised; it does not prove willingness to pay *for software*.
- Seven payments for Unmute early access (S6). Undocumented in amount or terms.
- Institutions pay for accessibility support generally (asserted, not evidenced).

**Hypothesis (explicitly labelled as such in S6):**
- Hospitals will pay a subscription after seeing pilot evidence.
- A defined institutional buyer exists with budget authority for accessibility tooling.

**Not tested:** price point, procurement route, budget cycle, whether accessibility spend sits with clinical, IT, HR, or corporate social responsibility, and whether a Nigerian public hospital has any discretionary software budget at all.

---

# 7. Business model and financial information

## 7.1 Revenue model as documented

The **only** revenue model in the corpus is the Lean Canvas (S3), which lists four streams without any figures:

1. Hospital subscriptions
2. Institutional software licensing
3. Implementation and training fees
4. Government and healthcare network contracts

The Value Proposition Canvas frames the offering as an "Institutional communication solution for hospitals and, in the future, other public-facing institutions" (S4).

## 7.2 Cost structure as documented

Also only in S3, and also without figures:

- AI and software development
- Sign-language data collection and validation
- Cloud infrastructure and hosting
- Pilot testing, training, and customer acquisition

**No monetary value is attached to any cost line. There is no budget, no burn rate, no runway, no unit economics, no pricing tier, no contract value, and no funding request anywhere in the corpus.**

## 7.3 Conflicting or absent financial assumptions

There is nothing to conflict, because there is only one model and it has no numbers. However, three implicit assumptions are worth surfacing:

- **Subscription vs licence vs per-encounter.** The canvas lists subscriptions *and* licensing *and* implementation fees *and* government contracts as if they are complementary. They imply very different sales motions (self-serve recurring vs enterprise procurement vs services-heavy). **A pre-seed venture cannot execute four motions.** This is an unmade decision, not a strategy.
- **Who pays for the Deaf patient's side.** The model assumes the hospital pays for a tool that primarily benefits a patient population that may be a small minority of its caseload. The business case to a hospital CFO is unstated.
- **Free-tier pressure.** If the seven paying individuals are consumers, there is an implicit consumer product that the Lean Canvas does not model.

---

# 8. Traction, validation, and partnerships

This section applies strict status definitions. **Nothing is upgraded without a document.**

## 8.1 Prototypes and demos

| Item | Status | Evidence |
|---|---|---|
| Sign→text/speech research implementation | **Claimed, not evidenced** | CV (S11) states it was developed during a 2025 internship. No code, demo, or output exists in Drive. |
| 3D signing representation | **Designed, not evidenced** | CV (S11): "Designed a 3D sign language representation system using digital modeling techniques." No asset file. |
| Integrated bidirectional app | **Not built** | No artefact. |
| Pitch video | **Exists; content unverified** | `Unmute Pitch Video —IDICE`, 87 MB, 6 Aug 2026 (S16). Format suggests a produced narrative video, not a screen recording of working software. Not viewable in this audit. |
| Public demo link | **Not found** | No URL, no Loom, no YouTube, no TestFlight/Play link. |

## 8.2 User research

| Activity | Status | Evidence |
|---|---|---|
| Interview with ASLIN | **Conducted** (15 Sep 2026) | 20.7 MB audio recording exists (S15); findings summarised second-hand in S6. Not transcribed. |
| Deaf patient discovery interviews | **Targeted, not completed** | S5 sets a goal of "at least 10 in-depth discovery interviews" — a forward-looking target, not a record. |
| Clinician interviews | **Not documented** | None. |
| Survey / responses | **Targeted, not completed** | S5 goal: "at least 15 meaningful responses or direct enquiries." No tally exists. |
| Prototype user testing | **Not started** | S5 goal: "secure a group of interested participants willing to test the prototype." No evidence any testing occurred. |

## 8.3 Payments and users

**DOCUMENTED:** "Unmute has also received seven payments from people waiting to use the product; these are early company-level demand signals, not yet proof of repeat usage or institutional purchasing" (S6).

**NOT DOCUMENTED:** amount per payment, total collected, date range, payment channel, what was promised in exchange, refund policy, identity of payers (individual vs institution), or whether any payer has since been contacted.

**ANALYSIS:** Seven payments is the venture's single most valuable asset *and* its most fragile claim. If it is a waitlist deposit of ₦5,000, it is a curiosity. If it is ₦200,000 from a clinic, it is a seed of a business. The corpus does not tell us, and any serious diligence will ask.

## 8.4 Pilots and institutional partnerships

| Item | Status |
|---|---|
| Hospital pilot | **Proposed only** — "Deploy in 3 Nigerian hospitals" is roadmap stage 3 (S1); S5 sets "identify at least three hospitals willing to discuss structured MVP testing" as an unmet goal |
| Signed pilot agreement | **None found** |
| Letter of intent / MOU | **None found** |
| Ministry of Health partnership | **Proposed only** — roadmap stage 4 (S1) |
| ASLIN relationship | **Contacted / interviewed** — not a formal partnership. No agreement, no endorsement, no LOI. **Do not describe ASLIN as a partner.** |

## 8.5 Programs, competitions, awards

| Item | Status | Evidence |
|---|---|---|
| Hackaholics 7.0 (Wema Bank), Enugu | **Entered / pitched** | `Team Unmute` folder inside `Hackaholics 7.0 Enugu pitch deck` (S17, S24), 14 Oct 2026. **No evidence of placement, award, or shortlist.** |
| iDICE Startup Bridge / Founders Lab, Cohort 2 | **Participating** | Module 1 & 2 worksheets submitted Sept 2026 (S6, S18); onboarding pack and Base Grant info session attended Oct 2026 (S25) |
| iDICE pitch video | **Produced** | S16, 6 Aug 2026 |
| iHatch Cohort 5 (ONDI/NITDA/JICA) | **NOT Unmute** | The iHatch materials in Drive are for **Persat Finance** (S19). Do not claim. |
| Awards | **None found** | — |
| Grants received | **None found** | Founders Lab has a "Base Grant" track (S25); no award document exists |

## 8.6 Traction scorecard

| Metric | Value | Confidence |
|---|---|---|
| Paying users | 7 (undisclosed amounts) | Low — founder claim |
| Active users | Unknown | — |
| Hospitals piloted | 0 documented | High confidence in the zero |
| Signed partnerships | 0 | High confidence |
| Revenue (recognised) | Unknown | — |
| Accuracy benchmark | None published | — |
| Team size | 1 | High — CV, all docs single-authored |
| Funding raised | Unknown / likely ₦0 | Inferred from absence |

---

# 9. Team, founder, and resources

## 9.1 The founder

**Prince Nzubechukwu Michael** — Enugu, Nigeria. Contact: `princeonpurpose@gmail.com`; personal site `princeonpurpose.com`.

**Documented experience (S11, CV):**

| Period | Role | Organisation | Relevance to Unmute |
|---|---|---|---|
| Apr 2025 – Aug 2025 | AI Research Intern | Robotics and Artificial Intelligence Nigeria (RAIN), Ibadan | **Direct** — Unmute originated here |
| Jan 2026 – current | Co-founder & CTO | Persat Labs, Enugu | Indirect — technical leadership, but a **competing time commitment** |
| Jan 2026 – current | Product & Research Lead | The BeaconSmith, Enugu | Indirect — **third concurrent commitment** |

**Self-described capabilities:** AI research, prompt engineering, LLM architecture, NLP, system design, cloud architecture, product discovery, product roadmap, team management.

**Research output:** authored a conceptual AI-safety paper, *When AI Becomes a Confidant* (S23), on trust and relational dependence in human–AI interaction — evidence of genuine research ability and, notably, of the exact trust problem Unmute will face in a clinical setting.

**References listed:** Dr Olusola Ayoola; Nzube Ndiokwelu; Philemon Nwigwe (RAIN / The BeaconSmith affiliations).

## 9.2 Team composition

**There is no team.** Every Unmute document is single-authored. The pitch deck has no team slide. The Hackaholics folder contains only a deck. There is:
- no technical co-founder,
- no clinical advisor,
- no Deaf community advisor or co-design partner,
- no interpreter on staff or retainer,
- no designer,
- no business/commercial lead.

**ANALYSIS:** For a venture whose core risk is *cultural and clinical legitimacy*, the absence of a Deaf advisor is more serious than the absence of a second engineer. A hearing founder building a product for Deaf users without a Deaf co-designer will be challenged — correctly — by every accelerator, funder, and community reviewer.

## 9.3 Access to interpreters, Deaf communities, healthcare

- **Interpreters:** one interview with ASLIN (S15/S6). No ongoing relationship evidenced.
- **Deaf community:** no documented individual relationships; the Lean Canvas lists "Access to Deaf communities, sign-language interpreters and healthcare professionals for validation" as an *asset* (S3) — which, given the rest of the corpus, reads as an aspiration rather than a held asset.
- **Healthcare professionals:** none named, none quoted, no clinical advisor.

## 9.4 Resources, equipment, funding

- **Funding:** none documented. No grant, no investment, no prize.
- **Equipment:** not documented. No GPU, camera, or device inventory.
- **Software:** Google Workspace, a How2Sign dataset, and (per CV) AI/ML tooling. No paid infrastructure evidenced.
- **Time:** the founder holds two other concurrent roles (S11). Available hours per week are not stated — the Module 1 worksheet that asks this question is blank (S18).

## 9.5 Skill and resource gaps

| Gap | Severity | Why |
|---|---|---|
| No Deaf co-designer / advisor | **Critical** | Legitimacy, usability, and consent for dataset creation |
| No clinical advisor | **Critical** | Clinical workflow, safety, liability, procurement credibility |
| No second engineer | High | A bidirectional real-time system is not a solo build on a part-time basis |
| No commercial/procurement capability | High | Hospital sales in Nigeria is relationship- and tender-driven |
| No ML evaluation capability demonstrated | High | No benchmark, no accuracy target, no test protocol |
| Split attention across three organisations | High | Execution risk |

---

# 10. Startup programs and applications

| Program | Purpose | Date / cohort | Status | Claims & metrics used | Commitments / milestones | Source |
|---|---|---|---|---|---|---|
| **Hackaholics 7.0** (Wema Bank) — Enugu | Pitch competition | Oct 2026 (folder 14 Oct) | **Entered / pitched.** No result documented. | Pitch deck content only (S1/S2). No traction metrics presented. | None documented | S17, S24 |
| **iDICE Startup Bridge — Founders Lab, Cohort 2** | Incubator / accelerator | Sept 2026 – ongoing | **Participating.** Modules 1 & 2 submitted; onboarding completed; Base Grant session attended 16 Oct 2026 | GDRI 8%/7%/38%; IJCAI 8,000/5,000/137; 7 payments; ASLIN interview | Module 2 market-fit argument; Module 1 goal plan **left blank** | S6, S18, S25 |
| **iDICE pitch video** | Program pitch | 6 Aug 2026 | **Produced** | Unknown — video not viewable | — | S16 |
| **iDICE Base Grant** | Grant funding | Cohort 2, info session 16 Oct 2026 | **Eligible / informed.** No application or award documented. | — | — | S25 |
| **iHatch Cohort 5** (ONDI / NITDA / JICA) | Incubation | 2026 | **NOT Unmute — this is Persat Finance.** Do not cite. | — | — | S19, and iHatch programme files |
| **Enugu Tech Fest (ETF)** | Event | 2026 | **Unclear.** An ETF media/brand folder exists in Drive but contains no Unmute material. | — | — | Drive listing only |

## 10.1 Inconsistencies across applications that need correction

1. **Domain/contact drift.** July deck: `prince@unmute.ai` / `www.unmute.ai`. October deck: `contact@liveunmute.com` / `www.liveunmute.com`. Any application still carrying the old address is out of date. **Determine which domain is actually owned and live.**
2. **Product scope drift.** The 30 Sep Founders Lab submission describes **two products** (Sign + Expression). The 15 Oct deck and 18–19 Oct canvases describe **one**. If Founders Lab assessed the two-product version and the deck now contradicts it, that should be reconciled explicitly rather than left to be discovered.
3. **"Replaces interpreters" vs "complements interpreters."** S6 (submitted to Founders Lab) says complement. S1 (used at Hackaholics) says "0 interpreters needed." Two assessors at two programs have been told different things about the same core value proposition.
4. **Team description.** The Hackaholics deck has no team slide; the CV shows three concurrent roles. Any verbal claim of a "team" would be inconsistent with the file record.
5. **NSL capability.** S1 asserts NSL support; S6 and S1's own roadmap say the NSL corpus does not yet exist.

---

# 11. Product roadmap and execution plans

## 11.1 The published roadmap (S1)

| # | Stage | Stated scope | Status as of 20 Oct 2026 |
|---|---|---|---|
| 1 | **MVP** | ASL proof of concept — core recognition engine validated | **In progress / not evidenced.** Dataset manifest loaded Aug 2026; no model, metric, or demo. |
| 2 | **NSL Dataset** | Build the first structured Nigerian Sign Language training corpus | **Not started.** No protocol, partner, ethics approval, or funding. |
| 3 | **Hospital Pilot** | Deploy in 3 Nigerian hospitals — measure outcomes, iterate | **Not started.** Zero hospitals identified in writing. |
| 4 | **National Rollout** | Partner with Ministry of Health for nationwide deployment | **Not started.** No contact evidenced. |
| 5 | **Africa Expansion** | Kenya, Ghana, South Africa — localise per region | Not started. Aspirational. |
| 6 | **Global Platform** | Multilingual accessibility infrastructure | Not started. Aspirational. |

**No dates, durations, or dependencies are attached to any stage.** The roadmap is ordinal, not scheduled. That is acceptable at pre-seed but means there is no way to tell whether the venture is ahead, behind, or on plan.

## 11.2 The validation plan (S5 — Digital Presence Worksheet, 19 Oct 2026)

This is the most concrete execution document in the corpus. It sets five measurable targets:

1. Receive at least **15** meaningful responses or direct enquiries from the target audience.
2. Conduct at least **10** in-depth discovery interviews with Deaf sign-language users and healthcare workers.
3. Identify at least **three** hospitals willing to discuss structured MVP testing or a potential pilot.
4. Obtain specific feedback identifying recurring communication problems and the situations where Unmute would be useful.
5. Secure a group of interested participants willing to test the prototype.

**Status of each: no completion recorded.** These are targets set one day before this audit.

The document also states two assumptions to test, quoted verbatim because they are unusually well-framed:
- *"Deaf patients and healthcare workers experience communication barriers frequently enough to want and use a tool like Unmute during routine healthcare interactions."*
- *"Unmute can accurately handle a defined set of Nigerian Sign Language interactions in a real healthcare environment."*
- And: *"whether hospitals or other healthcare institutions would be willing to pay for a reliable solution after seeing evidence of its usefulness."*

## 11.3 The market-fit assumption (S6 — 30 Sep 2026)

> "Sign: users/institutions will trust and adopt AI-powered Nigerian Sign Language communication at the accuracy required for real-world use, and a defined buyer will pay."

This is correctly identified as the biggest unvalidated assumption. It is also, notably, **two assumptions fused into one** — trust/accuracy and willingness-to-pay are separable and should be tested separately.

## 11.4 Completed vs planned — strict accounting

**Completed (evidenced):**
- ASL dataset acquired and loaded (S13)
- ASLIN interview conducted (S15)
- Market research module completed (S6)
- Pitch deck, video, canvas set, and digital-presence plan produced (S1, S16, S3, S4, S5)
- Two program applications/submissions made (Founders Lab, Hackaholics)

**Planned but not done (all with no recorded start):**
- Working bidirectional prototype
- Accuracy benchmark on any sign language
- NSL corpus
- Deaf-user testing
- Clinician testing
- Hospital identification
- Pilot
- Pricing
- Financial model
- Fundraise

## 11.5 Dependencies and blockers

| Blocker | Blocks | Notes |
|---|---|---|
| No NSL data | NSL product, hospital pilot, any Nigerian clinical claim | Cannot be solved by engineering alone; requires community partnership and funding |
| No clinical partner | Pilot, workflow design, credibility | Cold outreach to hospitals without a prototype is unlikely to convert |
| No technical co-founder | Build velocity | Solo + two other roles |
| No funding | Dataset collection (paid contributors), compute, pilot | Founders Lab Base Grant is the nearest identified route |
| No accuracy benchmark | Any claim of "reliable" | Needs a test set and a target (e.g. word error rate threshold) |
| Unresolved privacy architecture | Clinical deployment, data protection compliance | Nigeria Data Protection Act obligations for health data |

---

# 12. Brand, messaging, and digital presence

## 12.1 Brand assets

| Element | Current version | Source |
|---|---|---|
| **Name** | Unmute | All |
| **Tagline** | "Every Voice Deserves to Be Heard." | S1, S8 |
| **Category label** | "AI-powered healthcare communication platform" | S1 |
| **Boilerplate** | "An AI-powered healthcare communication platform that enables real-time conversation between Deaf patients and healthcare professionals — using sign language recognition, speech recognition, and AI-generated sign language." | S1 |
| **Founder line** | "I'm not building another AI product. I'm building the future of accessible healthcare — starting in Nigeria and scaling to the world." | S1 |
| **Closing line** | "Healthcare should never depend on whether your voice can be heard." | S1 |
| **Email** | `contact@liveunmute.com` (current); `prince@unmute.ai` (superseded) | S1; S8 |
| **Website** | `www.liveunmute.com` (current); `www.unmute.ai` (superseded) | S1; S8 |
| **Venture social** | `@LiveUnmute` (LinkedIn), `@LiveUnmuted` (Instagram) | S5 |
| **Founder social** | `@PrinceOnPurpose` (LinkedIn, Instagram) | S5 |
| **WhatsApp** | WhatsApp Business channel planned | S5, S3 |

## 12.2 Digital presence plan (S5, 19 Oct 2026)

- **Channels:** WhatsApp Business, LinkedIn, Instagram.
- **Split:** founder-led (`@PrinceOnPurpose`) for narrative and build-in-public; venture (`@LiveUnmute` / `@LiveUnmuted`) for the product.
- **Cadence:** "at least one meaningful update each week."
- **Content:** what is being built, what is learned from users, technical challenges, prototype demonstrations, changes made from feedback.
- **Discipline stated:** "be transparent about what works, what remains experimental and what still needs validation"; "will not publish identifiable patient information or confidential interview details."
- **Consistency requirement:** identical information across landing page, LinkedIn, Instagram, and WhatsApp Business; accessible visual content, clear language, captioned videos.
- **Conversion:** simple route to contact, request a demo, or join a testing list; track enquiries and feedback.

## 12.3 Messaging assessment

**Strongest asset:** the tagline. "Every Voice Deserves to Be Heard" is thematically precise, emotionally legible, and works for both Deaf communication and the broader access mission.

**Weakest asset:** the "0 Interpreters Needed" impact slide (S1). It is (a) unsupported, (b) contradicted by the venture's own research document, (c) professionally offensive to the interpreter community Unmute says it wants as a channel partner, and (d) likely to be the single most-quoted line by any Deaf reviewer. **Recommend deleting or reframing it before the deck is shown again.**

**Second weakness:** the deck's opening uses a named deceased individual as its hook. Even if the case is real and permission exists, using a death as a pitch device without documented consent is a reputational and ethical exposure. It should be verified and, ideally, replaced with a consented, living participant's story or an anonymised composite clearly labelled as such.

---

# 13. Decisions, contradictions, and unresolved questions

This is the most important section of the report. Each conflict is stated without resolving it, with a recommendation for which source to treat as authoritative.

## C1 — One product or two? (Unresolved)

- **S6 (30 Sep 2026):** Unmute = **Unmute Sign + Unmute Expression**, sharing "one company thesis."
- **S3, S4, S5, S1 (15–19 Oct 2026):** Unmute = **healthcare sign-language product only.** No mention of Expression.

**Conflict:** Expression disappears entirely in the three most recent documents.
**Recommendation:** Treat **S3/S4 (18–19 Oct)** as authoritative for current scope. But record an explicit decision: was Expression *dropped*, *parked*, or *renamed*? Investors who saw the September document will ask. The absence of any note is itself a governance gap.

## C2 — Replace or complement interpreters? (Serious)

- **S6 (30 Sep):** "Unmute should complement rather than claim to replace interpreters, especially in high-stakes cases."
- **S1 (15 Oct):** "**0 — Interpreters Needed.** AI replaces the need for scarce, expensive human interpreters."

**Conflict:** Direct contradiction, 15 days apart, on the venture's core value claim.
**Recommendation:** **S6 is authoritative** — it is the more considered statement, it is consistent with the actual product (a tool that will fail on complex or unrepresented vocabulary), and it is the position that preserves the ASLIN relationship. The deck line should be corrected immediately.

## C3 — Does Unmute support Nigerian Sign Language today? (Serious)

- **S1:** "Multilingual — Supports Nigerian Sign Language, ASL, and more."
- **S1 (same document, roadmap):** "Nigeria has almost no structured Nigerian Sign Language dataset — Unmute will build the definitive corpus"; NSL dataset is roadmap stage **2**, after the ASL MVP.
- **S6:** "Nigerian Sign Language AI remains an emerging field."

**Conflict:** The capability slide claims a shipped property; the roadmap treats it as future work requiring data that does not exist.
**Recommendation:** Rewrite as "Designed for Nigerian Sign Language; ASL proof-of-concept first, NSL corpus in development." The current phrasing is the kind of claim that, if repeated to a technical reviewer, ends the meeting.

## C4 — Who is the customer? (Unresolved)

- **S3:** Revenue only from institutions (hospital subscriptions, licensing, implementation fees, government contracts).
- **S6:** "Seven people have paid for Unmute and are waiting to use it."
- **S5:** Digital presence aimed at individual Deaf users and healthcare workers ("join a testing list").

**Conflict:** A pure B2B model with unexplained consumer payments and consumer-facing acquisition.
**Recommendation:** Decide explicitly whether there is a bottom-up consumer wedge feeding institutional sales, or whether the seven payments were deposits on a future product. Document the answer; it changes the go-to-market entirely.

## C5 — Timeline inconsistency in the founder's account

- **S11 (CV):** Unmute developed during **Apr–Aug 2025** at RAIN.
- **S1 (deck):** Presented as a response to a specific patient death, with no date or institutional context.

**Conflict:** Not a factual contradiction, but the deck implies a continuous personal mission, while the CV places the build inside a five-month internship that ended ~14 months before the current pitch.
**Recommendation:** Reconcile in the narrative. "I built the first version during a research internship in 2025, and have been developing it since" is both true and stronger than an ambiguous origin story.

## C6 — Which domain and email are real?

- **S8/S9 (Jul 2026):** `unmute.ai`, `prince@unmute.ai`.
- **S1 (Oct 2026):** `liveunmute.com`, `contact@liveunmute.com`.

**Conflict:** Two different brand identities in circulation. Applications, decks, and social bios may carry either.
**Recommendation:** **S1 is authoritative.** Confirm `liveunmute.com` is registered, resolving, and has a working contact address. Retire `unmute.ai` from all collateral.

## C7 — Programme attribution risk

- **iHatch Cohort 5** materials in Drive are for **Persat Finance**, not Unmute (S19).
- **Hackaholics** materials are for Unmute (S17).

**Risk:** Because both ventures live in the same Drive and the same founder's portfolio, there is a real possibility of cross-attribution in applications or conversations.
**Recommendation:** Maintain a hard separation. Never describe iHatch as a Unmute program.

## C8 — The "seven payments" claim is unverifiable as recorded

No amount, date, channel, or consideration is documented (S6). It is used in a submitted accelerator worksheet as a demand signal.
**Recommendation:** Reconstruct the record from payment provider history and document it in a single evidence file. If the payments were not for the product but for something else (e.g. a deposit on a service), say so.

## C9 — Unmade decisions (not contradictions, but absences)

1. Pricing — no figure anywhere.
2. Buyer within the hospital — clinical director? IT? administration? CSR?
3. Whether the product is a shared tablet, a patient's own phone, or a kiosk.
4. Whether inference is on-device or cloud (this determines whether "offline" and "private by design" are achievable).
5. Whether the avatar is 3D, 2D, or video-based.
6. Which clinical scenarios are in scope for v1 (triage? consultation? admissions? pharmacy?).
7. Whether the NSL corpus will be owned, licensed, or open.
8. Legal entity and jurisdiction for Unmute (Persat Labs Limited exists; no Unmute entity is documented).

---

# 14. Risks and strategic gaps

## 14.1 Risks explicitly acknowledged in the files

| Risk | Where stated |
|---|---|
| Recognition/translation accuracy insufficient for real clinical use | S6 ("users/institutions will trust and adopt … at the accuracy required") |
| Trust and adoption by Deaf users | S6, S5 |
| A defined institutional buyer may not pay | S6, S5 |
| NSL data scarcity | S1, S6 |
| Dependence on interpreters being unavailable — but interpreters remain necessary for complex cases | S6 |
| Expression may not be a repeatable product | S6 |

## 14.2 Risks I am adding from analysis

**R1 — Technical feasibility of the stated spec (High).** <2s latency, offline, bidirectional, on mobile, with an avatar, is a hard combination. The avatar alone (realistic continuous signing synthesis) is an open research problem; most commercial systems use pre-recorded video clips or human interpreters, not generative avatars. **The deck's "AI-generated sign language" is the least credible element of the product description and is presented as if solved.**

**R2 — ASL→NSL transfer (High).** Validating on ASL says nothing about NSL. The roadmap's stage 1→2 sequencing creates a false sense of progress: a working ASL demo will feel like 80% of the product and will in fact be ~0% of the Nigerian product.

**R3 — Dataset consent and ownership (High, legal/ethical).** Building a sign-language corpus from Deaf contributors requires informed consent, compensation norms, and clarity on commercial reuse. None of this is addressed. Sign language is embodied and identity-linked; a corpus scraped or collected without community governance would be a serious harm and a serious liability.

**R4 — Health data protection (High).** Video of a patient signing in a clinical encounter, plus audio of a clinician, is sensitive health data under Nigeria's Data Protection Act. There is no privacy impact assessment, no retention policy, no data-flow diagram, and no processor agreements. The "data never leaves the device" claim, if untrue, converts a marketing line into a compliance problem.

**R5 — Clinical safety and liability (High).** If a mistranslation contributes to a clinical error, who is liable? There is no disclaimer strategy, no "not for emergency use" scoping, no human-in-the-loop design for high-stakes moments, and no clinical governance.

**R6 — Community legitimacy (High).** A hearing founder, no Deaf advisor, a pitch built on a deceased Deaf woman's story, and a slide claiming AI makes interpreters unnecessary. Each of these individually is survivable; together they read as extraction rather than partnership. **This is the risk most likely to end the venture early, and it is the cheapest to fix.**

**R7 — Institutional procurement reality (High).** Nigerian public hospitals rarely have discretionary software budgets or fast procurement. The stated buyer may not exist in the form assumed. The realistic first buyer may be a private hospital chain, an NGO, a development-funded programme, or a health insurer — none of which is analysed.

**R8 — Founder bandwidth and single point of failure (High).** Three concurrent roles, no team, no funding. If the founder is unavailable for a month, the venture stops.

**R9 — Evidence fragility (Medium-High).** The venture's public claims rest on five citations, four of which are second-hand with no link in Drive. One diligent reviewer asking "can you send me that study?" exposes the whole evidence base.

**R10 — Brand/asset control (Medium).** Two domains, two social handles, no documented entity. If `unmute.ai` is not owned, previous collateral points at someone else's property.

---

# 15. Recommended next actions

Ordered by urgency and dependency. Each action states why, the expected outcome, and the document it derives from.

## Immediate (next 7 days) — protect credibility

| # | Action | Why | Outcome | Source |
|---|---|---|---|---|
| 1 | **Remove or rewrite "0 Interpreters Needed."** Replace with "reduces routine dependence on interpreters; complex and high-stakes cases still require human interpreters." | Directly contradicts the venture's own research and will alienate the interpreter network it depends on | Deck becomes internally consistent and defensible | S1 vs S6 |
| 2 | **Correct the NSL capability claim** to "designed for NSL; ASL PoC first." | Current claim is contradicted by the same deck's roadmap | Technical credibility preserved | S1 |
| 3 | **Verify or replace the Zulaihatu story.** Locate the source; obtain family permission if real; otherwise replace with a consented participant story or a clearly-labelled composite | Using a real death without provenance or consent is an ethical and reputational hazard | Deck opens with unimpeachable evidence | S1, S8 |
| 4 | **Source all five external statistics** (GDRI, IJCAI, ICIR, 70M, workforce) with title, year, and URL in a single citations file | Every claim currently fails the "send me the study" test | A citable evidence appendix | S1, S6 |
| 5 | **Reconstruct the "seven payments" record** — amount, date, channel, consideration, refund policy | It is the only traction metric and it is currently unauditable | A one-page evidence file, or a corrected claim | S6 |
| 6 | **Confirm domain and email ownership.** Decide `liveunmute.com` vs `unmute.ai`; update all collateral | Two identities are in circulation | One canonical contact | S1 vs S8 |

## Before the MVP can be demonstrated (next 4–8 weeks)

| # | Action | Why | Outcome | Source |
|---|---|---|---|---|
| 7 | **Define MVP scope as one clinical scenario** (e.g. triage pain/body-location vocabulary, 50–100 signs), not "sign language translation" | Unbounded scope cannot be built or evaluated | A testable spec | S1 stage 1, S3 |
| 8 | **Build and publish a baseline accuracy benchmark** on a held-out ASL set (word/sign error rate, latency on a named device) | Replaces unverifiable claims with a number | First honest technical metric | S1 |
| 9 | **Record a 60-second screen demo** of the working pipeline and host it at a stable URL | No demo exists anywhere in Drive; every application asks for one | A shareable proof artefact | — |
| 10 | **Write a one-page technical architecture note**: on-device vs cloud, model, ASR vendor, avatar method, latency budget | Determines whether "offline" and "private" are achievable at all | Removes the largest unknown from diligence | — |
| 11 | **Recruit a Deaf co-designer or paid advisor** and name them publicly | Legitimacy, usability, and consent for corpus work | Credibility with community and funders | S3 (lists community access as an asset it does not have) |
| 12 | **Recruit a clinical advisor** (one practising clinician) | Workflow realism and hospital credibility | Access and validation | — |

## Before a real-world pilot

| # | Action | Why | Outcome | Source |
|---|---|---|---|---|
| 13 | **Complete the 10 discovery interviews** and publish a summary with themes and counts | S5 sets this target; nothing is recorded | The primary evidence the deck currently lacks | S5 |
| 14 | **Write the NSL data collection protocol**: consent, compensation, annotation, regional variation, storage, ownership | Prerequisite to any corpus work; the highest legal/ethical exposure | A fundable, defensible protocol | S3, S1 |
| 15 | **Complete a data protection impact assessment** for clinical video/audio | Health data; NDPA obligations; "data never leaves device" claim | Compliance readiness | S1 |
| 16 | **Define clinical safety boundaries** — what the tool must never be used for, and the human escalation path | Liability and patient safety | A safety case a hospital can accept | — |
| 17 | **Convert "three hospitals" from a target into named prospects** with a named contact and a stated next step | S5 goal 3; currently zero | A real pipeline | S5 |

## Before commercial deployment

| # | Action | Why | Outcome | Source |
|---|---|---|---|---|
| 18 | **Choose one revenue model** (subscription *or* per-encounter *or* licence) and price it | Four listed streams imply four sales motions a solo founder cannot run | A costed offer | S3 |
| 19 | **Build a bottom-up market model** — number of target hospitals × plausible contract value | No TAM/SAM/SOM exists | Fundable sizing | absence in all files |
| 20 | **Identify the actual budget holder** inside a hospital and the procurement route | The assumed buyer may not exist | A viable sales path | S6 |
| 21 | **Resolve the entity question** — is Unmute a Persat Labs product or its own company? | Affects IP ownership, grants, and investment | Clean cap table and IP chain | S11, S20 |

## Questions to resolve before fundraising or public claims

1. What is the measured accuracy of the system, on which sign language, on what test set?
2. Is there a working demo, and can a stranger use it?
3. Who is the buyer, and has anyone with budget authority said they would pay?
4. What exactly did the seven payers pay for?
5. Who owns the NSL corpus, and who consented to it?
6. Is Unmute a separate legal entity from Persat Labs?
7. Is there a Deaf person with decision-making authority in the venture?
8. What happens clinically when the system is wrong?

**Until questions 1, 2, 3, and 7 have evidenced answers, Unmute should describe itself as "pre-prototype, in customer discovery" — not as a platform with pilots, multilingual support, or sub-two-second performance.**
