# D — Master Facts and Metrics Sheet

Verification key:
- **V1 — Corroborated:** stated in a document and consistent with file metadata or a second source
- **V2 — Single-source:** stated once, no contradiction, not independently verified
- **V3 — Unverified claim:** asserted without support
- **V4 — Contradicted:** conflicts with another file in the corpus
- **V5 — Derived:** my calculation or inference, not stated in any file

---

## 1. Venture identity

| Fact | Value | Source | Date | Status | Conflicting evidence |
|---|---|---|---|---|---|
| Name | Unmute | S1, S3, S4, S6 | Oct 2026 | V1 | — |
| Tagline | "Every Voice Deserves to Be Heard." | S1, S8 | Jul–Oct 2026 | V1 | — |
| Category | AI-powered sign-language communication platform for healthcare | S1, S4 | Oct 2026 | V1 | S6 describes a broader two-product company |
| Geography | Nigeria (Enugu base; national ambition) | S1, S11 | 2026 | V1 | — |
| Current domain | `liveunmute.com` | S1 | 15 Oct 2026 | V2 | S8 used `unmute.ai` |
| Current email | `contact@liveunmute.com` | S1 | 15 Oct 2026 | V2 | S8 used `prince@unmute.ai` |
| Social handles | `@LiveUnmute`, `@LiveUnmuted`, `@PrinceOnPurpose` | S5 | 19 Oct 2026 | V2 | — |
| Legal entity | **Not documented** | — | — | UNKNOWN | Persat Labs Limited exists but is a different venture (S20) |
| Founding date | **Not documented** | — | — | UNKNOWN | Technical origin traceable to Apr 2025 (S11) |

## 2. Founder

| Fact | Value | Source | Status | Notes |
|---|---|---|---|---|
| Founder | Prince Nzubechukwu Michael | S11 | V1 | Sole author of every Unmute file |
| Location | Enugu, Nigeria | S11 | V1 | — |
| RAIN internship | Apr 2025 – Aug 2025, AI Research Intern, Ibadan | S11 | V2 | Where Unmute was built |
| Persat Labs | Co-founder & CTO, Jan 2026 – current | S11 | V2 | Concurrent venture |
| The BeaconSmith | Product & Research Lead, Jan 2026 – current | S11 | V2 | Concurrent role |
| Listed skills | AI research, prompt engineering, LLM architecture, NLP, system design, cloud architecture, product discovery, product roadmap | S11 | V2 (self-reported) | — |
| Publications | *When AI Becomes a Confidant* (conceptual paper, AI safety) | S23 | V1 | Not peer-reviewed in evidence |
| Team size | 1 | All docs | V1 | No team slide; single-authored files |

## 3. Problem evidence

| Metric | Value | Source | Date | Status | Caveat |
|---|---|---|---|---|---|
| Deaf Nigerians with full healthcare communication access | **8%** | S6 citing GDRI 2024 Nigeria pilot | 2024 (study) / 30 Sep 2026 (cited) | V2 | Report not in Drive; sample & method unknown |
| Deaf Nigerians able to communicate with doctors | **7%** | S6 citing GDRI 2024 | same | V2 | Same |
| Able to afford required healthcare | **38%** | S6 citing GDRI 2024 | same | V2 | **Financial** access, not communication — should not be merged with the two above |
| Existing NSL dataset size | **8,000 images → 5,000 curated frames, 137 signs/words** | S6 citing "IJCAI research" | 30 Sep 2026 | V2 | No paper title, author, or link. **High-priority verification.** |
| ASLIN interview findings | Reliance on gestures/local/"pidgin" signs; need for native NSL resources | S6; audio S15 | 15 Sep 2026 | V2 | Findings reported second-hand; audio not transcribed |
| Private interpreter payments by Deaf patients | Documented by ICIR | S6 citing ICIR | 30 Sep 2026 | V2 | No article title or link |
| Deaf people globally lacking accessible healthcare | **70,000,000+** | S1 | 15 Oct 2026 | **V3** | No source. Conflates Deaf population with healthcare-access deficit |
| Nigerian healthcare workforce | "Hundreds of thousands" | S1 | 15 Oct 2026 | V3 | No figure cited |
| Zulaihatu Abdullahi case | 19-year-old Deaf woman died after communication failure in a Nigerian hospital | S1, S2, S8, S9 | Jul–Oct 2026 | **V3** | **No provenance. Four appearances are copies of one text, not independent corroboration** |
| Documented preventable deaths "across multiple Nigerian states" | Unquantified | S1 | 15 Oct 2026 | V3 | No cases cited |

## 4. Product and technical

| Claim | Value | Source | Status | Assessment |
|---|---|---|---|---|
| Translation directions | Sign→text/speech; speech/text→sign | S1, S3, S4 | V1 (as design) | Bidirectional design is consistent across all files |
| Latency | Under 2 seconds | S1 | **V3** | No benchmark, device, or test |
| Offline capability | Works without connectivity | S1 | **V3** | No architecture described |
| Privacy | "Patient data never leaves the device without consent" | S1 | **V3 / V4-risk** | No privacy architecture; incompatible with cloud inference |
| Languages supported | "Nigerian Sign Language, ASL, and more" | S1 | **V4** | Contradicted by S1's own roadmap: NSL corpus does not exist |
| Interpreters required | "0 — AI replaces the need for scarce, expensive human interpreters" | S1 | **V4** | Contradicted by S6: "should complement rather than claim to replace interpreters" |
| Dataset in use | How2Sign (ASL), sentence-aligned RGB video | S13, S14 | V1 | Verified schema; open-domain, non-medical vocabulary |
| NSL dataset | Planned, "first structured NSL corpus" | S1 | PROPOSED | No protocol, partner, funding, or ethics approval |
| 3D/avatar | "Designed a 3D sign language representation system using digital modeling techniques" | S11 | V2 | Design only; no asset in Drive |
| Repository | None for Unmute | — | UNKNOWN | Session repo `unmute-sign` contains only README.md |
| Named APIs / vendors | None | — | UNKNOWN | No ASR, LLM, cloud, or avatar provider named anywhere |
| Blender | Not mentioned in any file | — | NOT FOUND | — |

## 5. Commercial

| Metric | Value | Source | Status | Notes |
|---|---|---|---|---|
| Payments received | **7** | S6 | V2 | Amount, date, channel, consideration **all unknown** |
| Revenue recognised | Unknown | — | UNKNOWN | — |
| Price point | None set | — | NOT FOUND | — |
| Revenue streams | 4 (hospital subscription, institutional licensing, implementation/training fees, government contracts) | S3 | V1 (as plan) | No figures |
| Cost lines | 4 (AI/software dev, data collection, cloud, pilot & acquisition) | S3 | V1 (as plan) | No figures |
| TAM / SAM / SOM | None | — | NOT FOUND | S6 explicitly declines to convert stats into market size |
| Funding raised | None documented | — | UNKNOWN | — |
| Grant applications | Base Grant (iDICE Founders Lab) — eligible, session attended | S25 | V2 | No application or award recorded |
| Pilot contracts | 0 | — | V1 (zero confirmed) | — |
| Hospital prospects named | 0 | S5 | V1 (zero) | Target of 3 set 19 Oct 2026 |

## 6. Validation targets (all forward-looking, set 19 Oct 2026)

| Target | Value | Source | Status |
|---|---|---|---|
| Meaningful responses/enquiries | ≥ 15 | S5 | NOT STARTED |
| Discovery interviews | ≥ 10 | S5 | NOT STARTED |
| Hospitals willing to discuss pilot | ≥ 3 | S5 | NOT STARTED |
| Prototype testers recruited | "A group" (unspecified) | S5 | NOT STARTED |
| Social posting cadence | ≥ 1 meaningful update/week | S5 | NOT STARTED |

## 7. Roadmap (S1) — status as at 20 Oct 2026

| # | Stage | Status | Evidence of progress |
|---|---|---|---|
| 1 | ASL proof of concept — recognition engine validated | IN PROGRESS / UNEVIDENCED | Dataset manifest loaded; no model or metric |
| 2 | NSL dataset — first structured corpus | NOT STARTED | — |
| 3 | Hospital pilot — 3 Nigerian hospitals | NOT STARTED | — |
| 4 | National rollout with Ministry of Health | NOT STARTED | — |
| 5 | Africa expansion (Kenya, Ghana, South Africa) | NOT STARTED | — |
| 6 | Global multilingual platform | NOT STARTED | — |
| — | Dates for any stage | **NONE SPECIFIED** | — |

## 8. Programmes

| Programme | Role | Date | Status | Award? |
|---|---|---|---|---|
| Hackaholics 7.0 (Wema Bank), Enugu | Entrant | 14 Oct 2026 | Entered / pitched | None documented |
| iDICE Startup Bridge — Founders Lab, Cohort 2 | Participant | Sep 2026 – | Active; Modules 1 & 2 submitted | None documented |
| iDICE Base Grant | Eligible applicant | 16 Oct 2026 info session | Informed; not applied | None documented |
| iHatch Cohort 5 (ONDI/NITDA/JICA) | **NOT Unmute — Persat Finance** | 2026 | Do not claim | — |

## 9. Discrepancy log

| # | Item | Version A | Version B | Severity | Recommended authority |
|---|---|---|---|---|---|
| 1 | Product scope | Sign + Expression (S6, 30 Sep) | Sign only (S1/S3/S4, 15–19 Oct) | Medium | S3/S4 — newer, and Expression has no build evidence |
| 2 | Interpreter role | "Complement, not replace" (S6) | "0 interpreters needed" (S1) | **High** | S6 — more considered, matches actual capability |
| 3 | NSL support | "Supports NSL, ASL, and more" (S1) | "Almost no NSL dataset; will build it" (S1 roadmap, S6) | **High** | S1 roadmap / S6 |
| 4 | Domain & email | `unmute.ai` (S8, Jul) | `liveunmute.com` (S1, Oct) | Medium | S1 — newer |
| 5 | Buyer | Institutional only (S3) | 7 individual payers (S6) | Medium | Unresolved — needs a decision |
| 6 | Origin framing | RAIN internship build (S11) | Patient-death inspiration (S1) | Low | Both are true; narrative should reconcile them |
| 7 | Deck duplicates | S1 (live) | S2 (trashed, identical) | Low | S1 is authoritative; S2 is noise |
