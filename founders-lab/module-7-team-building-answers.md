# Module 7: Team Building & Performance
**Participant Name:** _________________
**Venture Name:** Unmute
**Cohort:** _________________
**Date:** 22 October 2026

---

## Read this first — three assumptions to check

1. **The $199/month Team Plan figure** is your current pricing hypothesis, not a signed contract. If it changes, change the revenue target in 01.2 to match.
2. **"Seven payments to date"** comes from the internal audit. If any of those were recurring institutional revenue, the first readiness answer changes from *No* to *In Progress*.
3. **I have assumed the blocking gap is engineering, not sales.** You are pre-prototype, so the product cannot yet be sold at the scale the pitch describes. If hospital conversations are already queuing, swap Priority 1 and Priority 3 in section 02.3.

---

## 01 Hiring Readiness Check

### 1. Are you currently ready to hire?

| Question | Yes / No / In Progress | Notes |
|---|---|---|
| Do you have consistent enough revenue or funding to pay a salary reliably every month? | **No** | Seven payments to date, no recurring institutional revenue. A salary would come from founder savings or a grant, neither of which is reliable month to month. |
| Is your workload exceeding what you can manage alone, or is there a skill gap your business urgently needs? | **Yes** | Solo founder covering product, ML engineering, sales and clinical discovery simultaneously. The urgent gap is sign-language recognition engineering — the prototype is not yet reliable enough to put in front of a ward. |
| Do you have a clear idea of what the role should do and what success looks like? | **Yes** | The clinical vocabulary and the evaluation method are defined. Success is measured on held-out signing by Deaf signers the model has not seen, not on training data. |
| Have you set aside time to interview, onboard and manage a new team member properly? | **In Progress** | No protected time yet. Realistically four hours a week would need to be blocked before committing to anyone full-time. |

**Signal:** the first answer is *No*. That means build readiness before hiring a salaried person — it does not mean do nothing.

### 2. If you are not yet ready to hire, what is the one thing you need to put in place first?

> **Recurring revenue before a salary. My target is three hospitals on the Team Plan (up to 10 practitioners) at $199 per month — roughly $600 in monthly recurring revenue, held for three consecutive months. Until that exists, I hire contractors on fixed-scope, fixed-fee work rather than salaried staff, because a contractor can be scoped to a deliverable and stopped at the end of it — a salary cannot.**

---

## 02 Your Value Chain and Role Identification

### 1. Map the key activities in your business from start to finish.

> **Clinical lead identified and approached** → **ward scoped** (which conversations, which vocabulary, which staff) → **pilot agreed and staff onboarded** → **day-to-day translation in the ward** → **Deaf review of outputs and vocabulary correction** → **subscription billed** → **usage reviewed, renewal or expansion decided** → **product iterated from what the ward actually used.**

Running underneath all of it: **model training, evaluation and deployment.**

### 2. For each activity, who does it now and does it need a dedicated person?

| Activity | Who does it now | Needs a dedicated role as you grow? |
|---|---|---|
| Finding and approaching clinical leads | Founder | **Yes** — partnerships |
| Scoping a ward and its vocabulary | Founder + Deaf advisor | **Yes** — clinical implementation |
| Pilot set-up and staff onboarding | Founder | **Yes** — clinical implementation |
| Model training, evaluation, deployment | Founder | **Yes, most urgent** — ML engineering |
| Deaf review of outputs and sign variants | Ad-hoc contractor | **Yes** — Deaf ASL reviewer |
| Support during live ward use | Founder | Not yet |
| Billing and renewal | Founder | Not yet |
| Product design and front-end | Founder | Not yet |

### 3. First one to three roles your business needs, most urgent first.

| Priority | Role title | Why this role is needed now |
|---|---|---|
| **1** | **Sign-Language ML Engineer** (contract first, salaried when revenue allows) | The prototype cannot yet recognise clinical signing reliably enough to run in a ward. Until it can, there is no product to pilot and no pilot to convert. This is the constraint on everything else. |
| **2** | **Deaf ASL Clinical Reviewer** (part-time, contract) | Accuracy claims are meaningless without a Deaf signer checking them. This role also protects the company from shipping signs that misrepresent ASL — a risk that would end pilots and permanently damage trust with the community Unmute exists to serve. |
| **3** | **Clinical Partnerships Lead** (part-time or commission-based) | Removes the founder as the single point of sale, so hospital conversations continue while the product is being built rather than stopping every time engineering needs attention. |

---

## 03 Job Descriptions

### Most urgent role: Sign-Language ML Engineer *(contract, part-time, remote)*

**Role title:** Sign-Language ML Engineer

**What this person will do day to day:**

1. Train and evaluate recognition models on the locked clinical vocabulary — intake, pain, medication, consent — using **signer-independent** splits so results reflect new signers rather than memorised ones.
2. Run weekly evaluations against a held-out set recorded by Deaf signers the model has not seen, and report accuracy and failure modes honestly, including when they get worse.
3. Integrate model updates into the mobile client and keep end-to-end latency usable on a mid-range Android phone.
4. Work with the Deaf ASL reviewer to correct labels, document regional and individual sign variants, and **remove vocabulary that cannot be reliably recognised** rather than guessing at it.
5. Maintain the data pipeline: capture, de-identification, storage and versioning of signed clips.
6. Ship updates behind a feature flag with a rollback path, and maintain a plain-language limitations note for the clinical team.

**What this person needs to be able to do:**

- Python, and PyTorch or TensorFlow.
- Pose/keypoint-based recognition — MediaPipe landmarks, transformer or SPOTER-style architectures.
- Video data pipelines and experiment tracking.
- Experience with **small, domain-specific datasets**, and discipline about signer-independent evaluation.
- Working knowledge of ASL structure, or willingness to learn under the Deaf reviewer's direction.
- Advantage: on-device inference, quantisation, Android deployment.

**What success looks like in this role:**

- Recognition accuracy on held-out Deaf signers improves over the current baseline and **does not regress** between releases.
- On-device latency stays low enough for a live two-way conversation on a mid-range Android phone.
- Every vocabulary change that reaches a ward has Deaf review sign-off behind it.
- The clinical team can state plainly what the system does and does not handle.

> *Note: no accuracy target is written into this description. The baseline must be measured first (week 2 of onboarding), then the target set against it. Quoting a number before measuring would be inventing one.*

---

## 04 Key Performance Indicators

| Role | KPI 1 | KPI 2 | KPI 3 |
|---|---|---|---|
| **Sign-Language ML Engineer** | Top-1 accuracy on held-out Deaf signers, clinical vocabulary — baseline set in week 2, target agreed from it | p50 end-to-end latency on a mid-range Android phone | 100% of releases with completed Deaf review sign-off |
| **Deaf ASL Clinical Reviewer** | Clinical clips reviewed per week | % of clinical vocabulary with documented sign variants | Review turnaround within an agreed window (e.g. 5 working days) |
| **Clinical Partnerships Lead** | Qualified hospital conversations per month | Pilots converted to paid Team Plan subscriptions | Median days from first conversation to signed subscription |

**Deliberately excluded:** downloads, follower counts, demo views. None of them predict whether a ward renews.

---

## 05 How Each Role Contributes to Business Growth

| Role | How it contributes to business growth |
|---|---|
| **Sign-Language ML Engineer** | Converts the prototype into something a hospital will actually pay for. Until recognition holds up with a real Deaf patient in a real ward, there is nothing to sell and no path to recurring revenue — every other activity depends on this one. |
| **Deaf ASL Clinical Reviewer** | Determines whether the product is trusted by the community it is built for. Also prevents shipping signs that misrepresent ASL, which would end pilots and permanently damage the brand. Growth built on a product Deaf patients do not trust is not growth. |
| **Clinical Partnerships Lead** | Turns the founder from the only salesperson into one of several people who can open a hospital. Hospital conversations continue while the product is being built, so pipeline does not stall every time engineering needs attention. |

---

## 06 Where You Will Find Candidates

| Role | Hiring channel | Why this channel fits this role |
|---|---|---|
| **Sign-Language ML Engineer** | LinkedIn, Nigerian AI/ML communities, university CS departments (UNN, UI, Covenant, ABU), referrals from research groups | Small, specialised pool. Referrals filter for pose-based recognition experience far better than job boards, which mostly return generic CV work. |
| **Sign-Language ML Engineer (trial)** | Remote contractor marketplaces, scoped to a fixed paid trial | Lets you test real capability on your own clinical vocabulary before any long commitment — the only way to know with no salary risk. |
| **Deaf ASL Clinical Reviewer** | Deaf associations, ASL instructor networks, university Deaf studies and interpreting programmes, Deaf-led tech groups | This role needs a fluent Deaf signer, and credibility comes from the community rather than a job posting. Posting it as a generic "reviewer" vacancy would attract non-signers. |
| **Clinical Partnerships Lead** | Referrals from existing clinical contacts, LinkedIn, health-tech and hospital-innovation networks | Selling into a ward requires credibility with clinicians. Referrals supply that; advertising does not. |

> **Keep ASL and NSL strictly separate.** Every reviewer must be fluent in the language of the pilot. If the work expands to Nigerian Sign Language, that requires an NSL-fluent reviewer and an NSL-specific evaluation set — ASL results cannot be presented as evidence for NSL.

---

## 07 Written Agreement Essentials

| Element | Include? | Brief note on what you will specify |
|---|---|---|
| Role title and main responsibilities | **Yes** | Title plus the six duties, and an explicit line that scope may change as pilot scope changes. |
| Salary or payment terms and frequency | **Yes** | Fixed fee per milestone for contractors; invoice date, payment window (e.g. 14 days), currency and payment channel. |
| Working hours and days | **Yes** | Expected overlap hours and response time rather than a rigid 9–5 — the role is remote and part-time. |
| Performance expectations and review frequency | **Yes** | The section 04 KPIs, reviewed monthly for the first three months, then quarterly. |
| Confidentiality obligations | **Yes** | Patient data, model weights, clinical partner names, vocabulary sets, and pilot results. |
| Notice period | **Yes** | Two weeks during the trial period, 30 days afterwards. |
| Consequences for not meeting performance expectations | **Yes** | Employees: written warning and a 30-day improvement window. Contractors: milestone payment withheld and contract ended at the milestone boundary. |
| **Intellectual property assignment** *(add)* | **Yes** | All model weights, code, datasets and documentation created in the role belong to Unmute. This is the one most often forgotten, and the most expensive to fix later. |
| **Patient data handling** *(add)* | **Yes** | No patient-identifiable data leaves the agreed systems; handling consistent with the Nigeria Data Protection Act. |
| **Equipment and access** *(add)* | **Yes** | What accounts and hardware are provided, and their return at the end. |
| **Probation period** *(add, employees)* | **Yes** | Three months, with the review criteria written down rather than implied. |

---

## 08 Onboarding Plan

| Week | Key things to cover |
|---|---|
| **Week 1** | What Unmute does, why it exists, and who the customers are — hospitals and the Deaf patients in their wards. Walk the clinical scope: triage intake, routine history, pain assessment, discharge medication, ward check-ins. Set up repo and data access. Read the honest limitations document. Meet the Deaf ASL reviewer. |
| **Week 2** | Reproduce the current baseline. Run the model on the held-out clinical set, write down exactly where it fails, and agree the KPI baseline and targets from it. Shadow one hospital conversation or demo. |
| **Week 3** | Ship one scoped improvement behind a flag. Sit in on a Deaf review session and see corrections applied. Learn the labelling convention for sign variants. |
| **Week 4** | Own one full cycle end to end: evaluate → improve → Deaf review → release → report. Agree 90-day goals and the monthly review rhythm. |

---

## 09 Reflection

### 1. What is the biggest risk in your first hire, and what will you do to manage it?

> **The biggest risk is committing salary money to an engineering hire before we know whether the recognition approach works in a real ward. If it does not, the runway is gone and the product still does not work — the worst of both outcomes.**
>
> **I will manage it with a paid three-week scoped trial on our own clinical vocabulary, with one fixed deliverable and a written go/no-go decision at the end of it. I will not convert to a salaried role until that deliverable is met. As a secondary safeguard, the Deaf reviewer sits in on the trial from week one so accuracy is never judged by engineers alone.**

### 2. In two to three sentences, explain how a well-structured team will help you achieve your business goals over the next 12 months.

> **A well-structured team lets Unmute stop depending on one person for engineering, clinical credibility and sales at the same time. With an engineer owning recognition, a Deaf reviewer owning accuracy and cultural correctness, and a partnerships lead owning the hospital pipeline, the three highest-risk parts of the business progress in parallel instead of competing for my attention. That is what turns a prototype and seven payments into recurring institutional subscriptions within twelve months.**
