# F — Recommended Authoritative Knowledge Base

A structure for maintaining the definitive Unmute record going forward.

**No existing file has been moved, renamed, edited, or deleted.** This is a proposal only.

---

## 1. Proposed folder structure

```
Unmute — Knowledge Base/
│
├── 00_READ_ME/
│   ├── KB_Charter.md                  # what this KB is, who owns it, update rules
│   ├── Glossary.md                    # Unmute, Unmute Sign, NSL, ASL, ASLIN, GDRI…
│   └── Evidence_Standards.md          # the labelling scheme: fact / claim / plan / assumption
│
├── 01_STRATEGY/                       # authoritative, always current
│   ├── Vision_and_Mission.md
│   ├── One_Pager.md                   # canonical 1-page description — the single source of truth
│   ├── Theory_of_Change.md
│   └── Decision_Log.md                # dated decisions + rationale + what was rejected
│
├── 02_PRODUCT/
│   ├── Product_Spec_v1.md             # MVP scope, one clinical scenario, sign inventory
│   ├── Technical_Architecture.md      # on-device vs cloud, models, vendors, latency budget
│   ├── Privacy_and_Data_Flow.md
│   ├── Clinical_Safety_Boundaries.md
│   ├── Roadmap.md                     # with dates, owners, dependencies
│   └── Designs/                       # wireframes, avatar assets, user flows
│
├── 03_DATA_AND_AI/
│   ├── Dataset_Register.csv           # every dataset: name, source, licence, size, language, status
│   ├── How2Sign/                      # licence record + manifest
│   ├── NSL_Corpus/
│   │   ├── Collection_Protocol.md
│   │   ├── Consent_Framework.md
│   │   └── Annotation_Guidelines.md
│   ├── Benchmarks/                    # accuracy results, dated, with test-set description
│   └── Research_Notes/                # literature reviews, IJCAI paper, GDRI report
│
├── 04_EVIDENCE/
│   ├── Citations_Master.md            # every external statistic with title, author, year, URL
│   ├── Interview_Log.csv              # date, participant type, consent status, themes, link
│   ├── Transcripts/                   # including the ASLIN interview
│   └── Survey_Results/
│
├── 05_MARKET/
│   ├── Market_Sizing.xlsx             # bottom-up: facilities × contract value
│   ├── Competitive_Landscape.md       # named companies, not just categories
│   ├── Buyer_Map.md                   # who signs, who budgets, who blocks
│   └── Pricing.md
│
├── 06_COMMERCIAL/
│   ├── Business_Model.md              # ONE chosen model, not four
│   ├── Financial_Model.xlsx
│   ├── Unit_Economics.md
│   └── Pipeline.csv                   # hospital prospects, stage, next action
│
├── 07_TRACTION/
│   ├── Payments_Evidence.md           # the 7 payments, reconstructed
│   ├── Pilots/                        # agreements, MOUs, LOIs
│   └── Metrics_Dashboard.md
│
├── 08_PROGRAMS/
│   ├── Applications_Register.csv      # programme, date, status, claims used, outcome
│   ├── Hackaholics_7.0/
│   ├── iDICE_Founders_Lab_Cohort_2/
│   └── Grants/                        # Base Grant and others
│
├── 09_BRAND/
│   ├── Messaging_Guide.md             # approved language; banned claims
│   ├── Boilerplate.md
│   ├── Visual_Identity/
│   └── Digital_Presence_Plan.md
│
├── 10_TEAM/
│   ├── Founder_Profile.md
│   ├── Advisors.md                    # with consent status
│   ├── Roles_and_Gaps.md
│   └── Cap_Table.xlsx
│
├── 11_LEGAL/
│   ├── Entity_Documents/
│   ├── IP_Assignment/
│   ├── Privacy_Policy/
│   └── Compliance/                    # NDPA, health data
│
├── 12_PITCH/
│   ├── CURRENT/                       # exactly one live deck, one live one-pager
│   ├── Archive/                       # dated versions, never deleted
│   └── Claim_Substantiation.md        # every number in the deck → its source
│
└── 99_ARCHIVE/                        # superseded material, kept for history
```

---

## 2. What to do with existing documents

### Promote to authoritative (link into the KB, do not duplicate)

| Document | Destination | Action |
|---|---|---|
| `Unmute-Pitch-Deck.pdf` (S1) | `12_PITCH/CURRENT/` | Keep as the single live deck; add to Drive as a shortcut inside the KB |
| `Unmute -Lean Canvas.pdf` (S3) | `06_COMMERCIAL/` | Canonical business model input |
| `Unmute_Value_Proposition_Canvas.pdf` (S4) | `02_PRODUCT/` | Canonical positioning input |
| `Unmute_Digital_Presence_Worksheet.pdf` (S5) | `09_BRAND/` | Convert its 5 targets into the Metrics Dashboard |
| `Unmute_Market_Research_Module_2.pdf` (S6) | `05_MARKET/` | **Highest-value analytical document.** Extract its citations into `Citations_Master.md` |
| `prince's cv` (S11) | `10_TEAM/Founder_Profile.md` | Source for the founder section |
| `how2sign_realigned_train` (S13) | `03_DATA_AND_AI/How2Sign/` | Add licence record alongside it |

### Archive (keep, clearly labelled superseded)

| Document | Reason |
|---|---|
| `Unmute_Pitch_Deck.pdf` (S2, in Trash) | Textually identical to S1; restore to `12_PITCH/Archive/` or leave trashed — either is fine, but do not let it be mistaken for current |
| `Every-Voice-Deserves-to-Be-Heard` ×3 (S8, S9, S10) | July narrative. **Historically important** — it documents the domain change and the original framing. Keep one Doc + one PDF in `12_PITCH/Archive/`, discard the duplicate Doc. |
| `Unmute_Market_Reasearch.pdf` (S7) | Blank template. Keep only as a record that the module was assigned; otherwise discard. |
| `Module_1_Goal_Plan_Worksheet` (S18) | Blank. Either complete it or discard. |

### Consolidate

| Fragmented topic | Consolidate into |
|---|---|
| Product description across S1, S3, S4 | **One** `01_STRATEGY/One_Pager.md` — all other documents point to it |
| Statistics scattered across S1 and S6 | **One** `04_EVIDENCE/Citations_Master.md` |
| Roadmap in S1 + targets in S5 | **One** `02_PRODUCT/Roadmap.md` with dates |
| Product scope (Sign vs Expression) | **One** `01_STRATEGY/Decision_Log.md` entry |

### Separate out — do not file under Unmute

| Document | Belongs to |
|---|---|
| `Persat_Finance_Technical_Architecture` | Persat Labs — separate KB |
| `Personal_Founder_Operating_Manual` | Persat Labs / iHatch |
| `STOAN.pdf` | STOAN — separate venture |
| `proxy_pitch_deck.pdf`, `Proxy_Deck.pdf`, proxy docs | Proxy — separate venture |
| `When AI Becomes a Confidant` | Founder research — `10_TEAM/` or a personal research folder |
| iHatch Cohort 5 materials | Persat Labs programmes |

**Why this matters:** the current Drive mixes four ventures in one root. Any reviewer, accelerator, or investor browsing it will see Persat's sophisticated technical architecture next to Unmute's canvases and may reasonably (but wrongly) attribute one to the other. Separation is a credibility safeguard, not mere tidiness.

---

## 3. Maintenance rules to adopt

1. **One canonical description.** `01_STRATEGY/One_Pager.md` is the only place the venture is described in full. Every deck, application, and bio links to or copies from it.
2. **Every number has a source.** No figure enters a deck unless it appears in `Citations_Master.md` with a title, year, and URL.
3. **Dated decisions.** Any reversal (Expression dropped; NSL claim narrowed; domain changed) gets a line in `Decision_Log.md` with the reason. This prevents the current situation, where a reader cannot tell whether Expression was abandoned or forgotten.
4. **Version discipline.** Decks are named `Unmute_Deck_YYYY-MM-DD.pdf`. No file is ever named "final" or left as `(1)`.
5. **Status vocabulary.** Every programme entry uses one of: *identified → contacted → applied → shortlisted → pitched → selected → funded*. Never "engaged" or "partnered" without a document.
6. **Consent register.** Any named individual — patient, interpreter, advisor, hospital contact — has a row in `04_EVIDENCE/Interview_Log.csv` recording consent status and permitted use.
7. **Quarterly archive sweep.** Superseded material moves to `99_ARCHIVE/`, never deleted; history is evidence.

---

## 4. The three documents that would most improve this KB immediately

If nothing else is done, create these three:

1. **`01_STRATEGY/One_Pager.md`** — one page: what Unmute is, who it is for, what exists today, what does not, what the next milestone is. Forces resolution of the Sign/Expression and replace/complement contradictions.
2. **`04_EVIDENCE/Citations_Master.md`** — every statistic with its real source. Converts five second-hand claims into either citable evidence or known gaps.
3. **`02_PRODUCT/Technical_Architecture.md`** — even at one page: device, model, inference location, avatar method, latency budget. Makes the technical claims falsifiable and therefore fundable.
